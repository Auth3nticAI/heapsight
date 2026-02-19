import { Lesson } from "@/types/lesson";

export const lessonRPG58: Lesson = {
  id: "rpg-58-xp-and-level-v0",
  title: "XP and Level v0",
  description: "Level up from XP thresholds — stat increases come from a const level table, not magic numbers.",
  order: 58,
  xpReward: 100,
  tier: "pro",
  concepts: ["experience points", "level-up threshold", "stat scaling table", "data-driven progression", "reward integration"],
  part1: {
    title: "Level Tables as Data",
    type: "concept",
    instructions: `# XP and Level: Stat Scaling from a Table

## Mental Model

Your player earns XP from quest rewards (Lesson 57). But XP is just a number sitting in WorldState doing nothing. In a real RPG, XP triggers **level-ups** that increase stats — more HP, more damage, more survivability.

The beginner approach: hardcode thresholds and bonuses inline.

\`\`\`cpp
if(xp >= 100 && level == 1) { level = 2; max_hp += 5; }
if(xp >= 250 && level == 2) { level = 3; max_hp += 8; }
// ... 20 more of these
\`\`\`

This is unmaintainable. Every balance change means editing code. Every new level means a new if-statement.

## The Fix: Level Table

Define a const table that maps level to XP threshold and stat bonuses:

\`\`\`cpp
struct LevelRow {
    int xp_required;  // Total XP needed for this level
    int hp_bonus;      // HP gained on reaching this level
    int dmg_bonus;     // Damage gained
};

const int MAX_LEVEL = 5;
const LevelRow LEVEL_TABLE[MAX_LEVEL] = {
    { 0,   0, 0 },   // Level 1 (starting)
    { 50,  5, 1 },   // Level 2: +5 HP, +1 dmg
    { 120, 5, 1 },   // Level 3: +5 HP, +1 dmg
    { 200, 8, 2 },   // Level 4: +8 HP, +2 dmg
    { 350, 10, 2 },  // Level 5: +10 HP, +2 dmg
};
\`\`\`

Level-up check becomes a simple loop:

\`\`\`cpp
void checkLevelUp(int& level, int xp, int& max_hp, int& bonus_dmg) {
    while(level < MAX_LEVEL - 1 &&
          xp >= LEVEL_TABLE[level + 1].xp_required) {
        level++;
        max_hp += LEVEL_TABLE[level].hp_bonus;
        bonus_dmg += LEVEL_TABLE[level].dmg_bonus;
    }
}
\`\`\`

## Why This Matters

| Approach | Balance change | Add level | Debug |
|----------|---------------|-----------|-------|
| Hardcoded if/else | Edit code, recompile | Add more if-statements | Read through branches |
| Level table | Change one number | Add one row | Print the table |

The table IS the balance document. Designers can read it. QA can verify it. It could even load from a file later.

## Beginner Trap: Checking Level Every Frame

Don't check for level-up in the render loop or every tick. Only check when XP actually changes — right after \`resolveRewards\` applies REWARD_XP. This keeps the check tied to the event, not the frame.

## Elite Insight: Diablo's XP Curves

Diablo uses exponential XP curves — each level requires roughly 1.5x more XP than the previous. This creates a natural difficulty ramp. Our linear table is simpler, but the pattern is identical: data drives progression, code just reads the table.

## Memory Insight

A 10-level table is 10 × 12 bytes = 120 bytes. Const, read-only, lives in the data segment. No heap. No dynamic allocation. Gate A compliant.

## What You'll Build

In Part 1, you'll define the LevelRow table and implement \`checkLevelUp\`. In Part 2, you'll integrate it into the game with the rewards pipeline triggering level-up checks.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define LevelRow struct with xp_required, hp_bonus, dmg_bonus
// TODO: Define MAX_LEVEL = 5
// TODO: Define LEVEL_TABLE[MAX_LEVEL]:
//   Level 1: {0, 0, 0}
//   Level 2: {50, 5, 1}
//   Level 3: {120, 5, 1}
//   Level 4: {200, 8, 2}
//   Level 5: {350, 10, 2}

// TODO: Implement checkLevelUp(int& level, int xp, int& max_hp, int& bonus_dmg)
// While level < MAX_LEVEL-1 and xp >= LEVEL_TABLE[level+1].xp_required:
//   Increment level
//   Add hp_bonus and dmg_bonus from LEVEL_TABLE[level]
//   Print LEVEL_UP|level=L|hp+H|dmg+D

int main(){
    int level=1,max_hp=30,bonus_dmg=0;

    // Test: 0 XP, no level up
    checkLevelUp(level,0,max_hp,bonus_dmg);
    cout<<"L1|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    // Test: 50 XP, should hit level 2
    checkLevelUp(level,50,max_hp,bonus_dmg);
    cout<<"L2|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    // Test: 200 XP, should hit level 3 AND 4 (multi-level)
    checkLevelUp(level,200,max_hp,bonus_dmg);
    cout<<"L4|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    // Test: 999 XP, should cap at level 5
    checkLevelUp(level,999,max_hp,bonus_dmg);
    cout<<"L5|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct LevelRow{int xp_required;int hp_bonus;int dmg_bonus;};
const int MAX_LEVEL=5;
const LevelRow LEVEL_TABLE[MAX_LEVEL]={
    {0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2},
};

void checkLevelUp(int& level,int xp,int& max_hp,int& bonus_dmg){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;
        max_hp+=LEVEL_TABLE[level].hp_bonus;
        bonus_dmg+=LEVEL_TABLE[level].dmg_bonus;
        cout<<"LEVEL_UP|level="<<level<<"|hp+"<<LEVEL_TABLE[level].hp_bonus<<"|dmg+"<<LEVEL_TABLE[level].dmg_bonus<<endl;
    }
}

int main(){
    int level=1,max_hp=30,bonus_dmg=0;

    checkLevelUp(level,0,max_hp,bonus_dmg);
    cout<<"L1|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    checkLevelUp(level,50,max_hp,bonus_dmg);
    cout<<"L2|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    checkLevelUp(level,200,max_hp,bonus_dmg);
    cout<<"L4|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    checkLevelUp(level,999,max_hp,bonus_dmg);
    cout<<"L5|level="<<level<<"|hp="<<max_hp<<"|dmg="<<bonus_dmg<<endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "No level up at 0 XP", expectedOutput: "L1|level=1|hp=30|dmg=0", isPattern: false },
      { id: "t2", description: "Level 2 at 50 XP", expectedOutput: "LEVEL_UP|level=2|hp+5|dmg+1", isPattern: false },
      { id: "t3", description: "Stats after level 2", expectedOutput: "L2|level=2|hp=35|dmg=1", isPattern: false },
      { id: "t4", description: "Multi-level jump to 3", expectedOutput: "LEVEL_UP|level=3|hp+5|dmg+1", isPattern: false },
      { id: "t5", description: "Multi-level jump to 4", expectedOutput: "LEVEL_UP|level=4|hp+8|dmg+2", isPattern: false },
      { id: "t6", description: "Stats after level 4", expectedOutput: "L4|level=4|hp=48|dmg=4", isPattern: false },
      { id: "t7", description: "Level 5 cap", expectedOutput: "LEVEL_UP|level=5|hp+10|dmg+2", isPattern: false },
      { id: "t8", description: "Final stats at max level", expectedOutput: "L5|level=5|hp=58|dmg=6", isPattern: false },
    ],
    hints: [
      "LevelRow has 3 int fields. LEVEL_TABLE is a const array of 5 entries. Level 1 starts at {0,0,0}.",
      "checkLevelUp uses a while loop (not if) because gaining enough XP might skip multiple levels at once.",
      "After incrementing level, index into LEVEL_TABLE[level] (the NEW level) to get the bonuses for that level.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Level-Up Integration with Rewards Pipeline",
    type: "game_builder",
    instructions: `# Integrate Level-Up into the Full Game

## Goal

Add \`level\`, \`max_hp\`, and \`bonus_dmg\` to WorldState. After \`resolveRewards\` applies XP, call \`checkLevelUp\`. Level-ups should increase HP cap and bonus damage, visible in the HUD.

## What Changes

1. **Add** \`LevelRow\` struct and \`LEVEL_TABLE\` const array
2. **Add** \`level\`, \`max_hp\`, \`bonus_dmg\` fields to WorldState
3. **Add** \`checkLevelUp()\` that reads from the table
4. **Call** \`checkLevelUp\` after \`resolveRewards\` in game_tick
5. **Update** HUD to show level and XP
6. **Update** combat damage to include \`bonus_dmg\`

## Visible Change

HUD now shows \`level=\` and \`xp=\`. When quest reward XP triggers a level-up, \`LEVEL_UP\` appears in output, and subsequent combat shows increased damage.

## Requirements

- Level table is const (no heap)
- Level-up only fires when XP actually changes (after resolveRewards)
- bonus_dmg adds to combat damage calculation
- HUD displays level and XP`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int ITEM_NONE=-1;const int MAX_HP=30;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};
struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3}};

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

