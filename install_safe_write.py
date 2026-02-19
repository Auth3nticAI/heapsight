"""
install_safe_write.py — Run this ONCE to set up the safe file writer.

Usage: python install_safe_write.py

This will:
1. Copy safe_write.py to C:/Users/<you>/tools/safe_write.py
2. Create CLAUDE.md in your project root with the rules
3. Print verification that everything works
"""

import os
import shutil
import sys

UP = os.environ.get("USERPROFILE", os.path.expanduser("~"))
TOOLS_DIR = os.path.join(UP, "tools")
DEST = os.path.join(TOOLS_DIR, "safe_write.py")

# Find safe_write.py — should be in same directory as this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(SCRIPT_DIR, "safe_write.py")

if not os.path.exists(SOURCE):
    print(f"ERROR: safe_write.py not found at {SOURCE}")
    print("Make sure safe_write.py is in the same directory as this script.")
    sys.exit(1)

# Create tools directory
os.makedirs(TOOLS_DIR, exist_ok=True)

# Copy safe_write.py
shutil.copy2(SOURCE, DEST)
print(f"OK | safe_write.py -> {DEST}")

# Verify it works
import subprocess
result = subprocess.run(
    [sys.executable, DEST, "write", os.path.join(TOOLS_DIR, "_test.tmp"), "dGVzdA=="],
    capture_output=True, text=True
)
if result.returncode == 0:
    print(f"OK | Verified: {result.stdout.strip()}")
    os.remove(os.path.join(TOOLS_DIR, "_test.tmp"))
else:
    print(f"WARN | Verification failed: {result.stderr}")

print()
print("=" * 60)
print("INSTALLED SUCCESSFULLY")
print("=" * 60)
print()
print("Claude Code can now use:")
print(f'  python "{DEST}" write <dest_path> <base64>')
print(f'  python "{DEST}" batch <manifest.json>')
print()
print("NEXT STEPS:")
print("1. Copy CLAUDE.md to your project root (crash-demo/)")
print("   - Claude Code reads this automatically for instructions")
print("2. When starting Claude Code sessions, it will follow the")
print("   safe writing rules from CLAUDE.md")
print()
print("Or add this to your Claude Code system prompt:")
print('  "When writing files, always use ~/tools/safe_write.py"')
print('  "Never use python -c with multi-line content"')
print('  "Always build content programmatically using chr() for special chars"')
