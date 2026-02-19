import type { GameLessonVariant } from "@/types/game";

export const lesson08SpaceShooter: GameLessonVariant = {
  lessonId: "08-combat-rules",
  instructions: `# Dead Enemies Still on Screen — No Entity Lifecycle

Your damage system subtracts hp. The render system draws everything. Dead enemies with zero health still appear. Bullets still collide with corpses. Scores double-count kills. The game is lying about its own state because there is no lifecycle management.

## What Breaks Without This

Every entity is immortal. You hit an enemy, the damage applies, the hp drops to zero or negative, but the entity stays visible and interactive. The player sees an enemy they already killed. Shoots it again. Gets more points. The simulation has no concept of death. This is not a minor rendering bug — it is a fundamental architecture failure.

## The Fix

Add a \\\`bool enemy_alive[]\\\` array. This is the lifecycle flag. Every system reads it before processing:

- **Spawn system**: sets alive = true
- **Movement system**: only moves alive entities
- **Collision system**: only tests alive entities
- **Death system**: sets alive = false when hp <= 0
- **Render system**: only draws alive entities

This is the same pattern every ECS engine uses. Unity DOTS checks entity existence. EnTT moves destroyed entities to a tombstone archetype. Unreal marks actors PendingKill. The mechanism varies. The concept is universal: dead entities must be excluded from all processing.

The alive flag turns your flat array into a filtered view. The render loop becomes a query: "give me all entities where alive == true." This is a degenerate archetype query — the beginner version of what production engines do with bitmasks and sparse sets.

## Your Task

1. Spawn 5 enemies using spawnWave: startX=50, spacing=60, y=40, hp=30. Set all alive flags to true.
2. Place a bullet at x=170, y=200 moving up at speed 50 per tick.
3. Run 3 ticks: enemies move down by 8 per tick, bullet moves up by 50 per tick.
4. After movement: collision check. If \\\`bulletX == enemy_x[i]\\\` and \\\`bulletY <= enemy_y[i]\\\` and enemy is alive — it is a hit.
5. On hit: set alive=false, hp=0, score += 100.
6. Render only alive entities. Count survivors.
7. Output ship, survivors, HUD, GAME_MESSAGE, and SCORE.

After 3 ticks: enemies at y=64, bullet at y=50. Enemy 2 is at x=170 (50+2*60). Bullet x=170, y=50 <= 64. Hit. Enemy 2 dies. 4 survive.

## Beginner Trap

**Common Mistake:** Checking \\\`enemy_hp[i] >= 0\\\` instead of \\\`enemy_hp[i] > 0\\\` in the render loop.
An entity at exactly 0 hp is dead. Rendering it means the player hit it, sees no effect, and thinks the game is broken. Zero means dead. Greater than zero means alive. Use the alive flag — that is what it is for.

## Elite Insight

This is entity lifecycle management. Every game engine has it. The alive flag is the simplest version. Production engines use generation counters (entity ID + generation) so you can detect stale references to recycled entities. L10 adds pool reuse. L17 builds a free list. L40 creates a full cleanup system. This lesson is the foundation they all build on.

## Cross-Path Echo

The Platformer path uses active flags on particles and projectiles. The RPG path uses alive checks on inventory slots and NPC states. Same lifecycle pattern, different entity types.`,
  starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];
bool enemy_alive[MAX_ENEMIES];

void spawnWave(int ex[], int ey[], int ehp[], bool ea[],
               int count, int startX, int spacing, int hp) {
    for (int i = 0; i < count; i++) {
        ex[i] = startX + i * spacing;
        ey[i] = 40;
        ehp[i] = hp;
        ea[i] = true;
    }
}

