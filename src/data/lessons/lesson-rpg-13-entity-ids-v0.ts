import { Lesson } from "@/types/lesson";

export const lessonRPG13: Lesson = {
  id: "rpg-13-entity-ids-v0",
  title: "Entity IDs v0",
  description: "Use integer IDs instead of raw array indices to reference entities. player_id=0, enemies get sequential IDs.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity ID", "ID lookup", "indirection", "stable references", "data integrity"],
  part1: {
    title: "Concept: Entity IDs",
    type: "concept",
    instructions: `# Entity IDs v0

## Mental Model

Right now, the player is "the entity at index 0 in the entity arrays" and the orc is "the entity at index 1." If you remove entity 0, entity 1 shifts to index 0. Every reference breaks. Integer IDs fix this: player_id=0 always means the player, regardless of where it sits in the array. The ID is a stable name. The index is a fragile position.

## What Breaks Without This

Kill the player's companion (entity 1). Shift all entities down. Now entity 2 (the orc) is at index 1. Your combat system targets "entity 1" -- it hits the orc instead of the (dead) companion. The wrong entity takes damage. IDs that equal array indices break when entities are removed.

## The Fix: Integer Entity IDs

Add an entity_id[] array to WorldState. Each entity gets a unique ID at spawn time. The player gets id=0, the first enemy gets id=1, etc. A next_id counter increments with each spawn. To find an entity by ID, scan the array: findEntityByID(world, id) returns the index, or -1 if not found.

This is simple linear search. For 4 entities, it is instant. For 100 entities, it is still fast. For 10,000, you would use a hash map -- but that is Lesson 73. Start simple. The ID concept is what matters, not the lookup speed.

The key insight: IDs are data references. They point to entities the way file paths point to files. The ID does not change when the entity moves, takes damage, or gets shuffled in the array.

## Key Concepts

- **Entity ID** -- a unique integer assigned at spawn, never reused (in this version)
- **ID vs index** -- ID is stable identity; index is current array position
- **Lookup function** -- findEntityByID scans entity_id[] and returns the index
- **next_id counter** -- monotonically increasing, ensures uniqueness

## Performance Insight

Linear scan over 4 entities: 4 comparisons. Over MAX_E=4 with branch prediction, this is a single cache line read. The cost is negligible compared to the safety it provides. In production engines, entity IDs use generation counters and slot maps for O(1) lookup -- we will explore this in later lessons.

## Memory Insight

entity_id[MAX_E] adds 16 bytes (4 ints) to WorldState. next_id adds 4 bytes. Total overhead: 20 bytes for stable entity references. The IDs are stored alongside other entity data in the same cache lines. No heap allocation, no pointers, no indirection beyond a simple array scan.

## Your Task

Add entity_id[] and next_id to WorldState. Assign player_id=0, spawn two enemies with id=1 and id=2. Write findEntityByID that returns the array index. Print:

\`\`\`
DUNGEON|rpg-v0
ENTITY|id=0|hero|player|24|24|24|24
ENTITY|id=1|orc|enemy|72|24|24|24
ENTITY|id=2|orc|enemy|144|24|24|24
LOOKUP|id=0|index=0
LOOKUP|id=2|index=2
LOOKUP|id=99|index=-1
\`\`\`

## Beginner Trap

**Using the array index as the ID.** If entity_id[i] == i always, the ID adds nothing. IDs must be independent of position. When an entity is removed and the array compacts, entity_id[i] != i -- and your code must handle this. The ID is permanent; the index is transient.

## Elite Insight

Diablo 2 assigns every item, monster, and missile a unique 32-bit ID. The ID persists across save/load. When you hover over a dropped item, the game looks up the ID -- not the position, not the array index. Nethack uses object IDs for the same reason. FromSoftware's Dark Souls tracks entity IDs for network synchronization -- the host and client must agree on which entity has which ID.

## Systems Thinking Connection

Entity IDs are the RPG equivalent of ROS2 node names or the Space Shooter's entity indices in ECS. The principle is universal: give each thing a stable name so you can refer to it without knowing its storage location. In databases, this is a primary key. In filesystems, this is an inode number.

## Skill Reinforcement

Lesson 12 introduced Vec2i for typed coordinates. This lesson adds entity IDs for stable references. Lesson 14 will formalize the parallel arrays into named SoA component groups. Lesson 27 will use IDs for item references in inventory.

## Mastery Check

Why must entity IDs never be reused (in this version)? Answer: If you reuse ID 1 for a new entity after the old one dies, any code still referencing "entity 1" now points to the wrong entity. Generation counters (Lesson 17) solve this by pairing an ID with a generation number, but for now, monotonically increasing IDs are the simplest safe approach.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct Vec2i { int x; int y; };

struct WorldState {
    char grid[H][W];
    Vec2i player_pos;
    int php, pgold;
    Vec2i entity_pos[MAX_E];
    int ehp[MAX_E];
    bool ealive[MAX_E];
    // TODO: Add entity_id[MAX_E] and next_id
    int entity_count;
    int turn;
    int player_id;
};

// TODO: Implement findEntityByID(const WorldState& w, int id)
//   Returns the array index where entity_id[i]==id, or -1

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.player_pos.x=1; w.player_pos.y=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.entity_pos[i].x=0;w.entity_pos[i].y=0;w.ehp[i]=0;w.ealive[i]=false;}
    // TODO: Assign player_id=0, spawn enemies with id=1 and id=2
    // Entity 0: orc at (3,1) hp=10
    // Entity 1: orc at (6,1) hp=10
    w.entity_count=2; w.turn=0;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;
    // TODO: Print ENTITY lines with IDs
    // TODO: Print LOOKUP results for id=0, id=2, id=99
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct Vec2i { int x; int y; };

struct WorldState {
    char grid[H][W];
    Vec2i player_pos;
    int php, pgold;
    Vec2i entity_pos[MAX_E];
    int ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int turn;
    int player_id;
    int next_id;
};

int findEntityByID(const WorldState& w, int id){
    for(int i=0;i<w.entity_count;i++){
        if(w.entity_id[i]==id) return i;
    }
    return -1;
}

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.player_pos.x=1; w.player_pos.y=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.entity_pos[i].x=0;w.entity_pos[i].y=0;w.ehp[i]=0;w.ealive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0;
    w.player_id=w.next_id++;
    // Enemy 0: orc at (3,1)
    w.entity_id[0]=w.next_id++;
    w.entity_pos[0].x=3; w.entity_pos[0].y=1; w.ehp[0]=10; w.ealive[0]=true;
    // Enemy 1: orc at (6,1)
    w.entity_id[1]=w.next_id++;
    w.entity_pos[1].x=6; w.entity_pos[1].y=1; w.ehp[1]=10; w.ealive[1]=true;
    w.entity_count=2; w.turn=0;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;
    cout << "ENTITY|id=" << w.player_id << "|hero|player|" << w.player_pos.x*TILE << "|" << w.player_pos.y*TILE << "|24|24" << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.ealive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|orc|enemy|" << w.entity_pos[i].x*TILE << "|" << w.entity_pos[i].y*TILE << "|24|24" << endl;
    }
    cout << "LOOKUP|id=0|index=" << findEntityByID(w,0) << endl;
    cout << "LOOKUP|id=2|index=" << findEntityByID(w,2) << endl;
    cout << "LOOKUP|id=99|index=" << findEntityByID(w,99) << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Player entity with id=0", expectedOutput: "ENTITY\\|id=0\\|hero\\|player", isPattern: true },
      { id: "t2", description: "Enemy with id=1", expectedOutput: "ENTITY\\|id=1\\|orc\\|enemy\\|72", isPattern: true },
      { id: "t3", description: "Lookup id=0 returns index 0", expectedOutput: "LOOKUP\\|id=0\\|index=0", isPattern: true },
      { id: "t4", description: "Lookup id=2 returns index 1", expectedOutput: "LOOKUP\\|id=2\\|index=1", isPattern: true },
      { id: "t5", description: "Lookup invalid id returns -1", expectedOutput: "LOOKUP\\|id=99\\|index=-1", isPattern: true },
    ],
    hints: [
      "Add int entity_id[MAX_E] and int next_id to WorldState. Each entity gets entity_id[i] = next_id++.",
      "findEntityByID loops through entity_id[] comparing each to the target id. Return i on match, -1 if not found.",
      "player_id = next_id++ (gives 0). First enemy: entity_id[0] = next_id++ (gives 1). Second enemy: entity_id[1] = next_id++ (gives 2). findEntityByID(w,0) scans entity_id[] but player_id is separate -- return 0 for enemies array.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Game with ID-Based Entity Access",
    type: "game_builder",
    instructions: `# Build: Game with ID-Based Entity Access

## Mental Model

The game now references entities by ID. When the combat system targets an enemy, it uses the ID to find the array index. When the cleanup system removes a dead entity, other IDs remain valid. The game logic says "damage entity with id=1" instead of "damage the entity at index 0." Intent is separated from storage.

## What Breaks Without This

Kill the first enemy. If you compact the array, the second enemy shifts from index 1 to index 0. Any code referencing "index 1" now points to nothing. With IDs, the second enemy keeps its ID regardless of array compaction. The reference stays valid.

## The Fix

Refactor the game to use entity IDs. The attack command targets the nearest enemy by scanning IDs. The cleanup pass marks entities dead by ID. The render pass looks up positions by scanning entity_id[]. Run the scripted sequence: move, move, attack, attack to kill the first orc, then continue to kill the second.

## Key Concepts

- **ID-based targeting** -- combat finds targets by scanning entity_id[], not by raw index
- **Stable references** -- entity IDs survive removal of other entities
- **Lookup cost** -- O(n) scan for n entities; acceptable for small n

## Performance Insight

Linear scan for entity lookup: O(n) where n is entity_count. For MAX_E=4, this is 4 comparisons -- trivial. At 100 entities, still fast (100 int comparisons < 1 microsecond). At 10,000, you would want a hash map or slot map. But premature optimization is the root of all evil -- start simple, profile later.

## Memory Insight

Adding entity_id[MAX_E] costs 16 bytes. The next_id counter costs 4 bytes. Total: 20 bytes added to WorldState. No heap allocation. The IDs are contiguous with other entity data in the same struct, so they benefit from cache line prefetching during linear scans.

## Your Task

Build the full game with entity IDs. Hero at (1,1), two orcs at (3,1) and (6,1), each 10 HP. Script: d,d,f,d,d,d,f (move to first, kill, move to second, kill). Output:

\`\`\`
DUNGEON|rpg-v0
TURN|1
HP|100
GOLD|0
...
TURN|7
HP|100
GOLD|20
WIN|hero|all_defeated|gold=20
GAME_MESSAGE|Entity ID system operational.
\`\`\`

## Beginner Trap

**Using entity_id[i] == i assumption.** Your code might hardcode "entity_id[0] is always the first enemy." But after cleanup compacts the array, entity_id[0] could be the SECOND enemy. Always use findEntityByID for lookups, never assume ID equals index.

## Elite Insight

Baldur's Gate uses 32-bit entity references that survive save/load cycles. When you save with a spell targeting "entity 0x4A2B", loading restores that reference. Valve's Source engine uses EHANDLE -- an entity handle with an index and a serial number (generation). Your entity_id[] is the first step toward that pattern.

## Mastery Check

What happens if two entities accidentally get the same ID? Answer: findEntityByID returns the first match. The second entity becomes unreachable by ID. Combat targets the wrong entity. This is why next_id must be monotonically increasing and never reset during a game session.`,
    starterCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct Vec2i { int x; int y; };
Vec2i vec2iAdd(Vec2i a, Vec2i b){ Vec2i r; r.x=a.x+b.x; r.y=a.y+b.y; return r; }
bool isAdjacent(Vec2i a, Vec2i b){ return (abs(a.x-b.x)+abs(a.y-b.y))==1; }

struct WorldState {
    char grid[H][W];
    Vec2i player_pos;
    int php, pgold;
    Vec2i entity_pos[MAX_E];
    int ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int turn;
    int player_id;
    int next_id;
};

int findEntityByID(const WorldState& w, int id){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==id) return i;
    return -1;
}

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.player_pos.x=1; w.player_pos.y=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.entity_pos[i].x=0;w.entity_pos[i].y=0;w.ehp[i]=0;w.ealive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.player_id=w.next_id++;
    w.entity_id[0]=w.next_id++; w.entity_pos[0].x=3; w.entity_pos[0].y=1; w.ehp[0]=10; w.ealive[0]=true;
    w.entity_id[1]=w.next_id++; w.entity_pos[1].x=6; w.entity_pos[1].y=1; w.ehp[1]=10; w.ealive[1]=true;
    w.entity_count=2; w.turn=0;
}

