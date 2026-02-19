import type { GameLessonVariant } from "@/types/game";

export const lesson20Platformer: GameLessonVariant = {
  lessonId: "20-spatial-buckets-v0",
  instructions: `# Jump Effects — State-Triggered Particles\n\nWhen a platformer character lands after a jump, dust particles should appear at the player's feet. This visual feedback is **triggered by a state transition** — specifically, when the player's FSM moves from the \`falling\` state to the \`idle\` state.\n\n## Concepts\n- Finite State Machines (FSM) for player states: idle, jumping, falling\n- State transitions as event triggers\n- Spawning transient particle entities on landing\n\n## Your Task\n1. Define an enum for player states: IDLE, JUMPING, FALLING\n2. Simulate a jump sequence: idle -> jumping -> falling -> idle\n3. When the transition from FALLING to IDLE occurs (landing), spawn **3 dust particle entities** at offsets below the player:\n   - dust1 at (playerX - 8, playerY + 24) size 6x6\n   - dust2 at (playerX, playerY + 24) size 6x6\n   - dust3 at (playerX + 8, playerY + 24) size 6x6\n4. Render the player entity at position (100, 200) size 16x24\n5. Output a GAME_MESSAGE about landing\n6. Output the SCORE\n\n## Protocol Reminder\n\`\`\`\nENTITY|id|type|x|y|width|height\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Player {
    string id;
    int x, y, width, height;
    PlayerState state;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

// Write spawnDustParticles function:
// Takes player x, y and spawns 3 dust particles at offsets below player

// Write transitionState function:
// Changes player state, detects landing (FALLING -> IDLE), calls spawnDustParticles

int main() {
    Player player = {"runner", 100, 200, 16, 24, IDLE};

    // Simulate: idle -> jumping -> falling -> idle (landing)
    // Render player and output message + score

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Player {
    string id;
    int x, y, width, height;
    PlayerState state;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void spawnDustParticles(int px, int py) {
    renderEntity("dust1", "particle", px - 8, py + 24, 6, 6);
    renderEntity("dust2", "particle", px, py + 24, 6, 6);
    renderEntity("dust3", "particle", px + 8, py + 24, 6, 6);
}

bool transitionState(Player &player, PlayerState newState) {
    bool landed = (player.state == FALLING && newState == IDLE);
    player.state = newState;
    if (landed) {
        spawnDustParticles(player.x, player.y);
    }
    return landed;
}

int main() {
    Player player = {"runner", 100, 200, 16, 24, IDLE};

    transitionState(player, JUMPING);
    transitionState(player, FALLING);
    bool landed = transitionState(player, IDLE);

    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);

    if (landed) {
        cout << "GAME_MESSAGE|Player landed! Dust particles spawned!" << endl;
    }
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player entity", expectedOutput: "ENTITY\\|runner\\|player\\|100\\|200\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should spawn dust1 at left offset", expectedOutput: "ENTITY\\|dust1\\|particle\\|92\\|224\\|6\\|6", isPattern: true },
    { id: "g3", description: "Should spawn dust2 at center", expectedOutput: "ENTITY\\|dust2\\|particle\\|100\\|224\\|6\\|6", isPattern: true },
    { id: "g4", description: "Should spawn dust3 at right offset", expectedOutput: "ENTITY\\|dust3\\|particle\\|108\\|224\\|6\\|6", isPattern: true },
    { id: "g5", description: "Should show landing message", expectedOutput: "GAME_MESSAGE\\|Player landed! Dust particles spawned!", isPattern: true },
    { id: "g6", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "spawnDustParticles takes (px, py) and calls renderEntity 3 times at offsets: (px-8, py+24), (px, py+24), (px+8, py+24).",
    "transitionState should check if old state is FALLING and new state is IDLE — that means the player landed.",
    "Use a reference parameter `Player &player` so transitionState can modify the player's state.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Player {
    string id;
    int x, y, width, height;
    PlayerState state;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void spawnDustParticles(int px, int py) {
    renderEntity("dust1", "particle", px - 8, py + 24, 6, 6);
    renderEntity("dust2", "particle", px, py + 24, 6, 6);
    renderEntity("dust3", "particle", px + 8, py + 24, 6, 6);
}

bool transitionState(Player &player, PlayerState newState) {
    bool landed = (player.state == FALLING && newState == IDLE);
    player.state = newState;
    if (landed) {
        spawnDustParticles(player.x, player.y);
    }
    return landed;
}

int main() {
    Player player = {"runner", 100, 200, 16, 24, IDLE};
    transitionState(player, JUMPING);
    transitionState(player, FALLING);
    bool landed = transitionState(player, IDLE);
    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);
    if (landed) {
        cout << "GAME_MESSAGE|Player landed! Dust particles spawned!" << endl;
    }
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
