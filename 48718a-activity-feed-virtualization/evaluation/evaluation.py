#!/usr/bin/env python3
"""
Evaluation script for Activity Feed Virtualization project.

This script:
1. Runs tests for repository_before and repository_after
2. Collects test results and metrics
3. Generates evaluation report in standard format
4. Works with Docker containers
"""

import sys
import json
import time
import uuid
import platform
import subprocess
import socket
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

# Paths
ROOT = Path(__file__).resolve().parent.parent
REPORTS = ROOT / "evaluation" / "reports"
REPO_BEFORE = ROOT / "repository_before" / "activity-feed-virtualization"
REPO_AFTER = ROOT / "repository_after"


def get_git_info() -> Dict[str, str]:
    """Get git commit and branch information."""
    try:
        commit = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5
        ).stdout.strip() or "unknown"
    except:
        commit = "unknown"
    
    try:
        branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5
        ).stdout.strip() or "unknown"
    except:
        branch = "unknown"
    
    return {
        "git_commit": commit,
        "git_branch": branch
    }


def environment_info() -> Dict[str, str]:
    """Collect environment information."""
    git_info = get_git_info()
    
    return {
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "os": platform.system(),
        "os_release": platform.release(),
        "architecture": platform.machine(),
        "hostname": socket.gethostname(),
        **git_info
    }


def parse_jest_json(json_output: str) -> Dict[str, Any]:
    """
    Parse Jest JSON output to extract test results.
    
    Returns:
        Dictionary with tests list and summary
    """
    try:
        data = json.loads(json_output)
        
        tests = []
        for test_result in data.get("testResults", []):
            for assertion in test_result.get("assertionResults", []):
                tests.append({
                    "nodeid": assertion.get("fullName", ""),
                    "name": assertion.get("title", ""),
                    "outcome": "passed" if assertion.get("status") == "passed" else "failed"
                })
        
        summary = {
            "total": data.get("numTotalTests", 0),
            "passed": data.get("numPassedTests", 0),
            "failed": data.get("numFailedTests", 0),
            "errors": 0,
            "skipped": data.get("numPendingTests", 0)
        }
        
        return {
            "tests": tests,
            "summary": summary
        }
    except json.JSONDecodeError:
        # Fallback to text parsing
        return parse_jest_text(json_output)


def parse_jest_text(output: str) -> Dict[str, Any]:
    """
    Parse Jest text output to extract test results (fallback).
    
    Returns:
        Dictionary with tests list and summary
    """
    tests = []
    summary = {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "errors": 0,
        "skipped": 0
    }
    
    lines = output.split('\n')
    
    # Look for test results
    for line in lines:
        # Jest format: "PASS src/__tests__/App.test.js"
        # or: "✓ renders app correctly"
        if "PASS" in line or "✓" in line:
            # Try to extract test name
            test_name = line.strip()
            if "PASS" in line:
                parts = line.split()
                if len(parts) > 1:
                    test_name = parts[1]
            
            tests.append({
                "nodeid": test_name,
                "name": test_name.split('/')[-1].replace('.test.js', '').replace('.test.jsx', ''),
                "outcome": "passed"
            })
            summary["passed"] += 1
            summary["total"] += 1
        
        elif "FAIL" in line or "✕" in line:
            parts = line.split()
            test_name = parts[1] if len(parts) > 1 else line.strip()
            
            tests.append({
                "nodeid": test_name,
                "name": test_name.split('/')[-1].replace('.test.js', '').replace('.test.jsx', ''),
                "outcome": "failed"
            })
            summary["failed"] += 1
            summary["total"] += 1
        
        # Parse summary (e.g., "Tests:       124 passed, 0 failed")
        import re
        if "Tests:" in line or "Test Suites:" in line:
            numbers = re.findall(r'\d+', line)
            if len(numbers) >= 2:
                try:
                    summary["passed"] = int(numbers[0])
                    summary["failed"] = int(numbers[1]) if len(numbers) > 1 else 0
                    summary["total"] = summary["passed"] + summary["failed"]
                except:
                    pass
    
    return {
        "tests": tests,
        "summary": summary
    }


