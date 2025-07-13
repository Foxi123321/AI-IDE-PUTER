import React from 'react';
import { WorkspaceFile } from '../types';
import { PuterAIService } from '../services/PuterAIService';

interface EditorAreaProps {
  openFiles: WorkspaceFile[];
  activeFileIndex: number;
  onFileSelect: (index: number) => void;
  onFileClose: (index: number) => void;
  onFileContentChange: (index: number, content: string) => void;
  aiService: PuterAIService | null;
}

const EditorArea: React.FC<EditorAreaProps> = ({ 
  openFiles, 
  activeFileIndex, 
  onFileSelect, 
  onFileClose, 
  onFileContentChange 
}) => {
  const activeFile = openFiles[activeFileIndex];

  return (
    <div className="editor-container">
      {/* Tabs */}
      <div className="editor-tabs">
        {openFiles.map((file, index) => (
          <div 
            key={file.path}
            className={`editor-tab ${index === activeFileIndex ? 'active' : ''} ${file.isDirty ? 'dirty' : ''}`}
            onClick={() => onFileSelect(index)}
          >
            <span className="truncate">{file.path.split('/').pop()}</span>
            <button 
              className="close-button ml-2 w-4 h-4 rounded hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onFileClose(index);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4">
        {activeFile ? (
          <div className="h-full">
            <div className="mb-2 text-xs text-gray-400">
              {activeFile.path} • {activeFile.language}
            </div>
            <textarea
              className="w-full h-full bg-editor-bg text-editor-text font-mono text-sm p-4 border border-gray-600 rounded resize-none"
              value={activeFile.content}
              onChange={(e) => onFileContentChange(activeFileIndex, e.target.value)}
              placeholder="Start typing your code..."
              style={{ fontFamily: 'Cascadia Code, Monaco, monospace' }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <h2 className="text-xl mb-2">Welcome to Cursor AI Clone</h2>
              <p className="text-sm">Open a file from the sidebar to start coding</p>
              <p className="text-xs mt-2">Press Ctrl+K to ask AI for help</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorArea;