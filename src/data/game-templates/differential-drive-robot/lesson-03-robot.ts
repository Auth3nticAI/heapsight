import type { GameLessonVariant } from "@/types/game";

export const lesson03Robot: GameLessonVariant = {
  lessonId: "03-bullet-math",

  instructions: `# Robot Builder: Low Battery Reflex

Autonomous robots need reactive behaviors -- they must respond to sensor data in real time. In this lesson the robot checks its battery level and takes protective action when power is low, just like a real rover entering safe mode.

## Robot Protocol

\`\`\`
ROBOT|position|x|y|theta     // Report the robot's current position
ROBOT|velocity|vl|vr          // Set wheel velocities (0|0 to stop)
ROBOT_MESSAGE|text            // Broadcast warnings or status messages
\`\`\`

## Your Task

1. Check the battery level using an \`if/else\` conditional:
   - **If \`battery < 20.0\`:**
     - Output: \`ROBOT_MESSAGE|WARNING: Low battery (15%)\`
     - Output: \`ROBOT|velocity|0|0\` (stop the robot)
     - Output: \`ROBOT_MESSAGE|Entering power save mode\`
   - **Else:**
     - Output: \`ROBOT_MESSAGE|Battery OK (XX.X%)\`
     - Output: \`ROBOT|velocity|1|0\` (continue moving)
2. Check for critically low battery with a second \`if\` statement:
   - **If \`battery < 5.0\`:**
     - Output: \`ROBOT_MESSAGE|CRITICAL: Immediate recharge required\`

Since battery is set to 15.0, the low-battery branch should trigger and the robot should stop.
`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    double x = 3.0;
    double y = 1.0;
    double theta = 1.57;
    double battery = 15.0;

    // Output current position
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // TODO: Check battery level and react
    // If battery < 20.0:
    //   Output: ROBOT_MESSAGE|WARNING: Low battery (XX.X%)
    //   Output: ROBOT|velocity|0|0  (stop moving)
    //   Output: ROBOT_MESSAGE|Entering power save mode
    // Else:
    //   Output: ROBOT_MESSAGE|Battery OK (XX.X%)
    //   Output: ROBOT|velocity|1|0  (continue moving)

    // TODO: Check if battery is critically low
    // If battery < 5.0:
    //   Output: ROBOT_MESSAGE|CRITICAL: Immediate recharge required

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    double x = 3.0;
    double y = 1.0;
    double theta = 1.57;
    double battery = 15.0;

    // Output current position
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // Reactive behavior: check battery level
    if (battery < 20.0) {
        cout << "ROBOT_MESSAGE|WARNING: Low battery (" << battery << "%)" << endl;
        cout << "ROBOT|velocity|0|0" << endl;
        cout << "ROBOT_MESSAGE|Entering power save mode" << endl;
    } else {
        cout << "ROBOT_MESSAGE|Battery OK (" << battery << "%)" << endl;
        cout << "ROBOT|velocity|1|0" << endl;
    }

    // Critical battery check
    if (battery < 5.0) {
        cout << "ROBOT_MESSAGE|CRITICAL: Immediate recharge required" << endl;
    }

    return 0;
}`,

  tests: [
    {
      id: "position-output",
      description: "Robot outputs its position",
      expectedOutput: "ROBOT\\|position\\|3\\|1\\|1\\.57",
      isPattern: true,
    },
    {
      id: "low-battery-warning",
      description: "Low battery warning triggered",
      expectedOutput: "ROBOT_MESSAGE\\|WARNING: Low battery",
      isPattern: true,
    },
    {
      id: "power-save",
      description: "Robot stops and enters power save mode",
      expectedOutput: "ROBOT_MESSAGE\\|Entering power save mode",
      isPattern: true,
    },
    {
      id: "velocity-stop",
      description: "Robot velocity set to zero",
      expectedOutput: "ROBOT\\|velocity\\|0\\|0",
      isPattern: true,
    },
  ],

  hints: [
    "Use if (battery < 20.0) to check for low battery.",
    "Inside the if block, output the warning and stop the robot with velocity 0|0.",
    "Use else for the normal case where battery is sufficient.",
    "You can nest if statements or chain them for the critical battery check.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    double x = 3.0;
    double y = 1.0;
    double theta = 1.57;
    double battery = 15.0;

    // Output current position
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // Reactive behavior: check battery level
    if (battery < 20.0) {
        cout << "ROBOT_MESSAGE|WARNING: Low battery (" << battery << "%)" << endl;
        cout << "ROBOT|velocity|0|0" << endl;
        cout << "ROBOT_MESSAGE|Entering power save mode" << endl;
    } else {
        cout << "ROBOT_MESSAGE|Battery OK (" << battery << "%)" << endl;
        cout << "ROBOT|velocity|1|0" << endl;
    }

    // Critical battery check
    if (battery < 5.0) {
        cout << "ROBOT_MESSAGE|CRITICAL: Immediate recharge required" << endl;
    }

    return 0;
}`,
};
