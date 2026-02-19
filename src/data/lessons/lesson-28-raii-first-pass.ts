import type { Lesson } from "@/types/lesson";

export const lesson28: Lesson = {
  id: "28-raii-first-pass",
  title: "RAII First Pass",
  description: "Fix memory leaks with destructors and scope-based ownership.",
  order: 28,
  xpReward: 150,
  tier: "pro",
  concepts: ["RAII", "destructor", "scope ownership", "automatic cleanup", "constructor"],
  part1: {
    title: "Concept: RAII First Pass",
    type: "concept",
    instructions: `# RAII First Pass

RAII stands for Resource Acquisition Is Initialization. It is the single most important pattern in C++. The idea: tie resource ownership to object lifetime. The constructor acquires (allocates). The destructor releases (frees). When the object goes out of scope, the destructor runs automatically.

## The Problem

Manual \\\`new\\\`/\\\`delete\\\` pairing is fragile:
\\\`\\\`\\\`
int* data = new int[100];
// ... 50 lines of code ...
// Did you remember to delete[]?
\\\`\\\`\\\`

If any code path returns early, throws an exception, or just forgets — leak.

## The RAII Solution

Wrap the resource in a class. Constructor allocates. Destructor frees.
\\\`\\\`\\\`
class IntBuffer {
    int* data;
    int size;
public:
    IntBuffer(int n) {
        data = new int[n];
        size = n;
        cout << "Allocated " << n << " ints" << endl;
    }
    ~IntBuffer() {
        delete[] data;
        cout << "Freed " << size << " ints" << endl;
    }
};
\\\`\\\`\\\`

Now use it in a scope:
\\\`\\\`\\\`
{
    IntBuffer buf(100);  // constructor runs — allocates
}  // destructor runs automatically — frees
\\\`\\\`\\\`

No manual \\\`delete\\\`. No leak. The scope owns the resource.

## Seeing the Lifecycle

Add print statements to constructors and destructors to see exactly when they run:
\\\`\\\`\\\`
Constructor called  // when object is created
Destructor called   // when object leaves scope
\\\`\\\`\\\`

## Your Task
1. Create a \\\`Buffer\\\` class with a \\\`int* data\\\` member and \\\`int size\\\` member
2. Constructor takes an int \\\`n\\\`, allocates \\\`new int[n]\\\`, stores size, prints \\\`"Buffer created: N ints"\\\`
3. Destructor calls \\\`delete[] data\\\` and prints \\\`"Buffer destroyed: N ints"\\\`
4. In main, create a Buffer of size 5 inside a block scope \\\`{ }\\\`
5. Print \\\`"Before scope"\\\` and \\\`"After scope"\\\` to show the lifecycle
6. Print \\\`"No leaks!"\\\` at the end`,
    starterCode: `#include <iostream>
using namespace std;

// Define Buffer class with:
//   int* data
//   int size
//   Constructor: allocates new int[n], prints message
//   Destructor: delete[] data, prints message

int main() {
    cout << "Before scope" << endl;

    // Create a block scope with { }
    // Inside: create Buffer of size 5

    cout << "After scope" << endl;
    cout << "No leaks!" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

class Buffer {
public:
    int* data;
    int size;

    Buffer(int n) {
        data = new int[n];
        size = n;
        cout << "Buffer created: " << size << " ints" << endl;
    }

    ~Buffer() {
        delete[] data;
        cout << "Buffer destroyed: " << size << " ints" << endl;
    }
};

int main() {
    cout << "Before scope" << endl;

    {
        Buffer buf(5);
    }

    cout << "After scope" << endl;
    cout << "No leaks!" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show lifecycle in order", expectedOutput: "Before scope\nBuffer created: 5 ints\nBuffer destroyed: 5 ints\nAfter scope\nNo leaks!\n" },
    ],
    hints: [
      "The constructor signature is `Buffer(int n)`. Inside: `data = new int[n]; size = n;`",
      "The destructor is `~Buffer()`. Inside: `delete[] data;` and print the destroyed message.",
      "Create the Buffer inside `{ Buffer buf(5); }` — the braces create a scope. Destructor fires at `}`.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: RAII Entity Pool",
    type: "game_builder",
    instructions: `# Game Builder: RAII Entity Pool

Fix the leak from lesson 27. Instead of raw \\\`new\\\`/\\\`delete\\\` calls scattered through your code, wrap the entity array in a class. Constructor allocates. Destructor frees. Scope handles the rest.

## Your Task
1. Create an \\\`EntityPool\\\` class with a constructor that allocates an \\\`Entity*\\\` array with \\\`new\\\`
2. Constructor prints \\\`"Pool created: N slots"\\\` and increments allocCount
3. Add a \\\`spawn\\\` method that writes an entity into the next available slot
4. Add a \\\`render\\\` method that prints all alive entities
5. Destructor calls \\\`delete[]\\\` on the array, increments deleteCount, prints \\\`"Pool destroyed: N slots"\\\`
6. In main, create an EntityPool inside a block scope
7. Spawn ship (100hp), alien1 (30hp), alien2 (30hp), bullet (1hp)
8. Render all entities
9. Let the pool go out of scope — destructor fires
10. Print \\\`GAME_MESSAGE|Allocs: 1 Deletes: 1 Leaks: 0\\\`
11. Print \\\`SCORE|0\\\`

One allocation, one deallocation, zero leaks. RAII solved it.`,
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
//   Entity* entities (pointer to heap array)
//   int capacity
//   int count
//   Constructor: allocates new Entity[cap], prints message, allocCount++
//   spawn method: fills next slot
//   render method: prints alive entities
//   Destructor: delete[] entities, prints message, deleteCount++

int main() {
    // TODO: Create EntityPool in a block scope
    // TODO: Spawn 4 entities, render them
    // Pool goes out of scope here — destructor auto-fires

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
      { id: "g1", description: "Should print pool creation message", expectedOutput: "Pool created: 8 slots", isPattern: true },
      { id: "g2", description: "Should render ship from pool", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
      { id: "g3", description: "Should render alien1 from pool", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g4", description: "Should render alien2 from pool", expectedOutput: "ENTITY\\|alien2\\|enemy\\|200\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g5", description: "Should render bullet from pool", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|280\\|6\\|6\\|1", isPattern: true },
      { id: "g6", description: "Should print pool destruction message", expectedOutput: "Pool destroyed: 8 slots", isPattern: true },
      { id: "g7", description: "Should show zero leaks", expectedOutput: "GAME_MESSAGE\\|Allocs: 1 Deletes: 1 Leaks: 0", isPattern: true },
      { id: "g8", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "The constructor is `EntityPool(int cap)`. Inside: `entities = new Entity[cap]; capacity = cap; count = 0; allocCount++;`",
      "The `spawn` method writes into `entities[count]` and increments count. The `render` method loops 0 to count.",
      "The destructor `~EntityPool()` calls `delete[] entities; deleteCount++;`. Create the pool inside `{ }` braces so scope triggers cleanup.",
    ],
    estimatedMinutes: 12,
  },
};
