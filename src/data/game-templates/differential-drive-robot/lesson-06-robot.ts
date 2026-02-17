import type { GameLessonVariant } from "@/types/game";

export const lesson06Robot: GameLessonVariant = {
  lessonId: "06-arrays",

  instructions: `# Robot Builder: Sensor Array

Your robot needs a full ring of distance sensors to detect obstacles in every direction. In this lesson, you will store 8 sensor readings in a \`vector\` and find the closest obstacle.

## Robot Protocol

Your program communicates with the robot simulator using these protocol lines:

\`\`\`
ROBOT|position|x|y|theta       // Report the robot's current position and heading
ROBOT|sensor|distance|angle     // Report a single sensor reading (distance in meters, angle in radians)
ROBOT_MESSAGE|text              // Display a status message
MISSION_COMPLETE                // Signal that the mission is finished
\`\`\`

## Your Task

1. Create a \`vector<double>\` containing 8 sensor distances: \`3.2, 2.8, 1.5, 4.0, 2.1, 3.7, 1.0, 2.5\`
2. Loop through the sensor readings and output each one using \`ROBOT|sensor|distance|angle\` — sensors are spaced 45 degrees apart (convert to radians: \`i * 45.0 * M_PI / 180.0\`)
3. Find the minimum distance in the vector (the closest obstacle) and track which sensor index it belongs to
4. Output: \`ROBOT_MESSAGE|Closest obstacle: Xm at sensor N\`
5. Output: \`MISSION_COMPLETE\`

**Expected output includes:**
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|Scanning with 8 sensors
ROBOT|sensor|3.2|0
ROBOT|sensor|2.8|0.785398
...
ROBOT_MESSAGE|Closest obstacle: 1m at sensor 6
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // TODO: Create a vector of 8 sensor distances (simulated readings)
    // Distances: 3.2, 2.8, 1.5, 4.0, 2.1, 3.7, 1.0, 2.5

    // TODO: Loop through sensor readings and output each one
    // Each sensor is spaced 45 degrees apart (0, 45, 90, ..., 315)
    // Convert to radians and output: ROBOT|sensor|distance|angle_in_radians

    // TODO: Find the minimum distance (closest obstacle)
    // Output: ROBOT_MESSAGE|Closest obstacle: X.Xm at sensor N

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // 8 sensor readings around the robot
    vector<double> sensors = {3.2, 2.8, 1.5, 4.0, 2.1, 3.7, 1.0, 2.5};

    cout << "ROBOT_MESSAGE|Scanning with " << sensors.size() << " sensors" << endl;

    // Output each sensor reading
    double minDist = sensors[0];
    int minIdx = 0;

    for (int i = 0; i < (int)sensors.size(); i++) {
        double angle = i * 45.0 * M_PI / 180.0;
        cout << "ROBOT|sensor|" << sensors[i] << "|" << angle << endl;

        if (sensors[i] < minDist) {
            minDist = sensors[i];
            minIdx = i;
        }
    }

    cout << "ROBOT_MESSAGE|Closest obstacle: " << minDist << "m at sensor " << minIdx << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "position-output",
      description: "Robot outputs position",
      expectedOutput: "ROBOT\\|position\\|0\\|0\\|0",
      isPattern: true,
    },
    {
      id: "sensor-count",
      description: "Scanning message with 8 sensors",
      expectedOutput: "ROBOT_MESSAGE\\|Scanning with 8 sensors",
      isPattern: true,
    },
    {
      id: "sensor-reading",
      description: "At least one sensor reading output",
      expectedOutput: "ROBOT\\|sensor\\|",
      isPattern: true,
    },
    {
      id: "closest-obstacle",
      description: "Finds closest obstacle (1m at sensor 6)",
      expectedOutput: "ROBOT_MESSAGE\\|Closest obstacle: 1m at sensor 6",
      isPattern: true,
    },
    {
      id: "mission-complete",
      description: "Mission complete",
      expectedOutput: "MISSION_COMPLETE",
      isPattern: true,
    },
  ],

  hints: [
    "Use vector<double> sensors = {3.2, 2.8, ...}; to initialize the sensor array.",
    "Loop with for (int i = 0; i < sensors.size(); i++) to iterate.",
    "Convert angle: double angle = i * 45.0 * M_PI / 180.0;",
    "Track the minimum distance and its index as you loop.",
  ],

  accumulatedCode: `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    // 8 sensor readings around the robot
    vector<double> sensors = {3.2, 2.8, 1.5, 4.0, 2.1, 3.7, 1.0, 2.5};

    cout << "ROBOT_MESSAGE|Scanning with " << sensors.size() << " sensors" << endl;

    // Output each sensor reading
    double minDist = sensors[0];
    int minIdx = 0;

    for (int i = 0; i < (int)sensors.size(); i++) {
        double angle = i * 45.0 * M_PI / 180.0;
        cout << "ROBOT|sensor|" << sensors[i] << "|" << angle << endl;

        if (sensors[i] < minDist) {
            minDist = sensors[i];
            minIdx = i;
        }
    }

    cout << "ROBOT_MESSAGE|Closest obstacle: " << minDist << "m at sensor " << minIdx << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
