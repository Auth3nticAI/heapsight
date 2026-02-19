import { Lesson } from "@/types/lesson";

export const lessonRPG48: Lesson = {
  id: "rpg-48-loot-tables",
  title: "Loot Tables",
  description: "Enemies drop items from weighted loot tables driven by seeded RNG — deterministic rewards from data, not hardcoded logic.",
  order: 48,
  xpReward: 100,
  tier: "pro",
  concepts: ["weighted random selection", "loot table as data", "deterministic drops", "RNG-driven content"],
  part1: {
    title: "Concept: Weighted Random from Data",
    type: "concept",
    instructions: `# Loot Tables

## Mental Model

A loot table is a mapping from "who died" to "what might drop," controlled entirely by data and the seeded RNG. Every enemy type has a table of possible drops, each with a weight. Higher weight = higher probability. The RNG picks the drop — deterministically. Replay the same fight with the same seed, get the same loot.

## What Breaks Without This

Without loot tables, drops are hardcoded: "enemy type 1 always drops Iron Sword." Every enemy of the same type drops the same item. No variety, no excitement, no reason to fight the same enemy twice. Or worse — you use \`std::rand()\` and drops are different every replay. Your save file says the player has a Steel Sword, but replaying from the same seed gives them a Potion. State divergence. Broken replay.

## The Fix: Weighted Loot Tables

A loot table is a fixed-size array of entries. Each entry has an item ID and a weight. To pick a drop, you sum all weights, roll the RNG in range [0, total_weight), then walk the table accumulating weights until you pass the roll. That entry wins.

This is the same algorithm used by Diablo, Nethack, Baldur's Gate, and every RPG with randomized loot. The key constraint: the RNG must be the world's seeded RNG. No \`std::rand()\`. No separate random source. One RNG, one truth.

The table itself is data — a const array loaded at startup. To change drop rates, you edit the table. No code changes. No recompilation for balance tweaks.

Because the table is fixed-size and const, it lives in read-only memory. Zero heap allocation. The weighted selection is O(n) where n is the number of entries — typically 3-5 per enemy type. Fast enough for any RPG.

## Key Concepts
- Weighted random: higher weight = higher probability, but still RNG-controlled
- Loot table as const data: fixed-size array of {item_id, weight} pairs
- Deterministic drops: same seed + same kill order = same loot every time
- Table lookup by enemy type: damage_id (or a new loot_table_id) indexes into loot tables

## Performance Insight

Weighted selection walks a small array (3-5 entries) once per kill. That's negligible compared to the rest of the tick. The loot table is const data — it sits in cache alongside the damage table. No heap, no allocation, no pointer chase. Diablo 2 processed thousands of drops per session with this exact pattern on a Pentium II.

## Memory Insight

Each loot entry is two ints (item_id + weight) = 8 bytes. A table of 4 entries = 32 bytes. Five enemy types × 4 entries = 160 bytes total. This fits in a single cache line cluster. The table is const — it never changes during gameplay, so the compiler can place it in .rodata.

## Your Task

Define a \`LootEntry\` struct with \`item_id\` and \`weight\`. Create a loot table for enemy type 1 (damage_id=1) with 3 entries: Iron Sword (weight 2), Potion (weight 5), nothing/ITEM_NONE (weight 3). Write a \`rollLoot()\` function that takes the table, its size, and an RNG reference, sums weights, rolls, and returns the winning item_id. Test with a known seed to verify deterministic output.

Expected output:
\`\`\`
LOOT_ROLL|seed=100|item=4
LOOT_ROLL|seed=100|item=4
LOOT_ROLL|seed=200|item=0
\`\`\`

## Beginner Trap

**Using modulo on the full RNG range instead of the weight sum.** If your total weight is 10 but you do \`rng_next(r) % 100\`, most rolls will miss all entries. The modulo must be against the total weight: \`rng_next(r) % total_weight\`. This ensures every roll maps to exactly one entry.

## Elite Insight

Diablo 2's treasure class system is a hierarchy of weighted loot tables — a table can reference another table as a "drop." The base algorithm is identical to what you're building: accumulate weights, roll, select. Path of Exile extends this with "rarity tiers" that modify weights at runtime. Your const table is the foundation — runtime weight modification is an extension, not a rewrite.

## Systems Thinking Connection

This weighted selection is identical to the Robotics path's sensor noise model — both sample from a discrete distribution using a seeded source. Same algorithm, different domain.

## Skill Reinforcement

Lesson 21 introduced the seeded RNG. Lesson 28 used it for loot drop IDs. This lesson adds weighted probability. Lesson 50 (milestone) will integrate loot tables into the full combat loop.

## Mastery Check

Why must loot rolls use the world's seeded RNG instead of a separate random source?
Answer: A separate RNG creates a second state stream. If combat order changes (enemy dies in different order), the loot RNG and combat RNG desync. One RNG, one truth — replay stays deterministic.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int ITEM_NONE=-1;

struct LootEntry{
    int item_id;
    int weight;
};

// TODO: Write rollLoot that takes (const LootEntry* table, int count, RNG& r)
// Sum all weights, roll rng in [0, total), accumulate to find winner
// Return the winning item_id

int main(){
    RNG r1; rng_seed(r1,100);
    RNG r2; rng_seed(r2,100);
    RNG r3; rng_seed(r3,200);

    const LootEntry table[]={{0,2},{4,5},{ITEM_NONE,3}};
    int count=3;

    int a=rollLoot(table,count,r1);
    cout<<"LOOT_ROLL|seed=100|item="<<a<<endl;

    int b=rollLoot(table,count,r2);
    cout<<"LOOT_ROLL|seed=100|item="<<b<<endl;

    int c=rollLoot(table,count,r3);
    cout<<"LOOT_ROLL|seed=200|item="<<c<<endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int ITEM_NONE=-1;

struct LootEntry{
    int item_id;
    int weight;
};

int rollLoot(const LootEntry* table,int count,RNG& r){
    int total=0;
    for(int i=0;i<count;i++) total+=table[i].weight;
    if(total<=0) return ITEM_NONE;
    int roll=(int)(rng_next(r)%total);
    int acc=0;
    for(int i=0;i<count;i++){
        acc+=table[i].weight;
        if(roll<acc) return table[i].item_id;
    }
    return table[count-1].item_id;
}

int main(){
    RNG r1; rng_seed(r1,100);
    RNG r2; rng_seed(r2,100);
    RNG r3; rng_seed(r3,200);

    const LootEntry table[]={{0,2},{4,5},{ITEM_NONE,3}};
    int count=3;

    int a=rollLoot(table,count,r1);
    cout<<"LOOT_ROLL|seed=100|item="<<a<<endl;

    int b=rollLoot(table,count,r2);
    cout<<"LOOT_ROLL|seed=100|item="<<b<<endl;

    int c=rollLoot(table,count,r3);
    cout<<"LOOT_ROLL|seed=200|item="<<c<<endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "First roll with seed 100", expectedOutput: "LOOT_ROLL|seed=100|item=4", isPattern: false },
      { id: "t2", description: "Same seed produces same result", expectedOutput: "LOOT_ROLL|seed=100|item=4", isPattern: false },
      { id: "t3", description: "Different seed produces different result", expectedOutput: "LOOT_ROLL|seed=200|item=0", isPattern: false },
    ],
    hints: [
      "Sum all weights first with a loop, then use rng_next(r) % total to get a roll in range.",
      "Walk the table accumulating weights. When accumulated weight exceeds the roll, that entry wins.",
      "int acc=0; for each entry: acc += entry.weight; if(roll < acc) return entry.item_id;"
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Loot Drops in Combat",
    type: "game_builder",
    instructions: `# Loot Drops in Combat

## Mental Model

When an enemy dies, the game rolls its loot table and adds the dropped item to the player's inventory. This connects three systems: combat (kill triggers drop), loot tables (weighted selection), and inventory (item storage). All driven by the seeded RNG — deterministic, replayable, data-driven.

## What Breaks Without This

Without loot tables integrated into combat, killing enemies gives gold but never items. The player has no reason to fight beyond survival. The shop is the only item source. The game feels flat — no excitement from a lucky drop, no "will I get the Steel Sword?" tension.

## The Fix: Combat-Integrated Loot

Add a \`LootEntry\` struct and a \`LOOT_TABLE\` keyed by enemy damage_id. When an enemy is killed in the combat pass, call \`rollLoot()\` using the world's RNG. If the result isn't ITEM_NONE and inventory has space, add the item. Print a LOOT line showing what dropped.

The loot table is const data — no heap allocation. The roll happens inside the existing combat pass. The inventory add uses the existing fixed-size array. Zero new allocations. Gate A compliant.

## Key Concepts
- Loot table per enemy type: indexed by damage_id
- Kill → roll → inventory add pipeline
- Deterministic drops: same seed, same kill order = same items
- Gate A compliant: no heap allocation in the loot pipeline

## Performance Insight

The loot roll adds one small-array walk per kill — negligible cost. The table lookup by damage_id is a direct index, O(1). Combined with the existing combat pass, the total per-kill overhead is ~20 instructions. Even 50 enemies dying in one turn won't matter.

## Memory Insight

The loot table is const data in .rodata — 3 entries per enemy type × 2 enemy types = 6 entries × 8 bytes = 48 bytes. The rolled item goes into the existing inventory array. No new fields in WorldState beyond what's already there. Memory footprint unchanged.

## Your Task

Add \`LootEntry\` struct and \`LOOT_TABLE\` arrays for each enemy type. Add \`rollLoot()\` function. In the combat kill path, roll loot and add to inventory if space available. Print \`LOOT|{item_name}|id={item_id}\` on successful drops.

Expected output should include loot drops when enemies are killed.

## Beginner Trap

**Rolling loot before confirming the kill.** The loot roll must happen AFTER \`w.alive[i]=false\` and the gold drop. If you roll before the kill check, you consume an RNG value even on non-lethal hits. This shifts all future RNG results — replay divergence from a single misplaced line.

## Elite Insight

Nethack's loot system has been deterministic since 1987. Every monster death, every chest opening, every fountain wish flows from a single RNG seed. Speedrunners exploit this — they know exactly which kills produce which items. Your loot table follows the same principle: deterministic drops enable strategy, not just luck.

## Systems Thinking Connection

This loot pipeline mirrors the Space Shooter path's power-up drop system — both use weighted random selection from a seeded RNG. The RPG version adds inventory integration, making it a three-system pipeline instead of a single spawn.

## Skill Reinforcement

Lesson 44 established gold drops on kill. Lesson 47 added shop purchases. This lesson adds loot drops — the third item acquisition path. Lesson 50 (milestone) integrates all three.

## Mastery Check

If two enemies die in the same turn, which enemy's loot is rolled first and why does it matter?
Answer: The enemy with the lower array index is processed first (stable iteration order). Its loot roll consumes one RNG value, shifting the second enemy's roll. Swap the kill order and you get different loot. Stable iteration = deterministic loot.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
const int MODE_PLAYING=0;
const int MODE_SHOPPING=1;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};

const int ITEM_TYPE_WEAPON=0;const int ITEM_TYPE_ARMOR=1;const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3},{3,2}};

// TODO: Define LootEntry struct with item_id and weight

// TODO: Define LOOT_TABLE arrays for enemy types
// Enemy damage_id=1: Iron Sword(w=1), Potion(w=3), ITEM_NONE(w=6)
// Enemy damage_id=2: Leather(w=2), Potion(w=3), ITEM_NONE(w=5)

// TODO: Write rollLoot(const LootEntry* table, int count, RNG& r) -> int

struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;int buy_id;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false,-1};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true;
    else if(c=='q') cmd.close_shop=true;
    else if(c>='1'&&c<='5') cmd.buy_id=c-'1';
    return cmd;
}

struct CombatEvent{int src;int target;int dmg;int hp_after;bool killed;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    CombatEvent event_log[MAX_EVENTS];int event_count;
    int weapon_id;int armor_id;
    int gold;int mode;
};

bool tryBuyItem(WorldState& w, int item_id){
    if(item_id<0||item_id>=ITEM_COUNT) return false;
    if(w.gold<ITEM_TABLE[item_id].value) return false;
    if(w.inv_count>=INV_SIZE) return false;
    w.gold-=ITEM_TABLE[item_id].value;
    w.inventory[w.inv_count++]=item_id;
    return true;
}

const char ROOM_DATA[]=
    "##########""#@.......#""#........#""#........#""#........#"
    "#....E...#""#........#""#.G......#""#........#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;
    w.gold=50;w.mode=MODE_PLAYING;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=10;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;w.grid[y][x]='.';
        }else if(c=='G'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=15;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=2;w.grid[y][x]='.';
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){w.mode=MODE_SHOPPING;cout<<"SHOP|open"<<endl;return;}
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.use_item){
            for(int i=0;i<w.inv_count;i++){
                int item_id=w.inventory[i];
                if(item_id<0||item_id>=ITEM_COUNT) continue;
                if(ITEM_TABLE[item_id].type==ITEM_TYPE_CONSUMABLE){
                    int heal=ITEM_TABLE[item_id].stat;w.hp[0]+=heal;
                    if(w.hp[0]>MAX_HP) w.hp[0]=MAX_HP;
                    cout<<"USE|"<<ITEM_TABLE[item_id].name<<"|heal="<<heal<<"|hp="<<w.hp[0]<<endl;
                    for(int j=i;j<w.inv_count-1;j++) w.inventory[j]=w.inventory[j+1];
                    w.inventory[w.inv_count-1]=ITEM_NONE;w.inv_count--;break;
                }
            }
        }
        if(cmd.attack){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){
                    int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT) dmg+=ITEM_TABLE[w.weapon_id].stat;
                    w.hp[i]-=dmg;
                    cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                    if(w.hp[i]<=0){w.alive[i]=false;
                        int bg=GOLD_TABLE[w.damage_id[i]].base;int bn=0;
                        if(GOLD_TABLE[w.damage_id[i]].bonus_range>0) bn=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                        w.gold+=bg+bn;cout<<"KILL|id="<<i<<endl;
                        // TODO: Roll loot table for this enemy's damage_id
                        // If result != ITEM_NONE and inv_count < INV_SIZE, add to inventory
                        // Print: LOOT|{item_name}|id={item_id}
                    }
                    if(w.event_count<MAX_EVENTS){CombatEvent& ev=w.event_log[w.event_count++];
                        ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];ev.killed=(w.hp[i]<=0);}
                    break;
                }
            }
        }
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
            int edx=0;
            if(bh.chase_x){if(w.pos_x[i]<w.pos_x[0]) edx=1;else if(w.pos_x[i]>w.pos_x[0]) edx=-1;}
            int enx=w.pos_x[i]+edx;
            if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL) w.pos_x[i]=enx;
        }
    }else if(w.mode==MODE_SHOPPING){
        if(cmd.close_shop){w.mode=MODE_PLAYING;cout<<"SHOP|close"<<endl;}
        else if(cmd.buy_id>=0){
            bool ok=tryBuyItem(w,cmd.buy_id);
            if(ok) cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|cost="<<ITEM_TABLE[cmd.buy_id].value<<"|gold="<<w.gold<<"|ok"<<endl;
            else cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|fail"<<endl;
        }
    }
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    cout<<"HUD_GOLD|"<<w.gold<<endl;
    cout<<"HUD_INV|"<<w.inv_count<<" items"<<endl;
}

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++)
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to enemy, attack twice to kill, check loot
    char inputs[]={'d','d','d','d','s','f','f'};
    for(int i=0;i<7;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
const int MODE_PLAYING=0;
const int MODE_SHOPPING=1;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};

const int ITEM_TYPE_WEAPON=0;const int ITEM_TYPE_ARMOR=1;const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3},{3,2}};

struct LootEntry{int item_id;int weight;};
const int MAX_LOOT_ENTRIES=4;
const LootEntry LOOT_TABLE_E1[]={{0,1},{4,3},{ITEM_NONE,6}};
const int LOOT_COUNT_E1=3;
const LootEntry LOOT_TABLE_E2[]={{2,2},{4,3},{ITEM_NONE,5}};
const int LOOT_COUNT_E2=3;

int rollLoot(const LootEntry* table,int count,RNG& r){
    int total=0;
    for(int i=0;i<count;i++) total+=table[i].weight;
    if(total<=0) return ITEM_NONE;
    int roll=(int)(rng_next(r)%total);
    int acc=0;
    for(int i=0;i<count;i++){
        acc+=table[i].weight;
        if(roll<acc) return table[i].item_id;
    }
    return table[count-1].item_id;
}

const LootEntry* getLootTable(int damage_id,int& out_count){
    if(damage_id==1){out_count=LOOT_COUNT_E1;return LOOT_TABLE_E1;}
    if(damage_id==2){out_count=LOOT_COUNT_E2;return LOOT_TABLE_E2;}
    out_count=0;return nullptr;
}

struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;int buy_id;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false,-1};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true;
    else if(c=='q') cmd.close_shop=true;
    else if(c>='1'&&c<='5') cmd.buy_id=c-'1';
    return cmd;
}

struct CombatEvent{int src;int target;int dmg;int hp_after;bool killed;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    CombatEvent event_log[MAX_EVENTS];int event_count;
    int weapon_id;int armor_id;
    int gold;int mode;
};

bool tryBuyItem(WorldState& w, int item_id){
    if(item_id<0||item_id>=ITEM_COUNT) return false;
    if(w.gold<ITEM_TABLE[item_id].value) return false;
    if(w.inv_count>=INV_SIZE) return false;
    w.gold-=ITEM_TABLE[item_id].value;
    w.inventory[w.inv_count++]=item_id;
    return true;
}

const char ROOM_DATA[]=
    "##########""#@.......#""#........#""#........#""#........#"
    "#....E...#""#........#""#.G......#""#........#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;
    w.gold=50;w.mode=MODE_PLAYING;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=10;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;w.grid[y][x]='.';
        }else if(c=='G'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=15;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=2;w.grid[y][x]='.';
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){w.mode=MODE_SHOPPING;cout<<"SHOP|open"<<endl;return;}
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.use_item){
            for(int i=0;i<w.inv_count;i++){
                int item_id=w.inventory[i];
                if(item_id<0||item_id>=ITEM_COUNT) continue;
                if(ITEM_TABLE[item_id].type==ITEM_TYPE_CONSUMABLE){
                    int heal=ITEM_TABLE[item_id].stat;w.hp[0]+=heal;
                    if(w.hp[0]>MAX_HP) w.hp[0]=MAX_HP;
                    cout<<"USE|"<<ITEM_TABLE[item_id].name<<"|heal="<<heal<<"|hp="<<w.hp[0]<<endl;
                    for(int j=i;j<w.inv_count-1;j++) w.inventory[j]=w.inventory[j+1];
                    w.inventory[w.inv_count-1]=ITEM_NONE;w.inv_count--;break;
                }
            }
        }
        if(cmd.attack){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){
                    int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT) dmg+=ITEM_TABLE[w.weapon_id].stat;
                    w.hp[i]-=dmg;
                    cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                    if(w.hp[i]<=0){w.alive[i]=false;
                        int bg=GOLD_TABLE[w.damage_id[i]].base;int bn=0;
                        if(GOLD_TABLE[w.damage_id[i]].bonus_range>0) bn=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                        w.gold+=bg+bn;cout<<"KILL|id="<<i<<endl;
                        int lc=0;
                        const LootEntry* lt=getLootTable(w.damage_id[i],lc);
                        if(lt){
                            int dropped=rollLoot(lt,lc,w.rng);
                            if(dropped!=ITEM_NONE&&w.inv_count<INV_SIZE){
                                w.inventory[w.inv_count++]=dropped;
                                cout<<"LOOT|"<<ITEM_TABLE[dropped].name<<"|id="<<dropped<<endl;
                            }else if(dropped==ITEM_NONE){
                                cout<<"LOOT|nothing"<<endl;
                            }
                        }
                    }
                    if(w.event_count<MAX_EVENTS){CombatEvent& ev=w.event_log[w.event_count++];
                        ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];ev.killed=(w.hp[i]<=0);}
                    break;
                }
            }
        }
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
            int edx=0;
            if(bh.chase_x){if(w.pos_x[i]<w.pos_x[0]) edx=1;else if(w.pos_x[i]>w.pos_x[0]) edx=-1;}
            int enx=w.pos_x[i]+edx;
            if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL) w.pos_x[i]=enx;
        }
    }else if(w.mode==MODE_SHOPPING){
        if(cmd.close_shop){w.mode=MODE_PLAYING;cout<<"SHOP|close"<<endl;}
        else if(cmd.buy_id>=0){
            bool ok=tryBuyItem(w,cmd.buy_id);
            if(ok) cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|cost="<<ITEM_TABLE[cmd.buy_id].value<<"|gold="<<w.gold<<"|ok"<<endl;
            else cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|fail"<<endl;
        }
    }
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    cout<<"HUD_GOLD|"<<w.gold<<endl;
    cout<<"HUD_INV|"<<w.inv_count<<" items"<<endl;
}

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++)
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to enemy, attack twice to kill, check loot
    char inputs[]={'d','d','d','d','s','f','f'};
    for(int i=0;i<7;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads with entities", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g2", description: "First attack hits enemy", expectedOutput: "COMBAT|src=0|target=1|dmg=8|hp=2", isPattern: false },
      { id: "g3", description: "Second attack kills enemy", expectedOutput: "KILL|id=1", isPattern: false },
      { id: "g4", description: "Loot dropped from kill", expectedOutput: "LOOT|", isPattern: true },
      { id: "g5", description: "HUD shows inventory count", expectedOutput: "HUD_INV|", isPattern: true },
      { id: "g6", description: "Gold updated after kill", expectedOutput: "HUD_GOLD|", isPattern: true },
    ],
    hints: [
      "Define LootEntry with item_id and weight. Create const arrays for each enemy type's loot table.",
      "Write rollLoot: sum weights, roll rng % total, accumulate until roll < acc. Return winning item_id.",
      "In the kill block after gold drop, call getLootTable(w.damage_id[i], count), then rollLoot. If result != ITEM_NONE and inv has space, add item and print LOOT line."
    ],
    estimatedMinutes: 15,
  },
};
