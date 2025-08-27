class OnboardingFlow:
    """Simple multi-screen walkthrough introducing the app."""

    def __init__(self) -> None:
        self.screens = [
            self._recording_screen,
            self._effects_screen,
            self._sharing_screen,
        ]

    def run(self) -> None:
        """Run each onboarding screen in order."""
        for screen in self.screens:
            screen()

    def _recording_screen(self) -> None:
        print("Welcome to EchoVoid! Let's learn how to record audio.")

    def _effects_screen(self) -> None:
        print("Apply cool effects to your recordings.")

    def _sharing_screen(self) -> None:
        print("Share your creations with friends.")
