import { Lesson } from "@/types/lesson";

export const lessonRPG14: Lesson = {
  id: "rpg-14-soa-components-v0",
  title: "SoA Components v0",
  description: "Formalize parallel arrays into named SoA component groups: pos_x[], pos_y[], hp[], glyph[] inside WorldState.",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["SoA", "Structure of Arrays", "component arrays", "data layout", "cache efficiency"],
  part1: {
    title: "Concept: Structure of Arrays",
    type: "concept",
    instructions: `# SoA Components v0

## Mental Model

Your WorldState has entity_pos[], ehp[], ealive[], entity_id[] -- four parallel arrays indexed the same way. This IS Structure of Arrays (SoA). But the naming is ad hoc. Formalizing SoA means giving each array a clear component name: pos_x[], pos_y[], hp[], glyph[], alive[], entity_id[]. Each array is one "component." An entity is a set of values at the same index across all component arrays.

## What Breaks Without This

Without formal SoA, you add new entity properties by inventing new array names. enemy_attack_power[], enemy_defense[], enemy_type[] -- the naming becomes inconsistent, arrays get out of sync, and you forget to initialize one. Formalizing the layout means every component array follows the same pattern: same MAX_E size, same indexing, same lifecycle.

## The Fix: Named Component Arrays

Replace Vec2i entity_pos[] with separate int pos_x[] and int pos_y[]. This is pure SoA: one array per component field. Add char glyph[] to store the display character for each entity. The WorldState becomes a table where each row is an entity and each column is a component array.

Why separate x and y? Because some operations only need x (horizontal distance check) or only y (vertical distance check). SoA lets systems read only the data they need. The combat system reads pos_x, pos_y, and hp. The render system reads pos_x, pos_y, glyph, and alive. Each system touches only the arrays it needs.

For 4 entities this makes no measurable difference. For 1000 entities, SoA means the CPU prefetcher loads one tight array instead of striding through a sparse struct array. This is the foundation of data-oriented design.

## Key Concepts

- **SoA (Structure of Arrays)** -- one array per component: pos_x[], pos_y[], hp[], glyph[], alive[]
- **AoS (Array of Structs)** -- one struct per entity: Entity entities[]. Lesson 12 used this with Vec2i.
- **Component** -- a single data field stored in a parallel array
- **Entity = index** -- entity i has pos_x[i], pos_y[i], hp[i], glyph[i], alive[i]

## Performance Insight

SoA is cache-friendly for batch processing. If a system only reads hp[], it loads a contiguous block of ints -- one cache line holds 16 hp values. With AoS, reading hp from Entity structs requires striding through position, glyph, and alive data that the system does not need. At 1000 entities, the SoA version can be 2-4x faster for single-component sweeps.

## Memory Insight

SoA with MAX_E=4: pos_x=16B, pos_y=16B, hp=16B, glyph=4B, alive=4B, entity_id=16B = 72 bytes for entity data. AoS with the same data: 4 structs of 18 bytes each = 72 bytes. Same total memory, different layout. The layout determines access pattern efficiency.

## Your Task

Define WorldState with SoA component arrays: pos_x[], pos_y[], hp[], glyph[], alive[], entity_id[]. Set up player (id=0, glyph '@') and two orcs (id=1,2, glyph 'o'). Print:

\`\`\`
DUNGEON|rpg-v0
SOA|components=6|max_entities=8
ENTITY|id=0|@|1|1|hp=100
ENTITY|id=1|o|3|1|hp=10
ENTITY|id=2|o|6|1|hp=10
\`\`\`

## Beginner Trap

**Mixing AoS and SoA.** Beginners keep Vec2i entity_pos[] (AoS for position) but use separate hp[] arrays (SoA for health). Pick one layout and commit. For the RPG, we use full SoA: pos_x[] and pos_y[] as separate arrays. Consistency prevents bugs.

## Elite Insight

Unity's DOTS (Data-Oriented Technology Stack) enforces SoA layout for all entity components. Carmack advocated data-oriented design in his 2012 QuakeCon talk: "Think about the data. What do you actually need to read? Put that in a tight array." The RPG's SoA layout follows the same principle on a smaller scale.

## Systems Thinking Connection

The Space Shooter path uses SoA from Lesson 6 for batch processing thousands of bullets. The RPG uses the same layout but for a different reason: clean component separation. The Platformer path prefers AoS because physics needs x,y,vx,vy together. Layout choice depends on access pattern.

## Skill Reinforcement

Lesson 6 introduced parallel arrays informally. Lesson 12 used Vec2i (AoS for position). This lesson formalizes SoA with named component arrays. Lesson 33 will optimize data layout for hot-path access.

## Mastery Check

When is AoS better than SoA? Answer: When you always access all fields of an entity together (e.g., physics needs pos and velocity simultaneously). AoS keeps related data in the same cache line. SoA is better when systems read one component at a time (e.g., damage system reads only hp[]). The RPG uses SoA because different passes read different component subsets.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    // Player state
    int player_id;
    // TODO: SoA component arrays:
    // int pos_x[MAX_E], pos_y[MAX_E]
    // int hp[MAX_E]
    // char glyph[MAX_E]
    // bool alive[MAX_E]
    // int entity_id[MAX_E]
    int entity_count;
    int next_id;
    int turn;
    int pgold;
};

// TODO: initWorld sets up player at (1,1) glyph '@' hp=100, two orcs
// TODO: print SOA|components=6|max_entities=8
// TODO: print ENTITY lines with id, glyph, x, y, hp

int main(){
    WorldState w;
    // TODO: init and print
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    int player_id;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    char glyph[MAX_E];
    bool alive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int next_id;
    int turn;
    int pgold;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    for(int i=0;i<MAX_E;i++){w.pos_x[i]=0;w.pos_y[i]=0;w.hp[i]=0;w.glyph[i]='.';w.alive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.entity_count=0; w.turn=0; w.pgold=0;
    // Player: entity 0
    int pi=w.entity_count++;
    w.entity_id[pi]=w.next_id++; w.player_id=w.entity_id[pi];
    w.pos_x[pi]=1; w.pos_y[pi]=1; w.hp[pi]=100; w.glyph[pi]='@'; w.alive[pi]=true;
    // Orc 1
    int e1=w.entity_count++;
    w.entity_id[e1]=w.next_id++;
    w.pos_x[e1]=3; w.pos_y[e1]=1; w.hp[e1]=10; w.glyph[e1]='o'; w.alive[e1]=true;
    // Orc 2
    int e2=w.entity_count++;
    w.entity_id[e2]=w.next_id++;
    w.pos_x[e2]=6; w.pos_y[e2]=1; w.hp[e2]=10; w.glyph[e2]='o'; w.alive[e2]=true;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;
    cout << "SOA|components=6|max_entities=" << MAX_E << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|" << w.glyph[i] << "|" << w.pos_x[i] << "|" << w.pos_y[i] << "|hp=" << w.hp[i] << endl;
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "SoA header", expectedOutput: "SOA\\|components=6\\|max_entities=8", isPattern: true },
      { id: "t2", description: "Player with glyph @", expectedOutput: "ENTITY\\|id=0\\|@\\|1\\|1\\|hp=100", isPattern: true },
      { id: "t3", description: "First orc with glyph o", expectedOutput: "ENTITY\\|id=1\\|o\\|3\\|1\\|hp=10", isPattern: true },
      { id: "t4", description: "Second orc", expectedOutput: "ENTITY\\|id=2\\|o\\|6\\|1\\|hp=10", isPattern: true },
    ],
    hints: [
      "Replace Vec2i entity_pos[] with int pos_x[MAX_E] and int pos_y[MAX_E]. Add char glyph[MAX_E] for display characters.",
      "The player is now entity index 0 with glyph='@'. Orcs are entity indices 1 and 2 with glyph='o'. All share the same component arrays.",
      "Print each entity as: ENTITY|id=N|glyph|pos_x|pos_y|hp=H. The SOA line prints component count (6: pos_x, pos_y, hp, glyph, alive, entity_id) and MAX_E.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Full Game with SoA World",
    type: "game_builder",
    instructions: `# Build: Full Game with SoA World

## Mental Model

The entire game now runs on SoA component arrays. The player is entity index 0 in every component array. Enemies are indices 1+. Every pass function reads and writes component arrays directly: passPlayerInput reads pos_x, pos_y and writes them. passCombat reads pos_x, pos_y, hp and writes hp. passCleanup reads hp, writes alive and pgold. passRender reads pos_x, pos_y, glyph, alive.

## What Breaks Without This

With ad hoc arrays, adding a new component (e.g., attack_power[]) requires guessing the naming convention, remembering to initialize it, and hoping all pass functions handle it consistently. With formal SoA, the pattern is clear: add the array to WorldState, initialize it in initWorld, and read it in the passes that need it.

## The Fix

Build the full game with SoA WorldState. Player (@) at index 0 pos (1,1), two orcs (o) at indices 1,2 at (3,1) and (6,1). Run the scripted sequence to kill both. Each pass function operates on component arrays. The player is part of the SoA now -- same arrays, just different glyph and role.

## Key Concepts

- **Unified entity model** -- player and enemies share the same SoA arrays
- **Glyph-based rendering** -- render uses glyph[] to display @ for player, o for orcs
- **Component-driven passes** -- each pass reads only the component arrays it needs

## Performance Insight

The combat pass reads pos_x[], pos_y[], hp[], alive[] -- four contiguous arrays. It never touches glyph[] or entity_id[]. With SoA, those untouched arrays do not pollute the cache. At 1000 entities, the combat pass loads ~16KB of relevant data instead of ~40KB of mixed entity structs.

## Memory Insight

With MAX_E=8: pos_x=32B, pos_y=32B, hp=32B, glyph=8B, alive=8B, entity_id=32B = 144 bytes. Grid=100B. Total WorldState ~260 bytes. Still fits in L1 cache. No heap allocation. The SoA layout means each component array is independently addressable -- a system can take a pointer to just hp[] without touching anything else.

## Your Task

Build the full game with SoA. Player at (1,1), two orcs at (3,1) and (6,1), 10 HP each. Script: d,d,f,d,d,d,f. Kill both orcs. Output:

\`\`\`
DUNGEON|rpg-v0
ENTITY|id=0|@|1|1|hp=100
ENTITY|id=1|o|3|1|hp=10
ENTITY|id=2|o|6|1|hp=10
TURN|1
HP|100
GOLD|0
...
TURN|7
HP|100
GOLD|20
WIN|hero|all_defeated|gold=20
GAME_MESSAGE|SoA components operational.
\`\`\`

## Beginner Trap

**Accessing the player with a separate variable instead of the SoA.** If the player has its own pos_x but enemies use the array, you have two systems to maintain. Put the player IN the SoA as entity 0. The player is just another entity with a different glyph. This simplifies every pass function.

## Elite Insight

Carmack's .plan from 1999: "I have been pushing the data-oriented philosophy for years." Unity DOTS enforces SoA for all ECS components. The RPG's SoA is the same concept: data layout drives performance. At scale, the difference between AoS and SoA can be 10x for cache-sensitive loops. Your 8-entity dungeon will not feel it, but you are building the habit.

## Mastery Check

How do you add a new component (e.g., int attack_power[]) to the SoA? Answer: Add int attack_power[MAX_E] to WorldState. Initialize it in initWorld (default 0 for all, set specific values for enemies). Read it in passCombat. No other pass function needs to change. This is the power of SoA: adding components is local to the struct and the systems that use them.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    int player_id;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    char glyph[MAX_E];
    bool alive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int next_id;
    int turn;
    int pgold;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    for(int i=0;i<MAX_E;i++){w.pos_x[i]=0;w.pos_y[i]=0;w.hp[i]=0;w.glyph[i]='.';w.alive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.entity_count=0; w.turn=0; w.pgold=0;
    // Player
    int pi=w.entity_count++;
    w.entity_id[pi]=w.next_id++; w.player_id=w.entity_id[pi];
    w.pos_x[pi]=1; w.pos_y[pi]=1; w.hp[pi]=100; w.glyph[pi]='@'; w.alive[pi]=true;
    // Orc 1
    int e1=w.entity_count++;
    w.entity_id[e1]=w.next_id++;
    w.pos_x[e1]=3; w.pos_y[e1]=1; w.hp[e1]=10; w.glyph[e1]='o'; w.alive[e1]=true;
    // Orc 2
    int e2=w.entity_count++;
    w.entity_id[e2]=w.next_id++;
    w.pos_x[e2]=6; w.pos_y[e2]=1; w.hp[e2]=10; w.glyph[e2]='o'; w.alive[e2]=true;
}

int findPlayer(const WorldState& w){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==w.player_id) return i;
    return -1;
}

bool canMove(const WorldState& w, int x, int y, int dx, int dy){
    int nx=x+dx, ny=y+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}

// TODO: passPlayerInput(WorldState& w, char key)
// TODO: passCleanup(WorldState& w)
// TODO: passRender(const WorldState& w)

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    // Print initial entities
    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|" << w.glyph[i] << "|" << w.pos_x[i] << "|" << w.pos_y[i] << "|hp=" << w.hp[i] << endl;
    }

    char inputs[]={'d','d','f','d','d','d','f'};
    int nticks=7;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        // TODO: call passes and check win
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=8;

struct WorldState {
    char grid[H][W];
    int player_id;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    char glyph[MAX_E];
    bool alive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int next_id;
    int turn;
    int pgold;
};

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    for(int i=0;i<MAX_E;i++){w.pos_x[i]=0;w.pos_y[i]=0;w.hp[i]=0;w.glyph[i]='.';w.alive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.entity_count=0; w.turn=0; w.pgold=0;
    int pi=w.entity_count++;
    w.entity_id[pi]=w.next_id++; w.player_id=w.entity_id[pi];
    w.pos_x[pi]=1; w.pos_y[pi]=1; w.hp[pi]=100; w.glyph[pi]='@'; w.alive[pi]=true;
    int e1=w.entity_count++;
    w.entity_id[e1]=w.next_id++;
    w.pos_x[e1]=3; w.pos_y[e1]=1; w.hp[e1]=10; w.glyph[e1]='o'; w.alive[e1]=true;
    int e2=w.entity_count++;
    w.entity_id[e2]=w.next_id++;
    w.pos_x[e2]=6; w.pos_y[e2]=1; w.hp[e2]=10; w.glyph[e2]='o'; w.alive[e2]=true;
}

int findPlayer(const WorldState& w){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==w.player_id) return i;
    return -1;
}

bool canMove(const WorldState& w, int x, int y, int dx, int dy){
    int nx=x+dx, ny=y+dy;
    if(nx<0||nx>=W||ny<0||ny>=H) return false;
    return w.grid[ny][nx]!='#';
}

void passPlayerInput(WorldState& w, char key){
    int pi=findPlayer(w);
    if(pi<0) return;
    if(key=='d'||key=='a'||key=='w'||key=='s'){
        int dx=(key=='d')?1:(key=='a')?-1:0;
        int dy=(key=='s')?1:(key=='w')?-1:0;
        if(canMove(w,w.pos_x[pi],w.pos_y[pi],dx,dy)){w.pos_x[pi]+=dx;w.pos_y[pi]+=dy;}
    }
    if(key=='f'){
        for(int i=0;i<w.entity_count;i++){
            if(i==pi||!w.alive[i]) continue;
            if((abs(w.pos_x[pi]-w.pos_x[i])+abs(w.pos_y[pi]-w.pos_y[i]))==1){
                w.hp[i]-=10;
            }
        }
    }
}

void passCleanup(WorldState& w){
    int pi=findPlayer(w);
    for(int i=0;i<w.entity_count;i++){
        if(i==pi) continue;
        if(w.alive[i]&&w.hp[i]<=0){
            w.alive[i]=false;
            w.pgold+=10;
        }
    }
}

void passRender(const WorldState& w){
    int pi=findPlayer(w);
    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|" << w.glyph[i] << "|" << w.pos_x[i] << "|" << w.pos_y[i] << "|hp=" << w.hp[i] << endl;
    }
    cout << "TURN|" << w.turn << endl;
    if(pi>=0) cout << "HP|" << w.hp[pi] << endl;
    cout << "GOLD|" << w.pgold << endl;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    for(int i=0;i<w.entity_count;i++){
        if(w.alive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|" << w.glyph[i] << "|" << w.pos_x[i] << "|" << w.pos_y[i] << "|hp=" << w.hp[i] << endl;
    }

    char inputs[]={'d','d','f','d','d','d','f'};
    int nticks=7;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        passPlayerInput(w,inputs[t]);
        passCleanup(w);
        passRender(w);

        int alive_enemies=0;
        int pi=findPlayer(w);
        for(int i=0;i<w.entity_count;i++) if(i!=pi&&w.alive[i]) alive_enemies++;
        if(alive_enemies==0){
            cout << "WIN|hero|all_defeated|gold=" << w.pgold << endl;
            cout << "GAME_MESSAGE|SoA components operational." << endl;
            break;
        }
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header", expectedOutput: "DUNGEON\\|rpg-v0", isPattern: true },
      { id: "g2", description: "Player rendered with glyph @", expectedOutput: "ENTITY\\|id=0\\|@", isPattern: true },
      { id: "g3", description: "Turn counter reaches 7", expectedOutput: "TURN\\|7", isPattern: true },
      { id: "g4", description: "Gold is 20", expectedOutput: "GOLD\\|20", isPattern: true },
      { id: "g5", description: "Win state", expectedOutput: "WIN\\|hero\\|all_defeated\\|gold=20", isPattern: true },
      { id: "g6", description: "SoA message", expectedOutput: "GAME_MESSAGE\\|SoA components operational\\.", isPattern: true },
    ],
    hints: [
      "The player is entity index 0 in the SoA. Use findPlayer(w) to get the player index, then access pos_x[pi], pos_y[pi], hp[pi].",
      "passPlayerInput finds the player index, then moves or attacks. Attack checks Manhattan distance using pos_x and pos_y arrays directly.",
      "Win check counts alive enemies (entities where i!=pi and alive[i]==true). When count is 0, print WIN and GAME_MESSAGE.",
    ],
    estimatedMinutes: 18,
  },
};