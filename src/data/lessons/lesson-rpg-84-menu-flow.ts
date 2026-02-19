import { Lesson } from "@/types/lesson";

export const lessonRPG84: Lesson = {
  id: "rpg-84-menu-flow",
  title: "Menu Flow",
  description: "App state machine: TITLE, PLAYING, PAUSED, GAME_OVER. Commands transition between states. The game finally has a front door.",
  order: 84,
  xpReward: 100,
  tier: "pro",
  concepts: ["app state machine", "menu flow", "state transitions", "enum-driven logic", "game modes"],
  part1: {
    title: "Concept: App State Machine",
    type: "concept",
    instructions: `# Menu Flow

## Mental Model

Your game boots straight into combat. There's no title screen, no pause, no game over — just the dungeon loop running forever. A real game has modes: TITLE shows a welcome screen, PLAYING runs the game loop, PAUSED freezes the game, GAME_OVER shows the final state. An enum and a transition function give your game a front door and an exit.

## What Breaks Without This

\`\`\`cpp
// Game starts immediately. Player has no context.
// Player wants to pause — no mechanism exists.
// Player dies — the loop just keeps running on a dead character.
// There's no way to restart without closing the program.
\`\`\`

Without an app state machine, the game is a single mode that runs until the process ends. Every real game has at least three modes.

## The Fix: Enum-Driven State Machine

\`\`\`cpp
enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

AppState processMenuInput(AppState current, const char* cmd) {
    if (current == TITLE && strcmp(cmd, "start") == 0) return PLAYING;
    if (current == PLAYING && strcmp(cmd, "pause") == 0) return PAUSED;
    if (current == PAUSED && strcmp(cmd, "resume") == 0) return PLAYING;
    if (current == PLAYING && strcmp(cmd, "die") == 0) return GAME_OVER;
    return current; // invalid command — stay in current state
}
\`\`\`

The state machine is explicit: each transition is a single line mapping (current_state, command) to next_state. Invalid commands are ignored — the state doesn't change. This is a pure function: no side effects, no global mutation.

The game loop checks app_state before processing. In TITLE, it shows the title screen. In PLAYING, it runs the tick pipeline. In PAUSED, it shows a pause message. In GAME_OVER, it shows the final score.

## Key Concepts

- **Enum as state** — AppState is a simple integer under the hood, zero allocation cost
- **Transition function** — pure function mapping (state, command) to next state
- **Guard clauses** — invalid transitions return the current state unchanged
- **Mode-based rendering** — each state shows different output in the render pass

## Performance Insight

An enum is an int. A strcmp is a byte comparison. The state machine is a chain of if-statements with early return. This is faster than a virtual dispatch or function pointer table — the compiler can branch-predict the common path (PLAYING) trivially.

## Memory Insight

One integer for the app state. That's it. The enum lives on the stack (or in the world struct). No heap, no allocations, no containers. State machines are the cheapest architectural pattern in games.

## Beginner Trap

\`\`\`cpp
// BAD: Using a string for state
string game_state = "playing";
if (game_state == "paused") { ... }
// Heap-allocated string for a 4-value enum!
// Typo "puased" compiles but silently breaks.
// Use an enum — the compiler catches invalid values.
\`\`\`

## Elite Insight

Every Nintendo game ships with an app state machine. Mario's title screen, world map, level, pause, and game over are all states in a top-level FSM. Doom's Carmack used an explicit state enum for menu, demo, intermission, and gameplay modes. The pattern has been standard since the 1980s because it works and costs nothing.

## Systems Thinking Connection

This app state machine is structurally identical to the Platformer path's player FSM (GROUNDED, AIRBORNE, DASHING). In the Robotics path, lifecycle nodes use the same pattern: UNCONFIGURED, INACTIVE, ACTIVE, FINALIZED. State machines are universal infrastructure.

## Skill Reinforcement

L7 introduced the turn pipeline. L56 built quest state machines. This lesson applies the same FSM pattern at the application level. L85 will integrate this menu flow into the beta milestone.

## Mastery Check

**Q:** Why does processMenuInput return the current state for invalid commands instead of printing an error?
**A:** Because the function is a pure state transition. Side effects (printing errors) belong in the render pass. The FSM decides state; the renderer decides what to show. Separation of concerns.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

// TODO: AppState processMenuInput(AppState current, const char* cmd)
// TITLE + "start" -> PLAYING
// PLAYING + "pause" -> PAUSED
// PAUSED + "resume" -> PLAYING
// PLAYING + "die" -> GAME_OVER
// else -> current (no change)

const char* stateName(AppState s){
    switch(s){
        case TITLE: return "TITLE";
        case PLAYING: return "PLAYING";
        case PAUSED: return "PAUSED";
        case GAME_OVER: return "GAME_OVER";
    }
    return "UNKNOWN";
}

int main(){
    AppState state = TITLE;
    cout<<"STATE|"<<stateName(state)<<endl;
    // TODO: transition with "start", "pause", "resume", "die"
    // Print STATE|name after each transition
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

AppState processMenuInput(AppState current, const char* cmd){
    if(current==TITLE && strcmp(cmd,"start")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"pause")==0) return PAUSED;
    if(current==PAUSED && strcmp(cmd,"resume")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"die")==0) return GAME_OVER;
    return current;
}

const char* stateName(AppState s){
    switch(s){
        case TITLE: return "TITLE";
        case PLAYING: return "PLAYING";
        case PAUSED: return "PAUSED";
        case GAME_OVER: return "GAME_OVER";
    }
    return "UNKNOWN";
}

int main(){
    AppState state=TITLE;
    cout<<"STATE|"<<stateName(state)<<endl;
    state=processMenuInput(state,"start");
    cout<<"STATE|"<<stateName(state)<<endl;
    state=processMenuInput(state,"pause");
    cout<<"STATE|"<<stateName(state)<<endl;
    state=processMenuInput(state,"resume");
    cout<<"STATE|"<<stateName(state)<<endl;
    state=processMenuInput(state,"die");
    cout<<"STATE|"<<stateName(state)<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial state is TITLE", expectedOutput: "STATE|TITLE", isPattern: false },
      { id: "t2", description: "Start transitions to PLAYING", expectedOutput: "STATE|PLAYING", isPattern: false },
      { id: "t3", description: "Pause transitions to PAUSED", expectedOutput: "STATE|PAUSED", isPattern: false },
      { id: "t4", description: "Die transitions to GAME_OVER", expectedOutput: "STATE|GAME_OVER", isPattern: false },
    ],
    hints: [
      "Each if-statement checks BOTH the current state AND the command string.",
      "Use strcmp(cmd, 'start') == 0 to compare C strings. Return the new state.",
      "if(current==TITLE && strcmp(cmd,'start')==0) return PLAYING; — repeat for each valid transition.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Full Menu Flow Simulation",
    type: "game_builder",
    instructions: `# Build: App State Machine

## Mental Model

A complete app state machine with TITLE, PLAYING, PAUSED, and GAME_OVER states. Simulate a full session: title screen → start game → pause → resume → die. Each transition prints the state name. Invalid transitions are ignored.

## Requirements

1. enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER }
2. processMenuInput(AppState, const char*) returns new state
3. Simulate: TITLE → start → pause → resume → die
4. Print MENU_FLOW|READY at start
5. Print each transition: TRANSITION|cmd|FROM → TO
6. Test invalid: "pause" from TITLE should not change state
7. Print MENU_FLOW|FINAL=GAME_OVER at end

## Expected Output
\`\`\`
MENU_FLOW|READY
TRANSITION|start|TITLE->PLAYING
TRANSITION|pause|PLAYING->PAUSED
TRANSITION|resume|PAUSED->PLAYING
TRANSITION|die|PLAYING->GAME_OVER
INVALID|pause|TITLE->TITLE
MENU_FLOW|FINAL=GAME_OVER
\`\`\``,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

// TODO: AppState processMenuInput(AppState current, const char* cmd)

const char* stateName(AppState s){
    switch(s){
        case TITLE: return "TITLE";
        case PLAYING: return "PLAYING";
        case PAUSED: return "PAUSED";
        case GAME_OVER: return "GAME_OVER";
    }
    return "UNKNOWN";
}

void doTransition(AppState& state, const char* cmd){
    AppState prev=state;
    state=processMenuInput(state,cmd);
    if(state!=prev){
        cout<<"TRANSITION|"<<cmd<<"|"<<stateName(prev)<<"->"<<stateName(state)<<endl;
    } else {
        cout<<"INVALID|"<<cmd<<"|"<<stateName(prev)<<"->"<<stateName(state)<<endl;
    }
}

int main(){
    cout<<"MENU_FLOW|READY"<<endl;
    AppState state=TITLE;
    // TODO: doTransition for start, pause, resume, die
    // Then test invalid: reset state to TITLE, try "pause"
    // Print MENU_FLOW|FINAL=stateName(state) at end
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

AppState processMenuInput(AppState current, const char* cmd){
    if(current==TITLE && strcmp(cmd,"start")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"pause")==0) return PAUSED;
    if(current==PAUSED && strcmp(cmd,"resume")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"die")==0) return GAME_OVER;
    return current;
}

