import type { Lesson } from "@/types/lesson";

const lessonPlatformer25: Lesson = {
  id: "platformer-25-restart-resume",
  title: "Milestone: Restart and Resume",
  description: "Combine checkpoint save, state signature, and deterministic RNG to prove your save/load is bulletproof.",
  order: 25,
  xpReward: 300,
  tier: "pro",
  concepts: ["checkpoint verification", "state signature", "determinism proof", "save/load validation"],
  part1: {
    title: "Checkpoint Signature Proof",
    type: "concept",
    instructions: `# Checkpoint Signature Proof

## The Problem
You have saveCheckpoint and loadCheckpoint. But how do you KNOW the restore is perfect?
You compute a state signature before saving and again after loading.
If they match, you have byte-for-byte identical state.

## The Concept
stateSignature hashes the entire world: tilemap, player position, score.
It produces a single unsigned integer that fingerprints the current game state.
If the same sequence of operations produces the same integer, your determinism is verified.

## Your Task
1. Create a Player struct and compute a hash of its state.
2. Save the signature before modifying the player.
3. Restore the player to its original values.
4. Compute the signature again and print whether they match.

## Expected Output
\`\`\`
Milestone: Restart and Resume
Saved sig: 480
Restored sig: 480
Match: true
Pattern: restart-resume
\`\`\`

(Your sig values may differ. What matters is Match: true.)

## Beginner Trap
**Testing restart but not resume.** A restart that works does not prove load works. Save, close, reload, and verify the state matches. The full round-trip test (save + load + verify) is the real proof of correctness.

## Elite Insight
Professional QA teams run "save-quit-load" cycles hundreds of times with different game states. The round-trip test catches serialization bugs that manual restart testing misses — field order, type size, and endianness issues.

## Systems Thinking Connection
The RPG and Shooter test the same save-quit-load cycle. The Crawler tests permadeath save integrity. Round-trip verification is the universal test for any save system regardless of genre.`,
    starterCode: `#include <iostream>
using namespace std;

struct Player { float x, y; int score; };

// Compute a simple hash of player state
unsigned hashPlayer(Player& p) {
    unsigned h = 0;
    // TODO 1: h += (unsigned)(p.x * 10) * 31;
    // TODO 2: h += (unsigned)(p.y * 10) * 7;
    // TODO 3: h += (unsigned)p.score;
    return h;
}

int main() {
    Player p = {48.0f, 350.0f, 0};
    // TODO 4: unsigned sig_before = hashPlayer(p);
    cout << "Milestone: Restart and Resume" << endl;
    // TODO 5: cout << "Saved sig: " << sig_before << endl;
    // Modify then restore
    p.x = 200.0f; p.y = 200.0f; p.score = 5;
    p.x = 48.0f; p.y = 350.0f; p.score = 0;  // restore
    // TODO 6: unsigned sig_after = hashPlayer(p);
    // TODO 7: cout << "Restored sig: " << sig_after << endl;
    // TODO 8: cout << "Match: " << (sig_before == sig_after ? "true" : "false") << endl;
    cout << "Pattern: restart-resume" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Player { float x, y; int score; };

unsigned hashPlayer(Player& p) {
    unsigned h = 0;
    h += (unsigned)(p.x * 10) * 31;
    h += (unsigned)(p.y * 10) * 7;
    h += (unsigned)p.score;
    return h;
}

int main() {
    Player p = {48.0f, 350.0f, 0};
    unsigned sig_before = hashPlayer(p);
    cout << "Milestone: Restart and Resume" << endl;
    cout << "Saved sig: " << sig_before << endl;
    p.x = 200.0f; p.y = 200.0f; p.score = 5;
    p.x = 48.0f; p.y = 350.0f; p.score = 0;
    unsigned sig_after = hashPlayer(p);
    cout << "Restored sig: " << sig_after << endl;
    cout << "Match: " << (sig_before == sig_after ? "true" : "false") << endl;
    cout << "Pattern: restart-resume" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Milestone header printed", expectedOutput: "Milestone: Restart and Resume" },
      { id: "t2", description: "Match is true", expectedOutput: "Match: true" },
      { id: "t3", description: "Pattern printed", expectedOutput: "Pattern: restart-resume" },
    ],
    hints: [
      'hashPlayer combines x*10, y*10, and score into a single unsigned int.',
      'sig_before = hashPlayer(p) before modifying p. sig_after = hashPlayer(p) after restoring p.',
      'If x, y, score are restored identically, the hash must be the same.',
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Signature Verification on Restore",
    type: "game_builder",
    instructions: `# Build: Signature Verification on Restore

## Milestone Summary
This is Phase 3 capstone. You now have:
- Deterministic LCG coin placement (L21)
- Single RNG source discipline (L22)
- State signature that fingerprints the world (L23)
- Checkpoint save/load with C and R keys (L24)

## Your Task: Add Signature Verification
When you press C to save, record the current state signature.
When you press R to restore, compare the restored signature to the saved one.
Show MILESTONE: SIG MATCH! when they are equal.

## New Code to Add
\`\`\`
// After ckpt_valid declaration:
unsigned saved_sig = 0;
bool sig_matched = false;

// C key handler:
if (IsKeyPressed(KEY_C)) {
    saveCheckpoint(w);
    saved_sig = stateSignature(w);  // capture sig at save time
    sig_matched = false;             // reset match flag
}

// R key handler:
if (IsKeyPressed(KEY_R) && ckpt_valid) {
    loadCheckpoint(w);
    sig_matched = (stateSignature(w) == saved_sig);  // verify!
}
\`\`\`

## HUD Addition
Add below the CKPT line to show verification status.
Show MILESTONE: SIG MATCH! in GREEN when sig_matched is true.
Show Press R to verify in ORANGE when checkpoint exists but not yet verified.

## Expected Cout Output
\`\`\`
Milestone: Restart and Resume
Keys: C=save R=load
Verify: sig match on restore
Pattern: restart-resume
\`\`\`

## Mastery Check
1. Stand on a platform. Press C.
2. Run around, collect 2-3 coins.
3. Press R. You snap back to your save position.
4. The HUD shows MILESTONE: SIG MATCH! in green.
5. This proves your save/load is completely deterministic.`,
    starterCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;
const int NUM_LEVELS = 2;

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
    },
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,1},
    {1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
    int level_index;
};

