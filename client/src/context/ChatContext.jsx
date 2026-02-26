import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

export const ChatContext = createContext(null);

const SOCKET_URL        = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const VISITOR_ID_KEY    = 'luxe_visitor_id';
const VISITOR_NAME_KEY  = 'luxe_visitor_name';
const VISITOR_EMAIL_KEY = 'luxe_visitor_email';

export const ChatProvider = ({ children }) => {
  const [isOpen,          setIsOpen]          = useState(false);
  const [isConnected,     setIsConnected]     = useState(false);
  const [messages,        setMessages]        = useState([]);
  const [unreadCount,     setUnreadCount]     = useState(0);
  const [chatId,          setChatId]          = useState(null);
  const [visitorId,       setVisitorId]       = useState('');
  const [visitorName,     setVisitorName]     = useState('');
  const [visitorEmail,    setVisitorEmail]    = useState('');
  const [chatState,       setChatState]       = useState('initial');
  const [isAdminTyping,   setIsAdminTyping]   = useState(false);
  const [adminTypingName, setAdminTypingName] = useState('Agent');
  const [chatStatus,      setChatStatus]      = useState('active');
  const [agentName,       setAgentName]       = useState('Support Agent');
  const [agentAvatar,     setAgentAvatar]     = useState('👩');

  // preChatDone: শুধু তখনই true হবে যখন server থেকে chat:history আসবে
  // অথবা user নতুন করে form submit করবে
  const [preChatDone,     setPreChatDone]     = useState(false);
  const [chatError,       setChatError]       = useState('');

  const socketRef        = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    let storedId = localStorage.getItem(VISITOR_ID_KEY);
    if (!storedId) {
      storedId = `visitor_${uuidv4()}`;
      localStorage.setItem(VISITOR_ID_KEY, storedId);
    }
    setVisitorId(storedId);

    const storedName  = localStorage.getItem(VISITOR_NAME_KEY)  || '';
    const storedEmail = localStorage.getItem(VISITOR_EMAIL_KEY) || '';
    setVisitorName(storedName);
    setVisitorEmail(storedEmail);
    // preChatDone এখানে set করবো না — socket connect হওয়ার পরে server confirm করলে set হবে
  }, []);

  useEffect(() => {
    if (!visitorId) return;

    const socket = io(SOCKET_URL, {
      transports:           ['websocket', 'polling'],
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    2000,
      timeout:              10000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setChatError('');
      socket.emit('visitor:connect', {
        visitorId,
        visitorName:  localStorage.getItem(VISITOR_NAME_KEY)  || '',
        visitorEmail: localStorage.getItem(VISITOR_EMAIL_KEY) || '',
      });
    });

    socket.on('disconnect',    () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socket.on('chat:history', (data) => {
      setChatId(data.chatId);
      setMessages(data.messages || []);
      setChatState(data.chatState || 'active_chat');
      setChatStatus(data.status  || 'active');
      if (data.agentName)   setAgentName(data.agentName);
      if (data.agentAvatar) setAgentAvatar(data.agentAvatar);
      if (data.visitorName)  {
        setVisitorName(data.visitorName);
        localStorage.setItem(VISITOR_NAME_KEY, data.visitorName);
      }
      if (data.visitorEmail) {
        setVisitorEmail(data.visitorEmail);
        localStorage.setItem(VISITOR_EMAIL_KEY, data.visitorEmail);
      }

      // Server থেকে আসা data-ই একমাত্র সত্য।
      // localStorage fallback রাখা যাবে না — পুরনো session-এর data থাকলে
      // নতুন visitor-এর form skip হয়ে যেত (bug!)
      const nm = data.visitorName  || '';
      const em = data.visitorEmail || '';
      if (nm && em) {
        setPreChatDone(true);
      } else {
        // Server-এ name/email নেই → pre-chat form দেখাও
        setPreChatDone(false);
      }
    });

    socket.on('chat:new_message', (data) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.text === data.message.text &&
            m.sender === data.message.sender &&
            Math.abs(new Date(m.timestamp) - new Date(data.message.timestamp)) < 2000
        );
        if (exists) return prev;
        return [...prev, data.message];
      });
      setUnreadCount((prev) => (data.message.sender !== 'visitor' ? prev + 1 : prev));
    });

    socket.on('chat:admin_typing', (data) => {
      setIsAdminTyping(data.isTyping);
      if (data.agentName) setAdminTypingName(data.agentName);
      if (data.isTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsAdminTyping(false), 5000);
      }
    });

    socket.on('chat:closed', (data) => {
      if (data.message) setMessages((prev) => [...prev, data.message]);
      setChatStatus('closed');
    });

    socket.on('chat:deleted', () => {
      setMessages([]);
      setChatId(null);
      setChatStatus('active');
      setChatState('initial');
    });

    socket.on('chat:error', (data) => {
      setChatError(data.message || 'Connection error. Please try again.');
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [visitorId]);

  useEffect(() => { if (isOpen) setUnreadCount(0); }, [isOpen]);

  const sendMessage = useCallback((text) => {
    if (!text || !text.trim() || !socketRef.current || !isConnected || chatStatus === 'closed') return;
    socketRef.current.emit('visitor:send_message', { visitorId, text: text.trim(), chatId });
    setMessages((prev) => [
      ...prev,
      {
        sender:    'visitor',
        senderName: visitorName || 'You',
        text:      text.trim(),
        timestamp: new Date().toISOString(),
        read:      false,
      },
    ]);
  }, [visitorId, chatId, isConnected, chatStatus, visitorName]);

  const sendTyping = useCallback(() => {
    if (socketRef.current && isConnected)
      socketRef.current.emit('visitor:typing', { visitorId, chatId });
  }, [visitorId, chatId, isConnected]);

  const sendStopTyping = useCallback(() => {
    if (socketRef.current && isConnected)
      socketRef.current.emit('visitor:stop_typing', { visitorId, chatId });
  }, [visitorId, chatId, isConnected]);

  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);
  const openChat   = useCallback(() => setIsOpen(true),  []);
  const closeChat  = useCallback(() => setIsOpen(false), []);

  // Pre-chat form submit
  const submitPreChat = useCallback((name, email) => {
    localStorage.setItem(VISITOR_NAME_KEY,  name);
    localStorage.setItem(VISITOR_EMAIL_KEY, email);
    setVisitorName(name);
    setVisitorEmail(email);
    setPreChatDone(true);
    setChatError('');
    if (socketRef.current && isConnected) {
      socketRef.current.emit('visitor:connect', {
        visitorId,
        visitorName:  name,
        visitorEmail: email,
      });
    }
  }, [visitorId, isConnected]);

  // Reset করে নতুন chat শুরু
  const startNewChat = useCallback(() => {
    const newId = `visitor_${uuidv4()}`;
    localStorage.setItem(VISITOR_ID_KEY, newId);
    localStorage.removeItem(VISITOR_NAME_KEY);
    localStorage.removeItem(VISITOR_EMAIL_KEY);
    setVisitorId(newId);
    setMessages([]);
    setChatId(null);
    setChatStatus('active');
    setChatState('initial');
    setPreChatDone(false);
    setVisitorName('');
    setVisitorEmail('');
    setChatError('');
  }, []);

  const value = {
    isOpen, isConnected, messages, unreadCount, chatId, visitorId,
    visitorName, visitorEmail, chatState, chatStatus,
    isAdminTyping, adminTypingName,
    agentName, agentAvatar,
    preChatDone, chatError,
    sendMessage, sendTyping, sendStopTyping,
    toggleChat, openChat, closeChat,
    submitPreChat, startNewChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
};

export default ChatProvider;