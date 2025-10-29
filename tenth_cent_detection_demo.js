#!/usr/bin/env node
/**
 * Focused Tenth-Cent Embezzlement Detection Demo
 * Shows specific examples of catching embezzlement down to 0.1¢
 */

// Simple detection demo without external dependencies
const detectTenthCentEmbezzlement = (transactions) => {
  console.log('🔍 TENTH-CENT EMBEZZLEMENT DETECTION DEMO');
  console.log('='.repeat(60));
  console.log(`📊 Analyzing ${transactions.length} transactions...\n`);

  // Group by vendor and analyze micro-patterns
  const vendorAnalysis = {};
  
  transactions.forEach(tx => {
    const vendor = tx.vendor;
    const amount = Math.abs(tx.amount);
    
    if (!vendorAnalysis[vendor]) {
      vendorAnalysis[vendor] = {
        totalTx: 0,
        microTx: [],
        tenthCentTx: [],
        totalAmount: 0,
        microAmount: 0
      };
    }
    
    vendorAnalysis[vendor].totalTx++;
    vendorAnalysis[vendor].totalAmount += amount;
    
    // Check for micro-transactions (≤ 1 cent)
    if (amount <= 0.01 && amount > 0) {
      vendorAnalysis[vendor].microTx.push({ ...tx, amount });
      vendorAnalysis[vendor].microAmount += amount;
      
      // Check for tenth-cent precision (≤ 0.001)
      if (amount <= 0.001) {
        vendorAnalysis[vendor].tenthCentTx.push({ ...tx, amount });
      }
    }
  });

  console.log('🎯 DETECTED EMBEZZLEMENT PATTERNS:\n');

  let findingCount = 0;

  Object.entries(vendorAnalysis).forEach(([vendor, data]) => {
    if (data.microTx.length >= 5) { // Minimum threshold for suspicious pattern
      findingCount++;
      
      console.log(`🚨 FINDING #${findingCount}: ${vendor}`);
      console.log(`   Type: Micro-Transaction Embezzlement`);
      console.log(`   Micro-transactions: ${data.microTx.length}`);
      console.log(`   Tenth-cent transactions: ${data.tenthCentTx.length}`);
      console.log(`   Total micro-amount: $${data.microAmount.toFixed(6)}`);
      console.log(`   Average per micro-tx: $${(data.microAmount / data.microTx.length).toFixed(6)}`);
      
      if (data.tenthCentTx.length > 0) {
        console.log(`   💎 Tenth-cent precision detected!`);
        console.log(`   Smallest amount: $${Math.min(...data.tenthCentTx.map(tx => tx.amount)).toFixed(6)}`);
      }
      
      console.log(`   Sample transactions:`);
      data.microTx.slice(0, 3).forEach((tx, i) => {
        console.log(`     ${i+1}. $${tx.amount.toFixed(6)} - ${tx.description}`);
      });
      console.log('');
    }
  });

  // Analyze fractional residue patterns
  const residueAnalysis = {};
  
  transactions.forEach(tx => {
    const amount = Math.abs(tx.amount);
    // Extract tenths of cent (0-9)
    const tenths = Math.floor(amount * 1000) % 10;
    
    if (!residueAnalysis[tenths]) {
      residueAnalysis[tenths] = [];
    }
    residueAnalysis[tenths].push(tx);
  });

  console.log('🎯 FRACTIONAL RESIDUE ANALYSIS:\n');

  Object.entries(residueAnalysis).forEach(([residue, txs]) => {
    const frequency = (txs.length / transactions.length) * 100;
    const expectedFreq = 10; // 10% expected for each tenth
    const deviation = Math.abs(frequency - expectedFreq);
    
    if (deviation > 8 && txs.length >= 5) { // Significant deviation
      findingCount++;
      
      console.log(`🚨 FINDING #${findingCount}: Suspicious .${residue} cent pattern`);
      console.log(`   Occurrences: ${txs.length} transactions`);
      console.log(`   Frequency: ${frequency.toFixed(1)}% (expected: ${expectedFreq}%)`);
      console.log(`   Deviation: ${deviation.toFixed(1)}% - ${deviation > 15 ? 'CRITICAL' : 'WARNING'}`);
      console.log(`   Total amount: $${txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0).toFixed(2)}`);
      
      if (residue === '1' || residue === '3') {
        console.log(`   💎 Tenth-cent residue manipulation detected!`);
      }
      
      console.log(`   Sample amounts: ${txs.slice(0, 5).map(tx => `$${Math.abs(tx.amount).toFixed(3)}`).join(', ')}`);
      console.log('');
    }
  });

  console.log('📈 SUMMARY:');
  console.log(`   Total suspicious patterns detected: ${findingCount}`);
  console.log(`   Vendors with micro-transactions: ${Object.values(vendorAnalysis).filter(v => v.microTx.length > 0).length}`);
  console.log(`   Total micro-transaction amount: $${Object.values(vendorAnalysis).reduce((sum, v) => sum + v.microAmount, 0).toFixed(6)}`);
  
  const tenthCentCount = Object.values(vendorAnalysis).reduce((sum, v) => sum + v.tenthCentTx.length, 0);
  if (tenthCentCount > 0) {
    console.log(`   💎 Tenth-cent precision transactions: ${tenthCentCount}`);
  }
};

// Load and analyze the demo data
import fs from 'fs';

try {
  const data = JSON.parse(fs.readFileSync('tenth_cent_embezzlement_demo.json', 'utf8'));
  detectTenthCentEmbezzlement(data);
} catch (error) {
  console.error('Error loading demo data:', error.message);
}