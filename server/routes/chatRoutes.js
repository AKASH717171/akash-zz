const express = require('express');
const router  = express.Router();
const {
  getAllChats, getChatById, getUnreadCount, deleteChat, closeChat,
  getAutoReplySettings, updateAutoReplySettings,
  getAgents, createAgent, updateAgent, deleteAgent,
} = require('../controllers/chatController');
const { protect, isAdmin } = require('../middleware/auth');

// Admin — stats & settings
router.get('/admin/unread-count', protect, isAdmin, getUnreadCount);
router.get('/admin/settings',     protect, isAdmin, getAutoReplySettings);
router.put('/admin/settings',     protect, isAdmin, updateAutoReplySettings);

// Admin — chats
router.get('/admin/all',       protect, isAdmin, getAllChats);
router.get('/admin/:id',       protect, isAdmin, getChatById);
router.put('/admin/:id/close', protect, isAdmin, closeChat);
router.delete('/admin/:id',    protect, isAdmin, deleteChat);

// Agents
router.get('/agents',       protect, isAdmin, getAgents);
router.post('/agents',      protect, isAdmin, createAgent);
router.put('/agents/:id',   protect, isAdmin, updateAgent);
router.delete('/agents/:id',protect, isAdmin, deleteAgent);

module.exports = router;