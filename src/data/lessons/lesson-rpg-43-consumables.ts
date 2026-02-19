import { Lesson } from "@/types/lesson";

export const lessonRPG43: Lesson = {
  id: "rpg-43-consumables",
  title: "Consumables",
  description: "Use a potion from inventory as a command — item consumed, HP restored, inventory slot cleared. Item use follows the same command pipeline as movement and combat.",
  order: 43,
  xpReward: 100,
  tier: "pro",
  concepts: ["item use as command", "consumable items", "inventory slot removal", "command pipeline"],
  part1: {
    title: "Concept: Item Use as Command",
    type: "concept",
    instructions: `# Consumables

## Mental Model
Using a consumable item is a command, just like moving or attacking. The player presses a key, the system creates a "use item" command, the tick pipeline processes it. The item's effect is looked up from ITEM_TABLE: a Potion (type=CONSUMABLE, stat=10) adds 10 HP. After use, the item is removed from inventory by shifting remaining items down and decrementing inv_count.

This is the command pipeline principle: every player action becomes a Command struct, processed in the same tick. Movement, combat, and item use all flow through the same pipeline. No special cases, no separate systems.

## What Breaks Without This
Without consumables, the Potion in inventory is decorative. The player cannot heal. Without removing the item after use, potions are infinite — breaking the economy and making the game trivially easy.

Without treating item use as a command, you end up with a separate "use item" code path that runs outside the tick pipeline. This breaks determinism: the item is used at an unpredictable time relative to other actions. The command pipeline keeps everything ordered.

## The Fix: Use Item in the Tick Pipeline

Extend the Command struct or add a new input key:
\`\`\`cpp
// 'u' = use first consumable in inventory
\`\`\`

In game_tick, after movement, before combat:
\`\`\`cpp
if (cmd_is_use_item) {
    for (int i = 0; i < w.inv_count; i++) {
        int item_id = w.inventory[i];
        if (item_id < 0 || item_id >= ITEM_COUNT) continue;
        if (ITEM_TABLE[item_id].type == ITEM_TYPE_CONSUMABLE) {
            int heal = ITEM_TABLE[item_id].stat;
            w.hp[0] += heal;
            if (w.hp[0] > 30) w.hp[0] = 30;  // cap at max HP
            cout << "USE|" << ITEM_TABLE[item_id].name
                 << "|heal=" << heal << "|hp=" << w.hp[0] << endl;
            // Remove from inventory: shift items down
            for (int j = i; j < w.inv_count - 1; j++) {
                w.inventory[j] = w.inventory[j + 1];
            }
            w.inventory[w.inv_count - 1] = ITEM_NONE;
            w.inv_count--;
            break;  // one item per tick
        }
    }
}
\`\`\`

## Key Concepts
- Consumable: item with type ITEM_TYPE_CONSUMABLE — used once, then removed
- Item effect: read from ITEM_TABLE[id].stat — heal amount for potions
- Inventory removal: shift remaining items left, decrement inv_count
- HP capping: heal does not exceed max HP (30)
- One use per tick: break after first consumable found and used

## Performance Insight
Finding a consumable: linear scan of inv_count items (max 5). Removal: shift at most 4 items. Total: under 20 operations. Cost: negligible.

## Memory Insight
No new allocations. Inventory is existing int[INV_SIZE] in WorldState. Removal is an in-place shift — no temporary buffers. Gate A: fully compliant.

## Your Task
Implement item use: find the first consumable in inventory, apply its heal, remove it, and print the result. Start with hp=20 and a Potion (heal 10, cap at 30).

Expected output:
\`\`\`
BEFORE|hp=20|inv_count=3
USE|Potion|heal=10|hp=30
AFTER|hp=30|inv_count=2
INV|0|Iron Sword
INV|1|Leather
\`\`\`

## Beginner Trap
**Forgetting to shift inventory after removal.** If you just set inventory[i] = ITEM_NONE without shifting, you leave a hole. The next time you scan inventory, you skip the hole and might not find items after it. Shifting keeps the inventory packed.

## Elite Insight
The Witcher 3 processes potion use as a queued action: press the potion hotkey → action enters the command queue → game tick processes it → potion animation plays → HP restored → potion removed from inventory. Your implementation follows the same pipeline at a simpler scale: input → command → process → effect → remove.

## Systems Thinking Connection
The Space Shooter path uses power-up pickups that are consumed on contact. The Platformer path uses one-time keys that open doors and disappear. The Robotics path uses calibration tokens that are consumed when applied. All four paths implement "use and remove" items through the command pipeline.

## Skill Reinforcement
Lesson 41 defined items. Lesson 42 equipped them. This lesson consumes them. Lesson 44 will add gold to the economy, and Lesson 45 will prove the full inventory loop works.

## Mastery Check
Question: Why cap HP at 30 instead of letting it exceed the maximum?
Answer: Because uncapped healing breaks game balance — the player could drink 10 potions and have 130 HP, trivializing all combat. The cap enforces a design constraint: max HP is a meaningful limit. Potion value comes from restoring lost HP, not exceeding the cap.`,
    starterCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;
const int INV_SIZE = 5;
const int MAX_HP = 30;

struct ItemDef { int type; int stat; int value; char name[16]; };
const int ITEM_COUNT = 5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

int main() {
    int inventory[INV_SIZE] = {0, 4, 2, -1, -1};  // sword, potion, leather
    int inv_count = 3;
    int hp = 20;

    cout << "BEFORE|hp=" << hp << "|inv_count=" << inv_count << endl;

    // TODO: Find first consumable in inventory
    // If found:
    //   1. Read heal amount from ITEM_TABLE[item_id].stat
    //   2. Add to hp, cap at MAX_HP
    //   3. Print: USE|name|heal=H|hp=HP
    //   4. Remove item: shift remaining items left
    //   5. Set last slot to ITEM_NONE, decrement inv_count

    cout << "AFTER|hp=" << hp << "|inv_count=" << inv_count << endl;

    // Print remaining inventory
    for (int i = 0; i < inv_count; i++) {
        int id = inventory[i];
        if (id >= 0 && id < ITEM_COUNT)
            cout << "INV|" << i << "|" << ITEM_TABLE[id].name << endl;
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;
const int INV_SIZE = 5;
const int MAX_HP = 30;

struct ItemDef { int type; int stat; int value; char name[16]; };
const int ITEM_COUNT = 5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

int main() {
    int inventory[INV_SIZE] = {0, 4, 2, -1, -1};
    int inv_count = 3;
    int hp = 20;

    cout << "BEFORE|hp=" << hp << "|inv_count=" << inv_count << endl;

    for (int i = 0; i < inv_count; i++) {
        int item_id = inventory[i];
        if (item_id < 0 || item_id >= ITEM_COUNT) continue;
        if (ITEM_TABLE[item_id].type == ITEM_TYPE_CONSUMABLE) {
            int heal = ITEM_TABLE[item_id].stat;
            hp += heal;
            if (hp > MAX_HP) hp = MAX_HP;
            cout << "USE|" << ITEM_TABLE[item_id].name
                 << "|heal=" << heal << "|hp=" << hp << endl;
            for (int j = i; j < inv_count - 1; j++) {
                inventory[j] = inventory[j + 1];
            }
            inventory[inv_count - 1] = ITEM_NONE;
            inv_count--;
            break;
        }
    }

    cout << "AFTER|hp=" << hp << "|inv_count=" << inv_count << endl;

    for (int i = 0; i < inv_count; i++) {
        int id = inventory[i];
        if (id >= 0 && id < ITEM_COUNT)
            cout << "INV|" << i << "|" << ITEM_TABLE[id].name << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Before state correct", expectedOutput: "BEFORE|hp=20|inv_count=3", isPattern: false },
      { id: "t2", description: "Potion used and heals", expectedOutput: "USE|Potion|heal=10|hp=30", isPattern: false },
      { id: "t3", description: "Inventory count decreased", expectedOutput: "AFTER|hp=30|inv_count=2", isPattern: false },
      { id: "t4", description: "Remaining inventory correct", expectedOutput: "INV|1|Leather", isPattern: false },
    ],
    hints: [
      "Scan inventory with a for loop. Check ITEM_TABLE[inventory[i]].type == ITEM_TYPE_CONSUMABLE.",
      "After applying the heal, shift items: for (int j = i; j < inv_count - 1; j++) inventory[j] = inventory[j+1];",
      "Don't forget to cap HP: if (hp > MAX_HP) hp = MAX_HP; and break after using one consumable."
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Consumable Use in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Consumable Use in the Game Loop

## Mental Model
Wire consumable use into the game pipeline. The 'u' key creates a "use item" action. game_tick processes it: find first consumable, apply effect, remove from inventory. The HUD shows updated HP and inventory. The event log records item use alongside combat events.

Pipeline per tick: clear events → input → move → use item → combat → AI → render → HUD.

Item use sits between movement and combat: the player can heal before fighting, but not simultaneously move and use an item (different keys).

## What Breaks Without This
Without consumable processing in game_tick, pressing 'u' does nothing. The Potion sits in inventory, mocking the player as they slowly die to the chaser. With this fix, the player can heal mid-dungeon, creating tactical decisions: attack or heal?

## The Fix: Add 'u' to captureInput and Process in game_tick

Extend Command:
\`\`\`cpp
struct Command { int dx; int dy; bool attack; bool use_item; };
\`\`\`

In captureInput:
\`\`\`cpp
else if (c == 'u') cmd.use_item = true;
\`\`\`

In game_tick, after movement, before combat:
\`\`\`cpp
if (cmd.use_item) {
    // find and use first consumable (same as Part 1)
}
\`\`\`

## Key Concepts
- Extended Command struct: use_item field for consumable action
- Pipeline placement: use item after movement, before combat
- One action per tick: move OR attack OR use item (keys are mutually exclusive)
- Inventory integrity: after removal, remaining items shift left, inv_count decreases

## Performance Insight
Adding use_item to Command: one bool (1 byte, padded to 4). Checking cmd.use_item: one comparison per tick. If true, scan inventory: up to 5 iterations. Total: negligible.

## Memory Insight
Command grows by 1 bool (padded to 4 bytes). No new heap allocations. Inventory removal is an in-place shift. Gate A: fully compliant.

## Your Task
Add 'u' command support. The player takes damage from the chaser, then uses a potion to heal. Verify HP recovery and inventory change.

Expected output includes:
\`\`\`
USE|Potion|heal=10|hp=30
HUD|hp=30|turn=3|enemies=2
INV|0|Iron Sword
\`\`\`

Note: After using the potion, inv_count drops from 2 to 1 (only Iron Sword remains).

## Beginner Trap
**Processing item use AND combat in the same tick.** If the player presses 'u', they should NOT also attack. The command system handles this naturally: 'u' sets use_item=true but attack=false. If you accidentally set both, the player heals and attacks in one turn — overpowered. One action per tick.

## Elite Insight
Pokémon processes item use as a turn action: if you use a potion, you do NOT also attack. Your implementation follows the same rule. The turn economy (one action per turn) is a core design constraint that creates meaningful tactical choices: heal now or attack and risk dying?

## Mastery Check
Question: What happens if the player presses 'u' with no consumables in inventory?
Answer: Nothing — the for loop scans inventory, finds no items with type ITEM_TYPE_CONSUMABLE, and the tick continues without effect. The player wastes their turn. This is correct behavior: attempting an impossible action costs the turn.`,
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

// TODO: Add use_item field to Command
struct Command { int dx; int dy; bool attack; };

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    // TODO: else if(c=='u') cmd.use_item=true;
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
};

const char ROOM_DATA[] =
    "##########"
    "#@.......#"
    "#........#"
    "#........#"
    "#........#"
    "#........#"
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
                w.hp[id]=20; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=0;
                w.grid[y][x]='.';
                w.inventory[0]=0; w.inventory[1]=4;
                w.inv_count=2;
                w.weapon_id=0;
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|entities="<<w.entity_count<<endl;
}

// TODO: Add item use processing to game_tick
void game_tick(WorldState& w, Command cmd){
    w.event_count=0;
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    // TODO: if(cmd.use_item) { find consumable, apply, remove }
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT)
                    dmg+=ITEM_TABLE[w.weapon_id].stat;
                w.hp[i]-=dmg;
                if(w.hp[i]<=0) w.alive[i]=false;
                if(w.event_count<MAX_EVENTS){
                    CombatEvent& ev=w.event_log[w.event_count++];
                    ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];
                    ev.killed=(w.hp[i]<=0);
                }
                break;
            }
        }
    }
}

