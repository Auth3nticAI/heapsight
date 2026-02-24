import { Lesson } from "@/types/lesson";

export const lessonRPG31: Lesson = {
  id: "rpg-31-input-module-split",
  title: "Input Module",
  description: "Isolate all input handling into a single-responsibility module. A key mapping table replaces chained if-else. The input system reads keys and enqueues commands — nothing else.",
  order: 31,
  xpReward: 100,
  tier: "pro",
  concepts: ["input module", "single responsibility", "key mapping", "module isolation", "system boundary"],
  part1: {
    title: "Concept: Input Module Isolation",
    type: "concept",
    instructions: `# Input Module Isolation

## Mental Model
An input module has ONE job: read hardware state and produce commands. It does not move the player. It does not resolve combat. It does not render anything. It reads keys and enqueues commands into the command queue. Period.

## What Breaks Without This
Right now your \`phaseInput()\` function uses chained if-else statements: \`if (IsKeyPressed(KEY_W)) enqueueCmd(CMD_MOVE_UP)\` and so on. That works with 4 keys. Add rebindable controls, gamepad support, or input recording, and the if-else chain becomes unmaintainable. Worse, the save/load logic lives inside phaseInput — that's not input handling, that's persistence. The module has two responsibilities instead of one.

## The Fix: Key Mapping Table
Replace the if-else chain with a data table:

\`\`\`cpp
struct KeyMapping { int key; int cmd; };
KeyMapping key_map[] = {
    {KEY_W, CMD_MOVE_UP},
    {KEY_S, CMD_MOVE_DOWN},
    {KEY_A, CMD_MOVE_LEFT},
    {KEY_D, CMD_MOVE_RIGHT},
};\`\`\`

Now phaseInput loops over the table instead of branching per key. Adding a new key binding is adding a row — not editing control flow.

## Key Concepts
- Single responsibility: one module, one job
- Key mapping table: data-driven input binding
- Module boundary: input produces commands, nothing else
- Separation of concerns: save/load is NOT input handling

## Performance Insight
A key mapping table with 4-6 entries fits in a single cache line (64 bytes). The loop is branchless from the CPU's perspective — it's a linear scan with a conditional enqueue. For 6 entries, this is faster than a branch predictor trying to learn 6 different if-else paths.

## Memory Insight
KeyMapping is a POD struct: two ints = 8 bytes. Six entries = 48 bytes on the stack. No heap. No virtual dispatch. No string comparisons. Just integer keys and integer commands.

## Your Task
Create a key mapping array and loop over it to detect pressed keys and enqueue the matching commands. Print the mapping count and the module name.

Expected output:
\`\`\`
Keys: 4
Input: isolated
Module: hs_input
\`\`\`

## Beginner Trap
**Putting game logic inside the input handler.** If your input function moves the player directly (\`player_x += 1\`), you've broken the command pipeline. Input should ONLY enqueue commands. The resolve pass decides if the command succeeds.

## Elite Insight
Quake's input system maps hardware events to command strings through a binding table. \`bind w +forward\` maps the W key to the forward command. Your key_map table follows the exact same pattern — mapping hardware key codes to game command IDs. Same architecture, simpler scale.

## Systems Thinking Connection
This input module pattern is identical across all HeapSight paths. The Space Shooter maps keys to ship commands. The Platformer maps keys to movement intents. The RPG maps keys to turn commands. Different games, same module boundary — input reads hardware, produces commands, touches nothing else.

## Skill Reinforcement
Lesson 2 introduced player intent. Lesson 5 formalized the turn pipeline. This lesson isolates the first stage of that pipeline — input — into a proper module. Lesson 32 will isolate the last stage: rendering.

## Mastery Check
Question: Why should the input module NOT handle save/load directly?
Answer: Because save/load is persistence, not input. The input module should enqueue a CMD_SAVE or CMD_LOAD command, and the resolve pass should handle the actual persistence logic. This keeps the input module's responsibility singular and testable.`,
    starterCode: `#include <iostream>
using namespace std;

const int CMD_MOVE_UP = 1, CMD_MOVE_DOWN = 2;
const int CMD_MOVE_LEFT = 3, CMD_MOVE_RIGHT = 4;

struct KeyMapping { int key; int cmd; };

int main() {
    // TODO: Create a key_map array with 4 entries
    // W=87 -> CMD_MOVE_UP, S=83 -> CMD_MOVE_DOWN
    // A=65 -> CMD_MOVE_LEFT, D=68 -> CMD_MOVE_RIGHT
    int map_count = 0; // TODO: set to the actual count

    cout << "Keys: " << map_count << endl;
    cout << "Input: isolated" << endl;
    cout << "Module: hs_input" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int CMD_MOVE_UP = 1, CMD_MOVE_DOWN = 2;
const int CMD_MOVE_LEFT = 3, CMD_MOVE_RIGHT = 4;

struct KeyMapping { int key; int cmd; };

int main() {
    KeyMapping key_map[] = {
        {87, CMD_MOVE_UP},
        {83, CMD_MOVE_DOWN},
        {65, CMD_MOVE_LEFT},
        {68, CMD_MOVE_RIGHT},
    };
    int map_count = 4;

    cout << "Keys: " << map_count << endl;
    cout << "Input: isolated" << endl;
    cout << "Module: hs_input" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "4 key mappings", expectedOutput: "Keys: 4", isPattern: false },
      { id: "t2", description: "Input isolated", expectedOutput: "Input: isolated", isPattern: false },
      { id: "t3", description: "Module name", expectedOutput: "Module: hs_input", isPattern: false },
    ],
    hints: [
      "Create an array of KeyMapping structs. Each entry maps a key code to a command ID.",
      "Use integer key codes: W=87, S=83, A=65, D=68. Map each to the corresponding CMD constant.",
      "KeyMapping key_map[] = { {87, CMD_MOVE_UP}, {83, CMD_MOVE_DOWN}, {65, CMD_MOVE_LEFT}, {68, CMD_MOVE_RIGHT} }; and set map_count = 4."
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Input Module Isolation",
    type: "game_builder",
    instructions: `# Build: Input Module Isolation

## Mental Model
Your phaseInput function currently uses chained if-else statements for each key. This lesson replaces that with a key mapping table — a fixed array of {key, command} pairs. The phaseInput loop scans the table and enqueues matching commands. Adding or removing a key binding means editing data, not control flow.

## What to Add

### Step 1: Add the key mapping table
Above phaseInput, define the mapping table:
\`\`\`cpp
struct KeyMapping { int key; int cmd; };
const int MAX_KEYMAPS = 4;
KeyMapping key_map[MAX_KEYMAPS] = {
    {KEY_W, CMD_MOVE_UP},
    {KEY_S, CMD_MOVE_DOWN},
    {KEY_A, CMD_MOVE_LEFT},
    {KEY_D, CMD_MOVE_RIGHT},
};
\`\`\`

### Step 2: Rewrite phaseInput to use the table
\`\`\`cpp
void phaseInput() {
    clearQueue();
    for (int i = 0; i < MAX_KEYMAPS; i++) {
        if (IsKeyPressed(key_map[i].key))
            enqueueCmd(key_map[i].cmd);
    }
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}
\`\`\`

### Step 3: Add startup diagnostics
\`\`\`cpp
cout << "Input: isolated" << endl;
cout << "Module: hs_input" << endl;
\`\`\`

## Expected new startup lines
\`\`\`
...GATE A: passed
Input: isolated
Module: hs_input
\`\`\`

## Beginner Trap
**Keeping the save/load checks inside the key mapping table.** Save and load are persistence operations, not movement commands. They should stay as separate IsKeyPressed checks outside the mapping loop. The table is for commands that go through the pipeline.

## Elite Insight
id Software's engines store all key bindings in a config file parsed at startup. The engine never has hardcoded if-else chains for keys — it's always a table lookup. Your key_map array is the same pattern. When you add gamepad support later, you add rows to the table — you don't rewrite phaseInput.

## Mastery Check
Question: Why is save/load handled separately from the key mapping table?
Answer: Because save/load are not game commands that flow through the command pipeline. They are immediate persistence operations. Mixing them into the command table would mean the resolve pass needs to handle persistence — violating single responsibility.`,
    starterCode: `#include <iostream>
#include <cstdint>
#include "raylib.h"
using namespace std;

const int GRID_W = 12; const int GRID_H = 10; const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int CMD_NONE=0, CMD_MOVE_UP=1, CMD_MOVE_DOWN=2;
const int CMD_MOVE_LEFT=3, CMD_MOVE_RIGHT=4, CMD_ATTACK=5;
const int TILE_EXIT = 2;
int current_room = 0;

struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int t, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD) cmd_queue[cmd_count++] = {t, p1, p2};
}
void clearQueue() { cmd_count = 0; }

const int MAX_ENTITIES = 2;
struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0; int enemy_id = 1;
    Vec2i pos[MAX_ENTITIES] = {{1,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0; int kills = 0; int frame_count = 0;
};
World world;

int room_data[2][GRID_H][GRID_W] = {
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,1,1,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,2,1},
    {1,0,0,0,0,0,0,1,1,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  },
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,2,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  }
};

void loadRoom(int id) {
    current_room = id;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = room_data[id][y][x];
    if (id == 0) { world.pos[world.player_id] = {1,5}; world.pos[world.enemy_id] = {9,7}; }
    else         { world.pos[world.player_id] = {10,5}; world.pos[world.enemy_id] = {3,7}; }
    world.enemy_alive = true; world.enemy_hp = 10;
    cout << "Room: " << id << endl;
}

uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}

uint32_t worldHash() {
    uint32_t h = 0;
    h ^= (uint32_t)world.pos[world.player_id].x;
    h ^= (uint32_t)world.pos[world.player_id].y << 4;
    h ^= (uint32_t)world.enemy_hp << 8;
    h ^= (uint32_t)world.kills << 16;
    return h;
}

struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer;
bool has_save = false;

void saveGame() {
    save_buffer = { rng_state, current_room, world.player_hp };
    has_save = true;
    cout << "Saved" << endl;
}

void loadGame() {
    if (!has_save) return;
    rng_seed(save_buffer.seed);
    world.player_hp = save_buffer.player_hp;
    loadRoom(save_buffer.room);
    cout << "Loaded" << endl;
}

const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4] = {"", "Sword", "Shield", "Potion"};
int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    cout << "Inventory: full" << endl;
}
int tick_alloc = 0;

// === INPUT MODULE (hs_input.h) ===
// TODO 1: Define KeyMapping struct: { int key; int cmd; }
// TODO 2: Create key_map array with 4 entries:
//   KEY_W -> CMD_MOVE_UP, KEY_S -> CMD_MOVE_DOWN
//   KEY_A -> CMD_MOVE_LEFT, KEY_D -> CMD_MOVE_RIGHT
// TODO 3: Define MAX_KEYMAPS = 4

void phaseInput() {
    clearQueue();
    // TODO 4: Replace the if-else chain below with a loop
    //   over key_map[0..MAX_KEYMAPS]. For each entry, if
    //   IsKeyPressed(key_map[i].key), call enqueueCmd(key_map[i].cmd)
    if (IsKeyPressed(KEY_W))      enqueueCmd(CMD_MOVE_UP);
    else if (IsKeyPressed(KEY_S)) enqueueCmd(CMD_MOVE_DOWN);
    else if (IsKeyPressed(KEY_A)) enqueueCmd(CMD_MOVE_LEFT);
    else if (IsKeyPressed(KEY_D)) enqueueCmd(CMD_MOVE_RIGHT);
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

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
    if (tiles[ny][nx] == TILE_EXIT) { loadRoom(1 - current_room); return; }
    if (world.enemy_alive && nx == world.pos[world.enemy_id].x && ny == world.pos[world.enemy_id].y) {
        c.type = CMD_ATTACK; return;
    }
    world.pos[world.player_id].x = nx; world.pos[world.player_id].y = ny;
}

int calcDamage(int base) { return base; }
int lootDrop() { return (int)(rng_next() % 3) + 1; }
void resolveCombat(Command& c) {
    if (c.type != CMD_ATTACK) return;
    int dmg = calcDamage(3);
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
}

void phaseResolve() {
    for (int i = 0; i < cmd_count; i++) {
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
    }
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    if (rng_next() % 4 == 0) return;
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
        world.enemy_alive = false; world.kills++;
        int loot = lootDrop();
        addItem(loot);
        cout << "Kill confirmed" << endl;
        cout << "Loot: " << loot << endl;
    }
    world.turn_count++;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0);
    saveGame();
    addItem(ITEM_SWORD);

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
    cout << "Resolve: isolated" << endl;
    cout << "Pattern: resolve-isolated" << endl;
    cout << "Combat: isolated" << endl;
    cout << "Pattern: combat-isolated" << endl;
    cout << "Cleanup: isolated" << endl;
    cout << "Pattern: cleanup-isolated" << endl;
    cout << "Room: data-driven" << endl;
    cout << "Exit: tile-trigger" << endl;
    cout << "Milestone: room-transition" << endl;
    cout << "RNG: seeded" << endl;
    cout << "Seed: 12345" << endl;
    cout << "Pattern: deterministic-rng" << endl;
    cout << "Rand: banned" << endl;
    cout << "RNG: single-source" << endl;
    cout << "Pattern: no-rand" << endl;
    cout << "Signature: v0" << endl;
    cout << "Hash: active" << endl;
    cout << "Pattern: state-signature" << endl;
    cout << "Save: v0" << endl;
    cout << "Fields: seed,room,hp" << endl;
    cout << "Pattern: save-file" << endl;
    cout << "Restart: ok" << endl;
    cout << "Resume: ok" << endl;
    cout << "Milestone: restart-resume" << endl;
    cout << "Inventory: v0" << endl;
    cout << "Slots: 5" << endl;
    cout << "Pattern: fixed-inventory" << endl;
    cout << "Items: ID-based" << endl;
    cout << "Table: static" << endl;
    cout << "Pattern: item-ids" << endl;
    cout << "Loot: rng-driven" << endl;
    cout << "Drop: on-kill" << endl;
    cout << "Pattern: deterministic-loot" << endl;
    cout << "Alloc: tracked" << endl;
    cout << "Counter: active" << endl;
    cout << "Pattern: alloc-counter" << endl;
    cout << "Heap: frozen" << endl;
    cout << "Alloc/tick: 0" << endl;
    cout << "GATE A: passed" << endl;
    // TODO 5: cout << "Input: isolated" << endl;
    // TODO 6: cout << "Module: hs_input" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        tick_alloc = 0;
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
                Color tc = (tiles[y][x] == TILE_WALL) ? GRAY :
                           (tiles[y][x] == TILE_EXIT) ? YELLOW : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, tc);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Queue: %d cmd", cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Room: %d", current_room), 400, 100, 16, YELLOW);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        DrawText(TextFormat("Hash: %u", worldHash()), 400, 260, 14, GRAY);
        DrawText(has_save ? "Save: YES" : "Save: NO", 400, 280, 14, has_save ? GREEN : GRAY);
        DrawText("-- Inventory --", 400, 300, 14, YELLOW);
        for (int i = 0; i < 5; i++) {
            Color ic = inv_items[i] > 0 ? YELLOW : GRAY;
            const char* nm = inv_items[i] > 0 ? ITEM_NAMES[inv_items[i]] : "--";
            DrawText(TextFormat("Slot%d: %s", i, nm), 400, 316+i*16, 13, ic);
        }
        DrawText(TextFormat("Alloc/tick: %d", tick_alloc), 400, 396, 13, tick_alloc == 0 ? GREEN : RED);
        DrawText("GATE A: PASS", 400, 412, 14, GREEN);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdint>
#include "raylib.h"
using namespace std;

const int GRID_W = 12; const int GRID_H = 10; const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int CMD_NONE=0, CMD_MOVE_UP=1, CMD_MOVE_DOWN=2;
const int CMD_MOVE_LEFT=3, CMD_MOVE_RIGHT=4, CMD_ATTACK=5;
const int TILE_EXIT = 2;
int current_room = 0;

struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int t, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD) cmd_queue[cmd_count++] = {t, p1, p2};
}
void clearQueue() { cmd_count = 0; }

const int MAX_ENTITIES = 2;
struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0; int enemy_id = 1;
    Vec2i pos[MAX_ENTITIES] = {{1,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0; int kills = 0; int frame_count = 0;
};
World world;

int room_data[2][GRID_H][GRID_W] = {
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,1,1,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,2,1},
    {1,0,0,0,0,0,0,1,1,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  },
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,2,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  }
};

void loadRoom(int id) {
    current_room = id;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = room_data[id][y][x];
    if (id == 0) { world.pos[world.player_id] = {1,5}; world.pos[world.enemy_id] = {9,7}; }
    else         { world.pos[world.player_id] = {10,5}; world.pos[world.enemy_id] = {3,7}; }
    world.enemy_alive = true; world.enemy_hp = 10;
    cout << "Room: " << id << endl;
}

uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}

uint32_t worldHash() {
    uint32_t h = 0;
    h ^= (uint32_t)world.pos[world.player_id].x;
    h ^= (uint32_t)world.pos[world.player_id].y << 4;
    h ^= (uint32_t)world.enemy_hp << 8;
    h ^= (uint32_t)world.kills << 16;
    return h;
}

struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer;
bool has_save = false;

void saveGame() {
    save_buffer = { rng_state, current_room, world.player_hp };
    has_save = true;
    cout << "Saved" << endl;
}

void loadGame() {
    if (!has_save) return;
    rng_seed(save_buffer.seed);
    world.player_hp = save_buffer.player_hp;
    loadRoom(save_buffer.room);
    cout << "Loaded" << endl;
}

const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4] = {"", "Sword", "Shield", "Potion"};
int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    cout << "Inventory: full" << endl;
}
int tick_alloc = 0;

// === INPUT MODULE (hs_input.h) ===
struct KeyMapping { int key; int cmd; };
const int MAX_KEYMAPS = 4;
KeyMapping key_map[MAX_KEYMAPS] = {
    {KEY_W, CMD_MOVE_UP},
    {KEY_S, CMD_MOVE_DOWN},
    {KEY_A, CMD_MOVE_LEFT},
    {KEY_D, CMD_MOVE_RIGHT},
};

void phaseInput() {
    clearQueue();
    for (int i = 0; i < MAX_KEYMAPS; i++) {
        if (IsKeyPressed(key_map[i].key))
            enqueueCmd(key_map[i].cmd);
    }
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

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
    if (tiles[ny][nx] == TILE_EXIT) { loadRoom(1 - current_room); return; }
    if (world.enemy_alive && nx == world.pos[world.enemy_id].x && ny == world.pos[world.enemy_id].y) {
        c.type = CMD_ATTACK; return;
    }
    world.pos[world.player_id].x = nx; world.pos[world.player_id].y = ny;
}

int calcDamage(int base) { return base; }
int lootDrop() { return (int)(rng_next() % 3) + 1; }
void resolveCombat(Command& c) {
    if (c.type != CMD_ATTACK) return;
    int dmg = calcDamage(3);
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
}

void phaseResolve() {
    for (int i = 0; i < cmd_count; i++) {
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
    }
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    if (rng_next() % 4 == 0) return;
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
        world.enemy_alive = false; world.kills++;
        int loot = lootDrop();
        addItem(loot);
        cout << "Kill confirmed" << endl;
        cout << "Loot: " << loot << endl;
    }
    world.turn_count++;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0);
    saveGame();
    addItem(ITEM_SWORD);

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
    cout << "Resolve: isolated" << endl;
    cout << "Pattern: resolve-isolated" << endl;
    cout << "Combat: isolated" << endl;
    cout << "Pattern: combat-isolated" << endl;
    cout << "Cleanup: isolated" << endl;
    cout << "Pattern: cleanup-isolated" << endl;
    cout << "Room: data-driven" << endl;
    cout << "Exit: tile-trigger" << endl;
    cout << "Milestone: room-transition" << endl;
    cout << "RNG: seeded" << endl;
    cout << "Seed: 12345" << endl;
    cout << "Pattern: deterministic-rng" << endl;
    cout << "Rand: banned" << endl;
    cout << "RNG: single-source" << endl;
    cout << "Pattern: no-rand" << endl;
    cout << "Signature: v0" << endl;
    cout << "Hash: active" << endl;
    cout << "Pattern: state-signature" << endl;
    cout << "Save: v0" << endl;
    cout << "Fields: seed,room,hp" << endl;
    cout << "Pattern: save-file" << endl;
    cout << "Restart: ok" << endl;
    cout << "Resume: ok" << endl;
    cout << "Milestone: restart-resume" << endl;
    cout << "Inventory: v0" << endl;
    cout << "Slots: 5" << endl;
    cout << "Pattern: fixed-inventory" << endl;
    cout << "Items: ID-based" << endl;
    cout << "Table: static" << endl;
    cout << "Pattern: item-ids" << endl;
    cout << "Loot: rng-driven" << endl;
    cout << "Drop: on-kill" << endl;
    cout << "Pattern: deterministic-loot" << endl;
    cout << "Alloc: tracked" << endl;
    cout << "Counter: active" << endl;
    cout << "Pattern: alloc-counter" << endl;
    cout << "Heap: frozen" << endl;
    cout << "Alloc/tick: 0" << endl;
    cout << "GATE A: passed" << endl;
    cout << "Input: isolated" << endl;
    cout << "Module: hs_input" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        tick_alloc = 0;
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
                Color tc = (tiles[y][x] == TILE_WALL) ? GRAY :
                           (tiles[y][x] == TILE_EXIT) ? YELLOW : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, tc);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Queue: %d cmd", cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Room: %d", current_room), 400, 100, 16, YELLOW);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        DrawText(TextFormat("Hash: %u", worldHash()), 400, 260, 14, GRAY);
        DrawText(has_save ? "Save: YES" : "Save: NO", 400, 280, 14, has_save ? GREEN : GRAY);
        DrawText("-- Inventory --", 400, 300, 14, YELLOW);
        for (int i = 0; i < 5; i++) {
            Color ic = inv_items[i] > 0 ? YELLOW : GRAY;
            const char* nm = inv_items[i] > 0 ? ITEM_NAMES[inv_items[i]] : "--";
            DrawText(TextFormat("Slot%d: %s", i, nm), 400, 316+i*16, 13, ic);
        }
        DrawText(TextFormat("Alloc/tick: %d", tick_alloc), 400, 396, 13, tick_alloc == 0 ? GREEN : RED);
        DrawText("GATE A: PASS", 400, 412, 14, GREEN);
        DrawText("Input: hs_input", 400, 428, 13, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player at spawn", expectedOutput: "Player: (1, 5)", isPattern: false },
      { id: "g2", description: "GATE A passed", expectedOutput: "GATE A: passed", isPattern: false },
      { id: "g3", description: "Input isolated", expectedOutput: "Input: isolated", isPattern: false },
      { id: "g4", description: "Module name", expectedOutput: "Module: hs_input", isPattern: false },
    ],
    hints: [
      "Define struct KeyMapping with two int fields: key and cmd. Create an array of 4 entries mapping KEY_W/S/A/D to the CMD constants.",
      "Replace the if-else chain in phaseInput with: for (int i = 0; i < MAX_KEYMAPS; i++) { if (IsKeyPressed(key_map[i].key)) enqueueCmd(key_map[i].cmd); }",
      "Keep the F5/F9 save/load checks as separate if-statements after the mapping loop. Add cout lines for Input: isolated and Module: hs_input after GATE A: passed."
    ],
    estimatedMinutes: 15
  }
};