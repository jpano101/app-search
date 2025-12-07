const { getElasticsearchClient } = require('./elasticsearch');
const _ = require('lodash');

const INDEX_NAME = 'documents';

/**
 * Search documents with enhanced functionality
 */
async function searchDocuments({ 
  query, 
  page = 1, 
  size = 10, 
  filters = {}, 
  sortBy = 'relevance',
  includeAggregations = true,
  searchType = 'standard'
}) {
  const client = getElasticsearchClient();
  
  // Build Elasticsearch query with enhanced features
  const searchQuery = {
    index: INDEX_NAME,
    body: {
      from: (page - 1) * size,
      size,
      query: buildSearchQuery(query, filters, searchType),
      sort: buildSortQuery(sortBy),
      highlight: {
        fields: {
          title: { fragment_size: 150, number_of_fragments: 3 },
          content: { fragment_size: 200, number_of_fragments: 2 },
          description: { fragment_size: 100, number_of_fragments: 1 }
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        require_field_match: false
      },
      // Enhanced search features
      min_score: searchType === 'strict' ? 0.5 : 0.1,
      track_total_hits: true
    }
  };

  // Add aggregations only if requested (performance optimization)
  if (includeAggregations) {
    searchQuery.body.aggs = {
      categories: {
        terms: { field: 'category.keyword', size: 10 }
      },
      tags: {
        terms: { field: 'tags.keyword', size: 20 }
      },
      dateRange: {
        date_range: {
          field: 'created_at',
          ranges: [
            { key: 'last_week', from: 'now-7d/d' },
            { key: 'last_month', from: 'now-30d/d' },
            { key: 'last_year', from: 'now-365d/d' }
          ]
        }
      }
    };
  }

  try {
    const response = await client.search(searchQuery);
    
    return {
      hits: response.body.hits.hits.map(hit => ({
        id: hit._id,
        score: hit._score,
        source: hit._source,
        highlights: hit.highlight || {}
      })),
      total: response.body.hits.total.value,
      aggregations: response.body.aggregations,
      took: response.body.took
    };
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    throw new Error('Search operation failed');
  }
}

/**
 * Get search suggestions for auto-complete with enhanced options
 */
async function getSuggestions(query, options = {}) {
  const { limit = 10, includeCategories = false } = options;
  const client = getElasticsearchClient();
  
  try {
    const response = await client.search({
      index: INDEX_NAME,
      body: {
        size: 0,
        suggest: {
          title_suggest: {
            prefix: query,
            completion: {
              field: 'title_suggest',
              size: 10
            }
          },
          content_suggest: {
            text: query,
            term: {
              field: 'content',
              size: 5
            }
          }
        }
      }
    });

    const suggestions = [];
    
    // Process completion suggestions
    if (response.body.suggest.title_suggest) {
      response.body.suggest.title_suggest.forEach(suggest => {
        suggest.options.forEach(option => {
          suggestions.push({
            text: option.text,
            score: option._score,
            type: 'completion'
          });
        });
      });
    }

    // Process term suggestions
    if (response.body.suggest.content_suggest) {
      response.body.suggest.content_suggest.forEach(suggest => {
        suggest.options.forEach(option => {
          suggestions.push({
            text: option.text,
            score: option.score,
            type: 'term'
          });
        });
      });
    }

    return _.uniqBy(suggestions, 'text').slice(0, 10);
  } catch (error) {
    console.error('Suggestions error:', error);
    return [];
  }
}

/**
 * Build Elasticsearch query based on search parameters with enhanced search types
 */
function buildSearchQuery(query, filters, searchType = 'standard') {
  const must = [];
  const filter = [];

  // Enhanced search query based on search type
  if (query && query.trim()) {
    const trimmedQuery = query.trim();
    
    switch (searchType) {
      case 'exact':
        must.push({
          multi_match: {
            query: trimmedQuery,
            fields: ['title^3', 'description^2', 'content', 'tags^1.5'],
            type: 'phrase'
          }
        });
        break;
        
      case 'fuzzy':
        must.push({
          multi_match: {
            query: trimmedQuery,
            fields: ['title^3', 'description^2', 'content', 'tags^1.5'],
            type: 'best_fields',
            fuzziness: '2',
            prefix_length: 1
          }
        });
        break;
        
      case 'strict':
        must.push({
          bool: {
            should: [
              {
                multi_match: {
                  query: trimmedQuery,
                  fields: ['title^5'],
                  type: 'phrase_prefix',
                  boost: 3
                }
              },
              {
                multi_match: {
                  query: trimmedQuery,
                  fields: ['description^3', 'content^1', 'tags^2'],
                  type: 'best_fields',
                  fuzziness: 'AUTO'
                }
              }
            ],
            minimum_should_match: 1
          }
        });
        break;
        
      case 'standard':
      default:
        must.push({
          multi_match: {
            query: trimmedQuery,
            fields: ['title^3', 'description^2', 'content', 'tags^1.5'],
            type: 'best_fields',
            fuzziness: 'AUTO',
            operator: 'or'
          }
        });
        break;
    }
  } else {
    must.push({ match_all: {} });
  }

  // Apply filters
  Object.entries(filters).forEach(([field, value]) => {
    if (value && value !== '') {
      if (Array.isArray(value)) {
        filter.push({ terms: { [`${field}.keyword`]: value } });
      } else {
        filter.push({ term: { [`${field}.keyword`]: value } });
      }
    }
  });

  return {
    bool: {
      must,
      filter
    }
  };
}

/**
 * Build sort query based on sort parameter
 */
function buildSortQuery(sortBy) {
  switch (sortBy) {
    case 'date_desc':
      return [{ created_at: { order: 'desc' } }];
    case 'date_asc':
      return [{ created_at: { order: 'asc' } }];
    case 'title':
      return [{ 'title.keyword': { order: 'asc' } }];
    case 'relevance':
    default:
      return ['_score'];
  }
}

module.exports = {
  searchDocuments,
  getSuggestions
};
