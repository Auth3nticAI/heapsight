import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

enum class State { PATROL, CHASE, RETREAT };

struct Robot {
    double x, y, theta;
    int health;
    double speed;
    State state;
};

string stateToString(State s) {
    switch (s) {
        case State::PATROL: return "PATROL";
        case State::CHASE: return "CHASE";
        case State::RETREAT: return "RETREAT";
        default: return "UNKNOWN";
    }
}

void updateState(Robot& robot, double enemyDist, int enemyCount) {
    State prev = robot.state;

    switch (robot.state) {
        case State::PATROL:
            if (enemyDist < 3.0 && robot.health > 30) robot.state = State::CHASE;
            else if (enemyDist < 3.0 && robot.health <= 30) robot.state = State::RETREAT;
            break;
        case State::CHASE:
            if (enemyDist > 5.0) robot.state = State::PATROL;
            else if (robot.health <= 20) robot.state = State::RETREAT;
            break;
        case State::RETREAT:
            if (robot.health > 50) robot.state = State::PATROL;
            else if (enemyDist > 8.0) robot.state = State::PATROL;
            break;
    }

    if (robot.state != prev) {
        cout << "ROBOT_MESSAGE|Transition: " << stateToString(prev) << " -> " << stateToString(robot.state) << endl;
    }
}

void executeState(Robot& robot) {
    switch (robot.state) {
        case State::PATROL:
            robot.speed = 0.5;
            cout << "ROBOT_MESSAGE|Patrolling area..." << endl;
            break;
        case State::CHASE:
            robot.speed = 2.0;
            cout << "ROBOT_MESSAGE|Chasing enemy!" << endl;
            break;
        case State::RETREAT:
            robot.speed = -1.0;
            cout << "ROBOT_MESSAGE|Retreating to safety!" << endl;
            break;
    }
}

