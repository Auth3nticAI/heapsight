import { Lesson } from "@/types/lesson";

export const lessonRPG55: Lesson = {
  id: "rpg-55-milestone-accept-complete-quest",
  title: "Milestone: Accept & Complete Quest",
  description: "The full quest loop: talk to NPC, accept quest, kill enemies, return to NPC, receive reward — all systems connected.",
  order: 55,
  xpReward: 300,
  tier: "pro",
  concepts: ["quest acceptance flow", "NPC-quest connection", "reward delivery", "event-to-quest pipeline", "milestone integration"],
  part1: {
    title: "Concept: The Quest Loop",
    type: "concept",
    instructions: `# Milestone: Accept & Complete Quest

## Mental Model

The quest loop is the RPG's core engagement cycle: NPC offers quest \u2192 player accepts \u2192 player completes objective \u2192 player returns to NPC \u2192 NPC delivers reward. This loop connects four systems: interaction (NPC talk), quests (state tracking), combat (kill counting), and rewards (gold/items). If any link breaks, the loop collapses.

## What Breaks Without This

Without the full loop, quests are automatic — they activate at room load and complete passively. There's no player agency in accepting or turning in quests. The NPC is decoration. The reward appears from nowhere. The loop is broken: no offer, no acceptance, no return, no delivery.

## The Fix: Quest Acceptance and Turn-In

Connect NPC interaction to quest state transitions:
1. **Offer:** When player interacts with NPC, if quest state is INACTIVE, display offer dialogue and set to ACTIVE.
2. **Progress:** Kill events increment quest counter (already built in L54).
3. **Turn-in:** When player interacts with NPC again and quest is COMPLETE, deliver reward and display completion dialogue.

The NPC's dialogue changes based on quest state: "Kill 2 enemies for me" (inactive), "You're doing well" (active), "Thank you! Here's your reward" (complete). This is why dialogue_id exists — it can shift based on quest state.

## Key Concepts
- Quest state drives NPC dialogue selection
- Interaction triggers quest state transitions (inactive \u2192 active, complete \u2192 reward delivered)
- Reward delivery as part of the interaction resolve, not automatic
- Full loop: offer \u2192 accept \u2192 progress \u2192 turn in \u2192 reward

## Performance Insight

The quest acceptance check is one comparison per NPC interaction. Reward delivery is one gold increment + one inventory add. These only happen on explicit 'e' input — zero per-tick cost. The quest system is entirely event-driven.

## Memory Insight

No new data structures. The existing quest array, dialogue table, and interaction system combine to create the loop. Zero additional memory. The reward fields in Quest (reward_gold, reward_item) are already there from L54.

## Your Task

Trace through a complete quest loop:
1. Player walks to NPC, presses 'e' \u2192 NPC offers quest, quest becomes ACTIVE
2. Player kills 2 enemies \u2192 quest progress reaches 2/2, state becomes COMPLETE
3. Player returns to NPC, presses 'e' \u2192 NPC delivers reward, quest state transitions

Write the concept-level quest acceptance logic with a simplified setup.

Expected output:
\`\`\`
QUEST_OFFER|Clear the Room|target=2
QUEST_ACCEPT|Clear the Room
QUEST_UPDATE|Clear the Room|progress=1/2
QUEST_UPDATE|Clear the Room|progress=2/2
QUEST_COMPLETE|Clear the Room|reward_gold=30
QUEST_TURNIN|Clear the Room|gold+30
\`\`\`

## Beginner Trap

**Delivering the reward automatically on completion.** The reward should only be delivered when the player returns to the NPC and interacts. If you auto-deliver on completion, the player gets gold mid-combat with no context. The return trip is part of the loop — it forces the player to navigate back, encounter hazards, and feel the accomplishment of turn-in.

## Elite Insight

Baldur's Gate requires returning to the quest giver for reward delivery. Diablo 3 auto-completes some quests but still triggers a "quest complete" UI event. Dark Souls gates rewards behind specific interactions (bonfire, NPC dialogue). Your explicit turn-in follows the Baldur's Gate model — the purest RPG quest loop. It's been the standard since 1998.

## Systems Thinking Connection

This quest loop mirrors the Robotics path's action server pattern: client sends goal (accept quest), server processes (kill enemies), server sends result (turn in). Both are request-process-result pipelines with explicit state transitions.

## Skill Reinforcement

Lessons 51-54 built the pieces: NPC entities (51), interaction command (52), dialogue data (53), quest structs (54). This milestone connects them all into a working loop. Phase 6 continues with quest state machines (56) and rewards pipelines (57).

## Mastery Check

What happens if the player interacts with the NPC while the quest is in ACTIVE state (not yet complete)?
Answer: The NPC should display progress dialogue ("Keep fighting!") but not change quest state. The interaction is acknowledged but produces no state transition — the quest stays ACTIVE until kill count reaches the target.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int QUEST_INACTIVE=0;const int QUEST_ACTIVE=1;const int QUEST_COMPLETE=2;
const int QUEST_TURNIN=3;
const int QUEST_KILL=0;

struct Quest{int state;int type;int target_count;int current_count;int reward_gold;char name[32];};

// TODO: Write offerQuest(Quest& q) — if INACTIVE, print offer and set ACTIVE
// TODO: Write tryTurnIn(Quest& q, int& gold) — if COMPLETE, add reward_gold to gold, print TURNIN, set state=TURNIN

void checkQuestProgress(Quest& q){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        q.state=QUEST_COMPLETE;
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}

void incrementKillQuest(Quest& q){
    if(q.state!=QUEST_ACTIVE||q.type!=QUEST_KILL) return;
    q.current_count++;
    cout<<"QUEST_UPDATE|"<<q.name<<"|progress="<<q.current_count<<"/"<<q.target_count<<endl;
    checkQuestProgress(q);
}

int main(){
    Quest q={QUEST_INACTIVE,QUEST_KILL,2,0,30,""};
    strcpy(q.name,"Clear the Room");
    int gold=50;

    // Step 1: Interact with NPC — offer quest
    offerQuest(q);

    // Step 2: Kill 2 enemies
    incrementKillQuest(q);
    incrementKillQuest(q);

    // Step 3: Return to NPC — turn in
    tryTurnIn(q,gold);

    cout<<"FINAL_GOLD|"<<gold<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int QUEST_INACTIVE=0;const int QUEST_ACTIVE=1;const int QUEST_COMPLETE=2;
const int QUEST_TURNIN=3;
const int QUEST_KILL=0;

struct Quest{int state;int type;int target_count;int current_count;int reward_gold;char name[32];};

void offerQuest(Quest& q){
    if(q.state==QUEST_INACTIVE){
        cout<<"QUEST_OFFER|"<<q.name<<"|target="<<q.target_count<<endl;
        q.state=QUEST_ACTIVE;
        cout<<"QUEST_ACCEPT|"<<q.name<<endl;
    }
}

void tryTurnIn(Quest& q,int& gold){
    if(q.state==QUEST_COMPLETE){
        gold+=q.reward_gold;
        cout<<"QUEST_TURNIN|"<<q.name<<"|gold+"<<q.reward_gold<<endl;
        q.state=QUEST_TURNIN;
    }
}

void checkQuestProgress(Quest& q){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        q.state=QUEST_COMPLETE;
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}

void incrementKillQuest(Quest& q){
    if(q.state!=QUEST_ACTIVE||q.type!=QUEST_KILL) return;
    q.current_count++;
    cout<<"QUEST_UPDATE|"<<q.name<<"|progress="<<q.current_count<<"/"<<q.target_count<<endl;
    checkQuestProgress(q);
}

int main(){
    Quest q={QUEST_INACTIVE,QUEST_KILL,2,0,30,""};
    strcpy(q.name,"Clear the Room");
    int gold=50;

    offerQuest(q);
    incrementKillQuest(q);
    incrementKillQuest(q);
    tryTurnIn(q,gold);

    cout<<"FINAL_GOLD|"<<gold<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Quest offered", expectedOutput: "QUEST_OFFER|Clear the Room|target=2", isPattern: false },
      { id: "t2", description: "Quest accepted", expectedOutput: "QUEST_ACCEPT|Clear the Room", isPattern: false },
      { id: "t3", description: "First kill", expectedOutput: "QUEST_UPDATE|Clear the Room|progress=1/2", isPattern: false },
      { id: "t4", description: "Quest complete", expectedOutput: "QUEST_COMPLETE|Clear the Room|reward_gold=30", isPattern: false },
      { id: "t5", description: "Quest turned in", expectedOutput: "QUEST_TURNIN|Clear the Room|gold+30", isPattern: false },
      { id: "t6", description: "Gold updated", expectedOutput: "FINAL_GOLD|80", isPattern: false },
    ],
    hints: [
      "offerQuest checks q.state==QUEST_INACTIVE, prints QUEST_OFFER, sets q.state=QUEST_ACTIVE, prints QUEST_ACCEPT.",
      "tryTurnIn checks q.state==QUEST_COMPLETE, adds q.reward_gold to gold, prints QUEST_TURNIN, sets q.state=QUEST_TURNIN.",
      "The full sequence: offer (inactive->active), 2 kills (active->complete), turnin (complete->turnin). Gold goes from 50 to 80."
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Full Quest Loop in the Dungeon",
    type: "game_builder",
    instructions: `# Full Quest Loop in the Dungeon

## Mental Model

The full quest loop in the dungeon: player walks to NPC, interacts to accept quest, walks to enemies, kills them, quest completes, player returns to NPC, interacts to turn in, receives gold reward. Every system from Phase 5 and 6 contributes.

## What Breaks Without This

Without the full loop integrated into game_tick, quests exist in isolation. The NPC's dialogue doesn't change. Rewards aren't delivered through interaction. The quest system is technically functional but not connected to the gameplay experience.

## The Fix: Quest Logic in Interaction Block

Update the interaction block in game_tick:
- If NPC has a quest and it's INACTIVE \u2192 offer and accept
- If quest is ACTIVE \u2192 show progress dialogue
- If quest is COMPLETE \u2192 deliver reward and set TURNIN
- If quest is TURNIN \u2192 show "already completed" dialogue

Add a \`quest_id\` field to NPCs (which quest they're associated with). This connects NPC entities to quest data.

## Key Concepts
- NPC-quest association via quest_id in entity data
- Interaction block branches on quest state
- Reward delivery through interaction, not automatic
- Full loop demonstrated in one scripted run

## Performance Insight

The quest check during interaction is O(1) — direct quest_id lookup. No iteration needed. The entire quest loop adds zero per-tick cost; it only fires on explicit interaction.

## Memory Insight

One additional int per entity (quest_id) = 64 bytes for MAX_E. Total WorldState growth is minimal. All data remains stack-resident.

## Your Task

Implement the full quest loop: walk to NPC, accept quest, kill 2 enemies, return to NPC, turn in for gold reward. The HUD should show quest state throughout.

## Beginner Trap

**Forgetting to update the NPC's dialogue after quest state changes.** If the NPC always says "Welcome" regardless of quest state, the player gets no feedback about quest progress or completion. Branch dialogue on quest state.

## Elite Insight

Nintendo's quest designs are famously simple: talk, do thing, return. Breath of the Wild's side quests follow this exact loop. The simplicity is the genius — each quest teaches a location, a mechanic, or a reward. Your quest loop follows the same design: simple structure, clear feedback, tangible reward.

## Systems Thinking Connection

This milestone integrates the same number of systems as the Robotics path's Gate A (teleop) — multiple subsystems (NPC, quest, combat, reward) must all function correctly in one run. Integration milestones are architecture tests.

## Skill Reinforcement

This milestone integrates L51 (NPCs), L52 (interaction), L53 (dialogue), and L54 (quests). Lesson 56 extends quest state machines. Lesson 57 formalizes the reward pipeline.

## Mastery Check

If you replay this exact sequence with the same seed, will the quest complete identically? What about the loot drops?
Answer: Yes, quest completion is deterministic (kill count is deterministic). Loot drops depend on the RNG state at kill time — same seed, same kills in same order = same drops. The entire run is reproducible.`,
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

void checkQuestProgress(Quest& q){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        q.state=QUEST_COMPLETE;
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}
void incrementKillQuest(Quest quests[],int count){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i]);
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
    int quest_id[MAX_E];  // which quest this NPC is associated with (-1 for none)
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
            w.quest_id[id]=0; // This NPC offers quest 0
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

// TODO: Update game_tick to handle quest acceptance and turn-in in the interaction block
// When interacting with NPC that has quest_id >= 0:
//   If quest is INACTIVE: print QUEST_OFFER and QUEST_ACCEPT, set ACTIVE
//   If quest is ACTIVE: print progress dialogue
//   If quest is COMPLETE: deliver reward (add gold), print QUEST_TURNIN, set TURNIN
//   If quest is TURNIN: print already-completed dialogue

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
                    // TODO: Branch on q.state and handle offer/progress/turnin/done
                    cout<<"INTERACT|npc_id="<<i<<endl;
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
                    incrementKillQuest(w.quests,w.quest_count);
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
    // 1. Walk up to NPC, interact to accept quest
    // 2. Walk down to enemies, kill both
    // 3. Walk back up to NPC, interact to turn in
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
    cout<<"MILESTONE|quest_loop|gold="<<w.gold<<endl;
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

void checkQuestProgress(Quest& q){
    if(q.state==QUEST_ACTIVE&&q.current_count>=q.target_count){
        q.state=QUEST_COMPLETE;
        cout<<"QUEST_COMPLETE|"<<q.name<<"|reward_gold="<<q.reward_gold<<endl;
    }
}
void incrementKillQuest(Quest quests[],int count){
    for(int i=0;i<count;i++){
        if(quests[i].state!=QUEST_ACTIVE||quests[i].type!=QUEST_KILL) continue;
        quests[i].current_count++;
        cout<<"QUEST_UPDATE|"<<quests[i].name<<"|progress="<<quests[i].current_count<<"/"<<quests[i].target_count<<endl;
        checkQuestProgress(quests[i]);
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
                    Quest& q=w.quests[qid];
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
                    incrementKillQuest(w.quests,w.quest_count);
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
    cout<<"MILESTONE|quest_loop|gold="<<w.gold<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=4", isPattern: false },
      { id: "g2", description: "Quest offered by NPC", expectedOutput: "QUEST_OFFER|Clear the Room|target=2", isPattern: false },
      { id: "g3", description: "Quest accepted", expectedOutput: "QUEST_ACCEPT|Clear the Room", isPattern: false },
      { id: "g4", description: "First kill updates quest", expectedOutput: "QUEST_UPDATE|Clear the Room|progress=1/2", isPattern: false },
      { id: "g5", description: "Second kill completes quest", expectedOutput: "QUEST_COMPLETE|Clear the Room|reward_gold=30", isPattern: false },
      { id: "g6", description: "Quest turned in at NPC", expectedOutput: "QUEST_TURNIN|Clear the Room|gold+30", isPattern: false },
      { id: "g7", description: "HUD shows quest done", expectedOutput: "QUEST|Clear the Room|DONE", isPattern: false },
      { id: "g8", description: "Milestone complete with correct gold", expectedOutput: "MILESTONE|quest_loop|gold=", isPattern: true },
    ],
    hints: [
      "In the interaction block, get qid from w.quest_id[i]. Branch on w.quests[qid].state for INACTIVE (offer), ACTIVE (progress), COMPLETE (turnin), TURNIN (done).",
      "For INACTIVE: print dialogue[0], print QUEST_OFFER, set state=ACTIVE, print QUEST_ACCEPT. For COMPLETE: print dialogue[2], add reward_gold to w.gold, print QUEST_TURNIN, set state=TURNIN.",
      "The NPC is at (1,1). Player starts at (1,4). Walk up 3 to be adjacent. Enemies at (4,7) and (2,8). Design the input sequence to visit NPC, kill both, return to NPC."
    ],
    estimatedMinutes: 20,
  },
};
