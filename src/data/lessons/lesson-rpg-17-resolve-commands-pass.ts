import { Lesson } from "@/types/lesson";

export const lessonRPG17: Lesson = {
  id: "rpg-17-resolve-commands-pass",
  title: "Resolve Commands Pass",
  description: "Resolve pass reads commands, applies moves. Commands are data—not function calls. The world finally moves.",
  order: 17,
  xpReward: 100,
  tier: "pro",
  concepts: ["resolve pass", "command processing", "data-driven execution", "pipeline order", "deterministic resolution"],
  part1: {
    title: "Concept: Resolve Commands Pass",
    type: "concept",
    instructions: `# Resolve Commands Pass

## Mental Model

Commands are data at rest. The resolve pass is the machine that reads them and makes things happen. It iterates the command queue, reads each Command struct, and applies the effect: move an entity, queue an attack, trigger an interaction. The resolve pass is the ONLY place world state changes due to commands. No other pass touches the data that commands control.

## What Breaks Without This

\`\`\`cpp
// Without a resolve pass: commands just sit in the queue
enqueueCmd(w, 0, CMD_MOVE, 1, 0);
enqueueCmd(w, 1, CMD_MOVE, 0, 1);
// ...tick ends. Nothing moved. Queue resets next tick.
// All that intent data is lost.
\`\`\`

Without a resolve pass, Lesson 16's command queue is a dead letter box. Commands pile up, the tick ends, the queue resets, nothing happened. The resolve pass is the consumer. Without it, the producer (enqueue) has no effect.

## The Fix: resolveCommands()

The resolve pass is a simple loop over the command queue:

\`\`\`cpp
void resolveCommands(WorldState& w) {
    for (int i = 0; i < w.cmd_count; i++) {
        Command& c = w.cmd_queue[i];
        if (c.type == CMD_MOVE) {
            int nx = w.pos_x[c.entity_id] + c.dx;
            int ny = w.pos_y[c.entity_id] + c.dy;
            if (nx > 0 && nx < W-1 && ny > 0 && ny < H-1) {
                w.pos_x[c.entity_id] = nx;
                w.pos_y[c.entity_id] = ny;
            }
            cout << "RESOLVE|move|entity=" << c.entity_id
                 << "|to=" << w.pos_x[c.entity_id]
                 << "," << w.pos_y[c.entity_id] << endl;
        }
    }
}
\`\`\`

This function does three things: reads the command, validates the move (bounds check), and applies the position change. It also prints a RESOLVE line so the student can observe the pipeline working. The resolve pass runs after all commands are enqueued and before render.

The key insight: commands are processed in queue order. Player's command first (index 0), then enemy's command (index 1). This ordering is deterministic. Same queue → same result. Every time.

After resolve, the queue is consumed. It resets at the start of the next tick. The resolve pass is a pure consumer — it reads commands, applies effects, and moves on.

## Key Concepts

- **resolveCommands()** — iterates the queue, applies each command's effect to world state.
- **Bounds checking** — move commands are validated before applying. Wall check prevents out-of-bounds.
- **Queue order = execution order** — commands resolve in FIFO order. Deterministic.
- **Pipeline placement** — resolve runs after enqueue (input + AI), before render.

## Performance Insight

The resolve pass is O(N) where N = number of commands this tick. For a turn-based RPG with 2–10 entities, N is tiny. The bounds check is a few comparisons. No allocations. No branching beyond the command type switch. The CPU executes this in microseconds.

## Memory Insight

The resolve pass reads from cmd_queue (already allocated in WorldState) and writes to pos_x/pos_y arrays (also in WorldState). Zero new memory. The function signature \`resolveCommands(WorldState& w)\` takes a reference — no copy, no allocation. The Command struct is read by reference from the queue. Everything stays in the same memory footprint.

## Your Task

Implement resolveCommands() that processes move commands. Enqueue 3 move-right commands for entity 0 starting at position (1,1). Resolve them. Print each resolution and the final position:

\`\`\`
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
RESOLVE|move|entity=0|to=2,1
RESOLVE|move|entity=0|to=3,1
RESOLVE|move|entity=0|to=4,1
FINAL_POS|entity=0|x=4|y=1
\`\`\`

## Beginner Trap

**Resolving commands inside the enqueue function.** If \`enqueueCmd\` also moves the entity, you have merged intent with execution. The whole point of the command queue is that enqueueing and resolving are separate steps. Enqueue writes data. Resolve reads data. Keep them apart.

## Elite Insight

The command pattern in Baldur's Gate's Infinity Engine works this way: player clicks a tile, the engine queues a MOVE_TO command, the action resolver processes it during the next update. The resolver handles pathfinding, collision, and animation state. The click handler just writes a command struct. This separation allows the engine to pause, save, and replay — the command log IS the game history.

## Systems Thinking Connection

The resolve pass is the RPG equivalent of a message consumer in event-driven architecture. The command queue is the message broker. Producers (input, AI) write messages. The consumer (resolve) reads and processes them. This is the same pattern as ROS2 topic callbacks — a subscriber receives messages and acts on them, decoupled from the publisher.

## Skill Reinforcement

Lesson 16 introduced the Command struct and enqueueCmd. This lesson adds the resolve pass that consumes those commands. Lesson 18 will extract combat into its own resolve pass — separating movement resolution from attack resolution.

## Mastery Check

If two entities both issue CMD_MOVE to the same tile in the same tick, who gets it? Answer: The one whose command appears first in the queue. The resolve pass processes commands in order. Entity 0's move resolves first, occupying the tile. Entity 1's move should check occupancy — but in this basic version, both move. Collision resolution comes in later lessons. The important thing: the order is deterministic.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, MAX_CMDS=64;
const int CMD_MOVE=1;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

const int MAX_E=16;
int pos_x[MAX_E], pos_y[MAX_E];
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

// TODO: implement resolveCommands()
// Loop through cmd_queue[0..cmd_count-1]
// For CMD_MOVE: compute nx, ny. Bounds check (>0, <W-1, <H-1).
// Apply: pos_x[entity_id] = nx, pos_y[entity_id] = ny
// Print: RESOLVE|move|entity=N|to=X,Y

int main() {
    pos_x[0]=1; pos_y[0]=1;

    enqueueCmd(0, CMD_MOVE, 1, 0);
    enqueueCmd(0, CMD_MOVE, 1, 0);
    enqueueCmd(0, CMD_MOVE, 1, 0);

    // TODO: call resolveCommands()

    cout << "FINAL_POS|entity=0|x=" << pos_x[0]
         << "|y=" << pos_y[0] << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, MAX_CMDS=64;
const int CMD_MOVE=1;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

const int MAX_E=16;
int pos_x[MAX_E], pos_y[MAX_E];
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

void resolveCommands() {
    for (int i = 0; i < cmd_count; i++) {
        Command& c = cmd_queue[i];
        if (c.type == CMD_MOVE) {
            int nx = pos_x[c.entity_id] + c.dx;
            int ny = pos_y[c.entity_id] + c.dy;
            if (nx > 0 && nx < W-1 && ny > 0 && ny < H-1) {
                pos_x[c.entity_id] = nx;
                pos_y[c.entity_id] = ny;
            }
            cout << "RESOLVE|move|entity=" << c.entity_id
                 << "|to=" << pos_x[c.entity_id]
                 << "," << pos_y[c.entity_id] << endl;
        }
    }
}

int main() {
    pos_x[0]=1; pos_y[0]=1;

    enqueueCmd(0, CMD_MOVE, 1, 0);
    enqueueCmd(0, CMD_MOVE, 1, 0);
    enqueueCmd(0, CMD_MOVE, 1, 0);

    resolveCommands();

    cout << "FINAL_POS|entity=0|x=" << pos_x[0]
         << "|y=" << pos_y[0] << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "First resolve prints correct position", expectedOutput: "RESOLVE\\|move\\|entity=0\\|to=2,1", isPattern: true },
      { id: "t2", description: "Third resolve reaches position 4,1", expectedOutput: "RESOLVE\\|move\\|entity=0\\|to=4,1", isPattern: true },
      { id: "t3", description: "Final position is correct", expectedOutput: "FINAL_POS\\|entity=0\\|x=4\\|y=1", isPattern: true },
    ],
    hints: [
      "resolveCommands loops through cmd_queue from 0 to cmd_count-1 and checks the type field.",
      "For CMD_MOVE: compute nx = pos_x[entity_id] + dx. Bounds check: nx > 0 && nx < W-1. Apply and print.",
      "The resolve prints the NEW position after applying the move. Three moves from (1,1) with dx=1 give (2,1), (3,1), (4,1).",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Multi-Turn Game with Command Resolution",
    type: "game_builder",
    instructions: `# Build: Multi-Turn Game with Command Resolution

## Mental Model

The game loop now has three distinct phases: enqueue commands (input + AI), resolve commands (apply moves), render state. The world moves because commands are resolved, not because input handlers mutate state directly. This is the command pipeline in action.

## What Breaks Without This

Without resolve, the command queue from L16 is a dead letter box. Commands pile up, the tick ends, positions are unchanged. The resolve pass is what makes the pipeline real — it converts data (commands) into state changes (positions).

## The Fix

Integrate resolveCommands into game_tick. The order is: reset queue → enqueue player command → enqueue AI command → resolve all commands → render. Now entities actually move each tick.

## Key Concepts

- **Pipeline order** — enqueue → resolve → render. Always this order.
- **Position changes** — entities now move! Player goes right, enemy goes down, each tick.
- **Observable state** — RESOLVE lines show exactly what happened. ENTITY lines show the result.
- **Deterministic output** — same inputs produce same positions every run.

## Performance Insight

The resolve pass adds one linear scan of the command queue per tick. With 2 commands, that is 2 iterations. The bounds check is 4 comparisons per move. Total cost: negligible. The separation of enqueue and resolve pays off when you add more command types (attack, interact, use item) — the resolve pass just gets more cases, not more passes.

## Memory Insight

No new memory is allocated. resolveCommands reads from cmd_queue and writes to pos_x/pos_y — both already in WorldState. The function operates entirely within the existing allocation footprint. Zero heap growth per tick.

## Your Task

Build a 3-tick game. Player moves right ('d') each tick, enemy moves down each tick. Commands are enqueued then resolved. Positions update. Print the full pipeline output:

\`\`\`
TICK|1
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=1|type=1|dx=0|dy=1
RESOLVE|move|entity=0|to=2,1
RESOLVE|move|entity=1|to=8,6
ENTITY|hero|player|48|24|24|24
ENTITY|orc|enemy|192|144|24|24
TURN|1
HP|100
GOLD|0
GAME_MESSAGE|Resolved 2 commands
TICK|2
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=1|type=1|dx=0|dy=1
RESOLVE|move|entity=0|to=3,1
RESOLVE|move|entity=1|to=8,7
ENTITY|hero|player|72|24|24|24
ENTITY|orc|enemy|192|168|24|24
TURN|2
HP|100
GOLD|0
GAME_MESSAGE|Resolved 2 commands
TICK|3
CMD_ENQUEUE|entity=0|type=1|dx=1|dy=0
CMD_ENQUEUE|entity=1|type=1|dx=0|dy=1
RESOLVE|move|entity=0|to=4,1
RESOLVE|move|entity=1|to=8,8
ENTITY|hero|player|96|24|24|24
ENTITY|orc|enemy|192|192|24|24
TURN|3
HP|100
GOLD|0
GAME_MESSAGE|Resolved 2 commands
\`\`\`

## Beginner Trap

**Forgetting to reset \`cmd_count\` at the start of each tick.** If you don't reset, tick 2 starts with tick 1's commands still in the queue. The resolve pass processes them again — the player moves twice as far. Always: \`w.cmd_count = 0\` at the top of game_tick.

## Elite Insight

FromSoftware's Dark Souls uses input buffering — a form of command queue. When you press attack during a roll, the command is buffered and executes when the roll finishes. The buffer is a tiny queue with a timeout. Your command queue is the same idea, without the timeout: intent is captured, then resolved at the right moment in the pipeline.

## Mastery Check

What would happen if you called resolveCommands() BEFORE enqueueing commands? Answer: The queue is empty (cmd_count = 0 from the reset). The resolve pass iterates zero times. Nothing moves. The commands enqueued after are never processed until the next tick's resolve. Pipeline order matters — enqueue must come before resolve.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=16, MAX_CMDS=64;
const int CMD_MOVE=1;

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

// TODO: implement resolveCommands(WorldState& w)
// Loop cmd_queue[0..cmd_count-1]. For CMD_MOVE: bounds check, apply pos, print RESOLVE line.

void game_tick(WorldState& w, char input) {
    w.turn++;
    w.cmd_count = 0;
    cout << "TICK|" << w.turn << endl;

    // Enqueue player command
    int dx=0, dy=0;
    if (input=='d') dx=1;
    else if (input=='a') dx=-1;
    else if (input=='s') dy=1;
    else if (input=='w') dy=-1;
    enqueueCmd(w, 0, CMD_MOVE, dx, dy);

    // Enemy AI command
    enqueueCmd(w, 1, CMD_MOVE, 0, 1);

    // TODO: call resolveCommands(w)

    // Render
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
    cout << "GAME_MESSAGE|Resolved " << w.cmd_count << " commands" << endl;
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
const int CMD_MOVE=1;

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

void resolveCommands(WorldState& w) {
    for (int i = 0; i < w.cmd_count; i++) {
        Command& c = w.cmd_queue[i];
        if (c.type == CMD_MOVE) {
            int nx = w.pos_x[c.entity_id] + c.dx;
            int ny = w.pos_y[c.entity_id] + c.dy;
            if (nx > 0 && nx < W-1 && ny > 0 && ny < H-1) {
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

    enqueueCmd(w, 1, CMD_MOVE, 0, 1);

    resolveCommands(w);

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
    cout << "GAME_MESSAGE|Resolved " << w.cmd_count << " commands" << endl;
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
      { id: "g1", description: "Player position changes after resolve", expectedOutput: "RESOLVE\\|move\\|entity=0\\|to=2,1", isPattern: true },
      { id: "g2", description: "Enemy position changes after resolve", expectedOutput: "RESOLVE\\|move\\|entity=1\\|to=8,6", isPattern: true },
      { id: "g3", description: "Player entity renders at new position tick 1", expectedOutput: "ENTITY\\|hero\\|player\\|48\\|24\\|24\\|24", isPattern: true },
      { id: "g4", description: "Enemy entity renders at new position tick 1", expectedOutput: "ENTITY\\|orc\\|enemy\\|192\\|144\\|24\\|24", isPattern: true },
      { id: "g5", description: "Resolved command count shown in message", expectedOutput: "GAME_MESSAGE\\|Resolved 2 commands", isPattern: true },
    ],
    hints: [
      "resolveCommands takes WorldState& w and loops w.cmd_queue. Apply moves with bounds checking.",
      "Call resolveCommands(w) after both enqueueCmd calls and before the render loop.",
      "Player starts at (1,1), moves dx=1 each tick: tick 1 -> (2,1), tick 2 -> (3,1), tick 3 -> (4,1). Enemy starts at (8,5), moves dy=1: tick 1 -> (8,6).",
    ],
    estimatedMinutes: 15,
  },
};