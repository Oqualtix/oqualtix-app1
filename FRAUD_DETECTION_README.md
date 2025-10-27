# Enhanced Fraud Detection Analyzer

This script demonstrates the anomaly detection capabilities of the **Oqualtix App**. It implements the same statistical and pattern-based fraud detection algorithms used in the mobile application.

## Features

### Detection Methods
- **Statistical Outliers**: Identifies transactions exceeding mean + 3σ per vendor
- **Round Dollar Patterns**: Flags suspicious round-number transactions
- **Threshold Evasion**: Detects payments just under approval limits
- **Frequency Anomalies**: Spots unusual payment frequency spikes
- **Vendor Concentration**: Identifies vendors receiving disproportionate payments

### Sample Fraud Patterns Included
The script generates realistic sample data with embedded fraud patterns:

1. **Statistical Outliers**: 
   - Normal vendor payments ~$800 ± $200
   - Fraudulent payments: $15,000, $22,500, $18,750 (embezzlement)

2. **Round Dollar Fraud**:
   - Suspicious amounts: $5,000, $10,000, $15,000
   - Often indicates invoice manipulation

3. **Threshold Evasion**:
   - Payments: $4,999, $9,999, $24,999
   - Just under $5K, $10K, $25K approval limits

4. **Frequency Structuring**:
   - 15 small payments in one month (vs. normal 2-3)
   - Total $3,000-$9,000 split to avoid detection

## Usage

### Quick Demo
```bash
python fraud_detection_analyzer.py
```

### Using Your Own Data
```python
from fraud_detection_analyzer import FraudDetectionAnalyzer

# Load your CSV data
analyzer = FraudDetectionAnalyzer(sigma_threshold=3.0, min_transactions=5)
analyzer.load_data('your_transactions.csv')
anomalies = analyzer.run_full_analysis()
analyzer.print_summary()
analyzer.export_results('fraud_results.csv')
```

### CSV Format Required
Your transaction data should have these columns:
```csv
date,vendor,amount,description,payment_method
2025-01-15,Office Supplies Inc,459.32,Monthly office supplies,Credit Card
2025-01-18,Suspicious Vendor A,15000.00,Special project payment,Wire Transfer
```

## Expected Results

When you run the demo, you'll see output like:

```
🔍 Running Enhanced Fraud Detection Analysis...
📊 Analyzing 156 transactions across 13 vendors
💰 Total amount: $234,567.89

🚨 FRAUD DETECTION SUMMARY
📋 Total anomalies detected: 23

📊 Anomalies by type:
   • Statistical Outlier: 3
   • Round Dollar Pattern: 5
   • Threshold Evasion: 6
   • Frequency Spike: 1
   • Vendor Concentration: 1

🔥 High-risk anomalies (score ≥ 80): 8

TOP 10 HIGHEST RISK ANOMALIES
================================================================================

[1] RISK SCORE: 95/100
    📅 Date: 2025-10-15
    🏢 Vendor: Suspicious Vendor A
    💰 Amount: $22,500.00
    📝 Description: Special project payment
    🚩 Type: Statistical Outlier
    ⚠️  Reason: Amount $22,500.00 exceeds vendor threshold $1,426.50 (26.3σ above mean)
```

## Real-World Thresholds

Based on company size, these dollar amounts typically trigger alerts:

### Small Business (<$500K revenue)
- Single payment > $2,500: **High Risk**
- Round amounts > $1,000: **Medium Risk**
- Threshold evasion $999, $2,499: **High Risk**

### Mid-Size Company ($500K-$50M)
- Single payment > mean + 3σ (typically $15K-$30K): **High Risk**
- Round amounts > $5,000: **Medium Risk**
- Threshold evasion $4,999, $9,999: **High Risk**

### Large Enterprise (>$50M)
- Single payment > $100K or mean + 3σ: **High Risk**
- Vendor concentration > 30%: **Medium Risk**
- Frequency spike 3x normal: **Medium Risk**

## Integration with Oqualtix App

This script demonstrates the algorithms running inside the Oqualtix mobile app:

1. **Real-time Analysis**: App runs these checks on new transactions
2. **Push Notifications**: High-risk anomalies trigger immediate alerts
3. **AI Enhancement**: TensorFlow.js models further refine risk scores
4. **Dashboard Visualization**: Results displayed in user-friendly charts

## Dependencies

```bash
pip install pandas numpy
```

## Files Generated

- `oqualtix_fraud_anomalies.csv`: Detailed anomaly report
- Console output: Human-readable summary

---

**Oqualtix Forensic Accounting Platform**  
*Advanced AI-Powered Fraud Detection*