World w;

unsigned lcg_state = 0;

unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}

void scrambleCoins(World& w, unsigned seed) {
    lcg_state = seed;
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == 2) w.tilemap[r][c] = 0;
    int placed = 0, tries = 0;
    while (placed < 8 && tries < 1000) {
        tries++;
        int r = lcgNext() % ROWS;
        int c = lcgNext() % COLS;
        if (w.tilemap[r][c] == 0) { w.tilemap[r][c] = 2; placed++; }
    }
}

unsigned stateSignature(World& w) {
    unsigned sig = 0;
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            sig = sig * 31 + (unsigned)(w.tilemap[r][c] + 2);
    sig ^= (unsigned)(w.player.x * 10.0f);
    sig ^= (unsigned)(w.player.y * 10.0f) << 16;
    sig ^= (unsigned)w.score;
    return sig;
}

float ckpt_x = 48.0f, ckpt_y = 350.0f;
int ckpt_score = 0, ckpt_level = 0;
bool ckpt_valid = false;
// TODO 1: unsigned saved_sig = 0;
// TODO 2: bool sig_matched = false;

void loadLevel(World& w) {
    memcpy(w.tilemap, LEVEL_DATA[w.level_index], sizeof(w.tilemap));
}

void saveCheckpoint(World& w) {
    ckpt_x = w.player.x; ckpt_y = w.player.y;
    ckpt_score = w.score; ckpt_level = w.level_index;
    ckpt_valid = true;
}

void loadCheckpoint(World& w) {
    if (!ckpt_valid) return;
    w.level_index = ckpt_level;
    loadLevel(w);
    scrambleCoins(w, 42 + ckpt_level * 94);
    w.player.x = ckpt_x; w.player.y = ckpt_y;
    w.player.vx = 0; w.player.vy = 0;
    w.player.state = GROUNDED;
    w.score = ckpt_score;
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    w.level_index = 0;
    loadLevel(w);
    scrambleCoins(w, 42);
}

void checkExitDoor(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 3) {
                if (w.level_index < NUM_LEVELS - 1) {
                    w.level_index++;
                    loadLevel(w);
                    scrambleCoins(w, 42 + w.level_index * 94);
                    w.player.x = 48.0f; w.player.y = 350.0f;
                    w.player.vx = 0; w.player.vy = 0;
                    w.player.state = GROUNDED;
                }
            }
}

