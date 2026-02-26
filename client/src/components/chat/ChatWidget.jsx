import React from 'react';
import { useLocation } from 'react-router-dom';
import { HiChat, HiX } from 'react-icons/hi';
import useChat from '../../hooks/useChat';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  const { isOpen, toggleChat, unreadCount, isConnected } = useChat();
  const location = useLocation();

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && <ChatWindow />}

      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[9998] w-14 h-14 rounded-full shadow-luxe-xl flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-800 rotate-0'
            : 'bg-secondary hover:bg-secondary-600 animate-pulse-gold'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <HiX className="w-6 h-6 text-white transition-transform duration-300" />
        ) : (
          <>
            <HiChat className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />

            {/* Connection Indicator */}
            <span
              className={`absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? 'bg-green-400' : 'bg-gray-400'
              }`}
            />

            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 w-6 h-6 bg-sale text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Initial greeting tooltip (show only when chat is closed and no unread) */}
      {!isOpen && unreadCount === 0 && (
        <div
          className="fixed bottom-[152px] md:bottom-[88px] right-4 sm:right-6 z-[9997] hidden sm:block animate-fade-in-up"
          style={{ animationDelay: '3s', animationFillMode: 'both' }}
        >
          <div
            onClick={toggleChat}
            className="bg-white rounded-xl shadow-luxe-lg px-4 py-3 max-w-[220px] cursor-pointer group hover:shadow-gold transition-shadow duration-300"
          >
            <p className="text-xs font-body text-dark leading-relaxed">
              👋 Need help? Chat with us!
            </p>
            <p className="text-[10px] text-gray-400 font-body mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
              Online now
            </p>
            {/* Arrow pointing to button */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45 shadow-sm" />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;