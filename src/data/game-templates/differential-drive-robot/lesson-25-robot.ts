import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <vector>
#include <queue>
#include <map>
#include <cmath>
#include <string>
#include <algorithm>
using namespace std;

const int GRID_SIZE = 5;

enum class MissionState { EXPLORE, NAVIGATE, ENGAGE, COMPLETE };

struct Point {
    int x, y;
    bool operator==(const Point& o) const { return x == o.x && y == o.y; }
};

class OccupancyGrid {
public:
    vector<vector<int>> cells;

    OccupancyGrid() : cells(GRID_SIZE, vector<int>(GRID_SIZE, 0)) {}

    void setObstacle(int x, int y) { cells[y][x] = 1; }

    bool isValid(int x, int y) const {
        return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && cells[y][x] == 0;
    }

    void print() const {
        for (int y = GRID_SIZE - 1; y >= 0; y--) {
            string row = "";
            for (int x = 0; x < GRID_SIZE; x++) {
                row += (cells[y][x] == 1) ? "# " : ". ";
            }
            cout << "ROBOT_MESSAGE|" << row << endl;
        }
    }
};

class Robot {
public:
    double x, y, theta;
    int health;
    MissionState state;

    Robot() : x(0), y(0), theta(0), health(100), state(MissionState::EXPLORE) {}

    void moveTo(int tx, int ty) {
        theta = atan2(ty - y, tx - x);
        x = tx;
        y = ty;
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    }

    void reportPosition() {
        cout << "ROBOT|position|" << x << "|" << y << "|" << theta << endl;
    }
};

vector<Point> findPath(OccupancyGrid& grid, Point start, Point goal) {
    struct Node {
        int x, y, g;
        double f;
        int px, py;
        bool operator>(const Node& o) const { return f > o.f; }
    };

    priority_queue<Node, vector<Node>, greater<Node>> open;
    vector<vector<bool>> closed(GRID_SIZE, vector<bool>(GRID_SIZE, false));
    vector<vector<Point>> parent(GRID_SIZE, vector<Point>(GRID_SIZE, {-1, -1}));

    auto h = [&](int x, int y) { return abs(x - goal.x) + abs(y - goal.y); };

    open.push({start.x, start.y, 0, (double)h(start.x, start.y), -1, -1});

    int dx[] = {1, -1, 0, 0};
    int dy[] = {0, 0, 1, -1};

    while (!open.empty()) {
        Node cur = open.top();
        open.pop();

        if (closed[cur.y][cur.x]) continue;
        closed[cur.y][cur.x] = true;
        parent[cur.y][cur.x] = {cur.px, cur.py};

        if (cur.x == goal.x && cur.y == goal.y) {
            vector<Point> path;
            int cx = goal.x, cy = goal.y;
            while (cx != -1 && cy != -1) {
                path.push_back({cx, cy});
                Point p = parent[cy][cx];
                cx = p.x;
                cy = p.y;
            }
            reverse(path.begin(), path.end());
            return path;
        }

        for (int i = 0; i < 4; i++) {
            int nx = cur.x + dx[i], ny = cur.y + dy[i];
            if (grid.isValid(nx, ny) && !closed[ny][nx]) {
                open.push({nx, ny, cur.g + 1, cur.g + 1.0 + h(nx, ny), cur.x, cur.y});
            }
        }
    }

    return {};
}

