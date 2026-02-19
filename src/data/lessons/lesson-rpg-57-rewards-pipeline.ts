import { Lesson } from "@/types/lesson";

export const lessonRPG57: Lesson = {
  id: "rpg-57-rewards-pipeline",
  title: "Rewards Pipeline",
  description: "Rewards applied in a dedicated resolve pass as data commands — not scattered side effects in quest logic.",
  order: 57,
  xpReward: 100,
  tier: "pro",
  concepts: ["reward commands", "resolve pass", "side-effect isolation", "command pipeline", "data-driven rewards"],
  part1: {
    title: "Rewards as Commands, Not Side Effects",
    type: "concept",
    instructions: `# Rewards Pipeline: Commands, Not Side Effects

## Mental Model

In Lesson 56, the FSM action handler directly modifies gold:

\`\`\`cpp
if(act==ACTION_REWARD){
    gold += q.reward_gold;  // Side effect buried in FSM
    cout << "QUEST_REWARD|...";
}
\`\`\`

This works for one reward type. But real RPGs give rewards like:
- Gold
- Items (add to inventory)
- XP (triggers level-up checks)
- Stat boosts
- Unlock new areas

If each of these is a side effect buried inside FSM processing, you get spaghetti: quest logic tangled with inventory logic tangled with XP logic. Every new reward type requires editing the FSM handler.

## The Fix: Reward Commands

Instead of executing rewards immediately, **queue them as data**:

\`\`\`cpp
struct RewardCmd {
    int type;    // REWARD_GOLD, REWARD_ITEM, REWARD_XP
    int value;   // amount or item_id
};
\`\`\`

The FSM handler enqueues rewards. A separate **resolve pass** applies them:

\`\`\`cpp
// In FSM action:
if(act == ACTION_REWARD) {
    enqueueReward(rewards, REWARD_GOLD, q.reward_gold);
    if(q.reward_item >= 0)
        enqueueReward(rewards, REWARD_ITEM, q.reward_item);
}

// In resolve pass:
void resolveRewards(WorldState& w, RewardCmd rewards[], int& count) {
    for(int i = 0; i < count; i++) {
        if(rewards[i].type == REWARD_GOLD) w.gold += rewards[i].value;
        else if(rewards[i].type == REWARD_ITEM) addItem(w, rewards[i].value);
        else if(rewards[i].type == REWARD_XP) w.xp += rewards[i].value;
    }
    count = 0; // drain the queue
}
\`\`\`

## Why This Matters

| Approach | Add new reward type | Debug rewards | Replay safe? |
|----------|-------------------|---------------|-------------|
| Side effects | Edit every caller | Hunt through scattered code | Maybe |
| Reward commands | Add one case in resolveRewards | Print the queue | Yes — queue is data |

The command pipeline pattern: intent → queue → resolve. Same pattern as movement commands, combat commands, now reward commands.

## Beginner Trap: God Function

Beginners often create one huge function that handles everything: "processQuest does combat, gives gold, adds items, checks levels." This is untestable, unreplayable, and breaks when any subsystem changes.

The fix: each system does ONE thing. Quests produce reward commands. The reward resolver applies them. The inventory system handles items. No cross-talk.

## Elite Insight: Event Sourcing

This pattern is called **event sourcing** in production systems. Instead of directly mutating state, you log commands (events) and replay them. If something goes wrong, you can inspect the event log. This is how databases, game replay systems, and financial ledgers work.

## Memory Insight

A reward queue of 8 entries is 8 × 8 bytes = 64 bytes. Pre-allocated. No heap. The queue drains every tick. Gate A compliant.

## What You'll Build

In Part 1, you'll define the RewardCmd struct, the enqueue/resolve functions, and process a sequence of rewards. In Part 2, you'll integrate it into the full game with the FSM driving reward enqueuing.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_REWARDS=8;
const int REWARD_GOLD=0;const int REWARD_ITEM=1;const int REWARD_XP=2;

// TODO: Define RewardCmd struct with type and value fields

// TODO: Implement enqueueReward(RewardCmd rewards[], int& count, int type, int value)
// Add a reward to the queue if count < MAX_REWARDS
// Print REWARD_QUEUE|type=T|value=V

// TODO: Implement resolveRewards(int& gold, int inventory[], int& inv_count, int& xp,
//                                  RewardCmd rewards[], int& reward_count)
// For each reward in queue:
//   REWARD_GOLD: gold += value, print REWARD_APPLY|gold+value
//   REWARD_ITEM: inventory[inv_count++] = value, print REWARD_APPLY|item=value
//   REWARD_XP: xp += value, print REWARD_APPLY|xp+value
// Then set reward_count = 0

int main(){
    int gold=10,xp=0;
    int inventory[5]={-1,-1,-1,-1,-1};int inv_count=0;
    RewardCmd rewards[MAX_REWARDS];int reward_count=0;

    // Enqueue some rewards
    enqueueReward(rewards,reward_count,REWARD_GOLD,30);
    enqueueReward(rewards,reward_count,REWARD_ITEM,2);
    enqueueReward(rewards,reward_count,REWARD_XP,50);
    cout<<"QUEUED|"<<reward_count<<endl;

    // Resolve all rewards in one pass
    resolveRewards(gold,inventory,inv_count,xp,rewards,reward_count);
    cout<<"AFTER|gold="<<gold<<"|xp="<<xp<<"|items="<<inv_count<<endl;
    cout<<"DRAINED|"<<reward_count<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_REWARDS=8;
const int REWARD_GOLD=0;const int REWARD_ITEM=1;const int REWARD_XP=2;

struct RewardCmd{int type;int value;};

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){
        rewards[count].type=type;rewards[count].value=value;count++;
        cout<<"REWARD_QUEUE|type="<<type<<"|value="<<value<<endl;
    }
}

void resolveRewards(int& gold,int inventory[],int& inv_count,int& xp,
                    RewardCmd rewards[],int& reward_count){
    for(int i=0;i<reward_count;i++){
        if(rewards[i].type==REWARD_GOLD){
            gold+=rewards[i].value;
            cout<<"REWARD_APPLY|gold+"<<rewards[i].value<<endl;
        }else if(rewards[i].type==REWARD_ITEM){
            inventory[inv_count++]=rewards[i].value;
            cout<<"REWARD_APPLY|item="<<rewards[i].value<<endl;
        }else if(rewards[i].type==REWARD_XP){
            xp+=rewards[i].value;
            cout<<"REWARD_APPLY|xp+"<<rewards[i].value<<endl;
        }
    }
    reward_count=0;
}

int main(){
    int gold=10,xp=0;
    int inventory[5]={-1,-1,-1,-1,-1};int inv_count=0;
    RewardCmd rewards[MAX_REWARDS];int reward_count=0;

    enqueueReward(rewards,reward_count,REWARD_GOLD,30);
    enqueueReward(rewards,reward_count,REWARD_ITEM,2);
    enqueueReward(rewards,reward_count,REWARD_XP,50);
    cout<<"QUEUED|"<<reward_count<<endl;

    resolveRewards(gold,inventory,inv_count,xp,rewards,reward_count);
    cout<<"AFTER|gold="<<gold<<"|xp="<<xp<<"|items="<<inv_count<<endl;
    cout<<"DRAINED|"<<reward_count<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Gold reward queued", expectedOutput: "REWARD_QUEUE|type=0|value=30", isPattern: false },
      { id: "t2", description: "Item reward queued", expectedOutput: "REWARD_QUEUE|type=1|value=2", isPattern: false },
      { id: "t3", description: "XP reward queued", expectedOutput: "REWARD_QUEUE|type=2|value=50", isPattern: false },
      { id: "t4", description: "Three rewards in queue", expectedOutput: "QUEUED|3", isPattern: false },
      { id: "t5", description: "Gold applied", expectedOutput: "REWARD_APPLY|gold+30", isPattern: false },
      { id: "t6", description: "Item applied", expectedOutput: "REWARD_APPLY|item=2", isPattern: false },
      { id: "t7", description: "XP applied", expectedOutput: "REWARD_APPLY|xp+50", isPattern: false },
      { id: "t8", description: "Final state correct", expectedOutput: "AFTER|gold=40|xp=50|items=1", isPattern: false },
      { id: "t9", description: "Queue drained", expectedOutput: "DRAINED|0", isPattern: false },
    ],
    hints: [
      "RewardCmd is a simple struct with two int fields: type and value. The enqueue function sets rewards[count] and increments count.",
      "resolveRewards loops from 0 to reward_count, switches on type, applies the effect, then sets reward_count=0 at the end.",
      "REWARD_ITEM adds the value as an item ID to inventory[inv_count] and increments inv_count. Check that inv_count is within bounds.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Reward Resolve Pass in the Game Tick",
    type: "game_builder",
    instructions: `# Integrate Rewards Pipeline into the Full Game

## Goal

Add a \`RewardCmd\` queue to \`WorldState\`. The FSM 's ACTION_REWARD now enqueues rewards instead of directly modifying gold. A new \`resolveRewards\` pass runs after quest processing to apply all queued rewards.

## What Changes

1. **Add** \`RewardCmd rewards[MAX_REWARDS]\` and \`int reward_count\` to WorldState
2. **Add** \`int xp\` to WorldState (initialized to 0)
3. **Modify** \`processQuestTrigger\` — ACTION_REWARD enqueues rewards instead of directly adding gold
4. **Add** \`resolveRewards()\` function that processes the queue
5. **Call** \`resolveRewards\` in \`game_tick\` after the interaction and combat blocks

## Visible Change

Output now shows \`REWARD_QUEUE\` lines when rewards are enqueued and \`REWARD_APPLY\` lines when they're resolved. The reward resolve is a distinct pass, not buried in FSM logic.

## Requirements

- Reward queue is fixed-size (MAX_REWARDS=8), pre-allocated in WorldState
- Queue drains to 0 each tick
- Quest rewards enqueue REWARD_GOLD + optionally REWARD_XP
- Combat gold drops still add gold directly (they're not quest rewards)
- All existing tests for movement, combat, quest FSM still work`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int ITEM_NONE=-1;const int MAX_HP=30;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};
struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3}};

