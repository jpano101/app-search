const express = require('express');
const { searchDocuments, getSuggestions } = require('../services/searchService');
const { validateSearchQuery } = require('../middleware/validation');

const router = express.Router();

// Enhanced search endpoint with improved functionality
router.get('/', validateSearchQuery, async (req, res) => {
  try {
    const { 
      q, 
      page = 1, 
      size = 10, 
      filters = {}, 
      sortBy = 'relevance',
      includeAggregations = true,
      searchType = 'standard'
    } = req.query;
    
    const results = await searchDocuments({
      query: q,
      page: parseInt(page),
      size: parseInt(size),
      filters: typeof filters === 'string' ? JSON.parse(filters) : filters,
      sortBy,
      includeAggregations: includeAggregations === 'true',
      searchType
    });

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        total: results.total,
        totalPages: Math.ceil(results.total / parseInt(size))
      },
      searchMetadata: {
        query: q,
        took: results.took,
        searchType,
        sortBy
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during search'
    });
  }
});

// Enhanced auto-complete suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 10, includeCategories = false } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    const suggestions = await getSuggestions(q, {
      limit: parseInt(limit),
      includeCategories: includeCategories === 'true'
    });
    
    res.json({
      success: true,
      suggestions,
      query: q,
      count: suggestions.length
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during suggestions'
    });
  }
});

// New endpoint for search analytics
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // This would typically connect to an analytics service
    const analytics = {
      topQueries: [
        { query: 'javascript', count: 245 },
        { query: 'react', count: 189 },
        { query: 'nodejs', count: 156 }
      ],
      searchVolume: {
        timeframe,
        totalSearches: 1250,
        uniqueQueries: 890
      },
      popularFilters: [
        { filter: 'category:tutorial', usage: 45 },
        { filter: 'tags:beginner', usage: 38 }
      ]
    };
    
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during analytics retrieval'
    });
  }
});

module.exports = router;
