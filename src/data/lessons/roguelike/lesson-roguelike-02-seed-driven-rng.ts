import { Lesson } from "@/types/lesson";

export const lessonRoguelike2: Lesson = {
  id: "roguelike-2-seed-driven-rng",
  title: "Seed-Driven RNG",
  description: "Different seed produces a different room position. Same seed produces the same room. Deterministic randomness.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["deterministic RNG", "Lehmer algorithm", "seed-driven generation", "reproducibility"],
  part1: {
    title: "Concept: Deterministic Randomness",
    type: "concept",
    instructions: `# Seed-Driven RNG

## Mental Model
A seed is a starting number. Feed it to a math formula, and it produces a sequence of numbers that LOOK random but are completely predictable. Same seed, same sequence. Always. This is not real randomness — it's a deterministic algorithm that mimics randomness. Every roguelike depends on this.

## What Breaks Without This
If you use `rand()` from `<cstdlib>`, two problems: (1) the dungeon is different every run with no way to reproduce a specific layout, and (2) different platforms produce different sequences from the same seed. Your Roguelike becomes untestable — you can't verify that generation produces the correct dungeon because it's different every time.

## The Fix: Lehmer RNG
The Lehmer algorithm is one line:
```cpp
uint32_t rng_state = 42; // seed
uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}
```

Multiply the state by a prime, mod by 2^31-1. That's it. The output is a number between 1 and 2,147,483,646. To get a number in a range:
```cpp
int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}
```

This gives you a number from `lo` to `hi` inclusive. Same seed produces same sequence of calls produces same results. Change the seed, change the sequence, change the dungeon.

## Key Concepts
- Seed: the starting state of the RNG
- Lehmer algorithm: multiply + modulo produces pseudo-random sequence
- Deterministic: same seed always produces same output
- `rngRange(lo, hi)`: utility to get numbers in a specific range

## Performance Insight
One multiplication + one modulo per random number. That's 2 CPU instructions. Generating an entire dungeon takes maybe 50-100 random numbers — essentially instant. The Lehmer RNG has no branches, no memory access, no cache misses. It's the fastest useful RNG.

## Memory Insight
The entire RNG state is ONE `uint32_t` — 4 bytes. No arrays. No buffers. No heap allocation. The seed lives at file scope, persists for the program's lifetime, and is the ONLY source of randomness in the entire roguelike.

## Your Task
Implement the Lehmer RNG with seed 42. Generate 5 random numbers in range [0, 99] and print them. Then reset the seed to 42 and generate 5 more — they should be identical.

Expected output:
```
Seed: 42
Roll 1: 82
Roll 2: 7
Roll 3: 37
Roll 4: 15
Roll 5: 42
--- Reset seed to 42 ---
Roll 1: 82
Roll 2: 7
Roll 3: 37
Roll 4: 15
Roll 5: 42
```

## Beginner Trap
**Using `rand()` and `srand()` from `<cstdlib>`.** These are platform-dependent — the same seed produces different sequences on Windows vs Linux vs WASM. Your tests will fail on the server. The Lehmer RNG is portable: same formula, same output, everywhere.

## Elite Insight
Spelunky uses a seeded RNG to generate every level. Derek Yu's famous "daily challenge" gives everyone the same seed — same dungeon, same enemy placement, same items. Players compete on the same generated world. Your Lehmer RNG makes this possible. By Lesson 57, you'll implement a daily seed too.

## Systems Thinking Connection
Deterministic RNG is the roguelike equivalent of the RPG's seeded command replay. Both guarantee reproducible behavior from a starting state. The RPG replays commands; the Roguelike replays generation. Same principle: determinism enables testing.

## Skill Reinforcement
Lesson 1 established the dungeon grid. This lesson adds the RNG that all future generation algorithms use. Lesson 3 will use `rngRange()` to randomly position BSP splits.

## Mastery Check
Question: Why use a custom RNG instead of `std::rand()`?
Answer: Portability and reproducibility. `std::rand()` produces different sequences on different platforms. The Lehmer RNG produces identical sequences everywhere because the algorithm is explicitly defined in your code. Same seed, same dungeon, on every machine.`,
    starterCode: `#include <iostream>
using namespace std;

uint32_t rng_state = 42;

// TODO: Implement rngNext()
// Multiply rng_state by 48271u, mod by 0x7fffffffu
// Return rng_state

// TODO: Implement rngRange(int lo, int hi)
// Return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1))

int main() {
    cout << "Seed: " << rng_state << endl;

    for (int i = 1; i <= 5; i++) {
        cout << "Roll " << i << ": " << rngRange(0, 99) << endl;
    }

    // Reset seed
    rng_state = 42;
    cout << "--- Reset seed to 42 ---" << endl;

    for (int i = 1; i <= 5; i++) {
        cout << "Roll " << i << ": " << rngRange(0, 99) << endl;
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}

int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

int main() {
    cout << "Seed: " << rng_state << endl;

    for (int i = 1; i <= 5; i++) {
        cout << "Roll " << i << ": " << rngRange(0, 99) << endl;
    }

    // Reset seed
    rng_state = 42;
    cout << "--- Reset seed to 42 ---" << endl;

    for (int i = 1; i <= 5; i++) {
        cout << "Roll " << i << ": " << rngRange(0, 99) << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints seed value", expectedOutput: "Seed: 42" },
      { id: "t2", description: "First roll is 82", expectedOutput: "Roll 1: 82" },
      { id: "t3", description: "Reset produces same sequence", expectedOutput: "--- Reset seed to 42 ---" },
    ],
    hints: [
      "rngNext() is one line: rng_state = rng_state * 48271u % 0x7fffffffu; then return rng_state.",
      "rngRange() calls rngNext() and uses modulo to constrain the result: lo + (int)(rngNext() % (uint32_t)(hi - lo + 1)).",
      "Make sure both functions are declared BEFORE main(). The rngNext function modifies the global rng_state and returns it. rngRange calls rngNext internally.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Random Room Placement",
    type: "game_builder",
    instructions: `# Build: Random Room Placement

