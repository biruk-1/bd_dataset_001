"""
Tests that verify repository_before has performance issues.

These tests should FAIL for repository_before, confirming it needs optimization.
"""

import pytest
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
REPO_BEFORE = ROOT / "repository_before" / "activity-feed-virtualization"


def read_file_content(file_path: Path) -> str:
    """Read file content safely."""
    try:
        return file_path.read_text(encoding='utf-8')
    except Exception:
        return ""


class TestBeforePerformanceIssues:
    """Test suite that identifies performance issues in repository_before."""
    
    def test_before_renders_all_items_in_dom(self):
        """Test that repository_before renders ALL items to DOM.
        
        This test should FAIL, confirming the performance problem.
        """
        app_path = REPO_BEFORE / "activity-feed-virtualization" / "src" / "App.js"
        assert app_path.exists(), "App.js must exist"
        
        content = read_file_content(app_path)
        
        # Should have .map() that renders all items
        # Pattern: filteredActivities.map((activity) => <ActivityItem ... />)
        map_pattern = r'filteredActivities\.map\s*\([^)]*activity[^)]*\)\s*=>'
        has_all_items_map = bool(re.search(map_pattern, content, re.DOTALL))
        
        assert has_all_items_map, (
            "repository_before renders all items using .map() on filteredActivities. "
            "This creates DOM nodes for ALL items, even those not visible. "
            "This is the performance problem that needs to be fixed."
        )
    
    def test_before_has_no_viewport_detection(self):
        """Test that repository_before has no viewport detection logic.
        
        This test should PASS (confirming the problem exists).
        """
        app_path = REPO_BEFORE / "activity-feed-virtualization" / "src" / "App.js"
        assert app_path.exists(), "App.js must exist"
        
        content = read_file_content(app_path)
        
        # Should NOT have viewport/visible range calculations
        has_viewport_logic = bool(
            re.search(
                r'visibleRange|viewport|visible.*items|slice.*start|slice.*end',
                content,
                re.IGNORECASE
            )
        )
        
        assert not has_viewport_logic, (
            "repository_before should NOT have viewport detection logic. "
            "It renders all items regardless of visibility (the problem)."
        )
    
    def test_before_has_no_item_slicing(self):
        """Test that repository_before does not slice items before rendering.
        
        This test should PASS (confirming it renders all items).
        """
        app_path = REPO_BEFORE / "activity-feed-virtualization" / "src" / "App.js"
        assert app_path.exists(), "App.js must exist"
        
        content = read_file_content(app_path)
        
        # Should NOT have .slice() for visible items
        has_slice = bool(re.search(r'\.slice\s*\([^)]*start|\.slice\s*\([^)]*end', content))
        
        assert not has_slice, (
            "repository_before should NOT slice items. "
            "It should render all items directly (the performance issue)."
        )
    
    def test_before_creates_dom_nodes_for_all_items(self):
        """Test that repository_before creates DOM nodes for all items.
        
        This test verifies the problematic pattern exists.
        """
        app_path = REPO_BEFORE / "activity-feed-virtualization" / "src" / "App.js"
        assert app_path.exists(), "App.js must exist"
        
        content = read_file_content(app_path)
        
        # Should map over ALL filteredActivities
        # This means if there are 5000 items, 5000 DOM nodes are created
        map_all_pattern = r'filteredActivities\.map\s*\('
        has_map_all = bool(re.search(map_all_pattern, content))
        
        assert has_map_all, (
            "repository_before uses .map() on all filteredActivities, "
            "creating DOM nodes for every item regardless of visibility. "
            "With 5000 items, this creates 5000 DOM nodes (the performance problem)."
        )
        
        # Should NOT limit rendering to visible items
        has_visible_limit = bool(
            re.search(r'visible.*slice|slice.*visible|Math\.floor.*scrollTop', content, re.IGNORECASE)
        )
        
        assert not has_visible_limit, (
            "repository_before should NOT limit rendering to visible items. "
            "It renders everything (confirming the problem exists)."
        )
