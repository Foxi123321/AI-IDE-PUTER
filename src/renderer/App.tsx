import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from 'react-resizable-panels';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-hot-toast';

// Components
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { AIChat } from './components/AIChat';
import { FileExplorer } from './components/FileExplorer';
import { Search } from './components/Search';
import { SourceControl } from './components/SourceControl';
import { Extensions } from './components/Extensions';
import { Settings } from './components/Settings';
import { About } from './components/About';
import { CommandPalette } from './components/CommandPalette';

// Hooks
import { useElectronAPI } from './hooks/useElectronAPI';
import { useAppStore } from './store/appStore';
import { useEditorStore } from './store/editorStore';
import { useTerminalStore } from './store/terminalStore';
import { useAIStore } from './store/aiStore';
import { useFileStore } from './store/fileStore';

// Types
import { FileItem, EditorTab, TerminalTab, AIMessage, AppTheme } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Stores
  const {
    currentWorkspace,
    sidebarVisible,
    terminalVisible,
    theme,
    setTheme,
    setSidebarVisible,
    setTerminalVisible,
    setCurrentWorkspace,
    sidebarPanel,
    setSidebarPanel
  } = useAppStore();

  const {
    openTabs,
    activeTab,
    setActiveTab,
    openFile,
    closeFile,
    saveFile,
    saveAllFiles
  } = useEditorStore();

  const {
    terminals,
    activeTerminal,
    createTerminal,
    closeTerminal,
    writeToTerminal
  } = useTerminalStore();

  const {
    messages,
    isProcessing,
    sendMessage,
    clearMessages
  } = useAIStore();

  const {
    files,
    currentFile,
    setCurrentFile,
    refreshFiles
  } = useFileStore();

  // Electron API
  const { electronAPI } = useElectronAPI();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load settings
        const settings = await electronAPI.settings.getAll();
        if (settings.theme) {
          setTheme(settings.theme);
        }
        if (settings.workspace) {
          setCurrentWorkspace(settings.workspace);
        }

        // Setup menu listeners
        electronAPI.menu.onNewFile(() => handleNewFile());
        electronAPI.menu.onOpenFile(() => handleOpenFile());
        electronAPI.menu.onOpenFolder(() => handleOpenFolder());
        electronAPI.menu.onSave(() => handleSave());
        electronAPI.menu.onSaveAs(() => handleSaveAs());
        electronAPI.menu.onFind(() => handleFind());
        electronAPI.menu.onReplace(() => handleReplace());
        electronAPI.menu.onAiChat(() => setAiChatOpen(true));
        electronAPI.menu.onAiExplain(() => handleAiExplain());
        electronAPI.menu.onAiRefactor(() => handleAiRefactor());
        electronAPI.menu.onAiGenerateTests(() => handleAiGenerateTests());
        electronAPI.menu.onAiFixErrors(() => handleAiFixErrors());
        electronAPI.menu.onAiOptimize(() => handleAiOptimize());
        electronAPI.menu.onToggleExplorer(() => handleToggleExplorer());
        electronAPI.menu.onToggleTerminal(() => handleToggleTerminal());
        electronAPI.menu.onAbout(() => setAboutOpen(true));

        // Setup shortcut listeners
        electronAPI.shortcuts.onAiChat(() => setAiChatOpen(true));
        electronAPI.shortcuts.onAiExplain(() => handleAiExplain());
        electronAPI.shortcuts.onAiRefactor(() => handleAiRefactor());
        electronAPI.shortcuts.onAiGenerateTests(() => handleAiGenerateTests());
        electronAPI.shortcuts.onToggleTerminal(() => handleToggleTerminal());

        setIsLoading(false);
        toast.success('Puter Cursor AI initialized successfully');
      } catch (error) {
        console.error('Failed to initialize app:', error);
        toast.error('Failed to initialize application');
        setIsLoading(false);
      }
    };

    initializeApp();

    // Cleanup
    return () => {
      electronAPI.menu.removeAllListeners();
      electronAPI.shortcuts.removeAllListeners();
    };
  }, []);

  // Hotkeys
  useHotkeys('ctrl+n, cmd+n', () => handleNewFile());
  useHotkeys('ctrl+o, cmd+o', () => handleOpenFile());
  useHotkeys('ctrl+shift+o, cmd+shift+o', () => handleOpenFolder());
  useHotkeys('ctrl+s, cmd+s', () => handleSave());
  useHotkeys('ctrl+shift+s, cmd+shift+s', () => handleSaveAs());
  useHotkeys('ctrl+f, cmd+f', () => handleFind());
  useHotkeys('ctrl+h, cmd+h', () => handleReplace());
  useHotkeys('ctrl+shift+p, cmd+shift+p', () => setCommandPaletteOpen(true));
  useHotkeys('ctrl+shift+l, cmd+shift+l', () => setAiChatOpen(true));
  useHotkeys('ctrl+shift+e, cmd+shift+e', () => handleAiExplain());
  useHotkeys('ctrl+shift+r, cmd+shift+r', () => handleAiRefactor());
  useHotkeys('ctrl+shift+t, cmd+shift+t', () => handleAiGenerateTests());
  useHotkeys('ctrl+`, cmd+`', () => handleToggleTerminal());
  useHotkeys('ctrl+shift+`, cmd+shift+`', () => handleNewTerminal());
  useHotkeys('ctrl+w, cmd+w', () => handleCloseTab());
  useHotkeys('ctrl+tab, cmd+tab', () => handleNextTab());
  useHotkeys('ctrl+shift+tab, cmd+shift+tab', () => handlePrevTab());
  useHotkeys('escape', () => {
    setCommandPaletteOpen(false);
    setAiChatOpen(false);
    setSettingsOpen(false);
    setAboutOpen(false);
  });

  // Event handlers
  const handleNewFile = async () => {
    const newFile = {
      id: `untitled-${Date.now()}`,
      name: 'Untitled',
      path: '',
      content: '',
      language: 'plaintext',
      isDirty: false,
      isUntitled: true
    };
    openFile(newFile);
  };

  const handleOpenFile = async () => {
    try {
      const result = await electronAPI.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text Files', extensions: ['txt', 'md', 'json', 'xml', 'csv'] },
          { name: 'Code Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift'] },
          { name: 'Web Files', extensions: ['html', 'css', 'scss', 'sass', 'less'] },
          { name: 'Config Files', extensions: ['json', 'yaml', 'yml', 'toml', 'ini', 'env'] }
        ]
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileContent = await electronAPI.fs.readFile(filePath);
        
        if (fileContent.success) {
          const fileName = filePath.split('/').pop() || 'Unknown';
          const language = getLanguageFromExtension(fileName);
          
          const file = {
            id: filePath,
            name: fileName,
            path: filePath,
            content: fileContent.content,
            language,
            isDirty: false,
            isUntitled: false
          };
          
          openFile(file);
        } else {
          toast.error(`Failed to open file: ${fileContent.error}`);
        }
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      toast.error('Failed to open file');
    }
  };

  const handleOpenFolder = async () => {
    try {
      const result = await electronAPI.dialog.showOpenDialog({
        properties: ['openDirectory']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        setCurrentWorkspace(folderPath);
        await electronAPI.settings.set('workspace', folderPath);
        refreshFiles();
        toast.success(`Opened workspace: ${folderPath}`);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
      toast.error('Failed to open folder');
    }
  };

  const handleSave = async () => {
    if (activeTab) {
      try {
        const result = await saveFile(activeTab.id);
        if (result.success) {
          toast.success('File saved successfully');
        } else {
          toast.error(`Failed to save file: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to save file:', error);
        toast.error('Failed to save file');
      }
    }
  };

  const handleSaveAs = async () => {
    if (activeTab) {
      try {
        const result = await electronAPI.dialog.showSaveDialog({
          defaultPath: activeTab.name,
          filters: [
            { name: 'All Files', extensions: ['*'] },
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'JavaScript', extensions: ['js'] },
            { name: 'TypeScript', extensions: ['ts'] },
            { name: 'Python', extensions: ['py'] },
            { name: 'JSON', extensions: ['json'] },
            { name: 'Markdown', extensions: ['md'] }
          ]
        });

        if (!result.canceled && result.filePath) {
          const saveResult = await electronAPI.fs.writeFile(result.filePath, activeTab.content);
          if (saveResult.success) {
            toast.success('File saved successfully');
          } else {
            toast.error(`Failed to save file: ${saveResult.error}`);
          }
        }
      } catch (error) {
        console.error('Failed to save file:', error);
        toast.error('Failed to save file');
      }
    }
  };

  const handleFind = () => {
    // Implement find functionality
    toast.info('Find functionality not yet implemented');
  };

  const handleReplace = () => {
    // Implement replace functionality
    toast.info('Replace functionality not yet implemented');
  };

  const handleAiExplain = async () => {
    if (activeTab) {
      try {
        const result = await electronAPI.ai.analyze(activeTab.content, activeTab.language);
        if (result.success) {
          setAiChatOpen(true);
          sendMessage(`Explain this code:\n\n\`\`\`${activeTab.language}\n${activeTab.content}\n\`\`\``);
        } else {
          toast.error(`Failed to analyze code: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to explain code:', error);
        toast.error('Failed to explain code');
      }
    }
  };

  const handleAiRefactor = async () => {
    if (activeTab) {
      try {
        const result = await electronAPI.ai.refactor(activeTab.content, 'Refactor this code for better readability and performance');
        if (result.success) {
          setAiChatOpen(true);
          sendMessage(`Refactor this code:\n\n\`\`\`${activeTab.language}\n${activeTab.content}\n\`\`\``);
        } else {
          toast.error(`Failed to refactor code: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to refactor code:', error);
        toast.error('Failed to refactor code');
      }
    }
  };

  const handleAiGenerateTests = async () => {
    if (activeTab) {
      try {
        const result = await electronAPI.ai.generateTests(activeTab.content, activeTab.language);
        if (result.success) {
          setAiChatOpen(true);
          sendMessage(`Generate tests for this code:\n\n\`\`\`${activeTab.language}\n${activeTab.content}\n\`\`\``);
        } else {
          toast.error(`Failed to generate tests: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to generate tests:', error);
        toast.error('Failed to generate tests');
      }
    }
  };

  const handleAiFixErrors = async () => {
    if (activeTab) {
      try {
        const result = await electronAPI.ai.fixErrors(activeTab.content, []);
        if (result.success) {
          setAiChatOpen(true);
          sendMessage(`Fix errors in this code:\n\n\`\`\`${activeTab.language}\n${activeTab.content}\n\`\`\``);
        } else {
          toast.error(`Failed to fix errors: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to fix errors:', error);
        toast.error('Failed to fix errors');
      }
    }
  };

  const handleAiOptimize = async () => {
    if (activeTab) {
      try {
        const result = await electronAPI.ai.optimizeCode(activeTab.content, activeTab.language);
        if (result.success) {
          setAiChatOpen(true);
          sendMessage(`Optimize this code:\n\n\`\`\`${activeTab.language}\n${activeTab.content}\n\`\`\``);
        } else {
          toast.error(`Failed to optimize code: ${result.error}`);
        }
      } catch (error) {
        console.error('Failed to optimize code:', error);
        toast.error('Failed to optimize code');
      }
    }
  };

  const handleToggleExplorer = () => {
    if (sidebarPanel === 'explorer') {
      setSidebarVisible(!sidebarVisible);
    } else {
      setSidebarPanel('explorer');
      setSidebarVisible(true);
    }
  };

  const handleToggleTerminal = () => {
    setTerminalVisible(!terminalVisible);
  };

  const handleNewTerminal = () => {
    createTerminal();
  };

  const handleCloseTab = () => {
    if (activeTab) {
      closeFile(activeTab.id);
    }
  };

  const handleNextTab = () => {
    const currentIndex = openTabs.findIndex(tab => tab.id === activeTab?.id);
    if (currentIndex < openTabs.length - 1) {
      setActiveTab(openTabs[currentIndex + 1].id);
    }
  };

  const handlePrevTab = () => {
    const currentIndex = openTabs.findIndex(tab => tab.id === activeTab?.id);
    if (currentIndex > 0) {
      setActiveTab(openTabs[currentIndex - 1].id);
    }
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'zsh': 'shell',
      'fish': 'shell',
      'ps1': 'powershell',
      'dockerfile': 'dockerfile',
      'gitignore': 'gitignore',
      'env': 'dotenv',
      'ini': 'ini',
      'toml': 'toml',
      'vue': 'vue',
      'svelte': 'svelte',
      'r': 'r',
      'dart': 'dart',
      'kotlin': 'kotlin',
      'scala': 'scala',
      'clj': 'clojure',
      'elm': 'elm',
      'haskell': 'haskell',
      'lua': 'lua',
      'perl': 'perl',
      'tex': 'latex',
      'dockerfile': 'dockerfile'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading Puter Cursor AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Title Bar */}
      <TitleBar />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="w-80 border-r border-gray-700 bg-gray-800">
            <Sidebar />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel defaultSize={terminalVisible ? 70 : 100} minSize={30}>
              <Editor />
            </ResizablePanel>

            {/* Terminal */}
            {terminalVisible && (
              <>
                <ResizableHandle className="h-1 bg-gray-700 hover:bg-gray-600 cursor-row-resize" />
                <ResizablePanel defaultSize={30} minSize={20}>
                  <Terminal />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Modals */}
      {commandPaletteOpen && (
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}

      {aiChatOpen && (
        <AIChat
          open={aiChatOpen}
          onClose={() => setAiChatOpen(false)}
        />
      )}

      {settingsOpen && (
        <Settings
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {aboutOpen && (
        <About
          open={aboutOpen}
          onClose={() => setAboutOpen(false)}
        />
      )}
    </div>
  );
};

export default App;