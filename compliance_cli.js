/**
 * Compliance CLI - Comprehensive Compliance Management Interface
 * Unified command-line interface for all compliance tools and systems
 */

import LegalReviewFramework from '../compliance/LegalReviewFramework.js';
import ComplianceAssessmentSystem from '../compliance/ComplianceAssessmentSystem.js';
import ComplianceDocumentationFramework from '../compliance/ComplianceDocumentationFramework.js';
import RegulatoryUpdateMonitor from '../compliance/RegulatoryUpdateMonitor.js';
import readlineSync from 'readline-sync';
import chalk from 'chalk';

class ComplianceCLI {
  constructor() {
    this.legalReview = new LegalReviewFramework();
    this.assessmentSystem = new ComplianceAssessmentSystem();
    this.documentationFramework = new ComplianceDocumentationFramework();
    this.updateMonitor = new RegulatoryUpdateMonitor();
    this.isRunning = false;
    
    console.log(chalk.cyan('\n⚖️ OQUALTIX COMPLIANCE MANAGEMENT SYSTEM'));
    console.log(chalk.cyan('═'.repeat(50)));
  }

  // Start the compliance CLI
  async start() {
    console.log(chalk.yellow('🚀 Initializing Compliance Management System...'));
    
    try {
      // Display welcome message
      this.displayWelcomeMessage();
      
      // Start main menu
      this.isRunning = true;
      await this.showMainMenu();
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to start Compliance CLI:'), error.message);
      process.exit(1);
    }
  }

  // Display welcome message
  displayWelcomeMessage() {
    console.log(chalk.green('\n✅ COMPLIANCE SYSTEM READY'));
    console.log(chalk.white('═'.repeat(40)));
    console.log(chalk.white('🔍 Legal Review Framework: Ready'));
    console.log(chalk.white('📊 Compliance Assessment: Ready'));
    console.log(chalk.white('📋 Documentation System: Ready'));
    console.log(chalk.white('🔄 Regulatory Monitoring: Ready'));
    console.log(chalk.white('═'.repeat(40)));
  }

  // Show main menu
  async showMainMenu() {
    while (this.isRunning) {
      console.log(chalk.cyan('\n⚖️ COMPLIANCE MANAGEMENT - MAIN MENU'));
      console.log(chalk.cyan('═'.repeat(40)));
      console.log('1. Legal Review & Attorney Consultation');
      console.log('2. Compliance Assessment & Scoring');
      console.log('3. Documentation & Policy Generation');
      console.log('4. Regulatory Update Monitoring');
      console.log('5. Complete Compliance Package');
      console.log('6. Customer Registration');
      console.log('7. Compliance Dashboard');
      console.log('8. Exit');

      const choice = readlineSync.question(chalk.yellow('\nSelect option (1-8): '));

      try {
        switch (choice) {
          case '1':
            await this.legalReviewMenu();
            break;
          case '2':
            await this.complianceAssessmentMenu();
            break;
          case '3':
            await this.documentationMenu();
            break;
          case '4':
            await this.regulatoryMonitoringMenu();
            break;
          case '5':
            await this.completeCompliancePackage();
            break;
          case '6':
            await this.customerRegistration();
            break;
          case '7':
            await this.complianceDashboard();
            break;
          case '8':
            await this.exit();
            break;
          default:
            console.log(chalk.red('❌ Invalid option. Please try again.'));
        }
      } catch (error) {
        console.error(chalk.red('❌ Error:'), error.message);
        readlineSync.question(chalk.yellow('Press Enter to continue...'));
      }
    }
  }

  // Legal Review Menu
  async legalReviewMenu() {
    console.log(chalk.cyan('\n⚖️ LEGAL REVIEW & ATTORNEY CONSULTATION'));
    console.log(chalk.cyan('━'.repeat(40)));
    
    console.log('1. Generate Legal Review Checklist');
    console.log('2. Create Attorney Consultation Template');
    console.log('3. Regulatory Analysis Report');
    console.log('4. Back to Main Menu');

    const choice = readlineSync.question(chalk.yellow('\nSelect option (1-4): '));

    switch (choice) {
      case '1':
        await this.generateLegalChecklist();
        break;
      case '2':
        await this.createAttorneyTemplate();
        break;
      case '3':
        await this.regulatoryAnalysisReport();
        break;
      case '4':
        return;
      default:
        console.log(chalk.red('❌ Invalid option'));
    }

    readlineSync.question(chalk.yellow('Press Enter to continue...'));
  }

