import { Lesson } from "@/types/lesson";

export const lessonRPG32: Lesson = {
  id: "rpg-32-render-module-split",
  title: "Render Module Split",
  description: "Rendering extracted into a pure function of state — the output boundary never mutates WorldState.",
  order: 32,
  xpReward: 100,
  tier: "pro",
  concepts: ["render module", "pure function", "const reference", "output boundary"],
  part1: {
    title: "Concept: Render as a Pure Function",
    type: "concept",
    instructions: `# Render Module Split

## Mental Model
Rendering is reading, not writing. A render function takes \`const WorldState&\` and produces output. It never mutates the world. This is the output boundary — the mirror image of the input boundary you built in Lesson 31.

Input module: raw char → structured Command (entry boundary).
Render module: WorldState → structured output (exit boundary).

Between these two boundaries sits the simulation: \`game_tick\` mutates WorldState. Nothing else does. This three-part split — input, simulate, render — is the foundation of every real-time game loop.

## What Breaks Without This
Right now, rendering is scattered: some output happens inside game_tick (the INPUT trace), some happens in main after the loop. If you add a grid display, health bars, or a score counter, where do they go? Without a render module, output code leaks into game logic. game_tick starts printing things. Main starts formatting strings. Nobody knows where to add the next UI element.

Worse: if render code mutates WorldState (even accidentally), your simulation becomes non-deterministic. A "display-only" feature could change game behavior. The \`const\` qualifier prevents this at compile time.

## The Fix: renderWorld Takes const WorldState&

\`\`\`cpp
void renderWorld(const WorldState& w) {
    int alive_count = 0;
    for (int i = 0; i < w.entity_count; i++) {
        if (w.alive[i]) alive_count++;
    }
    cout << "RENDER|turn=" << w.turn
         << "|entities=" << alive_count << endl;
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        cout << "ENT|id=" << i
             << "|glyph=" << w.glyph[i]
             << "|pos=(" << w.pos_x[i] << "," << w.pos_y[i]
             << ")|hp=" << w.hp[i] << endl;
    }
}
\`\`\`

The \`const\` qualifier is not optional. It is a contract: renderWorld will never modify WorldState. The compiler enforces this. If you accidentally write \`w.turn++\` inside renderWorld, the compiler rejects it.

## Key Concepts
- \`const WorldState&\` — read-only reference. Zero copies, zero mutations.
- Pure function of state — same WorldState always produces same output.
- Dead entities skipped — only alive entities are rendered.
- Alive count computed from data — not stored separately.

## Performance Insight
\`const WorldState&\` passes a pointer (8 bytes) regardless of WorldState size. The function reads entity arrays sequentially — perfect for the CPU prefetcher. With MAX_ENTITIES = 16, the entire render pass touches ~128 bytes of entity data. L1 cache handles this without a miss.

## Memory Insight
renderWorld allocates nothing. The alive_count is a stack int. The loop index is a stack int. cout writes directly to the output buffer. Zero heap. Gate A compliance: automatic.

## Your Task
Implement \`renderWorld\` that takes a const WorldState reference and prints the render header plus each alive entity. Dead entities must be skipped.

Expected output:
\`\`\`
RENDER|turn=3|entities=2
ENT|id=0|glyph=@|pos=(2,3)|hp=30
ENT|id=1|glyph=E|pos=(7,4)|hp=10
\`\`\`

Note: Entity 2 (hp=0, alive=false) is NOT printed.

## Beginner Trap
**Storing an alive_count field in WorldState and updating it manually.** This creates a second source of truth. If you forget to decrement alive_count when an entity dies, the render header lies. Instead, compute alive_count fresh each frame by iterating the alive[] array. It is 16 iterations — effectively free.

## Elite Insight
Unreal Engine's rendering pipeline takes a const snapshot of game state. The render thread never mutates game objects. This separation allows the render thread to run in parallel with the next simulation tick. Your \`const WorldState&\` parameter establishes the same contract at compile time — render cannot interfere with simulation.

## Systems Thinking Connection
The Space Shooter path splits rendering into a draw pass that reads component arrays. The Platformer path builds a render list from entity state. The Robotics path publishes visualization markers from const sensor data. All four paths enforce the same rule: output is a pure function of state. Different output targets, same boundary discipline.

## Skill Reinforcement
Lesson 31 established the input boundary. This lesson establishes the output boundary. Together they bracket game_tick: input → simulate → render. Lesson 33 will add world loading (data → state), completing the data flow architecture.

## Mastery Check
Question: Why is the \`const\` qualifier on the WorldState parameter important, not just a style choice?
Answer: Because \`const\` is compiler-enforced. Without it, a future developer could accidentally write \`w.hp[i] = 0\` inside renderWorld, and the code would compile and silently corrupt game state. With \`const\`, the compiler catches this at build time. It turns a runtime bug into a compile error.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    char glyph[MAX_E];
    int entity_count;
    int turn;
};

// TODO: Implement renderWorld(const WorldState& w)
// 1. Count alive entities
// 2. Print: RENDER|turn=T|entities=N  (N = alive count)
// 3. For each alive entity, print:
//    ENT|id=I|glyph=G|pos=(X,Y)|hp=H
// Skip dead entities (alive[i] == false)

int main() {
    WorldState w = {};
    w.turn = 3;
    w.entity_count = 3;

    w.pos_x[0]=2; w.pos_y[0]=3; w.hp[0]=30;
    w.alive[0]=true; w.glyph[0]='@';

    w.pos_x[1]=7; w.pos_y[1]=4; w.hp[1]=10;
    w.alive[1]=true; w.glyph[1]='E';

    w.pos_x[2]=5; w.pos_y[2]=5; w.hp[2]=0;
    w.alive[2]=false; w.glyph[2]='E';

    renderWorld(w);
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    char glyph[MAX_E];
    int entity_count;
    int turn;
};

void renderWorld(const WorldState& w) {
    int alive_count = 0;
    for (int i = 0; i < w.entity_count; i++) {
        if (w.alive[i]) alive_count++;
    }
    cout << "RENDER|turn=" << w.turn
         << "|entities=" << alive_count << endl;
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        cout << "ENT|id=" << i
             << "|glyph=" << w.glyph[i]
             << "|pos=(" << w.pos_x[i] << "," << w.pos_y[i]
             << ")|hp=" << w.hp[i] << endl;
    }
}

int main() {
    WorldState w = {};
    w.turn = 3;
    w.entity_count = 3;

    w.pos_x[0]=2; w.pos_y[0]=3; w.hp[0]=30;
    w.alive[0]=true; w.glyph[0]='@';

    w.pos_x[1]=7; w.pos_y[1]=4; w.hp[1]=10;
    w.alive[1]=true; w.glyph[1]='E';

    w.pos_x[2]=5; w.pos_y[2]=5; w.hp[2]=0;
    w.alive[2]=false; w.glyph[2]='E';

    renderWorld(w);
    return 0;
}`,
    tests: [
      { id: "t1", description: "Render header with alive count", expectedOutput: "RENDER|turn=3|entities=2", isPattern: false },
      { id: "t2", description: "Player entity rendered", expectedOutput: "ENT|id=0|glyph=@|pos=(2,3)|hp=30", isPattern: false },
      { id: "t3", description: "Alive enemy rendered", expectedOutput: "ENT|id=1|glyph=E|pos=(7,4)|hp=10", isPattern: false },
    ],
    hints: [
      "Count alive entities first by looping through alive[] and incrementing a counter for each true value.",
      "Use const WorldState& w as the parameter type. The const prevents accidental mutation inside the render function.",
      "Skip dead entities with: if (!w.alive[i]) continue; — this ensures entity 2 (dead) never prints."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Three-Module Game Loop",
    type: "game_builder",
    instructions: `# Build: Three-Module Game Loop

## Mental Model
The game loop is now three clean stages: input → simulate → render. Main owns the pipeline. It calls captureInput to get a Command, passes it to game_tick to mutate WorldState, then calls renderWorld to display the result. Each module has one job. No module reaches into another's territory.

This is the architecture every production game loop follows. The modules may be more complex, but the pipeline is identical.

## What Breaks Without This
Without a render module, adding a health bar means editing main. Adding a minimap means editing main again. Adding a score display means editing main a third time. Main becomes a dumping ground for output code. With renderWorld, all display logic lives in one function. Adding a health bar? Edit renderWorld. Minimap? renderWorld. Score? renderWorld. One place, one responsibility.

## The Fix: Full Pipeline Integration
Wire captureInput (from Lesson 31) and renderWorld into the game loop. The pipeline for each tick:

1. \`Command cmd = captureInput(inputs[i])\`
2. \`game_tick(w, cmd)\` — mutates WorldState, prints INPUT trace
3. \`renderWorld(w)\` — reads WorldState, prints RENDER + ENT lines

After 5 ticks, the output shows both the input trace and the render output for each tick.

## Key Concepts
- Three-module pipeline: input → simulate → render
- Main is the orchestrator — it calls modules in order
- game_tick mutates state (non-const reference)
- renderWorld reads state (const reference)
- The compiler enforces the boundary: const prevents render from mutating

## Performance Insight
renderWorld runs after game_tick each tick. With 2 entities, it does 2 iterations of the entity loop plus 1 alive-count pass — 4 total reads from entity arrays. At 60 FPS this is 240 array reads per second. The CPU does not notice.

## Memory Insight
The three-module split adds zero memory overhead. captureInput returns a 12-byte Command on the stack. game_tick takes a reference (8 bytes). renderWorld takes a const reference (8 bytes). No new allocations. No new data structures. Just function boundaries.

## Your Task
Integrate captureInput and renderWorld into the full game loop. Run 5 ticks with input sequence 'd','d','s','s','d'. After each tick, call renderWorld to display the current state.

Expected output (last tick shown):
\`\`\`
INPUT|tick=5|dx=1|dy=0|atk=0
RENDER|turn=5|entities=2
ENT|id=0|pos=(4,3)|hp=30
ENT|id=1|pos=(4,5)|hp=10
\`\`\`

## Beginner Trap
**Putting renderWorld inside game_tick.** This violates the module boundary. game_tick should only mutate state and print its own INPUT trace. renderWorld is called by main, after game_tick returns. If render is inside game_tick, you cannot skip rendering during replay or run headless tests.

## Elite Insight
The Model-View-Controller pattern from the 1970s established this same split: Model (WorldState), View (renderWorld), Controller (captureInput). Your three-module pipeline is MVC without the framework overhead. The key insight is that MVC is not about classes or inheritance — it is about data flow boundaries.

## Mastery Check
Question: Why call renderWorld from main instead of from game_tick?
Answer: Because main owns the frame pipeline. During replay, you might skip rendering. During fast-forward, you might render every 10th tick. During testing, you might render never. If renderWorld is inside game_tick, you cannot make these choices. Keeping render in main gives the orchestrator full control over when output happens.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

struct Command {
    int dx;
    int dy;
    bool attack;
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
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

void init_world(WorldState& w, unsigned int seed){
    w={}; w.seed=seed; rng_seed(w.rng,seed);
    for(int y=0;y<H;y++) for(int x=0;x<W;x++)
        w.grid[y][x]=(y==0||y==H-1||x==0||x==W-1)?TILE_WALL:'.';
    w.pos_x[0]=1;w.pos_y[0]=1;w.hp[0]=30;w.alive[0]=true;
    w.pos_x[1]=5;w.pos_y[1]=5;w.hp[1]=10;w.alive[1]=true;
    w.entity_count=2;
}

void game_tick(WorldState& w, Command cmd){
    w.turn++;
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
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

// TODO: Implement renderWorld(const WorldState& w)
// Print: RENDER|turn=T|entities=N  (N = alive count)
// For each alive entity: ENT|id=I|pos=(X,Y)|hp=H

int main(){
    WorldState w; init_world(w,42);
    char inputs[]={'d','d','s','s','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        // TODO: Call renderWorld(w) after each tick
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

struct Command {
    int dx;
    int dy;
    bool attack;
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
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

void init_world(WorldState& w, unsigned int seed){
    w={}; w.seed=seed; rng_seed(w.rng,seed);
    for(int y=0;y<H;y++) for(int x=0;x<W;x++)
        w.grid[y][x]=(y==0||y==H-1||x==0||x==W-1)?TILE_WALL:'.';
    w.pos_x[0]=1;w.pos_y[0]=1;w.hp[0]=30;w.alive[0]=true;
    w.pos_x[1]=5;w.pos_y[1]=5;w.hp[1]=10;w.alive[1]=true;
    w.entity_count=2;
}

void game_tick(WorldState& w, Command cmd){
    w.turn++;
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
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
    WorldState w; init_world(w,42);
    char inputs[]={'d','d','s','s','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Render header after final tick", expectedOutput: "RENDER|turn=5|entities=2", isPattern: false },
      { id: "g2", description: "Player position rendered", expectedOutput: "ENT|id=0|pos=(4,3)|hp=30", isPattern: false },
      { id: "g3", description: "Enemy position rendered", expectedOutput: "ENT|id=1|pos=(4,5)|hp=10", isPattern: false },
      { id: "g4", description: "Input module trace present", expectedOutput: "INPUT|tick=1|dx=1|dy=0|atk=0", isPattern: false },
      { id: "g5", description: "Render called each tick", expectedOutput: "RENDER|turn=1|entities=2", isPattern: false },
    ],
    hints: [
      "renderWorld takes const WorldState& — the const prevents accidental mutation. Count alive entities, print the header, then loop and print each alive entity.",
      "Call renderWorld(w) immediately after game_tick(w, cmd) inside the for loop. Each tick should show INPUT then RENDER output.",
      "The ENT line format is: ENT|id=I|pos=(X,Y)|hp=H — note no glyph field in the game WorldState, just position and HP."
    ],
    estimatedMinutes: 12,
  },
};
