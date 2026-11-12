const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('omniStickyDesktop', {
  onQuickAdd(callback) {
    const listener = () => callback();
    ipcRenderer.on('omni:quick-add', listener);
    return () => ipcRenderer.removeListener('omni:quick-add', listener);
  },
});

