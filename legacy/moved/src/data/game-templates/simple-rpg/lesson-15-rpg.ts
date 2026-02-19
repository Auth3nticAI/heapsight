import type { GameLessonVariant } from "@/types/game";

export const lesson15RPG: GameLessonVariant = {
  lessonId: "rpg-15-combat-loop",

  instructions: `# Milestone 15: The Combat Loop Works

## MILESTONE ACHIEVED

You have built the game loop. Stop and recognize what that means.

Input, Update, Render. Three phases, every frame. That's the heartbeat. Every game from Pong to Elden Ring runs this loop.

You started with a 20x10 grid and a \\\`@\\\` character. Lesson by lesson you added Position, Stats, movement, bounds, combat, death, gold drops, pickups, composition, vectors. Now you run it all through the structure that holds every real-time interactive experience ever made. You are not learning toy code. You are learning the architecture of the medium.

This milestone is real. Celebrate it.

## Mental Model

The loop has three phases. They never change. What changes is the content:

\\\`\\\`\\\`
while (game is running) {
    [INPUT]  — read what happened (player pressed key, AI made decision)
    [UPDATE] — apply all logic (movement, physics, combat, death, economy)
    [RENDER] — draw current state (grid, HUD, effects)
}
\\\`\\\`\\\`

In this lesson you run 5 explicit frames manually. Frame 1 spawns enemies. Frames 2-3 move the player into position. Frames 3-5 execute combat, one attack per frame. Frame 5 kills the enemy, drops gold, updates the score. The RENDER phase after each UPDATE draws current state — no divergence, no lying about the world.

## What Breaks Without This

Without phase separation, update and render are interleaved. You update the player's position and immediately draw. Then you update the enemy's HP and immediately draw again. The player sees two partial frames, not one complete one. Visual glitches. State inconsistency. The world shown does not match the world simulated.

The loop contract: UPDATE is complete before RENDER begins. Every entity is in its final frame state when the render reads it. One frame, one consistent snapshot. Always.

## The Fix

Three clearly labeled phases per frame. Log them. See them. Internalize the sequence. Then run 5 frames with real game events:

- Frame 1: Spawn. World begins.
- Frame 2: Move toward threat.
- Frame 3: Engage. First hit lands.
- Frame 4: Pressure. Second hit lands.
- Frame 5: Kill. Gold drops. Economy updates. Score climbs.

The game loop handles all of it. The structure never changes. The data does.

## Pattern Insight

The game loop predates video games. Pinball machines use it. The machine reads the state of all bumpers and flippers (INPUT), calculates the ball's new position based on physics (UPDATE), and lights up the appropriate displays and solenoids (RENDER). Your software loop is the same pattern, running on a CPU instead of relay switches. The pattern is that old. It is that universal.

## Scalability Insight

Your 5-frame loop becomes a 5-million-frame loop by wrapping it in \\\`while (true)\\\`. Every frame is identical in structure. New systems slot into UPDATE as function calls. New visuals slot into RENDER as draw calls. The loop itself never changes because there is nothing to change — it is already the correct abstraction. You scale content, not structure.

## Your Task

Build the full 5-frame combat loop with grid render each frame:

1. Frame 1: Spawn 3 enemies at (5,3), (10,3), (15,3) with Stats(30,30,10). Player at (8,5). Render.
2. Frame 2: Player moves to (9,4). Render with player at new position.
3. Frame 3: Player moves to (10,4). Attack enemy at (10,3): HP 30 → 20. Render.
4. Frame 4: Attack again: HP 20 → 10. Render.
5. Frame 5: Final attack: HP 10 → 0. \\\`alive[1] = false\\\`. Gold spawns at (10,3). \\\`score += 100\\\`. Render — G appears, E at (10,3) gone.

After the loop output:
- \\\`HUD|HP:100|SCORE:100|LIVES:3\\\`
- \\\`GAME_MESSAGE|Milestone 15: The combat loop works!\\\`
- \\\`SCORE|100\\\`

## Common Mistake

Applying all 3 attacks in frame 3. This is turn-based combat: one attack per frame. The damage sequence must be 30 → 20 → 10 → 0 across frames 3, 4, 5. Each frame checks adjacency and alive before applying damage. The death trigger fires only when HP reaches 0 — only in frame 5.

## Elite Insight

Professional engines separate the loop into more sub-phases: PreUpdate (clear last frame's events), FixedUpdate (physics at fixed timestep), Update (game logic), LateUpdate (camera follows entity that just moved), Render. Your three phases map to PreUpdate+FixedUpdate+Update = \\\`[UPDATE]\\\` and Render = \\\`[RENDER]\\\`. The principle is identical. The granularity increases with complexity.

## Pattern Recognition

You now understand why game developers call everything "systems." The movement system runs in UPDATE. The combat system runs in UPDATE. The render system runs in RENDER. The audio system runs in RENDER. They are functions called at the right phase in the loop. Architecting a game is deciding which functions go in which phases and in what order. You are now doing that.

## Skill Reinforcement

Every skill from Lessons 1-14, unified:
- Grid render (L1-L5)
- Movement and bounds (L6-L7)
- Combat and alive flags (L8)
- isAdjacent (L9)
- Gold drop (L10)
- Component structs (L11-L13)
- Dynamic vectors (L14)
- Game loop structure (L15)

This is the stack. You built it lesson by lesson. It is now complete enough to run a game.

## Mastery Check

What does "stable" mean in "Stable Combat Loop"? It means the loop produces deterministic, reproducible output given the same input sequence. Frame 3 always produces enemy HP 20. Frame 5 always produces the kill and the gold drop. No race conditions. No order ambiguity. No visual lying. Every frame is a complete, consistent snapshot. That stability is what makes a game trustworthy. Players trust games that behave consistently. Bugs destroy trust. The loop enforces consistency. Stability is earned by structure, not by luck.`,

  starterCode: `#include <iostream>
#include <vector>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

void renderGrid(int playerX, int playerY,
                vector<Position>& positions, vector<bool>& alive,
                bool goldActive, int goldX, int goldY) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) { cout << '#'; continue; }
            if (col == playerX && row == playerY) { cout << '@'; continue; }
            if (goldActive && col == goldX && row == goldY) { cout << 'G'; continue; }
            bool found = false;
            for (int i = 0; i < (int)positions.size(); i++) {
                if (alive[i] && col == positions[i].x && row == positions[i].y) {
                    cout << 'E'; found = true; break;
                }
            }
            if (!found) cout << '.';
        }
        cout << endl;
    }
}

int main() {
    vector<Position> positions;
    vector<Stats> stats;
    vector<bool> alive;

    int playerX = 8, playerY = 5;
    int playerHP = 100;
    int score = 0;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    for (int frame = 1; frame <= 5; frame++) {
        cout << "--- FRAME " << frame << " ---" << endl;
        cout << "[INPUT]" << endl;
        cout << "[UPDATE]" << endl;

        // TODO: Frame 1 — spawn 3 enemies at (5,3),(10,3),(15,3) stats(30,30,10)
        // TODO: Frame 2 — player moves to (9,4)
        // TODO: Frame 3 — player moves to (10,4), attack enemy at (10,3) HP->20
        // TODO: Frame 4 — attack enemy HP->10
        // TODO: Frame 5 — attack, death, gold spawns at (10,3), score+=100

        cout << "[RENDER]" << endl;
        renderGrid(playerX, playerY, positions, alive, goldActive, goldX, goldY);
        cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    }

    cout << "GAME_MESSAGE|Milestone 15: The combat loop works!" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <vector>
using namespace std;

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

void renderGrid(int playerX, int playerY,
                vector<Position>& positions, vector<bool>& alive,
                bool goldActive, int goldX, int goldY) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) { cout << '#'; continue; }
            if (col == playerX && row == playerY) { cout << '@'; continue; }
            if (goldActive && col == goldX && row == goldY) { cout << 'G'; continue; }
            bool found = false;
            for (int i = 0; i < (int)positions.size(); i++) {
                if (alive[i] && col == positions[i].x && row == positions[i].y) {
                    cout << 'E'; found = true; break;
                }
            }
            if (!found) cout << '.';
        }
        cout << endl;
    }
}

int main() {
    vector<Position> positions;
    vector<Stats> stats;
    vector<bool> alive;

    int playerX = 8, playerY = 5;
    int playerHP = 100;
    int score = 0;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    for (int frame = 1; frame <= 5; frame++) {
        cout << "--- FRAME " << frame << " ---" << endl;
        cout << "[INPUT]" << endl;
        cout << "[UPDATE]" << endl;

        if (frame == 1) {
            positions.push_back({5, 3});  stats.push_back({30, 30, 10}); alive.push_back(true);
            positions.push_back({10, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
            positions.push_back({15, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
        }
        if (frame == 2) {
            playerX = 9; playerY = 4;
        }
        if (frame == 3) {
            playerX = 10; playerY = 4;
            if (isAdjacent(playerX, playerY, positions[1].x, positions[1].y) && alive[1]) {
                stats[1].hp -= 10;
            }
        }
        if (frame == 4) {
            if (isAdjacent(playerX, playerY, positions[1].x, positions[1].y) && alive[1]) {
                stats[1].hp -= 10;
            }
        }
        if (frame == 5) {
            if (isAdjacent(playerX, playerY, positions[1].x, positions[1].y) && alive[1]) {
                stats[1].hp -= 10;
                if (stats[1].hp <= 0) {
                    alive[1] = false;
                    goldActive = true;
                    goldX = positions[1].x;
                    goldY = positions[1].y;
                    score += 100;
                }
            }
        }

        cout << "[RENDER]" << endl;
        renderGrid(playerX, playerY, positions, alive, goldActive, goldX, goldY);
        cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    }

    cout << "GAME_MESSAGE|Milestone 15: The combat loop works!" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "All 5 frame headers appear",
      expectedOutput: "--- FRAME 5 ---",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Each frame has [RENDER] phase header",
      expectedOutput: "\\[RENDER\\]",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Frame 5 grid shows G — gold dropped at kill position",
      expectedOutput: "G",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Frame 5 HUD shows SCORE:100 after kill",
      expectedOutput: "HUD\\|HP:100\\|SCORE:100\\|LIVES:3",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Milestone game message appears after the loop",
      expectedOutput: "GAME_MESSAGE\\|Milestone 15: The combat loop works!",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Final SCORE protocol output is 100",
      expectedOutput: "SCORE\\|100",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Top wall renders as 20 hashes",
      expectedOutput: "####################",
      isPattern: true,
    },
  ],

  hints: [
    "Enemy at (10,3) is index 1 in the vector (spawn order: index 0 = (5,3), index 1 = (10,3), index 2 = (15,3)). The player moves to (10,4) in frame 3 — exactly adjacent to (10,3). Use \`isAdjacent(playerX, playerY, positions[1].x, positions[1].y)\`.",
    "One attack per frame in frames 3, 4, 5. Frame 3: HP 30 → 20. Frame 4: HP 20 → 10. Frame 5: HP 10 → 0. The death trigger (alive[1]=false, goldActive=true, goldX/goldY set, score+=100) goes inside \`if (stats[1].hp <= 0)\` inside the frame 5 block.",
    "The renderGrid function is provided — call it with current state in the [RENDER] section of each frame. Since UPDATE runs before RENDER, the grid always shows post-update state. Frame 5's grid shows G because goldActive was set in frame 5's UPDATE phase.",
    "This is a milestone. If your output matches all 7 tests, you have a working game loop. You built a grid, entities, movement, combat, death, loot, economy, and the loop that holds them. That is the foundation of every game.",
  ],

  accumulatedCode: `#include <iostream>
#include <vector>
using namespace std;

// ==============================
// RPG CORE — Lessons 1-15
// MILESTONE: Stable Combat Loop
// ==============================

struct Position { int x, y; };
struct Stats { int hp, maxHp, attack; };

// Optional components (composition pattern from L11-L13)
struct Shield { int current; };
struct Speed  { int dx, dy; };

bool isAdjacent(int ax, int ay, int bx, int by) {
    int dx = ax - bx; if (dx < 0) dx = -dx;
    int dy = ay - by; if (dy < 0) dy = -dy;
    return (dx + dy) <= 1;
}

// === RENDER SYSTEM ===
// Reads entity state — always called after UPDATE completes
void renderGrid(int playerX, int playerY,
                vector<Position>& positions, vector<bool>& alive,
                bool goldActive, int goldX, int goldY) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) { cout << '#'; continue; }
            if (col == playerX && row == playerY) { cout << '@'; continue; }
            if (goldActive && col == goldX && row == goldY) { cout << 'G'; continue; }
            bool found = false;
            for (int i = 0; i < (int)positions.size(); i++) {
                if (alive[i] && col == positions[i].x && row == positions[i].y) {
                    cout << 'E'; found = true; break;
                }
            }
            if (!found) cout << '.';
        }
        cout << endl;
    }
}

