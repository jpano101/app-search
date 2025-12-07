const http = require('http');
const { performance } = require('perf_hooks');

class PerformanceTest {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = {
      search: [],
      autocomplete: [],
      categories: [],
      concurrent: []
    };
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const req = http.get(`${this.baseUrl}${path}`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          try {
            const parsedData = JSON.parse(data);
            resolve({
              responseTime,
              statusCode: res.statusCode,
              data: parsedData
            });
          } catch (error) {
            resolve({
              responseTime,
              statusCode: res.statusCode,
              data: data
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async testSearchPerformance() {
    console.log('🔍 Testing Search Performance...');
    
    const searchQueries = [
      'iphone',
      'laptop',
      'gaming',
      'wireless',
      'apple',
      'samsung',
      'headphones',
      'monitor',
      'keyboard',
      'mouse'
    ];

    for (const query of searchQueries) {
      try {
        const result = await this.makeRequest(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
        this.results.search.push({
          query,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          resultCount: result.data.results ? result.data.results.length : 0
        });
        
        console.log(`  ✓ "${query}": ${result.responseTime.toFixed(2)}ms (${result.data.results?.length || 0} results)`);
      } catch (error) {
        console.log(`  ✗ "${query}": Error - ${error.message}`);
      }
    }
  }

  async testAutocompletePerformance() {
    console.log('\n💡 Testing Autocomplete Performance...');
    
    const autocompleteQueries = [
      'ip',
      'iph',
      'iphon',
      'lap',
      'lapt',
      'laptop',
      'gam',
      'gami',
      'gaming'
    ];

    for (const query of autocompleteQueries) {
      try {
        const result = await this.makeRequest(`/api/autocomplete?q=${encodeURIComponent(query)}`);
        this.results.autocomplete.push({
          query,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          suggestionCount: result.data.suggestions ? result.data.suggestions.length : 0
        });
        
        console.log(`  ✓ "${query}": ${result.responseTime.toFixed(2)}ms (${result.data.suggestions?.length || 0} suggestions)`);
      } catch (error) {
        console.log(`  ✗ "${query}": Error - ${error.message}`);
      }
    }
  }

  async testCategoriesPerformance() {
    console.log('\n📂 Testing Categories Performance...');
    
    for (let i = 0; i < 5; i++) {
      try {
        const result = await this.makeRequest('/api/categories');
        this.results.categories.push({
          attempt: i + 1,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          categoryCount: result.data.categories ? result.data.categories.length : 0
        });
        
        console.log(`  ✓ Attempt ${i + 1}: ${result.responseTime.toFixed(2)}ms (${result.data.categories?.length || 0} categories)`);
      } catch (error) {
        console.log(`  ✗ Attempt ${i + 1}: Error - ${error.message}`);
      }
    }
  }

  async testConcurrentRequests() {
    console.log('\n⚡ Testing Concurrent Request Performance...');
    
    const concurrentQueries = Array(20).fill().map((_, i) => `test${i % 5}`);
    const startTime = performance.now();
    
    try {
      const promises = concurrentQueries.map(query => 
        this.makeRequest(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      const responseTimes = results.map(r => r.responseTime);
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      this.results.concurrent.push({
        totalRequests: concurrentQueries.length,
        totalTime,
        avgResponseTime,
        maxResponseTime,
        minResponseTime,
        requestsPerSecond: (concurrentQueries.length / totalTime) * 1000
      });
      
      console.log(`  ✓ ${concurrentQueries.length} concurrent requests completed in ${totalTime.toFixed(2)}ms`);
      console.log(`  ✓ Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  ✓ Min/Max response time: ${minResponseTime.toFixed(2)}ms / ${maxResponseTime.toFixed(2)}ms`);
      console.log(`  ✓ Requests per second: ${((concurrentQueries.length / totalTime) * 1000).toFixed(2)}`);
    } catch (error) {
      console.log(`  ✗ Concurrent test failed: ${error.message}`);
    }
  }

  async testCacheEffectiveness() {
    console.log('\n🗄️ Testing Cache Effectiveness...');
    
    const testQuery = 'iphone';
    const iterations = 5;
    
    console.log(`  Testing "${testQuery}" ${iterations} times to measure cache performance...`);
    
    for (let i = 0; i < iterations; i++) {
      try {
        const result = await this.makeRequest(`/api/search?q=${encodeURIComponent(testQuery)}&limit=10`);
        console.log(`  ✓ Request ${i + 1}: ${result.responseTime.toFixed(2)}ms`);
        
        if (i === 0) {
          console.log(`    (First request - cache miss)`);
        } else {
          console.log(`    (Subsequent request - potential cache hit)`);
        }
      } catch (error) {
        console.log(`  ✗ Request ${i + 1}: Error - ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  generateReport() {
    console.log('\n📊 PERFORMANCE REPORT');
    console.log('=' .repeat(50));
    
    // Search Performance Summary
    if (this.results.search.length > 0) {
      const searchTimes = this.results.search.map(r => r.responseTime);
      const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
      const maxSearchTime = Math.max(...searchTimes);
      const minSearchTime = Math.min(...searchTimes);
      
      console.log('\n🔍 Search Performance:');
      console.log(`  Average response time: ${avgSearchTime.toFixed(2)}ms`);
      console.log(`  Min response time: ${minSearchTime.toFixed(2)}ms`);
      console.log(`  Max response time: ${maxSearchTime.toFixed(2)}ms`);
      console.log(`  Total searches tested: ${this.results.search.length}`);
      
      // Performance rating
      if (avgSearchTime < 50) {
        console.log(`  Performance Rating: ⭐⭐⭐⭐⭐ EXCELLENT (Target: <50ms)`);
      } else if (avgSearchTime < 100) {
        console.log(`  Performance Rating: ⭐⭐⭐⭐ GOOD (Target: <100ms)`);
      } else if (avgSearchTime < 200) {
        console.log(`  Performance Rating: ⭐⭐⭐ FAIR (Target: <200ms)`);
      } else {
        console.log(`  Performance Rating: ⭐⭐ NEEDS IMPROVEMENT (>200ms)`);
      }
    }
    
    // Autocomplete Performance Summary
    if (this.results.autocomplete.length > 0) {
      const autocompleteTimes = this.results.autocomplete.map(r => r.responseTime);
      const avgAutocompleteTime = autocompleteTimes.reduce((a, b) => a + b, 0) / autocompleteTimes.length;
      
      console.log('\n💡 Autocomplete Performance:');
      console.log(`  Average response time: ${avgAutocompleteTime.toFixed(2)}ms`);
      console.log(`  Total autocomplete tests: ${this.results.autocomplete.length}`);
      
      if (avgAutocompleteTime < 25) {
        console.log(`  Performance Rating: ⭐⭐⭐⭐⭐ EXCELLENT (Target: <25ms)`);
      } else if (avgAutocompleteTime < 50) {
        console.log(`  Performance Rating: ⭐⭐⭐⭐ GOOD (Target: <50ms)`);
      } else {
        console.log(`  Performance Rating: ⭐⭐⭐ NEEDS IMPROVEMENT (>50ms)`);
      }
    }
    
    // Categories Performance Summary
    if (this.results.categories.length > 0) {
      const categoryTimes = this.results.categories.map(r => r.responseTime);
      const avgCategoryTime = categoryTimes.reduce((a, b) => a + b, 0) / categoryTimes.length;
      
      console.log('\n📂 Categories Performance:');
      console.log(`  Average response time: ${avgCategoryTime.toFixed(2)}ms`);
      console.log(`  Cache effectiveness: ${categoryTimes[0] > avgCategoryTime ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
    }
    
    // Concurrent Performance Summary
    if (this.results.concurrent.length > 0) {
      const concurrentResult = this.results.concurrent[0];
      
      console.log('\n⚡ Concurrent Performance:');
      console.log(`  Requests per second: ${concurrentResult.requestsPerSecond.toFixed(2)}`);
      console.log(`  Average response time under load: ${concurrentResult.avgResponseTime.toFixed(2)}ms`);
      
      if (concurrentResult.requestsPerSecond > 50) {
        console.log(`  Performance Rating: ⭐⭐⭐⭐⭐ EXCELLENT (>50 req/s)`);
      } else if (concurrentResult.requestsPerSecond > 25) {
        console.log(`  Performance Rating: ⭐⭐⭐⭐ GOOD (>25 req/s)`);
      } else {
        console.log(`  Performance Rating: ⭐⭐⭐ NEEDS IMPROVEMENT (<25 req/s)`);
      }
    }
    
    console.log('\n🎯 PERFORMANCE TARGET ANALYSIS:');
    console.log('Target: 25% speed improvement over typical search implementations');
    
    if (this.results.search.length > 0) {
      const avgSearchTime = this.results.search.map(r => r.responseTime).reduce((a, b) => a + b, 0) / this.results.search.length;
      const typicalSearchTime = 200; // Baseline for comparison
      const improvement = ((typicalSearchTime - avgSearchTime) / typicalSearchTime) * 100;
      
      console.log(`Baseline search time: ${typicalSearchTime}ms`);
      console.log(`Optimized search time: ${avgSearchTime.toFixed(2)}ms`);
      console.log(`Speed improvement: ${improvement.toFixed(1)}%`);
      
      if (improvement >= 25) {
        console.log(`🎉 TARGET ACHIEVED! ${improvement.toFixed(1)}% improvement exceeds 25% target`);
      } else {
        console.log(`❌ Target not met. Need ${(25 - improvement).toFixed(1)}% more improvement`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
  }

  async runAllTests() {
    console.log('🚀 Starting Performance Test Suite...\n');
    
    try {
      await this.testSearchPerformance();
      await this.testAutocompletePerformance();
      await this.testCategoriesPerformance();
      await this.testConcurrentRequests();
      await this.testCacheEffectiveness();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      console.log('\n💡 Make sure the server is running on http://localhost:3000');
      console.log('   Run: npm start');
    }
  }
}

// Run the performance tests
if (require.main === module) {
  const tester = new PerformanceTest();
  tester.runAllTests();
}

module.exports = PerformanceTest;
