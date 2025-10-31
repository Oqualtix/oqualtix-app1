#!/usr/bin/env node
/**
 * Oqualtix Standalone Builder
 * Creates completely self-contained deployments with zero external dependencies
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class OqualtixStandaloneBuilder {
  constructor() {
    this.buildConfig = {
      version: '2.0.0-standalone',
      buildDate: new Date().toISOString(),
      mode: 'STANDALONE',
      dependencies: 'NONE',
      internetRequired: false,
      externalServices: false
    };
    
    this.deploymentModes = {
      DESKTOP: 'Standalone desktop application',
      PORTABLE: 'Portable USB-ready deployment',
      AIRGAPPED: 'Air-gapped secure environment',
      DOCKER: 'Containerized standalone deployment'
    };
    
    console.log('🚀 Oqualtix Standalone Builder initialized');
    console.log('📦 Building self-contained fraud detection system...');
  }

  // Build complete standalone package
  async buildStandalonePackage(mode = 'DESKTOP') {
    console.log(`\n🏗️  Building ${mode} standalone package...`);
    
    const packageConfig = {
      name: `oqualtix-standalone-${mode.toLowerCase()}`,
      version: this.buildConfig.version,
      mode: mode,
      internetRequired: false,
      externalDependencies: [],
      includedComponents: this.getIncludedComponents(),
      buildTimestamp: new Date().toISOString()
    };

    // Create package structure
    await this.createPackageStructure(packageConfig);
    
    // Bundle all dependencies
    await this.bundleDependencies(packageConfig);
    
    // Create launcher scripts
    await this.createLaunchers(packageConfig);
    
    // Generate documentation
    await this.generateStandaloneDocumentation(packageConfig);
    
    // Create installation package
    await this.createInstallationPackage(packageConfig);
    
    console.log(`✅ ${mode} standalone package ready!`);
    return packageConfig;
  }

  // Get all included components for standalone operation
  getIncludedComponents() {
    return {
      core: {
        'Enhanced Anomaly Detection': '✅ Built-in micro-skimming detection',
        'Oxul AI System': '✅ Local AI processing, no cloud needed',
        'Advanced Fraud AI': '✅ Neural networks run locally',
        'Bank Statement Parser': '✅ Supports CSV, OFX, QIF, JSON offline',
        'Authentication System': '✅ Local user management'
      },
      monitoring: {
        'Live Transaction Monitor': '✅ Real-time local monitoring',
        'Performance Monitor': '✅ Local system performance tracking',
        'Alert System': '✅ Desktop notifications, no internet needed'
      },
      storage: {
        'Local Database': '✅ SQLite embedded database',
        'File Storage': '✅ Local file system for all data',
        'Configuration': '✅ JSON-based local configuration',
        'Backup System': '✅ Local backup and restore'
      },
      compliance: {
        'Legal Framework': '✅ Local compliance templates',
        'Assessment System': '✅ Offline compliance scoring',
        'Documentation': '✅ Local policy generation',
        'Audit Reports': '✅ Local report generation'
      },
      interfaces: {
        'CLI Tools': '✅ Command-line interfaces',
        'Web Interface': '✅ Local web server (localhost)',
        'Desktop GUI': '✅ Native desktop application',
        'File Watchers': '✅ Automatic file monitoring'
      }
    };
  }

  // Create standalone package directory structure
  async createPackageStructure(config) {
    const packageDir = `./dist/${config.name}`;
    
    const structure = {
      'app/': 'Main application files',
      'data/': 'Local database and storage',
      'config/': 'Configuration files',
      'logs/': 'Application logs',
      'imports/': 'File import directory',
      'exports/': 'Report export directory',
      'backups/': 'Automatic backup storage',
      'docs/': 'Documentation and guides',
      'bin/': 'Executable files and scripts'
    };

    console.log('📁 Creating package structure...');
    
    // Create base directory
    if (!fs.existsSync('./dist')) {
      fs.mkdirSync('./dist');
    }
    
    if (fs.existsSync(packageDir)) {
      fs.rmSync(packageDir, { recursive: true, force: true });
    }
    fs.mkdirSync(packageDir);

    // Create subdirectories
    Object.keys(structure).forEach(dir => {
      const fullPath = path.join(packageDir, dir);
      fs.mkdirSync(fullPath, { recursive: true });
      
      // Create README for each directory
      fs.writeFileSync(
        path.join(fullPath, 'README.md'),
        `# ${dir}\n\n${structure[dir]}\n\nThis directory is part of the Oqualtix standalone deployment.`
      );
    });

    console.log(`✅ Package structure created: ${packageDir}`);
    return packageDir;
  }

  // Bundle all dependencies into standalone package
  async bundleDependencies(config) {
    console.log('📦 Bundling dependencies for offline operation...');
    
    const packageDir = `./dist/${config.name}`;
    const appDir = path.join(packageDir, 'app');

    // Copy all source files
    const sourceFiles = [
      'src/',
      'package.json',
      'README.md',
      '*.js',
      '*.md',
      'licenses/',
      'user_data/'
    ];

    sourceFiles.forEach(pattern => {
      try {
        if (pattern.endsWith('/')) {
          // Directory
          const srcDir = pattern.slice(0, -1);
          if (fs.existsSync(srcDir)) {
            this.copyDirectoryRecursive(srcDir, path.join(appDir, srcDir));
          }
        } else if (pattern.includes('*')) {
          // Glob pattern
          const files = fs.readdirSync('.').filter(file => 
            file.match(new RegExp(pattern.replace('*', '.*')))
          );
          files.forEach(file => {
            fs.copyFileSync(file, path.join(appDir, file));
          });
        } else {
          // Single file
          if (fs.existsSync(pattern)) {
            fs.copyFileSync(pattern, path.join(appDir, pattern));
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not copy ${pattern}: ${error.message}`);
      }
    });

    // Create standalone package.json with no external dependencies
    const standalonePackageJson = {
      name: config.name,
      version: config.version,
      description: 'Oqualtix Standalone - Complete fraud detection system with zero external dependencies',
      type: 'module',
      main: 'oqualtix-standalone.js',
      scripts: {
        start: 'node oqualtix-standalone.js',
        'fraud-detection': 'node secure_fraud_detection_cli.js',
        'micro-analysis': 'node ultra_precise_micro_skimming_cli.js',
        monitor: 'node live_monitoring_cli.js',
        compliance: 'node compliance_cli.js'
      },
      dependencies: {
        // Only include absolutely essential dependencies that can work offline
      },
      standalone: {
        internetRequired: false,
        externalServices: false,
        databaseType: 'embedded',
        aiProcessing: 'local'
      }
    };

    fs.writeFileSync(
      path.join(appDir, 'package.json'),
      JSON.stringify(standalonePackageJson, null, 2)
    );

    console.log('✅ Dependencies bundled for offline operation');
  }

  // Create launcher scripts for different platforms
  async createLaunchers(config) {
    console.log('🚀 Creating platform launchers...');
    
    const packageDir = `./dist/${config.name}`;
    const binDir = path.join(packageDir, 'bin');

    // Windows launcher
    const windowsLauncher = `@echo off
title Oqualtix Standalone Fraud Detection System
echo.
echo =====================================
echo   Oqualtix Standalone v${config.version}
echo   Complete Fraud Detection System
echo   No Internet Required
echo =====================================
echo.

cd /d "%~dp0..\\app"

echo Starting Oqualtix...
node oqualtix-standalone.js

if errorlevel 1 (
    echo.
    echo Error starting Oqualtix. Press any key to exit.
    pause >nul
) else (
    echo.
    echo Oqualtix has stopped. Press any key to exit.
    pause >nul
)
`;

    fs.writeFileSync(path.join(binDir, 'start-oqualtix.bat'), windowsLauncher);

    // Linux/Mac launcher
    const unixLauncher = `#!/bin/bash
echo "====================================="
echo "  Oqualtix Standalone v${config.version}"
echo "  Complete Fraud Detection System"
echo "  No Internet Required"
echo "====================================="
echo

SCRIPT_DIR="$(cd "$(dirname "$\{BASH_SOURCE[0]\}")" && pwd)"
APP_DIR="$SCRIPT_DIR/../app"

cd "$APP_DIR"

echo "Starting Oqualtix..."
node oqualtix-standalone.js

echo "Oqualtix has stopped. Press Enter to exit."
read
`;

    fs.writeFileSync(path.join(binDir, 'start-oqualtix.sh'), unixLauncher);
    
    // Make Unix script executable
    try {
      fs.chmodSync(path.join(binDir, 'start-oqualtix.sh'), 0o755);
    } catch (error) {
      console.warn('⚠️  Could not set Unix script permissions');
    }

    // Create main standalone entry point
    const standaloneEntry = `#!/usr/bin/env node
/**
 * Oqualtix Standalone Entry Point
 * Complete fraud detection system with zero external dependencies
 */

