from __future__ import annotations

"""Very small recorder simulation that supports plug-ins."""

from typing import Iterable, List

from plugins.plugin_api import EffectPlugin, load_plugin


class Recorder:
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.samples: List[float] = []
        self.plugins: List[EffectPlugin] = []

    def record(self, chunk: Iterable[float]) -> None:
        """Append audio samples."""
        self.samples.extend(chunk)

    def select_plugins(self, plugin_names: Iterable[str]) -> None:
        """Load plug-ins by name and store them for later processing."""
        self.plugins = [load_plugin(name) for name in plugin_names]

    def process(self) -> None:
        """Run samples through each selected plug-in."""
        for plugin in self.plugins:
            self.samples = plugin.process(self.samples, self.sample_rate)

    def save(self, path: str) -> None:
        """Persist audio samples to ``path``.

        A real implementation would encode to an audio format. For demonstration we
        simply write a comma separated list of floats.
        """

        with open(path, "w", encoding="utf-8") as fh:
            fh.write(",".join(str(v) for v in self.samples))


if __name__ == "__main__":
    rec = Recorder()
    rec.record([0.0, 0.1, 0.0, -0.1] * 5)
    rec.select_plugins(["reverb"])
    rec.process()
    rec.save("output.txt")
    print("Processed samples written to output.txt")
