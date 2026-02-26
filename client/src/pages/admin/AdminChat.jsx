import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  HiChat, HiPaperAirplane, HiTrash, HiX,
  HiCog, HiRefresh, HiBadgeCheck, HiLightningBolt,
  HiCheck, HiPlus, HiPencil,
  HiMail, HiGlobe, HiDesktopComputer, HiClock, HiChevronDown,
} from 'react-icons/hi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const fmtFull = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

// ── AGENT MODAL ────────────────────────────────────────────────────────────
const AgentModal = ({ onClose, onAgentSelected }) => {
  const [agents,  setAgents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);
  const [newName,   setNewName]   = useState('');
  const [newAvatar, setNewAvatar] = useState('👩');

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/chat/agents');
      if (data.success) setAgents(data.agents || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const addAgent = async () => {
    if (!newName.trim()) return;
    const COLORS = ['#E91E8C','#9C27B0','#F44336','#FF9800','#4CAF50','#2196F3','#673AB7'];
    try {
      await api.post('/chat/agents', {
        name: newName.trim(),
        avatar: newAvatar,
        avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      toast.success('Agent added!');
      setNewName(''); setAdding(false);
      fetchAgents();
    } catch { toast.error('Failed to add agent'); }
  };

  const toggleOnline = async (agent) => {
    try { await api.put(`/chat/agents/${agent._id}`, { isOnline: !agent.isOnline }); fetchAgents(); }
    catch {}
  };

  const setActive = async (agent) => {
    try {
      await api.put(`/chat/agents/${agent._id}`, { isActive: true });
      toast.success(`${agent.name} is now the active agent!`);
      fetchAgents();
      onAgentSelected(agent);
    } catch { toast.error('Failed'); }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm('Delete this agent?')) return;
    try { await api.delete(`/chat/agents/${id}`); fetchAgents(); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-heading text-lg font-bold text-primary">👩 Agent Names</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-7 h-7 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent._id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${agent.isActive ? 'border-secondary bg-secondary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: (agent.avatarColor || '#C4A35A') + '22' }}>
                    {agent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-body font-semibold text-sm text-primary">{agent.name}</span>
                      {agent.isActive && (
                        <span className="text-[10px] bg-secondary/20 text-secondary font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
                      <span className="text-[11px] text-gray-400 font-body">{agent.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleOnline(agent)} title={agent.isOnline ? 'Set offline' : 'Set online'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${agent.isOnline ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {agent.isOnline ? '🟢' : '⚫'}
                    </button>
                    {!agent.isActive && (
                      <button onClick={() => setActive(agent)} title="Set as active agent"
                        className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 flex items-center justify-center transition-colors">
                        <HiCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteAgent(agent._id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition-colors">
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adding ? (
            <div className="mt-4 p-4 border-2 border-dashed border-secondary/30 rounded-xl bg-secondary/5">
              <p className="font-body text-xs font-semibold text-gray-600 mb-2">New Agent Name</p>
              <div className="flex gap-2 mb-3 flex-wrap">
                {['👩','👩‍🦱','👩‍🦰','👸','🧑‍💼','👩‍💼','🌸','💎'].map((av) => (
                  <button key={av} onClick={() => setNewAvatar(av)}
                    className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${newAvatar === av ? 'bg-secondary/20 ring-2 ring-secondary scale-110' : 'hover:bg-gray-100'}`}>
                    {av}
                  </button>
                ))}
              </div>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAgent()}
                placeholder="Agent name (e.g. Emma)" autoFocus
                className="w-full px-3 py-2 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary mb-3" />
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="flex-1 py-2 border border-gray-200 rounded-xl font-body text-xs text-gray-500 hover:bg-gray-50">Cancel</button>
                <button onClick={addAgent} className="flex-1 py-2 bg-secondary text-white rounded-xl font-body text-xs font-semibold hover:bg-secondary/90">Add Agent</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl font-body text-sm text-gray-400 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2">
              <HiPlus className="w-4 h-4" /> Add New Agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── SETTINGS MODAL ─────────────────────────────────────────────────────────
const SettingsModal = ({ onClose, onSaved }) => {
  const [settings, setSettings] = useState({
    welcomeMessage: '', askNameMessage: '', askEmailMessage: '',
    couponMessage: '', offlineMessage: '', couponCode: '',
    autoReplyEnabled: true, isOnline: true, quickReplies: [],
  });
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editingQR, setEditingQR] = useState(null);

  useEffect(() => {
    api.get('/chat/admin/settings')
      .then(({ data }) => { if (data.success) setSettings(data.settings || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/chat/admin/settings', settings);
      toast.success('Settings saved!');
      if (onSaved) onSaved(settings.quickReplies);
      onClose();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const updateQR = (index, field, value) => {
    const updated = [...(settings.quickReplies || [])];
    updated[index] = { ...updated[index], [field]: value };
    setSettings((s) => ({ ...s, quickReplies: updated }));
  };

  const addQR = () => {
    const newQR = { label: 'New Reply', icon: '💬', text: '', order: (settings.quickReplies || []).length + 1 };
    setSettings((s) => ({ ...s, quickReplies: [...(s.quickReplies || []), newQR] }));
    setEditingQR((settings.quickReplies || []).length);
  };

  const deleteQR = (index) => {
    setSettings((s) => ({ ...s, quickReplies: (s.quickReplies || []).filter((_, i) => i !== index) }));
    if (editingQR === index) setEditingQR(null);
  };

  const IN = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20';
  const TA = IN + ' resize-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-heading text-lg font-bold text-primary">Chat Settings</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'isOnline',         label: 'Online Status', color: 'green'     },
                { key: 'autoReplyEnabled', label: 'Auto Reply',    color: 'secondary' },
              ].map(({ key, label, color }) => (
                <div key={key}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${settings[key] ? `border-${color}-400 bg-${color}-50` : 'border-gray-200 bg-gray-50'}`}
                  onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}>
                  <div>
                    <p className="font-body text-sm font-semibold text-gray-700">{label}</p>
                    <p className="font-body text-xs text-gray-500">{settings[key] ? 'Enabled' : 'Disabled'}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings[key] ? (color === 'green' ? 'bg-green-400' : 'bg-secondary') : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[key] ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>

            {[
              { key: 'welcomeMessage',  label: 'Welcome Message'                    },
              { key: 'askNameMessage',  label: 'Ask Name Message'                   },
              { key: 'askEmailMessage', label: 'Ask Email Message (use {name})'     },
              { key: 'couponMessage',   label: 'Coupon Message (use {coupon})'      },
              { key: 'offlineMessage',  label: 'Offline Message'                    },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block font-body text-sm font-semibold text-gray-700 mb-1">{label}</label>
                <textarea rows={2} className={TA} value={settings[key] || ''}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} />
              </div>
            ))}

            <div>
              <label className="block font-body text-sm font-semibold text-gray-700 mb-1">Coupon Code</label>
              <input className={IN + ' uppercase'} value={settings.couponCode || ''}
                onChange={(e) => setSettings((s) => ({ ...s, couponCode: e.target.value.toUpperCase() }))} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-body text-sm font-semibold text-gray-700">⚡ Quick Reply Templates</label>
                <button onClick={addQR} className="flex items-center gap-1 text-xs text-secondary font-body font-semibold hover:underline">
                  <HiPlus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(settings.quickReplies || []).map((qr, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer"
                      onClick={() => setEditingQR(editingQR === idx ? null : idx)}>
                      <span className="text-base">{qr.icon}</span>
                      <span className="font-body text-sm font-semibold text-gray-700 flex-1 truncate">{qr.label}</span>
                      <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${editingQR === idx ? 'rotate-180' : ''}`} />
                      <button onClick={(e) => { e.stopPropagation(); deleteQR(idx); }} className="text-red-400 hover:text-red-600 p-1">
                        <HiTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {editingQR === idx && (
                      <div className="p-3 space-y-2">
                        <div className="flex gap-2">
                          <input placeholder="Icon" value={qr.icon}
                            onChange={(e) => updateQR(idx, 'icon', e.target.value)}
                            className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-center font-body text-sm focus:outline-none" />
                          <input placeholder="Label" value={qr.label}
                            onChange={(e) => updateQR(idx, 'label', e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none" />
                        </div>
                        <textarea rows={2} placeholder="Message text..." value={qr.text}
                          onChange={(e) => updateQR(idx, 'text', e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none resize-none" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-body text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-secondary text-white rounded-xl font-body text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-secondary/90">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <HiCheck className="w-4 h-4" />}
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── LINK RENDER HELPER ─────────────────────────────────────────────────────
// [link:Button Text|https://url.com] টোকেন parse করে clickable button বানায়
const renderMsgContent = (text, isAdminBubble = false) => {
  if (!text) return null;
  const LINK_RE = /\[link:([^\]|]+)\|([^\]]+)\]/g;
  const parts = [];
  let last = 0, m;
  while ((m = LINK_RE.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) });
    parts.push({ type: 'link', label: m[1].trim(), url: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });

  return parts.map((part, i) => {
    if (part.type === 'link') {
      return (
        <a key={i} href={part.url} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1.5 mt-1.5 mr-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            isAdminBubble
              ? 'bg-white/20 text-white border border-white/40 hover:bg-white/30'
              : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
          }`}>
          🔗 {part.label}
          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
    }
    return <span key={i} className="whitespace-pre-wrap break-words">{part.value}</span>;
  });
};

// ── MAIN ───────────────────────────────────────────────────────────────────
const AdminChat = () => {
  const socketRef        = useRef(null);
  const messagesEndRef   = useRef(null);
  const selectedChatRef  = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [chats,          setChats]          = useState([]);
  const [selectedChat,   setSelectedChat]   = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [reply,          setReply]          = useState('');
  const [loading,        setLoading]        = useState(true);
  const [visitorTyping,  setVisitorTyping]  = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [onlineCount,    setOnlineCount]    = useState(0);
  const [activeAgent,    setActiveAgent]    = useState({ name: 'Support Agent', avatar: '👩', avatarColor: '#C4A35A' });
  const [quickReplies,   setQuickReplies]   = useState([]);

  // ── নতুন: Link attach state ──
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [linkText,      setLinkText]      = useState('');
  const [linkUrl,       setLinkUrl]       = useState('');

  useEffect(() => {
    api.get('/chat/agents').then(({ data }) => {
      if (data.success && data.agents?.length) {
        const active = data.agents.find((a) => a.isActive) || data.agents.find((a) => a.isOnline) || data.agents[0];
        if (active) setActiveAgent(active);
      }
    }).catch(() => {});

    api.get('/chat/admin/settings').then(({ data }) => {
      if (data.success && data.settings?.quickReplies)
        setQuickReplies(data.settings.quickReplies);
    }).catch(() => {});
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/admin/all?limit=20');
      if (data.success) setChats(data.chats || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  useEffect(() => {
    const token  = localStorage.getItem('luxe_token');
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'], auth: { token } });
    socketRef.current = socket;

    socket.on('connect',       () => socket.emit('admin:join', { token, adminId: 'admin_' + Date.now() }));
    socket.on('admin:stats',   (data) => setOnlineCount(data.onlineVisitors || 0));
    socket.on('chat:visitor_connected', fetchChats);
    socket.on('chat:updated',  fetchChats);

    socket.on('chat:new_message', (data) => {
      fetchChats();
      if (selectedChatRef.current && data.chatId === selectedChatRef.current._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id && m._id === data.message._id);
          return exists ? prev : [...prev, data.message];
        });
      }
    });

    socket.on('chat:visitor_typing', (data) => {
      if (selectedChatRef.current && data.chatId === selectedChatRef.current._id) {
        setVisitorTyping(data.isTyping);
        if (data.isTyping) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setVisitorTyping(false), 4000);
        }
      }
    });

    socket.on('chat:deleted', () => {
      fetchChats();
      setSelectedChat(null);
      selectedChatRef.current = null;
      setMessages([]);
    });

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, visitorTyping]);

  const openChat = useCallback((chat) => {
    setSelectedChat(chat);
    selectedChatRef.current = chat;
    setMessages(chat.messages || []);
    setVisitorTyping(false);
    if (socketRef.current) socketRef.current.emit('admin:open_chat', { chatId: chat._id });
    setChats((prev) => prev.map((c) => c._id === chat._id ? { ...c, unreadCount: 0 } : c));
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    api.get(`/chat/admin/${selectedChat._id}`)
      .then(({ data }) => { if (data.success) setMessages(data.chat.messages || []); })
      .catch(() => {});
  }, [selectedChat]);

  const sendReply = () => {
    if (!reply.trim() || !selectedChat || !socketRef.current) return;
    socketRef.current.emit('admin:send_reply', {
      chatId:    selectedChat._id,
      visitorId: selectedChat.visitorId,
      text:      reply.trim(),
      agentName: activeAgent.name,
    });
    setReply('');
  };

  // ── নতুন: Link attach করে message এ যোগ করে ──
  const attachLink = () => {
    if (!linkText.trim() || !linkUrl.trim()) return;
    const tag = `[link:${linkText.trim()}|${linkUrl.trim()}]`;
    setReply((prev) => (prev ? prev + ' ' + tag : tag));
    setLinkText('');
    setLinkUrl('');
    setShowLinkPanel(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  };

  const handleTyping = (e) => {
    setReply(e.target.value);
    if (!socketRef.current || !selectedChat) return;
    socketRef.current.emit('admin:typing', {
      chatId: selectedChat._id, visitorId: selectedChat.visitorId, agentName: activeAgent.name,
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('admin:stop_typing', {
        chatId: selectedChat._id, visitorId: selectedChat.visitorId, agentName: activeAgent.name,
      });
    }, 1500);
  };

  const useQuickReply = (text) => {
    setReply(text.replace(/\[Name\]/g, activeAgent.name).replace(/\[Company\]/g, 'LUXE FASHION'));
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await api.delete(`/chat/admin/${chatId}`);
      toast.success('Deleted');
      if (selectedChat?._id === chatId) { setSelectedChat(null); selectedChatRef.current = null; setMessages([]); }
      fetchChats();
    } catch { toast.error('Delete failed'); }
  };

  const STATUS_DOT = { active: 'bg-green-400', waiting: 'bg-yellow-400', closed: 'bg-gray-400', pending: 'bg-blue-400' };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSaved={(qr) => { if (qr) setQuickReplies(qr); }}
        />
      )}
      {showAgentModal && (
        <AgentModal
          onClose={() => setShowAgentModal(false)}
          onAgentSelected={(agent) => { setActiveAgent(agent); setShowAgentModal(false); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="font-heading text-2xl font-bold text-primary">Live Chat</h2>
          <p className="font-body text-sm text-gray-400 flex items-center gap-2">
            <span>{chats.length} conversations</span>
            {onlineCount > 0 && (
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block" />
                {onlineCount} online now
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAgentModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary/10 text-secondary rounded-xl font-body text-sm font-semibold hover:bg-secondary/20 transition-colors border border-secondary/20">
            <span className="text-base">{activeAgent.avatar}</span>
            <span>{activeAgent.name}</span>
            <HiChevronDown className="w-4 h-4" />
          </button>
          <button onClick={fetchChats}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:border-gray-300 text-gray-500 transition-colors">
            <HiRefresh className="w-4 h-4" />
          </button>
          <button onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-body text-sm font-semibold hover:bg-primary/90 transition-colors">
            <HiCog className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Left — Visitor List */}
        <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-luxe flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
            <p className="font-body text-xs font-bold text-gray-500 uppercase tracking-wider">Visitors ({chats.length})</p>
            {onlineCount > 0 && <span className="text-xs font-body text-green-600 font-semibold">{onlineCount} live</span>}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-7 h-7 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <HiChat className="w-10 h-10 text-gray-200 mb-2" />
              <p className="font-body text-sm text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {chats.slice(0, 20).map((chat) => {
                const isSelected = selectedChat?._id === chat._id;
                const unread     = chat.unreadCount || 0;
                const name       = chat.visitorName || 'Visitor';
                return (
                  <div key={chat._id} onClick={() => openChat(chat)}
                    className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-all ${isSelected ? 'bg-primary/5 border-l-4 border-l-secondary' : 'hover:bg-gray-50'}`}>
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-white text-sm ${isSelected ? 'bg-secondary' : 'bg-primary/80'}`}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[chat.status] || 'bg-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-body text-sm font-semibold truncate ${unread > 0 ? 'text-primary' : 'text-gray-700'}`}>{name}</span>
                        {unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-secondary text-white text-xs flex items-center justify-center font-bold flex-shrink-0 ml-1">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-xs text-gray-400 truncate mt-0.5">
                        {chat.lastMessage?.text || 'No messages yet'}
                      </p>
                      {chat.visitorEmail && (
                        <p className="font-body text-[10px] text-gray-300 truncate">{chat.visitorEmail}</p>
                      )}
                    </div>
                    <button onClick={(e) => deleteChat(chat._id, e)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-all flex-shrink-0">
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Chat Window */}
        <div className="flex-1 bg-white rounded-2xl shadow-luxe flex flex-col overflow-hidden min-w-0">
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                <HiChat className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="font-heading text-xl font-bold text-primary mb-2">Select a Conversation</h3>
              <p className="font-body text-sm text-gray-400 max-w-xs">Click on a visitor from the left panel to start chatting</p>
              <div className="mt-4 p-3 bg-secondary/10 rounded-xl text-sm font-body text-secondary font-semibold flex items-center gap-2">
                <span className="text-base">{activeAgent.avatar}</span>
                Replying as <strong>{activeAgent.name}</strong>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center font-heading font-bold text-white">
                        {(selectedChat.visitorName || 'V').charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[selectedChat.status] || 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-body font-bold text-sm text-primary">{selectedChat.visitorName || 'Visitor'}</span>
                        {selectedChat.visitorEmail && <HiBadgeCheck className="w-4 h-4 text-secondary" />}
                      </div>
                      <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full capitalize ${
                        selectedChat.status === 'active'  ? 'bg-green-100 text-green-700'   :
                        selectedChat.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {selectedChat.status}
                      </span>
                    </div>
                  </div>
                  <button onClick={(e) => deleteChat(selectedChat._id, e)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-red-400">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>

                {/* Customer Info Bar */}
                <div className="flex items-center gap-4 px-5 py-2 bg-blue-50/50 border-t border-blue-100/50 flex-wrap">
                  {selectedChat.visitorEmail && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-body">
                      <HiMail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="truncate max-w-[160px]">{selectedChat.visitorEmail}</span>
                    </div>
                  )}
                  {(selectedChat.visitorBrowser || selectedChat.visitorDevice) && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-body">
                      <HiDesktopComputer className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>{[selectedChat.visitorBrowser, selectedChat.visitorDevice].filter(Boolean).join(' / ')}</span>
                    </div>
                  )}
                  {selectedChat.visitorIp && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-body">
                      <HiGlobe className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span>{selectedChat.visitorIp}</span>
                    </div>
                  )}
                  {selectedChat.createdAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-body">
                      <HiClock className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span>{fmtFull(selectedChat.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 font-body">No messages yet</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isAdminMsg = msg.sender === 'admin';
                  const isBot      = msg.sender === 'bot' || msg.sender === 'system';
                  const text       = msg.text || msg.message || '';
                  return (
                    <div key={msg._id || i} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                      {!isAdminMsg && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-1 ${isBot ? 'bg-secondary/20 text-secondary' : 'bg-primary/10 text-primary'}`}>
                          {isBot ? '🤖' : (selectedChat.visitorName || 'V').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`max-w-[68%] flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                        {!isAdminMsg && (
                          <p className="text-[10px] text-gray-400 font-body mb-1 px-1">
                            {isBot ? (msg.senderName || 'Auto') : (selectedChat.visitorName || 'Visitor')}
                          </p>
                        )}
                        {isAdminMsg && (
                          <p className="text-[10px] text-secondary font-body mb-1 px-1 font-semibold">
                            💬 {msg.senderName || 'Support Agent'}
                          </p>
                        )}
                        {/* ── নতুন: renderMsgContent দিয়ে link button দেখাচ্ছে ── */}
                        <div className={`px-4 py-2.5 rounded-2xl font-body text-sm leading-relaxed ${
                          isAdminMsg ? 'bg-primary text-white rounded-br-sm' :
                          isBot      ? 'bg-secondary/15 text-primary rounded-bl-sm border border-secondary/20' :
                                       'bg-white text-primary shadow-sm rounded-bl-sm border border-gray-100'
                        }`}>
                          {renderMsgContent(text, isAdminMsg)}
                        </div>
                        <span className="font-body text-[10px] text-gray-400 mt-1 px-1">{fmtTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Visitor typing indicator */}
                {visitorTyping && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mr-2 flex-shrink-0 mt-1">
                      {(selectedChat.visitorName || 'V').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                        {[0,1,2].map((j) => (
                          <div key={j} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${j * 150}ms` }} />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 font-body mt-1 ml-1">
                        {selectedChat.visitorName || 'Visitor'} is typing...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {quickReplies.length > 0 && (
                <div className="px-4 pt-3 pb-1 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <HiLightningBolt className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                    {quickReplies.map((qr, idx) => (
                      <button key={idx} onClick={() => useQuickReply(qr.text)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full font-body text-xs text-gray-600 hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all whitespace-nowrap flex-shrink-0 active:scale-95">
                        <span>{qr.icon}</span>
                        <span className="font-semibold">{qr.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Reply Input — নতুন link panel সহ ── */}
              <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{activeAgent.avatar}</span>
                  <span className="font-body text-xs text-gray-500">
                    Replying as <strong className="text-secondary">{activeAgent.name}</strong>
                  </span>
                  <button onClick={() => setShowAgentModal(true)}
                    className="ml-auto text-[10px] text-gray-400 hover:text-secondary font-body flex items-center gap-0.5 transition-colors">
                    <HiPencil className="w-3 h-3" /> change
                  </button>
                </div>

                {/* Link Attach Panel */}
                {showLinkPanel && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <p className="font-body text-xs font-bold text-blue-700">🔗 Clickable Link Button যোগ করো</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block font-body text-[10px] font-semibold text-gray-500 mb-1">Button Text</label>
                        <input
                          type="text"
                          value={linkText}
                          onChange={(e) => setLinkText(e.target.value)}
                          placeholder='যেমন: Sign Up Now, Shop Now'
                          className="w-full px-3 py-2 border border-blue-200 rounded-lg font-body text-xs focus:outline-none focus:border-blue-400 bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block font-body text-[10px] font-semibold text-gray-500 mb-1">URL</label>
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && attachLink()}
                          placeholder="https://example.com/offer"
                          className="w-full px-3 py-2 border border-blue-200 rounded-lg font-body text-xs focus:outline-none focus:border-blue-400 bg-white"
                        />
                      </div>
                    </div>

                    {/* Live Preview */}
                    {linkText && (
                      <div className="flex items-center gap-2">
                        <span className="font-body text-[10px] text-gray-400">Preview:</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                          🔗 {linkText}
                          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setShowLinkPanel(false); setLinkText(''); setLinkUrl(''); }}
                        className="flex-1 py-1.5 border border-gray-200 rounded-lg font-body text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={attachLink}
                        disabled={!linkText.trim() || !linkUrl.trim()}
                        className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg font-body text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
                        ✓ Message এ Attach করো
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* 🔗 Link Toggle Button */}
                  <button
                    onClick={() => setShowLinkPanel((v) => !v)}
                    title="Clickable link button যোগ করো"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all text-base ${
                      showLinkPanel
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50'
                    }`}>
                    🔗
                  </button>

                  <textarea
                    value={reply}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder={`Reply as ${activeAgent.name}... (Enter to send)`}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-body text-sm focus:outline-none focus:border-secondary/50 focus:ring-2 focus:ring-secondary/20 resize-none transition-all"
                  />
                  <button onClick={sendReply} disabled={!reply.trim()}
                    className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0 active:scale-95">
                    <HiPaperAirplane className="w-5 h-5 rotate-90" />
                  </button>
                </div>
                <p className="font-body text-xs text-gray-400 mt-2">Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;