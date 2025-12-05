const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Hello endpoint
app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello, World!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Hello with name parameter
app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the App Search API',
    endpoints: {
      hello: '/hello',
      helloWithName: '/hello/:name'
    },
    status: 'running'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET /           - API information`);
  console.log(`   GET /hello      - Simple hello message`);
  console.log(`   GET /hello/:name - Personalized hello message`);
  console.log(`   GET /health     - Health check`);
});

module.exports = app;
