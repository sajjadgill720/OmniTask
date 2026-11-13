import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
let sequence = 0;
async function source(name) {
  const result = await build({ entryPoints: [`src/utils/${name}.ts`], bundle: true, write: false, platform: 'node', format: 'esm' });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text + `\n// test-${sequence++}`).toString('base64')}`);
}
function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  return values;
}
const task = { id: 'note1', title: 'A real note', notes: 'Details', checklists: [], tags: ['work'], section: 'today', priority: 'normal', status: 'todo', timeSpentSeconds: 20, isTimerRunning: false, createdAt: '2026-11-14T10:00:00Z', updatedAt: '2026-11-14T10:00:00Z' };
const empty = () => ({ tasks: [], areas: [], projects: [], canvasElements: [], canvasConnections: [] });

test('empty saved collections stay empty; new visitors get no sample notes or projects', async () => {
  storage({ omnisticky_tasks_v2: '[]', omnisticky_areas_v2: '[]', omnisticky_projects_v2: '[]', omnisticky_canvas_elements_v1: '[]' });
  const api = await source('storage');
  assert.deepEqual(api.loadStoredTasks(), []);
  assert.deepEqual(api.loadStoredAreas(), []);
  assert.deepEqual(api.loadStoredProjects(), []);
  assert.deepEqual(api.loadStoredCanvasElements(), []);
  storage();
  assert.deepEqual(api.loadStoredTasks(), []);
  assert.deepEqual(api.loadStoredProjects(), []);
});
test('legacy notes are migrated without injecting reference notes; reloading pauses timers', async () => {
  storage({ omnisticky_tasks_v2: JSON.stringify([{ ...task, isTimerRunning: true }]) });
  const api = await source('storage');
  const tasks = api.loadStoredTasks();
  assert.equal(tasks.length, 1); assert.equal(tasks[0].id, task.id); assert.equal(tasks[0].isTimerRunning, false);
});
test('workspace saves commit related collections together and keep photo references portable', async () => {
  const values = storage(); const api = await source('storage');
  const workspace = { ...empty(), tasks: [task], projects: [{ id: 'p', title: 'Launch', colorHex: '#ffffff' }], canvasElements: [{ id: 'photo', imageStorageId: 'original', imageUrl: 'blob:temporary', thumbnailUrl: 'data:image/jpeg;base64,thumb' }] };
  assert.equal(api.saveStoredWorkspace(workspace), true);
  const saved = JSON.parse(values.get(api.WORKSPACE_STORAGE_KEY));
  assert.equal(saved.projects[0].title, 'Launch'); assert.equal(saved.canvasElements[0].imageUrl, 'data:image/jpeg;base64,thumb');
  assert.equal(api.loadStoredTasks()[0].title, 'A real note');
});
test('unreadable legacy data is preserved and blocks a destructive migration', async () => {
  const values = storage({ omnisticky_tasks_v2: '{broken' }); const api = await source('storage');
  assert.deepEqual(api.loadStoredTasks(), []);
  assert.equal(api.saveStoredWorkspace(empty()), false);
  assert.equal(values.get('omnisticky_tasks_v2'), '{broken');
});
test('unreadable canonical data is preserved', async () => {
  const values = storage({ omnisticky_workspace_v1: '{broken' }); const api = await source('storage');
  assert.deepEqual(api.loadStoredTasks(), []);
  assert.equal(api.saveStoredWorkspace(empty()), false);
  assert.equal(values.get(api.WORKSPACE_STORAGE_KEY), '{broken');
});
test('blocked and full storage do not crash reads, and saving reports failure', async () => {
  globalThis.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
  const api = await source('storage');
  assert.deepEqual(api.loadStoredTasks(), []); assert.equal(api.saveStoredWorkspace(empty()), false);
});
test('complete backups round-trip notes, projects, groups, and empty canvas arrays', async () => {
  const api = await source('backup');
  const workspace = { ...empty(), tasks: [task], areas: [{ id: 'a', name: 'Work', emoji: 'W', colorHex: '#ffffff' }], projects: [{ id: 'p', title: 'Launch', colorHex: '#ffffff', areaId: 'a' }] };
  const backup = await api.createBackup(workspace);
  assert.deepEqual(api.parseBackup(JSON.stringify(backup)), workspace);
  assert.deepEqual(api.parseBackup(JSON.stringify([task])).tasks, [task]);
});
test('invalid backups, duplicate IDs, bad records, and dangling connections are rejected before replacing data', async () => {
  const api = await source('backup');
  const backup = await api.createBackup({ ...empty(), tasks: [task] });
  for (const invalid of ['not json', JSON.stringify({ ...backup, version: 2 }), JSON.stringify({ ...backup, tasks: [task, task] }), JSON.stringify({ ...backup, tasks: [{ ...task, tags: 'not an array' }] }), JSON.stringify({ ...backup, canvasConnections: [{ id: 'c', fromId: 'missing', toId: 'missing2', style: 'curved' }] })]) {
    assert.throws(() => api.parseBackup(invalid));
  }
});
test('import rejects nonportable photos and dangerous image URLs', async () => {
  const api = await source('backup'); const backup = await api.createBackup(empty());
  const photo = { id: 'photo', type: 'photo', title: 'Photo', x: 10, y: 10, rotation: 0, colorHex: '#fff' };
  for (const data of [{ ...photo, imageStorageId: 'device-only' }, { ...photo, imageUrl: 'javascript:alert(1)' }, { ...photo, imageUrl: 'blob:expired' }]) {
    assert.throws(() => api.parseBackup(JSON.stringify({ ...backup, canvasElements: [data] })));
  }
});
test('quick capture parses real priorities, tags, and local calendar dates', async () => {
  const { parseNaturalLanguageTask } = await source('nlpParser');
  const { localDateString } = await source('dates');
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const parsed = parseNaturalLanguageTask('Review draft tomorrow p1 #work');
  assert.equal(parsed.title, 'Review draft'); assert.equal(parsed.priority, 'urgent'); assert.deepEqual(parsed.tags, ['work']);
  assert.equal(parsed.dueDate, localDateString(tomorrow)); assert.equal(parsed.section, 'upcoming');
  assert.equal(localDateString(new Date(2026, 10, 14, 0, 5)), '2026-11-14');
});
