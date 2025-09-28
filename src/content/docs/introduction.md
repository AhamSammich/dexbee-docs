---
title: "Introduction to DexBee"
description: "A TypeScript IndexedDB ORM with SQL-like query builder interface for modern web applications"
category: "getting-started"
order: 1
tags: ["introduction", "overview"]
---

# Introduction to DexBee

DexBee is a powerful TypeScript IndexedDB ORM (Object-Relational Mapping) library that brings SQL-like query builder syntax to IndexedDB in the browser. It provides a modern, type-safe way to work with client-side databases in web applications.

## Key Features

### 🛠️ **Type-Safe ORM**
- Full TypeScript support with strict type checking
- Auto-completion and IntelliSense support
- Compile-time error detection

### 🔍 **SQL-Like Query Builder**
- Familiar SQL syntax for IndexedDB operations
- Chainable query methods for complex queries
- Support for joins, aggregations, and relationships

### 🚀 **Modern Architecture**
- Built with modern JavaScript features
- Tree-shakeable for optimal bundle size
- Promise-based async/await API

### 📊 **Advanced Features**
- Schema migrations and versioning
- Transaction management
- Relationship mapping (hasOne, hasMany, belongsTo)
- Data validation and default values
- Index optimization

### 🎯 **Developer Experience**
- Intuitive API design
- Comprehensive error handling
- Built-in debugging tools
- Extensive documentation

## When to Use DexBee

DexBee is perfect for applications that need:

- **Offline-first functionality** - Store and query data locally
- **Complex data relationships** - Handle related data with ease  
- **Type safety** - Catch errors at compile time
- **Performance** - Optimized queries and indexes
- **Scalability** - Handle large datasets efficiently

## Quick Example

```typescript
import { DexBee, Table, eq } from 'dexbee-js';

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
};

// Connect to database
const db = await DexBee.connect('myapp', schema);

// Query data with SQL-like syntax
const users = await db.table('users')
  .where(eq('name', 'John'))
  .orderBy('createdAt', 'desc')
  .limit(10)
  .all();
```

## Architecture Overview

DexBee is built with a modular architecture that separates concerns:

- **Database Layer** - Connection management and schema validation
- **Query Layer** - SQL-like query building and execution  
- **Transaction Layer** - Safe transaction handling
- **Migration Layer** - Schema evolution and data transformation
- **Type Layer** - TypeScript definitions and validation

## Next Steps

Ready to get started? Check out our [Installation Guide](/docs/installation) to begin using DexBee in your project, or explore the [API Reference](/docs/api) for detailed documentation.