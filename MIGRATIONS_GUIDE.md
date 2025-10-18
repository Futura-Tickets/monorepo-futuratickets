# Database Migrations Guide

## Overview

Database migrations for the FuturaTickets monorepo using **migrate-mongo**.

Migrations allow you to:
- Create and modify database indexes for performance
- Add/remove fields from collections
- Transform existing data
- Track schema changes over time
- Rollback changes if needed

## Quick Start

```bash
# Check migration status
npm run migrate:status

# Run pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Create new migration
npm run migrate:create add-user-preferences
```

## Configuration

### File: `migrate-mongo-config.js`

Configured to read from environment variables:

```javascript
mongodb: {
  url: process.env.MONGO_URL,
  databaseName: getDatabaseName(), // Extracted from MONGO_URL
  options: {
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000
  }
}
```

### Environment Variables Required

```bash
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/futuratickets?retryWrites=true&w=majority
```

## Existing Migrations

### Migration 1: Create Events Indexes
**File**: `20251018000001-create-events-indexes.js`

Creates performance indexes on the `events` collection:

| Index | Fields | Purpose |
|-------|--------|---------|
| idx_events_promoter | promoter | Filter events by promoter |
| idx_events_status | status | Filter by event status |
| idx_events_start_date | dateTime.startDate | Sort by event date |
| idx_events_promoter_status | promoter + status | Admin dashboard queries |
| idx_events_text_search | name + description (text) | Full-text search |
| idx_events_upcoming | startDate + status | Upcoming events listing |

**Benefits**:
- 5-10x faster event queries
- Instant text search
- Optimized admin dashboard

---

### Migration 2: Create Sales (Tickets) Indexes
**File**: `20251018000002-create-sales-indexes.js`

Creates indexes for ticket operations:

| Index | Fields | Purpose | Notes |
|-------|--------|---------|-------|
| idx_sales_qrcode | qrCode | QR validation | **UNIQUE** |
| idx_sales_event | event | Filter tickets by event | |
| idx_sales_client | client | User's tickets | |
| idx_sales_event_client | event + client | User's tickets per event | Compound |
| idx_sales_status | status | Filter by status (OPEN/CLOSED) | |
| idx_sales_promoter_event | promoter + event | Access control queries | Compound |
| idx_sales_event_status | event + status | Valid tickets for entry | Compound |
| idx_sales_order | order | Order tracking | |
| idx_sales_resale_price | resale.resalePrice | Resale marketplace | **SPARSE** |

**Benefits**:
- Instant QR code validation (unique index)
- Fast ticket lookups for access control
- Optimized resale marketplace queries

---

### Migration 3: Create Orders & Accounts Indexes
**File**: `20251018000003-create-orders-accounts-indexes.js`

#### Orders Collection

| Index | Fields | Purpose |
|-------|--------|---------|
| idx_orders_account | account | User's orders |
| idx_orders_event | event | Event's orders |
| idx_orders_payment_id | paymentId | Stripe webhook processing |
| idx_orders_promoter_event | promoter + event | Promoter's orders |
| idx_orders_status | status | Filter by status |
| idx_orders_created_desc | createdAt (desc) | Recent orders |

#### Accounts Collection

| Index | Fields | Purpose | Notes |
|-------|--------|---------|-------|
| idx_accounts_email | email | Login, user lookup | **UNIQUE** |
| idx_accounts_role | role | Role-based queries | |
| idx_accounts_promoter | promoter | Promoter's staff | **SPARSE** |
| idx_accounts_access_event | accessEvent | Access control assignment | **SPARSE** |
| idx_accounts_address | address | Blockchain wallet login | **SPARSE** |

**Benefits**:
- Faster order processing
- Instant user authentication
- Optimized Stripe webhook handling

---

### Migration 4: Add Analytics Fields to Events
**File**: `20251018000004-add-analytics-fields-to-events.js`

Adds analytics tracking to all events:

**New Fields**:
```javascript
{
  analytics: {
    totalRevenue: 0,       // Total EUR generated
    ticketsSold: 0,        // Number of tickets sold
    uniqueVisitors: 0,     // Unique page views
    lastUpdated: Date      // Last analytics update
  }
}
```

**Index Created**:
- `idx_events_analytics_revenue` - Sort events by revenue

**Benefits**:
- Built-in analytics without complex aggregations
- Fast revenue reporting
- Real-time sales metrics

---

## Creating New Migrations

