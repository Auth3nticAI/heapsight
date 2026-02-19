import { Lesson } from "@/types/lesson";

export const lessonRPG47: Lesson = {
  id: "rpg-47-shop-buy-command",
  title: "Shop Buy Command",
  description: "Buying an item is a transaction: check gold, check inventory space, deduct gold, add item. The buy command runs only in SHOPPING mode.",
  order: 47,
  xpReward: 100,
  tier: "pro",
  concepts: ["transaction as command", "precondition checks", "atomic operation", "shop interaction"],
  part1: {
    title: "Concept: Transaction as Command",
    type: "concept",
    instructions: `# Shop Buy Command

## Mental Model
Buying an item is a transaction with preconditions:
1. Player must be in SHOPPING mode
2. Player must have enough gold (gold >= item.value)
3. Player must have inventory space (inv_count < INV_SIZE)

If all preconditions pass, the transaction executes atomically:
1. Deduct gold: \`w.gold -= ITEM_TABLE[item_id].value\`
2. Add item: \`w.inventory[w.inv_count++] = item_id\`
3. Print confirmation

If any precondition fails, nothing changes. This is the **all-or-nothing** principle: either the entire transaction succeeds, or nothing happens. No partial state.

## What Breaks Without This
Without precondition checks:
- Buying with insufficient gold makes gold negative — the economy breaks
- Buying with a full inventory writes past the array — buffer overflow
- Buying outside shop mode means the player can buy during combat

Without atomic execution:
- Deducting gold but failing to add the item means the player loses gold for nothing
- Adding the item but failing to deduct gold means free items

## The Fix: Buy Function with Checks

\`\`\`cpp
bool tryBuyItem(WorldState& w, int item_id) {
    if (item_id < 0 || item_id >= ITEM_COUNT) return false;
    if (w.gold < ITEM_TABLE[item_id].value) return false;
    if (w.inv_count >= INV_SIZE) return false;
    w.gold -= ITEM_TABLE[item_id].value;
    w.inventory[w.inv_count++] = item_id;
    return true;
}
\`\`\`

## Key Concepts
- Precondition validation: check before modifying state
- Atomic transaction: all changes happen together or not at all
- Return value: bool indicates success/failure for the caller
- Bounds checking: item_id in range, gold sufficient, inventory not full

## Performance Insight
Three comparisons + two assignments = 5 operations per buy. Cost: under 3 nanoseconds. The transaction is O(1) — no loops, no searches.

## Memory Insight
No new memory. The item is added to the existing inventory array. Gold is decremented in place. Gate A: fully compliant.

## Your Task
Implement tryBuyItem. Test with 3 scenarios: successful buy, insufficient gold, and full inventory.

Expected output:
\`\`\`
BUY|Potion|cost=5|gold=45|ok
BUY|Steel Sword|cost=25|gold=20|ok
BUY|Chain Mail|cost=20|gold=0|ok
BUY|Potion|cost=5|fail_gold
\`\`\`

## Beginner Trap
**Deducting gold before checking inventory space.** If gold is deducted but the inventory is full, the player loses gold without receiving the item. Always check ALL preconditions before modifying ANY state.

## Elite Insight
Database transactions follow ACID properties: Atomic (all or nothing), Consistent (valid state before and after), Isolated (no interference), Durable (persisted). Your tryBuyItem is Atomic and Consistent. Isolation comes from turn-based processing. Durability comes from the save system (Lesson 61).

## Systems Thinking Connection
The Space Shooter path processes power-up purchases between waves. The Platformer path processes shop transactions at checkpoints. The Robotics path processes sensor upgrades in the config menu. All four paths implement buy-as-transaction with precondition checks.

## Skill Reinforcement
Lesson 46 added shop mode. This lesson adds the buy transaction. Lesson 48 will add loot tables for enemy item drops.

## Mastery Check
Question: Should tryBuyItem print the result, or should the caller print it?
Answer: The caller should print. tryBuyItem returns bool — the caller decides what to display. This separates logic (buy) from presentation (print). The buy function can be reused in different contexts (shop UI, auto-buy, quest reward) without changing its behavior.`,
    starterCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int INV_SIZE = 5;

const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;
struct ItemDef { int type; int stat; int value; char name[16]; };
const int ITEM_COUNT = 5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

// TODO: Write tryBuyItem(gold, inventory, inv_count, item_id) -> bool
// Check: item_id in range, gold >= cost, inv_count < INV_SIZE
// If ok: deduct gold, add to inventory, return true
// If fail: return false, state unchanged

int main() {
    int gold = 50;
    int inventory[INV_SIZE] = {0, -1, -1, -1, -1};
    int inv_count = 1;

    // Buy Potion (id=4, cost=5)
    // Buy Steel Sword (id=1, cost=25)
    // Buy Chain Mail (id=3, cost=20)
    // Try to buy another Potion (should fail: gold=0)

    // TODO: For each buy attempt:
    // If success: BUY|name|cost=C|gold=G|ok
    // If fail: BUY|name|cost=C|fail_gold or fail_full

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int INV_SIZE = 5;

const int ITEM_TYPE_WEAPON = 0;
const int ITEM_TYPE_ARMOR = 1;
const int ITEM_TYPE_CONSUMABLE = 2;
struct ItemDef { int type; int stat; int value; char name[16]; };
const int ITEM_COUNT = 5;
const ItemDef ITEM_TABLE[ITEM_COUNT] = {
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

bool tryBuyItem(int& gold, int inventory[], int& inv_count, int item_id) {
    if (item_id < 0 || item_id >= ITEM_COUNT) return false;
    if (gold < ITEM_TABLE[item_id].value) return false;
    if (inv_count >= INV_SIZE) return false;
    gold -= ITEM_TABLE[item_id].value;
    inventory[inv_count++] = item_id;
    return true;
}

int main() {
    int gold = 50;
    int inventory[INV_SIZE] = {0, -1, -1, -1, -1};
    int inv_count = 1;

    int buys[] = {4, 1, 3, 4};
    for (int b = 0; b < 4; b++) {
        int id = buys[b];
        bool ok = tryBuyItem(gold, inventory, inv_count, id);
        if (ok) {
            cout << "BUY|" << ITEM_TABLE[id].name << "|cost=" << ITEM_TABLE[id].value
                 << "|gold=" << gold << "|ok" << endl;
        } else {
            cout << "BUY|" << ITEM_TABLE[id].name << "|cost=" << ITEM_TABLE[id].value;
            if (gold < ITEM_TABLE[id].value) cout << "|fail_gold" << endl;
            else cout << "|fail_full" << endl;
        }
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Potion bought", expectedOutput: "BUY|Potion|cost=5|gold=45|ok", isPattern: false },
      { id: "t2", description: "Steel Sword bought", expectedOutput: "BUY|Steel Sword|cost=25|gold=20|ok", isPattern: false },
      { id: "t3", description: "Chain Mail bought", expectedOutput: "BUY|Chain Mail|cost=20|gold=0|ok", isPattern: false },
      { id: "t4", description: "Insufficient gold rejected", expectedOutput: "BUY|Potion|cost=5|fail_gold", isPattern: false },
    ],
    hints: [
      "Check all 3 preconditions before any state change: item_id valid, gold sufficient, inventory has space.",
      "Deduct gold with gold -= ITEM_TABLE[item_id].value. Add item with inventory[inv_count++] = item_id.",
      "Return false without modifying state if any check fails. The caller decides what to print."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Shop Buy in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Shop Buy in the Game Loop

## Mental Model
Wire the buy command into the game. In SHOPPING mode, number keys '1'-'5' select an item to buy. tryBuyItem checks preconditions and executes the transaction. The shop re-renders after each buy to show updated gold and inventory.

Pipeline in SHOPPING mode: input → buy attempt → re-render shop.

## What Breaks Without This
Without buy integration, the shop is display-only. The player can browse but never purchase. Gold is earned but never spent. The economy has no sink — gold accumulates forever.

## The Fix: Buy in SHOPPING Mode

In game_tick, SHOPPING branch:
\`\`\`cpp
if (w.mode == MODE_SHOPPING) {
    if (cmd.close_shop) {
        w.mode = MODE_PLAYING;
        cout << "SHOP|close" << endl;
    } else if (cmd.buy_id >= 0) {
        bool ok = tryBuyItem(w, cmd.buy_id);
        if (ok) cout << "BUY|" << ITEM_TABLE[cmd.buy_id].name << "|ok" << endl;
        else cout << "BUY|fail" << endl;
    }
}
\`\`\`

Add buy_id to Command (int, -1 = no buy):
\`\`\`cpp
// '1' -> buy_id=0, '2' -> buy_id=1, etc.
\`\`\`

## Key Concepts
- Buy command: number key maps to item_id in SHOPPING mode
- Transaction in pipeline: buy runs in the SHOPPING branch of game_tick
- Re-render after buy: shop display updates to show new gold balance
- No turn increment: buying does not advance the game turn

## Performance Insight
tryBuyItem: 3 checks + 2 writes = 5 operations. Rendering the shop after buy: iterate ITEM_COUNT items. Total: under 50 operations per buy.

## Memory Insight
buy_id adds one int to Command (4 bytes). No other memory changes. Gate A: fully compliant.

## Your Task
Add buy_id to Command. Implement buying in SHOPPING mode. The player has 50 gold, opens shop, buys a Potion (5g) and Chain Mail (20g), then closes shop.

Expected output includes:
\`\`\`
SHOP|open
SHOP_HEADER|gold=50
BUY|Potion|cost=5|gold=45|ok
SHOP_HEADER|gold=45
BUY|Chain Mail|cost=20|gold=25|ok
SHOP_HEADER|gold=25
SHOP|close
\`\`\`

## Beginner Trap
**Advancing the turn counter on buy.** Buying is instant — it does not consume a game turn. The world remains frozen in SHOPPING mode. Only PLAYING mode ticks advance the turn counter.

## Elite Insight
Shovel Knight's shop lets you buy items instantly with no turn cost. The game world is frozen. You browse, buy, and leave. Your shop follows the same model: atomic purchases in a frozen world.

## Mastery Check
Question: Can the player buy the same item multiple times?
Answer: Yes — if they have gold and inventory space. Buying Potion twice gives two Potions in inventory. Each occupies a slot. The inventory stores item IDs, and duplicate IDs are allowed. This is intentional: stacking potions is a common RPG feature.`,
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

// TODO: Add buy_id (int, -1=none) to Command
struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true;
    else if(c=='q') cmd.close_shop=true;
    // TODO: '1'-'5' -> buy_id = 0-4
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

// TODO: Write tryBuyItem(WorldState& w, int item_id) -> bool

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

// TODO: Add buy logic to SHOPPING branch
void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){w.mode=MODE_SHOPPING;cout<<"SHOP|open"<<endl;return;}
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.attack){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){
                    int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT) dmg+=ITEM_TABLE[w.weapon_id].stat;
                    w.hp[i]-=dmg;
                    if(w.hp[i]<=0){w.alive[i]=false;
                        int bg=GOLD_TABLE[w.damage_id[i]].base;int bn=0;
                        if(GOLD_TABLE[w.damage_id[i]].bonus_range>0) bn=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                        w.gold+=bg+bn;}
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
        // TODO: Check buy_id and call tryBuyItem
    }
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    cout<<"HUD_GOLD|"<<w.gold<<endl;
}

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++)
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
}

