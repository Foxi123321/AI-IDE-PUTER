import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface EditorTab {
  id: string;
  name: string;
  path: string;
  content: string;
  originalContent: string;
  language: string;
  isDirty: boolean;
  isUntitled: boolean;
  cursorPosition: { line: number; column: number };
  scrollPosition: { top: number; left: number };
  selections: Array<{
    start: { line: number; column: number };
    end: { line: number; column: number };
  }>;
  foldedRegions: Array<{
    start: number;
    end: number;
  }>;
  bookmarks: Array<{
    line: number;
    column: number;
    label?: string;
  }>;
  breakpoints: Array<{
    line: number;
    condition?: string;
    hitCondition?: string;
  }>;
  lastModified: number;
  encoding: string;
  lineEnding: 'LF' | 'CRLF' | 'CR';
  indentSize: number;
  insertSpaces: boolean;
  trimAutoWhitespace: boolean;
  detectIndentation: boolean;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  renderWhitespace: boolean;
  renderControlCharacters: boolean;
  rulers: number[];
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  letterSpacing: number;
  lineHeight: number;
  tabCompletion: boolean;
  quickSuggestions: boolean;
  parameterHints: boolean;
  autoClosingBrackets: boolean;
  autoClosingQuotes: boolean;
  autoSurround: boolean;
  formatOnSave: boolean;
  formatOnType: boolean;
  formatOnPaste: boolean;
  codeActionsOnSave: boolean;
  lint: boolean;
  lintDelay: number;
  vim: boolean;
  emacs: boolean;
  readOnly: boolean;
  previewMode: boolean;
  sticky: boolean;
  pinned: boolean;
  temporary: boolean;
  gitStatus?: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
  gitConflict: boolean;
  problems: Array<{
    line: number;
    column: number;
    severity: 'error' | 'warning' | 'info' | 'hint';
    message: string;
    source: string;
    code?: string;
    quickFix?: boolean;
  }>;
  diagnostics: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    severity: 'error' | 'warning' | 'info' | 'hint';
    message: string;
    source: string;
    code?: string;
  }>;
  symbols: Array<{
    name: string;
    kind: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    containerName?: string;
  }>;
  outline: Array<{
    name: string;
    kind: string;
    line: number;
    column: number;
    children: any[];
  }>;
  references: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    uri: string;
  }>;
  definitions: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    uri: string;
  }>;
  typeDefinitions: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    uri: string;
  }>;
  implementations: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    uri: string;
  }>;
  hovers: Array<{
    line: number;
    column: number;
    content: string;
    language?: string;
  }>;
  codeActions: Array<{
    title: string;
    kind: string;
    edit?: any;
    command?: any;
    diagnostics?: any[];
  }>;
  completions: Array<{
    label: string;
    kind: string;
    detail?: string;
    documentation?: string;
    insertText?: string;
    filterText?: string;
    sortText?: string;
    preselect?: boolean;
    commitCharacters?: string[];
    additionalTextEdits?: any[];
    command?: any;
  }>;
  signatureHelp: {
    signatures: Array<{
      label: string;
      documentation?: string;
      parameters: Array<{
        label: string;
        documentation?: string;
      }>;
    }>;
    activeSignature: number;
    activeParameter: number;
  } | null;
  colorDecorators: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    color: string;
  }>;
  inlayHints: Array<{
    line: number;
    column: number;
    text: string;
    tooltip?: string;
    kind: 'type' | 'parameter' | 'other';
  }>;
  semanticTokens: Array<{
    line: number;
    column: number;
    length: number;
    tokenType: string;
    tokenModifiers: string[];
  }>;
  linkedEditing: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
  }>;
  documentHighlights: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    kind: 'text' | 'read' | 'write';
  }>;
  documentLinks: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    target: string;
    tooltip?: string;
  }>;
  codeLen: Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    command: string;
    title: string;
    arguments?: any[];
  }>;
}

interface EditorState {
  // Tabs
  openTabs: EditorTab[];
  activeTab: EditorTab | null;
  pinnedTabs: string[];
  tabGroups: Array<{
    id: string;
    name: string;
    tabs: string[];
    active: boolean;
  }>;

