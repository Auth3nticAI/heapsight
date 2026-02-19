import { Lesson } from "@/types/lesson";

export const lessonRPG42: Lesson = {
  id: "rpg-42-equipment-slots",
  title: "Equipment Slots",
  description: "Weapon and armor slots reference items by ID — equipping changes a slot value, not the item. Combat reads equipped weapon stat from the table.",
  order: 42,
  xpReward: 100,
  tier: "pro",
  concepts: ["equipment slots", "slot-based references", "item ID indirection", "stat resolution"],
  part1: {
    title: "Concept: Slots as Item ID References",
    type: "concept",
    instructions: `# Equipment Slots

## Mental Model
An equipment slot is an integer — an item ID that points into ITEM_TABLE. The player has two slots: \`weapon_id\` and \`armor_id\`. When the player equips a sword, weapon_id is set to that sword's item ID. When combat resolves damage, it reads \`ITEM_TABLE[weapon_id].stat\` and adds it to base damage. The slot does not store the item — it references it.

This is indirection: the slot holds a pointer (an integer index), not a copy. Changing equipment means changing one integer. The item data stays in the table, unchanged.

## What Breaks Without This
Without equipment slots, you store weapon damage as a bare integer in WorldState:
\`\`\`cpp
int weapon_damage = 3;  // hardcoded, no connection to items
\`\`\`

Now when you change weapons, you must recalculate weapon_damage manually. With 5 equipment-affecting stats (damage, armor, speed, range, etc.), you need to recalculate all of them every time equipment changes. With slots + table lookup, the stats are always live — read the table, get the current value.

## The Fix: Equipment Slots in WorldState

\`\`\`cpp
// Add to WorldState:
int weapon_id;  // ITEM_NONE (-1) = unarmed
int armor_id;   // ITEM_NONE (-1) = unarmored
\`\`\`

Equip command:
\`\`\`cpp
// 'e' + slot number in a real game, but for now:
void equipFromInventory(WorldState& w, int inv_slot) {
    int item_id = w.inventory[inv_slot];
    if (item_id < 0 || item_id >= ITEM_COUNT) return;
    if (ITEM_TABLE[item_id].type == ITEM_TYPE_WEAPON) {
        w.weapon_id = item_id;
    } else if (ITEM_TABLE[item_id].type == ITEM_TYPE_ARMOR) {
        w.armor_id = item_id;
    }
}
\`\`\`

Combat damage with weapon bonus:
\`\`\`cpp
int base_dmg = DAMAGE_TABLE[w.damage_id[0]].base_dmg;
int weapon_bonus = 0;
if (w.weapon_id >= 0 && w.weapon_id < ITEM_COUNT) {
    weapon_bonus = ITEM_TABLE[w.weapon_id].stat;
}
int total_dmg = base_dmg + weapon_bonus;
\`\`\`

## Key Concepts
- Equipment slot: an int holding an item ID (or ITEM_NONE for empty)
- Equip action: set slot = item_id (one assignment, no allocation)
- Stat resolution: read ITEM_TABLE[slot_id].stat at use time, not at equip time
- Indirection: the slot references the table, the table holds the data
- Validation: always check slot_id >= 0 && slot_id < ITEM_COUNT before table access

## Performance Insight
Equipping an item: 1 comparison + 1 assignment = 2 operations. Resolving weapon damage in combat: 1 bounds check + 1 table lookup + 1 addition = 3 operations. Total equipment overhead per combat action: under 5 nanoseconds.

## Memory Insight
Two new ints in WorldState: weapon_id and armor_id = 8 bytes. No heap allocation. The item data lives in ITEM_TABLE (const, data segment). Equipment change: one integer write. Gate A: fully compliant.

## Your Task
Add weapon_id and armor_id to a simple player struct. Equip items from inventory, then resolve combat damage with the weapon bonus.

Expected output:
\`\`\`
EQUIP_WEAPON|Iron Sword|bonus=3
EQUIP_ARMOR|Leather|bonus=2
ATTACK|base=5|weapon=3|total=8
ATTACK|base=5|weapon=3|total=8
UNEQUIP_WEAPON
ATTACK|base=5|weapon=0|total=5
\`\`\`

## Beginner Trap
**Caching the weapon stat in a separate variable and forgetting to update it.** If you write \`int weapon_bonus = 3;\` when equipping, then later change the weapon, the cached value is stale. Instead, always read from the table: \`ITEM_TABLE[weapon_id].stat\`. The table is the source of truth, not a cached copy.

## Elite Insight
Dark Souls stores equipment as slot references. When you equip a weapon, the game writes the weapon ID to the player's equipment struct. Damage is calculated at hit time by reading the weapon's stats from the item database. Your weapon_id follows the same pattern — a reference, not a copy.

## Systems Thinking Connection
The Space Shooter path equips power-ups to weapon slots. The Platformer path equips abilities to slots. The Robotics path equips sensor modules to ports. All four paths use slot-based references: an integer that points to a data table row.

## Skill Reinforcement
Lesson 41 defined the item table. This lesson reads from it via equipment slots. Lesson 43 will add consumable items that are used (and removed) from inventory.

## Mastery Check
Question: Should unequipping return the item to inventory?
Answer: In our system, items are always in inventory. Equipment slots reference items by ID, not move them. Equipping means "this slot points to item X in my bag." Unequipping means "this slot points to nothing (ITEM_NONE)." The item stays in inventory either way. This simplifies the logic: no item movement, no duplication bugs.`,
    starterCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;

struct ItemDef {
    int type; int stat; int value;
    char name[16];
};

const int ITEM_COUNT = 5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,     3, 10, "Iron Sword"},
    {ITEM_TYPE_WEAPON,     5, 25, "Steel Sword"},
    {ITEM_TYPE_ARMOR,      2,  8, "Leather"},
    {ITEM_TYPE_ARMOR,      4, 20, "Chain Mail"},
    {ITEM_TYPE_CONSUMABLE, 10, 5, "Potion"},
};

