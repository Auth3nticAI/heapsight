import { Lesson } from "@/types/lesson";

export const lessonRPG12: Lesson = {
  id: "rpg-12-types-and-coordinates",
  title: "Types and Coordinates",
  description: "Introduce Vec2i struct and TileType enum to replace raw ints with typed, self-documenting values.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["Vec2i", "type safety", "enum", "coordinate system", "self-documenting code"],
  part1: {
    title: "Concept: Vec2i and Type Safety",
    type: "concept",
    instructions: `# Types and Coordinates

## Mental Model

Your WorldState stores player position as ptx and pty -- two separate ints. Enemy positions are etx[] and ety[] -- two separate arrays. When you pass a position to a function, you pass two ints. Forget one, swap the order, mix up x and y -- the compiler says nothing. A Vec2i struct bundles x and y into one value. The type system catches the mistakes you would otherwise ship.

## What Breaks Without This

Call moveEntity(3, 1) when you meant moveEntity(1, 3). The compiler accepts both. Your entity teleports to the wrong tile. You spend 20 minutes debugging a swap that a type would have prevented. Now multiply that by every function that takes coordinates. Raw ints are invisible bugs waiting to happen.

## The Fix: Vec2i Struct

Define a simple struct: struct Vec2i { int x; int y; }. Now positions are single values. You can add them, compare them, and pass them as one argument. An isAdjacent function takes two Vec2i values instead of four ints. The code reads like intent: pos, target, delta -- not ax, ay, bx, by.

Add a TileType enum to replace magic characters. Instead of checking grid[y][x]=='#', check grid[y][x]==TILE_WALL. The enum documents intent and prevents typos. A '#' is meaningless; TILE_WALL is a contract.

These types cost nothing at runtime. The compiler generates the same machine code for Vec2i.x as for a raw int. Type safety is free.

## Key Concepts

- **Vec2i** -- struct with int x, y. Replaces all coordinate pairs.
- **TileType enum** -- TILE_FLOOR, TILE_WALL. Replaces magic characters.
- **Operator overloading** -- Vec2i operator+(Vec2i a, Vec2i b) for clean arithmetic.
- **Type safety** -- compiler catches mismatched arguments that raw ints hide.

## Performance Insight

Vec2i is two ints (8 bytes). It fits in a register pair. The compiler passes it by value as efficiently as two separate ints. Enum values are ints at the machine level. Zero overhead for type safety. The CPU does not know the difference between int x and Vec2i.x.

## Memory Insight

Vec2i is 8 bytes on the stack. An array of Vec2i is contiguous in memory -- Vec2i positions[MAX_E] gives you x0,y0,x1,y1,x2,y2... in sequence. This is AoS (Array of Structs) layout. In Lesson 14, we will compare this with SoA (Structure of Arrays) where x[] and y[] are separate. Both work; they optimize for different access patterns.

## Your Task

Define Vec2i with x,y and an add function. Define TileType enum. Create a player at {1,1} and orc at {3,1}. Print using Vec2i:

\`\`\`
DUNGEON|rpg-v0
ENTITY|hero|player|24|24|24|24
ENTITY|orc|enemy|72|24|24|24
ADJACENT|false
MOVED|hero|48|24
ADJACENT|true
\`\`\`

## Beginner Trap

**Making Vec2i a class with private members.** Beginners add getters, setters, constructors with validation. Vec2i is plain data -- a POD (Plain Old Data) struct. Public members, no methods beyond arithmetic operators. Keep it simple. The compiler optimizes POD structs aggressively; it cannot optimize through getter/setter indirection as easily.

## Elite Insight

Every professional game engine has a Vec2 type. Unity has Vector2Int. Unreal has FIntPoint. Godot has Vector2i. Nethack uses coord (a struct with x,y). The pattern is universal because coordinate pairs are the most common data in any spatial system. Carmack's Doom used fixed-point coordinates -- still a struct, still typed.

## Systems Thinking Connection

In the Platformer path, Vec2 stores floating-point positions for physics. In Robotics, geometry_msgs::Point serves the same role. The concept is identical: bundle coordinates into a typed value. The RPG uses integers because the grid is discrete.

## Skill Reinforcement

Lesson 11 introduced WorldState with raw int coordinates. This lesson replaces them with Vec2i. Lesson 13 will add entity IDs that reference positions by ID instead of array index.

## Mastery Check

Why use Vec2i instead of std::pair<int,int>? Answer: Vec2i has named members (.x, .y) that document intent. std::pair uses .first and .second -- meaningless names that force you to remember which is x and which is y. Named members prevent bugs; generic pairs invite them.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int TILE=24;

// TODO: Define Vec2i struct with int x, y

// TODO: Define vec2iAdd(Vec2i a, Vec2i b) returning Vec2i

// TODO: Define isAdjacent(Vec2i a, Vec2i b) returning bool
//   Manhattan distance == 1

int main(){
    // TODO: Create player_pos {1,1} and orc_pos {3,1}
    // TODO: Print DUNGEON|rpg-v0
    // TODO: Print ENTITY lines using pos.x*TILE, pos.y*TILE
    // TODO: Print ADJACENT|false (distance is 2)
    // TODO: Move player right by {1,0} using vec2iAdd
    // TODO: Print MOVED|hero|new_x*TILE|new_y*TILE
    // TODO: Print ADJACENT|true (distance is now 1)
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int TILE=24;

struct Vec2i { int x; int y; };

Vec2i vec2iAdd(Vec2i a, Vec2i b){
    Vec2i r; r.x=a.x+b.x; r.y=a.y+b.y; return r;
}

bool isAdjacent(Vec2i a, Vec2i b){
    return (abs(a.x-b.x)+abs(a.y-b.y))==1;
}

int main(){
    Vec2i player_pos; player_pos.x=1; player_pos.y=1;
    Vec2i orc_pos; orc_pos.x=3; orc_pos.y=1;

    cout << "DUNGEON|rpg-v0" << endl;
    cout << "ENTITY|hero|player|" << player_pos.x*TILE << "|" << player_pos.y*TILE << "|24|24" << endl;
    cout << "ENTITY|orc|enemy|" << orc_pos.x*TILE << "|" << orc_pos.y*TILE << "|24|24" << endl;
    cout << "ADJACENT|" << (isAdjacent(player_pos,orc_pos)?"true":"false") << endl;

    Vec2i delta; delta.x=1; delta.y=0;
    player_pos = vec2iAdd(player_pos, delta);
    cout << "MOVED|hero|" << player_pos.x*TILE << "|" << player_pos.y*TILE << endl;
    cout << "ADJACENT|" << (isAdjacent(player_pos,orc_pos)?"true":"false") << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Dungeon header", expectedOutput: "DUNGEON\\|rpg-v0", isPattern: true },
      { id: "t2", description: "Hero at Vec2i position", expectedOutput: "ENTITY\\|hero\\|player\\|24\\|24", isPattern: true },
      { id: "t3", description: "Adjacency check false at distance 2", expectedOutput: "ADJACENT\\|false", isPattern: true },
      { id: "t4", description: "Player moved with vec2iAdd", expectedOutput: "MOVED\\|hero\\|48\\|24", isPattern: true },
      { id: "t5", description: "Adjacency check true at distance 1", expectedOutput: "ADJACENT\\|true", isPattern: true },
    ],
    hints: [
      "A struct with two int members bundles x and y. Think: struct Vec2i { int x; int y; };",
      "vec2iAdd returns a new Vec2i with r.x = a.x + b.x, r.y = a.y + b.y. isAdjacent checks Manhattan distance == 1.",
      "Create player_pos with x=1,y=1. Add delta {1,0} to get {2,1}. Then isAdjacent({2,1},{3,1}) is true because |2-3|+|1-1|=1.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Refactored Game with Vec2i",
    type: "game_builder",
    instructions: `# Build: Refactored Game with Vec2i

## Mental Model

Take the WorldState game from Lesson 11 and replace every raw coordinate pair with Vec2i. The player position becomes Vec2i player_pos. Enemy positions become Vec2i entity_pos[MAX_E]. Movement uses vec2iAdd. Adjacency checks use Vec2i parameters. The game logic is identical, but the code reads like intent.

## What Breaks Without This

As the RPG grows, you will pass coordinates to dozens of functions: canMove, isAdjacent, findNearby, renderAt, spawnAt. With raw ints, every function signature is (int x, int y, int dx, int dy) -- four unmarked ints that can be swapped silently. With Vec2i, you pass (Vec2i pos, Vec2i delta) -- two named values that the type system protects.

## The Fix

Refactor WorldState to use Vec2i player_pos instead of ptx/pty. Use Vec2i entity_pos[MAX_E] instead of etx[]/ety[]. Update all pass functions. Run the same scripted game: move right twice, attack twice, kill the orc.

## Key Concepts

- **WorldState with Vec2i** -- player_pos and entity_pos[] replace raw int pairs
- **Function signatures** -- canMove(WorldState&, Vec2i, Vec2i) instead of (WorldState&, int, int, int, int)
- **Grid rendering** -- render each row as GRID_ROW for visible output

## Performance Insight

Vec2i is 8 bytes, same as two ints. The compiler passes small structs in registers. Function calls with Vec2i parameters generate identical machine code to those with two int parameters. The refactor is zero-cost.

## Memory Insight

Vec2i entity_pos[4] is 32 bytes contiguous. Compared to separate etx[4] (16 bytes) and ety[4] (16 bytes) -- same total, different layout. The Vec2i version is AoS: x0,y0,x1,y1. The separate arrays are SoA: x0,x1,x2,x3,y0,y1,y2,y3. For 4 entities, the difference is negligible. At 1000 entities, SoA wins for batch processing. We will revisit this in Lesson 14.

## Your Task

Refactor the L11 game to use Vec2i. Hero at {1,1}, orc at {3,1}, 10 HP. Script: d,d,f,f. Expected output:

\`\`\`
DUNGEON|rpg-v0
ENTITY|hero|player|24|24|24|24
ENTITY|orc|enemy|72|24|24|24
TURN|1
HP|100
GOLD|0
...
TURN|4
HP|100
GOLD|10
WIN|hero|orc_defeated|gold=10
GAME_MESSAGE|Vec2i refactor complete.
\`\`\`

## Beginner Trap

**Forgetting to update ALL coordinate usage.** You replace player_pos but leave raw ints in the adjacency check. The code compiles because ints and Vec2i.x are both ints. But the function signature no longer matches. Refactor completely -- do not leave half-converted code.

## Elite Insight

Unreal Engine's FVector and FIntPoint are used everywhere -- not because they are fancy, but because they prevent the single most common spatial bug: swapped coordinates. Epic's codebase has millions of lines; without typed vectors, coordinate bugs would be endemic. Your Vec2i follows the same discipline at a smaller scale.

## Mastery Check

When should you use Vec2i (AoS) vs separate x[]/y[] arrays (SoA)? Answer: Use Vec2i when you access x and y together (movement, adjacency, rendering). Use separate arrays when you process all x values in a batch, then all y values. The RPG uses Vec2i because grid operations always need both coordinates. The Space Shooter path uses SoA because system loops process one component array at a time.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct Vec2i { int x; int y; };

Vec2i vec2iAdd(Vec2i a, Vec2i b){
    Vec2i r; r.x=a.x+b.x; r.y=a.y+b.y; return r;
}
bool isAdjacent(Vec2i a, Vec2i b){
    return (abs(a.x-b.x)+abs(a.y-b.y))==1;
}

struct WorldState {
    char grid[H][W];
    Vec2i player_pos;
    int php, pgold;
    Vec2i entity_pos[MAX_E];
    int ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_count;
    int turn;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.player_pos.x=1; w.player_pos.y=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.entity_pos[i].x=0;w.entity_pos[i].y=0;w.ehp[i]=0;w.ealive[i]=false;}
    w.entity_pos[0].x=3; w.entity_pos[0].y=1; w.ehp[0]=10; w.ealive[0]=true;
    w.entity_count=1; w.turn=0;
}

bool canMove(const WorldState& w, Vec2i pos, Vec2i delta){
    Vec2i np = vec2iAdd(pos, delta);
    if(np.x<0||np.x>=W||np.y<0||np.y>=H) return false;
    return w.grid[np.y][np.x]!='#';
}

// TODO: Implement passPlayerInput(WorldState& w, char key)
//   - movement on wasd using Vec2i delta and vec2iAdd
//   - attack on 'f' using isAdjacent with Vec2i

// TODO: Implement passCleanup(WorldState& w)

// TODO: Implement passRender(const WorldState& w)

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    char inputs[]={'d','d','f','f'};
    int nticks=4;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        // TODO: call pass functions and check win
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct Vec2i { int x; int y; };

Vec2i vec2iAdd(Vec2i a, Vec2i b){
    Vec2i r; r.x=a.x+b.x; r.y=a.y+b.y; return r;
}
bool isAdjacent(Vec2i a, Vec2i b){
    return (abs(a.x-b.x)+abs(a.y-b.y))==1;
}

struct WorldState {
    char grid[H][W];
    Vec2i player_pos;
    int php, pgold;
    Vec2i entity_pos[MAX_E];
    int ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_count;
    int turn;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.player_pos.x=1; w.player_pos.y=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.entity_pos[i].x=0;w.entity_pos[i].y=0;w.ehp[i]=0;w.ealive[i]=false;}
    w.entity_pos[0].x=3; w.entity_pos[0].y=1; w.ehp[0]=10; w.ealive[0]=true;
    w.entity_count=1; w.turn=0;
}

bool canMove(const WorldState& w, Vec2i pos, Vec2i delta){
    Vec2i np = vec2iAdd(pos, delta);
    if(np.x<0||np.x>=W||np.y<0||np.y>=H) return false;
    return w.grid[np.y][np.x]!='#';
}

void passPlayerInput(WorldState& w, char key){
    if(key=='d'||key=='a'||key=='w'||key=='s'){
        Vec2i delta;
        delta.x=(key=='d')?1:(key=='a')?-1:0;
        delta.y=(key=='s')?1:(key=='w')?-1:0;
        if(canMove(w,w.player_pos,delta)){w.player_pos=vec2iAdd(w.player_pos,delta);}
    }
    if(key=='f'){
        for(int i=0;i<w.entity_count;i++){
            if(w.ealive[i]&&isAdjacent(w.player_pos,w.entity_pos[i])){
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
    cout << "ENTITY|hero|player|" << w.player_pos.x*TILE << "|" << w.player_pos.y*TILE << "|24|24" << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.ealive[i])
            cout << "ENTITY|orc|enemy|" << w.entity_pos[i].x*TILE << "|" << w.entity_pos[i].y*TILE << "|24|24" << endl;
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
            cout << "GAME_MESSAGE|Vec2i refactor complete." << endl;
            break;
        }
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header", expectedOutput: "DUNGEON\\|rpg-v0", isPattern: true },
      { id: "g2", description: "Hero entity rendered", expectedOutput: "ENTITY\\|hero\\|player", isPattern: true },
      { id: "g3", description: "Turn counter works", expectedOutput: "TURN\\|1", isPattern: true },
      { id: "g4", description: "Gold after orc kill", expectedOutput: "GOLD\\|10", isPattern: true },
      { id: "g5", description: "Win message with gold", expectedOutput: "WIN\\|hero\\|orc_defeated\\|gold=10", isPattern: true },
      { id: "g6", description: "Vec2i refactor message", expectedOutput: "GAME_MESSAGE\\|Vec2i refactor complete\\.", isPattern: true },
    ],
    hints: [
      "Replace ptx/pty with player_pos.x/player_pos.y everywhere. Replace etx[i]/ety[i] with entity_pos[i].x/entity_pos[i].y.",
      "passPlayerInput creates a Vec2i delta from the key, then uses vec2iAdd to update player_pos. Attack uses isAdjacent(w.player_pos, w.entity_pos[i]).",
      "The game flow is identical to L11: passPlayerInput, passCleanup, passRender, then win check. Only the data types changed.",
    ],
    estimatedMinutes: 15,
  },
};