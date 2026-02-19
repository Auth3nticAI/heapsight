import { Lesson } from "@/types/lesson";

export const lessonRPG60: Lesson = {
  id: "rpg-60-milestone-town-dungeon-loop",
  title: "Milestone: Town-to-Dungeon Loop",
  description: "The full game loop: accept quest from NPC, delve into dungeon, kill enemies, return to NPC, earn rewards, level up, allocate skills.",
  order: 60,
  xpReward: 300,
  tier: "pro",
  concepts: ["complete game loop", "quest-reward-level pipeline", "FSM integration", "skill allocation", "milestone integration", "Phase 6 capstone"],
  part1: {
    title: "The Complete RPG Loop",
    type: "concept",
    instructions: `# Milestone: The Complete RPG Game Loop

## Mental Model

Over Phase 6 (Lessons 51-59), you've assembled every system a dungeon RPG needs:

| Lesson | System | What It Added |
|--------|--------|--------------|
| 51 | NPC Entities | Entity type flags, N on the grid |
| 52 | Interaction Command | 'e' key, adjacency scan |
| 53 | Dialogue Data | Const dialogue table, text lookup |
| 54 | Quest Struct | Quest tracking, kill counting |
| 55 | Quest Loop | Accept/complete/turnin pipeline |
| 56 | Quest FSM | Transition table replaces if/else |
| 57 | Rewards Pipeline | Queued rewards, resolve pass |
| 58 | XP and Levels | Level table, stat scaling |
| 59 | Skill Points | Player build, STR/VIT allocation |

## The Game Loop

Your RPG now has the complete **town-to-dungeon loop**:

1. **Town**: Talk to NPC, accept quest
2. **Delve**: Enter dungeon area, fight enemies
3. **Return**: Walk back to NPC with completed quest
4. **Reward**: Receive gold + XP via reward pipeline
5. **Level Up**: XP triggers level-up, grants skill point
6. **Build**: Allocate skill point to STR or VIT
7. **Repeat**: Accept next quest with better stats

This is the core loop of every RPG from Diablo to Skyrim to Final Fantasy. The data is different, the graphics are different, but the **architecture** is identical.

## Architecture Review

Your tick pipeline now has clear phases:

\`\`\`
captureInput -> game_tick:
  1. Movement (position update)
  2. Skill allocation (if pressed)
  3. Interaction (NPC + quest FSM)
  4. Combat (damage + kill + quest update)
  5. Resolve rewards (gold, XP, items)
  6. Level-up check (stat scaling + skill point)
-> renderHUD
\`\`\`

Each phase reads the result of the previous phase. No circular dependencies. Deterministic. Replayable.

## Memory Budget Check

| System | Size | Heap? |
|--------|------|-------|
| WorldState | ~1.2 KB | No — stack allocated |
| Quest FSM table | 80 bytes | No — const data |
| Level table | 60 bytes | No — const data |
| Skill table | 32 bytes | No — const data |
| Reward queue | 64 bytes | No — pre-allocated |
| Dialogue table | 256 bytes | No — const data |

**Gate A compliant.** Zero heap allocations in the game loop.

## What You'll Build

In Part 1, verify the full pipeline works by tracing through a complete quest loop. In Part 2, run the complete game with all systems active and verify every stage of the loop produces correct output.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

// Quest FSM types
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

const int MAX_REWARDS=8;const int REWARD_GOLD=0;const int REWARD_XP=2;
struct RewardCmd{int type;int value;};

struct LevelRow{int xp_required;int hp_bonus;int dmg_bonus;};
const int MAX_LEVEL=5;
const LevelRow LEVEL_TABLE[MAX_LEVEL]={{0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2}};

const int SKILL_STR=0;const int SKILL_VIT=1;const int SKILL_COUNT=2;
struct SkillDef{int bonus_per_point;char name[12];};
const SkillDef SKILL_TABLE[SKILL_COUNT]={{2,"Strength"},{3,"Vitality"}};

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){rewards[count].type=type;rewards[count].value=value;count++;}
}

bool processQuestTrigger(Quest& q,int trigger,RewardCmd rewards[],int& rc){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER) cout<<"QUEST_ACCEPT|"<<q.name<<endl;
            else if(act==ACTION_REWARD){enqueueReward(rewards,rc,REWARD_GOLD,q.reward_gold);enqueueReward(rewards,rc,REWARD_XP,25);cout<<"QUEST_TURNIN|"<<q.name<<endl;}
            return true;
        }
    }return false;
}

// TODO: Implement the full pipeline trace:
// 1. Create quest, accept it (TRIGGER_INTERACT)
// 2. Simulate 2 kills (increment current_count, TRIGGER_COMPLETE)
// 3. Turn in quest (TRIGGER_INTERACT)
// 4. Resolve rewards (apply gold and XP)
// 5. Check level up
// 6. Allocate skill point
// Print PIPELINE_STAGE|N at each step

void checkLevelUp(int& level,int xp,int& max_hp,int& bonus_dmg,int& sp){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;max_hp+=LEVEL_TABLE[level].hp_bonus;bonus_dmg+=LEVEL_TABLE[level].dmg_bonus;sp++;
        cout<<"LEVEL_UP|level="<<level<<endl;}
}

bool allocateSkill(int& sp,int skills[],int sid,int& bdmg,int& mhp){
    if(sp<=0||sid<0||sid>=SKILL_COUNT) return false;
    sp--;skills[sid]++;
    if(sid==SKILL_STR) bdmg+=SKILL_TABLE[sid].bonus_per_point;
    else if(sid==SKILL_VIT) mhp+=SKILL_TABLE[sid].bonus_per_point;
    cout<<"SKILL_UP|"<<SKILL_TABLE[sid].name<<"|total="<<skills[sid]<<endl;
    return true;
}

int main(){
    Quest q={};q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=-1;
    strcpy(q.name,"Clear the Room");
    int gold=10,xp=0,level=1,max_hp=30,bonus_dmg=0,sp=0;
    int skills[SKILL_COUNT]={0,0};
    RewardCmd rewards[MAX_REWARDS];int rc=0;

    // Stage 1: Accept quest
    cout<<"PIPELINE_STAGE|1"<<endl;
    processQuestTrigger(q,TRIGGER_INTERACT,rewards,rc);
    cout<<"quest_state="<<q.state<<endl;

    // Stage 2: Kill 2 enemies
    cout<<"PIPELINE_STAGE|2"<<endl;
    q.current_count=2;
    processQuestTrigger(q,TRIGGER_COMPLETE,rewards,rc);
    cout<<"quest_state="<<q.state<<endl;

    // Stage 3: Turn in quest
    cout<<"PIPELINE_STAGE|3"<<endl;
    processQuestTrigger(q,TRIGGER_INTERACT,rewards,rc);
    cout<<"quest_state="<<q.state<<"|rewards_queued="<<rc<<endl;

    // Stage 4: Resolve rewards
    cout<<"PIPELINE_STAGE|4"<<endl;
    for(int i=0;i<rc;i++){
        if(rewards[i].type==REWARD_GOLD) gold+=rewards[i].value;
        else if(rewards[i].type==REWARD_XP) xp+=rewards[i].value;
    }
    rc=0;
    cout<<"gold="<<gold<<"|xp="<<xp<<endl;

    // Stage 5: Level up
    cout<<"PIPELINE_STAGE|5"<<endl;
    checkLevelUp(level,xp,max_hp,bonus_dmg,sp);
    cout<<"level="<<level<<"|sp="<<sp<<endl;

    // Stage 6: Allocate skill
    cout<<"PIPELINE_STAGE|6"<<endl;
    allocateSkill(sp,skills,SKILL_STR,bonus_dmg,max_hp);
    cout<<"COMPLETE|dmg="<<bonus_dmg<<"|hp="<<max_hp<<endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

// Quest FSM types
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

const int MAX_REWARDS=8;const int REWARD_GOLD=0;const int REWARD_XP=2;
struct RewardCmd{int type;int value;};

struct LevelRow{int xp_required;int hp_bonus;int dmg_bonus;};
const int MAX_LEVEL=5;
const LevelRow LEVEL_TABLE[MAX_LEVEL]={{0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2}};

const int SKILL_STR=0;const int SKILL_VIT=1;const int SKILL_COUNT=2;
struct SkillDef{int bonus_per_point;char name[12];};
const SkillDef SKILL_TABLE[SKILL_COUNT]={{2,"Strength"},{3,"Vitality"}};

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){rewards[count].type=type;rewards[count].value=value;count++;}
}

bool processQuestTrigger(Quest& q,int trigger,RewardCmd rewards[],int& rc){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER) cout<<"QUEST_ACCEPT|"<<q.name<<endl;
            else if(act==ACTION_REWARD){enqueueReward(rewards,rc,REWARD_GOLD,q.reward_gold);enqueueReward(rewards,rc,REWARD_XP,25);cout<<"QUEST_TURNIN|"<<q.name<<endl;}
            return true;
        }
    }return false;
}

// TODO: Implement the full pipeline trace:
// 1. Create quest, accept it (TRIGGER_INTERACT)
// 2. Simulate 2 kills (increment current_count, TRIGGER_COMPLETE)
// 3. Turn in quest (TRIGGER_INTERACT)
// 4. Resolve rewards (apply gold and XP)
// 5. Check level up
// 6. Allocate skill point
// Print PIPELINE_STAGE|N at each step

void checkLevelUp(int& level,int xp,int& max_hp,int& bonus_dmg,int& sp){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;max_hp+=LEVEL_TABLE[level].hp_bonus;bonus_dmg+=LEVEL_TABLE[level].dmg_bonus;sp++;
        cout<<"LEVEL_UP|level="<<level<<endl;}
}

bool allocateSkill(int& sp,int skills[],int sid,int& bdmg,int& mhp){
    if(sp<=0||sid<0||sid>=SKILL_COUNT) return false;
    sp--;skills[sid]++;
    if(sid==SKILL_STR) bdmg+=SKILL_TABLE[sid].bonus_per_point;
    else if(sid==SKILL_VIT) mhp+=SKILL_TABLE[sid].bonus_per_point;
    cout<<"SKILL_UP|"<<SKILL_TABLE[sid].name<<"|total="<<skills[sid]<<endl;
    return true;
}

int main(){
    Quest q={};q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=-1;
    strcpy(q.name,"Clear the Room");
    int gold=10,xp=0,level=1,max_hp=30,bonus_dmg=0,sp=0;
    int skills[SKILL_COUNT]={0,0};
    RewardCmd rewards[MAX_REWARDS];int rc=0;

    // Stage 1: Accept quest
    cout<<"PIPELINE_STAGE|1"<<endl;
    processQuestTrigger(q,TRIGGER_INTERACT,rewards,rc);
    cout<<"quest_state="<<q.state<<endl;

    // Stage 2: Kill 2 enemies
    cout<<"PIPELINE_STAGE|2"<<endl;
    q.current_count=2;
    processQuestTrigger(q,TRIGGER_COMPLETE,rewards,rc);
    cout<<"quest_state="<<q.state<<endl;

    // Stage 3: Turn in quest
    cout<<"PIPELINE_STAGE|3"<<endl;
    processQuestTrigger(q,TRIGGER_INTERACT,rewards,rc);
    cout<<"quest_state="<<q.state<<"|rewards_queued="<<rc<<endl;

    // Stage 4: Resolve rewards
    cout<<"PIPELINE_STAGE|4"<<endl;
    for(int i=0;i<rc;i++){
        if(rewards[i].type==REWARD_GOLD) gold+=rewards[i].value;
        else if(rewards[i].type==REWARD_XP) xp+=rewards[i].value;
    }
    rc=0;
    cout<<"gold="<<gold<<"|xp="<<xp<<endl;

    // Stage 5: Level up
    cout<<"PIPELINE_STAGE|5"<<endl;
    checkLevelUp(level,xp,max_hp,bonus_dmg,sp);
    cout<<"level="<<level<<"|sp="<<sp<<endl;

    // Stage 6: Allocate skill
    cout<<"PIPELINE_STAGE|6"<<endl;
    allocateSkill(sp,skills,SKILL_STR,bonus_dmg,max_hp);
    cout<<"COMPLETE|dmg="<<bonus_dmg<<"|hp="<<max_hp<<endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Stage 1: Quest accepted", expectedOutput: "QUEST_ACCEPT|Clear the Room", isPattern: false },
      { id: "t2", description: "Stage 1: State becomes ACTIVE", expectedOutput: "quest_state=1", isPattern: false },
      { id: "t3", description: "Stage 2: Quest completes", expectedOutput: "quest_state=2", isPattern: false },
      { id: "t4", description: "Stage 3: Rewards queued", expectedOutput: "quest_state=3|rewards_queued=2", isPattern: false },
      { id: "t5", description: "Stage 4: Gold and XP applied", expectedOutput: "gold=40|xp=25", isPattern: false },
      { id: "t6", description: "Stage 6: Pipeline complete", expectedOutput: "COMPLETE|dmg=", isPattern: true },
    ],
    hints: [
      "The code is already structured — trace through each stage to understand the pipeline order.",
      "Stage 2 uses TRIGGER_COMPLETE to transition from ACTIVE to COMPLETE. Stage 3 uses TRIGGER_INTERACT on the COMPLETE state to trigger ACTION_REWARD.",
      "After resolving rewards, checkLevelUp checks if 25 XP is enough for level 2 (threshold is 50). It won't level up yet — but the skill point from quest reward demonstrates the pipeline.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Full Town-to-Dungeon Game Run",
    type: "game_builder",
    instructions: `# Run the Complete Game Loop

## Goal

Run the full game with all Phase 6 systems active. The input sequence walks the player through a complete quest loop: accept quest, fight enemies, return to NPC, collect rewards, level up, allocate skill. This is a milestone — all systems must work together.

## What to Verify

1. NPC offers quest on interaction
2. Quest tracks kills correctly
3. FSM transitions fire in order
4. Reward pipeline queues and resolves gold + XP
5. Level-up grants skill point
6. Skill allocation increases bonus damage
7. HUD shows all stats including level, xp, skill points
8. Final milestone line confirms completion

## The Input Sequence

The sequence is pre-scripted to exercise every system. The quest gives enough XP (via 2 quests worth of rewards) to trigger a level-up.`,
    starterCode: `#include <iostream>
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

const int MAX_REWARDS=8;const int REWARD_GOLD=0;const int REWARD_ITEM=1;const int REWARD_XP=2;
struct RewardCmd{int type;int value;};
struct LevelRow{int xp_required;int hp_bonus;int dmg_bonus;};
const int MAX_LEVEL=5;
const LevelRow LEVEL_TABLE[MAX_LEVEL]={{0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2}};
const int SKILL_STR=0;const int SKILL_VIT=1;const int SKILL_COUNT=2;
struct SkillDef{int bonus_per_point;char name[12];};
const SkillDef SKILL_TABLE[SKILL_COUNT]={{2,"Strength"},{3,"Vitality"}};

bool allocateSkill(int& sp,int skills[],int sid,int& bdmg,int& mhp){
    if(sp<=0||sid<0||sid>=SKILL_COUNT) return false;
    sp--;skills[sid]++;
    if(sid==SKILL_STR) bdmg+=SKILL_TABLE[sid].bonus_per_point;
    else if(sid==SKILL_VIT) mhp+=SKILL_TABLE[sid].bonus_per_point;
    cout<<"SKILL_UP|"<<SKILL_TABLE[sid].name<<"|points_left="<<sp<<"|total="<<skills[sid]<<endl;
    return true;}

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){rewards[count].type=type;rewards[count].value=value;count++;
        cout<<"REWARD_QUEUE|type="<<type<<"|value="<<value<<endl;}
}
bool processQuestTrigger(Quest& q,int trigger,RewardCmd rewards[],int& rc){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER){cout<<"QUEST_OFFER|"<<q.name<<endl;cout<<"QUEST_ACCEPT|"<<q.name<<endl;}
            else if(act==ACTION_PROGRESS){cout<<"QUEST_PROGRESS|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;}
            else if(act==ACTION_REWARD){enqueueReward(rewards,rc,REWARD_GOLD,q.reward_gold);enqueueReward(rewards,rc,REWARD_XP,50);cout<<"QUEST_TURNIN|"<<q.name<<endl;}
            else if(act==ACTION_DONE){cout<<"QUEST_DONE|"<<q.name<<endl;}
            return true;}
    }return false;}