bool canMove(const WorldState& w, Vec2i pos, Vec2i delta){
    Vec2i np=vec2iAdd(pos,delta);
    if(np.x<0||np.x>=W||np.y<0||np.y>=H) return false;
    return w.grid[np.y][np.x]!='#';
}

// TODO: passPlayerInput, passCleanup, passRender using entity IDs

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    char inputs[]={'d','d','f','d','d','d','f'};
    int nticks=7;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        // TODO: call pass functions and check win
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdlib>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=4;

struct Vec2i { int x; int y; };
Vec2i vec2iAdd(Vec2i a, Vec2i b){ Vec2i r; r.x=a.x+b.x; r.y=a.y+b.y; return r; }
bool isAdjacent(Vec2i a, Vec2i b){ return (abs(a.x-b.x)+abs(a.y-b.y))==1; }

struct WorldState {
    char grid[H][W];
    Vec2i player_pos;
    int php, pgold;
    Vec2i entity_pos[MAX_E];
    int ehp[MAX_E];
    bool ealive[MAX_E];
    int entity_id[MAX_E];
    int entity_count;
    int turn;
    int player_id;
    int next_id;
};

int findEntityByID(const WorldState& w, int id){
    for(int i=0;i<w.entity_count;i++) if(w.entity_id[i]==id) return i;
    return -1;
}

