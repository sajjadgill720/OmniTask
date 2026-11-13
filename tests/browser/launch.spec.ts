import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('first visit explains local storage; mobile landing fits the viewport', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Clear your head/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/landing-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByRole('button', { name: 'Start your workspace' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/landing-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Start your workspace' }).click();
  await expect(page.getByRole('heading', { name: /Clear your head/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/workspace-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('create, edit, complete, delete, and reload an empty workspace', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Start your workspace' }).click();
  await page.getByRole('button', { name: 'Dismiss getting started tip' }).click();
  await page.keyboard.press('n');
  const input = page.getByPlaceholder(/e.g. Call designer/);
  await input.fill('Launch regression note today p1 #test');
  await input.press('Enter');
  await expect(page.getByText('Launch regression note', { exact: true }).first()).toBeVisible();
  await page.getByText('Launch regression note', { exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'TaskDetail', exact: true })).toBeVisible();
  await page.getByTitle('Click to edit title').click();
  await page.getByRole('textbox', { name: 'Note title' }).fill('Launch regression note edited');
  await page.getByRole('textbox', { name: 'Note title' }).press('Enter');
  await page.getByTitle('Click to cycle stage (To Do -> In Progress -> Done)').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.getByText('Launch regression note edited', { exact: true }).first()).toBeVisible();
  await page.getByText('Launch regression note edited', { exact: true }).first().click();
  await page.getByTitle('Click to cycle stage (To Do -> In Progress -> Done)').click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('omnisticky_workspace_v1')!));
  expect(data.tasks[0].status).toBe('done');
  expect(data.tasks[0].completedAt).toBeTruthy();
  await page.getByText('Launch regression note edited', { exact: true }).first().click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByTitle('Discard sticky note').click();
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.getByText('Launch regression note edited', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('omnisticky_workspace_v1')!).tasks)).toEqual([]);
  expect(errors).toEqual([]);
});

