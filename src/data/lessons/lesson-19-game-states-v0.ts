import type { Lesson } from "@/types/lesson";

export const lesson19: Lesson = {
  id: "19-game-states-v0",
  title: "Game States v0",
  description: "State machine for game modes. MENU, PLAYING, PAUSED. Each state determines which systems run. One enum controls the entire game.",
  order: 19,
  xpReward: 125,
  tier: "pro",
  concepts: ["state machine", "game states", "menu/playing/paused", "state transitions"],
  part1: {
    title: "Concept: Game States v0",
    type: "concept",
    instructions: `# Game States v0

A game is a state machine. Each state defines what systems run. MENU: only render title. PLAYING: all systems. PAUSED: render only, no movement or damage. State determines behavior.

## Mental Model

State machine gates which systems run. In MENU state: renderMenu(). In PLAYING state: move(), damage(), cleanup(), render(). In PAUSED state: renderPause(). Each state is a different loop body. Transitions: MENU to PLAYING (on 'start'), PLAYING to PAUSED (on 'p'), PAUSED to PLAYING (on 'p').

## What Breaks

Without states, systems run unconditionally. Enemies move during pause. Bullets hit while in menu. The game has no concept of "not playing". Every system runs every frame regardless of context. That is a bug factory.

## The Fix

\`\`\`cpp
enum GameState { MENU, PLAYING, PAUSED };
GameState state = MENU;
\`\`\`

Check state in the main loop. Only run relevant systems. MENU renders the title screen. PLAYING runs the full pipeline. PAUSED freezes movement and damage but keeps rendering so the player sees the frozen frame.

\`\`\`cpp
if (state == PLAYING) {
    moveSystem();
    damageSystem();
    renderSystem();
} else if (state == PAUSED) {
    renderSystem();  // render only, no movement
}
\`\`\`

Transitions are explicit assignments: \\\`state = PLAYING;\\\`. The enum enforces that only valid states exist. No illegal combinations.

## Performance Insight

One switch or if-chain per frame. Trivial cost — a single branch prediction. But it prevents running 6 systems when only 1 is needed. In MENU state, you skip movement, damage, cleanup, and collision entirely. Less work per frame = more headroom for the systems that matter.

## Memory Insight

One enum variable: 4 bytes. The state machine itself costs almost nothing. The savings come from not running unnecessary systems. Less computation = less cache pressure = better performance overall.

## Beginner Trap

Using a bool for paused and another bool for menu. Two bools = 4 possible combinations, but only 3 are valid (MENU, PLAYING, PAUSED). The fourth combination (menu AND paused) is nonsensical. An enum enforces valid states only. One variable, three values, zero illegal states.

## Elite Insight

Unreal Engine: GameMode state machine. Unity: SceneManager with state callbacks. id Tech: gameState_t enum. Same pattern at every scale. States determine which systems are active. The enum is the simplest correct implementation.

## Systems Thinking Connection

The state machine sits above all other systems. It is the master control. Movement, damage, render — they all check the current state before executing. This is hierarchical control: one variable at the top gates everything below it.

## Skill Reinforcement

You already know enums from L13 and if/else from earlier lessons. This lesson combines them into a control structure that manages the entire game. The new concept is not syntax — it is architecture.

## Mastery Check

Why enum over string? Enums are compile-time checked. Typo in a string ("plaiyng") compiles fine and fails silently at runtime. Typo in an enum (PLAIYNG) fails at compile time. Catch bugs before they ship.

## Your Task

1. Define enum GameState with MENU, PLAYING, PAUSED
2. Start in MENU state — output title screen message
3. Transition to PLAYING — output frame with all systems active
4. Transition to PAUSED — output frame with MOVE and DAMAGE suspended
5. Transition back to PLAYING — output "Game resumed"
6. Show which systems are active/suspended in each state`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define enum GameState { MENU, PLAYING, PAUSED }

int main() {
    // TODO: Start in MENU state
    // Output: === STATE: MENU ===
    // Output: GAME_MESSAGE|=== SPACE SHOOTER ===
    // Output: GAME_MESSAGE|Press START to play

    // TODO: Transition to PLAYING
    // Output: --- Transition: MENU -> PLAYING ---
    // Output: === STATE: PLAYING (Frame 1) ===
    // Output: [MOVE] active, [DAMAGE] active, [RENDER] active
    // Output: ENTITY and HUD lines

    // TODO: Transition to PAUSED
    // Output: --- Transition: PLAYING -> PAUSED ---
    // Output: === STATE: PAUSED ===
    // Output: [MOVE] SUSPENDED, [DAMAGE] SUSPENDED, [RENDER] active
    // Output: GAME_MESSAGE|PAUSED - Press P to resume
    // Output: ENTITY line (frozen position)

    // TODO: Transition back to PLAYING
    // Output: --- Transition: PAUSED -> PLAYING ---
    // Output: === STATE: PLAYING (Frame 2) ===
    // Output: [MOVE] active, [DAMAGE] active, [RENDER] active
    // Output: GAME_MESSAGE|Game resumed

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

enum GameState { MENU, PLAYING, PAUSED };

int main() {
    GameState state = MENU;

    // MENU state
    cout << "=== STATE: MENU ===" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER ===" << endl;
    cout << "GAME_MESSAGE|Press START to play" << endl;

    // Transition: MENU -> PLAYING
    cout << endl << "--- Transition: MENU -> PLAYING ---" << endl;
    state = PLAYING;

    cout << endl << "=== STATE: PLAYING (Frame 1) ===" << endl;
    if (state == PLAYING) {
        cout << "[MOVE] active" << endl;
        cout << "[DAMAGE] active" << endl;
        cout << "[RENDER] active" << endl;
        cout << "ENTITY|ship|player|180|300|24|24|100" << endl;
        cout << "HUD|HP:100|SCORE:0|LIVES:3" << endl;
    }

    // Transition: PLAYING -> PAUSED
    cout << endl << "--- Transition: PLAYING -> PAUSED ---" << endl;
    state = PAUSED;

    cout << endl << "=== STATE: PAUSED ===" << endl;
    if (state == PAUSED) {
        cout << "[MOVE] SUSPENDED" << endl;
        cout << "[DAMAGE] SUSPENDED" << endl;
        cout << "[RENDER] active" << endl;
        cout << "GAME_MESSAGE|PAUSED - Press P to resume" << endl;
        cout << "ENTITY|ship|player|180|300|24|24|100" << endl;
    }

    // Transition: PAUSED -> PLAYING
    cout << endl << "--- Transition: PAUSED -> PLAYING ---" << endl;
    state = PLAYING;

    cout << endl << "=== STATE: PLAYING (Frame 2) ===" << endl;
    if (state == PLAYING) {
        cout << "[MOVE] active" << endl;
        cout << "[DAMAGE] active" << endl;
        cout << "[RENDER] active" << endl;
        cout << "GAME_MESSAGE|Game resumed" << endl;
    }

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show MENU state with title",
        expectedOutput: "GAME_MESSAGE|=== SPACE SHOOTER ===",
      },
      {
        id: "t2",
        description: "Should show PLAYING state with systems active",
        expectedOutput: "[MOVE] active",
      },
      {
        id: "t3",
        description: "Should show PAUSED with MOVE suspended",
        expectedOutput: "[MOVE] SUSPENDED",
      },
      {
        id: "t4",
        description: "Should show PAUSED with DAMAGE suspended",
        expectedOutput: "[DAMAGE] SUSPENDED",
      },
      {
        id: "t5",
        description: "Should show Game resumed after unpause",
        expectedOutput: "GAME_MESSAGE|Game resumed",
      },
    ],
    hints: [
      "`enum GameState { MENU, PLAYING, PAUSED };` — three valid states, no illegal combinations.",
      "Use `if (state == PLAYING)` to gate system execution. In PAUSED, skip MOVE and DAMAGE but keep RENDER.",
      "Transition is just assignment: `state = PLAYING;` — the enum variable changes, and the next if-chain picks the new behavior.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: State Machine Loop",
    type: "game_builder",
    instructions: `# Game Builder: State Machine Loop

Full game loop with 3 state transitions. Entities freeze during pause. Systems activate and suspend based on state. The state machine controls the entire game.

## Mental Model

The state machine is the outer shell. Inside each state, the relevant systems run. MENU shows the title. PLAYING runs movement, damage, and render. PAUSED runs render only. The transition log shows exactly when and why the state changed.

## What Breaks

Without state gating, the movement system runs during menu. Enemies advance before the game starts. Bullets fire during pause. Score changes while paused. Every system needs to know "should I run right now?" The state machine answers that question once, at the top of the frame.

## The Fix

One enum. One variable. If-chain per frame. Each branch enables the correct systems. Transitions are explicit state assignments with logged output so you can trace the game's control flow.

## Performance Insight

State gating skips entire system passes. In MENU state: zero entity iteration. In PAUSED state: one render pass, zero movement passes. The savings scale with entity count. 1000 entities paused = 1000 fewer position updates per frame.

## Memory Insight

One int for the state variable. Zero additional memory. The state machine is pure control flow — it does not allocate anything. It only decides what runs.

## Beginner Trap

Modifying entity positions during PAUSED state. If moveSystem runs while paused, entities drift. The player sees them creep across the screen while "paused". Gate moveSystem behind \`if (state == PLAYING)\`.

## Elite Insight

Production engines use hierarchical state machines. PLAYING contains sub-states: WAVE_INTRO, COMBAT, WAVE_CLEAR. Each sub-state has its own system gating. But the top-level pattern is always the same: enum + switch.

## Systems Thinking Connection

L16 gave you the game loop. L17 gave you O(1) allocation. L18 gave you persistence. L19 gives you state control. Together they form a complete game architecture: loop drives frames, free list manages entities, save preserves progress, states control behavior.

## Skill Reinforcement

Enums, conditionals, and system functions — all from previous lessons. The new pattern is using the enum to gate system execution. The state variable becomes the single source of truth for "what is the game doing right now?"

## Mastery Check

What happens if you forget to gate damageSystem? During pause, enemies take damage. During menu, collision resolves against nonexistent entities. The game state is inconsistent with what the player expects. State gating prevents all of these bugs.

## Your Task

1. Define enum GameState with MENU, PLAYING, PAUSED
2. Start in MENU state — render title screen
3. Transition MENU to PLAYING — run all systems (move, damage, render)
4. Ship at (180,300), enemy at (160,100), show HUD with score 0
5. Transition PLAYING to PAUSED — freeze all movement, suspend damage
6. Entity positions unchanged (ship still at 180,300)
7. Transition PAUSED to PLAYING — resume all systems
8. Verify score unchanged during pause`,
    starterCode: `#include <iostream>
using namespace std;

enum GameState { MENU, PLAYING, PAUSED };

int main() {
    GameState state = MENU;
    int shipX = 180, shipY = 300;
    int enemyX = 160, enemyY = 100;
    int score = 0;
    int hp = 100;
    int lives = 3;

    // TODO: MENU state
    // Print title and start prompt

    // TODO: Transition to PLAYING
    // Run Frame 1: move enemy down by 30, render entities, show HUD

    // TODO: Transition to PAUSED
    // Render entities (same positions — no movement), show PAUSED message

    // TODO: Transition back to PLAYING
    // Run Frame 2: move enemy down by 30 again, render, show resumed

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

enum GameState { MENU, PLAYING, PAUSED };

int main() {
    GameState state = MENU;
    int shipX = 180, shipY = 300;
    int enemyX = 160, enemyY = 100;
    int score = 0;
    int hp = 100;
    int lives = 3;

    // MENU state
    cout << "=== STATE: MENU ===" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER ===" << endl;
    cout << "GAME_MESSAGE|Press START to play" << endl;

    // Transition: MENU -> PLAYING
    cout << endl << "--- Transition: MENU -> PLAYING ---" << endl;
    state = PLAYING;

    // Frame 1: PLAYING
    cout << endl << "=== STATE: PLAYING (Frame 1) ===" << endl;
    if (state == PLAYING) {
        enemyY += 30;
        cout << "[MOVE] active" << endl;
        cout << "[DAMAGE] active" << endl;
        cout << "[RENDER] active" << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|enemy1|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
        cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    }

    // Transition: PLAYING -> PAUSED
    cout << endl << "--- Transition: PLAYING -> PAUSED ---" << endl;
    state = PAUSED;

    // PAUSED frame
    cout << endl << "=== STATE: PAUSED ===" << endl;
    if (state == PAUSED) {
        // No movement, no damage
        cout << "[MOVE] SUSPENDED" << endl;
        cout << "[DAMAGE] SUSPENDED" << endl;
        cout << "[RENDER] active" << endl;
        cout << "GAME_MESSAGE|PAUSED - Press P to resume" << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|enemy1|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
    }

    // Transition: PAUSED -> PLAYING
    cout << endl << "--- Transition: PAUSED -> PLAYING ---" << endl;
    state = PLAYING;

    // Frame 2: PLAYING (resumed)
    cout << endl << "=== STATE: PLAYING (Frame 2) ===" << endl;
    if (state == PLAYING) {
        enemyY += 30;
        cout << "[MOVE] active" << endl;
        cout << "[DAMAGE] active" << endl;
        cout << "[RENDER] active" << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|enemy1|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
        cout << "GAME_MESSAGE|Game resumed" << endl;
        cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    }

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should show MENU title message",
        expectedOutput: "GAME_MESSAGE\\|=== SPACE SHOOTER ===",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Frame 1: enemy moved to y=130",
        expectedOutput: "ENTITY\\|enemy1\\|enemy\\|160\\|130\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g3",
        description: "PAUSED: MOVE suspended",
        expectedOutput: "\\[MOVE\\] SUSPENDED",
        isPattern: true,
      },
      {
        id: "g4",
        description: "PAUSED: enemy still at y=130 (frozen)",
        expectedOutput: "PAUSED - Press P to resume",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Frame 2: enemy moved to y=160 after resume",
        expectedOutput: "ENTITY\\|enemy1\\|enemy\\|160\\|160\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Should show Game resumed message",
        expectedOutput: "GAME_MESSAGE\\|Game resumed",
        isPattern: true,
      },
      {
        id: "g7",
        description: "Score unchanged during pause (still 0)",
        expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3",
        isPattern: true,
      },
    ],
    hints: [
      "In PLAYING state: `enemyY += 30;` then render. In PAUSED state: skip the movement, render the same positions.",
      "The enemy starts at y=100. Frame 1 (PLAYING): y=130. Paused frame: still y=130. Frame 2 (PLAYING): y=160.",
      "Gate movement with `if (state == PLAYING)`. The PAUSED branch only renders — no position changes.",
    ],
    estimatedMinutes: 8,
  },
};
