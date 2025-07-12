import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';
import { WindowManager } from './windowManager';
import { FileSystemService } from './services/fileSystemService';
import { AIService } from './services/aiService';
import { TerminalService } from './services/terminalService';
import { GitService } from './services/gitService';
import { LanguageServerService } from './services/languageServerService';
import { SettingsService } from './services/settingsService';
import { ProjectIndexer } from './services/projectIndexer';
import { RulesEngine } from './services/rulesEngine';
import { PluginManager } from './services/pluginManager';
import { SecurityService } from './services/securityService';
import { TelemetryService } from './services/telemetryService';

class PuterCursorApp {
  private windowManager: WindowManager;
  private fileSystemService: FileSystemService;
  private aiService: AIService;
  private terminalService: TerminalService;
  private gitService: GitService;
  private languageServerService: LanguageServerService;
  private settingsService: SettingsService;
  private projectIndexer: ProjectIndexer;
  private rulesEngine: RulesEngine;
  private pluginManager: PluginManager;
  private securityService: SecurityService;
  private telemetryService: TelemetryService;
  private store: Store;

  constructor() {
    this.store = new Store();
    this.initializeServices();
    this.setupEventHandlers();
    this.setupIPCHandlers();
    this.setupAutoUpdater();
  }

  private initializeServices() {
    this.windowManager = new WindowManager();
    this.fileSystemService = new FileSystemService();
    this.aiService = new AIService();
    this.terminalService = new TerminalService();
    this.gitService = new GitService();
    this.languageServerService = new LanguageServerService();
    this.settingsService = new SettingsService();
    this.projectIndexer = new ProjectIndexer();
    this.rulesEngine = new RulesEngine();
    this.pluginManager = new PluginManager();
    this.securityService = new SecurityService();
    this.telemetryService = new TelemetryService();
  }

