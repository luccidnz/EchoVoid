#!/usr/bin/env python3
import hashlib
import json
import math
import os
import random
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
import wave
from array import array
from pathlib import Path

RATE = 22050
CHUNK_SEC = 2.0
CHUNK_SAMPLES = int(RATE * CHUNK_SEC)
BANK_SEC = 120
TARGET_CHUNKS = int(BANK_SEC / CHUNK_SEC)
WORK = Path("/tmp/ech0void-real-banks")
RAW = Path("nativeapp/app/src/main/res/raw")
WORK.mkdir(parents=True, exist_ok=True)
RAW.mkdir(parents=True, exist_ok=True)

def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Ech0Void-bank-builder/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

def download(url, dest):
    if dest.exists() and dest.stat().st_size > 4096:
        return dest
    req = urllib.request.Request(url, headers={"User-Agent": "Ech0Void-bank-builder/1.0"})
    with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)
    return dest

def archive_audio(identifier, limit=8):
    meta = get_json(f"https://archive.org/metadata/{identifier}")
    files = meta.get("files", [])
    candidates = []
    for f in files:
        name = f.get("name", "")
        fmt = (f.get("format") or "").lower()
        source = (f.get("source") or "").lower()
        lower = name.lower()
        if lower.endswith((".ogg", ".mp3")) and (
            source == "original" or "ogg" in fmt or "mp3" in fmt
        ):
            if any(x in lower for x in ("zip", "thumb", "spectrogram", "sample")):
                continue
            candidates.append(name)
    candidates = sorted(dict.fromkeys(candidates))
    if not candidates:
        raise RuntimeError(f"No audio files found for {identifier}")
    return candidates[:limit]

def prepare_source(tag, url, offset, duration=36):
    ext = Path(urllib.parse.urlparse(url).path).suffix or ".audio"
    src = WORK / f"{tag}{ext}"
    wav = WORK / f"{tag}.wav"
    download(url, src)
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", str(offset), "-t", str(duration), "-i", str(src),
        "-af", f"aresample={RATE},areverse,atempo=0.5",
        "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le",
        str(wav)
    ], check=True)
    return wav

def read_pcm(path):
    with wave.open(str(path), "rb") as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2 or w.getframerate() != RATE:
            raise RuntimeError(f"Unexpected WAV format: {path}")
        data = array("h")
        data.frombytes(w.readframes(w.getnframes()))
        if sys.byteorder != "little":
            data.byteswap()
        return data

