import type { GameLessonVariant } from "@/types/game";

export const lesson05Robot: GameLessonVariant = {
  lessonId: "05-pointers",

  instructions: `# Robot Builder: Modular Movement

Real robot software is built from reusable functions. In this lesson you will write \`moveForward\` and \`turnLeft\` functions that modify the robot's state through C++ references, then combine them to drive an L-shaped path.

## Robot Protocol

\`\`\`
ROBOT|position|x|y|theta     // Report position after each movement
ROBOT|velocity|vl|vr          // Report velocity (linear|angular)
ROBOT_MESSAGE|text            // Broadcast status messages
MISSION_COMPLETE              // Signal the path is complete
\`\`\`

## Your Task

1. Write a \`moveForward\` function that takes \`x\`, \`y\`, \`theta\` by reference and a \`distance\` parameter:
   - Update position: \`x += distance * cos(theta)\` and \`y += distance * sin(theta)\`
   - Output the new position: \`ROBOT|position|x|y|theta\`
2. Write a \`turnLeft\` function that takes \`theta\` by reference and an \`angle\` parameter (in radians):
   - Update heading: \`theta += angle\`
   - Output the new position: \`ROBOT|position|x|y|theta\`
   - (You will also need \`x\` and \`y\` to output the full position)
3. In \`main\`, drive an L-shaped path:
   - Call \`moveForward\` with distance 3.0 (heading east at theta=0)
   - Call \`turnLeft\` with angle \`M_PI / 2.0\` (90 degrees)
   - Call \`moveForward\` with distance 2.0 (now heading north)
4. Output: \`ROBOT_MESSAGE|L-path complete\`
5. Output: \`MISSION_COMPLETE\`
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

// TODO: Write a function moveForward that takes x, y, theta by reference
// and a distance parameter. It should:
//   x += distance * cos(theta)
//   y += distance * sin(theta)
// Then output: ROBOT|position|x|y|theta

// TODO: Write a function turnLeft that takes theta by reference
// and an angle parameter (in radians). It should:
//   theta += angle
// Then output: ROBOT|position|x|y|theta
// (You'll also need x, y to output the full position)

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;

    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT_MESSAGE|Starting L-shaped path" << endl;

    // TODO: Drive an L-shaped path:
    // 1. Move forward 3.0 units (heading east at theta=0)
    // 2. Turn left 90 degrees (PI/2 radians)
    // 3. Move forward 2.0 units (now heading north)
    // 4. Output: ROBOT_MESSAGE|L-path complete
    // 5. Output: MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

void moveForward(double& x, double& y, double theta, double distance) {
    x += distance * cos(theta);
    y += distance * sin(theta);
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT|velocity|" << distance << "|0" << endl;
}

void turnLeft(double& x, double& y, double& theta, double angle) {
    theta += angle;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT|velocity|0|" << angle << endl;
}

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;

    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT_MESSAGE|Starting L-shaped path" << endl;

    // Move forward 3 units (east)
    moveForward(x, y, theta, 3.0);

    // Turn left 90 degrees
    turnLeft(x, y, theta, M_PI / 2.0);

    // Move forward 2 units (north)
    moveForward(x, y, theta, 2.0);

    cout << "ROBOT_MESSAGE|L-path complete" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "start-origin",
      description: "Robot starts at origin",
      expectedOutput: "ROBOT\\|position\\|0\\|0\\|0",
      isPattern: true,
    },
    {
      id: "l-path-message",
      description: "L-shaped path started",
      expectedOutput: "ROBOT_MESSAGE\\|Starting L-shaped path",
      isPattern: true,
    },
    {
      id: "moved-east",
      description: "Robot moved east 3 units",
      expectedOutput: "ROBOT\\|position\\|3\\|",
      isPattern: true,
    },
    {
      id: "path-complete",
      description: "L-path completion message",
      expectedOutput: "ROBOT_MESSAGE\\|L-path complete",
      isPattern: true,
    },
    {
      id: "mission-complete",
      description: "Mission confirmed complete",
      expectedOutput: "MISSION_COMPLETE",
      isPattern: true,
    },
  ],

  hints: [
    "Functions that modify variables need those variables passed by reference (using &).",
    "moveForward uses cos(theta) for x and sin(theta) for y. Include <cmath>.",
    "turnLeft adds the angle to theta: theta += angle.",
    "PI/2 radians = 90 degrees. Use M_PI / 2.0 from <cmath>.",
    "Call moveForward, then turnLeft, then moveForward again for the L-shape.",
  ],

  accumulatedCode: `#include <iostream>
#include <cmath>
using namespace std;

void moveForward(double& x, double& y, double theta, double distance) {
    x += distance * cos(theta);
    y += distance * sin(theta);
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT|velocity|" << distance << "|0" << endl;
}

void turnLeft(double& x, double& y, double& theta, double angle) {
    theta += angle;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT|velocity|0|" << angle << endl;
}

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;

    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT_MESSAGE|Starting L-shaped path" << endl;

    // Move forward 3 units (east)
    moveForward(x, y, theta, 3.0);

    // Turn left 90 degrees
    turnLeft(x, y, theta, M_PI / 2.0);

    // Move forward 2 units (north)
    moveForward(x, y, theta, 2.0);

    cout << "ROBOT_MESSAGE|L-path complete" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
