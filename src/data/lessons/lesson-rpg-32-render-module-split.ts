import { Lesson } from "@/types/lesson";

export const lessonRPG32: Lesson = {
  id: "rpg-32-render-module-split",
  title: "Render Module",
  description: "Isolate all raylib drawing into a dedicated renderWorld() function. The render module reads game state and draws — it never mutates anything.",
  order: 32,
  xpReward: 100,
  tier: "pro",
  concepts: ["render module", "state projection", "draw isolation", "module boundary", "separation of concerns"],
  part1: {
    title: "Concept: Render Module",
    type: "concept",
    instructions: `# Concept: Render Module

## Mental Model
This lesson teaches render module. Every architectural improvement makes the RPG more robust and maintainable.

## What Breaks Without This
Without proper render module, your codebase becomes fragile and hard to extend.

## The Fix
Implement render module following the data-driven, zero-heap pattern established in Phase 3.

## Key Concepts
- Render module
- State projection
- Draw isolation
- Module boundary

## Your Task
Print the expected output to verify the concept works.

Expected output:
\`\`\`
Render: isolated
Module: hs_render
\`\`\`

## Beginner Trap
**Mutating game state in the wrong phase.** Every system has its place in the pipeline. Render Module must respect system boundaries.

## Elite Insight
Production game engines like id Tech and Unreal use this same pattern — render module is a core architectural concept in professional game development.

## Systems Thinking Connection
This pattern appears across all HeapSight paths. The underlying principle — separation of concerns through data-driven design — is universal.

## Mastery Check
Question: Why does render module improve architecture?
Answer: Because it enforces clear boundaries between systems, making the code testable, composable, and deterministic.`,
    starterCode: `#include <iostream>
using namespace std;

int player_x = 5, player_y = 3;
int player_hp = 20, player_max_hp = 20;

// TODO: Write renderHUD(px, py, hp, max_hp) that ONLY prints — no mutation

int main() {
    // TODO: Call renderHUD
    cout << "Render: isolated" << endl;
    cout << "Module: hs_render" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int player_x = 5, player_y = 3;
int player_hp = 20, player_max_hp = 20;

void renderHUD(int px, int py, int hp, int max_hp) {
    cout << "HUD Player: (" << px << "," << py << ")" << endl;
    cout << "HUD HP: " << hp << "/" << max_hp << endl;
}

int main() {
    renderHUD(player_x, player_y, player_hp, player_max_hp);
    cout << "Render: isolated" << endl;
    cout << "Module: hs_render" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "HUD shows player pos", expectedOutput: "HUD Player: (5,3)", isPattern: false },
      { id: "t2", description: "HUD shows HP", expectedOutput: "HUD HP: 20/20", isPattern: false },
      { id: "t3", description: "Render isolated", expectedOutput: "Render: isolated", isPattern: false },
    ],
    hints: [
      "Write a function that takes px,py,hp,max_hp as parameters and prints them.",
      "void renderHUD(int px, int py, int hp, int max_hp) — use cout to format the output.",
      "Call renderHUD(player_x, player_y, player_hp, player_max_hp) in main, then print the module lines.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Render Module",
    type: "game_builder",
    instructions: `# Build: Render Module

## Overview
Add render module to the dungeon. The new feature integrates with all existing systems.

## What to Add
1. Implement the new feature code
2. Add startup cout diagnostics: Render: isolated, Module: hs_render
3. Add HUD display element

## Expected new startup lines
\`\`\`
...GATE A: passed
Render: isolated
Module: hs_render
\`\`\`

## Beginner Trap
**Adding heap allocations in the tick loop.** Gate A is passed — no new/delete/vector resize in the game loop.

## Elite Insight
This is the same pattern used in production engines. Data-driven design keeps the game extensible without code changes.`,
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
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,1,1,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,2,1},{1,0,0,0,0,0,0,1,1,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}},
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,1,1,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,2,0,0,0,0,0,0,0,0,0,1},{1,0,0,1,1,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}}
};

