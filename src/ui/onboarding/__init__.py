"""Onboarding package providing walkthrough functionality."""

from .walkthrough import OnboardingFlow
from src.storage import user_prefs


def run_onboarding(force: bool = False) -> bool:
    """Run the onboarding walkthrough.

    Parameters
    ----------
    force: bool
        If True, always show the walkthrough.

    Returns
    -------
    bool
        True if the walkthrough was displayed.
    """
    if force or not user_prefs.is_onboarding_complete():
        flow = OnboardingFlow()
        flow.run()
        user_prefs.set_onboarding_complete(True)
        return True
    return False