void checkQuestProgress(Quest& q,RewardCmd rewards[],int& rc){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        processQuestTrigger(q,TRIGGER_COMPLETE,rewards,rc);
        cout<<"QUEST_COMPLETE|"<<q.name<<endl;}
}
void incrementKillQuest(Quest quests[],int count,RewardCmd rewards[],int& rc){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i],rewards,rc);}
}
void checkLevelUp(int& level,int xp,int& mhp,int& bdmg,int& sp){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;mhp+=LEVEL_TABLE[level].hp_bonus;bdmg+=LEVEL_TABLE[level].dmg_bonus;sp++;
        cout<<"LEVEL_UP|level="<<level<<"|hp+"<<LEVEL_TABLE[level].hp_bonus<<"|dmg+"<<LEVEL_TABLE[level].dmg_bonus<<"|sp+1"<<endl;}
}

struct Command{int dx;int dy;bool attack;bool interact;int alloc_skill;};
Command captureInput(char c){
    Command cmd={0,0,false,false,-1};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='e') cmd.interact=true;
    else if(c=='1') cmd.alloc_skill=SKILL_STR; else if(c=='2') cmd.alloc_skill=SKILL_VIT;
    return cmd;}

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_type[MAX_E];int quest_id[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    int weapon_id;int armor_id;int gold;int xp;
    int level;int max_hp;int bonus_dmg;
    int skill_points;int skills[SKILL_COUNT];
    Quest quests[MAX_QUESTS];int quest_count;
    RewardCmd rewards[MAX_REWARDS];int reward_count;
};

