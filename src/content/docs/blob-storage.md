---
title: "Blob Storage"
description: "Store and manage binary data like files, images, and documents with DexBee"
category: "guides"
order: 3
tags: ["blob", "files", "images", "binary", "storage"]
---

# Blob Storage

DexBee provides comprehensive support for storing and managing binary data including Files, Blobs, and other binary content. This makes it ideal for applications that need to handle images, documents, audio, video, and other file types.

## Overview

IndexedDB natively supports storing binary data as Blob objects, and DexBee extends this with a rich API for:

- Storing Files and Blobs with metadata
- Querying by file size and MIME type
- Streaming large files
- Managing blob metadata
- Creating object URLs for display/download

## Schema Definition

Define blob fields in your schema using the `blob` type:

```typescript
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
```

## Storing Files and Blobs

### Insert with Blob Data

Use `insertWithBlob()` to store records containing File or Blob data:

```typescript
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
```

### Insert Multiple Blob Fields

```typescript
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
```

### Store Programmatically Created Blobs

```typescript
// Create a blob from text
const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' })

// Create a blob from canvas
const canvas = document.querySelector('canvas')
canvas.toBlob(async (blob) => {
  await documentsTable.insertWithBlob(
    { title: 'Canvas Export', category: 'graphics' },
    { content: blob }
  )
})
```

## Retrieving Blob Data

### Get Blob Metadata

Retrieve information about a stored blob without loading the entire file:

```typescript
const metadata = await documentsTable.getBlobMetadata(1, 'content')

console.log(metadata)
// {
//   size: 1024567,        // Size in bytes
//   type: 'image/jpeg',   // MIME type
//   name: 'photo.jpg',    // Original filename
//   lastModified: 1234567890
// }
```

### Get Blob as Object URL

Create a temporary URL for displaying or downloading blobs:

```typescript
// Get object URL for an image
const url = await documentsTable.getBlobUrl(1, 'content')

// Display in an image element
const img = document.querySelector('img')
img.src = url

// Important: Revoke the URL when done to free memory
img.onload = () => {
  URL.revokeObjectURL(url)
}
```

### Download a Blob

```typescript
// Create download link
const url = await documentsTable.getBlobUrl(docId, 'content')
const metadata = await documentsTable.getBlobMetadata(docId, 'content')

const link = document.createElement('a')
link.href = url
link.download = metadata.name || 'download'
link.click()

// Clean up
URL.revokeObjectURL(url)
```

## Updating Blob Data

### Update Blob Field

Replace an existing blob with new content:

```typescript
const newFile = new File(['Updated content'], 'document-v2.pdf', {
  type: 'application/pdf'
})

await documentsTable.updateBlob(1, 'content', newFile)
```

### Update Multiple Fields

Update both regular fields and blob fields:

```typescript
// First update regular fields
await documentsTable.update(1, {
  title: 'Updated Document',
  category: 'updated'
})

// Then update blob
await documentsTable.updateBlob(1, 'content', newFile)
```

## Querying by Blob Properties

DexBee provides specialized operators for querying based on blob characteristics:

### Size-Based Queries

```typescript
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
```

### MIME Type Queries

```typescript
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
```

## Practical Examples

### Image Gallery

```typescript
class ImageGallery {
  private db: Database

  async uploadImage(file: File, title: string, tags: string[] = []) {
    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Create thumbnail
    const thumbnail = await this.createThumbnail(file)

    // Store with metadata
    return await this.db.table('images').insertWithBlob(
      {
        title,
        tags,
        uploadedAt: new Date()
      },
      {
        content: file,
        thumbnail
      }
    )
  }

  async getImageUrl(id: number): Promise<string> {
    return await this.db.table('images').getBlobUrl(id, 'content')
  }

  async getThumbnailUrl(id: number): Promise<string> {
    return await this.db.table('images').getBlobUrl(id, 'thumbnail')
  }

  async getImagesBySize(minSize: number, maxSize: number) {
    return await this.db.table('images')
      .where(sizeBetween('content', minSize, maxSize))
      .orderBy('uploadedAt', 'desc')
      .all()
  }

  private async createThumbnail(file: File): Promise<Blob> {
    // Create a smaller version of the image
    const img = await this.loadImage(file)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Resize to thumbnail size
    canvas.width = 200
    canvas.height = 200
    ctx.drawImage(img, 0, 0, 200, 200)

    return new Promise((resolve) => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.8)
    })
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }
}
```

### Document Manager

