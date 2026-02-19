import type { Lesson } from "@/types/lesson";

export const lesson81: Lesson = {
  id: "81-screen-shake",
  title: "Screen Shake",
  description: "Add screen shake on impacts for visceral hit feedback.",
  order: 81,
  xpReward: 200,
  tier: "pro",
  concepts: ["screen shake", "camera offset", "visual impact", "decay function"],
  part1: {
    title: "Concept: Screen Shake",
    type: "concept",
    instructions: `# Screen Shake — The Cheapest Way to Make Hits Feel Real

A bullet hits an enemy. The enemy disappears. Nothing else happens. The hit feels like clicking a checkbox. Add screen shake and the same hit feels like a punch. Screen shake is a camera offset that decays over time. On impact, set an intensity value. Each frame, generate random offsets within that intensity range. Multiply intensity by a decay factor. The screen jolts and settles. Three lines of math, massive feel improvement.

## What Breaks Without This

Without screen shake, every hit feels identical and weightless. A basic enemy dying feels the same as a boss taking a critical hit. Players cannot feel the difference between a pistol and a rocket launcher. Game feel — the visceral quality of interaction — is built from small visual feedback systems. Screen shake is the highest-impact, lowest-cost feedback mechanism that exists.

## The Fix

One variable: shakeIntensity. On impact, set it to a value proportional to the event. Enemy kill: intensity = 4. Boss hit: intensity = 8. Each frame, compute random offsets:

\\\`\\\`\\\`
shakeX = (rand() % (intensity * 2 + 1)) - intensity;
shakeY = (rand() % (intensity * 2 + 1)) - intensity;
\\\`\\\`\\\`

Then decay: intensity = (int)(intensity * 0.7). Integer truncation handles the floor. After a few frames, intensity reaches zero and the camera stabilizes. The decay rate controls how quickly the shake settles. 0.7 gives a fast, punchy feel. 0.9 gives a slow, rumbling feel.

## Your Task

1. shakeIntensity starts at 0
2. On enemy kill (frame 2): shakeIntensity = 4
3. On boss hit (frame 5): shakeIntensity = 8
4. Each frame: compute shakeX, shakeY from intensity using rand() with srand(42)
5. Decay: intensity = (int)(intensity * 0.7)
6. Simulate 7 frames, seed srand(42)
7. Print: \\\`SHAKE|frame|2|trigger|KILL|intensity|4|offset|(<x>,<y>)\\\`
8. Print: \\\`SHAKE|frame|3|decay|intensity|2|offset|(<x>,<y>)\\\`
9. Print: \\\`SHAKE|frame|5|trigger|BOSS_HIT|intensity|8|offset|(<x>,<y>)\\\`
10. Print: \\\`SHAKE_SUMMARY|triggers|2|max_intensity|8|decay_rate|0.7\\\`

Expected output (offsets depend on srand(42)):
\\\`\\\`\\\`
SHAKE|frame|1|intensity|0|offset|(0,0)
SHAKE|frame|2|trigger|KILL|intensity|4|offset|(<x>,<y>)
SHAKE|frame|3|decay|intensity|2|offset|(<x>,<y>)
SHAKE|frame|4|decay|intensity|1|offset|(<x>,<y>)
SHAKE|frame|5|trigger|BOSS_HIT|intensity|8|offset|(<x>,<y>)
SHAKE|frame|6|decay|intensity|5|offset|(<x>,<y>)
SHAKE|frame|7|decay|intensity|3|offset|(<x>,<y>)
SHAKE_SUMMARY|triggers|2|max_intensity|8|decay_rate|0.7
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using floating-point for intensity and never reaching zero. With float decay (0.7), intensity becomes 0.001 but never exactly 0. Use integer truncation: (int)(intensity * 0.7). Integer math guarantees convergence to zero. 4 -> 2 -> 1 -> 0. Clean termination.

## Elite Insight

Vlambeer's game feel talk breaks down why screen shake works. The human eye perceives motion through peripheral vision. A small, rapid camera displacement triggers the same neural response as physical impact. The shake does not need to be large — 4 pixels is enough. The decay curve matters more than the magnitude. Fast decay = snappy. Slow decay = heavy.

## Cross-Path Echo

Exponential backoff in network retries follows the same decay curve. First retry after 1 second. Second after 2. Third after 4. The interval decays toward stability. Screen shake decays toward stillness. Both use multiplicative decay to transition from an event back to steady state. The math is identical: value = value * factor, each iteration.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int shakeIntensity = 0;
int maxIntensity = 0;
int triggerCount = 0;

// TODO: Write triggerShake(intensity)
//   Set shakeIntensity, update maxIntensity, increment triggerCount

// TODO: Write computeShake(shakeX, shakeY)
//   If intensity > 0: shakeX = (rand()%(intensity*2+1)) - intensity
//   Same for shakeY. If intensity == 0: both = 0

// TODO: Write decayShake()
//   shakeIntensity = (int)(shakeIntensity * 0.7)

int main() {
    srand(42);

    // TODO: Simulate 7 frames
    //   Frame 2: trigger KILL, intensity 4
    //   Frame 5: trigger BOSS_HIT, intensity 8
    //   Each frame: compute shake, print, then decay
    //   Print SHAKE_SUMMARY at end

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int shakeIntensity = 0;
int maxIntensity = 0;
int triggerCount = 0;

void triggerShake(int intensity) {
    shakeIntensity = intensity;
    if (intensity > maxIntensity) maxIntensity = intensity;
    triggerCount++;
}

void computeShake(int &shakeX, int &shakeY) {
    if (shakeIntensity > 0) {
        shakeX = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
        shakeY = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
    } else {
        shakeX = 0;
        shakeY = 0;
    }
}

void decayShake() {
    shakeIntensity = (int)(shakeIntensity * 0.7);
}

int main() {
    srand(42);

    for (int frame = 1; frame <= 7; frame++) {
        if (frame == 2) triggerShake(4);
        if (frame == 5) triggerShake(8);

        int sx = 0, sy = 0;
        computeShake(sx, sy);

        if (frame == 2) {
            cout << "SHAKE|frame|" << frame << "|trigger|KILL|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (frame == 5) {
            cout << "SHAKE|frame|" << frame << "|trigger|BOSS_HIT|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (shakeIntensity > 0) {
            cout << "SHAKE|frame|" << frame << "|decay|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else {
            cout << "SHAKE|frame|" << frame << "|intensity|0|offset|(0,0)" << endl;
        }

        decayShake();
    }

    cout << "SHAKE_SUMMARY|triggers|" << triggerCount
         << "|max_intensity|" << maxIntensity
         << "|decay_rate|0.7" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 no shake", expectedOutput: "SHAKE\\|frame\\|1\\|intensity\\|0\\|offset\\|\\(0,0\\)", isPattern: true },
      { id: "t2", description: "Frame 2 kill trigger", expectedOutput: "SHAKE\\|frame\\|2\\|trigger\\|KILL\\|intensity\\|4\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
      { id: "t3", description: "Frame 3 decay", expectedOutput: "SHAKE\\|frame\\|3\\|decay\\|intensity\\|2\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
      { id: "t4", description: "Frame 5 boss hit", expectedOutput: "SHAKE\\|frame\\|5\\|trigger\\|BOSS_HIT\\|intensity\\|8\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
      { id: "t5", description: "Shake summary", expectedOutput: "SHAKE_SUMMARY\\|triggers\\|2\\|max_intensity\\|8\\|decay_rate\\|0\\.7", isPattern: true },
    ],
    hints: [
      "triggerShake sets shakeIntensity to the given value. Track maxIntensity across all triggers. Increment triggerCount each time. The trigger overrides any existing shake — a boss hit during an active kill shake replaces the intensity.",
      "computeShake uses rand() % (intensity*2+1) - intensity to get a value in [-intensity, +intensity]. When intensity is 0, skip the rand() call and set both offsets to 0. This avoids division by zero in the modulo.",
      "decayShake multiplies by 0.7 and casts to int. The sequence for intensity 4: 4 -> 2 -> 1 -> 0. For intensity 8: 8 -> 5 -> 3 -> 2 -> 1 -> 0. Integer truncation guarantees convergence.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Screen Shake",
    type: "game_builder",
    instructions: `# Game Builder: Screen Shake — Camera Offset on Impact

Wire screen shake into the game. On enemy kill, the camera jolts. On boss hit, it jolts harder. The player feels every impact through the screen. This is the difference between a tech demo and a game that feels alive.

## What Breaks Without This

Without shake, combat has no weight. Every kill is silent and still. The player gets no physical feedback that something happened. Screen shake bridges the gap between abstract game logic and visceral player experience.

## The Fix

Add shakeIntensity to the game state. In the collision system, trigger shake on kill events. In the render system, apply shake offsets to the camera before drawing. After rendering, decay the intensity.

\\\`\\\`\\\`
// In collision: if enemy killed, triggerShake(4)
// In collision: if boss hit, triggerShake(8)
// In render: camX += shakeX, camY += shakeY
// After render: decayShake()
\\\`\\\`\\\`

## Your Task

1. shakeIntensity starts at 0. srand(42) at start
2. Frame 2: enemy kill, triggerShake(4)
3. Frame 5: boss hit, triggerShake(8)
4. Each frame: compute shakeX/shakeY, apply to camera, print, decay
5. Print: \\\`SHAKE|frame|2|trigger|KILL|intensity|4|offset|(<x>,<y>)\\\`
6. Print: \\\`SHAKE|frame|3|decay|intensity|2|offset|(<x>,<y>)\\\`
7. Print: \\\`SHAKE|frame|5|trigger|BOSS_HIT|intensity|8|offset|(<x>,<y>)\\\`
8. Print: \\\`SHAKE_SUMMARY|triggers|2|max_intensity|8|decay_rate|0.7\\\`

## Beginner Trap

**Common Mistake:** Applying shake offset to entity positions instead of camera position. Shake modifies the camera, not the entities. If you add shake to entity coordinates, entities drift permanently. Camera offset is temporary — applied during render, discarded after.

## Elite Insight

Screen shake stacks with other feedback: hitflash (1-frame color inversion), hitstop (1-frame pause), particle burst. Each layer adds a millisecond of visual information. Together they create impact that players describe as "crunchy" or "juicy." Shake alone gets you 60% of the way there.

## Cross-Path Echo

Error highlighting in IDEs uses the same principle. A red underline is the "shake" for code errors. It draws attention without being destructive. The intensity (underline vs full background highlight) scales with severity (warning vs error). Feedback proportional to event magnitude — the same design principle.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int shakeIntensity = 0;
int maxIntensity = 0;
int triggerCount = 0;

// TODO: Write triggerShake(intensity)

// TODO: Write computeShake(shakeX, shakeY)

// TODO: Write decayShake()

int main() {
    srand(42);

    // TODO: Simulate 7 frames
    //   Frame 2: trigger KILL (intensity 4)
    //   Frame 5: trigger BOSS_HIT (intensity 8)
    //   Each frame: compute, print, decay
    //   Print SHAKE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int shakeIntensity = 0;
int maxIntensity = 0;
int triggerCount = 0;

void triggerShake(int intensity) {
    shakeIntensity = intensity;
    if (intensity > maxIntensity) maxIntensity = intensity;
    triggerCount++;
}

void computeShake(int &shakeX, int &shakeY) {
    if (shakeIntensity > 0) {
        shakeX = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
        shakeY = (rand() % (shakeIntensity * 2 + 1)) - shakeIntensity;
    } else {
        shakeX = 0;
        shakeY = 0;
    }
}

void decayShake() {
    shakeIntensity = (int)(shakeIntensity * 0.7);
}

int main() {
    srand(42);

    for (int frame = 1; frame <= 7; frame++) {
        if (frame == 2) triggerShake(4);
        if (frame == 5) triggerShake(8);

        int sx = 0, sy = 0;
        computeShake(sx, sy);

        if (frame == 2) {
            cout << "SHAKE|frame|" << frame << "|trigger|KILL|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (frame == 5) {
            cout << "SHAKE|frame|" << frame << "|trigger|BOSS_HIT|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else if (shakeIntensity > 0) {
            cout << "SHAKE|frame|" << frame << "|decay|intensity|" << shakeIntensity
                 << "|offset|(" << sx << "," << sy << ")" << endl;
        } else {
            cout << "SHAKE|frame|" << frame << "|intensity|0|offset|(0,0)" << endl;
        }

        decayShake();
    }

    cout << "SHAKE_SUMMARY|triggers|" << triggerCount
         << "|max_intensity|" << maxIntensity
         << "|decay_rate|0.7" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 2 kill trigger", expectedOutput: "SHAKE\\|frame\\|2\\|trigger\\|KILL\\|intensity\\|4\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
      { id: "t2", description: "Frame 3 decay", expectedOutput: "SHAKE\\|frame\\|3\\|decay\\|intensity\\|2\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
      { id: "t3", description: "Frame 5 boss hit", expectedOutput: "SHAKE\\|frame\\|5\\|trigger\\|BOSS_HIT\\|intensity\\|8\\|offset\\|\\(-?\\d+,-?\\d+\\)", isPattern: true },
      { id: "t4", description: "Shake summary", expectedOutput: "SHAKE_SUMMARY\\|triggers\\|2\\|max_intensity\\|8\\|decay_rate\\|0\\.7", isPattern: true },
    ],
    hints: [
      "triggerShake sets shakeIntensity and tracks maxIntensity and triggerCount. The trigger fires before computeShake so the new intensity is used immediately on the trigger frame.",
      "computeShake: when intensity is 0, set both offsets to 0 without calling rand(). This preserves the RNG sequence for subsequent frames. Only call rand() when intensity > 0.",
      "Decay happens after printing. So frame 2 prints intensity 4, then decays to 2. Frame 3 prints intensity 2, then decays to 1. The sequence is: compute, print, decay.",
    ],
    estimatedMinutes: 8,
  },
};
