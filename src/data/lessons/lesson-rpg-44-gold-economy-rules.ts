import { Lesson } from "@/types/lesson";

export const lessonRPG44: Lesson = {
  id: "rpg-44-gold-economy-rules",
  title: "Gold Economy Rules",
  description: "Enemies drop gold deterministically on death — amount derived from RNG and enemy type. Gold is an integer in WorldState, earned through combat.",
  order: 44,
  xpReward: 100,
  tier: "pro",
  concepts: ["economic determinism", "gold drops", "RNG-based loot", "resource tracking"],
  part1: {
    title: "Concept: Deterministic Gold Drops",
    type: "concept",
    instructions: `# Gold Economy Rules

## Mental Model
Gold is an integer. When an enemy dies, it drops gold. The drop amount is deterministic: base_gold from a table + a small RNG bonus. The same seed, same kill order → same gold every time. This is economic determinism: the economy is reproducible.

Gold is stored as a single int in WorldState. Earning gold: add to the int. Spending gold (future lesson: shop): subtract from the int. The gold amount is always known, always deterministic, always auditable.

## What Breaks Without This
Without gold:
- There is no reward for killing enemies (combat is meaningless beyond survival)
- There is no currency for the shop (Lesson 46)
- There is no progression loop (kill → earn → buy → kill better)

Without deterministic drops:
- Replay verification fails (same inputs, different gold)
- Speedrun strategies become unreliable
- Testing is non-reproducible

## The Fix: Gold Drop on Kill

Add to WorldState:
\`\`\`cpp
int gold;
\`\`\`

Gold drop table (per enemy type):
\`\`\`cpp
struct GoldDrop {
    int base;
    int bonus_range;  // RNG bonus from 0 to bonus_range-1
};

const GoldDrop GOLD_TABLE[] = {
    {0, 0},   // player drops nothing
    {5, 3},   // melee: 5 + rng(0..2) = 5-7 gold
    {3, 2},   // passive: 3 + rng(0..1) = 3-4 gold
};
\`\`\`

In combat, when an enemy dies:
\`\`\`cpp
if (w.hp[i] <= 0) {
    w.alive[i] = false;
    int base = GOLD_TABLE[w.damage_id[i]].base;
    int bonus = 0;
    if (GOLD_TABLE[w.damage_id[i]].bonus_range > 0) {
        bonus = rng_next(w.rng) % GOLD_TABLE[w.damage_id[i]].bonus_range;
    }
    int drop = base + bonus;
    w.gold += drop;
    cout << "GOLD|drop=" << drop << "|total=" << w.gold << endl;
}
\`\`\`

## Key Concepts
- Gold as state: one int in WorldState, initialized to 0
- Gold drop table: base + RNG bonus per enemy damage_id (reusing existing type system)
- Deterministic RNG: same seed → same bonus → same total gold
- Economic rule: gold only increases through kills (no other source yet)
- Audit trail: GOLD trace shows every drop and running total

## Performance Insight
Gold drop calculation: one table lookup + one RNG call + one modulo + one addition = 4 operations. Happens only on kill (rare). Cost: negligible.

## Memory Insight
One new int in WorldState: 4 bytes. GOLD_TABLE: 3 entries × 8 bytes = 24 bytes const. No heap allocations. Gate A: fully compliant.

## Your Task
Implement gold drops for 3 kills. Each kill gives base + RNG bonus gold. Track the running total.

Expected output:
\`\`\`
KILL|id=1|gold_drop=6|total=6
KILL|id=2|gold_drop=3|total=9
KILL|id=3|gold_drop=7|total=16
FINAL|gold=16
\`\`\`

(Note: exact values depend on RNG seed.)

## Beginner Trap
**Using rand() or srand() instead of the custom RNG.** stdlib rand() is global, non-deterministic across platforms, and breaks replay verification. Always use the WorldState RNG (rng_next) for any gameplay randomness. The custom RNG is deterministic by construction.

## Elite Insight
Diablo 2's gold drops use a similar formula: base_gold from MonStats.txt + a random bonus capped by monster level. The drop is computed at kill time using the game's deterministic RNG. Speedrunners rely on this determinism to plan their economy. Your GOLD_TABLE follows the same architecture.

## Systems Thinking Connection
The Space Shooter path awards score on enemy destruction. The Platformer path awards coins on enemy stomp. The Robotics path awards data points on successful measurements. All four paths implement "reward on event" using deterministic calculations.

## Skill Reinforcement
Lesson 36 introduced DAMAGE_TABLE. Lesson 41 introduced ITEM_TABLE. This lesson introduces GOLD_TABLE. Same pattern, fourth domain. The drop uses the RNG from Lesson 21. Everything connects.

## Mastery Check
Question: Why use damage_id to index GOLD_TABLE instead of a separate gold_type_id?
Answer: Because damage_id already classifies entity types (player=0, melee=1, passive=2). Gold drops correlate with entity type. Reusing the existing classification avoids adding another per-entity int and keeps the type system unified. If gold drops need to vary independently from damage type, add gold_type_id later.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) {
    r.state = r.state * 1664525u + 1013904223u;
    return r.state;
}

const int MAX_E = 8;

struct GoldDrop {
    int base;
    int bonus_range;
};

const GoldDrop GOLD_TABLE[] = {
    {0, 0},   // player
    {5, 3},   // melee: 5 + rng(0..2)
    {3, 2},   // passive: 3 + rng(0..1)
};

int main() {
    RNG rng;
    rng_seed(rng, 42);
    int gold = 0;

    // Simulate 3 enemy kills
    int damage_ids[] = {1, 2, 1};  // melee, passive, melee

    // TODO: For each kill:
    //   1. Look up GOLD_TABLE[damage_ids[i]]
    //   2. Calculate drop = base + rng_next(rng) % bonus_range
    //      (if bonus_range == 0, bonus = 0)
    //   3. Add drop to gold
    //   4. Print: KILL|id=I+1|gold_drop=D|total=G

    // TODO: Print FINAL|gold=G

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) {
    r.state = r.state * 1664525u + 1013904223u;
    return r.state;
}

const int MAX_E = 8;

struct GoldDrop {
    int base;
    int bonus_range;
};

const GoldDrop GOLD_TABLE[] = {
    {0, 0},   // player
    {5, 3},   // melee: 5 + rng(0..2)
    {3, 2},   // passive: 3 + rng(0..1)
};

int main() {
    RNG rng;
    rng_seed(rng, 42);
    int gold = 0;

    int damage_ids[] = {1, 2, 1};

    for (int i = 0; i < 3; i++) {
        int base = GOLD_TABLE[damage_ids[i]].base;
        int bonus = 0;
        if (GOLD_TABLE[damage_ids[i]].bonus_range > 0) {
            bonus = rng_next(rng) % GOLD_TABLE[damage_ids[i]].bonus_range;
        }
        int drop = base + bonus;
        gold += drop;
        cout << "KILL|id=" << (i + 1) << "|gold_drop=" << drop
             << "|total=" << gold << endl;
    }

    cout << "FINAL|gold=" << gold << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "First kill drops gold", expectedOutput: "KILL|id=1|gold_drop=", isPattern: true },
      { id: "t2", description: "Gold accumulates", expectedOutput: "KILL|id=3|gold_drop=", isPattern: true },
      { id: "t3", description: "Final gold reported", expectedOutput: "FINAL|gold=", isPattern: true },
    ],
    hints: [
      "Use GOLD_TABLE[damage_ids[i]].base for the base gold amount.",
      "Check bonus_range > 0 before computing: rng_next(rng) % bonus_range. Division by zero crashes.",
      "Gold is cumulative: add each drop to the running total with gold += drop."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Gold Drops in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Gold Drops in the Game Loop

## Mental Model
Wire gold into the game. WorldState gains an int gold field. When an enemy dies in combat, the gold drop is calculated from GOLD_TABLE + RNG and added to w.gold. The HUD shows the player's gold. The economy is now live: kill enemies, earn gold, see the reward.

Pipeline per tick: clear events → input → move → use item → combat (gold on kill) → AI → render → HUD (with gold).

## What Breaks Without This
Without gold integration:
- Combat has no economic reward
- The HUD shows HP and inventory but not gold
- The shop (Lesson 46) has no currency to spend

With gold:
- Every kill is rewarded
- The player can track their wealth
- The foundation for buying items is in place

## The Fix: Gold in WorldState and Combat

Add to WorldState:
\`\`\`cpp
int gold;
\`\`\`

In loadRoom, initialize: \`w.gold = 0;\`

In combat kill code:
\`\`\`cpp
if (w.hp[i] <= 0) {
    w.alive[i] = false;
    int base_g = GOLD_TABLE[w.damage_id[i]].base;
    int bonus = 0;
    if (GOLD_TABLE[w.damage_id[i]].bonus_range > 0)
        bonus = rng_next(w.rng) % GOLD_TABLE[w.damage_id[i]].bonus_range;
    int drop = base_g + bonus;
    w.gold += drop;
    cout << "KILL|id=" << i << "|gold=" << drop << endl;
}
\`\`\`

In renderHUD:
\`\`\`cpp
cout << "HUD_GOLD|" << w.gold << endl;
\`\`\`

## Key Concepts
- Gold in WorldState: one int, initialized to 0 on loadRoom
- Gold drop on kill: base from GOLD_TABLE + RNG bonus
- HUD gold display: read w.gold, print it
- Deterministic economy: same seed → same drops → same final gold

## Performance Insight
Gold calculation: 1 table lookup + 1 RNG call + 1 modulo + 1 addition = 4 operations per kill. Zero cost per non-kill tick. The RNG call is already fast (multiply + add).

## Memory Insight
One new int (4 bytes) in WorldState. GOLD_TABLE is 24 bytes const. No heap allocations. Gate A: fully compliant.

## Your Task
Add gold to WorldState. Drop gold on enemy kills. Display gold in HUD. Kill the guard (3 hits with weapon) and verify gold is earned.

Expected output includes:
\`\`\`
KILL|id=1|gold=3
HUD_GOLD|3
HUD|hp=30|turn=4|enemies=1
\`\`\`

(Guard has damage_id=2 (passive), so GOLD_TABLE[2] = {3, 2}. Drop = 3 + rng%2.)

## Beginner Trap
**Resetting gold on room load when the player transitions between rooms.** In our current system, loadRoom zeroes WorldState including gold. If the player earns 20 gold, transitions rooms, and gold resets to 0, the economy is broken. For now this is acceptable (single room), but Lesson 45 will address persistence.

## Elite Insight
Path of Exile tracks every currency drop in a deterministic log. The game's economy is auditable: given the server seed and action sequence, every drop can be reproduced. Your gold + RNG system achieves the same auditability at a smaller scale.

## Mastery Check
Question: Why use the WorldState RNG for gold drops instead of a separate "economy RNG"?
Answer: For simplicity. One RNG per WorldState keeps the state minimal. The risk: gold drops consume RNG values, which changes subsequent RNG results for other systems (AI, spawning). In a production game, you might use separate RNG streams for combat, economy, and AI to isolate them. For now, one RNG is sufficient and deterministic.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = { {0,0}, {1,0} };
struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = { {5}, {3}, {0} };

const int ITEM_TYPE_WEAPON=0;
const int ITEM_TYPE_ARMOR=1;
const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef { int type; int stat; int value; char name[16]; };
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop { int base; int bonus_range; };
const GoldDrop GOLD_TABLE[] = { {0,0}, {5,3}, {3,2} };

struct Command { int dx; int dy; bool attack; bool use_item; };
Command captureInput(char c){
    Command cmd={0,0,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    return cmd;
}

struct CombatEvent { int src; int target; int dmg; int hp_after; bool killed; };

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int behavior_id[MAX_E];
    int damage_id[MAX_E];
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
    CombatEvent event_log[MAX_EVENTS];
    int event_count;
    int weapon_id; int armor_id;
    // TODO: Add int gold
};

const char ROOM_DATA[] =
    "##########"
    "#@.G.....#"
    "#........#"
    "#........#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#........#"
    "##########";

void loadRoom(WorldState& w, const char* data, int dw, int dh, unsigned int seed){
    w={};
    w.seed=seed; rng_seed(w.rng,seed);
    w.entity_count=0;
    w.weapon_id=ITEM_NONE; w.armor_id=ITEM_NONE;
    // TODO: w.gold=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int y=0;y<dh&&y<H;y++){
        for(int x=0;x<dw&&x<W;x++){
            char c=data[y*dw+x];
            if(c=='@'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=30; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=0;
                w.grid[y][x]='.';
                w.inventory[0]=0; w.inventory[1]=4;
                w.inv_count=2;
                w.weapon_id=0;
            } else if(c=='E'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=10; w.alive[id]=true;
                w.behavior_id[id]=BH_CHASE_X;
                w.damage_id[id]=1;
                w.grid[y][x]='.';
            } else if(c=='G'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=15; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=2;
                w.grid[y][x]='.';
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

// TODO: Add gold drop to combat kill code
void game_tick(WorldState& w, Command cmd){
    w.event_count=0;
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.use_item){
        for(int i=0;i<w.inv_count;i++){
            int item_id=w.inventory[i];
            if(item_id<0||item_id>=ITEM_COUNT) continue;
            if(ITEM_TABLE[item_id].type==ITEM_TYPE_CONSUMABLE){
                int heal=ITEM_TABLE[item_id].stat;
                w.hp[0]+=heal;
                if(w.hp[0]>MAX_HP) w.hp[0]=MAX_HP;
                cout<<"USE|"<<ITEM_TABLE[item_id].name<<"|heal="<<heal<<"|hp="<<w.hp[0]<<endl;
                for(int j=i;j<w.inv_count-1;j++) w.inventory[j]=w.inventory[j+1];
                w.inventory[w.inv_count-1]=ITEM_NONE;
                w.inv_count--;
                break;
            }
        }
    }
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT)
                    dmg+=ITEM_TABLE[w.weapon_id].stat;
                w.hp[i]-=dmg;
                cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){
                    w.alive[i]=false;
                    // TODO: Calculate and add gold drop
                    cout<<"KILL|id="<<i<<endl;
                }
                if(w.event_count<MAX_EVENTS){
                    CombatEvent& ev=w.event_log[w.event_count++];
                    ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];
                    ev.killed=(w.hp[i]<=0);
                }
                break;
            }
        }
    }
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
        int edx=0;
        if(bh.chase_x){
            if(w.pos_x[i]<w.pos_x[0]) edx=1;
            else if(w.pos_x[i]>w.pos_x[0]) edx=-1;
        }
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL)
            w.pos_x[i]=enx;
    }
}

void renderWorld(const WorldState& w){
    int ac=0;
    for(int i=0;i<w.entity_count;i++) if(w.alive[i]) ac++;
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
}

// TODO: Add HUD_GOLD to renderHUD
void renderHUD(const WorldState& w){
    int ae=0;
    for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    // TODO: cout<<"HUD_GOLD|"<<w.gold<<endl;
    for(int i=0;i<w.inv_count;i++){
        int id=w.inventory[i];
        if(id>=0&&id<ITEM_COUNT)
            cout<<"INV|"<<i<<"|"<<ITEM_TABLE[id].name<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    // Move right, then attack guard 3 times (weapon dmg 8 kills in 2 hits)
    char inputs[]={'d','f','f','d'};
    for(int i=0;i<4;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
        renderHUD(w);
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = { {0,0}, {1,0} };
struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = { {5}, {3}, {0} };

const int ITEM_TYPE_WEAPON=0;
const int ITEM_TYPE_ARMOR=1;
const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef { int type; int stat; int value; char name[16]; };
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop { int base; int bonus_range; };
const GoldDrop GOLD_TABLE[] = { {0,0}, {5,3}, {3,2} };

struct Command { int dx; int dy; bool attack; bool use_item; };
Command captureInput(char c){
    Command cmd={0,0,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    return cmd;
}

struct CombatEvent { int src; int target; int dmg; int hp_after; bool killed; };

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int behavior_id[MAX_E];
    int damage_id[MAX_E];
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
    CombatEvent event_log[MAX_EVENTS];
    int event_count;
    int weapon_id; int armor_id;
    int gold;
};

const char ROOM_DATA[] =
    "##########"
    "#@.G.....#"
    "#........#"
    "#........#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#........#"
    "##########";

void loadRoom(WorldState& w, const char* data, int dw, int dh, unsigned int seed){
    w={};
    w.seed=seed; rng_seed(w.rng,seed);
    w.entity_count=0;
    w.weapon_id=ITEM_NONE; w.armor_id=ITEM_NONE;
    w.gold=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int y=0;y<dh&&y<H;y++){
        for(int x=0;x<dw&&x<W;x++){
            char c=data[y*dw+x];
            if(c=='@'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=30; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=0;
                w.grid[y][x]='.';
                w.inventory[0]=0; w.inventory[1]=4;
                w.inv_count=2;
                w.weapon_id=0;
            } else if(c=='E'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=10; w.alive[id]=true;
                w.behavior_id[id]=BH_CHASE_X;
                w.damage_id[id]=1;
                w.grid[y][x]='.';
            } else if(c=='G'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=15; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=2;
                w.grid[y][x]='.';
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w, Command cmd){
    w.event_count=0;
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.use_item){
        for(int i=0;i<w.inv_count;i++){
            int item_id=w.inventory[i];
            if(item_id<0||item_id>=ITEM_COUNT) continue;
            if(ITEM_TABLE[item_id].type==ITEM_TYPE_CONSUMABLE){
                int heal=ITEM_TABLE[item_id].stat;
                w.hp[0]+=heal;
                if(w.hp[0]>MAX_HP) w.hp[0]=MAX_HP;
                cout<<"USE|"<<ITEM_TABLE[item_id].name<<"|heal="<<heal<<"|hp="<<w.hp[0]<<endl;
                for(int j=i;j<w.inv_count-1;j++) w.inventory[j]=w.inventory[j+1];
                w.inventory[w.inv_count-1]=ITEM_NONE;
                w.inv_count--;
                break;
            }
        }
    }
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT)
                    dmg+=ITEM_TABLE[w.weapon_id].stat;
                w.hp[i]-=dmg;
                cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){
                    w.alive[i]=false;
                    int base_g=GOLD_TABLE[w.damage_id[i]].base;
                    int bonus=0;
                    if(GOLD_TABLE[w.damage_id[i]].bonus_range>0)
                        bonus=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                    int drop=base_g+bonus;
                    w.gold+=drop;
                    cout<<"KILL|id="<<i<<"|gold="<<drop<<endl;
                }
                if(w.event_count<MAX_EVENTS){
                    CombatEvent& ev=w.event_log[w.event_count++];
                    ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];
                    ev.killed=(w.hp[i]<=0);
                }
                break;
            }
        }
    }
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
        int edx=0;
        if(bh.chase_x){
            if(w.pos_x[i]<w.pos_x[0]) edx=1;
            else if(w.pos_x[i]>w.pos_x[0]) edx=-1;
        }
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL)
            w.pos_x[i]=enx;
    }
}

void renderWorld(const WorldState& w){
    int ac=0;
    for(int i=0;i<w.entity_count;i++) if(w.alive[i]) ac++;
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
}

void renderHUD(const WorldState& w){
    int ae=0;
    for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    cout<<"HUD_GOLD|"<<w.gold<<endl;
    for(int i=0;i<w.inv_count;i++){
        int id=w.inventory[i];
        if(id>=0&&id<ITEM_COUNT)
            cout<<"INV|"<<i<<"|"<<ITEM_TABLE[id].name<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','f','f','d'};
    for(int i=0;i<4;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
        renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Gold starts at 0", expectedOutput: "HUD_GOLD|0", isPattern: false },
      { id: "g2", description: "Kill drops gold", expectedOutput: "KILL|id=1|gold=", isPattern: true },
      { id: "g3", description: "HUD shows earned gold", expectedOutput: "HUD_GOLD|", isPattern: true },
      { id: "g4", description: "Combat damage includes weapon", expectedOutput: "COMBAT|src=0|target=1|dmg=8", isPattern: false },
      { id: "g5", description: "Guard killed with weapon damage", expectedOutput: "KILL|id=1", isPattern: false },
    ],
    hints: [
      "Add int gold to WorldState. Set w.gold=0 in loadRoom.",
      "In the kill code, use GOLD_TABLE[w.damage_id[i]] to get the drop parameters. Guard has damage_id=2.",
      "Add cout<<\"HUD_GOLD|\"<<w.gold<<endl; to renderHUD after the HUD line."
    ],
    estimatedMinutes: 12,
  },
};
