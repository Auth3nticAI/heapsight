import { Lesson } from "@/types/lesson";

export const lessonRPG41: Lesson = {
  id: "rpg-41-item-tables-parse",
  title: "Item Tables Parse",
  description: "Define items as rows in a const data table — the same pattern as DAMAGE_TABLE and BEHAVIOR_TABLE, now applied to inventory items.",
  order: 41,
  xpReward: 100,
  tier: "pro",
  concepts: ["item data table", "file-driven data", "struct-of-arrays for items", "const lookup"],
  part1: {
    title: "Concept: Items as Data Rows",
    type: "concept",
    instructions: `# Item Tables Parse

## Mental Model
An item is not a class with methods. An item is a row in a table. Each item has an ID (index), a name (for display), a type (weapon, armor, consumable), and type-specific stats. The inventory stores item IDs — integers, not objects. To display an item, look up its ID in the table. To use an item, read its type and stats from the table.

This is the same data-driven pattern as BEHAVIOR_TABLE (L34) and DAMAGE_TABLE (L36). Every entity attribute that varies by type belongs in a const table. Items are no exception.

## What Breaks Without This
Without an item table, you store items as strings or enums with embedded logic:
\`\`\`cpp
if (item == "sword") { damage += 3; }
else if (item == "shield") { armor += 2; }
else if (item == "potion") { hp += 10; }
\`\`\`

Three items, three branches. Fifty items, fifty branches. The logic is scattered across the codebase. Adding a new item means finding every switch/if-chain and adding a case. With a table, you add one row. The code reads the table. No branches.

## The Fix: ItemDef Struct and ITEM_TABLE

\`\`\`cpp
const int ITEM_NONE = -1;
const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;

struct ItemDef {
    int type;       // ITEM_TYPE_WEAPON, etc.
    int stat;       // damage bonus, armor bonus, or heal amount
    int value;      // gold value for shop (Lesson 44)
    char name[16];  // fixed-size name, no heap allocation
};

const int ITEM_COUNT = 5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,     3, 10, "Iron Sword"},
    {ITEM_TYPE_WEAPON,     5, 25, "Steel Sword"},
    {ITEM_TYPE_ARMOR,      2,  8, "Leather"},
    {ITEM_TYPE_ARMOR,      4, 20, "Chain Mail"},
    {ITEM_TYPE_CONSUMABLE, 10, 5, "Potion"},
};
\`\`\`

The inventory stores item IDs: \`inventory[0] = 2\` means the player has item 2 (Leather armor). To print it: \`ITEM_TABLE[2].name\`. To use it: read \`ITEM_TABLE[2].type\` and branch once.

## Key Concepts
- ItemDef: POD struct with type, stat, value, and name — no methods, no virtual
- ITEM_TABLE: const array of ItemDef — compile-time data, read-only segment
- Item ID: integer index into ITEM_TABLE — the inventory stores IDs, not items
- Fixed-size name: char[16] avoids std::string heap allocation
- Type constants: ITEM_TYPE_WEAPON = 0, etc. — named ints, not enums (for simplicity)

## Performance Insight
Item lookup is one array index: ITEM_TABLE[id]. Cost: one memory access, L1 cache hit. With 5 items at ~24 bytes each: 120 bytes total table. Even 100 items: 2,400 bytes — still fits in L1 cache. Item lookup is essentially free.

## Memory Insight
ITEM_TABLE is const — stored in the data segment, not the heap. ItemDef uses char[16] for names — fixed size, no allocation. The inventory stores int IDs — 4 bytes per slot. With INV_SIZE=5: 20 bytes of inventory. Gate A: zero heap allocations.

## Your Task
Define an ITEM_TABLE with 5 items. Look up each item by ID and print its details.

Expected output:
\`\`\`
ITEM|0|type=0|stat=3|value=10|name=Iron Sword
ITEM|1|type=0|stat=5|value=25|name=Steel Sword
ITEM|2|type=1|stat=2|value=8|name=Leather
ITEM|3|type=1|stat=4|value=20|name=Chain Mail
ITEM|4|type=2|stat=10|value=5|name=Potion
\`\`\`

## Beginner Trap
**Using std::string for item names.** std::string allocates heap memory for strings longer than ~15 characters (SSO limit varies by implementation). In a game loop that creates/destroys items, this causes heap allocations every frame. char[16] is fixed-size, stack-allocated, and never touches the heap.

## Elite Insight
Diablo 2 stores all item definitions in a text file (UniqueItems.txt) that is parsed at startup into a data table. The game code reads the table by ID. Modders edit the text file to add items — no code changes. Your ITEM_TABLE is a compile-time version of the same architecture. A production game would load this from a file at startup.

## Systems Thinking Connection
The Space Shooter path defines power-up types in a table. The Platformer path defines pickup types in a table. The Robotics path defines sensor models in a table. All four paths use the same pattern: entity attributes as rows in a const table. The item table is the RPG-specific instance.

## Skill Reinforcement
Lesson 34 introduced BEHAVIOR_TABLE. Lesson 36 introduced DAMAGE_TABLE. This lesson introduces ITEM_TABLE. Same pattern, third domain. Lesson 42 will read from ITEM_TABLE to equip items.

## Mastery Check
Question: Why char[16] instead of const char* for name?
Answer: const char* would point to a string literal, which works for compile-time data. But char[16] keeps the entire struct self-contained — no pointer chasing, better cache locality, and the struct can be memcpy'd without worrying about dangling pointers. For a data table that is never modified, both work. For a table that might be loaded from a file at runtime, char[16] is safer.`,
    starterCode: `#include <iostream>
using namespace std;

const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;

struct ItemDef {
    int type;
    int stat;
    int value;
    char name[16];
};

const int ITEM_COUNT = 5;
// TODO: Define ITEM_TABLE[ITEM_COUNT] with these items:
// 0: weapon, stat=3, value=10, "Iron Sword"
// 1: weapon, stat=5, value=25, "Steel Sword"
// 2: armor,  stat=2, value=8,  "Leather"
// 3: armor,  stat=4, value=20, "Chain Mail"
// 4: consumable, stat=10, value=5, "Potion"

int main() {
    // TODO: Loop through ITEM_TABLE and print each item
    // ITEM|id|type=T|stat=S|value=V|name=N

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;

struct ItemDef {
    int type;
    int stat;
    int value;
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

int main() {
    for (int i = 0; i < ITEM_COUNT; i++) {
        const ItemDef& item = ITEM_TABLE[i];
        cout << "ITEM|" << i << "|type=" << item.type
             << "|stat=" << item.stat << "|value=" << item.value
             << "|name=" << item.name << endl;
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "First weapon listed", expectedOutput: "ITEM|0|type=0|stat=3|value=10|name=Iron Sword", isPattern: false },
      { id: "t2", description: "Armor listed", expectedOutput: "ITEM|2|type=1|stat=2|value=8|name=Leather", isPattern: false },
      { id: "t3", description: "Consumable listed", expectedOutput: "ITEM|4|type=2|stat=10|value=5|name=Potion", isPattern: false },
    ],
    hints: [
      "Initialize each ItemDef with curly braces: {ITEM_TYPE_WEAPON, 3, 10, \"Iron Sword\"}.",
      "The name field is char[16] — string literals up to 15 characters are automatically copied into the array.",
      "Loop from 0 to ITEM_COUNT-1 and print each field using ITEM_TABLE[i].type, .stat, .value, .name."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Item Table in the Game",
    type: "game_builder",
    instructions: `# Build: Item Table in the Game

## Mental Model
Wire ITEM_TABLE into the game. The existing inventory array already stores integers — now those integers are item IDs that index into ITEM_TABLE. The player starts with an Iron Sword (ID 0) and a Potion (ID 4). The HUD prints the inventory by looking up each item ID in the table.

The inventory is not a new system — it is the existing int inventory[] array from WorldState, now given meaning through the item table. The data was always there; the table gives it a name.

## What Breaks Without This
Without the item table, inventory[0] = 0 is meaningless — is that "no item" or "item 0"? With the table, inventory[0] = 0 means "Iron Sword" (ITEM_TABLE[0]). The table converts raw integers into readable game content.

## The Fix: Initialize Inventory in loadRoom

After spawning the player:
\`\`\`cpp
w.inventory[0] = 0;  // Iron Sword
w.inventory[1] = 4;  // Potion
w.inv_count = 2;
\`\`\`

In renderHUD, add inventory display:
\`\`\`cpp
for (int i = 0; i < w.inv_count; i++) {
    int item_id = w.inventory[i];
    cout << "INV|" << i << "|" << ITEM_TABLE[item_id].name << endl;
}
\`\`\`

## Key Concepts
- Item ID semantics: inventory stores indices into ITEM_TABLE
- Inventory initialization: player starts with specific items set in loadRoom
- Inventory display: HUD reads item IDs and looks up names from the table
- ITEM_NONE sentinel: -1 means "empty slot" — check before table lookup

## Performance Insight
Inventory display: inv_count iterations (typically 2-5), one table lookup each. Cost: under 10 nanoseconds. The table is already in L1 cache from any previous access.

## Memory Insight
ITEM_TABLE is const data segment. The inventory array is already in WorldState (5 ints = 20 bytes). inv_count is already there. No new memory. Gate A: fully compliant.

## Your Task
Add ITEM_TABLE to the game. Initialize player inventory with Iron Sword and Potion. Display inventory in renderHUD. Run a few ticks and verify the inventory appears.

Expected output includes:
\`\`\`
INV|0|Iron Sword
INV|1|Potion
HUD|hp=30|turn=1|enemies=2
\`\`\`

## Beginner Trap
**Looking up ITEM_TABLE[-1] for empty slots.** If inventory[i] is -1 (ITEM_NONE), you must NOT index into ITEM_TABLE. Always check: \`if (item_id >= 0 && item_id < ITEM_COUNT)\` before lookup. Array index -1 is undefined behavior.

## Elite Insight
World of Warcraft's inventory UI reads item data from a client-side item cache table. The server sends item IDs, the client looks up the table for display. Your inventory display follows the same client-side pattern: the game state holds IDs, the render layer resolves names.

## Mastery Check
Question: What happens when you add a 6th item to ITEM_TABLE?
Answer: Increase ITEM_COUNT to 6 and add the row. All existing code works — inventory can now hold items with ID 0-5. No code changes outside the table definition. This is the power of data-driven design.`,
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

struct ItemDef {
    int type; int stat; int value;
    char name[16];
};

const int ITEM_COUNT=5;
// TODO: Define ITEM_TABLE[ITEM_COUNT]

struct Command { int dx; int dy; bool attack; };

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    return cmd;
}

struct CombatEvent {
    int src; int target; int dmg; int hp_after; bool killed;
};

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
};