const int ITEM_TYPE_WEAPON=0;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {0,3,10,"Iron Sword"},{0,5,25,"Steel Sword"},
    {0,2,8,"Leather"},{0,4,20,"Chain Mail"},
    {0,10,5,"Potion"},
};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_NPC=3;

const int QUEST_INACTIVE=0;const int QUEST_ACTIVE=1;const int QUEST_COMPLETE=2;const int QUEST_TURNIN=3;
const int QUEST_KILL=0;const int MAX_QUESTS=4;
struct Quest{int state;int type;int target_count;int current_count;int reward_gold;int reward_item;char name[32];};

const int TRIGGER_INTERACT=0;const int TRIGGER_COMPLETE=1;
const int ACTION_NONE=0;const int ACTION_OFFER=1;const int ACTION_PROGRESS=2;const int ACTION_REWARD=3;const int ACTION_DONE=4;

struct QuestTransition{int from_state;int trigger;int to_state;int action;};
const QuestTransition QUEST_FSM[]={
    {QUEST_INACTIVE,TRIGGER_INTERACT,QUEST_ACTIVE,ACTION_OFFER},
    {QUEST_ACTIVE,TRIGGER_INTERACT,QUEST_ACTIVE,ACTION_PROGRESS},
    {QUEST_ACTIVE,TRIGGER_COMPLETE,QUEST_COMPLETE,ACTION_NONE},
    {QUEST_COMPLETE,TRIGGER_INTERACT,QUEST_TURNIN,ACTION_REWARD},
    {QUEST_TURNIN,TRIGGER_INTERACT,QUEST_TURNIN,ACTION_DONE},
};
const int FSM_COUNT=5;

