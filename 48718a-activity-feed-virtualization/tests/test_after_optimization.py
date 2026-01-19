"""
Tests that verify repository_after has proper virtual scrolling optimization.

These tests should PASS for repository_after, confirming the optimization works.
"""

import pytest
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
REPO_AFTER = ROOT / "repository_after"


def read_file_content(file_path: Path) -> str:
    """Read file content safely."""
    try:
        return file_path.read_text(encoding='utf-8')
    except Exception:
        return ""


class TestAfterOptimization:
    """Test suite that verifies optimization in repository_after."""
    
    def test_after_limits_dom_nodes(self):
        """Test that repository_after limits DOM nodes to visible items only."""
        virtual_list_path = REPO_AFTER / "src" / "components" / "VirtualList.js"
        assert virtual_list_path.exists(), "VirtualList.js must exist"
        
        content = read_file_content(virtual_list_path)
        
        # Should slice items before rendering
        has_slice = bool(re.search(r'\.slice\s*\(', content))
        assert has_slice, (
            "VirtualList must slice items array to only render visible items. "
            "This limits DOM nodes to ~15-20 instead of thousands."
        )
        
        # Should calculate visible range
        has_range_calc = bool(
            re.search(r'visibleRange|start.*end|Math\.floor.*scrollTop', content, re.IGNORECASE)
        )
        assert has_range_calc, (
            "VirtualList must calculate visible range to determine which items to render."
        )
    
    def test_after_uses_viewport_calculation(self):
        """Test that repository_after calculates viewport to determine visible items."""
        hook_path = REPO_AFTER / "src" / "hooks" / "useVirtualScroll.js"
        assert hook_path.exists(), "useVirtualScroll.js must exist"
        
        content = read_file_content(hook_path)
        
        # Should calculate based on scroll position and container height
        has_scroll_calc = bool(
            re.search(
                r'scrollTop|containerHeight|itemHeight|Math\.floor|Math\.ceil',
                content
            )
        )
        assert has_scroll_calc, (
            "useVirtualScroll must calculate visible items based on "
            "scroll position, container height, and item height."
        )
        
        # Should have buffer concept
        has_buffer = bool(re.search(r'buffer|bufferSize', content, re.IGNORECASE))
        assert has_buffer, (
            "useVirtualScroll should use a buffer to render items slightly "
            "outside viewport for smooth scrolling."
        )
    
    def test_after_implements_virtual_scrolling_correctly(self):
        """Test that repository_after implements virtual scrolling correctly."""
        virtual_list_path = REPO_AFTER / "src" / "components" / "VirtualList.js"
        assert virtual_list_path.exists(), "VirtualList.js must exist"
        
        content = read_file_content(virtual_list_path)
        
        # Must have these key elements:
        checks = {
            "spacer": bool(re.search(r'spacer|totalHeight', content, re.IGNORECASE)),
            "transform": bool(re.search(r'transform.*translateY|offsetY', content, re.IGNORECASE)),
            "slice": bool(re.search(r'\.slice\s*\(', content)),
            "visible": bool(re.search(r'visibleItems|visibleRange', content, re.IGNORECASE))
        }
        
        missing = [key for key, value in checks.items() if not value]
        assert len(missing) == 0, (
            f"VirtualList is missing key virtual scrolling elements: {', '.join(missing)}. "
            "Virtual scrolling requires: spacer element, transform positioning, "
            "item slicing, and visible range calculation."
        )
    
    def test_after_has_performance_optimizations(self):
        """Test that repository_after has performance optimizations."""
        activity_item_path = REPO_AFTER / "src" / "components" / "ActivityItem.js"
        assert activity_item_path.exists(), "ActivityItem.js must exist"
        
        content = read_file_content(activity_item_path)
        
        # Should use React.memo
        has_memo = bool(re.search(r'React\.memo|memo\s*\(', content))
        assert has_memo, (
            "ActivityItem should use React.memo to prevent unnecessary re-renders."
        )
        
        # Should use useMemo for expensive calculations
        has_usememo = bool(re.search(r'useMemo\s*\(', content))
        assert has_usememo, (
            "ActivityItem should use useMemo to cache expensive calculations."
        )
    
    def test_after_does_not_render_all_items(self):
        """Test that repository_after does NOT render all items to DOM."""
        activity_feed_path = REPO_AFTER / "src" / "components" / "ActivityFeed.js"
        assert activity_feed_path.exists(), "ActivityFeed.js must exist"
        
        content = read_file_content(activity_feed_path)
        
        # Should NOT have direct .map() on all filteredActivities
        # (VirtualList handles this internally with slicing)
        direct_map_pattern = r'filteredActivities\.map\s*\([^)]*\)\s*=>\s*<ActivityItem'
        has_direct_map = bool(re.search(direct_map_pattern, content, re.DOTALL))
        
        assert not has_direct_map, (
            "ActivityFeed should NOT directly map over all filteredActivities. "
            "It should pass items to VirtualList, which handles slicing and rendering."
        )
        
        # Should use VirtualList
        assert "VirtualList" in content, (
            "ActivityFeed must use VirtualList component for virtual scrolling."
        )
