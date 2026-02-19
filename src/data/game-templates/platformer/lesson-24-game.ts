import type { GameLessonVariant } from "@/types/game";

export const lesson24Platformer: GameLessonVariant = {
  lessonId: "24-lambdas-for-queries",
  instructions: `# Physics Bugs — Fix 3 State Machine Errors\n\nThis lesson gives you a **buggy** platformer physics simulation. The code has 3 bugs that break the player's jump sequence. Your job is to find and fix all 3 so the physics work correctly.\n\n## The 3 Bugs\n1. **Wrong gravity sign**: Gravity should pull the player DOWN (increase y), but it's subtracting instead of adding\n2. **Missing ground check**: The ground collision check compares y to the wrong value, so the player falls through the floor\n3. **Wrong state transition**: When landing, the code transitions to JUMPING instead of IDLE\n\n## Expected Behavior (after fixes)\n- Player starts at y=200 in IDLE state\n- Player jumps: velocity = -15, state = JUMPING\n- Gravity adds +5 each frame (3 frames simulated)\n- Frame 1: y = 200 + (-15) = 185, velocity = -10, state = JUMPING\n- Frame 2: y = 185 + (-10) = 175, velocity = -5, state = JUMPING\n- Frame 3: y = 175 + (-5) = 170, velocity = 0, state switches to FALLING\n- Frame 4: y = 170 + 0 = 170, velocity = 5, state = FALLING\n- Frame 5: y = 170 + 5 = 175, velocity = 10, state = FALLING\n- Ground is at y=200. After frame 5 y=175, still above ground. Continue:\n- Frame 6: y = 175 + 10 = 185, velocity = 15, state = FALLING\n- Frame 7: y = 185 + 15 = 200, velocity = 20 -> ground hit! y clamped to 200, state = IDLE\n- Render the final player position and output the final state\n\n## Protocol Reminder\n\`\`\`\nENTITY|id|type|x|y|width|height\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Player {
    string id;
    int x, y, width, height;
    int velocityY;
    PlayerState state;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void simulateFrame(Player &p, int gravity, int groundY) {
    p.y = p.y + p.velocityY;

    // BUG 1: Gravity should ADD to velocity (pull down), but this subtracts
    p.velocityY = p.velocityY - gravity;

    if (p.state == JUMPING && p.velocityY >= 0) {
        p.state = FALLING;
    }

    // BUG 2: Ground check compares to wrong value (999 instead of groundY)
    if (p.state == FALLING && p.y >= 999) {
        p.y = groundY;
        p.velocityY = 0;
        // BUG 3: Should transition to IDLE, not JUMPING
        p.state = JUMPING;
    }
}

int main() {
    Player player = {"runner", 100, 200, 16, 24, 0, IDLE};
    int gravity = 5;
    int groundY = 200;

    player.velocityY = -15;
    player.state = JUMPING;

    for (int i = 0; i < 7; i++) {
        simulateFrame(player, gravity, groundY);
    }

    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);
    renderEntity("ground", "platform", 0, 240, 380, 20);

    string stateStr = "UNKNOWN";
    if (player.state == IDLE) stateStr = "IDLE";
    if (player.state == JUMPING) stateStr = "JUMPING";
    if (player.state == FALLING) stateStr = "FALLING";

    cout << "GAME_MESSAGE|Physics complete! Final state: " << stateStr << " at y=" << player.y << endl;
    cout << "SCORE|0" << endl;
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
    int velocityY;
    PlayerState state;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void simulateFrame(Player &p, int gravity, int groundY) {
    p.y = p.y + p.velocityY;

    // FIX 1: Gravity ADDS to velocity (pulls player down)
    p.velocityY = p.velocityY + gravity;

    if (p.state == JUMPING && p.velocityY >= 0) {
        p.state = FALLING;
    }

    // FIX 2: Compare to groundY, not 999
    if (p.state == FALLING && p.y >= groundY) {
        p.y = groundY;
        p.velocityY = 0;
        // FIX 3: Transition to IDLE, not JUMPING
        p.state = IDLE;
    }
}

int main() {
    Player player = {"runner", 100, 200, 16, 24, 0, IDLE};
    int gravity = 5;
    int groundY = 200;

    player.velocityY = -15;
    player.state = JUMPING;

    for (int i = 0; i < 7; i++) {
        simulateFrame(player, gravity, groundY);
    }

    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);
    renderEntity("ground", "platform", 0, 240, 380, 20);

    string stateStr = "UNKNOWN";
    if (player.state == IDLE) stateStr = "IDLE";
    if (player.state == JUMPING) stateStr = "JUMPING";
    if (player.state == FALLING) stateStr = "FALLING";

    cout << "GAME_MESSAGE|Physics complete! Final state: " << stateStr << " at y=" << player.y << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player at ground level after landing", expectedOutput: "ENTITY\\|runner\\|player\\|100\\|200\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground platform", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should show IDLE state after landing", expectedOutput: "GAME_MESSAGE\\|Physics complete! Final state: IDLE at y=200", isPattern: true },
    { id: "g4", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Bug 1: Gravity pulls DOWN. Velocity should increase (become more positive) each frame. Change `- gravity` to `+ gravity`.",
    "Bug 2: The ground check compares `p.y >= 999` but the ground is at y=200. Change `999` to `groundY`.",
    "Bug 3: When the player lands on ground, they should become IDLE, not JUMPING. Change `p.state = JUMPING` to `p.state = IDLE`.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, JUMPING, FALLING };

struct Player {
    string id;
    int x, y, width, height;
    int velocityY;
    PlayerState state;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void simulateFrame(Player &p, int gravity, int groundY) {
    p.y = p.y + p.velocityY;
    p.velocityY = p.velocityY + gravity;
    if (p.state == JUMPING && p.velocityY >= 0) {
        p.state = FALLING;
    }
    if (p.state == FALLING && p.y >= groundY) {
        p.y = groundY;
        p.velocityY = 0;
        p.state = IDLE;
    }
}

int main() {
    Player player = {"runner", 100, 200, 16, 24, 0, IDLE};
    int gravity = 5;
    int groundY = 200;
    player.velocityY = -15;
    player.state = JUMPING;
    for (int i = 0; i < 7; i++) {
        simulateFrame(player, gravity, groundY);
    }
    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);
    renderEntity("ground", "platform", 0, 240, 380, 20);
    string stateStr = "UNKNOWN";
    if (player.state == IDLE) stateStr = "IDLE";
    if (player.state == JUMPING) stateStr = "JUMPING";
    if (player.state == FALLING) stateStr = "FALLING";
    cout << "GAME_MESSAGE|Physics complete! Final state: " << stateStr << " at y=" << player.y << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
