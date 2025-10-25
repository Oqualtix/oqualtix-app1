import * as CSV from 'react-native-csv';
import moment from 'moment';

// File processing and analysis utilities
export const FileProcessingUtils = {
  
  // Supported file types and their processors
  SUPPORTED_FORMATS: {
    'text/csv': 'csv',
    'application/vnd.ms-excel': 'excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
    'application/pdf': 'pdf'
  },

  // Process uploaded financial files
  processFinancialFile: async (file) => {
    try {
      const fileType = FileProcessingUtils.SUPPORTED_FORMATS[file.mimeType];
      
      if (!fileType) {
        throw new Error('Unsupported file format');
      }

      let data;
      switch (fileType) {
        case 'csv':
          data = await FileProcessingUtils.processCSV(file);
          break;
        case 'excel':
          data = await FileProcessingUtils.processExcel(file);
          break;
        case 'pdf':
          data = await FileProcessingUtils.processPDF(file);
          break;
        default:
          throw new Error('Unknown file type');
      }

      return {
        success: true,
        data,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: fileType,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fileInfo: {
          name: file.name,
          size: file.size,
          processedAt: new Date().toISOString()
        }
      };
    }
  },

  // Process CSV files
  processCSV: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const csvText = event.target.result;
          const lines = csvText.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            reject(new Error('Empty CSV file'));
            return;
          }

          // Parse header row
          const headers = FileProcessingUtils.parseCSVLine(lines[0]);
          const mappedHeaders = FileProcessingUtils.mapHeaders(headers);
          
          // Parse data rows
          const transactions = [];
          for (let i = 1; i < lines.length; i++) {
            const values = FileProcessingUtils.parseCSVLine(lines[i]);
            if (values.length >= 3) { // Minimum required fields
              const transaction = FileProcessingUtils.mapTransactionData(mappedHeaders, values);
              if (transaction) {
                transactions.push(transaction);
              }
            }
          }

          resolve({
            transactions,
            summary: {
              totalRows: lines.length - 1,
              validTransactions: transactions.length,
              headers: headers,
              mappedFields: mappedHeaders
            }
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  },

  // Process Excel files (simplified - in production use a proper Excel library)
  processExcel: async (file) => {
    // For demo purposes, we'll simulate Excel processing
    // In production, use libraries like xlsx or exceljs
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transactions: FileProcessingUtils.generateSampleTransactions(20),
          summary: {
            totalRows: 20,
            validTransactions: 20,
            sheets: ['Sheet1'],
            processedSheet: 'Sheet1'
          }
        });
      }, 1000);
    });
  },

  // Process PDF files (simplified - in production use OCR libraries)
  processPDF: async (file) => {
    // For demo purposes, we'll simulate PDF processing
    // In production, use OCR libraries like Tesseract.js
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          extractedText: 'Sample extracted text from PDF financial statement...',
          transactions: FileProcessingUtils.generateSampleTransactions(15),
          summary: {
            pages: 3,
            extractedTransactions: 15,
            confidence: 0.85
          }
        });
      }, 2000);
    });
  },

  // Parse CSV line handling quotes and commas
  parseCSVLine: (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  },

  // Map headers to standard field names
  mapHeaders: (headers) => {
    const headerMap = {};
    
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase().trim();
      
      // Date fields
      if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
        headerMap.date = index;
      }
      
      // Amount fields
      else if (lowerHeader.includes('amount') || lowerHeader.includes('value') || 
               lowerHeader.includes('sum') || lowerHeader.includes('total')) {
        headerMap.amount = index;
      }
      
      // Description fields
      else if (lowerHeader.includes('description') || lowerHeader.includes('detail') || 
               lowerHeader.includes('memo') || lowerHeader.includes('reference')) {
        headerMap.description = index;
      }
      
      // Vendor/Payee fields
      else if (lowerHeader.includes('vendor') || lowerHeader.includes('payee') || 
               lowerHeader.includes('supplier') || lowerHeader.includes('merchant')) {
        headerMap.vendor = index;
      }
      
      // Category fields
      else if (lowerHeader.includes('category') || lowerHeader.includes('type') || 
               lowerHeader.includes('class')) {
        headerMap.category = index;
      }
      
      // Account fields
      else if (lowerHeader.includes('account') || lowerHeader.includes('ledger')) {
        headerMap.account = index;
      }
      
      // Reference/Invoice fields
      else if (lowerHeader.includes('invoice') || lowerHeader.includes('reference') || 
               lowerHeader.includes('number') || lowerHeader.includes('id')) {
        headerMap.reference = index;
      }
    });
    
    return headerMap;
  },

  // Map raw data to transaction object
  mapTransactionData: (headerMap, values) => {
    try {
      // Required fields check
      if (headerMap.amount === undefined || headerMap.date === undefined) {
        return null;
      }

      const amount = FileProcessingUtils.parseAmount(values[headerMap.amount]);
      const date = FileProcessingUtils.parseDate(values[headerMap.date]);
      
      if (amount === null || date === null) {
        return null;
      }

      return {
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: date,
        amount: amount,
        description: values[headerMap.description] || 'Imported transaction',
        vendor: values[headerMap.vendor] || 'Unknown vendor',
        category: values[headerMap.category] || 'Uncategorized',
        account: values[headerMap.account] || 'Unknown account',
        reference: values[headerMap.reference] || '',
        type: amount >= 0 ? 'income' : 'expense',
        imported: true,
        importedAt: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Error mapping transaction data:', error);
      return null;
    }
  },

  // Parse amount strings to numbers
  parseAmount: (amountStr) => {
    if (!amountStr) return null;
    
    // Remove currency symbols and spaces
    const cleaned = amountStr.toString()
      .replace(/[$€£¥₹,\s]/g, '')
      .replace(/[()]/g, '')
      .trim();
    
    if (cleaned === '') return null;
    
    // Handle parentheses as negative (accounting format)
    const isNegative = amountStr.includes('(') && amountStr.includes(')');
    
    const number = parseFloat(cleaned);
    if (isNaN(number)) return null;
    
    return isNegative ? -Math.abs(number) : number;
  },

  // Parse date strings to Date objects
  parseDate: (dateStr) => {
    if (!dateStr) return null;
    
    // Try various date formats
    const formats = [
      'YYYY-MM-DD',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'MM-DD-YYYY',
      'DD-MM-YYYY',
      'YYYY/MM/DD',
      'MMM DD, YYYY',
      'DD MMM YYYY'
    ];
    
    for (const format of formats) {
      const parsed = moment(dateStr, format, true);
      if (parsed.isValid()) {
        return parsed.toDate();
      }
    }
    
    // Fallback to JavaScript's Date parsing
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  },

  // Generate sample transactions for demo
  generateSampleTransactions: (count) => {
    const transactions = [];
    const vendors = [
      'Office Depot', 'Staples Inc.', 'FedEx Corporation', 'UPS Store',
      'Microsoft Corp', 'Adobe Systems', 'Amazon Web Services', 'Google LLC',
      'Marriott Hotels', 'Hilton Worldwide', 'Enterprise Rent-A-Car',
      'Shell Oil Company', 'Exxon Mobil', 'AT&T Services', 'Verizon Wireless'
    ];
    
    const categories = [
      'Office Supplies', 'Software & IT', 'Travel & Entertainment',
      'Telecommunications', 'Fuel & Transportation', 'Professional Services',
      'Utilities', 'Equipment', 'Marketing', 'Training & Development'
    ];

    for (let i = 0; i < count; i++) {
      const isExpense = Math.random() > 0.3; // 70% expenses, 30% income
      const baseAmount = Math.random() * 5000 + 100;
      const amount = isExpense ? -baseAmount : baseAmount * 2;
      
      transactions.push({
        id: `imported_${Date.now()}_${i}`,
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        amount: Math.round(amount * 100) / 100,
        description: `${isExpense ? 'Payment to' : 'Payment from'} ${vendors[Math.floor(Math.random() * vendors.length)]}`,
        vendor: vendors[Math.floor(Math.random() * vendors.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        account: 'Business Checking',
        reference: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        type: isExpense ? 'expense' : 'income',
        imported: true,
        importedAt: new Date().toISOString()
      });
    }
    
    return transactions.sort((a, b) => b.date - a.date);
  },

  // Validate imported data quality
  validateDataQuality: (transactions) => {
    const issues = [];
    const stats = {
      totalTransactions: transactions.length,
      validDates: 0,
      validAmounts: 0,
      duplicates: 0,
      missingVendors: 0,
      roundAmounts: 0
    };

    const seenTransactions = new Set();

    transactions.forEach((transaction, index) => {
      // Date validation
      if (transaction.date && !isNaN(transaction.date.getTime())) {
        stats.validDates++;
      } else {
        issues.push({
          row: index + 1,
          field: 'date',
          issue: 'Invalid or missing date',
          severity: 'HIGH'
        });
      }

      // Amount validation
      if (typeof transaction.amount === 'number' && !isNaN(transaction.amount)) {
        stats.validAmounts++;
        
        // Check for round amounts
        if (Math.abs(transaction.amount) % 100 === 0) {
          stats.roundAmounts++;
        }
      } else {
        issues.push({
          row: index + 1,
          field: 'amount',
          issue: 'Invalid or missing amount',
          severity: 'HIGH'
        });
      }

      // Vendor validation
      if (!transaction.vendor || transaction.vendor.trim() === '' || 
          transaction.vendor === 'Unknown vendor') {
        stats.missingVendors++;
        issues.push({
          row: index + 1,
          field: 'vendor',
          issue: 'Missing vendor information',
          severity: 'MEDIUM'
        });
      }

      // Duplicate detection
      const transactionKey = `${transaction.amount}_${transaction.vendor}_${transaction.date?.toISOString()}`;
      if (seenTransactions.has(transactionKey)) {
        stats.duplicates++;
        issues.push({
          row: index + 1,
          field: 'duplicate',
          issue: 'Potential duplicate transaction',
          severity: 'MEDIUM'
        });
      } else {
        seenTransactions.add(transactionKey);
      }
    });

    const qualityScore = Math.round(
      ((stats.validDates + stats.validAmounts) / (stats.totalTransactions * 2)) * 100
    );

    return {
      qualityScore,
      stats,
      issues,
      recommendations: FileProcessingUtils.generateQualityRecommendations(stats, issues)
    };
  },

  // Generate data quality recommendations
  generateQualityRecommendations: (stats, issues) => {
    const recommendations = [];

    if (stats.validDates < stats.totalTransactions * 0.9) {
      recommendations.push('Review date formats and ensure consistency');
    }

    if (stats.validAmounts < stats.totalTransactions * 0.95) {
      recommendations.push('Verify amount formatting and currency symbols');
    }

    if (stats.missingVendors > stats.totalTransactions * 0.1) {
      recommendations.push('Enhance vendor data collection and validation');
    }

    if (stats.duplicates > 0) {
      recommendations.push('Implement duplicate detection and prevention measures');
    }

    if (stats.roundAmounts > stats.totalTransactions * 0.2) {
      recommendations.push('Investigate high percentage of round number transactions');
    }

    const highSeverityIssues = issues.filter(issue => issue.severity === 'HIGH').length;
    if (highSeverityIssues > 0) {
      recommendations.push('Address critical data quality issues before analysis');
    }

    return recommendations;
  },

  // Export analysis results
  exportAnalysisResults: (analysis, format = 'csv') => {
    switch (format) {
      case 'csv':
        return FileProcessingUtils.exportToCSV(analysis);
      case 'json':
        return FileProcessingUtils.exportToJSON(analysis);
      default:
        throw new Error('Unsupported export format');
    }
  },

  // Export to CSV format
  exportToCSV: (analysis) => {
    const headers = ['Finding Type', 'Severity', 'Description', 'Recommendation'];
    const rows = [headers];

    analysis.findings.forEach(finding => {
      rows.push([
        finding.type,
        finding.severity,
        finding.description,
        finding.recommendation
      ]);
    });

    return rows.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`)
         .join(',')
    ).join('\n');
  },

  // Export to JSON format
  exportToJSON: (analysis) => {
    return JSON.stringify(analysis, null, 2);
  }
};

export default FileProcessingUtils;