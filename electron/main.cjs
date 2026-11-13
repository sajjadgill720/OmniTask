const { app, BrowserWindow, Menu, Tray, nativeImage, shell, dialog, session } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const isDev = !app.isPackaged;
const backgroundLaunch = process.argv.includes('--background');
const distPath = path.join(app.getAppPath(), 'dist');
let mainWindow;
let tray;
let localServer;
let quitting = false;
let pendingQuickAdd = false;
let startupEnabled = false;

app.setAppUserModelId('app.omnisticky.desktop');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showWindow();
  });
}

function readPreferences() {
  const preferencesPath = path.join(app.getPath('userData'), 'desktop-preferences.json');
  try {
    return JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
  } catch {
    return {};
  }
}

function savePreferences() {
  const preferencesPath = path.join(app.getPath('userData'), 'desktop-preferences.json');
  fs.mkdirSync(path.dirname(preferencesPath), { recursive: true });
  fs.writeFileSync(preferencesPath, JSON.stringify({ startupEnabled }, null, 2));
}

function updateStartupSetting(enabled) {
  startupEnabled = enabled;
  if (process.platform === 'win32') {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      path: process.execPath,
      args: enabled ? ['--background'] : [],
    });
  }
  savePreferences();
  rebuildTrayMenu();
}

function makeTrayIcon() {
  const iconPath = path.join(fs.existsSync(path.join(distPath, 'icon-192.png')) ? distPath : path.join(app.getAppPath(), 'public'), 'icon-192.png');
  return nativeImage.createFromPath(iconPath).resize({ width: 24, height: 24 });
}

function rebuildTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Omni Sticky', click: showWindow },
    { label: 'New note', click: openNewNote },
    { type: 'separator' },
    {
      label: 'Launch at sign-in',
      type: 'checkbox',
      checked: startupEnabled,
      click: (item) => updateStartupSetting(item.checked),
    },
    { type: 'separator' },
    { label: 'Quit Omni Sticky', click: () => { quitting = true; app.quit(); } },
  ]));
}

function createTray() {
  if (tray) return;
  tray = new Tray(makeTrayIcon());
  tray.setToolTip('Omni Sticky');
  tray.on('double-click', showWindow);
  rebuildTrayMenu();
}

function showWindow() {
  if (!mainWindow) {
    createWindow(false);
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function openNewNote() {
  showWindow();
  if (!mainWindow) return;
  if (mainWindow.webContents.isLoading()) {
    pendingQuickAdd = true;
    return;
  }
  mainWindow.webContents.send('omni:quick-add');
}

function createWindow(hidden = false) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 860,
    minHeight: 640,
    show: !hidden,
    autoHideMenuBar: true,
    backgroundColor: '#f5ead6',
    title: 'Omni Sticky',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      if (new URL(url).origin === new URL(mainWindow.webContents.getURL()).origin) return;
    } catch { /* Reject unexpected protocols and malformed URLs. */ }
    event.preventDefault();
    if (/^https?:\/\//.test(url)) shell.openExternal(url).catch(() => {});
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingQuickAdd) {
      pendingQuickAdd = false;
      mainWindow.webContents.send('omni:quick-add');
    }
  });

  mainWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });

  if (isDev) {
    mainWindow.loadURL(process.env.OMNI_STICKY_DEV_URL || 'http://127.0.0.1:5173');
    if (process.env.OMNI_STICKY_DEVTOOLS === 'true') mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadURL(`http://127.0.0.1:${localServer.address().port}/`);
  }
}

function servePackagedApp() {
  // Keep the origin stable between launches so localStorage remains available.
  // A random port would create a fresh browser storage origin every time.
  const packagedPort = 41739;
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };

  localServer = http.createServer((request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400).end('Bad request');
      return;
    }
    const candidate = path.resolve(distPath, `.${pathname}`);
    if (candidate !== distPath && !candidate.startsWith(`${distPath}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const filePath = fs.existsSync(candidate) && fs.statSync(candidate).isFile()
      ? candidate
      : path.join(distPath, 'index.html');
    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(404).end('Not found');
        return;
      }
      response.writeHead(200, {
        'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https: http:; font-src 'self'; connect-src 'self' blob: data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      });
      response.end(content);
    });
  });

  return new Promise((resolve, reject) => {
    localServer.once('error', reject);
    localServer.listen(packagedPort, '127.0.0.1', resolve);
  });
}

app.whenReady().then(async () => {
  if (!gotLock) return;
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const expected = isDev ? (process.env.OMNI_STICKY_DEV_URL || 'http://127.0.0.1:5173') : 'http://127.0.0.1:41739';
    try { callback(permission === 'notifications' && new URL(webContents.getURL()).origin === new URL(expected).origin); }
    catch { callback(false); }
  });
  const preferences = readPreferences();
  if (typeof preferences.startupEnabled === 'boolean') {
    startupEnabled = preferences.startupEnabled;
  } else if (app.isPackaged) {
    savePreferences();
  }
  if (app.isPackaged) updateStartupSetting(startupEnabled);
  if (!isDev) await servePackagedApp();
  createTray();
  createWindow(backgroundLaunch && app.isPackaged);
}).catch(error => {
  dialog.showErrorBox('Omni Sticky could not start', `Your saved workspace has not been cleared. Close other Omni Sticky windows and try again.\n\n${error.message}`);
  app.quit();
});

app.on('activate', showWindow);
app.on('before-quit', () => { quitting = true; });
app.on('will-quit', () => {
  if (localServer) localServer.close();
  if (tray) tray.destroy();
});

