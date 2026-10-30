import { Priority, ThingsSection } from '../types';

export interface ParsedTaskInput {
  title: string;
  dueDate?: string;
  isThisEvening?: boolean;
  priority: Priority;
  tags: string[];
  section: ThingsSection;
}

export function parseNaturalLanguageTask(rawInput: string): ParsedTaskInput {
  let text = rawInput.trim();
  let priority: Priority = 'normal';
  let dueDate: string | undefined = undefined;
  let isThisEvening = false;
  let section: ThingsSection = 'inbox';
  const tags: string[] = [];

  // 1. Extract Tags (#tag)
  const tagMatches = text.match(/#(\w+)/g);
  if (tagMatches) {
    tagMatches.forEach(t => {
      tags.push(t.replace('#', ''));
    });
    text = text.replace(/#\w+/g, '').trim();
  }

  // 2. Extract Priority (p1, p2, p3, p4 or !urgent, !high)
  if (/\b(p1|!urgent|!1)\b/i.test(text)) {
    priority = 'urgent';
    text = text.replace(/\b(p1|!urgent|!1)\b/gi, '').trim();
  } else if (/\b(p2|!high|!2)\b/i.test(text)) {
    priority = 'high';
    text = text.replace(/\b(p2|!high|!2)\b/gi, '').trim();
  } else if (/\b(p3|!normal|!3)\b/i.test(text)) {
    priority = 'normal';
    text = text.replace(/\b(p3|!normal|!3)\b/gi, '').trim();
  } else if (/\b(p4|!low|!4)\b/i.test(text)) {
    priority = 'low';
    text = text.replace(/\b(p4|!low|!4)\b/gi, '').trim();
  }

  // 3. Extract Things 3 "This Evening" flag
  if (/\b(this evening|tonight)\b/i.test(text)) {
    isThisEvening = true;
    section = 'today';
    dueDate = new Date().toISOString().split('T')[0];
    text = text.replace(/\b(this evening|tonight)\b/gi, '').trim();
  }

  // 4. Extract Due Dates (today, tomorrow, monday..sunday, or in X days)
  const today = new Date();
  if (/\btoday\b/i.test(text)) {
    dueDate = today.toISOString().split('T')[0];
    section = 'today';
    text = text.replace(/\btoday\b/gi, '').trim();
  } else if (/\btomorrow\b/i.test(text)) {
    const tomorrow = new Date(today.getTime() + 86400000);
    dueDate = tomorrow.toISOString().split('T')[0];
    section = 'upcoming';
    text = text.replace(/\btomorrow\b/gi, '').trim();
  } else {
    // Check "in X days"
    const inDaysMatch = text.match(/\bin (\d+) days?\b/i);
    if (inDaysMatch) {
      const days = parseInt(inDaysMatch[1], 10);
      const future = new Date(today.getTime() + days * 86400000);
      dueDate = future.toISOString().split('T')[0];
      section = 'upcoming';
      text = text.replace(inDaysMatch[0], '').trim();
    }
  }

  // Default section assignment: if due today -> today, if due date in future -> upcoming
  if (dueDate && !isThisEvening) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dueDate === todayStr) {
      section = 'today';
    } else {
      section = 'upcoming';
    }
  }

  return {
    title: text || rawInput,
    dueDate,
    isThisEvening,
    priority,
    tags,
    section,
  };
}

