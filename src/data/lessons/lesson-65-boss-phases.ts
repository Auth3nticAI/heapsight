import type { Lesson } from "@/types/lesson";

export const lesson65: Lesson = {
  id: "65-boss-phases",
  title: "Boss Phases",
  description: "Boss switches attack patterns at HP thresholds for multi-phase encounters.",
  order: 65,
  xpReward: 200,
  tier: "pro",
  concepts: ["state machine", "phase transitions", "HP thresholds", "behavior change"],
  part1: {
    title: "Concept: Boss Phases",
    type: "concept",
    instructions: `# Boss Phases — Static Bosses Are Boring

A boss that does the same thing at 200 HP and 1 HP is a bullet sponge. The player has no reason to change tactics. Phases fix this. When the boss drops below 75% HP, it gets aggressive. Below 25%, it goes enraged. Each phase changes movement speed, shot count, and attack pattern. The fight evolves as HP decreases.

## What Breaks Without This

Without phases, boss fights are tedious. The player finds one safe spot and holds position for the entire fight. Nothing changes. Nothing escalates. The fight is a timer, not a challenge. Phases force the player to adapt. Each threshold introduces new danger and new tactics.

## The Fix

A state machine. One integer field: \\\`phase\\\`. Transitions based on HP thresholds. Each phase has different behavior values:

\\\`\\\`\\\`
Phase 1 (hp > 150): speed=1, shots=1    // calm
Phase 2 (hp 75-150): speed=2, shots=3   // aggressive
Phase 3 (hp < 75):  speed=4, shots=5    // enraged
\\\`\\\`\\\`

After applying damage each frame, check thresholds and update the phase. The movement and shooting systems read the phase to determine behavior. No separate boss update function — just a phase check after damage.

## Your Task

1. Boss starts at 200 HP, phase 1
2. Phase thresholds: phase 1 (hp > 150), phase 2 (75 < hp <= 150), phase 3 (hp <= 75)
3. Boss takes 50 damage per frame for 4 frames
4. After each hit, check phase and print:
   - \\\`BOSS_PHASE|frame|1|hp|200|phase|1|speed|1|shots|1\\\` (before damage)
   - Apply 50 damage, check transitions
5. Print transition when phase changes: append \\\`|TRANSITION\\\` to the line
6. Print: \\\`BOSS_PHASE|frame|1|hp|150|phase|2|speed|2|shots|3|TRANSITION\\\`
7. Print: \\\`BOSS_PHASES_SUMMARY|phases_entered|3|transitions|2\\\`

Expected output:
\\\`\\\`\\\`
BOSS_PHASE|frame|1|hp|150|phase|2|speed|2|shots|3|TRANSITION
BOSS_PHASE|frame|2|hp|100|phase|2|speed|2|shots|3
BOSS_PHASE|frame|3|hp|50|phase|3|speed|4|shots|5|TRANSITION
BOSS_PHASE|frame|4|hp|0|phase|3|speed|4|shots|5|DEFEATED
BOSS_PHASES_SUMMARY|phases_entered|3|transitions|2
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using if-else chains that re-enter phases. If you check hp < 75 first, then hp <= 150, a boss at 50hp matches both. Use ordered checks: check phase 3 first (hp <= 75), then phase 2 (hp <= 150), else phase 1. Or use explicit ranges.

## Elite Insight

State machines scale. A three-phase boss is a three-state machine. A ten-phase boss is a ten-state machine. The pattern is identical. Commercial boss fights use state machines with dozens of states — idle, approach, wind-up, attack, cooldown, stagger, transition-animation, and more. Your HP-threshold machine is the simplest form of the same architecture.

## Cross-Path Echo

Network protocol state machines follow the same pattern. TCP has states: LISTEN, SYN_SENT, ESTABLISHED, FIN_WAIT, CLOSED. Transitions happen on events (packets received). Your boss phase transitions happen on events (HP thresholds). Both are finite state machines with different trigger types.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int bossHp = 200;
    int bossMaxHp = 200;
    int phase = 1;
    int transitions = 0;
    int phasesEntered = 1; // starts in phase 1
    int damagePerFrame = 50;

    // Phase behavior lookup
    int phaseSpeed[] = {0, 1, 2, 4};  // index by phase
    int phaseShots[] = {0, 1, 3, 5};

    // TODO: Run 4 frames
    //   Each frame: apply 50 damage
    //   Check HP thresholds:
    //     hp > 150: phase 1
    //     75 < hp <= 150: phase 2
    //     hp <= 75: phase 3
    //   If phase changed, increment transitions and phasesEntered
    //   Print BOSS_PHASE line (with |TRANSITION if changed, |DEFEATED if hp<=0)

    // TODO: Print BOSS_PHASES_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int bossHp = 200;
    int bossMaxHp = 200;
    int phase = 1;
    int transitions = 0;
    int phasesEntered = 1;
    int damagePerFrame = 50;

    int phaseSpeed[] = {0, 1, 2, 4};
    int phaseShots[] = {0, 1, 3, 5};

    for (int frame = 1; frame <= 4; frame++) {
        bossHp -= damagePerFrame;
        if (bossHp < 0) bossHp = 0;

        int newPhase;
        if (bossHp <= 75) newPhase = 3;
        else if (bossHp <= 150) newPhase = 2;
        else newPhase = 1;

        bool transitioned = (newPhase != phase);
        if (transitioned) {
            transitions++;
            phasesEntered++;
            phase = newPhase;
        }

        cout << "BOSS_PHASE|frame|" << frame
             << "|hp|" << bossHp
             << "|phase|" << phase
             << "|speed|" << phaseSpeed[phase]
             << "|shots|" << phaseShots[phase];

        if (bossHp <= 0) cout << "|DEFEATED";
        else if (transitioned) cout << "|TRANSITION";

        cout << endl;
    }

    cout << "BOSS_PHASES_SUMMARY|phases_entered|" << phasesEntered
         << "|transitions|" << transitions << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 transitions to phase 2", expectedOutput: "BOSS_PHASE\\|frame\\|1\\|hp\\|150\\|phase\\|2\\|speed\\|2\\|shots\\|3\\|TRANSITION", isPattern: true },
      { id: "t2", description: "Frame 2 stays in phase 2", expectedOutput: "BOSS_PHASE\\|frame\\|2\\|hp\\|100\\|phase\\|2\\|speed\\|2\\|shots\\|3$", isPattern: true },
      { id: "t3", description: "Frame 3 transitions to phase 3", expectedOutput: "BOSS_PHASE\\|frame\\|3\\|hp\\|50\\|phase\\|3\\|speed\\|4\\|shots\\|5\\|TRANSITION", isPattern: true },
      { id: "t4", description: "Frame 4 boss defeated", expectedOutput: "BOSS_PHASE\\|frame\\|4\\|hp\\|0\\|phase\\|3\\|speed\\|4\\|shots\\|5\\|DEFEATED", isPattern: true },
      { id: "t5", description: "Summary shows 3 phases and 2 transitions", expectedOutput: "BOSS_PHASES_SUMMARY\\|phases_entered\\|3\\|transitions\\|2", isPattern: true },
    ],
    hints: [
      "Apply damage first, then check thresholds. Frame 1: 200-50=150. Since 150 <= 150, that is phase 2. Phase changed from 1 to 2, so print TRANSITION.",
      "Phase check order matters. Check hp <= 75 first (phase 3), then hp <= 150 (phase 2), else phase 1. This prevents 50hp from matching the phase 2 condition.",
      "Track the old phase before updating. If newPhase != oldPhase, it is a transition. Increment both transitions and phasesEntered counters.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Boss Phase System",
    type: "game_builder",
    instructions: `# Game Builder: Boss Phase System — The Fight That Evolves

Boss starts calm. One shot per frame. Slow movement. Then it drops below 75% HP and everything changes. Three-spread shots. Double speed. Below 25% HP: enraged. Five-spread, quadruple speed. The player who was coasting suddenly has to dodge, reposition, and fight for survival. This is what makes boss fights memorable.

## What Breaks Without This

A phaseless boss is a health bar countdown. The player watches a number decrease. Nothing surprises them. Nothing forces adaptation. Phases create narrative within combat. Phase 1 teaches the pattern. Phase 2 punishes complacency. Phase 3 tests mastery. Three acts in one encounter.

## The Fix

State integer. Threshold checks after damage. Behavior lookup arrays indexed by phase:

\\\`\\\`\\\`
// phase -> speed
int phaseSpeed[] = {0, 1, 2, 4};
// phase -> shot count
int phaseShots[] = {0, 1, 3, 5};

// After damage:
if (hp <= 75) phase = 3;
else if (hp <= 150) phase = 2;
else phase = 1;
\\\`\\\`\\\`

## Your Task

1. Boss: 200hp, starts phase 1
2. Phase 1 (hp > 150): speed=1, shots=1
3. Phase 2 (75 < hp <= 150): speed=2, shots=3 (3-spread)
4. Phase 3 (hp <= 75): speed=4, shots=5 (5-spread), enraged
5. Boss takes 50 damage per frame for 4 frames
6. Print per frame:
   - \\\`BOSS_PHASE|frame|1|hp|150|phase|2|speed|2|shots|3|TRANSITION\\\`
   - \\\`BOSS_PHASE|frame|2|hp|100|phase|2|speed|2|shots|3\\\`
   - \\\`BOSS_PHASE|frame|3|hp|50|phase|3|speed|4|shots|5|TRANSITION\\\`
   - \\\`BOSS_PHASE|frame|4|hp|0|phase|3|speed|4|shots|5|DEFEATED\\\`
7. Print: \\\`BOSS_PHASES_SUMMARY|phases_entered|3|transitions|2\\\`

## Beginner Trap

**Common Mistake:** Checking transitions with == instead of thresholds. If damage skips a value (boss goes from 80 to 30), a check for \\\`hp == 75\\\` misses the transition entirely. Always use <= or < comparisons against thresholds, not equality checks.

## Elite Insight

Commercial boss fights encode phase behavior in data tables, not if-else chains. A boss config file lists: phase number, HP threshold, movement pattern ID, attack pattern ID, sprite animation ID. The boss system reads the table and applies the current phase's row. Adding a phase means adding a row, not adding code. Your lookup arrays are the first step toward this architecture.

## Cross-Path Echo

Feature flags in deployment work the same way. At certain user counts (thresholds), you enable new features (phases). Under 1000 users: basic mode. Under 10000: add caching. Over 10000: add sharding. The system checks the threshold and activates the appropriate configuration. Your boss phases are feature flags for combat behavior.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int bossHp = 200;
    int bossMaxHp = 200;
    int phase = 1;
    int transitions = 0;
    int phasesEntered = 1;
    int damagePerFrame = 50;

    // Phase behavior tables
    int phaseSpeed[] = {0, 1, 2, 4};
    int phaseShots[] = {0, 1, 3, 5};

    // TODO: Run 4 frames
    //   Each frame: apply damage, check phase thresholds
    //   hp > 150: phase 1
    //   75 < hp <= 150: phase 2
    //   hp <= 75: phase 3
    //   Print BOSS_PHASE line with |TRANSITION or |DEFEATED as needed

    // TODO: Print BOSS_PHASES_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int bossHp = 200;
    int bossMaxHp = 200;
    int phase = 1;
    int transitions = 0;
    int phasesEntered = 1;
    int damagePerFrame = 50;

    int phaseSpeed[] = {0, 1, 2, 4};
    int phaseShots[] = {0, 1, 3, 5};

    for (int frame = 1; frame <= 4; frame++) {
        bossHp -= damagePerFrame;
        if (bossHp < 0) bossHp = 0;

        int newPhase;
        if (bossHp <= 75) newPhase = 3;
        else if (bossHp <= 150) newPhase = 2;
        else newPhase = 1;

        bool transitioned = (newPhase != phase);
        if (transitioned) {
            transitions++;
            phasesEntered++;
            phase = newPhase;
        }

        cout << "BOSS_PHASE|frame|" << frame
             << "|hp|" << bossHp
             << "|phase|" << phase
             << "|speed|" << phaseSpeed[phase]
             << "|shots|" << phaseShots[phase];

        if (bossHp <= 0) cout << "|DEFEATED";
        else if (transitioned) cout << "|TRANSITION";

        cout << endl;
    }

    cout << "BOSS_PHASES_SUMMARY|phases_entered|" << phasesEntered
         << "|transitions|" << transitions << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 transitions to phase 2", expectedOutput: "BOSS_PHASE\\|frame\\|1\\|hp\\|150\\|phase\\|2\\|speed\\|2\\|shots\\|3\\|TRANSITION", isPattern: true },
      { id: "t2", description: "Frame 2 stays in phase 2", expectedOutput: "BOSS_PHASE\\|frame\\|2\\|hp\\|100\\|phase\\|2\\|speed\\|2\\|shots\\|3$", isPattern: true },
      { id: "t3", description: "Frame 3 enters phase 3 enraged", expectedOutput: "BOSS_PHASE\\|frame\\|3\\|hp\\|50\\|phase\\|3\\|speed\\|4\\|shots\\|5\\|TRANSITION", isPattern: true },
      { id: "t4", description: "Frame 4 boss defeated", expectedOutput: "BOSS_PHASE\\|frame\\|4\\|hp\\|0\\|phase\\|3\\|speed\\|4\\|shots\\|5\\|DEFEATED", isPattern: true },
      { id: "t5", description: "Summary shows phases and transitions", expectedOutput: "BOSS_PHASES_SUMMARY\\|phases_entered\\|3\\|transitions\\|2", isPattern: true },
    ],
    hints: [
      "Apply damage first: 200-50=150. Then check thresholds. 150 <= 150 is true, so phase 2. Compare with old phase (1) — different, so it is a transition.",
      "Frame 3: 100-50=50. Check: 50 <= 75 is true, so phase 3. Phase changed from 2 to 3 — transition. Frame 4: 50-50=0. Still phase 3 (0 <= 75). No transition, but DEFEATED.",
      "Use lookup arrays for speed and shots: phaseSpeed[phase] and phaseShots[phase]. Index 1 gives phase 1 values, index 2 gives phase 2, index 3 gives phase 3.",
    ],
    estimatedMinutes: 8,
  },
};
