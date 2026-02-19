import { Lesson } from "@/types/lesson";

export const lessonRPG37: Lesson = {
  id: "rpg-37-combat-event-log",
  title: "Combat Event Log",
  description: "Every combat action becomes a CombatEvent struct stored in a fixed-size log — the first step toward replay verification and event sourcing.",
  order: 37,
  xpReward: 100,
  tier: "pro",
  concepts: ["event sourcing", "combat event log", "fixed-size ring buffer", "structured trace data"],
  part1: {
    title: "Concept: Events as Structured Data",
    type: "concept",
    instructions: `# Combat Event Log

## Mental Model
Right now, combat results are printed to cout and then lost forever. The COMBAT trace exists as text on the screen but nowhere in memory. If you wanted to replay a fight, or verify determinism by comparing two runs, you would have to parse console output. That is fragile and slow.

The fix: store every combat action as a CombatEvent struct in a fixed-size array. The struct holds the attacker, the target, the damage dealt, the remaining HP, and whether the target died. The combat code writes events to the log. The render code reads the log. The replay system (Lesson 64) will compare logs between runs.

This is **event sourcing** at its simplest: instead of modifying state and forgetting how, you record every state change as an event. The log IS the history.

## What Breaks Without This
Without a combat log, you cannot:
- Verify that two runs produced the same combat sequence (determinism check)
- Show a "last 5 hits" combat feed in the UI (Lesson 38)
- Replay a fight from a save file (Lesson 64)
- Debug why the player died — the traces scrolled off the screen

With a log, every combat action is inspectable at any time. Print it, compare it, save it, replay it.

## The Fix: CombatEvent Struct and Log Array

\`\`\`cpp
struct CombatEvent {
    int src;
    int target;
    int dmg;
    int hp_after;
    bool killed;
};

const int MAX_EVENTS = 64;
\`\`\`

Add to WorldState:
\`\`\`cpp
CombatEvent event_log[MAX_EVENTS];
int event_count;
\`\`\`

During combat, instead of only printing:
\`\`\`cpp
CombatEvent& ev = w.event_log[w.event_count++];
ev.src = attacker;
ev.target = target;
ev.dmg = dmg;
ev.hp_after = w.hp[target];
ev.killed = (w.hp[target] <= 0);
\`\`\`

The event is a value — no allocation, no pointer, no string. It lives in the fixed array inside WorldState.

## Key Concepts
- CombatEvent: POD struct with 5 fields — source, target, damage, hp_after, killed
- event_log[MAX_EVENTS]: fixed-size array inside WorldState, no heap
- event_count: write cursor — how many events have been recorded
- Event sourcing: record what happened, not just the result
- Structured data vs text: a struct is queryable, parseable, comparable; a cout line is not

## Performance Insight
Each CombatEvent is 20 bytes (4 ints + 1 bool padded to 4). MAX_EVENTS = 64 means 1,280 bytes for the entire log. This fits in L1 cache. Writing an event: 5 field assignments = 5 store instructions. Reading the log to print: sequential scan, cache-friendly. Cost per event: under 5 nanoseconds.

## Memory Insight
event_log lives inside WorldState — it is part of the struct, not a separate allocation. When WorldState is zero-initialized (\`w={}\`), event_log is zeroed too. event_count starts at 0. No new/delete. No malloc. No std::vector. Gate A: fully compliant.

## Your Task
Create a CombatEvent struct and a fixed-size log. Simulate 3 attacks, record each as an event, then print the log.

Expected output:
\`\`\`
EVENT|0|src=0|target=1|dmg=5|hp=10|killed=0
EVENT|1|src=0|target=1|dmg=5|hp=5|killed=0
EVENT|2|src=0|target=1|dmg=5|hp=0|killed=1
LOG_SIZE|3
\`\`\`

## Beginner Trap
**Forgetting to check event_count < MAX_EVENTS before writing.** If the log is full and you write past the end, you get a buffer overflow. Always guard: \`if (w.event_count < MAX_EVENTS)\`. In a real game, you would either wrap (ring buffer) or stop recording. For now, a simple bounds check is sufficient.

## Elite Insight
Event sourcing is used in financial systems (every transaction is an event), multiplayer games (every action is an event for netcode), and databases (write-ahead logs). Your CombatEvent log follows the same principle: the log is the source of truth, the current state is a projection of the log. Determinism verification becomes: compare two logs byte-for-byte.

## Systems Thinking Connection
The Space Shooter path records bullet-hit events. The Platformer path records damage events from stomps. The Robotics path records sensor readings as events. All four paths use event logs for the same reason: structured history enables replay, debugging, and verification.

## Skill Reinforcement
Lesson 36 added table-driven damage. This lesson captures those damage events in a log. Lesson 38 will read the log to display a combat feed in the HUD. Lesson 64 will compare logs between runs for replay verification.

## Mastery Check
Question: Why store hp_after in the event instead of computing it from the log?
Answer: Because hp_after captures the actual state after damage — including any clamping, armor, or future modifications. If you recompute from the log, you need to replay the entire sequence. Storing hp_after makes each event self-contained: you can read any single event and know the result without context.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;
const int MAX_EVENTS = 64;

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee
    {0},  // type 2: passive
};

struct CombatEvent {
    int src;
    int target;
    int dmg;
    int hp_after;
    bool killed;
};

int main() {
    int hp[MAX_E] = {30, 15, 15, 10};
    int damage_id[MAX_E] = {0, 1, 1, 2};
    bool alive[MAX_E] = {true, true, true, true};

    CombatEvent event_log[MAX_EVENTS];
    int event_count = 0;

    // TODO: Simulate 3 attacks: player (0) hits entity 1 three times
    // For each attack:
    //   1. Look up dmg from DAMAGE_TABLE
    //   2. Apply damage to hp[1]
    //   3. Record a CombatEvent in event_log[event_count]
    //      Set: src, target, dmg, hp_after, killed
    //   4. Increment event_count (with bounds check!)
    //   5. If hp <= 0: alive = false

    // TODO: Print the event log
    // For each event i from 0 to event_count:
    //   EVENT|i|src=S|target=T|dmg=D|hp=H|killed=K
    //   (killed: 1 if true, 0 if false)

    // TODO: Print LOG_SIZE|event_count

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;
const int MAX_EVENTS = 64;

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee
    {0},  // type 2: passive
};

struct CombatEvent {
    int src;
    int target;
    int dmg;
    int hp_after;
    bool killed;
};

int main() {
    int hp[MAX_E] = {30, 15, 15, 10};
    int damage_id[MAX_E] = {0, 1, 1, 2};
    bool alive[MAX_E] = {true, true, true, true};

    CombatEvent event_log[MAX_EVENTS];
    int event_count = 0;

    for (int atk = 0; atk < 3; atk++) {
        int dmg = DAMAGE_TABLE[damage_id[0]].base_dmg;
        hp[1] -= dmg;
        if (event_count < MAX_EVENTS) {
            CombatEvent& ev = event_log[event_count];
            ev.src = 0;
            ev.target = 1;
            ev.dmg = dmg;
            ev.hp_after = hp[1];
            ev.killed = (hp[1] <= 0);
            event_count++;
        }
        if (hp[1] <= 0) { alive[1] = false; }
    }

    for (int i = 0; i < event_count; i++) {
        CombatEvent& ev = event_log[i];
        cout << "EVENT|" << i << "|src=" << ev.src
             << "|target=" << ev.target << "|dmg=" << ev.dmg
             << "|hp=" << ev.hp_after << "|killed=" << (ev.killed ? 1 : 0) << endl;
    }
    cout << "LOG_SIZE|" << event_count << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "First event recorded", expectedOutput: "EVENT|0|src=0|target=1|dmg=5|hp=10|killed=0", isPattern: false },
      { id: "t2", description: "Second event recorded", expectedOutput: "EVENT|1|src=0|target=1|dmg=5|hp=5|killed=0", isPattern: false },
      { id: "t3", description: "Kill event recorded", expectedOutput: "EVENT|2|src=0|target=1|dmg=5|hp=0|killed=1", isPattern: false },
      { id: "t4", description: "Log size correct", expectedOutput: "LOG_SIZE|3", isPattern: false },
    ],
    hints: [
      "Use a for loop: for (int atk = 0; atk < 3; atk++) to repeat the attack 3 times.",
      "Always check event_count < MAX_EVENTS before writing to event_log. This prevents buffer overflow.",
      "Set ev.killed = (hp[1] <= 0) — this boolean captures whether the target died from this hit."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Event Log in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Event Log in the Game Loop

## Mental Model
Wire the CombatEvent log into the game pipeline. The combat pass (from Lesson 36) already finds adjacent enemies and applies damage. Now it also records each hit as a CombatEvent. The render function reads the log and prints a combat feed after the map. At the start of each tick, the event log is cleared (event_count = 0) so it only holds events from the current turn.

The pipeline per tick is now: clear event log → input → move player → combat (record events) → AI movement → render (print events).

## What Breaks Without This
Without clearing the log each tick, events accumulate indefinitely and the log fills up. Without recording events, the render function cannot show a combat feed. Without the log, the replay system (Lesson 64) cannot verify that two runs produced identical combat sequences.

## The Fix: Integrate CombatEvent into WorldState

Add to WorldState:
\`\`\`cpp
CombatEvent event_log[MAX_EVENTS];
int event_count;
\`\`\`

At the start of game_tick:
\`\`\`cpp
w.event_count = 0;  // clear log for this tick
\`\`\`

In the combat pass, after applying damage:
\`\`\`cpp
if (w.event_count < MAX_EVENTS) {
    CombatEvent& ev = w.event_log[w.event_count++];
    ev.src = 0; ev.target = i;
    ev.dmg = dmg; ev.hp_after = w.hp[i];
    ev.killed = (w.hp[i] <= 0);
}
\`\`\`

In renderWorld, after entity lines:
\`\`\`cpp
for (int i = 0; i < w.event_count; i++) {
    CombatEvent& ev = w.event_log[i];
    cout << "EVENT|" << i << "|src=" << ev.src
         << "|target=" << ev.target << "|dmg=" << ev.dmg
         << "|hp=" << ev.hp_after << "|killed=" << (ev.killed?1:0) << endl;
}
\`\`\`

## Key Concepts
- Per-tick log clearing: event_count = 0 at tick start — keeps the log scoped to current turn
- Event recording in combat pass: one CombatEvent per hit, bounds-checked
- Event printing in render: structured output after entity positions
- Log as data: events are structs in an array, not text on screen

## Performance Insight
Clearing the log is one assignment: \`event_count = 0;\`. The old events remain in memory but are invisible (event_count gates all reads). No memset needed. Recording an event is 5 field writes. Printing the log is a sequential scan. With typical 0-2 events per tick, the overhead is negligible.

## Memory Insight
CombatEvent is 20 bytes. MAX_EVENTS = 64 → 1,280 bytes added to WorldState. Total WorldState with event log is still under 4 KB. All stack-allocated inside the struct. Gate A: zero heap allocations.

## Your Task
Add CombatEvent and event_log to WorldState. Record events during combat and print them in renderWorld. The player moves right, then attacks the guard 3 times (killing it), then moves right.

Expected output includes:
\`\`\`
EVENT|0|src=0|target=1|dmg=5|hp=10|killed=0
EVENT|0|src=0|target=1|dmg=5|hp=5|killed=0
EVENT|0|src=0|target=1|dmg=5|hp=0|killed=1
RENDER|turn=5|entities=2
\`\`\`

## Beginner Trap
**Not clearing event_count at the start of each tick.** If you forget \`w.event_count = 0;\`, events from previous ticks accumulate. By tick 5, the log has events from all previous ticks mixed together. Each tick should see only its own events. Clear first, record second.

## Elite Insight
Overwatch's netcode uses event sourcing: every player action is an event, transmitted to the server, applied deterministically, and compared across clients. A mismatch triggers a rollback. Your event log is the same architecture: record → transmit (print) → compare. The scale differs by 6 orders of magnitude, but the pattern is identical.

## Mastery Check
Question: Why clear the log at the start of each tick instead of at the end?
Answer: Because the render function reads the log at the end of the tick. If you clear after render, the events are available for display. If you clear before render, you lose them. Clearing at the START of the next tick ensures the previous tick's events survive through rendering, then get replaced by the new tick's events.`,
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
    // TODO: Add event_log[MAX_EVENTS] and event_count
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

// TODO: Add event logging to game_tick
// 1. Clear event_count at start of tick
// 2. In combat pass, after applying damage, record CombatEvent
void game_tick(WorldState& w, Command cmd){
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
                // TODO: Record CombatEvent here
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

// TODO: Add event log printing to renderWorld
void renderWorld(const WorldState& w){
    int ac=0;
    for(int i=0;i<w.entity_count;i++){ if(w.alive[i]) ac++; }
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
    for(int i=0;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        cout<<"ENT|id="<<i<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")|hp="<<w.hp[i]<<endl;
    }
    // TODO: Print events from event_log
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','f','f','f','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
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

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','f','f','f','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Event recorded on first attack", expectedOutput: "EVENT|0|src=0|target=1|dmg=5|hp=10|killed=0", isPattern: false },
      { id: "g2", description: "Kill event recorded", expectedOutput: "EVENT|0|src=0|target=1|dmg=5|hp=0|killed=1", isPattern: false },
      { id: "g3", description: "No events on non-attack tick", expectedOutput: "RENDER|turn=1|entities=3", isPattern: false },
      { id: "g4", description: "Guard killed and removed", expectedOutput: "RENDER|turn=5|entities=2", isPattern: false },
      { id: "g5", description: "COMBAT trace still printed", expectedOutput: "COMBAT|src=0|target=1|dmg=5", isPattern: false },
    ],
    hints: [
      "Add CombatEvent event_log[MAX_EVENTS] and int event_count to WorldState. Set event_count=0 at the start of game_tick.",
      "Record the event AFTER applying damage and checking for kill — so hp_after and killed reflect the actual result.",
      "In renderWorld, loop from 0 to w.event_count and print each event with the EVENT| prefix format."
    ],
    estimatedMinutes: 12,
  },
};
