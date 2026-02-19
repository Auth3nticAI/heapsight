import type { Lesson } from "@/types/lesson";

export const lesson62: Lesson = {
  id: "62-powerups-data",
  title: "Power-Ups Data",
  description: "Define power-up items with data-driven effects and timed durations.",
  order: 62,
  xpReward: 200,
  tier: "pro",
  concepts: ["power-up system", "item types", "effect application", "timed buffs"],
  part1: {
    title: "Concept: Power-Ups Data",
    type: "concept",
    instructions: `# Power-Ups Data — Hardcoded Abilities Do Not Scale

Hardcoding each power-up as a separate function creates a maintenance disaster. Add a new item and you write new logic, new variables, new edge cases. Data-driven design fixes this. Define power-ups as data: type, duration, magnitude. One system reads the data and applies effects. Adding a new power-up means adding a line of data, not a block of code.

## What Breaks Without This

Without data-driven power-ups, every new item requires code changes. Speed boost needs its own timer. Damage buff needs its own multiplier. Shield needs its own flag. Five power-ups means five separate systems. Twenty means twenty. The code grows linearly with content. Data-driven design grows content without growing code.

## The Fix

Define a PowerUp with three fields: type (string), duration (int, ticks), magnitude (int). Store active buffs with remaining ticks. Each frame, decrement timers. When a timer hits zero, remove the effect.

\\\`\\\`\\\`
struct PowerUp {
    string type;       // "speed_boost", "damage_up", "shield"
    int duration;      // ticks until expiry
    int magnitude;     // effect strength
};
\\\`\\\`\\\`

Parse definitions from data strings: \\\`"speed_boost,300,2"\\\`. Split on comma. Convert fields. One parser handles all types. One application system checks the type string and applies the effect. One timer system decrements and expires.

Lifecycle: define -> pickup -> apply effect -> tick timer -> expire -> revert effect.

## Your Task

1. Define 4 power-ups from data strings:
   - \\\`"speed_boost,300,2"\\\` — 300 ticks, 2x speed multiplier
   - \\\`"damage_up,200,15"\\\` — 200 ticks, +15 damage
   - \\\`"shield,150,1"\\\` — 150 ticks, absorb 1 hit
   - \\\`"spread_shot,100,5"\\\` — 100 ticks, 5-way spread
2. Parse each string: split by comma, extract type/duration/magnitude
3. Print each definition: \\\`POWERUP_DEF|<type>|duration|<dur>|magnitude|<mag>\\\`
4. Simulate: player picks up speed_boost at tick 5, damage_up at tick 10
5. Player base speed = 4, base damage = 10
6. Print on pickup: \\\`PICKUP|tick|<t>|type|<type>|player_speed|<old>-><new>\\\` (or player_damage for damage_up)
7. Print active buffs at tick 15: \\\`ACTIVE|tick|15|buffs|speed_boost(285)|damage_up(190)\\\`
8. Print when speed_boost expires at tick 305: \\\`EXPIRE|tick|305|type|speed_boost|player_speed|<old>-><new>\\\`
9. Print: \\\`POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1\\\`

Expected output:
\\\`\\\`\\\`
POWERUP_DEF|speed_boost|duration|300|magnitude|2
POWERUP_DEF|damage_up|duration|200|magnitude|15
POWERUP_DEF|shield|duration|150|magnitude|1
POWERUP_DEF|spread_shot|duration|100|magnitude|5
PICKUP|tick|5|type|speed_boost|player_speed|4->8
PICKUP|tick|10|type|damage_up|player_damage|10->25
ACTIVE|tick|15|buffs|speed_boost(285)|damage_up(190)
EXPIRE|tick|305|type|speed_boost|player_speed|8->4
POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct PowerUpDef {
    string type;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string type;
    int remaining;
    int magnitude;
    bool active;
};

int main() {
    // Power-up data strings (simulating data file)
    string defs[] = {
        "speed_boost,300,2",
        "damage_up,200,15",
        "shield,150,1",
        "spread_shot,100,5"
    };
    int numDefs = 4;

    PowerUpDef powerups[4];
    ActiveBuff buffs[4];
    int numBuffs = 0;

    int playerSpeed = 4;
    int playerDamage = 10;

    // TODO: Parse each def string — split by comma
    //   Extract type (before first comma)
    //   Extract duration (between commas)
    //   Extract magnitude (after second comma)
    //   Print POWERUP_DEF line

    // TODO: Simulate pickup at tick 5 (speed_boost) and tick 10 (damage_up)
    //   Apply effect: speed_boost multiplies speed, damage_up adds to damage
    //   Print PICKUP lines

    // TODO: At tick 15, print ACTIVE line showing remaining ticks

    // TODO: At tick 305, speed_boost expires. Revert speed. Print EXPIRE line

    // TODO: Print POWERUP_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct PowerUpDef {
    string type;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string type;
    int remaining;
    int magnitude;
    bool active;
};

int main() {
    string defs[] = {
        "speed_boost,300,2",
        "damage_up,200,15",
        "shield,150,1",
        "spread_shot,100,5"
    };
    int numDefs = 4;

    PowerUpDef powerups[4];
    ActiveBuff buffs[4];
    int numBuffs = 0;

    int playerSpeed = 4;
    int playerDamage = 10;

    // Parse definitions
    for (int i = 0; i < numDefs; i++) {
        string s = defs[i];
        int c1 = s.find(',');
        int c2 = s.find(',', c1 + 1);
        powerups[i].type = s.substr(0, c1);
        powerups[i].duration = stoi(s.substr(c1 + 1, c2 - c1 - 1));
        powerups[i].magnitude = stoi(s.substr(c2 + 1));

        cout << "POWERUP_DEF|" << powerups[i].type
             << "|duration|" << powerups[i].duration
             << "|magnitude|" << powerups[i].magnitude << endl;
    }

    // Tick 5: pickup speed_boost
    int oldSpeed = playerSpeed;
    playerSpeed *= powerups[0].magnitude;
    buffs[numBuffs].type = powerups[0].type;
    buffs[numBuffs].remaining = powerups[0].duration;
    buffs[numBuffs].magnitude = powerups[0].magnitude;
    buffs[numBuffs].active = true;
    numBuffs++;
    cout << "PICKUP|tick|5|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    // Tick 10: pickup damage_up
    int oldDamage = playerDamage;
    playerDamage += powerups[1].magnitude;
    buffs[numBuffs].type = powerups[1].type;
    buffs[numBuffs].remaining = powerups[1].duration;
    buffs[numBuffs].magnitude = powerups[1].magnitude;
    buffs[numBuffs].active = true;
    numBuffs++;
    cout << "PICKUP|tick|10|type|damage_up|player_damage|"
         << oldDamage << "->" << playerDamage << endl;

    // Tick 15: show active buffs
    // speed_boost picked up at 5, now tick 15 = 10 ticks passed, remaining = 300-10 = 290
    // damage_up picked up at 10, now tick 15 = 5 ticks passed, remaining = 200-5 = 195
    int speedRemain = powerups[0].duration - (15 - 5);
    int damageRemain = powerups[1].duration - (15 - 10);
    cout << "ACTIVE|tick|15|buffs|speed_boost(" << speedRemain
         << ")|damage_up(" << damageRemain << ")" << endl;

    // Tick 305: speed_boost expires (picked up at 5, duration 300)
    oldSpeed = playerSpeed;
    playerSpeed /= powerups[0].magnitude;
    cout << "EXPIRE|tick|305|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    // Summary: 4 defined, 2 picked up, damage_up still active, speed_boost expired
    cout << "POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Speed boost definition parsed", expectedOutput: "POWERUP_DEF\\|speed_boost\\|duration\\|300\\|magnitude\\|2", isPattern: true },
      { id: "t2", description: "Damage up definition parsed", expectedOutput: "POWERUP_DEF\\|damage_up\\|duration\\|200\\|magnitude\\|15", isPattern: true },
      { id: "t3", description: "Shield definition parsed", expectedOutput: "POWERUP_DEF\\|shield\\|duration\\|150\\|magnitude\\|1", isPattern: true },
      { id: "t4", description: "Speed boost pickup", expectedOutput: "PICKUP\\|tick\\|5\\|type\\|speed_boost\\|player_speed\\|4->8", isPattern: true },
      { id: "t5", description: "Damage up pickup", expectedOutput: "PICKUP\\|tick\\|10\\|type\\|damage_up\\|player_damage\\|10->25", isPattern: true },
      { id: "t6", description: "Active buffs at tick 15", expectedOutput: "ACTIVE\\|tick\\|15\\|buffs\\|speed_boost\\(\\d+\\)\\|damage_up\\(\\d+\\)", isPattern: true },
      { id: "t7", description: "Speed boost expires", expectedOutput: "EXPIRE\\|tick\\|305\\|type\\|speed_boost\\|player_speed\\|8->4", isPattern: true },
      { id: "t8", description: "Summary line", expectedOutput: "POWERUP_SUMMARY\\|defined\\|4\\|picked_up\\|2\\|active\\|1\\|expired\\|1", isPattern: true },
    ],
    hints: [
      "Use string::find(',') to locate comma positions. s.substr(0, c1) gives the type. s.substr(c1+1, c2-c1-1) gives the duration string. stoi() converts string to int.",
      "Speed boost multiplies: 4 * 2 = 8. Damage up adds: 10 + 15 = 25. On expiry, reverse the operation: speed /= magnitude, damage -= magnitude.",
      "Remaining ticks at tick 15: speed_boost was picked up at tick 5, so 15-5=10 ticks have passed, remaining = 300-10 = 290. damage_up picked up at tick 10: 15-10=5 passed, remaining = 200-5 = 195.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Power-Ups Data System",
    type: "game_builder",
    instructions: `# Game Builder: Power-Ups Data System — Items That Transform Gameplay

Power-ups turn a simple shooter into a dynamic experience. Speed boost lets the player dodge. Damage up melts enemies. Shield absorbs hits. Spread shot covers the screen. Each one changes the game feel without changing the game code. Define them as data, apply them as effects, expire them on timers. One system handles everything.

## What Breaks Without This

Without a data-driven power-up system, each new item requires its own code path. Speed boost needs a speed timer. Damage needs a damage timer. Shield needs a shield flag. The code doubles with each new item. Data-driven design means adding an item is adding a line of data. The system does not change.

## The Fix

Parse power-up definitions from data strings. Store active buffs with remaining durations. Each tick, decrement all buff timers. When a timer hits zero, revert the effect. The pickup-apply-tick-expire cycle handles every power-up type through one code path.

\\\`\\\`\\\`
// Parse: "speed_boost,300,2"
// Apply: playerSpeed *= magnitude
// Tick:  remaining--
// Expire: playerSpeed /= magnitude
\\\`\\\`\\\`

## Your Task

1. Parse 4 power-up definitions from data strings
2. Print: \\\`POWERUP_DEF|<type>|duration|<dur>|magnitude|<mag>\\\` for each
3. Player at (180, 300) with base speed 4, base damage 10
4. Simulate: speed_boost pickup at tick 5, damage_up pickup at tick 10
5. Print: \\\`PICKUP|tick|<t>|type|<type>|player_speed|<old>-><new>\\\` or player_damage
6. Show active buffs at tick 15: \\\`ACTIVE|tick|15|buffs|speed_boost(<remaining>)|damage_up(<remaining>)\\\`
7. Simulate speed_boost expiry at tick 305: \\\`EXPIRE|tick|305|type|speed_boost|player_speed|<old>-><new>\\\`
8. Print: \\\`POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1\\\`

## Beginner Trap

**Common Mistake:** Forgetting to revert the effect on expiry. If speed_boost multiplies speed by 2, expiry must divide by 2. If you just set speed back to base, you break stacking — what if the player has two speed buffs? Always reverse the exact operation.

## Elite Insight

Commercial games use a modifier stack. Instead of modifying the base stat, they push modifiers onto a stack and recompute: \\\`finalSpeed = baseSpeed * product(speedModifiers)\\\`. When a buff expires, remove the modifier and recompute. This handles stacking, ordering, and priority automatically. Your data-driven approach is the first step toward this architecture.

## Cross-Path Echo

CSS specificity works the same way. Multiple rules apply to an element. The browser stacks them, applies priority, and computes the final value. When a class is removed, the style recomputes without it. Your power-up stack is a real-time CSS cascade for game stats.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct PowerUpDef {
    string type;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string type;
    int remaining;
    int magnitude;
    bool active;
};

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerSpeed = 4;
int playerDamage = 10;
int score = 0;

// TODO: Write parsePowerUp(str, def) — parse "type,duration,magnitude"

// TODO: Write applyBuff(def, buffs, numBuffs) — activate a buff and apply effect

// TODO: Write expireBuff(buff) — revert effect when timer runs out

int main() {
    string defs[] = {
        "speed_boost,300,2",
        "damage_up,200,15",
        "shield,150,1",
        "spread_shot,100,5"
    };

    PowerUpDef powerups[4];
    ActiveBuff buffs[4];
    int numBuffs = 0;

    // TODO: Parse all definitions and print POWERUP_DEF lines

    // TODO: Simulate pickup events and buff lifecycle
    //   Print PICKUP, ACTIVE, EXPIRE, POWERUP_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct PowerUpDef {
    string type;
    int duration;
    int magnitude;
};

struct ActiveBuff {
    string type;
    int remaining;
    int magnitude;
    bool active;
};

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerSpeed = 4;
int playerDamage = 10;
int score = 0;

void parsePowerUp(string s, PowerUpDef &def) {
    int c1 = s.find(',');
    int c2 = s.find(',', c1 + 1);
    def.type = s.substr(0, c1);
    def.duration = stoi(s.substr(c1 + 1, c2 - c1 - 1));
    def.magnitude = stoi(s.substr(c2 + 1));
}

int main() {
    string defs[] = {
        "speed_boost,300,2",
        "damage_up,200,15",
        "shield,150,1",
        "spread_shot,100,5"
    };

    PowerUpDef powerups[4];
    ActiveBuff buffs[4];
    int numBuffs = 0;

    // Parse and print definitions
    for (int i = 0; i < 4; i++) {
        parsePowerUp(defs[i], powerups[i]);
        cout << "POWERUP_DEF|" << powerups[i].type
             << "|duration|" << powerups[i].duration
             << "|magnitude|" << powerups[i].magnitude << endl;
    }

    // Tick 5: pickup speed_boost
    int oldSpeed = playerSpeed;
    playerSpeed *= powerups[0].magnitude;
    buffs[numBuffs].type = powerups[0].type;
    buffs[numBuffs].remaining = powerups[0].duration;
    buffs[numBuffs].magnitude = powerups[0].magnitude;
    buffs[numBuffs].active = true;
    numBuffs++;
    cout << "PICKUP|tick|5|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    // Tick 10: pickup damage_up
    int oldDamage = playerDamage;
    playerDamage += powerups[1].magnitude;
    buffs[numBuffs].type = powerups[1].type;
    buffs[numBuffs].remaining = powerups[1].duration;
    buffs[numBuffs].magnitude = powerups[1].magnitude;
    buffs[numBuffs].active = true;
    numBuffs++;
    cout << "PICKUP|tick|10|type|damage_up|player_damage|"
         << oldDamage << "->" << playerDamage << endl;

    // Tick 15: show active buffs
    int speedRemain = powerups[0].duration - (15 - 5);
    int damageRemain = powerups[1].duration - (15 - 10);
    cout << "ACTIVE|tick|15|buffs|speed_boost(" << speedRemain
         << ")|damage_up(" << damageRemain << ")" << endl;

    // Tick 305: speed_boost expires
    oldSpeed = playerSpeed;
    playerSpeed /= powerups[0].magnitude;
    buffs[0].active = false;
    cout << "EXPIRE|tick|305|type|speed_boost|player_speed|"
         << oldSpeed << "->" << playerSpeed << endl;

    // Summary: 4 defined, 2 picked up, damage_up still active, speed_boost expired
    cout << "POWERUP_SUMMARY|defined|4|picked_up|2|active|1|expired|1" << endl;

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Speed boost definition parsed", expectedOutput: "POWERUP_DEF\\|speed_boost\\|duration\\|300\\|magnitude\\|2", isPattern: true },
      { id: "g2", description: "All 4 definitions parsed", expectedOutput: "POWERUP_DEF\\|spread_shot\\|duration\\|100\\|magnitude\\|5", isPattern: true },
      { id: "g3", description: "Speed boost pickup applied", expectedOutput: "PICKUP\\|tick\\|5\\|type\\|speed_boost\\|player_speed\\|4->8", isPattern: true },
      { id: "g4", description: "Damage up pickup applied", expectedOutput: "PICKUP\\|tick\\|10\\|type\\|damage_up\\|player_damage\\|10->25", isPattern: true },
      { id: "g5", description: "Active buffs at tick 15", expectedOutput: "ACTIVE\\|tick\\|15\\|buffs\\|speed_boost\\(\\d+\\)\\|damage_up\\(\\d+\\)", isPattern: true },
      { id: "g6", description: "Speed boost expires at tick 305", expectedOutput: "EXPIRE\\|tick\\|305\\|type\\|speed_boost\\|player_speed\\|8->4", isPattern: true },
      { id: "g7", description: "Summary line", expectedOutput: "POWERUP_SUMMARY\\|defined\\|4\\|picked_up\\|2\\|active\\|1\\|expired\\|1", isPattern: true },
    ],
    hints: [
      "Parse with string::find(',') to locate delimiters. Use substr() to extract between commas. stoi() converts the duration and magnitude substrings to integers.",
      "Speed boost multiplies: playerSpeed *= magnitude (4*2=8). Damage up adds: playerDamage += magnitude (10+15=25). On expiry, reverse: speed /= magnitude, damage -= magnitude.",
      "Remaining ticks at tick 15: speed_boost picked at tick 5, so 300-(15-5)=290 remaining. damage_up picked at tick 10, so 200-(15-10)=195 remaining.",
    ],
    estimatedMinutes: 10,
  },
};
