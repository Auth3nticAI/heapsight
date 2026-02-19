import type { GameLessonVariant } from "@/types/game";

export const lesson13RPG: GameLessonVariant = {
  lessonId: "rpg-13-inheritance-trap",

  instructions: `# Inheritance Trap — Composition Wins

## Mental Model

Inheritance is seductive. "FastEnemy IS-A Enemy." Elegant until you need FastShieldedEnemy. Composition: entity HAS-A position, HAS-A shield. Mix and match.

Inheritance says FastEnemy IS-A Enemy. ShieldedEnemy IS-A Enemy. But FastShieldedEnemy is IS-A FastEnemy AND IS-A ShieldedEnemy. Multiple inheritance. The diamond problem. Two copies of Enemy in memory. Ambiguous \\\`hp\\\`. The compiler gives you an error. Your design gives you a wall.

Composition says: entity 0 HAS Position and Stats. Entity 1 also HAS Shield. Entity 2 also HAS Speed. The arrays do not care. The systems do not care. The combinations are free.

## What Breaks Without This

OOP tutorials show inheritance first. It works for two enemy types. It breaks at three. Add ten types with four traits — you need four-way multiple inheritance or a hierarchy so deep it compiles in minutes. Every major engine abandoned deep inheritance after 2010. Unity: MonoBehaviour to DOTS. Unreal: Actor hierarchy to ActorComponents. The industry moved. This lesson is why.

## The Fix

\\\`\\\`\\\`cpp
struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };
struct Shield { int points; };
struct Speed { int multiplier; };

// Normal:       HAS Position, HAS Stats
// Shielded:     HAS Position, HAS Stats, HAS Shield
// Fast+Shielded: HAS Position, HAS Stats, HAS Shield, HAS Speed
\\\`\\\`\\\`

No classes. No hierarchy. No diamond. Just data.

## Pattern Insight

Diablo's monster affixes — Fire Enchanted, Extra Fast, Cursed — are exactly this. Each affix is a boolean flag plus a data component. Fire Enchanted adds a fire damage component. Extra Fast adds a speed multiplier. The core monster struct is untouched. Your hasShield and hasSpeed booleans are Diablo monster affixes at learning-scale.

## Scalability Insight

N component types = 2^N combinations free. Three types (Shield, Speed, Poison) = eight enemy variants. Without composition: eight classes, eight virtual function tables, eight header files. With composition: three bool arrays, three optional struct arrays. No new code per combination. The math is brutal. Composition wins.

## Your Task

Build the dungeon with three enemy types via composition:

1. Define Position, Stats, Shield{int points}, Speed{int multiplier}
2. Player at (10,5): Stats{100,100,10,0}
3. Three enemies, all alive=true:
   - Entity 0 at (5,3): Stats{30,30,5,0}, no shield, no speed
   - Entity 1 at (10,3): Stats{30,30,5,0}, Shield{20}, no speed
   - Entity 2 at (15,3): Stats{30,30,5,0}, Shield{20}, Speed{2}
4. Render the 20x10 dungeon grid: \\\`@\\\` at player, \\\`E\\\` at each alive enemy, \\\`#\\\` walls, \\\`.\\\` floor
5. Attack each enemy once (10 damage):
   - If hasShield and shield.points > 0: shield absorbs first
   - Else: stats.hp -= damage
   - If stats.hp <= 0: alive=false
6. Print \\\`"HUD|HP:100|ATK:10|GOLD:0"\\\` from struct fields
7. Print \\\`"GAME_MESSAGE|Structs bring order."\\\`
8. Print \\\`"SCORE|0"\\\` (all three survive one attack)

Expected after combat:
- Entity 0: hp 30 → 20 (took 10 direct damage, no shield)
- Entity 1: shield 20 → 10, hp stays 30 (shield absorbed all 10)
- Entity 2: shield 20 → 10, hp stays 30 (shield absorbed all 10)

## Common Mistake

Applying damage to hp when a shield exists. Check shield first. \\\`if (hasShield[i] && shield[i].points > 0)\\\` — if true, damage hits the shield. Only if shield is gone does hp take the overflow. Get the order wrong and shielded enemies are indistinguishable from normal ones.

## Elite Insight (Skyrim/Diablo/Zelda)

Skyrim's actor system dropped deep inheritance after Morrowind. Every NPC and creature became a generic actor with different component flags. A Draugr is not a subclass of Undead. It is an actor entity with an undead flag, a combat stats component, and an AI set to aggressive melee. Your Shield and Speed components are exactly that pattern. Different data. Same entity shape. Same dungeon.

## Pattern Recognition

The three entities share one combat system and one render system. Neither system has a switch statement or type enum. Neither knows what "type" an enemy is. They check flags, read data, and act. That flag-check-plus-data-read is the universal game entity pattern. Every engine. Every genre. Every scale.

## Skill Reinforcement

Position and Stats from L11. Grid rendering from L1. Combat from L5-L6. Alive flags from L8. Loot from L9-L10. Build log from L12. Optional Shield and Speed are new — same bool flag pattern as alive, new meaning. One new pattern built on five old ones.

## Mastery Check

How many classes would you need for Normal, Shielded, Fast, FastShielded, Poisoned, FastPoisoned, ShieldedPoisoned, FastShieldedPoisoned? Eight. With three component types and composition? Still three bool arrays. Still three optional struct arrays. Eight combinations, zero extra classes. Every new component doubles the free combinations without adding a single class file.`,

  starterCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };
struct Shield { int points; };
struct Speed { int multiplier; };

int main() {
    // Player
    Position playerPos = {10, 5};
    Stats playerStats = {100, 100, 10, 0};

    const int MAX = 3;

    // TODO: Position and Stats arrays for 3 enemies
    // 0: pos(5,3)  stats{30,30,5,0}
    // 1: pos(10,3) stats{30,30,5,0}
    // 2: pos(15,3) stats{30,30,5,0}

    // TODO: bool alive[MAX] = all true

    // TODO: bool hasShield[MAX] and Shield shield[MAX]
    // 0: no shield, 1: shield{20}, 2: shield{20}

    // TODO: bool hasSpeed[MAX] and Speed speed[MAX]
    // 0: no speed, 1: no speed, 2: speed{2}

    // TODO: Render 20x10 dungeon grid
    // # walls, . floor, @ at playerPos, E at each alive enemy

    // TODO: Attack each enemy once (playerStats.attack = 10 damage)
    // If hasShield and shield.points > 0: shield absorbs first
    // Else: stats.hp -= damage
    // If stats.hp <= 0: alive = false

    cout << "HUD|HP:" << playerStats.hp << "|ATK:" << playerStats.attack
         << "|GOLD:" << playerStats.gold << endl;
    cout << "GAME_MESSAGE|Structs bring order." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };
struct Shield { int points; };
struct Speed { int multiplier; };

int main() {
    // Player
    Position playerPos = {10, 5};
    Stats playerStats = {100, 100, 10, 0};

    const int MAX = 3;

    Position pos[MAX] = {{5, 3}, {10, 3}, {15, 3}};
    Stats stats[MAX] = {{30, 30, 5, 0}, {30, 30, 5, 0}, {30, 30, 5, 0}};
    bool alive[MAX] = {true, true, true};

    bool hasShield[MAX] = {false, true, true};
    Shield shield[MAX] = {{0}, {20}, {20}};

    bool hasSpeed[MAX] = {false, false, true};
    Speed speed[MAX] = {{1}, {1}, {2}};

    // Render 20x10 dungeon grid
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerPos.x && row == playerPos.y) {
                cout << '@';
            } else {
                bool printed = false;
                for (int i = 0; i < MAX; i++) {
                    if (alive[i] && col == pos[i].x && row == pos[i].y) {
                        cout << 'E';
                        printed = true;
                        break;
                    }
                }
                if (!printed) cout << '.';
            }
        }
        cout << endl;
    }

    // Combat: attack each enemy once (composition-based damage)
    int damage = playerStats.attack;
    for (int i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        if (hasShield[i] && shield[i].points > 0) {
            shield[i].points -= damage;
            if (shield[i].points < 0) {
                stats[i].hp += shield[i].points;
                shield[i].points = 0;
            }
        } else {
            stats[i].hp -= damage;
        }
        if (stats[i].hp <= 0) {
            stats[i].hp = 0;
            alive[i] = false;
        }
    }

    cout << "HUD|HP:" << playerStats.hp << "|ATK:" << playerStats.attack
         << "|GOLD:" << playerStats.gold << endl;
    cout << "GAME_MESSAGE|Structs bring order." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Grid shows @ at player row 5, col 10",
      expectedOutput: "#\\.{9}@\\.{9}#",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Grid shows E at normal enemy row 3, col 5",
      expectedOutput: "#\\.{4}E",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Grid shows E at shielded enemy row 3, col 10",
      expectedOutput: "#\\.{9}E",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD shows player HP, ATK, GOLD from Stats struct",
      expectedOutput: "HUD\\|HP:100\\|ATK:10\\|GOLD:0",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message confirms composition approach",
      expectedOutput: "GAME_MESSAGE\\|Structs bring order\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Aggregate initialize arrays: \\\`Position pos[MAX] = {{5, 3}, {10, 3}, {15, 3}};\\\` — each inner brace pair initializes one Position struct.",
    "Grid render: for each interior cell, loop through all three enemies to check if any alive enemy sits at that coordinate. Print E if found, dot otherwise.",
    "Shield first: \\\`if (hasShield[i] && shield[i].points > 0) { shield[i].points -= damage; }\\\` — if shield goes negative, add it to hp (negative addition = subtraction), then clamp to zero.",
    "After combat, entity 0 has hp 20 (took 10 direct), entities 1 and 2 have hp 30 and shield 10 (shield absorbed 10). All alive. Score stays 0.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — L13: Inheritance Trap
