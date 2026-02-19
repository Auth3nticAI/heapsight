import type { GameLessonVariant } from "@/types/game";

export const lesson19SpaceShooter: GameLessonVariant = {
  lessonId: "19-game-states-v0",
  instructions: `# Game States v0 — State Machine for Your Space Shooter

Your game runs every system every frame. Enemies move during the menu. Bullets resolve during pause. Score increments while the title screen is showing. Without a state machine, the game has no concept of "not playing." Every system fires unconditionally, every frame.

## What Breaks Without This

Without state gating, there is no menu, no pause, no separation between game modes. The player opens the game and enemies are already moving. They press pause and damage still resolves. The game behaves as if it is always in combat. That breaks every user expectation.

## The Fix

Define \\\`enum GameState { MENU, PLAYING, PAUSED };\\\` — three states, three behaviors. One variable controls the entire game.

In MENU: render the title screen. No entities move. No damage resolves. No score changes. The game is waiting for the player to start.

In PLAYING: full pipeline. Movement system, damage system, render system. All entities update every frame. This is the active game.

In PAUSED: render system only. Entities draw at their current positions but do not move. Damage does not resolve. Score does not change. The game is frozen in time but still visible.

Transitions are explicit: \\\`state = PLAYING;\\\` after the player presses start. \\\`state = PAUSED;\\\` when they press P. \\\`state = PLAYING;\\\` again to resume. Each transition is a single assignment.

The key insight: the state variable sits above all systems. It is checked once per frame, at the top of the loop. Everything below it obeys. This is hierarchical control — one variable, total authority.

## Your Task

1. Define enum GameState { MENU, PLAYING, PAUSED }
2. MENU state: output title screen messages
3. Transition MENU to PLAYING: run Frame 1 with all systems active
4. Ship at (180,300), enemy at (160,100), enemy moves down by 30 per frame
5. Transition PLAYING to PAUSED: render only, no movement
6. Entity positions unchanged from Frame 1 (enemy still at y=130)
7. Transition PAUSED to PLAYING: run Frame 2, enemy moves down by 30 again
8. Verify score unchanged during pause, output HUD

## Beginner Trap

**Common Mistake:** Using two bools (\\\`isPaused\\\`, \\\`isInMenu\\\`) instead of an enum. Two bools = 4 possible states. Only 3 are valid. The fourth (paused AND in menu) is nonsensical but possible. An enum makes illegal states unrepresentable.

## Elite Insight

Unreal Engine's GameMode class is a state machine. Unity's SceneManager manages state transitions. id Tech uses \\\`gameState_t\\\` enum. The pattern scales from your 3-state shooter to AAA open-world games with dozens of states. The architecture is identical.

## Systems Thinking Connection

L16 built the game loop. L17 optimized entity allocation. L18 added persistence. L19 adds state control. Together: the loop drives frames, the free list manages entities, save preserves progress, and states control which systems run. This is a complete game architecture.

## Cross-Path Echo

Every game path needs state management. Platformers need menu/playing/paused. RPGs add inventory/dialog/combat states. The number of states grows but the pattern — enum + gate — stays the same.`,
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
      description: "Frame 1: enemy at y=130 after movement",
      expectedOutput: "ENTITY\\|enemy1\\|enemy\\|160\\|130\\|22\\|22\\|30",
      isPattern: true,
    },
    {
      id: "g3",
      description: "PAUSED: MOVE system suspended",
      expectedOutput: "\\[MOVE\\] SUSPENDED",
      isPattern: true,
    },
    {
      id: "g4",
      description: "PAUSED: shows pause message",
      expectedOutput: "GAME_MESSAGE\\|PAUSED - Press P to resume",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Frame 2: enemy at y=160 after resume",
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
      description: "Score unchanged during pause",
      expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3",
      isPattern: true,
    },
  ],
  hints: [
    "In PLAYING state: `enemyY += 30;` before rendering. In PAUSED state: skip the movement, render at current positions.",
    "Enemy starts at y=100. Frame 1 adds 30 (y=130). Pause does not move (still y=130). Frame 2 adds 30 (y=160).",
    "The key: `if (state == PLAYING)` gates both movement AND damage. `if (state == PAUSED)` only renders.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L19: Game States v0 ===
// L17: Free list | L18: Save/Load | L19: State machine

enum GameState { MENU, PLAYING, PAUSED };

int main() {
    GameState state = MENU;
    int shipX = 180, shipY = 300;
    int enemyX = 160, enemyY = 100;
    int score = 0;
    int hp = 100;
    int lives = 3;

    // --- MENU state (L19: state-gated rendering) ---
    cout << "GAME_MESSAGE|=== SPACE SHOOTER ===" << endl;
    cout << "GAME_MESSAGE|Press START to play" << endl;

    // --- Transition: MENU -> PLAYING ---
    state = PLAYING;

    // --- PLAYING state: all systems active ---
    if (state == PLAYING) {
        enemyY += 30;  // moveSystem
        // damageSystem would run here
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|enemy1|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
        cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    }

    // --- Transition: PLAYING -> PAUSED ---
    state = PAUSED;

    // --- PAUSED state: render only, no movement/damage ---
    if (state == PAUSED) {
        // No enemyY += 30 here — frozen
        cout << "GAME_MESSAGE|PAUSED - Press P to resume" << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|enemy1|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
    }

    // --- Transition: PAUSED -> PLAYING ---
    state = PLAYING;

    // --- PLAYING resumed: systems active again ---
    if (state == PLAYING) {
        enemyY += 30;
        cout << "GAME_MESSAGE|Game resumed" << endl;
        cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
        cout << "ENTITY|enemy1|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
        cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    }

    return 0;
}
`,
};
