import { Lesson } from "../../types/lesson";

const lessonPlatformer11: Lesson = {
  id: "platformer-11-god-object-refactor",
  title: "God Object Refactor",
  description: "Extract scattered global variables into a Level struct. Constants and enums stay global, mutable state moves into one container.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["struct extraction", "god object", "state container", "data grouping", "encapsulation"],
  part1: {
    title: "Concept: The God Object Problem",
    type: "concept",
    instructions: `# The God Object Problem

## Mental Model
Your platformer works. The jump feels right, coyote time is tuned, platforms collide correctly. But look at the top of your file: \`player_x\`, \`player_y\`, \`player_vy\`, \`player_vx\`, \`player_state\`, \`coyote_timer\`, \`jump_buffer_timer\`, \`plat_x[]\`, \`plat_y[]\`, \`plat_w[]\`. Eleven mutable globals scattered across file scope. This is a "god object" spread across the file -- every function can read and write everything, and nothing groups related data together.

## What Breaks Without This
With 11 scattered globals, adding a second level means duplicating every variable. Save/load means serializing 11 unrelated variables one by one. Debugging means searching the entire file for which function mutated \`player_vy\`. The code compiles, but the architecture is a maintenance trap. When you later add enemies, particles, and HUD state, the global count explodes to 30+. That is the god object problem -- not one giant class, but one giant scope where everything is visible to everything.

## The Fix: struct Level
Group all mutable game state into a single struct. Constants (\`SCREEN_W\`, \`GRAVITY\`, \`FIXED_DT\`) stay global because they never change. The \`PlayerState\` enum stays global because it defines a type, not a value. But every variable that changes during gameplay goes into \`struct Level\`:

\`\`\`cpp
struct Level {
    float player_x, player_y, player_vy, player_vx;
    int player_state;  // cast to/from PlayerState
    float coyote_timer, jump_buffer_timer;
};
\`\`\`

Now instead of \`player_x = 388.0f;\` you write \`level.player_x = 388.0f;\`. One struct, one instance, one place to look when debugging state.

The struct also makes future features trivial:
- **Save/load:** Serialize one struct instead of 11 variables
- **Multiple levels:** Create a new \`Level\` instance
- **State signature:** Hash the struct memory for determinism checks
- **Debug overlay:** Print one struct to see all game state

## Key Concepts
- God object: all mutable state accessible everywhere with no grouping
- Struct extraction: move related mutable variables into a named container
- Constants stay global (they are immutable configuration)
- Enums stay global (they define types, not runtime state)
- The struct IS the game state -- if it is not in the struct, it is not state

## Performance Insight
Grouping fields in a struct improves cache locality. When the physics pass reads \`level.player_x\`, \`level.player_y\`, \`level.player_vy\` -- those are contiguous in memory. Scattered globals may be placed anywhere by the linker. The struct guarantees spatial locality, which means fewer cache misses during the physics integration pass.

## Memory Insight
The struct lives at file scope (static storage duration), same as the globals it replaces. No heap allocation, no dynamic memory. The sizeof(Level) is the sum of its fields plus padding. You can verify with \`cout << sizeof(Level)\` -- it will be around 32 bytes for the player fields alone. That is one cache line.

## Your Task
Create a \`Level\` struct containing player position, velocity, state, and timers. Initialize an instance and print its values.

Expected output:
\`\`\`
Player: (388, 100)
State: GROUNDED
Coyote: 0.1
Struct: Level
\`\`\`

## Beginner Trap
**Putting constants inside the struct.** \`GRAVITY\`, \`SCREEN_W\`, \`FIXED_DT\` are immutable configuration -- they do not change during gameplay. Putting them in the struct wastes memory (every Level instance carries copies of constants) and breaks the mental model (the struct represents state that changes, not configuration that is fixed). Constants stay at file scope with \`const\`.

## Elite Insight
Celeste stores all game state in a single \`Level\` object. When the player dies, Celeste resets by loading a fresh Level instance -- no manual variable-by-variable reset. Unity uses the same pattern with \`MonoBehaviour\` fields, and Godot uses \`Node\` properties. The pattern is universal: mutable state lives in a named container, configuration lives outside.

## Systems Thinking Connection
The RPG path hits this same refactor at Lesson 16 (Struct Extraction). The Space Shooter extracts \`GameState\` from scattered arrays. The Crawler groups world data into a \`Dungeon\` struct. Every path starts with scattered globals and refactors into a single state container -- because every path hits the same maintenance wall at the same complexity threshold.

## Skill Reinforcement
Lessons 1-10 built the physics feel loop using scattered globals. This lesson reorganizes that code without changing behavior. Lessons 12+ will add tile collision and coins to the struct -- which would be a nightmare with 20+ scattered globals.

## Mastery Check
**Q:** If you need to save and load the game state, why is a struct easier than scattered globals?
**A:** With a struct, you serialize one block of memory (or iterate its fields in one place). With scattered globals, you must manually track every variable name and order -- miss one and the save is corrupt. The struct IS the save format.`,
    starterCode: `#include <iostream>
using namespace std;

enum PlayerState { GROUNDED, AIRBORNE };

// TODO: Define struct Level with:
//   float player_x, player_y, player_vy, player_vx;
//   int player_state;
//   float coyote_timer, jump_buffer_timer;

int main() {
    // TODO: Create a Level instance called "level"
    // Initialize: player_x=388, player_y=100, player_vy=0, player_vx=0
    //             player_state=GROUNDED, coyote_timer=0.1, jump_buffer_timer=0

    // TODO: Print "Player: (388, 100)" using level.player_x and level.player_y
    // TODO: Print "State: GROUNDED" using level.player_state
    // TODO: Print "Coyote: 0.1" using level.coyote_timer
    // TODO: Print "Struct: Level"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum PlayerState { GROUNDED, AIRBORNE };

struct Level {
    float player_x, player_y, player_vy, player_vx;
    int player_state;
    float coyote_timer, jump_buffer_timer;
};

int main() {
    Level level = {388.0f, 100.0f, 0.0f, 0.0f, GROUNDED, 0.1f, 0.0f};

    cout << "Player: (" << (int)level.player_x << ", " << (int)level.player_y << ")" << endl;
    cout << "State: " << (level.player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "Coyote: " << level.coyote_timer << endl;
    cout << "Struct: Level" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "t2", description: "State is GROUNDED", expectedOutput: "State: GROUNDED" },
      { id: "t3", description: "Coyote timer printed", expectedOutput: "Coyote: 0.1" },
      { id: "t4", description: "Struct label printed", expectedOutput: "Struct: Level" },
    ],
    hints: [
      "Define struct Level { ... }; before main(). It needs float fields for position, velocity, timers, and an int for player_state.",
      "Initialize with: Level level = {388.0f, 100.0f, 0.0f, 0.0f, GROUNDED, 0.1f, 0.0f}; -- fields match declaration order.",
      "Print with level.player_x, level.player_y, etc. For state: level.player_state == GROUNDED ? \"GROUNDED\" : \"AIRBORNE\"",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: God Object Refactor",
    type: "game_builder",
    instructions: `# Build: God Object Refactor

## Mental Model
You have a working platformer with 11 mutable globals. Your task: extract every mutable variable into a single \`struct Level\`. The game behavior does not change -- same jump, same collision, same coyote time. But the architecture changes fundamentally. After this refactor, all mutable state is in one place.

## What Breaks Without This
Try adding save/load to 11 scattered globals. Try adding a level restart. Try adding a second level. Each of those features requires touching every global individually. With a struct, you reset one variable: \`level = initial_level;\`. That is the power of grouping state.

## The Fix: struct Level
Move these into the struct:
- \`player_x\`, \`player_y\`, \`player_vy\`, \`player_vx\` (player physics)
- \`player_state\` as \`int\` (cast to/from PlayerState)
- \`coyote_timer\`, \`jump_buffer_timer\` (timing)
- \`plat_x[3]\`, \`plat_y[3]\`, \`plat_w[3]\` (platform geometry)

Keep these global:
- All \`const\` values: \`SCREEN_W\`, \`GRAVITY\`, \`FIXED_DT\`, \`PLAYER_W\`, etc.
- \`enum PlayerState\` (type definition)
- \`PLAT_COUNT\`, \`PLAT_H\` (constants)

## Your Task
1. **Define \`struct Level\`** after the constants and enum, containing all mutable fields
2. **Create a global instance:** \`Level level = { ... };\`
3. **Replace every bare global** with \`level.\` prefix (e.g., \`player_x\` becomes \`level.player_x\`)
4. **Add \`cout << "Struct: Level" << endl;\`** after the existing cout lines
5. **Cast player_state:** Use \`(PlayerState)level.player_state\` for comparisons and \`level.player_state = GROUNDED;\` for assignments

## Did It Work?
Click Run. The game should look and play exactly the same as before. The blue player block jumps, lands, and collides with platforms. The HUD shows GROUNDED/AIRBORNE. The console shows "Struct: Level" as the last line. Same game, better architecture.

## Beginner Trap
**Forgetting to replace ALL occurrences of a global.** If you change \`player_x\` to \`level.player_x\` in the physics pass but not in the render pass, the player teleports or renders at the wrong position. Use search-and-replace: every \`player_x\` (not in a constant or comment) becomes \`level.player_x\`.

## Elite Insight
The Cherno (C++ game engine series) calls this the "single state object" pattern. Unreal Engine uses \`UGameStateBase\` to hold match state. Unity uses \`MonoBehaviour\` fields grouped per component. Every professional engine groups mutable state -- scattered globals are a prototype pattern that must be refactored before the codebase grows.

## Mastery Check
**Q:** After this refactor, how would you implement "restart level"?
**A:** Store the initial Level values in a const: \`const Level INITIAL = { ... };\`. On restart: \`level = INITIAL;\`. One assignment resets everything. With scattered globals, you would need to reset 11 variables manually.`,
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
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;

const int PLAT_COUNT = 3;
int plat_x[3] = {100, 350, 580};
int plat_y[3] = {280, 240, 200};
int plat_w[3] = {150, 150, 150};
const int PLAT_H = 16;

enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;
float coyote_timer = 0.0f;
float jump_buffer_timer = 0.0f;

// TODO: Define struct Level with:
//   float player_x, player_y, player_vy, player_vx;
//   int player_state;
//   float coyote_timer, jump_buffer_timer;
//   int plat_x[3], plat_y[3], plat_w[3];
//
// TODO: Create a global Level instance with initial values
// TODO: Remove the bare globals above (player_x, player_y, etc.)
// TODO: Replace every bare global with level. prefix throughout

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
    cout << "Coyote: " << COYOTE_TIME << endl;
    cout << "Buffer: " << JUMP_BUFFER << endl;
    cout << "Platforms: " << PLAT_COUNT << endl;
    // TODO: Add cout << "Struct: Level" << endl;

    while (!WindowShouldClose()) {
        if (player_state == AIRBORNE && coyote_timer > 0) coyote_timer -= FIXED_DT;
        if (jump_buffer_timer > 0) jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) jump_buffer_timer = JUMP_BUFFER;
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

        if (jump_buffer_timer > 0 && coyote_timer > 0) {
            player_vy = -JUMP_SPEED;
            player_state = AIRBORNE;
            coyote_timer = 0;
            jump_buffer_timer = 0;
        }

        if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
            player_vy = -MIN_JUMP_VY;
        }

        player_vy += GRAVITY * FIXED_DT;
        player_y += player_vy * FIXED_DT;
        player_x += player_vx * FIXED_DT;

        if (player_x < 0) player_x = 0;
        if (player_x + PLAYER_W > SCREEN_W) player_x = SCREEN_W - PLAYER_W;

        for (int i = 0; i < PLAT_COUNT; i++) {
            if (player_x + PLAYER_W > plat_x[i] &&
                player_x < plat_x[i] + plat_w[i] &&
                player_y + PLAYER_H >= plat_y[i] &&
                player_y + PLAYER_H <= plat_y[i] + 10 &&
                player_vy >= 0) {
                player_y = plat_y[i] - PLAYER_H;
                player_vy = 0;
                player_state = GROUNDED;
                coyote_timer = COYOTE_TIME;
            }
        }

        if (player_y + PLAYER_H >= GROUND_Y) {
            player_y = GROUND_Y - PLAYER_H;
            player_vy = 0.0f;
            player_state = GROUNDED;
            coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        for (int i = 0; i < PLAT_COUNT; i++)
            DrawRectangle(plat_x[i], plat_y[i], plat_w[i], PLAT_H, DARKGREEN);
        DrawRectangle((int)player_x, (int)player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
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
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;

const int PLAT_COUNT = 3;
const int PLAT_H = 16;

enum PlayerState { GROUNDED, AIRBORNE };

struct Level {
    float player_x, player_y, player_vy, player_vx;
    int player_state;
    float coyote_timer, jump_buffer_timer;
    int plat_x[3], plat_y[3], plat_w[3];
};

Level level = {
    388.0f, 100.0f, 0.0f, 0.0f,
    GROUNDED,
    0.0f, 0.0f,
    {100, 350, 580},
    {280, 240, 200},
    {150, 150, 150}
};

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << level.player_x << ", " << level.player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    cout << "State: " << ((PlayerState)level.player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;
    cout << "AirAccel: " << AIR_ACCEL << endl;
    cout << "Coyote: " << COYOTE_TIME << endl;
    cout << "Buffer: " << JUMP_BUFFER << endl;
    cout << "Platforms: " << PLAT_COUNT << endl;
    cout << "Struct: Level" << endl;

    while (!WindowShouldClose()) {
        if ((PlayerState)level.player_state == AIRBORNE && level.coyote_timer > 0) level.coyote_timer -= FIXED_DT;
        if (level.jump_buffer_timer > 0) level.jump_buffer_timer -= FIXED_DT;
        if (IsKeyPressed(KEY_SPACE)) level.jump_buffer_timer = JUMP_BUFFER;
        float accel = ((PlayerState)level.player_state == GROUNDED) ? ACCEL : AIR_ACCEL;
        if (IsKeyDown(KEY_RIGHT)) {
            level.player_vx += accel * FIXED_DT;
            if (level.player_vx > MAX_RUN) level.player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            level.player_vx -= accel * FIXED_DT;
            if (level.player_vx < -MAX_RUN) level.player_vx = -MAX_RUN;
        } else {
            if (level.player_vx > 0) {
                level.player_vx -= FRICTION * FIXED_DT;
                if (level.player_vx < 0) level.player_vx = 0;
            } else if (level.player_vx < 0) {
                level.player_vx += FRICTION * FIXED_DT;
                if (level.player_vx > 0) level.player_vx = 0;
            }
        }

        if (level.jump_buffer_timer > 0 && level.coyote_timer > 0) {
            level.player_vy = -JUMP_SPEED;
            level.player_state = AIRBORNE;
            level.coyote_timer = 0;
            level.jump_buffer_timer = 0;
        }

        if ((PlayerState)level.player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && level.player_vy < -MIN_JUMP_VY) {
            level.player_vy = -MIN_JUMP_VY;
        }

        level.player_vy += GRAVITY * FIXED_DT;
        level.player_y += level.player_vy * FIXED_DT;
        level.player_x += level.player_vx * FIXED_DT;

        if (level.player_x < 0) level.player_x = 0;
        if (level.player_x + PLAYER_W > SCREEN_W) level.player_x = SCREEN_W - PLAYER_W;

        for (int i = 0; i < PLAT_COUNT; i++) {
            if (level.player_x + PLAYER_W > level.plat_x[i] &&
                level.player_x < level.plat_x[i] + level.plat_w[i] &&
                level.player_y + PLAYER_H >= level.plat_y[i] &&
                level.player_y + PLAYER_H <= level.plat_y[i] + 10 &&
                level.player_vy >= 0) {
                level.player_y = level.plat_y[i] - PLAYER_H;
                level.player_vy = 0;
                level.player_state = GROUNDED;
                level.coyote_timer = COYOTE_TIME;
            }
        }

        if (level.player_y + PLAYER_H >= GROUND_Y) {
            level.player_y = GROUND_Y - PLAYER_H;
            level.player_vy = 0.0f;
            level.player_state = GROUNDED;
            level.coyote_timer = COYOTE_TIME;
        }

        BeginDrawing();
        ClearBackground(SKYBLUE);
        DrawRectangle(0, GROUND_Y, SCREEN_W, SCREEN_H - GROUND_Y, BROWN);
        for (int i = 0; i < PLAT_COUNT; i++)
            DrawRectangle(level.plat_x[i], level.plat_y[i], level.plat_w[i], PLAT_H, DARKGREEN);
        DrawRectangle((int)level.player_x, (int)level.player_y, PLAYER_W, PLAYER_H, BLUE);
        DrawText((PlayerState)level.player_state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position printed", expectedOutput: "Player: (388, 100)" },
      { id: "g2", description: "FSM active printed", expectedOutput: "FSM: active" },
      { id: "g3", description: "Coyote time printed", expectedOutput: "Coyote: 0.1" },
      { id: "g4", description: "Platform count printed", expectedOutput: "Platforms: 3" },
      { id: "g5", description: "Struct label printed", expectedOutput: "Struct: Level" },
    ],
    hints: [
      "Define struct Level { float player_x, player_y, player_vy, player_vx; int player_state; float coyote_timer, jump_buffer_timer; int plat_x[3], plat_y[3], plat_w[3]; }; after the enum.",
      "Initialize: Level level = {388.0f, 100.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f, {100,350,580}, {280,240,200}, {150,150,150}};",
      "Replace every player_x with level.player_x, player_vy with level.player_vy, etc. Use (PlayerState)level.player_state for enum comparisons. Add cout << \"Struct: Level\" << endl;",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer11;
