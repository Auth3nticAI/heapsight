import type { GameLessonVariant } from "@/types/game";

export const lesson13SpaceShooter: GameLessonVariant = {
  lessonId: "13-inheritance-trap",
  instructions: `# Class Hierarchy Explosion \u2014 Why Inheritance Fails for Game Entities

You need four enemy types: normal, fast, shielded, fast+shielded. The OOP approach: four classes with inheritance. FastEnemy extends Enemy. ShieldedEnemy extends Enemy. FastShieldedEnemy extends... both? Diamond problem. Virtual dispatch. Vtable overhead. The hierarchy breaks before you ship.

## What Breaks Without This

Every new enemy combination requires a new class. 3 traits (fast, shielded, poisoned) = 8 classes for all combinations. 5 traits = 32 classes. The class count grows exponentially with traits. Maintenance becomes impossible. Adding "burning" to the game means doubling every class that might burn.

And runtime flexibility? Impossible. An enemy picks up a shield power-up mid-game. With inheritance, it can't change its class. With composition, set \`hasShield[i] = true\`. One array write.

## The Fix

Composition. Four component structs: Position, Velocity, Health, Shield. An entity is an index into parallel arrays. A "fast shielded enemy" is index 3 with Velocity(0,5) and Shield(20). No class. No virtual. No vtable. Just data.

The movement system iterates Position[] and Velocity[]. It doesn't know about shields. The damage system checks hasShield[] before reducing hp. Each system reads only the components it needs. Add a new component (Poison, Fire, Invisibility) without modifying any existing system.

## Your Task

1. Define Position, Velocity, Health, Shield structs
2. Create 4 enemies via composition:
   - Entity 0: pos(60,40) vel(0,2) hp(30,30) no shield \u2014 NORMAL
   - Entity 1: pos(120,40) vel(0,5) hp(30,30) no shield \u2014 FAST
   - Entity 2: pos(180,40) vel(0,2) hp(30,30) shield(20) \u2014 SHIELDED
   - Entity 3: pos(240,40) vel(0,5) hp(30,30) shield(20) \u2014 FAST+SHIELDED
3. Move all for 3 ticks
4. Apply 20 damage to all: shield absorbs first, overflow to hp
5. Render all alive enemies with ENTITY protocol
6. Output HUD, message, score

## Beginner Trap

**Common Mistake:** Applying damage directly to hp without checking shield. The damage path must be: check hasShield \u2192 if shield > 0, reduce shield \u2192 if shield goes negative, overflow to hp \u2192 else reduce hp directly. Shield is a damage buffer, not a separate health pool.

## Elite Insight

This is exactly how Overwatch's damage model works. Shields, armor, and health are separate components. The damage system resolves them in order: shields first, then armor (with damage reduction), then health. Three component arrays. One damage function. No inheritance.

## Systems Thinking Connection

L11 built component structs. L12 put them in headers. L13 proves WHY this architecture exists. The answer is combinatorial explosion. N components give you 2^N entity types for free. N classes give you... N entity types, and you have to write every one by hand.

## Cross-Path Echo

The RPG path faces the same trap with equipment: a SwordOfFireAndIce can't inherit from both FireSword and IceSword. Composition: one weapon with FireDamage component + IceDamage component. Same lesson. Same fix. Different sprites.`,
  starterCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };

int main() {
    const int MAX = 4;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];
    bool hasShield[MAX];
    Shield shield[MAX];

    int score = 0;

    // TODO: Spawn 4 enemies
    // 0: normal   pos(60,40)  vel(0,2) hp(30,30) no shield
    // 1: fast     pos(120,40) vel(0,5) hp(30,30) no shield
    // 2: shielded pos(180,40) vel(0,2) hp(30,30) shield(20)
    // 3: fast+sh  pos(240,40) vel(0,5) hp(30,30) shield(20)

    // TODO: Movement - 3 ticks
    // Each tick: if alive, pos[i].y += vel[i].dy

    // TODO: Damage all alive enemies by 20
    // If hasShield and shield > 0: shield absorbs first, overflow to hp
    // Else: hp -= damage directly

    // TODO: Render alive enemies
    // ENTITY|eN|enemy|pos.x|pos.y|22|22|hp.current

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|4 enemy types from 0 classes" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };

