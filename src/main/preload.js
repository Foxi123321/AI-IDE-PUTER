const { contextBridge, ipcRenderer } = require('electron');

// Expose Electron APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File System Operations
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  readDir: (dirPath) => ipcRenderer.invoke('fs:readDir', dirPath),
  fileExists: (filePath) => ipcRenderer.invoke('fs:exists', filePath),
  mkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),
  deleteFile: (filePath) => ipcRenderer.invoke('fs:delete', filePath),

  // Dialog Operations
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:saveFile', options),

  // Application Operations
  getAppPath: (name) => ipcRenderer.invoke('app:getPath', name),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  toggleDevTools: () => ipcRenderer.invoke('window:toggleDevTools'),

  // External Operations
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // Workspace Operations
  setCurrentWorkspace: (path) => ipcRenderer.invoke('workspace:setCurrent', path),
  getCurrentWorkspace: () => ipcRenderer.invoke('workspace:getCurrent'),

  // Menu Event Listeners
  onMenuAction: (callback) => {
    ipcRenderer.on('menu:openFile', callback);
    ipcRenderer.on('menu:openFolder', callback);
    ipcRenderer.on('menu:save', callback);
    ipcRenderer.on('menu:saveAs', callback);
    ipcRenderer.on('menu:askAI', callback);
    ipcRenderer.on('menu:startAgent', callback);
    ipcRenderer.on('menu:toggleSuggestions', callback);
  },

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Renderer Error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

console.log('🚀 Cursor AI Clone - Preload script loaded successfully');