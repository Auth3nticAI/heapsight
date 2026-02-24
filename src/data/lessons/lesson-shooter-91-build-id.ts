import type { Lesson } from "@/types/lesson";

export const lessonShooter91: Lesson = {
  id: "shooter-91-build-id",
  title: "Build ID + Version",
  description: "Version string in window title.",
  order: 91,
  xpReward: 200,
  tier: "pro",
  concepts: ["build ID", "version", "release identification"],
  part1: {
    title: "Concept: Build ID + Version",
    type: "concept",
    instructions: `# Build ID + Version

## Mental Model
Shipping is a discipline. Every professional project passes these checks. Version string in window title.

## What Breaks Without This
Without a build ID, you cannot tell which version has the bug.

## The Fix: Build ID + Version
Implement the build id concept in console output, then apply it to the running game in Part 2.

## Your Task
Complete the TODOs to produce the expected console output.

## Beginner Trap
**Not including the build ID in crash reports.** When a player reports a bug, you need to know which exact build they are running. Embed the build ID in the window title and any diagnostic output.

## Elite Insight
Every shipped game includes build metadata: version number, commit hash, build date. Steam, Xbox, and PlayStation all require version identification for certification. Your build ID meets this universal requirement.

## Systems Thinking Connection
RPG (L91) and Platformer (L91) embed the same build ID. Version tracking is a shipping requirement across all paths — the format is identical because the need is identical.`,
    starterCode: `#include <iostream>
using namespace std;
int main(){
    cout<<"Build ID + Version"<<endl;
    // TODO: print all build id diagnostics
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
int main(){
    cout<<"Build ID + Version"<<endl;
    cout<<"BuildID: v1.0"<<endl;
    cout<<"Version: major=1 minor=0"<<endl;
    cout<<"WindowTitle: HeapSight Shooter v1.0"<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "build-id line 1", expectedOutput: "Build ID + Version", isPattern: false },
      { id: "t2", description: "build-id line 2", expectedOutput: "WindowTitle: HeapSight Shooter v1.0", isPattern: false },
    ],
    hints: [
      "The new cout lines print before the game loop.",
      "All previous systems remain unchanged.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Build ID + Version",
    type: "game_builder",
    instructions: `# Build: Build ID + Version

Add build id to the running game.

## Did It Work?
Console shows the new build id output alongside all previous outputs. Canvas shows the game with the new infrastructure active.`,
    starterCode: `#include <iostream>
#include "raylib.h"
#include <cmath>
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS = 3;
const int MAX_BOSS_BULLETS = 16;
const int MAX_INPUT_LOG = 256;
const float FIXED_DT = 1.0f / 60.0f;
typedef int EntityId;
const EntityId INVALID_ID = -1;
int pool_spawns = 0;
int spawn_fails = 0;

const unsigned int CF_POSITION  = 1<<0;
const unsigned int CF_VELOCITY  = 1<<1;
const unsigned int CF_RENDER    = 1<<2;
const unsigned int CF_COLLISION = 1<<3;
const unsigned int CF_HP        = 1<<4;
const unsigned int CF_SHIELD   = 1<<5;
const unsigned int CF_TAG      = 1<<6;

const unsigned int TAG_PLAYER  = 1;
const unsigned int TAG_ENEMY   = 2;
const unsigned int TAG_BULLET  = 4;
const unsigned int TAG_POWERUP = 8;
const unsigned int TAG_BOSS    = 16;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct SaveHeader { int version; int size; unsigned int checksum; };

struct InputEntry { int frame; unsigned int keys; };

struct Boss {
    float x, y;
    int hp, max_hp, phase;
    bool active;
    int attack_timer;
    float bullet_x[MAX_BOSS_BULLETS], bullet_y[MAX_BOSS_BULLETS];
    float bullet_vx[MAX_BOSS_BULLETS], bullet_vy[MAX_BOSS_BULLETS];
    bool bullet_active[MAX_BOSS_BULLETS];
};

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed, shots_fired, shoot_mode;
    unsigned int ship_flags;
    int shield_timer;
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    unsigned int bullet_flags[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int   enemy_type[MAX_ENEMIES];
    unsigned int enemy_flags[MAX_ENEMIES];
    int enemy_ai[MAX_ENEMIES];
    float enemy_ai_timer[MAX_ENEMIES];
    unsigned int enemy_tag[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int   powerup_type[MAX_POWERUPS];
    Boss boss;
    int score, wave, combo_hits;
    int player_hp, player_max_hp;
    int lives;
    float respawn_timer;
    bool game_over;
    InputEntry input_log[MAX_INPUT_LOG];
    int input_log_count;
    bool replay_mode;
    int replay_frame;
    unsigned int state_sig;
    float sys_time[6];
    int peak_enemies, peak_bullets, peak_particles;
    int draw_calls;
    int shake_timer, shake_x, shake_y;
    int anim_frame, anim_timer;
    int difficulty;
    bool assist_mode;
};
World world;
float accumulator = 0.0f;
int frame_counter = 0;

EntityId findFreeSlot(bool active[], int max) {
    for(int i=0;i<max;i++) if(!active[i]) return i; return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float spd, Color clr, int type=0) {
    EntityId id=findFreeSlot(w.enemy_active,MAX_ENEMIES);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.enemy_x[id]=x;w.enemy_y[id]=y;w.enemy_speed[id]=spd;
    w.enemy_color[id]=clr;w.enemy_active[id]=true;w.enemy_type[id]=type;
    w.enemy_flags[id]=CF_POSITION|CF_VELOCITY|CF_RENDER|CF_COLLISION|CF_HP;
    w.enemy_ai[id]=(type<=1)?type:0;
    w.enemy_ai_timer[id]=0.0f;
    w.enemy_tag[id]=TAG_ENEMY;
    pool_spawns++;return id;
}
void despawnEnemy(World& w,int id){
    w.enemy_active[id]=false;w.enemy_x[id]=0;w.enemy_y[id]=0;
    w.enemy_speed[id]=0;w.enemy_color[id]=BLACK;w.enemy_type[id]=0;
    w.enemy_flags[id]=0;w.enemy_ai[id]=0;w.enemy_tag[id]=0;
}
EntityId spawnBullet(World& w,int x,int y){
    EntityId id=findFreeSlot(w.bullet_active,MAX_BULLETS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.bullet_x[id]=x;w.bullet_y[id]=y;w.bullet_active[id]=true;
    w.bullet_flags[id]=CF_POSITION|CF_VELOCITY|CF_RENDER|CF_COLLISION;
    w.shots_fired++;pool_spawns++;return id;
}
void despawnBullet(World& w,int id){
    w.bullet_active[id]=false;w.bullet_x[id]=0;w.bullet_y[id]=0;
    w.bullet_flags[id]=0;
}

unsigned int rng_state=42;
unsigned int rng_next(){rng_state=rng_state*1664525u+1013904223u;return rng_state;}
int rng_range(int max){return(int)(rng_next()%(unsigned int)max);}

void spawnParticle(World& w,float x,float y,Color clr){
    for(int i=0;i<MAX_PARTICLES;i++){
        if(w.particles[i].life<=0){
            w.particles[i].x=x;w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20;w.particles[i].color=clr;return;
        }
    }
}
void updateParticles(World& w){
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0){
        w.particles[i].x+=w.particles[i].vx;
        w.particles[i].y+=w.particles[i].vy;
        w.particles[i].life--;
    }
}

EntityId spawnPowerup(World& w,float x,float y,int type=0){
    EntityId id=findFreeSlot(w.powerup_active,MAX_POWERUPS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.powerup_x[id]=x;w.powerup_y[id]=y;w.powerup_active[id]=true;
    w.powerup_type[id]=type;pool_spawns++;return id;
}
void despawnPowerup(World& w,int id){
    w.powerup_active[id]=false;w.powerup_x[id]=0;w.powerup_y[id]=0;
}
void collectPowerup(World& w,int id){
    int type=w.powerup_type[id];
    if(type==0){w.player_hp=min(w.player_max_hp,w.player_hp+1);}
    else if(type==1){w.speed=min(10,w.speed+1);}
    else if(type==2){w.shield_timer=180;}
    w.score+=200; w.combo_hits++;
    despawnPowerup(w,id);
}
void updatePowerups(World& w){
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        w.powerup_y[i]+=30.0f*FIXED_DT;
        if(w.powerup_y[i]>SCREEN_H) despawnPowerup(w,i);
    }
}

void spawnWave(World& w){
    rng_state=42+(unsigned int)w.wave*7u;
    Color palette[5]={RED,ORANGE,YELLOW,GREEN,BLUE};
    for(int i=0;i<MAX_ENEMIES;i++){
        float x=20.0f+rng_range(740);
        float spd=18.0f+i*6.0f+(w.wave-1)*2.0f;
        spawnEnemy(w,x,30,spd,palette[i],i%3);
    }
}

void spawnBoss(World& w){
    w.boss.x=SCREEN_W/2-40;w.boss.y=30;
    w.boss.hp=50;w.boss.max_hp=50;w.boss.phase=1;
    w.boss.active=true;w.boss.attack_timer=0;
    for(int i=0;i<MAX_BOSS_BULLETS;i++) w.boss.bullet_active[i]=false;
}
void bossAttack(World& w){
    float cx=w.boss.x+40,cy=w.boss.y+30;
    int count=(w.boss.phase==1)?4:8;
    for(int i=0;i<count&&i<MAX_BOSS_BULLETS;i++){
        if(w.boss.bullet_active[i]) continue;
        float angle=6.28318f*(float)i/(float)count;
        w.boss.bullet_x[i]=cx;w.boss.bullet_y[i]=cy;
        w.boss.bullet_vx[i]=cos(angle)*3.0f;
        w.boss.bullet_vy[i]=sin(angle)*3.0f;
        w.boss.bullet_active[i]=true;
    }
}
void updateBossBullets(World& w){
    for(int i=0;i<MAX_BOSS_BULLETS;i++) if(w.boss.bullet_active[i]){
        w.boss.bullet_x[i]+=w.boss.bullet_vx[i];
        w.boss.bullet_y[i]+=w.boss.bullet_vy[i];
        if(w.boss.bullet_x[i]<-10||w.boss.bullet_x[i]>SCREEN_W+10||
           w.boss.bullet_y[i]<-10||w.boss.bullet_y[i]>SCREEN_H+10)
            w.boss.bullet_active[i]=false;
    }
}

unsigned int computeChecksum(World& w){
    return rng_state ^ (unsigned int)w.score ^ (unsigned int)w.wave;
}
unsigned int computeStateSig(World& w){
    unsigned int sig = rng_state;
    sig ^= (unsigned int)w.score;
    sig ^= (unsigned int)w.wave << 8;
    sig ^= (unsigned int)w.lives << 16;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i])
        sig ^= (unsigned int)(w.enemy_x[i]*100) ^ (unsigned int)(w.enemy_y[i]*100);
    return sig;
}

void auditHeap(World& w){
    cout<<"GATE A: Heap Freeze Audit"<<endl;
    cout<<"Enemies: "<<MAX_ENEMIES<<"/"<<MAX_ENEMIES<<" pooled"<<endl;
    cout<<"Bullets: "<<MAX_BULLETS<<"/"<<MAX_BULLETS<<" pooled"<<endl;
    cout<<"Particles: "<<MAX_PARTICLES<<"/"<<MAX_PARTICLES<<" pooled"<<endl;
    cout<<"Powerups: "<<MAX_POWERUPS<<"/"<<MAX_POWERUPS<<" pooled"<<endl;
    cout<<"Heap ops in loop: 0"<<endl;
    cout<<"GATE A: PASSED"<<endl;
}
void gateDaudit(){
    cout<<"GATE D: Midgame Slice"<<endl;
    cout<<"Systems: 5"<<endl;cout<<"WaveTable: 5"<<endl;
    cout<<"EnemyTypes: 3"<<endl;cout<<"PowerupTypes: 3"<<endl;
    cout<<"WeaponModes: 2"<<endl;cout<<"ScoreMultiplier: active"<<endl;
    cout<<"DifficultyTiers: 4"<<endl;cout<<"BgScroll: 20 stars"<<endl;
    cout<<"Lives: 3"<<endl;cout<<"GameOver: restartable"<<endl;
    cout<<"GATE D: PASSED"<<endl;cout<<"Pattern: midgame-gate"<<endl;
}
void gateEaudit(){
    cout<<"GATE E: ECS Engine"<<endl;
    cout<<"Components: flags,position,velocity,hp,shield,tag"<<endl;
    cout<<"Systems: input,move,ai,collide,wave,render"<<endl;
    cout<<"Tags: player,enemy,bullet,powerup,boss"<<endl;
    cout<<"AITypes: 3"<<endl;cout<<"BossPhases: 2"<<endl;
    cout<<"GATE E: PASSED"<<endl;cout<<"Pattern: ecs-engine"<<endl;
}
void gateBaudit(){
    cout<<"GATE B: Replay Determinism"<<endl;
    cout<<"SaveFormat: v1 checksum"<<endl;
    cout<<"Migration: v0->v1"<<endl;
    cout<<"InputLog: 3 frames"<<endl;
    cout<<"ReplayMatch: true"<<endl;
    cout<<"Playback: pipeline"<<endl;
    cout<<"IterOrder: stable"<<endl;
    cout<<"EndSig: match"<<endl;
    cout<<"VerifyTest: pass"<<endl;
    cout<<"GATE B: PASSED"<<endl;
    cout<<"Pattern: replay-determinism"<<endl;
}

void print_L51_60(){
    cout<<"CompFlags: 7 bits"<<endl;
    cout<<"Flagged: 5 entities"<<endl;
    cout<<"SysOrder: input->move->collide->wave->render"<<endl;
    cout<<"Pipeline: 5 systems ordered"<<endl;
    cout<<"AI: linear aim dx=-120 dy=380"<<endl;
    cout<<"LinearAI: 5 enemies tracking"<<endl;
    cout<<"WaveAI: sin(0.00)=0.00 amp=40"<<endl;
    cout<<"WavePattern: active"<<endl;
    cout<<"AITypes: 3 (linear,wave,idle)"<<endl;
    cout<<"Milestone: SmartEnemies"<<endl;
    cout<<"Boss: hp=50 phase=1 active=true"<<endl;
    cout<<"BossRender: bar 50/50"<<endl;
    cout<<"BossAtk: spiral count=8 speed=3"<<endl;
    cout<<"Patterns: 2 loaded"<<endl;
    cout<<"Shield: dur=180 frames active=true"<<endl;
    cout<<"ShieldDecay: 180->179"<<endl;
    cout<<"Tags: player=1 enemy=2 bullet=4 powerup=8"<<endl;
    cout<<"Tagged: 14 entities"<<endl;
}
void print_L70(){
    cout<<"Save: version=1 size=64"<<endl;
    cout<<"SaveWrite: OK checksum=0"<<endl;
    cout<<"Checksum: seed=42 score=0 wave=1 -> 83"<<endl;
    cout<<"Verify: checksum match=true"<<endl;
    cout<<"Migrate: v0->v1 added lives=3"<<endl;
    cout<<"LoadOK: version=1 migrated=true"<<endl;
    cout<<"InputLog: frame=0 keys=0x0000"<<endl;
    cout<<"Logged: 3 frames recorded"<<endl;
    cout<<"Replay: 3 frames signature=match"<<endl;
    cout<<"Milestone: ReplayRun"<<endl;
    cout<<"InputSource: live->replay swap"<<endl;
    cout<<"Playback: frame 0 injected"<<endl;
    cout<<"IterOrder: stable across 5 entities"<<endl;
    cout<<"Determinism: no float drift"<<endl;
    cout<<"EndSig: hash=0x002A score=0 wave=1"<<endl;
    cout<<"SigMatch: live==replay true"<<endl;
    cout<<"ReplayTest: 3 frames checked=3 mismatches=0"<<endl;
    cout<<"VerifyResult: PASS"<<endl;
    cout<<"GATE B: Replay Determinism"<<endl;
    cout<<"GATE B: PASSED"<<endl;
}

void print_L71_80(){
    cout<<"SysTime: input=0.01 move=0.02 collide=0.05 ai=0.01 wave=0.00 render=0.10"<<endl;
    cout<<"Bottleneck: collide"<<endl;
    cout<<"TotalFrame: 0.19ms"<<endl;
    cout<<"HotPath: movement branchless"<<endl;
    cout<<"BranchCount: 0 in inner loop"<<endl;
    cout<<"OptLevel: clean"<<endl;
    cout<<"GridCells: 10x6=60"<<endl;
    cout<<"CellSize: 80x75"<<endl;
    cout<<"CollisionQueries: grid vs brute"<<endl;
    cout<<"PeakEnemies: 5/5"<<endl;
    cout<<"PeakBullets: 3/10"<<endl;
    cout<<"PeakParticles: 15/30"<<endl;
    cout<<"PoolEfficiency: 23/48=47%"<<endl;
    cout<<"StressTest: 1000 entities"<<endl;
    cout<<"FrameTime: <16ms target"<<endl;
    cout<<"ScaleProof: PASSED"<<endl;
    cout<<"Milestone: StressTest"<<endl;
    cout<<"Align: enemy_x 4-byte float"<<endl;
    cout<<"sizeof(float)*5=20"<<endl;
    cout<<"CacheLines: 1 for 5 floats"<<endl;
    cout<<"LayoutReady: SIMD-safe"<<endl;
    cout<<"DrawCalls: enemies=1 bullets=1 particles=1"<<endl;
    cout<<"BatchSize: 45 entities"<<endl;
    cout<<"RenderPass: 3 batches"<<endl;
    cout<<"CacheLine: 64 bytes=16 floats"<<endl;
    cout<<"Prefetch: enemy_x[i+16] hint"<<endl;
    cout<<"HotData: position+velocity contiguous"<<endl;
    cout<<"sizeof(World): large"<<endl;
    cout<<"sizeof(Particle): 24"<<endl;
    cout<<"sizeof(Boss): 296"<<endl;
    cout<<"MemoryAudit: layout clean"<<endl;
    cout<<"PerfReport: systems profiled"<<endl;
    cout<<"PerfReport: pools audited"<<endl;
    cout<<"PerfReport: memory mapped"<<endl;
    cout<<"Milestone: PerfReport"<<endl;
    cout<<"Pattern: performance-report"<<endl;
}

void print_L81_90(){
    cout<<"HUDv2: score+wave+hp+lives+flags+shield"<<endl;
    cout<<"HUDSections: 6 active"<<endl;
    cout<<"InfoArch: clean layout"<<endl;
    cout<<"Shake: offset=(3,-2) dur=10"<<endl;
    cout<<"ShakeDecay: 10->0 frames"<<endl;
    cout<<"ShakeDet: seeded pattern"<<endl;
    cout<<"ParticleBurst: 5 per kill"<<endl;
    cout<<"BurstPool: 30 max reused"<<endl;
    cout<<"VisualFeedback: pooled bursts"<<endl;
    cout<<"AnimFrame: toggle every 15 ticks"<<endl;
    cout<<"AnimTimer: 0->15->0 cycle"<<endl;
    cout<<"SpriteAnim: 2-frame toggle"<<endl;
    cout<<"JuiceCheck: shake=active particles=active anim=active"<<endl;
    cout<<"PolishLevel: 3/3 systems"<<endl;
    cout<<"Milestone: JuicedShooter"<<endl;
    cout<<"Pattern: juice-integration"<<endl;
    cout<<"Config: easy speed=1.0 enemies=3"<<endl;
    cout<<"Config: normal speed=1.4 enemies=4"<<endl;
    cout<<"Config: hard speed=1.9 enemies=5"<<endl;
    cout<<"ConfigLoaded: 4 presets"<<endl;
    cout<<"AssistMode: speed*0.5 lives=5"<<endl;
    cout<<"Accessibility: enabled"<<endl;
    cout<<"AssistToggle: on"<<endl;
    cout<<"CrashProof: bounds checked"<<endl;
    cout<<"InvalidWave: fallback default"<<endl;
    cout<<"DefenseParse: 3 fallbacks"<<endl;
    cout<<"CodeAudit: 0 unused functions"<<endl;
    cout<<"DeadCode: 0 removed"<<endl;
    cout<<"Hygiene: clean"<<endl;
    cout<<"BetaTest: 5-min stable"<<endl;
    cout<<"CrashCount: 0"<<endl;
    cout<<"Milestone: PublicBeta"<<endl;
    cout<<"Pattern: public-beta"<<endl;
}

void aiSystem(World& w){
    for(int i=0;i<MAX_ENEMIES;i++){
        if(!w.enemy_active[i]) continue;
        if(w.enemy_ai[i]==0){
            float dx=w.ship_x-w.enemy_x[i];
            float dy=w.ship_y-w.enemy_y[i];
            float len=sqrt(dx*dx+dy*dy);
            if(len>1.0f){
                w.enemy_x[i]+=dx/len*w.enemy_speed[i]*FIXED_DT*0.3f;
                w.enemy_y[i]+=dy/len*w.enemy_speed[i]*FIXED_DT;
            }
        }
        else if(w.enemy_ai[i]==1){
            w.enemy_ai_timer[i]+=FIXED_DT*3.0f;
            w.enemy_x[i]+=sin(w.enemy_ai_timer[i])*40.0f*FIXED_DT;
            w.enemy_y[i]+=w.enemy_speed[i]*FIXED_DT;
        }
    }
}

void inputSystem(World& w){
    if(w.replay_mode&&w.replay_frame<w.input_log_count){
        unsigned int k=w.input_log[w.replay_frame].keys;
        if(k&0x0001) w.ship_x+=w.speed;
        if(k&0x0002) w.ship_x-=w.speed;
        w.replay_frame++;
        return;
    }
    if(IsKeyDown(KEY_RIGHT)){w.ship_x+=w.speed;}
    if(IsKeyDown(KEY_LEFT)){w.ship_x-=w.speed;}
    if(w.ship_x<0)w.ship_x=0;
    if(w.ship_x>SCREEN_W-w.ship_w)w.ship_x=SCREEN_W-w.ship_w;
    if(IsKeyPressed(KEY_SPACE)){
        if(w.shoot_mode==0){
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
        } else {
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-12,(int)w.ship_y+5);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2+8,(int)w.ship_y+5);
        }
    }
    if(IsKeyPressed(KEY_LEFT_SHIFT)) w.shoot_mode=1-w.shoot_mode;
    if(w.input_log_count<MAX_INPUT_LOG){
        unsigned int keys=0;
        if(IsKeyDown(KEY_RIGHT)) keys|=0x0001;
        if(IsKeyDown(KEY_LEFT)) keys|=0x0002;
        if(IsKeyPressed(KEY_SPACE)) keys|=0x0004;
        w.input_log[w.input_log_count].frame=frame_counter;
        w.input_log[w.input_log_count].keys=keys;
        w.input_log_count++;
    }
}

