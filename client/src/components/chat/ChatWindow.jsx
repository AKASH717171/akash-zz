import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  HiX, HiPaperAirplane, HiRefresh,
  HiMinus, HiUser, HiMail, HiExclamation,
} from 'react-icons/hi';
import useChat from '../../hooks/useChat';
import ChatMessage from './ChatMessage';

// ── PRE-CHAT FORM ──────────────────────────────────────────────────────────
const PreChatForm = ({ agentName, agentAvatar, onSubmit }) => {
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim())  errs.name  = '⚠️ Please enter your name!';
    if (!email.trim()) errs.email = '⚠️ Please enter your email!';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = '⚠️ Please enter a valid email!';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    onSubmit(name.trim(), email.trim().toLowerCase());
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="px-5 pt-5 pb-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl shadow-md flex-shrink-0">
            {agentAvatar}
          </div>
          <div>
            <p className="font-heading font-bold text-primary text-sm">{agentName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />
              <span className="text-[11px] text-gray-500 font-body">Online now</span>
            </div>
          </div>
        </div>
        <p className="font-body text-sm text-gray-600 leading-relaxed">
          👋 Hi there! Before we start, please tell us a little about yourself.
        </p>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-4 mt-2">
        {/* Name */}
        <div>
          <label className="block font-body text-xs font-semibold text-gray-600 mb-1.5">
            <HiUser className="inline w-3.5 h-3.5 mr-1 text-secondary" />
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: '' })); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter your full name"
            autoComplete="name"
            className={`w-full px-4 py-3 rounded-xl border font-body text-sm text-dark placeholder-gray-400 focus:outline-none transition-all ${
              errors.name
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 bg-gray-50 focus:border-secondary focus:ring-1 focus:ring-secondary/30'
            }`}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-500 font-body">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block font-body text-xs font-semibold text-gray-600 mb-1.5">
            <HiMail className="inline w-3.5 h-3.5 mr-1 text-secondary" />
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: '' })); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter your email"
            autoComplete="email"
            className={`w-full px-4 py-3 rounded-xl border font-body text-sm text-dark placeholder-gray-400 focus:outline-none transition-all ${
              errors.email
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                : 'border-gray-200 bg-gray-50 focus:border-secondary focus:ring-1 focus:ring-secondary/30'
            }`}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500 font-body">{errors.email}</p>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-gradient-luxe text-white font-body font-semibold text-sm rounded-xl shadow-gold hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : 'Start Chat 💬'
          }
        </button>
        <p className="text-center text-[10px] text-gray-400 font-body">🔒 Your info is safe with us</p>
      </div>
    </div>
  );
};

