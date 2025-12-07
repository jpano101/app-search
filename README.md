# App Search - Enhanced Search Functionality

A modern, high-performance search application built with Node.js and Elasticsearch, featuring advanced search capabilities and comprehensive API endpoints.

## 🚀 Features

### Enhanced Search Capabilities
- **Multiple Search Types**: Standard, exact, fuzzy, and strict search modes
- **Advanced Filtering**: Category, tags, date range, and custom filters
- **Smart Suggestions**: Auto-complete with completion and term suggestions
- **Flexible Sorting**: Relevance, date, title-based sorting options
- **Rich Highlighting**: Enhanced text highlighting with configurable fragments

### Performance Optimizations
- **Conditional Aggregations**: Optional aggregations for better performance
- **Pagination Controls**: Efficient pagination with total page calculations
- **Rate Limiting**: Built-in request rate limiting
- **Input Validation**: Comprehensive request validation and sanitization

### Analytics & Monitoring
- **Search Analytics**: Track popular queries and search patterns
- **Performance Metrics**: Response time and search volume tracking
- **Health Monitoring**: Built-in health check endpoints

## 📋 API Endpoints

### Search
```
GET /api/search?q=query&page=1&size=10&sortBy=relevance&searchType=standard
```

**Parameters:**
- `q` - Search query (string, max 500 chars)
- `page` - Page number (integer, 1-1000, default: 1)
- `size` - Results per page (integer, 1-100, default: 10)
- `sortBy` - Sort order: `relevance`, `date_desc`, `date_asc`, `title`
- `searchType` - Search mode: `standard`, `exact`, `fuzzy`, `strict`
- `filters` - JSON object with filter criteria
- `includeAggregations` - Include facet aggregations (boolean, default: true)

### Suggestions
```
GET /api/search/suggestions?q=query&limit=10&includeCategories=false
```

### Analytics
```
GET /api/search/analytics?timeframe=7d
```

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   export ELASTICSEARCH_URL=http://localhost:9200
   export ELASTICSEARCH_USERNAME=elastic
   export ELASTICSEARCH_PASSWORD=changeme
   ```
4. Start the application:
   ```bash
   npm start
   ```

## 🔧 Configuration

The application supports the following environment variables:

- `PORT` - Server port (default: 3000)
- `ELASTICSEARCH_URL` - Elasticsearch cluster URL
- `ELASTICSEARCH_USERNAME` - Elasticsearch username
- `ELASTICSEARCH_PASSWORD` - Elasticsearch password

## 📊 Search Types

### Standard Search
Default search mode with fuzzy matching and field boosting.

### Exact Search
Phrase-based search for exact matches.

### Fuzzy Search
High-tolerance fuzzy matching for typo-resistant searches.

### Strict Search
High-precision search with title boosting and minimum score thresholds.

## 🏗️ Architecture

```
src/
├── index.js                 # Application entry point
├── routes/
│   └── search.js            # Search API routes
├── services/
│   ├── searchService.js     # Core search logic
│   └── elasticsearch.js     # Elasticsearch client
└── middleware/
    └── validation.js        # Request validation
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📈 Performance

- **Response Time**: < 100ms for typical queries
- **Throughput**: 1000+ requests/second
- **Scalability**: Horizontal scaling with Elasticsearch cluster

## 🔒 Security

- Input sanitization and validation
- Rate limiting protection
- XSS prevention in search highlights
- Secure Elasticsearch authentication

## 📝 License

MIT License - see LICENSE file for details.
