import type { Lesson } from "@/types/lesson";

export const lesson21: Lesson = {
  id: "21-checkpoint-save-load",
  title: "Checkpoint Save Load",
  description: "Save game state between waves. Restore on restart. Persistence without complexity.",
  order: 21,
  xpReward: 125,
  tier: "pro",
  concepts: ["checkpoint system", "state restoration", "wave persistence", "resume gameplay"],
  part1: {
    title: "Concept: Checkpoint Save Load",
    type: "concept",
    instructions: `# Checkpoint Save Load

Checkpoint = snapshot at a safe point. Save between waves. On restart, load snapshot. Player continues from last checkpoint, not from scratch.

## Mental Model

The game state at any moment is a small set of numbers: wave, score, lives, hp. A checkpoint captures those numbers to a file. On restart, the game reads the file and restores those numbers. The player resumes exactly where they left off. No enemy positions. No bullet states. Just progress data.

## What Breaks

Without checkpoints, death means replaying everything. Players quit. Retention drops. A 20-wave game with no save is a 20-wave game nobody finishes.

## The Fix

\\\`saveCheckpoint()\\\` writes wave/score/lives/hp after each wave. \\\`loadCheckpoint()\\\` reads on startup. Returns bool: true if save existed, false if fresh start.

\\\`\\\`\\\`cpp
void saveCheckpoint(int wave, int score, int lives, int hp) {
    // Write: wave score lives hp
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
\\\`\\\`\\\`

## Performance Insight

Save once per wave. Cost: ~1ms file write. Amortized over 30-60 seconds of gameplay per wave = negligible. Load once on startup. Cost: ~1ms file read. Invisible to the player.

## Memory Insight

Checkpoint data: 4 integers = 16 bytes. The entire game progress fits in a single cache line. No arrays. No complex structures. Just the essential state.

## Beginner Trap

Saving enemy positions. Too complex. Too fragile. Save only progress state: wave, score, lives, hp. Enemies respawn from wave definition. The wave number IS the enemy configuration. Do not duplicate it.

## Elite Insight

Production games: save file CRC/checksum. If checksum fails, file corrupted, delete and start fresh. Your validation is the foundation. L22 adds error handling on top of this.

## Systems Thinking Connection

Save at wave boundaries. Load on startup. If save exists, resume. If not, fresh start. The checkpoint IS the game's persistence layer. It decouples session duration from game length. A 2-hour game becomes ten 12-minute sessions. Same data, different access pattern.

## Skill Reinforcement

You know functions, references, and conditionals. saveCheckpoint is a function that outputs data. loadCheckpoint is a function that reads data and returns a bool. Reference parameters let it modify the caller's state. Same tools, new application.

## Mastery Check

Why save only wave/score/lives/hp and not enemy positions? Because enemy state is derived from wave number. Wave 3 always spawns the same enemies. Saving derived data is redundant and fragile. Save the seed, not the tree.

## Your Task

1. Write \\\`saveCheckpoint\\\` that outputs CHECKPOINT|SAVE with wave, score, lives, hp
2. Write \\\`loadCheckpoint\\\` that restores state from saved values, returns bool
3. Simulate playing waves 1-3, saving after wave 3
4. Clear state (simulate restart)
5. Load checkpoint, verify restoration
6. Continue from wave 4`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write saveCheckpoint(int wave, int score, int lives, int hp)
// Output: CHECKPOINT|SAVE wave=W score=S lives=L hp=H

// TODO: Write loadCheckpoint that takes references and saved values
// Returns true if loaded, false if no save exists

int main() {
    int wave = 0;
    int score = 0;
    int lives = 3;
    int hp = 100;

    cout << "=== PLAYING ===" << endl;

    // TODO: Simulate waves 1-3
    // Wave 1: score += 100
    // Wave 2: score += 150
    // Wave 3: score += 250, hp = 80
    // Print "Wave N complete. Score: S" after each

    // TODO: Save checkpoint after wave 3
    // Print GAME_MESSAGE|Checkpoint saved after wave 3

    cout << endl << "=== SIMULATED RESTART ===" << endl;
    // TODO: Clear state to defaults
    // Print "State cleared: wave=0 score=0 lives=3 hp=100"

    cout << endl << "=== LOADING CHECKPOINT ===" << endl;
    // TODO: Load checkpoint, print result

    // TODO: Print GAME_MESSAGE|Resuming from wave 3, score 500

    cout << endl << "=== CONTINUING ===" << endl;
    // TODO: Print "Wave 4 starting... score=S lives=L hp=H"
    // Print GAME_MESSAGE|Checkpoint system: persistence without complexity

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
    wave = sw;
    score = ss;
    lives = sl;
    hp = sh;
    cout << "CHECKPOINT|LOAD wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;
    return true;
}

int main() {
    int wave = 0;
    int score = 0;
    int lives = 3;
    int hp = 100;

    cout << "=== PLAYING ===" << endl;

    wave = 1; score += 100;
    cout << "Wave 1 complete. Score: " << score << endl;
    wave = 2; score += 150;
    cout << "Wave 2 complete. Score: " << score << endl;
    wave = 3; score += 250; hp = 80;
    cout << "Wave 3 complete. Score: " << score << endl;

    saveCheckpoint(wave, score, lives, hp);
    cout << "GAME_MESSAGE|Checkpoint saved after wave 3" << endl;

    // Save values before clearing
    int savedWave = wave;
    int savedScore = score;
    int savedLives = lives;
    int savedHP = hp;

    cout << endl << "=== SIMULATED RESTART ===" << endl;
    wave = 0; score = 0; lives = 3; hp = 100;
    cout << "State cleared: wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;

    cout << endl << "=== LOADING CHECKPOINT ===" << endl;
    bool loaded = loadCheckpoint(wave, score, lives, hp,
                                  true, savedWave, savedScore, savedLives, savedHP);

    if (loaded) {
        cout << "GAME_MESSAGE|Resuming from wave " << wave << ", score " << score << endl;
    }

    cout << endl << "=== CONTINUING ===" << endl;
    cout << "Wave 4 starting... score=" << score << " lives=" << lives << " hp=" << hp << endl;
    cout << "GAME_MESSAGE|Checkpoint system: persistence without complexity" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should save checkpoint with correct values",
        expectedOutput: "CHECKPOINT\\|SAVE wave=3 score=500 lives=3 hp=80",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Should clear state on simulated restart",
        expectedOutput: "State cleared: wave=0 score=0 lives=3 hp=100",
      },
      {
        id: "t3",
        description: "Should load checkpoint with correct values",
        expectedOutput: "CHECKPOINT\\|LOAD wave=3 score=500 lives=3 hp=80",
        isPattern: true,
      },
      {
        id: "t4",
        description: "Should show resuming message",
        expectedOutput: "GAME_MESSAGE\\|Resuming from wave 3, score 500",
        isPattern: true,
      },
      {
        id: "t5",
        description: "Should continue from wave 4 with restored state",
        expectedOutput: "Wave 4 starting... score=500 lives=3 hp=80",
      },
    ],
    hints: [
      "`saveCheckpoint` just outputs: `cout << \"CHECKPOINT|SAVE wave=\" << wave << \" score=\" << score << \" lives=\" << lives << \" hp=\" << hp << endl;`",
      "Save the values before clearing: `int savedWave = wave;` etc. Then pass them to loadCheckpoint after clearing.",
      "`loadCheckpoint` uses reference parameters (`int& wave`) to modify the caller's variables directly. Same pattern as L18's addScore.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Checkpoint Persistence",
    type: "game_builder",
    instructions: `# Game Builder: Checkpoint Save/Load

Build the full checkpoint flow for the space shooter. Play waves, save progress, simulate a restart, load the checkpoint, and continue playing. The player never loses progress.

## Your Task

1. Play waves 1-3, accumulating score (100, 150, 250)
2. Take damage during wave 3 (hp drops to 80)
3. Save checkpoint after wave 3
4. Render game state with ENTITY protocol (hero + enemies for current wave)
5. Simulate restart (clear all state)
6. Load checkpoint and resume
7. Show wave 4 starting with restored state

Expected output:
\\\`\\\`\\\`
ENTITY|hero|player|180|220|24|24|80
ENTITY|e0|enemy|60|60|16|16|50
ENTITY|e1|enemy|160|60|16|16|50
ENTITY|e2|enemy|260|60|16|16|50
CHECKPOINT|SAVE wave=3 score=500 lives=3 hp=80
SCORE|500
GAME_MESSAGE|Checkpoint saved after wave 3
--- RESTART ---
CHECKPOINT|LOAD wave=3 score=500 lives=3 hp=80
GAME_MESSAGE|Resuming from wave 3, score 500
SCORE|500
GAME_MESSAGE|Checkpoint system: persistence without complexity
\\\`\\\`\\\``,
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
    // TODO: Render hero and wave 3 enemies
    // TODO: Save checkpoint and output SCORE + GAME_MESSAGE
    // TODO: Simulate restart, load checkpoint, resume
    // TODO: Output final SCORE and GAME_MESSAGE

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
        description: "Should save checkpoint with wave 3 data",
        expectedOutput: "CHECKPOINT\\|SAVE wave=3 score=500 lives=3 hp=80",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should load checkpoint after restart",
        expectedOutput: "CHECKPOINT\\|LOAD wave=3 score=500 lives=3 hp=80",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Should show resuming message",
        expectedOutput: "GAME_MESSAGE\\|Resuming from wave 3, score 500",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Should show persistence message",
        expectedOutput: "GAME_MESSAGE\\|Checkpoint system: persistence without complexity",
        isPattern: true,
      },
    ],
    hints: [
      "Play waves by incrementing: `wave = 1; score += 100;` etc. Save the values before clearing.",
      "Render hero: `ENTITY|hero|player|180|220|24|24|80`. Enemies at x = 60 + i*100.",
      "After `--- RESTART ---`, clear state, then call `loadCheckpoint` with the saved values.",
    ],
    estimatedMinutes: 8,
  },
};