## Mental Model
Instead of hardcoding room position, use the RNG to pick random coordinates. Same seed produces same room position. Different seed produces a different room. This is the first step toward procedural generation: the algorithm decides where the room goes, not the programmer.

## What Breaks Without This
Lesson 1's dungeon has the room at the same position every time. That's not a roguelike — it's a static level. Without random placement, every run is identical. The player has zero reason to replay.

## The Fix: RNG-Driven Room Coordinates
Use `rngRange()` to pick room size first, then position:
```cpp
int room_w = rngRange(4, 10);
int room_h = rngRange(3, 8);
int room_x = rngRange(1, MAP_W - room_w - 1);
int room_y = rngRange(1, MAP_H - room_h - 1);
```

The room is guaranteed to fit within the map bounds (1-cell wall border). Each call to `rngRange()` advances the RNG state, so the sequence is deterministic from the seed. **The ORDER of calls matters** — size before position, width before height.

## Key Concepts
- RNG-driven placement: algorithm decides coordinates
- Bounds checking: room must fit within map with wall border
- Call order matters: same seed + same call order = same results
- cout reports generation results for test verification

## Your Task
Using seed 42, generate a random room with random size and position. Print the seed, room bounds, and floor count. Render with raylib.

Expected cout output (seed 42):
```
Seed: 42
Room: (18,14) size 4x6
Floor tiles: 24
```

**Click Run** to see your randomly-placed room. Change the seed value and run again — the room moves!

## Did It Work?
You should see a dark gray rectangle (room) at a position determined by the seed. If you change `rng_state = 42` to `rng_state = 123` and run again, the room should be in a different position. Change it back to 42 — same position as before.

## Beginner Trap
**Not leaving a wall border.** If `room_x` can be 0, the room touches the left edge and there's no wall. Always constrain: `rngRange(1, MAP_W - room_w - 1)`. The -1 accounts for the right wall border.

