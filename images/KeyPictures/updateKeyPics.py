#!/usr/bin/env python3
"""
Generate index.json for the KeyPictures folder.

Usage:
  cd images/KeyPictures
  python3 build_keypictures_manifest.py

Output format:
{
  "files": [
    "door.jpg",
    "big room.jpg",
    "kitchen.png"
  ]
}
"""

import json
import os
import re
from pathlib import Path

# File types to include
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# Natural sort to keep 1, 2, 10 in human order
_natural_key = lambda s: [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]

def list_images(folder: Path):
    files = []
    for entry in folder.iterdir():
        if entry.is_file() and entry.suffix.lower() in IMAGE_EXTS:
            files.append(entry.name)
    files.sort(key=_natural_key)
    return files

def write_manifest(folder: Path, files):
    manifest_path = folder / "index.json"
    data = {"files": files}
    # Pretty with stable ordering
    manifest_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return manifest_path

def main():
    folder = Path(__file__).resolve().parent
    files = list_images(folder)
    path = write_manifest(folder, files)
    print(f"Wrote {len(files)} entries to {path}")

if __name__ == "__main__":
    main()