  private setupEventHandlers() {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupMenu();
      this.startBackgroundServices();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('web-contents-created', (_, contents) => {
      contents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
      });
    });
  }

  private setupIPCHandlers() {
    // File System Operations
    ipcMain.handle('fs:readFile', async (_, filePath: string) => {
      return await this.fileSystemService.readFile(filePath);
    });

    ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
      return await this.fileSystemService.writeFile(filePath, content);
    });

    ipcMain.handle('fs:readDirectory', async (_, dirPath: string) => {
      return await this.fileSystemService.readDirectory(dirPath);
    });

    ipcMain.handle('fs:createFile', async (_, filePath: string, content: string) => {
      return await this.fileSystemService.createFile(filePath, content);
    });

    ipcMain.handle('fs:deleteFile', async (_, filePath: string) => {
      return await this.fileSystemService.deleteFile(filePath);
    });

    ipcMain.handle('fs:watchFile', async (_, filePath: string) => {
      return await this.fileSystemService.watchFile(filePath);
    });

    // AI Operations
    ipcMain.handle('ai:chat', async (_, message: string, context: any) => {
      return await this.aiService.chat(message, context);
    });

    ipcMain.handle('ai:complete', async (_, prompt: string, context: any) => {
      return await this.aiService.complete(prompt, context);
    });

    ipcMain.handle('ai:analyze', async (_, code: string, language: string) => {
      return await this.aiService.analyze(code, language);
    });

    ipcMain.handle('ai:refactor', async (_, code: string, instructions: string) => {
      return await this.aiService.refactor(code, instructions);
    });

    ipcMain.handle('ai:explain', async (_, code: string, language: string) => {
      return await this.aiService.explain(code, language);
    });

    ipcMain.handle('ai:generateTests', async (_, code: string, language: string) => {
      return await this.aiService.generateTests(code, language);
    });

    ipcMain.handle('ai:fixErrors', async (_, code: string, errors: any[]) => {
      return await this.aiService.fixErrors(code, errors);
    });

    ipcMain.handle('ai:optimizeCode', async (_, code: string, language: string) => {
      return await this.aiService.optimizeCode(code, language);
    });

    // Terminal Operations
    ipcMain.handle('terminal:create', async (_, options: any) => {
      return await this.terminalService.create(options);
    });

    ipcMain.handle('terminal:write', async (_, terminalId: string, data: string) => {
      return await this.terminalService.write(terminalId, data);
    });

    ipcMain.handle('terminal:resize', async (_, terminalId: string, cols: number, rows: number) => {
      return await this.terminalService.resize(terminalId, cols, rows);
    });

    ipcMain.handle('terminal:kill', async (_, terminalId: string) => {
      return await this.terminalService.kill(terminalId);
    });

    // Git Operations
    ipcMain.handle('git:status', async (_, repoPath: string) => {
      return await this.gitService.getStatus(repoPath);
    });

    ipcMain.handle('git:diff', async (_, repoPath: string, file?: string) => {
      return await this.gitService.getDiff(repoPath, file);
    });

    ipcMain.handle('git:commit', async (_, repoPath: string, message: string, files: string[]) => {
      return await this.gitService.commit(repoPath, message, files);
    });

    ipcMain.handle('git:branch', async (_, repoPath: string, branchName?: string) => {
      return await this.gitService.branch(repoPath, branchName);
    });

    ipcMain.handle('git:checkout', async (_, repoPath: string, branch: string) => {
      return await this.gitService.checkout(repoPath, branch);
    });

    ipcMain.handle('git:pull', async (_, repoPath: string) => {
      return await this.gitService.pull(repoPath);
    });

    ipcMain.handle('git:push', async (_, repoPath: string) => {
      return await this.gitService.push(repoPath);
    });

    // Language Server Operations
    ipcMain.handle('lsp:start', async (_, language: string, rootPath: string) => {
      return await this.languageServerService.start(language, rootPath);
    });

    ipcMain.handle('lsp:stop', async (_, language: string) => {
      return await this.languageServerService.stop(language);
    });

    ipcMain.handle('lsp:completion', async (_, language: string, document: any, position: any) => {
      return await this.languageServerService.getCompletion(language, document, position);
    });

    ipcMain.handle('lsp:hover', async (_, language: string, document: any, position: any) => {
      return await this.languageServerService.getHover(language, document, position);
    });

    ipcMain.handle('lsp:definition', async (_, language: string, document: any, position: any) => {
      return await this.languageServerService.getDefinition(language, document, position);
    });

    ipcMain.handle('lsp:references', async (_, language: string, document: any, position: any) => {
      return await this.languageServerService.getReferences(language, document, position);
    });

    ipcMain.handle('lsp:diagnostics', async (_, language: string, document: any) => {
      return await this.languageServerService.getDiagnostics(language, document);
    });

    // Settings Operations
    ipcMain.handle('settings:get', async (_, key: string) => {
      return await this.settingsService.get(key);
    });

    ipcMain.handle('settings:set', async (_, key: string, value: any) => {
      return await this.settingsService.set(key, value);
    });

    ipcMain.handle('settings:getAll', async () => {
      return await this.settingsService.getAll();
    });

    ipcMain.handle('settings:reset', async (_, key?: string) => {
      return await this.settingsService.reset(key);
    });

    // Project Indexer Operations
    ipcMain.handle('indexer:index', async (_, projectPath: string) => {
      return await this.projectIndexer.indexProject(projectPath);
    });

    ipcMain.handle('indexer:search', async (_, query: string, options: any) => {
      return await this.projectIndexer.search(query, options);
    });

    ipcMain.handle('indexer:getFileInfo', async (_, filePath: string) => {
      return await this.projectIndexer.getFileInfo(filePath);
    });

    ipcMain.handle('indexer:getSymbols', async (_, filePath: string) => {
      return await this.projectIndexer.getSymbols(filePath);
    });

    // Rules Engine Operations
    ipcMain.handle('rules:load', async (_, projectPath: string) => {
      return await this.rulesEngine.loadRules(projectPath);
    });

    ipcMain.handle('rules:apply', async (_, context: any) => {
      return await this.rulesEngine.apply(context);
    });

    ipcMain.handle('rules:validate', async (_, rule: any) => {
      return await this.rulesEngine.validate(rule);
    });

    // Plugin Manager Operations
    ipcMain.handle('plugins:list', async () => {
      return await this.pluginManager.listPlugins();
    });

    ipcMain.handle('plugins:install', async (_, pluginId: string) => {
      return await this.pluginManager.installPlugin(pluginId);
    });

    ipcMain.handle('plugins:uninstall', async (_, pluginId: string) => {
      return await this.pluginManager.uninstallPlugin(pluginId);
    });

    ipcMain.handle('plugins:enable', async (_, pluginId: string) => {
      return await this.pluginManager.enablePlugin(pluginId);
    });

    ipcMain.handle('plugins:disable', async (_, pluginId: string) => {
      return await this.pluginManager.disablePlugin(pluginId);
    });

    // Dialog Operations
    ipcMain.handle('dialog:showOpenDialog', async (_, options: any) => {
      const result = await dialog.showOpenDialog(options);
      return result;
    });

    ipcMain.handle('dialog:showSaveDialog', async (_, options: any) => {
      const result = await dialog.showSaveDialog(options);
      return result;
    });

    ipcMain.handle('dialog:showMessageBox', async (_, options: any) => {
      const result = await dialog.showMessageBox(options);
      return result;
    });

    // Window Operations
    ipcMain.handle('window:minimize', async () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) window.minimize();
    });

    ipcMain.handle('window:maximize', async () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
      }
    });

    ipcMain.handle('window:close', async () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) window.close();
    });

    ipcMain.handle('window:toggleFullScreen', async () => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        window.setFullScreen(!window.isFullScreen());
      }
    });

    ipcMain.handle('window:setAlwaysOnTop', async (_, flag: boolean) => {
      const window = BrowserWindow.getFocusedWindow();
      if (window) window.setAlwaysOnTop(flag);
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

  private createMainWindow() {
    const mainWindow = this.windowManager.createMainWindow();
    
    // Load the app
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:9000');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }
  }

  private setupMenu() {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New File',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.sendToRenderer('menu:newFile');
            }
          },
          {
            label: 'Open File',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.sendToRenderer('menu:openFile');
            }
          },
          {
            label: 'Open Folder',
            accelerator: 'CmdOrCtrl+Shift+O',
            click: () => {
              this.sendToRenderer('menu:openFolder');
            }
          },
          { type: 'separator' },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.sendToRenderer('menu:save');
            }
          },
          {
            label: 'Save As',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => {
              this.sendToRenderer('menu:saveAs');
            }
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'CmdOrCtrl+,',
            click: () => {
              this.sendToRenderer('menu:preferences');
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
          { role: 'selectall' },
          { type: 'separator' },
          {
            label: 'Find',
            accelerator: 'CmdOrCtrl+F',
            click: () => {
              this.sendToRenderer('menu:find');
            }
          },
          {
            label: 'Replace',
            accelerator: 'CmdOrCtrl+H',
            click: () => {
              this.sendToRenderer('menu:replace');
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
          { role: 'togglefullscreen' },
          { type: 'separator' },
          {
            label: 'Explorer',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => {
              this.sendToRenderer('menu:toggleExplorer');
            }
          },
          {
            label: 'Search',
            accelerator: 'CmdOrCtrl+Shift+F',
            click: () => {
              this.sendToRenderer('menu:toggleSearch');
            }
          },
          {
            label: 'Source Control',
            accelerator: 'CmdOrCtrl+Shift+G',
            click: () => {
              this.sendToRenderer('menu:toggleSourceControl');
            }
          },
          {
            label: 'Terminal',
            accelerator: 'CmdOrCtrl+`',
            click: () => {
              this.sendToRenderer('menu:toggleTerminal');
            }
          }
        ]
      },
      {
        label: 'AI',
        submenu: [
          {
            label: 'Chat with AI',
            accelerator: 'CmdOrCtrl+Shift+L',
            click: () => {
              this.sendToRenderer('menu:aiChat');
            }
          },
          {
            label: 'Code Completion',
            accelerator: 'Tab',
            click: () => {
              this.sendToRenderer('menu:aiCompletion');
            }
          },
          {
            label: 'Explain Code',
            accelerator: 'CmdOrCtrl+Shift+E',
            click: () => {
              this.sendToRenderer('menu:aiExplain');
            }
          },
          {
            label: 'Refactor Code',
            accelerator: 'CmdOrCtrl+Shift+R',
            click: () => {
              this.sendToRenderer('menu:aiRefactor');
            }
          },
          {
            label: 'Generate Tests',
            accelerator: 'CmdOrCtrl+Shift+T',
            click: () => {
              this.sendToRenderer('menu:aiGenerateTests');
            }
          },
          {
            label: 'Fix Errors',
            accelerator: 'CmdOrCtrl+Shift+F',
            click: () => {
              this.sendToRenderer('menu:aiFixErrors');
            }
          }
        ]
      },
      {
        label: 'Terminal',
        submenu: [
          {
            label: 'New Terminal',
            accelerator: 'CmdOrCtrl+Shift+`',
            click: () => {
              this.sendToRenderer('menu:newTerminal');
            }
          },
          {
            label: 'Split Terminal',
            accelerator: 'CmdOrCtrl+\\',
            click: () => {
              this.sendToRenderer('menu:splitTerminal');
            }
          },
          {
            label: 'Kill Terminal',
            accelerator: 'CmdOrCtrl+Shift+K',
            click: () => {
              this.sendToRenderer('menu:killTerminal');
            }
          }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => {
              this.sendToRenderer('menu:about');
            }
          },
          {
            label: 'Documentation',
            click: () => {
              shell.openExternal('https://puter.com/docs');
            }
          },
          {
            label: 'Report Issue',
            click: () => {
              shell.openExternal('https://github.com/puter-ai/puter-cursor/issues');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template as any);
    Menu.setApplicationMenu(menu);
  }

  private sendToRenderer(event: string, ...args: any[]) {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.webContents.send(event, ...args);
    }
  }

  private startBackgroundServices() {
    // Start background services
    this.projectIndexer.startIndexing();
    this.languageServerService.startAll();
    this.telemetryService.start();
  }

  private setupAutoUpdater() {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
      this.sendToRenderer('updater:update-available');
    });

    autoUpdater.on('update-downloaded', () => {
      this.sendToRenderer('updater:update-downloaded');
    });
  }
}

// Initialize the app
const puterCursorApp = new PuterCursorApp();

// Export for testing
export { PuterCursorApp };