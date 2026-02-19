import type { GameLessonVariant } from "@/types/game";

export const lesson21SpaceShooter: GameLessonVariant = {
  lessonId: "21-checkpoint-save-load",
  instructions: `# Checkpoint Save Load -- Session Persistence

The player closes the game after wave 3. Opens it again. Wave 1. Score 0. Everything gone. Twenty minutes wasted. They do not open it a third time. Without checkpoints, your game punishes the player for having a life outside of it.

## What Breaks Without This

Without save/load, game progress is volatile. It exists only in RAM. Close the program, lose everything. Long games become impossible. Player retention drops to zero for any game longer than a single sitting.

## The Fix

Save progress state at wave boundaries. Wave number, score, lives, hp. Four integers. That is the entire checkpoint. On startup, check for a save file. If it exists, restore state and resume. If not, start fresh.

\\\`saveCheckpoint\\\` writes the four values. \\\`loadCheckpoint\\\` reads them back via reference parameters. It returns a bool: true if save existed and was loaded, false if no save found. The game branches on this bool -- resume or fresh start.

The key insight: do not save enemy positions, bullet states, or particle effects. Those are transient. They are derived from the wave number. Wave 3 always spawns the same enemies. Save the wave number, reconstruct the rest. Save the seed, not the tree.

## Your Task

1. Simulate playing waves 1-3 (score: +100, +150, +250; hp drops to 80 on wave 3)
2. Render the hero and 3 wave-3 enemies using ENTITY protocol
3. Save checkpoint after wave 3 with CHECKPOINT|SAVE format
4. Output SCORE and GAME_MESSAGE for the save
5. Simulate restart (clear state, print separator)
6. Load checkpoint with CHECKPOINT|LOAD format
7. Output resuming message, SCORE, and final GAME_MESSAGE

## Performance Insight

Save once per wave. Cost: ~1ms file write. Amortized over 30-60 seconds of gameplay per wave = negligible. Load once on startup. Cost: ~1ms file read. The persistence layer adds zero runtime cost to the game loop itself.

## Memory Insight

Checkpoint data: 4 integers = 16 bytes. Fits in a single cache line. No arrays. No strings. No complex serialization. The entire game progress state is smaller than a single enemy struct.

## Beginner Trap

**Common Mistake:** Saving enemy positions and bullet states. This is fragile and unnecessary. If wave 3 always spawns 3 enemies at fixed positions, the wave number alone reconstructs the entire enemy layout. Save the minimum state that reproduces the full game state.

## Elite Insight

Production save systems use versioned formats. Save file v1 has 4 fields. v2 adds 2 more. The load function checks the version byte and handles both. Your simple checkpoint is the foundation. Add a version number and you have a forward-compatible save format.

## Systems Thinking Connection

The checkpoint decouples session duration from game length. A 2-hour game becomes ten 12-minute sessions. The save file is the bridge between sessions. Same game state, different temporal access pattern. This is the same insight as spatial buckets -- partition the problem space to make it manageable.

## Skill Reinforcement

You know reference parameters from L18. You know functions that return bools. loadCheckpoint combines both: it takes references to modify the caller's state and returns whether the operation succeeded. Same tools, different domain.

## Mastery Check

Why does loadCheckpoint return a bool? Because the caller needs to know whether to resume or start fresh. Without the bool, the caller cannot distinguish "loaded wave 3" from "no save file, defaulted to wave 0". The return value is the decision signal.`,
  starterCode: `#include <iostream>
using namespace std;

void saveCheckpoint(int wave, int score, int lives, int hp) {
    cout << "CHECKPOINT|SAVE wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
}

bool loadCheckpoint(int& wave, int& score, int& lives, int& hp,
                    bool fileExists, int sw, int ss, int sl, int sh) {
    if (!fileExists) return false;
    wave = sw; score = ss; lives = sl; hp = sh;
    cout << "CHECKPOINT|LOAD wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
    return true;
}

int main() {
    int wave = 0;
    int score = 0;
    int lives = 3;
    int hp = 100;

    // TODO: Play waves 1-3 (score: +100, +150, +250; hp=80 after wave 3)

    // TODO: Render hero and 3 enemies for wave 3
    // Hero: ENTITY|hero|player|180|220|24|24|hp
    // Enemies: ENTITY|eN|enemy|X|60|16|16|50 at x = 60 + i*100

    // TODO: Save checkpoint, output SCORE and GAME_MESSAGE

    // TODO: Print "--- RESTART ---", clear state

    // TODO: Load checkpoint, output resume message, SCORE, and final GAME_MESSAGE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

void saveCheckpoint(int wave, int score, int lives, int hp) {
    cout << "CHECKPOINT|SAVE wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
}

bool loadCheckpoint(int& wave, int& score, int& lives, int& hp,
                    bool fileExists, int sw, int ss, int sl, int sh) {
    if (!fileExists) return false;
    wave = sw; score = ss; lives = sl; hp = sh;
    cout << "CHECKPOINT|LOAD wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
    return true;
}

int main() {
    int wave = 0;
    int score = 0;
    int lives = 3;
    int hp = 100;

    // Play waves 1-3
    wave = 1; score += 100;
    wave = 2; score += 150;
    wave = 3; score += 250; hp = 80;

    // Render current state
    cout << "ENTITY|hero|player|180|220|24|24|" << hp << endl;
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|e" << i << "|enemy|" << (60 + i * 100) << "|60|16|16|50" << endl;
    }

    // Save checkpoint
    int savedWave = wave;
    int savedScore = score;
    int savedLives = lives;
    int savedHP = hp;

    saveCheckpoint(wave, score, lives, hp);
    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Checkpoint saved after wave 3" << endl;

    // Simulate restart
    cout << "--- RESTART ---" << endl;
    wave = 0; score = 0; lives = 3; hp = 100;

    // Load checkpoint
    loadCheckpoint(wave, score, lives, hp, true, savedWave, savedScore, savedLives, savedHP);
    cout << "GAME_MESSAGE|Resuming from wave " << wave << ", score " << score << endl;

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Checkpoint system: persistence without complexity" << endl;

    return 0;
}
`,
  tests: [
    {
      id: "g1",
      description: "Should render hero with hp=80",
      expectedOutput: "ENTITY\\|hero\\|player\\|180\\|220\\|24\\|24\\|80",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Should render wave 3 enemies",
      expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|60\\|16\\|16\\|50",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Should save checkpoint with wave 3 data",
      expectedOutput: "CHECKPOINT\\|SAVE wave=3 score=500 lives=3 hp=80",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Should load checkpoint after restart",
      expectedOutput: "CHECKPOINT\\|LOAD wave=3 score=500 lives=3 hp=80",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Should show resuming message with correct state",
      expectedOutput: "GAME_MESSAGE\\|Resuming from wave 3, score 500",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Should show persistence message",
      expectedOutput: "GAME_MESSAGE\\|Checkpoint system: persistence without complexity",
      isPattern: true,
    },
  ],
  hints: [
    "Save the checkpoint values before clearing: `int savedWave = wave;` etc. These simulate what a file would store.",
    "After `--- RESTART ---`, set wave=0, score=0, lives=3, hp=100. Then call loadCheckpoint with the saved values.",
    "Render enemies in a loop: `x = 60 + i * 100` for i = 0, 1, 2 gives positions 60, 160, 260.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// --- Checkpoint system (L21) ---
void saveCheckpoint(int wave, int score, int lives, int hp) {
    cout << "CHECKPOINT|SAVE wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
}

bool loadCheckpoint(int& wave, int& score, int& lives, int& hp,
                    bool fileExists, int sw, int ss, int sl, int sh) {
    if (!fileExists) return false;
    wave = sw; score = ss; lives = sl; hp = sh;
    cout << "CHECKPOINT|LOAD wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
    return true;
}

int main() {
    int wave = 0;
    int score = 0;
    int lives = 3;
    int hp = 100;

    // Play waves 1-3
    wave = 1; score += 100;
    wave = 2; score += 150;
    wave = 3; score += 250; hp = 80;

    // Render current state
    cout << "ENTITY|hero|player|180|220|24|24|" << hp << endl;
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|e" << i << "|enemy|" << (60 + i * 100) << "|60|16|16|50" << endl;
    }

    // Save checkpoint
    int savedWave = wave;
    int savedScore = score;
    int savedLives = lives;
    int savedHP = hp;

    saveCheckpoint(wave, score, lives, hp);
    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Checkpoint saved after wave 3" << endl;

    // Simulate restart
    cout << "--- RESTART ---" << endl;
    wave = 0; score = 0; lives = 3; hp = 100;

    // Load checkpoint
    loadCheckpoint(wave, score, lives, hp, true, savedWave, savedScore, savedLives, savedHP);
    cout << "GAME_MESSAGE|Resuming from wave " << wave << ", score " << score << endl;

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Checkpoint system: persistence without complexity" << endl;

    return 0;
}
`,
};