```typescript
class DocumentManager {
  async uploadDocument(file: File, metadata: {
    title: string
    category: string
    description?: string
  }) {
    const table = this.db.table('documents')

    return await table.insertWithBlob(
      {
        ...metadata,
        uploadedAt: new Date()
      },
      {
        content: file
      }
    )
  }

  async downloadDocument(id: number) {
    const table = this.db.table('documents')
    const doc = await table.findById(id)
    const url = await table.getBlobUrl(id, 'content')
    const metadata = await table.getBlobMetadata(id, 'content')

    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = metadata.name || `${doc.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  async getDocumentsByType(mimeType: string) {
    return await this.db.table('documents')
      .where(mimeType('content', mimeType))
      .orderBy('uploadedAt', 'desc')
      .all()
  }

  async getStorageStats() {
    const docs = await this.db.table('documents').all()

    let totalSize = 0
    const byType = new Map<string, number>()

    for (const doc of docs) {
      const metadata = await this.db.table('documents')
        .getBlobMetadata(doc.id, 'content')

      totalSize += metadata.size

      const count = byType.get(metadata.type) || 0
      byType.set(metadata.type, count + 1)
    }

    return {
      totalSize,
      totalDocuments: docs.length,
      averageSize: totalSize / docs.length,
      byType: Object.fromEntries(byType)
    }
  }
}
```

### File Attachment System

```typescript
interface Attachment {
  id: number
  postId: number
  fileName: string
  fileType: string
  uploadedAt: Date
}

class AttachmentService {
  async addAttachment(postId: number, file: File) {
    const table = this.db.table<Attachment>('attachments')

    return await table.insertWithBlob(
      {
        postId,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: new Date()
      },
      {
        content: file
      }
    )
  }

  async getAttachmentsForPost(postId: number) {
    return await this.db.table<Attachment>('attachments')
      .where(eq('postId', postId))
      .orderBy('uploadedAt', 'desc')
      .all()
  }

  async deleteAttachment(id: number) {
    // Blob is automatically deleted with the record
    await this.db.table('attachments').delete(id)
  }

  async getAttachmentPreview(id: number): Promise<{
    url: string
    metadata: BlobMetadata
    isImage: boolean
    isPDF: boolean
  }> {
    const table = this.db.table('attachments')
    const url = await table.getBlobUrl(id, 'content')
    const metadata = await table.getBlobMetadata(id, 'content')

    return {
      url,
      metadata,
      isImage: metadata.type.startsWith('image/'),
      isPDF: metadata.type === 'application/pdf'
    }
  }
}
```

## Performance Considerations

### Memory Management

Always revoke object URLs when done:

```typescript
const url = await table.getBlobUrl(id, 'content')

// Use the URL
const img = new Image()
img.src = url

// Revoke when loaded
img.onload = () => {
  URL.revokeObjectURL(url)
}
```

### Large File Handling

For very large files, consider chunking or streaming:

```typescript
// Check file size before upload
const MAX_SIZE = 50 * 1024 * 1024 // 50MB

async function uploadLargeFile(file: File) {
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large. Max size: ${MAX_SIZE / 1024 / 1024}MB`)
  }

  // For extremely large files, consider compression
  const compressed = await compressFile(file)

  await documentsTable.insertWithBlob(
    { title: file.name },
    { content: compressed }
  )
}
```

### Query Optimization

Use size filters to avoid loading large files unnecessarily:

```typescript
// Good: Get metadata first, then decide whether to load
const metadata = await table.getBlobMetadata(id, 'content')

if (metadata.size < 5 * 1024 * 1024) { // Only if < 5MB
  const url = await table.getBlobUrl(id, 'content')
  // Use the file
}

// Good: Filter by size in query
const smallImages = await table
  .where(and(
    mimeType('content', 'image/jpeg'),
    sizeLt('content', 1024 * 1024) // < 1MB only
  ))
  .all()
```

## Browser Compatibility

Blob storage in DexBee works in all modern browsers that support IndexedDB:

- Chrome 24+
- Firefox 16+
- Safari 8+
- Edge 12+

File API and Blob API are widely supported. Always test in your target browsers.

## Best Practices

1. **Validate Files**: Check file types and sizes before storage
2. **Clean Up URLs**: Always revoke object URLs to prevent memory leaks
3. **Use Metadata**: Query metadata before loading full blobs
4. **Optimize Images**: Compress/resize images before storage
5. **Set Limits**: Enforce reasonable file size limits
6. **Handle Errors**: Wrap blob operations in try-catch blocks
7. **User Feedback**: Show progress for large file uploads

## Next Steps

- Learn about [Transactions](/docs/transactions) for atomic blob operations
- Explore [Advanced Queries](/docs/advanced-queries) for complex blob filtering
- Check out [Migration Guide](/docs/migrations) for adding blob fields to existing schemas
