import type { GameLessonVariant } from "@/types/game";

export const lesson10Robot: GameLessonVariant = {
  lessonId: "10-dynamic-memory",

  instructions: `# Robot Builder: Robot Class

Real robot firmware encapsulates state and behavior into classes. In this lesson, you will define a \`Robot\` class with private state variables and public methods for movement, turning, and status reporting.

## Robot Protocol

Your program communicates with the robot simulator using these protocol lines:

\`\`\`
ROBOT|position|x|y|theta       // Report the robot's current position and heading
ROBOT|velocity|linear|angular   // Report a velocity command
ROBOT_MESSAGE|text              // Display a status message
MISSION_COMPLETE                // Signal that the mission is finished
\`\`\`

## Your Task

1. Define a \`Robot\` class with:
   - **Private members:** \`double x, y, theta;\` \`int health;\` \`string name;\`
   - **Constructor:** \`Robot(string n)\` — initialize x=0, y=0, theta=0, health=100, name=n
   - **Public methods:**
     - \`void move(double distance)\` — update x and y based on theta, output \`ROBOT|position|x|y|theta\`
     - \`void turn(double angle)\` — update theta, output \`ROBOT|position|x|y|theta\`
     - \`void status()\` — output \`ROBOT_MESSAGE|name at (x,y) theta=T health=H\`
     - \`void reportPosition()\` — output \`ROBOT|position|x|y|theta\`
2. In \`main()\`:
   - Create a \`Robot\` named \`"Explorer-1"\`
   - Call \`reportPosition()\` to report the initial position
   - Output: \`ROBOT_MESSAGE|Robot Explorer-1 online\`
   - Move forward **3 units**, turn left **PI/2 radians**, move forward **2 units**
   - Call \`status()\` to print the final state
   - Output: \`MISSION_COMPLETE\`

**Expected output includes:**
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|Robot Explorer-1 online
ROBOT|position|3|0|0
ROBOT|position|3|0|1.5708
ROBOT|position|3|2|1.5708
ROBOT_MESSAGE|Explorer-1 at (3,2) theta=1.5708 health=100
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <cmath>
using namespace std;

// TODO: Define a Robot class with:
// Private members: double x, y, theta; int health; string name;
// Public methods:
//   Constructor: Robot(string n) — sets x=0,y=0,theta=0,health=100,name=n
//   void move(double distance) — updates x,y based on theta, outputs position
//   void turn(double angle) — updates theta, outputs position
//   void status() — outputs ROBOT_MESSAGE with all state
//   void reportPosition() — outputs ROBOT|position|x|y|theta

int main() {
    // TODO: Create a Robot named "Explorer-1"
    // TODO: Report initial position
    // TODO: Output ROBOT_MESSAGE|Robot Explorer-1 online

    // TODO: Move forward 3 units
    // TODO: Turn left PI/2 radians
    // TODO: Move forward 2 units
    // TODO: Call status()

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

class Robot {
private:
    double x, y, theta;
    int health;
    string name;

public:
    Robot(string n) : x(0), y(0), theta(0), health(100), name(n) {}

    void move(double distance) {
        x += distance * cos(theta);
        y += distance * sin(theta);
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|" << distance << "|0" << endl;
    }

    void turn(double angle) {
        theta += angle;
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|0|" << angle << endl;
    }

    void status() {
        cout << "ROBOT_MESSAGE|" << name << " at (" << x << "," << y
             << ") theta=" << theta << " health=" << health << endl;
    }

    void reportPosition() {
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    }
};

int main() {
    Robot explorer("Explorer-1");
    explorer.reportPosition();
    cout << "ROBOT_MESSAGE|Robot Explorer-1 online" << endl;

    explorer.move(3.0);
    explorer.turn(M_PI / 2.0);
    explorer.move(2.0);

    explorer.status();

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
      id: "robot-online",
      description: "Robot comes online",
      expectedOutput: "ROBOT_MESSAGE\\|Robot Explorer-1 online",
      isPattern: true,
    },
    {
      id: "moved-east",
      description: "Robot moved 3 units east",
      expectedOutput: "ROBOT\\|position\\|3\\|",
      isPattern: true,
    },
    {
      id: "status-report",
      description: "Status report with name",
      expectedOutput: "ROBOT_MESSAGE\\|Explorer-1 at",
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
    "Use `class Robot { private: ... public: ... };` to define the class.",
    "The constructor uses an initializer list: Robot(string n) : x(0), y(0), theta(0), health(100), name(n) {}",
    "Methods are defined inside the class body and can access private members directly.",
    "Create an instance with: Robot explorer(\"Explorer-1\");",
    "Call methods with dot notation: explorer.move(3.0);",
  ],

  accumulatedCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

class Robot {
private:
    double x, y, theta;
    int health;
    string name;

public:
    Robot(string n) : x(0), y(0), theta(0), health(100), name(n) {}

    void move(double distance) {
        x += distance * cos(theta);
        y += distance * sin(theta);
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|" << distance << "|0" << endl;
    }

    void turn(double angle) {
        theta += angle;
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
        cout << "ROBOT|velocity|0|" << angle << endl;
    }

    void status() {
        cout << "ROBOT_MESSAGE|" << name << " at (" << x << "," << y
             << ") theta=" << theta << " health=" << health << endl;
    }

    void reportPosition() {
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    }
};

int main() {
    Robot explorer("Explorer-1");
    explorer.reportPosition();
    cout << "ROBOT_MESSAGE|Robot Explorer-1 online" << endl;

    explorer.move(3.0);
    explorer.turn(M_PI / 2.0);
    explorer.move(2.0);

    explorer.status();

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