console.log('🚀 Oqualtix Standalone v${config.version}');
console.log('🛡️  Complete Fraud Detection System');
console.log('🔒 No Internet Required - Fully Offline Operation');
console.log('');

import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

// Initialize standalone environment
const standaloneConfig = {
  mode: 'STANDALONE',
  version: '${config.version}',
  internetRequired: false,
  externalServices: false,
  localDatabase: true,
  offlineAI: true
};

console.log('⚙️  Initializing standalone environment...');

// Check for data directory
const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('📁 Created local data directory');
}

// Import main application components
try {
  console.log('🔧 Loading fraud detection engine...');
  
  // Start the main application
  import('./secure_fraud_detection_cli.js').then(() => {
    console.log('✅ Oqualtix Standalone ready for fraud detection!');
  }).catch(error => {
    console.error('❌ Error starting Oqualtix:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Failed to initialize Oqualtix Standalone:', error.message);
  process.exit(1);
}
`;

    fs.writeFileSync(path.join(packageDir, 'app', 'oqualtix-standalone.js'), standaloneEntry);

    console.log('✅ Platform launchers created');
  }

  // Generate standalone-specific documentation
  async generateStandaloneDocumentation(config) {
    console.log('📚 Generating standalone documentation...');
    
    const packageDir = `./dist/${config.name}`;
    const docsDir = path.join(packageDir, 'docs');

    const quickStart = `# Oqualtix Standalone Quick Start

## 🚀 Instant Setup (No Installation Required!)

### Windows
1. Extract the package anywhere on your computer
2. Double-click \`bin/start-oqualtix.bat\`
3. That's it! Oqualtix is running locally.

### Mac/Linux
1. Extract the package anywhere on your computer
2. Open terminal and run: \`./bin/start-oqualtix.sh\`
3. That's it! Oqualtix is running locally.

## 🎯 Key Features (All Work Offline!)

✅ **Micro-Skimming Detection** - Down to $0.0001
✅ **AI Fraud Analysis** - Local AI processing
✅ **Real-time Monitoring** - 24/7 local monitoring
✅ **Bank Statement Analysis** - CSV, OFX, QIF, JSON
✅ **Compliance Management** - Local compliance tools
✅ **No Internet Required** - Complete offline operation

## 📊 Usage Examples

### Basic Fraud Detection
\`\`\`bash
# Analyze bank statements
node secure_fraud_detection_cli.js

# Ultra-precise micro-skimming analysis
node ultra_precise_micro_skimming_cli.js

# Real-time monitoring
node live_monitoring_cli.js
\`\`\`

### Compliance Management
\`\`\`bash
# Full compliance assessment
node compliance_cli.js

# Legal review framework
node src/compliance/LegalReviewFramework.js
\`\`\`

## 🔒 Security Benefits

- **Your data never leaves your computer**
- **No cloud dependencies**
- **Works in air-gapped environments**
- **Complete data sovereignty**
- **Regulatory compliance friendly**

## 📞 Support

For standalone deployment support:
- Email: oqualtix@outlook.com
- Check local logs in: \`logs/\` directory
- Documentation: \`docs/\` directory

---
**Oqualtix Standalone v${config.version} - Complete Independence!**
`;

    fs.writeFileSync(path.join(docsDir, 'QUICK_START.md'), quickStart);

    const troubleshooting = `# Troubleshooting Oqualtix Standalone

## Common Issues

### 1. "Node.js not found"
**Solution**: Install Node.js or use the portable version that includes Node.js

### 2. "Permission denied" (Mac/Linux)
**Solution**: Run \`chmod +x bin/start-oqualtix.sh\`

### 3. "Cannot find module"
**Solution**: Make sure you're running from the correct directory

### 4. Database issues
**Solution**: Delete \`data/\` folder to reset local database

### 5. Port already in use
**Solution**: Close other applications using port 3000 or configure different port

## Logs and Diagnostics

Check these files for detailed information:
- \`logs/oqualtix-standalone.log\`
- \`logs/fraud-detection.log\`
- \`logs/performance.log\`

## Performance Optimization

For large datasets:
1. Increase Node.js memory: \`node --max-old-space-size=4096 oqualtix-standalone.js\`
2. Use SSD storage for better performance
3. Close other applications to free up memory

## Data Backup

Important directories to backup:
- \`data/\` - All your fraud detection data
- \`config/\` - Your settings and configurations
- \`exports/\` - Generated reports

---
**Self-Sufficient Fraud Detection - No Dependencies!**
`;

    fs.writeFileSync(path.join(docsDir, 'TROUBLESHOOTING.md'), troubleshooting);

    console.log('✅ Standalone documentation generated');
  }

  // Create installation package
  async createInstallationPackage(config) {
    console.log('📦 Creating installation package...');
    
    const packageDir = `./dist/${config.name}`;
    
    // Create README for the package
    const packageReadme = `# ${config.name}

**Complete Oqualtix fraud detection system - No internet or external dependencies required!**

## 🎯 What's Included

This package contains everything needed to run Oqualtix fraud detection:
- Complete fraud detection engine
- AI processing (runs locally)
- Database (embedded SQLite)
- Web interface (localhost)
- All documentation

## 🚀 Quick Start

### Windows
1. Double-click \`bin/start-oqualtix.bat\`

### Mac/Linux  
1. Open terminal
2. Run: \`./bin/start-oqualtix.sh\`

## 📁 Package Contents

- \`app/\` - Main application
- \`bin/\` - Launcher scripts
- \`data/\` - Local database storage
- \`config/\` - Configuration files
- \`docs/\` - Documentation
- \`logs/\` - Application logs

## 🔒 Security & Privacy

- **No data transmitted to external servers**
- **No internet connection required**
- **All processing happens locally**
- **Your financial data stays on your computer**

## 📞 Support

Email: oqualtix@outlook.com

---
Built: ${config.buildTimestamp}
Version: ${config.version}
Mode: ${config.mode}
`;

    fs.writeFileSync(path.join(packageDir, 'README.md'), packageReadme);

    // Create version information
    const versionInfo = {
      package: config.name,
      version: config.version,
      buildDate: config.buildTimestamp,
      mode: config.mode,
      standalone: true,
      internetRequired: false,
      externalDependencies: false,
      components: this.getIncludedComponents()
    };

    fs.writeFileSync(
      path.join(packageDir, 'VERSION.json'),
      JSON.stringify(versionInfo, null, 2)
    );

    console.log(`✅ Installation package ready: ${packageDir}`);
    console.log(`📊 Package size: ${this.getDirectorySize(packageDir)} MB`);
  }

  // Utility: Copy directory recursively
  copyDirectoryRecursive(src, dest) {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      fs.readdirSync(src).forEach(file => {
        this.copyDirectoryRecursive(
          path.join(src, file),
          path.join(dest, file)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Utility: Get directory size
  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const calculateSize = (filePath) => {
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        fs.readdirSync(filePath).forEach(file => {
          calculateSize(path.join(filePath, file));
        });
      } else {
        totalSize += stats.size;
      }
    };
    
    calculateSize(dirPath);
    return (totalSize / (1024 * 1024)).toFixed(2);
  }

  // Build all deployment types
  async buildAllDeployments() {
    console.log('🏗️  Building all standalone deployment types...\n');
    
    const deployments = [];
    
    for (const [mode, description] of Object.entries(this.deploymentModes)) {
      console.log(`\n🔧 Building ${mode}: ${description}`);
      const config = await this.buildStandalonePackage(mode);
      deployments.push(config);
    }

    console.log('\n🎉 All standalone deployments ready!');
    console.log('\n📦 Available packages:');
    deployments.forEach(config => {
      console.log(`   - ${config.name} (${config.mode})`);
    });

    return deployments;
  }
}

// CLI Interface
async function main() {
  console.log('🚀 Oqualtix Standalone Builder');
  console.log('===============================\n');

  const builder = new OqualtixStandaloneBuilder();
  
  const args = process.argv.slice(2);
  const mode = args[0] || 'ALL';

  if (mode === 'ALL') {
    await builder.buildAllDeployments();
  } else {
    await builder.buildStandalonePackage(mode.toUpperCase());
  }

  console.log('\n✅ Standalone build complete!');
  console.log('🛡️  Your fraud detection system is ready to work anywhere!');
  console.log('📁 Check the ./dist/ directory for packages');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default OqualtixStandaloneBuilder;