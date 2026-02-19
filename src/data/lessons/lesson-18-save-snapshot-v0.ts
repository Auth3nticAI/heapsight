import type { Lesson } from "@/types/lesson";

export const lesson18: Lesson = {
  id: "18-save-snapshot-v0",
  title: "Save Snapshot v0",
  description: "Serialize game state to key-value format. Save wave, score, lives, hp. Load them back. The game is just data.",
  order: 18,
  xpReward: 125,
  tier: "pro",
  concepts: ["file I/O", "serialization", "game state persistence", "save/load"],
  part1: {
    title: "Concept: Save Snapshot v0",
    type: "concept",
    instructions: `# Save Snapshot v0

Save = serialize state to string. Load = parse string back to state. The game is just data. Saving is writing data. Loading is reading it back.

## Mental Model

Game state is variables: wave, score, lives, hp. Serialization converts them to text: \\\`wave=3\\nscore=500\\nlives=2\\nhp=75\\\`. Load parses text back to variables. The format IS the save file contract. If you change the format, old saves break.

## What Breaks

Without saving, every play session starts from scratch. Die at wave 10? Start over. No persistence = no progression. Players invest time. Saving protects that investment. Without it, your game disrespects the player.

## The Fix

\\\`saveGame(wave, score, lives, hp)\\\` outputs key=value lines. \\\`loadGame()\\\` parses them back. For now, we simulate with string output — the pattern is identical to real file I/O.

\`\`\`cpp
void saveGame(int wave, int score, int lives, int hp) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|lives=" << lives << endl;
    cout << "SAVE|hp=" << hp << endl;
}
\`\`\`

The SAVE prefix simulates writing to a file. In a real game, you would replace \\\`cout\\\` with \\\`ofstream\\\`. The serialization format stays the same.

## Performance Insight

File I/O is slow — milliseconds per write. A frame is 16ms at 60fps. One file write can consume 10-20% of your frame budget. Never save during gameplay frames. Save between waves, on pause, or on quit. Batch all state into one write operation.

## Memory Insight

Save data: a few strings totaling about 100 bytes. Negligible. The cost is not memory — it is I/O latency. The disk is 1000x slower than RAM.

## Beginner Trap

Saving during every frame. File writes block the thread. 60 saves per second = constant disk thrashing = visible stutter. Save on events only: wave end, pause, quit. One save operation, not sixty.

## Elite Insight

Dark Souls saves on bonfire rest. Minecraft saves chunks asynchronously in a background thread. Celeste saves after each room transition. The timing of save operations is a design decision that affects both performance and game feel.

## Systems Thinking Connection

Serialization is the bridge between runtime state and persistent storage. Your game variables exist in RAM during play. Saving snapshots them to disk. Loading restores them. This is the foundation for save files, replays, networking, and undo systems.

## Skill Reinforcement

You already know variables, functions, and cout from earlier lessons. This lesson applies them to a new problem: persistence. The same print statements you have been using for debug output now serve as a serialization mechanism.

## Mastery Check

Why key=value format? Because it is human-readable, debuggable, and extensible. Add a new field? Add a new line. Binary formats are faster but unreadable. For a first save system, readability wins.

## Your Task

1. Set initial game state: wave=3, score=500, lives=2, hp=75
2. Print the current state
3. Call saveGame() — outputs SAVE|key=value lines
4. Print "Game saved" message
5. Simulate loading — parse values back into variables
6. Print "State restored" message with the loaded wave number`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write saveGame(int wave, int score, int lives, int hp)
// Output: SAVE|wave=N, SAVE|score=N, SAVE|lives=N, SAVE|hp=N

// TODO: Write loadGame that outputs LOAD|key=value lines
// and restores values to reference parameters

int main() {
    // Game state
    int wave = 3;
    int score = 500;
    int lives = 2;
    int hp = 75;

    // Print current state
    cout << "=== GAME STATE ===" << endl;
    // Print: wave=N score=N lives=N hp=N

    // Save
    cout << endl << "=== SAVING ===" << endl;
    // Call saveGame
    // Print saved message

    // Load
    cout << endl << "=== LOADING ===" << endl;
    // Simulate loading values back
    // Print LOAD lines

    // Verify restoration
    cout << endl << "=== RESTORED STATE ===" << endl;
    // Print restored state
    // Print restoration message

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
              int savedWave, int savedScore, int savedLives, int savedHp) {
    wave = savedWave;
    score = savedScore;
    lives = savedLives;
    hp = savedHp;
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|lives=" << lives << endl;
    cout << "LOAD|hp=" << hp << endl;
}

int main() {
    // Game state
    int wave = 3;
    int score = 500;
    int lives = 2;
    int hp = 75;

    // Print current state
    cout << "=== GAME STATE ===" << endl;
    cout << "wave=" << wave << " score=" << score
         << " lives=" << lives << " hp=" << hp << endl;

    // Save
    cout << endl << "=== SAVING ===" << endl;
    saveGame(wave, score, lives, hp);
    cout << "GAME_MESSAGE|Game saved to data/save.txt" << endl;

    // Simulate "restart" — corrupt the values
    int savedWave = wave;
    int savedScore = score;
    int savedLives = lives;
    int savedHp = hp;

    // Load
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
        id: "t1",
        description: "Should output SAVE lines with correct values",
        expectedOutput: "SAVE|wave=3",
      },
      {
        id: "t2",
        description: "Should output SAVE score line",
        expectedOutput: "SAVE|score=500",
      },
      {
        id: "t3",
        description: "Should output LOAD lines with correct values",
        expectedOutput: "LOAD|wave=3",
      },
      {
        id: "t4",
        description: "Should show Game saved message",
        expectedOutput: "GAME_MESSAGE|Game saved to data/save.txt",
      },
      {
        id: "t5",
        description: "Should show State restored message",
        expectedOutput: "GAME_MESSAGE|State restored. Continuing from wave 3.",
      },
    ],
    hints: [
      "`saveGame` takes wave, score, lives, hp and prints `SAVE|key=value` for each. Four cout statements.",
      "`loadGame` takes references to wave, score, lives, hp plus the saved values. Assign saved values to references, then print `LOAD|key=value` for each.",
      "The saved message uses `GAME_MESSAGE|Game saved to data/save.txt` — this simulates actual file output.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Save and Restore",
    type: "game_builder",
    instructions: `# Game Builder: Save and Restore

Simulate a full play session: advance through 3 waves, save state, "restart" by resetting all variables, then load the saved state and verify restoration. This is the complete save/load lifecycle.

## Mental Model

The save file is a snapshot of your game's entire mutable state at one instant. Wave number, score, lives, HP — everything the player has earned. The load function is a time machine that restores that instant.

## What Breaks

Without save/load, progress is volatile. RAM is cleared on exit. The player's 45-minute run evaporates when they close the game. Save/load converts ephemeral RAM state into persistent disk state.

## The Fix

Save after each wave. Store wave, score, lives, hp as key=value pairs. On load, parse them back. Verify by comparing pre-save and post-load values. If they match, the save system works.

## Performance Insight

Save once per wave, not once per frame. Wave completion is a natural save point — the game is briefly idle between waves. Use that idle time for I/O.

## Memory Insight

Four integers = 16 bytes of save data. Even with string serialization overhead, under 100 bytes. The save file is tiny. The value to the player is enormous.

## Beginner Trap

Forgetting to save a critical variable. If you save wave and score but forget lives and hp, the player loads with default values. Partial saves corrupt the experience. Always serialize ALL mutable state.

## Elite Insight

Professional save systems version their format. Save file header: \\\`version=1\\\`. When you add a new field in v2, the loader checks the version and handles missing fields gracefully. Forward compatibility from day one.

## Systems Thinking Connection

Serialization connects to every system that needs persistence: save files, config files, network sync, replay recording. The key=value pattern here scales to JSON, binary formats, and database schemas.

## Skill Reinforcement

You are using functions, references, and formatted output — all from previous lessons. The new concept is persistence: capturing state at a point in time and restoring it later.

## Mastery Check

What happens if you change the save format but do not update the loader? The loader reads the old format, misparses the new fields, and either crashes or loads garbage data. Format versioning prevents this.

## Your Task

1. Start game state: wave=1, score=0, lives=3, hp=100
2. Simulate 3 waves: each wave adds 150 to score, wave 2 loses 1 life and 25 hp
3. After wave 3: save the state (wave=3, score=450, lives=2, hp=75)
4. "Restart" the game: reset wave=1, score=0, lives=3, hp=100
5. Load saved state: restore all values
6. Verify: play one more wave from the restored state
7. Output final state with GAME_MESSAGE protocol`,
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
    // Wave 3: score += 150, wave++ (wave becomes 4, but we save as wave 3 completed)

    // TODO: Save state after wave 3
    // Store saved values, then call saveGame

    // TODO: Print saved message

    // TODO: Simulate restart - reset all to defaults

    // TODO: Load saved state

    // TODO: Print restored state and verification message

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

    // Save state after wave 3
    cout << endl << "=== SAVING ===" << endl;
    int savedWave = wave;
    int savedScore = score;
    int savedLives = lives;
    int savedHp = hp;
    saveGame(wave, score, lives, hp);
    cout << "GAME_MESSAGE|Game saved to data/save.txt" << endl;

    // Simulate restart
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
        expectedOutput: "SAVE|wave=3",
      },
      {
        id: "g2",
        description: "Should save score 450",
        expectedOutput: "SAVE|score=450",
      },
      {
        id: "g3",
        description: "Should save lives 2",
        expectedOutput: "SAVE|lives=2",
      },
      {
        id: "g4",
        description: "Should save hp 75",
        expectedOutput: "SAVE|hp=75",
      },
      {
        id: "g5",
        description: "Should show Game saved message",
        expectedOutput: "GAME_MESSAGE|Game saved to data/save.txt",
      },
      {
        id: "g6",
        description: "Should load wave 3",
        expectedOutput: "LOAD|wave=3",
      },
      {
        id: "g7",
        description: "Should restore state and continue from wave 3",
        expectedOutput: "GAME_MESSAGE|State restored. Continuing from wave 3.",
      },
    ],
    hints: [
      "Wave 1: score=150, wave=2. Wave 2: score=300, lives=2, hp=75, wave=3. Wave 3: score=450. Save at wave=3.",
      "Store saved values in separate variables BEFORE resetting. `int savedWave = wave;` etc. Then pass them to loadGame.",
      "loadGame takes references to the live variables and the saved values. It assigns saved to live, then prints LOAD lines.",
    ],
    estimatedMinutes: 8,
  },
};
