import { 
  AICompletionRequest, 
  AICompletionResponse, 
  AIMessage, 
  PuterAIConfig,
  Tool,
  ToolCall
} from '@/types';

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (messages: any[], options?: any) => Promise<any>;
        models: {
          list: () => Promise<any[]>;
        };
      };
    };
  }
}

export class PuterAIService {
  private config: PuterAIConfig;
  private isInitialized = false;

  constructor(config: PuterAIConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Warten bis puter.js geladen ist
      await this.waitForPuter();
      this.isInitialized = true;
      console.log('PuterAI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PuterAI Service:', error);
      throw error;
    }
  }

  private async waitForPuter(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;
      
      const checkPuter = () => {
        if (window.puter?.ai) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Puter.js not found after maximum attempts'));
        } else {
          attempts++;
          setTimeout(checkPuter, 100);
        }
      };
      
      checkPuter();
    });
  }

  async getAvailableModels(): Promise<string[]> {
    if (!this.isInitialized) {
      throw new Error('PuterAI Service not initialized');
    }

    try {
      const models = await window.puter.ai.models.list();
      return models.map(model => model.id || model.name);
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [this.config.model]; // Fallback auf konfigurierten Model
    }
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.isInitialized) {
      throw new Error('PuterAI Service not initialized');
    }

    try {
      const messages = this.buildMessages(request);
      const options = this.buildOptions(request);

      const response = await window.puter.ai.chat(messages, options);
      
      return this.parseResponse(response, request.model);
    } catch (error) {
      console.error('AI completion failed:', error);
      throw new Error(`AI completion failed: ${(error as Error).message}`);
    }
  }

  async streamComplete(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void,
    onDone: (response: AICompletionResponse) => void
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('PuterAI Service not initialized');
    }

    try {
      const messages = this.buildMessages(request);
      const options = {
        ...this.buildOptions(request),
        stream: true
      };

      let fullContent = '';
      const response = await window.puter.ai.chat(messages, options);

      // Handle streaming response (implementation depends on puter.js API)
      if (response && typeof response.pipe === 'function') {
        response.on('data', (chunk: any) => {
          const content = chunk.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk(content);
          }
        });

        response.on('end', () => {
          onDone({
            content: fullContent,
            model: request.model,
            usage: {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0
            }
          });
        });
      } else {
        // Fallback for non-streaming
        const result = this.parseResponse(response, request.model);
        onChunk(result.content);
        onDone(result);
      }
    } catch (error) {
      console.error('Streaming completion failed:', error);
      throw new Error(`Streaming completion failed: ${(error as Error).message}`);
    }
  }

  async executeTools(toolCalls: ToolCall[], availableTools: Tool[]): Promise<ToolCall[]> {
    const results: ToolCall[] = [];

    for (const toolCall of toolCalls) {
      const tool = availableTools.find(t => t.name === toolCall.name);
      
      if (!tool) {
        results.push({
          ...toolCall,
          error: `Tool '${toolCall.name}' not found`
        });
        continue;
      }

      try {
        const result = await tool.handler(toolCall.parameters);
        results.push({
          ...toolCall,
          result
        });
      } catch (error) {
        results.push({
          ...toolCall,
          error: (error as Error).message
        });
      }
    }

    return results;
  }

  private buildMessages(request: AICompletionRequest): any[] {
    const messages: any[] = [];

    // System message with context
    if (request.context) {
      const systemPrompt = this.buildSystemPrompt(request.context);
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // User prompt
    messages.push({
      role: 'user',
      content: request.prompt
    });

    return messages;
  }

  private buildSystemPrompt(context: any): string {
    let prompt = `You are an AI coding assistant integrated into a code editor similar to Cursor.

Current file: ${context.filePath}
Language: ${context.language}
Current position: Line ${context.cursorPosition.line}, Column ${context.cursorPosition.column}

`;

    if (context.selection) {
      prompt += `Selected text: Lines ${context.selection.start.line}-${context.selection.end.line}\n`;
    }

    if (context.projectContext) {
      prompt += `Project type: ${context.projectContext.framework || 'Unknown'}\n`;
      prompt += `Dependencies: ${context.projectContext.dependencies.slice(0, 10).join(', ')}\n`;
    }

    prompt += `
Please provide helpful, accurate, and contextual assistance for coding tasks.
When suggesting code changes, explain your reasoning.
Follow best practices for the detected language and framework.
`;

    return prompt;
  }

  private buildOptions(request: AICompletionRequest): any {
    const options: any = {
      model: request.model || this.config.model,
      temperature: request.temperature ?? this.config.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? this.config.maxTokens ?? 2048,
    };

    if (request.tools && request.tools.length > 0) {
      options.tools = request.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
    }

    return options;
  }

  private parseResponse(response: any, model: string): AICompletionResponse {
    let content = '';
    let tools: ToolCall[] = [];

    if (response.choices && response.choices[0]) {
      const choice = response.choices[0];
      content = choice.message?.content || choice.text || '';
      
      if (choice.message?.tool_calls) {
        tools = choice.message.tool_calls.map((tc: any) => ({
          id: tc.id,
          name: tc.function.name,
          parameters: JSON.parse(tc.function.arguments || '{}')
        }));
      }
    } else {
      // Handle direct response format
      content = response.content || response.text || String(response);
    }

    return {
      content,
      model,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      tools: tools.length > 0 ? tools : undefined
    };
  }

  isReady(): boolean {
    return this.isInitialized && !!window.puter?.ai;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.complete({
        prompt: 'Hello, can you hear me?',
        model: this.config.model
      });
      return !!response.content;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}