import type { GameLessonVariant } from "@/types/game";

export const lesson07SpaceShooter: GameLessonVariant = {
  lessonId: "07-spawn-wave-loop",
  instructions: `# Manual Enemy Placement — Your Spawn System Doesn't Scale

You hardcode every enemy position. \\\`enemy_x[0]=60; enemy_x[1]=120; enemy_x[2]=180;\\\` — three enemies, three lines. Add ten more and you write ten more lines. Change the spacing and you rewrite everything. This is not a spawn system. This is data entry.

## What Breaks Without This

Every new wave means manual coordinate math. Miss one index and you get overlapping enemies or array gaps. Want different formations? Rewrite the entire block. Want difficulty scaling? Impossible — the formation is baked into the code, not driven by data.

## The Fix

A spawn function with parameters: count, startX, spacing, hp. One for loop computes position from the formula \\\`startX + i * spacing\\\`. Call it once for a patrol of 3. Call it again for a swarm of 10. Different parameters, same function, any formation.

This is data-driven design. The function is the engine. The parameters are the data. Swap the data, get different behavior. Every wave spawner in every shoot-em-up works this way. Space Invaders: one nested loop, 55 aliens.

The arrays are already declared globally — SoA layout from L6. The spawnWave function writes into them. Each call overwrites the arrays with new positions. After spawning, a separate render loop walks the arrays and outputs ENTITY lines. Spawn system and render system are separate passes over the same data.

## Your Task

1. Use \\\`spawnWave\\\` to initialize 5 enemies: startX=40, spacing=70, y=30, hp=25
2. Run 3 ticks of downward movement: each tick, every enemy moves y += 10
3. Render the player ship at (180, 220) with 100 hp
4. Render all 5 enemies at their final positions (y = 30 + 3*10 = 60)
5. Output HUD, GAME_MESSAGE, and SCORE

## Beginner Trap

**Common Mistake:** Rendering inside the tick loop instead of after it.
You get 15 ENTITY outputs instead of 5. The movement system updates state. The render system reads state. They are separate passes. Render once, after all ticks complete.

## Elite Insight

This is the batch initialization pattern. Every particle system, every bullet spawner, every wave controller uses parametric loops to create entities. The loop body is a factory function. The loop parameters are the production order. Change the order, change the output.

## Cross-Path Echo

The Platformer path uses the same loop pattern to spawn tile rows. The RPG path batch-creates inventory slots. Same parametric initialization, different entity types.`,
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
    { id: "g1", description: "Enemy0 should be at (40,60) after 3 ticks", expectedOutput: "ENTITY\\|e0\\|enemy\\|40\\|60\\|22\\|22\\|25", isPattern: true },
    { id: "g2", description: "Enemy4 should be at (320,60) after 3 ticks", expectedOutput: "ENTITY\\|e4\\|enemy\\|320\\|60\\|22\\|22\\|25", isPattern: true },
    { id: "g3", description: "Should render player ship", expectedOutput: "ENTITY\\|hero\\|player\\|180\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g4", description: "Should show HUD with stats", expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3", isPattern: true },
    { id: "g5", description: "Should show wave message", expectedOutput: "GAME_MESSAGE\\|Wave deployed and advancing!", isPattern: true },
  ],
  hints: [
    "Call `spawnWave(enemy_x, enemy_y, enemy_hp, waveSize, 40, 70, 25);` to initialize all 5 enemies.",
    "Movement: nested loops — outer `for (int tick = 0; tick < 3; tick++)`, inner `for (int i = 0; i < waveSize; i++)` with `enemy_y[i] += 10;`.",
    "Render AFTER all 3 ticks. Final y = 30 + 30 = 60. Use a for loop to output all 5 ENTITY lines.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 10;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];

// Spawn system: parametric wave initialization
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

    // Spawn system
    spawnWave(enemy_x, enemy_y, enemy_hp, waveSize, 40, 70, 25);

    // Movement system: 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < waveSize; i++) {
            enemy_y[i] += 10;
        }
    }

    // Render system
    cout << "ENTITY|hero|player|180|220|24|24|" << hp << endl;
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
};
