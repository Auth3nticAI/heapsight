import { Lesson } from "@/types/lesson";

export const lessonRPG39: Lesson = {
  id: "rpg-39-error-handling-discipline",
  title: "Error Handling Discipline",
  description: "Validate room data before loading. Bad input gets a fallback room, not a crash — graceful degradation without exceptions.",
  order: 39,
  xpReward: 100,
  tier: "pro",
  concepts: ["graceful degradation", "input validation", "fallback data", "error codes"],
  part1: {
    title: "Concept: Validate at the Boundary",
    type: "concept",
    instructions: `# Error Handling Discipline

## Mental Model
Errors enter your program at boundaries: file loading, user input, network data. Once data passes the boundary check, internal code can trust it. The discipline is: validate at the gate, trust inside the walls.

For our RPG, the boundary is loadRoom. Room data comes from a const string today, but in a real game it comes from a file. Files can be corrupt, truncated, or missing. loadRoom must validate the data before writing to WorldState. If validation fails, load a safe fallback room instead of crashing.

This is not exception handling — we use no exceptions. This is return-code validation: check a condition, branch on the result, continue with known-good data.

## What Breaks Without This
Without validation, a malformed room string causes:
- Out-of-bounds array access: room data shorter than W*H reads garbage memory
- No player spawn: missing '@' means entity 0 is uninitialized — pos_x[0] is random
- Too many entities: more than MAX_E entities overflows the entity arrays
- Wrong dimensions: a 5x5 room loaded as 10x10 reads past the data boundary

Any of these is undefined behavior in C++. The program might crash, corrupt memory silently, or produce wrong output. Validation prevents all of them.

## The Fix: validateRoom Function

\`\`\`cpp
struct RoomError {
    bool ok;
    int code;  // 0=ok, 1=null data, 2=size mismatch, 3=no player, 4=too many entities
};

RoomError validateRoom(const char* data, int dw, int dh) {
    RoomError err = {true, 0};
    if (data == nullptr) { err.ok = false; err.code = 1; return err; }
    int expected = dw * dh;
    int len = 0;
    while (data[len] != '\\0') len++;
    if (len < expected) { err.ok = false; err.code = 2; return err; }
    bool has_player = false;
    int entity_count = 0;
    for (int i = 0; i < expected; i++) {
        if (data[i] == '@') { has_player = true; entity_count++; }
        else if (data[i] == 'E' || data[i] == 'G') { entity_count++; }
    }
    if (!has_player) { err.ok = false; err.code = 3; return err; }
    if (entity_count > MAX_E) { err.ok = false; err.code = 4; return err; }
    return err;
}
\`\`\`

If validateRoom returns !ok, use a FALLBACK_ROOM — a minimal safe room with just a player.

## Key Concepts
- Boundary validation: check data at the point of entry, not deep inside the code
- Error struct: a simple POD struct with bool ok and int code — no exceptions, no strings
- Fallback data: a known-good minimal room that always works
- Early return: check → fail → return error. The happy path is at the end.
- Trust after validation: once loadRoom accepts the data, game_tick never checks room validity

## Performance Insight
validateRoom iterates the room data once — W*H characters (100 for a 10x10 room). That is one scan, 100 comparisons. It runs once per room load, not per tick. Cost: under 200 nanoseconds. Compared to the time saved debugging a corrupt room crash: infinite.

## Memory Insight
RoomError is 8 bytes (bool + int with padding). It lives on the stack, returned by value. The fallback room is a const string in the data segment. No heap allocations. Gate A: fully compliant.

## Your Task
Write a validateRoom function that checks for null data, size mismatch, missing player, and entity overflow. Test it against 4 room strings — one valid, three invalid.

Expected output:
\`\`\`
VALIDATE|room=valid|ok=1|code=0
VALIDATE|room=short|ok=0|code=2
VALIDATE|room=no_player|ok=0|code=3
VALIDATE|room=overflow|ok=0|code=4
\`\`\`

## Beginner Trap
**Using exceptions (try/catch/throw) for room validation.** Exceptions allocate heap memory for the exception object, unwind the stack, and break determinism. In game engines, exceptions are typically banned. Error codes and early returns give the same control flow without the overhead.

## Elite Insight
Valve's Source engine validates all map data at load time. If a BSP file is corrupt, the engine loads a fallback "error room" instead of crashing. Your validateRoom + FALLBACK_ROOM follows the same pattern. Production games never crash on bad data — they degrade gracefully.

## Systems Thinking Connection
The Space Shooter path validates wave definition files. The Platformer path validates level data. The Robotics path validates sensor configuration. All four paths implement boundary validation with fallback data. The domain differs; the discipline is identical.

## Skill Reinforcement
Lesson 33 introduced loadRoom. This lesson adds validation before loading. Lesson 40 (milestone) will prove that the entire pipeline — validation, loading, combat, rendering — works together without crashes on any input.

## Mastery Check
Question: Why return a struct (RoomError) instead of a simple bool?
Answer: Because the error code tells you WHAT failed, not just that something failed. A bool says "bad room". An error code says "no player character found" — which is actionable. The caller can print a diagnostic, choose a specific fallback, or log the exact failure for debugging.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

struct RoomError {
    bool ok;
    int code;  // 0=ok, 1=null, 2=size, 3=no player, 4=overflow
};

// TODO: Write validateRoom(const char* data, int dw, int dh)
// Check:
//   1. data != nullptr (code=1 if null)
//   2. strlen(data) >= dw*dh (code=2 if too short)
//   3. data contains '@' (code=3 if no player)
//   4. total entities <= MAX_E (code=4 if overflow)
// Return RoomError with ok=true/false and code

int main() {
    const char* valid_room =
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

    const char* short_room = "##@#";

    const char* no_player_room =
        "##########"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "##########";

    const char* overflow_room =
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "@EEEEEEEEE";

    // TODO: Validate each room and print results
    // VALIDATE|room=NAME|ok=0or1|code=N

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

struct RoomError {
    bool ok;
    int code;
};

RoomError validateRoom(const char* data, int dw, int dh) {
    RoomError err = {true, 0};
    if (data == nullptr) { err.ok = false; err.code = 1; return err; }
    int expected = dw * dh;
    int len = 0;
    while (data[len] != '\\0') len++;
    if (len < expected) { err.ok = false; err.code = 2; return err; }
    bool has_player = false;
    int entity_count = 0;
    for (int i = 0; i < expected; i++) {
        if (data[i] == '@') { has_player = true; entity_count++; }
        else if (data[i] == 'E' || data[i] == 'G') { entity_count++; }
    }
    if (!has_player) { err.ok = false; err.code = 3; return err; }
    if (entity_count > MAX_E) { err.ok = false; err.code = 4; return err; }
    return err;
}

int main() {
    const char* valid_room =
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

    const char* short_room = "##@#";

    const char* no_player_room =
        "##########"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "#........#"
        "##########";

    const char* overflow_room =
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "EEEEEEEEEE"
        "@EEEEEEEEE";

    RoomError r;
    r = validateRoom(valid_room, 10, 10);
    cout << "VALIDATE|room=valid|ok=" << r.ok << "|code=" << r.code << endl;
    r = validateRoom(short_room, 10, 10);
    cout << "VALIDATE|room=short|ok=" << r.ok << "|code=" << r.code << endl;
    r = validateRoom(no_player_room, 10, 10);
    cout << "VALIDATE|room=no_player|ok=" << r.ok << "|code=" << r.code << endl;
    r = validateRoom(overflow_room, 10, 10);
    cout << "VALIDATE|room=overflow|ok=" << r.ok << "|code=" << r.code << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Valid room passes", expectedOutput: "VALIDATE|room=valid|ok=1|code=0", isPattern: false },
      { id: "t2", description: "Short room detected", expectedOutput: "VALIDATE|room=short|ok=0|code=2", isPattern: false },
      { id: "t3", description: "Missing player detected", expectedOutput: "VALIDATE|room=no_player|ok=0|code=3", isPattern: false },
      { id: "t4", description: "Entity overflow detected", expectedOutput: "VALIDATE|room=overflow|ok=0|code=4", isPattern: false },
    ],
    hints: [
      "Count string length with a while loop: while (data[len] != '\\0') len++. Compare len to dw*dh.",
      "Scan the room data for '@', 'E', and 'G' characters to count entities and check for a player.",
      "Return early on each failure. The first check that fails determines the error code."
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Validated Loading with Fallback Room",
    type: "game_builder",
    instructions: `# Build: Validated Loading with Fallback Room

## Mental Model
Wire validateRoom into the game pipeline. Before loadRoom processes room data, validateRoom checks it. If validation fails, the game uses FALLBACK_ROOM — a minimal safe room with one player and walls. The game loop continues either way. The player sees a room, even if it is the fallback. No crash, no undefined behavior.

Pipeline: validateRoom → (pass: loadRoom with data) or (fail: loadRoom with FALLBACK_ROOM) → game_tick → renderWorld → renderHUD.

## What Breaks Without This
Without validation + fallback:
- Corrupt room data → undefined behavior → crash or silent corruption
- Missing player → entity 0 uninitialized → position is garbage → movement writes to random memory
- Too many entities → array overflow → stack corruption

With validation + fallback:
- Corrupt room data → fallback room → game runs → player sees a safe room
- The error is logged, not hidden. But the game does not crash.

## The Fix: Validate Before Load

\`\`\`cpp
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

// In main or a loadLevel function:
RoomError err = validateRoom(room_data, W, H);
if (!err.ok) {
    cout << "ERROR|code=" << err.code << "|using_fallback" << endl;
    loadRoom(w, FALLBACK_ROOM, W, H, seed);
} else {
    loadRoom(w, room_data, W, H, seed);
}
\`\`\`

## Key Concepts
- Validate-then-load: two-step loading — check first, load second
- Fallback room: a known-safe room that always passes validation
- Error logging: print the error code so the developer knows what failed
- Graceful degradation: the game runs at reduced quality rather than crashing
- No exceptions: pure if/else branching on error codes

## Performance Insight
Validation runs once per room load. The fallback room is a const string — already in the binary. Branching on err.ok is one comparison. The "cost" of error handling is one function call + one branch. The cost of NOT handling errors is a crash that stops the game forever.

## Memory Insight
FALLBACK_ROOM is in the read-only data segment — same as ROOM_DATA. RoomError is 8 bytes on the stack. No heap allocations. Gate A: fully compliant.

## Your Task
Add validateRoom to the game loop. Test with two room loads: one valid, one invalid (no player). The invalid room should trigger the fallback. Both should produce valid game output.

Expected output includes:
\`\`\`
VALIDATE|ok=1|code=0
LOAD|room=10x10|entities=3
VALIDATE|ok=0|code=3
ERROR|code=3|using_fallback
LOAD|room=10x10|entities=1
HUD|hp=30|turn=1|enemies=0
\`\`\`

## Beginner Trap
**Loading the room first, then validating after.** If you call loadRoom before validateRoom, the damage is already done — corrupt data has been written to WorldState. Validate FIRST, then load. The order is non-negotiable.

## Elite Insight
Minecraft validates chunk data before loading it into the world. Corrupt chunks are replaced with empty terrain. The world generation seed ensures the replacement is deterministic. Your fallback room serves the same role: a safe, deterministic replacement for bad data.

## Mastery Check
Question: Should the fallback room itself be validated?
Answer: In a production system, yes — validate the fallback at startup to guarantee it passes. In our case, the fallback is a hardcoded const that we can verify by inspection. But defensive programming says: trust nothing, validate everything. A unit test that validates the fallback room is the correct answer.`,
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

struct RoomError {
    bool ok;
    int code;
};

// TODO: Write validateRoom(const char* data, int dw, int dh)

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

const char BAD_ROOM[] =
    "##########"
    "#........#"
    "#........#"
    "#........#"
    "#........#"
    "#........#"
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

    // TODO: Validate ROOM_DATA, load it (or fallback) if valid
    // Print: VALIDATE|ok=O|code=C
    loadRoom(w, ROOM_DATA, W, H, 42);
    Command cmd=captureInput('d');
    game_tick(w,cmd);
    renderWorld(w);
    renderHUD(w);

    cout<<"---"<<endl;

    // TODO: Validate BAD_ROOM, detect missing player, use FALLBACK_ROOM
    // Print: VALIDATE|ok=O|code=C
    // Print: ERROR|code=C|using_fallback (if failed)
    loadRoom(w, BAD_ROOM, W, H, 99);
    cmd=captureInput('d');
    game_tick(w,cmd);
    renderWorld(w);
    renderHUD(w);

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

struct RoomError {
    bool ok;
    int code;
};

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

const char BAD_ROOM[] =
    "##########"
    "#........#"
    "#........#"
    "#........#"
    "#........#"
    "#........#"
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

    RoomError err=validateRoom(ROOM_DATA,W,H);
    cout<<"VALIDATE|ok="<<err.ok<<"|code="<<err.code<<endl;
    if(!err.ok){
        cout<<"ERROR|code="<<err.code<<"|using_fallback"<<endl;
        loadRoom(w,FALLBACK_ROOM,W,H,42);
    } else {
        loadRoom(w,ROOM_DATA,W,H,42);
    }
    Command cmd=captureInput('d');
    game_tick(w,cmd);
    renderWorld(w);
    renderHUD(w);

    cout<<"---"<<endl;

    err=validateRoom(BAD_ROOM,W,H);
    cout<<"VALIDATE|ok="<<err.ok<<"|code="<<err.code<<endl;
    if(!err.ok){
        cout<<"ERROR|code="<<err.code<<"|using_fallback"<<endl;
        loadRoom(w,FALLBACK_ROOM,W,H,99);
    } else {
        loadRoom(w,BAD_ROOM,W,H,99);
    }
    cmd=captureInput('d');
    game_tick(w,cmd);
    renderWorld(w);
    renderHUD(w);

    return 0;
}`,
    tests: [
      { id: "g1", description: "Valid room passes validation", expectedOutput: "VALIDATE|ok=1|code=0", isPattern: false },
      { id: "g2", description: "Valid room loads normally", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g3", description: "Bad room fails validation", expectedOutput: "VALIDATE|ok=0|code=3", isPattern: false },
      { id: "g4", description: "Fallback room used on error", expectedOutput: "ERROR|code=3|using_fallback", isPattern: false },
      { id: "g5", description: "Fallback room loads with 1 entity", expectedOutput: "LOAD|room=10x10|entities=1", isPattern: false },
      { id: "g6", description: "Fallback HUD shows 0 enemies", expectedOutput: "HUD|hp=30|turn=1|enemies=0", isPattern: false },
    ],
    hints: [
      "Write validateRoom the same way as Part 1: check null, length, player, entity count. Return RoomError.",
      "Before each loadRoom call, validate first. If !err.ok, print ERROR and load FALLBACK_ROOM instead.",
      "The BAD_ROOM has no '@' character, so validateRoom should return code=3 (no player)."
    ],
    estimatedMinutes: 12,
  },
};