  // Tab management
  openFile: (file: Partial<EditorTab>) => void;
  closeFile: (id: string) => void;
  closeAllFiles: () => void;
  closeOtherFiles: (id: string) => void;
  closeFilesToRight: (id: string) => void;
  closeFilesToLeft: (id: string) => void;
  closeUnsavedFiles: () => void;
  setActiveTab: (id: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  pinTab: (id: string) => void;
  unpinTab: (id: string) => void;
  splitTab: (id: string, direction: 'horizontal' | 'vertical') => void;
  duplicateTab: (id: string) => void;

  // File operations
  saveFile: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveAllFiles: () => Promise<{ success: boolean; error?: string }>;
  saveFileAs: (id: string, path: string) => Promise<{ success: boolean; error?: string }>;
  revertFile: (id: string) => void;
  reloadFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;

  // Content management
  updateContent: (id: string, content: string) => void;
  updateCursorPosition: (id: string, position: { line: number; column: number }) => void;
  updateScrollPosition: (id: string, position: { top: number; left: number }) => void;
  updateSelections: (id: string, selections: EditorTab['selections']) => void;
  addBookmark: (id: string, bookmark: EditorTab['bookmarks'][0]) => void;
  removeBookmark: (id: string, line: number) => void;
  toggleBookmark: (id: string, line: number) => void;
  addBreakpoint: (id: string, breakpoint: EditorTab['breakpoints'][0]) => void;
  removeBreakpoint: (id: string, line: number) => void;
  toggleBreakpoint: (id: string, line: number) => void;

  // Editor settings
  updateTabSettings: (id: string, settings: Partial<EditorTab>) => void;
  updateGlobalSettings: (settings: Partial<EditorTab>) => void;
  resetSettings: (id: string) => void;

  // Search and replace
  findInFile: (id: string, query: string, options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    regex: boolean;
    preserveCase: boolean;
  }) => Array<{
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
    text: string;
  }>;
  replaceInFile: (id: string, query: string, replacement: string, options: {
    caseSensitive: boolean;
    wholeWord: boolean;
    regex: boolean;
    preserveCase: boolean;
    replaceAll: boolean;
  }) => number;

  // Git integration
  updateGitStatus: (id: string, status: EditorTab['gitStatus']) => void;
  updateGitConflict: (id: string, conflict: boolean) => void;
  resolveGitConflict: (id: string, resolution: 'current' | 'incoming' | 'both' | 'neither') => void;

  // Diagnostics
  updateProblems: (id: string, problems: EditorTab['problems']) => void;
  updateDiagnostics: (id: string, diagnostics: EditorTab['diagnostics']) => void;
  clearProblems: (id: string) => void;
  clearDiagnostics: (id: string) => void;

  // Language features
  updateSymbols: (id: string, symbols: EditorTab['symbols']) => void;
  updateOutline: (id: string, outline: EditorTab['outline']) => void;
  updateReferences: (id: string, references: EditorTab['references']) => void;
  updateDefinitions: (id: string, definitions: EditorTab['definitions']) => void;
  updateHovers: (id: string, hovers: EditorTab['hovers']) => void;
  updateCodeActions: (id: string, codeActions: EditorTab['codeActions']) => void;
  updateCompletions: (id: string, completions: EditorTab['completions']) => void;
  updateSignatureHelp: (id: string, signatureHelp: EditorTab['signatureHelp']) => void;

  // Visual features
  updateColorDecorators: (id: string, decorators: EditorTab['colorDecorators']) => void;
  updateInlayHints: (id: string, hints: EditorTab['inlayHints']) => void;
  updateSemanticTokens: (id: string, tokens: EditorTab['semanticTokens']) => void;
  updateLinkedEditing: (id: string, ranges: EditorTab['linkedEditing']) => void;
  updateDocumentHighlights: (id: string, highlights: EditorTab['documentHighlights']) => void;
  updateDocumentLinks: (id: string, links: EditorTab['documentLinks']) => void;
  updateCodeLens: (id: string, codeLens: EditorTab['codeLen']) => void;

  // Formatting
  formatDocument: (id: string) => void;
  formatSelection: (id: string) => void;
  formatOnType: (id: string, character: string) => void;
  formatOnSave: (id: string) => void;

  // Folding
  foldRegion: (id: string, start: number, end: number) => void;
  unfoldRegion: (id: string, start: number, end: number) => void;
  foldAll: (id: string) => void;
  unfoldAll: (id: string) => void;
  foldLevel: (id: string, level: number) => void;

  // Navigation
  goToLine: (id: string, line: number) => void;
  goToDefinition: (id: string, line: number, column: number) => void;
  goToTypeDefinition: (id: string, line: number, column: number) => void;
  goToImplementation: (id: string, line: number, column: number) => void;
  goToDeclaration: (id: string, line: number, column: number) => void;
  goToReferences: (id: string, line: number, column: number) => void;
  goToSymbol: (id: string, symbol: string) => void;
  goToNextError: (id: string) => void;
  goToPreviousError: (id: string) => void;
  goToNextWarning: (id: string) => void;
  goToPreviousWarning: (id: string) => void;
  goToNextBookmark: (id: string) => void;
  goToPreviousBookmark: (id: string) => void;