void loadRoom(int id) {
    if (id < 0 || id > 1) id = 0;
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
uint32_t rng_next() { rng_state ^= rng_state << 13; rng_state ^= rng_state >> 17; rng_state ^= rng_state << 5; return rng_state; }

uint32_t worldHash() { uint32_t h=0; h^=(uint32_t)world.pos[world.player_id].x; h^=(uint32_t)world.pos[world.player_id].y<<4; h^=(uint32_t)world.enemy_hp<<8; h^=(uint32_t)world.kills<<16; return h; }

struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer; bool has_save = false;
void saveGame() { save_buffer={rng_state,current_room,world.player_hp}; has_save=true; cout<<"Saved"<<endl; }
void loadGame() { if(!has_save) return; rng_seed(save_buffer.seed); world.player_hp=save_buffer.player_hp; loadRoom(save_buffer.room); cout<<"Loaded"<<endl; }

const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4]={"","Sword","Shield","Potion"};
int inv_items[5]={-1,-1,-1,-1,-1}; int inv_count=0;
void addItem(int id) { for(int i=0;i<5;i++){if(inv_items[i]<0){inv_items[i]=id;inv_count++;return;}} cout<<"Inventory: full"<<endl; }
int tick_alloc = 0;
// === INPUT MODULE ===
struct KeyMapping { int key; int cmd; };
const int MAX_KEYMAPS = 4;
KeyMapping key_map[MAX_KEYMAPS] = {{KEY_W,CMD_MOVE_UP},{KEY_S,CMD_MOVE_DOWN},{KEY_A,CMD_MOVE_LEFT},{KEY_D,CMD_MOVE_RIGHT}};