def run_python_tests() -> Dict[str, Any]:
    """
    Run Python pytest tests from tests/ directory.
    
    These tests check code structure to verify virtual scrolling implementation.
    They check both repository_before and repository_after.
    
    Returns:
        Dictionary with test results
    """
    tests_dir = ROOT / "tests"
    
    try:
        # Run pytest with verbose output
        proc = subprocess.run(
            ["pytest", "tests/", "-v"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        # Parse pytest output
        return parse_pytest_output(proc.stdout + proc.stderr, proc.returncode)
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "exit_code": -1,
            "tests": [],
            "summary": {"total": 0, "passed": 0, "failed": 0, "errors": 1, "skipped": 0},
            "stdout": "",
            "stderr": "Test execution timeout"
        }
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "tests": [],
            "summary": {"total": 0, "passed": 0, "failed": 0, "errors": 1, "skipped": 0},
            "stdout": "",
            "stderr": f"Error: {str(e)}"
        }


def parse_pytest_output(output: str, return_code: int) -> Dict[str, Any]:
    """Parse pytest text output."""
    tests = []
    summary = {"total": 0, "passed": 0, "failed": 0, "errors": 0, "skipped": 0}
    
    lines = output.split('\n')
    seen_tests = set()  # Track seen tests to avoid duplicates
    
    for line in lines:
        # Parse test results: "PASSED tests/test_file.py::TestClass::test_name [ 20%]"
        # or "FAILED tests/test_file.py::TestClass::test_name [ 40%]"
        if ("PASSED" in line or "FAILED" in line):
            import re
            # Use regex to extract test path more reliably
            # Pattern: PASSED/FAILED followed by test path, optionally followed by [percentage]
            match = re.search(r'(PASSED|FAILED)\s+(tests/[^\s\[\]]+(?:::[^\s\[\]]+)*)', line)
            if match:
                outcome_str = match.group(1)
                test_path = match.group(2).strip()
                
                # Validate it's a real test path (has :: or starts with tests/)
                if "::" in test_path or test_path.startswith("tests/"):
                    outcome = "passed" if outcome_str == "PASSED" else "failed"
                    test_name = test_path.split("::")[-1] if "::" in test_path else test_path.split("/")[-1]
                    
                    # Avoid duplicates
                    if test_path not in seen_tests:
                        seen_tests.add(test_path)
                        tests.append({
                            "nodeid": test_path,
                            "name": test_name,
                            "outcome": outcome
                        })
        
        # Parse summary line: "5 passed, 0 failed in 0.82s" or "5 failed in 0.82s"
        import re
        if ("passed" in line.lower() or "failed" in line.lower()) and ("in" in line.lower() or "=" in line or "test session" in line.lower()):
            # Match patterns like "5 passed", "3 failed", "5 passed, 0 failed"
            passed_match = re.search(r'(\d+)\s+passed', line.lower())
            failed_match = re.search(r'(\d+)\s+failed', line.lower())
            
            if passed_match:
                try:
                    summary["passed"] = int(passed_match.group(1))
                except:
                    pass
            
            if failed_match:
                try:
                    summary["failed"] = int(failed_match.group(1))
                except:
                    pass
            
            if passed_match or failed_match:
                summary["total"] = summary["passed"] + summary["failed"]
    
    # Always calculate summary from parsed tests (source of truth)
    if len(tests) > 0:
        summary["total"] = len(tests)
        summary["passed"] = sum(1 for t in tests if t["outcome"] == "passed")
        summary["failed"] = sum(1 for t in tests if t["outcome"] == "failed")
    elif summary["total"] == 0:
        # If no tests parsed but summary has numbers, use summary
        # (fallback for edge cases)
        pass
    
    return {
        "success": return_code == 0,
        "exit_code": return_code,
        "tests": tests,
        "summary": summary,
        "stdout": output[:8000],
        "stderr": ""
    }