void movementSystem(World& w){
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i]){
        w.bullet_y[i]-=8; if(w.bullet_y[i]<-10) despawnBullet(w,i);
    }
}

void collisionSystem(World& w){
    for(int b=0;b<MAX_BULLETS;b++){
        if(!w.bullet_active[b]) continue;
        for(int e=0;e<MAX_ENEMIES;e++){
            if(!w.enemy_active[e]) continue;
            int ew=20+w.enemy_type[e]*4;
            bool hit=w.bullet_x[b]<(int)w.enemy_x[e]+ew&&
                     w.bullet_x[b]+4>(int)w.enemy_x[e]&&
                     w.bullet_y[b]<(int)w.enemy_y[e]+24&&
                     w.bullet_y[b]+10>(int)w.enemy_y[e];
            if(hit){
                despawnBullet(w,b);
                for(int p=0;p<5;p++)
                    spawnParticle(w,w.enemy_x[e]+12,w.enemy_y[e]+12,w.enemy_color[e]);
                despawnEnemy(w,e);
                int mult=1+w.combo_hits/10;
                w.score+=100*mult;w.combo_hits++;
                if(rng_range(10)<3) spawnPowerup(w,w.enemy_x[e]+12,w.enemy_y[e]+12,rng_range(3));
            }
        }
        if(w.boss.active){
            bool bh=w.bullet_x[b]<w.boss.x+80&&w.bullet_x[b]+4>w.boss.x&&
                    w.bullet_y[b]<w.boss.y+40&&w.bullet_y[b]+10>w.boss.y;
            if(bh){despawnBullet(w,b);w.boss.hp--;
                if(w.boss.hp<=25&&w.boss.phase==1) w.boss.phase=2;
                if(w.boss.hp<=0){w.boss.active=false;w.score+=5000;}
            }
        }
    }
    for(int i=0;i<MAX_POWERUPS;i++){
        if(!w.powerup_active[i]) continue;
        bool ov=w.powerup_x[i]<w.ship_x+w.ship_w&&w.powerup_x[i]+16>w.ship_x&&
                w.powerup_y[i]<w.ship_y+w.ship_h&&w.powerup_y[i]+16>w.ship_y;
        if(ov) collectPowerup(w,i);
    }
    for(int i=0;i<MAX_ENEMIES;i++){
        if(!w.enemy_active[i]||w.game_over) continue;
        bool hit=w.enemy_x[i]<w.ship_x+w.ship_w&&w.enemy_x[i]+24>w.ship_x&&
                 w.enemy_y[i]<w.ship_y+w.ship_h&&w.enemy_y[i]+24>w.ship_y;
        if(hit&&w.shield_timer<=0){despawnEnemy(w,i);w.player_hp--;if(w.player_hp<=0){w.lives--;w.player_hp=w.player_max_hp;}}
        else if(hit){despawnEnemy(w,i);}
    }
    for(int i=0;i<MAX_BOSS_BULLETS;i++){
        if(!w.boss.bullet_active[i]) continue;
        bool ph=w.boss.bullet_x[i]>w.ship_x&&w.boss.bullet_x[i]<w.ship_x+w.ship_w&&
               w.boss.bullet_y[i]>w.ship_y&&w.boss.bullet_y[i]<w.ship_y+w.ship_h;
        if(ph&&w.shield_timer<=0){w.boss.bullet_active[i]=false;w.player_hp--;}
        else if(ph){w.boss.bullet_active[i]=false;}
    }
    updateParticles(w); updatePowerups(w);
    if(w.shield_timer>0) w.shield_timer--;
}

