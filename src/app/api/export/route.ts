import { NextResponse } from "next/server";
import JSZip from "jszip";

// ---------------------------------------------------------------------------
// POST /api/export — Generate a downloadable zip with student code + build files
// ---------------------------------------------------------------------------

const VALID_PATHS = ["rpg", "platformer", "shooter", "crawler"] as const;
type ValidPath = (typeof VALID_PATHS)[number];

const CANVAS_SIZES: Record<ValidPath, { width: number; height: number }> = {
  rpg: { width: 640, height: 640 },
  platformer: { width: 800, height: 450 },
  shooter: { width: 800, height: 450 },
  crawler: { width: 800, height: 600 },
};

const PATH_DISPLAY_NAMES: Record<ValidPath, string> = {
  rpg: "RPG",
  platformer: "Platformer",
  shooter: "Space Shooter",
  crawler: "Dungeon Crawler",
};

function generateCMakeLists(path: ValidPath, title: string): string {
  const { width, height } = CANVAS_SIZES[path];
  const projectName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  return `cmake_minimum_required(VERSION 3.15)
project(${projectName || "heapsight_game"} LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ---- raylib (auto-downloaded via FetchContent) ----
include(FetchContent)
FetchContent_Declare(
  raylib
  GIT_REPOSITORY https://github.com/raysan5/raylib.git
  GIT_TAG 5.5
  GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(raylib)

# ---- Executable ----
add_executable(\${PROJECT_NAME} src/main.cpp)
target_link_libraries(\${PROJECT_NAME} PRIVATE raylib)

# Window defaults (override in code or at build time)
target_compile_definitions(\${PROJECT_NAME} PRIVATE
  WINDOW_WIDTH=${width}
  WINDOW_HEIGHT=${height}
)

# Platform-specific
if(APPLE)
  target_link_libraries(\${PROJECT_NAME} PRIVATE "-framework IOKit" "-framework Cocoa" "-framework OpenGL")
elseif(UNIX)
  target_link_libraries(\${PROJECT_NAME} PRIVATE m pthread dl GL X11)
endif()
`;
}

function generateGitHubWorkflow(path: ValidPath): string {
  return `name: Build ${PATH_DISPLAY_NAMES[path]}

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: \${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Configure CMake
        run: cmake -B build -DCMAKE_BUILD_TYPE=Release

      - name: Build
        run: cmake --build build --config Release

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: game-\${{ matrix.os }}
          path: |
            build/Release/*
            build/${path}_game*
            !build/**/*.dir
`;
}

function generateReadme(path: ValidPath, title: string): string {
  const displayName = PATH_DISPLAY_NAMES[path];
  return `# ${title}

A **${displayName}** built from scratch in C++ with [raylib](https://www.raylib.com/).

Built on [HeapSight](https://heapsight.com) — learn C++ by building real games.

## Build

\`\`\`bash
cmake -B build
cmake --build build
\`\`\`

## Requirements

- CMake 3.15+
- C++17 compiler (GCC, Clang, or MSVC)
- raylib 5.5 (auto-downloaded by CMake)

## License

This code was written as part of the HeapSight ${displayName} learning path.
`;
}

export async function POST(request: Request) {
  // 1. Parse body
  let body: { code?: unknown; path?: unknown; lessonTitle?: unknown; files?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 2. Validate inputs
  const { code, path, lessonTitle, files } = body;

  if (typeof path !== "string" || !VALID_PATHS.includes(path as ValidPath)) {
    return NextResponse.json(
      { error: `Invalid path. Must be one of: ${VALID_PATHS.join(", ")}` },
      { status: 400 }
    );
  }

  const validPath = path as ValidPath;
  const title = typeof lessonTitle === "string" ? lessonTitle : "HeapSight Game";

  // Support both single-file (code string) and multi-file (files record)
  let fileMap: Record<string, string>;
  if (files && typeof files === "object" && !Array.isArray(files)) {
    fileMap = files as Record<string, string>;
    // Validate all values are strings
    for (const [k, v] of Object.entries(fileMap)) {
      if (typeof v !== "string") {
        return NextResponse.json(
          { error: `File "${k}" content must be a string` },
          { status: 400 }
        );
      }
    }
  } else if (typeof code === "string" && code.length > 0) {
    fileMap = { "main.cpp": code };
  } else {
    return NextResponse.json(
      { error: "Must provide 'code' (string) or 'files' (Record<string, string>)" },
      { status: 400 }
    );
  }

  // 3. Build zip
  const zip = new JSZip();

  // Student code files
  for (const [filename, content] of Object.entries(fileMap)) {
    zip.file(`src/${filename}`, content);
  }

  // CMakeLists.txt
  zip.file("CMakeLists.txt", generateCMakeLists(validPath, title));

  // GitHub Actions workflow
  zip.file(".github/workflows/build.yml", generateGitHubWorkflow(validPath));

  // README
  zip.file("README.md", generateReadme(validPath, title));

  // .gitignore
  zip.file(
    ".gitignore",
    `build/
cmake-build-*/
.cache/
.vscode/
*.exe
*.out
`
  );

  // 4. Generate and return zip
  const zipBuffer = await zip.generateAsync({ type: "uint8array" });

  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new NextResponse(zipBuffer.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeTitle || "heapsight-export"}.zip"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
