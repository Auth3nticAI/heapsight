import type { GameLessonVariant } from "@/types/game";

export const lesson13Robot: GameLessonVariant = {
  lessonId: "13-enums",

  instructions: `# Robot Builder: RobotStats Structure

Real-world robots track multiple pieces of state simultaneously -- position, battery level, health, ammunition, and operational mode. Using enums and structs, you can organize all of this into a clean, readable data structure that your telemetry system can publish.

## Robot Protocol
Your \`publishStats\` function should output:
\`\`\`
ROBOT|position|x|y|theta
ROBOT_MESSAGE|[name] Mode: MODE | Battery: XX% | Health: XXX | Ammo: XX
\`\`\`
At the end of the mission:
\`\`\`
MISSION_COMPLETE
\`\`\`

## Your Task
1. Define an enum \`RobotMode\` with values: \`IDLE\`, \`PATROL\`, \`COMBAT\`, \`CHARGING\`
2. Define a struct \`RobotStats\` with fields: \`double x, y, theta\`, \`double battery\`, \`int health\`, \`int ammo\`, \`RobotMode mode\`, \`string name\`
3. Write \`modeToString(RobotMode mode)\` that converts each enum value to its string name (use a switch statement)
4. Write \`publishStats(const RobotStats& stats)\` that outputs position and a formatted status message
5. In \`main()\`:
   - Create a \`RobotStats\` for "Sentinel-7" at position (5.0, 3.0, 1.57) with battery 75%, health 85, ammo 30, mode PATROL
   - Publish the initial stats
   - Switch to COMBAT mode, reduce ammo to 20 and health to 70, then publish
   - Switch to CHARGING mode, set battery to 95, then publish
   - Output \`MISSION_COMPLETE\`
`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Define an enum RobotMode with values: IDLE, PATROL, COMBAT, CHARGING

// TODO: Define a struct RobotStats with:
//   double x, y, theta
//   double battery
//   int health
//   int ammo
//   RobotMode mode
//   string name

// TODO: Write a function modeToString(RobotMode mode) that returns the mode name

// TODO: Write a function publishStats(const RobotStats& stats) that outputs:
//   ROBOT|position|x|y|theta
//   ROBOT_MESSAGE|[name] Mode: MODE | Battery: XX% | Health: XXX | Ammo: XX

int main() {
    // TODO: Create a RobotStats for "Sentinel-7"
    //   Position: (5.0, 3.0, 1.57), battery: 75.0, health: 85, ammo: 30
    //   Mode: PATROL

    // TODO: Publish initial stats
    // TODO: Change mode to COMBAT, reduce ammo to 20, health to 70
    // TODO: Publish updated stats
    // TODO: Change mode to CHARGING, set battery to 95
    // TODO: Publish final stats
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum RobotMode { IDLE, PATROL, COMBAT, CHARGING };

struct RobotStats {
    double x, y, theta;
    double battery;
    int health;
    int ammo;
    RobotMode mode;
    string name;
};

string modeToString(RobotMode mode) {
    switch (mode) {
        case IDLE: return "IDLE";
        case PATROL: return "PATROL";
        case COMBAT: return "COMBAT";
        case CHARGING: return "CHARGING";
        default: return "UNKNOWN";
    }
}

void publishStats(const RobotStats& stats) {
    cout << "ROBOT|position|" << stats.x << "|" << stats.y << "|" << stats.theta << endl;
    cout << "ROBOT_MESSAGE|[" << stats.name << "] Mode: " << modeToString(stats.mode)
         << " | Battery: " << stats.battery << "% | Health: " << stats.health
         << " | Ammo: " << stats.ammo << endl;
}

int main() {
    RobotStats sentinel = {5.0, 3.0, 1.57, 75.0, 85, 30, PATROL, "Sentinel-7"};

    cout << "ROBOT_MESSAGE|RobotStats system online" << endl;
    publishStats(sentinel);

    // Engage combat
    sentinel.mode = COMBAT;
    sentinel.ammo = 20;
    sentinel.health = 70;
    publishStats(sentinel);

    // Return to charging
    sentinel.mode = CHARGING;
    sentinel.battery = 95.0;
    publishStats(sentinel);

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,

  tests: [
    {
      id: "system-online",
      description: "RobotStats system online",
      expectedOutput: "ROBOT_MESSAGE\\|RobotStats system online",
      isPattern: true,
    },
    {
      id: "patrol-mode",
      description: "Initial patrol mode reported",
      expectedOutput: "ROBOT_MESSAGE\\|\\[Sentinel-7\\] Mode: PATROL",
      isPattern: true,
    },
    {
      id: "combat-mode",
      description: "Combat mode engaged",
      expectedOutput: "ROBOT_MESSAGE\\|\\[Sentinel-7\\] Mode: COMBAT",
      isPattern: true,
    },
    {
      id: "charging-mode",
      description: "Charging mode activated",
      expectedOutput: "ROBOT_MESSAGE\\|\\[Sentinel-7\\] Mode: CHARGING",
      isPattern: true,
    },
    {
      id: "position-output",
      description: "Position output",
      expectedOutput: "ROBOT\\|position\\|5\\|3\\|1\\.57",
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
    "Define enum RobotMode { IDLE, PATROL, COMBAT, CHARGING }; before the struct.",
    "Use a switch statement in modeToString to convert each enum value to a string.",
    "The struct can contain an enum member just like int or double.",
    "Modify struct fields with dot notation: sentinel.mode = COMBAT;",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

enum RobotMode { IDLE, PATROL, COMBAT, CHARGING };

struct RobotStats {
    double x, y, theta;
    double battery;
    int health;
    int ammo;
    RobotMode mode;
    string name;
};

string modeToString(RobotMode mode) {
    switch (mode) {
        case IDLE: return "IDLE";
        case PATROL: return "PATROL";
        case COMBAT: return "COMBAT";
        case CHARGING: return "CHARGING";
        default: return "UNKNOWN";
    }
}

void publishStats(const RobotStats& stats) {
    cout << "ROBOT|position|" << stats.x << "|" << stats.y << "|" << stats.theta << endl;
    cout << "ROBOT_MESSAGE|[" << stats.name << "] Mode: " << modeToString(stats.mode)
         << " | Battery: " << stats.battery << "% | Health: " << stats.health
         << " | Ammo: " << stats.ammo << endl;
}

int main() {
    RobotStats sentinel = {5.0, 3.0, 1.57, 75.0, 85, 30, PATROL, "Sentinel-7"};

    cout << "ROBOT_MESSAGE|RobotStats system online" << endl;
    publishStats(sentinel);

    // Engage combat
    sentinel.mode = COMBAT;
    sentinel.ammo = 20;
    sentinel.health = 70;
    publishStats(sentinel);

    // Return to charging
    sentinel.mode = CHARGING;
    sentinel.battery = 95.0;
    publishStats(sentinel);

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`,
};
