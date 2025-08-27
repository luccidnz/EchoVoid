from __future__ import annotations

"""Plugin interface for audio effects."""

from dataclasses import dataclass
from typing import List, Protocol


@dataclass
class EffectMeta:
    """Metadata describing an effect.

    Attributes:
        name: Human readable name for the effect.
        description: Short description of what the effect does.
    """

    name: str
    description: str


class EffectPlugin(Protocol):
    """Protocol all effect plug-ins must implement."""

    meta: EffectMeta

    def process(self, samples: List[float], sample_rate: int) -> List[float]:
        """Process samples and return new sample list."""


def load_plugin(name: str) -> EffectPlugin:
    """Dynamically load a plug-in by module name.

    The module must expose a ``get_plugin`` function returning an instance
    implementing :class:`EffectPlugin`.
    """

    import importlib

    module = importlib.import_module(f"plugins.{name}")
    plugin = getattr(module, "get_plugin")()
    return plugin
