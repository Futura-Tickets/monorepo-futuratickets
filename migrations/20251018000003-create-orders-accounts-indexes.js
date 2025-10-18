/**
 * Migration: Create indexes for Orders and Accounts collections
 *
 * Purpose: Optimize order tracking and user queries
 */

module.exports = {
  async up(db, client) {
    console.log('Creating indexes on orders and accounts collections...');

    // === ORDERS COLLECTION ===
    const ordersCollection = db.collection('orders');

    // Index for user's orders
    await ordersCollection.createIndex(
      { account: 1 },
      { name: 'idx_orders_account', background: true }
    );
    console.log('✓ Created index: idx_orders_account');

    // Index for event's orders
    await ordersCollection.createIndex(
      { event: 1 },
      { name: 'idx_orders_event', background: true }
    );
    console.log('✓ Created index: idx_orders_event');

    // Index for Stripe payment ID (webhook processing)
    await ordersCollection.createIndex(
      { paymentId: 1 },
      { name: 'idx_orders_payment_id', background: true }
    );
    console.log('✓ Created index: idx_orders_payment_id');

    // Compound index for promoter's orders
    await ordersCollection.createIndex(
      { promoter: 1, event: 1 },
      { name: 'idx_orders_promoter_event', background: true }
    );
    console.log('✓ Created index: idx_orders_promoter_event');

    // Index for order status
    await ordersCollection.createIndex(
      { status: 1 },
      { name: 'idx_orders_status', background: true }
    );
    console.log('✓ Created index: idx_orders_status');

    // Index for created date (recent orders)
    await ordersCollection.createIndex(
      { createdAt: -1 },
      { name: 'idx_orders_created_desc', background: true }
    );
    console.log('✓ Created index: idx_orders_created_desc');

    // === ACCOUNTS COLLECTION ===
    const accountsCollection = db.collection('accounts');

    // Unique index on email
    await accountsCollection.createIndex(
      { email: 1 },
      {
        name: 'idx_accounts_email',
        unique: true,
        background: true
      }
    );
    console.log('✓ Created index: idx_accounts_email (unique)');

    // Index for role-based queries
    await accountsCollection.createIndex(
      { role: 1 },
      { name: 'idx_accounts_role', background: true }
    );
    console.log('✓ Created index: idx_accounts_role');

    // Index for promoter's accounts
    await accountsCollection.createIndex(
      { promoter: 1 },
      {
        name: 'idx_accounts_promoter',
        sparse: true,
        background: true
      }
    );
    console.log('✓ Created index: idx_accounts_promoter');

    // Index for access event assignment
    await accountsCollection.createIndex(
      { accessEvent: 1 },
      {
        name: 'idx_accounts_access_event',
        sparse: true,
        background: true
      }
    );
    console.log('✓ Created index: idx_accounts_access_event');

    // Index for blockchain address (wallet login)
    await accountsCollection.createIndex(
      { address: 1 },
      {
        name: 'idx_accounts_address',
        sparse: true,
        background: true
      }
    );
    console.log('✓ Created index: idx_accounts_address');

    console.log('✅ All orders and accounts indexes created successfully');
  },

  async down(db, client) {
    console.log('Dropping indexes on orders and accounts collections...');

    // Drop orders indexes
    const ordersCollection = db.collection('orders');
    await ordersCollection.dropIndex('idx_orders_account');
    await ordersCollection.dropIndex('idx_orders_event');
    await ordersCollection.dropIndex('idx_orders_payment_id');
    await ordersCollection.dropIndex('idx_orders_promoter_event');
    await ordersCollection.dropIndex('idx_orders_status');
    await ordersCollection.dropIndex('idx_orders_created_desc');

    // Drop accounts indexes
    const accountsCollection = db.collection('accounts');
    await accountsCollection.dropIndex('idx_accounts_email');
    await accountsCollection.dropIndex('idx_accounts_role');
    await accountsCollection.dropIndex('idx_accounts_promoter');
    await accountsCollection.dropIndex('idx_accounts_access_event');
    await accountsCollection.dropIndex('idx_accounts_address');

    console.log('✅ All orders and accounts indexes dropped successfully');
  }
};
