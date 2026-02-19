import type { GameLessonVariant } from "@/types/game";

export const lesson33SpaceShooter: GameLessonVariant = {
  lessonId: "33-data-layout-optimization",
  instructions: `# Data Layout — Your Movement System Reads 2x the Bytes It Needs

Your entity struct packs x, y, hp, alive, id, type, width, height into one block. The movement system only needs x and y. But because all fields sit in the same cache line, every load pulls hp, alive, and the rest into L1 with it. You are paying for data you do not use. SoA fixes this.

## What Breaks Without This

Array of Structs means the movement hot path loads 16 bytes per entity to read 8 bytes of position data. At 10,000 entities per frame, that is 80KB of wasted bandwidth. The CPU fetches 64-byte cache lines. Each line holds 4 AoS entities but only 8 useful position bytes per entity. SoA puts all x values contiguous — one cache line holds 16 x positions. Pure signal, no noise.

## The Fix

SoA — Struct of Arrays. Instead of \\\`Entity entities[N]\\\` where each Entity holds x, y, hp, alive, you declare \\\`int x[N]\\\`, \\\`int y[N]\\\`, \\\`int hp[N]\\\`, \\\`bool alive[N]\\\`. The movement system iterates x[] and y[] only. Two tight arrays. Sequential memory access. The prefetcher predicts the pattern perfectly.

\\\`sizeof(EntityAoS)\\\` reveals the cost. Three ints and a bool should be 13 bytes, but alignment pads it to 16. Multiply by 100 entities: 1600 bytes total. SoA movement data is \\\`sizeof(int) * 100 * 2\\\` = 800 bytes. Half the memory touched. Same result. The data flow is identical — the layout is not.

## Your Task

1. Define \\\`EntityAoS\\\` with \\\`int x, y, hp; bool alive;\\\` — print \\\`sizeof\\\` and total for 100
2. Declare SoA parallel arrays: \\\`int x[100], y[100], hp[100]; bool alive[100];\\\`
3. Initialize 3 entities: ship at (180,300,100hp), alien1 at (100,40,30hp), alien2 at (200,40,30hp)
4. Calculate and print SoA movement data size (x + y arrays only) and total data size
5. Run movement system: increment x and y by 1 for alive entities
6. Render 3 entities from SoA data after movement
7. Print comparison: SoA movement bytes vs AoS total bytes

## Beginner Trap

**Common Mistake:** Assuming \\\`sizeof(EntityAoS)\\\` is 13 (3*4 + 1). The compiler aligns the struct to the largest member's alignment — 4 bytes for \\\`int\\\`. So \\\`bool alive\\\` at offset 12 gets 3 bytes of padding, making the struct 16 bytes. Always measure with \\\`sizeof\\\`, never assume.

## Elite Insight

SoA is not universally better. If you always access all fields of one entity (like serialization), AoS has better locality. The optimization depends on the access pattern. Movement reads x and y. Rendering reads x, y, width, height. Damage reads hp. Profile first. Then pick the layout that matches your hottest loop.

## Cross-Path Echo

Columnar databases (Parquet, Arrow) are SoA for SQL. Row stores are AoS. The same tradeoff exists everywhere data is stored and iterated: optimize for the query pattern, not the storage convenience.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 100;

// Define EntityAoS struct: int x, y, hp; bool alive;

int main() {
    // Print sizeof(EntityAoS) and total for 100 entities

    // Define SoA arrays: x[MAX], y[MAX], hp[MAX], alive[MAX]
    // Initialize first 3 entities

    // Calculate SoA sizes: movement data (x+y), all data (x+y+hp+alive)

    // Run movement: add 1 to x and y for alive entities (first 3)

    // Render 3 entities from SoA data

    // Print comparison message
    // Print SCORE|0

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 100;

struct EntityAoS {
    int x, y, hp;
    bool alive;
};

int main() {
    int aosSize = sizeof(EntityAoS);
    int aosTotal = aosSize * MAX;
    cout << "LAYOUT|AoS|entity_size|" << aosSize << endl;
    cout << "LAYOUT|AoS|total_100|" << aosTotal << endl;

    int x[MAX];
    int y[MAX];
    int hp[MAX];
    bool alive[MAX];
    string ids[] = {"ship", "alien1", "alien2"};
    string types[] = {"player", "enemy", "enemy"};
    int widths[] = {24, 22, 22};
    int heights[] = {24, 22, 22};

    for (int i = 0; i < MAX; i++) {
        alive[i] = false;
    }

    x[0] = 180; y[0] = 300; hp[0] = 100; alive[0] = true;
    x[1] = 100; y[1] = 40;  hp[1] = 30;  alive[1] = true;
    x[2] = 200; y[2] = 40;  hp[2] = 30;  alive[2] = true;

    int soaMovement = sizeof(int) * MAX * 2;
    int soaAll = sizeof(int) * MAX * 3 + sizeof(bool) * MAX;
    cout << "LAYOUT|SoA|movement_data|" << soaMovement << endl;
    cout << "LAYOUT|SoA|all_data|" << soaAll << endl;

    for (int i = 0; i < 3; i++) {
        if (alive[i]) {
            x[i] += 1;
            y[i] += 1;
        }
    }

    for (int i = 0; i < 3; i++) {
        if (alive[i]) {
            cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
                 << x[i] << "|" << y[i] << "|" << widths[i] << "|" << heights[i]
                 << "|" << hp[i] << endl;
        }
    }

    cout << "GAME_MESSAGE|SoA movement touches " << soaMovement << " bytes vs AoS " << aosTotal << " bytes" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should show AoS entity size of 16", expectedOutput: "LAYOUT\\|AoS\\|entity_size\\|16", isPattern: true },
    { id: "g2", description: "Should show AoS total for 100 entities", expectedOutput: "LAYOUT\\|AoS\\|total_100\\|1600", isPattern: true },
    { id: "g3", description: "Should show SoA movement data size", expectedOutput: "LAYOUT\\|SoA\\|movement_data\\|800", isPattern: true },
    { id: "g4", description: "Should show SoA total data size", expectedOutput: "LAYOUT\\|SoA\\|all_data\\|1300", isPattern: true },
    { id: "g5", description: "Should render ship after +1 movement", expectedOutput: "ENTITY\\|ship\\|player\\|181\\|301\\|24\\|24\\|100", isPattern: true },
    { id: "g6", description: "Should render alien1 after +1 movement", expectedOutput: "ENTITY\\|alien1\\|enemy\\|101\\|41\\|22\\|22\\|30", isPattern: true },
    { id: "g7", description: "Should render alien2 after +1 movement", expectedOutput: "ENTITY\\|alien2\\|enemy\\|201\\|41\\|22\\|22\\|30", isPattern: true },
    { id: "g8", description: "Should show byte comparison message", expectedOutput: "GAME_MESSAGE\\|SoA movement touches 800 bytes vs AoS 1600 bytes", isPattern: true },
    { id: "g9", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "`sizeof(EntityAoS)` is 16 because the bool gets padded to align the struct to 4-byte boundary. 3 ints (12) + bool (1) + 3 padding = 16.",
    "SoA movement data = `sizeof(int) * MAX * 2` = 800. Only x[] and y[] are needed for movement. SoA all data = `sizeof(int) * MAX * 3 + sizeof(bool) * MAX` = 1300.",
    "Initialize arrays directly: `x[0] = 180; y[0] = 300; hp[0] = 100; alive[0] = true;` for each entity. After +1 movement, ship is at (181, 301).",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 100;

struct EntityAoS {
    int x, y, hp;
    bool alive;
};

int main() {
    int aosSize = sizeof(EntityAoS);
    int aosTotal = aosSize * MAX;
    cout << "LAYOUT|AoS|entity_size|" << aosSize << endl;
    cout << "LAYOUT|AoS|total_100|" << aosTotal << endl;
    int x[MAX];
    int y[MAX];
    int hp[MAX];
    bool alive[MAX];
    string ids[] = {"ship", "alien1", "alien2"};
    string types[] = {"player", "enemy", "enemy"};
    int widths[] = {24, 22, 22};
    int heights[] = {24, 22, 22};
    for (int i = 0; i < MAX; i++) {
        alive[i] = false;
    }
    x[0] = 180; y[0] = 300; hp[0] = 100; alive[0] = true;
    x[1] = 100; y[1] = 40;  hp[1] = 30;  alive[1] = true;
    x[2] = 200; y[2] = 40;  hp[2] = 30;  alive[2] = true;
    int soaMovement = sizeof(int) * MAX * 2;
    int soaAll = sizeof(int) * MAX * 3 + sizeof(bool) * MAX;
    cout << "LAYOUT|SoA|movement_data|" << soaMovement << endl;
    cout << "LAYOUT|SoA|all_data|" << soaAll << endl;
    for (int i = 0; i < 3; i++) {
        if (alive[i]) {
            x[i] += 1;
            y[i] += 1;
        }
    }
    for (int i = 0; i < 3; i++) {
        if (alive[i]) {
            cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
                 << x[i] << "|" << y[i] << "|" << widths[i] << "|" << heights[i]
                 << "|" << hp[i] << endl;
        }
    }
    cout << "GAME_MESSAGE|SoA movement touches " << soaMovement << " bytes vs AoS " << aosTotal << " bytes" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
