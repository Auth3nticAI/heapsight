import type { Lesson } from "@/types/lesson";

export const lesson11: Lesson = {
  id: "11-strings",
  title: "Strings",
  description: "Work with text using std::string operations.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["std::string", "concatenation", "length", "substr"],
  part1: {
    title: "Concept: Strings",
    type: "concept",
    instructions: `# Strings

C++ \`string\` makes text handling easy (compared to C-style char arrays).

## String Operations
\`\`\`cpp
string name = "Hero";
string title = "the Brave";
string full = name + " " + title;  // "Hero the Brave"
int len = name.length();           // 4
\`\`\`

## Useful Methods
- \`str.length()\` — number of characters
- \`str + str2\` — concatenation
- \`str[0]\` — first character

## Your Task
Create a hero name by combining a title and name, then print:
\`\`\`
Name: Shadow Knight
Length: 13
First char: S
\`\`\`

Use \`title = "Shadow"\` and \`name = "Knight"\`.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string title = "Shadow";
    string name = "Knight";

    // Combine into full name

    // Print name, length, first character

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string title = "Shadow";
    string name = "Knight";

    string full = title + " " + name;

    cout << "Name: " << full << endl;
    cout << "Length: " << full.length() << endl;
    cout << "First char: " << full[0] << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show combined name and info", expectedOutput: "Name: Shadow Knight\nLength: 13\nFirst char: S\n" },
    ],
    hints: [
      'Concatenate: `string full = title + " " + name;`',
      "Use `full.length()` to get the character count.",
      "`full[0]` gives the first character.",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Named Entities",
    type: "game_builder",
    instructions: `# Game Builder: String-Based Entity IDs

Strings let you create dynamic entity IDs and build rich game messages.

## Your Task
1. Create entity names by combining strings: \`"fire_"\` + \`"mage"\`
2. Build a player and enemy with string IDs
3. Create a combat message using concatenation

Expected output:
\`\`\`
ENTITY|fire_mage|player|180|200|24|24|100
ENTITY|ice_golem|enemy|300|120|28|28|80
GAME_MESSAGE|fire_mage vs ice_golem - Fight!
SCORE|0
\`\`\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Build entity names using string concatenation
    string playerName = "fire_" + string("mage");
    // Build enemy name: "ice_" + "golem"

    // Render entities

    // Build and show combat message

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string playerName = "fire_" + string("mage");
    string enemyName = "ice_" + string("golem");

    cout << "ENTITY|" << playerName << "|player|180|200|24|24|100" << endl;
    cout << "ENTITY|" << enemyName << "|enemy|300|120|28|28|80" << endl;
    cout << "GAME_MESSAGE|" << playerName << " vs " << enemyName << " - Fight!" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render fire_mage player", expectedOutput: "ENTITY\\|fire_mage\\|player", isPattern: true },
      { id: "g2", description: "Should render ice_golem enemy", expectedOutput: "ENTITY\\|ice_golem\\|enemy", isPattern: true },
      { id: "g3", description: "Should show vs message", expectedOutput: "GAME_MESSAGE\\|fire_mage vs ice_golem", isPattern: true },
    ],
    hints: [
      'Use `string("golem")` to ensure proper concatenation with string literal.',
      "Insert string variables into entity output with `<< playerName <<`.",
      "Build the message: `playerName + \" vs \" + enemyName + ...`",
    ],
    estimatedMinutes: 5,
  },
};