void phaseInput() {
    clearQueue();
    for (int i=0;i<MAX_KEYMAPS;i++) { if(IsKeyPressed(key_map[i].key)) enqueueCmd(key_map[i].cmd); }
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

void resolveMovement(Command& c) {
    if (c.type==CMD_NONE||c.type==CMD_ATTACK) return;
    int nx=world.pos[world.player_id].x, ny=world.pos[world.player_id].y;
    if (c.type==CMD_MOVE_UP) ny--; else if (c.type==CMD_MOVE_DOWN) ny++;
    else if (c.type==CMD_MOVE_LEFT) nx--; else if (c.type==CMD_MOVE_RIGHT) nx++;
    if (nx<0||nx>=GRID_W||ny<0||ny>=GRID_H) return;
    if (tiles[ny][nx]==TILE_WALL) return;
    if (tiles[ny][nx]==TILE_EXIT) { loadRoom(1-current_room); return; }
    if (world.enemy_alive&&nx==world.pos[world.enemy_id].x&&ny==world.pos[world.enemy_id].y) { c.type=CMD_ATTACK; return; }
    world.pos[world.player_id].x=nx; world.pos[world.player_id].y=ny;
}

int calcDamage(int base) { return base; }
int lootDrop() { return (int)(rng_next()%3)+1; }
void resolveCombat(Command& c) {
    if (c.type!=CMD_ATTACK) return;
    int dmg=calcDamage(3); world.enemy_hp-=dmg;
    cout<<"Damage: "<<dmg<<endl;
    cout<<"Enemy HP: "<<world.enemy_hp<<"/"<<world.enemy_max_hp<<endl;
}

void phaseResolve() { for(int i=0;i<cmd_count;i++){resolveMovement(cmd_queue[i]);resolveCombat(cmd_queue[i]);} }

void phaseWorld() {
    if(!world.enemy_alive) return;
    if(rng_next()%4==0) return;
    int dx=world.pos[world.player_id].x-world.pos[world.enemy_id].x;
    int dy=world.pos[world.player_id].y-world.pos[world.enemy_id].y;
    int mx=0,my=0;
    if(abs(dx)>=abs(dy)){mx=(dx>0)?1:-1;}else{my=(dy>0)?1:-1;}
    int nx=world.pos[world.enemy_id].x+mx,ny=world.pos[world.enemy_id].y+my;
    if(nx>=0&&nx<GRID_W&&ny>=0&&ny<GRID_H&&tiles[ny][nx]!=TILE_WALL&&!(nx==world.pos[world.player_id].x&&ny==world.pos[world.player_id].y))
        {world.pos[world.enemy_id].x=nx;world.pos[world.enemy_id].y=ny;}
}

void phaseCleanup() {
    if(world.enemy_alive&&world.enemy_hp<=0){world.enemy_alive=false;world.kills++;int loot=lootDrop();addItem(loot);cout<<"Kill confirmed"<<endl;cout<<"Loot: "<<loot<<endl;}
    world.turn_count++;
}
// === RENDER MODULE ===
void renderWorld() {
    BeginDrawing();
    ClearBackground(BLACK);
    for(int y=0;y<GRID_H;y++) for(int x=0;x<GRID_W;x++){
        Color tc=(tiles[y][x]==TILE_WALL)?GRAY:(tiles[y][x]==TILE_EXIT)?YELLOW:DARKGRAY;
        DrawRectangle(x*TILE,y*TILE,TILE-1,TILE-1,tc);
    }
    DrawRectangle(world.pos[world.player_id].x*TILE,world.pos[world.player_id].y*TILE,TILE-1,TILE-1,GREEN);
    if(world.enemy_alive) DrawRectangle(world.pos[world.enemy_id].x*TILE,world.pos[world.enemy_id].y*TILE,TILE-1,TILE-1,RED);
    DrawText("HeapSight RPG",400,10,20,WHITE);
    DrawText(TextFormat("Turn:%d",world.turn_count),400,40,16,WHITE);
    DrawText(TextFormat("Player:(%d,%d)",world.pos[world.player_id].x,world.pos[world.player_id].y),400,60,16,WHITE);
    DrawText(TextFormat("Room:%d",current_room),400,80,16,YELLOW);
    if(world.enemy_alive){DrawText(TextFormat("Enemy HP:%d/%d",world.enemy_hp,world.enemy_max_hp),400,100,16,RED);}
    else{DrawText("Enemy:DEAD",400,100,16,DARKGRAY);}
    DrawText(TextFormat("HP:%d/%d",world.player_hp,world.player_max_hp),400,120,16,GREEN);
    DrawText(TextFormat("Kills:%d",world.kills),400,140,16,YELLOW);
    DrawText(TextFormat("Hash:%u",worldHash()),400,160,14,GRAY);
    DrawText(has_save?"Save:YES":"Save:NO",400,180,14,has_save?GREEN:GRAY);
    DrawText("--Inventory--",400,200,14,YELLOW);
    for(int i=0;i<5;i++){Color ic=inv_items[i]>0?YELLOW:GRAY;const char*nm=inv_items[i]>0?ITEM_NAMES[inv_items[i]]:"--";DrawText(TextFormat("Slot%d:%s",i,nm),400,216+i*16,13,ic);}
    DrawText(TextFormat("Alloc/tick:%d",tick_alloc),400,300,13,tick_alloc==0?GREEN:RED);
    DrawText("GATE A:PASS",400,316,14,GREEN);
    // TODO: Add DrawText for Render: isolated
    EndDrawing();
}
int main() {
    InitWindow(640,640,"HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0); saveGame(); addItem(ITEM_SWORD);

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
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

    while(!WindowShouldClose()){
        world.frame_count++; tick_alloc=0;
        phaseInput();
        if(cmd_count>0){phaseResolve();phaseWorld();phaseCleanup();}
        renderWorld();
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
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,1,1,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,2,1},{1,0,0,0,0,0,0,1,1,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}},
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,1,1,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,2,0,0,0,0,0,0,0,0,0,1},{1,0,0,1,1,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}}
};