const int INV_SIZE = 5;

int main() {
    int inventory[INV_SIZE] = {0, 2, 4, -1, -1};  // sword, leather, potion
    int inv_count = 3;
    int weapon_id = ITEM_NONE;
    int armor_id = ITEM_NONE;
    int base_dmg = 5;

    // TODO: Equip inventory[0] (Iron Sword) to weapon_id
    // Check type == ITEM_TYPE_WEAPON, then set weapon_id
    // Print: EQUIP_WEAPON|name|bonus=S

    // TODO: Equip inventory[1] (Leather) to armor_id
    // Check type == ITEM_TYPE_ARMOR, then set armor_id
    // Print: EQUIP_ARMOR|name|bonus=S

    // TODO: Attack twice with weapon equipped
    // total = base_dmg + ITEM_TABLE[weapon_id].stat (if weapon_id valid)
    // Print: ATTACK|base=B|weapon=W|total=T

    // TODO: Unequip weapon (weapon_id = ITEM_NONE)
    // Print: UNEQUIP_WEAPON

    // TODO: Attack once without weapon
    // weapon bonus = 0 when weapon_id == ITEM_NONE
    // Print: ATTACK|base=B|weapon=0|total=T

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;

struct ItemDef {
    int type; int stat; int value;
    char name[16];
};

const int ITEM_COUNT = 5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,     3, 10, "Iron Sword"},
    {ITEM_TYPE_WEAPON,     5, 25, "Steel Sword"},
    {ITEM_TYPE_ARMOR,      2,  8, "Leather"},
    {ITEM_TYPE_ARMOR,      4, 20, "Chain Mail"},
    {ITEM_TYPE_CONSUMABLE, 10, 5, "Potion"},
};

const int INV_SIZE = 5;

