#!/usr/bin/env node
/**
 * Oqualtix Fraud Detection Demo - Concrete Dollar Examples
 * Shows exactly what amounts would be flagged as potential embezzlement
 */

function calculateStats(amounts) {
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    return { mean, stdDev, threshold3Sigma: mean + (3 * stdDev) };
}

function detectFraud() {
    console.log("🔍 Oqualtix Enhanced Fraud Detection - Concrete Examples");
    console.log("=".repeat(60));
    
    // Sample vendor data with realistic transaction patterns
    const vendorsData = {
        "Office Supplies Inc": [345.67, 289.45, 512.33, 298.76, 445.21, 367.89, 401.56, 356.78],
        "Tech Solutions LLC": [1890.50, 2145.75, 1756.32, 2089.45, 1945.67, 2198.33, 1876.54],
        "Legal Associates": [3200.00, 2850.75, 3456.25, 2975.50, 3125.80, 3089.45],
        "Catering Services": [567.89, 445.32, 623.45, 498.76, 534.21, 589.67],
        "Suspicious Vendor A": [758.45, 692.33, 815.67, 734.56, 15000.00, 22500.00, 18750.00], // FRAUD
        "Shell Company B": [5000.00, 10000.00, 15000.00, 7500.00, 12500.00], // ROUND DOLLAR FRAUD
        "Threshold Evader Corp": [4999.00, 9999.00, 4950.00, 24999.00, 9899.00] // THRESHOLD EVASION
    };
    
    const allAnomalies = [];
    
    // Analyze each vendor
    for (const [vendor, amounts] of Object.entries(vendorsData)) {
        console.log(`\n📊 Analyzing: ${vendor}`);
        console.log(`   Transactions: ${amounts.length}`);
        
        if (amounts.length >= 3) {
            const stats = calculateStats(amounts);
            
            console.log(`   Mean: $${stats.mean.toFixed(2)}`);
            console.log(`   Std Dev: $${stats.stdDev.toFixed(2)}`);
            console.log(`   3σ Threshold: $${stats.threshold3Sigma.toFixed(2)}`);
            
            // Check for statistical outliers
            amounts.forEach(amount => {
                if (amount > stats.threshold3Sigma) {
                    const sigmaMultiplier = stats.stdDev > 0 ? (amount - stats.mean) / stats.stdDev : 0;
                    const riskScore = Math.min(100, Math.max(70, 70 + (sigmaMultiplier - 3) * 10));
                    
                    allAnomalies.push({
                        vendor,
                        amount,
                        type: 'Statistical Outlier',
                        riskScore,
                        reason: `$${amount.toFixed(2)} exceeds $${stats.threshold3Sigma.toFixed(2)} threshold (${sigmaMultiplier.toFixed(1)}σ above mean)`
                    });
                    console.log(`   🚨 OUTLIER: $${amount.toFixed(2)} (${sigmaMultiplier.toFixed(1)}σ above mean)`);
                }
            });
            
            // Check for round dollar patterns
            const roundAmounts = amounts.filter(amt => amt % 1000 === 0 && amt >= 1000);
            roundAmounts.forEach(amount => {
                allAnomalies.push({
                    vendor,
                    amount,
                    type: 'Round Dollar Pattern',
                    riskScore: 75,
                    reason: `Suspicious round amount: $${amount.toFixed(2)}`
                });
                console.log(`   🔴 ROUND: $${amount.toFixed(2)} (suspicious round dollar)`);
            });
            
            // Check for threshold evasion
            const thresholds = [5000, 10000, 25000, 50000];
            amounts.forEach(amount => {
                for (const threshold of thresholds) {
                    if (threshold - 100 <= amount && amount < threshold) {
                        allAnomalies.push({
                            vendor,
                            amount,
                            type: 'Threshold Evasion',
                            riskScore: 85,
                            reason: `$${amount.toFixed(2)} just under $${threshold.toLocaleString()} threshold`
                        });
                        console.log(`   ⚠️  EVASION: $${amount.toFixed(2)} (just under $${threshold.toLocaleString()} limit)`);
                        break;
                    }
                }
            });
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
    
    allAnomalies.slice(0, 10).forEach((anomaly, i) => {
        console.log(`\n[${i+1}] RISK SCORE: ${anomaly.riskScore}/100`);
        console.log(`    🏢 Vendor: ${anomaly.vendor}`);
        console.log(`    💰 Amount: $${anomaly.amount.toLocaleString()}`);
        console.log(`    🚩 Type: ${anomaly.type}`);
        console.log(`    📝 Reason: ${anomaly.reason}`);
    });
    
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

// Run the demo
detectFraud();