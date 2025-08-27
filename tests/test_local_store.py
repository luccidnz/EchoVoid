import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))

import os
from src.storage.local_store import LocalStore


def test_save_and_retrieve(tmp_path):
    store = LocalStore(db_path=str(tmp_path / "db.sqlite"), recordings_dir=str(tmp_path / "rec"))
    audio = b"abc123"
    metadata = {"a": 1}
    rid = store.save_recording(audio, metadata)

    # file should exist
    unsynced = store.get_unsynced()
    assert len(unsynced) == 1
    uid, path, meta = unsynced[0]
    assert uid == rid
    assert os.path.exists(path)
    assert meta == metadata

    # mark as synced
    store.mark_synced(rid)
    assert store.get_unsynced() == []
