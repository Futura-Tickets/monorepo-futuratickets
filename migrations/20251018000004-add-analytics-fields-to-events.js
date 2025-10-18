/**
 * Migration: Add analytics fields to Events collection
 *
 * Purpose: Add tracking fields for event analytics
 *
 * New fields:
 * - analytics.totalRevenue (Number) - Total revenue generated
 * - analytics.ticketsSold (Number) - Number of tickets sold
 * - analytics.uniqueVisitors (Number) - Unique page views
 * - analytics.lastUpdated (Date) - Last analytics update
 */

module.exports = {
  async up(db, client) {
    console.log('Adding analytics fields to events...');

    const eventsCollection = db.collection('events');

    // Add analytics object to all existing events
    const result = await eventsCollection.updateMany(
      { analytics: { $exists: false } }, // Only events without analytics field
      {
        $set: {
          analytics: {
            totalRevenue: 0,
            ticketsSold: 0,
            uniqueVisitors: 0,
            lastUpdated: new Date()
          }
        }
      }
    );

    console.log(`✓ Updated ${result.modifiedCount} events with analytics fields`);

    // Create index for analytics queries
    await eventsCollection.createIndex(
      { 'analytics.totalRevenue': -1 },
      { name: 'idx_events_analytics_revenue', background: true }
    );
    console.log('✓ Created index: idx_events_analytics_revenue');

    console.log('✅ Analytics fields added successfully');
  },

  async down(db, client) {
    console.log('Removing analytics fields from events...');

    const eventsCollection = db.collection('events');

    // Remove analytics field
    const result = await eventsCollection.updateMany(
      { analytics: { $exists: true } },
      { $unset: { analytics: '' } }
    );

    console.log(`✓ Removed analytics from ${result.modifiedCount} events`);

    // Drop index
    await eventsCollection.dropIndex('idx_events_analytics_revenue');
    console.log('✓ Dropped index: idx_events_analytics_revenue');

    console.log('✅ Analytics fields removed successfully');
  }
};
