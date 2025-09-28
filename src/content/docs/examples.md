---
title: "Examples"
description: "Real-world examples and code samples using DexBee"
category: "examples"
order: 1
tags: ["examples", "tutorial", "demo"]
---

# Examples

This page contains practical examples of using DexBee in real applications. Each example includes complete code and explanations.

## Basic Todo App

A simple todo application demonstrating CRUD operations:

```typescript
import { DexBee, eq, and } from 'dexbee-js';

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
};

// Initialize database
const db = await DexBee.connect('todoapp', todoSchema);

// Todo operations
class TodoService {
  // Create a new todo
  async createTodo(title: string, category: string = 'general') {
    return await db.table('todos').insert({
      title,
      category,
      completed: false
    });
  }

  // Get all todos
  async getAllTodos() {
    return await db.table('todos')
      .orderBy('createdAt', 'desc')
      .all();
  }

  // Get todos by status
  async getTodosByStatus(completed: boolean) {
    return await db.table('todos')
      .where(eq('completed', completed))
      .orderBy('createdAt', 'desc')
      .all();
  }

  // Get todos by category
  async getTodosByCategory(category: string) {
    return await db.table('todos')
      .where(eq('category', category))
      .orderBy('createdAt', 'desc')
      .all();
  }

  // Toggle todo completion
  async toggleTodo(id: number) {
    const todo = await db.table('todos').findById(id);
    if (!todo) throw new Error('Todo not found');

    return await db.table('todos').update(id, {
      completed: !todo.completed
    });
  }

  // Delete todo
  async deleteTodo(id: number) {
    return await db.table('todos').delete(id);
  }

  // Get statistics
  async getStats() {
    const [total, completed, pending] = await Promise.all([
      db.table('todos').count(),
      db.table('todos').where(eq('completed', true)).count(),
      db.table('todos').where(eq('completed', false)).count()
    ]);

    return { total, completed, pending };
  }
}
```

## User Management System

A more complex example with relationships and data validation:

```typescript
import { DexBee, eq, gte, and, or } from 'dexbee-js';

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
};

const db = await DexBee.connect('userapp', userSchema);

class UserService {
  // Create user with profile
  async createUser(userData: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    role?: string;
  }, profileData?: {
    bio?: string;
    avatar?: string;
    website?: string;
    location?: string;
  }) {
    return await db.withWriteTransaction(['users', 'profiles'], async (tx) => {
      // Validate age
      if (userData.age < 13) {
        throw new Error('Users must be at least 13 years old');
      }

      // Create user
      const user = await db.table('users').insert(userData);

      // Create profile if provided
      if (profileData) {
        await db.table('profiles').insert({
          userId: user.id,
          ...profileData
        });
      }

      return user;
    });
  }

  // Get user with profile
  async getUserWithProfile(userId: number) {
    const [user, profile] = await Promise.all([
      db.table('users').findById(userId),
      db.table('profiles').where(eq('userId', userId)).first()
    ]);

    return user ? { ...user, profile } : null;
  }

  // Search users
  async searchUsers(query: {
    role?: string;
    isActive?: boolean;
    minAge?: number;
    limit?: number;
  }) {
    let userQuery = db.table('users');

    const conditions = [];

    if (query.role) {
      conditions.push(eq('role', query.role));
    }

    if (typeof query.isActive === 'boolean') {
      conditions.push(eq('isActive', query.isActive));
    }

    if (query.minAge) {
      conditions.push(gte('age', query.minAge));
    }

    if (conditions.length > 0) {
      userQuery = userQuery.where(and(...conditions));
    }

    return await userQuery
      .orderBy('createdAt', 'desc')
      .limit(query.limit || 50)
      .all();
  }

  // Update last login
  async updateLastLogin(userId: number) {
    return await db.table('users').update(userId, {
      lastLoginAt: new Date()
    });
  }

  // Get user statistics
  async getUserStats() {
    const [
      totalUsers,
      activeUsers,
      adminCount,
      recentUsers
    ] = await Promise.all([
      db.table('users').count(),
      db.table('users').where(eq('isActive', true)).count(),
      db.table('users').where(eq('role', 'admin')).count(),
      db.table('users')
        .where(gte('createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
        .count()
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminCount,
      recentSignups: recentUsers
    };
  }
}
```

## E-commerce Product Catalog

Complex querying with categories, pricing, and inventory:

