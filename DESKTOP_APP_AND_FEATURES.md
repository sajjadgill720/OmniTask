# Omni Sticky: Desktop App, Features, Setup, and Build Notes

This document describes the current Omni Sticky app, the Windows desktop wrapper that was added, how to run/build it, and the implementation issues encountered while producing the installer.

## What the product is

Omni Sticky is a web application built with React, TypeScript, and Vite. It can run in a browser or inside the new Electron desktop shell. The desktop shell packages the same web UI as a Windows app; it does not replace the web app or require a separate task/note data model.

The desktop installer created for this workspace is:

`desktop-release-final/Omni Sticky Setup 1.0.0.exe`

The output directory is intentionally ignored by Git. Install the executable on Windows to get the app and shortcuts. The installer has not been run on the developer machine as part of this change.

## Existing app features

The app's current screens and components include:

- **My Board / Desk Workspace:** a sticky-note workspace with workflow columns, task cards, visual note colors, and compact/normal/full-card display choices.
- **Executive Standup Wall:** a corporate-style wall view with tasks arranged by workflow status.
- **Canvas Wall:** an open canvas with notes and other canvas elements, selection/editing, connections, zoom, pan, undo/redo, image upload, alignment, duplicate, and delete controls.
- **Focus Room:** a focus timer, task selection, distraction-free mode, optional soundscape, and completion feedback.
- **Analytics:** timeframe-based productivity summaries, completion trends, momentum and next-step suggestions.
- **Workflow views:** Today, Inbox, Upcoming, Anytime, Someday, and Logbook lists.
- **Projects:** project/group navigation, project creation, project hub and project detail views.
- **Notes and tasks:** sticky colors, task status, categories/tags, due dates, task details, checklists, and handwritten-style note typography.
- **Quick capture:** the floating Magic Plus action and `N` shortcut. Natural-language parsing can detect dates, times, priority, and tags (for example, `Buy supplies tomorrow at 3pm p1 #Office`). A color can be selected while capturing.
- **Command palette and widgets:** command palette, widget center, productivity widgets, and a fullscreen desk clock.
- **Appearance and preferences:** light/dark theme, density preferences, settings, category/project management, and permissions controls.
- **Feedback and reminders:** browser notifications where permission is granted, synthesized completion sound, toast feedback, and confetti completion feedback.
- **Local persistence and export:** app state is persisted in browser storage; Markdown and JSON export are available for backups.

Some features depend on browser/OS permissions and user data. For example, browser notifications require notification permission. The desktop wrapper does not add cloud sync: the app remains local/offline-first.

## Windows desktop behavior

The Electron main process lives in `electron/main.cjs`; the secure renderer bridge is in `electron/preload.cjs`.

- **Window:** opens Omni Sticky in a native desktop window. The minimum window size is 860 × 640 CSS pixels; the web UI still supplies its own responsive layout.
- **System tray:** closing the window hides it instead of quitting. Double-click the tray icon or choose **Open Omni Sticky** to restore it.
- **Tray actions:** open the app, start a new note, toggle **Launch at sign-in**, or quit.
- **New note from tray:** the main process sends a narrow IPC event to the renderer, which opens the existing Magic Plus quick-add dialog. The preload exposes only this callback, not unrestricted Node or Electron APIs.
- **Launch at sign-in:** on the first packaged launch, the preference defaults to enabled. Windows sign-in launches the app with `--background`, so the window starts hidden and the tray remains available. The setting is stored in the app's user data and can be changed from the tray menu.
- **Single instance:** starting a second copy focuses the existing window.
- **Shortcuts:** the per-user NSIS installer creates desktop and Start menu shortcuts and launches the app after installation.
- **External links:** HTTP/HTTPS links are opened in the system browser rather than a new embedded window.
- **Packaged web assets:** Electron serves the Vite `dist` files on loopback at `127.0.0.1:41739`. Only loopback is bound. The request path is normalized and checked to remain within the packaged `dist` directory.
- **Stable storage origin:** the loopback port is fixed. Browser localStorage is scoped to an origin, so a random port on each start would make saved data appear to disappear between sessions.

The desktop app uses Electron's own browser profile. Its local data is separate from the browser's profile data; it does not automatically import notes from a browser session. Use the app's Markdown/JSON export to make a backup before moving data. Automatic import/migration is not part of the desktop wrapper.

## Development and packaging

### Requirements

- Windows for producing the Windows NSIS installer.
- Node.js and npm compatible with this repository.
- Network access during dependency installation and the first installer build, because npm packages and the NSIS/7-Zip packaging tools may need to be fetched.

### Run the web app

```powershell
npm install
npm run dev
```

Open `http://localhost:5173/` in a browser.

### Run the desktop shell against Vite during development

```powershell
npm run dev:desktop
```

This starts Vite on `127.0.0.1:5173`, waits for it to become available, and opens Electron. Set `OMNI_STICKY_DEVTOOLS=true` if you need Electron DevTools.

