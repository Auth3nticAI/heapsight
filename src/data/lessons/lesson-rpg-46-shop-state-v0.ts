import { Lesson } from "@/types/lesson";

export const lessonRPG46: Lesson = {
  id: "rpg-46-shop-state-v0",
  title: "Shop State v0",
  description: "The game gains a mode enum — PLAYING or SHOPPING. Pressing 'b' switches to shop mode, 'q' returns to playing. Game state as a simple integer flag.",
  order: 46,
  xpReward: 100,
  tier: "pro",
  concepts: ["game state as mode enum", "state transitions", "modal input", "mode-dependent rendering"],
  part1: {
    title: "Concept: Game State as Mode Enum",
    type: "concept",
    instructions: `# Shop State v0

## Mental Model
A game has modes: playing, shopping, pausing, talking to NPCs. Each mode changes what input does and what the screen shows. In PLAYING mode, 'w' moves up. In SHOPPING mode, 'w' might scroll the shop list. The same key, different behavior — determined by the current mode.

The mode is an integer in WorldState. Constants name each mode. The tick pipeline checks the mode before processing input. The render pipeline checks the mode before drawing.

This is a **finite state machine (FSM)** at the application level: the game is always in exactly one mode, and specific inputs trigger transitions between modes.

## What Breaks Without This
Without modes, the game is always in "playing" mode. You cannot open a shop, pause, or talk to NPCs. Every interaction happens in the same context. Adding a shop means the player must be able to stop moving, browse items, buy things, and return to the dungeon. Without mode separation, shop inputs would conflict with movement inputs.

## The Fix: Mode Constants and Transition

\`\`\`cpp
const int MODE_PLAYING = 0;
const int MODE_SHOPPING = 1;

// Add to WorldState:
int mode;  // initialized to MODE_PLAYING
\`\`\`

In captureInput, the mode determines what commands are valid:
- PLAYING: w/a/s/d move, f attacks, u uses item, b opens shop
- SHOPPING: q closes shop (returns to PLAYING)

In game_tick:
\`\`\`cpp
if (w.mode == MODE_PLAYING) {
    // normal movement, combat, AI
} else if (w.mode == MODE_SHOPPING) {
    // shop logic (Lesson 47)
}
\`\`\`

## Key Concepts
- Mode enum: integer constants (MODE_PLAYING=0, MODE_SHOPPING=1)
- Mode in WorldState: one int determines the entire game behavior
- Modal input: same key can mean different things in different modes
- Mode transition: 'b' → MODE_SHOPPING, 'q' → MODE_PLAYING
- Render by mode: different output depending on current mode

## Performance Insight
Mode check: one integer comparison per tick. Cost: 1 nanosecond. Mode transition: one integer assignment. No branching overhead — the mode is checked once at the top of game_tick.

## Memory Insight
One int added to WorldState: 4 bytes. Mode constants are compile-time values. No heap allocations. Gate A: fully compliant.

## Your Task
Implement mode switching: start in PLAYING mode, press 'b' to enter SHOPPING, press 'q' to return to PLAYING. Print the mode after each transition.

Expected output:
\`\`\`
MODE|playing
SWITCH|shopping
MODE|shopping
SWITCH|playing
MODE|playing
\`\`\`

## Beginner Trap
**Using a bool instead of an int for mode.** A bool only supports two states. When you add PAUSED, DIALOGUE, INVENTORY modes later, you need to refactor. Using an int from the start supports unlimited modes with zero refactoring.

## Elite Insight
Doom's game loop checks a \`gamestate\` variable at the top of every frame: GS_LEVEL, GS_INTERMISSION, GS_FINALE, GS_DEMOSCREEN. Each state runs completely different logic. Your MODE_PLAYING/MODE_SHOPPING follows the same architecture.

## Systems Thinking Connection
The Space Shooter path uses modes for gameplay vs game-over. The Platformer path uses modes for playing vs pause menu. The Robotics path uses modes for manual vs autonomous control. All four paths implement application-level state machines.

## Skill Reinforcement
Lesson 19 introduced game states conceptually. This lesson implements them concretely with a mode integer in WorldState. Lesson 47 will add shop buy logic that only runs in MODE_SHOPPING.

## Mastery Check
Question: Why check mode at the top of game_tick instead of inside each subsystem?
Answer: Because mode determines which subsystems run. In SHOPPING mode, AI should not move enemies, combat should not resolve, and movement should not process. Checking at the top prevents all subsystems from running unnecessarily. Each mode has its own pipeline.`,
    starterCode: `#include <iostream>
using namespace std;

const int MODE_PLAYING = 0;
const int MODE_SHOPPING = 1;

int main() {
    int mode = MODE_PLAYING;

    // TODO: Print initial mode
    // MODE|playing

    // TODO: Simulate pressing 'b' (switch to shopping)
    // Print: SWITCH|shopping
    // Print: MODE|shopping

    // TODO: Simulate pressing 'q' (switch back to playing)
    // Print: SWITCH|playing
    // Print: MODE|playing

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MODE_PLAYING = 0;
const int MODE_SHOPPING = 1;

int main() {
    int mode = MODE_PLAYING;

    cout << "MODE|playing" << endl;

    // Press 'b' - switch to shopping
    mode = MODE_SHOPPING;
    cout << "SWITCH|shopping" << endl;
    cout << "MODE|shopping" << endl;

    // Press 'q' - switch back to playing
    mode = MODE_PLAYING;
    cout << "SWITCH|playing" << endl;
    cout << "MODE|playing" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Starts in playing mode", expectedOutput: "MODE|playing", isPattern: false },
      { id: "t2", description: "Switches to shopping", expectedOutput: "SWITCH|shopping", isPattern: false },
      { id: "t3", description: "Returns to playing", expectedOutput: "SWITCH|playing", isPattern: false },
    ],
    hints: [
      "Set mode = MODE_SHOPPING when 'b' is pressed. Print SWITCH|shopping and MODE|shopping.",
      "Set mode = MODE_PLAYING when 'q' is pressed. Print SWITCH|playing and MODE|playing.",
      "Mode is just an int — 0 for playing, 1 for shopping. Switch it with assignment."
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Mode System in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Mode System in the Game Loop

## Mental Model
Wire the mode system into the game. WorldState gains \`int mode\`. The tick pipeline branches on mode: in PLAYING mode, normal movement/combat/AI runs. In SHOPPING mode, only shop display runs (no movement, no AI, no combat). The 'b' key switches to SHOPPING, 'q' returns to PLAYING.

The render pipeline also branches: PLAYING mode shows the dungeon. SHOPPING mode shows the shop inventory (items from ITEM_TABLE with prices).

## What Breaks Without This
Without mode branching in game_tick, entering the shop does not pause the game — enemies keep moving, combat keeps resolving. The player is "shopping" while being attacked. Mode separation ensures the game world freezes while the player shops.

## The Fix: Mode Branching in game_tick

\`\`\`cpp
void game_tick(WorldState& w, Command cmd) {
    if (w.mode == MODE_PLAYING) {
        // existing tick logic: movement, items, combat, AI
        if (cmd.open_shop) {
            w.mode = MODE_SHOPPING;
            cout << "SHOP|open" << endl;
            return;
        }
        // ... normal tick
    } else if (w.mode == MODE_SHOPPING) {
        if (cmd.close_shop) {
            w.mode = MODE_PLAYING;
            cout << "SHOP|close" << endl;
        }
        // shop logic in Lesson 47
    }
}
\`\`\`

## Key Concepts
- Mode branching: top-level if/else in game_tick and render
- World freeze: PLAYING subsystems do not run in SHOPPING mode
- Command extension: open_shop and close_shop booleans added to Command
- Render by mode: PLAYING shows dungeon, SHOPPING shows item list with prices

## Performance Insight
Mode check is one integer comparison. In SHOPPING mode, the entire combat/AI/movement pipeline is skipped — actually faster than a normal tick.

## Memory Insight
One int (mode) added to WorldState. Two bools (open_shop, close_shop) added to Command. Total: 12 bytes. Gate A: fully compliant.

## Your Task
Add mode to WorldState and Command. Branch game_tick on mode. In SHOPPING mode, render the shop listing. Run a scenario: move, open shop, close shop, move again.

Expected output includes:
\`\`\`
HUD|hp=30|turn=1|enemies=2
SHOP|open
SHOP_LIST|0|Iron Sword|cost=10
SHOP_LIST|1|Steel Sword|cost=25
SHOP_LIST|2|Leather|cost=8
SHOP_LIST|3|Chain Mail|cost=20
SHOP_LIST|4|Potion|cost=5
SHOP|close
HUD|hp=30|turn=3|enemies=2
\`\`\`

## Beginner Trap
**Incrementing the turn counter in SHOPPING mode.** When the player is shopping, the game world is frozen. Incrementing w.turn in SHOPPING mode makes the turn count wrong — the player "spent" turns shopping. Only increment turn in PLAYING mode ticks.

## Elite Insight
Final Fantasy pauses the world when you open the menu. Pokémon pauses the world when you open the bag. Darkest Dungeon pauses the world when you open the shop. Your mode system follows the same design: shop mode freezes the dungeon.

## Mastery Check
Question: Should enemies attack the player when the shop is open?
Answer: No. In SHOPPING mode, AI does not run, combat does not resolve, and movement does not process. The world is frozen. The player is safe while shopping. This is a design decision — some games allow real-time shopping under pressure, but our turn-based RPG freezes the world.`,
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

// TODO: Add open_shop and close_shop to Command
struct Command { int dx; int dy; bool attack; bool use_item; };
Command captureInput(char c){
    Command cmd={0,0,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    // TODO: 'b' -> open_shop, 'q' -> close_shop
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
    // TODO: Add int mode
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
    w.gold=50;
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
                w.inv_count=2; w.weapon_id=0;
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

// TODO: Branch game_tick on w.mode
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
                if(w.hp[i]<=0){
                    w.alive[i]=false;
                    int base_g=GOLD_TABLE[w.damage_id[i]].base;
                    int bonus=0;
                    if(GOLD_TABLE[w.damage_id[i]].bonus_range>0)
                        bonus=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                    w.gold+=base_g+bonus;
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
}

// TODO: Write renderShop that lists items with prices

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    // Move, open shop, close shop, move
    char inputs[]={'d','b','q','d'};
    for(int i=0;i<4;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        // TODO: Render based on mode
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
const int MODE_PLAYING=0;
const int MODE_SHOPPING=1;
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

struct Command { int dx; int dy; bool attack; bool use_item; bool open_shop; bool close_shop; };
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true;
    else if(c=='q') cmd.close_shop=true;
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
    int mode;
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
    w.gold=50; w.mode=MODE_PLAYING;
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
                w.inv_count=2; w.weapon_id=0;
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
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){
            w.mode=MODE_SHOPPING;
            cout<<"SHOP|open"<<endl;
            return;
        }
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
                        w.gold+=base_g+bonus;
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
    } else if(w.mode==MODE_SHOPPING){
        if(cmd.close_shop){
            w.mode=MODE_PLAYING;
            cout<<"SHOP|close"<<endl;
        }
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
}

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++){
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','b','q','d'};
    for(int i=0;i<4;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING){
            renderWorld(w);
            renderHUD(w);
        } else if(w.mode==MODE_SHOPPING){
            renderShop(w);
        }
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "First tick renders dungeon", expectedOutput: "HUD|hp=30|turn=1|enemies=2", isPattern: false },
      { id: "g2", description: "Shop opens on 'b'", expectedOutput: "SHOP|open", isPattern: false },
      { id: "g3", description: "Shop lists items", expectedOutput: "SHOP_LIST|0|Iron Sword|cost=10", isPattern: false },
      { id: "g4", description: "Shop shows gold", expectedOutput: "SHOP_HEADER|gold=50", isPattern: false },
      { id: "g5", description: "Shop closes on 'q'", expectedOutput: "SHOP|close", isPattern: false },
      { id: "g6", description: "Back to dungeon after shop", expectedOutput: "HUD|hp=30|turn=2|enemies=2", isPattern: false },
    ],
    hints: [
      "Add bool open_shop and bool close_shop to Command. Map 'b' to open_shop, 'q' to close_shop.",
      "In game_tick, check w.mode first. If PLAYING and cmd.open_shop, switch to SHOPPING and return early.",
      "In main's render section, check w.mode: PLAYING renders dungeon+HUD, SHOPPING renders shop list."
    ],
    estimatedMinutes: 15,
  },
};
