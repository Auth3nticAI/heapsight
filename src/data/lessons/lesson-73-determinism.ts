import type { Lesson } from "@/types/lesson";

export const lesson73: Lesson = {
  id: "73-determinism",
  title: "Determinism Rules",
  description: "Lock randomness with seeds so gameplay is perfectly reproducible.",
  order: 73,
  xpReward: 200,
  tier: "pro",
  concepts: ["determinism", "seeded random", "reproducibility", "fixed-seed RNG"],
  part1: {
    title: "Concept: Determinism Rules",
    type: "concept",
    instructions: `# Determinism Rules — Unseeded Randomness Kills Replays

Your game uses rand() to spawn enemies at random positions. Every playthrough is different. Sounds great until you need replays, network sync, or bug reproduction. Without a seed, rand() pulls from system entropy. Two runs produce different sequences. You cannot reproduce a bug. You cannot sync two machines. You cannot replay a match. One call to srand(seed) fixes everything.

## What Breaks Without This

Without seeded randomness, every run diverges. Player reports a crash on wave 7? You cannot reproduce it because your wave 7 has different enemy positions. Multiplayer desyncs because each client generates different random values. Replay files are useless because the recorded inputs produce different outcomes on playback. Determinism is a prerequisite for debugging, networking, and replays.

## The Fix

Call srand(seed) once at startup. Every subsequent rand() call returns the same sequence for that seed. Same seed, same game. Always.

\\\`\\\`\\\`
srand(42);
int a = rand();  // always the same value for seed 42
int b = rand();  // always the same second value
int c = rand();  // always the same third value
\\\`\\\`\\\`

The sequence is deterministic. Run it a million times with seed 42 and you get the same values every time. Change the seed to 43 and you get a completely different but equally deterministic sequence.

## Your Task

1. Set srand(42)
2. Generate 5 random values with rand() % 100
3. Store them in an array
4. Print each: \\\`RNG|seed|42|call|<n>|value|<v>\\\`
5. Reset: call srand(42) again
6. Generate 5 more values with rand() % 100
7. Compare each pair. Print: \\\`VERIFY|call|<n>|run1|<v1>|run2|<v2>|match|<true/false>\\\`
8. Print: \\\`DETERMINISM|seed|42|calls|5|all_match|true\\\`

Expected: All 5 pairs match because the seed was reset.

## Beginner Trap

**Common Mistake:** Calling srand() in a loop or calling it multiple times without resetting. Each srand() call resets the sequence. If you call srand(42) before every rand(), you get the same first value every time, not a sequence. Call srand() once. Call rand() many times.

## Elite Insight

Competitive games use deterministic lockstep networking. Each client seeds the RNG identically and processes the same inputs. No game state is transmitted, only inputs. If any client's RNG diverges, the game desyncs. The seed is the synchronization primitive. Your single srand() call is the foundation of lockstep multiplayer.

## Cross-Path Echo

Unit tests use seeded randomness for property-based testing. Generate random inputs with a fixed seed. If the test fails, the seed reproduces the exact failure. No flaky tests. No unreproducible bugs. Your game's determinism is the same principle applied to real-time simulation.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    int run1[5];
    int run2[5];

    // TODO: Set srand(42)
    // TODO: Generate 5 values with rand() % 100, store in run1
    // TODO: Print RNG line for each value

    // TODO: Reset srand(42)
    // TODO: Generate 5 values with rand() % 100, store in run2

    // TODO: Compare run1 and run2, print VERIFY line for each pair

    // TODO: Print DETERMINISM summary (check if all matched)

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

int main() {
    int run1[5];
    int run2[5];

    // First run
    srand(42);
    for (int i = 0; i < 5; i++) {
        run1[i] = rand() % 100;
        cout << "RNG|seed|42|call|" << (i + 1)
             << "|value|" << run1[i] << endl;
    }

    // Second run — same seed
    srand(42);
    for (int i = 0; i < 5; i++) {
        run2[i] = rand() % 100;
    }

    // Verify
    bool allMatch = true;
    for (int i = 0; i < 5; i++) {
        bool match = (run1[i] == run2[i]);
        if (!match) allMatch = false;
        cout << "VERIFY|call|" << (i + 1)
             << "|run1|" << run1[i]
             << "|run2|" << run2[i]
             << "|match|" << (match ? "true" : "false") << endl;
    }

    cout << "DETERMINISM|seed|42|calls|5|all_match|"
         << (allMatch ? "true" : "false") << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First RNG value printed", expectedOutput: "RNG\\|seed\\|42\\|call\\|1\\|value\\|\\d+", isPattern: true },
      { id: "t2", description: "Fifth RNG value printed", expectedOutput: "RNG\\|seed\\|42\\|call\\|5\\|value\\|\\d+", isPattern: true },
      { id: "t3", description: "First pair verified", expectedOutput: "VERIFY\\|call\\|1\\|run1\\|\\d+\\|run2\\|\\d+\\|match\\|true", isPattern: true },
      { id: "t4", description: "Fifth pair verified", expectedOutput: "VERIFY\\|call\\|5\\|run1\\|\\d+\\|run2\\|\\d+\\|match\\|true", isPattern: true },
      { id: "t5", description: "All values match", expectedOutput: "DETERMINISM\\|seed\\|42\\|calls\\|5\\|all_match\\|true", isPattern: true },
    ],
    hints: [
      "Call srand(42) once before the first loop. Use rand() % 100 to get values 0-99. Store each in run1[i] and print the RNG line immediately.",
      "Call srand(42) again before the second loop. This resets the sequence to the beginning. The second loop generates identical values into run2[i].",
      "Compare with run1[i] == run2[i]. Track allMatch as a bool that starts true and flips false if any pair mismatches. Print the ternary: match ? \"true\" : \"false\".",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Deterministic Gameplay",
    type: "game_builder",
    instructions: `# Game Builder: Deterministic Gameplay — Reproducible Space Shooter

Your space shooter uses rand() for enemy spawn positions, wave timing, and powerup drops. Without a seed, every playthrough is unique. With srand(42), every playthrough is identical. Same enemies at the same positions. Same powerup at the same frame. Run it twice and every value matches. This is the foundation of replays and network sync.

## What Breaks Without This

Without determinism, you cannot replay a game. You cannot debug a crash that only happens on wave 7 with specific enemy positions. You cannot run multiplayer with lockstep networking because each client generates different random values. The game diverges within frames. Determinism is not a feature. It is an engineering requirement.

## The Fix

One srand() call at startup. Every rand() call after that is deterministic. Log every random value with its purpose. Run the same sequence twice. Compare every value. Perfect match means perfect reproducibility.

\\\`\\\`\\\`
srand(42);
int spawnX = rand() % 300;   // always the same
int spawnY = rand() % 100;   // always the same
int powerup = rand() % 4;    // always the same
\\\`\\\`\\\`

## Your Task

1. Set srand(42) at game start
2. Simulate 5 frames. Each frame uses 3 rand() calls:
   - spawn_x = rand() % 300 (enemy X position)
   - spawn_y = rand() % 100 (enemy Y position)
   - powerup = rand() % 4 (powerup type: 0=none, 1=speed, 2=damage, 3=shield)
3. First run: store all 15 values, print each:
   \\\`RNG|frame|<f>|call|<n>|value|<v>|used_for|<purpose>\\\`
4. Reset srand(42). Run same 5 frames again
5. Compare each value pair per frame:
   \\\`DETERMINISM|frame|<f>|match|<true/false>|values_compared|3\\\`
6. After all frames:
   \\\`DETERMINISM_SUMMARY|seed|42|total_rng_calls|15|reproducible|true\\\`

## Beginner Trap

**Common Mistake:** Calling rand() a different number of times in the second run. If you add a debug rand() call or skip one, the entire sequence shifts. Every rand() call must be identical between runs. One extra call and all subsequent values diverge.

## Elite Insight

Replay systems store the seed and the input sequence. To replay, set the seed and feed the same inputs. The simulation produces identical results frame by frame. StarCraft, Age of Empires, and Factorio all use this technique. File size is tiny: just inputs and a seed. The deterministic simulation reconstructs everything.

## Cross-Path Echo

Cryptographic systems use seeded PRNGs for key generation. Given the same seed, the same key is produced on any machine. Your game's determinism is the same principle applied to entertainment instead of security. The math is identical.`,
    starterCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int main() {
    const int FRAMES = 5;
    const int CALLS_PER_FRAME = 3;
    const int TOTAL_CALLS = FRAMES * CALLS_PER_FRAME;

    int run1[TOTAL_CALLS];
    int run2[TOTAL_CALLS];
    string purposes[] = {"spawn_x", "spawn_y", "powerup"};
    int mods[] = {300, 100, 4};

    // TODO: First run — srand(42)
    //   For each frame (1-5):
    //     Generate 3 rand() values with appropriate modulus
    //     Store in run1 array
    //     Print RNG line for each

    // TODO: Second run — srand(42) again
    //   Generate same 15 values into run2

    // TODO: Compare per frame (3 values each)
    //   Print DETERMINISM line per frame

    // TODO: Print DETERMINISM_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
#include <string>
using namespace std;

int main() {
    const int FRAMES = 5;
    const int CALLS_PER_FRAME = 3;
    const int TOTAL_CALLS = FRAMES * CALLS_PER_FRAME;

    int run1[TOTAL_CALLS];
    int run2[TOTAL_CALLS];
    string purposes[] = {"spawn_x", "spawn_y", "powerup"};
    int mods[] = {300, 100, 4};

    // First run
    srand(42);
    for (int f = 0; f < FRAMES; f++) {
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            run1[idx] = rand() % mods[c];
            cout << "RNG|frame|" << (f + 1)
                 << "|call|" << (c + 1)
                 << "|value|" << run1[idx]
                 << "|used_for|" << purposes[c] << endl;
        }
    }

    // Second run — same seed
    srand(42);
    for (int f = 0; f < FRAMES; f++) {
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            run2[idx] = rand() % mods[c];
        }
    }

    // Compare per frame
    bool allReproducible = true;
    for (int f = 0; f < FRAMES; f++) {
        bool frameMatch = true;
        for (int c = 0; c < CALLS_PER_FRAME; c++) {
            int idx = f * CALLS_PER_FRAME + c;
            if (run1[idx] != run2[idx]) frameMatch = false;
        }
        if (!frameMatch) allReproducible = false;
        cout << "DETERMINISM|frame|" << (f + 1)
             << "|match|" << (frameMatch ? "true" : "false")
             << "|values_compared|" << CALLS_PER_FRAME << endl;
    }

    cout << "DETERMINISM_SUMMARY|seed|42|total_rng_calls|"
         << TOTAL_CALLS << "|reproducible|"
         << (allReproducible ? "true" : "false") << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 call 1 spawn_x logged", expectedOutput: "RNG\\|frame\\|1\\|call\\|1\\|value\\|\\d+\\|used_for\\|spawn_x", isPattern: true },
      { id: "t2", description: "Frame 1 call 2 spawn_y logged", expectedOutput: "RNG\\|frame\\|1\\|call\\|2\\|value\\|\\d+\\|used_for\\|spawn_y", isPattern: true },
      { id: "t3", description: "Frame 5 call 3 powerup logged", expectedOutput: "RNG\\|frame\\|5\\|call\\|3\\|value\\|\\d+\\|used_for\\|powerup", isPattern: true },
      { id: "t4", description: "Frame 1 determinism match", expectedOutput: "DETERMINISM\\|frame\\|1\\|match\\|true\\|values_compared\\|3", isPattern: true },
      { id: "t5", description: "Frame 5 determinism match", expectedOutput: "DETERMINISM\\|frame\\|5\\|match\\|true\\|values_compared\\|3", isPattern: true },
      { id: "t6", description: "Determinism summary reproducible", expectedOutput: "DETERMINISM_SUMMARY\\|seed\\|42\\|total_rng_calls\\|15\\|reproducible\\|true", isPattern: true },
    ],
    hints: [
      "Use a flat index: idx = f * CALLS_PER_FRAME + c. This maps frame 0 call 0 to index 0, frame 0 call 1 to index 1, etc. Store each rand() % mods[c] result at this index.",
      "The purposes[] and mods[] arrays are parallel. purposes[0] = \"spawn_x\" with mods[0] = 300. purposes[1] = \"spawn_y\" with mods[1] = 100. purposes[2] = \"powerup\" with mods[2] = 4.",
      "Call srand(42) before each run. The second run must make exactly the same number of rand() calls in the same order. Compare with run1[idx] != run2[idx] to detect mismatches.",
    ],
    estimatedMinutes: 8,
  },
};
