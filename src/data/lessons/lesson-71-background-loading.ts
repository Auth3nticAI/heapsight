import type { Lesson } from "@/types/lesson";

export const lesson71: Lesson = {
  id: "71-background-loading",
  title: "Background Loading",
  description: "Simulate background asset loading with progress tracking.",
  order: 71,
  xpReward: 200,
  tier: "pro",
  concepts: ["async simulation", "loading states", "progress tracking", "state transitions"],
  part1: {
    title: "Concept: Background Loading",
    type: "concept",
    instructions: `# Background Loading — Stalled Main Thread Kills Frame Rate

Your game freezes for two seconds on startup. The player sees nothing. No progress bar. No feedback. Just a locked window and a spinning cursor. The OS thinks your app is dead. The fix is loading in chunks: process a piece each tick, report progress, and transition to gameplay when everything is ready.

## What Breaks Without This

Without chunked loading, you block the main thread. A single \\\`loadAll()\\\` call locks the process until every asset is parsed. The OS marks your window as unresponsive. Players alt-F4. Even if you survive the stall, you get zero feedback about what is loading or how long remains. Chunked loading keeps the thread alive and the player informed.

## The Fix

Model loading as a queue of tasks. Each task has a name and a cost in ticks. Each tick, advance the current task by one step. When a task completes, move to the next. Track overall progress as completed ticks over total ticks. When all tasks finish, transition state from LOADING to READY.

\\\`\\\`\\\`
struct LoadTask {
    string name;
    int totalTicks;
    int progress;  // ticks completed
};
\\\`\\\`\\\`

The loop is simple: while state == LOADING, process one tick of the current task. Print progress. When the task finishes, print completion. When all tasks finish, flip state.

## Your Task

1. Define 3 load tasks:
   - \\\`"textures"\\\` — 4 ticks
   - \\\`"sounds"\\\` — 3 ticks
   - \\\`"levels"\\\` — 5 ticks
2. Total ticks = 12. Process one tick per iteration
3. Each tick, print: \\\`LOADING|tick|<t>|task|<name>|progress|<pct>%\\\`
   - Progress = (completed ticks of this task * 100) / total ticks of this task
4. When a task completes, print: \\\`LOAD_COMPLETE|task|<name>|tick|<t>\\\`
5. After all tasks, print: \\\`ALL_LOADED|tick|12|tasks|3|total_ticks|12\\\`
6. Print: \\\`STATE|LOADING->READY\\\`

Expected output:
\\\`\\\`\\\`
LOADING|tick|1|task|textures|progress|25%
LOADING|tick|2|task|textures|progress|50%
LOADING|tick|3|task|textures|progress|75%
LOADING|tick|4|task|textures|progress|100%
LOAD_COMPLETE|task|textures|tick|4
LOADING|tick|5|task|sounds|progress|33%
LOADING|tick|6|task|sounds|progress|66%
LOADING|tick|7|task|sounds|progress|100%
LOAD_COMPLETE|task|sounds|tick|7
LOADING|tick|8|task|levels|progress|20%
LOADING|tick|9|task|levels|progress|40%
LOADING|tick|10|task|levels|progress|60%
LOADING|tick|11|task|levels|progress|80%
LOADING|tick|12|task|levels|progress|100%
LOAD_COMPLETE|task|levels|tick|12
ALL_LOADED|tick|12|tasks|3|total_ticks|12
STATE|LOADING->READY
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Computing progress as global ticks over global total. That gives overall progress, not per-task progress. Each task tracks its own completed/total ratio. The per-task percentage resets when you move to the next task.

## Elite Insight

Real engines stream assets across multiple frames with priority queues. Critical assets (player model, UI) load first. Background assets (distant terrain, ambient sounds) load later. The loading system is a scheduler, not a loop. Your chunked approach is the foundation of that scheduler.

## Cross-Path Echo

Package managers work identically. npm install processes packages one at a time, printing progress for each. When all packages resolve, the state transitions from "installing" to "ready." The loading screen is a package manager for game assets.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

int main() {
    // TODO: Define 3 load tasks: textures(4), sounds(3), levels(5)
    LoadTask tasks[3];

    // TODO: Initialize tasks

    int totalTicks = 12;
    int currentTick = 0;
    int currentTask = 0;
    string state = "LOADING";

    // TODO: Process loading loop
    //   While state is LOADING:
    //     Advance current tick
    //     Increment current task progress
    //     Calculate percentage: (task progress * 100) / task totalTicks
    //     Print LOADING line
    //     If task complete, print LOAD_COMPLETE and move to next task
    //     If all tasks done, print ALL_LOADED and change state

    // TODO: Print STATE transition

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

int main() {
    LoadTask tasks[3];
    tasks[0] = {"textures", 4, 0};
    tasks[1] = {"sounds", 3, 0};
    tasks[2] = {"levels", 5, 0};

    int totalTicks = 12;
    int currentTick = 0;
    int currentTask = 0;
    string state = "LOADING";

    while (state == "LOADING") {
        currentTick++;
        tasks[currentTask].progress++;

        int pct = (tasks[currentTask].progress * 100) / tasks[currentTask].totalTicks;

        cout << "LOADING|tick|" << currentTick
             << "|task|" << tasks[currentTask].name
             << "|progress|" << pct << "%" << endl;

        if (tasks[currentTask].progress >= tasks[currentTask].totalTicks) {
            cout << "LOAD_COMPLETE|task|" << tasks[currentTask].name
                 << "|tick|" << currentTick << endl;
            currentTask++;

            if (currentTask >= 3) {
                cout << "ALL_LOADED|tick|" << currentTick
                     << "|tasks|3|total_ticks|" << totalTicks << endl;
                state = "READY";
            }
        }
    }

    cout << "STATE|LOADING->READY" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First tick loads textures at 25%", expectedOutput: "LOADING\\|tick\\|1\\|task\\|textures\\|progress\\|25%", isPattern: true },
      { id: "t2", description: "Textures complete at tick 4", expectedOutput: "LOAD_COMPLETE\\|task\\|textures\\|tick\\|4", isPattern: true },
      { id: "t3", description: "Sounds start at tick 5", expectedOutput: "LOADING\\|tick\\|5\\|task\\|sounds\\|progress\\|33%", isPattern: true },
      { id: "t4", description: "Sounds complete at tick 7", expectedOutput: "LOAD_COMPLETE\\|task\\|sounds\\|tick\\|7", isPattern: true },
      { id: "t5", description: "Levels complete at tick 12", expectedOutput: "LOAD_COMPLETE\\|task\\|levels\\|tick\\|12", isPattern: true },
      { id: "t6", description: "All loaded summary", expectedOutput: "ALL_LOADED\\|tick\\|12\\|tasks\\|3\\|total_ticks\\|12", isPattern: true },
      { id: "t7", description: "State transition printed", expectedOutput: "STATE\\|LOADING->READY", isPattern: true },
    ],
    hints: [
      "Initialize tasks with aggregate initialization: tasks[0] = {\"textures\", 4, 0}. The progress field starts at 0 for each task.",
      "Percentage is per-task, not global. For sounds: progress 1 of 3 = 33%, progress 2 of 3 = 66%, progress 3 of 3 = 100%. Use integer division: (progress * 100) / totalTicks.",
      "Check task completion after printing the LOADING line. If progress equals totalTicks, print LOAD_COMPLETE and increment currentTask. If currentTask reaches 3, print ALL_LOADED and set state to READY.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Background Loading System",
    type: "game_builder",
    instructions: `# Game Builder: Background Loading — Assets Before Action

Your space shooter needs wave data, enemy definitions, and sprite maps before the first frame renders. Load them wrong and the game crashes on null data. Load them with a blocking call and the window freezes. The solution: chunked loading with per-task progress, processed one tick at a time, with a clean state transition from LOADING to READY.

## What Breaks Without This

Without chunked loading, the game stalls on startup. The player sees a frozen window. The OS threatens to kill the process. Even if you survive, there is no feedback. The player does not know if the game is loading or crashed. Chunked loading with progress tracking solves both problems: the thread stays alive and the player sees progress.

## The Fix

Define load tasks with names and tick costs. Process one tick per iteration. Track per-task progress. Print status each tick. When a task finishes, announce it. When all tasks finish, transition state. The game loop does not start until state equals READY.

\\\`\\\`\\\`
while (state == LOADING) {
    processTick();
    reportProgress();
    if (taskDone()) nextTask();
    if (allDone()) state = READY;
}
\\\`\\\`\\\`

## Your Task

1. Define 3 load tasks for the space shooter:
   - \\\`"wave_data"\\\` — 3 ticks
   - \\\`"enemy_defs"\\\` — 2 ticks
   - \\\`"sprites"\\\` — 4 ticks
2. Total ticks = 9. Process one tick per iteration
3. Each tick, print: \\\`LOADING|tick|<t>|task|<name>|progress|<pct>%\\\`
   - Percentage = (task progress * 100) / task totalTicks
4. When a task completes: \\\`LOAD_COMPLETE|task|<name>|tick|<t>\\\`
5. After all tasks: \\\`ALL_LOADED|tick|9|tasks|3|total_ticks|9\\\`
6. Print: \\\`STATE|LOADING->READY\\\`

Expected key output lines:
\\\`\\\`\\\`
LOADING|tick|1|task|wave_data|progress|33%
LOAD_COMPLETE|task|wave_data|tick|3
LOADING|tick|4|task|enemy_defs|progress|50%
LOAD_COMPLETE|task|enemy_defs|tick|5
LOADING|tick|6|task|sprites|progress|25%
LOADING|tick|9|task|sprites|progress|100%
LOAD_COMPLETE|task|sprites|tick|9
ALL_LOADED|tick|9|tasks|3|total_ticks|9
STATE|LOADING->READY
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using global tick count for per-task percentage. Tick 5 does not mean 55% of a 9-tick load. It means enemy_defs is at 100% (2/2) while the global is at 55%. Always compute percentage from the task's own progress and totalTicks.

## Elite Insight

AAA engines load assets with dependency graphs. Sprite maps depend on texture data. Enemy definitions depend on sprite maps. The load scheduler resolves dependencies and loads in topological order. Your sequential approach is a degenerate case of dependency-ordered loading where each task depends on the previous one.

## Cross-Path Echo

Docker image layers load the same way. Each layer is a task with a size. Progress tracks bytes downloaded per layer. When all layers complete, the container transitions from "pulling" to "ready." Your loading system is a container image pull for game assets.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

int main() {
    // TODO: Define 3 load tasks: wave_data(3), enemy_defs(2), sprites(4)
    LoadTask tasks[3];

    // TODO: Initialize tasks

    int totalTicks = 9;
    int currentTick = 0;
    int currentTask = 0;
    string state = "LOADING";

    // TODO: Process loading loop
    //   While state is LOADING:
    //     Advance tick, increment task progress
    //     Calculate per-task percentage
    //     Print LOADING line
    //     If task done: print LOAD_COMPLETE, advance to next task
    //     If all done: print ALL_LOADED, set state to READY

    // TODO: Print STATE transition

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

int main() {
    LoadTask tasks[3];
    tasks[0] = {"wave_data", 3, 0};
    tasks[1] = {"enemy_defs", 2, 0};
    tasks[2] = {"sprites", 4, 0};

    int totalTicks = 9;
    int currentTick = 0;
    int currentTask = 0;
    string state = "LOADING";

    while (state == "LOADING") {
        currentTick++;
        tasks[currentTask].progress++;

        int pct = (tasks[currentTask].progress * 100) / tasks[currentTask].totalTicks;

        cout << "LOADING|tick|" << currentTick
             << "|task|" << tasks[currentTask].name
             << "|progress|" << pct << "%" << endl;

        if (tasks[currentTask].progress >= tasks[currentTask].totalTicks) {
            cout << "LOAD_COMPLETE|task|" << tasks[currentTask].name
                 << "|tick|" << currentTick << endl;
            currentTask++;

            if (currentTask >= 3) {
                cout << "ALL_LOADED|tick|" << currentTick
                     << "|tasks|3|total_ticks|" << totalTicks << endl;
                state = "READY";
            }
        }
    }

    cout << "STATE|LOADING->READY" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First tick loads wave_data at 33%", expectedOutput: "LOADING\\|tick\\|1\\|task\\|wave_data\\|progress\\|33%", isPattern: true },
      { id: "t2", description: "wave_data completes at tick 3", expectedOutput: "LOAD_COMPLETE\\|task\\|wave_data\\|tick\\|3", isPattern: true },
      { id: "t3", description: "enemy_defs starts at tick 4", expectedOutput: "LOADING\\|tick\\|4\\|task\\|enemy_defs\\|progress\\|50%", isPattern: true },
      { id: "t4", description: "enemy_defs completes at tick 5", expectedOutput: "LOAD_COMPLETE\\|task\\|enemy_defs\\|tick\\|5", isPattern: true },
      { id: "t5", description: "sprites loads at tick 6", expectedOutput: "LOADING\\|tick\\|6\\|task\\|sprites\\|progress\\|25%", isPattern: true },
      { id: "t6", description: "All loaded summary", expectedOutput: "ALL_LOADED\\|tick\\|9\\|tasks\\|3\\|total_ticks\\|9", isPattern: true },
      { id: "t7", description: "State transition printed", expectedOutput: "STATE\\|LOADING->READY", isPattern: true },
    ],
    hints: [
      "Initialize tasks: tasks[0] = {\"wave_data\", 3, 0}. Each task starts with progress 0. The totalTicks field defines how many ticks this task needs.",
      "Per-task percentage: (tasks[currentTask].progress * 100) / tasks[currentTask].totalTicks. For wave_data tick 1: (1*100)/3 = 33. Integer division is intentional.",
      "After printing LOAD_COMPLETE, increment currentTask. If currentTask reaches 3, all tasks are done. Print ALL_LOADED with the final tick count, then set state to READY.",
    ],
    estimatedMinutes: 8,
  },
};
