import { Lesson } from "@/types/lesson";

export const lessonRPG07: Lesson = {
  id: "rpg-07-turn-pipeline-v0",
  title: "Turn Pipeline v0",
  description: "Player moves, then enemy moves. Explicit update order makes the tick deterministic.",
  order: 7,
  xpReward: 50,
  tier: "free",
  concepts: ["tick pipeline", "update order", "deterministic simulation", "enemy AI"],
  part1: {
    title: "Concept: Turn Pipeline v0",
    type: "concept",
    instructions: `# Turn Pipeline v0

## Mental Model

A turn is a sequence of passes executed in fixed order: input, move player, move enemy, render. Each pass reads state left by the previous pass and writes state for the next. The order is the architecture. If enemy moves before player, the game feels different -- the enemy reacts to your previous position, not your current one. Explicit ordering eliminates ambiguity.

## What Breaks Without This

Without explicit turn order, you end up with interleaved updates -- the player moves and the enemy moves in the same function, reading partially-updated state. The enemy might react to the player's new position or old position depending on code order. Adding a third entity makes the bug worse: entity 2 sees entity 1's new position but entity 0's old position. Chaos.

## The Fix: Explicit Pass Order

Define the tick as named passes executed sequentially:

\`\`\`cpp
// One tick:
// Pass 1: Read input -> produce player intent
// Pass 2: Move player (resolve intent)
// Pass 3: Move enemies (chase AI)
// Pass 4: Render grid
\`\`\`

Each pass is a function. Each function reads from entity arrays and writes to entity arrays. No pass reads from a pass that hasn't run yet. The order is explicit in main():

\`\`\`cpp
for (int turn = 0; turn < num_turns; turn++) {
    Intent intent = readInput(inputs[turn]);
    movePlayer(intent);
    moveEnemies();  // simple chase: move toward player
    renderGrid();
}
\`\`\`

Enemy AI is simple chase: if enemy_x > player_x, decrement enemy_x. If enemy_x < player_x, increment. Same for y. One step per turn toward the player.

## Key Concepts

- **Pass order** -- input, move player, move enemies, render. Each pass is a separate function.
- **Deterministic turns** -- same input sequence produces identical entity positions every run.
- **Chase AI** -- enemy moves one step toward player each turn. Manhattan distance decreases by 1 per turn.
- **No interleaved mutation** -- player moves fully resolve before enemy moves begin.

## Performance Insight

Processing all player moves, then all enemy moves, is cache-friendly: the movement pass sweeps entity_x[] and entity_y[] once. Interleaving (move player, move enemy 1, move player, move enemy 2) thrashes the instruction cache between different code paths. Batched passes are faster and simpler.

## Memory Insight

No new allocations for the turn system. The input array is a fixed-size local array. Entity arrays were allocated in lesson 6. The turn pipeline is pure control flow -- function calls and index arithmetic. Zero memory overhead.

## Your Task

Run 3 turns with inputs [4, 4, 5] (4=move right, 5=no move/wait). Player starts at (1,1), enemy at (7,3). After each turn, print entity positions:

\`\`\`
TICK|1|P:2,1|E:6,3
TICK|2|P:3,1|E:5,3
TICK|3|P:3,1|E:4,2
TURN|3
HP|100
GOLD|0
GAME_MESSAGE|3 turns complete. Enemy chasing player.
\`\`\`

Input 4 means move right (dx=+1). Input 5 means wait (no move). Enemy chase: each turn, enemy moves one step toward player (x first, then y if x matches).

## Beginner Trap

**Moving the enemy before the player.** If the enemy moves first, it chases the player's PREVIOUS position. The player then moves away. The enemy is always one turn behind. If the player moves first, the enemy chases the CURRENT position -- more aggressive, different feel. The order you choose defines the game's difficulty. Choose deliberately, not accidentally.

## Elite Insight

Nethack's turn system processes the player first, then all monsters in a fixed order (by monster ID). This is why the game is deterministic -- the same key sequence always produces the same dungeon state. Baldur's Gate uses initiative order (speed stat). Both systems: explicit order, no ambiguity, fully reproducible.

## Systems Thinking Connection

This tick pipeline -- input, resolve, AI, render -- is a miniature version of the Space Shooter's frame loop: input, physics, collision, render. Both paths enforce strict pass ordering for determinism. The RPG runs once per turn; the shooter runs 60 times per second. Same architecture, different cadence.

## Skill Reinforcement

Lesson 4 introduced intent-to-move. Lesson 6 added entity arrays. This lesson combines both: move player via intent, then move enemies via AI, all in explicit order. Lesson 8 adds melee combat as a new pass in the pipeline.

## Mastery Check

If you swap the order -- move enemies, then move player -- how does the game change? The enemy chases the player's old position (before this turn's move). The player effectively gets a head start each turn. The game feels easier. This is why order matters: it's not a bug fix, it's a design decision expressed in code structure.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count] = x;
    entity_y[entity_count] = y;
    entity_hp[entity_count] = hp;
    entity_glyph[entity_count] = glyph;
    entity_count++;
}

void movePlayer(int input) {
    if (input == 4) { entity_x[0]++; } // right
    if (input == 6) { entity_x[0]--; } // left
    if (input == 8) { entity_y[0]--; } // up
    if (input == 2) { entity_y[0]++; } // down
    // input 5 = wait, no movement
}

void moveEnemies() {
    for (int i = 1; i < entity_count; i++) {
        // TODO: Chase AI - move enemy one step toward player (entity 0)
        // If enemy_x > player_x, decrement enemy_x
        // Else if enemy_x < player_x, increment enemy_x
        // Else if enemy_y > player_y, decrement enemy_y
        // Else if enemy_y < player_y, increment enemy_y
    }
}

int main() {
    spawnEntity(1, 1, 100, '@');  // player
    spawnEntity(7, 3, 20, 'E');   // enemy

    int inputs[] = {4, 4, 5};

    for (int t = 0; t < 3; t++) {
        movePlayer(inputs[t]);
        moveEnemies();
        cout << "TICK|" << (t+1) << "|P:" << entity_x[0] << "," << entity_y[0]
             << "|E:" << entity_x[1] << "," << entity_y[1] << endl;
    }

    cout << "TURN|3" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|3 turns complete. Enemy chasing player." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count] = x;
    entity_y[entity_count] = y;
    entity_hp[entity_count] = hp;
    entity_glyph[entity_count] = glyph;
    entity_count++;
}

void movePlayer(int input) {
    if (input == 4) { entity_x[0]++; }
    if (input == 6) { entity_x[0]--; }
    if (input == 8) { entity_y[0]--; }
    if (input == 2) { entity_y[0]++; }
}

void moveEnemies() {
    for (int i = 1; i < entity_count; i++) {
        if (entity_x[i] > entity_x[0]) entity_x[i]--;
        else if (entity_x[i] < entity_x[0]) entity_x[i]++;
        else if (entity_y[i] > entity_y[0]) entity_y[i]--;
        else if (entity_y[i] < entity_y[0]) entity_y[i]++;
    }
}

int main() {
    spawnEntity(1, 1, 100, '@');
    spawnEntity(7, 3, 20, 'E');

    int inputs[] = {4, 4, 5};

    for (int t = 0; t < 3; t++) {
        movePlayer(inputs[t]);
        moveEnemies();
        cout << "TICK|" << (t+1) << "|P:" << entity_x[0] << "," << entity_y[0]
             << "|E:" << entity_x[1] << "," << entity_y[1] << endl;
    }

    cout << "TURN|3" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|3 turns complete. Enemy chasing player." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Tick 1: player at (2,1), enemy at (6,3)",
        expectedOutput: "TICK\\|1\\|P:2,1\\|E:6,3",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Tick 2: player at (3,1), enemy at (5,3)",
        expectedOutput: "TICK\\|2\\|P:3,1\\|E:5,3",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Tick 3: player waits at (3,1), enemy at (4,2)",
        expectedOutput: "TICK\\|3\\|P:3,1\\|E:4,2",
        isPattern: true,
      },
    ],
    hints: [
      "The chase AI moves toward the player: compare entity_x[i] with entity_x[0] and adjust by 1.",
      "Use if/else if chain: first check x difference, then y. Move one axis per turn.",
      "if (entity_x[i] > entity_x[0]) entity_x[i]--; else if (entity_x[i] < entity_x[0]) entity_x[i]++; else if ... same for y.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Turn Simulation",
    type: "game_builder",
    instructions: `# Build: Turn Simulation

## Mental Model

The full turn pipeline: read input, move player, move enemies, render grid. Run 3 turns and show entity positions changing each turn. The grid is rebuilt each turn to reflect current state.

## What Breaks Without This

Without per-turn rendering, you only see the final state. You cannot debug intermediate positions. You cannot verify that the enemy chases correctly at each step. Turn-by-turn output is both the game display and the debug log.

## The Fix: Full Turn Pipeline with Grid Render

Each turn: move player, move enemies, rebuild grid, print TICK line and grid. The grid rebuild clears old positions and stamps current positions. No stale glyph artifacts.

## Key Concepts

- **Per-turn render** -- grid rebuilt from scratch each turn. Entity glyphs always reflect current positions.
- **TICK output** -- machine-readable position log for each turn. Enables automated verification.
- **Pipeline demonstration** -- the student sees input, movement, AI, and rendering as distinct steps.

## Performance Insight

Rebuilding a 10x10 grid per turn: 100 array writes + N entity stamps. At 3 turns with 2 entities, total work is 306 array operations. Trivially fast. The cost of grid rebuild is negligible compared to the value of guaranteed correctness.

## Memory Insight

Grid is a stack-allocated 100-byte array. It is reused each turn -- no per-turn allocation. The input array is a 3-element local array. Total memory for the turn simulation: unchanged from lesson 6.

## Your Task

Run 3 turns with inputs [4,4,5]. Show the grid each turn with entity positions. Print TICK lines showing positions.

Expected output includes:
\`\`\`
DUNGEON|rpg-v0
TICK|1|P:2,1|E:6,3
GRID_ROW|1|#.@......#
GRID_ROW|3|#.....E..#
TICK|2|P:3,1|E:5,3
GRID_ROW|1|#..@.....#
GRID_ROW|3|#....E...#
TICK|3|P:3,1|E:4,2
GRID_ROW|1|#..@.....#
GRID_ROW|2|#...E....#
TURN|3
HP|100
GOLD|0
GAME_MESSAGE|Pipeline complete. 3 turns simulated.
\`\`\`

## Beginner Trap

**Forgetting to rebuild the grid each turn.** If you stamp entities on turn 1 and don't clear the grid before turn 2, the old glyph positions remain. The player appears in two places. Always rebuild the grid from scratch before stamping entities.

## Elite Insight

Dwarf Fortress processes over 100 entity types in a strict turn order. Creatures move, then jobs process, then fluid dynamics run, then plants grow. Each system is a named pass. The turn pipeline you're building is the same pattern -- just at smaller scale. Scale comes later; the architecture is the same from day one.

## Mastery Check

Why must the grid be rebuilt from scratch each turn rather than moving glyphs? Because tracking where each entity WAS requires storing previous positions. Rebuilding is 100 writes -- cheaper than the bookkeeping. And it eliminates an entire class of bugs: stale position artifacts, double-rendering, and missed clears.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count]=x; entity_y[entity_count]=y;
    entity_hp[entity_count]=hp; entity_glyph[entity_count]=glyph;
    entity_count++;
}

void movePlayer(int input) {
    if(input==4) entity_x[0]++;
    if(input==6) entity_x[0]--;
    if(input==8) entity_y[0]--;
    if(input==2) entity_y[0]++;
}

void moveEnemies() {
    for(int i=1;i<entity_count;i++){
        if(entity_x[i]>entity_x[0]) entity_x[i]--;
        else if(entity_x[i]<entity_x[0]) entity_x[i]++;
        else if(entity_y[i]>entity_y[0]) entity_y[i]--;
        else if(entity_y[i]<entity_y[0]) entity_y[i]++;
    }
}

void renderGrid() {
    char grid[H][W];
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) grid[y][x]='.';
    for(int x=0;x<W;x++){grid[0][x]='#';grid[H-1][x]='#';}
    for(int y=0;y<H;y++){grid[y][0]='#';grid[y][W-1]='#';}
    for(int i=0;i<entity_count;i++){
        grid[entity_y[i]][entity_x[i]]=entity_glyph[i];
    }
    for(int y=0;y<H;y++){
        cout << "GRID_ROW|" << y << "|";
        for(int x=0;x<W;x++) cout << grid[y][x];
        cout << endl;
    }
}

int main() {
    spawnEntity(1,1,100,'@');
    spawnEntity(7,3,20,'E');

    int inputs[]={4,4,5};
    cout << "DUNGEON|rpg-v0" << endl;

    for(int t=0;t<3;t++){
        // TODO: Call movePlayer, moveEnemies, print TICK line, call renderGrid
    }

    cout << "TURN|3" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|Pipeline complete. 3 turns simulated." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10;
const int MAX_ENTITIES = 64;

int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count]=x; entity_y[entity_count]=y;
    entity_hp[entity_count]=hp; entity_glyph[entity_count]=glyph;
    entity_count++;
}

void movePlayer(int input) {
    if(input==4) entity_x[0]++;
    if(input==6) entity_x[0]--;
    if(input==8) entity_y[0]--;
    if(input==2) entity_y[0]++;
}

void moveEnemies() {
    for(int i=1;i<entity_count;i++){
        if(entity_x[i]>entity_x[0]) entity_x[i]--;
        else if(entity_x[i]<entity_x[0]) entity_x[i]++;
        else if(entity_y[i]>entity_y[0]) entity_y[i]--;
        else if(entity_y[i]<entity_y[0]) entity_y[i]++;
    }
}

void renderGrid() {
    char grid[H][W];
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) grid[y][x]='.';
    for(int x=0;x<W;x++){grid[0][x]='#';grid[H-1][x]='#';}
    for(int y=0;y<H;y++){grid[y][0]='#';grid[y][W-1]='#';}
    for(int i=0;i<entity_count;i++){
        grid[entity_y[i]][entity_x[i]]=entity_glyph[i];
    }
    for(int y=0;y<H;y++){
        cout << "GRID_ROW|" << y << "|";
        for(int x=0;x<W;x++) cout << grid[y][x];
        cout << endl;
    }
}

int main() {
    spawnEntity(1,1,100,'@');
    spawnEntity(7,3,20,'E');

    int inputs[]={4,4,5};
    cout << "DUNGEON|rpg-v0" << endl;

    for(int t=0;t<3;t++){
        movePlayer(inputs[t]);
        moveEnemies();
        cout << "TICK|" << (t+1) << "|P:" << entity_x[0] << "," << entity_y[0]
             << "|E:" << entity_x[1] << "," << entity_y[1] << endl;
        renderGrid();
    }

    cout << "TURN|3" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|Pipeline complete. 3 turns simulated." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Dungeon header",
        expectedOutput: "DUNGEON\\|rpg-v0",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Tick 1 positions correct",
        expectedOutput: "TICK\\|1\\|P:2,1\\|E:6,3",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Tick 3 enemy moved to (4,2)",
        expectedOutput: "TICK\\|3\\|P:3,1\\|E:4,2",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Pipeline complete message",
        expectedOutput: "GAME_MESSAGE\\|Pipeline complete\\. 3 turns simulated\\.",
        isPattern: true,
      },
    ],
    hints: [
      "Inside the loop: call movePlayer(inputs[t]), then moveEnemies(), then print TICK, then renderGrid().",
      "The TICK line format: TICK|N|P:x,y|E:x,y -- use entity_x[0],entity_y[0] for player and entity_x[1],entity_y[1] for enemy.",
      "The pipeline order is: movePlayer -> moveEnemies -> print TICK -> renderGrid. All four calls inside the for loop body.",
    ],
    estimatedMinutes: 15,
  },
};