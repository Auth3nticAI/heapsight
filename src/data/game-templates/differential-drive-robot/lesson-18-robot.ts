import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

class SensorSuite {
private:
    double lidarRange;
    double cameraFov;
    bool imuActive;

public:
    SensorSuite(double lidar, double camera)
        : lidarRange(lidar), cameraFov(camera), imuActive(true) {}

    void scan() {
        cout << "ROBOT|sensor|" << lidarRange << "|0" << endl;
        cout << "ROBOT|sensor|" << lidarRange * 0.8 << "|1.57" << endl;
        cout << "ROBOT_MESSAGE|Lidar scan complete (range: " << lidarRange << "m)" << endl;
    }

    void status() {
        cout << "ROBOT_MESSAGE|Sensors: Lidar=" << lidarRange
             << "m Camera=" << cameraFov << "deg IMU=" << (imuActive ? "ON" : "OFF") << endl;
    }
};

class Controller {
public:
    virtual ~Controller() {}
    virtual string name() { return "Base"; }
    virtual double compute(double error) { return error * 0.5; }
};

class PIDController : public Controller {
private:
    double kp, ki, kd;
    double integral;
    double prevError;

public:
    PIDController(double p, double i, double d)
        : kp(p), ki(i), kd(d), integral(0), prevError(0) {}

    string name() override { return "PID"; }

    double compute(double error) override {
        integral += error;
        double derivative = error - prevError;
        prevError = error;
        return kp * error + ki * integral + kd * derivative;
    }
};

class Robot {
private:
    string robotName;
    SensorSuite sensors;
    Controller* controller;
    double x, y, theta;

public:
    Robot(string n, SensorSuite s, Controller* ctrl)
        : robotName(n), sensors(s), controller(ctrl), x(0), y(0), theta(0) {}

    void run() {
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT_MESSAGE|" << robotName << " using " << controller->name() << " controller" << endl;

        sensors.status();
        sensors.scan();

        // Simulate 3 control steps
        double target = 5.0;
        for (int i = 0; i < 3; i++) {
            double error = target - x;
            double output = controller->compute(error);
            x += output;
            cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
            cout << "ROBOT|velocity|" << output << "|0" << endl;
            cout << "ROBOT_MESSAGE|Step " << i + 1 << ": error=" << error << " output=" << output << endl;
        }
    }
};

int main() {
    SensorSuite sensors(10.0, 60.0);
    PIDController pid(0.6, 0.1, 0.2);
    Robot explorer("Explorer-X", sensors, &pid);

    cout << "ROBOT_MESSAGE|Composition architecture demo" << endl;

    explorer.run();

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson18Robot: GameLessonVariant = {
  lessonId: "18-score-system",

  instructions: `# Robot Builder: Composition Architecture

Build a robot system using two key OOP patterns: composition (the Robot owns a SensorSuite) and inheritance (PIDController extends a base Controller).

## Robot Protocol
\`\`\`
ROBOT|position|x|y|theta       — Report robot position
ROBOT|velocity|linear|angular   — Report current velocity
ROBOT|sensor|distance|angle     — Report a sensor reading
ROBOT_MESSAGE|text              — Display a status message
MISSION_COMPLETE                — Signal end of mission
\`\`\`

## Your Task
1. Define a \`SensorSuite\` class (composition target):
   - Private members: \`double lidarRange\`, \`double cameraFov\`, \`bool imuActive\`
   - Constructor: \`SensorSuite(double lidar, double camera)\` — sets fields, \`imuActive = true\`
   - \`void scan()\` — outputs \`ROBOT|sensor|range|0\` and \`ROBOT|sensor|range*0.8|1.57\`, then \`ROBOT_MESSAGE|Lidar scan complete (range: Xm)\`
   - \`void status()\` — outputs \`ROBOT_MESSAGE|Sensors: Lidar=Xm Camera=Xdeg IMU=ON/OFF\`
2. Define a base \`Controller\` class:
   - \`virtual string name()\` returns \`"Base"\`
   - \`virtual double compute(double error)\` returns \`error * 0.5\`
3. Define \`PIDController : public Controller\`:
   - Private: \`double kp, ki, kd, integral, prevError\`
   - Constructor: \`PIDController(double p, double i, double d)\`
   - Override \`name()\` to return \`"PID"\`
   - Override \`compute(double error)\` with PID formula: \`kp*error + ki*integral + kd*derivative\`
4. Define a \`Robot\` class that owns a \`SensorSuite\` (composition) and a \`Controller*\` (polymorphism):
   - Constructor: \`Robot(string name, SensorSuite sensors, Controller* ctrl)\`
   - \`void run()\` — reports position, identifies controller, runs sensor status/scan, then executes 3 control steps toward target = 5.0
5. In \`main()\`, create \`SensorSuite(10.0, 60.0)\`, \`PIDController(0.6, 0.1, 0.2)\`, and \`Robot("Explorer-X", ...)\`, then run and output \`MISSION_COMPLETE\`
`,

  starterCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

// TODO: Define a SensorSuite class with:
//   private: double lidarRange, cameraFov; bool imuActive;
//   public:
//     Constructor: SensorSuite(double lidar, double camera)
//       sets lidarRange, cameraFov, imuActive=true
//     void scan() — outputs sensor readings
//     void status() — outputs sensor status message

// TODO: Define a base Controller class with:
//   public: virtual string name() { return "Base"; }
//   virtual double compute(double error) { return error * 0.5; }

// TODO: Define PIDController : public Controller with:
//   private: double kp, ki, kd, integral, prevError
//   public: PIDController(double p, double i, double d)
//   string name() override { return "PID"; }
//   double compute(double error) override — basic PID computation

// TODO: Define Robot class that OWNS (composition) a SensorSuite and a Controller*
//   Robot(string name, SensorSuite sensors, Controller* ctrl)
//   void run() — uses sensors and controller

int main() {
    // TODO: Create a SensorSuite
    // TODO: Create a PIDController
    // TODO: Create a Robot with composition
    // TODO: Run the robot
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "arch-demo",
      description: "Architecture demo message",
      expectedOutput: "ROBOT_MESSAGE\\|Composition architecture demo",
      isPattern: true,
    },
    {
      id: "pid-controller",
      description: "PID controller identified",
      expectedOutput: "ROBOT_MESSAGE\\|Explorer-X using PID controller",
      isPattern: true,
    },
    {
      id: "sensor-status",
      description: "Sensor suite status reported",
      expectedOutput: "ROBOT_MESSAGE\\|Sensors: Lidar=",
      isPattern: true,
    },
    {
      id: "sensor-scan",
      description: "Lidar scan complete",
      expectedOutput: "ROBOT_MESSAGE\\|Lidar scan complete",
      isPattern: true,
    },
    {
      id: "control-step",
      description: "Control step with error/output",
      expectedOutput: "ROBOT_MESSAGE\\|Step 1: error=",
      isPattern: true,
    },
    {
      id: "position-output",
      description: "Position data output",
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
    "Composition means the Robot class OWNS a SensorSuite by value (not pointer).",
    "Inheritance: PIDController inherits from Controller and overrides compute().",
    "Use virtual functions so the Robot can work with any Controller type.",
    "The initializer list in the constructor initializes all member objects.",
  ],

  accumulatedCode: solutionCode,
};
