import type { GameLessonVariant } from "@/types/game";

export const lesson17Platformer: GameLessonVariant = {
  lessonId: "17-ids-and-free-list",
  instructions: `# Level Entities — Managing Platforms, Coins, Hazards\n\nA platformer level contains many entity types: platforms to stand on, coins to collect, and hazards to avoid. Each entity needs a **status flag** — is it alive? Has it been collected?\n\nUsing struct arrays with status flags lets you manage entities efficiently:\n- Platforms are always \`alive\` (static geometry)\n- Coins have a \`collected\` flag — once collected, they stop rendering\n- Hazards have an \`active\` flag — they can be deactivated\n\n## Your Task\n\n1. Define structs for Platform, Coin, and Hazard with status flags\n2. Create arrays: 2 platforms, 3 coins, 1 hazard\n3. Mark coin at index 1 as collected (simulating pickup)\n4. Render only alive/uncollected/active entities\n5. Show the score from collected coins and a summary message\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Platform {
    string id;
    int x, y, width, height;
    bool alive;
};

struct Coin {
    string id;
    int x, y;
    int value;
    bool collected;
};

struct Hazard {
    string id;
    int x, y, width, height;
    bool active;
};

int main() {
    // Create 2 platforms (alive), 3 coins (not collected), 1 hazard (active)
    // Mark coin at index 1 as collected
    // Render alive platforms, uncollected coins, active hazards
    // Calculate score from collected coins
    // Output SCORE and GAME_MESSAGE summary

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Platform {
    string id;
    int x, y, width, height;
    bool alive;
};

struct Coin {
    string id;
    int x, y;
    int value;
    bool collected;
};

struct Hazard {
    string id;
    int x, y, width, height;
    bool active;
};

int main() {
    Platform platforms[2] = {
        {"ground", 0, 240, 380, 20, true},
        {"plat1", 100, 180, 60, 10, true}
    };

    Coin coins[3] = {
        {"coin1", 120, 160, 10, false},
        {"coin2", 200, 220, 20, false},
        {"coin3", 300, 160, 10, false}
    };

    Hazard hazards[1] = {
        {"spike1", 250, 230, 16, 10, true}
    };

    coins[1].collected = true;

    int score = 0;
    for (int i = 0; i < 3; i++) {
        if (coins[i].collected) {
            score += coins[i].value;
        }
    }

    cout << "ENTITY|runner|player|50|200|16|24" << endl;

    for (int i = 0; i < 2; i++) {
        if (platforms[i].alive) {
            cout << "ENTITY|" << platforms[i].id << "|platform|"
                 << platforms[i].x << "|" << platforms[i].y << "|"
                 << platforms[i].width << "|" << platforms[i].height << endl;
        }
    }

    for (int i = 0; i < 3; i++) {
        if (!coins[i].collected) {
            cout << "ENTITY|" << coins[i].id << "|item|"
                 << coins[i].x << "|" << coins[i].y << "|12|12" << endl;
        }
    }

    for (int i = 0; i < 1; i++) {
        if (hazards[i].active) {
            cout << "ENTITY|" << hazards[i].id << "|hazard|"
                 << hazards[i].x << "|" << hazards[i].y << "|"
                 << hazards[i].width << "|" << hazards[i].height << endl;
        }
    }

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Level loaded: 2 platforms, 2 coins visible, 1 hazard active" << endl;
    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should render player entity",
      expectedOutput: "ENTITY\\|runner\\|player\\|50\\|200\\|16\\|24",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should render ground platform",
      expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should render uncollected coin1",
      expectedOutput: "ENTITY\\|coin1\\|item\\|120\\|160\\|12\\|12",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should NOT render collected coin2",
      expectedOutput: "^(?!.*ENTITY\\|coin2)",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should render active hazard",
      expectedOutput: "ENTITY\\|spike1\\|hazard\\|250\\|230\\|16\\|10",
      isPattern: true,
    },
    {
      id: "t6",
      description: "Should show score from collected coin (20 points)",
      expectedOutput: "SCORE\\|20",
      isPattern: true,
    },
    {
      id: "t7",
      description: "Should show level summary message",
      expectedOutput: "GAME_MESSAGE\\|Level loaded: 2 platforms, 2 coins visible, 1 hazard active",
      isPattern: true,
    },
  ],
  hints: [
    "Use C-style arrays: `Platform platforms[2] = { {...}, {...} };` to initialize multiple entities.",
    "Mark collected: `coins[1].collected = true;` then skip it during rendering with `if (!coins[i].collected)`.",
    "Accumulate score: loop through coins, add `coins[i].value` when `coins[i].collected` is true.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Platform {
    string id;
    int x, y, width, height;
    bool alive;
};

struct Coin {
    string id;
    int x, y;
    int value;
    bool collected;
};

struct Hazard {
    string id;
    int x, y, width, height;
    bool active;
};

int main() {
    Platform platforms[2] = {
        {"ground", 0, 240, 380, 20, true},
        {"plat1", 100, 180, 60, 10, true}
    };

    Coin coins[3] = {
        {"coin1", 120, 160, 10, false},
        {"coin2", 200, 220, 20, false},
        {"coin3", 300, 160, 10, false}
    };

    Hazard hazards[1] = {
        {"spike1", 250, 230, 16, 10, true}
    };

    coins[1].collected = true;

    int score = 0;
    for (int i = 0; i < 3; i++) {
        if (coins[i].collected) {
            score += coins[i].value;
        }
    }

    cout << "ENTITY|runner|player|50|200|16|24" << endl;

    for (int i = 0; i < 2; i++) {
        if (platforms[i].alive) {
            cout << "ENTITY|" << platforms[i].id << "|platform|"
                 << platforms[i].x << "|" << platforms[i].y << "|"
                 << platforms[i].width << "|" << platforms[i].height << endl;
        }
    }

    for (int i = 0; i < 3; i++) {
        if (!coins[i].collected) {
            cout << "ENTITY|" << coins[i].id << "|item|"
                 << coins[i].x << "|" << coins[i].y << "|12|12" << endl;
        }
    }

    for (int i = 0; i < 1; i++) {
        if (hazards[i].active) {
            cout << "ENTITY|" << hazards[i].id << "|hazard|"
                 << hazards[i].x << "|" << hazards[i].y << "|"
                 << hazards[i].width << "|" << hazards[i].height << endl;
        }
    }

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Level loaded: 2 platforms, 2 coins visible, 1 hazard active" << endl;
    return 0;
}
`,
};
