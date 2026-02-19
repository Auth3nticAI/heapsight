import { Lesson } from "@/types/lesson";

export const lessonRPG50: Lesson = {
  id: "rpg-50-milestone-midgame-slice",
  title: "Milestone: Midgame Slice",
  description: "A 10-minute run is possible: explore, fight, loot, shop, survive poison, and manage inventory — all systems integrated into one playable slice.",
  order: 50,
  xpReward: 300,
  tier: "pro",
  concepts: ["system integration", "content depth proof", "progression loop", "midgame slice", "deterministic gameplay"],
  part1: {
    title: "Concept: Integration as Architecture Test",
    type: "concept",
    instructions: `# Milestone: Midgame Slice

## Mental Model

A midgame slice is the proof that your systems compose. Individually, your combat, inventory, shop, loot, and status effect systems all work. But do they work TOGETHER? Does buying armor affect combat damage? Does poison interact correctly with healing? Does loot from a kill actually show up in the shop's inventory view? Integration is where architecture either shines or crumbles.

## What Breaks Without This

Without integration testing, systems develop in isolation and accumulate hidden assumptions. The shop assumes inventory is never full. Combat assumes the player always has a weapon. Poison assumes HP can't go below zero. When these systems finally interact, edge cases explode: buy 5 items, loot drops silently fail. Use a potion while poisoned — does the heal apply before or after the poison tick? Without a milestone that forces all systems to run together, these bugs hide until a player finds them.

## The Fix: The Midgame Slice

Run a scripted sequence that exercises every system:
1. **Movement** — walk through the room
2. **Combat** — fight an enemy, kill it
3. **Loot** — receive a drop from the loot table
4. **Gold** — collect gold from the kill
5. **Shop** — open shop, buy an item, close shop
6. **Consumable** — use a potion to heal
7. **Status Effect** — get poisoned by a guard, survive the ticks
8. **Inventory** — verify item counts after all transactions

This isn't a new feature. It's a verification that everything you've built works as a unified system. The output should tell a complete story: a player enters a room, fights, loots, shops, gets poisoned, heals, and survives.

## Key Concepts
- Integration test: all systems exercised in one run
- Pipeline order verification: combat \u2192 loot \u2192 status \u2192 AI \u2192 render
- Edge case coverage: full inventory, zero gold, poison + heal interaction
- Deterministic verification: same seed = same entire run

## Performance Insight

The midgame slice runs all systems every tick. If there were a performance problem, this is where it would surface. With 3 entities, 5 inventory slots, 4 effect slots, and the full tick pipeline, we're processing ~200 operations per tick. On modern hardware, this completes in microseconds. The architecture scales — adding more entities and effects won't change the algorithmic complexity.

## Memory Insight

Total WorldState size: ~1.2KB. All stack-resident. The midgame slice proves that zero heap allocation is needed for a complete gameplay loop. This is Gate A compliance demonstrated through gameplay, not just a counter check. The entire game state fits in L1 cache.

## Your Task

Trace through a multi-system scenario: the player starts with an Iron Sword, fights an enemy (E), receives a loot drop, collects gold, opens the shop, buys a Potion, uses the Potion, walks near a guard (G), gets poisoned, then moves away and survives the poison ticks. Verify the complete output sequence.

Expected output should demonstrate all systems working together in the correct pipeline order.

## Beginner Trap

**Assuming systems are independent.** The most common integration bug is order-dependent: "I bought a Potion but \`use_item\` doesn't find it because the shop add happens after the item scan." In your pipeline, buy happens in SHOPPING mode, use happens in PLAYING mode — they can't conflict. But if you ever refactor to allow buying and using in the same turn, the order matters. Integration milestones catch these assumptions before they become bugs.

## Elite Insight

Nintendo's milestone playtests are legendary. Before Breath of the Wild shipped, every system (cooking, combat, climbing, weather, physics) had to work in a "10-minute slice" that exercised all mechanics. If any system broke the others, it went back to engineering. Your midgame slice is the same discipline: prove it works together before adding more.

## Systems Thinking Connection

This integration milestone mirrors the Robotics path's Gate A (Sim Teleop) — both require all subsystems to run simultaneously and produce correct output. The robot must move, sense, and publish TF in one launch. Your RPG must fight, loot, shop, and poison in one run.

## Skill Reinforcement

This milestone integrates Lessons 41-49: item tables (41), equipment (42), consumables (43), gold economy (44), shop (46-47), loot tables (48), and status effects (49). Phase 6 builds on this foundation with quests and narrative.

## Mastery Check

If you replay this exact input sequence with the same seed, will the output be identical? What could cause it to differ?
Answer: Yes, identical — all randomness flows from the seeded RNG, and the tick pipeline has fixed ordering. The only thing that could cause divergence is an uninitialized variable, a different iteration order, or an external random source (std::rand). All three are eliminated by our architecture.`,
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

// TODO: Create a room with both E and G enemies
// TODO: Write a main() that exercises ALL systems:
//   1. Move toward enemy E, attack and kill it (combat + loot + gold)
//   2. Open shop, buy Potion, close shop (shop system)
//   3. Use Potion (consumable system)
//   4. Walk near guard G (status effect system)
//   5. Move away, survive poison ticks
// TODO: Verify HUD shows correct state after each action

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
    // TODO: Design a multi-system test sequence:
    // Load room with E at (5,3) and G at (2,7)
    // 1. Walk right toward E, attack to kill
    // 2. Open shop, buy Potion, close shop
    // 3. Use Potion
    // 4. Walk down near G to trigger poison
    // 5. Walk away, let poison tick
    // Print renderHUD after each playing turn, renderShop after each shopping turn
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
    "##########""#@...E...#""#........#""#........#""#........#"
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
    // Midgame slice: fight, loot, shop, heal, poison, survive
    // E is at (5,1), player at (1,1). Walk right to get adjacent, attack twice.
    // Then shop for potion. Use potion. Walk down to guard. Survive poison.
    char inputs[]={
        'd','d','d','f','f',
        'b','5','q',
        'u',
        's','s','s','s','s',
        'd','d','d'
    };
    int n=18;
    for(int i=0;i<n;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
        else if(w.mode==MODE_SHOPPING) renderShop(w);
    }
    cout<<"MILESTONE|midgame_slice|complete|turn="<<w.turn<<"|hp="<<w.hp[0]<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads with all entities", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g2", description: "Combat system works", expectedOutput: "COMBAT|src=0|target=1|dmg=", isPattern: true },
      { id: "g3", description: "Enemy killed and looted", expectedOutput: "KILL|id=1", isPattern: false },
      { id: "g4", description: "Shop system works", expectedOutput: "SHOP|open", isPattern: false },
      { id: "g5", description: "Buy transaction completes", expectedOutput: "BUY|Potion|cost=5|", isPattern: true },
      { id: "g6", description: "Potion used for healing", expectedOutput: "USE|Potion|heal=10|hp=", isPattern: true },
      { id: "g7", description: "Poison applied from guard", expectedOutput: "EFFECT_APPLY|type=1|mag=2|turns=3", isPattern: false },
      { id: "g8", description: "Poison ticks damage", expectedOutput: "STATUS|poison|dmg=2|hp=", isPattern: true },
      { id: "g9", description: "Poison expires", expectedOutput: "STATUS|expired|type=1", isPattern: false },
      { id: "g10", description: "Milestone complete", expectedOutput: "MILESTONE|midgame_slice|complete|", isPattern: true },
    ],
    hints: [
      "Design the input sequence to exercise each system: movement (d/s/w/a), combat (f), shop (b, 1-5, q), item use (u), and adjacency to trigger poison.",
      "The E enemy at (5,1) is 4 tiles right of player at (1,1). Walk 3 right, then attack twice (8 dmg each = 16 > 10 HP). The enemy chases toward you too.",
      "After killing E, open shop (b), buy Potion (5), close shop (q). Use potion (u). Walk south to guard at (2,7). Poison triggers on adjacency. Walk away and let 3 poison ticks expire."
    ],
    estimatedMinutes: 20,
  },
  part2: {
    title: "Build: Extended Midgame Run",
    type: "game_builder",
    instructions: `# Build: Extended Midgame Run

## Mental Model

The midgame slice is not just a demo — it is an integration test. Every system touches other systems through WorldState. Part 1 proved the individual systems compose. Now you must prove they compose under pressure: can your engine handle a 16-turn run that exercises combat, loot, shopping, item use, and poison in a single deterministic sequence? The output must tell a complete story — fight, trade, heal, survive.

## What Breaks Without This

Integration bugs hide in the seams between systems. The shop assumes gold was initialized. Loot assumes inventory has space. Poison assumes HP was not already reduced by combat. A 16-turn run exposes these assumptions because every system reads state that was modified by a previous system in the same tick or a recent tick.

## The Fix: Scripted Integration Sequence

Design a fixed input sequence that exercises all systems in order:
1. **Walk** toward the enemy to get adjacent
2. **Attack** twice to kill (8 dmg per hit > 10 HP enemy)
3. **Open shop**, buy a Potion, close shop
4. **Use Potion** to heal (verifies consumable system after combat)
5. **Walk** toward the guard to trigger poison
6. **Survive** 3 poison ticks while moving away
7. **Print** milestone verification at the end

Each step depends on the previous one. Gold from the kill funds the Potion. The Potion restores HP before poison drains it. The deterministic seed ensures the same loot and gold every run.

## Key Concepts
- Scripted input sequence: fixed array of chars driving the game loop
- System ordering: combat → loot → gold → shop → item use → poison → survival
- Deterministic output: same seed → same gold bonus → same loot drop → same HP at end
- Milestone verification: final print confirms all systems ran correctly

## Performance Insight

16 turns × full tick pipeline = ~3200 operations total. Each tick processes movement, combat checks (16 entities max), status effects (4 slots), and AI (16 entities). Total CPU time: < 50 microseconds on modern hardware. The architecture scales linearly — doubling entities doubles tick time, not squares it.

## Memory Insight

WorldState is ~1.2KB total: entity arrays (16 × 5 arrays × 4 bytes = 320B), grid (100B), inventory (20B), event log (64 × 20B = 1280B), effects (48B). All stack-resident. The midgame run proves zero heap allocation suffices for a complete gameplay loop.

## Your Task

Write a main() that runs the full integration sequence using the existing game engine: walk to E, kill E, shop for Potion, use Potion, walk to G for poison, survive. Print renderHUD after each playing turn and renderShop after each shopping turn. Print a MILESTONE line at the end.

Expected output should include:
- LOAD|room=10x10|entities=3
- COMBAT, KILL, and LOOT lines from fighting E
- BUY line from purchasing Potion
- USE line from consuming Potion
- EFFECT_APPLY when adjacent to G
- STATUS poison ticks
- STATUS expired
- MILESTONE|extended_run|complete

## Beginner Trap

**Forgetting to render the shop when in SHOPPING mode.** The game_tick returns early when opening the shop, so renderHUD won't be called. You need a conditional: if playing, renderHUD. If shopping, renderShop. Missing this means shop state is invisible in the output.

## Elite Insight

Dwarf Fortress runs world generation as a massive integration test — every simulation system (geology, weather, civilization, trade) runs for 1000 years in fast-forward. If any system produces invalid state, the generator rejects the world. Your 16-turn midgame slice is the same discipline: if any system produces unexpected output, the test fails. Integration testing through gameplay.

## Mastery Check

If you change the RNG seed from 42 to 99, will the gold and loot drops change? Will the combat damage change?
Answer: Gold bonus and loot drops will change (they use rng_next). Combat damage will NOT change — it is deterministic from the damage table and weapon stat, with no randomness. Only systems that call rng_next are affected by seed changes.`,
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
    "##########""#@...E...#""#........#""#........#""#........#"
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
    // TODO: Design input sequence to exercise ALL systems:
    // 1. Walk right toward E (d,d) to get adjacent
    // 2. Attack twice (f,f) to kill E (8 dmg x 2 > 10 HP)
    // 3. Open shop (b), buy Potion (5), close shop (q)
    // 4. Use Potion (u) to test heal + HP cap
    // 5. Walk south toward G (s x 6) to trigger poison
    // 6. Walk away (w) to let poison tick and expire
    // Print renderHUD after playing turns, renderShop after shopping turns
    // Print MILESTONE|extended_run|complete|turn=...|hp=... at end
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
    "##########""#@...E...#""#........#""#........#""#........#"
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
    char inputs[]={'d','d','f','f','b','5','q','u','s','s','s','s','s','s','s','w'};
    int n=16;
    for(int i=0;i<n;i++){
        Command cmd=captureInput(inputs[i]);
        game_tick(w,cmd);
        if(w.mode==MODE_PLAYING) renderHUD(w);
        else if(w.mode==MODE_SHOPPING) renderShop(w);
    }
    cout<<"MILESTONE|extended_run|complete|turn="<<w.turn<<"|hp="<<w.hp[0]<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads with all entities", expectedOutput: "LOAD|room=10x10|entities=3", isPattern: false },
      { id: "g2", description: "Combat system engages", expectedOutput: "COMBAT|src=0|target=1|dmg=", isPattern: true },
      { id: "g3", description: "Enemy killed", expectedOutput: "KILL|id=1", isPattern: false },
      { id: "g4", description: "Potion purchased", expectedOutput: "BUY|Potion|cost=5|", isPattern: true },
      { id: "g5", description: "Potion consumed", expectedOutput: "USE|Potion|heal=10|hp=", isPattern: true },
      { id: "g6", description: "Poison applied from guard", expectedOutput: "EFFECT_APPLY|type=1|mag=2|turns=3", isPattern: false },
      { id: "g7", description: "Poison ticks", expectedOutput: "STATUS|poison|dmg=2|hp=", isPattern: true },
      { id: "g8", description: "Poison expires", expectedOutput: "STATUS|expired|type=1", isPattern: false },
      { id: "g9", description: "Milestone complete", expectedOutput: "MILESTONE|extended_run|complete|", isPattern: true },
    ],
    hints: [
      "Design the input array to drive all systems: d for movement, f for attack, b/5/q for shop cycle, u for item use. Walk south to approach the guard.",
      "E starts at (5,1) with BH_CHASE_X — it moves toward you each turn. Two d moves get you adjacent, two f attacks kill it (8 dmg x 2 = 16 > 10 HP).",
      "After killing E, open shop (b), buy Potion with key 5 (item index 4), close (q), use (u). Then walk south 6-7 times to reach guard adjacency. Poison triggers automatically."
    ],
    estimatedMinutes: 20,
  },
};
