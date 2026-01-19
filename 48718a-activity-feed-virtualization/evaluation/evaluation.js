#!/usr/bin/env node
/**
 * Evaluation script for Activity Feed Virtualization project.
 * 
 * This script:
 * 1. Runs tests for repository_before and repository_after
 * 2. Collects test results and metrics
 * 3. Generates evaluation report in standard format
 * 4. Works with Docker containers or local execution
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const ROOT = path.resolve(__dirname, '..');
const REPORTS = path.join(ROOT, 'evaluation', 'reports');
const REPO_BEFORE = path.join(ROOT, 'repository_before', 'activity-feed-virtualization');
const REPO_AFTER = path.join(ROOT, 'repository_after');

function getGitInfo() {
  let commit = 'unknown';
  let branch = 'unknown';
  
  try {
    commit = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf-8', timeout: 5000 }).trim() || 'unknown';
  } catch (e) {
    // Ignore
  }
  
  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf-8', timeout: 5000 }).trim() || 'unknown';
  } catch (e) {
    // Ignore
  }
  
  return { git_commit: commit, git_branch: branch };
}

function environmentInfo() {
  const gitInfo = getGitInfo();
  
  return {
    node_version: process.version,
    platform: process.platform,
    os: require('os').type(),
    os_release: require('os').release(),
    architecture: require('os').arch(),
    hostname: require('os').hostname(),
    ...gitInfo
  };
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return '';
  }
}

function parseJestOutput(output) {
  try {
    // Try to parse as JSON first
    const jsonData = JSON.parse(output);
    
    const tests = [];
    for (const testResult of jsonData.testResults || []) {
      for (const assertion of testResult.assertionResults || []) {
        tests.push({
          nodeid: assertion.fullName || '',
          name: assertion.title || '',
          outcome: assertion.status === 'passed' ? 'passed' : 'failed'
        });
      }
    }
    
    const summary = {
      total: jsonData.numTotalTests || 0,
      passed: jsonData.numPassedTests || 0,
      failed: jsonData.numFailedTests || 0,
      errors: 0,
      skipped: jsonData.numPendingTests || 0
    };
    
    return { tests, summary };
  } catch (e) {
    // Fallback to text parsing
    return parseJestText(output);
  }
}

function parseJestText(output) {
  const tests = [];
  const summary = { total: 0, passed: 0, failed: 0, errors: 0, skipped: 0 };
  
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('PASS') || line.includes('✓')) {
      const testName = line.trim();
      tests.push({
        nodeid: testName,
        name: testName.split('/').pop().replace('.test.js', '').replace('.test.jsx', ''),
        outcome: 'passed'
      });
      summary.passed++;
      summary.total++;
    } else if (line.includes('FAIL') || line.includes('✕')) {
      const parts = line.split(/\s+/);
      const testName = parts[1] || line.trim();
      tests.push({
        nodeid: testName,
        name: testName.split('/').pop().replace('.test.js', '').replace('.test.jsx', ''),
        outcome: 'failed'
      });
      summary.failed++;
      summary.total++;
    }
    
    // Parse summary line
    const summaryMatch = line.match(/Tests:\s*(\d+)\s+passed,\s*(\d+)\s+failed/);
    if (summaryMatch) {
      summary.passed = parseInt(summaryMatch[1], 10);
      summary.failed = parseInt(summaryMatch[2], 10);
      summary.total = summary.passed + summary.failed;
    }
  }
  
  return { tests, summary };
}

function runUnifiedTests(repoName) {
  try {
    const { testVirtualization, REPO_BEFORE, REPO_AFTER } = require('../tests/virtualization.test.js');
    const repoPath = repoName === 'before' ? REPO_BEFORE : REPO_AFTER;
    
    const testResults = testVirtualization(repoPath, repoName);
    
    const tests = testResults.map((test, index) => ({
      nodeid: `tests/virtualization.test.js::${test.name}`,
      name: test.name,
      outcome: test.passed ? 'passed' : 'failed'
    }));
    
    const passed = testResults.filter(t => t.passed).length;
    const failed = testResults.filter(t => !t.passed).length;
    
    return {
      success: failed === 0,
      exit_code: failed === 0 ? 0 : 1,
      tests,
      summary: {
        total: testResults.length,
        passed,
        failed,
        errors: 0,
        skipped: 0
      },
      stdout: testResults.map(t => `${t.passed ? 'PASS' : 'FAIL'} ${t.name}: ${t.message}`).join('\n'),
      stderr: ''
    };
  } catch (e) {
    return {
      success: false,
      exit_code: -1,
      tests: [],
      summary: { total: 0, passed: 0, failed: 0, errors: 1, skipped: 0 },
      stdout: '',
      stderr: e.message || 'Test execution failed'
    };
  }
}

function runTests(repoName, repoPath) {
  // Use unified tests instead of Jest tests
  return runUnifiedTests(repoName);
}

function runMetrics(repoPath) {
  const metrics = {};
  
  try {
    const srcPath = path.join(repoPath, 'src');
    if (fs.existsSync(srcPath)) {
      const sourceFiles = [];
      const testFiles = [];
      
      function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            walkDir(filePath);
          } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            if (file.includes('.test.') || file.includes('.spec.')) {
              testFiles.push(filePath);
            } else {
              sourceFiles.push(filePath);
            }
          }
        }
      }
      
      walkDir(srcPath);
      
      metrics.source_files = sourceFiles.length;
      metrics.test_files = testFiles.length;
      
      // Check for coverage
      const coveragePath = path.join(repoPath, 'coverage', 'coverage-summary.json');
      if (fs.existsSync(coveragePath)) {
        try {
          const coverageData = JSON.parse(readFile(coveragePath));
          const total = coverageData.total || {};
          metrics.coverage_lines = total.lines?.pct || 0;
          metrics.coverage_functions = total.functions?.pct || 0;
          metrics.coverage_branches = total.branches?.pct || 0;
        } catch (e) {
          // Ignore
        }
      }
    }
  } catch (e) {
    // Metrics are optional
  }
  
  return metrics;
}

function evaluate(repoName, repoPath) {
  // Run tests using the unified test file
  const testResults = runTests(repoName, repoPath);
  
  // For before: tests should fail (confirming problems exist) - this is expected
  // For after: tests should pass (confirming optimizations work) - this is required
  let success;
  if (repoName === 'before') {
    // Before tests are designed to FAIL (confirming it lacks virtualization)
    // This is expected behavior - tests identify the problem
    // We consider it "success" if tests run (build succeeded), even if tests fail
    success = true; // Build succeeded, tests ran (failures are expected)
  } else {
    // After tests should PASS (confirming it has virtualization)
    success = testResults.success;
  }
  
  const metrics = runMetrics(repoPath);
  
  return {
    success,
    exit_code: success ? 0 : 1,
    tests: testResults.tests,
    summary: testResults.summary,
    stdout: testResults.stdout,
    stderr: testResults.stderr,
    metrics
  };
}

function runEvaluation() {
  const runId = uuidv4().substring(0, 8);
  const start = new Date().toISOString();
  
  // Evaluate both repositories
  const before = evaluate('before', REPO_BEFORE);
  const after = evaluate('after', REPO_AFTER);
  
  const end = new Date().toISOString();
  const duration = (new Date(end) - new Date(start)) / 1000;
  
  // Create comparison
  const comparison = {
    before_tests_passed: before.success,
    after_tests_passed: after.success,
    before_total: before.summary.total,
    before_passed: before.summary.passed,
    before_failed: before.summary.failed,
    after_total: after.summary.total,
    after_passed: after.summary.passed,
    after_failed: after.summary.failed
  };
  
  // Determine success (after must pass tests, confirming optimizations work)
  const success = after.success;
  
  // Build report
  const report = {
    run_id: runId,
    started_at: start,
    finished_at: end,
    duration_seconds: duration,
    success,
    error: null,
    environment: environmentInfo(),
    results: {
      before: {
        success: before.success,
        exit_code: before.exit_code,
        tests: before.tests,
        summary: before.summary,
        stdout: before.stdout,
        stderr: before.stderr,
        metrics: before.metrics
      },
      after: {
        success: after.success,
        exit_code: after.exit_code,
        tests: after.tests,
        summary: after.summary,
        stdout: after.stdout,
        stderr: after.stderr,
        metrics: after.metrics
      },
      comparison
    }
  };
  
  return report;
}

function main() {
  try {
    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS)) {
      fs.mkdirSync(REPORTS, { recursive: true });
    }
    
    // Run evaluation
    const report = runEvaluation();
    
    // Write latest.json
    const latestPath = path.join(REPORTS, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
    console.log(`Report written to ${latestPath}`);
    
    // Write report.json (same content)
    const reportPath = path.join(REPORTS, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report written to ${reportPath}`);
    
    // Print summary
    console.log('\n' + '='.repeat(70));
    console.log('EVALUATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Run ID: ${report.run_id}`);
    console.log(`Duration: ${report.duration_seconds.toFixed(2)} seconds`);
    console.log(`\nBefore: ${report.results.before.summary.passed}/${report.results.before.summary.total} tests passed`);
    console.log(`After:  ${report.results.after.summary.passed}/${report.results.after.summary.total} tests passed`);
    console.log(`\nSuccess: ${report.success}`);
    console.log('='.repeat(70));
    
    process.exit(report.success ? 0 : 1);
  } catch (e) {
    // Create error report
    const errorReport = {
      run_id: uuidv4().substring(0, 8),
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      duration_seconds: 0.0,
      success: false,
      error: e.message,
      environment: environmentInfo(),
      results: {
        before: {
          success: false,
          exit_code: -1,
          tests: [],
          summary: { total: 0, passed: 0, failed: 0, errors: 1, skipped: 0 },
          stdout: '',
          stderr: e.message
        },
        after: {
          success: false,
          exit_code: -1,
          tests: [],
          summary: { total: 0, passed: 0, failed: 0, errors: 1, skipped: 0 },
          stdout: '',
          stderr: e.message
        },
        comparison: {}
      }
    };
    
    if (!fs.existsSync(REPORTS)) {
      fs.mkdirSync(REPORTS, { recursive: true });
    }
    
    const latestPath = path.join(REPORTS, 'latest.json');
    const reportPath = path.join(REPORTS, 'report.json');
    
    fs.writeFileSync(latestPath, JSON.stringify(errorReport, null, 2));
    fs.writeFileSync(reportPath, JSON.stringify(errorReport, null, 2));
    
    console.error(`Error during evaluation: ${e.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runEvaluation, evaluate, runTests };
