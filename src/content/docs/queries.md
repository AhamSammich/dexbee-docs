---
title: "Basic Queries"
description: "Learn how to query data with DexBee's SQL-like syntax"
category: "guides"
order: 1
tags: ["queries", "where", "select", "orderby", "limit"]
---

# Basic Queries

DexBee provides a powerful SQL-like query builder that makes it easy to retrieve data from IndexedDB. This guide covers the fundamental querying operations.

## Getting a Table

All queries start with getting a table instance:

```typescript
const usersTable = db.table('users');
```

You can also provide TypeScript types for better type safety:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

const usersTable = db.table<User>('users');
```

## Basic Retrieval

### Get All Records

```typescript
// Get all users
const allUsers = await db.table('users').all();

// With type safety
const allUsers: User[] = await db.table<User>('users').all();
```

### Get First Record

```typescript
// Get the first user
const firstUser = await db.table('users').first();

// Returns null if no records found
if (firstUser) {
  console.log('Found user:', firstUser.name);
}
```

### Get by ID

```typescript
// Find user by primary key
const user = await db.table('users').findById(1);

if (user) {
  console.log('User found:', user);
} else {
  console.log('User not found');
}
```

### Count Records

```typescript
// Count all users  
const totalUsers = await db.table('users').count();
console.log(`Total users: ${totalUsers}`);
```

## Filtering with WHERE

Use the `where()` method to filter records. DexBee provides several operator functions:

### Basic Operators

```typescript
import { eq, gt, gte, lt, lte, not } from 'dexbee-js';

// Equal to
const johnUsers = await db.table('users')
  .where(eq('name', 'John'))
  .all();

// Greater than
const recentUsers = await db.table('users')
  .where(gt('id', 100))
  .all();

// Greater than or equal
const adultUsers = await db.table('users')
  .where(gte('age', 18))
  .all();

// Less than
const youngUsers = await db.table('users')
  .where(lt('age', 18))
  .all();

// Not equal (using not() with eq())
const nonJohnUsers = await db.table('users')
  .where(not(eq('name', 'John')))
  .all();
```

### Range Operators

```typescript
import { between, inArray, not } from 'dexbee-js';

// Between values
const middleAgedUsers = await db.table('users')
  .where(between('age', 25, 65))
  .all();

// In list of values (recommended)
const specificUsers = await db.table('users')
  .where(inArray('name', ['John', 'Jane', 'Bob']))
  .all();

// Not in list of values (using not + inArray)
const excludedUsers = await db.table('users')
  .where(not(inArray('status', ['banned', 'suspended'])))
  .all();
```

> **Note**: The `in_` and `notIn` operators are deprecated. Use `inArray` and `not(inArray(...))` instead.

### Logical Operators

```typescript
import { and, or } from 'dexbee-js';

// AND conditions
const activeAdults = await db.table('users')
  .where(and(
    eq('status', 'active'),
    gte('age', 18)
  ))
  .all();

// OR conditions
const specialUsers = await db.table('users')
  .where(or(
    eq('role', 'admin'),
    eq('role', 'moderator')
  ))
  .all();

// Complex nested conditions
const complexQuery = await db.table('users')
  .where(and(
    eq('status', 'active'),
    or(
      gte('age', 18),
      eq('hasParentalConsent', true)
    )
  ))
  .all();
```

## Selecting Specific Fields

Use `select()` to retrieve only specific fields:

```typescript
// Select specific fields
const userNames = await db.table('users')
  .select('name', 'email')
  .all();

// Type-safe field selection
const userInfo = await db.table<User>('users')
  .select('id', 'name')
  .all();
// Result type is Pick<User, 'id' | 'name'>[]
```

## Sorting with ORDER BY

Use `orderBy()` to sort results:

```typescript
// Sort ascending (default)
const usersByName = await db.table('users')
  .orderBy('name')
  .all();

// Sort descending
const newestUsers = await db.table('users')
  .orderBy('createdAt', 'desc')
  .all();

