import { Lesson } from "@/types/lesson";

export const lessonRPG16: Lesson = {
  id: "rpg-16-command-queue-formalized",
  title: "Command Queue Formalized",
  description: "Replace the single pending_intent integer with a proper Command POD struct and fixed-size queue. Every player action becomes structured data.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["command queue", "POD struct", "fixed array", "data pipeline"],
  part1: {
    title: "Concept: Command Queue Formalized",
    type: "concept",
    instructions: `# Concept: Command Queue Formalized

## The Problem With a Single Intent
Our current code stores input as one integer: \`pending_intent = INTENT_RIGHT\`.
That works for a single keypress — but it collapses under any real pressure:

- **AI agents** want to queue multiple actions per turn
- **Replays** need a list of commands to play back
- **Scripts** need to inject commands without touching input code

One int can hold one idea. A queue can hold a plan.

## The Fix: Command as a POD Struct
A Command is three integers: a type and two parameters.

\`\`\`cpp
struct Command {
    int type; // CMD_MOVE_UP, CMD_ATTACK, etc.
    int p1;   // parameter 1 (entity, direction...)
    int p2;   // parameter 2 (damage, target...)
};
\`\`\`

## The Queue: Fixed Array, No Heap
No std::vector. No malloc. A plain fixed array and a counter.

\`\`\`cpp
const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int type, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD)
        cmd_queue[cmd_count++] = {type, p1, p2};
}
void clearQueue() { cmd_count = 0; }
\`\`\`

## Your Task
Fill in main() to enqueue 3 commands and print each one.

Expected output:
\`\`\`
Command 0: MOVE_RIGHT p1=0 p2=0
Command 1: MOVE_UP p1=0 p2=0
Command 2: ATTACK p1=0 p2=0
Queue: 3 commands
Pattern: command-queue
\`\`\`

## Beginner Trap
**Processing commands immediately instead of queuing them.** If "move north" triggers a trap that kills the player, and you process "use potion" next, the potion heals a dead player. Queue all commands, then resolve in order.

## Elite Insight
StarCraft and Age of Empires batch all player commands into lockstep frames for networking. Each frame processes a fixed command buffer. Your command queue is the single-player version of the same architecture.

## Systems Thinking Connection
The Shooter uses an event queue for collision events — batch all hits detected this frame, then resolve after all checks complete. Command batching prevents order-dependent bugs in every game genre.`,
    starterCode: `#include <iostream>
using namespace std;

const int CMD_NONE       = 0;
const int CMD_MOVE_UP    = 1;
const int CMD_MOVE_DOWN  = 2;
const int CMD_MOVE_LEFT  = 3;
const int CMD_MOVE_RIGHT = 4;
const int CMD_ATTACK     = 5;

struct Command { int type; int p1; int p2; };

const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int type, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD)
        cmd_queue[cmd_count++] = {type, p1, p2};
}
void clearQueue() { cmd_count = 0; }

const char* cmdName(int type) {
    switch(type) {
        case CMD_MOVE_UP:    return "MOVE_UP";
        case CMD_MOVE_DOWN:  return "MOVE_DOWN";
        case CMD_MOVE_LEFT:  return "MOVE_LEFT";
        case CMD_MOVE_RIGHT: return "MOVE_RIGHT";
        case CMD_ATTACK:     return "ATTACK";
        default:             return "NONE";
    }
}

int main() {
    // TODO 1: enqueueCmd(CMD_MOVE_RIGHT);
    // TODO 2: enqueueCmd(CMD_MOVE_UP);
    // TODO 3: enqueueCmd(CMD_ATTACK);

    // TODO 4: Print each command in the queue
    // for (int i = 0; i < cmd_count; i++)
    //     cout << "Command " << i << ": " << cmdName(cmd_queue[i].type)
    //          << " p1=" << cmd_queue[i].p1 << " p2=" << cmd_queue[i].p2 << endl;

    // TODO 5: cout << "Queue: " << cmd_count << " commands" << endl;
    // TODO 6: cout << "Pattern: command-queue" << endl;
    return 0;
} `,
    solutionCode: `#include <iostream>
using namespace std;

const int CMD_NONE       = 0;
const int CMD_MOVE_UP    = 1;
const int CMD_MOVE_DOWN  = 2;
const int CMD_MOVE_LEFT  = 3;
const int CMD_MOVE_RIGHT = 4;
const int CMD_ATTACK     = 5;

struct Command { int type; int p1; int p2; };

const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int type, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD)
        cmd_queue[cmd_count++] = {type, p1, p2};
}
void clearQueue() { cmd_count = 0; }

const char* cmdName(int type) {
    switch(type) {
        case CMD_MOVE_UP:    return "MOVE_UP";
        case CMD_MOVE_DOWN:  return "MOVE_DOWN";
        case CMD_MOVE_LEFT:  return "MOVE_LEFT";
        case CMD_MOVE_RIGHT: return "MOVE_RIGHT";
        case CMD_ATTACK:     return "ATTACK";
        default:             return "NONE";
    }
}

int main() {
    enqueueCmd(CMD_MOVE_RIGHT);
    enqueueCmd(CMD_MOVE_UP);
    enqueueCmd(CMD_ATTACK);
    for (int i = 0; i < cmd_count; i++)
        cout << "Command " << i << ": " << cmdName(cmd_queue[i].type)
             << " p1=" << cmd_queue[i].p1 << " p2=" << cmd_queue[i].p2 << endl;
    cout << "Queue: " << cmd_count << " commands" << endl;
    cout << "Pattern: command-queue" << endl;
    return 0;
} `,
    tests: [
      { id: "t1", description: "Command 0 is MOVE_RIGHT", expectedOutput: "Command 0: MOVE_RIGHT p1=0 p2=0", isPattern: false },
      { id: "t2", description: "Queue count correct", expectedOutput: "Queue: 3 commands", isPattern: false },
      { id: "t3", description: "Pattern confirmed", expectedOutput: "Pattern: command-queue", isPattern: false },
    ],
    hints: [
      "Call enqueueCmd(CMD_MOVE_RIGHT), then enqueueCmd(CMD_MOVE_UP), then enqueueCmd(CMD_ATTACK).",
      "Loop: for (int i = 0; i < cmd_count; i++) and print cmdName(cmd_queue[i].type), p1, p2.",
      "After the loop, print the queue count with cmd_count, then the pattern string.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: Command Queue Formalized",
    type: "game_builder",
    instructions: `# Build: Command Queue Formalized

## What Changes
\`pending_intent\` is a single integer — one command, no parameters, no extension points.
We replace it with a **Command POD struct** stored in a fixed-size queue.
Same gameplay, cleaner architecture, room to grow.

## Step 1: Remove pending_intent, add Command queue
Delete the INTENT constants and \`int pending_intent\`. Add:

\`\`\`cpp
const int CMD_NONE=0, CMD_MOVE_UP=1, CMD_MOVE_DOWN=2, CMD_MOVE_LEFT=3, CMD_MOVE_RIGHT=4, CMD_ATTACK=5;
struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;
void enqueueCmd(int t,int p1=0,int p2=0){if(cmd_count<MAX_CMD)cmd_queue[cmd_count++]={t,p1,p2};}
void clearQueue(){cmd_count=0;}
\`\`\`

## Step 2: Update resolve functions to take Command&

\`\`\`cpp
void resolveMovement(Command& c) {
    if (c.type == CMD_NONE || c.type == CMD_ATTACK) return;
    int nx = world.pos[world.player_id].x;
    int ny = world.pos[world.player_id].y;
    if (c.type == CMD_MOVE_UP)    ny--;
    else if (c.type == CMD_MOVE_DOWN)  ny++;
    else if (c.type == CMD_MOVE_LEFT)  nx--;
    else if (c.type == CMD_MOVE_RIGHT) nx++;
    if (nx<0||nx>=GRID_W||ny<0||ny>=GRID_H) return;
    if (tiles[ny][nx] == TILE_WALL) return;
    if (world.enemy_alive && nx==world.pos[world.enemy_id].x && ny==world.pos[world.enemy_id].y) {
        c.type = CMD_ATTACK; return;
    }
    world.pos[world.player_id].x = nx;
    world.pos[world.player_id].y = ny;
}

void resolveCombat(Command& c) {
    if (c.type != CMD_ATTACK) return;
    int dmg = 3;
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
}
\`\`\`

## Step 3: Wire phaseInput to enqueue commands

\`\`\`cpp
void phaseInput() {
    clearQueue();
    if (IsKeyPressed(KEY_W))      enqueueCmd(CMD_MOVE_UP);
    else if (IsKeyPressed(KEY_S)) enqueueCmd(CMD_MOVE_DOWN);
    else if (IsKeyPressed(KEY_A)) enqueueCmd(CMD_MOVE_LEFT);
    else if (IsKeyPressed(KEY_D)) enqueueCmd(CMD_MOVE_RIGHT);
}
\`\`\`

## Step 4: phaseResolve iterates the queue

\`\`\`cpp
void phaseResolve() {
    for (int i = 0; i < cmd_count; i++) {
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
    }
}
\`\`\`

## Step 5: Update loop condition and HUD
Change \`if (pending_intent != INTENT_NONE)\` to \`if (cmd_count > 0)\`.
Replace the \`Intent:\` HUD line with \`Queue: N cmd\`.

**Click Run now** — gameplay identical, architecture upgraded.

Expected startup output:
\`\`\`
Player: (5, 5)
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
Enemy: (9, 7)
Enemies: 1
Combat: bump
Player HP: 20/20
Enemy HP: 10/10
Kill: hp-to-zero
Milestone: micro-dungeon
Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER
Struct: world
Vec2i: OK
IDs: OK
SoA: OK
Milestone: stable-update-order
Queue: active
CMD: POD struct
Pattern: command-queue
\`\`\``,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];

// Command type constants (replace old INTENT_ constants)
const int CMD_NONE       = 0;
const int CMD_MOVE_UP    = 1;
const int CMD_MOVE_DOWN  = 2;
const int CMD_MOVE_LEFT  = 3;
const int CMD_MOVE_RIGHT = 4;
const int CMD_ATTACK     = 5;

// TODO 1: Define struct Command { int type; int p1; int p2; };
// TODO 2: const int MAX_CMD = 4; Command cmd_queue[MAX_CMD]; int cmd_count = 0;
// TODO 3: void enqueueCmd(int t,int p1=0,int p2=0) { if(cmd_count<MAX_CMD) cmd_queue[cmd_count++]={t,p1,p2}; }
// TODO 4: void clearQueue() { cmd_count = 0; }

const int NO_ENTITY    = -1;
const int MAX_ENTITIES = 2;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
    int frame_count = 0;
};
World world;

// TODO 5: void resolveMovement(Command& c) { ... }  (replaces resolveCommand)
// TODO 6: void resolveCombat(Command& c) { ... }    (takes Command& instead of pending_intent)

void phaseInput() {
    // TODO 7: clearQueue();
    // TODO 8: if (IsKeyPressed(KEY_W)) enqueueCmd(CMD_MOVE_UP);
    // TODO 9: else if (IsKeyPressed(KEY_S)) enqueueCmd(CMD_MOVE_DOWN);
    // TODO 10: else if (IsKeyPressed(KEY_A)) enqueueCmd(CMD_MOVE_LEFT);
    // TODO 11: else if (IsKeyPressed(KEY_D)) enqueueCmd(CMD_MOVE_RIGHT);
}

void phaseResolve() {
    // TODO 12: for (int i = 0; i < cmd_count; i++) {
    //     resolveMovement(cmd_queue[i]);
    //     resolveCombat(cmd_queue[i]);
    // }
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.pos[world.player_id].x - world.pos[world.enemy_id].x;
    int dy = world.pos[world.player_id].y - world.pos[world.enemy_id].y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.pos[world.enemy_id].x + move_x;
    int ny = world.pos[world.enemy_id].y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.pos[world.player_id].x && ny == world.pos[world.player_id].y)) {
        world.pos[world.enemy_id].x = nx; world.pos[world.enemy_id].y = ny;
    }
}

