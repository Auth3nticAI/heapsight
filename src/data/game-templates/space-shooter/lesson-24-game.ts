import type { GameLessonVariant } from "@/types/game";

export const lesson24SpaceShooter: GameLessonVariant = {
  lessonId: "24-lambdas-for-queries",
  instructions: `# Lambdas for Queries — Data-Driven Entity Filtering

## Mental Model

A lambda is an inline function. A query is a lambda that returns bool. Apply it across the entity pool. \`auto isLowHP = [](int i) { return hp[i] < 10; };\` Now sweep the pool: count matches, collect indices, or process results. Data-driven queries over data-oriented storage.

Without lambdas, every new question about your game state requires a new for loop. How many enemies alive? One loop. How many below 15 HP? Another loop. How many in the danger zone? Yet another. Same pattern — iterate alive entities, check condition, count. The only thing that changes is the condition. Lambdas extract that condition into a parameter.

## What Breaks Without This

Code duplication. You write the same loop skeleton over and over. Change the iteration order? Update every loop. Add a new alive check? Update every loop. Miss one? Stale query results. Bugs from mechanical copy-paste.

With \`countWhere(alive, count, predicate)\`, the iteration logic lives in one place. Predicates are interchangeable. Add a new query by writing one lambda. The loop code never changes.

## The Fix

\`countWhere\` takes a \`bool alive[]\` array, a count, and an \`auto predicate\` — any callable that takes an index and returns bool. Inside: loop, check alive, check predicate, count matches. That is the entire query engine.

Four queries demonstrate composability:
1. **Alive count** — predicate: \`[](int i) { return true; }\` (all alive pass)
2. **Low HP** — predicate: \`[](int i) { return hp[i] < 15; }\`
3. **Danger zone** — predicate: \`[](int i) { return ey[i] > 250; }\`
4. **Critical** — predicate: \`[](int i) { return hp[i] < 15 && ey[i] > 200; }\`

Same function, four different results. The compiler inlines each lambda into its own specialized loop. Zero overhead.

## Your Task

1. Write \`countWhere(bool alive[], int count, auto predicate)\` — generic query function
2. Set up 8-entity pool: 6 alive, 2 dead. Varied HP and y positions
3. Run all 4 queries, listing matching entities for queries 2-4
4. Output HUD and score

Pool data:
- e0: hp=30, y=100 (alive)
- e1: hp=10, y=150 (alive) -- low HP
- e2: hp=25, y=260 (alive) -- danger zone
- e3: hp=20, y=180 (alive)
- e4: hp=5, y=220 (alive) -- low HP + critical
- e5: hp=35, y=280 (alive) -- danger zone
- e6: dead
- e7: dead

## Performance Insight

Each lambda generates a unique template instantiation of \`countWhere\`. The compiler inlines the predicate body directly into the loop. No function pointer. No virtual dispatch. No indirection. The generated assembly is identical to hand-writing four separate loops — but the source code has zero duplication.

## Memory Insight

These lambdas access global arrays, so they need no captures. A captureless lambda is a zero-size object — it occupies no memory. Even captured lambdas are stack-allocated temporaries that vanish when the function call ends. No heap. No allocation. No cleanup.

## Beginner Trap

**Capturing by reference when the lambda outlives the scope.** \`[&]\` captures local variables by reference. If you return the lambda or store it, those references dangle. For queries that run immediately (like \`countWhere\`): \`[&]\` is safe. For callbacks stored for later: capture by value \`[=]\` or capture specific variables.

## Elite Insight

Unity DOTS: \`Entities.ForEach((ref Translation t, ref Health h) => { ... })\` compiles to a tight loop over archetypes. Your \`countWhere + lambda\` is the same pattern at a smaller scale. The ECS query API is just lambdas over component arrays. You are learning the primitive that scales to millions of entities.

## Systems Thinking Connection

L23 added \`printDiagnostics\` — a hardcoded read-only observer. L24 makes observation composable. Instead of one diagnostics function per metric, you have one query engine and unlimited predicates. The diagnostics system is now data-driven. New metrics require zero new functions — just new lambdas.

## Skill Reinforcement

L7: loops. L8: alive flags and conditionals. L10: pool iteration. L23: read-only diagnostics. L24: parameterized diagnostics via lambdas. The iteration primitive stays constant. The query logic is injected at call time.

## Mastery Check

Why is \`auto predicate\` better than \`bool (*predicate)(int)\` for query functions? \`auto\` triggers template instantiation — each lambda type gets a specialized function. The compiler sees the lambda body and inlines it. A function pointer forces an indirect call that cannot be inlined. \`auto\` = zero overhead. Function pointer = indirect call per iteration.`,
  starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 8;

bool alive[POOL_SIZE] = {true, true, true, true, true, true, false, false};
int hp[POOL_SIZE]     = {30,   10,   25,   20,   5,    35,   0,     0};
int ey[POOL_SIZE]     = {100,  150,  260,  180,  220,  280,  0,     0};

// TODO: Write countWhere(bool alive[], int count, auto predicate)
// For each index where alive[i] && predicate(i), count it.

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

    // TODO: Query 1 — count alive (lambda: return true)
    cout << endl << "Query: alive enemies" << endl;

    // TODO: Query 2 — low HP (hp < 15), list and count
    cout << endl << "Query: low HP (hp < 15)" << endl;

    // TODO: Query 3 — danger zone (y > 250), list and count
    cout << endl << "Query: in danger zone (y > 250)" << endl;

    // TODO: Query 4 — critical (hp < 15 && y > 200), list and count
    cout << endl << "Query: critical (alive AND hp < 15 AND y > 200)" << endl;

    cout << endl << "HUD|HP:100|SCORE:0|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Lambdas: one loop, any predicate. Query your data." << endl;
    cout << "SCORE|0" << endl;

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
    { id: "g1", description: "Should count 6 alive enemies", expectedOutput: "Result: 6 found" },
    { id: "g2", description: "Should list e1 with hp=10", expectedOutput: "e1 hp=10" },
    { id: "g3", description: "Should list e4 with hp=5", expectedOutput: "e4 hp=5" },
    { id: "g4", description: "Should find 2 low HP enemies", expectedOutput: "Result: 2 found" },
    { id: "g5", description: "Should find e2 in danger zone at y=260", expectedOutput: "e2 at y=260" },
    { id: "g6", description: "Should find 2 in danger zone", expectedOutput: "Result: 2 found" },
    { id: "g7", description: "Should find e4 as critical", expectedOutput: "e4 hp=5 at y=220" },
    { id: "g8", description: "Should find 1 critical enemy", expectedOutput: "Result: 1 found" },
    { id: "g9", description: "Should output HUD", expectedOutput: "HUD\\|HP:100\\|SCORE:0\\|LIVES:3", isPattern: true },
    { id: "g10", description: "Should print lambda message", expectedOutput: "GAME_MESSAGE\\|Lambdas: one loop, any predicate\\. Query your data\\.", isPattern: true },
  ],
  hints: [
    "`countWhere` signature: `int countWhere(bool alive[], int count, auto predicate)`. Loop, check `alive[i] && predicate(i)`, count matches.",
    "Lambdas accessing global arrays (hp, ey) need no captures. Just use them directly: `[](int i) { return hp[i] < 15; }`.",
    "For listing matches, write a separate for loop with the same condition. The listing loop prints details; `countWhere` just returns the count.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L24: Lambdas for Queries ===
// One query function, any predicate. Data-driven filtering.

const int POOL_SIZE = 32;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// --- Query engine (L24) ---
int countWhere(bool alive[], int count, auto predicate) {
    int result = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && predicate(i)) result++;
    }
    return result;
}

