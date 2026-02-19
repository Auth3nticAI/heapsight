import type { Lesson } from "@/types/lesson";

export const lesson91: Lesson = {
  id: "91-hud-v2",
  title: "HUD v2 Layout",
  description: "Build a clean HUD with grouped stats, health bar, and wave indicator.",
  order: 91,
  xpReward: 225,
  tier: "pro",
  concepts: ["HUD design", "UI layout", "information hierarchy", "formatted display"],
  part1: {
    title: "Concept: HUD v2 Layout",
    type: "concept",
    instructions: `# HUD v2 Layout — Information Without Hierarchy Is Noise

A HUD that dumps every stat in a single line is not information — it is noise. The player glances at the screen for 200 milliseconds. In that window, they need to read HP, score, and wave. If those values are buried in a wall of numbers, they read nothing. Grouping related information and placing it in consistent screen positions turns noise into signal. Top-left: score and combo. Top-right: wave and time. Bottom-left: health bar. Bottom-right: lives and ammo.

## What Breaks Without This

Without layout grouping, the HUD is a single line: "HP:80 Score:2500 Wave:3 Time:45 Combo:3 Lives:2 Ammo:3". Seven values competing for attention. The player cannot find HP during a boss fight. They cannot find wave count when deciding strategy. Every glance requires a linear scan of the entire HUD. This costs frames — cognitive frames, not render frames.

## The Fix

Four quadrants. Top-left holds score and combo — the reward signals. Top-right holds wave and time — the progress signals. Bottom-left holds the HP bar — the survival signal. Bottom-right holds lives and ammo — the resource signals. Each quadrant answers one question. "How am I doing?" Top-left. "How far am I?" Top-right. "Am I alive?" Bottom-left. "What do I have?" Bottom-right.

\\\`\\\`\\\`
// Top:    SCORE: 2500  COMBO: 3x  |  WAVE 3/10  TIME: 45
// Bottom: HP [████████░░] 80/100  |  LIVES: **. AMMO: |||
\\\`\\\`\\\`

The HP bar is a 10-character visual. Each character represents 10% of max HP. Filled characters show current health. Empty characters show damage taken. At a glance, the player sees "mostly full" or "almost dead" without reading a number.

## Your Task

1. Set game state: score=2500, combo=3, wave=3, maxWave=10, time=45, hp=80, maxHp=100, lives=2, maxLives=3, ammo=3
2. Build HP bar: 10 chars, filled proportional to hp/maxHp
3. Build lives display: '*' for remaining, '.' for lost
4. Build ammo display: '|' chars for ammo count
5. Print: \\\`HUD_TOP|SCORE: 2500  COMBO: 3x  |  WAVE 3/10  TIME: 45\\\`
6. Print: \\\`HUD_BOT|HP [########..] 80/100  |  LIVES: **. AMMO: |||\\\`
7. Print: \\\`HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo\\\`

Expected output:
\\\`\\\`\\\`
HUD_TOP|SCORE: 2500  COMBO: 3x  |  WAVE 3/10  TIME: 45
HUD_BOT|HP [########..] 80/100  |  LIVES: **. AMMO: |||
HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Hardcoding the HP bar string. If HP changes from 80 to 30, the bar must update. Calculate filled = hp * 10 / maxHp. Loop filled times for '#', then (10 - filled) times for '.'. A hardcoded string breaks on the next damage tick.

## Elite Insight

Professional HUDs use animation. The HP bar does not jump from 80 to 30 — it slides over 0.5 seconds. The score counter does not jump from 2500 to 3000 — it rolls up digit by digit. The combo display flashes on increment. These animations make the HUD feel alive. Your static HUD is the data layer. Animation is the presentation layer on top.

## Cross-Path Echo

Dashboard layouts in web applications follow identical patterns. Top-left: revenue (score). Top-right: active users (wave progress). Bottom-left: server health bar (HP). Bottom-right: resource utilization (ammo). Information hierarchy is universal. Group by question, position by importance.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int hudScore = 2500;
int hudCombo = 3;
int hudWave = 3;
int hudMaxWave = 10;
int hudTime = 45;
int hudHp = 80;
int hudMaxHp = 100;
int hudLives = 2;
int hudMaxLives = 3;
int hudAmmo = 3;

// TODO: Write buildHpBar() — return 10-char string
//       filled = hp * 10 / maxHp => '#' chars
//       empty = 10 - filled => '.' chars

// TODO: Write buildLivesDisplay() — return string
//       '*' for remaining lives, '.' for lost

// TODO: Write buildAmmoDisplay() — return string
//       '|' for each ammo unit

// TODO: Write printHudTop() — print HUD_TOP line
// TODO: Write printHudBot() — print HUD_BOT line

int main() {
    // TODO: Print HUD_TOP
    // TODO: Print HUD_BOT
    // TODO: Print HUD_LAYOUT

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int hudScore = 2500;
int hudCombo = 3;
int hudWave = 3;
int hudMaxWave = 10;
int hudTime = 45;
int hudHp = 80;
int hudMaxHp = 100;
int hudLives = 2;
int hudMaxLives = 3;
int hudAmmo = 3;

string buildHpBar() {
    int filled = hudHp * 10 / hudMaxHp;
    string bar = "";
    for (int i = 0; i < filled; i++) bar += '#';
    for (int i = filled; i < 10; i++) bar += '.';
    return bar;
}

string buildLivesDisplay() {
    string disp = "";
    for (int i = 0; i < hudLives; i++) disp += '*';
    for (int i = hudLives; i < hudMaxLives; i++) disp += '.';
    return disp;
}

string buildAmmoDisplay() {
    string disp = "";
    for (int i = 0; i < hudAmmo; i++) disp += '|';
    return disp;
}

void printHudTop() {
    cout << "HUD_TOP|SCORE: " << hudScore << "  COMBO: " << hudCombo
         << "x  |  WAVE " << hudWave << "/" << hudMaxWave
         << "  TIME: " << hudTime << endl;
}

void printHudBot() {
    cout << "HUD_BOT|HP [" << buildHpBar() << "] " << hudHp << "/" << hudMaxHp
         << "  |  LIVES: " << buildLivesDisplay()
         << " AMMO: " << buildAmmoDisplay() << endl;
}

int main() {
    printHudTop();
    printHudBot();

    cout << "HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "HUD top line with score and wave", expectedOutput: "HUD_TOP\\|SCORE: 2500  COMBO: 3x  \\|  WAVE 3/10  TIME: 45", isPattern: true },
      { id: "t2", description: "HUD bottom with HP bar and lives", expectedOutput: "HUD_BOT\\|HP \\[########\\.\\.\\] 80/100  \\|  LIVES: \\*\\*\\. AMMO: \\|\\|\\|", isPattern: true },
      { id: "t3", description: "HUD layout sections", expectedOutput: "HUD_LAYOUT\\|sections\\|4\\|top_left\\|score_combo\\|top_right\\|wave_time\\|bot_left\\|hp_bar\\|bot_right\\|lives_ammo", isPattern: true },
    ],
    hints: [
      "buildHpBar calculates filled = hudHp * 10 / hudMaxHp = 80 * 10 / 100 = 8. Loop 8 times appending '#', then 2 times appending '.'. Result: \"########..\".",
      "buildLivesDisplay loops hudLives times for '*' (2), then (hudMaxLives - hudLives) times for '.' (1). Result: \"**.\". buildAmmoDisplay loops hudAmmo times for '|' (3). Result: \"|||\".",
      "printHudTop concatenates score, combo with 'x', wave/maxWave, and time. printHudBot wraps the HP bar in brackets, adds hp/maxHp, then lives and ammo displays. Match spacing exactly.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: HUD v2 Layout",
    type: "game_builder",
    instructions: `# HUD v2 Layout — Quadrant-Based Information Display

A wall of numbers is not a HUD. Four quadrants, each answering one question. Top-left: score and combo. Top-right: wave and time. Bottom-left: HP bar. Bottom-right: lives and ammo. The player glances for 200ms and gets the answer they need.

## What Breaks Without This

Seven values in one line. The player scans left to right looking for HP during a boss fight. By the time they find it, they are dead. Layout is not cosmetic. Layout is survival.

## The Fix

Group by question. "How am I doing?" — score, combo. "How far am I?" — wave, time. "Am I alive?" — HP bar. "What do I have?" — lives, ammo. Position by importance. HP bar is bottom-left because eyes drift down-left under stress.

\\\`\\\`\\\`
// HUD_TOP: score + combo | wave + time
// HUD_BOT: HP bar        | lives + ammo
\\\`\\\`\\\`

## Your Task

1. Set state: score=2500, combo=3, wave=3/10, time=45, hp=80/100, lives=2/3, ammo=3
2. Build HP bar: 10 chars, '#' for filled, '.' for empty
3. Build lives: '*' remaining, '.' lost
4. Build ammo: '|' per unit
5. Print: \\\`HUD_TOP|SCORE: 2500  COMBO: 3x  |  WAVE 3/10  TIME: 45\\\`
6. Print: \\\`HUD_BOT|HP [########..] 80/100  |  LIVES: **. AMMO: |||\\\`
7. Print: \\\`HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo\\\`

## Beginner Trap

**Common Mistake:** Hardcoding the HP bar. Calculate filled = hp * 10 / maxHp. Build it with a loop. If you hardcode "########..", it breaks when HP changes.

## Elite Insight

Professional HUDs animate transitions. HP slides instead of jumping. Score rolls up digit by digit. Combo flashes on increment. Your static layout is the data layer. Animation is the presentation layer that makes it feel alive.

## Cross-Path Echo

Web dashboards use the same quadrant layout. Revenue top-left. Active users top-right. Server health bottom-left. Resource usage bottom-right. Information hierarchy transcends medium.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int hudScore = 2500;
int hudCombo = 3;
int hudWave = 3;
int hudMaxWave = 10;
int hudTime = 45;
int hudHp = 80;
int hudMaxHp = 100;
int hudLives = 2;
int hudMaxLives = 3;
int hudAmmo = 3;

// TODO: Write buildHpBar() — 10-char string, '#' filled, '.' empty
// TODO: Write buildLivesDisplay() — '*' remaining, '.' lost
// TODO: Write buildAmmoDisplay() — '|' per ammo

// TODO: Write printHudTop() — score, combo, wave, time
// TODO: Write printHudBot() — HP bar, lives, ammo

int main() {
    // TODO: Print HUD_TOP, HUD_BOT, HUD_LAYOUT

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int hudScore = 2500;
int hudCombo = 3;
int hudWave = 3;
int hudMaxWave = 10;
int hudTime = 45;
int hudHp = 80;
int hudMaxHp = 100;
int hudLives = 2;
int hudMaxLives = 3;
int hudAmmo = 3;

string buildHpBar() {
    int filled = hudHp * 10 / hudMaxHp;
    string bar = "";
    for (int i = 0; i < filled; i++) bar += '#';
    for (int i = filled; i < 10; i++) bar += '.';
    return bar;
}

string buildLivesDisplay() {
    string disp = "";
    for (int i = 0; i < hudLives; i++) disp += '*';
    for (int i = hudLives; i < hudMaxLives; i++) disp += '.';
    return disp;
}

string buildAmmoDisplay() {
    string disp = "";
    for (int i = 0; i < hudAmmo; i++) disp += '|';
    return disp;
}

void printHudTop() {
    cout << "HUD_TOP|SCORE: " << hudScore << "  COMBO: " << hudCombo
         << "x  |  WAVE " << hudWave << "/" << hudMaxWave
         << "  TIME: " << hudTime << endl;
}

void printHudBot() {
    cout << "HUD_BOT|HP [" << buildHpBar() << "] " << hudHp << "/" << hudMaxHp
         << "  |  LIVES: " << buildLivesDisplay()
         << " AMMO: " << buildAmmoDisplay() << endl;
}

int main() {
    printHudTop();
    printHudBot();

    cout << "HUD_LAYOUT|sections|4|top_left|score_combo|top_right|wave_time|bot_left|hp_bar|bot_right|lives_ammo" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "HUD top renders score combo wave time", expectedOutput: "HUD_TOP\\|SCORE: 2500  COMBO: 3x  \\|  WAVE 3/10  TIME: 45", isPattern: true },
      { id: "t2", description: "HUD bottom renders HP bar lives ammo", expectedOutput: "HUD_BOT\\|HP \\[########\\.\\.\\] 80/100  \\|  LIVES: \\*\\*\\. AMMO: \\|\\|\\|", isPattern: true },
      { id: "t3", description: "HUD layout summary", expectedOutput: "HUD_LAYOUT\\|sections\\|4\\|top_left\\|score_combo\\|top_right\\|wave_time\\|bot_left\\|hp_bar\\|bot_right\\|lives_ammo", isPattern: true },
    ],
    hints: [
      "buildHpBar: filled = 80 * 10 / 100 = 8. Eight '#' characters followed by two '.' characters. Build with a loop, not a hardcoded string.",
      "buildLivesDisplay: 2 lives remaining = \"**\", 1 lost = \".\", combined \"**.\". buildAmmoDisplay: 3 ammo = \"|||\". Both use simple for loops.",
      "Match the exact spacing in the output. Two spaces between SCORE value and COMBO. Two spaces between COMBO value and pipe. Two spaces between pipe and WAVE. Spacing matters for alignment.",
    ],
    estimatedMinutes: 10,
  },
};
