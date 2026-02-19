import { Lesson } from "@/types/lesson";

export const lessonRPG52: Lesson = {
  id: "rpg-52-interaction-command",
  title: "Interaction Command",
  description: "Press 'e' to interact with an adjacent NPC — a new command type that triggers events without combat.",
  order: 52,
  xpReward: 100,
  tier: "pro",
  concepts: ["interaction as command", "non-combat action", "adjacency-triggered events", "command pattern extension"],
  part1: {
    title: "Concept: Commands Beyond Combat",
    type: "concept",
    instructions: `# Interaction Command

## Mental Model

Until now, every player command maps to movement or violence: walk, attack, use item, shop. But RPGs need non-combat interactions: talk to NPCs, examine objects, open chests, read signs. The interaction command is a new intent type — "I want to interact with whatever is adjacent" — that routes through the same command pipeline but triggers dialogue or events instead of damage.

## What Breaks Without This

Without an interaction command, the player can't talk to NPCs. They can walk to them, stand next to them, but nothing happens. The NPC is just a tile that blocks movement. No quests, no dialogue, no story progression. The player has a sword but no voice.

## The Fix: Interaction Command

Add \`bool interact\` to the Command struct. Map the 'e' key to \`cmd.interact = true\`. In the PLAYING mode of game_tick, after movement but before combat, check: if interact is true, scan adjacent entities for ETYPE_NPC. If found, print an interaction event. This event will later trigger dialogue and quest logic.

The key architectural insight: interaction uses the SAME command pipeline as combat. It's not a special case — it's another command type. The pipeline is: input \u2192 command \u2192 resolve movement \u2192 resolve interaction \u2192 resolve combat \u2192 status \u2192 AI \u2192 render. Interaction slots in naturally.

## Key Concepts
- Interaction as a command field (bool interact)
- Adjacency check for NPC entities
- Non-combat event generation
- Command pipeline extension (no new pipeline, just new field)

## Performance Insight

The interaction check is one adjacency scan per tick when 'e' is pressed — O(entity_count). Same cost as the combat scan. When interact is false (most ticks), the check is skipped entirely. Zero overhead when not interacting.

## Memory Insight

One bool added to Command struct. One adjacency loop that runs conditionally. No new arrays, no new data structures. Memory footprint unchanged. The interaction event will eventually produce dialogue text, but that's loaded from const data — no heap.

## Your Task

Add \`bool interact\` to Command. Map 'e' to interaction. Write an adjacency check that finds the nearest NPC and prints \`INTERACT|npc_id={id}\`. Test with a player adjacent to an NPC.

Expected output:
\`\`\`
INTERACT|npc_id=1
NO_INTERACT|no_npc_adjacent
\`\`\`

## Beginner Trap

**Checking interaction AFTER combat.** If the player presses 'e' and 'f' in the same turn (impossible with single-key input, but architecturally), interaction should resolve before combat. In the pipeline, interaction is a peaceful action — it should happen in the "resolve intents" phase, not after damage is dealt. Order matters for determinism.

## Elite Insight

Baldur's Gate separates combat actions from interaction actions in its action queue. Clicking an NPC queues "interact," clicking an enemy queues "attack." The queue processes them in priority order: movement first, then interaction, then combat. Your command pipeline follows the same priority structure. Dark Souls uses the same button for interact and attack — context determines which fires. Your 'e' key is the dedicated interact button, cleaner but same principle.

## Systems Thinking Connection

This interaction command parallels the Robotics path's service calls — both are request-response patterns triggered by proximity or context. The robot sends a service request when it reaches a waypoint; your player sends an interact command when adjacent to an NPC.

## Skill Reinforcement

Lesson 16 introduced the command queue. Lesson 47 extended it with buy_id. This lesson adds interact — the third command extension. Lesson 53 will use interaction to trigger dialogue data. Lesson 76 formalizes the full command pattern.

## Mastery Check

Why is interaction a field on Command rather than a separate function call?
Answer: Routing interaction through the command pipeline ensures it's processed in the correct pipeline order, logged for replay, and deterministic. A direct function call bypasses the pipeline — it can't be replayed, can't be reordered, and breaks the architecture.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E=8;
const int ETYPE_PLAYER=0;
const int ETYPE_ENEMY=1;
const int ETYPE_NPC=3;

struct Command{
    int dx;int dy;
    bool attack;
    // TODO: Add bool interact
};

Command captureInput(char c){
    Command cmd={0,0,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    // TODO: Map 'e' to cmd.interact=true
    return cmd;
}

struct World{
    int pos_x[MAX_E],pos_y[MAX_E];
    int entity_type[MAX_E];
    bool alive[MAX_E];
    int entity_count;
};

// TODO: Write findAdjacentNPC(World& w) -> int
// Return the id of the first alive NPC adjacent to player (entity 0)
// Return -1 if none found

int main(){
    World w={};
    w.entity_count=2;
    w.pos_x[0]=3;w.pos_y[0]=3;w.entity_type[0]=ETYPE_PLAYER;w.alive[0]=true;
    w.pos_x[1]=4;w.pos_y[1]=3;w.entity_type[1]=ETYPE_NPC;w.alive[1]=true;

    // Adjacent — should interact
    Command cmd1=captureInput('e');
    if(cmd1.interact){
        int npc=findAdjacentNPC(w);
        if(npc>=0) cout<<"INTERACT|npc_id="<<npc<<endl;
        else cout<<"NO_INTERACT|no_npc_adjacent"<<endl;
    }

    // Move away, then try interact — should fail
    w.pos_x[0]=1;w.pos_y[0]=1;
    Command cmd2=captureInput('e');
    if(cmd2.interact){
        int npc=findAdjacentNPC(w);
        if(npc>=0) cout<<"INTERACT|npc_id="<<npc<<endl;
        else cout<<"NO_INTERACT|no_npc_adjacent"<<endl;
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E=8;
const int ETYPE_PLAYER=0;
const int ETYPE_ENEMY=1;
const int ETYPE_NPC=3;

struct Command{
    int dx;int dy;
    bool attack;
    bool interact;
};

Command captureInput(char c){
    Command cmd={0,0,false,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='e') cmd.interact=true;
    return cmd;
}

struct World{
    int pos_x[MAX_E],pos_y[MAX_E];
    int entity_type[MAX_E];
    bool alive[MAX_E];
    int entity_count;
};

int findAdjacentNPC(World& w){
    for(int i=1;i<w.entity_count;i++){
        if(!w.alive[i]) continue;
        if(w.entity_type[i]!=ETYPE_NPC) continue;
        int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
        if(dist<=1) return i;
    }
    return -1;
}

int main(){
    World w={};
    w.entity_count=2;
    w.pos_x[0]=3;w.pos_y[0]=3;w.entity_type[0]=ETYPE_PLAYER;w.alive[0]=true;
    w.pos_x[1]=4;w.pos_y[1]=3;w.entity_type[1]=ETYPE_NPC;w.alive[1]=true;

    Command cmd1=captureInput('e');
    if(cmd1.interact){
        int npc=findAdjacentNPC(w);
        if(npc>=0) cout<<"INTERACT|npc_id="<<npc<<endl;
        else cout<<"NO_INTERACT|no_npc_adjacent"<<endl;
    }

    w.pos_x[0]=1;w.pos_y[0]=1;
    Command cmd2=captureInput('e');
    if(cmd2.interact){
        int npc=findAdjacentNPC(w);
        if(npc>=0) cout<<"INTERACT|npc_id="<<npc<<endl;
        else cout<<"NO_INTERACT|no_npc_adjacent"<<endl;
    }

    return 0;
}`,
    tests: [
      { id: "t1", description: "Interact with adjacent NPC", expectedOutput: "INTERACT|npc_id=1", isPattern: false },
      { id: "t2", description: "No NPC adjacent", expectedOutput: "NO_INTERACT|no_npc_adjacent", isPattern: false },
    ],
    hints: [
      "Add bool interact to Command, initialized to false. Map 'e' in captureInput.",
      "findAdjacentNPC loops entities, checks alive, checks entity_type==ETYPE_NPC, then Manhattan distance <= 1.",
      "Return the first matching NPC id, or -1 if none found."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: NPC Interaction in the Dungeon",
    type: "game_builder",
    instructions: `# NPC Interaction in the Dungeon

## Mental Model

Integrating the interaction command into the full dungeon RPG means adding \`bool interact\` to Command, mapping 'e' to it, and adding an interaction resolution block in game_tick. When the player presses 'e' adjacent to an NPC, the game prints a dialogue event. This event will later connect to quest logic and dialogue trees.

## What Breaks Without This

NPCs exist on the grid (from L51) but are inert — the player can't communicate with them. Without interaction, NPCs are decorative obstacles. The quest system (L54-56) needs interaction as its trigger mechanism.

## The Fix: Interaction Resolution in game_tick

Add \`bool interact\` to Command. In game_tick, after movement and before combat, check: if \`cmd.interact\`, scan for adjacent NPCs using entity_type. If found, print \`INTERACT|npc_id={id}|name=Villager\`. This is the hook point for future dialogue and quest triggers.

Pipeline order: move \u2192 use item \u2192 **interact** \u2192 combat \u2192 poison \u2192 status \u2192 AI \u2192 render.

## Key Concepts
- interact field in Command struct
- Interaction resolution block in game_tick
- NPC adjacency scan using entity_type
- Pipeline placement: after movement, before combat

## Performance Insight

The interaction scan is identical in cost to the combat scan — O(entity_count) with early exits. It only runs when interact is true. Most turns, it's skipped entirely.

## Memory Insight

One bool added to Command. No new WorldState fields. The interaction block reuses the existing entity arrays. Zero memory growth.

## Your Task

Add \`bool interact\` to Command and 'e' mapping. Add interaction resolution in game_tick after movement, before combat. When interacting with adjacent NPC, print the interaction event. Walk to NPC, interact, then walk away and try again.

## Beginner Trap

**Allowing interact and attack in the same turn.** If the player could somehow trigger both, the NPC might get attacked after being interacted with. In single-key input this can't happen (one key per turn), but architecturally, interaction should be checked first and should skip the rest of the resolve phase if triggered. For v0, single-key input prevents the conflict naturally.

## Elite Insight

The Elder Scrolls separates interact into contextual actions: activate shrine, loot corpse, talk to NPC, read book. All route through one "activate" command, with context determining the response. Your 'e' key is the same unified activate — the entity type determines the response. Nethack uses a single '#chat' command that checks the target type. Same pattern, 1987 to 2025.

## Systems Thinking Connection

This interaction command mirrors the Platformer path's ground-check + jump system — both use proximity detection (adjacent vs grounded) to enable context-sensitive actions. Different domain, same trigger pattern.

## Skill Reinforcement

Lesson 51 added NPC entities to the grid. This lesson makes them interactable. Lesson 53 connects interaction to dialogue data. Lesson 54 connects dialogue to quest state.

## Mastery Check

Why should the interaction block run before the combat block in the pipeline?
Answer: If combat runs first, a bug could cause the NPC to be targeted (if the type check has an off-by-one). Interaction first means the "peaceful" action resolves before any damage is dealt. Pipeline order encodes priority: talk first, fight second.`,
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
    int total=0;for(int i=0;i<count;i++) total+=table[i].weight;
    if(total<=0) return ITEM_NONE;
    int roll=(int)(rng_next(r)%total);int acc=0;
    for(int i=0;i<count;i++){acc+=table[i].weight;if(roll<acc) return table[i].item_id;}
    return table[count-1].item_id;
}

const LootEntry* getLootTable(int damage_id,int& out_count){
    if(damage_id==1){out_count=LOOT_COUNT_E1;return LOOT_TABLE_E1;}
    if(damage_id==2){out_count=LOOT_COUNT_E2;return LOOT_TABLE_E2;}
    out_count=0;return nullptr;
}

const int EFFECT_NONE=0;const int EFFECT_POISON=1;const int MAX_EFFECTS=4;
struct StatusEffect{int type;int magnitude;int turns;};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_GUARD=2;const int ETYPE_NPC=3;
char entityChar(int etype){
    if(etype==ETYPE_PLAYER) return '@';if(etype==ETYPE_ENEMY) return 'E';
    if(etype==ETYPE_GUARD) return 'G';if(etype==ETYPE_NPC) return 'N';return '?';
}

// TODO: Add bool interact to Command struct
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
    // TODO: Map 'e' to interact
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
    for(int i=0;i<w.player_effect_count;i++) if(w.player_effects[i].type==type) return;
    if(w.player_effect_count>=MAX_EFFECTS) return;
    w.player_effects[w.player_effect_count++]={type,magnitude,turns};
    cout<<"EFFECT_APPLY|type="<<type<<"|mag="<<magnitude<<"|turns="<<turns<<endl;
}

void processStatus(WorldState& w){
    int i=0;
    while(i<w.player_effect_count){
        StatusEffect& fx=w.player_effects[i];
        if(fx.type==EFFECT_POISON){
            w.hp[0]-=fx.magnitude;fx.turns--;
            cout<<"STATUS|poison|dmg="<<fx.magnitude<<"|hp="<<w.hp[0]<<"|turns_left="<<fx.turns<<endl;
            if(fx.turns<=0){cout<<"STATUS|expired|type="<<fx.type<<endl;
                for(int j=i;j<w.player_effect_count-1;j++) w.player_effects[j]=w.player_effects[j+1];
                w.player_effect_count--;continue;}
        }
        i++;
    }
}

bool tryBuyItem(WorldState& w,int item_id){
    if(item_id<0||item_id>=ITEM_COUNT) return false;
    if(w.gold<ITEM_TABLE[item_id].value) return false;
    if(w.inv_count>=INV_SIZE) return false;
    w.gold-=ITEM_TABLE[item_id].value;w.inventory[w.inv_count++]=item_id;return true;
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
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){w.mode=MODE_SHOPPING;cout<<"SHOP|open"<<endl;return;}
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.use_item){
            for(int i=0;i<w.inv_count;i++){
                int item_id=w.inventory[i];
                if(item_id<0||item_id>=ITEM_COUNT) continue;
                if(ITEM_TABLE[item_id].type==ITEM_TYPE_CONSUMABLE){
                    int heal=ITEM_TABLE[item_id].stat;w.hp[0]+=heal;
                    if(w.hp[0]>MAX_HP) w.hp[0]=MAX_HP;
                    cout<<"USE|"<<ITEM_TABLE[item_id].name<<"|heal="<<heal<<"|hp="<<w.hp[0]<<endl;
                    for(int j=i;j<w.inv_count-1;j++) w.inventory[j]=w.inventory[j+1];
                    w.inventory[w.inv_count-1]=ITEM_NONE;w.inv_count--;break;
                }
            }
        }
        // TODO: Add interaction block here — before combat
        // If cmd.interact, scan for adjacent NPC, print INTERACT|npc_id={id}|name=Villager
        // If no NPC adjacent, print NO_INTERACT|no_npc_adjacent
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
                        int lc=0;const LootEntry* lt=getLootTable(w.damage_id[i],lc);
                        if(lt){int dropped=rollLoot(lt,lc,w.rng);
                            if(dropped!=ITEM_NONE&&w.inv_count<INV_SIZE){w.inventory[w.inv_count++]=dropped;
                                cout<<"LOOT|"<<ITEM_TABLE[dropped].name<<"|id="<<dropped<<endl;
                            }else if(dropped==ITEM_NONE){cout<<"LOOT|nothing"<<endl;}}
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
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to NPC at (7,8), interact, then walk away and try interact
    char inputs[]={'s','s','s','s','s','s','s','d','d','d','d','d','e','w','e'};
    for(int i=0;i<15;i++){
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
    int total=0;for(int i=0;i<count;i++) total+=table[i].weight;
    if(total<=0) return ITEM_NONE;
    int roll=(int)(rng_next(r)%total);int acc=0;
    for(int i=0;i<count;i++){acc+=table[i].weight;if(roll<acc) return table[i].item_id;}
    return table[count-1].item_id;
}

