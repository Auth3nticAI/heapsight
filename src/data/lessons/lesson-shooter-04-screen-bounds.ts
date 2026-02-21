import { Lesson } from "@/types/lesson";

export const lessonShooter4: Lesson = {
  id: "shooter-04-screen-bounds",
  title: "Screen Bounds",
  description: "Stop your ship from flying off screen — learn how comparison operators keep things in bounds.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: ["comparison operators", "<", ">", "bounds checking"],
  part1: {
    title: "Concept: Comparison Operators",
    type: "concept",
    instructions: `# Screen Bounds

## Mental Model
A comparison operator asks a simple question: \"Is this number bigger than that number?\" The answer is always yes (true) or no (false). Your game uses these questions to decide: \"Has the ship gone off screen?\"

## What Breaks Without This
Without comparisons, your ship flies off the edge of the screen and never comes back. You need a way to ask \"has ship_x gone below 0?\" and if so, push it back. That\'s what \`<\` and \`>\` are for.

## The Fix: Comparison Operators
\`<\` means \"less than.\" \`5 < 10\` is true. \`10 < 5\` is false.

\`>\` means \"greater than.\" \`10 > 5\` is true. \`5 > 10\` is false.

You can use these inside an if-statement:
\`\`\`
if (position < 0) {
    cout << \"Off screen!\" << endl;
}
\`\`\`

This asks: \"Is position less than 0?\" If yes, it means the ship has gone past the left edge. You can fix it by setting position back to 0:
\`\`\`
if (position < 0) {
    position = 0;
}
\`\`\`

This pattern is called \"clamping\" — you\'re clamping the value so it can\'t go below zero. Think of it like a wall: the number bounces off and stays at 0.

Click Run after writing your first comparison. Do you see \"Off screen: YES\"? That means the condition was true!

## Key Concepts
- \`<\` checks if left side is less than right side
- \`>\` checks if left side is greater than right side
- Comparisons return true or false
- \"Clamping\" means keeping a value within a valid range
- Combine comparisons with if-statements to enforce rules

## Your Task
The starter code has a position variable set to -20 (off screen). Write if-statements to detect this and clamp it:
\`\`\`
5 < 10: true
Position: -20
Off screen: YES
Clamped: 0
\`\`\`

When all 4 green checkmarks appear, you\'ve passed. Click Submit to move on.

## Beginner Trap
**Mixing up < and >.** \`<\` means less than (the small number is on the left). \`>\` means greater than (the big number is on the left). Think of the symbol as an arrow pointing to the smaller number.

## Elite Insight
Every game clamps player position to screen bounds. In the original Space Invaders (1978), the player\'s cannon was clamped to the playfield edges with exactly this kind of comparison. Your two if-statements are doing the same job.

## Systems Thinking Connection
In the Robotics path, comparison operators keep robot arms within safe operating ranges: \`if (angle > max_angle) angle = max_angle;\` Same clamping pattern, critical safety application.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    cout << \"5 < 10: true\" << endl;

    int position = -20;
    cout << \"Position: \" << position << endl;

    // TODO: Write an if-statement: if (position < 0)
    //       Inside it, print \"Off screen: YES\"

    // TODO: Write another if-statement: if (position < 0)
    //       Inside it, set position = 0
    // TODO: After the if-statement, print \"Clamped: \" followed by position

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << \"5 < 10: true\" << endl;

    int position = -20;
    cout << \"Position: \" << position << endl;

    if (position < 0) {
        cout << \"Off screen: YES\" << endl;
    }

    if (position < 0) {
        position = 0;
    }
    cout << \"Clamped: \" << position << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints comparison result", expectedOutput: "5 < 10: true", isPattern: false },
      { id: "t2", description: "Prints position value", expectedOutput: "Position: -20", isPattern: false },
      { id: "t3", description: "Detects off screen", expectedOutput: "Off screen: YES", isPattern: false },
      { id: "t4", description: "Clamps to zero", expectedOutput: "Clamped: 0", isPattern: false },
    ],
    hints: [
      "An if-statement with < looks like: if (position < 0) { ... }",
      "Inside the first if, print: cout << \"Off screen: YES\" << endl;",
      "Inside the second if, set position = 0; Then print Clamped after the closing }",
    ],
    estimatedMinutes: 5
  },
  part2: {
    title: "Build: Screen Bounds",
    type: "game_builder",
    instructions: `# Build: Screen Bounds

## Mental Model
You just learned that comparison operators ask yes/no questions about numbers. Now you\'ll use them to build invisible walls at the edges of the screen. When the ship hits an edge, your if-statements push it back.

## What\'s Already Here
The code on the right is your game from Lesson 3 — the ship moves left and right with arrow keys. But try holding RIGHT for a while — the ship flies right off the screen and disappears! Same with LEFT.

You need two \"walls\":
- **Left wall:** If \`ship_x\` goes below 0, set it back to 0
- **Right wall:** If \`ship_x\` goes past \`SCREEN_W - ship_w\` (800 - 40 = 760), set it back to 760

## Your Task
Find the three TODO comments and complete them:

1. **TODO 1:** After the movement code, write an if-statement that checks if \`ship_x < 0\`. If true, set \`ship_x = 0\`.
2. **TODO 2:** Write another if-statement that checks if \`ship_x > SCREEN_W - ship_w\`. If true, set \`ship_x = SCREEN_W - ship_w\`.
3. **TODO 3:** In the pre-loop section, add a cout line that prints the bounds.

Click Run. Then hold the RIGHT arrow key. Does the ship stop at the edge?

## Did It Work?
You should see:
- Press and hold RIGHT — the ship stops at the right edge
- Press and hold LEFT — the ship stops at the left edge
- The console shows \"Bounds: 0 to 760\"

You built a boundary system with two if-statements and the \`<\` and \`>\` operators. The ship can never escape the screen now.

## Beginner Trap
**Putting the bounds check BEFORE the movement code.** The bounds check must come AFTER \`ship_x += speed\`. If you check first and then move, the ship can still escape by one frame. Always: move first, then clamp.

## Elite Insight
This \"clamp after move\" pattern appears in every game engine. Unity calls it \`Mathf.Clamp()\`. Unreal calls it \`FMath::Clamp()\`. You just wrote the same logic by hand — two if-statements that do what those built-in functions do.`,
    starterCode: `#include <iostream>
#include \"raylib.h\"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;

// Ship
int ship_x = 200;
int ship_y = 300;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    // TODO 3: Print the bounds — cout << \"Bounds: 0 to \" << SCREEN_W - ship_w << endl;
    cout << \"Controls: LEFT/RIGHT\" << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;

        // TODO 1: Stop the ship at the left edge
        // If ship_x < 0, set ship_x back to 0

        // TODO 2: Stop the ship at the right edge
        // The right edge is at SCREEN_W - ship_w (800 - 40 = 760)
        // If ship_x > SCREEN_W - ship_w, set ship_x to SCREEN_W - ship_w

        BeginDrawing();
        ClearBackground(BLACK);

        // Stars
        DrawRectangle(100, 50, 2, 2, WHITE);
        DrawRectangle(200, 120, 2, 2, WHITE);
        DrawRectangle(350, 30, 2, 2, WHITE);
        DrawRectangle(500, 80, 2, 2, WHITE);
        DrawRectangle(650, 150, 2, 2, WHITE);
        DrawRectangle(750, 60, 2, 2, WHITE);
        DrawRectangle(50, 200, 2, 2, WHITE);
        DrawRectangle(300, 250, 2, 2, WHITE);
        DrawRectangle(450, 180, 2, 2, WHITE);
        DrawRectangle(600, 300, 2, 2, WHITE);
        DrawRectangle(150, 350, 2, 2, WHITE);
        DrawRectangle(700, 380, 2, 2, WHITE);

        // Ship
        DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);

        // HUD
        DrawText(\"HeapSight Shooter\", 10, 10, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include \"raylib.h\"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;

// Ship
int ship_x = 200;
int ship_y = 300;
int ship_w = 40;
int ship_h = 20;
int speed = 5;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    cout << \"Bounds: 0 to \" << SCREEN_W - ship_w << endl;
    cout << \"Controls: LEFT/RIGHT\" << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;

        if (ship_x < 0) ship_x = 0;
        if (ship_x > SCREEN_W - ship_w) ship_x = SCREEN_W - ship_w;

        BeginDrawing();
        ClearBackground(BLACK);

        // Stars
        DrawRectangle(100, 50, 2, 2, WHITE);
        DrawRectangle(200, 120, 2, 2, WHITE);
        DrawRectangle(350, 30, 2, 2, WHITE);
        DrawRectangle(500, 80, 2, 2, WHITE);
        DrawRectangle(650, 150, 2, 2, WHITE);
        DrawRectangle(750, 60, 2, 2, WHITE);
        DrawRectangle(50, 200, 2, 2, WHITE);
        DrawRectangle(300, 250, 2, 2, WHITE);
        DrawRectangle(450, 180, 2, 2, WHITE);
        DrawRectangle(600, 300, 2, 2, WHITE);
        DrawRectangle(150, 350, 2, 2, WHITE);
        DrawRectangle(700, 380, 2, 2, WHITE);

        // Ship
        DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);

        // HUD
        DrawText(\"HeapSight Shooter\", 10, 10, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 300)", isPattern: false },
      { id: "g2", description: "Prints bounds", expectedOutput: "Bounds: 0 to 760", isPattern: false },
    ],
    hints: [
      "After the movement lines, write: if (ship_x < 0) ship_x = 0;",
      "Right below that, write: if (ship_x > SCREEN_W - ship_w) ship_x = SCREEN_W - ship_w;",
      "For TODO 3, write: cout << \"Bounds: 0 to \" << SCREEN_W - ship_w << endl;",
    ],
    estimatedMinutes: 10
  }
};
