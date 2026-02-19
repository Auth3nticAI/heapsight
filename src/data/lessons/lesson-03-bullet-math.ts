import type { Lesson } from "@/types/lesson";

export const lesson03: Lesson = {
  id: "03-bullet-math",
  title: "Bullet Math",
  description: "Move entities with arithmetic. Position changes over time.",
  order: 3,
  xpReward: 75,
  tier: "free",
  concepts: ["arithmetic", "position update", "movement", "tick simulation"],
  part1: {
    title: "Concept: Movement",
    type: "concept",
    instructions: `# Bullet Math

## Mental Model

Movement is math. Position changes over time. That is all physics is. Every moving entity has position (x, y) and velocity (dx, dy). Each tick: x += dx, y += dy. This IS physics. Newton's first law in code. An object in motion stays in motion until a force acts on it. No force here. The bullet just goes.

## What Breaks Without This

Without position updates, nothing moves. Bullets sit still at spawn point. Enemies hover in place. The game is a still image. You have entities but they are frozen. Movement is what separates a game from a painting.

## The Fix

A bullet starts at y=280. Each tick, y decreases by 40 (moves up the screen). After 3 ticks: 280, 240, 200. That is movement. Subtraction applied repeatedly over time.

The pattern:
\\\`\\\`\\\`cpp
int bulletY = 280;
int bulletSpeed = 40;
// Tick 1: bulletY = 280 (print, then update)
bulletY = bulletY - bulletSpeed;
// Tick 2: bulletY = 240
bulletY = bulletY - bulletSpeed;
// Tick 3: bulletY = 200
\\\`\\\`\\\`

Screen coordinates: y=0 is the top. Moving "up" means y decreases. This is standard in every 2D engine.

## Performance Insight

An integer addition is 1 CPU cycle. Position update for 1000 bullets = 1000 additions = 1000 cycles. At 3 GHz that is 0.3 microseconds. Trivial. You will never be bottlenecked by position math.

## Memory Insight

Two ints per entity (x, y) = 8 bytes. 1000 bullets = 8KB. Your L1 cache is 32-64KB. All thousand bullets fit in L1 with room to spare. Cache-friendly from day one.

## Your Task

Simulate a bullet moving upward across 3 ticks. Print the bullet entity at each tick, then a summary message:
\\\`\\\`\\\`
=== TICK 1 ===
ENTITY|bullet|projectile|200|280|6|6|1
=== TICK 2 ===
ENTITY|bullet|projectile|200|240|6|6|1
=== TICK 3 ===
ENTITY|bullet|projectile|200|200|6|6|1
GAME_MESSAGE|Bullet traveled 80 units in 3 ticks
\\\`\\\`\\\`

Start with \\\`bulletX = 200\\\`, \\\`bulletY = 280\\\`, \\\`bulletSpeed = 40\\\`. Each tick: print the entity, then subtract speed from y.

## Beginner Trap

**Y-axis confusion:** In screen coordinates, y=0 is the TOP of the screen. Moving "up" means y DECREASES. This is the opposite of math class. Every 2D game engine works this way. Subtract to go up. Add to go down.

## Elite Insight

Quake's movement used the same core pattern plus a friction term: \\\`velocity = velocity * friction + acceleration\\\`. The foundation is identical to what you are building. Position += velocity. Everything else is refinement.

## Mastery Check

If a bullet at y=280 moves at speed 40, what is y after 3 ticks? 280 - 40 - 40 - 40 = 160. Wait -- the expected output shows 200. Why? Because we print BEFORE updating on tick 1. Tick 1 prints y=280, then subtracts. Tick 2 prints y=240, then subtracts. Tick 3 prints y=200. The print-then-update pattern matters.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int bulletX = 200;
    int bulletY = 280;
    int bulletSpeed = 40;

    // Simulate 3 ticks
    // Each tick: print tick header, print bullet entity, then update bulletY

    // Tick 1
    // cout << "=== TICK 1 ===" << endl;
    // cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    // bulletY = bulletY - bulletSpeed;

    // Tick 2

    // Tick 3

    // Print summary: GAME_MESSAGE|Bullet traveled 80 units in 3 ticks

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int bulletX = 200;
    int bulletY = 280;
    int bulletSpeed = 40;

    // Tick 1
    cout << "=== TICK 1 ===" << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    bulletY = bulletY - bulletSpeed;

    // Tick 2
    cout << "=== TICK 2 ===" << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    bulletY = bulletY - bulletSpeed;

    // Tick 3
    cout << "=== TICK 3 ===" << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;

    cout << "GAME_MESSAGE|Bullet traveled 80 units in 3 ticks" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Tick 1 should show bullet at y=280",
        expectedOutput: "ENTITY\\|bullet\\|projectile\\|200\\|280\\|6\\|6\\|1",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Tick 2 should show bullet at y=240",
        expectedOutput: "ENTITY\\|bullet\\|projectile\\|200\\|240\\|6\\|6\\|1",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Tick 3 should show bullet at y=200",
        expectedOutput: "ENTITY\\|bullet\\|projectile\\|200\\|200\\|6\\|6\\|1",
        isPattern: true,
      },
      {
        id: "t4",
        description: "Should show the travel summary message",
        expectedOutput: "GAME_MESSAGE\\|Bullet traveled 80 units in 3 ticks",
        isPattern: true,
      },
    ],
    hints: [
      "Print the entity BEFORE updating the position. Tick 1 prints y=280, then subtracts 40.",
      'Build the entity line with variables: `cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;`',
      "After tick 1 and tick 2, do `bulletY = bulletY - bulletSpeed;` to move the bullet up.",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Multi-Entity Movement",
    type: "game_builder",
    instructions: `# Game Builder: Bullet Up, Enemy Down

Two entities moving in opposite directions. The bullet moves up (y decreases). The enemy moves down (y increases). The ship stays still. Three ticks of simulation with all three entities.

## The Pattern

\\\`\\\`\\\`cpp
int bulletY = 280;    // moves up: y -= 40
int enemyY = 40;     // moves down: y += 20
\\\`\\\`\\\`

Each tick: print all entities at current positions, then update positions. The bullet closes on the enemy. The closing speed is how fast the gap shrinks.

## Your Task

Print 3 ticks with ship, bullet, and enemy. Then a summary:
\\\`\\\`\\\`
=== TICK 1 ===
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|280|6|6|1
ENTITY|enemy|enemy|180|40|22|22|30
=== TICK 2 ===
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|240|6|6|1
ENTITY|enemy|enemy|180|60|22|22|30
=== TICK 3 ===
ENTITY|ship|player|180|300|24|24|100
ENTITY|bullet|projectile|192|200|6|6|1
ENTITY|enemy|enemy|180|80|22|22|30
GAME_MESSAGE|Bullet: -80 | Enemy: +40 | Closing speed: 120/3 ticks
\\\`\\\`\\\`

Ship: (180, 300), size 24x24, hp 100. Static.
Bullet: starts at (192, 280), speed 40 upward. Size 6x6, hp 1.
Enemy: starts at (180, 40), speed 20 downward. Size 22x22, hp 30.

The bullet x=192 because it spawns centered on the 24-wide ship at x=180: 180 + (24-6)/2 = 189. Close enough at 192.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Ship (static)
    int shipX = 180, shipY = 300;

    // Bullet (moves up)
    int bulletX = 192, bulletY = 280;
    int bulletSpeed = 40;

    // Enemy (moves down)
    int enemyX = 180, enemyY = 40;
    int enemySpeed = 20;

    // Tick 1: print all entities, then update positions

    // Tick 2: print all entities, then update positions

    // Tick 3: print all entities (no update needed)

    // Summary message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Ship (static)
    int shipX = 180, shipY = 300;

    // Bullet (moves up)
    int bulletX = 192, bulletY = 280;
    int bulletSpeed = 40;

    // Enemy (moves down)
    int enemyX = 180, enemyY = 40;
    int enemySpeed = 20;

    // Tick 1
    cout << "=== TICK 1 ===" << endl;
    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|100" << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
    bulletY = bulletY - bulletSpeed;
    enemyY = enemyY + enemySpeed;

    // Tick 2
    cout << "=== TICK 2 ===" << endl;
    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|100" << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
    bulletY = bulletY - bulletSpeed;
    enemyY = enemyY + enemySpeed;

    // Tick 3
    cout << "=== TICK 3 ===" << endl;
    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|100" << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;

    cout << "GAME_MESSAGE|Bullet: -80 | Enemy: +40 | Closing speed: 120/3 ticks" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Tick 3 should show bullet at y=200",
        expectedOutput: "ENTITY\\|bullet\\|projectile\\|192\\|200\\|6\\|6\\|1",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Tick 3 should show enemy at y=80",
        expectedOutput: "ENTITY\\|enemy\\|enemy\\|180\\|80\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show the closing speed summary",
        expectedOutput: "GAME_MESSAGE\\|Bullet: -80 \\| Enemy: \\+40 \\| Closing speed: 120/3 ticks",
        isPattern: true,
      },
    ],
    hints: [
      "Print all three entities each tick, then update bullet and enemy positions. Ship stays still.",
      "Bullet moves up: `bulletY = bulletY - bulletSpeed;` Enemy moves down: `enemyY = enemyY + enemySpeed;`",
      "Only update positions after ticks 1 and 2. After tick 3, just print the summary message.",
    ],
    estimatedMinutes: 6,
  },
};
