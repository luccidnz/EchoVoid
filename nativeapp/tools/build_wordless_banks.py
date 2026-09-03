#!/usr/bin/env python3
"""
Build Ech0Void HSB-style proof banks.

Each named bank is intentionally based on ONE real reader/source profile. The build
pipeline concatenates long raw excerpts first, then reverses and slows that whole
stream, then chops the processed stream into ~2 second pieces and shuffles those
pieces into a finished long wordless bank. Android never creates the bank at
runtime; it only plays the rendered WAV continuously beneath the manual gate.

These LibriVox/Internet Archive sources are for engineering proof builds. LibriVox
states its recordings are public domain in the USA. Final store distribution must
re-check rights in every target jurisdiction or replace these with recordings we
own/control.
"""
import hashlib
import json
import math
import random
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
import wave
from array import array
from pathlib import Path

RATE = 16000
CHUNK_SEC = 2.0
CHUNK_SAMPLES = int(RATE * CHUNK_SEC)
BANK_SEC = 180
TARGET_CHUNKS = int(BANK_SEC / CHUNK_SEC)
RAW_TARGET_SEC = 115
WORK = Path("/tmp/ech0void-hsb-v4-banks")
RAW_DIR = Path("nativeapp/app/src/main/res/raw")
WORK.mkdir(parents=True, exist_ok=True)
RAW_DIR.mkdir(parents=True, exist_ok=True)

PROFILES = [
    {
        "id": "middle_female_a",
        "label": "Middle Female A",
        "reader": "Kara Shallenberg",
        "identifier": "railway_children3_2008_librivox",
    },
    {
        "id": "female_b",
        "label": "Female Voice B",
        "reader": "Elizabeth Klett",
        "identifier": "littleprincess_1502_librivox",
    },
    {
        "id": "female_c",
        "label": "Female Voice C",
        "reader": "Karen Savage",
        "search_title": "A Little Princess (version 2)",
    },
    {
        "id": "male_a",
        "label": "Male Voice A",
        "reader": "Mark F. Smith",
        "identifier": "twenty-four_hours_a_day_librivox",
    },
    {
        "id": "male_b",
        "label": "Male Voice B",
        "reader": "Roger Melin",
        "search_title": "History of Billy the Kid",
    },
    {
        "id": "older_male_a",
        "label": "Older Male A",
        "reader": "Andy Minter",
        "search_title": "The Princess and the Goblin (version 2)",
    },
    {
        "id": "voice_a",
        "label": "Voice A",
        "reader": "Owlivia",
        "identifier": "theastralplane_2401_librivox",
    },
]


def request_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Ech0Void-HSB-V4-bank-builder/1.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return json.load(response)


def download(url, dest):
    if dest.exists() and dest.stat().st_size > 4096:
        return dest
    req = urllib.request.Request(url, headers={"User-Agent": "Ech0Void-HSB-V4-bank-builder/1.0"})
    with urllib.request.urlopen(req, timeout=180) as response, open(dest, "wb") as output:
        shutil.copyfileobj(response, output)
    return dest


def resolve_identifier(profile):
    if profile.get("identifier"):
        return profile["identifier"]

    title = profile["search_title"]
    query = f'collection:librivoxaudio AND title:"{title}"'
    params = urllib.parse.urlencode({
        "q": query,
        "fl[]": ["identifier", "title"],
        "rows": 20,
        "page": 1,
        "output": "json",
    }, doseq=True)
    data = request_json("https://archive.org/advancedsearch.php?" + params)
    docs = data.get("response", {}).get("docs", [])
    if not docs:
        # A slightly wider title search is useful for IA records that omit '(version 2)'.
        core = title.split("(")[0].strip()
        query = f'collection:librivoxaudio AND title:"{core}"'
        params = urllib.parse.urlencode({
            "q": query,
            "fl[]": ["identifier", "title"],
            "rows": 50,
            "page": 1,
            "output": "json",
        }, doseq=True)
        docs = request_json("https://archive.org/advancedsearch.php?" + params).get("response", {}).get("docs", [])

    if not docs:
        raise RuntimeError(f"Could not resolve Internet Archive item for {profile['label']}")

    wanted = title.lower()
    for doc in docs:
        if wanted in str(doc.get("title", "")).lower():
            return doc["identifier"]
    return docs[0]["identifier"]


