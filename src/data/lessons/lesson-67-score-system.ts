import type { Lesson } from "@/types/lesson";

export const lesson67: Lesson = {
  id: "67-score-system",
  title: "Score System",
  description: "Build a score system with per-kill points and combo multipliers.",
  order: 67,
  xpReward: 200,
  tier: "pro",
  concepts: ["scoring", "multipliers", "combo system", "score breakdown"],
  part1: {
    title: "Concept: Score System",
    type: "concept",
    instructions: `# Score System — Numbers Without Meaning

A kill is not a kill. A basic enemy drifting into your bullets is worth less than a fast enemy you tracked and nailed mid-dodge. Without a score system that reflects difficulty, the player has no feedback loop. No reason to take risks. No reason to chain kills. Points are the language the game uses to tell the player "that was impressive."

## What Breaks Without This

Without scoring, every kill feels the same. The player has no metric for improvement. No way to compare runs. No incentive to play aggressively instead of hiding in a corner. The game becomes a binary — alive or dead. Score turns it into a gradient. Score with combos turns it into a skill expression system.

## The Fix

Assign base points per enemy type. Harder enemies pay more. Then add a combo multiplier: kill within 3 ticks of your last kill and the multiplier increments. Miss the window and it resets to 1x. The score for each kill is \\\`base * combo\\\`. This rewards aggressive, continuous play.

\\\`\\\`\\\`
int basePoints[] = {100, 150, 300, 1000}; // basic, fast, tank, boss
int combo = 1;
int lastKillTick = -99;

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) combo++;
    else combo = 1;
    if (combo > 5) combo = 5;  // cap at 5x
    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
}
\\\`\\\`\\\`

The combo window is tight — 3 ticks. This forces the player to stay engaged. The 5x cap prevents infinite scaling. The base points create a risk-reward hierarchy: tanks are worth 3x a basic, but they take longer to kill and might break your combo.

## Your Task

1. Define base points: basic=100, fast=150, tank=300, boss=1000
2. Track combo multiplier (starts at 1, max 5x)
3. Combo rule: if kill happens within 3 ticks of last kill, combo++. Otherwise reset to 1
4. Simulate 4 kills:
   - Tick 1: kill basic (combo 1x)
   - Tick 3: kill fast (within 3 ticks, combo 2x)
   - Tick 5: kill basic (within 3 ticks, combo 3x)
   - Tick 10: kill tank (gap > 3, combo resets to 1x)
5. Print per kill: \\\`SCORE|tick|<t>|kill|<type>|base|<b>|combo|<c>x|points|<p>|total|<total>\\\`
6. Print: \\\`SCORE_SUMMARY|kills|4|max_combo|3x|total|1000\\\`

Expected output:
\\\`\\\`\\\`
SCORE|tick|1|kill|basic|base|100|combo|1x|points|100|total|100
SCORE|tick|3|kill|fast|base|150|combo|2x|points|300|total|400
SCORE|tick|5|kill|basic|base|100|combo|3x|points|300|total|700
SCORE|tick|10|kill|tank|base|300|combo|1x|points|300|total|1000
SCORE_SUMMARY|kills|4|max_combo|3x|total|1000
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Incrementing combo before checking the window. Check first: is this kill within 3 ticks of the last? If yes, increment. If no, reset to 1. Then apply. If you increment first, every first kill after a gap gets combo 2x instead of 1x.

## Elite Insight

Competitive games tune combo windows obsessively. Too tight and nobody combos. Too loose and combos are free. 3 ticks at 60fps is 50ms — that is reaction-time territory. The window should match the spawn density. If enemies arrive every 2 ticks, combos flow naturally. If they arrive every 10, combos are rare and rewarding. The window defines the game's rhythm.

## Cross-Path Echo

Database write coalescing uses the same pattern. Writes within a time window get batched together. Miss the window and a new batch starts. The combo multiplier is a batch counter. The timeout is a flush trigger. Your score system is a real-time write batcher.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
int killCount = 0;

// Enemy types: 0=basic, 1=fast, 2=tank, 3=boss
int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

// TODO: Write onKill(enemyType, tick)
//   Check if tick - lastKillTick <= 3: if yes, combo++ (max 5)
//   Otherwise reset combo to 1
//   Calculate points = basePoints[enemyType] * combo
//   Add to score, update lastKillTick, increment killCount
//   Track maxCombo
//   Print SCORE line

int main() {
    // TODO: Simulate 4 kills
    //   Tick 1: basic
    //   Tick 3: fast
    //   Tick 5: basic
    //   Tick 10: tank

    // TODO: Print SCORE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
int killCount = 0;

// Enemy types: 0=basic, 1=fast, 2=tank, 3=boss
int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) {
        combo++;
        if (combo > 5) combo = 5;
    } else {
        combo = 1;
    }

    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
    killCount++;

    if (combo > maxCombo) maxCombo = combo;

    cout << "SCORE|tick|" << tick << "|kill|" << enemyNames[enemyType]
         << "|base|" << basePoints[enemyType] << "|combo|" << combo
         << "x|points|" << points << "|total|" << score << endl;
}

int main() {
    onKill(0, 1);   // basic at tick 1
    onKill(1, 3);   // fast at tick 3
    onKill(0, 5);   // basic at tick 5
    onKill(2, 10);  // tank at tick 10

    cout << "SCORE_SUMMARY|kills|" << killCount
         << "|max_combo|" << maxCombo << "x|total|" << score << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First kill scores 100 at 1x combo", expectedOutput: "SCORE\\|tick\\|1\\|kill\\|basic\\|base\\|100\\|combo\\|1x\\|points\\|100\\|total\\|100", isPattern: true },
      { id: "t2", description: "Second kill combos to 2x", expectedOutput: "SCORE\\|tick\\|3\\|kill\\|fast\\|base\\|150\\|combo\\|2x\\|points\\|300\\|total\\|400", isPattern: true },
      { id: "t3", description: "Third kill combos to 3x", expectedOutput: "SCORE\\|tick\\|5\\|kill\\|basic\\|base\\|100\\|combo\\|3x\\|points\\|300\\|total\\|700", isPattern: true },
      { id: "t4", description: "Fourth kill resets combo after gap", expectedOutput: "SCORE\\|tick\\|10\\|kill\\|tank\\|base\\|300\\|combo\\|1x\\|points\\|300\\|total\\|1000", isPattern: true },
      { id: "t5", description: "Score summary correct", expectedOutput: "SCORE_SUMMARY\\|kills\\|4\\|max_combo\\|3x\\|total\\|1000", isPattern: true },
    ],
    hints: [
      "The combo window is 3 ticks. Tick 1 to tick 3 is a gap of 2, which is <= 3, so combo increments. Tick 5 to tick 10 is a gap of 5, which is > 3, so combo resets to 1.",
      "Points = basePoints[enemyType] * combo. For the fast enemy at 2x: 150 * 2 = 300. For the tank at 1x: 300 * 1 = 300. The total accumulates across all kills.",
      "Track maxCombo separately from combo. combo resets on gaps, but maxCombo only ever increases. After all kills, maxCombo should be 3.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Score System",
    type: "game_builder",
    instructions: `# Game Builder: Score System — Every Kill Tells a Story

Points are feedback. Combos are rhythm. Without a score system, the player mashes fire and watches enemies vanish with no differentiation. A basic enemy and a boss feel the same. A lucky shot and a skilled chain feel the same. Score breaks that flatness. Base points create hierarchy. Combo multipliers create flow state.

## What Breaks Without This

Without scoring, the game has no memory. Kill 50 enemies and there is nothing to show for it. No high score. No personal best. No way to tell if this run was better than the last. Score is the game's long-term memory. Combos are the short-term memory — they remember what you did 3 ticks ago and reward you for consistency.

## The Fix

Define base points per enemy type. Track the tick of the last kill. If the current kill is within 3 ticks, increment the combo multiplier (cap at 5x). Otherwise reset to 1x. Multiply base points by combo for the final score. Print every kill event with full breakdown.

\\\`\\\`\\\`
// Kill sequence determines score
// basic(100) -> fast(150) -> basic(100) -> [gap] -> tank(300)
// 1x=100, 2x=300, 3x=300, reset 1x=300 = 1000 total
\\\`\\\`\\\`

## Your Task

1. Base points: basic=100, fast=150, tank=300, boss=1000
2. Combo: kills within 3 ticks increment multiplier (max 5x). Gap > 3 resets to 1x
3. Simulate kill sequence:
   - Tick 1: basic (combo 1x, points 100, total 100)
   - Tick 3: fast (combo 2x, points 300, total 400)
   - Tick 5: basic (combo 3x, points 300, total 700)
   - Tick 10: tank (combo reset 1x, points 300, total 1000)
4. Print per kill: \\\`SCORE|tick|<t>|kill|<type>|base|<b>|combo|<c>x|points|<p>|total|<total>\\\`
5. Print: \\\`SCORE_SUMMARY|kills|4|max_combo|3x|total|1000\\\`

## Beginner Trap

**Common Mistake:** Resetting combo to 0 instead of 1. The minimum combo is always 1x — every kill is worth at least its base points. A combo of 0 means zero points, which breaks the entire system.

## Elite Insight

Arcade games like Galaga and Space Invaders used score as the only progression. No levels, no upgrades — just a number that went up. The high score table was the social contract. Your combo system adds depth to that contract: it is not just how many you killed, but how fast you killed them. The score encodes play style.

## Cross-Path Echo

Network packet acknowledgment uses combo-like batching. TCP delayed ACK waits briefly before sending acknowledgment, hoping to batch multiple packets. If the window expires, it sends immediately. Your combo timer is a delayed ACK for kill events — batch them for a multiplier, or timeout and flush at 1x.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int ehp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
int killCount = 0;

// Enemy types: 0=basic, 1=fast, 2=tank, 3=boss
int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

// TODO: Write onKill(enemyType, tick)
//   Check combo window (3 ticks), update combo, calc points
//   Print SCORE line

// TODO: Write simulateKillSequence()
//   Kill basic at tick 1, fast at tick 3, basic at tick 5, tank at tick 10

int main() {
    // TODO: Run kill sequence simulation

    // TODO: Print SCORE_SUMMARY with kills, max_combo, total

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int ehp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int combo = 1;
int maxCombo = 1;
int lastKillTick = -99;
int killCount = 0;

// Enemy types: 0=basic, 1=fast, 2=tank, 3=boss
int basePoints[] = {100, 150, 300, 1000};
string enemyNames[] = {"basic", "fast", "tank", "boss"};

void onKill(int enemyType, int tick) {
    if (tick - lastKillTick <= 3) {
        combo++;
        if (combo > 5) combo = 5;
    } else {
        combo = 1;
    }

    int points = basePoints[enemyType] * combo;
    score += points;
    lastKillTick = tick;
    killCount++;

    if (combo > maxCombo) maxCombo = combo;

    cout << "SCORE|tick|" << tick << "|kill|" << enemyNames[enemyType]
         << "|base|" << basePoints[enemyType] << "|combo|" << combo
         << "x|points|" << points << "|total|" << score << endl;
}

int main() {
    onKill(0, 1);   // basic at tick 1
    onKill(1, 3);   // fast at tick 3
    onKill(0, 5);   // basic at tick 5
    onKill(2, 10);  // tank at tick 10

    cout << "SCORE_SUMMARY|kills|" << killCount
         << "|max_combo|" << maxCombo << "x|total|" << score << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First kill scores 100 at 1x combo", expectedOutput: "SCORE\\|tick\\|1\\|kill\\|basic\\|base\\|100\\|combo\\|1x\\|points\\|100\\|total\\|100", isPattern: true },
      { id: "t2", description: "Second kill combos to 2x", expectedOutput: "SCORE\\|tick\\|3\\|kill\\|fast\\|base\\|150\\|combo\\|2x\\|points\\|300\\|total\\|400", isPattern: true },
      { id: "t3", description: "Third kill combos to 3x", expectedOutput: "SCORE\\|tick\\|5\\|kill\\|basic\\|base\\|100\\|combo\\|3x\\|points\\|300\\|total\\|700", isPattern: true },
      { id: "t4", description: "Tank kill resets combo", expectedOutput: "SCORE\\|tick\\|10\\|kill\\|tank\\|base\\|300\\|combo\\|1x\\|points\\|300\\|total\\|1000", isPattern: true },
      { id: "t5", description: "Score summary correct", expectedOutput: "SCORE_SUMMARY\\|kills\\|4\\|max_combo\\|3x\\|total\\|1000", isPattern: true },
    ],
    hints: [
      "The combo window is 3 ticks. Tick 1 to tick 3 = gap of 2 (<= 3), so combo goes to 2. Tick 3 to tick 5 = gap of 2 (<= 3), so combo goes to 3. Tick 5 to tick 10 = gap of 5 (> 3), so combo resets to 1.",
      "Points = base * combo. Fast at 2x = 150*2 = 300. Basic at 3x = 100*3 = 300. Tank at 1x = 300*1 = 300. Running total: 100, 400, 700, 1000.",
      "maxCombo tracks the highest combo reached. It never decreases. After the sequence, maxCombo = 3 even though combo reset to 1 for the tank kill.",
    ],
    estimatedMinutes: 8,
  },
};