// Composition: entity HAS-A components, not IS-A class
// ==============================

// Simulating: include/components.h
// #pragma once
struct Position { int x, y; };
struct Stats { int hp, maxHp, attack, gold; };
struct Shield { int points; };
struct Speed { int multiplier; };

// isAdjacent: combat range check (L7)
bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx;
    int dy = ay - by;
    if (dx < 0) dx = -dx;
    if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    // === BUILD LOG (L12 pattern) ===
    // Simulating multi-file compile with components.h

    // === PLAYER ===
    Position playerPos = {10, 5};
    Stats playerStats = {100, 100, 10, 0};

    // === ENEMIES (composition-based, no class hierarchy) ===
    const int MAX = 3;

    Position pos[MAX] = {{5, 3}, {10, 3}, {15, 3}};
    Stats stats[MAX] = {{30, 30, 5, 0}, {30, 30, 5, 0}, {30, 30, 5, 0}};
    bool alive[MAX] = {true, true, true};

    // Optional components — boolean flags control presence
    bool hasShield[MAX] = {false, true, true};
    Shield shield[MAX] = {{0}, {20}, {20}};

    bool hasSpeed[MAX] = {false, false, true};
    Speed speed[MAX] = {{1}, {1}, {2}};

    // === GOLD (loot drop — from L9) ===
    int goldX = 0, goldY = 0;
    bool goldActive = false;
    int goldValue = 25;

    // === GRID RENDER ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerPos.x && row == playerPos.y) {
                cout << '@';
            } else if (goldActive && col == goldX && row == goldY) {
                cout << 'G';
            } else {
                bool printed = false;
                for (int i = 0; i < MAX; i++) {
                    if (alive[i] && col == pos[i].x && row == pos[i].y) {
                        cout << 'E';
                        printed = true;
                        break;
                    }
                }
                if (!printed) cout << '.';
            }
        }
        cout << endl;
    }

    // === COMBAT (composition-based damage — shield absorbs first) ===
    int damage = playerStats.attack;
    for (int i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        if (hasShield[i] && shield[i].points > 0) {
            shield[i].points -= damage;
            if (shield[i].points < 0) {
                stats[i].hp += shield[i].points;  // overflow to hp
                shield[i].points = 0;
            }
        } else {
            stats[i].hp -= damage;
        }
        if (stats[i].hp <= 0) {
            stats[i].hp = 0;
            alive[i] = false;
            // Loot drop (L9 pattern)
            goldX = pos[i].x;
            goldY = pos[i].y;
            goldActive = true;
        }
    }

    // === PROTOCOL OUTPUT ===
    cout << "HUD|HP:" << playerStats.hp << "|ATK:" << playerStats.attack
         << "|GOLD:" << playerStats.gold << endl;
    cout << "GAME_MESSAGE|Structs bring order." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
};
