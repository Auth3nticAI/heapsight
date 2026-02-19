import type { GameLessonVariant } from "@/types/game";

export const lesson02Robot: GameLessonVariant = {
  lessonId: "02-player-stats",

  instructions: `# Robot Builder: Robot Telemetry

Real robots continuously track their state -- position, heading, and battery level. In this lesson you will declare variables to store the robot's telemetry data and broadcast it over the protocol.

## Robot Protocol

\`\`\`
ROBOT|position|x|y|theta     // Report position using variable values
ROBOT|velocity|vl|vr          // Report wheel velocities
ROBOT_MESSAGE|text            // Broadcast a telemetry status message
\`\`\`

## Your Task

1. Declare the following robot state variables:
   - \`double x = 1.5\` (x position in meters)
   - \`double y = 2.0\` (y position in meters)
   - \`double theta = 0.785\` (heading in radians, approximately 45 degrees)
   - \`double battery = 87.5\` (battery percentage)
   - \`int health = 100\` (health points)
2. Output the robot's position using your variables: \`ROBOT|position|x|y|theta\`
3. Output the robot's velocity (stationary): \`ROBOT|velocity|0|0\`
4. Output a telemetry message showing battery and health: \`ROBOT_MESSAGE|Battery: 87.5% | Health: 100\`

Your output should look like:
\`\`\`
ROBOT|position|1.5|2|0.785
ROBOT|velocity|0|0
ROBOT_MESSAGE|Battery: 87.5% | Health: 100
\`\`\`
`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // TODO: Declare robot state variables
    // double x = 1.5   (x position in meters)
    // double y = 2.0   (y position in meters)
    // double theta = 0.785  (heading in radians, ~45 degrees)
    // double battery = 87.5 (battery percentage)
    // int health = 100      (health points)

    // TODO: Output position using variables
    // Format: ROBOT|position|x|y|theta

    // TODO: Output velocity (robot is stationary)
    // Format: ROBOT|velocity|0|0

    // TODO: Output telemetry message with battery level
    // Format: ROBOT_MESSAGE|Battery: XX.X% | Health: XXX

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Robot state variables
    double x = 1.5;
    double y = 2.0;
    double theta = 0.785;
    double battery = 87.5;
    int health = 100;

    // Output robot position
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // Robot is stationary
    cout << "ROBOT|velocity|0|0" << endl;

    // Output telemetry
    cout << "ROBOT_MESSAGE|Battery: " << battery << "% | Health: " << health << endl;
    cout << "ROBOT_MESSAGE|Telemetry broadcast active" << endl;

    return 0;
}`,

  tests: [
    {
      id: "position-vars",
      description: "Position from variables (1.5, 2, 0.785)",
      expectedOutput: "ROBOT\\|position\\|1\\.5\\|2\\|0\\.785",
      isPattern: true,
    },
    {
      id: "velocity-zero",
      description: "Stationary velocity output",
      expectedOutput: "ROBOT\\|velocity\\|0\\|0",
      isPattern: true,
    },
    {
      id: "battery-telemetry",
      description: "Battery level in telemetry message",
      expectedOutput: "ROBOT_MESSAGE\\|Battery: 87\\.5%",
      isPattern: true,
    },
  ],

  hints: [
    "Declare double variables for x, y, theta, and battery.",
    "Use int for health since it's a whole number.",
    "Insert variables into cout using << like: cout << \"ROBOT|position|\" << x << \"|\" << y << \"|\" << theta << endl;",
    "Double values like 1.5 will print with the decimal automatically.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Robot state variables
    double x = 1.5;
    double y = 2.0;
    double theta = 0.785;
    double battery = 87.5;
    int health = 100;

    // Output robot position
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // Robot is stationary
    cout << "ROBOT|velocity|0|0" << endl;

    // Output telemetry
    cout << "ROBOT_MESSAGE|Battery: " << battery << "% | Health: " << health << endl;
    cout << "ROBOT_MESSAGE|Telemetry broadcast active" << endl;

    return 0;
}`,
};
