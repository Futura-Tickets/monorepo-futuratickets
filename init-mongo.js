// MongoDB initialization script for FuturaTickets
// This script runs automatically when MongoDB container starts for the first time

// Switch to the futuratickets database
db = db.getSiblingDB('futuratickets');

// Create collections with validation
db.createCollection('accounts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          description: 'Email address - required'
        },
        role: {
          enum: ['USER', 'ADMIN', 'PROMOTER', 'ACCESS'],
          description: 'User role - required'
        }
      }
    }
  }
});

db.createCollection('events');
db.createCollection('orders');
db.createCollection('sales');
db.createCollection('promoters');
db.createCollection('notifications');
db.createCollection('coupons');
db.createCollection('promocodes');

// Create indexes for better performance
db.accounts.createIndex({ email: 1 }, { unique: true });
db.accounts.createIndex({ role: 1 });
db.events.createIndex({ promoter: 1 });
db.events.createIndex({ status: 1 });
db.events.createIndex({ 'dateTime.startDate': 1 });
db.orders.createIndex({ account: 1 });
db.orders.createIndex({ paymentId: 1 });
db.orders.createIndex({ status: 1 });
db.sales.createIndex({ client: 1 });
db.sales.createIndex({ event: 1 });
db.sales.createIndex({ order: 1 });
db.sales.createIndex({ status: 1 });
db.sales.createIndex({ qrCode: 1 }, { unique: true, sparse: true });

print('✅ FuturaTickets database initialized successfully');
print('📊 Collections created: accounts, events, orders, sales, promoters, notifications, coupons, promocodes');
print('🔍 Indexes created for optimized queries');
