"""
Tests to verify virtual scrolling implementation.

These tests check the code structure to ensure:
- repository_before renders all items (should fail these tests)
- repository_after implements virtual scrolling (should pass these tests)
"""

import pytest
from pathlib import Path
import re
import ast

# Paths
ROOT = Path(__file__).resolve().parent.parent
REPO_BEFORE = ROOT / "repository_before" / "activity-feed-virtualization"
REPO_AFTER = ROOT / "repository_after"


def read_file_content(file_path: Path) -> str:
    """Read file content safely."""
    try:
        return file_path.read_text(encoding='utf-8')
    except Exception:
        return ""


def find_js_files(directory: Path, pattern: str = "*.js") -> list:
    """Find all JS files matching pattern."""
    files = []
    if directory.exists():
        files.extend(directory.rglob(pattern))
    return files


class TestVirtualizationImplementation:
    """Test suite for virtual scrolling implementation."""
    
    def test_after_has_virtual_list_component(self):
        """Test that repository_after has VirtualList component."""
        virtual_list_path = REPO_AFTER / "src" / "components" / "VirtualList.js"
        assert virtual_list_path.exists(), (
            "repository_after must have VirtualList.js component. "
            "Virtual scrolling requires a VirtualList component to only render visible items."
        )
        
        content = read_file_content(virtual_list_path)
        assert "VirtualList" in content, "VirtualList component must be defined"
        assert "visibleRange" in content or "visible" in content.lower(), (
            "VirtualList must calculate visible range for virtual scrolling"
        )
    
    def test_after_has_virtual_scroll_hook(self):
        """Test that repository_after has useVirtualScroll hook."""
        hook_path = REPO_AFTER / "src" / "hooks" / "useVirtualScroll.js"
        assert hook_path.exists(), (
            "repository_after must have useVirtualScroll.js hook. "
            "Virtual scrolling requires a custom hook to calculate visible items."
        )
        
        content = read_file_content(hook_path)
        assert "useVirtualScroll" in content, "useVirtualScroll hook must be defined"
        assert "visibleRange" in content or "start" in content or "end" in content, (
            "useVirtualScroll must calculate visible range"
        )
    
    def test_after_uses_virtual_list_in_activity_feed(self):
        """Test that ActivityFeed in repository_after uses VirtualList."""
        activity_feed_path = REPO_AFTER / "src" / "components" / "ActivityFeed.js"
        assert activity_feed_path.exists(), "ActivityFeed.js must exist in repository_after"
        
        content = read_file_content(activity_feed_path)
        assert "VirtualList" in content, (
            "ActivityFeed must use VirtualList component for virtual scrolling. "
            "Found direct .map() rendering instead of VirtualList."
        )
        assert "import" in content and "VirtualList" in content, (
            "ActivityFeed must import VirtualList component"
        )
    
    def test_before_renders_all_items_directly(self):
        """Test that repository_before renders all items without virtualization.
        
        This test should FAIL for repository_before because it uses .map() on all items.
        """
        app_path = REPO_BEFORE / "activity-feed-virtualization" / "src" / "App.js"
        assert app_path.exists(), "App.js must exist in repository_before"
        
        content = read_file_content(app_path)
        
        # Check for the problematic pattern: .map() on filteredActivities
        has_direct_map = bool(re.search(r'filteredActivities\.map\s*\(', content))
        has_activities_map = bool(re.search(r'activities\.map\s*\(', content))
        
        # This should be True for repository_before (the problem we're fixing)
        assert has_direct_map or has_activities_map, (
            "repository_before should render all items directly using .map(). "
            "This test verifies the problematic implementation exists."
        )
        
        # Check that it does NOT use VirtualList
        assert "VirtualList" not in content, (
            "repository_before should NOT use VirtualList. "
            "It should use direct .map() rendering (which is the performance problem)."
        )
    
    def test_after_does_not_render_all_items_directly(self):
        """Test that repository_after does NOT render all items directly.
        
        This test should PASS for repository_after because it uses VirtualList.
        """
        activity_feed_path = REPO_AFTER / "src" / "components" / "ActivityFeed.js"
        assert activity_feed_path.exists(), "ActivityFeed.js must exist in repository_after"
        
        content = read_file_content(activity_feed_path)
        
        # Should NOT have direct .map() on filteredActivities in the render
        # (VirtualList handles the mapping internally)
        direct_map_pattern = r'filteredActivities\.map\s*\([^)]*ActivityItem'
        has_direct_map = bool(re.search(direct_map_pattern, content, re.DOTALL))
        
        assert not has_direct_map, (
            "repository_after should NOT render all items directly using .map(). "
            "It should use VirtualList to only render visible items. "
            f"Found direct .map() pattern in ActivityFeed.js"
        )
    
    def test_after_slices_items_before_rendering(self):
        """Test that repository_after slices items before rendering."""
        virtual_list_path = REPO_AFTER / "src" / "components" / "VirtualList.js"
        assert virtual_list_path.exists(), "VirtualList.js must exist"
        
        content = read_file_content(virtual_list_path)
        
        # Should have .slice() to only get visible items
        has_slice = bool(re.search(r'\.slice\s*\(', content))
        assert has_slice, (
            "VirtualList must use .slice() to only render visible items. "
            "Virtual scrolling requires slicing the items array based on visible range."
        )
        
        # Should reference visibleRange or similar
        has_visible_range = bool(
            re.search(r'visibleRange|visibleItems|visible.*range', content, re.IGNORECASE)
        )
        assert has_visible_range, (
            "VirtualList must calculate and use visible range to slice items."
        )
    
    def test_after_uses_memoization(self):
        """Test that repository_after uses React.memo for optimization."""
        activity_item_path = REPO_AFTER / "src" / "components" / "ActivityItem.js"
        assert activity_item_path.exists(), "ActivityItem.js must exist"
        
        content = read_file_content(activity_item_path)
        
        # Should use React.memo
        has_memo = bool(re.search(r'React\.memo|memo\s*\(', content))
        assert has_memo, (
            "ActivityItem should use React.memo to prevent unnecessary re-renders. "
            "This is a key optimization for virtual scrolling."
        )
    
    def test_after_has_spacer_element(self):
        """Test that VirtualList uses a spacer element for scroll height."""
        virtual_list_path = REPO_AFTER / "src" / "components" / "VirtualList.js"
        assert virtual_list_path.exists(), "VirtualList.js must exist"
        
        content = read_file_content(virtual_list_path)
        
        # Should have spacer or totalHeight concept
        has_spacer = bool(
            re.search(r'spacer|totalHeight|total.*height', content, re.IGNORECASE)
        )
        assert has_spacer, (
            "VirtualList must use a spacer element or totalHeight to maintain "
            "correct scroll height. This is required for proper virtual scrolling."
        )
    
    def test_after_uses_transform_for_positioning(self):
        """Test that VirtualList uses transform for item positioning."""
        virtual_list_path = REPO_AFTER / "src" / "components" / "VirtualList.js"
        assert virtual_list_path.exists(), "VirtualList.js must exist"
        
        content = read_file_content(virtual_list_path)
        
        # Should use transform: translateY or offset
        has_transform = bool(
            re.search(r'transform.*translateY|offsetY|offset', content, re.IGNORECASE)
        )
        assert has_transform, (
            "VirtualList must use transform: translateY() or offset to position "
            "visible items correctly. This is how virtual scrolling positions items."
        )
    
    def test_before_has_no_virtualization(self):
        """Test that repository_before has no virtualization components.
        
        This test should PASS for repository_before (confirming it lacks virtualization).
        """
        before_src = REPO_BEFORE / "activity-feed-virtualization" / "src"
        
        # Should NOT have VirtualList
        virtual_list_path = before_src / "components" / "VirtualList.js"
        assert not virtual_list_path.exists(), (
            "repository_before should NOT have VirtualList.js. "
            "It should use direct rendering (the problem we're fixing)."
        )
        
        # Should NOT have useVirtualScroll hook
        hook_path = before_src / "hooks" / "useVirtualScroll.js"
        assert not hook_path.exists(), (
            "repository_before should NOT have useVirtualScroll.js hook. "
            "It should use direct rendering without virtualization."
        )
    
    def test_after_renders_only_visible_items(self):
        """Test that repository_after implements logic to render only visible items."""
        virtual_list_path = REPO_AFTER / "src" / "components" / "VirtualList.js"
        assert virtual_list_path.exists(), "VirtualList.js must exist"
        
        content = read_file_content(virtual_list_path)
        
        # Should calculate visible range
        has_visible_calc = bool(
            re.search(
                r'visibleRange|startIndex|visibleCount|Math\.floor.*scrollTop',
                content,
                re.IGNORECASE
            )
        )
        assert has_visible_calc, (
            "VirtualList must calculate which items are visible based on scroll position. "
            "This is the core of virtual scrolling."
        )
        
        # Should slice items based on visible range
        has_slice_with_range = bool(
            re.search(r'\.slice\s*\([^)]*start|\.slice\s*\([^)]*end', content)
        )
        assert has_slice_with_range, (
            "VirtualList must slice items array using visible range (start/end). "
            "This ensures only visible items are rendered."
        )


