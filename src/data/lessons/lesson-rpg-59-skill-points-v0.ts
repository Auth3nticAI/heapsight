import { Lesson } from "@/types/lesson";

export const lessonRPG59: Lesson = {
  id: "rpg-59-skill-points-v0",
  title: "Skill Points v0",
  description: "Allocate skill points on level-up to boost damage or HP — player build as data, not hardcoded progression.",
  order: 59,
  xpReward: 100,
  tier: "pro",
  concepts: ["skill point allocation", "player build", "stat customization", "data-driven progression", "command-driven allocation"],
  part1: {
    title: "Skill Points as Player Build Data",
    type: "concept",
    instructions: `# Skill Points: Player Build as Data

## Mental Model

In Lesson 58, level-ups give fixed stat bonuses from a table. Every player who reaches level 3 gets exactly +5 HP and +1 damage. There's no choice, no customization, no build identity.

Real RPGs let players **choose** where to invest. Skyrim has Health/Magicka/Stamina. Dark Souls has Vigor/Strength/Dexterity. Diablo has stat points. The choice is what makes each playthrough feel different.

## The Fix: Skill Points + Allocation Command

Each level-up grants skill points. The player allocates them via a command:

\`\`\`cpp
const int SKILL_STR = 0;  // +2 damage per point
const int SKILL_VIT = 1;  // +3 HP per point
const int SKILL_COUNT = 2;

struct SkillDef {
    int bonus_per_point;  // How much each point gives
    char name[12];
};

const SkillDef SKILL_TABLE[SKILL_COUNT] = {
    { 2, "Strength" },   // Each STR point = +2 dmg
    { 3, "Vitality" },   // Each VIT point = +3 HP
};
\`\`\`

Allocation is a simple function that validates and applies:

\`\`\`cpp
bool allocateSkill(int& points, int skills[], int skill_id,
                   int& bonus_dmg, int& max_hp) {
    if (points <= 0 || skill_id < 0 || skill_id >= SKILL_COUNT)
        return false;
    points--;
    skills[skill_id]++;
    if (skill_id == SKILL_STR) bonus_dmg += SKILL_TABLE[SKILL_STR].bonus_per_point;
    else if (skill_id == SKILL_VIT) max_hp += SKILL_TABLE[SKILL_VIT].bonus_per_point;
    return true;
}
\`\`\`

## Why This Matters

| Without skill points | With skill points |
|--------------------|------------------|
| Every player identical at level 5 | Tank build: 5 VIT. Glass cannon: 5 STR |
| No replayability | Different builds, different strategies |
| Stats are output-only | Stats are player input — agency |

## Beginner Trap: Floating Point Stats

Some RPGs use float bonuses like +1.5 damage per point. This introduces floating point determinism issues — different compilers may round differently, breaking replay. Keep bonuses as integers. Integer math is deterministic across all platforms.

## Elite Insight: Dark Souls Soft Caps

Dark Souls uses diminishing returns on stats after certain thresholds (soft caps). The same pattern: a lookup table maps stat level to bonus. Your flat-rate table is simpler but the architecture is identical — data-driven, no branching per level.

## Memory Insight

Skill data: 2 entries × 16 bytes = 32 bytes. Player skill counts: 2 ints = 8 bytes. Total skill system overhead: 40 bytes. Fits in a single cache line.

## What You'll Build

In Part 1, define the skill table and \`allocateSkill\` function. In Part 2, integrate it into the game with skill point allocation as a player command.`,
    starterCode: `#include <iostream>
using namespace std;

const int SKILL_STR=0;const int SKILL_VIT=1;const int SKILL_COUNT=2;
struct SkillDef{int bonus_per_point;char name[12];};
const SkillDef SKILL_TABLE[SKILL_COUNT]={
    {2,"Strength"},{3,"Vitality"},
};

// TODO: Implement allocateSkill(int& points, int skills[], int skill_id,
//                                int& bonus_dmg, int& max_hp)
// Validate: points>0, skill_id in range
// Decrement points, increment skills[skill_id]
// Apply: STR adds bonus_per_point to bonus_dmg, VIT adds to max_hp
// Print SKILL_UP|name|points_left=N|total=skills[id]
// Return true if allocated, false if invalid

int main(){
    int points=3,bonus_dmg=0,max_hp=30;
    int skills[SKILL_COUNT]={0,0};

    // Allocate 2 STR, 1 VIT
    allocateSkill(points,skills,SKILL_STR,bonus_dmg,max_hp);
    allocateSkill(points,skills,SKILL_STR,bonus_dmg,max_hp);
    allocateSkill(points,skills,SKILL_VIT,bonus_dmg,max_hp);
    cout<<"STATS|dmg="<<bonus_dmg<<"|hp="<<max_hp<<"|pts="<<points<<endl;

    // Try to allocate with 0 points — should fail
    bool ok=allocateSkill(points,skills,SKILL_STR,bonus_dmg,max_hp);
    cout<<"FAIL|"<<ok<<endl;

    // Print skill breakdown
    for(int i=0;i<SKILL_COUNT;i++){
        cout<<"SKILL|"<<SKILL_TABLE[i].name<<"="<<skills[i]<<endl;
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int SKILL_STR=0;const int SKILL_VIT=1;const int SKILL_COUNT=2;
struct SkillDef{int bonus_per_point;char name[12];};
const SkillDef SKILL_TABLE[SKILL_COUNT]={
    {2,"Strength"},{3,"Vitality"},
};

bool allocateSkill(int& points,int skills[],int skill_id,int& bonus_dmg,int& max_hp){
    if(points<=0||skill_id<0||skill_id>=SKILL_COUNT) return false;
    points--;skills[skill_id]++;
    if(skill_id==SKILL_STR) bonus_dmg+=SKILL_TABLE[SKILL_STR].bonus_per_point;
    else if(skill_id==SKILL_VIT) max_hp+=SKILL_TABLE[SKILL_VIT].bonus_per_point;
    cout<<"SKILL_UP|"<<SKILL_TABLE[skill_id].name<<"|points_left="<<points<<"|total="<<skills[skill_id]<<endl;
    return true;
}

int main(){
    int points=3,bonus_dmg=0,max_hp=30;
    int skills[SKILL_COUNT]={0,0};

    allocateSkill(points,skills,SKILL_STR,bonus_dmg,max_hp);
    allocateSkill(points,skills,SKILL_STR,bonus_dmg,max_hp);
    allocateSkill(points,skills,SKILL_VIT,bonus_dmg,max_hp);
    cout<<"STATS|dmg="<<bonus_dmg<<"|hp="<<max_hp<<"|pts="<<points<<endl;

    bool ok=allocateSkill(points,skills,SKILL_STR,bonus_dmg,max_hp);
    cout<<"FAIL|"<<ok<<endl;

    for(int i=0;i<SKILL_COUNT;i++){
        cout<<"SKILL|"<<SKILL_TABLE[i].name<<"="<<skills[i]<<endl;
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "First STR allocation", expectedOutput: "SKILL_UP|Strength|points_left=2|total=1", isPattern: false },
      { id: "t2", description: "Second STR allocation", expectedOutput: "SKILL_UP|Strength|points_left=1|total=2", isPattern: false },
      { id: "t3", description: "VIT allocation", expectedOutput: "SKILL_UP|Vitality|points_left=0|total=1", isPattern: false },
      { id: "t4", description: "Stats correct", expectedOutput: "STATS|dmg=4|hp=33|pts=0", isPattern: false },
      { id: "t5", description: "Allocation fails with 0 points", expectedOutput: "FAIL|0", isPattern: false },
      { id: "t6", description: "STR total correct", expectedOutput: "SKILL|Strength=2", isPattern: false },
      { id: "t7", description: "VIT total correct", expectedOutput: "SKILL|Vitality=1", isPattern: false },
    ],
    hints: [
      "First validate: if points<=0 or skill_id out of range, return false immediately.",
      "Decrement points, increment skills[skill_id]. Then check skill_id to apply the right bonus.",
      "STR bonus_per_point is 2, so 2 points = +4 damage. VIT bonus_per_point is 3, so 1 point = +3 HP (30+3=33).",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Skill Allocation in the Game Loop",
    type: "game_builder",
    instructions: `# Integrate Skill Points into the Full Game

## Goal

Add skill points, skill allocation, and skill-driven stat bonuses to the game. Level-ups grant 1 skill point. The player allocates via '1' (STR) or '2' (VIT) keys. Bonus damage from skills stacks with level-up bonus damage.

## What Changes

1. **Add** \`SKILL_TABLE\`, \`SkillDef\`, and \`allocateSkill\` function
2. **Add** \`skill_points\`, \`skills[SKILL_COUNT]\` to WorldState
3. **Modify** \`checkLevelUp\` to grant 1 skill point per level
4. **Add** '1'/'2' key handling in \`captureInput\` via \`alloc_skill\` field in Command
5. **Process** skill allocation in game_tick before combat
6. **Update** HUD to show skill points and allocations

## Visible Change

After leveling up, \`SKILL_POINTS|1\` appears. Player presses '1' to allocate STR, and subsequent combat shows higher damage. HUD shows \`sp=\` (skill points available).`,
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

const int MAX_REWARDS=8;
const int REWARD_GOLD=0;const int REWARD_ITEM=1;const int REWARD_XP=2;
struct RewardCmd{int type;int value;};

struct LevelRow{int xp_required;int hp_bonus;int dmg_bonus;};
const int MAX_LEVEL=5;
const LevelRow LEVEL_TABLE[MAX_LEVEL]={
    {0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2},
};

// TODO: Add SkillDef struct, SKILL_TABLE, SKILL_STR, SKILL_VIT, SKILL_COUNT
// TODO: Implement allocateSkill()

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){rewards[count].type=type;rewards[count].value=value;count++;
        cout<<"REWARD_QUEUE|type="<<type<<"|value="<<value<<endl;}
}

