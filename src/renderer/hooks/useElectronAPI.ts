import { useEffect, useState } from 'react';

interface ElectronAPI {
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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export const useElectronAPI = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    // Check if we're running in Electron
    const checkElectron = () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        setIsElectron(true);
        setElectronAPI(window.electronAPI);
      } else {
        setIsElectron(false);
        // Create mock API for web/development
        const mockAPI: ElectronAPI = {
          fs: {
            readFile: async () => ({ success: false, error: 'Not in Electron' }),
            writeFile: async () => ({ success: false, error: 'Not in Electron' }),
            createFile: async () => ({ success: false, error: 'Not in Electron' }),
            deleteFile: async () => ({ success: false, error: 'Not in Electron' }),
            readDirectory: async () => ({ success: false, error: 'Not in Electron' }),
            exists: async () => false,
            watchFile: async () => ({ success: false, error: 'Not in Electron' }),
            unwatchFile: async () => ({ success: false, error: 'Not in Electron' }),
            onFileChanged: () => {},
            removeFileChangedListener: () => {},
          },
          ai: {
            chat: async () => ({ success: false, error: 'Not in Electron' }),
            complete: async () => ({ success: false, error: 'Not in Electron' }),
            analyze: async () => ({ success: false, error: 'Not in Electron' }),
            refactor: async () => ({ success: false, error: 'Not in Electron' }),
            generateTests: async () => ({ success: false, error: 'Not in Electron' }),
            fixErrors: async () => ({ success: false, error: 'Not in Electron' }),
            optimizeCode: async () => ({ success: false, error: 'Not in Electron' }),
          },
          terminal: {
            create: async () => ({ success: false, error: 'Not in Electron' }),
            write: async () => ({ success: false, error: 'Not in Electron' }),
            kill: async () => ({ success: false, error: 'Not in Electron' }),
            runCommand: async () => ({ success: false, error: 'Not in Electron' }),
            onOutput: () => {},
            onClosed: () => {},
            removeOutputListener: () => {},
            removeClosedListener: () => {},
          },
          git: {
            status: async () => ({ success: false, error: 'Not in Electron' }),
            diff: async () => ({ success: false, error: 'Not in Electron' }),
            commit: async () => ({ success: false, error: 'Not in Electron' }),
            branch: async () => ({ success: false, error: 'Not in Electron' }),
            checkout: async () => ({ success: false, error: 'Not in Electron' }),
            pull: async () => ({ success: false, error: 'Not in Electron' }),
            push: async () => ({ success: false, error: 'Not in Electron' }),
          },
          settings: {
            get: async () => null,
            set: async () => ({ success: false, error: 'Not in Electron' }),
            getAll: async () => ({}),
            reset: async () => ({ success: false, error: 'Not in Electron' }),
          },
          dialog: {
            showOpenDialog: async () => ({ canceled: true }),
            showSaveDialog: async () => ({ canceled: true }),
            showMessageBox: async () => ({ response: 0 }),
          },
          window: {
            minimize: async () => {},
            maximize: async () => {},
            close: async () => {},
            toggleFullScreen: async () => {},
          },
          app: {
            getVersion: async () => '1.0.0',
            getPath: async () => '',
            restart: async () => {},
            quit: async () => {},
          },
          menu: {
            onNewFile: () => {},
            onOpenFile: () => {},
            onOpenFolder: () => {},
            onSave: () => {},
            onSaveAs: () => {},
            onFind: () => {},
            onReplace: () => {},
            onAiChat: () => {},
            onAiExplain: () => {},
            onAiRefactor: () => {},
            onAiGenerateTests: () => {},
            onAiFixErrors: () => {},
            onAiOptimize: () => {},
            onToggleExplorer: () => {},
            onToggleTerminal: () => {},
            onAbout: () => {},
            removeAllListeners: () => {},
          },
          shortcuts: {
            onAiChat: () => {},
            onAiExplain: () => {},
            onAiRefactor: () => {},
            onAiGenerateTests: () => {},
            onToggleTerminal: () => {},
            removeAllListeners: () => {},
          },
        };
        setElectronAPI(mockAPI);
      }
    };

    checkElectron();

    // Check again after a short delay in case the API takes time to load
    const timer = setTimeout(checkElectron, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    isElectron,
    electronAPI: electronAPI!,
  };
};