import type { Lesson } from "@/types/lesson";

export const lesson64: Lesson = {
  id: "64-boss-intro",
  title: "Boss Introduction",
  description: "Add a boss enemy that takes multiple hits and fills the screen.",
  order: 64,
  xpReward: 200,
  tier: "pro",
  concepts: ["boss entity", "high HP target", "multi-hit combat", "boss rendering"],
  part1: {
    title: "Concept: Boss Introduction",
    type: "concept",
    instructions: `# Boss Introduction — One Big Enemy Changes Everything

Regular enemies die in one hit. The player never has to commit, never has to stay in danger, never has to plan. A boss fixes this. High HP means multiple hits. Multiple hits mean the player stays engaged for seconds, not milliseconds. The boss is not a new system. It is the same entity with bigger numbers.

## What Breaks Without This

Without bosses, combat has no climax. Waves blend together. The player never feels pressure because every threat dies instantly. A boss creates a focal point — a sustained encounter that tests positioning, ammo management, and pattern recognition. Without it, the game is target practice.

## The Fix

A boss is an entity. Same arrays. Same systems. Different values: high HP (200), large size (60x40), center position, distinct sprite ('W'). The collision system already handles multi-hit because it reduces HP by damage per hit. A boss just survives more hits.

\\\`\\\`\\\`
// Boss is just an entity with big stats
hp[bossIdx] = 200;
type[bossIdx] = 3;  // boss type
sprite[bossIdx] = 'W';
// size: 60x40 (for collision box)
\\\`\\\`\\\`

Health bar: 10 characters wide. Filled blocks proportional to HP percentage. At 80% HP: 8 filled, 2 empty. Simple integer math: \\\`filled = hp * 10 / maxHp\\\`.

## Your Task

1. Create a boss entity: id "BOSS_1", type 3, 200hp, position (170, 40), sprite 'W'
2. Boss takes 5 hits of 40 damage each across 5 frames
3. Print per hit: \\\`BOSS_HIT|frame|<f>|damage|40|hp|<remaining>|bar|<healthbar>\\\`
4. Health bar: 10 chars. Use filled block char and empty block char
   - Frame 1: 160hp = 8 filled, 2 empty
   - Frame 5: 0hp = 0 filled, 10 empty
5. Print: \\\`BOSS|frame|5|hp|0|status|DEFEATED\\\`
6. Print: \\\`BOSS_SUMMARY|total_hits|5|total_damage|200|frames_alive|5\\\`

Expected output:
\\\`\\\`\\\`
BOSS_HIT|frame|1|damage|40|hp|160|bar|========..
BOSS_HIT|frame|2|damage|40|hp|120|bar|======....
BOSS_HIT|frame|3|damage|40|hp|80|bar|====......
BOSS_HIT|frame|4|damage|40|hp|40|bar|==........
BOSS_HIT|frame|5|damage|40|hp|0|bar|..........
BOSS|frame|5|hp|0|status|DEFEATED
BOSS_SUMMARY|total_hits|5|total_damage|200|frames_alive|5
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Creating a separate Boss class with its own update loop. The boss should use the same entity arrays and the same systems. A new class means duplicated collision logic, duplicated rendering, duplicated cleanup. Just use a type field to distinguish boss from regular enemy.

## Elite Insight

Health bars are UI feedback for sustained encounters. Without visual HP indication, the player cannot gauge progress. They do not know if the boss is nearly dead or just started. The health bar converts an invisible number into a visible progress indicator. Every shipped game with boss fights has this. It is not optional — it is a usability requirement.

## Cross-Path Echo

Progress bars in installers and downloads serve the same function. Without a progress bar, users cancel at 95% because they think the process is stuck. Your boss health bar is a progress bar for combat. It tells the player: keep going, you are making progress.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Boss entity
    string bossId = "BOSS_1";
    int bossHp = 200;
    int bossMaxHp = 200;
    int bossX = 170, bossY = 40;
    char bossSprite = 'W';
    int damagePerHit = 40;

    // TODO: Simulate 5 frames of combat
    //   Each frame: deal 40 damage, calculate remaining HP
    //   Build health bar: 10 chars, '=' for filled, '.' for empty
    //   filled = bossHp * 10 / bossMaxHp
    //   Print BOSS_HIT line with health bar

    // TODO: Print BOSS defeated line

    // TODO: Print BOSS_SUMMARY line

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string bossId = "BOSS_1";
    int bossHp = 200;
    int bossMaxHp = 200;
    int bossX = 170, bossY = 40;
    char bossSprite = 'W';
    int damagePerHit = 40;
    int totalDamage = 0;

    for (int frame = 1; frame <= 5; frame++) {
        bossHp -= damagePerHit;
        if (bossHp < 0) bossHp = 0;
        totalDamage += damagePerHit;

        int filled = bossHp * 10 / bossMaxHp;
        string bar = "";
        for (int i = 0; i < 10; i++) {
            bar += (i < filled) ? '=' : '.';
        }

        cout << "BOSS_HIT|frame|" << frame << "|damage|" << damagePerHit
             << "|hp|" << bossHp << "|bar|" << bar << endl;
    }

    cout << "BOSS|frame|5|hp|0|status|DEFEATED" << endl;
    cout << "BOSS_SUMMARY|total_hits|5|total_damage|" << totalDamage
         << "|frames_alive|5" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First hit reduces to 160hp", expectedOutput: "BOSS_HIT\\|frame\\|1\\|damage\\|40\\|hp\\|160\\|bar\\|========\\.\\.", isPattern: true },
      { id: "t2", description: "Third hit reduces to 80hp", expectedOutput: "BOSS_HIT\\|frame\\|3\\|damage\\|40\\|hp\\|80\\|bar\\|====\\.\\.\\.\\.\\.\\.".replace(/\n/g, ""), isPattern: true },
      { id: "t3", description: "Fifth hit kills boss", expectedOutput: "BOSS_HIT\\|frame\\|5\\|damage\\|40\\|hp\\|0\\|bar\\|\\.{10}", isPattern: true },
      { id: "t4", description: "Boss defeated status", expectedOutput: "BOSS\\|frame\\|5\\|hp\\|0\\|status\\|DEFEATED", isPattern: true },
      { id: "t5", description: "Boss summary correct", expectedOutput: "BOSS_SUMMARY\\|total_hits\\|5\\|total_damage\\|200\\|frames_alive\\|5", isPattern: true },
    ],
    hints: [
      "Health bar filled count: filled = bossHp * 10 / bossMaxHp. At 160hp: 160*10/200 = 8. At 80hp: 80*10/200 = 4. At 0hp: 0*10/200 = 0.",
      "Build the bar string in a loop: for i from 0 to 9, append '=' if i < filled, else append '.'. This gives exactly 10 characters every time.",
      "Track totalDamage by adding damagePerHit each frame. After 5 frames: 5 * 40 = 200. The boss starts at 200hp and ends at 0hp.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Boss Entity Combat",
    type: "game_builder",
    instructions: `# Game Builder: Boss Entity Combat — The Big Target

A boss entity sits at center screen. 200 HP. Sprite 'W'. Five frames of sustained combat. Each frame the player deals 40 damage. The health bar drains. The boss dies. This is the first multi-hit encounter in the game. The same collision and damage systems handle it — the boss just has more HP.

## What Breaks Without This

Without a boss, waves end abruptly. The player clears five enemies in one second and waits for the next wave. No tension. No sustained engagement. The boss creates a 5-second encounter where the player must keep hitting while dodging. It transforms the game from whack-a-mole into a real fight.

## The Fix

Boss entity in the same arrays as everything else. Type 3 distinguishes it from regular enemies (type 2). The collision system already handles HP reduction. The render system draws the boss sprite at its position. The only new code is the health bar display — a 10-character ASCII string computed from HP percentage.

\\\`\\\`\\\`
// Health bar computation
int filled = currentHp * 10 / maxHp;
// filled=8: "========.."
// filled=4: "====......"
// filled=0: ".........."
\\\`\\\`\\\`

## Your Task

1. Boss entity: id "BOSS_1", type 3, 200hp, size 60x40, position (170,40), sprite 'W'
2. Boss takes 40 damage each frame for 5 frames
3. Print each hit: \\\`BOSS_HIT|frame|<f>|damage|40|hp|<remaining>|bar|<healthbar>\\\`
4. Health bar: 10 chars, '=' for filled, '.' for empty
   - Frame 1: hp=160, bar=\\\`========..\\\`
   - Frame 2: hp=120, bar=\\\`======....\\\`
   - Frame 3: hp=80, bar=\\\`====......\\\`
   - Frame 4: hp=40, bar=\\\`==........\\\`
   - Frame 5: hp=0, bar=\\\`..........\\\`
5. Print: \\\`BOSS|frame|5|hp|0|status|DEFEATED\\\`
6. Print: \\\`BOSS_SUMMARY|total_hits|5|total_damage|200|frames_alive|5\\\`
7. Render boss 'W' on a 20x10 ASCII grid at center position

## Beginner Trap

**Common Mistake:** Using floating-point for the health bar. Integer math is sufficient and exact: \\\`filled = hp * 10 / maxHp\\\`. With hp=160, maxHp=200: 160*10=1600, 1600/200=8. No floats needed. Floats introduce rounding errors in what should be a discrete display.

## Elite Insight

Boss fights in commercial games use the same entity system with modifier flags. A "boss" flag might increase collision box size, enable health bar rendering, trigger music changes, and lock the arena. But the entity itself is processed by the same systems. The flag triggers behavior, not a separate code path. Your type field is that flag.

## Cross-Path Echo

HTTP status codes work this way. A 404 response uses the same TCP connection, same HTTP parser, same header format as a 200. The status code is a type field that changes how the client handles the response. Your boss type field changes how the game handles the entity. Same system, different behavior from a single integer.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;

int main() {
    // Boss entity
    string bossId = "BOSS_1";
    int bossHp = 200;
    int bossMaxHp = 200;
    int bossX = 170, bossY = 40;
    int bossW = 60, bossH = 40;
    char bossSprite = 'W';
    int bossType = 3;
    int damagePerHit = 40;

    // TODO: Run 5 frames of boss combat
    //   Each frame: apply 40 damage
    //   Calculate health bar: filled = bossHp * 10 / bossMaxHp
    //   Build 10-char bar: '=' for filled, '.' for empty
    //   Print BOSS_HIT line

    // TODO: Print BOSS defeated line

    // TODO: Print BOSS_SUMMARY line

    // TODO: Render 20x10 grid with boss 'W' at screen center
    //       Boss screen pos: sx=10, sy=4 (approximate center)

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;

int main() {
    string bossId = "BOSS_1";
    int bossHp = 200;
    int bossMaxHp = 200;
    int bossX = 170, bossY = 40;
    int bossW = 60, bossH = 40;
    char bossSprite = 'W';
    int bossType = 3;
    int damagePerHit = 40;
    int totalDamage = 0;
    int totalHits = 0;

    for (int frame = 1; frame <= 5; frame++) {
        bossHp -= damagePerHit;
        if (bossHp < 0) bossHp = 0;
        totalDamage += damagePerHit;
        totalHits++;

        int filled = bossHp * 10 / bossMaxHp;
        string bar = "";
        for (int i = 0; i < 10; i++) {
            bar += (i < filled) ? '=' : '.';
        }

        cout << "BOSS_HIT|frame|" << frame << "|damage|" << damagePerHit
             << "|hp|" << bossHp << "|bar|" << bar << endl;
    }

    cout << "BOSS|frame|5|hp|0|status|DEFEATED" << endl;
    cout << "BOSS_SUMMARY|total_hits|" << totalHits
         << "|total_damage|" << totalDamage
         << "|frames_alive|5" << endl;

    // Render grid with boss at center
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    // Boss at screen center (before defeat, for display purposes)
    int bsx = 10, bsy = 4;
    grid[bsy][bsx] = bossSprite;

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }

    return 0;
}
`,
    tests: [
      { id: "g1", description: "First hit reduces to 160hp", expectedOutput: "BOSS_HIT\\|frame\\|1\\|damage\\|40\\|hp\\|160\\|bar\\|========\\.\\.", isPattern: true },
      { id: "g2", description: "Third hit reduces to 80hp", expectedOutput: "BOSS_HIT\\|frame\\|3\\|damage\\|40\\|hp\\|80\\|bar\\|====", isPattern: true },
      { id: "g3", description: "Fifth hit kills boss", expectedOutput: "BOSS_HIT\\|frame\\|5\\|damage\\|40\\|hp\\|0\\|bar\\|\\.{10}", isPattern: true },
      { id: "g4", description: "Boss defeated status", expectedOutput: "BOSS\\|frame\\|5\\|hp\\|0\\|status\\|DEFEATED", isPattern: true },
      { id: "g5", description: "Boss summary correct", expectedOutput: "BOSS_SUMMARY\\|total_hits\\|5\\|total_damage\\|200\\|frames_alive\\|5", isPattern: true },
      { id: "g6", description: "Grid contains boss sprite", expectedOutput: "W", isPattern: true },
    ],
    hints: [
      "Health bar: filled = bossHp * 10 / bossMaxHp. At 160hp: 8 filled. At 120hp: 6 filled. At 0hp: 0 filled. Build string with a 10-iteration loop.",
      "Subtract damage before computing the bar. Frame 1: 200-40=160, then compute bar for 160. Frame 5: 40-40=0, bar is all dots.",
      "Grid rendering: initialize 20x10 with '.', place 'W' at approximate center (col 10, row 4). Print row by row.",
    ],
    estimatedMinutes: 8,
  },
};
