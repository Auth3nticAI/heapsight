import type { Lesson } from "@/types/lesson";

export const lesson49: Lesson = {
  id: "49-camera-screen-space",
  title: "Camera and Screen Space",
  description: "Implement a viewport camera that follows the player in world space.",
  order: 49,
  xpReward: 175,
  tier: "pro",
  concepts: ["world space", "screen space", "camera offset", "viewport", "coordinate transform"],
  part1: {
    title: "Concept: Coordinate Transforms",
    type: "concept",
    instructions: `# Coordinate Transforms — World Is Not Screen

Your game world is large. Your screen is small. A world 1000 units wide cannot fit on a 20-character terminal. You need a camera. The camera defines what slice of the world is visible. Every entity has a world position. The camera transforms that into a screen position. Without this transform, your renderer does not know where to draw.

## What Breaks Without This

Without coordinate transforms, entities at world position (500, 300) get drawn at screen pixel 500. That is off-screen on a 20-column display. Or you constrain your entire game world to screen dimensions, which means no scrolling, no large levels, no exploration. Every entity is trapped in a tiny box.

## The Fix

Two coordinate spaces. World space: where entities actually are (0-1000). Screen space: where they appear on screen (0-20). The camera has a position in world space. To transform: \\\`screenX = (worldX - cameraX) * screenWidth / viewWidth\\\`. If an entity is at world(500) and the camera is at world(400) with a view width of 200 and screen width of 20, screenX = (500-400) * 20 / 200 = 10. Column 10 on screen.

Entities outside the camera view get clipped. If screenX < 0 or screenX >= screenWidth, do not draw. This is frustum culling in 2D — skip anything the player cannot see.

## Your Task

1. Define world size: 1000 x 800
2. Define screen size: 20 columns x 10 rows
3. Define view size: 200 x 100 (the world-space area visible through the camera)
4. Camera position: (400, 350)
5. Create 4 entities at world positions: (420, 360), (500, 380), (350, 340), (700, 400)
6. Write \\\`worldToScreenX(wx, camX, viewW, screenW)\\\` — returns (wx - camX) * screenW / viewW
7. Write \\\`worldToScreenY(wy, camY, viewH, screenH)\\\` — returns (wy - camY) * screenH / viewH
8. Transform each entity, check if on screen (0 <= sx < 20, 0 <= sy < 10)
9. Print visible: \\\`VISIBLE|entity_<i>|world|<wx>,<wy>|screen|<sx>,<sy>\\\`
10. Print clipped: \\\`CLIPPED|entity_<i>|world|<wx>,<wy>|screen|<sx>,<sy>\\\`
11. Print: \\\`CAMERA|pos|400,350|view|200x100|screen|20x10\\\`
12. Print: \\\`TRANSFORM_SUMMARY|visible|<n>|clipped|<n>|total|4\\\`

Expected output:
\\\`\\\`\\\`
VISIBLE|entity_0|world|420,360|screen|2,1
VISIBLE|entity_1|world|500,380|screen|10,3
CLIPPED|entity_2|world|350,340|screen|-5,-1
CLIPPED|entity_3|world|700,400|screen|30,5
CAMERA|pos|400,350|view|200x100|screen|20x10
TRANSFORM_SUMMARY|visible|2|clipped|2|total|4
\\\`\\\`\\\`

Entity 2 at world(350) is left of camera(400), so screenX is negative. Entity 3 at world(700) is far right of camera(400)+view(200), so screenX=30 which exceeds screen width 20.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write worldToScreenX(wx, camX, viewW, screenW)
//       returns (wx - camX) * screenW / viewW

// TODO: Write worldToScreenY(wy, camY, viewH, screenH)
//       returns (wy - camY) * screenH / viewH

int main() {
    const int SCREEN_W = 20;
    const int SCREEN_H = 10;
    const int VIEW_W = 200;
    const int VIEW_H = 100;
    int camX = 400;
    int camY = 350;

    int wx[] = {420, 500, 350, 700};
    int wy[] = {360, 380, 340, 400};
    int entityCount = 4;

    int visible = 0;
    int clipped = 0;

    // TODO: For each entity, compute screen position
    //   If 0 <= sx < SCREEN_W and 0 <= sy < SCREEN_H: print VISIBLE
    //   Otherwise: print CLIPPED
    //   Track visible and clipped counts

    // TODO: Print CAMERA line
    // TODO: Print TRANSFORM_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int worldToScreenX(int wx, int camX, int viewW, int screenW) {
    return (wx - camX) * screenW / viewW;
}

int worldToScreenY(int wy, int camY, int viewH, int screenH) {
    return (wy - camY) * screenH / viewH;
}

int main() {
    const int SCREEN_W = 20;
    const int SCREEN_H = 10;
    const int VIEW_W = 200;
    const int VIEW_H = 100;
    int camX = 400;
    int camY = 350;

    int wx[] = {420, 500, 350, 700};
    int wy[] = {360, 380, 340, 400};
    int entityCount = 4;

    int visible = 0;
    int clipped = 0;

    for (int i = 0; i < entityCount; i++) {
        int sx = worldToScreenX(wx[i], camX, VIEW_W, SCREEN_W);
        int sy = worldToScreenY(wy[i], camY, VIEW_H, SCREEN_H);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            cout << "VISIBLE|entity_" << i << "|world|" << wx[i] << "," << wy[i]
                 << "|screen|" << sx << "," << sy << endl;
            visible++;
        } else {
            cout << "CLIPPED|entity_" << i << "|world|" << wx[i] << "," << wy[i]
                 << "|screen|" << sx << "," << sy << endl;
            clipped++;
        }
    }

    cout << "CAMERA|pos|" << camX << "," << camY
         << "|view|" << VIEW_W << "x" << VIEW_H
         << "|screen|" << SCREEN_W << "x" << SCREEN_H << endl;
    cout << "TRANSFORM_SUMMARY|visible|" << visible
         << "|clipped|" << clipped << "|total|" << entityCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Entity 0 is visible at screen (2,1)", expectedOutput: "VISIBLE|entity_0|world|420,360|screen|2,1" },
      { id: "t2", description: "Entity 1 is visible at screen (10,3)", expectedOutput: "VISIBLE|entity_1|world|500,380|screen|10,3" },
      { id: "t3", description: "Entity 2 is clipped (off-screen left)", expectedOutput: "CLIPPED|entity_2|world|350,340|screen|-5,-1" },
      { id: "t4", description: "Entity 3 is clipped (off-screen right)", expectedOutput: "CLIPPED|entity_3|world|700,400|screen|30,5" },
      { id: "t5", description: "Summary shows 2 visible, 2 clipped", expectedOutput: "TRANSFORM_SUMMARY|visible|2|clipped|2|total|4" },
    ],
    hints: [
      "The formula is integer division: `(wx - camX) * screenW / viewW`. For entity 0: (420 - 400) * 20 / 200 = 20 * 20 / 200 = 400 / 200 = 2.",
      "An entity is visible if screenX is in [0, SCREEN_W) AND screenY is in [0, SCREEN_H). Negative or >= bounds means clipped.",
      "Entity 2 at world(350): screenX = (350-400)*20/200 = -50*20/200 = -1000/200 = -5. Negative means off the left side of the screen.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Camera and Viewport System",
    type: "game_builder",
    instructions: `# Game Builder: Camera and Viewport System

Build a camera that follows the player through world space and renders only visible entities to a screen grid. The camera is a viewport — a window into the world. Entities outside the viewport do not get drawn. This is the foundation of scrolling in every 2D game.

## Your Task
1. World space: 400 x 600
2. Screen grid: 20 columns x 10 rows
3. View dimensions: VIEW_W = 200, VIEW_H = 100
4. Camera follows player: camX = playerX - SCREEN_W/2, camY = playerY - SCREEN_H/2
   (but in world-to-view terms: camX = playerX - VIEW_W/2, camY = playerY - VIEW_H/2)
5. Place player at world (180, 300)
6. Place 5 entities in world:
   - enemy_0: (100, 260), enemy_1: (250, 310), enemy_2: (180, 280)
   - enemy_3: (50, 200), enemy_4: (350, 350)
7. Camera centers on player: camX = 180 - 100 = 80, camY = 300 - 50 = 250
8. worldToScreen: sx = (wx - camX) * SCREEN_W / VIEW_W, sy = (wy - camY) * SCREEN_H / VIEW_H
9. Render: print \\\`CAMERA|pos|<cx>,<cy>|view|20x10\\\`
10. For each entity, transform and print:
    \\\`WORLD_TO_SCREEN|<name>|world|<wx>,<wy>|screen|<sx>,<sy>\\\`
11. Build a 10x20 char grid (rows x cols), fill with \\\`.\\\`, place visible entities as digits and player as \\\`P\\\`
12. Print the grid (10 rows of 20 chars)
13. Print: \\\`VIEWPORT|visible|<n>|clipped|<n>|total|5\\\`

## Beginner Trap

**Common Mistake:** Confusing view dimensions with screen dimensions. VIEW_W/VIEW_H are in world units (how much of the world the camera sees). SCREEN_W/SCREEN_H are in characters (how many columns and rows you render). The ratio between them is the scale factor.

## Elite Insight

Camera systems in production engines support multiple coordinate spaces: world, camera-local, screen, and NDC (normalized device coordinates). Each transform is a matrix multiply. In 2D, it collapses to the offset-and-scale formula you are implementing. But understanding that this is a simplified affine transform prepares you for 3D projection matrices.

## Cross-Path Echo

Window managers do the same coordinate transform. An application window at desktop position (500, 300) contains a button at window-local position (50, 20). The OS computes desktop position of the button: (550, 320). Every GUI framework implements worldToScreen under a different name.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

// TODO: Write worldToScreenX(wx, camX)
//       returns (wx - camX) * SCREEN_W / VIEW_W

// TODO: Write worldToScreenY(wy, camY)
//       returns (wy - camY) * SCREEN_H / VIEW_H

int main() {
    int playerX = 180;
    int playerY = 300;

    // TODO: Compute camera position centered on player
    //       camX = playerX - VIEW_W / 2
    //       camY = playerY - VIEW_H / 2

    // Enemy world positions
    int ewx[] = {100, 250, 180, 50, 350};
    int ewy[] = {260, 310, 280, 200, 350};
    string enames[] = {"enemy_0", "enemy_1", "enemy_2", "enemy_3", "enemy_4"};
    int enemyCount = 5;

    // TODO: Print CAMERA line
    // TODO: Transform each enemy to screen space, print WORLD_TO_SCREEN
    // TODO: Build 10x20 grid, place visible entities, print grid
    // TODO: Print VIEWPORT summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

int main() {
    int playerX = 180;
    int playerY = 300;

    int camX = playerX - VIEW_W / 2;
    int camY = playerY - VIEW_H / 2;

    int ewx[] = {100, 250, 180, 50, 350};
    int ewy[] = {260, 310, 280, 200, 350};
    string enames[] = {"enemy_0", "enemy_1", "enemy_2", "enemy_3", "enemy_4"};
    int enemyCount = 5;

    cout << "CAMERA|pos|" << camX << "," << camY << "|view|20x10" << endl;

    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    int visible = 0;
    int clipped = 0;

    for (int i = 0; i < enemyCount; i++) {
        int sx = worldToScreenX(ewx[i], camX);
        int sy = worldToScreenY(ewy[i], camY);
        cout << "WORLD_TO_SCREEN|" << enames[i] << "|world|" << ewx[i] << "," << ewy[i]
             << "|screen|" << sx << "," << sy << endl;
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            grid[sy][sx] = '0' + i;
            visible++;
        } else {
            clipped++;
        }
    }

    int psx = worldToScreenX(playerX, camX);
    int psy = worldToScreenY(playerY, camY);
    if (psx >= 0 && psx < SCREEN_W && psy >= 0 && psy < SCREEN_H) {
        grid[psy][psx] = 'P';
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) {
            cout << grid[r][c];
        }
        cout << endl;
    }

    cout << "VIEWPORT|visible|" << visible << "|clipped|" << clipped
         << "|total|" << enemyCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Camera positioned correctly", expectedOutput: "CAMERA\\|pos\\|80,250\\|view\\|20x10", isPattern: true },
      { id: "t2", description: "Enemy 0 world-to-screen transform", expectedOutput: "WORLD_TO_SCREEN\\|enemy_0\\|world\\|100,260\\|screen\\|\\d+,\\d+", isPattern: true },
      { id: "t3", description: "Grid output contains player P", expectedOutput: "P", isPattern: true },
      { id: "t4", description: "Grid output contains dots for empty cells", expectedOutput: "\\.\\.\\.\\.", isPattern: true },
      { id: "t5", description: "Viewport summary with visible and clipped counts", expectedOutput: "VIEWPORT\\|visible\\|\\d+\\|clipped\\|\\d+\\|total\\|5", isPattern: true },
    ],
    hints: [
      "Camera centers on player: camX = 180 - 200/2 = 80, camY = 300 - 100/2 = 250. This means world x=80 maps to screen column 0.",
      "For enemy_0 at world(100,260): sx = (100-80)*20/200 = 20*20/200 = 2. sy = (260-250)*10/100 = 10*10/100 = 1. Screen position (2,1).",
      "Build the grid as grid[row][col]. Row is the y-axis, column is the x-axis. Place entities with grid[sy][sx]. Print row by row.",
    ],
    estimatedMinutes: 10,
  },
};
