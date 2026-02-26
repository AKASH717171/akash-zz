const mongoose = require('mongoose');

const chatAgentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  avatar: {
    type: String,
    default: '👩',
  },
  avatarColor: {
    type: String,
    default: '#C4A35A',
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  collection: 'chat_agents',
});

// Static method to get active agent
chatAgentSchema.statics.getActiveAgent = async function () {
  let agent = await this.findOne({ isActive: true, isOnline: true });
  if (!agent) agent = await this.findOne({ isOnline: true });
  if (!agent) agent = await this.findOne();
  return agent;
};

// Static method to seed default agents
chatAgentSchema.statics.seedDefaults = async function () {
  const count = await this.countDocuments();
  if (count > 0) return;

  const defaultAgents = [
    { name: 'Emily',    avatar: '👩',      avatarColor: '#E91E8C', order: 1,  isActive: true, isOnline: true  },
    { name: 'Sophia',   avatar: '👩‍🦱',    avatarColor: '#9C27B0', order: 2,  isOnline: true  },
    { name: 'Olivia',   avatar: '👩‍🦰',    avatarColor: '#F44336', order: 3,  isOnline: true  },
    { name: 'Isabella', avatar: '👩‍🦳',    avatarColor: '#FF5722', order: 4,  isOnline: false },
    { name: 'Ava',      avatar: '👩‍🦲',    avatarColor: '#FF9800', order: 5,  isOnline: true  },
    { name: 'Mia',      avatar: '🧑‍💼',    avatarColor: '#FFC107', order: 6,  isOnline: true  },
    { name: 'Charlotte',avatar: '👩‍💼',    avatarColor: '#4CAF50', order: 7,  isOnline: false },
    { name: 'Amelia',   avatar: '👩‍🎓',    avatarColor: '#009688', order: 8,  isOnline: true  },
    { name: 'Harper',   avatar: '👩‍💻',    avatarColor: '#00BCD4', order: 9,  isOnline: true  },
    { name: 'Ella',     avatar: '👩‍🎨',    avatarColor: '#2196F3', order: 10, isOnline: false },
    { name: 'Scarlett', avatar: '👩‍🏫',    avatarColor: '#3F51B5', order: 11, isOnline: true  },
    { name: 'Grace',    avatar: '👩‍🔬',    avatarColor: '#673AB7', order: 12, isOnline: true  },
    { name: 'Lily',     avatar: '👸',       avatarColor: '#E91E63', order: 13, isOnline: false },
    { name: 'Natalie',  avatar: '🌸',       avatarColor: '#EC407A', order: 14, isOnline: true  },
    { name: 'Victoria', avatar: '💎',       avatarColor: '#AB47BC', order: 15, isOnline: true  },
  ];

  await this.insertMany(defaultAgents);
};

const ChatAgent = mongoose.model('ChatAgent', chatAgentSchema);

module.exports = ChatAgent;