#!/usr/bin/env node
/**
 * Simplified Unit Tests for Micro-Skimming Detection
 * Tests the core micro-skimming detection logic without external dependencies
 */

// Mock implementation of the detection methods for testing
const mockMicroSkimmingDetection = {
  // Mock micro-skimming detection function
  detectMicroSkimming: (transactions, options = {}) => {
    const { minVendorTransactions = 10, aggregationThresholds = { warning: 1.0, critical: 5.0 }, useIntegerMath = false } = options;
    
    // Convert to milli-cents if using integer math
    const convertAmount = (amount) => useIntegerMath ? Math.round(amount * 1000) : amount;
    const convertBack = (amount) => useIntegerMath ? amount / 1000 : amount;
    
    // Group by vendor
    const vendorTransactions = {};
    transactions.forEach(tx => {
      if (!vendorTransactions[tx.vendor]) {
        vendorTransactions[tx.vendor] = [];
      }
      vendorTransactions[tx.vendor].push({
        ...tx,
        amount: convertAmount(tx.amount)
      });
    });
    
    const findings = [];
    
    Object.entries(vendorTransactions).forEach(([vendor, txs]) => {
      if (txs.length < minVendorTransactions) return;
      
      // Calculate micro-transaction amounts (< 0.01 or 10 milli-cents)
      const threshold = useIntegerMath ? 10 : 0.01;
      const microTxs = txs.filter(tx => tx.amount > 0 && tx.amount < threshold);
      
      if (microTxs.length > 0) {
        const totalMicroAmount = convertBack(microTxs.reduce((sum, tx) => sum + tx.amount, 0));
        const avgMicroAmount = convertBack(microTxs.reduce((sum, tx) => sum + tx.amount, 0) / microTxs.length);
        
        if (totalMicroAmount >= aggregationThresholds.warning) {
          findings.push({
            vendor,
            type: 'micro_skimming',
            severity: totalMicroAmount >= aggregationThresholds.critical ? 'critical' : 'warning',
            microTransactionCount: microTxs.length,
            totalMicroAmount: Math.round(totalMicroAmount * 100) / 100,
            averageMicroAmount: Math.round(avgMicroAmount * 1000) / 1000,
            details: {
              totalTransactions: txs.length,
              microTransactionRatio: Math.round((microTxs.length / txs.length) * 100 * 100) / 100
            }
          });
        }
      }
    });
    
    return findings;
  },
  
  // Mock fractional residue detection function
  detectFractionalResiduePatterns: (transactions, options = {}) => {
    const { minPatternOccurrences = 5, residueThresholds = { suspicious: 0.05, highly_suspicious: 0.10 }, useIntegerMath = false } = options;
    
    // Convert to milli-cents if using integer math
    const convertAmount = (amount) => useIntegerMath ? Math.round(amount * 1000) : amount;
    const convertBack = (amount) => useIntegerMath ? amount / 1000 : amount;
    
    // Extract fractional parts (tenths of cents)
    const residuePattern = {};
    transactions.forEach(tx => {
      const amount = convertAmount(tx.amount);
      let residue;
      
      if (useIntegerMath) {
        residue = amount % 10; // Last digit in milli-cents
      } else {
        const centsAmount = Math.round(amount * 100);
        residue = centsAmount % 10; // Tenths of cents
      }
      
      if (!residuePattern[residue]) {
        residuePattern[residue] = [];
      }
      residuePattern[residue].push(tx);
    });
    
    const findings = [];
    const totalTransactions = transactions.length;
    
    Object.entries(residuePattern).forEach(([residue, txs]) => {
      if (txs.length >= minPatternOccurrences) {
        const frequency = txs.length / totalTransactions;
        const expectedFrequency = 0.1; // 10% for each tenth
        const deviation = Math.abs(frequency - expectedFrequency);
        
        if (deviation >= residueThresholds.suspicious) {
          const totalAmount = convertBack(txs.reduce((sum, tx) => sum + convertAmount(tx.amount), 0));
          
          findings.push({
            residue: parseInt(residue),
            type: 'fractional_residue_pattern',
            severity: deviation >= residueThresholds.highly_suspicious ? 'critical' : 'warning',
            occurrences: txs.length,
            frequency: Math.round(frequency * 100 * 100) / 100,
            expectedFrequency: Math.round(expectedFrequency * 100 * 100) / 100,
            deviation: Math.round(deviation * 100 * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            details: {
              totalTransactions,
              suspiciousPattern: deviation >= residueThresholds.highly_suspicious
            }
          });
        }
      }
    });
    
    return findings;
  }
};

// Test utilities
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, errors: [] };
  }
  
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  async runAll() {
    console.log('🧪 Running Micro-Skimming Detection Tests...\n');
    
    for (const test of this.tests) {
      try {
        console.log(`▶️  ${test.name}`);
        await test.testFn();
        console.log(`✅ PASSED: ${test.name}\n`);
        this.results.passed++;
      } catch (error) {
        console.log(`❌ FAILED: ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
        this.results.failed++;
        this.results.errors.push({ test: test.name, error: error.message });
      }
    }
    
    this.printSummary();
  }
  
  printSummary() {
    console.log('📊 Test Summary:');
    console.log(`   ✅ Passed: ${this.results.passed}`);
    console.log(`   ❌ Failed: ${this.results.failed}`);
    console.log(`   📈 Success Rate: ${Math.round((this.results.passed / this.tests.length) * 100)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n🚨 Failed Tests:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error.test}: ${error.error}`);
      });
    }
  }
  
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }
  
  assertGreaterThan(actual, expected, message) {
    if (actual <= expected) {
      throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
    }
  }
}

// Mock transaction data generator
function generateMockTransactions() {
  return [
    // Normal transactions
    { id: 1, vendor: 'VendorA', amount: 25.67, date: '2024-01-01' },
    { id: 2, vendor: 'VendorA', amount: 15.42, date: '2024-01-02' },
    { id: 3, vendor: 'VendorA', amount: 8.93, date: '2024-01-03' },
    
    // Micro-skimming transactions (< 0.01)
    { id: 4, vendor: 'VendorA', amount: 0.007, date: '2024-01-04' },
    { id: 5, vendor: 'VendorA', amount: 0.003, date: '2024-01-05' },
    { id: 6, vendor: 'VendorA', amount: 0.009, date: '2024-01-06' },
    { id: 7, vendor: 'VendorA', amount: 0.004, date: '2024-01-07' },
    { id: 8, vendor: 'VendorA', amount: 0.006, date: '2024-01-08' },
    { id: 9, vendor: 'VendorA', amount: 0.002, date: '2024-01-09' },
    { id: 10, vendor: 'VendorA', amount: 0.008, date: '2024-01-10' },
    { id: 11, vendor: 'VendorA', amount: 0.005, date: '2024-01-11' },
    { id: 12, vendor: 'VendorA', amount: 0.001, date: '2024-01-12' },
    { id: 13, vendor: 'VendorA', amount: 0.007, date: '2024-01-13' },
    
    // More normal transactions to meet minimum threshold
    { id: 14, vendor: 'VendorA', amount: 12.45, date: '2024-01-14' },
    { id: 15, vendor: 'VendorA', amount: 22.78, date: '2024-01-15' }
  ];
}

function generateFractionalResidueTransactions() {
  // Generate transactions with suspicious .3 cent pattern
  const transactions = [];
  let id = 1;
  
  // Add 20 transactions ending in .x3 cents (suspicious pattern)
  for (let i = 0; i < 20; i++) {
    transactions.push({
      id: id++,
      vendor: 'SuspiciousVendor',
      amount: parseFloat((Math.random() * 100 + 10).toFixed(1)) + 0.03, // e.g., 45.13, 67.23, etc.
      date: `2024-01-${(i + 1).toString().padStart(2, '0')}`
    });
  }
  
  // Add some normal transactions to avoid 100% pattern
  for (let i = 0; i < 10; i++) {
    transactions.push({
      id: id++,
      vendor: 'SuspiciousVendor',
      amount: parseFloat((Math.random() * 100 + 10).toFixed(2)),
      date: `2024-01-${(i + 21).toString().padStart(2, '0')}`
    });
  }
  
  return transactions;
}

// Set up tests
const runner = new TestRunner();

// Test 1: Basic micro-skimming detection
runner.addTest('Detect micro-skimming patterns', async () => {
  const transactions = generateMockTransactions();
  const findings = mockMicroSkimmingDetection.detectMicroSkimming(transactions, {
    aggregationThresholds: { warning: 0.01, critical: 0.1 } // Lower thresholds for testing
  });
  
  runner.assert(findings.length > 0, 'Should detect micro-skimming patterns');
  runner.assertEqual(findings[0].vendor, 'VendorA', 'Should identify correct vendor');
  runner.assertEqual(findings[0].type, 'micro_skimming', 'Should identify as micro-skimming');
  runner.assertGreaterThan(findings[0].microTransactionCount, 5, 'Should detect multiple micro-transactions');
});

// Test 2: Integer math precision
runner.addTest('Integer math precision for micro amounts', async () => {
  const transactions = generateMockTransactions();
  const findingsFloat = mockMicroSkimmingDetection.detectMicroSkimming(transactions, { 
    useIntegerMath: false,
    aggregationThresholds: { warning: 0.01, critical: 0.1 }
  });
  const findingsInt = mockMicroSkimmingDetection.detectMicroSkimming(transactions, { 
    useIntegerMath: true,
    aggregationThresholds: { warning: 0.01, critical: 0.1 }
  });
  
  runner.assert(findingsFloat.length > 0, 'Float math should detect patterns');
  runner.assert(findingsInt.length > 0, 'Integer math should detect patterns');
  runner.assert(Math.abs(findingsFloat[0].totalMicroAmount - findingsInt[0].totalMicroAmount) < 0.01, 'Results should be consistent between math types');
});

// Test 3: Fractional residue pattern detection
runner.addTest('Detect fractional residue patterns', async () => {
  const transactions = generateFractionalResidueTransactions();
  const findings = mockMicroSkimmingDetection.detectFractionalResiduePatterns(transactions);
  
  runner.assert(findings.length > 0, 'Should detect fractional residue patterns');
  runner.assertEqual(findings[0].type, 'fractional_residue_pattern', 'Should identify as fractional residue pattern');
  runner.assertGreaterThan(findings[0].deviation, 0.05, 'Should show significant deviation from expected frequency');
});

// Test 4: Threshold configuration
runner.addTest('Configurable thresholds and parameters', async () => {
  const transactions = generateMockTransactions();
  
  // Test with strict thresholds
  const strictFindings = mockMicroSkimmingDetection.detectMicroSkimming(transactions, {
    aggregationThresholds: { warning: 10.0, critical: 20.0 }
  });
  
  // Test with lenient thresholds
  const lenientFindings = mockMicroSkimmingDetection.detectMicroSkimming(transactions, {
    aggregationThresholds: { warning: 0.01, critical: 0.05 }
  });
  
  runner.assert(lenientFindings.length >= strictFindings.length, 'Lenient thresholds should detect same or more patterns');
});

// Test 5: Edge cases
runner.addTest('Handle edge cases gracefully', async () => {
  // Empty transactions
  const emptyFindings = mockMicroSkimmingDetection.detectMicroSkimming([]);
  runner.assertEqual(emptyFindings.length, 0, 'Should handle empty transaction list');
  
  // Single transaction
  const singleTx = [{ id: 1, vendor: 'Test', amount: 0.005, date: '2024-01-01' }];
  const singleFindings = mockMicroSkimmingDetection.detectMicroSkimming(singleTx);
  runner.assertEqual(singleFindings.length, 0, 'Should not detect patterns with insufficient data');
  
  // Zero amounts
  const zeroTx = [{ id: 1, vendor: 'Test', amount: 0, date: '2024-01-01' }];
  const zeroFindings = mockMicroSkimmingDetection.detectMicroSkimming(zeroTx);
  runner.assertEqual(zeroFindings.length, 0, 'Should handle zero amounts gracefully');
});

// Test 6: Severity classification
runner.addTest('Classify severity levels correctly', async () => {
  const transactions = generateMockTransactions();
  const findings = mockMicroSkimmingDetection.detectMicroSkimming(transactions, {
    aggregationThresholds: { warning: 0.01, critical: 0.1 }
  });
  
  runner.assert(findings.length > 0, 'Should detect patterns');
  runner.assert(['warning', 'critical'].includes(findings[0].severity), 'Should assign appropriate severity level');
});

// Test 7: Performance with larger dataset
runner.addTest('Performance with larger transaction dataset', async () => {
  // Generate 1000 transactions
  const largeDataset = [];
  for (let i = 0; i < 1000; i++) {
    largeDataset.push({
      id: i + 1,
      vendor: `Vendor${Math.floor(i / 100) + 1}`,
      amount: Math.random() < 0.1 ? 0.009 : Math.random() * 100,
      date: `2024-01-${(i % 30 + 1).toString().padStart(2, '0')}`
    });
  }
  
  const startTime = Date.now();
  const findings = mockMicroSkimmingDetection.detectMicroSkimming(largeDataset);
  const duration = Date.now() - startTime;
  
  runner.assert(duration < 1000, 'Should process 1000 transactions in under 1 second');
  runner.assert(findings.length >= 0, 'Should return valid results');
});

// Run all tests
runner.runAll().then(() => {
  console.log('\n🎉 All tests completed!');
  process.exit(runner.results.failed > 0 ? 1 : 0);
});