import { Lesson } from "@/types/lesson";

export const lessonShooter5: Lesson = {
  id: "shooter-05-first-bullet",
  title: "First Bullet",
  description: "Fire a bullet with the spacebar — learn how bool variables track on/off state.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: ["bool", "true/false", "IsKeyPressed"],
  part1: {
    title: "Concept: Bool Tracks On/Off State",
    type: "concept",
    instructions: `# First Bullet

## Mental Model
A \`bool\` is a light switch. It\'s either ON (\`true\`) or OFF (\`false\`). Your bullet is either flying through space (true) or sitting in the ship waiting to be fired (false). There\'s no in-between.

## What Breaks Without This
Without a bool to track whether the bullet is active, you\'d have no way to know: should I draw the bullet this frame? Should I move it? Should I let the player fire another one? A bool gives your game a simple answer: yes or no.

## The Fix: Bool Variables
A bool variable works like the int variables you already know, but it can only hold two values:

\`bool bullet_active = false;\` — the bullet starts inactive (OFF)

You can change it:
\`bullet_active = true;\` — now the bullet is active (ON)

And you can check it with an if-statement:
\`\`\`
if (bullet_active) {
    // This code only runs when bullet_active is true
    bullet_y = bullet_y - 8;
}
\`\`\`

Notice you don\'t need \`== true\`. Just \`if (bullet_active)\` is enough — it already asks \"is this true?\"

The \`!\` operator means \"not.\" So \`!bullet_active\` means \"is the bullet NOT active?\" This is useful for firing: you can only fire when the bullet is NOT already flying.

Click Run after setting bullet_active to true. Do you see \"Firing!\"? The switch flipped!

## Key Concepts
- \`bool\` holds \`true\` or \`false\` — nothing else
- Set it with \`=\`: \`bullet_active = true;\`
- Check it with \`if (bullet_active)\` — no \`==\` needed
- \`!\` means \"not\": \`!bullet_active\` is true when bullet_active is false
- Bools track state: is something active? Is it alive? Is it visible?

## Your Task
The starter code creates a bool \`bullet_active\` set to false and an int \`bullet_y\` set to 300. Write code to produce this output:
\`\`\`
bullet_active: false
Firing!
bullet_active: true
bullet_y: 292
\`\`\`

When all 4 green checkmarks appear, you\'ve passed. Click Submit to move on.

## Beginner Trap
**Writing \`bool bullet_active = true;\` a second time instead of \`bullet_active = true;\`.** The first time you create a variable, you use \`bool\` (that\'s the declaration). After that, you just use the name — no \`bool\` keyword. \`bool\` in front means \"create a new variable,\" which would shadow the original.

Wrong: \`bool bullet_active = true;\` (creates a NEW variable)
Right: \`bullet_active = true;\` (changes the existing one)

## Elite Insight
In Galaga (1981), bullets had an \"active\" flag — exactly a bool. When the player fired, one bullet\'s flag flipped to active. When it left the screen, the flag flipped back. This pattern hasn\'t changed in 45 years of game development.

## Systems Thinking Connection
In the RPG path, bools track whether items are equipped, quests are complete, and doors are unlocked. Same true/false pattern, different game.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    bool bullet_active = false;
    int bullet_y = 300;

    cout << \"bullet_active: false\" << endl;

    // TODO: Set bullet_active to true
    // TODO: Print \"Firing!\"
    // TODO: Print \"bullet_active: true\"
    // TODO: Subtract 8 from bullet_y (bullet_y = bullet_y - 8)
    //       Then print \"bullet_y: \" followed by bullet_y

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    bool bullet_active = false;
    int bullet_y = 300;

    cout << \"bullet_active: false\" << endl;

    bullet_active = true;
    cout << \"Firing!\" << endl;
    cout << \"bullet_active: true\" << endl;

    bullet_y = bullet_y - 8;
    cout << \"bullet_y: \" << bullet_y << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints initial state", expectedOutput: "bullet_active: false", isPattern: false },
      { id: "t2", description: "Prints firing message", expectedOutput: "Firing!", isPattern: false },
      { id: "t3", description: "Prints active state", expectedOutput: "bullet_active: true", isPattern: false },
      { id: "t4", description: "Prints bullet position", expectedOutput: "bullet_y: 292", isPattern: false },
    ],
    hints: [
      "To change a bool: bullet_active = true; (no bool keyword the second time)",
      "Print each line with cout: cout << \"Firing!\" << endl;",
      "Subtract 8: bullet_y = bullet_y - 8; Then: cout << \"bullet_y: \" << bullet_y << endl;",
    ],
    estimatedMinutes: 5
  },
  part2: {
    title: "Build: First Bullet",
    type: "game_builder",
    instructions: `# Build: First Bullet

## Mental Model
You just learned that bools track on/off state. Now you\'ll use a bool called \`bullet_active\` to build a weapon system. When the player presses SPACE, the bullet activates. Each frame, it moves upward. When it flies off the top of the screen, it deactivates — ready to fire again.

## What\'s Already Here
The code on the right is your game from Lesson 4 — the ship moves left and right, clamped to the screen edges. New bullet variables have been added at the top:
- \`int bullet_x, bullet_y\` — the bullet\'s position
- \`int bullet_w = 4, bullet_h = 10\` — the bullet\'s size (a small narrow rectangle)
- \`bool bullet_active = false\` — starts inactive, waiting to be fired

The ship movement, bounds checking, stars, and HUD are all in place. You just need to add the bullet behavior.

## Your Task
Find the three TODO comments and complete them:

1. **TODO 1 — Fire the bullet:**
   Write an if-statement that checks two things: \`IsKeyPressed(KEY_SPACE)\` AND \`!bullet_active\`.
   \`IsKeyPressed\` triggers once per press (unlike \`IsKeyDown\` which repeats every frame).
   Inside: set \`bullet_x\` to the center of the ship (\`ship_x + ship_w/2 - bullet_w/2\`), set \`bullet_y\` to \`ship_y\`, and set \`bullet_active\` to \`true\`.

2. **TODO 2 — Move the bullet:**
   Write an if-statement: \`if (bullet_active)\`.
   Inside: subtract 8 from \`bullet_y\` (the bullet moves up). Then check if \`bullet_y < -bullet_h\` — if the bullet went off the top of the screen, set \`bullet_active\` back to \`false\`.

3. **TODO 3 — Draw the bullet:**
   Write an if-statement: \`if (bullet_active)\`.
   Inside: use \`DrawRectangle(bullet_x, bullet_y, bullet_w, bullet_h, YELLOW)\` to draw the bullet.

Click Run. Press SPACE. Watch the bullet fly!

## Did It Work?
You should see:
- Press SPACE — a yellow rectangle shoots upward from your ship
- The bullet disappears when it flies off the top
- Press SPACE again — another bullet fires
- You can move the ship with LEFT/RIGHT while shooting

You just built a weapon system! The bool tracks whether the bullet is active. The if-statements control when to fire, when to move, when to draw, and when to deactivate. In the next lesson, you\'ll add enemies to shoot at.

## Beginner Trap
**Using \`IsKeyDown\` instead of \`IsKeyPressed\` for firing.** \`IsKeyDown\` fires EVERY frame the key is held (60 bullets per second!). \`IsKeyPressed\` fires ONCE per press. For shooting, always use \`IsKeyPressed\`.

## Elite Insight
This is an object pool of size 1. In a full game, you\'d have an array of bullets — each with its own position and active flag. We\'ll build that in Lesson 6. But the pattern is identical: fire sets active=true, off-screen sets active=false.`,
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

// Bullet — starts inactive, waiting to be fired
int bullet_x = 0;
int bullet_y = 0;
int bullet_w = 4;
int bullet_h = 10;
bool bullet_active = false;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    cout << \"Bullet: READY\" << endl;
    cout << \"Fire: SPACE\" << endl;

    while (!WindowShouldClose()) {
        // Movement
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;
        if (ship_x < 0) ship_x = 0;
        if (ship_x > SCREEN_W - ship_w) ship_x = SCREEN_W - ship_w;

        // TODO 1: Fire the bullet when SPACE is pressed
        // Use IsKeyPressed(KEY_SPACE) — not IsKeyDown (pressed = once, down = repeating)
        // Only fire if bullet is not already active: if (IsKeyPressed(KEY_SPACE) && !bullet_active)
        // Inside the if: set bullet_x to center of ship (ship_x + ship_w/2 - bullet_w/2)
        //                set bullet_y to ship_y
        //                set bullet_active to true

        // TODO 2: Move the bullet upward each frame
        // If bullet_active is true:
        //   Subtract 8 from bullet_y (bullet_y -= 8)
        //   If bullet_y goes above the screen (bullet_y < -bullet_h), set bullet_active to false

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

        // TODO 3: Draw the bullet when it is active
        // If bullet_active is true, use DrawRectangle to draw it
        // Position: bullet_x, bullet_y  Size: bullet_w, bullet_h  Color: YELLOW

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

// Bullet
int bullet_x = 0;
int bullet_y = 0;
int bullet_w = 4;
int bullet_h = 10;
bool bullet_active = false;

int star_count = 12;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);

    cout << \"Ship: (\" << ship_x << \", \" << ship_y << \")\" << endl;
    cout << \"Bullet: READY\" << endl;
    cout << \"Fire: SPACE\" << endl;

    while (!WindowShouldClose()) {
        // Movement
        if (IsKeyDown(KEY_RIGHT)) ship_x += speed;
        if (IsKeyDown(KEY_LEFT)) ship_x -= speed;
        if (ship_x < 0) ship_x = 0;
        if (ship_x > SCREEN_W - ship_w) ship_x = SCREEN_W - ship_w;

        // Fire
        if (IsKeyPressed(KEY_SPACE) && !bullet_active) {
            bullet_x = ship_x + ship_w/2 - bullet_w/2;
            bullet_y = ship_y;
            bullet_active = true;
        }

        // Bullet movement
        if (bullet_active) {
            bullet_y -= 8;
            if (bullet_y < -bullet_h) bullet_active = false;
        }

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

        // Bullet
        if (bullet_active) DrawRectangle(bullet_x, bullet_y, bullet_w, bullet_h, YELLOW);

        // HUD
        DrawText(\"HeapSight Shooter\", 10, 10, 20, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints ship position", expectedOutput: "Ship: (200, 300)", isPattern: false },
      { id: "g2", description: "Prints bullet status", expectedOutput: "Bullet: READY", isPattern: false },
      { id: "g3", description: "Prints fire control", expectedOutput: "Fire: SPACE", isPattern: false },
    ],
    hints: [
      "For TODO 1: if (IsKeyPressed(KEY_SPACE) && !bullet_active) { bullet_x = ship_x + ship_w/2 - bullet_w/2; bullet_y = ship_y; bullet_active = true; }",
      "For TODO 2: if (bullet_active) { bullet_y -= 8; if (bullet_y < -bullet_h) bullet_active = false; }",
      "For TODO 3: if (bullet_active) DrawRectangle(bullet_x, bullet_y, bullet_w, bullet_h, YELLOW);",
    ],
    estimatedMinutes: 12
  }
};
