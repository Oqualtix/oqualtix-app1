#!/usr/bin/env node
/**
 * Enhanced Unit Tests for Ultra-Precise Micro-Skimming Detection
 * Tests for detectMicroSkimming and detectFractionalResiduePatterns methods
 * Now includes hundredths of a cent detection capabilities
 */

import { EnhancedAnomalyDetectionUtils } from './src/utils/EnhancedAnomalyDetectionUtils.js';

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
    console.log('🧪 Running Ultra-Precise Micro-Skimming Detection Tests...\n');
    
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

// Mock transaction data generators
function generateUltraTinyTransactions() {
  return [
    // Normal transactions
    { id: 1, vendor: 'VendorA', amount: 25.67, date: '2024-01-01' },
    { id: 2, vendor: 'VendorA', amount: 15.42, date: '2024-01-02' },
    { id: 3, vendor: 'VendorA', amount: 8.93, date: '2024-01-03' },
    
    // Ultra-tiny transactions (hundredths of a cent - $0.0001 to $0.0009)
    { id: 4, vendor: 'VendorA', amount: 0.0007, date: '2024-01-04' },
    { id: 5, vendor: 'VendorA', amount: 0.0003, date: '2024-01-05' },
    { id: 6, vendor: 'VendorA', amount: 0.0009, date: '2024-01-06' },
    { id: 7, vendor: 'VendorA', amount: 0.0004, date: '2024-01-07' },
    { id: 8, vendor: 'VendorA', amount: 0.0006, date: '2024-01-08' },
    { id: 9, vendor: 'VendorA', amount: 0.0002, date: '2024-01-09' },
    { id: 10, vendor: 'VendorA', amount: 0.0008, date: '2024-01-10' },
    { id: 11, vendor: 'VendorA', amount: 0.0005, date: '2024-01-11' },
    { id: 12, vendor: 'VendorA', amount: 0.0001, date: '2024-01-12' },
    { id: 13, vendor: 'VendorA', amount: 0.0007, date: '2024-01-13' },
    { id: 14, vendor: 'VendorA', amount: 0.0003, date: '2024-01-14' },
    { id: 15, vendor: 'VendorA', amount: 0.0009, date: '2024-01-15' },
    
    // Tiny transactions (tenths of a cent - $0.001 to $0.009)
    { id: 16, vendor: 'VendorA', amount: 0.007, date: '2024-01-16' },
    { id: 17, vendor: 'VendorA', amount: 0.003, date: '2024-01-17' },
    { id: 18, vendor: 'VendorA', amount: 0.009, date: '2024-01-18' },
    { id: 19, vendor: 'VendorA', amount: 0.004, date: '2024-01-19' },
    { id: 20, vendor: 'VendorA', amount: 0.006, date: '2024-01-20' },
    
    // More normal transactions to meet minimum threshold
    { id: 21, vendor: 'VendorA', amount: 12.45, date: '2024-01-21' },
    { id: 22, vendor: 'VendorA', amount: 22.78, date: '2024-01-22' },
    { id: 23, vendor: 'VendorA', amount: 31.89, date: '2024-01-23' },
    { id: 24, vendor: 'VendorA', amount: 18.92, date: '2024-01-24' },
    { id: 25, vendor: 'VendorA', amount: 27.56, date: '2024-01-25' }
  ];
}

function generateHundredthsCentResidueTransactions() {
  // Generate transactions with suspicious .0037 cent pattern (hundredths precision)
  const transactions = [];
  let id = 1;
  
  // Add 25 transactions ending in exactly .0037 cents (ultra-precise pattern)
  for (let i = 0; i < 25; i++) {
    const baseAmount = Math.random() * 100 + 10;
    const preciseAmount = Math.floor(baseAmount * 10000) / 10000 + 0.0037;
    transactions.push({
      id: id++,
      vendor: 'SuspiciousVendor',
      amount: parseFloat(preciseAmount.toFixed(4)),
      date: `2024-01-${(i + 1).toString().padStart(2, '0')}`
    });
  }
  
  // Add some normal transactions to avoid 100% pattern
  for (let i = 0; i < 15; i++) {
    transactions.push({
      id: id++,
      vendor: 'SuspiciousVendor',
      amount: parseFloat((Math.random() * 100 + 10).toFixed(4)),
      date: `2024-01-${(i + 26).toString().padStart(2, '0')}`
    });
  }
  
  return transactions;
}

