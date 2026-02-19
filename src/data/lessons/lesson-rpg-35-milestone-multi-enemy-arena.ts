import { Lesson } from "@/types/lesson";

export const lessonRPG35: Lesson = {
  id: "rpg-35-milestone-multi-enemy-arena",
  title: "Milestone: Multi-Enemy Arena",
  description: "Five enemies, two AI types, data-driven rooms, modular pipeline — all systems proven stable at scale.",
  order: 35,
  xpReward: 200,
  tier: "pro",
  concepts: ["milestone", "batch processing", "system integration", "scale proof"],
  part1: {
    title: "Concept: Batch Processing Proof",
    type: "concept",
    instructions: `# Milestone: Multi-Enemy Arena

## Mental Model
Batch processing means: the same loop handles 1 entity or 100 entities with zero code changes. You have built this architecture across Lessons 31–34. This milestone proves it works at scale.

The test: 5 enemies with different behaviors. 5 ticks. 25 total AI operations. The AI loop does not know how many entities it will process. It reads entity_count and iterates. Whether that count is 1 or 5 or 50, the code is identical. Only the data changes.

## What This Proves
- **SoA arrays scale**: 5 entities means 5 reads per array per pass. Same pattern as 1 entity, same pattern as 500 entities.
- **Table-driven AI scales**: 3 behavior types handled by the same table lookup. Adding a 4th type does not change the loop.
- **Batch invariant**: total operations = ticks × entity_count. If you get 25 operations from 5 ticks × 5 entities, the batch is correct.

## The Batch Invariant
This is the key formula:

\`\`\`
total_ops = ticks × entity_count
\`\`\`

If your system processes fewer operations, an entity was skipped. If it processes more, an entity was double-processed. Exactly 25 means every entity was processed exactly once per tick. This is the batch processing proof.

## Key Concepts
- Batch processing: one loop, any count, no special cases
- Operation count as correctness proof
- Scale independence: code complexity is O(1) in entity count
- Data-driven content: 5 enemies from 5 data entries, not 5 code paths

## Performance Insight
5 enemies × 5 ticks = 25 behavior table lookups. Each lookup is an array index (one multiply + one load). Total cost: ~25 nanoseconds on modern hardware. At 60 FPS with 50 enemies, that is 3,000 lookups per second — still under a microsecond total. The architecture scales to thousands of entities before becoming measurable.

## Memory Insight
5 entities × 5 arrays (pos_x, pos_y, hp, alive, behavior_id) = 25 ints + 5 bools. Total: ~120 bytes of entity data. Fits in a single cache line pair. The behavior table adds 12 bytes (3 rows × 4 bytes). Grand total: ~132 bytes. Your L1 cache holds 32,768 bytes. Entity data is 0.4% of L1.

## Your Task
Run 5 enemies with different behaviors for 5 ticks. Count total AI operations and verify the batch invariant.

Expected output includes:
\`\`\`
AI|tick=5|id=0|bh=1|pos=(5,3)
AI|tick=5|id=1|bh=0|pos=(8,3)
AI|tick=5|id=2|bh=2|pos=(4,5)
AI|tick=5|id=3|bh=1|pos=(5,7)
AI|tick=5|id=4|bh=2|pos=(7,5)
BATCH|ticks=5|entities=5|ops=25
\`\`\`

## Beginner Trap
**Forgetting to increment the operation counter for idle entities.** An idle entity still gets processed by the AI loop — the table lookup returns chase_x=0, chase_y=0, and no movement happens. But the operation DID occur. The batch invariant counts all entity-tick pairs, not just entities that moved.

## Elite Insight
Production ECS engines measure "entities processed per millisecond" as a key performance metric. Your 25-operation proof is the same measurement at micro scale. When Unity or Unreal reports "10,000 entities at 60 FPS," they are proving the same batch invariant you are proving here: every entity processed exactly once per tick, total ops = ticks × count.

## Systems Thinking Connection
All four paths hit a batch processing milestone at this phase. The Space Shooter proves 50 bullets update in one pass. The Platformer proves 20 tiles collide in one pass. The Robotics path proves 360 lidar rays process in one pass. Your 5-enemy arena proves the RPG pipeline handles multiple entities uniformly. Same principle, different data.

## Skill Reinforcement
Lessons 31–34 built the modules: input, render, room loading, AI table. This milestone proves they compose correctly. The next phase (Lessons 36–40) will add combat, damage, and difficulty — all built on the batch-processing foundation you proved here.

## Mastery Check
Question: If you add a 6th enemy, what code changes?
Answer: Zero. You add a character to the room data string. loadRoom parses it into entity slot 6. The AI loop already iterates to entity_count. The render loop already iterates to entity_count. The batch invariant becomes 5 × 6 = 30 ops. No code changes anywhere.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;
const int BH_IDLE = 0;
const int BH_CHASE_X = 1;
const int BH_CHASE_Y = 2;

struct BehaviorRow { int chase_x; int chase_y; };

const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},  // BH_IDLE
    {1, 0},  // BH_CHASE_X
    {0, 1},  // BH_CHASE_Y
};

int main() {
    int px = 5, py = 5;

    int ex[MAX_E] = {1, 8, 4, 2, 7};
    int ey[MAX_E] = {3, 3, 8, 7, 1};
    int behavior_id[MAX_E] = {BH_CHASE_X, BH_IDLE, BH_CHASE_Y, BH_CHASE_X, BH_CHASE_Y};
    int entity_count = 5;
    int total_ops = 0;

    // TODO: Run 5 ticks (t = 1 to 5)
    // Each tick, for each entity (i = 0 to entity_count):
    //   1. Look up BEHAVIOR_TABLE[behavior_id[i]]
    //   2. Apply chase_x and chase_y movement
    //   3. Increment total_ops
    //   4. Print: AI|tick=T|id=I|bh=B|pos=(X,Y)
    // After all ticks:
    //   Print: BATCH|ticks=5|entities=E|ops=N

    cout << "BATCH|ticks=5|entities=" << entity_count
         << "|ops=" << total_ops << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;
const int BH_IDLE = 0;
const int BH_CHASE_X = 1;
const int BH_CHASE_Y = 2;

struct BehaviorRow { int chase_x; int chase_y; };

const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},  // BH_IDLE
    {1, 0},  // BH_CHASE_X
    {0, 1},  // BH_CHASE_Y
};

int main() {
    int px = 5, py = 5;

    int ex[MAX_E] = {1, 8, 4, 2, 7};
    int ey[MAX_E] = {3, 3, 8, 7, 1};
    int behavior_id[MAX_E] = {BH_CHASE_X, BH_IDLE, BH_CHASE_Y, BH_CHASE_X, BH_CHASE_Y};
    int entity_count = 5;
    int total_ops = 0;

    for (int t = 1; t <= 5; t++) {
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
            total_ops++;
            cout << "AI|tick=" << t << "|id=" << i
                 << "|bh=" << behavior_id[i]
                 << "|pos=(" << ex[i] << "," << ey[i] << ")" << endl;
        }
    }

    cout << "BATCH|ticks=5|entities=" << entity_count
         << "|ops=" << total_ops << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Batch invariant: 25 operations", expectedOutput: "BATCH|ticks=5|entities=5|ops=25", isPattern: false },
      { id: "t2", description: "Chase-x reaches target", expectedOutput: "AI|tick=5|id=0|bh=1|pos=(5,3)", isPattern: false },
      { id: "t3", description: "Chase-y reaches target", expectedOutput: "AI|tick=5|id=2|bh=2|pos=(4,5)", isPattern: false },
    ],
    hints: [
      "Use nested loops: outer for ticks (1 to 5), inner for entities (0 to entity_count). Increment total_ops inside the inner loop.",
      "The behavior table lookup and movement logic is identical to Lesson 34. Apply chase_x and chase_y from the table row.",
      "total_ops should equal 25 (5 ticks x 5 entities). If it doesn't, check that idle entities are still counted as operations."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Full Arena Pipeline",
    type: "game_builder",
    instructions: `# Build: Full Arena Pipeline

## Mental Model
This is the culmination of Phase 4. You will assemble every module built in Lessons 31–34 into a single working game:

1. **loadRoom** (L33) — parse room data into WorldState
2. **captureInput** (L31) — convert chars to Commands
3. **game_tick with table AI** (L34) — simulate with behavior lookup
4. **renderWorld** (L32) — display state after each tick

The room contains 5 enemies: 3 chasers and 2 guards. The game runs 10 ticks. Every system works. Every entity is processed. The pipeline is stable.

## What This Proves
- Data-driven rooms work with mixed entity types
- Input module cleanly separates raw input from game logic
- Table-driven AI handles multiple behavior types in one pass
- Render module displays all entities without mutation
- Gate A compliance: zero heap allocations in the game loop
- Batch processing: 5 enemies × 10 ticks = 50 AI operations, zero special cases

## The Full Pipeline Per Tick
\`\`\`
Command cmd = captureInput(inputs[i]);  // L31
game_tick(w, cmd);                       // L34 (with table AI)
renderWorld(w);                          // L32
\`\`\`

Three function calls. Three modules. One pipeline. This is the architecture that will carry the game through the remaining 65 lessons.

## Key Concepts
- System integration: modules compose without coupling
- Room data defines the level — no hardcoded positions
- AI behavior comes from tables — no hardcoded chase logic
- Render reads const state — no mutation during display
- Pipeline order matters: input → simulate → render

## Performance Insight
10 ticks × 6 entities = 60 AI lookups + 60 render iterations + 10 input conversions = 130 total operations per run. At 60 FPS, this is 7,800 operations per second. On a 3 GHz CPU doing ~1 billion simple ops per second, this is 0.00078% of one core. The pipeline has room to scale by 100,000x before becoming a bottleneck.

## Memory Insight
WorldState with 6 entities: ~700 bytes (grid 100 + entity arrays 6×5×4 + overhead). BehaviorRow table: 12 bytes. Command struct: 12 bytes per tick. Total runtime memory: under 1 KB. No heap. No fragmentation. Gate A: verified.

## Your Task
Wire all four modules together. Load the room, run 10 ticks with the given input sequence, render after each tick. Verify that guards stay idle and chasers track the player.

Expected output (final tick):
\`\`\`
INPUT|tick=10|dx=1|dy=0|atk=0
AI|tick=10|id=1|bh=0|pos=(2,2)
AI|tick=10|id=2|bh=1|pos=(8,4)
AI|tick=10|id=3|bh=1|pos=(8,6)
AI|tick=10|id=4|bh=0|pos=(8,7)
AI|tick=10|id=5|bh=1|pos=(8,8)
RENDER|turn=10|entities=6
ENT|id=0|pos=(8,3)|hp=30
ENT|id=1|pos=(2,2)|hp=15
ENT|id=2|pos=(8,4)|hp=10
ENT|id=3|pos=(8,6)|hp=10
ENT|id=4|pos=(8,7)|hp=15
ENT|id=5|pos=(8,8)|hp=10
\`\`\`

## Beginner Trap
**Calling modules in the wrong order.** If you render before game_tick, you display stale state. If you run game_tick before captureInput, you pass garbage to the simulation. The pipeline order is sacred: input → simulate → render. Always.

## Elite Insight
This milestone demonstrates the same architecture as id Software's Quake engine loop: read input (IN_Frame), simulate (SV_Frame), render (CL_Frame). Three modules, strict order, clean boundaries. Your 35-lesson RPG pipeline matches the structure of a shipping AAA game engine. The scale is different. The architecture is identical.

## Mastery Check
Question: What is the total number of entity-processing operations across the entire 10-tick run?
Answer: 5 enemies × 10 ticks = 50 AI operations. 6 entities × 10 renders = 60 render operations. 10 input conversions. Total: 120 entity-touching operations. All from the same three loops, all data-driven, all zero-allocation.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},
    {1, 0},
};

struct Command { int dx; int dy; bool attack; };

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
    "#.G......#"
    "#........#"
    "#..E.....#"
    "#........#"
    "#....E...#"
    "#.......G#"
    "#......E.#"
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

// TODO: Implement game_tick(WorldState& w, Command cmd)
// 1. Increment turn
// 2. Print INPUT trace
// 3. Move player using cmd.dx, cmd.dy (wall check)
// 4. For each enemy: look up BEHAVIOR_TABLE, apply movement, print AI trace

// TODO: Implement renderWorld(const WorldState& w)
// 1. Count alive entities
// 2. Print RENDER header
// 3. Print each alive entity

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','d','d','d','s','d','d','d','s','d'};
    for(int i=0;i<10;i++){
        // TODO: captureInput -> game_tick -> renderWorld
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
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = {
    {0, 0},
    {1, 0},
};

struct Command { int dx; int dy; bool attack; };

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
    "#.G......#"
    "#........#"
    "#..E.....#"
    "#........#"
    "#....E...#"
    "#.......G#"
    "#......E.#"
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
    char inputs[]={'d','d','d','d','s','d','d','d','s','d'};
    for(int i=0;i<10;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loaded with 6 entities", expectedOutput: "LOAD|room=10x10|entities=6", isPattern: false },
      { id: "g2", description: "All entities alive after 10 ticks", expectedOutput: "RENDER|turn=10|entities=6", isPattern: false },
      { id: "g3", description: "Player navigated correctly", expectedOutput: "ENT|id=0|pos=(8,3)|hp=30", isPattern: false },
      { id: "g4", description: "Guard stayed idle all game", expectedOutput: "ENT|id=1|pos=(2,2)|hp=15", isPattern: false },
      { id: "g5", description: "Chaser converged on player", expectedOutput: "ENT|id=2|pos=(8,4)|hp=10", isPattern: false },
    ],
    hints: [
      "game_tick: increment turn, print INPUT, move player with wall check, then loop enemies using BEHAVIOR_TABLE[w.behavior_id[i]] for movement.",
      "renderWorld: count alive entities, print RENDER header, then loop and print each alive entity's position and HP.",
      "In main: Command cmd = captureInput(inputs[i]); game_tick(w, cmd); renderWorld(w); — three calls per tick, always in this order."
    ],
    estimatedMinutes: 15,
  },
};
