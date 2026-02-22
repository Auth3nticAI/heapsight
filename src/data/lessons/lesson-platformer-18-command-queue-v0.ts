import { Lesson } from "../../types/lesson";

const lessonPlatformer18: Lesson = {
  id: "platformer-18-command-queue-v0",
  title: "Command Queue v0",
  description: "Separate input reading from physics. inputPass reads keys into a Command; physicsPass consumes it. Input and physics never touch each other directly.",
  order: 18,
  xpReward: 100,
  tier: "pro",
  concepts: ["command queue", "input separation", "intent vs execution", "named pipeline passes"],
  part1: {
    title: "Concept: Input -> Command -> Resolve",
    type: "concept",
    instructions: `# Command Queue v0

## Mental Model
Right now, input reading and physics execution are tangled together. IsKeyDown(KEY_RIGHT) directly modifies velocity in the same block. A command queue separates these: the INPUT PASS reads keys and produces a Command; the PHYSICS PASS consumes the Command and applies forces. Input and physics never touch each other directly — they communicate through a shared Command value.

## What Breaks Without This
Mixed input+physics means you cannot replay inputs without running raylib, cannot test physics without a window, cannot swap input sources (keyboard, gamepad, replay file) without touching physics code. The command queue is the seam between "what the player pressed" and "what happens in the world."

## The Fix: Input -> Command -> Resolve
Define an enum for movement commands, add it to World, and split the game loop into two named passes:

\`\`\`cpp
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };

void inputPass(World& w) {
    w.cmd = CMD_NONE;
    if (IsKeyDown(KEY_RIGHT)) w.cmd = CMD_RIGHT;
    else if (IsKeyDown(KEY_LEFT)) w.cmd = CMD_LEFT;
    if (IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer = JUMP_BUFFER;
}

void physicsPass(World& w) {
    // Consumes w.cmd to determine horizontal force
    float accel = (w.player.state == GROUNDED) ? ACCEL : AIR_ACCEL;
    if (w.cmd == CMD_RIGHT) { ... }
    else if (w.cmd == CMD_LEFT) { ... }
    else { /* friction */ }
}
\`\`\`

## Key Concepts
- **Command enum**: named intents, not raw key states
- **inputPass**: reads hardware, produces command — no physics
- **physicsPass**: consumes command, applies forces — no key reading
- **Separation**: swapping keyboard for gamepad = change inputPass only

## Performance Insight
Command is an int (4 bytes). Passing it through a World& adds zero overhead. The separation costs nothing at runtime but gains everything in testability: you can call physicsPass with any Command value without a window open.

## Memory Insight
Adding Command cmd to World costs 4 bytes. The World struct grows by one int. This is trivially cheap. The architectural benefit — decoupled input and physics — costs nothing.

## Your Task
Simulate a 3-command sequence and process each command, printing the name.

Expected output:
\`\`\`
Command queue: active
Commands: NONE LEFT RIGHT JUMP
Processing: CMD_LEFT
Processing: CMD_JUMP
Processing: CMD_RIGHT
Resolved: 3 commands
Pattern: command-queue
\`\`\`

## Beginner Trap
Using raw strings for commands instead of an enum. Writing if (cmd == "jump") requires string comparison every frame. An enum compares as a single integer — zero-cost. Enums also give you type safety: you cannot accidentally write CMD_JAMP without a compiler error.

## Elite Insight
Celeste's input system records commands to a log every frame. During speedrun verification, the log replays against the physics system without any raylib calls — pure command-to-physics. The command queue is what makes deterministic replay possible. Lesson 64 (Input Log) builds exactly this.

## Systems Thinking Connection
The RPG path uses a command queue explicitly: press arrow, create MOVE_NORTH command, resolve pass executes it. The Platformer uses the same pattern with real-time commands instead of turn-based. Both separate intent from execution. Both enable replay. Both testable without a window.

## Mastery Check
**Q:** Why separate inputPass and physicsPass instead of reading keys directly in the physics loop?
**A:** Direct key reading ties physics to hardware. You cannot test physics without a window, replay inputs without keyboard simulation, or swap gamepad/keyboard. Command queue decouples them: physicsPass only sees commands, not hardware. Change the input source by changing only inputPass.`,
    starterCode: `#include <iostream>
using namespace std;

enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT, CMD_JUMP };

// Helper: return the name of a command as a string
const char* cmdName(Command c) {
    if (c == CMD_LEFT)  return "CMD_LEFT";
    if (c == CMD_RIGHT) return "CMD_RIGHT";
    if (c == CMD_JUMP)  return "CMD_JUMP";
    return "CMD_NONE";
}

int main() {
    Command queue[] = { CMD_LEFT, CMD_JUMP, CMD_RIGHT };
    int n = 3;

    // TODO 1: Print "Command queue: active"
    // TODO 2: Print "Commands: NONE LEFT RIGHT JUMP"

    for (int i = 0; i < n; i++) {
        // TODO 3: Print "Processing: " followed by cmdName(queue[i])
    }

    // TODO 4: Print "Resolved: 3 commands"
    // TODO 5: Print "Pattern: command-queue"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT, CMD_JUMP };

const char* cmdName(Command c) {
    if (c == CMD_LEFT)  return "CMD_LEFT";
    if (c == CMD_RIGHT) return "CMD_RIGHT";
    if (c == CMD_JUMP)  return "CMD_JUMP";
    return "CMD_NONE";
}

int main() {
    Command queue[] = { CMD_LEFT, CMD_JUMP, CMD_RIGHT };
    int n = 3;
    cout << "Command queue: active" << endl;
    cout << "Commands: NONE LEFT RIGHT JUMP" << endl;
    for (int i = 0; i < n; i++) {
        cout << "Processing: " << cmdName(queue[i]) << endl;
    }
    cout << "Resolved: " << n << " commands" << endl;
    cout << "Pattern: command-queue" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Queue active", expectedOutput: "Command queue: active" },
      { id: "t2", description: "Commands listed", expectedOutput: "Commands: NONE LEFT RIGHT JUMP" },
      { id: "t3", description: "Left processed", expectedOutput: "Processing: CMD_LEFT" },
      { id: "t4", description: "Resolved count", expectedOutput: "Resolved: 3 commands" },
      { id: "t5", description: "Pattern printed", expectedOutput: "Pattern: command-queue" },
    ],
    hints: [
      'Print "Command queue: active" then "Commands: NONE LEFT RIGHT JUMP" before the loop.',
      'Inside the for loop, print "Processing: " then cmdName(queue[i]) — the helper function converts the enum to a string.',
      'After the loop, print "Resolved: 3 commands" then "Pattern: command-queue".',
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Command Queue v0",
    type: "game_builder",
    instructions: `# Build: Command Queue v0

## Mental Model
The game loop now has two named passes: inputPass reads keys into w.cmd, and physicsPass consumes w.cmd to apply forces. Jump buffering stays in w.player.jump_buffer_timer — a form of command memory. The game plays identically to Lesson 17, but the architecture is explicit: input and physics are separated.

## What's Already Here
The Command enum, World.cmd field, inputPass, and physicsPass are defined. The game loop calls them in order. Your task is to add the cout output proving the command pipeline is active, and add a HUD label showing the current command.

## Your Task
Add command queue verification output after initWorld:

\`\`\`cpp
cout << "Command queue: active" << endl;
cout << "Commands: NONE LEFT RIGHT JUMP" << endl;
cout << "Pattern: command-queue" << endl;
\`\`\`

And update the render block to show the current command:
\`\`\`cpp
DrawText(TextFormat("Cmd: %s", cmdName(w.cmd)), 10, 60, 16, LIME);
\`\`\`

## Did It Work?
Run the game. Console shows command queue active. Hold RIGHT arrow — the HUD shows "Cmd: CMD_RIGHT". Hold LEFT — "Cmd: CMD_LEFT". Release all keys — "Cmd: CMD_NONE". The command is a live readout of your input intent.

## Beginner Trap
Calling IsKeyDown inside physicsPass. The physics pass must only read w.cmd — never raw key state. If you sneak a key check into physicsPass, you break the abstraction. The input source should be swappable (keyboard today, replay file tomorrow) without touching physics.

## Elite Insight
This pattern — named pipeline passes over a shared state — scales to the full system in Lesson 35: inputSystem(w), physicsSystem(w), collisionSystem(w), cleanupSystem(w), renderSystem(w). Each pass is one function, one concern. Add a debugSystem(w) that prints w.cmd every frame — free, zero-cost telemetry.`,
    starterCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;

const int DEFAULT_MAP[ROWS][COLS] = {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
};

World w;

const char* cmdName(Command c) {
    if (c == CMD_LEFT)  return "CMD_LEFT";
    if (c == CMD_RIGHT) return "CMD_RIGHT";
    return "CMD_NONE";
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    memcpy(w.tilemap, DEFAULT_MAP, sizeof(w.tilemap));
}

void inputPass(World& w) {
    w.cmd = CMD_NONE;
    if (IsKeyDown(KEY_RIGHT)) w.cmd = CMD_RIGHT;
    else if (IsKeyDown(KEY_LEFT)) w.cmd = CMD_LEFT;
    if (IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer = JUMP_BUFFER;
}

void physicsPass(World& w) {
    Player& p = w.player;
    if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
    if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
    float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
    if (w.cmd == CMD_RIGHT) {
        p.vx += accel * FIXED_DT;
        if (p.vx > MAX_RUN) p.vx = MAX_RUN;
    } else if (w.cmd == CMD_LEFT) {
        p.vx -= accel * FIXED_DT;
        if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
    } else {
        if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
        else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
    }
    if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
        p.vy = -JUMP_SPEED; p.state = AIRBORNE;
        p.coyote_timer = 0; p.jump_buffer_timer = 0;
    }
    if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
        p.vy = -MIN_JUMP_VY;
    p.x += p.vx * FIXED_DT;
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0; p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x = right_col * TILE_SIZE - PLAYER_W; p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x = (left_col + 1) * TILE_SIZE; p.vx = 0;
        }
    }
}

void checkCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2) {
                w.tilemap[r][c] = 0; w.score++;
            }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);

    // TODO 1: cout << "Command queue: active" << endl;
    // TODO 2: cout << "Commands: NONE LEFT RIGHT JUMP" << endl;
    // TODO 3: cout << "Pattern: command-queue" << endl;

    while (!WindowShouldClose()) {
        inputPass(w);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        checkCoins(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        // TODO 4: DrawText(TextFormat("Cmd: %s", cmdName(w.cmd)), 10, 60, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;

const int DEFAULT_MAP[ROWS][COLS] = {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
};

World w;

const char* cmdName(Command c) {
    if (c == CMD_LEFT)  return "CMD_LEFT";
    if (c == CMD_RIGHT) return "CMD_RIGHT";
    return "CMD_NONE";
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    memcpy(w.tilemap, DEFAULT_MAP, sizeof(w.tilemap));
}

void inputPass(World& w) {
    w.cmd = CMD_NONE;
    if (IsKeyDown(KEY_RIGHT)) w.cmd = CMD_RIGHT;
    else if (IsKeyDown(KEY_LEFT)) w.cmd = CMD_LEFT;
    if (IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer = JUMP_BUFFER;
}

void physicsPass(World& w) {
    Player& p = w.player;
    if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
    if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
    float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
    if (w.cmd == CMD_RIGHT) {
        p.vx += accel * FIXED_DT;
        if (p.vx > MAX_RUN) p.vx = MAX_RUN;
    } else if (w.cmd == CMD_LEFT) {
        p.vx -= accel * FIXED_DT;
        if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
    } else {
        if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
        else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
    }
    if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
        p.vy = -JUMP_SPEED; p.state = AIRBORNE;
        p.coyote_timer = 0; p.jump_buffer_timer = 0;
    }
    if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
        p.vy = -MIN_JUMP_VY;
    p.x += p.vx * FIXED_DT;
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0; p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x = right_col * TILE_SIZE - PLAYER_W; p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x = (left_col + 1) * TILE_SIZE; p.vx = 0;
        }
    }
}

void checkCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2) {
                w.tilemap[r][c] = 0; w.score++;
            }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);

    cout << "Command queue: active" << endl;
    cout << "Commands: NONE LEFT RIGHT JUMP" << endl;
    cout << "Pattern: command-queue" << endl;

    while (!WindowShouldClose()) {
        inputPass(w);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        checkCoins(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Cmd: %s", cmdName(w.cmd)), 10, 60, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Queue active in output", expectedOutput: "Command queue: active" },
      { id: "g2", description: "Commands listed", expectedOutput: "Commands: NONE LEFT RIGHT JUMP" },
      { id: "g3", description: "Pattern printed", expectedOutput: "Pattern: command-queue" },
    ],
    hints: [
      "Add three cout lines after initWorld(w): Command queue active, Commands list, Pattern.",
      "The HUD DrawText uses TextFormat with %s and cmdName(w.cmd) to display the current command string.",
      "Hold the right arrow key and watch the HUD show CMD_RIGHT. Release all keys and it shows CMD_NONE.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer18;