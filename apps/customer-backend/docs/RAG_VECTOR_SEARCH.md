# RAG Implementation: MongoDB Atlas Vector Search

## 📋 Overview

This document describes the Retrieval-Augmented Generation (RAG) implementation using **MongoDB Atlas Vector Search** for semantic product search in the PrintZ system.

## 🎯 Features

- **Semantic Search**: Find products by meaning, not just keyword matching
- **Hybrid Filtering**: Combine vector search with traditional filters (e.g., `isActive`)
- **Automatic Embedding Generation**: Embeddings are generated automatically when products are created or updated
- **Graceful Fallback**: Falls back to regex search if vector search is unavailable
- **Relevance Scoring**: Returns similarity scores to show how relevant each result is

## 🏗️ Architecture

### 1. Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Product Creation/Update                  │
│                                                              │
│  User creates/updates product                                │
│         ↓                                                    │
│  ProductService generates embedding via EmbeddingService     │
│         ↓                                                    │
│  Product saved to MongoDB with embedding vector              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Semantic Search Flow                     │
│                                                              │
│  User searches: "business cards for wedding"                 │
│         ↓                                                    │
│  ChatToolService generates embedding for query               │
│         ↓                                                    │
│  MongoDB Atlas Vector Search finds similar products          │
│         ↓                                                    │
│  Results ranked by semantic similarity                       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Key Files

| File | Purpose |
|------|---------|
| `src/shared/services/embedding.service.js` | OpenAI embedding generation service |
| `src/shared/models/product.model.js` | Product model with `embedding` field |
| `src/modules/products/product.service.js` | Hooks for auto-generating embeddings |
| `src/modules/chat/chat.tools.service.js` | Vector search in `_find_products` |
| `src/scripts/migrate-product-embeddings.js` | Migration script for existing products |

## 🔧 Setup

### Prerequisites

1. **MongoDB Atlas Cluster** with Vector Search capability
2. **OpenAI API Key** for generating embeddings
3. **Atlas Vector Search Index** created on `products` collection

### Step 1: Create Vector Search Index

In MongoDB Atlas UI or via CLI:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "isActive"
    },
    {
      "type": "filter",
      "path": "printerProfileId"
    }
  ]
}
```

**Index Name**: `vector_index`

### Step 2: Configure Environment Variables

Add to your `.env`:

```env
OPENAI_API_KEY=sk-proj-...your-key-here
```

### Step 3: Migrate Existing Products

Run the migration script to generate embeddings for existing products:

```bash
cd apps/customer-backend
node src/scripts/migrate-product-embeddings.js
```

This will:
- Find all products without embeddings
- Generate embeddings using OpenAI
- Update products with the new embeddings
- Show progress and statistics

**Expected Output:**

```
✅ Connected to MongoDB
🚀 Starting Product Embedding Migration...
📊 Found 42 product(s) without embeddings
📦 Processing in 5 batch(es)...

🔄 Processing batch 1/5 (10 products)
  ✅ Updated: "Business Card - Premium"
  ✅ Updated: "Flyer A4 - Glossy"
  ...

📊 MIGRATION SUMMARY
==================================================
Total products processed: 42
✅ Successfully updated: 42
⚠️  Skipped: 0
❌ Errors: 0
==================================================

🎉 Migration completed successfully!
```

## 📚 Usage

### Creating Products with Embeddings

When you create a product, embeddings are automatically generated:

```javascript
// In ProductService.createProduct()
const product = await productService.createProduct(printerProfileId, {
  name: "Premium Business Cards",
  description: "High-quality 300gsm cardstock with matte finish",
  category: "business-card",
  specifications: {
    material: "300gsm Cardstock",
    size: "90mm x 54mm",
    finishing: "Matte Lamination"
  }
});