const char* stateName(AppState s){
    switch(s){
        case TITLE: return "TITLE";
        case PLAYING: return "PLAYING";
        case PAUSED: return "PAUSED";
        case GAME_OVER: return "GAME_OVER";
    }
    return "UNKNOWN";
}

void doTransition(AppState& state, const char* cmd){
    AppState prev=state;
    state=processMenuInput(state,cmd);
    if(state!=prev){
        cout<<"TRANSITION|"<<cmd<<"|"<<stateName(prev)<<"->"<<stateName(state)<<endl;
    } else {
        cout<<"INVALID|"<<cmd<<"|"<<stateName(prev)<<"->"<<stateName(state)<<endl;
    }
}

int main(){
    cout<<"MENU_FLOW|READY"<<endl;
    AppState state=TITLE;
    doTransition(state,"start");
    doTransition(state,"pause");
    doTransition(state,"resume");
    doTransition(state,"die");
    AppState final_state=state;
    state=TITLE;
    doTransition(state,"pause");
    cout<<"MENU_FLOW|FINAL="<<stateName(final_state)<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "System ready", expectedOutput: "MENU_FLOW|READY", isPattern: false },
      { id: "g2", description: "Start transition", expectedOutput: "TRANSITION|start|TITLE->PLAYING", isPattern: false },
      { id: "g3", description: "Pause transition", expectedOutput: "TRANSITION|pause|PLAYING->PAUSED", isPattern: false },
      { id: "g4", description: "Resume transition", expectedOutput: "TRANSITION|resume|PAUSED->PLAYING", isPattern: false },
      { id: "g5", description: "Invalid transition ignored", expectedOutput: "INVALID|pause|TITLE->TITLE", isPattern: false },
      { id: "g6", description: "Final state", expectedOutput: "MENU_FLOW|FINAL=GAME_OVER", isPattern: false },
    ],
    hints: [
      "processMenuInput checks both current state AND command. Invalid combos return current state unchanged.",
      "doTransition compares prev and new state to decide TRANSITION vs INVALID.",
      "Save final_state before resetting to TITLE for the invalid test. Print MENU_FLOW|FINAL= with stateName(final_state).",
    ],
    estimatedMinutes: 14,
  },
};
