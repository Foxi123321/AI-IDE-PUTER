import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File System API
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    createFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:createFile', filePath, content),
    deleteFile: (filePath: string) => ipcRenderer.invoke('fs:deleteFile', filePath),
    readDirectory: (dirPath: string) => ipcRenderer.invoke('fs:readDirectory', dirPath),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    watchFile: (filePath: string) => ipcRenderer.invoke('fs:watchFile', filePath),
    unwatchFile: (filePath: string) => ipcRenderer.invoke('fs:unwatchFile', filePath),
    onFileChanged: (callback: (event: any, data: any) => void) => {
      ipcRenderer.on('file-changed', callback);
    },
    removeFileChangedListener: (callback: (event: any, data: any) => void) => {
      ipcRenderer.removeListener('file-changed', callback);
    }
  },

  // AI API
  ai: {
    chat: (message: string, context: any) => ipcRenderer.invoke('ai:chat', message, context),
    complete: (prompt: string, context: any) => ipcRenderer.invoke('ai:complete', prompt, context),
    analyze: (code: string, language: string) => ipcRenderer.invoke('ai:analyze', code, language),
    refactor: (code: string, instructions: string) => ipcRenderer.invoke('ai:refactor', code, instructions),
    generateTests: (code: string, language: string) => ipcRenderer.invoke('ai:generateTests', code, language),
    fixErrors: (code: string, errors: any[]) => ipcRenderer.invoke('ai:fixErrors', code, errors),
    optimizeCode: (code: string, language: string) => ipcRenderer.invoke('ai:optimizeCode', code, language)
  },

  // Terminal API
  terminal: {
    create: (options: any) => ipcRenderer.invoke('terminal:create', options),
    write: (terminalId: string, data: string) => ipcRenderer.invoke('terminal:write', terminalId, data),
    kill: (terminalId: string) => ipcRenderer.invoke('terminal:kill', terminalId),
    runCommand: (command: string, options: any) => ipcRenderer.invoke('terminal:runCommand', command, options),
    onOutput: (callback: (event: any, data: any) => void) => {
      ipcRenderer.on('terminal-output', callback);
    },
    onClosed: (callback: (event: any, data: any) => void) => {
      ipcRenderer.on('terminal-closed', callback);
    },
    removeOutputListener: (callback: (event: any, data: any) => void) => {
      ipcRenderer.removeListener('terminal-output', callback);
    },
    removeClosedListener: (callback: (event: any, data: any) => void) => {
      ipcRenderer.removeListener('terminal-closed', callback);
    }
  },

  // Git API
  git: {
    status: (repoPath: string) => ipcRenderer.invoke('git:status', repoPath),
    diff: (repoPath: string, file?: string) => ipcRenderer.invoke('git:diff', repoPath, file),
    commit: (repoPath: string, message: string, files: string[]) => ipcRenderer.invoke('git:commit', repoPath, message, files),
    branch: (repoPath: string, branchName?: string) => ipcRenderer.invoke('git:branch', repoPath, branchName),
    checkout: (repoPath: string, branch: string) => ipcRenderer.invoke('git:checkout', repoPath, branch),
    pull: (repoPath: string) => ipcRenderer.invoke('git:pull', repoPath),
    push: (repoPath: string) => ipcRenderer.invoke('git:push', repoPath)
  },

  // Settings API
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    reset: (key?: string) => ipcRenderer.invoke('settings:reset', key)
  },

  // Dialog API
  dialog: {
    showOpenDialog: (options: any) => ipcRenderer.invoke('dialog:showOpenDialog', options),
    showSaveDialog: (options: any) => ipcRenderer.invoke('dialog:showSaveDialog', options),
    showMessageBox: (options: any) => ipcRenderer.invoke('dialog:showMessageBox', options)
  },

  // Window API
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    toggleFullScreen: () => ipcRenderer.invoke('window:toggleFullScreen')
  },

  // App API
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
    restart: () => ipcRenderer.invoke('app:restart'),
    quit: () => ipcRenderer.invoke('app:quit')
  },

  // Menu Event Listeners
  menu: {
    onNewFile: (callback: () => void) => {
      ipcRenderer.on('menu:newFile', callback);
    },
    onOpenFile: (callback: () => void) => {
      ipcRenderer.on('menu:openFile', callback);
    },
    onOpenFolder: (callback: () => void) => {
      ipcRenderer.on('menu:openFolder', callback);
    },
    onSave: (callback: () => void) => {
      ipcRenderer.on('menu:save', callback);
    },
    onSaveAs: (callback: () => void) => {
      ipcRenderer.on('menu:saveAs', callback);
    },
    onFind: (callback: () => void) => {
      ipcRenderer.on('menu:find', callback);
    },
    onReplace: (callback: () => void) => {
      ipcRenderer.on('menu:replace', callback);
    },
    onAiChat: (callback: () => void) => {
      ipcRenderer.on('menu:aiChat', callback);
    },
    onAiExplain: (callback: () => void) => {
      ipcRenderer.on('menu:aiExplain', callback);
    },
    onAiRefactor: (callback: () => void) => {
      ipcRenderer.on('menu:aiRefactor', callback);
    },
    onAiGenerateTests: (callback: () => void) => {
      ipcRenderer.on('menu:aiGenerateTests', callback);
    },
    onAiFixErrors: (callback: () => void) => {
      ipcRenderer.on('menu:aiFixErrors', callback);
    },
    onAiOptimize: (callback: () => void) => {
      ipcRenderer.on('menu:aiOptimize', callback);
    },
    onToggleExplorer: (callback: () => void) => {
      ipcRenderer.on('menu:toggleExplorer', callback);
    },
    onToggleTerminal: (callback: () => void) => {
      ipcRenderer.on('menu:toggleTerminal', callback);
    },
    onAbout: (callback: () => void) => {
      ipcRenderer.on('menu:about', callback);
    },
    // Remove listeners
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('menu:newFile');
      ipcRenderer.removeAllListeners('menu:openFile');
      ipcRenderer.removeAllListeners('menu:openFolder');
      ipcRenderer.removeAllListeners('menu:save');
      ipcRenderer.removeAllListeners('menu:saveAs');
      ipcRenderer.removeAllListeners('menu:find');
      ipcRenderer.removeAllListeners('menu:replace');
      ipcRenderer.removeAllListeners('menu:aiChat');
      ipcRenderer.removeAllListeners('menu:aiExplain');
      ipcRenderer.removeAllListeners('menu:aiRefactor');
      ipcRenderer.removeAllListeners('menu:aiGenerateTests');
      ipcRenderer.removeAllListeners('menu:aiFixErrors');
      ipcRenderer.removeAllListeners('menu:aiOptimize');
      ipcRenderer.removeAllListeners('menu:toggleExplorer');
      ipcRenderer.removeAllListeners('menu:toggleTerminal');
      ipcRenderer.removeAllListeners('menu:about');
    }
  },

  // Shortcut Event Listeners
  shortcuts: {
    onAiChat: (callback: () => void) => {
      ipcRenderer.on('shortcut:aiChat', callback);
    },
    onAiExplain: (callback: () => void) => {
      ipcRenderer.on('shortcut:aiExplain', callback);
    },
    onAiRefactor: (callback: () => void) => {
      ipcRenderer.on('shortcut:aiRefactor', callback);
    },
    onAiGenerateTests: (callback: () => void) => {
      ipcRenderer.on('shortcut:aiGenerateTests', callback);
    },
    onToggleTerminal: (callback: () => void) => {
      ipcRenderer.on('shortcut:toggleTerminal', callback);
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('shortcut:aiChat');
      ipcRenderer.removeAllListeners('shortcut:aiExplain');
      ipcRenderer.removeAllListeners('shortcut:aiRefactor');
      ipcRenderer.removeAllListeners('shortcut:aiGenerateTests');
      ipcRenderer.removeAllListeners('shortcut:toggleTerminal');
    }
  }
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      fs: {
        readFile: (filePath: string) => Promise<any>;
        writeFile: (filePath: string, content: string) => Promise<any>;
        createFile: (filePath: string, content: string) => Promise<any>;
        deleteFile: (filePath: string) => Promise<any>;
        readDirectory: (dirPath: string) => Promise<any>;
        exists: (filePath: string) => Promise<boolean>;
        watchFile: (filePath: string) => Promise<any>;
        unwatchFile: (filePath: string) => Promise<any>;
        onFileChanged: (callback: (event: any, data: any) => void) => void;
        removeFileChangedListener: (callback: (event: any, data: any) => void) => void;
      };
      ai: {
        chat: (message: string, context: any) => Promise<any>;
        complete: (prompt: string, context: any) => Promise<any>;
        analyze: (code: string, language: string) => Promise<any>;
        refactor: (code: string, instructions: string) => Promise<any>;
        generateTests: (code: string, language: string) => Promise<any>;
        fixErrors: (code: string, errors: any[]) => Promise<any>;
        optimizeCode: (code: string, language: string) => Promise<any>;
      };
      terminal: {
        create: (options: any) => Promise<any>;
        write: (terminalId: string, data: string) => Promise<any>;
        kill: (terminalId: string) => Promise<any>;
        runCommand: (command: string, options: any) => Promise<any>;
        onOutput: (callback: (event: any, data: any) => void) => void;
        onClosed: (callback: (event: any, data: any) => void) => void;
        removeOutputListener: (callback: (event: any, data: any) => void) => void;
        removeClosedListener: (callback: (event: any, data: any) => void) => void;
      };
      git: {
        status: (repoPath: string) => Promise<any>;
        diff: (repoPath: string, file?: string) => Promise<any>;
        commit: (repoPath: string, message: string, files: string[]) => Promise<any>;
        branch: (repoPath: string, branchName?: string) => Promise<any>;
        checkout: (repoPath: string, branch: string) => Promise<any>;
        pull: (repoPath: string) => Promise<any>;
        push: (repoPath: string) => Promise<any>;
      };
      settings: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<any>;
        getAll: () => Promise<any>;
        reset: (key?: string) => Promise<any>;
      };
      dialog: {
        showOpenDialog: (options: any) => Promise<any>;
        showSaveDialog: (options: any) => Promise<any>;
        showMessageBox: (options: any) => Promise<any>;
      };
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        toggleFullScreen: () => Promise<void>;
      };
      app: {
        getVersion: () => Promise<string>;
        getPath: (name: string) => Promise<string>;
        restart: () => Promise<void>;
        quit: () => Promise<void>;
      };
      menu: {
        onNewFile: (callback: () => void) => void;
        onOpenFile: (callback: () => void) => void;
        onOpenFolder: (callback: () => void) => void;
        onSave: (callback: () => void) => void;
        onSaveAs: (callback: () => void) => void;
        onFind: (callback: () => void) => void;
        onReplace: (callback: () => void) => void;
        onAiChat: (callback: () => void) => void;
        onAiExplain: (callback: () => void) => void;
        onAiRefactor: (callback: () => void) => void;
        onAiGenerateTests: (callback: () => void) => void;
        onAiFixErrors: (callback: () => void) => void;
        onAiOptimize: (callback: () => void) => void;
        onToggleExplorer: (callback: () => void) => void;
        onToggleTerminal: (callback: () => void) => void;
        onAbout: (callback: () => void) => void;
        removeAllListeners: () => void;
      };
      shortcuts: {
        onAiChat: (callback: () => void) => void;
        onAiExplain: (callback: () => void) => void;
        onAiRefactor: (callback: () => void) => void;
        onAiGenerateTests: (callback: () => void) => void;
        onToggleTerminal: (callback: () => void) => void;
        removeAllListeners: () => void;
      };
    };
  }
}

export {};