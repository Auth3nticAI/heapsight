import { Lesson } from "@/types/lesson";

export const lessonRPG09: Lesson = {
  id: "rpg-09-hp-and-death",
  title: "HP and Death",
  description: "Enemy removed at HP 0. Swap-and-pop removal keeps arrays contiguous with no gaps.",
  order: 9,
  xpReward: 50,
  tier: "free",
  concepts: ["cleanup pass", "swap-and-pop", "deferred removal", "death state"],
  part1: {
    title: "Concept: HP and Death",
    type: "concept",
    instructions: `# HP and Death

## Mental Model

Death is a cleanup pass. After combat deals damage, a separate pass scans entity_hp[]. Any entity with HP <= 0 is dead. Dead entities are removed by swap-and-pop: copy the last entity's data into the dead entity's slot, then decrement entity_count. The array stays contiguous. No gaps, no tombstones, no wasted iteration.

## What Breaks Without This

Without cleanup, dead entities stay in the array forever. They have HP <= 0 but still occupy a slot. The combat pass hits them again (HP goes more negative). The render pass stamps their glyph on the grid -- a dead enemy still visible. Entity count never decreases. The game leaks entities until the array is full.

## The Fix: Deferred Cleanup with Swap-and-Pop

\`\`\`cpp
void cleanupPass() {
    for (int i = entity_count - 1; i >= 1; i--) {  // skip player (index 0)
        if (entity_hp[i] <= 0) {
            cout << "DEATH|entity_" << i << endl;
            // Swap with last entity
            int last = entity_count - 1;
            entity_x[i] = entity_x[last];
            entity_y[i] = entity_y[last];
            entity_hp[i] = entity_hp[last];
            entity_glyph[i] = entity_glyph[last];
            entity_count--;
        }
    }
}
\`\`\`

Key details: iterate backwards (so swap-and-pop doesn't skip entities). Skip index 0 (the player is never removed by cleanup). The cleanup pass runs AFTER combat, never during. This is deferred removal -- mark dead during combat (HP <= 0), remove during cleanup.

## Key Concepts

- **Deferred removal** -- damage is applied in combat pass; removal happens in cleanup pass. Never modify the array during the combat iteration.
- **Swap-and-pop** -- copy last entity into dead slot, decrement count. O(1) removal. No shifting, no gaps.
- **Backwards iteration** -- iterate from entity_count-1 down to 1. When you swap-and-pop at index i, the swapped entity is at index i -- it'll be checked on the next iteration (i-1 has already been checked, so no double-check needed when going backwards).
- **Player immunity** -- index 0 is never removed by cleanup. Player death is a separate game-over condition.

## Performance Insight

Swap-and-pop is O(1) per removal. Deletion by shifting (like std::vector::erase) is O(N) -- every element after the dead one shifts left. At 64 entities, swap-and-pop is 4 array copies. Shifting is up to 252 copies. The difference is negligible at 64 entities but critical at 10,000.

## Memory Insight

Swap-and-pop does not free memory. The dead entity's slot is overwritten with the last entity's data. The array size stays MAX_ENTITIES. Only entity_count changes. This is intentional: fixed-size arrays have no allocation or deallocation cost. The slot is reused when the next entity spawns.

## Your Task

Player at (2,1) HP:100. Enemy at (3,1) HP:10. Attack deals 10 damage, killing the enemy. Run cleanup. Print DEATH and verify entity_count decreases:

\`\`\`
ENTITY|0|@|2,1|HP:100
ENTITY|1|E|3,1|HP:10
ENTITY_COUNT|2
COMBAT|attacker:0|target:1|dist:1
HIT|0->|1|DMG:10|HP:0
DEATH|entity_1
ENTITY_COUNT|1
TURN|1
HP|100
GOLD|0
GAME_MESSAGE|Enemy killed! 1 entity remaining.
\`\`\`

## Beginner Trap

**Removing entities during the combat loop.** If combat iterates entities 0..N and removes entity 2 mid-loop, entity 3 becomes entity 2 (via swap-and-pop). The loop skips the swapped entity. Deferred removal solves this: combat only changes HP; cleanup removes dead entities in a separate pass after combat finishes.

## Elite Insight

Doom's entity system (thinkers) uses a linked list with deferred removal. Entities flagged for removal are unlinked after the full tick completes -- never during iteration. John Carmack's rule: never modify the container you're iterating. Swap-and-pop is the array equivalent of unlinking a node. Same principle, different data structure.

## Systems Thinking Connection

The Space Shooter path uses the same swap-and-pop pattern for bullet removal (Lesson 10). Both paths defer removal to a cleanup pass. The Platformer path uses a similar pattern for destroyed platforms. Deferred removal is universal -- not a game trick, but a systems engineering pattern for stable iteration.

## Skill Reinforcement

Lesson 8 added combat damage. This lesson adds the cleanup pass that removes dead entities. Lesson 10 (milestone) combines all passes into a complete tick pipeline. Lesson 19 formalizes cleanup with typed removal in a World struct.

## Mastery Check

Why iterate backwards in the cleanup pass? When you swap-and-pop at index i, the entity that was at the end of the array is now at index i. If you iterate forwards, the next iteration goes to i+1 -- skipping the swapped entity. Iterating backwards: after removing at index i, the next iteration checks i-1 (already lower), and the swapped entity at i will not be revisited -- but it doesn't need to be, because it was the last entity and has already been checked (it was at a higher index).`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 64;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count]=x; entity_y[entity_count]=y;
    entity_hp[entity_count]=hp; entity_glyph[entity_count]=glyph;
    entity_count++;
}

