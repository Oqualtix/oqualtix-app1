/**
 * Intelligent Caching System
 * Advanced caching with AI-driven optimization and predictive pre-loading
 */

class IntelligentCache {
  constructor() {
    this.cache = new Map();
    this.accessPatterns = new Map();
    this.hitCount = 0;
    this.missCount = 0;
    this.maxSize = 10000; // Maximum cache entries
    this.ttl = 3600000; // 1 hour default TTL
    
    // AI-driven caching parameters
    this.accessPredictions = new Map();
    this.usageFrequency = new Map();
    this.temporalPatterns = new Map();
    
    console.log('🧠 Intelligent Cache System initialized');
    this.startCacheOptimization();
  }

  // Set cache entry with intelligent optimization
  set(key, value, options = {}) {
    const {
      ttl = this.ttl,
      priority = 'normal',
      tags = [],
      autoRefresh = false
    } = options;

    const cacheEntry = {
      key: key,
      value: value,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      priority: priority,
      tags: tags,
      autoRefresh: autoRefresh,
      accessCount: 0,
      lastAccessed: Date.now(),
      size: this.estimateSize(value)
    };

    // Check cache size limits
    if (this.cache.size >= this.maxSize) {
      this.evictLeastValuable();
    }

    this.cache.set(key, cacheEntry);
    this.updateAccessPattern(key, 'set');
    
    console.log(`📦 Cached: ${key} (TTL: ${ttl}ms, Priority: ${priority})`);
    return true;
  }

