/**
 * migrate-mongo configuration
 *
 * Database migration tool for MongoDB
 * Manages schema changes, indexes, and data transformations
 *
 * Usage:
 *   npx migrate-mongo create migration-name
 *   npx migrate-mongo up
 *   npx migrate-mongo down
 *   npx migrate-mongo status
 */

require('dotenv').config();

const config = {
  mongodb: {
    // MongoDB connection URL from environment variable
    // Falls back to local MongoDB if not set
    url: process.env.MONGO_URL || 'mongodb://localhost:27017',

    // Database name
    // Extracted from MONGO_URL or use default
    databaseName: getDatabaseName(),

    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Increase timeout for large migrations
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    }
  },

  // Migrations directory
  migrationsDir: 'migrations',

  // Collection to store migration history
  changelogCollectionName: 'migrations_changelog',

  // Collection for migration locks (prevent concurrent migrations)
  lockCollectionName: 'migrations_lock',

  // Lock TTL in seconds (0 = no expiration)
  // Set to 600 (10 minutes) to prevent stuck locks
  lockTtl: 600,

  // File extension for migrations
  migrationFileExtension: '.js',

  // Use file hash for change detection
  // Enables running migrations multiple times safely
  useFileHash: false,

  // Module system (commonjs or esm)
  moduleSystem: 'commonjs',
};

/**
 * Extract database name from MONGO_URL
 * Example: mongodb://localhost:27017/futuratickets -> futuratickets
 */
function getDatabaseName() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/futuratickets';

  // Try to extract database name from URL
  const match = mongoUrl.match(/\/([^/?]+)(\?|$)/);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback to default
  return 'futuratickets';
}

module.exports = config;
