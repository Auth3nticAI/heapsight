import type { Lesson } from "@/types/lesson";

export const lesson13: Lesson = {
  id: "13-inheritance-trap",
  title: "Inheritance Trap",
  description: "Inheritance creates rigid hierarchies. Composition creates flexible systems. A FastEnemy isn't a subclass \u2014 it's an entity with different Velocity data.",
  order: 13,
  xpReward: 125,
  tier: "pro",
  concepts: ["composition vs inheritance", "data-oriented design", "why not OOP", "ECS motivation"],
  part1: {
    title: "Concept: Inheritance Trap",
    type: "concept",
    instructions: `# Inheritance Trap

Inheritance creates rigid hierarchies. Composition creates flexible systems. A FastEnemy isn't a subclass \u2014 it's an entity with different Velocity data.

## Mental Model

Inheritance says: FastEnemy IS-A Enemy. But what about a FastShieldedEnemy? Multiple inheritance? Diamond problem. Composition says: entity 42 HAS Position, HAS Velocity(fast), HAS Health, HAS Shield. Add or remove components freely. No hierarchy. No diamond. No recompilation cascade.

## What Breaks

Inheritance locks behavior into a class hierarchy. FlyingEnemy can't also be a ShieldedEnemy without multiple inheritance. Adding new enemy types requires modifying the hierarchy. 10 enemy types = 10 classes. 100 combinations of traits = impossible without multiple inheritance, which brings the diamond problem, vtable ambiguity, and maintenance nightmares.

The real problem: you can't add a Shield to a FastEnemy at runtime. The class hierarchy is baked at compile time. An enemy that picks up a shield power-up? Impossible without inheritance gymnastics. With composition: set \`hasShield[i] = true\`. Done.

## The Fix

Show the bad OOP approach first:

\\\`\\\`\\\`cpp
class Enemy { int hp = 30; int speed = 2; virtual void update(); };
class FastEnemy : public Enemy { int speed = 5; };
class ShieldedEnemy : public Enemy { int shield = 20; };
// FastShieldedEnemy : public FastEnemy, public ShieldedEnemy ???
// Diamond problem. Two copies of Enemy. Ambiguous hp.
\\\`\\\`\\\`

Then show composition:

\\\`\\\`\\\`cpp
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };

// Entity 0: Position + Velocity(slow) + Health = normal enemy
// Entity 1: Position + Velocity(fast) + Health = fast enemy
// Entity 2: Position + Velocity(slow) + Health + Shield = shielded enemy
// Entity 3: Position + Velocity(fast) + Health + Shield = fast + shielded
\\\`\\\`\\\`

Four enemy types. Zero classes. Zero inheritance. Just different data in the same arrays. Add a new component (Poison? Invisibility?) without touching existing code.

## Performance Insight

Virtual functions: vtable lookup per call. Every \`enemy->update()\` loads a pointer from the vtable, then jumps to the function. 1000 enemies * 60fps = 60,000 indirect jumps per second. The branch predictor hates this. Cache misses on the vtable. Composition: direct array iteration. \`for (i) { pos[i].y += vel[i].dy; }\` \u2014 zero indirection. Linear access. Branch predictor loves sequential loops.

## Memory Insight

Inheritance: every object with a virtual function gets a vtable pointer (8 bytes on 64-bit). 1000 enemies = 8KB of vtable pointers that exist only to enable polymorphism you don't need. Composition: zero overhead. The data IS the behavior. Different velocity values create different movement speeds. No vtable. No pointer. No indirection.

## Your Task

1. Print the inheritance approach: show Enemy, FastEnemy, ShieldedEnemy classes with their data
2. Print the PROBLEM: FastShieldedEnemy needs both. Multiple inheritance fails.
3. Print the composition approach: 4 entities with different component combinations
4. Entity 0: Position(60,40) + Velocity(0,2) + Health(30,30) = normal
5. Entity 1: Position(120,40) + Velocity(0,5) + Health(30,30) = fast
6. Entity 2: Position(180,40) + Velocity(0,2) + Health(30,30) + Shield(20) = shielded
7. Entity 3: Position(240,40) + Velocity(0,5) + Health(30,30) + Shield(20) = fast+shielded
8. Print SOLUTION message showing composition wins

## Beginner Trap

Reaching for \`class\` and \`virtual\` because that's what tutorials teach. OOP works for UI widgets, menu systems, file parsers. It fails for game entities. When you have 1000 objects that need different combinations of behavior, inheritance creates an explosion of subclasses. Composition scales linearly: N components = N arrays. M combinations = just different data values.

## Elite Insight

Unity abandoned MonoBehaviour (inheritance-based) for DOTS (composition-based). Unreal moved from deep Actor hierarchies to ActorComponents. Every modern engine made this transition. This lesson explains why. The performance difference isn't 10%. It's 10x. Cache coherence, branch prediction, and data locality all favor flat arrays over polymorphic objects.

## Systems Thinking Connection

L11 introduced component structs. L12 extracted them to headers. L13 explains WHY we use components instead of classes. This is the philosophical core of data-oriented design. The rest of the curriculum builds on this principle: data first, behavior second.

## Skill Reinforcement

You already have Position, Velocity, Health from L11. Shield is a new component \u2014 same pattern, one more struct. The composition approach uses the same arrays, loops, and alive flags you've been writing since L6. No new syntax. New understanding.

## Mastery Check

Why can't you make a FastShieldedEnemy with single inheritance? FastEnemy extends Enemy (overrides speed). ShieldedEnemy extends Enemy (adds shield). FastShieldedEnemy needs both \u2192 multiple inheritance \u2192 diamond problem \u2192 two copies of Enemy's hp field \u2192 ambiguity. With composition: one entity, one Position, one fast Velocity, one Health, one Shield. No ambiguity. No hierarchy.`,
    starterCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };

int main() {
    cout << "=== INHERITANCE APPROACH ===" << endl;
    // TODO: Print the OOP classes
    // "class Enemy { hp=30, speed=2 }"
    // "class FastEnemy : Enemy { speed=5 }"
    // "class ShieldedEnemy : Enemy { shield=20 }"
    // "PROBLEM: FastShieldedEnemy needs both. Multiple inheritance? No."

    cout << endl;
    cout << "=== COMPOSITION APPROACH ===" << endl;

    const int MAX = 4;

    // TODO: Create component arrays for 4 entities
    // Position pos[MAX], Velocity vel[MAX], Health hp[MAX]
    // bool hasShield[MAX] for optional Shield component
    // Shield shield[MAX]

    // TODO: Entity 0: normal   - pos(60,40) vel(0,2) hp(30,30) no shield
    // TODO: Entity 1: fast     - pos(120,40) vel(0,5) hp(30,30) no shield
    // TODO: Entity 2: shielded - pos(180,40) vel(0,2) hp(30,30) shield(20)
    // TODO: Entity 3: fast+shielded - pos(240,40) vel(0,5) hp(30,30) shield(20)

    // TODO: Print each entity's components
    // "Entity N: Position(x,y) + Velocity(dx,dy) + Health(cur,max)"
    // If has shield: " + Shield(val)"

    // "SOLUTION: Mix any components. No hierarchy needed."
    cout << "GAME_MESSAGE|Composition beats inheritance. Data over hierarchy." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };

int main() {
    cout << "=== INHERITANCE APPROACH ===" << endl;
    cout << "class Enemy { hp=30, speed=2 }" << endl;
    cout << "class FastEnemy : Enemy { speed=5 }" << endl;
    cout << "class ShieldedEnemy : Enemy { shield=20 }" << endl;
    cout << "PROBLEM: FastShieldedEnemy needs both. Multiple inheritance? No." << endl;

    cout << endl;
    cout << "=== COMPOSITION APPROACH ===" << endl;

    const int MAX = 4;

    Position pos[MAX] = {{60, 40}, {120, 40}, {180, 40}, {240, 40}};
    Velocity vel[MAX] = {{0, 2}, {0, 5}, {0, 2}, {0, 5}};
    Health hp[MAX] = {{30, 30}, {30, 30}, {30, 30}, {30, 30}};
    bool hasShield[MAX] = {false, false, true, true};
    Shield shield[MAX] = {{0}, {0}, {20}, {20}};

    for (int i = 0; i < MAX; i++) {
        cout << "Entity " << i << ": Position(" << pos[i].x << "," << pos[i].y
             << ") + Velocity(" << vel[i].dx << "," << vel[i].dy
             << ") + Health(" << hp[i].current << "," << hp[i].max << ")";
        if (hasShield[i]) {
            cout << " + Shield(" << shield[i].current << ")";
        }
        cout << endl;
    }

    cout << "SOLUTION: Mix any components. No hierarchy needed." << endl;
    cout << "GAME_MESSAGE|Composition beats inheritance. Data over hierarchy." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show the inheritance problem",
        expectedOutput: "PROBLEM: FastShieldedEnemy needs both. Multiple inheritance? No.",
      },
      {
        id: "t2",
        description: "Entity 0: normal enemy with slow velocity",
        expectedOutput: "Entity 0: Position(60,40) + Velocity(0,2) + Health(30,30)",
      },
      {
        id: "t3",
        description: "Entity 1: fast enemy with velocity 5",
        expectedOutput: "Entity 1: Position(120,40) + Velocity(0,5) + Health(30,30)",
      },
      {
        id: "t4",
        description: "Entity 2: shielded enemy with Shield(20)",
        expectedOutput: "Entity 2: Position(180,40) + Velocity(0,2) + Health(30,30) + Shield(20)",
      },
      {
        id: "t5",
        description: "Entity 3: fast+shielded with both traits",
        expectedOutput: "Entity 3: Position(240,40) + Velocity(0,5) + Health(30,30) + Shield(20)",
      },
      {
        id: "t6",
        description: "Should show composition wins message",
        expectedOutput: "GAME_MESSAGE|Composition beats inheritance. Data over hierarchy.",
      },
    ],
    hints: [
      "The inheritance section is just print statements showing the class hierarchy and the problem. No actual classes needed \u2014 we're showing WHY they fail.",
      "Use aggregate initialization for arrays: `Position pos[MAX] = {{60, 40}, {120, 40}, {180, 40}, {240, 40}};`",
      "Use `bool hasShield[MAX]` as an optional component flag. In the print loop: `if (hasShield[i]) cout << \" + Shield(\" << shield[i].current << \")\";`",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Composition-Based Enemy Types",
    type: "game_builder",
    instructions: `# Game Builder: Four Enemy Types, Zero Subclasses

Create 4 enemy types using composition alone. Normal, fast, shielded, fast+shielded. Move them all. Apply damage. Show that different data creates different behavior without a single class or virtual function.

## Mental Model

An enemy type is not a class. It's a combination of component values. A fast enemy has Velocity(0,5) instead of Velocity(0,2). A shielded enemy has a Shield component. A fast shielded enemy has both. The movement system doesn't know about types. It iterates Position[] and Velocity[]. Fast enemies move faster because their velocity data is larger. That's it. Data drives behavior.

## What Breaks

With inheritance, adding a ShieldedFastBossEnemy requires a new class, a new spot in the hierarchy, and careful virtual function overrides. With composition: set the velocity high, add a shield, bump up the health. One line of data changes per trait. No new code.

## The Fix

4 entities, all with Position + Velocity + Health + alive. Entities 2 and 3 also have Shield. Move all for 3 ticks. Different velocities create different final positions. Damage all by 20 \u2014 shielded enemies absorb with shield first. Render survivors.

## Performance Insight

All 4 entities in the same arrays. The movement loop touches Position[] and Velocity[] sequentially. No type checks. No virtual dispatch. The shielded damage path is just an if-check on a bool flag. One branch, not a vtable lookup chain.

## Memory Insight

4 entities * (Position 8B + Velocity 8B + Health 8B + Shield 4B + bool 1B) = 116 bytes. All on stack. Compare to 4 polymorphic objects: 4 * 8B vtable pointers = 32B of overhead before any data. Plus heap allocation. Plus pointer chasing.

## Your Task

1. Create 4 enemies with component arrays:
   - Entity 0: pos(60,40) vel(0,2) hp(30,30) no shield \u2014 NORMAL
   - Entity 1: pos(120,40) vel(0,5) hp(30,30) no shield \u2014 FAST
   - Entity 2: pos(180,40) vel(0,2) hp(30,30) shield(20) \u2014 SHIELDED
   - Entity 3: pos(240,40) vel(0,5) hp(30,30) shield(20) \u2014 FAST+SHIELDED
2. Move all for 3 ticks
3. Apply 20 damage to all: if shielded, reduce shield first; if shield depleted, overflow to hp
4. Render all with ENTITY protocol
5. Output HUD, message, score

## Beginner Trap

Applying damage directly to hp when shield exists. Check shield first: \`if (hasShield[i] && shield[i].current > 0) { shield[i].current -= damage; if (shield[i].current < 0) { hp[i].current += shield[i].current; shield[i].current = 0; } } else { hp[i].current -= damage; }\`. Shield absorbs first. Overflow goes to hp.

## Elite Insight

This shield-absorption pattern is how Overwatch handles damage. Shield health is a separate component from regular health. The damage system checks shield first, then health. No inheritance needed. Just data flow.

## Systems Thinking Connection

L11-L12 built the component infrastructure. L13 proves why it matters. Four enemy types from zero classes. This is the payoff of data-oriented design. Every future lesson builds on this principle.

## Skill Reinforcement

Movement system from L9. Struct arrays from L11. Alive flags from L8. Damage logic from L5. New: Shield component as optional flag. All prior skills combine here.

## Mastery Check

How many classes would you need for Normal, Fast, Shielded, Fast+Shielded, Poisoned, Fast+Poisoned, Shielded+Poisoned, Fast+Shielded+Poisoned? Eight classes with inheritance. With composition? Still 4 component types (Velocity, Health, Shield, Poison). N components = 2^N combinations for free.`,
    starterCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };

