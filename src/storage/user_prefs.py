import json
import os
from pathlib import Path
from typing import Any, Dict

# Path to the user preferences file. Allows override via environment variable
_DEFAULT_PATH = Path(os.environ.get("ECHOVOID_PREFS_PATH", Path.home() / ".echovoid_prefs.json"))


def _prefs_path() -> Path:
    """Return the path to the preferences file."""
    return _DEFAULT_PATH


def load_prefs() -> Dict[str, Any]:
    """Load preferences from disk."""
    path = _prefs_path()
    if path.exists():
        try:
            return json.loads(path.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def save_prefs(prefs: Dict[str, Any]) -> None:
    """Persist preferences to disk."""
    path = _prefs_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(prefs))


def is_onboarding_complete() -> bool:
    """Return True if the onboarding walkthrough has been completed."""
    return bool(load_prefs().get("onboarding_complete", False))


def set_onboarding_complete(value: bool) -> None:
    """Set the onboarding completion flag."""
    prefs = load_prefs()
    prefs["onboarding_complete"] = bool(value)
    save_prefs(prefs)
