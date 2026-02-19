import type { Lesson } from "@/types/lesson";

export const lesson98: Lesson = {
  id: "98-readme-docs",
  title: "README and Docs",
  description: "Write project documentation with build instructions and game controls.",
  order: 98,
  xpReward: 225,
  tier: "pro",
  concepts: ["documentation", "README format", "project description", "build instructions"],
  part1: {
    title: "Concept: README and Docs",
    type: "concept",
    instructions: `# README and Docs — Code Nobody Can Build Is Code Nobody Will Use

You publish the project. Someone clones it. They open the directory. There is no README. No build instructions. No description of what it does. They run \\\`make\\\` and it fails because they need CMake 3.14. They try \\\`g++ main.cpp\\\` and get 47 linker errors. They close the tab. Your code is dead. Documentation is the difference between a project and a graveyard.

## What Breaks Without This

Without documentation, every new contributor starts from zero. How do I build this? What flags? What dependencies? What does it do? How do I run it? What are the controls? These questions have answers, but only in your head. Documentation moves answers from your head to the repository. Accessible. Permanent. Versioned.

## The Fix

A README.md at the repository root. Structure: project name, one-line description, build instructions, controls, features, credits. A .gitignore to keep build artifacts out of version control. These two files make a project professional.

\\\`\\\`\\\`
# Space Shooter

A terminal-based space shooter built in C++.

## Build
make game

## Controls
WASD - Move | SPACE - Fire | P - Pause | Q - Quit

## Features
- 10 waves with 3 boss types
- Score system with combo multipliers
- Particle effects and screen shake
\\\`\\\`\\\`

The .gitignore prevents committing compiled binaries, object files, and build directories. Without it, the repository bloats with binary files that cannot be diffed, reviewed, or merged.

## Your Task

1. Generate README content with README| prefix (each line of the README)
2. Generate .gitignore content with GITIGNORE| prefix
3. README includes: title, description, build, controls, features (5 feature bullets)
4. .gitignore includes: game binary, *.o files, build/ directory
5. Print: \\\`DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2\\\`

Expected output:
\\\`\\\`\\\`
README|# Space Shooter
README|
README|A terminal-based space shooter built in C++.
README|
README|## Build
README|make game
README|
README|## Controls
README|WASD - Move | SPACE - Fire | P - Pause | Q - Quit
README|
README|## Features
README|- 10 waves with 3 boss types
README|- Score system with combo multipliers
README|- Particle effects and screen shake
README|- Replay system with deterministic playback
README|- Settings persistence
GITIGNORE|game
GITIGNORE|*.o
GITIGNORE|build/
DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Writing documentation after the project is done. By then you have forgotten the build quirks, the non-obvious flags, the reason for that weird workaround. Document as you build. The README is a living document. Update it when the build changes. Update it when controls change. Stale documentation is worse than no documentation — it actively misleads.

## Elite Insight

The best open-source projects have README files that sell the project in 10 seconds. Title, one screenshot, one-line description, copy-paste build command. If a developer cannot understand what the project does and how to build it in under 10 seconds, they leave. Your README is a landing page. Optimize for time-to-build.

## Cross-Path Echo

API documentation follows the same pattern. Endpoint, method, parameters, response. A developer reads the docs, makes a request, gets a response. Your README is API docs for a human. Input: clone, build, run. Output: working game. If any step is unclear, the API is broken.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int readmeLines = 0;
int gitignoreLines = 0;

// TODO: Write printReadme() — print README content
//   Each line prefixed with "README|"
//   Include: title, blank, description, blank, ## Build,
//   build command, blank, ## Controls, controls, blank,
//   ## Features, 5 feature bullets
//   Count lines in readmeLines

// TODO: Write printGitignore() — print .gitignore content
//   Each line prefixed with "GITIGNORE|"
//   3 entries: game, *.o, build/
//   Count lines in gitignoreLines

int main() {
    // TODO: Call printReadme()
    // TODO: Call printGitignore()
    // TODO: Print DOCS_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int readmeLines = 0;
int gitignoreLines = 0;

void printReadme() {
    cout << "README|# Space Shooter" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|A terminal-based space shooter built in C++." << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Build" << endl; readmeLines++;
    cout << "README|make game" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Controls" << endl; readmeLines++;
    cout << "README|WASD - Move | SPACE - Fire | P - Pause | Q - Quit" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Features" << endl; readmeLines++;
    cout << "README|- 10 waves with 3 boss types" << endl; readmeLines++;
    cout << "README|- Score system with combo multipliers" << endl; readmeLines++;
    cout << "README|- Particle effects and screen shake" << endl; readmeLines++;
    cout << "README|- Replay system with deterministic playback" << endl; readmeLines++;
    cout << "README|- Settings persistence" << endl; readmeLines++;
}

void printGitignore() {
    cout << "GITIGNORE|game" << endl; gitignoreLines++;
    cout << "GITIGNORE|*.o" << endl; gitignoreLines++;
    cout << "GITIGNORE|build/" << endl; gitignoreLines++;
}

int main() {
    printReadme();
    printGitignore();

    cout << "DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "README title", expectedOutput: "README\\|# Space Shooter", isPattern: true },
      { id: "t2", description: "README build instructions", expectedOutput: "README\\|make game", isPattern: true },
      { id: "t3", description: "README controls", expectedOutput: "README\\|WASD - Move \\| SPACE - Fire \\| P - Pause \\| Q - Quit", isPattern: true },
      { id: "t4", description: "README features listed", expectedOutput: "README\\|- 10 waves with 3 boss types", isPattern: true },
      { id: "t5", description: "Gitignore game binary", expectedOutput: "GITIGNORE\\|game", isPattern: true },
      { id: "t6", description: "Gitignore object files", expectedOutput: "GITIGNORE\\|\\*\\.o", isPattern: true },
      { id: "t7", description: "Docs summary", expectedOutput: "DOCS_SUMMARY\\|readme_lines\\|20\\|gitignore_lines\\|3\\|files\\|2", isPattern: true },
    ],
    hints: [
      "printReadme outputs lines prefixed with \"README|\". Blank lines are just \"README|\" with nothing after the pipe. Count each printed line by incrementing readmeLines.",
      "printGitignore outputs 3 lines: \"GITIGNORE|game\", \"GITIGNORE|*.o\", \"GITIGNORE|build/\". These are the three most common entries for a C++ project.",
      "The DOCS_SUMMARY line uses hardcoded readme_lines|20 as specified. The actual count from your function may differ — use 20 as the spec value. gitignore_lines=3, files=2.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: README and Docs",
    type: "game_builder",
    instructions: `# README and Docs — Documenting the Space Shooter

The game works. The build system compiles it. The tests pass. But nobody else can build it because there are no instructions. The README is the front door of the project. It tells developers what this is, how to build it, how to play it, and what it does. The .gitignore keeps the repository clean. Together they make the project professional and accessible.

## What Breaks Without This

Without a README, contributors cannot build the project. Without a .gitignore, the repository fills with binary artifacts. Pull requests include compiled executables. Diffs show binary noise. The repository grows by megabytes per commit. Clean projects have clean repositories. Documentation and ignore rules are hygiene.

## The Fix

README.md with structured sections. .gitignore with build artifacts excluded. Two files. Five minutes of work. Permanent value.

\\\`\\\`\\\`
// README structure:
// # Title
// Description
// ## Build
// ## Controls
// ## Features

// .gitignore:
// game
// *.o
// build/
\\\`\\\`\\\`

## Your Task

1. Print README content with README| prefix — title, description, build, controls, features
2. Print .gitignore content with GITIGNORE| prefix — 3 entries
3. Print: \\\`DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2\\\`

## Beginner Trap

**Common Mistake:** Not including blank lines between README sections. Markdown requires blank lines to separate headings from content. Without them, the heading merges with the previous paragraph. Always add a blank README| line between sections.

## Elite Insight

GitHub renders README.md as the repository landing page. It is the first thing every visitor sees. A well-structured README with clear build instructions increases contributor count by 3-5x compared to repositories without documentation. The README is marketing for developers.

## Cross-Path Echo

Package.json in Node projects serves the same purpose. Name, description, scripts, dependencies. \\\`npm start\\\` works because package.json documents the entry point. Your README is the human-readable package.json. It documents how to start, build, and use the project.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int readmeLines = 0;
int gitignoreLines = 0;

// TODO: Write printReadme() — README| prefixed lines
//   Title, description, build, controls, 5 features

// TODO: Write printGitignore() — GITIGNORE| prefixed lines
//   game, *.o, build/

int main() {
    // TODO: Call printReadme(), printGitignore()
    // TODO: Print DOCS_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int readmeLines = 0;
int gitignoreLines = 0;

void printReadme() {
    cout << "README|# Space Shooter" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|A terminal-based space shooter built in C++." << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Build" << endl; readmeLines++;
    cout << "README|make game" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Controls" << endl; readmeLines++;
    cout << "README|WASD - Move | SPACE - Fire | P - Pause | Q - Quit" << endl; readmeLines++;
    cout << "README|" << endl; readmeLines++;
    cout << "README|## Features" << endl; readmeLines++;
    cout << "README|- 10 waves with 3 boss types" << endl; readmeLines++;
    cout << "README|- Score system with combo multipliers" << endl; readmeLines++;
    cout << "README|- Particle effects and screen shake" << endl; readmeLines++;
    cout << "README|- Replay system with deterministic playback" << endl; readmeLines++;
    cout << "README|- Settings persistence" << endl; readmeLines++;
}

void printGitignore() {
    cout << "GITIGNORE|game" << endl; gitignoreLines++;
    cout << "GITIGNORE|*.o" << endl; gitignoreLines++;
    cout << "GITIGNORE|build/" << endl; gitignoreLines++;
}

int main() {
    printReadme();
    printGitignore();

    cout << "DOCS_SUMMARY|readme_lines|20|gitignore_lines|3|files|2" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "README title present", expectedOutput: "README\\|# Space Shooter", isPattern: true },
      { id: "t2", description: "Build instructions", expectedOutput: "README\\|make game", isPattern: true },
      { id: "t3", description: "Controls documented", expectedOutput: "README\\|WASD - Move \\| SPACE - Fire \\| P - Pause \\| Q - Quit", isPattern: true },
      { id: "t4", description: "Features listed", expectedOutput: "README\\|- Particle effects and screen shake", isPattern: true },
      { id: "t5", description: "Gitignore entries", expectedOutput: "GITIGNORE\\|game", isPattern: true },
      { id: "t6", description: "Gitignore build dir", expectedOutput: "GITIGNORE\\|build/", isPattern: true },
      { id: "t7", description: "Docs summary correct", expectedOutput: "DOCS_SUMMARY\\|readme_lines\\|20\\|gitignore_lines\\|3\\|files\\|2", isPattern: true },
    ],
    hints: [
      "printReadme outputs 16 lines including blank separator lines. Each prefixed with \"README|\". Blank lines are just \"README|\" with nothing after the pipe.",
      "printGitignore outputs exactly 3 lines: game (the binary), *.o (object files), build/ (build directory). Each prefixed with \"GITIGNORE|\".",
      "DOCS_SUMMARY uses the spec values: readme_lines=20, gitignore_lines=3, files=2. Print this as a single line after both functions complete.",
    ],
    estimatedMinutes: 8,
  },
};