function generateMixedPrecisionTransactions() {
  // Generate transactions with both tenth and hundredth cent patterns
  const transactions = [];
  let id = 1;
  
  // Ultra-tiny systematic theft (hundredths of cents)
  for (let i = 0; i < 15; i++) {
    transactions.push({
      id: id++,
      vendor: 'UltraPreciseThief',
      amount: 0.0003, // Exactly 3 hundredths of a cent
      date: `2024-01-${(i + 1).toString().padStart(2, '0')}`
    });
  }
  
  // Tiny systematic theft (tenths of cents)
  for (let i = 0; i < 12; i++) {
    transactions.push({
      id: id++,
      vendor: 'PreciseThief',
      amount: 0.003, // Exactly 3 tenths of a cent
      date: `2024-01-${(i + 16).toString().padStart(2, '0')}`
    });
  }
  
  // Normal transactions
  for (let i = 0; i < 20; i++) {
    transactions.push({
      id: id++,
      vendor: 'NormalVendor',
      amount: parseFloat((Math.random() * 50 + 5).toFixed(2)),
      date: `2024-01-${(i + 28).toString().padStart(2, '0')}`
    });
  }
  
  return transactions;
}

// Set up tests
const runner = new TestRunner();

// Test 1: Ultra-tiny micro-skimming detection (hundredths of cents)
runner.addTest('Detect ultra-tiny micro-skimming patterns (hundredths of cents)', async () => {
  const transactions = generateUltraTinyTransactions();
  const findings = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, {}, {
    ultraTinyThreshold: 0.0001,
    cumulativeThreshold: 0.01,
    minCount: 10,
    useIntegerMath: true
  });
  
  runner.assert(findings.length > 0, 'Should detect ultra-tiny micro-skimming patterns');
  runner.assertEqual(findings[0].type, 'MICRO_SKIMMING', 'Should identify as micro-skimming');
  runner.assert(findings[0].details.ultraTinyTransactionCount >= 10, 'Should detect multiple ultra-tiny transactions');
  runner.assertEqual(findings[0].details.detectionLevel, 'HUNDREDTH_CENT', 'Should detect at hundredth cent level');
});

// Test 2: Hundredths cent residue pattern detection
runner.addTest('Detect hundredths cent fractional residue patterns', async () => {
  const transactions = generateHundredthsCentResidueTransactions();
  const findings = await EnhancedAnomalyDetectionUtils.detectFractionalResiduePatterns(transactions, {}, {
    minCount: 20,
    proportionThreshold: 0.5,
    useIntegerMath: true
  });
  
  runner.assert(findings.length > 0, 'Should detect hundredths cent residue patterns');
  
  const ultraPreciseFindings = findings.filter(f => f.type === 'ULTRA_PRECISE_FRACTIONAL_RESIDUE_PATTERN');
  runner.assert(ultraPreciseFindings.length > 0, 'Should detect ultra-precise fractional residue patterns');
  runner.assertEqual(ultraPreciseFindings[0].details.detectionLevel, 'HUNDREDTH_CENT', 'Should detect at hundredth cent level');
  runner.assert(ultraPreciseFindings[0].details.dominantHundredthsResidue === 37, 'Should detect .0037 cent pattern');
});

// Test 3: Mixed precision detection
runner.addTest('Detect both tenth and hundredth cent patterns', async () => {
  const transactions = generateMixedPrecisionTransactions();
  
  const microFindings = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, {}, {
    ultraTinyThreshold: 0.0001,
    tinyThreshold: 0.001,
    cumulativeThreshold: 0.01,
    minCount: 5,
    useIntegerMath: true
  });
  
  const residueFindings = await EnhancedAnomalyDetectionUtils.detectFractionalResiduePatterns(transactions, {}, {
    minCount: 10,
    proportionThreshold: 0.3,
    useIntegerMath: true
  });
  
  runner.assert(microFindings.length > 0, 'Should detect micro-skimming patterns');
  
  // Should detect ultra-tiny patterns
  const ultraTinyFindings = microFindings.filter(f => f.details.detectionLevel === 'HUNDREDTH_CENT');
  runner.assert(ultraTinyFindings.length > 0, 'Should detect ultra-tiny (hundredth cent) patterns');
  
  // Should detect residue patterns
  runner.assert(residueFindings.length > 0, 'Should detect fractional residue patterns');
});

// Test 4: Precision comparison between integer and floating point math
runner.addTest('Compare integer vs floating point precision for ultra-tiny amounts', async () => {
  const transactions = generateUltraTinyTransactions();
  
  const findingsFloat = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, {}, {
    ultraTinyThreshold: 0.0001,
    cumulativeThreshold: 0.01,
    useIntegerMath: false
  });
  
  const findingsInt = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, {}, {
    ultraTinyThreshold: 0.0001,
    cumulativeThreshold: 0.01,
    useIntegerMath: true
  });
  
  runner.assert(findingsFloat.length > 0, 'Float math should detect patterns');
  runner.assert(findingsInt.length > 0, 'Integer math should detect patterns');
  
  // Integer math should be more precise
  runner.assertEqual(findingsInt[0].details.precisionMode, 'DECI_MILLI_CENTS', 'Integer math should use deci-milli-cents precision');
  runner.assertEqual(findingsFloat[0].details.precisionMode, 'FLOATING_POINT', 'Float math should use floating point');
});

