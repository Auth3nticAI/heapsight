#!/bin/bash
# compile.sh — Compiles student C++ to WebAssembly using Emscripten + raylib.
#
# Usage: compile.sh <student.cpp> <output_dir> <path> <lesson>
#   $1 — Path to student .cpp file
#   $2 — Output directory for game.js + game.wasm
#   $3 — Learning path name (rpg, platformer, shooter, robotics)
#   $4 — Lesson number (1-100)
#
# Exit codes:
#   0 — Success
#   1 — Invalid arguments
#   2 — Compilation failed (stderr has compiler errors)
#   3 — Output .wasm exceeds 10MB size limit
#   124 — Compilation timed out (15s)

set -euo pipefail

STUDENT_CPP="$1"
OUTPUT_DIR="$2"
PATH_NAME="$3"
LESSON_NUM="$4"

# Validate arguments
if [ -z "$STUDENT_CPP" ] || [ -z "$OUTPUT_DIR" ] || [ -z "$PATH_NAME" ] || [ -z "$LESSON_NUM" ]; then
    echo "Usage: compile.sh <student.cpp> <output_dir> <path> <lesson>" >&2
    exit 1
fi

if [ ! -f "$STUDENT_CPP" ]; then
    echo "Error: Student file not found: $STUDENT_CPP" >&2
    exit 1
fi

# Resolve header directory — lesson-specific if it exists, otherwise base
LESSON_HEADER_DIR="/opt/heapsight/headers/${PATH_NAME}/lesson-${LESSON_NUM}"
BASE_HEADER_DIR="/opt/heapsight/headers/${PATH_NAME}/base"

if [ -d "$LESSON_HEADER_DIR" ]; then
    HEADER_DIR="$LESSON_HEADER_DIR"
else
    HEADER_DIR="$BASE_HEADER_DIR"
fi

# Build include flags — always include raylib headers, plus path-specific headers if they exist
INCLUDE_FLAGS="-I/opt/heapsight/include"
if [ -d "$HEADER_DIR" ]; then
    INCLUDE_FLAGS="$INCLUDE_FLAGS -I$HEADER_DIR"
fi

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Compile with timeout (15 seconds max)
# Flags per CLAUDE.md:
#   -O1 -std=c++17 -DPLATFORM_WEB -DGRAPHICS_API_OPENGL_ES2
#   -sUSE_GLFW=3 -sASYNCIFY -sALLOW_MEMORY_GROWTH=1
#   -sMODULARIZE=1 -sEXPORT_ES6=1
#   -sEXPORTED_RUNTIME_METHODS=['print','printErr']
timeout 15 em++ "$STUDENT_CPP" \
    -o "${OUTPUT_DIR}/game.js" \
    $INCLUDE_FLAGS \
    -L/opt/heapsight/lib -lraylib \
    -O1 \
    -std=c++17 \
    -DPLATFORM_WEB \
    -DGRAPHICS_API_OPENGL_ES2 \
    -sUSE_GLFW=3 \
    -sASYNCIFY \
    -sALLOW_MEMORY_GROWTH=1 \
    -sMODULARIZE=1 \
    -sEXPORT_ES6=1 \
    -sGL_ENABLE_GET_PROC_ADDRESS \
    "-sEXPORTED_RUNTIME_METHODS=['print','printErr']"

COMPILE_EXIT=$?

if [ $COMPILE_EXIT -eq 124 ]; then
    echo "Error: Compilation timed out after 15 seconds" >&2
    exit 124
fi

if [ $COMPILE_EXIT -ne 0 ]; then
    exit 2
fi

# Validate output .wasm size (10MB limit)
WASM_FILE="${OUTPUT_DIR}/game.wasm"
if [ ! -f "$WASM_FILE" ]; then
    echo "Error: game.wasm not produced" >&2
    exit 2
fi

WASM_SIZE=$(stat -c%s "$WASM_FILE" 2>/dev/null || stat -f%z "$WASM_FILE" 2>/dev/null)
MAX_SIZE=$((10 * 1024 * 1024))

if [ "$WASM_SIZE" -gt "$MAX_SIZE" ]; then
    echo "Error: Output .wasm is ${WASM_SIZE} bytes, exceeding 10MB limit" >&2
    exit 3
fi

echo "Compilation successful: game.js + game.wasm (${WASM_SIZE} bytes)"
exit 0