const int MAX_REWARDS=8;
const int REWARD_GOLD=0;const int REWARD_ITEM=1;const int REWARD_XP=2;

// TODO: Define RewardCmd struct {type, value}
// TODO: Implement enqueueReward(RewardCmd rewards[], int& count, int type, int value)
// TODO: Implement resolveRewards(WorldState& w)

// TODO: Modify processQuestTrigger to take RewardCmd rewards[] and int& reward_count
// ACTION_REWARD should enqueue REWARD_GOLD and REWARD_XP (25 xp per quest)
// instead of directly adding gold
bool processQuestTrigger(Quest& q,int trigger,int& gold){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;
            int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER){
                cout<<"QUEST_OFFER|"<<q.name<<endl;
                cout<<"QUEST_ACCEPT|"<<q.name<<endl;
            }else if(act==ACTION_PROGRESS){
                cout<<"QUEST_PROGRESS|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;
            }else if(act==ACTION_REWARD){
                gold+=q.reward_gold;
                cout<<"QUEST_REWARD|"<<q.name<<"|gold+"<<q.reward_gold<<endl;
            }else if(act==ACTION_DONE){
                cout<<"QUEST_DONE|"<<q.name<<endl;
            }
            return true;
        }
    }
    return false;
}

void checkQuestProgress(Quest& q,int& gold){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        processQuestTrigger(q,TRIGGER_COMPLETE,gold);
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}
void incrementKillQuest(Quest quests[],int count,int& gold){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i],gold);
    }
}

