import { Lesson } from "../../types/lesson";

const lessonPlatformer7: Lesson = {
  id: "platformer-07-air-control",
  title: "Air Control",
  description: "Reduce horizontal acceleration while airborne. Real platformers feel different in the air than on the ground — this is why.",
  order: 7,
  xpReward: 50,
  tier: "free",
  concepts: ["air control", "state-dependent physics", "AIR_ACCEL vs ACCEL", "feel tuning"],
  part1: {
    title: "Concept: State-Dependent Acceleration",
    type: "concept",
    instructions: `# Air Control

## Mental Model
On the ground you have traction — your feet grip the surface. In the air you have nothing to push off of. Real platformers model this by using a lower acceleration constant while airborne. The player can still steer, but more slowly. This is called **air control**.

## Why It Matters
Without air control, your jump trajectory is fully correctable mid-air. That makes the game feel floaty and unpredictable. With reduced air control, the player must commit to a direction before jumping. That creates skill expression — **when** to jump becomes as important as **where** to jump.

## The Pattern
\`\`\`cpp
const float ACCEL     = 600.0f; // ground acceleration
const float AIR_ACCEL = 300.0f; // air acceleration (50% of ground)

// In update loop, pick acceleration based on state:
float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
if (IsKeyDown(KEY_RIGHT)) {
    player_vx += accel * FIXED_DT;
    if (player_vx > MAX_RUN) player_vx = MAX_RUN;
}
\`\`\`

## Key Concepts
- Air control: reduced horizontal acceleration while airborne
- State-dependent physics: the FSM drives which constants apply
- Feel tuning: AIR_ACCEL is a design parameter, not a fixed number
- Committed jumps: low air control forces pre-jump planning

## Your Task
Simulate air control: print ground acceleration and air acceleration, then print whether each is \`GROUNDED\` or \`AIRBORNE\` mode.

## Mastery Check
**Q:** If AIR_ACCEL is 0, what happens?
**A:** The player cannot steer at all in the air. Jump direction is fully locked in at jump time. This is used in some puzzle platformers for precise placement mechanics.

## Beginner Trap
**Applying the same acceleration in the air as on the ground.** Air control should feel lighter — use a reduced acceleration multiplier (0.3-0.5x ground speed). Full ground acceleration in midair makes the character feel like it is ice-skating through the sky.

## Elite Insight
Celeste uses different air-control curves depending on whether the player is rising or falling. The ascending arc has less horizontal control than the descending arc, which makes jumps feel committed but landings feel responsive.

## Systems Thinking Connection
The Shooter does not have air control — ships move freely in all directions. The RPG moves on a grid with no jump. Your air dampening factor is unique to platformers, but the concept of context-dependent movement speed appears in every genre.`,
    starterCode: `#include <iostream>
using namespace std;

const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;

int main() {
    // TODO: Print "Ground accel: 600"
    // TODO: Print "Air accel: 300"
    // TODO: Print "Mode: GROUNDED" (representing ground state)
    // TODO: Print "Mode: AIRBORNE" (representing airborne state)
    // TODO: Print "Air control: active"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;

int main() {
    cout << "Ground accel: " << ACCEL << endl;
    cout << "Air accel: " << AIR_ACCEL << endl;
    cout << "Mode: GROUNDED" << endl;
    cout << "Mode: AIRBORNE" << endl;
    cout << "Air control: active" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Ground accel printed", expectedOutput: "Ground accel: 600" },
      { id: "t2", description: "Air accel printed", expectedOutput: "Air accel: 300" },
      { id: "t3", description: "Grounded mode printed", expectedOutput: "Mode: GROUNDED" },
      { id: "t4", description: "Airborne mode printed", expectedOutput: "Mode: AIRBORNE" },
      { id: "t5", description: "Air control label printed", expectedOutput: "Air control: active" },
    ],
    hints: [
      "cout << \"Ground accel: \" << ACCEL << endl; then cout << \"Air accel: \" << AIR_ACCEL << endl;",
      "cout << \"Mode: GROUNDED\" << endl; then cout << \"Mode: AIRBORNE\" << endl;",
      "Final line: cout << \"Air control: active\" << endl;",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Air Control",
    type: "game_builder",
    instructions: `# Build: Air Control

## Mental Model
Your FSM now tells you when the player is airborne. Use that information to apply a different acceleration. Add \`AIR_ACCEL = 300.0f\` and pick the right constant each frame based on \`player_state\`.

## What's Already Here
Full FSM platformer from Lesson 6: PlayerState enum, GROUNDED/AIRBORNE transitions, variable jump.

## Your Task
1. **Add the constant:** \`const float AIR_ACCEL = 300.0f;\` after the ACCEL declaration.

2. **Pick acceleration each frame:** Replace the hardcoded \`ACCEL\` in the movement block with a local variable:
\`\`\`cpp
float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
\`\`\`

3. **Apply it:** Use \`accel\` instead of \`ACCEL\` in the \`KEY_RIGHT\` and \`KEY_LEFT\` checks.

4. **Update cout:** Add \`cout << "AirAccel: " << AIR_ACCEL << endl;\` after the MaxRun line.

## Did It Work?
Run and jump. Hold a direction in the air — you should accelerate more slowly than on the ground. The difference is subtle but real. Try setting AIR_ACCEL to 50 to exaggerate the effect.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 388.0f;
float player_y = 100.0f;
float player_vy = 0.0f;
float player_vx = 0.0f;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
// TODO: Add const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "State: " << (player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;
    // TODO: Add cout << "AirAccel: " << AIR_ACCEL << endl;

    while (!WindowShouldClose()) {
        // TODO: Add: float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += ACCEL * FIXED_DT;  // TODO: Replace ACCEL with accel
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= ACCEL * FIXED_DT;  // TODO: Replace ACCEL with accel
            if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
        } else {
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            } else if (player_vx < 0) {
                player_vx += FRICTION * FIXED_DT;
                if (player_vx > 0) player_vx = 0;
            }
        }

        if (IsKeyPressed(KEY_SPACE) && player_state == GROUNDED) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
        }

        if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        player_x += player_vx * FIXED_DT;

        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
float player_x = 388.0f;
float player_y = 100.0f;
float player_vy = 0.0f;
float player_vx = 0.0f;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const int GROUND_Y = 340;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "State: " << (player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;
    cout << "AirAccel: " << AIR_ACCEL << endl;

    while (!WindowShouldClose()) {
        float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += accel * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= accel * FIXED_DT;
            if (player_vx < -MAX_RUN) player_vx = -MAX_RUN;
        } else {
            if (player_vx > 0) {
                player_vx -= FRICTION * FIXED_DT;
                if (player_vx < 0) player_vx = 0;
            } else if (player_vx < 0) {
                player_vx += FRICTION * FIXED_DT;
                if (player_vx > 0) player_vx = 0;
            }
        }

        if (IsKeyPressed(KEY_SPACE) && player_state == GROUNDED) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
        }

        if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        player_x += player_vx * FIXED_DT;

        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "g2", description: "State printed", expectedOutput: "State: GROUNDED" },
      { id: "g3", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "g4", description: "Accel printed", expectedOutput: "Accel: 600" },
      { id: "g5", description: "Air accel printed", expectedOutput: "AirAccel: 300" },
    ],
    hints: [
      "Add const float AIR_ACCEL = 300.0f; after ACCEL. Add cout << \"AirAccel: \" << AIR_ACCEL << endl; in the startup prints.",
      "Inside the game loop, add: float accel = (player_state == GROUNDED) ? ACCEL : AIR_ACCEL;",
      "Replace ACCEL * FIXED_DT with accel * FIXED_DT in both the KEY_RIGHT and KEY_LEFT branches.",
    ],
    estimatedMinutes: 10,
  },
};

export default lessonPlatformer7;
