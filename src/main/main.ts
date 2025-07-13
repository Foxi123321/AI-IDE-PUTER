import { app, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

class CursorAIClone {
  private mainWindow: BrowserWindow | null = null;
  private isDev = process.env.NODE_ENV === 'development';

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // App event listeners
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIPC();
      this.setupMenu();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('web-contents-created', (_, contents) => {
      // Security: Prevent navigation to external URLs
      contents.on('will-navigate', (event, url) => {
        if (url !== contents.getURL()) {
          event.preventDefault();
        }
      });

      // Security: Prevent opening new windows
      contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    });
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        sandbox: false, // Needed for file system access
      },
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#1e1e1e',
      show: false, // Don't show until ready
      icon: path.join(__dirname, '../assets/icon.png'), // Add icon later
    });

    // Load the app
    if (this.isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      if (this.isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupIPC(): void {
    // File System Operations
    ipcMain.handle('fs:readFile', async (_, filePath: string) => {
      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return { success: true, content };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
      try {
        await fs.promises.writeFile(filePath, content, 'utf-8');
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('fs:readDir', async (_, dirPath: string) => {
      try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const result = entries.map(entry => ({
          name: entry.name,
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile(),
        }));
        return { success: true, entries: result };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('fs:exists', async (_, filePath: string) => {
      try {
        await fs.promises.access(filePath);
        return { success: true, exists: true };
      } catch {
        return { success: true, exists: false };
      }
    });

    ipcMain.handle('fs:mkdir', async (_, dirPath: string) => {
      try {
        await fs.promises.mkdir(dirPath, { recursive: true });
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('fs:delete', async (_, filePath: string) => {
      try {
        const stats = await fs.promises.stat(filePath);
        if (stats.isDirectory()) {
          await fs.promises.rmdir(filePath, { recursive: true });
        } else {
          await fs.promises.unlink(filePath);
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Dialog Operations
    ipcMain.handle('dialog:openFile', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'JavaScript', extensions: ['js', 'jsx'] },
          { name: 'TypeScript', extensions: ['ts', 'tsx'] },
          { name: 'Python', extensions: ['py'] },
          { name: 'Text Files', extensions: ['txt', 'md'] },
        ],
      });
      return result;
    });

    ipcMain.handle('dialog:openDirectory', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openDirectory'],
      });
      return result;
    });

    ipcMain.handle('dialog:saveFile', async (_, options?: any) => {
      const result = await dialog.showSaveDialog(this.mainWindow!, options);
      return result;
    });

    // Application Operations
    ipcMain.handle('app:getPath', async (_, name: string) => {
      return app.getPath(name as any);
    });

    ipcMain.handle('app:getVersion', async () => {
      return app.getVersion();
    });

    ipcMain.handle('window:maximize', async () => {
      this.mainWindow?.maximize();
    });

    ipcMain.handle('window:minimize', async () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:close', async () => {
      this.mainWindow?.close();
    });

    ipcMain.handle('window:toggleDevTools', async () => {
      this.mainWindow?.webContents.toggleDevTools();
    });

    // External URL handling
    ipcMain.handle('shell:openExternal', async (_, url: string) => {
      try {
        await shell.openExternal(url);
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    // Workspace Operations
    ipcMain.handle('workspace:setCurrent', async (_, workspacePath: string) => {
      // Store current workspace path in app state
      app.setPath('userData', path.join(app.getPath('userData'), 'workspaces'));
      
      try {
        const workspaceData = { path: workspacePath, lastOpened: new Date().toISOString() };
        const userDataPath = app.getPath('userData');
        await fs.promises.mkdir(userDataPath, { recursive: true });
        await fs.promises.writeFile(
          path.join(userDataPath, 'current-workspace.json'),
          JSON.stringify(workspaceData, null, 2)
        );
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('workspace:getCurrent', async () => {
      try {
        const userDataPath = app.getPath('userData');
        const workspaceFile = path.join(userDataPath, 'current-workspace.json');
        const data = await fs.promises.readFile(workspaceFile, 'utf-8');
        return { success: true, workspace: JSON.parse(data) };
      } catch {
        return { success: true, workspace: null };
      }
    });
  }

  private setupMenu(): void {
    const template: any[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Open File...',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.mainWindow?.webContents.send('menu:openFile');
            }
          },
          {
            label: 'Open Folder...',
            accelerator: 'CmdOrCtrl+Shift+O',
            click: () => {
              this.mainWindow?.webContents.send('menu:openFolder');
            }
          },
          { type: 'separator' },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.mainWindow?.webContents.send('menu:save');
            }
          },
          {
            label: 'Save As...',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              this.mainWindow?.webContents.send('menu:saveAs');
            }
          },
          { type: 'separator' },
          {
            label: 'Exit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
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
          { role: 'selectall' }
        ]
      },
      {
        label: 'AI',
        submenu: [
          {
            label: 'Ask AI...',
            accelerator: 'CmdOrCtrl+K',
            click: () => {
              this.mainWindow?.webContents.send('menu:askAI');
            }
          },
          {
            label: 'Start Agent',
            accelerator: 'CmdOrCtrl+Shift+K',
            click: () => {
              this.mainWindow?.webContents.send('menu:startAgent');
            }
          },
          { type: 'separator' },
          {
            label: 'Toggle AI Suggestions',
            accelerator: 'CmdOrCtrl+/',
            click: () => {
              this.mainWindow?.webContents.send('menu:toggleSuggestions');
            }
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
          { role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' },
          { role: 'close' }
        ]
      }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });

      // Window menu
      template[5].submenu = [
        { role: 'close' },
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ];
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

// Create and initialize the application
new CursorAIClone();