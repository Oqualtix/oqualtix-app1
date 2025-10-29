#!/usr/bin/env node
/**
 * Simplified Fraud Detection Demo - Shows exact dollar amounts flagged as fraud
 * No external dependencies required
 */

/**
 * Calculate mean of an array
 */
function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculate standard deviation of an array
 */
function stdev(arr) {
    if (arr.length <= 1) return 0;
    const avgVal = mean(arr);
    const squareDiffs = arr.map(val => Math.pow(val - avgVal, 2));
    return Math.sqrt(mean(squareDiffs));
}

/**
 * Demonstrate fraud detection with concrete dollar examples
 */
function simpleFraudDetectionDemo() {
    console.log("🔍 Oqualtix Enhanced Fraud Detection - Concrete Examples");
    console.log("=".repeat(60));
    
    // Sample vendor data with realistic transaction patterns
    const vendorsData = {
        "Office Supplies Inc": [345.67, 289.45, 512.33, 298.76, 445.21, 367.89, 401.56, 356.78],
        "Tech Solutions LLC": [1890.50, 2145.75, 1756.32, 2089.45, 1945.67, 2198.33, 1876.54],
        "Legal Associates": [3200.00, 2850.75, 3456.25, 2975.50, 3125.80, 3089.45],
        "Catering Services": [567.89, 445.32, 623.45, 498.76, 534.21, 589.67],
        "Suspicious Vendor A": [758.45, 692.33, 815.67, 734.56, 15000.00, 22500.00, 18750.00],  // FRAUD
        "Shell Company B": [5000.00, 10000.00, 15000.00, 7500.00, 12500.00],  // ROUND DOLLAR FRAUD
        "Threshold Evader Corp": [4999.00, 9999.00, 4950.00, 24999.00, 9899.00]  // THRESHOLD EVASION
    };
    
    // Analyze each vendor
    const allAnomalies = [];
    
    for (const [vendor, amounts] of Object.entries(vendorsData)) {
        console.log(`\n📊 Analyzing: ${vendor}`);
        console.log(`   Transactions: ${amounts.length}`);
        
        if (amounts.length >= 3) {  // Need minimum data for statistics
            const meanAmt = mean(amounts);
            const stdAmt = stdev(amounts);
            const threshold3Sigma = meanAmt + (3 * stdAmt);
            
            console.log(`   Mean: $${meanAmt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
            console.log(`   Std Dev: $${stdAmt.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
            console.log(`   3σ Threshold: $${threshold3Sigma.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
            
            // Check for statistical outliers
            for (const amount of amounts) {
                if (amount > threshold3Sigma) {
                    const sigmaMultiplier = stdAmt > 0 ? (amount - meanAmt) / stdAmt : 0;
                    const riskScore = Math.min(100, Math.max(70, 70 + (sigmaMultiplier - 3) * 10));
                    
                    const anomaly = {
                        vendor: vendor,
                        amount: amount,
                        type: 'Statistical Outlier',
                        riskScore: riskScore,
                        reason: `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} exceeds $${threshold3Sigma.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} threshold (${sigmaMultiplier.toFixed(1)}σ above mean)`
                    };
                    allAnomalies.push(anomaly);
                    console.log(`   🚨 OUTLIER: $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${sigmaMultiplier.toFixed(1)}σ above mean)`);
                }
            }
            
            // Check for round dollar patterns
            const roundAmounts = amounts.filter(amt => amt % 1000 === 0 && amt >= 1000);
            for (const amount of roundAmounts) {
                const anomaly = {
                    vendor: vendor,
                    amount: amount,
                    type: 'Round Dollar Pattern',
                    riskScore: 75,
                    reason: `Suspicious round amount: $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                };
                allAnomalies.push(anomaly);
                console.log(`   🔴 ROUND: $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (suspicious round dollar)`);
            }
            
            // Check for threshold evasion
            const thresholds = [5000, 10000, 25000, 50000];
            for (const amount of amounts) {
                for (const threshold of thresholds) {
                    if (threshold - 100 <= amount && amount < threshold) {
                        const anomaly = {
                            vendor: vendor,
                            amount: amount,
                            type: 'Threshold Evasion',
                            riskScore: 85,
                            reason: `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} just under $${threshold.toLocaleString('en-US')} threshold`
                        };
                        allAnomalies.push(anomaly);
                        console.log(`   ⚠️  EVASION: $${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} (just under $${threshold.toLocaleString('en-US')} limit)`);
                        break;
                    }
                }
            }
        }
    }
    
    // Sort anomalies by risk score
    allAnomalies.sort((a, b) => b.riskScore - a.riskScore);
    
    // Print summary
    console.log(`\n🚨 FRAUD DETECTION SUMMARY`);
    console.log("=".repeat(40));
    console.log(`Total anomalies detected: ${allAnomalies.length}`);
    
    const highRisk = allAnomalies.filter(a => a.riskScore >= 80);
    const mediumRisk = allAnomalies.filter(a => a.riskScore >= 60 && a.riskScore < 80);
    
    console.log(`🔥 High Risk (≥80): ${highRisk.length}`);
    console.log(`⚠️  Medium Risk (60-79): ${mediumRisk.length}`);
    
    console.log(`\n📋 TOP FRAUD ALERTS:`);
    console.log("-".repeat(60));
    
    for (let i = 0; i < Math.min(10, allAnomalies.length); i++) {
        const anomaly = allAnomalies[i];
        console.log(`\n[${i+1}] RISK SCORE: ${anomaly.riskScore}/100`);
        console.log(`    🏢 Vendor: ${anomaly.vendor}`);
        console.log(`    💰 Amount: $${anomaly.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`    🚩 Type: ${anomaly.type}`);
        console.log(`    📝 Reason: ${anomaly.reason}`);
    }
    
    // Real-world examples by company size
    console.log(`\n💡 REAL-WORLD THRESHOLD EXAMPLES:`);
    console.log("-".repeat(50));
    
    console.log("Small Business (<$500K revenue):");
    console.log("  • Any payment > $2,500 → HIGH RISK");
    console.log("  • Round amounts $1,000, $2,000, $5,000 → MEDIUM RISK");
    console.log("  • Amounts $999, $1,999, $4,999 → HIGH RISK (threshold evasion)");
    
    console.log("\nMid-Size Company ($500K-$50M):");
    console.log("  • Payments > mean+3σ (typically $15K-$30K) → HIGH RISK");
    console.log("  • Round amounts $5,000, $10,000, $25,000 → MEDIUM RISK");
    console.log("  • Amounts $4,999, $9,999, $24,999 → HIGH RISK");
    
    console.log("\nLarge Enterprise (>$50M):");
    console.log("  • Single payments > $100,000 → HIGH RISK");
    console.log("  • Vendor taking >30% of total payments → MEDIUM RISK");
    console.log("  • 10+ payments in one month (vs normal 2-3) → MEDIUM RISK");
    
    console.log(`\n✅ Analysis complete! This demonstrates the Enhanced Anomaly Detection in Oqualtix App.`);
    
    return allAnomalies;
}

// Execute if run directly
if (require.main === module) {
    simpleFraudDetectionDemo();
}

module.exports = { simpleFraudDetectionDemo, mean, stdev };