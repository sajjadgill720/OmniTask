# Omni Sticky

A free beta for personal sticky notes, visual planning, projects, and focus. Built with React, TypeScript, Vite, and an optional Electron Windows shell.

## Run locally

Use Node.js 22 or newer and npm.

```powershell
npm ci
npm run dev
```

Open the Local URL printed by Vite. For the Windows development shell, use `npm run dev:desktop`.

## Build and check

```powershell
npm run build
npm test
npm run test:browser
```

The production website is in `dist/`. Browser tests use installed Google Chrome on Windows by default; set `CHROME_PATH` to another compatible Chromium executable when needed. They run against a separate preview on port 4185 using isolated browser profiles.

## What this beta does

- First-run introduction, an empty workspace, or optional sample notes.
- Personal task board, workflow lists, project groups, and editable projects.
- Note details, checklists, tags, colors, priorities, local due dates, and task stopwatches.
- Separate visual canvas with notes, photo upload, connections, and session undo/redo.
- Focus Room with a 25-minute session, breaks, optional synthesized soundscapes, and recorded focus time.
- Widgets, a desk clock, local productivity summaries, light/dark appearance, and command search.
- Complete JSON backup/restore, readable Markdown notes export, and storage/recovery warnings.
- Installable web manifest and offline app shell after a successful first online visit/cache setup on HTTPS or localhost.

Quick capture recognizes `today`, `tomorrow`, `this evening`, `in 3 days`, `p1`–`p4`, and `#tags`. It does not parse weekday names or clock times. `Ctrl+K` / `⌘K` opens search, `N` opens capture outside text fields, and Escape closes dialogs.

## Data and limitations

Workspace contents are local to one browser profile and origin. There is no cloud sync, account system, collaboration, payment processing, or scheduled reminder service. Browser and Windows app data are separate. Use complete JSON backups to transfer work.

Text and canvas metadata are committed together in `omnisticky_workspace_v1` in localStorage; uploaded photos use IndexedDB. Existing collection keys are read for migration and preserved. Empty collections stay empty. Unreadable stored records are preserved, and saving is blocked rather than replacing them. A change from another tab pauses saving in the current tab; use one tab at a time.

Backups include notes, groups, projects, canvas items, connections, and uploaded photos. Device appearance preferences are not included. Restore validates the file, requires downloading the current backup, prepares photos, then replaces the workspace. Legacy task-array JSON files restore notes only. Import is limited to 100 MB. Recovery files are raw text storage copies and do not contain the separately stored photo blobs.

Clearing site data deletes work. Browser persistence permission reduces automatic eviction; it cannot prevent manual deletion. Data and exported files are not encrypted by the app. Task stopwatches pause on reload. Focus Room timers end when that view is left; widget timers pause when closed. The app is not a guaranteed background alarm. Canvas touch interactions are limited; larger screens are recommended.

## Website deployment

Deploy the **contents of `dist/`** at the root of an HTTPS static website. Do not deploy the source workspace, `node_modules`, or desktop installer folders. Use a permanent domain before inviting users because changing the origin creates a separate local workspace.

`public/_headers` supplies security headers for static hosts supporting that convention. On other hosts, configure equivalent headers. HTML and `sw.js` must be revalidated rather than cached indefinitely. Keep the manifest, icons, help/privacy pages, JavaScript chunks, and service worker together. Offline updates activate after existing app tabs close.

The help page includes a local feedback draft and directs testers back to the place where they received the launch link. Configure a real support route before a broad public announcement. No telemetry is included.

See [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) for the remaining owner actions and release verification.

## Windows installer

```powershell
npm run package:desktop
```

Output: `desktop-release-beta/Omni Sticky Setup 1.0.0-beta.1.exe`.

The tray menu offers Open, New note, Launch at sign-in, and Quit. Launch at sign-in defaults to **off** for new installs. Closing the main window hides it in the tray. Paid features and automatic updates are not included. The installer requires a clean-machine installation check and signing/reputation work before broad Windows distribution; see [DESKTOP_APP_AND_FEATURES.md](DESKTOP_APP_AND_FEATURES.md).