// --- Read-only diagnostics (L23) ---
int countAlive(bool alive[], int size) {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) count++;
    }
    return count;
}

void printDiagnostics(bool alive[], int pool_size) {
    int count = 0;
    int freeSlots = 0;
    for (int i = 0; i < pool_size; i++) {
        if (alive[i]) count++;
        else freeSlots++;
    }
    cout << "[DIAG] entities=" << count
         << " pool=" << count << "/" << pool_size
         << " freeList=" << freeSlots << endl;
}

// --- Pool management (L10) ---
int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int hp,
                int ex[], int ey[], int ehp[], bool alive[]) {
    ex[idx] = x;
    ey[idx] = y;
    ehp[idx] = hp;
    alive[idx] = true;
}

void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}

// --- System functions (L9+) ---
void moveSystem(int ey[], bool alive[], int count, int speed) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) ey[i] += speed;
    }
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    // Spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, 50 + i * 60, 40, 30,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // Lambda queries for diagnostics
    auto isAlive = [](int i) { return true; };
    auto isLowHP = [](int i) { return enemy_hp[i] < 15; };
    int aliveCount = countWhere(enemy_alive, POOL_SIZE, isAlive);
    int lowHPCount = countWhere(enemy_alive, POOL_SIZE, isLowHP);

    cout << "Alive: " << aliveCount << endl;
    cout << "Low HP: " << lowHPCount << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    cout << "HUD|HP:100|SCORE:0|LIVES:3" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
};
