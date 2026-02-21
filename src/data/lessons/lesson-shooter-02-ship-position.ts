import { Lesson } from "@/types/lesson";

export const lessonShooter2: Lesson = {
  id: "shooter-02-ship-position",
  title: "Ship Position",
  description: "Move your ship by changing variable values — learn how numbers control what you see on screen.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["int", "variables", "assignment"],
  part1: {
    title: "Concept: Variables Store Numbers",
    type: "concept",
    instructions: `# Ship Position

## Mental Model
Think of a variable like a labeled box. You write a name on the box and put a number inside. \`int ship_x = 200;\` means: \"Make a box called ship_x and put 200 in it.\" Whenever your program needs that number, it looks inside the box.

## What Breaks Without This
Without variables, you\'d have to type the same number everywhere. Want to move the ship from 380 to 200? You\'d have to find and change every 380 in your entire program. With a variable, you change it in one place.

## The Fix: Variables
A variable has three parts:

\`int\` — the type. This tells the computer \"this box holds a whole number.\" (int is short for integer — a number without a decimal point.)

\`ship_x\` — the name. You choose this. It should describe what the number means.

\`= 200\` — the starting value. The number you put in the box.

Put it together: \`int ship_x = 200;\`

You just created a variable! Now \`ship_x\` means 200 anywhere in your program.

You can print a variable\'s value:
\`cout << \"ship_x: \" << ship_x << endl;\`

This prints: ship_x: 200

Notice how \`ship_x\` is NOT in quotes. Text in quotes prints exactly as-is. A variable name without quotes prints the NUMBER inside the box.

Click Run with just one variable and one cout line. Do you see the number in the output? That\'s your variable working.

## Key Concepts
- \`int\` creates a variable that holds a whole number
- \`=\` puts a value into the variable
- Variable names should describe what they store
- \`cout\` can print variables — not just text in quotes
- Text in quotes prints literally; variable names print their value

## Your Task
Create two variables — \`ship_x\` set to 200 and \`ship_y\` set to 300. Print three lines:
\`\`\`
ship_x: 200
ship_y: 300
Ship at: (200, 300)
\`\`\`

The third line combines both variables. Use:
\`cout << \"Ship at: (\" << ship_x << \", \" << ship_y << \")\" << endl;\`

When all 3 green checkmarks appear, you\'ve passed. Click Submit to move on.

## Beginner Trap
**Putting the variable name in quotes.** If you write \`cout << \"ship_x\"\`, it prints the text \"ship_x\", not the number 200. To print the number, leave off the quotes: \`cout << ship_x\`.

Wrong: \`cout << \"ship_x: \" << \"ship_x\" << endl;\` (prints \"ship_x: ship_x\")
Right: \`cout << \"ship_x: \" << ship_x << endl;\` (prints \"ship_x: 200\")

## Elite Insight
In Doom (1993), the player\'s position was stored in exactly this kind of variable — x and y coordinates that changed every frame. John Carmack didn\'t start with 3D math. He started with \`int player_x = 0;\`.

## Systems Thinking Connection
In the Platformer path, the player\'s jump height is stored in a variable called jump_velocity. Same idea — a named number that controls how the game feels.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Create a variable called ship_x and set it to 200
    //       int ship_x = 200;
    // TODO: Create a variable called ship_y and set it to 300
    //       int ship_y = 300;
    // TODO: Print \"ship_x: \" followed by the value of ship_x
    // TODO: Print \"ship_y: \" followed by the value of ship_y
    // TODO: Print \"Ship at: (200, 300)\" using ship_x and ship_y

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int ship_x = 200;
    int ship_y = 300;

    cout << \"ship_x: \" << ship_x << endl;
    cout << \"ship_y: \" << ship_y << endl;
    cout << \"Ship at: (\" << ship_x << \", \" << ship_y << \")\" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints ship_x value", expectedOutput: "ship_x: 200", isPattern: false },
      { id: "t2", description: "Prints ship_y value", expectedOutput: "ship_y: 300", isPattern: false },
      { id: "t3", description: "Prints ship position", expectedOutput: "Ship at: (200, 300)", isPattern: false },
    ],
    hints: [
      "A variable declaration looks like: int name = value; Try: int ship_x = 200;",
      "To print a variable: cout << \"ship_x: \" << ship_x << endl;",
      "For the last line: cout << \"Ship at: (\" << ship_x << \", \" << ship_y << \")\" << endl;",
    ],
    estimatedMinutes: 5
  },
  part2: {
    title: "Build: Ship Position",
    type: "game_builder",
    instructions: `# Build: Ship Position

## Mental Model
You just learned that variables store numbers. Now you\'ll see those numbers in action — they control WHERE your ship appears on screen. Change the numbers, the ship moves.

## What\'s Already Here
Look at the code on the right. It\'s your game from Lesson 1 — a starfield with a green ship. Near the top, you\'ll see:
- \`int ship_x = 380;\` — the ship\'s left-right position
- \`int ship_y = 420;\` — the ship\'s up-down position
- \`int ship_w = 40;\` and \`int ship_h = 20;\` — the ship\'s width and height

The \`DrawRectangle\` line uses these variables to know where to draw the ship. Change the variables, and the ship moves to a new spot.

## Your Task
Find the three TODO comments and complete them:

1. **TODO 1:** Change \`ship_x = 380\` to \`ship_x = 200\` — this moves the ship to the left
2. **TODO 2:** Change \`ship_y = 420\` to \`ship_y = 300\` — this moves the ship higher
3. **TODO 3:** Uncomment the Size cout line by removing the \`//\` at the start

Click Run and watch your ship jump to its new position.

## Did It Work?
You should see:
- Your green ship is higher and more to the left than before
- The console shows \"Ship: (200, 300)\"
- The console shows \"Size: 40x20\"

You moved your ship by changing two numbers. That\'s what variables do — they store numbers that control things. In the next lesson, you\'ll make the ship move WHILE the game is running.

## Beginner Trap
**Changing the wrong number.** Make sure you change the number AFTER the \`=\` sign, not the variable name. \`int ship_x = 200;\` is correct. \`int 200 = ship_x;\` won\'t work.

## Elite Insight
Every object in every video game has position variables. In Unity, they\'re called transform.position.x and transform.position.y. In Unreal, they\'re FVector.X and FVector.Y. You just learned the same concept used by every game engine.`,
    starterCode: `#include <iostream>
#include \"raylib.h\"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;

// Ship position — these numbers control where the ship appears
// TODO 1: Change 380 to 200 to move the ship left
int ship_x = 380;
// TODO 2: Change 420 to 300 to move the ship higher
int ship_y = 420;
int ship_w = 40;
int ship_h = 20;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    // TODO 3: Uncomment the line below to print the ship size
    // cout << \"Size: \" << ship_w << \"x\" << ship_h << endl;
    cout << \"Stars: \" << star_count << endl;

    while (!WindowShouldClose()) {
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

// Ship position
int ship_x = 200;
int ship_y = 300;
int ship_w = 40;
int ship_h = 20;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    cout << \"Size: \" << ship_w << \"x\" << ship_h << endl;
    cout << \"Stars: \" << star_count << endl;

    while (!WindowShouldClose()) {
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
      { id: "g2", description: "Prints ship size", expectedOutput: "Size: 40x20", isPattern: false },
    ],
    hints: [
      "Find TODO 1 near the top. Change the number 380 to 200.",
      "Find TODO 2 right below TODO 1. Change the number 420 to 300.",
      "Find TODO 3. Remove the // at the start of the cout line to uncomment it.",
    ],
    estimatedMinutes: 8
  }
};