struct DialogueLine{char text[64];};
const int DIALOGUE_COUNT=4;
const DialogueLine DIALOGUE_TABLE[DIALOGUE_COUNT]={
    {"Kill 2 enemies for me. I will pay you well."},
    {"Keep fighting! You can do it."},
    {"Excellent work! Here is your reward."},
    {"You have already completed my task."},
};

struct Command{int dx;int dy;bool attack;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='e') cmd.interact=true;
    return cmd;
}

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_type[MAX_E];
    int quest_id[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    int weapon_id;int armor_id;int gold;
    Quest quests[MAX_QUESTS];int quest_count;
    // TODO: Add xp field
    // TODO: Add RewardCmd rewards[MAX_REWARDS] and reward_count
};

const char ROOM_DATA[]=
    "##########""#N.......#""#........#""#........#""#@.......#"
    "#........#""#........#""#...E....#""#.E......#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;w.gold=10;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int i=0;i<MAX_E;i++) w.quest_id[i]=-1;
    w.quest_count=1;
    Quest& q=w.quests[0];q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=ITEM_NONE;
    strcpy(q.name,"Clear the Room");
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_PLAYER;w.grid[y][x]='.';
            w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=8;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=1;
            w.entity_type[id]=ETYPE_ENEMY;w.grid[y][x]='.';
        }else if(c=='N'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=20;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_NPC;w.grid[y][x]='.';
            w.quest_id[id]=0;
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

// TODO: Update game_tick to:
// 1. Replace direct gold modification in processQuestTrigger with enqueueReward calls
// 2. Call resolveRewards(w) after interaction and combat blocks
void game_tick(WorldState& w,Command cmd){
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.interact){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_NPC) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int qid=w.quest_id[i];
                if(qid>=0&&qid<w.quest_count){
                    processQuestTrigger(w.quests[qid],TRIGGER_INTERACT,w.gold);
                }
                break;
            }
        }
    }
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_ENEMY) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0) dmg+=ITEM_TABLE[w.weapon_id].stat;
                w.hp[i]-=dmg;
                cout<<"COMBAT|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){w.alive[i]=false;
                    w.gold+=GOLD_TABLE[w.damage_id[i]].base;
                    cout<<"KILL|id="<<i<<endl;
                    incrementKillQuest(w.quests,w.quest_count,w.gold);
                }
                break;
            }
        }
    }
    // TODO: Call resolveRewards(w) here
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<endl;
    for(int i=0;i<w.quest_count;i++){
        const Quest& q=w.quests[i];
        if(q.state==QUEST_ACTIVE) cout<<"QUEST|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;
        else if(q.state==QUEST_COMPLETE) cout<<"QUEST|"<<q.name<<"|READY"<<endl;
        else if(q.state==QUEST_TURNIN) cout<<"QUEST|"<<q.name<<"|DONE"<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    char inputs[]={
        'w','w','w','e',
        's','s','s','s','s','d','d','d','f',
        's','a','f',
        'w','w','w','w','w','w','w','e'
    };
    int n=24;
    for(int i=0;i<n;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    cout<<"REWARDS|gold="<<w.gold<<"|xp="<<w.xp<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int ITEM_NONE=-1;const int MAX_HP=30;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;const int BH_CHASE_X=1;
struct BehaviorRow{int chase_x;int chase_y;};
const BehaviorRow BEHAVIOR_TABLE[]={{0,0},{1,0}};
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};
struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3}};

