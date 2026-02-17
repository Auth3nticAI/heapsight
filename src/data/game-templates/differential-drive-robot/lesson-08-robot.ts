import type { GameLessonVariant } from "@/types/game";

export const lesson08Robot: GameLessonVariant = {
  lessonId: "08-conditionals",

  instructions: `# Robot Builder: Dynamic Waypoint Manager

Autonomous robots navigate by following a sequence of waypoints. In this lesson, you will manage waypoints using \`unique_ptr\` smart pointers and navigate the robot through each one.

## Robot Protocol

Your program communicates with the robot simulator using these protocol lines:

\`\`\`
ROBOT|position|x|y|theta       // Report the robot's current position and heading
ROBOT_MESSAGE|text              // Display a status message
MISSION_COMPLETE                // Signal that the mission is finished
\`\`\`

## Your Task

1. Create three waypoints using \`make_unique<Waypoint>\`:
   - \`wp1\`: position (3.0, 0.0), label "Alpha"
   - \`wp2\`: position (3.0, 4.0), label "Beta"
   - \`wp3\`: position (0.0, 4.0), label "Gamma"
2. Store them in a \`vector<unique_ptr<Waypoint>>\` using \`std::move()\` to transfer ownership
3. Loop through the waypoints and navigate to each one:
   - Compute heading: \`theta = atan2(wy - ry, wx - rx)\`
   - Update position: \`rx = wx\`, \`ry = wy\`
   - Output: \`ROBOT|position|rx|ry|theta\`
   - Output: \`ROBOT_MESSAGE|Reached waypoint: LABEL\`
4. Output: \`MISSION_COMPLETE\`

**Expected output includes:**
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|Loaded 3 waypoints
ROBOT|position|3|0|0
ROBOT_MESSAGE|Reached waypoint: Alpha
ROBOT|position|3|4|1.5708
ROBOT_MESSAGE|Reached waypoint: Beta
ROBOT|position|0|4|3.14159
ROBOT_MESSAGE|Reached waypoint: Gamma
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <memory>
#include <vector>
#include <cmath>
using namespace std;

struct Waypoint {
    double x;
    double y;
    string label;
};

int main() {
    double rx = 0.0, ry = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << rx << "|" << ry << "|" << theta << endl;

    // TODO: Create waypoints using smart pointers
    // auto wp1 = make_unique<Waypoint>(Waypoint{3.0, 0.0, "Alpha"});
    // auto wp2 = make_unique<Waypoint>(Waypoint{3.0, 4.0, "Beta"});
    // auto wp3 = make_unique<Waypoint>(Waypoint{0.0, 4.0, "Gamma"});

    // TODO: Store in a vector of unique_ptr<Waypoint>
    // vector<unique_ptr<Waypoint>> waypoints;
    // Use std::move() to transfer ownership

    // TODO: Navigate to each waypoint in order
    // For each waypoint:
    //   Compute theta = atan2(wy - ry, wx - rx)
    //   Update rx = wx, ry = wy
    //   Output: ROBOT|position|rx|ry|theta
    //   Output: ROBOT_MESSAGE|Reached waypoint: LABEL

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <memory>
#include <vector>
#include <cmath>
using namespace std;

struct Waypoint {
    double x;
    double y;
    string label;
};

int main() {
    double rx = 0.0, ry = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << rx << "|" << ry << "|" << theta << endl;

    // Create waypoints with unique_ptr
    vector<unique_ptr<Waypoint>> waypoints;
    waypoints.push_back(make_unique<Waypoint>(Waypoint{3.0, 0.0, "Alpha"}));
    waypoints.push_back(make_unique<Waypoint>(Waypoint{3.0, 4.0, "Beta"}));
    waypoints.push_back(make_unique<Waypoint>(Waypoint{0.0, 4.0, "Gamma"}));

    cout << "ROBOT_MESSAGE|Loaded " << waypoints.size() << " waypoints" << endl;

    // Navigate to each waypoint
    for (const auto& wp : waypoints) {
        theta = atan2(wp->y - ry, wp->x - rx);
        rx = wp->x;
        ry = wp->y;
        cout << "ROBOT|position|" << rx << "|" << ry << "|" << theta << endl;
        cout << "ROBOT_MESSAGE|Reached waypoint: " << wp->label << endl;
    }

    cout << "ROBOT_MESSAGE|All waypoints visited" << endl;
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
      id: "waypoints-loaded",
      description: "3 waypoints loaded",
      expectedOutput: "ROBOT_MESSAGE\\|Loaded 3 waypoints",
      isPattern: true,
    },
    {
      id: "reached-alpha",
      description: "Reached waypoint Alpha",
      expectedOutput: "ROBOT_MESSAGE\\|Reached waypoint: Alpha",
      isPattern: true,
    },
    {
      id: "reached-gamma",
      description: "Reached waypoint Gamma",
      expectedOutput: "ROBOT_MESSAGE\\|Reached waypoint: Gamma",
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
    "Use make_unique<Waypoint>(Waypoint{x, y, label}) to create each waypoint.",
    "Transfer ownership to the vector with push_back(std::move(wp)).",
    "In a range-based for loop with unique_ptr, use: for (const auto& wp : waypoints)",
    "Access members through the smart pointer with wp->x, wp->y, wp->label.",
  ],

  accumulatedCode: `#include <iostream>
#include <memory>
#include <vector>
#include <cmath>
using namespace std;

struct Waypoint {
    double x;
    double y;
    string label;
};

int main() {
    double rx = 0.0, ry = 0.0, theta = 0.0;
    cout << "ROBOT|position|" << rx << "|" << ry << "|" << theta << endl;

    // Create waypoints with unique_ptr
    vector<unique_ptr<Waypoint>> waypoints;
    waypoints.push_back(make_unique<Waypoint>(Waypoint{3.0, 0.0, "Alpha"}));
    waypoints.push_back(make_unique<Waypoint>(Waypoint{3.0, 4.0, "Beta"}));
    waypoints.push_back(make_unique<Waypoint>(Waypoint{0.0, 4.0, "Gamma"}));

    cout << "ROBOT_MESSAGE|Loaded " << waypoints.size() << " waypoints" << endl;

    // Navigate to each waypoint
    for (const auto& wp : waypoints) {
        theta = atan2(wp->y - ry, wp->x - rx);
        rx = wp->x;
        ry = wp->y;
        cout << "ROBOT|position|" << rx << "|" << ry << "|" << theta << endl;
        cout << "ROBOT_MESSAGE|Reached waypoint: " << wp->label << endl;
    }

    cout << "ROBOT_MESSAGE|All waypoints visited" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
