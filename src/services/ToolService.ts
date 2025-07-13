import { Tool, ToolCall, FileInfo, EditorContext } from '@/types';

// Electron-spezifische Imports (werden zur Laufzeit verfügbar sein)
declare const require: any;
const fs = require('fs');
const path = require('path');

export class ToolService {
  private tools: Map<string, Tool> = new Map();
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.initializeTools();
  }

  private initializeTools(): void {
    // File System Tools
    this.registerTool({
      name: 'read_file',
      description: 'Read the contents of a file',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path to the file to read'
          }
        },
        required: ['file_path']
      },
      handler: this.readFile.bind(this)
    });

    this.registerTool({
      name: 'edit_file',
      description: 'Edit or create a file with new content',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path to the file to edit'
          },
          content: {
            type: 'string',
            description: 'New content for the file'
          },
          operation: {
            type: 'string',
            enum: ['replace', 'append', 'prepend'],
            description: 'Type of edit operation'
          }
        },
        required: ['file_path', 'content']
      },
      handler: this.editFile.bind(this)
    });

    this.registerTool({
      name: 'search_replace',
      description: 'Search and replace text in a file',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path to the file'
          },
          search_text: {
            type: 'string',
            description: 'Text to search for'
          },
          replace_text: {
            type: 'string',
            description: 'Text to replace with'
          },
          global: {
            type: 'boolean',
            description: 'Replace all occurrences'
          }
        },
        required: ['file_path', 'search_text', 'replace_text']
      },
      handler: this.searchReplace.bind(this)
    });

    this.registerTool({
      name: 'list_files',
      description: 'List files in a directory',
      parameters: {
        type: 'object',
        properties: {
          directory_path: {
            type: 'string',
            description: 'Path to the directory'
          },
          recursive: {
            type: 'boolean',
            description: 'List files recursively'
          },
          filter: {
            type: 'string',
            description: 'File extension filter (e.g., .ts, .js)'
          }
        },
        required: ['directory_path']
      },
      handler: this.listFiles.bind(this)
    });

    this.registerTool({
      name: 'create_file',
      description: 'Create a new file',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path for the new file'
          },
          content: {
            type: 'string',
            description: 'Initial content for the file'
          }
        },
        required: ['file_path']
      },
      handler: this.createFile.bind(this)
    });

    this.registerTool({
      name: 'delete_file',
      description: 'Delete a file',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path to the file to delete'
          }
        },
        required: ['file_path']
      },
      handler: this.deleteFile.bind(this)
    });

    // Code Analysis Tools
    this.registerTool({
      name: 'analyze_code',
      description: 'Analyze code structure and dependencies',
      parameters: {
        type: 'object',
        properties: {
          file_path: {
            type: 'string',
            description: 'Path to the file to analyze'
          },
          analysis_type: {
            type: 'string',
            enum: ['imports', 'exports', 'functions', 'classes', 'dependencies'],
            description: 'Type of analysis to perform'
          }
        },
        required: ['file_path', 'analysis_type']
      },
      handler: this.analyzeCode.bind(this)
    });

    this.registerTool({
      name: 'grep_search',
      description: 'Search for text patterns in files',
      parameters: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Search pattern (regex supported)'
          },
          directory: {
            type: 'string',
            description: 'Directory to search in'
          },
          file_pattern: {
            type: 'string',
            description: 'File name pattern (e.g., *.ts)'
          },
          case_sensitive: {
            type: 'boolean',
            description: 'Case sensitive search'
          }
        },
        required: ['pattern']
      },
      handler: this.grepSearch.bind(this)
    });

    // Project Tools
    this.registerTool({
      name: 'get_project_structure',
      description: 'Get an overview of the project structure',
      parameters: {
        type: 'object',
        properties: {
          max_depth: {
            type: 'number',
            description: 'Maximum directory depth to scan'
          }
        }
      },
      handler: this.getProjectStructure.bind(this)
    });
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, parameters: Record<string, any>): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }

    try {
      return await tool.handler(parameters);
    } catch (error) {
      throw new Error(`Tool execution failed: ${(error as Error).message}`);
    }
  }

  // Tool Implementations
  private async readFile(params: { file_path: string }): Promise<string> {
    const fullPath = this.resolvePath(params.file_path);
    
    try {
      const content = await fs.promises.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Could not read file ${params.file_path}: ${(error as Error).message}`);
    }
  }

  private async editFile(params: { 
    file_path: string; 
    content: string; 
    operation?: 'replace' | 'append' | 'prepend' 
  }): Promise<string> {
    const fullPath = this.resolvePath(params.file_path);
    const operation = params.operation || 'replace';
    
    try {
      let finalContent = params.content;
      
      if (operation === 'append' || operation === 'prepend') {
        let existingContent = '';
        try {
          existingContent = await fs.promises.readFile(fullPath, 'utf-8');
        } catch {
          // File doesn't exist, that's ok
        }
        
        finalContent = operation === 'append' 
          ? existingContent + params.content
          : params.content + existingContent;
      }
      
      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, finalContent, 'utf-8');
      
      return `File ${params.file_path} ${operation === 'replace' ? 'created/updated' : operation + 'ed'} successfully`;
    } catch (error) {
      throw new Error(`Could not edit file ${params.file_path}: ${(error as Error).message}`);
    }
  }

  private async searchReplace(params: {
    file_path: string;
    search_text: string;
    replace_text: string;
    global?: boolean;
  }): Promise<string> {
    const fullPath = this.resolvePath(params.file_path);
    
    try {
      const content = await fs.promises.readFile(fullPath, 'utf-8');
      const flags = params.global ? 'g' : '';
      const regex = new RegExp(params.search_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newContent = content.replace(regex, params.replace_text);
      
      await fs.promises.writeFile(fullPath, newContent, 'utf-8');
      
      const replacements = content.split(params.search_text).length - 1;
      return `Replaced ${replacements} occurrence(s) in ${params.file_path}`;
    } catch (error) {
      throw new Error(`Could not perform search/replace in ${params.file_path}: ${(error as Error).message}`);
    }
  }

  private async listFiles(params: {
    directory_path: string;
    recursive?: boolean;
    filter?: string;
  }): Promise<FileInfo[]> {
    const fullPath = this.resolvePath(params.directory_path);
    
    try {
      const files: FileInfo[] = [];
      await this.scanDirectory(fullPath, files, params.recursive || false, params.filter);
      return files;
    } catch (error) {
      throw new Error(`Could not list files in ${params.directory_path}: ${(error as Error).message}`);
    }
  }

  private async scanDirectory(
    dirPath: string, 
    files: FileInfo[], 
    recursive: boolean, 
    filter?: string
  ): Promise<void> {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(this.workspacePath, fullPath);
      
      if (entry.isDirectory() && recursive) {
        await this.scanDirectory(fullPath, files, recursive, filter);
      } else if (entry.isFile()) {
        if (!filter || entry.name.endsWith(filter)) {
          const stats = await fs.promises.stat(fullPath);
          files.push({
            path: relativePath,
            name: entry.name,
            extension: path.extname(entry.name),
            size: stats.size,
            lastModified: stats.mtime
          });
        }
      }
    }
  }

  private async createFile(params: { file_path: string; content?: string }): Promise<string> {
    const fullPath = this.resolvePath(params.file_path);
    
    try {
      // Check if file already exists
      try {
        await fs.promises.access(fullPath);
        throw new Error(`File ${params.file_path} already exists`);
      } catch {
        // File doesn't exist, which is what we want
      }
      
      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, params.content || '', 'utf-8');
      
      return `File ${params.file_path} created successfully`;
    } catch (error) {
      throw new Error(`Could not create file ${params.file_path}: ${(error as Error).message}`);
    }
  }

  private async deleteFile(params: { file_path: string }): Promise<string> {
    const fullPath = this.resolvePath(params.file_path);
    
    try {
      await fs.promises.unlink(fullPath);
      return `File ${params.file_path} deleted successfully`;
    } catch (error) {
      throw new Error(`Could not delete file ${params.file_path}: ${(error as Error).message}`);
    }
  }

  private async analyzeCode(params: { 
    file_path: string; 
    analysis_type: 'imports' | 'exports' | 'functions' | 'classes' | 'dependencies' 
  }): Promise<any> {
    const content = await this.readFile({ file_path: params.file_path });
    const extension = path.extname(params.file_path);
    
    // Basic regex-based analysis (would be better with proper AST parsing)
    switch (params.analysis_type) {
      case 'imports':
        return this.extractImports(content, extension);
      case 'exports':
        return this.extractExports(content, extension);
      case 'functions':
        return this.extractFunctions(content, extension);
      case 'classes':
        return this.extractClasses(content, extension);
      case 'dependencies':
        return this.extractDependencies(content, extension);
      default:
        throw new Error(`Unknown analysis type: ${params.analysis_type}`);
    }
  }

  private extractImports(content: string, extension: string): string[] {
    const imports: string[] = [];
    
    if (extension === '.ts' || extension === '.js' || extension === '.tsx' || extension === '.jsx') {
      const importRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }
    
    return imports;
  }

  private extractExports(content: string, extension: string): string[] {
    const exports: string[] = [];
    
    if (extension === '.ts' || extension === '.js' || extension === '.tsx' || extension === '.jsx') {
      const exportRegex = /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        exports.push(match[1]);
      }
    }
    
    return exports;
  }

  private extractFunctions(content: string, extension: string): string[] {
    const functions: string[] = [];
    
    if (extension === '.ts' || extension === '.js' || extension === '.tsx' || extension === '.jsx') {
      const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=]+)\s*=>)/g;
      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        functions.push(match[1] || match[2]);
      }
    }
    
    return functions;
  }

  private extractClasses(content: string, extension: string): string[] {
    const classes: string[] = [];
    
    if (extension === '.ts' || extension === '.js' || extension === '.tsx' || extension === '.jsx') {
      const classRegex = /class\s+(\w+)/g;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        classes.push(match[1]);
      }
    }
    
    return classes;
  }

  private extractDependencies(content: string, extension: string): string[] {
    const deps: string[] = [];
    
    if (extension === '.json' && content.includes('"dependencies"')) {
      try {
        const packageJson = JSON.parse(content);
        if (packageJson.dependencies) {
          deps.push(...Object.keys(packageJson.dependencies));
        }
        if (packageJson.devDependencies) {
          deps.push(...Object.keys(packageJson.devDependencies));
        }
      } catch {
        // Invalid JSON
      }
    }
    
    return deps;
  }

  private async grepSearch(params: {
    pattern: string;
    directory?: string;
    file_pattern?: string;
    case_sensitive?: boolean;
  }): Promise<Array<{ file: string; line: number; content: string }>> {
    const searchDir = params.directory ? this.resolvePath(params.directory) : this.workspacePath;
    const results: Array<{ file: string; line: number; content: string }> = [];
    
    const flags = params.case_sensitive ? 'g' : 'gi';
    const regex = new RegExp(params.pattern, flags);
    
    await this.searchInDirectory(searchDir, regex, params.file_pattern, results);
    
    return results;
  }

  private async searchInDirectory(
    dirPath: string,
    regex: RegExp,
    filePattern?: string,
    results: Array<{ file: string; line: number; content: string }> = []
  ): Promise<void> {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await this.searchInDirectory(fullPath, regex, filePattern, results);
      } else if (entry.isFile()) {
        if (!filePattern || entry.name.match(filePattern)) {
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            
            lines.forEach((line: string, index: number) => {
              if (regex.test(line)) {
                results.push({
                  file: path.relative(this.workspacePath, fullPath),
                  line: index + 1,
                  content: line.trim()
                });
              }
            });
          } catch {
            // Skip files that can't be read
          }
        }
      }
    }
  }

  private async getProjectStructure(params: { max_depth?: number }): Promise<any> {
    const maxDepth = params.max_depth || 3;
    
    const structure = await this.buildDirectoryTree(this.workspacePath, 0, maxDepth);
    
    return {
      root: this.workspacePath,
      structure
    };
  }

  private async buildDirectoryTree(dirPath: string, currentDepth: number, maxDepth: number): Promise<any> {
    if (currentDepth >= maxDepth) {
      return null;
    }
    
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const tree: any = {};
      
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          const subtree = await this.buildDirectoryTree(fullPath, currentDepth + 1, maxDepth);
          if (subtree) {
            tree[entry.name] = subtree;
          }
        } else {
          tree[entry.name] = 'file';
        }
      }
      
      return tree;
    } catch {
      return null;
    }
  }

  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(this.workspacePath, filePath);
  }
}