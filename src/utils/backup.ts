import type { Task, Area, Project, CanvasElement, CanvasConnection } from '../types';
import { getImageFromStorage, saveImageToStorage } from './imageStorage';

export interface Workspace {
  tasks: Task[];
  areas: Area[];
  projects: Project[];
  canvasElements: CanvasElement[];
  canvasConnections: CanvasConnection[];
}
export interface WorkspaceBackup extends Workspace {
  format: 'omnisticky-workspace';
  version: 1;
  exportedAt: string;
}
export function downloadFile(content: string, filename: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadRecoveryData() {
  const saved: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (key.startsWith('omnisticky_')) saved[key] = localStorage.getItem(key)!;
  }
  downloadFile(JSON.stringify({ format: 'omnisticky-recovery', saved }, null, 2), 'omnisticky-recovery.json');
}
function asDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('An image could not be backed up. Please try again.'));
    reader.readAsDataURL(blob);
  });
}
export async function createBackup(workspace: Workspace): Promise<WorkspaceBackup> {
  const canvasElements = await Promise.all(workspace.canvasElements.map(async element => {
    if (!element.imageStorageId) return { ...element };
    const url = await getImageFromStorage(element.imageStorageId);
    if (!url) throw new Error(`The original photo “${element.title}” is missing from this device. Remove or replace it before making a complete backup.`);
    const blob = await (await fetch(url)).blob();
    const { imageStorageId: _id, ...rest } = element;
    return { ...rest, imageUrl: await asDataUrl(blob) };
  }));
  return { ...workspace, canvasElements, tasks: workspace.tasks.map(t => ({ ...t, isTimerRunning: false })), format: 'omnisticky-workspace', version: 1, exportedAt: new Date().toISOString() };
}

const sections = ['inbox', 'today', 'upcoming', 'anytime', 'someday', 'logbook'];
const statuses = ['todo', 'in_progress', 'done'];
const priorities = ['urgent', 'high', 'normal', 'low'];
function text(value: unknown): value is string { return typeof value === 'string'; }
function optionalText(value: unknown) { return value === undefined || text(value); }
function date(value: unknown) { return value === undefined || (text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T00:00:00`).getTime())); }
function optionalNumber(value: unknown) { return value === undefined || (typeof value === 'number' && Number.isFinite(value)); }
function array(value: unknown): value is any[] { return Array.isArray(value) && value.length <= 50000; }
function collection(value: unknown, valid: (item: any) => boolean): boolean {
  if (!array(value)) return false;
  const ids = new Set();
  return value.every(item => {
    if (!item || typeof item !== 'object' || !text(item.id) || !item.id || ids.has(item.id) || !valid(item)) return false;
    ids.add(item.id);
    return true;
  });
}
function safeImage(value: unknown) {
  return value === undefined || (text(value) && (value === '' || /^https?:\/\//i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)));
}
export function parseBackup(raw: string): Workspace {
  let data: any;
  try { data = JSON.parse(raw); } catch { throw new Error('This file is not valid JSON. Select an Omni Sticky JSON backup.'); }
  const legacy = Array.isArray(data);
  if (legacy) data = { tasks: data, areas: [], projects: [], canvasElements: [], canvasConnections: [] };
  else if (data?.format !== 'omnisticky-workspace' || data.version !== 1) throw new Error('This backup format or version is not supported.');
  const validTasks = collection(data.tasks, t => text(t.title) && optionalText(t.notes) && sections.includes(t.section) && statuses.includes(t.status) && priorities.includes(t.priority)
    && array(t.tags) && t.tags.every(text) && collection(t.checklists, c => text(c.text) && typeof c.completed === 'boolean')
    && Number.isFinite(t.timeSpentSeconds) && t.timeSpentSeconds >= 0 && date(t.dueDate) && optionalText(t.projectId) && optionalText(t.areaId)
    && optionalText(t.colorHex) && optionalText(t.paperColor) && optionalText(t.contextUrl) && optionalText(t.completedAt)
    && optionalText(t.createdAt) && optionalText(t.updatedAt));
  if (!validTasks || !collection(data.areas, a => text(a.name) && text(a.emoji) && text(a.colorHex))
    || !collection(data.projects, p => text(p.title) && text(p.colorHex) && optionalText(p.description) && optionalText(p.areaId) && date(p.dueDate))
    || !collection(data.canvasElements, e => ['sticky', 'hub', 'photo', 'shape'].includes(e.type) && text(e.title) && text(e.colorHex)
      && Number.isFinite(e.x) && Number.isFinite(e.y) && Number.isFinite(e.rotation) && safeImage(e.imageUrl) && safeImage(e.thumbnailUrl)
      && e.imageStorageId === undefined && optionalText(e.caption) && optionalText(e.category)
      && optionalNumber(e.width) && optionalNumber(e.height) && optionalNumber(e.aspectRatio)
      && (e.tags === undefined || (array(e.tags) && e.tags.every(text))))
    || !collection(data.canvasConnections, c => text(c.fromId) && text(c.toId) && ['curved', 'straight', 'dashed'].includes(c.style))) {
    throw new Error('The backup contains invalid or incomplete records. Your workspace has not been changed.');
  }
  const ids = new Set(data.canvasElements.map((e: CanvasElement) => e.id));
  if (data.canvasConnections.some((c: CanvasConnection) => !ids.has(c.fromId) || !ids.has(c.toId))) throw new Error('A canvas connection points to a missing element. Your workspace has not been changed.');
  return {
    tasks: data.tasks.map((t: Task) => ({ ...t, isTimerRunning: false, createdAt: t.createdAt || new Date().toISOString(), updatedAt: t.updatedAt || new Date().toISOString() })),
    areas: data.areas, projects: data.projects, canvasElements: data.canvasElements, canvasConnections: data.canvasConnections,
  };
}
// Hydrate portable photos before touching any live workspace collections.
export async function prepareRestore(workspace: Workspace): Promise<Workspace> {
  const canvasElements = [];
  for (const element of workspace.canvasElements) {
    if (element.type === 'photo' && element.imageUrl?.startsWith('data:')) {
      const blob = await (await fetch(element.imageUrl)).blob();
      const result = await saveImageToStorage(new File([blob], `${element.id}.jpg`, { type: blob.type }));
      canvasElements.push({ ...element, imageStorageId: result.id, imageUrl: result.objectUrl, thumbnailUrl: result.thumbnailUrl });
    } else canvasElements.push(element);
  }
  return { ...workspace, canvasElements };
}
