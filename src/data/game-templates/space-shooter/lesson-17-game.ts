import type { GameLessonVariant } from "@/types/game";

export const lesson17SpaceShooter: GameLessonVariant = {
  lessonId: "17-entity-management",
  instructions: `# Entity Pool — Fixed-Size Component Arrays\n\nReal ECS engines avoid dynamic allocation. Instead, they pre-allocate **fixed-size arrays** and track which slots are in use with an \`alive[]\` boolean array.\n\nTo spawn: find the first slot where \`alive[i] == false\`, fill in components, set \`alive[i] = true\`.\nTo despawn: set \`alive[i] = false\`. The slot is now free for reuse.\n\n## Your Task\n\n1. Create a pool of 5 entity slots with parallel arrays and an \`alive[5]\` bool array\n2. Write \`int spawnEnemy(...)\ that finds the first dead slot, fills it, and returns the index\n3. Spawn 3 enemies into slots 0, 1, 2\n4. Despawn enemy at slot 1 (\`alive[1] = false\`)\n5. Spawn a new enemy — it should reuse slot 1\n6. Render all alive entities\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 5;

// Entity pool component arrays
string ids[POOL_SIZE];
string types[POOL_SIZE];
int x[POOL_SIZE], y[POOL_SIZE];
int w[POOL_SIZE], h[POOL_SIZE];
bool alive[POOL_SIZE];

// Write spawnEnemy: finds first dead slot, fills components, returns index (-1 if full)

int main() {
    // Initialize pool: all slots dead
    // Spawn 3 enemies
    // Despawn enemy at slot 1
    // Spawn a new enemy (should reuse slot 1)
    // Render all alive entities

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 5;

string ids[POOL_SIZE];
string types[POOL_SIZE];
int x[POOL_SIZE], y[POOL_SIZE];
int w[POOL_SIZE], h[POOL_SIZE];
bool alive[POOL_SIZE];

int spawnEnemy(string id, int ex, int ey) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (!alive[i]) {
            ids[i] = id;
            types[i] = "enemy";
            x[i] = ex;
            y[i] = ey;
            w[i] = 22;
            h[i] = 22;
            alive[i] = true;
            return i;
        }
    }
    return -1;
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        alive[i] = false;
    }

    int s0 = spawnEnemy("enemy1", 100, 40);
    cout << "GAME_MESSAGE|Spawned enemy1 in slot " << s0 << endl;

    int s1 = spawnEnemy("enemy2", 200, 60);
    cout << "GAME_MESSAGE|Spawned enemy2 in slot " << s1 << endl;

    int s2 = spawnEnemy("enemy3", 300, 80);
    cout << "GAME_MESSAGE|Spawned enemy3 in slot " << s2 << endl;

    alive[1] = false;
    cout << "GAME_MESSAGE|Despawned slot 1" << endl;

    int s3 = spawnEnemy("enemy4", 150, 50);
    cout << "GAME_MESSAGE|Spawned enemy4 in slot " << s3 << endl;

    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i]) {
            cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
                 << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i] << endl;
        }
    }

    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should spawn enemy1 in slot 0",
      expectedOutput: "GAME_MESSAGE\\|Spawned enemy1 in slot 0",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should spawn enemy2 in slot 1",
      expectedOutput: "GAME_MESSAGE\\|Spawned enemy2 in slot 1",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should despawn slot 1",
      expectedOutput: "GAME_MESSAGE\\|Despawned slot 1",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should reuse slot 1 for enemy4",
      expectedOutput: "GAME_MESSAGE\\|Spawned enemy4 in slot 1",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should render enemy4 at reused slot position",
      expectedOutput: "ENTITY\\|enemy4\\|enemy\\|150\\|50\\|22\\|22",
      isPattern: true,
    },
    {
      id: "t6",
      description: "Should render enemy1 from slot 0",
      expectedOutput: "ENTITY\\|enemy1\\|enemy\\|100\\|40\\|22\\|22",
      isPattern: true,
    },
  ],
  hints: [
    "Loop through `alive[]` to find the first `false` slot — that's where you spawn.",
    "After `alive[1] = false;`, the next spawnEnemy call will find slot 1 is free.",
    "Only render entities where `alive[i] == true` in your render loop.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 5;

string ids[POOL_SIZE];
string types[POOL_SIZE];
int x[POOL_SIZE], y[POOL_SIZE];
int w[POOL_SIZE], h[POOL_SIZE];
bool alive[POOL_SIZE];

int spawnEnemy(string id, int ex, int ey) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (!alive[i]) {
            ids[i] = id;
            types[i] = "enemy";
            x[i] = ex;
            y[i] = ey;
            w[i] = 22;
            h[i] = 22;
            alive[i] = true;
            return i;
        }
    }
    return -1;
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        alive[i] = false;
    }

    int s0 = spawnEnemy("enemy1", 100, 40);
    cout << "GAME_MESSAGE|Spawned enemy1 in slot " << s0 << endl;

    int s1 = spawnEnemy("enemy2", 200, 60);
    cout << "GAME_MESSAGE|Spawned enemy2 in slot " << s1 << endl;

    int s2 = spawnEnemy("enemy3", 300, 80);
    cout << "GAME_MESSAGE|Spawned enemy3 in slot " << s2 << endl;

    alive[1] = false;
    cout << "GAME_MESSAGE|Despawned slot 1" << endl;

    int s3 = spawnEnemy("enemy4", 150, 50);
    cout << "GAME_MESSAGE|Spawned enemy4 in slot " << s3 << endl;

    for (int i = 0; i < POOL_SIZE; i++) {
        if (alive[i]) {
            cout << "ENTITY|" << ids[i] << "|" << types[i] << "|"
                 << x[i] << "|" << y[i] << "|" << w[i] << "|" << h[i] << endl;
        }
    }

    return 0;
}
`,
};