test('settings and projects reopen without hook failures', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Start your workspace' }).click();
  for (let i = 0; i < 2; i++) {
    await page.getByTitle('Settings and backups').click();
    await expect(page.getByRole('dialog', { name: 'Settings', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Data & backups', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Download complete backup' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByTitle('Notifications', { exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Permissions', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  }
  await page.screenshot({ path: 'test-results/workspace-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('offline shell reopens after a successful online visit', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Clear your head/ })).toBeVisible();
  await page.goto('/help.html');
  await expect(page.getByRole('heading', { name: 'A little space to get started.' })).toBeVisible();
});

test('all projects are real, standalone projects remain visible, and editing updates the existing project', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Start your workspace' }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.getByText('Room for your first project')).toBeVisible();
  for (let i = 1; i <= 4; i++) {
    await page.getByRole('main').getByRole('button', { name: 'New Project', exact: true }).click();
    await page.getByLabel('Project Title', { exact: true }).fill(`Real project ${i}`);
    await page.getByRole('button', { name: 'Create Project', exact: true }).click();
    await page.getByRole('button', { name: 'Back to Projects' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Real project 4', exact: true })).toBeVisible();
  await page.getByRole('heading', { name: 'Real project 4', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Project', exact: true }).click();
  await page.getByLabel('Project Title', { exact: true }).fill('Renamed project');
  await page.getByRole('button', { name: 'Save Project', exact: true }).click();
  await page.waitForTimeout(350);
  const projects = await page.evaluate(() => JSON.parse(localStorage.getItem('omnisticky_workspace_v1')!).projects);
  expect(projects.length).toBe(4);
  expect(projects.some((p: any) => p.title === 'Renamed project')).toBe(true);
  await page.reload();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Renamed project', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('complete backups contain canvas photos and restore across a fresh browser profile', async ({ page, browser }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start your workspace' }).click();
  await page.getByRole('button', { name: 'Canvas Wall', exact: true }).click();
  await page.getByTitle('Add Sticky Note', { exact: true }).click();
  await page.locator('input[type=file]').setInputFiles('public/icon-512.png');
  await expect(page.getByText('Added 1 photograph to Canvas!', { exact: true })).toBeVisible();
  await page.getByTitle('Settings and backups').click();
  await page.getByRole('button', { name: 'Data & backups', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download complete backup' }).click();
  const file = await downloaded;
  const data = JSON.parse(await readFile((await file.path())!, 'utf8'));
  expect(data.canvasElements).toHaveLength(2);
  expect(data.canvasElements.find((e: any) => e.type === 'photo').imageUrl).toMatch(/^data:image/);
  expect(data.canvasElements.find((e: any) => e.type === 'photo').imageStorageId).toBeUndefined();
  const context = await browser.newContext();
  const fresh = await context.newPage();
  await fresh.goto('/');
  await fresh.getByRole('button', { name: 'Start your workspace' }).click();
  await fresh.getByTitle('Settings and backups').click();
  await fresh.getByRole('button', { name: 'Data & backups', exact: true }).click();
  const emptyBackup = fresh.waitForEvent('download');
  await fresh.getByRole('button', { name: 'Download complete backup' }).click();
  await emptyBackup;
  await fresh.getByLabel('Choose JSON backup').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await fresh.getByRole('button', { name: 'Replace workspace' }).click();
  await expect(fresh.getByRole('status').filter({ hasText: 'Workspace restored.' })).toBeVisible();
  await fresh.keyboard.press('Escape');
  await fresh.getByRole('button', { name: 'Canvas Wall', exact: true }).click();
  await fresh.reload();
  const photo = fresh.locator('[data-canvas-node-id] img');
  await expect(photo).toHaveCount(1);
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(512);
  await expect(photo).toHaveAttribute('src', /^blob:/);
  await context.close();
});

test('corrupt saved data survives startup and users see a recovery warning', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('test-seeded')) {
      localStorage.setItem('omnisticky_workspace_v1', '{damaged');
      localStorage.setItem('omnisticky_started', 'true');
      localStorage.setItem('test-seeded', 'yes');
    }
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('original copy has been preserved');
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => localStorage.getItem('omnisticky_workspace_v1'))).toBe('{damaged');
});

test('another tab pauses saving instead of silently overwriting newer work', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start your workspace' }).click();
  await page.waitForTimeout(350);
  const second = await context.newPage();
  await second.goto('/');
  await second.evaluate(() => {
    const workspace = JSON.parse(localStorage.getItem('omnisticky_workspace_v1')!);
    workspace.projects = [{ id: 'from-another-tab', title: 'External change', colorHex: '#ffffff' }];
    localStorage.setItem('omnisticky_workspace_v1', JSON.stringify(workspace));
  });
  await expect(page.getByRole('alert')).toContainText('changed in another tab');
});

test('focus timer handles elapsed wall time and records exactly one completed session', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Explore sample notes' }).click();
  await page.getByRole('button', { name: 'Focus Room', exact: true }).click();
  await expect(page.getByTitle('Start focus timer', { exact: true })).toBeVisible();
  await page.clock.install();
  await page.getByTitle('Start focus timer', { exact: true }).click();
  await page.clock.fastForward(25 * 60 * 1000 + 1000);
  await expect(page.getByText('Break Time', { exact: true })).toBeVisible();
  await expect(page.getByText('1 / 4', { exact: true })).toBeVisible();
  await page.clock.fastForward(1000);
  const tasks = await page.evaluate(() => JSON.parse(localStorage.getItem('omnisticky_workspace_v1')!).tasks);
  expect(tasks.reduce((sum: number, t: any) => sum + t.timeSpentSeconds, 0)).toBe(1500);
  expect(errors).toEqual([]);
});

test('mobile dialogs scroll, close with Escape, and keep keyboard focus contained', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start your workspace' }).click();
  await page.getByTitle('Notifications', { exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Permissions', exact: true });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  }
  await page.screenshot({ path: 'test-results/permissions-mobile.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.keyboard.press('n');
  const quick = page.getByRole('dialog', { name: 'Quick capture', exact: true });
  await expect(quick).toBeVisible();
  await page.getByRole('textbox', { name: 'New note' }).fill('Mobile capture');
  await page.getByRole('textbox', { name: 'New note' }).press('Enter');
  await expect(page.getByText('Mobile capture', { exact: true }).first()).toBeVisible();
});
