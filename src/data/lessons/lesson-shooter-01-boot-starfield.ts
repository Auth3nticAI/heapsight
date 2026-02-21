import { Lesson } from "@/types/lesson";

export const lessonShooter1: Lesson = {
  id: "shooter-01-boot-starfield",
  title: "Boot Starfield",
  description: "Your first program \u2014 a spaceship on a starfield. You\'ll learn how programs work by making something you can see.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["#include", "main()", "cout", "DrawRectangle"],
  part1: {
    title: "Concept: Your First Program",
    type: "concept",
    instructions: `# Boot Starfield

## Mental Model
Think of a program like a recipe. The computer reads it top to bottom, one line at a time, and does exactly what each line says. Your first recipe will tell the computer: \"Print a message.\" Then later, you\'ll use that same idea to draw a spaceship on screen.

## What Breaks Without This
Without \`#include\`, the computer doesn\'t know what \`cout\` means \u2014 like trying to cook without knowing what \"saut\u00e9\" means. Without \`main()\`, the computer doesn\'t know where to start reading.

## The Fix: Program Structure
Every C++ program has the same skeleton:

\`#include <iostream>\` \u2014 This tells the computer \"I want to use input/output tools\" (like \`cout\` for printing).

\`using namespace std;\` \u2014 This is a shortcut so you can write \`cout\` instead of the longer \`std::cout\`. Think of it as a nickname.

\`int main()\` \u2014 This is the front door. The computer always starts here. Everything between the \`{\` and \`}\` after \`main()\` is your program.

\`cout << \"Hello\" << endl;\` \u2014 This prints text to the console. \`<<\` means \"send this text to the screen.\" \`endl\` means \"go to a new line.\"

Click Run now with just one cout line. Do you see your text in the output? That\'s your code talking to you.

## Key Concepts
- \`#include\` loads tools your program needs
- \`main()\` is where every program starts
- \`cout\` prints text to the console
- Every statement ends with a semicolon \`;\`
- \`endl\` starts a new line

## Your Task
Write a program that prints three lines:
\`\`\`
Ship: READY
Stars: 12
Engines: ON
\`\`\`

When all 3 green checkmarks appear, you\'ve passed. Click Submit to move on.

## Beginner Trap
**Forgetting the semicolon at the end of a line.** Every \`cout\` line needs one!

Wrong: \`cout << \"Hello\" << endl\`
Right: \`cout << \"Hello\" << endl;\`

## Elite Insight
John Carmack\'s first programs at age 14 were exactly like this \u2014 simple output to prove the computer does what you say. Every game engine in history started with \"does it print something?\"

## Systems Thinking Connection
In the Robotics path, robots print sensor readings to the console. Same \`cout\`, different context.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print \"Ship: READY\"
    // TODO: Print \"Stars: 12\"
    // TODO: Print \"Engines: ON\"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << \"Ship: READY\" << endl;
    cout << \"Stars: 12\" << endl;
    cout << \"Engines: ON\" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints ship status", expectedOutput: "Ship: READY", isPattern: false },
      { id: "t2", description: "Prints star count", expectedOutput: "Stars: 12", isPattern: false },
      { id: "t3", description: "Prints engine status", expectedOutput: "Engines: ON", isPattern: false },
    ],
    hints: [
      "Use cout << \"text\" << endl; to print a line. Don\'t forget the semicolon!",
      "You need three separate cout lines \u2014 one for Ship, one for Stars, one for Engines.",
      "cout << \"Ship: READY\" << endl; \u2014 that\'s the exact format for the first line.",
    ],
    estimatedMinutes: 5
  },
  part2: {
    title: "Build: Boot Starfield",
    type: "game_builder",
    instructions: `# Build: Boot Starfield

## Mental Model
You just learned to print text. Now let\'s see something amazing \u2014 a game window with a spaceship. The code below already creates the window, draws stars, and runs a game loop. Your job is small: add THREE lines to make the ship appear and put your name on it.

## What\'s Already Here
Look at the code on the right. Don\'t panic \u2014 you don\'t need to understand every line yet. Here\'s what matters:
- \`InitWindow(800, 450, \"HeapSight Shooter\")\` creates the game window
- \`while (!WindowShouldClose())\` keeps the game running (the \"game loop\")
- \`BeginDrawing()\` / \`EndDrawing()\` is like picking up and putting down a paintbrush
- The stars are already drawn as tiny white dots

You\'ll learn what each piece does over the next few lessons. Right now, just focus on the three TODOs.

## Your Task
Find the three TODO comments in the code and fill them in:

1. **TODO 1:** Print the ship position to the console (for the test system)
   \`cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;\`

2. **TODO 2:** Draw the ship as a green rectangle
   \`DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);\`

3. **TODO 3:** Draw the title text on screen
   \`DrawText(\"HeapSight Shooter\", 10, 10, 20, WHITE);\`

That\'s it. Three lines. Click Run and watch your spaceship appear.

## Did It Work?
You should see:
- A green rectangle near the bottom of a black screen
- White dots (stars) scattered across the background
- \"HeapSight Shooter\" text in the top-left corner
- The console shows \"Ship: (380, 420)\"

If you see all four, you just made a video game screen. In the next lesson, you\'ll learn how to move that ship.

## Beginner Trap
**Putting your DrawRectangle AFTER EndDrawing().** Everything you draw must go between \`BeginDrawing()\` and \`EndDrawing()\` \u2014 think of them as picking up and putting down a paintbrush. Draw after you put down the brush? Nothing happens.

## Elite Insight
This is the same structure as Doom\'s main loop from 1993. Clear screen, draw everything, repeat 60 times per second. John Carmack\'s million-line engine and your 30-line program share the same heartbeat.`,
    starterCode: `#include <iostream>
#include \"raylib.h\"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;

// Ship \u2014 bottom center
int ship_x = 380;
int ship_y = 420;
int ship_w = 40;
int ship_h = 20;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    // TODO 1: Print the ship position for the test system
    // cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    cout << \"Stars: \" << star_count << endl;
    cout << \"Screen: \" << SCREEN_W << \"x\" << SCREEN_H << endl;

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(BLACK);

        // Stars already drawn for you
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

        // TODO 2: Draw the ship as a green rectangle
        // DrawRectangle(ship_x, ship_y, ship_w, ship_h, GREEN);

        // TODO 3: Draw the title text
        // DrawText(\"HeapSight Shooter\", 10, 10, 20, WHITE);

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

// Ship \u2014 bottom center
int ship_x = 380;
int ship_y = 420;
int ship_w = 40;
int ship_h = 20;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    cout << \"Stars: \" << star_count << endl;
    cout << \"Screen: \" << SCREEN_W << \"x\" << SCREEN_H << endl;

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
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (380, 420)", isPattern: false },
      { id: "g2", description: "Prints star count", expectedOutput: "Stars: 12", isPattern: false },
      { id: "g3", description: "Prints screen dimensions", expectedOutput: "Screen: 800x450", isPattern: false },
    ],
    hints: [
      "Find TODO 1 near the top. Remove the // at the start of the cout line to uncomment it.",
      "Find TODO 2 inside the game loop. Remove the // from the DrawRectangle line. This draws your ship.",
      "Find TODO 3 right below TODO 2. Remove the // from the DrawText line.",
    ],
    estimatedMinutes: 8
  }
};
