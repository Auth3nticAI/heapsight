import type { GameLessonVariant } from "@/types/game";

export const lesson15Robot: GameLessonVariant = {
  lessonId: "15-multi-system-tick",

  instructions: `# Robot Builder: Multi-Robot System

In real robotic fleets, multiple robots operate simultaneously -- each publishing its own state while a coordinator monitors inter-robot distances for collision avoidance and task allocation. Here you will simulate two robots moving independently and computing the Euclidean distance between them.

## Robot Protocol
Your \`publishRobotState\` function should output for each robot:
\`\`\`
ROBOT|position|x|y|theta
ROBOT|velocity|speed|0
ROBOT_MESSAGE|[ID] at (x, y)
\`\`\`
After all movement:
\`\`\`
ROBOT_MESSAGE|Distance between Scout-1 and Guard-2: Xm
MISSION_COMPLETE
\`\`\`

## Your Task
1. Write \`publishRobotState(const Robot& robot)\` that outputs position, velocity, and a location message
2. Write \`computeDistance(const Robot& a, const Robot& b)\` that returns the Euclidean distance: \`sqrt((a.x-b.x)^2 + (a.y-b.y)^2)\`
3. In \`main()\`:
   - Create two robots: \`Scout-1\` at (0, 0, 0) with speed 1.0 and \`Guard-2\` at (5, 0, 3.14) with speed 0.5
   - Output \`ROBOT_MESSAGE|Multi-robot system initialized\`
   - Publish initial state for both robots
   - Move Scout-1 forward 3 steps (each step moves by speed in heading direction), publishing state after each step
   - Move Guard-2 forward 2 steps, publishing state after each step
   - Compute and output the distance between the two robots
   - Output \`MISSION_COMPLETE\`
`,

  starterCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

struct Robot {
    string id;
    double x, y, theta;
    double speed;
};

// TODO: Write publishRobotState(const Robot& robot) that outputs:
//   ROBOT|position|x|y|theta
//   ROBOT|velocity|speed|0
//   ROBOT_MESSAGE|[ID] at (x, y)

// TODO: Write computeDistance(const Robot& a, const Robot& b) returning distance
//   distance = sqrt((a.x-b.x)^2 + (a.y-b.y)^2)

int main() {
    // TODO: Create two robots
    //   Robot scout = {"Scout-1", 0, 0, 0, 1.0}
    //   Robot guard = {"Guard-2", 5, 0, 3.14, 0.5}

    // TODO: Output ROBOT_MESSAGE|Multi-robot system initialized

    // TODO: Publish initial state for both robots

    // TODO: Move scout forward 3 steps (each step moves by speed in heading direction)
    // Publish state after each step

    // TODO: Move guard forward 2 steps
    // Publish state after each step

    // TODO: Compute and output distance between robots
    //   ROBOT_MESSAGE|Distance between Scout-1 and Guard-2: Xm

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

struct Robot {
    string id;
    double x, y, theta;
    double speed;
};

void publishRobotState(const Robot& robot) {
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT|velocity|" << robot.speed << "|0" << endl;
    cout << "ROBOT_MESSAGE|[" << robot.id << "] at (" << robot.x << ", " << robot.y << ")" << endl;
}

double computeDistance(const Robot& a, const Robot& b) {
    return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

void moveRobot(Robot& robot) {
    robot.x += robot.speed * cos(robot.theta);
    robot.y += robot.speed * sin(robot.theta);
}

int main() {
    Robot scout = {"Scout-1", 0, 0, 0, 1.0};
    Robot guard = {"Guard-2", 5, 0, 3.14, 0.5};

    cout << "ROBOT_MESSAGE|Multi-robot system initialized" << endl;

    publishRobotState(scout);
    publishRobotState(guard);

    // Move scout forward 3 steps
    for (int i = 0; i < 3; i++) {
        moveRobot(scout);
        publishRobotState(scout);
    }

    // Move guard forward 2 steps
    for (int i = 0; i < 2; i++) {
        moveRobot(guard);
        publishRobotState(guard);
    }

    double dist = computeDistance(scout, guard);
    cout << "ROBOT_MESSAGE|Distance between Scout-1 and Guard-2: " << dist << "m" << endl;

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "system-init",
      description: "Multi-robot system initialized",
      expectedOutput: "ROBOT_MESSAGE\\|Multi-robot system initialized",
      isPattern: true,
    },
    {
      id: "scout-state",
      description: "Scout-1 state published",
      expectedOutput: "ROBOT_MESSAGE\\|\\[Scout-1\\] at",
      isPattern: true,
    },
    {
      id: "guard-state",
      description: "Guard-2 state published",
      expectedOutput: "ROBOT_MESSAGE\\|\\[Guard-2\\] at",
      isPattern: true,
    },
    {
      id: "distance-computed",
      description: "Inter-robot distance computed",
      expectedOutput: "ROBOT_MESSAGE\\|Distance between Scout-1 and Guard-2:",
      isPattern: true,
    },
    {
      id: "position-output",
      description: "Position data published",
      expectedOutput: "ROBOT\\|position\\|",
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
    "In ROS 2, each robot is a separate node that publishes its state. We simulate this with a struct per robot.",
    "Use sqrt(pow(dx,2) + pow(dy,2)) from <cmath> for Euclidean distance.",
    "Move each robot step by step and publish state after each move.",
    "Pass Robot by reference to moveRobot (it modifies) and by const reference to publish (read-only).",
  ],

  accumulatedCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

struct Robot {
    string id;
    double x, y, theta;
    double speed;
};

void publishRobotState(const Robot& robot) {
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT|velocity|" << robot.speed << "|0" << endl;
    cout << "ROBOT_MESSAGE|[" << robot.id << "] at (" << robot.x << ", " << robot.y << ")" << endl;
}

double computeDistance(const Robot& a, const Robot& b) {
    return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2));
}

void moveRobot(Robot& robot) {
    robot.x += robot.speed * cos(robot.theta);
    robot.y += robot.speed * sin(robot.theta);
}

int main() {
    Robot scout = {"Scout-1", 0, 0, 0, 1.0};
    Robot guard = {"Guard-2", 5, 0, 3.14, 0.5};

    cout << "ROBOT_MESSAGE|Multi-robot system initialized" << endl;

    publishRobotState(scout);
    publishRobotState(guard);

    // Move scout forward 3 steps
    for (int i = 0; i < 3; i++) {
        moveRobot(scout);
        publishRobotState(scout);
    }

    // Move guard forward 2 steps
    for (int i = 0; i < 2; i++) {
        moveRobot(guard);
        publishRobotState(guard);
    }

    double dist = computeDistance(scout, guard);
    cout << "ROBOT_MESSAGE|Distance between Scout-1 and Guard-2: " << dist << "m" << endl;

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
