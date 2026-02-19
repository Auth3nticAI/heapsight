import { Lesson } from "@/types/lesson";

export const lessonRPG86: Lesson = {
  id: "rpg-86-accessibility-assist-mode",
  title: "Accessibility: Assist Mode",
  description: "Add a config-driven assist mode that halves incoming damage. One flag, one multiply, no code forks.",
  order: 86,
  xpReward: 100,
  tier: "pro",
  concepts: ["accessibility", "assist mode", "config-driven difficulty", "damage scaling", "inclusive design"],
  part1: {
    title: "Concept: Config-Driven Difficulty",
    type: "concept",
    instructions: `# Accessibility: Assist Mode

## Mental Model

Some players struggle with your damage numbers. They want to explore the
dungeon, learn the systems, enjoy the RPG — but they die too fast. If
your only option is "get good," you lose players who would love your game.
Fix: a single config flag that scales damage. One multiply, no code forks.
The combat system doesn't know about assist mode — it just uses
scaleDamage() on every incoming hit.

## What Breaks Without This

Without config-driven difficulty:
- Players who struggle have no recourse
- You scatter if (assist_mode) checks across the codebase
- Separate code paths go stale and diverge
- Accessibility becomes an afterthought, not architecture

## The Fix

One struct, one function, zero code forks:

\`\`\`cpp
struct GameConfig { int damage_scale; }; // 100 = normal, 50 = assist
int scaleDamage(int raw, const GameConfig& cfg) {
    return (raw * cfg.damage_scale) / 100;
}
\`\`\`

## Key Concepts

- **damage_scale**: integer percentage (100=normal, 50=half)
- **scaleDamage**: one multiply + one divide, applied to every hit
- **No code forks**: combat system is identical for all modes
- **Config-driven**: the flag comes from a config struct, not hardcoded

## Performance Insight

One integer multiply per damage event. Assist mode costs zero extra
performance. The scaling happens in the same pipeline as normal damage.

## Memory Insight

GameConfig is 4 bytes (one int). Lives in WorldState or global scope.
Loaded once at startup. Zero runtime memory impact.

## Your Task

Write scaleDamage. Apply it to a single 10-damage hit at 100% and 50%.
Print the scaled values to prove the function works.

## Beginner Trap

\`\`\`cpp
// BAD: Forking code paths
if (assist_mode) { player_hp -= damage / 2; }
else { player_hp -= damage; }
// FIX: Use scaleDamage() once — it handles all modes
\`\`\`

## Elite Insight

Celeste's Assist Mode lets players tweak game speed, stamina, and
invincibility — all via config values that scale existing systems.
No separate "easy mode" code. Architecture supports accessibility.

## Systems Thinking Connection

scaleDamage slots into the combat pass (L18). Every damage event
already flows through a pipeline — this adds one step.

## Skill Reinforcement

- Struct design from L11
- Integer arithmetic from L03
- Config pattern from L78 (data tables)

## Mastery Check

You pass when SCALE_TEST shows raw=10 scaling to 10 at 100%
and to 5 at 50%.`,
    starterCode: `#include <iostream>
using namespace std;

struct GameConfig { int damage_scale; };

// TODO: Write scaleDamage(int raw, const GameConfig& cfg)
// Return (raw * cfg.damage_scale) / 100

int main() {
    GameConfig normal = {100};
    GameConfig assist = {50};
    // TODO: Print SCALE_TEST|raw=10|normal=scaleDamage(10,normal)|assist=scaleDamage(10,assist)
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct GameConfig { int damage_scale; };

int scaleDamage(int raw, const GameConfig& cfg) {
    return (raw * cfg.damage_scale) / 100;
}

int main() {
    GameConfig normal = {100};
    GameConfig assist = {50};
    cout << "SCALE_TEST|raw=10|normal=" << scaleDamage(10, normal)
         << "|assist=" << scaleDamage(10, assist) << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Scale test output", expectedOutput: "SCALE_TEST|raw=10|normal=10|assist=5", isPattern: false },
    ],
    hints: [
      "scaleDamage returns (raw * cfg.damage_scale) / 100.",
      "At scale=100: (10 * 100) / 100 = 10. At scale=50: (10 * 50) / 100 = 5.",
      "Print both results on one line with SCALE_TEST| prefix.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Assist Mode Combat Demo",
    type: "game_builder",
    instructions: `# Build: Assist Mode Damage Scaling

## Mental Model

Part 1 proved scaleDamage works for single values. Now run a full
3-hit combat sequence at both normal (100%) and assist (50%) damage.
The same runCombat function handles both modes — only the config
changes. This proves zero code forks.

## What Breaks Without This

Without full combat testing:
- Scaling might work for one hit but accumulate rounding errors
- The "no code forks" claim is unproven
- Edge cases (low HP, overkill) aren't tested

## The Fix

runCombat takes a mode name and GameConfig. Applies 3 hits using
scaleDamage, prints each result. Call it twice with different configs.

## Key Concepts

- **Unified combat function**: one function, two configs
- **Damage accumulation**: HP -= scaleDamage(raw, cfg) each hit
- **Mode comparison**: normal kills (hp=-4), assist survives (hp=8)
- **Integer division**: (6 * 50) / 100 = 3, not 3.0

## Performance Insight

6 scaleDamage calls total (3 per mode). 6 multiplies + 6 divides.
Under 50 nanoseconds. The config struct is passed by const reference.

## Memory Insight

Two GameConfig structs on the stack (4 bytes each). The hits array
is stack-allocated. Total extra memory: ~20 bytes.

## Your Task

1. Write scaleDamage(int raw, const GameConfig& cfg)
2. Complete runCombat to apply 3 hits and print each
3. Run normal (scale=100) then assist (scale=50)
4. Print ASSIST|PASS|same code both modes

## Beginner Trap

\`\`\`cpp
// BAD: Separate combat functions per mode
void runNormalCombat() { hp -= damage; }
void runAssistCombat() { hp -= damage / 2; }
// FIX: One runCombat, different GameConfig values
\`\`\`

## Elite Insight

Hades lets players toggle "God Mode" (gradually increasing damage
resistance) mid-run. It's the same scaleDamage architecture —
one config value, applied to every hit.

## Mastery Check

You pass when normal mode shows final_hp=-4, assist mode shows
final_hp=8, and ASSIST|PASS confirms same code for both.`,
    starterCode: `#include <iostream>
using namespace std;

struct GameConfig { int damage_scale; };

// TODO: Write scaleDamage(int raw_damage, const GameConfig& cfg)
// Return (raw_damage * cfg.damage_scale) / 100

void runCombat(const char* mode_name, const GameConfig& cfg) {
    int hp = 20;
    int hits[] = {10, 6, 8};
    cout << "CONFIG|mode=" << mode_name << "|scale=" << cfg.damage_scale << endl;
    for (int i = 0; i < 3; i++) {
        // TODO: int scaled = scaleDamage(hits[i], cfg);
        // TODO: hp -= scaled;
        // TODO: Print HIT|raw=R|scaled=S|hp=H
    }
    cout << "RESULT|" << mode_name << "|final_hp=" << hp << endl;
}

int main() {
    // TODO: Run combat with normal config (scale=100)
    // TODO: Run combat with assist config (scale=50)
    // TODO: Print ASSIST|PASS|same code both modes
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct GameConfig { int damage_scale; };

int scaleDamage(int raw_damage, const GameConfig& cfg) {
    return (raw_damage * cfg.damage_scale) / 100;
}

void runCombat(const char* mode_name, const GameConfig& cfg) {
    int hp = 20;
    int hits[] = {10, 6, 8};
    cout << "CONFIG|mode=" << mode_name << "|scale=" << cfg.damage_scale << endl;
    for (int i = 0; i < 3; i++) {
        int scaled = scaleDamage(hits[i], cfg);
        hp -= scaled;
        cout << "HIT|raw=" << hits[i] << "|scaled=" << scaled << "|hp=" << hp << endl;
    }
    cout << "RESULT|" << mode_name << "|final_hp=" << hp << endl;
}

int main() {
    GameConfig normal = {100};
    GameConfig assist = {50};
    runCombat("normal", normal);
    runCombat("assist", assist);
    cout << "ASSIST|PASS|same code both modes" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Normal config", expectedOutput: "CONFIG|mode=normal|scale=100", isPattern: false },
      { id: "g2", description: "Normal damage applied", expectedOutput: "HIT|raw=10|scaled=10|hp=10", isPattern: false },
      { id: "g3", description: "Assist config", expectedOutput: "CONFIG|mode=assist|scale=50", isPattern: false },
      { id: "g4", description: "Assist damage halved", expectedOutput: "HIT|raw=10|scaled=5|hp=15", isPattern: false },
      { id: "g5", description: "Assist survives", expectedOutput: "RESULT|assist|final_hp=8", isPattern: false },
      { id: "g6", description: "Same code proof", expectedOutput: "ASSIST|PASS|same code both modes", isPattern: false },
    ],
    hints: [
      "scaleDamage returns (raw_damage * cfg.damage_scale) / 100. Integer division means 50% of 7 = 3.",
      "runCombat is the same function for both modes. Only the GameConfig changes.",
      "Create two GameConfig structs: {100} for normal, {50} for assist. Pass each to runCombat.",
    ],
    estimatedMinutes: 10,
  },
};