import { Lesson } from "@/types/lesson";

export const lessonRPG11: Lesson = {
  id: "rpg-11-world-state-struct",
  title: "World State Struct",
  description: "Move all game state into a single WorldState struct for observable, deterministic access.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["struct", "world state", "data grouping", "observable state", "determinism"],
  part1: {
    title: "Concept: World State Struct",
    type: "concept",
    instructions: `# World State Struct

## Mental Model

Every variable in your micro dungeon -- player position, enemy HP, gold, turn count -- is a piece of game state. Right now those variables are scattered across main(). A WorldState struct gathers them into one place: one struct, one truth, one thing to save, load, hash, or inspect.

## What Breaks Without This

Without a single state struct, you cannot snapshot the game. You cannot hash it for replay verification. You cannot save it. You cannot pass it to a function without passing 15 separate arguments. Scattered state is invisible state -- bugs hide in variables you forgot existed.

## The Fix: WorldState Struct

Define a struct that holds everything: the grid, entity arrays, player position, HP, gold, turn counter, and entity count. Write an initWorld() function that sets it up. Every game function now takes a WorldState reference instead of a pile of loose variables.

This is not object-oriented design. There are no methods on WorldState. It is a plain data container -- a namespace for state. Functions operate ON it, not inside it. This is the data-first approach: separate data from behavior.

The tick pipeline becomes: pass the world into each pass function. Each pass reads and writes the same struct. State is observable because it lives in one place.

## Key Concepts

- **Struct as namespace** -- WorldState groups related data, not behavior
- **Single source of truth** -- all game state in one place
- **Observable state** -- one struct to hash, save, or inspect
- **Pass by reference** -- functions take WorldState& to read/write

## Performance Insight

Grouping state into a struct does not change performance. The compiler lays out struct members contiguously in memory. Accessing world.ptx is the same machine code as accessing a local int ptx. The benefit is organizational, not computational -- but organization prevents bugs that cause performance-destroying rewrites.

## Memory Insight

WorldState lives on the stack in main(). It contains fixed-size arrays, ints, and bools -- no heap allocation. The entire struct is ~500 bytes. It fits in a single cache line group. When you pass WorldState& to a function, you pass an 8-byte pointer, not a copy.

## Your Task

Define a WorldState struct with grid[10][10], player position, HP, gold, entity arrays (max 4), entity_count, and turn. Write initWorld() to set up walls, player at (1,1), one orc at (3,1) with 10 HP. Print the struct fields:

\`\`\`
DUNGEON|rpg-v0
WORLD|entities=1|turn=0
ENTITY|hero|player|24|24|24|24
ENTITY|orc|enemy|72|24|24|24
\`\`\`

## Beginner Trap

**Putting functions inside the struct.** Beginners write \`world.move()\` or \`world.render()\`. This is OOP thinking. WorldState is DATA, not an object. Write free functions: \`movePlayer(WorldState& w, ...)\`. The struct holds state. Functions transform it. Keep them separate.

## Elite Insight

Nethack stores its entire game state in a single global struct. Diablo 2 keeps world state in a flat data block that can be checksummed for anti-cheat verification. The pattern is universal in deterministic games: one struct, one truth. Carmack's Quake used a similar approach -- gameState_t holds the entire simulation.

## Systems Thinking Connection

This WorldState struct is the RPG equivalent of a ROS2 node's internal state. In robotics, the robot's pose, sensor readings, and plan all live in one observable place. Same principle: group state for inspection, serialization, and debugging.

## Skill Reinforcement

Lesson 10 scattered state across main(). This lesson groups it. Lesson 12 will add typed coordinates (Vec2i) to replace raw ints inside WorldState. Lesson 23 will hash WorldState for replay verification.

## Mastery Check

Why should WorldState contain NO member functions? Answer: Because separating data from behavior lets you write multiple independent pass functions that each operate on the same state. If WorldState owned its own update logic, you could not split processing into named passes (input, AI, combat, cleanup, render) without the struct knowing about all of them.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

// TODO: Define WorldState struct with:
//   char grid[H][W]
//   int ptx, pty, php, pgold
//   int etx[MAX_E], ety[MAX_E], ehp[MAX_E]
//   bool ealive[MAX_E]
//   int entity_count
//   int turn

// TODO: Write initWorld(WorldState& w) that:
//   - fills grid with '.', walls with '#'
//   - sets player at (1,1), hp=100, gold=0
//   - sets one orc at (3,1), hp=10
//   - sets entity_count=1, turn=0

int main(){
    // TODO: Create WorldState, call initWorld, print state
    // Expected output:
    // DUNGEON|rpg-v0
    // WORLD|entities=1|turn=0
    // ENTITY|hero|player|24|24|24|24
    // ENTITY|orc|enemy|72|24|24|24
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct WorldState {
    char grid[H][W];
    int ptx, pty, php, pgold;
    int etx[MAX_E], ety[MAX_E], ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_count;
    int turn;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.ptx=1; w.pty=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.etx[i]=0;w.ety[i]=0;w.ehp[i]=0;w.ealive[i]=false;}
    w.etx[0]=3; w.ety[0]=1; w.ehp[0]=10; w.ealive[0]=true;
    w.entity_count=1;
    w.turn=0;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;
    cout << "WORLD|entities=" << w.entity_count << "|turn=" << w.turn << endl;
    cout << "ENTITY|hero|player|" << w.ptx*TILE << "|" << w.pty*TILE << "|24|24" << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.ealive[i])
            cout << "ENTITY|orc|enemy|" << w.etx[i]*TILE << "|" << w.ety[i]*TILE << "|24|24" << endl;
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "Dungeon header printed", expectedOutput: "DUNGEON\\|rpg-v0", isPattern: true },
      { id: "t2", description: "World state summary", expectedOutput: "WORLD\\|entities=1\\|turn=0", isPattern: true },
      { id: "t3", description: "Hero entity at correct position", expectedOutput: "ENTITY\\|hero\\|player\\|24\\|24\\|24\\|24", isPattern: true },
      { id: "t4", description: "Orc entity at correct position", expectedOutput: "ENTITY\\|orc\\|enemy\\|72\\|24\\|24\\|24", isPattern: true },
    ],
    hints: [
      "A struct groups variables under one name. Think about what data the micro dungeon used -- grid, player pos, enemy arrays.",
      "Define struct WorldState with grid[H][W], ptx, pty, php, pgold, etx[MAX_E], ety[MAX_E], ehp[MAX_E], ealive[MAX_E], entity_count, turn.",
      "In initWorld, fill the grid, set w.ptx=1, w.pty=1, w.etx[0]=3, w.ety[0]=1, w.ehp[0]=10, w.ealive[0]=true, w.entity_count=1, w.turn=0.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Full Game Using WorldState",
    type: "game_builder",
    instructions: `# Build: Full Game Using WorldState

## Mental Model

The micro dungeon from Lesson 10 worked, but its state was scattered. Now every variable lives inside WorldState. The game logic is identical -- move, fight, cleanup, render -- but every function takes WorldState& instead of 15 loose parameters. This is the same game, restructured for clarity and future expansion.

## What Breaks Without This

Try adding a save function to the Lesson 10 code. You would need to serialize ptx, pty, php, pgold, etx[], ety[], ehp[], ealive[], ecount, and the grid -- separately. Miss one variable and the save is corrupt. With WorldState, you serialize one struct. One source of truth means one thing to get right.

## The Fix

Refactor the Lesson 10 micro dungeon: move all state into WorldState, rewrite each pass as a free function taking WorldState&, and run the same scripted 5-turn sequence. The output includes DUNGEON|rpg-v0 header, grid rows, entity positions, turn counts, HP, gold, and the win message.

## Key Concepts

- **Free functions on shared state** -- passPlayerInput(w, key), passEnemyAI(w), passCombat(w), passCleanup(w), passRender(w)
- **Grid rendering** -- output each row of the grid as GRID_ROW|row_string
- **Struct initialization** -- initWorld sets every field to a known value

## Performance Insight

Passing WorldState& is an 8-byte pointer. No copies. The compiler inlines small pass functions, so the generated code is identical to the scattered-variable version. Zero overhead for better organization.

## Memory Insight

WorldState on the stack: grid=100 bytes, player=16 bytes, entity arrays=4*MAX_E*4=64 bytes each, ~500 bytes total. One struct, one allocation (stack frame), zero heap.

## Your Task

Rewrite the micro dungeon using WorldState. Hero at (1,1), orc at (3,1) with 10 HP. Script: d,d,f,f (move right twice, attack twice). The orc should die and the game should print WIN. Expected output includes:

\`\`\`
DUNGEON|rpg-v0
TURN|1
HP|100
GOLD|0
...
TURN|4
HP|100
GOLD|10
WIN|hero|orc_defeated|gold=10
GAME_MESSAGE|World state struct operational.
\`\`\`

## Beginner Trap

**Copying WorldState instead of passing by reference.** If you write \`void passRender(WorldState w)\` (no &), every call copies 500 bytes and changes are lost. Always use WorldState& for mutation, const WorldState& for read-only.

## Elite Insight

Diablo 2's game state struct was designed to be memcpy-safe -- no pointers, no heap references, just flat data. This made save/load trivial and anti-cheat checksumming possible. Your WorldState follows the same principle: flat, copyable, hashable.

## Mastery Check

If you add a new field to WorldState (e.g., int room_id), how many functions need to change? Answer: Only initWorld() (to set the default) and any function that uses room_id. No function signatures change because they all take WorldState&. This is the power of grouping state: adding fields is local, not global.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct WorldState {
    char grid[H][W];
    int ptx, pty, php, pgold;
    int etx[MAX_E], ety[MAX_E], ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_count;
    int turn;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.ptx=1; w.pty=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.etx[i]=0;w.ety[i]=0;w.ehp[i]=0;w.ealive[i]=false;}
    w.etx[0]=3; w.ety[0]=1; w.ehp[0]=10; w.ealive[0]=true;
    w.entity_count=1; w.turn=0;
}

bool canMove(const WorldState& w, int tx, int ty, int dx, int dy){
    int nx=tx+dx, ny=ty+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}
bool isAdjacent(int ax,int ay,int bx,int by){
    return (abs(ax-bx)+abs(ay-by))==1;
}

// TODO: Implement passPlayerInput(WorldState& w, char key)
//   - move player on w/a/s/d
//   - attack adjacent enemies on 'f'

// TODO: Implement passCleanup(WorldState& w)
//   - mark dead enemies (hp<=0), award gold

// TODO: Implement passRender(const WorldState& w)
//   - print ENTITY lines, TURN, HP, GOLD

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    char inputs[]={'d','d','f','f'};
    int nticks=4;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        // TODO: call passPlayerInput, passCleanup, passRender
        // TODO: check win condition
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct WorldState {
    char grid[H][W];
    int ptx, pty, php, pgold;
    int etx[MAX_E], ety[MAX_E], ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_count;
    int turn;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.ptx=1; w.pty=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.etx[i]=0;w.ety[i]=0;w.ehp[i]=0;w.ealive[i]=false;}
    w.etx[0]=3; w.ety[0]=1; w.ehp[0]=10; w.ealive[0]=true;
    w.entity_count=1; w.turn=0;
}

bool canMove(const WorldState& w, int tx, int ty, int dx, int dy){
    int nx=tx+dx, ny=ty+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}
bool isAdjacent(int ax,int ay,int bx,int by){
    return (abs(ax-bx)+abs(ay-by))==1;
}

void passPlayerInput(WorldState& w, char key){
    if(key=='d'||key=='a'||key=='w'||key=='s'){
        int dx=(key=='d')?1:(key=='a')?-1:0;
        int dy=(key=='s')?1:(key=='w')?-1:0;
        if(canMove(w,w.ptx,w.pty,dx,dy)){w.ptx+=dx;w.pty+=dy;}
    }
    if(key=='f'){
        for(int i=0;i<w.entity_count;i++){
            if(w.ealive[i]&&isAdjacent(w.ptx,w.pty,w.etx[i],w.ety[i])){
                w.ehp[i]-=10;
            }
        }
    }
}

void passCleanup(WorldState& w){
    for(int i=0;i<w.entity_count;i++){
        if(w.ealive[i]&&w.ehp[i]<=0){
            w.ealive[i]=false;
            w.pgold+=10;
        }
    }
}

void passRender(const WorldState& w){
    cout << "ENTITY|hero|player|" << w.ptx*TILE << "|" << w.pty*TILE << "|24|24" << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.ealive[i])
            cout << "ENTITY|orc|enemy|" << w.etx[i]*TILE << "|" << w.ety[i]*TILE << "|24|24" << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.php << endl;
    cout << "GOLD|" << w.pgold << endl;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    char inputs[]={'d','d','f','f'};
    int nticks=4;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        passPlayerInput(w, inputs[t]);
        passCleanup(w);
        passRender(w);

        int alive=0;
        for(int i=0;i<w.entity_count;i++) if(w.ealive[i]) alive++;
        if(alive==0){
            cout << "WIN|hero|orc_defeated|gold=" << w.pgold << endl;
            cout << "GAME_MESSAGE|World state struct operational." << endl;
            break;
        }
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header", expectedOutput: "DUNGEON\\|rpg-v0", isPattern: true },
      { id: "g2", description: "Turn counter increments", expectedOutput: "TURN\\|1", isPattern: true },
      { id: "g3", description: "Gold awarded on kill", expectedOutput: "GOLD\\|10", isPattern: true },
      { id: "g4", description: "Win message printed", expectedOutput: "WIN\\|hero\\|orc_defeated\\|gold=10", isPattern: true },
      { id: "g5", description: "World state message", expectedOutput: "GAME_MESSAGE\\|World state struct operational\\.", isPattern: true },
    ],
    hints: [
      "Each pass function takes WorldState& -- think about which fields each pass reads vs writes.",
      "passPlayerInput handles both movement (wasd) and attack (f). passCleanup checks ehp<=0 and awards gold. passRender prints ENTITY, TURN, HP, GOLD lines.",
      "The win check counts alive enemies after cleanup. If alive==0, print WIN|hero|orc_defeated|gold=N and GAME_MESSAGE, then break.",
    ],
    estimatedMinutes: 15,
  },
};