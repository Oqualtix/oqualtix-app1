/**
 * Admin License Management CLI
 * Administrative interface for managing licenses and user access
 * Only accessible with oqualtix@outlook.com credentials
 */

import LicenseAuthenticationService from './src/services/LicenseAuthenticationService.js';
import readline from 'readline';
import crypto from 'crypto';

class AdminLicenseManager {
  constructor() {
    this.licenseService = new LicenseAuthenticationService();
    this.isAuthenticated = false;
    this.adminEmail = null;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('🔐 OQUALTIX ADMIN LICENSE MANAGEMENT SYSTEM');
    console.log('=' * 50);
  }

  // Main entry point
  async start() {
    try {
      // Authenticate admin
      const authResult = await this.authenticateAdmin();
      
      if (!authResult.success) {
        console.log('❌ Admin authentication failed. Access denied.');
        this.rl.close();
        return;
      }

      console.log(`\n✅ Welcome, ${this.adminEmail}!`);
      
      // Display main menu
      await this.showMainMenu();
      
    } catch (error) {
      console.error('❌ Admin system error:', error);
    } finally {
      this.rl.close();
    }
  }

  // Authenticate admin user
  async authenticateAdmin() {
    console.log('\n🔒 ADMIN AUTHENTICATION REQUIRED');
    console.log('Only authorized administrators can access this system.');
    console.log('');

    const email = await this.question('📧 Admin Email: ');
    const authCode = await this.question('🔑 Admin Authentication Code: ');

    // Validate admin email
    if (!this.licenseService.isAdminEmail(email)) {
      return { success: false, error: 'Unauthorized email address' };
    }

    // Validate auth code (in production, implement proper 2FA)
    const expectedCode = this.generateAdminAuthCode(email);
    if (authCode !== expectedCode) {
      return { success: false, error: 'Invalid authentication code' };
    }

    this.isAuthenticated = true;
    this.adminEmail = email;

    return { success: true };
  }

