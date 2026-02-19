import type { GameLessonVariant } from "@/types/game";

export const lesson02SpaceShooter: GameLessonVariant = {
  lessonId: "02-player-stats",
  instructions: `# Player Stats -- Hardcoded Chaos

## Mental Model

Game state is variables. Variables are the source of truth. Display them = HUD. Change a variable and every output that references it updates automatically. This is the foundation of data-driven design. A game without variables is a screenshot. A game with variables is interactive.

## What Breaks Without This

Every value is baked into string literals. Want to take damage? Rewrite the string. Want to score a point? Rewrite another string. One typo in a magic number and your ship teleports or your HUD lies about health. Nothing is tunable. Nothing is reactive. The game is frozen at compile time.

## The Fix

Variables are named memory slots. Declare \`int hp = 100;\` and now that value lives at one address. Use it in five places -- change it once, everything updates. This is the single-source-of-truth principle. Every real engine follows it.

You need three variables: \`hp\`, \`score\`, \`lives\`. All \`int\`. Then build your \`HUD\` protocol line and \`ENTITY\` line by chaining variables with \`<<\` operators instead of hardcoding numbers into strings.

The HUD format: \`HUD|HP:100|SCORE:0|LIVES:3\`. The renderer parses this and draws the overlay. The entity format includes a health field: \`ENTITY|id|type|x|y|width|height|hp\`. The renderer uses health to drive shield bar overlays.

After Frame 1, subtract 25 from hp. Print Frame 2. The HUD and entity both reflect the new truth. One mutation, two outputs, zero inconsistency.

## Performance Insight

\`int\` is 4 bytes. Fits in a CPU register. An \`int\` subtraction is 1 CPU cycle. You could process a million damage events per millisecond. The bottleneck will never be your variable math.

## Memory Insight

Three ints = 12 bytes on the stack. Stack allocation is free -- the compiler adjusts the stack pointer at function entry. No heap. No \`new\`. No system calls. The memory exists the instant \`main()\` begins.

## Your Task

Print two frames showing a damage event:
\`\`\`
=== FRAME 1 ===
HUD|HP:100|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|100
=== FRAME 2 ===
HUD|HP:75|SCORE:0|LIVES:3
ENTITY|ship|player|180|300|24|24|75
GAME_MESSAGE|Hull breach! 25 damage taken
\`\`\`

Start with \`hp = 100\`, \`score = 0\`, \`lives = 3\`. Print Frame 1. Then \`hp = hp - 25\`. Print Frame 2 with the updated state. The entity health field must match hp.

## Beginner Trap

**Putting variable names inside quotes:** \`"hp"\` prints the literal text "hp". \`<< hp\` prints the value 100. Quotes make string literals. The \`<<\` operator injects the actual value from the variable's memory address.

**Hardcoding Frame 2 values:** If you write \`"HP:75"\` instead of \`<< hp\`, it works now but breaks the pattern. The whole point is that one variable change propagates everywhere.

## Elite Insight

Unreal Engine stores player state as UProperties -- under the hood they are ints and floats in flat memory. The HUD widget reads the same variables the gameplay code writes. Same pattern. One source of truth, multiple consumers.

## Systems Thinking Connection

Frame 1 and Frame 2 are the seed of a game loop. In a real engine, this runs 60 times per second. Each frame: read state, compute changes, output new state. You are doing this manually with two frames. Soon it will be a loop.

## Skill Reinforcement

You are using: \`int\` declaration, variable mutation (\`hp = hp - 25\`), and variable interpolation in \`cout\`. These three operations -- declare, mutate, display -- are the entire game state pipeline.

## Mastery Check

Why must the entity health field use \`<< hp\` instead of hardcoding \`75\`? Because the variable is the source of truth. If the damage amount changes, the entity line updates automatically. Hardcoded values create inconsistencies. Variables create guarantees.`,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;

    // === FRAME 1 ===
    // Print frame header, HUD with variables, and ship entity

    // Take 25 damage
    // hp = hp - 25;

    // === FRAME 2 ===
    // Print frame header, HUD, entity with updated hp
    // Print damage message: GAME_MESSAGE|Hull breach! 25 damage taken

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;

    // Frame 1
    cout << "=== FRAME 1 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;

    // Take damage
    hp = hp - 25;

    // Frame 2
    cout << "=== FRAME 2 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;
    cout << "GAME_MESSAGE|Hull breach! 25 damage taken" << endl;

    return 0;
}`,

  tests: [
    {
      id: "g1",
      description: "Frame 1 should show HUD with HP:100",
      expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Frame 2 should show HUD with HP:75 after damage",
      expectedOutput: "HUD\\|HP:75\\|SCORE:0\\|LIVES:3",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Frame 2 entity should reflect updated hp of 75",
      expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|75",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Should show the damage message",
      expectedOutput: "GAME_MESSAGE\\|Hull breach! 25 damage taken",
      isPattern: true,
    },
  ],

  hints: [
    'Build the HUD line with variables: `cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;`',
    "After printing Frame 1, do `hp = hp - 25;` before printing Frame 2. The same cout lines will now output different values.",
    'End the entity line with `<< hp` so it uses the variable: `cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;`',
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;

    // Frame 1
    cout << "=== FRAME 1 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;

    // Take damage
    hp = hp - 25;

    // Frame 2
    cout << "=== FRAME 2 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|180|300|24|24|" << hp << endl;
    cout << "GAME_MESSAGE|Hull breach! 25 damage taken" << endl;

    return 0;
}`,
};
