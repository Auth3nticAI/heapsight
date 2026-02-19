import { Lesson } from "@/types/lesson";

export const lessonRPG64: Lesson = {
  id: "rpg-64-replay-log-v0",
  title: "Replay Log v0",
  description: "Inputs recorded to a fixed-size log buffer. Every command the player issues is captured for deterministic replay.",
  order: 64,
  xpReward: 100,
  tier: "pro",
  concepts: ["input logging", "replay buffer", "command recording", "deterministic replay", "fixed-size log"],
  part1: {
    title: "Concept: Replay Log v0",
    type: "concept",
    instructions: `# Replay Log v0

## Mental Model

A replay log is a recording of every input the player made during a game session. Not the game state — the inputs. Given the same seed and the same input sequence, a deterministic game produces the same state. This is the foundation of replay: record inputs, replay inputs, verify the result matches.

The log is a fixed-size array of command entries. Each entry stores the turn number and the command type (move direction or attack). The log grows by one entry per turn. At the end of the session, the log contains the complete input history.

## What Breaks Without This

Without a replay log, you have no way to verify determinism. You can't prove that the same inputs produce the same state because you don't have the inputs. Bugs that corrupt state are invisible — you can't reproduce them. With a log, you replay the exact sequence and compare the final state. If they differ, your game has a determinism bug.

\`\`\`cpp
// Without replay log:
// "The enemy died on turn 5 but not on the second playthrough"
// "Was the input different? Was the seed different? No idea."

// With replay log:
// Replay inputs from log. Same seed. Different result.
// Determinism bug detected. Fix the ordering issue in combat pass.
\`\`\`

## The Fix: Fixed-Size Command Log

\`\`\`cpp
const int MAX_LOG = 256;

struct LogEntry {
    int turn;
    int command;  // 0=none, 1=up, 2=down, 3=left, 4=right, 5=attack
};

struct ReplayLog {
    LogEntry entries[MAX_LOG];
    int count;
};

void logCommand(ReplayLog& log, int turn, int cmd) {
    if (log.count < MAX_LOG) {
        log.entries[log.count] = {turn, cmd};
        log.count++;
    }
}
\`\`\`

Each turn, after the player inputs a command, call \`logCommand\`. At session end, the log contains the full input sequence. This is your replay file.

## Key Concepts

- **Input recording** — log the command, not the result. The game engine recomputes results during replay.
- **Turn-stamped entries** — each entry has the turn number. This catches ordering bugs during replay.
- **Fixed-size buffer** — \`MAX_LOG = 256\` entries. No heap allocation. Fits in the stack.
- **Replay = determinism test** — feed logged inputs to a fresh game with the same seed. Compare final state.

## Performance Insight

A LogEntry is 8 bytes (two ints). 256 entries = 2 KB. This fits in L1 cache. Writing one entry per turn is a single memcpy-equivalent — two int writes. Zero overhead on the game loop. The log exists entirely on the stack with no dynamic allocation.

## Memory Insight

\`ReplayLog\` is \`256 * 8 + 4 = 2052 bytes\` on the stack. That's the entire replay system's memory footprint. No pointers, no heap, no fragmentation. When the function returns, the memory is reclaimed automatically. This is the Gate A principle: zero heap in the game loop.

## Your Task

Create a ReplayLog struct and log a sequence of 5 commands. Print the log contents showing turn numbers and command types.

Expected output:
\`\`\`
LOG_START|capacity=256
LOG_ENTRY|turn=0|cmd=4
LOG_ENTRY|turn=1|cmd=4
LOG_ENTRY|turn=2|cmd=5
LOG_ENTRY|turn=3|cmd=2
LOG_ENTRY|turn=4|cmd=5
LOG_SIZE|5
\`\`\`

## Beginner Trap

**Logging the game state instead of the input.** If you log "player moved to (3,4)" instead of "player pressed RIGHT", your replay depends on the state being correct — which is exactly what you're trying to verify. Log the INPUT. Let the engine compute the state.

## Elite Insight

Doom's demo recording system works exactly this way: record player inputs (forward, turn, fire) per tic, then replay them through the same engine. If the demo desyncs, there's a determinism bug. Id Software used this technique from 1993 onward. Your ReplayLog follows the same architecture.

## Systems Thinking Connection

The Space Shooter path records input per frame. The RPG records input per turn. Different temporal resolution, same principle: capture the minimum data needed to reproduce the session. The RPG's turn-based nature makes this simpler — one command per turn instead of continuous input streams.

## Skill Reinforcement

L61–L63 built the save system (version, checksum, migration). This lesson starts the replay system. L65 will combine them: replay a short run and verify the final state matches. The save system persists state; the replay system verifies it.

## Mastery Check

Question: Why does the log store the turn number alongside each command?
Answer: Because during replay, the engine needs to apply commands at the correct turn. If commands are turn-stamped, you can verify that the replay engine is processing them in the right order. A missing turn or duplicate turn reveals a replay bug immediately.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;

struct LogEntry {
    int turn;
    int command;  // 0=none, 1=up, 2=down, 3=left, 4=right, 5=attack
};

struct ReplayLog {
    LogEntry entries[MAX_LOG];
    int count;
};

// TODO: Implement logCommand(ReplayLog& log, int turn, int cmd)
// Add a LogEntry at log.entries[log.count] with the given turn and command
// Increment count (but not past MAX_LOG)

void printLog(const ReplayLog& log) {
    for (int i = 0; i < log.count; i++) {
        cout << "LOG_ENTRY|turn=" << log.entries[i].turn
             << "|cmd=" << log.entries[i].command << endl;
    }
    cout << "LOG_SIZE|" << log.count << endl;
}

int main() {
    ReplayLog log = {};
    log.count = 0;

    cout << "LOG_START|capacity=" << MAX_LOG << endl;

    // TODO: Log 5 commands:
    // turn 0: cmd 4 (right)
    // turn 1: cmd 4 (right)
    // turn 2: cmd 5 (attack)
    // turn 3: cmd 2 (down)
    // turn 4: cmd 5 (attack)

    printLog(log);

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;

struct LogEntry {
    int turn;
    int command;
};

struct ReplayLog {
    LogEntry entries[MAX_LOG];
    int count;
};

void logCommand(ReplayLog& log, int turn, int cmd) {
    if (log.count < MAX_LOG) {
        log.entries[log.count] = {turn, cmd};
        log.count++;
    }
}

void printLog(const ReplayLog& log) {
    for (int i = 0; i < log.count; i++) {
        cout << "LOG_ENTRY|turn=" << log.entries[i].turn
             << "|cmd=" << log.entries[i].command << endl;
    }
    cout << "LOG_SIZE|" << log.count << endl;
}

int main() {
    ReplayLog log = {};
    log.count = 0;

    cout << "LOG_START|capacity=" << MAX_LOG << endl;

    logCommand(log, 0, 4);
    logCommand(log, 1, 4);
    logCommand(log, 2, 5);
    logCommand(log, 3, 2);
    logCommand(log, 4, 5);

    printLog(log);

    return 0;
}`,
    tests: [
      { id: "t1", description: "Log capacity shown", expectedOutput: "LOG_START|capacity=256", isPattern: false },
      { id: "t2", description: "First command logged", expectedOutput: "LOG_ENTRY|turn=0|cmd=4", isPattern: false },
      { id: "t3", description: "Attack on turn 2", expectedOutput: "LOG_ENTRY|turn=2|cmd=5", isPattern: false },
      { id: "t4", description: "Five entries logged", expectedOutput: "LOG_SIZE|5", isPattern: false },
    ],
    hints: [
      "logCommand writes to log.entries[log.count] and increments count. Guard with if (log.count < MAX_LOG).",
      "Each LogEntry has two fields: turn and command. Use aggregate init: {turn, cmd}.",
      "Call logCommand 5 times with the specified turn/cmd pairs. The printLog function handles output.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Replay Recording with Game State",
    type: "game_builder",
    instructions: `# Build: Replay Recording with Game State

## Mental Model

Now connect the replay log to actual game state. The game runs a 5-turn simulation: player moves and attacks on a grid. Every command is logged. After the simulation, print the log and the final game state. This is the complete recording side of the replay system — L66 will add the playback side.

## What Breaks Without This

A replay log without a game is just a list of numbers. A game without a replay log is untestable for determinism. This lesson connects them: commands drive state changes AND get recorded. The recording doesn't affect gameplay — it's a pure observer of input.

## The Fix: Log During Tick

\`\`\`cpp
void tick(World& w, ReplayLog& log, int cmd) {
    logCommand(log, w.turn, cmd);
    // Process command: move or attack
    w.turn++;
}
\`\`\`

The tick function takes the command, logs it, then processes it. Order matters: log BEFORE processing so the log captures the input that caused the state change.

## Key Concepts

- **Log before process** — record the command before applying it. The log is the input; the state is the output.
- **Seed in log header** — store the RNG seed alongside the command log. Replay needs both.
- **State hash at end** — compute a hash of the final state. This is the verification target for replay.
- **Observer pattern** — the log observes commands without affecting them. Pure recording.

## Performance Insight

Logging adds one array write per turn — 8 bytes. For a 100-turn game, that's 800 bytes of recording. The game state update (grid collision, HP math, entity removal) costs orders of magnitude more. Logging is free relative to gameplay.

## Memory Insight

The World struct and ReplayLog both live on the stack in main(). Total memory: ~200 bytes (World) + ~2 KB (ReplayLog) = ~2.2 KB. Everything fits in L1 cache. Zero heap allocation during the entire simulation.

## Your Task

Run a 5-turn game simulation on a 10x10 grid. Log every command. Print the grid, replay log, and final state.

Expected output:
\`\`\`
DUNGEON|rpg-v0
REPLAY_START|seed=42|capacity=256
TICK|turn=0|cmd=4|px=2|py=1
TICK|turn=1|cmd=4|px=3|py=1
TICK|turn=2|cmd=2|px=3|py=2
TICK|turn=3|cmd=2|px=3|py=3
TICK|turn=4|cmd=5|px=3|py=3
LOG_DUMP|entries=5
LOG_ENTRY|turn=0|cmd=4
LOG_ENTRY|turn=1|cmd=4
LOG_ENTRY|turn=2|cmd=2
LOG_ENTRY|turn=3|cmd=2
LOG_ENTRY|turn=4|cmd=5
GRID_ROW|0|##########
GRID_ROW|1|#........#
GRID_ROW|2|#........#
GRID_ROW|3|#..@.....#
GRID_ROW|4|#........#
GRID_ROW|5|#........#
GRID_ROW|6|#........#
GRID_ROW|7|#........#
GRID_ROW|8|#........#
GRID_ROW|9|##########
TURN|5
HP|30
GOLD|0
GAME_MESSAGE|Replay log recorded 5 commands.
\`\`\`

## Beginner Trap

**Logging after processing.** If you log the command after applying it, and the apply step modifies the command (e.g., clamps movement), the log records the modified version, not the original input. Always log the raw input before any processing.

## Elite Insight

StarCraft: Brood War's replay system records player actions per game tick. The replay file is tiny — just a sequence of (tick, player_id, action_type, target) entries. The game engine re-simulates the entire match from these inputs. Your system is the same pattern: input log + seed = complete replay.

## Mastery Check

Question: Why store the seed in the log header instead of deriving it from the first command?
Answer: Because the seed determines all RNG-driven behavior (enemy spawns, loot drops, damage rolls) BEFORE the first command. If the seed is wrong, the entire replay diverges from turn 0. The seed is initialization data, not input data — it belongs in the header.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10, TILE = 24;

struct LogEntry { int turn; int command; };
struct ReplayLog { LogEntry entries[MAX_LOG]; int count; };

void logCommand(ReplayLog& log, int turn, int cmd) {
    if (log.count < MAX_LOG) {
        log.entries[log.count] = {turn, cmd};
        log.count++;
    }
}

struct World {
    int px, py, hp, gold, turn;
    unsigned int seed;
};

void initWorld(World& w, unsigned int seed) {
    w.px = 1; w.py = 1; w.hp = 30; w.gold = 0; w.turn = 0; w.seed = seed;
}

// TODO: Implement tick(World& w, ReplayLog& log, int cmd)
// 1. Log the command FIRST: logCommand(log, w.turn, cmd)
// 2. Process: 1=up(py-1), 2=down(py+1), 3=left(px-1), 4=right(px+1), 5=attack(no move)
// 3. Clamp position to 1..W-2 and 1..H-2 (inside walls)
// 4. Print TICK line with turn, cmd, px, py
// 5. Increment w.turn

int main() {
    World w;
    initWorld(w, 42);
    ReplayLog log = {};
    log.count = 0;

    cout << "DUNGEON|rpg-v0" << endl;
    cout << "REPLAY_START|seed=" << w.seed << "|capacity=" << MAX_LOG << endl;

    int commands[] = {4, 4, 2, 2, 5};
    for (int i = 0; i < 5; i++) {
        // TODO: call tick(w, log, commands[i])
    }

    cout << "LOG_DUMP|entries=" << log.count << endl;
    for (int i = 0; i < log.count; i++) {
        cout << "LOG_ENTRY|turn=" << log.entries[i].turn
             << "|cmd=" << log.entries[i].command << endl;
    }

    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }
    grid[w.py][w.px] = '@';
    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.hp << endl;
    cout << "GOLD|" << w.gold << endl;
    cout << "GAME_MESSAGE|Replay log recorded " << log.count << " commands." << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10, TILE = 24;

struct LogEntry { int turn; int command; };
struct ReplayLog { LogEntry entries[MAX_LOG]; int count; };

void logCommand(ReplayLog& log, int turn, int cmd) {
    if (log.count < MAX_LOG) {
        log.entries[log.count] = {turn, cmd};
        log.count++;
    }
}

struct World {
    int px, py, hp, gold, turn;
    unsigned int seed;
};

void initWorld(World& w, unsigned int seed) {
    w.px = 1; w.py = 1; w.hp = 30; w.gold = 0; w.turn = 0; w.seed = seed;
}

void tick(World& w, ReplayLog& log, int cmd) {
    logCommand(log, w.turn, cmd);
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    cout << "TICK|turn=" << w.turn << "|cmd=" << cmd
         << "|px=" << w.px << "|py=" << w.py << endl;
    w.turn++;
}

int main() {
    World w;
    initWorld(w, 42);
    ReplayLog log = {};
    log.count = 0;

    cout << "DUNGEON|rpg-v0" << endl;
    cout << "REPLAY_START|seed=" << w.seed << "|capacity=" << MAX_LOG << endl;

    int commands[] = {4, 4, 2, 2, 5};
    for (int i = 0; i < 5; i++) {
        tick(w, log, commands[i]);
    }

    cout << "LOG_DUMP|entries=" << log.count << endl;
    for (int i = 0; i < log.count; i++) {
        cout << "LOG_ENTRY|turn=" << log.entries[i].turn
             << "|cmd=" << log.entries[i].command << endl;
    }

    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }
    grid[w.py][w.px] = '@';
    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.hp << endl;
    cout << "GOLD|" << w.gold << endl;
    cout << "GAME_MESSAGE|Replay log recorded " << log.count << " commands." << endl;

    return 0;
}`,
    tests: [
      { id: "g1", description: "Replay start header", expectedOutput: "REPLAY_START|seed=42|capacity=256", isPattern: false },
      { id: "g2", description: "First tick logged", expectedOutput: "TICK|turn=0|cmd=4|px=2|py=1", isPattern: false },
      { id: "g3", description: "Five entries in log", expectedOutput: "LOG_DUMP|entries=5", isPattern: false },
      { id: "g4", description: "Player at final position", expectedOutput: "GRID_ROW|3|#..@", isPattern: true },
      { id: "g5", description: "Game message with count", expectedOutput: "GAME_MESSAGE|Replay log recorded 5 commands.", isPattern: false },
    ],
    hints: [
      "In tick(), call logCommand BEFORE processing the command. Log the raw input.",
      "Movement: cmd 1=up(py--), 2=down(py++), 3=left(px--), 4=right(px++). Check bounds: 1 to W-2 or H-2.",
      "Print TICK line after processing so px/py show the NEW position. Then increment w.turn.",
    ],
    estimatedMinutes: 12,
  },
};