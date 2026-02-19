import type { Lesson } from "@/types/lesson";

export const lesson08: Lesson = {
  id: "08-combat-rules",
  title: "Combat Rules",
  description: "Use boolean alive flags to manage entity lifecycle and conditional rendering.",
  order: 8,
  xpReward: 125,
  tier: "pro",
  concepts: ["boolean flags", "alive state", "entity lifecycle", "conditional rendering"],
  part1: {
    title: "Concept: Combat Rules",
    type: "concept",
    instructions: `# Combat Rules

Every entity has a lifecycle: spawn, active, dead. The alive flag is the gatekeeper. Movement only processes alive entities. Rendering only draws alive entities. This is the first rule of entity management: check alive before touching.

## What Breaks Without Alive Flags

Without alive flags, dead enemies keep rendering. Keep colliding. Keep processing. The game world fills with ghosts. Bullets hit corpses. Scores double-count. The player kills an enemy and it's still there. That is not a feature — it is a broken entity system.

## The Fix

Add a \\\`bool enemy_alive[MAX]\\\` array. Set to \\\`true\\\` on spawn. Set to \\\`false\\\` when hp drops to 0 or below. Every system checks alive before processing:

\`\`\`cpp
// Damage system
if (enemy_alive[i]) {
    enemy_hp[i] -= damage;
    if (enemy_hp[i] <= 0) {
        enemy_hp[i] = 0;
        enemy_alive[i] = false;
    }
}

// Render system — only draw living entities
if (enemy_alive[i]) {
    cout << "ENTITY|e" << i << "|enemy|" << enemy_x[i] << "..." << endl;
}
\`\`\`

## Performance

Branch on the alive flag: highly predictable when most enemies are alive. CPU branch predictor gets >95% hit rate. Cost: ~1 cycle per entity. When most are dead, the branch becomes even more predictable — it almost always skips.

## Memory

Bool array: 1 byte per entity, not 1 bit. Bools are byte-aligned for addressability. 100 enemies = 100 bytes. Negligible. The alive array sits next to the other component arrays in memory — same SoA layout.

## Beginner Trap

Forgetting to check alive in the render loop. The enemy dies but still appears. Player thinks it's a bug. It IS a bug — the render system doesn't respect entity state. Every system must gate on alive. No exceptions.

## Elite Insight

Every ECS uses an alive/active bitflag. Unity DOTS: \\\`entity.Exists()\\\`. EnTT: entity validity check. Same pattern. L8 introduces the alive flag. L10 adds pool reuse. L17 builds a free list. L40 creates a cleanup system.

## Your Task

Start with 5 enemies at 30 hp each. Apply 35 damage to enemies e1 and e3 (more than their hp). Set them to dead. Render only the surviving enemies. Track kills and score.

Expected output:
\`\`\`
=== COMBAT ROUND ===
Before: 5 enemies alive
ENTITY|e0|enemy|60|60|22|22|30
ENTITY|e1|enemy|120|60|22|22|30
ENTITY|e2|enemy|180|60|22|22|30
ENTITY|e3|enemy|240|60|22|22|30
ENTITY|e4|enemy|300|60|22|22|30
--- Applying damage: e1=35dmg, e3=35dmg ---
After: 3 enemies alive
ENTITY|e0|enemy|60|60|22|22|30
ENTITY|e2|enemy|180|60|22|22|30
ENTITY|e4|enemy|300|60|22|22|30
GAME_MESSAGE|2 enemies destroyed, 3 surviving
SCORE|200
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;

int enemy_x[MAX_ENEMIES] = {60, 120, 180, 240, 300};
int enemy_y[MAX_ENEMIES] = {60, 60, 60, 60, 60};
int enemy_hp[MAX_ENEMIES] = {30, 30, 30, 30, 30};
bool enemy_alive[MAX_ENEMIES] = {true, true, true, true, true};

int main() {
    int score = 0;
    int killPoints = 100;

    cout << "=== COMBAT ROUND ===" << endl;

    // Count alive before damage
    int aliveBefore = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_alive[i]) aliveBefore++;
    }
    cout << "Before: " << aliveBefore << " enemies alive" << endl;

    // Render all alive enemies (before damage)
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "--- Applying damage: e1=35dmg, e3=35dmg ---" << endl;

    // TODO: Apply 35 damage to enemy 1
    // TODO: If hp <= 0, set hp to 0, set alive to false, add killPoints to score

    // TODO: Apply 35 damage to enemy 3
    // TODO: Same death check

    // TODO: Count alive after damage
    // TODO: Print "After: N enemies alive"

    // TODO: Render only alive enemies (after damage)

    // TODO: Print GAME_MESSAGE with kills and surviving count
    // TODO: Print SCORE

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 5;

int enemy_x[MAX_ENEMIES] = {60, 120, 180, 240, 300};
int enemy_y[MAX_ENEMIES] = {60, 60, 60, 60, 60};
int enemy_hp[MAX_ENEMIES] = {30, 30, 30, 30, 30};
bool enemy_alive[MAX_ENEMIES] = {true, true, true, true, true};

int main() {
    int score = 0;
    int killPoints = 100;

    cout << "=== COMBAT ROUND ===" << endl;

    // Count alive before damage
    int aliveBefore = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_alive[i]) aliveBefore++;
    }
    cout << "Before: " << aliveBefore << " enemies alive" << endl;

    // Render all alive enemies (before damage)
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "--- Applying damage: e1=35dmg, e3=35dmg ---" << endl;

    // Damage e1
    enemy_hp[1] -= 35;
    if (enemy_hp[1] <= 0) {
        enemy_hp[1] = 0;
        enemy_alive[1] = false;
        score += killPoints;
    }

    // Damage e3
    enemy_hp[3] -= 35;
    if (enemy_hp[3] <= 0) {
        enemy_hp[3] = 0;
        enemy_alive[3] = false;
        score += killPoints;
    }

    // Count alive after damage
    int aliveAfter = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_alive[i]) aliveAfter++;
    }
    cout << "After: " << aliveAfter << " enemies alive" << endl;

    // Render only alive enemies
    for (int i = 0; i < MAX_ENEMIES; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    int kills = aliveBefore - aliveAfter;
    cout << "GAME_MESSAGE|" << kills << " enemies destroyed, "
         << aliveAfter << " surviving" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show 5 enemies alive before damage",
        expectedOutput: "Before: 5 enemies alive",
      },
      {
        id: "t2",
        description: "Should show 3 enemies alive after damage",
        expectedOutput: "After: 3 enemies alive",
      },
      {
        id: "t3",
        description: "Dead enemy e1 should not appear after damage",
        expectedOutput: "GAME_MESSAGE\\|2 enemies destroyed, 3 surviving",
        isPattern: true,
      },
      {
        id: "t4",
        description: "Should award 200 score for 2 kills",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
    ],
    hints: [
      "Apply damage: `enemy_hp[1] -= 35;` then check `if (enemy_hp[1] <= 0)` to set alive to false.",
      "Clamp hp: `enemy_hp[1] = 0;` inside the death check. Dead entities should have exactly 0 hp.",
      "Count alive after damage with a loop: `if (enemy_alive[i]) aliveAfter++;` — same pattern as before damage.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Entity Lifecycle",
    type: "game_builder",
    instructions: `# Game Builder: Full Entity Lifecycle

Spawn a wave, move enemies down, fire a bullet, kill enemies on collision, render only survivors. This is the full entity lifecycle: spawn, update, collide, die, render.

## Systems Pipeline

1. **Spawn system**: spawnWave fills arrays, sets alive flags
2. **Movement system**: 3 ticks, enemies move down, bullet moves up
3. **Collision system**: check if bullet y <= enemy y for alive enemies
4. **Death system**: set alive=false, clamp hp, add score
5. **Render system**: only output alive entities

## Your Task

1. Spawn 5 enemies: startX=50, spacing=60, y=40, hp=30
2. Set all alive flags to true
3. Place bullet at x=170, y=200 moving up at speed 50 per tick
4. Run 3 ticks: move enemies down by 8 per tick, move bullet up by 50 per tick
5. After movement: check if bullet x matches any enemy x (within range) AND bullet y <= enemy y. Enemy at x=170 (enemy index 2, x=50+2*60=170) gets hit
6. Kill hit enemies: alive=false, hp=0, score += 100
7. Render ship, surviving enemies, HUD, message, and score

After 3 ticks: enemies at y=64 (40+3*8), bullet at y=50 (200-3*50). Bullet at x=170, enemy 2 at x=170, bullet y=50 <= enemy y=64. Hit.

Expected output:
\`\`\`
ENTITY|hero|player|180|220|24|24|100
ENTITY|e0|enemy|50|64|22|22|30
ENTITY|e1|enemy|110|64|22|22|30
ENTITY|e3|enemy|230|64|22|22|30
ENTITY|e4|enemy|290|64|22|22|30
HUD|HP:100|SCORE:100|LIVES:3
GAME_MESSAGE|Enemy down! 4 remaining
SCORE|100
\`\`\``,
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
      {
        id: "g1",
        description: "Enemy e2 should be destroyed (not in output)",
        expectedOutput: "^(?!.*ENTITY\\|e2\\|enemy)",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Surviving enemies should be at y=64 after 3 ticks",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|50\\|64\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show score of 100",
        expectedOutput: "SCORE\\|100",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Should show 4 remaining in message",
        expectedOutput: "GAME_MESSAGE\\|Enemy down! 4 remaining",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Should show HUD with updated score",
        expectedOutput: "HUD\\|HP:100\\|SCORE:100\\|LIVES:3",
        isPattern: true,
      },
    ],
    hints: [
      "Movement: nested loops. Outer `tick < 3`, inner `i < waveSize`. `enemy_y[i] += 8;` and `bulletY -= bulletSpeed;` (bullet moves once per tick, outside inner loop).",
      "Collision: `if (enemy_alive[i] && bulletX == enemy_x[i] && bulletY <= enemy_y[i])` — check alive first to skip dead entities.",
      "Render loop: `if (enemy_alive[i])` gates both the ENTITY output and the surviving counter increment.",
    ],
    estimatedMinutes: 8,
  },
};