const int ITEM_TYPE_WEAPON=0;
struct ItemDef{int type;int stat;int value;char name[16];};
const int ITEM_COUNT=5;
const ItemDef ITEM_TABLE[ITEM_COUNT]={
    {0,3,10,"Iron Sword"},{0,5,25,"Steel Sword"},
    {0,2,8,"Leather"},{0,4,20,"Chain Mail"},
    {0,10,5,"Potion"},
};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_NPC=3;

const int QUEST_INACTIVE=0;const int QUEST_ACTIVE=1;const int QUEST_COMPLETE=2;const int QUEST_TURNIN=3;
const int QUEST_KILL=0;const int MAX_QUESTS=4;
struct Quest{int state;int type;int target_count;int current_count;int reward_gold;int reward_item;char name[32];};

const int TRIGGER_INTERACT=0;const int TRIGGER_COMPLETE=1;
const int ACTION_NONE=0;const int ACTION_OFFER=1;const int ACTION_PROGRESS=2;const int ACTION_REWARD=3;const int ACTION_DONE=4;

struct QuestTransition{int from_state;int trigger;int to_state;int action;};
const QuestTransition QUEST_FSM[]={
    {QUEST_INACTIVE,TRIGGER_INTERACT,QUEST_ACTIVE,ACTION_OFFER},
    {QUEST_ACTIVE,TRIGGER_INTERACT,QUEST_ACTIVE,ACTION_PROGRESS},
    {QUEST_ACTIVE,TRIGGER_COMPLETE,QUEST_COMPLETE,ACTION_NONE},
    {QUEST_COMPLETE,TRIGGER_INTERACT,QUEST_TURNIN,ACTION_REWARD},
    {QUEST_TURNIN,TRIGGER_INTERACT,QUEST_TURNIN,ACTION_DONE},
};
const int FSM_COUNT=5;

const int MAX_REWARDS=8;
const int REWARD_GOLD=0;const int REWARD_ITEM=1;const int REWARD_XP=2;
struct RewardCmd{int type;int value;};

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){
        rewards[count].type=type;rewards[count].value=value;count++;
        cout<<"REWARD_QUEUE|type="<<type<<"|value="<<value<<endl;
    }
}

bool processQuestTrigger(Quest& q,int trigger,RewardCmd rewards[],int& reward_count){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;
            int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER){
                cout<<"QUEST_OFFER|"<<q.name<<endl;
                cout<<"QUEST_ACCEPT|"<<q.name<<endl;
            }else if(act==ACTION_PROGRESS){
                cout<<"QUEST_PROGRESS|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;
            }else if(act==ACTION_REWARD){
                enqueueReward(rewards,reward_count,REWARD_GOLD,q.reward_gold);
                enqueueReward(rewards,reward_count,REWARD_XP,25);
                cout<<"QUEST_TURNIN|"<<q.name<<endl;
            }else if(act==ACTION_DONE){
                cout<<"QUEST_DONE|"<<q.name<<endl;
            }
            return true;
        }
    }
    return false;
}

void checkQuestProgress(Quest& q,RewardCmd rewards[],int& reward_count){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        processQuestTrigger(q,TRIGGER_COMPLETE,rewards,reward_count);
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}
void incrementKillQuest(Quest quests[],int count,RewardCmd rewards[],int& reward_count){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i],rewards,reward_count);
    }
}

struct DialogueLine{char text[64];};
const int DIALOGUE_COUNT=4;
const DialogueLine DIALOGUE_TABLE[DIALOGUE_COUNT]={
    {"Kill 2 enemies for me. I will pay you well."},
    {"Keep fighting! You can do it."},
    {"Excellent work! Here is your reward."},
    {"You have already completed my task."},
};

struct Command{int dx;int dy;bool attack;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='e') cmd.interact=true;
    return cmd;
}

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_type[MAX_E];
    int quest_id[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    int weapon_id;int armor_id;int gold;int xp;
    Quest quests[MAX_QUESTS];int quest_count;
    RewardCmd rewards[MAX_REWARDS];int reward_count;
};

