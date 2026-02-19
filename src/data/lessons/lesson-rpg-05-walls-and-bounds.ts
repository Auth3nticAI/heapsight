import { Lesson } from "@/types/lesson";

export const lessonRPG05: Lesson = {
  id: "rpg-05-walls-and-bounds",
  title: "Walls and Bounds",
  description: "Blocked tiles stop movement. Collision is a data lookup, not a physics engine.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: ["collision detection", "data lookup", "validation before mutation", "grid-based collision"],
  part1: {
    title: "Concept: Walls and Bounds",
    type: "concept",
    instructions: `# Walls and Bounds

## Mental Model
Collision is not physics. Collision is a lookup. Before moving the player, check what's at the target tile. If it's a wall ('#'), reject the move. If it's floor ('.'), apply it. This is the validation step in the tick pipeline: input → intent → **validate** → apply → render.

## What Breaks Without This
Without collision checks, the player walks through walls. They exit the grid, access out-of-bounds memory, and crash the program. Or worse, they corrupt adjacent memory silently and get mystery bugs ten minutes later. Collision isn't a feature — it's a safety check.

## The Fix: Check Before Move
\`\`\`cpp
int target_x = player_x + dx;
int target_y = player_y + dy;

if (target_x >= 0 && target_x < WIDTH &&
    target_y >= 0 && target_y < HEIGHT &&
    grid[target_y][target_x] != '#') {
    player_x = target_x;
    player_y = target_y;
}
\`\`\`

Three checks in one conditional: bounds check (is the target on the grid?), then tile check (is it walkable?). If any check fails, the move is rejected. The player stays put. No partial moves, no rollback needed.

## Key Concepts
- Validate before mutate: check target tile, then move
- Grid collision is O(1) — direct array lookup
- Bounds checking prevents array out-of-bounds access
- Wall tile ('#') blocks movement; floor tile ('.') allows it

## Performance Insight
Grid-based collision is O(1): one array access. Compare this to polygon collision detection in continuous 2D/3D games, which can be O(n) or worse. Grid-based games get collision for free — the data structure IS the collision map.

## Memory Insight
No additional memory needed. The grid array you already have serves double duty as both the render data and the collision map. Zero extra bytes for collision detection.

## Your Task
Given a grid, a player position, and an input direction, check if the target tile is walkable. Print BLOCKED if the move is rejected, or MOVED|x|y if accepted.

## Beginner Trap: Checking After Moving
If you write player_x += dx and THEN check for walls, you've already corrupted the position. You'd have to undo the move. Always compute the target position FIRST, check it, then conditionally apply.

## Elite Insight: Collision Layers
In production games, collision isn't just 'blocked or not.' There are layers: walls block everything, water blocks non-swimming entities, doors block until unlocked. Each tile stores a collision bitmask. Your single '#' check is the simplest version of this layered system.

## Systems Thinking Connection
Collision validation slots between intent and apply in the pipeline. Every new game mechanic follows this pattern: compute what WOULD happen, validate it, then apply. Damage will check if the target is alive. Item pickup will check if inventory is full. The pattern is universal.

## Skill Reinforcement
- From L04: Apply phase (player_x += dx)
- New: Validation before mutation
- Preview: L08 will use adjacency checks for melee combat

## Mastery Check
You know you've got it when:
- Moving into a wall prints BLOCKED
- Moving into floor prints MOVED with new position
- Moving out of bounds prints BLOCKED`,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';

    int player_x = 1, player_y = 1;
    char input;
    cin >> input;

    int dx = 0, dy = 0;
    if (input == 'w') dy = -1;
    else if (input == 's') dy = 1;
    else if (input == 'a') dx = -1;
    else if (input == 'd') dx = 1;

    // TODO: Compute target position
    // TODO: Check bounds and tile type
    // TODO: If valid, apply move and print MOVED|x|y
    // TODO: If blocked, print BLOCKED

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';

    int player_x = 1, player_y = 1;
    char input;
    cin >> input;

    int dx = 0, dy = 0;
    if (input == 'w') dy = -1;
    else if (input == 's') dy = 1;
    else if (input == 'a') dx = -1;
    else if (input == 'd') dx = 1;

    int target_x = player_x + dx;
    int target_y = player_y + dy;

    if (target_x >= 0 && target_x < WIDTH &&
        target_y >= 0 && target_y < HEIGHT &&
        grid[target_y][target_x] != '#') {
        player_x = target_x;
        player_y = target_y;
        cout << "MOVED|" << player_x << "|" << player_y << endl;
    } else {
        cout << "BLOCKED" << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Move to floor succeeds", expectedOutput: "MOVED|2|1", isPattern: false },
      { id: "t2", description: "Move into wall blocked", expectedOutput: "BLOCKED", isPattern: false },
      { id: "t3", description: "Move down succeeds", expectedOutput: "MOVED|1|2", isPattern: false },
    ],
    hints: [
      "Compute target: int target_x = player_x + dx; int target_y = player_y + dy;",
      "Check bounds first (target_x >= 0 && target_x < WIDTH), then check tile: grid[target_y][target_x] != \'#\'",
      "Only update player_x and player_y if ALL checks pass.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Multi-Move with Collision",
    type: "game_builder",
    instructions: `# Multi-Move with Collision

## Mental Model
A sequence of moves, each validated against the grid. The player navigates through the dungeon, bouncing off walls. The grid constrains movement. The output shows exactly where the player ends up, proving that collision works correctly for every step.

## What Breaks Without This
A single move doesn't prove the system works. You need a sequence of moves that includes both successful moves and blocked attempts. The grid with walls acts as a maze — the player must navigate around obstacles.

## The Fix: Tick Loop with Collision
\`\`\`cpp
for (int tick = 0; tick < num_moves; tick++) {
    char input; cin >> input;
    int dx = 0, dy = 0;
    // convert input to direction...
    int tx = player_x + dx, ty = player_y + dy;
    if (tx >= 0 && tx < WIDTH && ty >= 0 && ty < HEIGHT && grid[ty][tx] != '#')
        { player_x = tx; player_y = ty; }
}
\`\`\`

## Key Concepts
- Tick loop processes a sequence of inputs
- Each tick validates before applying
- Blocked moves are silently rejected (player stays put)
- Final state reflects all valid moves

## Performance Insight
Each tick does one grid lookup — O(1). Processing N moves is O(N). The grid collision map is accessed once per tick, always hitting L1 cache because the grid is small.

## Memory Insight
No new allocations. The loop reuses the same local variables each iteration. Total memory footprint unchanged from the single-move version.

## Your Task
Read a number of moves, then process each with collision checking. Place an extra wall at (4,1) for testing. Render the final grid showing the player position. Print FINAL|x|y and BLOCKED_COUNT|N.

## Beginner Trap: Not Counting Blocked Moves
Track how many moves were blocked. This is useful for debugging — if the blocked count is wrong, your collision logic has a bug.

## Elite Insight: Collision Response Categories
In production games, collision isn't just accept/reject. There's slide (move along the wall), push (move the obstacle), damage (touching lava), and trigger (stepping on a pressure plate). Each response type is a different branch in the collision handler. Your accept/reject is the foundation.

## Mastery Check
You know you've got it when:
- Player navigates around walls correctly
- BLOCKED_COUNT matches expected wall collisions
- FINAL position is correct for the input sequence`,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';
    grid[1][4] = '#'; // Extra wall for testing

    int player_x = 1, player_y = 1;
    int blocked_count = 0;

    int num_moves;
    cin >> num_moves;

    // TODO: Process each move with collision checking
    // Count blocked moves

    // TODO: Render final grid with player

    cout << "FINAL|" << player_x << "|" << player_y << endl;
    cout << "BLOCKED_COUNT|" << blocked_count << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';
    grid[1][4] = '#';

    int player_x = 1, player_y = 1;
    int blocked_count = 0;

    int num_moves;
    cin >> num_moves;

    for (int i = 0; i < num_moves; i++) {
        char input;
        cin >> input;
        int dx = 0, dy = 0;
        if (input == 'w') dy = -1;
        else if (input == 's') dy = 1;
        else if (input == 'a') dx = -1;
        else if (input == 'd') dx = 1;

        int tx = player_x + dx;
        int ty = player_y + dy;
        if (tx >= 0 && tx < WIDTH && ty >= 0 && ty < HEIGHT && grid[ty][tx] != '#') {
            player_x = tx;
            player_y = ty;
        } else {
            blocked_count++;
        }
    }

    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (x == player_x && y == player_y)
                cout << '@';
            else
                cout << grid[y][x];
        }
        cout << endl;
    }

    cout << "FINAL|" << player_x << "|" << player_y << endl;
    cout << "BLOCKED_COUNT|" << blocked_count << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Grid renders", expectedOutput: "##########", isPattern: false },
      { id: "g2", description: "Final position reported", expectedOutput: "FINAL|", isPattern: true },
      { id: "g3", description: "Blocked count reported", expectedOutput: "BLOCKED_COUNT|", isPattern: true },
    ],
    hints: [
      "In the loop, compute tx=player_x+dx, ty=player_y+dy, then check bounds and grid[ty][tx].",
      "If the move is blocked, increment blocked_count. If valid, update player_x and player_y.",
      "The extra wall at grid[1][4] means moving right from (3,1) is blocked.",
    ],
    estimatedMinutes: 12,
  },
};