int main() {
    // === ENTITY SYSTEM (parallel vectors, from L14) ===
    vector<Position> positions;
    vector<Stats>    stats;
    vector<bool>     alive;

    // === PLAYER STATE ===
    int playerX = 8, playerY = 5;
    int playerHP = 100;
    int playerGold = 0;
    int score = 0;

    // === LOOT STATE ===
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // === GAME LOOP: 5 explicit frames ===
    // Structure: [INPUT] -> [UPDATE] -> [RENDER]
    // UPDATE always completes before RENDER reads state
    for (int frame = 1; frame <= 5; frame++) {
        cout << "--- FRAME " << frame << " ---" << endl;
        cout << "[INPUT]" << endl;
        cout << "[UPDATE]" << endl;

        if (frame == 1) {
            // Spawn wave — push to all parallel vectors atomically
            positions.push_back({5, 3});  stats.push_back({30, 30, 10}); alive.push_back(true);
            positions.push_back({10, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
            positions.push_back({15, 3}); stats.push_back({30, 30, 10}); alive.push_back(true);
        }
        if (frame == 2) { playerX = 9; playerY = 4; }
        if (frame == 3) {
            playerX = 10; playerY = 4;
            if (isAdjacent(playerX, playerY, positions[1].x, positions[1].y) && alive[1])
                stats[1].hp -= 10;
        }
        if (frame == 4) {
            if (isAdjacent(playerX, playerY, positions[1].x, positions[1].y) && alive[1])
                stats[1].hp -= 10;
        }
        if (frame == 5) {
            if (isAdjacent(playerX, playerY, positions[1].x, positions[1].y) && alive[1]) {
                stats[1].hp -= 10;
                if (stats[1].hp <= 0) {
                    alive[1] = false;          // Tombstone deletion — index preserved
                    goldActive = true;          // Loot spawns at kill position
                    goldX = positions[1].x;
                    goldY = positions[1].y;
                    score += 100;
                }
            }
        }

        // RENDER always after UPDATE — reads final frame state
        cout << "[RENDER]" << endl;
        renderGrid(playerX, playerY, positions, alive, goldActive, goldX, goldY);
        cout << "HUD|HP:" << playerHP << "|SCORE:" << score << "|LIVES:3" << endl;
    }

    // === PROTOCOL OUTPUT ===
    cout << "GAME_MESSAGE|Milestone 15: The combat loop works!" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
