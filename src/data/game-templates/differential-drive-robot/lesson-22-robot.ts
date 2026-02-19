import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

const int GRID_SIZE = 5;
const int UNKNOWN = -1;
const int FREE = 0;
const int OBSTACLE = 1;

void discoverCell(vector<vector<int>>& grid, int cx, int cy, int value) {
    grid[cy][cx] = value;
    string type = (value == FREE) ? "FREE" : "OBSTACLE";
    cout << "ROBOT_MESSAGE|Discovered cell (" << cx << "," << cy << "): " << type << endl;
}

void printGrid(const vector<vector<int>>& grid) {
    cout << "ROBOT_MESSAGE|--- Occupancy Grid ---" << endl;
    for (int y = GRID_SIZE - 1; y >= 0; y--) {
        string row = "";
        for (int x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] == UNKNOWN) row += "? ";
            else if (grid[y][x] == FREE) row += ". ";
            else row += "# ";
        }
        cout << "ROBOT_MESSAGE|" << row << endl;
    }
}

int main() {
    // Initialize 5x5 grid as unknown
    vector<vector<int>> grid(GRID_SIZE, vector<int>(GRID_SIZE, UNKNOWN));

    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|SLAM mapping started" << endl;

    // Exploration data: {x, y, value}
    int cells[][3] = {
        {0,0,FREE}, {1,0,FREE}, {2,0,OBSTACLE},
        {0,1,FREE}, {1,1,FREE}, {2,1,FREE},
        {0,2,FREE}, {1,2,OBSTACLE}, {2,2,FREE}
    };

    for (int i = 0; i < 9; i++) {
        int cx = cells[i][0], cy = cells[i][1], val = cells[i][2];
        discoverCell(grid, cx, cy, val);

        if (val == FREE) {
            cout << "ROBOT|position|" << cx << "|" << cy << "|0" << endl;
        }
    }

    printGrid(grid);

    // Count explored cells
    int explored = 0;
    for (int y = 0; y < GRID_SIZE; y++) {
        for (int x = 0; x < GRID_SIZE; x++) {
            if (grid[y][x] != UNKNOWN) explored++;
        }
    }

    cout << "ROBOT_MESSAGE|Mapped " << explored << "/25 cells" << endl;
    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson22Robot: GameLessonVariant = {
  lessonId: "22-error-handling-v0",

  instructions: `# Robot Builder: Environment Mapper

Simulate SLAM (Simultaneous Localization and Mapping) by having a robot explore and map cells in a 5x5 occupancy grid. The robot discovers whether each cell is free or contains an obstacle.

## Robot Protocol

Your program communicates with the robot simulator via standard output:

\`\`\`
ROBOT|position|x|y|theta     // Report robot position and heading
ROBOT_MESSAGE|text            // Display a status message
MISSION_COMPLETE              // Signal mission success
\`\`\`

## Your Task

1. Define grid constants: \`GRID_SIZE=5\`, \`UNKNOWN=-1\`, \`FREE=0\`, \`OBSTACLE=1\`
2. Write a \`discoverCell(grid, cx, cy, value)\` function that:
   - Sets \`grid[cy][cx] = value\`
   - Outputs: \`ROBOT_MESSAGE|Discovered cell (cx,cy): FREE\` or \`OBSTACLE\`
3. Write a \`printGrid(grid)\` function that:
   - Outputs the grid as \`ROBOT_MESSAGE|\` lines (top-to-bottom: y=4 down to y=0)
   - Uses \`?\` for UNKNOWN, \`.\` for FREE, \`#\` for OBSTACLE
4. Create a 5x5 grid initialized to UNKNOWN (-1)
5. Simulate exploration by discovering these cells:
   - (0,0)=FREE, (1,0)=FREE, (2,0)=OBSTACLE
   - (0,1)=FREE, (1,1)=FREE, (2,1)=FREE
   - (0,2)=FREE, (1,2)=OBSTACLE, (2,2)=FREE
6. Move the robot to each FREE cell discovered, outputting its position
7. Print the occupancy grid
8. Count explored cells and output: \`ROBOT_MESSAGE|Mapped X/25 cells\`
9. Output \`MISSION_COMPLETE\`

### Expected Output Format
\`\`\`
ROBOT|position|0|0|0
ROBOT_MESSAGE|SLAM mapping started
ROBOT_MESSAGE|Discovered cell (0,0): FREE
...
ROBOT_MESSAGE|--- Occupancy Grid ---
ROBOT_MESSAGE|? ? ? ? ?
...
ROBOT_MESSAGE|Mapped 9/25 cells
MISSION_COMPLETE
\`\`\`
`,

  starterCode: `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

const int GRID_SIZE = 5;
const int UNKNOWN = -1;
const int FREE = 0;
const int OBSTACLE = 1;

// TODO: Define a struct Cell with: int x, y, value

// TODO: Write a function discoverCell(vector<vector<int>>& grid, int cx, int cy, int value)
//   Sets grid[cy][cx] = value
//   Outputs: ROBOT_MESSAGE|Discovered cell (cx,cy): FREE or OBSTACLE

// TODO: Write a function printGrid(const vector<vector<int>>& grid)
//   Outputs the grid as ROBOT_MESSAGE lines
//   Use ? for UNKNOWN, . for FREE, # for OBSTACLE

int main() {
    // TODO: Create a 5x5 grid initialized to UNKNOWN (-1)

    // TODO: Robot starts at (0,0) — mark as FREE
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|SLAM mapping started" << endl;

    // TODO: Simulate exploration — discover these cells:
    //   (0,0)=FREE, (1,0)=FREE, (2,0)=OBSTACLE
    //   (0,1)=FREE, (1,1)=FREE, (2,1)=FREE
    //   (0,2)=FREE, (1,2)=OBSTACLE, (2,2)=FREE

    // TODO: Move robot to each discovered cell, output position
    // TODO: Print the grid
    // TODO: Count explored cells, output: ROBOT_MESSAGE|Mapped X/25 cells
    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "slam-started",
      description: "SLAM mapping started",
      expectedOutput: "ROBOT_MESSAGE\\|SLAM mapping started",
      isPattern: true,
    },
    {
      id: "cell-free",
      description: "Free cell discovered",
      expectedOutput: "ROBOT_MESSAGE\\|Discovered cell \\(0,0\\): FREE",
      isPattern: true,
    },
    {
      id: "cell-obstacle",
      description: "Obstacle cell discovered",
      expectedOutput: "ROBOT_MESSAGE\\|Discovered cell \\(2,0\\): OBSTACLE",
      isPattern: true,
    },
    {
      id: "grid-output",
      description: "Occupancy grid displayed",
      expectedOutput: "ROBOT_MESSAGE\\|--- Occupancy Grid ---",
      isPattern: true,
    },
    {
      id: "mapped-count",
      description: "Mapped cell count",
      expectedOutput: "ROBOT_MESSAGE\\|Mapped 9/25 cells",
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
    "An occupancy grid maps the environment: -1=unknown, 0=free, 1=obstacle.",
    "Use vector<vector<int>> grid(5, vector<int>(5, -1)) to create a 5x5 grid of unknowns.",
    "The robot can only move to FREE cells, not OBSTACLE cells.",
    "Print the grid from top to bottom (y=4 down to y=0) for correct visual orientation.",
  ],

  accumulatedCode: solutionCode,
};