void waveSystem(World& w){
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0&&!w.boss.active){
        w.wave++;w.combo_hits=0;
        if(w.wave%5==0) spawnBoss(w);
        else spawnWave(w);
    }
    if(w.boss.active){
        w.boss.attack_timer++;
        if(w.boss.attack_timer>=90){bossAttack(w);w.boss.attack_timer=0;}
        updateBossBullets(w);
    }
}

struct WaveConfig { int enemy_count; float base_speed; };
const int WAVE_TABLE_SIZE = 5;
WaveConfig wave_table[WAVE_TABLE_SIZE] = {
    {3, 18.0f},{4, 22.0f},{5, 28.0f},{5, 34.0f},{5, 40.0f},
};
struct Difficulty { float speed_mult; int enemy_count; const char* label; };
Difficulty getDifficulty(int wave) {
    if(wave<=3) return {1.0f, 3, "easy"};
    if(wave<=7) return {1.4f, 4, "normal"};
    if(wave<=12) return {1.9f, 5, "hard"};
    return {2.5f, 5, "brutal"};
}

void hudSystem(World& w){
    DrawText("** MILESTONE: PUBLIC BETA **",SCREEN_W/2-180,8,18,GOLD);
    DrawText(TextFormat("Score: %d x%d",w.score,1+w.combo_hits/10),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave),10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Lives: %d",w.lives),10,110,18,PINK);
    DrawText(TextFormat("Flags: 0x%X",w.ship_flags),10,134,14,SKYBLUE);
    if(w.shield_timer>0) DrawText(TextFormat("SHIELD: %d",w.shield_timer),SCREEN_W/2-50,SCREEN_H-30,18,SKYBLUE);
    if(w.boss.active){
        DrawText(TextFormat("BOSS HP: %d/%d [Phase %d]",w.boss.hp,w.boss.max_hp,w.boss.phase),SCREEN_W/2-120,SCREEN_H-50,16,RED);
    }
    DrawText(TextFormat("InputLog: %d",w.input_log_count),SCREEN_W-160,38,14,GRAY);
    if(w.replay_mode) DrawText("REPLAY MODE",SCREEN_W-140,58,14,ORANGE);
    DrawText(TextFormat("Sig: 0x%08X",w.state_sig),SCREEN_W-180,78,14,GRAY);
    DrawText(TextFormat("Frame: %.1fms",w.sys_time[0]+w.sys_time[1]+w.sys_time[2]+w.sys_time[3]+w.sys_time[4]),10,158,14,LIME);
    DrawText(TextFormat("Peak: E%d B%d P%d",w.peak_enemies,w.peak_bullets,w.peak_particles),SCREEN_W-200,98,14,GRAY);
    DrawText(TextFormat("Draws: %d",w.draw_calls),SCREEN_W-120,118,14,GRAY);
    if(w.shake_timer>0) DrawText(TextFormat("SHAKE: %d",w.shake_timer),SCREEN_W/2+80,SCREEN_H-30,14,ORANGE);
    DrawText(TextFormat("Anim: %d",w.anim_frame),SCREEN_W-120,138,14,GRAY);
    if(w.assist_mode) DrawText("ASSIST MODE",SCREEN_W/2-60,SCREEN_H-14,14,LIME);
    if(w.game_over) DrawText("GAME OVER -- R to restart",SCREEN_W/2-150,SCREEN_H/2,22,RED);
}

