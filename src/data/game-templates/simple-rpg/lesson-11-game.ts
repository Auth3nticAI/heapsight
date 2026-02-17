import type { GameLessonVariant } from "@/types/game";

export const lesson11SimpleRpg: GameLessonVariant = {
  lessonId: "11-strings",

  instructions: `# Item Registry — String-Keyed Item Database\n\nData-driven RPGs store items in registries where each item has a **string name**, stats, and a formatted display. String manipulation lets you build rich item descriptions for inventory screens.\n\n## Objectives\n- Create 3 items with string names and stat bonuses\n- Build a formatted display string for each: \`"1x Iron Sword (ATK+5)"\`\n- Use string concatenation and \`to_string()\` to format item entries\n- Display the full inventory and render the warrior\n\n## Items\n| Name | Stat | Bonus | Qty |\n|------|------|-------|-----|\n| Iron Sword | ATK | +5 | 1 |\n| Oak Shield | DEF | +3 | 1 |\n| Health Herb | HP | +10 | 2 |\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height\` — render the warrior\n- \`GAME_MESSAGE|text\` — display each formatted item line\n- \`SCORE|value\` — total number of items`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Define 3 items using string variables
    // Item 1: name="Iron Sword", stat="ATK", bonus=5, qty=1
    // Item 2: name="Oak Shield", stat="DEF", bonus=3, qty=1
    // Item 3: name="Health Herb", stat="HP", bonus=10, qty=2

    // Build formatted strings for each item:
    //   "<qty>x <name> (<stat>+<bonus>)"
    // Example: "1x Iron Sword (ATK+5)"

    // Render warrior: ENTITY|warrior|player|180|200|22|26

    // Output each formatted item as: GAME_MESSAGE|<formatted string>
    // Output: GAME_MESSAGE|Inventory: 3 unique items
    // Output: SCORE|<total qty>  (1 + 1 + 2 = 4)

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Item data
    string names[] = {"Iron Sword", "Oak Shield", "Health Herb"};
    string stats[] = {"ATK", "DEF", "HP"};
    int bonuses[] = {5, 3, 10};
    int quantities[] = {1, 1, 2};
    int itemCount = 3;

    // Render warrior
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;

    // Build and display formatted item strings
    int totalQty = 0;
    for (int i = 0; i < itemCount; i++) {
        string formatted = to_string(quantities[i]) + "x " + names[i]
                         + " (" + stats[i] + "+" + to_string(bonuses[i]) + ")";
        cout << "GAME_MESSAGE|" << formatted << endl;
        totalQty += quantities[i];
    }

    // Summary
    cout << "GAME_MESSAGE|Inventory: " << itemCount << " unique items" << endl;
    cout << "SCORE|" << totalQty << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Renders warrior entity on screen",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26",
      isPattern: true,
    },
    {
      id: "item-sword",
      description: "Displays formatted Iron Sword entry",
      expectedOutput: "GAME_MESSAGE\\|1x Iron Sword \\(ATK\\+5\\)",
      isPattern: true,
    },
    {
      id: "item-shield",
      description: "Displays formatted Oak Shield entry",
      expectedOutput: "GAME_MESSAGE\\|1x Oak Shield \\(DEF\\+3\\)",
      isPattern: true,
    },
    {
      id: "item-herb",
      description: "Displays formatted Health Herb entry",
      expectedOutput: "GAME_MESSAGE\\|2x Health Herb \\(HP\\+10\\)",
      isPattern: true,
    },
    {
      id: "inventory-summary",
      description: "Displays inventory summary with 3 unique items",
      expectedOutput: "GAME_MESSAGE\\|Inventory: 3 unique items",
      isPattern: true,
    },
    {
      id: "score-total-qty",
      description: "Score equals total item quantity (1+1+2=4)",
      expectedOutput: "SCORE\\|4",
      isPattern: true,
    },
  ],

  hints: [
    "Use to_string() to convert integers to strings: to_string(quantities[i]) gives \"1\", \"1\", \"2\".",
    "Concatenate with +: to_string(qty) + \"x \" + name + \" (\" + stat + \"+\" + to_string(bonus) + \")\"",
    "Loop through all 3 items to build and display each formatted string.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Item data
    string names[] = {"Iron Sword", "Oak Shield", "Health Herb"};
    string stats[] = {"ATK", "DEF", "HP"};
    int bonuses[] = {5, 3, 10};
    int quantities[] = {1, 1, 2};
    int itemCount = 3;

    // Render warrior
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;

    // Build and display formatted item strings
    int totalQty = 0;
    for (int i = 0; i < itemCount; i++) {
        string formatted = to_string(quantities[i]) + "x " + names[i]
                         + " (" + stats[i] + "+" + to_string(bonuses[i]) + ")";
        cout << "GAME_MESSAGE|" << formatted << endl;
        totalQty += quantities[i];
    }

    // Summary
    cout << "GAME_MESSAGE|Inventory: " << itemCount << " unique items" << endl;
    cout << "SCORE|" << totalQty << endl;

    return 0;
}`,
};
