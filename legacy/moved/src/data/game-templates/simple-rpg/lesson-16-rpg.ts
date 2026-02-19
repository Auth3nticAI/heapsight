import type { GameLessonVariant } from "@/types/game";

export const lesson16RPG: GameLessonVariant = {
  lessonId: "rpg-16-entity-manager",

  instructions: `# EntityManager Owns the Dungeon

## Mental Model

EntityManager is the ownership pattern. One class owns all entity data. IDs are handles. The manager decides lifetime.

Loose parallel vectors in \\\`main()\\\` have no owner. Any code anywhere can read them, write them, corrupt them out of sync. Adding a new component means updating every spawn site in the codebase — and missing one silently misaligns the indices. The manager concentrates all that risk into one place. Spawn through the manager. Despawn through the manager. Access data through the manager. The vectors are private. The interface is clean.

This is not OOP ceremony. It is ownership for a concrete reason: one class, one change point, no surprise corruption.

## What Breaks Without This

Without encapsulation: you add a \\\`Speed\\\` component. You add a new vector. You update the 3 spawn calls you remember. You miss the 2 spawn calls in other functions. Now index 4 has Position(x,y), Stats(hp,max,atk), alive=true, but Speed[4] is whatever was in memory. The bug shows up two minutes later when a movement system reads junk velocity and sends an entity flying off-screen. You debug for an hour. The fix is a missing push_back. With the manager: add Speed to spawn() once. Every caller is automatically correct.

## The Fix

Wrap vectors in a class. Return IDs from spawn. Access data only through named methods. The caller never sees a vector index. They hold an int. They pass it to the manager. The manager handles everything.

\\\`\\\`\\\`cpp
class EntityManager {
private:
    vector<Position> positions;
    vector<Stats>    stats;
    vector<bool>     alive;

public:
    int spawn(Position pos, Stats st) {
        int id = (int)positions.size();
        positions.push_back(pos);
        stats.push_back(st);
        alive.push_back(true);
        return id;
    }
    void despawn(int id) { if (id >= 0 && id < (int)alive.size()) alive[id] = false; }
    Position& getPos(int id)   { return positions[id]; }
    Stats&    getStats(int id) { return stats[id]; }
    bool      isAlive(int id)  { return id >= 0 && id < (int)alive.size() && alive[id]; }
    int       size()           { return (int)alive.size(); }
    int count() { int n=0; for (bool a : alive) if(a) n++; return n; }
};
\\\`\\\`\\\`

## Pattern Insight

The ID is a handle. Not a pointer. Not a reference. An integer. Opaque to the caller, meaningful to the manager. File descriptors (open files on Linux) are integer handles. GPU texture IDs are integer handles. Entity IDs in every serious game engine are integer handles. The pattern is pervasive because it solves the problem of stable references into growable containers. Vectors reallocate. Integers do not.

## Scalability Insight

Systems become functions that take a manager reference: \\\`void renderSystem(EntityManager& mgr)\\\`, \\\`void combatSystem(EntityManager& mgr, int attackerId, int targetId)\\\`. Each system knows only the manager interface, not the storage. Swap from vectors to arrays later? The systems do not recompile. The interface hides the implementation. That is the scalability of encapsulation.

## Your Task

Build the dungeon with EntityManager:

1. Define the EntityManager class (copy from Part 1 or write from memory)
2. Spawn 3 enemies:
   - ID 0: pos(10,3) stats(30,30,10)
   - ID 1: pos(5,3)  stats(30,30,10)
   - ID 2: pos(15,3) stats(30,30,10)
3. Player at (10,4) — adjacent to enemy 0
4. Attack enemy 0 three times: \\\`manager.getStats(0).hp -= 10\\\` each time
5. On HP <= 0: \\\`manager.despawn(0)\\\`, score += 100
6. Render 20x10 grid using \\\`manager.isAlive(i)\\\` and \\\`manager.getPos(i)\\\`
7. Output \\\`HUD|HP:100|SCORE:100|LIVES:3\\\`
8. Output \\\`GAME_MESSAGE|EntityManager owns the dungeon.\\\`
9. Output \\\`SCORE|100\\\`

## Common Mistake

Using a hardcoded loop bound like \\\`for (int i = 0; i < 3; i++)\\\` instead of \\\`manager.size()\\\`. This works now with exactly 3 enemies but breaks the moment enemy count changes. Use \\\`manager.size()\\\` — it grows with the manager's data. The render loop does not know or care how many enemies exist. The manager does.

## Elite Insight

The next upgrade to this manager is a free list: a stack of dead IDs ready for reuse. When \\\`despawn(1)\\\` fires, push 1 onto the free list. The next \\\`spawn()\\\` call pops from the free list and reuses that slot instead of appending. Constant-size arrays become possible. Iteration stays compact — no holes. You will build this in the next lesson. For now, the append-only manager is the correct starting point: simpler to reason about, correct to debug.

## Pattern Recognition

EntityManager + system functions = the data layer of ECS. Entities are IDs. Components are vectors in the manager. Systems are functions that iterate the manager's data. This is how EnTT, Flecs, and Unity DOTS organize games with millions of entities. Your class is the same architecture at dungeon scale. The concepts transfer directly.

## Skill Reinforcement

- Class definition and private/public from C++ fundamentals
- Parallel vectors from Lesson 14
- Alive flags from Lesson 8
- Combat from Lesson 8
- Grid render from Lessons 1-5
- isAdjacent from Lesson 9
- Game loop structure from Lesson 15
New: all of the above operating through the manager interface.

## Mastery Check

Why does \\\`getStats()\\\` return \\\`Stats&\\\` (reference) instead of \\\`Stats\\\` (value)? Because value return creates a copy. \\\`manager.getStats(0).hp -= 10\\\` on a value return modifies the copy and discards it. The actual stored hp is unchanged. The reference return lets the caller modify the stored data directly. Reference return = write access to internal data. Value return = read-only snapshot. Always return by reference when callers need to modify the data.`,

  starterCode: `#include <iostream>
#include <vector>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

// TODO: Define EntityManager class
// private: vector<Position>, vector<Stats>, vector<bool> alive
// public: spawn, despawn, getPos, getStats, isAlive, size, count

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    // TODO: Create EntityManager
    // TODO: Spawn 3 enemies
    // ID 0: pos(10,3) stats(30,30,10)
    // ID 1: pos(5,3)  stats(30,30,10)
    // ID 2: pos(15,3) stats(30,30,10)

    int playerX = 10, playerY = 4;
    int playerHP = 100;
    int score = 0;

    // TODO: Attack ID 0 three times via manager.getStats(0).hp -= 10
    // On death: manager.despawn(0), score += 100

    // TODO: Render 20x10 grid
    // Loop i 0..manager.size(), check isAlive(i), getPos(i)

    cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|EntityManager owns the dungeon." << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <vector>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

class EntityManager {
private:
    vector<Position> positions;
    vector<Stats>    stats;
    vector<bool>     alive;

public:
    int spawn(Position pos, Stats st) {
        int id = (int)positions.size();
        positions.push_back(pos);
        stats.push_back(st);
        alive.push_back(true);
        return id;
    }

    void despawn(int id) {
        if (id >= 0 && id < (int)alive.size()) alive[id] = false;
    }

    Position& getPos(int id)   { return positions[id]; }
    Stats&    getStats(int id) { return stats[id]; }
    bool      isAlive(int id)  { return id >= 0 && id < (int)alive.size() && alive[id]; }
    int       size()           { return (int)alive.size(); }
    int count() { int n = 0; for (bool a : alive) if (a) n++; return n; }
};

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int main() {
    EntityManager manager;

    int e0 = manager.spawn({10, 3}, {30, 30, 10});
    int e1 = manager.spawn({5, 3},  {30, 30, 10});
    int e2 = manager.spawn({15, 3}, {30, 30, 10});

    int playerX = 10, playerY = 4;
    int playerHP = 100;
    int score = 0;

    // Attack enemy 0 three times
    if (isAdjacent(playerX, playerY, manager.getPos(e0).x, manager.getPos(e0).y)) {
        for (int hit = 0; hit < 3; hit++) {
            manager.getStats(e0).hp -= 10;
        }
        if (manager.getStats(e0).hp <= 0 && manager.isAlive(e0)) {
            manager.despawn(e0);
            score += 100;
        }
    }

    // Render 20x10 grid
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#'; continue;
            }
            if (col == playerX && row == playerY) {
                cout << '@'; continue;
            }
            bool printed = false;
            for (int i = 0; i < manager.size(); i++) {
                if (manager.isAlive(i) && col == manager.getPos(i).x && row == manager.getPos(i).y) {
                    cout << 'E'; printed = true; break;
                }
            }
            if (!printed) cout << '.';
        }
        cout << endl;
    }

    cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|EntityManager owns the dungeon." << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Score is 100 — enemy 0 despawned via manager",
      expectedOutput: "SCORE\\|100",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Enemy at (5,3) still alive — E appears in row 3",
      expectedOutput: "#\\.{4}E",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Player @ at (10,4) in the grid",
      expectedOutput: "#\\.{9}@",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD shows HP:100, SCORE:100, LIVES:3",
      expectedOutput: "HUD\\|HP:100\\|SCORE:100\\|LIVES:3",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message confirms EntityManager owns the dungeon",
      expectedOutput: "GAME_MESSAGE\\|EntityManager owns the dungeon\\.",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Top border renders correctly as 20 hashes",
      expectedOutput: "####################",
      isPattern: true,
    },
  ],

  hints: [
    "Add \`int size() { return (int)alive.size(); }\` to the manager. The render loop uses \`for (int i = 0; i < manager.size(); i++)\` — not a hardcoded 3. This way the loop still works when you add more enemies.",
    "\`manager.getStats(e0).hp -= 10\` modifies the stored HP via reference. Chain 3 of these, or put one in a loop: \`for (int hit = 0; hit < 3; hit++) { manager.getStats(e0).hp -= 10; }\`",
    "After the attack loop, check death: \`if (manager.getStats(e0).hp <= 0 && manager.isAlive(e0)) { manager.despawn(e0); score += 100; }\`. The isAlive guard prevents double-firing if you later add more attack logic.",
    "The isAlive check inside the render loop uses the full bounds check: \`manager.isAlive(i)\`. Your isAlive implementation should check \`id >= 0 && id < (int)alive.size() && alive[id]\` to be safe.",
  ],

  accumulatedCode: `#include <iostream>
#include <vector>
using namespace std;

// ==============================
// RPG CORE — Lessons 1-16
// Phase 2: EntityManager Pattern
// ==============================

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

// Optional components (composition from L11-L13)
struct Shield { int current; };
struct Speed  { int dx, dy; };

// === ENTITY MANAGER ===
// Owns all entity data. IDs are stable integer handles.
// Spawn appends. Despawn tombstones. No pointer invalidation.
class EntityManager {
private:
    vector<Position> positions;
    vector<Stats>    stats;
    vector<bool>     alive;

public:
    // spawn: pushes to all vectors atomically, returns stable ID
    int spawn(Position pos, Stats st) {
        int id = (int)positions.size();
        positions.push_back(pos);
        stats.push_back(st);
        alive.push_back(true);
        return id;
    }

    // despawn: tombstone deletion — index preserved, data untouched
    void despawn(int id) {
        if (id >= 0 && id < (int)alive.size()) alive[id] = false;
    }

    // Accessors return references — caller can read and write directly
    Position& getPos(int id)   { return positions[id]; }
    Stats&    getStats(int id) { return stats[id]; }
    bool      isAlive(int id)  { return id >= 0 && id < (int)alive.size() && alive[id]; }

    // size: total slots (alive + dead)
    int size() { return (int)alive.size(); }

    // count: only alive entities
    int count() { int n = 0; for (bool a : alive) if (a) n++; return n; }
};

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

// === RENDER SYSTEM ===
// Reads entity state from manager — always called post-update
void renderGrid(EntityManager& mgr, int playerX, int playerY,
                bool goldActive = false, int goldX = 0, int goldY = 0) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) { cout << '#'; continue; }
            if (col == playerX && row == playerY) { cout << '@'; continue; }
            if (goldActive && col == goldX && row == goldY) { cout << 'G'; continue; }
            bool found = false;
            for (int i = 0; i < mgr.size(); i++) {
                if (mgr.isAlive(i) && col == mgr.getPos(i).x && row == mgr.getPos(i).y) {
                    cout << 'E'; found = true; break;
                }
            }
            if (!found) cout << '.';
        }
        cout << endl;
    }
}

int main() {
    // === ENTITY SYSTEM ===
    EntityManager manager;

    int e0 = manager.spawn({10, 3}, {30, 30, 10});
    int e1 = manager.spawn({5, 3},  {30, 30, 10});
    int e2 = manager.spawn({15, 3}, {30, 30, 10});

    // === PLAYER STATE ===
    int playerX = 10, playerY = 4;
    int playerHP = 100;
    int playerGold = 0;
    int score = 0;

    // === COMBAT SYSTEM ===
    // Attack via manager reference — no direct vector access
    if (isAdjacent(playerX, playerY, manager.getPos(e0).x, manager.getPos(e0).y)) {
        for (int hit = 0; hit < 3; hit++) {
            manager.getStats(e0).hp -= 10;
        }
        if (manager.getStats(e0).hp <= 0 && manager.isAlive(e0)) {
            manager.despawn(e0);
            score += 100;
        }
    }

    // === RENDER ===
    renderGrid(manager, playerX, playerY);

    // === PROTOCOL OUTPUT ===
    cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|EntityManager owns the dungeon." << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
