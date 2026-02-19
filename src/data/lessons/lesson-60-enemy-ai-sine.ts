import type { Lesson } from "@/types/lesson";

export const lesson60: Lesson = {
  id: "60-enemy-ai-sine",
  title: "Enemy AI: Sine Wave",
  description: "Create sine-wave enemy movement for organic, weaving flight patterns.",
  order: 60,
  xpReward: 200,
  tier: "pro",
  concepts: ["sine wave motion", "trigonometry in games", "oscillating movement", "math.h"],
  part1: {
    title: "Concept: Sine Wave Motion",
    type: "concept",
    instructions: `# Sine Wave Motion — Enemies That Move in Straight Lines Are Boring

Linear enemies are target practice. Real enemies weave. The sine function gives you smooth, repeating oscillation for free. One function call, one multiply, and your enemies carve organic S-curves through the play field. Every classic shmup uses this. Galaga, Gradius, R-Type — sine waves everywhere.

## What Breaks Without This

Without oscillation, enemies march in straight lines. Players learn the pattern in one play session and never miss again. The game feels mechanical, predictable, dead. Sine wave motion adds organic feel with zero AI complexity. The math does the work.

## The Fix

\\\`sin(angle)\\\` returns values from -1 to 1. Multiply by amplitude for pixel range. Increment angle each tick for continuous motion:

\\\`\\\`\\\`
x = baseX + amplitude * sin(tick * frequency)
\\\`\\\`\\\`

Amplitude controls how far the enemy sways. Frequency controls how fast. Higher frequency = tighter weave. Higher amplitude = wider sweep. The \\\`<cmath>\\\` header gives you \\\`sin()\\\` which takes radians.

Plot 10 positions and you see the wave:

\\\`\\\`\\\`
tick 0: sin(0.0) = 0.00   -> x = 200
tick 1: sin(0.5) = 0.48   -> x = 219
tick 2: sin(1.0) = 0.84   -> x = 234
tick 3: sin(1.5) = 1.00   -> x = 240
tick 4: sin(2.0) = 0.91   -> x = 236
tick 5: sin(2.5) = 0.60   -> x = 224
tick 6: sin(3.0) = 0.14   -> x = 206
tick 7: sin(3.5) = -0.35  -> x = 186
tick 8: sin(4.0) = -0.76  -> x = 170
tick 9: sin(4.5) = -0.98  -> x = 161
\\\`\\\`\\\`

The enemy sweeps right, peaks, sweeps back left. Continuous. Smooth. No branching logic needed.

## Your Task

1. Include \\\`<cmath>\\\` for sin()
2. Define 3 enemies at baseX=200, y starting at 10, speed=4 (y += speed each tick)
3. Each enemy gets a phase offset: 0.0, 2.09, 4.18 (120 degrees apart in radians)
4. Amplitude = 40, Frequency = 0.5
5. Run 8 ticks. Each tick: compute x = baseX + (int)(amplitude * sin(tick * frequency + phase))
6. Print for each enemy each tick: \\\`SINE|tick|<t>|enemy_<i>|x|<x>|y|<y>|phase|<phase>\\\`
7. Use integer cast of sin result for reproducibility
8. Print: \\\`SINE_SUMMARY|enemies|3|ticks|8|amplitude|40|frequency|0.5\\\`

Expected output (first 2 ticks):
\\\`\\\`\\\`
SINE|tick|1|enemy_0|x|219|y|14|phase|0.0
SINE|tick|1|enemy_1|x|165|y|14|phase|2.09
SINE|tick|1|enemy_2|x|215|y|14|phase|4.18
SINE|tick|2|enemy_0|x|233|y|18|phase|0.0
SINE|tick|2|enemy_1|x|175|y|18|phase|2.09
SINE|tick|2|enemy_2|x|191|y|18|phase|4.18
\\\`\\\`\\\`

The three enemies weave in a braided pattern — 120 degrees apart means when one peaks right, another is centered, and the third peaks left.`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const int NUM_ENEMIES = 3;
    const int BASE_X = 200;
    const int AMPLITUDE = 40;
    const double FREQUENCY = 0.5;
    const int SPEED = 4;
    const int TICKS = 8;

    double phase[NUM_ENEMIES] = {0.0, 2.09, 4.18};
    int ey[NUM_ENEMIES];

    // TODO: Initialize enemy y positions to 10
    for (int i = 0; i < NUM_ENEMIES; i++) {
        ey[i] = 10;
    }

    // TODO: Run TICKS iterations
    //   For each tick (1 to TICKS):
    //     For each enemy:
    //       Compute x = BASE_X + (int)(AMPLITUDE * sin(tick * FREQUENCY + phase[i]))
    //       Update y: ey[i] += SPEED
    //       Print: SINE|tick|<t>|enemy_<i>|x|<x>|y|<y>|phase|<phase>

    // TODO: Print SINE_SUMMARY line

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    const int NUM_ENEMIES = 3;
    const int BASE_X = 200;
    const int AMPLITUDE = 40;
    const double FREQUENCY = 0.5;
    const int SPEED = 4;
    const int TICKS = 8;

    double phase[NUM_ENEMIES] = {0.0, 2.09, 4.18};
    int ey[NUM_ENEMIES];

    for (int i = 0; i < NUM_ENEMIES; i++) {
        ey[i] = 10;
    }

    for (int t = 1; t <= TICKS; t++) {
        for (int i = 0; i < NUM_ENEMIES; i++) {
            int ex = BASE_X + (int)(AMPLITUDE * sin(t * FREQUENCY + phase[i]));
            ey[i] += SPEED;
            cout << "SINE|tick|" << t << "|enemy_" << i
                 << "|x|" << ex << "|y|" << ey[i]
                 << "|phase|" << phase[i] << endl;
        }
    }

    cout << "SINE_SUMMARY|enemies|3|ticks|8|amplitude|40|frequency|0.5" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Tick 1 enemy 0 sine position", expectedOutput: "SINE\\|tick\\|1\\|enemy_0\\|x\\|\\d+\\|y\\|14\\|phase\\|0", isPattern: true },
      { id: "t2", description: "Tick 1 enemy 1 with phase offset", expectedOutput: "SINE\\|tick\\|1\\|enemy_1\\|x\\|\\d+\\|y\\|14\\|phase\\|2\\.09", isPattern: true },
      { id: "t3", description: "Tick 1 enemy 2 with phase offset", expectedOutput: "SINE\\|tick\\|1\\|enemy_2\\|x\\|\\d+\\|y\\|14\\|phase\\|4\\.18", isPattern: true },
      { id: "t4", description: "Enemies move down each tick", expectedOutput: "SINE\\|tick\\|4\\|enemy_0\\|x\\|\\d+\\|y\\|26\\|phase\\|0", isPattern: true },
      { id: "t5", description: "All 8 ticks complete", expectedOutput: "SINE\\|tick\\|8\\|enemy_2\\|x\\|\\d+\\|y\\|42\\|phase\\|4\\.18", isPattern: true },
      { id: "t6", description: "Summary line", expectedOutput: "SINE_SUMMARY\\|enemies\\|3\\|ticks\\|8\\|amplitude\\|40\\|frequency\\|0\\.5", isPattern: true },
    ],
    hints: [
      "sin() takes radians, not degrees. The phase values 0.0, 2.09, 4.18 are already in radians (120 degrees = 2*pi/3 = ~2.09). Pass tick * FREQUENCY + phase[i] directly to sin().",
      "Cast the sin result to int for reproducible output: (int)(AMPLITUDE * sin(...)). This truncates toward zero, giving consistent integer positions across platforms.",
      "The y position increments by SPEED each tick regardless of sine. Sine only affects x. So y goes 14, 18, 22, 26... while x oscillates around BASE_X.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Sine Wave Enemy AI",
    type: "game_builder",
    instructions: `# Game Builder: Sine Wave Enemy AI — Weaving Through the Kill Zone

Straight-line enemies are solved in one session. Sine wave enemies force the player to predict oscillation. Three enemies with 120-degree phase offsets create a braided formation — when one swings right, another swings left, and the third crosses center. The player cannot camp a single position and win.

## What Breaks Without This

Without sine motion, every enemy follows the same linear path. Players memorize it instantly. The game has zero replay value after the pattern is learned. Sine waves add unpredictability without randomness — the motion is deterministic but hard to track visually across multiple enemies.

## The Fix

Each enemy stores a phase offset. Every tick:

\\\`\\\`\\\`
x = baseX + amplitude * sin(tick * frequency + phase)
y += speed
\\\`\\\`\\\`

Three enemies at phases 0, 2.09, 4.18 (0, 120, 240 degrees) weave in a symmetric braid. The amplitude and frequency are tuning knobs — increase amplitude for wider sweeps, increase frequency for faster oscillation.

## Your Task

1. 3 sine-wave enemies, baseX=200, starting y=10, speed=4, amplitude=40, frequency=0.5
2. Phase offsets: 0.0, 2.09, 4.18
3. Player at (180, 300), bullet pool, standard collision
4. Run 8 ticks of simulation
5. Each tick: update enemy positions with sine wave, move bullets, check collisions
6. Print per enemy per tick: \\\`SINE|tick|<t>|enemy_<i>|x|<x>|y|<y>|phase|<phase>\\\`
7. Print: \\\`SINE_SUMMARY|enemies|3|ticks|8|amplitude|40|frequency|0.5\\\`
8. Print: \\\`FRAME|<n>|enemies|<alive>|bullets|<count>|score|<s>\\\`

## Beginner Trap

**Common Mistake:** Using degrees instead of radians. C++ sin() takes radians. 120 degrees is 2.09 radians, not 120. If you pass 120 to sin(), you get garbage oscillation with a period of ~360 ticks instead of ~12.

## Elite Insight

Layer sine waves for complex motion. \\\`x = A1*sin(f1*t) + A2*sin(f2*t)\\\` gives Lissajous-like patterns. Bosses in bullet-hell games use summed sine waves for multi-frequency oscillation. The math scales — add terms, not code.

## Cross-Path Echo

Signal processing is sine waves all the way down. Audio synthesis, radio transmission, image compression (DCT in JPEG) — they all decompose signals into sine components. Fourier proved any periodic motion can be built from sine waves. Your enemy AI uses the same math as an MP3 encoder.`,
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

// TODO: Write spawnEntity(px, py, pvx, pvy, php, ptype)

// TODO: Write sineWaveSystem(tick) — for each alive enemy (type==2):
//       x[i] = 200 + (int)(40 * sin(tick * 0.5 + phase[i]))
//       y[i] += 4

// TODO: Write movementSystem() — apply vx/vy to non-enemy alive entities

// TODO: Write collisionSystem() — bullet(type=1) vs enemy(type=2)

// TODO: Write cleanupSystem()

int main() {
    double phase[] = {0.0, 2.09, 4.18};

    // TODO: Spawn player at (180, 300), type=0
    // TODO: Spawn 3 enemies at (200, 10), type=2

    // TODO: Run 8 ticks
    //   Update sine wave positions
    //   Print SINE lines per enemy
    //   Print FRAME line per tick

    // TODO: Print SINE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

const int POOL_SIZE = 20;
int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int score = 0;

double enemyPhase[3] = {0.0, 2.09, 4.18};

void spawnEntity(int px, int py, int pvx, int pvy, int php, int ptype) {
    x[entityCount] = px;
    y[entityCount] = py;
    vx[entityCount] = pvx;
    vy[entityCount] = pvy;
    hp[entityCount] = php;
    etype[entityCount] = ptype;
    alive[entityCount] = true;
    entityCount++;
}

void sineWaveSystem(int tick) {
    int ei = 0;
    for (int i = 0; i < entityCount; i++) {
        if (!alive[i] || etype[i] != 2) continue;
        x[i] = 200 + (int)(40 * sin(tick * 0.5 + enemyPhase[ei]));
        y[i] += 4;
        ei++;
    }
}

void movementSystem() {
    for (int i = 0; i < entityCount; i++) {
        if (!alive[i] || etype[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void collisionSystem() {
    for (int b = 0; b < entityCount; b++) {
        if (!alive[b] || etype[b] != 1) continue;
        for (int e = 0; e < entityCount; e++) {
            if (!alive[e] || etype[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e]--;
                score += 100;
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
    spawnEntity(180, 300, 0, 0, 100, 0);  // player
    spawnEntity(200, 10, 0, 0, 1, 2);     // enemy 0
    spawnEntity(200, 10, 0, 0, 1, 2);     // enemy 1
    spawnEntity(200, 10, 0, 0, 1, 2);     // enemy 2

    for (int t = 1; t <= 8; t++) {
        sineWaveSystem(t);
        movementSystem();
        collisionSystem();
        cleanupSystem();

        int ei = 0;
        for (int i = 0; i < entityCount; i++) {
            if (!alive[i] || etype[i] != 2) continue;
            cout << "SINE|tick|" << t << "|enemy_" << ei
                 << "|x|" << x[i] << "|y|" << y[i]
                 << "|phase|" << enemyPhase[ei] << endl;
            ei++;
        }

        int enemyCount = 0, bulletCount = 0;
        for (int i = 0; i < entityCount; i++) {
            if (!alive[i]) continue;
            if (etype[i] == 2) enemyCount++;
            if (etype[i] == 1) bulletCount++;
        }

        cout << "FRAME|" << t << "|enemies|" << enemyCount
             << "|bullets|" << bulletCount
             << "|score|" << score << endl;
    }

    cout << "SINE_SUMMARY|enemies|3|ticks|8|amplitude|40|frequency|0.5" << endl;

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Tick 1 enemy 0 sine wave position", expectedOutput: "SINE\\|tick\\|1\\|enemy_0\\|x\\|\\d+\\|y\\|14\\|phase\\|0", isPattern: true },
      { id: "g2", description: "Tick 1 enemy 1 phase offset", expectedOutput: "SINE\\|tick\\|1\\|enemy_1\\|x\\|\\d+\\|y\\|14\\|phase\\|2\\.09", isPattern: true },
      { id: "g3", description: "Tick 1 enemy 2 phase offset", expectedOutput: "SINE\\|tick\\|1\\|enemy_2\\|x\\|\\d+\\|y\\|14\\|phase\\|4\\.18", isPattern: true },
      { id: "g4", description: "Frame output per tick", expectedOutput: "FRAME\\|\\d+\\|enemies\\|\\d+\\|bullets\\|\\d+\\|score\\|\\d+", isPattern: true },
      { id: "g5", description: "All 8 ticks complete", expectedOutput: "SINE\\|tick\\|8\\|enemy_\\d+\\|x\\|\\d+\\|y\\|42\\|phase\\|", isPattern: true },
      { id: "g6", description: "Summary line", expectedOutput: "SINE_SUMMARY\\|enemies\\|3\\|ticks\\|8\\|amplitude\\|40\\|frequency\\|0\\.5", isPattern: true },
    ],
    hints: [
      "The sineWaveSystem must track which enemy index maps to which phase. Use a separate counter (ei) that increments only for alive type-2 entities. Enemy 0 gets phase[0], enemy 1 gets phase[1], etc.",
      "Enemies use sine for x-position, not vx. Set x[i] directly each tick: x[i] = 200 + (int)(40 * sin(t * 0.5 + phase)). The y position increments by 4 each tick independently.",
      "movementSystem should skip type-2 entities since their position is controlled by sineWaveSystem. Only move bullets (type=1) and other non-enemy entities with vx/vy.",
    ],
    estimatedMinutes: 10,
  },
};
