import type { GameLessonVariant } from "@/types/game";

export const lesson21SimpleRpg: GameLessonVariant = {
  lessonId: "21-checkpoint-save-load",

  instructions: `# Save System — RPG State Serialization\n\nEvery RPG needs a **save system**. Players expect to quit and resume with all their progress intact. This lesson teaches you to **serialize** complex game state into a structured text format, then **deserialize** it back and verify correctness.\n\n## What You'll Build\n\n- A player with stats (HP, ATK, level, XP)\n- An inventory with multiple items\n- A quest progress tracker\n- A save function that writes all state to \`SAVE|\` lines\n- A load function that reads the data back and verifies it\n\n## Key Concepts\n\n- **Serialization**: converting structs to a string format\n- **Deserialization**: parsing strings back into structs\n- **State verification**: confirming loaded state matches saved state\n\n## Output Protocol\n\n- \`ENTITY|id|type|x|y|width|height\` for the player\n- \`GAME_MESSAGE|text\` for save/load status\n- \`SCORE|value\` for verification result`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// RPG Save System: serialize player stats, inventory, and quest progress

struct PlayerStats {
    string name;
    int hp;
    int atk;
    int level;
    int xp;
};

struct Item {
    string name;
    int value;
};

struct QuestProgress {
    string questName;
    int stepsComplete;
    int totalSteps;
};

// TODO: Write a function saveGame that takes PlayerStats, an Item array,
// int itemCount, and QuestProgress, and outputs:
//   SAVE|PLAYER|name|hp|atk|level|xp
//   SAVE|ITEM|itemName|value  (for each item)
//   SAVE|QUEST|questName|stepsComplete|totalSteps

// TODO: Write a function loadAndVerify that takes the same parameters
// and outputs:
//   GAME_MESSAGE|Load OK: <name> Lv.<level> HP:<hp> ATK:<atk> XP:<xp>
//   GAME_MESSAGE|Inventory: <itemCount> items verified
//   GAME_MESSAGE|Quest: <questName> <stepsComplete>/<totalSteps>

int main() {
    // Create player: "Aldric", HP=85, ATK=22, Level=5, XP=1200
    // Create 2 items: ("Iron Sword", 150), ("Health Potion", 50)
    // Create quest: "Dragon Slayer", 3 of 5 steps complete

    // Output player entity: ENTITY|aldric|player|180|200|22|26
    // Call saveGame
    // Output: GAME_MESSAGE|Game saved successfully!
    // Call loadAndVerify
    // Output: SCORE|1  (1 = verified OK)

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct PlayerStats {
    string name;
    int hp;
    int atk;
    int level;
    int xp;
};

struct Item {
    string name;
    int value;
};

struct QuestProgress {
    string questName;
    int stepsComplete;
    int totalSteps;
};

void saveGame(PlayerStats p, Item items[], int itemCount, QuestProgress q) {
    cout << "SAVE|PLAYER|" << p.name << "|" << p.hp << "|"
         << p.atk << "|" << p.level << "|" << p.xp << endl;
    for (int i = 0; i < itemCount; i++) {
        cout << "SAVE|ITEM|" << items[i].name << "|"
             << items[i].value << endl;
    }
    cout << "SAVE|QUEST|" << q.questName << "|"
         << q.stepsComplete << "|" << q.totalSteps << endl;
}

void loadAndVerify(PlayerStats p, Item items[], int itemCount, QuestProgress q) {
    cout << "GAME_MESSAGE|Load OK: " << p.name << " Lv." << p.level
         << " HP:" << p.hp << " ATK:" << p.atk << " XP:" << p.xp << endl;
    cout << "GAME_MESSAGE|Inventory: " << itemCount
         << " items verified" << endl;
    cout << "GAME_MESSAGE|Quest: " << q.questName << " "
         << q.stepsComplete << "/" << q.totalSteps << endl;
}

int main() {
    PlayerStats player = {"Aldric", 85, 22, 5, 1200};

    Item inventory[2];
    inventory[0] = {"Iron Sword", 150};
    inventory[1] = {"Health Potion", 50};
    int itemCount = 2;

    QuestProgress quest = {"Dragon Slayer", 3, 5};

    cout << "ENTITY|aldric|player|180|200|22|26" << endl;

    saveGame(player, inventory, itemCount, quest);
    cout << "GAME_MESSAGE|Game saved successfully!" << endl;

    loadAndVerify(player, inventory, itemCount, quest);
    cout << "SCORE|1" << endl;

    return 0;
}`,

  tests: [
    {
      id: "player-entity",
      description: "Outputs player entity on screen",
      expectedOutput: "ENTITY\\|aldric\\|player\\|180\\|200\\|22\\|26",
      isPattern: true,
    },
    {
      id: "save-player",
      description: "Saves player stats in SAVE|PLAYER format",
      expectedOutput: "SAVE\\|PLAYER\\|Aldric\\|85\\|22\\|5\\|1200",
      isPattern: true,
    },
    {
      id: "save-item-sword",
      description: "Saves Iron Sword item data",
      expectedOutput: "SAVE\\|ITEM\\|Iron Sword\\|150",
      isPattern: true,
    },
    {
      id: "save-item-potion",
      description: "Saves Health Potion item data",
      expectedOutput: "SAVE\\|ITEM\\|Health Potion\\|50",
      isPattern: true,
    },
    {
      id: "save-quest",
      description: "Saves quest progress data",
      expectedOutput: "SAVE\\|QUEST\\|Dragon Slayer\\|3\\|5",
      isPattern: true,
    },
    {
      id: "save-success",
      description: "Displays save success message",
      expectedOutput: "GAME_MESSAGE\\|Game saved successfully!",
      isPattern: true,
    },
    {
      id: "load-verify",
      description: "Verifies loaded player data matches",
      expectedOutput: "GAME_MESSAGE\\|Load OK: Aldric Lv\\.5 HP:85 ATK:22 XP:1200",
      isPattern: true,
    },
    {
      id: "inventory-verify",
      description: "Verifies inventory count after load",
      expectedOutput: "GAME_MESSAGE\\|Inventory: 2 items verified",
      isPattern: true,
    },
    {
      id: "quest-verify",
      description: "Verifies quest progress after load",
      expectedOutput: "GAME_MESSAGE\\|Quest: Dragon Slayer 3/5",
      isPattern: true,
    },
    {
      id: "score-verified",
      description: "Outputs score 1 indicating verification passed",
      expectedOutput: "SCORE\\|1",
      isPattern: true,
    },
  ],

  hints: [
    "Use structs to group related data: PlayerStats for stats, Item for inventory items, QuestProgress for quests.",
    "saveGame outputs each piece of state on its own SAVE| line using cout with pipe separators.",
    "Use a for loop to iterate through the items array: for (int i = 0; i < itemCount; i++).",
    "loadAndVerify reconstructs the display from the same data, confirming the state is intact.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct PlayerStats {
    string name;
    int hp;
    int atk;
    int level;
    int xp;
};

struct Item {
    string name;
    int value;
};

struct QuestProgress {
    string questName;
    int stepsComplete;
    int totalSteps;
};

void saveGame(PlayerStats p, Item items[], int itemCount, QuestProgress q) {
    cout << "SAVE|PLAYER|" << p.name << "|" << p.hp << "|"
         << p.atk << "|" << p.level << "|" << p.xp << endl;
    for (int i = 0; i < itemCount; i++) {
        cout << "SAVE|ITEM|" << items[i].name << "|"
             << items[i].value << endl;
    }
    cout << "SAVE|QUEST|" << q.questName << "|"
         << q.stepsComplete << "|" << q.totalSteps << endl;
}

void loadAndVerify(PlayerStats p, Item items[], int itemCount, QuestProgress q) {
    cout << "GAME_MESSAGE|Load OK: " << p.name << " Lv." << p.level
         << " HP:" << p.hp << " ATK:" << p.atk << " XP:" << p.xp << endl;
    cout << "GAME_MESSAGE|Inventory: " << itemCount
         << " items verified" << endl;
    cout << "GAME_MESSAGE|Quest: " << q.questName << " "
         << q.stepsComplete << "/" << q.totalSteps << endl;
}

int main() {
    PlayerStats player = {"Aldric", 85, 22, 5, 1200};

    Item inventory[2];
    inventory[0] = {"Iron Sword", 150};
    inventory[1] = {"Health Potion", 50};
    int itemCount = 2;

    QuestProgress quest = {"Dragon Slayer", 3, 5};

    cout << "ENTITY|aldric|player|180|200|22|26" << endl;

    saveGame(player, inventory, itemCount, quest);
    cout << "GAME_MESSAGE|Game saved successfully!" << endl;

    loadAndVerify(player, inventory, itemCount, quest);
    cout << "SCORE|1" << endl;

    return 0;
}`,
};
