"""Settings interface for the application."""

from src.ui.onboarding import run_onboarding


def open_help() -> bool:
    """Open the help option which replays the onboarding."""
    return run_onboarding(force=True)
