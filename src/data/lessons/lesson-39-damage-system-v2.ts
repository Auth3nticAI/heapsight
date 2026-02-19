import type { Lesson } from "@/types/lesson";

export const lesson39: Lesson = {
  id: "39-damage-system-v2",
  title: "Damage System v2",
  description: "Bullets damage enemies on collision then despawn automatically.",
  order: 39,
  xpReward: 175,
  tier: "pro",
  concepts: ["collision response", "damage application", "entity lifecycle", "system chaining", "despawn"],
  part1: {
    title: "Concept: Collision Response Chain",
    type: "concept",
    instructions: `# Collision Response Chain — Detect, Damage, Die, Cleanup

Collision detection tells you two entities overlap. That is only step one. What happens next is the collision response chain: apply an effect, check consequences, and handle lifecycle. A bullet hits an enemy. The enemy takes damage. The bullet despawns. If the enemy's HP drops to zero, the enemy dies too. Each step feeds the next.

## The Chain

\\\`\\\`\\\`
1. Detect collision (bullet overlaps enemy)
2. Apply damage (enemy.hp -= bullet.damage)
3. Despawn bullet (bullet.alive = false)
4. Check death (if enemy.hp <= 0, enemy.alive = false)
5. Record event (log kill position, increment counter)
\\\`\\\`\\\`

Every step in this chain is a separate concern. Detection is geometry. Damage is arithmetic. Despawn is lifecycle. Death check is a conditional. Recording is bookkeeping. Mixing them together creates spaghetti. Keeping them as distinct steps in a pipeline creates clarity.

## Your Task

1. Create arrays for 4 entities: \\\`hp[4]\\\`, \\\`damage[4]\\\`, \\\`alive[4]\\\`, \\\`type[4]\\\` (1=bullet, 2=enemy)
2. Entities: bullet_0 (hp=1, damage=15), bullet_1 (hp=1, damage=15), enemy_0 (hp=30, damage=0), enemy_1 (hp=10, damage=0)
3. Define collision pairs: bullet_0 hits enemy_0, bullet_1 hits enemy_1
4. For each collision pair, execute the chain:
   a. Print: \\\`HIT|<bullet>|<enemy>|damage|<dmg>|enemy_hp|<remaining>\\\`
   b. Set bullet alive = false, print: \\\`DESPAWN|<bullet>|reason|hit\\\`
   c. If enemy hp <= 0: set alive = false, print: \\\`KILL|<enemy>|hp_was|<original_hp>\\\`
5. Print: \\\`CHAIN_SUMMARY|hits|<n>|kills|<n>|despawned|<n>\\\`

Expected output:
\\\`\\\`\\\`
HIT|bullet_0|enemy_0|damage|15|enemy_hp|15
DESPAWN|bullet_0|reason|hit
HIT|bullet_1|enemy_1|damage|15|enemy_hp|-5
DESPAWN|bullet_1|reason|hit
KILL|enemy_1|hp_was|10
CHAIN_SUMMARY|hits|2|kills|1|despawned|2
\\\`\\\`\\\`

Bullet_0 hits enemy_0 for 15 damage, leaving 15 HP — enemy survives. Bullet_1 hits enemy_1 for 15 damage, leaving -5 HP — enemy dies.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    const int COUNT = 4;
    int hp[] = {1, 1, 30, 10};
    int damage[] = {15, 15, 0, 0};
    bool alive[] = {true, true, true, true};
    int type[] = {1, 1, 2, 2};  // 1=bullet, 2=enemy
    string names[] = {"bullet_0", "bullet_1", "enemy_0", "enemy_1"};

    // Collision pairs: (bullet_index, enemy_index)
    int pairs[][2] = {{0, 2}, {1, 3}};
    int numPairs = 2;

    int hits = 0, kills = 0, despawned = 0;

    // TODO: For each collision pair:
    //   1. Apply bullet damage to enemy hp
    //   2. Print HIT line with damage and remaining hp
    //   3. Set bullet alive=false, print DESPAWN
    //   4. If enemy hp <= 0, set alive=false, print KILL
    //   5. Track hits, kills, despawned counts

    // TODO: Print CHAIN_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    const int COUNT = 4;
    int hp[] = {1, 1, 30, 10};
    int damage[] = {15, 15, 0, 0};
    bool alive[] = {true, true, true, true};
    int type[] = {1, 1, 2, 2};
    string names[] = {"bullet_0", "bullet_1", "enemy_0", "enemy_1"};

    int pairs[][2] = {{0, 2}, {1, 3}};
    int numPairs = 2;

    int hits = 0, kills = 0, despawned = 0;

    for (int p = 0; p < numPairs; p++) {
        int b = pairs[p][0];
        int e = pairs[p][1];

        if (!alive[b] || !alive[e]) continue;

        hp[e] -= damage[b];
        hits++;
        cout << "HIT|" << names[b] << "|" << names[e]
             << "|damage|" << damage[b]
             << "|enemy_hp|" << hp[e] << endl;

        alive[b] = false;
        despawned++;
        cout << "DESPAWN|" << names[b] << "|reason|hit" << endl;

        if (hp[e] <= 0) {
            alive[e] = false;
            kills++;
            cout << "KILL|" << names[e] << "|hp_was|"
                 << (hp[e] + damage[b]) << endl;
        }
    }

    cout << "CHAIN_SUMMARY|hits|" << hits
         << "|kills|" << kills
         << "|despawned|" << despawned << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Bullet 0 hits enemy 0 for 15 damage", expectedOutput: "HIT|bullet_0|enemy_0|damage|15|enemy_hp|15" },
      { id: "t2", description: "Bullet 0 despawns on hit", expectedOutput: "DESPAWN|bullet_0|reason|hit" },
      { id: "t3", description: "Bullet 1 hits enemy 1, overkill", expectedOutput: "HIT|bullet_1|enemy_1|damage|15|enemy_hp|-5" },
      { id: "t4", description: "Enemy 1 killed", expectedOutput: "KILL|enemy_1|hp_was|10" },
      { id: "t5", description: "Summary: 2 hits, 1 kill, 2 despawned", expectedOutput: "CHAIN_SUMMARY|hits|2|kills|1|despawned|2" },
    ],
    hints: [
      "For each pair, get the bullet index b and enemy index e. Apply damage: `hp[e] -= damage[b]`. The remaining HP can go negative — that is fine.",
      "Always despawn the bullet after a hit by setting `alive[b] = false`. The bullet is single-use regardless of whether it kills the enemy.",
      "To print hp_was (original HP), compute it as `hp[e] + damage[b]` since you already subtracted the damage. Enemy_1 had 10 HP originally.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Damage & Despawn Pipeline",
    type: "game_builder",
    instructions: `# Game Builder: Damage & Despawn Pipeline

Build the damageSystem that processes bullet-enemy collisions, applies damage, despawns spent bullets, and records kills. This system bridges collision detection and cleanup — it is the part that makes the game actually respond to player actions.

## Your Task
1. SoA arrays for 8 entities: x[], y[], hp[], damage[], type[] (1=bullet, 2=enemy), alive[]
2. Spawn 5 bullets: indices 0-4, x=200, y=250/230/210/190/170, hp=1, damage=10
3. Spawn 3 enemies: index 5 at (200,60) hp=30, index 6 at (180,80) hp=10, index 7 at (220,70) hp=20
4. Write \\\`damageSystem(count, frame)\\\` that iterates all bullet-enemy pairs:
   - Collision: if both alive and \\\`abs(x[b]-x[e]) < 20 && abs(y[b]-y[e]) < 20\\\`
   - On hit: hp[e] -= damage[b], set alive[b]=false
   - Print: \\\`HIT|bullet_<b>|enemy_<e>|damage|<d>|enemy_hp|<remaining>\\\`
   - If enemy hp <= 0: alive[e]=false, print: \\\`KILL|enemy_<e>|position|<x>,<y>|frame|<f>\\\`
   - Print: \\\`DESPAWN|bullet_<b>|reason|hit\\\`
5. Simulate 3 frames. Each frame: move bullets up by 20 (y -= 20), move enemies down by 10 (y += 10), then run damageSystem
6. After each frame print: \\\`FRAME|<f>|alive_bullets|<n>|alive_enemies|<n>\\\`
7. After all frames: \\\`DAMAGE_SUMMARY|hits|<n>|kills|<n>|bullets_spent|<n>\\\`

## Beginner Trap

**Common Mistake:** Forgetting to break after a bullet hits an enemy. A bullet should only hit one target. Without the break, a single bullet damages every enemy it overlaps. This creates phantom multi-hits that drain enemy HP incorrectly and make debugging impossible.

## Elite Insight

The damage system does not allocate or deallocate. It flips boolean flags. \\\`alive[b] = false\\\` is a single store instruction. The actual memory reclamation happens in the cleanup system later. This separation means the damage system can run without worrying about invalidating indices mid-iteration. Process everything, mark the dead, clean up later. Two passes are cheaper than one careful pass.

## Cross-Path Echo

Event sourcing in backend systems follows the same pattern. Record what happened (HIT, KILL, DESPAWN) as events. The current state is derived from replaying those events. If a bug corrupts state, you replay the event log to reconstruct it. The damage system is writing an event log.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int damage[MAX_ENTITIES];
int type[MAX_ENTITIES];  // 1=bullet, 2=enemy
bool alive[MAX_ENTITIES];

// TODO: Write damageSystem(count, frame)
//       For each alive bullet, check against each alive enemy
//       Collision: abs(x[b]-x[e]) < 20 && abs(y[b]-y[e]) < 20
//       On hit: apply damage, despawn bullet, check kill

int main() {
    // TODO: Spawn 5 bullets at indices 0-4
    //       x=200, y=250,230,210,190,170, hp=1, damage=10

    // TODO: Spawn 3 enemies at indices 5-7
    //       (200,60) hp=30, (180,80) hp=10, (220,70) hp=20

    int count = 8;

    // TODO: Simulate 3 frames
    //   Each frame: move bullets (y-=20), move enemies (y+=10)
    //   Run damageSystem, print FRAME summary

    // TODO: Print DAMAGE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int hp[MAX_ENTITIES];
int damage[MAX_ENTITIES];
int type[MAX_ENTITIES];
bool alive[MAX_ENTITIES];

int totalHits = 0;
int totalKills = 0;
int bulletsSpent = 0;

void damageSystem(int count, int frame) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 20 && dy < 20) {
                hp[e] -= damage[b];
                totalHits++;
                cout << "HIT|bullet_" << b << "|enemy_" << e
                     << "|damage|" << damage[b]
                     << "|enemy_hp|" << hp[e] << endl;
                if (hp[e] <= 0) {
                    alive[e] = false;
                    totalKills++;
                    cout << "KILL|enemy_" << e << "|position|"
                         << x[e] << "," << y[e]
                         << "|frame|" << frame << endl;
                }
                alive[b] = false;
                bulletsSpent++;
                cout << "DESPAWN|bullet_" << b << "|reason|hit" << endl;
                break;
            }
        }
    }
}

int main() {
    for (int i = 0; i < 5; i++) {
        x[i] = 200;
        y[i] = 250 - i * 20;
        hp[i] = 1;
        damage[i] = 10;
        type[i] = 1;
        alive[i] = true;
    }

    x[5] = 200; y[5] = 60; hp[5] = 30; damage[5] = 0; type[5] = 2; alive[5] = true;
    x[6] = 180; y[6] = 80; hp[6] = 10; damage[6] = 0; type[6] = 2; alive[6] = true;
    x[7] = 220; y[7] = 70; hp[7] = 20; damage[7] = 0; type[7] = 2; alive[7] = true;

    int count = 8;

    for (int frame = 1; frame <= 3; frame++) {
        for (int i = 0; i < count; i++) {
            if (!alive[i]) continue;
            if (type[i] == 1) y[i] -= 20;
            if (type[i] == 2) y[i] += 10;
        }

        damageSystem(count, frame);

        int aliveBullets = 0, aliveEnemies = 0;
        for (int i = 0; i < count; i++) {
            if (!alive[i]) continue;
            if (type[i] == 1) aliveBullets++;
            if (type[i] == 2) aliveEnemies++;
        }
        cout << "FRAME|" << frame << "|alive_bullets|" << aliveBullets
             << "|alive_enemies|" << aliveEnemies << endl;
    }

    cout << "DAMAGE_SUMMARY|hits|" << totalHits
         << "|kills|" << totalKills
         << "|bullets_spent|" << bulletsSpent << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show HIT events", expectedOutput: "HIT\\|bullet_\\d+\\|enemy_\\d+\\|damage\\|10\\|enemy_hp\\|\\d+", isPattern: true },
      { id: "t2", description: "Should show KILL events", expectedOutput: "KILL\\|enemy_\\d+\\|position\\|\\d+,\\d+\\|frame\\|\\d+", isPattern: true },
      { id: "t3", description: "Should show DESPAWN for spent bullets", expectedOutput: "DESPAWN\\|bullet_\\d+\\|reason\\|hit", isPattern: true },
      { id: "t4", description: "Should show frame summaries", expectedOutput: "FRAME\\|\\d+\\|alive_bullets\\|\\d+\\|alive_enemies\\|\\d+", isPattern: true },
      { id: "t5", description: "Should show damage summary", expectedOutput: "DAMAGE_SUMMARY\\|hits\\|\\d+\\|kills\\|\\d+\\|bullets_spent\\|\\d+", isPattern: true },
    ],
    hints: [
      "Bullets move y -= 20 per frame, enemies move y += 10. They approach each other. Collision checks `abs(x[b]-x[e]) < 20 && abs(y[b]-y[e]) < 20`.",
      "After a bullet hits, `break` out of the inner enemy loop. One bullet, one hit. Set `alive[b] = false` and increment bulletsSpent.",
      "Track totalHits, totalKills, and bulletsSpent as globals. The damageSystem updates them directly. Print the summary after all frames.",
    ],
    estimatedMinutes: 10,
  },
};
