import { Lesson } from "@/types/lesson";

export const lessonRPG54: Lesson = {
  id: "rpg-54-quest-struct-v0",
  title: "Quest Struct v0",
  description: "Quests are data: a struct with state, target, and reward — tracked in fixed-size arrays, displayed in the HUD.",
  order: 54,
  xpReward: 100,
  tier: "pro",
  concepts: ["quest as data struct", "quest state tracking", "fixed-size quest array", "quest HUD display"],
  part1: {
    title: "Concept: Quest as State Machine Data",
    type: "concept",
    instructions: `# Quest Struct v0

## Mental Model

A quest is not a script. It's a data struct with three fields: state (inactive, active, complete), a target condition (kill N enemies, reach a location), and a reward (gold, item, XP). The quest system doesn't "run" quests — it checks conditions each tick and advances state when conditions are met. Quests are state machines driven by data, not code.

## What Breaks Without This

Without quest structs, progression is aimless. The player kills enemies and collects gold, but there's no goal, no structure, no reward for specific accomplishments. The game has no narrative arc — just an open room with things to hit. Players need goals. Quests provide them.

## The Fix: Quest Struct

Define a \`Quest\` struct:
- \`int state\`: QUEST_INACTIVE=0, QUEST_ACTIVE=1, QUEST_COMPLETE=2
- \`int type\`: QUEST_KILL=0 (kill N enemies), QUEST_REACH=1 (reach location)
- \`int target_count\`: how many kills needed (for kill quests)
- \`int current_count\`: progress toward target
- \`int reward_gold\`: gold reward on completion
- \`int reward_item\`: item ID reward (-1 for none)
- \`char name[32]\`: quest display name

Store quests in a fixed-size array in WorldState. Display active quests in the HUD. When the player accepts a quest (via NPC interaction), set state to ACTIVE. When conditions are met, set state to COMPLETE.

## Key Concepts
- Quest struct with state, type, target, progress, reward
- Fixed-size quest array (MAX_QUESTS)
- State transitions: inactive \u2192 active \u2192 complete
- HUD display of active quest progress

## Performance Insight

Quest checks are O(quest_count) per tick — typically 3-5 quests. Each check is a simple comparison (state==ACTIVE, current>=target). No iteration over entities needed for the check itself — kill tracking updates current_count during the combat pass. The quest system is event-driven with tick-based display.

## Memory Insight

Each Quest struct is ~48 bytes. With MAX_QUESTS=4, that's 192 bytes in WorldState. Fixed-size, stack-resident. No heap. The quest array sits alongside inventory and effects — all part of the observable world state.

## Your Task

Define a Quest struct with the fields above. Create a small quest array with one kill quest. Write a function that checks quest progress and advances state. Display quest info.

Expected output:
\`\`\`
QUEST|Slay the Beast|state=active|progress=0/3
QUEST_UPDATE|Slay the Beast|progress=1/3
QUEST_UPDATE|Slay the Beast|progress=2/3
QUEST_UPDATE|Slay the Beast|progress=3/3
QUEST_COMPLETE|Slay the Beast|reward_gold=25
\`\`\`

## Beginner Trap

**Checking quest completion in the render pass.** Quest state transitions should happen in the resolve pass, not during rendering. If you check completion during render, the state change happens at display time — non-deterministic if render is skipped or called multiple times. Resolve quests in the tick pipeline, display in the HUD.

## Elite Insight

Baldur's Gate stores quests as journal entries with state flags. Diablo 3 uses quest structs with progress counters and reward packets — identical to your design. The Witcher 3's quest system is more complex (branching states, multiple objectives) but the core is the same: state + condition + reward. Your fixed-size array is the simplest correct implementation.

## Systems Thinking Connection

Quest state machines parallel the Platformer path's player FSM — both have explicit states with guarded transitions. The quest transitions on game events (kill, reach); the player transitions on physics events (land, jump, dash). Same pattern, different triggers.

## Skill Reinforcement

Lesson 37 introduced event logs for combat. Quest progress tracking responds to the same events — a kill event increments quest progress. Lesson 55 (milestone) will connect NPC interaction to quest acceptance and completion.

## Mastery Check

Why are quests stored as data structs instead of callback functions?
Answer: Data structs are serializable (save/load works), replayable (same state transitions every time), and observable (you can print quest state anytime). Callback functions are opaque — you can't save them, you can't inspect them, and they make determinism nearly impossible.`,
    starterCode: `#include <iostream>
using namespace std;

const int QUEST_INACTIVE=0;
const int QUEST_ACTIVE=1;
const int QUEST_COMPLETE=2;
const int QUEST_KILL=0;
const int MAX_QUESTS=4;

struct Quest{
    int state;
    int type;
    int target_count;
    int current_count;
    int reward_gold;
    int reward_item;
    char name[32];
};

// TODO: Write checkQuestProgress(Quest& q) that:
// If state==ACTIVE and current_count >= target_count, set state=COMPLETE
// Print QUEST_COMPLETE|{name}|reward_gold={reward_gold}

// TODO: Write incrementKillQuest(Quest quests[], int count) that:
// For each active kill quest, increment current_count
// Print QUEST_UPDATE|{name}|progress={current}/{target}
// Then call checkQuestProgress

int main(){
    Quest quests[MAX_QUESTS]={};
    quests[0]={QUEST_ACTIVE,QUEST_KILL,3,0,25,-1,"Slay the Beast"};

    cout<<"QUEST|"<<quests[0].name<<"|state=active|progress="<<quests[0].current_count<<"/"<<quests[0].target_count<<endl;

    // Simulate 3 kills
    for(int i=0;i<3;i++){
        incrementKillQuest(quests,1);
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int QUEST_INACTIVE=0;
const int QUEST_ACTIVE=1;
const int QUEST_COMPLETE=2;
const int QUEST_KILL=0;
const int MAX_QUESTS=4;

struct Quest{
    int state;
    int type;
    int target_count;
    int current_count;
    int reward_gold;
    int reward_item;
    char name[32];
};

void checkQuestProgress(Quest& q){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        q.state=QUEST_COMPLETE;
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}

void incrementKillQuest(Quest quests[],int count){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE) continue;
        if(quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i]);
    }
}

int main(){
    Quest quests[MAX_QUESTS]={};
    quests[0]={QUEST_ACTIVE,QUEST_KILL,3,0,25,-1,"Slay the Beast"};

    cout<<"QUEST|"<<quests[0].name<<"|state=active|progress="<<quests[0].current_count<<"/"<<quests[0].target_count<<endl;

    for(int i=0;i<3;i++){
        incrementKillQuest(quests,1);
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Quest initial state", expectedOutput: "QUEST|Slay the Beast|state=active|progress=0/3", isPattern: false },
      { id: "t2", description: "First kill updates progress", expectedOutput: "QUEST_UPDATE|Slay the Beast|progress=1/3", isPattern: false },
      { id: "t3", description: "Third kill completes quest", expectedOutput: "QUEST_COMPLETE|Slay the Beast|reward_gold=25", isPattern: false },
    ],
    hints: [
      "checkQuestProgress checks: if q.state==QUEST_ACTIVE and q.current_count >= q.target_count, set q.state=QUEST_COMPLETE.",
      "incrementKillQuest loops through quests, skips non-active and non-kill quests, increments current_count, prints update, then calls checkQuestProgress.",
      "The kill quest completes when current_count reaches target_count (3). Print QUEST_COMPLETE with the reward."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Quest Tracking in the Dungeon",
    type: "game_builder",
    instructions: `# Quest Tracking in the Dungeon

## Mental Model

Integrating quests into the dungeon RPG means: adding a quest array to WorldState, tracking kills in the combat pass, displaying quest progress in the HUD, and connecting quest acceptance to NPC interaction. For v0, the quest is pre-activated at room load. The player fights enemies, and the HUD shows quest progress updating toward completion.

## What Breaks Without This

Without quest tracking, kills are meaningless beyond gold and loot. The player has no goal. The HUD shows HP and inventory but no sense of progress toward a larger objective. Quests provide structure and purpose.

## The Fix: Quest Array in WorldState

Add \`Quest quests[MAX_QUESTS]\` and \`int quest_count\` to WorldState. Initialize a kill quest during loadRoom. In the combat kill block, call \`incrementKillQuest()\`. In renderHUD, display active quest progress. When the quest completes, print the reward.

## Key Concepts
- Quest array in WorldState
- Kill tracking in combat pass
- Quest progress in HUD
- Completion reward delivery

## Performance Insight

Quest checking adds O(MAX_QUESTS) per kill event — 4 comparisons. Not per tick, just per kill. The HUD display adds O(MAX_QUESTS) per render. Negligible overhead.

## Memory Insight

Quest array: 4 quests \u00d7 48 bytes = 192 bytes in WorldState. Total WorldState now ~1.5KB. Still fits in L1 cache. All stack-resident.

## Your Task

Add quest tracking to the dungeon. Initialize a "Clear the Room" kill quest (target: 2 kills). Fight enemies, watch quest progress update, and see the completion message. Display quest info in HUD.

## Beginner Trap

**Incrementing quest progress for ALL kills, including guards.** If a guard dies, should it count toward the kill quest? Define the quest type clearly — QUEST_KILL might only count ETYPE_ENEMY kills. Check the entity type in the combat pass before incrementing. For v0, count all combat kills.

## Elite Insight

Dark Souls tracks quest progress through world state changes — killing a boss advances the game state machine. There's no "quest log" UI, but internally, integer flags track completion. Your explicit quest struct is more transparent but architecturally identical: state flags driven by game events. FromSoftware just hides the UI. You display it.

## Systems Thinking Connection

Quest progress tracking mirrors the Space Shooter's wave completion system — both count events (kills, spawns) toward a threshold. When the threshold is met, the system transitions state. Same pattern: counter + threshold + state transition.

## Skill Reinforcement

Lesson 48 added loot drops on kill. This lesson adds quest progress on kill — another post-kill event. Lesson 55 (milestone) connects NPC interaction to quest acceptance, creating the full quest loop.

## Mastery Check

If two enemies die in the same turn, does the quest get +1 or +2 progress?
Answer: +1, because our combat system only attacks one enemy per turn (break after first hit). To get +2, you'd need area-of-effect damage, which we haven't implemented. The architecture supports it — just call incrementKillQuest inside the kill block, which runs per kill.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
const int MODE_PLAYING=0;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};

const int ITEM_TYPE_WEAPON=0;const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},{ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {0,2,8,"Leather"},{0,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3},{3,2}};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_GUARD=2;const int ETYPE_NPC=3;

const int QUEST_INACTIVE=0;const int QUEST_ACTIVE=1;const int QUEST_COMPLETE=2;
const int QUEST_KILL=0;
const int MAX_QUESTS=4;

struct Quest{int state;int type;int target_count;int current_count;int reward_gold;int reward_item;char name[32];};

// TODO: Write checkQuestProgress and incrementKillQuest functions

struct Command{int dx;int dy;bool attack;bool use_item;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='u') cmd.use_item=true;
    else if(c=='e') cmd.interact=true;
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
    int weapon_id;int armor_id;int gold;
    // TODO: Add Quest quests[MAX_QUESTS] and int quest_count
};

const char ROOM_DATA[]=
    "##########""#@...E...#""#........#""#........#""#.E......#"
    "#........#""#........#""#........#""#........#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;w.gold=50;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    // TODO: Initialize quest: "Clear the Room", QUEST_ACTIVE, QUEST_KILL, target=2, reward_gold=30
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_PLAYER;w.grid[y][x]='.';
            w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=8;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;
            w.entity_type[id]=ETYPE_ENEMY;w.grid[y][x]='.';
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            if(w.entity_type[i]!=ETYPE_ENEMY) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT) dmg+=ITEM_TABLE[w.weapon_id].stat;
                w.hp[i]-=dmg;
                cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){
                    w.alive[i]=false;
                    int bg=GOLD_TABLE[w.damage_id[i]].base;int bn=0;
                    if(GOLD_TABLE[w.damage_id[i]].bonus_range>0) bn=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                    w.gold+=bg+bn;
                    cout<<"KILL|id="<<i<<endl;
                    // TODO: Call incrementKillQuest(w.quests, w.quest_count) here
                }
                break;
            }
        }
    }
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]||w.entity_type[i]!=ETYPE_ENEMY) continue;
        const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
        int edx=0;
        if(bh.chase_x){if(w.pos_x[i]<w.pos_x[0]) edx=1;else if(w.pos_x[i]>w.pos_x[0]) edx=-1;}
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL) w.pos_x[i]=enx;
    }
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<endl;
    // TODO: Display active quest progress: QUEST|{name}|{current}/{target}
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to first enemy, kill it. Walk to second enemy, kill it.
    char inputs[]={'d','d','d','f','s','s','s','a','f'};
    for(int i=0;i<9;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int MAX_EVENTS=64;
const int ITEM_NONE=-1;
const int MAX_HP=30;
const int MODE_PLAYING=0;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};

const int ITEM_TYPE_WEAPON=0;const int ITEM_TYPE_CONSUMABLE=2;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},{ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {0,2,8,"Leather"},{0,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3},{3,2}};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_GUARD=2;const int ETYPE_NPC=3;

const int QUEST_INACTIVE=0;const int QUEST_ACTIVE=1;const int QUEST_COMPLETE=2;
const int QUEST_KILL=0;
const int MAX_QUESTS=4;

struct Quest{int state;int type;int target_count;int current_count;int reward_gold;int reward_item;char name[32];};

void checkQuestProgress(Quest& q){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        q.state=QUEST_COMPLETE;
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}

void incrementKillQuest(Quest quests[],int count){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE) continue;
        if(quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i]);
    }
}

struct Command{int dx;int dy;bool attack;bool use_item;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='u') cmd.use_item=true;
    else if(c=='e') cmd.interact=true;
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
    int weapon_id;int armor_id;int gold;
    Quest quests[MAX_QUESTS];int quest_count;
};

const char ROOM_DATA[]=
    "##########""#@...E...#""#........#""#........#""#.E......#"
    "#........#""#........#""#........#""#........#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;w.gold=50;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    w.quest_count=1;
    Quest& q=w.quests[0];
    q.state=QUEST_ACTIVE;q.type=QUEST_KILL;q.target_count=2;q.current_count=0;
    q.reward_gold=30;q.reward_item=ITEM_NONE;
    strcpy(q.name,"Clear the Room");
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_PLAYER;w.grid[y][x]='.';
            w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=8;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;
            w.entity_type[id]=ETYPE_ENEMY;w.grid[y][x]='.';
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
            if(w.entity_type[i]!=ETYPE_ENEMY) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0&&w.weapon_id<ITEM_COUNT) dmg+=ITEM_TABLE[w.weapon_id].stat;
                w.hp[i]-=dmg;
                cout<<"COMBAT|src=0|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){
                    w.alive[i]=false;
                    int bg=GOLD_TABLE[w.damage_id[i]].base;int bn=0;
                    if(GOLD_TABLE[w.damage_id[i]].bonus_range>0) bn=rng_next(w.rng)%GOLD_TABLE[w.damage_id[i]].bonus_range;
                    w.gold+=bg+bn;
                    cout<<"KILL|id="<<i<<endl;
                    incrementKillQuest(w.quests,w.quest_count);
                }
                break;
            }
        }
    }
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]||w.entity_type[i]!=ETYPE_ENEMY) continue;
        const BehaviorRow& bh=BEHAVIOR_TABLE[w.behavior_id[i]];
        int edx=0;
        if(bh.chase_x){if(w.pos_x[i]<w.pos_x[0]) edx=1;else if(w.pos_x[i]>w.pos_x[0]) edx=-1;}
        int enx=w.pos_x[i]+edx;
        if(enx>=0&&enx<W&&w.grid[w.pos_y[i]][enx]!=TILE_WALL) w.pos_x[i]=enx;
    }
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<endl;
    for(int i=0;i<w.quest_count;i++){
        if(w.quests[i].state==QUEST_ACTIVE)
            cout<<"QUEST|"<<w.quests[i].name<<"|"<<w.quests[i].current_count<<"/"<<w.quests[i].target_count<<endl;
        else if(w.quests[i].state==QUEST_COMPLETE)
            cout<<"QUEST|"<<w.quests[i].name<<"|DONE"<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to first enemy, kill it. Walk to second enemy, kill it.
    char inputs[]={'d','d','d','f','s','s','s','a','f'};
    for(int i=0;i<9;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads with enemies", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g2", description: "First kill updates quest", expectedOutput: "QUEST_UPDATE|Clear the Room|progress=1/2", isPattern: false },
      { id: "g3", description: "Second kill completes quest", expectedOutput: "QUEST_COMPLETE|Clear the Room|reward_gold=30", isPattern: false },
      { id: "g4", description: "HUD shows quest progress", expectedOutput: "QUEST|Clear the Room|", isPattern: true },
      { id: "g5", description: "HUD shows quest complete", expectedOutput: "QUEST|Clear the Room|DONE", isPattern: false },
      { id: "g6", description: "Combat damage shown", expectedOutput: "COMBAT|src=0|target=", isPattern: true },
    ],
    hints: [
      "Add Quest quests[MAX_QUESTS] and int quest_count to WorldState. Initialize one kill quest in loadRoom with strcpy for the name.",
      "Write incrementKillQuest that loops quests, checks state==ACTIVE and type==QUEST_KILL, increments current_count, prints update, and calls checkQuestProgress.",
      "Call incrementKillQuest(w.quests, w.quest_count) in the kill block after KILL print. In renderHUD, display active quest progress and DONE for complete."
    ],
    estimatedMinutes: 15,
  },
};