bool processQuestTrigger(Quest& q,int trigger,RewardCmd rewards[],int& reward_count){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER){cout<<"QUEST_OFFER|"<<q.name<<endl;cout<<"QUEST_ACCEPT|"<<q.name<<endl;}
            else if(act==ACTION_PROGRESS){cout<<"QUEST_PROGRESS|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;}
            else if(act==ACTION_REWARD){enqueueReward(rewards,reward_count,REWARD_GOLD,q.reward_gold);enqueueReward(rewards,reward_count,REWARD_XP,25);cout<<"QUEST_TURNIN|"<<q.name<<endl;}
            else if(act==ACTION_DONE){cout<<"QUEST_DONE|"<<q.name<<endl;}
            return true;
        }
    }return false;
}

void checkQuestProgress(Quest& q,RewardCmd rewards[],int& reward_count){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        processQuestTrigger(q,TRIGGER_COMPLETE,rewards,reward_count);
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;}
}
void incrementKillQuest(Quest quests[],int count,RewardCmd rewards[],int& reward_count){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i],rewards,reward_count);}
}

// TODO: Modify checkLevelUp to also grant skill points (1 per level)
void checkLevelUp(int& level,int xp,int& max_hp,int& bonus_dmg){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;max_hp+=LEVEL_TABLE[level].hp_bonus;bonus_dmg+=LEVEL_TABLE[level].dmg_bonus;
        cout<<"LEVEL_UP|level="<<level<<"|hp+"<<LEVEL_TABLE[level].hp_bonus<<"|dmg+"<<LEVEL_TABLE[level].dmg_bonus<<endl;}
}