### Step 1: Generate Migration File

```bash
npm run migrate:create your-migration-name
```

Example:
```bash
npm run migrate:create add-user-preferences
```

This creates: `migrations/YYYYMMDDHHMMSS-add-user-preferences.js`

### Step 2: Edit Migration File

```javascript
module.exports = {
  async up(db, client) {
    // Migration logic (apply changes)
    const collection = db.collection('users');

    await collection.updateMany(
      { preferences: { $exists: false } },
      {
        $set: {
          preferences: {
            notifications: true,
            language: 'en',
            theme: 'light'
          }
        }
      }
    );
  },

  async down(db, client) {
    // Rollback logic (undo changes)
    const collection = db.collection('users');

    await collection.updateMany(
      { preferences: { $exists: true } },
      { $unset: { preferences: '' } }
    );
  }
};
```

### Step 3: Test Migration

```bash
# Check status (should show as PENDING)
npm run migrate:status

# Run migration
npm run migrate:up

# Verify in MongoDB
# Connect to your database and check changes

# If issues, rollback
npm run migrate:down
```

## Migration Patterns

### Pattern 1: Create Index

```javascript
async up(db, client) {
  const collection = db.collection('users');

  await collection.createIndex(
    { email: 1 },
    {
      name: 'idx_users_email',
      unique: true,
      background: true  // Don't block other operations
    }
  );
}

async down(db, client) {
  const collection = db.collection('users');
  await collection.dropIndex('idx_users_email');
}
```

### Pattern 2: Add Field with Default Value

```javascript
async up(db, client) {
  const collection = db.collection('events');

  const result = await collection.updateMany(
    { featured: { $exists: false } },
    { $set: { featured: false } }
  );

  console.log(`Updated ${result.modifiedCount} documents`);
}

async down(db, client) {
  const collection = db.collection('events');
  await collection.updateMany(
    { featured: { $exists: true } },
    { $unset: { featured: '' } }
  );
}
```

### Pattern 3: Data Transformation

```javascript
async up(db, client) {
  const collection = db.collection('sales');

  // Find all documents that need transformation
  const cursor = collection.find({
    price: { $type: 'string' }  // Price stored as string
  });

  let count = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    await collection.updateOne(
      { _id: doc._id },
      { $set: { price: parseFloat(doc.price) } }
    );

    count++;
  }

  console.log(`Converted ${count} price fields to numbers`);
}

async down(db, client) {
  const collection = db.collection('sales');

  const cursor = collection.find({
    price: { $type: 'double' }
  });

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    await collection.updateOne(
      { _id: doc._id },
      { $set: { price: doc.price.toString() } }
    );
  }
}
```

### Pattern 4: Rename Field

```javascript
async up(db, client) {
  const collection = db.collection('accounts');

  await collection.updateMany(
    {},
    { $rename: { 'fullName': 'name' } }
  );
}

async down(db, client) {
  const collection = db.collection('accounts');

  await collection.updateMany(
    {},
    { $rename: { 'name': 'fullName' } }
  );
}
```

### Pattern 5: Remove Field

```javascript
async up(db, client) {
  const collection = db.collection('events');

  await collection.updateMany(
    { deprecatedField: { $exists: true } },
    { $unset: { deprecatedField: '' } }
  );
}

async down(db, client) {
  // Warning: Cannot restore removed data
  console.warn('Cannot restore removed field. This operation is irreversible.');
}
```

## Best Practices

### ✅ Do's

1. **Always implement `down()`**
   - Every migration should be reversible
   - Document if a rollback will lose data

2. **Use background indexes**
   - `background: true` prevents blocking
   - Critical for production deployments

3. **Test on staging first**
   - Never run untested migrations in production
   - Verify rollback works

4. **Use sparse indexes when appropriate**
   - For fields that don't exist on all documents
   - Saves space and improves performance

5. **Log migration progress**
   - Use `console.log()` to track progress
   - Helpful for large data transformations

6. **Batch large updates**
   ```javascript
   const batchSize = 1000;
   const cursor = collection.find().batchSize(batchSize);
   ```

### ❌ Don'ts

1. **Don't modify existing migrations**
   - Once run, migrations should not be changed
   - Create a new migration instead

2. **Don't drop collections**
   - Extremely dangerous
   - Only in exceptional circumstances with backups

3. **Don't forget error handling**
   ```javascript
   try {
     await collection.createIndex(...);
   } catch (error) {
     if (error.code !== 85) throw error; // Ignore "index already exists"
   }
   ```