void resolveRewards(WorldState& w){
    for(int i=0;i<w.reward_count;i++){
        if(w.rewards[i].type==REWARD_GOLD){w.gold+=w.rewards[i].value;cout<<"REWARD_APPLY|gold+"<<w.rewards[i].value<<endl;}
        else if(w.rewards[i].type==REWARD_ITEM){if(w.inv_count<INV_SIZE){w.inventory[w.inv_count++]=w.rewards[i].value;}cout<<"REWARD_APPLY|item="<<w.rewards[i].value<<endl;}
        else if(w.rewards[i].type==REWARD_XP){w.xp+=w.rewards[i].value;cout<<"REWARD_APPLY|xp+"<<w.rewards[i].value<<endl;}
    }w.reward_count=0;}

const char ROOM_DATA[]=
    "##########""#N.......#""#........#""#........#""#@.......#"
    "#........#""#........#""#...E....#""#.E......#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;w.gold=10;w.xp=0;
    w.reward_count=0;w.level=1;w.max_hp=30;w.bonus_dmg=0;
    w.skill_points=0;for(int s=0;s<SKILL_COUNT;s++) w.skills[s]=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int i=0;i<MAX_E;i++) w.quest_id[i]=-1;
    w.quest_count=1;
    Quest& q=w.quests[0];q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=ITEM_NONE;
    strcpy(q.name,"Clear the Room");
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;w.entity_type[id]=ETYPE_PLAYER;w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;}
        else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=8;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=1;w.entity_type[id]=ETYPE_ENEMY;w.grid[y][x]='.';}
        else if(c=='N'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=20;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;w.entity_type[id]=ETYPE_NPC;w.grid[y][x]='.';w.quest_id[id]=0;}
        else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.alloc_skill>=0) allocateSkill(w.skill_points,w.skills,cmd.alloc_skill,w.bonus_dmg,w.max_hp);
    if(cmd.interact){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_NPC) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){int qid=w.quest_id[i];if(qid>=0&&qid<w.quest_count){processQuestTrigger(w.quests[qid],TRIGGER_INTERACT,w.rewards,w.reward_count);}break;}
        }
    }
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_ENEMY) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;if(w.weapon_id>=0) dmg+=ITEM_TABLE[w.weapon_id].stat;dmg+=w.bonus_dmg;
                w.hp[i]-=dmg;cout<<"COMBAT|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){w.alive[i]=false;w.gold+=GOLD_TABLE[w.damage_id[i]].base;cout<<"KILL|id="<<i<<endl;incrementKillQuest(w.quests,w.quest_count,w.rewards,w.reward_count);}
                break;}
        }
    }
    resolveRewards(w);
    checkLevelUp(w.level,w.xp,w.max_hp,w.bonus_dmg,w.skill_points);
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<"|xp="<<w.xp<<"|level="<<w.level<<"|sp="<<w.skill_points<<endl;
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
    // Full game loop: accept quest, fight, return, reward, level, skill
    char inputs[]={
        'w','w','w','e',
        's','s','s','s','s','d','d','d','f',
        's','a','f',
        'w','w','w','w','w','w','w','e',
        '1'
    };
    int n=25;
    for(int i=0;i<n;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    cout<<"MILESTONE|town_dungeon_loop|level="<<w.level<<"|gold="<<w.gold<<"|xp="<<w.xp<<endl;
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

const int MAX_REWARDS=8;const int REWARD_GOLD=0;const int REWARD_ITEM=1;const int REWARD_XP=2;
struct RewardCmd{int type;int value;};
struct LevelRow{int xp_required;int hp_bonus;int dmg_bonus;};
const int MAX_LEVEL=5;
const LevelRow LEVEL_TABLE[MAX_LEVEL]={{0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2}};
const int SKILL_STR=0;const int SKILL_VIT=1;const int SKILL_COUNT=2;
struct SkillDef{int bonus_per_point;char name[12];};
const SkillDef SKILL_TABLE[SKILL_COUNT]={{2,"Strength"},{3,"Vitality"}};

bool allocateSkill(int& sp,int skills[],int sid,int& bdmg,int& mhp){
    if(sp<=0||sid<0||sid>=SKILL_COUNT) return false;
    sp--;skills[sid]++;
    if(sid==SKILL_STR) bdmg+=SKILL_TABLE[sid].bonus_per_point;
    else if(sid==SKILL_VIT) mhp+=SKILL_TABLE[sid].bonus_per_point;
    cout<<"SKILL_UP|"<<SKILL_TABLE[sid].name<<"|points_left="<<sp<<"|total="<<skills[sid]<<endl;
    return true;}

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){rewards[count].type=type;rewards[count].value=value;count++;
        cout<<"REWARD_QUEUE|type="<<type<<"|value="<<value<<endl;}
}
bool processQuestTrigger(Quest& q,int trigger,RewardCmd rewards[],int& rc){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER){cout<<"QUEST_OFFER|"<<q.name<<endl;cout<<"QUEST_ACCEPT|"<<q.name<<endl;}
            else if(act==ACTION_PROGRESS){cout<<"QUEST_PROGRESS|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;}
            else if(act==ACTION_REWARD){enqueueReward(rewards,rc,REWARD_GOLD,q.reward_gold);enqueueReward(rewards,rc,REWARD_XP,50);cout<<"QUEST_TURNIN|"<<q.name<<endl;}
            else if(act==ACTION_DONE){cout<<"QUEST_DONE|"<<q.name<<endl;}
            return true;}
    }return false;}

