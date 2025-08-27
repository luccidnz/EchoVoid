import sys
from pathlib import Path

import pytest

# Ensure project root is importable
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.ui.onboarding import run_onboarding
from src.storage import user_prefs
from src.ui import settings


@pytest.fixture(autouse=True)
def prefs_env(tmp_path, monkeypatch):
    """Isolate user preferences for tests."""
    prefs_file = tmp_path / "prefs.json"
    monkeypatch.setenv("ECHOVOID_PREFS_PATH", str(prefs_file))
    yield


def test_onboarding_sets_completion_flag():
    assert run_onboarding() is True
    assert user_prefs.is_onboarding_complete() is True
    # Second run should not show onboarding again
    assert run_onboarding() is False


def test_help_option_triggers_onboarding_again():
    run_onboarding()  # Complete once
    assert settings.open_help() is True  # should replay onboarding
    # After help, onboarding remains marked complete
    assert user_prefs.is_onboarding_complete() is True
