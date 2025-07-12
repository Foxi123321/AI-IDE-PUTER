import React from 'react';
import { Minus, Square, X, Menu } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export const TitleBar: React.FC = () => {
  const { currentWorkspace } = useAppStore();

  const handleMinimize = () => {
    window.electronAPI?.window.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI?.window.maximize();
  };

  const handleClose = () => {
    window.electronAPI?.window.close();
  };

  const getWorkspaceName = () => {
    if (!currentWorkspace) return 'Puter Cursor AI';
    return `Puter Cursor AI - ${currentWorkspace.split('/').pop()}`;
  };

  return (
    <div 
      className="flex items-center justify-between h-8 bg-gray-800 border-b border-gray-700 select-none"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Left side - Menu and title */}
      <div className="flex items-center px-3">
        <Menu size={14} className="text-gray-400 mr-2" />
        <span className="text-sm text-gray-200 font-medium">
          {getWorkspaceName()}
        </span>
      </div>

      {/* Center - Breadcrumbs or status */}
      <div className="flex-1 flex justify-center">
        <div className="text-xs text-gray-400">
          {/* This could show current file path or git branch */}
        </div>
      </div>

      {/* Right side - Window controls */}
      <div className="flex">
        <button
          onClick={handleMinimize}
          className="h-8 w-12 flex items-center justify-center hover:bg-gray-700 transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <Minus size={14} className="text-gray-400" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-8 w-12 flex items-center justify-center hover:bg-gray-700 transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <Square size={12} className="text-gray-400" />
        </button>
        <button
          onClick={handleClose}
          className="h-8 w-12 flex items-center justify-center hover:bg-red-600 transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <X size={14} className="text-gray-400 hover:text-white" />
        </button>
      </div>
    </div>
  );
};