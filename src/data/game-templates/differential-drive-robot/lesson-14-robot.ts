import type { GameLessonVariant } from "@/types/game";

export const lesson14Robot: GameLessonVariant = {
  lessonId: "14-dynamic-arrays",

  instructions: `# Robot Builder: Runtime Configuration

In ROS 2, nodes load parameters at startup to configure their behavior -- maximum speed, sensor range, update rate, and more. By separating configuration from logic, you can tune a robot's behavior without recompiling. Here you will simulate loading and applying a config struct that drives robot movement.

## Robot Protocol
Your \`applyConfig\` function should output each parameter:
\`\`\`
ROBOT_MESSAGE|Config: max_speed = X.X
ROBOT_MESSAGE|Config: turn_rate = X.X
ROBOT_MESSAGE|Config: sensor_range = X.X
ROBOT_MESSAGE|Config: update_rate = X
ROBOT_MESSAGE|Config: robot_name = NAME
\`\`\`
During movement simulation:
\`\`\`
ROBOT|position|x|y|theta
ROBOT|velocity|speed|0
\`\`\`

## Your Task
1. Write \`loadConfig()\` that returns a \`RobotConfig\` with: maxSpeed=2.0, turnRate=1.5, sensorRange=5.0, updateRate=10, robotName="Rover-X"
2. Write \`applyConfig(const RobotConfig& config)\` that outputs each config parameter as a \`ROBOT_MESSAGE\`
3. In \`main()\`:
   - Call \`loadConfig()\` to get the configuration
   - Call \`applyConfig()\` to print all parameters
   - Simulate 3 movement steps using the config's \`maxSpeed\`, outputting \`ROBOT|position\` and \`ROBOT|velocity\` each step
   - Output \`ROBOT_MESSAGE|Configuration test complete\`
   - Output \`MISSION_COMPLETE\`
`,

  starterCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct RobotConfig {
    double maxSpeed;
    double turnRate;
    double sensorRange;
    int updateRate;
    string robotName;
};

// TODO: Write loadConfig() that returns a RobotConfig with:
//   maxSpeed=2.0, turnRate=1.5, sensorRange=5.0, updateRate=10, robotName="Rover-X"

// TODO: Write applyConfig(const RobotConfig& config) that outputs each parameter:
//   ROBOT_MESSAGE|Config: max_speed = X.X
//   ROBOT_MESSAGE|Config: turn_rate = X.X
//   ROBOT_MESSAGE|Config: sensor_range = X.X
//   ROBOT_MESSAGE|Config: update_rate = X
//   ROBOT_MESSAGE|Config: robot_name = NAME

int main() {
    cout << "ROBOT|position|0|0|0" << endl;

    // TODO: Load configuration
    // TODO: Apply (print) configuration
    // TODO: Simulate 3 movement steps using config parameters
    //   Each step: move maxSpeed units, output position and velocity
    // TODO: Output ROBOT_MESSAGE|Configuration test complete
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct RobotConfig {
    double maxSpeed;
    double turnRate;
    double sensorRange;
    int updateRate;
    string robotName;
};

RobotConfig loadConfig() {
    return {2.0, 1.5, 5.0, 10, "Rover-X"};
}

void applyConfig(const RobotConfig& config) {
    cout << "ROBOT_MESSAGE|Config: max_speed = " << config.maxSpeed << endl;
    cout << "ROBOT_MESSAGE|Config: turn_rate = " << config.turnRate << endl;
    cout << "ROBOT_MESSAGE|Config: sensor_range = " << config.sensorRange << endl;
    cout << "ROBOT_MESSAGE|Config: update_rate = " << config.updateRate << endl;
    cout << "ROBOT_MESSAGE|Config: robot_name = " << config.robotName << endl;
}

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    RobotConfig config = loadConfig();
    cout << "ROBOT_MESSAGE|Loading configuration for " << config.robotName << endl;
    applyConfig(config);

    // Simulate 3 movement steps
    for (int i = 0; i < 3; i++) {
        x += config.maxSpeed * cos(theta);
        y += config.maxSpeed * sin(theta);
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|" << config.maxSpeed << "|0" << endl;
    }

    cout << "ROBOT_MESSAGE|Configuration test complete" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "initial-position",
      description: "Starts at origin",
      expectedOutput: "ROBOT\\|position\\|0\\|0\\|0",
      isPattern: true,
    },
    {
      id: "config-speed",
      description: "Max speed configured",
      expectedOutput: "ROBOT_MESSAGE\\|Config: max_speed = 2",
      isPattern: true,
    },
    {
      id: "config-name",
      description: "Robot name configured",
      expectedOutput: "ROBOT_MESSAGE\\|Config: robot_name = Rover-X",
      isPattern: true,
    },
    {
      id: "velocity-output",
      description: "Velocity matches config",
      expectedOutput: "ROBOT\\|velocity\\|2\\|0",
      isPattern: true,
    },
    {
      id: "config-complete",
      description: "Configuration test complete",
      expectedOutput: "ROBOT_MESSAGE\\|Configuration test complete",
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
    "loadConfig returns a struct literal: return {2.0, 1.5, 5.0, 10, \"Rover-X\"};",
    "Parameters in ROS 2 configure node behavior at runtime. Here we simulate this with a config struct.",
    "Use config.maxSpeed in the movement loop to show how parameters affect behavior.",
    "Pass the config by const reference since applyConfig only reads it.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

struct RobotConfig {
    double maxSpeed;
    double turnRate;
    double sensorRange;
    int updateRate;
    string robotName;
};

RobotConfig loadConfig() {
    return {2.0, 1.5, 5.0, 10, "Rover-X"};
}

void applyConfig(const RobotConfig& config) {
    cout << "ROBOT_MESSAGE|Config: max_speed = " << config.maxSpeed << endl;
    cout << "ROBOT_MESSAGE|Config: turn_rate = " << config.turnRate << endl;
    cout << "ROBOT_MESSAGE|Config: sensor_range = " << config.sensorRange << endl;
    cout << "ROBOT_MESSAGE|Config: update_rate = " << config.updateRate << endl;
    cout << "ROBOT_MESSAGE|Config: robot_name = " << config.robotName << endl;
}

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;

    RobotConfig config = loadConfig();
    cout << "ROBOT_MESSAGE|Loading configuration for " << config.robotName << endl;
    applyConfig(config);

    // Simulate 3 movement steps
    for (int i = 0; i < 3; i++) {
        x += config.maxSpeed * cos(theta);
        y += config.maxSpeed * sin(theta);
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|" << config.maxSpeed << "|0" << endl;
    }

    cout << "ROBOT_MESSAGE|Configuration test complete" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
