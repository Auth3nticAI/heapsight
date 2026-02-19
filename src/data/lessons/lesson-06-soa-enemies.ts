import type { Lesson } from "@/types/lesson";

export const lesson06: Lesson = {
  id: "06-soa-enemies",
  title: "SoA Enemies",
  description: "Store enemy data in separate arrays for cache-friendly batch processing.",
  order: 6,
  xpReward: 125,
  tier: "pro",
  concepts: ["arrays", "Structure of Arrays", "data layout", "cache locality"],
  part1: {
    title: "Concept: Structure of Arrays",
    type: "concept",
    instructions: `# SoA Enemies

Data layout determines performance. How you arrange your data in memory determines how fast the CPU can process it. This is the single most important concept in engine programming.

## Arrays

An array stores multiple values of the same type in contiguous memory:

\`\`\`cpp
int enemy_x[5] = {60, 120, 180, 240, 300};
int enemy_y[5] = {40, 40, 40, 40, 40};
int enemy_hp[5] = {30, 30, 30, 30, 30};
\`\`\`

Access by index: \`enemy_x[0]\` is 60. \`enemy_x[4]\` is 300. Zero-based. Going past the end is undefined behavior — instant crash or silent corruption.

## What Breaks Without This

Without arrays, you need separate variables: \`enemy1X\`, \`enemy2X\`, \`enemy3X\`, \`enemy4X\`, \`enemy5X\`. That is 15 variables for 5 enemies with 3 properties each. You cannot loop over separate variables. You cannot scale. Adding a sixth enemy means declaring three more variables and duplicating every line of logic.

## The Fix: Structure of Arrays

Separate arrays for each property. One array for X positions. One for Y. One for HP. Each array is contiguous in memory — all 5 X values sit side by side.

Why this matters: the CPU loads 64 bytes at a time (one cache line). Five ints = 20 bytes. All five X positions fit in one cache line load. When the movement system processes X positions, it gets all five in one memory fetch. Zero waste.

## The Alternative: Array of Structs (AoS)

\`\`\`cpp
struct Enemy { int x, y, hp; };
Enemy enemies[5]; // x,y,hp,x,y,hp,x,y,hp...
\`\`\`

This interleaves the data. When the movement system reads X positions, it loads x, y, hp, x, y, hp — wasting cache space on Y and HP values it does not need. For 5 enemies the difference is negligible. For 500 enemies it is the difference between 60fps and 30fps.

## Performance Note

SoA movement loop touches only \`enemy_x\` and \`enemy_y\`. 40 bytes for 5 enemies. Fits in one cache line. AoS movement loop loads the entire struct for each enemy — wasting bandwidth on HP data the movement system never reads. The CPU prefetcher predicts linear array access perfectly. It cannot predict pointer-chasing through scattered objects.

## Memory Note

5 ints = 20 bytes. Three arrays of 5 = 60 bytes total. All on the stack. Zero heap allocation. The stack pointer bumps once and all your enemy data exists. This is the cheapest memory layout possible.

## Beginner Trap

Using a struct with all properties bundled together: \`struct Enemy { int x, y, hp; }; Enemy enemies[5];\`. This is AoS. It works. It is intuitive. But when you process only X positions, you load everything. SoA separates concerns at the data level.

## Elite Insight

Unity DOTS uses SoA. Unreal Mass uses SoA. EnTT uses SoA. Every modern ECS stores components in separate contiguous arrays. You are learning the data layout that powers every engine built after 2015. Lesson 11 groups these arrays. Lesson 33 optimizes layout further. Lesson 35 stress-tests 500 entities. The SoA pattern is the backbone of the entire curriculum.

## Your Task

1. Declare \`const int NUM_ENEMIES = 5;\`
2. Create three arrays: \`enemy_x[5]\`, \`enemy_y[5]\`, \`enemy_hp[5]\`
3. Initialize: x positions spaced 60 apart starting at 60. All y = 40. All hp = 30.
4. Loop through all enemies and print ENTITY lines
5. Print a wave spawn message

Expected output:
\`\`\`
=== WAVE 1: 5 ENEMIES ===
ENTITY|enemy_0|enemy|60|40|22|22|30
ENTITY|enemy_1|enemy|120|40|22|22|30
ENTITY|enemy_2|enemy|180|40|22|22|30
ENTITY|enemy_3|enemy|240|40|22|22|30
ENTITY|enemy_4|enemy|300|40|22|22|30
GAME_MESSAGE|Wave spawned: 5 enemies across 60-300
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    const int NUM_ENEMIES = 5;

    // TODO: Declare enemy_x[5], enemy_y[5], enemy_hp[5]
    // x positions: 60, 120, 180, 240, 300
    // y positions: all 40
    // hp: all 30

    cout << "=== WAVE 1: " << NUM_ENEMIES << " ENEMIES ===" << endl;

    // TODO: Loop i = 0 to NUM_ENEMIES - 1
    // Print: ENTITY|enemy_i|enemy|x|y|22|22|hp

    // TODO: Print GAME_MESSAGE with enemy count and x range

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    const int NUM_ENEMIES = 5;

    int enemy_x[5] = {60, 120, 180, 240, 300};
    int enemy_y[5] = {40, 40, 40, 40, 40};
    int enemy_hp[5] = {30, 30, 30, 30, 30};

    cout << "=== WAVE 1: " << NUM_ENEMIES << " ENEMIES ===" << endl;

    for (int i = 0; i < NUM_ENEMIES; i++) {
        cout << "ENTITY|enemy_" << i << "|enemy|"
             << enemy_x[i] << "|" << enemy_y[i] << "|22|22|"
             << enemy_hp[i] << endl;
    }

    cout << "GAME_MESSAGE|Wave spawned: " << NUM_ENEMIES
         << " enemies across " << enemy_x[0] << "-" << enemy_x[NUM_ENEMIES - 1] << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should render enemy_0 at x=60",
        expectedOutput: "ENTITY\\|enemy_0\\|enemy\\|60\\|40\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Should render enemy_4 at x=300",
        expectedOutput: "ENTITY\\|enemy_4\\|enemy\\|300\\|40\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Should show wave spawn message with 5 enemies",
        expectedOutput: "Wave spawned: 5 enemies across 60-300",
        isPattern: true,
      },
    ],
    hints: [
      "Initialize arrays with brace syntax: `int enemy_x[5] = {60, 120, 180, 240, 300};`",
      "Loop with `for (int i = 0; i < NUM_ENEMIES; i++)` and access `enemy_x[i]`, `enemy_y[i]`, `enemy_hp[i]`.",
      "Build the entity ID in the output: `\"enemy_\" << i` concatenates the prefix with the index number.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Enemy Wave Movement",
    type: "game_builder",
    instructions: `# Game Builder: Moving Enemy Wave

Spawn 5 enemies in SoA layout. Simulate 3 ticks of downward movement. Every enemy moves every tick. The player ship sits at the bottom. HUD renders each frame.

This is your first batch processing system. One loop moves all enemies. One loop renders all enemies. The SoA layout means each loop touches only the data it needs.

## Your Task

1. Player ship at (180, 300) with hp=100, score=0, lives=3
2. Five enemies in SoA: x = {60, 120, 180, 240, 300}, y = all 40, hp = all 30
3. Enemy size: 22x22. Enemy speed: 20 down per tick
4. Loop 3 ticks. Each tick:
   - Print tick header
   - Print HUD
   - Print ship entity
   - Loop all 5 enemies, print each ENTITY line
   - Move all enemies down: \`enemy_y[i] += 20\`

Expected output (abbreviated — all 5 enemies each tick):
\`\`\`
=== TICK 1 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|enemy_0|enemy|60|40|22|22|30
ENTITY|enemy_1|enemy|120|40|22|22|30
ENTITY|enemy_2|enemy|180|40|22|22|30
ENTITY|enemy_3|enemy|240|40|22|22|30
ENTITY|enemy_4|enemy|300|40|22|22|30
=== TICK 2 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|enemy_0|enemy|60|60|22|22|30
ENTITY|enemy_1|enemy|120|60|22|22|30
ENTITY|enemy_2|enemy|180|60|22|22|30
ENTITY|enemy_3|enemy|240|60|22|22|30
ENTITY|enemy_4|enemy|300|60|22|22|30
=== TICK 3 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
ENTITY|enemy_0|enemy|60|80|22|22|30
ENTITY|enemy_1|enemy|120|80|22|22|30
ENTITY|enemy_2|enemy|180|80|22|22|30
ENTITY|enemy_3|enemy|240|80|22|22|30
ENTITY|enemy_4|enemy|300|80|22|22|30
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;

    const int NUM_ENEMIES = 5;
    int enemySpeed = 20;

    // TODO: Declare enemy SoA arrays
    // enemy_x[5] = {60, 120, 180, 240, 300}
    // enemy_y[5] = {40, 40, 40, 40, 40}
    // enemy_hp[5] = {30, 30, 30, 30, 30}

    // TODO: Loop 3 ticks
    // Each tick:
    //   1. Print tick header
    //   2. Print HUD
    //   3. Print ship entity
    //   4. Loop all enemies, print ENTITY line for each
    //   5. Move all enemies down: enemy_y[i] += enemySpeed

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;

    const int NUM_ENEMIES = 5;
    int enemySpeed = 20;

    int enemy_x[5] = {60, 120, 180, 240, 300};
    int enemy_y[5] = {40, 40, 40, 40, 40};
    int enemy_hp[5] = {30, 30, 30, 30, 30};

    for (int tick = 1; tick <= 3; tick++) {
        cout << "=== TICK " << tick << " ===" << endl;
        cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;

        for (int i = 0; i < NUM_ENEMIES; i++) {
            cout << "ENTITY|enemy_" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i] << "|22|22|"
                 << enemy_hp[i] << endl;
        }

        for (int i = 0; i < NUM_ENEMIES; i++) {
            enemy_y[i] += enemySpeed;
        }
    }

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should render enemy_0 at y=40 in tick 1",
        expectedOutput: "ENTITY\\|enemy_0\\|enemy\\|60\\|40\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should render enemy_4 at y=80 in tick 3",
        expectedOutput: "ENTITY\\|enemy_4\\|enemy\\|300\\|80\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should render all 5 enemies in tick 2",
        expectedOutput: "ENTITY\\|enemy_0\\|enemy\\|60\\|60",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Should render ship each tick",
        expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100",
        isPattern: true,
      },
    ],
    hints: [
      "Initialize arrays: `int enemy_x[5] = {60, 120, 180, 240, 300};` and similar for y and hp.",
      "Use a nested loop structure: outer loop for ticks, inner loop for enemies.",
      "Move enemies in a SEPARATE inner loop after rendering: `for (int i = 0; i < NUM_ENEMIES; i++) enemy_y[i] += enemySpeed;`",
    ],
    estimatedMinutes: 8,
  },
};