  // Get cache entry with learning
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      this.updateAccessPattern(key, 'miss');
      return null;
    }

    // Check expiry
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.missCount++;
      this.updateAccessPattern(key, 'expired');
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hitCount++;
    this.updateAccessPattern(key, 'hit');

    // Learn from access pattern
    this.learnAccessPattern(key);

    console.log(`✅ Cache hit: ${key} (${entry.accessCount} accesses)`);
    return entry.value;
  }

  // Intelligent cache eviction
  evictLeastValuable() {
    let leastValuable = null;
    let lowestScore = Infinity;

    for (const [key, entry] of this.cache) {
      const score = this.calculateValueScore(entry);
      if (score < lowestScore) {
        lowestScore = score;
        leastValuable = key;
      }
    }

    if (leastValuable) {
      this.cache.delete(leastValuable);
      console.log(`🗑️ Evicted: ${leastValuable} (score: ${lowestScore.toFixed(2)})`);
    }
  }

  // Calculate cache entry value score
  calculateValueScore(entry) {
    const now = Date.now();
    const age = (now - entry.timestamp) / 1000; // Age in seconds
    const timeSinceAccess = (now - entry.lastAccessed) / 1000;
    
    // Base score factors
    const accessFrequency = entry.accessCount / (age / 3600); // Accesses per hour
    const recency = Math.max(0, 1 - (timeSinceAccess / 3600)); // Recency factor
    const priorityMultiplier = this.getPriorityMultiplier(entry.priority);
    const sizepenalty = Math.log(entry.size || 1) / 10; // Larger items get lower scores
    
    // Predictive factors
    const predictedAccess = this.predictFutureAccess(entry.key);
    
    const score = (accessFrequency * 0.3) + 
                  (recency * 0.2) + 
                  (priorityMultiplier * 0.2) + 
                  (predictedAccess * 0.3) - 
                  sizepenalty;

    return Math.max(0, score);
  }

  // Get priority multiplier
  getPriorityMultiplier(priority) {
    switch (priority) {
      case 'critical': return 3.0;
      case 'high': return 2.0;
      case 'normal': return 1.0;
      case 'low': return 0.5;
      default: return 1.0;
    }
  }

  // Predict future access probability
  predictFutureAccess(key) {
    const pattern = this.accessPatterns.get(key);
    if (!pattern) return 0.1; // Default low probability

    const recentAccesses = pattern.accesses.slice(-10); // Last 10 accesses
    if (recentAccesses.length === 0) return 0.1;

    // Analyze temporal patterns
    const intervals = [];
    for (let i = 1; i < recentAccesses.length; i++) {
      intervals.push(recentAccesses[i] - recentAccesses[i-1]);
    }

    if (intervals.length === 0) return 0.1;

    // Calculate average interval and predict next access
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const lastAccess = recentAccesses[recentAccesses.length - 1];
    const timeSinceLastAccess = Date.now() - lastAccess;
    
    // Probability based on expected next access time
    const expectedNextAccess = lastAccess + avgInterval;
    const timeDiff = Math.abs(Date.now() - expectedNextAccess);
    const probability = Math.max(0, 1 - (timeDiff / avgInterval));

    return probability;
  }

  // Update access patterns for learning
  updateAccessPattern(key, action) {
    let pattern = this.accessPatterns.get(key);
    
    if (!pattern) {
      pattern = {
        key: key,
        accesses: [],
        hits: 0,
        misses: 0,
        sets: 0,
        totalRequests: 0
      };
      this.accessPatterns.set(key, pattern);
    }

    pattern.totalRequests++;
    
    switch (action) {
      case 'hit':
        pattern.hits++;
        pattern.accesses.push(Date.now());
        break;
      case 'miss':
        pattern.misses++;
        break;
      case 'set':
        pattern.sets++;
        break;
      case 'expired':
        pattern.misses++;
        break;
    }

    // Keep only recent accesses (last 100)
    if (pattern.accesses.length > 100) {
      pattern.accesses = pattern.accesses.slice(-100);
    }
  }

  // Learn from access patterns
  learnAccessPattern(key) {
    const pattern = this.accessPatterns.get(key);
    if (!pattern || pattern.accesses.length < 3) return;

    // Update usage frequency
    const frequency = pattern.accesses.length / ((Date.now() - pattern.accesses[0]) / 3600000); // Per hour
    this.usageFrequency.set(key, frequency);

    // Analyze temporal patterns
    this.analyzeTemporalPattern(key, pattern.accesses);
  }

  // Analyze temporal patterns in cache access
  analyzeTemporalPattern(key, accesses) {
    if (accesses.length < 5) return;

    const intervals = [];
    for (let i = 1; i < accesses.length; i++) {
      intervals.push(accesses[i] - accesses[i-1]);
    }

    // Detect patterns
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    const pattern = {
      avgInterval: avgInterval,
      variance: variance,
      regularity: stdDev / avgInterval, // Lower is more regular
      isRegular: (stdDev / avgInterval) < 0.3,
      lastAnalyzed: Date.now()
    };

    this.temporalPatterns.set(key, pattern);
  }

  // Predictive pre-loading
  async predictivePreload() {
    console.log('🔮 Running predictive pre-loading...');
    
    const predictions = [];
    
    for (const [key, pattern] of this.accessPatterns) {
      const prediction = this.predictFutureAccess(key);
      
      if (prediction > 0.7 && !this.cache.has(key)) {
        predictions.push({
          key: key,
          probability: prediction,
          pattern: pattern
        });
      }
    }

    // Sort by prediction probability
    predictions.sort((a, b) => b.probability - a.probability);

    console.log(`🎯 Found ${predictions.length} preload candidates`);
    
    // Preload top predictions (limit to prevent overload)
    const preloadLimit = Math.min(5, predictions.length);
    for (let i = 0; i < preloadLimit; i++) {
      const prediction = predictions[i];
      await this.preloadData(prediction.key, prediction.probability);
    }
  }

  // Preload data for predicted access
  async preloadData(key, probability) {
    console.log(`📥 Preloading ${key} (probability: ${(probability * 100).toFixed(1)}%)`);
    
    // This would typically fetch data from the source
    // For demo, we'll simulate data loading
    const simulatedData = `Preloaded data for ${key}`;
    
    this.set(key, simulatedData, {
      ttl: this.ttl * 0.5, // Shorter TTL for preloaded data
      priority: 'low',
      tags: ['preloaded']
    });
  }

  // Cache statistics and optimization
  getStatistics() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) : 0;
    
    return {
      entries: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize * 100).toFixed(1) + '%',
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: (hitRate * 100).toFixed(1) + '%',
      totalMemoryEstimate: this.estimateTotalMemory(),
      accessPatterns: this.accessPatterns.size,
      temporalPatterns: this.temporalPatterns.size
    };
  }

  // Estimate memory usage
  estimateTotalMemory() {
    let totalSize = 0;
    for (const [, entry] of this.cache) {
      totalSize += entry.size || 0;
    }
    return this.formatBytes(totalSize);
  }

  // Estimate size of cache entry
  estimateSize(value) {
    if (typeof value === 'string') {
      return value.length * 2; // Approximate UTF-16 encoding
    } else if (typeof value === 'object') {
      return JSON.stringify(value).length * 2;
    } else {
      return 64; // Default size for primitives
    }
  }

  // Format bytes for display
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Start cache optimization process
  startCacheOptimization() {
    // Run optimization every 5 minutes
    setInterval(() => {
      this.optimizeCache();
    }, 300000);

    // Run predictive preloading every 10 minutes
    setInterval(() => {
      this.predictivePreload();
    }, 600000);
  }

  // Comprehensive cache optimization
  async optimizeCache() {
    console.log('⚡ Optimizing cache...');
    
    const startTime = Date.now();
    let optimizations = 0;

    // Remove expired entries
    for (const [key, entry] of this.cache) {
      if (Date.now() > entry.expiry) {
        this.cache.delete(key);
        optimizations++;
      }
    }

    // Optimize based on access patterns
    for (const [key, pattern] of this.accessPatterns) {
      if (pattern.totalRequests > 10 && pattern.hits / pattern.totalRequests < 0.1) {
        // Low hit rate - consider removing or reducing TTL
        const entry = this.cache.get(key);
        if (entry && entry.priority === 'normal') {
          entry.priority = 'low';
          optimizations++;
        }
      }
    }

    // Refresh auto-refresh entries
    for (const [key, entry] of this.cache) {
      if (entry.autoRefresh && (Date.now() > entry.expiry - (entry.ttl * 0.1))) {
        // Refresh before expiry
        await this.refreshEntry(key);
        optimizations++;
      }
    }

    const optimizationTime = Date.now() - startTime;
    console.log(`✅ Cache optimization complete: ${optimizations} optimizations in ${optimizationTime}ms`);
  }

  // Refresh cache entry
  async refreshEntry(key) {
    console.log(`🔄 Refreshing cache entry: ${key}`);
    
    // In a real implementation, this would fetch fresh data
    const refreshedData = `Refreshed data for ${key} at ${new Date().toISOString()}`;
    
    const oldEntry = this.cache.get(key);
    if (oldEntry) {
      this.set(key, refreshedData, {
        ttl: oldEntry.ttl,
        priority: oldEntry.priority,
        tags: oldEntry.tags,
        autoRefresh: oldEntry.autoRefresh
      });
    }
  }

  // Clear cache with options
  clear(options = {}) {
    const { tags = [], pattern = null, olderThan = null } = options;
    
    let cleared = 0;
    
    for (const [key, entry] of this.cache) {
      let shouldClear = false;
      
      // Clear by tags
      if (tags.length > 0 && entry.tags.some(tag => tags.includes(tag))) {
        shouldClear = true;
      }
      
      // Clear by pattern
      if (pattern && key.includes(pattern)) {
        shouldClear = true;
      }
      
      // Clear by age
      if (olderThan && (Date.now() - entry.timestamp) > olderThan) {
        shouldClear = true;
      }
      
      // Clear all if no specific criteria
      if (tags.length === 0 && !pattern && !olderThan) {
        shouldClear = true;
      }
      
      if (shouldClear) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    console.log(`🗑️ Cleared ${cleared} cache entries`);
    return cleared;
  }

  // Display cache dashboard
  displayDashboard() {
    const stats = this.getStatistics();
    
    console.log('\n💾 INTELLIGENT CACHE DASHBOARD');
    console.log('=' * 35);
    console.log(`📊 Entries: ${stats.entries}/${stats.maxSize} (${stats.utilization})`);
    console.log(`🎯 Hit Rate: ${stats.hitRate}`);
    console.log(`📈 Hits: ${stats.hitCount.toLocaleString()}`);
    console.log(`📉 Misses: ${stats.missCount.toLocaleString()}`);
    console.log(`💾 Memory: ${stats.totalMemoryEstimate}`);
    console.log(`🔍 Access Patterns: ${stats.accessPatterns}`);
    console.log(`⏰ Temporal Patterns: ${stats.temporalPatterns}`);
    
    // Show top accessed items
    const topItems = Array.from(this.cache.entries())
      .sort((a, b) => b[1].accessCount - a[1].accessCount)
      .slice(0, 5);
    
    if (topItems.length > 0) {
      console.log('\n🔝 Top Accessed Items:');
      topItems.forEach(([key, entry], index) => {
        console.log(`   ${index + 1}. ${key} (${entry.accessCount} accesses)`);
      });
    }
  }
}

export default IntelligentCache;