// TODO: Define LevelRow struct {xp_required, hp_bonus, dmg_bonus}
// TODO: Define MAX_LEVEL=5 and LEVEL_TABLE[MAX_LEVEL]
// TODO: Implement checkLevelUp(int& level, int xp, int& max_hp, int& bonus_dmg)

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
    // TODO: Add level, max_hp, bonus_dmg fields
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
    // TODO: Initialize level=1, max_hp=30, bonus_dmg=0
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
                // TODO: Add bonus_dmg to damage calculation
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
    // TODO: Call checkLevelUp after resolveRewards
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    // TODO: Add level and xp to HUD output
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
    cout<<"FINAL|level="<<w.level<<"|xp="<<w.xp<<"|max_hp="<<w.max_hp<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16,INV_SIZE=5;
const int ITEM_NONE=-1;
typedef char Tile; const Tile TILE_WALL='#';
struct RNG{unsigned int state;};
void rng_seed(RNG&r,unsigned int s){r.state=s;}
unsigned int rng_next(RNG&r){r.state=r.state*1664525u+1013904223u;return r.state;}

const int BH_IDLE=0;
struct DamageRow{int base_dmg;};
const DamageRow DAMAGE_TABLE[]={{5},{3},{0}};
struct GoldDrop{int base;int bonus_range;};
const GoldDrop GOLD_TABLE[]={{0,0},{5,3}};

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

