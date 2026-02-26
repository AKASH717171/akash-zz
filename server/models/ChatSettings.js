const mongoose = require('mongoose');

const quickReplySchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  icon:  { type: String, default: '💬' },
  text:  { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
}, { _id: true });

const chatSettingsSchema = new mongoose.Schema({
  welcomeMessage: {
    type: String,
    default: 'Welcome to LUXE FASHION! 👋 How can we help you today?',
    trim: true,
    maxlength: 500,
  },
  askNameMessage: {
    type: String,
    default: 'Before we begin, may I know your name please?',
    trim: true,
    maxlength: 500,
  },
  askEmailMessage: {
    type: String,
    default: 'Thank you, {name}! Could you share your email so we can assist you better?',
    trim: true,
    maxlength: 500,
  },
  couponMessage: {
    type: String,
    default: "🎉 Here's an exclusive coupon just for you: **LUXE80** — Get 80% OFF your order! Our team will be with you shortly. Feel free to ask anything!",
    trim: true,
    maxlength: 1000,
  },
  offlineMessage: {
    type: String,
    default: 'Our team is currently offline. Please leave your message and we will get back to you soon!',
    trim: true,
    maxlength: 500,
  },
  couponCode: {
    type: String,
    default: 'LUXE80',
    trim: true,
    uppercase: true,
  },
  isOnline:           { type: Boolean, default: true },
  autoReplyEnabled:   { type: Boolean, default: true },
  businessHoursStart: { type: String,  default: '09:00', trim: true },
  businessHoursEnd:   { type: String,  default: '21:00', trim: true },

  // Active agent info
  activeAgentName:   { type: String, default: 'Emily', trim: true },
  activeAgentAvatar: { type: String, default: '👩' },

  // Quick reply templates
  quickReplies: {
    type: [quickReplySchema],
    default: [
      { label: 'Welcome',   icon: '👋', text: "Hi! Welcome to LUXE FASHION. I'm here to help. How can I assist you today?", order: 1 },
      { label: 'Order Help',icon: '📦', text: "I'd be happy to help! Could you please share your order number?",             order: 2 },
      { label: 'Pricing',   icon: '💰', text: 'Great question! Let me get you the pricing details right away.',               order: 3 },
      { label: 'Refund',    icon: '🔄', text: "I understand your concern. Let me look into the refund process for you.",      order: 4 },
      { label: 'Wait',      icon: '⏰', text: "Thank you for your patience! I'm checking this for you right now.",            order: 5 },
      { label: 'Resolved',  icon: '✅', text: "I'm glad I could help! Is there anything else I can assist you with?",         order: 6 },
      { label: 'Goodbye',   icon: '👋', text: 'Thank you for chatting with us! Have a wonderful day! 😊',                     order: 7 },
    ],
  },
}, {
  timestamps: true,
  collection: 'chat_settings',
});

chatSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

const ChatSettings = mongoose.model('ChatSettings', chatSettingsSchema);

module.exports = ChatSettings;