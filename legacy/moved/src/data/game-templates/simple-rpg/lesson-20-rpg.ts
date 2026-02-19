import type { GameLessonVariant } from "@/types/game";

export const lesson20RPG: GameLessonVariant = {
  lessonId: "rpg-20-rooms",

  instructions: `# Room Transitions — Level Architecture

## Mental Model

Room is just data. An ID, a name, exit links. Stepping on an exit loads new data. That's level architecture. Zelda has rooms. Diablo has floors. Same pattern.

The exits array is a connection graph stored inline. Index 0 is north, 1 is south, 2 is east, 3 is west. A value of -1 means no exit. A non-negative value is the ID of the adjacent room. When the player crosses a threshold, the engine reads that value, loads the corresponding struct, resets player position to the entry edge, and re-renders. The world expands without the grid ever changing size.

## What Breaks Without This

A single flat grid is not a dungeon. It is a room. Without exit links and transition logic, exploration has no depth. The player walks to the edge and stops. The wall is the end of the world. Room data turns a wall into a door. The size of the world is no longer bounded by the grid — it is bounded by how many structs you have in the array.

## The Fix

\\\`\\\`\\\`cpp
struct Room {
    int id;
    string name;
    int enemies;
    int exits[4]; // N=0, S=1, E=2, W=3. -1=no exit
};

// Link rooms bidirectionally
rooms[0] = {0, "Entrance Hall", 1, {-1, -1, 1, -1}};
rooms[1] = {1, "Dark Chamber",  2, {-1, -1, -1, 0}};

// Transition trigger
if (playerX >= 18 && rooms[currentRoom].exits[2] != -1) {
    currentRoom = rooms[currentRoom].exits[2];
    playerX = 1; // entry edge of new room
    cout << "Entering: " << rooms[currentRoom].name << endl;
}
\\\`\\\`\\\`

The critical detail: reset playerX to 1 after loading. If you skip this, the trigger re-fires every frame and the player oscillates between rooms infinitely.

## Pattern Insight

Exit links are a graph. Each room is a node. Each non-negative exit value is a directed edge. A two-room dungeon is a two-node undirected graph. A 100-room Zelda dungeon is a planar graph where most edges are bidirectional. Procedural dungeon generation (Binding of Isaac, Enter the Gungeon) builds this graph algorithmically — place rooms, connect exits, validate connectivity. Your handcrafted two-room setup is a manually designed graph. The data structure is the same.

## Scalability Insight

Add a \\\`layout\\\` field to Room — an array of enemy starting positions, item placements, special tiles. Now each room is fully self-describing. The renderer reads the layout field to populate the grid. Enemy spawning reads from the layout. Save/load serializes the current room ID and the layout's state (which enemies are dead, which items are taken). The Room struct scales from two integers to a complete scene description without changing the transition logic.

## Your Task

Implement the full two-room sequence:

1. Room 0: "Entrance Hall" — player at (2,5), 1 enemy at (10,5), HP 20
2. Kill the enemy (2 attacks of 10 damage)
3. Walk player east to x=18, trigger transition to Room 1
4. Room 1: "Dark Chamber" — player resets to (1,5), 2 enemies at (5,3) and (14,6)
5. Render Room 1 grid with all entities
6. Output:
   - \\\`GAME_MESSAGE|New room discovered!\\\`
   - \\\`HUD|HP:100|ROOM:1|ENEMIES:2\\\`
   - \\\`SCORE|150\\\`

## Common Mistake (Beginner Trap)

Forgetting to reset playerX to the entry edge after a transition. The player is at x=18 when the trigger fires. Without \\\`playerX = 1\\\`, they appear on the east side of the new room — immediately adjacent to the opposite wall. On the next move east they would trigger another transition. Always place the player at the correct entry side.

## Elite Insight (Zelda, Diablo)

The Legend of Zelda's dungeon map in A Link to the Past is a 2D array of room structs. Each struct stores the room's tile layout, the enemies that spawn there, the items present, and the four exit flags. When Link walks off a screen edge, the engine reads the exit flag, identifies the adjacent room ID, loads that room's struct into the active buffer, and triggers the scroll animation. The exits[4] array you just wrote is exactly that flag structure. Diablo's floor system uses a similar approach with procedurally generated data in the struct rather than hand-authored. Your code is the hand-authored version of both systems.

## Pattern Recognition

Graph-based level architecture is the dominant pattern for connected world design. Text adventures had it in 1976. Zelda formalized it visually in 1986. Metroidvanias use it with unlock conditions on edges (the exit is locked until you have the item). Open world games use it at the macro level — areas connected by load zones. The Room struct with exits is the fundamental unit of all of them. You have implemented the core pattern.

## Skill Reinforcement

- Room struct: ID, name, enemy count, exits array
- Bidirectional linking: each room's exit points to the other's ID
- Transition trigger: position threshold reads exit field
- Entry reset: playerX snaps to the correct edge on room load
- HUD reads live room data: rooms[currentRoom].enemies

## Mastery Check

Why store enemy count in the Room struct rather than counting live entities? Because the struct describes the room's intended state — how many enemies it was designed with. Live entity count changes as enemies die. The HUD for "enemies in this room" uses the struct's count as the initial value, then tracks kills separately to show the current count. Keeping designed-state and live-state separate is the data-driven design principle.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Room {
    int id;
    string name;
    int enemies;
    int exits[4]; // N=0, S=1, E=2, W=3. -1=no exit
};

int main() {
    // Room setup
    // rooms[0]: "Entrance Hall", exits east to 1
    // rooms[1]: "Dark Chamber",  exits west to 0

    // Player: (2,5), HP 100
    // Enemy in Room 0: (10,5), HP 20, alive=true

    // === STEP 1: Kill enemy in Room 0 ===
    // 2 attacks of 10 damage each

    // === STEP 2: Walk east and trigger transition ===
    // playerX = 18, check exits[2], load new room, reset playerX=1

    // === STEP 3: Room 1 enemies: e1=(5,3), e2=(14,6) ===

    // === STEP 4: Render Room 1 grid ===
    // @ at (1,5), E at (5,3) and (14,6)

    // === STEP 5: Protocol output ===
    // GAME_MESSAGE|New room discovered!
    // HUD|HP:100|ROOM:1|ENEMIES:2
    // SCORE|150

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Room {
    int id;
    string name;
    int enemies;
    int exits[4]; // N=0, S=1, E=2, W=3. -1=no exit
};

int main() {
    Room rooms[2];
    rooms[0] = {0, "Entrance Hall", 1, {-1, -1, 1, -1}};
    rooms[1] = {1, "Dark Chamber",  2, {-1, -1, -1, 0}};

    int currentRoom = 0;

    // Player
    int playerX = 2, playerY = 5;
    int playerHP = 100;

    // Enemy in Room 0
    int e0x = 10, e0y = 5;
    int e0HP = 20;
    bool e0alive = true;

    // === STEP 1: Kill enemy in Room 0 ===
    int damage = 10;
    for (int i = 0; i < 2; i++) {
        e0HP -= damage;
        if (e0HP <= 0 && e0alive) {
            e0alive = false;
        }
    }

    // === STEP 2: Walk east and trigger transition ===
    playerX = 18;
    if (playerX >= 18 && rooms[currentRoom].exits[2] != -1) {
        currentRoom = rooms[currentRoom].exits[2];
        playerX = 1;
    }

    // === STEP 3: Room 1 enemies ===
    int e1x = 5,  e1y = 3;
    int e2x = 14, e2y = 6;

    // === STEP 4: Render Room 1 grid ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else if (col == e1x && row == e1y) {
                cout << 'E';
            } else if (col == e2x && row == e2y) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === STEP 5: Protocol output ===
    cout << "GAME_MESSAGE|New room discovered!" << endl;
    cout << "HUD|HP:" << playerHP << "|ROOM:" << currentRoom << "|ENEMIES:" << rooms[currentRoom].enemies << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Room 0 enemy is dead — E does not appear in the rendered grid",
      expectedOutput: "^(?!.*\\bE\\b).*$",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Player @ appears at column 1 after transition reset",
      expectedOutput: "#@",
      isPattern: true,
    },
    {
      id: "g3",
      description: "First Room 1 enemy E at (5,3) — 4 dots after left wall",
      expectedOutput: "#\\.{4}E",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Second Room 1 enemy E at (14,6) — 13 dots after left wall",
      expectedOutput: "#\\.{13}E",
      isPattern: true,
    },
    {
      id: "g5",
      description: "GAME_MESSAGE announces new room discovered",
      expectedOutput: "GAME_MESSAGE\\|New room discovered!",
      isPattern: true,
    },
    {
      id: "g6",
      description: "HUD shows HP 100, ROOM 1, and ENEMIES 2",
      expectedOutput: "HUD\\|HP:100\\|ROOM:1\\|ENEMIES:2",
      isPattern: true,
    },
  ],

  hints: [
    "Kill the Room 0 enemy with: \\\`for (int i = 0; i < 2; i++) { e0HP -= 10; if (e0HP <= 0 && e0alive) e0alive = false; }\\\`",
    "Transition: set playerX = 18, then check \\\`rooms[currentRoom].exits[2] != -1\\\`. If true, do \\\`currentRoom = rooms[currentRoom].exits[2]; playerX = 1;\\\`",
    "Room 1 enemies e1=(5,3) and e2=(14,6) are declared independently — they have nothing to do with the dead Room 0 enemy.",
    "HUD line pulls live data: \\\`currentRoom\\\` is 1 after the transition, \\\`rooms[currentRoom].enemies\\\` is 2 from the struct definition.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// PHASE 2 — ROOM SYSTEM
// Lesson 20: Room Transitions
// ==============================

// === ROOM DATA STRUCTURE ===
// id: unique room identifier
// name: display name for HUD/messages
// enemies: designed enemy count for this room
// exits[4]: N/S/E/W exit links. -1 = no exit, n = room ID to load
struct Room {
    int id;
    string name;
    int enemies;
    int exits[4];
};

int main() {
    // === ROOM GRAPH ===
    // Two rooms, bidirectionally linked east-west
    Room rooms[2];
    rooms[0] = {0, "Entrance Hall", 1, {-1, -1, 1, -1}};
    rooms[1] = {1, "Dark Chamber",  2, {-1, -1, -1, 0}};

    int currentRoom = 0;

    // === PLAYER STATE ===
    int playerX = 2, playerY = 5;
    int playerHP = 100;

    // === ROOM 0 ENEMY ===
    int e0x = 10, e0y = 5;
    int e0HP = 20;
    bool e0alive = true;

    // === COMBAT: Kill Room 0 enemy ===
    int damage = 10;
    for (int i = 0; i < 2; i++) {
        e0HP -= damage;
        if (e0HP <= 0 && e0alive) {
            e0alive = false;
        }
    }

    // === TRANSITION: East exit trigger ===
    // Player walks to x=18 (east threshold)
    // Reads exits[2] (east), loads new room ID
    // Resets playerX to entry edge of new room
    playerX = 18;
    if (playerX >= 18 && rooms[currentRoom].exits[2] != -1) {
        currentRoom = rooms[currentRoom].exits[2];
        playerX = 1;
    }

    // === ROOM 1 ENEMIES ===
    int e1x = 5,  e1y = 3;
    int e2x = 14, e2y = 6;

    // === GRID RENDER: Current room state ===
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9) {
                cout << '#';
            } else if (col == 0 || col == 19) {
                cout << '#';
            } else if (col == playerX && row == playerY) {
                cout << '@';
            } else if (col == e1x && row == e1y) {
                cout << 'E';
            } else if (col == e2x && row == e2y) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }

    // === PROTOCOL OUTPUT ===
    cout << "GAME_MESSAGE|New room discovered!" << endl;
    cout << "HUD|HP:" << playerHP << "|ROOM:" << currentRoom << "|ENEMIES:" << rooms[currentRoom].enemies << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,
};
