import type { Lesson } from "@/types/lesson";

export const lesson89: Lesson = {
  id: "89-accessibility",
  title: "Accessibility",
  description: "Add reduced-effects mode and high-contrast rendering for accessibility.",
  order: 89,
  xpReward: 225,
  tier: "pro",
  concepts: ["accessibility", "reduced effects", "high contrast", "inclusive design"],
  part1: {
    title: "Concept: Accessibility",
    type: "concept",
    instructions: `# Accessibility — Effects That Exclude Players Are Bugs

Screen shake triggers nausea in players with vestibular disorders. Rapid particle effects cause seizures in photosensitive players. Low-contrast sprites are invisible to colorblind players. These are not edge cases. 15% of the global population has a disability. If your game excludes them, you lost 15% of your audience to a bug you could fix with a boolean.

## What Breaks Without This

Without accessibility modes, the game is one configuration. Full particles. Full shake. Standard contrast. Players who cannot tolerate these effects cannot play. They do not complain — they uninstall. You never hear from the players you excluded. The absence of bug reports is not the absence of bugs.

## The Fix

AccessibilitySettings struct: reducedEffects, highContrast, largeText. When reducedEffects is true, disable particles, shake, and trails. When highContrast is true, remap sprites to bold, distinct characters. The render pipeline checks these flags. Same game logic, different presentation. Zero gameplay impact, massive reach impact.

\\\`\\\`\\\`
struct AccessibilitySettings {
    bool reducedEffects;  // disable particles, shake, trails
    bool highContrast;    // bold ASCII chars
    bool largeText;       // larger UI text
};

// Sprite remap for high contrast:
// player: '@' -> 'X'
// enemy:  'v' -> '#'
// bullet: '|' -> '!'
\\\`\\\`\\\`

The same scene renders two ways. Normal mode: particles flying, shake active, standard sprites. Accessible mode: clean rendering, no motion effects, high-contrast characters. Both are valid. Both are correct. The player chooses.

## Your Task

1. Define AccessibilitySettings: reducedEffects, highContrast, largeText
2. Define sprite mappings for normal and high-contrast modes
3. Render same scene in normal mode:
   \\\`RENDER|mode|normal|player|@|enemy|v|bullet|||particles|8\\\`
4. Render same scene in accessible mode:
   \\\`RENDER|mode|accessible|player|X|enemy|#|bullet|!|particles|0\\\`
5. Print: \\\`ACCESSIBILITY|reduced_effects|ON|high_contrast|ON|features_disabled|3\\\`
6. Print: \\\`A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails\\\`

Expected output:
\\\`\\\`\\\`
RENDER|mode|normal|player|@|enemy|v|bullet|||particles|8
RENDER|mode|accessible|player|X|enemy|#|bullet|!|particles|0
ACCESSIBILITY|reduced_effects|ON|high_contrast|ON|features_disabled|3
A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Implementing accessibility as a separate code path. Two render functions, two collision functions, two of everything. This doubles the bug surface. Instead, the existing render function checks the accessibility flags. One code path, branching on flags. If reducedEffects is true, skip the particle draw call. Do not write a second render function.

## Elite Insight

Microsoft's Gaming Accessibility Guidelines list over 100 recommendations. The top three by impact: remappable controls, subtitle options, and contrast modes. These are not expensive features. They are flag checks in existing systems. The ROI is massive — every major platform now requires basic accessibility for certification. PlayStation, Xbox, and Nintendo all have accessibility requirements.

## Cross-Path Echo

Web accessibility (WCAG) follows identical principles. Reduced motion via \\\`prefers-reduced-motion\\\` CSS media query. High contrast via \\\`prefers-contrast\\\` media query. Screen reader support via ARIA labels. Your game accessibility settings are the game equivalent of CSS media queries — same content, adapted presentation.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct AccessibilitySettings {
    bool reducedEffects;
    bool highContrast;
    bool largeText;
};

AccessibilitySettings a11y;

// TODO: Write getPlayerSprite() — return '@' normal, 'X' high contrast
// TODO: Write getEnemySprite() — return 'v' normal, '#' high contrast
// TODO: Write getBulletSprite() — return '|' normal, '!' high contrast

// TODO: Write getParticleCount() — return 8 normal, 0 reduced effects

// TODO: Write renderScene(string mode) — print RENDER line
//       Use sprite functions and particle count based on mode

// TODO: Write printAccessibilityStatus() — print ACCESSIBILITY line
//       Count features disabled (particles, shake, trails = 3)

// TODO: Write printA11ySummary() — print A11Y_SUMMARY line

int main() {
    // TODO: Set a11y to normal mode, render
    // TODO: Set a11y to accessible mode, render
    // TODO: Print ACCESSIBILITY and A11Y_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct AccessibilitySettings {
    bool reducedEffects;
    bool highContrast;
    bool largeText;
};

AccessibilitySettings a11y;

char getPlayerSprite() {
    return a11y.highContrast ? 'X' : '@';
}

char getEnemySprite() {
    return a11y.highContrast ? '#' : 'v';
}

char getBulletSprite() {
    return a11y.highContrast ? '!' : '|';
}

int getParticleCount() {
    return a11y.reducedEffects ? 0 : 8;
}

void renderScene(string mode) {
    cout << "RENDER|mode|" << mode << "|player|" << getPlayerSprite()
         << "|enemy|" << getEnemySprite() << "|bullet|" << getBulletSprite()
         << "|particles|" << getParticleCount() << endl;
}

void printAccessibilityStatus() {
    int disabled = 0;
    if (a11y.reducedEffects) disabled = 3; // particles, shake, trails
    cout << "ACCESSIBILITY|reduced_effects|" << (a11y.reducedEffects ? "ON" : "OFF")
         << "|high_contrast|" << (a11y.highContrast ? "ON" : "OFF")
         << "|features_disabled|" << disabled << endl;
}

void printA11ySummary() {
    cout << "A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails" << endl;
}

int main() {
    // Normal mode
    a11y.reducedEffects = false;
    a11y.highContrast = false;
    a11y.largeText = false;
    renderScene("normal");

    // Accessible mode
    a11y.reducedEffects = true;
    a11y.highContrast = true;
    a11y.largeText = true;
    renderScene("accessible");

    printAccessibilityStatus();
    printA11ySummary();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Normal render with standard sprites", expectedOutput: "RENDER\\|mode\\|normal\\|player\\|@\\|enemy\\|v\\|bullet\\|\\|\\|particles\\|8", isPattern: true },
      { id: "t2", description: "Accessible render with remapped sprites", expectedOutput: "RENDER\\|mode\\|accessible\\|player\\|X\\|enemy\\|#\\|bullet\\|!\\|particles\\|0", isPattern: true },
      { id: "t3", description: "Accessibility status", expectedOutput: "ACCESSIBILITY\\|reduced_effects\\|ON\\|high_contrast\\|ON\\|features_disabled\\|3", isPattern: true },
      { id: "t4", description: "A11Y summary", expectedOutput: "A11Y_SUMMARY\\|modes\\|2\\|sprite_remaps\\|3\\|effects_disabled\\|particles,shake,trails", isPattern: true },
    ],
    hints: [
      "Each sprite function checks a11y.highContrast. If true, return the bold character (X, #, !). If false, return the standard character (@, v, |). getParticleCount checks a11y.reducedEffects: 0 if true, 8 if false.",
      "renderScene takes a mode string and prints one RENDER line. It calls all sprite functions and getParticleCount. The output changes based on the a11y flags, not the mode string. Set the flags before calling renderScene.",
      "First render with all a11y flags false (normal mode). Then set reducedEffects=true, highContrast=true, largeText=true and render again (accessible mode). Print ACCESSIBILITY after the accessible render.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Accessibility System",
    type: "game_builder",
    instructions: `# Accessibility System — Inclusive Rendering Pipeline

Screen shake causes nausea. Rapid particles trigger seizures. Low contrast excludes colorblind players. An AccessibilitySettings struct controls these features with booleans. The render pipeline checks the flags. Same game, different presentation. Zero gameplay impact, maximum player reach.

## What Breaks Without This

Without accessibility, one configuration ships. Full effects, standard contrast. Players who cannot tolerate motion effects uninstall silently. The game works for 85% and excludes 15%. That is a bug with a two-line fix.

## The Fix

A struct with three booleans. Every visual system checks the flags before rendering. Particles check reducedEffects. Sprites check highContrast. The game logic is identical. Only the presentation adapts.

\\\`\\\`\\\`
// Normal: '@' 'v' '|' + particles + shake
// Accessible: 'X' '#' '!' + no particles + no shake
\\\`\\\`\\\`

## Your Task

1. AccessibilitySettings struct: reducedEffects, highContrast, largeText
2. Sprite remap: player '@'->'X', enemy 'v'->'#', bullet '|'->'!'
3. Render normal mode: \\\`RENDER|mode|normal|player|@|enemy|v|bullet|||particles|8\\\`
4. Render accessible mode: \\\`RENDER|mode|accessible|player|X|enemy|#|bullet|!|particles|0\\\`
5. Print: \\\`ACCESSIBILITY|reduced_effects|ON|high_contrast|ON|features_disabled|3\\\`
6. Print: \\\`A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails\\\`

## Beginner Trap

**Common Mistake:** Creating separate render functions for each mode. One render function that branches on flags. If you duplicate the renderer, every bug fix must be applied twice. One path, conditional presentation.

## Elite Insight

Sony requires accessibility features for PlayStation certification. Microsoft mandates them for Xbox. These are not optional nice-to-haves. They are shipping requirements. A boolean and a branch cost nothing. Failing cert costs months.

## Cross-Path Echo

CSS \\\`prefers-reduced-motion\\\` and \\\`prefers-contrast\\\` media queries solve the same problem for the web. Same content, adapted presentation based on user preference. Your accessibility flags are media queries for game rendering.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct AccessibilitySettings {
    bool reducedEffects;
    bool highContrast;
    bool largeText;
};

AccessibilitySettings a11y;

// TODO: Write getPlayerSprite() — '@' or 'X' based on highContrast
// TODO: Write getEnemySprite() — 'v' or '#' based on highContrast
// TODO: Write getBulletSprite() — '|' or '!' based on highContrast
// TODO: Write getParticleCount() — 8 or 0 based on reducedEffects

// TODO: Write renderScene(string mode) — print RENDER line with sprites

// TODO: Write printAccessibilityStatus()
// TODO: Write printA11ySummary()

int main() {
    // TODO: Normal mode render, then accessible mode render
    // TODO: Print ACCESSIBILITY and A11Y_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct AccessibilitySettings {
    bool reducedEffects;
    bool highContrast;
    bool largeText;
};

AccessibilitySettings a11y;

char getPlayerSprite() {
    return a11y.highContrast ? 'X' : '@';
}

char getEnemySprite() {
    return a11y.highContrast ? '#' : 'v';
}

char getBulletSprite() {
    return a11y.highContrast ? '!' : '|';
}

int getParticleCount() {
    return a11y.reducedEffects ? 0 : 8;
}

void renderScene(string mode) {
    cout << "RENDER|mode|" << mode << "|player|" << getPlayerSprite()
         << "|enemy|" << getEnemySprite() << "|bullet|" << getBulletSprite()
         << "|particles|" << getParticleCount() << endl;
}

void printAccessibilityStatus() {
    int disabled = 0;
    if (a11y.reducedEffects) disabled = 3;
    cout << "ACCESSIBILITY|reduced_effects|" << (a11y.reducedEffects ? "ON" : "OFF")
         << "|high_contrast|" << (a11y.highContrast ? "ON" : "OFF")
         << "|features_disabled|" << disabled << endl;
}

void printA11ySummary() {
    cout << "A11Y_SUMMARY|modes|2|sprite_remaps|3|effects_disabled|particles,shake,trails" << endl;
}

int main() {
    a11y.reducedEffects = false;
    a11y.highContrast = false;
    a11y.largeText = false;
    renderScene("normal");

    a11y.reducedEffects = true;
    a11y.highContrast = true;
    a11y.largeText = true;
    renderScene("accessible");

    printAccessibilityStatus();
    printA11ySummary();

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Normal mode renders standard sprites", expectedOutput: "RENDER\\|mode\\|normal\\|player\\|@\\|enemy\\|v\\|bullet\\|\\|\\|particles\\|8", isPattern: true },
      { id: "t2", description: "Accessible mode renders remapped sprites", expectedOutput: "RENDER\\|mode\\|accessible\\|player\\|X\\|enemy\\|#\\|bullet\\|!\\|particles\\|0", isPattern: true },
      { id: "t3", description: "Accessibility status with features disabled", expectedOutput: "ACCESSIBILITY\\|reduced_effects\\|ON\\|high_contrast\\|ON\\|features_disabled\\|3", isPattern: true },
      { id: "t4", description: "A11Y summary with all counts", expectedOutput: "A11Y_SUMMARY\\|modes\\|2\\|sprite_remaps\\|3\\|effects_disabled\\|particles,shake,trails", isPattern: true },
    ],
    hints: [
      "Sprite functions use the ternary operator: return a11y.highContrast ? 'X' : '@'. Three functions, three remaps. getParticleCount returns a11y.reducedEffects ? 0 : 8.",
      "renderScene prints one line using the sprite functions and particle count. Set a11y flags to false before the first call, set them to true before the second call. The function reads global state.",
      "printAccessibilityStatus counts disabled features: if reducedEffects is true, 3 features are disabled (particles, shake, trails). The A11Y_SUMMARY line is a static string listing all counts.",
    ],
    estimatedMinutes: 8,
  },
};