### Build the Windows installer

```powershell
npm install
npm run package:desktop
```

The script runs the TypeScript/Vite production build and invokes electron-builder for Windows NSIS. The configured output directory is `desktop-release-final/`.

If electron-builder hits a Windows lock while unpacking Electron, the fallback that succeeded in this workspace was:

```powershell
npm run build
npx electron-builder --win nsis --config.directories.output=desktop-release-final --config.electronDist=release/win-unpacked
```

That fallback requires `release/win-unpacked` to contain an already unpacked Electron distribution. It is not present in a clean checkout; the normal command is the intended first attempt.

## Code changes made for the desktop app

- Added Electron main-process setup, tray menu, window lifecycle, single-instance handling, login setting, and packaged static asset server in `electron/main.cjs`.
- Added the restricted `omniStickyDesktop.onQuickAdd` preload bridge in `electron/preload.cjs`.
- Added a TypeScript declaration for the optional desktop bridge in `src/types/desktop.d.ts`.
- Connected the tray's New note action to the existing Magic Plus dialog in `src/App.tsx` and `src/components/MagicPlusButton.tsx`.
- Added Electron, electron-builder, `concurrently`, and `wait-on` development dependencies and desktop scripts/configuration in `package.json` and `package-lock.json`.
- Documented the desktop workflow in `README.md`.
- Ignored generated installer/runtime directories in `.gitignore`.
- Kept packaged localStorage on a stable loopback origin (`127.0.0.1:41739`) so desktop data persists across app relaunches.

## Build blockers encountered and resolutions

### 1. npm registry DNS was unavailable in the restricted build environment

**Symptom:** The first dependency install failed with `getaddrinfo ENOTFOUND registry.npmjs.org`.

**Resolution:** Retried the install with network access approved for the package installation. npm then installed Electron, electron-builder, and the supporting packages.

### 2. Electron's Windows runtime extraction hit a locked temporary file

**Symptom:** electron-builder failed during package preparation with `EBUSY` on `...win-unpacked.tmp/resources/default_app.asar`. Trying a different output directory hit the same locked file. Cleanup also failed because Windows reported that the file was in use.

**Resolution:** Used the Electron runtime that had already been unpacked under `release/win-unpacked` as the builder's `electronDist`, and directed output to `desktop-release-final`. That avoided the repeated extraction/rename step and the NSIS installer completed successfully.

### 3. A first attempt used a nonexistent local Electron distribution path

**Symptom:** Setting `electronDist=node_modules/electron/dist` failed because that path did not exist in this environment; the Electron npm package did not contain a local `dist` folder.

**Resolution:** Pointed `electronDist` at the actual already-unpacked Electron directory, `release/win-unpacked`. This is why the fallback build command names that directory explicitly.

### 4. Packaging tools also required network downloads

**Symptom:** The installer build needed the 7-Zip and NSIS tool bundles. The initial restricted run could not resolve GitHub; the elevated retry downloaded the required packaging tools and finished the installer.

**Resolution:** Completed the installer build with network access available. Subsequent builds may use electron-builder's local cache.

### 5. Local storage would have looked empty on each desktop launch

**Symptom found during review:** A dynamically allocated port changes the web origin on each run, and browser localStorage is isolated by origin.

**Resolution:** The packaged server now binds to a fixed loopback port so it uses the same origin between runs. The server is restricted to `127.0.0.1` and validates resolved paths before reading files.

## Validation performed

- `node --check electron/main.cjs` passed.
- `npm run build` passed, including TypeScript compilation and Vite production output.
- `electron-builder` completed the Windows NSIS build and produced `desktop-release-final/Omni Sticky Setup 1.0.0.exe` (about 119 MiB).
- The installer and installed app were not executed during this task. Therefore, tray interaction, sign-in startup, and installer shortcuts are implemented/configured but have not been smoke-tested by installing and launching the app on this machine.

## Known limitations and follow-up considerations

- The generated installer targets Windows x64 only. macOS and Linux packaging are not configured.
- The app is not code-signed. Windows may display a publisher/SmartScreen warning for an unsigned installer.
- Launch at sign-in is enabled after the first packaged launch. Use the tray checkbox to disable it if desired.
- If another process already uses port `41739`, the packaged static server cannot bind that port and the app may fail to start. A future improvement could select a stable configurable port or register a private custom protocol.
- The desktop app and browser app have separate local browser profiles; no account/cloud sync or automatic data migration was added.
- The build printed Vite's existing bundle-size warning: the main JavaScript chunk is approximately 512 kB minified. It did not prevent the production build or installer from completing.
- npm reported six moderate advisories after dependency installation. They were not auto-fixed, because blanket dependency upgrades can introduce unrelated changes; review with `npm audit` before a production release.
- This documents the current implementation and build result, not a complete interaction/accessibility audit across every app route and screen size.

