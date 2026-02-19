import type { GameLessonVariant } from "@/types/game";

export const lesson18SpaceShooter: GameLessonVariant = {
  lessonId: "18-save-snapshot-v0",
  instructions: `# Save Snapshot v0 — Persistence for Your Space Shooter

Your game state lives in RAM. Close the program and everything is gone. Wave 10, score 5000, 1 life remaining — all erased. The player has to start from wave 1 every time. Save/load fixes this by snapshotting state to a persistent format.

## What Breaks Without This

No persistence = no progression. Players invest 20 minutes reaching wave 10. A crash, a quit, a power outage — gone. Without save/load, your game punishes players for stopping. That is hostile design.

## The Fix

Serialize game state as key=value text. \\\`saveGame()\\\` writes wave, score, lives, hp as tagged output lines. \\\`loadGame()\\\` reads them back into variables. The save format is a contract: if you write \\\`wave=3\\\`, you must read \\\`wave=3\\\`.

For this lesson, we simulate file I/O with cout. The serialization pattern is identical to real \\\`ofstream\\\`/\\\`ifstream\\\`. Replace \\\`cout\\\` with \\\`file <<\\\` and the code works with actual files. The abstraction is the same.

The full lifecycle: play 3 waves accumulating score, take damage on wave 2, save after wave 3, reset all variables to simulate a "new game", then load the saved state and verify every value matches. If all four variables restore correctly, the save system works.

## Your Task

1. Start: wave=1, score=0, lives=3, hp=100
2. Play wave 1: score += 150, advance wave
3. Play wave 2: score += 150, lose 1 life, lose 25 hp, advance wave
4. Play wave 3: score += 150
5. Save state: wave=3, score=450, lives=2, hp=75
6. Reset all variables to starting values (simulate restart)
7. Load saved state: restore all four variables
8. Print restored state and continuation message

## Beginner Trap

**Common Mistake:** Saving during every frame. File writes block the main thread. At 60fps that is 60 disk writes per second. The game stutters visibly. Save on events only — wave completion, pause, quit. Never inside the frame loop.

## Elite Insight

Dark Souls saves at bonfires. Minecraft saves chunks asynchronously. The save trigger is a design decision. Autosave between waves is the safest pattern for a shooter — the game is briefly idle and the state is clean.

## Systems Thinking Connection

Serialization is the foundation for save files, config files, network state sync, and replay recording. The key=value format here is a simplified version of what every game ships. Master this pattern and you can implement any of those systems.

## Cross-Path Echo

Every game path needs persistence. Platformers save level progress and collectibles. RPGs save inventory, quests, and character stats. The serialization format changes. The pattern does not.`,
  starterCode: `#include <iostream>
using namespace std;

void saveGame(int wave, int score, int lives, int hp) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|lives=" << lives << endl;
    cout << "SAVE|hp=" << hp << endl;
}

void loadGame(int& wave, int& score, int& lives, int& hp,
              int sw, int ss, int sl, int sh) {
    wave = sw;
    score = ss;
    lives = sl;
    hp = sh;
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|lives=" << lives << endl;
    cout << "LOAD|hp=" << hp << endl;
}

int main() {
    int wave = 1;
    int score = 0;
    int lives = 3;
    int hp = 100;

    // TODO: Simulate 3 waves
    // Wave 1: score += 150, wave++
    // Wave 2: score += 150, lives--, hp -= 25, wave++
    // Wave 3: score += 150

    // TODO: Save state (store saved copies, call saveGame)

    // TODO: Print saved message

    // TODO: Restart — reset to defaults

    // TODO: Load saved state

    // TODO: Print restored state and GAME_MESSAGE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

void saveGame(int wave, int score, int lives, int hp) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|lives=" << lives << endl;
    cout << "SAVE|hp=" << hp << endl;
}

void loadGame(int& wave, int& score, int& lives, int& hp,
              int sw, int ss, int sl, int sh) {
    wave = sw;
    score = ss;
    lives = sl;
    hp = sh;
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|lives=" << lives << endl;
    cout << "LOAD|hp=" << hp << endl;
}

int main() {
    int wave = 1;
    int score = 0;
    int lives = 3;
    int hp = 100;

    // Simulate 3 waves
    cout << "=== PLAYING ===" << endl;

    // Wave 1
    score += 150;
    cout << "Wave " << wave << " complete. Score: " << score << endl;
    wave++;

    // Wave 2 (take damage)
    score += 150;
    lives--;
    hp -= 25;
    cout << "Wave " << wave << " complete. Score: " << score << " (lost a life!)" << endl;
    wave++;

    // Wave 3
    score += 150;
    cout << "Wave " << wave << " complete. Score: " << score << endl;

    // Save state
    cout << endl << "=== SAVING ===" << endl;
    int savedWave = wave;
    int savedScore = score;
    int savedLives = lives;
    int savedHp = hp;
    saveGame(wave, score, lives, hp);
    cout << "GAME_MESSAGE|Game saved to data/save.txt" << endl;

    // Restart
    cout << endl << "=== RESTART ===" << endl;
    wave = 1;
    score = 0;
    lives = 3;
    hp = 100;
    cout << "Reset: wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;

    // Load saved state
    cout << endl << "=== LOADING ===" << endl;
    loadGame(wave, score, lives, hp, savedWave, savedScore, savedLives, savedHp);

    // Verify restoration
    cout << endl << "=== RESTORED STATE ===" << endl;
    cout << "wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
    cout << "GAME_MESSAGE|State restored. Continuing from wave " << wave << "." << endl;

    return 0;
}
`,
  tests: [
    {
      id: "g1",
      description: "Should save wave 3",
      expectedOutput: "SAVE\\|wave=3",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Should save score 450",
      expectedOutput: "SAVE\\|score=450",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Should save lives 2 and hp 75",
      expectedOutput: "SAVE\\|lives=2",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Should show Game saved message",
      expectedOutput: "GAME_MESSAGE\\|Game saved to data/save.txt",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Should load wave 3 after restart",
      expectedOutput: "LOAD\\|wave=3",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Should load score 450 after restart",
      expectedOutput: "LOAD\\|score=450",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Should restore state and continue from wave 3",
      expectedOutput: "GAME_MESSAGE\\|State restored. Continuing from wave 3.",
      isPattern: true,
    },
  ],
  hints: [
    "Wave 1: score becomes 150, wave becomes 2. Wave 2: score=300, lives=2, hp=75, wave=3. Wave 3: score=450. Save at wave=3.",
    "Store saved values BEFORE resetting: `int savedWave = wave;` etc. Reset sets wave=1, score=0, lives=3, hp=100.",
    "loadGame takes references to live variables. After the call, wave/score/lives/hp hold the saved values again.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L18: Save Snapshot v0 ===
// L17: Free list | L18: State serialization/persistence

// --- Save/Load functions (L18: serialization) ---
void saveGame(int wave, int score, int lives, int hp) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|lives=" << lives << endl;
    cout << "SAVE|hp=" << hp << endl;
}

void loadGame(int& wave, int& score, int& lives, int& hp,
              int sw, int ss, int sl, int sh) {
    wave = sw;
    score = ss;
    lives = sl;
    hp = sh;
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|lives=" << lives << endl;
    cout << "LOAD|hp=" << hp << endl;
}

int main() {
    int wave = 1;
    int score = 0;
    int lives = 3;
    int hp = 100;

    // --- Play 3 waves ---
    // Wave 1
    score += 150;
    wave++;
    // Wave 2 (damage)
    score += 150;
    lives--;
    hp -= 25;
    wave++;
    // Wave 3
    score += 150;

    // --- Save state (L18: serialize to key=value) ---
    int savedWave = wave;
    int savedScore = score;
    int savedLives = lives;
    int savedHp = hp;
    saveGame(wave, score, lives, hp);

    // --- Simulate restart ---
    wave = 1; score = 0; lives = 3; hp = 100;

    // --- Load state (L18: deserialize from saved values) ---
    loadGame(wave, score, lives, hp, savedWave, savedScore, savedLives, savedHp);

    return 0;
}
`,
};
