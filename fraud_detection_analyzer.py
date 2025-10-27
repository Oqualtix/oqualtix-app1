#!/usr/bin/env python3
"""
Enhanced Fraud Detection Analyzer
Computes per-vendor mean/sigma and identifies anomalous transactions using multiple detection methods.
Demonstrates the Oqualtix App's anomaly detection capabilities.
"""

import pandas as pd
import numpy as np
import datetime
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')

class FraudDetectionAnalyzer:
    def __init__(self, sigma_threshold: float = 3.0, min_transactions: int = 5):
        """
        Initialize the fraud detection analyzer.
        
        Args:
            sigma_threshold: Number of standard deviations for outlier detection
            min_transactions: Minimum transactions needed per vendor for statistical analysis
        """
        self.sigma_threshold = sigma_threshold
        self.min_transactions = min_transactions
        self.vendor_stats = {}
        self.anomalies = []
        
    def load_data(self, csv_file: str = None, data: pd.DataFrame = None) -> pd.DataFrame:
        """Load transaction data from CSV file or DataFrame."""
        if data is not None:
            self.df = data.copy()
        elif csv_file:
            self.df = pd.read_csv(csv_file)
        else:
            raise ValueError("Must provide either csv_file or data DataFrame")
            
        # Ensure required columns exist
        required_cols = ['date', 'amount', 'vendor', 'description', 'payment_method']
        missing_cols = [col for col in required_cols if col not in self.df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
            
        # Convert date column and sort
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.df = self.df.sort_values('date').reset_index(drop=True)
        
        return self.df
    
    def compute_vendor_statistics(self) -> Dict[str, Dict[str, float]]:
        """Compute mean, std deviation, and other stats per vendor."""
        print("Computing per-vendor statistics...")
        
        vendor_stats = {}
        for vendor in self.df['vendor'].unique():
            vendor_data = self.df[self.df['vendor'] == vendor]['amount']
            
            if len(vendor_data) >= self.min_transactions:
                stats = {
                    'count': len(vendor_data),
                    'mean': vendor_data.mean(),
                    'std': vendor_data.std(),
                    'median': vendor_data.median(),
                    'min': vendor_data.min(),
                    'max': vendor_data.max(),
                    'q25': vendor_data.quantile(0.25),
                    'q75': vendor_data.quantile(0.75),
                    'iqr': vendor_data.quantile(0.75) - vendor_data.quantile(0.25),
                    'threshold_3sigma': vendor_data.mean() + (self.sigma_threshold * vendor_data.std())
                }
                vendor_stats[vendor] = stats
                
        self.vendor_stats = vendor_stats
        return vendor_stats
    
    def detect_statistical_outliers(self) -> List[Dict[str, Any]]:
        """Detect transactions that exceed mean + 3σ threshold."""
        print("Detecting statistical outliers (mean + 3σ method)...")
        
        outliers = []
        for _, row in self.df.iterrows():
            vendor = row['vendor']
            amount = row['amount']
            
            if vendor in self.vendor_stats:
                stats = self.vendor_stats[vendor]
                threshold = stats['threshold_3sigma']
                
                if amount > threshold:
                    sigma_multiplier = (amount - stats['mean']) / stats['std'] if stats['std'] > 0 else 0
                    outlier = {
                        'transaction_id': row.get('transaction_id', f"txn_{row.name}"),
                        'date': row['date'],
                        'vendor': vendor,
                        'amount': amount,
                        'description': row['description'],
                        'anomaly_type': 'Statistical Outlier',
                        'risk_score': min(100, max(0, (sigma_multiplier - 3) * 20 + 70)),
                        'reason': f"Amount ${amount:,.2f} exceeds vendor threshold ${threshold:,.2f} ({sigma_multiplier:.1f}σ above mean)",
                        'vendor_mean': stats['mean'],
                        'vendor_std': stats['std'],
                        'sigma_multiplier': sigma_multiplier
                    }
                    outliers.append(outlier)
        
        return outliers
    
    def detect_round_dollar_patterns(self) -> List[Dict[str, Any]]:
        """Detect suspicious round dollar amounts and threshold evasion."""
        print("Detecting round dollar patterns and threshold evasion...")
        
        suspicious_patterns = []
        
        # Common approval thresholds
        thresholds = [1000, 2500, 5000, 10000, 25000, 50000]
        
        for _, row in self.df.iterrows():
            amount = row['amount']
            
            # Check for round dollar amounts
            if amount % 100 == 0 and amount >= 1000:
                risk_score = 40 + (amount / 10000)  # Higher amounts = higher risk
                pattern = {
                    'transaction_id': row.get('transaction_id', f"txn_{row.name}"),
                    'date': row['date'],
                    'vendor': row['vendor'],
                    'amount': amount,
                    'description': row['description'],
                    'anomaly_type': 'Round Dollar Pattern',
                    'risk_score': min(85, risk_score),
                    'reason': f"Suspicious round dollar amount: ${amount:,.2f}",
                }
                suspicious_patterns.append(pattern)
            
            # Check for threshold evasion (amounts just under common thresholds)
            for threshold in thresholds:
                if threshold - 100 <= amount < threshold:
                    pattern = {
                        'transaction_id': row.get('transaction_id', f"txn_{row.name}"),
                        'date': row['date'],
                        'vendor': row['vendor'],
                        'amount': amount,
                        'description': row['description'],
                        'anomaly_type': 'Threshold Evasion',
                        'risk_score': 80,
                        'reason': f"Amount ${amount:,.2f} just under ${threshold:,} threshold (possible approval evasion)",
                    }
                    suspicious_patterns.append(pattern)
                    break
        
        return suspicious_patterns
    
    def detect_frequency_anomalies(self) -> List[Dict[str, Any]]:
        """Detect vendors with unusual payment frequency patterns."""
        print("Detecting payment frequency anomalies...")
        
        frequency_anomalies = []
        
        # Group by vendor and month
        self.df['year_month'] = self.df['date'].dt.to_period('M')
        monthly_counts = self.df.groupby(['vendor', 'year_month']).size().reset_index(name='transaction_count')
        
        for vendor in monthly_counts['vendor'].unique():
            vendor_monthly = monthly_counts[monthly_counts['vendor'] == vendor]['transaction_count']
            
            if len(vendor_monthly) >= 3:  # Need at least 3 months of data
                mean_freq = vendor_monthly.mean()
                std_freq = vendor_monthly.std()
                
                if std_freq > 0:
                    for _, row in monthly_counts[monthly_counts['vendor'] == vendor].iterrows():
                        count = row['transaction_count']
                        if count > mean_freq + (2 * std_freq) and count >= 10:  # Unusual spike
                            anomaly = {
                                'transaction_id': f"freq_{vendor}_{row['year_month']}",
                                'date': f"{row['year_month']}",
                                'vendor': vendor,
                                'amount': 0,  # Frequency anomaly, not amount-based
                                'description': f"High frequency month: {count} transactions",
                                'anomaly_type': 'Frequency Spike',
                                'risk_score': min(90, 50 + (count - mean_freq) * 5),
                                'reason': f"Unusual payment frequency: {count} transactions vs. typical {mean_freq:.1f} per month",
                            }
                            frequency_anomalies.append(anomaly)
        
        return frequency_anomalies
    
    def detect_vendor_concentration(self, concentration_threshold: float = 0.3) -> List[Dict[str, Any]]:
        """Detect vendors receiving unusually high percentage of total payments."""
        print("Detecting vendor concentration anomalies...")
        
        concentration_anomalies = []
        
        total_amount = self.df['amount'].sum()
        vendor_totals = self.df.groupby('vendor')['amount'].sum().sort_values(ascending=False)
        
        for vendor, total in vendor_totals.items():
            concentration = total / total_amount
            
            if concentration > concentration_threshold:
                anomaly = {
                    'transaction_id': f"conc_{vendor}",
                    'date': 'Overall Period',
                    'vendor': vendor,
                    'amount': total,
                    'description': f"High vendor concentration: {concentration:.1%} of total payments",
                    'anomaly_type': 'Vendor Concentration',
                    'risk_score': min(95, 60 + (concentration * 100)),
                    'reason': f"Vendor receives {concentration:.1%} of all payments (${total:,.2f} of ${total_amount:,.2f})",
                }
                concentration_anomalies.append(anomaly)
        
        return concentration_anomalies
    
    def run_full_analysis(self) -> List[Dict[str, Any]]:
        """Run all anomaly detection methods and return combined results."""
        print("\n🔍 Running Enhanced Fraud Detection Analysis...")
        print(f"📊 Analyzing {len(self.df)} transactions across {self.df['vendor'].nunique()} vendors")
        print(f"📅 Date range: {self.df['date'].min().date()} to {self.df['date'].max().date()}")
        print(f"💰 Total amount: ${self.df['amount'].sum():,.2f}")
        print("-" * 60)
        
        # Compute vendor statistics first
        self.compute_vendor_statistics()
        
        # Run all detection methods
        all_anomalies = []
        
        # 1. Statistical outliers (mean + 3σ)
        outliers = self.detect_statistical_outliers()
        all_anomalies.extend(outliers)
        
        # 2. Round dollar patterns and threshold evasion
        round_patterns = self.detect_round_dollar_patterns()
        all_anomalies.extend(round_patterns)
        
        # 3. Frequency anomalies
        freq_anomalies = self.detect_frequency_anomalies()
        all_anomalies.extend(freq_anomalies)
        
        # 4. Vendor concentration
        conc_anomalies = self.detect_vendor_concentration()
        all_anomalies.extend(conc_anomalies)
        
        # Sort by risk score (highest first)
        all_anomalies.sort(key=lambda x: x['risk_score'], reverse=True)
        
        self.anomalies = all_anomalies
        return all_anomalies
    
    def print_summary(self):
        """Print a summary of the analysis results."""
        if not self.anomalies:
            print("No anomalies detected.")
            return
            
        print(f"\n🚨 FRAUD DETECTION SUMMARY")
        print(f"📋 Total anomalies detected: {len(self.anomalies)}")
        
        # Group by anomaly type
        type_counts = {}
        for anomaly in self.anomalies:
            atype = anomaly['anomaly_type']
            type_counts[atype] = type_counts.get(atype, 0) + 1
        
        print("\n📊 Anomalies by type:")
        for atype, count in type_counts.items():
            print(f"   • {atype}: {count}")
        
        # Show high-risk anomalies (risk score >= 80)
        high_risk = [a for a in self.anomalies if a['risk_score'] >= 80]
        print(f"\n🔥 High-risk anomalies (score ≥ 80): {len(high_risk)}")
        
        print("\n" + "="*80)
        print("TOP 10 HIGHEST RISK ANOMALIES")
        print("="*80)
        
        for i, anomaly in enumerate(self.anomalies[:10]):
            print(f"\n[{i+1}] RISK SCORE: {anomaly['risk_score']:.0f}/100")
            print(f"    📅 Date: {anomaly['date']}")
            print(f"    🏢 Vendor: {anomaly['vendor']}")
            print(f"    💰 Amount: ${anomaly['amount']:,.2f}")
            print(f"    📝 Description: {anomaly['description']}")
            print(f"    🚩 Type: {anomaly['anomaly_type']}")
            print(f"    ⚠️  Reason: {anomaly['reason']}")
    
    def export_results(self, filename: str = "fraud_anomalies.csv"):
        """Export anomaly results to CSV file."""
        if self.anomalies:
            df_anomalies = pd.DataFrame(self.anomalies)
            df_anomalies.to_csv(filename, index=False)
            print(f"\n💾 Results exported to {filename}")
        else:
            print("No anomalies to export.")

# Sample data generator for demonstration
def generate_sample_data() -> pd.DataFrame:
    """Generate realistic sample transaction data with embedded fraud patterns."""
    np.random.seed(42)  # For reproducible results
    
    vendors = [
        "Office Supplies Inc", "Tech Solutions LLC", "Catering Services", 
        "Legal Associates", "Marketing Agency", "Facility Management",
        "IT Support Co", "Consulting Group", "Travel Agency", "Equipment Rental",
        "Suspicious Vendor A", "Shell Company B", "Round Dollar Corp"
    ]
    
    payment_methods = ["ACH", "Check", "Wire Transfer", "Credit Card", "Electronic"]
    
    transactions = []
    
    # Generate normal transactions for most vendors
    for vendor in vendors[:10]:  # First 10 are legitimate
        # Each vendor has typical payment range
        if "Office" in vendor:
            base_amount = 500
            variation = 200
        elif "Tech" in vendor or "IT" in vendor:
            base_amount = 2000
            variation = 800
        elif "Legal" in vendor or "Consulting" in vendor:
            base_amount = 3500
            variation = 1500
        elif "Marketing" in vendor:
            base_amount = 1200
            variation = 600
        else:
            base_amount = 800
            variation = 400
        
        # Generate 15-25 normal transactions per vendor
        num_transactions = np.random.randint(15, 26)
        
        for _ in range(num_transactions):
            # Normal distribution around base amount
            amount = max(50, np.random.normal(base_amount, variation))
            
            # Random date in the last 6 months
            days_ago = np.random.randint(0, 180)
            date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
            
            transactions.append({
                'transaction_id': f"TXN{len(transactions)+1:04d}",
                'date': date.strftime('%Y-%m-%d'),
                'vendor': vendor,
                'amount': round(amount, 2),
                'description': f"Services from {vendor}",
                'payment_method': np.random.choice(payment_methods)
            })
    
    # Add fraudulent patterns
    
    # 1. Statistical outliers - Suspicious Vendor A gets some huge payments
    fraud_vendor = "Suspicious Vendor A"
    # Normal payments first
    for _ in range(8):
        amount = np.random.normal(800, 200)
        days_ago = np.random.randint(30, 150)
        date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        transactions.append({
            'transaction_id': f"TXN{len(transactions)+1:04d}",
            'date': date.strftime('%Y-%m-%d'),
            'vendor': fraud_vendor,
            'amount': round(amount, 2),
            'description': f"Regular services from {fraud_vendor}",
            'payment_method': np.random.choice(payment_methods)
        })
    
    # Then add massive outliers (embezzlement)
    outlier_amounts = [15000, 22500, 18750]  # Way above normal ~$800
    for amount in outlier_amounts:
        days_ago = np.random.randint(0, 60)
        date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        transactions.append({
            'transaction_id': f"TXN{len(transactions)+1:04d}",
            'date': date.strftime('%Y-%m-%d'),
            'vendor': fraud_vendor,
            'amount': amount,
            'description': f"Special project payment - {fraud_vendor}",
            'payment_method': "Wire Transfer"
        })
    
    # 2. Round dollar fraud - Shell Company B
    shell_vendor = "Shell Company B"
    round_amounts = [5000, 10000, 15000, 7500, 12500]
    for amount in round_amounts:
        days_ago = np.random.randint(10, 90)
        date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        transactions.append({
            'transaction_id': f"TXN{len(transactions)+1:04d}",
            'date': date.strftime('%Y-%m-%d'),
            'vendor': shell_vendor,
            'amount': amount,
            'description': f"Consulting services - exact amount",
            'payment_method': "Check"
        })
    
    # 3. Threshold evasion - Round Dollar Corp
    threshold_vendor = "Round Dollar Corp"
    # Payments just under common thresholds
    evasion_amounts = [4999, 9999, 4950, 9900, 4999, 24999]
    for amount in evasion_amounts:
        days_ago = np.random.randint(5, 120)
        date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        transactions.append({
            'transaction_id': f"TXN{len(transactions)+1:04d}",
            'date': date.strftime('%Y-%m-%d'),
            'vendor': threshold_vendor,
            'amount': amount,
            'description': f"Equipment purchase - just under limit",
            'payment_method': "Electronic"
        })
    
    # 4. Frequency spike - Office Supplies Inc gets unusual activity
    # Add many small transactions in recent month (structuring)
    for _ in range(15):  # 15 extra transactions = suspicious frequency
        amount = np.random.uniform(200, 600)
        days_ago = np.random.randint(0, 30)  # All in last month
        date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        transactions.append({
            'transaction_id': f"TXN{len(transactions)+1:04d}",
            'date': date.strftime('%Y-%m-%d'),
            'vendor': "Office Supplies Inc",
            'amount': round(amount, 2),
            'description': "Small office supplies order",
            'payment_method': "Credit Card"
        })
    
    # Convert to DataFrame
    df = pd.DataFrame(transactions)
    return df


if __name__ == "__main__":
    # Demo the fraud detection system
    print("🔍 Oqualtix Enhanced Fraud Detection Analyzer")
    print("=" * 50)
    
    # Generate sample data with embedded fraud
    print("📊 Generating sample transaction data with embedded fraud patterns...")
    sample_data = generate_sample_data()
    
    # Initialize analyzer
    analyzer = FraudDetectionAnalyzer(sigma_threshold=3.0, min_transactions=5)
    
    # Load and analyze data
    analyzer.load_data(data=sample_data)
    anomalies = analyzer.run_full_analysis()
    
    # Print summary
    analyzer.print_summary()
    
    # Export results
    analyzer.export_results("oqualtix_fraud_anomalies.csv")
    
    print(f"\n✅ Analysis complete! Found {len(anomalies)} potential fraud indicators.")
    print("💡 This demonstrates the Enhanced Anomaly Detection system used in the Oqualtix app.")