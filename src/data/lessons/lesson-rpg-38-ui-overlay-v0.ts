import { Lesson } from "@/types/lesson";

export const lessonRPG38: Lesson = {
  id: "rpg-38-ui-overlay-v0",
  title: "UI Overlay v0",
  description: "A HUD line projected from WorldState — player HP, turn number, and last combat event, all read-only from existing data.",
  order: 38,
  xpReward: 100,
  tier: "pro",
  concepts: ["HUD as state projection", "read-only rendering", "UI separation", "combat feed"],
  part1: {
    title: "Concept: HUD as State Projection",
    type: "concept",
    instructions: `# UI Overlay v0

## Mental Model
A HUD (Heads-Up Display) is a projection of game state onto the screen. It does not own data. It does not modify data. It reads WorldState and prints a formatted summary. Player HP comes from \`w.hp[0]\`. Turn number comes from \`w.turn\`. The last combat event comes from \`w.event_log[w.event_count-1]\`. The HUD is a pure function of state: same state → same HUD → every time.

This is the single-source-of-truth principle: WorldState is the truth, everything else is a view. The HUD is a view. The entity list is a view. The grid render (future lesson) is a view. None of them store their own copy of HP or turn count.

## What Breaks Without This
Without a HUD, the player must scan RENDER and ENT trace lines to find their HP. That is debug output, not a user interface. A real game needs a clear status line: "HP: 30 | Turn: 5 | Last hit: 5 dmg to Guard". Without this, the game is unplayable for anyone who is not reading raw traces.

If the HUD stored its own copy of HP, it could desync from WorldState. The player takes damage, but the HUD still shows 30 HP because someone forgot to update the HUD copy. Single source of truth prevents this class of bugs entirely.

## The Fix: renderHUD Function

\`\`\`cpp
void renderHUD(const WorldState& w) {
    cout << "HUD|hp=" << w.hp[0]
         << "|turn=" << w.turn
         << "|enemies=";
    int alive_enemies = 0;
    for (int i = 1; i < w.entity_count; i++) {
        if (w.alive[i]) alive_enemies++;
    }
    cout << alive_enemies << endl;
    if (w.event_count > 0) {
        const CombatEvent& ev = w.event_log[w.event_count - 1];
        cout << "HUD_COMBAT|dmg=" << ev.dmg
             << "|target=" << ev.target
             << "|hp_after=" << ev.hp_after << endl;
    }
}
\`\`\`

The function takes \`const WorldState&\` — it cannot modify state. It reads fields and prints. That is all.

## Key Concepts
- HUD as projection: read state, format output, never store separate copies
- const reference: \`const WorldState&\` enforces read-only access at compile time
- Combat feed: last event from event_log, only shown if events exist this tick
- Alive enemy count: derived from alive[] array, computed on demand

## Performance Insight
renderHUD iterates entity_count to count alive enemies — with MAX_E=16, that is 16 comparisons. Printing the HUD is one cout call with field concatenation. The event_count check is one comparison. Total HUD cost: under 50 nanoseconds. Negligible even at 60 FPS.

## Memory Insight
renderHUD uses zero additional memory. It reads from WorldState (which already exists) and writes to cout (which is the output stream). No buffers, no allocations, no copies. The alive_enemies variable is one int on the stack. Gate A: fully compliant.

## Your Task
Write a renderHUD function that prints player HP, turn number, alive enemy count, and the last combat event (if any). Call it on a WorldState with known values.

Expected output:
\`\`\`
HUD|hp=25|turn=3|enemies=2
HUD_COMBAT|dmg=5|target=1|hp_after=10
\`\`\`

## Beginner Trap
**Storing HP in a separate HUD struct.** If you create \`struct HUD { int displayed_hp; }\` and copy hp[0] into it, you now have two sources of truth. When the player takes damage, you must update both WorldState and HUD. Miss one, and the display lies. Instead, always read from WorldState directly.

## Elite Insight
React's core principle is "UI is a function of state" — \`UI = f(state)\`. Your renderHUD follows the same principle: \`HUD = f(WorldState)\`. React re-renders when state changes. Your HUD re-prints every tick. The architecture is identical. React uses a virtual DOM for efficiency; you use direct cout. Same pattern, different optimization level.

## Systems Thinking Connection
The Space Shooter path adds a HUD showing score and lives. The Platformer path adds a HUD showing health and checkpoint. The Robotics path adds a sensor overlay showing range readings. All four paths implement HUD as a const projection of state — no mutable UI state, no sync bugs.

## Skill Reinforcement
Lesson 37 added the combat event log. This lesson reads that log to display a combat feed. The HUD is the first consumer of event data, proving that structured events (not raw cout) enable useful features.

## Mastery Check
Question: Why does renderHUD take \`const WorldState&\` instead of \`WorldState&\`?
Answer: Because the HUD must never modify game state. The const qualifier is a compile-time guarantee: any attempt to write to \`w.hp[0]\` or \`w.turn\` inside renderHUD will produce a compiler error. This enforces the read-only projection principle at the language level, not just by convention.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;
const int MAX_EVENTS = 64;

struct CombatEvent {
    int src;
    int target;
    int dmg;
    int hp_after;
    bool killed;
};

struct WorldState {
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    int turn;
    CombatEvent event_log[MAX_EVENTS];
    int event_count;
};

// TODO: Write renderHUD(const WorldState& w)
// Print: HUD|hp=H|turn=T|enemies=E
//   H = w.hp[0]
//   T = w.turn
//   E = count of alive[i] for i >= 1
// If event_count > 0, also print:
//   HUD_COMBAT|dmg=D|target=T|hp_after=H
//   using the LAST event (event_log[event_count-1])

int main() {
    WorldState w = {};
    w.hp[0] = 25; w.alive[0] = true;
    w.hp[1] = 10; w.alive[1] = true;
    w.hp[2] = 15; w.alive[2] = true;
    w.hp[3] = 0;  w.alive[3] = false;
    w.entity_count = 4;
    w.turn = 3;

    // Add one combat event
    w.event_count = 1;
    w.event_log[0] = {0, 1, 5, 10, false};

    // TODO: Call renderHUD(w)

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;
const int MAX_EVENTS = 64;

struct CombatEvent {
    int src;
    int target;
    int dmg;
    int hp_after;
    bool killed;
};

struct WorldState {
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    int turn;
    CombatEvent event_log[MAX_EVENTS];
    int event_count;
};

void renderHUD(const WorldState& w) {
    int alive_enemies = 0;
    for (int i = 1; i < w.entity_count; i++) {
        if (w.alive[i]) alive_enemies++;
    }
    cout << "HUD|hp=" << w.hp[0] << "|turn=" << w.turn
         << "|enemies=" << alive_enemies << endl;
    if (w.event_count > 0) {
        const CombatEvent& ev = w.event_log[w.event_count - 1];
        cout << "HUD_COMBAT|dmg=" << ev.dmg
             << "|target=" << ev.target
             << "|hp_after=" << ev.hp_after << endl;
    }
}

int main() {
    WorldState w = {};
    w.hp[0] = 25; w.alive[0] = true;
    w.hp[1] = 10; w.alive[1] = true;
    w.hp[2] = 15; w.alive[2] = true;
    w.hp[3] = 0;  w.alive[3] = false;
    w.entity_count = 4;
    w.turn = 3;

    w.event_count = 1;
    w.event_log[0] = {0, 1, 5, 10, false};

    renderHUD(w);

    return 0;
}`,
    tests: [
      { id: "t1", description: "HUD shows player HP", expectedOutput: "HUD|hp=25|turn=3|enemies=2", isPattern: false },
      { id: "t2", description: "Combat feed shows last event", expectedOutput: "HUD_COMBAT|dmg=5|target=1|hp_after=10", isPattern: false },
    ],
    hints: [
      "Count alive enemies with a loop: for (int i = 1; i < w.entity_count; i++) if (w.alive[i]) alive_enemies++. Start at 1 to skip the player.",
      "Access the last event with w.event_log[w.event_count - 1]. Only do this if w.event_count > 0.",
      "Remember: the function signature must be const WorldState& — the HUD never modifies state."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: HUD in the Game Loop",
    type: "game_builder",
    instructions: `# Build: HUD in the Game Loop

## Mental Model
Add renderHUD to the game pipeline, called after renderWorld. Every tick, the player sees: their HP, the turn number, alive enemy count, and any combat that happened this tick. The HUD is the last thing rendered — it sits "on top" of the game view, just like a real HUD overlays the game screen.

Pipeline per tick: clear event log → input → move player → combat (record events) → AI movement → renderWorld → renderHUD.

## What Breaks Without This
Without the HUD, the player must read raw RENDER and ENT lines. That is fine for debugging but unusable as a game interface. The HUD transforms trace output into readable status information.

## The Fix: Add renderHUD After renderWorld

\`\`\`cpp
void renderHUD(const WorldState& w) {
    int alive_enemies = 0;
    for (int i = 1; i < w.entity_count; i++) {
        if (w.alive[i]) alive_enemies++;
    }
    cout << "HUD|hp=" << w.hp[0] << "|turn=" << w.turn
         << "|enemies=" << alive_enemies << endl;
    if (w.event_count > 0) {
        const CombatEvent& ev = w.event_log[w.event_count - 1];
        cout << "HUD_COMBAT|dmg=" << ev.dmg
             << "|target=" << ev.target
             << "|hp_after=" << ev.hp_after << endl;
    }
}
\`\`\`

In main, after renderWorld(w), call renderHUD(w).

## Key Concepts
- HUD placement: after renderWorld in the pipeline — last rendered, first seen by player
- const correctness: renderHUD takes const WorldState& — compile-time read-only guarantee
- Combat feed from event log: reads the last CombatEvent, not raw combat traces
- Alive enemy count: derived value computed each frame from alive[] array

## Performance Insight
renderHUD adds one loop (count alive enemies) and one conditional (check event_count) per tick. With 3 entities, this is 2 comparisons + 1 branch. The cout calls are the most expensive part — string formatting and output buffering. Total: under 100 nanoseconds per tick.

## Memory Insight
renderHUD adds zero bytes to WorldState. The alive_enemies counter is one stack int. The CombatEvent reference is a pointer (8 bytes on stack). No allocations. Gate A: fully compliant.

## Your Task
Add renderHUD to the game loop. The player moves right, attacks the guard 3 times (killing it), then moves right. The HUD should show changing enemy count and combat feed.

Expected output includes:
\`\`\`
HUD|hp=30|turn=1|enemies=2
HUD|hp=30|turn=2|enemies=2
HUD_COMBAT|dmg=5|target=1|hp_after=10
HUD|hp=30|turn=4|enemies=1
HUD_COMBAT|dmg=5|target=1|hp_after=0
HUD|hp=30|turn=5|enemies=1
\`\`\`

## Beginner Trap
**Calling renderHUD before renderWorld.** The convention is: game state first (entities, positions), then HUD overlay. If you print the HUD first, the output is harder to read — status appears before you know what is happening. HUD comes last in the render pipeline.

## Elite Insight
Doom's HUD is a pure function: it reads player health from the game state struct and draws the status bar. The HUD code never modifies health — it projects it. Your renderHUD follows the same pattern. In AAA games, the HUD system is often a separate module with its own render pass, reading from a "game state snapshot" — a const reference to the current frame's state.

## Mastery Check
Question: What happens to the HUD_COMBAT line on ticks where no combat occurs?
Answer: Nothing — the \`if (w.event_count > 0)\` check prevents printing. Since event_count is cleared to 0 at the start of each tick, non-combat ticks have no events, and the HUD shows only the status line. The combat feed is conditional, not permanent.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = { {0,0}, {1,0} };

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee
    {0},  // type 2: passive
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
    int src;
    int target;
    int dmg;
    int hp_after;
    bool killed;
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
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
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
    for(int i=0;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        cout<<"ENT|id="<<i<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")|hp="<<w.hp[i]<<endl;
    }
    for(int i=0;i<w.event_count;i++){
        const CombatEvent& ev=w.event_log[i];
        cout<<"EVENT|"<<i<<"|src="<<ev.src<<"|target="<<ev.target
            <<"|dmg="<<ev.dmg<<"|hp="<<ev.hp_after
            <<"|killed="<<(ev.killed?1:0)<<endl;
    }
}

// TODO: Write renderHUD(const WorldState& w)
// Print: HUD|hp=H|turn=T|enemies=E
// If event_count > 0, also print:
//   HUD_COMBAT|dmg=D|target=T|hp_after=H

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','f','f','f','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
        // TODO: Call renderHUD(w)
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = { {0,0}, {1,0} };

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee
    {0},  // type 2: passive
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
    int src;
    int target;
    int dmg;
    int hp_after;
    bool killed;
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
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
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
    for(int i=0;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        cout<<"ENT|id="<<i<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")|hp="<<w.hp[i]<<endl;
    }
    for(int i=0;i<w.event_count;i++){
        const CombatEvent& ev=w.event_log[i];
        cout<<"EVENT|"<<i<<"|src="<<ev.src<<"|target="<<ev.target
            <<"|dmg="<<ev.dmg<<"|hp="<<ev.hp_after
            <<"|killed="<<(ev.killed?1:0)<<endl;
    }
}

void renderHUD(const WorldState& w){
    int alive_enemies=0;
    for(int i=1;i<w.entity_count;i++){
        if(w.alive[i]) alive_enemies++;
    }
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn
        <<"|enemies="<<alive_enemies<<endl;
    if(w.event_count>0){
        const CombatEvent& ev=w.event_log[w.event_count-1];
        cout<<"HUD_COMBAT|dmg="<<ev.dmg
            <<"|target="<<ev.target
            <<"|hp_after="<<ev.hp_after<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','f','f','f','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
        renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "HUD shows full HP on first tick", expectedOutput: "HUD|hp=30|turn=1|enemies=2", isPattern: false },
      { id: "g2", description: "HUD combat feed on attack tick", expectedOutput: "HUD_COMBAT|dmg=5|target=1|hp_after=10", isPattern: false },
      { id: "g3", description: "HUD shows enemy killed", expectedOutput: "HUD|hp=30|turn=4|enemies=1", isPattern: false },
      { id: "g4", description: "Kill event in combat feed", expectedOutput: "HUD_COMBAT|dmg=5|target=1|hp_after=0", isPattern: false },
      { id: "g5", description: "No HUD_COMBAT on move-only tick", expectedOutput: "HUD|hp=30|turn=5|enemies=1", isPattern: false },
    ],
    hints: [
      "Count alive enemies starting from index 1 (skip the player at index 0).",
      "Only print HUD_COMBAT if w.event_count > 0. On ticks with no combat, event_count is 0 (cleared at tick start).",
      "Call renderHUD(w) in main after renderWorld(w) — the HUD is the last thing rendered each tick."
    ],
    estimatedMinutes: 10,
  },
};