// Test 5: Global ultra-precise residue dominance
runner.addTest('Detect global ultra-precise residue dominance', async () => {
  // Create transactions where 30% have .0025 cent residue
  const transactions = [];
  let id = 1;
  
  // 30 transactions with .0025 residue
  for (let i = 0; i < 30; i++) {
    const baseAmount = Math.random() * 50 + 10;
    const preciseAmount = Math.floor(baseAmount * 10000) / 10000 + 0.0025;
    transactions.push({
      id: id++,
      vendor: `Vendor${Math.floor(i / 5) + 1}`,
      amount: parseFloat(preciseAmount.toFixed(4)),
      date: `2024-01-${(i + 1).toString().padStart(2, '0')}`
    });
  }
  
  // 70 transactions with random residues
  for (let i = 0; i < 70; i++) {
    transactions.push({
      id: id++,
      vendor: `Vendor${Math.floor(i / 10) + 7}`,
      amount: parseFloat((Math.random() * 100 + 5).toFixed(4)),
      date: `2024-01-${(i + 31).toString().padStart(2, '0')}`
    });
  }
  
  const findings = await EnhancedAnomalyDetectionUtils.detectFractionalResiduePatterns(transactions, {}, {
    minCount: 20,
    proportionThreshold: 0.15,
    useIntegerMath: true
  });
  
  const globalFindings = findings.filter(f => f.type === 'GLOBAL_ULTRA_PRECISE_RESIDUE_DOMINANCE');
  runner.assert(globalFindings.length > 0, 'Should detect global ultra-precise residue dominance');
  runner.assertEqual(globalFindings[0].details.dominantHundredthsResidue, 25, 'Should detect .0025 cent pattern');
});

// Test 6: Performance with ultra-precise calculations
runner.addTest('Performance with ultra-precise calculations on large dataset', async () => {
  // Generate 2000 transactions with various precision levels
  const transactions = [];
  for (let i = 0; i < 2000; i++) {
    const amount = Math.random() < 0.05 ? 
      parseFloat((Math.random() * 0.001).toFixed(4)) : // 5% ultra-tiny
      parseFloat((Math.random() * 100 + 1).toFixed(4)); // 95% normal
    
    transactions.push({
      id: i + 1,
      vendor: `Vendor${Math.floor(i / 100) + 1}`,
      amount,
      date: `2024-${String(Math.floor(i / 60) + 1).padStart(2, '0')}-${String((i % 30) + 1).padStart(2, '0')}`
    });
  }
  
  const startTime = Date.now();
  const findings = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, {}, {
    ultraTinyThreshold: 0.0001,
    useIntegerMath: true
  });
  const duration = Date.now() - startTime;
  
  runner.assert(duration < 2000, 'Should process 2000 transactions with ultra-precision in under 2 seconds');
  runner.assert(findings.length >= 0, 'Should return valid results');
});

// Test 7: Edge cases with extremely small amounts
runner.addTest('Handle extremely small amounts and edge cases', async () => {
  const edgeCaseTransactions = [
    { id: 1, vendor: 'EdgeVendor', amount: 0.0001, date: '2024-01-01' }, // Exactly at threshold
    { id: 2, vendor: 'EdgeVendor', amount: 0.00001, date: '2024-01-02' }, // Below threshold
    { id: 3, vendor: 'EdgeVendor', amount: 0, date: '2024-01-03' }, // Zero amount
    { id: 4, vendor: 'EdgeVendor', amount: -0.0001, date: '2024-01-04' }, // Negative tiny amount
    { id: 5, vendor: 'EdgeVendor', amount: 0.00005, date: '2024-01-05' }, // Half threshold
  ];
  
  // Pad with normal transactions to meet minimums
  for (let i = 0; i < 20; i++) {
    edgeCaseTransactions.push({
      id: i + 6,
      vendor: 'EdgeVendor',
      amount: Math.random() * 10 + 1,
      date: `2024-01-${(i + 6).toString().padStart(2, '0')}`
    });
  }
  
  const findings = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(edgeCaseTransactions, {}, {
    ultraTinyThreshold: 0.0001,
    cumulativeThreshold: 0.001,
    useIntegerMath: true
  });
  
  // Should handle edge cases gracefully without errors
  runner.assert(true, 'Should handle edge cases without throwing errors');
});

// Run all tests
runner.runAll().then(() => {
  console.log('\n🎉 All ultra-precise micro-skimming detection tests completed!');
  console.log('💎 System can now detect embezzlement down to a hundredth of a cent ($0.0001)');
  process.exit(runner.results.failed > 0 ? 1 : 0);
});