#!/usr/bin/env node
/**
 * Unit Tests for Micro-Skimming Detection
 * Tests for detectMicroSkimming and detectFractionalResiduePatterns methods
 */

import { EnhancedAnomalyDetectionUtils } from './src/utils/EnhancedAnomalyDetectionUtils.js';

// Test utilities
class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
    }

    async test(name, testFn) {
        try {
            console.log(`\n🧪 Testing: ${name}`);
            await testFn();
            console.log(`✅ PASSED: ${name}`);
            this.passed++;
        } catch (error) {
            console.log(`❌ FAILED: ${name}`);
            console.log(`   Error: ${error.message}`);
            this.failed++;
        }
        this.tests.push({ name, passed: this.failed === 0 });
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

    summary() {
        console.log(`\n📊 Test Summary:`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📋 Total: ${this.passed + this.failed}`);
        return this.failed === 0;
    }
}

// Mock behavioral profile for testing
const mockProfile = {
    transactionStats: { mean: 100, standardDeviation: 50 }
};

// Generate test transaction data
function generateTestTransactions(patterns = {}) {
    const transactions = [];
    
    // Normal transactions
    for (let i = 0; i < 20; i++) {
        transactions.push({
            id: `norm_${i}`,
            vendor: 'Normal Vendor',
            amount: Math.random() * 1000 + 100,
            date: new Date().toISOString(),
            description: 'Normal transaction'
        });
    }
    
    // Micro-skimming pattern
    if (patterns.microSkimming) {
        for (let i = 0; i < 100; i++) {
            transactions.push({
                id: `micro_${i}`,
                vendor: 'Micro Skimmer Corp',
                amount: 0.001 + Math.random() * 0.008, // 0.001 to 0.009
                date: new Date().toISOString(),
                description: 'Tiny processing fee'
            });
        }
    }
    
    // Fractional residue pattern
    if (patterns.fractionalResidue) {
        for (let i = 0; i < 50; i++) {
            // Create amounts that all have the same tenths residue (e.g., X.XX7)
            const baseAmount = Math.floor(Math.random() * 1000) + 100;
            const amount = baseAmount + 0.007; // Always ends in .007
            transactions.push({
                id: `residue_${i}`,
                vendor: 'Residue Manipulator LLC',
                amount: amount,
                date: new Date().toISOString(),
                description: 'Systematic residue transaction'
            });
        }
    }
    
    // High-volume tiny amounts
    if (patterns.highVolumeTiny) {
        for (let i = 0; i < 200; i++) {
            transactions.push({
                id: `tiny_${i}`,
                vendor: 'High Volume Tiny Corp',
                amount: 0.0001 + Math.random() * 0.0009, // 0.0001 to 0.001
                date: new Date().toISOString(),
                description: 'Micro fee'
            });
        }
    }
    
    return transactions;
}

// Run all tests
async function runTests() {
    const runner = new TestRunner();
    
    // Test 1: Basic micro-skimming detection
    await runner.test('Basic micro-skimming detection', async () => {
        const transactions = generateTestTransactions({ microSkimming: true });
        const anomalies = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, mockProfile);
        
        runner.assert(anomalies.length > 0, 'Should detect micro-skimming anomalies');
        
        const microAnomaly = anomalies.find(a => a.type === 'MICRO_SKIMMING');
        runner.assert(microAnomaly, 'Should find MICRO_SKIMMING type anomaly');
        runner.assert(microAnomaly.details.vendor === 'Micro Skimmer Corp', 'Should identify correct vendor');
        runner.assert(microAnomaly.details.microTransactionCount === 100, 'Should count micro transactions correctly');
    });
    
    // Test 2: Fractional residue pattern detection
    await runner.test('Fractional residue pattern detection', async () => {
        const transactions = generateTestTransactions({ fractionalResidue: true });
        const anomalies = await EnhancedAnomalyDetectionUtils.detectFractionalResiduePatterns(transactions, mockProfile);
        
        runner.assert(anomalies.length > 0, 'Should detect fractional residue anomalies');
        
        const residueAnomaly = anomalies.find(a => a.type === 'FRACTIONAL_RESIDUE_PATTERN');
        runner.assert(residueAnomaly, 'Should find FRACTIONAL_RESIDUE_PATTERN type anomaly');
        runner.assert(residueAnomaly.details.vendor === 'Residue Manipulator LLC', 'Should identify correct vendor');
        runner.assert(residueAnomaly.details.dominantResidue === 7, 'Should identify dominant residue of 7');
    });
    
    // Test 3: High-volume tiny amount detection
    await runner.test('High-volume tiny amount detection', async () => {
        const transactions = generateTestTransactions({ highVolumeTiny: true });
        const anomalies = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, mockProfile);
        
        const topBeneficiary = anomalies.find(a => a.type === 'MICRO_SKIMMING_TOP_BENEFICIARY');
        runner.assert(topBeneficiary, 'Should detect top micro beneficiary');
        runner.assert(topBeneficiary.details.vendor === 'High Volume Tiny Corp', 'Should identify correct vendor');
    });
    
    // Test 4: No false positives with normal transactions
    await runner.test('No false positives with normal transactions', async () => {
        const transactions = generateTestTransactions(); // No patterns
        const microAnomalies = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(transactions, mockProfile);
        const residueAnomalies = await EnhancedAnomalyDetectionUtils.detectFractionalResiduePatterns(transactions, mockProfile);
        
        runner.assertEqual(microAnomalies.length, 0, 'Should not detect micro-skimming in normal transactions');
        runner.assertEqual(residueAnomalies.length, 0, 'Should not detect residue patterns in normal transactions');
    });
    
    // Test 5: Custom threshold options
    await runner.test('Custom threshold options', async () => {
        const transactions = generateTestTransactions({ microSkimming: true });
        
        // Test with very low thresholds
        const strictAnomalies = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(
            transactions, 
            mockProfile, 
            { 
                microThreshold: 0.005, 
                cumulativeThreshold: 0.1,
                minCount: 10
            }
        );
        
        runner.assert(strictAnomalies.length > 0, 'Should detect anomalies with strict thresholds');
        
        // Test with very high thresholds
        const lenientAnomalies = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(
            transactions, 
            mockProfile, 
            { 
                microThreshold: 0.001, 
                cumulativeThreshold: 1000,
                minCount: 1000
            }
        );
        
        runner.assertEqual(lenientAnomalies.length, 0, 'Should not detect anomalies with lenient thresholds');
    });
    
    // Test 6: Edge cases
    await runner.test('Edge cases handling', async () => {
        // Empty transactions
        const emptyAnomalies = await EnhancedAnomalyDetectionUtils.detectMicroSkimming([], mockProfile);
        runner.assertEqual(emptyAnomalies.length, 0, 'Should handle empty transaction array');
        
        // Transactions with missing/invalid amounts
        const invalidTransactions = [
            { vendor: 'Test', amount: null, date: new Date().toISOString() },
            { vendor: 'Test', amount: undefined, date: new Date().toISOString() },
            { vendor: 'Test', amount: 'invalid', date: new Date().toISOString() },
            { vendor: 'Test', amount: 0, date: new Date().toISOString() }
        ];
        
        const invalidAnomalies = await EnhancedAnomalyDetectionUtils.detectMicroSkimming(invalidTransactions, mockProfile);
        runner.assertEqual(invalidAnomalies.length, 0, 'Should handle invalid amounts gracefully');
    });
    
    // Test 7: Global residue dominance
    await runner.test('Global residue dominance detection', async () => {
        const transactions = [];
        
        // Create many transactions with same residue pattern
        for (let i = 0; i < 300; i++) {
            const baseAmount = Math.floor(Math.random() * 100) + 10;
            transactions.push({
                id: `global_${i}`,
                vendor: `Vendor_${i % 10}`,
                amount: baseAmount + 0.003, // All end in .003
                date: new Date().toISOString(),
                description: 'Global residue test'
            });
        }
        
        const anomalies = await EnhancedAnomalyDetectionUtils.detectFractionalResiduePatterns(transactions, mockProfile);
        
        const globalAnomaly = anomalies.find(a => a.type === 'GLOBAL_FRACTIONAL_RESIDUE_DOMINANCE');
        runner.assert(globalAnomaly, 'Should detect global residue dominance');
        runner.assert(globalAnomaly.details.dominantResidue === 3, 'Should identify dominant residue of 3');
    });
    
    return runner.summary();
}

// Run tests if called directly
if (require.main === module) {
    console.log('🔬 Micro-Skimming Detection Unit Tests');
    console.log('=====================================');
    
    runTests()
        .then(success => {
            console.log(success ? '\n🎉 All tests passed!' : '\n💥 Some tests failed!');
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 Test runner error:', error);
            process.exit(1);
        });
}

module.exports = { runTests, generateTestTransactions };