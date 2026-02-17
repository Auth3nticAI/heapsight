import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <vector>
#include <string>
#include <cmath>
using namespace std;

struct SensorData {
    string type;
    double value;
    double timestamp;
};

void processLidar(const SensorData& data) {
    cout << "ROBOT|sensor|" << data.value << "|0" << endl;
    cout << "ROBOT_MESSAGE|[LIDAR] Range: " << data.value << "m at t=" << data.timestamp << endl;
}

void processCamera(const SensorData& data) {
    cout << "ROBOT_MESSAGE|[CAMERA] Objects detected: " << (int)data.value << " at t=" << data.timestamp << endl;
}

void processIMU(const SensorData& data) {
    cout << "ROBOT_MESSAGE|[IMU] Angular velocity: " << data.value << " rad/s at t=" << data.timestamp << endl;
}

void processSensorStream(vector<SensorData>& stream) {
    for (const auto& data : stream) {
        if (data.type == "lidar") {
            processLidar(data);
        } else if (data.type == "camera") {
            processCamera(data);
        } else if (data.type == "imu") {
            processIMU(data);
        }
    }
}

int main() {
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|Multi-sensor processing pipeline active" << endl;

    vector<SensorData> stream = {
        {"lidar", 3.5, 0.1}, {"camera", 2, 0.1}, {"imu", 0.5, 0.1},
        {"lidar", 2.8, 0.2}, {"camera", 3, 0.2}, {"imu", 0.3, 0.2},
        {"lidar", 1.2, 0.3}, {"camera", 1, 0.3}, {"imu", 0.8, 0.3}
    };

    processSensorStream(stream);

    cout << "ROBOT_MESSAGE|Processed " << stream.size() << " readings from 3 sensors" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson19Robot: GameLessonVariant = {
  lessonId: "19-difficulty",

  instructions: `# Robot Builder: Concurrent Sensor Processing

Route interleaved lidar, camera, and IMU sensor data through dedicated processor functions — simulating how a real robot handles multiple ROS 2 topic subscriptions concurrently.

## Robot Protocol
\`\`\`
ROBOT|position|x|y|theta       — Report robot position
ROBOT|sensor|distance|angle     — Report a sensor reading (lidar)
ROBOT_MESSAGE|text              — Display a status message
MISSION_COMPLETE                — Signal end of mission
\`\`\`

## Your Task
1. Write \`processLidar(const SensorData& data)\` that outputs:
   - \`ROBOT|sensor|value|0\`
   - \`ROBOT_MESSAGE|[LIDAR] Range: Xm at t=T\`
2. Write \`processCamera(const SensorData& data)\` that outputs:
   - \`ROBOT_MESSAGE|[CAMERA] Objects detected: X at t=T\`
3. Write \`processIMU(const SensorData& data)\` that outputs:
   - \`ROBOT_MESSAGE|[IMU] Angular velocity: X rad/s at t=T\`
4. Write \`processSensorStream(vector<SensorData>& stream)\` that iterates through the stream and routes each reading to the correct processor based on its \`type\` field (\`"lidar"\`, \`"camera"\`, or \`"imu"\`)
5. Create a \`vector<SensorData>\` stream with 9 interleaved readings (3 timestamps x 3 sensors):
   - \`{lidar, 3.5, 0.1}\`, \`{camera, 2, 0.1}\`, \`{imu, 0.5, 0.1}\`
   - \`{lidar, 2.8, 0.2}\`, \`{camera, 3, 0.2}\`, \`{imu, 0.3, 0.2}\`
   - \`{lidar, 1.2, 0.3}\`, \`{camera, 1, 0.3}\`, \`{imu, 0.8, 0.3}\`
6. Process the stream and output a summary: \`ROBOT_MESSAGE|Processed 9 readings from 3 sensors\`
7. Output \`MISSION_COMPLETE\`

Each sensor type should be handled by its dedicated processor, demonstrating separation of concerns in a multi-sensor robotics pipeline.
`,

  starterCode: `#include <iostream>
#include <vector>
#include <string>
#include <cmath>
using namespace std;

struct SensorData {
    string type;
    double value;
    double timestamp;
};

// TODO: Write processLidar(const SensorData& data) that outputs:
//   ROBOT|sensor|value|0
//   ROBOT_MESSAGE|[LIDAR] Range: Xm at t=T

// TODO: Write processCamera(const SensorData& data) that outputs:
//   ROBOT_MESSAGE|[CAMERA] Objects detected: X at t=T

// TODO: Write processIMU(const SensorData& data) that outputs:
//   ROBOT_MESSAGE|[IMU] Angular velocity: X rad/s at t=T

// TODO: Write processSensorStream(vector<SensorData>& stream)
//   that routes each reading to the correct processor by type

int main() {
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|Multi-sensor processing pipeline active" << endl;

    // TODO: Create a stream of interleaved sensor data:
    // {lidar, 3.5, 0.1}, {camera, 2, 0.1}, {imu, 0.5, 0.1},
    // {lidar, 2.8, 0.2}, {camera, 3, 0.2}, {imu, 0.3, 0.2},
    // {lidar, 1.2, 0.3}, {camera, 1, 0.3}, {imu, 0.8, 0.3}

    // TODO: Process the stream
    // TODO: Output summary: ROBOT_MESSAGE|Processed X readings from 3 sensors
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "pipeline-active",
      description: "Pipeline activated",
      expectedOutput: "ROBOT_MESSAGE\\|Multi-sensor processing pipeline active",
      isPattern: true,
    },
    {
      id: "lidar-processed",
      description: "Lidar data processed",
      expectedOutput: "ROBOT_MESSAGE\\|\\[LIDAR\\] Range:",
      isPattern: true,
    },
    {
      id: "camera-processed",
      description: "Camera data processed",
      expectedOutput: "ROBOT_MESSAGE\\|\\[CAMERA\\] Objects detected:",
      isPattern: true,
    },
    {
      id: "imu-processed",
      description: "IMU data processed",
      expectedOutput: "ROBOT_MESSAGE\\|\\[IMU\\] Angular velocity:",
      isPattern: true,
    },
    {
      id: "summary",
      description: "Processing summary",
      expectedOutput: "ROBOT_MESSAGE\\|Processed 9 readings from 3 sensors",
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
    "In a real robot, different sensor types arrive on separate ROS 2 topics simultaneously.",
    "Route each reading to the correct processor by checking its type string.",
    "Use range-based for: for (const auto& data : stream) for clean iteration.",
    "Each processor function handles only its specific sensor type \u2014 separation of concerns.",
  ],

  accumulatedCode: solutionCode,
};
