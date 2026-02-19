import { Lesson } from "@/types/lesson";

export const lessonRPG02: Lesson = {
  id: "rpg-02-player-spawn-rules",
  title: "Player Spawn Rules",
  description: "Place the player at a fixed tile on the dungeon grid. Variables hold game state.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["variables as state", "coordinate system", "grid placement", "player rendering"],
  part1: {
    title: "Concept: Player Spawn Rules",
    type: "concept",
    instructions: `# Player Spawn Rules

## Mental Model
A game character is not an object. It is two integers: an x and a y. The grid already exists from L01. To place a player, you store their coordinates in variables, then during the render loop, check if the current cell matches the player position. If yes, print the player glyph instead of the default tile. That's it. No classes, no inheritance, no game engine. Two ints and an if-statement.

## What Breaks Without This
Without a dedicated variable for the player's position, the grid is just a static picture. You can't move what you can't address. If the player is hardcoded into the grid array itself, changing position means rewriting the array — error-prone, slow, and impossible to extend to multiple entities later.

## The Fix: Variables as State
\`\`\`cpp
const int WIDTH = 10;
const int HEIGHT = 10;
int player_x = 1;
int player_y = 1;
char grid[HEIGHT][WIDTH]; // filled with '.' for floor, '#' for walls
\`\`\`

During render, check each cell:
\`\`\`cpp
for (int y = 0; y < HEIGHT; y++) {
    for (int x = 0; x < WIDTH; x++) {
        if (x == player_x && y == player_y)
            cout << '@';
        else
            cout << grid[y][x];
    }
    cout << endl;
}
\`\`\`

The player "exists" as two variables. The grid never stores the player. The render loop overlays the player glyph at the matching coordinate. This separation of state from display is the foundation of every game renderer.

## Key Concepts
- Player state is just variables: player_x, player_y
- Grid stores terrain (walls, floor), NOT entities
- Render loop overlays player glyph at player coordinates
- '@' is the conventional player glyph in roguelike games

## Performance Insight
Comparing two ints per cell costs nearly nothing. For a 10x10 grid, that's 100 comparisons — trivial for any CPU. The branch predictor will learn the pattern after the first frame. In production, you'd batch entity rendering, but at this scale the naive approach is optimal.

## Memory Insight
Two integers for the player: 8 bytes total. The grid is 100 bytes (10x10 chars). Total game state: 108 bytes. Everything on the stack, nothing on the heap. This fits in a single cache line.

## Your Task
Write a program that:
1. Creates a 10x10 grid with '#' borders and '.' interior
2. Stores the player at position (1,1)
3. Renders the grid, printing '@' at the player position
4. Prints SPAWN|1|1 after the grid

## Beginner Trap: Storing the Player in the Grid Array
Don't write grid[1][1] = '@'. That embeds the player into the terrain data. When the player moves, you'd have to erase the old position and write the new one — but what was there before? A floor tile? A door? You've lost that information. Keep entities and terrain separate. Always.

## Elite Insight: Entity-Component Separation
This lesson introduces the most fundamental pattern in game architecture: entities are not part of the world map. The map stores terrain. Entities exist as separate data. The renderer composites them. This exact pattern scales from roguelikes to AAA open worlds — only the data structures get more sophisticated.

## Systems Thinking Connection
The player is the first piece of game state that changes. In L03, you'll read input to change these coordinates. In L06, enemies will use the same pattern. Every entity in the final game will be coordinates + properties, separate from the terrain grid.

## Skill Reinforcement
- From L01: Grid rendering with nested loops
- New: Variable-based state, conditional rendering
- Preview: In L03, these variables will change based on input

## Mastery Check
You know you've got it when:
- The player appears at exactly (1,1) on the grid
- The grid terrain is unchanged (still '#' borders, '.' interior)
- SPAWN|1|1 prints correctly after the grid`,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;

int main() {
    // Grid: '#' for walls, '.' for floor
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (y == 0 || y == HEIGHT-1 || x == 0 || x == WIDTH-1)
                grid[y][x] = '#';
            else
                grid[y][x] = '.';
        }
    }

    // TODO: Create player_x and player_y at position (1,1)

    // TODO: Render grid, printing '@' at player position
    // Hint: if (x == player_x && y == player_y) print '@', else print grid[y][x]

    // TODO: Print SPAWN|player_x|player_y

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (y == 0 || y == HEIGHT-1 || x == 0 || x == WIDTH-1)
                grid[y][x] = '#';
            else
                grid[y][x] = '.';
        }
    }

    int player_x = 1;
    int player_y = 1;

    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (x == player_x && y == player_y)
                cout << '@';
            else
                cout << grid[y][x];
        }
        cout << endl;
    }

    cout << "SPAWN|" << player_x << "|" << player_y << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Grid renders with borders", expectedOutput: "##########", isPattern: false },
      { id: "t2", description: "Player appears on grid", expectedOutput: "#@........#", isPattern: false },
      { id: "t3", description: "Spawn position reported", expectedOutput: "SPAWN|1|1", isPattern: false },
    ],
    hints: [
      "Declare int player_x = 1; and int player_y = 1; before the render loop.",
      "In the render loop, add an if-check: if (x == player_x && y == player_y) cout << \'@\'; else cout << grid[y][x];",
      "After the grid loop, print: cout << \"SPAWN|\" << player_x << \"|\" << player_y << endl;",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Multi-Entity Spawn",
    type: "game_builder",
    instructions: `# Multi-Entity Spawn

## Mental Model
If one entity is two variables, multiple entities are arrays. The player is still special — index 0 by convention. But now you have an entity_count that tracks how many entities are active. The grid overlay checks all entities, not just one.

## What Breaks Without This
If you add enemies as separate variables (enemy1_x, enemy1_y, enemy2_x...), you can't loop over them. You can't scale. You can't write a generic render pass. Individual variables become a maintenance nightmare after 3 entities.

## The Fix: Entity Arrays
\`\`\`cpp
const int MAX_ENTITIES = 8;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;
\`\`\`

Spawn the player at index 0, then spawn enemies at subsequent indices. The render loop checks all entity positions.

## Key Concepts
- Parallel arrays: same index across arrays = same entity
- entity_count tracks active entities
- Player is always index 0
- MAX_ENTITIES caps memory — no dynamic allocation

## Performance Insight
Looping through 8 entities per cell (8 comparisons per cell, 800 total for 10x10) is trivial. The CPU branch predictor will optimize the inner loop after the first few cells.

## Memory Insight
8 ints for x + 8 ints for y + 8 chars for glyph + 1 int for count = 68 bytes. All stack-allocated. No heap.

## Your Task
Create a dungeon grid with a player (@) at (1,1) and two enemies (E) at (3,3) and (5,5). Render the grid overlaying all entities. Print ENTITY_COUNT|N after the grid.

## Beginner Trap: Forgetting entity_count
If you add entities to the arrays but forget to increment entity_count, the render loop won't check them. Always pair array writes with count increments.

## Elite Insight: SoA Preview
These parallel arrays are the seed of Structure of Arrays (SoA) architecture. In L06, you'll formalize this pattern. In L14, you'll add HP arrays. By L35, you'll have 5+ arrays running in lockstep — the backbone of your entity system.

## Mastery Check
You know you've got it when:
- Player (@) appears at (1,1)
- Two enemies (E) appear at (3,3) and (5,5)
- ENTITY_COUNT|3 prints correctly after the grid`,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;
const int MAX_ENTITIES = 8;

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';

    int entity_x[MAX_ENTITIES];
    int entity_y[MAX_ENTITIES];
    char entity_glyph[MAX_ENTITIES];
    int entity_count = 0;

    // TODO: Spawn player at (1,1) with glyph '@' as entity 0
    // TODO: Spawn enemy at (3,3) with glyph 'E'
    // TODO: Spawn enemy at (5,5) with glyph 'E'

    // TODO: Render grid, overlaying entities
    // For each cell, check if any entity is at (x,y), print its glyph if so

    // TODO: Print ENTITY_COUNT|entity_count

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;
const int MAX_ENTITIES = 8;

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';

    int entity_x[MAX_ENTITIES];
    int entity_y[MAX_ENTITIES];
    char entity_glyph[MAX_ENTITIES];
    int entity_count = 0;

    // Spawn player
    entity_x[entity_count] = 1;
    entity_y[entity_count] = 1;
    entity_glyph[entity_count] = '@';
    entity_count++;

    // Spawn enemy 1
    entity_x[entity_count] = 3;
    entity_y[entity_count] = 3;
    entity_glyph[entity_count] = 'E';
    entity_count++;

    // Spawn enemy 2
    entity_x[entity_count] = 5;
    entity_y[entity_count] = 5;
    entity_glyph[entity_count] = 'E';
    entity_count++;

    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            char ch = grid[y][x];
            for (int e = 0; e < entity_count; e++) {
                if (entity_x[e] == x && entity_y[e] == y) {
                    ch = entity_glyph[e];
                    break;
                }
            }
            cout << ch;
        }
        cout << endl;
    }

    cout << "ENTITY_COUNT|" << entity_count << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player on grid", expectedOutput: "#@........#", isPattern: false },
      { id: "g2", description: "Enemy at (3,3)", expectedOutput: "E", isPattern: true },
      { id: "g3", description: "Entity count correct", expectedOutput: "ENTITY_COUNT|3", isPattern: false },
    ],
    hints: [
      "Spawn the player: entity_x[0]=1; entity_y[0]=1; entity_glyph[0]=\'@\'; entity_count++;",
      "In the render loop, add an inner loop over entities: for(int e=0; e<entity_count; e++) check if entity_x[e]==x && entity_y[e]==y.",
      "Use a break after finding the first entity match to avoid overwriting with later entities.",
    ],
    estimatedMinutes: 10,
  },
};