const Chat         = require('../models/Chat');
const ChatSettings = require('../models/ChatSettings');
const ChatAgent    = require('../models/ChatAgent');
const Newsletter   = require('../models/Newsletter');
const validator    = require('validator');

function parseUserAgent(ua) {
  if (!ua) return { browser: 'Unknown', device: 'Unknown' };
  let browser = 'Unknown';
  let device  = 'Desktop';
  if (/mobile/i.test(ua))        device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';
  if      (/chrome\/(\d+)/i.test(ua) && !/chromium|edg/i.test(ua)) browser = 'Chrome';
  else if (/firefox\/(\d+)/i.test(ua))  browser = 'Firefox';
  else if (/safari\/(\d+)/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edg\/(\d+)/i.test(ua))  browser = 'Edge';
  else if (/opr\/(\d+)/i.test(ua))  browser = 'Opera';
  return { browser, device };
}

const chatSocket = (io) => {
  const connectedAdmins   = new Map();
  const connectedVisitors = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ════════════════════════════════════════
    // VISITOR EVENTS
    // ════════════════════════════════════════

    socket.on('visitor:connect', async (data) => {
      try {
        const { visitorId, visitorName, visitorEmail } = data;
        if (!visitorId) {
          socket.emit('chat:error', { message: 'Visitor ID is required.' });
          return;
        }

        connectedVisitors.set(visitorId, socket.id);
        socket.join(`visitor:${visitorId}`);

        // Collect metadata
        const rawIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || '';
        const ip    = rawIp.split(',')[0].trim().replace('::ffff:', '');
        const ua    = socket.handshake.headers['user-agent'] || '';
        const { browser, device } = parseUserAgent(ua);

        let chat = await Chat.findOne({
          visitorId,
          status: { $in: ['active', 'pending'] },
        });
        const chatSettings = await ChatSettings.getSettings();

        // Get active agent
        await ChatAgent.seedDefaults();
        const activeAgent = await ChatAgent.getActiveAgent();
        const agentName   = chatSettings.activeAgentName   || (activeAgent ? activeAgent.name   : 'Emily');
        const agentAvatar = chatSettings.activeAgentAvatar || (activeAgent ? activeAgent.avatar : '👩');

        if (!chat) {
          chat = new Chat({
            visitorId,
            visitorName:    visitorName  || '',
            visitorEmail:   visitorEmail || '',
            visitorIp:      ip,
            visitorBrowser: browser,
            visitorDevice:  device,
            status:   'active',
            messages: [],
          });

          // Pre-chat form থেকে name+email এলে welcome পাঠাও।
          // name/email ছাড়া connect হলে কিছু পাঠাবো না — client form handle করবে।
          if (chatSettings.autoReplyEnabled && visitorName && visitorEmail) {
            const welcomeText =
              `Hi ${visitorName}! 👋 Welcome to LUXE FASHION. I'm ${agentName}. How can I help you today?`;
            chat.messages.push({
              sender: 'system', senderName: agentName,
              text: welcomeText, timestamp: new Date(), read: false,
            });
          }

          await chat.save();
        } else {
          // Existing chat — update info if needed
          if (ip      && !chat.visitorIp)      chat.visitorIp      = ip;
          if (browser && !chat.visitorBrowser) chat.visitorBrowser = browser;

          const wasNameMissing  = !chat.visitorName;
          const wasEmailMissing = !chat.visitorEmail;

          if (wasNameMissing  && visitorName)  chat.visitorName  = visitorName;
          if (wasEmailMissing && visitorEmail) chat.visitorEmail = visitorEmail;

          // Pre-chat form submit এর পর reconnect — welcome message যোগ করো
          // শুধু তখন যখন name+email প্রথমবার পাওয়া গেল এবং chat এখনো empty
          if (chatSettings.autoReplyEnabled &&
              wasNameMissing && wasEmailMissing &&
              visitorName && visitorEmail &&
              chat.messages.length === 0) {
            const welcomeText =
              `Hi ${visitorName}! 👋 Welcome to LUXE FASHION. I'm ${agentName}. How can I help you today?`;
            chat.messages.push({
              sender: 'system', senderName: agentName,
              text: welcomeText, timestamp: new Date(), read: false,
            });
          }

          await chat.save();
        }

        socket.emit('chat:history', {
          chatId:       chat._id,
          messages:     chat.messages,
          visitorName:  chat.visitorName,
          visitorEmail: chat.visitorEmail,
          status:       chat.status,
          agentName,
          agentAvatar,
          chatState: determineChatState(chat),
        });

        io.to('admin:chat').emit('chat:visitor_connected', {
          chatId:         chat._id,
          visitorId:      chat.visitorId,
          visitorName:    chat.visitorName,
          visitorEmail:   chat.visitorEmail,
          visitorIp:      chat.visitorIp,
          visitorBrowser: chat.visitorBrowser,
          visitorDevice:  chat.visitorDevice,
          lastMessage:    chat.messages[chat.messages.length - 1],
          unreadCount:    chat.messages.filter((m) => m.sender === 'visitor' && !m.read).length,
          status:         chat.status,
          updatedAt:      chat.updatedAt,
        });

        console.log(`👤 Visitor: ${visitorId} (${visitorName || 'unnamed'}) IP:${ip} ${browser}/${device}`);
      } catch (error) {
        console.error('visitor:connect error:', error);
        socket.emit('chat:error', { message: 'Failed to connect to chat.' });
      }
    });

    socket.on('visitor:send_message', async (data) => {
      try {
        const { visitorId, text } = data;
        if (!visitorId || !text || !text.trim()) {
          socket.emit('chat:error', { message: 'Message cannot be empty.' });
          return;
        }

        let chat = await Chat.findOne({ visitorId, status: { $in: ['active', 'pending'] } });
        if (!chat) {
          socket.emit('chat:error', { message: 'Chat session not found. Please refresh.' });
          return;
        }

        const chatSettings = await ChatSettings.getSettings();
        const agentName    = chatSettings.activeAgentName || 'Support Agent';
        const chatState    = determineChatState(chat);
        const messageText  = text.trim();
        const newMessages  = [];

        const visitorMessage = {
          sender: 'visitor', senderName: chat.visitorName || 'Visitor',
          text: messageText, timestamp: new Date(), read: false,
        };
        chat.messages.push(visitorMessage);
        newMessages.push(visitorMessage);

        if (chatSettings.autoReplyEnabled) {
          if (chatState === 'waiting_name') {
            chat.visitorName = messageText.substring(0, 50);
            const askEmailText = chatSettings.askEmailMessage.replace('{name}', chat.visitorName);
            const botReply = {
              sender: 'system', senderName: agentName,
              text: askEmailText, timestamp: new Date(Date.now() + 500), read: false,
            };
            chat.messages.push(botReply);
            newMessages.push(botReply);
          } else if (chatState === 'waiting_email') {
            if (validator.isEmail(messageText)) {
              chat.visitorEmail = messageText.toLowerCase();
              try {
                const existing = await Newsletter.findOne({ email: chat.visitorEmail });
                if (!existing) {
                  await Newsletter.create({
                    email: chat.visitorEmail, name: chat.visitorName || '',
                    status: 'subscribed', source: 'chat', subscribedAt: new Date(),
                  });
                }
              } catch (e) { console.error('Newsletter error:', e.message); }

              const couponText = chatSettings.couponMessage.replace('{coupon}', chatSettings.couponCode);
              const botReply = {
                sender: 'system', senderName: agentName,
                text: couponText, timestamp: new Date(Date.now() + 500), read: false,
              };
              chat.messages.push(botReply);
              newMessages.push(botReply);
            } else {
              const retryMsg = {
                sender: 'system', senderName: agentName,
                text: "That doesn't look like a valid email. Please enter your email address (e.g. name@example.com)",
                timestamp: new Date(Date.now() + 500), read: false,
              };
              chat.messages.push(retryMsg);
              newMessages.push(retryMsg);
            }
          }
        }

        chat.lastMessageAt = new Date();
        await chat.save();

        newMessages.forEach((msg) => {
          io.to(`visitor:${visitorId}`).emit('chat:new_message', { chatId: chat._id, message: msg });
        });

        io.to('admin:chat').emit('chat:new_message', {
          chatId: chat._id, visitorId: chat.visitorId,
          visitorName: chat.visitorName, visitorEmail: chat.visitorEmail,
          message: visitorMessage,
          unreadCount: chat.messages.filter((m) => m.sender === 'visitor' && !m.read).length,
        });

        io.to('admin:chat').emit('chat:updated', {
          chatId:         chat._id,
          visitorId:      chat.visitorId,
          visitorName:    chat.visitorName,
          visitorEmail:   chat.visitorEmail,
          visitorIp:      chat.visitorIp,
          visitorBrowser: chat.visitorBrowser,
          visitorDevice:  chat.visitorDevice,
          lastMessage:    chat.messages[chat.messages.length - 1],
          unreadCount:    chat.messages.filter((m) => m.sender === 'visitor' && !m.read).length,
          status:         chat.status,
          updatedAt:      chat.updatedAt,
        });
      } catch (error) {
        console.error('visitor:send_message error:', error);
        socket.emit('chat:error', { message: 'Failed to send message.' });
      }
    });

    socket.on('visitor:typing', (data) => {
      const { visitorId, chatId } = data;
      io.to('admin:chat').emit('chat:visitor_typing', { chatId, visitorId, isTyping: true });
    });

    socket.on('visitor:stop_typing', (data) => {
      const { visitorId, chatId } = data;
      io.to('admin:chat').emit('chat:visitor_typing', { chatId, visitorId, isTyping: false });
    });

    // ════════════════════════════════════════
    // ADMIN EVENTS
    // ════════════════════════════════════════

    socket.on('admin:join', (data) => {
      const { adminId, adminName } = data;
      connectedAdmins.set(adminId || socket.id, { socketId: socket.id, name: adminName });
      socket.join('admin:chat');
      console.log(`👨‍💼 Admin joined: ${adminName || 'admin'}`);
      socket.emit('admin:stats', {
        onlineVisitors: connectedVisitors.size,
        onlineAdmins:   connectedAdmins.size,
      });
    });

    socket.on('admin:open_chat', async (data) => {
      try {
        const { chatId } = data;
        const chat = await Chat.findById(chatId);
        if (chat) {
          socket.join(`chat:${chatId}`);
          let changed = false;
          chat.messages.forEach((msg) => {
            if (msg.sender === 'visitor' && !msg.read) { msg.read = true; changed = true; }
          });
          if (changed) await chat.save();

          socket.emit('chat:full_history', {
            chatId:         chat._id,
            visitorId:      chat.visitorId,
            visitorName:    chat.visitorName,
            visitorEmail:   chat.visitorEmail,
            visitorIp:      chat.visitorIp,
            visitorBrowser: chat.visitorBrowser,
            visitorDevice:  chat.visitorDevice,
            messages:       chat.messages,
            status:         chat.status,
            createdAt:      chat.createdAt,
          });

          io.to('admin:chat').emit('chat:read_update', { chatId: chat._id, unreadCount: 0 });
        }
      } catch (error) {
        console.error('admin:open_chat error:', error);
      }
    });

    socket.on('admin:send_reply', async (data) => {
      try {
        const { chatId, visitorId, text, agentName } = data;
        if (!chatId || !text || !text.trim()) {
          socket.emit('chat:error', { message: 'Reply cannot be empty.' });
          return;
        }

        const chat = await Chat.findById(chatId);
        if (!chat) { socket.emit('chat:error', { message: 'Chat not found.' }); return; }

        if (!chat.visitorId && visitorId) chat.visitorId = visitorId;

        const adminMessage = {
          sender:     'admin',
          senderName: agentName || 'Support Agent',
          text:       text.trim(),
          timestamp:  new Date(),
          read:       false,
        };

        chat.messages.push(adminMessage);
        chat.lastMessageAt = new Date();
        if (chat.status === 'pending') chat.status = 'active';
        await chat.save();

        const targetId = chat.visitorId || visitorId;
        if (targetId) {
          io.to(`visitor:${targetId}`).emit('chat:new_message', { chatId: chat._id, message: adminMessage });
          console.log(`💬 ${agentName || 'Agent'} replied to visitor: ${targetId}`);
        }

        io.to('admin:chat').emit('chat:new_message', {
          chatId: chat._id, visitorId: chat.visitorId,
          visitorName: chat.visitorName, message: adminMessage, unreadCount: 0,
        });
        io.to('admin:chat').emit('chat:updated', {
          chatId: chat._id, visitorId: chat.visitorId,
          visitorName: chat.visitorName, visitorEmail: chat.visitorEmail,
          lastMessage: adminMessage, unreadCount: 0,
          status: chat.status, updatedAt: chat.updatedAt,
        });
      } catch (error) {
        console.error('admin:send_reply error:', error);
        socket.emit('chat:error', { message: 'Failed to send reply.' });
      }
    });

    socket.on('admin:typing', (data) => {
      const { visitorId, chatId, agentName } = data;
      if (visitorId) {
        io.to(`visitor:${visitorId}`).emit('chat:admin_typing', {
          chatId, isTyping: true, agentName: agentName || 'Agent',
        });
      }
    });

    socket.on('admin:stop_typing', (data) => {
      const { visitorId, chatId, agentName } = data;
      if (visitorId) {
        io.to(`visitor:${visitorId}`).emit('chat:admin_typing', {
          chatId, isTyping: false, agentName: agentName || 'Agent',
        });
      }
    });

    socket.on('admin:mark_read', async (data) => {
      try {
        const { chatId } = data;
        const chat = await Chat.findById(chatId);
        if (chat) {
          let changed = false;
          chat.messages.forEach((msg) => {
            if (msg.sender === 'visitor' && !msg.read) { msg.read = true; changed = true; }
          });
          if (changed) {
            await chat.save();
            io.to('admin:chat').emit('chat:read_update', { chatId: chat._id, unreadCount: 0 });
          }
        }
      } catch (error) { console.error('admin:mark_read error:', error); }
    });

    socket.on('admin:close_chat', async (data) => {
      try {
        const { chatId, agentName } = data;
        const chat = await Chat.findById(chatId);
        if (chat) {
          const closeMsg = {
            sender: 'system', senderName: agentName || 'LUXE FASHION',
            text: 'This conversation has been closed. Thank you for chatting with LUXE FASHION! 🙏',
            timestamp: new Date(), read: false,
          };
          chat.messages.push(closeMsg);
          chat.status   = 'closed';
          chat.closedAt = new Date();
          await chat.save();

          io.to(`visitor:${chat.visitorId}`).emit('chat:closed', { chatId: chat._id, message: closeMsg });
          io.to('admin:chat').emit('chat:closed', { chatId: chat._id, visitorId: chat.visitorId });
          console.log(`🔒 Chat closed by ${agentName || 'admin'}`);
        }
      } catch (error) { console.error('admin:close_chat error:', error); }
    });

    // ════════════════════════════════════════
    // DISCONNECT
    // ════════════════════════════════════════
    socket.on('disconnect', () => {
      for (const [adminId, adminData] of connectedAdmins.entries()) {
        if (adminData.socketId === socket.id) { connectedAdmins.delete(adminId); break; }
      }
      for (const [visitorId, socketId] of connectedVisitors.entries()) {
        if (socketId === socket.id) {
          connectedVisitors.delete(visitorId);
          io.to('admin:chat').emit('chat:visitor_disconnected', { visitorId });
          break;
        }
      }
      io.to('admin:chat').emit('admin:stats', {
        onlineVisitors: connectedVisitors.size,
        onlineAdmins:   connectedAdmins.size,
      });
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  function determineChatState(chat) {
    // Pre-chat form দিয়ে name+email collect হয়, তাই chat message থেকে email খোঁজার দরকার নেই।
    // Server-এ visitorName ও visitorEmail আছে কিনা দেখলেই চলবে।
    if (!chat.visitorName  || chat.visitorName.trim()  === '') return 'waiting_name';
    if (!chat.visitorEmail || chat.visitorEmail.trim() === '') return 'waiting_email';
    return 'active_chat';
  }
};

module.exports = chatSocket;