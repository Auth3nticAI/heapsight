import type { GameLessonVariant } from "@/types/game";

export const lesson20SpaceShooter: GameLessonVariant = {
  lessonId: "20-effects",
  instructions: `# Particle System — Transient Entity Spawning\n\nWhen an enemy is destroyed, we want a visual explosion effect. In an ECS, particles are just **transient entities** — they spawn, render once, and are immediately removed.\n\n## Concepts\n- Particles as short-lived entities in the ECS\n- Spawning multiple entities from a single event\n- Lifecycle components (entities that exist for one frame)\n\n## Your Task\n1. Create an enemy entity at position (200, 100) with size 22x22\n2. "Destroy" the enemy (don't render it)\n3. Spawn **4 particle entities** at offsets around the death position:\n   - particle1 at (190, 90) — top-left\n   - particle2 at (210, 90) — top-right\n   - particle3 at (190, 110) — bottom-left\n   - particle4 at (210, 110) — bottom-right\n4. Each particle is size 6x6, type "particle"\n5. Output a GAME_MESSAGE about the explosion\n6. Output the SCORE\n\n## Protocol Reminder\n\`\`\`\nENTITY|id|type|x|y|width|height\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    bool alive;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height << endl;
}

// Write spawnParticles function:
// Takes death position (dx, dy) and spawns 4 particle entities at offsets
// Offsets: (-10,-10), (+10,-10), (-10,+10), (+10,+10)

int main() {
    Entity enemy = {"enemy1", "enemy", 200, 100, 22, 22, true};

    // Destroy the enemy
    // Spawn particles at the death position
    // Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    bool alive;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height << endl;
}

void spawnParticles(int dx, int dy) {
    Entity p1 = {"particle1", "particle", dx - 10, dy - 10, 6, 6, true};
    Entity p2 = {"particle2", "particle", dx + 10, dy - 10, 6, 6, true};
    Entity p3 = {"particle3", "particle", dx - 10, dy + 10, 6, 6, true};
    Entity p4 = {"particle4", "particle", dx + 10, dy + 10, 6, 6, true};
    renderEntity(p1);
    renderEntity(p2);
    renderEntity(p3);
    renderEntity(p4);
}

int main() {
    Entity enemy = {"enemy1", "enemy", 200, 100, 22, 22, true};

    int deathX = enemy.x;
    int deathY = enemy.y;
    enemy.alive = false;

    spawnParticles(deathX, deathY);

    cout << "GAME_MESSAGE|Enemy destroyed! Particles spawned at (" << deathX << "," << deathY << ")" << endl;
    cout << "SCORE|50" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should spawn particle1 at top-left offset", expectedOutput: "ENTITY\\|particle1\\|particle\\|190\\|90\\|6\\|6", isPattern: true },
    { id: "g2", description: "Should spawn particle2 at top-right offset", expectedOutput: "ENTITY\\|particle2\\|particle\\|210\\|90\\|6\\|6", isPattern: true },
    { id: "g3", description: "Should spawn particle3 at bottom-left offset", expectedOutput: "ENTITY\\|particle3\\|particle\\|190\\|110\\|6\\|6", isPattern: true },
    { id: "g4", description: "Should spawn particle4 at bottom-right offset", expectedOutput: "ENTITY\\|particle4\\|particle\\|210\\|110\\|6\\|6", isPattern: true },
    { id: "g5", description: "Should show explosion message", expectedOutput: "GAME_MESSAGE\\|Enemy destroyed! Particles spawned at \\(200,100\\)", isPattern: true },
    { id: "g6", description: "Should output score", expectedOutput: "SCORE\\|50", isPattern: true },
  ],
  hints: [
    "spawnParticles takes (dx, dy) and creates 4 Entity structs at offsets: (dx-10,dy-10), (dx+10,dy-10), (dx-10,dy+10), (dx+10,dy+10).",
    "Save enemy.x and enemy.y before setting alive=false, then pass them to spawnParticles.",
    "Each particle has size 6x6 and type \"particle\". Use renderEntity to print each one.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    bool alive;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height << endl;
}

void spawnParticles(int dx, int dy) {
    Entity p1 = {"particle1", "particle", dx - 10, dy - 10, 6, 6, true};
    Entity p2 = {"particle2", "particle", dx + 10, dy - 10, 6, 6, true};
    Entity p3 = {"particle3", "particle", dx - 10, dy + 10, 6, 6, true};
    Entity p4 = {"particle4", "particle", dx + 10, dy + 10, 6, 6, true};
    renderEntity(p1);
    renderEntity(p2);
    renderEntity(p3);
    renderEntity(p4);
}

int main() {
    Entity enemy = {"enemy1", "enemy", 200, 100, 22, 22, true};
    int deathX = enemy.x;
    int deathY = enemy.y;
    enemy.alive = false;
    spawnParticles(deathX, deathY);
    cout << "GAME_MESSAGE|Enemy destroyed! Particles spawned at (" << deathX << "," << deathY << ")" << endl;
    cout << "SCORE|50" << endl;
    return 0;
}
`,
};
