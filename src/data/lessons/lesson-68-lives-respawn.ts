import type { Lesson } from "@/types/lesson";

export const lesson68: Lesson = {
  id: "68-lives-respawn",
  title: "Lives and Respawn",
  description: "Handle player death, respawn with invulnerability, and game over on zero lives.",
  order: 68,
  xpReward: 200,
  tier: "pro",
  concepts: ["lives system", "respawn", "invulnerability", "death handling"],
  part1: {
    title: "Concept: Lives and Respawn",
    type: "concept",
    instructions: `# Lives and Respawn — One Hit and It Is Over

Without lives, the game ends on first contact. Without respawn, death is permanent and punishing. Without invulnerability frames, the player respawns directly into the same bullet that killed them and dies again instantly. The death-respawn cycle is one of the most critical systems in any action game. Get it wrong and the player quits.

## What Breaks Without This

Without lives, a single mistake ends the run. The player learns nothing because they never get to retry. Without invulnerability frames after respawn, the player dies in the same frame they respawn — the enemy bullet is still there. Without a visual flash, the player does not know they are invulnerable and plays too cautiously.

## The Fix

Track a lives counter. On player death: decrement lives, respawn at a fixed safe position, grant invulnerability frames. During invulnerability, skip collision checks for the player and flash the sprite between the normal character and a dot. When invFrames reaches zero, the player is vulnerable again.

\\\`\\\`\\\`
int lives = 3;
int invFrames = 0;
int respawnX = 180, respawnY = 300;

void onPlayerDeath(int tick) {
    lives--;
    if (lives <= 0) { gameOver = true; return; }
    playerX = respawnX;
    playerY = respawnY;
    invFrames = 10;
}
\\\`\\\`\\\`

The invulnerability window is short — 10 frames. Long enough to orient. Short enough that it does not feel like cheating. The sprite flash gives clear feedback: if you see the dot, you are safe. If you see the player character, you are vulnerable.

## Your Task

1. Player starts with 3 lives, invFrames = 0
2. Player hit at tick 5: lives = 2, respawn at (180,300), invFrames = 10
3. During invFrames: sprite alternates between '@' and '.' each tick
4. invFrames decrements each tick, back to normal '@' at 0
5. Player hit at tick 20: lives = 1, respawn, invFrames = 10
6. Player hit at tick 30: lives = 0, GAME OVER
7. Print on death: \\\`DEATH|tick|<t>|lives|<l>|respawn|(180,300)|inv_frames|10\\\`
8. Print during invuln: \\\`INVULN|tick|<t>|frames_left|<f>|sprite|<char>\\\`
9. Print invuln expired: \\\`INVULN|tick|<t>|expired|sprite|@\\\`
10. Print game over: \\\`GAME_OVER|tick|30|lives|0|final_score|1500\\\`

Expected output:
\\\`\\\`\\\`
DEATH|tick|5|lives|2|respawn|(180,300)|inv_frames|10
INVULN|tick|6|frames_left|9|sprite|.
INVULN|tick|15|expired|sprite|@
DEATH|tick|20|lives|1|respawn|(180,300)|inv_frames|10
DEATH|tick|30|lives|0|respawn|(180,300)|inv_frames|10
GAME_OVER|tick|30|lives|0|final_score|1500
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Checking collision on the same frame the player respawns. The enemy projectile that killed the player is still in the same area. If you check collision before setting invFrames, the player dies twice in one frame. Set invFrames BEFORE the next collision check.

## Elite Insight

Mega Man set the standard: 2 seconds of invulnerability with a rapid flash. Castlevania used knockback plus invulnerability. Dark Souls uses zero invulnerability on respawn but moves the spawn point far from danger. The design choice communicates the game's philosophy. Short invuln = arcade. Long invuln = forgiving. No invuln = hardcore.

## Cross-Path Echo

Circuit breakers in distributed systems are the same pattern. When a service fails (death), the circuit breaker trips (respawn). During the cooldown period (invulnerability), requests are rejected (no collision). After the cooldown, the circuit closes and traffic resumes (vulnerable). Your lives system is a circuit breaker with a retry budget.`,
    starterCode: `#include <iostream>
using namespace std;

int playerX = 180, playerY = 300;
int lives = 3;
int invFrames = 0;
int score = 1500;
bool gameOver = false;

// TODO: Write onPlayerDeath(tick)
//   Decrement lives
//   If lives <= 0: set gameOver, print GAME_OVER
//   Else: respawn at (180,300), set invFrames = 10
//   Print DEATH line

// TODO: Write tickInvuln(tick)
//   If invFrames > 0: decrement, print INVULN with sprite ('.' if odd frame, '@' if even)
//   If invFrames just hit 0: print INVULN expired

int main() {
    // TODO: Simulate death at tick 5
    //   Print DEATH, then tick invuln from 6 to 15

    // TODO: Simulate death at tick 20

    // TODO: Simulate death at tick 30 (game over)

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int playerX = 180, playerY = 300;
int lives = 3;
int invFrames = 0;
int score = 1500;
bool gameOver = false;

void onPlayerDeath(int tick) {
    lives--;
    playerX = 180;
    playerY = 300;
    invFrames = 10;

    cout << "DEATH|tick|" << tick << "|lives|" << lives
         << "|respawn|(180,300)|inv_frames|10" << endl;

    if (lives <= 0) {
        gameOver = true;
        cout << "GAME_OVER|tick|" << tick << "|lives|0|final_score|" << score << endl;
    }
}

void tickInvuln(int tick) {
    if (invFrames <= 0) return;
    invFrames--;
    if (invFrames == 0) {
        cout << "INVULN|tick|" << tick << "|expired|sprite|@" << endl;
    } else {
        char sprite = (invFrames % 2 == 0) ? '@' : '.';
        cout << "INVULN|tick|" << tick << "|frames_left|" << invFrames
             << "|sprite|" << sprite << endl;
    }
}

int main() {
    // Death at tick 5
    onPlayerDeath(5);

    // Tick invuln from 6 to 15
    tickInvuln(6);   // frames_left=9, sprite='.'
    tickInvuln(15);  // expired, sprite='@'

    // Death at tick 20
    onPlayerDeath(20);

    // Death at tick 30
    onPlayerDeath(30);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First death at tick 5", expectedOutput: "DEATH\\|tick\\|5\\|lives\\|2\\|respawn\\|\\(180,300\\)\\|inv_frames\\|10", isPattern: true },
      { id: "t2", description: "Invuln frame with flash sprite", expectedOutput: "INVULN\\|tick\\|6\\|frames_left\\|9\\|sprite\\|\\.", isPattern: true },
      { id: "t3", description: "Invuln expired", expectedOutput: "INVULN\\|tick\\|15\\|expired\\|sprite\\|@", isPattern: true },
      { id: "t4", description: "Second death at tick 20", expectedOutput: "DEATH\\|tick\\|20\\|lives\\|1\\|respawn\\|\\(180,300\\)\\|inv_frames\\|10", isPattern: true },
      { id: "t5", description: "Game over at tick 30", expectedOutput: "GAME_OVER\\|tick\\|30\\|lives\\|0\\|final_score\\|1500", isPattern: true },
    ],
    hints: [
      "Decrement lives first, then check if lives <= 0. Print the DEATH line with the new lives count. If lives hit 0, print GAME_OVER immediately after the DEATH line.",
      "Sprite flash: use invFrames % 2. If invFrames is odd, show '.'. If even, show '@'. This creates visible flicker each tick.",
      "invFrames decrements each tick. When it reaches 0, print the expired line with sprite '@'. Do not print frames_left when expired — use the 'expired' format instead.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Lives and Respawn System",
    type: "game_builder",
    instructions: `# Game Builder: Lives and Respawn — The Safety Net

Death without consequence is boring. Death without recovery is frustrating. The lives system sits between those extremes. Three lives means three chances to learn the pattern. Invulnerability frames mean death does not chain into immediate re-death. The respawn position means a clean restart from safety. Together they create the retry loop that keeps players engaged.

## What Breaks Without This

Without lives, one collision ends the game. A 10-minute run destroyed by a single stray bullet. Without invulnerability, the player respawns into the same projectile swarm and dies instantly. Without the flash visual, the player cannot tell when they are safe. Each missing piece makes death feel unfair.

## The Fix

On player collision with enemy: decrement lives, teleport to spawn point, set invulnerability timer. During invulnerability, skip player collision checks and flash the sprite. When the timer expires, resume normal gameplay. At zero lives, trigger game over.

\\\`\\\`\\\`
// Death -> respawn -> invulnerable -> vulnerable
// lives: 3 -> 2 -> 1 -> 0 (game over)
// invFrames: 0 -> 10 -> 9 -> ... -> 0
\\\`\\\`\\\`

## Your Task

1. Player starts with 3 lives, invFrames = 0
2. Hit at tick 5: lives = 2, respawn (180,300), invFrames = 10
3. During invFrames: skip collision, flash '@' / '.'
4. invFrames decrements each tick, normal at 0
5. Hit at tick 20: lives = 1, respawn, invFrames = 10
6. Hit at tick 30: lives = 0, GAME OVER
7. Print: \\\`DEATH|tick|<t>|lives|<l>|respawn|(180,300)|inv_frames|10\\\`
8. Print: \\\`INVULN|tick|<t>|frames_left|<f>|sprite|<char>\\\`
9. Print: \\\`INVULN|tick|<t>|expired|sprite|@\\\`
10. Print: \\\`GAME_OVER|tick|30|lives|0|final_score|1500\\\`

## Beginner Trap

**Common Mistake:** Not resetting the player position on respawn. The player dies, invFrames is set, but the player stays at the death location — inside the enemy. When invuln expires, collision triggers immediately. Always teleport to the safe spawn point.

## Elite Insight

Ikaruga gave zero invulnerability on respawn but let the player switch polarity. Gradius stripped all power-ups on death, making the respawn feel like a new game. Contra gave generous invulnerability with a spread shot to fight back immediately. Each design choice shapes the emotional arc of death. Your 10-frame invuln is the arcade standard — brief mercy, then back to the fight.

## Cross-Path Echo

Database connection pools use the same retry pattern. A failed connection (death) gets returned to the pool (respawn). The pool waits a cooldown before reusing it (invulnerability). After the cooldown, the connection is tested and if healthy, returned to service (vulnerable). Three retries (lives) before the pool marks the connection as dead (game over).`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerX = 180, playerY = 300;
int lives = 3;
int invFrames = 0;
int score = 1500;
bool gameOver = false;

// TODO: Write onPlayerDeath(tick)
//   lives--, respawn at (180,300), invFrames=10
//   Print DEATH line
//   If lives <= 0: gameOver, print GAME_OVER

// TODO: Write tickInvuln(tick)
//   Decrement invFrames, flash sprite, print INVULN
//   When expired: print expired line

// TODO: Write isPlayerVulnerable() — returns true if invFrames == 0

int main() {
    // TODO: Simulate death/respawn cycle
    //   Hit at tick 5, tick invuln 6-15
    //   Hit at tick 20
    //   Hit at tick 30 (game over)

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 30;
int x[POOL_SIZE], y[POOL_SIZE];
int hp[POOL_SIZE], etype[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int playerX = 180, playerY = 300;
int lives = 3;
int invFrames = 0;
int score = 1500;
bool gameOver = false;

void onPlayerDeath(int tick) {
    lives--;
    playerX = 180;
    playerY = 300;
    invFrames = 10;

    cout << "DEATH|tick|" << tick << "|lives|" << lives
         << "|respawn|(180,300)|inv_frames|10" << endl;

    if (lives <= 0) {
        gameOver = true;
        cout << "GAME_OVER|tick|" << tick << "|lives|0|final_score|" << score << endl;
    }
}

void tickInvuln(int tick) {
    if (invFrames <= 0) return;
    invFrames--;
    if (invFrames == 0) {
        cout << "INVULN|tick|" << tick << "|expired|sprite|@" << endl;
    } else {
        char sprite = (invFrames % 2 == 0) ? '@' : '.';
        cout << "INVULN|tick|" << tick << "|frames_left|" << invFrames
             << "|sprite|" << sprite << endl;
    }
}

bool isPlayerVulnerable() {
    return invFrames == 0;
}

int main() {
    // Death at tick 5
    onPlayerDeath(5);

    // Tick invuln from 6 to 15
    tickInvuln(6);
    tickInvuln(15);

    // Death at tick 20
    onPlayerDeath(20);

    // Death at tick 30
    onPlayerDeath(30);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First death at tick 5", expectedOutput: "DEATH\\|tick\\|5\\|lives\\|2\\|respawn\\|\\(180,300\\)\\|inv_frames\\|10", isPattern: true },
      { id: "t2", description: "Invuln frame with flash sprite", expectedOutput: "INVULN\\|tick\\|6\\|frames_left\\|9\\|sprite\\|\\.", isPattern: true },
      { id: "t3", description: "Invuln expired", expectedOutput: "INVULN\\|tick\\|15\\|expired\\|sprite\\|@", isPattern: true },
      { id: "t4", description: "Second death at tick 20", expectedOutput: "DEATH\\|tick\\|20\\|lives\\|1\\|respawn\\|\\(180,300\\)\\|inv_frames\\|10", isPattern: true },
      { id: "t5", description: "Game over at tick 30", expectedOutput: "GAME_OVER\\|tick\\|30\\|lives\\|0\\|final_score\\|1500", isPattern: true },
    ],
    hints: [
      "Decrement lives first, then check if lives <= 0. The DEATH line always prints. The GAME_OVER line only prints when lives reaches 0.",
      "Sprite flash uses invFrames % 2. Odd = '.', even = '@'. At invFrames=9 (odd): '.'. At invFrames=8 (even): '@'. This gives a visible flicker.",
      "isPlayerVulnerable() returns true only when invFrames == 0. During invuln, the collision system should skip the player entity entirely.",
    ],
    estimatedMinutes: 10,
  },
};