def run_tests_in_docker(repo_name: str, repo_path: Path) -> Dict[str, Any]:
    """
    Run tests in Docker container for the given repository.
    
    Args:
        repo_name: Name of repository ("before" or "after")
        repo_path: Path to repository directory
    
    Returns:
        Dictionary with test results
    """
    container_name = f"activity-feed-{repo_name}-test"
    
    try:
        # Build test image
        build_cmd = [
            "docker", "build",
            "-f", "Dockerfile.test",
            "-t", f"test-{repo_name}",
            "."
        ]
        
        build_proc = subprocess.run(
            build_cmd,
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if build_proc.returncode != 0:
            return {
                "success": False,
                "exit_code": build_proc.returncode,
                "tests": [],
                "summary": {
                    "total": 0,
                    "passed": 0,
                    "failed": 0,
                    "errors": 1,
                    "skipped": 0
                },
                "stdout": build_proc.stdout[:8000],
                "stderr": build_proc.stderr[:8000]
            }
        
        # Run tests in container with JSON output
        # Note: --rm removes container immediately, so we capture stdout directly
        run_cmd = [
            "docker", "run",
            "--rm",
            "--name", container_name,
            f"test-{repo_name}"
        ]
        
        run_proc = subprocess.run(
            run_cmd,
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        # Parse output (Jest JSON output goes to stdout)
        full_output = run_proc.stdout + run_proc.stderr
        
        # Try to parse as JSON first (Jest --json outputs JSON to stdout)
        try:
            # Jest JSON output is on stdout
            if run_proc.stdout.strip().startswith('{'):
                parsed = parse_jest_json(run_proc.stdout)
            else:
                parsed = parse_jest_text(full_output)
        except:
            parsed = parse_jest_text(full_output)
        
        return {
            "success": run_proc.returncode == 0,
            "exit_code": run_proc.returncode,
            "tests": parsed["tests"],
            "summary": parsed["summary"],
            "stdout": run_proc.stdout[:8000],
            "stderr": run_proc.stderr[:8000]
        }
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "exit_code": -1,
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "errors": 1,
                "skipped": 0
            },
            "stdout": "",
            "stderr": "Test execution timeout (exceeded 300 seconds)"
        }
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "errors": 1,
                "skipped": 0
            },
            "stdout": "",
            "stderr": f"Error running tests: {str(e)}"
        }


def run_tests_local(repo_name: str, repo_path: Path) -> Dict[str, Any]:
    """
    Run tests locally (fallback if Docker not available).
    
    Args:
        repo_name: Name of repository ("before" or "after")
        repo_path: Path to repository directory
    
    Returns:
        Dictionary with test results
    """
    try:
        # Check if node_modules exists
        if not (repo_path / "node_modules").exists():
            # Try to install dependencies
            install_proc = subprocess.run(
                ["npm", "install"],
                cwd=repo_path,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            if install_proc.returncode != 0:
                return {
                    "success": False,
                    "exit_code": install_proc.returncode,
                    "tests": [],
                    "summary": {
                        "total": 0,
                        "passed": 0,
                        "failed": 0,
                        "errors": 1,
                        "skipped": 0
                    },
                    "stdout": install_proc.stdout[:8000],
                    "stderr": install_proc.stderr[:8000]
                }
        
        # Run tests with JSON output
        test_proc = subprocess.run(
            ["npm", "test", "--", "--watchAll=false", "--json"],
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=300
        )
        
        # Parse output (try JSON first, fallback to text)
        full_output = test_proc.stdout + test_proc.stderr
        try:
            parsed = parse_jest_json(test_proc.stdout)
        except:
            parsed = parse_jest_text(full_output)
        
        return {
            "success": test_proc.returncode == 0,
            "exit_code": test_proc.returncode,
            "tests": parsed["tests"],
            "summary": parsed["summary"],
            "stdout": test_proc.stdout[:8000],
            "stderr": test_proc.stderr[:8000]
        }
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "exit_code": -1,
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "errors": 1,
                "skipped": 0
            },
            "stdout": "",
            "stderr": "Test execution timeout (exceeded 300 seconds)"
        }
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "errors": 1,
                "skipped": 0
            },
            "stdout": "",
            "stderr": f"Error running tests: {str(e)}"
        }


