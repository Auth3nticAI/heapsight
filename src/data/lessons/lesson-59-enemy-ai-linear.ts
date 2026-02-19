import type { Lesson } from "@/types/lesson";

export const lesson59: Lesson = {
  id: "59-enemy-ai-linear",
  title: "Enemy AI: Linear",
  description: "Implement linear enemy movement patterns -- straight down and diagonal.",
  order: 59,
  xpReward: 200,
  tier: "pro",
  concepts: ["AI patterns", "movement AI", "behavior functions", "pattern-based movement"],
  part1: {
    title: "Concept: Enemy AI — Linear Patterns",
    type: "concept",
    instructions: `# Enemy AI: Linear Patterns — AI Is Just a Function

AI sounds complex. It is not. At the simplest level, an AI is a function that returns a velocity. Call it every tick. Apply the result. The enemy moves. That is it. No neural networks. No pathfinding. No behavior trees. A function that returns two integers.

## What Breaks Without This

Without AI functions, you hardcode enemy velocities at spawn time. Every enemy of the same type moves identically. You cannot have one enemy go straight down while another sweeps diagonally. You cannot change behavior mid-flight. The movement is baked in at creation and never adapts.

## The Fix

Define AI as a function per pattern. Each function takes the enemy's current state and returns a velocity:

\\\`\\\`\\\`
void aiLinear(int& outVX, int& outVY, int speed) {
    outVX = 0;
    outVY = speed;
}

void aiDiagonalLeft(int& outVX, int& outVY, int speed) {
    outVX = -1;
    outVY = speed;
}
\\\`\\\`\\\`

Each enemy stores a pattern type. The AI system reads the pattern, calls the matching function, and applies the returned velocity. The movement system does not know about AI. The AI system does not know about rendering. Clean separation.

## Your Task

1. Define 3 AI functions: aiLinear (vx=0, vy=speed), aiDiagonalLeft (vx=-1, vy=speed), aiDiagonalRight (vx=1, vy=speed)
2. Create 5 enemies with starting positions and assigned patterns
3. Run the AI system for 5 ticks
4. Each tick: call AI function based on pattern, update position
5. Print per enemy per tick: \\\`AI|tick|1|enemy_0|pattern|linear|move|0,2|pos|100,42\\\`
6. After 5 ticks print: \\\`AI_SUMMARY|tick|5|linear|2|diag_left|2|diag_right|1\\\`

Expected output (first tick):
\\\`\\\`\\\`
AI|tick|1|enemy_0|pattern|linear|move|0,2|pos|100,42
AI|tick|1|enemy_1|pattern|linear|move|0,2|pos|200,42
AI|tick|1|enemy_2|pattern|diag_left|move|-1,2|pos|149,42
AI|tick|1|enemy_3|pattern|diag_left|move|-1,2|pos|249,42
AI|tick|1|enemy_4|pattern|diag_right|move|1,2|pos|301,42
\\\`\\\`\\\`

Final tick (tick 5):
\\\`\\\`\\\`
AI|tick|5|enemy_0|pattern|linear|move|0,2|pos|100,50
AI|tick|5|enemy_1|pattern|linear|move|0,2|pos|200,50
AI|tick|5|enemy_2|pattern|diag_left|move|-1,2|pos|145,50
AI|tick|5|enemy_3|pattern|diag_left|move|-1,2|pos|245,50
AI|tick|5|enemy_4|pattern|diag_right|move|1,2|pos|305,50
AI_SUMMARY|tick|5|linear|2|diag_left|2|diag_right|1
\\\`\\\`\\\`

Enemies start at y=40, speed=2. Positions: (100,40), (200,40), (150,40), (250,40), (300,40).

## Beginner Trap

**Common Mistake:** Storing the velocity once at spawn and never updating. The AI function must run every tick. For linear patterns, the output is constant. But the architecture matters — when you add sine-wave or tracking AI later, the function will return different values each tick. Build it right now.

## Elite Insight

Doom's enemy AI was a state machine with movement functions per state. Chase state moved toward the player. Retreat state moved away. The movement function changed based on state, not based on hardcoded velocity. Your pattern-based AI is the first step toward that architecture.

## Cross-Path Echo

Strategy pattern in software engineering is the same idea. A function pointer or type flag selects behavior at runtime. Sorting algorithms use it — quicksort vs mergesort selected by a flag. Payment processing uses it — credit card vs PayPal selected by type. Your AI pattern selector is a strategy pattern applied to movement.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENEMIES = 10;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int espeed[MAX_ENEMIES];
int epattern[MAX_ENEMIES]; // 0=linear, 1=diag_left, 2=diag_right
bool ealive[MAX_ENEMIES];
int enemyCount = 0;

// TODO: Write aiLinear(outVX, outVY, speed) — vx=0, vy=speed

// TODO: Write aiDiagonalLeft(outVX, outVY, speed) — vx=-1, vy=speed

// TODO: Write aiDiagonalRight(outVX, outVY, speed) — vx=1, vy=speed

// TODO: Write getPatternName(pattern) — returns "linear", "diag_left", or "diag_right"

// TODO: Write aiSystem(tick) — for each alive enemy:
//       call AI function based on pattern, apply velocity, print AI line

int main() {
    // 5 enemies: 2 linear, 2 diag_left, 1 diag_right
    int positions[][2] = {{100,40}, {200,40}, {150,40}, {250,40}, {300,40}};
    int patterns[] = {0, 0, 1, 1, 2};
    int speed = 2;

    for (int i = 0; i < 5; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
        espeed[i] = speed;
        epattern[i] = patterns[i];
        ealive[i] = true;
    }
    enemyCount = 5;

    // TODO: Run aiSystem for 5 ticks
    // TODO: Print AI_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENEMIES = 10;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int espeed[MAX_ENEMIES];
int epattern[MAX_ENEMIES];
bool ealive[MAX_ENEMIES];
int enemyCount = 0;

void aiLinear(int& outVX, int& outVY, int speed) {
    outVX = 0;
    outVY = speed;
}

void aiDiagonalLeft(int& outVX, int& outVY, int speed) {
    outVX = -1;
    outVY = speed;
}

void aiDiagonalRight(int& outVX, int& outVY, int speed) {
    outVX = 1;
    outVY = speed;
}

string getPatternName(int pattern) {
    if (pattern == 0) return "linear";
    if (pattern == 1) return "diag_left";
    if (pattern == 2) return "diag_right";
    return "unknown";
}

void aiSystem(int tick) {
    for (int i = 0; i < enemyCount; i++) {
        if (!ealive[i]) continue;
        int mvx = 0, mvy = 0;
        if (epattern[i] == 0) aiLinear(mvx, mvy, espeed[i]);
        else if (epattern[i] == 1) aiDiagonalLeft(mvx, mvy, espeed[i]);
        else if (epattern[i] == 2) aiDiagonalRight(mvx, mvy, espeed[i]);

        ex[i] += mvx;
        ey[i] += mvy;

        cout << "AI|tick|" << tick << "|enemy_" << i
             << "|pattern|" << getPatternName(epattern[i])
             << "|move|" << mvx << "," << mvy
             << "|pos|" << ex[i] << "," << ey[i] << endl;
    }
}

int main() {
    int positions[][2] = {{100,40}, {200,40}, {150,40}, {250,40}, {300,40}};
    int patterns[] = {0, 0, 1, 1, 2};
    int speed = 2;

    for (int i = 0; i < 5; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
        espeed[i] = speed;
        epattern[i] = patterns[i];
        ealive[i] = true;
    }
    enemyCount = 5;

    for (int tick = 1; tick <= 5; tick++) {
        aiSystem(tick);
    }

    int linearCount = 0, diagLeftCount = 0, diagRightCount = 0;
    for (int i = 0; i < enemyCount; i++) {
        if (!ealive[i]) continue;
        if (epattern[i] == 0) linearCount++;
        else if (epattern[i] == 1) diagLeftCount++;
        else if (epattern[i] == 2) diagRightCount++;
    }

    cout << "AI_SUMMARY|tick|5|linear|" << linearCount
         << "|diag_left|" << diagLeftCount
         << "|diag_right|" << diagRightCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Tick 1 linear enemy", expectedOutput: "AI\\|tick\\|1\\|enemy_0\\|pattern\\|linear\\|move\\|0,2\\|pos\\|100,42", isPattern: true },
      { id: "t2", description: "Tick 1 diagonal left enemy", expectedOutput: "AI\\|tick\\|1\\|enemy_2\\|pattern\\|diag_left\\|move\\|-1,2\\|pos\\|149,42", isPattern: true },
      { id: "t3", description: "Tick 1 diagonal right enemy", expectedOutput: "AI\\|tick\\|1\\|enemy_4\\|pattern\\|diag_right\\|move\\|1,2\\|pos\\|301,42", isPattern: true },
      { id: "t4", description: "Tick 5 positions correct", expectedOutput: "AI\\|tick\\|5\\|enemy_0\\|pattern\\|linear\\|move\\|0,2\\|pos\\|100,50", isPattern: true },
      { id: "t5", description: "AI summary counts", expectedOutput: "AI_SUMMARY\\|tick\\|5\\|linear\\|2\\|diag_left\\|2\\|diag_right\\|1", isPattern: true },
    ],
    hints: [
      "AI functions use reference parameters: void aiLinear(int& outVX, int& outVY, int speed). Set outVX = 0 and outVY = speed. The caller reads the values after the call.",
      "Pattern 0 = linear, 1 = diag_left, 2 = diag_right. Use if/else chain on epattern[i] to select the AI function.",
      "After 5 ticks with speed=2: y increases by 10 (from 40 to 50). Diagonal left x decreases by 5 (150 to 145). Diagonal right x increases by 5 (300 to 305).",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Enemy AI System",
    type: "game_builder",
    instructions: `# Game Builder: Enemy AI System — Pattern-Driven Movement

Your enemies fall straight down. Boring. Players learn the pattern in 10 seconds and never die again. Give enemies different movement patterns. Linear goes straight down. Diagonal left sweeps to the left. Diagonal right sweeps to the right. Same AI system, different functions, different behavior.

## What Breaks Without This

Without varied AI patterns, your space shooter has one difficulty curve: dodge the vertical rain. Players master it immediately. Diagonal enemies force lateral movement. Mixed patterns create unpredictable formations. The game becomes interesting because the player must read and react to different threats.

## The Fix

Each enemy has a pattern field. The AI system dispatches to the matching function. The movement system applies the result. Adding a new pattern means adding one function and one case. The loop does not change.

\\\`\\\`\\\`
if (pattern == LINEAR) aiLinear(vx, vy, speed);
else if (pattern == DIAG_LEFT) aiDiagonalLeft(vx, vy, speed);
else if (pattern == DIAG_RIGHT) aiDiagonalRight(vx, vy, speed);
x += vx; y += vy;
\\\`\\\`\\\`

## Your Task

1. AI patterns: aiLinear(vx=0, vy=2), aiDiagonalLeft(vx=-1, vy=2), aiDiagonalRight(vx=1, vy=2)
2. 5 enemies: enemy_0 and enemy_1 are linear, enemy_2 and enemy_3 are diag_left, enemy_4 is diag_right
3. Starting positions: (100,40), (200,40), (150,40), (250,40), (300,40), speed=2
4. AI system: for each enemy, call AI function based on pattern, apply returned velocity
5. Run 5 ticks
6. Print per tick: \\\`AI|tick|1|enemy_0|pattern|linear|move|0,2|pos|100,42\\\`
7. Print: \\\`AI|tick|1|enemy_2|pattern|diag_left|move|-1,2|pos|149,42\\\`
8. After all ticks: \\\`AI_SUMMARY|tick|5|linear|2|diag_left|2|diag_right|1\\\`

## Beginner Trap

**Common Mistake:** Applying the AI velocity to the entity's stored vx/vy instead of directly to position. The AI function returns the movement delta for this tick. Add it to position directly. Do not overwrite the stored velocity — that field is for the movement system in the full pipeline.

## Elite Insight

Commercial games use function pointers or virtual dispatch for AI. Your if/else chain on a pattern integer is the same thing with less indirection. The pattern is: look up behavior by type, execute it, apply the result. Whether you use a vtable, a function pointer array, or an if chain, the architecture is identical.

## Cross-Path Echo

Plugin architectures work the same way. A web server dispatches to route handlers by URL pattern. A compiler dispatches to code generators by AST node type. Your AI system dispatches to movement functions by pattern type. The dispatch pattern is everywhere in software. Learn it once, recognize it everywhere.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENEMIES = 10;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int espeed[MAX_ENEMIES];
int epattern[MAX_ENEMIES]; // 0=linear, 1=diag_left, 2=diag_right
bool ealive[MAX_ENEMIES];
int enemyCount = 0;

// TODO: Write aiLinear(outVX, outVY, speed)
// TODO: Write aiDiagonalLeft(outVX, outVY, speed)
// TODO: Write aiDiagonalRight(outVX, outVY, speed)

// TODO: Write getPatternName(pattern) — return string name

// TODO: Write aiSystem(tick) — dispatch AI per enemy, apply, print

int main() {
    int positions[][2] = {{100,40}, {200,40}, {150,40}, {250,40}, {300,40}};
    int patterns[] = {0, 0, 1, 1, 2};
    int speed = 2;

    for (int i = 0; i < 5; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
        espeed[i] = speed;
        epattern[i] = patterns[i];
        ealive[i] = true;
    }
    enemyCount = 5;

    // TODO: Run 5 ticks of aiSystem
    // TODO: Print AI_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENEMIES = 10;
int ex[MAX_ENEMIES], ey[MAX_ENEMIES];
int espeed[MAX_ENEMIES];
int epattern[MAX_ENEMIES];
bool ealive[MAX_ENEMIES];
int enemyCount = 0;

void aiLinear(int& outVX, int& outVY, int speed) {
    outVX = 0;
    outVY = speed;
}

void aiDiagonalLeft(int& outVX, int& outVY, int speed) {
    outVX = -1;
    outVY = speed;
}

void aiDiagonalRight(int& outVX, int& outVY, int speed) {
    outVX = 1;
    outVY = speed;
}

string getPatternName(int pattern) {
    if (pattern == 0) return "linear";
    if (pattern == 1) return "diag_left";
    if (pattern == 2) return "diag_right";
    return "unknown";
}

void aiSystem(int tick) {
    for (int i = 0; i < enemyCount; i++) {
        if (!ealive[i]) continue;
        int mvx = 0, mvy = 0;
        if (epattern[i] == 0) aiLinear(mvx, mvy, espeed[i]);
        else if (epattern[i] == 1) aiDiagonalLeft(mvx, mvy, espeed[i]);
        else if (epattern[i] == 2) aiDiagonalRight(mvx, mvy, espeed[i]);

        ex[i] += mvx;
        ey[i] += mvy;

        cout << "AI|tick|" << tick << "|enemy_" << i
             << "|pattern|" << getPatternName(epattern[i])
             << "|move|" << mvx << "," << mvy
             << "|pos|" << ex[i] << "," << ey[i] << endl;
    }
}

int main() {
    int positions[][2] = {{100,40}, {200,40}, {150,40}, {250,40}, {300,40}};
    int patterns[] = {0, 0, 1, 1, 2};
    int speed = 2;

    for (int i = 0; i < 5; i++) {
        ex[i] = positions[i][0];
        ey[i] = positions[i][1];
        espeed[i] = speed;
        epattern[i] = patterns[i];
        ealive[i] = true;
    }
    enemyCount = 5;

    for (int tick = 1; tick <= 5; tick++) {
        aiSystem(tick);
    }

    int linearCount = 0, diagLeftCount = 0, diagRightCount = 0;
    for (int i = 0; i < enemyCount; i++) {
        if (!ealive[i]) continue;
        if (epattern[i] == 0) linearCount++;
        else if (epattern[i] == 1) diagLeftCount++;
        else if (epattern[i] == 2) diagRightCount++;
    }

    cout << "AI_SUMMARY|tick|5|linear|" << linearCount
         << "|diag_left|" << diagLeftCount
         << "|diag_right|" << diagRightCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Tick 1 linear enemy moves straight down", expectedOutput: "AI\\|tick\\|1\\|enemy_0\\|pattern\\|linear\\|move\\|0,2\\|pos\\|100,42", isPattern: true },
      { id: "t2", description: "Tick 1 diagonal left enemy sweeps left", expectedOutput: "AI\\|tick\\|1\\|enemy_2\\|pattern\\|diag_left\\|move\\|-1,2\\|pos\\|149,42", isPattern: true },
      { id: "t3", description: "Tick 1 diagonal right enemy sweeps right", expectedOutput: "AI\\|tick\\|1\\|enemy_4\\|pattern\\|diag_right\\|move\\|1,2\\|pos\\|301,42", isPattern: true },
      { id: "t4", description: "Tick 5 shows accumulated movement", expectedOutput: "AI\\|tick\\|5\\|enemy_0\\|pattern\\|linear\\|move\\|0,2\\|pos\\|100,50", isPattern: true },
      { id: "t5", description: "Summary shows pattern distribution", expectedOutput: "AI_SUMMARY\\|tick\\|5\\|linear\\|2\\|diag_left\\|2\\|diag_right\\|1", isPattern: true },
    ],
    hints: [
      "AI functions take reference parameters: aiLinear(int& outVX, int& outVY, int speed). Set outVX = 0 and outVY = speed inside the function. The caller reads the values.",
      "In aiSystem, use if/else on epattern[i]: 0 calls aiLinear, 1 calls aiDiagonalLeft, 2 calls aiDiagonalRight. Then add mvx/mvy to ex[i]/ey[i].",
      "After 5 ticks at speed 2, all enemies gain 10 to y (40 -> 50). Diagonal left loses 5 from x (150 -> 145). Diagonal right gains 5 to x (300 -> 305).",
    ],
    estimatedMinutes: 8,
  },
};
