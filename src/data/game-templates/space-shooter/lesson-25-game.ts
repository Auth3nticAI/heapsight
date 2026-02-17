import type { GameLessonVariant } from "@/types/game";

export const lesson25SpaceShooter: GameLessonVariant = {
  lessonId: "25-final-polish",
  instructions: `# Complete ECS Game — Full Integration\n\nThis is the capstone lesson. You will build a **complete ECS game scene** that combines every concept from the course: structs, arrays, functions, pointers, RAII helpers, movement systems, collision detection, particle effects, and scoring.\n\n## Concepts\n- Full ECS pipeline: component arrays, systems, entity lifecycle\n- Movement system: enemies advance downward each frame\n- Collision system: player bullet vs enemies (AABB overlap)\n- Damage/kill system: destroy enemies, spawn particles, add score\n- State management: track score, detect game over\n\n## Your Task\nBuild and simulate 3 frames of a space shooter:\n\n### Setup\n- Player ship at (180, 300, 24x24, 100hp)\n- 3 enemies in a row: alien1 (100,40), alien2 (200,40), alien3 (300,40) — each 22x22, 30hp\n- Player bullet at (200, 280, 6x6) moving upward\n\n### Frame 1: Initial State\n- Render all entities, output SCORE|0\n\n### Frame 2: Movement + Collision\n- Move enemies down by 20 (y += 20)\n- Move bullet up by 40 (y -= 40)\n- Check collision: bullet at (200,240) vs alien2 at (200,60) — no hit yet\n- Render all entities, output score\n\n### Frame 3: Kill + Particles\n- Move enemies down by 20 again (y += 20)\n- Move bullet up by 40 again (y -= 40)\n- Check collision: bullet at (200,200) vs alien2 at (200,80) — still no hit\n- Actually, alien2 is at (200, 80) and bullet is at (200, 200) — no overlap\n- BUT we force a direct hit on alien2 for the lesson: set alien2 hp to 0\n- Mark alien2 dead, spawn 4 particles around its position, add 100 to score\n- Render surviving entities + particles, output final score\n- Output GAME_MESSAGE with kill confirmation\n\n## Protocol\n\`\`\`\nENTITY|id|type|x|y|width|height|hp\nGAME_MESSAGE|text\nSCORE|value\nGAME_OVER\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 8;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

// Write moveSystem: moves entities of a given type by (dx, dy)

// Write checkCollision: AABB overlap between two entities

// Write spawnParticles: creates 4 particle entities in the array at given index

int main() {
    // Create entity array with ship, 3 enemies, bullet
    // Simulate 3 frames:
    //   Frame 1: render initial state
    //   Frame 2: move, check collision, render
    //   Frame 3: move, kill alien2, spawn particles, render final
    // Output final score and game message

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 12;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

void moveSystem(Entity entities[], int count, string type, int dx, int dy) {
    for (int i = 0; i < count; i++) {
        if (entities[i].alive && entities[i].type == type) {
            entities[i].x += dx;
            entities[i].y += dy;
        }
    }
}

bool checkCollision(Entity a, Entity b) {
    if (!a.alive || !b.alive) return false;
    bool overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
    bool overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
    return overlapX && overlapY;
}

int spawnParticles(Entity entities[], int nextIdx, int dx, int dy) {
    string pids[] = {"spark1", "spark2", "spark3", "spark4"};
    int offX[] = {-10, 10, -10, 10};
    int offY[] = {-10, -10, 10, 10};
    for (int i = 0; i < 4; i++) {
        entities[nextIdx + i] = {pids[i], "particle", dx + offX[i], dy + offY[i], 6, 6, 0, true};
    }
    return nextIdx + 4;
}

int main() {
    Entity entities[MAX_ENTITIES];
    int count = 0;

    entities[count++] = {"ship", "player", 180, 300, 24, 24, 100, true};
    entities[count++] = {"alien1", "enemy", 100, 40, 22, 22, 30, true};
    entities[count++] = {"alien2", "enemy", 200, 40, 22, 22, 30, true};
    entities[count++] = {"alien3", "enemy", 300, 40, 22, 22, 30, true};
    entities[count++] = {"bullet", "bullet", 200, 280, 6, 6, 1, true};

    int score = 0;

    // === Frame 1: Initial State ===
    for (int i = 0; i < count; i++) {
        renderEntity(entities[i]);
    }
    cout << "SCORE|" << score << endl;

    // === Frame 2: Movement ===
    moveSystem(entities, count, "enemy", 0, 20);
    moveSystem(entities, count, "bullet", 0, -40);

    for (int i = 0; i < count; i++) {
        renderEntity(entities[i]);
    }
    cout << "SCORE|" << score << endl;

    // === Frame 3: Movement + Kill + Particles ===
    moveSystem(entities, count, "enemy", 0, 20);
    moveSystem(entities, count, "bullet", 0, -40);

    // Direct hit on alien2
    entities[2].hp = 0;
    entities[2].alive = false;
    int deathX = entities[2].x;
    int deathY = entities[2].y;
    score += 100;

    // Remove bullet after hit
    entities[4].alive = false;

    // Spawn particles at alien2 death position
    count = spawnParticles(entities, count, deathX, deathY);

    for (int i = 0; i < count; i++) {
        renderEntity(entities[i]);
    }
    cout << "GAME_MESSAGE|alien2 destroyed at (" << deathX << "," << deathY << ")! +100 points" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1: Should render ship at initial position", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|300\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Frame 1: Should render alien2 at initial position", expectedOutput: "ENTITY\\|alien2\\|enemy\\|200\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g3", description: "Frame 1: Should render bullet at initial position", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|280\\|6\\|6\\|1", isPattern: true },
    { id: "g4", description: "Frame 2: Should render enemies moved down by 20", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|60\\|22\\|22\\|30", isPattern: true },
    { id: "g5", description: "Frame 2: Should render bullet moved up by 40", expectedOutput: "ENTITY\\|bullet\\|bullet\\|200\\|240\\|6\\|6\\|1", isPattern: true },
    { id: "g6", description: "Frame 3: Should render alien1 survived at y=80", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|80\\|22\\|22\\|30", isPattern: true },
    { id: "g7", description: "Frame 3: Should spawn spark1 particle", expectedOutput: "ENTITY\\|spark1\\|particle\\|190\\|70\\|6\\|6\\|0", isPattern: true },
    { id: "g8", description: "Frame 3: Should spawn spark4 particle", expectedOutput: "ENTITY\\|spark4\\|particle\\|210\\|90\\|6\\|6\\|0", isPattern: true },
    { id: "g9", description: "Frame 3: Should show kill message", expectedOutput: "GAME_MESSAGE\\|alien2 destroyed at \\(200,80\\)! \\+100 points", isPattern: true },
    { id: "g10", description: "Frame 3: Should show final score of 100", expectedOutput: "SCORE\\|100", isPattern: true },
  ],
  hints: [
    "moveSystem loops through all entities, checks if alive and type matches, then adds dx/dy to x/y.",
    "checkCollision uses AABB: overlap when `a.x < b.x+b.width && a.x+a.width > b.x` and same for y. Both must be alive.",
    "spawnParticles writes 4 new Entity structs into the array at nextIdx. Use offsets (-10,-10), (10,-10), (-10,10), (10,10) from death position.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_ENTITIES = 12;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

void moveSystem(Entity entities[], int count, string type, int dx, int dy) {
    for (int i = 0; i < count; i++) {
        if (entities[i].alive && entities[i].type == type) {
            entities[i].x += dx;
            entities[i].y += dy;
        }
    }
}

bool checkCollision(Entity a, Entity b) {
    if (!a.alive || !b.alive) return false;
    bool overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
    bool overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
    return overlapX && overlapY;
}

int spawnParticles(Entity entities[], int nextIdx, int dx, int dy) {
    string pids[] = {"spark1", "spark2", "spark3", "spark4"};
    int offX[] = {-10, 10, -10, 10};
    int offY[] = {-10, -10, 10, 10};
    for (int i = 0; i < 4; i++) {
        entities[nextIdx + i] = {pids[i], "particle", dx + offX[i], dy + offY[i], 6, 6, 0, true};
    }
    return nextIdx + 4;
}

int main() {
    Entity entities[MAX_ENTITIES];
    int count = 0;
    entities[count++] = {"ship", "player", 180, 300, 24, 24, 100, true};
    entities[count++] = {"alien1", "enemy", 100, 40, 22, 22, 30, true};
    entities[count++] = {"alien2", "enemy", 200, 40, 22, 22, 30, true};
    entities[count++] = {"alien3", "enemy", 300, 40, 22, 22, 30, true};
    entities[count++] = {"bullet", "bullet", 200, 280, 6, 6, 1, true};
    int score = 0;
    for (int i = 0; i < count; i++) renderEntity(entities[i]);
    cout << "SCORE|" << score << endl;
    moveSystem(entities, count, "enemy", 0, 20);
    moveSystem(entities, count, "bullet", 0, -40);
    for (int i = 0; i < count; i++) renderEntity(entities[i]);
    cout << "SCORE|" << score << endl;
    moveSystem(entities, count, "enemy", 0, 20);
    moveSystem(entities, count, "bullet", 0, -40);
    entities[2].hp = 0;
    entities[2].alive = false;
    int deathX = entities[2].x;
    int deathY = entities[2].y;
    score += 100;
    entities[4].alive = false;
    count = spawnParticles(entities, count, deathX, deathY);
    for (int i = 0; i < count; i++) renderEntity(entities[i]);
    cout << "GAME_MESSAGE|alien2 destroyed at (" << deathX << "," << deathY << ")! +100 points" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
