import { Lesson } from "@/types/lesson";

export const lessonRPG00: Lesson = {
  id: "rpg-00-test-wasm",
  title: "WASM Pipeline Test",
  description: "Test lesson to verify the WASM compilation pipeline works end-to-end.",
  order: 0,
  xpReward: 10,
  tier: "free",
  concepts: ["wasm test", "raylib basics", "cout"],
  part1: {
    title: "Concept: WASM Pipeline Smoke Test",
    type: "concept",
    instructions: `# WASM Pipeline Test

## Purpose
This lesson exists solely to verify the WASM compilation pipeline works. Part 1 tests basic cout output via JSCPP. Part 2 tests the full raylib WASM flow.

## Your Task
Print the player position and tile size to verify cout works.

Expected output:
\`\`\`
Player: (5, 5)
Tile size: 32
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int px = 5, py = 5;
    int tile_size = 32;

    // TODO: Print "Player: (5, 5)"
    // TODO: Print "Tile size: 32"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int px = 5, py = 5;
    int tile_size = 32;

    cout << "Player: (" << px << ", " << py << ")" << endl;
    cout << "Tile size: " << tile_size << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "t2", description: "Prints tile size", expectedOutput: "Tile size: 32", isPattern: false },
    ],
    hints: [
      "Use cout with << to print. Remember to include endl.",
      "cout << \"Player: (\" << px << \", \" << py << \")\" << endl;",
    ],
    estimatedMinutes: 3
  },
  part2: {
    title: "Build: WASM Raylib Canvas Test",
    type: "game_builder",
    instructions: `# Build: WASM Raylib Canvas Test

## Purpose
Verify the full WASM/raylib pipeline: compilation, canvas rendering, and cout capture.

## Your Task
Create a raylib window that draws a green square at (5,5) tile position. Print player position and tile size to cout so the test harness can verify output.

Expected cout output:
\`\`\`
Player: (5, 5)
Tile size: 32
\`\`\``,
    starterCode: `#include "raylib.h"
#include <iostream>
using namespace std;

int main() {
    InitWindow(640, 640, "WASM Test");
    SetTargetFPS(60);

    int px = 5, py = 5;
    int tile_size = 32;

    // TODO: Print "Player: (5, 5)" using cout
    // TODO: Print "Tile size: 32" using cout

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(px * tile_size, py * tile_size, tile_size, tile_size, GREEN);
        DrawText("WASM Pipeline Test", 10, 10, 20, GRAY);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include "raylib.h"
#include <iostream>
using namespace std;

int main() {
    InitWindow(640, 640, "WASM Test");
    SetTargetFPS(60);

    int px = 5, py = 5;
    int tile_size = 32;

    cout << "Player: (" << px << ", " << py << ")" << endl;
    cout << "Tile size: " << tile_size << endl;

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(px * tile_size, py * tile_size, tile_size, tile_size, GREEN);
        DrawText("WASM Pipeline Test", 10, 10, 20, GRAY);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints tile size", expectedOutput: "Tile size: 32", isPattern: false },
    ],
    hints: [
      "Use cout << to print values. Remember endl for a newline.",
      "Print before the game loop so the output appears immediately on load.",
    ],
    estimatedMinutes: 5
  }
};
