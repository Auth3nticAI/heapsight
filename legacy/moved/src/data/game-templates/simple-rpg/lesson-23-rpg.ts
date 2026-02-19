import type { GameLessonVariant } from "@/types/game";

export const lesson23RPG: GameLessonVariant = {
  lessonId: "rpg-23-lambda-queries",

  instructions: `# Lambda Queries — The Query Pattern

## Mental Model

Lambdas are inline logic. Pass a question, get an answer. "How many enemies are alive?" is just \`countWhere\` with a predicate. The function that counts does not know what it is counting. The lambda provides the criterion. That decoupling is the power. \`countWhere\` is a tool. Lambdas are the questions you ask with it.

Think of it this way: without lambdas, every query is a bespoke loop. With lambdas, every query is one line. The loop lives once, in \`countWhere\`. The question lives in the lambda you pass. Separate concerns. One loop to rule them all.

## What Breaks Without This

Without lambdas, you write three loops:

\`\`\`cpp
int aliveCount = 0;
for (int i = 0; i < N; i++) if (alive[i]) aliveCount++;

int lowHP = 0;
for (int i = 0; i < N; i++) if (alive[i] && stats[i].hp < 15) lowHP++;

int wealthy = 0;
for (int i = 0; i < N; i++) if (alive[i] && stats[i].gold > 20) wealthy++;
\`\`\`

That is 9 lines doing what 3 lines with lambdas do. Each loop is a copy of the same iteration logic with one line changed. Duplication is debt. Lambdas pay it off.

## The Fix

\`\`\`cpp
int countWhere(int count, auto predicate) {
    int total = 0;
    for (int i = 0; i < count; i++) {
        if (predicate(i)) total++;
    }
    return total;
}

// Three queries, three lambdas:
int aliveCount = countWhere(N, [&](int i){ return alive[i]; });
int lowHP      = countWhere(N, [&](int i){ return alive[i] && stats[i].hp < 15; });
int wealthy    = countWhere(N, [&](int i){ return alive[i] && stats[i].gold > 20; });
\`\`\`

The \`[&]\` captures everything from the enclosing scope by reference. No copying. Pure read access. The predicate returns a bool. \`countWhere\` counts the trues.

## Pattern Insight

This is the standard functional pattern: pass behavior as data. In SQL: \`SELECT COUNT(*) WHERE condition\`. In C++ STL: \`std::count_if(begin, end, predicate)\`. In Unity C#: \`enemies.Count(e => e.IsAlive)\`. In Unreal: \`Enemies.FilterByPredicate([](const AEnemy* E){ return E->IsAlive(); }).Num()\`. All the same idea. You are learning the idea, not just the syntax.

## Scalability Insight

\`countWhere\` counts. But the same skeleton becomes \`collectWhere\` (return indices), \`anyWhere\` (return bool — does any entity satisfy this?), \`allWhere\` (return bool — do all satisfy this?), and \`sumWhere\` (return total of some field). These are the standard functional operations: filter, any, all, reduce. Build them all on top of the same predicate-index pattern. Your \`countWhere\` is the prototype of the whole family.

## Your Task

Implement the full query dashboard. Six enemies in a room — mixed alive, dead, hurt, wealthy. Run three queries. Display results on a grid with a HUD.

1. Set up 6 enemies: 4 alive (HP: 12, 20, 8, 30; gold: 5, 30, 10, 15), 2 dead
2. Positions: alive at (3,2), (7,2), (12,2), (16,2); dead at (5,7), (14,7)
3. Player at (3,5), HP 100, gold 0
4. Run countWhere for alive (4), low HP — hp<15 (2), wealthy — gold>20 (1)
5. Render 20x10 grid: \`@\` player, \`E\` alive enemy, \`X\` dead enemy
6. Print \`HUD|HP:100|Gold:0|Alive: 4 | Low HP: 2 | Wealthy: 1\`
7. Print \`GAME_MESSAGE|Data speaks through queries.\`

## Common Mistake

Forgetting \`[&]\` and writing \`[]\` instead. An empty capture means the lambda cannot see \`alive\` or \`stats\`. You will get a compiler error about undeclared identifiers. Add \`[&]\` to capture the outer arrays by reference. Zero cost. Required for access.

## Elite Insight

C++'s \`std::count_if\` in \`<algorithm>\` does exactly what your \`countWhere\` does — it takes a range and a unary predicate and returns the count of matching elements. After this lesson, look up \`std::count_if\`, \`std::find_if\`, \`std::remove_if\`, and \`std::partition\`. They all take predicates. They all use the same lambda syntax. You have learned the core concept behind an entire header of the standard library.

## Pattern Recognition

Predicate-based iteration is everywhere. GPU shaders: every pixel runs a predicate to determine if it should be lit. Physics engines: broad-phase collision uses predicates to cull impossible pairs. Behavior trees: condition nodes are predicates on game state. SQL query planners: WHERE clauses are compiled into predicate functions. Lambda syntax is just the C++ spelling of a universal pattern.

## Skill Reinforcement

- Lambda syntax: \`[&](int i){ return condition; }\`
- \`auto\` parameter: accepts any callable without templates
- \`countWhere\` as reusable query primitive
- Read-only observation: queries never mutate data

## Mastery Check

Why does \`countWhere\` take the count as a separate parameter instead of hardcoding 6? Because \`countWhere\` is generic. Tomorrow you have 12 enemies. Next week you have 200. You pass \`N\` and the function scales. Generic tools outlive the data they are first tested on.`,

  starterCode: `#include <iostream>
using namespace std;

struct Stats {
    int hp;
    int gold;
};

// TODO: Implement countWhere(int count, auto predicate)

int main() {
    const int N = 6;
    int ex[N] = {3, 7, 12, 16, 5, 14};
    int ey[N] = {2, 2,  2,  2, 7,  7};
    bool alive[N]  = {true, true, true, true, false, false};
    Stats stats[N] = {{12,5},{20,30},{8,10},{30,15},{0,0},{0,0}};

    int px = 3, py = 5, playerHP = 100, playerGold = 0;

    // TODO: Run 3 queries (aliveCount, lowHP, wealthy)

    // TODO: Render 20x10 grid
    // @ = player, E = alive enemy, X = dead enemy, # = wall, . = floor

    // TODO: HUD|HP:100|Gold:0|Alive: 4 | Low HP: 2 | Wealthy: 1
    // TODO: GAME_MESSAGE|Data speaks through queries.

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

struct Stats {
    int hp;
    int gold;
};

int countWhere(int count, auto predicate) {
    int total = 0;
    for (int i = 0; i < count; i++) {
        if (predicate(i)) total++;
    }
    return total;
}

int main() {
    const int N = 6;
    int ex[N] = {3, 7, 12, 16, 5, 14};
    int ey[N] = {2, 2,  2,  2, 7,  7};
    bool alive[N]  = {true, true, true, true, false, false};
    Stats stats[N] = {{12,5},{20,30},{8,10},{30,15},{0,0},{0,0}};

    int px = 3, py = 5, playerHP = 100, playerGold = 0;

    int aliveCount = countWhere(N, [&](int i){ return alive[i]; });
    int lowHP      = countWhere(N, [&](int i){ return alive[i] && stats[i].hp < 15; });
    int wealthy    = countWhere(N, [&](int i){ return alive[i] && stats[i].gold > 20; });

    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < N; i++) {
                    if (col == ex[i] && row == ey[i]) {
                        cell = alive[i] ? 'E' : 'X';
                        break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }

    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold
         << "|Alive: " << aliveCount
         << " | Low HP: " << lowHP
         << " | Wealthy: " << wealthy << endl;
    cout << "GAME_MESSAGE|Data speaks through queries." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Grid renders with wall borders",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Alive enemies appear as E in grid",
      expectedOutput: "E",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Dead enemies appear as X in grid",
      expectedOutput: "X",
      isPattern: true,
    },
    {
      id: "g4",
      description: "HUD displays all three query counts correctly",
      expectedOutput: "HUD\\|HP:100\\|Gold:0\\|Alive: 4 \\| Low HP: 2 \\| Wealthy: 1",
      isPattern: true,
    },
    {
      id: "g5",
      description: "GAME_MESSAGE confirms queries complete",
      expectedOutput: "GAME_MESSAGE\\|Data speaks through queries\\.",
      isPattern: true,
    },
  ],

  hints: [
    "countWhere takes \`int count\` and \`auto predicate\`. Loop i from 0 to count. \`if (predicate(i)) total++;\`",
    "Use \`[&]\` capture: \`countWhere(N, [&](int i){ return alive[i]; })\`. The & brings alive[] and stats[] into scope.",
    "In the grid render, check enemies in a nested loop per cell. If col==ex[i] && row==ey[i], output alive[i] ? 'E' : 'X'.",
    "HUD format: \`HUD|HP:\" << playerHP << \"|Gold:\" << playerGold << \"|Alive: \" << aliveCount << \" | Low HP: \" << lowHP << \" | Wealthy: \" << wealthy\`",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lesson 23
// Lambda Queries
// ==============================

struct Stats {
    int hp;
    int gold;
};

// === QUERY SYSTEM ===
// countWhere: iterate N entities, count those satisfying predicate
// predicate(i) -> bool. Pure read. Zero mutation.
int countWhere(int count, auto predicate) {
    int total = 0;
    for (int i = 0; i < count; i++) {
        if (predicate(i)) total++;
    }
    return total;
}

int main() {
    const int N = 6;

    // === ENTITY STATE ===
    int ex[N] = {3, 7, 12, 16, 5, 14};
    int ey[N] = {2, 2,  2,  2, 7,  7};
    bool alive[N]  = {true, true, true, true, false, false};
    Stats stats[N] = {{12,5},{20,30},{8,10},{30,15},{0,0},{0,0}};

    // === PLAYER ===
    int px = 3, py = 5, playerHP = 100, playerGold = 0;

    // === QUERIES — lambdas capture arrays by reference ===
    int aliveCount = countWhere(N, [&](int i){ return alive[i]; });
    int lowHP      = countWhere(N, [&](int i){ return alive[i] && stats[i].hp < 15; });
    int wealthy    = countWhere(N, [&](int i){ return alive[i] && stats[i].gold > 20; });

    // === GRID RENDER ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < N; i++) {
                    if (col == ex[i] && row == ey[i]) {
                        cell = alive[i] ? 'E' : 'X';
                        break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }

    // === HUD with live query results ===
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold
         << "|Alive: " << aliveCount
         << " | Low HP: " << lowHP
         << " | Wealthy: " << wealthy << endl;
    cout << "GAME_MESSAGE|Data speaks through queries." << endl;

    return 0;
}
`,
};
