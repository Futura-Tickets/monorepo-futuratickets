const mongoose = require('mongoose');

// MongoDB connection
const MONGO_URL = 'mongodb+srv://admin:9FvohknErNl0vhjH@futura.bkbwc.mongodb.net/futura-prod';

// Account Schema (simplified)
const accountSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['USER', 'PROMOTER', 'ADMIN'],
    default: 'USER'
  }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // 1. Find the most recent user (the one you used to login)
    const recentUser = await Account.findOne().sort({ createdAt: -1 });

    if (recentUser) {
      console.log(`\n📧 Most recent user: ${recentUser.email}`);
      console.log(`Current role: ${recentUser.role}`);

      // Update to ADMIN
      recentUser.role = 'ADMIN';
      await recentUser.save();
      console.log(`✅ Updated ${recentUser.email} to ADMIN role\n`);
    }

    // 2. Check if admin@futuratickets.com exists
    let adminUser = await Account.findOne({ email: 'admin@futuratickets.com' });

    if (!adminUser) {
      // Create new admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('FuturaAdmin2025!', 10);

      adminUser = await Account.create({
        name: 'Admin Futura',
        email: 'admin@futuratickets.com',
        password: hashedPassword,
        role: 'ADMIN'
      });

      console.log('✅ Created admin@futuratickets.com with ADMIN role');
      console.log(`   Email: admin@futuratickets.com`);
      console.log(`   Password: FuturaAdmin2025!\n`);
    } else {
      // Update existing user to ADMIN
      if (adminUser.role !== 'ADMIN') {
        adminUser.role = 'ADMIN';
        await adminUser.save();
        console.log('✅ Updated existing admin@futuratickets.com to ADMIN role\n');
      } else {
        console.log('ℹ️  admin@futuratickets.com already has ADMIN role\n');
      }
    }

    // 3. List all ADMIN users
    const adminUsers = await Account.find({ role: 'ADMIN' });
    console.log(`\n🔐 ADMIN USERS (${adminUsers.length} total):`);
    console.log('═══════════════════════════════════════════════════');
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
    });
    console.log('═══════════════════════════════════════════════════\n');

    console.log('✅ All done! You can now login with any of the above emails.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdminUser();
