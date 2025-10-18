/**
 * Migration: Create indexes for Sales (Tickets) collection
 *
 * Purpose: Optimize ticket validation and querying
 *
 * Indexes created:
 * - event + client - for user's tickets per event
 * - qrCode (unique) - for fast ticket validation
 * - status + event - for filtering valid tickets
 * - promoter + event - for access control queries
 */

module.exports = {
  async up(db, client) {
    console.log('Creating indexes on sales collection...');

    const salesCollection = db.collection('sales');

    // Unique index on QR code (each ticket has unique QR)
    await salesCollection.createIndex(
      { qrCode: 1 },
      {
        name: 'idx_sales_qrcode',
        unique: true,
        sparse: true, // Allow null values (tickets without QR yet)
        background: true
      }
    );
    console.log('✓ Created index: idx_sales_qrcode (unique)');

    // Index for filtering tickets by event
    await salesCollection.createIndex(
      { event: 1 },
      { name: 'idx_sales_event', background: true }
    );
    console.log('✓ Created index: idx_sales_event');

    // Index for user's tickets
    await salesCollection.createIndex(
      { client: 1 },
      { name: 'idx_sales_client', background: true }
    );
    console.log('✓ Created index: idx_sales_client');

    // Compound index for user's tickets in a specific event
    await salesCollection.createIndex(
      { event: 1, client: 1 },
      { name: 'idx_sales_event_client', background: true }
    );
    console.log('✓ Created index: idx_sales_event_client');

    // Index for filtering by status (OPEN tickets for validation)
    await salesCollection.createIndex(
      { status: 1 },
      { name: 'idx_sales_status', background: true }
    );
    console.log('✓ Created index: idx_sales_status');

    // Compound index for access control (promoter checking their event's tickets)
    await salesCollection.createIndex(
      { promoter: 1, event: 1 },
      { name: 'idx_sales_promoter_event', background: true }
    );
    console.log('✓ Created index: idx_sales_promoter_event');

    // Index for valid tickets ready for entry
    await salesCollection.createIndex(
      { event: 1, status: 1 },
      { name: 'idx_sales_event_status', background: true }
    );
    console.log('✓ Created index: idx_sales_event_status');

    // Index for order tracking
    await salesCollection.createIndex(
      { order: 1 },
      { name: 'idx_sales_order', background: true }
    );
    console.log('✓ Created index: idx_sales_order');

    // Index for resale marketplace queries
    await salesCollection.createIndex(
      { 'resale.resalePrice': 1 },
      {
        name: 'idx_sales_resale_price',
        sparse: true, // Only index documents with resalePrice
        background: true
      }
    );
    console.log('✓ Created index: idx_sales_resale_price');

    console.log('✅ All sales indexes created successfully');
  },

  async down(db, client) {
    console.log('Dropping indexes on sales collection...');

    const salesCollection = db.collection('sales');

    // Drop all indexes
    await salesCollection.dropIndex('idx_sales_qrcode');
    await salesCollection.dropIndex('idx_sales_event');
    await salesCollection.dropIndex('idx_sales_client');
    await salesCollection.dropIndex('idx_sales_event_client');
    await salesCollection.dropIndex('idx_sales_status');
    await salesCollection.dropIndex('idx_sales_promoter_event');
    await salesCollection.dropIndex('idx_sales_event_status');
    await salesCollection.dropIndex('idx_sales_order');
    await salesCollection.dropIndex('idx_sales_resale_price');

    console.log('✅ All sales indexes dropped successfully');
  }
};
