import type { GameLessonVariant } from "@/types/game";

export const lesson27SpaceShooter: GameLessonVariant = {
  lessonId: "27-heap-stack-demo",
  instructions: `# MILESTONE 27: Heap-Allocated Entities — Where Your Memory Actually Lives\n\nUntil now, every entity lived on the stack. Fixed-size arrays, known at compile time. That works for demos. It does not work for a real game where enemies spawn dynamically, bullets appear and disappear, and particle counts are unpredictable. You need heap allocation. And you need to see what happens when you get it wrong.\n\n## What Breaks Without This\n\nStack arrays have fixed capacity. If you need 200 enemies in wave 5 but allocated space for 12, you write past the array and corrupt memory. Heap allocation with \\\`new\\\` lets you create entities on demand. But every \\\`new\\\` without a matching \\\`delete\\\` is a memory leak. A shooter spawning 60 bullets per second leaks 3600 objects per minute. Your game slows, stutters, and dies.\n\n## The Fix\n\nAllocate entities with \\\`new\\\` and track every allocation with a global counter. \\\`spawnEntity()\\\` calls \\\`new Entity{...}\\\`, increments \\\`allocCount\\\`, and returns the pointer. When an entity dies, you call \\\`delete\\\` and increment \\\`deleteCount\\\`. At the end of the wave, compare the two counters. If they do not match, you have leaks.\n\nThis lesson is intentionally broken. You will spawn 4 entities, delete 2 of them, and leave 2 leaked. The counters prove it: \\\`Allocs: 4, Deletes: 2, Leaks: 2\\\`. You are seeing the problem before you learn the fix. Lesson 28 introduces RAII to make this impossible.\n\n## Your Task\n\n1. Define Entity struct and global \\\`allocCount\\\`/\\\`deleteCount\\\` counters\n2. Write \\\`spawnEntity()\\\` — allocates with \\\`new\\\`, increments \\\`allocCount\\\`, returns pointer\n3. Spawn 4 heap entities: ship (100hp), alien1 (30hp), alien2 (30hp), bullet (1hp)\n4. Render all 4 entities through pointers (\\\`renderEntity(Entity* e)\\\` uses \\\`e->id\\\`)\n5. Delete alien2 and bullet (increment \\\`deleteCount\\\` each time)\n6. Print \\\`GAME_MESSAGE|Allocs: 4 Deletes: 2 Leaks: 2\\\`\n7. Print \\\`SCORE|0\\\`\n\n## Beginner Trap\n\n**Common Mistake:** Using a pointer after calling \\\`delete\\\` on it. Once you \\\`delete alien2\\\`, that pointer is dangling — reading \\\`alien2->hp\\\` is undefined behavior. Always render before you delete. Order matters.\n\n## Elite Insight\n\nEvery game engine that shipped before 2011 fought this exact battle. Manual \\\`new\\\`/\\\`delete\\\` pairing is error-prone at scale. The industry moved to smart pointers and pool allocators not because manual management is hard to understand, but because it is hard to get right in every code path. You need to feel the pain before the solution makes sense.\n\n## Cross-Path Echo\n\nGarbage-collected languages hide this problem. Java, Python, JavaScript — they all heap-allocate everything and let the GC clean up. The cost is unpredictable pauses. C++ gives you control. Control means responsibility. This lesson shows you both sides.`,
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

void renderEntity(Entity* e) {
    if (!e->alive) return;
    cout << "ENTITY|" << e->id << "|" << e->type << "|"
         << e->x << "|" << e->y << "|" << e->width << "|" << e->height
         << "|" << e->hp << endl;
}

// TODO: Write spawnEntity — uses new, increments allocCount, returns Entity*

int main() {
    // TODO: Spawn 4 entities on heap: ship, alien1, alien2, bullet
    // TODO: Render all 4
    // TODO: Delete alien2 and bullet (deleteCount++ each)
    // TODO: Print GAME_MESSAGE with alloc/delete/leak counts
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

void renderEntity(Entity* e) {
    if (!e->alive) return;
    cout << "ENTITY|" << e->id << "|" << e->type << "|"
         << e->x << "|" << e->y << "|" << e->width << "|" << e->height
         << "|" << e->hp << endl;
}

Entity* spawnEntity(string id, string type, int x, int y, int w, int h, int hp) {
    Entity* e = new Entity{id, type, x, y, w, h, hp, true};
    allocCount++;
    return e;
}

int main() {
    Entity* ship = spawnEntity("ship", "player", 180, 300, 24, 24, 100);
    Entity* alien1 = spawnEntity("alien1", "enemy", 100, 40, 22, 22, 30);
    Entity* alien2 = spawnEntity("alien2", "enemy", 200, 40, 22, 22, 30);
    Entity* bullet = spawnEntity("bullet", "bullet", 200, 280, 6, 6, 1);

    renderEntity(ship);
    renderEntity(alien1);
    renderEntity(alien2);
    renderEntity(bullet);

    delete alien2;
    deleteCount++;
    delete bullet;
    deleteCount++;

    int leaks = allocCount - deleteCount;
    cout << "GAME_MESSAGE|Allocs: " << allocCount << " Deletes: " << deleteCount << " Leaks: " << leaks << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render ship from heap allocation", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should render alien1 from heap", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g3", description: "Should render alien2 before deletion", expectedOutput: "ENTITY\\|alien2\\|enemy\\|200\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Should render bullet before deletion", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|280\\|6\\|6\\|1", isPattern: true },
    { id: "g5", description: "Should show leak tracking: 4 allocs, 2 deletes, 2 leaks", expectedOutput: "GAME_MESSAGE\\|Allocs: 4 Deletes: 2 Leaks: 2", isPattern: true },
    { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "`spawnEntity` should call `new Entity{id, type, x, y, w, h, hp, true}`, then `allocCount++`, then return the pointer.",
    "Render all 4 entities BEFORE deleting any. After rendering, `delete alien2; deleteCount++;` and same for bullet.",
    "Leaks = allocCount - deleteCount = 4 - 2 = 2. Ship and alien1 pointers are never freed.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 12;
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

Entity* spawnEntity(string id, string type, int x, int y, int w, int h, int hp) {
    Entity* e = new Entity{id, type, x, y, w, h, hp, true};
    allocCount++;
    return e;
}

// Lesson 27: Heap allocation with leak detection
int main() {
    Entity* ship = spawnEntity("ship", "player", 180, 300, 24, 24, 100);
    Entity* alien1 = spawnEntity("alien1", "enemy", 100, 40, 22, 22, 30);
    Entity* alien2 = spawnEntity("alien2", "enemy", 200, 40, 22, 22, 30);
    Entity* bullet = spawnEntity("bullet", "bullet", 200, 280, 6, 6, 1);
    renderEntity(ship);
    renderEntity(alien1);
    renderEntity(alien2);
    renderEntity(bullet);
    delete alien2;
    deleteCount++;
    delete bullet;
    deleteCount++;
    int leaks = allocCount - deleteCount;
    cout << "GAME_MESSAGE|Allocs: " << allocCount << " Deletes: " << deleteCount << " Leaks: " << leaks << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
