/**
 * Unified tests for Activity Feed Virtualization
 * 
 * These tests run against both repository_before and repository_after.
 * - For repository_before: Tests should FAIL (confirming performance problems exist)
 * - For repository_after: Tests should PASS (confirming optimizations work)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPO_BEFORE = path.join(ROOT, 'repository_before', 'activity-feed-virtualization', 'src');
const REPO_AFTER = path.join(ROOT, 'repository_after', 'src');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return '';
  }
}

function testVirtualization(repoPath, repoName) {
  const tests = [];
  
  // Test 1: Check for VirtualList component
  const virtualListPath = path.join(repoPath, 'components', 'VirtualList.js');
  const hasVirtualList = fs.existsSync(virtualListPath);
  
  tests.push({
    name: `${repoName} should have VirtualList component`,
    passed: hasVirtualList,
    message: hasVirtualList 
      ? 'VirtualList component exists' 
      : 'VirtualList component missing - virtualization not implemented'
  });
  
  // Test 2: Check for useVirtualScroll hook
  const hookPath = path.join(repoPath, 'hooks', 'useVirtualScroll.js');
  const hasHook = fs.existsSync(hookPath);
  
  tests.push({
    name: `${repoName} should have useVirtualScroll hook`,
    passed: hasHook,
    message: hasHook 
      ? 'useVirtualScroll hook exists' 
      : 'useVirtualScroll hook missing - virtualization not implemented'
  });
  
  // Test 3: Check if VirtualList is used in ActivityFeed
  const activityFeedPath = path.join(repoPath, 'components', 'ActivityFeed.js');
  const appPath = path.join(repoPath, 'App.js');
  
  let usesVirtualList = false;
  if (fs.existsSync(activityFeedPath)) {
    const content = readFile(activityFeedPath);
    usesVirtualList = content.includes('VirtualList') && content.includes('import');
  } else if (fs.existsSync(appPath)) {
    const content = readFile(appPath);
    usesVirtualList = content.includes('VirtualList') && content.includes('import');
  }
  
  tests.push({
    name: `${repoName} should use VirtualList in ActivityFeed`,
    passed: usesVirtualList,
    message: usesVirtualList 
      ? 'VirtualList is used in ActivityFeed' 
      : 'VirtualList not used - still rendering all items directly'
  });
  
  // Test 4: Check for .slice() usage (virtualization technique)
  let hasSlice = false;
  if (fs.existsSync(virtualListPath)) {
    const content = readFile(virtualListPath);
    hasSlice = /\.slice\s*\(/.test(content);
  }
  
  tests.push({
    name: `${repoName} should slice items before rendering`,
    passed: hasSlice,
    message: hasSlice 
      ? 'Items are sliced before rendering (virtualization working)' 
      : 'Items not sliced - all items rendered to DOM'
  });
  
  // Test 5: Check for visibleRange or similar virtualization logic
  let hasVisibleRange = false;
  if (fs.existsSync(virtualListPath)) {
    const content = readFile(virtualListPath);
    hasVisibleRange = /visibleRange|visibleItems|visible/.test(content);
  }
  if (!hasVisibleRange && fs.existsSync(hookPath)) {
    const content = readFile(hookPath);
    hasVisibleRange = /visibleRange|start|end/.test(content);
  }
  
  tests.push({
    name: `${repoName} should calculate visible range`,
    passed: hasVisibleRange,
    message: hasVisibleRange 
      ? 'Visible range calculation exists' 
      : 'Visible range calculation missing - no virtualization logic'
  });
  
  // Test 6: Check that it does NOT directly map all items
  let hasDirectMap = false;
  if (fs.existsSync(activityFeedPath)) {
    const content = readFile(activityFeedPath);
    // Check for direct .map() on filteredActivities that renders ActivityItem
    hasDirectMap = /filteredActivities\.map\s*\([^)]*\)\s*=>\s*<ActivityItem/.test(content);
  } else if (fs.existsSync(appPath)) {
    const content = readFile(appPath);
    hasDirectMap = /filteredActivities\.map\s*\([^)]*\)\s*=>\s*<ActivityItem/.test(content);
  }
  
  tests.push({
    name: `${repoName} should NOT directly map all items`,
    passed: !hasDirectMap,
    message: !hasDirectMap 
      ? 'No direct mapping of all items (using virtualization)' 
      : 'Direct mapping of all items detected - performance problem'
  });
  
  return tests;
}

// Export test functions for use in evaluation script
module.exports = {
  testVirtualization,
  REPO_BEFORE,
  REPO_AFTER
};

// If run directly, execute tests
if (require.main === module) {
  const repoName = process.argv[2] || 'after';
  const repoPath = repoName === 'before' ? REPO_BEFORE : REPO_AFTER;
  
  console.log(`\nTesting ${repoName} repository...\n`);
  const tests = testVirtualization(repoPath, repoName);
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    if (test.passed) {
      console.log(`✓ ${test.name}`);
      passed++;
    } else {
      console.log(`✕ ${test.name}`);
      console.log(`  ${test.message}`);
      failed++;
    }
  });
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}
