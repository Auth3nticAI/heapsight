import { Lesson } from "@/types/lesson";

export const lessonRPG36: Lesson = {
  id: "rpg-36-damage-tables",
  title: "Damage Tables",
  description: "Combat damage read from a const data table — balancing the game means editing numbers, not rewriting code.",
  order: 36,
  xpReward: 100,
  tier: "pro",
  concepts: ["damage table", "data-driven balance", "table lookup", "combat resolution"],
  part1: {
    title: "Concept: Damage as Data Lookup",
    type: "concept",
    instructions: `# Damage Tables

## Mental Model
Damage is not a magic number buried in an if-statement. Damage is a row in a table. Each entity type has a \`damage_id\` that indexes into a \`DAMAGE_TABLE\`. The combat system reads the table, applies the number, and prints the result. To rebalance the game, you change a number in the table. The combat code never changes.

This is the same pattern as Lesson 34 (AI as table lookup). Behavior parameters came from BEHAVIOR_TABLE. Now combat parameters come from DAMAGE_TABLE. Every entity attribute that varies by type belongs in a data table.

## What Breaks Without This
Right now, there is no combat. But if you hardcode damage — \`hp[target] -= 5;\` — you create a maintenance nightmare. Want the player to do more damage? Find the line, change 5 to 7. Want chasers to do different damage than guards? Add an if-statement. Want 10 enemy types with different damage? 10 branches. The numbers are scattered across the codebase, invisible and fragile.

With a damage table, all combat numbers live in one place: a const array. Balancing is reading a table, not reading code.

## The Fix: DamageRow Table

\`\`\`cpp
struct DamageRow {
    int base_dmg;
};

const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee enemy
    {0},  // type 2: passive enemy
};
\`\`\`

Each entity stores a \`damage_id\` — an index into DAMAGE_TABLE. Combat reads:

\`\`\`cpp
int dmg = DAMAGE_TABLE[damage_id[attacker]].base_dmg;
hp[target] -= dmg;
\`\`\`

Adding a new damage tier means adding one row. The combat code is untouched.

## Key Concepts
- damage_id: integer index into DAMAGE_TABLE, stored per entity
- DamageRow: struct holding combat parameters (base_dmg for now, expandable later)
- Table lookup: \`DAMAGE_TABLE[id].base_dmg\` — one array access, one field read
- Separation of data and logic: the table holds numbers, the code holds rules

## Performance Insight
Table lookup is an array index — constant time, one cache line. With 3 damage types, the entire DAMAGE_TABLE is 12 bytes. Even 100 damage types would be 400 bytes — still fits in L1 cache. Combat resolution per attack: one table lookup + one subtraction + one comparison. Under 5 nanoseconds.

## Memory Insight
DAMAGE_TABLE is const — stored in the read-only data segment, not the heap. damage_id per entity is one int — 4 bytes. With MAX_ENTITIES = 16: 64 bytes of damage_id storage. Gate A: zero allocations. The table exists at compile time.

## Your Task
Use DAMAGE_TABLE to resolve three attacks: player hits entity 1, player hits entity 2, then entity 2 (if alive) hits the player. Print COMBAT traces for each attack.

Expected output:
\`\`\`
COMBAT|src=0|target=1|dmg=5|hp=10
COMBAT|src=0|target=2|dmg=5|hp=5
COMBAT|src=2|target=0|dmg=3|hp=27
\`\`\`

## Beginner Trap
**Hardcoding damage values in the combat code instead of looking up the table.** If you write \`hp[1] -= 5;\` instead of \`hp[1] -= DAMAGE_TABLE[damage_id[0]].base_dmg;\`, you have bypassed the table. The result is the same today, but tomorrow when you add a sword that changes player damage, you need to find and update every hardcoded 5. The table gives you one place to change.

## Elite Insight
Diablo 2's damage system reads from data tables: MonStats.txt for monster damage, Weapons.txt for weapon damage, Skills.txt for spell damage. The combat resolution code is one generic function that reads these tables. Your DAMAGE_TABLE follows the same architecture — different scale, identical pattern.

## Systems Thinking Connection
The Space Shooter path uses damage tables for bullet types. The Platformer path uses damage tables for enemy stomp values. The Robotics path uses parameter tables for sensor accuracy. All four paths store tuning parameters in const data tables. The domain differs; the engineering is identical.

## Skill Reinforcement
Lesson 34 introduced table-driven AI with BEHAVIOR_TABLE. This lesson adds DAMAGE_TABLE — same pattern, different data. Lesson 37 will add a combat event log to record these damage events for replay verification.

## Mastery Check
Question: If you add a "ranged enemy" type with 7 damage, what changes?
Answer: Add one row to DAMAGE_TABLE: \`{7}\`. Define \`const int DMG_RANGED = 3;\`. Assign damage_id = DMG_RANGED to ranged enemies in loadRoom. The combat code is unchanged — it already reads from the table.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;

struct DamageRow {
    int base_dmg;
};

const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee enemy
    {0},  // type 2: passive enemy
};

int main() {
    int hp[MAX_E] = {30, 15, 10, 15};
    int damage_id[MAX_E] = {0, 2, 1, 2};
    bool alive[MAX_E] = {true, true, true, true};
    int entity_count = 4;

    // TODO: Player (id=0) attacks entity 1
    // Look up: DAMAGE_TABLE[damage_id[0]].base_dmg
    // Apply damage to hp[1]
    // Print: COMBAT|src=0|target=1|dmg=D|hp=H
    // If hp <= 0: alive = false, print KILL|id=1

    // TODO: Player (id=0) attacks entity 2
    // Same pattern

    // TODO: Entity 2 attacks player (id=0), if alive
    // Look up: DAMAGE_TABLE[damage_id[2]].base_dmg
    // Apply to hp[0]
    // Print: COMBAT|src=2|target=0|dmg=D|hp=H

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 8;

struct DamageRow {
    int base_dmg;
};

const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee enemy
    {0},  // type 2: passive enemy
};

int main() {
    int hp[MAX_E] = {30, 15, 10, 15};
    int damage_id[MAX_E] = {0, 2, 1, 2};
    bool alive[MAX_E] = {true, true, true, true};
    int entity_count = 4;

    // Player attacks entity 1
    int dmg = DAMAGE_TABLE[damage_id[0]].base_dmg;
    hp[1] -= dmg;
    cout << "COMBAT|src=0|target=1|dmg=" << dmg << "|hp=" << hp[1] << endl;
    if (hp[1] <= 0) { alive[1] = false; cout << "KILL|id=1" << endl; }

    // Player attacks entity 2
    dmg = DAMAGE_TABLE[damage_id[0]].base_dmg;
    hp[2] -= dmg;
    cout << "COMBAT|src=0|target=2|dmg=" << dmg << "|hp=" << hp[2] << endl;
    if (hp[2] <= 0) { alive[2] = false; cout << "KILL|id=2" << endl; }

    // Entity 2 attacks player (if alive)
    if (alive[2]) {
        dmg = DAMAGE_TABLE[damage_id[2]].base_dmg;
        hp[0] -= dmg;
        cout << "COMBAT|src=2|target=0|dmg=" << dmg << "|hp=" << hp[0] << endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Player damage from table", expectedOutput: "COMBAT|src=0|target=1|dmg=5|hp=10", isPattern: false },
      { id: "t2", description: "Melee enemy takes damage", expectedOutput: "COMBAT|src=0|target=2|dmg=5|hp=5", isPattern: false },
      { id: "t3", description: "Enemy counterattacks player", expectedOutput: "COMBAT|src=2|target=0|dmg=3|hp=27", isPattern: false },
    ],
    hints: [
      "Look up the attacker's damage with DAMAGE_TABLE[damage_id[attacker]].base_dmg — this gives you the damage value from the table.",
      "After subtracting damage from hp, check if hp <= 0. If so, set alive to false and print a KILL line.",
      "Entity 2 has damage_id=1 (melee enemy), so its damage is DAMAGE_TABLE[1].base_dmg = 3."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Table-Driven Combat in the Game Loop",
    type: "game_builder",
    instructions: `# Build: Table-Driven Combat in the Game Loop

## Mental Model
Wire the damage table into the game pipeline. When the player presses 'f' (attack), game_tick checks for adjacent enemies. If one is found, damage is looked up from DAMAGE_TABLE and applied. If the enemy dies, it is marked not alive. The render module already skips dead entities.

The pipeline per tick is now: input → move player → combat → AI movement → render. Combat sits between player movement and AI movement — the player acts first, then surviving enemies respond.

## What Breaks Without This
Without combat, your dungeon is a walking simulator. Enemies chase the player but nothing happens when they meet. The damage table turns the simulation into a game: the player can fight back, enemies can die, and the numbers that determine combat outcomes are all in one place.

## The Fix: Combat Pass in game_tick

After player movement, before AI movement:

\`\`\`cpp
if (cmd.attack) {
    for (int i = 1; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        int dist = abs(w.pos_x[0]-w.pos_x[i]) + abs(w.pos_y[0]-w.pos_y[i]);
        if (dist <= 1) {
            int dmg = DAMAGE_TABLE[w.damage_id[0]].base_dmg;
            w.hp[i] -= dmg;
            // print COMBAT trace
            if (w.hp[i] <= 0) {
                w.alive[i] = false;
                // print KILL trace
            }
            break;  // one attack per tick
        }
    }
}
\`\`\`

Manhattan distance (|dx| + |dy|) determines adjacency. Range 1 means the player must be on a neighboring tile.

## Key Concepts
- Combat pass: a new phase in the tick pipeline, between movement and AI
- Manhattan distance for adjacency: abs(dx) + abs(dy) <= range
- One attack per tick: break after first hit (prevents multi-kill per frame)
- DAMAGE_TABLE lookup for damage value — never hardcoded
- Dead entities: alive[i] = false, skipped by AI and render

## Performance Insight
The combat check iterates entity_count enemies and computes Manhattan distance for each. With 3 enemies, that is 3 subtractions + 3 absolute values + 3 comparisons = ~15 operations. Negligible. The table lookup adds one array index. Total combat cost per tick: under 10 nanoseconds.

## Memory Insight
damage_id adds one int per entity (MAX_E = 16 → 64 bytes). DAMAGE_TABLE is 12 bytes const. No new heap allocations. The combat pass uses stack variables only (dmg, dist). Gate A: fully compliant.

## Your Task
Add damage_id to WorldState, set it during loadRoom, and implement the combat pass in game_tick. Use a room with a guard near the player. The player should kill the guard in 3 attacks.

Expected output includes:
\`\`\`
COMBAT|src=0|target=1|dmg=5|hp=10
COMBAT|src=0|target=1|dmg=5|hp=5
COMBAT|src=0|target=1|dmg=5|hp=0
KILL|id=1
RENDER|turn=5|entities=2
\`\`\`

## Beginner Trap
**Checking combat before player movement.** If the player presses 'f' and 'd' simultaneously (dx=1, attack=true), the attack should use the NEW position, not the old one. Move first, then check adjacency. Otherwise the player attacks from the wrong tile.

Wait — actually in this Command design, 'f' sets attack=true with dx=0,dy=0. Movement and attack are separate commands. But the principle stands: the pipeline order within a tick matters.

## Elite Insight
Dark Souls processes player actions in a strict order: movement → attack animation → hit detection → damage application → enemy response. Your tick pipeline follows the same sequence at a simpler scale: movement → combat check → damage → AI. The order ensures the player's action resolves before enemies react.

## Mastery Check
Question: Why break after the first adjacent enemy is hit?
Answer: Because one attack per tick prevents the player from hitting all adjacent enemies simultaneously. In a turn-based game, the player gets one action per turn. Hitting multiple targets would be a special ability — not the default. The break enforces this rule.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = { {0,0}, {1,0} };

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee
    {0},  // type 2: passive
};

struct Command { int dx; int dy; bool attack; };

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    return cmd;
}

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int behavior_id[MAX_E];
    int damage_id[MAX_E];
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

const char ROOM_DATA[] =
    "##########"
    "#@.G.....#"
    "#........#"
    "#........#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#........#"
    "##########";

void loadRoom(WorldState& w, const char* data, int dw, int dh, unsigned int seed){
    w={};
    w.seed=seed; rng_seed(w.rng,seed);
    w.entity_count=0;
    for(int y=0;y<dh&&y<H;y++){
        for(int x=0;x<dw&&x<W;x++){
            char c=data[y*dw+x];
            if(c=='@'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=30; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=0;
                w.grid[y][x]='.';
            } else if(c=='E'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=10; w.alive[id]=true;
                w.behavior_id[id]=BH_CHASE_X;
                w.damage_id[id]=1;
                w.grid[y][x]='.';
            } else if(c=='G'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=15; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=2;
                w.grid[y][x]='.';
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

// TODO: Add combat pass to game_tick
// After player movement, if cmd.attack:
//   Find first adjacent alive enemy (Manhattan dist <= 1)
//   Look up DAMAGE_TABLE[w.damage_id[0]].base_dmg
//   Apply damage, print COMBAT trace
//   If hp <= 0: alive=false, print KILL
//   Break after first hit
void game_tick(WorldState& w, Command cmd){
    w.turn++;
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    // TODO: Combat pass here
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
        int edx=0;
        if(bh.chase_x){
            if(w.pos_x[i]<w.pos_x[0]) edx=1;
            else if(w.pos_x[i]>w.pos_x[0]) edx=-1;
        }
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL)
            w.pos_x[i]=enx;
    }
}

void renderWorld(const WorldState& w){
    int ac=0;
    for(int i=0;i<w.entity_count;i++){ if(w.alive[i]) ac++; }
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
    for(int i=0;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        cout<<"ENT|id="<<i<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")|hp="<<w.hp[i]<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','f','f','f','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
const int BH_CHASE_X=1;
struct BehaviorRow { int chase_x; int chase_y; };
const BehaviorRow BEHAVIOR_TABLE[] = { {0,0}, {1,0} };

struct DamageRow { int base_dmg; };
const DamageRow DAMAGE_TABLE[] = {
    {5},  // type 0: player
    {3},  // type 1: melee
    {0},  // type 2: passive
};

struct Command { int dx; int dy; bool attack; };

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    return cmd;
}

struct WorldState {
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int behavior_id[MAX_E];
    int damage_id[MAX_E];
    int entity_count; int turn;
    Tile grid[H][W]; RNG rng; unsigned int seed;
    int inventory[INV_SIZE]; int inv_count;
};

const char ROOM_DATA[] =
    "##########"
    "#@.G.....#"
    "#........#"
    "#........#"
    "#........#"
    "#....E...#"
    "#........#"
    "#........#"
    "#........#"
    "##########";

void loadRoom(WorldState& w, const char* data, int dw, int dh, unsigned int seed){
    w={};
    w.seed=seed; rng_seed(w.rng,seed);
    w.entity_count=0;
    for(int y=0;y<dh&&y<H;y++){
        for(int x=0;x<dw&&x<W;x++){
            char c=data[y*dw+x];
            if(c=='@'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=30; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=0;
                w.grid[y][x]='.';
            } else if(c=='E'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=10; w.alive[id]=true;
                w.behavior_id[id]=BH_CHASE_X;
                w.damage_id[id]=1;
                w.grid[y][x]='.';
            } else if(c=='G'){
                int id=w.entity_count++;
                w.pos_x[id]=x; w.pos_y[id]=y;
                w.hp[id]=15; w.alive[id]=true;
                w.behavior_id[id]=BH_IDLE;
                w.damage_id[id]=2;
                w.grid[y][x]='.';
            } else {
                w.grid[y][x]=c;
            }
        }
    }
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w, Command cmd){
    w.turn++;
    cout<<"INPUT|tick="<<w.turn<<"|dx="<<cmd.dx<<"|dy="<<cmd.dy<<"|atk="<<(cmd.attack?1:0)<<endl;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL)
        {w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                w.hp[i]-=dmg;
                cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){
                    w.alive[i]=false;
                    cout<<"KILL|id="<<i<<endl;
                }
                break;
            }
        }
    }
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
        int edx=0;
        if(bh.chase_x){
            if(w.pos_x[i]<w.pos_x[0]) edx=1;
            else if(w.pos_x[i]>w.pos_x[0]) edx=-1;
        }
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL)
            w.pos_x[i]=enx;
    }
}

void renderWorld(const WorldState& w){
    int ac=0;
    for(int i=0;i<w.entity_count;i++){ if(w.alive[i]) ac++; }
    cout<<"RENDER|turn="<<w.turn<<"|entities="<<ac<<endl;
    for(int i=0;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        cout<<"ENT|id="<<i<<"|pos=("<<w.pos_x[i]<<","<<w.pos_y[i]<<")|hp="<<w.hp[i]<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w, ROOM_DATA, W, H, 42);
    char inputs[]={'d','f','f','f','d'};
    for(int i=0;i<5;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderWorld(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "First hit from damage table", expectedOutput: "COMBAT|src=0|target=1|dmg=5|hp=10", isPattern: false },
      { id: "g2", description: "Guard killed after 3 hits", expectedOutput: "KILL|id=1", isPattern: false },
      { id: "g3", description: "Dead entity removed from render", expectedOutput: "RENDER|turn=5|entities=2", isPattern: false },
      { id: "g4", description: "Player HP unchanged", expectedOutput: "ENT|id=0|pos=(3,1)|hp=30", isPattern: false },
      { id: "g5", description: "Chaser still alive", expectedOutput: "ENT|id=2", isPattern: false },
    ],
    hints: [
      "Add the combat pass after player movement but before AI movement. Check cmd.attack first.",
      "Use Manhattan distance: abs(w.pos_x[0]-w.pos_x[i]) + abs(w.pos_y[0]-w.pos_y[i]) <= 1 for adjacency.",
      "Look up damage with DAMAGE_TABLE[w.damage_id[0]].base_dmg — index 0 is the player. Break after the first hit."
    ],
    estimatedMinutes: 12,
  },
};
