import { Lesson } from "@/types/lesson";

export const lessonRPG53: Lesson = {
  id: "rpg-53-dialogue-data-v0",
  title: "Dialogue Data v0",
  description: "NPCs speak from a const dialogue table — each NPC ID maps to a fixed dialogue line, loaded from data rather than hardcoded strings.",
  order: 53,
  xpReward: 100,
  tier: "pro",
  concepts: ["dialogue as data table", "NPC-to-dialogue mapping", "const text lookup", "data-driven narrative"],
  part1: {
    title: "Concept: Dialogue as Data",
    type: "concept",
    instructions: `# Dialogue Data v0

## Mental Model

Dialogue is data, not code. Each NPC has a dialogue_id that indexes into a const table of dialogue lines. When the player interacts with an NPC, the game looks up dialogue_id, retrieves the text, and prints it. Changing what an NPC says means changing a table entry — not modifying game logic. This separates content from code.

## What Breaks Without This

Without dialogue data, NPC text is hardcoded: \`if(npc_id==1) cout<<"Hello";\` Add 10 NPCs and you have 10 if-statements. Change one line of dialogue and you recompile the game. Mix content and code and you get a maintenance nightmare. Writers can't edit text without touching C++. Translators can't localize without breaking compilation.

## The Fix: Dialogue Table

Define a \`DialogueLine\` struct with a \`char text[64]\` field. Create a const array of dialogue lines indexed by dialogue_id. Add a \`dialogue_id\` field to each NPC entity (stored in a parallel array in WorldState). When interaction triggers, look up the dialogue and print it.

For v0, dialogue is a single line per NPC. Future lessons will add multi-line dialogues, branching choices, and quest-triggered dialogue changes. But the foundation is always: ID \u2192 lookup \u2192 text. No heap. No dynamic strings. No runtime allocation.

## Key Concepts
- DialogueLine struct with fixed-size text buffer
- Const dialogue table indexed by dialogue_id
- NPC dialogue_id stored in entity parallel arrays
- Text lookup at interaction time — no hardcoded strings in logic

## Performance Insight

Dialogue lookup is O(1) — direct array index. The text buffer is 64 bytes per line, so 8 dialogue entries = 512 bytes. Fits in a single cache line cluster. The lookup happens once per interaction (not per tick), so performance is irrelevant — but the pattern scales to hundreds of dialogues without any cost increase.

## Memory Insight

Fixed-size char arrays instead of std::string means no heap allocation. The dialogue table is const data — placed in .rodata by the compiler. The dialogue_id per entity is one int in the parallel array. Total overhead: ~520 bytes for the table + 64 bytes for 16 entity IDs. Trivial.

## Your Task

Define a \`DialogueLine\` struct. Create a const dialogue table with 3 entries. Add a dialogue_id field. Write a lookup function that retrieves text by ID. Test with known IDs.

Expected output:
\`\`\`
DIALOGUE|id=0|text=Welcome, adventurer!
DIALOGUE|id=1|text=The dungeon is dangerous.
DIALOGUE|id=2|text=Buy my wares!
\`\`\`

## Beginner Trap

**Using \`std::string\` for dialogue text.** Every \`std::string\` potentially allocates on the heap. With 100 dialogue lines, that's 100 potential allocations at startup. Use \`char text[64]\` — fixed size, stack-friendly, no allocator involvement. If 64 chars isn't enough, increase the buffer size. The constraint is deliberate: it keeps dialogue short and punchy, just like classic RPGs.

## Elite Insight

Nethack stores all dialogue in fixed-size buffers compiled into the binary. Baldur's Gate uses indexed .tlk (talk) files — a binary table of string offsets. Both patterns avoid runtime string allocation. Your const array of fixed-size char buffers is the simplest correct version. The production version loads from external files, but the index-based lookup is identical.

## Systems Thinking Connection

This data-driven text pattern mirrors the Robotics path's parameter YAML files — both separate configuration data from executable code. The robot loads sensor parameters from YAML; your RPG loads dialogue from data tables. Same principle: data changes shouldn't require code changes.

## Skill Reinforcement

Lesson 41 introduced item tables as const data. Lesson 51 added NPC entities. This lesson connects them — NPCs have dialogue IDs that index into a data table. Lesson 54 will add quest data that references dialogues.

## Mastery Check

Why use a fixed-size char array instead of a pointer to a string literal?
Answer: Pointers require the string literals to exist somewhere in memory — they do (in .rodata), but the pointer adds an indirection. A fixed-size array embeds the text directly in the struct, making the table a single contiguous block. Better cache behavior, simpler serialization, no dangling pointer risk.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

struct DialogueLine{
    char text[64];
};

// TODO: Create a const dialogue table with 3 entries
// Entry 0: "Welcome, adventurer!"
// Entry 1: "The dungeon is dangerous."
// Entry 2: "Buy my wares!"

// TODO: Write getDialogue(int id) that returns a pointer to the DialogueLine
// Return nullptr if id is out of range

int main(){
    for(int i=0;i<3;i++){
        const DialogueLine* dl=getDialogue(i);
        if(dl) cout<<"DIALOGUE|id="<<i<<"|text="<<dl->text<<endl;
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

struct DialogueLine{
    char text[64];
};

const int DIALOGUE_COUNT=3;
const DialogueLine DIALOGUE_TABLE[DIALOGUE_COUNT]={
    {"Welcome, adventurer!"},
    {"The dungeon is dangerous."},
    {"Buy my wares!"},
};

const DialogueLine* getDialogue(int id){
    if(id<0||id>=DIALOGUE_COUNT) return nullptr;
    return &DIALOGUE_TABLE[id];
}

int main(){
    for(int i=0;i<3;i++){
        const DialogueLine* dl=getDialogue(i);
        if(dl) cout<<"DIALOGUE|id="<<i<<"|text="<<dl->text<<endl;
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "First dialogue line", expectedOutput: "DIALOGUE|id=0|text=Welcome, adventurer!", isPattern: false },
      { id: "t2", description: "Second dialogue line", expectedOutput: "DIALOGUE|id=1|text=The dungeon is dangerous.", isPattern: false },
      { id: "t3", description: "Third dialogue line", expectedOutput: "DIALOGUE|id=2|text=Buy my wares!", isPattern: false },
    ],
    hints: [
      "Define const DialogueLine DIALOGUE_TABLE[3] with brace initialization: {{\"text1\"},{\"text2\"},{\"text3\"}}.",
      "getDialogue checks bounds (id >= 0 && id < DIALOGUE_COUNT), returns &DIALOGUE_TABLE[id] or nullptr.",
      "In main, call getDialogue(i) and print dl->text if the pointer is not null."
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Build: NPCs That Speak",
    type: "game_builder",
    instructions: `# NPCs That Speak

## Mental Model

Connecting dialogue data to the dungeon RPG: each NPC entity gets a dialogue_id in the parallel arrays. When the player interacts with an NPC (from L52), the game looks up dialogue_id, retrieves the text from the const table, and prints it. The NPC goes from a silent 'N' on the grid to a character that speaks.

## What Breaks Without This

Without dialogue, interaction just prints "INTERACT|npc_id=1" — a system event, not a human-readable response. The player gets no information, no story, no reason to talk to NPCs. The interaction command is mechanically complete but narratively empty.

## The Fix: Dialogue ID in WorldState

Add \`int dialogue_id[MAX_E]\` to WorldState. Set it during loadRoom — each NPC gets a specific dialogue_id. Update the interaction block in game_tick to look up the dialogue and print it. The INTERACT output now includes the dialogue text.

## Key Concepts
- dialogue_id parallel array in WorldState
- Dialogue lookup during interaction
- Const dialogue table — no heap
- NPC identification through dialogue content

## Performance Insight

One additional int per entity in WorldState. One array lookup during interaction. Zero per-tick cost — dialogue only fires on explicit 'e' input. The dialogue table sits in .rodata alongside item and damage tables.

## Memory Insight

dialogue_id adds 64 bytes (16 entities \u00d7 4 bytes). Dialogue table adds 192 bytes (3 entries \u00d7 64 bytes). Total: 256 bytes. Stack-resident. No heap.

## Your Task

Add dialogue_id to WorldState and DIALOGUE_TABLE. In loadRoom, assign dialogue_id to NPCs. In game_tick interaction block, look up dialogue and print it. Place an NPC with dialogue in the room and interact.

## Beginner Trap

**Printing dialogue every tick instead of only on interaction.** Dialogue should only display when the player explicitly presses 'e'. If you put dialogue printing in the render pass, the NPC "talks" every frame. Keep dialogue in the interaction resolution block — event-driven, not continuous.

## Elite Insight

Baldur's Gate's .dlg files are indexed tables of dialogue nodes. Each node has a response ID, condition checks, and follow-up links. Your flat dialogue table is the seed of this system. The production version adds conditions (quest state, faction), multiple responses, and branching — but the core lookup is always: NPC \u2192 dialogue_id \u2192 text.

## Systems Thinking Connection

This NPC dialogue maps to the Platformer path's sign/NPC text system — both use proximity + interaction to display stored text. The architecture is identical: entity type check, adjacency check, data lookup, display.

## Skill Reinforcement

Lesson 52 added the interaction command. This lesson connects it to data. Lesson 54 introduces quest structs that reference dialogue IDs and NPC IDs — dialogue becomes a quest trigger.

## Mastery Check

How would you make an NPC's dialogue change after a quest is completed?
Answer: Add a secondary dialogue_id (or a dialogue_state index) that advances when quest state changes. The lookup becomes: dialogue_table[npc.dialogue_id + quest_offset]. The data table grows, but the lookup pattern is unchanged.`,
    starterCode: `#include <iostream>
#include <cstring>
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
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},{ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},{ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

const int EFFECT_NONE=0;const int EFFECT_POISON=1;const int MAX_EFFECTS=4;
struct StatusEffect{int type;int magnitude;int turns;};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_GUARD=2;const int ETYPE_NPC=3;

// TODO: Define DialogueLine struct and const DIALOGUE_TABLE
// Entry 0: "Welcome, adventurer!"
// Entry 1: "Beware the guards. They carry poison."
// Entry 2: "I have nothing more to say."

struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;int buy_id;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false,-1,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true; else if(c=='q') cmd.close_shop=true;
    else if(c=='e') cmd.interact=true;
    else if(c>='1'&&c<='5') cmd.buy_id=c-'1';
    return cmd;
}

struct CombatEvent{int src;int target;int dmg;int hp_after;bool killed;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_type[MAX_E];
    // TODO: Add int dialogue_id[MAX_E]
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    CombatEvent event_log[MAX_EVENTS];int event_count;
    int weapon_id;int armor_id;
    int gold;int mode;
    StatusEffect player_effects[MAX_EFFECTS];
    int player_effect_count;
};

void applyEffect(WorldState& w,int type,int mag,int turns){
    for(int i=0;i<w.player_effect_count;i++) if(w.player_effects[i].type==type) return;
    if(w.player_effect_count>=MAX_EFFECTS) return;
    w.player_effects[w.player_effect_count++]={type,mag,turns};
}

void processStatus(WorldState& w){
    int i=0;
    while(i<w.player_effect_count){
        StatusEffect& fx=w.player_effects[i];
        if(fx.type==EFFECT_POISON){w.hp[0]-=fx.magnitude;fx.turns--;
            if(fx.turns<=0){for(int j=i;j<w.player_effect_count-1;j++) w.player_effects[j]=w.player_effects[j+1];
                w.player_effect_count--;continue;}}
        i++;
    }
}

const char ROOM_DATA[]=
    "##########""#@.......#""#........#""#........#""#........#"
    "#........#""#........#""#........#""#......N.#""##########";

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
        }else if(c=='N'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=20;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_NPC;w.grid[y][x]='.';
            // TODO: Set dialogue_id[id] = 0 (or appropriate ID)
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.interact){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]||w.entity_type[i]!=ETYPE_NPC) continue;
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){
                    cout<<"INTERACT|npc_id="<<i<<endl;
                    // TODO: Look up dialogue_id[i] and print DIALOGUE|text=...
                    break;
                }
            }
        }
        processStatus(w);
    }
}

void renderHUD(const WorldState& w){
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to NPC, interact twice
    char inputs[]={'s','s','s','s','s','s','s','d','d','d','d','d','e','e'};
    for(int i=0;i<14;i++){
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
    {ITEM_TYPE_WEAPON,3,10,"Iron Sword"},{ITEM_TYPE_WEAPON,5,25,"Steel Sword"},
    {ITEM_TYPE_ARMOR,2,8,"Leather"},{ITEM_TYPE_ARMOR,4,20,"Chain Mail"},
    {ITEM_TYPE_CONSUMABLE,10,5,"Potion"},
};

const int EFFECT_NONE=0;const int EFFECT_POISON=1;const int MAX_EFFECTS=4;
struct StatusEffect{int type;int magnitude;int turns;};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_GUARD=2;const int ETYPE_NPC=3;

struct DialogueLine{char text[64];};
const int DIALOGUE_COUNT=3;
const DialogueLine DIALOGUE_TABLE[DIALOGUE_COUNT]={
    {"Welcome, adventurer!"},
    {"Beware the guards. They carry poison."},
    {"I have nothing more to say."},
};

const DialogueLine* getDialogue(int id){
    if(id<0||id>=DIALOGUE_COUNT) return nullptr;
    return &DIALOGUE_TABLE[id];
}

struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;int buy_id;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false,-1,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true; else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true; else if(c=='q') cmd.close_shop=true;
    else if(c=='e') cmd.interact=true;
    else if(c>='1'&&c<='5') cmd.buy_id=c-'1';
    return cmd;
}

struct CombatEvent{int src;int target;int dmg;int hp_after;bool killed;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int behavior_id[MAX_E];int damage_id[MAX_E];
    int entity_type[MAX_E];
    int dialogue_id[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    CombatEvent event_log[MAX_EVENTS];int event_count;
    int weapon_id;int armor_id;
    int gold;int mode;
    StatusEffect player_effects[MAX_EFFECTS];
    int player_effect_count;
};

void applyEffect(WorldState& w,int type,int mag,int turns){
    for(int i=0;i<w.player_effect_count;i++) if(w.player_effects[i].type==type) return;
    if(w.player_effect_count>=MAX_EFFECTS) return;
    w.player_effects[w.player_effect_count++]={type,mag,turns};
}

void processStatus(WorldState& w){
    int i=0;
    while(i<w.player_effect_count){
        StatusEffect& fx=w.player_effects[i];
        if(fx.type==EFFECT_POISON){w.hp[0]-=fx.magnitude;fx.turns--;
            if(fx.turns<=0){for(int j=i;j<w.player_effect_count-1;j++) w.player_effects[j]=w.player_effects[j+1];
                w.player_effect_count--;continue;}}
        i++;
    }
}

const char ROOM_DATA[]=
    "##########""#@.......#""#........#""#........#""#........#"
    "#........#""#........#""#........#""#......N.#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;
    w.gold=50;w.mode=MODE_PLAYING;w.player_effect_count=0;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int i=0;i<MAX_E;i++) w.dialogue_id[i]=-1;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_PLAYER;
            w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='N'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=20;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.entity_type[id]=ETYPE_NPC;w.grid[y][x]='.';
            w.dialogue_id[id]=0;
        }else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|room="<<dw<<"x"<<dh<<"|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.interact){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]||w.entity_type[i]!=ETYPE_NPC) continue;
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){
                    cout<<"INTERACT|npc_id="<<i<<endl;
                    const DialogueLine* dl=getDialogue(w.dialogue_id[i]);
                    if(dl) cout<<"DIALOGUE|text="<<dl->text<<endl;
                    break;
                }
            }
        }
        processStatus(w);
    }
}

void renderHUD(const WorldState& w){
    cout<<"HUD|hp="<<w.hp[0]<<"|turn="<<w.turn<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to NPC, interact twice
    char inputs[]={'s','s','s','s','s','s','s','d','d','d','d','d','e','e'};
    for(int i=0;i<14;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=2", isPattern: false },
      { id: "g2", description: "NPC interaction triggered", expectedOutput: "INTERACT|npc_id=1", isPattern: false },
      { id: "g3", description: "Dialogue displayed", expectedOutput: "DIALOGUE|text=Welcome, adventurer!", isPattern: false },
      { id: "g4", description: "Second interaction also works", expectedOutput: "DIALOGUE|text=Welcome, adventurer!", isPattern: false },
      { id: "g5", description: "HUD shows turns advancing", expectedOutput: "HUD|hp=30|turn=", isPattern: true },
    ],
    hints: [
      "Define DialogueLine struct with char text[64]. Create DIALOGUE_TABLE with 3 entries. Write getDialogue(int id) returning a const pointer.",
      "Add int dialogue_id[MAX_E] to WorldState. Initialize all to -1 in loadRoom. Set w.dialogue_id[id]=0 for NPCs.",
      "In the interaction block, after printing INTERACT, call getDialogue(w.dialogue_id[i]). If non-null, print DIALOGUE|text= followed by dl->text."
    ],
    estimatedMinutes: 12,
  },
};
