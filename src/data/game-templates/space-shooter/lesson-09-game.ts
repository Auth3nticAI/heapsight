import type { GameLessonVariant } from "@/types/game";

export const lesson09SpaceShooter: GameLessonVariant = {
  lessonId: "09-component-mutation",
  instructions: `# Damage Function Copies HP — Array Never Changes

Your damage function takes hp by value. It subtracts. It clamps. It returns. The array slot is identical to before the call. The copy was destroyed on function exit. Nothing dies.

## What Breaks Without This

Every call to \`applyDamage(int hp, int damage)\` copies the int from the array into a local variable. The subtraction modifies the local. The local is destroyed when the function returns. The health array is untouched. The render loop draws every enemy at full hp. Your damage system is a no-op.

## The Fix

References give direct access to data. No copying. The function modifies the original. This is how systems operate on component arrays.

A system function takes a reference to the data array and modifies it directly. No copies. No return values for bulk operations. The movement system takes \`enemy_y[]\` and adds speed to every element. The damage system takes \`enemy_hp[]\` and subtracts damage. One function call mutates the entire array in place. This is how ECS systems work.

You need two system functions:

**moveSystem** \u2014 takes \`enemy_y[]\`, count, and speed. Loops all enemies. Adds speed to each \`enemy_y[i]\`. Arrays decay to pointers in C++, so they are already passed by reference. One call advances the entire formation.

**damageSystem** \u2014 takes \`enemy_hp[]\`, \`enemy_alive[]\`, count, targetIdx, and damage. Subtracts damage from \`enemy_hp[targetIdx]\`. Clamps to 0. If hp hits 0, sets \`enemy_alive[targetIdx] = false\`. Direct mutation. No return value needed.

## Your Task

1. Write \`moveSystem(int enemy_y[], int count, int speed)\` \u2014 add speed to every enemy_y
2. Write \`damageSystem(int enemy_hp[], bool enemy_alive[], int count, int targetIdx, int damage)\` \u2014 damage, clamp, kill
3. 5 enemies spawn at x=60,120,180,240,300 y=40 hp=30
4. Run moveSystem with speed=20 (all enemies move to y=60)
5. Kill enemy 1 and enemy 3 with 35 damage each via damageSystem
6. Add 100 score per kill
7. Render only alive enemies using ENTITY protocol
8. Output HUD, message, and score

## Beginner Trap

**Common Mistake:** Writing \`void damageSystem(int enemy_hp, ...)\` instead of \`void damageSystem(int enemy_hp[], ...)\`.
A single int parameter copies one value. An array parameter gives you the actual array. For individual \`int\` params, you need \`&\`. For arrays, the \`[]\` syntax already passes the pointer.

## Elite Insight

In production ECS, systems receive pointers to entire component arrays and iterate them in tight loops. The movement system touches only position data. The damage system touches only hp and alive data. No entity knows about both. This separation is what makes ECS cache-friendly and parallelizable.

## Cross-Path Echo

The RPG path uses references to mutate inventory quantities in place. The Platformer path passes velocity arrays to a gravity system. Same direct-mutation pattern everywhere.`,
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
    { id: "g1", description: "Enemy0 should be at y=60 after moveSystem", expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|60\\|22\\|22\\|30", isPattern: true },
    { id: "g2", description: "Enemy1 should NOT render (killed by damageSystem)", expectedOutput: "^(?!.*ENTITY\\|e1\\|)", isPattern: true },
    { id: "g3", description: "Enemy2 should survive at y=60", expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|60\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Enemy3 should NOT render (killed by damageSystem)", expectedOutput: "^(?!.*ENTITY\\|e3\\|)", isPattern: true },
    { id: "g5", description: "Enemy4 should survive at y=60", expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|60\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "Should show 3 enemies surviving", expectedOutput: "GAME_MESSAGE\\|Systems active: 3 enemies surviving", isPattern: true },
    { id: "g7", description: "Score should be 200", expectedOutput: "SCORE\\|200", isPattern: true },
  ],
  hints: [
    "Arrays are passed by pointer in C++. `void moveSystem(int enemy_y[], int count, int speed)` already modifies the original array \u2014 no `&` needed.",
    "In damageSystem: `enemy_hp[targetIdx] -= damage;` then clamp, then check if dead: `if (enemy_hp[targetIdx] <= 0) enemy_alive[targetIdx] = false;`",
    "Render loop: `if (enemy_alive[i])` gates the ENTITY output. Dead enemies are skipped entirely.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// --- System functions (L9: reference-based mutation) ---
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
    // --- SoA component arrays (L6) ---
    const int MAX = 5;
    int enemy_x[MAX] = {60, 120, 180, 240, 300};
    int enemy_y[MAX] = {40, 40, 40, 40, 40};
    int enemy_hp[MAX] = {30, 30, 30, 30, 30};
    bool enemy_alive[MAX] = {true, true, true, true, true};

    int score = 0;

    // --- Movement system (L7: loops + L9: references) ---
    moveSystem(enemy_y, MAX, 20);

    // --- Damage system (L9: in-place mutation) ---
    damageSystem(enemy_hp, enemy_alive, MAX, 1, 35);
    score += 100;
    damageSystem(enemy_hp, enemy_alive, MAX, 3, 35);
    score += 100;

    // --- Render system (L8: conditional filtering) ---
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
};