int main() {
    Robot robot;
    OccupancyGrid grid;

    // Set up environment
    grid.setObstacle(2, 1);
    grid.setObstacle(2, 2);
    grid.setObstacle(3, 3);

    vector<Point> targets = {{4, 0}, {1, 4}, {4, 4}};
    map<string, Point> targetRegistry;
    targetRegistry["Target-A"] = targets[0];
    targetRegistry["Target-B"] = targets[1];
    targetRegistry["Target-C"] = targets[2];

    robot.reportPosition();
    cout << "ROBOT_MESSAGE|Autonomous mission started" << endl;
    cout << "ROBOT_MESSAGE|Objectives: " << targets.size() << " targets to engage" << endl;

    // Phase 1: Explore — show the grid
    robot.state = MissionState::EXPLORE;
    cout << "ROBOT_MESSAGE|State: EXPLORE - Mapping environment" << endl;
    grid.print();

    int engaged = 0;

    // Phase 2-3: Navigate and engage each target
    for (const auto& entry : targetRegistry) {
        robot.state = MissionState::NAVIGATE;
        cout << "ROBOT_MESSAGE|State: NAVIGATE - Heading to " << entry.first << " at ("
             << entry.second.x << "," << entry.second.y << ")" << endl;

        Point start = {(int)robot.x, (int)robot.y};
        vector<Point> path = findPath(grid, start, entry.second);

        if (path.empty()) {
            cout << "ROBOT_MESSAGE|No path found to " << entry.first << endl;
            continue;
        }

        cout << "ROBOT_MESSAGE|Path found: " << path.size() << " steps" << endl;

        for (const auto& p : path) {
            robot.moveTo(p.x, p.y);
        }

        // Engage target
        robot.state = MissionState::ENGAGE;
        cout << "ROBOT_MESSAGE|State: ENGAGE - " << entry.first << " neutralized" << endl;
        engaged++;
        cout << "ROBOT_MESSAGE|Progress: " << engaged << "/" << targets.size() << " targets" << endl;
    }

    // Phase 4: Complete
    robot.state = MissionState::COMPLETE;
    cout << "ROBOT_MESSAGE|State: COMPLETE - All objectives achieved" << endl;
    cout << "ROBOT_MESSAGE|Mission summary: " << engaged << " targets engaged" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson25Robot: GameLessonVariant = {
  lessonId: "25-final-polish",

  instructions: `# Robot Builder: Autonomous Mission

Full integration challenge: combine environment mapping, A* pathfinding, and a state machine to build a fully autonomous robot that maps its environment, navigates to multiple targets, and completes a mission.

## Robot Protocol

Your program communicates with the robot simulator via standard output:

\`\`\`
ROBOT|position|x|y|theta     // Report robot position and heading
ROBOT_MESSAGE|text            // Display a status message
MISSION_COMPLETE              // Signal mission success
\`\`\`

## Your Task

1. Define a \`Robot\` class with position (x, y, theta), health, and a \`MissionState\` (EXPLORE, NAVIGATE, ENGAGE, COMPLETE)
2. Define an \`OccupancyGrid\` class with:
   - A 5x5 grid of cells
   - \`setObstacle(x, y)\` to mark obstacle cells
   - \`isValid(x, y)\` to check bounds and obstacle status
   - \`print()\` to display the grid as ROBOT_MESSAGE lines (\`.\` for free, \`#\` for obstacle)
3. Implement simplified A* pathfinding that finds a path between two points on the grid, avoiding obstacles
4. Set up the environment:
   - Obstacles at: (2,1), (2,2), (3,3)
   - Targets: Target-A at (4,0), Target-B at (1,4), Target-C at (4,4)
5. Execute the autonomous mission through these phases:
   - **EXPLORE**: Map the environment and print the occupancy grid
   - **NAVIGATE**: For each target, use A* to find a path and move the robot along it
   - **ENGAGE**: At each target, output a neutralization message and track progress
   - **COMPLETE**: After all targets are engaged, report mission summary
6. Output state transitions as: \`ROBOT_MESSAGE|State: STATE - description\`
7. Output \`MISSION_COMPLETE\` when done

### Expected Output Format
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|Autonomous mission started
ROBOT_MESSAGE|Objectives: 3 targets to engage
ROBOT_MESSAGE|State: EXPLORE - Mapping environment
...
ROBOT_MESSAGE|State: NAVIGATE - Heading to Target-A at (4,0)
ROBOT_MESSAGE|Path found: N steps
...
ROBOT_MESSAGE|State: ENGAGE - Target-A neutralized
ROBOT_MESSAGE|Progress: 1/3 targets
...
ROBOT_MESSAGE|State: COMPLETE - All objectives achieved
ROBOT_MESSAGE|Mission summary: 3 targets engaged
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <vector>
#include <queue>
#include <map>
#include <cmath>
#include <string>
#include <algorithm>
using namespace std;

// TODO: Bring together everything from this course to build an autonomous robot:

// 1. Define classes: Robot, OccupancyGrid, Target
// 2. Implement simplified A* pathfinding
// 3. Implement a state machine: EXPLORE, NAVIGATE, ENGAGE, COMPLETE
// 4. The robot should:
//    a. Start at (0,0)
//    b. Explore the grid to discover obstacles and targets
//    c. Navigate to each target using pathfinding
//    d. "Engage" each target (output message)
//    e. Complete the mission after all targets engaged

// The grid is 5x5 with:
//   Obstacles at: (2,1), (2,2), (3,3)
//   Targets at: (4,0), (1,4), (4,4)

int main() {
    // TODO: Initialize robot, grid, and targets
    // TODO: Run the autonomous mission
    // TODO: Output MISSION_COMPLETE when done

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "mission-started",
      description: "Mission started",
      expectedOutput: "ROBOT_MESSAGE\\|Autonomous mission started",
      isPattern: true,
    },
    {
      id: "objectives",
      description: "Objectives listed",
      expectedOutput: "ROBOT_MESSAGE\\|Objectives: 3 targets",
      isPattern: true,
    },
    {
      id: "explore-state",
      description: "Explore state entered",
      expectedOutput: "ROBOT_MESSAGE\\|State: EXPLORE",
      isPattern: true,
    },
    {
      id: "navigate-state",
      description: "Navigate state entered",
      expectedOutput: "ROBOT_MESSAGE\\|State: NAVIGATE",
      isPattern: true,
    },
    {
      id: "engage-state",
      description: "Engage state entered",
      expectedOutput: "ROBOT_MESSAGE\\|State: ENGAGE",
      isPattern: true,
    },
    {
      id: "target-engaged",
      description: "Target engaged",
      expectedOutput: "neutralized",
      isPattern: true,
    },
    {
      id: "complete-state",
      description: "Mission complete state",
      expectedOutput: "ROBOT_MESSAGE\\|State: COMPLETE",
      isPattern: true,
    },
    {
      id: "mission-complete",
      description: "Mission complete signal",
      expectedOutput: "MISSION_COMPLETE",
      isPattern: true,
    },
  ],

  hints: [
    "This lesson integrates: classes, pathfinding (A*), state machines, STL containers (map, vector, priority_queue).",
    "The mission follows EXPLORE -> NAVIGATE -> ENGAGE -> COMPLETE for each target.",
    "Use A* pathfinding to navigate around obstacles to each target.",
    "A map<string, Point> stores the target registry for named lookup.",
    "Track progress by counting engaged targets.",
  ],

  accumulatedCode: solutionCode,
};
