import { Lesson } from "@/types/lesson";

export const lessonRPG76: Lesson = {
  id: "rpg-76-command-pattern-formalization",
  title: "Command Pattern Formalization",
  description: "Commands are POD structs with a type enum — MOVE, ATTACK, INTERACT, USE_ITEM. One struct, multiple intents, zero polymorphism.",
  order: 76,
  xpReward: 100,
  tier: "pro",
  concepts: ["command pattern", "POD structs", "enum dispatch", "value-type commands", "type safety"],
  part1: {
    title: "Concept: Typed Command Structs",
    type: "concept",
    instructions: `# Command Pattern Formalization

## Mental Model

Your Command struct has boolean fields: \`attack\`, \`interact\`, \`dx\`, \`dy\`.
But what about USE_ITEM? OPEN_DOOR? CAST_SPELL? Adding a boolean for
each action doesn't scale. Replace the flag soup with a type enum:
one field says what the command IS, other fields carry the data.

## What Breaks Without This

Without typed commands:
- Adding new command types requires touching every function
- Boolean soup leads to invalid states (attack=true AND interact=true)
- Serialization requires encoding which booleans are set
- Switch-based dispatch is impossible without a type field

## The Fix

Use an enum for the command type and a switch for dispatch:

\`\`\`cpp
enum CommandType { CMD_MOVE, CMD_ATTACK, CMD_INTERACT, CMD_USE_ITEM };

struct Command {
    CommandType type;
    int dx, dy;        // CMD_MOVE
    int target_id;     // CMD_ATTACK, CMD_INTERACT
    int item_slot;     // CMD_USE_ITEM
};
\`\`\`

## Key Concepts

- **Enum dispatch**: switch on type, not chain of if/else
- **POD struct**: no virtual methods, no heap, trivially copyable
- **One struct, multiple intents**: unused fields cost a few bytes, not complexity
- **Jump table**: compiler optimizes switch into O(1) dispatch

## Performance Insight

A POD Command is ~20 bytes on the stack. An array of 256 commands
fits in 5 KB. No heap, no fragmentation, cache-friendly sequential access.

## Memory Insight

The "union-like" approach wastes a few bytes per command (dx/dy unused
for attacks), but the simplicity is worth it. A true C union saves bytes
but adds complexity for zero practical gain at this scale.

## Your Task

Define CommandType enum and Command struct. Create one MOVE and one
ATTACK command. Print their types.

## Beginner Trap

\`\`\`cpp
// BAD: using inheritance for commands
class MoveCommand : public Command { ... };
class AttackCommand : public Command { ... };
// Requires heap allocation, virtual dispatch, slower
\`\`\`

## Elite Insight

Doom Eternal's command system is enum+struct, not class hierarchy.
John Carmack explicitly chose data-oriented design over OOP for
commands — POD structs are faster to create, copy, serialize, and replay.

## Systems Thinking Connection

Typed commands connect to the command queue (L16), replay logging
(L64), and save/load (L24). A type enum makes serialization trivial:
write the enum value, then the relevant fields.

## Skill Reinforcement

- Enum types from L13
- Struct design from L11
- Command queue from L16

## Mastery Check

You pass when CMD_TYPE prints MOVE for a move command and ATTACK
for an attack command.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define CommandType enum: CMD_MOVE, CMD_ATTACK, CMD_INTERACT, CMD_USE_ITEM

// TODO: Define Command struct with: type, dx, dy, target_id, item_slot

int main() {
    // TODO: Create a MOVE command (dx=1, dy=0)
    // TODO: Create an ATTACK command (target_id=3)
    // Print CMD_TYPE|MOVE and CMD_TYPE|ATTACK

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum CommandType { CMD_MOVE, CMD_ATTACK, CMD_INTERACT, CMD_USE_ITEM };
struct Command { CommandType type; int dx; int dy; int target_id; int item_slot; };

int main() {
    Command move = {CMD_MOVE, 1, 0, 0, 0};
    Command atk = {CMD_ATTACK, 0, 0, 3, 0};
    cout << "CMD_TYPE|" << (move.type == CMD_MOVE ? "MOVE" : "OTHER") << endl;
    cout << "CMD_TYPE|" << (atk.type == CMD_ATTACK ? "ATTACK" : "OTHER") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Move type printed", expectedOutput: "CMD_TYPE|MOVE", isPattern: false },
      { id: "t2", description: "Attack type printed", expectedOutput: "CMD_TYPE|ATTACK", isPattern: false },
    ],
    hints: [
      "enum CommandType { CMD_MOVE, CMD_ATTACK, CMD_INTERACT, CMD_USE_ITEM };",
      "Command struct: CommandType type; int dx; int dy; int target_id; int item_slot;",
      "Use ternary: (cmd.type == CMD_MOVE ? 'MOVE' : 'OTHER') to print the type name.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Typed Command Processing",
    type: "game_builder",
    instructions: `# Build: Formalized Command Queue

## Mental Model

Part 1 defined the types. Now build a \`processCommand\` dispatcher
that uses a switch to handle each CommandType. Queue 5 commands
and process them all. This is the foundation for the rest of the
game's command pipeline.

## What Breaks Without This

Without a switch dispatcher:
- Adding CMD_USE_ITEM requires finding every if/else chain
- if/else chains don't get jump-table optimization
- Missing a command type compiles fine but silently does nothing

## The Fix

Write \`processCommand(const Command& cmd)\` with a switch on
cmd.type. Each case prints the command and its relevant data.

## Key Concepts

- **Switch dispatch**: O(1) jump table for command routing
- **Per-type output**: MOVE prints dx/dy, ATTACK prints target
- **Queue processing**: array of commands, process sequentially
- **Count tracking**: verify all commands were processed

## Performance Insight

5 commands processed via switch: 5 jump table lookups. Compare
with 5 virtual calls (indirect function pointer + cache miss).
Switch is faster and easier to reason about.

## Memory Insight

5 commands at ~20 bytes each = 100 bytes. Stack allocated. The
entire command queue fits in a single cache line pair.

## Your Task

1. Write \`processCommand\` with switch on cmd.type
2. Queue 5 commands: MOVE(1,0), ATTACK(target=2), INTERACT(target=5), USE_ITEM(slot=0), MOVE(0,-1)
3. Process each and print the action
4. Print PROCESSED|5 commands

## Beginner Trap

\`\`\`cpp
// BAD: forgetting break in switch cases
case CMD_MOVE: applyMove(cmd);
case CMD_ATTACK: applyAttack(cmd);  // FALLS THROUGH!
// Always use break after each case
\`\`\`

## Elite Insight

Compiler Explorer shows switch statements compiled to jump tables
when cases are sequential enum values. This is O(1) dispatch —
faster than any if/else chain or virtual call.

## Mastery Check

You pass when all 5 commands print their types and data correctly,
and PROCESSED|5 commands appears at the end.`,
    starterCode: `#include <iostream>
using namespace std;

enum CommandType { CMD_MOVE, CMD_ATTACK, CMD_INTERACT, CMD_USE_ITEM };
struct Command { CommandType type; int dx; int dy; int target_id; int item_slot; };

// TODO: Write processCommand(const Command& cmd)
// Switch on cmd.type:
//   CMD_MOVE: print CMD|MOVE|dx=X|dy=Y
//   CMD_ATTACK: print CMD|ATTACK|target=T
//   CMD_INTERACT: print CMD|INTERACT|target=T
//   CMD_USE_ITEM: print CMD|USE_ITEM|slot=S

int main() {
    Command queue[5] = {
        {CMD_MOVE, 1, 0, 0, 0},
        {CMD_ATTACK, 0, 0, 2, 0},
        {CMD_INTERACT, 0, 0, 5, 0},
        {CMD_USE_ITEM, 0, 0, 0, 0},
        {CMD_MOVE, 0, -1, 0, 0}
    };
    for (int i = 0; i < 5; i++) {
        // TODO: processCommand(queue[i])
    }
    // TODO: Print PROCESSED|5 commands
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum CommandType { CMD_MOVE, CMD_ATTACK, CMD_INTERACT, CMD_USE_ITEM };
struct Command { CommandType type; int dx; int dy; int target_id; int item_slot; };

void processCommand(const Command& cmd) {
    switch (cmd.type) {
        case CMD_MOVE: cout << "CMD|MOVE|dx=" << cmd.dx << "|dy=" << cmd.dy << endl; break;
        case CMD_ATTACK: cout << "CMD|ATTACK|target=" << cmd.target_id << endl; break;
        case CMD_INTERACT: cout << "CMD|INTERACT|target=" << cmd.target_id << endl; break;
        case CMD_USE_ITEM: cout << "CMD|USE_ITEM|slot=" << cmd.item_slot << endl; break;
    }
}

int main() {
    Command queue[5] = {
        {CMD_MOVE, 1, 0, 0, 0},
        {CMD_ATTACK, 0, 0, 2, 0},
        {CMD_INTERACT, 0, 0, 5, 0},
        {CMD_USE_ITEM, 0, 0, 0, 0},
        {CMD_MOVE, 0, -1, 0, 0}
    };
    for (int i = 0; i < 5; i++) processCommand(queue[i]);
    cout << "PROCESSED|5 commands" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Move command", expectedOutput: "CMD|MOVE|dx=1|dy=0", isPattern: false },
      { id: "g2", description: "Attack command", expectedOutput: "CMD|ATTACK|target=2", isPattern: false },
      { id: "g3", description: "Interact command", expectedOutput: "CMD|INTERACT|target=5", isPattern: false },
      { id: "g4", description: "Use item command", expectedOutput: "CMD|USE_ITEM|slot=0", isPattern: false },
      { id: "g5", description: "All processed", expectedOutput: "PROCESSED|5 commands", isPattern: false },
    ],
    hints: [
      "processCommand uses switch(cmd.type). Each case prints the command type and its relevant fields.",
      "CMD_MOVE prints dx and dy. CMD_ATTACK and CMD_INTERACT print target_id. CMD_USE_ITEM prints item_slot.",
      "Don't forget break after each case! Without it, execution falls through to the next case.",
    ],
    estimatedMinutes: 10,
  },
};