const LootEntry* getLootTable(int damage_id,int& out_count){
    if(damage_id==1){out_count=LOOT_COUNT_E1;return LOOT_TABLE_E1;}
    if(damage_id==2){out_count=LOOT_COUNT_E2;return LOOT_TABLE_E2;}
    out_count=0;return nullptr;
}

const int EFFECT_NONE=0;const int EFFECT_POISON=1;const int MAX_EFFECTS=4;
struct StatusEffect{int type;int magnitude;int turns;};

const int ETYPE_PLAYER=0;const int ETYPE_ENEMY=1;const int ETYPE_GUARD=2;const int ETYPE_NPC=3;
char entityChar(int etype){
    if(etype==ETYPE_PLAYER) return '@';if(etype==ETYPE_ENEMY) return 'E';
    if(etype==ETYPE_GUARD) return 'G';if(etype==ETYPE_NPC) return 'N';return '?';
}

struct Command{int dx;int dy;bool attack;bool use_item;bool open_shop;bool close_shop;int buy_id;bool interact;};
Command captureInput(char c){
    Command cmd={0,0,false,false,false,false,-1,false};
    if(c=='w') cmd.dy=-1; else if(c=='s') cmd.dy=1;
    else if(c=='a') cmd.dx=-1; else if(c=='d') cmd.dx=1;
    else if(c=='f') cmd.attack=true;
    else if(c=='u') cmd.use_item=true;
    else if(c=='b') cmd.open_shop=true;
    else if(c=='q') cmd.close_shop=true;
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
    for(int i=0;i<w.player_effect_count;i++) if(w.player_effects[i].type==type) return;
    if(w.player_effect_count>=MAX_EFFECTS) return;
    w.player_effects[w.player_effect_count++]={type,magnitude,turns};
    cout<<"EFFECT_APPLY|type="<<type<<"|mag="<<magnitude<<"|turns="<<turns<<endl;
}

