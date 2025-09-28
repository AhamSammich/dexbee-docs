---
title: "Installation & Setup"
description: "How to install and set up DexBee in your project"
category: "getting-started"
order: 2
tags: ["installation", "setup", "npm", "pnpm"]
---

# Installation & Setup

Get started with DexBee by installing it in your project and setting up your first database.

## Prerequisites

- Node.js 18+ 
- TypeScript 5.0+ (recommended)
- A modern browser with IndexedDB support

## Installation

Install DexBee using your preferred package manager:

```bash
# npm
npm install dexbee-js

# pnpm  
pnpm add dexbee-js

# yarn
yarn add dexbee-js
```

## Basic Setup

### 1. Define Your Schema

Create a schema file to define your database structure:

```typescript
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
```

### 2. Connect to Database

Initialize and connect to your database:

```typescript
// database.ts
import { DexBee } from 'dexbee-js';
import { schema } from './schema';

// Create database instance
const db = DexBee.create('myapp', schema);

// Connect to database
await db.connect();

export { db };
```

### 3. Use in Your Application

Import and use your database throughout your application:

```typescript
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
```

## TypeScript Configuration

For the best development experience, ensure your `tsconfig.json` includes:

```json
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
```

## Framework Integration

### React

```typescript
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
```

### Vue

```typescript
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
```

### Svelte

```typescript
// stores/database.ts
import { writable } from 'svelte/store';
import { db } from '../database';

export const isReady = writable(false);

db.connect().then(() => {
  isReady.set(true);
});
```

## Development vs Production

### Development Setup

For development, you might want additional debugging:

```typescript
const db = DexBee.create('myapp-dev', schema);

// Enable debug mode (if available)
if (process.env.NODE_ENV === 'development') {
  // Development-specific configuration
}
```

### Production Setup

For production, consider:

```typescript
const db = DexBee.create('myapp', schema);

// Handle connection errors gracefully
try {
  await db.connect();
} catch (error) {
  console.error('Database connection failed:', error);
  // Fallback behavior
}
```

## Next Steps

Now that you have DexBee installed and configured:

1. Learn about [Schema Definition](/docs/schema) to design your data structure
2. Explore [Basic Queries](/docs/queries) to start working with your data
3. Check out [Relationships](/docs/relationships) for complex data modeling
4. Review [Migration Guide](/docs/migrations) for schema evolution

## Troubleshooting

### Common Issues

**Browser Compatibility**: Ensure your target browsers support IndexedDB. All modern browsers do, but check [Can I Use](https://caniuse.com/indexeddb) for specific versions.

**TypeScript Errors**: Make sure your TypeScript configuration is compatible with ES2020+ features.

**Bundle Size**: DexBee is tree-shakeable. Import only the features you need to minimize bundle size.

Need help? Check our [FAQ](/docs/faq) or browse the [API Reference](/docs/api).