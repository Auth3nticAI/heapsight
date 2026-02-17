import type { GameLessonVariant } from "@/types/game";

export const lesson07SimpleRpg: GameLessonVariant = {
  lessonId: "07-loops",

  instructions: `# Encounter Generator — Loop-Spawned Enemies\n\nIn data-driven RPGs, encounters are generated procedurally. A **for loop** can spawn multiple enemies at calculated positions, with stats that vary by index.\n\n## Objectives\n- Render a warrior entity as the player character\n- Use a for loop to spawn 4 goblin enemies\n- Each goblin's x position and HP vary based on its index\n- Display a summary message with total enemies spawned\n\n## Enemy Placement Formula\n- Goblin \`i\` (0-based): id = \`"goblin" + (i+1)\`, x = \`80 + i * 70\`, y = \`160\`, size = \`18x18\`\n- Goblin HP = \`20 + i * 10\` (so 20, 30, 40, 50)\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height|health\` — render each character\n- \`GAME_MESSAGE|text\` — encounter summary\n- \`SCORE|value\` — total enemy HP`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Render warrior at (180,200) size 22x26 with 100 HP
    // Format: ENTITY|warrior|player|180|200|22|26|100

    // Use a for loop (i = 0 to 3) to spawn 4 goblins:
    //   id: "goblin" + to_string(i + 1)
    //   type: "enemy"
    //   x: 80 + i * 70,  y: 160
    //   size: 18x18
    //   HP: 20 + i * 10
    // Format: ENTITY|goblinN|enemy|x|160|18|18|hp

    // Track total enemy HP across all goblins
    // Output: GAME_MESSAGE|4 goblins block the path! Total HP: <totalHP>
    // Output: SCORE|<totalHP>

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Render warrior
    cout << "ENTITY|warrior|player|180|200|22|26|100" << endl;

    // Spawn 4 goblins with loop
    int totalHP = 0;
    for (int i = 0; i < 4; i++) {
        string id = "goblin" + to_string(i + 1);
        int x = 80 + i * 70;
        int hp = 20 + i * 10;
        totalHP += hp;
        cout << "ENTITY|" << id << "|enemy|" << x << "|160|18|18|" << hp << endl;
    }

    // Encounter summary
    cout << "GAME_MESSAGE|4 goblins block the path! Total HP: " << totalHP << endl;
    cout << "SCORE|" << totalHP << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Renders warrior entity with 100 HP",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin1-spawn",
      description: "Spawns goblin1 at x=80 with 20 HP",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|80\\|160\\|18\\|18\\|20",
      isPattern: true,
    },
    {
      id: "goblin2-spawn",
      description: "Spawns goblin2 at x=150 with 30 HP",
      expectedOutput: "ENTITY\\|goblin2\\|enemy\\|150\\|160\\|18\\|18\\|30",
      isPattern: true,
    },
    {
      id: "goblin3-spawn",
      description: "Spawns goblin3 at x=220 with 40 HP",
      expectedOutput: "ENTITY\\|goblin3\\|enemy\\|220\\|160\\|18\\|18\\|40",
      isPattern: true,
    },
    {
      id: "goblin4-spawn",
      description: "Spawns goblin4 at x=290 with 50 HP",
      expectedOutput: "ENTITY\\|goblin4\\|enemy\\|290\\|160\\|18\\|18\\|50",
      isPattern: true,
    },
    {
      id: "encounter-message",
      description: "Displays encounter summary with total HP (20+30+40+50=140)",
      expectedOutput: "GAME_MESSAGE\\|4 goblins block the path! Total HP: 140",
      isPattern: true,
    },
    {
      id: "score-total-hp",
      description: "Outputs score equal to total enemy HP",
      expectedOutput: "SCORE\\|140",
      isPattern: true,
    },
  ],

  hints: [
    "Use a for loop: for (int i = 0; i < 4; i++) to iterate 4 times.",
    "Build the goblin id with string concatenation: \"goblin\" + to_string(i + 1).",
    "Calculate x = 80 + i * 70 and hp = 20 + i * 10 inside the loop.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Render warrior
    cout << "ENTITY|warrior|player|180|200|22|26|100" << endl;

    // Spawn 4 goblins with loop
    int totalHP = 0;
    for (int i = 0; i < 4; i++) {
        string id = "goblin" + to_string(i + 1);
        int x = 80 + i * 70;
        int hp = 20 + i * 10;
        totalHP += hp;
        cout << "ENTITY|" << id << "|enemy|" << x << "|160|18|18|" << hp << endl;
    }

    // Encounter summary
    cout << "GAME_MESSAGE|4 goblins block the path! Total HP: " << totalHP << endl;
    cout << "SCORE|" << totalHP << endl;

    return 0;
}`,
};
