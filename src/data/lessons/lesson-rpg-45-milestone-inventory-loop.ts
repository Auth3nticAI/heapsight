import { Lesson } from "@/types/lesson";

export const lessonRPG45: Lesson = {
  id: "rpg-45-milestone-inventory-loop",
  title: "Milestone: Inventory Loop",
  description: "The full progression loop: equip weapon, kill enemies, earn gold, use potion, survive — proving that items, equipment, consumables, and economy work together.",
  order: 45,
  xpReward: 300,
  tier: "pro",
  concepts: ["progression loop", "inventory integration", "economic verification", "full system composition"],
  part1: {
    title: "Concept: The Progression Loop",
    type: "concept",
    instructions: `# Milestone: Inventory Loop

## Mental Model
A progression loop is the core game cycle: the player takes actions, earns rewards, uses rewards to become stronger, and faces harder challenges. In our RPG:

1. **Equip** — weapon equipped at start (Iron Sword, +3 damage)
2. **Fight** — combat with weapon bonus (8 damage per hit)
3. **Earn** — gold drops on kill (from GOLD_TABLE + RNG)
4. **Heal** — use potion from inventory (consumable, removed after use)
5. **Survive** — HUD shows HP, gold, inventory, equipped items

This loop uses every system built in Phase 5:
- ITEM_TABLE (L41) defines items
- Equipment slots (L42) modify combat damage
- Consumables (L43) restore HP
- Gold economy (L44) rewards kills

If the loop works — equip, fight, earn, heal, survive — then Phase 5 is complete.

## What Breaks Without This
Without the full loop:
- Items exist but do not affect gameplay (L41 alone)
- Equipment exists but combat ignores it (L42 without integration)
- Potions exist but cannot be used (L43 without the 'u' command)
- Gold is earned but cannot be spent (L44 without a shop — that is L46)

The milestone proves these pieces compose into a working game loop. The shop comes later; this lesson proves the earning and spending (of items) side of the economy.

## The Scenario

\`\`\`
Room: 10x10 dungeon, 1 guard, 1 chaser
Player starts with: Iron Sword (equipped), Potion (in inventory)
Player starts with: 30 HP, 0 gold

Input sequence: d, f, f, u, d, d, d, d, d
  Tick 1: Move right (approach guard)
  Tick 2: Attack guard (dmg 8, guard hp 7)
  Tick 3: Attack guard (dmg 8, guard dies, gold earned)
  Tick 4: Use potion (heals — capped at 30 since full HP)
  Ticks 5-9: Move down and right
\`\`\`

After 9 ticks: guard dead, gold earned, potion consumed, chaser alive and moving.

## Key Concepts
- Progression loop: equip → fight → earn → heal → repeat
- System composition: 5 independently-built systems working together
- Milestone verification: check final state matches expected values
- Economic audit: gold earned matches GOLD_TABLE for killed enemy types

## Performance Insight
9 ticks with full pipeline: input + movement + item use + combat (with table lookups) + AI + render + HUD. Each tick: ~50-100 operations. Total: under 1,000 operations. Wall time: under 1 microsecond. The system scales to 100 ticks, 100 entities, and 100 items without architectural changes.

## Memory Insight
WorldState with all Phase 5 additions: ~1,850 bytes. All on the stack. Gate A: zero heap allocations across all ticks. The progression loop — equip, fight, heal, earn — runs entirely within fixed-size arrays and const tables.

## Your Task
Simulate the progression loop: equip a weapon, attack an enemy until it dies, use a potion, and verify the final state. Track HP, gold, inventory count, and alive enemies.

Expected output:
\`\`\`
EQUIP|weapon=Iron Sword|bonus=3
ATTACK|dmg=8|target_hp=7
ATTACK|dmg=8|target_hp=-1
KILL|gold_earned
HEAL|potion|hp=30
FINAL|hp=30|gold>0|inv=1|enemies=1
\`\`\`

## Beginner Trap
**Testing systems in isolation instead of together.** If you test combat without equipment, item use without inventory management, and gold without combat, each works alone but might fail when composed. Integration testing catches composition bugs that unit tests miss.

## Elite Insight
Every successful RPG ships with a "golden path" test: a scripted playthrough that exercises the core loop. BioWare's QA runs automated playthroughs of the critical path for every build. Your 9-tick scenario is a golden path test for the inventory system.

## Systems Thinking Connection
The Space Shooter path proves: shoot → score → power-up → survive. The Platformer path proves: jump → collect → checkpoint → progress. The Robotics path proves: sense → plan → move → map. All four paths prove their core loop at milestone 45.

## Skill Reinforcement
This milestone validates Lessons 41-44 (item table, equipment, consumables, gold). Lesson 46 begins Phase 6 (shop system). The inventory loop must be solid before the shop can sell items.

## Mastery Check
Question: If the player uses a potion at full HP, what happens?
Answer: The potion is consumed (removed from inventory, inv_count decreases), but HP stays at 30 (capped at MAX_HP). The heal amount is "wasted." This is correct behavior — the item is used regardless of whether the heal was needed. A smarter design might prevent using potions at full HP, but that is a game design choice, not an engineering requirement.`,
    starterCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int MAX_HP = 30;
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

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) {
    r.state = r.state * 1664525u + 1013904223u;
    return r.state;
}

struct GoldDrop { int base; int bonus_range; };
const GoldDrop GOLD_TABLE[] = { {0,0}, {5,3}, {3,2} };

const int INV_SIZE = 5;

int main() {
    // Player state
    int hp = 30;
    int gold = 0;
    int weapon_id = 0;  // Iron Sword
    int inventory[INV_SIZE] = {0, 4, -1, -1, -1};  // sword, potion
    int inv_count = 2;
    int base_dmg = 5;
    RNG rng; rng_seed(rng, 42);

    // Enemy state
    int enemy_hp = 15;
    int enemy_damage_id = 2;  // passive
    bool enemy_alive = true;

    // TODO: Step 1 - Print equipped weapon
    // EQUIP|weapon=NAME|bonus=STAT

    // TODO: Step 2 - Attack enemy twice
    // Calculate: total_dmg = base_dmg + ITEM_TABLE[weapon_id].stat
    // Apply damage, print: ATTACK|dmg=D|target_hp=H
    // If dead: print KILL|gold_earned, add gold from GOLD_TABLE

    // TODO: Step 3 - Use potion (find consumable, heal, remove)
    // Print: HEAL|potion|hp=H

    // TODO: Step 4 - Print final state
    // FINAL|hp=H|gold=G|inv=C|enemies=E
    // (enemies = enemy_alive ? 1 : 0)

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int ITEM_NONE = -1;
const int MAX_HP = 30;
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

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) {
    r.state = r.state * 1664525u + 1013904223u;
    return r.state;
}

struct GoldDrop { int base; int bonus_range; };
const GoldDrop GOLD_TABLE[] = { {0,0}, {5,3}, {3,2} };

const int INV_SIZE = 5;

int main() {
    int hp = 30;
    int gold = 0;
    int weapon_id = 0;
    int inventory[INV_SIZE] = {0, 4, -1, -1, -1};
    int inv_count = 2;
    int base_dmg = 5;
    RNG rng; rng_seed(rng, 42);

    int enemy_hp = 15;
    int enemy_damage_id = 2;
    bool enemy_alive = true;

    // Step 1: Print equipped weapon
    cout << "EQUIP|weapon=" << ITEM_TABLE[weapon_id].name
         << "|bonus=" << ITEM_TABLE[weapon_id].stat << endl;

    // Step 2: Attack enemy twice
    int total_dmg = base_dmg + ITEM_TABLE[weapon_id].stat;
    for (int atk = 0; atk < 2; atk++) {
        if (!enemy_alive) break;
        enemy_hp -= total_dmg;
        cout << "ATTACK|dmg=" << total_dmg << "|target_hp=" << enemy_hp << endl;
        if (enemy_hp <= 0) {
            enemy_alive = false;
            int base_g = GOLD_TABLE[enemy_damage_id].base;
            int bonus = 0;
            if (GOLD_TABLE[enemy_damage_id].bonus_range > 0)
                bonus = rng_next(rng) % GOLD_TABLE[enemy_damage_id].bonus_range;
            int drop = base_g + bonus;
            gold += drop;
            cout << "KILL|gold_earned=" << drop << "|total=" << gold << endl;
        }
    }

    // Step 3: Use potion
    for (int i = 0; i < inv_count; i++) {
        int item_id = inventory[i];
        if (item_id < 0 || item_id >= ITEM_COUNT) continue;
        if (ITEM_TABLE[item_id].type == ITEM_TYPE_CONSUMABLE) {
            int heal = ITEM_TABLE[item_id].stat;
            hp += heal;
            if (hp > MAX_HP) hp = MAX_HP;
            cout << "HEAL|" << ITEM_TABLE[item_id].name << "|hp=" << hp << endl;
            for (int j = i; j < inv_count - 1; j++)
                inventory[j] = inventory[j + 1];
            inventory[inv_count - 1] = ITEM_NONE;
            inv_count--;
            break;
        }
    }

    // Step 4: Final state
    int enemies = enemy_alive ? 1 : 0;
    cout << "FINAL|hp=" << hp << "|gold=" << gold
         << "|inv=" << inv_count << "|enemies=" << enemies << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Weapon equipped", expectedOutput: "EQUIP|weapon=Iron Sword|bonus=3", isPattern: false },
      { id: "t2", description: "First attack deals 8", expectedOutput: "ATTACK|dmg=8|target_hp=7", isPattern: false },
      { id: "t3", description: "Enemy killed", expectedOutput: "ATTACK|dmg=8|target_hp=-1", isPattern: false },
      { id: "t4", description: "Gold earned on kill", expectedOutput: "KILL|gold_earned=", isPattern: true },
      { id: "t5", description: "Potion consumed", expectedOutput: "HEAL|Potion|hp=30", isPattern: false },
      { id: "t6", description: "Final state correct", expectedOutput: "FINAL|hp=30|gold=", isPattern: true },
    ],
    hints: [
      "Total damage = base_dmg + ITEM_TABLE[weapon_id].stat = 5 + 3 = 8. Enemy has 15 HP, so 2 hits: 7, -1.",
      "Gold drop uses GOLD_TABLE[enemy_damage_id]. The enemy is passive (id=2), so base=3, bonus_range=2.",
      "After using the potion, shift inventory and decrement inv_count. Final inv_count should be 1."
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Full Progression Loop in the Game",
    type: "game_builder",
    instructions: `# Build: Full Progression Loop in the Game

## Mental Model
Run the complete game with all Phase 5 systems active: ITEM_TABLE, equipment slots, consumables, gold economy. The player equips a sword, kills enemies for gold, uses a potion, and survives. Every system from L31-L44 is running simultaneously.

This is the Phase 5 integration proof. If the output matches expectations, the inventory subsystem is complete and the game has a working progression loop.

## The Scenario

\`\`\`
Room: 10x10 dungeon, 1 guard (idle, hp=15), 1 chaser (chase_x, hp=10)
Player: hp=30, Iron Sword equipped, Potion in inventory, 0 gold
Seed: 42

Input: d, f, f, u, s, s, s, s, d
  Tick 1: Move right → (2,1), approach guard
  Tick 2: Attack guard → dmg=8, guard hp=7
  Tick 3: Attack guard → dmg=8, guard hp=-1, KILL, gold earned
  Tick 4: Use potion → heal (capped at 30, already full)
  Ticks 5-8: Move south
  Tick 9: Move right
\`\`\`

After 9 ticks:
- Guard dead, chaser alive
- Gold > 0 (earned from guard kill)
- Potion consumed (inv_count = 1, only Iron Sword remains)
- Player HP = 30 (no damage taken, potion wasted at full HP)

## Key Concepts
- Full pipeline: validate → load → tick (move/use/combat/AI) → render → HUD
- All tables active: BEHAVIOR, DAMAGE, ITEM, GOLD
- Equipment modifies combat: weapon bonus applied to damage
- Consumables modify state: potion restores HP
- Gold tracks kills: deterministic drops from GOLD_TABLE
- HUD shows everything: HP, turn, enemies, gold, inventory

## Performance Insight
9 ticks with 3 entities and full inventory system: ~200 operations per tick. Total: ~1,800 operations. Wall time: under 2 microseconds. The inventory system adds negligible overhead to the tick pipeline.

## Memory Insight
WorldState with Phase 5: ~1,860 bytes (adding gold: 4 bytes over Phase 4). All on the stack. ITEM_TABLE: 120 bytes const. GOLD_TABLE: 24 bytes const. Total static data tables: ~200 bytes. Gate A: zero heap allocations across all 9 ticks.

## Your Task
Wire everything together. Run 9 ticks. Verify: guard killed, gold earned, potion consumed, player alive.

Expected output includes:
\`\`\`
VALIDATE|ok=1|code=0
LOAD|room=10x10|entities=3
COMBAT|src=0|target=1|dmg=8|hp=7
KILL|id=1|gold=
USE|Potion|heal=10|hp=30
HUD_GOLD|
FINAL|hp=30|guard=0|chaser=1|gold>0|inv=1
\`\`\`

## Beginner Trap
**Not testing the "potion at full HP" case.** When the player uses a potion at full HP, the potion should still be consumed — but HP stays at 30. If your code prevents potion use at full HP, that is a design choice. But the current implementation consumes regardless. Test this edge case to verify your cap logic works.

## Elite Insight
Blizzard's QA runs "economy smoke tests" that verify the kill→loot→spend loop for every build. If a patch breaks gold drops, the smoke test catches it before release. Your 9-tick scenario IS an economy smoke test. Add more scenarios (different seeds, different rooms) for broader coverage.

## Mastery Check
Question: How many total data tables does the game now use?
Answer: Five: BEHAVIOR_TABLE (AI patterns), DAMAGE_TABLE (base damage), ITEM_TABLE (item definitions), GOLD_TABLE (drop rates), and ROOM_DATA (level layout). All are const arrays. All are read-only. All fit in L1 cache. The game is data-driven: change a table row, change the game. The code is the engine; the tables are the content.`,
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
    int gold;
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

const char FALLBACK_ROOM[] =
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
    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT)
        cout<<"HUD_WEAPON|"<<ITEM_TABLE[w.weapon_id].name<<endl;
    for(int i=0;i<w.inv_count;i++){
        int id=w.inventory[i];
        if(id>=0&&id<ITEM_COUNT)
            cout<<"INV|"<<i<<"|"<<ITEM_TABLE[id].name<<endl;
    }
}