void phaseCleanup() {
    if (world.enemy_alive && world.enemy_hp <= 0) {
        world.enemy_alive = false;
        world.kills++;
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = (y==0||y==GRID_H-1||x==0||x==GRID_W-1) ? TILE_WALL : TILE_FLOOR;
    tiles[3][4] = TILE_WALL; tiles[3][5] = TILE_WALL;
    tiles[6][7] = TILE_WALL; tiles[6][8] = TILE_WALL;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();
    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    cout << "Vec2i: OK" << endl;
    cout << "IDs: OK" << endl;
    cout << "SoA: OK" << endl;
    cout << "Milestone: stable-update-order" << endl;
    // TODO 13: cout << "Queue: active" << endl;
    // TODO 14: cout << "CMD: POD struct" << endl;
    // TODO 15: cout << "Pattern: command-queue" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        phaseInput();
        // TODO 16: change condition from pending_intent check to: if (cmd_count > 0)
        phaseResolve();
        phaseWorld();
        phaseCleanup();
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == TILE_WALL) ? GRAY : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        // TODO 17: DrawText(TextFormat("Queue: %d cmd", cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        EndDrawing();
    }
    CloseWindow();
    return 0;
} `,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int CMD_NONE       = 0;
const int CMD_MOVE_UP    = 1;
const int CMD_MOVE_DOWN  = 2;
const int CMD_MOVE_LEFT  = 3;
const int CMD_MOVE_RIGHT = 4;
const int CMD_ATTACK     = 5;

struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int t, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD) cmd_queue[cmd_count++] = {t, p1, p2};
}
void clearQueue() { cmd_count = 0; }

const int NO_ENTITY    = -1;
const int MAX_ENTITIES = 2;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
    int frame_count = 0;
};
World world;

void resolveMovement(Command& c) {
    if (c.type == CMD_NONE || c.type == CMD_ATTACK) return;
    int nx = world.pos[world.player_id].x;
    int ny = world.pos[world.player_id].y;
    if (c.type == CMD_MOVE_UP)         ny--;
    else if (c.type == CMD_MOVE_DOWN)  ny++;
    else if (c.type == CMD_MOVE_LEFT)  nx--;
    else if (c.type == CMD_MOVE_RIGHT) nx++;
    if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return;
    if (tiles[ny][nx] == TILE_WALL) return;
    if (world.enemy_alive && nx == world.pos[world.enemy_id].x && ny == world.pos[world.enemy_id].y) {
        c.type = CMD_ATTACK; return;
    }
    world.pos[world.player_id].x = nx;
    world.pos[world.player_id].y = ny;
}

void resolveCombat(Command& c) {
    if (c.type != CMD_ATTACK) return;
    int dmg = 3;
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
}

void phaseInput() {
    clearQueue();
    if (IsKeyPressed(KEY_W))      enqueueCmd(CMD_MOVE_UP);
    else if (IsKeyPressed(KEY_S)) enqueueCmd(CMD_MOVE_DOWN);
    else if (IsKeyPressed(KEY_A)) enqueueCmd(CMD_MOVE_LEFT);
    else if (IsKeyPressed(KEY_D)) enqueueCmd(CMD_MOVE_RIGHT);
}

void phaseResolve() {
    for (int i = 0; i < cmd_count; i++) {
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
    }
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.pos[world.player_id].x - world.pos[world.enemy_id].x;
    int dy = world.pos[world.player_id].y - world.pos[world.enemy_id].y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.pos[world.enemy_id].x + move_x;
    int ny = world.pos[world.enemy_id].y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.pos[world.player_id].x && ny == world.pos[world.player_id].y)) {
        world.pos[world.enemy_id].x = nx; world.pos[world.enemy_id].y = ny;
    }
}

void phaseCleanup() {
    if (world.enemy_alive && world.enemy_hp <= 0) {
        world.enemy_alive = false;
        world.kills++;
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = (y==0||y==GRID_H-1||x==0||x==GRID_W-1) ? TILE_WALL : TILE_FLOOR;
    tiles[3][4] = TILE_WALL; tiles[3][5] = TILE_WALL;
    tiles[6][7] = TILE_WALL; tiles[6][8] = TILE_WALL;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();
    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    cout << "Vec2i: OK" << endl;
    cout << "IDs: OK" << endl;
    cout << "SoA: OK" << endl;
    cout << "Milestone: stable-update-order" << endl;
    cout << "Queue: active" << endl;
    cout << "CMD: POD struct" << endl;
    cout << "Pattern: command-queue" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        phaseInput();
        if (cmd_count > 0) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == TILE_WALL) ? GRAY : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Queue: %d cmd", cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        EndDrawing();
    }
    CloseWindow();
    return 0;
} `,
    tests: [
      { id: "g1", description: "Player at start", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Milestone stable-update-order", expectedOutput: "Milestone: stable-update-order", isPattern: false },
      { id: "g3", description: "Pattern: command-queue", expectedOutput: "Pattern: command-queue", isPattern: false },
    ],
    hints: [
      "Start by defining struct Command { int type; int p1; int p2; }; and the cmd_queue array at the top.",
      "resolveMovement(Command& c) uses c.type instead of pending_intent. When bumping enemy, set c.type = CMD_ATTACK.",
      "phaseResolve() loops for (int i = 0; i < cmd_count; i++) and calls resolveMovement then resolveCombat.",
    ],
    estimatedMinutes: 20
  }
};