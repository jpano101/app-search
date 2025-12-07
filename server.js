const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting for search API
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many search requests, please try again later.'
});

// Database setup with optimized configuration
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database with sample data and indexes
function initializeDatabase() {
  // Create products table with indexes for fast searching
  db.serialize(() => {
    db.run(`CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price REAL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create indexes for fast searching
    db.run('CREATE INDEX idx_products_name ON products(name)');
    db.run('CREATE INDEX idx_products_category ON products(category)');
    db.run('CREATE INDEX idx_products_price ON products(price)');
    db.run('CREATE VIRTUAL TABLE products_fts USING fts5(name, description, category, tags, content=products, content_rowid=id)');

    // Insert sample data
    const sampleProducts = [
      ['iPhone 14 Pro', 'Latest Apple smartphone with advanced camera', 'Electronics', 999.99, 'apple,phone,smartphone,mobile'],
      ['MacBook Air M2', 'Lightweight laptop with M2 chip', 'Electronics', 1199.99, 'apple,laptop,computer,m2'],
      ['Samsung Galaxy S23', 'Android flagship smartphone', 'Electronics', 899.99, 'samsung,phone,android,smartphone'],
      ['Dell XPS 13', 'Premium ultrabook laptop', 'Electronics', 1099.99, 'dell,laptop,computer,ultrabook'],
      ['AirPods Pro', 'Wireless earbuds with noise cancellation', 'Electronics', 249.99, 'apple,earbuds,wireless,audio'],
      ['Sony WH-1000XM4', 'Premium noise-canceling headphones', 'Electronics', 349.99, 'sony,headphones,wireless,audio'],
      ['iPad Pro 12.9', 'Professional tablet with M2 chip', 'Electronics', 1099.99, 'apple,tablet,ipad,m2'],
      ['Nintendo Switch', 'Portable gaming console', 'Gaming', 299.99, 'nintendo,gaming,console,portable'],
      ['PlayStation 5', 'Next-gen gaming console', 'Gaming', 499.99, 'sony,gaming,console,ps5'],
      ['Xbox Series X', 'Microsoft gaming console', 'Gaming', 499.99, 'microsoft,gaming,console,xbox'],
      ['Logitech MX Master 3', 'Professional wireless mouse', 'Accessories', 99.99, 'logitech,mouse,wireless,productivity'],
      ['Mechanical Keyboard RGB', 'Gaming mechanical keyboard', 'Accessories', 149.99, 'keyboard,gaming,mechanical,rgb'],
      ['4K Monitor 27 inch', 'Ultra HD display monitor', 'Electronics', 399.99, 'monitor,display,4k,screen'],
      ['Webcam HD 1080p', 'High definition webcam', 'Electronics', 79.99, 'webcam,camera,streaming,hd'],
      ['Wireless Charger', 'Fast wireless charging pad', 'Accessories', 29.99, 'charger,wireless,fast,charging']
    ];

    const stmt = db.prepare('INSERT INTO products (name, description, category, price, tags) VALUES (?, ?, ?, ?, ?)');
    sampleProducts.forEach(product => {
      stmt.run(product);
    });
    stmt.finalize();

    // Populate FTS table
    db.run('INSERT INTO products_fts(products_fts) VALUES("rebuild")');
    
    console.log('Database initialized with sample data and indexes');
  });
}

// Optimized search endpoint with caching headers
app.get('/api/search', searchLimiter, (req, res) => {
  const { q, category, minPrice, maxPrice, limit = 10, offset = 0 } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  // Set cache headers for better performance
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
  
  let query = `
    SELECT p.id, p.name, p.description, p.category, p.price, p.tags,
           snippet(products_fts, 0, '<mark>', '</mark>', '...', 32) as highlighted_name,
           snippet(products_fts, 1, '<mark>', '</mark>', '...', 64) as highlighted_description
    FROM products_fts 
    JOIN products p ON products_fts.rowid = p.id
    WHERE products_fts MATCH ?
  `;
  
  const params = [q + '*']; // Use prefix matching for better UX
  
  // Add category filter if specified
  if (category) {
    query += ' AND p.category = ?';
    params.push(category);
  }
  
  // Add price range filter if specified
  if (minPrice) {
    query += ' AND p.price >= ?';
    params.push(parseFloat(minPrice));
  }
  
  if (maxPrice) {
    query += ' AND p.price <= ?';
    params.push(parseFloat(maxPrice));
  }
  
  query += ' ORDER BY rank LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  const startTime = Date.now();
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Search error:', err);
      return res.status(500).json({ error: 'Search failed' });
    }
    
    const searchTime = Date.now() - startTime;
    
    res.json({
      results: rows,
      searchTime: `${searchTime}ms`,
      query: q,
      total: rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  });
});

// Auto-complete endpoint for fast suggestions
app.get('/api/autocomplete', searchLimiter, (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.json({ suggestions: [] });
  }
  
  // Set aggressive cache headers for autocomplete
  res.set('Cache-Control', 'public, max-age=600'); // 10 minutes cache
  
  const query = `
    SELECT DISTINCT name 
    FROM products 
    WHERE name LIKE ? 
    ORDER BY name 
    LIMIT 5
  `;
  
  db.all(query, [`%${q}%`], (err, rows) => {
    if (err) {
      console.error('Autocomplete error:', err);
      return res.status(500).json({ error: 'Autocomplete failed' });
    }
    
    res.json({
      suggestions: rows.map(row => row.name)
    });
  });
});

// Categories endpoint for filters
app.get('/api/categories', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
  
  db.all('SELECT DISTINCT category FROM products ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Categories error:', err);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
    
    res.json({
      categories: rows.map(row => row.category)
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Search server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test the search functionality`);
});