// ── CHAT BODY (shared between mobile & desktop) ────────────────────────────
const ChatBody = ({
  messages, isConnected, chatStatus, isAdminTyping, adminTypingName,
  agentAvatar, agentName, chatError,
  inputText, setInputText, handleInputChange, handleSend, handleKeyDown,
  startNewChat, messagesEndRef, inputRef,
}) => (
  <>
    {/* Messages area */}
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-gray-50 scroll-smooth">

      {/* Error state */}
      {chatError && (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <HiExclamation className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 font-body">{chatError}</p>
          <button
            onClick={startNewChat}
            className="px-4 py-2 bg-secondary text-white text-xs font-body font-semibold rounded-xl hover:bg-secondary/90 transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Empty / loading state */}
      {!chatError && messages.length === 0 && (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3 text-2xl">
            {agentAvatar}
          </div>
          {isConnected ? (
            <p className="text-xs text-gray-400 font-body">
              👋 Welcome! {agentName} is here to help.
            </p>
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {messages.map((message, index) => (
        <ChatMessage
          key={`${message.timestamp}-${index}`}
          message={message}
          isLast={index === messages.length - 1}
          agentAvatar={agentAvatar}
        />
      ))}

      {/* Admin typing indicator */}
      {isAdminTyping && (
        <div className="flex items-start gap-2 animate-fade-in">
          <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 text-base">
            {agentAvatar}
          </div>
          <div className="flex flex-col">
            <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1">
                {[0, 150, 300].map((delay, i) => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-gray-400 font-body mt-1 ml-1">
              {adminTypingName} is typing...
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* Chat closed */}
    {chatStatus === 'closed' && (
      <div className="px-4 py-3 bg-gray-100 border-t border-gray-200 text-center flex-shrink-0">
        <p className="text-xs text-gray-500 font-body mb-2">This conversation has ended.</p>
        <button
          onClick={startNewChat}
          className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-secondary hover:text-secondary-600 transition-colors"
        >
          <HiRefresh className="w-3.5 h-3.5" /> Start New Chat
        </button>
      </div>
    )}

    {/* Input */}
    {chatStatus !== 'closed' && !chatError && (
      <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={!isConnected ? 'Connecting...' : 'Type your message...'}
            disabled={!isConnected}
            rows={1}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-body text-dark placeholder-gray-400 resize-none focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 disabled:opacity-50 transition-all"
            style={{ maxHeight: '80px', minHeight: '42px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || !isConnected}
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              inputText.trim() && isConnected
                ? 'bg-secondary text-white hover:bg-secondary-600 shadow-gold active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <HiPaperAirplane className="w-5 h-5 transform rotate-90" />
          </button>
        </div>
        <p className="text-center text-[9px] text-gray-300 font-body mt-2 select-none">
          Powered by LUXE FASHION
        </p>
      </div>
    )}
  </>
);

// ── HEADER (shared) ────────────────────────────────────────────────────────
const ChatHeader = ({ agentName, agentAvatar, isConnected, preChatDone, onMinimize, onClose, showMinimize }) => (
  <div className="bg-gradient-luxe px-4 py-3.5 flex items-center justify-between flex-shrink-0">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-secondary/20 border-2 border-secondary/60 flex items-center justify-center text-xl">
          {agentAvatar}
        </div>
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
      </div>
      <div>
        <h3 className="text-white font-heading font-bold text-sm leading-tight">
          {preChatDone ? agentName : 'LUXE FASHION'}
        </h3>
        <span className="text-[11px] text-gray-300 font-body">
          {isConnected ? 'Online · Typically replies instantly' : 'Connecting...'}
        </span>
      </div>
    </div>
    <div className="flex items-center gap-1">
      {showMinimize && (
        <button
          onClick={onMinimize}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
        >
          <HiMinus className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
      >
        <HiX className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// ── MAIN CHAT WINDOW ───────────────────────────────────────────────────────
const ChatWindow = () => {
  const {
    messages, isConnected, chatStatus,
    isAdminTyping, adminTypingName,
    agentName, agentAvatar,
    preChatDone, chatError,
    sendMessage, sendTyping, sendStopTyping,
    closeChat, startNewChat, submitPreChat,
  } = useChat();

  const [inputText,   setInputText]   = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && !isMinimized)
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAdminTyping, isMinimized]);

  useEffect(() => {
    if (!isMinimized && preChatDone && inputRef.current)
      setTimeout(() => inputRef.current?.focus(), 300);
  }, [isMinimized, preChatDone]);

  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
    sendTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => sendStopTyping(), 2000);
  }, [sendTyping, sendStopTyping]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || chatStatus === 'closed') return;
    sendMessage(inputText.trim());
    setInputText('');
    sendStopTyping();
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [inputText, chatStatus, sendMessage, sendStopTyping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const sharedBodyProps = {
    messages, isConnected, chatStatus, isAdminTyping, adminTypingName,
    agentAvatar, agentName, chatError,
    inputText, setInputText, handleInputChange, handleSend, handleKeyDown,
    startNewChat, messagesEndRef, inputRef,
  };

  // Minimized (desktop only)
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-6 z-[9999] bg-primary text-white px-5 py-3 rounded-xl shadow-luxe-xl cursor-pointer hover:bg-primary-600 transition-colors flex items-center gap-3"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-sm font-body font-medium">LUXE Chat</span>
      </div>
    );
  }

  return (
    <>
      {/* ══════════════════════════════════════
          MOBILE — full screen
      ══════════════════════════════════════ */}
      <div
        className="sm:hidden fixed inset-0 z-[9999] bg-white flex flex-col"
        style={{ height: '100dvh' }}
      >
        <ChatHeader
          agentName={agentName}
          agentAvatar={agentAvatar}
          isConnected={isConnected}
          preChatDone={preChatDone}
          onClose={closeChat}
          showMinimize={false}
        />

        {!preChatDone ? (
          <PreChatForm
            agentName={agentName}
            agentAvatar={agentAvatar}
            onSubmit={submitPreChat}
          />
        ) : (
          <ChatBody {...sharedBodyProps} />
        )}
      </div>

      {/* ══════════════════════════════════════
          DESKTOP — floating window
      ══════════════════════════════════════ */}
      <div className="hidden sm:block fixed bottom-24 right-4 sm:right-6 z-[9999] animate-scale-in">
        <div className="w-[350px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-luxe-xl flex flex-col overflow-hidden border border-gray-100">
          <ChatHeader
            agentName={agentName}
            agentAvatar={agentAvatar}
            isConnected={isConnected}
            preChatDone={preChatDone}
            onMinimize={() => setIsMinimized(true)}
            onClose={closeChat}
            showMinimize={true}
          />

          {!preChatDone ? (
            <PreChatForm
              agentName={agentName}
              agentAvatar={agentAvatar}
              onSubmit={submitPreChat}
            />
          ) : (
            <ChatBody {...sharedBodyProps} />
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWindow;