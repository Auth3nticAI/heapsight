import type { GameLessonVariant } from "@/types/game";

export const lesson06SimpleRpg: GameLessonVariant = {
  lessonId: "06-soa-enemies",

  instructions: `# Inventory System — Item Storage Arrays\n\nIn data-driven RPGs, **parallel arrays** act as lightweight data tables. Each array column stores one attribute of a game item, and the row index ties them together.\n\n## Objectives\n- Declare three parallel arrays: \`names[]\`, \`quantities[]\`, and \`values[]\`\n- Store 3 inventory items across these arrays\n- Loop through the arrays to display each item via \`GAME_MESSAGE\`\n- Calculate and display the total gold value\n- Render the warrior entity who carries this inventory\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height\` — render the warrior\n- \`GAME_MESSAGE|text\` — display each item and the total\n- \`SCORE|value\` — total inventory gold value`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Declare 3 parallel arrays of size 3:
    //   names[]      -> "Iron Sword", "Health Potion", "Shield"
    //   quantities[] -> 1, 3, 1
    //   values[]     -> 50, 10, 35

    // Render warrior entity at (180,200) size 22x26
    // Format: ENTITY|warrior|player|180|200|22|26

    // Loop through all 3 items and output each as:
    //   GAME_MESSAGE|<quantity>x <name> (worth <value>g each)

    // Calculate total gold value (sum of quantity * value for each item)
    // Output: GAME_MESSAGE|Total inventory value: <total>g
    // Output: SCORE|<total>

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Parallel arrays as item data table
    string names[] = {"Iron Sword", "Health Potion", "Shield"};
    int quantities[] = {1, 3, 1};
    int values[] = {50, 10, 35};
    int itemCount = 3;

    // Render warrior entity
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;

    // Display each inventory item
    int totalGold = 0;
    for (int i = 0; i < itemCount; i++) {
        cout << "GAME_MESSAGE|" << quantities[i] << "x " << names[i]
             << " (worth " << values[i] << "g each)" << endl;
        totalGold += quantities[i] * values[i];
    }

    // Display total inventory value
    cout << "GAME_MESSAGE|Total inventory value: " << totalGold << "g" << endl;
    cout << "SCORE|" << totalGold << endl;

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
      description: "Displays Iron Sword inventory entry",
      expectedOutput: "GAME_MESSAGE\\|1x Iron Sword \\(worth 50g each\\)",
      isPattern: true,
    },
    {
      id: "item-potion",
      description: "Displays Health Potion inventory entry",
      expectedOutput: "GAME_MESSAGE\\|3x Health Potion \\(worth 10g each\\)",
      isPattern: true,
    },
    {
      id: "item-shield",
      description: "Displays Shield inventory entry",
      expectedOutput: "GAME_MESSAGE\\|1x Shield \\(worth 35g each\\)",
      isPattern: true,
    },
    {
      id: "total-value",
      description: "Displays total inventory gold value (50 + 30 + 35 = 115)",
      expectedOutput: "GAME_MESSAGE\\|Total inventory value: 115g",
      isPattern: true,
    },
    {
      id: "score-total",
      description: "Outputs score equal to total inventory value",
      expectedOutput: "SCORE\\|115",
      isPattern: true,
    },
  ],

  hints: [
    "Declare parallel arrays: string names[] = {\"Iron Sword\", \"Health Potion\", \"Shield\"};",
    "Use a for loop from 0 to 2 (or itemCount) to iterate all three arrays at once.",
    "Total gold for one item is quantities[i] * values[i]. Accumulate this in a running sum.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Parallel arrays as item data table
    string names[] = {"Iron Sword", "Health Potion", "Shield"};
    int quantities[] = {1, 3, 1};
    int values[] = {50, 10, 35};
    int itemCount = 3;

    // Render warrior entity
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;

    // Display each inventory item
    int totalGold = 0;
    for (int i = 0; i < itemCount; i++) {
        cout << "GAME_MESSAGE|" << quantities[i] << "x " << names[i]
             << " (worth " << values[i] << "g each)" << endl;
        totalGold += quantities[i] * values[i];
    }

    // Display total inventory value
    cout << "GAME_MESSAGE|Total inventory value: " << totalGold << "g" << endl;
    cout << "SCORE|" << totalGold << endl;

    return 0;
}`,
};
