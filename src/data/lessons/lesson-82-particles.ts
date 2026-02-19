import type { Lesson } from "@/types/lesson";

export const lesson82: Lesson = {
  id: "82-particles",
  title: "Particles v1",
  description: "Spawn explosion particles on enemy death for visual impact.",
  order: 82,
  xpReward: 200,
  tier: "pro",
  concepts: ["particle system", "explosion effect", "particle lifetime", "visual effects"],
  part1: {
    title: "Concept: Particles v1",
    type: "concept",
    instructions: `# Particles v1 — Explosions That Prove Something Died

An enemy vanishes. Where did it go? Without particles, it simply stops existing. With particles, it explodes into fragments that fly outward and fade. The player sees destruction. The brain registers impact. Particles are tiny entities with position, velocity, and lifetime. They are born in bursts, move in straight lines, and die after a few frames. No collision. No game logic. Pure visual feedback.

## What Breaks Without This

Without death particles, enemies pop out of existence. The player gets no visual confirmation beyond the sprite disappearing. In fast gameplay, small enemies can die without the player even noticing. Particles mark the death location with a brief visual event. They say "something happened here." Without that marker, kills blend into the background.

## The Fix

A Particle struct: x, y, vx, vy, lifetime, display char. On enemy death, call spawnExplosion(x, y, count). It creates N particles at the death location with random velocities. Each frame, particles move and their lifetime decrements. When lifetime hits zero, the particle is dead. Dead particles are skipped during rendering.

\\\`\\\`\\\`
struct Particle {
    int x, y;
    int vx, vy;
    int lifetime;
    char ch;
    bool active;
};

void spawnExplosion(int cx, int cy, int count) {
    for (int i = 0; i < count; i++) {
        // Random velocity in [-3, 3] range
        // Lifetime 3-4 frames
        // Cycle through chars: '*', '+', '.', 'o'
    }
}
\\\`\\\`\\\`

The particle pool is fixed-size. Reuse dead particles for new explosions. This prevents allocation during gameplay — critical for frame rate stability.

## Your Task

1. Define Particle struct: x, y, vx, vy, lifetime, ch, active
2. Create a fixed pool of 32 particles, all initially inactive
3. spawnExplosion(x, y, count=8): activate 8 particles with random velocities
4. Particles use chars cycling: '*', '+', '.', 'o'
5. Velocities: vx = (rand()%7) - 3, vy = (rand()%7) - 3. Lifetime = 4
6. Kill enemy at (200, 80) on frame 1: spawn 8 particles
7. Run 4 frames of simulation: move particles, decrement lifetime, deactivate dead
8. Print: \\\`PARTICLE|spawn|frame|1|count|8|at|(200,80)\\\`
9. Print per active particle on frame 2: \\\`PARTICLE|frame|2|id|p0|pos|(<x>,<y>)|life|3|char|*\\\`
10. Print: \\\`PARTICLE|frame|4|alive|<n>|dead|<n>|total_spawned|8\\\`
11. Print: \\\`PARTICLE_SUMMARY|explosions|1|particles_spawned|8|peak_active|8\\\`

Expected output:
\\\`\\\`\\\`
PARTICLE|spawn|frame|1|count|8|at|(200,80)
PARTICLE|frame|2|id|p0|pos|(<x>,<y>)|life|3|char|*
PARTICLE|frame|2|id|p1|pos|(<x>,<y>)|life|3|char|+
...
PARTICLE|frame|4|alive|<n>|dead|<n>|total_spawned|8
PARTICLE_SUMMARY|explosions|1|particles_spawned|8|peak_active|8
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Allocating particles with new/malloc during gameplay. Every explosion allocates. Every frame frees dead particles. Allocation and deallocation during the game loop causes memory fragmentation and GC pauses. Use a fixed-size pool. Mark particles active/inactive. Scan for the first inactive slot when spawning. Zero allocations during gameplay.

## Elite Insight

Particle systems in commercial engines use structure-of-arrays, not array-of-structs. Instead of Particle[1000], you have x[1000], y[1000], vx[1000], vy[1000]. This layout lets the CPU process all x-coordinates in one cache-friendly pass, then all y-coordinates. For 1000+ particles, the cache performance difference is measurable. Your struct-based approach works perfectly for 32 particles.

## Cross-Path Echo

Log aggregation systems work like particle pools. Log entries are created (spawned), exist for a retention period (lifetime), and are purged when expired (deactivated). A log rotation policy is the decay function. The pool size is the disk quota. Both systems manage ephemeral data with fixed resources and time-based expiration.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_PARTICLES = 32;

struct Particle {
    int x, y;
    int vx, vy;
    int lifetime;
    char ch;
    bool active;
};

Particle particles[MAX_PARTICLES];
int totalSpawned = 0;
int explosionCount = 0;
int peakActive = 0;

char particleChars[] = {'*', '+', '.', 'o'};

// TODO: Write spawnExplosion(cx, cy, count)
//   Find inactive particles, set x=cx, y=cy
//   vx = (rand()%7)-3, vy = (rand()%7)-3
//   lifetime = 4, ch = particleChars[i % 4]
//   Increment totalSpawned and explosionCount

// TODO: Write updateParticles()
//   For each active particle: x += vx, y += vy, lifetime--
//   If lifetime <= 0: active = false

// TODO: Write countActive() — count active particles

int main() {
    srand(42);

    // Initialize all particles as inactive
    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }

    // TODO: Frame 1: spawn explosion at (200, 80) with 8 particles
    //   Print: PARTICLE|spawn|frame|1|count|8|at|(200,80)

    // TODO: Frames 2-4: update particles, print status
    //   Frame 2: print each active particle
    //   Frame 4: print alive/dead counts
    //   Print PARTICLE_SUMMARY at end

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_PARTICLES = 32;

struct Particle {
    int x, y;
    int vx, vy;
    int lifetime;
    char ch;
    bool active;
};

Particle particles[MAX_PARTICLES];
int totalSpawned = 0;
int explosionCount = 0;
int peakActive = 0;

char particleChars[] = {'*', '+', '.', 'o'};

void spawnExplosion(int cx, int cy, int count) {
    int spawned = 0;
    for (int i = 0; i < MAX_PARTICLES && spawned < count; i++) {
        if (!particles[i].active) {
            particles[i].x = cx;
            particles[i].y = cy;
            particles[i].vx = (rand() % 7) - 3;
            particles[i].vy = (rand() % 7) - 3;
            particles[i].lifetime = 4;
            particles[i].ch = particleChars[spawned % 4];
            particles[i].active = true;
            spawned++;
            totalSpawned++;
        }
    }
    explosionCount++;
}

void updateParticles() {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) continue;
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].lifetime--;
        if (particles[i].lifetime <= 0) {
            particles[i].active = false;
        }
    }
}

int countActive() {
    int c = 0;
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].active) c++;
    }
    if (c > peakActive) peakActive = c;
    return c;
}

int main() {
    srand(42);

    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }

    // Frame 1: spawn explosion
    spawnExplosion(200, 80, 8);
    int active = countActive();
    cout << "PARTICLE|spawn|frame|1|count|8|at|(200,80)" << endl;

    // Frames 2-4: simulate
    for (int frame = 2; frame <= 4; frame++) {
        updateParticles();
        active = countActive();

        if (frame == 2) {
            int pid = 0;
            for (int i = 0; i < MAX_PARTICLES; i++) {
                if (!particles[i].active) continue;
                cout << "PARTICLE|frame|2|id|p" << pid
                     << "|pos|(" << particles[i].x << "," << particles[i].y
                     << ")|life|" << particles[i].lifetime
                     << "|char|" << particles[i].ch << endl;
                pid++;
            }
        }

        if (frame == 4) {
            int dead = totalSpawned - active;
            cout << "PARTICLE|frame|4|alive|" << active
                 << "|dead|" << dead
                 << "|total_spawned|" << totalSpawned << endl;
        }
    }

    cout << "PARTICLE_SUMMARY|explosions|" << explosionCount
         << "|particles_spawned|" << totalSpawned
         << "|peak_active|" << peakActive << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Explosion spawned", expectedOutput: "PARTICLE\\|spawn\\|frame\\|1\\|count\\|8\\|at\\|\\(200,80\\)", isPattern: true },
      { id: "t2", description: "Frame 2 particle p0", expectedOutput: "PARTICLE\\|frame\\|2\\|id\\|p0\\|pos\\|\\(-?\\d+,-?\\d+\\)\\|life\\|3\\|char\\|\\*", isPattern: true },
      { id: "t3", description: "Frame 2 particle p1", expectedOutput: "PARTICLE\\|frame\\|2\\|id\\|p1\\|pos\\|\\(-?\\d+,-?\\d+\\)\\|life\\|3\\|char\\|\\+", isPattern: true },
      { id: "t4", description: "Frame 4 alive count", expectedOutput: "PARTICLE\\|frame\\|4\\|alive\\|\\d+\\|dead\\|\\d+\\|total_spawned\\|8", isPattern: true },
      { id: "t5", description: "Particle summary", expectedOutput: "PARTICLE_SUMMARY\\|explosions\\|1\\|particles_spawned\\|8\\|peak_active\\|8", isPattern: true },
    ],
    hints: [
      "spawnExplosion scans the particle array for inactive slots. For each, set position to (cx,cy), random velocity with (rand()%7)-3, lifetime=4, char from cycling array. Track totalSpawned and explosionCount.",
      "updateParticles moves each active particle by its velocity and decrements lifetime. When lifetime hits 0, set active=false. On frame 2, particles have lifetime 3 (spawned with 4, decremented once).",
      "countActive iterates the array and counts active==true. Also update peakActive if current count exceeds it. On frame 4 after 3 updates, particles with lifetime 4 have 1 remaining — still alive. They die after frame 4's update.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Particles v1",
    type: "game_builder",
    instructions: `# Game Builder: Explosion Particles — Visual Death Feedback

Wire particles into the game's death system. When an enemy dies, spawn an explosion at its position. The particles fly outward for a few frames, cycling through display characters. The player sees a burst of fragments where the enemy was. This is the visual proof of destruction.

## What Breaks Without This

Without death particles, the game provides no spatial feedback for kills. In a fast-moving shooter, knowing where kills happened helps the player track combat flow. Particles mark kill locations like tracer rounds — brief, bright, informative.

## The Fix

In the collision system, when an enemy's HP drops to zero, call spawnExplosion at the enemy's position. The particle system runs in the update loop alongside movement, collision, and cleanup. Particles have no collision — they are purely visual.

\\\`\\\`\\\`
// In collision: if (hp[e] <= 0) spawnExplosion(x[e], y[e], 8);
// In update: updateParticles() — move and age all active particles
// In render: draw active particles using their char
\\\`\\\`\\\`

## Your Task

1. Particle struct with x, y, vx, vy, lifetime, ch, active
2. Pool of 32 particles, all initially inactive
3. spawnExplosion(x, y, 8): random velocities, lifetime=4, cycling chars
4. Kill enemy at (200,80) on frame 1: spawn 8 particles
5. Simulate 4 frames: move, age, deactivate dead particles
6. Print: \\\`PARTICLE|spawn|frame|1|count|8|at|(200,80)\\\`
7. Print frame 2 particles: \\\`PARTICLE|frame|2|id|p0|pos|(<x>,<y>)|life|3|char|*\\\`
8. Print: \\\`PARTICLE|frame|4|alive|<n>|dead|<n>|total_spawned|8\\\`
9. Print: \\\`PARTICLE_SUMMARY|explosions|1|particles_spawned|8|peak_active|8\\\`

## Beginner Trap

**Common Mistake:** Not cycling the particle characters. All particles showing '*' looks like a blob. Cycling through '*', '+', '.', 'o' gives visual variety even in ASCII. Each particle gets a character based on its spawn index mod 4.

## Elite Insight

The particle count per explosion is a tuning parameter, not a design constant. 4 particles feels sparse. 8 feels solid. 16 feels heavy. 32 feels explosive. The engine should handle any count — the designer picks the number. Your pool size (32) limits the total active particles, not the per-explosion count. If two enemies die simultaneously, both explosions share the pool.

## Cross-Path Echo

Event-driven architectures spawn handlers the same way. An event fires. N handlers activate. Each handler processes independently and terminates when done. The event bus is the particle pool. Dead handlers free their resources. The pattern is identical: burst creation, independent processing, automatic cleanup.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_PARTICLES = 32;

struct Particle {
    int x, y;
    int vx, vy;
    int lifetime;
    char ch;
    bool active;
};

Particle particles[MAX_PARTICLES];
int totalSpawned = 0;
int explosionCount = 0;
int peakActive = 0;

char particleChars[] = {'*', '+', '.', 'o'};

// TODO: Write spawnExplosion(cx, cy, count)
//   Find inactive slots, set random velocity and lifetime

// TODO: Write updateParticles()
//   Move, decrement lifetime, deactivate dead

// TODO: Write countActive()

int main() {
    srand(42);

    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }

    // TODO: Frame 1: spawn explosion at (200, 80)
    // TODO: Frames 2-4: update and print particle status
    // TODO: Print PARTICLE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int MAX_PARTICLES = 32;

struct Particle {
    int x, y;
    int vx, vy;
    int lifetime;
    char ch;
    bool active;
};

Particle particles[MAX_PARTICLES];
int totalSpawned = 0;
int explosionCount = 0;
int peakActive = 0;

char particleChars[] = {'*', '+', '.', 'o'};

void spawnExplosion(int cx, int cy, int count) {
    int spawned = 0;
    for (int i = 0; i < MAX_PARTICLES && spawned < count; i++) {
        if (!particles[i].active) {
            particles[i].x = cx;
            particles[i].y = cy;
            particles[i].vx = (rand() % 7) - 3;
            particles[i].vy = (rand() % 7) - 3;
            particles[i].lifetime = 4;
            particles[i].ch = particleChars[spawned % 4];
            particles[i].active = true;
            spawned++;
            totalSpawned++;
        }
    }
    explosionCount++;
}

void updateParticles() {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) continue;
        particles[i].x += particles[i].vx;
        particles[i].y += particles[i].vy;
        particles[i].lifetime--;
        if (particles[i].lifetime <= 0) {
            particles[i].active = false;
        }
    }
}

int countActive() {
    int c = 0;
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].active) c++;
    }
    if (c > peakActive) peakActive = c;
    return c;
}

int main() {
    srand(42);

    for (int i = 0; i < MAX_PARTICLES; i++) {
        particles[i].active = false;
    }

    // Frame 1: spawn explosion
    spawnExplosion(200, 80, 8);
    int active = countActive();
    cout << "PARTICLE|spawn|frame|1|count|8|at|(200,80)" << endl;

    // Frames 2-4: simulate
    for (int frame = 2; frame <= 4; frame++) {
        updateParticles();
        active = countActive();

        if (frame == 2) {
            int pid = 0;
            for (int i = 0; i < MAX_PARTICLES; i++) {
                if (!particles[i].active) continue;
                cout << "PARTICLE|frame|2|id|p" << pid
                     << "|pos|(" << particles[i].x << "," << particles[i].y
                     << ")|life|" << particles[i].lifetime
                     << "|char|" << particles[i].ch << endl;
                pid++;
            }
        }

        if (frame == 4) {
            int dead = totalSpawned - active;
            cout << "PARTICLE|frame|4|alive|" << active
                 << "|dead|" << dead
                 << "|total_spawned|" << totalSpawned << endl;
        }
    }

    cout << "PARTICLE_SUMMARY|explosions|" << explosionCount
         << "|particles_spawned|" << totalSpawned
         << "|peak_active|" << peakActive << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Explosion spawned", expectedOutput: "PARTICLE\\|spawn\\|frame\\|1\\|count\\|8\\|at\\|\\(200,80\\)", isPattern: true },
      { id: "t2", description: "Frame 2 particle p0", expectedOutput: "PARTICLE\\|frame\\|2\\|id\\|p0\\|pos\\|\\(-?\\d+,-?\\d+\\)\\|life\\|3\\|char\\|\\*", isPattern: true },
      { id: "t3", description: "Frame 4 status", expectedOutput: "PARTICLE\\|frame\\|4\\|alive\\|\\d+\\|dead\\|\\d+\\|total_spawned\\|8", isPattern: true },
      { id: "t4", description: "Particle summary", expectedOutput: "PARTICLE_SUMMARY\\|explosions\\|1\\|particles_spawned\\|8\\|peak_active\\|8", isPattern: true },
    ],
    hints: [
      "spawnExplosion iterates the pool looking for inactive slots. Set each particle's position to (cx,cy), random velocity with (rand()%7)-3 for both vx and vy, lifetime=4, and cycling character. Count spawned to stop at the requested count.",
      "updateParticles processes every active particle: add velocity to position, decrement lifetime. If lifetime <= 0, set active=false. After one update, lifetime goes from 4 to 3. After four updates, lifetime is 0 and particle deactivates.",
      "countActive loops through the pool counting active particles. Update peakActive if the current count exceeds it. Peak should be 8 since all particles spawn at once on frame 1.",
    ],
    estimatedMinutes: 10,
  },
};
