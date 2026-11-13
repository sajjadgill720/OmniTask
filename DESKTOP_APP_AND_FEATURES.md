# Windows beta release

The desktop app wraps the same local-first web UI in Electron. It has a single-instance window, a PNG-backed tray icon, quick capture from the tray, optional launch at sign-in, and a restricted preload bridge.

## Build

```powershell
npm ci
npm run package:desktop
```

The current installer target is `desktop-release-beta/Omni Sticky Setup 1.0.0-beta.1.exe`. Previous release folders contain older builds and should not be distributed as this beta.

If Windows locks Electron while the builder extracts it, the workspace has an already-unpacked Electron 45.3.1 runtime at `release/win-unpacked`:

```powershell
npm run package:desktop -- --config.electronDist=release/win-unpacked
```

That fallback depends on an ignored local directory and is not available in a clean checkout. Use the ordinary build first on a clean machine.

## Behavior

- Launch at sign-in defaults to off on a new installation. Existing saved preferences are preserved. Enable or disable it in the tray menu.
- Sign-in launch starts hidden in the tray. Ordinary launch opens the window.
- Closing the window keeps the app running. Choose Quit in the tray menu to exit.
- Data is stored in Electron's own user profile and is separate from any browser workspace. Transfer it with complete JSON backups.
- The packaged UI uses a stable loopback origin at `http://127.0.0.1:41739` to preserve browser storage between launches. Startup errors are shown without clearing data.
- Renderer isolation and sandboxing are enabled; Node integration is off. New external HTTP/HTTPS windows open in the system browser. In-app navigation to a different origin is prevented.
- Notifications are optional tests of notification access. Scheduled reminders are unavailable. Storage permissions do not guarantee backups.
- Windows builds do not register the web service worker; packaged assets already run without internet. This beta has no automatic updater.

## Before public Windows distribution

1. Install on a clean Windows account or VM and verify shortcuts, launch, tray, quit/reopen, note persistence, photo backup/restore, and uninstall behavior.
2. Check that sign-in launch is initially disabled, then test enabling/disabling it and a real sign-out/sign-in.
3. Decide on a code-signing and download/update distribution process. This workspace does not contain signing credentials. An unsigned installer may trigger Windows reputation warnings.
4. Test upgrade from any earlier version you already distributed. Back up that version first; do not change its app ID, profile path, or storage origin casually.

Building an installer does not verify installation or sign-in behavior. No installation or system sign-in changes are performed by the build.
