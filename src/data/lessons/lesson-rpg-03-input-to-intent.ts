import { Lesson } from "@/types/lesson";

export const lessonRPG03: Lesson = {
  id: "rpg-03-input-to-intent",
  title: "Input to Intent",
  description: "WASD writes a direction intent, not movement. Separation of input from action.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["input handling", "intent vs action", "direction encoding", "pipeline separation"],
  part1: {
    title: "Concept: Input to Intent",
    type: "concept",
    instructions: `# Input to Intent

## Mental Model
Input is not movement. When the player presses W, you don't move them up. You record their INTENT to move up. The movement happens later, in a separate phase. This separation is the foundation of every deterministic game pipeline: input → intent → resolve → apply. Breaking these apart makes the game testable, replayable, and predictable.

## What Breaks Without This
If pressing W directly modifies player_y, you can't validate the move before it happens. What if (player_x, player_y-1) is a wall? You've already moved there. Now you have to undo it. What if you want to replay the game from a log? You can't — input and state mutation are tangled together. Determinism requires separation.

## The Fix: Intent Variables
\`\`\`cpp
int intent_dx = 0;
int intent_dy = 0;

char input;
cin >> input;
if (input == 'w') intent_dy = -1;
else if (input == 's') intent_dy = 1;
else if (input == 'a') intent_dx = -1;
else if (input == 'd') intent_dx = 1;
\`\`\`

The intent is a delta: (dx, dy). No position is modified. No state changes. Just a record of what the player wants to do. In L04, you'll apply this intent to actually move.

## Key Concepts
- Intent is a direction delta (dx, dy), not a position
- Input phase reads input and sets intent — nothing else
- Intent variables reset to (0,0) each tick before reading new input
- This pattern scales: enemies can have intents too (AI-generated instead of input-generated)

## Performance Insight
Reading one char from cin and branching on 4 values is essentially free. The real cost of input handling comes from buffering and OS syscalls, but for a turn-based game with one input per tick, this is negligible. The architectural benefit of separation vastly outweighs any micro-optimization concern.

## Memory Insight
Two integers for intent: 8 bytes. One char for input: 1 byte. The intent system adds 9 bytes to your game state. This will never be your bottleneck.

## Your Task
Write a program that reads a single character (w/a/s/d) and converts it to a direction intent (dx, dy). Print INTENT|dx|dy. Do NOT move anything — just record the intent.

## Beginner Trap: Moving Immediately on Input
The temptation is to write \`if (input == 'w') player_y--\`. Don't. That fuses input with state mutation. You lose the ability to validate, queue, or replay the move. Always go through intent first.

## Elite Insight: Command Pattern Preview
In L16, intent becomes a Command struct: {entity_id, action_type, dx, dy}. Multiple entities can queue commands in the same tick. The resolve phase processes them in order. This is the Command Pattern — one of the most important patterns in game architecture. It starts here, with two humble integers.

## Systems Thinking Connection
Every production game pipeline separates input gathering from state mutation. FPS games buffer input for server reconciliation. RTS games queue commands for lockstep networking. Turn-based games log commands for replay. The pattern is universal.

## Skill Reinforcement
- From L01-02: Grid rendering, player state as variables
- New: Input handling, intent as data
- Preview: In L04, intent will be applied to move the player

## Mastery Check
You know you've got it when:
- 'w' produces INTENT|0|-1
- 's' produces INTENT|0|1
- 'a' produces INTENT|-1|0
- 'd' produces INTENT|1|0
- No player position is modified`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int intent_dx = 0;
    int intent_dy = 0;

    char input;
    cin >> input;

    // TODO: Convert input to intent
    // w -> dy = -1
    // s -> dy = 1
    // a -> dx = -1
    // d -> dx = 1

    cout << "INTENT|" << intent_dx << "|" << intent_dy << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int intent_dx = 0;
    int intent_dy = 0;

    char input;
    cin >> input;

    if (input == 'w') intent_dy = -1;
    else if (input == 's') intent_dy = 1;
    else if (input == 'a') intent_dx = -1;
    else if (input == 'd') intent_dx = 1;

    cout << "INTENT|" << intent_dx << "|" << intent_dy << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "W moves up", expectedOutput: "INTENT|0|-1", isPattern: false },
      { id: "t2", description: "S moves down", expectedOutput: "INTENT|0|1", isPattern: false },
      { id: "t3", description: "A moves left", expectedOutput: "INTENT|-1|0", isPattern: false },
      { id: "t4", description: "D moves right", expectedOutput: "INTENT|1|0", isPattern: false },
    ],
    hints: [
      "Use if/else if chain: if (input == \'w\') intent_dy = -1;",
      "Remember: up is -1 in screen coordinates (y increases downward).",
      "Do not modify any player position variables. Only set intent_dx and intent_dy.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Intent Pipeline with Grid Display",
    type: "game_builder",
    instructions: `# Intent Pipeline with Grid Display

## Mental Model
A single tick of the game loop: read input → set intent → display state and intent. The intent is separate from state. You can see what the player WANTS to do before it happens. This is the first two phases of the tick pipeline.

## What Breaks Without This
Without a visible intent phase, you can't debug the pipeline. Did the player press 'w'? Was the intent recorded? Did the movement apply? With separate phases and output for each, you can trace every step.

## The Fix: Display Before and After
\`\`\`cpp
// Phase 1: Read input, set intent
char input; cin >> input;
// ... convert to dx, dy

// Phase 2: Display current state + intent
// Show the grid, then show what the player intends
cout << "INTENT|" << dx << "|" << dy << endl;
cout << "POS|" << player_x << "|" << player_y << endl;
cout << "TARGET|" << (player_x+dx) << "|" << (player_y+dy) << endl;
\`\`\`

The target position shows where the player WOULD move — but the move doesn't happen yet.

## Key Concepts
- Two-phase tick: input phase, display phase
- Intent is visible but not applied
- Target position is computed but player position unchanged
- This is the debugging interface for your tick pipeline

## Performance Insight
Computing target position (two additions) costs nothing. The value of observable state far outweighs any computation cost. In production, you'd have a debug overlay showing entity intents — this is the seed of that pattern.

## Memory Insight
No new allocations. We're reusing the same intent variables and adding two cout lines. Memory footprint unchanged from Part 1.

## Your Task
Read input, convert to intent, then display the grid with the player at (1,1). Print the intent direction, current position, and target position. Do NOT move the player.

## Beginner Trap: Applying the Move
If you write player_x += dx, you've broken the pipeline. The intent phase must not modify state. Movement happens in L04.

## Elite Insight: Tick Phases as Functions
In L07, each phase becomes a function: readInput(), resolveMovement(), renderGrid(). The separation you're learning here becomes the function boundary architecture of the entire game.

## Mastery Check
You know you've got it when:
- Grid displays with player at (1,1)
- INTENT shows the correct direction for the input
- POS shows 1|1 (unchanged)
- TARGET shows the would-be position`,
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
    int dx = 0, dy = 0;

    char input;
    cin >> input;

    // TODO: Convert input to dx, dy

    // TODO: Render grid with player at (player_x, player_y)

    // TODO: Print INTENT|dx|dy
    // TODO: Print POS|player_x|player_y
    // TODO: Print TARGET|(player_x+dx)|(player_y+dy)

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
    int dx = 0, dy = 0;

    char input;
    cin >> input;
    if (input == 'w') dy = -1;
    else if (input == 's') dy = 1;
    else if (input == 'a') dx = -1;
    else if (input == 'd') dx = 1;

    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            if (x == player_x && y == player_y)
                cout << '@';
            else
                cout << grid[y][x];
        }
        cout << endl;
    }

    cout << "INTENT|" << dx << "|" << dy << endl;
    cout << "POS|" << player_x << "|" << player_y << endl;
    cout << "TARGET|" << (player_x+dx) << "|" << (player_y+dy) << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Grid displays", expectedOutput: "##########", isPattern: false },
      { id: "g2", description: "Intent recorded", expectedOutput: "INTENT|", isPattern: true },
      { id: "g3", description: "Position unchanged", expectedOutput: "POS|1|1", isPattern: false },
      { id: "g4", description: "Target computed", expectedOutput: "TARGET|", isPattern: true },
    ],
    hints: [
      "Use the same if/else if chain from Part 1 to convert input to dx, dy.",
      "Render the grid with nested loops, checking if (x==player_x && y==player_y) to print @.",
      "TARGET is computed as player_x+dx and player_y+dy, but player_x and player_y are NOT modified.",
    ],
    estimatedMinutes: 10,
  },
};