// Multiple sorts (chain orderBy calls)
const sortedUsers = await db.table('users')
  .orderBy('status')
  .orderBy('createdAt', 'desc')
  .all();
```

## Limiting Results

### LIMIT

```typescript
// Get first 10 users
const firstTenUsers = await db.table('users')
  .limit(10)
  .all();

// Get top 5 newest users
const recentUsers = await db.table('users')
  .orderBy('createdAt', 'desc')
  .limit(5)
  .all();
```

### OFFSET

```typescript
// Skip first 20 users, get next 10 (pagination)
const pageTwo = await db.table('users')
  .orderBy('id')
  .offset(20)
  .limit(10)
  .all();
```

## Chaining Operations

All query operations can be chained together:

```typescript
const query = await db.table<User>('users')
  .select('id', 'name', 'email')
  .where(and(
    eq('status', 'active'),
    gte('createdAt', new Date('2024-01-01'))
  ))
  .orderBy('createdAt', 'desc')
  .limit(50)
  .all();
```

## Aggregation Functions

DexBee supports basic aggregation operations:

```typescript
// Count with conditions
const activeUserCount = await db.table('users')
  .where(eq('status', 'active'))
  .count();

// Sum
const totalAge = await db.table('users')
  .sum('age');

// Average
const averageAge = await db.table('users')
  .avg('age');

// Min/Max
const youngestAge = await db.table('users')
  .min('age');

const oldestAge = await db.table('users')
  .max('age');
```

## Advanced Query Patterns

### Conditional Queries

```typescript
function buildUserQuery(filters: {
  status?: string;
  minAge?: number;
  searchName?: string;
}) {
  let query = db.table<User>('users');

  const conditions = [];
  
  if (filters.status) {
    conditions.push(eq('status', filters.status));
  }
  
  if (filters.minAge) {
    conditions.push(gte('age', filters.minAge));
  }
  
  if (filters.searchName) {
    // Note: IndexedDB doesn't support LIKE, but you can filter after retrieval
    conditions.push(eq('name', filters.searchName));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query;
}

// Usage
const users = await buildUserQuery({
  status: 'active',
  minAge: 18
}).all();
```

### Pagination Helper

```typescript
async function paginateUsers(page: number, pageSize: number = 20) {
  const offset = (page - 1) * pageSize;
  
  const [users, total] = await Promise.all([
    db.table<User>('users')
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(pageSize)
      .all(),
    db.table('users').count()
  ]);

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

// Usage
const page1 = await paginateUsers(1);
const page2 = await paginateUsers(2, 50);
```

## Performance Tips

### Use Indexes

Make sure your frequently queried fields have indexes defined in your schema:

```typescript
const schema = {
  version: 1,
  tables: {
    users: {
      schema: {
        id: { type: 'number', required: true },
        email: { type: 'string', index: true }, // Single field index
        status: { type: 'string', index: true },
        createdAt: { type: 'date', index: true }
      },
      indexes: [
        // Composite index for common queries
        { name: 'status_created', keyPath: ['status', 'createdAt'] }
      ]
    }
  }
};
```

### Limit Result Sets

Always use `limit()` for large datasets:

```typescript
// Good: Limit results to prevent memory issues
const recentUsers = await db.table('users')
  .orderBy('createdAt', 'desc')
  .limit(100)
  .all();

// Avoid: Loading all records
const allUsers = await db.table('users').all(); // Could be huge!
```

### Use Appropriate Operators

Choose the most efficient operators for your queries:

```typescript
// Good: Use specific equality checks
const user = await db.table('users')
  .where(eq('id', 123))
  .first();

// Good: Use range queries for indexed fields
const recentUsers = await db.table('users')
  .where(gte('createdAt', yesterday))
  .all();
```

## Next Steps

- Learn about [Relationships](/docs/relationships) for querying related data
- Explore [Transactions](/docs/transactions) for atomic operations  
- Check out [Advanced Queries](/docs/advanced-queries) for complex scenarios