/**
 * Migration: Create indexes for Events collection
 *
 * Purpose: Improve query performance on frequently accessed fields
 *
 * Indexes created:
 * - promoter (ascending) - for filtering events by promoter
 * - status (ascending) - for filtering by event status
 * - dateTime.startDate (ascending) - for sorting by event date
 * - name (text) - for full-text search
 * - compound index on promoter + status - for admin dashboard
 */

module.exports = {
  async up(db, client) {
    console.log('Creating indexes on events collection...');

    const eventsCollection = db.collection('events');

    // Index for filtering by promoter
    await eventsCollection.createIndex(
      { promoter: 1 },
      { name: 'idx_events_promoter', background: true }
    );
    console.log('✓ Created index: idx_events_promoter');

    // Index for filtering by status
    await eventsCollection.createIndex(
      { status: 1 },
      { name: 'idx_events_status', background: true }
    );
    console.log('✓ Created index: idx_events_status');

    // Index for sorting by event start date
    await eventsCollection.createIndex(
      { 'dateTime.startDate': 1 },
      { name: 'idx_events_start_date', background: true }
    );
    console.log('✓ Created index: idx_events_start_date');

    // Compound index for admin dashboard (most common query)
    await eventsCollection.createIndex(
      { promoter: 1, status: 1 },
      { name: 'idx_events_promoter_status', background: true }
    );
    console.log('✓ Created index: idx_events_promoter_status');

    // Text index for event name search
    await eventsCollection.createIndex(
      { name: 'text', description: 'text' },
      { name: 'idx_events_text_search', background: true }
    );
    console.log('✓ Created index: idx_events_text_search');

    // Index for filtering upcoming events
    await eventsCollection.createIndex(
      { 'dateTime.startDate': 1, status: 1 },
      { name: 'idx_events_upcoming', background: true }
    );
    console.log('✓ Created index: idx_events_upcoming');

    console.log('✅ All events indexes created successfully');
  },

  async down(db, client) {
    console.log('Dropping indexes on events collection...');

    const eventsCollection = db.collection('events');

    // Drop all indexes created in up()
    await eventsCollection.dropIndex('idx_events_promoter');
    await eventsCollection.dropIndex('idx_events_status');
    await eventsCollection.dropIndex('idx_events_start_date');
    await eventsCollection.dropIndex('idx_events_promoter_status');
    await eventsCollection.dropIndex('idx_events_text_search');
    await eventsCollection.dropIndex('idx_events_upcoming');

    console.log('✅ All events indexes dropped successfully');
  }
};
