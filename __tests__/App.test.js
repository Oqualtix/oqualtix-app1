/**
 * Oqualtix App Tests
 * Basic test suite for CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');

describe('Oqualtix App - Project Structure', () => {
  test('Essential files exist', () => {
    // Check essential files exist
    expect(fs.existsSync('package.json')).toBe(true);
    expect(fs.existsSync('App.js')).toBe(true);
    expect(fs.existsSync('app.json')).toBe(true);
    expect(fs.existsSync('babel.config.js')).toBe(true);
  });

  test('Package.json is valid JSON', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    
    let pkg;
    expect(() => {
      pkg = JSON.parse(packageContent);
    }).not.toThrow();
    
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.start).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });

  test('App.json Expo configuration is valid', () => {
    const appConfigPath = path.join(process.cwd(), 'app.json');
    const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
    
    let appConfig;
    expect(() => {
      appConfig = JSON.parse(appConfigContent);
    }).not.toThrow();
    
    expect(appConfig.expo).toBeDefined();
    expect(appConfig.expo.name).toBeDefined();
    expect(appConfig.expo.slug).toBeDefined();
    expect(appConfig.expo.version).toBeDefined();
  });

  test('Source directory structure exists', () => {
    expect(fs.existsSync('src')).toBe(true);
    
    // Check key directories
    const keyDirs = [
      'src/screens',
      'src/services', 
      'src/utils',
      'src/components',
      'src/config'
    ];
    
    keyDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        expect(fs.statSync(dir).isDirectory()).toBe(true);
      }
    });
  });
});

describe('Oqualtix App - Security', () => {
  test('No hardcoded API keys in source files', () => {
    const srcPath = path.join(process.cwd(), 'src');
    
    if (!fs.existsSync(srcPath)) {
      return; // Skip if src doesn't exist
    }
    
    function scanDirectory(dirPath) {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
          const content = fs.readFileSync(itemPath, 'utf8');
          
          // Check for OpenAI API keys
          expect(content).not.toMatch(/sk-[a-zA-Z0-9]{48}/);
          
          // Check for hardcoded OPENAI_API_KEY
          expect(content).not.toMatch(/OPENAI_API_KEY\s*=\s*["']sk-/);
        }
      });
    }
    
    scanDirectory(srcPath);
  });

  test('No .env files in repository', () => {
    const envFiles = ['.env', '.env.local', '.env.production'];
    
    envFiles.forEach(envFile => {
      expect(fs.existsSync(envFile)).toBe(false);
    });
  });
});

describe('Oqualtix App - Build Requirements', () => {
  test('Babel configuration exists', () => {
    expect(fs.existsSync('babel.config.js')).toBe(true);
  });

  test('Required scripts are present', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredScripts = ['start', 'test', 'lint'];
    requiredScripts.forEach(script => {
      expect(pkg.scripts[script]).toBeDefined();
    });
  });

  test('Dependencies are properly defined', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    expect(pkg.dependencies).toBeDefined();
    expect(pkg.devDependencies).toBeDefined();
    
    // Check for key dependencies
    expect(pkg.dependencies.expo).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies['react-native']).toBeDefined();
  });
});