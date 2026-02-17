import type { GameLessonVariant } from "@/types/game";

export const lesson15Platformer: GameLessonVariant = {
  lessonId: "15-collision",
  instructions: `# Platform Collision — AABB Ground Detection\n\nIn a platformer, the most critical collision is **ground detection**: is the player standing on a platform? We use **AABB (Axis-Aligned Bounding Box)** overlap testing.\n\nTwo rectangles overlap when:\n- Player's right edge > Platform's left edge\n- Player's left edge < Platform's right edge\n- Player's bottom edge > Platform's top edge\n- Player's top edge < Platform's bottom edge\n\nWhen the player collides from above (player's bottom was above or at platform's top), we **snap** the player's y so they stand on top and set \`onGround = true\`.\n\n## Your Task\n\n1. Define a struct with x, y, width, height fields\n2. Write \`bool checkAABB()\` that returns true if two rects overlap\n3. Create a player at (50, 170) size 16x24 and a platform at (0, 190) size 380x20\n4. If collision detected and player came from above, snap player y to sit on platform and set onGround = true\n5. Output the entities and a message about the collision result\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Rect {
    string id;
    string type;
    int x, y, width, height;
};

// Write checkAABB function: returns true if two Rects overlap

int main() {
    Rect player = {"runner", "player", 50, 170, 16, 24};
    Rect platform = {"ground", "platform", 0, 190, 380, 20};
    bool onGround = false;

    // Check AABB collision
    // If collision from above: snap player y, set onGround = true
    // Output entities and collision result message

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Rect {
    string id;
    string type;
    int x, y, width, height;
};

bool checkAABB(Rect a, Rect b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

int main() {
    Rect player = {"runner", "player", 50, 170, 16, 24};
    Rect platform = {"ground", "platform", 0, 190, 380, 20};
    bool onGround = false;

    if (checkAABB(player, platform)) {
        if (player.y + player.height >= platform.y &&
            player.y < platform.y) {
            player.y = platform.y - player.height;
            onGround = true;
        }
    }

    cout << "ENTITY|" << player.id << "|" << player.type << "|"
         << player.x << "|" << player.y << "|"
         << player.width << "|" << player.height << endl;
    cout << "ENTITY|" << platform.id << "|" << platform.type << "|"
         << platform.x << "|" << platform.y << "|"
         << platform.width << "|" << platform.height << endl;

    if (onGround) {
        cout << "GAME_MESSAGE|Collision detected: player snapped to ground, onGround=true" << endl;
    } else {
        cout << "GAME_MESSAGE|No collision: player is airborne" << endl;
    }

    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should render player snapped to platform top",
      expectedOutput: "ENTITY\\|runner\\|player\\|50\\|166\\|16\\|24",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should render ground platform",
      expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|190\\|380\\|20",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should show collision detected message",
      expectedOutput: "GAME_MESSAGE\\|Collision detected: player snapped to ground, onGround=true",
      isPattern: true,
    },
  ],
  hints: [
    "AABB overlap: `a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y`",
    "Collision from above: `player.y + player.height >= platform.y && player.y < platform.y`",
    "Snap player: `player.y = platform.y - player.height;` places the player's feet exactly on the platform top.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Rect {
    string id;
    string type;
    int x, y, width, height;
};

bool checkAABB(Rect a, Rect b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

int main() {
    Rect player = {"runner", "player", 50, 170, 16, 24};
    Rect platform = {"ground", "platform", 0, 190, 380, 20};
    bool onGround = false;

    if (checkAABB(player, platform)) {
        if (player.y + player.height >= platform.y &&
            player.y < platform.y) {
            player.y = platform.y - player.height;
            onGround = true;
        }
    }

    cout << "ENTITY|" << player.id << "|" << player.type << "|"
         << player.x << "|" << player.y << "|"
         << player.width << "|" << player.height << endl;
    cout << "ENTITY|" << platform.id << "|" << platform.type << "|"
         << platform.x << "|" << platform.y << "|"
         << platform.width << "|" << platform.height << endl;

    if (onGround) {
        cout << "GAME_MESSAGE|Collision detected: player snapped to ground, onGround=true" << endl;
    } else {
        cout << "GAME_MESSAGE|No collision: player is airborne" << endl;
    }

    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