void checkQuestProgress(Quest& q,RewardCmd rewards[],int& rc){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        processQuestTrigger(q,TRIGGER_COMPLETE,rewards,rc);
        cout<<"QUEST_COMPLETE|"<<q.name<<endl;}
}
void incrementKillQuest(Quest quests[],int count,RewardCmd rewards[],int& rc){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i],rewards,rc);}
}
void checkLevelUp(int& level,int xp,int& mhp,int& bdmg,int& sp){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;mhp+=LEVEL_TABLE[level].hp_bonus;bdmg+=LEVEL_TABLE[level].dmg_bonus;sp++;
        cout<<"LEVEL_UP|level="<<level<<"|hp+"<<LEVEL_TABLE[level].hp_bonus<<"|dmg+"<<LEVEL_TABLE[level].dmg_bonus<<"|sp+1"<<endl;}
}

struct Command{int dx;int dy;bool attack;bool interact;int alloc_skill;};
Command captureInput(char c){
    Command cmd={0,0,false,false,-1};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='e') cmd.interact=true;
    else if(c=='1') cmd.alloc_skill=SKILL_STR; else if(c=='2') cmd.alloc_skill=SKILL_VIT;
    return cmd;}

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_type[MAX_E];int quest_id[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    int weapon_id;int armor_id;int gold;int xp;
    int level;int max_hp;int bonus_dmg;
    int skill_points;int skills[SKILL_COUNT];
    Quest quests[MAX_QUESTS];int quest_count;
    RewardCmd rewards[MAX_REWARDS];int reward_count;
};

