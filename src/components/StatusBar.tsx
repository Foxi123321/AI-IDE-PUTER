import React from 'react';
import { WorkspaceFile } from '../types';

interface StatusBarProps {
  activeFile?: WorkspaceFile;
  isAIConnected: boolean;
  aiModel: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  activeFile, 
  isAIConnected, 
  aiModel 
}) => {
  return (
    <div className="statusbar">
      <div className="flex items-center space-x-4">
        {activeFile && (
          <>
            <span className="text-xs">
              {activeFile.path}
            </span>
            <span className="text-xs text-gray-300">
              {activeFile.language}
            </span>
            {activeFile.isDirty && (
              <span className="text-xs text-yellow-300">●</span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-xs">
          AI: {aiModel}
        </span>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isAIConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
          <span className="text-xs">
            {isAIConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <span className="text-xs text-gray-300">
          Cursor AI Clone v1.0.0
        </span>
      </div>
    </div>
  );
};

export default StatusBar;