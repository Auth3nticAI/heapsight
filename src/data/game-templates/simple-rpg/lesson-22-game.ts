import type { GameLessonVariant } from "@/types/game";

export const lesson22SimpleRpg: GameLessonVariant = {
  lessonId: "22-error-handling-v0",

  instructions: `# Inventory Cleanup — Dynamic Item Deallocation\n\nIn C++, when you allocate memory with \`new\`, you **must** free it with \`delete\`. RPG inventories often create items dynamically during gameplay. If you forget to \`delete\` them when clearing the inventory, you get a **memory leak**.\n\n## What You'll Build\n\n- Dynamically allocate item structs with \`new\`\n- Store pointers in an inventory array\n- Display the inventory contents\n- Properly \`delete\` every item when clearing the inventory\n- Confirm cleanup was successful\n\n## Key Concepts\n\n- **Dynamic allocation**: \`new\` creates items on the heap\n- **Pointer arrays**: inventory holds Item* pointers\n- **Proper cleanup**: every \`new\` must have a matching \`delete\`\n- **Memory leaks**: forgetting \`delete\` wastes memory over time\n\n## Output Protocol\n\n- \`ENTITY|id|type|x|y|width|height\` for player and items\n- \`GAME_MESSAGE|text\` for inventory actions\n- \`SCORE|value\` for items properly freed`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Item {
    string name;
    string type;
    int power;
};

// TODO: Write a function createItem that takes name, type, power
// and returns a new Item* allocated with 'new'

// TODO: Write a function displayItem that takes an Item* and an int slot
// and outputs: ENTITY|item_<slot>|item|<slot*60+40>|300|14|14
// and outputs: GAME_MESSAGE|Slot <slot>: <name> (<type>) +<power>

// TODO: Write a function deleteItem that takes an Item* and int slot
// - Deletes the item
// - Outputs: GAME_MESSAGE|Freed slot <slot>: <name>

int main() {
    // Output player entity: ENTITY|warrior|player|180|200|22|26
    // Output: GAME_MESSAGE|Opening inventory...

    // Create 3 items dynamically:
    //   Slot 0: "Iron Sword", "weapon", 15
    //   Slot 1: "Oak Shield", "armor", 10
    //   Slot 2: "Red Potion", "consumable", 25

    // Store in: Item* inventory[3]
    // Display all 3 items

    // Output: GAME_MESSAGE|Clearing inventory...
    // Delete all 3 items using deleteItem
    // Set each pointer to nullptr after deletion

    // Output: GAME_MESSAGE|All items freed! No memory leaks.
    // Output: SCORE|3  (3 items properly cleaned up)

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Item {
    string name;
    string type;
    int power;
};

Item* createItem(string name, string type, int power) {
    Item* item = new Item;
    item->name = name;
    item->type = type;
    item->power = power;
    return item;
}

void displayItem(Item* item, int slot) {
    int xPos = slot * 60 + 40;
    cout << "ENTITY|item_" << slot << "|item|" << xPos
         << "|300|14|14" << endl;
    cout << "GAME_MESSAGE|Slot " << slot << ": " << item->name
         << " (" << item->type << ") +" << item->power << endl;
}

void deleteItem(Item* item, int slot) {
    cout << "GAME_MESSAGE|Freed slot " << slot << ": "
         << item->name << endl;
    delete item;
}

int main() {
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "GAME_MESSAGE|Opening inventory..." << endl;

    Item* inventory[3];
    inventory[0] = createItem("Iron Sword", "weapon", 15);
    inventory[1] = createItem("Oak Shield", "armor", 10);
    inventory[2] = createItem("Red Potion", "consumable", 25);

    for (int i = 0; i < 3; i++) {
        displayItem(inventory[i], i);
    }

    cout << "GAME_MESSAGE|Clearing inventory..." << endl;

    for (int i = 0; i < 3; i++) {
        deleteItem(inventory[i], i);
        inventory[i] = nullptr;
    }

    cout << "GAME_MESSAGE|All items freed! No memory leaks." << endl;
    cout << "SCORE|3" << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Outputs warrior entity on screen",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26",
      isPattern: true,
    },
    {
      id: "opening-inventory",
      description: "Displays opening inventory message",
      expectedOutput: "GAME_MESSAGE\\|Opening inventory\\.\\.\\.",
      isPattern: true,
    },
    {
      id: "item-0-entity",
      description: "Renders sword item entity at slot 0 position",
      expectedOutput: "ENTITY\\|item_0\\|item\\|40\\|300\\|14\\|14",
      isPattern: true,
    },
    {
      id: "item-0-display",
      description: "Displays Iron Sword in slot 0",
      expectedOutput: "GAME_MESSAGE\\|Slot 0: Iron Sword \\(weapon\\) \\+15",
      isPattern: true,
    },
    {
      id: "item-1-entity",
      description: "Renders shield item entity at slot 1 position",
      expectedOutput: "ENTITY\\|item_1\\|item\\|100\\|300\\|14\\|14",
      isPattern: true,
    },
    {
      id: "item-1-display",
      description: "Displays Oak Shield in slot 1",
      expectedOutput: "GAME_MESSAGE\\|Slot 1: Oak Shield \\(armor\\) \\+10",
      isPattern: true,
    },
    {
      id: "item-2-entity",
      description: "Renders potion item entity at slot 2 position",
      expectedOutput: "ENTITY\\|item_2\\|item\\|160\\|300\\|14\\|14",
      isPattern: true,
    },
    {
      id: "item-2-display",
      description: "Displays Red Potion in slot 2",
      expectedOutput: "GAME_MESSAGE\\|Slot 2: Red Potion \\(consumable\\) \\+25",
      isPattern: true,
    },
    {
      id: "freed-slot-0",
      description: "Frees Iron Sword from slot 0",
      expectedOutput: "GAME_MESSAGE\\|Freed slot 0: Iron Sword",
      isPattern: true,
    },
    {
      id: "freed-slot-1",
      description: "Frees Oak Shield from slot 1",
      expectedOutput: "GAME_MESSAGE\\|Freed slot 1: Oak Shield",
      isPattern: true,
    },
    {
      id: "freed-slot-2",
      description: "Frees Red Potion from slot 2",
      expectedOutput: "GAME_MESSAGE\\|Freed slot 2: Red Potion",
      isPattern: true,
    },
    {
      id: "all-freed",
      description: "Confirms all items freed with no memory leaks",
      expectedOutput: "GAME_MESSAGE\\|All items freed! No memory leaks\\.",
      isPattern: true,
    },
    {
      id: "score-freed",
      description: "Outputs score of 3 for items freed",
      expectedOutput: "SCORE\\|3",
      isPattern: true,
    },
  ],

  hints: [
    "Use new to allocate: Item* item = new Item; then set item->name, item->type, item->power.",
    "Store the returned pointers in an array: Item* inventory[3]; inventory[0] = createItem(...);",
    "The item x position formula is: slot * 60 + 40. Slot 0 = 40, Slot 1 = 100, Slot 2 = 160.",
    "Always delete before setting to nullptr: deleteItem(inventory[i], i); inventory[i] = nullptr;",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Item {
    string name;
    string type;
    int power;
};

Item* createItem(string name, string type, int power) {
    Item* item = new Item;
    item->name = name;
    item->type = type;
    item->power = power;
    return item;
}

void displayItem(Item* item, int slot) {
    int xPos = slot * 60 + 40;
    cout << "ENTITY|item_" << slot << "|item|" << xPos
         << "|300|14|14" << endl;
    cout << "GAME_MESSAGE|Slot " << slot << ": " << item->name
         << " (" << item->type << ") +" << item->power << endl;
}

void deleteItem(Item* item, int slot) {
    cout << "GAME_MESSAGE|Freed slot " << slot << ": "
         << item->name << endl;
    delete item;
}

int main() {
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "GAME_MESSAGE|Opening inventory..." << endl;

    Item* inventory[3];
    inventory[0] = createItem("Iron Sword", "weapon", 15);
    inventory[1] = createItem("Oak Shield", "armor", 10);
    inventory[2] = createItem("Red Potion", "consumable", 25);

    for (int i = 0; i < 3; i++) {
        displayItem(inventory[i], i);
    }

    cout << "GAME_MESSAGE|Clearing inventory..." << endl;

    for (int i = 0; i < 3; i++) {
        deleteItem(inventory[i], i);
        inventory[i] = nullptr;
    }

    cout << "GAME_MESSAGE|All items freed! No memory leaks." << endl;
    cout << "SCORE|3" << endl;

    return 0;
}`,
};