## Elite Insight
Nethack generates its famous "Mines" levels by placing rooms at random positions with a minimum spacing constraint. The seed determines everything — room positions, corridor routing, monster placement. Your single random room is the first step toward Nethack-style generation.

## Mastery Check
Question: If two players start with seed 42, will they see the same dungeon?
Answer: Yes, exactly the same. The Lehmer RNG produces identical sequences from the same seed. Both players get the same room position, same room size, same dungeon layout. This is what makes seed-sharing possible in roguelikes.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];
uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}

int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

int main() {
    // Initialize all cells to wall
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            dungeon[y][x] = 0;
        }
    }

    // TODO: Generate random room size using rngRange
    // room_w = rngRange(4, 10)
    // room_h = rngRange(3, 8)
    int room_w = 0;
    int room_h = 0;

    // TODO: Generate random room position (must fit with 1-cell wall border)
    // room_x = rngRange(1, MAP_W - room_w - 1)
    // room_y = rngRange(1, MAP_H - room_h - 1)
    int room_x = 0;
    int room_y = 0;

    // TODO: Carve the room into the dungeon array
    // Set dungeon[y][x] = 1 for the room area

    // Count floor tiles
    int floor_count = 0;
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            if (dungeon[y][x] == 1) floor_count++;
        }
    }

    cout << "Seed: " << 42 << endl;
    cout << "Room: (" << room_x << "," << room_y << ") size " << room_w << "x" << room_h << endl;
    cout << "Floor tiles: " << floor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1) {
                    DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1, DARKGRAY);
                }
            }
        }

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 640;
const int SCREEN_H = 480;
const int MAP_W = 40;
const int MAP_H = 30;
const int TILE_SIZE = 16;

int dungeon[MAP_H][MAP_W];
uint32_t rng_state = 42;

uint32_t rngNext() {
    rng_state = rng_state * 48271u % 0x7fffffffu;
    return rng_state;
}

int rngRange(int lo, int hi) {
    return lo + (int)(rngNext() % (uint32_t)(hi - lo + 1));
}

int main() {
    // Initialize all cells to wall
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            dungeon[y][x] = 0;
        }
    }

    // Generate random room
    int room_w = rngRange(4, 10);
    int room_h = rngRange(3, 8);
    int room_x = rngRange(1, MAP_W - room_w - 1);
    int room_y = rngRange(1, MAP_H - room_h - 1);

    // Carve the room
    for (int y = room_y; y < room_y + room_h; y++) {
        for (int x = room_x; x < room_x + room_w; x++) {
            dungeon[y][x] = 1;
        }
    }

    // Count floor tiles
    int floor_count = 0;
    for (int y = 0; y < MAP_H; y++) {
        for (int x = 0; x < MAP_W; x++) {
            if (dungeon[y][x] == 1) floor_count++;
        }
    }

    cout << "Seed: " << 42 << endl;
    cout << "Room: (" << room_x << "," << room_y << ") size " << room_w << "x" << room_h << endl;
    cout << "Floor tiles: " << floor_count << endl;

    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Roguelike");
    SetTargetFPS(60);

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < MAP_H; y++) {
            for (int x = 0; x < MAP_W; x++) {
                if (dungeon[y][x] == 1) {
                    DrawRectangle(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE - 1, TILE_SIZE - 1, DARKGRAY);
                }
            }
        }

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints seed", expectedOutput: "Seed: 42" },
      { id: "g2", description: "Room position and size", expectedOutput: "Room: (18,14) size 4x6" },
      { id: "g3", description: "Floor tile count", expectedOutput: "Floor tiles: 24" },
    ],
    hints: [
      "Use rngRange to generate room_w, room_h, room_x, room_y in that order. The call order matters for determinism!",
      "room_w = rngRange(4, 10); room_h = rngRange(3, 8); room_x = rngRange(1, MAP_W - room_w - 1); room_y = rngRange(1, MAP_H - room_h - 1);",
      "To carve: for (int y = room_y; y < room_y + room_h; y++) for (int x = room_x; x < room_x + room_w; x++) dungeon[y][x] = 1;",
    ],
    estimatedMinutes: 12,
  },
};