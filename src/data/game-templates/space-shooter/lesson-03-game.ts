import type { GameLessonVariant } from "@/types/game";

export const lesson03SpaceShooter: GameLessonVariant = {
  lessonId: "03-bullet-math",
  instructions: `# Bullet Math -- Frozen Battlefield

## Mental Model

Movement is math. Position changes over time. That is all physics is. Every moving entity has position (x, y) and velocity. Each tick: position += velocity. Newton's first law in code. An object in motion stays in motion. No friction, no gravity, just raw displacement.

## What Breaks Without This

Without position updates, nothing moves. Bullets sit at spawn point forever. Enemies hover at their initial coordinates. You have a battlefield with entities but zero motion. The game is a screenshot. Movement is what makes a game feel alive.

## The Fix

The bullet starts at y=280. Each tick, subtract 40 from y. After 3 ticks the bullet is at y=200. That is 80 units of travel. The enemy starts at y=40. Each tick, add 20 to y. After 3 ticks the enemy is at y=80. That is 40 units of travel.

Both entities move simultaneously. The bullet goes up. The enemy comes down. The gap between them shrinks by 60 units per tick. That is the closing speed: bullet speed + enemy speed = 40 + 20 = 60 units per tick.

The ship stays still at (180, 300). It fired the bullet. Now it watches.

Screen coordinates: y=0 is the top of the screen. Moving "up" means y decreases. Moving "down" means y increases. This is standard in every 2D engine, every GPU API, every framebuffer. Top-left origin.

## Performance Insight

An integer addition is 1 CPU cycle. Position update for 1000 bullets = 1000 cycles. At 3 GHz that is 0.3 microseconds. You could simulate ten thousand entities and still have 99.99% of your frame budget left. The math is free. The bottleneck is always rendering, never arithmetic.

## Memory Insight

Two ints per entity (x, y) = 8 bytes. 1000 bullets = 8KB. Your L1 cache is 32-64KB. All thousand bullets fit in L1 with room to spare. When you iterate over positions sequentially, the prefetcher loads the next cache line before you need it. This is why flat arrays of positions are fast.

## Your Task

Simulate 3 ticks with a ship, bullet, and enemy. Then print a summary:
\`\`\`
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
\`\`\`

Variables:
- Ship: x=180, y=300, static
- Bullet: x=192, y=280, speed=40 (upward, subtract each tick)
- Enemy: x=180, y=40, speed=20 (downward, add each tick)

Print all entities, then update positions. Repeat for 3 ticks. After tick 3, print the summary.

## Beginner Trap

**Y-axis confusion:** In screen coordinates, y=0 is the TOP. Moving "up" means y DECREASES. This trips up every beginner who expects math-class coordinates. Subtract to go up. Add to go down. Memorize this.

**Update timing:** Print BEFORE updating. If you update first, tick 1 shows the wrong position. The pattern is: display current state, then compute next state. This is how every game loop works.

## Elite Insight

Quake's movement: same pattern plus a friction term. \`velocity = velocity * friction + acceleration\`. Unreal's character movement: same foundation plus gravity, collision response, and step-up logic. But strip away the complexity and you find \`position += velocity * deltaTime\`. The core is identical to what you are writing.

## Systems Thinking Connection

You are simulating a tick-based system. Each tick: read all positions, update all positions, output all positions. This is the Entity-Component-System pattern in embryo. Later you will have arrays of positions and velocities. A movement system will iterate over all of them. The loop body will be the same two lines: \`y += speed\` and \`print entity\`.

## Skill Reinforcement

You are using: variable declaration, arithmetic operators (\`-\` and \`+\`), variable mutation across time steps, and multi-entity output per tick. This is the complete movement pipeline: state, math, display.

## Mastery Check

The bullet travels 80 units in 3 ticks. The enemy travels 40 units in 3 ticks. Why is the closing speed 120, not 80? Because closing speed is relative: bullet moves 80 units toward the enemy AND the enemy moves 40 units toward the bullet. 80 + 40 = 120 units of gap closure. Relative velocity is the sum of both speeds when moving toward each other.`,
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

    // TODO: Tick 1 - print all three entities, then update bullet and enemy positions

    // TODO: Tick 2 - print all three entities, then update positions

    // TODO: Tick 3 - print all three entities (no update needed after last tick)

    // TODO: Print summary message

    return 0;
}`,

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
}`,

  tests: [
    {
      id: "g1",
      description: "Tick 1 should show bullet at y=280 and enemy at y=40",
      expectedOutput: "ENTITY\\|bullet\\|projectile\\|192\\|280\\|6\\|6\\|1",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Tick 3 should show bullet at y=200",
      expectedOutput: "ENTITY\\|bullet\\|projectile\\|192\\|200\\|6\\|6\\|1",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Tick 3 should show enemy at y=80",
      expectedOutput: "ENTITY\\|enemy\\|enemy\\|180\\|80\\|22\\|22\\|30",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Should show the closing speed summary",
      expectedOutput: "GAME_MESSAGE\\|Bullet: -80 \\| Enemy: \\+40 \\| Closing speed: 120/3 ticks",
      isPattern: true,
    },
  ],

  hints: [
    "Each tick: print ship, bullet, enemy in order. Then update bulletY and enemyY. Do NOT update after tick 3.",
    "Bullet moves up: `bulletY = bulletY - bulletSpeed;` Enemy moves down: `enemyY = enemyY + enemySpeed;`",
    'Build entity lines with variables: `cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;`',
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 100;
    int score = 0;
    int lives = 3;

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
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
    bulletY = bulletY - bulletSpeed;
    enemyY = enemyY + enemySpeed;

    // Tick 2
    cout << "=== TICK 2 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;
    bulletY = bulletY - bulletSpeed;
    enemyY = enemyY + enemySpeed;

    // Tick 3
    cout << "=== TICK 3 ===" << endl;
    cout << "HUD|HP:" << hp << "|SCORE:" << score << "|LIVES:" << lives << endl;
    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|24|24|" << hp << endl;
    cout << "ENTITY|bullet|projectile|" << bulletX << "|" << bulletY << "|6|6|1" << endl;
    cout << "ENTITY|enemy|enemy|" << enemyX << "|" << enemyY << "|22|22|30" << endl;

    cout << "GAME_MESSAGE|Bullet: -80 | Enemy: +40 | Closing speed: 120/3 ticks" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}`,
};