void inputPass(World& w) {
    w.cmd = CMD_NONE;
    if (IsKeyDown(KEY_RIGHT)) w.cmd = CMD_RIGHT;
    else if (IsKeyDown(KEY_LEFT)) w.cmd = CMD_LEFT;
    if (IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer = JUMP_BUFFER;
}

void physicsPass(World& w) {
    Player& p = w.player;
    if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
    if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
    float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
    if (w.cmd == CMD_RIGHT) {
        p.vx += accel * FIXED_DT; if (p.vx > MAX_RUN) p.vx = MAX_RUN;
    } else if (w.cmd == CMD_LEFT) {
        p.vx -= accel * FIXED_DT; if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
    } else {
        if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
        else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
    }
    if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
        p.vy = -JUMP_SPEED; p.state = AIRBORNE;
        p.coyote_timer = 0; p.jump_buffer_timer = 0;
    }
    if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
        p.vy = -MIN_JUMP_VY;
    p.x += p.vx * FIXED_DT;
}

void markCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2)
                w.tilemap[r][c] = -1;
}

void cleanupPass(World& w) {
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == -1) { w.tilemap[r][c] = 0; w.score++; }
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0; p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x = right_col * TILE_SIZE - PLAYER_W; p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x = (left_col + 1) * TILE_SIZE; p.vx = 0;
        }
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);
    // TODO 3: cout << "Milestone: Restart and Resume" << endl;
    // TODO 4: cout << "Keys: C=save R=load" << endl;
    // TODO 5: cout << "Verify: sig match on restore" << endl;
    // TODO 6: cout << "Pattern: restart-resume" << endl;
    while (!WindowShouldClose()) {
        inputPass(w);
        if (IsKeyPressed(KEY_C)) {
            saveCheckpoint(w);
            // TODO 7: saved_sig = stateSignature(w);
            // TODO 8: sig_matched = false;
        }
        if (IsKeyPressed(KEY_R) && ckpt_valid) {
            loadCheckpoint(w);
            // TODO 9: sig_matched = (stateSignature(w) == saved_sig);
        }
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        markCoins(w);
        cleanupPass(w);
        checkExitDoor(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++) {
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
                else if (w.tilemap[r][c] == 3)
                    DrawRectangle(c*TILE_SIZE+4, r*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8, ORANGE);
            }
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        DrawText("RNG: LCG only", 10, 80, 14, WHITE);
        DrawText(TextFormat("Sig: %u", stateSignature(w)), 10, 97, 12, LIGHTGRAY);
        DrawText(ckpt_valid ? "CKPT: saved" : "CKPT: none", 10, 112, 12, LIME);
        // TODO 10: if (ckpt_valid) DrawText(sig_matched ? "MILESTONE: SIG MATCH!" : "Press R to verify", 10, 128, 14, sig_matched ? GREEN : ORANGE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;
const int NUM_LEVELS = 2;

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
    },
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,1},
    {1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
    int level_index;
};

World w;

unsigned lcg_state = 0;

unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}

void scrambleCoins(World& w, unsigned seed) {
    lcg_state = seed;
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == 2) w.tilemap[r][c] = 0;
    int placed = 0, tries = 0;
    while (placed < 8 && tries < 1000) {
        tries++;
        int r = lcgNext() % ROWS;
        int c = lcgNext() % COLS;
        if (w.tilemap[r][c] == 0) { w.tilemap[r][c] = 2; placed++; }
    }
}

unsigned stateSignature(World& w) {
    unsigned sig = 0;
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            sig = sig * 31 + (unsigned)(w.tilemap[r][c] + 2);
    sig ^= (unsigned)(w.player.x * 10.0f);
    sig ^= (unsigned)(w.player.y * 10.0f) << 16;
    sig ^= (unsigned)w.score;
    return sig;
}

float ckpt_x = 48.0f, ckpt_y = 350.0f;
int ckpt_score = 0, ckpt_level = 0;
bool ckpt_valid = false;
unsigned saved_sig = 0;
bool sig_matched = false;

void loadLevel(World& w) {
    memcpy(w.tilemap, LEVEL_DATA[w.level_index], sizeof(w.tilemap));
}

void saveCheckpoint(World& w) {
    ckpt_x = w.player.x; ckpt_y = w.player.y;
    ckpt_score = w.score; ckpt_level = w.level_index;
    ckpt_valid = true;
}

