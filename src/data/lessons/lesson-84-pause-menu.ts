import type { Lesson } from "@/types/lesson";

export const lesson84: Lesson = {
  id: "84-pause-menu",
  title: "Pause Menu",
  description: "Implement pause/unpause with a menu overlay and help text.",
  order: 84,
  xpReward: 200,
  tier: "pro",
  concepts: ["game states", "pause handling", "menu overlay", "state toggle"],
  part1: {
    title: "Concept: Pause Menu",
    type: "concept",
    instructions: `# Pause Menu — Games Without Pause Are Unshippable

Every shipped game pauses. Press Escape. Press P. Press Start. The game freezes. The player breathes. A menu appears. Resume, options, quit. Without pause, the game is a treadmill that never stops. The player cannot answer the phone. Cannot check a notification. Cannot walk away. Pause is not a feature — it is a contract with the player that says "your time matters."

## What Breaks Without This

Without game states, the simulation runs unconditionally. Movement ticks. Enemies advance. Bullets fly. Collisions resolve. The player presses P and nothing happens. Or worse — P fires a weapon because the input system does not know the game is paused. Every system must check the game state before running. PAUSED means no updates. No movement. No spawns. No collisions. Rendering continues — the player needs to see the frozen frame — but the simulation stops cold.

## The Fix

A GameState enum with at minimum two values: PLAYING and PAUSED. A single variable holds the current state. The game loop checks this variable before running each system. If PAUSED, skip movement, collision, spawning, and scoring. Keep rendering. Show the pause overlay on top. Toggle with a single key press.

\\\`\\\`\\\`
enum GameState { PLAYING, PAUSED };
GameState state = PLAYING;

// In game loop:
if (state == PLAYING) {
    movementSystem();
    collisionSystem();
    spawnSystem();
}
// Always render
renderSystem();
if (state == PAUSED) showPauseOverlay();
\\\`\\\`\\\`

The critical insight: rendering is not simulation. Rendering shows the current state. Simulation changes the current state. Pause stops simulation. Rendering continues.

## Your Task

1. Define a GameState enum: PLAYING, PAUSED
2. Track the current state and a frame counter
3. Simulate 7 frames of gameplay with pause toggle:
   - Frames 1-3: PLAYING, 12 entities updated per frame
   - Frame 4: player presses 'p', state toggles to PAUSED
   - Frames 4-5: PAUSED, 0 entities updated, show pause overlay
   - Frame 6: player presses 'p', state toggles to PLAYING
   - Frames 6-7: PLAYING, 12 entities updated per frame
4. Print per frame: \\\`STATE|frame|<n>|<state>|entities_updated|<count>\\\`
5. While PAUSED, print overlay:
   \\\`PAUSE_MENU|=== PAUSED ===\\\`
   \\\`PAUSE_MENU|[P] Resume\\\`
   \\\`PAUSE_MENU|[H] Help\\\`
   \\\`PAUSE_MENU|Score: 500\\\`
6. Print: \\\`PAUSE_SUMMARY|total_paused_frames|2|total_playing_frames|5\\\`

Expected output:
\\\`\\\`\\\`
STATE|frame|1|PLAYING|entities_updated|12
STATE|frame|2|PLAYING|entities_updated|12
STATE|frame|3|PLAYING|entities_updated|12
STATE|frame|4|PAUSED|entities_updated|0
PAUSE_MENU|=== PAUSED ===
PAUSE_MENU|[P] Resume
PAUSE_MENU|[H] Help
PAUSE_MENU|Score: 500
STATE|frame|5|PAUSED|entities_updated|0
PAUSE_MENU|=== PAUSED ===
PAUSE_MENU|[P] Resume
PAUSE_MENU|[H] Help
PAUSE_MENU|Score: 500
STATE|frame|6|PLAYING|entities_updated|12
STATE|frame|7|PLAYING|entities_updated|12
PAUSE_SUMMARY|total_paused_frames|2|total_playing_frames|5
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Toggling state every frame instead of on key press. If you toggle on every frame while 'p' is held, the game flickers between PLAYING and PAUSED at 60fps. Toggle on the frame the key is first pressed, not while it is held. In this simulation, we model discrete key events — 'p' fires once at a specific frame.

## Elite Insight

State machines scale. PLAYING and PAUSED are two states. Add MENU, GAME_OVER, VICTORY, CUTSCENE, LOADING. Each state defines which systems run and which inputs are valid. The game loop becomes a state dispatcher. This is the architecture that ships. One enum. One switch statement. Every behavior controlled by state.

## Cross-Path Echo

Thread synchronization uses the same pattern. A mutex pauses all threads except the one holding the lock. The "paused" threads wait — they do not execute. When the mutex releases, all threads resume. Your game pause is a mutex on the simulation. The render thread keeps running. The simulation threads wait.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

enum GameState { PLAYING, PAUSED };

GameState state = PLAYING;
int score = 500;

// TODO: Write getStateName(state) — return "PLAYING" or "PAUSED"

// TODO: Write showPauseOverlay(score) — print 4 PAUSE_MENU lines

// TODO: Write updateSystems(entityCount) — return entities updated
//       If PLAYING: return entityCount. If PAUSED: return 0

int main() {
    int totalEntities = 12;
    int pausedFrames = 0;
    int playingFrames = 0;

    // Input events: frame 4 = 'p' (pause), frame 6 = 'p' (unpause)
    // TODO: Simulate 7 frames
    //   Each frame: check for input, toggle state if 'p'
    //   Update systems, print STATE line
    //   If PAUSED, show overlay
    //   Track paused/playing frame counts

    // TODO: Print PAUSE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum GameState { PLAYING, PAUSED };

GameState state = PLAYING;
int score = 500;

string getStateName(GameState s) {
    if (s == PLAYING) return "PLAYING";
    return "PAUSED";
}

void showPauseOverlay(int sc) {
    cout << "PAUSE_MENU|=== PAUSED ===" << endl;
    cout << "PAUSE_MENU|[P] Resume" << endl;
    cout << "PAUSE_MENU|[H] Help" << endl;
    cout << "PAUSE_MENU|Score: " << sc << endl;
}

int updateSystems(int entityCount) {
    if (state == PLAYING) return entityCount;
    return 0;
}

int main() {
    int totalEntities = 12;
    int pausedFrames = 0;
    int playingFrames = 0;

    for (int frame = 1; frame <= 7; frame++) {
        // Input events
        if (frame == 4 || frame == 6) {
            if (state == PLAYING) state = PAUSED;
            else state = PLAYING;
        }

        int updated = updateSystems(totalEntities);

        cout << "STATE|frame|" << frame << "|" << getStateName(state)
             << "|entities_updated|" << updated << endl;

        if (state == PAUSED) {
            showPauseOverlay(score);
        }

        if (state == PAUSED) pausedFrames++;
        else playingFrames++;
    }

    cout << "PAUSE_SUMMARY|total_paused_frames|" << pausedFrames
         << "|total_playing_frames|" << playingFrames << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 is PLAYING", expectedOutput: "STATE\\|frame\\|1\\|PLAYING\\|entities_updated\\|12", isPattern: true },
      { id: "t2", description: "Frame 4 is PAUSED", expectedOutput: "STATE\\|frame\\|4\\|PAUSED\\|entities_updated\\|0", isPattern: true },
      { id: "t3", description: "Pause overlay shows title", expectedOutput: "PAUSE_MENU\\|=== PAUSED ===", isPattern: true },
      { id: "t4", description: "Pause overlay shows score", expectedOutput: "PAUSE_MENU\\|Score: 500", isPattern: true },
      { id: "t5", description: "Frame 6 resumes PLAYING", expectedOutput: "STATE\\|frame\\|6\\|PLAYING\\|entities_updated\\|12", isPattern: true },
      { id: "t6", description: "Pause summary counts", expectedOutput: "PAUSE_SUMMARY\\|total_paused_frames\\|2\\|total_playing_frames\\|5", isPattern: true },
    ],
    hints: [
      "Toggle state only on specific frames (4 and 6). Use an if check: if state is PLAYING, switch to PAUSED. Otherwise switch to PLAYING. This happens before updateSystems runs for that frame.",
      "updateSystems returns totalEntities when PLAYING, 0 when PAUSED. The PAUSED state means zero entities updated — no movement, no collision, no spawning.",
      "Show the pause overlay after printing the STATE line, only when state is PAUSED. The overlay is four lines: title, resume key, help key, current score.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Pause Menu System",
    type: "game_builder",
    instructions: `# Game Builder: Pause Menu — Freeze the Simulation, Keep the Frame

Pause separates simulation from presentation. The render system keeps drawing. The HUD keeps displaying. But the simulation systems — movement, collision, spawning, scoring — all stop. The player sees a frozen game world with a menu overlay. Press P to resume. Every system resumes exactly where it left off. No lost frames. No skipped ticks. No desync.

## What Breaks Without This

Without state gating, pausing requires stopping the entire program. That kills the render loop. The screen goes black or freezes at the OS level. The player thinks the game crashed. Proper pause keeps the render loop alive, shows the overlay, and blocks only the simulation systems. The game is visually responsive even while paused.

## The Fix

Gate every simulation system behind a state check. Movement, collision, spawn, score — all skip their logic when state is PAUSED. The render system and overlay system always run. The toggle is a single key press that flips the state enum. Clean. Predictable. No edge cases.

\\\`\\\`\\\`
// Per frame:
if (input == 'p') togglePause();
if (state == PLAYING) {
    movementSystem();
    collisionSystem();
    spawnSystem();
}
renderSystem();
if (state == PAUSED) showPauseOverlay();
\\\`\\\`\\\`

## Your Task

1. Define GameState enum: PLAYING, PAUSED
2. Track state, frame counter, entities (12 total)
3. Simulate 7 frames:
   - Frames 1-3: PLAYING, all 12 entities updated
   - Frame 4: 'p' pressed, toggle to PAUSED
   - Frames 4-5: PAUSED, 0 entities updated, show overlay
   - Frame 6: 'p' pressed, toggle to PLAYING
   - Frames 6-7: PLAYING, all 12 entities updated
4. Print per frame: \\\`STATE|frame|<n>|<state>|entities_updated|<count>\\\`
5. While PAUSED, print overlay:
   \\\`PAUSE_MENU|=== PAUSED ===\\\`
   \\\`PAUSE_MENU|[P] Resume\\\`
   \\\`PAUSE_MENU|[H] Help\\\`
   \\\`PAUSE_MENU|Score: 500\\\`
6. Print: \\\`PAUSE_SUMMARY|total_paused_frames|2|total_playing_frames|5\\\`

## Beginner Trap

**Common Mistake:** Updating the frame counter only during PLAYING. The frame counter must advance every tick regardless of state. Paused frames are still frames — they just do not update the simulation. If you skip the frame counter during pause, your replay log desyncs because frame numbers no longer match tick numbers.

## Elite Insight

Commercial engines implement pause at the time scale level. Set the simulation delta time to zero. Every system that multiplies by dt automatically stops. Movement = velocity * 0 = 0. Gravity = 9.8 * 0 = 0. No if-checks needed. The math handles it. Your enum approach is the explicit version of the same idea.

## Cross-Path Echo

Database transactions use the same principle. BEGIN TRANSACTION pauses writes from other connections. The database is "paused" for external writes but continues processing the active transaction. COMMIT resumes normal operation. Your game pause is a transaction lock on the simulation state.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

enum GameState { PLAYING, PAUSED };

GameState state = PLAYING;
int score = 500;

// TODO: Write getStateName(state) — return "PLAYING" or "PAUSED"

// TODO: Write showPauseOverlay(score) — print 4 PAUSE_MENU lines

// TODO: Write updateSystems(entityCount) — return entities updated
//       PLAYING: return entityCount. PAUSED: return 0

int main() {
    int totalEntities = 12;
    int pausedFrames = 0;
    int playingFrames = 0;

    // Frame inputs: 'p' at frame 4, 'p' at frame 6, nothing otherwise
    // TODO: Simulate 7 frames
    //   Toggle state on 'p' input
    //   Update systems, print STATE line
    //   If PAUSED, show overlay
    //   Track paused/playing counts

    // TODO: Print PAUSE_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum GameState { PLAYING, PAUSED };

GameState state = PLAYING;
int score = 500;

string getStateName(GameState s) {
    if (s == PLAYING) return "PLAYING";
    return "PAUSED";
}

void showPauseOverlay(int sc) {
    cout << "PAUSE_MENU|=== PAUSED ===" << endl;
    cout << "PAUSE_MENU|[P] Resume" << endl;
    cout << "PAUSE_MENU|[H] Help" << endl;
    cout << "PAUSE_MENU|Score: " << sc << endl;
}

int updateSystems(int entityCount) {
    if (state == PLAYING) return entityCount;
    return 0;
}

int main() {
    int totalEntities = 12;
    int pausedFrames = 0;
    int playingFrames = 0;

    for (int frame = 1; frame <= 7; frame++) {
        if (frame == 4 || frame == 6) {
            if (state == PLAYING) state = PAUSED;
            else state = PLAYING;
        }

        int updated = updateSystems(totalEntities);

        cout << "STATE|frame|" << frame << "|" << getStateName(state)
             << "|entities_updated|" << updated << endl;

        if (state == PAUSED) {
            showPauseOverlay(score);
        }

        if (state == PAUSED) pausedFrames++;
        else playingFrames++;
    }

    cout << "PAUSE_SUMMARY|total_paused_frames|" << pausedFrames
         << "|total_playing_frames|" << playingFrames << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 PLAYING with updates", expectedOutput: "STATE\\|frame\\|1\\|PLAYING\\|entities_updated\\|12", isPattern: true },
      { id: "t2", description: "Frame 3 still PLAYING", expectedOutput: "STATE\\|frame\\|3\\|PLAYING\\|entities_updated\\|12", isPattern: true },
      { id: "t3", description: "Frame 4 toggled to PAUSED", expectedOutput: "STATE\\|frame\\|4\\|PAUSED\\|entities_updated\\|0", isPattern: true },
      { id: "t4", description: "Pause overlay displayed", expectedOutput: "PAUSE_MENU\\|=== PAUSED ===", isPattern: true },
      { id: "t5", description: "Pause overlay shows score", expectedOutput: "PAUSE_MENU\\|Score: 500", isPattern: true },
      { id: "t6", description: "Frame 6 unpaused to PLAYING", expectedOutput: "STATE\\|frame\\|6\\|PLAYING\\|entities_updated\\|12", isPattern: true },
      { id: "t7", description: "Pause summary totals", expectedOutput: "PAUSE_SUMMARY\\|total_paused_frames\\|2\\|total_playing_frames\\|5", isPattern: true },
    ],
    hints: [
      "Toggle state only at frames 4 and 6. Check if the current state is PLAYING — if so, switch to PAUSED. Otherwise switch to PLAYING. This toggle happens before systems update for that frame.",
      "updateSystems returns the entity count when PLAYING, zero when PAUSED. Print the STATE line after updating. Then check if PAUSED and show the overlay. The overlay prints four lines each paused frame.",
      "Count paused and playing frames separately after each frame. Frames 4 and 5 are PAUSED (2 total). Frames 1, 2, 3, 6, 7 are PLAYING (5 total). Total = 7 frames.",
    ],
    estimatedMinutes: 8,
  },
};
