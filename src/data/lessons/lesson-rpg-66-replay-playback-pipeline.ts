import { Lesson } from "@/types/lesson";

export const lessonRPG66: Lesson = {
  id: "rpg-66-replay-playback-pipeline",
  title: "Replay Playback Pipeline",
  description: "Swap the input source from live to replay -- the game loop doesn't care where commands come from.",
  order: 66,
  xpReward: 100,
  tier: "pro",
  concepts: ["input source abstraction", "replay playback", "command pipeline", "determinism verification", "source swap"],
  part1: {
    title: "Concept: Replay Playback Pipeline",
    type: "concept",
    instructions: `# Replay Playback Pipeline

## Mental Model

During normal play, commands come from the player's keyboard. During replay, commands come from a log file. The game engine processes commands identically regardless of their source. Playback is not a separate code path -- it is an input source swap. The tick function does not know or care where its command originated.

This is the same principle behind Unix pipes: \`cat file | sort\` and \`echo data | sort\` both feed \`sort\` the same way. The consumer is decoupled from the producer. Your game loop is the consumer. The input source is the producer.

## What Breaks Without This

Without input source abstraction, you end up with two game loops -- one for live play, one for replay. When you fix a bug in the live loop, you forget to fix it in the replay loop. The replay diverges. You can't trust your determinism tests because the replay path runs different code than the live path. Two loops means two sources of bugs.

\`\`\`cpp
// BAD: Duplicated game loops
if (mode == LIVE) {
    for (int t = 0; t < turns; t++) {
        int cmd = getUserInput();
        tick(world, cmd);  // Version A
    }
} else {
    for (int t = 0; t < turns; t++) {
        int cmd = log.entries[t].command;
        tick(world, cmd);  // Version B -- will these stay in sync?
    }
}
\`\`\`

## The Fix: Input Source Swap

Define a function that returns the next command. During live play, it reads from a command array (simulating keyboard input). During replay, it reads from the log. The game loop calls this function without knowing which source is active.

\`\`\`cpp
int getCommand(const ReplayLog& log, int turn, bool replaying,
               const int* live_cmds) {
    if (replaying) return log.entries[turn].command;
    return live_cmds[turn];
}
\`\`\`

Now you have one game loop. One tick function. One code path. The only thing that changes between recording and playback is where the command integer comes from. This is the simplest form of the Strategy pattern -- behavior selected by a flag, with no virtual dispatch, no heap, no indirection.

The game loop becomes trivially simple:

\`\`\`cpp
for (int t = 0; t < turns; t++) {
    int cmd = getCommand(log, t, replaying, live_cmds);
    if (!replaying) logCommand(log, t, cmd);
    tick(world, cmd);
}
\`\`\`

Record mode: \`getCommand\` reads from \`live_cmds\`, logs the command, then ticks. Replay mode: \`getCommand\` reads from the log, skips logging, then ticks. Same loop. Same tick. Different source.

## Key Concepts

- **Input source abstraction** -- the game loop is decoupled from where commands originate
- **Single code path** -- one loop for both recording and playback eliminates divergence bugs
- **Replay as verification** -- if record and replay produce different final states, the architecture has a determinism bug
- **Strategy without ceremony** -- a boolean flag selects behavior, no class hierarchies needed

## Performance Insight

The \`getCommand\` function is a single branch -- one conditional per turn. The branch predictor will learn the pattern after the first call since \`replaying\` is constant for the entire run. Cost: effectively zero. The alternative (two separate loops) has the same branch count but doubles the code to maintain. Simpler code is faster code -- fewer instruction cache misses, fewer maintenance bugs.

## Memory Insight

The \`ReplayLog\` lives on the stack. During recording, commands flow from the \`live_cmds\` array (also stack) into the log. During replay, commands flow from the log back out. No heap allocation. No dynamic dispatch. The entire replay system fits in the same 2 KB stack buffer from L64. The input source swap is a control flow change, not a memory change.

## Your Task

Implement a \`getCommand\` function that returns a command from either the live input array or the replay log, depending on a \`replaying\` flag. Run a 5-turn game in record mode, then replay the same 5 turns from the log. Verify the final state matches.

Expected output:
\`\`\`
RECORD_PHASE|seed=42
TURN|0|cmd=4|px=2|py=1
TURN|1|cmd=4|px=3|py=1
TURN|2|cmd=2|px=3|py=2
TURN|3|cmd=5|px=3|py=2
TURN|4|cmd=4|px=4|py=2
RECORD_DONE|hp=30|sig=253
REPLAY_PHASE|seed=42
TURN|0|cmd=4|px=2|py=1
TURN|1|cmd=4|px=3|py=1
TURN|2|cmd=2|px=3|py=2
TURN|3|cmd=5|px=3|py=2
TURN|4|cmd=4|px=4|py=2
REPLAY_DONE|hp=30|sig=253
DETERMINISM|PASS
\`\`\`

## Beginner Trap

**Writing separate tick functions for record and replay.** The whole point of input source abstraction is that the tick function is identical in both modes. If you find yourself writing \`tickRecord()\` and \`tickReplay()\`, stop. You have one \`tick()\` function. The only difference is where the command comes from.

## Elite Insight

Doom's demo system (1993) uses exactly this pattern: the engine has one main loop. In normal play, input comes from the keyboard handler. In demo playback, input comes from the demo lump. The engine code is identical -- \`G_Ticker()\` doesn't know and doesn't care. John Carmack designed this so that any demo desync immediately reveals a determinism bug in the engine itself. Your \`getCommand\` function follows the same architecture.

## Systems Thinking Connection

This input source swap is the RPG equivalent of ROS2's rosbag playback. In robotics, you record sensor data to a bag file, then replay it through the same processing pipeline. The pipeline doesn't know if data comes from live sensors or a recording. Same principle: decouple the consumer from the producer.

## Skill Reinforcement

L64 built the ReplayLog struct and logCommand function. L65 proved replay works with two separate loops. This lesson eliminates the duplication by abstracting the input source. L67 will tackle iteration order pitfalls. L68 will add state signature verification at the end of a run. L69-70 will formalize the replay determinism gate.

## Mastery Check

Question: Why is it important that the game loop is identical during recording and replay?
Answer: Because if the loops differ, a passing replay test only proves the replay loop works -- not the live loop. A bug in the live loop won't be caught. One loop means the replay tests the exact code path players use. If replay diverges, the architecture has a real bug, not a test bug.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10;

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

int computeSig(const World& w) {
    return w.px * 31 + w.py * 17 + w.hp * 3 + w.turn;
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    // cmd == 5 is attack (no movement)
    cout << "TURN|" << w.turn << "|cmd=" << cmd
         << "|px=" << w.px << "|py=" << w.py << endl;
    w.turn++;
}

// TODO: Implement getCommand(const ReplayLog& log, int turn,
//       bool replaying, const int* live_cmds)
// If replaying, return log.entries[turn].command
// Otherwise, return live_cmds[turn]

int main() {
    World world;
    ReplayLog log = {};
    log.count = 0;

    int live_cmds[] = {4, 4, 2, 5, 4};
    int turns = 5;

    // Phase 1: Record
    initWorld(world, 42);
    cout << "RECORD_PHASE|seed=" << world.seed << endl;
    for (int t = 0; t < turns; t++) {
        // TODO: call getCommand with replaying=false
        // TODO: call logCommand to record the command
        // TODO: call tick with the command
    }
    int rec_sig = computeSig(world);
    cout << "RECORD_DONE|hp=" << world.hp << "|sig=" << rec_sig << endl;

    // Phase 2: Replay
    initWorld(world, 42);
    cout << "REPLAY_PHASE|seed=" << world.seed << endl;
    for (int t = 0; t < turns; t++) {
        // TODO: call getCommand with replaying=true
        // TODO: call tick with the command
    }
    int rep_sig = computeSig(world);
    cout << "REPLAY_DONE|hp=" << world.hp << "|sig=" << rep_sig << endl;

    // TODO: Compare signatures and print DETERMINISM|PASS or DETERMINISM|FAIL

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10;

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

int computeSig(const World& w) {
    return w.px * 31 + w.py * 17 + w.hp * 3 + w.turn;
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    cout << "TURN|" << w.turn << "|cmd=" << cmd
         << "|px=" << w.px << "|py=" << w.py << endl;
    w.turn++;
}

int getCommand(const ReplayLog& log, int turn, bool replaying, const int* live_cmds) {
    if (replaying) return log.entries[turn].command;
    return live_cmds[turn];
}

int main() {
    World world;
    ReplayLog log = {};
    log.count = 0;

    int live_cmds[] = {4, 4, 2, 5, 4};
    int turns = 5;

    // Phase 1: Record
    initWorld(world, 42);
    cout << "RECORD_PHASE|seed=" << world.seed << endl;
    for (int t = 0; t < turns; t++) {
        int cmd = getCommand(log, t, false, live_cmds);
        logCommand(log, t, cmd);
        tick(world, cmd);
    }
    int rec_sig = computeSig(world);
    cout << "RECORD_DONE|hp=" << world.hp << "|sig=" << rec_sig << endl;

    // Phase 2: Replay
    initWorld(world, 42);
    cout << "REPLAY_PHASE|seed=" << world.seed << endl;
    for (int t = 0; t < turns; t++) {
        int cmd = getCommand(log, t, true, live_cmds);
        tick(world, cmd);
    }
    int rep_sig = computeSig(world);
    cout << "REPLAY_DONE|hp=" << world.hp << "|sig=" << rep_sig << endl;

    if (rec_sig == rep_sig) cout << "DETERMINISM|PASS" << endl;
    else cout << "DETERMINISM|FAIL" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Record phase starts", expectedOutput: "RECORD_PHASE|seed=42", isPattern: false },
      { id: "t2", description: "First turn produces correct position", expectedOutput: "TURN|0|cmd=4|px=2|py=1", isPattern: false },
      { id: "t3", description: "Replay phase matches record", expectedOutput: "REPLAY_DONE|hp=30|sig=253", isPattern: false },
      { id: "t4", description: "Determinism verified", expectedOutput: "DETERMINISM|PASS", isPattern: false },
    ],
    hints: [
      "The getCommand function takes a replaying flag. When true, read from log.entries[turn].command. When false, read from live_cmds[turn].",
      "In the record loop, call getCommand with replaying=false, then logCommand to store the command, then tick. In the replay loop, call getCommand with replaying=true, then tick (no logging).",
      "Compare signatures: int rec_sig = computeSig(world) after recording, int rep_sig = computeSig(world) after replay. If equal, print DETERMINISM|PASS.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Input Source Swap",
    type: "game_builder",
    instructions: `# Build: Input Source Swap

## Mental Model

The full replay playback pipeline connects every system: grid rendering, command logging, state signatures, and determinism verification. Recording mode runs 5 turns of gameplay, logging each command. Replay mode feeds those logged commands back through the same tick function. The grid, the HP, the position -- everything must match. If it doesn't, the architecture is broken.

This is the dress rehearsal for Gate B (L70). If your replay pipeline works here, it will scale to the full game.

## What Breaks Without This

Without a complete pipeline, you have pieces that work in isolation but fail together. The log records commands but nobody reads them back. The grid renders but doesn't verify against replay. The signature computes but isn't compared. This lesson connects every piece into a single end-to-end flow: record, replay, compare, verdict.

## The Fix: End-to-End Pipeline

The pipeline has four stages:

1. **Initialize** -- seed the world, clear the log
2. **Record** -- run 5 turns with live commands, logging each one, render grid
3. **Replay** -- reinitialize world with same seed, run 5 turns from log, render grid
4. **Verify** -- compare state signatures, print verdict

\`\`\`cpp
// Record phase
initWorld(world, 42);
for (int t = 0; t < 5; t++) {
    int cmd = getCommand(log, t, false, live_cmds);
    logCommand(log, t, cmd);
    tick(world, cmd);
}
int rec_sig = computeSig(world);

// Replay phase -- same loop, different source
initWorld(world, 42);
for (int t = 0; t < 5; t++) {
    int cmd = getCommand(log, t, true, live_cmds);
    tick(world, cmd);
}
int rep_sig = computeSig(world);
\`\`\`

## Key Concepts

- **End-to-end verification** -- record, replay, and compare in one program run
- **Grid rendering as state witness** -- the grid shows the player position, confirming the tick pipeline works
- **State signature** -- a lightweight hash of world state (px, py, hp, turn) that compresses verification to a single integer
- **Determinism verdict** -- PASS or FAIL, no ambiguity

## Performance Insight

The entire pipeline (record + replay + verify) runs 10 turns total with one grid render per phase. Total work: 10 tick calls, 5 logCommand calls, 2 signature computations, 2 grid renders. All on the stack. A modern CPU executes this in microseconds. The overhead of replay verification is negligible compared to the confidence it provides.

## Memory Insight

Stack memory: World (~24 bytes) + ReplayLog (~2 KB) + grid (100 bytes) + live_cmds (20 bytes). Total: ~2.2 KB. No heap. The grid array is rebuilt from scratch each time -- no stale state leaks between phases. The World is reinitialized between record and replay, proving the replay starts from a clean state.

## Your Task

Build a complete replay pipeline that records 5 turns of gameplay, renders the grid, replays the same 5 turns from the log, renders the grid again, and compares state signatures.

Commands: [4, 4, 2, 5, 4] (right, right, down, attack, right)

Expected output:
\`\`\`
DUNGEON|rpg-replay-v1
RECORD_PHASE|seed=42
TURN|0|cmd=4|px=2|py=1
TURN|1|cmd=4|px=3|py=1
TURN|2|cmd=2|px=3|py=2
TURN|3|cmd=5|px=3|py=2
TURN|4|cmd=4|px=4|py=2
GRID_ROW|0|##########
GRID_ROW|1|#........#
GRID_ROW|2|#...@....#
GRID_ROW|3|#........#
GRID_ROW|4|#........#
GRID_ROW|5|#........#
GRID_ROW|6|#........#
GRID_ROW|7|#........#
GRID_ROW|8|#........#
GRID_ROW|9|##########
RECORD_DONE|hp=30|sig=253
REPLAY_PHASE|seed=42
TURN|0|cmd=4|px=2|py=1
TURN|1|cmd=4|px=3|py=1
TURN|2|cmd=2|px=3|py=2
TURN|3|cmd=5|px=3|py=2
TURN|4|cmd=4|px=4|py=2
GRID_ROW|0|##########
GRID_ROW|1|#........#
GRID_ROW|2|#...@....#
GRID_ROW|3|#........#
GRID_ROW|4|#........#
GRID_ROW|5|#........#
GRID_ROW|6|#........#
GRID_ROW|7|#........#
GRID_ROW|8|#........#
GRID_ROW|9|##########
REPLAY_DONE|hp=30|sig=253
SIG_RECORD|253
SIG_REPLAY|253
DETERMINISM|PASS
GAME_MESSAGE|Replay playback pipeline verified successfully.
\`\`\`

## Beginner Trap

**Forgetting to reinitialize the world before replay.** If you replay without calling \`initWorld\` again, the world starts from the post-record state (px=4, py=2, turn=5). The replay tick will produce completely different positions. Always reinitialize with the same seed before replay. The seed is the contract: same seed + same commands = same result.

## Elite Insight

Nethack's \`save and replay\` system records every keystroke. The game is fully deterministic -- given the same seed and keystrokes, the same dungeon generates, the same monsters spawn, the same loot drops. Speedrunners exploit this by finding seeds that produce favorable layouts. Your pipeline follows the same architecture: seed + input log = reproducible run. Nethack has maintained this property since 1987.

## Mastery Check

Question: If the record phase produces signature 253 but the replay phase produces 255, what does that tell you?
Answer: The game has a determinism bug. Something in the tick pipeline produces different results on the second run despite identical inputs and seed. Common causes: uninitialized memory, iteration order depending on pointer addresses, floating-point accumulation, or accessing global state that wasn't reset. The signature difference (253 vs 255) tells you the divergence is small -- likely a single field is off by a small amount. Check px, py, hp, and turn individually to isolate which field diverged.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10;

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

int computeSig(const World& w) {
    return w.px * 31 + w.py * 17 + w.hp * 3 + w.turn;
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    cout << "TURN|" << w.turn << "|cmd=" << cmd
         << "|px=" << w.px << "|py=" << w.py << endl;
    w.turn++;
}

int getCommand(const ReplayLog& log, int turn, bool replaying, const int* live_cmds) {
    if (replaying) return log.entries[turn].command;
    return live_cmds[turn];
}

// TODO: Implement renderGrid(const World& w)
// Build a W x H char grid. Fill with '.'. Set borders to '#'.
// Place '@' at (w.px, w.py). Print each row as GRID_ROW|y|row_chars

int main() {
    World world;
    ReplayLog log = {};
    log.count = 0;

    int live_cmds[] = {4, 4, 2, 5, 4};
    int turns = 5;

    cout << "DUNGEON|rpg-replay-v1" << endl;

    // TODO: Phase 1 - Record
    // 1. initWorld with seed 42
    // 2. Print RECORD_PHASE|seed=42
    // 3. Loop turns: getCommand(replaying=false), logCommand, tick
    // 4. renderGrid
    // 5. Print RECORD_DONE|hp=X|sig=Y

    // TODO: Phase 2 - Replay
    // 1. initWorld with seed 42 (reinitialize!)
    // 2. Print REPLAY_PHASE|seed=42
    // 3. Loop turns: getCommand(replaying=true), tick (no logging)
    // 4. renderGrid
    // 5. Print REPLAY_DONE|hp=X|sig=Y

    // TODO: Print SIG_RECORD|X and SIG_REPLAY|Y
    // TODO: Compare and print DETERMINISM|PASS or DETERMINISM|FAIL
    // TODO: Print GAME_MESSAGE|Replay playback pipeline verified successfully.

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10;

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

int computeSig(const World& w) {
    return w.px * 31 + w.py * 17 + w.hp * 3 + w.turn;
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    cout << "TURN|" << w.turn << "|cmd=" << cmd
         << "|px=" << w.px << "|py=" << w.py << endl;
    w.turn++;
}

int getCommand(const ReplayLog& log, int turn, bool replaying, const int* live_cmds) {
    if (replaying) return log.entries[turn].command;
    return live_cmds[turn];
}

void renderGrid(const World& w) {
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
}

int main() {
    World world;
    ReplayLog log = {};
    log.count = 0;

    int live_cmds[] = {4, 4, 2, 5, 4};
    int turns = 5;

    cout << "DUNGEON|rpg-replay-v1" << endl;

    // Phase 1: Record
    initWorld(world, 42);
    cout << "RECORD_PHASE|seed=" << world.seed << endl;
    for (int t = 0; t < turns; t++) {
        int cmd = getCommand(log, t, false, live_cmds);
        logCommand(log, t, cmd);
        tick(world, cmd);
    }
    renderGrid(world);
    int rec_sig = computeSig(world);
    cout << "RECORD_DONE|hp=" << world.hp << "|sig=" << rec_sig << endl;

    // Phase 2: Replay
    initWorld(world, 42);
    cout << "REPLAY_PHASE|seed=" << world.seed << endl;
    for (int t = 0; t < turns; t++) {
        int cmd = getCommand(log, t, true, live_cmds);
        tick(world, cmd);
    }
    renderGrid(world);
    int rep_sig = computeSig(world);
    cout << "REPLAY_DONE|hp=" << world.hp << "|sig=" << rep_sig << endl;

    cout << "SIG_RECORD|" << rec_sig << endl;
    cout << "SIG_REPLAY|" << rep_sig << endl;
    if (rec_sig == rep_sig) cout << "DETERMINISM|PASS" << endl;
    else cout << "DETERMINISM|FAIL" << endl;
    cout << "GAME_MESSAGE|Replay playback pipeline verified successfully." << endl;

    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header printed", expectedOutput: "DUNGEON|rpg-replay-v1", isPattern: false },
      { id: "g2", description: "Record phase grid shows player", expectedOutput: "GRID_ROW|2|#...@", isPattern: true },
      { id: "g3", description: "Record phase complete", expectedOutput: "RECORD_DONE|hp=30|sig=253", isPattern: false },
      { id: "g4", description: "Replay phase starts", expectedOutput: "REPLAY_PHASE|seed=42", isPattern: false },
      { id: "g5", description: "Replay phase complete", expectedOutput: "REPLAY_DONE|hp=30|sig=253", isPattern: false },
      { id: "g6", description: "Signature comparison printed", expectedOutput: "SIG_RECORD|253", isPattern: false },
      { id: "g7", description: "Determinism verified", expectedOutput: "DETERMINISM|PASS", isPattern: false },
      { id: "g8", description: "Game message displayed", expectedOutput: "GAME_MESSAGE|Replay playback pipeline verified successfully.", isPattern: false },
    ],
    hints: [
      "Start with renderGrid: build a char[H][W] grid, fill with dots, set borders to # walls, place @ at (w.px, w.py), print each row as GRID_ROW|y|chars.",
      "In the record loop, call getCommand with replaying=false, then logCommand, then tick. After the loop, call renderGrid and print RECORD_DONE with hp and sig. Remember to reinitialize the world before the replay phase.",
      "In the replay loop, call getCommand with replaying=true, then tick (no logCommand). After the loop, renderGrid and print REPLAY_DONE. Then print SIG_RECORD, SIG_REPLAY, compare for DETERMINISM|PASS, and print the GAME_MESSAGE.",
    ],
    estimatedMinutes: 15,
  },
};