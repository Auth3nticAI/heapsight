import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
#include <cmath>
#include <string>
using namespace std;

struct Target {
    string id;
    double x;
    double y;
    int threat;
};

int main() {
    double robotX = 0.0, robotY = 0.0;
    cout << "ROBOT|position|" << robotX << "|" << robotY << "|0" << endl;

    // Target registry using map
    map<string, Target> registry;
    registry["T1"] = {"T1", 3.0, 4.0, 5};
    registry["T2"] = {"T2", 1.0, 1.0, 8};
    registry["T3"] = {"T3", 6.0, 2.0, 3};
    registry["T4"] = {"T4", 2.0, 5.0, 7};

    cout << "ROBOT_MESSAGE|Registry: " << registry.size() << " targets loaded" << endl;

    for (const auto& pair : registry) {
        const Target& t = pair.second;
        cout << "ROBOT_MESSAGE|Target " << t.id << " at (" << t.x << "," << t.y
             << ") threat=" << t.threat << endl;
    }

    // Copy to vector for sorting
    vector<Target> targets;
    for (const auto& pair : registry) {
        targets.push_back(pair.second);
    }

    // Sort by distance (nearest first)
    sort(targets.begin(), targets.end(), [&](const Target& a, const Target& b) {
        double distA = sqrt(pow(a.x - robotX, 2) + pow(a.y - robotY, 2));
        double distB = sqrt(pow(b.x - robotX, 2) + pow(b.y - robotY, 2));
        return distA < distB;
    });

    cout << "ROBOT_MESSAGE|Nearest target: " << targets[0].id << " ("
         << sqrt(pow(targets[0].x - robotX, 2) + pow(targets[0].y - robotY, 2)) << "m)" << endl;

    // Output sensor readings for each target
    for (const auto& t : targets) {
        double dist = sqrt(pow(t.x - robotX, 2) + pow(t.y - robotY, 2));
        double angle = atan2(t.y - robotY, t.x - robotX);
        cout << "ROBOT|sensor|" << dist << "|" << angle << endl;
    }

    // Sort by threat level (descending)
    sort(targets.begin(), targets.end(), [](const Target& a, const Target& b) {
        return a.threat > b.threat;
    });

    cout << "ROBOT_MESSAGE|Highest threat: " << targets[0].id
         << " (level " << targets[0].threat << ")" << endl;

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson20Robot: GameLessonVariant = {
  lessonId: "20-spatial-buckets-v0",

  instructions: `# Robot Builder: Target Database

Use \`std::map\` for keyed target storage and \`std::sort\` with lambda comparators to prioritize targets by distance and threat level.

## Robot Protocol
\`\`\`
ROBOT|position|x|y|theta       — Report robot position
ROBOT|sensor|distance|angle     — Report sensor reading for each target
ROBOT_MESSAGE|text              — Display a status message
MISSION_COMPLETE                — Signal end of mission
\`\`\`

## Your Task
1. Create a \`map<string, Target>\` registry and add these targets:
   - \`"T1": {"T1", 3.0, 4.0, 5}\`
   - \`"T2": {"T2", 1.0, 1.0, 8}\`
   - \`"T3": {"T3", 6.0, 2.0, 3}\`
   - \`"T4": {"T4", 2.0, 5.0, 7}\`
2. Output \`ROBOT_MESSAGE|Registry: 4 targets loaded\`
3. List each target: \`ROBOT_MESSAGE|Target ID at (x,y) threat=T\`
4. Copy map entries into a \`vector<Target>\` and sort by distance from the robot (nearest first) using \`std::sort\` with a lambda comparator
5. Output the nearest target: \`ROBOT_MESSAGE|Nearest target: ID (Xm)\`
6. Output \`ROBOT|sensor|distance|angle\` for each target (sorted by distance)
7. Re-sort by threat level (descending) and output: \`ROBOT_MESSAGE|Highest threat: ID (level X)\`
8. Output \`MISSION_COMPLETE\`

The robot at origin (0,0) should identify T2 as the nearest target and T2 as the highest threat (level 8).
`,

  starterCode: `#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
#include <cmath>
#include <string>
using namespace std;

struct Target {
    string id;
    double x;
    double y;
    int threat;
};

int main() {
    double robotX = 0.0, robotY = 0.0;
    cout << "ROBOT|position|" << robotX << "|" << robotY << "|0" << endl;

    // TODO: Create a map<string, Target> as the target registry
    // Add these targets:
    //   "T1": {"T1", 3.0, 4.0, 5}
    //   "T2": {"T2", 1.0, 1.0, 8}
    //   "T3": {"T3", 6.0, 2.0, 3}
    //   "T4": {"T4", 2.0, 5.0, 7}

    // TODO: Output registry contents
    //   ROBOT_MESSAGE|Registry: X targets loaded
    //   For each target: ROBOT_MESSAGE|Target ID at (x,y) threat=T

    // TODO: Create a vector<Target> and sort by distance from robot
    //   Use std::sort with a lambda comparing distances

    // TODO: Output sorted targets (nearest first)
    //   ROBOT_MESSAGE|Nearest: ID (Xm) | Next: ID (Xm) | ...

    // TODO: Sort by threat level (descending)
    //   Output: ROBOT_MESSAGE|Highest threat: ID (level X)

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "registry-loaded",
      description: "Target registry loaded",
      expectedOutput: "ROBOT_MESSAGE\\|Registry: 4 targets loaded",
      isPattern: true,
    },
    {
      id: "target-entry",
      description: "Target entry listed",
      expectedOutput: "ROBOT_MESSAGE\\|Target T1 at",
      isPattern: true,
    },
    {
      id: "nearest-target",
      description: "Nearest target identified",
      expectedOutput: "ROBOT_MESSAGE\\|Nearest target: T2",
      isPattern: true,
    },
    {
      id: "highest-threat",
      description: "Highest threat identified",
      expectedOutput: "ROBOT_MESSAGE\\|Highest threat: T2 \\(level 8\\)",
      isPattern: true,
    },
    {
      id: "sensor-output",
      description: "Sensor readings for targets",
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
    "Use std::map<string, Target> for O(log n) lookup by ID.",
    "Copy map values to a vector for sorting: vectors support random access for sort.",
    "Lambda comparators: sort(v.begin(), v.end(), [](const T& a, const T& b) { return ...; });",
    "std::sort is in <algorithm>. sqrt and pow are in <cmath>.",
  ],

  accumulatedCode: solutionCode,
};
