import type { GameLessonVariant } from "@/types/game";

export const lesson18Platformer: GameLessonVariant = {
  lessonId: "18-save-snapshot-v0",
  instructions: `# Collectible Scoring — Coin Value System\n\nNot all collectibles are created equal! In many platformers, coins come in different tiers:\n- **Gold** coins = 100 points\n- **Silver** coins = 50 points\n- **Bronze** coins = 25 points\n\nThe player's score is an **accumulated state** — it grows as game events (coin pickups) occur. Each coin's type determines its point value.\n\n## Your Task\n\n1. Define a Coin struct with id, type (gold/silver/bronze), x, y, value, and collected fields\n2. Write a \`int getCoinValue(string type)\` function that returns 100 for gold, 50 for silver, 25 for bronze\n3. Create 3 coins: one gold, one silver, one bronze — all collected\n4. Accumulate the total score from all collected coins\n5. Output remaining entities and the final score\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Coin {
    string id;
    string tier;
    int x, y;
    int value;
    bool collected;
};

// Write getCoinValue: returns points based on tier (gold=100, silver=50, bronze=25)

int main() {
    // Create 3 coins with different tiers, assign values using getCoinValue
    // Mark all as collected
    // Accumulate score from collected coins
    // Output player, platform, and score

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Coin {
    string id;
    string tier;
    int x, y;
    int value;
    bool collected;
};

int getCoinValue(string tier) {
    if (tier == "gold") return 100;
    if (tier == "silver") return 50;
    if (tier == "bronze") return 25;
    return 0;
}

int main() {
    Coin coins[3] = {
        {"coin1", "gold", 120, 160, getCoinValue("gold"), true},
        {"coin2", "silver", 200, 180, getCoinValue("silver"), true},
        {"coin3", "bronze", 300, 200, getCoinValue("bronze"), true}
    };

    int score = 0;
    for (int i = 0; i < 3; i++) {
        if (coins[i].collected) {
            score += coins[i].value;
        }
    }

    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|Collected gold(100) + silver(50) + bronze(25) = " << score << " points!" << endl;
    cout << "SCORE|" << score << endl;
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
      description: "Should show collection breakdown message",
      expectedOutput: "GAME_MESSAGE\\|Collected gold\\(100\\) \\+ silver\\(50\\) \\+ bronze\\(25\\) = 175 points!",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should output total score of 175",
      expectedOutput: "SCORE\\|175",
      isPattern: true,
    },
  ],
  hints: [
    "Use if/else chain: `if (tier == \"gold\") return 100;` etc. in getCoinValue.",
    "Initialize coin value at creation: `getCoinValue(\"gold\")` returns 100 to store in the struct.",
    "Loop through coins and add `coins[i].value` to score when `coins[i].collected` is true.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Coin {
    string id;
    string tier;
    int x, y;
    int value;
    bool collected;
};

int getCoinValue(string tier) {
    if (tier == "gold") return 100;
    if (tier == "silver") return 50;
    if (tier == "bronze") return 25;
    return 0;
}

int main() {
    Coin coins[3] = {
        {"coin1", "gold", 120, 160, getCoinValue("gold"), true},
        {"coin2", "silver", 200, 180, getCoinValue("silver"), true},
        {"coin3", "bronze", 300, 200, getCoinValue("bronze"), true}
    };

    int score = 0;
    for (int i = 0; i < 3; i++) {
        if (coins[i].collected) {
            score += coins[i].value;
        }
    }

    cout << "ENTITY|runner|player|50|200|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|Collected gold(100) + silver(50) + bronze(25) = " << score << " points!" << endl;
    cout << "SCORE|" << score << endl;
    return 0;
}
`,
};
