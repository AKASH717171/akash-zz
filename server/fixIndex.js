const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!');
  try {
    await mongoose.connection.db.collection('chats').dropIndex('sessionId_1');
    console.log('✅ Fixed! Index dropped.');
  } catch (e) {
    console.log('Info:', e.message);
  }
  await mongoose.disconnect();
  console.log('Done! Now restart server.');
  process.exit(0);
}

fixIndex();