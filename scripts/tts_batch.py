#!/usr/bin/env python3
"""
Local parallel neural TTS generator using Piper (da_DK-talesyntese-medium) + lameenc MP3.
Zero network dependencies during synthesis; verifies valid MPEG frames on every output file.
"""

import json
import multiprocessing as mp
import os
import sys
import time
from pathlib import Path

import lameenc
from piper import PiperVoice

MODEL_PATH = "/tmp/piper-models/da_DK-talesyntese-medium.onnx"
MP3_BITRATE = 32
WORKERS = 4

_VOICE = None


def _init_worker(model_path: str):
    global _VOICE
    _VOICE = PiperVoice.load(model_path)


def is_valid_mp3(path: Path) -> bool:
    if not path.exists():
        return False
    if path.stat().st_size < 400:
        return False
    try:
        with path.open("rb") as f:
            head = f.read(4)
        if head[:3] == b"ID3":
            return True
        if len(head) >= 2 and head[0] == 0xFF and (head[1] & 0xE0) == 0xE0:
            return True
    except OSError:
        return False
    return False


def _process_one(item: dict):
    global _VOICE
    out_path = Path(item["outPath"])
    if is_valid_mp3(out_path):
        return ("skipped", item["hash"], out_path.stat().st_size)

    text = item["spoken"].strip()
    if not text:
        return ("skipped", item["hash"], 0)

    tmp_path = out_path.with_suffix(".mp3.tmp")
    try:
        pcm = bytearray()
        for chunk in _VOICE.synthesize(text):
            pcm.extend(chunk.audio_int16_bytes)

        enc = lameenc.Encoder()
        enc.set_bit_rate(MP3_BITRATE)
        enc.set_in_sample_rate(_VOICE.config.sample_rate)
        enc.set_channels(1)
        enc.set_quality(2)
        mp3_bytes = enc.encode(bytes(pcm)) + enc.flush()

        tmp_path.write_bytes(mp3_bytes)
        if not is_valid_mp3(tmp_path):
            raise RuntimeError(f"Invalid MP3 generated ({len(mp3_bytes)} bytes)")
        os.replace(tmp_path, out_path)
        return ("ok", item["hash"], len(mp3_bytes))
    except Exception as exc:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass
        return ("err", item["hash"], str(exc))


def main():
    tasks_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("scripts/tts_tasks.json")
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 0

    if not Path(MODEL_PATH).exists():
        print(f"Missing Piper ONNX model at {MODEL_PATH}", file=sys.stderr)
        sys.exit(1)

    tasks = json.loads(tasks_path.read_text(encoding="utf-8"))
    if limit > 0:
        tasks = tasks[:limit]

    total = len(tasks)
    if total == 0:
        print("No pending tasks.")
        return

    print(
        f"Starting local Piper batch ({MODEL_PATH}, {MP3_BITRATE}kbps MP3, workers={WORKERS}) "
        f"for {total} files...",
        flush=True,
    )
    t0 = time.time()
    ok = 0
    skipped = 0
    failed = []
    total_bytes = 0

    with mp.Pool(processes=WORKERS, initializer=_init_worker, initargs=(MODEL_PATH,)) as pool:
        for idx, (status, h, info) in enumerate(pool.imap_unordered(_process_one, tasks, chunksize=8), 1):
            if status == "ok":
                ok += 1
                total_bytes += info
            elif status == "skipped":
                skipped += 1
                total_bytes += info
            else:
                failed.append({"hash": h, "error": info})
                print(f"[FAILED] {h}: {info}", file=sys.stderr, flush=True)

            if idx % 100 == 0 or idx == total:
                elapsed = time.time() - t0
                rate = idx / elapsed if elapsed > 0 else 0
                eta = (total - idx) / rate if rate > 0 else 0
                print(
                    f"[{idx}/{total}] ({idx * 100 / total:.1f}%) "
                    f"new={ok} skipped={skipped} fail={len(failed)} "
                    f"rate={rate:.1f} files/s ETA={eta:.0f}s",
                    flush=True,
                )

    elapsed = time.time() - t0
    print(
        f"Done in {elapsed:.1f}s: {ok} generated, {skipped} skipped, {len(failed)} failed, "
        f"batch size ~{total_bytes / (1024 * 1024):.1f} MB.",
        flush=True,
    )
    if failed:
        fail_path = tasks_path.with_name("tts_failed.json")
        fail_path.write_text(json.dumps(failed, indent=2, ensure_ascii=False), encoding="utf-8")
        sys.exit(1)


if __name__ == "__main__":
    main()