4. **Don't block the database**
   - Use `background: true` for index creation
   - Process data in batches for large updates

5. **Don't skip testing rollback**
   - Always test `down()` works
   - Verify data integrity after rollback

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Run Migrations

on:
  push:
    branches: [main, production]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.17.0'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        env:
          MONGO_URL: ${{ secrets.MONGO_URL }}
        run: |
          npm run migrate:status
          npm run migrate:up

      - name: Verify migrations
        env:
          MONGO_URL: ${{ secrets.MONGO_URL }}
        run: npm run migrate:status
```

### Pre-deployment Script

```bash
#!/bin/bash
# deploy.sh

echo "Checking migration status..."
npm run migrate:status

echo "Running pending migrations..."
npm run migrate:up

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

echo "Deploying application..."
# Your deployment commands here
```

## Troubleshooting

### Issue: Migration Stuck with Lock

**Symptom**: `Migration is locked` error

**Solution**:
```javascript
// Connect to MongoDB
use futuratickets;

// Remove lock
db.migrations_lock.deleteMany({});

// Try migration again
npm run migrate:up
```

### Issue: Migration Failed Partially

**Symptom**: Some documents updated, others failed

**Solution**:
```bash
# 1. Check what was applied
npm run migrate:status

# 2. Rollback if possible
npm run migrate:down

# 3. Fix the migration
# Edit the migration file to add error handling

# 4. Re-run
npm run migrate:up
```

### Issue: Cannot Connect to MongoDB

**Symptom**: `ECONNREFUSED` or `Authentication failed`

**Solution**:
```bash
# Verify MONGO_URL is correct
echo $MONGO_URL

# Test connection with mongosh
mongosh "$MONGO_URL"

# Check network/firewall
ping cluster.mongodb.net
```

### Issue: Index Creation Failed

**Symptom**: `E11000 duplicate key error`

**Solution**:
```javascript
// In migration, handle existing indexes
async up(db, client) {
  try {
    await collection.createIndex(...);
  } catch (error) {
    if (error.code === 85) {
      console.log('Index already exists, skipping');
    } else {
      throw error;
    }
  }
}
```

## Monitoring Migrations

### Check Applied Migrations

```bash
npm run migrate:status
```

Output:
```
FILENAME                               APPLIED AT
20251018000001-create-events-indexes   2025-10-18T10:30:00.000Z
20251018000002-create-sales-indexes    2025-10-18T10:31:00.000Z
20251018000003-orders-accounts         PENDING
20251018000004-add-analytics           PENDING
```

### View Migration History in MongoDB

```javascript
// Connect to database
use futuratickets;

// View changelog
db.migrations_changelog.find().sort({ appliedAt: -1 });

// Example output:
{
  _id: ObjectId("..."),
  fileName: "20251018000001-create-events-indexes.js",
  appliedAt: ISODate("2025-10-18T10:30:00.000Z")
}
```

## Performance Considerations

### Index Creation Times

| Collection Size | Index Creation Time | Background |
|----------------|---------------------|------------|
| < 1,000 docs | < 1 second | Optional |
| 1,000 - 10,000 | 1-10 seconds | Recommended |
| 10,000 - 100,000 | 10-60 seconds | **Required** |
| > 100,000 | 1-10 minutes | **Required** |

### Large Data Transformations

For collections with millions of documents:

```javascript
async up(db, client) {
  const collection = db.collection('huge_collection');
  const batchSize = 10000;

  let processed = 0;
  const cursor = collection.find({ needsUpdate: true }).batchSize(batchSize);

  const operations = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();

    operations.push({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { transformed: true } }
      }
    });

    if (operations.length === batchSize) {
      await collection.bulkWrite(operations);
      processed += operations.length;
      console.log(`Processed ${processed} documents`);
      operations.length = 0; // Clear array
    }
  }

  // Process remaining
  if (operations.length > 0) {
    await collection.bulkWrite(operations);
    processed += operations.length;
  }

  console.log(`Total processed: ${processed} documents`);
}
```

## Resources

- [migrate-mongo Documentation](https://github.com/seppevs/migrate-mongo)
- [MongoDB Indexes Guide](https://docs.mongodb.com/manual/indexes/)
- [MongoDB Update Operators](https://docs.mongodb.com/manual/reference/operator/update/)

---

Last updated: 2025-10-18
