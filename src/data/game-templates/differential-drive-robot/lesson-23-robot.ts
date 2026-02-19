import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <algorithm>
using namespace std;

const int GRID = 5;

struct Node {
    int x, y;
    double g, h, f;
    int parentX, parentY;
};

struct CompareNode {
    bool operator()(const Node& a, const Node& b) {
        return a.f > b.f;
    }
};

double heuristic(int x1, int y1, int x2, int y2) {
    return abs(x1 - x2) + abs(y1 - y2);
}

bool isValid(int x, int y, vector<vector<int>>& grid) {
    return x >= 0 && x < GRID && y >= 0 && y < GRID && grid[y][x] == 0;
}

vector<pair<int,int>> astar(vector<vector<int>>& grid, int sx, int sy, int gx, int gy) {
    priority_queue<Node, vector<Node>, CompareNode> open;
    vector<vector<bool>> closed(GRID, vector<bool>(GRID, false));
    vector<vector<pair<int,int>>> parent(GRID, vector<pair<int,int>>(GRID, {-1, -1}));

    open.push({sx, sy, 0, heuristic(sx, sy, gx, gy), heuristic(sx, sy, gx, gy), -1, -1});

    int dx[] = {1, -1, 0, 0};
    int dy[] = {0, 0, 1, -1};
    int explored = 0;

    while (!open.empty()) {
        Node current = open.top();
        open.pop();

        if (closed[current.y][current.x]) continue;
        closed[current.y][current.x] = true;
        parent[current.y][current.x] = {current.parentX, current.parentY};
        explored++;

        cout << "ROBOT_MESSAGE|Exploring (" << current.x << "," << current.y
             << ") f=" << current.f << endl;

        if (current.x == gx && current.y == gy) {
            cout << "ROBOT_MESSAGE|Goal found after exploring " << explored << " nodes" << endl;

            // Reconstruct path
            vector<pair<int,int>> path;
            int cx = gx, cy = gy;
            while (cx != -1 && cy != -1) {
                path.push_back({cx, cy});
                auto p = parent[cy][cx];
                cx = p.first;
                cy = p.second;
            }
            reverse(path.begin(), path.end());
            return path;
        }

        for (int i = 0; i < 4; i++) {
            int nx = current.x + dx[i];
            int ny = current.y + dy[i];
            if (isValid(nx, ny, grid) && !closed[ny][nx]) {
                double ng = current.g + 1;
                double nh = heuristic(nx, ny, gx, gy);
                open.push({nx, ny, ng, nh, ng + nh, current.x, current.y});
            }
        }
    }

    return {};
}