  // Generate admin authentication code (simplified for demo)
  generateAdminAuthCode(email) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return crypto.createHash('md5').update(email + today + 'OQUALTIX_ADMIN_2025').digest('hex').substr(0, 8).toUpperCase();
  }

  // Show main menu
  async showMainMenu() {
    while (true) {
      console.log('\n📋 ADMIN MENU');
      console.log('1. Generate New License');
      console.log('2. View All Licenses');
      console.log('3. Revoke License');
      console.log('4. View Company Statistics');
      console.log('5. View User Assignments');
      console.log('6. Generate Auth Code for Today');
      console.log('0. Exit');
      console.log('');

      const choice = await this.question('Select option: ');

      switch (choice) {
        case '1':
          await this.generateNewLicense();
          break;
        case '2':
          await this.viewAllLicenses();
          break;
        case '3':
          await this.revokeLicense();
          break;
        case '4':
          await this.viewStatistics();
          break;
        case '5':
          await this.viewUserAssignments();
          break;
        case '6':
          await this.showTodaysAuthCode();
          break;
        case '0':
          console.log('👋 Goodbye!');
          return;
        default:
          console.log('❌ Invalid option. Please try again.');
      }
    }
  }

  // Generate new license
  async generateNewLicense() {
    console.log('\n🔑 GENERATE NEW LICENSE');
    console.log('=' * 30);

    try {
      const companyName = await this.question('🏢 Company Name: ');
      const contactEmail = await this.question('📧 Contact Email: ');
      const bankAccountsInput = await this.question('🏦 Bank Account IDs (comma-separated): ');
      const companyCardsInput = await this.question('💳 Company Card IDs (comma-separated): ');
      const apiAccess = await this.question('🔌 API Access (y/n): ');

      // Parse bank accounts
      const bankAccounts = bankAccountsInput.split(',').map(id => ({
        id: id.trim(),
        type: 'bank_account',
        name: `Bank Account ${id.trim()}`
      })).filter(acc => acc.id);

      // Parse company cards
      const companyCards = companyCardsInput.split(',').map(id => ({
        id: id.trim(),
        type: 'company_card',
        name: `Company Card ${id.trim()}`
      })).filter(card => card.id);

      const companyInfo = {
        companyName: companyName,
        contactEmail: contactEmail,
        bankAccounts: bankAccounts,
        companyCards: companyCards,
        apiAccess: apiAccess.toLowerCase() === 'y'
      };

      // Generate license
      const license = this.licenseService.generateLicenseKey(companyInfo, this.adminEmail);

      console.log('\n✅ LICENSE GENERATED SUCCESSFULLY!');
      console.log('=' * 40);
      console.log(`🔑 License Key: ${license.licenseKey}`);
      console.log(`🆔 License ID: ${license.licenseId}`);
      console.log(`🏢 Company: ${license.companyName}`);
      console.log(`👥 Max Users: ${license.maxUsers}`);
      console.log(`📅 Expires: ${new Date(license.expirationDate).toLocaleDateString()}`);
      console.log('');
      console.log('⚠️  Please securely share this license key with the client.');
      console.log('⚠️  This license key will not be displayed again!');

    } catch (error) {
      console.error('❌ Error generating license:', error.message);
    }
  }

  // View all licenses
  async viewAllLicenses() {
    console.log('\n📋 ALL LICENSES');
    console.log('=' * 20);

    const licenses = this.licenseService.activeLicenses;
    
    if (Object.keys(licenses).length === 0) {
      console.log('No licenses found.');
      return;
    }

    Object.entries(licenses).forEach(([key, license], index) => {
      const keyDisplay = key.substring(0, 20) + '...';
      const status = license.status;
      const expired = new Date() > new Date(license.expirationDate);
      const statusIcon = status === 'ACTIVE' && !expired ? '✅' : 
                        expired ? '⏰' : 
                        status === 'REVOKED' ? '❌' : '⚠️';

      console.log(`\n${index + 1}. ${statusIcon} ${license.companyName}`);
      console.log(`   🔑 Key: ${keyDisplay}`);
      console.log(`   📧 Contact: ${license.contactEmail}`);
      console.log(`   👥 Max Users: ${license.maxUsers}`);
      console.log(`   📅 Expires: ${new Date(license.expirationDate).toLocaleDateString()}`);
      console.log(`   🔄 Status: ${status}`);
      console.log(`   📊 Access Count: ${license.accessCount || 0}`);
      if (license.lastAccessDate) {
        console.log(`   🕐 Last Access: ${new Date(license.lastAccessDate).toLocaleString()}`);
      }
    });
  }

  // Revoke license
  async revokeLicense() {
    console.log('\n🔒 REVOKE LICENSE');
    console.log('=' * 20);

    const licenseKey = await this.question('🔑 License Key to revoke: ');
    const confirm = await this.question('⚠️  Are you sure? This cannot be undone (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Revocation cancelled.');
      return;
    }

    try {
      const result = this.licenseService.revokeLicense(licenseKey, this.adminEmail);
      
      if (result) {
        console.log('✅ License revoked successfully!');
        console.log('All associated users will be immediately logged out.');
      }
    } catch (error) {
      console.error('❌ Error revoking license:', error.message);
    }
  }

  // View statistics
  async viewStatistics() {
    console.log('\n📊 SYSTEM STATISTICS');
    console.log('=' * 25);

    const stats = this.licenseService.getCompanyStatistics();

    console.log(`📋 Total Licenses: ${stats.totalLicenses}`);
    console.log(`✅ Active Licenses: ${stats.activeLicenses}`);
    console.log(`⏰ Expired Licenses: ${stats.expiredLicenses}`);
    console.log(`❌ Revoked Licenses: ${stats.revokedLicenses}`);
    console.log(`🏢 Total Companies: ${stats.totalCompanies}`);
    console.log(`👥 Total Active Users: ${stats.totalUsers}`);

    // Calculate utilization
    const utilizationRate = stats.totalLicenses > 0 ? 
      ((stats.activeLicenses / stats.totalLicenses) * 100).toFixed(1) : 0;
    
    console.log(`📈 License Utilization: ${utilizationRate}%`);
  }

  // View user assignments
  async viewUserAssignments() {
    console.log('\n👥 USER ASSIGNMENTS');
    console.log('=' * 25);

    const assignments = this.licenseService.userAssignments;
    
    if (Object.keys(assignments).length === 0) {
      console.log('No user assignments found.');
      return;
    }

    Object.entries(assignments).forEach(([licenseKey, companyAssignments]) => {
      const license = this.licenseService.activeLicenses[licenseKey];
      console.log(`\n🏢 ${license ? license.companyName : 'Unknown Company'}`);
      console.log(`🔑 License: ${licenseKey.substring(0, 20)}...`);
      
      Object.entries(companyAssignments).forEach(([accountId, assignment]) => {
        console.log(`  👤 ${assignment.userEmail}`);
        console.log(`     💳 Account: ${accountId} (${assignment.accountType})`);
        console.log(`     👮 Role: ${assignment.role}`);
        console.log(`     📅 Assigned: ${new Date(assignment.assignedDate).toLocaleDateString()}`);
        console.log(`     🔄 Status: ${assignment.status}`);
      });
    });
  }

  // Show today's auth code
  async showTodaysAuthCode() {
    console.log('\n🔑 TODAY\'S ADMIN AUTH CODE');
    console.log('=' * 35);
    
    const authCode = this.generateAdminAuthCode(this.adminEmail);
    console.log(`📧 Email: ${this.adminEmail}`);
    console.log(`🔑 Code: ${authCode}`);
    console.log(`📅 Valid for: ${new Date().toDateString()}`);
    console.log('');
    console.log('⚠️  This code changes daily and is required for admin access.');
  }

  // Helper method for questions
  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run admin interface if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const adminManager = new AdminLicenseManager();
  adminManager.start().catch(console.error);
}

export default AdminLicenseManager;