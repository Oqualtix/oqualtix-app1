import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const TemplateGenerator = {
  
  // Generate CSV template for financial data
  generateFinancialTemplate: async () => {
    try {
      const csvContent = [
        'Date,Description,Amount,Vendor,Category,Payment_Method,Employee,Department,Invoice_Number,Reference',
        '2024-01-15,Office Supplies,250.00,Office Depot,Supplies,Credit Card,John Smith,Accounting,INV-001,REF-001',
        '2024-01-16,Software License,1200.00,Microsoft,Software,Check,Jane Doe,IT,INV-002,REF-002',
        '2024-01-17,Travel Expenses,450.75,American Airlines,Travel,Corporate Card,Bob Johnson,Sales,INV-003,REF-003',
        '2024-01-18,Consulting Services,2500.00,ABC Consulting,Professional Services,Wire Transfer,Mary Wilson,Operations,INV-004,REF-004',
        '2024-01-19,Utility Bill,180.25,Electric Company,Utilities,ACH,System,Facilities,INV-005,REF-005'
      ].join('\n');

      const fileName = 'Oqualtix_Financial_Template.csv';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Download Financial Data Template'
        });
      }
      
      Alert.alert(
        'Template Generated',
        'Financial data template has been created and saved to your device.',
        [{ text: 'OK' }]
      );
      
      return fileUri;
    } catch (error) {
      console.error('Error generating template:', error);
      Alert.alert('Error', 'Failed to generate template');
      return null;
    }
  },

  // Generate expense report template
  generateExpenseTemplate: async () => {
    try {
      const csvContent = [
        'Date,Employee_Name,Employee_ID,Expense_Type,Description,Amount,Receipt_Number,Business_Purpose,Client_Project,Approved_By',
        '2024-01-15,John Smith,EMP001,Travel,Flight to Chicago,450.00,REC001,Client Meeting,Project Alpha,Manager Smith',
        '2024-01-16,Jane Doe,EMP002,Meals,Client Dinner,125.50,REC002,Business Development,Project Beta,Manager Jones',
        '2024-01-17,Bob Johnson,EMP003,Supplies,Office Materials,75.25,REC003,Office Setup,General,Manager Wilson',
        '2024-01-18,Mary Wilson,EMP004,Transportation,Taxi to Airport,35.00,REC004,Business Travel,Project Gamma,Manager Brown'
      ].join('\n');

      const fileName = 'Oqualtix_Expense_Template.csv';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Download Expense Report Template'
        });
      }
      
      Alert.alert(
        'Expense Template Generated',
        'Expense report template has been created and saved.',
        [{ text: 'OK' }]
      );
      
      return fileUri;
    } catch (error) {
      console.error('Error generating expense template:', error);
      Alert.alert('Error', 'Failed to generate expense template');
      return null;
    }
  },

  // Generate vendor analysis template
  generateVendorTemplate: async () => {
    try {
      const csvContent = [
        'Vendor_Name,Vendor_ID,Contact_Person,Email,Phone,Address,Payment_Terms,Tax_ID,Bank_Account,Total_Paid_YTD',
        'Office Depot,VEN001,Sarah Johnson,sarah@officedepot.com,555-0101,123 Main St,Net 30,12-3456789,ACCT001,15000.00',
        'Microsoft Corporation,VEN002,Tech Support,support@microsoft.com,555-0102,One Microsoft Way,Net 15,98-7654321,ACCT002,45000.00',
        'ABC Consulting,VEN003,Mark Davis,mark@abcconsulting.com,555-0103,456 Business Ave,Net 45,45-1234567,ACCT003,25000.00',
        'Electric Company,VEN004,Customer Service,billing@electric.com,555-0104,789 Power St,Net 10,78-9876543,ACCT004,8500.00'
      ].join('\n');

      const fileName = 'Oqualtix_Vendor_Template.csv';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Download Vendor Analysis Template'
        });
      }
      
      Alert.alert(
        'Vendor Template Generated',
        'Vendor analysis template has been created and saved.',
        [{ text: 'OK' }]
      );
      
      return fileUri;
    } catch (error) {
      console.error('Error generating vendor template:', error);
      Alert.alert('Error', 'Failed to generate vendor template');
      return null;
    }
  },

  // Generate sample fraud data for testing
  generateSampleFraudData: async () => {
    try {
      const csvContent = [
        'Date,Description,Amount,Vendor,Employee,Red_Flag_Type,Notes',
        '2024-01-15,Office Supplies,15000.00,Office Supplies Inc,John Doe,UNUSUAL_AMOUNT,Amount significantly higher than typical office supply purchases',
        '2024-01-16,Consulting Services,5000.00,ABC Consulting,Jane Smith,DUPLICATE_VENDOR,Same vendor name as legitimate vendor but different contact info',
        '2024-01-17,Travel Expenses,999.99,Travel Agency,Bob Johnson,ROUND_NUMBERS,Multiple transactions with round numbers just under $1000',
        '2024-01-18,IT Services,2500.00,Personal Services LLC,Mary Wilson,PERSONAL_VENDOR,Vendor appears to be personal service rather than business',
        '2024-01-19,Office Rent,8000.00,Property Management Co,System,TIMING_ANOMALY,Rent payment made outside normal schedule',
        '2024-01-20,Software License,999.00,Software Solutions,John Doe,FREQUENT_SMALL,Multiple transactions just under approval threshold'
      ].join('\n');

      const fileName = 'Oqualtix_Sample_Fraud_Data.csv';
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Download Sample Fraud Data for Testing'
        });
      }
      
      Alert.alert(
        'Sample Data Generated',
        'Sample fraud data for AI testing has been created.',
        [{ text: 'OK' }]
      );
      
      return fileUri;
    } catch (error) {
      console.error('Error generating sample data:', error);
      Alert.alert('Error', 'Failed to generate sample data');
      return null;
    }
  },

  // Data validation guidelines
  getDataRequirements: () => {
    return {
      required_columns: [
        'Date', 'Description', 'Amount', 'Vendor'
      ],
      optional_columns: [
        'Employee', 'Department', 'Category', 'Payment_Method', 
        'Invoice_Number', 'Reference', 'Approved_By'
      ],
      data_formats: {
        Date: 'YYYY-MM-DD or MM/DD/YYYY',
        Amount: 'Numeric values (no currency symbols)',
        Description: 'Text description of transaction',
        Vendor: 'Vendor/supplier name'
      },
      tips: [
        'Include as many columns as possible for better AI analysis',
        'Ensure dates are in consistent format',
        'Remove currency symbols from amounts',
        'Use consistent vendor naming',
        'Include at least 100 transactions for meaningful analysis'
      ]
    };
  },

  // Help and instructions
  getInstructions: () => {
    return {
      title: 'How to Use Templates',
      steps: [
        '1. Download the appropriate template for your data type',
        '2. Open the template in Excel, Google Sheets, or any CSV editor',
        '3. Replace the sample data with your actual financial data',
        '4. Ensure all required columns are filled',
        '5. Save the file and upload it to Oqualtix for AI analysis',
        '6. Review the AI-generated fraud detection results'
      ],
      best_practices: [
        'Use consistent date formats throughout your data',
        'Include vendor contact information when possible',
        'Add employee IDs or names for expense tracking',
        'Include approval workflows and authorization levels',
        'Maintain original invoice/receipt numbers for audit trails'
      ]
    };
  }
};

export default TemplateGenerator;