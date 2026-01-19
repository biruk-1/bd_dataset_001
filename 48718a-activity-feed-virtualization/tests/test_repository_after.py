"""
Tests for repository_after - These should PASS, confirming virtual scrolling works.
"""

import pytest
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
REPO_AFTER = ROOT / "repository_after" / "src"


def read_file(file_path: Path) -> str:
    """Read file content."""
    try:
        return file_path.read_text(encoding='utf-8')
    except:
        return ""


class TestAfterHasVirtualization:
    """Tests that verify repository_after has virtual scrolling implementation."""
    
    def test_after_has_virtual_list_component(self):
        """Test that repository_after has VirtualList component.
        
        This test should PASS.
        """
        virtual_list = REPO_AFTER / "components" / "VirtualList.js"
        assert virtual_list.exists(), (
            "repository_after must have VirtualList.js component for virtual scrolling."
        )
        
        content = read_file(virtual_list)
        assert "VirtualList" in content, "VirtualList component must be defined"
        assert "visibleRange" in content or "visible" in content.lower(), (
            "VirtualList must calculate visible range"
        )
    
    def test_after_has_virtual_scroll_hook(self):
        """Test that repository_after has useVirtualScroll hook.
        
        This test should PASS.
        """
        hook = REPO_AFTER / "hooks" / "useVirtualScroll.js"
        assert hook.exists(), (
            "repository_after must have useVirtualScroll.js hook for virtual scrolling."
        )
        
        content = read_file(hook)
        assert "useVirtualScroll" in content, "useVirtualScroll hook must be defined"
        assert "visibleRange" in content or "start" in content or "end" in content, (
            "useVirtualScroll must calculate visible range"
        )
    
    def test_after_uses_virtual_list_in_activity_feed(self):
        """Test that ActivityFeed uses VirtualList.
        
        This test should PASS.
        """
        activity_feed = REPO_AFTER / "components" / "ActivityFeed.js"
        assert activity_feed.exists(), "ActivityFeed.js must exist"
        
        content = read_file(activity_feed)
        assert "VirtualList" in content, (
            "ActivityFeed must use VirtualList component for virtual scrolling."
        )
        assert "import" in content and "VirtualList" in content, (
            "ActivityFeed must import VirtualList"
        )
    
    def test_after_slices_items_before_rendering(self):
        """Test that repository_after slices items before rendering.
        
        This test should PASS.
        """
        virtual_list = REPO_AFTER / "components" / "VirtualList.js"
        assert virtual_list.exists(), "VirtualList.js must exist"
        
        content = read_file(virtual_list)
        
        # Should have .slice() to only get visible items
        has_slice = bool(re.search(r'\.slice\s*\(', content))
        assert has_slice, (
            "VirtualList must use .slice() to only render visible items."
        )
        
        # Should reference visibleRange
        has_visible_range = bool(
            re.search(r'visibleRange|visibleItems', content, re.IGNORECASE)
        )
        assert has_visible_range, (
            "VirtualList must calculate and use visible range."
        )
    
    def test_after_does_not_render_all_items_directly(self):
        """Test that repository_after does NOT render all items directly.
        
        This test should PASS.
        """
        activity_feed = REPO_AFTER / "components" / "ActivityFeed.js"
        assert activity_feed.exists(), "ActivityFeed.js must exist"
        
        content = read_file(activity_feed)
        
        # Should NOT have direct .map() on all filteredActivities
        direct_map_pattern = r'filteredActivities\.map\s*\([^)]*\)\s*=>\s*<ActivityItem'
        has_direct_map = bool(re.search(direct_map_pattern, content, re.DOTALL))
        
        assert not has_direct_map, (
            "ActivityFeed should NOT directly map over all filteredActivities. "
            "It should use VirtualList instead."
        )