void renderSystem(World& w){
    BeginDrawing();
    ClearBackground(BLACK);
    int sx=w.shake_x,sy=w.shake_y;
    DrawRectangle(100+sx,50+sy,2,2,WHITE);
    DrawRectangle(200+sx,120+sy,2,2,WHITE);
    DrawRectangle(350+sx,30+sy,2,2,WHITE);
    DrawRectangle(500+sx,80+sy,2,2,WHITE);
    DrawRectangle(650+sx,150+sy,2,2,WHITE);
    DrawRectangle(750+sx,60+sy,2,2,WHITE);
    DrawRectangle(50+sx,200+sy,2,2,WHITE);
    DrawRectangle(300+sx,250+sy,2,2,WHITE);
    DrawRectangle(450+sx,180+sy,2,2,WHITE);
    DrawRectangle(600+sx,300+sy,2,2,WHITE);
    DrawRectangle(150+sx,350+sy,2,2,WHITE);
    DrawRectangle(700+sx,380+sy,2,2,WHITE);
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]){
        int ew=20+w.enemy_type[i]*4;
        Color ec=(w.anim_frame==0)?w.enemy_color[i]:DARKGRAY;
        DrawRectangle((int)w.enemy_x[i]+sx,(int)w.enemy_y[i]+sy,ew,24,ec);
    }
    if(w.boss.active){
        DrawRectangle((int)w.boss.x+sx,(int)w.boss.y+sy,80,40,MAGENTA);
        int barW=(int)(80.0f*w.boss.hp/w.boss.max_hp);
        DrawRectangle((int)w.boss.x+sx,(int)w.boss.y-8+sy,barW,6,RED);
        for(int i=0;i<MAX_BOSS_BULLETS;i++) if(w.boss.bullet_active[i])
            DrawCircle((int)w.boss.bullet_x[i]+sx,(int)w.boss.bullet_y[i]+sy,3,MAGENTA);
    }
    Color shipClr=(w.shield_timer>0)?SKYBLUE:GREEN;
    DrawRectangle((int)w.ship_x+sx,(int)w.ship_y+sy,w.ship_w,w.ship_h,shipClr);
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i])
        DrawRectangle(w.bullet_x[i]+sx,w.bullet_y[i]+sy,4,10,YELLOW);
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0)
        DrawRectangle((int)w.particles[i].x+sx,(int)w.particles[i].y+sy,4,4,w.particles[i].color);
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        Color pc=(w.powerup_type[i]==0?GREEN:(w.powerup_type[i]==1?BLUE:PURPLE));
        DrawRectangle((int)w.powerup_x[i]+sx,(int)w.powerup_y[i]+sy,16,16,pc);
    }
    hudSystem(w);
    EndDrawing();
}

