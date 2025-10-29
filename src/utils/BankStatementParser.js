/**
 * Bank Statement Parser
 * Supports multiple formats: CSV, OFX, QIF, JSON, and text parsing
 * Specifically designed for fraud detection and financial analysis
 */

import fs from 'fs';
import path from 'path';
import moment from 'moment';

class BankStatementParser {
  constructor() {
    this.supportedFormats = ['csv', 'ofx', 'qif', 'json', 'txt'];
    this.parsedStatements = [];
  }

  // Main parsing method - detects format and routes to appropriate parser
  async parseStatement(filePath, options = {}) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileExtension = path.extname(filePath).toLowerCase().replace('.', '');
      const fileContent = fs.readFileSync(filePath, 'utf8');

      console.log(`📄 Parsing ${fileExtension.toUpperCase()} bank statement: ${path.basename(filePath)}`);

      let statements = [];

      switch (fileExtension) {
        case 'csv':
          statements = this.parseCSV(fileContent, options);
          break;
        case 'ofx':
          statements = this.parseOFX(fileContent, options);
          break;
        case 'qif':
          statements = this.parseQIF(fileContent, options);
          break;
        case 'json':
          statements = this.parseJSON(fileContent, options);
          break;
        case 'txt':
          statements = this.parseText(fileContent, options);
          break;
        default:
          // Auto-detect format based on content
          statements = this.autoDetectAndParse(fileContent, options);
      }

      this.parsedStatements = statements;
      console.log(`✅ Successfully parsed ${statements.length} transactions`);
      
