import { Lesson } from "@/types/lesson";

export const lessonRPG96: Lesson = {
  id: "rpg-96-readme-quickstart",
  title: "README Quickstart",
  description: "Generate a README with project title, build command, run command, and feature list. Documentation is the first thing someone sees.",
  order: 96,
  xpReward: 100,
  tier: "pro",
  concepts: ["documentation", "README generation", "project presentation", "quickstart guide", "professional delivery"],
  part1: {
    title: "Concept: Documentation as First Impression",
    type: "concept",
    instructions: `# README Quickstart

## Mental Model

You've built a complete RPG: 95 lessons of combat, inventory, quests,
replay, accessibility, and tests. But someone cloning your repo sees
nothing. No instructions, no explanation, no build command. They close
the tab in 10 seconds. Fix: a structured README that answers three
questions in 30 seconds: What is this? How do I build it? What does it do?

## What Breaks Without This

Without a README:
- Nobody knows what your project does
- Nobody knows how to build or run it
- Contributors can't onboard without reading all source code
- Your 95 lessons of work are invisible

## The Fix

A printReadme function that outputs structured sections:

\`\`\`cpp
void printReadme(const char* title, const char* desc,
                 const char* build_cmd, const char* run_cmd,
                 const char** features, int feature_count) {
    cout << "# " << title << endl;
    cout << desc << endl;
    cout << "## Build" << endl;
    cout << build_cmd << endl;
}
\`\`\`

## Key Concepts

- **Title section**: # ProjectName
- **Build section**: exact command to compile
- **Run section**: exact command to execute
- **Feature list**: bullet points of what the project does

## Performance Insight

README generation is a one-time operation. Static text output. But
the README itself documents performance characteristics of your game.

## Memory Insight

All strings are const char* literals — no heap allocation. The README
generator is stack-only, just like the game it documents.

## Your Task

Write printReadme that prints a title and description. Call it once
and verify the output format.

## Beginner Trap

\`\`\`cpp
// BAD: No README at all
// "The code speaks for itself"
// Nobody reads your code without a reason to start.
\`\`\`

## Elite Insight

GitHub's data shows repos with a README get 10x more engagement.
The README is marketing for your code. Treat it like a product page.

## Systems Thinking Connection

The README references build commands (L96), test results (L92-L94),
and feature descriptions from every phase. It's the summary layer.

## Skill Reinforcement

- cout formatting from L01
- Const char* arrays from L78
- Loop iteration from L07

## Mastery Check

You pass when README_TEST shows the formatted title and description.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write printReadme(const char* title, const char* desc)
// Print "# " + title, then desc on next line

int main() {
    // TODO: printReadme("HeapSight RPG", "A turn-based ASCII dungeon crawler")
    // Print README_TEST|PASS
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void printReadme(const char* title, const char* desc) {
    cout << "# " << title << endl;
    cout << desc << endl;
}

int main() {
    printReadme("HeapSight RPG", "A turn-based ASCII dungeon crawler");
    cout << "README_TEST|PASS" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Title printed", expectedOutput: "# HeapSight RPG", isPattern: false },
      { id: "t2", description: "Description printed", expectedOutput: "A turn-based ASCII dungeon crawler", isPattern: false },
      { id: "t3", description: "Test passes", expectedOutput: "README_TEST|PASS", isPattern: false },
    ],
    hints: [
      "printReadme prints '# ' + title on one line, desc on the next.",
      "Use cout << '# ' << title << endl for the title line.",
      "Call printReadme with the exact strings given.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Full README Generator",
    type: "game_builder",
    instructions: `# Build: README Output Generator

## Mental Model

Part 1 proved title/description printing. Now build the full README
generator with title, description, build command, run command, and
a 5-item feature list. This is the documentation for your complete RPG.

## What Breaks Without This

Without a complete README:
- Users don't know the build command
- Features are undiscoverable
- The project looks incomplete or abandoned

## The Fix

printReadme takes title, desc, build_cmd, run_cmd, features[], count.
Prints each section with markdown headers.

## Key Concepts

- **Markdown formatting**: # for title, ## for sections, - for lists
- **const char** array**: feature list as string array
- **Feature count**: loop parameter prevents buffer overread
- **Structured output**: consistent format for all READMEs

## Performance Insight

One function call, 5 cout statements, one 5-iteration loop. Under
1 microsecond. The README itself is the performance documentation.

## Memory Insight

All strings are const char* literals in read-only memory. The
features array is stack-allocated. Zero heap allocation.

## Your Task

1. Write printReadme with 6 parameters
2. Print title (# prefix), description, build (## Build), run (## Run)
3. Print ## Features with "- " prefix for each feature
4. Print README|GENERATED

## Beginner Trap

\`\`\`cpp
// BAD: Hardcoding features in the function
cout << "- Combat" << endl; // Can't reuse for other projects!
// FIX: Pass features as parameter array
\`\`\`

## Elite Insight

Professional READMEs include badges, screenshots, and API docs.
Your structured output is the foundation — the format is correct,
the content is parameterized, the pattern is reusable.

## Mastery Check

You pass when the full README prints with all sections and
README|GENERATED confirms completion.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write printReadme(title, desc, build_cmd, run_cmd, features, feature_count)
// Print formatted README sections

int main() {
    const char* features[] = {"Deterministic combat", "Replay system", "Save/load", "Assist mode", "Data-driven content"};
    // TODO: Call printReadme with project data
    // TODO: Print README|GENERATED
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void printReadme(const char* title, const char* desc, const char* build_cmd, const char* run_cmd, const char** features, int feature_count) {
    cout << "# " << title << endl;
    cout << desc << endl;
    cout << "## Build" << endl;
    cout << build_cmd << endl;
    cout << "## Run" << endl;
    cout << run_cmd << endl;
    cout << "## Features" << endl;
    for (int i = 0; i < feature_count; i++) cout << "- " << features[i] << endl;
}

int main() {
    const char* features[] = {"Deterministic combat", "Replay system", "Save/load", "Assist mode", "Data-driven content"};
    printReadme("HeapSight RPG", "A turn-based ASCII dungeon crawler built in C++", "g++ -Wall -Wextra -Werror -o rpg src/main.cpp", "./rpg", features, 5);
    cout << "README|GENERATED" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Title printed", expectedOutput: "# HeapSight RPG", isPattern: false },
      { id: "g2", description: "Build section", expectedOutput: "## Build", isPattern: false },
      { id: "g3", description: "Feature listed", expectedOutput: "- Deterministic combat", isPattern: false },
      { id: "g4", description: "README generated", expectedOutput: "README|GENERATED", isPattern: false },
    ],
    hints: [
      "printReadme takes 6 parameters: title, desc, build_cmd, run_cmd, features array, and feature_count.",
      "Use cout << '# ' << title for the title. Section headers use '## '.",
      "Loop features with for(int i=0;i<feature_count;i++) and prepend '- ' to each.",
    ],
    estimatedMinutes: 8,
  },
};