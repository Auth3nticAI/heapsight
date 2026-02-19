import type { GameLessonVariant } from "@/types/game";

export const lesson26SpaceShooter: GameLessonVariant = {
  lessonId: "26-pointers-data-access",
  instructions: `# MILESTONE 26: Pointer-Driven Entity Iteration — When Indexing Hides the Machine\n\nEvery time you write \\\`entities[i].hp\\\`, the compiler generates \\\`*(entities + i)\\\` and then offsets to the hp field. The bracket notation hides what is actually happening: pointer arithmetic. In a hot loop that processes thousands of entities per frame, understanding the real data flow matters. You are going to rewrite your entity processing to use raw pointers.\n\n## What Breaks Without This\n\nNothing breaks visibly. Your game runs fine with array indexing. But when you need to optimize — skip dead entities, batch-process subranges, pass iterators to subsystems — you hit a wall. You do not understand what the machine is actually doing. Pointer literacy is the difference between writing code and understanding code.\n\n## The Fix\n\nReplace index-based loops with pointer-based iteration. \\\`Entity* ptr = entities\\\` gives you the address of element zero. \\\`ptr++\\\` advances to the next entity. \\\`ptr->hp\\\` reads the hp field at the current address. This is identical to \\\`entities[i].hp\\\` — same instructions, same cache behavior. But now you see the data flow directly.\n\nThe pattern: \\\`Entity* ptr = entities; Entity* end = entities + count;\\\` Then iterate \\\`for (; ptr != end; ptr++)\\\`. This is how STL iterators work internally. You are learning the primitive that powers the entire C++ standard library.\n\nFor batch processing, accumulate a value across all alive entities. Walk the pointer forward, check \\\`ptr->alive\\\`, accumulate \\\`ptr->hp\\\`. One pass through memory. One cache line at a time. Clean data flow.\n\n## Your Task\n\n1. Set up entity array with 4 entities: ship (100hp), alien1 (30hp), alien2 (30hp), bullet (1hp) — all alive\n2. Create \\\`Entity* ptr = entities\\\` and \\\`Entity* end = entities + COUNT\\\`\n3. Iterate with pointer: \\\`for (; ptr != end; ptr++)\\\`\n4. For each alive entity, render it and accumulate total HP using \\\`ptr->hp\\\`\n5. Print \\\`GAME_MESSAGE|Total HP: 161\\\`\n6. Print \\\`SCORE|0\\\`\n\n## Beginner Trap\n\n**Common Mistake:** Forgetting to dereference when passing to a function. \\\`renderEntity(ptr)\\\` passes a pointer — you need \\\`renderEntity(*ptr)\\\` to pass the actual Entity. The asterisk dereferences: it reads the value at the address.\n\n## Elite Insight\n\nPointer iteration and index iteration compile to the same machine code in optimized builds. The value is not performance — it is mental model. When you think in pointers, you think in memory layout. That is the foundation for SoA transforms, custom allocators, and every optimization that matters at scale.\n\n## Cross-Path Echo\n\nDatabase cursors work the same way. A cursor points at the current row and advances forward. The abstraction is identical: a movable reference into a contiguous data set. Pointers are the original cursor.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

int main() {
    const int COUNT = 4;
    Entity entities[COUNT] = {
        {"ship", "player", 180, 300, 24, 24, 100, true},
        {"alien1", "enemy", 100, 40, 22, 22, 30, true},
        {"alien2", "enemy", 200, 40, 22, 22, 30, true},
        {"bullet", "bullet", 200, 280, 6, 6, 1, true}
    };

    // TODO: Create Entity* ptr and Entity* end
    // TODO: Iterate with pointer, render alive entities, accumulate totalHP

    // TODO: Print GAME_MESSAGE|Total HP: X
    // TODO: Print SCORE|0

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

int main() {
    const int COUNT = 4;
    Entity entities[COUNT] = {
        {"ship", "player", 180, 300, 24, 24, 100, true},
        {"alien1", "enemy", 100, 40, 22, 22, 30, true},
        {"alien2", "enemy", 200, 40, 22, 22, 30, true},
        {"bullet", "bullet", 200, 280, 6, 6, 1, true}
    };

    int totalHP = 0;
    Entity* ptr = entities;
    Entity* end = entities + COUNT;
    for (; ptr != end; ptr++) {
        if (ptr->alive) {
            renderEntity(*ptr);
            totalHP += ptr->hp;
        }
    }

    cout << "GAME_MESSAGE|Total HP: " << totalHP << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render ship via pointer iteration", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should render alien1 via pointer", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g3", description: "Should render alien2 via pointer", expectedOutput: "ENTITY\\|alien2\\|enemy\\|200\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Should render bullet via pointer", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|280\\|6\\|6\\|1", isPattern: true },
    { id: "g5", description: "Should show accumulated total HP", expectedOutput: "GAME_MESSAGE\\|Total HP: 161", isPattern: true },
    { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Start with `Entity* ptr = entities;` and `Entity* end = entities + COUNT;` to set up pointer bounds.",
    "Use `ptr->alive` and `ptr->hp` to access members through the pointer. Render with `renderEntity(*ptr)`.",
    "Total HP = 100 + 30 + 30 + 1 = 161. Make sure you check `ptr->alive` before accumulating.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 12;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
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

// Lesson 26: Pointer-based entity iteration
int main() {
    const int COUNT = 4;
    Entity entities[COUNT] = {
        {"ship", "player", 180, 300, 24, 24, 100, true},
        {"alien1", "enemy", 100, 40, 22, 22, 30, true},
        {"alien2", "enemy", 200, 40, 22, 22, 30, true},
        {"bullet", "bullet", 200, 280, 6, 6, 1, true}
    };
    int totalHP = 0;
    Entity* ptr = entities;
    Entity* end = entities + COUNT;
    for (; ptr != end; ptr++) {
        if (ptr->alive) {
            renderEntity(*ptr);
            totalHP += ptr->hp;
        }
    }
    cout << "GAME_MESSAGE|Total HP: " << totalHP << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
