import React, { useState, useEffect, useCallback } from 'react';
import { PuterAIService } from '../services/PuterAIService';
import { PuterAIConfig, WorkspaceFile, ChatSession, EditorContext } from '../types';

// Component imports (will be created next)
import Titlebar from '../components/Titlebar';
import Sidebar from '../components/Sidebar';
import EditorArea from '../components/EditorArea';
import ChatPanel from '../components/ChatPanel';
import StatusBar from '../components/StatusBar';

interface AppState {
  currentWorkspace: string | null;
  openFiles: WorkspaceFile[];
  activeFileIndex: number;
  chatSessions: ChatSession[];
  activeChatSession: string | null;
  puterAIService: PuterAIService | null;
  isAIConnected: boolean;
  sidebarVisible: boolean;
  chatPanelVisible: boolean;
  chatPanelWidth: number;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentWorkspace: null,
    openFiles: [],
    activeFileIndex: -1,
    chatSessions: [],
    activeChatSession: null,
    puterAIService: null,
    isAIConnected: false,
    sidebarVisible: true,
    chatPanelVisible: true,
    chatPanelWidth: 400,
  });

  // Initialize Puter AI Service
  useEffect(() => {
    const initializePuterAI = async () => {
      try {
        const config: PuterAIConfig = {
          model: 'gpt-4', // Default model, will be configurable
          temperature: 0.7,
          maxTokens: 2048,
        };

        const aiService = new PuterAIService(config);
        await aiService.initialize();
        
        const isConnected = await aiService.testConnection();

        setState(prev => ({
          ...prev,
          puterAIService: aiService,
          isAIConnected: isConnected,
        }));

        console.log('Puter AI Service initialized:', isConnected ? 'Connected' : 'Not connected');
      } catch (error) {
        console.error('Failed to initialize Puter AI Service:', error);
        setState(prev => ({
          ...prev,
          isAIConnected: false,
        }));
      }
    };

    initializePuterAI();
  }, []);

  // Handle file operations
  const handleOpenFile = useCallback(async (filePath: string) => {
    try {
      // Check if file is already open
      const existingIndex = state.openFiles.findIndex(file => file.path === filePath);
      if (existingIndex !== -1) {
        setState(prev => ({
          ...prev,
          activeFileIndex: existingIndex,
        }));
        return;
      }

      // TODO: Read file content via Electron IPC
      const content = '// File content will be loaded here\nconsole.log("Hello, World!");';
      
      const newFile: WorkspaceFile = {
        path: filePath,
        content,
        language: getLanguageFromExtension(filePath),
        isDirty: false,
      };

      setState(prev => ({
        ...prev,
        openFiles: [...prev.openFiles, newFile],
        activeFileIndex: prev.openFiles.length,
      }));
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, [state.openFiles]);

  const handleCloseFile = useCallback((index: number) => {
    setState(prev => {
      const newOpenFiles = prev.openFiles.filter((_, i) => i !== index);
      let newActiveIndex = prev.activeFileIndex;
      
      if (index === prev.activeFileIndex) {
        // Closing active file
        if (newOpenFiles.length === 0) {
          newActiveIndex = -1;
        } else if (index >= newOpenFiles.length) {
          newActiveIndex = newOpenFiles.length - 1;
        }
      } else if (index < prev.activeFileIndex) {
        newActiveIndex = prev.activeFileIndex - 1;
      }

      return {
        ...prev,
        openFiles: newOpenFiles,
        activeFileIndex: newActiveIndex,
      };
    });
  }, []);

  const handleFileContentChange = useCallback((index: number, content: string) => {
    setState(prev => ({
      ...prev,
      openFiles: prev.openFiles.map((file, i) => 
        i === index 
          ? { ...file, content, isDirty: true }
          : file
      ),
    }));
  }, []);

  // Handle AI chat
  const handleNewChatSession = useCallback(() => {
    const sessionId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      chatSessions: [...prev.chatSessions, newSession],
      activeChatSession: sessionId,
    }));
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!state.puterAIService || !state.activeChatSession) {
      return;
    }

    const sessionIndex = state.chatSessions.findIndex(
      session => session.id === state.activeChatSession
    );

    if (sessionIndex === -1) return;

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      chatSessions: prev.chatSessions.map((session, i) =>
        i === sessionIndex
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              updatedAt: new Date(),
            }
          : session
      ),
    }));

    try {
      // Get current editor context
      const activeFile = state.openFiles[state.activeFileIndex];
      const context: EditorContext | undefined = activeFile ? {
        filePath: activeFile.path,
        language: activeFile.language,
        content: activeFile.content,
        cursorPosition: { line: 1, column: 1 }, // TODO: Get actual cursor position
      } : undefined;

      // Send to AI
      const response = await state.puterAIService.complete({
        prompt: message,
        model: 'gpt-4',
        context,
      });

      // Add AI response
      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: response.content,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        chatSessions: prev.chatSessions.map((session, i) =>
          i === sessionIndex
            ? {
                ...session,
                messages: [...session.messages, aiMessage],
                updatedAt: new Date(),
              }
            : session
        ),
      }));
    } catch (error) {
      console.error('Failed to send message to AI:', error);
      
      // Add error message
      const errorMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: `Sorry, I encountered an error: ${(error as Error).message}`,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        chatSessions: prev.chatSessions.map((session, i) =>
          i === sessionIndex
            ? {
                ...session,
                messages: [...session.messages, errorMessage],
                updatedAt: new Date(),
              }
            : session
        ),
      }));
    }
  }, [state.puterAIService, state.activeChatSession, state.chatSessions, state.openFiles, state.activeFileIndex]);

  // Handle workspace operations
  const handleOpenWorkspace = useCallback(async (workspacePath: string) => {
    setState(prev => ({
      ...prev,
      currentWorkspace: workspacePath,
    }));
  }, []);

  // Layout operations
  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebarVisible: !prev.sidebarVisible,
    }));
  }, []);

  const toggleChatPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      chatPanelVisible: !prev.chatPanelVisible,
    }));
  }, []);

  // Get active chat session
  const activeChatSession = state.chatSessions.find(
    session => session.id === state.activeChatSession
  );

  return (
    <div className="flex flex-col h-screen bg-editor-bg text-editor-text">
      <Titlebar 
        title="Cursor AI Clone"
        isAIConnected={state.isAIConnected}
        onToggleSidebar={toggleSidebar}
        onToggleChatPanel={toggleChatPanel}
      />
      
      <div className="flex flex-1 min-h-0">
        {state.sidebarVisible && (
          <Sidebar
            currentWorkspace={state.currentWorkspace}
            onOpenFile={handleOpenFile}
            onOpenWorkspace={handleOpenWorkspace}
          />
        )}
        
        <div className="flex flex-1 min-h-0">
          <EditorArea
            openFiles={state.openFiles}
            activeFileIndex={state.activeFileIndex}
            onFileSelect={(index) => setState(prev => ({ ...prev, activeFileIndex: index }))}
            onFileClose={handleCloseFile}
            onFileContentChange={handleFileContentChange}
            aiService={state.puterAIService}
          />
          
          {state.chatPanelVisible && (
            <ChatPanel
              session={activeChatSession}
              allSessions={state.chatSessions}
              onNewSession={handleNewChatSession}
              onSelectSession={(sessionId) => setState(prev => ({ ...prev, activeChatSession: sessionId }))}
              onSendMessage={handleSendMessage}
              isAIConnected={state.isAIConnected}
              width={state.chatPanelWidth}
            />
          )}
        </div>
      </div>
      
      <StatusBar
        activeFile={state.openFiles[state.activeFileIndex]}
        isAIConnected={state.isAIConnected}
        aiModel={state.puterAIService ? 'Puter AI' : 'Not connected'}
      />
    </div>
  );
};

// Helper function to determine language from file extension
function getLanguageFromExtension(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'kt': 'kotlin',
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
    'sh': 'bash',
    'ps1': 'powershell',
    'dockerfile': 'dockerfile',
  };

  return languageMap[extension || ''] || 'plaintext';
}

export default App;