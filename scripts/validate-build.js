/**
 * Build Validation Script for Oqualtix App
 * Validates project structure and dependencies before build
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Oqualtix build validation...');

// Check essential files
const essentialFiles = [
  'package.json',
  'App.js',
  'app.json',
  'babel.config.js'
];

let missingFiles = [];
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    missingFiles.push(file);
  }
});

// Check project structure
const requiredDirs = [
  'src',
  'src/screens',
  'src/services',
  'src/utils',
  'src/components'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
    console.log(`✅ ${dir}/ (${files.length} files)`);
  } else {
    console.log(`⚠️ ${dir}/ not found`);
  }
});

// Validate package.json
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package: ${pkg.name} v${pkg.version}`);
  
  const requiredScripts = ['start', 'test', 'lint'];
  const missingScripts = requiredScripts.filter(script => !pkg.scripts[script]);
  
  if (missingScripts.length > 0) {
    console.log(`⚠️ Missing scripts: ${missingScripts.join(', ')}`);
  } else {
    console.log('✅ All required scripts present');
  }
} catch (error) {
  console.log('❌ package.json validation failed:', error.message);
  process.exit(1);
}

// Check Expo configuration
try {
  const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  if (appConfig.expo) {
    console.log(`✅ Expo app: ${appConfig.expo.name} (${appConfig.expo.slug})`);
  } else {
    console.log('⚠️ Expo configuration incomplete');
  }
} catch (error) {
  console.log('❌ app.json validation failed:', error.message);
}

if (missingFiles.length > 1) {
  console.log(`❌ Build validation failed: ${missingFiles.length} essential files missing`);
  process.exit(1);
}

console.log('✅ Build validation completed successfully!');
console.log('🚀 Project is ready for build');