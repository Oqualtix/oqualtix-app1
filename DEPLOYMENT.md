# Oqualtix AI Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- [ ] Node.js 16+ installed
- [ ] React Native CLI configured
- [x] Oxul AI Engine (included - no external setup needed)
- [ ] Email service (SMTP) configured
- [ ] Database server ready
- [ ] SSL certificates for production

### AI Service Configuration

#### 1. Oxul AI Engine Setup
```bash
# No external setup required - Oxul AI Engine is built-in
# All AI processing happens locally for maximum privacy
export OXUL_AI_ENGINE="enabled"
```

#### 2. TensorFlow.js Configuration
```javascript
// In src/config/AIConfig.js
export const AIConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // or 'gpt-4' for production
    maxTokens: 500,
    temperature: 0.7,
    dangerouslyAllowBrowser: false // Set to false in production
  },
  tensorflow: {
    backend: 'webgl', // Use 'webgpu' if available
    enableProfiling: false,
    debugMode: false
  }
}
```

### Security Configuration

#### 1. Environment Variables
```bash
# .env file for production
OPENAI_API_KEY=your_openai_api_key
SMTP_HOST=smtp.outlook.com
SMTP_PORT=587
SMTP_USER=oqualtix@outlook.com
SMTP_PASS=your_email_password
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_character_encryption_key
```

#### 2. Admin Security
```javascript
// Admin deletion password (change in production)
const ADMIN_DELETE_PASSWORD = "your_secure_admin_password";
```

### Performance Optimization

#### 1. Model Loading
```javascript
// Preload TensorFlow.js models
import '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-platform-react-native';

// Initialize on app startup
await tf.ready();
const model = await loadFraudDetectionModel();
```

#### 2. API Rate Limiting
```javascript
// Configure rate limiting for OpenAI
const rateLimiter = {
  maxRequests: 100, // per hour
  windowMs: 3600000, // 1 hour
  message: "Too many AI requests, please try again later"
};
```

### Database Setup

#### 1. Required Tables
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  role VARCHAR(50) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  employee_count INTEGER,
  subscription_tier VARCHAR(50) DEFAULT 'basic',
  ai_features_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Analysis Logs
CREATE TABLE ai_analysis_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  analysis_type VARCHAR(100),
  input_data TEXT,
  ai_response TEXT,
  confidence_score DECIMAL(5,4),
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fraud Detection Results
CREATE TABLE fraud_detections (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  transaction_data JSONB,
  ai_risk_score DECIMAL(5,4),
  ml_algorithm_used VARCHAR(100),
  is_fraud BOOLEAN,
  investigation_status VARCHAR(50) DEFAULT 'pending',
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Production Build

#### 1. Build Commands
```bash
# Install production dependencies
npm install --production

# Build for iOS
npx react-native run-ios --configuration Release

# Build for Android
npx react-native run-android --variant=release
```

#### 2. Bundle Analysis
```bash
# Analyze bundle size
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle

# Check AI dependencies size
npm list @tensorflow/tfjs openai natural
```

### Monitoring & Analytics

#### 1. AI Performance Monitoring
```javascript
// Track AI model performance
const aiMetrics = {
  fraudDetectionAccuracy: 0.92,
  averageResponseTime: 1500, // ms
  dailyAPIRequests: 2500,
  modelLoadTime: 45000, // ms
  fallbackActivations: 12 // times AI failed
};
```

#### 2. Error Tracking
```javascript
// Log AI errors
const logAIError = (error, context) => {
  console.error('AI Service Error:', {
    error: error.message,
    context,
    timestamp: new Date().toISOString(),
    aiServiceStatus: await checkAIServiceHealth()
  });
};
```

### Testing Procedures

#### 1. AI Model Testing
```bash
# Test fraud detection accuracy
npm run test:ai-models

# Validate OpenAI integration
npm run test:openai-connection

# Check TensorFlow.js models
npm run test:tensorflow-models
```

#### 2. Load Testing
```bash
# Simulate concurrent AI requests
npm run test:load-ai-service

# Test admin deletion functionality
npm run test:admin-features

# Validate email verification system
npm run test:email-verification
```

### Deployment Steps

#### 1. Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Database schema updated
- [ ] AI models tested and validated
- [ ] SSL certificates installed
- [ ] Email service tested
- [ ] Admin access verified
- [ ] Terms & conditions updated
- [ ] Legal compliance reviewed

#### 2. Deployment Process
```bash
# 1. Deploy backend services
docker-compose up -d database redis

# 2. Run database migrations
npm run migrate:up

# 3. Build and deploy app
npm run build:production
npm run deploy:production

# 4. Test AI services
npm run test:ai-services-production

# 5. Verify admin access
npm run test:admin-login
```

### Post-Deployment Monitoring

#### 1. Health Checks
```javascript
// Regular health check endpoints
GET /api/health/ai-services
GET /api/health/database
GET /api/health/email-service
GET /api/health/fraud-detection
```

#### 2. Performance Metrics
- AI model response times
- Fraud detection accuracy rates
- User authentication success rates
- Email verification completion rates
- Admin feature usage analytics

### Troubleshooting Common Issues

#### 1. AI Services Not Working
```bash
# Check OpenAI API status
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Verify TensorFlow.js models
node -e "const tf = require('@tensorflow/tfjs'); tf.ready().then(() => console.log('TensorFlow.js ready'));"

# Test natural language processing
node -e "const natural = require('natural'); console.log(natural.SentimentAnalyzer);"
```

#### 2. Authentication Issues
```bash
# Check email service
node scripts/test-email-service.js

# Verify database connections
node scripts/test-database.js

# Test JWT token generation
node scripts/test-auth.js
```

#### 3. Performance Issues
```bash
# Check memory usage
node --inspect scripts/memory-check.js

# Monitor API response times
npm run monitor:api-performance

# Analyze bundle size
npm run analyze:bundle
```

### Security Recommendations

#### 1. Production Security
- Use HTTPS for all communications
- Implement proper CORS policies
- Enable rate limiting on all endpoints
- Use secure session management
- Implement proper input validation
- Enable audit logging for all actions

#### 2. AI Security
- Never expose OpenAI API keys in client code
- Implement request validation for AI endpoints
- Monitor for unusual AI usage patterns
- Set appropriate rate limits for AI features
- Use secure model storage and loading

### Backup & Recovery

#### 1. Data Backup
```bash
# Database backup
pg_dump oqualtix_production > backup_$(date +%Y%m%d).sql

# AI model backup
tar -czf ai_models_backup.tar.gz models/

# Configuration backup
cp -r config/ backup/config_$(date +%Y%m%d)/
```

#### 2. Recovery Procedures
```bash
# Restore database
psql oqualtix_production < backup_20231201.sql

# Restore AI models
tar -xzf ai_models_backup.tar.gz -C models/

# Restart services
docker-compose restart
```

---

**Deployment Support**: support@oqualtix.com  
**AI Technical Issues**: ai-support@oqualtix.com  
**Security Concerns**: security@oqualtix.com  

*This deployment guide ensures your Oqualtix AI system is properly configured for production use with maximum security and performance.*