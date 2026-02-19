import { Lesson } from "@/types/lesson";

export const lessonRPG81: Lesson = {
  id: "rpg-81-hud-v2-layout",
  title: "HUD v2 Layout",
  description: "Redesign the HUD with clean formatting — HP bar, level indicator, gold count, quest tracker. Information architecture for ASCII games.",
  order: 81,
  xpReward: 100,
  tier: "pro",
  concepts: ["HUD design", "information architecture", "ASCII formatting", "status display", "visual clarity"],
  part1: {
    title: "Concept: Information Architecture for ASCII Games",
    type: "concept",
    instructions: `# HUD v2 Layout

## Mental Model

Your current HUD dumps raw numbers: HP: 17 Gold: 40 Turn: 5. It works,
but it's hard to scan. Players need to read HP at a glance in combat.
Raw numbers require mental parsing. Fix: render an HP bar using ASCII
characters. The bar gives instant visual feedback without reading digits.

## What Breaks Without This

Without visual HUD elements:
- Players must parse numbers under time pressure
- Health status isn't visible at a glance
- No visual distinction between full and critical HP
- The game feels like a spreadsheet, not an experience

## The Fix

Render an 8-character HP bar using # and -:

\`\`\`cpp
void renderHUD(int hp, int max_hp, int level, int gold, int turn) {
    int bars = (hp * 8) / max_hp;
    cout << "HP [";
    for (int i = 0; i < 8; i++) cout << (i < bars ? '#' : '-');
    cout << "] " << hp << "/" << max_hp;
    cout << " | Lv." << level << " | G:" << gold << " | T:" << turn << endl;
}
\`\`\`

## Key Concepts

- **HP bar**: 8 chars, # for filled, - for empty
- **bars = (hp * 8) / max_hp**: integer math maps HP to bar width
- **Abbreviated labels**: Lv., G:, T: save horizontal space
- **Pipe separators**: | between sections for visual grouping

## Performance Insight

Rendering the HUD is pure string output — no game state mutation.
A read-only pass over a few integers. Even with the bar calculation,
it's microseconds.

## Memory Insight

The HUD uses no extra memory — it reads directly from game state
and writes to cout. No buffers, no string allocations, no heap.

## Your Task

Write renderHUD that displays an HP bar with level, gold, and turn.
Call it once with full HP to verify the bar renders correctly.

## Beginner Trap

\`\`\`cpp
// BAD: Using string concatenation for HUD
string hud = "HP: " + to_string(hp);  // Heap allocation!
// FIX: Use cout << directly for zero-allocation output
\`\`\`

## Elite Insight

Nethack's HUD is a masterclass in ASCII information design: one line
shows HP, AC, level, gold, dungeon level, and status effects. Every
character is earned. That's the standard.

## Systems Thinking Connection

The HUD connects to the event queue (L77): events tell the UI WHAT
changed, the HUD renders the current state. Decoupled input/output.

## Skill Reinforcement

- Integer division from L03 (bullet math)
- Loop iteration from L07 (spawn wave loop)
- cout formatting from L01 (boot the system)

## Mastery Check

You pass when HUD_TEST shows a correctly formatted HP bar:
HP [########] 20/20 | Lv.1 | G:50 | T:1`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write renderHUD(int hp, int max_hp, int level, int gold, int turn)
// HP bar: 8 chars wide, # for filled, - for empty
// bars = (hp * 8) / max_hp
// Format: HP [########] hp/max_hp | Lv.level | G:gold | T:turn

int main() {
    // TODO: renderHUD(20, 20, 1, 50, 1)
    // Print HUD_TEST|PASS
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void renderHUD(int hp, int max_hp, int level, int gold, int turn) {
    int bars = (hp * 8) / max_hp;
    cout << "HP [";
    for (int i = 0; i < 8; i++) cout << (i < bars ? '#' : '-');
    cout << "] " << hp << "/" << max_hp;
    cout << " | Lv." << level << " | G:" << gold << " | T:" << turn << endl;
}

int main() {
    renderHUD(20, 20, 1, 50, 1);
    cout << "HUD_TEST|PASS" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Full HP bar rendered", expectedOutput: "HP [########] 20/20 | Lv.1 | G:50 | T:1", isPattern: false },
      { id: "t2", description: "HUD test passes", expectedOutput: "HUD_TEST|PASS", isPattern: false },
    ],
    hints: [
      "Calculate bars = (hp * 8) / max_hp. For 20/20, bars = 8 (all #).",
      "Loop 8 times: if i < bars print #, else print -.",
      "Use pipe | as separator between HP, level, gold, and turn sections.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Multi-State HUD Rendering",
    type: "game_builder",
    instructions: `# Build: HUD v2 with HP Bar

## Mental Model

Part 1 proved single-call HUD rendering. Now render the HUD across
3 different game states to show it updating: full HP, half HP, and
critical HP. This simulates what players see as combat progresses.

## What Breaks Without This

Without multi-state rendering:
- You can't verify the bar scales correctly at different HP values
- Edge cases (very low HP) might render incorrectly
- The visual feedback claim is untested

## The Fix

Call renderHUD with 3 different HP values. The bar should visually
reflect each state: full (########), half (####----), critical (#-------).

## Key Concepts

- **Bar scaling**: bars = (hp * 8) / max_hp works for all HP values
- **Visual states**: full, half, critical are instantly distinguishable
- **Integer truncation**: (3 * 8) / 20 = 1, so 3 HP shows 1 bar
- **Format consistency**: same layout at every HP level

## Performance Insight

3 HUD renders: 3 loops of 8 iterations + cout calls. ~30 microseconds
total. No allocations, no state changes, pure output.

## Memory Insight

renderHUD uses only stack variables (bars, loop counter). Zero heap.
The function is safe to call every frame without accumulating memory.

## Your Task

1. Write renderHUD with 8-char HP bar
2. Call with (20,20,1,50,1), (10,20,2,75,5), (3,20,3,100,10)
3. Verify all 3 bars render correctly

## Beginner Trap

\`\`\`cpp
// BAD: Hardcoding bar characters
if (hp > 15) cout << "########";
else if (hp > 10) cout << "####----";
// FIX: Calculate bars = (hp * 8) / max_hp, loop 8 times
\`\`\`

## Elite Insight

Dwarf Fortress renders multi-line HUDs with dozens of status indicators,
all using ASCII. The key is consistent formatting — players learn to
read positions, not labels.

## Mastery Check

You pass when all 3 HP bars render correctly: ########, ####----,
and #-------.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write renderHUD(int hp, int max_hp, int level, int gold, int turn)
// Format: HP [########] hp/max_hp | Lv.level | G:gold | T:turn
// HP bar is 8 chars: # for filled, - for empty
// bars = (hp * 8) / max_hp

int main() {
    // TODO: renderHUD(20, 20, 1, 50, 1)
    // TODO: renderHUD(10, 20, 2, 75, 5)
    // TODO: renderHUD(3, 20, 3, 100, 10)
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void renderHUD(int hp, int max_hp, int level, int gold, int turn) {
    int bars = (hp * 8) / max_hp;
    cout << "HP [";
    for (int i = 0; i < 8; i++) cout << (i < bars ? '#' : '-');
    cout << "] " << hp << "/" << max_hp;
    cout << " | Lv." << level << " | G:" << gold << " | T:" << turn << endl;
}

int main() {
    renderHUD(20, 20, 1, 50, 1);
    renderHUD(10, 20, 2, 75, 5);
    renderHUD(3, 20, 3, 100, 10);
    return 0;
}`,
    tests: [
      { id: "g1", description: "Full HP bar", expectedOutput: "HP [########] 20/20 | Lv.1 | G:50 | T:1", isPattern: false },
      { id: "g2", description: "Half HP bar", expectedOutput: "HP [####----] 10/20 | Lv.2 | G:75 | T:5", isPattern: false },
      { id: "g3", description: "Low HP bar", expectedOutput: "HP [#-------] 3/20 | Lv.3 | G:100 | T:10", isPattern: false },
    ],
    hints: [
      "Calculate bars = (hp * 8) / max_hp. Loop 8 times, print # if i < bars, else print -.",
      "Use cout << directly for all output. No string concatenation needed.",
      "The format uses | as separators: HP [...] hp/max | Lv.N | G:N | T:N.",
    ],
    estimatedMinutes: 10,
  },
};