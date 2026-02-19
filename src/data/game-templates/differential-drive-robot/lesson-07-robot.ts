import type { GameLessonVariant } from "@/types/game";

export const lesson07Robot: GameLessonVariant = {
  lessonId: "07-spawn-wave-loop",

  instructions: `# Robot Builder: Efficient Path Passing

In real robotics, functions need to modify robot state efficiently without copying large structs. In this lesson, you will use **pointers** and **references** to pass and update a robot's state.

## Robot Protocol

Your program communicates with the robot simulator using these protocol lines:

\`\`\`
ROBOT|position|x|y|theta       // Report the robot's current position and heading
ROBOT|velocity|linear|angular   // Report a velocity command (linear speed and angular speed)
ROBOT_MESSAGE|text              // Display a status message
MISSION_COMPLETE                // Signal that the mission is finished
\`\`\`

## Your Task

1. Write a function \`void moveRobotPtr(RobotState* robot, double dist)\` that takes a **pointer** to \`RobotState\`:
   - Update position: \`robot->x += dist * cos(robot->theta)\` and \`robot->y += dist * sin(robot->theta)\`
   - Output: \`ROBOT|position|x|y|theta\`
2. Write a function \`void turnRobotRef(RobotState& robot, double angle)\` that takes a **reference** to \`RobotState\`:
   - Update heading: \`robot.theta += angle\`
   - Output: \`ROBOT|position|x|y|theta\`
3. In \`main()\`, use the pointer function to move forward **2 units**
4. Use the reference function to turn left **90 degrees** (\`M_PI / 2.0\`)
5. Use the pointer function to move forward **3 units**
6. Output a final position message and \`MISSION_COMPLETE\`

**Expected output includes:**
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|Demonstrating pointer and reference access
ROBOT|position|2|0|0
ROBOT|position|2|0|1.5708
ROBOT|position|2|3|1.5708
ROBOT_MESSAGE|Final position reached via pointer/reference ops
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

struct RobotState {
    double x;
    double y;
    double theta;
};

// TODO: Write a function that takes a POINTER to RobotState
// void moveRobotPtr(RobotState* robot, double dist)
//   robot->x += dist * cos(robot->theta);
//   robot->y += dist * sin(robot->theta);
//   Output position: ROBOT|position|x|y|theta

// TODO: Write a function that takes a REFERENCE to RobotState
// void turnRobotRef(RobotState& robot, double angle)
//   robot.theta += angle;
//   Output position: ROBOT|position|x|y|theta

int main() {
    RobotState robot = {0.0, 0.0, 0.0};
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;

    // TODO: Use pointer function to move forward 2 units
    // TODO: Use reference function to turn left 90 degrees (PI/2)
    // TODO: Use pointer function to move forward 3 units
    // TODO: Output final position message
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

struct RobotState {
    double x;
    double y;
    double theta;
};

void moveRobotPtr(RobotState* robot, double dist) {
    robot->x += dist * cos(robot->theta);
    robot->y += dist * sin(robot->theta);
    cout << "ROBOT|position|" << robot->x << "|" << robot->y << "|" << robot->theta << endl;
    cout << "ROBOT|velocity|" << dist << "|0" << endl;
}

void turnRobotRef(RobotState& robot, double angle) {
    robot.theta += angle;
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT|velocity|0|" << angle << endl;
}

int main() {
    RobotState robot = {0.0, 0.0, 0.0};
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT_MESSAGE|Demonstrating pointer and reference access" << endl;

    // Move forward 2 units using pointer
    moveRobotPtr(&robot, 2.0);

    // Turn left 90 degrees using reference
    turnRobotRef(robot, M_PI / 2.0);

    // Move forward 3 units using pointer
    moveRobotPtr(&robot, 3.0);

    cout << "ROBOT_MESSAGE|Final position reached via pointer/reference ops" << endl;
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
      id: "ptr-ref-message",
      description: "Pointer/reference demo message",
      expectedOutput: "ROBOT_MESSAGE\\|Demonstrating pointer and reference",
      isPattern: true,
    },
    {
      id: "moved-forward",
      description: "Robot moved forward (x=2)",
      expectedOutput: "ROBOT\\|position\\|2\\|",
      isPattern: true,
    },
    {
      id: "final-message",
      description: "Final position message",
      expectedOutput: "ROBOT_MESSAGE\\|Final position reached",
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
    "With a pointer, use robot->x to access members. Pass with &robot.",
    "With a reference, use robot.x normally. No special syntax to pass.",
    "moveRobotPtr takes RobotState* — use the arrow operator (->).",
    "turnRobotRef takes RobotState& — use the dot operator (.).",
  ],

  accumulatedCode: `#include <iostream>
#include <cmath>
using namespace std;

struct RobotState {
    double x;
    double y;
    double theta;
};

void moveRobotPtr(RobotState* robot, double dist) {
    robot->x += dist * cos(robot->theta);
    robot->y += dist * sin(robot->theta);
    cout << "ROBOT|position|" << robot->x << "|" << robot->y << "|" << robot->theta << endl;
    cout << "ROBOT|velocity|" << dist << "|0" << endl;
}

void turnRobotRef(RobotState& robot, double angle) {
    robot.theta += angle;
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT|velocity|0|" << angle << endl;
}

int main() {
    RobotState robot = {0.0, 0.0, 0.0};
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT_MESSAGE|Demonstrating pointer and reference access" << endl;

    // Move forward 2 units using pointer
    moveRobotPtr(&robot, 2.0);

    // Turn left 90 degrees using reference
    turnRobotRef(robot, M_PI / 2.0);

    // Move forward 3 units using pointer
    moveRobotPtr(&robot, 3.0);

    cout << "ROBOT_MESSAGE|Final position reached via pointer/reference ops" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
