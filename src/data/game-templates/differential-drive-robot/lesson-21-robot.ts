import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <cmath>
using namespace std;

class PIDController {
private:
    double kp, ki, kd;
    double integral;
    double prevError;

public:
    PIDController(double p, double i, double d)
        : kp(p), ki(i), kd(d), integral(0), prevError(0) {}

    double compute(double error) {
        integral += error;
        double derivative = error - prevError;
        prevError = error;
        return kp * error + ki * integral + kd * derivative;
    }
};

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    double targetX = 10.0;

    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT_MESSAGE|PID controller initialized (Kp=0.5, Ki=0.05, Kd=0.2)" << endl;

    PIDController pid(0.5, 0.05, 0.2);

    for (int step = 1; step <= 10; step++) {
        double error = targetX - x;
        double output = pid.compute(error);
        x += output;

        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|" << output << "|0" << endl;
        cout << "ROBOT_MESSAGE|Step " << step << ": error=" << error << " output=" << output << endl;

        if (abs(error) < 0.5) {
            cout << "ROBOT_MESSAGE|Target reached within tolerance" << endl;
            break;
        }
    }

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson21Robot: GameLessonVariant = {
  lessonId: "21-checkpoint-save-load",

  instructions: `# Robot Builder: PID Follower

Implement a PID (Proportional-Integral-Derivative) controller to smoothly drive a robot from its starting position to a target position along the x-axis.

## Robot Protocol

Your program communicates with the robot simulator via standard output:

\`\`\`
ROBOT|position|x|y|theta     // Report robot position and heading
ROBOT|velocity|linear|angular // Report current velocity
ROBOT_MESSAGE|text            // Display a status message
MISSION_COMPLETE              // Signal mission success
\`\`\`

## Your Task

1. Define a \`PIDController\` class with private members \`kp\`, \`ki\`, \`kd\`, \`integral\`, and \`prevError\`
2. Implement the constructor \`PIDController(double p, double i, double d)\`
3. Implement \`double compute(double error)\` that calculates PID output:
   - Accumulate integral: \`integral += error\`
   - Compute derivative: \`derivative = error - prevError\`
   - Update: \`prevError = error\`
   - Return: \`kp * error + ki * integral + kd * derivative\`
4. Create a PIDController with gains Kp=0.5, Ki=0.05, Kd=0.2
5. Simulate 10 control steps where each step:
   - Computes error = targetX - x
   - Gets PID output and applies it: x += output
   - Outputs position and velocity via the robot protocol
   - Breaks if \`abs(error) < 0.5\` (target reached)
6. Output \`MISSION_COMPLETE\` when done

### Expected Output Format
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|PID controller initialized (Kp=0.5, Ki=0.05, Kd=0.2)
ROBOT|position|<x>|0|0
ROBOT|velocity|<output>|0
ROBOT_MESSAGE|Step <n>: error=<e> output=<o>
...
ROBOT_MESSAGE|Target reached within tolerance
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

// TODO: Define a PIDController class with:
//   private: double kp, ki, kd, integral, prevError
//   public:
//     PIDController(double p, double i, double d)
//     double compute(double error) — computes PID output:
//       integral += error
//       derivative = error - prevError
//       prevError = error
//       return kp*error + ki*integral + kd*derivative

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    double targetX = 10.0;

    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT_MESSAGE|PID controller initialized (Kp=0.5, Ki=0.05, Kd=0.2)" << endl;

    // TODO: Create PIDController with Kp=0.5, Ki=0.05, Kd=0.2
    // TODO: Simulate 10 control steps:
    //   1. Compute error = targetX - x
    //   2. Get control output from PID
    //   3. Apply: x += output (1D for simplicity)
    //   4. Output: ROBOT|position|x|0|0
    //   5. Output: ROBOT|velocity|output|0
    //   6. If abs(error) < 0.5: output ROBOT_MESSAGE|Target reached and break

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "pid-init",
      description: "PID controller initialized",
      expectedOutput: "ROBOT_MESSAGE\\|PID controller initialized",
      isPattern: true,
    },
    {
      id: "step-output",
      description: "Control step with error/output",
      expectedOutput: "ROBOT_MESSAGE\\|Step 1: error=",
      isPattern: true,
    },
    {
      id: "position-changing",
      description: "Robot position changes",
      expectedOutput: "ROBOT\\|position\\|[1-9]",
      isPattern: true,
    },
    {
      id: "velocity-output",
      description: "Velocity from PID output",
      expectedOutput: "ROBOT\\|velocity\\|",
      isPattern: true,
    },
    {
      id: "target-reached",
      description: "Target reached within tolerance",
      expectedOutput: "ROBOT_MESSAGE\\|Target reached",
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
    "PID = Proportional + Integral + Derivative control.",
    "Proportional: responds to current error. Integral: accumulates past errors. Derivative: predicts future error.",
    "Store integral and prevError as class members so they persist between compute() calls.",
    "Check if abs(error) < 0.5 to know when you're close enough to stop.",
  ],

  accumulatedCode: solutionCode,
};
