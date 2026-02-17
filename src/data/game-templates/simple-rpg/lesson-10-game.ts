import type { GameLessonVariant } from "@/types/game";

export const lesson10SimpleRpg: GameLessonVariant = {
  lessonId: "10-dynamic-memory",

  instructions: `# Party System — Dynamic Character Allocation\n\nRPG party members often join and leave at runtime. **Dynamic memory** with \`new\` and \`delete\` lets you create characters on the heap when they join the party and clean them up when they leave.\n\n## Objectives\n- Define a \`PartyMember\` struct with name, role, hp, x, y fields\n- Use \`new\` to dynamically allocate a warrior and a mage\n- Render both party members as entities\n- Display a party summary message\n- Clean up with \`delete\` to prevent memory leaks\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height|health\` — render party members\n- \`GAME_MESSAGE|text\` — party info\n- \`SCORE|value\` — total party HP`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct PartyMember {
    string name;
    string role;
    int hp;
    int x;
    int y;
};

int main() {
    // Use new to create a warrior:
    //   name="Aldric", role="warrior", hp=120, x=160, y=200

    // Use new to create a mage:
    //   name="Elara", role="mage", hp=80, x=220, y=200

    // Render warrior: ENTITY|aldric|player|160|200|22|26|120
    // Render mage:    ENTITY|elara|player|220|200|20|24|80

    // Output: GAME_MESSAGE|Party formed: Aldric (warrior) and Elara (mage)
    // Output: SCORE|<totalHP>  (120 + 80 = 200)

    // Clean up: delete both party members

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct PartyMember {
    string name;
    string role;
    int hp;
    int x;
    int y;
};

int main() {
    // Dynamically allocate party members
    PartyMember* warrior = new PartyMember;
    warrior->name = "Aldric";
    warrior->role = "warrior";
    warrior->hp = 120;
    warrior->x = 160;
    warrior->y = 200;

    PartyMember* mage = new PartyMember;
    mage->name = "Elara";
    mage->role = "mage";
    mage->hp = 80;
    mage->x = 220;
    mage->y = 200;

    // Render party members as entities
    cout << "ENTITY|aldric|player|" << warrior->x << "|" << warrior->y
         << "|22|26|" << warrior->hp << endl;
    cout << "ENTITY|elara|player|" << mage->x << "|" << mage->y
         << "|20|24|" << mage->hp << endl;

    // Party summary
    int totalHP = warrior->hp + mage->hp;
    cout << "GAME_MESSAGE|Party formed: " << warrior->name
         << " (" << warrior->role << ") and " << mage->name
         << " (" << mage->role << ")" << endl;
    cout << "SCORE|" << totalHP << endl;

    // Clean up dynamic memory
    delete warrior;
    delete mage;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Renders warrior Aldric with 120 HP",
      expectedOutput: "ENTITY\\|aldric\\|player\\|160\\|200\\|22\\|26\\|120",
      isPattern: true,
    },
    {
      id: "mage-entity",
      description: "Renders mage Elara with 80 HP",
      expectedOutput: "ENTITY\\|elara\\|player\\|220\\|200\\|20\\|24\\|80",
      isPattern: true,
    },
    {
      id: "party-message",
      description: "Displays party formation message",
      expectedOutput:
        "GAME_MESSAGE\\|Party formed: Aldric \\(warrior\\) and Elara \\(mage\\)",
      isPattern: true,
    },
    {
      id: "score-total-hp",
      description: "Score equals total party HP (120 + 80 = 200)",
      expectedOutput: "SCORE\\|200",
      isPattern: true,
    },
  ],

  hints: [
    "Use new to allocate: PartyMember* warrior = new PartyMember; then set fields with warrior->name = \"Aldric\";",
    "Access struct fields through pointers with the arrow operator: warrior->hp, mage->x, etc.",
    "Always delete dynamically allocated memory at the end: delete warrior; delete mage;",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct PartyMember {
    string name;
    string role;
    int hp;
    int x;
    int y;
};

int main() {
    // Dynamically allocate party members
    PartyMember* warrior = new PartyMember;
    warrior->name = "Aldric";
    warrior->role = "warrior";
    warrior->hp = 120;
    warrior->x = 160;
    warrior->y = 200;

    PartyMember* mage = new PartyMember;
    mage->name = "Elara";
    mage->role = "mage";
    mage->hp = 80;
    mage->x = 220;
    mage->y = 200;

    // Render party members as entities
    cout << "ENTITY|aldric|player|" << warrior->x << "|" << warrior->y
         << "|22|26|" << warrior->hp << endl;
    cout << "ENTITY|elara|player|" << mage->x << "|" << mage->y
         << "|20|24|" << mage->hp << endl;

    // Party summary
    int totalHP = warrior->hp + mage->hp;
    cout << "GAME_MESSAGE|Party formed: " << warrior->name
         << " (" << warrior->role << ") and " << mage->name
         << " (" << mage->role << ")" << endl;
    cout << "SCORE|" << totalHP << endl;

    // Clean up dynamic memory
    delete warrior;
    delete mage;

    return 0;
}`,
};
