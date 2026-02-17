import type { Lesson } from "@/types/lesson";

export const lesson21: Lesson = {
  id: "21-save-load",
  title: "Save/Load",
  description: "Simulate game save/load with serialization concepts.",
  order: 21,
  xpReward: 125,
  tier: "pro",
  concepts: ["serialization", "data persistence", "save format"],
  part1: {
    title: "Concept: Serialization",
    type: "concept",
    instructions: `# Save/Load System

Games save state by **serializing** data to a format that can be read back. We'll simulate this with structured output.

## Save Format
\`\`\`
SAVE|playerHP|score|level
\`\`\`

## Your Task
Create a game state (hp=75, score=1200, level=4) and output it in save format, then "load" it by parsing the values:

\`\`\`
Saving: 75|1200|4
Loaded HP: 75
Loaded Score: 1200
Loaded Level: 4
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 75;
    int score = 1200;
    int level = 4;

    // Output save format

    // Simulate loading (just print the values as if loaded)

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int hp = 75;
    int score = 1200;
    int level = 4;

    cout << "Saving: " << hp << "|" << score << "|" << level << endl;
    cout << "Loaded HP: " << hp << endl;
    cout << "Loaded Score: " << score << endl;
    cout << "Loaded Level: " << level << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show save and load output", expectedOutput: "Saving: 75|1200|4\nLoaded HP: 75\nLoaded Score: 1200\nLoaded Level: 4\n" },
    ],
    hints: [
      "Save: `cout << \"Saving: \" << hp << \"|\" << score << \"|\" << level << endl;`",
      "Load is simulated — just print the same values with labels.",
      "In real games, you'd write to a file and read it back.",
    ],
    estimatedMinutes: 3,
  },
  part2: {
    title: "Game: Checkpoint",
    type: "game_builder",
    instructions: `# Game Builder: Save Checkpoint

Simulate a save system — output the current game state as both visual entities and a save string.

## Your Task
Render the game state and output a GAME_MESSAGE with the serialized save data.

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|75
ENTITY|enemy1|enemy|300|100|20|20|40
SCORE|1200
GAME_MESSAGE|Checkpoint saved: HP=75 Score=1200 Wave=4
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 75;
    int score = 1200;
    int wave = 4;

    // Render game state

    // Output checkpoint message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 75;
    int score = 1200;
    int wave = 4;

    cout << "ENTITY|hero|player|180|200|24|24|" << playerHP << endl;
    cout << "ENTITY|enemy1|enemy|300|100|20|20|40" << endl;
    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Checkpoint saved: HP=" << playerHP << " Score=" << score << " Wave=" << wave << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render player HP", expectedOutput: "ENTITY\\|hero\\|player\\|.*\\|75", isPattern: true },
      { id: "g2", description: "Should show checkpoint message", expectedOutput: "GAME_MESSAGE\\|Checkpoint saved: HP=75 Score=1200 Wave=4", isPattern: true },
    ],
    hints: [
      "Build the checkpoint string with `<<` chaining.",
      "Include all values: HP, Score, Wave.",
      "The SCORE protocol shows the actual score number.",
    ],
    estimatedMinutes: 5,
  },
};