void loadCheckpoint(World& w) {
    if (!ckpt_valid) return;
    w.level_index = ckpt_level;
    loadLevel(w);
    scrambleCoins(w, 42 + ckpt_level * 94);
    w.player.x = ckpt_x; w.player.y = ckpt_y;
    w.player.vx = 0; w.player.vy = 0;
    w.player.state = GROUNDED;
    w.score = ckpt_score;
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    w.level_index = 0;
    loadLevel(w);
    scrambleCoins(w, 42);
}

void checkExitDoor(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 3) {
                if (w.level_index < NUM_LEVELS - 1) {
                    w.level_index++;
                    loadLevel(w);
                    scrambleCoins(w, 42 + w.level_index * 94);
                    w.player.x = 48.0f; w.player.y = 350.0f;
                    w.player.vx = 0; w.player.vy = 0;
                    w.player.state = GROUNDED;
                }
            }
}

void inputPass(World& w) {
    w.cmd = CMD_NONE;
    if (IsKeyDown(KEY_RIGHT)) w.cmd = CMD_RIGHT;
    else if (IsKeyDown(KEY_LEFT)) w.cmd = CMD_LEFT;
    if (IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer = JUMP_BUFFER;
}

void physicsPass(World& w) {
    Player& p = w.player;
    if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
    if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
    float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
    if (w.cmd == CMD_RIGHT) {
        p.vx += accel * FIXED_DT; if (p.vx > MAX_RUN) p.vx = MAX_RUN;
    } else if (w.cmd == CMD_LEFT) {
        p.vx -= accel * FIXED_DT; if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
    } else {
        if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
        else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
    }
    if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
        p.vy = -JUMP_SPEED; p.state = AIRBORNE;
        p.coyote_timer = 0; p.jump_buffer_timer = 0;
    }
    if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
        p.vy = -MIN_JUMP_VY;
    p.x += p.vx * FIXED_DT;
}

void markCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2)
                w.tilemap[r][c] = -1;
}

void cleanupPass(World& w) {
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == -1) { w.tilemap[r][c] = 0; w.score++; }
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0; p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x = right_col * TILE_SIZE - PLAYER_W; p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x = (left_col + 1) * TILE_SIZE; p.vx = 0;
        }
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);
    cout << "Milestone: Restart and Resume" << endl;
    cout << "Keys: C=save R=load" << endl;
    cout << "Verify: sig match on restore" << endl;
    cout << "Pattern: restart-resume" << endl;
    while (!WindowShouldClose()) {
        inputPass(w);
        if (IsKeyPressed(KEY_C)) {
            saveCheckpoint(w);
            saved_sig = stateSignature(w);
            sig_matched = false;
        }
        if (IsKeyPressed(KEY_R) && ckpt_valid) {
            loadCheckpoint(w);
            sig_matched = (stateSignature(w) == saved_sig);
        }
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        markCoins(w);
        cleanupPass(w);
        checkExitDoor(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++) {
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
                else if (w.tilemap[r][c] == 3)
                    DrawRectangle(c*TILE_SIZE+4, r*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8, ORANGE);
            }
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        DrawText("RNG: LCG only", 10, 80, 14, WHITE);
        DrawText(TextFormat("Sig: %u", stateSignature(w)), 10, 97, 12, LIGHTGRAY);
        DrawText(ckpt_valid ? "CKPT: saved" : "CKPT: none", 10, 112, 12, LIME);
        if (ckpt_valid) DrawText(sig_matched ? "MILESTONE: SIG MATCH!" : "Press R to verify", 10, 128, 14, sig_matched ? GREEN : ORANGE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Milestone header", expectedOutput: "Milestone: Restart and Resume" },
      { id: "g2", description: "Keys documented", expectedOutput: "Keys: C=save R=load" },
      { id: "g3", description: "Verify message", expectedOutput: "Verify: sig match on restore" },
      { id: "g4", description: "Pattern printed", expectedOutput: "Pattern: restart-resume" },
    ],
    hints: [
      'Add globals: unsigned saved_sig = 0; and bool sig_matched = false; after ckpt_valid.',
      'In the C key handler after saveCheckpoint: saved_sig = stateSignature(w); sig_matched = false;',
      'In the R key handler after loadCheckpoint: sig_matched = (stateSignature(w) == saved_sig);',
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer25;
