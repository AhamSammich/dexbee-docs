---
title: "Database API"
description: "Complete reference for the Database class and connection management"
category: "api"
order: 1
tags: ["api", "database", "connection", "reference"]
---

# Database API

The `Database` class is the main entry point for DexBee. It manages connections, transactions, and provides access to tables and migration functionality.

## Class: Database

### Constructor

```typescript
new Database(name: string, schema: DatabaseSchema)
```

Creates a new Database instance with the specified name and schema.

**Parameters:**
- `name` - The database name
- `schema` - The database schema definition

**Example:**
```typescript
import { Database } from 'dexbee-js';

const schema = {
  version: 1,
  tables: {
    users: {
      schema: {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true }
      },
      primaryKey: 'id',
      autoIncrement: true
    }
  }
};

const db = new Database('myapp', schema);
```

### Static Methods

#### Database.create()

```typescript
static create(name: string, schema: DatabaseSchema): Database
```

Creates a new Database instance. Alias for the constructor.

#### Database.connect()

```typescript
static async connect(name: string, schema: DatabaseSchema): Promise<Database>
```

Creates and immediately connects to a database.

**Example:**
```typescript
const db = await Database.connect('myapp', schema);
```

### Instance Methods

#### connect()

```typescript
async connect(): Promise<void>
```

Establishes a connection to the IndexedDB database. Must be called before using the database.

**Example:**
```typescript
await db.connect();
```

#### close()

```typescript
close(): void
```

Closes the database connection and aborts any active transactions.

**Example:**
```typescript
db.close();
```

#### isConnected()

```typescript
isConnected(): boolean
```

Returns whether the database is currently connected.

**Returns:** `boolean` - True if connected, false otherwise

#### table()

```typescript
table<T = any>(tableName: string): Table<T>
```

Gets a Table instance for the specified table name.

**Parameters:**
- `tableName` - Name of the table
- `T` - TypeScript type for the table records (optional)

**Returns:** `Table<T>` - A Table instance for querying

**Example:**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const usersTable = db.table<User>('users');
const user = await usersTable.findById(1);
```

### Transaction Methods

#### transaction()

```typescript
async transaction(options: TransactionOptions): Promise<ITransactionWrapper>
```

Creates a new transaction with the specified options.

**Parameters:**
- `options` - Transaction configuration

**Returns:** `Promise<ITransactionWrapper>` - A transaction wrapper

**Example:**
```typescript
const tx = await db.transaction({
  stores: ['users', 'posts'],
  mode: 'readwrite'
});
```

#### withTransaction()

```typescript
async withTransaction<T>(
  options: TransactionOptions,
  callback: (tx: ITransactionWrapper) => Promise<T>
): Promise<T>
```

Executes a callback within a transaction and automatically handles commit/abort.

**Parameters:**
- `options` - Transaction configuration  
- `callback` - Function to execute within the transaction

**Returns:** `Promise<T>` - The callback's return value

**Example:**
```typescript
const result = await db.withTransaction({
  stores: ['users'],
  mode: 'readwrite'
}, async (tx) => {
  const store = tx.getStore('users');
  await store.add({ name: 'John', email: 'john@example.com' });
  return 'User created';
});
```

#### withReadTransaction()

```typescript
async withReadTransaction<T>(
  stores: string[],
  callback: (tx: ITransactionWrapper) => Promise<T>
): Promise<T>
```

Convenience method for read-only transactions.

**Parameters:**
- `stores` - Array of store names to access
- `callback` - Function to execute within the transaction

**Example:**
```typescript
const users = await db.withReadTransaction(['users'], async (tx) => {
  const store = tx.getStore('users');
  return await store.getAll();
});
```

#### withWriteTransaction()

```typescript
async withWriteTransaction<T>(
  stores: string[],
  callback: (tx: ITransactionWrapper) => Promise<T>
): Promise<T>
```

Convenience method for read-write transactions.

**Parameters:**
- `stores` - Array of store names to access  
- `callback` - Function to execute within the transaction

**Example:**
```typescript
await db.withWriteTransaction(['users'], async (tx) => {
  const store = tx.getStore('users');
  await store.put({ id: 1, name: 'Jane', email: 'jane@example.com' });
});
```

### Data Validation Methods

#### validateData()

```typescript
validateData(tableName: string, data: any): void
```

Validates data against the table schema. Throws an error if validation fails.

**Parameters:**
- `tableName` - Name of the table
- `data` - Data to validate

**Example:**
```typescript
try {
  db.validateData('users', { name: 'John' }); // Missing required fields
} catch (error) {
  console.error('Validation failed:', error);
}
```

#### applyDefaults()

```typescript
applyDefaults(tableName: string, data: any): any
```

Applies default values to data based on the table schema.

**Parameters:**
- `tableName` - Name of the table
- `data` - Data to process

**Returns:** Data with defaults applied

**Example:**
```typescript
const userData = { name: 'John' };
const withDefaults = db.applyDefaults('users', userData);
// withDefaults might include createdAt: new Date()
```

### Transaction Utility Methods

#### getActiveTransactionCount()

```typescript
getActiveTransactionCount(): number
```

Returns the number of currently active transactions.

**Returns:** `number` - Count of active transactions

#### abortAllTransactions()

```typescript
async abortAllTransactions(): Promise<void>
```

Aborts all active transactions. Useful for cleanup or error handling.

### Migration Methods

#### migrate()

```typescript
async migrate(
  newSchema: DatabaseSchema, 
  options?: MigrationOptions
): Promise<MigrationResult>
```

Migrates the database to a new schema version.

**Parameters:**
- `newSchema` - The target schema
- `options` - Migration options (optional)

**Returns:** `Promise<MigrationResult>` - Migration result details

**Example:**
```typescript
const newSchema = {
  version: 2,
  tables: {
    users: {
      schema: {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        email: { type: 'string', unique: true },
        createdAt: { type: 'date', default: () => new Date() }
      },
      primaryKey: 'id',
      autoIncrement: true
    }
  }
};

