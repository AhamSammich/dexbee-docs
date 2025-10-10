export async function GET() {
  const content = `# DexBee - TypeScript IndexedDB ORM

> A powerful TypeScript IndexedDB ORM with SQL-like query builder interface for modern web applications

---

## Introduction

DexBee is a powerful TypeScript IndexedDB ORM (Object-Relational Mapping) library that brings SQL-like query builder syntax to IndexedDB in the browser. It provides a modern, type-safe way to work with client-side databases in web applications.

### Key Features

- **Type-Safe ORM**: Full TypeScript support with strict type checking, auto-completion and IntelliSense support, compile-time error detection
- **SQL-Like Query Builder**: Familiar SQL syntax for IndexedDB operations, chainable query methods for complex queries, support for aggregations and advanced filtering
- **Modern Architecture**: Built with modern JavaScript features, tree-shakeable for optimal bundle size (~14KB gzipped), promise-based async/await API, browser-focused with ESM support
- **Advanced Features**: Enterprise schema migrations with rollback support, transaction management with ACID compliance, blob storage for Files, Images, and binary data, data validation and default values, index optimization
- **Developer Experience**: Intuitive API design, comprehensive error handling, extensive documentation and examples

### When to Use DexBee

DexBee is perfect for applications that need:
- Offline-first functionality - Store and query data locally
- Complex data relationships - Handle related data with ease  
- Type safety - Catch errors at compile time
- Performance - Optimized queries and indexes
- Scalability - Handle large datasets efficiently

### Quick Example

\`\`\`typescript
import { DexBee, eq, Table } from 'dexbee-js'

// Define your schema
const schema = {
  version: 1,
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
}

// Connect to database
const db = await DexBee.connect('myapp', schema)

// Query data with SQL-like syntax
const users = await db.table('users')
  .where(eq('name', 'John'))
  .orderBy('createdAt', 'desc')
  .limit(10)
  .all()
\`\`\`

---

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- TypeScript 5.0+ (recommended)
- A modern browser with IndexedDB support

### Installation

Install DexBee using your preferred package manager:

\`\`\`bash
# npm
npm install dexbee-js

# pnpm  
pnpm add dexbee-js

# yarn
yarn add dexbee-js
\`\`\`

### Basic Setup

#### 1. Define Your Schema

Create a schema file to define your database structure:

\`\`\`typescript
// schema.ts
import type { DatabaseSchema } from 'dexbee-js';

export const schema: DatabaseSchema = {
  version: 1,
  tables: {
    users: {
      schema: {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        email: { type: 'string', unique: true },
        createdAt: { type: 'date', default: () => new Date() }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'email_idx', keyPath: 'email', unique: true },
        { name: 'created_idx', keyPath: 'createdAt' }
      ]
    },
    posts: {
      schema: {
        id: { type: 'number', required: true },
        userId: { type: 'number', required: true },
        title: { type: 'string', required: true },
        content: { type: 'string' },
        publishedAt: { type: 'date' }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'user_idx', keyPath: 'userId' },
        { name: 'published_idx', keyPath: 'publishedAt' }
      ]
    }
  }
};
\`\`\`

#### 2. Connect to Database

Initialize and connect to your database:

\`\`\`typescript
// database.ts
import { DexBee } from 'dexbee-js';
import { schema } from './schema';

// Create database instance
const db = DexBee.create('myapp', schema);

// Connect to database
await db.connect();

export { db };
\`\`\`

#### 3. Use in Your Application

Import and use your database throughout your application:

\`\`\`typescript
// app.ts
import { db } from './database';
import { eq, and, gte } from 'dexbee-js';

// Insert data
const user = await db.table('users').insert({
  name: 'John Doe',
  email: 'john@example.com'
});

// Query data
const posts = await db.table('posts')
  .where(and(
    eq('userId', user.id),
    gte('publishedAt', new Date('2024-01-01'))
  ))
  .orderBy('publishedAt', 'desc')
  .all();
\`\`\`

### TypeScript Configuration

For the best development experience, ensure your \`tsconfig.json\` includes:

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  }
}
\`\`\`

---

## Database API Reference

The \`Database\` class is the main entry point for DexBee. It manages connections, transactions, and provides access to tables and migration functionality.

### Constructor

\`\`\`typescript
new Database(name: string, schema: DatabaseSchema)
\`\`\`

Creates a new Database instance with the specified name and schema.

**Parameters:**
- \`name\` - The database name
- \`schema\` - The database schema definition

### Static Methods

#### Database.create()

\`\`\`typescript
static create(name: string, schema: DatabaseSchema): Database
\`\`\`

Creates a new Database instance. Alias for the constructor.

#### Database.connect()

\`\`\`typescript
static async connect(name: string, schema: DatabaseSchema): Promise<Database>
\`\`\`

Creates and immediately connects to a database.

### Instance Methods

#### connect()

\`\`\`typescript
async connect(): Promise<void>
\`\`\`

Establishes a connection to the IndexedDB database. Must be called before using the database.

#### close()

\`\`\`typescript
close(): void
\`\`\`

Closes the database connection and aborts any active transactions.

#### table()

\`\`\`typescript
table<T = any>(tableName: string): Table<T>
\`\`\`

Gets a Table instance for the specified table name.

**Parameters:**
- \`tableName\` - Name of the table
- \`T\` - TypeScript type for the table records (optional)

**Returns:** \`Table<T>\` - A Table instance for querying

**Example:**
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const usersTable = db.table<User>('users');
const user = await usersTable.findById(1);
\`\`\`

### Transaction Methods

#### withTransaction()

\`\`\`typescript
async withTransaction<T>(
  options: TransactionOptions,
  callback: (tx: ITransactionWrapper) => Promise<T>
): Promise<T>
\`\`\`

Executes a callback within a transaction and automatically handles commit/abort.

**Parameters:**
- \`options\` - Transaction configuration  
- \`callback\` - Function to execute within the transaction

**Returns:** \`Promise<T>\` - The callback's return value

**Example:**
\`\`\`typescript
const result = await db.withTransaction({
  stores: ['users'],
  mode: 'readwrite'
}, async (tx) => {
  const store = tx.getStore('users');
  await store.add({ name: 'John', email: 'john@example.com' });
  return 'User created';
});
\`\`\`

#### withReadTransaction()

\`\`\`typescript
async withReadTransaction<T>(
  stores: string[],
  callback: (tx: ITransactionWrapper) => Promise<T>
): Promise<T>
\`\`\`

Convenience method for read-only transactions.

#### withWriteTransaction()

\`\`\`typescript
async withWriteTransaction<T>(
  stores: string[],
  callback: (tx: ITransactionWrapper) => Promise<T>
): Promise<T>
\`\`\`

Convenience method for read-write transactions.

### Data Validation Methods

#### validateData()

\`\`\`typescript
validateData(tableName: string, data: any): void
\`\`\`

Validates data against the table schema. Throws an error if validation fails.

#### applyDefaults()

\`\`\`typescript
applyDefaults(tableName: string, data: any): any
\`\`\`

Applies default values to data based on the table schema.

### Migration Methods

#### migrate()

\`\`\`typescript
async migrate(
  newSchema: DatabaseSchema, 
  options?: MigrationOptions
): Promise<MigrationResult>
\`\`\`

Migrates the database to a new schema version.

#### rollback()

\`\`\`typescript
async rollback(targetVersion: number): Promise<RollbackResult>
\`\`\`

Rolls back the database to a previous schema version.

---

## Basic Queries

DexBee provides a powerful SQL-like query builder that makes it easy to retrieve data from IndexedDB.

### Getting a Table

All queries start with getting a table instance:

\`\`\`typescript
const usersTable = db.table('users');
\`\`\`

You can also provide TypeScript types for better type safety:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

const usersTable = db.table<User>('users');
\`\`\`

### Basic Retrieval

#### Get All Records

\`\`\`typescript
// Get all users
const allUsers = await db.table('users').all();

// With type safety
const allUsers: User[] = await db.table<User>('users').all();
\`\`\`

#### Get First Record

\`\`\`typescript
// Get the first user
const firstUser = await db.table('users').first();

// Returns null if no records found
if (firstUser) {
  console.log('Found user:', firstUser.name);
}
\`\`\`

#### Get by ID

\`\`\`typescript
// Find user by primary key
const user = await db.table('users').findById(1);

if (user) {
  console.log('User found:', user);
} else {
  console.log('User not found');
}
\`\`\`

#### Count Records

\`\`\`typescript
// Count all users  
const totalUsers = await db.table('users').count();
console.log(\`Total users: \${totalUsers}\`);
\`\`\`

### Filtering with WHERE

Use the \`where()\` method to filter records. DexBee provides several operator functions:

#### Basic Operators

\`\`\`typescript
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
\`\`\`

#### Range Operators

\`\`\`typescript
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
\`\`\`

Note: The \`in_\` and \`notIn\` operators are deprecated. Use \`inArray\` and \`not(inArray(...))\` instead.

#### Logical Operators

\`\`\`typescript
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
\`\`\`

### Selecting Specific Fields

Use \`select()\` to retrieve only specific fields:

\`\`\`typescript
// Select specific fields
const userNames = await db.table('users')
  .select('name', 'email')
  .all();

// Type-safe field selection
const userInfo = await db.table<User>('users')
  .select('id', 'name')
  .all();
// Result type is Pick<User, 'id' | 'name'>[]
\`\`\`

### Sorting with ORDER BY

Use \`orderBy()\` to sort results:

\`\`\`typescript
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
\`\`\`

### Limiting Results

#### LIMIT

\`\`\`typescript
// Get first 10 users
const firstTenUsers = await db.table('users')
  .limit(10)
  .all();

// Get top 5 newest users
const recentUsers = await db.table('users')
  .orderBy('createdAt', 'desc')
  .limit(5)
  .all();
\`\`\`

#### OFFSET

\`\`\`typescript
// Skip first 20 users, get next 10 (pagination)
const pageTwo = await db.table('users')
  .orderBy('id')
  .offset(20)
  .limit(10)
  .all();
\`\`\`

### Chaining Operations

All query operations can be chained together:

\`\`\`typescript
const query = await db.table<User>('users')
  .select('id', 'name', 'email')
  .where(and(
    eq('status', 'active'),
    gte('createdAt', new Date('2024-01-01'))
  ))
  .orderBy('createdAt', 'desc')
  .limit(50)
  .all();
\`\`\`

### Aggregation Functions

DexBee supports basic aggregation operations:

\`\`\`typescript
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
\`\`\`

---

## Blob Storage

DexBee provides comprehensive support for storing and managing binary data including Files, Blobs, and other binary content. This makes it ideal for applications that need to handle images, documents, audio, video, and other file types.

### Overview

IndexedDB natively supports storing binary data as Blob objects, and DexBee extends this with a rich API for:

- Storing Files and Blobs with metadata
- Querying by file size and MIME type
- Streaming large files
- Managing blob metadata
- Creating object URLs for display/download

### Schema Definition

Define blob fields in your schema using the \`blob\` type:

\`\`\`typescript
import type { DatabaseSchema } from 'dexbee-js'

const schema: DatabaseSchema = {
  version: 1,
  tables: {
    documents: {
      schema: {
        id: { type: 'number', required: true },
        title: { type: 'string', required: true },
        content: { type: 'blob', required: true }, // File/Blob storage
        thumbnail: { type: 'blob' }, // Optional blob
        category: { type: 'string', default: () => 'general' },
        uploadedAt: { type: 'date', default: () => new Date() }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'category_idx', keyPath: 'category' },
        { name: 'uploaded_idx', keyPath: 'uploadedAt' }
      ]
    }
  }
}
\`\`\`

### Storing Files and Blobs

#### Insert with Blob Data

Use \`insertWithBlob()\` to store records containing File or Blob data:

\`\`\`typescript
const db = await DexBee.connect('myapp', schema)
const documentsTable = db.table('documents')

// Store a file from user input
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

await documentsTable.insertWithBlob(
  {
    title: 'My Document',
    category: 'reports'
  },
  {
    content: file // The File object
  }
)
\`\`\`

#### Insert Multiple Blob Fields

\`\`\`typescript
const imageFile = new File(['...'], 'photo.jpg', { type: 'image/jpeg' })
const thumbFile = new File(['...'], 'thumb.jpg', { type: 'image/jpeg' })

await documentsTable.insertWithBlob(
  {
    title: 'Photo Gallery',
    category: 'images'
  },
  {
    content: imageFile,
    thumbnail: thumbFile
  }
)
\`\`\`

### Retrieving Blob Data

#### Get Blob Metadata

Retrieve information about a stored blob without loading the entire file:

\`\`\`typescript
const metadata = await documentsTable.getBlobMetadata(1, 'content')

console.log(metadata)
// {
//   size: 1024567,        // Size in bytes
//   type: 'image/jpeg',   // MIME type
//   name: 'photo.jpg',    // Original filename
//   lastModified: 1234567890
// }
\`\`\`

#### Get Blob as Object URL

Create a temporary URL for displaying or downloading blobs:

\`\`\`typescript
// Get object URL for an image
const url = await documentsTable.getBlobUrl(1, 'content')

// Display in an image element
const img = document.querySelector('img')
img.src = url

// Important: Revoke the URL when done to free memory
img.onload = () => {
  URL.revokeObjectURL(url)
}
\`\`\`

### Querying by Blob Properties

DexBee provides specialized operators for querying based on blob characteristics:

#### Size-Based Queries

\`\`\`typescript
import { sizeBetween, sizeGt, sizeLt } from 'dexbee-js'

// Find large files (> 1MB)
const largeFiles = await documentsTable
  .where(sizeGt('content', 1024 * 1024))
  .all()

// Find small files (< 100KB)
const smallFiles = await documentsTable
  .where(sizeLt('content', 100 * 1024))
  .all()

// Find medium-sized files (100KB - 500KB)
const mediumFiles = await documentsTable
  .where(sizeBetween('content', 100 * 1024, 500 * 1024))
  .all()
\`\`\`

#### MIME Type Queries

\`\`\`typescript
import { and, mimeType } from 'dexbee-js'

// Find all images
const images = await documentsTable
  .where(mimeType('content', 'image/jpeg'))
  .all()

// Find PDFs
const pdfs = await documentsTable
  .where(mimeType('content', 'application/pdf'))
  .all()

// Combine with other conditions
const recentLargeImages = await documentsTable
  .where(and(
    mimeType('content', 'image/jpeg'),
    sizeGt('content', 500 * 1024),
    gte('uploadedAt', new Date('2024-01-01'))
  ))
  .all()
\`\`\`

---

## Examples

### Basic Todo App

A simple todo application demonstrating CRUD operations:

\`\`\`typescript
import { and, DexBee, eq } from 'dexbee-js'

// Define the schema
const todoSchema = {
  version: 1,
  tables: {
    todos: {
      schema: {
        id: { type: 'number', required: true },
        title: { type: 'string', required: true },
        completed: { type: 'boolean', default: () => false },
        createdAt: { type: 'date', default: () => new Date() },
        category: { type: 'string', default: () => 'general' }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'completed_idx', keyPath: 'completed' },
        { name: 'category_idx', keyPath: 'category' },
        { name: 'created_idx', keyPath: 'createdAt' }
      ]
    }
  }
}

// Initialize database
const db = await DexBee.connect('todoapp', todoSchema)

// Todo operations
class TodoService {
  // Create a new todo
  async createTodo(title: string, category: string = 'general') {
    return await db.table('todos').insert({
      title,
      category,
      completed: false
    })
  }

  // Get all todos
  async getAllTodos() {
    return await db.table('todos')
      .orderBy('createdAt', 'desc')
      .all()
  }

  // Get todos by status
  async getTodosByStatus(completed: boolean) {
    return await db.table('todos')
      .where(eq('completed', completed))
      .orderBy('createdAt', 'desc')
      .all()
  }

  // Toggle todo completion
  async toggleTodo(id: number) {
    const todo = await db.table('todos').findById(id)
    if (!todo)
      throw new Error('Todo not found')

    return await db.table('todos').update(id, {
      completed: !todo.completed
    })
  }

  // Delete todo
  async deleteTodo(id: number) {
    return await db.table('todos').delete(id)
  }

  // Get statistics
  async getStats() {
    const [total, completed, pending] = await Promise.all([
      db.table('todos').count(),
      db.table('todos').where(eq('completed', true)).count(),
      db.table('todos').where(eq('completed', false)).count()
    ])

    return { total, completed, pending }
  }
}
\`\`\`

### User Management System

A more complex example with relationships and data validation:

\`\`\`typescript
import { and, DexBee, eq, gte, or } from 'dexbee-js'

const userSchema = {
  version: 1,
  tables: {
    users: {
      schema: {
        id: { type: 'number', required: true },
        username: { type: 'string', required: true, unique: true },
        email: { type: 'string', required: true, unique: true },
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true },
        age: { type: 'number', required: true },
        role: { type: 'string', default: () => 'user' },
        isActive: { type: 'boolean', default: () => true },
        createdAt: { type: 'date', default: () => new Date() },
        lastLoginAt: { type: 'date' }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'username_idx', keyPath: 'username', unique: true },
        { name: 'email_idx', keyPath: 'email', unique: true },
        { name: 'role_idx', keyPath: 'role' },
        { name: 'active_idx', keyPath: 'isActive' }
      ]
    },
    profiles: {
      schema: {
        id: { type: 'number', required: true },
        userId: { type: 'number', required: true },
        bio: { type: 'string' },
        avatar: { type: 'string' },
        website: { type: 'string' },
        location: { type: 'string' },
        preferences: { type: 'object', default: () => ({}) }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'user_idx', keyPath: 'userId', unique: true }
      ]
    }
  }
}

const db = await DexBee.connect('userapp', userSchema)

class UserService {
  // Create user with profile
  async createUser(userData: {
    username: string
    email: string
    firstName: string
    lastName: string
    age: number
    role?: string
  }, profileData?: {
    bio?: string
    avatar?: string
    website?: string
    location?: string
  }) {
    return await db.withWriteTransaction(['users', 'profiles'], async (tx) => {
      // Validate age
      if (userData.age < 13) {
        throw new Error('Users must be at least 13 years old')
      }

      // Create user
      const user = await db.table('users').insert(userData)

      // Create profile if provided
      if (profileData) {
        await db.table('profiles').insert({
          userId: user.id,
          ...profileData
        })
      }

      return user
    })
  }

  // Get user with profile
  async getUserWithProfile(userId: number) {
    const [user, profile] = await Promise.all([
      db.table('users').findById(userId),
      db.table('profiles').where(eq('userId', userId)).first()
    ])

    return user ? { ...user, profile } : null
  }

  // Search users
  async searchUsers(query: {
    role?: string
    isActive?: boolean
    minAge?: number
    limit?: number
  }) {
    let userQuery = db.table('users')

    const conditions = []

    if (query.role) {
      conditions.push(eq('role', query.role))
    }

    if (typeof query.isActive === 'boolean') {
      conditions.push(eq('isActive', query.isActive))
    }

    if (query.minAge) {
      conditions.push(gte('age', query.minAge))
    }

    if (conditions.length > 0) {
      userQuery = userQuery.where(and(...conditions))
    }

    return await userQuery
      .orderBy('createdAt', 'desc')
      .limit(query.limit || 50)
      .all()
  }
}
\`\`\`

---

## Changelog

### [0.2.0] - 2025-10-01

#### Added
- **Blob Storage Support**: Comprehensive support for storing and managing binary data (Files, Blobs)
  - New \`blob\` field type in schema definitions
  - \`insertWithBlob()\`, \`updateBlob()\`, \`getBlobUrl()\`, and \`getBlobMetadata()\` methods on Table
  - Blob-specific query operators: \`sizeGt\`, \`sizeLt\`, \`sizeBetween\`, \`mimeType\`
  - Enhanced reliability for blob storage operations

#### Fixed
- Updated repository URL format for npm provenance verification

#### Documentation
- Added comprehensive JSDoc documentation throughout the API

### [0.1.3] - 2025-10-01

#### Added
- **Query System Enhancements**:
  - New \`inArray()\` operator for IN queries (recommended replacement for \`in_\`)
  - Comprehensive test coverage for all query operators
  - Enhanced query builder documentation

#### Changed
- **Deprecated Operators**:
  - \`in_\` operator deprecated in favor of \`inArray\` for better developer experience
  - \`notIn\` operator deprecated in favor of composable \`not(inArray(...))\` pattern

#### Documentation
- Added comprehensive JSDoc documentation to QueryBuilder and QueryExecutor
- Added extensive JSDoc documentation for all query operators

#### Maintenance
- Linting improvements and code quality enhancements

### [0.1.2] - 2025-09-29

#### Fixed
- Fixed JSR.json synchronization after version updates
- Ensured version consistency across package files

#### Documentation
- Enhanced JSDoc documentation for JSR (JavaScript Registry) compliance
- Improved API documentation quality

### [0.1.1] - 2025-09-29

#### Added
- Initial public release
- Core database connection and transaction management
- SQL-like query builder with chainable interface
- Schema validation and data integrity
- Enterprise-grade migration system with rollback support
- Type-safe TypeScript interfaces throughout
- Tree-shaking optimized build (~14KB gzipped)
- Comprehensive test suite with fake-indexeddb

#### Features
- **Database Management**: Connection lifecycle, schema validation, version management
- **Query System**: SQL-like operators (eq, gt, gte, lt, lte, between, in_, not, and, or)
- **Transaction Management**: Promise-based API with automatic lifecycle handling
- **Migration System**: Automatic schema evolution, dry-run validation, rollback support
- **Type Safety**: Full TypeScript support with strict type checking

---

## Performance Tips

### Use Indexes

Make sure your frequently queried fields have indexes defined in your schema:

\`\`\`typescript
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
\`\`\`

### Limit Result Sets

Always use \`limit()\` for large datasets:

\`\`\`typescript
// Good: Limit results to prevent memory issues
const recentUsers = await db.table('users')
  .orderBy('createdAt', 'desc')
  .limit(100)
  .all();

// Avoid: Loading all records
const allUsers = await db.table('users').all(); // Could be huge!
\`\`\`

### Use Appropriate Operators

Choose the most efficient operators for your queries:

\`\`\`typescript
// Good: Use specific equality checks
const user = await db.table('users')
  .where(eq('id', 123))
  .first();

// Good: Use range queries for indexed fields
const recentUsers = await db.table('users')
  .where(gte('createdAt', yesterday))
  .all();
\`\`\`

---

## Browser Compatibility

DexBee works in all modern browsers that support IndexedDB:

- Chrome 24+
- Firefox 16+  
- Safari 8+
- Edge 12+

File API and Blob API are widely supported. Always test in your target browsers.

---

## Best Practices

### Connection Management

\`\`\`typescript
// Good: Connect once, reuse instance
const db = await Database.connect('myapp', schema);

// Use throughout your app
export { db };

// Clean up when app closes
window.addEventListener('beforeunload', () => {
  db.close();
});
\`\`\`

### Transaction Scope

\`\`\`typescript
// Good: Use withTransaction for automatic cleanup
await db.withWriteTransaction(['users'], async (tx) => {
  // All operations in this block are atomic
  const store = tx.getStore('users');
  await store.add(user1);
  await store.add(user2);
  // Automatically commits or aborts
});
\`\`\`

### Error Handling

\`\`\`typescript
// Good: Handle specific error types
try {
  await db.connect();
} catch (error) {
  if (error instanceof DexBeeError) {
    // Handle DexBee-specific errors
    console.error(\`DexBee error (\${error.code}): \${error.message}\`);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
\`\`\`

### Blob Storage Best Practices

1. **Validate Files**: Check file types and sizes before storage
2. **Clean Up URLs**: Always revoke object URLs to prevent memory leaks
3. **Use Metadata**: Query metadata before loading full blobs
4. **Optimize Images**: Compress/resize images before storage
5. **Set Limits**: Enforce reasonable file size limits
6. **Handle Errors**: Wrap blob operations in try-catch blocks
7. **User Feedback**: Show progress for large file uploads

---

## Framework Integration

### React

\`\`\`typescript
// hooks/useDatabase.ts
import { useEffect, useState } from 'react';
import { db } from '../database';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    db.connect().then(() => setIsReady(true));
    
    return () => {
      db.close();
    };
  }, []);

  return { db, isReady };
}
\`\`\`

### Vue

\`\`\`typescript
// composables/useDatabase.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../database';

export function useDatabase() {
  const isReady = ref(false);

  onMounted(async () => {
    await db.connect();
    isReady.value = true;
  });

  onUnmounted(() => {
    db.close();
  });

  return { db, isReady };
}
\`\`\`

### Svelte

\`\`\`typescript
// stores/database.ts
import { writable } from 'svelte/store';
import { db } from '../database';

export const isReady = writable(false);

db.connect().then(() => {
  isReady.set(true);
});
\`\`\`

---

This documentation covers the complete DexBee API and usage patterns. DexBee provides a modern, type-safe way to work with IndexedDB in web applications with enterprise features like migrations, blob storage, and comprehensive query capabilities.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}