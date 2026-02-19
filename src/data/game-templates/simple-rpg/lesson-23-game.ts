import type { GameLessonVariant } from "@/types/game";

export const lesson23SimpleRpg: GameLessonVariant = {
  lessonId: "23-thread-awareness-v0",

  instructions: `# Safe Item Management — RAII for Game Objects\n\nIn the previous lesson, you had to manually \`delete\` every item. The **RAII** pattern (Resource Acquisition Is Initialization) automates cleanup by tying resource lifetime to object scope.\n\n## What You'll Build\n\n- A \`createItem\` helper that allocates items with \`new\`\n- An \`ItemHolder\` struct that owns an item pointer and cleans it up in a \`destroy\` method\n- A managed inventory where items are created, used, and cleaned up safely\n\n## Key Concepts\n\n- **RAII pattern**: resources are acquired in init and released in cleanup\n- **Ownership**: the ItemHolder \"owns\" the item pointer and is responsible for freeing it\n- **Safe lifecycle**: create -> use -> destroy, with no chance of forgetting cleanup\n\n## Output Protocol\n\n- \`ENTITY|id|type|x|y|width|height\` for player and items\n- \`GAME_MESSAGE|text\` for lifecycle events\n- \`SCORE|value\` for successful managed items`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Item {
    string name;
    string type;
    int power;
};

struct ItemHolder {
    Item* ptr;
    int slot;
    // TODO: Add a destroy() method that:
    //   - Checks if ptr is not nullptr
    //   - Outputs: GAME_MESSAGE|Destroying <name> from slot <slot>
    //   - Deletes ptr and sets it to nullptr
};

// TODO: Write a function createManagedItem that takes name, type, power, slot
// - Allocates a new Item with 'new', fills in the fields
// - Creates and returns an ItemHolder with the pointer and slot
// - Outputs: GAME_MESSAGE|Created <name> in slot <slot>

// TODO: Write a function useItem that takes an ItemHolder by reference
// - Outputs: ENTITY|managed_<slot>|item|<slot*70+50>|280|16|16
// - Outputs: GAME_MESSAGE|Using <name>: +<power> <type> power

int main() {
    // Output: ENTITY|warrior|player|180|200|22|26
    // Output: GAME_MESSAGE|Initializing managed inventory...

    // Create 3 managed items:
    //   Slot 0: "Fire Staff", "weapon", 35
    //   Slot 1: "Mithril Vest", "armor", 20
    //   Slot 2: "Elixir", "consumable", 50

    // Use all 3 items
    // Destroy all 3 items (call destroy method on each holder)

    // Output: GAME_MESSAGE|All resources released safely!
    // Output: SCORE|3

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

struct ItemHolder {
    Item* ptr;
    int slot;

    void destroy() {
        if (ptr != nullptr) {
            cout << "GAME_MESSAGE|Destroying " << ptr->name
                 << " from slot " << slot << endl;
            delete ptr;
            ptr = nullptr;
        }
    }
};

ItemHolder createManagedItem(string name, string type, int power, int slot) {
    Item* item = new Item;
    item->name = name;
    item->type = type;
    item->power = power;
    cout << "GAME_MESSAGE|Created " << name << " in slot "
         << slot << endl;
    ItemHolder holder;
    holder.ptr = item;
    holder.slot = slot;
    return holder;
}

void useItem(ItemHolder& holder) {
    int xPos = holder.slot * 70 + 50;
    cout << "ENTITY|managed_" << holder.slot << "|item|" << xPos
         << "|280|16|16" << endl;
    cout << "GAME_MESSAGE|Using " << holder.ptr->name << ": +"
         << holder.ptr->power << " " << holder.ptr->type
         << " power" << endl;
}

int main() {
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "GAME_MESSAGE|Initializing managed inventory..." << endl;

    ItemHolder holders[3];
    holders[0] = createManagedItem("Fire Staff", "weapon", 35, 0);
    holders[1] = createManagedItem("Mithril Vest", "armor", 20, 1);
    holders[2] = createManagedItem("Elixir", "consumable", 50, 2);

    for (int i = 0; i < 3; i++) {
        useItem(holders[i]);
    }

    for (int i = 0; i < 3; i++) {
        holders[i].destroy();
    }

    cout << "GAME_MESSAGE|All resources released safely!" << endl;
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
      id: "init-message",
      description: "Displays managed inventory initialization",
      expectedOutput: "GAME_MESSAGE\\|Initializing managed inventory\\.\\.\\.",
      isPattern: true,
    },
    {
      id: "created-staff",
      description: "Creates Fire Staff in slot 0",
      expectedOutput: "GAME_MESSAGE\\|Created Fire Staff in slot 0",
      isPattern: true,
    },
    {
      id: "created-vest",
      description: "Creates Mithril Vest in slot 1",
      expectedOutput: "GAME_MESSAGE\\|Created Mithril Vest in slot 1",
      isPattern: true,
    },
    {
      id: "created-elixir",
      description: "Creates Elixir in slot 2",
      expectedOutput: "GAME_MESSAGE\\|Created Elixir in slot 2",
      isPattern: true,
    },
    {
      id: "use-staff-entity",
      description: "Renders Fire Staff item entity at managed position",
      expectedOutput: "ENTITY\\|managed_0\\|item\\|50\\|280\\|16\\|16",
      isPattern: true,
    },
    {
      id: "use-staff-message",
      description: "Displays Fire Staff usage with power",
      expectedOutput: "GAME_MESSAGE\\|Using Fire Staff: \\+35 weapon power",
      isPattern: true,
    },
    {
      id: "use-vest-entity",
      description: "Renders Mithril Vest item entity at managed position",
      expectedOutput: "ENTITY\\|managed_1\\|item\\|120\\|280\\|16\\|16",
      isPattern: true,
    },
    {
      id: "use-vest-message",
      description: "Displays Mithril Vest usage with power",
      expectedOutput: "GAME_MESSAGE\\|Using Mithril Vest: \\+20 armor power",
      isPattern: true,
    },
    {
      id: "use-elixir-entity",
      description: "Renders Elixir item entity at managed position",
      expectedOutput: "ENTITY\\|managed_2\\|item\\|190\\|280\\|16\\|16",
      isPattern: true,
    },
    {
      id: "use-elixir-message",
      description: "Displays Elixir usage with power",
      expectedOutput: "GAME_MESSAGE\\|Using Elixir: \\+50 consumable power",
      isPattern: true,
    },
    {
      id: "destroy-staff",
      description: "Destroys Fire Staff from slot 0",
      expectedOutput: "GAME_MESSAGE\\|Destroying Fire Staff from slot 0",
      isPattern: true,
    },
    {
      id: "destroy-vest",
      description: "Destroys Mithril Vest from slot 1",
      expectedOutput: "GAME_MESSAGE\\|Destroying Mithril Vest from slot 1",
      isPattern: true,
    },
    {
      id: "destroy-elixir",
      description: "Destroys Elixir from slot 2",
      expectedOutput: "GAME_MESSAGE\\|Destroying Elixir from slot 2",
      isPattern: true,
    },
    {
      id: "all-released",
      description: "Confirms all resources released safely",
      expectedOutput: "GAME_MESSAGE\\|All resources released safely!",
      isPattern: true,
    },
    {
      id: "score-managed",
      description: "Outputs score of 3 for managed items",
      expectedOutput: "SCORE\\|3",
      isPattern: true,
    },
  ],

  hints: [
    "ItemHolder wraps a raw Item* pointer and knows which slot it belongs to. Its destroy() method handles cleanup.",
    "createManagedItem uses new to allocate, then wraps the pointer in an ItemHolder and returns it.",
    "useItem accesses the item through holder.ptr->name, holder.ptr->power, etc.",
    "Call holders[i].destroy() in a loop to safely free all items. The method sets ptr to nullptr after delete.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Item {
    string name;
    string type;
    int power;
};

struct ItemHolder {
    Item* ptr;
    int slot;

    void destroy() {
        if (ptr != nullptr) {
            cout << "GAME_MESSAGE|Destroying " << ptr->name
                 << " from slot " << slot << endl;
            delete ptr;
            ptr = nullptr;
        }
    }
};

ItemHolder createManagedItem(string name, string type, int power, int slot) {
    Item* item = new Item;
    item->name = name;
    item->type = type;
    item->power = power;
    cout << "GAME_MESSAGE|Created " << name << " in slot "
         << slot << endl;
    ItemHolder holder;
    holder.ptr = item;
    holder.slot = slot;
    return holder;
}

void useItem(ItemHolder& holder) {
    int xPos = holder.slot * 70 + 50;
    cout << "ENTITY|managed_" << holder.slot << "|item|" << xPos
         << "|280|16|16" << endl;
    cout << "GAME_MESSAGE|Using " << holder.ptr->name << ": +"
         << holder.ptr->power << " " << holder.ptr->type
         << " power" << endl;
}

int main() {
    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "GAME_MESSAGE|Initializing managed inventory..." << endl;

    ItemHolder holders[3];
    holders[0] = createManagedItem("Fire Staff", "weapon", 35, 0);
    holders[1] = createManagedItem("Mithril Vest", "armor", 20, 1);
    holders[2] = createManagedItem("Elixir", "consumable", 50, 2);

    for (int i = 0; i < 3; i++) {
        useItem(holders[i]);
    }

    for (int i = 0; i < 3; i++) {
        holders[i].destroy();
    }

    cout << "GAME_MESSAGE|All resources released safely!" << endl;
    cout << "SCORE|3" << endl;

    return 0;
}`,
};