// TODO: Add alloc_skill field to Command (-1 = none, 0 = STR, 1 = VIT)
struct Command{int dx;int dy;bool attack;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='e') cmd.interact=true;
    // TODO: Handle '1' -> SKILL_STR, '2' -> SKILL_VIT
    return cmd;
}

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
    Quest quests[MAX_QUESTS];int quest_count;
    RewardCmd rewards[MAX_REWARDS];int reward_count;
    // TODO: Add skill_points, skills[SKILL_COUNT]
};

void resolveRewards(WorldState& w){
    for(int i=0;i<w.reward_count;i++){
        if(w.rewards[i].type==REWARD_GOLD){w.gold+=w.rewards[i].value;cout<<"REWARD_APPLY|gold+"<<w.rewards[i].value<<endl;}
        else if(w.rewards[i].type==REWARD_ITEM){if(w.inv_count<INV_SIZE){w.inventory[w.inv_count++]=w.rewards[i].value;}cout<<"REWARD_APPLY|item="<<w.rewards[i].value<<endl;}
        else if(w.rewards[i].type==REWARD_XP){w.xp+=w.rewards[i].value;cout<<"REWARD_APPLY|xp+"<<w.rewards[i].value<<endl;}
    }w.reward_count=0;
}

const char ROOM_DATA[]=
    "##########""#N.......#""#........#""#........#""#@.......#"
    "#........#""#........#""#...E....#""#.E......#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;w.gold=10;w.xp=0;
    w.reward_count=0;w.level=1;w.max_hp=30;w.bonus_dmg=0;
    // TODO: Initialize skill_points=0, skills[]={0,0}
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

