# OQUALTIX AUTHENTICATION & LICENSING SYSTEM

## Overview
The Oqualtix fraud detection system now includes comprehensive authentication and licensing controls to ensure secure access and proper user management.

## Key Features

### 🔐 License-Based Authentication
- **License Key Requirement**: All users must have a valid license key issued by `oqualtix@outlook.com`
- **Admin Control**: Only authorized administrators can generate, revoke, and manage licenses
- **Secure Format**: License keys use format `OQX-[TIMESTAMP]-[RANDOM]-[CHECKSUM]`
- **Expiration Management**: Licenses expire automatically after one year

### 👥 Company-Based User Management
- **One User Per Account**: Each bank account or company card can only have one assigned user
- **Account Assignment**: Users are automatically assigned to available accounts or can request specific accounts
- **Role-Based Permissions**: Users have different access levels (ADMIN, MANAGER, USER)
- **Company Isolation**: Each license is company-specific with isolated data access

### 🔒 Security Features
- **Session Management**: Secure token-based authentication with 24-hour expiration
- **Permission Control**: Granular permissions for different system functions
- **Audit Trail**: Complete tracking of user actions and license usage
- **Access Logging**: Detailed logs of all authentication attempts and system access

## Authentication Process

### For End Users
1. **Obtain License**: Contact `oqualtix@outlook.com` to request a license key
2. **Provide Company Info**: Include company name, bank accounts, and company cards
3. **Receive License**: Get unique license key valid for one year
4. **User Assignment**: Each user is assigned to one bank account or company card
5. **System Access**: Use license key to access fraud detection features

### For Administrators
1. **Admin Authentication**: Use authorized email and daily auth code
2. **License Generation**: Create licenses for companies with specified accounts
3. **User Management**: Monitor user assignments and access patterns
4. **License Control**: Revoke licenses if needed for security or policy reasons

## Usage Examples

### Command Line Authentication
```bash
# Start with license key and email
node secure_fraud_detection_cli.js --license "OQX-ABC123-DEF456789-ABCD" --email "user@company.com"

# Interactive authentication
node secure_fraud_detection_cli.js
```

### Admin License Management
```bash
# Run admin interface
node admin_license_manager.js
```

## License Structure

### Company License Example
```json
{
  "licenseKey": "OQX-1KJ9W0N-A1B2C3D4E5F6G7H8-3F2A",
  "companyName": "Example Corp",
  "contactEmail": "contact@example.com",
  "bankAccounts": [
    {"id": "BANK_001", "type": "bank_account", "name": "Primary Checking"}
  ],
  "companyCards": [
    {"id": "CARD_001", "type": "company_card", "name": "Corporate Card"}
  ],
  "maxUsers": 2,
  "expirationDate": "2026-10-27T00:00:00.000Z",
  "features": {
    "realTimeFraudDetection": true,
    "microSkimmingDetection": true,
    "bankStatementAnalysis": true,
    "notificationSystem": true,
    "auditReporting": true
  }
}
```

### User Assignment Example
```json
{
  "BANK_001": {
    "accountId": "BANK_001",
    "accountType": "bank_account",
    "userEmail": "john@example.com",
    "userName": "John Smith",
    "role": "USER",
    "permissions": [
      "view_transactions",
      "run_fraud_analysis",
      "view_reports"
    ],
    "assignedDate": "2025-10-27T12:00:00.000Z",
    "status": "ACTIVE"
  }
}
```

## Access Control

### System Functions Requiring Authentication
- Financial records analysis
- Real-time fraud monitoring
- Micro-skimming detection
- Bank statement parsing
- Report generation
- Notification management

### Permission Levels
- **view_transactions**: View transaction data
- **run_fraud_analysis**: Execute fraud detection algorithms
- **view_reports**: Access generated reports
- **manage_company_users**: Manage users within company (Manager+)
- **export_reports**: Export analysis results (Manager+)
- **manage_licenses**: Create/revoke licenses (Admin only)
- **system_configuration**: Modify system settings (Admin only)

## Getting Started

### For New Companies
1. **Contact Admin**: Email `oqualtix@outlook.com` with your company information
2. **Provide Details**: Include company name, contact email, bank accounts, and company cards
3. **Receive License**: Get your unique license key and setup instructions
4. **Assign Users**: Each bank account/card can have one assigned user
5. **Start Detection**: Begin using fraud detection features immediately

### For Existing Users
1. **Launch System**: Run `secure_fraud_detection_cli.js`
2. **Enter Credentials**: Provide your license key and email address
3. **Access Features**: Use all fraud detection capabilities for your assigned account
4. **Monitor Activity**: Receive real-time alerts and notifications

## Administration

### Daily Admin Authentication Code
```javascript
// Generate today's admin code
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const authCode = crypto.createHash('md5')
  .update(adminEmail + today + 'OQUALTIX_ADMIN_2025')
  .digest('hex').substr(0, 8).toUpperCase();
```

### License Management Commands
- **Generate License**: Create new company license with specified accounts
- **View All Licenses**: Display all active, expired, and revoked licenses
- **Revoke License**: Immediately disable license and log out all users
- **View Statistics**: See system usage and license utilization
- **User Assignments**: Monitor which users are assigned to which accounts

## Security Considerations

### Best Practices
- **Secure Storage**: Store license keys securely and never share them
- **Regular Review**: Periodically review user assignments and access logs
- **Prompt Revocation**: Immediately revoke licenses for departing employees
- **Monitor Usage**: Track system access patterns for anomalies

### Technical Security
- **Encrypted Sessions**: All session tokens are cryptographically secure
- **Time-Based Expiration**: Sessions and codes expire automatically
- **Access Logging**: Complete audit trail of all system access
- **Permission Validation**: Every action checked against user permissions

## Support and Contact

### For Licensing Issues
- **Email**: oqualtix@outlook.com
- **Subject**: License Request - [Company Name]
- **Include**: Company details, required accounts, technical contact

### For Technical Support
- **Authentication Problems**: Check license key format and expiration
- **Permission Errors**: Verify user role and assigned account
- **System Issues**: Contact administrator with error details and user information

## Files Overview

### Core Authentication Files
- `src/services/LicenseAuthenticationService.js` - Main license and authentication logic
- `src/middleware/AuthenticationMiddleware.js` - Authentication middleware for system access
- `admin_license_manager.js` - Administrative interface for license management
- `secure_fraud_detection_cli.js` - Main user interface with authentication

### Data Storage
- `licenses/active_licenses.json` - Active license database
- `licenses/company_data.json` - Company information
- `licenses/user_assignments.json` - User-to-account assignments
- `user_data/active_sessions.json` - Current user sessions

This comprehensive authentication system ensures that only authorized users can access the fraud detection capabilities while maintaining strict company isolation and account-level access control.