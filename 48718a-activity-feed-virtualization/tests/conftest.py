"""
Pytest configuration and fixtures for testing.
"""

import pytest
from pathlib import Path


@pytest.fixture
def root_path():
    """Return the root path of the project."""
    return Path(__file__).resolve().parent.parent


@pytest.fixture
def repo_before_path(root_path):
    """Return path to repository_before."""
    return root_path / "repository_before" / "activity-feed-virtualization"


@pytest.fixture
def repo_after_path(root_path):
    """Return path to repository_after."""
    return root_path / "repository_after"
