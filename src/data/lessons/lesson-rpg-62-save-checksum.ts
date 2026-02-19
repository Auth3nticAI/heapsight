import { Lesson } from "@/types/lesson";

export const lessonRPG62: Lesson = {
  id: "rpg-62-save-checksum",
  title: "Save Checksum",
  description: "Add a checksum to the save buffer to detect corruption — if the bits don't add up, reject the save.",
  order: 62,
  xpReward: 100,
  tier: "pro",
  concepts: ["checksum", "data integrity", "corruption detection", "save validation", "byte-level verification"],
  part1: {
    title: "Checksums for Data Integrity",
    type: "concept",
    instructions: `# Save Checksum: Detecting Corruption

## Mental Model

Your save buffer from L61 has a version header and serialized fields. But what if a byte gets flipped? A cosmic ray, a disk error, or a bug that writes to the wrong memory location could corrupt the save. When you load it, you'd get garbage data — wrong position, negative HP, impossible gold values — and no way to tell it's corrupt.

## The Fix: Checksum

A checksum is a number computed from the data bytes. Store it in the save. On load, recompute it and compare:

\`\`\`cpp
unsigned int computeChecksum(const char* data, int size) {
    unsigned int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += (unsigned char)data[i];
        sum = (sum << 3) | (sum >> 29);  // rotate left 3
    }
    return sum;
}
\`\`\`

The rotate makes the checksum sensitive to byte ORDER, not just byte values. Two saves with the same bytes in different order produce different checksums.

## Save Format v1.1

\`\`\`
[SaveHeader: version, data_size]
[payload: px, py, hp, gold, xp, level, seed, turn]
[checksum: 4 bytes, computed over payload only]
\`\`\`

On save: compute checksum over payload bytes, append it.
On load: read payload, compute checksum, compare with stored value.

## Why This Matters

| Without checksum | With checksum |
|-----------------|--------------|
| Corrupt save loads silently | Corrupt save detected and rejected |
| Debugging mystery: why is HP negative? | Clear error: CHECKSUM_MISMATCH |
| No way to trust save data | Mathematical proof data is intact |

## Beginner Trap: Using == on Floats for Checksums

Never use floating point for checksums. Floating point math is not bitwise identical across platforms. Use unsigned integer arithmetic only. Our rotate-and-add checksum is fast, simple, and deterministic.

## Elite Insight: CRC-32

Production systems use CRC-32 (Cyclic Redundancy Check), which catches more error patterns. TCP/IP, ZIP files, and PNG images all use CRC-32. Our rotate checksum is simpler but demonstrates the same principle: data integrity through mathematical verification.

## Memory Insight

Checksum adds 4 bytes to the save. Computation is O(n) where n is payload size (~32 bytes). Negligible cost for guaranteed integrity.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

// TODO: Implement computeChecksum(const char* data, int size)
// For each byte: sum += (unsigned char)data[i], then rotate left 3
// Rotate left 3: sum = (sum << 3) | (sum >> 29)
// Return the final sum

int main(){
    // Test 1: Known data
    char data1[]={1,2,3,4,5};
    unsigned int c1=computeChecksum(data1,5);
    cout<<"CHECK1|"<<c1<<endl;

    // Test 2: Same data = same checksum
    char data2[]={1,2,3,4,5};
    unsigned int c2=computeChecksum(data2,5);
    cout<<"MATCH|"<<(c1==c2)<<endl;

    // Test 3: Different data = different checksum
    char data3[]={1,2,3,4,6};
    unsigned int c3=computeChecksum(data3,5);
    cout<<"DIFFER|"<<(c1!=c3)<<endl;

    // Test 4: Order matters
    char data4[]={5,4,3,2,1};
    unsigned int c4=computeChecksum(data4,5);
    cout<<"ORDER|"<<(c1!=c4)<<endl;

    // Test 5: Empty data
    unsigned int c5=computeChecksum(data1,0);
    cout<<"EMPTY|"<<c5<<endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

unsigned int computeChecksum(const char* data,int size){
    unsigned int sum=0;
    for(int i=0;i<size;i++){
        sum+=(unsigned char)data[i];
        sum=(sum<<3)|(sum>>29);
    }
    return sum;
}

int main(){
    char data1[]={1,2,3,4,5};
    unsigned int c1=computeChecksum(data1,5);
    cout<<"CHECK1|"<<c1<<endl;

    char data2[]={1,2,3,4,5};
    unsigned int c2=computeChecksum(data2,5);
    cout<<"MATCH|"<<(c1==c2)<<endl;

    char data3[]={1,2,3,4,6};
    unsigned int c3=computeChecksum(data3,5);
    cout<<"DIFFER|"<<(c1!=c3)<<endl;

    char data4[]={5,4,3,2,1};
    unsigned int c4=computeChecksum(data4,5);
    cout<<"ORDER|"<<(c1!=c4)<<endl;

    unsigned int c5=computeChecksum(data1,0);
    cout<<"EMPTY|"<<c5<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Checksum computed", expectedOutput: "CHECK1|", isPattern: true },
      { id: "t2", description: "Same data matches", expectedOutput: "MATCH|1", isPattern: false },
      { id: "t3", description: "Different data differs", expectedOutput: "DIFFER|1", isPattern: false },
      { id: "t4", description: "Order matters", expectedOutput: "ORDER|1", isPattern: false },
      { id: "t5", description: "Empty is zero", expectedOutput: "EMPTY|0", isPattern: false },
    ],
    hints: [
      "Cast each byte to unsigned char before adding: sum += (unsigned char)data[i]. This prevents sign extension from char.",
      "Rotate left 3: (sum << 3) | (sum >> 29). This uses all 32 bits of the unsigned int.",
      "For empty data (size=0), the loop doesn't execute and sum stays 0.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Checksummed Save/Load Round-Trip",
    type: "game_builder",
    instructions: `# Add Checksum to Save Format

## Goal

Extend the save/load from L61 to include a checksum. On save, compute checksum over the payload and append it. On load, verify the checksum before accepting the data. Demonstrate both valid and corrupted saves.

## What Changes

1. **Add** \`computeChecksum\` function
2. **Modify** \`writeSave\` to compute and append checksum after payload
3. **Modify** \`readSave\` to verify checksum before accepting
4. **Test** corruption detection by flipping a byte in the buffer

## Visible Change

Save output now includes checksum value. Load output shows CHECKSUM_OK or CHECKSUM_MISMATCH.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_VERSION=1;const int SAVE_BUF_SIZE=256;
struct SaveHeader{int version;int data_size;};

unsigned int computeChecksum(const char* data,int size){
    unsigned int sum=0;
    for(int i=0;i<size;i++){sum+=(unsigned char)data[i];sum=(sum<<3)|(sum>>29);}
    return sum;
}

// TODO: Modify writeSave to append checksum after payload
// 1. Write header at offset 0
// 2. Write payload fields (px,py,hp,gold,xp,level,seed,turn)
// 3. Compute checksum over payload bytes only (from after header to end of payload)
// 4. Append checksum (4 bytes)
// 5. Print SAVE_WRITE|version=V|checksum=C
void writeSave(char* buf,int& buf_used,int px,int py,int hp,int gold,int xp,int level,unsigned int seed,int turn){
    int offset=0;
    int payload_size=8*(int)sizeof(int);
    SaveHeader hdr={SAVE_VERSION,payload_size};
    memcpy(buf+offset,&hdr,sizeof(SaveHeader));offset+=sizeof(SaveHeader);
    int payload_start=offset;
    memcpy(buf+offset,&px,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&py,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&hp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&gold,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&xp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&level,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&seed,sizeof(unsigned int));offset+=sizeof(unsigned int);
    memcpy(buf+offset,&turn,sizeof(int));offset+=sizeof(int);
    // TODO: Compute checksum over buf[payload_start..offset) and append
    buf_used=offset;
    cout<<"SAVE_WRITE|version="<<SAVE_VERSION<<endl;
}

// TODO: Modify readSave to verify checksum
// After reading payload, compute checksum over payload bytes
// Read stored checksum, compare. Print CHECKSUM_OK or CHECKSUM_MISMATCH
bool readSave(const char* buf,int buf_size,int& px,int& py,int& hp,int& gold,int& xp,int& level,unsigned int& seed,int& turn){
    if(buf_size<(int)sizeof(SaveHeader)) return false;
    SaveHeader hdr;memcpy(&hdr,buf,sizeof(SaveHeader));
    if(hdr.version!=SAVE_VERSION){cout<<"SAVE_VERSION_MISMATCH"<<endl;return false;}
    int offset=sizeof(SaveHeader);
    int payload_start=offset;
    memcpy(&px,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&py,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&hp,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&gold,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&xp,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&level,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&seed,buf+offset,sizeof(unsigned int));offset+=sizeof(unsigned int);
    memcpy(&turn,buf+offset,sizeof(int));offset+=sizeof(int);
    // TODO: Read stored checksum, compute expected, compare
    cout<<"SAVE_READ|version="<<hdr.version<<endl;
    return true;
}

int main(){
    char buf[SAVE_BUF_SIZE];int buf_used=0;
    writeSave(buf,buf_used, 3,4,25,40,50,2,42u,10);

    // Valid load
    int px,py,hp,gold,xp,level,turn;unsigned int seed;
    bool ok=readSave(buf,buf_used,px,py,hp,gold,xp,level,seed,turn);
    cout<<"VALID|"<<ok<<"|gold="<<gold<<"|turn="<<turn<<endl;

    // Corrupt one byte and try loading
    char corrupt_buf[SAVE_BUF_SIZE];
    memcpy(corrupt_buf,buf,buf_used);
    corrupt_buf[sizeof(SaveHeader)+2]=99; // flip a byte in payload
    bool ok2=readSave(corrupt_buf,buf_used,px,py,hp,gold,xp,level,seed,turn);
    cout<<"CORRUPT|"<<ok2<<endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_VERSION=1;const int SAVE_BUF_SIZE=256;
struct SaveHeader{int version;int data_size;};

unsigned int computeChecksum(const char* data,int size){
    unsigned int sum=0;
    for(int i=0;i<size;i++){sum+=(unsigned char)data[i];sum=(sum<<3)|(sum>>29);}
    return sum;
}

void writeSave(char* buf,int& buf_used,int px,int py,int hp,int gold,int xp,int level,unsigned int seed,int turn){
    int offset=0;
    int payload_size=8*(int)sizeof(int);
    SaveHeader hdr={SAVE_VERSION,payload_size};
    memcpy(buf+offset,&hdr,sizeof(SaveHeader));offset+=sizeof(SaveHeader);
    int payload_start=offset;
    memcpy(buf+offset,&px,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&py,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&hp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&gold,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&xp,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&level,sizeof(int));offset+=sizeof(int);
    memcpy(buf+offset,&seed,sizeof(unsigned int));offset+=sizeof(unsigned int);
    memcpy(buf+offset,&turn,sizeof(int));offset+=sizeof(int);
    unsigned int chk=computeChecksum(buf+payload_start,offset-payload_start);
    memcpy(buf+offset,&chk,sizeof(unsigned int));offset+=sizeof(unsigned int);
    buf_used=offset;
    cout<<"SAVE_WRITE|version="<<SAVE_VERSION<<"|checksum="<<chk<<endl;
}

bool readSave(const char* buf,int buf_size,int& px,int& py,int& hp,int& gold,int& xp,int& level,unsigned int& seed,int& turn){
    if(buf_size<(int)sizeof(SaveHeader)) return false;
    SaveHeader hdr;memcpy(&hdr,buf,sizeof(SaveHeader));
    if(hdr.version!=SAVE_VERSION){cout<<"SAVE_VERSION_MISMATCH"<<endl;return false;}
    int offset=sizeof(SaveHeader);
    int payload_start=offset;
    memcpy(&px,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&py,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&hp,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&gold,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&xp,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&level,buf+offset,sizeof(int));offset+=sizeof(int);
    memcpy(&seed,buf+offset,sizeof(unsigned int));offset+=sizeof(unsigned int);
    memcpy(&turn,buf+offset,sizeof(int));offset+=sizeof(int);
    unsigned int expected=computeChecksum(buf+payload_start,offset-payload_start);
    unsigned int stored;memcpy(&stored,buf+offset,sizeof(unsigned int));
    if(expected!=stored){cout<<"CHECKSUM_MISMATCH|expected="<<expected<<"|stored="<<stored<<endl;return false;}
    cout<<"CHECKSUM_OK|"<<expected<<endl;
    cout<<"SAVE_READ|version="<<hdr.version<<endl;
    return true;
}

int main(){
    char buf[SAVE_BUF_SIZE];int buf_used=0;
    writeSave(buf,buf_used, 3,4,25,40,50,2,42u,10);
    int px,py,hp,gold,xp,level,turn;unsigned int seed;
    bool ok=readSave(buf,buf_used,px,py,hp,gold,xp,level,seed,turn);
    cout<<"VALID|"<<ok<<"|gold="<<gold<<"|turn="<<turn<<endl;
    char corrupt_buf[SAVE_BUF_SIZE];
    memcpy(corrupt_buf,buf,buf_used);
    corrupt_buf[sizeof(SaveHeader)+2]=99;
    bool ok2=readSave(corrupt_buf,buf_used,px,py,hp,gold,xp,level,seed,turn);
    cout<<"CORRUPT|"<<ok2<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Save with checksum", expectedOutput: "SAVE_WRITE|version=1|checksum=", isPattern: true },
      { id: "g2", description: "Checksum valid on load", expectedOutput: "CHECKSUM_OK|", isPattern: true },
      { id: "g3", description: "Data restored correctly", expectedOutput: "VALID|1|gold=40|turn=10", isPattern: false },
      { id: "g4", description: "Corruption detected", expectedOutput: "CHECKSUM_MISMATCH|expected=", isPattern: true },
      { id: "g5", description: "Corrupt load returns false", expectedOutput: "CORRUPT|0", isPattern: false },
    ],
    hints: [
      "In writeSave, compute checksum AFTER writing all payload fields: computeChecksum(buf+payload_start, offset-payload_start). Then memcpy the checksum at buf+offset.",
      "In readSave, after reading all payload fields, compute expected checksum the same way. Then read stored checksum from buf+offset. Compare them.",
      "Corrupting one byte in the payload changes the expected checksum but not the stored one, so they won't match.",
    ],
    estimatedMinutes: 12,
  },
};