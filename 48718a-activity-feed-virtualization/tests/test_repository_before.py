"""
Tests for repository_before - These should FAIL, confirming performance issues exist.
"""

import pytest
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
REPO_BEFORE = ROOT / "repository_before" / "activity-feed-virtualization" / "src"


def read_file(file_path: Path) -> str:
    """Read file content."""
    try:
        return file_path.read_text(encoding='utf-8')
    except:
        return ""


class TestBeforeHasPerformanceIssues:
    """Tests that verify repository_before has the performance problems.
    
    These tests should FAIL, confirming the problems exist.
    """
    
    def test_before_should_have_virtual_scrolling(self):
        """Test that repository_before should have virtual scrolling but doesn't.
        
        This test should FAIL because repository_before lacks virtualization.
        """
        # Should have VirtualList component (but it doesn't)
        virtual_list = REPO_BEFORE.parent / "src" / "components" / "VirtualList.js"
        assert virtual_list.exists(), (
            "repository_before should have VirtualList.js for virtual scrolling. "
            "This test fails because it lacks virtualization (the performance problem)."
        )
    
    def test_before_should_use_virtual_list(self):
        """Test that repository_before should use VirtualList but doesn't.
        
        This test should FAIL because repository_before uses direct rendering.
        """
        app_file = REPO_BEFORE / "App.js"
        assert app_file.exists(), "App.js must exist"
        
        content = read_file(app_file)
        
        # Should use VirtualList (but it doesn't)
        assert "VirtualList" in content, (
            "repository_before should use VirtualList component for virtual scrolling. "
            "This test fails because it renders all items directly (the performance problem)."
        )
    
    def test_before_should_have_virtual_scroll_hook(self):
        """Test that repository_before should have useVirtualScroll hook but doesn't.
        
        This test should FAIL because repository_before lacks the hook.
        """
        hook = REPO_BEFORE.parent / "src" / "hooks" / "useVirtualScroll.js"
        assert hook.exists(), (
            "repository_before should have useVirtualScroll.js hook for virtual scrolling. "
            "This test fails because it lacks virtualization (the performance problem)."
        )
    
    def test_before_should_slice_items(self):
        """Test that repository_before should slice items but doesn't.
        
        This test should FAIL because repository_before renders all items.
        """
        app_file = REPO_BEFORE / "App.js"
        assert app_file.exists(), "App.js must exist"
        
        content = read_file(app_file)
        
        # Should slice items based on visible range (but it doesn't)
        has_slice = bool(re.search(r'\.slice\s*\([^)]*start|\.slice\s*\([^)]*end|visibleRange', content))
        assert has_slice, (
            "repository_before should slice items to only render visible ones. "
            "This test fails because it renders all items (the performance problem)."
        )
    
    def test_before_should_not_render_all_items(self):
        """Test that repository_before should NOT render all items but does.
        
        This test should FAIL because repository_before renders everything.
        """
        app_file = REPO_BEFORE / "App.js"
        assert app_file.exists(), "App.js must exist"
        
        content = read_file(app_file)
        
        # Should NOT have direct .map() on all filteredActivities
        direct_map_pattern = r'filteredActivities\.map\s*\([^)]*\)\s*=>'
        has_direct_map = bool(re.search(direct_map_pattern, content, re.DOTALL))
        
        assert not has_direct_map, (
            "repository_before should NOT directly map over all filteredActivities. "
            "This test fails because it renders all items to DOM (the performance problem)."
        )