void initWorld(WorldState& w){
    for(int y=0;y<H;y++) for(int x=0;x<W;x++) w.grid[y][x]='.';
    for(int x=0;x<W;x++){w.grid[0][x]='#';w.grid[H-1][x]='#';}
    for(int y=0;y<H;y++){w.grid[y][0]='#';w.grid[y][W-1]='#';}
    w.player_pos.x=1; w.player_pos.y=1; w.php=100; w.pgold=0;
    for(int i=0;i<MAX_E;i++){w.entity_pos[i].x=0;w.entity_pos[i].y=0;w.ehp[i]=0;w.ealive[i]=false;w.entity_id[i]=-1;}
    w.next_id=0; w.player_id=w.next_id++;
    w.entity_id[0]=w.next_id++; w.entity_pos[0].x=3; w.entity_pos[0].y=1; w.ehp[0]=10; w.ealive[0]=true;
    w.entity_id[1]=w.next_id++; w.entity_pos[1].x=6; w.entity_pos[1].y=1; w.ehp[1]=10; w.ealive[1]=true;
    w.entity_count=2; w.turn=0;
}

bool canMove(const WorldState& w, Vec2i pos, Vec2i delta){
    Vec2i np=vec2iAdd(pos,delta);
    if(np.x<0||np.x>=W||np.y<0||np.y>=H) return false;
    return w.grid[np.y][np.x]!='#';
}