def chunk_energy(samples):
    if not samples:
        return 0.0
    stride = max(1, len(samples) // 256)
    total = 0.0
    count = 0
    for i in range(0, len(samples), stride):
        x = samples[i] / 32768.0
        total += x * x
        count += 1
    return math.sqrt(total / max(1, count))

def fade_chunk(samples):
    out = array("h", samples)
    fade = min(int(RATE * 0.025), len(out) // 4)
    for i in range(fade):
        g = i / max(1, fade)
        out[i] = int(out[i] * g)
        out[-1 - i] = int(out[-1 - i] * g)
    return out

def chunks_from_source(path, source_id):
    pcm = read_pcm(path)
    chunks = []
    for start in range(0, len(pcm) - CHUNK_SAMPLES + 1, CHUNK_SAMPLES):
        part = pcm[start:start + CHUNK_SAMPLES]
        if chunk_energy(part) < 0.012:
            continue
        chunks.append((source_id, start // CHUNK_SAMPLES, fade_chunk(part)))
    return chunks

def write_bank(name, labelled_pools, seed):
    rng = random.Random(seed)
    all_chunks = []
    for label, pool in labelled_pools:
        for source_id, idx, pcm in pool:
            all_chunks.append((label, source_id, idx, pcm))
    if len(all_chunks) < 12:
        raise RuntimeError(f"{name}: only {len(all_chunks)} usable chunks")

    # Shuffle without allowing the same source twice in a row when alternatives exist.
    remaining = all_chunks[:]
    rng.shuffle(remaining)
    chosen = []
    last_source = None
    while remaining and len(chosen) < TARGET_CHUNKS:
        pick_index = None
        for i, item in enumerate(remaining):
            if item[1] != last_source:
                pick_index = i
                break
        if pick_index is None:
            pick_index = 0
        item = remaining.pop(pick_index)
        chosen.append(item)
        last_source = item[1]

    # If a source collection is shorter than 120 s after silence removal, begin a new
    # independently shuffled pass, but never repeat the same chunk back-to-back.
    pass_no = 1
    while len(chosen) < TARGET_CHUNKS:
        pass_no += 1
        refill = all_chunks[:]
        rng.seed(seed ^ (pass_no * 0x9E3779B1))
        rng.shuffle(refill)
        for item in refill:
            if len(chosen) >= TARGET_CHUNKS:
                break
            if chosen and item[1] == chosen[-1][1] and len(set(x[1] for x in refill)) > 1:
                continue
            if chosen and item[1] == chosen[-1][1] and item[2] == chosen[-1][2]:
                continue
            chosen.append(item)

    out_path = RAW / f"{name}.wav"
    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        for _, _, _, pcm in chosen:
            w.writeframes(pcm.tobytes())

    manifest = {
        "name": name,
        "duration_sec": len(chosen) * CHUNK_SEC,
        "chunks": len(chosen),
        "unique_sources": sorted(set(x[1] for x in chosen)),
        "unique_source_count": len(set(x[1] for x in chosen)),
        "sequence_sha256": hashlib.sha256(
            "|".join(f"{x[1]}:{x[2]}" for x in chosen).encode()
        ).hexdigest(),
    }
    print(json.dumps(manifest, indent=2))
    return manifest

def main():
    source_pools = {}

    items = [
        ("whisper", "whisperindark_2304_librivox", 5),
        ("warning", "warning_to_the_curious_2210_librivox", 6),
        ("sonnet", "sonnet_130_librivox", 12),
    ]

    for family, identifier, limit in items:
        names = archive_audio(identifier, limit)
        family_chunks = []
        for i, filename in enumerate(names):
            url = f"https://archive.org/download/{identifier}/{urllib.parse.quote(filename)}"
            # Use different offsets so even chapter intros and boilerplate don't dominate.
            offset = 18 + i * 7
            wav = prepare_source(f"{family}_{i:02d}", url, offset, 34)
            family_chunks.extend(chunks_from_source(wav, f"{family}:{i:02d}"))
        source_pools[family] = family_chunks
        print(f"{family}: {len(family_chunks)} chunks from {len(names)} files")

    metro_url = "https://upload.wikimedia.org/wikipedia/commons/2/26/Ekb_Metro_voice_messages_sample_05-2019.ogg"
    metro_wav = prepare_source("metro", metro_url, 0, 50)
    source_pools["radio"] = chunks_from_source(metro_wav, "radio:metro")

    manifests = []
    manifests.append(write_bank("bank_story", [("story", source_pools["whisper"])], 0x1101))
    manifests.append(write_bank("bank_dark", [("dark", source_pools["warning"])], 0x2202))
    manifests.append(write_bank("bank_multivoice", [("multi", source_pools["sonnet"])], 0x3303))
    manifests.append(write_bank("bank_radio", [("radio", source_pools["radio"])], 0x4404))
    manifests.append(write_bank(
        "bank_crossfeed",
        [("story", source_pools["whisper"]), ("dark", source_pools["warning"])],
        0x5505,
    ))
    manifests.append(write_bank(
        "bank_voidmix",
        [
            ("story", source_pools["whisper"]),
            ("dark", source_pools["warning"]),
            ("multi", source_pools["sonnet"]),
            ("radio", source_pools["radio"]),
        ],
        0x6606,
    ))

    (RAW / "bank_manifest.json").write_text(json.dumps(manifests, indent=2), encoding="utf-8")

if __name__ == "__main__":
    main()
