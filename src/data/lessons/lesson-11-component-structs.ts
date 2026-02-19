import type { Lesson } from "@/types/lesson";

export const lesson11: Lesson = {
  id: "11-component-structs",
  title: "Component Structs",
  description: "Group related data into structs. Position is (x,y). Velocity is (dx,dy). Health is (current,max). Type safety for free.",
  order: 11,
  xpReward: 125,
  tier: "pro",
  concepts: ["struct", "component grouping", "data organization", "SoA composition"],
  part1: {
    title: "Concept: Component Structs",
    type: "concept",
    instructions: `# Component Structs

Structs group related data. Position is (x,y). Velocity is (dx,dy). Health is (current, max). Group by purpose, not by entity.

## Mental Model

SoA gave you parallel arrays. Structs give those arrays meaning. \`struct Position { int x, y; };\` says this pair travels together. \`Position enemy_pos[MAX]\` is still SoA \u2014 an array of positions, not a position in an array of entities. The layout is identical. The semantics are explicit.

## What Breaks

Without structs, you have \`enemy_x\`, \`enemy_y\`, \`enemy_dx\`, \`enemy_dy\`, \`enemy_hp\`, \`enemy_maxHp\`, \`enemy_alive\`. Seven arrays. Which go together? No compiler help. Pass the wrong array to a function \u2192 silent bug. Swap \`enemy_x\` and \`enemy_dx\` in a movement call \u2192 enemies teleport instead of glide. The compiler sees \`int[]\` both ways. No error.

## The Fix

Group into components:

\\\`\\\`\\\`cpp
struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };
\\\`\\\`\\\`

Three arrays instead of seven. Functions take \`Position&\` \u2014 can't accidentally pass health to a movement function. The type system catches the mistake at compile time.

## Performance Insight

Struct of 2 ints = 8 bytes. Array of 100 structs = 800 bytes contiguous. Same cache behavior as 2 separate arrays. The compiler may even lay out the struct identically to two adjacent array elements. Zero overhead abstraction.

## Memory Insight

Structs are value types. On stack. No indirection. No heap allocation. The compiler inlines member access \u2014 \`pos.x\` compiles to the same load instruction as \`enemy_x[i]\`. The struct boundary is a compile-time concept only.

## Your Task

1. Define \`struct Position { int x, y; };\`
2. Define \`struct Velocity { int dx, dy; };\`
3. Define \`struct Health { int current, max; };\`
4. Create one of each with initial values: Position(180,300), Velocity(0,-40), Health(100,100)
5. Print initial state
6. Apply one tick of movement: \`pos.x += vel.dx; pos.y += vel.dy;\`
7. Print state after tick
8. Apply 25 damage: \`hp.current -= 25;\`
9. Print health after damage

## Beginner Trap

Creating one big \`Entity { x, y, dx, dy, hp, maxHp, alive, type... }\` \u2014 that's AoS (Array of Structs). Tempting. Wrong. Movement needs x,y,dx,dy. Collision needs x,y,w,h. Rendering needs x,y,type. No single function needs ALL fields. Big structs waste cache lines pulling in data you don't use.

## Elite Insight

Unity DOTS: \`struct Translation : IComponentData { float3 Value; }\`. Same pattern. Small, focused structs. Each struct is one component. The archetype system groups entities by which components they have. Your three structs are the seed of that architecture.

## Systems Thinking Connection

L6 gave you SoA \u2014 parallel arrays for cache performance. L11 wraps those arrays in meaning. \`Position pos[MAX]\` reads like a sentence. \`int enemy_x[MAX]\` reads like raw memory. Same performance. Better semantics. This is the bridge from data layout to data architecture.

## Skill Reinforcement

You know arrays (L6), loops (L7), alive flags (L8), references (L9), pools (L10). Structs don't replace any of that. They organize it. \`Position pos[MAX]\` replaces \`int enemy_x[MAX], enemy_y[MAX]\`. Same pool. Same systems. Better types.

## Mastery Check

What's the difference between \`Position pos[100]\` and \`int x[100]; int y[100];\`? Semantics. The struct version is one array of 8-byte elements. The raw version is two arrays of 4-byte elements. For iteration, both are contiguous. The struct version can't accidentally be split across unrelated function calls.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define struct Position with int x, y

// TODO: Define struct Velocity with int dx, dy

// TODO: Define struct Health with int current, max

int main() {
    cout << "=== COMPONENT STRUCTS ===" << endl;

    // TODO: Create Position pos = {180, 300}
    // TODO: Create Velocity vel = {0, -40}
    // TODO: Create Health hp = {100, 100}

    // TODO: Print initial state
    // "Position: (180, 300)"
    // "Velocity: (0, -40)"
    // "Health: 100/100"

    cout << "--- After 1 tick ---" << endl;

    // TODO: Apply velocity to position
    // pos.x += vel.dx;
    // pos.y += vel.dy;

    // TODO: Print position after tick
    // "Position: (180, 260)"
    // "Health: 100/100 (no damage)"

    cout << "--- After damage ---" << endl;

    // TODO: Apply 25 damage to hp.current
    // TODO: Print health after damage
    // "Health: 75/100"

    cout << "GAME_MESSAGE|Components grouped: Position, Velocity, Health" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

int main() {
    cout << "=== COMPONENT STRUCTS ===" << endl;

    Position pos = {180, 300};
    Velocity vel = {0, -40};
    Health hp = {100, 100};

    cout << "Position: (" << pos.x << ", " << pos.y << ")" << endl;
    cout << "Velocity: (" << vel.dx << ", " << vel.dy << ")" << endl;
    cout << "Health: " << hp.current << "/" << hp.max << endl;

    cout << "--- After 1 tick ---" << endl;

    pos.x += vel.dx;
    pos.y += vel.dy;

    cout << "Position: (" << pos.x << ", " << pos.y << ")" << endl;
    cout << "Health: " << hp.current << "/" << hp.max << " (no damage)" << endl;

    cout << "--- After damage ---" << endl;

    hp.current -= 25;

    cout << "Health: " << hp.current << "/" << hp.max << endl;

    cout << "GAME_MESSAGE|Components grouped: Position, Velocity, Health" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show initial position (180, 300)",
        expectedOutput: "Position: (180, 300)",
      },
      {
        id: "t2",
        description: "Should show velocity applied: position (180, 260)",
        expectedOutput: "Position: (180, 260)",
      },
      {
        id: "t3",
        description: "Should show health after damage: 75/100",
        expectedOutput: "Health: 75/100",
      },
      {
        id: "t4",
        description: "Should show components grouped message",
        expectedOutput: "GAME_MESSAGE|Components grouped: Position, Velocity, Health",
      },
    ],
    hints: [
      "Struct syntax: `struct Position { int x, y; };` \u2014 don't forget the semicolon after the closing brace. This is a definition, not a function.",
      "Initialize with braces: `Position pos = {180, 300};` \u2014 first value goes to x, second to y. Order matches declaration order.",
      "Member access uses dot: `pos.x += vel.dx;` \u2014 the dot reads the named field. Same as array access but with a name instead of an index.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Component Struct Arrays",
    type: "game_builder",
    instructions: `# Game Builder: Enemy Formation with Component Structs

Replace raw parallel arrays with struct arrays. Same pool pattern from L10. Same systems. Better data organization. Five enemies spawn, move, take damage, render.

## Mental Model

\`Position pos[5]\` replaces \`int enemy_x[5], enemy_y[5]\`. \`Velocity vel[5]\` replaces \`int enemy_dx[5], enemy_dy[5]\`. \`Health hp[5]\` replaces \`int enemy_hp[5], enemy_maxHp[5]\`. Seven arrays become three. Each struct carries exactly the data one system needs.

## What Breaks

Without structs, spawning an enemy means writing to 4+ separate arrays. Miss one and you get stale data from the previous occupant. With structs: \`pos[idx] = {x, y};\` writes both fields atomically. Can't forget one.

## The Fix

Define Position, Velocity, Health. Use struct arrays + bool alive[]. Spawn, move, damage, render \u2014 same flow as L10 but with typed components.

## Performance Insight

\`Position pos[5]\` = 40 bytes contiguous. The movement system iterates pos[] and vel[] \u2014 exactly the data it needs, nothing more. No wasted cache lines pulling in hp data during movement.

## Memory Insight

5 positions (40B) + 5 velocities (40B) + 5 health (40B) + 5 bools (5B) = 125 bytes total. All on stack. All in one cache line or two.

## Your Task

1. Define Position, Velocity, Health structs
2. Create arrays: \`Position pos[5]\`, \`Velocity vel[5]\`, \`Health hp[5]\`, \`bool alive[5]\`
3. Spawn 5 enemies: x=60,120,180,240,300 y=40 dx=0 dy=2 hp=30/30
4. Run 2 movement ticks: \`pos[i].y += vel[i].dy\` for alive enemies
5. Damage enemies 1 and 3: subtract 30 from hp.current, set alive=false if dead
6. Render surviving enemies with ENTITY protocol

## Beginner Trap

Writing \`pos[i].x = 60 + i * 60; pos[i].y = 40;\` is correct. Writing \`pos[i] = {60 + i * 60, 40};\` is also correct and cleaner. Use aggregate initialization when setting all fields at once.

## Elite Insight

This is how EnTT (C++ ECS library) stores components internally. Dense arrays of small structs. One array per component type. Entity ID maps to array index. You just built that by hand.

## Systems Thinking Connection

The movement system only touches Position and Velocity. The damage system only touches Health and alive. The render system reads Position and Health. No system reads all data. This is separation of concerns at the data level.

## Skill Reinforcement

L10 pool lifecycle + L11 struct arrays = typed entity pool. Next lesson extracts these structs into a header file for multi-file builds.

## Mastery Check

Why three small structs instead of one big Entity struct? Because systems access different fields. Movement reads pos+vel. Damage reads hp. One big struct wastes cache loading fields the current system ignores.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define struct Position { int x, y; };
// TODO: Define struct Velocity { int dx, dy; };
// TODO: Define struct Health { int current, max; };

int main() {
    const int MAX = 5;

    // TODO: Create component arrays
    // Position pos[MAX];
    // Velocity vel[MAX];
    // Health hp[MAX];
    // bool alive[MAX];

    int score = 0;

    // TODO: Spawn 5 enemies
    // x = 60 + i*60, y = 40, dx = 0, dy = 2, hp = 30/30, alive = true

    // TODO: Movement - 2 ticks
    // For each tick: if alive, pos[i].y += vel[i].dy

    // TODO: Damage enemies 1 and 3
    // hp[idx].current -= 30; if hp <= 0 set alive = false
    // Add 100 score per kill

    // TODO: Render alive enemies
    // ENTITY|eN|enemy|pos.x|pos.y|22|22|hp.current

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Struct arrays active: " << MAX << " slots, typed components" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct Position { int x, y; };
struct Velocity { int dx, dy; };
struct Health { int current, max; };

int main() {
    const int MAX = 5;

    Position pos[MAX];
    Velocity vel[MAX];
    Health hp[MAX];
    bool alive[MAX];

    int score = 0;

    // Spawn 5 enemies
    for (int i = 0; i < MAX; i++) {
        pos[i] = {60 + i * 60, 40};
        vel[i] = {0, 2};
        hp[i] = {30, 30};
        alive[i] = true;
    }

    // Movement - 2 ticks
    for (int tick = 0; tick < 2; tick++) {
        for (int i = 0; i < MAX; i++) {
            if (alive[i]) {
                pos[i].x += vel[i].dx;
                pos[i].y += vel[i].dy;
            }
        }
    }

    // Damage enemies 1 and 3
    hp[1].current -= 30;
    if (hp[1].current <= 0) { hp[1].current = 0; alive[1] = false; }
    score += 100;

    hp[3].current -= 30;
    if (hp[3].current <= 0) { hp[3].current = 0; alive[3] = false; }
    score += 100;

    // Render alive enemies
    for (int i = 0; i < MAX; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << pos[i].x << "|" << pos[i].y
                 << "|22|22|" << hp[i].current << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Struct arrays active: " << MAX << " slots, typed components" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Enemy0 at (60,44) after 2 ticks of dy=2",
        expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|44\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Enemy1 should NOT render (killed)",
        expectedOutput: "^(?!.*ENTITY\\|e1\\|)",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Enemy2 at (180,44) after 2 ticks",
        expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|44\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Enemy3 should NOT render (killed)",
        expectedOutput: "^(?!.*ENTITY\\|e3\\|)",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Enemy4 at (300,44) after 2 ticks",
        expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|44\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g6",
        description: "HUD shows score 200",
        expectedOutput: "HUD\\|HP:100\\|SCORE:200\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "g7",
        description: "Struct arrays active message",
        expectedOutput: "GAME_MESSAGE\\|Struct arrays active: 5 slots, typed components",
        isPattern: true,
      },
    ],
    hints: [
      "Define structs before main: `struct Position { int x, y; };` \u2014 semicolon after the brace is required.",
      "Spawn with aggregate init: `pos[i] = {60 + i * 60, 40};` assigns both fields. `vel[i] = {0, 2};` sets dx=0, dy=2.",
      "Two movement ticks: wrap the movement loop in `for (int tick = 0; tick < 2; tick++)`. Each tick adds vel.dy to pos.y for alive enemies.",
    ],
    estimatedMinutes: 8,
  },
};
