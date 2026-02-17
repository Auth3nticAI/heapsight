import type { GameLessonVariant } from "@/types/game";

export const lesson12Robot: GameLessonVariant = {
  lessonId: "12-input",

  instructions: `# Robot Builder: Sensor Callback

In ROS 2, subscriber nodes register callback functions that are invoked automatically when new sensor data arrives on a topic. Here you will simulate a lidar sensor subscriber that processes distance readings and classifies obstacles by proximity.

## Robot Protocol
Your sensor callback should output these protocol lines for each reading:
\`\`\`
ROBOT|sensor|distance|angle
ROBOT_MESSAGE|ALERT: Close object detected at Xm    (if distance < 1.0)
ROBOT_MESSAGE|Caution: Object at Xm                 (if distance < 2.0)
ROBOT_MESSAGE|Clear at Xm                           (otherwise)
\`\`\`
Before each callback invocation:
\`\`\`
ROBOT_MESSAGE|Callback triggered: TYPE sensor
\`\`\`

## Your Task
1. Write a \`processSensorData(const SensorReading& reading)\` callback function that:
   - Outputs the sensor data as \`ROBOT|sensor|distance|angle\`
   - Classifies the reading: \`ALERT\` if distance < 1.0, \`Caution\` if distance < 2.0, otherwise \`Clear\`
2. Create an array of 5 \`SensorReading\` values: \`{0.5, 0.0, "lidar"}\`, \`{1.5, 0.785, "lidar"}\`, \`{3.0, 1.57, "lidar"}\`, \`{0.8, 3.14, "lidar"}\`, \`{2.5, 4.71, "lidar"}\`
3. Loop through the readings array and for each one:
   - Output \`ROBOT_MESSAGE|Callback triggered: TYPE sensor\`
   - Call \`processSensorData\` with the reading
4. Output \`MISSION_COMPLETE\`
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

struct SensorReading {
    double distance;
    double angle;
    string type;
};

// TODO: Write a callback function processSensorData
// void processSensorData(const SensorReading& reading)
// It should:
//   Output: ROBOT|sensor|distance|angle
//   If distance < 1.0: Output ROBOT_MESSAGE|ALERT: Close object detected at Xm
//   If distance < 2.0: Output ROBOT_MESSAGE|Caution: Object at Xm
//   Else: Output ROBOT_MESSAGE|Clear at Xm

int main() {
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|Sensor subscriber registered" << endl;

    // TODO: Create an array of 5 SensorReading values (simulating incoming data)
    // Readings: {0.5, 0.0, "lidar"}, {1.5, 0.785, "lidar"}, {3.0, 1.57, "lidar"},
    //           {0.8, 3.14, "lidar"}, {2.5, 4.71, "lidar"}

    // TODO: Loop through readings and call processSensorData for each
    //   Before each call, output: ROBOT_MESSAGE|Callback triggered: TYPE sensor

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <cmath>
using namespace std;

struct SensorReading {
    double distance;
    double angle;
    string type;
};

void processSensorData(const SensorReading& reading) {
    cout << "ROBOT|sensor|" << reading.distance << "|" << reading.angle << endl;

    if (reading.distance < 1.0) {
        cout << "ROBOT_MESSAGE|ALERT: Close object detected at " << reading.distance << "m" << endl;
    } else if (reading.distance < 2.0) {
        cout << "ROBOT_MESSAGE|Caution: Object at " << reading.distance << "m" << endl;
    } else {
        cout << "ROBOT_MESSAGE|Clear at " << reading.distance << "m" << endl;
    }
}

int main() {
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|Sensor subscriber registered" << endl;

    SensorReading readings[] = {
        {0.5, 0.0, "lidar"},
        {1.5, 0.785, "lidar"},
        {3.0, 1.57, "lidar"},
        {0.8, 3.14, "lidar"},
        {2.5, 4.71, "lidar"}
    };

    for (int i = 0; i < 5; i++) {
        cout << "ROBOT_MESSAGE|Callback triggered: " << readings[i].type << " sensor" << endl;
        processSensorData(readings[i]);
    }

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "subscriber-registered",
      description: "Sensor subscriber registered",
      expectedOutput: "ROBOT_MESSAGE\\|Sensor subscriber registered",
      isPattern: true,
    },
    {
      id: "callback-trigger",
      description: "Callback triggered for sensor",
      expectedOutput: "ROBOT_MESSAGE\\|Callback triggered: lidar sensor",
      isPattern: true,
    },
    {
      id: "close-alert",
      description: "Close object alert triggered",
      expectedOutput: "ROBOT_MESSAGE\\|ALERT: Close object detected",
      isPattern: true,
    },
    {
      id: "caution-alert",
      description: "Caution alert triggered",
      expectedOutput: "ROBOT_MESSAGE\\|Caution: Object at",
      isPattern: true,
    },
    {
      id: "sensor-output",
      description: "Sensor data output",
      expectedOutput: "ROBOT\\|sensor\\|",
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
    "A ROS 2 subscriber uses callbacks \u2014 functions called when new data arrives.",
    "We simulate this by calling processSensorData for each reading in our array.",
    "Use if/else if/else to categorize distance: <1.0 is ALERT, <2.0 is Caution, else Clear.",
    "Pass readings by const reference since the callback only reads data.",
  ],

  accumulatedCode: `#include <iostream>
#include <cmath>
using namespace std;

struct SensorReading {
    double distance;
    double angle;
    string type;
};

void processSensorData(const SensorReading& reading) {
    cout << "ROBOT|sensor|" << reading.distance << "|" << reading.angle << endl;

    if (reading.distance < 1.0) {
        cout << "ROBOT_MESSAGE|ALERT: Close object detected at " << reading.distance << "m" << endl;
    } else if (reading.distance < 2.0) {
        cout << "ROBOT_MESSAGE|Caution: Object at " << reading.distance << "m" << endl;
    } else {
        cout << "ROBOT_MESSAGE|Clear at " << reading.distance << "m" << endl;
    }
}

int main() {
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|Sensor subscriber registered" << endl;

    SensorReading readings[] = {
        {0.5, 0.0, "lidar"},
        {1.5, 0.785, "lidar"},
        {3.0, 1.57, "lidar"},
        {0.8, 3.14, "lidar"},
        {2.5, 4.71, "lidar"}
    };

    for (int i = 0; i < 5; i++) {
        cout << "ROBOT_MESSAGE|Callback triggered: " << readings[i].type << " sensor" << endl;
        processSensorData(readings[i]);
    }

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
