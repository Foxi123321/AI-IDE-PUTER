import React from 'react';

interface SidebarProps {
  currentWorkspace: string | null;
  onOpenFile: (filePath: string) => void;
  onOpenWorkspace: (workspacePath: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentWorkspace, 
  onOpenFile, 
  onOpenWorkspace 
}) => {
  return (
    <div className="sidebar">
      <div className="file-explorer">
        <h3 className="text-sm font-semibold mb-2">Explorer</h3>
        
        {!currentWorkspace ? (
          <div className="text-xs text-gray-400">
            <p>No folder open</p>
            <button 
              onClick={() => onOpenWorkspace('/example/workspace')}
              className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              Open Folder
            </button>
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-300 mb-2">
              📁 {currentWorkspace}
            </div>
            
            <div className="space-y-1">
              {/* Example files */}
              <div 
                className="file-tree-item file cursor-pointer"
                onClick={() => onOpenFile('example.ts')}
              >
                📄 example.ts
              </div>
              <div 
                className="file-tree-item file cursor-pointer"
                onClick={() => onOpenFile('package.json')}
              >
                📄 package.json
              </div>
              <div 
                className="file-tree-item file cursor-pointer"
                onClick={() => onOpenFile('README.md')}
              >
                📄 README.md
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;