// TODO: Process skill allocation in game_tick
// TODO: Call allocateSkill when cmd.alloc_skill >= 0
void game_tick(WorldState& w,Command cmd){
    w.turn++;
    int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
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
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0) dmg+=ITEM_TABLE[w.weapon_id].stat;
                dmg+=w.bonus_dmg;
                w.hp[i]-=dmg;
                cout<<"COMBAT|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
                if(w.hp[i]<=0){w.alive[i]=false;w.gold+=GOLD_TABLE[w.damage_id[i]].base;cout<<"KILL|id="<<i<<endl;incrementKillQuest(w.quests,w.quest_count,w.rewards,w.reward_count);}
                break;}
        }
    }
    resolveRewards(w);
    checkLevelUp(w.level,w.xp,w.max_hp,w.bonus_dmg);
}

void renderHUD(const WorldState& w){
    int ae=0;for(int i=1;i<w.entity_count;i++) if(w.alive[i]&&w.entity_type[i]==ETYPE_ENEMY) ae++;
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<"|enemies="<<ae<<"|gold="<<w.gold<<"|xp="<<w.xp<<"|level="<<w.level<<endl;
    // TODO: Add skill points to HUD
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
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
    cout<<"FINAL|level="<<w.level<<"|xp="<<w.xp<<"|bonus_dmg="<<w.bonus_dmg<<"|sp="<<w.skill_points<<endl;
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
const LevelRow LEVEL_TABLE[MAX_LEVEL]={{0,0,0},{50,5,1},{120,5,1},{200,8,2},{350,10,2}};

const int SKILL_STR=0;const int SKILL_VIT=1;const int SKILL_COUNT=2;
struct SkillDef{int bonus_per_point;char name[12];};
const SkillDef SKILL_TABLE[SKILL_COUNT]={{2,"Strength"},{3,"Vitality"}};

bool allocateSkill(int& points,int skills[],int skill_id,int& bonus_dmg,int& max_hp){
    if(points<=0||skill_id<0||skill_id>=SKILL_COUNT) return false;
    points--;skills[skill_id]++;
    if(skill_id==SKILL_STR) bonus_dmg+=SKILL_TABLE[SKILL_STR].bonus_per_point;
    else if(skill_id==SKILL_VIT) max_hp+=SKILL_TABLE[SKILL_VIT].bonus_per_point;
    cout<<"SKILL_UP|"<<SKILL_TABLE[skill_id].name<<"|points_left="<<points<<"|total="<<skills[skill_id]<<endl;
    return true;
}

void enqueueReward(RewardCmd rewards[],int& count,int type,int value){
    if(count<MAX_REWARDS){rewards[count].type=type;rewards[count].value=value;count++;
        cout<<"REWARD_QUEUE|type="<<type<<"|value="<<value<<endl;}
}

bool processQuestTrigger(Quest& q,int trigger,RewardCmd rewards[],int& reward_count){
    for(int t=0;t<FSM_COUNT;t++){
        if(QUEST_FSM[t].from_state==q.state&&QUEST_FSM[t].trigger==trigger){
            q.state=QUEST_FSM[t].to_state;int act=QUEST_FSM[t].action;
            if(act==ACTION_OFFER){cout<<"QUEST_OFFER|"<<q.name<<endl;cout<<"QUEST_ACCEPT|"<<q.name<<endl;}
            else if(act==ACTION_PROGRESS){cout<<"QUEST_PROGRESS|"<<q.name<<"|"<<q.current_count<<"/"<<q.target_count<<endl;}
            else if(act==ACTION_REWARD){enqueueReward(rewards,reward_count,REWARD_GOLD,q.reward_gold);enqueueReward(rewards,reward_count,REWARD_XP,25);cout<<"QUEST_TURNIN|"<<q.name<<endl;}
            else if(act==ACTION_DONE){cout<<"QUEST_DONE|"<<q.name<<endl;}
            return true;
        }
    }return false;
}

void checkQuestProgress(Quest& q,RewardCmd rewards[],int& reward_count){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        processQuestTrigger(q,TRIGGER_COMPLETE,rewards,reward_count);
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;}
}
void incrementKillQuest(Quest quests[],int count,RewardCmd rewards[],int& reward_count){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i],rewards,reward_count);}
}