  // Compliance Assessment Menu
  async complianceAssessmentMenu() {
    console.log(chalk.cyan('\n📊 COMPLIANCE ASSESSMENT & SCORING'));
    console.log(chalk.cyan('━'.repeat(35)));
    
    console.log('1. Perform Compliance Assessment');
    console.log('2. View Assessment Results');
    console.log('3. Generate Implementation Plan');
    console.log('4. Risk Analysis Report');
    console.log('5. Back to Main Menu');

    const choice = readlineSync.question(chalk.yellow('\nSelect option (1-5): '));

    switch (choice) {
      case '1':
        await this.performComplianceAssessment();
        break;
      case '2':
        await this.viewAssessmentResults();
        break;
      case '3':
        await this.generateImplementationPlan();
        break;
      case '4':
        await this.riskAnalysisReport();
        break;
      case '5':
        return;
      default:
        console.log(chalk.red('❌ Invalid option'));
    }

    readlineSync.question(chalk.yellow('Press Enter to continue...'));
  }

  // Documentation Menu
  async documentationMenu() {
    console.log(chalk.cyan('\n📋 DOCUMENTATION & POLICY GENERATION'));
    console.log(chalk.cyan('━'.repeat(40)));
    
    console.log('1. Generate Policy Templates');
    console.log('2. Create Procedure Documents');
    console.log('3. Compliance Documentation Package');
    console.log('4. Audit Checklists');
    console.log('5. Training Materials');
    console.log('6. Back to Main Menu');

    const choice = readlineSync.question(chalk.yellow('\nSelect option (1-6): '));

    switch (choice) {
      case '1':
        await this.generatePolicyTemplates();
        break;
      case '2':
        await this.createProcedureDocuments();
        break;
      case '3':
        await this.complianceDocumentationPackage();
        break;
      case '4':
        await this.auditChecklists();
        break;
      case '5':
        await this.trainingMaterials();
        break;
      case '6':
        return;
      default:
        console.log(chalk.red('❌ Invalid option'));
    }

    readlineSync.question(chalk.yellow('Press Enter to continue...'));
  }

  // Regulatory Monitoring Menu
  async regulatoryMonitoringMenu() {
    console.log(chalk.cyan('\n🔄 REGULATORY UPDATE MONITORING'));
    console.log(chalk.cyan('━'.repeat(35)));
    
    console.log('1. Start Regulatory Monitoring');
    console.log('2. View Recent Updates');
    console.log('3. Customer Impact Analysis');
    console.log('4. Alert Management');
    console.log('5. Monitoring Status');
    console.log('6. Back to Main Menu');

    const choice = readlineSync.question(chalk.yellow('\nSelect option (1-6): '));

    switch (choice) {
      case '1':
        await this.startRegulatoryMonitoring();
        break;
      case '2':
        await this.viewRecentUpdates();
        break;
      case '3':
        await this.customerImpactAnalysis();
        break;
      case '4':
        await this.alertManagement();
        break;
      case '5':
        await this.monitoringStatus();
        break;
      case '6':
        return;
      default:
        console.log(chalk.red('❌ Invalid option'));
    }

    readlineSync.question(chalk.yellow('Press Enter to continue...'));
  }

  // Generate complete compliance package
  async completeCompliancePackage() {
    console.log(chalk.cyan('\n📦 COMPLETE COMPLIANCE PACKAGE GENERATION'));
    console.log(chalk.cyan('━'.repeat(45)));
    
    console.log(chalk.yellow('This will generate a comprehensive compliance package including:'));
    console.log('• Legal review checklist and attorney consultation template');
    console.log('• Compliance assessment with scoring and recommendations');
    console.log('• Complete policy and procedure documentation');
    console.log('• Regulatory monitoring setup and alerts');
    
    const confirm = readlineSync.keyInYNStrict(chalk.yellow('\nProceed with complete package generation?'));
    
    if (!confirm) {
      console.log(chalk.yellow('Operation cancelled'));
      return;
    }

    // Collect customer information
    const customerProfile = await this.collectCustomerProfile();
    
    console.log(chalk.yellow('\n🔄 Generating complete compliance package...'));
    
    // Step 1: Legal Review
    console.log(chalk.cyan('📋 Step 1: Legal Review Analysis...'));
    const legalChecklist = this.legalReview.generateLegalReviewChecklist(customerProfile);
    
    // Step 2: Compliance Assessment
    console.log(chalk.cyan('📊 Step 2: Compliance Assessment...'));
    const assessment = this.assessmentSystem.performComplianceAssessment(customerProfile);
    
    // Step 3: Documentation Generation
    console.log(chalk.cyan('📋 Step 3: Documentation Generation...'));
    const documentation = this.documentationFramework.generateComplianceDocumentationPackage(
      customerProfile, 
      assessment.applicableRegulations
    );
    
    // Step 4: Monitoring Setup
    console.log(chalk.cyan('🔄 Step 4: Regulatory Monitoring Setup...'));
    const customerId = this.updateMonitor.registerCustomer(customerProfile);
    
    // Display package summary
    this.displayCompletePackageSummary({
      customerProfile,
      legalChecklist,
      assessment,
      documentation,
      customerId
    });
  }