bool isAdjacent(int x1,int y1,int x2,int y2) {
    int dx=x1-x2; int dy=y1-y2;
    if(dx<0) dx=-dx; if(dy<0) dy=-dy;
    return (dx+dy)==1;
}

void combatPass(int attacker) {
    for(int i=0;i<entity_count;i++){
        if(i==attacker) continue;
        int dx=entity_x[attacker]-entity_x[i];
        int dy=entity_y[attacker]-entity_y[i];
        if(dx<0) dx=-dx; if(dy<0) dy=-dy;
        cout << "COMBAT|attacker:" << attacker << "|target:" << i << "|dist:" << (dx+dy) << endl;
        if(isAdjacent(entity_x[attacker],entity_y[attacker],entity_x[i],entity_y[i])){
            entity_hp[i]-=10;
            cout << "HIT|" << attacker << "->|" << i << "|DMG:10|HP:" << entity_hp[i] << endl;
            return;
        }
    }
    cout << "MISS|no adjacent target" << endl;
}

void cleanupPass() {
    // TODO: Iterate backwards from entity_count-1 to 1
    // If entity_hp[i] <= 0, print DEATH|entity_N and swap-and-pop
}

int main() {
    spawnEntity(2,1,100,'@');
    spawnEntity(3,1,10,'E');

    // Print initial state
    for(int i=0;i<entity_count;i++){
        cout << "ENTITY|" << i << "|" << entity_glyph[i]
             << "|" << entity_x[i] << "," << entity_y[i]
             << "|HP:" << entity_hp[i] << endl;
    }
    cout << "ENTITY_COUNT|" << entity_count << endl;

    combatPass(0);
    cleanupPass();

    cout << "ENTITY_COUNT|" << entity_count << endl;
    cout << "TURN|1" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|Enemy killed! " << entity_count << " entity remaining." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 64;
int entity_x[MAX_ENTITIES];
int entity_y[MAX_ENTITIES];
int entity_hp[MAX_ENTITIES];
char entity_glyph[MAX_ENTITIES];
int entity_count = 0;

void spawnEntity(int x, int y, int hp, char glyph) {
    entity_x[entity_count]=x; entity_y[entity_count]=y;
    entity_hp[entity_count]=hp; entity_glyph[entity_count]=glyph;
    entity_count++;
}

bool isAdjacent(int x1,int y1,int x2,int y2) {
    int dx=x1-x2; int dy=y1-y2;
    if(dx<0) dx=-dx; if(dy<0) dy=-dy;
    return (dx+dy)==1;
}

void combatPass(int attacker) {
    for(int i=0;i<entity_count;i++){
        if(i==attacker) continue;
        int dx=entity_x[attacker]-entity_x[i];
        int dy=entity_y[attacker]-entity_y[i];
        if(dx<0) dx=-dx; if(dy<0) dy=-dy;
        cout << "COMBAT|attacker:" << attacker << "|target:" << i << "|dist:" << (dx+dy) << endl;
        if(isAdjacent(entity_x[attacker],entity_y[attacker],entity_x[i],entity_y[i])){
            entity_hp[i]-=10;
            cout << "HIT|" << attacker << "->|" << i << "|DMG:10|HP:" << entity_hp[i] << endl;
            return;
        }
    }
    cout << "MISS|no adjacent target" << endl;
}

void cleanupPass() {
    for(int i=entity_count-1; i>=1; i--){
        if(entity_hp[i]<=0){
            cout << "DEATH|entity_" << i << endl;
            int last=entity_count-1;
            entity_x[i]=entity_x[last];
            entity_y[i]=entity_y[last];
            entity_hp[i]=entity_hp[last];
            entity_glyph[i]=entity_glyph[last];
            entity_count--;
        }
    }
}

int main() {
    spawnEntity(2,1,100,'@');
    spawnEntity(3,1,10,'E');

    for(int i=0;i<entity_count;i++){
        cout << "ENTITY|" << i << "|" << entity_glyph[i]
             << "|" << entity_x[i] << "," << entity_y[i]
             << "|HP:" << entity_hp[i] << endl;
    }
    cout << "ENTITY_COUNT|" << entity_count << endl;

    combatPass(0);
    cleanupPass();

    cout << "ENTITY_COUNT|" << entity_count << endl;
    cout << "TURN|1" << endl;
    cout << "HP|" << entity_hp[0] << endl;
    cout << "GOLD|0" << endl;
    cout << "GAME_MESSAGE|Enemy killed! " << entity_count << " entity remaining." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "HIT reduces HP to 0",
        expectedOutput: "HIT\\|0->\\|1\\|DMG:10\\|HP:0",
        isPattern: true,
      },
      {
        id: "t2",
        description: "DEATH event for entity 1",
        expectedOutput: "DEATH\\|entity_1",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Entity count drops to 1",
        expectedOutput: "GAME_MESSAGE\\|Enemy killed! 1 entity remaining\\.",
        isPattern: true,
      },
    ],
    hints: [
      "Iterate backwards: for(int i=entity_count-1; i>=1; i--). Check entity_hp[i] <= 0.",
      "Swap with last: copy entity_x/y/hp/glyph from index (entity_count-1) to index i. Then entity_count--.",
      "Print DEATH|entity_N before the swap. The death log identifies which entity was removed.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Combat and Death",
    type: "game_builder",
    instructions: `# Build: Combat and Death

## Mental Model

Run a 5-turn combat simulation. Player attacks each turn. Enemy takes 10 damage per hit. At HP 0, enemy dies and is removed from the entity array. The grid shows the empty spot where the enemy was.

## What Breaks Without This

Without death and removal, enemies are immortal. The game has no win condition -- you hit forever with no effect. HP going below 0 with no consequence makes combat meaningless. Death gives combat stakes.

## The Fix: Full Combat Loop with Cleanup

The pipeline per turn: combat pass (if attacking), cleanup pass, render grid. After the enemy dies, the combat pass prints MISS (no adjacent target) and the grid shows only the player.

## Key Concepts

- **Death removes entities** -- swap-and-pop after cleanup. Grid no longer shows the dead enemy.
- **Post-death MISS** -- after enemy is removed, combat pass finds no adjacent target. Confirms removal works.
- **Entity count tracks population** -- starts at 2, drops to 1 after enemy death.

## Performance Insight

Swap-and-pop removal is O(1). The cleanup pass iterates entity_count entities once. At 64 entities with 10 dying per turn, that is 64 checks and 10 swaps -- 74 operations. Trivially fast.

## Memory Insight

No memory is freed on entity death. The array slot is overwritten by swap-and-pop. The slot will be reused when the next entity spawns. This is pool behavior without a formal pool: fixed memory, reusable slots, no allocation or deallocation.

## Your Task

Player at (2,1) HP:100. Enemy at (3,1) HP:20. Run 5 turns attacking each turn. Enemy takes 10 damage per turn, dies on turn 2 (HP 20 -> 10 -> 0). Turns 3-5 print MISS. Grid updates each turn.

\`\`\`
DUNGEON|rpg-v0
TICK|1|P:2,1|E:3,1
HIT|0->|1|DMG:10|HP:10
ENTITY_COUNT|2
TICK|2|P:2,1|E:3,1
HIT|0->|1|DMG:10|HP:0
DEATH|entity_1
ENTITY_COUNT|1
TICK|3|P:2,1
MISS|no adjacent target
TICK|4|P:2,1
MISS|no adjacent target
TICK|5|P:2,1
MISS|no adjacent target
TURN|5
HP|100
GOLD|0
GAME_MESSAGE|Enemy defeated in 2 hits. 5 turns complete.
\`\`\`

## Beginner Trap

**Checking dead entities in the combat pass.** After cleanup removes the enemy, entity_count is 1. The combat loop iterates from 0 to entity_count-1 = 0. It only checks entity 0 (the player), skips it (i == attacker), and prints MISS. No special dead-check needed -- removal handles it.

## Elite Insight

Diablo 2 uses deferred entity removal. Monsters flagged for death play a death animation, then are removed from the entity list on the next tick's cleanup pass. This ensures the death animation renders correctly (the entity exists for one more frame). Your cleanup pass follows the same pattern: damage in combat, removal in cleanup, one full pass apart.

## Mastery Check

After swap-and-pop removes entity 1, what happens to the data at index 1? It contains the last entity's data (which was also entity 1 in this case, since entity_count was 2). The slot is now beyond entity_count (count is 1), so it won't be accessed. The stale data is harmless -- no code reads beyond entity_count.`,
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
    spawnEntity(2,1,100,'@');
    spawnEntity(3,1,20,'E');

    cout<<"DUNGEON|rpg-v0"<<endl;

    for(int t=0;t<5;t++){
        // Print TICK line
        cout<<"TICK|"<<(t+1)<<"|P:"<<entity_x[0]<<","<<entity_y[0];
        if(entity_count>1) cout<<"|E:"<<entity_x[1]<<","<<entity_y[1];
        cout<<endl;

        // TODO: Call combatPass(0), then cleanupPass()

        cout<<"ENTITY_COUNT|"<<entity_count<<endl;
    }

    cout<<"TURN|5"<<endl;
    cout<<"HP|"<<entity_hp[0]<<endl;
    cout<<"GOLD|0"<<endl;
    cout<<"GAME_MESSAGE|Enemy defeated in 2 hits. 5 turns complete."<<endl;

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
    spawnEntity(2,1,100,'@');
    spawnEntity(3,1,20,'E');

    cout<<"DUNGEON|rpg-v0"<<endl;

    for(int t=0;t<5;t++){
        cout<<"TICK|"<<(t+1)<<"|P:"<<entity_x[0]<<","<<entity_y[0];
        if(entity_count>1) cout<<"|E:"<<entity_x[1]<<","<<entity_y[1];
        cout<<endl;

        combatPass(0);
        cleanupPass();

        cout<<"ENTITY_COUNT|"<<entity_count<<endl;
    }

    cout<<"TURN|5"<<endl;
    cout<<"HP|"<<entity_hp[0]<<endl;
    cout<<"GOLD|0"<<endl;
    cout<<"GAME_MESSAGE|Enemy defeated in 2 hits. 5 turns complete."<<endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Dungeon header",
        expectedOutput: "DUNGEON\\|rpg-v0",
        isPattern: true,
      },
      {
        id: "g2",
        description: "First hit reduces HP to 10",
        expectedOutput: "HIT\\|0->\\|1\\|DMG:10\\|HP:10",
        isPattern: true,
      },
      {
        id: "g3",
        description: "DEATH event fires",
        expectedOutput: "DEATH\\|entity_1",
        isPattern: true,
      },
      {
        id: "g4",
        description: "MISS after enemy removed",
        expectedOutput: "MISS\\|no adjacent target",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Game message confirms 2 hits",
        expectedOutput: "GAME_MESSAGE\\|Enemy defeated in 2 hits\\. 5 turns complete\\.",
        isPattern: true,
      },
    ],
    hints: [
      "Call combatPass(0) first, then cleanupPass(). Combat deals damage; cleanup removes dead entities.",
      "combatPass(0); cleanupPass(); -- two lines inside the for loop, after the TICK print.",
      "After entity_count drops to 1, combatPass finds no targets (only entity 0, the player, which it skips) and prints MISS.",
    ],
    estimatedMinutes: 15,
  },
};