def candidate_audio_files(identifier):
    meta = request_json(f"https://archive.org/metadata/{identifier}")
    files = meta.get("files", [])
    candidates = []
    for entry in files:
        name = entry.get("name", "")
        lower = name.lower()
        if not lower.endswith((".mp3", ".ogg")):
            continue
        if any(token in lower for token in ("64kb_mp3.zip", "spectrogram", "sample", "thumb")):
            continue
        try:
            size = int(entry.get("size") or 0)
        except (TypeError, ValueError):
            size = 0
        # Prefer chapter-sized originals; avoid giant whole-book derivatives when possible.
        if size and size > 80 * 1024 * 1024:
            continue
        source = str(entry.get("source") or "").lower()
        fmt = str(entry.get("format") or "").lower()
        score = 0
        if source == "original":
            score += 5
        if "vbr mp3" in fmt or "ogg vorbis" in fmt:
            score += 4
        if 500_000 <= size <= 30_000_000:
            score += 3
        candidates.append((score, name, size))

    if not candidates:
        raise RuntimeError(f"No usable audio in Internet Archive item {identifier}")
    candidates.sort(key=lambda x: (-x[0], x[1]))
    return [name for _, name, _ in candidates]


def ffprobe_duration(path):
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path)
    ], check=True, capture_output=True, text=True)
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0


def extract_raw_excerpt(source_path, dest, index):
    duration = ffprobe_duration(source_path)
    if duration <= 8:
        return None
    excerpt = min(58.0, max(18.0, duration * 0.34))
    max_start = max(0.0, duration - excerpt - 1.0)
    fractions = (0.17, 0.43, 0.68, 0.29, 0.78)
    start = min(max_start, duration * fractions[index % len(fractions)])
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", f"{start:.3f}", "-t", f"{excerpt:.3f}", "-i", str(source_path),
        "-af", "highpass=f=70,lowpass=f=7200",
        "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", str(dest)
    ], check=True)
    return dest


def read_pcm(path):
    with wave.open(str(path), "rb") as wav:
        if wav.getnchannels() != 1 or wav.getsampwidth() != 2 or wav.getframerate() != RATE:
            raise RuntimeError(f"Unexpected WAV format: {path}")
        pcm = array("h")
        pcm.frombytes(wav.readframes(wav.getnframes()))
        if sys.byteorder != "little":
            pcm.byteswap()
        return pcm


def write_pcm(path, pcm):
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(pcm.tobytes())


def energy(pcm):
    if not pcm:
        return 0.0
    stride = max(1, len(pcm) // 256)
    total = 0.0
    count = 0
    for i in range(0, len(pcm), stride):
        x = pcm[i] / 32768.0
        total += x * x
        count += 1
    return math.sqrt(total / max(1, count))


def fade(pcm):
    out = array("h", pcm)
    n = min(int(RATE * 0.018), len(out) // 4)
    for i in range(n):
        gain = i / max(1, n)
        out[i] = int(out[i] * gain)
        out[-1 - i] = int(out[-1 - i] * gain)
    return out


def processed_chunks(processed_path, profile_id):
    pcm = read_pcm(processed_path)
    chunks = []
    for start in range(0, len(pcm) - CHUNK_SAMPLES + 1, CHUNK_SAMPLES):
        part = pcm[start:start + CHUNK_SAMPLES]
        if energy(part) < 0.010:
            continue
        chunks.append({
            "profile": profile_id,
            "index": start // CHUNK_SAMPLES,
            "pcm": fade(part),
        })
    return chunks


def build_profile_source(profile):
    identifier = resolve_identifier(profile)
    names = candidate_audio_files(identifier)
    base_url = f"https://archive.org/download/{identifier}/"
    combined = array("h")
    used_files = []
    excerpt_no = 0

    # Prefer different chapter files, and collect enough raw speech that the reversed,
    # half-speed result contains far more unique chunks than the final bank needs.
    for file_index, name in enumerate(names[:8]):
        if len(combined) / RATE >= RAW_TARGET_SEC:
            break
        ext = Path(urllib.parse.urlparse(name).path).suffix or ".audio"
        local = WORK / f"{profile['id']}_source_{file_index}{ext}"
        url = base_url + urllib.parse.quote(name, safe="/")
        try:
            download(url, local)
            excerpt_path = WORK / f"{profile['id']}_raw_{excerpt_no}.wav"
            if extract_raw_excerpt(local, excerpt_path, excerpt_no) is None:
                continue
            excerpt = read_pcm(excerpt_path)
            if energy(excerpt) < 0.006:
                continue
            combined.extend(excerpt)
            used_files.append(name)
            excerpt_no += 1
        except Exception as exc:
            print(f"WARN {profile['id']} skipped {name}: {exc}", file=sys.stderr)

    if len(combined) / RATE < 80:
        raise RuntimeError(
            f"{profile['label']} only produced {len(combined) / RATE:.1f}s of raw speech from {identifier}"
        )

    raw_path = WORK / f"{profile['id']}_combined_raw.wav"
    processed_path = WORK / f"{profile['id']}_processed.wav"
    write_pcm(raw_path, combined)

    # Order matters: concatenate raw speech -> reverse entire stream -> slow to ~50%.
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(raw_path),
        "-af", "areverse,atempo=0.5",
        "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_s16le", str(processed_path)
    ], check=True)

    chunks = processed_chunks(processed_path, profile["id"])
    if len(chunks) < TARGET_CHUNKS:
        raise RuntimeError(
            f"{profile['label']} has only {len(chunks)} energetic processed chunks; need {TARGET_CHUNKS}"
        )
    return identifier, used_files, chunks


