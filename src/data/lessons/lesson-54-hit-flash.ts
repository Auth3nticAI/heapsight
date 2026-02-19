import type { Lesson } from "@/types/lesson";

export const lesson54: Lesson = {
  id: "54-hit-flash",
  title: "Hit Flash",
  description: "Flash enemies on hit for immediate visual damage feedback.",
  order: 54,
  xpReward: 200,
  tier: "pro",
  concepts: ["visual feedback", "state timer", "flash effect", "damage indication"],
  part1: {
    title: "Concept: Timer-Based Visual State",
    type: "concept",
    instructions: `# Hit Flash — Players Need to See Damage

You shoot an enemy. Nothing happens visually. The HP goes down internally but the player has no idea. Without visual feedback, your game feels broken. Hit flash solves this: on damage, swap the entity's sprite for a few frames. The player sees the flash and knows the hit landed. Three frames is enough. More than five is distracting. This is a timer-driven state change — the simplest form of visual feedback in games.

## What Breaks Without This

Without hit flash, combat feels dead. The player fires, the enemy eventually disappears, but there is no moment-to-moment confirmation that shots are connecting. Players stop trusting their aim. They spam fire because they cannot tell if bullets are landing. Every shipped game has hit feedback — flash, shake, particles, sound. Flash is the cheapest and most effective.

## The Fix

Add a \\\`flashTimer\\\` field to each entity. Default is 0. On hit, set \\\`flashTimer = 3\\\`. Each tick, if \\\`flashTimer > 0\\\`, decrement it. While flashing, render the entity with an alternate character (e.g., \\\`X\\\` instead of \\\`v\\\`). When the timer reaches 0, restore the normal sprite.

\\\`\\\`\\\`
// On hit:
flashTimer[i] = 3;
sprite[i] = 'X';

// Each tick:
if (flashTimer[i] > 0) {
    flashTimer[i]--;
    if (flashTimer[i] == 0) {
        sprite[i] = 'v';  // restore
    }
}
\\\`\\\`\\\`

The pattern is universal: state change, timer countdown, restore. Animation frames, invulnerability windows, power-up durations — all use this exact structure.

## Your Task

1. Create 3 entities: enemy_0, enemy_1, enemy_2 with sprite \\\`v\\\` and flashTimer = 0
2. At tick 2, hit enemy_1: set flashTimer = 3, sprite = \\\`X\\\`
3. Run flashSystem each tick (ticks 1-6): if flashTimer > 0, decrement; if reaches 0, restore sprite to \\\`v\\\`
4. Print flash events:
   - \\\`FLASH|tick|2|enemy_1|start|sprite|X|timer|3\\\`
   - \\\`FLASH|tick|3|enemy_1|active|sprite|X|timer|2\\\`
   - \\\`FLASH|tick|4|enemy_1|active|sprite|X|timer|1\\\`
   - \\\`FLASH|tick|5|enemy_1|end|sprite|v|timer|0\\\`
5. Print render state at tick 2 and tick 5:
   - \\\`RENDER|tick|2|enemy_1|X\\\`
   - \\\`RENDER|tick|5|enemy_1|v\\\`
6. Print: \\\`FLASH_SUMMARY|entity|enemy_1|duration|3|restored|true\\\`

Expected output:
\\\`\\\`\\\`
FLASH|tick|2|enemy_1|start|sprite|X|timer|3
RENDER|tick|2|enemy_1|X
FLASH|tick|3|enemy_1|active|sprite|X|timer|2
FLASH|tick|4|enemy_1|active|sprite|X|timer|1
FLASH|tick|5|enemy_1|end|sprite|v|timer|0
RENDER|tick|5|enemy_1|v
FLASH_SUMMARY|entity|enemy_1|duration|3|restored|true
\\\`\\\`\\\`

The timer starts at 3 on tick 2. Decrements each subsequent tick. By tick 5 it reaches 0 and the sprite restores.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 3;
char sprite[MAX_ENTITIES];
int flashTimer[MAX_ENTITIES];
string names[] = {"enemy_0", "enemy_1", "enemy_2"};

// TODO: Write flashSystem(count) — for each entity:
//   if flashTimer[i] > 0, decrement flashTimer[i]
//   if flashTimer[i] reaches 0, restore sprite[i] to 'v'

int main() {
    // Init all entities: sprite='v', flashTimer=0
    for (int i = 0; i < MAX_ENTITIES; i++) {
        sprite[i] = 'v';
        flashTimer[i] = 0;
    }

    // TODO: Simulate ticks 1-6
    //   At tick 2: hit enemy_1 — set flashTimer[1]=3, sprite[1]='X'
    //     Print FLASH start line and RENDER line
    //   Each tick: run flashSystem
    //     If enemy_1 flashTimer was > 0 before decrement, print FLASH line
    //     At tick 5: print RENDER line showing restored sprite

    // TODO: Print FLASH_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 3;
char sprite[MAX_ENTITIES];
int flashTimer[MAX_ENTITIES];
string names[] = {"enemy_0", "enemy_1", "enemy_2"};

void flashSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (flashTimer[i] > 0) {
            flashTimer[i]--;
            if (flashTimer[i] == 0) {
                sprite[i] = 'v';
            }
        }
    }
}

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        sprite[i] = 'v';
        flashTimer[i] = 0;
    }

    for (int tick = 1; tick <= 6; tick++) {
        // Hit enemy_1 at tick 2
        if (tick == 2) {
            flashTimer[1] = 3;
            sprite[1] = 'X';
            cout << "FLASH|tick|2|enemy_1|start|sprite|X|timer|3" << endl;
            cout << "RENDER|tick|2|enemy_1|X" << endl;
        }

        // Run flash system (after hit application)
        if (tick > 2) {
            int prevTimer = flashTimer[1];
            flashSystem(MAX_ENTITIES);
            if (prevTimer > 0) {
                if (flashTimer[1] > 0) {
                    cout << "FLASH|tick|" << tick << "|enemy_1|active|sprite|X|timer|" << flashTimer[1] << endl;
                } else {
                    cout << "FLASH|tick|" << tick << "|enemy_1|end|sprite|v|timer|0" << endl;
                    cout << "RENDER|tick|5|enemy_1|v" << endl;
                }
            }
        }
    }

    cout << "FLASH_SUMMARY|entity|enemy_1|duration|3|restored|true" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Flash starts on hit at tick 2", expectedOutput: "FLASH\\|tick\\|2\\|enemy_1\\|start\\|sprite\\|X\\|timer\\|3", isPattern: true },
      { id: "t2", description: "Render shows X during flash", expectedOutput: "RENDER\\|tick\\|2\\|enemy_1\\|X", isPattern: true },
      { id: "t3", description: "Flash active during countdown", expectedOutput: "FLASH\\|tick\\|3\\|enemy_1\\|active\\|sprite\\|X\\|timer\\|2", isPattern: true },
      { id: "t4", description: "Flash ends and sprite restores", expectedOutput: "FLASH\\|tick\\|5\\|enemy_1\\|end\\|sprite\\|v\\|timer\\|0", isPattern: true },
      { id: "t5", description: "Render shows restored sprite", expectedOutput: "RENDER\\|tick\\|5\\|enemy_1\\|v", isPattern: true },
      { id: "t6", description: "Flash summary confirms restoration", expectedOutput: "FLASH_SUMMARY\\|entity\\|enemy_1\\|duration\\|3\\|restored\\|true", isPattern: true },
    ],
    hints: [
      "The flash timer starts at 3 on tick 2. The flashSystem runs on ticks 3, 4, 5. After tick 3: timer=2. After tick 4: timer=1. After tick 5: timer=0 and sprite restores to 'v'.",
      "Do not run flashSystem on tick 2 itself — the hit just happened. Start decrementing on tick 3. This gives the full 3 ticks of visual flash.",
      "Track the previous timer value before calling flashSystem. If prevTimer > 0 and current timer == 0, the flash just ended. That is when you print the 'end' line and restore.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Hit Flash System",
    type: "game_builder",
    instructions: `# Game Builder: Hit Flash System

Entities need visual feedback when they take damage. The hit flash system adds a \\\`flashTimer\\\` field to every entity. When a bullet hits an enemy, the enemy's sprite swaps to \\\`X\\\` and the timer starts counting down. Each tick, the flash system decrements active timers. When the timer hits zero, the sprite restores. This is the first visual polish system — it makes combat feel responsive.

## Your Task

1. Add \\\`flashTimer\\\` and \\\`sprite\\\` arrays to the entity pool
2. Init 3 enemies: sprite='v', flashTimer=0, names: enemy_0, enemy_1, enemy_2
3. At tick 2: hit enemy_1 — set flashTimer=3, change sprite to 'X'
4. Run flashSystem each tick after the hit: decrement flashTimer for all entities with timer > 0
5. When flashTimer reaches 0, restore sprite to 'v'
6. Print flash events:
   - \\\`FLASH|tick|2|enemy_1|start|sprite|X|timer|3\\\`
   - \\\`FLASH|tick|3|enemy_1|active|sprite|X|timer|2\\\`
   - \\\`FLASH|tick|4|enemy_1|active|sprite|X|timer|1\\\`
   - \\\`FLASH|tick|5|enemy_1|end|sprite|v|timer|0\\\`
7. Print render lines:
   - \\\`RENDER|tick|2|enemy_1|X\\\`
   - \\\`RENDER|tick|5|enemy_1|v\\\`
8. Print: \\\`FLASH_SUMMARY|entity|enemy_1|duration|3|restored|true\\\`

## Beginner Trap

**Common Mistake:** Decrementing the flash timer on the same tick as the hit. The player needs to see the flash sprite for the full duration. If you decrement immediately, the flash is one frame shorter than intended. Apply the hit first, render, then start decrementing next tick.

## Elite Insight

Production engines batch visual state changes. Flash, tint, scale pulse, particle burst — all triggered by the same damage event. The flash timer pattern generalizes to any timed visual state. Animation systems are arrays of timers with associated state transitions.

## Cross-Path Echo

Network timeout indicators use the same pattern. A request fails, the UI shows a red flash for 3 seconds, then restores. Timer starts on error, counts down, restores default state. Every "temporary visual state" in any application is a flash timer.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 3;
char sprite[MAX_ENTITIES];
int flashTimer[MAX_ENTITIES];
string names[] = {"enemy_0", "enemy_1", "enemy_2"};

// TODO: Write flashSystem(count) — for each entity:
//   if flashTimer[i] > 0, decrement
//   if flashTimer[i] reaches 0, restore sprite to 'v'

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        sprite[i] = 'v';
        flashTimer[i] = 0;
    }

    // TODO: Simulate ticks 1-6
    //   At tick 2: hit enemy_1 (flashTimer=3, sprite='X')
    //   Print FLASH and RENDER lines per specification
    //   Run flashSystem each tick after the hit

    // TODO: Print FLASH_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 3;
char sprite[MAX_ENTITIES];
int flashTimer[MAX_ENTITIES];
string names[] = {"enemy_0", "enemy_1", "enemy_2"};

void flashSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (flashTimer[i] > 0) {
            flashTimer[i]--;
            if (flashTimer[i] == 0) {
                sprite[i] = 'v';
            }
        }
    }
}

int main() {
    for (int i = 0; i < MAX_ENTITIES; i++) {
        sprite[i] = 'v';
        flashTimer[i] = 0;
    }

    for (int tick = 1; tick <= 6; tick++) {
        if (tick == 2) {
            flashTimer[1] = 3;
            sprite[1] = 'X';
            cout << "FLASH|tick|2|enemy_1|start|sprite|X|timer|3" << endl;
            cout << "RENDER|tick|2|enemy_1|X" << endl;
        }

        if (tick > 2) {
            int prevTimer = flashTimer[1];
            flashSystem(MAX_ENTITIES);
            if (prevTimer > 0) {
                if (flashTimer[1] > 0) {
                    cout << "FLASH|tick|" << tick << "|enemy_1|active|sprite|X|timer|" << flashTimer[1] << endl;
                } else {
                    cout << "FLASH|tick|" << tick << "|enemy_1|end|sprite|v|timer|0" << endl;
                    cout << "RENDER|tick|5|enemy_1|v" << endl;
                }
            }
        }
    }

    cout << "FLASH_SUMMARY|entity|enemy_1|duration|3|restored|true" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Flash starts on hit", expectedOutput: "FLASH\\|tick\\|2\\|enemy_1\\|start\\|sprite\\|X\\|timer\\|3", isPattern: true },
      { id: "t2", description: "Render shows flash sprite", expectedOutput: "RENDER\\|tick\\|2\\|enemy_1\\|X", isPattern: true },
      { id: "t3", description: "Flash active with countdown", expectedOutput: "FLASH\\|tick\\|\\d+\\|enemy_1\\|active\\|sprite\\|X\\|timer\\|\\d+", isPattern: true },
      { id: "t4", description: "Flash ends at timer zero", expectedOutput: "FLASH\\|tick\\|5\\|enemy_1\\|end\\|sprite\\|v\\|timer\\|0", isPattern: true },
      { id: "t5", description: "Render shows restored sprite", expectedOutput: "RENDER\\|tick\\|5\\|enemy_1\\|v", isPattern: true },
      { id: "t6", description: "Flash summary printed", expectedOutput: "FLASH_SUMMARY\\|entity\\|enemy_1\\|duration\\|3\\|restored\\|true", isPattern: true },
    ],
    hints: [
      "Hit happens at tick 2. FlashSystem runs starting tick 3. Timer goes 3 -> 2 (tick 3), 2 -> 1 (tick 4), 1 -> 0 (tick 5). Three ticks of visible flash.",
      "Check if prevTimer was > 0 before calling flashSystem. If after the call flashTimer[1] == 0, the flash just ended — print the 'end' line.",
      "The RENDER lines only print at tick 2 (showing 'X') and tick 5 (showing 'v'). Do not print RENDER on every tick.",
    ],
    estimatedMinutes: 10,
  },
};
