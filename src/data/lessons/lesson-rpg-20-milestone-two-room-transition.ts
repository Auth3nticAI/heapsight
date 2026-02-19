import { Lesson } from "@/types/lesson";

export const lessonRPG20: Lesson = {
  id: "rpg-20-milestone-two-room-transition",
  title: "Milestone: Two Room Transition",
  description: "Room data as array. Stepping on exit tile loads new room. Room transition without heap allocation. Full Phase 2 pipeline.",
  order: 20,
  xpReward: 300,
  tier: "pro",
  concepts: ["milestone", "room data", "room transition", "data-driven levels", "pipeline integration", "exit tile"],
  part1: {
    title: "Concept: Room as Data",
    type: "concept",
    instructions: `# Milestone: Two Room Transition

## Mental Model

A room is not code. A room is data: a 2D array of tile characters, plus metadata like the player's spawn position and the exit tile location. Loading a new room means copying a tile array into WorldState and resetting entity positions. No heap allocation. No file I/O (yet). Just overwriting a fixed-size grid with new data.

## What Breaks Without This

\`\`\`cpp
// Room data hardcoded everywhere
void init_room() {
    for (int y=0; y<H; y++)
        for (int x=0; x<W; x++)
            grid[y][x] = (y==0||y==H-1||x==0||x==W-1) ? '#' : '.';
    // Where does room 2 go? Copy-paste this function?
    // What about room 3, room 4?
}
\`\`\`

Without rooms as data, every new room requires a new function. The code grows linearly with content. When you want 50 rooms, you write 50 init functions. Data-driven rooms let you define content in arrays and load them with one function: \`loadRoom()\`.

## The Fix: Room Struct

Define a Room struct that holds a tile grid, a player spawn, and an exit tile:

\`\`\`cpp
struct Room {
    char tiles[H][W];
    int spawn_x, spawn_y;
    int exit_x, exit_y;
};
\`\`\`

Define room data as constant arrays:

\`\`\`cpp
const Room ROOMS[2] = {
    // Room 0
    { {"##########",
       "#........#",
       "#........#",
       "#........#",
       "#........>"},  // > = exit tile
      1, 1,   // spawn
      8, 4 }, // exit
    // Room 1
    { {"##########",
       "#........#",
       "#...E....#",
       "#........#",
       "#........#"},
      1, 1,
      8, 4 }
};
\`\`\`

The \`loadRoom()\` function copies the Room data into WorldState:

\`\`\`cpp
void loadRoom(WorldState& w, int room_id) {
    const Room& r = ROOMS[room_id];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            w.grid[y][x] = r.tiles[y][x];
    w.pos_x[0] = r.spawn_x;
    w.pos_y[0] = r.spawn_y;
    w.room_id = room_id;
    cout << "ROOM_LOAD|" << room_id << endl;
}
\`\`\`

No allocation. No file reading. Just a memcpy-equivalent copy from const data to mutable WorldState. The room transition is instant and deterministic.

## Key Concepts

- **Room as data** — tile grids defined as constant arrays. loadRoom copies data into WorldState.
- **Exit tile** — a special tile (\`>\`) that triggers room transition when the player steps on it.
- **loadRoom()** — copies room data, sets spawn position, updates room_id. One function, any room.
- **Zero allocation** — the grid in WorldState is a fixed-size array. Loading a room overwrites it, never allocates.

## Performance Insight

Loading a room copies H*W characters (50 bytes for 5×10). This is a single memcpy-equivalent loop — nanoseconds. The room data is const, stored in the binary's read-only data segment. No file I/O, no parsing, no allocation. The transition is instant. In Lesson 33, rooms will load from files — but the pattern is the same: read data, copy into WorldState.

## Memory Insight

Room data lives in const static arrays — part of the binary, never allocated, never freed. WorldState.grid is a fixed-size 2D array inside the struct. loadRoom overwrites grid in-place. The total memory for 2 rooms is 2 * H * W = 100 bytes of const data plus H * W = 50 bytes of mutable grid. No heap. No pointers. No dynamic sizing.

## Your Task

Define a Room struct, two rooms, and a loadRoom function. Load room 0, print ROOM_LOAD. Then load room 1, print ROOM_LOAD. Verify the exit tile position:

\`\`\`
ROOM_LOAD|0
EXIT_TILE|8,4
SPAWN|1,1
ROOM_LOAD|1
EXIT_TILE|8,4
SPAWN|1,1
\`\`\`

## Beginner Trap

**Allocating new room data with \`new\`.** \`Room* r = new Room();\` creates a heap allocation that must be freed. The room data is constant — define it as \`const Room ROOMS[2]\` in static storage. loadRoom reads from const data, writes to WorldState's existing grid. No allocation necessary. No deallocation necessary.

## Elite Insight

Nintendo's original Legend of Zelda stored room data as 16×11 tile arrays in ROM. The "load room" function copied tile data from ROM into the working RAM grid. No allocation. No file system. The entire overworld was a 16×8 grid of rooms, each defined as a constant byte array. Your Room struct follows the exact same pattern: constant data, runtime copy, zero allocation. 40 years later, the pattern is still optimal.

## Systems Thinking Connection

Room transitions are the RPG equivalent of the Platformer path's level loading. Both paths use tile arrays as data, copy into mutable state, and reset entity positions. The key difference: the RPG uses an exit tile trigger (step on \`>\`), while the Platformer uses a flag/checkpoint trigger. Same pattern, different interaction model.

## Skill Reinforcement

Lesson 5 introduced walls as tile data. Lesson 15 established the stable update pipeline. Lessons 16–19 added commands, resolution, combat, and cleanup. This milestone integrates all of them: room data drives the grid, commands drive movement, combat and cleanup run in their passes, and room transitions happen through data.

## Mastery Check

When the player steps on the exit tile, should the room load happen during the movement pass or in a separate transition pass? Answer: In a separate transition pass (or at the start of the next tick). If loadRoom runs inside resolveCommands, it overwrites the grid while other commands may still reference old tile positions. The safe approach: after resolve, check if player is on exit tile. If so, set a "pending_transition" flag. At the start of the next tick, load the new room. This prevents mid-tick grid mutation.`,
    starterCode: `#include <iostream>
using namespace std;

const int W = 10, H = 5;

struct Room {
    char tiles[H][W];
    int spawn_x, spawn_y;
    int exit_x, exit_y;
};

// TODO: define ROOMS[2] - two rooms with tile data, spawn, and exit
// Room 0: walls on edges, '>' at (8,4). Spawn (1,1). Exit (8,4).
// Room 1: walls on edges, 'E' at (4,2). Spawn (1,1). Exit (8,4).

char grid[H][W];
int spawn_x, spawn_y;

// TODO: implement loadRoom(int room_id)
// Copy ROOMS[room_id].tiles into grid
// Set spawn_x/spawn_y from room data
// Print: ROOM_LOAD|N
// Print: EXIT_TILE|X,Y
// Print: SPAWN|X,Y

int main() {
    // TODO: load room 0, then load room 1
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W = 10, H = 5;

struct Room {
    char tiles[H][W];
    int spawn_x, spawn_y;
    int exit_x, exit_y;
};

const Room ROOMS[2] = {
    {
        {
            {'#','#','#','#','#','#','#','#','#','#'},
            {'#','.','.','.','.','.','.','.','.','#'},
            {'#','.','.','.','.','.','.','.','.','#'},
            {'#','.','.','.','.','.','.','.','.','#'},
            {'#','.','.','.','.','.','.','.','>', '#'}
        },
        1, 1,
        8, 4
    },
    {
        {
            {'#','#','#','#','#','#','#','#','#','#'},
            {'#','.','.','.','.','.','.','.','.','#'},
            {'#','.','.','.','E','.','.','.','.','#'},
            {'#','.','.','.','.','.','.','.','.','#'},
            {'#','.','.','.','.','.','.','.','.','#'}
        },
        1, 1,
        8, 4
    }
};

char grid[H][W];
int spawn_x, spawn_y;

void loadRoom(int room_id) {
    const Room& r = ROOMS[room_id];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = r.tiles[y][x];
    spawn_x = r.spawn_x;
    spawn_y = r.spawn_y;
    cout << "ROOM_LOAD|" << room_id << endl;
    cout << "EXIT_TILE|" << r.exit_x << "," << r.exit_y << endl;
    cout << "SPAWN|" << r.spawn_x << "," << r.spawn_y << endl;
}

int main() {
    loadRoom(0);
    loadRoom(1);
    return 0;
}`,
    tests: [
      { id: "t1", description: "Room 0 loaded", expectedOutput: "ROOM_LOAD\\|0", isPattern: true },
      { id: "t2", description: "Room 1 loaded", expectedOutput: "ROOM_LOAD\\|1", isPattern: true },
      { id: "t3", description: "Exit tile printed", expectedOutput: "EXIT_TILE\\|8,4", isPattern: true },
      { id: "t4", description: "Spawn position correct", expectedOutput: "SPAWN\\|1,1", isPattern: true },
    ],
    hints: [
      "Define Room as a struct with tiles[H][W], spawn_x, spawn_y, exit_x, exit_y.",
      "loadRoom copies tiles from ROOMS[room_id] into grid, sets spawn position, prints ROOM_LOAD.",
      "Define two Room constants with different tile layouts. Both can share the same exit and spawn positions for simplicity.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Two Room Dungeon",
    type: "game_builder",
    instructions: `# Build: Two Room Dungeon with Full Pipeline

## Mental Model

This is the Phase 2 milestone. The player starts in room 0, walks to the exit tile, and the game loads room 1. The full pipeline runs each tick: enqueue commands → resolve movement → check exit → combat → cleanup → render. Room transition is seamless: the grid changes, the player respawns, and the game continues. No heap allocation. No restart. Just data flowing through the pipeline.

## What Breaks Without This

Without data-driven rooms, adding a second room means duplicating the entire init function. Without the exit tile check, the player walks into walls forever. Without loadRoom, room transition requires manual grid rewriting. The milestone proves that rooms are data, transitions are function calls, and the pipeline handles it all.

## The Fix

Integrate Room, loadRoom, and exit tile detection into the game_tick pipeline. After resolveCommands, check if the player is standing on the exit tile. If so, load the next room. The pipeline continues uninterrupted.

## Key Concepts

- **Room transition** — when player pos matches exit tile, call loadRoom with room_id + 1.
- **Pipeline integration** — exit check runs after movement resolve, before combat.
- **Data reuse** — all L16–19 systems work in both rooms without modification.
- **Milestone contract** — MILESTONE_20 printed at the end to confirm pipeline completeness.

## Performance Insight

Room transition costs one grid copy: H*W character writes. For a 5×10 grid, that is 50 writes. The exit tile check is a single comparison per tick: O(1). The entire room transition adds negligible cost to the tick. Even with 100 rooms, loadRoom is always the same cost — it copies fixed-size data.

## Memory Insight

Two Room structs as const data = 2 * (50 tiles + 4 ints) = roughly 116 bytes of read-only data. WorldState.grid is 50 bytes of mutable data. loadRoom overwrites those 50 bytes. No allocation. The memory footprint does not grow with room count (const data is part of the binary). Even 100 rooms would add only 100 * 58 bytes = ~5.7 KB of const data. Trivial.

## Your Task

Build a game where the player walks right from (1,1) in room 0 toward the exit at (8,3). When the player reaches the exit tile, load room 1. Run the full pipeline in both rooms:

\`\`\`
ROOM_LOAD|0
TICK|1
RESOLVE|move|entity=0|to=2,1
ENTITY|hero|player|48|24|24|24
TURN|1
HP|100
GOLD|0
GAME_MESSAGE|Room 0
TICK|2
RESOLVE|move|entity=0|to=3,1
ENTITY|hero|player|72|24|24|24
TURN|2
HP|100
GOLD|0
GAME_MESSAGE|Room 0
TICK|3
RESOLVE|move|entity=0|to=4,1
ENTITY|hero|player|96|24|24|24
TURN|3
HP|100
GOLD|0
GAME_MESSAGE|Room 0
TICK|4
RESOLVE|move|entity=0|to=5,1
ENTITY|hero|player|120|24|24|24
TURN|4
HP|100
GOLD|0
GAME_MESSAGE|Room 0
TICK|5
RESOLVE|move|entity=0|to=6,1
ENTITY|hero|player|144|24|24|24
TURN|5
HP|100
GOLD|0
GAME_MESSAGE|Room 0
TICK|6
RESOLVE|move|entity=0|to=7,1
ENTITY|hero|player|168|24|24|24
TURN|6
HP|100
GOLD|0
GAME_MESSAGE|Room 0
TICK|7
RESOLVE|move|entity=0|to=8,1
ROOM_TRANSITION|0->1
ROOM_LOAD|1
ENTITY|hero|player|24|24|24|24
TURN|7
HP|100
GOLD|0
GAME_MESSAGE|Room 1
MILESTONE_20|two_room_transition|PASSED
\`\`\`

The exit tile in room 0 is at (8,1). When the player reaches (8,1), the room transition fires. The player respawns at (1,1) in room 1.

## Beginner Trap

**Loading the room inside resolveCommands.** If you call loadRoom during command resolution, the grid changes while other commands may still reference old positions. Check for the exit tile AFTER resolveCommands completes. Set a flag, then load the room before combat. Or load at the start of the next tick. The point: don't mutate the grid during iteration.

## Elite Insight

The original Legend of Zelda's room transitions work identically: the player walks to a screen edge (the "exit tile"), the game copies the next room's tile data from ROM into working RAM, resets the player position, and continues. No loading screen. No allocation. Just a data copy. The 1986 NES had 2 KB of RAM — every room transition had to be zero-allocation. Your loadRoom follows the same constraint by choice, not by necessity. That's systems discipline.

## Mastery Check

What happens if room_id exceeds the ROOMS array size? Answer: Undefined behavior — the program reads garbage memory. The fix: check \`if (room_id >= MAX_ROOMS) return;\` in loadRoom. In this milestone, we have exactly 2 rooms (index 0 and 1). Lesson 39 (Error Handling) will add proper bounds checking. For now, the contract is simple: room_id must be 0 or 1.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=5, TILE=24, MAX_E=16, MAX_CMDS=64;
const int CMD_MOVE=1;
const int MAX_ROOMS=2;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

struct Room {
    char tiles[H][W];
    int spawn_x, spawn_y;
    int exit_x, exit_y;
};

void initRooms(Room* rooms) {
    // Room 0: open room, exit at (8,1)
    const char* r0[H] = {
        "##########",
        "#.......>#",
        "#........#",
        "#........#",
        "##########"
    };
    for (int y=0;y<H;y++) for (int x=0;x<W;x++) rooms[0].tiles[y][x]=r0[y][x];
    rooms[0].spawn_x=1; rooms[0].spawn_y=1;
    rooms[0].exit_x=8; rooms[0].exit_y=1;

    // Room 1: room with enemy marker
    const char* r1[H] = {
        "##########",
        "#........#",
        "#...E....#",
        "#........#",
        "##########"
    };
    for (int y=0;y<H;y++) for (int x=0;x<W;x++) rooms[1].tiles[y][x]=r1[y][x];
    rooms[1].spawn_x=1; rooms[1].spawn_y=1;
    rooms[1].exit_x=8; rooms[1].exit_y=1;
}

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    Command cmd_queue[MAX_CMDS];
    int cmd_count;
    int turn;
    int gold;
    char grid[H][W];
    int room_id;
};

Room rooms[MAX_ROOMS];

// TODO: implement loadRoom(WorldState& w, int room_id)
// Copy rooms[room_id].tiles into w.grid
// Set player position to spawn point
// Set w.room_id
// Print: ROOM_LOAD|N

void enqueueCmd(WorldState& w, int entity_id, int type, int dx, int dy) {
    if (w.cmd_count >= MAX_CMDS) return;
    w.cmd_queue[w.cmd_count] = {type, entity_id, dx, dy};
    w.cmd_count++;
}

void resolveCommands(WorldState& w) {
    for (int i = 0; i < w.cmd_count; i++) {
        Command& c = w.cmd_queue[i];
        if (c.type == CMD_MOVE) {
            int nx = w.pos_x[c.entity_id] + c.dx;
            int ny = w.pos_y[c.entity_id] + c.dy;
            if (nx>=0 && nx<W && ny>=0 && ny<H && w.grid[ny][nx]!='#') {
                w.pos_x[c.entity_id] = nx;
                w.pos_y[c.entity_id] = ny;
            }
            cout << "RESOLVE|move|entity=" << c.entity_id
                 << "|to=" << w.pos_x[c.entity_id]
                 << "," << w.pos_y[c.entity_id] << endl;
        }
    }
}

void game_tick(WorldState& w, char input) {
    w.turn++;
    w.cmd_count = 0;
    cout << "TICK|" << w.turn << endl;

    int dx=0, dy=0;
    if (input=='d') dx=1;
    else if (input=='a') dx=-1;
    else if (input=='s') dy=1;
    else if (input=='w') dy=-1;
    enqueueCmd(w, 0, CMD_MOVE, dx, dy);
    resolveCommands(w);

    // TODO: check if player is on exit tile
    // If so, print ROOM_TRANSITION|old->new, load next room

    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        const char* name = (i==0) ? "hero" : "orc";
        const char* role = (i==0) ? "player" : "enemy";
        cout << "ENTITY|" << name << "|" << role << "|"
             << w.pos_x[i]*TILE << "|" << w.pos_y[i]*TILE
             << "|24|24" << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.hp[0] << endl;
    cout << "GOLD|" << w.gold << endl;
    cout << "GAME_MESSAGE|Room " << w.room_id << endl;
}

int main() {
    WorldState w = {};
    initRooms(rooms);
    w.hp[0]=100; w.alive[0]=true;
    w.entity_count=1;

    // TODO: load room 0

    char inputs[] = {'d','d','d','d','d','d','d'};
    for (char c : inputs) game_tick(w, c);

    cout << "MILESTONE_20|two_room_transition|PASSED" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=5, TILE=24, MAX_E=16, MAX_CMDS=64;
const int CMD_MOVE=1;
const int MAX_ROOMS=2;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

struct Room {
    char tiles[H][W];
    int spawn_x, spawn_y;
    int exit_x, exit_y;
};

void initRooms(Room* rooms) {
    const char* r0[H] = {
        "##########",
        "#.......>#",
        "#........#",
        "#........#",
        "##########"
    };
    for (int y=0;y<H;y++) for (int x=0;x<W;x++) rooms[0].tiles[y][x]=r0[y][x];
    rooms[0].spawn_x=1; rooms[0].spawn_y=1;
    rooms[0].exit_x=8; rooms[0].exit_y=1;

    const char* r1[H] = {
        "##########",
        "#........#",
        "#...E....#",
        "#........#",
        "##########"
    };
    for (int y=0;y<H;y++) for (int x=0;x<W;x++) rooms[1].tiles[y][x]=r1[y][x];
    rooms[1].spawn_x=1; rooms[1].spawn_y=1;
    rooms[1].exit_x=8; rooms[1].exit_y=1;
}

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    Command cmd_queue[MAX_CMDS];
    int cmd_count;
    int turn;
    int gold;
    char grid[H][W];
    int room_id;
};

Room rooms[MAX_ROOMS];

void loadRoom(WorldState& w, int room_id) {
    if (room_id >= MAX_ROOMS) return;
    const Room& r = rooms[room_id];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            w.grid[y][x] = r.tiles[y][x];
    w.pos_x[0] = r.spawn_x;
    w.pos_y[0] = r.spawn_y;
    w.room_id = room_id;
    cout << "ROOM_LOAD|" << room_id << endl;
}

void enqueueCmd(WorldState& w, int entity_id, int type, int dx, int dy) {
    if (w.cmd_count >= MAX_CMDS) return;
    w.cmd_queue[w.cmd_count] = {type, entity_id, dx, dy};
    w.cmd_count++;
}

void resolveCommands(WorldState& w) {
    for (int i = 0; i < w.cmd_count; i++) {
        Command& c = w.cmd_queue[i];
        if (c.type == CMD_MOVE) {
            int nx = w.pos_x[c.entity_id] + c.dx;
            int ny = w.pos_y[c.entity_id] + c.dy;
            if (nx>=0 && nx<W && ny>=0 && ny<H && w.grid[ny][nx]!='#') {
                w.pos_x[c.entity_id] = nx;
                w.pos_y[c.entity_id] = ny;
            }
            cout << "RESOLVE|move|entity=" << c.entity_id
                 << "|to=" << w.pos_x[c.entity_id]
                 << "," << w.pos_y[c.entity_id] << endl;
        }
    }
}

void game_tick(WorldState& w, char input) {
    w.turn++;
    w.cmd_count = 0;
    cout << "TICK|" << w.turn << endl;

    int dx=0, dy=0;
    if (input=='d') dx=1;
    else if (input=='a') dx=-1;
    else if (input=='s') dy=1;
    else if (input=='w') dy=-1;
    enqueueCmd(w, 0, CMD_MOVE, dx, dy);
    resolveCommands(w);

    // Check exit tile
    int ex = rooms[w.room_id].exit_x;
    int ey = rooms[w.room_id].exit_y;
    if (w.pos_x[0] == ex && w.pos_y[0] == ey && w.room_id + 1 < MAX_ROOMS) {
        cout << "ROOM_TRANSITION|" << w.room_id << "->" << (w.room_id+1) << endl;
        loadRoom(w, w.room_id + 1);
    }

    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        const char* name = (i==0) ? "hero" : "orc";
        const char* role = (i==0) ? "player" : "enemy";
        cout << "ENTITY|" << name << "|" << role << "|"
             << w.pos_x[i]*TILE << "|" << w.pos_y[i]*TILE
             << "|24|24" << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.hp[0] << endl;
    cout << "GOLD|" << w.gold << endl;
    cout << "GAME_MESSAGE|Room " << w.room_id << endl;
}

int main() {
    WorldState w = {};
    initRooms(rooms);
    w.hp[0]=100; w.alive[0]=true;
    w.entity_count=1;

    loadRoom(w, 0);

    char inputs[] = {'d','d','d','d','d','d','d'};
    for (char c : inputs) game_tick(w, c);

    cout << "MILESTONE_20|two_room_transition|PASSED" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room 0 loaded at start", expectedOutput: "ROOM_LOAD\\|0", isPattern: true },
      { id: "g2", description: "Player moves right", expectedOutput: "RESOLVE\\|move\\|entity=0\\|to=2,1", isPattern: true },
      { id: "g3", description: "Room transition triggered", expectedOutput: "ROOM_TRANSITION\\|0->1", isPattern: true },
      { id: "g4", description: "Room 1 loaded after transition", expectedOutput: "ROOM_LOAD\\|1", isPattern: true },
      { id: "g5", description: "Player respawns at (1,1) in room 1", expectedOutput: "ENTITY\\|hero\\|player\\|24\\|24\\|24\\|24", isPattern: true },
      { id: "g6", description: "Game message shows room 1", expectedOutput: "GAME_MESSAGE\\|Room 1", isPattern: true },
      { id: "g7", description: "Milestone passed", expectedOutput: "MILESTONE_20\\|two_room_transition\\|PASSED", isPattern: true },
    ],
    hints: [
      "loadRoom copies room tiles into w.grid, sets player position to spawn, sets w.room_id.",
      "After resolveCommands, check if player pos matches the exit tile of the current room. If so, transition.",
      "Print ROOM_TRANSITION|old->new, then call loadRoom(w, w.room_id+1). Player respawns at the new room's spawn point.",
    ],
    estimatedMinutes: 20,
  },
};