int main() {
    Robot robot = {0, 0, 0, 100, 0.5, State::PATROL};
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT_MESSAGE|State machine initialized" << endl;

    // Simulation data: {enemyDist, enemyCount, healthOverride}
    double scenarios[][3] = {
        {10, 0, 100}, {10, 0, 100},    // Tick 1-2: patrol
        {2, 1, 100},  {2, 1, 100},     // Tick 3-4: chase
        {6, 0, 100},  {6, 0, 100},     // Tick 5-6: patrol again
        {2, 1, 25},                      // Tick 7: retreat
        {9, 0, 25}                       // Tick 8: patrol again
    };

    for (int tick = 0; tick < 8; tick++) {
        robot.health = (int)scenarios[tick][2];
        updateState(robot, scenarios[tick][0], (int)scenarios[tick][1]);
        executeState(robot);

        robot.x += robot.speed * cos(robot.theta);
        cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
        cout << "ROBOT|velocity|" << robot.speed << "|0" << endl;
        cout << "ROBOT_MESSAGE|State: " << stateToString(robot.state) << endl;
    }

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson24Robot: GameLessonVariant = {
  lessonId: "24-debugging",

  instructions: `# Robot Builder: State Machine

Build a Finite State Machine (FSM) to control a robot with three behavioral states: PATROL, CHASE, and RETREAT. The robot autonomously transitions between states based on enemy proximity and its own health.

## Robot Protocol

Your program communicates with the robot simulator via standard output:

\`\`\`
ROBOT|position|x|y|theta     // Report robot position and heading
ROBOT|velocity|linear|angular // Report current velocity
ROBOT_MESSAGE|text            // Display a status message
MISSION_COMPLETE              // Signal mission success
\`\`\`

## Your Task

1. Write \`stateToString(State s)\` that returns the state name as a string ("PATROL", "CHASE", or "RETREAT")
2. Write \`updateState(Robot& robot, double enemyDist, int enemyCount)\` with these transition rules:
   - **PATROL**: if enemyDist < 3.0 and health > 30 --> CHASE; if enemyDist < 3.0 and health <= 30 --> RETREAT
   - **CHASE**: if enemyDist > 5.0 --> PATROL; if health <= 20 --> RETREAT
   - **RETREAT**: if health > 50 --> PATROL; if enemyDist > 8.0 --> PATROL
   - On any transition, output: \`ROBOT_MESSAGE|Transition: OLD_STATE -> NEW_STATE\`
3. Write \`executeState(Robot& robot)\` with per-state behavior:
   - PATROL: speed = 0.5, output "Patrolling area..."
   - CHASE: speed = 2.0, output "Chasing enemy!"
   - RETREAT: speed = -1.0, output "Retreating to safety!"
4. Simulate 8 ticks with these conditions:
   - Tick 1-2: enemyDist=10, enemyCount=0, health=100 (patrol)
   - Tick 3-4: enemyDist=2, enemyCount=1, health=100 (chase)
   - Tick 5-6: enemyDist=6, enemyCount=0, health=100 (patrol)
   - Tick 7: enemyDist=2, health=25 (retreat)
   - Tick 8: enemyDist=9, health=25 (patrol)
5. Each tick: update state, execute state, move robot (x += speed * cos(theta)), output position, velocity, and current state
6. Output \`MISSION_COMPLETE\` when done

### Expected Output Format
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|State machine initialized
ROBOT_MESSAGE|Patrolling area...
ROBOT|position|<x>|0|0
ROBOT|velocity|0.5|0
ROBOT_MESSAGE|State: PATROL
ROBOT_MESSAGE|Transition: PATROL -> CHASE
ROBOT_MESSAGE|Chasing enemy!
...
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

enum class State { PATROL, CHASE, RETREAT };

struct Robot {
    double x, y, theta;
    int health;
    double speed;
    State state;
};

// TODO: Write string stateToString(State s) — returns state name

// TODO: Write void updateState(Robot& robot, double enemyDist, int enemyCount)
// Transition logic:
//   PATROL: if enemyDist < 3.0 && health > 30 → CHASE
//           if enemyDist < 3.0 && health <= 30 → RETREAT
//   CHASE:  if enemyDist > 5.0 → PATROL
//           if health <= 20 → RETREAT
//   RETREAT: if health > 50 → PATROL
//            if enemyDist > 8.0 → PATROL

// TODO: Write void executeState(Robot& robot)
//   PATROL: move forward slowly (speed=0.5), output patrol message
//   CHASE: move forward fast (speed=2.0), output chase message
//   RETREAT: move backward (speed=-1.0), output retreat message

int main() {
    Robot robot = {0, 0, 0, 100, 0.5, State::PATROL};
    cout << "ROBOT|position|" << robot.x << "|" << robot.y << "|" << robot.theta << endl;
    cout << "ROBOT_MESSAGE|State machine initialized" << endl;

    // TODO: Simulate 8 ticks with these conditions:
    // Tick 1-2: enemyDist=10, enemyCount=0 (patrol)
    // Tick 3-4: enemyDist=2, enemyCount=1, health stays 100 (chase)
    // Tick 5-6: enemyDist=6, enemyCount=0 (back to patrol after chase)
    // Tick 7: enemyDist=2, health=25 (retreat)
    // Tick 8: enemyDist=9, health=25 (back to patrol)

    // Each tick:
    //   1. Call updateState
    //   2. Call executeState
    //   3. Output: ROBOT_MESSAGE|State: STATE
    //   4. Move robot: x += speed * cos(theta)

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "fsm-init",
      description: "State machine initialized",
      expectedOutput: "ROBOT_MESSAGE\\|State machine initialized",
      isPattern: true,
    },
    {
      id: "patrol-state",
      description: "Robot patrols",
      expectedOutput: "ROBOT_MESSAGE\\|Patrolling area",
      isPattern: true,
    },
    {
      id: "chase-state",
      description: "Robot chases enemy",
      expectedOutput: "ROBOT_MESSAGE\\|Chasing enemy",
      isPattern: true,
    },
    {
      id: "retreat-state",
      description: "Robot retreats",
      expectedOutput: "ROBOT_MESSAGE\\|Retreating to safety",
      isPattern: true,
    },
    {
      id: "transition",
      description: "State transition logged",
      expectedOutput: "ROBOT_MESSAGE\\|Transition: PATROL -> CHASE",
      isPattern: true,
    },
    {
      id: "state-output",
      description: "State reported each tick",
      expectedOutput: "ROBOT_MESSAGE\\|State: PATROL",
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
    "Use enum class State for type-safe state values.",
    "A switch statement in updateState handles transitions for each current state.",
    "Each state has different behavior in executeState: patrol=slow, chase=fast, retreat=backward.",
    "Log state transitions to help debug the FSM behavior.",
  ],

  accumulatedCode: solutionCode,
};
