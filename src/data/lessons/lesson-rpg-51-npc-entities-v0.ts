import { Lesson } from "@/types/lesson";

export const lessonRPG51: Lesson = {
  id: "rpg-51-npc-entities-v0",
  title: "NPC Entities v0",
  description: "NPCs appear on the grid as a new entity type, distinguished by a type flag — not a class hierarchy, just an integer in the data.",
  order: 51,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity type flag", "NPC as data", "type-based behavior branching", "grid presence"],
  part1: {
    title: "Concept: Entity Type as Data Flag",
    type: "concept",
    instructions: `# NPC Entities v0

## Mental Model

An NPC is not a special class. It's an entity with a type flag that says "I'm an NPC." The same parallel arrays hold NPCs, enemies, and the player. The difference is a single integer: \`entity_type[id]\`. When the render pass sees type=NPC, it draws 'N'. When the AI pass sees type=NPC, it skips combat. When the interaction pass sees type=NPC, it checks for dialogue. One flag, multiple behaviors.

## What Breaks Without This

Without entity types, you can't distinguish NPCs from enemies. Every non-player entity gets combat AI, attacks the player, and drops loot. You can't have a shopkeeper, a quest giver, or a town guard that talks instead of fights. Your dungeon is nothing but monsters — no civilization, no story, no reason to stop fighting.

## The Fix: Entity Type Flag

Add an \`entity_type\` array to WorldState. Define constants: \`ETYPE_PLAYER=0\`, \`ETYPE_ENEMY=1\`, \`ETYPE_GUARD=2\`, \`ETYPE_NPC=3\`. Set the type during loadRoom based on the spawn character. Then branch on type in each system pass: combat only targets ETYPE_ENEMY and ETYPE_GUARD, AI only moves ETYPE_ENEMY, render uses different characters per type.

This is composition through data, not inheritance. No virtual functions. No class hierarchy. Just an integer that tells each system how to treat this entity. Adding a new type means: add a constant, set it during spawn, add branches where behavior differs. Zero heap cost. Zero abstraction overhead.

## Key Concepts
- Entity type as integer flag in parallel arrays
- Type-based branching in system passes
- No class hierarchy — composition through data
- Spawn character maps to entity type

## Performance Insight

The entity type check is a single integer comparison per entity per pass. With 16 entities and 4 passes, that's 64 comparisons — negligible. The type array is contiguous in memory alongside other entity arrays, so the CPU prefetcher loads it for free. Compare this to virtual dispatch: each entity would need a vtable pointer (8 bytes), an indirection per call, and cache misses on polymorphic access. Data flags win.

## Memory Insight

One \`int entity_type[MAX_E]\` = 64 bytes for 16 entities. Stored inline in WorldState alongside pos_x, pos_y, hp, alive. No pointer, no indirection, no heap allocation. The type flag is the cheapest way to distinguish entities — a single array that fits in one cache line.

## Your Task

Add an \`entity_type\` array and constants for PLAYER, ENEMY, GUARD, NPC. Create a small room with one of each. Render them with different characters: '@' for player, 'E' for enemy, 'G' for guard, 'N' for NPC. Print entity info showing types.

Expected output:
\`\`\`
SPAWN|id=0|type=0|char=@
SPAWN|id=1|type=1|char=E
SPAWN|id=2|type=2|char=G
SPAWN|id=3|type=3|char=N
ENTITY_COUNT|4
\`\`\`

## Beginner Trap

**Creating separate arrays for each entity type.** Instead of one \`entity_type[]\` array, beginners create \`enemy_ids[]\`, \`npc_ids[]\`, \`guard_ids[]\`. This fragments the data, makes iteration complex, and breaks the SoA pattern. One array, one flag. Let the system passes branch on type.

## Elite Insight

Diablo 2's entity system uses a single entity table with type flags. Monsters, NPCs, items on the ground, projectiles — all in one table, distinguished by type. The game processes up to 200 entities per frame. Unity's ECS follows the same pattern: entities are IDs, components are data, systems branch on component presence. Your type flag is the simplest correct version of this pattern.

## Systems Thinking Connection

This entity type flag mirrors the Robotics path's node type distinction — sensor nodes, control nodes, and planning nodes share the same executor but behave differently based on their role. Same data structure, different behavior based on type.

## Skill Reinforcement

Lesson 6 introduced entities as parallel arrays. Lesson 34 added behavior IDs. This lesson adds entity types — a higher-level categorization that determines which systems process each entity. Lesson 52 will add interaction commands for NPCs.

## Mastery Check

Why is an integer type flag better than a class hierarchy for entity types?
Answer: Integer flags keep entities in contiguous arrays (cache-friendly), avoid vtable overhead, and make serialization trivial (save the int). Class hierarchies fragment data across the heap and require virtual dispatch — slower and harder to serialize.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E=16;
const int ETYPE_PLAYER=0;
const int ETYPE_ENEMY=1;
const int ETYPE_GUARD=2;
const int ETYPE_NPC=3;

struct World{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    // TODO: Add int entity_type[MAX_E]
    int entity_count;
};

char entityChar(int etype){
    // TODO: Return '@' for PLAYER, 'E' for ENEMY, 'G' for GUARD, 'N' for NPC
    return '?';
}

int main(){
    World w={};
    w.entity_count=0;

    // Spawn player
    int id=w.entity_count++;
    w.pos_x[id]=1;w.pos_y[id]=1;w.hp[id]=30;w.alive[id]=true;
    // TODO: Set entity_type[id]=ETYPE_PLAYER
    cout<<"SPAWN|id="<<id<<"|type="<<0<<"|char="<<entityChar(0)<<endl;

    // Spawn enemy
    id=w.entity_count++;
    w.pos_x[id]=5;w.pos_y[id]=1;w.hp[id]=10;w.alive[id]=true;
    // TODO: Set entity_type and print SPAWN line

    // Spawn guard
    id=w.entity_count++;
    w.pos_x[id]=2;w.pos_y[id]=7;w.hp[id]=15;w.alive[id]=true;
    // TODO: Set entity_type and print SPAWN line

    // Spawn NPC
    id=w.entity_count++;
    w.pos_x[id]=8;w.pos_y[id]=1;w.hp[id]=20;w.alive[id]=true;
    // TODO: Set entity_type and print SPAWN line

    cout<<"ENTITY_COUNT|"<<w.entity_count<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E=16;
const int ETYPE_PLAYER=0;
const int ETYPE_ENEMY=1;
const int ETYPE_GUARD=2;
const int ETYPE_NPC=3;

struct World{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_type[MAX_E];
    int entity_count;
};

char entityChar(int etype){
    if(etype==ETYPE_PLAYER) return '@';
    if(etype==ETYPE_ENEMY) return 'E';
    if(etype==ETYPE_GUARD) return 'G';
    if(etype==ETYPE_NPC) return 'N';
    return '?';
}

int main(){
    World w={};
    w.entity_count=0;

    int id=w.entity_count++;
    w.pos_x[id]=1;w.pos_y[id]=1;w.hp[id]=30;w.alive[id]=true;
    w.entity_type[id]=ETYPE_PLAYER;
    cout<<"SPAWN|id="<<id<<"|type="<<w.entity_type[id]<<"|char="<<entityChar(w.entity_type[id])<<endl;

    id=w.entity_count++;
    w.pos_x[id]=5;w.pos_y[id]=1;w.hp[id]=10;w.alive[id]=true;
    w.entity_type[id]=ETYPE_ENEMY;
    cout<<"SPAWN|id="<<id<<"|type="<<w.entity_type[id]<<"|char="<<entityChar(w.entity_type[id])<<endl;

    id=w.entity_count++;
    w.pos_x[id]=2;w.pos_y[id]=7;w.hp[id]=15;w.alive[id]=true;
    w.entity_type[id]=ETYPE_GUARD;
    cout<<"SPAWN|id="<<id<<"|type="<<w.entity_type[id]<<"|char="<<entityChar(w.entity_type[id])<<endl;

    id=w.entity_count++;
    w.pos_x[id]=8;w.pos_y[id]=1;w.hp[id]=20;w.alive[id]=true;
    w.entity_type[id]=ETYPE_NPC;
    cout<<"SPAWN|id="<<id<<"|type="<<w.entity_type[id]<<"|char="<<entityChar(w.entity_type[id])<<endl;

    cout<<"ENTITY_COUNT|"<<w.entity_count<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Player spawns with type 0", expectedOutput: "SPAWN|id=0|type=0|char=@", isPattern: false },
      { id: "t2", description: "Enemy spawns with type 1", expectedOutput: "SPAWN|id=1|type=1|char=E", isPattern: false },
      { id: "t3", description: "Guard spawns with type 2", expectedOutput: "SPAWN|id=2|type=2|char=G", isPattern: false },
      { id: "t4", description: "NPC spawns with type 3", expectedOutput: "SPAWN|id=3|type=3|char=N", isPattern: false },
      { id: "t5", description: "Total entity count", expectedOutput: "ENTITY_COUNT|4", isPattern: false },
    ],
    hints: [
      "Add int entity_type[MAX_E] to the World struct, right after the alive array.",
      "entityChar uses if/else: ETYPE_PLAYER returns '@', ETYPE_ENEMY returns 'E', etc.",
      "For each spawn, set w.entity_type[id] = ETYPE_XXX before the cout SPAWN line."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: NPCs in the Dungeon",
    type: "game_builder",
    instructions: `# NPCs in the Dungeon

## Mental Model

Adding NPCs to the full dungeon RPG means: (1) adding entity_type to WorldState, (2) setting types during loadRoom based on spawn characters, (3) using type checks in combat (only attack enemies/guards), AI (only move enemies), and poison (only guards inflict it). The 'N' character in room data spawns an NPC that the player can see but not attack.

## What Breaks Without This

Without entity types in the full game, all non-player entities are treated the same. Combat targets NPCs. AI moves shopkeepers. Poison comes from quest givers. The game can't distinguish friend from foe because there's no data to make the distinction.

## The Fix: Entity Type in WorldState

Add \`int entity_type[MAX_E]\` to WorldState. In loadRoom, set types: '@' \u2192 ETYPE_PLAYER, 'E' \u2192 ETYPE_ENEMY, 'G' \u2192 ETYPE_GUARD, 'N' \u2192 ETYPE_NPC. Update combat to only target ETYPE_ENEMY and ETYPE_GUARD. Update AI movement to only move ETYPE_ENEMY. Update poison to only apply from ETYPE_GUARD. NPCs just stand there — for now.

## Key Concepts
- entity_type array integrated into full WorldState
- loadRoom sets types from spawn characters
- System passes filter by entity type
- NPCs are passive — no combat, no AI, no effects

## Performance Insight

Adding one integer comparison per entity per system pass. The entity_type array is 64 bytes for 16 entities — sits in cache alongside other entity arrays. Zero overhead increase in practice.

## Memory Insight

64 bytes added to WorldState. Total struct size grows from ~1.2KB to ~1.26KB. Still fits comfortably in L1 cache. No heap. Gate A compliant.

## Your Task

Add entity_type to WorldState and loadRoom. Add 'N' spawn character for NPCs. Update combat and AI passes to check entity_type. Place an NPC in the room and verify it appears but isn't attacked or moved.

## Beginner Trap

**Forgetting to update ALL system passes.** If you add entity_type to combat but not to the AI movement pass, NPCs will wander around the room. If you add it to AI but not poison, NPCs will poison the player. Every pass that treats entities differently by type must check entity_type.

## Elite Insight

Baldur's Gate uses faction flags to determine who attacks whom. NPCs, enemies, neutral creatures, and allies all share one entity table. The faction flag tells the combat system: "friendly NPCs don't get targeted." Your entity_type serves the same role — a data-driven faction system. The production version adds faction relationships (hostile, neutral, friendly) as a lookup table.

## Systems Thinking Connection

This type-based filtering parallels the Space Shooter path's entity tag system — both use integer flags to control which systems process which entities. The Platformer path uses a similar pattern for hazards vs platforms vs collectibles.

## Skill Reinforcement

Lesson 34 introduced behavior_id for enemy AI variation. entity_type is a broader categorization — it determines which systems process the entity at all, not just how. Lesson 52 adds interaction commands specifically for NPC-type entities.

## Mastery Check

If you add a new entity type (ETYPE_MERCHANT=4), what must you update?
Answer: (1) Add the constant. (2) Add a spawn character in loadRoom. (3) Add entityChar mapping. (4) Review every system pass to decide how merchants are treated (skip combat? skip AI? special interaction?). The data is cheap — the design decisions are the real work.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
const int MODE_PLAYING=0;
const int MODE_SHOPPING=1;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};

const int ITEM_TYPE_WEAPON=0;const int ITEM_TYPE_ARMOR=1;const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3},{3,2}};

struct LootEntry{int item_id;int weight;};
const LootEntry LOOT_TABLE_E1[]={{0,1},{4,3},{ITEM_NONE,6}};
const int LOOT_COUNT_E1=3;
const LootEntry LOOT_TABLE_E2[]={{2,2},{4,3},{ITEM_NONE,5}};
const int LOOT_COUNT_E2=3;

int rollLoot(const LootEntry* table,int count,RNG& r){
    int total=0;
    for(int i=0;i<count;i++) total+=table[i].weight;
    if(total<=0) return ITEM_NONE;
    int roll=(int)(rng_next(r)%total);
    int acc=0;
    for(int i=0;i<count;i++){
        acc+=table[i].weight;
        if(roll<acc) return table[i].item_id;
    }
    return table[count-1].item_id;
}

const LootEntry* getLootTable(int damage_id,int& out_count){
    if(damage_id==1){out_count=LOOT_COUNT_E1;return LOOT_TABLE_E1;}
    if(damage_id==2){out_count=LOOT_COUNT_E2;return LOOT_TABLE_E2;}
    out_count=0;return nullptr;
}

const int EFFECT_NONE=0;
const int EFFECT_POISON=1;
const int MAX_EFFECTS=4;
struct StatusEffect{int type;int magnitude;int turns;};

// TODO: Add entity type constants
// const int ETYPE_PLAYER=0; ETYPE_ENEMY=1; ETYPE_GUARD=2; ETYPE_NPC=3;

struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;int buy_id;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false,-1};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true;
    else if(c=='q') cmd.close_shop=true;
    else if(c>='1'&&c<='5') cmd.buy_id=c-'1';
    return cmd;
}

struct CombatEvent{int src;int target;int dmg;int hp_after;bool killed;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    // TODO: Add int entity_type[MAX_E]
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    CombatEvent event_log[MAX_EVENTS];int event_count;
    int weapon_id;int armor_id;
    int gold;int mode;
    StatusEffect player_effects[MAX_EFFECTS];
    int player_effect_count;
};

void applyEffect(WorldState& w,int type,int magnitude,int turns){
    for(int i=0;i<w.player_effect_count;i++){
        if(w.player_effects[i].type==type) return;
    }
    if(w.player_effect_count>=MAX_EFFECTS) return;
    w.player_effects[w.player_effect_count++]={type,magnitude,turns};
    cout<<"EFFECT_APPLY|type="<<type<<"|mag="<<magnitude<<"|turns="<<turns<<endl;
}

void processStatus(WorldState& w){
    int i=0;
    while(i<w.player_effect_count){
        StatusEffect& fx=w.player_effects[i];
        if(fx.type==EFFECT_POISON){
            w.hp[0]-=fx.magnitude;
            fx.turns--;
            cout<<"STATUS|poison|dmg="<<fx.magnitude<<"|hp="<<w.hp[0]<<"|turns_left="<<fx.turns<<endl;
            if(fx.turns<=0){
                cout<<"STATUS|expired|type="<<fx.type<<endl;
                for(int j=i;j<w.player_effect_count-1;j++) w.player_effects[j]=w.player_effects[j+1];
                w.player_effect_count--;
                continue;
            }
        }
        i++;
    }
}

bool tryBuyItem(WorldState& w, int item_id){
    if(item_id<0||item_id>=ITEM_COUNT) return false;
    if(w.gold<ITEM_TABLE[item_id].value) return false;
    if(w.inv_count>=INV_SIZE) return false;
    w.gold-=ITEM_TABLE[item_id].value;
    w.inventory[w.inv_count++]=item_id;
    return true;
}

// TODO: Update loadRoom to handle 'N' spawn character and set entity_type
const char ROOM_DATA[]=
    "##########""#@...E...#""#........#""#........#""#........#"
    "#........#""#........#""#.G......#""#......N.#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;
    w.gold=50;w.mode=MODE_PLAYING;w.player_effect_count=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
            // TODO: Set entity_type[id]=ETYPE_PLAYER
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=10;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;w.grid[y][x]='.';
            // TODO: Set entity_type
        }else if(c=='G'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=15;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=2;w.grid[y][x]='.';
            // TODO: Set entity_type
        // TODO: Add 'N' case for NPC spawning
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
    for(int i=0;i<w.entity_count;i++){
        // TODO: Print SPAWN line with entity type
    }
}

// TODO: Update game_tick combat to only target ETYPE_ENEMY and ETYPE_GUARD
// TODO: Update AI movement to only move ETYPE_ENEMY
// TODO: Update poison check to only apply from ETYPE_GUARD

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){w.mode=MODE_SHOPPING;cout<<"SHOP|open"<<endl;return;}
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.attack){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
                // TODO: Check entity_type — only attack ETYPE_ENEMY or ETYPE_GUARD
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){
                    int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT) dmg+=ITEM_TABLE[w.weapon_id].stat;
                    w.hp[i]-=dmg;
                    cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                    if(w.hp[i]<=0){w.alive[i]=false;
                        int bg=GOLD_TABLE[w.damage_id[i]].base;int bn=0;
                        if(GOLD_TABLE[w.damage_id[i]].bonus_range>0) bn=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                        w.gold+=bg+bn;cout<<"KILL|id="<<i<<endl;
                        int lc=0;
                        const LootEntry* lt=getLootTable(w.damage_id[i],lc);
                        if(lt){
                            int dropped=rollLoot(lt,lc,w.rng);
                            if(dropped!=ITEM_NONE&&w.inv_count<INV_SIZE){
                                w.inventory[w.inv_count++]=dropped;
                                cout<<"LOOT|"<<ITEM_TABLE[dropped].name<<"|id="<<dropped<<endl;
                            }else if(dropped==ITEM_NONE){
                                cout<<"LOOT|nothing"<<endl;
                            }
                        }
                    }
                    if(w.event_count<MAX_EVENTS){CombatEvent& ev=w.event_log[w.event_count++];
                        ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];ev.killed=(w.hp[i]<=0);}
                    break;
                }
            }
        }
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            // TODO: Only check poison for ETYPE_GUARD
            if(w.damage_id[i]==2){
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1) applyEffect(w,EFFECT_POISON,2,3);
            }
        }
        processStatus(w);
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            // TODO: Only move ETYPE_ENEMY
            const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
            int edx=0;
            if(bh.chase_x){if(w.pos_x[i]<w.pos_x[0]) edx=1;else if(w.pos_x[i]>w.pos_x[0]) edx=-1;}
            int enx=w.pos_x[i]+edx;
            if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL) w.pos_x[i]=enx;
        }
    }else if(w.mode==MODE_SHOPPING){
        if(cmd.close_shop){w.mode=MODE_PLAYING;cout<<"SHOP|close"<<endl;}
        else if(cmd.buy_id>=0){
            bool ok=tryBuyItem(w,cmd.buy_id);
            if(ok) cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|cost="<<ITEM_TABLE[cmd.buy_id].value<<"|gold="<<w.gold<<"|ok"<<endl;
            else cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|fail"<<endl;
        }
    }
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<endl;
    cout<<"HUD_GOLD|"<<w.gold<<endl;
    cout<<"HUD_INV|"<<w.inv_count<<" items"<<endl;
    cout<<"HUD_FX|"<<w.player_effect_count<<" active"<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk near NPC — should NOT trigger combat or poison
    char inputs[]={'s','s','s','s','s','s','s','d','d','d','d','d','f'};
    for(int i=0;i<13;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
const int MODE_PLAYING=0;
const int MODE_SHOPPING=1;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};

const int ITEM_TYPE_WEAPON=0;const int ITEM_TYPE_ARMOR=1;const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},
    {ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},
    {ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3},{3,2}};

struct LootEntry{int item_id;int weight;};
const LootEntry LOOT_TABLE_E1[]={{0,1},{4,3},{ITEM_NONE,6}};
const int LOOT_COUNT_E1=3;
const LootEntry LOOT_TABLE_E2[]={{2,2},{4,3},{ITEM_NONE,5}};
const int LOOT_COUNT_E2=3;

int rollLoot(const LootEntry* table,int count,RNG& r){
    int total=0;
    for(int i=0;i<count;i++) total+=table[i].weight;
    if(total<=0) return ITEM_NONE;
    int roll=(int)(rng_next(r)%total);
    int acc=0;
    for(int i=0;i<count;i++){
        acc+=table[i].weight;
        if(roll<acc) return table[i].item_id;
    }
    return table[count-1].item_id;
}

const LootEntry* getLootTable(int damage_id,int& out_count){
    if(damage_id==1){out_count=LOOT_COUNT_E1;return LOOT_TABLE_E1;}
    if(damage_id==2){out_count=LOOT_COUNT_E2;return LOOT_TABLE_E2;}
    out_count=0;return nullptr;
}

const int EFFECT_NONE=0;
const int EFFECT_POISON=1;
const int MAX_EFFECTS=4;
struct StatusEffect{int type;int magnitude;int turns;};

const int ETYPE_PLAYER=0;
const int ETYPE_ENEMY=1;
const int ETYPE_GUARD=2;
const int ETYPE_NPC=3;

char entityChar(int etype){
    if(etype==ETYPE_PLAYER) return '@';
    if(etype==ETYPE_ENEMY) return 'E';
    if(etype==ETYPE_GUARD) return 'G';
    if(etype==ETYPE_NPC) return 'N';
    return '?';
}

struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;int buy_id;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false,-1};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true;
    else if(c=='q') cmd.close_shop=true;
    else if(c>='1'&&c<='5') cmd.buy_id=c-'1';
    return cmd;
}

struct CombatEvent{int src;int target;int dmg;int hp_after;bool killed;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_type[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    CombatEvent event_log[MAX_EVENTS];int event_count;
    int weapon_id;int armor_id;
    int gold;int mode;
    StatusEffect player_effects[MAX_EFFECTS];
    int player_effect_count;
};

void applyEffect(WorldState& w,int type,int magnitude,int turns){
    for(int i=0;i<w.player_effect_count;i++){
        if(w.player_effects[i].type==type) return;
    }
    if(w.player_effect_count>=MAX_EFFECTS) return;
    w.player_effects[w.player_effect_count++]={type,magnitude,turns};
    cout<<"EFFECT_APPLY|type="<<type<<"|mag="<<magnitude<<"|turns="<<turns<<endl;
}

void processStatus(WorldState& w){
    int i=0;
    while(i<w.player_effect_count){
        StatusEffect& fx=w.player_effects[i];
        if(fx.type==EFFECT_POISON){
            w.hp[0]-=fx.magnitude;
            fx.turns--;
            cout<<"STATUS|poison|dmg="<<fx.magnitude<<"|hp="<<w.hp[0]<<"|turns_left="<<fx.turns<<endl;
            if(fx.turns<=0){
                cout<<"STATUS|expired|type="<<fx.type<<endl;
                for(int j=i;j<w.player_effect_count-1;j++) w.player_effects[j]=w.player_effects[j+1];
                w.player_effect_count--;
                continue;
            }
        }
        i++;
    }
}

bool tryBuyItem(WorldState& w, int item_id){
    if(item_id<0||item_id>=ITEM_COUNT) return false;
    if(w.gold<ITEM_TABLE[item_id].value) return false;
    if(w.inv_count>=INV_SIZE) return false;
    w.gold-=ITEM_TABLE[item_id].value;
    w.inventory[w.inv_count++]=item_id;
    return true;
}

const char ROOM_DATA[]=
    "##########""#@...E...#""#........#""#........#""#........#"
    "#........#""#........#""#.G......#""#......N.#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;
    w.gold=50;w.mode=MODE_PLAYING;w.player_effect_count=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_PLAYER;
            w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=10;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;
            w.entity_type[id]=ETYPE_ENEMY;w.grid[y][x]='.';
        }else if(c=='G'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=15;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=2;
            w.entity_type[id]=ETYPE_GUARD;w.grid[y][x]='.';
        }else if(c=='N'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=20;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_NPC;w.grid[y][x]='.';
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
    for(int i=0;i<w.entity_count;i++){
        cout<<"SPAWN|id="<<i<<"|type="<<w.entity_type[i]<<"|char="<<entityChar(w.entity_type[i])<<endl;
    }
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){w.mode=MODE_SHOPPING;cout<<"SHOP|open"<<endl;return;}
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.attack){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
                if(w.entity_type[i]!=ETYPE_ENEMY&&w.entity_type[i]!=ETYPE_GUARD) continue;
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){
                    int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                    if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT) dmg+=ITEM_TABLE[w.weapon_id].stat;
                    w.hp[i]-=dmg;
                    cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                    if(w.hp[i]<=0){w.alive[i]=false;
                        int bg=GOLD_TABLE[w.damage_id[i]].base;int bn=0;
                        if(GOLD_TABLE[w.damage_id[i]].bonus_range>0) bn=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                        w.gold+=bg+bn;cout<<"KILL|id="<<i<<endl;
                        int lc=0;
                        const LootEntry* lt=getLootTable(w.damage_id[i],lc);
                        if(lt){
                            int dropped=rollLoot(lt,lc,w.rng);
                            if(dropped!=ITEM_NONE&&w.inv_count<INV_SIZE){
                                w.inventory[w.inv_count++]=dropped;
                                cout<<"LOOT|"<<ITEM_TABLE[dropped].name<<"|id="<<dropped<<endl;
                            }else if(dropped==ITEM_NONE){
                                cout<<"LOOT|nothing"<<endl;
                            }
                        }
                    }
                    if(w.event_count<MAX_EVENTS){CombatEvent& ev=w.event_log[w.event_count++];
                        ev.src=0;ev.target=i;ev.dmg=dmg;ev.hp_after=w.hp[i];ev.killed=(w.hp[i]<=0);}
                    break;
                }
            }
        }
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            if(w.entity_type[i]==ETYPE_GUARD){
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1) applyEffect(w,EFFECT_POISON,2,3);
            }
        }
        processStatus(w);
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            if(w.entity_type[i]!=ETYPE_ENEMY) continue;
            const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
            int edx=0;
            if(bh.chase_x){if(w.pos_x[i]<w.pos_x[0]) edx=1;else if(w.pos_x[i]>w.pos_x[0]) edx=-1;}
            int enx=w.pos_x[i]+edx;
            if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL) w.pos_x[i]=enx;
        }
    }else if(w.mode==MODE_SHOPPING){
        if(cmd.close_shop){w.mode=MODE_PLAYING;cout<<"SHOP|close"<<endl;}
        else if(cmd.buy_id>=0){
            bool ok=tryBuyItem(w,cmd.buy_id);
            if(ok) cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|cost="<<ITEM_TABLE[cmd.buy_id].value<<"|gold="<<w.gold<<"|ok"<<endl;
            else cout<<"BUY|"<<ITEM_TABLE[cmd.buy_id].name<<"|fail"<<endl;
        }
    }
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&(w.entity_type[i]==ETYPE_ENEMY||w.entity_type[i]==ETYPE_GUARD)) ae++;
    int npcs=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_NPC) npcs++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|npcs="<<npcs<<endl;
    cout<<"HUD_GOLD|"<<w.gold<<endl;
    cout<<"HUD_INV|"<<w.inv_count<<" items"<<endl;
    cout<<"HUD_FX|"<<w.player_effect_count<<" active"<<endl;
}

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++)
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk near NPC — should NOT trigger combat or poison
    char inputs[]={'s','s','s','s','s','s','s','d','d','d','d','d','f'};
    for(int i=0;i<13;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads with 4 entities", expectedOutput: "LOAD|room=10x10|entities=4", isPattern: false },
      { id: "g2", description: "Player spawned", expectedOutput: "SPAWN|id=0|type=0|char=@", isPattern: false },
      { id: "g3", description: "NPC spawned", expectedOutput: "SPAWN|id=3|type=3|char=N", isPattern: false },
      { id: "g4", description: "HUD shows NPC count", expectedOutput: "npcs=1", isPattern: true },
      { id: "g5", description: "Attack near NPC does not target NPC", expectedOutput: "HUD|hp=", isPattern: true },
      { id: "g6", description: "NPC stays alive throughout", expectedOutput: "npcs=1", isPattern: true },
    ],
    hints: [
      "Add int entity_type[MAX_E] to WorldState. Add ETYPE constants. Add 'N' case in loadRoom that sets ETYPE_NPC.",
      "In the combat loop, add: if(w.entity_type[i]!=ETYPE_ENEMY&&w.entity_type[i]!=ETYPE_GUARD) continue;",
      "In the AI movement loop, add: if(w.entity_type[i]!=ETYPE_ENEMY) continue; In the poison loop, check: if(w.entity_type[i]==ETYPE_GUARD)."
    ],
    estimatedMinutes: 15,
  },
};