int main() {
    const int MAX = 4;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];
    bool hasShield[MAX];
    Shield shield[MAX];

    int score = 0;

    // TODO: Spawn 4 enemies
    // 0: normal   pos(60,40)  vel(0,2) hp(30,30) no shield
    // 1: fast     pos(120,40) vel(0,5) hp(30,30) no shield
    // 2: shielded pos(180,40) vel(0,2) hp(30,30) shield(20)
    // 3: fast+sh  pos(240,40) vel(0,5) hp(30,30) shield(20)

    // TODO: Movement - 3 ticks
    // Each tick: if alive, pos[i].y += vel[i].dy

    // TODO: Damage all alive enemies by 20
    // If hasShield and shield > 0: shield absorbs first, overflow to hp
    // Else: hp -= damage directly

    // TODO: Render alive enemies
    // ENTITY|eN|enemy|pos.x|pos.y|22|22|hp.current

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|4 enemy types from 0 classes" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
struct Shield { int current; };

int main() {
    const int MAX = 4;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];
    bool hasShield[MAX];
    Shield shield[MAX];

    int score = 0;

    // Spawn 4 enemy types via composition
    pos[0] = {60, 40};  vel[0] = {0, 2}; hp[0] = {30, 30}; alive[0] = true; hasShield[0] = false; shield[0] = {0};
    pos[1] = {120, 40}; vel[1] = {0, 5}; hp[1] = {30, 30}; alive[1] = true; hasShield[1] = false; shield[1] = {0};
    pos[2] = {180, 40}; vel[2] = {0, 2}; hp[2] = {30, 30}; alive[2] = true; hasShield[2] = true;  shield[2] = {20};
    pos[3] = {240, 40}; vel[3] = {0, 5}; hp[3] = {30, 30}; alive[3] = true; hasShield[3] = true;  shield[3] = {20};

    // Movement - 3 ticks
    for (int tick = 0; tick < 3; tick++) {
        for (int i = 0; i < MAX; i++) {
            if (alive[i]) {
                pos[i].x += vel[i].dx;
                pos[i].y += vel[i].dy;
            }
        }
    }

    // Damage all alive enemies by 20
    int damage = 20;
    for (int i = 0; i < MAX; i++) {
        if (!alive[i]) continue;
        if (hasShield[i] && shield[i].current > 0) {
            shield[i].current -= damage;
            if (shield[i].current < 0) {
                hp[i].current += shield[i].current;
                shield[i].current = 0;
            }
        } else {
            hp[i].current -= damage;
        }
        if (hp[i].current <= 0) {
            hp[i].current = 0;
            alive[i] = false;
            score += 100;
        }
    }

    // Render alive enemies
    for (int i = 0; i < MAX; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << pos[i].x << "|" << pos[i].y
                 << "|22|22|" << hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|4 enemy types from 0 classes" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Entity0 (normal): at y=46 (40+2*3), hp=10 (30-20)",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|46\\|22\\|22\\|10",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Entity1 (fast): at y=55 (40+5*3), hp=10 (30-20)",
        expectedOutput: "ENTITY\\|e1\\|enemy\\|120\\|55\\|22\\|22\\|10",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Entity2 (shielded): at y=46, hp=30 (shield absorbed 20)",
        expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|46\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Entity3 (fast+shielded): at y=55, hp=30 (shield absorbed 20)",
        expectedOutput: "ENTITY\\|e3\\|enemy\\|240\\|55\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Should show 4 types from 0 classes message",
        expectedOutput: "GAME_MESSAGE\\|4 enemy types from 0 classes",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Score should be 0 (no kills, all survived)",
        expectedOutput: "SCORE\\|0",
        isPattern: true,
      },
    ],
    hints: [
      "Spawn each entity individually or use index-based assignment: `pos[0] = {60, 40}; vel[0] = {0, 2}; hp[0] = {30, 30}; hasShield[0] = false;`",
      "Shield absorption: `shield[i].current -= damage;` then if shield went negative, overflow to hp: `hp[i].current += shield[i].current; shield[i].current = 0;` (adding a negative number = subtracting).",
      "Normal enemies (no shield): 30 - 20 = 10 hp. Shielded enemies: shield 20 - 20 = 0, hp stays 30. All 4 survive. Score = 0.",
    ],
    estimatedMinutes: 8,
  },
};
