import type { Lesson } from "@/types/lesson";

export const lesson20: Lesson = {
  id: "20-effects",
  title: "Effects System",
  description: "Create visual effects through output simulation.",
  order: 20,
  xpReward: 100,
  tier: "pro",
  concepts: ["visual effects", "particle simulation", "output patterns"],
  part1: {
    title: "Concept: Effects",
    type: "concept",
    instructions: `# Effects System

Games use effects (explosions, particles, flashes) to feel alive. We'll simulate effects by generating entity output patterns.

## Effect as Multiple Entities
An explosion can be a cluster of small entities:
\`\`\`cpp
for (int i = 0; i < 4; i++) {
    int px = centerX + offsets[i];
    // render particle at px
}
\`\`\`

## Your Task
Create an "explosion" effect: 4 particles spreading from center (150, 100). Offsets: -20, -10, 10, 20.

\`\`\`
Particle at 130
Particle at 140
Particle at 160
Particle at 170
Boom!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int centerX = 150;
    int offsets[4] = {-20, -10, 10, 20};

    // Loop through offsets and print particles

    // Print boom message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int centerX = 150;
    int offsets[4] = {-20, -10, 10, 20};

    for (int i = 0; i < 4; i++) {
        cout << "Particle at " << centerX + offsets[i] << endl;
    }
    cout << "Boom!" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show explosion particles", expectedOutput: "Particle at 130\nParticle at 140\nParticle at 160\nParticle at 170\nBoom!\n" },
    ],
    hints: [
      "Each particle: `centerX + offsets[i]`",
      "130 = 150 + (-20), 140 = 150 + (-10), etc.",
      "Print the boom message after the loop.",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Explosions",
    type: "game_builder",
    instructions: `# Game Builder: Explosion Effect

When an enemy dies, show an explosion! Render particles as small projectile entities around the explosion center.

## Your Task
1. Render player and a dead enemy (0 HP)
2. Create 4 explosion particles around the enemy's position (300, 100)
3. Particles are small (4x4) projectile entities

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|100|20|20|0
ENTITY|fx0|projectile|280|100|4|4
ENTITY|fx1|projectile|290|100|4|4
ENTITY|fx2|projectile|310|100|4|4
ENTITY|fx3|projectile|320|100|4|4
GAME_MESSAGE|Enemy destroyed! Boom!
SCORE|100
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Render player and dead enemy

    // Explosion particles around enemy position (300, 100)
    int offsets[4] = {-20, -10, 10, 20};

    // Loop and render particles

    // Message and score

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|hero|player|180|200|24|24|100" << endl;
    cout << "ENTITY|enemy1|enemy|300|100|20|20|0" << endl;

    int cx = 300, cy = 100;
    int offsets[4] = {-20, -10, 10, 20};

    for (int i = 0; i < 4; i++) {
        cout << "ENTITY|fx" << i << "|projectile|" << cx + offsets[i] << "|" << cy << "|4|4" << endl;
    }

    cout << "GAME_MESSAGE|Enemy destroyed! Boom!" << endl;
    cout << "SCORE|100" << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render explosion particles", expectedOutput: "ENTITY\\|fx3\\|projectile\\|320\\|100\\|4\\|4", isPattern: true },
      { id: "g2", description: "Should show boom message", expectedOutput: "GAME_MESSAGE\\|Enemy destroyed! Boom!", isPattern: true },
    ],
    hints: [
      "Particles use `projectile` type so they appear as circles.",
      "Each particle: `cx + offsets[i]` for x position.",
      "Entity IDs: fx0, fx1, fx2, fx3.",
    ],
    estimatedMinutes: 6,
  },
};
