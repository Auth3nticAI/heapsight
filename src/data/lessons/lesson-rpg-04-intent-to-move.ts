import { Lesson } from "@/types/lesson";

export const lessonRPG04: Lesson = {
  id: "rpg-04-intent-to-move",
  title: "Intent to Move",
  description: "Apply the intent to move the player one tile per tick. The tick pipeline takes shape.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: ["state mutation", "tick pipeline", "apply phase", "deterministic movement"],
  part1: {
    title: "Concept: Intent to Move",
    type: "concept",
    instructions: `# Intent to Move

## Mental Model
Intent is recorded. Now apply it. The apply phase takes the intent delta (dx, dy) and adds it to the player position. One move per tick, deterministic. This is the third phase of the pipeline: input → intent → **apply** → render. The player moves exactly one tile per tick, no more, no less.

## What Breaks Without This
Without a dedicated apply phase, movement happens wherever someone writes player_x += dx. Maybe it's in the input handler. Maybe it's in the render loop. When movement scatters across the codebase, you can't predict when state changes, you can't replay deterministically, and you can't add collision checks later without hunting through every file.

## The Fix: Explicit Apply Phase
\`\`\`cpp
// Phase 1: Input -> Intent
int dx = 0, dy = 0;
char input; cin >> input;
if (input == 'w') dy = -1;
// ... other directions

// Phase 2: Apply intent
player_x += dx;
player_y += dy;

// Phase 3: Render
// grid display with player at new position
\`\`\`

The apply phase is two lines. That's it. But those two lines are in the RIGHT place — after input, before render. This ordering is the tick pipeline.

## Key Concepts
- Apply phase: player_x += dx; player_y += dy;
- Tick pipeline order: input → intent → apply → render
- One move per tick (dx and dy are -1, 0, or 1)
- State mutation happens in exactly one place

## Performance Insight
Two integer additions per tick. The CPU executes this in a single cycle. The architectural benefit — knowing exactly when and where state changes — is worth infinitely more than the nanosecond of computation.

## Memory Insight
No new allocations. player_x and player_y are modified in place. The intent variables (dx, dy) are temporary and live on the stack for the duration of the tick.

## Your Task
Write a program that reads an initial position (px, py) and an input character. Apply the intent to move the player, then print the new position. Handle boundary: if the new position would go below 0 or above 9, clamp it.

## Beginner Trap: Forgetting to Reset Intent
In a game loop, intent must reset to (0,0) at the start of each tick. If you forget, last tick's intent carries over and the player keeps moving. This is a common source of "ghost input" bugs.

## Elite Insight: Deterministic Tick Ordering
Every production game engine enforces a strict tick order. Unity has FixedUpdate → Update → LateUpdate. Unreal has Tick Groups. Your pipeline (input → apply → render) is the same concept, just explicit instead of framework-managed. Explicit is better — you can see and debug the order.

## Systems Thinking Connection
In L05, the apply phase will check for walls before moving. In L07, enemies will have their own apply phase. In L08, combat will be another phase between apply and render. Each new system slots into the pipeline at a known position. That's the power of explicit ordering.

## Skill Reinforcement
- From L03: Input to intent (dx, dy)
- New: Apply phase, tick pipeline ordering
- Preview: L05 adds collision checks before apply

## Mastery Check
You know you've got it when:
- Input 'w' from (3,3) produces MOVED|3|2
- Input 's' from (3,3) produces MOVED|3|4
- Boundary clamping works (no negative positions, no position > 9)`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int player_x, player_y;
    cin >> player_x >> player_y;

    char input;
    cin >> input;

    int dx = 0, dy = 0;
    // TODO: Convert input to intent (w/a/s/d)

    // TODO: Apply intent to player position
    // Clamp to 0..9 range

    cout << "MOVED|" << player_x << "|" << player_y << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int player_x, player_y;
    cin >> player_x >> player_y;

    char input;
    cin >> input;

    int dx = 0, dy = 0;
    if (input == 'w') dy = -1;
    else if (input == 's') dy = 1;
    else if (input == 'a') dx = -1;
    else if (input == 'd') dx = 1;

    player_x += dx;
    player_y += dy;

    if (player_x < 0) player_x = 0;
    if (player_x > 9) player_x = 9;
    if (player_y < 0) player_y = 0;
    if (player_y > 9) player_y = 9;

    cout << "MOVED|" << player_x << "|" << player_y << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Move up", expectedOutput: "MOVED|3|2", isPattern: false },
      { id: "t2", description: "Move down", expectedOutput: "MOVED|3|4", isPattern: false },
      { id: "t3", description: "Move left", expectedOutput: "MOVED|2|3", isPattern: false },
      { id: "t4", description: "Clamp at boundary", expectedOutput: "MOVED|0|0", isPattern: false },
    ],
    hints: [
      "Apply intent: player_x += dx; player_y += dy;",
      "Clamp after applying: if (player_x < 0) player_x = 0; and similarly for > 9.",
      "For the test, input is: position then direction. E.g., 3 3 w means start at (3,3), move up.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Multi-Tick Movement on Grid",
    type: "game_builder",
    instructions: `# Multi-Tick Movement on Grid

## Mental Model
A game loop processes multiple ticks. Each tick: reset intent → read input → apply → render. After N ticks, the player has moved N times. The grid state after each tick is deterministic — given the same input sequence, the player ends at the same position.

## What Breaks Without This
Without a proper loop, you can only process one move. A game needs many moves. Without resetting intent each tick, the player ghost-moves on ticks with no input.

## The Fix: Tick Loop
\`\`\`cpp
int num_ticks;
cin >> num_ticks;
for (int tick = 0; tick < num_ticks; tick++) {
    int dx = 0, dy = 0;
    char input; cin >> input;
    // convert input to dx, dy
    // apply movement with clamping
}
// render final grid
\`\`\`

## Key Concepts
- Game loop processes a sequence of inputs
- Intent resets each tick (dx=0, dy=0 at loop start)
- State accumulates across ticks
- Final position is deterministic given input sequence

## Performance Insight
Processing N ticks is O(N) — linear in the number of inputs. Each tick does constant work. For a turn-based game, N is small (hundreds of turns per session). No optimization needed.

## Memory Insight
The tick loop reuses the same dx/dy variables each iteration. No new allocations per tick. Stack usage is constant regardless of how many ticks you process.

## Your Task
Read a number of ticks, then that many input characters. Process each tick (apply movement with clamping to the grid). Render the final grid with the player, then print FINAL|x|y and TICKS|N.

## Beginner Trap: Rendering Every Tick
For this exercise, only render the FINAL state. In a real game, you'd render each tick, but for testing, we verify the end state. Rendering mid-loop would flood the output.

## Elite Insight: Input Replay
Notice that the input sequence fully determines the final state. If you saved the inputs to a file, you could replay them and get the same result. This is the seed of the replay system you'll build in Phase 7.

## Mastery Check
You know you've got it when:
- Multiple moves are applied in sequence
- Final position reflects all moves with clamping
- TICKS|N matches the number of inputs processed`,
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
    int num_ticks;
    cin >> num_ticks;

    // TODO: Process num_ticks ticks
    // Each tick: read input, convert to dx/dy, apply with clamping (1..8 for interior)

    // TODO: Render final grid with player

    cout << "FINAL|" << player_x << "|" << player_y << endl;
    cout << "TICKS|" << num_ticks << endl;
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
    int num_ticks;
    cin >> num_ticks;

    for (int tick = 0; tick < num_ticks; tick++) {
        int dx = 0, dy = 0;
        char input;
        cin >> input;
        if (input == 'w') dy = -1;
        else if (input == 's') dy = 1;
        else if (input == 'a') dx = -1;
        else if (input == 'd') dx = 1;

        player_x += dx;
        player_y += dy;
        if (player_x < 1) player_x = 1;
        if (player_x > WIDTH-2) player_x = WIDTH-2;
        if (player_y < 1) player_y = 1;
        if (player_y > HEIGHT-2) player_y = HEIGHT-2;
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
    cout << "TICKS|" << num_ticks << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Grid renders", expectedOutput: "##########", isPattern: false },
      { id: "g2", description: "Final position correct", expectedOutput: "FINAL|", isPattern: true },
      { id: "g3", description: "Tick count reported", expectedOutput: "TICKS|", isPattern: true },
    ],
    hints: [
      "Declare dx and dy INSIDE the loop so they reset to 0 each tick.",
      "Clamp to interior (1..WIDTH-2, 1..HEIGHT-2) so the player stays inside the walls.",
      "Render only after the loop completes, showing the final state.",
    ],
    estimatedMinutes: 12,
  },
};