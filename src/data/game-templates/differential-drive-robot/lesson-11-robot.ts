import type { GameLessonVariant } from "@/types/game";

export const lesson11Robot: GameLessonVariant = {
  lessonId: "11-component-structs",

  instructions: `# Robot Builder: Telemetry Publisher

In robotics, telemetry publishers broadcast sensor and state data at regular intervals. In ROS 2, a publisher node sends messages on a topic so other nodes can subscribe. Here you will simulate a 10Hz telemetry publisher that reports position, velocity, and battery status every tick.

## Robot Protocol
Your telemetry function should output these protocol lines each tick:
\`\`\`
ROBOT|position|x|y|theta
ROBOT|velocity|speed|0
ROBOT_MESSAGE|[Tick N] Battery: XX.X% Speed: X.Xm/s
\`\`\`
At the end of the mission:
\`\`\`
ROBOT_MESSAGE|Final battery: XX%
MISSION_COMPLETE
\`\`\`

## Your Task
1. Write a \`publishTelemetry(const RobotState& robot, int tick)\` function that outputs position, velocity, and a status message for the current tick
2. In \`main()\`, simulate 5 ticks of telemetry publishing in a loop. Each tick:
   - Call \`publishTelemetry(robot, tick)\`
   - Move the robot: \`x += speed * cos(theta)\`, \`y += speed * sin(theta)\`
   - Drain the battery by 2% each tick
3. After the loop, output the final battery status
4. Output \`MISSION_COMPLETE\`

The robot starts at position (0, 0, 0) with 100% battery and speed 0.5 m/s. After 5 ticks the battery should be 90%.
`,

  starterCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct RobotState {
    double x, y, theta;
    double battery;
    double speed;
};

// TODO: Write a function publishTelemetry that takes const RobotState& and int tick
// It should output:
//   ROBOT|position|x|y|theta
//   ROBOT|velocity|speed|0
//   ROBOT_MESSAGE|[Tick N] Battery: XX.X% Speed: X.Xm/s

int main() {
    RobotState robot = {0.0, 0.0, 0.0, 100.0, 0.5};

    cout << "ROBOT_MESSAGE|Telemetry publisher started at 10Hz" << endl;

    // TODO: Simulate 5 ticks of telemetry publishing
    // Each tick:
    //   1. Call publishTelemetry(robot, tick)
    //   2. Move robot: x += speed * cos(theta), y += speed * sin(theta)
    //   3. Drain battery by 2% each tick

    // TODO: Output final battery status
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct RobotState {
    double x, y, theta;
    double battery;
    double speed;
};

void publishTelemetry(const RobotState& robot, int tick) {
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT|velocity|" << robot.speed << "|0" << endl;
    cout << "ROBOT_MESSAGE|[Tick " << tick << "] Battery: " << robot.battery << "% Speed: " << robot.speed << "m/s" << endl;
}

int main() {
    RobotState robot = {0.0, 0.0, 0.0, 100.0, 0.5};

    cout << "ROBOT_MESSAGE|Telemetry publisher started at 10Hz" << endl;

    for (int tick = 1; tick <= 5; tick++) {
        publishTelemetry(robot, tick);
        robot.x += robot.speed * cos(robot.theta);
        robot.y += robot.speed * sin(robot.theta);
        robot.battery -= 2.0;
    }

    cout << "ROBOT_MESSAGE|Final battery: " << robot.battery << "%" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "publisher-start",
      description: "Publisher started message",
      expectedOutput: "ROBOT_MESSAGE\\|Telemetry publisher started",
      isPattern: true,
    },
    {
      id: "tick-output",
      description: "At least one tick published",
      expectedOutput: "ROBOT_MESSAGE\\|\\[Tick 1\\]",
      isPattern: true,
    },
    {
      id: "position-output",
      description: "Position telemetry published",
      expectedOutput: "ROBOT\\|position\\|",
      isPattern: true,
    },
    {
      id: "velocity-output",
      description: "Velocity telemetry published",
      expectedOutput: "ROBOT\\|velocity\\|0\\.5\\|0",
      isPattern: true,
    },
    {
      id: "final-battery",
      description: "Final battery status reported",
      expectedOutput: "ROBOT_MESSAGE\\|Final battery: 90%",
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
    "A publisher in ROS 2 sends data at regular intervals. We simulate this with a for loop.",
    "Pass robot by const reference (const RobotState&) since publishing doesn't modify state.",
    "Update position AFTER publishing each tick's data (publish current, then move).",
    "Battery drains 2% per tick: 100 - (5 * 2) = 90% final.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct RobotState {
    double x, y, theta;
    double battery;
    double speed;
};

void publishTelemetry(const RobotState& robot, int tick) {
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT|velocity|" << robot.speed << "|0" << endl;
    cout << "ROBOT_MESSAGE|[Tick " << tick << "] Battery: " << robot.battery << "% Speed: " << robot.speed << "m/s" << endl;
}

int main() {
    RobotState robot = {0.0, 0.0, 0.0, 100.0, 0.5};

    cout << "ROBOT_MESSAGE|Telemetry publisher started at 10Hz" << endl;

    for (int tick = 1; tick <= 5; tick++) {
        publishTelemetry(robot, tick);
        robot.x += robot.speed * cos(robot.theta);
        robot.y += robot.speed * sin(robot.theta);
        robot.battery -= 2.0;
    }

    cout << "ROBOT_MESSAGE|Final battery: " << robot.battery << "%" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