int main(){
    WorldState w;

    // TODO: Validate, load, run 9 ticks, print FINAL state
    // Input: d, f, f, u, s, s, s, s, d
    // After loop: print FINAL|hp=H|guard=A|chaser=A|gold=G|inv=C

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

const char FALLBACK_ROOM[] =
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
    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT)
        cout<<"HUD_WEAPON|"<<ITEM_TABLE[w.weapon_id].name<<endl;
    for(int i=0;i<w.inv_count;i++){
        int id=w.inventory[i];
        if(id>=0&&id<ITEM_COUNT)
            cout<<"INV|"<<i<<"|"<<ITEM_TABLE[id].name<<endl;
    }
}

int main(){
    WorldState w;
    RoomError err=validateRoom(ROOM_DATA,W,H);
    cout<<"VALIDATE|ok="<<err.ok<<"|code="<<err.code<<endl;
    if(!err.ok){
        cout<<"ERROR|code="<<err.code<<"|using_fallback"<<endl;
        loadRoom(w,FALLBACK_ROOM,W,H,42);
    } else {
        loadRoom(w,ROOM_DATA,W,H,42);
    }

    char inputs[]={'d','f','f','u','s','s','s','s','d'};
    for(int i=0;i<9;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
        renderHUD(w);
    }

    cout<<"FINAL|hp="<<w.hp[0]
        <<"|guard="<<(w.alive[1]?1:0)
        <<"|chaser="<<(w.alive[2]?1:0)
        <<"|gold="<<w.gold
        <<"|inv="<<w.inv_count<<endl;

    return 0;
}`,
    tests: [
      { id: "g1", description: "Room validated", expectedOutput: "VALIDATE|ok=1|code=0", isPattern: false },
      { id: "g2", description: "Combat with weapon bonus", expectedOutput: "COMBAT|src=0|target=1|dmg=8|hp=7", isPattern: false },
      { id: "g3", description: "Guard killed", expectedOutput: "KILL|id=1|gold=", isPattern: true },
      { id: "g4", description: "Potion consumed", expectedOutput: "USE|Potion|heal=10|hp=30", isPattern: false },
      { id: "g5", description: "Final state: guard dead", expectedOutput: "guard=0|chaser=1", isPattern: true },
      { id: "g6", description: "Final inventory reduced", expectedOutput: "inv=1", isPattern: true },
    ],
    hints: [
      "Validate, then load with if/else fallback pattern. Use the 9-character input array.",
      "The guard (entity 1) has 15 HP and takes 8 damage per hit. It dies on tick 3 (hp goes to -1).",
      "After the loop, print FINAL with w.hp[0], w.alive[1], w.alive[2], w.gold, and w.inv_count."
    ],
    estimatedMinutes: 15,
  },
};
