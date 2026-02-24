import { Lesson } from "../../types/lesson";

const lessonPlatformer6: Lesson = {
  id: "platformer-06-player-fsm-v0",
  title: "Player FSM v0",
  description: "Replace the boolean flag with a PlayerState enum — your first finite state machine. Explicit states prevent invisible bugs.",
  order: 6,
  xpReward: 50,
  tier: "free",
  concepts: ["enum state machine", "explicit transitions", "GROUNDED vs AIRBORNE", "state-dependent logic"],
  part1: {
    title: "Concept: States as Enums",
    type: "concept",
    instructions: `# Player FSM v0

## Mental Model
A \`bool is_grounded\` works for two states. But what happens when you add wall-sliding, dashing, climbing, and invulnerability? You end up with four booleans: \`is_grounded\`, \`is_dashing\`, \`is_wall_sliding\`, \`is_climbing\` — booleans that can technically all be true at once, which is physically impossible. An **enum** makes the invalid state unrepresentable. \`PlayerState\` can only be ONE value at a time. That's a finite state machine.

## What Breaks Without This
Boolean flags compose badly. \`is_grounded && is_jumping\` can be simultaneously true during the exact frame a jump starts. Which one wins? With an enum, you can't be in two states at once — transitions are explicit, and you can see every possible state at a glance.

## The Fix: enum PlayerState
\`\`\`cpp
enum PlayerState { GROUNDED, AIRBORNE };
PlayerState player_state = GROUNDED;

// Transition on jump
if (jump_pressed && player_state == GROUNDED) {
    player_vy = -JUMP_SPEED;
    player_state = AIRBORNE;
}

// Transition on land
if (player_y + PLAYER_H >= GROUND_Y) {
    player_y = GROUND_Y - PLAYER_H;
    player_vy = 0;
    player_state = GROUNDED;
}
\`\`\`

## Key Concepts
- Enum: a type whose value is exactly ONE of a named set
- State machine: explicit states + explicit transitions
- A state machine makes illegal states unrepresentable
- Every transition is a deliberate code path — no hidden flag combinations

## Performance Insight
An enum is just an int. Same size, same cost as a bool. But it carries MORE information per byte — 2 booleans replaced by one enum with room for far more states.

## Memory Insight
\`enum PlayerState\` compiles to an int (4 bytes by default). \`bool is_grounded\` is typically 1 byte. The enum costs 3 extra bytes but eliminates the possibility of inconsistent multi-flag state. Worth every byte.

## Your Task
Implement a PlayerState enum with GROUNDED and AIRBORNE. Simulate state transitions for a jump sequence and print each state.

## Beginner Trap
\`\`\`cpp
// WRONG: Checking multiple flags that can conflict
if (is_grounded && !is_jumping) { /* ... */ }
// RIGHT: Single state that cannot conflict
if (player_state == GROUNDED) { /* ... */ }
\`\`\`

## Elite Insight
Celeste's player has 13 distinct states in its FSM: Normal, Climbing, Dashing, Falling, Feather, Swim, Dream, Boost, Frozen, Intro, Respawn, StIntroWalk, StIntroRespawn. Every mechanic is a state. Every transition is a rule. No boolean soup.

## Systems Thinking Connection
FSMs appear everywhere: RPG quest states (UNSTARTED, ACTIVE, COMPLETE), Space Shooter enemy states (PATROL, CHASE, DEAD). The pattern is universal — explicit states beat boolean flags every time.

## Mastery Check
**Q:** You have \`is_grounded\`, \`is_on_wall\`, \`is_dashing\`. What is the maximum number of impossible states these three booleans can represent?
**A:** 2^3 = 8 possible combinations, but most are physically impossible (cannot be grounded AND on wall simultaneously). An enum with GROUNDED, WALL_SLIDE, DASHING states makes the impossible combos unrepresentable.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define enum PlayerState with two members: GROUNDED and AIRBORNE

int main() {
    // TODO: Declare PlayerState state = GROUNDED;
    // TODO: Print "State: GROUNDED"
    // TODO: Print "FSM: active"

    // Simulate a jump
    // TODO: Set state = AIRBORNE, then print "Jumped: AIRBORNE"

    // Simulate a landing
    // TODO: Set state = GROUNDED, then print "Landed: GROUNDED"

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum PlayerState { GROUNDED, AIRBORNE };

int main() {
    PlayerState state = GROUNDED;
    cout << "State: GROUNDED" << endl;
    cout << "FSM: active" << endl;

    state = AIRBORNE;
    cout << "Jumped: AIRBORNE" << endl;

    state = GROUNDED;
    cout << "Landed: GROUNDED" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial state printed", expectedOutput: "State: GROUNDED" },
      { id: "t2", description: "FSM label printed", expectedOutput: "FSM: active" },
      { id: "t3", description: "Airborne transition printed", expectedOutput: "Jumped: AIRBORNE" },
      { id: "t4", description: "Grounded transition printed", expectedOutput: "Landed: GROUNDED" },
    ],
    hints: [
      "Declare the enum before main: enum PlayerState { GROUNDED, AIRBORNE }; then inside main: PlayerState state = GROUNDED;",
      "To transition to airborne: state = AIRBORNE; then cout << \"Jumped: AIRBORNE\" << endl;",
      "To land: state = GROUNDED; then cout << \"Landed: GROUNDED\" << endl;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Player FSM v0",
    type: "game_builder",
    instructions: `# Build: Player FSM v0

## Mental Model
Your \`bool is_grounded\` has served you well — but it breaks as soon as you add a second state. Replace it with \`enum PlayerState { GROUNDED, AIRBORNE }\`. The logic is identical, but now the state machine is explicit and extensible. Lesson 7 will add air control differences. Each new state is one line to the enum — no new booleans.

## What's Already Here
Full movement system from Lesson 5: acceleration, friction, variable jump, ground collision.

## Your Task
Two changes, one big upgrade:

1. **Add the enum at file scope:** \`enum PlayerState { GROUNDED, AIRBORNE };\` and \`PlayerState player_state = GROUNDED;\`. Remove \`bool is_grounded\`.

2. **Replace all is_grounded references** with player_state:
   - Jump check: \`if (IsKeyPressed(KEY_SPACE) && player_state == GROUNDED)\`
   - Jump start: \`player_state = AIRBORNE;\`
   - Variable jump: \`if (player_state == AIRBORNE && !IsKeyDown(KEY_SPACE) && ...)\`
   - Landing: \`player_state = GROUNDED;\`

3. **Update cout:** Replace \`Grounded: true\` with \`State: GROUNDED\` (use a ternary), and add \`FSM: active\`.

## Did It Work?
Game plays identically — jump, run, land. But now the state is explicit. Try adding \`DrawText(player_state == GROUNDED ? \"GROUNDED\" : \"AIRBORNE\", 10, 10, 20, WHITE)\` to see the state on screen.`,
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
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;

// TODO: Add enum PlayerState { GROUNDED, AIRBORNE };
// TODO: Add PlayerState player_state = GROUNDED; (then remove bool is_grounded)
bool is_grounded = true;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Gravity: " << GRAVITY << endl;
    // TODO: Replace next line with: cout << "State: " << (player_state == GROUNDED ? "GROUNDED" : "AIRBORNE") << endl;
    cout << "Grounded: true" << endl;
    // TODO: Add cout << "FSM: active" << endl;
    cout << "JumpSpeed: " << JUMP_SPEED << endl;
    cout << "MinJumpVY: " << MIN_JUMP_VY << endl;
    cout << "Accel: " << ACCEL << endl;
    cout << "Friction: " << FRICTION << endl;
    cout << "MaxRun: " << MAX_RUN << endl;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += ACCEL * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= ACCEL * FIXED_DT;
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

        // TODO: Update to use player_state == GROUNDED
        if (IsKeyPressed(KEY_SPACE) && is_grounded) {
            player_vy = -JUMP_SPEED;
            is_grounded = false;
        }

        // TODO: Update to use player_state == AIRBORNE
        if (!is_grounded && !IsKeyDown(KEY_SPACE) && player_vy < -MIN_JUMP_VY) {
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
            // TODO: Use player_state = GROUNDED; instead of is_grounded = true;
            is_grounded = true;
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

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) {
            player_vx += ACCEL * FIXED_DT;
            if (player_vx > MAX_RUN) player_vx = MAX_RUN;
        } else if (IsKeyDown(KEY_LEFT)) {
            player_vx -= ACCEL * FIXED_DT;
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
      { id: "g2", description: "Gravity printed", expectedOutput: "Gravity: 800" },
      { id: "g3", description: "State is GROUNDED at start", expectedOutput: "State: GROUNDED" },
      { id: "g4", description: "FSM label printed", expectedOutput: "FSM: active" },
      { id: "g5", description: "Accel printed", expectedOutput: "Accel: 600" },
    ],
    hints: [
      "Add at file scope: enum PlayerState { GROUNDED, AIRBORNE }; then PlayerState player_state = GROUNDED; and remove bool is_grounded.",
      "Replace is_grounded in jump check: if (IsKeyPressed(KEY_SPACE) && player_state == GROUNDED). Set player_state = AIRBORNE; on jump, player_state = GROUNDED; on landing.",
      "For cout: cout << \"State: \" << (player_state == GROUNDED ? \"GROUNDED\" : \"AIRBORNE\") << endl; then add cout << \"FSM: active\" << endl;",
    ],
    estimatedMinutes: 12,
  },
};

export default lessonPlatformer6;