void resolveRewards(WorldState& w){
    for(int i=0;i<w.reward_count;i++){
        if(w.rewards[i].type==REWARD_GOLD){w.gold+=w.rewards[i].value;cout<<"REWARD_APPLY|gold+"<<w.rewards[i].value<<endl;}
        else if(w.rewards[i].type==REWARD_ITEM){if(w.inv_count<INV_SIZE){w.inventory[w.inv_count++]=w.rewards[i].value;}cout<<"REWARD_APPLY|item="<<w.rewards[i].value<<endl;}
        else if(w.rewards[i].type==REWARD_XP){w.xp+=w.rewards[i].value;cout<<"REWARD_APPLY|xp+"<<w.rewards[i].value<<endl;}
    }w.reward_count=0;}

const char ROOM_DATA[]=
    "##########""#N.......#""#........#""#........#""#@.......#"
    "#........#""#........#""#...E....#""#.E......#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;w.gold=10;w.xp=0;
    w.reward_count=0;w.level=1;w.max_hp=30;w.bonus_dmg=0;
    w.skill_points=0;for(int s=0;s<SKILL_COUNT;s++) w.skills[s]=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int i=0;i<MAX_E;i++) w.quest_id[i]=-1;
    w.quest_count=1;
    Quest& q=w.quests[0];q.state=QUEST_INACTIVE;q.type=QUEST_KILL;
    q.target_count=2;q.current_count=0;q.reward_gold=30;q.reward_item=ITEM_NONE;
    strcpy(q.name,"Clear the Room");
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;w.entity_type[id]=ETYPE_PLAYER;w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;}
        else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=8;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=1;w.entity_type[id]=ETYPE_ENEMY;w.grid[y][x]='.';}
        else if(c=='N'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=20;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;w.entity_type[id]=ETYPE_NPC;w.grid[y][x]='.';w.quest_id[id]=0;}
        else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    if(cmd.alloc_skill>=0) allocateSkill(w.skill_points,w.skills,cmd.alloc_skill,w.bonus_dmg,w.max_hp);
    if(cmd.interact){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_NPC) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){int qid=w.quest_id[i];if(qid>=0&&qid<w.quest_count){processQuestTrigger(w.quests[qid],TRIGGER_INTERACT,w.rewards,w.reward_count);}break;}
        }
    }
    if(cmd.attack){
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]||w.entity_type[i]!=ETYPE_ENEMY) continue;
            int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
            if(dist<=1){
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;if(w.weapon_id>=0) dmg+=ITEM_TABLE[w.weapon_id].stat;dmg+=w.bonus_dmg;
                w.hp[i]-=dmg;cout<<"COMBAT|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){w.alive[i]=false;w.gold+=GOLD_TABLE[w.damage_id[i]].base;cout<<"KILL|id="<<i<<endl;incrementKillQuest(w.quests,w.quest_count,w.rewards,w.reward_count);}
                break;}
        }
    }
    resolveRewards(w);
    checkLevelUp(w.level,w.xp,w.max_hp,w.bonus_dmg,w.skill_points);
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<"|xp="<<w.xp<<"|level="<<w.level<<"|sp="<<w.skill_points<<endl;
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
    // Full game loop: accept quest, fight, return, reward, level, skill
    char inputs[]={
        'w','w','w','e',
        's','s','s','s','s','d','d','d','f',
        's','a','f',
        'w','w','w','w','w','w','w','e',
        '1'
    };
    int n=25;
    for(int i=0;i<n;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    cout<<"MILESTONE|town_dungeon_loop|level="<<w.level<<"|gold="<<w.gold<<"|xp="<<w.xp<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=4", isPattern: false },
      { id: "g2", description: "Quest accepted", expectedOutput: "QUEST_ACCEPT|Clear the Room", isPattern: false },
      { id: "g3", description: "First kill tracked", expectedOutput: "QUEST_UPDATE|Clear the Room|progress=1/2", isPattern: false },
      { id: "g4", description: "Quest complete", expectedOutput: "QUEST_COMPLETE|Clear the Room", isPattern: false },
      { id: "g5", description: "Gold reward enqueued", expectedOutput: "REWARD_QUEUE|type=0|value=30", isPattern: false },
      { id: "g6", description: "XP reward applied", expectedOutput: "REWARD_APPLY|xp+50", isPattern: false },
      { id: "g7", description: "Level up triggered", expectedOutput: "LEVEL_UP|level=2", isPattern: true },
      { id: "g8", description: "Skill allocated", expectedOutput: "SKILL_UP|Strength", isPattern: true },
      { id: "g9", description: "Milestone complete", expectedOutput: "MILESTONE|town_dungeon_loop|level=", isPattern: true },
    ],
    hints: [
      "This is a milestone — all systems should already work from L51-59. The code is pre-built. Run it and verify all outputs.",
      "The quest gives 50 XP as reward (enough for level 2 threshold of 50). After turnin, resolveRewards adds XP, checkLevelUp fires, skill point is granted.",
      "The final input '1' allocates the skill point to STR, increasing bonus_dmg by 2.",
    ],
    estimatedMinutes: 20,
  },
};