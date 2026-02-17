import type { GameLessonVariant } from "@/types/game";

export const lesson09Robot: GameLessonVariant = {
  lessonId: "09-references",

  instructions: `# Robot Builder: Multi-File Architecture

Production robot software is organized across multiple files: headers for declarations, source files for implementations. In this lesson, you will simulate a multi-file architecture using forward declarations and separate implementation sections.

## Robot Protocol

Your program communicates with the robot simulator using these protocol lines:

\`\`\`
ROBOT|position|x|y|theta       // Report the robot's current position and heading
ROBOT_MESSAGE|text              // Display a status message
MISSION_COMPLETE                // Signal that the mission is finished
\`\`\`

## Your Task

1. **Header section** — Define a \`struct RobotState\` with members: \`double x, y, theta;\` and \`int health;\`
2. **Header section** — Forward declare these functions:
   - \`void initRobot(RobotState& robot);\`
   - \`void moveRobot(RobotState& robot, double distance);\`
   - \`void printStatus(const RobotState& robot);\`
3. **Main section** — Create a \`RobotState\`, then:
   - Call \`initRobot(robot)\`
   - Call \`moveRobot(robot, 2.5)\`
   - Call \`moveRobot(robot, 1.5)\`
   - Call \`printStatus(robot)\`
   - Output: \`ROBOT_MESSAGE|Multi-file architecture demonstrated\`
   - Output: \`MISSION_COMPLETE\`
4. **Implementation section** — Implement the three functions:
   - \`initRobot\`: set x=0, y=0, theta=0, health=100, output \`ROBOT|position|0|0|0\` and \`ROBOT_MESSAGE|Robot initialized\`
   - \`moveRobot\`: update \`x += distance * cos(theta)\`, \`y += distance * sin(theta)\`, output \`ROBOT|position|x|y|theta\`
   - \`printStatus\`: output \`ROBOT_MESSAGE|Status: pos=(x,y) theta=T health=H\`

**Expected output includes:**
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|Robot initialized
ROBOT|position|2.5|0|0
ROBOT|position|4|0|0
ROBOT_MESSAGE|Status: pos=(4,0) theta=0 health=100
ROBOT_MESSAGE|Multi-file architecture demonstrated
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

// === HEADER SECTION (simulating robot_types.h) ===
// TODO: Forward declare the RobotState struct
// TODO: Forward declare these functions:
//   void initRobot(RobotState& robot);
//   void moveRobot(RobotState& robot, double distance);
//   void printStatus(const RobotState& robot);

// === STRUCT DEFINITION (simulating robot_types.h) ===
// TODO: Define struct RobotState with: double x, y, theta; int health;

// === MAIN (simulating main.cpp) ===
int main() {
    // TODO: Create a RobotState, initialize it, move it twice, print status
    // 1. Call initRobot(robot)
    // 2. Call moveRobot(robot, 2.5)
    // 3. Call moveRobot(robot, 1.5)
    // 4. Call printStatus(robot)
    // 5. Output: ROBOT_MESSAGE|Multi-file architecture demonstrated
    // 6. Output: MISSION_COMPLETE

    return 0;
}

// === IMPLEMENTATIONS (simulating robot_functions.cpp) ===
// TODO: Implement initRobot — set x=0,y=0,theta=0,health=100
//   Output: ROBOT|position|0|0|0
//   Output: ROBOT_MESSAGE|Robot initialized

// TODO: Implement moveRobot — move forward by distance
//   x += distance * cos(theta), y += distance * sin(theta)
//   Output: ROBOT|position|x|y|theta

// TODO: Implement printStatus — output all state
//   Output: ROBOT_MESSAGE|Status: pos=(x,y) theta=T health=H`,

  solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

// === HEADER SECTION (simulating robot_types.h) ===
struct RobotState {
    double x;
    double y;
    double theta;
    int health;
};

// Forward declarations (simulating header prototypes)
void initRobot(RobotState& robot);
void moveRobot(RobotState& robot, double distance);
void printStatus(const RobotState& robot);

// === MAIN (simulating main.cpp) ===
int main() {
    RobotState robot;
    initRobot(robot);

    moveRobot(robot, 2.5);
    moveRobot(robot, 1.5);

    printStatus(robot);

    cout << "ROBOT_MESSAGE|Multi-file architecture demonstrated" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}

// === IMPLEMENTATIONS (simulating robot_functions.cpp) ===
void initRobot(RobotState& robot) {
    robot.x = 0.0;
    robot.y = 0.0;
    robot.theta = 0.0;
    robot.health = 100;
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT_MESSAGE|Robot initialized" << endl;
}

void moveRobot(RobotState& robot, double distance) {
    robot.x += distance * cos(robot.theta);
    robot.y += distance * sin(robot.theta);
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
}

void printStatus(const RobotState& robot) {
    cout << "ROBOT_MESSAGE|Status: pos=(" << robot.x << "," << robot.y
         << ") theta=" << robot.theta << " health=" << robot.health << endl;
}`,

  tests: [
    {
      id: "robot-init",
      description: "Robot initialized at origin",
      expectedOutput: "ROBOT_MESSAGE\\|Robot initialized",
      isPattern: true,
    },
    {
      id: "position-origin",
      description: "Initial position at origin",
      expectedOutput: "ROBOT\\|position\\|0\\|0\\|0",
      isPattern: true,
    },
    {
      id: "moved-position",
      description: "Robot moved from origin",
      expectedOutput: "ROBOT\\|position\\|[2-4]",
      isPattern: true,
    },
    {
      id: "status-output",
      description: "Status printout with health",
      expectedOutput: "ROBOT_MESSAGE\\|Status: pos=",
      isPattern: true,
    },
    {
      id: "architecture-msg",
      description: "Architecture demonstration message",
      expectedOutput: "ROBOT_MESSAGE\\|Multi-file architecture demonstrated",
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
    "Forward declarations tell the compiler a function exists before you define it.",
    "The pattern is: return_type functionName(parameters); — just the signature with a semicolon.",
    "Define the struct before the forward declarations so the parameter types are known.",
    "Put implementations after main() to simulate separate .cpp files.",
    "Use const RobotState& for read-only access in printStatus.",
  ],

  accumulatedCode: `#include <iostream>
#include <cmath>
using namespace std;

// === HEADER SECTION (simulating robot_types.h) ===
struct RobotState {
    double x;
    double y;
    double theta;
    int health;
};

// Forward declarations (simulating header prototypes)
void initRobot(RobotState& robot);
void moveRobot(RobotState& robot, double distance);
void printStatus(const RobotState& robot);

// === MAIN (simulating main.cpp) ===
int main() {
    RobotState robot;
    initRobot(robot);

    moveRobot(robot, 2.5);
    moveRobot(robot, 1.5);

    printStatus(robot);

    cout << "ROBOT_MESSAGE|Multi-file architecture demonstrated" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}

// === IMPLEMENTATIONS (simulating robot_functions.cpp) ===
void initRobot(RobotState& robot) {
    robot.x = 0.0;
    robot.y = 0.0;
    robot.theta = 0.0;
    robot.health = 100;
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT_MESSAGE|Robot initialized" << endl;
}

void moveRobot(RobotState& robot, double distance) {
    robot.x += distance * cos(robot.theta);
    robot.y += distance * sin(robot.theta);
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
}

void printStatus(const RobotState& robot) {
    cout << "ROBOT_MESSAGE|Status: pos=(" << robot.x << "," << robot.y
         << ") theta=" << robot.theta << " health=" << robot.health << endl;
}`,
};