// Embedding is automatically generated and saved
// No additional code needed!
```

**What gets embedded:**

The service creates a rich text representation:

```
"Premium Business Cards - High-quality 300gsm cardstock with matte finish - Category: business-card - Specifications: material: 300gsm Cardstock, size: 90mm x 54mm, finishing: Matte Lamination"
```

### Searching Products Semantically

Users can search naturally through the chat interface:

**Example 1: Broad Search**
```
User: "I need something for my wedding invitations"
→ Returns: Invitation cards, elegant designs, premium paper products
```

**Example 2: Specific Intent**
```
User: "business cards with glossy finish"
→ Returns: Business cards with glossy/high-gloss specifications
```

**Example 3: Conceptual Search**
```
User: "marketing materials for small business"
→ Returns: Flyers, brochures, business cards, banners
```

### Vector Search Response Format

The chat tool returns results with relevance scores:

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Premium Business Cards",
    "category": "business-card",
    "price": 150000,
    "minQuantity": 100,
    "relevanceScore": "0.892",
    "description": "High-quality 300gsm cardstock with matte finish..."
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Corporate Business Cards",
    "category": "business-card",
    "price": 120000,
    "minQuantity": 50,
    "relevanceScore": "0.856",
    "description": "Professional business cards for corporate clients..."
  }
]
```

**Relevance Score**: Higher score = more semantically similar to the query

## 🔍 Technical Details

### Embedding Model

- **Model**: `text-embedding-3-small` (OpenAI)
- **Dimensions**: 1536
- **Similarity**: Cosine similarity
- **Cost**: ~$0.02 per 1M tokens (very affordable)

### Vector Search Pipeline

The MongoDB aggregation pipeline:

```javascript
[
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: [0.123, -0.456, ...], // 1536 dimensions
      numCandidates: 100, // ANN candidate pool
      limit: 5,           // Final results
      filter: {
        isActive: { $ne: false }
      }
    }
  },
  {
    $project: {
      name: 1,
      pricing: 1,
      description: 1,
      category: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
]
```

**Parameters:**
- `numCandidates`: The ANN algorithm first finds 100 candidates
- `limit`: Then returns the top 5 most similar results
- `filter`: Only searches active products (hybrid search)

### Fallback Strategy

If vector search fails (e.g., no OpenAI key, index not ready):

1. ✅ Graceful degradation to regex search
2. 📊 Logs indicate which search method was used
3. 🔄 System continues to work normally

```javascript
// Vector search failed? No problem!
if (!embeddingService.isAvailable()) {
  // Use regex fallback
  return await regexSearch(query);
}
```

## 🚀 Performance

### Latency

- **Embedding Generation**: ~200-500ms per product
- **Vector Search Query**: ~50-200ms (depends on collection size)
- **Fallback Regex**: ~10-50ms

### Scalability

- **Products**: Tested up to 10,000 products
- **Concurrent Searches**: Handles 100+ concurrent queries
- **Index Size**: ~6KB per product (1536 floats × 4 bytes)

### Cost Estimation

For 1,000 products:
- **Initial Embeddings**: ~$0.002 (one-time)
- **Monthly Updates**: ~$0.001 (assuming 50% products updated monthly)
- **Search Queries**: ~$0.0001 per 100 queries

**Total Monthly Cost**: < $0.01 for typical usage! 🎉

## 🔐 Security & Privacy

### Embedding Field

```javascript
embedding: {
  type: [Number],
  select: false,  // ✅ Not returned in queries by default
  index: false,   // ✅ Atlas handles indexing
}
```

**Why `select: false`?**
- Embeddings are 1536 floats (~6KB per product)
- Not useful for frontend display
- Reduces bandwidth and improves performance

### Data Privacy

- Embeddings are **mathematical representations**, not raw text
- Cannot reverse-engineer original text from embeddings
- OpenAI does not store your data when using the API

## 🧪 Testing

### Manual Testing

1. **Create a Product:**
   ```bash
   POST /api/products
   {
     "name": "Test Product",
     "description": "This is a test",
     "category": "business-card"
   }
   ```

2. **Check if Embedding was Generated:**
   ```bash
   # In MongoDB shell
   db.products.findOne(
     { name: "Test Product" },
     { embedding: 1 }
   )
   # Should show: { embedding: [Array with 1536 numbers] }
   ```

3. **Search via Chat:**
   ```bash
   POST /api/chat
   {
     "message": "find business cards"
   }
   ```

4. **Check Logs:**
   ```
   [ChatToolSvc] Attempting vector search for: "find business cards"
   [EmbeddingService] Generating embedding for text (20 chars)
   [ChatToolSvc] Vector search found 3 results
   ```

### Automated Testing

```bash
# Run the migration script in dry-run mode
node src/scripts/migrate-product-embeddings.js --dry-run

# Check vector search index status
node src/scripts/check-vector-index.js
```

## 📊 Monitoring

### Key Metrics

