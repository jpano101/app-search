/**
 * Enhanced validation middleware for search requests
 */

const validateSearchQuery = (req, res, next) => {
  const { q, page, size, sortBy, searchType } = req.query;
  const errors = [];

  // Validate query parameter
  if (q !== undefined) {
    if (typeof q !== 'string') {
      errors.push('Query parameter must be a string');
    } else if (q.length > 500) {
      errors.push('Query parameter cannot exceed 500 characters');
    }
  }

  // Validate pagination parameters
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page parameter must be a positive integer');
    } else if (pageNum > 1000) {
      errors.push('Page parameter cannot exceed 1000');
    }
  }

  if (size !== undefined) {
    const sizeNum = parseInt(size);
    if (isNaN(sizeNum) || sizeNum < 1) {
      errors.push('Size parameter must be a positive integer');
    } else if (sizeNum > 100) {
      errors.push('Size parameter cannot exceed 100');
    }
  }

  // Validate sort parameter
  if (sortBy !== undefined) {
    const validSortOptions = ['relevance', 'date_desc', 'date_asc', 'title'];
    if (!validSortOptions.includes(sortBy)) {
      errors.push(`Sort parameter must be one of: ${validSortOptions.join(', ')}`);
    }
  }

  // Validate search type parameter
  if (searchType !== undefined) {
    const validSearchTypes = ['standard', 'exact', 'fuzzy', 'strict'];
    if (!validSearchTypes.includes(searchType)) {
      errors.push(`Search type must be one of: ${validSearchTypes.join(', ')}`);
    }
  }

  // Validate filters parameter
  if (req.query.filters !== undefined) {
    try {
      const filters = typeof req.query.filters === 'string' 
        ? JSON.parse(req.query.filters) 
        : req.query.filters;
      
      if (typeof filters !== 'object' || Array.isArray(filters)) {
        errors.push('Filters parameter must be a valid JSON object');
      }
    } catch (error) {
      errors.push('Filters parameter must be valid JSON');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

/**
 * Rate limiting middleware for search requests
 */
const rateLimitSearch = (req, res, next) => {
  // This would typically use Redis or another store for rate limiting
  // For demo purposes, we'll just add headers
  res.set({
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': '99',
    'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString()
  });
  
  next();
};

/**
 * Security middleware to sanitize search inputs
 */
const sanitizeSearchInput = (req, res, next) => {
  if (req.query.q) {
    // Remove potentially dangerous characters
    req.query.q = req.query.q
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/[{}]/g, '') // Remove curly braces
      .trim();
  }

  next();
};

module.exports = {
  validateSearchQuery,
  rateLimitSearch,
  sanitizeSearchInput
};
