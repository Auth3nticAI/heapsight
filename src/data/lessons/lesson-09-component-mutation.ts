import type { Lesson } from "@/types/lesson";

export const lesson09: Lesson = {
  id: "09-component-mutation",
  title: "Component Mutation",
  description: "Modify component data in place using references. No copies. Direct mutation.",
  order: 9,
  xpReward: 125,
  tier: "pro",
  concepts: ["references", "pass by reference", "in-place mutation", "system functions"],
  part1: {
    title: "Concept: Component Mutation",
    type: "concept",
    instructions: `# Component Mutation

A system function takes a reference to the data and modifies it directly. No copies. No return values for bulk operations. This is how ECS systems work.

## The Problem: Pass by Value

\`\`\`cpp
void applyDamage(int hp, int damage) {
    hp = hp - damage;  // modifies local copy
}
\`\`\`

This copies \`hp\`. The function modifies the copy. Original unchanged. Your damage function reduces hp to 0 inside the function but the enemy still shows 30 hp in the render loop. The copy was destroyed. The original survives.

## The Fix: Pass by Reference

Add \`&\` to the parameter:

\`\`\`cpp
void applyDamage(int& hp, int damage) {
    hp = hp - damage;  // modifies the ORIGINAL
    if (hp < 0) hp = 0;
}
\`\`\`

Now \`hp\` IS the original, not a copy. Mutation is direct.

## Why This Matters

Reference = pointer under the hood. One address (8 bytes on 64-bit). No matter the data size. Pass a 1MB struct by reference = still 8 bytes. By value = 1MB copy.

A reference doesn't allocate memory. It's an alias. Zero overhead. The compiler often optimizes it away entirely.

## Systems Thinking

The movement system takes \`enemy_y[]\` by reference and adds speed to every element. One function call mutates the entire array in place. The damage system takes \`enemy_hp[]\` by reference and subtracts damage. No copies anywhere on the hot path.

## Beginner Trap

\`void applyDamage(int hp, int damage)\` — forgetting the \`&\`. The function compiles. The function runs. The test passes inside the function. But the caller's hp never changes. Silent bug. This is the most common C++ mistake.

## Elite Insight

C++ references are syntactic sugar over pointers. The compiler generates identical code for \`void f(int& x)\` and \`void f(int* x)\`. References just can't be null. Safer by design.

## Skill Map

L5 introduced functions (by value). L9 adds references (in-place mutation). L26 uses raw pointers for the same purpose. L29 uses unique_ptr for ownership.

## Mastery Check

What's the difference between \`void damage(int hp, int d)\` and \`void damage(int& hp, int d)\`? First copies, second modifies original.

## Your Task

1. Write \`void damageEnemy(int& hp, int damage)\` that subtracts damage and clamps to 0
2. Create an array of 3 enemy HP values, all starting at 30
3. Loop through all enemies and call \`damageEnemy\` with 15 damage (first round)
4. Print HP after first round
5. Loop again with 15 more damage (second round)
6. Print HP after second round
7. Output destruction message`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write damageEnemy function
// Takes hp by REFERENCE (int&) and damage by value
// Subtract damage from hp, clamp to 0

int main() {
    const int COUNT = 3;
    int enemy_hp[COUNT] = {30, 30, 30};

    cout << "Before damage:" << endl;
    for (int i = 0; i < COUNT; i++) {
        cout << "  enemy[" << i << "] hp = " << enemy_hp[i] << endl;
    }

    // TODO: First round - apply 15 damage to each enemy via reference
    cout << "Applying 15 damage to each via reference..." << endl;


    cout << "After damage:" << endl;
    for (int i = 0; i < COUNT; i++) {
        cout << "  enemy[" << i << "] hp = " << enemy_hp[i] << endl;
    }

    // TODO: Second round - apply 15 more damage to each enemy
    cout << "Applying 15 more damage..." << endl;


    cout << "After second hit:" << endl;
    for (int i = 0; i < COUNT; i++) {
        cout << "  enemy[" << i << "] hp = " << enemy_hp[i] << endl;
    }

    cout << "GAME_MESSAGE|All enemies destroyed via reference mutation" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

void damageEnemy(int& hp, int damage) {
    hp = hp - damage;
    if (hp < 0) hp = 0;
}

int main() {
    const int COUNT = 3;
    int enemy_hp[COUNT] = {30, 30, 30};

    cout << "Before damage:" << endl;
    for (int i = 0; i < COUNT; i++) {
        cout << "  enemy[" << i << "] hp = " << enemy_hp[i] << endl;
    }

    cout << "Applying 15 damage to each via reference..." << endl;
    for (int i = 0; i < COUNT; i++) {
        damageEnemy(enemy_hp[i], 15);
    }

    cout << "After damage:" << endl;
    for (int i = 0; i < COUNT; i++) {
        cout << "  enemy[" << i << "] hp = " << enemy_hp[i] << endl;
    }

    cout << "Applying 15 more damage..." << endl;
    for (int i = 0; i < COUNT; i++) {
        damageEnemy(enemy_hp[i], 15);
    }

    cout << "After second hit:" << endl;
    for (int i = 0; i < COUNT; i++) {
        cout << "  enemy[" << i << "] hp = " << enemy_hp[i] << endl;
    }

    cout << "GAME_MESSAGE|All enemies destroyed via reference mutation" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show hp = 15 after first round of damage",
        expectedOutput: "enemy[0] hp = 15",
      },
      {
        id: "t2",
        description: "Should show hp = 0 after second round of damage",
        expectedOutput: "enemy[0] hp = 0",
      },
      {
        id: "t3",
        description: "Should show destruction message",
        expectedOutput: "GAME_MESSAGE|All enemies destroyed via reference mutation",
      },
    ],
    hints: [
      "The function signature needs `&`: `void damageEnemy(int& hp, int damage)` \u2014 without the `&`, hp is a copy and the original never changes.",
      "Inside the function: `hp = hp - damage;` then clamp: `if (hp < 0) hp = 0;`",
      "Call it on each array element: `damageEnemy(enemy_hp[i], 15);` \u2014 the `&` binds to the actual array slot.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: System Functions with References",
    type: "game_builder",
    instructions: `# Game Builder: System Functions Operating on Arrays by Reference

References are how systems modify components. The movement system takes position arrays by reference. The damage system takes hp arrays by reference. No copies. Direct mutation. This is the ECS pattern.

## Two System Functions

\`\`\`cpp
void moveSystem(int enemy_y[], int count, int speed)
\`\`\`
Arrays in C++ are already passed by reference (they decay to pointers). This function adds \`speed\` to every \`enemy_y[i]\`. One call moves the entire formation.

\`\`\`cpp
void damageSystem(int enemy_hp[], bool enemy_alive[], int count, int targetIdx, int damage)
\`\`\`
Subtracts damage from \`enemy_hp[targetIdx]\`. If hp drops to 0 or below, clamps to 0 and sets \`enemy_alive[targetIdx] = false\`. Direct mutation. No return value.

## Your Task

1. Write \`moveSystem\` \u2014 loop all enemies, add speed to \`enemy_y[i]\`
2. Write \`damageSystem\` \u2014 damage target, clamp hp, set alive=false if dead
3. Spawn 5 enemies at x positions 60,120,180,240,300 and y=40, hp=30
4. Run moveSystem once with speed=20 (enemies move to y=60)
5. Kill enemy 1 (35 damage) and enemy 3 (35 damage) via damageSystem
6. Render only alive enemies with ENTITY protocol
7. Output HUD and score

Expected output:
\`\`\`
ENTITY|e0|enemy|60|60|22|22|30
ENTITY|e2|enemy|180|60|22|22|30
ENTITY|e4|enemy|300|60|22|22|30
HUD|HP:100|SCORE:200|LIVES:3
GAME_MESSAGE|Systems active: 3 enemies surviving
SCORE|200
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write moveSystem(int enemy_y[], int count, int speed)
// Loop all enemies, add speed to enemy_y[i]

// TODO: Write damageSystem(int enemy_hp[], bool enemy_alive[], int count, int targetIdx, int damage)
// Subtract damage from enemy_hp[targetIdx], clamp to 0
// If hp <= 0, set enemy_alive[targetIdx] = false

int main() {
    const int MAX = 5;

    int enemy_x[MAX] = {60, 120, 180, 240, 300};
    int enemy_y[MAX] = {40, 40, 40, 40, 40};
    int enemy_hp[MAX] = {30, 30, 30, 30, 30};
    bool enemy_alive[MAX] = {true, true, true, true, true};

    int score = 0;

    // TODO: Run moveSystem with speed 20

    // TODO: Kill enemy 1 with 35 damage via damageSystem
    // TODO: Kill enemy 3 with 35 damage via damageSystem
    // Add 100 to score for each kill

    // TODO: Render only alive enemies
    // ENTITY|eN|enemy|x|y|22|22|hp

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Systems active: 3 enemies surviving" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

void moveSystem(int enemy_y[], int count, int speed) {
    for (int i = 0; i < count; i++) {
        enemy_y[i] += speed;
    }
}

void damageSystem(int enemy_hp[], bool enemy_alive[], int count, int targetIdx, int damage) {
    enemy_hp[targetIdx] -= damage;
    if (enemy_hp[targetIdx] < 0) enemy_hp[targetIdx] = 0;
    if (enemy_hp[targetIdx] <= 0) enemy_alive[targetIdx] = false;
}

int main() {
    const int MAX = 5;

    int enemy_x[MAX] = {60, 120, 180, 240, 300};
    int enemy_y[MAX] = {40, 40, 40, 40, 40};
    int enemy_hp[MAX] = {30, 30, 30, 30, 30};
    bool enemy_alive[MAX] = {true, true, true, true, true};

    int score = 0;

    // Movement system: all enemies move down
    moveSystem(enemy_y, MAX, 20);

    // Damage system: kill enemy 1 and enemy 3
    damageSystem(enemy_hp, enemy_alive, MAX, 1, 35);
    score += 100;
    damageSystem(enemy_hp, enemy_alive, MAX, 3, 35);
    score += 100;

    // Render system: only alive enemies
    for (int i = 0; i < MAX; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Systems active: 3 enemies surviving" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Enemy0 should be at y=60 after movement",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|60\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Enemy1 should NOT render (killed by damageSystem)",
        expectedOutput: "^(?!.*ENTITY\\|e1\\|)",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Enemy2 should survive at y=60",
        expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|60\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Enemy3 should NOT render (killed by damageSystem)",
        expectedOutput: "^(?!.*ENTITY\\|e3\\|)",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Should show 3 enemies surviving",
        expectedOutput: "GAME_MESSAGE\\|Systems active: 3 enemies surviving",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Score should be 200 (2 kills)",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
    ],
    hints: [
      "Arrays are passed by pointer in C++. `void moveSystem(int enemy_y[], int count, int speed)` already modifies the original array \u2014 no `&` needed on array parameters.",
      "In damageSystem, subtract damage first, then clamp: `if (enemy_hp[targetIdx] < 0) enemy_hp[targetIdx] = 0;` Then check: `if (enemy_hp[targetIdx] <= 0) enemy_alive[targetIdx] = false;`",
      "In the render loop, use `if (enemy_alive[i])` to skip dead enemies. Only alive entities get ENTITY output.",
    ],
    estimatedMinutes: 7,
  },
};