int main() {
    int inventory[INV_SIZE] = {0, 2, 4, -1, -1};
    int inv_count = 3;
    int weapon_id = ITEM_NONE;
    int armor_id = ITEM_NONE;
    int base_dmg = 5;

    // Equip Iron Sword
    int item_id = inventory[0];
    if (item_id >= 0 && item_id < ITEM_COUNT && ITEM_TABLE[item_id].type == ITEM_TYPE_WEAPON) {
        weapon_id = item_id;
        cout << "EQUIP_WEAPON|" << ITEM_TABLE[item_id].name << "|bonus=" << ITEM_TABLE[item_id].stat << endl;
    }

    // Equip Leather
    item_id = inventory[1];
    if (item_id >= 0 && item_id < ITEM_COUNT && ITEM_TABLE[item_id].type == ITEM_TYPE_ARMOR) {
        armor_id = item_id;
        cout << "EQUIP_ARMOR|" << ITEM_TABLE[item_id].name << "|bonus=" << ITEM_TABLE[item_id].stat << endl;
    }

    // Attack twice with weapon
    for (int i = 0; i < 2; i++) {
        int weapon_bonus = 0;
        if (weapon_id >= 0 && weapon_id < ITEM_COUNT) {
            weapon_bonus = ITEM_TABLE[weapon_id].stat;
        }
        int total = base_dmg + weapon_bonus;
        cout << "ATTACK|base=" << base_dmg << "|weapon=" << weapon_bonus << "|total=" << total << endl;
    }

    // Unequip weapon
    weapon_id = ITEM_NONE;
    cout << "UNEQUIP_WEAPON" << endl;

    // Attack without weapon
    int weapon_bonus = 0;
    if (weapon_id >= 0 && weapon_id < ITEM_COUNT) {
        weapon_bonus = ITEM_TABLE[weapon_id].stat;
    }
    int total = base_dmg + weapon_bonus;
    cout << "ATTACK|base=" << base_dmg << "|weapon=" << weapon_bonus << "|total=" << total << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Weapon equipped", expectedOutput: "EQUIP_WEAPON|Iron Sword|bonus=3", isPattern: false },
      { id: "t2", description: "Armor equipped", expectedOutput: "EQUIP_ARMOR|Leather|bonus=2", isPattern: false },
      { id: "t3", description: "Attack with weapon bonus", expectedOutput: "ATTACK|base=5|weapon=3|total=8", isPattern: false },
      { id: "t4", description: "Attack without weapon", expectedOutput: "ATTACK|base=5|weapon=0|total=5", isPattern: false },
    ],
    hints: [
      "Check the item type before equipping: ITEM_TABLE[item_id].type == ITEM_TYPE_WEAPON for weapons.",
      "When weapon_id is ITEM_NONE (-1), the weapon bonus is 0. Check bounds before accessing ITEM_TABLE.",
      "Unequipping is just: weapon_id = ITEM_NONE. The item stays in inventory."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Equipment in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Equipment in the Game Loop

## Mental Model
Wire equipment slots into the game. WorldState gains weapon_id and armor_id. The player starts with Iron Sword equipped. Combat damage includes the weapon bonus. The HUD shows equipped items. The equip command ('e') equips the next unequipped item from inventory.

Pipeline per tick: clear events → input → move/equip → combat (with weapon bonus) → AI → renderWorld → renderHUD (with equipment).

## What Breaks Without This
Without equipment integration:
- Combat always uses base damage (5) — the Iron Sword in inventory is decorative
- The HUD shows inventory but not what is equipped
- The equip command does nothing

With equipment:
- Combat uses base_dmg + weapon_bonus — the sword matters
- The HUD shows WEAPON: Iron Sword and ARMOR: none
- The player can change combat effectiveness by equipping items

## The Fix: Equipment in WorldState and Combat

Add to WorldState:
\`\`\`cpp
int weapon_id;  // default ITEM_NONE
int armor_id;   // default ITEM_NONE
\`\`\`

In loadRoom, after setting inventory:
\`\`\`cpp
w.weapon_id = 0;  // start with Iron Sword equipped
w.armor_id = ITEM_NONE;
\`\`\`

In combat damage calculation:
\`\`\`cpp
int base = DAMAGE_TABLE[w.damage_id[0]].base_dmg;
int weapon_bonus = 0;
if (w.weapon_id >= 0 && w.weapon_id < ITEM_COUNT)
    weapon_bonus = ITEM_TABLE[w.weapon_id].stat;
int dmg = base + weapon_bonus;
\`\`\`

## Key Concepts
- weapon_id/armor_id in WorldState: equipment as state, not behavior
- Combat integration: damage = base + weapon bonus, resolved at attack time
- HUD integration: show equipped item names (or "none" for empty slots)
- Equip on load: player starts with a weapon equipped

## Performance Insight
One extra bounds check + one table lookup per combat action. The ITEM_TABLE is likely in L1 cache. Cost: under 3 nanoseconds per attack. No iteration, no search.

## Memory Insight
Two new ints in WorldState: 8 bytes. Everything else is reused (ITEM_TABLE is const data segment, inventory is existing array). Gate A: zero new allocations.

## Your Task
Add equipment slots to WorldState. Start with Iron Sword equipped. Combat should add weapon bonus to damage. HUD should show equipped weapon.

Expected output includes:
\`\`\`
COMBAT|src=0|target=1|dmg=8|hp=7
HUD|hp=30|turn=2|enemies=2
HUD_WEAPON|Iron Sword
INV|0|Iron Sword
INV|1|Potion
\`\`\`

## Beginner Trap
**Adding weapon bonus to DAMAGE_TABLE instead of resolving at attack time.** If you modify DAMAGE_TABLE[0].base_dmg when equipping, you change the table for ALL entities that share damage_id 0. The table is const — and even if it weren't, modifying shared data based on one entity's equipment is a design error. Resolve weapon bonus per-attack, not per-table.

## Elite Insight
Skyrim's damage formula: weapon base + weapon material + enchantment + skill + perks. Each component is a table lookup or a formula. Your formula (base + weapon_bonus) is the simplified version. The architecture is identical: damage is computed from multiple independent lookups, not a single hardcoded value.

## Mastery Check
Question: If the player equips a different weapon mid-combat, does the damage change immediately?
Answer: Yes — because damage is resolved at attack time from the current weapon_id. There is no cached damage value. Changing weapon_id takes effect on the next attack. This is the advantage of table lookup: always reads the current state.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
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

struct Command { int dx; int dy; bool attack; };
Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
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
    // TODO: Add weapon_id and armor_id
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
                // TODO: Set weapon_id=0 (Iron Sword equipped)
                // TODO: Set armor_id=ITEM_NONE
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

// TODO: Modify combat to add weapon bonus
void game_tick(WorldState& w, Command cmd){
    w.event_count=0;
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                // TODO: Add weapon bonus to dmg
                w.hp[i]-=dmg;
                cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){
                    w.alive[i]=false;
                    cout<<"KILL|id="<<i<<endl;
                }
                if(w.event_count<MAX_EVENTS){
                    CombatEvent& ev=w.event_log[w.event_count++];
                    ev.src=0; ev.target=i;
                    ev.dmg=dmg; ev.hp_after=w.hp[i];
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
    for(int i=0;i<w.entity_count;i++){ if(w.alive[i]) ac++; }
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
}

// TODO: Add weapon/armor display to renderHUD
void renderHUD(const WorldState& w){
    int ae=0;
    for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    // TODO: Print HUD_WEAPON|name (or HUD_WEAPON|none)
    // TODO: Print inventory items
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
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
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

struct Command { int dx; int dy; bool attack; };
Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
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
    int weapon_id;
    int armor_id;
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
                w.armor_id=ITEM_NONE;
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
                    cout<<"KILL|id="<<i<<endl;
                }
                if(w.event_count<MAX_EVENTS){
                    CombatEvent& ev=w.event_log[w.event_count++];
                    ev.src=0; ev.target=i;
                    ev.dmg=dmg; ev.hp_after=w.hp[i];
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
    for(int i=0;i<w.entity_count;i++){ if(w.alive[i]) ac++; }
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
}

void renderHUD(const WorldState& w){
    int ae=0;
    for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT)
        cout<<"HUD_WEAPON|"<<ITEM_TABLE[w.weapon_id].name<<endl;
    else
        cout<<"HUD_WEAPON|none"<<endl;
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
      { id: "g1", description: "Combat damage includes weapon bonus", expectedOutput: "COMBAT|src=0|target=1|dmg=8|hp=7", isPattern: false },
      { id: "g2", description: "HUD shows weapon", expectedOutput: "HUD_WEAPON|Iron Sword", isPattern: false },
      { id: "g3", description: "Inventory displayed", expectedOutput: "INV|0|Iron Sword", isPattern: false },
      { id: "g4", description: "Second attack with weapon", expectedOutput: "COMBAT|src=0|target=1|dmg=8|hp=-1", isPattern: false },
      { id: "g5", description: "Guard killed with weapon damage", expectedOutput: "KILL|id=1", isPattern: false },
    ],
    hints: [
      "Add int weapon_id and int armor_id to WorldState. Initialize weapon_id=0 in loadRoom's '@' branch.",
      "In game_tick combat, after calculating base dmg, add: if (w.weapon_id >= 0 && w.weapon_id < ITEM_COUNT) dmg += ITEM_TABLE[w.weapon_id].stat;",
      "In renderHUD, check weapon_id bounds and print HUD_WEAPON|name or HUD_WEAPON|none."
    ],
    estimatedMinutes: 12,
  },
};
