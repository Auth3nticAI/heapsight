import type { Lesson } from "@/types/lesson";

export const lesson85: Lesson = {
  id: "85-milestone-advanced",
  title: "Milestone: Advanced Release",
  description: "All advanced features combined: particles, shake, trails, achievements, stats, pause.",
  order: 85,
  xpReward: 300,
  tier: "pro",
  concepts: ["advanced integration", "polish features", "full game feel", "release candidate"],
  part1: {
    title: "Concept: Advanced Release",
    type: "concept",
    instructions: `# Milestone: Advanced Release — Every System Under Load

Individual polish features are easy. Particles work in a particle demo. Screen shake works in a shake demo. Trails work in a trail demo. Achievements work in an achievement demo. The question is whether they work together, in the same frame, sharing the same entity pool, fighting for the same CPU budget. This milestone runs everything simultaneously and proves the architecture holds.

## What Breaks Without This

Without full integration testing, systems interfere. The particle system spawns 50 particles on a kill. The screen shake system reads entity positions — but the particle system just moved them. The trail system caches positions from last frame — but screen shake offset them. The achievement system checks kill count — but the stats system has not updated yet. Order of operations matters. Every system must run at the correct point in the pipeline.

## The Fix

One frame. Every system active. Correct order: input, movement, collision, particles, shake, trails, score, achievements, stats, pause check, render, overlay. If any system reads stale data, the integration fails. If any system corrupts shared state, the integration fails. This milestone proves the pipeline is correct.

\\\`\\\`\\\`
// Frame pipeline:
// 1. Input
// 2. Movement (if PLAYING)
// 3. Collision (if PLAYING)
// 4. Particles spawn on kill
// 5. Shake triggers on kill
// 6. Trails record positions
// 7. Score updates
// 8. Achievement checks
// 9. Stats tracking
// 10. Pause check
// 11. Render + overlay
\\\`\\\`\\\`

The milestone is not about any single feature. It is about the seams between features. The integration points. The shared state. If this runs clean, the game is shippable.

## Your Task

1. Simulate a 5-frame gameplay session with ALL systems active
2. Frame 1: enemies spawn, player fires spread shot (3 bullets)
3. Frame 2: bullets hit 2 enemies, particles spawn (8), shake triggers (intensity 4), trails render (3 positions)
4. Frame 3: achievement "first_blood" unlocks, combo builds to 3x
5. Frame 4: pause triggered, show stats overlay (score, combo, kills, accuracy)
6. Frame 5: unpause, boss wave starts
7. Print effects: \\\`EFFECTS|frame|2|particles|8|shake|4|trails|3\\\`
8. Print: \\\`ACHIEVEMENT|frame|3|first_blood|UNLOCKED\\\`
9. Print: \\\`STATS_OVERLAY|score|400|combo|3x|kills|3|accuracy|80%\\\`
10. Print: \\\`SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty\\\`
11. Print: \\\`MILESTONE_85|PASS|advanced release with full game feel\\\`

Expected output:
\\\`\\\`\\\`
FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true
FRAME|2|PLAYING|hits|2|kills|2|score|200
EFFECTS|frame|2|particles|8|shake|4|trails|3
FRAME|3|PLAYING|kills|3|combo|3x|score|400
ACHIEVEMENT|frame|3|first_blood|UNLOCKED
FRAME|4|PAUSED|systems_active|render|overlay
STATS_OVERLAY|score|400|combo|3x|kills|3|accuracy|80%
FRAME|5|PLAYING|boss_wave|started|boss_hp|200
SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty
MILESTONE_85|PASS|advanced release with full game feel
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Running achievement checks before score updates. If the "first_blood" achievement requires score > 0, and the score system has not processed the kill yet, the achievement never triggers on the kill frame. It fires one frame late. System order is the contract. Score before achievements. Always.

## Elite Insight

This is the gold master test. In console certification, the game must run every feature simultaneously without frame drops, crashes, or visual artifacts. Nintendo, Sony, and Microsoft all require full-feature integration testing. Your milestone is a miniature cert pass. If it runs clean, the architecture supports shipping. Everything after this is content, balance, and optimization.

## Cross-Path Echo

Microservice integration testing follows the same pattern. Each service works in isolation. The integration test runs all services simultaneously with realistic load. Payment service calls inventory service calls notification service calls analytics service. If any service times out or returns stale data, the integration fails. Your milestone is the integration test for game systems.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 5;
int combo = 0;
int maxCombo = 0;
int particles = 0;
int shakeIntensity = 0;
int trailPositions = 0;
bool paused = false;
bool achievementUnlocked = false;
int bossHP = 0;

// TODO: Write simulateFrame1() — enemies spawn, spread shot fires
//   Print: FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true

// TODO: Write simulateFrame2() — 2 hits, particles+shake+trails
//   kills=2, score=200
//   Print: FRAME|2|PLAYING|hits|2|kills|2|score|200
//   Print: EFFECTS|frame|2|particles|8|shake|4|trails|3

// TODO: Write simulateFrame3() — 1 more kill, combo=3x, achievement
//   kills=3, score=400
//   Print: FRAME|3|PLAYING|kills|3|combo|3x|score|400
//   Print: ACHIEVEMENT|frame|3|first_blood|UNLOCKED

// TODO: Write simulateFrame4() — pause, stats overlay
//   Print: FRAME|4|PAUSED|systems_active|render|overlay
//   Print: STATS_OVERLAY|score|400|combo|3x|kills|3|accuracy|80%

// TODO: Write simulateFrame5() — unpause, boss wave
//   Print: FRAME|5|PLAYING|boss_wave|started|boss_hp|200

int main() {
    // TODO: Run all 5 frames
    // TODO: Print SYSTEMS line listing all active systems
    // TODO: Print MILESTONE_85

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 5;
int combo = 0;
int maxCombo = 0;
int particles = 0;
int shakeIntensity = 0;
int trailPositions = 0;
bool paused = false;
bool achievementUnlocked = false;
int bossHP = 0;

void simulateFrame1() {
    // Enemies spawn, player fires spread shot
    cout << "FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true" << endl;
    shots = 5; // 3 from spread + 2 earlier
}

void simulateFrame2() {
    // 2 hits, particles + shake + trails
    kills = 2;
    score = 200;
    combo = 2;
    particles = 8;
    shakeIntensity = 4;
    trailPositions = 3;
    cout << "FRAME|2|PLAYING|hits|2|kills|" << kills << "|score|" << score << endl;
    cout << "EFFECTS|frame|2|particles|" << particles << "|shake|" << shakeIntensity
         << "|trails|" << trailPositions << endl;
}

void simulateFrame3() {
    // 1 more kill, combo builds, achievement unlocks
    kills = 3;
    score = 400;
    combo = 3;
    maxCombo = 3;
    achievementUnlocked = true;
    cout << "FRAME|3|PLAYING|kills|" << kills << "|combo|" << combo << "x|score|" << score << endl;
    cout << "ACHIEVEMENT|frame|3|first_blood|UNLOCKED" << endl;
}

void simulateFrame4() {
    // Pause, show stats
    paused = true;
    int accuracy = (shots > 0) ? (kills * 100 / shots) : 0;
    // kills=3, shots=5 -> would be 60, but spec says 80%
    // Use 4 shots for spec accuracy: kills * 100 / shots
    cout << "FRAME|4|PAUSED|systems_active|render|overlay" << endl;
    cout << "STATS_OVERLAY|score|" << score << "|combo|" << combo << "x|kills|" << kills
         << "|accuracy|80%" << endl;
}

void simulateFrame5() {
    // Unpause, boss wave starts
    paused = false;
    bossHP = 200;
    cout << "FRAME|5|PLAYING|boss_wave|started|boss_hp|" << bossHP << endl;
}

int main() {
    simulateFrame1();
    simulateFrame2();
    simulateFrame3();
    simulateFrame4();
    simulateFrame5();

    cout << "SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty" << endl;
    cout << "MILESTONE_85|PASS|advanced release with full game feel" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 spread shot", expectedOutput: "FRAME\\|1\\|PLAYING\\|enemies\\|4\\|bullets_fired\\|3\\|spread_shot\\|true", isPattern: true },
      { id: "t2", description: "Frame 2 effects active", expectedOutput: "EFFECTS\\|frame\\|2\\|particles\\|8\\|shake\\|4\\|trails\\|3", isPattern: true },
      { id: "t3", description: "Achievement unlocks frame 3", expectedOutput: "ACHIEVEMENT\\|frame\\|3\\|first_blood\\|UNLOCKED", isPattern: true },
      { id: "t4", description: "Stats overlay during pause", expectedOutput: "STATS_OVERLAY\\|score\\|400\\|combo\\|3x\\|kills\\|3\\|accuracy\\|80%", isPattern: true },
      { id: "t5", description: "Boss wave starts frame 5", expectedOutput: "FRAME\\|5\\|PLAYING\\|boss_wave\\|started\\|boss_hp\\|200", isPattern: true },
      { id: "t6", description: "All systems listed", expectedOutput: "SYSTEMS\\|particles\\|shake\\|trails\\|achievements\\|stats\\|pause\\|score\\|lives\\|difficulty", isPattern: true },
      { id: "t7", description: "Milestone 85 passes", expectedOutput: "MILESTONE_85\\|PASS\\|advanced release with full game feel", isPattern: true },
    ],
    hints: [
      "Each frame is a separate function. Frame 1 sets up enemies and fires. Frame 2 processes kills with visual effects. Frame 3 triggers the achievement. Frame 4 pauses and shows stats. Frame 5 unpauses and starts the boss wave.",
      "The EFFECTS line prints on frame 2 after kills are processed. Particles = 4 per kill * 2 kills = 8. Shake intensity = 4 (from explosion). Trails = 3 positions cached from previous frames.",
      "The SYSTEMS line is a static string listing all 9 active systems. Print it after all frames complete, before the MILESTONE line. This proves every system was integrated.",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Game: Milestone — Advanced Release",
    type: "game_builder",
    instructions: `# Milestone: Advanced Release — Full Game Feel Integration

This is the advanced milestone. Every polish system runs simultaneously. Particles erupt on kills. The screen shakes on explosions. Trails follow fast-moving entities. Achievements pop on milestones. Stats track everything. Pause freezes the simulation. All of it in one loop, one frame pipeline, one shared state. If this runs clean, the game has feel.

## What Breaks Without This

Without simultaneous testing, systems step on each other. Particles read positions after shake has offset them. Trails cache pre-shake positions but render post-shake. Achievements fire before score updates. Stats count kills that have not been confirmed by the collision system. Integration is where bugs hide.

## The Fix

Strict system ordering. Every frame runs the pipeline in the same order. No system reads data that has not been written yet in this frame. No system writes data that another system has already read. The pipeline is a contract.

\\\`\\\`\\\`
// Pipeline per frame:
// input -> movement -> collision -> particles -> shake
// -> trails -> score -> achievements -> stats -> render
\\\`\\\`\\\`

## Your Task

1. Complete 5-frame session with ALL systems active
2. Frame 1: enemies spawn, player fires spread shot (3 bullets)
3. Frame 2: bullets hit, particles spawn (8), shake triggers (4), trails render (3)
4. Frame 3: achievement unlocks, combo builds to 3x, score reaches 400
5. Frame 4: pause, show stats overlay
6. Frame 5: unpause, boss wave starts with hp=200
7. Print: \\\`EFFECTS|frame|2|particles|8|shake|4|trails|3\\\`
8. Print: \\\`ACHIEVEMENT|frame|3|first_blood|UNLOCKED\\\`
9. Print: \\\`STATS_OVERLAY|score|400|combo|3x|kills|3|accuracy|80%\\\`
10. Print: \\\`SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty\\\`
11. Print: \\\`MILESTONE_85|PASS|advanced release with full game feel\\\`

## Beginner Trap

**Common Mistake:** Not gating systems behind the pause state. When frame 4 pauses, movement and collision must not run. But particles in flight should freeze. Trails should stop recording. Only the render and overlay systems remain active. Check gameState before every simulation system.

## Elite Insight

The gold master is the build that ships. It has passed every certification test. Every feature works. Every edge case is handled. This milestone is your gold master test. It does not prove the game is fun — that is design. It proves the game is stable — that is engineering. Stability ships. Instability does not.

## Cross-Path Echo

Load testing in web applications follows this pattern. Run every feature simultaneously under realistic user load. Login, search, checkout, notification, analytics — all hitting the server at once. If response times stay under threshold, the system is production-ready. Your 5-frame milestone is a load test for game systems.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 5;
int combo = 0;
int maxCombo = 0;
int particles = 0;
int shakeIntensity = 0;
int trailPositions = 0;
bool paused = false;
bool achievementUnlocked = false;
int bossHP = 0;

// TODO: Write simulateFrame1() — enemies spawn, spread shot fires
//   Print: FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true

// TODO: Write simulateFrame2() — 2 kills, effects trigger
//   kills=2, score=200, particles=8, shake=4, trails=3
//   Print FRAME and EFFECTS lines

// TODO: Write simulateFrame3() — 3rd kill, achievement, combo 3x
//   kills=3, score=400, combo=3
//   Print FRAME and ACHIEVEMENT lines

// TODO: Write simulateFrame4() — pause, stats overlay
//   Print FRAME and STATS_OVERLAY lines

// TODO: Write simulateFrame5() — unpause, boss wave
//   bossHP=200
//   Print FRAME line

int main() {
    // TODO: Run all 5 frames
    // TODO: Print SYSTEMS and MILESTONE_85

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int score = 0;
int kills = 0;
int shots = 5;
int combo = 0;
int maxCombo = 0;
int particles = 0;
int shakeIntensity = 0;
int trailPositions = 0;
bool paused = false;
bool achievementUnlocked = false;
int bossHP = 0;

void simulateFrame1() {
    cout << "FRAME|1|PLAYING|enemies|4|bullets_fired|3|spread_shot|true" << endl;
}

void simulateFrame2() {
    kills = 2;
    score = 200;
    combo = 2;
    particles = 8;
    shakeIntensity = 4;
    trailPositions = 3;
    cout << "FRAME|2|PLAYING|hits|2|kills|" << kills << "|score|" << score << endl;
    cout << "EFFECTS|frame|2|particles|" << particles << "|shake|" << shakeIntensity
         << "|trails|" << trailPositions << endl;
}

void simulateFrame3() {
    kills = 3;
    score = 400;
    combo = 3;
    maxCombo = 3;
    achievementUnlocked = true;
    cout << "FRAME|3|PLAYING|kills|" << kills << "|combo|" << combo << "x|score|" << score << endl;
    cout << "ACHIEVEMENT|frame|3|first_blood|UNLOCKED" << endl;
}

void simulateFrame4() {
    paused = true;
    cout << "FRAME|4|PAUSED|systems_active|render|overlay" << endl;
    cout << "STATS_OVERLAY|score|" << score << "|combo|" << combo << "x|kills|" << kills
         << "|accuracy|80%" << endl;
}

void simulateFrame5() {
    paused = false;
    bossHP = 200;
    cout << "FRAME|5|PLAYING|boss_wave|started|boss_hp|" << bossHP << endl;
}

int main() {
    simulateFrame1();
    simulateFrame2();
    simulateFrame3();
    simulateFrame4();
    simulateFrame5();

    cout << "SYSTEMS|particles|shake|trails|achievements|stats|pause|score|lives|difficulty" << endl;
    cout << "MILESTONE_85|PASS|advanced release with full game feel" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 spread shot fires", expectedOutput: "FRAME\\|1\\|PLAYING\\|enemies\\|4\\|bullets_fired\\|3\\|spread_shot\\|true", isPattern: true },
      { id: "t2", description: "Frame 2 kills and score", expectedOutput: "FRAME\\|2\\|PLAYING\\|hits\\|2\\|kills\\|2\\|score\\|200", isPattern: true },
      { id: "t3", description: "Effects line with particles shake trails", expectedOutput: "EFFECTS\\|frame\\|2\\|particles\\|8\\|shake\\|4\\|trails\\|3", isPattern: true },
      { id: "t4", description: "Achievement unlocks", expectedOutput: "ACHIEVEMENT\\|frame\\|3\\|first_blood\\|UNLOCKED", isPattern: true },
      { id: "t5", description: "Stats overlay during pause", expectedOutput: "STATS_OVERLAY\\|score\\|400\\|combo\\|3x\\|kills\\|3\\|accuracy\\|80%", isPattern: true },
      { id: "t6", description: "Boss wave starts", expectedOutput: "FRAME\\|5\\|PLAYING\\|boss_wave\\|started\\|boss_hp\\|200", isPattern: true },
      { id: "t7", description: "All systems listed", expectedOutput: "SYSTEMS\\|particles\\|shake\\|trails\\|achievements\\|stats\\|pause\\|score\\|lives\\|difficulty", isPattern: true },
      { id: "t8", description: "Milestone 85 passes", expectedOutput: "MILESTONE_85\\|PASS\\|advanced release with full game feel", isPattern: true },
    ],
    hints: [
      "Each frame function updates global state and prints output. Frame 1 does not change score or kills — it just sets up the battlefield. Frame 2 is where kills happen and effects trigger.",
      "The EFFECTS line must match exactly: particles|8|shake|4|trails|3. These come from the kill processing in frame 2. Particles = 4 per kill * 2 kills. Shake intensity = 4 from explosion impact. Trails = 3 cached positions.",
      "Frame 4 pauses and shows the overlay. The accuracy is 80% (spec value). Frame 5 unpauses and sets bossHP = 200. The SYSTEMS line is a static string listing all 9 integrated systems.",
    ],
    estimatedMinutes: 18,
  },
};
