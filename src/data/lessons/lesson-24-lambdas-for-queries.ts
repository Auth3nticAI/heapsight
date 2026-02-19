import type { Lesson } from "@/types/lesson";

export const lesson24: Lesson = {
  id: "24-lambdas-for-queries",
  title: "Lambdas for Queries",
  description: "Inline functions for data filtering. One loop, any predicate. Query your entity pool like a database.",
  order: 24,
  xpReward: 125,
  tier: "pro",
  concepts: ["lambda functions", "inline closures", "data filtering", "query patterns"],
  part1: {
    title: "Concept: Lambda Queries",
    type: "concept",
    instructions: `# Lambdas for Queries

## Mental Model

Lambdas are inline functions. Define a filter once, apply everywhere. Query your entity pool like a database: "give me all enemies with hp < 10." The lambda is the predicate. The loop is the executor. Separate what you are looking for from how you iterate.

## What Breaks Without This

Without lambdas, you write a new for loop every time you want a different filter. Count alive enemies: one loop. Count low-hp enemies: another loop. Count enemies in bucket 2: yet another. Same iteration pattern, different condition. Copy-paste code. Change one loop, forget to update the others. Bugs multiply.

Lambdas unify the pattern: one generic function, many predicates.

## The Fix

Write a generic \\\`countWhere\\\` function that takes arrays and a lambda predicate. Use different lambdas for different queries:

\\\`\\\`\\\`cpp
int countWhere(bool alive[], int hp[], int y[], int count,
               auto predicate) {
    int result = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && predicate(i)) result++;
    }
    return result;
}
\\\`\\\`\\\`

Now query with any condition:
\\\`\\\`\\\`cpp
// Count alive
auto isAlive = [](int i) { return true; };

// Count low HP
auto isLowHP = [&](int i) { return hp[i] < 15; };

// Count in danger zone
auto inDanger = [&](int i) { return y[i] > 250; };
\\\`\\\`\\\`

One loop function. Three different queries. Zero code duplication.

## Performance Insight

Lambdas inline. The compiler generates the same machine code as a hand-written loop with the condition baked in. Zero overhead abstraction. The \\\`auto\\\` parameter triggers template instantiation — each lambda gets its own optimized loop. No virtual call. No function pointer indirection. Just straight array iteration.

## Memory Insight

A lambda with no captures is a stateless function object. Zero size. With captures by reference (\\\`[&]\\\`): stores a pointer per captured variable — 8 bytes each on 64-bit. For short-lived query lambdas that exist only during the function call, this is stack-allocated and free.

## Beginner Trap

**Capturing by reference in a lambda that outlives the scope.** If you store a lambda that captures \\\`[&]\\\` and the referenced variables go out of scope, the lambda holds dangling references. For short-lived queries inside a function: \\\`[&]\\\` is fine. For stored callbacks or lambdas returned from functions: capture by value \\\`[=]\\\`.

## Elite Insight

Unity DOTS: \\\`Entities.ForEach((ref Translation t, ref Health h) => { ... })\\\`. Unreal: \\\`ForEachComponent<UHealthComponent>([](UHealthComponent* h) { ... })\\\`. Your \\\`countWhere\\\` with lambda predicates is the same pattern. Every ECS query system is a loop + predicate.

## Systems Thinking Connection

L23 added read-only diagnostics. Lambdas make diagnostics composable. Instead of writing separate functions to count alive, count damaged, count in-zone — write one query engine and pass different predicates. The diagnostics system becomes data-driven.

## Skill Reinforcement

L7: loops. L8: conditionals and alive flags. L10: pool iteration. L23: read-only observation. L24: parameterized observation with lambdas. Each lesson adds a layer of abstraction without adding runtime cost.

## Mastery Check

Why do lambdas have zero overhead compared to hand-written loops? The compiler inlines the lambda body into the loop. No function call overhead. No pointer indirection. The generated assembly is identical to writing the condition directly in the loop. Template instantiation per lambda type guarantees this.

## Your Task

Build a query system for an 8-entity pool. Run four queries with different lambda predicates:

1. Count all alive enemies (6 of 8 are alive)
2. Count low HP enemies (hp < 15) — find and list them
3. Count enemies in danger zone (y > 250) — find and list them
4. Count critical enemies (alive AND hp < 15 AND y > 200) — the intersection

Expected output:
\\\`\\\`\\\`
=== LAMBDA QUERIES ===
Pool: 8 entities (6 alive, 2 dead)

Query: alive enemies
  Result: 6 found

Query: low HP (hp < 15)
  e1 hp=10
  e4 hp=5
  Result: 2 found

Query: in danger zone (y > 250)
  e3 at y=260
  e5 at y=280
  Result: 2 found

Query: critical (alive AND hp < 15 AND y > 200)
  e4 hp=5 at y=220
  Result: 1 found

GAME_MESSAGE|Lambdas: one loop, any predicate. Query your data.
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 8;

bool alive[POOL_SIZE] = {true, true, true, true, true, true, false, false};
int hp[POOL_SIZE]     = {30,   10,   25,   20,   5,    35,   0,     0};
int ey[POOL_SIZE]     = {100,  150,  260,  180,  220,  280,  0,     0};

// TODO: Write countWhere(bool alive[], int count, auto predicate)
// Loop through pool. For each alive entity, if predicate(i) is true, count it.
// Return the count.

int main() {
    cout << "=== LAMBDA QUERIES ===" << endl;

    // Count alive vs dead
    int aliveCount = 0;
    int deadCount = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i]) aliveCount++;
        else deadCount++;
    }
    cout << "Pool: " << POOL_SIZE << " entities (" << aliveCount
         << " alive, " << deadCount << " dead)" << endl;

    // TODO: Query 1 — count all alive enemies using countWhere + lambda
    // Lambda: [](int i) { return true; }  (all alive pass)
    cout << endl << "Query: alive enemies" << endl;

    // TODO: Query 2 — low HP (hp < 15)
    // Use countWhere with lambda that checks hp[i] < 15
    // Also loop and print matching: "  eN hp=X"
    cout << endl << "Query: low HP (hp < 15)" << endl;

    // TODO: Query 3 — danger zone (y > 250)
    // Print matching: "  eN at y=Y"
    cout << endl << "Query: in danger zone (y > 250)" << endl;

    // TODO: Query 4 — critical (alive AND hp < 15 AND y > 200)
    // Print matching: "  eN hp=X at y=Y"
    cout << endl << "Query: critical (alive AND hp < 15 AND y > 200)" << endl;

    cout << endl << "GAME_MESSAGE|Lambdas: one loop, any predicate. Query your data." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 8;

bool alive[POOL_SIZE] = {true, true, true, true, true, true, false, false};
int hp[POOL_SIZE]     = {30,   10,   25,   20,   5,    35,   0,     0};
int ey[POOL_SIZE]     = {100,  150,  260,  180,  220,  280,  0,     0};

int countWhere(bool alive[], int count, auto predicate) {
    int result = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && predicate(i)) result++;
    }
    return result;
}

int main() {
    cout << "=== LAMBDA QUERIES ===" << endl;

    int aliveCount = 0;
    int deadCount = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i]) aliveCount++;
        else deadCount++;
    }
    cout << "Pool: " << POOL_SIZE << " entities (" << aliveCount
         << " alive, " << deadCount << " dead)" << endl;

    // Query 1: all alive
    cout << endl << "Query: alive enemies" << endl;
    auto isAlive = [](int i) { return true; };
    int q1 = countWhere(alive, POOL_SIZE, isAlive);
    cout << "  Result: " << q1 << " found" << endl;

    // Query 2: low HP (hp < 15)
    cout << endl << "Query: low HP (hp < 15)" << endl;
    auto isLowHP = [](int i) { return hp[i] < 15; };
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i] && hp[i] < 15) {
            cout << "  e" << i << " hp=" << hp[i] << endl;
        }
    }
    int q2 = countWhere(alive, POOL_SIZE, isLowHP);
    cout << "  Result: " << q2 << " found" << endl;

    // Query 3: danger zone (y > 250)
    cout << endl << "Query: in danger zone (y > 250)" << endl;
    auto inDanger = [](int i) { return ey[i] > 250; };
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i] && ey[i] > 250) {
            cout << "  e" << i << " at y=" << ey[i] << endl;
        }
    }
    int q3 = countWhere(alive, POOL_SIZE, inDanger);
    cout << "  Result: " << q3 << " found" << endl;

    // Query 4: critical (alive AND hp < 15 AND y > 200)
    cout << endl << "Query: critical (alive AND hp < 15 AND y > 200)" << endl;
    auto isCritical = [](int i) { return hp[i] < 15 && ey[i] > 200; };
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i] && hp[i] < 15 && ey[i] > 200) {
            cout << "  e" << i << " hp=" << hp[i] << " at y=" << ey[i] << endl;
        }
    }
    int q4 = countWhere(alive, POOL_SIZE, isCritical);
    cout << "  Result: " << q4 << " found" << endl;

    cout << endl << "GAME_MESSAGE|Lambdas: one loop, any predicate. Query your data." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show 6 alive enemies",
        expectedOutput: "Result: 6 found",
      },
      {
        id: "t2",
        description: "Should find 2 low HP enemies",
        expectedOutput: "Result: 2 found",
      },
      {
        id: "t3",
        description: "Should find e4 with hp=5 in low HP query",
        expectedOutput: "e4 hp=5",
      },
      {
        id: "t4",
        description: "Should find 1 critical enemy",
        expectedOutput: "Result: 1 found",
      },
      {
        id: "t5",
        description: "Should print lambda message",
        expectedOutput: "GAME_MESSAGE\\|Lambdas: one loop, any predicate\\. Query your data\\.",
        isPattern: true,
      },
    ],
    hints: [
      "`countWhere` loops 0 to count, checks `alive[i] && predicate(i)`. The `auto predicate` parameter accepts any lambda.",
      "For Query 2: `auto isLowHP = [](int i) { return hp[i] < 15; };` — since hp is a global array, the lambda can access it directly without capture.",
      "Query 4 combines two conditions: `hp[i] < 15 && ey[i] > 200`. Only e4 (hp=5, y=220) matches both.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Query Engine",
    type: "game_builder",
    instructions: `# Game Builder: Lambda Query Engine

Use lambdas to query game state for real-time diagnostics. Count threats, find damaged enemies, identify danger-zone entities. One query function, many predicates.

## Your Task

1. Set up a pool of 8 enemies with varied HP and positions
2. Write \\\`countWhere\\\` with auto predicate parameter
3. Run 4 queries: alive count, low HP, danger zone, critical
4. List matching entities for each query
5. Output HUD and score based on query results

## Expected Output

\\\`\\\`\\\`
=== LAMBDA QUERIES ===
Pool: 8 entities (6 alive, 2 dead)

Query: alive enemies
  Result: 6 found

Query: low HP (hp < 15)
  e1 hp=10
  e4 hp=5
  Result: 2 found

Query: in danger zone (y > 250)
  e3 at y=260
  e5 at y=280
  Result: 2 found

Query: critical (alive AND hp < 15 AND y > 200)
  e4 hp=5 at y=220
  Result: 1 found

HUD|HP:100|SCORE:0|LIVES:3
GAME_MESSAGE|Lambdas: one loop, any predicate. Query your data.
SCORE|0
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 8;

bool alive[POOL_SIZE] = {true, true, true, true, true, true, false, false};
int hp[POOL_SIZE]     = {30,   10,   25,   20,   5,    35,   0,     0};
int ey[POOL_SIZE]     = {100,  150,  260,  180,  220,  280,  0,     0};

// TODO: Write countWhere(bool alive[], int count, auto predicate)
// For each alive entity where predicate(i) is true, count it.

int main() {
    cout << "=== LAMBDA QUERIES ===" << endl;

    int aliveCount = 0;
    int deadCount = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i]) aliveCount++;
        else deadCount++;
    }
    cout << "Pool: " << POOL_SIZE << " entities (" << aliveCount
         << " alive, " << deadCount << " dead)" << endl;

    // TODO: Query 1 — all alive enemies
    cout << endl << "Query: alive enemies" << endl;

    // TODO: Query 2 — low HP (hp < 15), list matches
    cout << endl << "Query: low HP (hp < 15)" << endl;

    // TODO: Query 3 — danger zone (y > 250), list matches
    cout << endl << "Query: in danger zone (y > 250)" << endl;

    // TODO: Query 4 — critical intersection, list matches
    cout << endl << "Query: critical (alive AND hp < 15 AND y > 200)" << endl;

    // TODO: HUD, message, score
    cout << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 8;

bool alive[POOL_SIZE] = {true, true, true, true, true, true, false, false};
int hp[POOL_SIZE]     = {30,   10,   25,   20,   5,    35,   0,     0};
int ey[POOL_SIZE]     = {100,  150,  260,  180,  220,  280,  0,     0};

int countWhere(bool alive[], int count, auto predicate) {
    int result = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && predicate(i)) result++;
    }
    return result;
}

int main() {
    cout << "=== LAMBDA QUERIES ===" << endl;

    int aliveCount = 0;
    int deadCount = 0;
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i]) aliveCount++;
        else deadCount++;
    }
    cout << "Pool: " << POOL_SIZE << " entities (" << aliveCount
         << " alive, " << deadCount << " dead)" << endl;

    // Query 1: all alive
    cout << endl << "Query: alive enemies" << endl;
    auto isAlive = [](int i) { return true; };
    int q1 = countWhere(alive, POOL_SIZE, isAlive);
    cout << "  Result: " << q1 << " found" << endl;

    // Query 2: low HP
    cout << endl << "Query: low HP (hp < 15)" << endl;
    auto isLowHP = [](int i) { return hp[i] < 15; };
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i] && hp[i] < 15) {
            cout << "  e" << i << " hp=" << hp[i] << endl;
        }
    }
    int q2 = countWhere(alive, POOL_SIZE, isLowHP);
    cout << "  Result: " << q2 << " found" << endl;

    // Query 3: danger zone
    cout << endl << "Query: in danger zone (y > 250)" << endl;
    auto inDanger = [](int i) { return ey[i] > 250; };
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i] && ey[i] > 250) {
            cout << "  e" << i << " at y=" << ey[i] << endl;
        }
    }
    int q3 = countWhere(alive, POOL_SIZE, inDanger);
    cout << "  Result: " << q3 << " found" << endl;

    // Query 4: critical
    cout << endl << "Query: critical (alive AND hp < 15 AND y > 200)" << endl;
    auto isCritical = [](int i) { return hp[i] < 15 && ey[i] > 200; };
    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i] && hp[i] < 15 && ey[i] > 200) {
            cout << "  e" << i << " hp=" << hp[i] << " at y=" << ey[i] << endl;
        }
    }
    int q4 = countWhere(alive, POOL_SIZE, isCritical);
    cout << "  Result: " << q4 << " found" << endl;

    cout << endl << "HUD|HP:100|SCORE:0|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Lambdas: one loop, any predicate. Query your data." << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should count 6 alive enemies",
        expectedOutput: "Result: 6 found",
      },
      {
        id: "g2",
        description: "Should list e1 with hp=10 in low HP query",
        expectedOutput: "e1 hp=10",
      },
      {
        id: "g3",
        description: "Should list e4 with hp=5 in low HP query",
        expectedOutput: "e4 hp=5",
      },
      {
        id: "g4",
        description: "Should find 2 in danger zone",
        expectedOutput: "Result: 2 found",
      },
      {
        id: "g5",
        description: "Should find 1 critical enemy",
        expectedOutput: "Result: 1 found",
      },
      {
        id: "g6",
        description: "Should show HUD",
        expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "g7",
        description: "Should print lambda message",
        expectedOutput: "GAME_MESSAGE\\|Lambdas: one loop, any predicate\\. Query your data\\.",
        isPattern: true,
      },
      {
        id: "g8",
        description: "Should output score",
        expectedOutput: "SCORE\\|0",
        isPattern: true,
      },
    ],
    hints: [
      "`countWhere` takes `auto predicate` as last parameter. Loop `0` to `count`. If `alive[i] && predicate(i)`, increment result.",
      "For listing matches, use a separate loop with the same condition. Print `e` + index + data. Example: `cout << \"  e\" << i << \" hp=\" << hp[i] << endl;`",
      "Critical query combines: `hp[i] < 15 && ey[i] > 200`. Only e4 (hp=5, y=220) passes both conditions.",
    ],
    estimatedMinutes: 7,
  },
};
