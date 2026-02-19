import type { Lesson } from "@/types/lesson";

export const lesson96: Lesson = {
  id: "96-build-system",
  title: "Build System",
  description: "Create a Makefile and CMakeLists.txt for building the complete project.",
  order: 96,
  xpReward: 225,
  tier: "pro",
  concepts: ["Makefile", "CMake", "build targets", "compilation", "linking"],
  part1: {
    title: "Concept: Build System",
    type: "concept",
    instructions: `# Build System — Compiling by Hand Does Not Scale

You have 15 source files. You change one. You retype the compile command. You forget a flag. The binary links against stale object files. The bug you just fixed is still there because you compiled the wrong file. Manual compilation is a bug factory. A build system compiles what changed, links what matters, and reports what broke. Makefile and CMake are the two tools that handle this.

## What Breaks Without This

Without a build system, every compilation is manual. Miss one file and the linker fails. Forget \\\`-std=c++17\\\` and your structured bindings break. Forget \\\`-Wall\\\` and a signed/unsigned comparison silently corrupts your score. Change a header and forget to recompile the three source files that include it. Stale object files link against the old header layout. Memory corruption at runtime. No warning. No error. Just wrong behavior.

## The Fix

A Makefile declares targets, dependencies, and recipes. The target is what you build. Dependencies are what it needs. The recipe is how to build it. Make checks timestamps. If a dependency is newer than the target, the recipe runs. Otherwise it skips. Incremental builds. Only recompile what changed.

\\\`\\\`\\\`
# Makefile anatomy:
# target: dependencies
# [TAB] recipe

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra
SRC = src/main.cpp src/game.cpp src/render.cpp
OBJ = $(SRC:.cpp=.o)

game: $(OBJ)
	$(CXX) $(CXXFLAGS) -o game $(OBJ)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJ) game
\\\`\\\`\\\`

CMake is the meta-build system. It generates Makefiles, Visual Studio projects, Xcode projects. One CMakeLists.txt works everywhere. \\\`cmake_minimum_required\\\` sets the version. \\\`project\\\` names it. \\\`add_executable\\\` lists sources. \\\`target_include_directories\\\` adds header paths.

\\\`\\\`\\\`
cmake_minimum_required(VERSION 3.14)
project(SpaceShooter)
add_executable(game src/main.cpp)
target_include_directories(game PRIVATE include)
\\\`\\\`\\\`

## Your Task

1. Generate Makefile content as output lines prefixed with BUILD|
2. Generate CMakeLists.txt content as output lines prefixed with CMAKE|
3. Simulate a build: compile, link, report results
4. Print: \\\`COMPILE|src/main.cpp|OK|warnings|0|errors|0\\\`
5. Print: \\\`LINK|game|OK|size|48KB\\\`
6. Print: \\\`BUILD_SUMMARY|files|1|compiled|1|linked|1|warnings|0|errors|0|output|game\\\`

Expected output:
\\\`\\\`\\\`
BUILD|# Makefile for Space Shooter
BUILD|CXX = g++
BUILD|CXXFLAGS = -std=c++17 -Wall -Wextra
BUILD|SRC = src/main.cpp
BUILD|game: $(SRC)
BUILD|	$(CXX) $(CXXFLAGS) -o game $(SRC)
CMAKE|cmake_minimum_required(VERSION 3.14)
CMAKE|project(SpaceShooter)
CMAKE|add_executable(game src/main.cpp)
COMPILE|src/main.cpp|OK|warnings|0|errors|0
LINK|game|OK|size|48KB
BUILD_SUMMARY|files|1|compiled|1|linked|1|warnings|0|errors|0|output|game
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using spaces instead of tabs in Makefile recipes. Make requires a literal tab character before the recipe command. Spaces cause a "missing separator" error. Every text editor hides the difference. Every build fails the same way. Use tabs in recipes. Always.

## Elite Insight

Build systems are dependency graphs. Make walks the graph from target to leaves, checking timestamps. CMake generates the graph from declarative rules. Ninja executes the graph with maximum parallelism. Bazel caches the graph across machines. The abstraction scales from one file to millions. The principle is the same: only rebuild what changed.

## Cross-Path Echo

Package managers follow the same pattern. npm reads package.json and installs dependencies. pip reads requirements.txt. Cargo reads Cargo.toml. The build file is a manifest of what the project needs. The tool resolves, fetches, and links. Your Makefile is a package.json for compilation.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Write printMakefile() — print Makefile content
//   Each line prefixed with "BUILD|"
//   Lines: # Makefile for Space Shooter
//          CXX = g++
//          CXXFLAGS = -std=c++17 -Wall -Wextra
//          SRC = src/main.cpp
//          game: $(SRC)
//          [TAB]$(CXX) $(CXXFLAGS) -o game $(SRC)

// TODO: Write printCMake() — print CMakeLists.txt content
//   Each line prefixed with "CMAKE|"
//   Lines: cmake_minimum_required(VERSION 3.14)
//          project(SpaceShooter)
//          add_executable(game src/main.cpp)

// TODO: Write simulateBuild() — simulate compile + link
//   Print COMPILE line, LINK line, BUILD_SUMMARY line

int main() {
    // TODO: Call printMakefile()
    // TODO: Call printCMake()
    // TODO: Call simulateBuild()

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

void printMakefile() {
    cout << "BUILD|# Makefile for Space Shooter" << endl;
    cout << "BUILD|CXX = g++" << endl;
    cout << "BUILD|CXXFLAGS = -std=c++17 -Wall -Wextra" << endl;
    cout << "BUILD|SRC = src/main.cpp" << endl;
    cout << "BUILD|game: $(SRC)" << endl;
    cout << "BUILD|\\t$(CXX) $(CXXFLAGS) -o game $(SRC)" << endl;
}

void printCMake() {
    cout << "CMAKE|cmake_minimum_required(VERSION 3.14)" << endl;
    cout << "CMAKE|project(SpaceShooter)" << endl;
    cout << "CMAKE|add_executable(game src/main.cpp)" << endl;
}

void simulateBuild() {
    cout << "COMPILE|src/main.cpp|OK|warnings|0|errors|0" << endl;
    cout << "LINK|game|OK|size|48KB" << endl;
    cout << "BUILD_SUMMARY|files|1|compiled|1|linked|1|warnings|0|errors|0|output|game" << endl;
}

int main() {
    printMakefile();
    printCMake();
    simulateBuild();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Makefile header", expectedOutput: "BUILD\\|# Makefile for Space Shooter", isPattern: true },
      { id: "t2", description: "Compiler flags", expectedOutput: "BUILD\\|CXXFLAGS = -std=c\\+\\+17 -Wall -Wextra", isPattern: true },
      { id: "t3", description: "CMake minimum version", expectedOutput: "CMAKE\\|cmake_minimum_required\\(VERSION 3\\.14\\)", isPattern: true },
      { id: "t4", description: "CMake add_executable", expectedOutput: "CMAKE\\|add_executable\\(game src/main\\.cpp\\)", isPattern: true },
      { id: "t5", description: "Compile succeeds", expectedOutput: "COMPILE\\|src/main\\.cpp\\|OK\\|warnings\\|0\\|errors\\|0", isPattern: true },
      { id: "t6", description: "Link succeeds", expectedOutput: "LINK\\|game\\|OK\\|size\\|48KB", isPattern: true },
      { id: "t7", description: "Build summary", expectedOutput: "BUILD_SUMMARY\\|files\\|1\\|compiled\\|1\\|linked\\|1\\|warnings\\|0\\|errors\\|0\\|output\\|game", isPattern: true },
    ],
    hints: [
      "printMakefile outputs 6 lines, each starting with \"BUILD|\". The tab in the recipe line is printed as a literal \\t character in the string: \"BUILD|\\t$(CXX) $(CXXFLAGS) -o game $(SRC)\".",
      "printCMake outputs 3 lines starting with \"CMAKE|\". The cmake_minimum_required, project, and add_executable are the three essential CMake commands for a minimal project.",
      "simulateBuild prints three lines: COMPILE for the source file, LINK for the binary, and BUILD_SUMMARY with totals. All values are hardcoded since this is a simulation.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Build System",
    type: "game_builder",
    instructions: `# Build System — Makefile and CMake for Space Shooter

The game is built. The code compiles. But there is no build system. Every compilation is a manual command. Miss a flag and warnings disappear. Miss a file and the linker fails. A Makefile automates the build. CMake generates the Makefile for any platform. Together they ensure the build is reproducible, correct, and fast.

## What Breaks Without This

Without a build system, the build is whatever the developer remembers to type. Different developers use different flags. One builds with optimizations, another without. One includes debug symbols, another strips them. The binary behaves differently on each machine. The bug exists only in the release build because nobody tested with \\\`-O2\\\`. Reproducibility requires automation.

## The Fix

A Makefile for direct builds. CMakeLists.txt for cross-platform generation. Both declare the same thing: source files, compiler, flags, output. The build system is the single source of truth for how the project compiles.

\\\`\\\`\\\`
# Makefile: explicit control
# CMake: portable generation
# Both: reproducible builds
\\\`\\\`\\\`

## Your Task

1. Print Makefile content with BUILD| prefix (6 lines)
2. Print CMakeLists.txt content with CMAKE| prefix (3 lines)
3. Simulate compile: \\\`COMPILE|src/main.cpp|OK|warnings|0|errors|0\\\`
4. Simulate link: \\\`LINK|game|OK|size|48KB\\\`
5. Print: \\\`BUILD_SUMMARY|files|1|compiled|1|linked|1|warnings|0|errors|0|output|game\\\`

## Beginner Trap

**Common Mistake:** Forgetting to set \\\`-std=c++17\\\` in CXXFLAGS. Without the standard flag, the compiler defaults to an older standard. Structured bindings, if-init, and constexpr-if all fail. The build system must enforce the standard. Every build. Every machine.

## Elite Insight

Professional projects use CMake presets. A CMakePresets.json file defines configurations: debug, release, sanitizer, profile. Each preset specifies flags, build directory, and generator. \\\`cmake --preset=release\\\` builds the optimized binary. \\\`cmake --preset=debug\\\` builds with symbols. One command, correct flags, every time.

## Cross-Path Echo

Docker builds follow the same pattern. A Dockerfile declares the base image, copies source, runs build commands, and produces a binary. The Dockerfile is a Makefile for containers. Reproducible builds on any machine. Your Makefile is a Dockerfile for compilation.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Write printMakefile() — 6 BUILD| lines
//   # Makefile for Space Shooter, CXX, CXXFLAGS, SRC, target, recipe

// TODO: Write printCMake() — 3 CMAKE| lines
//   cmake_minimum_required, project, add_executable

// TODO: Write simulateBuild() — compile, link, summary

int main() {
    // TODO: Call all three functions

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

void printMakefile() {
    cout << "BUILD|# Makefile for Space Shooter" << endl;
    cout << "BUILD|CXX = g++" << endl;
    cout << "BUILD|CXXFLAGS = -std=c++17 -Wall -Wextra" << endl;
    cout << "BUILD|SRC = src/main.cpp" << endl;
    cout << "BUILD|game: $(SRC)" << endl;
    cout << "BUILD|\\t$(CXX) $(CXXFLAGS) -o game $(SRC)" << endl;
}

void printCMake() {
    cout << "CMAKE|cmake_minimum_required(VERSION 3.14)" << endl;
    cout << "CMAKE|project(SpaceShooter)" << endl;
    cout << "CMAKE|add_executable(game src/main.cpp)" << endl;
}

void simulateBuild() {
    cout << "COMPILE|src/main.cpp|OK|warnings|0|errors|0" << endl;
    cout << "LINK|game|OK|size|48KB" << endl;
    cout << "BUILD_SUMMARY|files|1|compiled|1|linked|1|warnings|0|errors|0|output|game" << endl;
}

int main() {
    printMakefile();
    printCMake();
    simulateBuild();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Makefile header", expectedOutput: "BUILD\\|# Makefile for Space Shooter", isPattern: true },
      { id: "t2", description: "C++17 flags set", expectedOutput: "BUILD\\|CXXFLAGS = -std=c\\+\\+17 -Wall -Wextra", isPattern: true },
      { id: "t3", description: "CMake project name", expectedOutput: "CMAKE\\|project\\(SpaceShooter\\)", isPattern: true },
      { id: "t4", description: "CMake executable", expectedOutput: "CMAKE\\|add_executable\\(game src/main\\.cpp\\)", isPattern: true },
      { id: "t5", description: "Compile succeeds", expectedOutput: "COMPILE\\|src/main\\.cpp\\|OK\\|warnings\\|0\\|errors\\|0", isPattern: true },
      { id: "t6", description: "Link succeeds", expectedOutput: "LINK\\|game\\|OK\\|size\\|48KB", isPattern: true },
      { id: "t7", description: "Build summary", expectedOutput: "BUILD_SUMMARY\\|files\\|1\\|compiled\\|1\\|linked\\|1\\|warnings\\|0\\|errors\\|0\\|output\\|game", isPattern: true },
    ],
    hints: [
      "printMakefile has 6 cout lines. Each starts with \"BUILD|\". The recipe line includes a tab character as \\t in the string. The target line uses $(SRC) as the dependency.",
      "printCMake has 3 cout lines. cmake_minimum_required(VERSION 3.14) sets the minimum CMake version. project(SpaceShooter) names the project. add_executable(game src/main.cpp) creates the build target.",
      "simulateBuild prints COMPILE, LINK, and BUILD_SUMMARY. All values are static — this is a simulation, not an actual build. Files=1, compiled=1, linked=1, warnings=0, errors=0.",
    ],
    estimatedMinutes: 8,
  },
};