int main() {
    vector<vector<int>> grid = {
        {0, 0, 0, 0, 0},
        {0, 1, 1, 0, 0},
        {0, 0, 1, 0, 0},
        {0, 0, 0, 1, 0},
        {0, 0, 0, 0, 0}
    };

    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|A* pathfinding initialized" << endl;

    vector<pair<int,int>> path = astar(grid, 0, 0, 4, 4);

    if (!path.empty()) {
        string pathStr = "";
        for (int i = 0; i < (int)path.size(); i++) {
            if (i > 0) pathStr += "->";
            pathStr += "(" + to_string(path[i].first) + "," + to_string(path[i].second) + ")";
        }
        cout << "ROBOT_MESSAGE|Path: " << pathStr << endl;

        // Move robot along path
        for (const auto& p : path) {
            cout << "ROBOT|position|" << p.first << "|" << p.second << "|0" << endl;
        }

        cout << "ROBOT_MESSAGE|Path length: " << path.size() << " steps" << endl;
    }

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson23Robot: GameLessonVariant = {
  lessonId: "23-thread-awareness-v0",

  instructions: `# Robot Builder: A* Pathfinding

Implement the A* search algorithm to navigate a robot through a 5x5 grid with obstacles, finding the shortest path from the start position to the goal.

## Robot Protocol

Your program communicates with the robot simulator via standard output:

\`\`\`
ROBOT|position|x|y|theta     // Report robot position and heading
ROBOT_MESSAGE|text            // Display a status message
MISSION_COMPLETE              // Signal mission success
\`\`\`

## Your Task

1. Write a \`heuristic(x1, y1, x2, y2)\` function that returns the Manhattan distance between two points
2. Write an \`isValid(x, y, grid)\` function that returns true if the cell is within bounds and not an obstacle
3. Implement A* search in \`astar(grid, sx, sy, gx, gy)\`:
   - Use a priority queue (min-heap) ordered by f = g + h
   - Track visited nodes with a closed set
   - Store parent pointers to reconstruct the path
   - Output \`ROBOT_MESSAGE|Exploring (x,y) f=<value>\` for each node explored
   - When the goal is found, output \`ROBOT_MESSAGE|Goal found after exploring N nodes\`
   - Reconstruct and return the path by following parent pointers from goal to start
4. Create the 5x5 grid with obstacles:
   \`\`\`
   Row 0: 0 0 0 0 0
   Row 1: 0 1 1 0 0
   Row 2: 0 0 1 0 0
   Row 3: 0 0 0 1 0
   Row 4: 0 0 0 0 0
   \`\`\`
5. Find the path from (0,0) to (4,4)
6. Output the path: \`ROBOT_MESSAGE|Path: (0,0)->(1,0)->...\`
7. Move the robot along the path, outputting position at each step
8. Output path length and \`MISSION_COMPLETE\`

### Expected Output Format
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|A* pathfinding initialized
ROBOT_MESSAGE|Exploring (0,0) f=8
...
ROBOT_MESSAGE|Goal found after exploring N nodes
ROBOT_MESSAGE|Path: (0,0)->...->( 4,4)
ROBOT|position|4|4|0
ROBOT_MESSAGE|Path length: N steps
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
#include <algorithm>
using namespace std;

const int GRID = 5;

struct Node {
    int x, y;
    double g, h, f;
    int parentX, parentY;
};

// TODO: Write heuristic function (Manhattan distance)
// double heuristic(int x1, int y1, int x2, int y2)

// TODO: Write isValid(int x, int y, vector<vector<int>>& grid)
//   Returns true if in bounds and not an obstacle

// TODO: Implement A* search
// vector<pair<int,int>> astar(vector<vector<int>>& grid, int sx, int sy, int gx, int gy)
//   Returns the path from start to goal as a vector of (x,y) pairs
//   Output ROBOT_MESSAGE for each node explored

int main() {
    // TODO: Create a 5x5 grid (0=free, 1=obstacle)
    // Grid layout:
    //   Row 0: 0 0 0 0 0
    //   Row 1: 0 1 1 0 0
    //   Row 2: 0 0 1 0 0
    //   Row 3: 0 0 0 1 0
    //   Row 4: 0 0 0 0 0

    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|A* pathfinding initialized" << endl;

    // TODO: Find path from (0,0) to (4,4)
    // TODO: Output the path: ROBOT_MESSAGE|Path: (0,0)->(1,0)->(...)
    // TODO: Move robot along path, outputting position at each step
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "astar-init",
      description: "A* initialized",
      expectedOutput: "ROBOT_MESSAGE\\|A\\* pathfinding initialized",
      isPattern: true,
    },
    {
      id: "exploring",
      description: "Nodes being explored",
      expectedOutput: "ROBOT_MESSAGE\\|Exploring \\(0,0\\)",
      isPattern: true,
    },
    {
      id: "goal-found",
      description: "Goal found",
      expectedOutput: "ROBOT_MESSAGE\\|Goal found after exploring",
      isPattern: true,
    },
    {
      id: "path-output",
      description: "Path output",
      expectedOutput: "ROBOT_MESSAGE\\|Path: \\(0,0\\)",
      isPattern: true,
    },
    {
      id: "path-end",
      description: "Path reaches goal (4,4)",
      expectedOutput: "ROBOT\\|position\\|4\\|4\\|0",
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
    "A* uses f = g + h where g is cost-so-far and h is heuristic (estimated cost to goal).",
    "Use Manhattan distance |dx|+|dy| as the heuristic for a grid with 4-directional movement.",
    "A priority queue (min-heap) always expands the node with lowest f value.",
    "Reconstruct the path by following parent pointers from goal back to start, then reverse.",
  ],

  accumulatedCode: solutionCode,
};
