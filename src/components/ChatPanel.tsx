import React, { useState } from 'react';
import { ChatSession } from '../types';

interface ChatPanelProps {
  session?: ChatSession;
  allSessions: ChatSession[];
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onSendMessage: (message: string) => void;
  isAIConnected: boolean;
  width: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  session, 
  allSessions, 
  onNewSession, 
  onSelectSession, 
  onSendMessage, 
  isAIConnected, 
  width 
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && isAIConnected) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel" style={{ width }}>
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="flex items-center justify-between">
            <span>AI Chat</span>
            <button 
              onClick={onNewSession}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {!session ? (
            <div className="text-center text-gray-400">
              <p>Start a new chat to begin</p>
              <button 
                onClick={onNewSession}
                className="mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                New Chat
              </button>
            </div>
          ) : session.messages.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>Ask me anything about your code!</p>
              <p className="text-xs mt-1">Try: "Explain this function" or "Refactor this code"</p>
            </div>
          ) : (
            session.messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
                <div className="text-xs text-gray-400 mb-1">
                  {msg.role === 'user' ? 'You' : 'AI'} • {msg.timestamp.toLocaleTimeString()}
                </div>
                <div>{msg.content}</div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isAIConnected ? "Ask AI anything..." : "AI not connected"}
            disabled={!isAIConnected}
            rows={2}
          />
          <button 
            onClick={handleSend}
            disabled={!message.trim() || !isAIConnected}
            className="mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
          >
            Send
          </button>
          
          {!isAIConnected && (
            <div className="mt-2 text-xs text-red-400">
              ⚠️ AI service not connected. Check puter.js integration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;