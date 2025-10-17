const mongoose = require('mongoose');

const MONGO_URL = 'mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const Account = mongoose.model('Account', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      registered: Boolean
    }, { timestamps: true }));

    const users = await Account.find({}).limit(10);
    console.log(`\n📊 Found ${users.length} users total:`);
    users.forEach((user, i) => {
      console.log(`${i+1}. ${user.email} - Role: ${user.role || 'USER'} - Registered: ${user.registered}`);
    });

    // Check specifically for test users
    const testUsers = await Account.find({
      email: { $in: ['test@gmail.com', 'test@futuratickets.com', 'admin@futuratickets.com'] }
    });
    console.log(`\n🔍 Test users found: ${testUsers.length}`);
    testUsers.forEach((user) => {
      console.log(`- ${user.email}: Role=${user.role}, Registered=${user.registered}, HasPassword=${!!user.password}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();