void renderHUD(const WorldState& w){
    int ae=0;
    for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    for(int i=0;i<w.inv_count;i++){
        int id=w.inventory[i];
        if(id>=0&&id<ITEM_COUNT)
            cout<<"INV|"<<i<<"|"<<ITEM_TABLE[id].name<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    // Simulate: move right, move right, use potion
    char inputs[]={'d','d','u'};
    for(int i=0;i<3;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
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
};

const char ROOM_DATA[] =
    "##########"
    "#@.......#"
    "#........#"
    "#........#"
    "#........#"
    "#........#"
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
                w.hp[id]=20; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=0;
                w.grid[y][x]='.';
                w.inventory[0]=0; w.inventory[1]=4;
                w.inv_count=2;
                w.weapon_id=0;
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|entities="<<w.entity_count<<endl;
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
                cout<<"USE|"<<ITEM_TABLE[item_id].name
                    <<"|heal="<<heal<<"|hp="<<w.hp[0]<<endl;
                for(int j=i;j<w.inv_count-1;j++){
                    w.inventory[j]=w.inventory[j+1];
                }
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
                if(w.hp[i]<=0) w.alive[i]=false;
                if(w.event_count<MAX_EVENTS){
                    CombatEvent& ev=w.event_log[w.event_count++];
                    ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];
                    ev.killed=(w.hp[i]<=0);
                }
                break;
            }
        }
    }
}

void renderHUD(const WorldState& w){
    int ae=0;
    for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    for(int i=0;i<w.inv_count;i++){
        int id=w.inventory[i];
        if(id>=0&&id<ITEM_COUNT)
            cout<<"INV|"<<i<<"|"<<ITEM_TABLE[id].name<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','d','u'};
    for(int i=0;i<3;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Initial HP shown", expectedOutput: "HUD|hp=20|turn=1|enemies=0", isPattern: false },
      { id: "g2", description: "Potion heals player", expectedOutput: "USE|Potion|heal=10|hp=30", isPattern: false },
      { id: "g3", description: "HP restored in HUD", expectedOutput: "HUD|hp=30|turn=3|enemies=0", isPattern: false },
      { id: "g4", description: "Potion removed from inventory", expectedOutput: "INV|0|Iron Sword", isPattern: false },
    ],
    hints: [
      "Add bool use_item to Command struct. Initialize it to false in captureInput. Set true for 'u'.",
      "Process use_item in game_tick after movement but before combat. Find the first ITEM_TYPE_CONSUMABLE.",
      "After using the item, shift inventory left and decrement inv_count. Don't forget to break after one use."
    ],
    estimatedMinutes: 12,
  },
};
