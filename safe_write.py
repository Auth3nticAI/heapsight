#!/usr/bin/env python3
"""
safe_write.py — Escape-proof file writer for Claude Code on Windows.

PROBLEM:
  Claude Code → bash → python -c → file content = 3+ escaping layers.
  Backticks, quotes, backslashes, and template literals get mangled.

SOLUTION:
  Encode content as base64. Zero special characters. Zero escaping.
  This script decodes and writes. One layer. No mangling.

USAGE (from Claude Code bash):

  # Write a single file:
  python safe_write.py write <dest_path> <base64_content>

  # Write from a temp content file (for very large files):
  python safe_write.py write-from <dest_path> <temp_file_with_base64>

  # Batch write from a manifest JSON:
  python safe_write.py batch <manifest_json_path>
  
  # Encode a file to base64 (for reading existing content):
  python safe_write.py encode <source_path>

  # Verify a file was written correctly:
  python safe_write.py verify <file_path> <expected_sha256>

MANIFEST FORMAT (for batch):
  {
    "files": [
      {"dest": "C:/Users/.../file.ts", "b64": "aW1wb3J0..."},
      {"dest": "C:/Users/.../file2.ts", "b64_file": "/tmp/content2.b64"}
    ]
  }

Place this script at a stable location:
  C:/Users/<you>/tools/safe_write.py

Then Claude Code can always call:
  python C:/Users/<you>/tools/safe_write.py write <dest> <b64>
"""

import sys
import os
import base64
import hashlib
import json


def write_file(dest: str, content_bytes: bytes) -> bool:
    """Write bytes to dest, creating parent dirs if needed."""
    try:
        os.makedirs(os.path.dirname(os.path.abspath(dest)), exist_ok=True)
        with open(dest, "wb") as f:
            f.write(content_bytes)
        return True
    except Exception as e:
        print(f"ERROR|write_failed|{dest}|{e}", file=sys.stderr)
        return False


def cmd_write(args):
    """Write base64-encoded content to a file."""
    if len(args) < 2:
        print("ERROR|usage: safe_write.py write <dest_path> <base64_content>", file=sys.stderr)
        return 1
    dest = args[0]
    b64_content = args[1]
    try:
        content = base64.b64decode(b64_content)
    except Exception as e:
        print(f"ERROR|b64_decode_failed|{e}", file=sys.stderr)
        return 1
    if write_file(dest, content):
        size = len(content)
        sha = hashlib.sha256(content).hexdigest()[:12]
        print(f"OK|{dest}|{size} bytes|sha256={sha}")
        return 0
    return 1


def cmd_write_from(args):
    """Write content from a temp file containing base64."""
    if len(args) < 2:
        print("ERROR|usage: safe_write.py write-from <dest_path> <b64_file>", file=sys.stderr)
        return 1
    dest = args[0]
    b64_file = args[1]
    try:
        with open(b64_file, "r") as f:
            b64_content = f.read().strip()
        content = base64.b64decode(b64_content)
    except Exception as e:
        print(f"ERROR|read_or_decode_failed|{e}", file=sys.stderr)
        return 1
    if write_file(dest, content):
        size = len(content)
        sha = hashlib.sha256(content).hexdigest()[:12]
        print(f"OK|{dest}|{size} bytes|sha256={sha}")
        # Clean up temp file
        try:
            os.remove(b64_file)
        except:
            pass
        return 0
    return 1


def cmd_batch(args):
    """Batch write from a JSON manifest."""
    if len(args) < 1:
        print("ERROR|usage: safe_write.py batch <manifest.json>", file=sys.stderr)
        return 1
    manifest_path = args[0]
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    except Exception as e:
        print(f"ERROR|manifest_read_failed|{e}", file=sys.stderr)
        return 1

    files = manifest.get("files", [])
    ok_count = 0
    fail_count = 0

    for entry in files:
        dest = entry.get("dest", "")
        if not dest:
            print(f"ERROR|missing_dest_in_entry", file=sys.stderr)
            fail_count += 1
            continue

        # Content can come from inline b64 or a b64 file
        b64_content = entry.get("b64", "")
        b64_file = entry.get("b64_file", "")

        try:
            if b64_file:
                with open(b64_file, "r") as f:
                    b64_content = f.read().strip()
            content = base64.b64decode(b64_content)
        except Exception as e:
            print(f"ERROR|decode_failed|{dest}|{e}", file=sys.stderr)
            fail_count += 1
            continue

        if write_file(dest, content):
            size = len(content)
            sha = hashlib.sha256(content).hexdigest()[:12]
            print(f"OK|{dest}|{size} bytes|sha256={sha}")
            ok_count += 1
        else:
            fail_count += 1

    print(f"BATCH|ok={ok_count}|fail={fail_count}|total={len(files)}")

    # Clean up manifest
    try:
        os.remove(manifest_path)
    except:
        pass

    return 0 if fail_count == 0 else 1


def cmd_encode(args):
    """Encode a file to base64 (for reading/transporting content)."""
    if len(args) < 1:
        print("ERROR|usage: safe_write.py encode <source_path>", file=sys.stderr)
        return 1
    source = args[0]
    try:
        with open(source, "rb") as f:
            content = f.read()
        b64 = base64.b64encode(content).decode("ascii")
        print(b64)
        return 0
    except Exception as e:
        print(f"ERROR|encode_failed|{e}", file=sys.stderr)
        return 1


def cmd_verify(args):
    """Verify a file matches expected sha256 prefix."""
    if len(args) < 2:
        print("ERROR|usage: safe_write.py verify <file_path> <expected_sha256_prefix>", file=sys.stderr)
        return 1
    filepath = args[0]
    expected = args[1]
    try:
        with open(filepath, "rb") as f:
            content = f.read()
        sha = hashlib.sha256(content).hexdigest()
        if sha.startswith(expected):
            print(f"VERIFY|OK|{filepath}|sha256={sha[:12]}|{len(content)} bytes")
            return 0
        else:
            print(f"VERIFY|MISMATCH|{filepath}|expected={expected}|actual={sha[:12]}")
            return 1
    except Exception as e:
        print(f"VERIFY|ERROR|{filepath}|{e}", file=sys.stderr)
        return 1


COMMANDS = {
    "write": cmd_write,
    "write-from": cmd_write_from,
    "batch": cmd_batch,
    "encode": cmd_encode,
    "verify": cmd_verify,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print("safe_write.py — Escape-proof file writer for Claude Code")
        print(f"Commands: {', '.join(COMMANDS.keys())}")
        print("Run: safe_write.py <command> --help for usage")
        return 1
    return COMMANDS[sys.argv[1]](sys.argv[2:])


if __name__ == "__main__":
    sys.exit(main())
