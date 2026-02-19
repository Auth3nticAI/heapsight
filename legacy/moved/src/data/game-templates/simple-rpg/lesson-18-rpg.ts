import type { GameLessonVariant } from "@/types/game";

export const lesson18RPG: GameLessonVariant = {
  lessonId: "rpg-18-save",

  instructions: `# Save Gold v1 — Persistence

## Mental Model

Save is serialization. Game state becomes text. Text becomes game state. Persistence is just a pattern.

The game loop generates state: wave number, score, hit points, gold. When the player quits, that state lives only in RAM. RAM is volatile. The save system is the bridge: it transforms volatile state into durable text and writes it somewhere that survives the session. Load is the reverse bridge: reads the text, parses it, restores the state.

This pattern is everywhere. Configuration files are saved application state. Game replays are saved input streams. Network packets are serialized function calls. The key-value format — \\\`SAVE|wave=3\\\` — is the simplest possible serialization. It is also remarkably powerful. Every major game engine started with something this simple.

## What Breaks Without This

Without persistence, the player's dungeon run is a sand painting: beautiful, then gone. Every session starts at wave 1 with no gold. The economy built over an hour of play evaporates at quit. Players do not return to games that do not save. Persistence is not optional. It is the social contract between developer and player: your progress matters, we will keep it.

## The Fix

Two symmetric functions. saveGame writes. loadGame reads. The format is self-describing:

\\\`\\\`\\\`cpp
void saveGame(int wave, int score, int hp, int gold) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|hp=" << hp << endl;
    cout << "SAVE|gold=" << gold << endl;
}

void loadGame(int& wave, int& score, int& hp, int& gold) {
    // In production: read from file, parse each line
    // In simulation: restore known values
    wave = 2; score = 50; hp = 100; gold = 50;
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|hp=" << hp << endl;
    cout << "LOAD|gold=" << gold << endl;
}
\\\`\\\`\\\`

The SAVE prefix makes lines machine-parseable. A real parser would split on \\\`|\\\` then \\\`=\\\`. Your simulation prints the loaded values to prove the restoration succeeded.

## Pattern Insight

Dark Souls' checkpoint system is this pattern. Every time you rest at a bonfire the engine serializes: character level, estus count, current bonfire ID, boss kill flags, item inventory. The save file is a binary blob but conceptually identical to your SAVE|key=value lines. Same structure: write fields sequentially, read them back in the same order. The format is an implementation detail. The pattern is not.

## Scalability Insight

Your save covers four fields. A production RPG save covers hundreds: each quest flag, each NPC disposition value, each dungeon room explored, each item in inventory. The system scales linearly — one more field is one more \\\`SAVE|\\\` line. For performance, switch from text to binary: write raw \\\`int\\\` bytes with \\\`fwrite\\\`, read back with \\\`fread\\\`. The pattern is identical. The text format is the prototype. Binary is the production optimization.

## Your Task

Two-round combat with full save-load cycle:

**Round 1:** Enemy at (10,3), HP 30. Player at (10,5), HP 100, gold=0. Attack 3 times (10 dmg). Enemy dies. Gold +25. Render grid. Print \\\`HUD|ROUND:1|HP:100|GOLD:25\\\`.

**Round 2:** Second enemy at (5,3), HP 30. Player moves to (5,4). Attack 3 times. Enemy dies. Gold +25. Render grid. Print \\\`HUD|ROUND:2|HP:100|GOLD:50\\\`.

**Save:** Call \\\`saveGame(2, 50, 100, 50)\\\` — prints four SAVE lines.

**Reset:** Set wave, score, hp, gold to 0.

**Load:** Call \\\`loadGame(wave, score, hp, gold)\\\` — restores and prints four LOAD lines.

**Verify:** Print \\\`GAME_MESSAGE|Progress preserved\\\`.

## Common Mistake (Beginner Trap)

Passing by value to loadGame. \\\`void loadGame(int wave, ...)\\\` gives the function a copy. Assignments inside change the copy, not the original. The caller's variables stay at 0. The load appears to work (LOAD lines print) but the values are gone when the function returns. Reference parameters (\\\`int& wave\\\`) are not optional — they are the mechanism by which load actually restores state.

## Elite Insight (Skyrim, Diablo, Zelda)

Zelda: Breath of the Wild writes save data to the Nintendo Switch's NAND flash. The save file contains: map reveal bitfield (covering every 32x32 meter tile of the world), korok seed bitmask (900 seeds × 1 bit), shrine completion flags, inventory as a serialized item array, and player position as three floats. The file is about 50KB. Your save file would be about 40 bytes. The Zelda team built a custom serializer that handles version migration — if the game updates and adds new fields, old saves are forward-compatible. Your format would add new SAVE| lines. Same extension pattern.

## Pattern Recognition

The save system is the Memento pattern (GoF) applied to game state. The memento captures an object's internal state without exposing its implementation. In games: the memento is the save file. The originator is the game session. The caretaker is the file system. You just implemented Memento for a dungeon RPG. The pattern shows up in: undo systems, version control (git commits are mementos), browser history, and debugging checkpoints.

## Skill Reinforcement

- Pass-by-reference for out parameters: \\\`int& wave\\\` — the function writes back through the reference
- Symmetric design: save writes what load reads, in the same order, with the same names
- State verification: print loaded values to prove restoration succeeded
- Protocol format: SAVE|key=value is machine-parseable — the delimiter is a design choice, not an accident

## Mastery Check

Why reset variables to 0 between saveGame and loadGame? To prove that loadGame genuinely restores state rather than relying on variables that were already set. If you skip the reset, the Restored output looks correct even with a broken loadGame. The reset is a self-test: it creates the failure condition that loadGame must survive. This is the structure of a unit test. You just wrote one implicitly.`,

  starterCode: `#include <iostream>
using namespace std;

void saveGame(int wave, int score, int hp, int gold) {
    // TODO: Print SAVE|key=value for wave, score, hp, gold
}

void loadGame(int& wave, int& score, int& hp, int& gold) {
    // TODO: Set wave=2, score=50, hp=100, gold=50
    // Print LOAD|key=value for each
}

void renderGrid(int px, int py, int e1x, int e1y, bool e1alive,
                int e2x, int e2y, bool e2alive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == e1x && row == e1y) {
                cout << 'E';
            } else if (e2alive && col == e2x && row == e2y) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    int playerX = 10, playerY = 5;
    int playerHP = 100, playerGold = 0;

    // === ROUND 1: enemy at (10,3) ===
    // Attack 3x10 -> dies -> gold += 25
    // renderGrid -> HUD|ROUND:1|HP:100|GOLD:25

    // === ROUND 2: enemy at (5,3) ===
    // Player moves to (5,4), attacks 3x -> dies -> gold += 25
    // renderGrid -> HUD|ROUND:2|HP:100|GOLD:50

    // === SAVE: saveGame(2, 50, 100, 50) ===

    // === RESET ===
    int wave = 0, score = 0, hp = 0, gold = 0;

    // === LOAD: loadGame(wave, score, hp, gold) ===

    // === VERIFY ===
    // GAME_MESSAGE|Progress preserved

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

void saveGame(int wave, int score, int hp, int gold) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|hp=" << hp << endl;
    cout << "SAVE|gold=" << gold << endl;
}

void loadGame(int& wave, int& score, int& hp, int& gold) {
    wave = 2; score = 50; hp = 100; gold = 50;
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|hp=" << hp << endl;
    cout << "LOAD|gold=" << gold << endl;
}

void renderGrid(int px, int py, int e1x, int e1y, bool e1alive,
                int e2x, int e2y, bool e2alive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == e1x && row == e1y) {
                cout << 'E';
            } else if (e2alive && col == e2x && row == e2y) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    int playerX = 10, playerY = 5;
    int playerHP = 100, playerGold = 0;

    // === ROUND 1 ===
    int e1x = 10, e1y = 3, e1hp = 30;
    bool e1alive = true;
    for (int i = 0; i < 3; i++) {
        e1hp -= 10;
        if (e1hp <= 0 && e1alive) { e1alive = false; playerGold += 25; }
    }
    renderGrid(playerX, playerY, e1x, e1y, e1alive, 0, 0, false);
    cout << "HUD|ROUND:1|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // === ROUND 2 ===
    int e2x = 5, e2y = 3, e2hp = 30;
    bool e2alive = true;
    playerX = 5; playerY = 4;
    for (int i = 0; i < 3; i++) {
        e2hp -= 10;
        if (e2hp <= 0 && e2alive) { e2alive = false; playerGold += 25; }
    }
    renderGrid(playerX, playerY, e1x, e1y, e1alive, e2x, e2y, e2alive);
    cout << "HUD|ROUND:2|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // === SAVE ===
    saveGame(2, playerGold, playerHP, playerGold);

    // === RESET ===
    int wave = 0, score = 0, hp = 0, gold = 0;

    // === LOAD ===
    loadGame(wave, score, hp, gold);

    // === VERIFY ===
    cout << "GAME_MESSAGE|Progress preserved" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Round 1 HUD shows GOLD 25 after first enemy kill",
      expectedOutput: "HUD\\|ROUND:1\\|HP:100\\|GOLD:25",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Round 2 HUD shows GOLD 50 after second enemy kill",
      expectedOutput: "HUD\\|ROUND:2\\|HP:100\\|GOLD:50",
      isPattern: true,
    },
    {
      id: "g3",
      description: "SAVE|wave=2 printed — wave serialized correctly",
      expectedOutput: "SAVE\\|wave=2",
      isPattern: true,
    },
    {
      id: "g4",
      description: "SAVE|gold=50 printed — accumulated gold serialized correctly",
      expectedOutput: "SAVE\\|gold=50",
      isPattern: true,
    },
    {
      id: "g5",
      description: "LOAD|gold=50 printed — gold restored from save data",
      expectedOutput: "LOAD\\|gold=50",
      isPattern: true,
    },
    {
      id: "g6",
      description: "GAME_MESSAGE announces progress preserved",
      expectedOutput: "GAME_MESSAGE\\|Progress preserved",
      isPattern: true,
    },
  ],

  hints: [
    "loadGame parameters must be references: \\\`int& wave, int& score, int& hp, int& gold\\\`. Without the \\\`&\\\`, assignments inside loadGame do not reach the caller's variables.",
    "After the save call, reset wave/score/hp/gold to 0 before calling loadGame. This proves loadGame is doing real work, not relying on already-correct values.",
    "Round 1: only e1 is alive, e2 does not exist — pass \\\`0, 0, false\\\` for e2 in renderGrid. Round 2: e1 is dead, e2 is also dead — both render as dots.",
    "Gold accumulates: e1 kill gives +25 (total 25), e2 kill gives +25 (total 50). Pass playerGold=50 to saveGame.",
    "The GAME_MESSAGE is the final line. It comes after all LOAD lines. No additional output after it.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lessons 1-18
// Save System + Free List Pool
// ==============================

// === SAVE SYSTEM ===
// Serializes game state as SAVE|key=value lines
// Deserializes with LOAD|key=value confirmation
// Pattern: memory -> text -> disk -> text -> memory

void saveGame(int wave, int score, int hp, int gold) {
    cout << "SAVE|wave=" << wave << endl;
    cout << "SAVE|score=" << score << endl;
    cout << "SAVE|hp=" << hp << endl;
    cout << "SAVE|gold=" << gold << endl;
}

void loadGame(int& wave, int& score, int& hp, int& gold) {
    // Simulation: restore from known saved values
    wave = 2; score = 50; hp = 100; gold = 50;
    cout << "LOAD|wave=" << wave << endl;
    cout << "LOAD|score=" << score << endl;
    cout << "LOAD|hp=" << hp << endl;
    cout << "LOAD|gold=" << gold << endl;
}

// === FREE LIST POOL (from Lesson 17) ===
const int MAX_ENEMIES = 8;
bool alive[MAX_ENEMIES];
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int enemyHP[MAX_ENEMIES];
int freeList[MAX_ENEMIES];
int freeTop = 0, nextId = 0;

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

int spawnEnemy(int x, int y, int hp = 30) {
    int id = (freeTop > 0) ? freeList[--freeTop] : nextId++;
    alive[id] = true; ex[id] = x; ey[id] = y; enemyHP[id] = hp;
    return id;
}

void despawnEnemy(int id) {
    alive[id] = false;
    freeList[freeTop++] = id;
}

// === GRID RENDER ===
void renderGrid(int px, int py) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < MAX_ENEMIES; i++) {
                    if (alive[i] && ex[i] == col && ey[i] == row) {
                        cell = 'E'; break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    int playerX = 10, playerY = 5;
    int playerHP = 100, playerGold = 0;

    // Round 1
    int a = spawnEnemy(10, 3, 30);
    for (int i = 0; i < 3; i++) {
        enemyHP[a] -= 10;
        if (enemyHP[a] <= 0 && alive[a]) { despawnEnemy(a); playerGold += 25; }
    }
    renderGrid(playerX, playerY);
    cout << "HUD|ROUND:1|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // Round 2
    int b = spawnEnemy(5, 3, 30);
    playerX = 5; playerY = 4;
    for (int i = 0; i < 3; i++) {
        enemyHP[b] -= 10;
        if (enemyHP[b] <= 0 && alive[b]) { despawnEnemy(b); playerGold += 25; }
    }
    renderGrid(playerX, playerY);
    cout << "HUD|ROUND:2|HP:" << playerHP << "|GOLD:" << playerGold << endl;

    // Save
    saveGame(2, playerGold, playerHP, playerGold);

    // Reset + Load
    int wave = 0, score = 0, hp = 0, gold = 0;
    loadGame(wave, score, hp, gold);

    cout << "GAME_MESSAGE|Progress preserved" << endl;

    return 0;
}
`,
};
