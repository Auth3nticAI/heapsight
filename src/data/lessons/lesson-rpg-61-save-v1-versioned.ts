import { Lesson } from "@/types/lesson";

export const lessonRPG61: Lesson = {
  id: "rpg-61-save-v1-versioned",
  title: "Save v1 Versioned",
  description: "Save game state to a binary buffer with a version number — the foundation for forward-compatible serialization.",
  order: 61,
  xpReward: 100,
  tier: "pro",
  concepts: ["versioned serialization", "binary save format", "schema version", "save/load round-trip", "data integrity"],
  part1: {
    title: "Versioned Save Format",
    type: "concept",
    instructions: `# Save v1: Versioned Serialization

## Mental Model

Your RPG has a rich WorldState: position, HP, gold, XP, level, skills, quests. If the player quits, everything is lost. You need to save the game.

The naive approach: dump raw bytes of the struct to a buffer. Problem: when you add a new field (like skills in L59), old save files become incompatible. The bytes don't line up anymore.

## The Fix: Version Header

Every save starts with a version number:

\`\`\`cpp
const int SAVE_VERSION = 1;

struct SaveHeader {
    int version;
    int data_size;  // bytes of payload after header
};
\`\`\`

When loading, check the version first:

\`\`\`cpp
bool loadSave(const char* buf, int buf_size, WorldState& w) {
    SaveHeader header;
    memcpy(&header, buf, sizeof(SaveHeader));
    if (header.version != SAVE_VERSION) {
        cout << "SAVE_VERSION_MISMATCH" << endl;
        return false;  // or call migration function
    }
    // ... deserialize fields ...
}
\`\`\`

## Why This Matters

| Without version | With version |
|----------------|-------------|
| Old save + new code = crash or corruption | Old save detected, migration or rejection |
| No way to know format | Version byte tells you exactly what to expect |
| Can't add features without breaking saves | New fields go in new version, old saves handled |

## Beginner Trap: Writing Structs Directly

\`\`\`cpp
// WRONG: This depends on struct layout, padding, endianness
fwrite(&worldState, sizeof(WorldState), 1, file);
\`\`\`

This breaks across compilers, platforms, and struct changes. Instead, serialize each field explicitly using \`memcpy\` into a byte buffer. You control exactly what goes in and what comes out.

## Elite Insight: Protocol Buffers

Google's Protocol Buffers use field numbers — each field has an ID and a type. Unknown fields are skipped. Your version header is the simplified version of this pattern. Professional save systems at Bethesda and CD Projekt use similar versioned binary formats.

## Memory Insight

A save buffer of 256 bytes is enough for our current WorldState. Pre-allocated on the stack. No heap allocation for saving. Gate A stays clean.

## What You'll Build

In Part 1, implement \`writeSave\` and \`readSave\` functions that serialize core player data (position, HP, gold, XP, level, seed) into a versioned byte buffer. In Part 2, integrate into the game for a full save/load round-trip.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_VERSION=1;
const int SAVE_BUF_SIZE=256;

struct SaveHeader{int version;int data_size;};

// TODO: Implement writeSave(char* buf, int& buf_used,
//   int px, int py, int hp, int gold, int xp, int level, unsigned int seed)
// Layout: SaveHeader, then px, py, hp, gold, xp, level, seed as raw ints
// Use memcpy for each field. Update buf_used with total bytes written.
// Print SAVE_WRITE|version=V|size=S

// TODO: Implement readSave(const char* buf, int buf_size,
//   int& px, int& py, int& hp, int& gold, int& xp, int& level, unsigned int& seed)
// Read header first, check version == SAVE_VERSION
// If mismatch, print SAVE_VERSION_MISMATCH and return false
// Otherwise read all fields, print SAVE_READ|version=V|size=S, return true

int main(){
    char buf[SAVE_BUF_SIZE];
    int buf_used=0;

    // Write save
    writeSave(buf,buf_used, 3,4, 25, 40, 50, 2, 42u);

    // Read save back
    int px,py,hp,gold,xp,level;unsigned int seed;
    bool ok=readSave(buf,buf_used, px,py,hp,gold,xp,level,seed);
    if(ok){
        cout<<"LOADED|px="<<px<<"|py="<<py<<"|hp="<<hp<<"|gold="<<gold<<"|xp="<<xp<<"|level="<<level<<"|seed="<<seed<<endl;
    }

    // Test version mismatch
    SaveHeader bad_header={99,0};
    char bad_buf[SAVE_BUF_SIZE];
    memcpy(bad_buf,&bad_header,sizeof(SaveHeader));
    bool ok2=readSave(bad_buf,sizeof(SaveHeader), px,py,hp,gold,xp,level,seed);
    cout<<"MISMATCH|"<<ok2<<endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_VERSION=1;
const int SAVE_BUF_SIZE=256;
struct SaveHeader{int version;int data_size;};

void writeSave(char* buf,int& buf_used,int px,int py,int hp,int gold,int xp,int level,unsigned int seed){
    int offset=0;
    int data_size=7*(int)sizeof(int);
    SaveHeader hdr={SAVE_VERSION,data_size};
    memcpy(buf+offset,&hdr,sizeof(SaveHeader));offset+=sizeof(SaveHeader);
    memcpy(buf+offset,&px,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&py,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&hp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&gold,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&xp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&level,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&seed,sizeof(unsigned int));offset+=sizeof(unsigned int);
    buf_used=offset;
    cout<<"SAVE_WRITE|version="<<SAVE_VERSION<<"|size="<<buf_used<<endl;
}

bool readSave(const char* buf,int buf_size,int& px,int& py,int& hp,int& gold,int& xp,int& level,unsigned int& seed){
    if(buf_size<(int)sizeof(SaveHeader)) return false;
    SaveHeader hdr;
    memcpy(&hdr,buf,sizeof(SaveHeader));
    if(hdr.version!=SAVE_VERSION){cout<<"SAVE_VERSION_MISMATCH"<<endl;return false;}
    int offset=sizeof(SaveHeader);
    memcpy(&px,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&py,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&hp,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&gold,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&xp,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&level,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&seed,buf+offset,sizeof(unsigned int));offset+=sizeof(unsigned int);
    cout<<"SAVE_READ|version="<<hdr.version<<"|size="<<offset<<endl;
    return true;
}

int main(){
    char buf[SAVE_BUF_SIZE];
    int buf_used=0;
    writeSave(buf,buf_used, 3,4, 25, 40, 50, 2, 42u);
    int px,py,hp,gold,xp,level;unsigned int seed;
    bool ok=readSave(buf,buf_used, px,py,hp,gold,xp,level,seed);
    if(ok){
        cout<<"LOADED|px="<<px<<"|py="<<py<<"|hp="<<hp<<"|gold="<<gold<<"|xp="<<xp<<"|level="<<level<<"|seed="<<seed<<endl;
    }
    SaveHeader bad_header={99,0};
    char bad_buf[SAVE_BUF_SIZE];
    memcpy(bad_buf,&bad_header,sizeof(SaveHeader));
    bool ok2=readSave(bad_buf,sizeof(SaveHeader), px,py,hp,gold,xp,level,seed);
    cout<<"MISMATCH|"<<ok2<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Save written with version", expectedOutput: "SAVE_WRITE|version=1|size=", isPattern: true },
      { id: "t2", description: "Save read back", expectedOutput: "SAVE_READ|version=1|size=", isPattern: true },
      { id: "t3", description: "Position restored", expectedOutput: "LOADED|px=3|py=4", isPattern: true },
      { id: "t4", description: "Gold and XP restored", expectedOutput: "|gold=40|xp=50", isPattern: true },
      { id: "t5", description: "Level and seed restored", expectedOutput: "|level=2|seed=42", isPattern: true },
      { id: "t6", description: "Version mismatch detected", expectedOutput: "SAVE_VERSION_MISMATCH", isPattern: false },
      { id: "t7", description: "Mismatch returns false", expectedOutput: "MISMATCH|0", isPattern: false },
    ],
    hints: [
      "writeSave uses memcpy to copy each field into buf at an incrementing offset. Start with the SaveHeader, then each int field.",
      "readSave reads the header first with memcpy. Check hdr.version == SAVE_VERSION. If mismatch, print and return false.",
      "data_size in the header should be 7*sizeof(int) = 28 bytes (7 fields: px,py,hp,gold,xp,level,seed). Total with header: 36 bytes.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Save and Load in the Game",
    type: "game_builder",
    instructions: `# Integrate Save/Load into the Game

## Goal

Add \`writeSave\` and \`readSave\` functions that serialize/deserialize the core WorldState fields into a versioned byte buffer. Demonstrate a save/load round-trip: play some turns, save, reset world, load, and verify state matches.

## What Changes

1. **Add** save buffer to the game (\`char save_buf[SAVE_BUF_SIZE]\`)
2. **Add** writeSave that serializes: version, px, py, hp, gold, xp, level, seed, turn
3. **Add** readSave that deserializes and restores those fields
4. **Demonstrate** save at turn N, reset, load, verify state matches

## Visible Change

Output shows SAVE_WRITE after some turns, then SAVE_READ after reset, followed by VERIFY_SAVE confirming all fields match the saved values.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16;
const int SAVE_VERSION=1;const int SAVE_BUF_SIZE=256;
typedef char Tile; const Tile TILE_WALL='#';

struct SaveHeader{int version;int data_size;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];
    int gold;int xp;int level;unsigned int seed;
};

// TODO: Implement writeSave(char* buf, int& buf_used, const WorldState& w)
// Serialize: version header, then pos_x[0], pos_y[0], hp[0], gold, xp, level, seed, turn
// Print SAVE_WRITE|version=1|turn=T

// TODO: Implement readSave(const char* buf, int buf_size, WorldState& w)
// Check version. Restore pos_x[0], pos_y[0], hp[0], gold, xp, level, seed, turn
// Print SAVE_READ|version=1|turn=T

const char ROOM_DATA[]=
    "##########""#........#""#........#""#........#""#@.......#"
    "#........#""#........#""#........#""#........#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;w.entity_count=0;w.gold=10;w.xp=0;w.level=1;w.turn=0;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=30;w.alive[id]=true;w.grid[y][x]='.';}
        else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,int dx,int dy){
    w.turn++;
    int nx=w.pos_x[0]+dx,ny=w.pos_y[0]+dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    w.gold+=5;w.xp+=10;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);

    // Play 3 turns
    game_tick(w,1,0);game_tick(w,1,0);game_tick(w,0,-1);
    cout<<"BEFORE_SAVE|turn="<<w.turn<<"|px="<<w.pos_x[0]<<"|py="<<w.pos_y[0]<<"|gold="<<w.gold<<"|xp="<<w.xp<<endl;

    // Save
    char save_buf[SAVE_BUF_SIZE];int save_used=0;
    writeSave(save_buf,save_used,w);

    // Reset world
    loadRoom(w,ROOM_DATA,W,H,42);
    cout<<"AFTER_RESET|turn="<<w.turn<<"|gold="<<w.gold<<endl;

    // Load save
    bool ok=readSave(save_buf,save_used,w);
    cout<<"AFTER_LOAD|turn="<<w.turn<<"|px="<<w.pos_x[0]<<"|py="<<w.pos_y[0]<<"|gold="<<w.gold<<"|xp="<<w.xp<<endl;

    // Verify round-trip
    bool match=(w.turn==3&&w.pos_x[0]==3&&w.pos_y[0]==3&&w.gold==25&&w.xp==30);
    cout<<"VERIFY_SAVE|"<<(match?"PASS":"FAIL")<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int W=10,H=10,MAX_E=16;
const int SAVE_VERSION=1;const int SAVE_BUF_SIZE=256;
typedef char Tile; const Tile TILE_WALL='#';
struct SaveHeader{int version;int data_size;};

struct WorldState{
    int pos_x[MAX_E],pos_y[MAX_E];
    int hp[MAX_E];bool alive[MAX_E];
    int entity_count;int turn;
    Tile grid[H][W];
    int gold;int xp;int level;unsigned int seed;
};

void writeSave(char* buf,int& buf_used,const WorldState& w){
    int offset=0;
    int data_size=8*(int)sizeof(int);
    SaveHeader hdr={SAVE_VERSION,data_size};
    memcpy(buf+offset,&hdr,sizeof(SaveHeader));offset+=sizeof(SaveHeader);
    int px=w.pos_x[0];memcpy(buf+offset,&px,sizeof(int));offset+=sizeof(int);
    int py=w.pos_y[0];memcpy(buf+offset,&py,sizeof(int));offset+=sizeof(int);
    int hp=w.hp[0];memcpy(buf+offset,&hp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&w.gold,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&w.xp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&w.level,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&w.seed,sizeof(unsigned int));offset+=sizeof(unsigned int);
    memcpy(buf+offset,&w.turn,sizeof(int));offset+=sizeof(int);
    buf_used=offset;
    cout<<"SAVE_WRITE|version="<<SAVE_VERSION<<"|turn="<<w.turn<<endl;
}

bool readSave(const char* buf,int buf_size,WorldState& w){
    if(buf_size<(int)sizeof(SaveHeader)) return false;
    SaveHeader hdr;memcpy(&hdr,buf,sizeof(SaveHeader));
    if(hdr.version!=SAVE_VERSION){cout<<"SAVE_VERSION_MISMATCH"<<endl;return false;}
    int offset=sizeof(SaveHeader);
    int px,py,hp;
    memcpy(&px,buf+offset,sizeof(int));offset+=sizeof(int);w.pos_x[0]=px;
    memcpy(&py,buf+offset,sizeof(int));offset+=sizeof(int);w.pos_y[0]=py;
    memcpy(&hp,buf+offset,sizeof(int));offset+=sizeof(int);w.hp[0]=hp;
    memcpy(&w.gold,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&w.xp,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&w.level,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&w.seed,buf+offset,sizeof(unsigned int));offset+=sizeof(unsigned int);
    memcpy(&w.turn,buf+offset,sizeof(int));offset+=sizeof(int);
    cout<<"SAVE_READ|version="<<hdr.version<<"|turn="<<w.turn<<endl;
    return true;
}

const char ROOM_DATA[]=
    "##########""#........#""#........#""#........#""#@.......#"
    "#........#""#........#""#........#""#........#""##########";

void loadRoom(WorldState& w,const char* data,int dw,int dh,unsigned int seed){
    w={};w.seed=seed;w.entity_count=0;w.gold=10;w.xp=0;w.level=1;w.turn=0;
    for(int y=0;y<dh&&y<H;y++){for(int x=0;x<dw&&x<W;x++){
        char c=data[y*dw+x];
        if(c=='@'){int id=w.entity_count++;w.pos_x[id]=x;w.pos_y[id]=y;w.hp[id]=30;w.alive[id]=true;w.grid[y][x]='.';}
        else{w.grid[y][x]=c;}
    }}
    cout<<"LOAD|entities="<<w.entity_count<<endl;
}

void game_tick(WorldState& w,int dx,int dy){
    w.turn++;
    int nx=w.pos_x[0]+dx,ny=w.pos_y[0]+dy;
    if(nx>=0&&nx<W&&ny>=0&&ny<H&&w.grid[ny][nx]!=TILE_WALL){w.pos_x[0]=nx;w.pos_y[0]=ny;}
    w.gold+=5;w.xp+=10;
}

int main(){
    WorldState w;
    loadRoom(w,ROOM_DATA,W,H,42);
    game_tick(w,1,0);game_tick(w,1,0);game_tick(w,0,-1);
    cout<<"BEFORE_SAVE|turn="<<w.turn<<"|px="<<w.pos_x[0]<<"|py="<<w.pos_y[0]<<"|gold="<<w.gold<<"|xp="<<w.xp<<endl;
    char save_buf[SAVE_BUF_SIZE];int save_used=0;
    writeSave(save_buf,save_used,w);
    loadRoom(w,ROOM_DATA,W,H,42);
    cout<<"AFTER_RESET|turn="<<w.turn<<"|gold="<<w.gold<<endl;
    bool ok=readSave(save_buf,save_used,w);
    cout<<"AFTER_LOAD|turn="<<w.turn<<"|px="<<w.pos_x[0]<<"|py="<<w.pos_y[0]<<"|gold="<<w.gold<<"|xp="<<w.xp<<endl;
    bool match=(w.turn==3&&w.pos_x[0]==3&&w.pos_y[0]==3&&w.gold==25&&w.xp==30);
    cout<<"VERIFY_SAVE|"<<(match?"PASS":"FAIL")<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Room loads", expectedOutput: "LOAD|entities=1", isPattern: false },
      { id: "g2", description: "State before save", expectedOutput: "BEFORE_SAVE|turn=3|px=3|py=3|gold=25|xp=30", isPattern: false },
      { id: "g3", description: "Save written", expectedOutput: "SAVE_WRITE|version=1|turn=3", isPattern: false },
      { id: "g4", description: "State reset", expectedOutput: "AFTER_RESET|turn=0|gold=10", isPattern: false },
      { id: "g5", description: "Save loaded", expectedOutput: "SAVE_READ|version=1|turn=3", isPattern: false },
      { id: "g6", description: "State restored", expectedOutput: "AFTER_LOAD|turn=3|px=3|py=3|gold=25|xp=30", isPattern: false },
      { id: "g7", description: "Round-trip verified", expectedOutput: "VERIFY_SAVE|PASS", isPattern: false },
    ],
    hints: [
      "writeSave copies the header first, then each field using memcpy at incrementing offsets. Store 8 fields: px, py, hp, gold, xp, level, seed, turn.",
      "readSave reads the header, checks version, then reads each field in the same order. Set w.pos_x[0], w.pos_y[0], etc.",
      "After 3 ticks with dx=1,1,0 and dy=0,0,-1: px goes 1->2->3, py goes 4->4->3. Gold = 10+5+5+5=25, XP = 0+10+10+10=30.",
    ],
    estimatedMinutes: 15,
  },
};