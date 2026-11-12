import test from 'node:test';
import assert from 'node:assert/strict';

// Helper simulating relationship extraction from real task & project database
function extractGraphEntities(tasks, projects) {
  const nodes = [];
  const edges = [];
  const userRootId = 'user-root';

  nodes.push({ id: userRootId, title: 'Knovera Workspace', type: 'user' });

  const projectMap = new Map();
  projects.forEach(p => {
    projectMap.set(p.id, p);
    nodes.push({ id: p.id, title: p.title, type: 'project' });
    edges.push({
      id: `edge-${userRootId}-${p.id}`,
      source: userRootId,
      target: p.id,
      type: 'user_project',
    });
  });

  tasks.forEach(t => {
    nodes.push({
      id: t.id,
      title: t.title,
      type: 'task',
      status: t.status,
      projectId: t.projectId,
    });

    if (t.projectId && projectMap.has(t.projectId)) {
      edges.push({
        id: `edge-${t.projectId}-${t.id}`,
        source: t.projectId,
        target: t.id,
        type: 'project_task',
      });
    } else {
      edges.push({
        id: `edge-${userRootId}-${t.id}`,
        source: userRootId,
        target: t.id,
        type: 'user_project',
      });
    }

    if (t.notes && t.notes.trim().length > 0) {
      const noteId = `note-${t.id}`;
      nodes.push({ id: noteId, title: `${t.title} Notes`, type: 'note' });
      edges.push({
        id: `edge-${t.id}-${noteId}`,
        source: t.id,
        target: noteId,
        type: 'task_note',
      });
    }
  });

  return { nodes, edges };
}

// Focus neighbors resolution helper
function getFocusNeighbors(selectedNodeId, edges, showSecondDegree = false) {
  if (!selectedNodeId) return new Set();

  const firstDegree = new Set([selectedNodeId]);
  edges.forEach(e => {
    if (e.source === selectedNodeId) firstDegree.add(e.target);
    else if (e.target === selectedNodeId) firstDegree.add(e.source);
  });

  if (showSecondDegree) {
    edges.forEach(e => {
      if (firstDegree.has(e.source) || firstDegree.has(e.target)) {
        firstDegree.add(e.source);
        firstDegree.add(e.target);
      }
    });
  }

  return firstDegree;
}

test('Network Graph: extracts strictly authentic database relationships without inventing links', () => {
  const projects = [
    { id: 'p1', title: 'Q4 Product Launch', colorHex: '#10B981' },
    { id: 'p2', title: 'Personal Brand', colorHex: '#3B82F6' },
  ];

  const tasks = [
    { id: 't1', title: 'Build Landing Page', projectId: 'p1', status: 'in_progress', notes: 'Include demo video' },
    { id: 't2', title: 'Write Q4 Summary', projectId: 'p1', status: 'todo' },
    { id: 't3', title: 'Independent Reflection', status: 'todo' }, // No project
  ];

  const { nodes, edges } = extractGraphEntities(tasks, projects);

  // Expected Nodes: 1 User + 2 Projects + 3 Tasks + 1 Note (from t1) = 7
  assert.equal(nodes.length, 7);

  // Expected Edges:
  // User -> p1 (user_project)
  // User -> p2 (user_project)
  // p1 -> t1 (project_task)
  // p1 -> t2 (project_task)
  // User -> t3 (user_project for orphan task)
  // t1 -> note-t1 (task_note)
  // Total = 6
  assert.equal(edges.length, 6);

  // Verify no fabricated edge between t2 and t3
  const fakeEdge = edges.find(e => (e.source === 't2' && e.target === 't3') || (e.source === 't3' && e.target === 't2'));
  assert.equal(fakeEdge, undefined);

  // Verify t1 connects to note-t1
  const noteEdge = edges.find(e => e.source === 't1' && e.target === 'note-t1');
  assert.ok(noteEdge);
  assert.equal(noteEdge.type, 'task_note');
});

test('Network Graph: Focus Mode correctly isolates direct and 2nd-degree neighbors', () => {
  const edges = [
    { source: 'proj-1', target: 'task-1' },
    { source: 'task-1', target: 'note-1' },
    { source: 'proj-1', target: 'task-2' },
    { source: 'unrelated-proj', target: 'unrelated-task' },
  ];

  // Selecting task-1 in 1st degree should find: task-1, proj-1, note-1
  const firstNeighbors = getFocusNeighbors('task-1', edges, false);
  assert.equal(firstNeighbors.has('task-1'), true);
  assert.equal(firstNeighbors.has('proj-1'), true);
  assert.equal(firstNeighbors.has('note-1'), true);
  assert.equal(firstNeighbors.has('unrelated-task'), false);

  // 2nd degree from task-1 should reach task-2 (via proj-1)
  const secondNeighbors = getFocusNeighbors('task-1', edges, true);
  assert.equal(secondNeighbors.has('task-2'), true);
  assert.equal(secondNeighbors.has('unrelated-task'), false);
});

test('Network Graph: search accurately matches titles and #tags and ignores non-matches', () => {
  const nodes = [
    { id: '1', title: 'Research LLM evaluation methods', tags: ['Research', 'AI'] },
    { id: '2', title: 'Prepare corporate presentation', tags: ['Work'] },
    { id: '3', title: 'Weekly grocery run', tags: ['Health'] },
  ];

  const query = 'LLM';
  const matches = nodes.filter(n => 
    n.title.toLowerCase().includes(query.toLowerCase()) || 
    n.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, '1');

  // Tag search
  const tagQuery = 'ai';
  const tagMatches = nodes.filter(n => 
    n.title.toLowerCase().includes(tagQuery.toLowerCase()) || 
    n.tags.some(t => t.toLowerCase().includes(tagQuery.toLowerCase()))
  );
  assert.equal(tagMatches.length, 1);
  assert.equal(tagMatches[0].id, '1');
});
