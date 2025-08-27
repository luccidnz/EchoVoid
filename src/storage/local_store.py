import os
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Tuple


class LocalStore:
    """Persist recordings and metadata locally using SQLite and the filesystem."""

    def __init__(self, db_path: str = "local_store.db", recordings_dir: str = "recordings"):
        self.db_path = db_path
        self.recordings_dir = recordings_dir
        os.makedirs(self.recordings_dir, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS recordings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    file_path TEXT NOT NULL,
                    metadata TEXT,
                    synced INTEGER DEFAULT 0
                )
                """
            )

    def save_recording(self, audio_bytes: bytes, metadata: Dict) -> int:
        """Persist recording to disk and store metadata in the database.

        Returns the generated recording ID.
        """
        filename = f"{datetime.utcnow().timestamp()}.bin"
        path = os.path.join(self.recordings_dir, filename)
        with open(path, "wb") as f:
            f.write(audio_bytes)
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "INSERT INTO recordings (file_path, metadata, synced) VALUES (?, ?, 0)",
                (path, json.dumps(metadata)),
            )
            return cursor.lastrowid

    def mark_synced(self, recording_id: int) -> None:
        """Mark a recording as successfully synced."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("UPDATE recordings SET synced=1 WHERE id=?", (recording_id,))

    def get_unsynced(self) -> List[Tuple[int, str, Dict]]:
        """Retrieve unsynced recordings."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT id, file_path, metadata FROM recordings WHERE synced=0"
            )
            results = []
            for rid, path, meta in cursor.fetchall():
                results.append((rid, path, json.loads(meta)))
            return results
