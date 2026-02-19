import type { GameLessonVariant } from "@/types/game";

export const lesson01Robot: GameLessonVariant = {
  lessonId: "01-boot-the-system",

  instructions: `# Robot Builder: Boot the System

Your first task as a robotics engineer is to boot the differential-drive robot! Every robot needs an initialization sequence that sets its starting position and confirms all systems are online.

## Robot Protocol

The robot communicates through a structured text protocol. Each line of output is a command:

\`\`\`
ROBOT|position|x|y|theta     // Set the robot's position (x, y) and heading (theta in radians)
ROBOT|velocity|vl|vr          // Set wheel velocities (left, right)
ROBOT_MESSAGE|text            // Display a status message
MISSION_COMPLETE              // Signal that the task is finished
\`\`\`

## Your Task

1. Output the robot's initial position at the origin using the format \`ROBOT|position|0|0|0\` (x=0, y=0, theta=0)
2. Output a boot message using \`ROBOT_MESSAGE|System initialized - all sensors nominal\`
3. Output \`MISSION_COMPLETE\` to confirm the boot sequence is finished

Your output should look like:
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|System initialized - all sensors nominal
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Output the robot's initial position at the origin
    // Format: ROBOT|position|x|y|theta
    // The robot starts at x=0, y=0, facing angle theta=0

    // TODO: Output a boot message
    // Format: ROBOT_MESSAGE|your message here

    // TODO: Output MISSION_COMPLETE to confirm boot sequence

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Initialize robot at the origin
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT|velocity|0|0" << endl;
    cout << "ROBOT_MESSAGE|System initialized - all sensors nominal" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "position-origin",
      description: "Robot position at origin (0,0,0)",
      expectedOutput: "ROBOT\\|position\\|0\\|0\\|0",
      isPattern: true,
    },
    {
      id: "boot-message",
      description: "System initialization message",
      expectedOutput: "ROBOT_MESSAGE\\|System initialized",
      isPattern: true,
    },
    {
      id: "mission-complete",
      description: "Boot sequence confirmed",
      expectedOutput: "MISSION_COMPLETE",
      isPattern: true,
    },
  ],

  hints: [
    "Use cout << \"ROBOT|position|0|0|0\" << endl; to output the robot's position.",
    "The protocol format is strict: ROBOT|position|x|y|theta with no spaces around pipes.",
    "Output ROBOT_MESSAGE|your text to send a status message.",
    "End with MISSION_COMPLETE on its own line to confirm the boot sequence.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Initialize robot at the origin
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT|velocity|0|0" << endl;
    cout << "ROBOT_MESSAGE|System initialized - all sensors nominal" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
