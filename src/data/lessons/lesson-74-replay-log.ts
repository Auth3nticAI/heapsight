import type { Lesson } from "@/types/lesson";

export const lesson74: Lesson = {
  id: "74-replay-log",
  title: "Replay Log",
  description: "Record player inputs to a log and replay them for deterministic playback.",
  order: 74,
  xpReward: 200,
  tier: "pro",
  concepts: ["input recording", "replay system", "event log", "playback"],
  part1: {
    title: "Concept: Replay Log",
    type: "concept",
    instructions: `# Replay Log — Non-Deterministic Games Cannot Be Debugged

You cannot debug what you cannot reproduce. A player reports a crash on frame 847. You ask for steps. They say "I was just playing." Useless. Without an input log, every session is lost the moment it ends. Record every input with its tick number. Replay the log with the same seed. The simulation reproduces exactly. Now you can debug frame 847.

## What Breaks Without This

Without input recording, bug reports are anecdotes. QA says "it crashed sometimes." Sometimes is not actionable. You cannot step through "sometimes" in a debugger. Replay logs turn every bug into a reproducible test case. Same seed plus same inputs equals same result. Every time.

## The Fix

Store each input as a struct: tick number and action. During gameplay, push every input onto an array. For replay, reset state, reseed the RNG with the original seed, and iterate the log. At each tick, check if the log has an entry for that tick. If yes, apply the action. If no, the simulation advances with no input.

\\\`\\\`\\\`
struct InputEvent {
    int tick;
    int action;  // MOVE_UP, MOVE_DOWN, FIRE, etc.
};
\\\`\\\`\\\`

The replay loop is simple:

\\\`\\\`\\\`
srand(42);
for (int t = 0; t < totalTicks; t++) {
    if (logIndex < logSize && replayLog[logIndex].tick == t) {
        applyAction(replayLog[logIndex].action);
        logIndex++;
    }
    updateSimulation();
}
\\\`\\\`\\\`

Same seed. Same inputs. Same result. Determinism is not optional for replay systems. It is the entire contract.

## Your Task

1. Define an InputEvent struct with tick and action fields
2. Define actions: MOVE_UP=0, MOVE_DOWN=1, MOVE_LEFT=2, MOVE_RIGHT=3, FIRE=4
3. Record 10 input events into a replayLog array:
   - tick 0: MOVE_UP, tick 1: MOVE_RIGHT, tick 2: FIRE
   - tick 3: MOVE_UP, tick 4: FIRE, tick 5: MOVE_LEFT
   - tick 6: MOVE_DOWN, tick 7: FIRE, tick 8: MOVE_UP, tick 9: MOVE_RIGHT
4. Player starts at (200, 300). Movement = 4 pixels per tick
5. Print each recorded event: \\\`RECORD|tick|<t>|action|<name>|player|(<x>,<y>)\\\`
   - Action names: MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE
6. For FIRE actions, also print: \\\`RECORD|tick|<t>|action|FIRE|bullet_spawned|bullet_<n>\\\`
7. After recording all 10, print: \\\`RECORD_COMPLETE|events|10|bullets_spawned|3\\\`
8. Print: \\\`REPLAY_LOG|entries|10|first_tick|0|last_tick|9\\\`

Expected output:
\\\`\\\`\\\`
RECORD|tick|0|action|MOVE_UP|player|(200,296)
RECORD|tick|1|action|MOVE_RIGHT|player|(204,296)
RECORD|tick|2|action|FIRE|player|(204,296)
RECORD|tick|2|action|FIRE|bullet_spawned|bullet_0
RECORD|tick|3|action|MOVE_UP|player|(204,292)
RECORD|tick|4|action|FIRE|player|(204,292)
RECORD|tick|4|action|FIRE|bullet_spawned|bullet_1
RECORD|tick|5|action|MOVE_LEFT|player|(200,292)
RECORD|tick|6|action|MOVE_DOWN|player|(200,296)
RECORD|tick|7|action|FIRE|player|(200,296)
RECORD|tick|7|action|FIRE|bullet_spawned|bullet_2
RECORD|tick|8|action|MOVE_UP|player|(200,292)
RECORD|tick|9|action|MOVE_RIGHT|player|(204,292)
RECORD_COMPLETE|events|10|bullets_spawned|3
REPLAY_LOG|entries|10|first_tick|0|last_tick|9
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 64;

// Action constants
const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

// TODO: Write getActionName(action) — return string name for action constant

// TODO: Write applyAction(action, px, py) — modify player position by 4 pixels
//       MOVE_UP: py -= 4, MOVE_DOWN: py += 4
//       MOVE_LEFT: px -= 4, MOVE_RIGHT: px += 4

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;
    int bulletCount = 0;

    int playerX = 200, playerY = 300;

    // Input sequence: UP, RIGHT, FIRE, UP, FIRE, LEFT, DOWN, FIRE, UP, RIGHT
    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE, MOVE_LEFT, MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT};
    int numActions = 10;

    // TODO: Record each action into replayLog with tick = index
    //   Apply action to player position (FIRE does not move player)
    //   Print RECORD line with player position
    //   For FIRE, also print bullet_spawned line and increment bulletCount

    // TODO: Print RECORD_COMPLETE and REPLAY_LOG lines

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 64;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

string getActionName(int action) {
    if (action == MOVE_UP) return "MOVE_UP";
    if (action == MOVE_DOWN) return "MOVE_DOWN";
    if (action == MOVE_LEFT) return "MOVE_LEFT";
    if (action == MOVE_RIGHT) return "MOVE_RIGHT";
    if (action == FIRE) return "FIRE";
    return "NONE";
}

void applyAction(int action, int &px, int &py) {
    if (action == MOVE_UP) py -= 4;
    else if (action == MOVE_DOWN) py += 4;
    else if (action == MOVE_LEFT) px -= 4;
    else if (action == MOVE_RIGHT) px += 4;
}

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;
    int bulletCount = 0;

    int playerX = 200, playerY = 300;

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE, MOVE_LEFT, MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT};
    int numActions = 10;

    for (int i = 0; i < numActions; i++) {
        replayLog[logSize].tick = i;
        replayLog[logSize].action = actions[i];
        logSize++;

        if (actions[i] != FIRE) {
            applyAction(actions[i], playerX, playerY);
        }

        cout << "RECORD|tick|" << i << "|action|" << getActionName(actions[i])
             << "|player|(" << playerX << "," << playerY << ")" << endl;

        if (actions[i] == FIRE) {
            cout << "RECORD|tick|" << i << "|action|FIRE|bullet_spawned|bullet_"
                 << bulletCount << endl;
            bulletCount++;
        }
    }

    cout << "RECORD_COMPLETE|events|" << logSize << "|bullets_spawned|" << bulletCount << endl;
    cout << "REPLAY_LOG|entries|" << logSize << "|first_tick|"
         << replayLog[0].tick << "|last_tick|" << replayLog[logSize - 1].tick << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First input recorded", expectedOutput: "RECORD\\|tick\\|0\\|action\\|MOVE_UP\\|player\\|\\(200,296\\)", isPattern: true },
      { id: "t2", description: "Right movement recorded", expectedOutput: "RECORD\\|tick\\|1\\|action\\|MOVE_RIGHT\\|player\\|\\(204,296\\)", isPattern: true },
      { id: "t3", description: "Fire action with bullet spawn", expectedOutput: "RECORD\\|tick\\|2\\|action\\|FIRE\\|bullet_spawned\\|bullet_0", isPattern: true },
      { id: "t4", description: "Second fire spawns bullet_1", expectedOutput: "RECORD\\|tick\\|4\\|action\\|FIRE\\|bullet_spawned\\|bullet_1", isPattern: true },
      { id: "t5", description: "Record complete with counts", expectedOutput: "RECORD_COMPLETE\\|events\\|10\\|bullets_spawned\\|3", isPattern: true },
      { id: "t6", description: "Replay log summary", expectedOutput: "REPLAY_LOG\\|entries\\|10\\|first_tick\\|0\\|last_tick\\|9", isPattern: true },
    ],
    hints: [
      "FIRE does not change player position. Apply movement only for MOVE_UP/DOWN/LEFT/RIGHT. Print the player position after applying (or not applying) the action.",
      "Track bulletCount separately. Each FIRE increments it. The bullet name is bullet_0, bullet_1, bullet_2 based on the count before incrementing.",
      "Store tick = loop index i. The replayLog is filled sequentially: replayLog[logSize].tick = i, replayLog[logSize].action = actions[i], then logSize++.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Replay Log System",
    type: "game_builder",
    instructions: `# Game Builder: Replay Log System — Record, Replay, Verify

Input recording is the foundation of replay systems, spectator modes, and automated testing. Record every player action with its tick number. Replay by resetting state, reseeding the RNG, and applying the log. If the final state matches, determinism is proven. If it diverges, you have a bug to fix.

## What Breaks Without This

Without replay, every gameplay session is ephemeral. QA cannot reproduce bugs. Replays cannot be shared. Automated testing cannot verify game logic. The input log transforms gameplay from a live event into reproducible data. That data is testable, shareable, and debuggable.

## The Fix

Two phases. Record phase: play the game, store every input with its tick. Playback phase: reset everything, reseed with the same seed, iterate the log. Compare final state between the two runs. Position, score, entity counts — all must match.

\\\`\\\`\\\`
// Record: push {tick, action} onto log
// Playback: srand(42), iterate log, apply at matching ticks
// Verify: compare final positions and scores
\\\`\\\`\\\`

## Your Task

1. Define InputEvent struct: tick (int), action (int: MOVE_UP=0, MOVE_DOWN=1, MOVE_LEFT=2, MOVE_RIGHT=3, FIRE=4)
2. Player at (200, 300), speed 4, 3 enemies at y=60 with vy=4, seed=42
3. Record phase: process 10 inputs in order:
   - tick 0: MOVE_UP, tick 1: MOVE_RIGHT, tick 2: FIRE
   - tick 3: MOVE_UP, tick 4: FIRE, tick 5: MOVE_LEFT
   - tick 6: MOVE_DOWN, tick 7: FIRE, tick 8: MOVE_UP, tick 9: MOVE_RIGHT
4. Each tick: apply input, move enemies (y += 4), move bullets (y -= 16), check collisions
5. Print during record:
   - \\\`RECORD|tick|1|action|MOVE_UP|player|(200,296)\\\`
   - \\\`RECORD|tick|3|action|FIRE|bullet_spawned|bullet_0\\\`
6. Playback phase: reset player to (200,300), enemies to y=60, srand(42), re-apply log
7. Print during playback:
   - \\\`PLAYBACK|tick|1|action|MOVE_UP|player|(200,296)|match|true\\\`
8. Compare final state and print:
   - \\\`REPLAY_VERIFY|frames|10|inputs|10|state_match|true|score_match|true\\\`

## Beginner Trap

**Common Mistake:** Forgetting to reset ALL state before playback. Player position, enemy positions, bullet list, score, kill count — everything must revert to initial values. If you reset the player but not the enemies, the replay diverges immediately.

## Elite Insight

Professional replay systems record not just inputs but also the RNG seed and frame timing. Deterministic lockstep networking uses this exact pattern: every client records inputs, broadcasts them, and replays in sync. If any client diverges, a desync is detected. Your replay log is the foundation of multiplayer netcode.

## Cross-Path Echo

Version control works identically. Git stores diffs (inputs), not snapshots. To reconstruct any state, start from the initial commit (seed) and apply diffs in order. \\\`git bisect\\\` replays history to find the commit that introduced a bug. Your replay log is git for gameplay.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

int ex[MAX_ENTITIES], ey[MAX_ENTITIES], evy[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int playerX, playerY;
int score, bulletCount, killCount;

// TODO: Write getActionName(action) — return string for action constant

// TODO: Write applyAction(action) — modify playerX/playerY by 4
//       FIRE spawns bullet: ex=playerX, ey=playerY, evy=-16, etype=1

// TODO: Write updateEntities() — move alive entities by evy, check collision
//       Bullet (etype==1) vs Enemy (etype==2): |dx|<18 && |dy|<18

// TODO: Write resetState() — reset player, enemies, score for playback

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE, MOVE_LEFT,
                     MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT};

    // TODO: Initialize state — player at (200,300), 3 enemies, srand(42)
    // TODO: Record phase — process 10 inputs, store in replayLog, print RECORD lines
    // TODO: Save final state (position, score)
    // TODO: Reset state for playback — srand(42), player back to (200,300), enemies back
    // TODO: Playback phase — re-apply replayLog, print PLAYBACK lines with match check
    // TODO: Print REPLAY_VERIFY line

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

int ex[MAX_ENTITIES], ey[MAX_ENTITIES], evy[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int playerX, playerY;
int score, bulletCount, killCount;

string getActionName(int action) {
    if (action == MOVE_UP) return "MOVE_UP";
    if (action == MOVE_DOWN) return "MOVE_DOWN";
    if (action == MOVE_LEFT) return "MOVE_LEFT";
    if (action == MOVE_RIGHT) return "MOVE_RIGHT";
    if (action == FIRE) return "FIRE";
    return "NONE";
}

void spawnEnemy(int px, int py, int pvy) {
    ex[entityCount] = px;
    ey[entityCount] = py;
    evy[entityCount] = pvy;
    etype[entityCount] = 2;
    ealive[entityCount] = true;
    entityCount++;
}

void spawnBullet() {
    ex[entityCount] = playerX;
    ey[entityCount] = playerY;
    evy[entityCount] = -16;
    etype[entityCount] = 1;
    ealive[entityCount] = true;
    entityCount++;
}

void applyAction(int action) {
    if (action == MOVE_UP) playerY -= 4;
    else if (action == MOVE_DOWN) playerY += 4;
    else if (action == MOVE_LEFT) playerX -= 4;
    else if (action == MOVE_RIGHT) playerX += 4;
    else if (action == FIRE) {
        spawnBullet();
        bulletCount++;
    }
}

void updateEntities() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        ey[i] += evy[i];
    }
    // Collision: bullet vs enemy
    for (int b = 0; b < entityCount; b++) {
        if (!ealive[b] || etype[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!ealive[e] || etype[e] != 2) continue;
            int dx = ex[b] - ex[e];
            int dy = ey[b] - ey[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                ealive[b] = false;
                ealive[e] = false;
                score += 100;
                killCount++;
                break;
            }
        }
    }
}

void initState() {
    entityCount = 0;
    playerX = 200;
    playerY = 300;
    score = 0;
    bulletCount = 0;
    killCount = 0;
    srand(42);

    spawnEnemy(120, 60, 4);
    spawnEnemy(200, 60, 4);
    spawnEnemy(280, 60, 4);
}

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE, MOVE_LEFT,
                     MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT};
    int numActions = 10;

    // === RECORD PHASE ===
    initState();

    for (int i = 0; i < numActions; i++) {
        replayLog[logSize].tick = i;
        replayLog[logSize].action = actions[i];
        logSize++;

        applyAction(actions[i]);
        updateEntities();

        cout << "RECORD|tick|" << i << "|action|" << getActionName(actions[i])
             << "|player|(" << playerX << "," << playerY << ")" << endl;

        if (actions[i] == FIRE) {
            cout << "RECORD|tick|" << i << "|action|FIRE|bullet_spawned|bullet_"
                 << (bulletCount - 1) << endl;
        }
    }

    // Save final state
    int recX = playerX, recY = playerY;
    int recScore = score;
    int recEnemies = 0;
    for (int i = 0; i < entityCount; i++) {
        if (ealive[i] && etype[i] == 2) recEnemies++;
    }

    // === PLAYBACK PHASE ===
    initState();
    int logIndex = 0;

    for (int t = 0; t < numActions; t++) {
        if (logIndex < logSize && replayLog[logIndex].tick == t) {
            applyAction(replayLog[logIndex].action);
            logIndex++;
        }
        updateEntities();

        bool posMatch = (t == numActions - 1) ? (playerX == recX && playerY == recY) : true;
        cout << "PLAYBACK|tick|" << t << "|action|" << getActionName(replayLog[t].action)
             << "|player|(" << playerX << "," << playerY << ")|match|"
             << (posMatch ? "true" : "false") << endl;
    }

    bool stateMatch = (playerX == recX && playerY == recY);
    bool scoreMatch = (score == recScore);

    cout << "REPLAY_VERIFY|frames|" << numActions << "|inputs|" << logSize
         << "|state_match|" << (stateMatch ? "true" : "false")
         << "|score_match|" << (scoreMatch ? "true" : "false") << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Record first input", expectedOutput: "RECORD\\|tick\\|0\\|action\\|MOVE_UP\\|player\\|\\(200,296\\)", isPattern: true },
      { id: "t2", description: "Record fire with bullet spawn", expectedOutput: "RECORD\\|tick\\|2\\|action\\|FIRE\\|bullet_spawned\\|bullet_0", isPattern: true },
      { id: "t3", description: "Playback tick matches record", expectedOutput: "PLAYBACK\\|tick\\|1\\|action\\|MOVE_RIGHT\\|player\\|\\(204,296\\)\\|match\\|true", isPattern: true },
      { id: "t4", description: "Playback shows match status", expectedOutput: "PLAYBACK\\|tick\\|\\d+\\|action\\|\\w+\\|player\\|\\(\\d+,\\d+\\)\\|match\\|true", isPattern: true },
      { id: "t5", description: "Replay verification passes", expectedOutput: "REPLAY_VERIFY\\|frames\\|10\\|inputs\\|10\\|state_match\\|true\\|score_match\\|true", isPattern: true },
    ],
    hints: [
      "FIRE does not change player position — it spawns a bullet at the current player position. Apply movement only for MOVE_UP/DOWN/LEFT/RIGHT, then call updateEntities() to move bullets and enemies.",
      "initState() must reset EVERYTHING: entityCount, playerX, playerY, score, bulletCount, killCount. Then re-spawn the 3 enemies at their original positions. srand(42) reseeds the RNG.",
      "During playback, use the same loop structure. Apply replayLog entries at matching ticks. Compare final playerX/playerY and score against the recorded values to verify determinism.",
    ],
    estimatedMinutes: 10,
  },
};