struct LevelRow{int xp_required;int hp_bonus;int dmg_bonus;};
const int MAX_LEVEL=5;
const LevelRow LEVEL_TABLE[MAX_LEVEL]={
    {0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2},
};

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

void checkLevelUp(int& level,int xp,int& max_hp,int& bonus_dmg){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;
        max_hp+=LEVEL_TABLE[level].hp_bonus;
        bonus_dmg+=LEVEL_TABLE[level].dmg_bonus;
        cout<<"LEVEL_UP|level="<<level<<"|hp+"<<LEVEL_TABLE[level].hp_bonus<<"|dmg+"<<LEVEL_TABLE[level].dmg_bonus<<endl;
    }
}

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
    int level;int max_hp;int bonus_dmg;
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
    w.reward_count=0;w.level=1;w.max_hp=30;w.bonus_dmg=0;
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
                dmg+=w.bonus_dmg;
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
    checkLevelUp(w.level,w.xp,w.max_hp,w.bonus_dmg);
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<"|xp="<<w.xp<<"|level="<<w.level<<endl;
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
    cout<<"FINAL|level="<<w.level<<"|xp="<<w.xp<<"|max_hp="<<w.max_hp<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=4", isPattern: false },
      { id: "g2", description: "Quest accepted", expectedOutput: "QUEST_ACCEPT|Clear the Room", isPattern: false },
      { id: "g3", description: "XP reward enqueued", expectedOutput: "REWARD_QUEUE|type=2|value=25", isPattern: false },
      { id: "g4", description: "XP applied", expectedOutput: "REWARD_APPLY|xp+25", isPattern: false },
      { id: "g5", description: "HUD shows level", expectedOutput: "|level=", isPattern: true },
      { id: "g6", description: "Bonus damage in combat", expectedOutput: "COMBAT|target=", isPattern: true },
      { id: "g7", description: "Final state printed", expectedOutput: "FINAL|level=", isPattern: true },
    ],
    hints: [
      "Add level, max_hp, bonus_dmg to WorldState. Initialize level=1, max_hp=30, bonus_dmg=0 in loadRoom.",
      "Call checkLevelUp(w.level, w.xp, w.max_hp, w.bonus_dmg) right after resolveRewards(w) in game_tick.",
      "In the combat damage calculation, add w.bonus_dmg: dmg = DAMAGE_TABLE[...].base_dmg + weapon_stat + w.bonus_dmg.",
    ],
    estimatedMinutes: 15,
  },
};