int main() {
    int playerHP = 100;
    int score = 0;
    int lives = 3;
    int waveSize = 5;

    // Spawn wave
    spawnWave(enemy_x, enemy_y, enemy_hp, enemy_alive,
              waveSize, 50, 60, 30);

    // Bullet
    int bulletX = 170;
    int bulletY = 200;
    int bulletSpeed = 50;

    // TODO: Movement system — 3 ticks
    // Each tick: enemies move down by 8, bullet moves up by bulletSpeed

    // TODO: Collision system — check each alive enemy
    // If bulletX == enemy_x[i] and bulletY <= enemy_y[i], it's a hit

    // TODO: Death system — set alive=false, hp=0, score += 100

    // TODO: Render player, then alive enemies only
    // TODO: Count surviving enemies
    // TODO: Output HUD, GAME_MESSAGE, and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];
bool enemy_alive[MAX_ENEMIES];

void spawnWave(int ex[], int ey[], int ehp[], bool ea[],
               int count, int startX, int spacing, int hp) {
    for (int i = 0; i < count; i++) {
        ex[i] = startX + i * spacing;
        ey[i] = 40;
        ehp[i] = hp;
        ea[i] = true;
    }
}

int main() {
    int playerHP = 100;
    int score = 0;
    int lives = 3;
    int waveSize = 5;

    // Spawn wave
    spawnWave(enemy_x, enemy_y, enemy_hp, enemy_alive,
              waveSize, 50, 60, 30);

    // Bullet
    int bulletX = 170;
    int bulletY = 200;
    int bulletSpeed = 50;

    // Movement system: 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < waveSize; i++) {
            enemy_y[i] += 8;
        }
        bulletY -= bulletSpeed;
    }

    // Collision system
    for (int i = 0; i < waveSize; i++) {
        if (enemy_alive[i] && bulletX == enemy_x[i] && bulletY <= enemy_y[i]) {
            enemy_hp[i] = 0;
            enemy_alive[i] = false;
            score += 100;
        }
    }

    // Render player
    cout << "ENTITY|hero|player|180|220|24|24|" << playerHP << endl;

    // Render alive enemies and count survivors
    int surviving = 0;
    for (int i = 0; i < waveSize; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
            surviving++;
        }
    }

    cout << "HUD|HP:" << playerHP << "|SCORE:" << score
         << "|LIVES:" << lives << endl;
    cout << "GAME_MESSAGE|Enemy down! " << surviving << " remaining" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Enemy e2 should be destroyed (not in output)", expectedOutput: "^(?!.*ENTITY\\|e2\\|enemy)", isPattern: true },
    { id: "g2", description: "Surviving enemies should be at y=64", expectedOutput: "ENTITY\\|e0\\|enemy\\|50\\|64\\|22\\|22\\|30", isPattern: true },
    { id: "g3", description: "Enemy e4 should survive at correct position", expectedOutput: "ENTITY\\|e4\\|enemy\\|290\\|64\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Should show score of 100", expectedOutput: "SCORE\\|100", isPattern: true },
    { id: "g5", description: "Should show 4 remaining in message", expectedOutput: "GAME_MESSAGE\\|Enemy down! 4 remaining", isPattern: true },
    { id: "g6", description: "Should show HUD with updated score", expectedOutput: "HUD\\|HP:100\\|SCORE:100\\|LIVES:3", isPattern: true },
  ],
  hints: [
    "Movement: outer loop `tick < 3`, inner loop `i < waveSize`. Move enemies: `enemy_y[i] += 8;`. Move bullet: `bulletY -= bulletSpeed;` (once per tick, outside the inner loop).",
    "Collision: `if (enemy_alive[i] && bulletX == enemy_x[i] && bulletY <= enemy_y[i])` — always check alive first to skip dead entities.",
    "Render: `if (enemy_alive[i])` gates both the ENTITY output and the `surviving++` counter.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;

int enemy_x[MAX_ENEMIES];
int enemy_y[MAX_ENEMIES];
int enemy_hp[MAX_ENEMIES];
bool enemy_alive[MAX_ENEMIES];

// Spawn system: parametric wave initialization with alive flags
void spawnWave(int ex[], int ey[], int ehp[], bool ea[],
               int count, int startX, int spacing, int hp) {
    for (int i = 0; i < count; i++) {
        ex[i] = startX + i * spacing;
        ey[i] = 40;
        ehp[i] = hp;
        ea[i] = true;
    }
}

int main() {
    int playerHP = 100;
    int score = 0;
    int lives = 3;
    int waveSize = 5;

    // Spawn system
    spawnWave(enemy_x, enemy_y, enemy_hp, enemy_alive,
              waveSize, 50, 60, 30);

    // Bullet
    int bulletX = 170;
    int bulletY = 200;
    int bulletSpeed = 50;

    // Movement system: 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < waveSize; i++) {
            enemy_y[i] += 8;
        }
        bulletY -= bulletSpeed;
    }

    // Collision system
    for (int i = 0; i < waveSize; i++) {
        if (enemy_alive[i] && bulletX == enemy_x[i] && bulletY <= enemy_y[i]) {
            enemy_hp[i] = 0;
            enemy_alive[i] = false;
            score += 100;
        }
    }

    // Render system (alive-gated)
    cout << "ENTITY|hero|player|180|220|24|24|" << playerHP << endl;
    int surviving = 0;
    for (int i = 0; i < waveSize; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
            surviving++;
        }
    }

    cout << "HUD|HP:" << playerHP << "|SCORE:" << score
         << "|LIVES:" << lives << endl;
    cout << "GAME_MESSAGE|Enemy down! " << surviving << " remaining" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
