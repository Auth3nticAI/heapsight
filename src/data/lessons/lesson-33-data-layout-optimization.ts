import type { Lesson } from "@/types/lesson";

export const lesson33: Lesson = {
  id: "33-data-layout-optimization",
  title: "Data Layout Optimization",
  description: "Understand sizeof, alignof, and padding to pack data efficiently.",
  order: 33,
  xpReward: 150,
  tier: "pro",
  concepts: ["sizeof", "alignof", "struct padding", "data alignment", "cache efficiency", "SoA vs AoS"],
  part1: {
    title: "Concept: Data Layout Optimization",
    type: "concept",
    instructions: `# Data Layout Optimization

\\\`sizeof\\\` tells you how many bytes a type occupies. For primitives it is straightforward: \\\`char\\\` = 1, \\\`int\\\` = 4, \\\`double\\\` = 8. But structs have a surprise — **padding**.

## The Padding Problem

The compiler inserts invisible bytes between struct members to satisfy alignment requirements. An \\\`int\\\` must be aligned to a 4-byte boundary. If a \\\`char\\\` comes before it, the compiler adds 3 bytes of padding:

\\\`\\\`\\\`
struct Bad {
    char a;    // 1 byte + 3 padding
    int b;     // 4 bytes
    char c;    // 1 byte + 3 padding
};
// sizeof(Bad) = 12, not 6!
\\\`\\\`\\\`

## The Fix: Reorder Members

Put larger members first, or group same-sized members together:

\\\`\\\`\\\`
struct Good {
    int b;     // 4 bytes
    char a;    // 1 byte
    char c;    // 1 byte + 2 padding
};
// sizeof(Good) = 8, saved 4 bytes!
\\\`\\\`\\\`

## Why It Matters

If you have 10,000 entities, the Bad layout wastes 40KB. That is cache lines filled with padding bytes instead of real data. Fewer cache misses = faster iteration.

## Your Task
1. Define \\\`struct BadLayout\\\` with members: \\\`char a\\\`, \\\`int b\\\`, \\\`char c\\\`
2. Define \\\`struct GoodLayout\\\` with members: \\\`int b\\\`, \\\`char a\\\`, \\\`char c\\\`
3. Define \\\`struct Mixed\\\` with members: \\\`char x\\\`, \\\`double y\\\`, \\\`char z\\\`
4. Define \\\`struct Packed\\\` with members: \\\`double y\\\`, \\\`char x\\\`, \\\`char z\\\`
5. Print sizeof each struct: \\\`"sizeof(BadLayout) = X"\\\` etc.
6. Print the savings: \\\`"Savings: X bytes per struct"\\\``,
    starterCode: `#include <iostream>
using namespace std;

// Define BadLayout: char a, int b, char c

// Define GoodLayout: int b, char a, char c

// Define Mixed: char x, double y, char z

// Define Packed: double y, char x, char z

int main() {
    // Print sizeof for each struct
    // Print savings between Bad and Good
    // Print savings between Mixed and Packed

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct BadLayout {
    char a;
    int b;
    char c;
};

struct GoodLayout {
    int b;
    char a;
    char c;
};

struct Mixed {
    char x;
    double y;
    char z;
};

struct Packed {
    double y;
    char x;
    char z;
};

int main() {
    cout << "sizeof(BadLayout) = " << sizeof(BadLayout) << endl;
    cout << "sizeof(GoodLayout) = " << sizeof(GoodLayout) << endl;
    cout << "sizeof(Mixed) = " << sizeof(Mixed) << endl;
    cout << "sizeof(Packed) = " << sizeof(Packed) << endl;

    int saving1 = sizeof(BadLayout) - sizeof(GoodLayout);
    int saving2 = sizeof(Mixed) - sizeof(Packed);
    cout << "Savings: " << saving1 << " bytes per struct" << endl;
    cout << "Savings: " << saving2 << " bytes per struct" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show BadLayout is 12 bytes", expectedOutput: "sizeof(BadLayout) = 12\n" },
      { id: "t2", description: "Should show GoodLayout is 8 bytes", expectedOutput: "sizeof(GoodLayout) = 8\n" },
      { id: "t3", description: "Should show Mixed is 24 bytes", expectedOutput: "sizeof(Mixed) = 24\n" },
      { id: "t4", description: "Should show Packed is 16 bytes", expectedOutput: "sizeof(Packed) = 16\n" },
      { id: "t5", description: "Should show first savings", expectedOutput: "Savings: 4 bytes per struct", isPattern: true },
      { id: "t6", description: "Should show second savings", expectedOutput: "Savings: 8 bytes per struct", isPattern: true },
    ],
    hints: [
      "`sizeof` returns the total size including padding. `char` = 1, `int` = 4, `double` = 8.",
      "Padding aligns each member to its natural alignment. `int` aligns to 4, `double` aligns to 8.",
      "BadLayout: 1 + 3pad + 4 + 1 + 3pad = 12. GoodLayout: 4 + 1 + 1 + 2pad = 8. Mixed: 1 + 7pad + 8 + 1 + 7pad = 24. Packed: 8 + 1 + 1 + 6pad = 16.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Data Layout for Entities",
    type: "game_builder",
    instructions: `# Game Builder: AoS vs SoA Layout

Compare two ways to lay out your entity data in memory. Array of Structs (AoS) puts all fields of one entity together. Struct of Arrays (SoA) puts all X positions together, all Y positions together, all HP values together.

## Your Task
1. Define an \\\`EntityAoS\\\` struct with \\\`int x, y, hp; bool alive;\\\`
2. Print \\\`sizeof(EntityAoS)\\\` and calculate total for 100 entities
3. Define SoA parallel arrays: \\\`int x[MAX], y[MAX], hp[MAX]; bool alive[MAX];\\\`
4. Calculate total SoA size for the movement-relevant data (x + y only)
5. Run a movement system on SoA arrays — just increment \\\`x[i]\\\` and \\\`y[i]\\\` for alive entities
6. Print layout comparison and render 3 entities from SoA data

Expected output:
\\\`\\\`\\\`
LAYOUT|AoS|entity_size|16
LAYOUT|AoS|total_100|1600
LAYOUT|SoA|movement_data|800
LAYOUT|SoA|all_data|1300
ENTITY|ship|player|181|301|24|24|100
ENTITY|alien1|enemy|101|41|22|22|30
ENTITY|alien2|enemy|201|41|22|22|30
GAME_MESSAGE|SoA movement touches 800 bytes vs AoS 1600 bytes
SCORE|0
\\\`\\\`\\\``,
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
      { id: "g1", description: "Should show AoS entity size", expectedOutput: "LAYOUT\\|AoS\\|entity_size\\|16", isPattern: true },
      { id: "g2", description: "Should show AoS total for 100", expectedOutput: "LAYOUT\\|AoS\\|total_100\\|1600", isPattern: true },
      { id: "g3", description: "Should show SoA movement data size", expectedOutput: "LAYOUT\\|SoA\\|movement_data\\|800", isPattern: true },
      { id: "g4", description: "Should show SoA all data size", expectedOutput: "LAYOUT\\|SoA\\|all_data\\|1300", isPattern: true },
      { id: "g5", description: "Should render ship after movement", expectedOutput: "ENTITY\\|ship\\|player\\|181\\|301\\|24\\|24\\|100", isPattern: true },
      { id: "g6", description: "Should render alien1 after movement", expectedOutput: "ENTITY\\|alien1\\|enemy\\|101\\|41\\|22\\|22\\|30", isPattern: true },
      { id: "g7", description: "Should show comparison message", expectedOutput: "GAME_MESSAGE\\|SoA movement touches 800 bytes vs AoS 1600 bytes", isPattern: true },
      { id: "g8", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "`sizeof(EntityAoS)` includes padding. With 3 ints (12 bytes) and 1 bool (1 byte), alignment pads to 16.",
      "SoA movement data = `sizeof(int) * MAX * 2` = 800 bytes. Only x and y arrays are touched by the movement system.",
      "After adding 1 to x and y: ship goes from (180,300) to (181,301), alien1 from (100,40) to (101,41).",
    ],
    estimatedMinutes: 10,
  },
};
