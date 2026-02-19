import { Lesson } from "@/types/lesson";

export const lessonRPG16: Lesson = {
  id: "rpg-16-command-queue-v0",
  title: "Command Queue v0",
  description: "Intents stored as commands in a fixed array. Commands are data — not function calls. The resolve pass reads them; the tick loop queues them.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["command queue", "intent separation", "fixed-size buffer", "command struct", "deferred execution"],
  part1: {
    title: "Concept: Command Queue",
    type: "concept",
    instructions: `# Command Queue v0

## Mental Model

When the player presses 'd', they are not moving. They are declaring intent: "I want to move right." That intent is a Command struct — a tiny piece of data that says what should happen, not code that makes it happen. Commands pile up in a fixed-size array. The resolve pass reads them. Until then, nothing moves.

## What Breaks Without This

\`\`\`cpp
// Intent and execution tangled together
void handle_input(WorldState& w, char input) {
    if (input == 'd') {
        w.pos_x[0]++;  // immediate mutation!
        // What if combat depends on old position?
        // What if AI reads the new position before its turn?
    }
}
\`\`\`

The player moves before the enemy has decided what to do. The enemy reads the player's new position and reacts to it — but this tick's AI should have seen the old position. Order-dependent bugs multiply. The fix: separate intent from execution.

## The Fix: Command Queue

A Command is a plain struct: a type (MOVE, ATTACK) and an entity_id. Nothing else. No function pointers. No inheritance. Just data.

\`\`\`cpp
const int CMD_MOVE = 1;
const int CMD_ATTACK = 2;

struct Command {
    int type;       // CMD_MOVE, CMD_ATTACK
    int entity_id;  // who issued this command
    int dx, dy;     // direction (for moves)
};
\`\`\`

Commands queue into a fixed-size array. No heap. No \`std::vector\`. A \`Command cmd_queue[MAX_CMDS]\` and an \`int cmd_count = 0\`. Enqueue by writing to \`cmd_queue[cmd_count++]\`. The queue resets to zero every tick.

This pattern separates the "what" from the "when." The input pass writes commands. The resolve pass reads them. Between those two passes, the world state is untouched. Every system sees the same snapshot.

The command queue is the backbone of the RPG pipeline. Every action — move, attack, use item, open door — becomes a Command. The resolve pass processes them all in deterministic order. If you replay the same commands with the same seed, you get the same result. Every time.

## Key Concepts

- **Command struct** — Plain data: type + entity_id + parameters. No methods. No inheritance.
- **Fixed-size queue** — \`Command cmd_queue[MAX_CMDS]\` with \`cmd_count\`. Reset to 0 each tick.
- **Enqueue function** — \`enqueueCmd()\` writes a command to the next slot. Overflow is checked.
- **Intent vs execution** — Input pass writes commands. Resolve pass reads them. No direct mutation in the input pass.

## Performance Insight

A fixed-size command queue means zero heap allocation per tick. The array lives on the stack (or in the WorldState struct on the stack). Enqueueing is a single array write: O(1). Processing is a linear scan: O(N) where N is the number of commands this tick. For a turn-based RPG, N is typically 2–5 commands per tick. The CPU barely notices.

## Memory Insight

The command queue is a fixed-size array inside the WorldState struct. It occupies \`MAX_CMDS * sizeof(Command)\` bytes — typically 64 commands * 16 bytes = 1024 bytes. This is stack memory. It never grows. It never shrinks. It resets to zero at the start of each tick. No fragmentation. No allocator overhead. The queue's lifetime is the tick's lifetime.

## Your Task

Define a Command struct and enqueueCmd function. Enqueue 3 move-right commands for entity 0. Print each enqueued command and the final count:

\`\`\`
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_COUNT|3
\`\`\`

## Beginner Trap

**Using \`std::vector<Command>\` for the queue.** It works — but it allocates heap memory. In a turn-based RPG with 2–5 commands per tick, a 64-slot fixed array is more than enough. The vector's \`push_back\` calls \`malloc\` when capacity is exceeded. Fixed array = zero allocation = predictable performance.

## Elite Insight

Nethack's command system works this way: player input is converted to a command code, then resolved in a central dispatch. Every action — move, fight, eat, read — is a command integer. The game replay system records these command codes. Replaying them reproduces the exact game. Your Command struct is the same pattern, just made explicit as a C++ struct instead of a macro-based enum.

## Systems Thinking Connection

This command queue is the RPG equivalent of ROS2's action server. Intent in, result out, no hidden state mutation. The Space Shooter path uses direct system loops over entity arrays — no command queue needed because every entity does the same thing (move, shoot). RPG entities do different things per turn, so commands are the natural abstraction.

## Skill Reinforcement

Lesson 3 introduced intent vs action (WASD writes intent, not movement). Lesson 8 introduced attack as a check, not immediate resolution. This lesson formalizes both into a reusable queue. Lesson 17 adds the resolve pass that actually processes these commands.

## Mastery Check

Why must the command queue reset to zero at the start of each tick, rather than persisting across ticks? Answer: Commands represent intent for THIS tick only. If they persist, a move command from tick 3 would re-execute in tick 4. The queue is ephemeral — it captures the snapshot of all intents for one tick, then is consumed and discarded.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_CMDS = 64;
const int CMD_MOVE = 1;
const int CMD_ATTACK = 2;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

Command cmd_queue[MAX_CMDS];
int cmd_count = 0;

// TODO: implement enqueueCmd(int entity_id, int type, int dx, int dy)
// Should write to cmd_queue[cmd_count] and increment cmd_count
// Print: CMD_ENQUEUE|entity=N|type=T|dx=X|dy=Y

int main() {
    // TODO: enqueue 3 move-right commands for entity 0
    // Each: enqueueCmd(0, CMD_MOVE, 1, 0)

    cout << "CMD_COUNT|" << cmd_count << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_CMDS = 64;
const int CMD_MOVE = 1;
const int CMD_ATTACK = 2;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

Command cmd_queue[MAX_CMDS];
int cmd_count = 0;

void enqueueCmd(int entity_id, int type, int dx, int dy) {
    if (cmd_count >= MAX_CMDS) return;
    cmd_queue[cmd_count].type = type;
    cmd_queue[cmd_count].entity_id = entity_id;
    cmd_queue[cmd_count].dx = dx;
    cmd_queue[cmd_count].dy = dy;
    cout << "CMD_ENQUEUE|entity=" << entity_id
         << "|type=" << type
         << "|dx=" << dx
         << "|dy=" << dy << endl;
    cmd_count++;
}

int main() {
    enqueueCmd(0, CMD_MOVE, 1, 0);
    enqueueCmd(0, CMD_MOVE, 1, 0);
    enqueueCmd(0, CMD_MOVE, 1, 0);

    cout << "CMD_COUNT|" << cmd_count << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "First command enqueued", expectedOutput: "CMD_ENQUEUE\\|entity=0\\|type=1\\|dx=1\\|dy=0", isPattern: true },
      { id: "t2", description: "Three commands enqueued total", expectedOutput: "CMD_COUNT\\|3", isPattern: true },
      { id: "t3", description: "Command struct has correct type field", expectedOutput: "type=1", isPattern: true },
    ],
    hints: [
      "Command is just a struct with type, entity_id, dx, dy. No methods needed.",
      "enqueueCmd writes to cmd_queue[cmd_count] then increments cmd_count. Print the CMD_ENQUEUE line inside the function.",
      "Call enqueueCmd(0, CMD_MOVE, 1, 0) three times in main(). The print statement for CMD_COUNT is already there.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Dungeon with Command Queue",
    type: "game_builder",
    instructions: `# Build: Dungeon with Command Queue

## Mental Model

The player presses keys. The enemy decides to move. Both write commands to the same queue. Nothing happens yet — the queue just holds intent. In the next lesson, the resolve pass will read these commands and apply them. For now, you are building the plumbing: the queue, the enqueue, and the proof that intent is captured as data.

## What Breaks Without This

Without a command queue, player input mutates world state immediately. The enemy AI then sees the mutated state and reacts to it — but it should have reacted to the state BEFORE the player moved. Commands decouple input timing from execution order. Every system sees the same snapshot of the world.

## The Fix

Integrate the Command struct and enqueueCmd into the full game loop. The input pass enqueues the player's command. The AI pass enqueues the enemy's command. Both run before any state changes. The queue is printed to show all intents for this tick.

## Key Concepts

- **Two sources of commands** — player input and enemy AI both enqueue into the same queue.
- **Queue reset per tick** — \`cmd_count = 0\` at the start of each tick.
- **Deterministic ordering** — player commands first, then AI commands. Same order every tick.
- **Observable pipeline** — print each enqueued command so the student sees the queue fill up.

## Performance Insight

Two commands per tick (one player, one enemy) means the queue is nearly empty. The overhead is negligible. But the pattern scales: with 50 enemies, you get 51 commands per tick — still a tiny linear scan. No heap, no resizing, no allocator calls.

## Memory Insight

The command queue array is part of WorldState. It lives wherever WorldState lives — stack in main(). Each tick, cmd_count resets. The old data is overwritten, never freed. This is the zero-allocation pattern: reuse the same memory every tick.

## Your Task

Build a 3-tick game. Each tick: player enqueues a move-right command, enemy (entity 1) enqueues a move-down command. Print all commands and the queue count each tick:

\`\`\`
TICK|1
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=1|type=1|dx=0|dy=1
CMD_COUNT|2
ENTITY|hero|player|24|24|24|24
ENTITY|orc|enemy|192|120|24|24
TURN|1
HP|100
GOLD|0
GAME_MESSAGE|Commands queued: 2
TICK|2
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=1|type=1|dx=0|dy=1
CMD_COUNT|2
ENTITY|hero|player|24|24|24|24
ENTITY|orc|enemy|192|120|24|24
TURN|2
HP|100
GOLD|0
GAME_MESSAGE|Commands queued: 2
TICK|3
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=1|type=1|dx=0|dy=1
CMD_COUNT|2
ENTITY|hero|player|24|24|24|24
ENTITY|orc|enemy|192|120|24|24
TURN|3
HP|100
GOLD|0
GAME_MESSAGE|Commands queued: 2
\`\`\`

Note: positions do NOT change yet — commands are queued but not resolved. That comes in Lesson 17.

## Beginner Trap

**Applying commands immediately after enqueueing.** The temptation is to move the player right after \`enqueueCmd\`. Resist. The whole point is that enqueue and resolve are separate passes. If you apply during enqueue, the enemy's AI sees the new position. Commands must be data at rest until the resolve pass.

## Elite Insight

Diablo 2's multiplayer uses exactly this pattern: client actions are serialized as command packets, sent to the server, queued, then resolved in deterministic order. The server never applies a client action immediately — it queues it. Your local command queue is the single-player version of this architecture. The pattern scales from single-player to multiplayer without structural change.

## Mastery Check

If you accidentally apply the player's command before enqueueing the enemy's, what goes wrong? Answer: The enemy AI reads the player's NEW position, not the position the player had when the tick started. The enemy appears to "predict" the player's move. This is an order-dependent bug that only a command queue prevents.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=16, MAX_CMDS=64;
const int CMD_MOVE=1, CMD_ATTACK=2;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    Command cmd_queue[MAX_CMDS];
    int cmd_count;
    int turn;
    int gold;
};

// TODO: implement enqueueCmd(WorldState& w, int entity_id, int type, int dx, int dy)
// Print CMD_ENQUEUE line, write to w.cmd_queue, increment w.cmd_count

void game_tick(WorldState& w, char input) {
    w.turn++;
    w.cmd_count = 0; // reset queue each tick
    cout << "TICK|" << w.turn << endl;

    // TODO: enqueue player command based on input (entity 0)
    // TODO: enqueue enemy command (entity 1 moves dy=1)

    cout << "CMD_COUNT|" << w.cmd_count << endl;

    // Render (no movement applied yet)
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
    cout << "GAME_MESSAGE|Commands queued: " << w.cmd_count << endl;
}

int main() {
    WorldState w = {};
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=8; w.pos_y[1]=5; w.hp[1]=30; w.alive[1]=true;
    w.entity_count=2;

    char inputs[] = {'d','d','d'};
    for (char c : inputs) game_tick(w, c);

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=16, MAX_CMDS=64;
const int CMD_MOVE=1, CMD_ATTACK=2;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    Command cmd_queue[MAX_CMDS];
    int cmd_count;
    int turn;
    int gold;
};

void enqueueCmd(WorldState& w, int entity_id, int type, int dx, int dy) {
    if (w.cmd_count >= MAX_CMDS) return;
    w.cmd_queue[w.cmd_count].type = type;
    w.cmd_queue[w.cmd_count].entity_id = entity_id;
    w.cmd_queue[w.cmd_count].dx = dx;
    w.cmd_queue[w.cmd_count].dy = dy;
    cout << "CMD_ENQUEUE|entity=" << entity_id
         << "|type=" << type
         << "|dx=" << dx
         << "|dy=" << dy << endl;
    w.cmd_count++;
}

void game_tick(WorldState& w, char input) {
    w.turn++;
    w.cmd_count = 0;
    cout << "TICK|" << w.turn << endl;

    // Player command
    int dx=0, dy=0;
    if (input=='d') dx=1;
    else if (input=='a') dx=-1;
    else if (input=='s') dy=1;
    else if (input=='w') dy=-1;
    enqueueCmd(w, 0, CMD_MOVE, dx, dy);

    // Enemy AI command
    enqueueCmd(w, 1, CMD_MOVE, 0, 1);

    cout << "CMD_COUNT|" << w.cmd_count << endl;

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
    cout << "GAME_MESSAGE|Commands queued: " << w.cmd_count << endl;
}

int main() {
    WorldState w = {};
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=8; w.pos_y[1]=5; w.hp[1]=30; w.alive[1]=true;
    w.entity_count=2;

    char inputs[] = {'d','d','d'};
    for (char c : inputs) game_tick(w, c);

    return 0;
}`,
    tests: [
      { id: "g1", description: "Player command enqueued each tick", expectedOutput: "CMD_ENQUEUE\\|entity=0\\|type=1\\|dx=1\\|dy=0", isPattern: true },
      { id: "g2", description: "Enemy command enqueued each tick", expectedOutput: "CMD_ENQUEUE\\|entity=1\\|type=1\\|dx=0\\|dy=1", isPattern: true },
      { id: "g3", description: "Two commands per tick", expectedOutput: "CMD_COUNT\\|2", isPattern: true },
      { id: "g4", description: "Player position unchanged (not resolved)", expectedOutput: "ENTITY\\|hero\\|player\\|24\\|24\\|24\\|24", isPattern: true },
      { id: "g5", description: "Game message shows command count", expectedOutput: "GAME_MESSAGE\\|Commands queued: 2", isPattern: true },
    ],
    hints: [
      "The input pass converts the char to dx/dy and calls enqueueCmd. The AI pass calls enqueueCmd for entity 1.",
      "Reset cmd_count to 0 at the top of each tick. Enqueue player command first, then enemy command.",
      "Positions do NOT change in this lesson. The render pass reads pos_x/pos_y which are never modified. Commands are queued but not resolved.",
    ],
    estimatedMinutes: 12,
  },
};