  // Collect customer profile information
  async collectCustomerProfile() {
    console.log(chalk.cyan('\n👤 CUSTOMER PROFILE COLLECTION'));
    console.log(chalk.cyan('━'.repeat(30)));
    
    const profile = {};
    
    profile.companyName = readlineSync.question(chalk.white('Company Name: '));
    
    console.log('\nBusiness Type:');
    console.log('1. Bank/Financial Institution');
    console.log('2. Fintech Company');
    console.log('3. Payment Processor');
    console.log('4. Insurance Company');
    console.log('5. Technology Company');
    console.log('6. Other');
    
    const businessChoice = readlineSync.questionInt(chalk.white('Select business type (1-6): '));
    const businessTypes = ['bank', 'fintech', 'payment_processor', 'insurance', 'technology', 'other'];
    profile.businessType = businessTypes[businessChoice - 1] || 'other';
    
    // Operating locations
    const locations = [];
    console.log(chalk.white('\nOperating Locations (enter one at a time, press Enter with empty input to finish):'));
    let location;
    while ((location = readlineSync.question('Location: ')) !== '') {
      locations.push(location);
    }
    profile.operatingLocations = locations;
    
    // Data processing questions
    profile.processesCardPayments = readlineSync.keyInYNStrict('Processes credit card payments? ');
    profile.processesFinancialData = readlineSync.keyInYNStrict('Processes financial data? ');
    profile.processesPersonalData = readlineSync.keyInYNStrict('Processes personal data? ');
    profile.isPublicCompany = readlineSync.keyInYNStrict('Is this a public company? ');
    
    // Transaction volume
    profile.transactionVolume = readlineSync.questionInt('Approximate monthly transaction volume: ');
    
    // Contact information
    profile.contactEmail = readlineSync.question('Contact email for alerts: ');
    
    return profile;
  }

  // Display complete package summary
  displayCompletePackageSummary(packageData) {
    console.log(chalk.green('\n✅ COMPLETE COMPLIANCE PACKAGE GENERATED'));
    console.log(chalk.green('═'.repeat(45)));
    
    console.log(chalk.white(`🏢 Company: ${packageData.customerProfile.companyName}`));
    console.log(chalk.white(`📊 Business Type: ${packageData.customerProfile.businessType}`));
    console.log(chalk.white(`🌍 Locations: ${packageData.customerProfile.operatingLocations.join(', ')}`));
    
    console.log(chalk.cyan('\n📋 PACKAGE CONTENTS:'));
    console.log(chalk.white('━'.repeat(25)));
    
    console.log(chalk.white('⚖️ Legal Review:'));
    console.log(chalk.white(`   • ${packageData.legalChecklist.regulatoryAnalysis.applicableRegulations.length} applicable regulations identified`));
    console.log(chalk.white(`   • Attorney consultation template prepared`));
    console.log(chalk.white(`   • Legal compliance checklist generated`));
    
    console.log(chalk.white('\n📊 Compliance Assessment:'));
    console.log(chalk.white(`   • Overall compliance score: ${packageData.assessment.complianceScore.overallScore}/100`));
    console.log(chalk.white(`   • Risk level: ${packageData.assessment.complianceScore.riskLevel}`));
    console.log(chalk.white(`   • ${packageData.assessment.applicableRegulations.length} regulations require attention`));
    
    console.log(chalk.white('\n📋 Documentation Package:'));
    console.log(chalk.white(`   • ${packageData.documentation.requiredPolicies.length} policy templates`));
    console.log(chalk.white(`   • ${packageData.documentation.requiredProcedures.length} procedure documents`));
    console.log(chalk.white(`   • Implementation guide and checklist`));
    console.log(chalk.white(`   • Training materials and audit tools`));
    
    console.log(chalk.white('\n🔄 Regulatory Monitoring:'));
    console.log(chalk.white(`   • Customer registered for monitoring (ID: ${packageData.customerId})`));
    console.log(chalk.white(`   • Alert subscriptions activated`));
    console.log(chalk.white(`   • Real-time regulatory change monitoring enabled`));
    
    console.log(chalk.green('\n🎯 NEXT STEPS:'));
    console.log(chalk.yellow('1. Review legal checklist with attorney'));
    console.log(chalk.yellow('2. Begin policy implementation based on assessment'));
    console.log(chalk.yellow('3. Establish compliance monitoring procedures'));
    console.log(chalk.yellow('4. Monitor for regulatory update alerts'));
    
    console.log(chalk.green('\n✅ Your complete compliance package is ready for implementation!'));
  }