  // Editing
  insertText: (id: string, text: string) => void;
  deleteText: (id: string, start: { line: number; column: number }, end: { line: number; column: number }) => void;
  replaceText: (id: string, start: { line: number; column: number }, end: { line: number; column: number }, text: string) => void;
  insertSnippet: (id: string, snippet: string) => void;
  insertTemplate: (id: string, template: string) => void;
  commentLines: (id: string, lines: number[]) => void;
  uncommentLines: (id: string, lines: number[]) => void;
  toggleComment: (id: string, lines: number[]) => void;
  indentLines: (id: string, lines: number[]) => void;
  outdentLines: (id: string, lines: number[]) => void;
  moveLines: (id: string, lines: number[], direction: 'up' | 'down') => void;
  duplicateLines: (id: string, lines: number[]) => void;
  deleteLines: (id: string, lines: number[]) => void;
  joinLines: (id: string, lines: number[]) => void;
  splitLines: (id: string, lines: number[]) => void;
  sortLines: (id: string, lines: number[], ascending: boolean) => void;
  transformText: (id: string, transformation: 'uppercase' | 'lowercase' | 'capitalize' | 'reverse') => void;

  // Multi-cursor
  addCursor: (id: string, position: { line: number; column: number }) => void;
  removeCursor: (id: string, index: number) => void;
  clearCursors: (id: string) => void;
  selectAll: (id: string) => void;
  selectLine: (id: string, line: number) => void;
  selectWord: (id: string, position: { line: number; column: number }) => void;
  expandSelection: (id: string) => void;
  shrinkSelection: (id: string) => void;
  addSelectionToNextFindMatch: (id: string) => void;
  addSelectionToPreviousFindMatch: (id: string) => void;
  selectAllOccurrences: (id: string) => void;

  // Undo/Redo
  undo: (id: string) => void;
  redo: (id: string) => void;
  clearHistory: (id: string) => void;
  getHistorySize: (id: string) => number;

  // Clipboard
  cut: (id: string) => void;
  copy: (id: string) => void;
  paste: (id: string) => void;
  copyWithSyntax: (id: string) => void;
  pasteAsPlainText: (id: string) => void;

  // Session management
  saveSession: (name: string) => void;
  loadSession: (name: string) => void;
  deleteSession: (name: string) => void;
  getSessions: () => string[];

