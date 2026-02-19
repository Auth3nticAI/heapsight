import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <cmath>
using namespace std;

struct Goal {
    double targetX;
    double targetY;
};

struct Feedback {
    double distanceRemaining;
    int percentComplete;
};

struct Result {
    bool success;
    double finalX;
    double finalY;
};

Result navigateToGoal(double& x, double& y, double& theta, const Goal& goal, double speed) {
    double initialDist = sqrt(pow(goal.targetX - x, 2) + pow(goal.targetY - y, 2));
    int lastMilestone = 0;

    while (true) {
        double dist = sqrt(pow(goal.targetX - x, 2) + pow(goal.targetY - y, 2));

        if (dist < 0.1) {
            x = goal.targetX;
            y = goal.targetY;
            cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
            cout << "ROBOT_MESSAGE|Progress: 100% - Goal reached" << endl;
            return {true, x, y};
        }

        theta = atan2(goal.targetY - y, goal.targetX - x);
        x += speed * cos(theta);
        y += speed * sin(theta);
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|" << speed << "|0" << endl;

        int percent = (int)((1.0 - dist / initialDist) * 100);

        if (percent >= 25 && lastMilestone < 25) {
            cout << "ROBOT_MESSAGE|Progress: 25%" << endl;
            lastMilestone = 25;
        } else if (percent >= 50 && lastMilestone < 50) {
            cout << "ROBOT_MESSAGE|Progress: 50%" << endl;
            lastMilestone = 50;
        } else if (percent >= 75 && lastMilestone < 75) {
            cout << "ROBOT_MESSAGE|Progress: 75%" << endl;
            lastMilestone = 75;
        }
    }
}

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    double speed = 0.5;

    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT_MESSAGE|Navigation action started" << endl;

    Goal goal = {3.0, 4.0};
    cout << "ROBOT_MESSAGE|Goal set: (" << goal.targetX << ", " << goal.targetY << ")" << endl;

    Result result = navigateToGoal(x, y, theta, goal, speed);

    if (result.success) {
        cout << "ROBOT_MESSAGE|Navigation complete at (" << result.finalX << ", " << result.finalY << ")" << endl;
    }

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson17Robot: GameLessonVariant = {
  lessonId: "17-ids-and-free-list",

  instructions: `# Robot Builder: Navigate with Feedback

Move a differential-drive robot toward a goal coordinate while reporting progress at 25%, 50%, 75%, and 100% milestones — simulating ROS 2 action feedback.

## Robot Protocol
\`\`\`
ROBOT|position|x|y|theta       — Report robot position each step
ROBOT|velocity|linear|angular   — Report current velocity
ROBOT_MESSAGE|text              — Display a status message
MISSION_COMPLETE                — Signal end of mission
\`\`\`

## Your Task
1. Write a \`navigateToGoal\` function that takes robot state (\`x\`, \`y\`, \`theta\`), a \`Goal\`, and \`speed\`:
   - Compute distance to goal each iteration
   - If distance < 0.1, snap to goal and return a success \`Result\`
   - Compute heading: \`theta = atan2(goalY - y, goalX - x)\`
   - Move: \`x += speed * cos(theta)\`, \`y += speed * sin(theta)\`
   - Compute percent complete: \`(1 - distRemaining / initialDist) * 100\`
   - Output \`ROBOT|position\` and \`ROBOT|velocity\` each step
   - Output \`ROBOT_MESSAGE|Progress: 25%\`, \`50%\`, \`75%\` at milestones (each only once)
   - Output \`ROBOT_MESSAGE|Progress: 100% - Goal reached\` on arrival
2. Set goal to \`(3.0, 4.0)\` — total distance is 5.0 units
3. Output \`ROBOT_MESSAGE|Goal set: (3, 4)\` before navigation
4. On completion, output \`ROBOT_MESSAGE|Navigation complete at (x, y)\`
5. Output \`MISSION_COMPLETE\`

The robot should report all four milestones as it navigates to the target coordinates.
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

struct Goal {
    double targetX;
    double targetY;
};

struct Feedback {
    double distanceRemaining;
    int percentComplete;
};

struct Result {
    bool success;
    double finalX;
    double finalY;
};

// TODO: Write navigateToGoal that takes robot state, goal, and speed
// It should move step-by-step toward the goal:
//   1. Compute distance to goal
//   2. If distance < 0.1, goal reached — return success result
//   3. Compute theta = atan2(goalY - y, goalX - x)
//   4. Move: x += speed * cos(theta), y += speed * sin(theta)
//   5. Compute percent = (1 - distRemaining/initialDist) * 100
//   6. Output feedback at 25%, 50%, 75% milestones
//   7. Output position each step
// Return Result struct

int main() {
    double x = 0.0, y = 0.0, theta = 0.0;
    double speed = 0.5;

    cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    cout << "ROBOT_MESSAGE|Navigation action started" << endl;

    // TODO: Set goal to (3.0, 4.0) — distance = 5.0 units
    // TODO: Navigate to goal, outputting feedback at milestones
    // TODO: On completion, output:
    //   ROBOT_MESSAGE|Navigation complete at (x, y)
    //   MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "action-started",
      description: "Navigation action started",
      expectedOutput: "ROBOT_MESSAGE\\|Navigation action started",
      isPattern: true,
    },
    {
      id: "goal-set",
      description: "Goal coordinates set",
      expectedOutput: "ROBOT_MESSAGE\\|Goal set:",
      isPattern: true,
    },
    {
      id: "progress-25",
      description: "25% progress reported",
      expectedOutput: "ROBOT_MESSAGE\\|Progress: 25%",
      isPattern: true,
    },
    {
      id: "progress-50",
      description: "50% progress reported",
      expectedOutput: "ROBOT_MESSAGE\\|Progress: 50%",
      isPattern: true,
    },
    {
      id: "goal-reached",
      description: "Goal reached at 100%",
      expectedOutput: "ROBOT_MESSAGE\\|Progress: 100%",
      isPattern: true,
    },
    {
      id: "nav-complete",
      description: "Navigation complete",
      expectedOutput: "ROBOT_MESSAGE\\|Navigation complete",
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
    "A ROS 2 action provides feedback during execution, like progress updates.",
    "Use a while(true) loop that breaks when the robot is close enough to the goal.",
    "Track milestones with an integer: only report each percentage once.",
    "atan2(dy, dx) gives you the heading angle from current position to goal.",
  ],

  accumulatedCode: solutionCode,
};
