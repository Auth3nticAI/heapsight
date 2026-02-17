import type { GameLessonVariant } from "@/types/game";

export const lesson18SpaceShooter: GameLessonVariant = {
  lessonId: "18-score-system",
  instructions: `# Score Component — Global State Accumulation\n\nIn ECS, **score** is a singleton component — there's only one, and multiple systems can update it. Rather than storing it inside an entity, we keep it as a global value that systems read and write.\n\nA clean pattern is a function \`addScore(int& score, int points)\` that takes the score by **reference** and adds points to it.\n\n## Your Task\n\n1. Declare a global \`int score = 0;\`\n2. Write \`void addScore(int& score, int points)\` that adds points and outputs \`SCORE|<new total>\`\n3. Kill 3 enemies worth different points:\n   - enemy1: 10 points\n   - enemy2: 25 points\n   - enemy3: 50 points\n4. After each kill, call \`addScore\` and output a \`GAME_MESSAGE\`\n5. Render the ship entity\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write addScore function: takes score by reference, adds points, outputs SCORE

int main() {
    int score = 0;

    // Kill enemy1 (10 pts), enemy2 (25 pts), enemy3 (50 pts)
    // After each kill: addScore and output GAME_MESSAGE
    // Render ship entity

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

void addScore(int& score, int points) {
    score += points;
    cout << "SCORE|" << score << endl;
}

int main() {
    int score = 0;

    addScore(score, 10);
    cout << "GAME_MESSAGE|enemy1 destroyed! +10 points" << endl;

    addScore(score, 25);
    cout << "GAME_MESSAGE|enemy2 destroyed! +25 points" << endl;

    addScore(score, 50);
    cout << "GAME_MESSAGE|enemy3 destroyed! +50 points" << endl;

    cout << "ENTITY|ship|player|180|220|24|24" << endl;

    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should output SCORE 10 after first kill",
      expectedOutput: "SCORE\\|10",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should output SCORE 35 after second kill",
      expectedOutput: "SCORE\\|35",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should output SCORE 85 after third kill",
      expectedOutput: "SCORE\\|85",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should output enemy1 destroyed message",
      expectedOutput: "GAME_MESSAGE\\|enemy1 destroyed! \\+10 points",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should output enemy3 destroyed message",
      expectedOutput: "GAME_MESSAGE\\|enemy3 destroyed! \\+50 points",
      isPattern: true,
    },
    {
      id: "t6",
      description: "Should render ship entity",
      expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24",
      isPattern: true,
    },
  ],
  hints: [
    "Use `int&` (reference) so addScore modifies the original score variable in main.",
    "Inside addScore: `score += points;` then `cout << \"SCORE|\" << score << endl;`",
    "Call addScore three times with 10, 25, 50 — the running totals will be 10, 35, 85.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

void addScore(int& score, int points) {
    score += points;
    cout << "SCORE|" << score << endl;
}

int main() {
    int score = 0;

    addScore(score, 10);
    cout << "GAME_MESSAGE|enemy1 destroyed! +10 points" << endl;

    addScore(score, 25);
    cout << "GAME_MESSAGE|enemy2 destroyed! +25 points" << endl;

    addScore(score, 50);
    cout << "GAME_MESSAGE|enemy3 destroyed! +50 points" << endl;

    cout << "ENTITY|ship|player|180|220|24|24" << endl;

    return 0;
}
`,
};
