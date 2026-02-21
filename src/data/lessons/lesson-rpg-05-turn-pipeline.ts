import { Lesson } from "@/types/lesson";

export const lessonRPG05: Lesson = {
  id: "rpg-05-turn-pipeline",
  title: "Turn Pipeline v0",
  description: "Refactor the game loop into explicit named phases: INPUT, RESOLVE, CLEANUP, RENDER. Each phase is a function.",
  order: 5,
  xpReward: 50,
  tier: "free",
  concepts: ["pipeline architecture", "named phases", "turn counting", "function decomposition"],
  part1: {
    title: "Concept: Named Pipeline Phases",
    type: "concept",
    instructions: `# Turn Pipeline v0

## Mental Model
Your game loop currently has inline code: read input, resolve command, draw. That works, but it's implicit — you have to read the code to know the order. A pipeline makes the phases explicit: \`phaseInput()\` → \`phaseResolve()\` → \`phaseCleanup()\` → RENDER. Each phase is a named function. The game loop becomes a sequence of function calls.

## What Breaks Without This
Without named phases, adding a new system (combat, AI, inventory) means adding code in the middle of the game loop. Where does AI go? Before or after collision? The pipeline makes the answer obvious: add a phase. Combat goes after RESOLVE. AI goes in its own phase. The pipeline IS the architecture.

## The Fix: Phase Functions
\`\`\`cpp
void phaseInput() {
    pending_intent = INTENT_NONE;
    // read WASD...
}
void phaseResolve() {
    resolveCommand();
}
void phaseCleanup() {
    turn_count++;
}
\`\`\`

The game loop becomes:
\`\`\`cpp
phaseInput();
if (pending_intent != INTENT_NONE) {
    phaseResolve();
    phaseCleanup();
}
// render...
\`\`\`

The resolve and cleanup phases only run when the player acts. No input = no turn = no state change. This is the foundation of a turn-based system.

## Key Concepts
- Each phase is a named function with a single responsibility
- Phases run in strict order: INPUT → RESOLVE → CLEANUP → RENDER
- \`turn_count\` increments only when the player acts
- \`phaseCleanup()\` is an empty slot now — future lessons will add dead entity removal, effect decay, etc.

## Beginner Trap
**Putting render code inside a phase function.** Rendering is NOT a phase — it's a separate concern. Phases mutate game state. Rendering reads game state. If you render inside phaseResolve(), you draw mid-state-change. Keep phases (state mutation) and rendering (state reading) strictly separated.

## Elite Insight
Dwarf Fortress processes each game tick as: read player input, resolve commands, simulate world (water flow, pathfinding, AI), cleanup (remove dead entities), then render. Your four phases are the same pipeline — simplified. As your RPG grows, you'll add more phases between RESOLVE and CLEANUP.

## Systems Thinking Connection
This pipeline architecture mirrors ROS2's executor model: sensor callbacks fire (INPUT), planners compute (RESOLVE), controllers apply (CLEANUP), and the visualization updates (RENDER). Named phases make the execution order explicit and debuggable.

## Your Task
Refactor the code into named phase functions. Add \`turn_count\`. Simulate one turn (MOVE_RIGHT) using the pipeline and print phase markers.

Expected output:
\`\`\`
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
=== INPUT ===
Intent: MOVE_RIGHT
=== RESOLVE ===
Resolve: MOVE_RIGHT -> (6, 5)
=== CLEANUP ===
Turn: 1
Player: (6, 5)
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;
int turn_count = 0;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        default: return "NONE";
    }
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        cout << "Resolve: " << intentName(pending_intent) << " -> BLOCKED (bounds)" << endl;
    } else if (tiles[new_y][new_x] == 1) {
        cout << "Resolve: " << intentName(pending_intent) << " -> BLOCKED (wall)" << endl;
    } else {
        cout << "Resolve: " << intentName(pending_intent) << " -> (" << new_x << ", " << new_y << ")" << endl;
        player_x = new_x;
        player_y = new_y;
    }
    pending_intent = INTENT_NONE;
}

// TODO: Write phaseResolve() — calls resolveCommand()

// TODO: Write phaseCleanup() — increments turn_count

int main() {
    initTiles();

    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;

    // Simulate one turn: MOVE_RIGHT
    cout << "=== INPUT ===" << endl;
    pending_intent = INTENT_RIGHT;
    cout << "Intent: " << intentName(pending_intent) << endl;

    cout << "=== RESOLVE ===" << endl;
    // TODO: Call phaseResolve()

    cout << "=== CLEANUP ===" << endl;
    // TODO: Call phaseCleanup()

    cout << "Turn: " << turn_count << endl;
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;
int turn_count = 0;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        default: return "NONE";
    }
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        cout << "Resolve: " << intentName(pending_intent) << " -> BLOCKED (bounds)" << endl;
    } else if (tiles[new_y][new_x] == 1) {
        cout << "Resolve: " << intentName(pending_intent) << " -> BLOCKED (wall)" << endl;
    } else {
        cout << "Resolve: " << intentName(pending_intent) << " -> (" << new_x << ", " << new_y << ")" << endl;
        player_x = new_x;
        player_y = new_y;
    }
    pending_intent = INTENT_NONE;
}

void phaseResolve() {
    resolveCommand();
}

void phaseCleanup() {
    turn_count++;
}

int main() {
    initTiles();

    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;

    // Simulate one turn: MOVE_RIGHT
    cout << "=== INPUT ===" << endl;
    pending_intent = INTENT_RIGHT;
    cout << "Intent: " << intentName(pending_intent) << endl;

    cout << "=== RESOLVE ===" << endl;
    phaseResolve();

    cout << "=== CLEANUP ===" << endl;
    phaseCleanup();

    cout << "Turn: " << turn_count << endl;
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints pipeline order", expectedOutput: "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER", isPattern: false },
      { id: "t2", description: "INPUT phase marker", expectedOutput: "=== INPUT ===", isPattern: false },
      { id: "t3", description: "RESOLVE phase marker", expectedOutput: "=== RESOLVE ===", isPattern: false },
      { id: "t4", description: "Turn incremented", expectedOutput: "Turn: 1", isPattern: false },
      { id: "t5", description: "Player moved to (6, 5)", expectedOutput: "Player: (6, 5)", isPattern: false },
    ],
    hints: [
      "phaseResolve() is a one-liner: just call resolveCommand().",
      "phaseCleanup() increments turn_count by 1.",
      "Call phaseResolve() after the === RESOLVE === marker, and phaseCleanup() after the === CLEANUP === marker.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Turn Pipeline v0",
    type: "game_builder",
    instructions: `# Build: Turn Pipeline v0

## Mental Model
Your game loop has inline input reading, command resolution, and rendering. Now refactor into named phase functions: \`phaseInput()\`, \`phaseResolve()\`, \`phaseCleanup()\`. The game loop becomes a clean sequence of function calls. Add \`turn_count\` to track how many turns the player has taken, displayed on the HUD.

## What Breaks Without This
Without named phases, the game loop grows into a monolith. Adding combat means weaving code between input reading and rendering. Adding AI means inserting code in the middle of collision checks. The pipeline structure prevents this — each system gets its own phase, called in strict order.

## The Fix: Extract Phase Functions
Move existing inline code into named functions:
- \`phaseInput()\`: reset intent, read WASD
- \`phaseResolve()\`: call resolveCommand()
- \`phaseCleanup()\`: increment turn_count

The game loop becomes:
\`\`\`cpp
phaseInput();
if (pending_intent != INTENT_NONE) {
    phaseResolve();
    phaseCleanup();
}
\`\`\`

Resolve and cleanup only run when the player acts. No input = no turn.

## Key Concepts
- Phase functions extract existing code, not add new logic
- Turn count only increments on player action
- Render code stays inline (it reads state, doesn't mutate it)
- HUD now shows Turn count alongside Player position and Intent

## Your Task
Create the three phase functions. Refactor the game loop to use them. Add turn_count and display it on the HUD.

Expected cout output:
\`\`\`
Player: (5, 5)
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
\`\`\`

## Beginner Trap
**Moving BeginDrawing/EndDrawing into a phase function.** Rendering is NOT a phase — it's a separate concern. Phases mutate state (input → resolve → cleanup). Rendering reads state. Keep them separate so you can later skip rendering for headless testing or fast-forward simulation.

## Elite Insight
This pipeline pattern is how AAA game engines organize their main loops. Unreal Engine 5 has: PlayerInput() → Tick() (physics, AI, gameplay) → PostUpdateWork() (cleanup) → Render(). Your four phases follow the same architecture. As the RPG grows, you'll insert new phases between RESOLVE and CLEANUP for combat, AI, and world simulation.

## Mastery Check
Question: Why do phaseResolve() and phaseCleanup() only run when pending_intent is not NONE?
Answer: This is a turn-based RPG. No input means no turn. If resolve ran every frame regardless, turn_count would increment 60 times per second even when idle. Gating on intent makes it a true turn-based system.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;
int turn_count = 0;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        default: return "NONE";
    }
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE;
        return;
    }
    if (tiles[new_y][new_x] == 1) {
        pending_intent = INTENT_NONE;
        return;
    }

    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
}

// TODO: Write phaseInput()
// Reset pending_intent to INTENT_NONE
// Read WASD using IsKeyPressed, set pending_intent

// TODO: Write phaseResolve()
// Call resolveCommand()

// TODO: Write phaseCleanup()
// Increment turn_count

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;

    while (!WindowShouldClose()) {
        // TODO: Call phaseInput()
        // TODO: If pending_intent != INTENT_NONE, call phaseResolve() then phaseCleanup()

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", player_x, player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;
int turn_count = 0;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        default: return "NONE";
    }
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE;
        return;
    }
    if (tiles[new_y][new_x] == 1) {
        pending_intent = INTENT_NONE;
        return;
    }

    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
}

void phaseInput() {
    pending_intent = INTENT_NONE;
    if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
    else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
    else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
    else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;
}

void phaseResolve() {
    resolveCommand();
}

void phaseCleanup() {
    turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
            phaseResolve();
            phaseCleanup();
        }

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", player_x, player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints pipeline order", expectedOutput: "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER", isPattern: false },
      { id: "g3", description: "Prints initial turn", expectedOutput: "Turn: 0", isPattern: false },
    ],
    hints: [
      "phaseInput() moves the WASD reading code into a function. Reset pending_intent = INTENT_NONE first, then check IsKeyPressed.",
      "phaseResolve() is a one-liner: call resolveCommand(). phaseCleanup() increments turn_count.",
      "In the game loop: call phaseInput() every frame. Only call phaseResolve() and phaseCleanup() when pending_intent != INTENT_NONE.",
    ],
    estimatedMinutes: 12
  }
};