void passPlayerInput(WorldState& w, char key){
    if(key=='d'||key=='a'||key=='w'||key=='s'){
        Vec2i delta;
        delta.x=(key=='d')?1:(key=='a')?-1:0;
        delta.y=(key=='s')?1:(key=='w')?-1:0;
        if(canMove(w,w.player_pos,delta)) w.player_pos=vec2iAdd(w.player_pos,delta);
    }
    if(key=='f'){
        for(int i=0;i<w.entity_count;i++){
            if(w.ealive[i]&&isAdjacent(w.player_pos,w.entity_pos[i])){
                w.ehp[i]-=10;
            }
        }
    }
}

void passCleanup(WorldState& w){
    for(int i=0;i<w.entity_count;i++){
        if(w.ealive[i]&&w.ehp[i]<=0){
            w.ealive[i]=false;
            w.pgold+=10;
        }
    }
}

void passRender(const WorldState& w){
    cout << "ENTITY|id=" << w.player_id << "|hero|player|" << w.player_pos.x*TILE << "|" << w.player_pos.y*TILE << "|24|24" << endl;
    for(int i=0;i<w.entity_count;i++){
        if(w.ealive[i])
            cout << "ENTITY|id=" << w.entity_id[i] << "|orc|enemy|" << w.entity_pos[i].x*TILE << "|" << w.entity_pos[i].y*TILE << "|24|24" << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.php << endl;
    cout << "GOLD|" << w.pgold << endl;
}

int main(){
    WorldState w;
    initWorld(w);
    cout << "DUNGEON|rpg-v0" << endl;

    char inputs[]={'d','d','f','d','d','d','f'};
    int nticks=7;

    for(int t=0;t<nticks;t++){
        w.turn=t+1;
        passPlayerInput(w,inputs[t]);
        passCleanup(w);
        passRender(w);

        int alive=0;
        for(int i=0;i<w.entity_count;i++) if(w.ealive[i]) alive++;
        if(alive==0){
            cout << "WIN|hero|all_defeated|gold=" << w.pgold << endl;
            cout << "GAME_MESSAGE|Entity ID system operational." << endl;
            break;
        }
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header", expectedOutput: "DUNGEON\\|rpg-v0", isPattern: true },
      { id: "g2", description: "Entity rendered with ID", expectedOutput: "ENTITY\\|id=0\\|hero", isPattern: true },
      { id: "g3", description: "Turn counter reaches 7", expectedOutput: "TURN\\|7", isPattern: true },
      { id: "g4", description: "Gold is 20 after two kills", expectedOutput: "GOLD\\|20", isPattern: true },
      { id: "g5", description: "Win message", expectedOutput: "WIN\\|hero\\|all_defeated\\|gold=20", isPattern: true },
      { id: "g6", description: "Entity ID system message", expectedOutput: "GAME_MESSAGE\\|Entity ID system operational\\.", isPattern: true },
    ],
    hints: [
      "Entity IDs are printed in ENTITY lines: ENTITY|id=N|name|type|x|y|w|h. The render pass reads entity_id[i] for each alive entity.",
      "passPlayerInput uses isAdjacent(w.player_pos, w.entity_pos[i]) to find attackable enemies. passCleanup awards 10 gold per kill.",
      "Script d,d,f moves to (3,1) adjacent to orc at (3,1), then attacks. After kill, d,d,d moves to (6,1) adjacent to second orc. Final f kills it. Total gold: 20.",
    ],
    estimatedMinutes: 15,
  },
};