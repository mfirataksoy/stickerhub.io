"""Build the sticker archive from a Firestore export.

Usage: python3 scripts/fetch-stickers.py path/to/firestore-export.json

Keeps only stickers that were explicitly marked safe (isPlus18 == False) and
are not political, writes data/stickers.json and downloads each image to
stickers/<id>.webp. Images need the Firebase project's billing to be active.
"""
import json
import os
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_CATEGORIES = {"Siyasi", "Political"}


def main(export_path):
    with open(export_path, encoding="utf-8") as f:
        export = json.load(f)

    safe = [
        s for s in export["stickers"]
        if s.get("isPlus18") is False and s.get("category") not in SKIP_CATEGORIES
    ]

    os.makedirs(os.path.join(ROOT, "stickers"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)

    archive, failed = [], 0
    for s in safe:
        target = os.path.join(ROOT, "stickers", s["id"] + ".webp")
        if not os.path.exists(target):
            try:
                with urllib.request.urlopen(s["stickerImageURL"], timeout=30) as r:
                    data = r.read()
                with open(target, "wb") as out:
                    out.write(data)
            except Exception as e:  # keep the entry; the page falls back to the emoji
                failed += 1
                print("skip", s["id"], e)
        archive.append({
            "id": s["id"],
            "name": s.get("stickerName") or "",
            "tags": s.get("tags") or [],
            "category": s.get("category") or "Other",
            "added": s["createTime"][:10],
        })

    with open(os.path.join(ROOT, "data", "stickers.json"), "w", encoding="utf-8") as f:
        json.dump(archive, f, ensure_ascii=False, indent=1)
    print(f"{len(archive)} stickers, {len(archive) - failed} images, {failed} failed")


if __name__ == "__main__":
    main(sys.argv[1])
