#!/usr/bin/env python3
"""
Simplified Fraud Detection Demo - Shows exact dollar amounts flagged as fraud
No external dependencies required
"""

import statistics
import random
from datetime import datetime, timedelta

def simple_fraud_detection_demo():
    """Demonstrate fraud detection with concrete dollar examples."""
    
    print("🔍 Oqualtix Enhanced Fraud Detection - Concrete Examples")
    print("=" * 60)
    
    # Sample vendor data with realistic transaction patterns
    vendors_data = {
        "Office Supplies Inc": [345.67, 289.45, 512.33, 298.76, 445.21, 367.89, 401.56, 356.78],
        "Tech Solutions LLC": [1890.50, 2145.75, 1756.32, 2089.45, 1945.67, 2198.33, 1876.54],
        "Legal Associates": [3200.00, 2850.75, 3456.25, 2975.50, 3125.80, 3089.45],
        "Catering Services": [567.89, 445.32, 623.45, 498.76, 534.21, 589.67],
        "Suspicious Vendor A": [758.45, 692.33, 815.67, 734.56, 15000.00, 22500.00, 18750.00],  # FRAUD
        "Shell Company B": [5000.00, 10000.00, 15000.00, 7500.00, 12500.00],  # ROUND DOLLAR FRAUD
        "Threshold Evader Corp": [4999.00, 9999.00, 4950.00, 24999.00, 9899.00]  # THRESHOLD EVASION
    }
    
    # Analyze each vendor
    all_anomalies = []
    
    for vendor, amounts in vendors_data.items():
        print(f"\n📊 Analyzing: {vendor}")
        print(f"   Transactions: {len(amounts)}")
        
        if len(amounts) >= 3:  # Need minimum data for statistics
            mean_amt = statistics.mean(amounts)
            std_amt = statistics.stdev(amounts) if len(amounts) > 1 else 0
            threshold_3sigma = mean_amt + (3 * std_amt)
            
            print(f"   Mean: ${mean_amt:,.2f}")
            print(f"   Std Dev: ${std_amt:,.2f}")
            print(f"   3σ Threshold: ${threshold_3sigma:,.2f}")
            
            # Check for statistical outliers
            for amount in amounts:
                if amount > threshold_3sigma:
                    sigma_multiplier = (amount - mean_amt) / std_amt if std_amt > 0 else 0
                    risk_score = min(100, max(70, 70 + (sigma_multiplier - 3) * 10))
                    
                    anomaly = {
                        'vendor': vendor,
                        'amount': amount,
                        'type': 'Statistical Outlier',
                        'risk_score': risk_score,
                        'reason': f"${amount:,.2f} exceeds ${threshold_3sigma:,.2f} threshold ({sigma_multiplier:.1f}σ above mean)"
                    }
                    all_anomalies.append(anomaly)
                    print(f"   🚨 OUTLIER: ${amount:,.2f} ({sigma_multiplier:.1f}σ above mean)")
            
            # Check for round dollar patterns
            round_amounts = [amt for amt in amounts if amt % 1000 == 0 and amt >= 1000]
            for amount in round_amounts:
                anomaly = {
                    'vendor': vendor,
                    'amount': amount,
                    'type': 'Round Dollar Pattern',
                    'risk_score': 75,
                    'reason': f"Suspicious round amount: ${amount:,.2f}"
                }
                all_anomalies.append(anomaly)
                print(f"   🔴 ROUND: ${amount:,.2f} (suspicious round dollar)")
            
            # Check for threshold evasion
            thresholds = [5000, 10000, 25000, 50000]
            for amount in amounts:
                for threshold in thresholds:
                    if threshold - 100 <= amount < threshold:
                        anomaly = {
                            'vendor': vendor,
                            'amount': amount,
                            'type': 'Threshold Evasion',
                            'risk_score': 85,
                            'reason': f"${amount:,.2f} just under ${threshold:,} threshold"
                        }
                        all_anomalies.append(anomaly)
                        print(f"   ⚠️  EVASION: ${amount:,.2f} (just under ${threshold:,} limit)")
                        break
    
    # Sort anomalies by risk score
    all_anomalies.sort(key=lambda x: x['risk_score'], reverse=True)
    
    # Print summary
    print(f"\n🚨 FRAUD DETECTION SUMMARY")
    print("=" * 40)
    print(f"Total anomalies detected: {len(all_anomalies)}")
    
    high_risk = [a for a in all_anomalies if a['risk_score'] >= 80]
    medium_risk = [a for a in all_anomalies if 60 <= a['risk_score'] < 80]
    
    print(f"🔥 High Risk (≥80): {len(high_risk)}")
    print(f"⚠️  Medium Risk (60-79): {len(medium_risk)}")
    
    print(f"\n📋 TOP FRAUD ALERTS:")
    print("-" * 60)
    
    for i, anomaly in enumerate(all_anomalies[:10]):
        print(f"\n[{i+1}] RISK SCORE: {anomaly['risk_score']}/100")
        print(f"    🏢 Vendor: {anomaly['vendor']}")
        print(f"    💰 Amount: ${anomaly['amount']:,.2f}")
        print(f"    🚩 Type: {anomaly['type']}")
        print(f"    📝 Reason: {anomaly['reason']}")
    
    # Real-world examples by company size
    print(f"\n💡 REAL-WORLD THRESHOLD EXAMPLES:")
    print("-" * 50)
    
    print("Small Business (<$500K revenue):")
    print("  • Any payment > $2,500 → HIGH RISK")
    print("  • Round amounts $1,000, $2,000, $5,000 → MEDIUM RISK")
    print("  • Amounts $999, $1,999, $4,999 → HIGH RISK (threshold evasion)")
    
    print("\nMid-Size Company ($500K-$50M):")
    print("  • Payments > mean+3σ (typically $15K-$30K) → HIGH RISK")
    print("  • Round amounts $5,000, $10,000, $25,000 → MEDIUM RISK")
    print("  • Amounts $4,999, $9,999, $24,999 → HIGH RISK")
    
    print("\nLarge Enterprise (>$50M):")
    print("  • Single payments > $100,000 → HIGH RISK")
    print("  • Vendor taking >30% of total payments → MEDIUM RISK")
    print("  • 10+ payments in one month (vs normal 2-3) → MEDIUM RISK")
    
    print(f"\n✅ Analysis complete! This demonstrates the Enhanced Anomaly Detection in Oqualtix App.")
    
    return all_anomalies

if __name__ == "__main__":
    simple_fraud_detection_demo()