class TestPerformanceOptimizations:
    """Test suite for performance optimizations in repository_after."""
    
    def test_after_uses_usememo(self):
        """Test that repository_after uses useMemo for expensive calculations."""
        files = find_js_files(REPO_AFTER / "src")
        
        has_usememo = False
        for file_path in files:
            content = read_file_content(file_path)
            if re.search(r'useMemo\s*\(', content):
                has_usememo = True
                break
        
        assert has_usememo, (
            "repository_after should use useMemo to memoize expensive calculations. "
            "This is a performance optimization for virtual scrolling."
        )
    
    def test_after_uses_usecallback(self):
        """Test that repository_after uses useCallback for event handlers."""
        files = find_js_files(REPO_AFTER / "src")
        
        has_usecallback = False
        for file_path in files:
            content = read_file_content(file_path)
            if re.search(r'useCallback\s*\(', content):
                has_usecallback = True
                break
        
        assert has_usecallback, (
            "repository_after should use useCallback to memoize event handlers. "
            "This prevents unnecessary re-renders in virtual scrolling."
        )


class TestCodeStructure:
    """Test suite for code structure and organization."""
    
    def test_after_has_proper_component_structure(self):
        """Test that repository_after has proper component organization."""
        components_dir = REPO_AFTER / "src" / "components"
        assert components_dir.exists(), "components directory must exist"
        
        required_components = [
            "ActivityFeed.js",
            "ActivityItem.js",
            "VirtualList.js"
        ]
        
        for component in required_components:
            component_path = components_dir / component
            assert component_path.exists(), (
                f"Required component {component} must exist in repository_after"
            )
    
    def test_after_has_hooks_directory(self):
        """Test that repository_after has hooks directory."""
        hooks_dir = REPO_AFTER / "src" / "hooks"
        assert hooks_dir.exists(), "hooks directory must exist in repository_after"
        
        hook_file = hooks_dir / "useVirtualScroll.js"
        assert hook_file.exists(), "useVirtualScroll.js hook must exist"