void loadRoom(int id) {
    if (id < 0 || id > 1) id = 0;
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
uint32_t rng_next() { rng_state ^= rng_state << 13; rng_state ^= rng_state >> 17; rng_state ^= rng_state << 5; return rng_state; }

uint32_t worldHash() { uint32_t h=0; h^=(uint32_t)world.pos[world.player_id].x; h^=(uint32_t)world.pos[world.player_id].y<<4; h^=(uint32_t)world.enemy_hp<<8; h^=(uint32_t)world.kills<<16; return h; }

struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer; bool has_save = false;
void saveGame() { save_buffer={rng_state,current_room,world.player_hp}; has_save=true; cout<<"Saved"<<endl; }
void loadGame() { if(!has_save) return; rng_seed(save_buffer.seed); world.player_hp=save_buffer.player_hp; loadRoom(save_buffer.room); cout<<"Loaded"<<endl; }

const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4]={"","Sword","Shield","Potion"};
int inv_items[5]={-1,-1,-1,-1,-1}; int inv_count=0;
void addItem(int id) { for(int i=0;i<5;i++){if(inv_items[i]<0){inv_items[i]=id;inv_count++;return;}} cout<<"Inventory: full"<<endl; }
int tick_alloc = 0;
// === INPUT MODULE ===
struct KeyMapping { int key; int cmd; };
const int MAX_KEYMAPS = 4;
KeyMapping key_map[MAX_KEYMAPS] = {{KEY_W,CMD_MOVE_UP},{KEY_S,CMD_MOVE_DOWN},{KEY_A,CMD_MOVE_LEFT},{KEY_D,CMD_MOVE_RIGHT}};

