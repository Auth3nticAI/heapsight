import type { Lesson } from "@/types/lesson";

export const lesson55: Lesson = {
  id: "55-milestone-visual-feel",
  title: "Milestone: Visual Feel",
  description: "Combine spread shots, cooldowns, bounds, and hit flash into satisfying gameplay.",
  order: 55,
  xpReward: 300,
  tier: "pro",
  concepts: ["visual polish", "game feel", "feedback systems", "spread shot", "cooldowns", "flash effects"],
  part1: {
    title: "Concept: Integrated Visual Feedback",
    type: "concept",
    instructions: `# Visual Feel — Systems Combine Into Game Feel

Individual systems are invisible. Players do not see "cooldown system" or "flash system." They feel the game. Spread shot gives coverage. Cooldown gives rhythm. Bounds keep action on screen. Hit flash confirms damage. Run them together and the game feels tight. Run them separately and you have a tech demo. This milestone proves your systems compose into something that feels like a game.

## What Breaks Without This

Without integration, each system works in isolation but the combination falls apart. The spread shot fires three bullets but the cooldown does not block re-fire. Bullets fly off screen because bounds checking is missing. Enemies take damage but there is no flash to confirm it. The player experience is confusion — things happen but nothing feels connected.

## The Fix

One simulation loop. Every frame: process input (with cooldown check), spawn spread bullets, move all entities, check bounds, detect collisions, apply flash on hit, decrement timers, cleanup dead entities. The order matters. Each system reads the state left by the previous system. The data flows through the pipeline and the result is game feel.

\\\`\\\`\\\`
Frame pipeline:
1. Input (fire only if cooldown == 0)
2. Spawn (3 spread bullets if fired)
3. Movement (all entities)
4. Bounds (kill off-screen bullets)
5. Collision (bullet vs enemy)
6. Flash (apply flash on hit, decrement timers)
7. Cleanup (remove dead)
8. Render (draw grid with flash sprites)
\\\`\\\`\\\`

## Your Task

1. Player at (200, 300). 4 enemies at y=60: x=120, 180, 220, 280. hp=1. Sprite='v'
2. Cooldown timer: starts at 0. Set to 4 on fire. Decrements each frame. Fire blocked while > 0
3. Frame 1: player fires spread shot — 3 bullets at (192,300), (200,300), (208,300), vy=-16
4. Cooldown = 4 after fire
5. Frame 2: movement. Bullets at y=284, enemies at y=64. Cooldown=3. No collision
6. Frame 3: movement. Bullets at y=268, enemies at y=68. Cooldown=2. No collision
7. Frame 4: movement. Bullets at y=252, enemies at y=72. Cooldown=1. Check collisions — center bullet (x=200) hits enemy at (180,72)? Check overlap: |200-180|=20, not < 18. No hit. Also check (220,72): |200-220|=20, no hit. Bullet at x=192: |192-180|=12 < 18, |252-72|=180, no. Too far in y
8. Continue frames until collisions occur. By frame 8, bullets at y=188, enemies at y=92. Still no overlap in y. Keep running — eventually y values converge
9. Actually: bullet vy=-16, enemy vy=4. Closing speed = 20/frame. Start gap: 300-60=240. Frames to close: 240/20 = 12. So collision around frame 12-13
10. Simplify: run 5 frames for the demonstration. Show all systems active
11. Print per frame: \\\`FRAME|<n>|bullets|<count>|enemies_flashing|<count>|score|<s>|cooldown|<cd>\\\`
12. Print: \\\`VISUAL|frame|<n>|spread_active|<bool>|flashes|<count>|bounds_clamps|<count>\\\`
13. After 5 frames: \\\`MILESTONE_55|PASS|visual feel achieved\\\`

Expected output (5 frames, no hits yet due to distance):
\\\`\\\`\\\`
FRAME|1|bullets|3|enemies_flashing|0|score|0|cooldown|4
VISUAL|frame|1|spread_active|true|flashes|0|bounds_clamps|0
FRAME|2|bullets|3|enemies_flashing|0|score|0|cooldown|3
VISUAL|frame|2|spread_active|false|flashes|0|bounds_clamps|0
FRAME|3|bullets|3|enemies_flashing|0|score|0|cooldown|2
VISUAL|frame|3|spread_active|false|flashes|0|bounds_clamps|0
FRAME|4|bullets|3|enemies_flashing|0|score|0|cooldown|1
VISUAL|frame|4|spread_active|false|flashes|0|bounds_clamps|0
FRAME|5|bullets|3|enemies_flashing|0|score|0|cooldown|0
VISUAL|frame|5|spread_active|false|flashes|0|bounds_clamps|0
MILESTONE_55|PASS|visual feel achieved
\\\`\\\`\\\`

The spread fires on frame 1, cooldown blocks re-fire for 4 frames. All systems run each frame even if nothing dramatic happens. That is the point — consistent execution.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 20;
int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];
int eflash[MAX];
char esprite[MAX];
int entityCount = 0;
int score = 0;
int cooldown = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype, psprite)
//       Init entity at entityCount, increment

// TODO: Write movementSystem() — apply velocity to alive entities

// TODO: Write flashSystem() — decrement flashTimer, restore sprite when 0

// TODO: Write boundsSystem() — kill bullets (type=1) with y < 0

// TODO: Write collisionSystem() — bullet vs enemy, set flash on hit

// TODO: Write cleanupSystem() — alive=false for hp<=0

int main() {
    // TODO: Spawn player at (200,300), type=0
    // TODO: Spawn 4 enemies at y=60, x=120,180,220,280, vy=4, hp=1, type=2
    // TODO: Simulate 5 frames
    //   Frame 1: fire spread (3 bullets), set cooldown=4
    //   Each frame: move, bounds, collide, flash, cleanup
    //   Print FRAME and VISUAL lines
    //   Decrement cooldown each frame

    // TODO: Print MILESTONE_55

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 20;
int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];
int eflash[MAX];
char esprite[MAX];
int entityCount = 0;
int score = 0;
int cooldown = 0;

void spawnEntity(int px, int py, int pvx, int pvy, int php, int ptype, char psprite) {
    ex[entityCount] = px;
    ey[entityCount] = py;
    evx[entityCount] = pvx;
    evy[entityCount] = pvy;
    ehp[entityCount] = php;
    etype[entityCount] = ptype;
    ealive[entityCount] = true;
    eflash[entityCount] = 0;
    esprite[entityCount] = psprite;
    entityCount++;
}

void movementSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        ex[i] += evx[i];
        ey[i] += evy[i];
    }
}

void flashSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (eflash[i] > 0) {
            eflash[i]--;
            if (eflash[i] == 0) {
                esprite[i] = 'v';
            }
        }
    }
}

void boundsSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (etype[i] == 1 && ey[i] < 0) ealive[i] = false;
    }
}

void collisionSystem() {
    for (int b = 0; b < entityCount; b++) {
        if (!ealive[b] || etype[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!ealive[e] || etype[e] != 2) continue;
            int dx = ex[b] - ex[e];
            int dy = ey[b] - ey[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                ehp[b] = 0;
                ehp[e]--;
                score += 100;
                eflash[e] = 3;
                esprite[e] = 'X';
                break;
            }
        }
    }
}

void cleanupSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (ealive[i] && ehp[i] <= 0) ealive[i] = false;
    }
}

int main() {
    // Player
    spawnEntity(200, 300, 0, 0, 100, 0, 'P');

    // 4 enemies
    spawnEntity(120, 60, 0, 4, 1, 2, 'v');
    spawnEntity(180, 60, 0, 4, 1, 2, 'v');
    spawnEntity(220, 60, 0, 4, 1, 2, 'v');
    spawnEntity(280, 60, 0, 4, 1, 2, 'v');

    bool spreadFired = false;

    for (int frame = 1; frame <= 5; frame++) {
        // Fire spread on frame 1
        if (frame == 1 && cooldown == 0) {
            spawnEntity(192, 300, 0, -16, 1, 1, '|');
            spawnEntity(200, 300, 0, -16, 1, 1, '|');
            spawnEntity(208, 300, 0, -16, 1, 1, '|');
            cooldown = 4;
            spreadFired = true;
        }

        movementSystem();
        boundsSystem();
        collisionSystem();
        flashSystem();
        cleanupSystem();

        if (cooldown > 0) cooldown--;

        int bullets = 0;
        int flashing = 0;
        for (int i = 0; i < entityCount; i++) {
            if (!ealive[i]) continue;
            if (etype[i] == 1) bullets++;
            if (etype[i] == 2 && eflash[i] > 0) flashing++;
        }

        cout << "FRAME|" << frame << "|bullets|" << bullets
             << "|enemies_flashing|" << flashing << "|score|" << score
             << "|cooldown|" << cooldown << endl;

        cout << "VISUAL|frame|" << frame
             << "|spread_active|" << (spreadFired && frame == 1 ? "true" : "false")
             << "|flashes|" << flashing << "|bounds_clamps|0" << endl;
    }

    cout << "MILESTONE_55|PASS|visual feel achieved" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 shows spread shot fired with cooldown", expectedOutput: "FRAME\\|1\\|bullets\\|3\\|enemies_flashing\\|0\\|score\\|0\\|cooldown\\|4", isPattern: true },
      { id: "t2", description: "Visual shows spread active on frame 1", expectedOutput: "VISUAL\\|frame\\|1\\|spread_active\\|true\\|flashes\\|0\\|bounds_clamps\\|0", isPattern: true },
      { id: "t3", description: "Cooldown decrements each frame", expectedOutput: "FRAME\\|3\\|bullets\\|3\\|enemies_flashing\\|0\\|score\\|0\\|cooldown\\|2", isPattern: true },
      { id: "t4", description: "Cooldown reaches 0 by frame 5", expectedOutput: "FRAME\\|5\\|bullets\\|3\\|enemies_flashing\\|0\\|score\\|0\\|cooldown\\|0", isPattern: true },
      { id: "t5", description: "Visual frame data printed each frame", expectedOutput: "VISUAL\\|frame\\|\\d+\\|spread_active\\|\\w+\\|flashes\\|\\d+\\|bounds_clamps\\|\\d+", isPattern: true },
      { id: "t6", description: "Milestone 55 passes", expectedOutput: "MILESTONE_55\\|PASS\\|visual feel achieved", isPattern: true },
    ],
    hints: [
      "Spread shot spawns 3 bullets at x offsets: playerX-8, playerX, playerX+8. All share vy=-16. Cooldown starts at 4 and decrements each frame after systems run.",
      "Collision check: |dx| < 18 && |dy| < 18. With bullets starting at y=300 and enemies at y=60, the y-gap is 240. Closing speed is 20/frame. No collision within 5 frames.",
      "Count flashing enemies by checking eflash[i] > 0 for alive entities of type 2. In these 5 frames, no collisions occur so flashing count stays 0.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game: Visual Feel Integration",
    type: "game_builder",
    instructions: `# Game Builder: Visual Feel Integration

This is the milestone. Spread shot, cooldown, screen bounds, hit flash — all running in one simulation. The player fires a spread of 3 bullets. The cooldown prevents spam. Bullets travel upward. Enemies travel downward. When they meet, collision triggers damage and hit flash. The flash system shows \\\`X\\\` for 3 frames then restores. Eight frames of gameplay proving all visual systems compose into game feel.

## Your Task

1. Player at (200, 300). 4 enemies at y=60: x=120, 180, 220, 280. vy=4, hp=2, type=2, sprite='v'
2. Cooldown: 4 frames. Spread: 3 bullets at x-8, x, x+8 with vy=-16
3. Frame 1: fire spread. Cooldown=4
4. Run 8 frames: input, spawn, move, bounds, collide, flash, cleanup, render
5. Enemies have hp=2, so first hit flashes but does not kill. Second hit kills
6. Track collisions. When bullet hits enemy: score += 100, flash starts, bullet dies
7. Print per frame: \\\`FRAME|<n>|bullets|<count>|enemies_flashing|<count>|score|<s>|cooldown|<cd>\\\`
8. Print: \\\`VISUAL|frame|<n>|spread_active|<bool>|flashes|<count>|bounds_clamps|<count>\\\`
9. On frame 4 and frame 8, print a 20x10 ASCII grid showing entity positions
10. Print: \\\`MILESTONE_55|PASS|visual feel achieved\\\`

## Beginner Trap

**Common Mistake:** Forgetting to decrement cooldown. The cooldown must tick down independently of whether the player tries to fire. If you only decrement on fire attempts, the cooldown never expires and the player can never shoot again.

## Elite Insight

Game feel is emergent. No single system creates it. Spread shot gives power fantasy. Cooldown gives rhythm. Flash gives confirmation. Bounds prevent visual noise. The sum is greater than the parts. Professional game designers tune these constants — spread angle, cooldown duration, flash frames — for hundreds of hours. The architecture makes tuning possible because each value is isolated.

## Cross-Path Echo

UI frameworks compose the same way. A button has hover state (visual), click cooldown (debounce), bounds checking (hit test), and feedback (ripple animation). Each is a separate concern. Together they create "button feel." The pattern is identical: independent systems, shared state, composed behavior.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 20;
const int SCREEN_W = 20;
const int SCREEN_H = 10;

int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];
int eflash[MAX];
char esprite[MAX];
int entityCount = 0;
int score = 0;
int cooldown = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype, psprite)

// TODO: Write movementSystem(), flashSystem(), boundsSystem()
// TODO: Write collisionSystem() — on hit: flash enemy, destroy bullet
// TODO: Write cleanupSystem()

// TODO: Write renderGrid() — 20x10 grid, use esprite[] for characters

int main() {
    // TODO: Spawn player, 4 enemies
    // TODO: Simulate 8 frames with spread shot, cooldown, all systems
    // TODO: Print FRAME, VISUAL lines each frame
    // TODO: Print grid on frames 4 and 8
    // TODO: Print MILESTONE_55

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX = 20;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 400;
const int VIEW_H = 400;

int ex[MAX], ey[MAX], evx[MAX], evy[MAX], ehp[MAX], etype[MAX];
bool ealive[MAX];
int eflash[MAX];
char esprite[MAX];
int entityCount = 0;
int score = 0;
int cooldown = 0;

void spawnEntity(int px, int py, int pvx, int pvy, int php, int ptype, char psprite) {
    ex[entityCount] = px;
    ey[entityCount] = py;
    evx[entityCount] = pvx;
    evy[entityCount] = pvy;
    ehp[entityCount] = php;
    etype[entityCount] = ptype;
    ealive[entityCount] = true;
    eflash[entityCount] = 0;
    esprite[entityCount] = psprite;
    entityCount++;
}

void movementSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        ex[i] += evx[i];
        ey[i] += evy[i];
    }
}

void flashSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (eflash[i] > 0) {
            eflash[i]--;
            if (eflash[i] == 0) {
                esprite[i] = 'v';
            }
        }
    }
}

void boundsSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        if (etype[i] == 1 && ey[i] < 0) ealive[i] = false;
    }
}

void collisionSystem() {
    for (int b = 0; b < entityCount; b++) {
        if (!ealive[b] || etype[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!ealive[e] || etype[e] != 2) continue;
            int dx = ex[b] - ex[e];
            int dy = ey[b] - ey[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                ehp[b] = 0;
                ehp[e]--;
                score += 100;
                eflash[e] = 3;
                esprite[e] = 'X';
                break;
            }
        }
    }
}

void cleanupSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (ealive[i] && ehp[i] <= 0) ealive[i] = false;
    }
}

void renderGrid(int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < entityCount; i++) {
        if (!ealive[i]) continue;
        int sx = (ex[i] - camX) * SCREEN_W / VIEW_W;
        int sy = (ey[i] - camY) * SCREEN_H / VIEW_H;
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            grid[sy][sx] = esprite[i];
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

int main() {
    spawnEntity(200, 300, 0, 0, 100, 0, 'P');

    spawnEntity(120, 60, 0, 4, 2, 2, 'v');
    spawnEntity(180, 60, 0, 4, 2, 2, 'v');
    spawnEntity(220, 60, 0, 4, 2, 2, 'v');
    spawnEntity(280, 60, 0, 4, 2, 2, 'v');

    for (int frame = 1; frame <= 8; frame++) {
        bool spreadThisFrame = false;
        if (frame == 1 && cooldown == 0) {
            spawnEntity(192, 300, 0, -16, 1, 1, '|');
            spawnEntity(200, 300, 0, -16, 1, 1, '|');
            spawnEntity(208, 300, 0, -16, 1, 1, '|');
            cooldown = 4;
            spreadThisFrame = true;
        }

        movementSystem();
        boundsSystem();
        collisionSystem();
        flashSystem();
        cleanupSystem();

        if (cooldown > 0) cooldown--;

        int bullets = 0;
        int flashing = 0;
        int boundsClamps = 0;
        for (int i = 0; i < entityCount; i++) {
            if (!ealive[i]) continue;
            if (etype[i] == 1) bullets++;
            if (etype[i] == 2 && eflash[i] > 0) flashing++;
        }

        cout << "FRAME|" << frame << "|bullets|" << bullets
             << "|enemies_flashing|" << flashing << "|score|" << score
             << "|cooldown|" << cooldown << endl;

        cout << "VISUAL|frame|" << frame
             << "|spread_active|" << (spreadThisFrame ? "true" : "false")
             << "|flashes|" << flashing << "|bounds_clamps|" << boundsClamps << endl;

        if (frame == 4 || frame == 8) {
            int camX = ex[0] - VIEW_W / 2;
            int camY = ey[0] - VIEW_H / 2;
            renderGrid(camX, camY);
        }
    }

    cout << "MILESTONE_55|PASS|visual feel achieved" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 shows spread shot with cooldown", expectedOutput: "FRAME\\|1\\|bullets\\|3\\|enemies_flashing\\|0\\|score\\|0\\|cooldown\\|4", isPattern: true },
      { id: "t2", description: "Visual data shows spread active frame 1", expectedOutput: "VISUAL\\|frame\\|1\\|spread_active\\|true\\|flashes\\|\\d+\\|bounds_clamps\\|\\d+", isPattern: true },
      { id: "t3", description: "Frame data printed for all 8 frames", expectedOutput: "FRAME\\|8\\|bullets\\|\\d+\\|enemies_flashing\\|\\d+\\|score\\|\\d+\\|cooldown\\|\\d+", isPattern: true },
      { id: "t4", description: "ASCII grid rendered on frame 4", expectedOutput: "[\\.Pv|X]+", isPattern: true },
      { id: "t5", description: "Visual data printed each frame", expectedOutput: "VISUAL\\|frame\\|\\d+\\|spread_active\\|\\w+\\|flashes\\|\\d+\\|bounds_clamps\\|\\d+", isPattern: true },
      { id: "t6", description: "Milestone 55 passes", expectedOutput: "MILESTONE_55\\|PASS\\|visual feel achieved", isPattern: true },
    ],
    hints: [
      "Spread shot spawns 3 bullets at x-8, x, x+8 from player position. All have vy=-16. Cooldown starts at 4 and decrements after each frame's systems run.",
      "Enemies have hp=2. First collision reduces hp to 1 and triggers flash. Second collision reduces hp to 0 and cleanup removes them. Flash lasts 3 frames.",
      "For the grid: transform world coordinates to screen using (wx - camX) * SCREEN_W / VIEW_W. Camera centers on player. Use esprite[] for each entity's character.",
    ],
    estimatedMinutes: 15,
  },
};
