import type { Lesson } from "@/types/lesson";

export const lesson26: Lesson = {
  id: "26-pointers-data-access",
  title: "Pointers as Data Access",
  description: "Use pointers to iterate through entity arrays in hot loops.",
  order: 26,
  xpReward: 150,
  tier: "pro",
  concepts: ["pointer arithmetic", "array decay", "direct memory access", "hot loop optimization"],
  part1: {
    title: "Concept: Pointers as Data Access",
    type: "concept",
    instructions: `# Pointers as Data Access

Arrays and pointers are deeply connected in C++. When you write \\\`array[i]\\\`, the compiler translates it to \\\`*(array + i)\\\`. The bracket syntax is just convenience — underneath, it is pointer arithmetic.

## Why This Matters

A pointer is a variable that holds a memory address. When you have an array of data, a pointer can walk through that array element by element. This is how every high-performance loop works internally.

## Array Decay

When you pass an array to a function, it "decays" into a pointer to its first element:
\\\`\\\`\\\`
int scores[5] = {10, 20, 30, 40, 50};
int* ptr = scores;  // ptr points to scores[0]
\\\`\\\`\\\`

Now \\\`ptr\\\` holds the address of \\\`scores[0]\\\`. Adding 1 to the pointer moves it to the next element: \\\`*(ptr + 1)\\\` is the same as \\\`scores[1]\\\`.

## Pointer Arithmetic with Arrays

You can iterate an array with a pointer instead of an index:
\\\`\\\`\\\`
int* p = scores;
for (int i = 0; i < 5; i++) {
    cout << *(p + i) << endl;
}
\\\`\\\`\\\`

Or even simpler — increment the pointer itself:
\\\`\\\`\\\`
int* end = scores + 5;
for (int* p = scores; p != end; p++) {
    cout << *p << endl;
}
\\\`\\\`\\\`

## Pointers to Struct Members

If you have a pointer to a struct, use \\\`->\\\` to access members:
\\\`\\\`\\\`
struct Player { string name; int hp; };
Player p = {"Hero", 100};
Player* ptr = &p;
cout << ptr->name;  // same as (*ptr).name
\\\`\\\`\\\`

## Your Task
1. Create an array of 4 int scores: 10, 25, 30, 15
2. Use a pointer to iterate through the array and sum all scores
3. Print each score as you go: \\\`"Score: X"\\\`
4. Print the total: \\\`"Total: 80"\\\`
5. Create a struct \\\`Player\\\` with \\\`name\\\` (string) and \\\`hp\\\` (int)
6. Create a Player, point to it, and print its name and hp using \\\`->\\\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define Player struct with name and hp

int main() {
    int scores[4] = {10, 25, 30, 15};

    // Create a pointer to the start of scores
    // Loop through with pointer arithmetic, print each score
    // Accumulate the total

    // Print total

    // Create a Player struct instance
    // Create a pointer to the player
    // Print name and hp using -> operator

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Player {
    string name;
    int hp;
};

int main() {
    int scores[4] = {10, 25, 30, 15};

    int total = 0;
    int* ptr = scores;
    for (int i = 0; i < 4; i++) {
        cout << "Score: " << *(ptr + i) << endl;
        total += *(ptr + i);
    }
    cout << "Total: " << total << endl;

    Player hero = {"Ace", 100};
    Player* pHero = &hero;
    cout << "Player: " << pHero->name << " HP: " << pHero->hp << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should print first score", expectedOutput: "Score: 10\n" },
      { id: "t2", description: "Should print all scores and total", expectedOutput: "Score: 10\nScore: 25\nScore: 30\nScore: 15\nTotal: 80\n" },
      { id: "t3", description: "Should print player via pointer", expectedOutput: "Player: Ace HP: 100", isPattern: true },
    ],
    hints: [
      "Start with `int* ptr = scores;` — the array name decays to a pointer to element 0.",
      "Use `*(ptr + i)` to access element i. Add each value to a running total.",
      "For the Player pointer: `Player* pHero = &hero;` then use `pHero->name` and `pHero->hp`.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Pointer-Based Entity Processing",
    type: "game_builder",
    instructions: `# Game Builder: Pointer-Based Entity Processing

Now apply pointer arithmetic to your space shooter entity array. Instead of \\\`entities[i].hp\\\`, you will write \\\`ptr->hp\\\`. Same data, same result — but you are now speaking the language the hardware actually uses.

## Your Task
1. Use the Entity struct and entity array from previous lessons
2. Create 4 entities: ship, alien1, alien2, bullet — all alive
3. Write a pointer loop that iterates the array using \\\`Entity* ptr\\\`
4. In the loop, for each alive entity, accumulate total HP
5. Render each alive entity using the game protocol
6. Print \\\`GAME_MESSAGE|Total HP: X\\\` where X is the sum
7. Print \\\`SCORE|0\\\`

Expected output should render all 4 entities and show Total HP: 191 (100 + 30 + 30 + 1 = 161... wait: ship=100, alien1=30, alien2=30, bullet=1 => 161). Total HP: 161.`,
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

    // Use Entity* pointer to iterate the array
    // For each alive entity: render it and accumulate total HP

    // Print GAME_MESSAGE with total HP
    // Print SCORE|0

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
      { id: "g1", description: "Should render ship via pointer", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
      { id: "g2", description: "Should render alien1 via pointer", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g3", description: "Should render alien2 via pointer", expectedOutput: "ENTITY\\|alien2\\|enemy\\|200\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g4", description: "Should render bullet via pointer", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|280\\|6\\|6\\|1", isPattern: true },
      { id: "g5", description: "Should show total HP of all entities", expectedOutput: "GAME_MESSAGE\\|Total HP: 161", isPattern: true },
      { id: "g6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "Start with `Entity* ptr = entities;` — the array decays to a pointer to the first Entity.",
      "Use `ptr->alive` and `ptr->hp` to access members. Increment with `ptr++`.",
      "Total HP = 100 + 30 + 30 + 1 = 161. Pass `*ptr` (dereferenced) to renderEntity.",
    ],
    estimatedMinutes: 8,
  },
};
