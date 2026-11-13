# Omni Sticky launch handoff

Prepared for a small public **web beta** on 14 November 2026. The code and release files are prepared locally; no public website has been deployed by this task.

## Owner actions before sharing the link

1. **Choose the permanent web address and deploy the website.** Upload the contents of `dist/` or extract `launch-beta.zip` into the root of an HTTPS static host. If your host builds from source, use `npm ci`, build command `npm run build`, and output directory `dist`. The app needs no server or database. Keep this address stable: local work belongs to its origin. For later domain changes, tell users to export before moving and restore on the new domain.
2. **Set a real feedback route.** The help page currently asks users to reply where they received the launch link and offers a copyable feedback draft. For a broad launch, replace that paragraph in `public/help.html` with your monitored support address or feedback form, then rebuild and redeploy. Keep the privacy page consistent with any service you add.
3. **Run the short smoke check on the deployed URL.** Start a workspace, create and edit a note, complete it, refresh, and confirm persistence. Create a project and upload a canvas photo. Download a complete backup and restore it in a separate test browser profile. Visit online, close/reopen the app offline, and check the help/privacy pages. Use your own Android phone and at least one other desktop browser as well as Chrome.
4. **Invite a small first group.** Send the link personally to about 20 people from one audience, such as students who plan visually. Explain that this is a free local-first beta and that they should keep backups. Ask what they tried, what was confusing, and whether they returned during the week. There is no telemetry in this release; learn through direct feedback initially.

## Deployment details

- Serve everything in `dist`, including `assets`, icons, `manifest.json`, `sw.js`, `help.html`, and `privacy.html`.
- The app is built for the domain root, rather than a subfolder.
- Use HTTPS for browser installation and offline service-worker support.
- Apply the headers in `_headers` if your host supports that file. Otherwise configure equivalent headers in the host settings. Serve HTML and `sw.js` with revalidation; do not keep them indefinitely cached by a CDN.
- Publishing the new web version does not copy browser data into the Windows app, another device, or another browser.
- Offline updates activate after existing app tabs close. Refreshing one open tab is not a reliable way to test a waiting service-worker update.
- Do not upload source files, `.git`, `node_modules`, private files, test artifacts, or the desktop build folders as website content.

## What was corrected

- React dialogs now mount safely, support Escape, contain keyboard focus, and reset their forms appropriately.
- Empty collections remain empty. Sample notes no longer return after deletion or inject themselves into existing work.
- New users choose an empty workspace or explicitly opt into sample notes. Mobile starts with a simpler task list.
- Workspace collections save together in one snapshot. Quota failures, blocked storage, unreadable records, and edits from another tab produce visible recovery guidance.
- Complete JSON backups include groups, projects, canvas items, connections, and uploaded photos. Restore validates first, requires a current backup, restores photos, and then replaces the workspace. Legacy task-only JSON is supported.
- Photos load from IndexedDB after refresh. Image transactions wait for commit; unsupported/oversized inputs report errors.
- Project lists use actual user projects, including more than three projects and projects without a group. Editing updates the selected project.
- Fake profile identity, productivity metrics, streaks, milestones, subscription plans, and unverified quote attributions were removed.
- Quick capture and due-date labels use local calendar dates. Unsupported clock-time parsing and scheduled notification claims were removed.
- Completion timestamps and statuses stay consistent. Focus timers use elapsed wall time, and task stopwatches pause on reload.
- Browser installation icons, an offline shell, help/privacy pages, security headers, and an error recovery screen were added.
- Optional heavy screens load separately, reducing the initial JavaScript bundle.
- Windows launch at sign-in defaults to off for new installs. The tray uses a PNG icon; external navigation is restricted and startup failures preserve data.
- Build dependency vulnerabilities identified during the audit were patched. Dependency audit reported zero vulnerabilities after installation.

## Verification

- Production TypeScript/Vite build completed.
- 13 Node tests passed, including real storage, backup validation, and parsing behavior.
- 10 Chrome browser tests passed: desktop/mobile layout, note editing/completion/deletion/reload, dialog reopening, offline reopening, real project creation/editing, photo backup/restore into a fresh profile, corrupt-data preservation, multi-tab conflict handling, focus timing, and mobile keyboard access.
- Desktop and mobile screenshots were inspected. Test screenshots are in the ignored `test-results` folder.
- A Windows NSIS beta installer was built using the existing Electron 45.3.1 runtime. Installation, sign-in behavior, and upgrade compatibility still need a clean Windows account or VM check.

## Release files

- Website directory: `dist/`.
- Website upload archive: `launch-beta.zip`.
- Windows installer: `desktop-release-beta/Omni Sticky Setup 1.0.0-beta.1.exe`.
- Installer SHA-256 and web archive SHA-256: `RELEASE_SHA256.txt`.

## Keep the beta promise clear

All available features are free. Work stays on the current device/browser. There is no account, cloud sync, collaboration, paid subscription, scheduled reminder service, or automatic desktop updater. JSON exports are readable and unencrypted. Clearing site data can delete work. Browser storage protection is not a backup.

Use one tab per workspace. Back up regularly. Focus Room sessions end when leaving the view; the app is not a guaranteed background alarm. Canvas touch support remains limited, so larger screens are recommended.

The Windows installer is unsigned. Complete the checks in `DESKTOP_APP_AND_FEATURES.md` and arrange code signing before broad Windows distribution. The web beta can launch independently.