```typescript
import { DexBee, eq, gte, lte, and, or, between, in_ } from 'dexbee-js';

const catalogSchema = {
  version: 1,
  tables: {
    products: {
      schema: {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        description: { type: 'string' },
        price: { type: 'number', required: true },
        categoryId: { type: 'number', required: true },
        sku: { type: 'string', required: true, unique: true },
        inStock: { type: 'boolean', default: () => true },
        stockCount: { type: 'number', default: () => 0 },
        rating: { type: 'number', default: () => 0 },
        reviewCount: { type: 'number', default: () => 0 },
        tags: { type: 'array', default: () => [] },
        createdAt: { type: 'date', default: () => new Date() }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'sku_idx', keyPath: 'sku', unique: true },
        { name: 'category_idx', keyPath: 'categoryId' },
        { name: 'price_idx', keyPath: 'price' },
        { name: 'stock_idx', keyPath: 'inStock' },
        { name: 'rating_idx', keyPath: 'rating' }
      ]
    },
    categories: {
      schema: {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        slug: { type: 'string', required: true, unique: true },
        parentId: { type: 'number' },
        description: { type: 'string' }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'slug_idx', keyPath: 'slug', unique: true },
        { name: 'parent_idx', keyPath: 'parentId' }
      ]
    }
  }
};

const db = await DexBee.connect('catalog', catalogSchema);

class ProductService {
  // Search products with filters
  async searchProducts(filters: {
    categoryId?: number;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    minRating?: number;
    tags?: string[];
    sortBy?: 'price' | 'rating' | 'created';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    let query = db.table('products');
    const conditions = [];

    // Category filter
    if (filters.categoryId) {
      conditions.push(eq('categoryId', filters.categoryId));
    }

    // Price range
    if (filters.priceMin && filters.priceMax) {
      conditions.push(between('price', filters.priceMin, filters.priceMax));
    } else if (filters.priceMin) {
      conditions.push(gte('price', filters.priceMin));
    } else if (filters.priceMax) {
      conditions.push(lte('price', filters.priceMax));
    }

    // Stock filter
    if (typeof filters.inStock === 'boolean') {
      conditions.push(eq('inStock', filters.inStock));
    }

    // Rating filter
    if (filters.minRating) {
      conditions.push(gte('rating', filters.minRating));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Sorting
    const sortBy = filters.sortBy || 'created';
    const sortOrder = filters.sortOrder || 'desc';
    
    if (sortBy === 'created') {
      query = query.orderBy('createdAt', sortOrder);
    } else {
      query = query.orderBy(sortBy, sortOrder);
    }

    // Pagination
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const limit = filters.limit || 20;
    const products = await query.limit(limit).all();

    // Filter by tags (IndexedDB doesn't support array contains)
    let filteredProducts = products;
    if (filters.tags && filters.tags.length > 0) {
      filteredProducts = products.filter(product => 
        filters.tags!.some(tag => product.tags.includes(tag))
      );
    }

    return filteredProducts;
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 10) {
    return await db.table('products')
      .where(and(
        eq('inStock', true),
        gte('rating', 4.0)
      ))
      .orderBy('rating', 'desc')
      .limit(limit)
      .all();
  }

  // Get products by category with hierarchy
  async getProductsByCategory(categorySlug: string) {
    // Get category
    const category = await db.table('categories')
      .where(eq('slug', categorySlug))
      .first();

    if (!category) return [];

    // Get child categories
    const childCategories = await db.table('categories')
      .where(eq('parentId', category.id))
      .all();

    const categoryIds = [category.id, ...childCategories.map(c => c.id)];

    // Get products from all relevant categories
    return await db.table('products')
      .where(and(
        in_('categoryId', categoryIds),
        eq('inStock', true)
      ))
      .orderBy('rating', 'desc')
      .all();
  }

  // Update inventory
  async updateStock(productId: number, quantity: number) {
    const product = await db.table('products').findById(productId);
    if (!product) throw new Error('Product not found');

    const newStockCount = Math.max(0, product.stockCount + quantity);
    
    return await db.table('products').update(productId, {
      stockCount: newStockCount,
      inStock: newStockCount > 0
    });
  }

  // Get low stock products
  async getLowStockProducts(threshold: number = 10) {
    return await db.table('products')
      .where(and(
        eq('inStock', true),
        lte('stockCount', threshold)
      ))
      .orderBy('stockCount', 'asc')
      .all();
  }
}
```

## Data Analytics Dashboard

Aggregation and reporting examples:

```typescript
class AnalyticsService {
  // Sales analytics
  async getSalesMetrics(dateRange?: { start: Date; end: Date }) {
    let query = db.table('orders');

    if (dateRange) {
      query = query.where(between('createdAt', dateRange.start, dateRange.end));
    }

    const orders = await query.all();

    // Calculate metrics
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalSales / orders.length || 0;
    const totalOrders = orders.length;

    // Group by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSales,
      averageOrderValue,
      totalOrders,
      ordersByStatus
    };
  }

  // User engagement metrics
  async getUserEngagement() {
    const [
      totalUsers,
      activeUsers,
      newUsers
    ] = await Promise.all([
      db.table('users').count(),
      db.table('users')
        .where(gte('lastLoginAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
        .count(),
      db.table('users')
        .where(gte('createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)))
        .count()
    ]);

    return {
      total: totalUsers,
      active: activeUsers,
      new: newUsers,
      engagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
    };
  }

  // Product performance
  async getTopProducts(limit: number = 10) {
    return await db.table('products')
      .where(eq('inStock', true))
      .orderBy('reviewCount', 'desc')
      .limit(limit)
      .select('id', 'name', 'rating', 'reviewCount', 'price')
      .all();
  }
}
```

## Migration Example

Schema evolution and data transformation:

```typescript
// Version 1 schema
const schemaV1 = {
  version: 1,
  tables: {
    users: {
      schema: {
        id: { type: 'number', required: true },
        name: { type: 'string', required: true },
        email: { type: 'string', required: true }
      },
      primaryKey: 'id',
      autoIncrement: true
    }
  }
};

// Version 2 schema with new fields
const schemaV2 = {
  version: 2,
  tables: {
    users: {
      schema: {
        id: { type: 'number', required: true },
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true },
        email: { type: 'string', required: true, unique: true },
        createdAt: { type: 'date', default: () => new Date() },
        isActive: { type: 'boolean', default: () => true }
      },
      primaryKey: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'email_idx', keyPath: 'email', unique: true }
      ]
    }
  }
};

// Perform migration
const db = await DexBee.connect('myapp', schemaV1);

// Later, migrate to v2
const migrationResult = await db.migrate(schemaV2, {
  dryRun: false,
  backup: true,
  transformData: true
});

if (migrationResult.success) {
  console.log('Migration completed successfully');
} else {
  console.error('Migration failed:', migrationResult.errors);
}
```

These examples demonstrate various patterns and use cases for DexBee. You can adapt them to your specific needs and combine different techniques for more complex applications.