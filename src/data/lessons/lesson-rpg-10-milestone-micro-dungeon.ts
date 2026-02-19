import { Lesson } from "@/types/lesson";

export const lessonRPG10: Lesson = {
  id: "rpg-10-milestone-micro-dungeon",
  title: "Milestone: Micro Dungeon",
  description: "Move, fight, win. The complete tick pipeline: input, move, combat, cleanup, render. All passes in order.",
  order: 10,
  xpReward: 150,
  tier: "free",
  concepts: ["tick pipeline", "game loop", "win condition", "milestone integration", "deterministic simulation"],
  part1: {
    title: "Concept: Complete Tick Pipeline",
    type: "concept",
    instructions: `# Milestone: Micro Dungeon

## Mental Model

The tick pipeline is the complete sequence of passes that constitute one turn: input, intent, move player, move enemies, combat, cleanup, render. Each pass reads state left by the previous pass and writes state for the next. This is the architecture. Every future feature -- inventory, quests, save/load, replay -- plugs into this pipeline as a new pass or modifies an existing one. The pipeline is the game.

## What Breaks Without This

Without a complete pipeline, you have scattered if-statements. Movement is in one place, combat in another, rendering in a third. Adding a new feature means finding all the right places to insert code. Missing one creates bugs: the enemy renders at its old position, or the player attacks a dead entity. The pipeline eliminates this: every feature is a named pass with a defined position in the sequence.

## The Fix: Named Passes in Explicit Order

\`\`\`cpp
for (int turn = 0; turn < MAX_TURNS; turn++) {
    // Pass 1: Input
    int input = inputs[turn];

    // Pass 2: Move player
    movePlayer(input);

    // Pass 3: Move enemies
    moveEnemies();

    // Pass 4: Combat (if input == 5)
    if (input == 5) combatPass(0);

    // Pass 5: Cleanup dead entities
    cleanupPass();

    // Pass 6: Render
    renderGrid();

    // Pass 7: Win check
    if (entity_count == 1) { /* player wins */ break; }
}
\`\`\`

Each pass is a function. Each function operates on the shared entity arrays. The order is the architecture -- change the order, change the game.

## Key Concepts

- **Pipeline as architecture** -- the tick sequence defines game behavior. Adding features means adding passes, not editing existing ones.
- **Win condition** -- when entity_count drops to 1 (only player remains), the game is won. A data check, not a special flag.
- **Pass isolation** -- each pass reads from arrays and writes to arrays. No pass calls another pass. Main() is the scheduler.
- **Deterministic** -- same input array produces identical entity positions, combat results, and win timing every run.

## Performance Insight

A 6-turn game with 2 entities runs approximately 50 array operations per turn -- under 1 microsecond total. The pipeline overhead is zero. The architecture is not chosen for performance at this scale; it is chosen for correctness. Performance benefits emerge at scale (50+ entities) because passes sweep arrays contiguously.

## Memory Insight

The entire game state fits in: 4 entity arrays (1088 bytes), one grid (100 bytes), a few scalars (turn counter, entity_count, player gold). Total: under 1.5 KB. No heap. No dynamic allocation. Everything on the stack or in global arrays. This is the memory footprint of a complete turn-based RPG loop.

## Your Task

Review the full pipeline. Given the 6-turn input sequence [4, 4, 5, 5, 5, 5], trace through each pass. The player moves right twice (toward enemy at (5,1)), then attacks 3 times (HP 30 -> 20 -> 10 -> 0). Enemy dies on turn 5. Win on turn 5.

Expected key output lines:
\`\`\`
TICK|1|PASS:move|P:2,1|E:4,1
TICK|2|PASS:move|P:3,1|E:3,1
TICK|3|PASS:combat
HIT|0->|1|DMG:10|HP:20
TICK|4|PASS:combat
HIT|0->|1|DMG:10|HP:10
TICK|5|PASS:combat
HIT|0->|1|DMG:10|HP:0
DEATH|entity_1
WIN|all enemies defeated
TURN|5
HP|100
GOLD|0
GAME_MESSAGE|Micro dungeon complete! Player wins in 5 turns.
\`\`\`

Wait -- the enemy also chases each turn. Let me retrace:
- Start: P(1,1) E(5,1)
- Turn 1 input=4 (right): P moves to (2,1). E chases: 5>2, x-- to (4,1).
- Turn 2 input=4 (right): P moves to (3,1). E chases: 4>3, x-- to (3,1). OVERLAP.

The enemy overlaps the player. For this milestone, the chase AI skips movement if already adjacent (Manhattan dist <= 1). This prevents overlap and keeps the enemy next to the player for combat.

Revised with adjacency guard on chase:
- Start: P(1,1) E(5,1)
- Turn 1 input=4: P(2,1). E: dist=3, chase to (4,1). dist now 2.
- Turn 2 input=4: P(3,1). E: dist=1 (|4-3|+|1-1|=1), already adjacent, no move. E stays (4,1).
- Turn 3 input=5 (attack): No player move. E: adjacent, no move. Combat: adjacent, HIT. HP 30->20.
- Turn 4 input=5: Combat: HIT. HP 20->10.
- Turn 5 input=5: Combat: HIT. HP 10->0. DEATH. entity_count=1. WIN.

\`\`\`
TICK|1|P:2,1|E:4,1
TICK|2|P:3,1|E:4,1
TICK|3|P:3,1|E:4,1
HIT|0->|1|DMG:10|HP:20
TICK|4|P:3,1|E:4,1
HIT|0->|1|DMG:10|HP:10
TICK|5|P:3,1|E:4,1
HIT|0->|1|DMG:10|HP:0
DEATH|entity_1
WIN|all enemies defeated
\`\`\`

## Beginner Trap

**Adding the win check inside the combat pass.** If you check for win during combat, the cleanup pass hasn't run yet -- the dead entity is still in the array. entity_count is still 2. The win check must happen AFTER cleanup, when entity_count accurately reflects live entities. Pipeline order matters: combat, cleanup, then win check.

## Elite Insight

The original Rogue (1980) uses exactly this pipeline: input, move player, move monsters, resolve combat, remove dead, redraw screen, check win/loss. Nethack, Angband, DCSS -- all classic roguelikes follow the same turn pipeline. It's been the standard architecture for 45 years because it is correct, debuggable, and deterministic. You just built the same thing.

## Systems Thinking Connection

This complete tick pipeline maps to the Space Shooter's frame loop: input, physics, collision, cleanup, render. Both paths enforce strict pass ordering. The Platformer path adds an accumulator for sub-frame physics steps. The Robotics path's executor callback chain is the same pattern: ordered processing stages with no interleaving.

## Skill Reinforcement

This milestone integrates every concept from lessons 1-9: grid rendering (L1-2), input/intent (L3-4), collision (L5), entity arrays (L6), turn pipeline (L7), combat (L8), and death/cleanup (L9). Phase 2 (lessons 11-20) will extract this into structs, headers, and a proper World state.

## Mastery Check

If you add a new pass (e.g., status effects that tick down each turn), where does it go in the pipeline? After combat and before cleanup. Status effects modify HP (poison damage), so they run after combat (which also modifies HP). Cleanup removes entities with HP <= 0, so it must run after all HP-modifying passes. The pipeline dictates: combat -> status effects -> cleanup -> render.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10;
const int MAX_ENTITIES = 64;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x,int y,int hp,char glyph){
    entity_x[entity_count]=x;entity_y[entity_count]=y;
    entity_hp[entity_count]=hp;entity_glyph[entity_count]=glyph;
    entity_count++;
}

bool isAdjacent(int x1,int y1,int x2,int y2){
    int dx=x1-x2;int dy=y1-y2;
    if(dx<0)dx=-dx;if(dy<0)dy=-dy;
    return(dx+dy)==1;
}

void movePlayer(int input){
    if(input==4)entity_x[0]++;
    if(input==6)entity_x[0]--;
    if(input==8)entity_y[0]--;
    if(input==2)entity_y[0]++;
}

void moveEnemies(){
    for(int i=1;i<entity_count;i++){
        if(isAdjacent(entity_x[i],entity_y[i],entity_x[0],entity_y[0]))continue;
        if(entity_x[i]>entity_x[0])entity_x[i]--;
        else if(entity_x[i]<entity_x[0])entity_x[i]++;
        else if(entity_y[i]>entity_y[0])entity_y[i]--;
        else if(entity_y[i]<entity_y[0])entity_y[i]++;
    }
}

void combatPass(int attacker){
    for(int i=0;i<entity_count;i++){
        if(i==attacker)continue;
        if(isAdjacent(entity_x[attacker],entity_y[attacker],entity_x[i],entity_y[i])){
            entity_hp[i]-=10;
            cout<<"HIT|"<<attacker<<"->|"<<i<<"|DMG:10|HP:"<<entity_hp[i]<<endl;
            return;
        }
    }
    cout<<"MISS|no adjacent target"<<endl;
}

void cleanupPass(){
    for(int i=entity_count-1;i>=1;i--){
        if(entity_hp[i]<=0){
            cout<<"DEATH|entity_"<<i<<endl;
            int last=entity_count-1;
            entity_x[i]=entity_x[last];entity_y[i]=entity_y[last];
            entity_hp[i]=entity_hp[last];entity_glyph[i]=entity_glyph[last];
            entity_count--;
        }
    }
}

int main(){
    spawnEntity(1,1,100,'@');
    spawnEntity(5,1,30,'E');

    int inputs[]={4,4,5,5,5,5};
    int num_turns=6;
    bool won=false;

    for(int t=0;t<num_turns;t++){
        int input=inputs[t];
        if(input!=5) movePlayer(input);
        moveEnemies();
        if(input==5) combatPass(0);
        // TODO: Call cleanupPass()
        // TODO: Print TICK line: TICK|N|P:x,y|E:x,y (if enemy alive)
        // TODO: Check win condition: if entity_count==1, print WIN|all enemies defeated, set won=true, break
    }

    cout<<"TURN|"<<(won?5:num_turns)<<endl;
    cout<<"HP|"<<entity_hp[0]<<endl;
    cout<<"GOLD|0"<<endl;
    if(won) cout<<"GAME_MESSAGE|Micro dungeon complete! Player wins in 5 turns."<<endl;
    else cout<<"GAME_MESSAGE|Dungeon not cleared."<<endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10;
const int MAX_ENTITIES = 64;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x,int y,int hp,char glyph){
    entity_x[entity_count]=x;entity_y[entity_count]=y;
    entity_hp[entity_count]=hp;entity_glyph[entity_count]=glyph;
    entity_count++;
}

bool isAdjacent(int x1,int y1,int x2,int y2){
    int dx=x1-x2;int dy=y1-y2;
    if(dx<0)dx=-dx;if(dy<0)dy=-dy;
    return(dx+dy)==1;
}

void movePlayer(int input){
    if(input==4)entity_x[0]++;
    if(input==6)entity_x[0]--;
    if(input==8)entity_y[0]--;
    if(input==2)entity_y[0]++;
}

void moveEnemies(){
    for(int i=1;i<entity_count;i++){
        if(isAdjacent(entity_x[i],entity_y[i],entity_x[0],entity_y[0]))continue;
        if(entity_x[i]>entity_x[0])entity_x[i]--;
        else if(entity_x[i]<entity_x[0])entity_x[i]++;
        else if(entity_y[i]>entity_y[0])entity_y[i]--;
        else if(entity_y[i]<entity_y[0])entity_y[i]++;
    }
}

void combatPass(int attacker){
    for(int i=0;i<entity_count;i++){
        if(i==attacker)continue;
        if(isAdjacent(entity_x[attacker],entity_y[attacker],entity_x[i],entity_y[i])){
            entity_hp[i]-=10;
            cout<<"HIT|"<<attacker<<"->|"<<i<<"|DMG:10|HP:"<<entity_hp[i]<<endl;
            return;
        }
    }
    cout<<"MISS|no adjacent target"<<endl;
}

void cleanupPass(){
    for(int i=entity_count-1;i>=1;i--){
        if(entity_hp[i]<=0){
            cout<<"DEATH|entity_"<<i<<endl;
            int last=entity_count-1;
            entity_x[i]=entity_x[last];entity_y[i]=entity_y[last];
            entity_hp[i]=entity_hp[last];entity_glyph[i]=entity_glyph[last];
            entity_count--;
        }
    }
}

int main(){
    spawnEntity(1,1,100,'@');
    spawnEntity(5,1,30,'E');

    int inputs[]={4,4,5,5,5,5};
    int num_turns=6;
    bool won=false;
    int final_turn=0;

    for(int t=0;t<num_turns;t++){
        int input=inputs[t];
        if(input!=5) movePlayer(input);
        moveEnemies();
        if(input==5) combatPass(0);
        cleanupPass();

        cout<<"TICK|"<<(t+1)<<"|P:"<<entity_x[0]<<","<<entity_y[0];
        if(entity_count>1)cout<<"|E:"<<entity_x[1]<<","<<entity_y[1];
        cout<<endl;

        final_turn=t+1;
        if(entity_count==1){
            cout<<"WIN|all enemies defeated"<<endl;
            won=true;
            break;
        }
    }

    cout<<"TURN|"<<final_turn<<endl;
    cout<<"HP|"<<entity_hp[0]<<endl;
    cout<<"GOLD|0"<<endl;
    if(won) cout<<"GAME_MESSAGE|Micro dungeon complete! Player wins in "<<final_turn<<" turns."<<endl;
    else cout<<"GAME_MESSAGE|Dungeon not cleared."<<endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Tick 1 shows player moved right",
        expectedOutput: "TICK\\|1\\|P:2,1\\|E:4,1",
        isPattern: true,
      },
      {
        id: "t2",
        description: "HIT with damage applied",
        expectedOutput: "HIT\\|0->\\|1\\|DMG:10",
        isPattern: true,
      },
      {
        id: "t3",
        description: "DEATH event fires",
        expectedOutput: "DEATH\\|entity_1",
        isPattern: true,
      },
      {
        id: "t4",
        description: "WIN message",
        expectedOutput: "WIN\\|all enemies defeated",
        isPattern: true,
      },
      {
        id: "t5",
        description: "Player wins in 5 turns",
        expectedOutput: "GAME_MESSAGE\\|Micro dungeon complete! Player wins in 5 turns\\.",
        isPattern: true,
      },
    ],
    hints: [
      "Call cleanupPass() after combatPass. Then print the TICK line. Then check if entity_count == 1 for win.",
      "The TICK line: cout<<TICK|<<(t+1)<<|P:<<entity_x[0]<<,<<entity_y[0]; if(entity_count>1) add enemy position.",
      "Win check: if(entity_count==1){ cout<<WIN|all enemies defeated<<endl; won=true; break; }",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Build: Micro Dungeon",
    type: "game_builder",
    instructions: `# Build: Micro Dungeon

## Mental Model

The complete micro dungeon: a 10x10 room with walls, a player, an enemy, movement, combat, death, and a win condition. All systems working together through the tick pipeline. This is a playable game.

## What Breaks Without This

Without all systems integrated, the game is incomplete: movement without combat, or combat without death, or death without a win condition. Each system alone is trivial. The value is in the composition -- all passes running in order, producing a coherent game experience from simple data operations.

## The Fix: Full Pipeline with Grid Rendering

Run 6 turns. Player moves toward enemy, attacks when adjacent, kills enemy, wins. The grid renders each turn showing entity positions. The DUNGEON header, GRID_ROW lines, ENTITY lines, TICK lines, HIT/DEATH events, and WIN/GAME_MESSAGE lines together form the complete game output.

## Key Concepts

- **Complete pipeline** -- input, move, AI, combat, cleanup, render, win-check. Seven passes per turn.
- **Win condition as data check** -- entity_count == 1 means all enemies are dead. No special flag needed.
- **Grid as visual proof** -- the grid shows entity positions each turn. The student can see the game play out.
- **Deterministic playthrough** -- the input array is fixed. The same array always produces the same game.

## Performance Insight

The full pipeline with grid rendering is approximately 200 array operations per turn. A 6-turn game totals 1200 operations -- under 10 microseconds on modern hardware. The entire micro dungeon runs in less time than a single frame of a 60fps game.

## Memory Insight

Total memory: entity arrays (1088 bytes) + grid (100 bytes) + input array (24 bytes) + scalars (32 bytes) = ~1.25 KB. The complete RPG game loop fits in a fraction of one cache page. No heap allocation anywhere.

## Your Task

Build the complete micro dungeon. Player at (1,1) HP:100. Enemy at (5,1) HP:30. Inputs: [4,4,5,5,5,5]. Run the full pipeline with grid rendering each turn. Show DUNGEON header, GRID_ROW lines, ENTITY lines, TICK lines, HIT/DEATH/WIN events.

Expected output includes:
\`\`\`
DUNGEON|rpg-v0
GRID_ROW|0|##########
GRID_ROW|1|#.@..E...#
TICK|1|P:2,1|E:4,1
TICK|2|P:3,1|E:4,1
TICK|3|P:3,1|E:4,1
HIT|0->|1|DMG:10|HP:20
TICK|4|P:3,1|E:4,1
HIT|0->|1|DMG:10|HP:10
TICK|5|P:3,1|E:4,1
HIT|0->|1|DMG:10|HP:0
DEATH|entity_1
WIN|all enemies defeated
TURN|5
HP|100
GOLD|0
GAME_MESSAGE|Micro dungeon complete! Player wins in 5 turns.
\`\`\`

## Beginner Trap

**Printing the grid after the win check breaks out of the loop.** If you break before rendering, the final turn's grid is never shown. Render before the win check, or render inside the win message. Pipeline order: combat -> cleanup -> render -> win check.

## Elite Insight

This micro dungeon is structurally identical to the core loop of Nethack, DCSS (Dungeon Crawl Stone Soup), and Brogue. All classic roguelikes: one room, grid-based, turn-by-turn, deterministic. The difference is content scale -- they have hundreds of rooms, hundreds of entity types, thousands of items. But the pipeline is the same. You just built the foundation that every classic roguelike shares.

## Mastery Check

If you wanted to add a second enemy at (1,5) HP:20, what changes? Just one line: spawnEntity(1,5,20,'E'). The moveEnemies pass already iterates all entities. The combat pass already checks all entities for adjacency. The cleanup pass already removes any entity with HP<=0. The win check already tests entity_count==1. All systems handle multiple enemies by design. The pipeline scales without modification.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10;
const int MAX_ENTITIES=64;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count=0;

void spawnEntity(int x,int y,int hp,char glyph){
    entity_x[entity_count]=x;entity_y[entity_count]=y;
    entity_hp[entity_count]=hp;entity_glyph[entity_count]=glyph;
    entity_count++;
}

bool isAdjacent(int x1,int y1,int x2,int y2){
    int dx=x1-x2;int dy=y1-y2;
    if(dx<0)dx=-dx;if(dy<0)dy=-dy;
    return(dx+dy)==1;
}

void movePlayer(int input){
    if(input==4)entity_x[0]++;
    if(input==6)entity_x[0]--;
    if(input==8)entity_y[0]--;
    if(input==2)entity_y[0]++;
}

void moveEnemies(){
    for(int i=1;i<entity_count;i++){
        if(isAdjacent(entity_x[i],entity_y[i],entity_x[0],entity_y[0]))continue;
        if(entity_x[i]>entity_x[0])entity_x[i]--;
        else if(entity_x[i]<entity_x[0])entity_x[i]++;
        else if(entity_y[i]>entity_y[0])entity_y[i]--;
        else if(entity_y[i]<entity_y[0])entity_y[i]++;
    }
}

void combatPass(int attacker){
    for(int i=0;i<entity_count;i++){
        if(i==attacker)continue;
        if(isAdjacent(entity_x[attacker],entity_y[attacker],entity_x[i],entity_y[i])){
            entity_hp[i]-=10;
            cout<<"HIT|"<<attacker<<"->|"<<i<<"|DMG:10|HP:"<<entity_hp[i]<<endl;
            return;
        }
    }
    cout<<"MISS|no adjacent target"<<endl;
}

void cleanupPass(){
    for(int i=entity_count-1;i>=1;i--){
        if(entity_hp[i]<=0){
            cout<<"DEATH|entity_"<<i<<endl;
            int last=entity_count-1;
            entity_x[i]=entity_x[last];entity_y[i]=entity_y[last];
            entity_hp[i]=entity_hp[last];entity_glyph[i]=entity_glyph[last];
            entity_count--;
        }
    }
}

void renderGrid(){
    char grid[H][W];
    for(int y=0;y<H;y++)for(int x=0;x<W;x++)grid[y][x]='.';
    for(int x=0;x<W;x++){grid[0][x]='#';grid[H-1][x]='#';}
    for(int y=0;y<H;y++){grid[y][0]='#';grid[y][W-1]='#';}
    for(int i=0;i<entity_count;i++){
        grid[entity_y[i]][entity_x[i]]=entity_glyph[i];
    }
    for(int y=0;y<H;y++){
        cout<<"GRID_ROW|"<<y<<"|";
        for(int x=0;x<W;x++)cout<<grid[y][x];
        cout<<endl;
    }
}

int main(){
    spawnEntity(1,1,100,'@');
    spawnEntity(5,1,30,'E');

    int inputs[]={4,4,5,5,5,5};
    int num_turns=6;
    bool won=false;
    int final_turn=0;

    cout<<"DUNGEON|rpg-v0"<<endl;

    for(int t=0;t<num_turns;t++){
        int input=inputs[t];

        // TODO: Complete the pipeline:
        // 1. Move player (if input != 5)
        // 2. Move enemies
        // 3. Combat (if input == 5)
        // 4. Cleanup dead entities
        // 5. Render grid
        // 6. Print TICK line
        // 7. Check win: if entity_count==1, print WIN, set won=true, break

        final_turn=t+1;
    }

    cout<<"TURN|"<<final_turn<<endl;
    cout<<"HP|"<<entity_hp[0]<<endl;
    cout<<"GOLD|0"<<endl;
    if(won)cout<<"GAME_MESSAGE|Micro dungeon complete! Player wins in "<<final_turn<<" turns."<<endl;
    else cout<<"GAME_MESSAGE|Dungeon not cleared."<<endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10;
const int MAX_ENTITIES=64;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count=0;

void spawnEntity(int x,int y,int hp,char glyph){
    entity_x[entity_count]=x;entity_y[entity_count]=y;
    entity_hp[entity_count]=hp;entity_glyph[entity_count]=glyph;
    entity_count++;
}

bool isAdjacent(int x1,int y1,int x2,int y2){
    int dx=x1-x2;int dy=y1-y2;
    if(dx<0)dx=-dx;if(dy<0)dy=-dy;
    return(dx+dy)==1;
}

void movePlayer(int input){
    if(input==4)entity_x[0]++;
    if(input==6)entity_x[0]--;
    if(input==8)entity_y[0]--;
    if(input==2)entity_y[0]++;
}

void moveEnemies(){
    for(int i=1;i<entity_count;i++){
        if(isAdjacent(entity_x[i],entity_y[i],entity_x[0],entity_y[0]))continue;
        if(entity_x[i]>entity_x[0])entity_x[i]--;
        else if(entity_x[i]<entity_x[0])entity_x[i]++;
        else if(entity_y[i]>entity_y[0])entity_y[i]--;
        else if(entity_y[i]<entity_y[0])entity_y[i]++;
    }
}

void combatPass(int attacker){
    for(int i=0;i<entity_count;i++){
        if(i==attacker)continue;
        if(isAdjacent(entity_x[attacker],entity_y[attacker],entity_x[i],entity_y[i])){
            entity_hp[i]-=10;
            cout<<"HIT|"<<attacker<<"->|"<<i<<"|DMG:10|HP:"<<entity_hp[i]<<endl;
            return;
        }
    }
    cout<<"MISS|no adjacent target"<<endl;
}

void cleanupPass(){
    for(int i=entity_count-1;i>=1;i--){
        if(entity_hp[i]<=0){
            cout<<"DEATH|entity_"<<i<<endl;
            int last=entity_count-1;
            entity_x[i]=entity_x[last];entity_y[i]=entity_y[last];
            entity_hp[i]=entity_hp[last];entity_glyph[i]=entity_glyph[last];
            entity_count--;
        }
    }
}

void renderGrid(){
    char grid[H][W];
    for(int y=0;y<H;y++)for(int x=0;x<W;x++)grid[y][x]='.';
    for(int x=0;x<W;x++){grid[0][x]='#';grid[H-1][x]='#';}
    for(int y=0;y<H;y++){grid[y][0]='#';grid[y][W-1]='#';}
    for(int i=0;i<entity_count;i++){
        grid[entity_y[i]][entity_x[i]]=entity_glyph[i];
    }
    for(int y=0;y<H;y++){
        cout<<"GRID_ROW|"<<y<<"|";
        for(int x=0;x<W;x++)cout<<grid[y][x];
        cout<<endl;
    }
}

int main(){
    spawnEntity(1,1,100,'@');
    spawnEntity(5,1,30,'E');

    int inputs[]={4,4,5,5,5,5};
    int num_turns=6;
    bool won=false;
    int final_turn=0;

    cout<<"DUNGEON|rpg-v0"<<endl;

    for(int t=0;t<num_turns;t++){
        int input=inputs[t];
        if(input!=5) movePlayer(input);
        moveEnemies();
        if(input==5) combatPass(0);
        cleanupPass();
        renderGrid();

        cout<<"TICK|"<<(t+1)<<"|P:"<<entity_x[0]<<","<<entity_y[0];
        if(entity_count>1)cout<<"|E:"<<entity_x[1]<<","<<entity_y[1];
        cout<<endl;

        final_turn=t+1;
        if(entity_count==1){
            cout<<"WIN|all enemies defeated"<<endl;
            won=true;
            break;
        }
    }

    cout<<"TURN|"<<final_turn<<endl;
    cout<<"HP|"<<entity_hp[0]<<endl;
    cout<<"GOLD|0"<<endl;
    if(won)cout<<"GAME_MESSAGE|Micro dungeon complete! Player wins in "<<final_turn<<" turns."<<endl;
    else cout<<"GAME_MESSAGE|Dungeon not cleared."<<endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "DUNGEON header present",
        expectedOutput: "DUNGEON\\|rpg-v0",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Grid rows rendered",
        expectedOutput: "GRID_ROW\\|0\\|##########",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Tick 1 shows positions",
        expectedOutput: "TICK\\|1\\|P:2,1\\|E:4,1",
        isPattern: true,
      },
      {
        id: "g4",
        description: "HIT event with damage",
        expectedOutput: "HIT\\|0->\\|1\\|DMG:10",
        isPattern: true,
      },
      {
        id: "g5",
        description: "DEATH event",
        expectedOutput: "DEATH\\|entity_1",
        isPattern: true,
      },
      {
        id: "g6",
        description: "WIN condition met",
        expectedOutput: "WIN\\|all enemies defeated",
        isPattern: true,
      },
      {
        id: "g7",
        description: "HP reported",
        expectedOutput: "HP\\|100",
        isPattern: true,
      },
      {
        id: "g8",
        description: "GOLD reported",
        expectedOutput: "GOLD\\|0",
        isPattern: true,
      },
      {
        id: "g9",
        description: "Game complete message",
        expectedOutput: "GAME_MESSAGE\\|Micro dungeon complete!",
        isPattern: true,
      },
    ],
    hints: [
      "The pipeline inside the loop is: movePlayer (if not attack), moveEnemies, combatPass (if attack), cleanupPass, renderGrid, print TICK, check win.",
      "Use input==5 to decide combat: if(input==5) combatPass(0); -- input 5 means attack/wait.",
      "Win check: if(entity_count==1){ cout<<WIN|all enemies defeated<<endl; won=true; break; } -- after renderGrid and TICK.",
    ],
    estimatedMinutes: 20,
  },
};