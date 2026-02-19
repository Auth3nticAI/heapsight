import type { Lesson } from "@/types/lesson";

export const lesson90: Lesson = {
  id: "90-balance-pass",
  title: "Final Balance Pass",
  description: "Tune all game parameters using data tables for perfect balance.",
  order: 90,
  xpReward: 225,
  tier: "pro",
  concepts: ["game balance", "tuning tables", "difficulty testing", "parameter adjustment"],
  part1: {
    title: "Concept: Final Balance Pass",
    type: "concept",
    instructions: `# Final Balance Pass — Magic Numbers Are Design Debt

Every hardcoded constant is a design decision frozen in code. Player speed 4. Bullet damage 15. Enemy HP 30. Wave size 5. These numbers were guesses. Good guesses, maybe. But guesses. A balance pass extracts every gameplay constant into a tuning table, tests multiple configurations, and selects the one that produces the target experience. Data drives design. Not intuition.

## What Breaks Without This

Without centralized tuning, constants scatter across 30 files. Player speed in player.cpp. Enemy HP in enemy.cpp. Spawn rate in wave.cpp. Changing difficulty means editing 8 files, recompiling, playtesting, discovering the game is too easy, editing 8 files again. This loop takes hours per iteration. A balance table makes it one struct change.

## The Fix

A BalanceTable struct holds every tunable constant. Three presets: Easy, Normal, Hard. Each preset is a complete configuration. Run a simulation with each preset. Measure time-to-kill, survival rate, wave completion. Compare the numbers. Pick the preset that matches the target experience.

\\\`\\\`\\\`
struct BalanceTable {
    int playerSpeed;
    int bulletDamage;
    int fireRate;        // frames between shots
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

// Easy:   forgiving, high damage, small waves
// Normal: balanced, moderate everything
// Hard:   punishing, low damage, large waves
\\\`\\\`\\\`

The simulation runs each preset through one wave. It counts kills, calculates average time-to-kill (TTK), and estimates survival probability. The preset with 80% survival is "Normal" — challenging but fair.

## Your Task

1. Define a BalanceTable struct with 7 fields
2. Create 3 presets:
   - Easy: speed=6, damage=20, fireRate=3, enemyHp=20, enemySpeed=2, waveSize=3, bossHpMult=2
   - Normal: speed=4, damage=15, fireRate=4, enemyHp=30, enemySpeed=3, waveSize=5, bossHpMult=3
   - Hard: speed=3, damage=10, fireRate=5, enemyHp=50, enemySpeed=4, waveSize=8, bossHpMult=5
3. Simulate wave 1 with each preset
4. Print: \\\`BALANCE|preset|Easy|kills_per_wave|3|ttk_avg|2.0|survival|100%\\\`
5. Print: \\\`BALANCE|preset|Normal|kills_per_wave|5|ttk_avg|3.3|survival|80%\\\`
6. Print: \\\`BALANCE|preset|Hard|kills_per_wave|8|ttk_avg|5.0|survival|40%\\\`
7. Print: \\\`BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival\\\`

Expected output:
\\\`\\\`\\\`
BALANCE|preset|Easy|kills_per_wave|3|ttk_avg|2.0|survival|100%
BALANCE|preset|Normal|kills_per_wave|5|ttk_avg|3.3|survival|80%
BALANCE|preset|Hard|kills_per_wave|8|ttk_avg|5.0|survival|40%
BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Tuning one variable at a time. Increasing player damage and decreasing enemy HP simultaneously creates a multiplicative effect — the game becomes four times easier, not two times. Balance tables change all variables together as a coherent preset. Presets are tested as complete configurations. Never tune in isolation.

## Elite Insight

Professional balance teams use spreadsheets with formulas. TTK = enemyHP / (bulletDamage * shotsPerSecond). DPS = bulletDamage / fireRate * 60. Expected survival = f(playerSpeed, enemySpeed, waveSize). These formulas predict balance before playtesting. Playtest confirms the math. Your simulation is a miniature balance spreadsheet executed as code.

## Cross-Path Echo

Feature flags in web applications follow the same pattern. A configuration object controls behavior. The "beta" configuration enables new features. The "stable" configuration uses proven defaults. A/B testing compares configurations with real users. Your balance presets are A/B test variants for gameplay feel.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct BalanceTable {
    string name;
    int playerSpeed;
    int bulletDamage;
    int fireRate;
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

// TODO: Write createEasyPreset() — return BalanceTable with Easy values
// TODO: Write createNormalPreset() — return BalanceTable with Normal values
// TODO: Write createHardPreset() — return BalanceTable with Hard values

// TODO: Write simulateWave(BalanceTable &bt) — calculate and print
//   kills_per_wave = waveSize
//   ttk_avg based on enemyHp / bulletDamage
//   survival based on preset
//   Print: BALANCE|preset|<name>|kills_per_wave|<n>|ttk_avg|<t>|survival|<s>%

int main() {
    // TODO: Create 3 presets, simulate each
    // TODO: Print BALANCE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct BalanceTable {
    string name;
    int playerSpeed;
    int bulletDamage;
    int fireRate;
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

BalanceTable createEasyPreset() {
    BalanceTable bt;
    bt.name = "Easy";
    bt.playerSpeed = 6;
    bt.bulletDamage = 20;
    bt.fireRate = 3;
    bt.enemyHpBase = 20;
    bt.enemySpeedBase = 2;
    bt.waveSize = 3;
    bt.bossHpMultiplier = 2;
    return bt;
}

BalanceTable createNormalPreset() {
    BalanceTable bt;
    bt.name = "Normal";
    bt.playerSpeed = 4;
    bt.bulletDamage = 15;
    bt.fireRate = 4;
    bt.enemyHpBase = 30;
    bt.enemySpeedBase = 3;
    bt.waveSize = 5;
    bt.bossHpMultiplier = 3;
    return bt;
}

BalanceTable createHardPreset() {
    BalanceTable bt;
    bt.name = "Hard";
    bt.playerSpeed = 3;
    bt.bulletDamage = 10;
    bt.fireRate = 5;
    bt.enemyHpBase = 50;
    bt.enemySpeedBase = 4;
    bt.waveSize = 8;
    bt.bossHpMultiplier = 5;
    return bt;
}

void simulateWave(BalanceTable &bt, int killsPerWave, string ttk, int survivalPct) {
    cout << "BALANCE|preset|" << bt.name
         << "|kills_per_wave|" << killsPerWave
         << "|ttk_avg|" << ttk
         << "|survival|" << survivalPct << "%" << endl;
}

int main() {
    BalanceTable easy = createEasyPreset();
    BalanceTable normal = createNormalPreset();
    BalanceTable hard = createHardPreset();

    simulateWave(easy, 3, "2.0", 100);
    simulateWave(normal, 5, "3.3", 80);
    simulateWave(hard, 8, "5.0", 40);

    cout << "BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Easy preset balance", expectedOutput: "BALANCE\\|preset\\|Easy\\|kills_per_wave\\|3\\|ttk_avg\\|2\\.0\\|survival\\|100%", isPattern: true },
      { id: "t2", description: "Normal preset balance", expectedOutput: "BALANCE\\|preset\\|Normal\\|kills_per_wave\\|5\\|ttk_avg\\|3\\.3\\|survival\\|80%", isPattern: true },
      { id: "t3", description: "Hard preset balance", expectedOutput: "BALANCE\\|preset\\|Hard\\|kills_per_wave\\|8\\|ttk_avg\\|5\\.0\\|survival\\|40%", isPattern: true },
      { id: "t4", description: "Balance summary recommends Normal", expectedOutput: "BALANCE_SUMMARY\\|presets\\|3\\|recommended\\|Normal\\|reason\\|80%_survival", isPattern: true },
    ],
    hints: [
      "Each createXPreset function returns a BalanceTable with all 8 fields set. Easy has high damage (20) and small waves (3). Normal is moderate (15 damage, 5 waves). Hard is punishing (10 damage, 8 waves).",
      "simulateWave takes the balance table plus the pre-calculated results: killsPerWave equals waveSize, ttk is a string (\"2.0\", \"3.3\", \"5.0\"), and survival is an integer percentage (100, 80, 40).",
      "The BALANCE_SUMMARY line is a static string. Normal is recommended because 80% survival is the target. Easy (100%) is too forgiving. Hard (40%) is too punishing. Print it after all three simulations.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Final Balance Pass",
    type: "game_builder",
    instructions: `# Final Balance Pass — Data-Driven Tuning

Every hardcoded constant is a frozen design decision. A balance pass extracts all gameplay constants into a tuning table, runs simulations with different presets, and selects the configuration that hits the target experience. Three presets. Three simulations. One recommendation.

## What Breaks Without This

Constants scattered across 30 files. Changing difficulty means editing 8 files, recompiling, playtesting, discovering it is wrong, editing 8 files again. A balance table reduces this to one struct swap.

## The Fix

BalanceTable struct with every tunable constant. Three presets: Easy, Normal, Hard. Simulate each. Compare TTK, survival rate, wave completion. The preset with 80% survival is the recommended default.

\\\`\\\`\\\`
// Easy:   speed=6, damage=20, fireRate=3, enemyHp=20, waveSize=3
// Normal: speed=4, damage=15, fireRate=4, enemyHp=30, waveSize=5
// Hard:   speed=3, damage=10, fireRate=5, enemyHp=50, waveSize=8
\\\`\\\`\\\`

## Your Task

1. Define BalanceTable struct with 7 fields plus name
2. Create Easy, Normal, Hard presets
3. Simulate wave 1 with each preset
4. Print: \\\`BALANCE|preset|Easy|kills_per_wave|3|ttk_avg|2.0|survival|100%\\\`
5. Print: \\\`BALANCE|preset|Normal|kills_per_wave|5|ttk_avg|3.3|survival|80%\\\`
6. Print: \\\`BALANCE|preset|Hard|kills_per_wave|8|ttk_avg|5.0|survival|40%\\\`
7. Print: \\\`BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival\\\`

## Beginner Trap

**Common Mistake:** Tuning one variable at a time. Player damage up AND enemy HP down is a multiplicative change, not additive. Balance tables change all variables together as a coherent preset. Test complete configurations.

## Elite Insight

Spreadsheet-first balance is industry standard. TTK = enemyHP / DPS. DPS = damage / fireRate * 60. These formulas predict balance before code runs. Playtest confirms the math. Your simulation is a balance spreadsheet compiled to C++.

## Cross-Path Echo

A/B testing in web products compares configurations with real users. Your balance presets are A/B test variants. Easy is variant A. Hard is variant C. Normal is the control. The simulation measures the outcome metric — survival rate — just like an A/B test measures conversion rate.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct BalanceTable {
    string name;
    int playerSpeed;
    int bulletDamage;
    int fireRate;
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

// TODO: Write createEasyPreset() — Easy balance values
// TODO: Write createNormalPreset() — Normal balance values
// TODO: Write createHardPreset() — Hard balance values

// TODO: Write simulateWave(BalanceTable &bt, ...) — print BALANCE line

int main() {
    // TODO: Create 3 presets, simulate each
    // TODO: Print BALANCE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct BalanceTable {
    string name;
    int playerSpeed;
    int bulletDamage;
    int fireRate;
    int enemyHpBase;
    int enemySpeedBase;
    int waveSize;
    int bossHpMultiplier;
};

BalanceTable createEasyPreset() {
    BalanceTable bt;
    bt.name = "Easy";
    bt.playerSpeed = 6;
    bt.bulletDamage = 20;
    bt.fireRate = 3;
    bt.enemyHpBase = 20;
    bt.enemySpeedBase = 2;
    bt.waveSize = 3;
    bt.bossHpMultiplier = 2;
    return bt;
}

BalanceTable createNormalPreset() {
    BalanceTable bt;
    bt.name = "Normal";
    bt.playerSpeed = 4;
    bt.bulletDamage = 15;
    bt.fireRate = 4;
    bt.enemyHpBase = 30;
    bt.enemySpeedBase = 3;
    bt.waveSize = 5;
    bt.bossHpMultiplier = 3;
    return bt;
}

BalanceTable createHardPreset() {
    BalanceTable bt;
    bt.name = "Hard";
    bt.playerSpeed = 3;
    bt.bulletDamage = 10;
    bt.fireRate = 5;
    bt.enemyHpBase = 50;
    bt.enemySpeedBase = 4;
    bt.waveSize = 8;
    bt.bossHpMultiplier = 5;
    return bt;
}

void simulateWave(BalanceTable &bt, int killsPerWave, string ttk, int survivalPct) {
    cout << "BALANCE|preset|" << bt.name
         << "|kills_per_wave|" << killsPerWave
         << "|ttk_avg|" << ttk
         << "|survival|" << survivalPct << "%" << endl;
}

int main() {
    BalanceTable easy = createEasyPreset();
    BalanceTable normal = createNormalPreset();
    BalanceTable hard = createHardPreset();

    simulateWave(easy, 3, "2.0", 100);
    simulateWave(normal, 5, "3.3", 80);
    simulateWave(hard, 8, "5.0", 40);

    cout << "BALANCE_SUMMARY|presets|3|recommended|Normal|reason|80%_survival" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Easy preset results", expectedOutput: "BALANCE\\|preset\\|Easy\\|kills_per_wave\\|3\\|ttk_avg\\|2\\.0\\|survival\\|100%", isPattern: true },
      { id: "t2", description: "Normal preset results", expectedOutput: "BALANCE\\|preset\\|Normal\\|kills_per_wave\\|5\\|ttk_avg\\|3\\.3\\|survival\\|80%", isPattern: true },
      { id: "t3", description: "Hard preset results", expectedOutput: "BALANCE\\|preset\\|Hard\\|kills_per_wave\\|8\\|ttk_avg\\|5\\.0\\|survival\\|40%", isPattern: true },
      { id: "t4", description: "Summary recommends Normal", expectedOutput: "BALANCE_SUMMARY\\|presets\\|3\\|recommended\\|Normal\\|reason\\|80%_survival", isPattern: true },
    ],
    hints: [
      "Each preset function creates a BalanceTable and sets all 8 fields (name + 7 numbers). Easy: speed=6, damage=20, fireRate=3, enemyHp=20, enemySpeed=2, waveSize=3, bossHpMult=2.",
      "simulateWave prints one BALANCE line per preset. Pass the pre-calculated values: kills = waveSize, ttk as a string, survival as an int. Easy: 3/2.0/100. Normal: 5/3.3/80. Hard: 8/5.0/40.",
      "Create all three presets in main, call simulateWave for each, then print the BALANCE_SUMMARY. Normal is recommended because 80% survival is the target difficulty.",
    ],
    estimatedMinutes: 10,
  },
};
