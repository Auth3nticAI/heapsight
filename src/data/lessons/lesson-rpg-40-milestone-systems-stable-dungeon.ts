import { Lesson } from "@/types/lesson";

export const lessonRPG40: Lesson = {
  id: "rpg-40-milestone-systems-stable-dungeon",
  title: "Milestone: Systems-Stable Dungeon",
  description: "All systems integrated: validated loading, table-driven AI, table-driven combat, event logging, and HUD — running a full dungeon scenario without crashes.",
  order: 40,
  xpReward: 300,
  tier: "pro",
  concepts: ["integration milestone", "system composition", "deterministic pipeline", "full tick verification"],
  part1: {
    title: "Concept: Integration as Architecture Proof",
    type: "concept",
    instructions: `# Milestone: Systems-Stable Dungeon

## Mental Model
A milestone is not a new feature. A milestone is proof that every feature you have built works together. This lesson runs a full dungeon scenario: validate room → load room → run 10 ticks of input → combat with damage tables → event logging → HUD overlay → verify deterministic output.

Every system you built in Lessons 31-39 is active simultaneously:
- **Input module** (L31): captureInput parses characters into Commands
- **Render module** (L32): renderWorld projects WorldState to output
- **World loading** (L33): loadRoom parses room strings into WorldState
- **Table-driven AI** (L34): BEHAVIOR_TABLE drives enemy movement
- **Multi-enemy arena** (L35): multiple entity types coexist
- **Damage tables** (L36): DAMAGE_TABLE drives combat damage
- **Event log** (L37): CombatEvent structs record every hit
- **HUD overlay** (L38): renderHUD projects status from WorldState
- **Error handling** (L39): validateRoom catches bad data before loading

If any system has a bug, this milestone exposes it. If the output matches the expected trace, every system is correct.

## What Breaks Without This
Without integration testing, individual systems might work in isolation but fail when composed. Common integration bugs:
- Event log not cleared between ticks (L37 + L36 interaction)
- HUD reads stale event data (L38 + L37 interaction)
- AI moves into player's combat range unexpectedly (L34 + L36 interaction)
- Validation passes bad data that crashes loadRoom (L39 + L33 interaction)

This milestone catches all of them.

## The Scenario

Room: 10x10 dungeon with player, one guard (idle), one chaser.
Seed: 42 (deterministic).
Input sequence: 'd','d','f','f','f','s','s','s','s','d'
- Ticks 1-2: Player walks right toward guard
- Ticks 3-5: Player attacks guard (3 hits, 15 HP, guard dies at tick 5)
- Ticks 6-9: Player walks down
- Tick 10: Player walks right

The chaser (E) moves toward the player each tick. The guard (G) is idle (doesn't move). After the guard dies, only the chaser remains.

## Key Concepts
- Integration test: running all systems together to verify correct composition
- Deterministic output: same seed + same input → identical trace every run
- Pipeline verification: input → move → combat → AI → render → HUD, every tick
- System independence: each system reads/writes WorldState without knowing about other systems

## Performance Insight
10 ticks with 3 entities: approximately 150 operations per tick (movement, combat check, AI loop, render, HUD). Total: ~1,500 operations. On modern hardware: under 1 microsecond total. The bottleneck is cout formatting, not computation.

## Memory Insight
WorldState with all systems: position arrays (128B) + HP (64B) + alive (16B) + behavior_id (64B) + damage_id (64B) + grid (100B) + event_log (1280B) + inventory (20B) + misc (32B) ≈ 1,768 bytes total. Everything on the stack. Gate A: zero heap allocations across all 10 ticks.

## Your Task
Write a standalone integration test. Create a WorldState, set up 3 entities manually, run 5 ticks with specific inputs, and verify the output matches expected traces.

Expected output:
\`\`\`
SETUP|entities=3
TICK|1|hp0=30|hp1=15|hp2=10
TICK|2|hp0=30|hp1=15|hp2=10
TICK|3|hp0=30|hp1=10|hp2=10
TICK|4|hp0=30|hp1=5|hp2=10
TICK|5|hp0=30|hp1=0|hp2=10
KILL_AT|tick=5
VERIFY|ok
\`\`\`

## Beginner Trap
**Skipping the verification step.** Running the scenario and eyeballing the output is not a test. A test compares actual output to expected values programmatically. If hp[1] after tick 5 is not 0, the test should print VERIFY|fail, not silently succeed.

## Elite Insight
Game studios run "smoke tests" — automated scenarios that exercise every system once. If the smoke test passes, the build is stable. If it fails, something broke. Your milestone IS a smoke test. Professional teams run these on every commit. A 10-tick scenario that verifies all systems is worth more than 100 unit tests that test systems in isolation.

## Systems Thinking Connection
Every path has a milestone at Lesson 40: Space Shooter proves shooting + waves + scoring. Platformer proves physics + collision + enemies. Robotics proves sensors + mapping + movement. All four paths prove the same thing: independently built systems compose correctly.

## Skill Reinforcement
This milestone validates Lessons 31-39. Lesson 41 begins Phase 5 (inventory system). The foundation must be solid before adding new systems. If this milestone fails, fix the bug before proceeding.

## Mastery Check
Question: If you change the RNG seed from 42 to 99, should the output change?
Answer: Possibly — the seed affects AI behavior if any AI uses RNG (our current AI is table-driven, not random, so the seed doesn't affect AI yet). But the principle is: same seed → same output. Different seed → potentially different output. Determinism means reproducibility, not constancy.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;
const int MAX_EVENTS = 64;

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // player
    {3},  // melee
    {0},  // passive
};

struct CombatEvent {
    int src; int target; int dmg; int hp_after; bool killed;
};

int main() {
    // Mini integration test — no full WorldState, just arrays
    int hp[MAX_E] = {30, 15, 10};
    int damage_id[MAX_E] = {0, 2, 1};
    bool alive[MAX_E] = {true, true, true};
    int pos_x[MAX_E] = {1, 3, 7};
    int entity_count = 3;
    CombatEvent log[MAX_EVENTS];
    int log_count = 0;

    cout << "SETUP|entities=" << entity_count << endl;

    // TODO: Simulate 5 ticks
    // Ticks 1-2: player moves right (pos_x[0]++)
    // Ticks 3-5: player attacks (adjacent to entity 1 when pos_x[0]==3)
    //   Look up DAMAGE_TABLE[damage_id[0]].base_dmg
    //   Apply to hp[1], record CombatEvent, check kill
    // After each tick, print:
    //   TICK|T|hp0=H0|hp1=H1|hp2=H2
    // If entity 1 dies, print: KILL_AT|tick=T

    // TODO: Verify hp[1] == 0 after tick 5
    // Print: VERIFY|ok or VERIFY|fail

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;
const int MAX_EVENTS = 64;

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // player
    {3},  // melee
    {0},  // passive
};

struct CombatEvent {
    int src; int target; int dmg; int hp_after; bool killed;
};

int main() {
    int hp[MAX_E] = {30, 15, 10};
    int damage_id[MAX_E] = {0, 2, 1};
    bool alive[MAX_E] = {true, true, true};
    int pos_x[MAX_E] = {1, 3, 7};
    int entity_count = 3;
    CombatEvent log[MAX_EVENTS];
    int log_count = 0;

    cout << "SETUP|entities=" << entity_count << endl;

    for (int tick = 1; tick <= 5; tick++) {
        if (tick <= 2) {
            pos_x[0]++;
        } else {
            // Attack: player adjacent to entity 1 (both at x=3)
            if (alive[1]) {
                int dist = abs(pos_x[0] - pos_x[1]);
                if (dist <= 1) {
                    int dmg = DAMAGE_TABLE[damage_id[0]].base_dmg;
                    hp[1] -= dmg;
                    if (log_count < MAX_EVENTS) {
                        CombatEvent& ev = log[log_count++];
                        ev.src = 0; ev.target = 1;
                        ev.dmg = dmg; ev.hp_after = hp[1];
                        ev.killed = (hp[1] <= 0);
                    }
                    if (hp[1] <= 0) {
                        alive[1] = false;
                        cout << "KILL_AT|tick=" << tick << endl;
                    }
                }
            }
        }
        cout << "TICK|" << tick << "|hp0=" << hp[0]
             << "|hp1=" << hp[1] << "|hp2=" << hp[2] << endl;
    }

    if (hp[1] == 0 && !alive[1]) {
        cout << "VERIFY|ok" << endl;
    } else {
        cout << "VERIFY|fail" << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Setup correct", expectedOutput: "SETUP|entities=3", isPattern: false },
      { id: "t2", description: "No damage ticks 1-2", expectedOutput: "TICK|2|hp0=30|hp1=15|hp2=10", isPattern: false },
      { id: "t3", description: "First attack lands", expectedOutput: "TICK|3|hp0=30|hp1=10|hp2=10", isPattern: false },
      { id: "t4", description: "Guard killed at tick 5", expectedOutput: "KILL_AT|tick=5", isPattern: false },
      { id: "t5", description: "Verification passes", expectedOutput: "VERIFY|ok", isPattern: false },
    ],
    hints: [
      "Ticks 1-2: just increment pos_x[0]. No combat. Ticks 3-5: player is at x=3, same as entity 1, so attack.",
      "Use DAMAGE_TABLE[damage_id[0]].base_dmg for damage (= 5). Entity 1 has 15 HP, so 3 hits kills it.",
      "Print KILL_AT on the tick where hp[1] first drops to 0 or below. Then set alive[1] = false."
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Full Pipeline Smoke Test",
    type: "game_builder",
    instructions: `# Build: Full Pipeline Smoke Test

## Mental Model
Run the complete game pipeline: validate room → load room → 10 ticks of mixed input (movement + combat) → verify final state. Every system from L31-L39 is active. The output must match the expected trace exactly. If it does, Phase 4 is complete and the foundation is solid for Phase 5 (inventory).

This is the final proof that your architecture scales: 9 independently-built systems compose into one working game, with zero heap allocations, deterministic output, and graceful error handling.

## What Breaks Without This
If any system has a latent bug:
- Wrong damage table index → combat deals wrong damage
- Event log not cleared → stale events in HUD
- AI moves wrong direction → enemy positions differ
- Validation passes bad data → crash on load

10 ticks is enough to expose most composition bugs. The longer the scenario, the more likely a latent bug surfaces.

## The Scenario

\`\`\`
Room: 10x10 dungeon
  ##########
  #@.G.....#
  #........#
  #........#
  #........#
  #....E...#
  #........#
  #........#
  #........#
  ##########

Entities:
  0: Player '@' at (1,1), hp=30, idle, dmg=player(5)
  1: Guard 'G' at (3,1), hp=15, idle, dmg=passive(0)
  2: Chaser 'E' at (5,5), hp=10, chase_x, dmg=melee(3)

Input: d, d, f, f, f, s, s, s, s, d
  Tick 1: move right → (2,1)
  Tick 2: move right → (3,1) — now adjacent to guard
  Tick 3: attack → guard hp=10 (COMBAT event)
  Tick 4: attack → guard hp=5 (COMBAT event)
  Tick 5: attack → guard hp=0 (KILL event)
  Tick 6-9: move down
  Tick 10: move right
\`\`\`

Wait — at tick 2, player moves to (3,1) which is the guard's position. That works because entities don't block movement in our system. The guard is at (3,1) and the player moves to (3,1). They overlap. Manhattan distance is 0, which is ≤ 1, so the player can attack.

## Key Concepts
- Full pipeline: validate → load → tick → render → HUD, repeated 10 times
- Deterministic verification: same seed + same input = same output, always
- System composition: input + movement + combat + AI + events + HUD, all active
- Smoke test: if it passes, the build is stable; if it fails, something is broken

## Performance Insight
10 ticks × 3 entities × full pipeline: ~300 total operations. Wall time: under 5 microseconds. cout formatting dominates. In a real game, you would run this smoke test silently (suppress cout) and check only final state.

## Memory Insight
WorldState total with all arrays: ~1,800 bytes. All on the stack. No dynamic allocation across 10 ticks. Gate A: zero heap allocations. This is the proof.

## Your Task
Wire everything together: validateRoom, loadRoom, game_tick, renderWorld, renderHUD. Run 10 ticks with the input sequence above. Verify the final state: guard dead, chaser alive, player at expected position.

Expected output includes:
\`\`\`
VALIDATE|ok=1|code=0
LOAD|room=10x10|entities=3
HUD|hp=30|turn=5|enemies=1
HUD|hp=30|turn=10|enemies=1
FINAL|player_hp=30|guard_alive=0|chaser_alive=1
\`\`\`

## Beginner Trap
**Not validating the room before loading.** In a milestone, every system must be active — including error handling. Even though you know ROOM_DATA is valid, the validate step proves the validation system works. Skip it and you have an untested code path.

## Elite Insight
Continuous integration (CI) pipelines run smoke tests on every commit. If the smoke test takes more than 10 seconds, developers skip it. Your 10-tick smoke test runs in microseconds — fast enough to run on every save. This is the engineering discipline that separates stable codebases from fragile ones.

## Mastery Check
Question: How would you add a second smoke test with a different room and input sequence?
Answer: Copy the pattern: new room string, new input array, new expected values. Run validateRoom, loadRoom, game_tick loop, then check final state. Each smoke test is independent — they share the same functions but different data. This is data-driven testing.`,
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
    {5},  // player
    {3},  // melee
    {0},  // passive
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
    int expected=dw*dh;
    int len=0;
    while(data[len]!='\0') len++;
    if(len<expected){err.ok=false;err.code=2;return err;}
    bool has_player=false;
    int ec=0;
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
}

int main(){
    WorldState w;

    // TODO: Validate ROOM_DATA and load (with fallback support)
    // TODO: Run 10 ticks with inputs: d,d,f,f,f,s,s,s,s,d
    // TODO: After each tick, call renderWorld and renderHUD
    // TODO: Print FINAL|player_hp=H|guard_alive=A|chaser_alive=A

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
    {5},  // player
    {3},  // melee
    {0},  // passive
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
    int expected=dw*dh;
    int len=0;
    while(data[len]!='\0') len++;
    if(len<expected){err.ok=false;err.code=2;return err;}
    bool has_player=false;
    int ec=0;
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

    char inputs[]={'d','d','f','f','f','s','s','s','s','d'};
    for(int i=0;i<10;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
        renderHUD(w);
    }

    cout<<"FINAL|player_hp="<<w.hp[0]
        <<"|guard_alive="<<(w.alive[1]?1:0)
        <<"|chaser_alive="<<(w.alive[2]?1:0)<<endl;

    return 0;
}`,
    tests: [
      { id: "g1", description: "Room validated successfully", expectedOutput: "VALIDATE|ok=1|code=0", isPattern: false },
      { id: "g2", description: "Room loaded with 3 entities", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g3", description: "Guard killed by tick 5", expectedOutput: "HUD|hp=30|turn=5|enemies=1", isPattern: false },
      { id: "g4", description: "Player survives all 10 ticks", expectedOutput: "HUD|hp=30|turn=10|enemies=1", isPattern: false },
      { id: "g5", description: "Final state verified", expectedOutput: "FINAL|player_hp=30|guard_alive=0|chaser_alive=1", isPattern: false },
    ],
    hints: [
      "Validate first, then load. Use the if/else pattern from L39: if (!err.ok) load fallback, else load normal.",
      "The input array has 10 characters. Loop from 0 to 9, calling captureInput, game_tick, renderWorld, renderHUD.",
      "After the loop, print FINAL with w.hp[0], w.alive[1], and w.alive[2]. The guard (index 1) should be dead."
    ],
    estimatedMinutes: 15,
  },
};