void processStatus(WorldState& w){
    int i=0;
    while(i<w.player_effect_count){
        StatusEffect& fx=w.player_effects[i];
        if(fx.type==EFFECT_POISON){
            w.hp[0]-=fx.magnitude;fx.turns--;
            cout<<"STATUS|poison|dmg="<<fx.magnitude<<"|hp="<<w.hp[0]<<"|turns_left="<<fx.turns<<endl;
            if(fx.turns<=0){cout<<"STATUS|expired|type="<<fx.type<<endl;
                for(int j=i;j<w.player_effect_count-1;j++) w.player_effects[j]=w.player_effects[j+1];
                w.player_effect_count--;continue;}
        }
        i++;
    }
}

bool tryBuyItem(WorldState& w,int item_id){
    if(item_id<0||item_id>=ITEM_COUNT) return false;
    if(w.gold<ITEM_TABLE[item_id].value) return false;
    if(w.inv_count>=INV_SIZE) return false;
    w.gold-=ITEM_TABLE[item_id].value;w.inventory[w.inv_count++]=item_id;return true;
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
}

void game_tick(WorldState& w,Command cmd){
    w.event_count=0;
    if(w.mode==MODE_PLAYING){
        if(cmd.open_shop){w.mode=MODE_SHOPPING;cout<<"SHOP|open"<<endl;return;}
        w.turn++;
        int nx=w.pos_x[0]+cmd.dx,ny=w.pos_y[0]+cmd.dy;
        if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
        if(cmd.use_item){
            for(int i=0;i<w.inv_count;i++){
                int item_id=w.inventory[i];
                if(item_id<0||item_id>=ITEM_COUNT) continue;
                if(ITEM_TABLE[item_id].type==ITEM_TYPE_CONSUMABLE){
                    int heal=ITEM_TABLE[item_id].stat;w.hp[0]+=heal;
                    if(w.hp[0]>MAX_HP) w.hp[0]=MAX_HP;
                    cout<<"USE|"<<ITEM_TABLE[item_id].name<<"|heal="<<heal<<"|hp="<<w.hp[0]<<endl;
                    for(int j=i;j<w.inv_count-1;j++) w.inventory[j]=w.inventory[j+1];
                    w.inventory[w.inv_count-1]=ITEM_NONE;w.inv_count--;break;
                }
            }
        }
        if(cmd.interact){
            bool found=false;
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
                if(w.entity_type[i]!=ETYPE_NPC) continue;
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1){cout<<"INTERACT|npc_id="<<i<<"|name=Villager"<<endl;found=true;break;}
            }
            if(!found) cout<<"NO_INTERACT|no_npc_adjacent"<<endl;
        }
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
                        int lc=0;const LootEntry* lt=getLootTable(w.damage_id[i],lc);
                        if(lt){int dropped=rollLoot(lt,lc,w.rng);
                            if(dropped!=ITEM_NONE&&w.inv_count<INV_SIZE){w.inventory[w.inv_count++]=dropped;
                                cout<<"LOOT|"<<ITEM_TABLE[dropped].name<<"|id="<<dropped<<endl;
                            }else if(dropped==ITEM_NONE){cout<<"LOOT|nothing"<<endl;}}
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
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk to NPC at (7,8), interact, then walk away and try interact
    char inputs[]={'s','s','s','s','s','s','s','d','d','d','d','d','e','w','e'};
    for(int i=0;i<15;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads with NPC", expectedOutput: "LOAD|room=10x10|entities=2", isPattern: false },
      { id: "g2", description: "NPC interaction triggered", expectedOutput: "INTERACT|npc_id=1|name=Villager", isPattern: false },
      { id: "g3", description: "No NPC when far away", expectedOutput: "NO_INTERACT|no_npc_adjacent", isPattern: false },
      { id: "g4", description: "HUD shows NPC count", expectedOutput: "npcs=1", isPattern: true },
      { id: "g5", description: "Player HP unchanged (no combat)", expectedOutput: "HUD|hp=30|", isPattern: true },
    ],
    hints: [
      "Add bool interact to Command struct (after buy_id). Initialize to false. Map 'e' in captureInput.",
      "In game_tick after use_item block and before attack block, add: if(cmd.interact){ scan entities for ETYPE_NPC within distance 1 }",
      "Loop entities, check alive && entity_type==ETYPE_NPC && Manhattan distance <= 1. If found, print INTERACT line and break. If loop ends without finding, print NO_INTERACT."
    ],
    estimatedMinutes: 12,
  },
};
