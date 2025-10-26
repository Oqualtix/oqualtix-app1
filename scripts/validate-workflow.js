#!/usr/bin/env node

/**
 * GitHub Workflow Validation Script
 * Validates CI/CD workflow configuration and dependencies
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

console.log('🔍 GitHub Workflow Validation Starting...\n');

function validateWorkflowFile(filePath) {
  try {
    console.log(`📄 Validating: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ Workflow file not found');
      return false;
    }
    
    // Read and parse YAML
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = yaml.load(content);
    
    // Basic structure validation
    const requiredKeys = ['name', 'on', 'jobs'];
    for (const key of requiredKeys) {
      if (!workflow[key]) {
        console.log(`❌ Missing required key: ${key}`);
        return false;
      }
    }
    
    console.log('✅ YAML structure is valid');
    
    // Job validation
    const jobs = workflow.jobs;
    const jobNames = Object.keys(jobs);
    
    console.log(`📋 Found ${jobNames.length} jobs: ${jobNames.join(', ')}`);
    
    // Check job dependencies
    const jobDependencies = {};
    for (const [jobName, jobConfig] of Object.entries(jobs)) {
      if (jobConfig.needs) {
        const needs = Array.isArray(jobConfig.needs) ? jobConfig.needs : [jobConfig.needs];
        jobDependencies[jobName] = needs;
        
        // Validate dependencies exist
        for (const dep of needs) {
          if (!jobs[dep]) {
            console.log(`❌ Job "${jobName}" depends on non-existent job "${dep}"`);
            return false;
          }
        }
      }
    }
    
    console.log('✅ Job dependencies are valid');
    
    // Check for consistent Node.js versions
    const nodeVersions = new Set();
    for (const [jobName, jobConfig] of Object.entries(jobs)) {
      if (jobConfig.steps) {
        for (const step of jobConfig.steps) {
          if (step.uses && step.uses.includes('actions/setup-node')) {
            const nodeVersion = step.with?.['node-version'];
            if (nodeVersion) {
              nodeVersions.add(nodeVersion);
            }
          }
        }
      }
    }
    
    if (nodeVersions.size > 1) {
      console.log(`⚠️ Inconsistent Node.js versions found: ${Array.from(nodeVersions).join(', ')}`);
    } else {
      console.log('✅ Consistent Node.js versions');
    }
    
    // Check cache configurations
    let cacheConfigurations = 0;
    for (const [jobName, jobConfig] of Object.entries(jobs)) {
      if (jobConfig.steps) {
        for (const step of jobConfig.steps) {
          if (step.uses && step.uses.includes('actions/setup-node') && step.with?.cache) {
            cacheConfigurations++;
            const cachePath = step.with['cache-dependency-path'];
            if (cachePath) {
              console.log(`📦 ${jobName}: Using cache path "${cachePath}"`);
            }
          }
        }
      }
    }
    
    console.log(`✅ Found ${cacheConfigurations} cache configurations`);
    
    console.log('🎉 Workflow validation completed successfully!\n');
    return true;
    
  } catch (error) {
    console.log(`❌ Validation error: ${error.message}`);
    return false;
  }
}

function checkProjectDependencies() {
  console.log('📦 Checking project dependencies...');
  
  // Check package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('✅ package.json found');
    
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`📋 Package: ${pkg.name} v${pkg.version}`);
    
    // Check for essential scripts
    const scripts = pkg.scripts || {};
    const essentialScripts = ['start'];
    const missingScripts = essentialScripts.filter(s => !scripts[s]);
    
    if (missingScripts.length > 0) {
      console.log(`⚠️ Missing scripts: ${missingScripts.join(', ')}`);
    } else {
      console.log('✅ All essential scripts present');
    }
  } else {
    console.log('❌ package.json not found');
    return false;
  }
  
  // Check package-lock.json
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    console.log('✅ package-lock.json found (enables npm caching)');
  } else {
    console.log('⚠️ package-lock.json not found (may affect caching)');
  }
  
  return true;
}

async function main() {
  try {
    // Validate the main workflow file
    const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'ci-cd.yml');
    const workflowValid = validateWorkflowFile(workflowPath);
    
    // Check project dependencies
    const depsValid = checkProjectDependencies();
    
    if (workflowValid && depsValid) {
      console.log('🚀 All workflow validations passed!');
      console.log('✅ GitHub Actions workflow is ready for deployment');
    } else {
      console.log('⚠️ Some validation issues found - check output above');
    }
    
  } catch (error) {
    console.error('❌ Validation script error:', error.message);
    process.exit(1);
  }
}

// Check if js-yaml is available
try {
  require('js-yaml');
  main();
} catch (error) {
  console.log('⚠️ js-yaml not available, installing...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npm install js-yaml --no-save', { stdio: 'inherit' });
    console.log('✅ js-yaml installed, restarting validation...\n');
    delete require.cache[require.resolve('js-yaml')];
    main();
  } catch (installError) {
    console.log('❌ Could not install js-yaml, performing basic validation...');
    
    // Basic validation without YAML parsing
    const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'ci-cd.yml');
    if (fs.existsSync(workflowPath)) {
      console.log('✅ Workflow file exists');
      const content = fs.readFileSync(workflowPath, 'utf8');
      if (content.includes('name:') && content.includes('jobs:')) {
        console.log('✅ Basic YAML structure appears valid');
      }
    }
    
    checkProjectDependencies();
  }
}