"""Entry point for the EchoVoid application."""

from src.ui.onboarding import run_onboarding


def main() -> None:
    """Start the application."""
    # Automatically trigger onboarding on first launch.
    run_onboarding()
    # Application would continue running here.


if __name__ == "__main__":
    main()
