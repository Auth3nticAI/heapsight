import type { Lesson } from "@/types/lesson";

export const lesson77: Lesson = {
  id: "77-stats-screen",
  title: "Stats Screen",
  description: "Track and display comprehensive gameplay statistics.",
  order: 77,
  xpReward: 200,
  tier: "pro",
  concepts: ["statistics tracking", "data aggregation", "display formatting", "session metrics"],
  part1: {
    title: "Concept: Stats Screen",
    type: "concept",
    instructions: `# Stats Screen — Numbers Without Context Are Noise

A score of 3500 means nothing without context. Is that good? Compared to what? The stats screen answers every question the player has about their performance. Shots fired, shots hit, accuracy percentage, kills, damage dealt, damage taken, time played, max combo. Raw data plus derived metrics. Formatted for instant readability.

## What Breaks Without This

Without a stats screen, the player has one number: the score. They cannot improve because they cannot diagnose. Was the low score from poor accuracy or from dying early? Did they deal enough damage or waste shots on empty space? The stats screen is the feedback loop that turns playing into improving.

## The Fix

Define a GameStats struct that accumulates raw counters during gameplay: shotsFired, shotsHit, kills, damageDealt, damageTaken, framesPlayed, maxCombo, bossesKilled. After the session, compute derived stats: accuracy (hits/shots), DPS (damage/time), kill rate (kills/time). Format everything with aligned columns for clean display.

\\\`\\\`\\\`
struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};
\\\`\\\`\\\`

The formatting matters. Right-align numbers. Use consistent width. The player should scan the screen in two seconds and know exactly how they performed. No parsing required.

## Your Task

1. Define a GameStats struct with all 8 fields
2. Simulate a 5-wave session that accumulates stats:
   - shotsFired=45, shotsHit=34, kills=12, damageDealt=1850
   - damageTaken=60, framesPlayed=50, maxCombo=4, bossesKilled=1
3. Compute: accuracy = shotsHit * 1000 / shotsFired (then format as XX.X%), score=3500
4. Print formatted stats screen:
   \\\`STATS|============ SESSION STATS ============\\\`
   \\\`STATS|Shots Fired:     45\\\`
   \\\`STATS|Shots Hit:       34\\\`
   \\\`STATS|Accuracy:        75.5%\\\`
   \\\`STATS|Kills:           12\\\`
   \\\`STATS|Damage Dealt:    1850\\\`
   \\\`STATS|Damage Taken:    60\\\`
   \\\`STATS|Max Combo:       4x\\\`
   \\\`STATS|Bosses Killed:   1\\\`
   \\\`STATS|Frames Played:   50\\\`
   \\\`STATS|Score:           3500\\\`

Expected output:
\\\`\\\`\\\`
STATS|============ SESSION STATS ============
STATS|Shots Fired:     45
STATS|Shots Hit:       34
STATS|Accuracy:        75.5%
STATS|Kills:           12
STATS|Damage Dealt:    1850
STATS|Damage Taken:    60
STATS|Max Combo:       4x
STATS|Bosses Killed:   1
STATS|Frames Played:   50
STATS|Score:           3500
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Integer division truncates. \\\`34 * 100 / 45\\\` gives 75, not 75.5. Use \\\`34 * 1000 / 45\\\` to get 755, then format as "75.5%". This avoids floating-point entirely while displaying one decimal place.

## Elite Insight

Professional games separate stat collection from stat display. The collector is a lightweight struct updated in the game loop — zero allocations, zero string formatting. The display is a separate system that reads the struct and formats it for the UI. This separation means stat collection has zero frame impact. Only the display — which runs once at session end — pays the formatting cost.

## Cross-Path Echo

Application performance monitoring dashboards are stats screens for servers. Response time, error rate, throughput, p99 latency — all tracked as raw counters, then derived and displayed. Your GameStats struct is an APM agent. Your formatted output is the Grafana dashboard.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

int score = 3500;

// TODO: Write initStats(GameStats &s)
//   Zero all fields

// TODO: Write printStatsScreen(GameStats &s, int score)
//   Print header: STATS|============ SESSION STATS ============
//   Print each stat with label aligned
//   Accuracy = shotsHit * 1000 / shotsFired -> format as XX.X%

int main() {
    GameStats stats;

    // TODO: Init stats
    // TODO: Simulate session — set all stat values:
    //   shotsFired=45, shotsHit=34, kills=12, damageDealt=1850
    //   damageTaken=60, framesPlayed=50, maxCombo=4, bossesKilled=1
    // TODO: Print stats screen

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

int score = 3500;

void initStats(GameStats &s) {
    s.shotsFired = 0;
    s.shotsHit = 0;
    s.kills = 0;
    s.damageDealt = 0;
    s.damageTaken = 0;
    s.framesPlayed = 0;
    s.maxCombo = 0;
    s.bossesKilled = 0;
}

void printStatsScreen(GameStats &s, int sc) {
    cout << "STATS|============ SESSION STATS ============" << endl;
    cout << "STATS|Shots Fired:     " << s.shotsFired << endl;
    cout << "STATS|Shots Hit:       " << s.shotsHit << endl;

    int accTenths = (s.shotsFired > 0) ? (s.shotsHit * 1000 / s.shotsFired) : 0;
    int accWhole = accTenths / 10;
    int accDec = accTenths % 10;
    cout << "STATS|Accuracy:        " << accWhole << "." << accDec << "%" << endl;

    cout << "STATS|Kills:           " << s.kills << endl;
    cout << "STATS|Damage Dealt:    " << s.damageDealt << endl;
    cout << "STATS|Damage Taken:    " << s.damageTaken << endl;
    cout << "STATS|Max Combo:       " << s.maxCombo << "x" << endl;
    cout << "STATS|Bosses Killed:   " << s.bossesKilled << endl;
    cout << "STATS|Frames Played:   " << s.framesPlayed << endl;
    cout << "STATS|Score:           " << sc << endl;
}

int main() {
    GameStats stats;
    initStats(stats);

    // Simulate session
    stats.shotsFired = 45;
    stats.shotsHit = 34;
    stats.kills = 12;
    stats.damageDealt = 1850;
    stats.damageTaken = 60;
    stats.framesPlayed = 50;
    stats.maxCombo = 4;
    stats.bossesKilled = 1;

    printStatsScreen(stats, score);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Stats header printed", expectedOutput: "STATS\\|============ SESSION STATS ============", isPattern: true },
      { id: "t2", description: "Shots Fired shown", expectedOutput: "STATS\\|Shots Fired:.*45", isPattern: true },
      { id: "t3", description: "Accuracy calculated", expectedOutput: "STATS\\|Accuracy:.*75\\.5%", isPattern: true },
      { id: "t4", description: "Kills shown", expectedOutput: "STATS\\|Kills:.*12", isPattern: true },
      { id: "t5", description: "Damage Dealt shown", expectedOutput: "STATS\\|Damage Dealt:.*1850", isPattern: true },
      { id: "t6", description: "Score shown", expectedOutput: "STATS\\|Score:.*3500", isPattern: true },
    ],
    hints: [
      "Initialize all 8 fields of GameStats to zero, then set them to the simulated values. The struct is a simple data container — no methods needed.",
      "For accuracy with one decimal: multiply shotsHit by 1000 then divide by shotsFired. Result 755 means 75.5%. Extract whole part with /10 and decimal with %10.",
      "Format each line with STATS| prefix. Align values by using consistent spacing in the label. The exact spacing matches the expected output pattern.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Stats Screen",
    type: "game_builder",
    instructions: `# Game Builder: Stats Screen — Session Performance Dashboard

The stats screen is the player's report card. Every metric accumulated during gameplay — shots, hits, kills, damage, combos — formatted into a scannable display. Raw counters plus derived percentages. The player reads it once and knows exactly what to improve next session.

## What Breaks Without This

Without stats, the player optimizes blindly. They know their score went up but not why. Was it the accuracy improvement or the longer survival? The stats screen decomposes performance into actionable dimensions. Each stat is a lever the player can pull.

## The Fix

Accumulate during gameplay. Display after session. The GameStats struct holds raw counters updated by game events — kill increments kills and damageDealt, hit increments shotsHit, death increments damageTaken. At session end, compute derived metrics and format the display.

\\\`\\\`\\\`
// During gameplay: stats.kills++, stats.damageDealt += dmg
// After session: accuracy = hits * 1000 / shots
// Display: formatted aligned text
\\\`\\\`\\\`

## Your Task

1. Define GameStats with 8 fields
2. Simulate a complete 5-wave session accumulating all stats
3. Compute accuracy using integer math (multiply by 1000 for one decimal place)
4. Print the formatted stats screen with STATS| prefix on each line
5. Print: \\\`STATS|============ SESSION STATS ============\\\`
6. Print: \\\`STATS|Shots Fired:     45\\\`
7. Print: \\\`STATS|Accuracy:        75.5%\\\`
8. Print: \\\`STATS|Score:           3500\\\`

## Beginner Trap

**Common Mistake:** Using floating-point for accuracy display. Integer-only approach: \\\`hits * 1000 / shots\\\` gives tenths. Split into whole and decimal with \\\`/ 10\\\` and \\\`% 10\\\`. No floats needed. No precision issues.

## Elite Insight

Esports titles track hundreds of stats per match. Kill/death ratio, headshot percentage, utility damage, economy rating. Each stat feeds ranking algorithms and skill-based matchmaking. Your 10-line stats screen scales to that level because the pattern is identical: accumulate raw, derive computed, display formatted.

## Cross-Path Echo

Business intelligence dashboards follow the same pipeline. Raw events (page views, clicks, purchases) are accumulated in a data warehouse. Derived metrics (conversion rate, average order value, churn rate) are computed in batch. Display is a separate rendering layer. Your stats screen is a BI dashboard for a game session.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

int score = 3500;

// TODO: Write initStats(GameStats &s) — zero all fields

// TODO: Write printStatsScreen(GameStats &s, int score)
//   Print header, each stat line with STATS| prefix, accuracy as XX.X%

int main() {
    GameStats stats;

    // TODO: Init stats, set values, print stats screen
    //   shotsFired=45, shotsHit=34, kills=12, damageDealt=1850
    //   damageTaken=60, framesPlayed=50, maxCombo=4, bossesKilled=1

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct GameStats {
    int shotsFired;
    int shotsHit;
    int kills;
    int damageDealt;
    int damageTaken;
    int framesPlayed;
    int maxCombo;
    int bossesKilled;
};

int score = 3500;

void initStats(GameStats &s) {
    s.shotsFired = 0;
    s.shotsHit = 0;
    s.kills = 0;
    s.damageDealt = 0;
    s.damageTaken = 0;
    s.framesPlayed = 0;
    s.maxCombo = 0;
    s.bossesKilled = 0;
}

void printStatsScreen(GameStats &s, int sc) {
    cout << "STATS|============ SESSION STATS ============" << endl;
    cout << "STATS|Shots Fired:     " << s.shotsFired << endl;
    cout << "STATS|Shots Hit:       " << s.shotsHit << endl;

    int accTenths = (s.shotsFired > 0) ? (s.shotsHit * 1000 / s.shotsFired) : 0;
    int accWhole = accTenths / 10;
    int accDec = accTenths % 10;
    cout << "STATS|Accuracy:        " << accWhole << "." << accDec << "%" << endl;

    cout << "STATS|Kills:           " << s.kills << endl;
    cout << "STATS|Damage Dealt:    " << s.damageDealt << endl;
    cout << "STATS|Damage Taken:    " << s.damageTaken << endl;
    cout << "STATS|Max Combo:       " << s.maxCombo << "x" << endl;
    cout << "STATS|Bosses Killed:   " << s.bossesKilled << endl;
    cout << "STATS|Frames Played:   " << s.framesPlayed << endl;
    cout << "STATS|Score:           " << sc << endl;
}

int main() {
    GameStats stats;
    initStats(stats);

    stats.shotsFired = 45;
    stats.shotsHit = 34;
    stats.kills = 12;
    stats.damageDealt = 1850;
    stats.damageTaken = 60;
    stats.framesPlayed = 50;
    stats.maxCombo = 4;
    stats.bossesKilled = 1;

    printStatsScreen(stats, score);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Stats header printed", expectedOutput: "STATS\\|============ SESSION STATS ============", isPattern: true },
      { id: "t2", description: "Shots Fired shown", expectedOutput: "STATS\\|Shots Fired:.*45", isPattern: true },
      { id: "t3", description: "Shots Hit shown", expectedOutput: "STATS\\|Shots Hit:.*34", isPattern: true },
      { id: "t4", description: "Accuracy calculated correctly", expectedOutput: "STATS\\|Accuracy:.*75\\.5%", isPattern: true },
      { id: "t5", description: "Max Combo shown", expectedOutput: "STATS\\|Max Combo:.*4x", isPattern: true },
      { id: "t6", description: "Score shown", expectedOutput: "STATS\\|Score:.*3500", isPattern: true },
    ],
    hints: [
      "Zero all 8 struct fields in initStats, then assign the simulated values. Print each line with the STATS| prefix followed by the label and value.",
      "Accuracy: 34 * 1000 / 45 = 755. Whole part = 755 / 10 = 75. Decimal = 755 % 10 = 5. Print as 75.5%.",
      "Match the exact formatting: STATS|Label:           value. The spacing between label and value should be consistent for alignment.",
    ],
    estimatedMinutes: 8,
  },
};
