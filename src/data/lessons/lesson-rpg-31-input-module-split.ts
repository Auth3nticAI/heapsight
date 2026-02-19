import { Lesson } from "@/types/lesson";

export const lessonRPG31: Lesson = {
  id: "rpg-31-input-module-split",
  title: "Input Module Split",
  description: "Input parsing extracted into a pure function returning a Command struct — single responsibility for the input boundary.",
  order: 31,
  xpReward: 100,
  tier: "pro",
  concepts: ["single responsibility", "input module", "Command struct", "system boundary"],
  part1: {
    title: "Concept: Input as a Pure Module",
    type: "concept",
    instructions: `# Input Module Split

## Mental Model
Input is a system boundary. Raw keypresses are messy, platform-specific, and impossible to test. A clean input module converts raw characters into a structured \`Command\` — a plain-old-data struct with \`dx\`, \`dy\`, and \`attack\` fields. The rest of your game never touches raw input. It only sees Commands.

This is single responsibility: one module, one job. \`captureInput\` converts raw input to structured data. \`game_tick\` processes structured data. Neither knows about the other's internals.

## What Breaks Without This
Right now, input parsing is embedded inside \`game_tick\`:

\`\`\`cpp
int dx=(input=='d')?1:(input=='a')?-1:0;
int dy=(input=='s')?1:(input=='w')?-1:0;
\`\`\`

This means:
- You can't remap keys without editing game logic
- You can't replay inputs from a file without faking characters
- You can't unit-test input parsing separately from world simulation
- Every new input type (attack, inventory, menu) adds more parsing inside game_tick

After 5 more lessons, game_tick becomes an unreadable tangle of input checks and game logic. The fix is to split now, while it's cheap.

## The Fix: Command Struct + captureInput

Define a \`Command\` struct — pure data, no methods:

\`\`\`cpp
struct Command {
    int dx;
    int dy;
    bool attack;
};
\`\`\`

Write a pure function that converts a character to a Command:

\`\`\`cpp
Command captureInput(char c) {
    Command cmd = {0, 0, false};
    if (c == 'w') cmd.dy = -1;
    else if (c == 's') cmd.dy = 1;
    else if (c == 'a') cmd.dx = -1;
    else if (c == 'd') cmd.dx = 1;
    else if (c == 'f') cmd.attack = true;
    return cmd;
}
\`\`\`

Now \`game_tick\` takes a \`Command\` instead of a \`char\`. The input boundary is clean.

## Key Concepts
- Single responsibility: captureInput handles ONLY input conversion
- Command is a value type — copied, not referenced. No pointers, no heap.
- Pure function: same input always produces same Command. No side effects.
- System boundary: raw input enters here, structured data leaves here.

## Performance Insight
Command is 12 bytes (two ints + one bool + padding). It fits in a register pair on x86-64. Passing it by value is effectively free — no indirection, no cache miss. The compiler may even inline captureInput entirely, producing identical machine code to the inline version.

## Memory Insight
Command lives on the stack. It's created in main, passed to game_tick by value, and destroyed when the tick ends. Zero heap. Zero allocation. Gate A compliance is automatic because Command is a POD struct with no dynamic members.

## Your Task
Implement the \`captureInput\` function that converts a character to a Command struct. Process 5 inputs and print the Command data for each.

Expected output:
\`\`\`
CMD|dx=0|dy=-1|atk=0
CMD|dx=1|dy=0|atk=0
CMD|dx=0|dy=0|atk=1
CMD|dx=0|dy=0|atk=0
CMD|dx=0|dy=1|atk=0
\`\`\`

## Beginner Trap
**Parsing input inside game_tick with a giant if-else chain that mixes movement, attack, inventory, and menu inputs.** Every new feature adds more branches to game_tick. Within 10 lessons, game_tick is 200 lines of input parsing and 20 lines of actual game logic. The fix: captureInput handles ALL input parsing. game_tick sees only Commands.

## Elite Insight
Doom's input system converts raw key events into a \`ticcmd_t\` struct before the game loop ever sees them. The entire simulation runs on ticcmd — never on raw keys. This is why Doom can record and replay demos perfectly: the replay system stores ticcmd values, not raw input. Your Command struct follows the same pattern.

## Systems Thinking Connection
The Space Shooter path extracts input into a velocity command. The Platformer path extracts input into an intent struct. The Robotics path converts joystick input into a twist command. All four paths hit the same insight at the same phase: raw input must be converted to structured data at the system boundary. Different games, same engineering principle.

## Skill Reinforcement
Lesson 16 introduced the command queue concept. This lesson makes it concrete — Command is the actual data type that queue will hold. Lesson 32 will apply the same extraction to rendering. By Lesson 35, input, rendering, and game logic are three separate modules.

## Mastery Check
Question: Why does captureInput return a Command by value instead of taking a Command pointer?
Answer: Because Command is 12 bytes — smaller than a pointer + dereference on most platforms. Value semantics mean no aliasing, no null checks, no lifetime management. The compiler copies it in registers. Pointer semantics would add indirection for zero benefit at this size.`,
    starterCode: `#include <iostream>
using namespace std;

struct Command {
    int dx;
    int dy;
    bool attack;
};

// TODO: Implement captureInput(char c)
// Convert a raw input character to a Command struct:
// 'w' -> dy=-1 (move up)
// 's' -> dy=1  (move down)
// 'a' -> dx=-1 (move left)
// 'd' -> dx=1  (move right)
// 'f' -> attack=true
// Any other char -> all zeros (no-op command)

int main() {
    char inputs[] = {'w', 'd', 'f', 'x', 's'};
    int count = 5;

    for (int i = 0; i < count; i++) {
        Command cmd = captureInput(inputs[i]);
        cout << "CMD|dx=" << cmd.dx
             << "|dy=" << cmd.dy
             << "|atk=" << (cmd.attack ? 1 : 0) << endl;
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct Command {
    int dx;
    int dy;
    bool attack;
};

Command captureInput(char c) {
    Command cmd = {0, 0, false};
    if (c == 'w') cmd.dy = -1;
    else if (c == 's') cmd.dy = 1;
    else if (c == 'a') cmd.dx = -1;
    else if (c == 'd') cmd.dx = 1;
    else if (c == 'f') cmd.attack = true;
    return cmd;
}

int main() {
    char inputs[] = {'w', 'd', 'f', 'x', 's'};
    int count = 5;

    for (int i = 0; i < count; i++) {
        Command cmd = captureInput(inputs[i]);
        cout << "CMD|dx=" << cmd.dx
             << "|dy=" << cmd.dy
             << "|atk=" << (cmd.attack ? 1 : 0) << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Up command maps dy=-1", expectedOutput: "CMD|dx=0|dy=-1|atk=0", isPattern: false },
      { id: "t2", description: "Right command maps dx=1", expectedOutput: "CMD|dx=1|dy=0|atk=0", isPattern: false },
      { id: "t3", description: "Attack command maps atk=1", expectedOutput: "CMD|dx=0|dy=0|atk=1", isPattern: false },
    ],
    hints: [
      "Command is a POD struct with three fields: dx, dy, attack. Initialize all to zero/false, then set the one that matches the input character.",
      "Use an if/else if chain: check for 'w', 's', 'a', 'd', 'f'. Unknown characters leave the Command as all zeros — a no-op.",
      "Return the Command by value. The struct is 12 bytes — the compiler handles the copy in registers."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Input Module in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Input Module in the Game Loop

## Mental Model
Now wire captureInput into the real game loop. The pipeline becomes: raw char → captureInput → Command → game_tick. game_tick no longer knows what 'w' or 'd' means. It only sees dx, dy, and attack. This is the input module boundary in action.

## What Breaks Without This
If game_tick still takes a raw char, you can't swap input sources. Want to replay from a file? You'd need to convert file data to chars, feed them to game_tick, and hope the char-to-direction mapping inside game_tick matches. With Commands, replay just feeds Command values directly — no char conversion needed.

## The Fix: game_tick Takes Command
Change the game_tick signature from \`void game_tick(WorldState& w, char input)\` to \`void game_tick(WorldState& w, Command cmd)\`. Replace the inline dx/dy parsing with \`cmd.dx\` and \`cmd.dy\`. Print an INPUT line at the start of each tick to prove the module boundary is working.

## Key Concepts
- Pipeline: char → captureInput → Command → game_tick → WorldState mutation
- game_tick signature change: Command parameter replaces char
- INPUT trace line proves the command was parsed before entering game logic
- Enemy AI is unchanged — it reads WorldState, not input

## Performance Insight
The Command struct is passed by value. On x86-64, two ints and a bool fit in registers (rdi, rsi or similar ABI). The function call overhead is identical to passing three separate arguments. No memory allocation, no indirection.

## Memory Insight
The Command is created on the stack in main(), passed by value to game_tick(), and destroyed when game_tick returns. Total lifetime: one tick. No accumulation, no leaks, no fragmentation. Gate A compliance: zero allocations.

## Your Task
Refactor the game loop to use captureInput and pass Commands to game_tick. Run 5 ticks and verify the input module boundary is working.

Expected output:
\`\`\`
INPUT|tick=1|dx=1|dy=0|atk=0
INPUT|tick=2|dx=1|dy=0|atk=0
INPUT|tick=3|dx=0|dy=1|atk=0
INPUT|tick=4|dx=0|dy=1|atk=0
INPUT|tick=5|dx=1|dy=0|atk=0
PLAYER|x=4|y=3
ENEMY|x=4|y=5
\`\`\`

## Beginner Trap
**Calling captureInput inside game_tick instead of in main.** This defeats the purpose. The point is that main owns the pipeline: it calls captureInput, then passes the result to game_tick. game_tick never sees a raw character. If captureInput is inside game_tick, the module boundary doesn't exist.

## Elite Insight
Quake 3's client-server architecture sends \`usercmd_t\` structs over the network — never raw key events. The client converts keys to usercmd locally. The server processes usercmd without knowing what key produced it. Your Command struct is the same abstraction at a smaller scale. The lesson scales from single-player to networked without changing game_tick.

## Mastery Check
Question: If you wanted to add mouse aiming, what changes?
Answer: Only captureInput changes. It would read mouse data and set cmd.dx/dy based on mouse delta. game_tick doesn't change at all — it already processes dx/dy without knowing the source. That's the power of the module boundary.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

struct Command {
    int dx;
    int dy;
    bool attack;
};

// TODO: Implement captureInput(char c)

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

void init_world(WorldState& w, unsigned int seed){
    w={}; w.seed=seed; rng_seed(w.rng,seed);
    for(int y=0;y<H;y++) for(int x=0;x<W;x++)
        w.grid[y][x]=(y==0||y==H-1||x==0||x==W-1)?TILE_WALL:'.';
    w.pos_x[0]=1;w.pos_y[0]=1;w.hp[0]=30;w.alive[0]=true;
    w.pos_x[1]=5;w.pos_y[1]=5;w.hp[1]=10;w.alive[1]=true;
    w.entity_count=2;
}

// TODO: Change game_tick to accept Command instead of char
// Add INPUT trace: cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
void game_tick(WorldState& w, char input){
    w.turn++;
    int dx=(input=='d')?1:(input=='a')?-1:0;
    int dy=(input=='s')?1:(input=='w')?-1:0;
    int nx=w.pos_x[0]+dx,ny=w.pos_y[0]+dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        int edx=0;
        if(w.pos_x[i]<w.pos_x[0]) edx=1;
        else if(w.pos_x[i]>w.pos_x[0]) edx=-1;
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL)
            w.pos_x[i]=enx;
    }
}

int main(){
    WorldState w; init_world(w,42);
    char inputs[]={'d','d','s','s','d'};
    for(int i=0;i<5;i++){
        // TODO: Call captureInput, then pass Command to game_tick
        game_tick(w,inputs[i]);
    }
    cout<<"PLAYER|x="<<w.pos_x[0]<<"|y="<<w.pos_y[0]<<endl;
    cout<<"ENEMY|x="<<w.pos_x[1]<<"|y="<<w.pos_y[1]<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

struct Command {
    int dx;
    int dy;
    bool attack;
};

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1;
    else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1;
    else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    return cmd;
}

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

void init_world(WorldState& w, unsigned int seed){
    w={}; w.seed=seed; rng_seed(w.rng,seed);
    for(int y=0;y<H;y++) for(int x=0;x<W;x++)
        w.grid[y][x]=(y==0||y==H-1||x==0||x==W-1)?TILE_WALL:'.';
    w.pos_x[0]=1;w.pos_y[0]=1;w.hp[0]=30;w.alive[0]=true;
    w.pos_x[1]=5;w.pos_y[1]=5;w.hp[1]=10;w.alive[1]=true;
    w.entity_count=2;
}

void game_tick(WorldState& w, Command cmd){
    w.turn++;
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        int edx=0;
        if(w.pos_x[i]<w.pos_x[0]) edx=1;
        else if(w.pos_x[i]>w.pos_x[0]) edx=-1;
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL)
            w.pos_x[i]=enx;
    }
}

int main(){
    WorldState w; init_world(w,42);
    char inputs[]={'d','d','s','s','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
    }
    cout<<"PLAYER|x="<<w.pos_x[0]<<"|y="<<w.pos_y[0]<<endl;
    cout<<"ENEMY|x="<<w.pos_x[1]<<"|y="<<w.pos_y[1]<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Input module trace for tick 1", expectedOutput: "INPUT|tick=1|dx=1|dy=0|atk=0", isPattern: false },
      { id: "g2", description: "Vertical input parsed correctly", expectedOutput: "INPUT|tick=3|dx=0|dy=1|atk=0", isPattern: false },
      { id: "g3", description: "Player position after 5 ticks", expectedOutput: "PLAYER|x=4|y=3", isPattern: false },
      { id: "g4", description: "Enemy chases player on x-axis", expectedOutput: "ENEMY|x=4|y=5", isPattern: false },
      { id: "g5", description: "All 5 ticks processed", expectedOutput: "INPUT|tick=5|dx=1|dy=0|atk=0", isPattern: false },
    ],
    hints: [
      "captureInput takes a char and returns a Command. Use the same if/else chain from Part 1.",
      "Change game_tick signature from (WorldState& w, char input) to (WorldState& w, Command cmd). Replace dx/dy parsing with cmd.dx and cmd.dy.",
      "In main, call Command cmd = captureInput(inputs[i]) then game_tick(w, cmd). The pipeline is: char → Command → game_tick."
    ],
    estimatedMinutes: 12,
  },
};
