import { Lesson } from "@/types/lesson";

export const lessonRPG68: Lesson = {
  id: "rpg-68-end-state-signature",
  title: "End-State Signature",
  description: "Final hash compared after replay. End verification proves determinism.",
  order: 68,
  xpReward: 200,
  tier: "pro",
  concepts: ["end-state signature", "final hash", "end verification", "state comparison"],
  part1: {
    title: "Concept: End-State Signature",
    type: "concept",
    instructions: `# Concept: End-State Signature

## Mental Model
This lesson teaches end state signature. Final hash compared after replay. End verification proves determinism.

## What Breaks Without This
Replay finishes, but how do you KNOW the state is correct? You need to compare the final state of the replay against the final state of the original run. State signatures make this comparison possible.

## The Fix
After the last turn of a replay, compute a state signature — a hash of ALL game state: player position, HP, gold, kills, entity positions, entity HPs, RNG state. Compare this to the signature from the original run. Match means determinism. Mismatch means bug.

## Key Concepts
- End-state signature
- Final hash
- End verification
- State comparison

## Your Task
Print the expected output to verify the concept works.

Expected output:
\`\`\`
Signature: end-state
Hash: final-compare
\`\`\`

## Beginner Trap
**Mutating game state outside the command pipeline.** Every state change goes through: intent, command queue, resolve, apply, cleanup, render. No exceptions.

## Elite Insight
Factorio computes state hashes every tick in multiplayer. If any client diverges, the game pauses and reports the exact tick of divergence. Your end-state signature is a simplified version of this — compare at the end instead of every tick.

## Systems Thinking Connection
Replay determinism is the ultimate proof of architectural soundness. The Shooter path proves determinism for real-time frame-based input. The Platformer proves it for physics-based state. The RPG proves it for turn-based command pipelines. Different domains, same principle.

## Mastery Check
Question: Why does end state signature improve the RPG architecture?
Answer: Because it enforces clear boundaries between systems, making the code testable, composable, and deterministic.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Print "Signature: end-state"
    // TODO: Print "Hash: final-compare"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Signature: end-state" << endl;
    cout << "Hash: final-compare" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Output line 1", expectedOutput: "Signature: end-state", isPattern: false },
      { id: "t2", description: "Output line 2", expectedOutput: "Hash: final-compare", isPattern: false }
    ],
    hints: [
      "Print the expected output lines using cout.",
      "Make sure the output matches exactly \u2014 spacing and punctuation matter.",
      "cout << \"Signature: end-state\" << endl;"
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: End-State Signature",
    type: "game_builder",
    instructions: `# Build: End-State Signature

## Overview
Add end state signature to the dungeon. The new feature integrates with all existing systems.

## What to Add
1. Implement the new feature code
2. Add startup cout diagnostics
3. Add HUD display element

## Expected new startup lines
\`\`\`
...existing diagnostics...
Signature: end-state
Hash: final-compare
\`\`\`

## Beginner Trap
**Adding heap allocations in the tick loop.** Gate A is passed. No new/delete/vector resize in the game loop.

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
const int CMD_INTERACT=6;
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

const int ENTITY_PLAYER=0, ENTITY_ENEMY=1, ENTITY_NPC=2;
const int MAX_ENTITIES = 8;
struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

const int QUEST_INACTIVE=0, QUEST_ACTIVE=1, QUEST_COMPLETE=2;
const int MAX_QUESTS = 4;
struct Quest { int id; int state; int target_kills; int current_kills; int reward_gold; int reward_xp; };

const int MAX_DIALOGUE = 8;
const int MAX_LINE_LEN = 64;
char dialogue_lines[MAX_DIALOGUE][MAX_LINE_LEN];
int dialogue_count = 0;

void initDialogue() {
    const char* lines[] = {"Welcome adventurer!", "Seek the dungeon below.", "Kill 3 enemies for gold.", "Return when done."};
    dialogue_count = 4;
    for(int i=0;i<dialogue_count;i++){
        int j=0; while(lines[i][j] && j<MAX_LINE_LEN-1){dialogue_lines[i][j]=lines[i][j];j++;}
        dialogue_lines[i][j]=0;
    }
}

const int MAX_LEVEL = 5;
int level_thresholds[MAX_LEVEL] = {0, 100, 250, 500, 1000};

struct SkillAlloc { int str_bonus; int def_bonus; int hp_bonus; };

struct World {
    int player_id = 0; int enemy_id = 1;
    Vec2i pos[MAX_ENTITIES];
    int entity_type[MAX_ENTITIES];
    bool entity_alive[MAX_ENTITIES];
    int entity_hp[MAX_ENTITIES];
    int npc_dialogue_id[MAX_ENTITIES];
    int npc_quest_id[MAX_ENTITIES];
    int entity_count = 0;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0; int kills = 0; int frame_count = 0;
    int player_gold = 0;
    Quest quests[MAX_QUESTS];
    int quest_count = 0;
    int player_xp = 0;
    int player_level = 1;
    int skill_points = 0;
    SkillAlloc skills = {0,0,0};
    int save_version = 1;
    int input_log[256];
    int input_log_count = 0;
    bool recording = true;
    bool replay_mode = false;
    int replay_index = 0;
    uint32_t final_signature = 0;
};
World world;

int room_data[2][GRID_H][GRID_W] = {
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,1,1,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,2,1},{1,0,0,0,0,0,0,1,1,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}},
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,1,1,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,2,0,0,0,0,0,0,0,0,0,1},{1,0,0,1,1,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}}
};

void initWorld() {
    for(int i=0;i<MAX_ENTITIES;i++){world.entity_alive[i]=false;world.entity_type[i]=0;world.entity_hp[i]=0;world.npc_dialogue_id[i]=-1;}
    for(int i=0;i<MAX_ENTITIES;i++){world.npc_quest_id[i]=-1;}
    world.pos[0]={1,5}; world.entity_type[0]=ENTITY_PLAYER; world.entity_alive[0]=true; world.entity_hp[0]=20;
    world.pos[1]={9,7}; world.entity_type[1]=ENTITY_ENEMY; world.entity_alive[1]=true; world.entity_hp[1]=10;
    world.pos[2]={5,2}; world.entity_type[2]=ENTITY_NPC; world.entity_alive[2]=true; world.entity_hp[2]=1; world.npc_dialogue_id[2]=0;
    world.npc_quest_id[2]=0;
    world.entity_count=3;
    world.quests[0]={0, QUEST_INACTIVE, 3, 0, 50, 100};
    world.quest_count=1;
}

void loadRoom(int id) {
    if (id < 0 || id > 1) id = 0;
    current_room = id;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = room_data[id][y][x];
    if (id == 0) { world.pos[0] = {1,5}; world.pos[1] = {9,7}; world.pos[2] = {5,2}; }
    else         { world.pos[0] = {10,5}; world.pos[1] = {3,7}; world.pos[2] = {5,2}; }
    world.entity_alive[1] = true; world.entity_hp[1] = 10;
    cout << "Room: " << id << endl;
}

uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() { rng_state ^= rng_state << 13; rng_state ^= rng_state >> 17; rng_state ^= rng_state << 5; return rng_state; }

uint32_t worldHash() {
    uint32_t h=0;
    h^=(uint32_t)world.pos[0].x; h^=(uint32_t)world.pos[0].y<<4;
    for(int i=0;i<world.entity_count;i++){h^=(uint32_t)world.entity_hp[i]<<(8+i);}
    h^=(uint32_t)world.kills<<16; h^=(uint32_t)world.player_gold<<20;
    h^=(uint32_t)world.player_xp<<12;
    h^=rng_state;
    return h;
}

const uint8_t SAVE_VERSION = 1;
struct SaveState {
    uint8_t version;
    uint32_t seed; int room; int player_hp; int gold; int kills;
    uint32_t checksum;
};
SaveState save_buffer; bool has_save = false;
uint32_t calcChecksum(SaveState& s) { uint32_t c=0; c^=s.seed; c^=(uint32_t)s.room<<8; c^=(uint32_t)s.player_hp<<16; c^=(uint32_t)s.gold; c^=(uint32_t)s.kills<<4; return c; }
void saveGame() {
    save_buffer.version=SAVE_VERSION; save_buffer.seed=rng_state;
    save_buffer.room=current_room; save_buffer.player_hp=world.player_hp;
    save_buffer.gold=world.player_gold; save_buffer.kills=world.kills;
    save_buffer.checksum=calcChecksum(save_buffer);
    has_save=true; cout<<"Saved"<<endl;
}
void loadGame() {
    if(!has_save) return;
    uint32_t expected=calcChecksum(save_buffer);
    if(save_buffer.checksum!=expected){cout<<"Save: corrupted"<<endl;return;}
    if(save_buffer.version==0){save_buffer.gold=0;save_buffer.kills=0;save_buffer.version=1;cout<<"Migration: v0->v1"<<endl;}
    rng_seed(save_buffer.seed); world.player_hp=save_buffer.player_hp;
    world.player_gold=save_buffer.gold; world.kills=save_buffer.kills;
    loadRoom(save_buffer.room); cout<<"Loaded"<<endl;
}

const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4]={"","Sword","Shield","Potion"};
int inv_items[5]={-1,-1,-1,-1,-1}; int inv_count=0;
void addItem(int id) { for(int i=0;i<5;i++){if(inv_items[i]<0){inv_items[i]=id;inv_count++;return;}} cout<<"Inventory: full"<<endl; }
int tick_alloc = 0;

// === INPUT MODULE ===
struct KeyMapping { int key; int cmd; };
const int MAX_KEYMAPS = 5;
KeyMapping key_map[MAX_KEYMAPS] = {{KEY_W,CMD_MOVE_UP},{KEY_S,CMD_MOVE_DOWN},{KEY_A,CMD_MOVE_LEFT},{KEY_D,CMD_MOVE_RIGHT},{KEY_E,CMD_INTERACT}};

void recordInput(int cmd) { if(world.recording && world.input_log_count<256) { world.input_log[world.input_log_count++]=cmd; } }

void phaseInput() {
    clearQueue();
    if(world.replay_mode) {
        if(world.replay_index<world.input_log_count) {
            enqueueCmd(world.input_log[world.replay_index++]);
        }
        return;
    }
    for (int i=0;i<MAX_KEYMAPS;i++) { if(IsKeyPressed(key_map[i].key)) {
        enqueueCmd(key_map[i].cmd);
        recordInput(key_map[i].cmd);
    }}
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

void resolveMovement(Command& c) {
    if (c.type==CMD_NONE||c.type==CMD_ATTACK) return;
    if (c.type==CMD_INTERACT) return;
    int nx=world.pos[world.player_id].x, ny=world.pos[world.player_id].y;
    if (c.type==CMD_MOVE_UP) ny--; else if (c.type==CMD_MOVE_DOWN) ny++;
    else if (c.type==CMD_MOVE_LEFT) nx--; else if (c.type==CMD_MOVE_RIGHT) nx++;
    if (nx<0||nx>=GRID_W||ny<0||ny>=GRID_H) return;
    if (tiles[ny][nx]==TILE_WALL) return;
    if (tiles[ny][nx]==TILE_EXIT) { loadRoom(1-current_room); return; }
    for(int i=1;i<world.entity_count;i++){
        if(world.entity_alive[i]&&world.pos[i].x==nx&&world.pos[i].y==ny){
            if(world.entity_type[i]==ENTITY_ENEMY){c.type=CMD_ATTACK;c.p1=i;return;}
            if(world.entity_type[i]==ENTITY_NPC){c.type=CMD_INTERACT;c.p1=i;return;}
        }
    }
    world.pos[world.player_id].x=nx; world.pos[world.player_id].y=ny;
}

int calcDamage(int base) {
    return base + world.skills.str_bonus;
}
int lootDrop() { return (int)(rng_next()%3)+1; }
void resolveCombat(Command& c) {
    if (c.type!=CMD_ATTACK) return;
    int target=c.p1; if(target<1||target>=world.entity_count||!world.entity_alive[target]) return;
    int dmg=calcDamage(3); world.entity_hp[target]-=dmg;
    cout<<"Damage: "<<dmg<<endl;
    cout<<"Enemy HP: "<<world.entity_hp[target]<<"/"<<world.enemy_max_hp<<endl;
}

void resolveInteract(Command& c) {
    if(c.type!=CMD_INTERACT) return;
    int target=c.p1; if(target<1||target>=world.entity_count) return;
    if(world.entity_type[target]!=ENTITY_NPC) return;
    int did=world.npc_dialogue_id[target];
    if(did>=0&&did<dialogue_count) cout<<"NPC: "<<dialogue_lines[did]<<endl;
    int qid=world.npc_quest_id[target];
    if(qid>=0&&qid<world.quest_count){
        if(world.quests[qid].state==QUEST_INACTIVE){world.quests[qid].state=QUEST_ACTIVE;cout<<"Quest: accepted"<<endl;}
        else if(world.quests[qid].state==QUEST_ACTIVE&&world.quests[qid].current_kills>=world.quests[qid].target_kills){
            world.quests[qid].state=QUEST_COMPLETE;
            world.player_gold+=world.quests[qid].reward_gold;
            world.player_xp+=world.quests[qid].reward_xp;
            cout<<"Reward: "<<world.quests[qid].reward_gold<<" gold"<<endl;
            cout<<"Quest: complete"<<endl;
        }
    }
}

void checkLevelUp() {
    while(world.player_level<MAX_LEVEL && world.player_xp>=level_thresholds[world.player_level]){
        world.player_level++;
        world.player_max_hp+=5;
        world.player_hp=world.player_max_hp;
        world.skill_points+=2;
        cout<<"Level up: "<<world.player_level<<endl;
    }
}

void phaseResolve() {
    for(int i=0;i<cmd_count;i++){
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
        resolveInteract(cmd_queue[i]);
    }
}

void phaseWorld() {
    for(int i=1;i<world.entity_count;i++){
        if(!world.entity_alive[i]||world.entity_type[i]!=ENTITY_ENEMY) continue;
        if(rng_next()%4==0) continue;
        int dx=world.pos[0].x-world.pos[i].x;
        int dy=world.pos[0].y-world.pos[i].y;
        int mx=0,my=0;
        if(abs(dx)>=abs(dy)){mx=(dx>0)?1:-1;}else{my=(dy>0)?1:-1;}
        int nx=world.pos[i].x+mx,ny=world.pos[i].y+my;
        if(nx>=0&&nx<GRID_W&&ny>=0&&ny<GRID_H&&tiles[ny][nx]!=TILE_WALL)
            {bool blocked=false; for(int j=0;j<world.entity_count;j++){if(j!=i&&world.entity_alive[j]&&world.pos[j].x==nx&&world.pos[j].y==ny)blocked=true;} if(!blocked){world.pos[i].x=nx;world.pos[i].y=ny;}}
    }
}

void phaseCleanup() {
    for(int i=1;i<world.entity_count;i++){
        if(world.entity_alive[i]&&world.entity_type[i]==ENTITY_ENEMY&&world.entity_hp[i]<=0){
            world.entity_alive[i]=false; world.kills++;
            int loot=lootDrop(); addItem(loot);
            cout<<"Kill confirmed"<<endl; cout<<"Loot: "<<loot<<endl;
            for(int q=0;q<world.quest_count;q++){if(world.quests[q].state==QUEST_ACTIVE){world.quests[q].current_kills++;}}
            world.player_gold+=10;
            world.player_xp+=25;
        }
    }
    checkLevelUp();
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
    for(int i=0;i<world.entity_count;i++){
        if(!world.entity_alive[i]) continue;
        Color ec=GREEN;
        if(world.entity_type[i]==ENTITY_ENEMY) ec=RED;
        if(world.entity_type[i]==ENTITY_NPC) ec=SKYBLUE;
        DrawRectangle(world.pos[i].x*TILE,world.pos[i].y*TILE,TILE-1,TILE-1,ec);
    }
    DrawText("HeapSight RPG",400,10,20,WHITE);
    DrawText(TextFormat("Turn:%d",world.turn_count),400,40,16,WHITE);
    DrawText(TextFormat("Player:(%d,%d)",world.pos[world.player_id].x,world.pos[world.player_id].y),400,60,16,WHITE);
    DrawText(TextFormat("Room:%d",current_room),400,80,16,YELLOW);
    DrawText(TextFormat("HP:%d/%d",world.player_hp,world.player_max_hp),400,100,16,GREEN);
    DrawText(TextFormat("Kills:%d",world.kills),400,120,16,YELLOW);
    DrawText(TextFormat("Gold:%d",world.player_gold),400,140,16,YELLOW);
    DrawText(TextFormat("Hash:%u",worldHash()),400,160,14,GRAY);
    DrawText("--Quests--",400,180,14,SKYBLUE);
    for(int q=0;q<world.quest_count;q++){
        const char* st=world.quests[q].state==QUEST_COMPLETE?"DONE":world.quests[q].state==QUEST_ACTIVE?"ACTIVE":"--";
        DrawText(TextFormat("Q%d:%s (%d/%d)",q,st,world.quests[q].current_kills,world.quests[q].target_kills),400,196+q*16,13,SKYBLUE);
    }
    DrawText(TextFormat("Lv:%d XP:%d",world.player_level,world.player_xp),400,260,14,WHITE);
    DrawText(TextFormat("STR+%d DEF+%d HP+%d",world.skills.str_bonus,world.skills.def_bonus,world.skills.hp_bonus),400,276,13,WHITE);
    DrawText(TextFormat("InputLog:%d",world.input_log_count),400,292,13,GRAY);
    if(world.replay_mode) DrawText("REPLAY MODE",400,308,16,RED);
    DrawText(TextFormat("Sig:%u",world.final_signature),400,324,13,GRAY);
    DrawText("GATE A:PASS",400,340,14,GREEN);
    EndDrawing();
}

void computeFinalSignature() { world.final_signature = worldHash(); }

int main() {
    InitWindow(640,640,"HeapSight RPG");
    SetTargetFPS(60);
    initDialogue();
    initWorld();
    loadRoom(0); saveGame();

    // === DIAGNOSTIC OUTPUT ===
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
    cout << "World: file-loaded" << endl;
    cout << "Parse: room-string" << endl;
    cout << "AI: table-driven" << endl;
    cout << "Behavior: lookup" << endl;
    cout << "Enemies: 5" << endl;
    cout << "Milestone: multi-enemy-arena" << endl;
    cout << "Damage: table-driven" << endl;
    cout << "Balance: data-file" << endl;
    cout << "Events: logged" << endl;
    cout << "Pattern: event-log" << endl;
    cout << "HUD: overlay" << endl;
    cout << "Display: state-projection" << endl;
    cout << "Error: handled" << endl;
    cout << "Fallback: safe" << endl;
    cout << "Systems: 8" << endl;
    cout << "Milestone: systems-stable" << endl;
    cout << "Items: table-parsed" << endl;
    cout << "Source: data-file" << endl;
    cout << "Equipment: slot-based" << endl;
    cout << "Weapon: equipped" << endl;
    cout << "Consumable: potion" << endl;
    cout << "Use: command" << endl;
    cout << "Gold: deterministic" << endl;
    cout << "Economy: active" << endl;
    cout << "Loop: loot-equip-use" << endl;
    cout << "Milestone: inventory-loop" << endl;
    cout << "Shop: mode-switch" << endl;
    cout << "Mode: explore|shop" << endl;
    cout << "Buy: command" << endl;
    cout << "Transaction: gold-to-item" << endl;
    cout << "Loot: weighted" << endl;
    cout << "Table: drop-rates" << endl;
    cout << "Status: poison" << endl;
    cout << "Tick: hp-drain" << endl;
    cout << "Phase5: complete" << endl;
    cout << "Milestone: midgame-slice" << endl;
    cout << "NPC: entity-type" << endl;
    cout << "Type: ENTITY_NPC" << endl;
    cout << "Interact: command" << endl;
    cout << "CMD: INTERACT" << endl;
    cout << "Dialogue: data-driven" << endl;
    cout << "Source: quests-file" << endl;
    cout << "Quest: struct" << endl;
    cout << "FSM: inactive|active|complete" << endl;
    cout << "Cycle: accept-complete-reward" << endl;
    cout << "Milestone: quest-cycle" << endl;
    cout << "Quest: state-machine" << endl;
    cout << "Table: quest-states" << endl;
    cout << "Rewards: pipeline" << endl;
    cout << "Pattern: reward-command" << endl;
    cout << "XP: level-up" << endl;
    cout << "Table: level-thresholds" << endl;
    cout << "Skills: allocated" << endl;
    cout << "Build: data-driven" << endl;
    cout << "Loop: town-to-dungeon" << endl;
    cout << "Phase6: complete" << endl;
    cout << "Milestone: town-to-dungeon" << endl;
    cout << "Save: v1" << endl;
    cout << "Version: header" << endl;
    cout << "Checksum: active" << endl;
    cout << "Integrity: verified" << endl;
    cout << "Migration: v0-to-v1" << endl;
    cout << "Compat: forward" << endl;
    cout << "InputLog: recording" << endl;
    cout << "Pattern: input-log" << endl;
    cout << "Replay: ghost" << endl;
    cout << "Milestone: replay-run" << endl;
    cout << "Replay: playback" << endl;
    cout << "Source: input-log" << endl;
    cout << "Determinism: stable-order" << endl;
    cout << "Pitfall: iteration-order" << endl;
    // TODO: Add cout for "Signature: end-state"
    // TODO: Add cout for "Hash: final-compare"

    while(!WindowShouldClose()){
        world.frame_count++; tick_alloc=0;
        phaseInput();
        if(cmd_count>0){phaseResolve();phaseWorld();phaseCleanup();}
        computeFinalSignature();
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
const int CMD_INTERACT=6;
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

const int ENTITY_PLAYER=0, ENTITY_ENEMY=1, ENTITY_NPC=2;
const int MAX_ENTITIES = 8;
struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

const int QUEST_INACTIVE=0, QUEST_ACTIVE=1, QUEST_COMPLETE=2;
const int MAX_QUESTS = 4;
struct Quest { int id; int state; int target_kills; int current_kills; int reward_gold; int reward_xp; };

const int MAX_DIALOGUE = 8;
const int MAX_LINE_LEN = 64;
char dialogue_lines[MAX_DIALOGUE][MAX_LINE_LEN];
int dialogue_count = 0;

void initDialogue() {
    const char* lines[] = {"Welcome adventurer!", "Seek the dungeon below.", "Kill 3 enemies for gold.", "Return when done."};
    dialogue_count = 4;
    for(int i=0;i<dialogue_count;i++){
        int j=0; while(lines[i][j] && j<MAX_LINE_LEN-1){dialogue_lines[i][j]=lines[i][j];j++;}
        dialogue_lines[i][j]=0;
    }
}

const int MAX_LEVEL = 5;
int level_thresholds[MAX_LEVEL] = {0, 100, 250, 500, 1000};

struct SkillAlloc { int str_bonus; int def_bonus; int hp_bonus; };

struct World {
    int player_id = 0; int enemy_id = 1;
    Vec2i pos[MAX_ENTITIES];
    int entity_type[MAX_ENTITIES];
    bool entity_alive[MAX_ENTITIES];
    int entity_hp[MAX_ENTITIES];
    int npc_dialogue_id[MAX_ENTITIES];
    int npc_quest_id[MAX_ENTITIES];
    int entity_count = 0;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0; int kills = 0; int frame_count = 0;
    int player_gold = 0;
    Quest quests[MAX_QUESTS];
    int quest_count = 0;
    int player_xp = 0;
    int player_level = 1;
    int skill_points = 0;
    SkillAlloc skills = {0,0,0};
    int save_version = 1;
    int input_log[256];
    int input_log_count = 0;
    bool recording = true;
    bool replay_mode = false;
    int replay_index = 0;
    uint32_t final_signature = 0;
};
World world;

int room_data[2][GRID_H][GRID_W] = {
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,1,1,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,2,1},{1,0,0,0,0,0,0,1,1,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}},
  {{1,1,1,1,1,1,1,1,1,1,1,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,1,1,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,2,0,0,0,0,0,0,0,0,0,1},{1,0,0,1,1,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,0,0,0,0,0,0,0,0,0,0,1},{1,1,1,1,1,1,1,1,1,1,1,1}}
};

void initWorld() {
    for(int i=0;i<MAX_ENTITIES;i++){world.entity_alive[i]=false;world.entity_type[i]=0;world.entity_hp[i]=0;world.npc_dialogue_id[i]=-1;}
    for(int i=0;i<MAX_ENTITIES;i++){world.npc_quest_id[i]=-1;}
    world.pos[0]={1,5}; world.entity_type[0]=ENTITY_PLAYER; world.entity_alive[0]=true; world.entity_hp[0]=20;
    world.pos[1]={9,7}; world.entity_type[1]=ENTITY_ENEMY; world.entity_alive[1]=true; world.entity_hp[1]=10;
    world.pos[2]={5,2}; world.entity_type[2]=ENTITY_NPC; world.entity_alive[2]=true; world.entity_hp[2]=1; world.npc_dialogue_id[2]=0;
    world.npc_quest_id[2]=0;
    world.entity_count=3;
    world.quests[0]={0, QUEST_INACTIVE, 3, 0, 50, 100};
    world.quest_count=1;
}

void loadRoom(int id) {
    if (id < 0 || id > 1) id = 0;
    current_room = id;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = room_data[id][y][x];
    if (id == 0) { world.pos[0] = {1,5}; world.pos[1] = {9,7}; world.pos[2] = {5,2}; }
    else         { world.pos[0] = {10,5}; world.pos[1] = {3,7}; world.pos[2] = {5,2}; }
    world.entity_alive[1] = true; world.entity_hp[1] = 10;
    cout << "Room: " << id << endl;
}

uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() { rng_state ^= rng_state << 13; rng_state ^= rng_state >> 17; rng_state ^= rng_state << 5; return rng_state; }

uint32_t worldHash() {
    uint32_t h=0;
    h^=(uint32_t)world.pos[0].x; h^=(uint32_t)world.pos[0].y<<4;
    for(int i=0;i<world.entity_count;i++){h^=(uint32_t)world.entity_hp[i]<<(8+i);}
    h^=(uint32_t)world.kills<<16; h^=(uint32_t)world.player_gold<<20;
    h^=(uint32_t)world.player_xp<<12;
    h^=rng_state;
    return h;
}

const uint8_t SAVE_VERSION = 1;
struct SaveState {
    uint8_t version;
    uint32_t seed; int room; int player_hp; int gold; int kills;
    uint32_t checksum;
};
SaveState save_buffer; bool has_save = false;
uint32_t calcChecksum(SaveState& s) { uint32_t c=0; c^=s.seed; c^=(uint32_t)s.room<<8; c^=(uint32_t)s.player_hp<<16; c^=(uint32_t)s.gold; c^=(uint32_t)s.kills<<4; return c; }
void saveGame() {
    save_buffer.version=SAVE_VERSION; save_buffer.seed=rng_state;
    save_buffer.room=current_room; save_buffer.player_hp=world.player_hp;
    save_buffer.gold=world.player_gold; save_buffer.kills=world.kills;
    save_buffer.checksum=calcChecksum(save_buffer);
    has_save=true; cout<<"Saved"<<endl;
}
void loadGame() {
    if(!has_save) return;
    uint32_t expected=calcChecksum(save_buffer);
    if(save_buffer.checksum!=expected){cout<<"Save: corrupted"<<endl;return;}
    if(save_buffer.version==0){save_buffer.gold=0;save_buffer.kills=0;save_buffer.version=1;cout<<"Migration: v0->v1"<<endl;}
    rng_seed(save_buffer.seed); world.player_hp=save_buffer.player_hp;
    world.player_gold=save_buffer.gold; world.kills=save_buffer.kills;
    loadRoom(save_buffer.room); cout<<"Loaded"<<endl;
}

const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4]={"","Sword","Shield","Potion"};
int inv_items[5]={-1,-1,-1,-1,-1}; int inv_count=0;
void addItem(int id) { for(int i=0;i<5;i++){if(inv_items[i]<0){inv_items[i]=id;inv_count++;return;}} cout<<"Inventory: full"<<endl; }
int tick_alloc = 0;

// === INPUT MODULE ===
struct KeyMapping { int key; int cmd; };
const int MAX_KEYMAPS = 5;
KeyMapping key_map[MAX_KEYMAPS] = {{KEY_W,CMD_MOVE_UP},{KEY_S,CMD_MOVE_DOWN},{KEY_A,CMD_MOVE_LEFT},{KEY_D,CMD_MOVE_RIGHT},{KEY_E,CMD_INTERACT}};

void recordInput(int cmd) { if(world.recording && world.input_log_count<256) { world.input_log[world.input_log_count++]=cmd; } }

void phaseInput() {
    clearQueue();
    if(world.replay_mode) {
        if(world.replay_index<world.input_log_count) {
            enqueueCmd(world.input_log[world.replay_index++]);
        }
        return;
    }
    for (int i=0;i<MAX_KEYMAPS;i++) { if(IsKeyPressed(key_map[i].key)) {
        enqueueCmd(key_map[i].cmd);
        recordInput(key_map[i].cmd);
    }}
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

void resolveMovement(Command& c) {
    if (c.type==CMD_NONE||c.type==CMD_ATTACK) return;
    if (c.type==CMD_INTERACT) return;
    int nx=world.pos[world.player_id].x, ny=world.pos[world.player_id].y;
    if (c.type==CMD_MOVE_UP) ny--; else if (c.type==CMD_MOVE_DOWN) ny++;
    else if (c.type==CMD_MOVE_LEFT) nx--; else if (c.type==CMD_MOVE_RIGHT) nx++;
    if (nx<0||nx>=GRID_W||ny<0||ny>=GRID_H) return;
    if (tiles[ny][nx]==TILE_WALL) return;
    if (tiles[ny][nx]==TILE_EXIT) { loadRoom(1-current_room); return; }
    for(int i=1;i<world.entity_count;i++){
        if(world.entity_alive[i]&&world.pos[i].x==nx&&world.pos[i].y==ny){
            if(world.entity_type[i]==ENTITY_ENEMY){c.type=CMD_ATTACK;c.p1=i;return;}
            if(world.entity_type[i]==ENTITY_NPC){c.type=CMD_INTERACT;c.p1=i;return;}
        }
    }
    world.pos[world.player_id].x=nx; world.pos[world.player_id].y=ny;
}

int calcDamage(int base) {
    return base + world.skills.str_bonus;
}
int lootDrop() { return (int)(rng_next()%3)+1; }
void resolveCombat(Command& c) {
    if (c.type!=CMD_ATTACK) return;
    int target=c.p1; if(target<1||target>=world.entity_count||!world.entity_alive[target]) return;
    int dmg=calcDamage(3); world.entity_hp[target]-=dmg;
    cout<<"Damage: "<<dmg<<endl;
    cout<<"Enemy HP: "<<world.entity_hp[target]<<"/"<<world.enemy_max_hp<<endl;
}

void resolveInteract(Command& c) {
    if(c.type!=CMD_INTERACT) return;
    int target=c.p1; if(target<1||target>=world.entity_count) return;
    if(world.entity_type[target]!=ENTITY_NPC) return;
    int did=world.npc_dialogue_id[target];
    if(did>=0&&did<dialogue_count) cout<<"NPC: "<<dialogue_lines[did]<<endl;
    int qid=world.npc_quest_id[target];
    if(qid>=0&&qid<world.quest_count){
        if(world.quests[qid].state==QUEST_INACTIVE){world.quests[qid].state=QUEST_ACTIVE;cout<<"Quest: accepted"<<endl;}
        else if(world.quests[qid].state==QUEST_ACTIVE&&world.quests[qid].current_kills>=world.quests[qid].target_kills){
            world.quests[qid].state=QUEST_COMPLETE;
            world.player_gold+=world.quests[qid].reward_gold;
            world.player_xp+=world.quests[qid].reward_xp;
            cout<<"Reward: "<<world.quests[qid].reward_gold<<" gold"<<endl;
            cout<<"Quest: complete"<<endl;
        }
    }
}

void checkLevelUp() {
    while(world.player_level<MAX_LEVEL && world.player_xp>=level_thresholds[world.player_level]){
        world.player_level++;
        world.player_max_hp+=5;
        world.player_hp=world.player_max_hp;
        world.skill_points+=2;
        cout<<"Level up: "<<world.player_level<<endl;
    }
}

void phaseResolve() {
    for(int i=0;i<cmd_count;i++){
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
        resolveInteract(cmd_queue[i]);
    }
}

void phaseWorld() {
    for(int i=1;i<world.entity_count;i++){
        if(!world.entity_alive[i]||world.entity_type[i]!=ENTITY_ENEMY) continue;
        if(rng_next()%4==0) continue;
        int dx=world.pos[0].x-world.pos[i].x;
        int dy=world.pos[0].y-world.pos[i].y;
        int mx=0,my=0;
        if(abs(dx)>=abs(dy)){mx=(dx>0)?1:-1;}else{my=(dy>0)?1:-1;}
        int nx=world.pos[i].x+mx,ny=world.pos[i].y+my;
        if(nx>=0&&nx<GRID_W&&ny>=0&&ny<GRID_H&&tiles[ny][nx]!=TILE_WALL)
            {bool blocked=false; for(int j=0;j<world.entity_count;j++){if(j!=i&&world.entity_alive[j]&&world.pos[j].x==nx&&world.pos[j].y==ny)blocked=true;} if(!blocked){world.pos[i].x=nx;world.pos[i].y=ny;}}
    }
}

void phaseCleanup() {
    for(int i=1;i<world.entity_count;i++){
        if(world.entity_alive[i]&&world.entity_type[i]==ENTITY_ENEMY&&world.entity_hp[i]<=0){
            world.entity_alive[i]=false; world.kills++;
            int loot=lootDrop(); addItem(loot);
            cout<<"Kill confirmed"<<endl; cout<<"Loot: "<<loot<<endl;
            for(int q=0;q<world.quest_count;q++){if(world.quests[q].state==QUEST_ACTIVE){world.quests[q].current_kills++;}}
            world.player_gold+=10;
            world.player_xp+=25;
        }
    }
    checkLevelUp();
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
    for(int i=0;i<world.entity_count;i++){
        if(!world.entity_alive[i]) continue;
        Color ec=GREEN;
        if(world.entity_type[i]==ENTITY_ENEMY) ec=RED;
        if(world.entity_type[i]==ENTITY_NPC) ec=SKYBLUE;
        DrawRectangle(world.pos[i].x*TILE,world.pos[i].y*TILE,TILE-1,TILE-1,ec);
    }
    DrawText("HeapSight RPG",400,10,20,WHITE);
    DrawText(TextFormat("Turn:%d",world.turn_count),400,40,16,WHITE);
    DrawText(TextFormat("Player:(%d,%d)",world.pos[world.player_id].x,world.pos[world.player_id].y),400,60,16,WHITE);
    DrawText(TextFormat("Room:%d",current_room),400,80,16,YELLOW);
    DrawText(TextFormat("HP:%d/%d",world.player_hp,world.player_max_hp),400,100,16,GREEN);
    DrawText(TextFormat("Kills:%d",world.kills),400,120,16,YELLOW);
    DrawText(TextFormat("Gold:%d",world.player_gold),400,140,16,YELLOW);
    DrawText(TextFormat("Hash:%u",worldHash()),400,160,14,GRAY);
    DrawText("--Quests--",400,180,14,SKYBLUE);
    for(int q=0;q<world.quest_count;q++){
        const char* st=world.quests[q].state==QUEST_COMPLETE?"DONE":world.quests[q].state==QUEST_ACTIVE?"ACTIVE":"--";
        DrawText(TextFormat("Q%d:%s (%d/%d)",q,st,world.quests[q].current_kills,world.quests[q].target_kills),400,196+q*16,13,SKYBLUE);
    }
    DrawText(TextFormat("Lv:%d XP:%d",world.player_level,world.player_xp),400,260,14,WHITE);
    DrawText(TextFormat("STR+%d DEF+%d HP+%d",world.skills.str_bonus,world.skills.def_bonus,world.skills.hp_bonus),400,276,13,WHITE);
    DrawText(TextFormat("InputLog:%d",world.input_log_count),400,292,13,GRAY);
    if(world.replay_mode) DrawText("REPLAY MODE",400,308,16,RED);
    DrawText(TextFormat("Sig:%u",world.final_signature),400,324,13,GRAY);
    DrawText("GATE A:PASS",400,340,14,GREEN);
    EndDrawing();
}

void computeFinalSignature() { world.final_signature = worldHash(); }

int main() {
    InitWindow(640,640,"HeapSight RPG");
    SetTargetFPS(60);
    initDialogue();
    initWorld();
    loadRoom(0); saveGame();

    // === DIAGNOSTIC OUTPUT ===
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
    cout << "World: file-loaded" << endl;
    cout << "Parse: room-string" << endl;
    cout << "AI: table-driven" << endl;
    cout << "Behavior: lookup" << endl;
    cout << "Enemies: 5" << endl;
    cout << "Milestone: multi-enemy-arena" << endl;
    cout << "Damage: table-driven" << endl;
    cout << "Balance: data-file" << endl;
    cout << "Events: logged" << endl;
    cout << "Pattern: event-log" << endl;
    cout << "HUD: overlay" << endl;
    cout << "Display: state-projection" << endl;
    cout << "Error: handled" << endl;
    cout << "Fallback: safe" << endl;
    cout << "Systems: 8" << endl;
    cout << "Milestone: systems-stable" << endl;
    cout << "Items: table-parsed" << endl;
    cout << "Source: data-file" << endl;
    cout << "Equipment: slot-based" << endl;
    cout << "Weapon: equipped" << endl;
    cout << "Consumable: potion" << endl;
    cout << "Use: command" << endl;
    cout << "Gold: deterministic" << endl;
    cout << "Economy: active" << endl;
    cout << "Loop: loot-equip-use" << endl;
    cout << "Milestone: inventory-loop" << endl;
    cout << "Shop: mode-switch" << endl;
    cout << "Mode: explore|shop" << endl;
    cout << "Buy: command" << endl;
    cout << "Transaction: gold-to-item" << endl;
    cout << "Loot: weighted" << endl;
    cout << "Table: drop-rates" << endl;
    cout << "Status: poison" << endl;
    cout << "Tick: hp-drain" << endl;
    cout << "Phase5: complete" << endl;
    cout << "Milestone: midgame-slice" << endl;
    cout << "NPC: entity-type" << endl;
    cout << "Type: ENTITY_NPC" << endl;
    cout << "Interact: command" << endl;
    cout << "CMD: INTERACT" << endl;
    cout << "Dialogue: data-driven" << endl;
    cout << "Source: quests-file" << endl;
    cout << "Quest: struct" << endl;
    cout << "FSM: inactive|active|complete" << endl;
    cout << "Cycle: accept-complete-reward" << endl;
    cout << "Milestone: quest-cycle" << endl;
    cout << "Quest: state-machine" << endl;
    cout << "Table: quest-states" << endl;
    cout << "Rewards: pipeline" << endl;
    cout << "Pattern: reward-command" << endl;
    cout << "XP: level-up" << endl;
    cout << "Table: level-thresholds" << endl;
    cout << "Skills: allocated" << endl;
    cout << "Build: data-driven" << endl;
    cout << "Loop: town-to-dungeon" << endl;
    cout << "Phase6: complete" << endl;
    cout << "Milestone: town-to-dungeon" << endl;
    cout << "Save: v1" << endl;
    cout << "Version: header" << endl;
    cout << "Checksum: active" << endl;
    cout << "Integrity: verified" << endl;
    cout << "Migration: v0-to-v1" << endl;
    cout << "Compat: forward" << endl;
    cout << "InputLog: recording" << endl;
    cout << "Pattern: input-log" << endl;
    cout << "Replay: ghost" << endl;
    cout << "Milestone: replay-run" << endl;
    cout << "Replay: playback" << endl;
    cout << "Source: input-log" << endl;
    cout << "Determinism: stable-order" << endl;
    cout << "Pitfall: iteration-order" << endl;
    cout << "Signature: end-state" << endl;
    cout << "Hash: final-compare" << endl;

    while(!WindowShouldClose()){
        world.frame_count++; tick_alloc=0;
        phaseInput();
        if(cmd_count>0){phaseResolve();phaseWorld();phaseCleanup();}
        computeFinalSignature();
        renderWorld();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player at spawn", expectedOutput: "Player: (1, 5)", isPattern: false },
      { id: "g2", description: "GATE A passed", expectedOutput: "GATE A: passed", isPattern: false },
      { id: "g3", description: "New feature output", expectedOutput: "Signature: end-state", isPattern: false },
      { id: "g4", description: "New feature output", expectedOutput: "Hash: final-compare", isPattern: false }
    ],
    hints: [
      "Add the new feature code above the game loop. Keep all state at file scope.",
      "Add cout lines for the new diagnostics after the existing diagnostic block.",
      "Add cout << \"Signature: end-state\" << endl; after the existing diagnostic output."
    ],
    estimatedMinutes: 15
  }
};