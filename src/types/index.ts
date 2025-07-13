// AI and Tool Related Types
export interface AIModel {
  id: string;
  name: string;
  provider: 'puter' | 'openai' | 'anthropic' | 'deepseek';
  maxTokens: number;
  supportsTools: boolean;
  supportsStreaming: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tools?: ToolCall[];
  metadata?: Record<string, any>;
}

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
}

export interface AICompletionRequest {
  prompt: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  context?: EditorContext;
  tools?: Tool[];
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  tools?: ToolCall[];
}

// Editor Related Types
export interface EditorContext {
  filePath: string;
  language: string;
  content: string;
  cursorPosition: Position;
  selection?: Range;
  visibleRange?: Range;
  projectContext?: ProjectContext;
}

export interface Position {
  line: number;
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface ProjectContext {
  rootPath: string;
  files: FileInfo[];
  dependencies: string[];
  framework?: string;
  language?: string;
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
  content?: string;
}

// Tool System Types
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
  handler: (params: any) => Promise<any>;
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: ToolParameter;
  properties?: Record<string, ToolParameter>;
}

// UI and Component Types
export interface SuggestionOverlay {
  id: string;
  type: 'inline' | 'diff' | 'ghost';
  content: string;
  position: Position;
  range: Range;
  confidence: number;
  accepted?: boolean;
  rejected?: boolean;
}

export interface DiffView {
  original: string;
  modified: string;
  language: string;
  fileName: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  context?: EditorContext;
}

// Rules and Configuration Types
export interface CursorRules {
  global?: Rule[];
  project?: Rule[];
  file?: Rule[];
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  content: string;
  priority: number;
  enabled: boolean;
  scope: 'global' | 'project' | 'file' | 'language';
  conditions?: RuleCondition[];
}

export interface RuleCondition {
  type: 'file-extension' | 'file-path' | 'project-type' | 'language';
  value: string;
  operator: 'equals' | 'contains' | 'matches' | 'starts-with';
}

// Workspace and File System Types
export interface WorkspaceFile {
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  lastSaved?: Date;
  metadata?: Record<string, any>;
}

export interface FileSystemWatcher {
  path: string;
  recursive: boolean;
  events: ('create' | 'modify' | 'delete')[];
  callback: (event: FileSystemEvent) => void;
}

export interface FileSystemEvent {
  type: 'create' | 'modify' | 'delete';
  path: string;
  timestamp: Date;
}

// Agent and Automation Types
export interface AgentTask {
  id: string;
  type: 'refactor' | 'test-generation' | 'documentation' | 'bug-fix' | 'feature';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  steps: AgentStep[];
  result?: any;
  error?: string;
}

export interface AgentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  tool?: string;
  parameters?: Record<string, any>;
  result?: any;
  error?: string;
}

// Settings and Preferences Types
export interface AppSettings {
  ai: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    streamingEnabled: boolean;
  };
  editor: {
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
  };
  ui: {
    theme: 'dark' | 'light' | 'auto';
    sidebarPosition: 'left' | 'right';
    chatPosition: 'sidebar' | 'panel' | 'floating';
  };
  keybindings: Record<string, string>;
  rules: {
    autoReload: boolean;
    globalRulesPath: string;
  };
}

// Event System Types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface EventListener {
  id: string;
  event: string;
  callback: (event: AppEvent) => void;
  once?: boolean;
}

// Puter.js Integration Types
export interface PuterAIConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface PuterFileSystem {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  listFiles: (path: string) => Promise<FileInfo[]>;
  watchFile: (path: string, callback: (event: FileSystemEvent) => void) => void;
}