def write_finished_bank(resource_name, label, chunks, seed, reader, identifier, used_files):
    rng = random.Random(seed)
    available = list(chunks)
    rng.shuffle(available)
    chosen = available[:TARGET_CHUNKS]
    if len(chosen) != TARGET_CHUNKS:
        raise RuntimeError(f"{label}: insufficient unique chunks")

    out = array("h")
    for item in chosen:
        out.extend(item["pcm"])
    path = RAW_DIR / f"{resource_name}.wav"
    write_pcm(path, out)

    sequence = "|".join(f"{x['profile']}:{x['index']}" for x in chosen)
    manifest = {
        "resource": resource_name,
        "label": label,
        "reader": reader,
        "internet_archive_identifier": identifier,
        "source_files": used_files,
        "duration_sec": len(out) / RATE,
        "chunk_sec": CHUNK_SEC,
        "chunks": len(chosen),
        "unique_chunk_count": len(set(sequence.split("|"))),
        "sequence_sha256": hashlib.sha256(sequence.encode()).hexdigest(),
        "wav_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "processing_order": "raw excerpts concatenated -> reverse -> 50% speed -> 2s chunks -> shuffle -> render",
    }
    print(json.dumps(manifest, indent=2))
    return manifest


def write_mixed_bank(profile_results):
    pool = []
    for profile, _, _, chunks in profile_results:
        for chunk in chunks:
            pool.append(chunk)
    rng = random.Random(0x45434830564F4944)
    rng.shuffle(pool)

    chosen = []
    last_profile = None
    while pool and len(chosen) < TARGET_CHUNKS:
        pick = None
        for i, item in enumerate(pool):
            if item["profile"] != last_profile:
                pick = i
                break
        if pick is None:
            pick = 0
        item = pool.pop(pick)
        chosen.append(item)
        last_profile = item["profile"]

    out = array("h")
    for item in chosen:
        out.extend(item["pcm"])
    path = RAW_DIR / "bank_mixed.wav"
    write_pcm(path, out)
    sequence = "|".join(f"{x['profile']}:{x['index']}" for x in chosen)
    manifest = {
        "resource": "bank_mixed",
        "label": "Mixed Human",
        "reader": "multiple verified source readers",
        "internet_archive_identifier": "multiple",
        "source_files": [],
        "duration_sec": len(out) / RATE,
        "chunk_sec": CHUNK_SEC,
        "chunks": len(chosen),
        "unique_chunk_count": len(set(sequence.split("|"))),
        "unique_profiles": sorted(set(x["profile"] for x in chosen)),
        "sequence_sha256": hashlib.sha256(sequence.encode()).hexdigest(),
        "wav_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "processing_order": "single-speaker processed pools -> cross-profile shuffle -> render",
    }
    print(json.dumps(manifest, indent=2))
    return manifest


def main():
    results = []
    manifests = []
    for index, profile in enumerate(PROFILES):
        print(f"BUILDING {profile['label']} ({profile['reader']})")
        identifier, used_files, chunks = build_profile_source(profile)
        results.append((profile, identifier, used_files, chunks))
        manifests.append(write_finished_bank(
            "bank_" + profile["id"],
            profile["label"],
            chunks,
            0x1000 + index * 0x1337,
            profile["reader"],
            identifier,
            used_files,
        ))

    manifests.append(write_mixed_bank(results))
    (RAW_DIR / "bank_manifest.json").write_text(json.dumps(manifests, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
