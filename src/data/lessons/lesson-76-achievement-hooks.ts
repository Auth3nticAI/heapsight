import type { Lesson } from "@/types/lesson";

export const lesson76: Lesson = {
  id: "76-achievement-hooks",
  title: "Achievement Hooks",
  description: "Track player achievements with event-driven condition checking.",
  order: 76,
  xpReward: 200,
  tier: "pro",
  concepts: ["achievement system", "event hooks", "condition checking", "unlock tracking"],
  part1: {
    title: "Concept: Achievement Hooks",
    type: "concept",
    instructions: `# Achievement Hooks — Silent Conditions, Loud Rewards

Every game tracks kills. Few games make kills matter beyond the score counter. Achievements turn raw gameplay events into goals. First kill. Three kills in a row. Boss defeated. But checking achievements naively — every condition every frame — burns CPU on conditions that cannot possibly be true. Hook the checks to the events that can actually trigger them. Kill event checks kill achievements. Score event checks score achievements. No polling. No waste.

## What Breaks Without This

Without event hooks, you poll every achievement condition every frame. Five achievements with simple checks is fine. Fifty achievements with complex conditions is a disaster. Worse, polling misses the moment of unlock. The player gets "First Blood" notification three frames late because the check ran after the render. Hook the check to the kill event and the unlock is instantaneous.

## The Fix

Define each achievement as a struct: id, name, a condition to check, and an unlocked flag. After each gameplay event — kill, score change, combo change, wave clear — run only the achievements that care about that event type. When a condition is met, set unlocked to true and print the notification. Never check an unlocked achievement again.

\\\`\\\`\\\`
struct Achievement {
    string id;
    string name;
    bool unlocked;
};

// After a kill event:
// for each kill-related achievement:
//   if (!unlocked && condition met) unlock it
\\\`\\\`\\\`

The key insight: achievements are event filters. They only activate when their trigger event fires. A combo achievement does not care about wave clears. A survival achievement does not care about kills. Match the hook to the event.

## Your Task

1. Define an Achievement struct: id (string), name (string), unlocked (bool)
2. Create 5 achievements:
   - "first_blood" / "First Blood" — unlocks at 1+ kills
   - "combo_3" / "Triple Threat" — unlocks at 3+ combo
   - "boss_slayer" / "Boss Slayer" — unlocks when boss is killed
   - "sharpshooter" / "Sharpshooter" — unlocks at 80%+ accuracy
   - "survivor" / "Survivor" — unlocks when a wave is completed with 0 hits taken
3. Simulate game events: get first kill at frame 3, reach 3x combo at frame 7, kill boss at frame 12
4. After each event, check relevant achievements
5. Print on unlock: \\\`ACHIEVEMENT|UNLOCKED|<id>|<name>|frame|<f>\\\`
6. Print progress check: \\\`ACHIEVEMENT|CHECK|sharpshooter|progress|75%|needed|80%\\\`
7. Print: \\\`ACHIEVEMENT_SUMMARY|unlocked|3|total|5|completion|60%\\\`

Expected output:
\\\`\\\`\\\`
ACHIEVEMENT|UNLOCKED|first_blood|First Blood|frame|3
ACHIEVEMENT|UNLOCKED|combo_3|Triple Threat|frame|7
ACHIEVEMENT|UNLOCKED|boss_slayer|Boss Slayer|frame|12
ACHIEVEMENT|CHECK|sharpshooter|progress|75%|needed|80%
ACHIEVEMENT_SUMMARY|unlocked|3|total|5|completion|60%
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Checking achievements after they are already unlocked. Once "First Blood" triggers, it should never be checked again. Guard every check with \\\`if (!unlocked)\\\`. Without this guard, you waste cycles and risk printing duplicate notifications.

## Elite Insight

Commercial achievement systems separate the condition from the notification. The condition check is pure logic — no side effects. The notification is queued and displayed by the UI system on the next frame. This separation means achievement checks can run on any thread without touching the render pipeline. Your struct-based approach is the foundation of this pattern.

## Cross-Path Echo

CI badge systems work identically. A repository earns badges for passing tests, code coverage thresholds, and successful deployments. Each badge has a condition checked after specific events — test completion, coverage report, deploy success. Once earned, the badge persists. Your achievement system is a badge engine for gameplay.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

const int NUM_ACHIEVEMENTS = 5;
Achievement achievements[NUM_ACHIEVEMENTS];

int kills = 0;
int combo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;
bool waveClearedNoHits = false;

// TODO: Write initAchievements()
//   Set up 5 achievements: first_blood, combo_3, boss_slayer, sharpshooter, survivor
//   All start unlocked = false

// TODO: Write checkKillAchievements(frame)
//   Check first_blood (kills >= 1) and boss_slayer (bossKilled)
//   Print ACHIEVEMENT|UNLOCKED line if newly unlocked

// TODO: Write checkComboAchievements(frame)
//   Check combo_3 (combo >= 3)

// TODO: Write checkAccuracyAchievements(frame)
//   Calculate accuracy = shotsHit * 100 / shotsFired
//   If >= 80, unlock sharpshooter
//   Else print ACHIEVEMENT|CHECK with progress

// TODO: Write checkSurvivorAchievements(frame)
//   Check survivor (waveClearedNoHits)

// TODO: Write printSummary()
//   Count unlocked, print ACHIEVEMENT_SUMMARY

int main() {
    // TODO: Init achievements
    // TODO: Simulate events:
    //   Frame 3: first kill (kills=1, shotsFired=4, shotsHit=3)
    //   Frame 7: combo reaches 3 (combo=3)
    //   Frame 12: boss killed (bossKilled=true, shotsFired=20, shotsHit=15)
    //   Check accuracy after boss kill
    //   Print summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

const int NUM_ACHIEVEMENTS = 5;
Achievement achievements[NUM_ACHIEVEMENTS];

int kills = 0;
int combo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;
bool waveClearedNoHits = false;

void initAchievements() {
    achievements[0] = {"first_blood", "First Blood", false};
    achievements[1] = {"combo_3", "Triple Threat", false};
    achievements[2] = {"boss_slayer", "Boss Slayer", false};
    achievements[3] = {"sharpshooter", "Sharpshooter", false};
    achievements[4] = {"survivor", "Survivor", false};
}

void checkKillAchievements(int frame) {
    if (!achievements[0].unlocked && kills >= 1) {
        achievements[0].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[0].id << "|"
             << achievements[0].name << "|frame|" << frame << endl;
    }
    if (!achievements[2].unlocked && bossKilled) {
        achievements[2].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[2].id << "|"
             << achievements[2].name << "|frame|" << frame << endl;
    }
}

void checkComboAchievements(int frame) {
    if (!achievements[1].unlocked && combo >= 3) {
        achievements[1].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[1].id << "|"
             << achievements[1].name << "|frame|" << frame << endl;
    }
}

void checkAccuracyAchievements(int frame) {
    if (achievements[3].unlocked) return;
    int accuracy = (shotsFired > 0) ? (shotsHit * 100 / shotsFired) : 0;
    if (accuracy >= 80) {
        achievements[3].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[3].id << "|"
             << achievements[3].name << "|frame|" << frame << endl;
    } else {
        cout << "ACHIEVEMENT|CHECK|sharpshooter|progress|" << accuracy
             << "%|needed|80%" << endl;
    }
}

void checkSurvivorAchievements(int frame) {
    if (!achievements[4].unlocked && waveClearedNoHits) {
        achievements[4].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[4].id << "|"
             << achievements[4].name << "|frame|" << frame << endl;
    }
}

void printSummary() {
    int unlocked = 0;
    for (int i = 0; i < NUM_ACHIEVEMENTS; i++) {
        if (achievements[i].unlocked) unlocked++;
    }
    int pct = unlocked * 100 / NUM_ACHIEVEMENTS;
    cout << "ACHIEVEMENT_SUMMARY|unlocked|" << unlocked << "|total|"
         << NUM_ACHIEVEMENTS << "|completion|" << pct << "%" << endl;
}

int main() {
    initAchievements();

    // Frame 3: first kill
    kills = 1;
    shotsFired = 4;
    shotsHit = 3;
    checkKillAchievements(3);

    // Frame 7: combo reaches 3
    combo = 3;
    checkComboAchievements(7);

    // Frame 12: boss killed
    bossKilled = true;
    kills = 8;
    shotsFired = 20;
    shotsHit = 15;
    checkKillAchievements(12);

    // Check accuracy after boss kill
    checkAccuracyAchievements(12);

    // Print summary
    printSummary();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First blood unlocks", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|first_blood\\|First Blood\\|frame\\|3", isPattern: true },
      { id: "t2", description: "Combo achievement unlocks", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|combo_3\\|Triple Threat\\|frame\\|7", isPattern: true },
      { id: "t3", description: "Boss slayer unlocks", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|boss_slayer\\|Boss Slayer\\|frame\\|12", isPattern: true },
      { id: "t4", description: "Sharpshooter progress shown", expectedOutput: "ACHIEVEMENT\\|CHECK\\|sharpshooter\\|progress\\|75%\\|needed\\|80%", isPattern: true },
      { id: "t5", description: "Summary shows 3 of 5", expectedOutput: "ACHIEVEMENT_SUMMARY\\|unlocked\\|3\\|total\\|5\\|completion\\|60%", isPattern: true },
    ],
    hints: [
      "Initialize all 5 achievements with unlocked=false. Use array indices: 0=first_blood, 1=combo_3, 2=boss_slayer, 3=sharpshooter, 4=survivor. The init function sets id, name, and unlocked for each.",
      "Accuracy = shotsHit * 100 / shotsFired. With 15 hits out of 20 shots, accuracy = 75%. Since 75 < 80, sharpshooter does not unlock — print the CHECK line instead.",
      "The summary counts unlocked achievements: first_blood, combo_3, boss_slayer = 3. Completion = 3 * 100 / 5 = 60%.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Achievement Hooks",
    type: "game_builder",
    instructions: `# Game Builder: Achievement Hooks — Event-Driven Unlock System

Achievements transform raw gameplay data into player goals. But checking every condition every frame is wasteful. Hook achievement checks to the events that can trigger them. Kill events check kill achievements. Combo events check combo achievements. The system scales to hundreds of achievements because each check only runs when its trigger fires.

## What Breaks Without This

Without event-driven hooks, achievement checking becomes a linear scan every frame. Five achievements is invisible. Fifty is noticeable. Five hundred is a frame spike. Worse, polling achievements misses the exact moment of unlock, making notifications feel laggy. Event hooks give you instant, zero-waste notifications.

## The Fix

Each achievement has a trigger type. After each game event, iterate only achievements matching that trigger. Check the condition. If met and not already unlocked, unlock it. Print the notification. Skip already-unlocked achievements immediately.

\\\`\\\`\\\`
// After kill event: check kill-triggered achievements
// After combo event: check combo-triggered achievements
// After wave clear: check survival-triggered achievements
\\\`\\\`\\\`

## Your Task

1. Define 5 achievements: first_blood, combo_3, boss_slayer, sharpshooter, survivor
2. Simulate a game session with these events:
   - Frame 3: first kill (kills=1)
   - Frame 7: combo reaches 3
   - Frame 12: boss killed, check accuracy (15/20 = 75%)
3. After each event, run only relevant achievement checks
4. Print: \\\`ACHIEVEMENT|UNLOCKED|first_blood|First Blood|frame|3\\\`
5. Print: \\\`ACHIEVEMENT|UNLOCKED|combo_3|Triple Threat|frame|7\\\`
6. Print: \\\`ACHIEVEMENT|UNLOCKED|boss_slayer|Boss Slayer|frame|12\\\`
7. Print: \\\`ACHIEVEMENT|CHECK|sharpshooter|progress|75%|needed|80%\\\`
8. Print: \\\`ACHIEVEMENT_SUMMARY|unlocked|3|total|5|completion|60%\\\`

## Beginner Trap

**Common Mistake:** Forgetting the unlocked guard. Without \\\`if (!unlocked)\\\`, a kill at frame 3 and another at frame 5 both print "First Blood." The guard ensures one notification per achievement, ever.

## Elite Insight

Steam, PlayStation, and Xbox achievement APIs all use this pattern internally. The SDK provides registerAchievement and unlockAchievement calls. Your local check determines when to call unlock. The platform handles persistence, notification display, and cloud sync. Your struct-based system is the local half of that pipeline.

## Cross-Path Echo

Feature flags in web applications are achievements in reverse. A feature flag checks a condition — user in beta group, A/B test variant, subscription tier — and enables functionality. Your achievement check is a feature flag that enables a notification and a badge. Same pattern, different domain.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

const int NUM_ACHIEVEMENTS = 5;
Achievement achievements[NUM_ACHIEVEMENTS];

int kills = 0;
int combo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;
bool waveClearedNoHits = false;

// TODO: Write initAchievements()

// TODO: Write checkKillAchievements(frame) — first_blood and boss_slayer

// TODO: Write checkComboAchievements(frame) — combo_3

// TODO: Write checkAccuracyAchievements(frame) — sharpshooter

// TODO: Write checkSurvivorAchievements(frame) — survivor

// TODO: Write printSummary() — count unlocked, print summary

int main() {
    // TODO: Init achievements
    // TODO: Frame 3: kills=1, shotsFired=4, shotsHit=3, check kill achievements
    // TODO: Frame 7: combo=3, check combo achievements
    // TODO: Frame 12: bossKilled=true, kills=8, shotsFired=20, shotsHit=15
    //       Check kill achievements, then accuracy achievements
    // TODO: Print summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Achievement {
    string id;
    string name;
    bool unlocked;
};

const int NUM_ACHIEVEMENTS = 5;
Achievement achievements[NUM_ACHIEVEMENTS];

int kills = 0;
int combo = 0;
int shotsFired = 0;
int shotsHit = 0;
bool bossKilled = false;
bool waveClearedNoHits = false;

void initAchievements() {
    achievements[0] = {"first_blood", "First Blood", false};
    achievements[1] = {"combo_3", "Triple Threat", false};
    achievements[2] = {"boss_slayer", "Boss Slayer", false};
    achievements[3] = {"sharpshooter", "Sharpshooter", false};
    achievements[4] = {"survivor", "Survivor", false};
}

void checkKillAchievements(int frame) {
    if (!achievements[0].unlocked && kills >= 1) {
        achievements[0].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[0].id << "|"
             << achievements[0].name << "|frame|" << frame << endl;
    }
    if (!achievements[2].unlocked && bossKilled) {
        achievements[2].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[2].id << "|"
             << achievements[2].name << "|frame|" << frame << endl;
    }
}

void checkComboAchievements(int frame) {
    if (!achievements[1].unlocked && combo >= 3) {
        achievements[1].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[1].id << "|"
             << achievements[1].name << "|frame|" << frame << endl;
    }
}

void checkAccuracyAchievements(int frame) {
    if (achievements[3].unlocked) return;
    int accuracy = (shotsFired > 0) ? (shotsHit * 100 / shotsFired) : 0;
    if (accuracy >= 80) {
        achievements[3].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[3].id << "|"
             << achievements[3].name << "|frame|" << frame << endl;
    } else {
        cout << "ACHIEVEMENT|CHECK|sharpshooter|progress|" << accuracy
             << "%|needed|80%" << endl;
    }
}

void checkSurvivorAchievements(int frame) {
    if (!achievements[4].unlocked && waveClearedNoHits) {
        achievements[4].unlocked = true;
        cout << "ACHIEVEMENT|UNLOCKED|" << achievements[4].id << "|"
             << achievements[4].name << "|frame|" << frame << endl;
    }
}

void printSummary() {
    int unlocked = 0;
    for (int i = 0; i < NUM_ACHIEVEMENTS; i++) {
        if (achievements[i].unlocked) unlocked++;
    }
    int pct = unlocked * 100 / NUM_ACHIEVEMENTS;
    cout << "ACHIEVEMENT_SUMMARY|unlocked|" << unlocked << "|total|"
         << NUM_ACHIEVEMENTS << "|completion|" << pct << "%" << endl;
}

int main() {
    initAchievements();

    // Frame 3: first kill
    kills = 1;
    shotsFired = 4;
    shotsHit = 3;
    checkKillAchievements(3);

    // Frame 7: combo reaches 3
    combo = 3;
    checkComboAchievements(7);

    // Frame 12: boss killed
    bossKilled = true;
    kills = 8;
    shotsFired = 20;
    shotsHit = 15;
    checkKillAchievements(12);
    checkAccuracyAchievements(12);

    printSummary();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First blood unlocks at frame 3", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|first_blood\\|First Blood\\|frame\\|3", isPattern: true },
      { id: "t2", description: "Triple Threat unlocks at frame 7", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|combo_3\\|Triple Threat\\|frame\\|7", isPattern: true },
      { id: "t3", description: "Boss Slayer unlocks at frame 12", expectedOutput: "ACHIEVEMENT\\|UNLOCKED\\|boss_slayer\\|Boss Slayer\\|frame\\|12", isPattern: true },
      { id: "t4", description: "Sharpshooter progress check", expectedOutput: "ACHIEVEMENT\\|CHECK\\|sharpshooter\\|progress\\|75%\\|needed\\|80%", isPattern: true },
      { id: "t5", description: "Achievement summary", expectedOutput: "ACHIEVEMENT_SUMMARY\\|unlocked\\|3\\|total\\|5\\|completion\\|60%", isPattern: true },
    ],
    hints: [
      "Set up achievements as an array of 5 structs. Index 0 = first_blood, 1 = combo_3, 2 = boss_slayer, 3 = sharpshooter, 4 = survivor. All start with unlocked = false.",
      "Accuracy = shotsHit * 100 / shotsFired = 15 * 100 / 20 = 75. Since 75 < 80, sharpshooter stays locked. Print the CHECK line showing current progress vs needed threshold.",
      "Summary counts unlocked achievements (3) out of total (5). Completion = 3 * 100 / 5 = 60%. Only first_blood, combo_3, and boss_slayer unlock in this simulation.",
    ],
    estimatedMinutes: 10,
  },
};
