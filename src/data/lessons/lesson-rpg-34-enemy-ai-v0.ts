import { Lesson } from "@/types/lesson";

export const lessonRPG34: Lesson = {
  id: "rpg-34-enemy-ai-v0",
  title: "Enemy AI v0 (Table-Driven)",
  description: "Enemy behavior controlled by a data table lookup — adding a new AI type means adding a row, not writing new code.",
  order: 34,
  xpReward: 100,
  tier: "pro",
  concepts: ["table-driven AI", "behavior as data", "data lookup", "strategy pattern"],
  part1: {
    title: "Concept: Behavior as Data Lookup",
    type: "concept",
    instructions: `# Enemy AI v0 (Table-Driven)

## Mental Model
Enemy behavior is not code — it is data. A behavior table maps an integer ID to movement parameters. The AI system reads the table, applies the parameters, and moves the entity. To add a new enemy type, you add a row to the table. The AI system code never changes.

This is the same insight as Lesson 33 (levels as data): separate the engine (AI system) from the content (behavior definitions). The engine is generic. The content is specific.

## What Breaks Without This
Right now, enemy AI is hardcoded in game_tick: every enemy chases the player on the x-axis. Want a guard that stands still? Add an if-statement. Want a patrol enemy? Add another if-statement. Want a ranged attacker? Another branch. After 5 enemy types, the AI code is an unreadable mess of nested conditions.

With a behavior table, each enemy type is a row of numbers. The AI loop is one generic pass that reads the table and applies movement. Five enemy types? Five rows. Fifty enemy types? Fifty rows. Same code.

## The Fix: BehaviorRow Table

Define a struct that holds movement parameters:

\`\`\`cpp
struct BehaviorRow {
    int chase_x;  // 1 = chase player on x-axis
    int chase_y;  // 1 = chase player on y-axis
};
\`\`\`

Build a const table:

\`\`\`cpp
const int BH_IDLE = 0;
const int BH_CHASE_X = 1;
const int BH_CHASE_Y = 2;

const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},  // BH_IDLE: no movement
    {1, 0},  // BH_CHASE_X: chase on x only
    {0, 1},  // BH_CHASE_Y: chase on y only
};
\`\`\`

The AI loop looks up the table for each entity:

\`\`\`cpp
const BehaviorRow& bh = BEHAVIOR_TABLE[behavior_id[i]];
if (bh.chase_x) {
    if (ex[i] < px) ex[i]++;
    else if (ex[i] > px) ex[i]--;
}
if (bh.chase_y) {
    if (ey[i] < py) ey[i]++;
    else if (ey[i] > py) ey[i]--;
}
\`\`\`

Adding a new behavior (e.g., chase on both axes) means adding one row: \`{1, 1}\`. Zero code changes to the AI loop.

## Key Concepts
- Behavior ID: integer index into the behavior table
- BehaviorRow: struct holding movement parameters as data
- Table lookup: \`BEHAVIOR_TABLE[id]\` returns the row for that behavior
- Generic AI loop: same code processes all behavior types via table data

## Performance Insight
Table lookup is an array index — one multiplication + one memory access. With 3 behavior types, the entire table fits in a single cache line (24 bytes). The lookup is effectively free. Compare this to a chain of if-else branches, which the CPU branch predictor may mispredict.

## Memory Insight
\`const BehaviorRow BEHAVIOR_TABLE[]\` lives in the read-only data segment. Zero heap allocation. Each entity stores one int (behavior_id) — 4 bytes per entity. With MAX_ENTITIES = 16, that is 64 bytes total. Gate A: table is const, never modified during the game loop.

## Your Task
Implement the AI loop that uses BEHAVIOR_TABLE to move 3 entities with different behaviors. Run 3 ticks and print AI trace lines.

Expected output includes:
\`\`\`
AI|tick=3|id=0|bh=1|pos=(4,3)
AI|tick=3|id=1|bh=0|pos=(8,3)
AI|tick=3|id=2|bh=2|pos=(4,5)
\`\`\`

## Beginner Trap
**Using if-else to check behavior_id instead of looking up the table.** If you write \`if (behavior_id[i] == 1) { chase... }\`, you have defeated the purpose. The whole point is that the AI loop reads parameters FROM the table. The loop body should not contain behavior-specific branches — only parameter-driven movement.

## Elite Insight
Diablo 2 stores monster AI parameters in a data table called MonStats.txt. Each monster type is a row with chase speed, attack range, flee threshold, and targeting priority. The AI system reads these numbers and applies generic movement/combat logic. Your BehaviorRow is a minimal version of the same architecture. Scaling from 3 rows to 300 rows requires zero code changes.

## Systems Thinking Connection
The Space Shooter path uses enemy type tables for spawn patterns. The Platformer path uses data tables for enemy patrol parameters. The Robotics path uses configuration tables for sensor behavior. All four paths separate behavior parameters from behavior logic using the same table-driven pattern.

## Skill Reinforcement
Lesson 33 made levels data-driven. This lesson makes AI data-driven. The pattern repeats: hardcoded logic → parameterized function → data table. Lesson 35 (milestone) will prove that the entire system — rooms, input, AI, rendering — works together with multiple enemies.

## Mastery Check
Question: How would you add an enemy that chases on both X and Y axes?
Answer: Add one row to the table: \`{1, 1}\`. Define \`const int BH_CHASE_XY = 3;\` and assign it to the entity. The AI loop already handles both chase_x and chase_y independently — no code changes needed.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;

const int BH_IDLE = 0;
const int BH_CHASE_X = 1;
const int BH_CHASE_Y = 2;

struct BehaviorRow {
    int chase_x;
    int chase_y;
};

const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},  // BH_IDLE: no movement
    {1, 0},  // BH_CHASE_X: chase on x only
    {0, 1},  // BH_CHASE_Y: chase on y only
};

int main() {
    int px = 5, py = 5;

    int ex[MAX_E] = {1, 8, 4};
    int ey[MAX_E] = {3, 3, 8};
    int behavior_id[MAX_E] = {BH_CHASE_X, BH_IDLE, BH_CHASE_Y};
    int entity_count = 3;

    for (int t = 1; t <= 3; t++) {
        for (int i = 0; i < entity_count; i++) {
            // TODO: Look up BEHAVIOR_TABLE[behavior_id[i]]
            // If chase_x: move ex[i] toward px
            // If chase_y: move ey[i] toward py
            // Print: AI|tick=T|id=I|bh=B|pos=(X,Y)
        }
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;

const int BH_IDLE = 0;
const int BH_CHASE_X = 1;
const int BH_CHASE_Y = 2;

struct BehaviorRow {
    int chase_x;
    int chase_y;
};

const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},  // BH_IDLE: no movement
    {1, 0},  // BH_CHASE_X: chase on x only
    {0, 1},  // BH_CHASE_Y: chase on y only
};

int main() {
    int px = 5, py = 5;

    int ex[MAX_E] = {1, 8, 4};
    int ey[MAX_E] = {3, 3, 8};
    int behavior_id[MAX_E] = {BH_CHASE_X, BH_IDLE, BH_CHASE_Y};
    int entity_count = 3;

    for (int t = 1; t <= 3; t++) {
        for (int i = 0; i < entity_count; i++) {
            const BehaviorRow& bh = BEHAVIOR_TABLE[behavior_id[i]];
            if (bh.chase_x) {
                if (ex[i] < px) ex[i]++;
                else if (ex[i] > px) ex[i]--;
            }
            if (bh.chase_y) {
                if (ey[i] < py) ey[i]++;
                else if (ey[i] > py) ey[i]--;
            }
            cout << "AI|tick=" << t << "|id=" << i
                 << "|bh=" << behavior_id[i]
                 << "|pos=(" << ex[i] << "," << ey[i] << ")" << endl;
        }
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Chase-x enemy moves toward player", expectedOutput: "AI|tick=3|id=0|bh=1|pos=(4,3)", isPattern: false },
      { id: "t2", description: "Idle enemy stays in place", expectedOutput: "AI|tick=1|id=1|bh=0|pos=(8,3)", isPattern: false },
      { id: "t3", description: "Chase-y enemy moves toward player", expectedOutput: "AI|tick=3|id=2|bh=2|pos=(4,5)", isPattern: false },
    ],
    hints: [
      "Use const BehaviorRow& bh = BEHAVIOR_TABLE[behavior_id[i]] to look up the behavior for each entity.",
      "If bh.chase_x is 1, compare ex[i] to px and increment or decrement. Same for bh.chase_y with ey[i] and py.",
      "The idle behavior has chase_x=0 and chase_y=0, so the if-checks skip all movement. No special case needed."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Table-Driven AI in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Table-Driven AI in the Game Loop

## Mental Model
Wire the behavior table into the full game pipeline. WorldState now carries a \`behavior_id\` array alongside position, HP, and alive. The room data defines enemy types: 'E' for chase enemies, 'G' for idle guards. loadRoom assigns behavior_id based on the room character. game_tick reads the behavior table to move each enemy.

The full pipeline: loadRoom → captureInput → game_tick (with table-driven AI) → renderWorld.

## What Breaks Without This
Without behavior_id in WorldState, every enemy behaves identically. The hardcoded chase logic treats all enemies the same. With behavior_id, each enemy is a unique type defined by data. The room designer controls enemy behavior by choosing which character to place — no code changes needed.

## The Fix: behavior_id in WorldState + Table AI

Add \`int behavior_id[MAX_E]\` to WorldState. Update loadRoom to set behavior_id based on room characters:
- '@' → player, behavior_id = 0 (input-driven, AI ignores)
- 'E' → chase enemy, behavior_id = BH_CHASE_X
- 'G' → guard enemy, behavior_id = BH_IDLE

Update the AI loop in game_tick to use the behavior table instead of hardcoded chase logic. Print an AI trace line for each enemy after movement.

## Key Concepts
- behavior_id stored per entity in WorldState parallel arrays
- Room characters map to behavior IDs during loading
- AI system reads BEHAVIOR_TABLE, never checks room characters
- Adding a new enemy type: new room char → new behavior_id assignment → new table row

## Performance Insight
The behavior table lookup adds one array index per entity per tick. With 3 entities, that is 3 lookups per tick — 3 memory reads from a table that fits in a single cache line. The performance cost is literally unmeasurable.

## Memory Insight
behavior_id adds MAX_E ints to WorldState — 64 bytes with MAX_E=16. The BehaviorRow table is const, stored in read-only data. Zero heap allocation. Gate A: no new allocations in the game loop.

## Your Task
Add behavior_id to WorldState, update loadRoom for 'E' and 'G' characters, and replace the hardcoded AI in game_tick with behavior table lookup. Run 5 ticks and verify that chase enemies move while guards stay put.

Expected output (final tick):
\`\`\`
INPUT|tick=5|dx=1|dy=0|atk=0
AI|tick=5|id=1|bh=0|pos=(8,3)
AI|tick=5|id=2|bh=1|pos=(4,5)
RENDER|turn=5|entities=3
ENT|id=0|pos=(4,3)|hp=30
ENT|id=1|pos=(8,3)|hp=15
ENT|id=2|pos=(4,5)|hp=10
\`\`\`

## Beginner Trap
**Checking the room character during game_tick to decide movement.** The room character is consumed during loadRoom and never referenced again. game_tick should read behavior_id from WorldState, look up the table, and apply parameters. If game_tick references room data, you have coupled the AI to the level format.

## Elite Insight
The Strategy pattern in OOP uses virtual function dispatch to select behavior at runtime. Table-driven AI achieves the same result with an integer index and a const array — no virtual functions, no vtable, no heap allocation, no indirection. In performance-critical game loops, the table approach is strictly superior. The Strategy pattern's flexibility comes from data tables, not from inheritance hierarchies.

## Mastery Check
Question: How would you add a new enemy type that chases on the y-axis?
Answer: Three steps: (1) Add \`const int BH_CHASE_Y = 2;\` and \`{0, 1}\` to the behavior table. (2) Add a new room character (e.g., 'Y') to loadRoom that sets behavior_id = BH_CHASE_Y. (3) Place 'Y' in the room data. No changes to game_tick or the AI loop.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;

struct BehaviorRow {
    int chase_x;
    int chase_y;
};

const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},  // BH_IDLE
    {1, 0},  // BH_CHASE_X
};

struct Command {
    int dx; int dy; bool attack;
};

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1;
    else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1;
    else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    return cmd;
}

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    // TODO: Add behavior_id[MAX_E] array here
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

const char ROOM_DATA[] =
    "##########"
    "#@.......#"
    "#........#"
    "#.......G#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#........#"
    "##########";

void loadRoom(WorldState& w, const char* data, int dw, int dh, unsigned int seed){
    w={};
    w.seed=seed;
    rng_seed(w.rng,seed);
    w.entity_count=0;
    for(int y=0;y<dh&&y<H;y++){
        for(int x=0;x<dw&&x<W;x++){
            char c=data[y*dw+x];
            if(c=='@'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=30; w.alive[id]=true;
                // TODO: Set behavior_id for player
                w.grid[y][x]='.';
            } else if(c=='E'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=10; w.alive[id]=true;
                // TODO: Set behavior_id = BH_CHASE_X
                w.grid[y][x]='.';
            } else if(c=='G'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=15; w.alive[id]=true;
                // TODO: Set behavior_id = BH_IDLE
                w.grid[y][x]='.';
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w, Command cmd){
    w.turn++;
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    // TODO: Replace hardcoded chase with behavior table lookup
    // For each enemy (i=1..entity_count):
    //   Look up BEHAVIOR_TABLE[w.behavior_id[i]]
    //   If chase_x: move toward player on x
    //   Print: AI|tick=T|id=I|bh=B|pos=(X,Y)
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        int edx=0;
        if(w.pos_x[i]<w.pos_x[0]) edx=1;
        else if(w.pos_x[i]>w.pos_x[0]) edx=-1;
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL)
            w.pos_x[i]=enx;
    }
}

void renderWorld(const WorldState& w){
    int ac=0;
    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i]) ac++;
    }
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
    for(int i=0;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        cout<<"ENT|id="<<i<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")|hp="<<w.hp[i]<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','d','s','s','d'};
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
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;

struct BehaviorRow {
    int chase_x;
    int chase_y;
};

const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},  // BH_IDLE
    {1, 0},  // BH_CHASE_X
};

struct Command {
    int dx; int dy; bool attack;
};

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1;
    else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1;
    else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    return cmd;
}

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int behavior_id[MAX_E];
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

const char ROOM_DATA[] =
    "##########"
    "#@.......#"
    "#........#"
    "#.......G#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#........#"
    "##########";

void loadRoom(WorldState& w, const char* data, int dw, int dh, unsigned int seed){
    w={};
    w.seed=seed;
    rng_seed(w.rng,seed);
    w.entity_count=0;
    for(int y=0;y<dh&&y<H;y++){
        for(int x=0;x<dw&&x<W;x++){
            char c=data[y*dw+x];
            if(c=='@'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=30; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.grid[y][x]='.';
            } else if(c=='E'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=10; w.alive[id]=true;
                w.behavior_id[id]=BH_CHASE_X;
                w.grid[y][x]='.';
            } else if(c=='G'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=15; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.grid[y][x]='.';
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w, Command cmd){
    w.turn++;
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
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
        cout<<"AI|tick="<<w.turn<<"|id="<<i<<"|bh="<<w.behavior_id[i]<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")"<<endl;
    }
}

void renderWorld(const WorldState& w){
    int ac=0;
    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i]) ac++;
    }
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
    for(int i=0;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        cout<<"ENT|id="<<i<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")|hp="<<w.hp[i]<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','d','s','s','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loaded with 3 entities", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g2", description: "Guard stays idle", expectedOutput: "AI|tick=5|id=1|bh=0|pos=(8,3)", isPattern: false },
      { id: "g3", description: "Chaser tracks player", expectedOutput: "AI|tick=5|id=2|bh=1|pos=(4,5)", isPattern: false },
      { id: "g4", description: "Player position correct", expectedOutput: "ENT|id=0|pos=(4,3)|hp=30", isPattern: false },
      { id: "g5", description: "Behavior table drives AI", expectedOutput: "AI|tick=1|id=2|bh=1|pos=(4,5)", isPattern: false },
    ],
    hints: [
      "Add int behavior_id[MAX_E] to WorldState. In loadRoom, set w.behavior_id[id] = BH_CHASE_X for 'E' and BH_IDLE for 'G'.",
      "In game_tick, replace the hardcoded chase with: const BehaviorRow& bh = BEHAVIOR_TABLE[w.behavior_id[i]]; then check bh.chase_x.",
      "Print the AI trace after moving each enemy: AI|tick=T|id=I|bh=B|pos=(X,Y) where B is the behavior_id value."
    ],
    estimatedMinutes: 12,
  },
};
