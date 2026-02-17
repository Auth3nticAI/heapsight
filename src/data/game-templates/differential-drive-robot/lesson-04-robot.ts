import type { GameLessonVariant } from "@/types/game";

export const lesson04Robot: GameLessonVariant = {
  lessonId: "04-structs",

  instructions: `# Robot Builder: Radar Sweep

Robots use loops to repeat sensor operations. In this lesson the robot performs a full 360-degree radar sweep, taking distance readings at 8 evenly spaced angles -- just like a real LIDAR scanner.

## Robot Protocol

\`\`\`
ROBOT|position|x|y|theta     // Report position (theta updates as the robot rotates)
ROBOT|sensor|distance|angle   // Report a sensor reading at the given angle (radians)
ROBOT_MESSAGE|text            // Broadcast status messages
MISSION_COMPLETE              // Signal the sweep is finished
\`\`\`

## Your Task

1. Use a \`for\` loop to iterate 8 times (\`i = 0\` to \`7\`):
   - Calculate degrees: \`degrees = i * 45.0\`
   - Convert to radians: \`radians = degrees * M_PI / 180.0\`
   - Simulate a sensor distance: \`distance = 2.0 + (i % 3) * 0.5\` (creates a pattern of 2.0, 2.5, 3.0, 2.0, 2.5, ...)
   - Output the sensor reading: \`ROBOT|sensor|distance|radians\`
   - Update theta to the current radians
   - Output the updated position: \`ROBOT|position|x|y|theta\`
2. After the loop, output: \`ROBOT_MESSAGE|Radar sweep complete: 8 readings\`
3. Output: \`MISSION_COMPLETE\`
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double x = 0.0;
    double y = 0.0;
    double theta = 0.0;

    cout << "ROBOT_MESSAGE|Beginning radar sweep" << endl;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // TODO: Use a for loop to perform a radar sweep
    // Rotate from 0 to 315 degrees in 45-degree steps (8 readings total)
    // For each step:
    //   1. Convert degrees to radians: radians = degrees * M_PI / 180.0
    //   2. Simulate a sensor reading: distance = 2.0 + (i % 3) * 0.5
    //      (this creates varying distances: 2.0, 2.5, 3.0, 2.0, 2.5, ...)
    //   3. Output: ROBOT|sensor|distance|radians
    //   4. Update theta to current radians
    //   5. Output: ROBOT|position|x|y|theta

    // TODO: Output sweep complete message
    // ROBOT_MESSAGE|Radar sweep complete: 8 readings
    // MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double x = 0.0;
    double y = 0.0;
    double theta = 0.0;

    cout << "ROBOT_MESSAGE|Beginning radar sweep" << endl;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // Radar sweep: 8 readings at 45-degree intervals
    for (int i = 0; i < 8; i++) {
        double degrees = i * 45.0;
        double radians = degrees * M_PI / 180.0;
        double distance = 2.0 + (i % 3) * 0.5;

        cout << "ROBOT|sensor|" << distance << "|" << radians << endl;

        theta = radians;
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    }

    cout << "ROBOT_MESSAGE|Radar sweep complete: 8 readings" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "sweep-start",
      description: "Radar sweep begins",
      expectedOutput: "ROBOT_MESSAGE\\|Beginning radar sweep",
      isPattern: true,
    },
    {
      id: "sensor-readings",
      description: "At least one sensor reading output",
      expectedOutput: "ROBOT\\|sensor\\|",
      isPattern: true,
    },
    {
      id: "sweep-complete",
      description: "Sweep complete with 8 readings",
      expectedOutput: "ROBOT_MESSAGE\\|Radar sweep complete: 8 readings",
      isPattern: true,
    },
    {
      id: "mission-complete",
      description: "Mission complete after sweep",
      expectedOutput: "MISSION_COMPLETE",
      isPattern: true,
    },
  ],

  hints: [
    "Use for (int i = 0; i < 8; i++) to loop through 8 sweep angles.",
    "Convert degrees to radians: radians = degrees * M_PI / 180.0 (include <cmath>).",
    "Vary the sensor distance with a pattern like 2.0 + (i % 3) * 0.5.",
    "Output both the sensor reading and the updated robot position each iteration.",
  ],

  accumulatedCode: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double x = 0.0;
    double y = 0.0;
    double theta = 0.0;

    cout << "ROBOT_MESSAGE|Beginning radar sweep" << endl;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // Radar sweep: 8 readings at 45-degree intervals
    for (int i = 0; i < 8; i++) {
        double degrees = i * 45.0;
        double radians = degrees * M_PI / 180.0;
        double distance = 2.0 + (i % 3) * 0.5;

        cout << "ROBOT|sensor|" << distance << "|" << radians << endl;

        theta = radians;
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    }

    cout << "ROBOT_MESSAGE|Radar sweep complete: 8 readings" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