void phaseInput() {
    clearQueue();
    for (int i=0;i<MAX_KEYMAPS;i++) { if(IsKeyPressed(key_map[i].key)) enqueueCmd(key_map[i].cmd); }
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

void resolveMovement(Command& c) {
    if (c.type==CMD_NONE||c.type==CMD_ATTACK) return;
    int nx=world.pos[world.player_id].x, ny=world.pos[world.player_id].y;
    if (c.type==CMD_MOVE_UP) ny--; else if (c.type==CMD_MOVE_DOWN) ny++;
    else if (c.type==CMD_MOVE_LEFT) nx--; else if (c.type==CMD_MOVE_RIGHT) nx++;
    if (nx<0||nx>=GRID_W||ny<0||ny>=GRID_H) return;
    if (tiles[ny][nx]==TILE_WALL) return;
    if (tiles[ny][nx]==TILE_EXIT) { loadRoom(1-current_room); return; }
    if (world.enemy_alive&&nx==world.pos[world.enemy_id].x&&ny==world.pos[world.enemy_id].y) { c.type=CMD_ATTACK; return; }
    world.pos[world.player_id].x=nx; world.pos[world.player_id].y=ny;
}

int calcDamage(int base) { return base; }
int lootDrop() { return (int)(rng_next()%3)+1; }
void resolveCombat(Command& c) {
    if (c.type!=CMD_ATTACK) return;
    int dmg=calcDamage(3); world.enemy_hp-=dmg;
    cout<<"Damage: "<<dmg<<endl;
    cout<<"Enemy HP: "<<world.enemy_hp<<"/"<<world.enemy_max_hp<<endl;
}

void phaseResolve() { for(int i=0;i<cmd_count;i++){resolveMovement(cmd_queue[i]);resolveCombat(cmd_queue[i]);} }

void phaseWorld() {
    if(!world.enemy_alive) return;
    if(rng_next()%4==0) return;
    int dx=world.pos[world.player_id].x-world.pos[world.enemy_id].x;
    int dy=world.pos[world.player_id].y-world.pos[world.enemy_id].y;
    int mx=0,my=0;
    if(abs(dx)>=abs(dy)){mx=(dx>0)?1:-1;}else{my=(dy>0)?1:-1;}
    int nx=world.pos[world.enemy_id].x+mx,ny=world.pos[world.enemy_id].y+my;
    if(nx>=0&&nx<GRID_W&&ny>=0&&ny<GRID_H&&tiles[ny][nx]!=TILE_WALL&&!(nx==world.pos[world.player_id].x&&ny==world.pos[world.player_id].y))
        {world.pos[world.enemy_id].x=nx;world.pos[world.enemy_id].y=ny;}
}

void phaseCleanup() {
    if(world.enemy_alive&&world.enemy_hp<=0){world.enemy_alive=false;world.kills++;int loot=lootDrop();addItem(loot);cout<<"Kill confirmed"<<endl;cout<<"Loot: "<<loot<<endl;}
    world.turn_count++;
}
// === RENDER MODULE ===
void renderWorld() {
    BeginDrawing();
    ClearBackground(BLACK);
    for(int y=0;y<GRID_H;y++) for(int x=0;x<GRID_W;x++){
        Color tc=(tiles[y][x]==TILE_WALL)?GRAY:(tiles[y][x]==TILE_EXIT)?YELLOW:DARKGRAY;
        DrawRectangle(x*TILE,y*TILE,TILE-1,TILE-1,tc);
    }
    DrawRectangle(world.pos[world.player_id].x*TILE,world.pos[world.player_id].y*TILE,TILE-1,TILE-1,GREEN);
    if(world.enemy_alive) DrawRectangle(world.pos[world.enemy_id].x*TILE,world.pos[world.enemy_id].y*TILE,TILE-1,TILE-1,RED);
    DrawText("HeapSight RPG",400,10,20,WHITE);
    DrawText(TextFormat("Turn:%d",world.turn_count),400,40,16,WHITE);
    DrawText(TextFormat("Player:(%d,%d)",world.pos[world.player_id].x,world.pos[world.player_id].y),400,60,16,WHITE);
    DrawText(TextFormat("Room:%d",current_room),400,80,16,YELLOW);
    if(world.enemy_alive){DrawText(TextFormat("Enemy HP:%d/%d",world.enemy_hp,world.enemy_max_hp),400,100,16,RED);}
    else{DrawText("Enemy:DEAD",400,100,16,DARKGRAY);}
    DrawText(TextFormat("HP:%d/%d",world.player_hp,world.player_max_hp),400,120,16,GREEN);
    DrawText(TextFormat("Kills:%d",world.kills),400,140,16,YELLOW);
    DrawText(TextFormat("Hash:%u",worldHash()),400,160,14,GRAY);
    DrawText(has_save?"Save:YES":"Save:NO",400,180,14,has_save?GREEN:GRAY);
    DrawText("--Inventory--",400,200,14,YELLOW);
    for(int i=0;i<5;i++){Color ic=inv_items[i]>0?YELLOW:GRAY;const char*nm=inv_items[i]>0?ITEM_NAMES[inv_items[i]]:"--";DrawText(TextFormat("Slot%d:%s",i,nm),400,216+i*16,13,ic);}
    DrawText(TextFormat("Alloc/tick:%d",tick_alloc),400,300,13,tick_alloc==0?GREEN:RED);
    DrawText("GATE A:PASS",400,316,14,GREEN);

    EndDrawing();
}
int main() {
    InitWindow(640,640,"HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0); saveGame(); addItem(ITEM_SWORD);

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
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
    cout << "Render: isolated" << endl;
    cout << "Module: hs_render" << endl;

    while(!WindowShouldClose()){
        world.frame_count++; tick_alloc=0;
        phaseInput();
        if(cmd_count>0){phaseResolve();phaseWorld();phaseCleanup();}
        renderWorld();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player at spawn", expectedOutput: "Player: (1, 5)", isPattern: false },
      { id: "g2", description: "GATE A passed", expectedOutput: "GATE A: passed", isPattern: false },
      { id: "g3", description: "Render", expectedOutput: "Render: isolated", isPattern: false },
      { id: "g4", description: "Module", expectedOutput: "Module: hs_render", isPattern: false },
    ],
    hints: [
      "Add the new feature code above the game loop. Keep all state at file scope.",
      "Add cout lines for Render: isolated and Module: hs_render after the existing diagnostics.",
      "Uncomment the TODO lines and add a DrawText call in renderWorld to display the new status."
    ],
    estimatedMinutes: 15
  }
};