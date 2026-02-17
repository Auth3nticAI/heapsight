import type { GameLessonVariant } from "@/types/game";

export const lesson19Platformer: GameLessonVariant = {
  lessonId: "19-difficulty",
  instructions: `# Level Scaling — Platform Spacing & Hazard Density\n\nDifficulty in platformers often comes from **physics parameters**, not just adding more enemies. A key technique: increase the **gap** between platforms as the level increases, forcing longer and more precise jumps.\n\n\`scaleGap(int base, int level)\` computes the gap as \`base + level * 20\`. At level 1 the gap is modest; by level 3 it is significantly wider.\n\n## Your Task\n\n1. Write \`int scaleGap(int base, int level)\` that returns \`base + level * 20\`\n2. Generate 3 platforms for **level 1** starting at x=0 with base gap=40\n3. Generate 3 platforms for **level 3** starting at x=0 with the same base gap=40\n4. Output all platforms with their level label, plus a summary message\n\nEach platform is 60 wide and 10 tall at y=200. The next platform starts at: previous x + previous width + gap.\n\n## Protocol Reminder\n- \`ENTITY|id|type|x|y|width|height\`\n- \`GAME_MESSAGE|text\`\n- \`SCORE|value\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write scaleGap(int base, int level): returns base + level * 20

int main() {
    int baseGap = 40;
    int platWidth = 60;
    int platHeight = 10;
    int platY = 200;

    // Generate 3 platforms for level 1
    // Generate 3 platforms for level 3
    // Output all platforms and a summary message

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int scaleGap(int base, int level) {
    return base + level * 20;
}

int main() {
    int baseGap = 40;
    int platWidth = 60;
    int platHeight = 10;
    int platY = 200;

    int gap1 = scaleGap(baseGap, 1);
    int x = 0;
    for (int i = 1; i <= 3; i++) {
        cout << "ENTITY|L1P" << i << "|platform|"
             << x << "|" << platY << "|"
             << platWidth << "|" << platHeight << endl;
        x += platWidth + gap1;
    }

    int gap3 = scaleGap(baseGap, 3);
    x = 0;
    for (int i = 1; i <= 3; i++) {
        cout << "ENTITY|L3P" << i << "|platform|"
             << x << "|" << platY << "|"
             << platWidth << "|" << platHeight << endl;
        x += platWidth + gap3;
    }

    cout << "ENTITY|runner|player|10|176|16|24" << endl;
    cout << "GAME_MESSAGE|Level 1 gap: " << gap1 << "px, Level 3 gap: " << gap3 << "px" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Should render level 1 first platform at x=0",
      expectedOutput: "ENTITY\\|L1P1\\|platform\\|0\\|200\\|60\\|10",
      isPattern: true,
    },
    {
      id: "t2",
      description: "Should render level 1 second platform at x=120 (0+60+60gap)",
      expectedOutput: "ENTITY\\|L1P2\\|platform\\|120\\|200\\|60\\|10",
      isPattern: true,
    },
    {
      id: "t3",
      description: "Should render level 3 first platform at x=0",
      expectedOutput: "ENTITY\\|L3P1\\|platform\\|0\\|200\\|60\\|10",
      isPattern: true,
    },
    {
      id: "t4",
      description: "Should render level 3 second platform at x=160 (0+60+100gap)",
      expectedOutput: "ENTITY\\|L3P2\\|platform\\|160\\|200\\|60\\|10",
      isPattern: true,
    },
    {
      id: "t5",
      description: "Should show gap comparison message",
      expectedOutput: "GAME_MESSAGE\\|Level 1 gap: 60px, Level 3 gap: 100px",
      isPattern: true,
    },
    {
      id: "t6",
      description: "Should render player entity",
      expectedOutput: "ENTITY\\|runner\\|player\\|10\\|176\\|16\\|24",
      isPattern: true,
    },
  ],
  hints: [
    "`scaleGap` is simple arithmetic: `return base + level * 20;` — level 1 gives 40+20=60, level 3 gives 40+60=100.",
    "Track x position: start at 0, after each platform add `platWidth + gap` to get the next x.",
    "Use string concatenation in the ENTITY id: `\"L1P\" << i` to label each platform uniquely.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int scaleGap(int base, int level) {
    return base + level * 20;
}

int main() {
    int baseGap = 40;
    int platWidth = 60;
    int platHeight = 10;
    int platY = 200;

    int gap1 = scaleGap(baseGap, 1);
    int x = 0;
    for (int i = 1; i <= 3; i++) {
        cout << "ENTITY|L1P" << i << "|platform|"
             << x << "|" << platY << "|"
             << platWidth << "|" << platHeight << endl;
        x += platWidth + gap1;
    }

    int gap3 = scaleGap(baseGap, 3);
    x = 0;
    for (int i = 1; i <= 3; i++) {
        cout << "ENTITY|L3P" << i << "|platform|"
             << x << "|" << platY << "|"
             << platWidth << "|" << platHeight << endl;
        x += platWidth + gap3;
    }

    cout << "ENTITY|runner|player|10|176|16|24" << endl;
    cout << "GAME_MESSAGE|Level 1 gap: " << gap1 << "px, Level 3 gap: " << gap3 << "px" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
