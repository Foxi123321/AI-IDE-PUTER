import { app, BrowserWindow, Menu, shell, ipcMain, dialog, globalShortcut } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync, watchFile, unwatchFile } from 'fs';
import { exec, spawn } from 'child_process';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';

// Initialize store
const store = new Store();

// Global variables
let mainWindow: BrowserWindow | null = null;
let terminals: Map<string, any> = new Map();
let fileWatchers: Map<string, any> = new Map();

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      webSecurity: true
    },
    show: false,
    backgroundColor: '#1e1e1e',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    icon: join(__dirname, '../../assets/icon.png')
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:9000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Security: prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC Handlers
function setupIPCHandlers() {
  // File System Operations
  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:createFile', async (_, filePath: string, content: string = '') => {
    try {
      writeFileSync(filePath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:deleteFile', async (_, filePath: string) => {
    try {
      const fs = require('fs');
      if (statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
    try {
      const items = readdirSync(dirPath, { withFileTypes: true });
      const result = items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: join(dirPath, item.name)
      }));
      return { success: true, items: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:exists', async (_, filePath: string) => {
    return existsSync(filePath);
  });

  ipcMain.handle('fs:watchFile', async (_, filePath: string) => {
    try {
      if (fileWatchers.has(filePath)) {
        return { success: true, message: 'Already watching' };
      }

      const watcher = watchFile(filePath, (curr, prev) => {
        mainWindow?.webContents.send('file-changed', {
          path: filePath,
          current: curr,
          previous: prev
        });
      });

      fileWatchers.set(filePath, watcher);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('fs:unwatchFile', async (_, filePath: string) => {
    try {
      if (fileWatchers.has(filePath)) {
        unwatchFile(filePath);
        fileWatchers.delete(filePath);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // AI Operations (Puter.js integration)
  ipcMain.handle('ai:chat', async (_, message: string, context: any) => {
    try {
      // Puter.js AI integration
      const response = await fetch('https://api.puter.com/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY}`
        },
        body: JSON.stringify({
          message,
          context: {
            files: context.files,
            selection: context.selection,
            language: context.language,
            project: context.project
          }
        })
      });

      const data = await response.json();
      return { success: true, response: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ai:complete', async (_, prompt: string, context: any) => {
    try {
      const response = await fetch('https://api.puter.com/ai/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY}`
        },
        body: JSON.stringify({
          prompt,
          context,
          stream: true
        })
      });

      const data = await response.json();
      return { success: true, completion: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ai:analyze', async (_, code: string, language: string) => {
    try {
      const response = await fetch('https://api.puter.com/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY}`
        },
        body: JSON.stringify({
          code,
          language,
          tasks: ['explain', 'optimize', 'test', 'refactor']
        })
      });

      const data = await response.json();
      return { success: true, analysis: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ai:refactor', async (_, code: string, instructions: string) => {
    try {
      const response = await fetch('https://api.puter.com/ai/refactor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY}`
        },
        body: JSON.stringify({
          code,
          instructions
        })
      });

      const data = await response.json();
      return { success: true, refactored: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ai:generateTests', async (_, code: string, language: string) => {
    try {
      const response = await fetch('https://api.puter.com/ai/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY}`
        },
        body: JSON.stringify({
          code,
          language,
          testFramework: 'jest'
        })
      });

      const data = await response.json();
      return { success: true, tests: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ai:fixErrors', async (_, code: string, errors: any[]) => {
    try {
      const response = await fetch('https://api.puter.com/ai/fix-errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY}`
        },
        body: JSON.stringify({
          code,
          errors
        })
      });

      const data = await response.json();
      return { success: true, fixed: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('ai:optimizeCode', async (_, code: string, language: string) => {
    try {
      const response = await fetch('https://api.puter.com/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PUTER_API_KEY}`
        },
        body: JSON.stringify({
          code,
          language
        })
      });

      const data = await response.json();
      return { success: true, optimized: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // Terminal Operations
  ipcMain.handle('terminal:create', async (_, options: any) => {
    try {
      const terminalId = `terminal-${Date.now()}`;
      const terminal = spawn(options.shell || 'bash', [], {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env }
      });

      terminal.stdout.on('data', (data) => {
        mainWindow?.webContents.send('terminal-output', {
          terminalId,
          data: data.toString()
        });
      });

      terminal.stderr.on('data', (data) => {
        mainWindow?.webContents.send('terminal-output', {
          terminalId,
          data: data.toString(),
          error: true
        });
      });

      terminal.on('close', (code) => {
        mainWindow?.webContents.send('terminal-closed', {
          terminalId,
          code
        });
        terminals.delete(terminalId);
      });

      terminals.set(terminalId, terminal);
      return { success: true, terminalId };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('terminal:write', async (_, terminalId: string, data: string) => {
    try {
      const terminal = terminals.get(terminalId);
      if (terminal) {
        terminal.stdin.write(data);
        return { success: true };
      }
      return { success: false, error: 'Terminal not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('terminal:kill', async (_, terminalId: string) => {
    try {
      const terminal = terminals.get(terminalId);
      if (terminal) {
        terminal.kill();
        terminals.delete(terminalId);
        return { success: true };
      }
      return { success: false, error: 'Terminal not found' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('terminal:runCommand', async (_, command: string, options: any = {}) => {
    return new Promise((resolve) => {
      exec(command, {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env }
      }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          error: error?.message
        });
      });
    });
  });

  // Git Operations
  ipcMain.handle('git:status', async (_, repoPath: string) => {
    return new Promise((resolve) => {
      exec('git status --porcelain', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          const files = stdout.split('\n').filter(line => line.trim()).map(line => ({
            status: line.substring(0, 2),
            file: line.substring(3)
          }));
          resolve({ success: true, files });
        }
      });
    });
  });

  ipcMain.handle('git:diff', async (_, repoPath: string, file?: string) => {
    return new Promise((resolve) => {
      const command = file ? `git diff ${file}` : 'git diff';
      exec(command, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true, diff: stdout });
        }
      });
    });
  });

  ipcMain.handle('git:commit', async (_, repoPath: string, message: string, files: string[]) => {
    return new Promise((resolve) => {
      const addCommand = files.length > 0 ? `git add ${files.join(' ')}` : 'git add .';
      exec(`${addCommand} && git commit -m "${message}"`, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  });

  ipcMain.handle('git:branch', async (_, repoPath: string, branchName?: string) => {
    return new Promise((resolve) => {
      const command = branchName ? `git checkout -b ${branchName}` : 'git branch';
      exec(command, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  });

  ipcMain.handle('git:checkout', async (_, repoPath: string, branch: string) => {
    return new Promise((resolve) => {
      exec(`git checkout ${branch}`, { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  });

  ipcMain.handle('git:pull', async (_, repoPath: string) => {
    return new Promise((resolve) => {
      exec('git pull', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  });

  ipcMain.handle('git:push', async (_, repoPath: string) => {
    return new Promise((resolve) => {
      exec('git push', { cwd: repoPath }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  });

  // Settings Operations
  ipcMain.handle('settings:get', async (_, key: string) => {
    return store.get(key);
  });

  ipcMain.handle('settings:set', async (_, key: string, value: any) => {
    store.set(key, value);
    return { success: true };
  });

  ipcMain.handle('settings:getAll', async () => {
    return store.store;
  });

  ipcMain.handle('settings:reset', async (_, key?: string) => {
    if (key) {
      store.delete(key);
    } else {
      store.clear();
    }
    return { success: true };
  });

  // Dialog Operations
  ipcMain.handle('dialog:showOpenDialog', async (_, options: any) => {
    const result = await dialog.showOpenDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('dialog:showSaveDialog', async (_, options: any) => {
    const result = await dialog.showSaveDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('dialog:showMessageBox', async (_, options: any) => {
    const result = await dialog.showMessageBox(mainWindow!, options);
    return result;
  });

  // Window Operations
  ipcMain.handle('window:minimize', async () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', async () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window:close', async () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:toggleFullScreen', async () => {
    mainWindow?.setFullScreen(!mainWindow.isFullScreen());
  });

  // App Operations
  ipcMain.handle('app:getVersion', async () => {
    return app.getVersion();
  });

  ipcMain.handle('app:getPath', async (_, name: string) => {
    return app.getPath(name as any);
  });

  ipcMain.handle('app:restart', async () => {
    app.relaunch();
    app.exit();
  });

  ipcMain.handle('app:quit', async () => {
    app.quit();
  });
}

// Setup global shortcuts
function setupGlobalShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    mainWindow?.webContents.send('shortcut:aiChat');
  });

  globalShortcut.register('CommandOrControl+Shift+E', () => {
    mainWindow?.webContents.send('shortcut:aiExplain');
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    mainWindow?.webContents.send('shortcut:aiRefactor');
  });

  globalShortcut.register('CommandOrControl+Shift+T', () => {
    mainWindow?.webContents.send('shortcut:aiGenerateTests');
  });

  globalShortcut.register('CommandOrControl+`', () => {
    mainWindow?.webContents.send('shortcut:toggleTerminal');
  });
}

// Setup application menu
function setupMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:newFile')
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:openFile')
        },
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow?.webContents.send('menu:openFolder')
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save')
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:saveAs')
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow?.webContents.send('menu:find')
        },
        {
          label: 'Replace',
          accelerator: 'CmdOrCtrl+H',
          click: () => mainWindow?.webContents.send('menu:replace')
        }
      ]
    },
    {
      label: 'AI',
      submenu: [
        {
          label: 'Chat with AI',
          accelerator: 'CmdOrCtrl+Shift+L',
          click: () => mainWindow?.webContents.send('menu:aiChat')
        },
        {
          label: 'Explain Code',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => mainWindow?.webContents.send('menu:aiExplain')
        },
        {
          label: 'Refactor Code',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => mainWindow?.webContents.send('menu:aiRefactor')
        },
        {
          label: 'Generate Tests',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => mainWindow?.webContents.send('menu:aiGenerateTests')
        },
        {
          label: 'Fix Errors',
          accelerator: 'CmdOrCtrl+Shift+F',
          click: () => mainWindow?.webContents.send('menu:aiFixErrors')
        },
        {
          label: 'Optimize Code',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow?.webContents.send('menu:aiOptimize')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Explorer',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => mainWindow?.webContents.send('menu:toggleExplorer')
        },
        {
          label: 'Terminal',
          accelerator: 'CmdOrCtrl+`',
          click: () => mainWindow?.webContents.send('menu:toggleTerminal')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => mainWindow?.webContents.send('menu:about')
        },
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://puter.com/docs')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createMainWindow();
  setupIPCHandlers();
  setupGlobalShortcuts();
  setupMenu();
  
  // Setup auto-updater
  autoUpdater.checkForUpdatesAndNotify();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Security
app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
});

export {};