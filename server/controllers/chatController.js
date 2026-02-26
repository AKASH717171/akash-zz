const Chat = require('../models/Chat');
const ChatSettings = require('../models/ChatSettings');
const ChatAgent = require('../models/ChatAgent');

// ─── CHAT CRUD ─────────────────────────────────────────────────────────────

const getAllChats = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { visitorName:  { $regex: search, $options: 'i' } },
        { visitorEmail: { $regex: search, $options: 'i' } },
        { visitorId:    { $regex: search, $options: 'i' } },
      ];
    }
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [chats, totalItems] = await Promise.all([
      Chat.find(filter).sort({ lastMessageAt: -1, updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      Chat.countDocuments(filter),
    ]);

    const chatsWithMeta = chats.map((chat) => {
      const unreadCount = chat.messages
        ? chat.messages.filter((m) => m.sender === 'visitor' && !m.read).length
        : 0;
      const lastMessage = chat.messages && chat.messages.length > 0
        ? chat.messages[chat.messages.length - 1]
        : null;
      return {
        _id: chat._id,
        visitorId:      chat.visitorId,
        visitorName:    chat.visitorName,
        visitorEmail:   chat.visitorEmail,
        visitorIp:      chat.visitorIp,
        visitorBrowser: chat.visitorBrowser,
        visitorDevice:  chat.visitorDevice,
        visitorLocation:chat.visitorLocation,
        status:         chat.status,
        unreadCount,
        lastMessage,
        messageCount: chat.messages ? chat.messages.length : 0,
        lastMessageAt: chat.lastMessageAt,
        createdAt:     chat.createdAt,
        updatedAt:     chat.updatedAt,
      };
    });

    const statusCounts = await Chat.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {};
    statusCounts.forEach((s) => { statusMap[s._id] = s.count; });

    res.status(200).json({
      success: true,
      count: chatsWithMeta.length,
      chats: chatsWithMeta,
      statusCounts: statusMap,
      pagination: {
        currentPage: pageNum,
        totalPages:  Math.ceil(totalItems / limitNum),
        totalItems,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chats.' });
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).lean();
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    await Chat.updateOne(
      { _id: chat._id },
      { $set: { 'messages.$[elem].read': true } },
      { arrayFilters: [{ 'elem.sender': 'visitor', 'elem.read': false }] }
    );

    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('Get chat by ID error:', error);
    if (error.name === 'CastError')
      return res.status(400).json({ success: false, message: 'Invalid chat ID.' });
    res.status(500).json({ success: false, message: 'Failed to fetch chat.' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({ status: { $in: ['active', 'pending'] } })
      .select('messages').lean();
    let totalUnread = 0, chatsWithUnread = 0;
    chats.forEach((chat) => {
      const unread = chat.messages
        ? chat.messages.filter((m) => m.sender === 'visitor' && !m.read).length
        : 0;
      totalUnread += unread;
      if (unread > 0) chatsWithUnread++;
    });
    res.status(200).json({ success: true, totalUnread, chatsWithUnread, totalActiveChats: chats.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch unread count.' });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    await Chat.findByIdAndDelete(req.params.id);
    const io = req.app.get('io');
    if (io) {
      io.to(`visitor:${chat.visitorId}`).emit('chat:deleted', { chatId: chat._id });
      io.to('admin:chat').emit('chat:deleted', { chatId: chat._id });
    }
    res.status(200).json({ success: true, message: 'Chat deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete chat.' });
  }
};

const closeChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    chat.messages.push({
      sender: 'system',
      senderName: 'LUXE FASHION',
      text: 'This conversation has been closed. Thank you for chatting with us! 🙏',
      timestamp: new Date(),
      read: false,
    });
    chat.status   = 'closed';
    chat.closedAt = new Date();
    chat.closedBy = req.user._id;
    await chat.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`visitor:${chat.visitorId}`).emit('chat:closed', {
        chatId: chat._id,
        message: chat.messages[chat.messages.length - 1],
      });
    }
    res.status(200).json({ success: true, message: 'Chat closed successfully!', chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to close chat.' });
  }
};

// ─── SETTINGS ──────────────────────────────────────────────────────────────

const getAutoReplySettings = async (req, res) => {
  try {
    const settings = await ChatSettings.getSettings();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat settings.' });
  }
};

const updateAutoReplySettings = async (req, res) => {
  try {
    let settings = await ChatSettings.findOne();
    if (!settings) settings = new ChatSettings({});

    const allowedFields = [
      'welcomeMessage', 'askNameMessage', 'askEmailMessage', 'couponMessage',
      'offlineMessage', 'couponCode', 'isOnline', 'autoReplyEnabled',
      'businessHoursStart', 'businessHoursEnd',
      'activeAgentName', 'activeAgentAvatar',
      'quickReplies',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = typeof req.body[field] === 'string'
          ? req.body[field].trim()
          : req.body[field];
      }
    });

    await settings.save();
    res.status(200).json({ success: true, message: 'Chat settings updated!', settings });
  } catch (error) {
    console.error('Update chat settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update chat settings.' });
  }
};

// ─── AGENTS ────────────────────────────────────────────────────────────────

const getAgents = async (req, res) => {
  try {
    await ChatAgent.seedDefaults();
    const agents = await ChatAgent.find().sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch agents.' });
  }
};

const createAgent = async (req, res) => {
  try {
    const { name, avatar, avatarColor, isOnline } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Agent name is required.' });

    const count = await ChatAgent.countDocuments();
    const agent = await ChatAgent.create({
      name: name.trim(),
      avatar: avatar || '👩',
      avatarColor: avatarColor || '#C4A35A',
      isOnline: isOnline !== false,
      order: count + 1,
    });
    res.status(201).json({ success: true, message: 'Agent created!', agent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create agent.' });
  }
};

const updateAgent = async (req, res) => {
  try {
    const { name, avatar, avatarColor, isOnline, isActive } = req.body;
    const agent = await ChatAgent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found.' });

    if (name)        agent.name        = name.trim();
    if (avatar)      agent.avatar      = avatar;
    if (avatarColor) agent.avatarColor = avatarColor;
    if (isOnline !== undefined) agent.isOnline = isOnline;

    if (isActive === true) {
      await ChatAgent.updateMany({ _id: { $ne: agent._id } }, { isActive: false });
      agent.isActive = true;
      await ChatSettings.updateOne(
        {},
        { $set: { activeAgentName: agent.name, activeAgentAvatar: agent.avatar } },
        { upsert: true }
      );
    } else if (isActive === false) {
      agent.isActive = false;
    }

    await agent.save();
    res.status(200).json({ success: true, message: 'Agent updated!', agent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update agent.' });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const agent = await ChatAgent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: 'Agent not found.' });
    await ChatAgent.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Agent deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete agent.' });
  }
};

module.exports = {
  getAllChats, getChatById, getUnreadCount, deleteChat, closeChat,
  getAutoReplySettings, updateAutoReplySettings,
  getAgents, createAgent, updateAgent, deleteAgent,
};