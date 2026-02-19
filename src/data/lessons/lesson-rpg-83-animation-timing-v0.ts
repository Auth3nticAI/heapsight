import { Lesson } from "@/types/lesson";

export const lessonRPG83: Lesson = {
  id: "rpg-83-animation-timing-v0",
  title: "Animation Timing v0",
  description: "Simple frame toggle for player icon — alternate between @ and * based on tick parity. Timer-based visual state without heap.",
  order: 83,
  xpReward: 100,
  tier: "pro",
  concepts: ["animation timing", "tick parity", "visual state", "frame toggle", "deterministic rendering"],
  part1: {
    title: "Concept: Timer-Based Visual State",
    type: "concept",
    instructions: `# Animation Timing v0

## Mental Model

Your player sits on the grid as a static "@" symbol. It never changes. The game is alive — enemies move, combat resolves, the HUD updates — but the player icon is frozen. A simple tick-based toggle makes the character feel alive: alternate between two icons on even/odd ticks. No sprite sheets. No timers. Just parity.

## What Breaks Without This

\`\`\`cpp
// Every tick, the player is '@'. Always.
// The game looks static between inputs.
// Players wonder if their game froze.
// A blinking icon says: "I'm alive. I'm waiting for input."
\`\`\`

Static characters on a static grid look like a broken program, not a game. Even one alternating symbol adds life.

## The Fix: Tick Parity Toggle

The simplest animation: check if the tick number is even or odd.

\`\`\`cpp
char playerIcon(int tick) {
    return (tick % 2 == 0) ? '@' : '*';
}
\`\`\`

On even ticks, the player is "@". On odd ticks, "*". The icon blinks. The game breathes. This is the same pattern used for cursor blink in terminal editors — parity of a counter drives visual state.

This fits into the render pass. The game loop calls playerIcon(tick) during rendering. No state is mutated — the icon is a pure function of the tick counter.

## Key Concepts

- **Tick parity** — even/odd check on a counter drives visual alternation
- **Pure render function** — playerIcon() reads tick, returns char, mutates nothing
- **Deterministic animation** — same tick number always produces the same icon
- **Separation of concerns** — animation logic lives in the render pass, not game logic

## Performance Insight

A modulo operation and a ternary. One CPU cycle. This is the cheapest possible animation — no sprite lookup, no frame buffer, no memory access beyond the tick counter already on the stack.

## Memory Insight

Zero memory cost. The tick counter already exists in the game loop. The function returns a char on the stack. No allocations, no buffers, no state beyond what's already there.

## Beginner Trap

\`\`\`cpp
// BAD: Storing animation state separately
bool blink_on = true;
// ...each tick:
blink_on = !blink_on;
// This works, but adds state that must be saved/loaded.
// tick % 2 derives the same info from data you already have.
// Derive, don't store.
\`\`\`

## Elite Insight

Nethack's cursor blink uses the same pattern — a counter modulo drives visual state. The Commodore 64's blinking cursor toggled on VSYNC interrupt count parity. Miyamoto's original Mario had a 2-frame walk cycle driven by a frame counter modulo. The simplest animation in games has always been: counter % N.

## Systems Thinking Connection

In the Platformer path, animation cycles use the same tick-parity pattern for walk cycles. In the Robotics path, heartbeat LEDs blink on timer callbacks with the same even/odd logic. It's universal.

## Skill Reinforcement

L81 built the HUD. This lesson adds visual life to the player icon. L84 will add menu flow — the app state machine. L85 integrates everything into a beta milestone.

## Mastery Check

**Q:** Why use tick % 2 instead of a boolean that flips each frame?
**A:** Derived state is always better than stored state. tick % 2 requires no save/load, no initialization, no reset. It's a pure function of existing data. Stored booleans are extra state that can desync.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: char playerIcon(int tick)
// Return '@' if tick is even, '*' if tick is odd

int main(){
    // TODO: Print the icon for ticks 0 through 5
    // Format: TICK N|icon=X
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

char playerIcon(int tick){
    return (tick%2==0)?'@':'*';
}

int main(){
    for(int t=0;t<6;t++){
        cout<<"TICK "<<t<<"|icon="<<playerIcon(t)<<endl;
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "Even tick shows @", expectedOutput: "TICK 0|icon=@", isPattern: false },
      { id: "t2", description: "Odd tick shows *", expectedOutput: "TICK 1|icon=*", isPattern: false },
      { id: "t3", description: "Alternation continues", expectedOutput: "TICK 4|icon=@", isPattern: false },
    ],
    hints: [
      "Use the modulo operator: tick % 2 tells you even or odd.",
      "Return a char: (tick % 2 == 0) ? one_char : other_char.",
      "char playerIcon(int tick){ return (tick%2==0)?\'@\':\'*\'; }",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Animated Player Rendering",
    type: "game_builder",
    instructions: `# Build: Animated Player Icon

## Mental Model

A playerIcon() function that returns the appropriate character based on tick parity, integrated into a 6-tick render loop that shows the icon alternating.

## Requirements

1. playerIcon(int tick) returns '@' on even ticks, '*' on odd ticks
2. Print ANIM_SYSTEM|READY at start
3. Render 6 ticks (0-5), each line: RENDER|tick=N|player=X
4. Print ANIM_SYSTEM|FRAMES=6 at end

## Expected Output
\`\`\`
ANIM_SYSTEM|READY
RENDER|tick=0|player=@
RENDER|tick=1|player=*
RENDER|tick=2|player=@
RENDER|tick=3|player=*
RENDER|tick=4|player=@
RENDER|tick=5|player=*
ANIM_SYSTEM|FRAMES=6
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// TODO: char playerIcon(int tick)
// Even tick -> '@', odd tick -> '*'

int main(){
    cout<<"ANIM_SYSTEM|READY"<<endl;
    int total_frames=6;
    for(int t=0;t<total_frames;t++){
        // TODO: cout<<"RENDER|tick="<<t<<"|player="<<playerIcon(t)<<endl;
    }
    cout<<"ANIM_SYSTEM|FRAMES="<<total_frames<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

char playerIcon(int tick){
    return (tick%2==0)?'@':'*';
}

int main(){
    cout<<"ANIM_SYSTEM|READY"<<endl;
    int total_frames=6;
    for(int t=0;t<total_frames;t++){
        cout<<"RENDER|tick="<<t<<"|player="<<playerIcon(t)<<endl;
    }
    cout<<"ANIM_SYSTEM|FRAMES="<<total_frames<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "System ready", expectedOutput: "ANIM_SYSTEM|READY", isPattern: false },
      { id: "g2", description: "Tick 0 shows @", expectedOutput: "RENDER|tick=0|player=@", isPattern: false },
      { id: "g3", description: "Tick 1 shows *", expectedOutput: "RENDER|tick=1|player=*", isPattern: false },
      { id: "g4", description: "Tick 5 shows *", expectedOutput: "RENDER|tick=5|player=*", isPattern: false },
      { id: "g5", description: "Frame count", expectedOutput: "ANIM_SYSTEM|FRAMES=6", isPattern: false },
    ],
    hints: [
      "playerIcon just needs tick % 2 to decide which character to return.",
      "Call playerIcon(t) inside the loop and stream the result to cout.",
      "char playerIcon(int tick){ return (tick%2==0)?'@':'*'; } then cout<<'RENDER|tick='<<t<<'|player='<<playerIcon(t)<<endl;",
    ],
    estimatedMinutes: 10,
  },
};