      return statements;

    } catch (error) {
      console.error(`❌ Error parsing bank statement: ${error.message}`);
      throw error;
    }
  }

  // Parse CSV format bank statements
  parseCSV(csvContent, options = {}) {
    const statements = [];
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return statements;

    // Detect CSV format by examining headers
    const headers = this.parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const columnMap = this.detectCSVColumns(headers);

    console.log(`🔍 Detected CSV columns:`, columnMap);

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          console.warn(`⚠️  Line ${i + 1}: Column count mismatch`);
          continue;
        }

        const statement = this.mapCSVRowToStatement(values, columnMap, options);
        if (statement && statement.amount !== 0) {
          statements.push(statement);
        }
      } catch (error) {
        console.warn(`⚠️  Line ${i + 1}: Parse error - ${error.message}`);
      }
    }

    return statements;
  }

  // Parse CSV line handling quoted fields and commas
  parseCSVLine(line) {
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
  }

  // Detect CSV column mapping based on common bank statement headers
  detectCSVColumns(headers) {
    const columnMap = {};

    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Date columns
      if (['date', 'transactiondate', 'postdate', 'effectivedate', 'datetime'].includes(cleanHeader)) {
        columnMap.date = index;
      }
      
      // Description columns
      if (['description', 'memo', 'reference', 'details', 'narrative', 'payee'].includes(cleanHeader)) {
        columnMap.description = index;
      }
      
      // Amount columns
      if (['amount', 'transactionamount', 'value', 'sum'].includes(cleanHeader)) {
        columnMap.amount = index;
      }
      
      // Debit columns
      if (['debit', 'withdrawal', 'out', 'debits', 'outgoing'].includes(cleanHeader)) {
        columnMap.debit = index;
      }
      
      // Credit columns
      if (['credit', 'deposit', 'in', 'credits', 'incoming'].includes(cleanHeader)) {
        columnMap.credit = index;
      }
      
      // Balance columns
      if (['balance', 'runningbalance', 'accountbalance', 'currentbalance'].includes(cleanHeader)) {
        columnMap.balance = index;
      }
      
      // Type columns
      if (['type', 'transactiontype', 'category', 'classification'].includes(cleanHeader)) {
        columnMap.type = index;
      }
      
      // Reference columns
      if (['reference', 'refnumber', 'referencenumber', 'checknum', 'checknumber'].includes(cleanHeader)) {
        columnMap.reference = index;
      }
      
      // Account columns
      if (['account', 'accountnumber', 'accountno'].includes(cleanHeader)) {
        columnMap.account = index;
      }
    });

    return columnMap;
  }

  // Map CSV row data to standardized statement object
  mapCSVRowToStatement(values, columnMap, options) {
    const statement = {
      id: Math.random().toString(36).substr(2, 9),
      date: null,
      description: 'Unknown Transaction',
      amount: 0,
      balance: null,
      type: 'UNKNOWN',
      account: 'UNKNOWN',
      vendor: null,
      category: null,
      checkNumber: null,
      originalRecord: values
    };

    try {
      // Extract date
      if (columnMap.date !== undefined) {
        statement.date = this.parseDate(values[columnMap.date]);
      }

      // Extract description
      if (columnMap.description !== undefined) {
        statement.description = values[columnMap.description] || 'Unknown Transaction';
      }

      // Extract amount (handle separate debit/credit or combined amount)
      if (columnMap.amount !== undefined) {
        statement.amount = this.parseAmount(values[columnMap.amount]);
      } else if (columnMap.debit !== undefined && columnMap.credit !== undefined) {
        const debit = this.parseAmount(values[columnMap.debit]) || 0;
        const credit = this.parseAmount(values[columnMap.credit]) || 0;
        statement.amount = credit - debit; // Credits positive, debits negative
      }

      // Extract balance
      if (columnMap.balance !== undefined) {
        statement.balance = this.parseAmount(values[columnMap.balance]);
      }

      // Extract other fields
      if (columnMap.type !== undefined) {
        statement.type = values[columnMap.type] || 'UNKNOWN';
      }

      if (columnMap.account !== undefined) {
        statement.account = values[columnMap.account] || 'UNKNOWN';
      }

      if (columnMap.reference !== undefined) {
        const ref = values[columnMap.reference];
        if (ref && ref.match(/^\d+$/)) {
          statement.checkNumber = ref;
        }
      }

      // Attempt to extract vendor from description
      statement.vendor = this.extractVendorFromDescription(statement.description);

      return statement;

    } catch (error) {
      console.warn(`Error mapping CSV row:`, error.message);
      return null;
    }
  }

  // Parse OFX format (Open Financial Exchange)
  parseOFX(ofxContent, options = {}) {
    const statements = [];
    
    try {
      // Extract transaction data from OFX tags
      const transactionMatches = ofxContent.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/g);
      
      if (!transactionMatches) {
        console.warn('No transactions found in OFX file');
        return statements;
      }

      transactionMatches.forEach((txnData, index) => {
        try {
          const statement = {
            id: this.extractOFXValue(txnData, 'FITID') || `OFX_${index}`,
            date: this.parseDate(this.extractOFXValue(txnData, 'DTPOSTED')),
            description: this.extractOFXValue(txnData, 'NAME') || this.extractOFXValue(txnData, 'MEMO') || 'OFX Transaction',
            amount: parseFloat(this.extractOFXValue(txnData, 'TRNAMT') || '0'),
            type: this.extractOFXValue(txnData, 'TRNTYPE') || 'UNKNOWN',
            checkNumber: this.extractOFXValue(txnData, 'CHECKNUM') || null,
            vendor: null,
            category: null,
            balance: null,
            account: 'OFX_ACCOUNT',
            originalRecord: txnData
          };

          statement.vendor = this.extractVendorFromDescription(statement.description);
          statements.push(statement);

        } catch (error) {
          console.warn(`Error parsing OFX transaction ${index}:`, error.message);
        }
      });

    } catch (error) {
      console.error('Error parsing OFX content:', error.message);
    }

    return statements;
  }

  // Extract value from OFX tag
  extractOFXValue(content, tagName) {
    const regex = new RegExp(`<${tagName}>([^<]*)`);
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  // Parse QIF format (Quicken Interchange Format)
  parseQIF(qifContent, options = {}) {
    const statements = [];
    const transactions = qifContent.split('^').filter(t => t.trim());

    transactions.forEach((txnData, index) => {
      try {
        const lines = txnData.split('\n').filter(l => l.trim());
        const statement = {
          id: `QIF_${index}`,
          date: null,
          description: 'QIF Transaction',
          amount: 0,
          balance: null,
          type: 'UNKNOWN',
          account: 'QIF_ACCOUNT',
          vendor: null,
          category: null,
          checkNumber: null,
          originalRecord: txnData
        };

        lines.forEach(line => {
          const code = line.charAt(0);
          const value = line.substring(1).trim();

          switch (code) {
            case 'D': // Date
              statement.date = this.parseDate(value);
              break;
            case 'T': // Amount
              statement.amount = this.parseAmount(value);
              break;
            case 'P': // Payee
            case 'M': // Memo
              statement.description = value || statement.description;
              break;
            case 'N': // Check number
              statement.checkNumber = value;
              break;
            case 'L': // Category
              statement.category = value;
              break;
          }
        });

        statement.vendor = this.extractVendorFromDescription(statement.description);
        if (statement.amount !== 0) {
          statements.push(statement);
        }

      } catch (error) {
        console.warn(`Error parsing QIF transaction ${index}:`, error.message);
      }
    });

    return statements;
  }

  // Parse JSON format
  parseJSON(jsonContent, options = {}) {
    try {
      const data = JSON.parse(jsonContent);
      
      if (Array.isArray(data)) {
        return data.map((item, index) => this.normalizeJSONTransaction(item, index));
      } else if (data.transactions && Array.isArray(data.transactions)) {
        return data.transactions.map((item, index) => this.normalizeJSONTransaction(item, index));
      } else {
        throw new Error('JSON format not recognized');
      }
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      return [];
    }
  }

  // Normalize JSON transaction to standard format
  normalizeJSONTransaction(jsonTx, index) {
    return {
      id: jsonTx.id || jsonTx.transactionId || `JSON_${index}`,
      date: this.parseDate(jsonTx.date || jsonTx.transactionDate || jsonTx.dateTime),
      description: jsonTx.description || jsonTx.memo || jsonTx.payee || 'JSON Transaction',
      amount: this.parseAmount(jsonTx.amount || jsonTx.transactionAmount || 0),
      balance: this.parseAmount(jsonTx.balance || jsonTx.runningBalance),
      type: jsonTx.type || jsonTx.transactionType || 'UNKNOWN',
      account: jsonTx.account || jsonTx.accountNumber || 'JSON_ACCOUNT',
      vendor: jsonTx.vendor || jsonTx.merchant || this.extractVendorFromDescription(jsonTx.description || ''),
      category: jsonTx.category || jsonTx.classification,
      checkNumber: jsonTx.checkNumber || jsonTx.checkNum,
      originalRecord: jsonTx
    };
  }

  // Parse text format (attempt to extract structured data)
  parseText(textContent, options = {}) {
    const statements = [];
    const lines = textContent.split('\n').filter(line => line.trim());

    // Try to detect patterns in text format
    lines.forEach((line, index) => {
      try {
        // Look for date patterns and amounts
        const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        const amountMatch = line.match(/\$?([\d,]+\.?\d*)/);

        if (dateMatch && amountMatch) {
          const statement = {
            id: `TXT_${index}`,
            date: this.parseDate(dateMatch[1]),
            description: line.replace(dateMatch[0], '').replace(amountMatch[0], '').trim() || 'Text Transaction',
            amount: this.parseAmount(amountMatch[1]),
            balance: null,
            type: 'TEXT_PARSED',
            account: 'TEXT_ACCOUNT',
            vendor: null,
            category: null,
            checkNumber: null,
            originalRecord: line
          };

          statement.vendor = this.extractVendorFromDescription(statement.description);
          statements.push(statement);
        }
      } catch (error) {
        console.warn(`Error parsing text line ${index}:`, error.message);
      }
    });

    return statements;
  }

  // Auto-detect format and parse
  autoDetectAndParse(content, options = {}) {
    console.log('🔍 Auto-detecting file format...');

    // Check for OFX
    if (content.includes('<OFX>') || content.includes('<STMTTRN>')) {
      console.log('📄 Detected OFX format');
      return this.parseOFX(content, options);
    }

    // Check for QIF
    if (content.includes('^') && /^[DTPMNL]/.test(content)) {
      console.log('📄 Detected QIF format');
      return this.parseQIF(content, options);
    }

    // Check for JSON
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      console.log('📄 Detected JSON format');
      return this.parseJSON(content, options);
    }

    // Check for CSV (contains commas and structured data)
    if (content.includes(',') && content.split('\n').length > 1) {
      console.log('📄 Detected CSV format');
      return this.parseCSV(content, options);
    }

    // Default to text parsing
    console.log('📄 Using text parsing as fallback');
    return this.parseText(content, options);
  }

  // Utility methods
  parseDate(dateString) {
    if (!dateString) return null;
    
    // Handle various date formats
    const formats = [
      'YYYY-MM-DD',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'MM-DD-YYYY',
      'DD-MM-YYYY',
      'YYYY/MM/DD',
      'YYYYMMDD'
    ];

    for (const format of formats) {
      const parsed = moment(dateString, format);
      if (parsed.isValid()) {
        return parsed.format('YYYY-MM-DD HH:mm:ss');
      }
    }

    // Fallback to natural language parsing
    const parsed = moment(dateString);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : null;
  }

  parseAmount(amountString) {
    if (!amountString) return 0;
    
    // Clean up amount string
    const cleaned = amountString.toString()
      .replace(/[$,\s]/g, '')
      .replace(/[()]/g, '-'); // Handle negative amounts in parentheses

    const amount = parseFloat(cleaned);
    return isNaN(amount) ? 0 : amount;
  }

  extractVendorFromDescription(description) {
    if (!description) return null;

    // Remove common banking terms
    const cleaned = description
      .replace(/\b(payment|deposit|withdrawal|transfer|fee|charge)\b/gi, '')
      .replace(/\b(to|from|at|via)\b/gi, '')
      .replace(/[#\d]/g, '')
      .trim();

    // Return first meaningful word(s)
    const words = cleaned.split(/\s+/).filter(word => word.length > 2);
    return words.slice(0, 3).join(' ') || null;
  }

  // Generate sample bank statement files for testing
  generateSampleCSV(filename = 'sample_bank_statement.csv') {
    const csvContent = `Date,Description,Amount,Balance,Type,Reference
2024-01-15,Office Rent Payment,-2500.00,45000.00,RENT,CHK001
2024-01-16,Client Payment Deposit,15000.00,60000.00,DEPOSIT,DEP001
2024-01-17,Utility Bill - Electric,-150.75,59849.25,UTILITY,AUTO001
2024-01-18,Processing Fee,-0.015,59849.235,FEE,PROC001
2024-01-18,Processing Fee,-0.021,59849.214,FEE,PROC002
2024-01-19,Software License,-899.99,58949.224,SOFTWARE,CHK002
2024-01-20,Micro Processing Fee,-0.007,58949.217,FEE,PROC003`;

    fs.writeFileSync(filename, csvContent);
    console.log(`✅ Generated sample CSV: ${filename}`);
    return filename;
  }

  generateSampleOFX(filename = 'sample_bank_statement.ofx') {
    const ofxContent = `OFXHEADER:100
DATA:OFXSGML
VERSION:102

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>USD
<BANKACCTFROM>
<BANKID>123456789
<ACCTID>9876543210
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20240101
<DTEND>20240131

<STMTTRN>
<TRNTYPE>PAYMENT
<DTPOSTED>20240115
<TRNAMT>-2500.00
<FITID>TXN001
<NAME>Office Rent Payment
</STMTTRN>

<STMTTRN>
<TRNTYPE>DEPOSIT
<DTPOSTED>20240116
<TRNAMT>15000.00
<FITID>TXN002
<NAME>Client Payment Deposit
</STMTTRN>

<STMTTRN>
<TRNTYPE>FEE
<DTPOSTED>20240118
<TRNAMT>-0.015
<FITID>TXN003
<NAME>Processing Fee
</STMTTRN>

</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

    fs.writeFileSync(filename, ofxContent);
    console.log(`✅ Generated sample OFX: ${filename}`);
    return filename;
  }
}

export default BankStatementParser;