const char ROOM_DATA[]=
    "##########""#@.G.....#""#........#""#........#""#........#"
    "#....E...#""#........#""#........#""#........#""##########";

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Move, open shop, buy Potion, buy Chain Mail, close shop, move
    char inputs[]={'d','b','5','4','q','d'};
    for(int i=0;i<6;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING){renderHUD(w);}
        else if(w.mode==MODE_SHOPPING){renderShop(w);}
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
    "##########""#@.G.....#""#........#""#........#""#........#"
    "#....E...#""#........#""#........#""#........#""##########";

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
                        w.gold+=bg+bn;cout<<"KILL|id="<<i<<endl;}
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
}

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++)
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    char inputs[]={'d','b','5','4','q','d'};
    for(int i=0;i<6;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING){renderHUD(w);}
        else if(w.mode==MODE_SHOPPING){renderShop(w);}
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Shop opens", expectedOutput: "SHOP|open", isPattern: false },
      { id: "g2", description: "Potion bought successfully", expectedOutput: "BUY|Potion|cost=5|gold=45|ok", isPattern: false },
      { id: "g3", description: "Chain Mail bought", expectedOutput: "BUY|Chain Mail|cost=20|gold=25|ok", isPattern: false },
      { id: "g4", description: "Shop header updates", expectedOutput: "SHOP_HEADER|gold=25", isPattern: false },
      { id: "g5", description: "Shop closes", expectedOutput: "SHOP|close", isPattern: false },
      { id: "g6", description: "Back to playing", expectedOutput: "HUD_GOLD|25", isPattern: false },
    ],
    hints: [
      "Add int buy_id=-1 to Command. Map '1'-'5' to buy_id 0-4 with: cmd.buy_id = c - '1'.",
      "In SHOPPING branch of game_tick, check cmd.buy_id >= 0 before calling tryBuyItem.",
      "tryBuyItem checks: valid id, sufficient gold, inventory space. Returns bool."
    ],
    estimatedMinutes: 12,
  },
};
