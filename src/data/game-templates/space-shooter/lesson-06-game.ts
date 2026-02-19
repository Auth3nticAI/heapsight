import type { GameLessonVariant } from "@/types/game";

export const lesson06SpaceShooter: GameLessonVariant = {
  lessonId: "06-soa-enemies",
  instructions: `# SoA Enemies — One Enemy Is Not a Game

You have one enemy. You can hit it, damage it, kill it. But one enemy is a tech demo, not a game. You need five. You need a wave. And the way you store those five enemies determines whether your game runs at 60fps or crawls.

## What Breaks Without This

Without arrays, you declare \`enemy1X\`, \`enemy2X\`, \`enemy3X\`, \`enemy4X\`, \`enemy5X\`. Fifteen separate variables for five enemies with three properties. You cannot loop over them. Every operation is copy-pasted five times. Add a sixth enemy and you duplicate everything again. This approach has zero scalability. By lesson 35 you need 500 enemies. Separate variables is a dead end.

## The Fix: Structure of Arrays

This is the most important data layout decision you will make. Separate arrays for each property:

\`\`\`cpp
int enemy_x[5] = {60, 120, 180, 240, 300};
int enemy_y[5] = {40, 40, 40, 40, 40};
int enemy_hp[5] = {30, 30, 30, 30, 30};
\`\`\`

Each array is contiguous in memory. All five X values sit side by side: 60, 120, 180, 240, 300 — 20 bytes in a row. When the movement system iterates X positions, the CPU loads one cache line and gets all five values. Zero waste. Zero cache misses.

The alternative — Array of Structs — interleaves data: x0, y0, hp0, x0, y1, hp1, x2, y2, hp2... When the movement system reads X positions, it loads x, y, hp for each enemy. Two-thirds of every cache line is data the movement system never touches. Wasted bandwidth.

For 5 enemies the difference is invisible. For 500 enemies it is the difference between 60fps and 30fps. For 5000 entities in a bullet hell, SoA is mandatory. You are learning the layout that scales.

## Why This Is the Foundation

This lesson introduces the pattern that recurs throughout the entire curriculum. Lesson 11 groups these arrays into a namespace. Lesson 33 optimizes layout with alignment. Lesson 35 stress-tests 500 entities to prove SoA scales. Every system you build from here forward — movement, collision, damage, rendering — operates on separate contiguous arrays. This is not a technique. It is the architecture.

## Performance Deep Dive

The CPU loads 64 bytes at a time — one cache line. Five ints = 20 bytes. All five X positions fit in a single cache line load. The prefetcher sees linear access and loads the next cache line before you ask for it. This is called spatial locality — data that is close in memory is accessed together.

AoS destroys spatial locality. The movement system touches X, skips Y and HP, touches next X, skips Y and HP. The prefetcher sees irregular strides and cannot predict. Every access is a potential cache miss. At scale, this is death by a thousand cuts.

## Memory Note

5 ints = 20 bytes. Three arrays = 60 bytes. All on the stack. The stack pointer bumps once. No heap allocation. No \`new\`. No \`delete\`. No memory leaks. This is the simplest, fastest memory layout possible. The entire enemy wave exists in 60 bytes of stack memory.

## Your Task

1. Player ship at (180, 300), hp=100, score=0, lives=3
2. Declare SoA arrays: \`enemy_x[5] = {60, 120, 180, 240, 300}\`, \`enemy_y[5]\` all 40, \`enemy_hp[5]\` all 30
3. Enemy size: 22x22, speed: 20 down per tick
4. Loop 3 ticks. Each tick: render HUD, ship, all 5 enemies. Then move all enemies down.
5. Enemies start at y=40. After tick 1 they are at y=60. After tick 2, y=80.

## Beginner Trap

**Common Mistake:** Declaring a struct with x, y, hp fields and making an array of structs: \`Enemy enemies[5];\`. This is AoS. It works. It is the intuitive approach. But when you iterate only X positions for movement, you load Y and HP data you do not need. SoA separates concerns at the data level. Each system touches only the arrays it needs.

## Elite Insight

Unity DOTS stores Position, Velocity, Health as separate NativeArrays — pure SoA. Unreal Mass does the same with FMassFragment arrays. EnTT, the most popular open-source ECS, stores each component type in its own contiguous pool. Every modern entity system uses SoA because the hardware demands it. The CPU prefetcher is your most important optimization partner, and it only works on contiguous data.

## Skill Reinforcement

Lesson 6 introduces arrays with SoA layout. Lesson 11 groups them. Lesson 33 optimizes data alignment. Lesson 35 stress-tests 500 entities to prove the pattern scales. The SoA architecture is the backbone of every system you build going forward.

## Cross-Path Echo

The Platformer path stores tile data in parallel arrays: \`tileX[]\`, \`tileY[]\`, \`tileType[]\`. The RPG path uses SoA for inventory slots: \`itemId[]\`, \`itemCount[]\`, \`itemRarity[]\`. Same cache-friendly pattern, different domain. The hardware does not care what your data represents — it cares that it is contiguous.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int hp = 100, score = 0, lives = 3;
    int shipX = 180, shipY = 300;

    const int NUM_ENEMIES = 5;
    int enemySpeed = 20;

    // TODO: Declare SoA arrays
    // enemy_x[5] = {60, 120, 180, 240, 300}
    // enemy_y[5] = all 40
    // enemy_hp[5] = all 30

    // TODO: Loop 3 ticks
    // Each tick:
    //   1. Print "=== TICK N ==="
    //   2. Print HUD line
    //   3. Print ship ENTITY
    //   4. Loop all 5 enemies, print ENTITY|enemy_i|enemy|x|y|22|22|hp
    //   5. Move all enemies: enemy_y[i] += enemySpeed

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
    { id: "g1", description: "Should render enemy_0 at y=40 in tick 1", expectedOutput: "ENTITY\\|enemy_0\\|enemy\\|60\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g2", description: "Should render enemy_4 at y=80 in tick 3", expectedOutput: "ENTITY\\|enemy_4\\|enemy\\|300\\|80\\|22\\|22\\|30", isPattern: true },
    { id: "g3", description: "Should render enemies at y=60 in tick 2", expectedOutput: "ENTITY\\|enemy_0\\|enemy\\|60\\|60\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Should render ship entity", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
    { id: "g5", description: "Should render HUD each tick", expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3", isPattern: true },
  ],
  hints: [
    "Declare three separate arrays: `int enemy_x[5] = {60, 120, 180, 240, 300};` and similar for y (all 40) and hp (all 30).",
    "Use nested loops: outer `for (int tick = 1; tick <= 3; tick++)`, inner `for (int i = 0; i < NUM_ENEMIES; i++)`.",
    "Separate the render loop from the movement loop. Render all enemies first, THEN move all enemies. This ensures consistent state within each frame.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int applyDamage(int currentHp, int damage) {
    int hp = currentHp - damage;
    if (hp < 0) hp = 0;
    return hp;
}

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
};
