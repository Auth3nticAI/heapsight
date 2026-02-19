import type { GameLessonVariant } from "@/types/game";

export const lesson11SpaceShooter: GameLessonVariant = {
  lessonId: "11-component-structs",
  instructions: `# Seven Parallel Arrays \u2014 No Type Safety

You have \`enemy_x[]\`, \`enemy_y[]\`, \`enemy_dx[]\`, \`enemy_dy[]\`, \`enemy_hp[]\`, \`enemy_maxHp[]\`, \`enemy_alive[]\`. Seven arrays. Pass the wrong one to a function and the compiler shrugs. Movement reads dx when you passed hp. Silent data corruption. The game breaks in ways you can't trace.

## What Breaks Without This

Your movement system takes \`int enemy_y[], int speed\`. But velocity should be per-entity, not a global constant. You need \`enemy_dy[]\` per slot. That's another parallel array. Now your spawn function takes 7 array parameters. Miss one \u2192 stale data from the previous occupant of that slot. No compiler help. Pure human discipline. Discipline fails at 2am.

## The Fix

Structs group related data. \`struct Position { int x, y; };\` binds x and y into one type. \`Position pos[MAX]\` is a single array of positions. The movement system takes \`Position pos[]\` and \`Velocity vel[]\` \u2014 two parameters instead of four. Pass \`Health\` where \`Position\` is expected \u2192 compile error. The type system catches bugs before they run.

Three structs replace seven arrays:
- \`struct Position { int x, y; };\` \u2014 where an entity is
- \`struct Velocity { int dx, dy; };\` \u2014 how fast it moves per tick
- \`struct Health { int current, max; };\` \u2014 damage tracking with cap

Same SoA layout. Same cache performance. Better semantics. Better safety.

## Your Task

1. Define Position, Velocity, Health structs
2. Create arrays: \`Position pos[5]\`, \`Velocity vel[5]\`, \`Health hp[5]\`, \`bool alive[5]\`
3. Spawn 5 enemies: x=60,120,180,240,300 y=40 dx=0 dy=2 hp=30/30
4. Run 2 movement ticks (apply velocity to position for alive enemies)
5. Damage enemies 1 and 3: subtract 30 from hp.current, kill if dead (+100 score each)
6. Render surviving enemies with ENTITY protocol
7. Output HUD, message, score

## Beginner Trap

**Common Mistake:** Creating \`struct Entity { int x, y, dx, dy, hp, maxHp; bool alive; };\` \u2014 one big struct. That's AoS. The movement system loads hp and maxHp into cache even though it only needs x, y, dx, dy. With separate component structs, movement iterates Position[] and Velocity[] \u2014 exactly the data it needs, nothing wasted.

## Elite Insight

This is the ECS component pattern. Unity DOTS stores Translation, Rotation, LocalToWorld as separate component arrays. Unreal uses UActorComponent. EnTT uses dense arrays of POD structs. Your three structs are architecturally identical. The scale differs. The pattern does not.

## Systems Thinking Connection

L6 introduced SoA for cache performance. L10 added pool lifecycle. L11 adds type safety to the same data. Each lesson layers on top of the previous without replacing it. Structs don't change the memory layout \u2014 they change how the compiler enforces correctness.

## Cross-Path Echo

The Platformer path groups (x, y, w, h) into a Rect struct for collision. The RPG path groups (name, quantity, slot) into an Item struct for inventory. Every path converges on small, focused structs as the unit of data organization.`,
  starterCode: `#include <iostream>
using namespace std;

// TODO: Define struct Position { int x, y; };
// TODO: Define struct Velocity { int dx, dy; };
// TODO: Define struct Health { int current, max; };

int main() {
    const int MAX = 5;

    // TODO: Create component arrays
    // Position pos[MAX];
    // Velocity vel[MAX];
    // Health hp[MAX];
    // bool alive[MAX];

    int score = 0;

    // TODO: Spawn 5 enemies
    // x = 60 + i*60, y = 40, dx = 0, dy = 2, hp = 30/30, alive = true

    // TODO: Movement - 2 ticks
    // For each tick: if alive, pos[i].y += vel[i].dy

    // TODO: Damage enemies 1 and 3
    // hp[idx].current -= 30; if hp <= 0 set alive = false
    // Add 100 score per kill

    // TODO: Render alive enemies
    // ENTITY|eN|enemy|pos.x|pos.y|22|22|hp.current

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Struct arrays active: " << MAX << " slots, typed components" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

int main() {
    const int MAX = 5;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];

    int score = 0;

    // Spawn 5 enemies
    for (int i = 0; i < MAX; i++) {
        pos[i] = {60 + i * 60, 40};
        vel[i] = {0, 2};
        hp[i] = {30, 30};
        alive[i] = true;
    }

    // Movement - 2 ticks
    for (int tick = 0; tick < 2; tick++) {
        for (int i = 0; i < MAX; i++) {
            if (alive[i]) {
                pos[i].x += vel[i].dx;
                pos[i].y += vel[i].dy;
            }
        }
    }

    // Damage enemies 1 and 3
    hp[1].current -= 30;
    if (hp[1].current <= 0) { hp[1].current = 0; alive[1] = false; }
    score += 100;

    hp[3].current -= 30;
    if (hp[3].current <= 0) { hp[3].current = 0; alive[3] = false; }
    score += 100;

    // Render alive enemies
    for (int i = 0; i < MAX; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << pos[i].x << "|" << pos[i].y
                 << "|22|22|" << hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Struct arrays active: " << MAX << " slots, typed components" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Enemy0 at (60,44) after 2 ticks", expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|44\\|22\\|22\\|30", isPattern: true },
    { id: "g2", description: "Enemy1 should NOT render (killed)", expectedOutput: "^(?!.*ENTITY\\|e1\\|)", isPattern: true },
    { id: "g3", description: "Enemy2 at (180,44) after 2 ticks", expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|44\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Enemy3 should NOT render (killed)", expectedOutput: "^(?!.*ENTITY\\|e3\\|)", isPattern: true },
    { id: "g5", description: "Enemy4 at (300,44) after 2 ticks", expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|44\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "HUD shows score 200", expectedOutput: "HUD\\|HP:100\\|SCORE:200\\|LIVES:3", isPattern: true },
    { id: "g7", description: "Struct arrays active message", expectedOutput: "GAME_MESSAGE\\|Struct arrays active: 5 slots, typed components", isPattern: true },
    { id: "g8", description: "Score is 200", expectedOutput: "SCORE\\|200", isPattern: true },
  ],
  hints: [
    "Define structs before main: `struct Position { int x, y; };` \u2014 semicolon after the closing brace is required in C++.",
    "Spawn with aggregate init: `pos[i] = {60 + i * 60, 40};` assigns both x and y. `vel[i] = {0, 2};` sets dx=0, dy=2.",
    "Two ticks: `for (int tick = 0; tick < 2; tick++)` wrapping the movement loop. Each tick adds vel[i].dy (2) to pos[i].y. After 2 ticks: 40 + 2 + 2 = 44.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === PHASE 2 BEGIN: Component Structs (L11) ===
// L6: SoA arrays | L7: Loops | L8: Alive flags
// L9: Reference mutation | L10: Pool lifecycle
// L11: Struct-based components

// --- Component structs (L11) ---
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

const int POOL_SIZE = 20;

// --- Component arrays (SoA with structs) ---
Position enemy_pos[POOL_SIZE];
Velocity enemy_vel[POOL_SIZE];
Health enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

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

// --- System functions (L9 + L11) ---
void moveSystem(Position pos[], Velocity vel[], bool alive[], int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) {
            pos[i].x += vel[i].dx;
            pos[i].y += vel[i].dy;
        }
    }
}

void damageSystem(Health hp[], bool alive[], int targetIdx, int damage) {
    hp[targetIdx].current -= damage;
    if (hp[targetIdx].current < 0) hp[targetIdx].current = 0;
    if (hp[targetIdx].current <= 0) alive[targetIdx] = false;
}

int main() {
    // Initialize pool
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // Spawn 5 enemies using struct components
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, {60 + i * 60, 40}, {0, 2}, {30, 30},
                   enemy_pos, enemy_vel, enemy_hp, enemy_alive);
    }

    // Movement: 2 ticks
    moveSystem(enemy_pos, enemy_vel, enemy_alive, POOL_SIZE);
    moveSystem(enemy_pos, enemy_vel, enemy_alive, POOL_SIZE);

    // Combat: kill enemies 1 and 3
    damageSystem(enemy_hp, enemy_alive, 1, 30);
    score += 100;
    damageSystem(enemy_hp, enemy_alive, 3, 30);
    score += 100;

    // Render
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_pos[i].x << "|" << enemy_pos[i].y
                 << "|22|22|" << enemy_hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Struct arrays active: 5 slots, typed components" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
