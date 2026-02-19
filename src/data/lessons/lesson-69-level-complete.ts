import type { Lesson } from "@/types/lesson";

export const lesson69: Lesson = {
  id: "69-level-complete",
  title: "Level Complete",
  description: "Detect level completion and show a victory screen with stats.",
  order: 69,
  xpReward: 200,
  tier: "pro",
  concepts: ["win condition", "level transition", "victory screen", "stats display"],
  part1: {
    title: "Concept: Level Complete",
    type: "concept",
    instructions: `# Level Complete — The Game That Never Ends

A game without a win condition is a screensaver. The player shoots enemies forever with no payoff. No sense of progress. No closure. The level-complete check tells the player "you did it" and gives them a reason to play again for a better score. Without it, skill improvement is invisible.

## What Breaks Without This

Without a win condition, the game runs until the player quits or dies. There is no positive ending. Without stats, the player has no feedback on how they performed. Without a rating, there is no target to aim for. The player finishes and feels nothing. Level complete with stats turns "I survived" into "I scored 2500 with 75% accuracy and an A rating."

## The Fix

Check two conditions every frame: all waves have been spawned AND all enemies are dead. When both are true, the level is complete. Freeze gameplay. Calculate stats: score, time in ticks, total kills, accuracy (hits divided by shots), max combo. Display a formatted victory screen. Assign a letter rating based on score thresholds.

\\\`\\\`\\\`
bool checkLevelComplete(int waveNum, int maxWaves, int activeEnemies) {
    return waveNum > maxWaves && activeEnemies == 0;
}

char getRating(int score) {
    if (score > 5000) return 'S';
    if (score > 2000) return 'A';
    if (score > 1000) return 'B';
    return 'C';
}
\\\`\\\`\\\`

The check must happen after cleanup, not after spawn. If you check after spawn, the new wave's enemies are alive and the condition fails. After cleanup, dead enemies are removed and the count reflects reality.

## Your Task

1. Win condition: waveNum > maxWaves AND activeEnemies == 0
2. Simulate 3 waves. Each wave spawns enemies. Kill them all.
3. Print per-frame status: \\\`WAVE_STATUS|wave|<w>|enemies_alive|<n>|total_waves|3\\\`
4. On completion: \\\`LEVEL_COMPLETE|wave|3|tick|45\\\`
5. Victory screen:
   \\\`VICTORY|===== LEVEL COMPLETE =====\\\`
   \\\`VICTORY|Score: 2500\\\`
   \\\`VICTORY|Time: 45 ticks\\\`
   \\\`VICTORY|Kills: 12\\\`
   \\\`VICTORY|Accuracy: 75%\\\`
   \\\`VICTORY|Combo Max: 4x\\\`
   \\\`VICTORY|Rating: A\\\`
6. Rating: S (>5000), A (>2000), B (>1000), C (else)

Expected output:
\\\`\\\`\\\`
WAVE_STATUS|wave|2|enemies_alive|3|total_waves|3
LEVEL_COMPLETE|wave|3|tick|45
VICTORY|===== LEVEL COMPLETE =====
VICTORY|Score: 2500
VICTORY|Time: 45 ticks
VICTORY|Kills: 12
VICTORY|Accuracy: 75%
VICTORY|Combo Max: 4x
VICTORY|Rating: A
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Checking the win condition before cleanup runs. Dead enemies with hp <= 0 are still in the alive array until cleanup removes them. If you check "activeEnemies == 0" before cleanup, enemies that just died still count as alive. The check goes after cleanup, every frame.

## Elite Insight

Commercial games separate "level clear" from "victory screen" with a state machine. State: PLAYING, LEVEL_CLEAR, SHOWING_STATS, TRANSITIONING. Each state has its own update and render logic. LEVEL_CLEAR freezes gameplay and triggers the stats calculation. SHOWING_STATS renders the victory screen. TRANSITIONING loads the next level. Your check-then-display approach is the prototype version of this state machine.

## Cross-Path Echo

Test result reporting follows the same pattern. Run all tests (waves). When the last test passes (enemies cleared), display a summary: total tests, passed, failed, duration, coverage percentage. The test runner's "all green" screen is your victory screen. The coverage percentage is your accuracy stat. The rating is the build health indicator.`,
    starterCode: `#include <iostream>
using namespace std;

int waveNum = 1;
int maxWaves = 3;
int totalKills = 12;
int totalShots = 16;
int totalScore = 2500;
int maxCombo = 4;
int completeTick = 45;

// TODO: Write checkLevelComplete(waveNum, maxWaves, activeEnemies)
//   Return true if waveNum > maxWaves AND activeEnemies == 0

// TODO: Write getRating(score)
//   S: >5000, A: >2000, B: >1000, C: else

// TODO: Write showVictoryScreen(score, ticks, kills, shots, maxCombo)
//   Print VICTORY header and all stat lines

int main() {
    // TODO: Simulate wave status checks
    //   Show WAVE_STATUS for wave 2 with 3 enemies alive

    // TODO: Check level complete after wave 3, all enemies dead

    // TODO: Print LEVEL_COMPLETE

    // TODO: Show victory screen

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int waveNum = 1;
int maxWaves = 3;
int totalKills = 12;
int totalShots = 16;
int totalScore = 2500;
int maxCombo = 4;
int completeTick = 45;

bool checkLevelComplete(int wNum, int mWaves, int activeEnemies) {
    return wNum > mWaves && activeEnemies == 0;
}

char getRating(int score) {
    if (score > 5000) return 'S';
    if (score > 2000) return 'A';
    if (score > 1000) return 'B';
    return 'C';
}

void showVictoryScreen(int score, int ticks, int kills, int shots, int mCombo) {
    int accuracy = (shots > 0) ? (kills * 100 / shots) : 0;
    cout << "VICTORY|===== LEVEL COMPLETE =====" << endl;
    cout << "VICTORY|Score: " << score << endl;
    cout << "VICTORY|Time: " << ticks << " ticks" << endl;
    cout << "VICTORY|Kills: " << kills << endl;
    cout << "VICTORY|Accuracy: " << accuracy << "%" << endl;
    cout << "VICTORY|Combo Max: " << mCombo << "x" << endl;
    cout << "VICTORY|Rating: " << getRating(score) << endl;
}

int main() {
    // Simulate wave status mid-game
    cout << "WAVE_STATUS|wave|2|enemies_alive|3|total_waves|3" << endl;

    // After wave 3, all enemies dead
    waveNum = 4; // past maxWaves
    int activeEnemies = 0;

    if (checkLevelComplete(waveNum, maxWaves, activeEnemies)) {
        cout << "LEVEL_COMPLETE|wave|3|tick|" << completeTick << endl;
        showVictoryScreen(totalScore, completeTick, totalKills, totalShots, maxCombo);
    }

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Wave status displayed", expectedOutput: "WAVE_STATUS\\|wave\\|2\\|enemies_alive\\|3\\|total_waves\\|3", isPattern: true },
      { id: "t2", description: "Level complete triggered", expectedOutput: "LEVEL_COMPLETE\\|wave\\|3\\|tick\\|45", isPattern: true },
      { id: "t3", description: "Victory header", expectedOutput: "VICTORY\\|===== LEVEL COMPLETE =====", isPattern: true },
      { id: "t4", description: "Score displayed", expectedOutput: "VICTORY\\|Score: 2500", isPattern: true },
      { id: "t5", description: "Accuracy calculated", expectedOutput: "VICTORY\\|Accuracy: 75%", isPattern: true },
      { id: "t6", description: "Rating assigned", expectedOutput: "VICTORY\\|Rating: A", isPattern: true },
    ],
    hints: [
      "checkLevelComplete needs two conditions: waveNum > maxWaves (all waves spawned) AND activeEnemies == 0 (all killed). Both must be true simultaneously.",
      "Accuracy = kills * 100 / shots. With 12 kills and 16 shots: 12 * 100 / 16 = 75%. Use integer division — no need for floating point.",
      "Rating thresholds are checked in order: S first (>5000), then A (>2000), then B (>1000), else C. Score 2500 exceeds 2000 but not 5000, so the rating is A.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Level Complete System",
    type: "game_builder",
    instructions: `# Game Builder: Level Complete — The Payoff

The win condition is the contract between the game and the player. Clear all waves, defeat all enemies, and the game rewards you with a victory screen. Stats tell the story of how you played. Rating gives a target for the next run. Without this, the player clears the last enemy and stares at an empty screen. Level complete transforms that anticlimax into a moment of triumph.

## What Breaks Without This

Without level complete detection, the game keeps running after all enemies are dead. The player drifts through empty space. Without the victory screen, there is no closure. Without stats, no feedback. Without rating, no replayability. Each missing piece erodes the player's motivation to play again.

## The Fix

Every frame after cleanup, count active enemies. If all waves are done and active enemies equals zero, trigger level complete. Freeze the game loop. Compute stats from accumulated data. Display the formatted victory screen with rating.

\\\`\\\`\\\`
// Check after cleanup, every frame:
// waveNum > maxWaves && countEnemies() == 0
// -> freeze -> compute stats -> display victory -> rating
\\\`\\\`\\\`

## Your Task

1. Win condition: waveNum > maxWaves AND activeEnemies == 0
2. Simulate 3 waves, enemies killed each wave
3. Print: \\\`WAVE_STATUS|wave|<w>|enemies_alive|<n>|total_waves|3\\\`
4. On completion: \\\`LEVEL_COMPLETE|wave|3|tick|45\\\`
5. Victory screen with stats: Score, Time, Kills, Accuracy, Combo Max, Rating
6. Rating: S (>5000), A (>2000), B (>1000), C (else)

## Beginner Trap

**Common Mistake:** Checking level complete inside the spawn system. The spawn system adds enemies. If you check the win condition there, new enemies just spawned and the count is never zero during that phase. Check after cleanup — that is when the count reflects the true state.

## Elite Insight

Speedrunners optimize for the level-complete trigger frame. In many games, the trigger has a specific check order and timing. Understanding when the win condition evaluates lets you minimize time. Your checkLevelComplete runs after cleanup — that means the frame an enemy dies is the frame the level can complete. No delay. Frame-perfect wins are possible by design.

## Cross-Path Echo

Deployment pipelines check completion the same way. All stages must pass (waves cleared) AND no errors remain (enemies alive). The deployment summary shows: duration, tests passed, coverage, build size. Green deploy is your victory screen. The health dashboard is your stats display. The SLA grade is your letter rating.`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int waveNum = 1;
int maxWaves = 3;
int score = 2500;
int kills = 12;
int shots = 16;
int maxCombo = 4;

// TODO: Write checkLevelComplete(waveNum, maxWaves, activeEnemies)

// TODO: Write getRating(score)
//   S: >5000, A: >2000, B: >1000, C: else

// TODO: Write showVictoryScreen(score, ticks, kills, shots, maxCombo)
//   Print VICTORY lines with all stats and rating

int main() {
    // TODO: Print WAVE_STATUS for wave 2

    // TODO: Simulate all waves cleared, check level complete

    // TODO: Print LEVEL_COMPLETE and show victory screen

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int waveNum = 1;
int maxWaves = 3;
int score = 2500;
int kills = 12;
int shots = 16;
int maxCombo = 4;

bool checkLevelComplete(int wNum, int mWaves, int activeEnemies) {
    return wNum > mWaves && activeEnemies == 0;
}

char getRating(int s) {
    if (s > 5000) return 'S';
    if (s > 2000) return 'A';
    if (s > 1000) return 'B';
    return 'C';
}

void showVictoryScreen(int s, int ticks, int k, int sh, int mc) {
    int accuracy = (sh > 0) ? (k * 100 / sh) : 0;
    cout << "VICTORY|===== LEVEL COMPLETE =====" << endl;
    cout << "VICTORY|Score: " << s << endl;
    cout << "VICTORY|Time: " << ticks << " ticks" << endl;
    cout << "VICTORY|Kills: " << k << endl;
    cout << "VICTORY|Accuracy: " << accuracy << "%" << endl;
    cout << "VICTORY|Combo Max: " << mc << "x" << endl;
    cout << "VICTORY|Rating: " << getRating(s) << endl;
}

int main() {
    // Wave status mid-game
    cout << "WAVE_STATUS|wave|2|enemies_alive|3|total_waves|3" << endl;

    // All waves done, enemies cleared
    waveNum = 4;
    int activeEnemies = 0;

    if (checkLevelComplete(waveNum, maxWaves, activeEnemies)) {
        cout << "LEVEL_COMPLETE|wave|3|tick|45" << endl;
        showVictoryScreen(score, 45, kills, shots, maxCombo);
    }

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Wave status displayed", expectedOutput: "WAVE_STATUS\\|wave\\|2\\|enemies_alive\\|3\\|total_waves\\|3", isPattern: true },
      { id: "t2", description: "Level complete triggered", expectedOutput: "LEVEL_COMPLETE\\|wave\\|3\\|tick\\|45", isPattern: true },
      { id: "t3", description: "Victory header", expectedOutput: "VICTORY\\|===== LEVEL COMPLETE =====", isPattern: true },
      { id: "t4", description: "Score displayed", expectedOutput: "VICTORY\\|Score: 2500", isPattern: true },
      { id: "t5", description: "Accuracy calculated", expectedOutput: "VICTORY\\|Accuracy: 75%", isPattern: true },
      { id: "t6", description: "Rating assigned", expectedOutput: "VICTORY\\|Rating: A", isPattern: true },
    ],
    hints: [
      "checkLevelComplete takes waveNum, maxWaves, and activeEnemies. Return true only when waveNum > maxWaves AND activeEnemies == 0. Both conditions must hold.",
      "Accuracy = kills * 100 / shots. Integer division: 12 * 100 = 1200, 1200 / 16 = 75. No floating point needed.",
      "Rating checks from highest to lowest: S (>5000), A (>2000), B (>1000), C (default). Score 2500 is greater than 2000 but not greater than 5000, so rating is A.",
    ],
    estimatedMinutes: 10,
  },
};
