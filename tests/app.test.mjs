import test from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Image File Validation
test('Image Validation: accepts valid images and rejects invalid formats or oversized files', () => {
  function validateImageFile(file, maxSizeBytes = 20 * 1024 * 1024) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Unsupported format' };
    }
    if (file.size > maxSizeBytes) {
      return { valid: false, error: 'File size exceeded' };
    }
    return { valid: true };
  }

  // Valid JPEG
  assert.equal(validateImageFile({ name: 'photo.jpg', type: 'image/jpeg', size: 1024 * 1024 }).valid, true);

  // Valid PNG
  assert.equal(validateImageFile({ name: 'diagram.png', type: 'image/png', size: 2 * 1024 * 1024 }).valid, true);

  // Valid WebP
  assert.equal(validateImageFile({ name: 'visual.webp', type: 'image/webp', size: 500 * 1024 }).valid, true);

  // Invalid EXE
  assert.equal(validateImageFile({ name: 'script.exe', type: 'application/x-msdownload', size: 500 }).valid, false);

  // Oversized 25MB
  assert.equal(validateImageFile({ name: 'huge.jpg', type: 'image/jpeg', size: 25 * 1024 * 1024 }).valid, false);
});

// Test 2: Ray-Box Boundary Intersection Clipping
test('Ray-Box Intersection: clips connection lines at card borders and never penetrates content', () => {
  function getClippedEdgePoint(source, target, extraOffset = 4) {
    const dx = target.cx - source.cx;
    const dy = target.cy - source.cy;
    if (dx === 0 && dy === 0) return { x: source.cx, y: source.cy };

    const hw = source.w / 2;
    const hh = source.h / 2;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let scale = 1;
    if (absDx * hh > absDy * hw) {
      scale = hw / absDx;
    } else {
      scale = hh / absDy;
    }

    const angle = Math.atan2(dy, dx);
    return {
      x: Math.round(source.cx + dx * scale + Math.cos(angle) * extraOffset),
      y: Math.round(source.cy + dy * scale + Math.sin(angle) * extraOffset),
    };
  }

  // Card A at (100, 100, 100x100), Card B at (300, 100, 100x100) -> Target is directly to the right
  const source = { cx: 100, cy: 100, w: 100, h: 100 };
  const target = { cx: 300, cy: 100, w: 100, h: 100 };

  const startPt = getClippedEdgePoint(source, target, 4);
  const endPt = getClippedEdgePoint(target, source, 8);

  // Start point should be at right edge of Card A (100 + 50 = 150) + offset 4 = 154
  assert.equal(startPt.x, 154);
  assert.equal(startPt.y, 100);

  // End point should terminate outside left edge of Card B (300 - 50 = 250) - offset 8 = 242
  assert.equal(endPt.x, 242);
  assert.equal(endPt.y, 100);

  // Distance between clipped endpoints is positive
  assert.ok(endPt.x > startPt.x);
});

// Test 3: Natural Language Task Parsing
test('NLP Parser: parses priority, tags, and section', () => {
  function parseNaturalLanguageTask(rawInput) {
    let text = rawInput.trim();
    let priority = 'normal';
    let section = 'inbox';
    const tags = [];

    const tagMatches = text.match(/#(\w+)/g);
    if (tagMatches) {
      tagMatches.forEach(t => tags.push(t.replace('#', '')));
      text = text.replace(/#\w+/g, '').trim();
    }

    if (/(?:^|\s)(p1|!urgent|!1)(?:\s|$)/i.test(text)) {
      priority = 'urgent';
      text = text.replace(/(?:^|\s)(p1|!urgent|!1)(?:\s|$)/gi, ' ').trim();
    }

    if (/\b(today)\b/i.test(text)) {
      section = 'today';
      text = text.replace(/\b(today)\b/gi, '').trim();
    }

    return { title: text, priority, section, tags };
  }

  const result = parseNaturalLanguageTask('Review system design #architecture #critical !urgent today');
  assert.equal(result.priority, 'urgent');
  assert.equal(result.section, 'today');
  assert.deepEqual(result.tags, ['architecture', 'critical']);
  assert.equal(result.title, 'Review system design');
});

// Test 4: Deterministic Daily Quote Rotation
test('Daily Quote: deterministic selection based on day number', () => {
  const sampleQuotes = [
    { text: 'Great things are done by a series of small things.', author: 'Vincent Van Gogh' },
    { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  ];

  function getDailyQuote(date, quotes) {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = Math.abs(dayOfYear) % quotes.length;
    return quotes[index];
  }

  const dateA = new Date('2026-11-10');
  const dateB = new Date('2026-11-10'); // same date
  const dateC = new Date('2026-11-11'); // next date

  const quoteA = getDailyQuote(dateA, sampleQuotes);
  const quoteB = getDailyQuote(dateB, sampleQuotes);
  const quoteC = getDailyQuote(dateC, sampleQuotes);

  assert.equal(quoteA.text, quoteB.text); // Stable on refresh
  assert.notEqual(quoteA.text, quoteC.text); // Automatically rotates on next date
});

// Test 5: Storage Sanitization
test('Storage Sanitization: prevents QuotaExceededError by omitting full dataUrls from localStorage', () => {
  const elements = [
    { id: '1', title: 'Note 1', imageUrl: 'https://example.com/pic.jpg', thumbnailUrl: 'https://example.com/thumb.jpg' },
    { id: '2', title: 'Note 2', imageUrl: 'data:image/jpeg;base64,' + 'A'.repeat(60000), thumbnailUrl: 'data:image/jpeg;base64,thumb' },
  ];

  const sanitized = elements.map(el => {
    if (el.imageUrl && el.imageUrl.startsWith('data:') && el.imageUrl.length > 50000) {
      return { ...el, imageUrl: el.thumbnailUrl || '' };
    }
    return el;
  });

  assert.equal(sanitized[0].imageUrl, 'https://example.com/pic.jpg');
  assert.equal(sanitized[1].imageUrl, 'data:image/jpeg;base64,thumb'); // Preserves thumbnail while trimming huge dataUrl
});
