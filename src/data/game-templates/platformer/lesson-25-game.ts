import type { GameLessonVariant } from "@/types/game";

export const lesson25Platformer: GameLessonVariant = {
  lessonId: "25-milestone-playable-loop",
  instructions: `# Complete Platformer — Full FSM + Physics Integration\n\nThis is the capstone lesson. You will build a **complete platformer scene** that integrates every concept from this module:\n- **FSM** for player states (IDLE, JUMPING, FALLING)\n- **Physics** simulation with gravity\n- **Collision detection** with platforms and coins\n- **Scoring** system\n- **Level management** with dynamic allocation\n\n## Your Task\nSimulate 5 frames of a platformer scene:\n\n### Setup\n- Player starts at (50, 200) size 16x24, state IDLE, score 0\n- 4 platforms: ground (0, 240, 380, 16), plat1 (80, 200, 80, 16), plat2 (180, 170, 80, 16), plat3 (300, 150, 80, 16)\n- 3 coins: coin1 at (120, 180, 12, 12), coin2 at (200, 150, 12, 12), coin3 at (320, 130, 12, 12)\n- Gravity = 4, jump velocity = -12\n\n### Frame Simulation\n- **Frame 1**: Player jumps (IDLE -> JUMPING, velocityY = -12). Apply gravity. New y = 200 + (-12) = 188, velocityY = -8\n- **Frame 2**: Continue jumping. y = 188 + (-8) = 180, velocityY = -4. Player collects coin1 (coin1.y=180, player.y=180). Score += 10\n- **Frame 3**: y = 180 + (-4) = 176, velocityY = 0. velocityY >= 0 so state -> FALLING\n- **Frame 4**: y = 176 + 0 = 176, velocityY = 4. State = FALLING\n- **Frame 5**: y = 176 + 4 = 180, velocityY = 8. Player is at y=180, not past any platform top yet. State = FALLING\n\n### After Simulation\n- Render all entities (player at final position, all platforms, remaining coins)\n- Output final score and completion message\n- Clean up any dynamic level data\n\n## Protocol Reminder\n\`\`\`\nENTITY|id|type|x|y|width|height\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    bool active;
};

struct Player {
    string id;
    int x, y, width, height;
    int velocityY;
    PlayerState state;
    int score;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

// Write applyPhysics: updates player y by velocityY, adds gravity to velocityY,
// transitions JUMPING->FALLING when velocityY >= 0

// Write checkCoinCollision: if player.y == coin.y and coin is active,
// deactivate coin, add 10 to score, return true

// Write simulateFrame: calls applyPhysics, checks all coins for collision

int main() {
    // Setup player, platforms, coins
    // Simulate 5 frames
    // Render all entities
    // Output score and message

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    bool active;
};

struct Player {
    string id;
    int x, y, width, height;
    int velocityY;
    PlayerState state;
    int score;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void applyPhysics(Player &p, int gravity) {
    p.y = p.y + p.velocityY;
    p.velocityY = p.velocityY + gravity;
    if (p.state == JUMPING && p.velocityY >= 0) {
        p.state = FALLING;
    }
}

bool checkCoinCollision(Player &p, Entity &coin) {
    if (coin.active && p.y == coin.y) {
        coin.active = false;
        p.score += 10;
        return true;
    }
    return false;
}

void simulateFrame(Player &p, int gravity, Entity coins[], int coinCount) {
    applyPhysics(p, gravity);
    for (int i = 0; i < coinCount; i++) {
        checkCoinCollision(p, coins[i]);
    }
}

int main() {
    Player player = {"runner", 50, 200, 16, 24, 0, IDLE, 0};
    int gravity = 4;

    Entity platforms[4] = {
        {"ground", "platform", 0, 240, 380, 16, true},
        {"plat1", "platform", 80, 200, 80, 16, true},
        {"plat2", "platform", 180, 170, 80, 16, true},
        {"plat3", "platform", 300, 150, 80, 16, true}
    };

    Entity coins[3] = {
        {"coin1", "item", 120, 180, 12, 12, true},
        {"coin2", "item", 200, 150, 12, 12, true},
        {"coin3", "item", 320, 130, 12, 12, true}
    };

    player.velocityY = -12;
    player.state = JUMPING;

    for (int frame = 0; frame < 5; frame++) {
        simulateFrame(player, gravity, coins, 3);
    }

    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);

    for (int i = 0; i < 4; i++) {
        renderEntity(platforms[i].id, platforms[i].type,
                     platforms[i].x, platforms[i].y,
                     platforms[i].width, platforms[i].height);
    }

    for (int i = 0; i < 3; i++) {
        if (coins[i].active) {
            renderEntity(coins[i].id, coins[i].type,
                         coins[i].x, coins[i].y,
                         coins[i].width, coins[i].height);
        }
    }

    string stateStr = "IDLE";
    if (player.state == JUMPING) stateStr = "JUMPING";
    if (player.state == FALLING) stateStr = "FALLING";

    cout << "GAME_MESSAGE|Simulation complete! State: " << stateStr << " Score: " << player.score << endl;
    cout << "SCORE|" << player.score << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player at final position after 5 frames", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|180\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground platform", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|16", isPattern: true },
    { id: "g3", description: "Should render plat1", expectedOutput: "ENTITY\\|plat1\\|platform\\|80\\|200\\|80\\|16", isPattern: true },
    { id: "g4", description: "Should render plat2", expectedOutput: "ENTITY\\|plat2\\|platform\\|180\\|170\\|80\\|16", isPattern: true },
    { id: "g5", description: "Should NOT render coin1 (collected)", expectedOutput: "ENTITY\\|coin2\\|item\\|200\\|150\\|12\\|12", isPattern: true },
    { id: "g6", description: "Should show score of 10 (1 coin collected)", expectedOutput: "SCORE\\|10", isPattern: true },
    { id: "g7", description: "Should show FALLING state in message", expectedOutput: "GAME_MESSAGE\\|Simulation complete! State: FALLING Score: 10", isPattern: true },
  ],
  hints: [
    "applyPhysics: `p.y = p.y + p.velocityY;` then `p.velocityY = p.velocityY + gravity;` then check if JUMPING and velocityY >= 0 to switch to FALLING.",
    "checkCoinCollision: check `coin.active && p.y == coin.y`, then set `coin.active = false` and `p.score += 10`.",
    "simulateFrame calls applyPhysics first, then loops through all coins calling checkCoinCollision. Only render active coins after simulation.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Entity {
    string id;
    string type;
    int x, y, width, height;
    bool active;
};

struct Player {
    string id;
    int x, y, width, height;
    int velocityY;
    PlayerState state;
    int score;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void applyPhysics(Player &p, int gravity) {
    p.y = p.y + p.velocityY;
    p.velocityY = p.velocityY + gravity;
    if (p.state == JUMPING && p.velocityY >= 0) {
        p.state = FALLING;
    }
}

bool checkCoinCollision(Player &p, Entity &coin) {
    if (coin.active && p.y == coin.y) {
        coin.active = false;
        p.score += 10;
        return true;
    }
    return false;
}

void simulateFrame(Player &p, int gravity, Entity coins[], int coinCount) {
    applyPhysics(p, gravity);
    for (int i = 0; i < coinCount; i++) {
        checkCoinCollision(p, coins[i]);
    }
}

int main() {
    Player player = {"runner", 50, 200, 16, 24, 0, IDLE, 0};
    int gravity = 4;
    Entity platforms[4] = {
        {"ground", "platform", 0, 240, 380, 16, true},
        {"plat1", "platform", 80, 200, 80, 16, true},
        {"plat2", "platform", 180, 170, 80, 16, true},
        {"plat3", "platform", 300, 150, 80, 16, true}
    };
    Entity coins[3] = {
        {"coin1", "item", 120, 180, 12, 12, true},
        {"coin2", "item", 200, 150, 12, 12, true},
        {"coin3", "item", 320, 130, 12, 12, true}
    };
    player.velocityY = -12;
    player.state = JUMPING;
    for (int frame = 0; frame < 5; frame++) {
        simulateFrame(player, gravity, coins, 3);
    }
    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);
    for (int i = 0; i < 4; i++) {
        renderEntity(platforms[i].id, platforms[i].type,
                     platforms[i].x, platforms[i].y,
                     platforms[i].width, platforms[i].height);
    }
    for (int i = 0; i < 3; i++) {
        if (coins[i].active) {
            renderEntity(coins[i].id, coins[i].type,
                         coins[i].x, coins[i].y,
                         coins[i].width, coins[i].height);
        }
    }
    string stateStr = "IDLE";
    if (player.state == JUMPING) stateStr = "JUMPING";
    if (player.state == FALLING) stateStr = "FALLING";
    cout << "GAME_MESSAGE|Simulation complete! State: " << stateStr << " Score: " << player.score << endl;
    cout << "SCORE|" << player.score << endl;
    return 0;
}
`,
};
