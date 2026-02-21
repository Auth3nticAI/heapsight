import { Lesson } from "@/types/lesson";

export const lessonShooter3: Lesson = {
  id: "shooter-03-ship-moves",
  title: "Ship Moves",
  description: "Make your ship respond to arrow keys — learn how if-statements let your program make decisions.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["if", "IsKeyDown", "conditionals"],
  part1: {
    title: "Concept: If-Statements Make Decisions",
    type: "concept",
    instructions: `# Ship Moves

## Mental Model
An if-statement is a question with a yes/no answer. \"Is the direction equal to 1?\" If yes, do something. If no, skip it. Your program uses if-statements to decide what to do next.

## What Breaks Without This
Without if-statements, your program does the same thing every time. The ship would always go right, or always go left. It could never react to what the player does. If-statements let your program respond to different situations.

## The Fix: If-Statements
An if-statement has two parts:

\`if (condition)\` — the question. This goes inside parentheses. It must be something that\'s either true or false.

\`{ code }\` — what happens if the answer is yes. This code only runs when the condition is true.

Example:
\`\`\`
if (direction == 1) {
    cout << \"Moving RIGHT\" << endl;
}
\`\`\`

Notice the \`==\` with TWO equals signs. This ASKS \"is direction equal to 1?\" One equals sign \`=\` SETS a value (like \`int x = 5\`). Two equals signs \`==\` CHECKS a value.

You can also change a variable inside an if-statement:
\`\`\`
if (direction == 1) {
    ship_x = ship_x + speed;
}
\`\`\`

This adds \`speed\` to \`ship_x\` — but ONLY if \`direction\` is 1. If direction were 0 or 2 or anything else, the code inside would be skipped.

Click Run after writing your first if-statement. Do you see \"Moving RIGHT\" in the output? That means the condition was true!

## Key Concepts
- \`if (condition) { code }\` runs the code only when the condition is true
- \`==\` checks if two values are equal (two equals signs)
- \`=\` sets a value (one equals sign) — don\'t mix them up!
- Code inside \`{ }\` only runs when the condition is true
- You can change variables inside an if-statement

## Your Task
The starter code gives you three variables: \`direction\` (set to 1), \`ship_x\` (set to 200), and \`speed\` (set to 5). Write if-statements to produce this output:
\`\`\`
Direction: right
Moving RIGHT
ship_x is now: 205
\`\`\`

When all 3 green checkmarks appear, you\'ve passed. Click Submit to move on.

## Beginner Trap
**Using = instead of == in the condition.** \`if (direction = 1)\` SETS direction to 1 (always true). \`if (direction == 1)\` CHECKS if it equals 1. Always use two equals signs in if-statement conditions.

Wrong: \`if (direction = 1)\` (sets, always true)
Right: \`if (direction == 1)\` (checks)

## Elite Insight
Every game ever made uses if-statements for input. Doom\'s movement code from 1993 is essentially \`if (key_pressed) player_x += speed;\` — the same pattern you\'re learning now.

## Systems Thinking Connection
In the Robotics path, if-statements check sensor readings: \`if (distance < 10) stop();\` Same structure, different data.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int direction = 1;
    int ship_x = 200;
    int speed = 5;

    cout << \"Direction: right\" << endl;

    // TODO: Write an if-statement: if (direction == 1)
    //       Inside it, print \"Moving RIGHT\"

    // TODO: Write another if-statement: if (direction == 1)
    //       Inside it, add speed to ship_x: ship_x = ship_x + speed;
    // TODO: After the if-statement, print \"ship_x is now: \" followed by ship_x

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int direction = 1;
    int ship_x = 200;
    int speed = 5;

    cout << \"Direction: right\" << endl;

    if (direction == 1) {
        cout << \"Moving RIGHT\" << endl;
    }

    if (direction == 1) {
        ship_x = ship_x + speed;
    }
    cout << \"ship_x is now: \" << ship_x << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints direction", expectedOutput: "Direction: right", isPattern: false },
      { id: "t2", description: "Prints movement", expectedOutput: "Moving RIGHT", isPattern: false },
      { id: "t3", description: "Prints updated position", expectedOutput: "ship_x is now: 205", isPattern: false },
    ],
    hints: [
      "An if-statement looks like: if (condition) { code }",
      "The condition checks if direction equals 1: if (direction == 1) { cout << \"Moving RIGHT\" << endl; }",
      "To change ship_x: ship_x = ship_x + speed; Then print it after the closing }",
    ],
    estimatedMinutes: 5
  },
  part2: {
    title: "Build: Ship Moves",
    type: "game_builder",
    instructions: `# Build: Ship Moves

## Mental Model
You just learned that if-statements check conditions and run code when they\'re true. Now you\'ll use them to make your ship respond to arrow keys. The game loop runs 60 times per second — each time, your if-statements check \"is the player pressing RIGHT?\" and if so, move the ship.

## What\'s Already Here
The code on the right is your game from Lesson 2 — a starfield with your ship at position (200, 300). Everything works, but the ship just sits there. It can\'t move because there\'s no code to check for key presses.

Look for the two commented-out if-statements inside the game loop. They use a raylib function called \`IsKeyDown()\` that returns true when a key is being held down.

A new variable \`speed\` has been added at the top — it controls how many pixels the ship moves per frame.

## Your Task
Find the three TODO comments and complete them:

1. **TODO 1:** Uncomment the line that moves the ship right: remove the \`//\` from \`if (IsKeyDown(KEY_RIGHT)) ship_x += speed;\`
2. **TODO 2:** Uncomment the line that moves the ship left: remove the \`//\` from \`if (IsKeyDown(KEY_LEFT)) ship_x -= speed;\`
3. **TODO 3:** Uncomment the cout line that shows the controls

Click Run. Now press the RIGHT arrow key. See that? You\'re flying a spaceship with code you wrote.

## Did It Work?
You should see:
- Press RIGHT — your ship slides to the right
- Press LEFT — your ship slides to the left
- The console shows \"Controls: LEFT/RIGHT\"

You just taught your game to respond to input! The ship moves because \`IsKeyDown(KEY_RIGHT)\` returns true when you hold the arrow key, and the if-statement adds \`speed\` to \`ship_x\` every frame.

Notice the ship can fly off the edges of the screen. We\'ll fix that in the next lesson.

## Beginner Trap
**Uncommenting only half the line.** Make sure you remove the \`//\` from the very beginning of the line, including the space after it. The entire if-statement should be active code, not a comment.

## Elite Insight
The \`+=\` operator is a shortcut. \`ship_x += speed\` means \`ship_x = ship_x + speed\`. John Carmack used this shorthand in every id Software engine. Once you\'re comfortable, it saves typing and is easier to read.`,
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
    // TODO 3: Uncomment the line below to show the controls
    // cout << \"Controls: LEFT/RIGHT\" << endl;
    cout << \"Speed: \" << speed << endl;

    while (!WindowShouldClose()) {
        // TODO 1: Uncomment to move ship right when RIGHT arrow is pressed
        // if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        // TODO 2: Uncomment to move ship left when LEFT arrow is pressed
        // if (IsKeyDown(KEY_LEFT)) ship_x -= speed;

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
    cout << \"Controls: LEFT/RIGHT\" << endl;
    cout << \"Speed: \" << speed << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;

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
      { id: "g2", description: "Prints controls", expectedOutput: "Controls: LEFT/RIGHT", isPattern: false },
      { id: "g3", description: "Prints speed", expectedOutput: "Speed: 5", isPattern: false },
    ],
    hints: [
      "Find TODO 1. Remove the // at the start of the if (IsKeyDown(KEY_RIGHT)) line.",
      "Find TODO 2. Remove the // at the start of the if (IsKeyDown(KEY_LEFT)) line.",
      "Find TODO 3. Remove the // at the start of the cout line to uncomment it.",
    ],
    estimatedMinutes: 8
  }
};
