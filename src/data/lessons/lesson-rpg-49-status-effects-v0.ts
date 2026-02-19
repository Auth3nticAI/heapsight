import { Lesson } from "@/types/lesson";

export const lessonRPG49: Lesson = {
  id: "rpg-49-status-effects-v0",
  title: "Status Effects v0",
  description: "Poison ticks down HP each turn, processed in a dedicated status pass — fixed-size effect slots with countdown timers.",
  order: 49,
  xpReward: 100,
  tier: "pro",
  concepts: ["tick-based effects", "status slot array", "countdown timer", "effect processing pass"],
  part1: {
    title: "Concept: Tick-Based Effect Processing",
    type: "concept",
    instructions: `# Status Effects v0

## Mental Model

A status effect is a timed mutation: "reduce HP by 2 every turn for 3 turns." It's not an instant action — it's a scheduled series of actions. You store it as data (effect type, magnitude, remaining turns), process it in a dedicated pass each tick, and decrement the timer. When the timer hits zero, the effect expires. Fixed-size array. No heap. No dynamic dispatch.

## What Breaks Without This

Without status effects, combat is instant: attack → damage → done. There's no lingering consequence. Poison, buffs, debuffs — none of them work. The RPG feels shallow because every interaction resolves in a single turn. No "I'm poisoned, I need to heal before fighting" tension. No tactical depth.

## The Fix: Status Effect Slots

Add a fixed-size array of effect slots to the entity data. Each slot holds: effect type (poison, regen, etc.), magnitude (damage or heal per tick), and turns remaining. Each tick, a dedicated "status pass" walks all active effects, applies their magnitude, and decrements the timer. When turns_remaining hits zero, clear the slot.

This fits perfectly into the existing tick pipeline: input \u2192 command \u2192 resolve \u2192 apply \u2192 **status pass** \u2192 cleanup \u2192 render. The status pass runs after combat resolution but before cleanup, so poison can kill an entity that cleanup then removes.

The key constraint: fixed-size slots. A typical RPG needs 3-4 effect slots per entity. That's 12-16 bytes per entity — trivial memory cost. No heap allocation. No linked lists. No dynamic arrays.

## Key Concepts
- Effect slot: struct with type, magnitude, turns_remaining
- Fixed-size effect array: MAX_EFFECTS slots per entity (or global pool)
- Status pass: dedicated pipeline stage that processes all active effects
- Timer decrement: each tick reduces turns_remaining by 1; zero = expired

## Performance Insight

The status pass is O(entities \u00d7 max_effects). With 16 entities and 4 slots each, that's 64 checks per tick — negligible. Each check is a simple comparison and arithmetic. No branching on type in the hot path if you use a uniform "apply magnitude to stat" pattern. Cache-friendly because effect slots are contiguous in memory.

## Memory Insight

Each effect slot is ~12 bytes (type: int, magnitude: int, turns: int). Four slots per entity = 48 bytes. For 16 entities, that's 768 bytes total — fits in L1 cache. The slots are embedded in the WorldState struct, not heap-allocated. Stack-resident, deterministic lifetime.

## Your Task

Define a \`StatusEffect\` struct with \`int type\`, \`int magnitude\`, \`int turns\`. Create a small array of effects and a \`processEffects()\` function that applies each active effect and decrements its timer. Test with a poison effect (type=1, magnitude=2, turns=3) applied to an entity with 20 HP.

Expected output:
\`\`\`
STATUS|entity=0|type=1|dmg=2|hp=18|turns_left=2
STATUS|entity=0|type=1|dmg=2|hp=16|turns_left=1
STATUS|entity=0|type=1|dmg=2|hp=14|turns_left=0
STATUS|entity=0|expired|type=1
\`\`\`

## Beginner Trap

**Processing expired effects.** If you decrement the timer BEFORE applying the effect, a 3-turn poison only ticks twice (turns 2, 1 — skips turn 3). Apply first, then decrement. Or decrement after and check for expiry separately. The order matters: apply \u2192 decrement \u2192 check expiry.

## Elite Insight

Diablo 2's poison damage uses a frame-based accumulator — poison is applied in small increments over N frames, not as a single DoT tick. Baldur's Gate uses round-based status effects with explicit save throws. Your turn-based timer is the simplest correct implementation. Production RPGs extend this with stacking rules, immunity checks, and priority ordering — but the core is always: slot, magnitude, timer.

## Systems Thinking Connection

This tick-based processing mirrors the Robotics path's timer callbacks — both execute periodic logic at fixed intervals. The RPG processes effects per turn; the robot processes sensor updates per timer tick. Same pattern, different time scales.

## Skill Reinforcement

Lesson 37 introduced the event log for combat. Status effects are a new event source — "poison tick" events can be logged for replay. Lesson 50 (milestone) integrates effects into the full game loop.

## Mastery Check

Why must the status pass run AFTER combat resolution but BEFORE cleanup?
Answer: If status runs before combat, a buff applied this turn takes effect before the attack that triggered it resolves — wrong order. If status runs after cleanup, a poison kill won't be processed because the entity was already cleaned up. After combat, before cleanup: correct pipeline order.`,
    starterCode: `#include <iostream>
using namespace std;

const int EFFECT_NONE=0;
const int EFFECT_POISON=1;
const int MAX_EFFECTS=4;

struct StatusEffect{
    int type;
    int magnitude;
    int turns;
};

struct Entity{
    int hp;
    StatusEffect effects[MAX_EFFECTS];
    int effect_count;
};

// TODO: Write processEffects(Entity& e, int entity_id) that:
// 1. Walks all active effects (i < e.effect_count)
// 2. If type == EFFECT_POISON: subtract magnitude from hp
//    Print: STATUS|entity={id}|type={type}|dmg={mag}|hp={hp}|turns_left={turns-1}
// 3. Decrement turns
// 4. If turns reaches 0, print: STATUS|entity={id}|expired|type={type}
//    Then remove the effect by shifting remaining effects down

int main(){
    Entity e;
    e.hp=20;
    e.effect_count=1;
    e.effects[0]={EFFECT_POISON,2,3};

    for(int tick=0;tick<4;tick++){
        processEffects(e,0);
    }
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int EFFECT_NONE=0;
const int EFFECT_POISON=1;
const int MAX_EFFECTS=4;

struct StatusEffect{
    int type;
    int magnitude;
    int turns;
};

struct Entity{
    int hp;
    StatusEffect effects[MAX_EFFECTS];
    int effect_count;
};

void processEffects(Entity& e,int entity_id){
    int i=0;
    while(i<e.effect_count){
        StatusEffect& fx=e.effects[i];
        if(fx.type==EFFECT_POISON){
            e.hp-=fx.magnitude;
            fx.turns--;
            cout<<"STATUS|entity="<<entity_id<<"|type="<<fx.type<<"|dmg="<<fx.magnitude<<"|hp="<<e.hp<<"|turns_left="<<fx.turns<<endl;
            if(fx.turns<=0){
                cout<<"STATUS|entity="<<entity_id<<"|expired|type="<<fx.type<<endl;
                for(int j=i;j<e.effect_count-1;j++) e.effects[j]=e.effects[j+1];
                e.effect_count--;
                continue;
            }
        }
        i++;
    }
}

int main(){
    Entity e;
    e.hp=20;
    e.effect_count=1;
    e.effects[0]={EFFECT_POISON,2,3};

    for(int tick=0;tick<4;tick++){
        processEffects(e,0);
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "First poison tick", expectedOutput: "STATUS|entity=0|type=1|dmg=2|hp=18|turns_left=2", isPattern: false },
      { id: "t2", description: "Second poison tick", expectedOutput: "STATUS|entity=0|type=1|dmg=2|hp=16|turns_left=1", isPattern: false },
      { id: "t3", description: "Third poison tick", expectedOutput: "STATUS|entity=0|type=1|dmg=2|hp=14|turns_left=0", isPattern: false },
      { id: "t4", description: "Effect expires", expectedOutput: "STATUS|entity=0|expired|type=1", isPattern: false },
    ],
    hints: [
      "Use a while loop instead of for — when you remove an effect by shifting, don't increment i.",
      "Apply the effect (subtract magnitude from hp), then decrement turns, then check if turns <= 0 for expiry.",
      "To remove: shift effects[j] = effects[j+1] for j from i to effect_count-2, then decrement effect_count."
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Poison in the Dungeon",
    type: "game_builder",
    instructions: `# Poison in the Dungeon

## Mental Model

Integrating status effects into the dungeon RPG means adding effect slots to WorldState, a status processing pass in game_tick, and a way to apply effects. For v0, enemy type G (guards, damage_id=2) inflict poison on adjacency — touching a guard poisons the player for 2 damage over 3 turns. The status pass runs after combat, before AI movement.

## What Breaks Without This

Without status effects in the game loop, enemies can only deal instant damage. There's no lingering threat. The player can trade blows with impunity — take a hit, heal, repeat. Poison adds consequence: even after you walk away from a guard, you're still taking damage. Tactical depth from a simple timer.

## The Fix: Status Effects in WorldState

Add a fixed-size effect array to WorldState (player only for v0 — entity 0). Add a status processing pass in game_tick after the combat block. When the player is adjacent to a guard (damage_id==2), apply poison if no poison is already active. Process effects each turn: apply damage, decrement timer, expire.

The pipeline becomes: input \u2192 move \u2192 use item \u2192 combat \u2192 **status pass** \u2192 AI \u2192 render.

## Key Concepts
- Player effect slots: fixed-size array in WorldState
- Apply-on-adjacency: guards inflict poison when player is adjacent
- Status pass in game_tick: process all active effects each turn
- Duplicate prevention: don't stack the same effect type

## Performance Insight

The status pass adds MAX_EFFECTS iterations per tick (4 checks). The adjacency check for poison application is already part of the entity loop. Total overhead: ~20 instructions per tick. Invisible at this scale.

## Memory Insight

Four StatusEffect slots at 12 bytes each = 48 bytes added to WorldState. Total WorldState size barely changes. All stack-resident. No heap. Gate A compliant.

## Your Task

Add \`StatusEffect\` struct, \`MAX_EFFECTS=4\`, and player effect slots to WorldState. Add a status processing pass in game_tick. Guards (damage_id==2) apply poison (mag=2, turns=3) to the player on adjacency. Print status ticks and display effect count in HUD.

## Beginner Trap

**Stacking identical effects infinitely.** If the player stands next to a guard for 5 turns, they'd get 5 poison effects running simultaneously — 10 damage per turn. Check if the effect type already exists before applying. One poison at a time for v0.

## Elite Insight

Dark Souls handles status effects (poison, bleed, frostbite) with buildup meters — exposure accumulates until a threshold triggers the effect. Your boolean "has poison" is simpler but architecturally sound. The production version adds a buildup counter before effect activation. Nethack's poison system similarly uses a simple timer with no stacking — proven design since 1987.

## Systems Thinking Connection

This effect processing pass parallels the Space Shooter's particle lifetime system — both use countdown timers on fixed-size arrays, expiring entries when timers hit zero. Same data pattern, different visual result.

## Skill Reinforcement

Lesson 43 introduced consumables (item use as command). Status effects are the inverse — effects applied TO the player by the world. Lesson 50 integrates both into the midgame loop.

## Mastery Check

Why is it important that the status pass runs in a fixed position in the tick pipeline?
Answer: If the status pass moves around (sometimes before combat, sometimes after), the order of HP changes becomes non-deterministic from the player's perspective. Fixed pipeline position = predictable behavior = replayable state.`,
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

// TODO: Add StatusEffect player_effects[MAX_EFFECTS] and int player_effect_count to WorldState

// TODO: Write applyEffect(WorldState& w, int type, int magnitude, int turns)
// Check for duplicate type before adding

// TODO: Write processStatus(WorldState& w) that processes all player effects
// Print STATUS lines, decrement timers, expire effects

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
    int entity_count;int turn;
    Tile grid[H][W];RNG rng;unsigned int seed;
    int inventory[INV_SIZE];int inv_count;
    CombatEvent event_log[MAX_EVENTS];int event_count;
    int weapon_id;int armor_id;
    int gold;int mode;
    // TODO: Add player_effects and player_effect_count here
};

bool tryBuyItem(WorldState& w, int item_id){
    if(item_id<0||item_id>=ITEM_COUNT) return false;
    if(w.gold<ITEM_TABLE[item_id].value) return false;
    if(w.inv_count>=INV_SIZE) return false;
    w.gold-=ITEM_TABLE[item_id].value;
    w.inventory[w.inv_count++]=item_id;
    return true;
}

const char ROOM_DATA[]=
    "##########""#@.......#""#........#""#........#""#........#"
    "#........#""#........#""#.G......#""#........#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;rng_seed(w.rng,seed);
    w.entity_count=0;w.weapon_id=ITEM_NONE;w.armor_id=ITEM_NONE;
    w.gold=50;w.mode=MODE_PLAYING;
    for(int i=0;i<INV_SIZE;i++) w.inventory[i]=ITEM_NONE;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=30;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=0;
            w.grid[y][x]='.';w.inventory[0]=0;w.inv_count=1;w.weapon_id=0;
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=10;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;w.grid[y][x]='.';
        }else if(c=='G'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=15;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=2;w.grid[y][x]='.';
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
        if(cmd.attack){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
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
        // TODO: Check adjacency to guards (damage_id==2) — apply poison if not already active
        // TODO: Call processStatus(w) here — after combat, before AI
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
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
    // TODO: Print HUD_FX|{count} active for player effect count
}

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++)
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk down toward guard, stand adjacent for 3 turns to get poisoned
    char inputs[]={'s','s','s','s','s','s','d','d'};
    for(int i=0;i<8;i++){
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
    "##########""#@.......#""#........#""#........#""#........#"
    "#........#""#........#""#.G......#""#........#""##########";

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
        }else if(c=='E'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=10;w.alive[id]=true;w.behavior_id[id]=BH_CHASE_X;w.damage_id[id]=1;w.grid[y][x]='.';
        }else if(c=='G'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;
            w.hp[id]=15;w.alive[id]=true;w.behavior_id[id]=BH_IDLE;w.damage_id[id]=2;w.grid[y][x]='.';
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
        if(cmd.attack){
            for(int i=1;i<w.entity_count;i++){
                if(!w.alive[i]) continue;
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
            if(w.damage_id[i]==2){
                int dist=abs(w.pos_x[0]-w.pos_x[i])+abs(w.pos_y[0]-w.pos_y[i]);
                if(dist<=1) applyEffect(w,EFFECT_POISON,2,3);
            }
        }
        processStatus(w);
        for(int i=1;i<w.entity_count;i++){
            if(!w.alive[i]) continue;
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

void renderShop(const WorldState& w){
    cout<<"SHOP_HEADER|gold="<<w.gold<<endl;
    for(int i=0;i<ITEM_COUNT;i++)
        cout<<"SHOP_LIST|"<<i<<"|"<<ITEM_TABLE[i].name<<"|cost="<<ITEM_TABLE[i].value<<endl;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    // Walk down toward guard, stand adjacent for 3 turns to get poisoned
    char inputs[]={'s','s','s','s','s','s','d','d'};
    for(int i=0;i<8;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
    }
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|room=10x10|entities=2", isPattern: false },
      { id: "g2", description: "Poison applied on adjacency", expectedOutput: "EFFECT_APPLY|type=1|mag=2|turns=3", isPattern: false },
      { id: "g3", description: "Poison ticks damage", expectedOutput: "STATUS|poison|dmg=2|hp=", isPattern: true },
      { id: "g4", description: "Poison expires after 3 turns", expectedOutput: "STATUS|expired|type=1", isPattern: false },
      { id: "g5", description: "HUD shows effect count", expectedOutput: "HUD_FX|", isPattern: true },
      { id: "g6", description: "HP reduced by poison", expectedOutput: "HUD|hp=", isPattern: true },
    ],
    hints: [
      "Add StatusEffect player_effects[MAX_EFFECTS] and int player_effect_count to WorldState. Initialize to 0 in loadRoom.",
      "In applyEffect, loop through existing effects to check for duplicate type. If found, return without adding. Otherwise add at player_effect_count++.",
      "In processStatus, use a while loop. Apply damage, decrement turns, check for expiry. On expiry, shift remaining effects down and decrement count without incrementing i."
    ],
    estimatedMinutes: 15,
  },
};
