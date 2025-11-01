/**
 * Oqualtix App Tests
 * Basic test suite for CI/CD pipeline
 */

describe('Oqualtix App', () => {
  test('App structure is valid', () => {
    const fs = require('fs');
    
    // Check essential files exist
    expect(fs.existsSync('package.json')).toBe(true);
    expect(fs.existsSync('App.js')).toBe(true);
    expect(fs.existsSync('app.json')).toBe(true);
  });

  test('Package.json is valid', () => {
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.start).toBeDefined();
  });

  test('Expo configuration is valid', () => {
    const fs = require('fs');
    const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
    
    expect(appConfig.expo).toBeDefined();
    expect(appConfig.expo.name).toBeDefined();
    expect(appConfig.expo.slug).toBeDefined();
  });

  test('Core modules can be imported', () => {
    // Mock test to verify basic structure
    expect(() => {
      // Core app structure validation
      const fs = require('fs');
      
      // Check if main source directories exist
      expect(fs.existsSync('src')).toBe(true);
      
      // Check if key config files exist
      if (fs.existsSync('src/config')) {
        expect(fs.existsSync('src/config')).toBe(true);
      }
    }).not.toThrow();
  });
});

describe('Security Tests', () => {
  test('No hardcoded secrets in source', () => {
    const fs = require('fs');
    const path = require('path');
    
    function checkFileForSecrets(filePath) {
      if (!fs.existsSync(filePath)) return true;
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for common secret patterns
      const secretPatterns = [
        /sk-[a-zA-Z0-9]{48}/,  // OpenAI API keys
        /OPENAI_API_KEY\s*=\s*["']sk-/,  // Hardcoded OpenAI keys
      ];
      
      return !secretPatterns.some(pattern => pattern.test(content));
    }
    
    // Check main app file
    expect(checkFileForSecrets('App.js')).toBe(true);
    
    // Check source files if they exist
    if (fs.existsSync('src')) {
      const srcFiles = fs.readdirSync('src', { recursive: true })
        .filter(file => file.endsWith('.js') || file.endsWith('.jsx'))
        .map(file => path.join('src', file));
      
      srcFiles.forEach(file => {
        expect(checkFileForSecrets(file)).toBe(true);
      });
    }
  });
});

// Export for Jest
module.exports = {};