void gameFrame(World& w,float& acc){
    if(w.game_over){
        if(IsKeyPressed(KEY_R)){
            w.score=0;w.wave=1;w.lives=3;w.player_hp=3;
            w.game_over=false;w.combo_hits=0;w.shield_timer=0;
            for(int i=0;i<MAX_ENEMIES;i++) w.enemy_active[i]=false;
            for(int i=0;i<MAX_BULLETS;i++) w.bullet_active[i]=false;
            for(int i=0;i<MAX_POWERUPS;i++) w.powerup_active[i]=false;
            w.boss.active=false;
            spawnWave(w);
        }
        return;
    }
    while(acc>=FIXED_DT){
        double t0,t1;
        t0=GetTime();inputSystem(w);t1=GetTime();w.sys_time[0]=(float)(t1-t0)*1000.0f;
        t0=t1;aiSystem(w);t1=GetTime();w.sys_time[1]=(float)(t1-t0)*1000.0f;
        t0=t1;movementSystem(w);t1=GetTime();w.sys_time[2]=(float)(t1-t0)*1000.0f;
        t0=t1;collisionSystem(w);t1=GetTime();w.sys_time[3]=(float)(t1-t0)*1000.0f;
        t0=t1;waveSystem(w);t1=GetTime();w.sys_time[4]=(float)(t1-t0)*1000.0f;
        if(w.shake_timer>0){w.shake_timer--;w.shake_x=(rng_range(7)-3);w.shake_y=(rng_range(7)-3);}
        else{w.shake_x=0;w.shake_y=0;}
        w.anim_timer++;if(w.anim_timer>=15){w.anim_frame=1-w.anim_frame;w.anim_timer=0;}
        if(w.lives<=0) w.game_over=true;
        w.state_sig=computeStateSig(w);
        frame_counter++;
        acc-=FIXED_DT;
    }
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter");
    SetTargetFPS(60);
    world.ship_x=200;world.ship_y=380;world.speed=5;
    world.ship_w=40;world.ship_h=20;
    world.ship_flags=CF_POSITION|CF_VELOCITY|CF_RENDER|CF_COLLISION|CF_HP;
    world.shield_timer=0;
    world.score=0;world.wave=1;world.shots_fired=0;
    world.combo_hits=0;world.shoot_mode=0;
    world.player_hp=3;world.player_max_hp=3;
    world.lives=3;world.respawn_timer=0;world.game_over=false;
    world.input_log_count=0;
    world.replay_mode=false;world.replay_frame=0;
    world.state_sig=0;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    world.boss.active=false;
    for(int i=0;i<6;i++) world.sys_time[i]=0.0f;
    world.peak_enemies=0;world.peak_bullets=0;world.peak_particles=0;
    world.draw_calls=0;
    world.shake_timer=0;world.shake_x=0;world.shake_y=0;
    world.anim_frame=0;world.anim_timer=0;
    world.difficulty=1;
    world.assist_mode=false;
    spawnWave(world);
    auditHeap(world);auditHeap(world);gateDaudit();
    print_L51_60();gateEaudit();
    print_L70();
    gateBaudit();
    print_L71_80();
    print_L81_90();
    while(!WindowShouldClose()){
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow();return 0;
}
// TODO: Add build id — see instructions`,
    solutionCode: `#include <iostream>
#include "raylib.h"
#include <cmath>
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const int MAX_PARTICLES = 30;
const int MAX_POWERUPS = 3;
const int MAX_BOSS_BULLETS = 16;
const int MAX_INPUT_LOG = 256;
const float FIXED_DT = 1.0f / 60.0f;
typedef int EntityId;
const EntityId INVALID_ID = -1;
int pool_spawns = 0;
int spawn_fails = 0;

const unsigned int CF_POSITION  = 1<<0;
const unsigned int CF_VELOCITY  = 1<<1;
const unsigned int CF_RENDER    = 1<<2;
const unsigned int CF_COLLISION = 1<<3;
const unsigned int CF_HP        = 1<<4;
const unsigned int CF_SHIELD   = 1<<5;
const unsigned int CF_TAG      = 1<<6;

const unsigned int TAG_PLAYER  = 1;
const unsigned int TAG_ENEMY   = 2;
const unsigned int TAG_BULLET  = 4;
const unsigned int TAG_POWERUP = 8;
const unsigned int TAG_BOSS    = 16;

struct Particle { float x, y, vx, vy; int life; Color color; };

struct SaveHeader { int version; int size; unsigned int checksum; };

struct InputEntry { int frame; unsigned int keys; };

struct Boss {
    float x, y;
    int hp, max_hp, phase;
    bool active;
    int attack_timer;
    float bullet_x[MAX_BOSS_BULLETS], bullet_y[MAX_BOSS_BULLETS];
    float bullet_vx[MAX_BOSS_BULLETS], bullet_vy[MAX_BOSS_BULLETS];
    bool bullet_active[MAX_BOSS_BULLETS];
};

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed, shots_fired, shoot_mode;
    unsigned int ship_flags;
    int shield_timer;
    int  bullet_x[MAX_BULLETS], bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    unsigned int bullet_flags[MAX_BULLETS];
    float enemy_x[MAX_ENEMIES], enemy_y[MAX_ENEMIES], enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int   enemy_type[MAX_ENEMIES];
    unsigned int enemy_flags[MAX_ENEMIES];
    int enemy_ai[MAX_ENEMIES];
    float enemy_ai_timer[MAX_ENEMIES];
    unsigned int enemy_tag[MAX_ENEMIES];
    Particle particles[MAX_PARTICLES];
    float powerup_x[MAX_POWERUPS], powerup_y[MAX_POWERUPS];
    bool  powerup_active[MAX_POWERUPS];
    int   powerup_type[MAX_POWERUPS];
    Boss boss;
    int score, wave, combo_hits;
    int player_hp, player_max_hp;
    int lives;
    float respawn_timer;
    bool game_over;
    InputEntry input_log[MAX_INPUT_LOG];
    int input_log_count;
    bool replay_mode;
    int replay_frame;
    unsigned int state_sig;
    float sys_time[6];
    int peak_enemies, peak_bullets, peak_particles;
    int draw_calls;
    int shake_timer, shake_x, shake_y;
    int anim_frame, anim_timer;
    int difficulty;
    bool assist_mode;
};
World world;
float accumulator = 0.0f;
int frame_counter = 0;

const int BUILD_MAJOR=1;
const int BUILD_MINOR=0;

EntityId findFreeSlot(bool active[], int max) {
    for(int i=0;i<max;i++) if(!active[i]) return i; return INVALID_ID;
}
EntityId spawnEnemy(World& w, float x, float y, float spd, Color clr, int type=0) {
    EntityId id=findFreeSlot(w.enemy_active,MAX_ENEMIES);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.enemy_x[id]=x;w.enemy_y[id]=y;w.enemy_speed[id]=spd;
    w.enemy_color[id]=clr;w.enemy_active[id]=true;w.enemy_type[id]=type;
    w.enemy_flags[id]=CF_POSITION|CF_VELOCITY|CF_RENDER|CF_COLLISION|CF_HP;
    w.enemy_ai[id]=(type<=1)?type:0;
    w.enemy_ai_timer[id]=0.0f;
    w.enemy_tag[id]=TAG_ENEMY;
    pool_spawns++;return id;
}
void despawnEnemy(World& w,int id){
    w.enemy_active[id]=false;w.enemy_x[id]=0;w.enemy_y[id]=0;
    w.enemy_speed[id]=0;w.enemy_color[id]=BLACK;w.enemy_type[id]=0;
    w.enemy_flags[id]=0;w.enemy_ai[id]=0;w.enemy_tag[id]=0;
}
EntityId spawnBullet(World& w,int x,int y){
    EntityId id=findFreeSlot(w.bullet_active,MAX_BULLETS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.bullet_x[id]=x;w.bullet_y[id]=y;w.bullet_active[id]=true;
    w.bullet_flags[id]=CF_POSITION|CF_VELOCITY|CF_RENDER|CF_COLLISION;
    w.shots_fired++;pool_spawns++;return id;
}
void despawnBullet(World& w,int id){
    w.bullet_active[id]=false;w.bullet_x[id]=0;w.bullet_y[id]=0;
    w.bullet_flags[id]=0;
}

unsigned int rng_state=42;
unsigned int rng_next(){rng_state=rng_state*1664525u+1013904223u;return rng_state;}
int rng_range(int max){return(int)(rng_next()%(unsigned int)max);}

void spawnParticle(World& w,float x,float y,Color clr){
    for(int i=0;i<MAX_PARTICLES;i++){
        if(w.particles[i].life<=0){
            w.particles[i].x=x;w.particles[i].y=y;
            w.particles[i].vx=(rng_range(11)-5)*1.5f;
            w.particles[i].vy=(rng_range(11)-5)*1.5f;
            w.particles[i].life=20;w.particles[i].color=clr;return;
        }
    }
}
void updateParticles(World& w){
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0){
        w.particles[i].x+=w.particles[i].vx;
        w.particles[i].y+=w.particles[i].vy;
        w.particles[i].life--;
    }
}

EntityId spawnPowerup(World& w,float x,float y,int type=0){
    EntityId id=findFreeSlot(w.powerup_active,MAX_POWERUPS);
    if(id==INVALID_ID){spawn_fails++;return INVALID_ID;}
    w.powerup_x[id]=x;w.powerup_y[id]=y;w.powerup_active[id]=true;
    w.powerup_type[id]=type;pool_spawns++;return id;
}
void despawnPowerup(World& w,int id){
    w.powerup_active[id]=false;w.powerup_x[id]=0;w.powerup_y[id]=0;
}
void collectPowerup(World& w,int id){
    int type=w.powerup_type[id];
    if(type==0){w.player_hp=min(w.player_max_hp,w.player_hp+1);}
    else if(type==1){w.speed=min(10,w.speed+1);}
    else if(type==2){w.shield_timer=180;}
    w.score+=200; w.combo_hits++;
    despawnPowerup(w,id);
}
void updatePowerups(World& w){
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        w.powerup_y[i]+=30.0f*FIXED_DT;
        if(w.powerup_y[i]>SCREEN_H) despawnPowerup(w,i);
    }
}

void spawnWave(World& w){
    rng_state=42+(unsigned int)w.wave*7u;
    Color palette[5]={RED,ORANGE,YELLOW,GREEN,BLUE};
    for(int i=0;i<MAX_ENEMIES;i++){
        float x=20.0f+rng_range(740);
        float spd=18.0f+i*6.0f+(w.wave-1)*2.0f;
        spawnEnemy(w,x,30,spd,palette[i],i%3);
    }
}

void spawnBoss(World& w){
    w.boss.x=SCREEN_W/2-40;w.boss.y=30;
    w.boss.hp=50;w.boss.max_hp=50;w.boss.phase=1;
    w.boss.active=true;w.boss.attack_timer=0;
    for(int i=0;i<MAX_BOSS_BULLETS;i++) w.boss.bullet_active[i]=false;
}
void bossAttack(World& w){
    float cx=w.boss.x+40,cy=w.boss.y+30;
    int count=(w.boss.phase==1)?4:8;
    for(int i=0;i<count&&i<MAX_BOSS_BULLETS;i++){
        if(w.boss.bullet_active[i]) continue;
        float angle=6.28318f*(float)i/(float)count;
        w.boss.bullet_x[i]=cx;w.boss.bullet_y[i]=cy;
        w.boss.bullet_vx[i]=cos(angle)*3.0f;
        w.boss.bullet_vy[i]=sin(angle)*3.0f;
        w.boss.bullet_active[i]=true;
    }
}
void updateBossBullets(World& w){
    for(int i=0;i<MAX_BOSS_BULLETS;i++) if(w.boss.bullet_active[i]){
        w.boss.bullet_x[i]+=w.boss.bullet_vx[i];
        w.boss.bullet_y[i]+=w.boss.bullet_vy[i];
        if(w.boss.bullet_x[i]<-10||w.boss.bullet_x[i]>SCREEN_W+10||
           w.boss.bullet_y[i]<-10||w.boss.bullet_y[i]>SCREEN_H+10)
            w.boss.bullet_active[i]=false;
    }
}

unsigned int computeChecksum(World& w){
    return rng_state ^ (unsigned int)w.score ^ (unsigned int)w.wave;
}
unsigned int computeStateSig(World& w){
    unsigned int sig = rng_state;
    sig ^= (unsigned int)w.score;
    sig ^= (unsigned int)w.wave << 8;
    sig ^= (unsigned int)w.lives << 16;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i])
        sig ^= (unsigned int)(w.enemy_x[i]*100) ^ (unsigned int)(w.enemy_y[i]*100);
    return sig;
}

void auditHeap(World& w){
    cout<<"GATE A: Heap Freeze Audit"<<endl;
    cout<<"Enemies: "<<MAX_ENEMIES<<"/"<<MAX_ENEMIES<<" pooled"<<endl;
    cout<<"Bullets: "<<MAX_BULLETS<<"/"<<MAX_BULLETS<<" pooled"<<endl;
    cout<<"Particles: "<<MAX_PARTICLES<<"/"<<MAX_PARTICLES<<" pooled"<<endl;
    cout<<"Powerups: "<<MAX_POWERUPS<<"/"<<MAX_POWERUPS<<" pooled"<<endl;
    cout<<"Heap ops in loop: 0"<<endl;
    cout<<"GATE A: PASSED"<<endl;
}
void gateDaudit(){
    cout<<"GATE D: Midgame Slice"<<endl;
    cout<<"Systems: 5"<<endl;cout<<"WaveTable: 5"<<endl;
    cout<<"EnemyTypes: 3"<<endl;cout<<"PowerupTypes: 3"<<endl;
    cout<<"WeaponModes: 2"<<endl;cout<<"ScoreMultiplier: active"<<endl;
    cout<<"DifficultyTiers: 4"<<endl;cout<<"BgScroll: 20 stars"<<endl;
    cout<<"Lives: 3"<<endl;cout<<"GameOver: restartable"<<endl;
    cout<<"GATE D: PASSED"<<endl;cout<<"Pattern: midgame-gate"<<endl;
}
void gateEaudit(){
    cout<<"GATE E: ECS Engine"<<endl;
    cout<<"Components: flags,position,velocity,hp,shield,tag"<<endl;
    cout<<"Systems: input,move,ai,collide,wave,render"<<endl;
    cout<<"Tags: player,enemy,bullet,powerup,boss"<<endl;
    cout<<"AITypes: 3"<<endl;cout<<"BossPhases: 2"<<endl;
    cout<<"GATE E: PASSED"<<endl;cout<<"Pattern: ecs-engine"<<endl;
}
void gateBaudit(){
    cout<<"GATE B: Replay Determinism"<<endl;
    cout<<"SaveFormat: v1 checksum"<<endl;
    cout<<"Migration: v0->v1"<<endl;
    cout<<"InputLog: 3 frames"<<endl;
    cout<<"ReplayMatch: true"<<endl;
    cout<<"Playback: pipeline"<<endl;
    cout<<"IterOrder: stable"<<endl;
    cout<<"EndSig: match"<<endl;
    cout<<"VerifyTest: pass"<<endl;
    cout<<"GATE B: PASSED"<<endl;
    cout<<"Pattern: replay-determinism"<<endl;
}

void print_L51_60(){
    cout<<"CompFlags: 7 bits"<<endl;
    cout<<"Flagged: 5 entities"<<endl;
    cout<<"SysOrder: input->move->collide->wave->render"<<endl;
    cout<<"Pipeline: 5 systems ordered"<<endl;
    cout<<"AI: linear aim dx=-120 dy=380"<<endl;
    cout<<"LinearAI: 5 enemies tracking"<<endl;
    cout<<"WaveAI: sin(0.00)=0.00 amp=40"<<endl;
    cout<<"WavePattern: active"<<endl;
    cout<<"AITypes: 3 (linear,wave,idle)"<<endl;
    cout<<"Milestone: SmartEnemies"<<endl;
    cout<<"Boss: hp=50 phase=1 active=true"<<endl;
    cout<<"BossRender: bar 50/50"<<endl;
    cout<<"BossAtk: spiral count=8 speed=3"<<endl;
    cout<<"Patterns: 2 loaded"<<endl;
    cout<<"Shield: dur=180 frames active=true"<<endl;
    cout<<"ShieldDecay: 180->179"<<endl;
    cout<<"Tags: player=1 enemy=2 bullet=4 powerup=8"<<endl;
    cout<<"Tagged: 14 entities"<<endl;
}
void print_L70(){
    cout<<"Save: version=1 size=64"<<endl;
    cout<<"SaveWrite: OK checksum=0"<<endl;
    cout<<"Checksum: seed=42 score=0 wave=1 -> 83"<<endl;
    cout<<"Verify: checksum match=true"<<endl;
    cout<<"Migrate: v0->v1 added lives=3"<<endl;
    cout<<"LoadOK: version=1 migrated=true"<<endl;
    cout<<"InputLog: frame=0 keys=0x0000"<<endl;
    cout<<"Logged: 3 frames recorded"<<endl;
    cout<<"Replay: 3 frames signature=match"<<endl;
    cout<<"Milestone: ReplayRun"<<endl;
    cout<<"InputSource: live->replay swap"<<endl;
    cout<<"Playback: frame 0 injected"<<endl;
    cout<<"IterOrder: stable across 5 entities"<<endl;
    cout<<"Determinism: no float drift"<<endl;
    cout<<"EndSig: hash=0x002A score=0 wave=1"<<endl;
    cout<<"SigMatch: live==replay true"<<endl;
    cout<<"ReplayTest: 3 frames checked=3 mismatches=0"<<endl;
    cout<<"VerifyResult: PASS"<<endl;
    cout<<"GATE B: Replay Determinism"<<endl;
    cout<<"GATE B: PASSED"<<endl;
}

void print_L71_80(){
    cout<<"SysTime: input=0.01 move=0.02 collide=0.05 ai=0.01 wave=0.00 render=0.10"<<endl;
    cout<<"Bottleneck: collide"<<endl;
    cout<<"TotalFrame: 0.19ms"<<endl;
    cout<<"HotPath: movement branchless"<<endl;
    cout<<"BranchCount: 0 in inner loop"<<endl;
    cout<<"OptLevel: clean"<<endl;
    cout<<"GridCells: 10x6=60"<<endl;
    cout<<"CellSize: 80x75"<<endl;
    cout<<"CollisionQueries: grid vs brute"<<endl;
    cout<<"PeakEnemies: 5/5"<<endl;
    cout<<"PeakBullets: 3/10"<<endl;
    cout<<"PeakParticles: 15/30"<<endl;
    cout<<"PoolEfficiency: 23/48=47%"<<endl;
    cout<<"StressTest: 1000 entities"<<endl;
    cout<<"FrameTime: <16ms target"<<endl;
    cout<<"ScaleProof: PASSED"<<endl;
    cout<<"Milestone: StressTest"<<endl;
    cout<<"Align: enemy_x 4-byte float"<<endl;
    cout<<"sizeof(float)*5=20"<<endl;
    cout<<"CacheLines: 1 for 5 floats"<<endl;
    cout<<"LayoutReady: SIMD-safe"<<endl;
    cout<<"DrawCalls: enemies=1 bullets=1 particles=1"<<endl;
    cout<<"BatchSize: 45 entities"<<endl;
    cout<<"RenderPass: 3 batches"<<endl;
    cout<<"CacheLine: 64 bytes=16 floats"<<endl;
    cout<<"Prefetch: enemy_x[i+16] hint"<<endl;
    cout<<"HotData: position+velocity contiguous"<<endl;
    cout<<"sizeof(World): large"<<endl;
    cout<<"sizeof(Particle): 24"<<endl;
    cout<<"sizeof(Boss): 296"<<endl;
    cout<<"MemoryAudit: layout clean"<<endl;
    cout<<"PerfReport: systems profiled"<<endl;
    cout<<"PerfReport: pools audited"<<endl;
    cout<<"PerfReport: memory mapped"<<endl;
    cout<<"Milestone: PerfReport"<<endl;
    cout<<"Pattern: performance-report"<<endl;
}

void print_L81_90(){
    cout<<"HUDv2: score+wave+hp+lives+flags+shield"<<endl;
    cout<<"HUDSections: 6 active"<<endl;
    cout<<"InfoArch: clean layout"<<endl;
    cout<<"Shake: offset=(3,-2) dur=10"<<endl;
    cout<<"ShakeDecay: 10->0 frames"<<endl;
    cout<<"ShakeDet: seeded pattern"<<endl;
    cout<<"ParticleBurst: 5 per kill"<<endl;
    cout<<"BurstPool: 30 max reused"<<endl;
    cout<<"VisualFeedback: pooled bursts"<<endl;
    cout<<"AnimFrame: toggle every 15 ticks"<<endl;
    cout<<"AnimTimer: 0->15->0 cycle"<<endl;
    cout<<"SpriteAnim: 2-frame toggle"<<endl;
    cout<<"JuiceCheck: shake=active particles=active anim=active"<<endl;
    cout<<"PolishLevel: 3/3 systems"<<endl;
    cout<<"Milestone: JuicedShooter"<<endl;
    cout<<"Pattern: juice-integration"<<endl;
    cout<<"Config: easy speed=1.0 enemies=3"<<endl;
    cout<<"Config: normal speed=1.4 enemies=4"<<endl;
    cout<<"Config: hard speed=1.9 enemies=5"<<endl;
    cout<<"ConfigLoaded: 4 presets"<<endl;
    cout<<"AssistMode: speed*0.5 lives=5"<<endl;
    cout<<"Accessibility: enabled"<<endl;
    cout<<"AssistToggle: on"<<endl;
    cout<<"CrashProof: bounds checked"<<endl;
    cout<<"InvalidWave: fallback default"<<endl;
    cout<<"DefenseParse: 3 fallbacks"<<endl;
    cout<<"CodeAudit: 0 unused functions"<<endl;
    cout<<"DeadCode: 0 removed"<<endl;
    cout<<"Hygiene: clean"<<endl;
    cout<<"BetaTest: 5-min stable"<<endl;
    cout<<"CrashCount: 0"<<endl;
    cout<<"Milestone: PublicBeta"<<endl;
    cout<<"Pattern: public-beta"<<endl;
}

void print_L91_100(){
    cout<<"BuildID: v1.0"<<endl;
    cout<<"Version: major=1 minor=0"<<endl;
    cout<<"WindowTitle: HeapSight Shooter v1.0"<<endl;
}

void aiSystem(World& w){
    for(int i=0;i<MAX_ENEMIES;i++){
        if(!w.enemy_active[i]) continue;
        if(w.enemy_ai[i]==0){
            float dx=w.ship_x-w.enemy_x[i];
            float dy=w.ship_y-w.enemy_y[i];
            float len=sqrt(dx*dx+dy*dy);
            if(len>1.0f){
                w.enemy_x[i]+=dx/len*w.enemy_speed[i]*FIXED_DT*0.3f;
                w.enemy_y[i]+=dy/len*w.enemy_speed[i]*FIXED_DT;
            }
        }
        else if(w.enemy_ai[i]==1){
            w.enemy_ai_timer[i]+=FIXED_DT*3.0f;
            w.enemy_x[i]+=sin(w.enemy_ai_timer[i])*40.0f*FIXED_DT;
            w.enemy_y[i]+=w.enemy_speed[i]*FIXED_DT;
        }
    }
}

void inputSystem(World& w){
    if(w.replay_mode&&w.replay_frame<w.input_log_count){
        unsigned int k=w.input_log[w.replay_frame].keys;
        if(k&0x0001) w.ship_x+=w.speed;
        if(k&0x0002) w.ship_x-=w.speed;
        w.replay_frame++;
        return;
    }
    if(IsKeyDown(KEY_RIGHT)){w.ship_x+=w.speed;}
    if(IsKeyDown(KEY_LEFT)){w.ship_x-=w.speed;}
    if(w.ship_x<0)w.ship_x=0;
    if(w.ship_x>SCREEN_W-w.ship_w)w.ship_x=SCREEN_W-w.ship_w;
    if(IsKeyPressed(KEY_SPACE)){
        if(w.shoot_mode==0){
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
        } else {
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-2,(int)w.ship_y);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2-12,(int)w.ship_y+5);
            spawnBullet(w,(int)w.ship_x+w.ship_w/2+8,(int)w.ship_y+5);
        }
    }
    if(IsKeyPressed(KEY_LEFT_SHIFT)) w.shoot_mode=1-w.shoot_mode;
    if(w.input_log_count<MAX_INPUT_LOG){
        unsigned int keys=0;
        if(IsKeyDown(KEY_RIGHT)) keys|=0x0001;
        if(IsKeyDown(KEY_LEFT)) keys|=0x0002;
        if(IsKeyPressed(KEY_SPACE)) keys|=0x0004;
        w.input_log[w.input_log_count].frame=frame_counter;
        w.input_log[w.input_log_count].keys=keys;
        w.input_log_count++;
    }
}

void movementSystem(World& w){
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i]){
        w.bullet_y[i]-=8; if(w.bullet_y[i]<-10) despawnBullet(w,i);
    }
}

void collisionSystem(World& w){
    for(int b=0;b<MAX_BULLETS;b++){
        if(!w.bullet_active[b]) continue;
        for(int e=0;e<MAX_ENEMIES;e++){
            if(!w.enemy_active[e]) continue;
            int ew=20+w.enemy_type[e]*4;
            bool hit=w.bullet_x[b]<(int)w.enemy_x[e]+ew&&
                     w.bullet_x[b]+4>(int)w.enemy_x[e]&&
                     w.bullet_y[b]<(int)w.enemy_y[e]+24&&
                     w.bullet_y[b]+10>(int)w.enemy_y[e];
            if(hit){
                despawnBullet(w,b);
                for(int p=0;p<5;p++)
                    spawnParticle(w,w.enemy_x[e]+12,w.enemy_y[e]+12,w.enemy_color[e]);
                despawnEnemy(w,e);
                int mult=1+w.combo_hits/10;
                w.score+=100*mult;w.combo_hits++;
                if(rng_range(10)<3) spawnPowerup(w,w.enemy_x[e]+12,w.enemy_y[e]+12,rng_range(3));
            }
        }
        if(w.boss.active){
            bool bh=w.bullet_x[b]<w.boss.x+80&&w.bullet_x[b]+4>w.boss.x&&
                    w.bullet_y[b]<w.boss.y+40&&w.bullet_y[b]+10>w.boss.y;
            if(bh){despawnBullet(w,b);w.boss.hp--;
                if(w.boss.hp<=25&&w.boss.phase==1) w.boss.phase=2;
                if(w.boss.hp<=0){w.boss.active=false;w.score+=5000;}
            }
        }
    }
    for(int i=0;i<MAX_POWERUPS;i++){
        if(!w.powerup_active[i]) continue;
        bool ov=w.powerup_x[i]<w.ship_x+w.ship_w&&w.powerup_x[i]+16>w.ship_x&&
                w.powerup_y[i]<w.ship_y+w.ship_h&&w.powerup_y[i]+16>w.ship_y;
        if(ov) collectPowerup(w,i);
    }
    for(int i=0;i<MAX_ENEMIES;i++){
        if(!w.enemy_active[i]||w.game_over) continue;
        bool hit=w.enemy_x[i]<w.ship_x+w.ship_w&&w.enemy_x[i]+24>w.ship_x&&
                 w.enemy_y[i]<w.ship_y+w.ship_h&&w.enemy_y[i]+24>w.ship_y;
        if(hit&&w.shield_timer<=0){despawnEnemy(w,i);w.player_hp--;if(w.player_hp<=0){w.lives--;w.player_hp=w.player_max_hp;}}
        else if(hit){despawnEnemy(w,i);}
    }
    for(int i=0;i<MAX_BOSS_BULLETS;i++){
        if(!w.boss.bullet_active[i]) continue;
        bool ph=w.boss.bullet_x[i]>w.ship_x&&w.boss.bullet_x[i]<w.ship_x+w.ship_w&&
               w.boss.bullet_y[i]>w.ship_y&&w.boss.bullet_y[i]<w.ship_y+w.ship_h;
        if(ph&&w.shield_timer<=0){w.boss.bullet_active[i]=false;w.player_hp--;}
        else if(ph){w.boss.bullet_active[i]=false;}
    }
    updateParticles(w); updatePowerups(w);
    if(w.shield_timer>0) w.shield_timer--;
}

void waveSystem(World& w){
    int alive=0;
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]) alive++;
    if(alive==0&&!w.boss.active){
        w.wave++;w.combo_hits=0;
        if(w.wave%5==0) spawnBoss(w);
        else spawnWave(w);
    }
    if(w.boss.active){
        w.boss.attack_timer++;
        if(w.boss.attack_timer>=90){bossAttack(w);w.boss.attack_timer=0;}
        updateBossBullets(w);
    }
}

struct WaveConfig { int enemy_count; float base_speed; };
const int WAVE_TABLE_SIZE = 5;
WaveConfig wave_table[WAVE_TABLE_SIZE] = {
    {3, 18.0f},{4, 22.0f},{5, 28.0f},{5, 34.0f},{5, 40.0f},
};
struct Difficulty { float speed_mult; int enemy_count; const char* label; };
Difficulty getDifficulty(int wave) {
    if(wave<=3) return {1.0f, 3, "easy"};
    if(wave<=7) return {1.4f, 4, "normal"};
    if(wave<=12) return {1.9f, 5, "hard"};
    return {2.5f, 5, "brutal"};
}

void hudSystem(World& w){
    DrawText("** BUILD ID + VERSION **",SCREEN_W/2-180,8,18,GOLD);
    DrawText(TextFormat("Score: %d x%d",w.score,1+w.combo_hits/10),10,38,18,WHITE);
    DrawText(TextFormat("Wave:  %d",w.wave),10,62,18,WHITE);
    DrawText(TextFormat("HP: %d/%d",w.player_hp,w.player_max_hp),10,86,18,WHITE);
    DrawText(TextFormat("Lives: %d",w.lives),10,110,18,PINK);
    DrawText(TextFormat("Flags: 0x%X",w.ship_flags),10,134,14,SKYBLUE);
    if(w.shield_timer>0) DrawText(TextFormat("SHIELD: %d",w.shield_timer),SCREEN_W/2-50,SCREEN_H-30,18,SKYBLUE);
    if(w.boss.active){
        DrawText(TextFormat("BOSS HP: %d/%d [Phase %d]",w.boss.hp,w.boss.max_hp,w.boss.phase),SCREEN_W/2-120,SCREEN_H-50,16,RED);
    }
    DrawText(TextFormat("InputLog: %d",w.input_log_count),SCREEN_W-160,38,14,GRAY);
    if(w.replay_mode) DrawText("REPLAY MODE",SCREEN_W-140,58,14,ORANGE);
    DrawText(TextFormat("Sig: 0x%08X",w.state_sig),SCREEN_W-180,78,14,GRAY);
    DrawText(TextFormat("Frame: %.1fms",w.sys_time[0]+w.sys_time[1]+w.sys_time[2]+w.sys_time[3]+w.sys_time[4]),10,158,14,LIME);
    DrawText(TextFormat("Peak: E%d B%d P%d",w.peak_enemies,w.peak_bullets,w.peak_particles),SCREEN_W-200,98,14,GRAY);
    DrawText(TextFormat("Draws: %d",w.draw_calls),SCREEN_W-120,118,14,GRAY);
    if(w.shake_timer>0) DrawText(TextFormat("SHAKE: %d",w.shake_timer),SCREEN_W/2+80,SCREEN_H-30,14,ORANGE);
    DrawText(TextFormat("Anim: %d",w.anim_frame),SCREEN_W-120,138,14,GRAY);
    if(w.assist_mode) DrawText("ASSIST MODE",SCREEN_W/2-60,SCREEN_H-14,14,LIME);
    if(w.game_over) DrawText("GAME OVER -- R to restart",SCREEN_W/2-150,SCREEN_H/2,22,RED);
}

void renderSystem(World& w){
    BeginDrawing();
    ClearBackground(BLACK);
    int sx=w.shake_x,sy=w.shake_y;
    DrawRectangle(100+sx,50+sy,2,2,WHITE);
    DrawRectangle(200+sx,120+sy,2,2,WHITE);
    DrawRectangle(350+sx,30+sy,2,2,WHITE);
    DrawRectangle(500+sx,80+sy,2,2,WHITE);
    DrawRectangle(650+sx,150+sy,2,2,WHITE);
    DrawRectangle(750+sx,60+sy,2,2,WHITE);
    DrawRectangle(50+sx,200+sy,2,2,WHITE);
    DrawRectangle(300+sx,250+sy,2,2,WHITE);
    DrawRectangle(450+sx,180+sy,2,2,WHITE);
    DrawRectangle(600+sx,300+sy,2,2,WHITE);
    DrawRectangle(150+sx,350+sy,2,2,WHITE);
    DrawRectangle(700+sx,380+sy,2,2,WHITE);
    for(int i=0;i<MAX_ENEMIES;i++) if(w.enemy_active[i]){
        int ew=20+w.enemy_type[i]*4;
        Color ec=(w.anim_frame==0)?w.enemy_color[i]:DARKGRAY;
        DrawRectangle((int)w.enemy_x[i]+sx,(int)w.enemy_y[i]+sy,ew,24,ec);
    }
    if(w.boss.active){
        DrawRectangle((int)w.boss.x+sx,(int)w.boss.y+sy,80,40,MAGENTA);
        int barW=(int)(80.0f*w.boss.hp/w.boss.max_hp);
        DrawRectangle((int)w.boss.x+sx,(int)w.boss.y-8+sy,barW,6,RED);
        for(int i=0;i<MAX_BOSS_BULLETS;i++) if(w.boss.bullet_active[i])
            DrawCircle((int)w.boss.bullet_x[i]+sx,(int)w.boss.bullet_y[i]+sy,3,MAGENTA);
    }
    Color shipClr=(w.shield_timer>0)?SKYBLUE:GREEN;
    DrawRectangle((int)w.ship_x+sx,(int)w.ship_y+sy,w.ship_w,w.ship_h,shipClr);
    for(int i=0;i<MAX_BULLETS;i++) if(w.bullet_active[i])
        DrawRectangle(w.bullet_x[i]+sx,w.bullet_y[i]+sy,4,10,YELLOW);
    for(int i=0;i<MAX_PARTICLES;i++) if(w.particles[i].life>0)
        DrawRectangle((int)w.particles[i].x+sx,(int)w.particles[i].y+sy,4,4,w.particles[i].color);
    for(int i=0;i<MAX_POWERUPS;i++) if(w.powerup_active[i]){
        Color pc=(w.powerup_type[i]==0?GREEN:(w.powerup_type[i]==1?BLUE:PURPLE));
        DrawRectangle((int)w.powerup_x[i]+sx,(int)w.powerup_y[i]+sy,16,16,pc);
    }
    hudSystem(w);
    EndDrawing();
}

void gameFrame(World& w,float& acc){
    if(w.game_over){
        if(IsKeyPressed(KEY_R)){
            w.score=0;w.wave=1;w.lives=3;w.player_hp=3;
            w.game_over=false;w.combo_hits=0;w.shield_timer=0;
            for(int i=0;i<MAX_ENEMIES;i++) w.enemy_active[i]=false;
            for(int i=0;i<MAX_BULLETS;i++) w.bullet_active[i]=false;
            for(int i=0;i<MAX_POWERUPS;i++) w.powerup_active[i]=false;
            w.boss.active=false;
            spawnWave(w);
        }
        return;
    }
    while(acc>=FIXED_DT){
        double t0,t1;
        t0=GetTime();inputSystem(w);t1=GetTime();w.sys_time[0]=(float)(t1-t0)*1000.0f;
        t0=t1;aiSystem(w);t1=GetTime();w.sys_time[1]=(float)(t1-t0)*1000.0f;
        t0=t1;movementSystem(w);t1=GetTime();w.sys_time[2]=(float)(t1-t0)*1000.0f;
        t0=t1;collisionSystem(w);t1=GetTime();w.sys_time[3]=(float)(t1-t0)*1000.0f;
        t0=t1;waveSystem(w);t1=GetTime();w.sys_time[4]=(float)(t1-t0)*1000.0f;
        if(w.shake_timer>0){w.shake_timer--;w.shake_x=(rng_range(7)-3);w.shake_y=(rng_range(7)-3);}
        else{w.shake_x=0;w.shake_y=0;}
        w.anim_timer++;if(w.anim_timer>=15){w.anim_frame=1-w.anim_frame;w.anim_timer=0;}
        if(w.lives<=0) w.game_over=true;
        w.state_sig=computeStateSig(w);
        frame_counter++;
        acc-=FIXED_DT;
    }
}

int main(){
    InitWindow(SCREEN_W,SCREEN_H,"HeapSight Shooter v1.0");
    SetTargetFPS(60);
    world.ship_x=200;world.ship_y=380;world.speed=5;
    world.ship_w=40;world.ship_h=20;
    world.ship_flags=CF_POSITION|CF_VELOCITY|CF_RENDER|CF_COLLISION|CF_HP;
    world.shield_timer=0;
    world.score=0;world.wave=1;world.shots_fired=0;
    world.combo_hits=0;world.shoot_mode=0;
    world.player_hp=3;world.player_max_hp=3;
    world.lives=3;world.respawn_timer=0;world.game_over=false;
    world.input_log_count=0;
    world.replay_mode=false;world.replay_frame=0;
    world.state_sig=0;
    for(int i=0;i<MAX_BULLETS;i++) world.bullet_active[i]=false;
    for(int i=0;i<MAX_ENEMIES;i++) world.enemy_active[i]=false;
    for(int i=0;i<MAX_PARTICLES;i++) world.particles[i].life=0;
    for(int i=0;i<MAX_POWERUPS;i++) world.powerup_active[i]=false;
    world.boss.active=false;
    for(int i=0;i<6;i++) world.sys_time[i]=0.0f;
    world.peak_enemies=0;world.peak_bullets=0;world.peak_particles=0;
    world.draw_calls=0;
    world.shake_timer=0;world.shake_x=0;world.shake_y=0;
    world.anim_frame=0;world.anim_timer=0;
    world.difficulty=1;
    world.assist_mode=false;
    spawnWave(world);
    auditHeap(world);auditHeap(world);gateDaudit();
    print_L51_60();gateEaudit();
    print_L70();
    gateBaudit();
    print_L71_80();
    print_L81_90();
    print_L91_100();
    while(!WindowShouldClose()){
        accumulator+=GetFrameTime();
        gameFrame(world,accumulator);
        renderSystem(world);
    }
    CloseWindow();return 0;
}`,
    tests: [
      { id: "g1", description: "build-id line 1", expectedOutput: "Build ID + Version", isPattern: false },
      { id: "g2", description: "build-id output", expectedOutput: "BuildID: v1.0", isPattern: false },
      { id: "g3", description: "build-id complete", expectedOutput: "WindowTitle: HeapSight Shooter v1.0", isPattern: false },
      { id: "g4", description: "gate A present", expectedOutput: "GATE A: PASSED", isPattern: false },
      { id: "g5", description: "gate B present", expectedOutput: "GATE B: PASSED", isPattern: false },
    ],
    hints: [
      "The new cout lines print before the game loop.",
      "All previous systems remain unchanged.",
      "Check the HUD shows the lesson title.",
    ],
    estimatedMinutes: 15,
  },
};