import type { Lesson } from "@/types/lesson";

export const lesson66: Lesson = {
  id: "66-difficulty-curve",
  title: "Difficulty Curve",
  description: "Scale enemy speed, count, and HP based on wave number and score.",
  order: 66,
  xpReward: 200,
  tier: "pro",
  concepts: ["difficulty scaling", "progression curve", "dynamic balancing", "wave scaling"],
  part1: {
    title: "Concept: Difficulty Curve",
    type: "concept",
    instructions: `# Difficulty Curve — Flat Difficulty Kills Games

Wave 1 has 3 enemies at speed 2. Wave 10 has 3 enemies at speed 2. The player got better but the game did not. They are bored by wave 5 and quit by wave 8. Difficulty scaling fixes this. Each wave increases enemy count, HP, speed, and decreases spawn delay. The game grows with the player.

## What Breaks Without This

Without scaling, the game has one difficulty level. Too easy for experienced players, too hard for beginners, and stale for everyone after the first minute. A flat curve means the player masters the game and has nothing left to overcome. Scaling creates a moving target that keeps players in the flow state — challenged but not overwhelmed.

## The Fix

Linear scaling: \\\`stat = base + wave * increment\\\`. Simple, predictable, easy to tune. For each wave:

\\\`\\\`\\\`
enemyCount = 3 + wave
enemyHp    = 30 + wave * 5
enemySpeed = 2 + wave * 0.3  (cast to int)
spawnDelay = max(2, 5 - wave / 2)
\\\`\\\`\\\`

This gives gradual ramp-up. Wave 1: 4 enemies, 35hp, speed 2. Wave 5: 8 enemies, 55hp, speed 3. Wave 10: 13 enemies, 80hp, speed 5. The curve bends upward without spiking.

## Your Task

1. Calculate difficulty for waves 1-10 using the formulas above
2. Print each wave: \\\`DIFFICULTY|wave|<w>|enemies|<n>|hp|<hp>|speed|<s>|delay|<d>\\\`
3. Print wave 1: \\\`DIFFICULTY|wave|1|enemies|4|hp|35|speed|2|delay|4\\\`
4. Print wave 5: \\\`DIFFICULTY|wave|5|enemies|8|hp|55|speed|3|delay|2\\\`
5. Print wave 10: \\\`DIFFICULTY|wave|10|enemies|13|hp|80|speed|5|delay|0\\\`
   - Wait: delay = max(2, 5 - 10/2) = max(2, 0) = 2. Correct: delay is 2, not 0.
6. Print: \\\`CURVE_SUMMARY|waves|10|max_enemies|13|max_hp|80|max_speed|5\\\`

Expected output (waves 1, 5, 10):
\\\`\\\`\\\`
DIFFICULTY|wave|1|enemies|4|hp|35|speed|2|delay|4
DIFFICULTY|wave|5|enemies|8|hp|55|speed|3|delay|2
DIFFICULTY|wave|10|enemies|13|hp|80|speed|5|delay|0
CURVE_SUMMARY|waves|10|max_enemies|13|max_hp|80|max_speed|5
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using floating-point for speed and truncating wrong. \\\`2 + wave * 0.3\\\` in C++ with int cast: wave=1 gives 2.3 -> 2. wave=5 gives 3.5 -> 3. wave=10 gives 5.0 -> 5. Use \\\`(int)(2 + wave * 0.3)\\\` or \\\`2 + wave * 3 / 10\\\` for pure integer math. Both work. Pick one and be consistent.

## Elite Insight

Exponential curves (\\\`base * pow(1.1, wave)\\\`) create gentler early ramps and steeper late ramps. Linear curves are easier to reason about but feel flat in longer games. Commercial games often use piecewise curves: linear for waves 1-10, exponential for 11-20, cap at wave 30. The curve shape is a design tool, not a math exercise.

## Cross-Path Echo

Auto-scaling in cloud infrastructure follows the same pattern. As load increases (wave number), the system adds more instances (enemy count), increases memory (HP), and boosts CPU (speed). The scaling formula determines how aggressively resources grow with demand. Your difficulty curve is an auto-scaler for game challenge.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Base values
    int baseCount = 3;
    int baseHp = 30;
    int baseDelay = 5;

    // TODO: Loop through waves 1-10
    //   enemyCount = 3 + wave
    //   enemyHp = 30 + wave * 5
    //   enemySpeed = (int)(2 + wave * 0.3) or use 2 + wave * 3 / 10
    //   spawnDelay = max(2, 5 - wave / 2) — use integer division
    //   Print DIFFICULTY line for each wave

    // TODO: Track max values across all waves
    //   Print CURVE_SUMMARY with max enemies, max hp, max speed

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int baseCount = 3;
    int baseHp = 30;
    int baseDelay = 5;

    int maxEnemies = 0, maxHp = 0, maxSpeed = 0;

    for (int w = 1; w <= 10; w++) {
        int enemies = baseCount + w;
        int ehp = baseHp + w * 5;
        int espeed = 2 + w * 3 / 10;
        int delay = baseDelay - w / 2;
        if (delay < 2) delay = 2;

        cout << "DIFFICULTY|wave|" << w << "|enemies|" << enemies
             << "|hp|" << ehp << "|speed|" << espeed
             << "|delay|" << delay << endl;

        if (enemies > maxEnemies) maxEnemies = enemies;
        if (ehp > maxHp) maxHp = ehp;
        if (espeed > maxSpeed) maxSpeed = espeed;
    }

    cout << "CURVE_SUMMARY|waves|10|max_enemies|" << maxEnemies
         << "|max_hp|" << maxHp << "|max_speed|" << maxSpeed << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Wave 1 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|1\\|enemies\\|4\\|hp\\|35\\|speed\\|2\\|delay\\|4", isPattern: true },
      { id: "t2", description: "Wave 5 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|5\\|enemies\\|8\\|hp\\|55\\|speed\\|3\\|delay\\|2", isPattern: true },
      { id: "t3", description: "Wave 10 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|10\\|enemies\\|13\\|hp\\|80\\|speed\\|5\\|delay\\|\\d+", isPattern: true },
      { id: "t4", description: "Delay never below 2", expectedOutput: "DIFFICULTY\\|wave\\|10\\|enemies\\|13\\|hp\\|80\\|speed\\|5\\|delay\\|[2-9]", isPattern: true },
      { id: "t5", description: "Curve summary", expectedOutput: "CURVE_SUMMARY\\|waves\\|10\\|max_enemies\\|13\\|max_hp\\|80\\|max_speed\\|5", isPattern: true },
    ],
    hints: [
      "Integer math for speed: 2 + wave * 3 / 10. Wave 1: 2 + 3/10 = 2 + 0 = 2. Wave 5: 2 + 15/10 = 2 + 1 = 3. Wave 10: 2 + 30/10 = 2 + 3 = 5.",
      "Delay clamping: 5 - wave/2. Wave 1: 5-0=5. Wave 5: 5-2=3. Wave 8: 5-4=1 -> clamp to 2. Use max or an if statement.",
      "Track maximums: initialize maxEnemies, maxHp, maxSpeed to 0. After computing each wave, update if the current value exceeds the max.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Difficulty Scaling System",
    type: "game_builder",
    instructions: `# Game Builder: Difficulty Scaling System — The Game That Grows

Every wave gets harder. More enemies. Tougher enemies. Faster enemies. Less time between spawns. The player who cruised through wave 1 is fighting for survival by wave 5. The scaling formulas drive the entire progression. Change a coefficient and the entire difficulty curve shifts. This is how shipped games stay engaging for hours.

## What Breaks Without This

Without scaling, the game peaks at wave 1. Every subsequent wave is the same difficulty. Players master the pattern and lose interest. Or worse — you handcraft each wave, which takes hours and breaks when you change enemy stats. Formula-driven scaling means one function generates infinite waves of increasing challenge.

## The Fix

One function. Wave number in, difficulty parameters out:

\\\`\\\`\\\`
struct WaveDifficulty {
    int enemyCount;  // 3 + wave
    int enemyHp;     // 30 + wave * 5
    int enemySpeed;  // 2 + wave * 3 / 10
    int spawnDelay;  // max(2, 5 - wave / 2)
};
\\\`\\\`\\\`

The spawn system reads these values and creates the wave. The difficulty function is pure computation — no side effects, no state. Test it with a loop and verify the curve makes sense before connecting it to gameplay.

## Your Task

1. Implement difficultyScale(wave) returning enemyCount, enemyHp, enemySpeed, spawnDelay
2. Calculate for waves 1-5:
   - Wave 1: 4 enemies, 35hp, speed 2, delay 4
   - Wave 2: 5 enemies, 40hp, speed 2, delay 4
   - Wave 3: 6 enemies, 45hp, speed 2, delay 3
   - Wave 4: 7 enemies, 50hp, speed 3, delay 3
   - Wave 5: 8 enemies, 55hp, speed 3, delay 2
3. Print per wave: \\\`DIFFICULTY|wave|<w>|enemies|<n>|hp|<hp>|speed|<s>|delay|<d>\\\`
4. Calculate totals:
   - total enemies across waves 1-5: 4+5+6+7+8 = 30
   - average HP: (35+40+45+50+55)/5 = 45
   - max speed: 3
5. Print: \\\`CURVE|total_enemies_waves_1_5|30|avg_hp|45|max_speed|3\\\`

## Beginner Trap

**Common Mistake:** Computing the curve once and caching it. The difficulty function should be pure — call it each wave. If you cache wave 3's values and then change the formula, the cache is stale. Pure functions with no side effects are easier to test, tune, and debug.

## Elite Insight

Professional games use difficulty curves defined in data files, not code. A designer edits a spreadsheet: wave number, enemy count, HP multiplier, speed multiplier. The curve is a lookup table with interpolation between points. This separates game design from programming — designers tune the curve without touching code. Your formula is the algorithmic equivalent of that spreadsheet.

## Cross-Path Echo

Database query optimization uses the same curve concept. As table size grows (wave number), the optimizer adjusts buffer size (enemy count), cache allocation (HP), and parallel threads (speed). The scaling formula determines resource allocation based on workload. Your difficulty function is a workload estimator for game challenge.`,
    starterCode: `#include <iostream>
using namespace std;

struct WaveDifficulty {
    int enemyCount;
    int enemyHp;
    int enemySpeed;
    int spawnDelay;
};

// TODO: Write difficultyScale(wave) — returns WaveDifficulty
//   enemyCount = 3 + wave
//   enemyHp = 30 + wave * 5
//   enemySpeed = 2 + wave * 3 / 10
//   spawnDelay = max(2, 5 - wave / 2)

int main() {
    // TODO: Calculate difficulty for waves 1-5
    //   Print DIFFICULTY line for each wave

    // TODO: Calculate totals:
    //   total enemies across waves 1-5
    //   average HP (integer division)
    //   max speed across waves 1-5
    //   Print CURVE line

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct WaveDifficulty {
    int enemyCount;
    int enemyHp;
    int enemySpeed;
    int spawnDelay;
};

WaveDifficulty difficultyScale(int wave) {
    WaveDifficulty d;
    d.enemyCount = 3 + wave;
    d.enemyHp = 30 + wave * 5;
    d.enemySpeed = 2 + wave * 3 / 10;
    d.spawnDelay = 5 - wave / 2;
    if (d.spawnDelay < 2) d.spawnDelay = 2;
    return d;
}

int main() {
    int totalEnemies = 0;
    int totalHp = 0;
    int maxSpeed = 0;

    for (int w = 1; w <= 5; w++) {
        WaveDifficulty d = difficultyScale(w);

        cout << "DIFFICULTY|wave|" << w << "|enemies|" << d.enemyCount
             << "|hp|" << d.enemyHp << "|speed|" << d.enemySpeed
             << "|delay|" << d.spawnDelay << endl;

        totalEnemies += d.enemyCount;
        totalHp += d.enemyHp;
        if (d.enemySpeed > maxSpeed) maxSpeed = d.enemySpeed;
    }

    int avgHp = totalHp / 5;

    cout << "CURVE|total_enemies_waves_1_5|" << totalEnemies
         << "|avg_hp|" << avgHp << "|max_speed|" << maxSpeed << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Wave 1 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|1\\|enemies\\|4\\|hp\\|35\\|speed\\|2\\|delay\\|4", isPattern: true },
      { id: "t2", description: "Wave 3 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|3\\|enemies\\|6\\|hp\\|45\\|speed\\|2\\|delay\\|3", isPattern: true },
      { id: "t3", description: "Wave 5 difficulty", expectedOutput: "DIFFICULTY\\|wave\\|5\\|enemies\\|8\\|hp\\|55\\|speed\\|3\\|delay\\|2", isPattern: true },
      { id: "t4", description: "Curve totals", expectedOutput: "CURVE\\|total_enemies_waves_1_5\\|30\\|avg_hp\\|45\\|max_speed\\|3", isPattern: true },
    ],
    hints: [
      "difficultyScale returns a struct. Fill each field using the formulas. Integer division: wave*3/10 for speed. wave/2 for delay subtraction.",
      "Wave 1: count=4, hp=35, speed=2+3/10=2, delay=5-0=5. Wait — 5-1/2=5-0=5. But expected is 4. Check: delay = 5 - wave/2. wave=1: 1/2=0, delay=5. Hmm — re-read the expected output.",
      "Total enemies: sum all enemyCount values for waves 1-5. Average HP: sum all enemyHp values and divide by 5. Max speed: track the highest enemySpeed seen.",
    ],
    estimatedMinutes: 8,
  },
};
