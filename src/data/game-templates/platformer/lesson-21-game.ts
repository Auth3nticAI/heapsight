import type { GameLessonVariant } from "@/types/game";

export const lesson21Platformer: GameLessonVariant = {
  lessonId: "21-checkpoint-save-load",
  instructions: `# Checkpoint Save — Player State Serialization\n\nIn a platformer, checkpoints save the player's **complete state** — position, FSM state, and score. This is **serialization**: converting live game objects into a storable format. Loading a checkpoint **deserializes** that data back into a working player.\n\n## Concepts\n- Serialization: converting struct data to a string format\n- Deserialization: parsing a string back into struct data\n- FSM state persistence across save/load\n- Custom SAVE| protocol line for checkpoint data\n\n## Your Task\n1. Define a Player struct with: id, x, y, width, height, state (as int: 0=IDLE, 1=JUMPING, 2=FALLING), score\n2. Create a player at (150, 180) size 16x24, state IDLE (0), score 50\n3. Write a \`saveCheckpoint\` function that outputs: \`SAVE|x|y|state|score\`\n4. Simulate the player moving to (200, 160) with state JUMPING (1) and score 80\n5. Write a \`loadCheckpoint\` function that restores the player from saved values\n6. After loading, render the restored player entity and output messages\n\n## Protocol Reminder\n\`\`\`\nENTITY|id|type|x|y|width|height\nSAVE|x|y|state|score\nGAME_MESSAGE|text\nSCORE|value\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Player {
    string id;
    int x, y, width, height;
    int state;  // 0=IDLE, 1=JUMPING, 2=FALLING
    int score;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

// Write saveCheckpoint: outputs SAVE|x|y|state|score

// Write loadCheckpoint: restores player from saved values

int main() {
    Player player = {"runner", 150, 180, 16, 24, 0, 50};

    // Save checkpoint
    // Move player to new position (200, 160), state 1, score 80
    // Load checkpoint to restore original state
    // Render restored player and output messages

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Player {
    string id;
    int x, y, width, height;
    int state;  // 0=IDLE, 1=JUMPING, 2=FALLING
    int score;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void saveCheckpoint(Player &p, int &savedX, int &savedY, int &savedState, int &savedScore) {
    savedX = p.x;
    savedY = p.y;
    savedState = p.state;
    savedScore = p.score;
    cout << "SAVE|" << savedX << "|" << savedY << "|" << savedState << "|" << savedScore << endl;
}

void loadCheckpoint(Player &p, int savedX, int savedY, int savedState, int savedScore) {
    p.x = savedX;
    p.y = savedY;
    p.state = savedState;
    p.score = savedScore;
}

int main() {
    Player player = {"runner", 150, 180, 16, 24, 0, 50};

    int savedX, savedY, savedState, savedScore;
    saveCheckpoint(player, savedX, savedY, savedState, savedScore);

    player.x = 200;
    player.y = 160;
    player.state = 1;
    player.score = 80;
    cout << "GAME_MESSAGE|Player moved to danger zone!" << endl;

    loadCheckpoint(player, savedX, savedY, savedState, savedScore);

    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);
    renderEntity("checkpoint", "item", 150, 180, 12, 12);
    cout << "GAME_MESSAGE|Checkpoint loaded! Player restored to (" << player.x << "," << player.y << ")" << endl;
    cout << "SCORE|" << player.score << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should output save data", expectedOutput: "SAVE\\|150\\|180\\|0\\|50", isPattern: true },
    { id: "g2", description: "Should render restored player at checkpoint position", expectedOutput: "ENTITY\\|runner\\|player\\|150\\|180\\|16\\|24", isPattern: true },
    { id: "g3", description: "Should show checkpoint loaded message", expectedOutput: "GAME_MESSAGE\\|Checkpoint loaded! Player restored to \\(150,180\\)", isPattern: true },
    { id: "g4", description: "Should show restored score", expectedOutput: "SCORE\\|50", isPattern: true },
  ],
  hints: [
    "saveCheckpoint stores the player's x, y, state, and score into separate reference variables and prints the SAVE| line.",
    "After saving, modify the player's position and state to simulate gameplay, then call loadCheckpoint to restore.",
    "loadCheckpoint assigns the saved values back to the player struct fields using references.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Player {
    string id;
    int x, y, width, height;
    int state;  // 0=IDLE, 1=JUMPING, 2=FALLING
    int score;
};

void renderEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

void saveCheckpoint(Player &p, int &savedX, int &savedY, int &savedState, int &savedScore) {
    savedX = p.x;
    savedY = p.y;
    savedState = p.state;
    savedScore = p.score;
    cout << "SAVE|" << savedX << "|" << savedY << "|" << savedState << "|" << savedScore << endl;
}

void loadCheckpoint(Player &p, int savedX, int savedY, int savedState, int savedScore) {
    p.x = savedX;
    p.y = savedY;
    p.state = savedState;
    p.score = savedScore;
}

int main() {
    Player player = {"runner", 150, 180, 16, 24, 0, 50};
    int savedX, savedY, savedState, savedScore;
    saveCheckpoint(player, savedX, savedY, savedState, savedScore);
    player.x = 200;
    player.y = 160;
    player.state = 1;
    player.score = 80;
    cout << "GAME_MESSAGE|Player moved to danger zone!" << endl;
    loadCheckpoint(player, savedX, savedY, savedState, savedScore);
    renderEntity(player.id, "player", player.x, player.y, player.width, player.height);
    renderEntity("checkpoint", "item", 150, 180, 12, 12);
    cout << "GAME_MESSAGE|Checkpoint loaded! Player restored to (" << player.x << "," << player.y << ")" << endl;
    cout << "SCORE|" << player.score << endl;
    return 0;
}
`,
};
