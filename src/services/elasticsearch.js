const { Client } = require('@elastic/elasticsearch');

let client = null;

/**
 * Initialize Elasticsearch client with enhanced configuration
 */
async function initializeElasticsearch() {
  try {
    client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
      },
      requestTimeout: 30000,
      pingTimeout: 3000,
      maxRetries: 3,
      resurrectStrategy: 'ping'
    });

    // Test connection
    await client.ping();
    console.log('✅ Elasticsearch connection established');

    // Ensure index exists with proper mapping
    await ensureIndexExists();
    
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to Elasticsearch:', error.message);
    throw error;
  }
}

/**
 * Get the Elasticsearch client instance
 */
function getElasticsearchClient() {
  if (!client) {
    throw new Error('Elasticsearch client not initialized. Call initializeElasticsearch() first.');
  }
  return client;
}

/**
 * Ensure the documents index exists with proper mapping
 */
async function ensureIndexExists() {
  const indexName = 'documents';
  
  try {
    const exists = await client.indices.exists({ index: indexName });
    
    if (!exists.body) {
      console.log(`Creating index: ${indexName}`);
      
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                custom_text_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball']
                }
              }
            }
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'custom_text_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                  suggest: {
                    type: 'completion',
                    analyzer: 'simple'
                  }
                }
              },
              description: {
                type: 'text',
                analyzer: 'custom_text_analyzer'
              },
              content: {
                type: 'text',
                analyzer: 'custom_text_analyzer'
              },
              category: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              tags: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              created_at: {
                type: 'date'
              },
              updated_at: {
                type: 'date'
              },
              author: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              status: {
                type: 'keyword'
              }
            }
          }
        }
      });
      
      console.log(`✅ Index ${indexName} created successfully`);
    } else {
      console.log(`✅ Index ${indexName} already exists`);
    }
  } catch (error) {
    console.error(`❌ Error ensuring index exists:`, error.message);
    throw error;
  }
}

/**
 * Close Elasticsearch connection
 */
async function closeElasticsearch() {
  if (client) {
    await client.close();
    client = null;
    console.log('Elasticsearch connection closed');
  }
}

module.exports = {
  initializeElasticsearch,
  getElasticsearchClient,
  ensureIndexExists,
  closeElasticsearch
};
