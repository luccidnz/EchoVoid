from __future__ import annotations

"""Simple delay-based reverb effect."""

from typing import List

from .plugin_api import EffectMeta, EffectPlugin


class Reverb(EffectPlugin):
    def __init__(self, delay_ms: int = 50, decay: float = 0.5):
        self.meta = EffectMeta(name="reverb", description="Echo-style reverb")
        self.delay_ms = delay_ms
        self.decay = decay

    def process(self, samples: List[float], sample_rate: int) -> List[float]:
        delay_samples = int(sample_rate * self.delay_ms / 1000)
        if delay_samples <= 0:
            return samples
        result = samples.copy()
        for i in range(delay_samples, len(samples)):
            result[i] += self.decay * result[i - delay_samples]
        return result


def get_plugin() -> Reverb:
    """Factory used by the plug-in loader."""

    return Reverb()
