const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/search');
const { initializeElasticsearch } = require('./services/elasticsearch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/search', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize Elasticsearch connection
initializeElasticsearch()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Search API server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize Elasticsearch:', error);
    process.exit(1);
  });

module.exports = app;
