const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URL = 'mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod';

async function createTestUser() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const Account = mongoose.model('Account', new mongoose.Schema({
      name: String,
      lastName: String,
      email: String,
      password: String,
      role: { type: String, enum: ['USER', 'PROMOTER', 'ADMIN', 'ACCESS'], default: 'USER' },
      registered: { type: Boolean, default: false },
      promoter: String,
      accessEvent: String
    }, { timestamps: true }));

    // Create a test user with known password
    const testEmail = 'marketplace-test@futuratickets.com';
    const testPassword = 'Test123456';

    // Check if user already exists
    let existingUser = await Account.findOne({ email: testEmail });

    if (existingUser) {
      console.log(`ℹ️  User ${testEmail} already exists`);
      // Update password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      existingUser.password = hashedPassword;
      existingUser.registered = true;
      existingUser.role = 'USER';
      await existingUser.save();
      console.log(`✅ Updated password for ${testEmail}`);
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const newUser = await Account.create({
        name: 'Marketplace',
        lastName: 'Test User',
        email: testEmail,
        password: hashedPassword,
        role: 'USER',
        registered: true
      });
      console.log(`✅ Created new user ${testEmail}`);
    }

    console.log(`\n🔑 CREDENTIALS FOR TESTING:`);
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log(`\nUse these credentials to login at: http://localhost:3001/login`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestUser();