def run_metrics(repo_path: Path) -> Dict[str, Any]:
    """
    Collect optional metrics for the repository.
    
    For this project, we can collect:
    - File count
    - Test file count
    - Code coverage (if available)
    """
    metrics = {}
    
    try:
        # Count source files
        src_files = list((repo_path / "src").rglob("*.js")) + list((repo_path / "src").rglob("*.jsx"))
        metrics["source_files"] = len(src_files)
        
        # Count test files
        test_files = list((repo_path / "src").rglob("*.test.js")) + list((repo_path / "src").rglob("*.test.jsx"))
        metrics["test_files"] = len(test_files)
        
        # Check if coverage report exists
        coverage_path = repo_path / "coverage" / "coverage-summary.json"
        if coverage_path.exists():
            try:
                with open(coverage_path) as f:
                    coverage_data = json.load(f)
                    total = coverage_data.get("total", {})
                    metrics["coverage_lines"] = total.get("lines", {}).get("pct", 0)
                    metrics["coverage_functions"] = total.get("functions", {}).get("pct", 0)
                    metrics["coverage_branches"] = total.get("branches", {}).get("pct", 0)
            except:
                pass
        
    except Exception as e:
        # Metrics are optional, don't fail on errors
        pass
    
    return metrics


def evaluate(repo_name: str, repo_path: Path) -> Dict[str, Any]:
    """
    Evaluate a repository by running tests and collecting metrics.
    
    For this project, we run Python tests that check code structure.
    The tests verify virtual scrolling implementation.
    
    Args:
        repo_name: Name of repository ("before" or "after")
        repo_path: Path to repository directory
    
    Returns:
        Dictionary with test results and metrics
    """
    # Run repository-specific tests
    if repo_name == "before":
        # Run tests for repository_before (these should fail, confirming problems)
        test_file = "tests/test_repository_before.py"
    else:
        # Run tests for repository_after (these should pass, confirming optimizations)
        test_file = "tests/test_repository_after.py"
    
    try:
        # Run pytest on specific test file
        proc = subprocess.run(
            ["pytest", test_file, "-v"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        # Parse pytest output
        test_results = parse_pytest_output(proc.stdout + proc.stderr, proc.returncode)
        
        # For before: tests should fail (confirming problems exist) - this is expected
        # For after: tests should pass (confirming optimizations work) - this is required
        if repo_name == "before":
            # Before tests are designed to FAIL (confirming it lacks virtualization)
            # This is expected behavior - tests identify the problem
            # We consider it "success" if tests run (build succeeded), even if tests fail
            # The failures confirm the performance problems exist
            success = True  # Build succeeded, tests ran (failures are expected)
        else:
            # After tests should PASS (confirming it has virtualization)
            # This is required - if tests fail, optimization didn't work
            success = test_results["success"]
        
        metrics = run_metrics(repo_path)
        
        return {
            "success": success,
            "exit_code": 0 if success else 1,
            "tests": test_results["tests"],
            "summary": test_results["summary"],
            "stdout": test_results["stdout"][:8000],
            "stderr": test_results["stderr"][:8000],
            "metrics": metrics
        }
        
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "tests": [],
            "summary": {"total": 0, "passed": 0, "failed": 0, "errors": 1, "skipped": 0},
            "stdout": "",
            "stderr": f"Error running tests: {str(e)}",
            "metrics": {}
        }


def run_evaluation() -> Dict[str, Any]:
    """
    Run the complete evaluation comparing before and after repositories.
    
    Returns:
        Complete evaluation report dictionary
    """
    run_id = str(uuid.uuid4())[:8]  # Short ID like in example
    start = datetime.utcnow()
    
    # Evaluate both repositories
    before = evaluate("before", REPO_BEFORE)
    after = evaluate("after", REPO_AFTER)
    
    # Create comparison
    comparison = {
        "before_tests_passed": before["success"],
        "after_tests_passed": after["success"],
        "before_total": before["summary"]["total"],
        "before_passed": before["summary"]["passed"],
        "before_failed": before["summary"]["failed"],
        "after_total": after["summary"]["total"],
        "after_passed": after["summary"]["passed"],
        "after_failed": after["summary"]["failed"]
    }
    
    # Determine success (after must pass tests, confirming optimizations work)
    # Before tests may fail (confirming problems exist), but that's expected
    success = after["success"]
    
    end = datetime.utcnow()
    duration = (end - start).total_seconds()
    
    # Build report
    report = {
        "run_id": run_id,
        "started_at": start.isoformat(),
        "finished_at": end.isoformat(),
        "duration_seconds": duration,
        "success": success,
        "error": None,
        "environment": environment_info(),
        "results": {
            "before": {
                "success": before["success"],
                "exit_code": before["exit_code"],
                "tests": before["tests"],
                "summary": before["summary"],
                "stdout": before["stdout"],
                "stderr": before["stderr"]
            },
            "after": {
                "success": after["success"],
                "exit_code": after["exit_code"],
                "tests": after["tests"],
                "summary": after["summary"],
                "stdout": after["stdout"],
                "stderr": after["stderr"]
            },
            "comparison": comparison
        }
    }
    
    return report


def main() -> int:
    """
    Main entry point for evaluation script.
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    try:
        # Ensure reports directory exists
        REPORTS.mkdir(parents=True, exist_ok=True)
        
        # Run evaluation
        report = run_evaluation()
        
        # Write latest.json
        latest_path = REPORTS / "latest.json"
        latest_path.write_text(json.dumps(report, indent=2))
        print(f"Report written to {latest_path}")
        
        # Write report.json (same content)
        report_path = REPORTS / "report.json"
        report_path.write_text(json.dumps(report, indent=2))
        print(f"Report written to {report_path}")
        
        # Print summary
        print("\n" + "="*70)
        print("EVALUATION SUMMARY")
        print("="*70)
        print(f"Run ID: {report['run_id']}")
        print(f"Duration: {report['duration_seconds']:.2f} seconds")
        print(f"\nBefore: {report['results']['before']['summary']['passed']}/{report['results']['before']['summary']['total']} tests passed")
        print(f"After:  {report['results']['after']['summary']['passed']}/{report['results']['after']['summary']['total']} tests passed")
        print(f"\nSuccess: {report['success']}")
        print("="*70)
        
        return 0 if report["success"] else 1
        
    except Exception as e:
        # Create error report
        error_report = {
            "run_id": str(uuid.uuid4())[:8],
            "started_at": datetime.utcnow().isoformat(),
            "finished_at": datetime.utcnow().isoformat(),
            "duration_seconds": 0.0,
            "success": False,
            "error": str(e),
            "environment": environment_info(),
            "results": {
                "before": {
                    "success": False,
                    "exit_code": -1,
                    "tests": [],
                    "summary": {"total": 0, "passed": 0, "failed": 0, "errors": 1, "skipped": 0},
                    "stdout": "",
                    "stderr": str(e)
                },
                "after": {
                    "success": False,
                    "exit_code": -1,
                    "tests": [],
                    "summary": {"total": 0, "passed": 0, "failed": 0, "errors": 1, "skipped": 0},
                    "stdout": "",
                    "stderr": str(e)
                },
                "comparison": {}
            }
        }
        
        REPORTS.mkdir(parents=True, exist_ok=True)
        latest_path = REPORTS / "latest.json"
        report_path = REPORTS / "report.json"
        
        latest_path.write_text(json.dumps(error_report, indent=2))
        report_path.write_text(json.dumps(error_report, indent=2))
        
        print(f"Error during evaluation: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
