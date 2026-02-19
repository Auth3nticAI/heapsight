import type { GameLessonVariant } from "@/types/game";

export const lesson28SpaceShooter: GameLessonVariant = {
  lessonId: "28-raii-first-pass",
  instructions: `# MILESTONE 28: RAII Entity Pool — Destructors Kill Memory Leaks\n\nLesson 27 leaked two entities. Raw \\\`new\\\` and \\\`delete\\\` scattered across game logic is a maintenance disaster. One missed \\\`delete\\\` in one code path and you bleed memory. RAII eliminates the entire class of bug. You wrap the allocation in a class. The constructor acquires. The destructor releases. Scope handles the rest.\n\n## What Breaks Without This\n\nWithout RAII, every function that allocates must remember to deallocate on every exit path — normal return, early return, error condition. In a game loop processing hundreds of entities across collision, damage, spawning, and rendering systems, one forgotten \\\`delete\\\` in one edge case creates a leak that only manifests after 30 minutes of play. You cannot test for it. You cannot eyeball it. RAII makes it structurally impossible.\n\n## The Fix\n\nCreate an \\\`EntityPool\\\` class. The constructor takes a capacity, calls \\\`new Entity[cap]\\\`, and stores the pointer. The destructor calls \\\`delete[]\\\` on that pointer. Now you create the pool in a scope. When the scope ends, the destructor fires automatically. One allocation, one deallocation, zero leaks. The compiler guarantees it.\n\nThe pool owns the memory. \\\`spawn()\\\` writes entities into the array. \\\`render()\\\` iterates and outputs. The caller never touches \\\`new\\\` or \\\`delete\\\`. Ownership is encapsulated. Data flow is clean.\n\nTrack allocations with global counters. After the pool scope closes, \\\`allocCount == deleteCount\\\`. That is the proof. Compare this with lesson 27 where \\\`Leaks: 2\\\`. Same entities, same game logic, zero leaks. RAII is the difference.\n\n## Your Task\n\n1. Define global \\\`allocCount\\\` and \\\`deleteCount\\\` counters\n2. Create \\\`EntityPool\\\` class: constructor allocates \\\`new Entity[cap]\\\`, prints \\\`"Pool created: N slots"\\\`, increments \\\`allocCount\\\`\n3. Add \\\`spawn()\\\` method: writes entity into \\\`entities[count]\\\`, increments count\n4. Add \\\`render()\\\` method: loops through and prints alive entities with game protocol\n5. Destructor: \\\`delete[] entities\\\`, prints \\\`"Pool destroyed: N slots"\\\`, increments \\\`deleteCount\\\`\n6. In main, create pool inside \\\`{ }\\\` block scope with capacity 8\n7. Spawn ship (100hp), alien1 (30hp), alien2 (30hp), bullet (1hp)\n8. Call \\\`pool.render()\\\`\n9. Let scope close — destructor fires\n10. Print \\\`GAME_MESSAGE|Allocs: 1 Deletes: 1 Leaks: 0\\\`\n11. Print \\\`SCORE|0\\\`\n\n## Beginner Trap\n\n**Common Mistake:** Putting the leak-check print inside the block scope. If you print before the closing brace, the destructor has not fired yet and \\\`deleteCount\\\` is still 0. Print the counts AFTER the closing brace, when the destructor has already run.\n\n## Elite Insight\n\nThis is the exact pattern behind \\\`std::vector\\\`. It owns a heap array, grows it when needed, and frees it in the destructor. You just built a simplified version of the most-used container in C++. Every professional C++ codebase depends on this pattern. It is not a convenience — it is the foundation.\n\n## Cross-Path Echo\n\nPython context managers (\\\`with open(...) as f\\\`) and JavaScript \\\`try/finally\\\` blocks solve the same problem: ensure cleanup runs regardless of how the scope exits. RAII is the C++ version, and it requires zero runtime overhead. The cleanup code is generated at compile time.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int allocCount = 0;
int deleteCount = 0;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

// TODO: Create EntityPool class with:
//   Entity* entities;
//   int capacity, count;
//   Constructor: new Entity[cap], print, allocCount++
//   spawn(): fill entities[count], count++
//   render(): loop and print alive entities
//   Destructor: delete[] entities, print, deleteCount++

int main() {
    // TODO: Open block scope {
    //   Create EntityPool with capacity 8
    //   Spawn ship, alien1, alien2, bullet
    //   Render
    // } — destructor fires here

    // TODO: Print GAME_MESSAGE with counts (after scope!)
    // TODO: Print SCORE|0

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int allocCount = 0;
int deleteCount = 0;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

class EntityPool {
public:
    Entity* entities;
    int capacity;
    int count;

    EntityPool(int cap) {
        entities = new Entity[cap];
        capacity = cap;
        count = 0;
        allocCount++;
        cout << "Pool created: " << cap << " slots" << endl;
    }

    void spawn(string id, string type, int x, int y, int w, int h, int hp) {
        if (count < capacity) {
            entities[count] = {id, type, x, y, w, h, hp, true};
            count++;
        }
    }

    void render() {
        for (int i = 0; i < count; i++) {
            if (entities[i].alive) {
                cout << "ENTITY|" << entities[i].id << "|" << entities[i].type << "|"
                     << entities[i].x << "|" << entities[i].y << "|"
                     << entities[i].width << "|" << entities[i].height
                     << "|" << entities[i].hp << endl;
            }
        }
    }

    ~EntityPool() {
        delete[] entities;
        deleteCount++;
        cout << "Pool destroyed: " << capacity << " slots" << endl;
    }
};

int main() {
    {
        EntityPool pool(8);
        pool.spawn("ship", "player", 180, 300, 24, 24, 100);
        pool.spawn("alien1", "enemy", 100, 40, 22, 22, 30);
        pool.spawn("alien2", "enemy", 200, 40, 22, 22, 30);
        pool.spawn("bullet", "bullet", 200, 280, 6, 6, 1);
        pool.render();
    }

    int leaks = allocCount - deleteCount;
    cout << "GAME_MESSAGE|Allocs: " << allocCount << " Deletes: " << deleteCount << " Leaks: " << leaks << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should print pool creation", expectedOutput: "Pool created: 8 slots", isPattern: true },
    { id: "g2", description: "Should render ship from RAII pool", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
    { id: "g3", description: "Should render alien1 from pool", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Should render alien2 from pool", expectedOutput: "ENTITY\\|alien2\\|enemy\\|200\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g5", description: "Should render bullet from pool", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|280\\|6\\|6\\|1", isPattern: true },
    { id: "g6", description: "Should print pool destruction", expectedOutput: "Pool destroyed: 8 slots", isPattern: true },
    { id: "g7", description: "Should verify zero leaks via RAII", expectedOutput: "GAME_MESSAGE\\|Allocs: 1 Deletes: 1 Leaks: 0", isPattern: true },
    { id: "g8", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Constructor: `entities = new Entity[cap]; capacity = cap; count = 0; allocCount++;` and print the creation message.",
    "Destructor: `~EntityPool() { delete[] entities; deleteCount++; }` and print the destruction message.",
    "Create pool inside `{ EntityPool pool(8); ... }`. Print the leak counts AFTER the closing `}` so the destructor has already run.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int allocCount = 0;
int deleteCount = 0;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity* e) {
    if (!e->alive) return;
    cout << "ENTITY|" << e->id << "|" << e->type << "|"
         << e->x << "|" << e->y << "|" << e->width << "|" << e->height
         << "|" << e->hp << endl;
}

void moveSystem(Entity entities[], int count, string type, int dx, int dy) {
    for (int i = 0; i < count; i++) {
        if (entities[i].alive && entities[i].type == type) {
            entities[i].x += dx;
            entities[i].y += dy;
        }
    }
}

bool checkCollision(Entity a, Entity b) {
    if (!a.alive || !b.alive) return false;
    bool overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
    bool overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
    return overlapX && overlapY;
}

int spawnParticles(Entity entities[], int nextIdx, int dx, int dy) {
    string pids[] = {"spark1", "spark2", "spark3", "spark4"};
    int offX[] = {-10, 10, -10, 10};
    int offY[] = {-10, -10, 10, 10};
    for (int i = 0; i < 4; i++) {
        entities[nextIdx + i] = {pids[i], "particle", dx + offX[i], dy + offY[i], 6, 6, 0, true};
    }
    return nextIdx + 4;
}

// Lesson 28: RAII EntityPool — zero leaks via destructor
class EntityPool {
public:
    Entity* entities;
    int capacity;
    int count;

    EntityPool(int cap) {
        entities = new Entity[cap];
        capacity = cap;
        count = 0;
        allocCount++;
        cout << "Pool created: " << cap << " slots" << endl;
    }

    void spawn(string id, string type, int x, int y, int w, int h, int hp) {
        if (count < capacity) {
            entities[count] = {id, type, x, y, w, h, hp, true};
            count++;
        }
    }

    void render() {
        for (int i = 0; i < count; i++) {
            if (entities[i].alive) {
                cout << "ENTITY|" << entities[i].id << "|" << entities[i].type << "|"
                     << entities[i].x << "|" << entities[i].y << "|"
                     << entities[i].width << "|" << entities[i].height
                     << "|" << entities[i].hp << endl;
            }
        }
    }

    ~EntityPool() {
        delete[] entities;
        deleteCount++;
        cout << "Pool destroyed: " << capacity << " slots" << endl;
    }
};

int main() {
    {
        EntityPool pool(8);
        pool.spawn("ship", "player", 180, 300, 24, 24, 100);
        pool.spawn("alien1", "enemy", 100, 40, 22, 22, 30);
        pool.spawn("alien2", "enemy", 200, 40, 22, 22, 30);
        pool.spawn("bullet", "bullet", 200, 280, 6, 6, 1);
        pool.render();
    }
    int leaks = allocCount - deleteCount;
    cout << "GAME_MESSAGE|Allocs: " << allocCount << " Deletes: " << deleteCount << " Leaks: " << leaks << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
