import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.storage.local_store import LocalStore
from src.cloud.sync_manager import SyncManager


def test_deferred_sync(tmp_path):
    db = tmp_path / "db.sqlite"
    rec_dir = tmp_path / "rec"
    store = LocalStore(db_path=str(db), recordings_dir=str(rec_dir))

    uploads = []

    def uploader(path, metadata):
        uploads.append((path, metadata))
        return True

    online = {"state": False}

    def connectivity():
        return online["state"]

    manager = SyncManager(store, uploader, connectivity)

    store.save_recording(b"data", {"name": "test"})

    # offline sync does nothing
    manager.sync()
    assert uploads == []
    assert len(manager.queue) == 1

    # go online and sync
    online["state"] = True
    manager.sync()
    assert len(uploads) == 1
    assert store.get_unsynced() == []
    assert manager.queue == {}