void checkLevelUp(int& level,int xp,int& max_hp,int& bonus_dmg,int& skill_points){
    while(level<MAX_LEVEL-1&&xp>=LEVEL_TABLE[level+1].xp_required){
        level++;max_hp+=LEVEL_TABLE[level].hp_bonus;bonus_dmg+=LEVEL_TABLE[level].dmg_bonus;
        skill_points++;
        cout<<"LEVEL_UP|level="<<level<<"|hp+"<<LEVEL_TABLE[level].hp_bonus<<"|dmg+"<<LEVEL_TABLE[level].dmg_bonus<<"|sp+1"<<endl;}
}

struct Command{int dx;int dy;bool attack;bool interact;int alloc_skill;};
Command captureInput(char c){
    Command cmd={0,0,false,false,-1};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='e') cmd.interact=true;
    else if(c=='1') cmd.alloc_skill=SKILL_STR; else if(c=='2') cmd.alloc_skill=SKILL_VIT;
    return cmd;
}

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
    }w.reward_count=0;
}

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
    if(cmd.alloc_skill>=0){
        allocateSkill(w.skill_points,w.skills,cmd.alloc_skill,w.bonus_dmg,w.max_hp);
    }
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
                int dmg=DAMAGE_TABLE[w.damage_id[0]].base_dmg;
                if(w.weapon_id>=0) dmg+=ITEM_TABLE[w.weapon_id].stat;
                dmg+=w.bonus_dmg;
                w.hp[i]-=dmg;
                cout<<"COMBAT|target="<<i<<"|dmg="<<dmg<<"|hp="<<w.hp[i]<<endl;
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
    cout<<"FINAL|level="<<w.level<<"|xp="<<w.xp<<"|bonus_dmg="<<w.bonus_dmg<<"|sp="<<w.skill_points<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=4", isPattern: false },
      { id: "g2", description: "Quest turnin grants rewards", expectedOutput: "QUEST_TURNIN|Clear the Room", isPattern: false },
      { id: "g3", description: "Skill point granted on level-up", expectedOutput: "|sp+1", isPattern: true },
      { id: "g4", description: "STR skill allocated", expectedOutput: "SKILL_UP|Strength|points_left=", isPattern: true },
      { id: "g5", description: "HUD shows skill points", expectedOutput: "|sp=", isPattern: true },
      { id: "g6", description: "Final stats printed", expectedOutput: "FINAL|level=", isPattern: true },
    ],
    hints: [
      "Add skill_points and skills[SKILL_COUNT] to WorldState. Initialize skill_points=0 and skills[]={0,0} in loadRoom.",
      "Modify checkLevelUp to take int& skill_points and increment it by 1 each level. Print |sp+1 in the LEVEL_UP line.",
      "Add alloc_skill=-1 to Command struct. In captureInput, map '1' to SKILL_STR and '2' to SKILL_VIT. In game_tick, call allocateSkill when alloc_skill >= 0.",
    ],
    estimatedMinutes: 15,
  },
};