import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark' | 'system';
export type SidebarPanel = 'explorer' | 'search' | 'git' | 'extensions' | 'settings';

interface AppState {
  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;

  // Workspace
  currentWorkspace: string | null;
  setCurrentWorkspace: (workspace: string | null) => void;

  // UI State
  sidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
  sidebarPanel: SidebarPanel;
  setSidebarPanel: (panel: SidebarPanel) => void;
  terminalVisible: boolean;
  setTerminalVisible: (visible: boolean) => void;
  statusBarVisible: boolean;
  setStatusBarVisible: (visible: boolean) => void;

  // Panel sizes
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  terminalHeight: number;
  setTerminalHeight: (height: number) => void;

  // Zoom
  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  // Recent workspaces
  recentWorkspaces: string[];
  addRecentWorkspace: (workspace: string) => void;
  removeRecentWorkspace: (workspace: string) => void;

  // Window state
  isMaximized: boolean;
  setIsMaximized: (maximized: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;

  // Error handling
  lastError: string | null;
  setLastError: (error: string | null) => void;

  // Performance
  performanceMode: 'normal' | 'high-performance' | 'power-saver';
  setPerformanceMode: (mode: 'normal' | 'high-performance' | 'power-saver') => void;

  // Feature flags
  features: {
    aiChat: boolean;
    aiCompletion: boolean;
    git: boolean;
    terminal: boolean;
    extensions: boolean;
    remoteWorkspace: boolean;
    collaboration: boolean;
    vim: boolean;
    emacs: boolean;
    autosave: boolean;
    minimap: boolean;
    breadcrumbs: boolean;
    outline: boolean;
    problems: boolean;
    debug: boolean;
    testing: boolean;
    notebooks: boolean;
    timeline: boolean;
    comments: boolean;
    liveshare: boolean;
  };
  setFeature: (feature: keyof AppState['features'], enabled: boolean) => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    dismissed: boolean;
  }>;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // Update state
  updateAvailable: boolean;
  setUpdateAvailable: (available: boolean) => void;
  updateInfo: any;
  setUpdateInfo: (info: any) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Theme
        theme: 'dark',
        setTheme: (theme) => set({ theme }),

        // Workspace
        currentWorkspace: null,
        setCurrentWorkspace: (workspace) => {
          set({ currentWorkspace: workspace });
          if (workspace) {
            get().addRecentWorkspace(workspace);
          }
        },

        // UI State
        sidebarVisible: true,
        setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
        sidebarPanel: 'explorer',
        setSidebarPanel: (panel) => set({ sidebarPanel: panel }),
        terminalVisible: false,
        setTerminalVisible: (visible) => set({ terminalVisible: visible }),
        statusBarVisible: true,
        setStatusBarVisible: (visible) => set({ statusBarVisible: visible }),

        // Panel sizes
        sidebarWidth: 320,
        setSidebarWidth: (width) => set({ sidebarWidth: width }),
        terminalHeight: 200,
        setTerminalHeight: (height) => set({ terminalHeight: height }),

        // Zoom
        zoomLevel: 1,
        setZoomLevel: (level) => set({ zoomLevel: level }),

        // Recent workspaces
        recentWorkspaces: [],
        addRecentWorkspace: (workspace) => {
          const current = get().recentWorkspaces;
          const filtered = current.filter(w => w !== workspace);
          set({ recentWorkspaces: [workspace, ...filtered].slice(0, 10) });
        },
        removeRecentWorkspace: (workspace) => {
          const current = get().recentWorkspaces;
          set({ recentWorkspaces: current.filter(w => w !== workspace) });
        },

        // Window state
        isMaximized: false,
        setIsMaximized: (maximized) => set({ isMaximized: maximized }),
        isFullscreen: false,
        setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),

        // Loading states
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
        loadingMessage: '',
        setLoadingMessage: (message) => set({ loadingMessage: message }),

        // Error handling
        lastError: null,
        setLastError: (error) => set({ lastError: error }),

        // Performance
        performanceMode: 'normal',
        setPerformanceMode: (mode) => set({ performanceMode: mode }),

        // Feature flags
        features: {
          aiChat: true,
          aiCompletion: true,
          git: true,
          terminal: true,
          extensions: true,
          remoteWorkspace: false,
          collaboration: false,
          vim: false,
          emacs: false,
          autosave: true,
          minimap: true,
          breadcrumbs: true,
          outline: true,
          problems: true,
          debug: true,
          testing: true,
          notebooks: true,
          timeline: true,
          comments: true,
          liveshare: false,
        },
        setFeature: (feature, enabled) => {
          set((state) => ({
            features: {
              ...state.features,
              [feature]: enabled
            }
          }));
        },

        // Notifications
        notifications: [],
        addNotification: (notification) => {
          const id = Date.now().toString();
          set((state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id,
                timestamp: Date.now(),
                dismissed: false
              }
            ]
          }));
        },
        dismissNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, dismissed: true } : n
            )
          }));
        },
        clearNotifications: () => set({ notifications: [] }),

        // Update state
        updateAvailable: false,
        setUpdateAvailable: (available) => set({ updateAvailable: available }),
        updateInfo: null,
        setUpdateInfo: (info) => set({ updateInfo: info }),
      }),
      {
        name: 'puter-cursor-app-store',
        partialize: (state) => ({
          theme: state.theme,
          currentWorkspace: state.currentWorkspace,
          sidebarVisible: state.sidebarVisible,
          sidebarPanel: state.sidebarPanel,
          terminalVisible: state.terminalVisible,
          statusBarVisible: state.statusBarVisible,
          sidebarWidth: state.sidebarWidth,
          terminalHeight: state.terminalHeight,
          zoomLevel: state.zoomLevel,
          recentWorkspaces: state.recentWorkspaces,
          performanceMode: state.performanceMode,
          features: state.features,
        }),
      }
    ),
    {
      name: 'puter-cursor-app-store',
    }
  )
);

// Selectors
export const selectTheme = (state: AppState) => state.theme;
export const selectCurrentWorkspace = (state: AppState) => state.currentWorkspace;
export const selectSidebarVisible = (state: AppState) => state.sidebarVisible;
export const selectSidebarPanel = (state: AppState) => state.sidebarPanel;
export const selectTerminalVisible = (state: AppState) => state.terminalVisible;
export const selectFeatures = (state: AppState) => state.features;
export const selectNotifications = (state: AppState) => state.notifications.filter(n => !n.dismissed);
export const selectIsLoading = (state: AppState) => state.isLoading;
export const selectLastError = (state: AppState) => state.lastError;
export const selectRecentWorkspaces = (state: AppState) => state.recentWorkspaces;
export const selectPerformanceMode = (state: AppState) => state.performanceMode;
export const selectZoomLevel = (state: AppState) => state.zoomLevel;