import { Lesson } from "@/types/lesson";

export const lessonRPG56: Lesson = {
  id: "rpg-56-quest-state-machine",
  title: "Quest State Machine",
  description: "Formalize quest state transitions as a data table — FSM logic replaces scattered if/else chains.",
  order: 56,
  xpReward: 100,
  tier: "pro",
  concepts: ["finite state machine", "transition table", "data-driven FSM", "quest state progression", "trigger-action pattern"],
  part1: {
    title: "Quest States as a Data Table",
    type: "concept",
    instructions: `# Quest State Machine: FSM as Data Table

## Mental Model

Look at your interaction block from Lesson 55:

\`\`\`cpp
if(q.state==QUEST_INACTIVE){
    // offer quest, set ACTIVE
}else if(q.state==QUEST_ACTIVE){
    // show progress
}else if(q.state==QUEST_COMPLETE){
    // deliver reward, set TURNIN
}else if(q.state==QUEST_TURNIN){
    // say done
}
\`\`\`

This works for one quest. But what happens when you have 5 quests, 3 NPCs, and some quests that can FAIL or be ABANDONED? Every new state means editing every if/else chain. Every new quest type means copying the chain with slight variations.

Production RPGs like Skyrim have 400+ quests. They don't use if/else chains. They use **finite state machines defined as data tables**.

## The Fix: Transition Table

A finite state machine has three parts:
1. **States** — the possible conditions (INACTIVE, ACTIVE, COMPLETE, TURNIN)
2. **Triggers** — events that cause transitions (INTERACT, KILL_TARGET, NPC_TALK)
3. **Transitions** — rules: "from state X, on trigger Y, go to state Z and do action A"

Instead of code encoding these rules as if/else, we define them as **data**:

\`\`\`cpp
struct QuestTransition {
    int from_state;
    int trigger;
    int to_state;
    int action;  // what to do during transition
};

const QuestTransition QUEST_FSM[] = {
    { QUEST_INACTIVE, TRIGGER_INTERACT, QUEST_ACTIVE,   ACTION_OFFER },
    { QUEST_ACTIVE,   TRIGGER_INTERACT, QUEST_ACTIVE,   ACTION_PROGRESS },
    { QUEST_ACTIVE,   TRIGGER_COMPLETE, QUEST_COMPLETE, ACTION_NONE },
    { QUEST_COMPLETE, TRIGGER_INTERACT, QUEST_TURNIN,   ACTION_REWARD },
    { QUEST_TURNIN,   TRIGGER_INTERACT, QUEST_TURNIN,   ACTION_DONE },
};
\`\`\`

Now processing a quest event is a simple table scan:

\`\`\`cpp
for (int t = 0; t < FSM_COUNT; t++) {
    if (QUEST_FSM[t].from_state == q.state &&
        QUEST_FSM[t].trigger == trigger) {
        q.state = QUEST_FSM[t].to_state;
        executeAction(QUEST_FSM[t].action, q, w);
        break;
    }
}
\`\`\`

## Why This Matters

| Approach | Add new state | Add new quest type | Debug |
|----------|--------------|-------------------|-------|
| if/else chain | Edit every chain | Copy-paste chain | Read 50 lines of branches |
| Transition table | Add one row | Same table, different data | Print the table |

The table IS the documentation. You can print it, verify it, even load it from a file later.

## Beginner Trap: Virtual Functions for States

Some tutorials suggest creating a \`QuestState\` base class with virtual \`onEnter()\`, \`onExit()\`, \`onTrigger()\` methods. In a game tick loop, virtual dispatch is:
- **Slower** — indirect function calls break CPU branch prediction
- **Harder to debug** — you can't print a vtable to see all transitions
- **Heap-hungry** — polymorphic objects need heap allocation (violates Gate A)

The data table approach keeps everything in flat arrays. No heap. No vtables. Just data.

## Elite Insight: Bethesda's Quest System

Skyrim's quest system uses a concept called "quest stages" — integer IDs that progress through a defined sequence. Each stage has conditions (triggers) and results (actions). Sound familiar? It's a transition table. The exact pattern you're building.

## Memory Insight

A transition table of 20 entries is 20 × 16 bytes = 320 bytes. That's nothing. It fits in L1 cache. Compare to a class hierarchy with virtual methods: each object needs a vtable pointer (8 bytes), plus heap allocation overhead (16+ bytes), plus cache misses from pointer chasing.

## What You'll Build

In Part 1, you'll define the transition table and write a \`processQuestTrigger\` function that replaces if/else with a table scan. In Part 2, you'll integrate it into the full game tick.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int QUEST_INACTIVE=0;const int QUEST_ACTIVE=1;const int QUEST_COMPLETE=2;const int QUEST_TURNIN=3;
const int QUEST_KILL=0;const int MAX_QUESTS=4;
struct Quest{int state;int type;int target_count;int current_count;int reward_gold;int reward_item;char name[32];};

// Triggers
const int TRIGGER_INTERACT=0;const int TRIGGER_COMPLETE=1;
// Actions
const int ACTION_NONE=0;const int ACTION_OFFER=1;const int ACTION_PROGRESS=2;const int ACTION_REWARD=3;const int ACTION_DONE=4;

// TODO: Define QuestTransition struct with from_state, trigger, to_state, action
// TODO: Define QUEST_FSM[] transition table with 5 entries:
//   INACTIVE + INTERACT -> ACTIVE (ACTION_OFFER)
//   ACTIVE + INTERACT -> ACTIVE (ACTION_PROGRESS)
//   ACTIVE + COMPLETE -> COMPLETE (ACTION_NONE)
//   COMPLETE + INTERACT -> TURNIN (ACTION_REWARD)
//   TURNIN + INTERACT -> TURNIN (ACTION_DONE)
// TODO: Define FSM_COUNT as the number of entries

// TODO: Implement processQuestTrigger(Quest& q, int trigger, int& gold)
// Scan QUEST_FSM for matching from_state + trigger
// Apply to_state, then switch on action:
//   ACTION_OFFER: print QUEST_OFFER|name, print QUEST_ACCEPT|name
//   ACTION_PROGRESS: print QUEST_PROGRESS|name|current/target
//   ACTION_REWARD: gold += reward_gold, print QUEST_REWARD|name|gold+reward
//   ACTION_DONE: print QUEST_DONE|name
// Return true if transition found, false otherwise

int main(){
    Quest q={};q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=-1;
    strcpy(q.name,"Clear the Room");
    int gold=10;

    // Interact while INACTIVE -> should offer and accept
    processQuestTrigger(q,TRIGGER_INTERACT,gold);
    cout<<"STATE|"<<q.state<<endl;

    // Interact while ACTIVE -> should show progress
    q.current_count=1;
    processQuestTrigger(q,TRIGGER_INTERACT,gold);

    // Complete trigger (kills reached target)
    q.current_count=2;
    processQuestTrigger(q,TRIGGER_COMPLETE,gold);
    cout<<"STATE|"<<q.state<<endl;

    // Interact while COMPLETE -> should reward
    processQuestTrigger(q,TRIGGER_INTERACT,gold);
    cout<<"STATE|"<<q.state<<endl;
    cout<<"GOLD|"<<gold<<endl;

    // Interact while TURNIN -> already done
    processQuestTrigger(q,TRIGGER_INTERACT,gold);
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

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

int main(){
    Quest q={};q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=-1;
    strcpy(q.name,"Clear the Room");
    int gold=10;

    processQuestTrigger(q,TRIGGER_INTERACT,gold);
    cout<<"STATE|"<<q.state<<endl;

    q.current_count=1;
    processQuestTrigger(q,TRIGGER_INTERACT,gold);

    q.current_count=2;
    processQuestTrigger(q,TRIGGER_COMPLETE,gold);
    cout<<"STATE|"<<q.state<<endl;

    processQuestTrigger(q,TRIGGER_INTERACT,gold);
    cout<<"STATE|"<<q.state<<endl;
    cout<<"GOLD|"<<gold<<endl;

    processQuestTrigger(q,TRIGGER_INTERACT,gold);
    return 0;
}`,
    tests: [
      { id: "t1", description: "Quest offered on first interact", expectedOutput: "QUEST_OFFER|Clear the Room", isPattern: false },
      { id: "t2", description: "Quest accepted", expectedOutput: "QUEST_ACCEPT|Clear the Room", isPattern: false },
      { id: "t3", description: "State becomes ACTIVE", expectedOutput: "STATE|1", isPattern: false },
      { id: "t4", description: "Progress shown on interact", expectedOutput: "QUEST_PROGRESS|Clear the Room|1/2", isPattern: false },
      { id: "t5", description: "State becomes COMPLETE", expectedOutput: "STATE|2", isPattern: false },
      { id: "t6", description: "Reward delivered", expectedOutput: "QUEST_REWARD|Clear the Room|gold+30", isPattern: false },
      { id: "t7", description: "State becomes TURNIN", expectedOutput: "STATE|3", isPattern: false },
      { id: "t8", description: "Gold correct after reward", expectedOutput: "GOLD|40", isPattern: false },
      { id: "t9", description: "Done message on re-interact", expectedOutput: "QUEST_DONE|Clear the Room", isPattern: false },
    ],
    hints: [
      "Define QuestTransition as a struct with 4 int fields. QUEST_FSM is a const array of 5 entries matching the state diagram.",
      "In processQuestTrigger, loop over QUEST_FSM. Match from_state==q.state AND trigger==trigger. Apply to_state first, then switch on action.",
      "ACTION_REWARD must add q.reward_gold to gold AND print QUEST_REWARD. Remember to return true after the first match.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "FSM-Driven Quest Processing in the Game Tick",
    type: "game_builder",
    instructions: `# Integrate the Quest FSM into the Full Game

## Goal

Replace the if/else quest branching in \`game_tick\` with the \`processQuestTrigger\` function driven by the FSM transition table. The interaction block should fire \`TRIGGER_INTERACT\`, and kills should fire \`TRIGGER_COMPLETE\` (via \`checkQuestProgress\`).

## What Changes

1. **Add** the \`QuestTransition\` struct and \`QUEST_FSM[]\` table
2. **Add** \`processQuestTrigger()\` that scans the table and executes actions
3. **Replace** the if/else chain in the interaction block with a single \`processQuestTrigger(q, TRIGGER_INTERACT, w.gold)\` call
4. **Update** \`checkQuestProgress\` to fire \`TRIGGER_COMPLETE\` through the FSM instead of directly setting state

## Visible Change

Output now shows FSM-driven quest events: \`QUEST_OFFER\`, \`QUEST_ACCEPT\`, \`QUEST_PROGRESS\`, \`QUEST_REWARD\`, \`QUEST_DONE\` — all produced by table lookup, not branching.

## Requirements

- The transition table must be a \`const\` array (no heap)
- \`processQuestTrigger\` must work for any quest, not just quest 0
- Kill events must trigger completion through the FSM
- All existing combat, movement, and HUD behavior must still work`,
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

// Triggers and Actions for FSM
const int TRIGGER_INTERACT=0;const int TRIGGER_COMPLETE=1;
const int ACTION_NONE=0;const int ACTION_OFFER=1;const int ACTION_PROGRESS=2;const int ACTION_REWARD=3;const int ACTION_DONE=4;

// TODO: Define QuestTransition struct {from_state, trigger, to_state, action}
// TODO: Define QUEST_FSM[] table with 5 transition entries
// TODO: Define FSM_COUNT

// TODO: Implement processQuestTrigger(Quest& q, int trigger, int& gold)
// Scan FSM table, match from_state+trigger, apply to_state, execute action
// Actions: OFFER prints QUEST_OFFER+QUEST_ACCEPT, PROGRESS prints progress,
//          REWARD adds gold and prints QUEST_REWARD, DONE prints QUEST_DONE

// TODO: Update checkQuestProgress to use processQuestTrigger with TRIGGER_COMPLETE
// instead of directly setting q.state=QUEST_COMPLETE
void checkQuestProgress(Quest& q,int& gold){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        q.state=QUEST_COMPLETE;
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

// TODO: Replace the if/else quest branching in game_tick with processQuestTrigger
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
                    Quest& q=w.quests[qid];
                    // OLD if/else chain - replace with processQuestTrigger
                    if(q.state==QUEST_INACTIVE){
                        cout<<"DIALOGUE|"<<DIALOGUE_TABLE[0].text<<endl;
                        cout<<"QUEST_OFFER|"<<q.name<<"|target="<<q.target_count<<endl;
                        q.state=QUEST_ACTIVE;
                        cout<<"QUEST_ACCEPT|"<<q.name<<endl;
                    }else if(q.state==QUEST_ACTIVE){
                        cout<<"DIALOGUE|"<<DIALOGUE_TABLE[1].text<<endl;
                    }else if(q.state==QUEST_COMPLETE){
                        cout<<"DIALOGUE|"<<DIALOGUE_TABLE[2].text<<endl;
                        w.gold+=q.reward_gold;
                        cout<<"QUEST_TURNIN|"<<q.name<<"|gold+"<<q.reward_gold<<endl;
                        q.state=QUEST_TURNIN;
                    }else if(q.state==QUEST_TURNIN){
                        cout<<"DIALOGUE|"<<DIALOGUE_TABLE[3].text<<endl;
                    }
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
    cout<<"FSM|quest_loop|gold="<<w.gold<<endl;
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
    cout<<"FSM|quest_loop|gold="<<w.gold<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=4", isPattern: false },
      { id: "g2", description: "FSM offers quest on interact", expectedOutput: "QUEST_OFFER|Clear the Room", isPattern: false },
      { id: "g3", description: "FSM accepts quest", expectedOutput: "QUEST_ACCEPT|Clear the Room", isPattern: false },
      { id: "g4", description: "Kill updates quest progress", expectedOutput: "QUEST_UPDATE|Clear the Room|progress=1/2", isPattern: false },
      { id: "g5", description: "FSM completes quest via trigger", expectedOutput: "QUEST_COMPLETE|Clear the Room|reward_gold=30", isPattern: false },
      { id: "g6", description: "FSM rewards on turnin", expectedOutput: "QUEST_REWARD|Clear the Room|gold+30", isPattern: false },
      { id: "g7", description: "HUD shows quest done", expectedOutput: "QUEST|Clear the Room|DONE", isPattern: false },
      { id: "g8", description: "FSM loop complete with gold", expectedOutput: "FSM|quest_loop|gold=", isPattern: true },
    ],
    hints: [
      "Add the QuestTransition struct and QUEST_FSM[] table before any functions. Define FSM_COUNT=5.",
      "In game_tick, replace the entire if/else chain in the interaction block with: processQuestTrigger(w.quests[qid], TRIGGER_INTERACT, w.gold);",
      "Update checkQuestProgress to call processQuestTrigger(q, TRIGGER_COMPLETE, gold) instead of directly setting q.state=QUEST_COMPLETE. Keep the QUEST_COMPLETE cout after the FSM call.",
    ],
    estimatedMinutes: 15,
  },
};