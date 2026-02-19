import type { Lesson } from "@/types/lesson";

export const lesson51: Lesson = {
  id: "51-spread-shot",
  title: "Spread Shot",
  description: "Fire multiple bullets in a spread pattern using velocity vectors.",
  order: 51,
  xpReward: 200,
  tier: "pro",
  concepts: ["projectile patterns", "angle calculation", "multi-spawn", "velocity vectors"],
  part1: {
    title: "Concept: Velocity Vectors for Spread Patterns",
    type: "concept",
    instructions: `# Velocity Vectors — Bullets That Diverge

A bullet with vx=0 and vy=-4 goes straight up. Change vx and the bullet drifts sideways while still traveling upward. That is the entire trick behind spread shots, fan patterns, and diagonal fire. Every projectile pattern in every shooter reduces to choosing the right vx and vy at spawn time.

## What Breaks Without This

Without velocity vectors, every bullet goes straight up. The player fires a wall of parallel lines. Enemies to the left and right are untouchable. The game becomes a narrow corridor shooter where positioning does not matter. Spread patterns force the player to aim with spacing, not precision.

## The Fix

Each bullet gets its own velocity pair. For a 3-bullet spread:

\\\`\\\`\\\`
Bullet 0: vx = -2, vy = -4  (drifts left)
Bullet 1: vx =  0, vy = -4  (straight up)
Bullet 2: vx = +2, vy = -4  (drifts right)
\\\`\\\`\\\`

After 1 step: positions diverge by 2 pixels horizontally. After 5 steps: 10 pixels apart. The spread grows linearly with time. The vy stays constant so all bullets reach the same height at the same time. Only vx differs.

## Your Task

1. Start all 3 bullets at position (180, 300)
2. Bullet 0: vx=-2, vy=-4. Bullet 1: vx=0, vy=-4. Bullet 2: vx=2, vy=-4
3. Run 5 movement steps, updating positions each step
4. After each step, print each bullet: \\\`BULLET|spread_<i>|vx|<vx>|vy|<vy>|pos|<x>,<y>\\\`
5. After each step, print spread summary: \\\`SPREAD|step|<s>|bullet_0|<x0>,<y0>|bullet_1|<x1>,<y1>|bullet_2|<x2>,<y2>\\\`
6. After all steps, print: \\\`FIRE_PATTERN|spread|count|3|angle_range|30\\\`
7. Print: \\\`VECTOR_MATH|vx_range|-2..2|vy|-4|divergence_per_step|2\\\`

Expected output (first step and last step shown):
\\\`\\\`\\\`
BULLET|spread_0|vx|-2|vy|-4|pos|178,296
BULLET|spread_1|vx|0|vy|-4|pos|180,296
BULLET|spread_2|vx|2|vy|-4|pos|182,296
SPREAD|step|1|bullet_0|178,296|bullet_1|180,296|bullet_2|182,296
BULLET|spread_0|vx|-2|vy|-4|pos|170,280
BULLET|spread_1|vx|0|vy|-4|pos|180,280
BULLET|spread_2|vx|2|vy|-4|pos|190,280
SPREAD|step|5|bullet_0|170,280|bullet_1|180,280|bullet_2|190,280
FIRE_PATTERN|spread|count|3|angle_range|30
VECTOR_MATH|vx_range|-2..2|vy|-4|divergence_per_step|2
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    const int COUNT = 3;
    int bx[COUNT], by[COUNT], bvx[COUNT], bvy[COUNT];

    // All bullets start at player position
    for (int i = 0; i < COUNT; i++) {
        bx[i] = 180;
        by[i] = 300;
        bvy[i] = -4;
    }

    // TODO: Set vx for each bullet: -2, 0, +2

    // TODO: Run 5 movement steps
    //   Each step: update positions by adding velocity
    //   Print BULLET line for each bullet
    //   Print SPREAD summary line

    // TODO: Print FIRE_PATTERN and VECTOR_MATH lines

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    const int COUNT = 3;
    int bx[COUNT], by[COUNT], bvx[COUNT], bvy[COUNT];

    for (int i = 0; i < COUNT; i++) {
        bx[i] = 180;
        by[i] = 300;
        bvy[i] = -4;
    }

    bvx[0] = -2;
    bvx[1] = 0;
    bvx[2] = 2;

    for (int step = 1; step <= 5; step++) {
        for (int i = 0; i < COUNT; i++) {
            bx[i] += bvx[i];
            by[i] += bvy[i];
        }

        for (int i = 0; i < COUNT; i++) {
            cout << "BULLET|spread_" << i << "|vx|" << bvx[i]
                 << "|vy|" << bvy[i] << "|pos|" << bx[i] << "," << by[i] << endl;
        }

        cout << "SPREAD|step|" << step;
        for (int i = 0; i < COUNT; i++) {
            cout << "|bullet_" << i << "|" << bx[i] << "," << by[i];
        }
        cout << endl;
    }

    cout << "FIRE_PATTERN|spread|count|3|angle_range|30" << endl;
    cout << "VECTOR_MATH|vx_range|-2..2|vy|-4|divergence_per_step|2" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Bullet 0 drifts left after step 1", expectedOutput: "BULLET\\|spread_0\\|vx\\|-2\\|vy\\|-4\\|pos\\|178,296", isPattern: true },
      { id: "t2", description: "Bullet 1 stays centered after step 1", expectedOutput: "BULLET\\|spread_1\\|vx\\|0\\|vy\\|-4\\|pos\\|180,296", isPattern: true },
      { id: "t3", description: "Bullet 2 drifts right after step 1", expectedOutput: "BULLET\\|spread_2\\|vx\\|2\\|vy\\|-4\\|pos\\|182,296", isPattern: true },
      { id: "t4", description: "Spread summary shows diverging paths at step 5", expectedOutput: "SPREAD\\|step\\|5\\|bullet_0\\|170,280\\|bullet_1\\|180,280\\|bullet_2\\|190,280", isPattern: true },
      { id: "t5", description: "Fire pattern summary", expectedOutput: "FIRE_PATTERN\\|spread\\|count\\|3\\|angle_range\\|30", isPattern: true },
      { id: "t6", description: "Vector math summary", expectedOutput: "VECTOR_MATH\\|vx_range\\|-2\\.\\.2\\|vy\\|-4\\|divergence_per_step\\|2", isPattern: true },
    ],
    hints: [
      "Set bvx[0] = -2, bvx[1] = 0, bvx[2] = 2. The vy is already set to -4 for all bullets in the init loop.",
      "Each step: bx[i] += bvx[i] and by[i] += bvy[i]. After step 1, bullet 0 is at (178, 296). After step 5, bullet 0 is at (170, 280).",
      "The SPREAD line prints all 3 bullet positions on one line. Use a loop to append each bullet's position to the output.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Spread Shot System",
    type: "game_builder",
    instructions: `# Game Builder: Spread Shot System

This is where single-bullet fire becomes a real weapon system. The player fires and three bullets fan outward. Same spawn point. Different velocities. The spread grows every frame. This is the foundation of every bullet pattern in every shooter ever shipped.

## Your Task
1. Pool: 20 entity slots. SoA: x, y, vx, vy, hp, type, alive
2. Player at (180, 300), type=0, hp=100
3. 3 enemies at x=140,180,220 y=60 vy=4 hp=1 type=2
4. fireSpread(px, py, count=3, spread=2): spawns 3 bullets at (px,py) with vx = -spread, 0, +spread and vy = -4
5. Frame sequence (5 frames): "w", " ", "w", "w", "w"
   - Frame 1: Player moves up to (180,296). Enemies move to y=64
   - Frame 2: Player fires spread at (180,292). 3 bullets spawn. All move. Enemies at y=68
   - Frame 3-5: Bullets diverge, enemies descend, check collisions
6. Print per bullet each frame: \\\`BULLET|spread_<i>|vx|<vx>|vy|<vy>|pos|<x>,<y>\\\`
7. Print per frame: \\\`FRAME|<n>|entities|<count>|score|<s>|bullets|<b>\\\`
8. Print: \\\`FIRE_PATTERN|spread|count|3|angle_range|30\\\`
9. Print: \\\`SPREAD_SYSTEM|PASS|bullets diverge correctly\\\`

## Beginner Trap

**Common Mistake:** Setting vx on all bullets to the same value. Each bullet in the spread needs a unique vx. Use a loop: \\\`vx = -spread + i * spread\\\` for i = 0, 1, 2. If all three bullets share vx=0, you get a column, not a fan.

## Elite Insight

Real spread patterns use trigonometry. The vx/vy pair is a direction vector. To get exact angles, compute vx = speed * cos(angle) and vy = speed * sin(angle). Integer approximation works for small spreads. For wide fans, you need fixed-point or float math. But the architecture is identical: spawn N bullets with N different velocity vectors.

## Cross-Path Echo

Network packet fan-out uses the same pattern. A multicast sender transmits one packet that routers duplicate with different destination vectors. Each copy diverges through the network topology. Same origin, different trajectories, growing separation. Your spread shot is a spatial multicast.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 20;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int kills = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write fireSpread(px, py, count, spread)
//       Spawns count bullets at (px,py) with vx = -spread, 0, +spread and vy = -4

// TODO: Write movementSystem() — apply vx/vy to alive entities

// TODO: Write collisionSystem() — bullet(type=1) vs enemy(type=2)
//       If |dx|<18 && |dy|<18: bullet hp=0, enemy hp--, score+=100, kills++

// TODO: Write cleanupSystem() — alive=false if hp<=0

int main() {
    // TODO: Spawn player at (180,300) type=0 hp=100
    // TODO: Spawn 3 enemies at x=140,180,220 y=60 vy=4 hp=1 type=2

    string inputs[] = {"w", " ", "w", "w", "w"};

    // TODO: Run 5 frames
    //   Process input, fire spread on space, move, collide, cleanup
    //   Print BULLET lines for alive bullets
    //   Print FRAME line

    // TODO: Print FIRE_PATTERN and SPREAD_SYSTEM lines

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 20;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;
int kills = 0;

void spawnEntity(int px, int py, int pvx, int pvy, int php, int ptype) {
    x[entityCount] = px;
    y[entityCount] = py;
    vx[entityCount] = pvx;
    vy[entityCount] = pvy;
    hp[entityCount] = php;
    type[entityCount] = ptype;
    alive[entityCount] = true;
    entityCount++;
}

void fireSpread(int px, int py, int count, int spread) {
    for (int i = 0; i < count; i++) {
        int bulletVx = -spread + i * spread;
        spawnEntity(px, py, bulletVx, -4, 1, 1);
    }
}

void movementSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void collisionSystem() {
    for (int b = 0; b < entityCount; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e]--;
                score += 100;
                kills++;
                break;
            }
        }
    }
}

void cleanupSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
        }
    }
}

int main() {
    spawnEntity(180, 300, 0, 0, 100, 0);

    spawnEntity(140, 60, 0, 4, 1, 2);
    spawnEntity(180, 60, 0, 4, 1, 2);
    spawnEntity(220, 60, 0, 4, 1, 2);

    string inputs[] = {"w", " ", "w", "w", "w"};

    for (int frame = 1; frame <= 5; frame++) {
        char input = inputs[frame - 1][0];
        if (input == 'w') y[0] -= 4;
        else if (input == 's') y[0] += 4;
        else if (input == 'a') x[0] -= 4;
        else if (input == 'd') x[0] += 4;
        else if (input == ' ') {
            fireSpread(x[0], y[0], 3, 2);
        }

        movementSystem();
        collisionSystem();
        cleanupSystem();

        int bulletCount = 0;
        int bulletIdx = 0;
        for (int i = 0; i < entityCount; i++) {
            if (alive[i] && type[i] == 1) {
                cout << "BULLET|spread_" << bulletIdx << "|vx|" << vx[i]
                     << "|vy|" << vy[i] << "|pos|" << x[i] << "," << y[i] << endl;
                bulletIdx++;
                bulletCount++;
            }
        }

        int aliveCount = 0;
        for (int i = 0; i < entityCount; i++) {
            if (alive[i]) aliveCount++;
        }

        cout << "FRAME|" << frame << "|entities|" << aliveCount
             << "|score|" << score << "|bullets|" << bulletCount << endl;
    }

    cout << "FIRE_PATTERN|spread|count|3|angle_range|30" << endl;
    cout << "SPREAD_SYSTEM|PASS|bullets diverge correctly" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "No bullets in frame 1", expectedOutput: "FRAME\\|1\\|entities\\|4\\|score\\|0\\|bullets\\|0", isPattern: true },
      { id: "t2", description: "Spread bullets exist in frame 2", expectedOutput: "BULLET\\|spread_\\d+\\|vx\\|-?\\d+\\|vy\\|-4\\|pos\\|\\d+,\\d+", isPattern: true },
      { id: "t3", description: "Frame 2 has 3 bullets", expectedOutput: "FRAME\\|2\\|entities\\|\\d+\\|score\\|\\d+\\|bullets\\|3", isPattern: true },
      { id: "t4", description: "Bullets diverge with different vx values", expectedOutput: "BULLET\\|spread_0\\|vx\\|-2\\|vy\\|-4", isPattern: true },
      { id: "t5", description: "Fire pattern summary", expectedOutput: "FIRE_PATTERN\\|spread\\|count\\|3\\|angle_range\\|30", isPattern: true },
      { id: "t6", description: "Spread system passes", expectedOutput: "SPREAD_SYSTEM\\|PASS\\|bullets diverge correctly", isPattern: true },
    ],
    hints: [
      "fireSpread spawns 3 bullets. For i=0: vx = -spread + 0*spread = -2. For i=1: vx = -spread + 1*spread = 0. For i=2: vx = -spread + 2*spread = 2. All get vy=-4.",
      "On frame 2, input is space. The player is at (180,292) after the w from frame 1. Bullets spawn there. Then movementSystem moves them: bullet 0 goes to (178,288), bullet 1 to (180,288), bullet 2 to (182,288).",
      "Collision uses |dx|<18 && |dy|<18. Track the center bullet (vx=0) vs the center enemy (x=180). Their x values match. The collision depends on when their y values converge within 18 units.",
    ],
    estimatedMinutes: 10,
  },
};
