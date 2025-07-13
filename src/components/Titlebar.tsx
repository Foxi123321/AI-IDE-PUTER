import React from 'react';

interface TitlebarProps {
  title: string;
  isAIConnected: boolean;
  onToggleSidebar: () => void;
  onToggleChatPanel: () => void;
}

const Titlebar: React.FC<TitlebarProps> = ({ 
  title, 
  isAIConnected, 
  onToggleSidebar, 
  onToggleChatPanel 
}) => {
  return (
    <div className="titlebar drag-region">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full no-drag-region cursor-pointer hover:bg-red-600"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full no-drag-region cursor-pointer hover:bg-yellow-600"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full no-drag-region cursor-pointer hover:bg-green-600"></div>
        </div>
        
        <span className="text-sm font-medium ml-4">{title}</span>
        
        <div className="flex items-center space-x-1 ml-4">
          <div className={`w-2 h-2 rounded-full ${isAIConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs text-gray-400">
            {isAIConnected ? 'AI Connected' : 'AI Disconnected'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 no-drag-region">
        <button 
          onClick={onToggleSidebar}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          Sidebar
        </button>
        <button 
          onClick={onToggleChatPanel}
          className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 rounded"
        >
          Chat
        </button>
      </div>
    </div>
  );
};

export default Titlebar;