void resolveRewards(WorldState& w){
    for(int i=0;i<w.reward_count;i++){
        if(w.rewards[i].type==REWARD_GOLD){
            w.gold+=w.rewards[i].value;
            cout<<"REWARD_APPLY|gold+"<<w.rewards[i].value<<endl;
        }else if(w.rewards[i].type==REWARD_ITEM){
            if(w.inv_count<INV_SIZE){w.inventory[w.inv_count++]=w.rewards[i].value;}
            cout<<"REWARD_APPLY|item="<<w.rewards[i].value<<endl;
        }else if(w.rewards[i].type==REWARD_XP){
            w.xp+=w.rewards[i].value;
            cout<<"REWARD_APPLY|xp+"<<w.rewards[i].value<<endl;
        }
    }
    w.reward_count=0;
}

const char ROOM_DATA[]=
    "##########""#N.......#""#........#""#........#""#@.......#"
    "#........#""#........#""#...E....#""#.E......#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;w.gold=10;w.xp=0;
    w.reward_count=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int i=0;i<MAX_E;i++) w.quest_id[i]=-1;
    w.quest_count=1;
    Quest& q=w.quests[0];q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=ITEM_NONE;
    strcpy(q.name,"Clear the Room");
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_PLAYER;w.grid[y][x]='.';
            w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=8;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=1;
            w.entity_type[id]=ETYPE_ENEMY;w.grid[y][x]='.';
        }else if(c=='N'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=20;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_NPC;w.grid[y][x]='.';
            w.quest_id[id]=0;
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.interact){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_NPC) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int qid=w.quest_id[i];
                if(qid>=0&&qid<w.quest_count){
                    processQuestTrigger(w.quests[qid],TRIGGER_INTERACT,w.rewards,w.reward_count);
                }
                break;
            }
        }
    }
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_ENEMY) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0) dmg+=ITEM_TABLE[w.weapon_id].stat;
                w.hp[i]-=dmg;
                cout<<"COMBAT|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){w.alive[i]=false;
                    w.gold+=GOLD_TABLE[w.damage_id[i]].base;
                    cout<<"KILL|id="<<i<<endl;
                    incrementKillQuest(w.quests,w.quest_count,w.rewards,w.reward_count);
                }
                break;
            }
        }
    }
    resolveRewards(w);
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<"|xp="<<w.xp<<endl;
    for(int i=0;i<w.quest_count;i++){
        const Quest& q=w.quests[i];
        if(q.state==QUEST_ACTIVE) cout<<"QUEST|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;
        else if(q.state==QUEST_COMPLETE) cout<<"QUEST|"<<q.name<<"|READY"<<endl;
        else if(q.state==QUEST_TURNIN) cout<<"QUEST|"<<q.name<<"|DONE"<<endl;
    }
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    char inputs[]={
        'w','w','w','e',
        's','s','s','s','s','d','d','d','f',
        's','a','f',
        'w','w','w','w','w','w','w','e'
    };
    int n=24;
    for(int i=0;i<n;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    cout<<"REWARDS|gold="<<w.gold<<"|xp="<<w.xp<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=4", isPattern: false },
      { id: "g2", description: "Quest offered via FSM", expectedOutput: "QUEST_OFFER|Clear the Room", isPattern: false },
      { id: "g3", description: "Gold reward enqueued", expectedOutput: "REWARD_QUEUE|type=0|value=30", isPattern: false },
      { id: "g4", description: "XP reward enqueued", expectedOutput: "REWARD_QUEUE|type=2|value=25", isPattern: false },
      { id: "g5", description: "Gold reward applied", expectedOutput: "REWARD_APPLY|gold+30", isPattern: false },
      { id: "g6", description: "XP reward applied", expectedOutput: "REWARD_APPLY|xp+25", isPattern: false },
      { id: "g7", description: "HUD shows XP", expectedOutput: "|xp=", isPattern: true },
      { id: "g8", description: "Final rewards state", expectedOutput: "REWARDS|gold=", isPattern: true },
    ],
    hints: [
      "Add RewardCmd rewards[MAX_REWARDS] and int reward_count to WorldState. Initialize reward_count=0 in loadRoom.",
      "Change processQuestTrigger signature to take rewards[] and reward_count& instead of gold&. In ACTION_REWARD, call enqueueReward twice: once for REWARD_GOLD, once for REWARD_XP(25).",
      "Call resolveRewards(w) at the end of game_tick, after both interaction and combat blocks. Update checkQuestProgress and incrementKillQuest to pass rewards/reward_count instead of gold.",
    ],
    estimatedMinutes: 15,
  },
};