struct RoomError { bool ok; int code; };

RoomError validateRoom(const char* data, int dw, int dh){
    RoomError err={true,0};
    if(data==nullptr){err.ok=false;err.code=1;return err;}
    int expected=dw*dh; int len=0;
    while(data[len]!='\0') len++;
    if(len<expected){err.ok=false;err.code=2;return err;}
    bool has_player=false; int ec=0;
    for(int i=0;i<expected;i++){
        if(data[i]=='@'){has_player=true;ec++;}
        else if(data[i]=='E'||data[i]=='G'){ec++;}
    }
    if(!has_player){err.ok=false;err.code=3;return err;}
    if(ec>MAX_E){err.ok=false;err.code=4;return err;}
    return err;
}

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
                // TODO: Give player starting items
                // inventory[0] = 0 (Iron Sword)
                // inventory[1] = 4 (Potion)
                // inv_count = 2
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
                w.hp[i]-=dmg;
                if(w.hp[i]<=0) w.alive[i]=false;
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

// TODO: Add inventory display to renderHUD
void renderHUD(const WorldState& w){
    int alive_enemies=0;
    for(int i=1;i<w.entity_count;i++){
        if(w.alive[i]) alive_enemies++;
    }
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn
        <<"|enemies="<<alive_enemies<<endl;
    // TODO: Print inventory items
    // For each slot 0..inv_count-1:
    //   if inventory[i] >= 0 and < ITEM_COUNT:
    //     INV|i|ITEM_TABLE[inventory[i]].name
}