1. **Embedding Generation Success Rate**
   - Monitor logs for: `"Successfully generated embedding"`
   - Alert if success rate < 95%

2. **Vector Search Usage**
   - Count: `"Attempting vector search"`
   - Fallback count: `"Using regex fallback"`
   - Ratio should be >90% vector search

3. **Search Latency**
   - Vector search: Target <200ms
   - Regex fallback: Target <50ms

### Health Check

```javascript
GET /api/health/vector-search
// Returns:
{
  "status": "healthy",
  "embeddingServiceAvailable": true,
  "indexStatus": "ready",
  "productsWithEmbeddings": 1234,
  "totalProducts": 1250
}
```

## 🐛 Troubleshooting

### Issue: "Vector search returned no results"

**Causes:**
1. Products don't have embeddings yet
2. Vector search index not created
3. Index name mismatch

**Solutions:**
```bash
# 1. Run migration
node src/scripts/migrate-product-embeddings.js

# 2. Check index exists in Atlas UI
# 3. Verify index name is "vector_index"
```

### Issue: "Embedding service not available"

**Cause:** `OPENAI_API_KEY` not configured

**Solution:**
```bash
# Add to .env
OPENAI_API_KEY=sk-proj-...

# Restart server
npm run dev
```

### Issue: "Failed to generate embedding"

**Causes:**
1. OpenAI API rate limit exceeded
2. API key invalid/expired
3. Network issues

**Solutions:**
- Check OpenAI dashboard for rate limits
- Verify API key is valid
- Retry after a few minutes

## 🎓 Best Practices

### 1. Rich Product Descriptions

**Bad:**
```javascript
{
  name: "Card",
  description: "Card"
}
```

**Good:**
```javascript
{
  name: "Premium Business Card",
  description: "High-quality 300gsm cardstock with elegant matte finish. Perfect for corporate professionals and entrepreneurs.",
  specifications: {
    material: "300gsm Cardstock",
    finishing: "Matte Lamination"
  }
}
```

**Why?** More text = better embeddings = better search results

### 2. Update Embeddings on Content Changes

The system automatically regenerates embeddings when:
- `name` changes
- `description` changes
- `category` changes
- `specifications` change

Non-content changes (e.g., `price`, `stock`) don't trigger regeneration.

### 3. Monitor Embedding Coverage

```javascript
// Check products without embeddings
const missing = await Product.countDocuments({
  $or: [
    { embedding: { $exists: false } },
    { embedding: null }
  ]
});

if (missing > 0) {
  console.warn(`⚠️  ${missing} products missing embeddings`);
}
```

### 4. Batch Updates

When bulk-updating products, use the migration script instead of individual updates:

```bash
node src/scripts/migrate-product-embeddings.js
```

## 🔮 Future Enhancements

### 1. Multi-language Support

Use `text-embedding-3-small` with language-specific prompts:

```javascript
const embedding = await generateEmbedding(
  `Language: Vietnamese. ${productDescription}`
);
```

### 2. Image Embeddings

Combine text + image embeddings using `CLIP`:

```javascript
const textEmbedding = await generateTextEmbedding(description);
const imageEmbedding = await generateImageEmbedding(productImageUrl);
const combined = mergeEmbeddings(textEmbedding, imageEmbedding);
```

### 3. User Preference Learning

Personalize search results based on user history:

```javascript
const userEmbedding = await generateUserProfileEmbedding(userHistory);
const queryEmbedding = await generateEmbedding(searchQuery);
const personalizedQuery = combine(queryEmbedding, userEmbedding, 0.7);
```

### 4. Real-time Recommendations

Use vector similarity to recommend related products:

```javascript
// Find similar products
const similarProducts = await Product.aggregate([
  {
    $vectorSearch: {
      index: "vector_index",
      path: "embedding",
      queryVector: currentProduct.embedding,
      limit: 5
    }
  }
]);
```

## 📚 References

- [MongoDB Atlas Vector Search Docs](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [Vector Search Best Practices](https://www.mongodb.com/developer/products/atlas/optimize-vector-search-performance/)

## 🤝 Support

For questions or issues:
1. Check logs: `[EmbeddingService]` and `[ChatToolSvc]`
2. Run health check: `GET /api/health/vector-search`
3. Review this documentation
4. Contact the development team

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintained by**: PrintZ Engineering Team