const result = await db.migrate(newSchema, {
  dryRun: false,
  backup: true
});
```

#### rollback()

```typescript
async rollback(targetVersion: number): Promise<RollbackResult>
```

Rolls back the database to a previous schema version.

**Parameters:**
- `targetVersion` - Version to roll back to

**Returns:** `Promise<RollbackResult>` - Rollback result details

## Interfaces

### TransactionOptions

```typescript
interface TransactionOptions {
  stores: string[];
  mode: 'readonly' | 'readwrite';
  durability?: 'default' | 'strict' | 'relaxed';
}
```

### MigrationOptions

```typescript
interface MigrationOptions {
  dryRun?: boolean;
  backup?: boolean;
  validateOnly?: boolean;
  transformData?: boolean;
}
```

## Error Handling

The Database class throws `DexBeeError` instances for various error conditions:

```typescript
import { DexBeeError, DexBeeErrorCode } from 'dexbee-js';

try {
  await db.connect();
} catch (error) {
  if (error instanceof DexBeeError) {
    switch (error.code) {
      case DexBeeErrorCode.CONNECTION_FAILED:
        // Handle connection error
        break;
      case DexBeeErrorCode.SCHEMA_VALIDATION_FAILED:
        // Handle schema error
        break;
      default:
        // Handle other errors
    }
  }
}
```

## Best Practices

### Connection Management

```typescript
// Good: Connect once, reuse instance
const db = await Database.connect('myapp', schema);

// Use throughout your app
export { db };

// Clean up when app closes
window.addEventListener('beforeunload', () => {
  db.close();
});
```

### Transaction Scope

```typescript
// Good: Use withTransaction for automatic cleanup
await db.withWriteTransaction(['users'], async (tx) => {
  // All operations in this block are atomic
  const store = tx.getStore('users');
  await store.add(user1);
  await store.add(user2);
  // Automatically commits or aborts
});
```

### Error Handling

```typescript
// Good: Handle specific error types
try {
  await db.connect();
} catch (error) {
  if (error instanceof DexBeeError) {
    // Handle DexBee-specific errors
    console.error(`DexBee error (${error.code}): ${error.message}`);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```