  // Tab state
  getTabState: (id: string) => EditorTab | null;
  getAllTabs: () => EditorTab[];
  getDirtyTabs: () => EditorTab[];
  getUntitledTabs: () => EditorTab[];
  getTabsByLanguage: (language: string) => EditorTab[];
  getTabsByPath: (path: string) => EditorTab[];
  getTabsByGitStatus: (status: EditorTab['gitStatus']) => EditorTab[];
  getTabsWithProblems: () => EditorTab[];
  getTabsWithBookmarks: () => EditorTab[];
  getTabsWithBreakpoints: () => EditorTab[];
  searchTabs: (query: string) => EditorTab[];
}

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        openTabs: [],
        activeTab: null,
        pinnedTabs: [],
        tabGroups: [
          {
            id: 'main',
            name: 'Main',
            tabs: [],
            active: true,
          },
        ],

        // Tab management
        openFile: (file) => {
          const tabs = get().openTabs;
          const existingTab = tabs.find((tab) => tab.path === file.path);

          if (existingTab) {
            set({ activeTab: existingTab });
            return;
          }

          const newTab: EditorTab = {
            id: file.id || `tab-${Date.now()}`,
            name: file.name || 'Untitled',
            path: file.path || '',
            content: file.content || '',
            originalContent: file.content || '',
            language: file.language || 'plaintext',
            isDirty: false,
            isUntitled: file.isUntitled || false,
            cursorPosition: { line: 1, column: 1 },
            scrollPosition: { top: 0, left: 0 },
            selections: [],
            foldedRegions: [],
            bookmarks: [],
            breakpoints: [],
            lastModified: Date.now(),
            encoding: 'utf-8',
            lineEnding: 'LF',
            indentSize: 4,
            insertSpaces: true,
            trimAutoWhitespace: true,
            detectIndentation: true,
            wordWrap: false,
            minimap: true,
            lineNumbers: true,
            renderWhitespace: false,
            renderControlCharacters: false,
            rulers: [],
            fontFamily: 'JetBrains Mono',
            fontSize: 14,
            fontWeight: 'normal',
            letterSpacing: 0,
            lineHeight: 1.5,
            tabCompletion: true,
            quickSuggestions: true,
            parameterHints: true,
            autoClosingBrackets: true,
            autoClosingQuotes: true,
            autoSurround: true,
            formatOnSave: true,
            formatOnType: false,
            formatOnPaste: false,
            codeActionsOnSave: true,
            lint: true,
            lintDelay: 500,
            vim: false,
            emacs: false,
            readOnly: false,
            previewMode: false,
            sticky: false,
            pinned: false,
            temporary: false,
            gitConflict: false,
            problems: [],
            diagnostics: [],
            symbols: [],
            outline: [],
            references: [],
            definitions: [],
            typeDefinitions: [],
            implementations: [],
            hovers: [],
            codeActions: [],
            completions: [],
            signatureHelp: null,
            colorDecorators: [],
            inlayHints: [],
            semanticTokens: [],
            linkedEditing: [],
            documentHighlights: [],
            documentLinks: [],
            codeLen: [],
            ...file,
          };

          set({
            openTabs: [...tabs, newTab],
            activeTab: newTab,
          });
        },

        closeFile: (id) => {
          const tabs = get().openTabs;
          const activeTab = get().activeTab;
          const tabIndex = tabs.findIndex((tab) => tab.id === id);

          if (tabIndex === -1) return;

          const newTabs = tabs.filter((tab) => tab.id !== id);
          let newActiveTab = activeTab;

          if (activeTab?.id === id) {
            if (newTabs.length > 0) {
              newActiveTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
            } else {
              newActiveTab = null;
            }
          }

          set({
            openTabs: newTabs,
            activeTab: newActiveTab,
          });
        },

        closeAllFiles: () => {
          set({
            openTabs: [],
            activeTab: null,
          });
        },

        closeOtherFiles: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            set({
              openTabs: [tab],
              activeTab: tab,
            });
          }
        },

        closeFilesToRight: (id) => {
          const tabs = get().openTabs;
          const tabIndex = tabs.findIndex((tab) => tab.id === id);

          if (tabIndex !== -1) {
            const newTabs = tabs.slice(0, tabIndex + 1);
            set({
              openTabs: newTabs,
              activeTab: get().activeTab?.id && newTabs.find((tab) => tab.id === get().activeTab?.id) ? get().activeTab : newTabs[newTabs.length - 1],
            });
          }
        },

        closeFilesToLeft: (id) => {
          const tabs = get().openTabs;
          const tabIndex = tabs.findIndex((tab) => tab.id === id);

          if (tabIndex !== -1) {
            const newTabs = tabs.slice(tabIndex);
            set({
              openTabs: newTabs,
              activeTab: get().activeTab?.id && newTabs.find((tab) => tab.id === get().activeTab?.id) ? get().activeTab : newTabs[0],
            });
          }
        },

        closeUnsavedFiles: () => {
          const tabs = get().openTabs;
          const savedTabs = tabs.filter((tab) => !tab.isDirty);
          set({
            openTabs: savedTabs,
            activeTab: get().activeTab?.isDirty ? (savedTabs.length > 0 ? savedTabs[0] : null) : get().activeTab,
          });
        },

        setActiveTab: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            set({ activeTab: tab });
          }
        },

        moveTab: (fromIndex, toIndex) => {
          const tabs = [...get().openTabs];
          const [movedTab] = tabs.splice(fromIndex, 1);
          tabs.splice(toIndex, 0, movedTab);

          set({ openTabs: tabs });
        },

        pinTab: (id) => {
          const pinnedTabs = get().pinnedTabs;
          if (!pinnedTabs.includes(id)) {
            set({ pinnedTabs: [...pinnedTabs, id] });
          }
        },

        unpinTab: (id) => {
          const pinnedTabs = get().pinnedTabs;
          set({ pinnedTabs: pinnedTabs.filter((tabId) => tabId !== id) });
        },

        splitTab: (id, direction) => {
          // TODO: Implement tab splitting
          console.log('Split tab:', id, direction);
        },

        duplicateTab: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const duplicatedTab = {
              ...tab,
              id: `${tab.id}-copy-${Date.now()}`,
              name: `${tab.name} (Copy)`,
              isDirty: false,
            };

            set({
              openTabs: [...tabs, duplicatedTab],
              activeTab: duplicatedTab,
            });
          }
        },

        // File operations
        saveFile: async (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (!tab) {
            return { success: false, error: 'Tab not found' };
          }

          try {
            if (tab.isUntitled) {
              // Handle save as for untitled files
              return { success: false, error: 'Use Save As for untitled files' };
            }

            // Use electron API to save file
            const result = await window.electronAPI.fs.writeFile(tab.path, tab.content);

            if (result.success) {
              set({
                openTabs: tabs.map((t) =>
                  t.id === id
                    ? { ...t, isDirty: false, originalContent: t.content, lastModified: Date.now() }
                    : t
                ),
              });

              return { success: true };
            } else {
              return { success: false, error: result.error };
            }
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        },

        saveAllFiles: async () => {
          const tabs = get().openTabs;
          const dirtyTabs = tabs.filter((tab) => tab.isDirty && !tab.isUntitled);

          try {
            const results = await Promise.all(
              dirtyTabs.map((tab) => get().saveFile(tab.id))
            );

            const failedSaves = results.filter((result) => !result.success);

            if (failedSaves.length > 0) {
              return { success: false, error: `Failed to save ${failedSaves.length} files` };
            }

            return { success: true };
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        },

        saveFileAs: async (id, path) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (!tab) {
            return { success: false, error: 'Tab not found' };
          }

          try {
            const result = await window.electronAPI.fs.writeFile(path, tab.content);

            if (result.success) {
              const fileName = path.split('/').pop() || 'Unknown';
              
              set({
                openTabs: tabs.map((t) =>
                  t.id === id
                    ? {
                        ...t,
                        name: fileName,
                        path: path,
                        isDirty: false,
                        isUntitled: false,
                        originalContent: t.content,
                        lastModified: Date.now(),
                      }
                    : t
                ),
              });

              return { success: true };
            } else {
              return { success: false, error: result.error };
            }
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        },

        revertFile: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            set({
              openTabs: tabs.map((t) =>
                t.id === id
                  ? { ...t, content: t.originalContent, isDirty: false }
                  : t
              ),
            });
          }
        },

        reloadFile: async (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab && !tab.isUntitled) {
            try {
              const result = await window.electronAPI.fs.readFile(tab.path);

              if (result.success) {
                set({
                  openTabs: tabs.map((t) =>
                    t.id === id
                      ? {
                          ...t,
                          content: result.content,
                          originalContent: result.content,
                          isDirty: false,
                          lastModified: Date.now(),
                        }
                      : t
                  ),
                });
              }
            } catch (error) {
              console.error('Failed to reload file:', error);
            }
          }
        },

        renameFile: (id, newName) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, name: newName } : tab
            ),
          });
        },

        // Content management
        updateContent: (id, content) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const isDirty = content !== tab.originalContent;
            
            set({
              openTabs: tabs.map((t) =>
                t.id === id
                  ? { ...t, content, isDirty, lastModified: Date.now() }
                  : t
              ),
            });
          }
        },

        updateCursorPosition: (id, position) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, cursorPosition: position } : tab
            ),
          });
        },

        updateScrollPosition: (id, position) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, scrollPosition: position } : tab
            ),
          });
        },

        updateSelections: (id, selections) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, selections } : tab
            ),
          });
        },

        addBookmark: (id, bookmark) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, bookmarks: [...tab.bookmarks, bookmark] } : tab
            ),
          });
        },

        removeBookmark: (id, line) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id
                ? { ...tab, bookmarks: tab.bookmarks.filter((b) => b.line !== line) }
                : tab
            ),
          });
        },

        toggleBookmark: (id, line) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const hasBookmark = tab.bookmarks.some((b) => b.line === line);
            
            if (hasBookmark) {
              get().removeBookmark(id, line);
            } else {
              get().addBookmark(id, { line, column: 1 });
            }
          }
        },

        addBreakpoint: (id, breakpoint) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, breakpoints: [...tab.breakpoints, breakpoint] } : tab
            ),
          });
        },

        removeBreakpoint: (id, line) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id
                ? { ...tab, breakpoints: tab.breakpoints.filter((b) => b.line !== line) }
                : tab
            ),
          });
        },

        toggleBreakpoint: (id, line) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const hasBreakpoint = tab.breakpoints.some((b) => b.line === line);
            
            if (hasBreakpoint) {
              get().removeBreakpoint(id, line);
            } else {
              get().addBreakpoint(id, { line });
            }
          }
        },

        // Editor settings
        updateTabSettings: (id, settings) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, ...settings } : tab
            ),
          });
        },

        updateGlobalSettings: (settings) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) => ({ ...tab, ...settings })),
          });
        },

        resetSettings: (id) => {
          // TODO: Implement reset settings
        },

        // Search and replace
        findInFile: (id, query, options) => {
          // TODO: Implement find in file
          return [];
        },

        replaceInFile: (id, query, replacement, options) => {
          // TODO: Implement replace in file
          return 0;
        },

        // Git integration
        updateGitStatus: (id, status) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, gitStatus: status } : tab
            ),
          });
        },

        updateGitConflict: (id, conflict) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, gitConflict: conflict } : tab
            ),
          });
        },

        resolveGitConflict: (id, resolution) => {
          // TODO: Implement git conflict resolution
        },

        // Diagnostics
        updateProblems: (id, problems) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, problems } : tab
            ),
          });
        },

        updateDiagnostics: (id, diagnostics) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, diagnostics } : tab
            ),
          });
        },

        clearProblems: (id) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, problems: [] } : tab
            ),
          });
        },

        clearDiagnostics: (id) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, diagnostics: [] } : tab
            ),
          });
        },

        // Language features
        updateSymbols: (id, symbols) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, symbols } : tab
            ),
          });
        },

        updateOutline: (id, outline) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, outline } : tab
            ),
          });
        },

        updateReferences: (id, references) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, references } : tab
            ),
          });
        },

        updateDefinitions: (id, definitions) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, definitions } : tab
            ),
          });
        },

        updateHovers: (id, hovers) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, hovers } : tab
            ),
          });
        },

        updateCodeActions: (id, codeActions) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, codeActions } : tab
            ),
          });
        },

        updateCompletions: (id, completions) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, completions } : tab
            ),
          });
        },

        updateSignatureHelp: (id, signatureHelp) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, signatureHelp } : tab
            ),
          });
        },

        // Visual features
        updateColorDecorators: (id, decorators) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, colorDecorators: decorators } : tab
            ),
          });
        },

        updateInlayHints: (id, hints) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, inlayHints: hints } : tab
            ),
          });
        },

        updateSemanticTokens: (id, tokens) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, semanticTokens: tokens } : tab
            ),
          });
        },

        updateLinkedEditing: (id, ranges) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, linkedEditing: ranges } : tab
            ),
          });
        },

        updateDocumentHighlights: (id, highlights) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, documentHighlights: highlights } : tab
            ),
          });
        },

        updateDocumentLinks: (id, links) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, documentLinks: links } : tab
            ),
          });
        },

        updateCodeLens: (id, codeLens) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, codeLen: codeLens } : tab
            ),
          });
        },

        // Formatting
        formatDocument: (id) => {
          // TODO: Implement format document
        },

        formatSelection: (id) => {
          // TODO: Implement format selection
        },

        formatOnType: (id, character) => {
          // TODO: Implement format on type
        },

        formatOnSave: (id) => {
          // TODO: Implement format on save
        },

        // Folding
        foldRegion: (id, start, end) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id
                ? { ...tab, foldedRegions: [...tab.foldedRegions, { start, end }] }
                : tab
            ),
          });
        },

        unfoldRegion: (id, start, end) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id
                ? {
                    ...tab,
                    foldedRegions: tab.foldedRegions.filter(
                      (region) => region.start !== start || region.end !== end
                    ),
                  }
                : tab
            ),
          });
        },

        foldAll: (id) => {
          // TODO: Implement fold all
        },

        unfoldAll: (id) => {
          const tabs = get().openTabs;
          set({
            openTabs: tabs.map((tab) =>
              tab.id === id ? { ...tab, foldedRegions: [] } : tab
            ),
          });
        },

        foldLevel: (id, level) => {
          // TODO: Implement fold level
        },

        // Navigation
        goToLine: (id, line) => {
          get().updateCursorPosition(id, { line, column: 1 });
        },

        goToDefinition: (id, line, column) => {
          // TODO: Implement go to definition
        },

        goToTypeDefinition: (id, line, column) => {
          // TODO: Implement go to type definition
        },

        goToImplementation: (id, line, column) => {
          // TODO: Implement go to implementation
        },

        goToDeclaration: (id, line, column) => {
          // TODO: Implement go to declaration
        },

        goToReferences: (id, line, column) => {
          // TODO: Implement go to references
        },

        goToSymbol: (id, symbol) => {
          // TODO: Implement go to symbol
        },

        goToNextError: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab && tab.problems.length > 0) {
            const currentLine = tab.cursorPosition.line;
            const nextError = tab.problems
              .filter((problem) => problem.line > currentLine)
              .sort((a, b) => a.line - b.line)[0];

            if (nextError) {
              get().updateCursorPosition(id, { line: nextError.line, column: nextError.column });
            }
          }
        },

        goToPreviousError: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab && tab.problems.length > 0) {
            const currentLine = tab.cursorPosition.line;
            const previousError = tab.problems
              .filter((problem) => problem.line < currentLine)
              .sort((a, b) => b.line - a.line)[0];

            if (previousError) {
              get().updateCursorPosition(id, { line: previousError.line, column: previousError.column });
            }
          }
        },

        goToNextWarning: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab && tab.problems.length > 0) {
            const currentLine = tab.cursorPosition.line;
            const nextWarning = tab.problems
              .filter((problem) => problem.severity === 'warning' && problem.line > currentLine)
              .sort((a, b) => a.line - b.line)[0];

            if (nextWarning) {
              get().updateCursorPosition(id, { line: nextWarning.line, column: nextWarning.column });
            }
          }
        },

        goToPreviousWarning: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab && tab.problems.length > 0) {
            const currentLine = tab.cursorPosition.line;
            const previousWarning = tab.problems
              .filter((problem) => problem.severity === 'warning' && problem.line < currentLine)
              .sort((a, b) => b.line - a.line)[0];

            if (previousWarning) {
              get().updateCursorPosition(id, { line: previousWarning.line, column: previousWarning.column });
            }
          }
        },

        goToNextBookmark: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab && tab.bookmarks.length > 0) {
            const currentLine = tab.cursorPosition.line;
            const nextBookmark = tab.bookmarks
              .filter((bookmark) => bookmark.line > currentLine)
              .sort((a, b) => a.line - b.line)[0];

            if (nextBookmark) {
              get().updateCursorPosition(id, { line: nextBookmark.line, column: nextBookmark.column });
            }
          }
        },

        goToPreviousBookmark: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab && tab.bookmarks.length > 0) {
            const currentLine = tab.cursorPosition.line;
            const previousBookmark = tab.bookmarks
              .filter((bookmark) => bookmark.line < currentLine)
              .sort((a, b) => b.line - a.line)[0];

            if (previousBookmark) {
              get().updateCursorPosition(id, { line: previousBookmark.line, column: previousBookmark.column });
            }
          }
        },

        // Editing
        insertText: (id, text) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const lines = tab.content.split('\n');
            const line = lines[tab.cursorPosition.line - 1];
            const beforeCursor = line.slice(0, tab.cursorPosition.column - 1);
            const afterCursor = line.slice(tab.cursorPosition.column - 1);
            const newLine = beforeCursor + text + afterCursor;
            lines[tab.cursorPosition.line - 1] = newLine;
            
            const newContent = lines.join('\n');
            get().updateContent(id, newContent);
            get().updateCursorPosition(id, {
              line: tab.cursorPosition.line,
              column: tab.cursorPosition.column + text.length,
            });
          }
        },

        deleteText: (id, start, end) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const lines = tab.content.split('\n');
            
            if (start.line === end.line) {
              // Delete within the same line
              const line = lines[start.line - 1];
              const beforeStart = line.slice(0, start.column - 1);
              const afterEnd = line.slice(end.column - 1);
              lines[start.line - 1] = beforeStart + afterEnd;
            } else {
              // Delete across multiple lines
              const startLine = lines[start.line - 1];
              const endLine = lines[end.line - 1];
              const beforeStart = startLine.slice(0, start.column - 1);
              const afterEnd = endLine.slice(end.column - 1);
              const newLine = beforeStart + afterEnd;
              
              lines.splice(start.line - 1, end.line - start.line + 1, newLine);
            }
            
            const newContent = lines.join('\n');
            get().updateContent(id, newContent);
            get().updateCursorPosition(id, start);
          }
        },

        replaceText: (id, start, end, text) => {
          get().deleteText(id, start, end);
          get().insertText(id, text);
        },

        insertSnippet: (id, snippet) => {
          // TODO: Implement insert snippet
        },

        insertTemplate: (id, template) => {
          // TODO: Implement insert template
        },

        commentLines: (id, lines) => {
          // TODO: Implement comment lines
        },

        uncommentLines: (id, lines) => {
          // TODO: Implement uncomment lines
        },

        toggleComment: (id, lines) => {
          // TODO: Implement toggle comment
        },

        indentLines: (id, lines) => {
          // TODO: Implement indent lines
        },

        outdentLines: (id, lines) => {
          // TODO: Implement outdent lines
        },

        moveLines: (id, lines, direction) => {
          // TODO: Implement move lines
        },

        duplicateLines: (id, lines) => {
          // TODO: Implement duplicate lines
        },

        deleteLines: (id, lines) => {
          // TODO: Implement delete lines
        },

        joinLines: (id, lines) => {
          // TODO: Implement join lines
        },

        splitLines: (id, lines) => {
          // TODO: Implement split lines
        },

        sortLines: (id, lines, ascending) => {
          // TODO: Implement sort lines
        },

        transformText: (id, transformation) => {
          // TODO: Implement transform text
        },

        // Multi-cursor
        addCursor: (id, position) => {
          // TODO: Implement add cursor
        },

        removeCursor: (id, index) => {
          // TODO: Implement remove cursor
        },

        clearCursors: (id) => {
          // TODO: Implement clear cursors
        },

        selectAll: (id) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const lines = tab.content.split('\n');
            const lastLine = lines.length;
            const lastColumn = lines[lastLine - 1].length + 1;
            
            get().updateSelections(id, [
              {
                start: { line: 1, column: 1 },
                end: { line: lastLine, column: lastColumn },
              },
            ]);
          }
        },

        selectLine: (id, line) => {
          const tabs = get().openTabs;
          const tab = tabs.find((tab) => tab.id === id);

          if (tab) {
            const lines = tab.content.split('\n');
            const lineContent = lines[line - 1];
            
            get().updateSelections(id, [
              {
                start: { line, column: 1 },
                end: { line, column: lineContent.length + 1 },
              },
            ]);
          }
        },

        selectWord: (id, position) => {
          // TODO: Implement select word
        },

        expandSelection: (id) => {
          // TODO: Implement expand selection
        },

        shrinkSelection: (id) => {
          // TODO: Implement shrink selection
        },

        addSelectionToNextFindMatch: (id) => {
          // TODO: Implement add selection to next find match
        },

        addSelectionToPreviousFindMatch: (id) => {
          // TODO: Implement add selection to previous find match
        },

        selectAllOccurrences: (id) => {
          // TODO: Implement select all occurrences
        },

        // Undo/Redo
        undo: (id) => {
          // TODO: Implement undo
        },

        redo: (id) => {
          // TODO: Implement redo
        },

        clearHistory: (id) => {
          // TODO: Implement clear history
        },

        getHistorySize: (id) => {
          // TODO: Implement get history size
          return 0;
        },

        // Clipboard
        cut: (id) => {
          // TODO: Implement cut
        },

        copy: (id) => {
          // TODO: Implement copy
        },

        paste: (id) => {
          // TODO: Implement paste
        },

        copyWithSyntax: (id) => {
          // TODO: Implement copy with syntax
        },

        pasteAsPlainText: (id) => {
          // TODO: Implement paste as plain text
        },

        // Session management
        saveSession: (name) => {
          // TODO: Implement save session
        },

        loadSession: (name) => {
          // TODO: Implement load session
        },

        deleteSession: (name) => {
          // TODO: Implement delete session
        },

        getSessions: () => {
          // TODO: Implement get sessions
          return [];
        },

        // Tab state
        getTabState: (id) => {
          const tabs = get().openTabs;
          return tabs.find((tab) => tab.id === id) || null;
        },

        getAllTabs: () => {
          return get().openTabs;
        },

        getDirtyTabs: () => {
          return get().openTabs.filter((tab) => tab.isDirty);
        },

        getUntitledTabs: () => {
          return get().openTabs.filter((tab) => tab.isUntitled);
        },

        getTabsByLanguage: (language) => {
          return get().openTabs.filter((tab) => tab.language === language);
        },

        getTabsByPath: (path) => {
          return get().openTabs.filter((tab) => tab.path.includes(path));
        },

        getTabsByGitStatus: (status) => {
          return get().openTabs.filter((tab) => tab.gitStatus === status);
        },

        getTabsWithProblems: () => {
          return get().openTabs.filter((tab) => tab.problems.length > 0);
        },

        getTabsWithBookmarks: () => {
          return get().openTabs.filter((tab) => tab.bookmarks.length > 0);
        },

        getTabsWithBreakpoints: () => {
          return get().openTabs.filter((tab) => tab.breakpoints.length > 0);
        },

        searchTabs: (query) => {
          const tabs = get().openTabs;
          const lowercaseQuery = query.toLowerCase();
          
          return tabs.filter((tab) =>
            tab.name.toLowerCase().includes(lowercaseQuery) ||
            tab.path.toLowerCase().includes(lowercaseQuery) ||
            tab.content.toLowerCase().includes(lowercaseQuery)
          );
        },
      }),
      {
        name: 'puter-cursor-editor-store',
        partialize: (state) => ({
          openTabs: state.openTabs.map((tab) => ({
            ...tab,
            // Don't persist large arrays in localStorage
            problems: [],
            diagnostics: [],
            symbols: [],
            outline: [],
            references: [],
            definitions: [],
            typeDefinitions: [],
            implementations: [],
            hovers: [],
            codeActions: [],
            completions: [],
            signatureHelp: null,
            colorDecorators: [],
            inlayHints: [],
            semanticTokens: [],
            linkedEditing: [],
            documentHighlights: [],
            documentLinks: [],
            codeLen: [],
          })),
          activeTab: state.activeTab,
          pinnedTabs: state.pinnedTabs,
          tabGroups: state.tabGroups,
        }),
      }
    ),
    {
      name: 'puter-cursor-editor-store',
    }
  )
);

// Selectors
export const selectOpenTabs = (state: EditorState) => state.openTabs;
export const selectActiveTab = (state: EditorState) => state.activeTab;
export const selectPinnedTabs = (state: EditorState) => state.pinnedTabs;
export const selectTabGroups = (state: EditorState) => state.tabGroups;
export const selectDirtyTabs = (state: EditorState) => state.openTabs.filter((tab) => tab.isDirty);
export const selectUntitledTabs = (state: EditorState) => state.openTabs.filter((tab) => tab.isUntitled);
export const selectTabsWithProblems = (state: EditorState) => state.openTabs.filter((tab) => tab.problems.length > 0);
export const selectTabsWithBookmarks = (state: EditorState) => state.openTabs.filter((tab) => tab.bookmarks.length > 0);
export const selectTabsWithBreakpoints = (state: EditorState) => state.openTabs.filter((tab) => tab.breakpoints.length > 0);