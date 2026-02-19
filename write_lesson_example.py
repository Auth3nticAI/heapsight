#!/usr/bin/env python3
"""
write_lesson_example.py — Demonstrates the correct pattern for writing
TypeScript lesson files from Claude Code on Windows.

This is the TEMPLATE. Claude Code should generate a script like this,
save it to %TEMP%/write_lessons.py, then execute it.

The key insight: build content programmatically using chr() for special
characters. Never embed raw TypeScript in shell commands.
"""

import os
import base64
import json
import hashlib

# ─── Setup ───────────────────────────────────────────────────────────
UP = os.environ["USERPROFILE"]
TEMP = os.environ["TEMP"]
LESSONS_DIR = os.path.join(UP, "crash-demo", "src", "data", "lessons")

# Special characters — never type these raw in shell-piped Python
BT  = chr(96)       # backtick `
BTT = BT * 3        # triple backtick ```
NL  = chr(10)       # newline
QT  = chr(34)       # double quote "
SQ  = chr(39)       # single quote '
BS  = chr(92)       # backslash \


def write_lesson(filename: str, content: str):
    """Write a lesson file and verify it."""
    dest = os.path.join(LESSONS_DIR, filename)
    content_bytes = content.encode("utf-8")
    with open(dest, "wb") as f:
        f.write(content_bytes)
    sha = hashlib.sha256(content_bytes).hexdigest()[:12]
    print(f"OK|{filename}|{len(content_bytes)} bytes|sha256={sha}")


# ─── Lesson 22: No-rand Rule ────────────────────────────────────────
# Build each section as a list of lines, then join with NL

def build_lesson_22():
    L = []  # accumulator

    # ── File header ──
    L.append(f'import type {{ Lesson }} from {QT}@/types/lesson{QT};')
    L.append(f'')
    L.append(f'export const lessonRPG22: Lesson = {{')
    L.append(f'  id: {QT}rpg-22-no-rand-rule{QT},')
    L.append(f'  title: {QT}No-rand Rule{QT},')
    L.append(f'  description: {QT}Remove std::rand, enforce one RNG.{QT},')
    L.append(f'  order: 22,')
    L.append(f'  xpReward: 75,')
    L.append(f'  tier: {QT}pro{QT},')
    L.append(f'  concepts: [{QT}no-rand rule{QT}, {QT}single RNG{QT}],')

    # ── Part 1: Concept ──
    L.append(f'  part1: {{')
    L.append(f'    title: {QT}Concept: No-rand Rule{QT},')
    L.append(f'    type: {QT}concept{QT},')

    # Template literal with backtick — this is the tricky part
    # BT opens and closes the template literal
    L.append(f'    instructions: {BT}# No-rand Rule')
    L.append(f'')
    L.append(f'## Mental Model')
    L.append(f'')
    L.append(f'The no-rand rule is simple: {BT}rand(){BT} is banned.')
    L.append(f'')
    L.append(f'## The Fix')
    L.append(f'')
    L.append(f'{BTT}cpp')
    L.append(f'int spawn_enemy(WorldState& w, RNG& rng, int eid) {{')
    L.append(f'    w.pos_x[eid] = rng_range(rng, 1, 8);')
    L.append(f'    return eid;')
    L.append(f'}}')
    L.append(f'{BTT}')
    L.append(f'')
    L.append(f'## Key Concepts')
    L.append(f'')
    L.append(f'- **Single source** \u2014 one {BT}RNG{BT} instance.')
    L.append(f'- **Explicit parameter** \u2014 functions take {BT}RNG&{BT}.{BT},')
    L.append(f'  }},')

    # ── Part 2: Coding ──
    L.append(f'  part2: {{')
    L.append(f'    title: {QT}Practice: No-rand Rule{QT},')
    L.append(f'    type: {QT}coding{QT},')

    L.append(f'    prompt: {BT}## Task')
    L.append(f'')
    L.append(f'Move the RNG into WorldState.{BT},')

    # Starter code template literal
    L.append(f'    starterCode: {BT}#include <iostream>')
    L.append(f'using namespace std;')
    L.append(f'// TODO: implement{BT},')

    # Solution template literal
    L.append(f'    solution: {BT}#include <iostream>')
    L.append(f'using namespace std;')
    L.append(f'// Full solution here{BT},')

    L.append(f'    hints: [')
    L.append(f'      {QT}Add RNG rng to WorldState{QT},')
    L.append(f'    ],')
    L.append(f'    validationCriteria: [')
    L.append(f'      {QT}RNG_IN_WORLD_STATE|seed=1337 appears{QT},')
    L.append(f'    ],')
    L.append(f'    outputHints: [')
    L.append(f'      {{ trigger: {QT}RNG_IN_WORLD_STATE{QT}, message: {QT}RNG stored in WorldState.{QT} }},')
    L.append(f'    ],')
    L.append(f'  }},')
    L.append(f'}};')

    return NL.join(L)


# ─── Main ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"LESSONS_DIR: {LESSONS_DIR}")
    print(f"exists: {os.path.exists(LESSONS_DIR)}")
    print()

    # This is a simplified example. The real version would have
    # full lesson content. The pattern is identical — just more lines.
    content = build_lesson_22()
    write_lesson("lesson-rpg-22-no-rand-rule.ts", content)

    # To write the REAL full content, Claude Code would:
    # 1. Generate this script with full lesson content in the build_ functions
    # 2. Save it: python safe_write.py write "%TEMP%/write_lessons.py" <base64_of_this_script>
    # 3. Execute: python "%TEMP%/write_lessons.py"
    # 4. Verify: python safe_write.py verify <each_dest_file> <sha_prefix>

    print()
    print("DONE — pattern demonstrated successfully")
    print()
    print("WORKFLOW SUMMARY:")
    print("1. Claude Code generates a Python script like this one")
    print("2. Saves it to %TEMP%/write_lessons.py using safe_write.py")
    print("3. Runs: python %TEMP%/write_lessons.py")
    print("4. All files written — zero escaping issues")
