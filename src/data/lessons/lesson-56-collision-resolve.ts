import type { Lesson } from "@/types/lesson";

export const lesson56: Lesson = {
  id: "56-collision-resolve",
  title: "Collision Resolve",
  description: "Ensure bullets reliably kill enemies by resolving overlaps correctly.",
  order: 56,
  xpReward: 200,
  tier: "pro",
  concepts: ["collision resolution", "overlap correction", "push-out", "reliable kills"],
  part1: {
    title: "Concept: Collision Resolution Pipeline",
    type: "concept",
    instructions: `# Collision Resolution — Detection Is Not Enough

Detection tells you two entities overlap. Resolution tells you what to do about it. Without resolution, you know a bullet hit an enemy but nothing happens. Or two enemies stack on the same pixel. Detection is a boolean. Resolution is an action. The action depends on the collision type: bullet vs enemy is destruction. Enemy vs player is damage and push-out. Enemy vs enemy is separation.

## What Breaks Without This

Without resolution, collisions are detected but ignored. Bullets pass through enemies because nobody applied the damage. Enemies pile on top of the player because nobody pushed them apart. The player takes damage every frame instead of once because there is no invulnerability window. Detection without resolution is a sensor with no actuator.

## The Fix

A \\\`collisionResolve\\\` function that takes a collision pair and applies the correct response based on entity types:

\\\`\\\`\\\`
BULLET vs ENEMY:
  1. Destroy bullet (hp = 0)
  2. Apply damage to enemy (hp--)
  3. Check if enemy is dead (hp <= 0)
  4. If dead: mark for cleanup, spawn particles
  5. If alive: trigger flash

ENEMY vs PLAYER:
  1. Apply damage to player (hp -= enemyDamage)
  2. Push enemy back (y -= pushback)
  3. Set player invFrames = 60 (1 second at 60fps)
  4. During invFrames, skip further enemy-player collisions
\\\`\\\`\\\`

The key insight: resolution is type-dependent. A single \\\`resolve\\\` function dispatches based on the pair types. This keeps collision logic centralized instead of scattered across systems.

## Your Task

1. Create entities: player (hp=100), 3 enemies (hp=20 each), 2 bullets
2. Process 5 collision events in order:
   - bullet_0 hits enemy_2: bullet destroyed, enemy takes 10 damage, hp=10
   - bullet_1 hits enemy_0: bullet destroyed, enemy takes 10 damage, hp=10
   - enemy_1 contacts player: player takes 15 damage, hp=85, enemy pushed back 20
   - bullet_2 hits enemy_2 (spawned mid-frame): enemy takes 10 damage, hp=0, killed
   - enemy_0 contacts player: blocked by invFrames
3. Print per collision:
   - \\\`RESOLVE|bullet_0|enemy_2|type|BULLET_HIT|damage|10|enemy_hp|10|bullet|despawned\\\`
   - \\\`RESOLVE|bullet_1|enemy_0|type|BULLET_HIT|damage|10|enemy_hp|10|bullet|despawned\\\`
   - \\\`RESOLVE|enemy_1|player|type|ENEMY_CONTACT|damage|15|player_hp|85|pushback|20\\\`
   - \\\`RESOLVE|bullet_2|enemy_2|type|BULLET_HIT|damage|10|enemy_hp|0|bullet|despawned\\\`
   - \\\`RESOLVE|enemy_0|player|type|ENEMY_CONTACT|damage|0|player_hp|85|blocked|invincible\\\`
4. Print: \\\`RESOLVE_SUMMARY|frame|3|bullet_hits|3|contact_hits|2|kills|1|player_hp|85\\\`

Expected output:
\\\`\\\`\\\`
RESOLVE|bullet_0|enemy_2|type|BULLET_HIT|damage|10|enemy_hp|10|bullet|despawned
RESOLVE|bullet_1|enemy_0|type|BULLET_HIT|damage|10|enemy_hp|10|bullet|despawned
RESOLVE|enemy_1|player|type|ENEMY_CONTACT|damage|15|player_hp|85|pushback|20
RESOLVE|bullet_2|enemy_2|type|BULLET_HIT|damage|10|enemy_hp|0|bullet|despawned
RESOLVE|enemy_0|player|type|ENEMY_CONTACT|damage|0|player_hp|85|blocked|invincible
RESOLVE_SUMMARY|frame|3|bullet_hits|3|contact_hits|2|kills|1|player_hp|85
\\\`\\\`\\\`

Each collision pair gets the correct response. Bullets always die on hit. Enemies take damage per hit. Player contact sets invulnerability. Second contact during invulnerability is blocked.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int playerHp = 100;
int invFrames = 0;
int bulletHits = 0;
int contactHits = 0;
int totalKills = 0;

struct CollisionPair {
    string entityA;
    string entityB;
    string type;  // "BULLET_HIT" or "ENEMY_CONTACT"
    int damage;
};

// TODO: Write resolveBulletHit(pair, enemyHp)
//   Set bullet as despawned, apply damage to enemy
//   Print RESOLVE line
//   Return updated enemyHp

// TODO: Write resolveEnemyContact(pair, invFrames)
//   If invFrames > 0: print blocked line, return
//   Apply damage to player, set invFrames, print RESOLVE line

int main() {
    int enemyHp[] = {20, 20, 20};

    // TODO: Process 5 collision events in order
    //   Use resolveBulletHit and resolveEnemyContact
    //   Track bulletHits, contactHits, totalKills

    // TODO: Print RESOLVE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int playerHp = 100;
int invFrames = 0;
int bulletHits = 0;
int contactHits = 0;
int totalKills = 0;

void resolveBulletHit(string bulletName, string enemyName, int damage, int &enemyHp) {
    enemyHp -= damage;
    bulletHits++;
    cout << "RESOLVE|" << bulletName << "|" << enemyName
         << "|type|BULLET_HIT|damage|" << damage
         << "|enemy_hp|" << enemyHp << "|bullet|despawned" << endl;
    if (enemyHp <= 0) totalKills++;
}

void resolveEnemyContact(string enemyName, int damage, int pushback) {
    contactHits++;
    if (invFrames > 0) {
        cout << "RESOLVE|" << enemyName << "|player|type|ENEMY_CONTACT|damage|0|player_hp|"
             << playerHp << "|blocked|invincible" << endl;
        return;
    }
    playerHp -= damage;
    invFrames = 60;
    cout << "RESOLVE|" << enemyName << "|player|type|ENEMY_CONTACT|damage|" << damage
         << "|player_hp|" << playerHp << "|pushback|" << pushback << endl;
}

int main() {
    int enemyHp[] = {20, 20, 20};

    // Collision 1: bullet_0 hits enemy_2
    resolveBulletHit("bullet_0", "enemy_2", 10, enemyHp[2]);

    // Collision 2: bullet_1 hits enemy_0
    resolveBulletHit("bullet_1", "enemy_0", 10, enemyHp[0]);

    // Collision 3: enemy_1 contacts player
    resolveEnemyContact("enemy_1", 15, 20);

    // Collision 4: bullet_2 hits enemy_2 again
    resolveBulletHit("bullet_2", "enemy_2", 10, enemyHp[2]);

    // Collision 5: enemy_0 contacts player (blocked by invFrames)
    resolveEnemyContact("enemy_0", 15, 20);

    cout << "RESOLVE_SUMMARY|frame|3|bullet_hits|" << bulletHits
         << "|contact_hits|" << contactHits << "|kills|" << totalKills
         << "|player_hp|" << playerHp << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Bullet hit resolves with damage", expectedOutput: "RESOLVE\\|bullet_0\\|enemy_2\\|type\\|BULLET_HIT\\|damage\\|10\\|enemy_hp\\|10\\|bullet\\|despawned", isPattern: true },
      { id: "t2", description: "Enemy contact applies damage and pushback", expectedOutput: "RESOLVE\\|enemy_1\\|player\\|type\\|ENEMY_CONTACT\\|damage\\|15\\|player_hp\\|85\\|pushback\\|20", isPattern: true },
      { id: "t3", description: "Second bullet kills enemy", expectedOutput: "RESOLVE\\|bullet_2\\|enemy_2\\|type\\|BULLET_HIT\\|damage\\|10\\|enemy_hp\\|0\\|bullet\\|despawned", isPattern: true },
      { id: "t4", description: "Invincibility blocks second contact", expectedOutput: "RESOLVE\\|enemy_0\\|player\\|type\\|ENEMY_CONTACT\\|damage\\|0\\|player_hp\\|85\\|blocked\\|invincible", isPattern: true },
      { id: "t5", description: "Summary shows correct totals", expectedOutput: "RESOLVE_SUMMARY\\|frame\\|3\\|bullet_hits\\|3\\|contact_hits\\|2\\|kills\\|1\\|player_hp\\|85", isPattern: true },
    ],
    hints: [
      "Process collisions in order. Each collision modifies state that affects subsequent collisions. Enemy_2 takes 10 damage from bullet_0 (hp=10), then 10 more from bullet_2 (hp=0, killed).",
      "Invincibility frames are set on first enemy contact. The second contact checks invFrames > 0 and prints 'blocked' instead of applying damage. Player HP stays at 85.",
      "Pass enemyHp by reference so the damage accumulates. bullet_0 reduces enemy_2 from 20 to 10. bullet_2 reduces the same enemy from 10 to 0.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Collision Resolution System",
    type: "game_builder",
    instructions: `# Game Builder: Collision Resolution System

Detection finds overlaps. Resolution decides what happens. This system processes collision pairs and applies type-specific responses. Bullet vs enemy: destroy bullet, damage enemy, check kill, trigger flash. Enemy vs player: damage player, push enemy back, set invulnerability frames. The resolution function is the single place where collision consequences live. No damage logic scattered across systems. One function, all outcomes.

## Your Task

1. Create entity pool with player (hp=100), 3 enemies (hp=20, damage=15), bullets (damage=10)
2. Write \\\`collisionResolve\\\` that handles two collision types:
   - BULLET_HIT: destroy bullet (hp=0), damage enemy, check kill, flash if alive
   - ENEMY_CONTACT: damage player (if not invincible), push enemy back, set invFrames=60
3. Process 5 collision events in a single frame:
   - bullet_0 hits enemy_2: damage 10, enemy hp 10
   - bullet_1 hits enemy_0: damage 10, enemy hp 10
   - enemy_1 contacts player: damage 15, player hp 85, pushback 20
   - bullet_2 hits enemy_2: damage 10, enemy hp 0, killed
   - enemy_0 contacts player: blocked by invincibility
4. Print per collision:
   - \\\`RESOLVE|bullet_0|enemy_2|type|BULLET_HIT|damage|10|enemy_hp|10|bullet|despawned\\\`
   - \\\`RESOLVE|bullet_1|enemy_0|type|BULLET_HIT|damage|10|enemy_hp|10|bullet|despawned\\\`
   - \\\`RESOLVE|enemy_1|player|type|ENEMY_CONTACT|damage|15|player_hp|85|pushback|20\\\`
   - \\\`RESOLVE|bullet_2|enemy_2|type|BULLET_HIT|damage|10|enemy_hp|0|bullet|despawned\\\`
   - \\\`RESOLVE|enemy_0|player|type|ENEMY_CONTACT|damage|0|player_hp|85|blocked|invincible\\\`
5. Print: \\\`RESOLVE_SUMMARY|frame|3|bullet_hits|3|contact_hits|2|kills|1|player_hp|85\\\`

## Beginner Trap

**Common Mistake:** Applying damage in the detection loop instead of a separate resolution step. If you damage during detection, you might kill an entity mid-loop and skip checking its other collisions. Detect all pairs first, then resolve them in order. Or resolve immediately but skip dead entities in subsequent checks.

## Elite Insight

Physics engines separate detection (broad phase, narrow phase) from resolution (constraint solving, impulse application). Box2D runs detection to find contact pairs, then iterates resolution multiple times to converge on stable positions. Your bullet-enemy resolution is a single-iteration solver. The architecture is identical — only the iteration count differs.

## Cross-Path Echo

Database transactions follow the same pattern. A query detects matching rows (SELECT). Resolution applies the change (UPDATE/DELETE). The transaction ensures atomicity — all changes apply or none do. Your collision resolution is a transaction: detect the pair, apply the consequences, commit the state change.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int playerHp = 100;
int invFrames = 0;
int bulletHits = 0;
int contactHits = 0;
int totalKills = 0;

// TODO: Write resolveBulletHit(bulletName, enemyName, damage, enemyHp)
//   Destroy bullet, apply damage, track kills
//   Print RESOLVE line

// TODO: Write resolveEnemyContact(enemyName, damage, pushback)
//   Check invFrames — if > 0, print blocked
//   Otherwise: apply damage, set invFrames=60, print RESOLVE line

int main() {
    int enemyHp[] = {20, 20, 20};

    // TODO: Process 5 collision events
    //   1. bullet_0 vs enemy_2 (BULLET_HIT, damage=10)
    //   2. bullet_1 vs enemy_0 (BULLET_HIT, damage=10)
    //   3. enemy_1 vs player (ENEMY_CONTACT, damage=15, pushback=20)
    //   4. bullet_2 vs enemy_2 (BULLET_HIT, damage=10)
    //   5. enemy_0 vs player (ENEMY_CONTACT, blocked)

    // TODO: Print RESOLVE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int playerHp = 100;
int invFrames = 0;
int bulletHits = 0;
int contactHits = 0;
int totalKills = 0;

void resolveBulletHit(string bulletName, string enemyName, int damage, int &enemyHp) {
    enemyHp -= damage;
    bulletHits++;
    cout << "RESOLVE|" << bulletName << "|" << enemyName
         << "|type|BULLET_HIT|damage|" << damage
         << "|enemy_hp|" << enemyHp << "|bullet|despawned" << endl;
    if (enemyHp <= 0) totalKills++;
}

void resolveEnemyContact(string enemyName, int damage, int pushback) {
    contactHits++;
    if (invFrames > 0) {
        cout << "RESOLVE|" << enemyName << "|player|type|ENEMY_CONTACT|damage|0|player_hp|"
             << playerHp << "|blocked|invincible" << endl;
        return;
    }
    playerHp -= damage;
    invFrames = 60;
    cout << "RESOLVE|" << enemyName << "|player|type|ENEMY_CONTACT|damage|" << damage
         << "|player_hp|" << playerHp << "|pushback|" << pushback << endl;
}

int main() {
    int enemyHp[] = {20, 20, 20};

    resolveBulletHit("bullet_0", "enemy_2", 10, enemyHp[2]);
    resolveBulletHit("bullet_1", "enemy_0", 10, enemyHp[0]);
    resolveEnemyContact("enemy_1", 15, 20);
    resolveBulletHit("bullet_2", "enemy_2", 10, enemyHp[2]);
    resolveEnemyContact("enemy_0", 15, 20);

    cout << "RESOLVE_SUMMARY|frame|3|bullet_hits|" << bulletHits
         << "|contact_hits|" << contactHits << "|kills|" << totalKills
         << "|player_hp|" << playerHp << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Bullet hit applies damage correctly", expectedOutput: "RESOLVE\\|bullet_0\\|enemy_2\\|type\\|BULLET_HIT\\|damage\\|10\\|enemy_hp\\|10\\|bullet\\|despawned", isPattern: true },
      { id: "t2", description: "Enemy contact damages player", expectedOutput: "RESOLVE\\|enemy_1\\|player\\|type\\|ENEMY_CONTACT\\|damage\\|15\\|player_hp\\|85\\|pushback\\|20", isPattern: true },
      { id: "t3", description: "Kill detected when enemy hp reaches 0", expectedOutput: "RESOLVE\\|bullet_2\\|enemy_2\\|type\\|BULLET_HIT\\|damage\\|10\\|enemy_hp\\|0\\|bullet\\|despawned", isPattern: true },
      { id: "t4", description: "Invincibility blocks contact damage", expectedOutput: "RESOLVE\\|enemy_0\\|player\\|type\\|ENEMY_CONTACT\\|damage\\|0\\|player_hp\\|85\\|blocked\\|invincible", isPattern: true },
      { id: "t5", description: "Summary totals correct", expectedOutput: "RESOLVE_SUMMARY\\|frame\\|3\\|bullet_hits\\|3\\|contact_hits\\|2\\|kills\\|1\\|player_hp\\|85", isPattern: true },
    ],
    hints: [
      "Process collisions sequentially. Enemy_2 starts at hp=20. After bullet_0: hp=10. After bullet_2: hp=0. The kill counter increments when hp drops to 0 or below.",
      "Invincibility check comes first in resolveEnemyContact. If invFrames > 0, print the blocked line and return immediately. Do not modify playerHp.",
      "Pass enemyHp by reference (&enemyHp) so damage accumulates across multiple hits to the same enemy. Each bullet hit reduces hp by 10.",
    ],
    estimatedMinutes: 10,
  },
};
