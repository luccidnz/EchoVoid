from typing import Callable, Dict, Tuple

from src.storage.local_store import LocalStore


class SyncManager:
    """Manage deferred uploads of recordings when connectivity is available."""

    def __init__(
        self,
        store: LocalStore,
        uploader: Callable[[str, Dict], bool],
        connectivity: Callable[[], bool],
    ) -> None:
        self.store = store
        self.uploader = uploader
        self.connectivity = connectivity
        # queue maps recording id to (path, metadata)
        self.queue: Dict[int, Tuple[str, Dict]] = {}

    def sync(self) -> None:
        """Attempt to upload all queued and unsynced recordings."""
        for rid, path, metadata in self.store.get_unsynced():
            self.queue[rid] = (path, metadata)

        if not self.connectivity():
            return

        completed = []
        for rid, (path, metadata) in self.queue.items():
            if self.uploader(path, metadata):
                self.store.mark_synced(rid)
                completed.append(rid)
        for rid in completed:
            self.queue.pop(rid, None)