int main() {
    const int MAX = 4;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];
    bool hasShield[MAX];
    Shield shield[MAX];

    int score = 0;

    // Spawn 4 enemy types via composition
    pos[0] = {60, 40};  vel[0] = {0, 2}; hp[0] = {30, 30}; alive[0] = true; hasShield[0] = false; shield[0] = {0};
    pos[1] = {120, 40}; vel[1] = {0, 5}; hp[1] = {30, 30}; alive[1] = true; hasShield[1] = false; shield[1] = {0};
    pos[2] = {180, 40}; vel[2] = {0, 2}; hp[2] = {30, 30}; alive[2] = true; hasShield[2] = true;  shield[2] = {20};
    pos[3] = {240, 40}; vel[3] = {0, 5}; hp[3] = {30, 30}; alive[3] = true; hasShield[3] = true;  shield[3] = {20};

    // Movement - 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < MAX; i++) {
            if (alive[i]) {
                pos[i].x += vel[i].dx;
                pos[i].y += vel[i].dy;
            }
        }
    }

    // Damage all alive enemies by 20
    int damage = 20;
    for (int i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        if (hasShield[i] && shield[i].current > 0) {
            shield[i].current -= damage;
            if (shield[i].current < 0) {
                hp[i].current += shield[i].current;
                shield[i].current = 0;
            }
        } else {
            hp[i].current -= damage;
        }
        if (hp[i].current <= 0) {
            hp[i].current = 0;
            alive[i] = false;
            score += 100;
        }
    }

    // Render alive enemies
    for (int i = 0; i < MAX; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << pos[i].x << "|" << pos[i].y
                 << "|22|22|" << hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|4 enemy types from 0 classes" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Entity0 (normal): y=46 (40+2*3), hp=10 (30-20)", expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|46\\|22\\|22\\|10", isPattern: true },
    { id: "g2", description: "Entity1 (fast): y=55 (40+5*3), hp=10 (30-20)", expectedOutput: "ENTITY\\|e1\\|enemy\\|120\\|55\\|22\\|22\\|10", isPattern: true },
    { id: "g3", description: "Entity2 (shielded): y=46, hp=30 (shield absorbed)", expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|46\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Entity3 (fast+shielded): y=55, hp=30 (shield absorbed)", expectedOutput: "ENTITY\\|e3\\|enemy\\|240\\|55\\|22\\|22\\|30", isPattern: true },
    { id: "g5", description: "4 enemy types from 0 classes message", expectedOutput: "GAME_MESSAGE\\|4 enemy types from 0 classes", isPattern: true },
    { id: "g6", description: "Score is 0 (all survived)", expectedOutput: "SCORE\\|0", isPattern: true },
    { id: "g7", description: "HUD shows score 0", expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3", isPattern: true },
  ],
  hints: [
    "Spawn each entity individually: `pos[0] = {60, 40}; vel[0] = {0, 2}; hp[0] = {30, 30}; hasShield[0] = false; shield[0] = {0};`",
    "Shield absorption: `shield[i].current -= damage;` If shield goes negative (e.g., shield was 10, damage was 20 \u2192 shield = -10), overflow to hp: `hp[i].current += shield[i].current;` then `shield[i].current = 0;`. Here shield is 20 and damage is 20, so shield becomes exactly 0. No overflow.",
    "Normal enemies: 30 - 20 = 10 hp. Shielded: shield 20 - 20 = 0, hp stays 30. All 4 survive. Score = 0.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L13: Composition over Inheritance ===
// L11: Component structs | L12: Header extraction
// L13: Why composition beats class hierarchies

// --- include/components.h (simulated, L12) ---
// #pragma once
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };  // NEW: optional component (L13)

const int POOL_SIZE = 20;

// --- Component arrays (SoA with structs) ---
Position enemy_pos[POOL_SIZE];
Velocity enemy_vel[POOL_SIZE];
Health enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];
bool enemy_hasShield[POOL_SIZE];  // Optional component flag (L13)
Shield enemy_shield[POOL_SIZE];    // Optional component data (L13)

// --- Pool management (L10) ---
int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, Position p, Velocity v, Health h,
                Position pos[], Velocity vel[], Health hp[], bool alive[]) {
    pos[idx] = p;
    vel[idx] = v;
    hp[idx] = h;
    alive[idx] = true;
}

void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}

// --- System functions ---
void moveSystem(Position pos[], Velocity vel[], bool alive[], int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) {
            pos[i].x += vel[i].dx;
            pos[i].y += vel[i].dy;
        }
    }
}

// Damage with shield support (L13)
void damageEntity(Health& hp, bool& alive, bool hasShield, Shield& shield, int damage) {
    if (hasShield && shield.current > 0) {
        shield.current -= damage;
        if (shield.current < 0) {
            hp.current += shield.current;  // overflow to hp
            shield.current = 0;
        }
    } else {
        hp.current -= damage;
    }
    if (hp.current <= 0) {
        hp.current = 0;
        alive = false;
    }
}

int main() {
    // Initialize pool
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
        enemy_hasShield[i] = false;
    }

    int score = 0;

    // Spawn 4 enemy types via composition
    // Normal
    int idx = findFreeSlot(enemy_alive, POOL_SIZE);
    spawnEnemy(idx, {60, 40}, {0, 2}, {30, 30},
               enemy_pos, enemy_vel, enemy_hp, enemy_alive);

    // Fast
    idx = findFreeSlot(enemy_alive, POOL_SIZE);
    spawnEnemy(idx, {120, 40}, {0, 5}, {30, 30},
               enemy_pos, enemy_vel, enemy_hp, enemy_alive);

    // Shielded
    idx = findFreeSlot(enemy_alive, POOL_SIZE);
    spawnEnemy(idx, {180, 40}, {0, 2}, {30, 30},
               enemy_pos, enemy_vel, enemy_hp, enemy_alive);
    enemy_hasShield[idx] = true;
    enemy_shield[idx] = {20};

    // Fast + Shielded
    idx = findFreeSlot(enemy_alive, POOL_SIZE);
    spawnEnemy(idx, {240, 40}, {0, 5}, {30, 30},
               enemy_pos, enemy_vel, enemy_hp, enemy_alive);
    enemy_hasShield[idx] = true;
    enemy_shield[idx] = {20};

    // Movement: 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        moveSystem(enemy_pos, enemy_vel, enemy_alive, POOL_SIZE);
    }

    // Damage all by 20 (shield absorbs first)
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            damageEntity(enemy_hp[i], enemy_alive[i],
                         enemy_hasShield[i], enemy_shield[i], 20);
            if (!enemy_alive[i]) score += 100;
        }
    }

    // Render
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_pos[i].x << "|" << enemy_pos[i].y
                 << "|22|22|" << enemy_hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|4 enemy types from 0 classes" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
