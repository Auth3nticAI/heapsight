import { Lesson } from "@/types/lesson";

export const lessonRPG33: Lesson = {
  id: "rpg-33-world-loading-v0",
  title: "World Loading v0",
  description: "Room layout loaded from data instead of hardcoded — levels become data-driven with zero code changes per room.",
  order: 33,
  xpReward: 100,
  tier: "pro",
  concepts: ["data-driven design", "room loading", "embedded data", "parse loop"],
  part1: {
    title: "Concept: Levels as Data, Not Code",
    type: "concept",
    instructions: `# World Loading v0

## Mental Model
A level is not code — it is data. A flat string of characters describes the room: '#' for walls, '.' for floors, '@' for player spawn, 'E' for enemy spawn. A parse function reads this data and fills the grid and entity arrays. To add a new room, you write a new data string. Zero code changes.

This is data-driven design. The engine (your parse function) is generic. The content (room strings) is specific. Separating engine from content is how real games ship 100 levels without 100 code paths.

## What Breaks Without This
Right now, \`init_world\` hardcodes the grid with a nested loop that places walls on the border. Want a room with internal walls? Edit init_world. Want a second room? Copy-paste init_world and change the wall positions. Want 10 rooms? 10 functions, each with hardcoded coordinates. This does not scale.

With data-driven loading, init_world becomes \`loadRoom(data)\`. Each room is a string. Adding a room means adding a string — no function changes, no new code paths, no risk of breaking existing rooms.

## The Fix: Parse a Room String

A room is stored as a flat \`const char[]\` array — row-major, no separators:

\`\`\`cpp
const char ROOM_DATA[] =
    "########"
    "#@.....#"
    "#..E...#"
    "#.....E#"
    "########";
\`\`\`

The parse loop walks each cell, checks the character, and fills the grid:

\`\`\`cpp
for (int y = 0; y < H; y++) {
    for (int x = 0; x < W; x++) {
        char c = ROOM_DATA[y * W + x];
        if (c == '@') {
            player_x = x; player_y = y;
            grid[y][x] = '.';
        } else if (c == 'E') {
            enemy_x[enemy_count] = x;
            enemy_y[enemy_count] = y;
            enemy_count++;
            grid[y][x] = '.';
        } else {
            grid[y][x] = c;
        }
    }
}
\`\`\`

Spawn characters ('@', 'E') are replaced with floor tiles after extracting entity positions. The grid stores terrain only. Entities live in parallel arrays.

## Key Concepts
- Room data is a const char array — read-only, compile-time, zero allocation.
- Parse loop: y * W + x maps 2D coordinates to a 1D string index.
- Spawn extraction: '@' and 'E' become entity positions, grid stores '.'.
- Data/code separation: changing the room string changes the level without touching engine code.

## Performance Insight
Room parsing happens once at load time — not in the game loop. A 10x10 room is 100 character comparisons. Even a 100x100 room is 10,000 comparisons — under a microsecond on modern hardware. Load-time cost is irrelevant; the game loop never touches room data again.

## Memory Insight
\`const char ROOM_DATA[]\` lives in the read-only data segment — not the heap, not the stack. The compiler embeds it directly in the binary. Zero allocation. The grid it fills is a stack array in WorldState. Gate A compliance: loading happens before the game loop starts.

## Your Task
Parse \`ROOM_DATA\` to fill the grid, extract the player spawn position, and extract enemy spawn positions. Print each spawn, then render the grid (with spawns replaced by floor tiles).

Expected output:
\`\`\`
SPAWN|player|pos=(1,1)
SPAWN|enemy|pos=(3,2)
SPAWN|enemy|pos=(6,3)
########
#......#
#......#
#......#
########
\`\`\`

## Beginner Trap
**Leaving '@' and 'E' in the grid after extracting spawn positions.** The grid should contain only terrain: '#' and '.'. If you leave '@' in the grid, the collision system will treat the player's spawn tile as a wall (it is neither '#' nor '.'). Replace spawn characters with '.' after recording the position.

## Elite Insight
Nethack stores every dungeon level as a text file with the same convention: '#' for walls, '.' for floors, special characters for stairs, traps, and monsters. The level loader parses these files at runtime, filling the same kind of grid + entity arrays you are building. Your ROOM_DATA string is the compile-time equivalent of Nethack's level files.

## Systems Thinking Connection
The Space Shooter path loads wave data from arrays. The Platformer path loads tile maps from strings. The Robotics path loads obstacle maps from grid data. All four paths hit the same insight: content is data, not code. The parse function is the bridge between static data and runtime state.

## Skill Reinforcement
Lessons 31-32 extracted input and output into modules. This lesson extracts initialization into data. The pattern is the same: identify hardcoded logic, replace it with a generic function that reads structured data. Lesson 34 will apply this to enemy behavior — AI as data lookup.

## Mastery Check
Question: Why use a flat char array instead of a 2D array for room data?
Answer: Because C++ string literal concatenation produces a flat array automatically. \`"####" "####"\` concatenates to \`"########"\` at compile time. A 2D array would require explicit row initialization. The flat array plus \`y * W + x\` indexing is simpler and matches how data files store level layouts.`,
    starterCode: `#include <iostream>
using namespace std;

const int GRID_W = 8;
const int GRID_H = 5;

const char ROOM_DATA[] =
    "########"
    "#@.....#"
    "#..E...#"
    "#.....E#"
    "########";

int main() {
    char grid[GRID_H][GRID_W];
    int player_x = 0, player_y = 0;
    int enemy_x[4], enemy_y[4];
    int enemy_count = 0;

    // TODO: Parse ROOM_DATA into grid
    // For each cell at (x, y):
    //   Index into ROOM_DATA: y * GRID_W + x
    //   '@' -> record player position, put '.' in grid
    //   'E' -> record enemy position, put '.' in grid
    //   Otherwise -> copy character to grid

    cout << "SPAWN|player|pos=(" << player_x << "," << player_y << ")" << endl;
    for (int i = 0; i < enemy_count; i++) {
        cout << "SPAWN|enemy|pos=(" << enemy_x[i] << "," << enemy_y[i] << ")" << endl;
    }

    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            cout << grid[y][x];
        }
        cout << endl;
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int GRID_W = 8;
const int GRID_H = 5;

const char ROOM_DATA[] =
    "########"
    "#@.....#"
    "#..E...#"
    "#.....E#"
    "########";

int main() {
    char grid[GRID_H][GRID_W];
    int player_x = 0, player_y = 0;
    int enemy_x[4], enemy_y[4];
    int enemy_count = 0;

    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            char c = ROOM_DATA[y * GRID_W + x];
            if (c == '@') {
                player_x = x;
                player_y = y;
                grid[y][x] = '.';
            } else if (c == 'E') {
                enemy_x[enemy_count] = x;
                enemy_y[enemy_count] = y;
                enemy_count++;
                grid[y][x] = '.';
            } else {
                grid[y][x] = c;
            }
        }
    }

    cout << "SPAWN|player|pos=(" << player_x << "," << player_y << ")" << endl;
    for (int i = 0; i < enemy_count; i++) {
        cout << "SPAWN|enemy|pos=(" << enemy_x[i] << "," << enemy_y[i] << ")" << endl;
    }

    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            cout << grid[y][x];
        }
        cout << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Player spawn extracted from data", expectedOutput: "SPAWN|player|pos=(1,1)", isPattern: false },
      { id: "t2", description: "First enemy spawn extracted", expectedOutput: "SPAWN|enemy|pos=(3,2)", isPattern: false },
      { id: "t3", description: "Second enemy spawn extracted", expectedOutput: "SPAWN|enemy|pos=(6,3)", isPattern: false },
    ],
    hints: [
      "Use a nested loop: outer y from 0 to GRID_H, inner x from 0 to GRID_W. Index into ROOM_DATA with y * GRID_W + x.",
      "When you find '@', set player_x = x and player_y = y, then put '.' in grid[y][x]. Don't leave '@' in the grid.",
      "When you find 'E', store the position in enemy_x/enemy_y at index enemy_count, then increment enemy_count and put '.' in grid."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Data-Driven World Init",
    type: "game_builder",
    instructions: `# Build: Data-Driven World Init

## Mental Model
Replace the hardcoded \`init_world\` with \`loadRoom\` — a function that takes a room data string and fills WorldState from it. The room string defines the grid, player position, and enemy positions. The game pipeline stays the same: loadRoom → captureInput → game_tick → renderWorld. Only the initialization changes.

This means adding a new room is now trivial: define a new \`const char[]\` string. The engine code never changes.

## What Breaks Without This
With hardcoded init_world, every room needs a separate initialization function. Room 1 places the player at (1,1). Room 2 places them at (3,4). Room 3 has a different wall layout. Each room is a custom function. With loadRoom, all rooms use the same function — the data string encodes the differences.

## The Fix: loadRoom Function

\`\`\`cpp
void loadRoom(WorldState& w, const char* data,
              int dw, int dh, unsigned int seed) {
    w = {};
    w.seed = seed;
    rng_seed(w.rng, seed);
    w.entity_count = 0;
    for (int y = 0; y < dh && y < H; y++) {
        for (int x = 0; x < dw && x < W; x++) {
            char c = data[y * dw + x];
            if (c == '@') {
                int id = w.entity_count++;
                w.pos_x[id] = x; w.pos_y[id] = y;
                w.hp[id] = 30; w.alive[id] = true;
                w.grid[y][x] = '.';
            } else if (c == 'E') {
                int id = w.entity_count++;
                w.pos_x[id] = x; w.pos_y[id] = y;
                w.hp[id] = 10; w.alive[id] = true;
                w.grid[y][x] = '.';
            } else {
                w.grid[y][x] = c;
            }
        }
    }
}
\`\`\`

The player is always entity 0 (first '@' found). Enemies are entities 1+. The parse order (row-major, top-to-bottom) determines entity IDs.

## Key Concepts
- loadRoom replaces init_world — generic function, specific data
- Entity IDs assigned by parse order: player first, enemies in top-down left-right order
- \`w = {}\` zero-initializes before loading — clean slate each room
- Room dimensions passed as parameters — rooms can vary in size

## Performance Insight
loadRoom runs once per room transition. A 10x10 room is 100 iterations with simple character comparisons. Cost: negligible. The game loop never calls loadRoom — it only runs game_tick and renderWorld.

## Memory Insight
The room data string is const — stored in the binary's read-only segment. loadRoom writes into WorldState's stack arrays. No heap allocation. entity_count tracks how many entities were spawned from the data. Gate A: loadRoom runs before the game loop, so allocations (if any) would be pre-loop. But there are none.

## Your Task
Implement \`loadRoom\` and wire it into the game pipeline. Use the provided room data with a player and two enemies. Run 5 ticks and verify the loaded world works correctly.

Expected output (final tick):
\`\`\`
INPUT|tick=5|dx=1|dy=0|atk=0
RENDER|turn=5|entities=3
ENT|id=0|pos=(5,2)|hp=30
ENT|id=1|pos=(5,5)|hp=10
ENT|id=2|pos=(5,8)|hp=10
\`\`\`

## Beginner Trap
**Hardcoding entity positions in loadRoom instead of reading them from the data string.** If you write \`w.pos_x[0] = 1\` inside loadRoom, you have just rebuilt init_world with a different name. The whole point is that entity positions come FROM the room data. loadRoom should not contain any coordinate literals.

## Elite Insight
Doom's WAD file format stores levels as binary data — vertices, linedefs, sectors, things. The engine's level loader parses this data into runtime structures. Adding a new level means adding a new WAD lump — no engine code changes. Your loadRoom + ROOM_DATA follows the same architecture: a generic loader plus external data.

## Mastery Check
Question: What happens if the room data contains two '@' characters?
Answer: Both are treated as entity spawns. Entity 0 is the first '@' found. Entity 1 is the second '@'. The game_tick function moves entity 0 as the player and treats entity 1+ as enemies. The second '@' would become an enemy that happens to start at a player-marked position. To prevent this, you could add a guard: ignore '@' after the first one.`,
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

const char ROOM_DATA[] =
    "##########"
    "#@.......#"
    "#........#"
    "#........#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#.......E#"
    "##########";

// TODO: Implement loadRoom(WorldState& w, const char* data, int dw, int dh, unsigned int seed)
// Zero-initialize w, set seed, parse data into grid and entities
// '@' -> entity with hp=30 (player), 'E' -> entity with hp=10 (enemy)
// Print: LOAD|room=DWxDH|entities=N

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
    WorldState w;
    // TODO: Call loadRoom instead of hardcoded init
    // loadRoom(w, ROOM_DATA, W, H, 42);

    char inputs[]={'d','d','s','d','d'};
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

const char ROOM_DATA[] =
    "##########"
    "#@.......#"
    "#........#"
    "#........#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#.......E#"
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
                w.grid[y][x]='.';
            } else if(c=='E'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=10; w.alive[id]=true;
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

    char inputs[]={'d','d','s','d','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loaded with entity count", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g2", description: "Player final position correct", expectedOutput: "ENT|id=0|pos=(5,2)|hp=30", isPattern: false },
      { id: "g3", description: "Enemy 1 final position", expectedOutput: "ENT|id=1|pos=(5,5)|hp=10", isPattern: false },
      { id: "g4", description: "Enemy 2 final position", expectedOutput: "ENT|id=2|pos=(5,8)|hp=10", isPattern: false },
      { id: "g5", description: "Render shows 3 entities", expectedOutput: "RENDER|turn=5|entities=3", isPattern: false },
    ],
    hints: [
      "Zero-initialize WorldState with w={}, set seed, then loop over the data string using y * dw + x indexing.",
      "For '@', assign entity with hp=30. For 'E', assign entity with hp=10. Use w.entity_count++ to get the next ID.",
      "Call loadRoom(w, ROOM_DATA, W, H, 42) in main before the game loop. It replaces the old init_world function."
    ],
    estimatedMinutes: 12,
  },
};
