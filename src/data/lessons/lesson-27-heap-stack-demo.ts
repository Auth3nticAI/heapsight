import type { Lesson } from "@/types/lesson";

export const lesson27: Lesson = {
  id: "27-heap-stack-demo",
  title: "Heap vs Stack",
  description: "Understand where memory lives and what happens when you leak it.",
  order: 27,
  xpReward: 150,
  tier: "pro",
  concepts: ["stack allocation", "heap allocation", "new operator", "memory leak", "allocation counter"],
  part1: {
    title: "Concept: Heap vs Stack",
    type: "concept",
    instructions: `# Heap vs Stack

Every variable you create lives somewhere in memory. There are two places: the stack and the heap. Understanding the difference is fundamental to writing correct C++ programs.

## The Stack

Stack variables are created automatically when you declare them in a function. They are destroyed automatically when the function returns. No manual cleanup required.

\\\`\\\`\\\`
void example() {
    int x = 42;        // stack — automatic
    Player p = {"Ace", 100};  // stack — automatic
}  // x and p are destroyed here
\\\`\\\`\\\`

## The Heap

Heap variables are created with \\\`new\\\` and live until you explicitly call \\\`delete\\\`. If you forget \\\`delete\\\`, the memory is leaked — it stays allocated but inaccessible.

\\\`\\\`\\\`
Player* p = new Player{"Ace", 100};  // heap — manual
// use p...
delete p;  // you MUST do this
\\\`\\\`\\\`

## Memory Leaks

A memory leak happens when you allocate with \\\`new\\\` but never call \\\`delete\\\`. The memory is consumed but never returned to the system. In a game running at 60fps, leaking one object per frame means thousands of leaked objects per minute.

## Tracking Allocations

You can use simple counters to detect leaks:
\\\`\\\`\\\`
int allocCount = 0;
int deleteCount = 0;

// On every new: allocCount++
// On every delete: deleteCount++
// At the end: if (allocCount != deleteCount) => LEAK
\\\`\\\`\\\`

## Your Task
1. Define a struct \\\`Item\\\` with \\\`name\\\` (string) and \\\`value\\\` (int)
2. Create an Item on the stack and print it
3. Create an Item on the heap with \\\`new\\\`, increment allocCount, print it
4. Create a second heap Item, increment allocCount, print it
5. Delete only the first heap item, increment deleteCount
6. Print allocCount, deleteCount, and leaks (allocCount - deleteCount)

The second heap item is intentionally never deleted — this is a leak.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int allocCount = 0;
int deleteCount = 0;

// Define Item struct with name and value

int main() {
    // Create stack Item, print it

    // Create first heap Item with new, allocCount++, print it

    // Create second heap Item with new, allocCount++, print it

    // Delete only the first heap item, deleteCount++

    // Print: "Allocations: X"
    // Print: "Deallocations: X"
    // Print: "Leaks: X"

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int allocCount = 0;
int deleteCount = 0;

struct Item {
    string name;
    int value;
};

int main() {
    Item stackItem = {"Shield", 50};
    cout << "Stack: " << stackItem.name << " worth " << stackItem.value << endl;

    Item* heapItem1 = new Item{"Sword", 100};
    allocCount++;
    cout << "Heap: " << heapItem1->name << " worth " << heapItem1->value << endl;

    Item* heapItem2 = new Item{"Potion", 25};
    allocCount++;
    cout << "Heap: " << heapItem2->name << " worth " << heapItem2->value << endl;

    delete heapItem1;
    deleteCount++;

    cout << "Allocations: " << allocCount << endl;
    cout << "Deallocations: " << deleteCount << endl;
    cout << "Leaks: " << allocCount - deleteCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should print stack item", expectedOutput: "Stack: Shield worth 50\n" },
      { id: "t2", description: "Should print heap items", expectedOutput: "Heap: Sword worth 100\nHeap: Potion worth 25\n" },
      { id: "t3", description: "Should show allocation counts and leak", expectedOutput: "Allocations: 2\nDeallocations: 1\nLeaks: 1\n" },
    ],
    hints: [
      "Stack: `Item stackItem = {\"Shield\", 50};` Heap: `Item* heapItem = new Item{\"Sword\", 100};`",
      "Access heap item members with `->`: `heapItem->name`. Don't forget `allocCount++` after each `new`.",
      "Delete with `delete heapItem1; deleteCount++;`. Leaks = allocCount - deleteCount = 2 - 1 = 1.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Memory Leak Detection",
    type: "game_builder",
    instructions: `# Game Builder: Memory Leak Detection

Apply heap allocation to your game entities. Spawn enemies with \\\`new\\\`, track every allocation, and watch what happens when you forget to clean up. This lesson intentionally leaks — lesson 28 will fix it.

## Your Task
1. Define the Entity struct and global counters (allocCount, deleteCount)
2. Write \\\`spawnEntity\\\` that uses \\\`new\\\` to create an Entity on the heap, increments allocCount, and returns the pointer
3. Spawn 4 entities: ship, alien1, alien2, bullet
4. Render all 4 entities
5. "Destroy" alien2 and bullet (delete them, increment deleteCount)
6. Print remaining alive entities
7. Print \\\`GAME_MESSAGE|Allocs: 4 Deletes: 2 Leaks: 2\\\`
8. Print \\\`SCORE|0\\\`

Two entities are deleted, two are leaked. This is broken on purpose.`,
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

// TODO: Write spawnEntity function that uses new and increments allocCount

int main() {
    // TODO: Spawn 4 entities on the heap using spawnEntity

    // TODO: Render all entities

    // TODO: Delete alien2 and bullet, increment deleteCount each time

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
      { id: "g1", description: "Should render ship from heap", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
      { id: "g2", description: "Should render alien1 from heap", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g3", description: "Should render alien2 before deletion", expectedOutput: "ENTITY\\|alien2\\|enemy\\|200\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g4", description: "Should render bullet before deletion", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|280\\|6\\|6\\|1", isPattern: true },
      { id: "g5", description: "Should show allocation tracking with leaks", expectedOutput: "GAME_MESSAGE\\|Allocs: 4 Deletes: 2 Leaks: 2", isPattern: true },
      { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "`spawnEntity` should call `new Entity{...}`, increment `allocCount`, and return the pointer.",
      "Render all 4 entities first, then delete alien2 and bullet. Each delete needs `deleteCount++`.",
      "Leaks = allocCount - deleteCount = 4 - 2 = 2. Ship and alien1 are never freed — intentional.",
    ],
    estimatedMinutes: 10,
  },
};
