import type { Lesson } from "@/types/lesson";

export const lessonShooter16: Lesson = {
  id: "shooter-16-professional-split",
  title: "The Professional Split",
  description: "Split your growing codebase into header and source files \u2014 the same pattern every professional C++ project uses to manage complexity.",
  order: 16,
  xpReward: 100,
  tier: "pro",
  concepts: ["header files", "#pragma once", "forward declarations", "translation units", "multi-file projects"],
  part1: {
    title: "Concept: Headers vs Source Files",
    type: "concept",
    instructions: `# The Professional Split

## Mental Model
Your shooter is 80+ lines in one file. Professional C++ projects have hundreds of files. How do they avoid chaos? They split every concern into two files: a **header** (.h) that declares WHAT exists, and a **source** (.cpp) that defines HOW it works. Think of a header as a menu and the source as the kitchen.

## What Breaks Without This
As your program grows, compilation slows to a crawl. Change one function and the compiler rebuilds everything. Circular dependencies crash the build. Two files that both define the same struct cause \"multiple definition\" errors. Headers solve all of this.

## The Fix: Header/Source Split
**Header file (hs_world.h):**
\`\`\`cpp
#pragma once          // prevents double-include
#include \"raylib.h\"   // types we need (Color, etc.)

struct World {
    float ship_x, ship_y;
    int score;
};

void spawnWave(World& w);   // declaration only \u2014 no body
\`\`\`

**Source file (hs_world.cpp):**
\`\`\`cpp
#include \"hs_world.h\"

void spawnWave(World& w) {  // definition \u2014 the actual code
    // implementation here
}
\`\`\`

**Main file (main.cpp):**
\`\`\`cpp
#include \"hs_world.h\"       // now main.cpp knows about World
                             // but doesn't see the implementation
\`\`\`

## Key Concepts
- \`#pragma once\` \u2014 tells the compiler \"only include this file once per translation unit\"
- **Declaration** \u2014 tells the compiler a function EXISTS (signature only, no body)
- **Definition** \u2014 provides the actual implementation (the body with { })
- Each .cpp file is a separate **translation unit** \u2014 compiled independently, then linked

## Performance Insight
Headers don't add runtime cost. Zero. They're a compile-time organizing tool. The linker combines all .cpp files into one binary. Same performance as a single-file program, but 10x easier to maintain.

## Memory Insight
No extra memory. The split is purely organizational. One binary, same layout, same performance. The header tells the compiler what shapes to expect; the source fills them in.

## Your Task
Model the split conceptually. Declare a World struct with ship_x and score, then implement an initWorld function and print the split info.

Expected output:
\`\`\`
Files: 2
Guard: pragma once
Pattern: declaration/definition split
\`\`\`

## Beginner Trap
Don't put function DEFINITIONS in headers. If two .cpp files include a header with a function body, the linker sees two copies and throws a \"multiple definition\" error. Headers declare. Sources define.

## Elite Insight
Google's C++ style guide mandates: every .cc file has a matching .h file. The Linux kernel uses the same pattern (though with .c files). Unreal Engine has 40,000+ header files. This isn't optional at scale \u2014 it's survival.

## Systems Thinking Connection
Platformer Lesson 16 splits player logic the same way. RPG Lesson 16 splits the command queue. Same pattern, different domain. Learn it once, use it everywhere.

## Skill Reinforcement
Built on: L15 SoA data layout \u2014 the data structures you'll split into headers.
Feeds into: L31+ module split \u2014 each system gets its own header/source pair.

## Mastery Check
*Question:* You put \`void spawnWave(World& w) { ... }\` in a header. Two .cpp files include it. What error?
*Answer:* \"multiple definition of spawnWave\" \u2014 the linker sees two identical function bodies. Move the body to a .cpp file, keep only the declaration in the header.`,
    starterCode: `#include <iostream>
using namespace std;

// Simulating a header/source split in a single file
// \"HEADER\" section \u2014 declarations
struct World {
    float ship_x;
    int score;
};

void initWorld(World& w);  // declaration only

// \"SOURCE\" section \u2014 definitions
// TODO 1: Define initWorld: void initWorld(World& w) { w.ship_x = 200; w.score = 0; }

int main() {
    World w;
    // TODO 2: Call initWorld(w);
    // TODO 3: cout << \"Files: 2\" << endl;
    // TODO 4: cout << \"Guard: pragma once\" << endl;
    // TODO 5: cout << \"Pattern: declaration/definition split\" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct World {
    float ship_x;
    int score;
};

void initWorld(World& w);

void initWorld(World& w) {
    w.ship_x = 200;
    w.score = 0;
}

int main() {
    World w;
    initWorld(w);
    cout << \"Files: 2\" << endl;
    cout << \"Guard: pragma once\" << endl;
    cout << \"Pattern: declaration/definition split\" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Reports file count", expectedOutput: "Files: 2" },
      { id: "t2", description: "Reports header guard type", expectedOutput: "Guard: pragma once" },
      { id: "t3", description: "Confirms split pattern", expectedOutput: "Pattern: declaration/definition split" },
    ],
    hints: [
      "initWorld needs a body: void initWorld(World& w) { w.ship_x = 200; w.score = 0; } \u2014 put it below the declaration.",
      "Call initWorld(w) in main before the cout lines. The function initializes the World struct.",
      "Three cout lines \u2014 Files: 2, Guard: pragma once, Pattern: declaration/definition split. Copy them exactly.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: The Professional Split",
    type: "game_builder",
    instructions: `# Build: The Professional Split

## Mental Model
Your shooter lives in one big file. Time to go professional. You'll split the World struct and its helper functions into a proper header/source pair, just like every C++ project with more than 500 lines.

## What's Already Here
Three files are open in your editor tabs:

**hs_world.h** \u2014 The header. Contains \`#pragma once\`, all constants, the World struct, and function declarations. This file is COMPLETE \u2014 don't change it.

**hs_world.cpp** \u2014 The source. Has \`#include \"hs_world.h\"\` at the top. Function STUBS are here with TODOs. Your job: fill in the bodies.

**main.cpp** \u2014 The game loop. Includes \`hs_world.h\` and uses the functions you'll implement. This file is COMPLETE \u2014 don't change it.

## Your Task
Work in **hs_world.cpp** only. Implement three functions:

**TODO 1** \u2014 \`findFreeSlot\`: Loop through the active array, return the first index where \`active[i]\` is false. Return INVALID_ID if none found.

**TODO 2** \u2014 \`spawnEnemy\`: Call findFreeSlot for enemy_active. If valid, set x, y, speed, color, and active=true. Return the id.

**TODO 3** \u2014 \`spawnWave\`: Create a Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE}. Loop MAX_ENEMIES times, spawning each enemy at (80 + i*130, 30) with speed 18.0f + i*6.0f.

## Did It Work?
Click Run. You should see the same fixed-timestep shooter as before \u2014 colored enemies falling, ship moves, bullets fire. The HUD shows \"Split: hs_world\" in sky blue. The console prints accumulator confirmation.

The game is IDENTICAL. What changed is the architecture \u2014 World and its helpers now live in their own translation unit, ready for the module splits coming in Lessons 31+.`,
    starterCode: {
      "hs_world.h": `#pragma once
#include \"raylib.h\"

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

EntityId findFreeSlot(bool active[], int max);
EntityId spawnEnemy(World& w, float x, float y, float speed, Color c);
void spawnWave(World& w);`,
      "hs_world.cpp": `#include \"hs_world.h\"

// TODO 1: Implement findFreeSlot
// Loop through active[0..max-1]. Return the first i where !active[i].
// If no free slot, return INVALID_ID.
EntityId findFreeSlot(bool active[], int max) {
    // Your code here
    return INVALID_ID;
}

// TODO 2: Implement spawnEnemy
// Call findFreeSlot(w.enemy_active, MAX_ENEMIES).
// If id == INVALID_ID, return INVALID_ID.
// Otherwise set: w.enemy_x[id]=x, w.enemy_y[id]=y,
//   w.enemy_speed[id]=speed, w.enemy_color[id]=c,
//   w.enemy_active[id]=true. Return id.
EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    // Your code here
    return INVALID_ID;
}

// TODO 3: Implement spawnWave
// Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
// Loop i from 0 to MAX_ENEMIES-1:
//   spawnEnemy(w, 80+i*130, 30, 18.0f+i*6.0f, palette[i]);
void spawnWave(World& w) {
    // Your code here
}`,
      "main.cpp": `#include <iostream>
#include \"hs_world.h\"
using namespace std;

World world;
float accumulator = 0.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    { int a=0,s=0; for(int f=0;f<5;f++){a+=16; while(a>=16){s++;a-=16;}} cout<<\"FIXED_DT: 16ms\"<<endl; cout<<\"Steps: \"<<s<<endl; cout<<\"Pattern: accumulator\"<<endl; }

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                for (int i = 0; i < MAX_BULLETS; i++) {
                    if (!world.bullet_active[i]) {
                        world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                        world.bullet_y[i] = (int)world.ship_y;
                        world.bullet_active[i] = true; break;
                    }
                }
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) { world.bullet_y[i] -= 8; if (world.bullet_y[i] < -10) world.bullet_active[i] = false; }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) { world.bullet_active[b]=false; world.enemy_active[e]=false; world.score+=100; }
                }
            }
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
            accumulator -= FIXED_DT;
        }

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        DrawText(\"HeapSight Shooter\", 10, 10, 20, WHITE);
        DrawText(TextFormat(\"Score: %d\", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat(\"Wave:  %d\", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat(\"HP: %d/%d\", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(\"Split: hs_world\", 10, 130, 20, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    solutionCode: {
      "hs_world.h": `#pragma once
#include \"raylib.h\"

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

EntityId findFreeSlot(bool active[], int max);
EntityId spawnEnemy(World& w, float x, float y, float speed, Color c);
void spawnWave(World& w);`,
      "hs_world.cpp": `#include \"hs_world.h\"

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x; w.enemy_y[id] = y;
    w.enemy_speed[id] = speed; w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++)
        spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
}`,
      "main.cpp": `#include <iostream>
#include \"hs_world.h\"
using namespace std;

World world;
float accumulator = 0.0f;

int main() {
    InitWindow(SCREEN_W, SCREEN_H, \"HeapSight Shooter\");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    { int a=0,s=0; for(int f=0;f<5;f++){a+=16; while(a>=16){s++;a-=16;}} cout<<\"FIXED_DT: 16ms\"<<endl; cout<<\"Steps: \"<<s<<endl; cout<<\"Pattern: accumulator\"<<endl; }

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                for (int i = 0; i < MAX_BULLETS; i++) {
                    if (!world.bullet_active[i]) {
                        world.bullet_x[i] = (int)world.ship_x + world.ship_w/2 - 2;
                        world.bullet_y[i] = (int)world.ship_y;
                        world.bullet_active[i] = true; break;
                    }
                }
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) { world.bullet_y[i] -= 8; if (world.bullet_y[i] < -10) world.bullet_active[i] = false; }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) { world.bullet_active[b]=false; world.enemy_active[e]=false; world.score+=100; }
                }
            }
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
            accumulator -= FIXED_DT;
        }

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        DrawText(\"HeapSight Shooter\", 10, 10, 20, WHITE);
        DrawText(TextFormat(\"Score: %d\", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat(\"Wave:  %d\", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat(\"HP: %d/%d\", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(\"Split: hs_world\", 10, 130, 20, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    },
    tests: [
      { id: "g1", description: "Fixed DT value printed", expectedOutput: "FIXED_DT: 16ms" },
      { id: "g2", description: "Step count matches", expectedOutput: "Steps: 5" },
      { id: "g3", description: "Accumulator pattern confirmed", expectedOutput: "Pattern: accumulator" },
    ],
    hints: [
      "findFreeSlot: for (int i = 0; i < max; i++) if (!active[i]) return i; return INVALID_ID;",
      "spawnEnemy: get id from findFreeSlot, then set w.enemy_x[id]=x, w.enemy_y[id]=y, w.enemy_speed[id]=speed, w.enemy_color[id]=c, w.enemy_active[id]=true.",
      "spawnWave: Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE}; then loop i 0..4 calling spawnEnemy(w, 80+i*130, 30, 18.0f+i*6.0f, palette[i]).",
    ],
    estimatedMinutes: 15,
  },
};