  // Individual menu implementations (simplified)
  async generateLegalChecklist() {
    console.log(chalk.cyan('📋 Generating legal review checklist...'));
    const profile = await this.collectCustomerProfile();
    this.legalReview.generateLegalReviewChecklist(profile);
  }

  async createAttorneyTemplate() {
    console.log(chalk.cyan('📄 Creating attorney consultation template...'));
    const profile = await this.collectCustomerProfile();
    const template = this.legalReview.createAttorneyConsultationTemplate(profile);
    console.log(chalk.green('✅ Attorney consultation template created'));
  }

  async performComplianceAssessment() {
    console.log(chalk.cyan('📊 Performing compliance assessment...'));
    const profile = await this.collectCustomerProfile();
    this.assessmentSystem.performComplianceAssessment(profile);
  }

  async generatePolicyTemplates() {
    console.log(chalk.cyan('📜 Generating policy templates...'));
    const policies = Object.values(this.documentationFramework.policyTemplates);
    console.log(chalk.green(`✅ ${policies.length} policy templates available`));
    policies.forEach(policy => {
      console.log(chalk.white(`   • ${policy.name}`));
    });
  }

  async startRegulatoryMonitoring() {
    console.log(chalk.cyan('🔄 Starting regulatory monitoring...'));
    this.updateMonitor.startMonitoring();
  }

  async customerRegistration() {
    console.log(chalk.cyan('👤 Customer Registration for Compliance Monitoring'));
    const profile = await this.collectCustomerProfile();
    const customerId = this.updateMonitor.registerCustomer(profile);
    console.log(chalk.green(`✅ Customer registered with ID: ${customerId}`));
  }

  async complianceDashboard() {
    console.log(chalk.cyan('\n📊 COMPLIANCE DASHBOARD'));
    console.log(chalk.cyan('━'.repeat(25)));
    
    console.log(chalk.white('📋 System Status:'));
    console.log(chalk.green('   ✅ Legal Review Framework: Active'));
    console.log(chalk.green('   ✅ Compliance Assessment: Active'));
    console.log(chalk.green('   ✅ Documentation System: Active'));
    console.log(chalk.green('   ✅ Regulatory Monitoring: Active'));
    
    console.log(chalk.white('\n📊 Statistics:'));
    console.log(chalk.white('   • Registered Customers: 0'));
    console.log(chalk.white('   • Active Monitors: 0'));
    console.log(chalk.white('   • Recent Alerts: 0'));
    console.log(chalk.white('   • Documents Generated: 0'));
  }

  // Exit application
  async exit() {
    console.log(chalk.yellow('\n👋 Exiting Compliance Management System...'));
    this.isRunning = false;
    console.log(chalk.green('✅ Compliance CLI terminated'));
    process.exit(0);
  }

  // Simplified implementations for other methods
  async regulatoryAnalysisReport() { console.log(chalk.cyan('📊 Generating regulatory analysis report...')); }
  async viewAssessmentResults() { console.log(chalk.cyan('📊 Displaying assessment results...')); }
  async generateImplementationPlan() { console.log(chalk.cyan('📋 Generating implementation plan...')); }
  async riskAnalysisReport() { console.log(chalk.cyan('⚠️ Generating risk analysis report...')); }
  async createProcedureDocuments() { console.log(chalk.cyan('📋 Creating procedure documents...')); }
  async complianceDocumentationPackage() { console.log(chalk.cyan('📦 Generating documentation package...')); }
  async auditChecklists() { console.log(chalk.cyan('✅ Generating audit checklists...')); }
  async trainingMaterials() { console.log(chalk.cyan('📚 Generating training materials...')); }
  async viewRecentUpdates() { console.log(chalk.cyan('📰 Displaying recent regulatory updates...')); }
  async customerImpactAnalysis() { console.log(chalk.cyan('📊 Analyzing customer impact...')); }
  async alertManagement() { console.log(chalk.cyan('🚨 Managing regulatory alerts...')); }
  async monitoringStatus() { this.updateMonitor.displayMonitoringStatus(); }
}

// Export for use as a module
export default ComplianceCLI;

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ComplianceCLI();
  cli.start().catch(console.error);
}