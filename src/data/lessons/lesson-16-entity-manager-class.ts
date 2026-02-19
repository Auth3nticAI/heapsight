import type { Lesson } from "@/types/lesson";

export const lesson16: Lesson = {
  id: "16-entity-manager-class",
  title: "EntityManager Class",
  description: "Wrap the pool in a class. Clean API. Safe access. Slot reuse. Systems use IDs, never raw indices.",
  order: 16,
  xpReward: 150,
  tier: "pro",
  concepts: ["class", "encapsulation", "entity management", "ownership model", "spawn/despawn API"],
  part1: {
    title: "Concept: EntityManager Class",
    type: "concept",
    instructions: `# EntityManager Class

## Mental Model

The EntityManager owns the data. Systems ask it for references. Spawn returns an ID. Despawn takes an ID. The manager handles slots. Systems don't touch the pool directly.

Up until now, every system directly reads and writes the global arrays. \`posX[i] = 100\`. \`alive[i] = false\`. Any function can write to any slot. One typo — slot 50 instead of slot 5 — corrupts memory. No guardrails. No ownership. No safety.

A class wraps the arrays with a controlled API. The arrays become private. Access goes through methods. The class enforces invariants that raw arrays cannot.

## What Breaks

Without a manager, every system directly manipulates pool arrays. System A writes to slot 5 while System B reads slot 5. No ownership. No coordination. One function accidentally passes CAPACITY instead of an entity index — writes past the array boundary. Another forgets to check alive before reading — gets stale data from a dead entity. These bugs are silent, intermittent, and devastating.

## The Fix

\`\`\`cpp
class EntityManager {
private:
    static const int CAPACITY = 32;
    int posX[CAPACITY];
    int posY[CAPACITY];
    int hp[CAPACITY];
    bool alive[CAPACITY];
    int aliveCount;

public:
    EntityManager();
    int spawn(int x, int y, int health);
    void despawn(int id);
    int getX(int id);
    int getY(int id);
    int getHP(int id);
    bool isAlive(int id);
    int getAliveCount();
    int getCapacity();
};
\`\`\`

\`spawn()\` finds a free slot, sets it up, returns the ID (slot index). \`despawn(id)\` marks it dead. \`getX(id)\`, \`getY(id)\`, \`getHP(id)\` return component values. Systems use IDs, never raw indices into private arrays.

## TargetFile: include/entity_manager.h and src/main.cpp

## Performance Insight

The class adds zero overhead. These methods are trivial — the compiler inlines them. \`getX(id)\` compiles to the same machine code as \`posX[id]\`. Abstraction for free. You get safety without paying for it.

## Memory Insight

The manager itself is just a container for the arrays. No heap allocation. No \`new\`. The arrays are stack-allocated members of the class. Total size: same as before — CAPACITY * (4+4+4+1) + 4 bytes for aliveCount. ~420 bytes on stack.

## Your Task

1. Define \`class EntityManager\` with private arrays and public methods
2. Constructor initializes all slots to dead, aliveCount to 0
3. \`spawn(x, y, hp)\` — find free slot, set data, return id. Return -1 if full.
4. \`despawn(id)\` — set alive[id] = false, decrement aliveCount
5. Spawn 5 enemies, print each spawn with returned ID
6. Despawn id=2, print alive count
7. Spawn a replacement (should reuse slot 2), print with REUSED tag
8. Render all alive entities

## Beginner Trap

Making everything public "for convenience." Private data + public methods = systems can't corrupt internal state. If posX is public, any function can write \`mgr.posX[999] = garbage\`. If it's private, the only way to modify position is through the manager's API, which can bounds-check.

## Elite Insight

Unity's EntityManager: same pattern at scale. \`CreateEntity()\`, \`AddComponentData()\`, \`DestroyEntity()\`. Unreal's \`UWorld::SpawnActor()\`, \`DestroyActor()\`. Your class is the same API. The difference is theirs handles 100,000 entities with archetype storage. Yours handles 32 with arrays. Same concept.

## Systems Thinking Connection

The EntityManager is the single source of truth for entity state. Before this, state was scattered across global arrays with no owner. Now one object owns the data and controls access. This is encapsulation — not as an OOP buzzword, but as an engineering necessity. Ownership prevents corruption.

## Skill Reinforcement

The internal implementation uses findFreeSlot from L10, alive flags from L8, SoA arrays from L6. The class doesn't replace these patterns — it wraps them with a safe interface. Everything inside is the same. The outside is clean.

## Mastery Check

What happens if you call \`despawn(2)\` twice? The second call sets alive[2] = false again (no-op on the flag) but decrements aliveCount again — now it's wrong. A production manager would check \`isAlive(id)\` first. That's a future improvement.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define class EntityManager
// Private: CAPACITY=32, posX[], posY[], hp[], alive[], aliveCount
// Public: constructor, spawn, despawn, getX, getY, getHP, isAlive,
//         getAliveCount, getCapacity

int main() {
    // TODO: Create EntityManager instance

    cout << "=== ENTITY MANAGER ===" << endl;
    cout << "Spawning enemies..." << endl;

    // TODO: Spawn 5 enemies at x = 60+i*60, y = 40, hp = 30
    // Print: "  spawn(X, Y, HP) -> id=N"

    // TODO: Print alive count: "Alive: N/CAP"

    // TODO: Despawn id=2
    // Print: "Despawning id=2..."
    // Print: "Alive: N/CAP"

    // TODO: Spawn replacement at (180, 40, 50)
    // Print: "Spawning replacement..."
    // If id==2, print "  spawn(180, 40, 50) -> id=2 (REUSED)"
    // Print: "Alive: N/CAP"

    // TODO: Render all alive entities
    // ENTITY|eN|enemy|x|y|22|22|hp

    cout << "GAME_MESSAGE|EntityManager: clean API, safe access, slot reuse" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

class EntityManager {
private:
    static const int CAPACITY = 32;
    int posX[CAPACITY];
    int posY[CAPACITY];
    int hp[CAPACITY];
    bool alive[CAPACITY];
    int aliveCount;

public:
    EntityManager() {
        aliveCount = 0;
        for (int i = 0; i < CAPACITY; i++) {
            alive[i] = false;
        }
    }

    int spawn(int x, int y, int health) {
        for (int i = 0; i < CAPACITY; i++) {
            if (!alive[i]) {
                posX[i] = x;
                posY[i] = y;
                hp[i] = health;
                alive[i] = true;
                aliveCount++;
                return i;
            }
        }
        return -1;
    }

    void despawn(int id) {
        if (id >= 0 && id < CAPACITY && alive[id]) {
            alive[id] = false;
            aliveCount--;
        }
    }

    int getX(int id) { return posX[id]; }
    int getY(int id) { return posY[id]; }
    int getHP(int id) { return hp[id]; }
    bool isAlive(int id) { return alive[id]; }
    int getAliveCount() { return aliveCount; }
    int getCapacity() { return CAPACITY; }
};

int main() {
    EntityManager mgr;

    cout << "=== ENTITY MANAGER ===" << endl;
    cout << "Spawning enemies..." << endl;

    // Spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int x = 60 + i * 60;
        int id = mgr.spawn(x, 40, 30);
        cout << "  spawn(" << x << ", 40, 30) -> id=" << id << endl;
    }

    cout << "Alive: " << mgr.getAliveCount() << "/" << mgr.getCapacity() << endl;

    // Despawn id=2
    cout << endl << "Despawning id=2..." << endl;
    mgr.despawn(2);
    cout << "Alive: " << mgr.getAliveCount() << "/" << mgr.getCapacity() << endl;

    // Spawn replacement
    cout << endl << "Spawning replacement..." << endl;
    int newId = mgr.spawn(180, 40, 50);
    if (newId == 2) {
        cout << "  spawn(180, 40, 50) -> id=2 (REUSED)" << endl;
    } else {
        cout << "  spawn(180, 40, 50) -> id=" << newId << endl;
    }
    cout << "Alive: " << mgr.getAliveCount() << "/" << mgr.getCapacity() << endl;

    // Render
    cout << endl;
    for (int i = 0; i < mgr.getCapacity(); i++) {
        if (mgr.isAlive(i)) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << mgr.getX(i) << "|" << mgr.getY(i)
                 << "|22|22|" << mgr.getHP(i) << endl;
        }
    }

    cout << "GAME_MESSAGE|EntityManager: clean API, safe access, slot reuse" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should spawn and return IDs 0-4",
        expectedOutput: "spawn(300, 40, 30) -> id=4",
      },
      {
        id: "t2",
        description: "Should show 4/32 alive after despawn",
        expectedOutput: "Alive: 4/32",
      },
      {
        id: "t3",
        description: "Should show slot 2 reused",
        expectedOutput: "REUSED",
      },
      {
        id: "t4",
        description: "Should show EntityManager message",
        expectedOutput: "EntityManager: clean API, safe access, slot reuse",
      },
    ],
    hints: [
      "The class constructor: `EntityManager() { aliveCount = 0; for (int i = 0; i < CAPACITY; i++) alive[i] = false; }`",
      "spawn() is findFreeSlot + data write in one method: loop for `!alive[i]`, set data, `alive[i] = true`, `aliveCount++`, `return i;`",
      "After despawning id=2, the next spawn() finds slot 2 first (lowest dead index). newId will be 2.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: EntityManager in Action",
    type: "game_builder",
    instructions: `# Game Builder: EntityManager Drives the Pipeline

The EntityManager owns entity data. Systems use its API. Spawn a wave, run the pipeline, despawn kills, spawn replacements. All through the clean API.

## TargetFile: include/entity_manager.h and src/main.cpp

## Your Task

1. Create an EntityManager
2. Spawn 5 enemies at x = 60 + i*60, y = 40, hp = 30
3. Print each spawn with returned ID
4. Despawn id=2, add 100 to score
5. Spawn a replacement at (180, 40, 50) — observe slot reuse
6. Render all alive entities with ENTITY protocol
7. Output alive count, score, and message

Expected output:
\`\`\`
=== ENTITY MANAGER ===
Spawning enemies...
  spawn(60, 40, 30) -> id=0
  spawn(120, 40, 30) -> id=1
  spawn(180, 40, 30) -> id=2
  spawn(240, 40, 30) -> id=3
  spawn(300, 40, 30) -> id=4
Alive: 5/32

Despawning id=2...
Alive: 4/32

Spawning replacement...
  spawn(180, 40, 50) -> id=2 (REUSED)
Alive: 5/32

ENTITY|e0|enemy|60|40|22|22|30
ENTITY|e1|enemy|120|40|22|22|30
ENTITY|e2|enemy|180|40|22|22|50
ENTITY|e3|enemy|240|40|22|22|30
ENTITY|e4|enemy|300|40|22|22|30
GAME_MESSAGE|EntityManager: clean API, safe access, slot reuse
\`\`\`

## Mental Model

The EntityManager is the gatekeeper. No system directly accesses the arrays. Every read goes through \`getX(id)\`, \`getHP(id)\`. Every write goes through \`spawn()\`, \`despawn()\`. The manager enforces that dead slots aren't read, full pools aren't overwritten, and alive counts stay accurate.

## Performance Insight

Method calls compile away. \`mgr.getX(id)\` becomes \`mgr.posX[id]\` after inlining. Zero overhead. The abstraction is purely for human safety. The CPU sees the same instructions it always did.

## Memory Insight

The EntityManager object sits on the stack. Its member arrays are contiguous in memory. Same cache behavior as global arrays. No indirection. No pointer chasing. The class keyword doesn't change the memory layout.

## Beginner Trap

**Common Mistake:** Storing entity data outside the manager "for convenience." If you have \`int hp[32]\` both inside the manager AND as a global, they'll desync. One source of truth. The manager IS the source.

## Elite Insight

Production entity managers add generation counters to IDs. When slot 2 is despawned and respawned, the new entity gets ID {index: 2, generation: 1}. Old references with generation 0 are detected as stale. This prevents use-after-free bugs without garbage collection.

## Systems Thinking Connection

Before the EntityManager, you had data (arrays) and behavior (system functions) completely separated. The manager groups data with its access patterns. This isn't full OOP — the systems are still external functions. But the data has an owner now. Ownership is the first step from "code that works" to "code that can't break."

## Skill Reinforcement

The manager's internal implementation is identical to L10's pool. findFreeSlot is now spawn(). despawnEnemy is now despawn(). The arrays are the same. The API is new. This is refactoring — same behavior, better interface.

## Mastery Check

If you pass an EntityManager to a system function, should you pass by value or by reference? By reference. Passing by value copies all 420 bytes of arrays. By reference: 8 bytes (one pointer). Always pass managers by reference.`,
    starterCode: `#include <iostream>
using namespace std;

class EntityManager {
private:
    static const int CAPACITY = 32;
    int posX[CAPACITY];
    int posY[CAPACITY];
    int hp[CAPACITY];
    bool alive[CAPACITY];
    int aliveCount;

public:
    EntityManager() {
        aliveCount = 0;
        for (int i = 0; i < CAPACITY; i++) {
            alive[i] = false;
        }
    }

    int spawn(int x, int y, int health) {
        for (int i = 0; i < CAPACITY; i++) {
            if (!alive[i]) {
                posX[i] = x;
                posY[i] = y;
                hp[i] = health;
                alive[i] = true;
                aliveCount++;
                return i;
            }
        }
        return -1;
    }

    void despawn(int id) {
        if (id >= 0 && id < CAPACITY && alive[id]) {
            alive[id] = false;
            aliveCount--;
        }
    }

    int getX(int id) { return posX[id]; }
    int getY(int id) { return posY[id]; }
    int getHP(int id) { return hp[id]; }
    bool isAlive(int id) { return alive[id]; }
    int getAliveCount() { return aliveCount; }
    int getCapacity() { return CAPACITY; }
};

int main() {
    EntityManager mgr;
    int score = 0;

    cout << "=== ENTITY MANAGER ===" << endl;
    cout << "Spawning enemies..." << endl;

    // TODO: Spawn 5 enemies, print IDs

    // TODO: Print alive count

    // TODO: Despawn id=2, score += 100

    // TODO: Spawn replacement at (180, 40, 50), detect REUSED

    // TODO: Render all alive entities

    cout << "GAME_MESSAGE|EntityManager: clean API, safe access, slot reuse" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

class EntityManager {
private:
    static const int CAPACITY = 32;
    int posX[CAPACITY];
    int posY[CAPACITY];
    int hp[CAPACITY];
    bool alive[CAPACITY];
    int aliveCount;

public:
    EntityManager() {
        aliveCount = 0;
        for (int i = 0; i < CAPACITY; i++) {
            alive[i] = false;
        }
    }

    int spawn(int x, int y, int health) {
        for (int i = 0; i < CAPACITY; i++) {
            if (!alive[i]) {
                posX[i] = x;
                posY[i] = y;
                hp[i] = health;
                alive[i] = true;
                aliveCount++;
                return i;
            }
        }
        return -1;
    }

    void despawn(int id) {
        if (id >= 0 && id < CAPACITY && alive[id]) {
            alive[id] = false;
            aliveCount--;
        }
    }

    int getX(int id) { return posX[id]; }
    int getY(int id) { return posY[id]; }
    int getHP(int id) { return hp[id]; }
    bool isAlive(int id) { return alive[id]; }
    int getAliveCount() { return aliveCount; }
    int getCapacity() { return CAPACITY; }
};

int main() {
    EntityManager mgr;
    int score = 0;

    cout << "=== ENTITY MANAGER ===" << endl;
    cout << "Spawning enemies..." << endl;

    // Spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int x = 60 + i * 60;
        int id = mgr.spawn(x, 40, 30);
        cout << "  spawn(" << x << ", 40, 30) -> id=" << id << endl;
    }

    cout << "Alive: " << mgr.getAliveCount() << "/" << mgr.getCapacity() << endl;

    // Despawn id=2
    cout << endl << "Despawning id=2..." << endl;
    mgr.despawn(2);
    score += 100;
    cout << "Alive: " << mgr.getAliveCount() << "/" << mgr.getCapacity() << endl;

    // Spawn replacement
    cout << endl << "Spawning replacement..." << endl;
    int newId = mgr.spawn(180, 40, 50);
    if (newId == 2) {
        cout << "  spawn(180, 40, 50) -> id=2 (REUSED)" << endl;
    } else {
        cout << "  spawn(180, 40, 50) -> id=" << newId << endl;
    }
    cout << "Alive: " << mgr.getAliveCount() << "/" << mgr.getCapacity() << endl;

    // Render
    cout << endl;
    for (int i = 0; i < mgr.getCapacity(); i++) {
        if (mgr.isAlive(i)) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << mgr.getX(i) << "|" << mgr.getY(i)
                 << "|22|22|" << mgr.getHP(i) << endl;
        }
    }

    cout << "GAME_MESSAGE|EntityManager: clean API, safe access, slot reuse" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should render e0 at (60,40) hp=30",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|40\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should render e2 replacement with hp=50",
        expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|40\\|22\\|22\\|50",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show slot reuse",
        expectedOutput: "REUSED",
      },
      {
        id: "g4",
        description: "Should show 5/32 alive after replacement",
        expectedOutput: "Alive: 5/32",
      },
      {
        id: "g5",
        description: "Should show EntityManager message",
        expectedOutput: "GAME_MESSAGE\\|EntityManager: clean API, safe access, slot reuse",
        isPattern: true,
      },
    ],
    hints: [
      "Spawn loop: `int id = mgr.spawn(60 + i * 60, 40, 30);` — the manager handles slot finding internally.",
      "After `mgr.despawn(2)`, `mgr.getAliveCount()` returns 4. The manager tracks this automatically.",
      "The replacement `mgr.spawn(180, 40, 50)` returns 2 because slot 2 is the first dead slot. Check `if (newId == 2)` for REUSED.",
    ],
    estimatedMinutes: 10,
  },
};
