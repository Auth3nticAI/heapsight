import { Lesson } from "@/types/lesson";

export const lessonRPG15: Lesson = {
  id: "rpg-15-milestone-stable-update-order",
  title: "Milestone: Stable Update Order",
  description: "Milestone: Named pass functions called in explicit order -- processInput, moveEntities, resolveCombat, cleanupDead, render.",
  order: 15,
  xpReward: 300,
  tier: "pro",
  concepts: ["milestone", "update pipeline", "named passes", "explicit order", "determinism", "integration"],
  part1: {
    title: "Concept: Stable Update Pipeline",
    type: "concept",
    instructions: `# Milestone: Stable Update Order

## Mental Model

A game tick is not one function. It is a pipeline of named passes, each responsible for one concern, called in a fixed order every tick. processInput() reads player intent. moveEntities() applies movement. resolveCombat() applies damage. cleanupDead() removes dead entities. render() outputs state. The order is a contract: input before movement, movement before combat, combat before cleanup, cleanup before render. Change the order and the game breaks.

## What Breaks Without This

Run combat before movement. The player attacks from the old position, not the new one. Run cleanup before combat. Dead enemies are removed before the combat pass can check adjacency. Run render before cleanup. Dead enemies appear on screen for one extra frame. The pipeline order IS the game logic. Get it wrong and behavior changes silently.

## The Fix: Named Pass Functions

Define five pass functions:

1. **processInput(w, key)** -- reads player key, sets intent (move or attack)
2. **moveEntities(w)** -- applies movement for player and AI enemies
3. **resolveCombat(w)** -- checks adjacency, applies damage
4. **cleanupDead(w)** -- marks dead entities, awards gold
5. **render(w)** -- outputs ENTITY, TURN, HP, GOLD lines

Call them in this exact order every tick. No exceptions. The game loop is five lines:

\`\`\`
processInput(w, key);
moveEntities(w);
resolveCombat(w);
cleanupDead(w);
render(w);
\`\`\`

This is the RPG's tick pipeline. Every future lesson adds logic INSIDE a pass, not between passes. The pipeline structure is permanent.

## Key Concepts

- **Named pass** -- a function responsible for one phase of the tick
- **Fixed order** -- the calling sequence never changes
- **Separation of concerns** -- each pass reads/writes only the components it needs
- **Pipeline as architecture** -- the pass order IS the game's execution model
- **Deterministic execution** -- same input, same pass order, same output

## Performance Insight

Five function calls per tick: negligible overhead. The compiler inlines small functions. At 60 ticks per second with 100 entities, the pipeline processes 500 function calls per second -- trivial. The structure enables future optimization: each pass can be profiled independently (Lesson 71), parallelized independently, or replaced independently.

## Memory Insight

Each pass function takes WorldState& -- an 8-byte pointer. No copies, no allocations. The passes share the same WorldState on the stack. Total memory overhead of the pipeline architecture: zero. The functions are compiled to inline code in release builds.

## Your Task

Define the five pass functions. Run a single tick with key='d' (move right) and verify the pipeline order by printing PASS|name before each pass:

\`\`\`
DUNGEON|rpg-v0
PASS|processInput
PASS|moveEntities
PASS|resolveCombat
PASS|cleanupDead
PASS|render
ENTITY|id=0|@|2|1|hp=100
ENTITY|id=1|o|3|1|hp=10
TURN|1
HP|100
GOLD|0
\`\`\`

## Beginner Trap

**Adding logic between pass calls.** Beginners put \`if(key=='f')\` checks between processInput and moveEntities. This breaks the pipeline contract. ALL input handling goes inside processInput. ALL combat goes inside resolveCombat. No logic lives between passes -- only the pass calls themselves.

## Elite Insight

Valve's Source engine uses a fixed-order update pipeline: input, physics, game logic, render. Carmack's Quake had a similar structure: read input, simulate world, render frame. The RPG's five-pass pipeline follows the same design. In production, this pipeline enables replay (replay the same inputs through the same passes), determinism (same order guarantees same result), and profiling (measure each pass independently). Nintendo's internal game frameworks enforce similar pass ordering for the same reasons.

## Systems Thinking Connection

This pipeline is the RPG equivalent of the Platformer's physics pipeline (input, integrate, collide, resolve, render) and the Robotics path's executor callback ordering. All three paths converge on the same principle: explicit pass ordering for deterministic behavior. The domain is different; the architecture is the same.

## Skill Reinforcement

Lesson 7 introduced turn pipeline v0 with inline code. Lesson 10 integrated all passes. This milestone formalizes them as named functions with SoA data. Lesson 16 will add a command queue to separate input intent from execution inside processInput.

## Mastery Check

Why must cleanup run AFTER combat but BEFORE render? Answer: Combat may reduce an enemy's HP to 0. Cleanup checks for hp<=0 and marks them dead. Render should not display dead enemies. If cleanup runs before combat, a freshly killed enemy is still alive in the combat pass. If cleanup runs after render, the dead enemy appears for one extra frame. The order is: damage first, clean second, display third.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    int player_id;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    char glyph[MAX_E];
    bool alive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int next_id;
    int turn;
    int pgold;
    char intent; // player intent for this tick
};

int findPlayer(const WorldState& w){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==w.player_id) return i;
    return -1;
}

bool canMove(const WorldState& w, int x, int y, int dx, int dy){
    int nx=x+dx, ny=y+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    for(int i=0;i<MAX_E;i++){w.pos_x[i]=0;w.pos_y[i]=0;w.hp[i]=0;w.glyph[i]='.';w.alive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.entity_count=0; w.turn=0; w.pgold=0; w.intent=0;
    int pi=w.entity_count++;
    w.entity_id[pi]=w.next_id++; w.player_id=w.entity_id[pi];
    w.pos_x[pi]=1; w.pos_y[pi]=1; w.hp[pi]=100; w.glyph[pi]='@'; w.alive[pi]=true;
    int e1=w.entity_count++;
    w.entity_id[e1]=w.next_id++;
    w.pos_x[e1]=3; w.pos_y[e1]=1; w.hp[e1]=10; w.glyph[e1]='o'; w.alive[e1]=true;
}

// TODO: Define processInput(WorldState& w, char key) -- stores intent
// TODO: Define moveEntities(WorldState& w) -- applies movement from intent
// TODO: Define resolveCombat(WorldState& w) -- applies attack if intent is 'f'
// TODO: Define cleanupDead(WorldState& w) -- marks dead, awards gold
// TODO: Define render(const WorldState& w) -- prints entities, turn, HP, gold
// Each pass should print PASS|name before executing

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    w.turn=1;
    char key='d';
    // TODO: call the 5 passes in order
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    int player_id;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    char glyph[MAX_E];
    bool alive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int next_id;
    int turn;
    int pgold;
    char intent;
};

int findPlayer(const WorldState& w){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==w.player_id) return i;
    return -1;
}

bool canMove(const WorldState& w, int x, int y, int dx, int dy){
    int nx=x+dx, ny=y+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    for(int i=0;i<MAX_E;i++){w.pos_x[i]=0;w.pos_y[i]=0;w.hp[i]=0;w.glyph[i]='.';w.alive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.entity_count=0; w.turn=0; w.pgold=0; w.intent=0;
    int pi=w.entity_count++;
    w.entity_id[pi]=w.next_id++; w.player_id=w.entity_id[pi];
    w.pos_x[pi]=1; w.pos_y[pi]=1; w.hp[pi]=100; w.glyph[pi]='@'; w.alive[pi]=true;
    int e1=w.entity_count++;
    w.entity_id[e1]=w.next_id++;
    w.pos_x[e1]=3; w.pos_y[e1]=1; w.hp[e1]=10; w.glyph[e1]='o'; w.alive[e1]=true;
}

void processInput(WorldState& w, char key){
    cout << "PASS|processInput" << endl;
    w.intent = key;
}

void moveEntities(WorldState& w){
    cout << "PASS|moveEntities" << endl;
    int pi=findPlayer(w);
    if(pi<0) return;
    char key=w.intent;
    if(key=='d'||key=='a'||key=='w'||key=='s'){
        int dx=(key=='d')?1:(key=='a')?-1:0;
        int dy=(key=='s')?1:(key=='w')?-1:0;
        if(canMove(w,w.pos_x[pi],w.pos_y[pi],dx,dy)){w.pos_x[pi]+=dx;w.pos_y[pi]+=dy;}
    }
}

void resolveCombat(WorldState& w){
    cout << "PASS|resolveCombat" << endl;
    int pi=findPlayer(w);
    if(pi<0) return;
    if(w.intent=='f'){
        for(int i=0;i<w.entity_count;i++){
            if(i==pi||!w.alive[i]) continue;
            if((abs(w.pos_x[pi]-w.pos_x[i])+abs(w.pos_y[pi]-w.pos_y[i]))==1){
                w.hp[i]-=10;
            }
        }
    }
}

void cleanupDead(WorldState& w){
    cout << "PASS|cleanupDead" << endl;
    int pi=findPlayer(w);
    for(int i=0;i<w.entity_count;i++){
        if(i==pi) continue;
        if(w.alive[i]&&w.hp[i]<=0){
            w.alive[i]=false;
            w.pgold+=10;
        }
    }
}

void render(const WorldState& w){
    cout << "PASS|render" << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|" << w.glyph[i] << "|" << w.pos_x[i] << "|" << w.pos_y[i] << "|hp=" << w.hp[i] << endl;
    }
    int pi=findPlayer(w);
    cout << "TURN|" << w.turn << endl;
    if(pi>=0) cout << "HP|" << w.hp[pi] << endl;
    cout << "GOLD|" << w.pgold << endl;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    w.turn=1;
    char key='d';
    processInput(w, key);
    moveEntities(w);
    resolveCombat(w);
    cleanupDead(w);
    render(w);
    return 0;
}`,
    tests: [
      { id: "t1", description: "processInput pass runs first", expectedOutput: "PASS\\|processInput", isPattern: true },
      { id: "t2", description: "moveEntities pass runs second", expectedOutput: "PASS\\|moveEntities", isPattern: true },
      { id: "t3", description: "resolveCombat pass runs third", expectedOutput: "PASS\\|resolveCombat", isPattern: true },
      { id: "t4", description: "cleanupDead pass runs fourth", expectedOutput: "PASS\\|cleanupDead", isPattern: true },
      { id: "t5", description: "render pass runs fifth", expectedOutput: "PASS\\|render", isPattern: true },
      { id: "t6", description: "Player moved right to (2,1)", expectedOutput: "ENTITY\\|id=0\\|@\\|2\\|1", isPattern: true },
      { id: "t7", description: "Orc still alive at (3,1)", expectedOutput: "ENTITY\\|id=1\\|o\\|3\\|1", isPattern: true },
    ],
    hints: [
      "Each pass is a separate function taking WorldState&. processInput stores the key. moveEntities applies movement from the stored intent.",
      "Print PASS|name at the start of each function. The five PASS lines should appear in order: processInput, moveEntities, resolveCombat, cleanupDead, render.",
      "In main: processInput(w,'d'); moveEntities(w); resolveCombat(w); cleanupDead(w); render(w); -- five calls in fixed order.",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Build: Full 5-Turn Game with Pipeline",
    type: "game_builder",
    instructions: `# Build: Full 5-Turn Game with Pipeline

## Mental Model

This is the Phase 2 capstone. Every concept from Lessons 11-14 converges: WorldState struct (L11), Vec2i-style typed access via SoA (L12/L14), entity IDs (L13), and now the formal five-pass pipeline. Run a full 5-turn game: move to the orc, attack it twice, watch it die, see the pipeline execute in order every tick.

## What Breaks Without This

Without named passes, adding enemy AI means inserting code "somewhere" in the tick loop. Where? Before combat? After? With named passes, AI goes in moveEntities(). Adding a shop? That goes in processInput (to enter shop mode). Adding status effects? That goes in a new pass after resolveCombat. The pipeline is the architecture. Without it, every new feature is a guess about execution order.

## The Fix

Run the full pipeline for 5 turns. Add simple enemy AI in moveEntities: enemies move toward the player. Script: d, d, f, f, f. The pipeline order is printed each tick. After the orc dies, print WIN and the milestone message. This output is the integration test for Phase 2.

## Key Concepts

- **Complete pipeline** -- five passes per tick, every tick
- **Enemy AI in moveEntities** -- enemies move toward player each tick
- **Integration test** -- the output IS the test. Same input, same passes, same output.
- **Pipeline order printed** -- PASS|name shows execution order for verification

## Performance Insight

5 passes per tick, 5 ticks = 25 function calls. Each pass iterates MAX_E=8 entities. Total: ~200 operations. Sub-microsecond on any modern CPU. The pipeline adds zero overhead while enabling independent testing, profiling, and future parallelism of each pass.

## Memory Insight

WorldState is ~260 bytes on the stack. Five pass functions share it via reference. No heap allocation. No copies. The entire game session uses less memory than a single tweet. This is the stack-only discipline that makes the RPG path deterministic and cache-friendly.

## Your Task

Build the full 5-turn pipeline game. Player at (1,1), orc at (3,1) with 15 HP. Script: d, d, f, f, f (move right twice to get adjacent, attack three times). Enemy AI moves toward player in moveEntities. Expected output:

\`\`\`
DUNGEON|rpg-v0
PASS|processInput
PASS|moveEntities
PASS|resolveCombat
PASS|cleanupDead
PASS|render
ENTITY|id=0|@|2|1|hp=100
ENTITY|id=1|o|3|1|hp=10
TURN|1
HP|100
GOLD|0
...
WIN|hero|orc_defeated|gold=10
GAME_MESSAGE|Milestone: Stable update order achieved. Phase 2 pipeline locked.
\`\`\`

## Beginner Trap

**Skipping passes on certain ticks.** Beginners add \`if(key=='f') skip moveEntities\`. Never skip passes. All five passes run every tick. If a pass has nothing to do (no attack intent during resolveCombat), it returns immediately. The pipeline is unconditional.

## Elite Insight

Nintendo's internal game frameworks enforce a fixed-order update pipeline. Every system registers a priority, and the framework calls them in order. You cannot insert logic between priorities. This discipline prevents the "spaghetti update" problem that plagues amateur game code. FromSoftware's Dark Souls uses a similar pipeline: input, AI, physics, combat, cleanup, render. Your five-pass pipeline follows the same professional pattern.

## Mastery Check

If you add a "status effects" system (e.g., poison ticking down HP), which pass does it go in? Answer: Create a new pass called resolveEffects() that runs AFTER resolveCombat and BEFORE cleanupDead. Effects modify HP, then cleanup checks for death. The pipeline expands by inserting new passes, not by modifying existing ones. This is the open-closed principle applied to game loops.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    int player_id;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    char glyph[MAX_E];
    bool alive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int next_id;
    int turn;
    int pgold;
    char intent;
};

int findPlayer(const WorldState& w){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==w.player_id) return i;
    return -1;
}
bool canMove(const WorldState& w, int x, int y, int dx, int dy){
    int nx=x+dx, ny=y+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    for(int i=0;i<MAX_E;i++){w.pos_x[i]=0;w.pos_y[i]=0;w.hp[i]=0;w.glyph[i]='.';w.alive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.entity_count=0; w.turn=0; w.pgold=0; w.intent=0;
    int pi=w.entity_count++;
    w.entity_id[pi]=w.next_id++; w.player_id=w.entity_id[pi];
    w.pos_x[pi]=1; w.pos_y[pi]=1; w.hp[pi]=100; w.glyph[pi]='@'; w.alive[pi]=true;
    int e1=w.entity_count++;
    w.entity_id[e1]=w.next_id++;
    w.pos_x[e1]=3; w.pos_y[e1]=1; w.hp[e1]=15; w.glyph[e1]='o'; w.alive[e1]=true;
}

// TODO: processInput(WorldState& w, char key)
// TODO: moveEntities(WorldState& w) -- player moves on wasd intent, enemies move toward player
// TODO: resolveCombat(WorldState& w) -- attack on 'f' intent
// TODO: cleanupDead(WorldState& w)
// TODO: render(const WorldState& w)
// Each must print PASS|name

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    char inputs[]={'d','d','f','f','f'};
    int nticks=5;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        // TODO: call 5 passes in order
        // TODO: check win condition
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    int player_id;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    char glyph[MAX_E];
    bool alive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int next_id;
    int turn;
    int pgold;
    char intent;
};

int findPlayer(const WorldState& w){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==w.player_id) return i;
    return -1;
}
bool canMove(const WorldState& w, int x, int y, int dx, int dy){
    int nx=x+dx, ny=y+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    for(int i=0;i<MAX_E;i++){w.pos_x[i]=0;w.pos_y[i]=0;w.hp[i]=0;w.glyph[i]='.';w.alive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.entity_count=0; w.turn=0; w.pgold=0; w.intent=0;
    int pi=w.entity_count++;
    w.entity_id[pi]=w.next_id++; w.player_id=w.entity_id[pi];
    w.pos_x[pi]=1; w.pos_y[pi]=1; w.hp[pi]=100; w.glyph[pi]='@'; w.alive[pi]=true;
    int e1=w.entity_count++;
    w.entity_id[e1]=w.next_id++;
    w.pos_x[e1]=3; w.pos_y[e1]=1; w.hp[e1]=15; w.glyph[e1]='o'; w.alive[e1]=true;
}

void processInput(WorldState& w, char key){
    cout << "PASS|processInput" << endl;
    w.intent = key;
}

void moveEntities(WorldState& w){
    cout << "PASS|moveEntities" << endl;
    int pi=findPlayer(w);
    if(pi<0) return;
    // Player movement
    char key=w.intent;
    if(key=='d'||key=='a'||key=='w'||key=='s'){
        int dx=(key=='d')?1:(key=='a')?-1:0;
        int dy=(key=='s')?1:(key=='w')?-1:0;
        if(canMove(w,w.pos_x[pi],w.pos_y[pi],dx,dy)){w.pos_x[pi]+=dx;w.pos_y[pi]+=dy;}
    }
    // Enemy AI: move toward player
    for(int i=0;i<w.entity_count;i++){
        if(i==pi||!w.alive[i]) continue;
        int dx=(w.pos_x[pi]>w.pos_x[i])?1:(w.pos_x[pi]<w.pos_x[i])?-1:0;
        int dy=(dx==0)?((w.pos_y[pi]>w.pos_y[i])?1:(w.pos_y[pi]<w.pos_y[i])?-1:0):0;
        int nx=w.pos_x[i]+dx, ny=w.pos_y[i]+dy;
        if(!(nx==w.pos_x[pi]&&ny==w.pos_y[pi]))
            if(canMove(w,w.pos_x[i],w.pos_y[i],dx,dy)){w.pos_x[i]+=dx;w.pos_y[i]+=dy;}
    }
}

void resolveCombat(WorldState& w){
    cout << "PASS|resolveCombat" << endl;
    int pi=findPlayer(w);
    if(pi<0) return;
    if(w.intent=='f'){
        for(int i=0;i<w.entity_count;i++){
            if(i==pi||!w.alive[i]) continue;
            if((abs(w.pos_x[pi]-w.pos_x[i])+abs(w.pos_y[pi]-w.pos_y[i]))==1){
                w.hp[i]-=10;
            }
        }
    }
}

void cleanupDead(WorldState& w){
    cout << "PASS|cleanupDead" << endl;
    int pi=findPlayer(w);
    for(int i=0;i<w.entity_count;i++){
        if(i==pi) continue;
        if(w.alive[i]&&w.hp[i]<=0){
            w.alive[i]=false;
            w.pgold+=10;
        }
    }
}

void render(const WorldState& w){
    cout << "PASS|render" << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|" << w.glyph[i] << "|" << w.pos_x[i] << "|" << w.pos_y[i] << "|hp=" << w.hp[i] << endl;
    }
    int pi=findPlayer(w);
    cout << "TURN|" << w.turn << endl;
    if(pi>=0) cout << "HP|" << w.hp[pi] << endl;
    cout << "GOLD|" << w.pgold << endl;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    char inputs[]={'d','d','f','f','f'};
    int nticks=5;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        processInput(w, inputs[t]);
        moveEntities(w);
        resolveCombat(w);
        cleanupDead(w);
        render(w);

        int pi=findPlayer(w);
        int alive_enemies=0;
        for(int i=0;i<w.entity_count;i++) if(i!=pi&&w.alive[i]) alive_enemies++;
        if(alive_enemies==0){
            cout << "WIN|hero|orc_defeated|gold=" << w.pgold << endl;
            cout << "GAME_MESSAGE|Milestone: Stable update order achieved. Phase 2 pipeline locked." << endl;
            break;
        }
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header", expectedOutput: "DUNGEON\\|rpg-v0", isPattern: true },
      { id: "g2", description: "Pipeline passes printed in order", expectedOutput: "PASS\\|processInput", isPattern: true },
      { id: "g3", description: "Player entity visible", expectedOutput: "ENTITY\\|id=0\\|@", isPattern: true },
      { id: "g4", description: "Turn counter works", expectedOutput: "TURN\\|1", isPattern: true },
      { id: "g5", description: "HP displayed", expectedOutput: "HP\\|100", isPattern: true },
      { id: "g6", description: "Gold accumulated on kill", expectedOutput: "GOLD\\|10", isPattern: true },
      { id: "g7", description: "Win state achieved", expectedOutput: "WIN\\|hero\\|orc_defeated\\|gold=10", isPattern: true },
      { id: "g8", description: "Milestone message", expectedOutput: "GAME_MESSAGE\\|Milestone: Stable update order achieved", isPattern: true },
    ],
    hints: [
      "Five passes per tick, unconditionally. processInput stores intent. moveEntities handles both player and enemy movement. resolveCombat checks intent==f for attack.",
      "Enemy AI in moveEntities: compute dx toward player, then dy only if dx==0 (priority: horizontal first). Do not move into the player tile.",
      "Win check after all 5 passes: count alive enemies excluding player. If 0, print WIN|hero|orc_defeated|gold=N and GAME_MESSAGE, then break.",
    ],
    estimatedMinutes: 25,
  },
};