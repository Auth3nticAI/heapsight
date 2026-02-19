import type { GameLessonVariant } from "@/types/game";

export const lesson16SpaceShooter: GameLessonVariant = {
  lessonId: "16-entity-manager-class",
  instructions: `# EntityManager Class — From Raw Arrays to Architecture

You've been touching raw arrays directly. Every system function takes \`int posX[]\`, \`bool alive[]\`, \`int capacity\` as parameters. Every system can corrupt any slot. Every function signature is a mess of array pointers. It works, but it's fragile. One wrong index and you're writing to memory you don't own.

## What Breaks Without This

Without a manager, entity state has no owner. System A despawns slot 3. System B, which cached a reference to slot 3 last frame, reads stale position data. System C spawns a new entity into slot 3 — now System B's "old enemy" is actually a "new powerup." Data corruption through aliasing. No class, no ownership, no safety.

## The Fix

Wrap the pool in an EntityManager class. The arrays become private members. Access goes through public methods: \`spawn(x, y, hp)\` returns an ID, \`despawn(id)\` marks it dead, \`getX(id)\`/\`getY(id)\`/\`getHP(id)\` read components, \`isAlive(id)\` checks status, \`getAliveCount()\` returns the count.

The internal implementation is identical to L10's pool. \`findFreeSlot\` is now the body of \`spawn()\`. \`despawnEnemy\` is now \`despawn()\`. Same code, wrapped in a class. Zero runtime overhead — the compiler inlines these trivial methods. You get safety for free.

Create the EntityManager. Spawn 5 enemies. Print each spawn with the returned ID. Despawn id=2 (score +100). Spawn a replacement at the same position with higher HP — observe slot 2 gets reused. Render all alive entities through the manager's API.

## Your Task

1. Use the provided EntityManager class
2. Spawn 5 enemies at x = 60 + i*60, y = 40, hp = 30
3. Print each spawn: \`spawn(X, Y, HP) -> id=N\`
4. Print alive count: \`Alive: N/32\`
5. Despawn id=2, add 100 to score
6. Spawn replacement at (180, 40, 50) — detect REUSED if id==2
7. Render all alive entities: \`ENTITY|eN|enemy|x|y|22|22|hp\`
8. Output \`GAME_MESSAGE|EntityManager: clean API, safe access, slot reuse\`

## Beginner Trap

**Common Mistake:** Bypassing the manager to access arrays directly. If you store \`int* ptr = &mgr.posX[0]\`, you've broken encapsulation. The whole point is that systems go through the API. Direct access defeats the purpose and won't even compile if the members are private.

## Elite Insight

Unity's EntityManager: \`CreateEntity()\`, \`AddComponentData<T>()\`, \`SetComponentData<T>()\`, \`DestroyEntity()\`. Same API pattern. Same encapsulation. Same slot reuse under the hood. Your class is the exact same concept at learning scale. Production just adds generics and archetype storage.

## Systems Thinking Connection

The EntityManager is the architectural upgrade from "scripts that manipulate data" to "systems that request data from an owner." This is the difference between hobby code and engine code. Ownership prevents corruption. APIs prevent misuse. Classes encode intent.

## Skill Reinforcement

The manager wraps L10's pool (findFreeSlot, alive flags), L6's SoA arrays, and L14's capacity tracking. The class doesn't add new behavior — it adds a boundary around existing behavior. That boundary is the value.

## Mastery Check

If you need to add a \`setX(int id, int x)\` method for the movement system, where does it go? In the EntityManager's public section. It's a mutator — it modifies private state through a controlled interface. The movement system calls \`mgr.setX(id, newX)\` instead of \`posX[id] = newX\`.`,
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

    // TODO: Spawn 5 enemies at x = 60 + i*60, y = 40, hp = 30
    // Print: "  spawn(X, 40, 30) -> id=N"

    // TODO: Print "Alive: N/32"

    // TODO: Despawn id=2, score += 100
    // Print "Despawning id=2..."
    // Print "Alive: N/32"

    // TODO: Spawn replacement at (180, 40, 50)
    // Print "Spawning replacement..."
    // If id==2: "  spawn(180, 40, 50) -> id=2 (REUSED)"
    // Print "Alive: N/32"

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
    { id: "g1", description: "Should spawn enemies with IDs 0-4", expectedOutput: "spawn\\(300, 40, 30\\) -> id=4", isPattern: true },
    { id: "g2", description: "Should show 4/32 after despawn", expectedOutput: "Alive: 4/32", isPattern: true },
    { id: "g3", description: "Should reuse slot 2", expectedOutput: "REUSED", isPattern: true },
    { id: "g4", description: "Should render e2 with hp=50 (replacement)", expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|40\\|22\\|22\\|50", isPattern: true },
    { id: "g5", description: "Should render e4 at (300,40) hp=30", expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "Should show EntityManager message", expectedOutput: "GAME_MESSAGE\\|EntityManager: clean API, safe access, slot reuse", isPattern: true },
  ],
  hints: [
    "Spawn in a loop: `int id = mgr.spawn(60 + i * 60, 40, 30);` — the manager finds the slot internally.",
    "After `mgr.despawn(2)`, alive count drops to 4. The next `mgr.spawn()` finds slot 2 first.",
    "Render loop: `for (int i = 0; i < mgr.getCapacity(); i++) { if (mgr.isAlive(i)) ... }` — all access through the API.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L16: EntityManager Class ===
// L6: SoA arrays | L8: Alive flags | L9: System functions
// L10: Pool lifecycle | L14: Capacity | L15: Pipeline | L16: Encapsulation

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

// --- System functions now take EntityManager by reference ---
int moveSystem(EntityManager& mgr, int speed) {
    int moved = 0;
    for (int i = 0; i < mgr.getCapacity(); i++) {
        // Note: setY() would be needed for mutation
        // For now, systems still need position mutators
        if (mgr.isAlive(i)) moved++;
    }
    return moved;
}

int main() {
    EntityManager mgr;
    int score = 0;

    // Spawn wave
    for (int i = 0; i < 5; i++) {
        mgr.spawn(60 + i * 60, 40, 30);
    }

    // All entity access through the manager API
    for (int i = 0; i < mgr.getCapacity(); i++) {
        if (mgr.isAlive(i)) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << mgr.getX(i) << "|" << mgr.getY(i)
                 << "|22|22|" << mgr.getHP(i) << endl;
        }
    }

    cout << "GAME_MESSAGE|EntityManager: clean API, safe access, slot reuse" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