int main(){
    WorldState w;
    RoomError err=validateRoom(ROOM_DATA,W,H);
    if(!err.ok) return 1;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','d','d'};
    for(int i=0;i<3;i++){
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

struct ItemDef {
    int type; int stat; int value;
    char name[16];
};

const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,     3, 10, "Iron Sword"},
    {ITEM_TYPE_WEAPON,     5, 25, "Steel Sword"},
    {ITEM_TYPE_ARMOR,      2,  8, "Leather"},
    {ITEM_TYPE_ARMOR,      4, 20, "Chain Mail"},
    {ITEM_TYPE_CONSUMABLE, 10, 5, "Potion"},
};

struct Command { int dx; int dy; bool attack; };

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    return cmd;
}

struct CombatEvent {
    int src; int target; int dmg; int hp_after; bool killed;
};

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
};

struct RoomError { bool ok; int code; };

RoomError validateRoom(const char* data, int dw, int dh){
    RoomError err={true,0};
    if(data==nullptr){err.ok=false;err.code=1;return err;}
    int expected=dw*dh; int len=0;
    while(data[len]!='\0') len++;
    if(len<expected){err.ok=false;err.code=2;return err;}
    bool has_player=false; int ec=0;
    for(int i=0;i<expected;i++){
        if(data[i]=='@'){has_player=true;ec++;}
        else if(data[i]=='E'||data[i]=='G'){ec++;}
    }
    if(!has_player){err.ok=false;err.code=3;return err;}
    if(ec>MAX_E){err.ok=false;err.code=4;return err;}
    return err;
}

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
                w.inventory[0]=0;
                w.inventory[1]=4;
                w.inv_count=2;
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
                w.hp[i]-=dmg;
                if(w.hp[i]<=0) w.alive[i]=false;
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
    int alive_enemies=0;
    for(int i=1;i<w.entity_count;i++){
        if(w.alive[i]) alive_enemies++;
    }
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn
        <<"|enemies="<<alive_enemies<<endl;
    for(int i=0;i<w.inv_count;i++){
        int item_id=w.inventory[i];
        if(item_id>=0&&item_id<ITEM_COUNT){
            cout<<"INV|"<<i<<"|"<<ITEM_TABLE[item_id].name<<endl;
        }
    }
}

int main(){
    WorldState w;
    RoomError err=validateRoom(ROOM_DATA,W,H);
    if(!err.ok) return 1;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','d','d'};
    for(int i=0;i<3;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
        renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Iron Sword in inventory", expectedOutput: "INV|0|Iron Sword", isPattern: false },
      { id: "g2", description: "Potion in inventory", expectedOutput: "INV|1|Potion", isPattern: false },
      { id: "g3", description: "HUD shows correct state", expectedOutput: "HUD|hp=30|turn=1|enemies=2", isPattern: false },
      { id: "g4", description: "Room loads correctly", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
    ],
    hints: [
      "Define ITEM_TABLE as: const ItemDef ITEM_TABLE[ITEM_COUNT] = { {0, 3, 10, \"Iron Sword\"}, ... };",
      "In loadRoom's '@' branch, set w.inventory[0]=0, w.inventory[1]=4, w.inv_count=2.",
      "In renderHUD, loop from 0 to w.inv_count-1. Check item_id >= 0 before looking up ITEM_TABLE."
    ],
    estimatedMinutes: 12,
  },
};
