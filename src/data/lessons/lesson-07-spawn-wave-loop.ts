import type { Lesson } from "@/types/lesson";

export const lesson07: Lesson = {
  id: "07-spawn-wave-loop",
  title: "Spawn Wave Loop",
  description: "Use for loops to batch-spawn enemy waves with configurable parameters.",
  order: 7,
  xpReward: 125,
  tier: "pro",
  concepts: ["loops", "for loop", "wave generation", "batch spawn", "parametric creation"],
  part1: {
    title: "Concept: Spawn Wave Loop",
    type: "concept",
    instructions: `# Spawn Wave Loop

A spawn system is a loop with parameters. Change the parameters, get a different formation. This is data-driven design: the data (wave config) drives the behavior.

## What Breaks Without Loops

Without loops, you manually initialize each enemy:
\`\`\`cpp
enemy_x[0] = 60;
enemy_x[1] = 120;
enemy_x[2] = 180;
enemy_x[3] = 240;
enemy_x[4] = 300;
\`\`\`
5 enemies = 5 lines. 50 enemies = 50 lines. Change the spacing and you rewrite every line. Doesn't scale.

## The Fix: Parametric Spawning

One loop, any size wave:
\`\`\`cpp
void spawnWave(int enemy_x[], int enemy_y[], int enemy_hp[],
               int count, int startX, int spacing, int hp) {
    for (int i = 0; i < count; i++) {
        enemy_x[i] = startX + i * spacing;
        enemy_y[i] = 40;
        enemy_hp[i] = hp;
    }
}
\`\`\`

The loop counter \\\`i\\\` computes position from the formula. \\\`startX + i * spacing\\\` is a linear distribution. Same math Space Invaders uses for its 55-alien grid.

## Performance

Loop unrolling: the compiler converts small loops to sequential instructions. A 5-iteration loop may become 5 inline assignments. Zero overhead for small counts. The loop counter is 1 int (4 bytes) on the stack. The arrays already exist. Initialization is write-only — cache-friendly sequential writes.

## Beginner Trap

Off-by-one errors. Using \\\`<=\\\` instead of \\\`<\\\` spawns one extra enemy past the array boundary. Starting at 1 instead of 0 skips the first slot. Arrays are zero-indexed. Loop bounds match array size. Always \\\`i = 0; i < count\\\`.

## Elite Insight

Space Invaders: 55 aliens in 5 rows of 11. One nested loop. Parameters: rows=5, cols=11, spacingX=30, spacingY=24. Your wave spawner is the same pattern scaled down. L6 created the arrays. L7 fills them with a loop. L38 makes this a full spawn system.

## Your Task

Write a \\\`spawnWave\\\` function that fills enemy arrays using a loop. Call it twice with different parameters to produce two different waves.

Wave 1: 5 enemies, startX=50, spacing=60, hp=30
Wave 2: 3 enemies, startX=100, spacing=80, hp=50

Output the ENTITY lines for each wave, then a total message.

Expected output:
\`\`\`
=== WAVE 1: spawning 5 enemies ===
ENTITY|e0|enemy|50|40|22|22|30
ENTITY|e1|enemy|110|40|22|22|30
ENTITY|e2|enemy|170|40|22|22|30
ENTITY|e3|enemy|230|40|22|22|30
ENTITY|e4|enemy|290|40|22|22|30
=== WAVE 2: spawning 3 enemies ===
ENTITY|e0|enemy|100|40|22|22|50
ENTITY|e1|enemy|180|40|22|22|50
ENTITY|e2|enemy|260|40|22|22|50
GAME_MESSAGE|Total spawned: 8 enemies across 2 waves
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 10;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];

// TODO: Write spawnWave function
// Parameters: arrays, count, startX, spacing, hp
// Use a for loop to fill enemy_x, enemy_y, enemy_hp

int main() {
    int totalSpawned = 0;

    // TODO: Wave 1 — 5 enemies, startX=50, spacing=60, hp=30
    // Print "=== WAVE 1: spawning 5 enemies ==="
    // Call spawnWave
    // Loop to print ENTITY lines for this wave
    // Add to totalSpawned

    // TODO: Wave 2 — 3 enemies, startX=100, spacing=80, hp=50
    // Print "=== WAVE 2: spawning 3 enemies ==="
    // Call spawnWave
    // Loop to print ENTITY lines for this wave
    // Add to totalSpawned

    // TODO: Print GAME_MESSAGE with total

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 10;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];

void spawnWave(int ex[], int ey[], int ehp[],
               int count, int startX, int spacing, int hp) {
    for (int i = 0; i < count; i++) {
        ex[i] = startX + i * spacing;
        ey[i] = 40;
        ehp[i] = hp;
    }
}

int main() {
    int totalSpawned = 0;

    // Wave 1
    int wave1Count = 5;
    cout << "=== WAVE 1: spawning " << wave1Count << " enemies ===" << endl;
    spawnWave(enemy_x, enemy_y, enemy_hp, wave1Count, 50, 60, 30);
    for (int i = 0; i < wave1Count; i++) {
        cout << "ENTITY|e" << i << "|enemy|"
             << enemy_x[i] << "|" << enemy_y[i]
             << "|22|22|" << enemy_hp[i] << endl;
    }
    totalSpawned += wave1Count;

    // Wave 2
    int wave2Count = 3;
    cout << "=== WAVE 2: spawning " << wave2Count << " enemies ===" << endl;
    spawnWave(enemy_x, enemy_y, enemy_hp, wave2Count, 100, 80, 50);
    for (int i = 0; i < wave2Count; i++) {
        cout << "ENTITY|e" << i << "|enemy|"
             << enemy_x[i] << "|" << enemy_y[i]
             << "|22|22|" << enemy_hp[i] << endl;
    }
    totalSpawned += wave2Count;

    cout << "GAME_MESSAGE|Total spawned: " << totalSpawned
         << " enemies across 2 waves" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Wave 1 should spawn 5 enemies starting at x=50",
        expectedOutput: "ENTITY\\|e4\\|enemy\\|290\\|40\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Wave 2 enemies should have 50 hp",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|100\\|40\\|22\\|22\\|50",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Should show total spawned message",
        expectedOutput: "GAME_MESSAGE\\|Total spawned: 8 enemies across 2 waves",
        isPattern: true,
      },
    ],
    hints: [
      "The spawnWave function uses a for loop: `for (int i = 0; i < count; i++)` to fill all three arrays.",
      "Position formula: `ex[i] = startX + i * spacing;` — this creates evenly-spaced enemies.",
      "After calling spawnWave, use another for loop to print the ENTITY lines for each enemy in the wave.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Wave Movement",
    type: "game_builder",
    instructions: `# Game Builder: Spawn and Move a Wave

Spawn a wave of 5 enemies, then simulate 3 ticks of downward movement. This combines spawning (loop-driven initialization) with the movement system (tick loop applying velocity).

## Systems Integration

Spawn system writes initial positions. Movement system reads and updates positions per tick. Render system reads final positions and outputs entities. Each system is a separate loop. Data flows through arrays.

## Your Task

1. Use \\\`spawnWave\\\` to spawn 5 enemies: startX=40, spacing=70, y=30, hp=25
2. Run 3 ticks of movement: each tick, every enemy moves down by 10 (y += 10)
3. After movement, render all 5 enemies at their final positions
4. Output the player ship, HUD, and score

After 3 ticks, y goes from 30 to 60 (30 + 3*10).

Expected output:
\`\`\`
ENTITY|hero|player|180|220|24|24|100
ENTITY|e0|enemy|40|60|22|22|25
ENTITY|e1|enemy|110|60|22|22|25
ENTITY|e2|enemy|180|60|22|22|25
ENTITY|e3|enemy|250|60|22|22|25
ENTITY|e4|enemy|320|60|22|22|25
HUD|HP:100|SCORE:0|LIVES:3
GAME_MESSAGE|Wave deployed and advancing!
SCORE|0
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 10;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];

void spawnWave(int ex[], int ey[], int ehp[],
               int count, int startX, int spacing, int hp) {
    for (int i = 0; i < count; i++) {
        ex[i] = startX + i * spacing;
        ey[i] = 30;
        ehp[i] = hp;
    }
}

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;
    int waveSize = 5;

    // TODO: Call spawnWave with startX=40, spacing=70, hp=25

    // TODO: Movement system — 3 ticks, each enemy moves y += 10

    // TODO: Render player ship
    // TODO: Render all enemies at final positions
    // TODO: Output HUD, GAME_MESSAGE, and SCORE

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 10;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];

void spawnWave(int ex[], int ey[], int ehp[],
               int count, int startX, int spacing, int hp) {
    for (int i = 0; i < count; i++) {
        ex[i] = startX + i * spacing;
        ey[i] = 30;
        ehp[i] = hp;
    }
}

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;
    int waveSize = 5;

    spawnWave(enemy_x, enemy_y, enemy_hp, waveSize, 40, 70, 25);

    // Movement system: 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < waveSize; i++) {
            enemy_y[i] += 10;
        }
    }

    // Render player
    cout << "ENTITY|hero|player|180|220|24|24|" << hp << endl;

    // Render enemies
    for (int i = 0; i < waveSize; i++) {
        cout << "ENTITY|e" << i << "|enemy|"
             << enemy_x[i] << "|" << enemy_y[i]
             << "|22|22|" << enemy_hp[i] << endl;
    }

    cout << "HUD|HP:" << hp << "|SCORE:" << score
         << "|LIVES:" << lives << endl;
    cout << "GAME_MESSAGE|Wave deployed and advancing!" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Enemy positions should reflect 3 ticks of movement (y=60)",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|40\\|60\\|22\\|22\\|25",
        isPattern: true,
      },
      {
        id: "g2",
        description: "All 5 enemies should be rendered",
        expectedOutput: "ENTITY\\|e4\\|enemy\\|320\\|60\\|22\\|22\\|25",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show HUD with player stats",
        expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Should show wave message",
        expectedOutput: "GAME_MESSAGE\\|Wave deployed and advancing!",
        isPattern: true,
      },
    ],
    hints: [
      "Call `spawnWave(enemy_x, enemy_y, enemy_hp, waveSize, 40, 70, 25);` to initialize positions.",
      "Movement uses nested loops: outer `for (int tick = 0; tick < 3; tick++)`, inner `for (int i = 0; i < waveSize; i++)`.",
      "Render AFTER all ticks complete. Final y = 30 + 3*10 = 60.",
    ],
    estimatedMinutes: 8,
  },
};
