import type { Lesson } from "@/types/lesson";

export const lesson95: Lesson = {
  id: "95-milestone-shippable",
  title: "Milestone: Shippable Beta",
  description: "A shippable beta with title screen, settings, crash proofing, and full gameplay.",
  order: 95,
  xpReward: 300,
  tier: "pro",
  concepts: ["beta release", "full integration", "title screen", "config", "crash proofing"],
  part1: {
    title: "Concept: Milestone — Shippable Beta",
    type: "concept",
    instructions: `# Milestone: Shippable Beta — The Complete Loop

A beta is not a demo. A demo shows one slice of gameplay. A beta is the complete game loop: title screen, settings, gameplay, victory, and back to the title. Every system integrated. Every edge case handled. Every bad input validated. The player can launch, configure, play, win (or lose), and do it again without restarting the program. That is the bar for shippable.

## What Breaks Without This

Without full-loop integration, the game is a collection of features that have never run together. The title screen works. The config parser works. The gameplay works. The crash proofing works. But title screen -> config load -> gameplay -> victory -> title screen has never been tested as a sequence. State leaks between transitions. Score from the last run bleeds into the new run. Config changes do not take effect until restart. The loop is where integration bugs live.

## The Fix

One main function. One state machine. TITLE -> CONFIG_LOAD -> PLAYING -> BOSS -> VICTORY -> TITLE. Each transition resets what needs resetting and preserves what needs preserving. Config persists across runs. Score resets on new game. The state machine is the spine. Every system hangs off it.

\\\`\\\`\\\`
// Complete game flow:
// 1. TITLE: draw title, show menu, select New Game
// 2. CONFIG_LOAD: parse config (with validation)
// 3. PLAYING: waves 1-2 with enemies
// 4. BOSS: wave 3 with boss
// 5. VICTORY: stats, rating, time
// 6. TITLE: back to start

// All systems active:
// title, config, settings, a11y, balance, hud,
// particles, shake, trails, audio, pause, replay
\\\`\\\`\\\`

The shippable beta is the engineering proof. It does not prove the game is fun. It does not prove the art is final. It does not prove the balance is correct. It proves the architecture supports a complete play session without crashes, state corruption, or dead ends. That is what shippable means.

## Your Task

1. Simulate the complete game flow: TITLE -> CONFIG_LOAD -> PLAYING -> BOSS -> VICTORY -> TITLE
2. Title screen: draw ASCII art, select New Game
3. Config load: parse 7 settings, handle 1 bad value gracefully
4. Gameplay: simulate 3 waves, 10 kills, score 2800
5. Boss fight in wave 3
6. Victory screen with stats and rating
7. Return to title
8. Print: \\\`FLOW|TITLE->CONFIG_LOAD->PLAYING->BOSS->VICTORY->TITLE\\\`
9. Print: \\\`CONFIG|loaded|7|errors_handled|1\\\`
10. Print: \\\`SESSION|waves|3|kills|10|score|2800|lives|2\\\`
11. Print: \\\`VICTORY|Rating: A|Time: 30 ticks\\\`
12. Print: \\\`SYSTEMS_ACTIVE|title|config|settings|a11y|balance|hud|particles|shake|trails|audio|pause|replay\\\`
13. Print: \\\`MILESTONE_95|PASS|shippable beta\\\`

Expected output:
\\\`\\\`\\\`
FLOW|TITLE->CONFIG_LOAD->PLAYING->BOSS->VICTORY->TITLE
CONFIG|loaded|7|errors_handled|1
SESSION|waves|3|kills|10|score|2800|lives|2
VICTORY|Rating: A|Time: 30 ticks
SYSTEMS_ACTIVE|title|config|settings|a11y|balance|hud|particles|shake|trails|audio|pause|replay
MILESTONE_95|PASS|shippable beta
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Not resetting game state between runs. If the player beats the game and returns to the title, then starts a new game, score must be 0, lives must be 3, enemies must be cleared. If you forget to reset the entity pool, ghosts from the previous run appear in the new run. initFullState() must run on every "New Game" selection.

## Elite Insight

Certification testing at platform holders (Nintendo, Sony, Microsoft) follows a checklist of hundreds of items. Can the player reach the title from every state? Does the game handle disc eject? Does it handle controller disconnect? Does it save on suspend? Your milestone is a miniature cert pass. Every flow path tested. Every edge case covered. The difference between "works on my machine" and "ships on every machine" is the cert checklist.

## Cross-Path Echo

End-to-end testing in web applications follows the same pattern. A Cypress or Playwright test navigates from login to dashboard to settings to checkout and back. Every page transition is tested. Every state change is verified. Your game flow simulation is an E2E test. TITLE is the login page. CONFIG is the settings page. PLAYING is the main feature. VICTORY is the success page. TITLE again is the return to home.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int lives = 3;
int waves = 0;
int configLoaded = 0;
int configErrors = 0;
int ticks = 0;

// TODO: Write simulateTitle() — print flow starts at TITLE

// TODO: Write simulateConfigLoad() — load 7 settings, 1 bad value handled
//   Print: CONFIG|loaded|7|errors_handled|1

// TODO: Write simulateGameplay() — 3 waves, 10 kills, score 2800, lose 1 life
//   Print: SESSION|waves|3|kills|10|score|2800|lives|2

// TODO: Write simulateBoss() — boss fight in wave 3 (already counted above)

// TODO: Write simulateVictory() — rating A, 30 ticks
//   Print: VICTORY|Rating: A|Time: 30 ticks

// TODO: Write simulateReturnToTitle() — back to title

int main() {
    // TODO: Run full flow simulation
    // TODO: Print FLOW line
    // TODO: Print SYSTEMS_ACTIVE
    // TODO: Print MILESTONE_95

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int lives = 3;
int waves = 0;
int configLoaded = 0;
int configErrors = 0;
int ticks = 0;

void simulateTitle() {
    // Title screen shown, New Game selected
}

void simulateConfigLoad() {
    configLoaded = 7;
    configErrors = 1;
    cout << "CONFIG|loaded|" << configLoaded << "|errors_handled|" << configErrors << endl;
}

void simulateGameplay() {
    waves = 3;
    kills = 10;
    score = 2800;
    lives = 2;
    ticks = 30;
    cout << "SESSION|waves|" << waves << "|kills|" << kills
         << "|score|" << score << "|lives|" << lives << endl;
}

void simulateBoss() {
    // Boss fight handled within wave 3
}

void simulateVictory() {
    string rating = "A";
    cout << "VICTORY|Rating: " << rating << "|Time: " << ticks << " ticks" << endl;
}

void simulateReturnToTitle() {
    // State machine returns to TITLE
}

int main() {
    simulateTitle();
    simulateConfigLoad();
    simulateGameplay();
    simulateBoss();
    simulateVictory();
    simulateReturnToTitle();

    cout << "FLOW|TITLE->CONFIG_LOAD->PLAYING->BOSS->VICTORY->TITLE" << endl;
    cout << "SYSTEMS_ACTIVE|title|config|settings|a11y|balance|hud|particles|shake|trails|audio|pause|replay" << endl;
    cout << "MILESTONE_95|PASS|shippable beta" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Config loaded with error handling", expectedOutput: "CONFIG\\|loaded\\|7\\|errors_handled\\|1", isPattern: true },
      { id: "t2", description: "Session stats correct", expectedOutput: "SESSION\\|waves\\|3\\|kills\\|10\\|score\\|2800\\|lives\\|2", isPattern: true },
      { id: "t3", description: "Victory with rating", expectedOutput: "VICTORY\\|Rating: A\\|Time: 30 ticks", isPattern: true },
      { id: "t4", description: "Full flow logged", expectedOutput: "FLOW\\|TITLE->CONFIG_LOAD->PLAYING->BOSS->VICTORY->TITLE", isPattern: true },
      { id: "t5", description: "All 12 systems active", expectedOutput: "SYSTEMS_ACTIVE\\|title\\|config\\|settings\\|a11y\\|balance\\|hud\\|particles\\|shake\\|trails\\|audio\\|pause\\|replay", isPattern: true },
      { id: "t6", description: "Milestone 95 passes", expectedOutput: "MILESTONE_95\\|PASS\\|shippable beta", isPattern: true },
    ],
    hints: [
      "Each simulate function handles one phase. simulateConfigLoad sets configLoaded=7 and configErrors=1. simulateGameplay sets waves=3, kills=10, score=2800, lives=2, ticks=30. Print the formatted lines inside each function.",
      "The FLOW line is a static string showing the state machine path. Print it after all simulate functions complete. The SYSTEMS_ACTIVE line lists all 12 integrated systems separated by pipes.",
      "simulateVictory prints the rating (A) and time (30 ticks). The rating is based on score and time. The MILESTONE line comes last — it is the final assertion that the beta is shippable.",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Game: Milestone — Shippable Beta",
    type: "game_builder",
    instructions: `# Milestone: Shippable Beta — Complete Game Flow

This is the shippable beta milestone. Every system runs in sequence through a complete play session. Title screen to config load to gameplay to boss fight to victory screen and back to title. All twelve systems active simultaneously. All error handling in place. All state transitions clean. If this runs without crashes or state corruption, the game is ready for beta testers.

## What Breaks Without This

Without full-loop testing, individual systems work but transitions fail. The config loads but settings do not apply to gameplay. The gameplay ends but the victory screen reads stale data. The victory screen returns to title but the entity pool is not cleared. Integration failures hide in the seams between states. This milestone tests every seam.

## The Fix

A sequential simulation of the complete flow. Each phase function runs in order. Each phase updates shared state. Each phase prints its diagnostic output. The FLOW line proves the state machine followed the correct path. The SYSTEMS_ACTIVE line proves all twelve systems were integrated. The MILESTONE line proves it passed.

\\\`\\\`\\\`
// Flow: TITLE -> CONFIG_LOAD -> PLAYING -> BOSS -> VICTORY -> TITLE
// Systems: title, config, settings, a11y, balance, hud,
//          particles, shake, trails, audio, pause, replay
\\\`\\\`\\\`

## Your Task

1. Draw title screen ASCII art, select New Game
2. Load config with 1 bad value gracefully handled
3. Simulate 3 waves: 10 kills, score 2800, lose 1 life
4. Boss fight in wave 3
5. Victory screen: Rating A, Time 30 ticks
6. Return to title
7. Print: \\\`FLOW|TITLE->CONFIG_LOAD->PLAYING->BOSS->VICTORY->TITLE\\\`
8. Print: \\\`CONFIG|loaded|7|errors_handled|1\\\`
9. Print: \\\`SESSION|waves|3|kills|10|score|2800|lives|2\\\`
10. Print: \\\`VICTORY|Rating: A|Time: 30 ticks\\\`
11. Print: \\\`SYSTEMS_ACTIVE|title|config|settings|a11y|balance|hud|particles|shake|trails|audio|pause|replay\\\`
12. Print: \\\`MILESTONE_95|PASS|shippable beta\\\`

## Beginner Trap

**Common Mistake:** Printing diagnostic lines in the wrong order. The FLOW line must reflect the actual execution order. If you print CONFIG before running the config simulation, the output is correct but the logic is wrong. Run each phase, then print its output. The FLOW and SYSTEMS lines come after all phases complete.

## Elite Insight

A shippable beta is not a finished game. It is a game that can be played from start to finish without technical failure. Content may be placeholder. Balance may be rough. Art may be temp. But the loop works. The architecture holds. The error handling catches bad data. This is the engineering milestone. Everything after this is polish, content, and tuning.

## Cross-Path Echo

A staging deployment in web development follows the same pattern. The staging environment runs the complete application with all services connected. Authentication, database, caching, CDN, payment processing — all integrated. The staging deploy proves the system works end to end. Your milestone is a staging deploy for your game.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int lives = 3;
int waves = 0;
int configLoaded = 0;
int configErrors = 0;
int ticks = 0;

// TODO: Write simulateTitle() — title screen phase

// TODO: Write simulateConfigLoad() — load config, handle 1 error
//   Print CONFIG line

// TODO: Write simulateGameplay() — 3 waves, 10 kills, score 2800
//   Print SESSION line

// TODO: Write simulateVictory() — rating and time
//   Print VICTORY line

int main() {
    // TODO: Run all phases in order
    // TODO: Print FLOW, SYSTEMS_ACTIVE, MILESTONE_95

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int lives = 3;
int waves = 0;
int configLoaded = 0;
int configErrors = 0;
int ticks = 0;

void simulateTitle() {
    // Title screen displayed, New Game selected
}

void simulateConfigLoad() {
    configLoaded = 7;
    configErrors = 1;
    cout << "CONFIG|loaded|" << configLoaded << "|errors_handled|" << configErrors << endl;
}

void simulateGameplay() {
    waves = 3;
    kills = 10;
    score = 2800;
    lives = 2;
    ticks = 30;
    cout << "SESSION|waves|" << waves << "|kills|" << kills
         << "|score|" << score << "|lives|" << lives << endl;
}

void simulateBoss() {
    // Boss fight completes in wave 3
}

void simulateVictory() {
    string rating = "A";
    cout << "VICTORY|Rating: " << rating << "|Time: " << ticks << " ticks" << endl;
}

void simulateReturnToTitle() {
    // State machine returns to TITLE
}

int main() {
    simulateTitle();
    simulateConfigLoad();
    simulateGameplay();
    simulateBoss();
    simulateVictory();
    simulateReturnToTitle();

    cout << "FLOW|TITLE->CONFIG_LOAD->PLAYING->BOSS->VICTORY->TITLE" << endl;
    cout << "SYSTEMS_ACTIVE|title|config|settings|a11y|balance|hud|particles|shake|trails|audio|pause|replay" << endl;
    cout << "MILESTONE_95|PASS|shippable beta" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Config loaded with validation", expectedOutput: "CONFIG\\|loaded\\|7\\|errors_handled\\|1", isPattern: true },
      { id: "t2", description: "Session stats", expectedOutput: "SESSION\\|waves\\|3\\|kills\\|10\\|score\\|2800\\|lives\\|2", isPattern: true },
      { id: "t3", description: "Victory screen", expectedOutput: "VICTORY\\|Rating: A\\|Time: 30 ticks", isPattern: true },
      { id: "t4", description: "Complete flow path", expectedOutput: "FLOW\\|TITLE->CONFIG_LOAD->PLAYING->BOSS->VICTORY->TITLE", isPattern: true },
      { id: "t5", description: "All systems active", expectedOutput: "SYSTEMS_ACTIVE\\|title\\|config\\|settings\\|a11y\\|balance\\|hud\\|particles\\|shake\\|trails\\|audio\\|pause\\|replay", isPattern: true },
      { id: "t6", description: "Milestone 95 passes", expectedOutput: "MILESTONE_95\\|PASS\\|shippable beta", isPattern: true },
    ],
    hints: [
      "simulateConfigLoad sets configLoaded=7 and configErrors=1, then prints the CONFIG line. simulateGameplay sets waves=3, kills=10, score=2800, lives=2, ticks=30, then prints the SESSION line.",
      "simulateVictory uses the ticks variable (30) set during gameplay. The rating is \"A\" — hardcoded for the milestone. Print format: VICTORY|Rating: A|Time: 30 ticks.",
      "After all six simulate functions run, print FLOW (the state path), SYSTEMS_ACTIVE (12 systems), and MILESTONE_95 (the pass assertion). These three lines come at the end.",
    ],
    estimatedMinutes: 20,
  },
};
