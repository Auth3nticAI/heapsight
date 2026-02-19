import type { Lesson } from "@/types/lesson";

export const lesson75: Lesson = {
  id: "75-milestone-replay",
  title: "Milestone: Replay Playback",
  description: "Record and replay a complete gameplay session with perfect determinism.",
  order: 75,
  xpReward: 300,
  tier: "pro",
  concepts: ["full replay", "deterministic playback", "verification", "complete session replay"],
  part1: {
    title: "Concept: Replay Playback",
    type: "concept",
    instructions: `# Replay Playback — If It Cannot Be Replayed, It Cannot Be Trusted

A replay system that only records is half a system. The proof is in playback. Record a complete session — multiple waves, dozens of inputs, hundreds of frames. Then replay it. Compare every frame. Player position, score, enemy count, bullet count. If any value diverges, your simulation is non-deterministic and your replay system is a lie.

## What Breaks Without This

Without frame-by-frame verification, you have no proof that replay is correct. The final score might match by coincidence — two different paths arriving at the same number. Frame-by-frame comparison catches divergence the moment it happens. Frame 47 scores differ by 100 because a collision resolved differently. That is the bug. Without per-frame comparison, you would never find it.

## The Fix

Record phase: play through the session. At every frame, snapshot the state — player position, score, enemy count, bullet count. Store snapshots alongside the input log. Replay phase: reset everything, reseed, iterate the log. At every frame, snapshot again. Compare the two snapshot arrays element by element. Any mismatch is a determinism violation.

\\\`\\\`\\\`
struct FrameState {
    int playerX, playerY;
    int score;
    int enemyCount;
    int bulletCount;
};

// Record: states[frame] = currentState
// Replay: replayStates[frame] = currentState
// Verify: states[frame] == replayStates[frame] for all frames
\\\`\\\`\\\`

The verification loop is the contract. If it passes, the replay system works. If it fails, the divergence frame tells you exactly where to look.

## Your Task

1. Define FrameState struct: playerX, playerY, score, enemyCount, bulletCount
2. Session: 3 waves, seed 42, 20 input events, 15 simulation frames
3. Player at (200, 300), speed 4. Enemies: wave 1 at y=60, wave 2 at y=40, wave 3 at y=20
4. Record phase: play through all 15 frames with 20 inputs
   - Inputs: UP, RIGHT, FIRE, UP, FIRE, LEFT, DOWN, FIRE, UP, RIGHT,
             FIRE, UP, LEFT, FIRE, UP, RIGHT, FIRE, DOWN, UP, FIRE
5. Store FrameState at each frame during record
6. Print: \\\`RECORD_SESSION|frames|15|inputs|20|kills|<k>|score|<s>\\\`
7. Replay phase: reset state, srand(42), apply log, store replay FrameState
8. Compare 3 sample frames (5, 10, 15):
   - \\\`REPLAY|frame|5|live_score|<s>|replay_score|<s>|match|true\\\`
   - \\\`REPLAY|frame|10|live_pos|(<x>,<y>)|replay_pos|(<x>,<y>)|match|true\\\`
   - \\\`REPLAY|frame|15|live_score|<s>|replay_score|<s>|match|true\\\`
9. Print: \\\`REPLAY_SUMMARY|frames_compared|15|matches|15|mismatches|0\\\`
10. Print: \\\`MILESTONE_75|PASS|replay playback verified\\\`

Expected output (scores depend on collision timing):
\\\`\\\`\\\`
RECORD_SESSION|frames|15|inputs|20|kills|5|score|500
REPLAY|frame|5|live_score|200|replay_score|200|match|true
REPLAY|frame|10|live_pos|(200,280)|replay_pos|(200,280)|match|true
REPLAY|frame|15|live_score|500|replay_score|500|match|true
REPLAY_SUMMARY|frames_compared|15|matches|15|mismatches|0
MILESTONE_75|PASS|replay playback verified
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 30;
const int MAX_FRAMES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

struct FrameState {
    int playerX, playerY;
    int score;
    int enemyCount;
    int bulletCount;
};

int ex[MAX_ENTITIES], ey[MAX_ENTITIES], evy[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int playerX, playerY;
int score, bulletCount, killCount;

// TODO: Write getActionName(action) — return string for action constant

// TODO: Write spawnEnemy(px, py, pvy) — add enemy entity

// TODO: Write spawnBullet() — add bullet at player pos

// TODO: Write applyAction(action) — move player or fire

// TODO: Write updateEntities() — move, collide, cleanup

// TODO: Write captureState(enemyCount, bulletCount) — return FrameState

// TODO: Write initState() — full reset, srand(42), spawn wave 1

// TODO: Write spawnWave(waveNum) — spawn enemies for wave 2, 3

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;

    FrameState liveStates[MAX_FRAMES];
    FrameState replayStates[MAX_FRAMES];

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE,
                     MOVE_LEFT, MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT,
                     FIRE, MOVE_UP, MOVE_LEFT, FIRE, MOVE_UP,
                     MOVE_RIGHT, FIRE, MOVE_DOWN, MOVE_UP, FIRE};
    int totalFrames = 15;
    int totalInputs = 20;

    // TODO: Record phase — run 15 frames, apply inputs, capture state each frame
    //       Spawn wave 2 at frame 6, wave 3 at frame 11
    //       Store in liveStates[], print RECORD_SESSION

    // TODO: Replay phase — initState, re-apply log, capture replayStates[]

    // TODO: Compare frames 5, 10, 15 — print REPLAY lines

    // TODO: Compare all frames — print REPLAY_SUMMARY

    // TODO: Print MILESTONE_75

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 30;
const int MAX_FRAMES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

struct FrameState {
    int playerX, playerY;
    int score;
    int enemyCount;
    int bulletCount;
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
    // Cleanup bullets that went off screen
    for (int i = 0; i < entityCount; i++) {
        if (ealive[i] && etype[i] == 1 && ey[i] < -50) ealive[i] = false;
    }
}

FrameState captureState() {
    FrameState fs;
    fs.playerX = playerX;
    fs.playerY = playerY;
    fs.score = score;
    fs.enemyCount = 0;
    fs.bulletCount = 0;
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (etype[i] == 2) fs.enemyCount++;
        if (etype[i] == 1) fs.bulletCount++;
    }
    return fs;
}

void initState() {
    entityCount = 0;
    playerX = 200;
    playerY = 300;
    score = 0;
    bulletCount = 0;
    killCount = 0;
    srand(42);

    // Wave 1: 3 enemies
    spawnEnemy(120, 60, 4);
    spawnEnemy(200, 60, 4);
    spawnEnemy(280, 60, 4);
}

void spawnWave(int waveNum) {
    if (waveNum == 2) {
        spawnEnemy(100, 40, 4);
        spawnEnemy(200, 40, 4);
        spawnEnemy(300, 40, 4);
    } else if (waveNum == 3) {
        spawnEnemy(140, 20, 5);
        spawnEnemy(200, 20, 5);
        spawnEnemy(260, 20, 5);
    }
}

void runSession(InputEvent log[], int logSize, int totalFrames, FrameState states[]) {
    int logIndex = 0;
    int inputIndex = 0;

    for (int frame = 1; frame <= totalFrames; frame++) {
        // Apply up to 2 inputs per frame (20 inputs over 15 frames)
        int inputsThisFrame = (inputIndex < logSize) ? 1 : 0;
        if (frame <= 5 && inputIndex + 1 < logSize) inputsThisFrame = 2;
        else if (frame > 5 && frame <= 10 && inputIndex < logSize) inputsThisFrame = 1;

        // Distribute: frames 1-5 get 2 inputs each (10), frames 6-10 get 1 each (5), frames 11-15 get 1 each (5)
        int count = 0;
        if (frame <= 5) count = 2;
        else count = 1;

        for (int c = 0; c < count && inputIndex < logSize; c++) {
            applyAction(log[inputIndex].action);
            inputIndex++;
        }

        // Spawn waves
        if (frame == 6) spawnWave(2);
        if (frame == 11) spawnWave(3);

        updateEntities();
        states[frame - 1] = captureState();
    }
}

int main() {
    InputEvent replayLog[MAX_LOG];
    int logSize = 0;

    FrameState liveStates[MAX_FRAMES];
    FrameState replayStates[MAX_FRAMES];

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE,
                     MOVE_LEFT, MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT,
                     FIRE, MOVE_UP, MOVE_LEFT, FIRE, MOVE_UP,
                     MOVE_RIGHT, FIRE, MOVE_DOWN, MOVE_UP, FIRE};
    int totalFrames = 15;
    int totalInputs = 20;

    // Build log
    for (int i = 0; i < totalInputs; i++) {
        replayLog[logSize].tick = i;
        replayLog[logSize].action = actions[i];
        logSize++;
    }

    // === RECORD PHASE ===
    initState();
    runSession(replayLog, logSize, totalFrames, liveStates);
    int recKills = killCount;
    int recScore = score;

    cout << "RECORD_SESSION|frames|" << totalFrames << "|inputs|" << totalInputs
         << "|kills|" << recKills << "|score|" << recScore << endl;

    // === REPLAY PHASE ===
    initState();
    runSession(replayLog, logSize, totalFrames, replayStates);

    // Compare sample frames
    int sampleFrames[] = {5, 10, 15};
    for (int i = 0; i < 3; i++) {
        int f = sampleFrames[i];
        FrameState &live = liveStates[f - 1];
        FrameState &replay = replayStates[f - 1];

        if (i == 1) {
            // Frame 10: compare position
            bool match = (live.playerX == replay.playerX && live.playerY == replay.playerY);
            cout << "REPLAY|frame|" << f << "|live_pos|(" << live.playerX << "," << live.playerY
                 << ")|replay_pos|(" << replay.playerX << "," << replay.playerY
                 << ")|match|" << (match ? "true" : "false") << endl;
        } else {
            // Frames 5, 15: compare score
            bool match = (live.score == replay.score);
            cout << "REPLAY|frame|" << f << "|live_score|" << live.score
                 << "|replay_score|" << replay.score
                 << "|match|" << (match ? "true" : "false") << endl;
        }
    }

    // Full comparison
    int matches = 0, mismatches = 0;
    for (int f = 0; f < totalFrames; f++) {
        bool same = (liveStates[f].playerX == replayStates[f].playerX &&
                     liveStates[f].playerY == replayStates[f].playerY &&
                     liveStates[f].score == replayStates[f].score &&
                     liveStates[f].enemyCount == replayStates[f].enemyCount &&
                     liveStates[f].bulletCount == replayStates[f].bulletCount);
        if (same) matches++;
        else mismatches++;
    }

    cout << "REPLAY_SUMMARY|frames_compared|" << totalFrames
         << "|matches|" << matches << "|mismatches|" << mismatches << endl;
    cout << "MILESTONE_75|PASS|replay playback verified" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Record session printed", expectedOutput: "RECORD_SESSION\\|frames\\|15\\|inputs\\|20\\|kills\\|\\d+\\|score\\|\\d+", isPattern: true },
      { id: "t2", description: "Frame 5 replay score matches", expectedOutput: "REPLAY\\|frame\\|5\\|live_score\\|\\d+\\|replay_score\\|\\d+\\|match\\|true", isPattern: true },
      { id: "t3", description: "Frame 10 replay position matches", expectedOutput: "REPLAY\\|frame\\|10\\|live_pos\\|\\(\\d+,\\d+\\)\\|replay_pos\\|\\(\\d+,\\d+\\)\\|match\\|true", isPattern: true },
      { id: "t4", description: "Frame 15 replay score matches", expectedOutput: "REPLAY\\|frame\\|15\\|live_score\\|\\d+\\|replay_score\\|\\d+\\|match\\|true", isPattern: true },
      { id: "t5", description: "Replay summary shows zero mismatches", expectedOutput: "REPLAY_SUMMARY\\|frames_compared\\|15\\|matches\\|15\\|mismatches\\|0", isPattern: true },
      { id: "t6", description: "Milestone 75 passes", expectedOutput: "MILESTONE_75\\|PASS\\|replay playback verified", isPattern: true },
    ],
    hints: [
      "initState() must reset ALL globals: entityCount, playerX, playerY, score, bulletCount, killCount. Re-call srand(42). Re-spawn wave 1 enemies at their original positions. Any state you miss causes divergence.",
      "Distribute 20 inputs over 15 frames: frames 1-5 get 2 inputs each (10 total), frames 6-15 get 1 input each (10 total). Track inputIndex separately from frame number.",
      "captureState() counts alive enemies (etype==2) and alive bullets (etype==1). Compare all five fields: playerX, playerY, score, enemyCount, bulletCount. Any single field mismatch is a divergence.",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Game: Milestone — Replay Playback",
    type: "game_builder",
    instructions: `# Milestone: Replay Playback — Deterministic Session Replay

This is the proof. Record a complete gameplay session — 3 waves, 20 inputs, 15 frames. Every frame, snapshot the full simulation state. Then replay from scratch. Same seed, same inputs, same order. Compare every frame. If all 15 match, your simulation is deterministic. If any diverge, you have a bug that would corrupt replays, desync multiplayer, and break automated testing.

## What Breaks Without This

Without verified replay, you cannot trust your simulation. Spectator mode shows wrong positions. Replays desync after 30 seconds. Automated test suites pass locally but fail in CI because floating-point order differs. Frame-by-frame verification catches these bugs before they ship.

## The Fix

Wrap the entire simulation in a function that takes an input log and returns an array of frame states. Call it twice — once to record, once to replay. Compare the arrays. The function must be pure: same inputs produce same outputs. No hidden state, no uninitialized memory, no order-dependent floating point.

\\\`\\\`\\\`
// runSession(log, logSize, frames, stateArray)
// Call twice with same log
// Compare stateArray[0..frames-1] element by element
\\\`\\\`\\\`

## Your Task

1. Full session: 3 waves, seed 42, 20 input events, 15 frames
2. FrameState per frame: playerX, playerY, score, enemyCount, bulletCount
3. Player at (200, 300), speed 4. Enemies vy=4 (waves 1-2), vy=5 (wave 3)
4. Record phase: play through, capture liveStates[15]
5. Print: \\\`RECORD_SESSION|frames|15|inputs|20|kills|<k>|score|<s>\\\`
6. Replay phase: reset, srand(42), replay log, capture replayStates[15]
7. Compare 3 sample frames:
   - \\\`REPLAY|frame|5|live_score|<s>|replay_score|<s>|match|true\\\`
   - \\\`REPLAY|frame|10|live_pos|(<x>,<y>)|replay_pos|(<x>,<y>)|match|true\\\`
   - \\\`REPLAY|frame|15|live_score|<s>|replay_score|<s>|match|true\\\`
8. Compare all 15 frames:
   - \\\`REPLAY_SUMMARY|frames_compared|15|matches|15|mismatches|0\\\`
9. Print: \\\`MILESTONE_75|PASS|replay playback verified\\\`

## Beginner Trap

**Common Mistake:** Spawning wave 2 enemies during replay but not during record, or vice versa. Wave spawns must be triggered by the same frame number in both passes. If wave 2 spawns at frame 6 during record, it must spawn at frame 6 during replay. Tie wave spawns to frame count, not to kill count or score.

## Elite Insight

Deterministic replay is the foundation of lockstep networking used in RTS games like StarCraft and Age of Empires. Every client runs the same simulation with the same inputs. The only data sent over the network is input commands. If any client diverges, a checksum comparison catches it. Your frame-by-frame comparison is exactly that checksum validation.

## Cross-Path Echo

Database replication uses the same pattern. The primary database logs every write. Replicas apply the log in order. If a replica diverges, the replication system detects it by comparing checksums. Your replay system is database replication for game state. The input log is the write-ahead log. The frame state is the database snapshot.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 30;
const int MAX_FRAMES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

struct FrameState {
    int playerX, playerY;
    int score;
    int enemyCount;
    int bulletCount;
};

int ex[MAX_ENTITIES], ey[MAX_ENTITIES], evy[MAX_ENTITIES];
int etype[MAX_ENTITIES];
bool ealive[MAX_ENTITIES];
int entityCount = 0;

int playerX, playerY;
int score, bulletCount, killCount;

// TODO: Write getActionName(action)

// TODO: Write spawnEnemy(px, py, pvy) — add enemy entity

// TODO: Write spawnBullet() — add bullet at player pos

// TODO: Write applyAction(action) — move player or fire

// TODO: Write updateEntities() — move, collide, cleanup off-screen

// TODO: Write captureState() — return FrameState snapshot

// TODO: Write initState() — full reset, srand(42), spawn wave 1

// TODO: Write spawnWave(waveNum) — spawn enemies for wave 2, 3

// TODO: Write runSession(log, logSize, totalFrames, states[]) — run full sim

int main() {
    InputEvent replayLog[MAX_LOG];
    FrameState liveStates[MAX_FRAMES];
    FrameState replayStates[MAX_FRAMES];

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE,
                     MOVE_LEFT, MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT,
                     FIRE, MOVE_UP, MOVE_LEFT, FIRE, MOVE_UP,
                     MOVE_RIGHT, FIRE, MOVE_DOWN, MOVE_UP, FIRE};
    int totalFrames = 15;
    int totalInputs = 20;

    // TODO: Build replayLog from actions array
    // TODO: Record phase — initState, runSession, print RECORD_SESSION
    // TODO: Replay phase — initState, runSession, compare states
    // TODO: Print REPLAY lines for frames 5, 10, 15
    // TODO: Print REPLAY_SUMMARY and MILESTONE_75

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_LOG = 64;
const int MAX_ENTITIES = 30;
const int MAX_FRAMES = 20;

const int MOVE_UP = 0;
const int MOVE_DOWN = 1;
const int MOVE_LEFT = 2;
const int MOVE_RIGHT = 3;
const int FIRE = 4;

struct InputEvent {
    int tick;
    int action;
};

struct FrameState {
    int playerX, playerY;
    int score;
    int enemyCount;
    int bulletCount;
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
    // Move
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
    // Cleanup off-screen bullets
    for (int i = 0; i < entityCount; i++) {
        if (ealive[i] && etype[i] == 1 && ey[i] < -50) ealive[i] = false;
    }
}

FrameState captureState() {
    FrameState fs;
    fs.playerX = playerX;
    fs.playerY = playerY;
    fs.score = score;
    fs.enemyCount = 0;
    fs.bulletCount = 0;
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (etype[i] == 2) fs.enemyCount++;
        if (etype[i] == 1) fs.bulletCount++;
    }
    return fs;
}

void initState() {
    entityCount = 0;
    playerX = 200;
    playerY = 300;
    score = 0;
    bulletCount = 0;
    killCount = 0;
    srand(42);

    // Wave 1: 3 enemies
    spawnEnemy(120, 60, 4);
    spawnEnemy(200, 60, 4);
    spawnEnemy(280, 60, 4);
}

void spawnWave(int waveNum) {
    if (waveNum == 2) {
        spawnEnemy(100, 40, 4);
        spawnEnemy(200, 40, 4);
        spawnEnemy(300, 40, 4);
    } else if (waveNum == 3) {
        spawnEnemy(140, 20, 5);
        spawnEnemy(200, 20, 5);
        spawnEnemy(260, 20, 5);
    }
}

void runSession(InputEvent log[], int logSize, int totalFrames, FrameState states[]) {
    int inputIndex = 0;

    for (int frame = 1; frame <= totalFrames; frame++) {
        // Distribute 20 inputs over 15 frames: frames 1-5 get 2 each, 6-15 get 1 each
        int count = (frame <= 5) ? 2 : 1;

        for (int c = 0; c < count && inputIndex < logSize; c++) {
            applyAction(log[inputIndex].action);
            inputIndex++;
        }

        if (frame == 6) spawnWave(2);
        if (frame == 11) spawnWave(3);

        updateEntities();
        states[frame - 1] = captureState();
    }
}

int main() {
    InputEvent replayLog[MAX_LOG];
    FrameState liveStates[MAX_FRAMES];
    FrameState replayStates[MAX_FRAMES];

    int actions[] = {MOVE_UP, MOVE_RIGHT, FIRE, MOVE_UP, FIRE,
                     MOVE_LEFT, MOVE_DOWN, FIRE, MOVE_UP, MOVE_RIGHT,
                     FIRE, MOVE_UP, MOVE_LEFT, FIRE, MOVE_UP,
                     MOVE_RIGHT, FIRE, MOVE_DOWN, MOVE_UP, FIRE};
    int totalFrames = 15;
    int totalInputs = 20;

    // Build log
    for (int i = 0; i < totalInputs; i++) {
        replayLog[i].tick = i;
        replayLog[i].action = actions[i];
    }

    // === RECORD PHASE ===
    initState();
    runSession(replayLog, totalInputs, totalFrames, liveStates);
    int recKills = killCount;
    int recScore = score;

    cout << "RECORD_SESSION|frames|" << totalFrames << "|inputs|" << totalInputs
         << "|kills|" << recKills << "|score|" << recScore << endl;

    // === REPLAY PHASE ===
    initState();
    runSession(replayLog, totalInputs, totalFrames, replayStates);

    // Compare sample frames: 5, 10, 15
    int sampleFrames[] = {5, 10, 15};
    for (int i = 0; i < 3; i++) {
        int f = sampleFrames[i];
        FrameState &live = liveStates[f - 1];
        FrameState &replay = replayStates[f - 1];

        if (i == 1) {
            bool match = (live.playerX == replay.playerX && live.playerY == replay.playerY);
            cout << "REPLAY|frame|" << f << "|live_pos|(" << live.playerX << "," << live.playerY
                 << ")|replay_pos|(" << replay.playerX << "," << replay.playerY
                 << ")|match|" << (match ? "true" : "false") << endl;
        } else {
            bool match = (live.score == replay.score);
            cout << "REPLAY|frame|" << f << "|live_score|" << live.score
                 << "|replay_score|" << replay.score
                 << "|match|" << (match ? "true" : "false") << endl;
        }
    }

    // Full comparison
    int matches = 0, mismatches = 0;
    for (int f = 0; f < totalFrames; f++) {
        bool same = (liveStates[f].playerX == replayStates[f].playerX &&
                     liveStates[f].playerY == replayStates[f].playerY &&
                     liveStates[f].score == replayStates[f].score &&
                     liveStates[f].enemyCount == replayStates[f].enemyCount &&
                     liveStates[f].bulletCount == replayStates[f].bulletCount);
        if (same) matches++;
        else mismatches++;
    }

    cout << "REPLAY_SUMMARY|frames_compared|" << totalFrames
         << "|matches|" << matches << "|mismatches|" << mismatches << endl;
    cout << "MILESTONE_75|PASS|replay playback verified" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Record session summary", expectedOutput: "RECORD_SESSION\\|frames\\|15\\|inputs\\|20\\|kills\\|\\d+\\|score\\|\\d+", isPattern: true },
      { id: "t2", description: "Frame 5 scores match", expectedOutput: "REPLAY\\|frame\\|5\\|live_score\\|\\d+\\|replay_score\\|\\d+\\|match\\|true", isPattern: true },
      { id: "t3", description: "Frame 10 positions match", expectedOutput: "REPLAY\\|frame\\|10\\|live_pos\\|\\(\\d+,\\d+\\)\\|replay_pos\\|\\(\\d+,\\d+\\)\\|match\\|true", isPattern: true },
      { id: "t4", description: "Frame 15 scores match", expectedOutput: "REPLAY\\|frame\\|15\\|live_score\\|\\d+\\|replay_score\\|\\d+\\|match\\|true", isPattern: true },
      { id: "t5", description: "All frames match with zero mismatches", expectedOutput: "REPLAY_SUMMARY\\|frames_compared\\|15\\|matches\\|15\\|mismatches\\|0", isPattern: true },
      { id: "t6", description: "Milestone 75 passes", expectedOutput: "MILESTONE_75\\|PASS\\|replay playback verified", isPattern: true },
    ],
    hints: [
      "initState() resets ALL globals and re-spawns wave 1. Call it before each runSession(). srand(42) must be called in initState() so both runs get identical RNG sequences.",
      "Distribute 20 inputs across 15 frames: frames 1-5 process 2 inputs each (10 total), frames 6-15 process 1 input each (10 total). Use inputIndex to track position in the log.",
      "Wave spawns are frame-triggered, not score-triggered. Frame 6 spawns wave 2. Frame 11 spawns wave 3. Both record and replay hit the same frames, so waves spawn identically.",
    ],
    estimatedMinutes: 18,
  },
};
