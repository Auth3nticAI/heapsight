import { Lesson } from "@/types/lesson";

export const lessonRPG24: Lesson = {
  id: "rpg-24-save-file-v0",
  title: "Save File v0",
  description: "Serialize player state to a char buffer with memcpy. SaveHeader with version. Read back and verify.",
  order: 24,
  xpReward: 100,
  tier: "pro",
  concepts: ["serialization", "memcpy", "save header", "round-trip verification", "hs_save.h"],
  part1: {
    title: "Concept: Binary Serialization",
    type: "concept",
    instructions: `# Save File v0

## Mental Model

A save file is a snapshot of game state written to a buffer. In production, this goes to disk. Here, we serialize to a \`char\` buffer using \`memcpy\`. The save has a header (version number) followed by player data. Reading back means copying bytes from the buffer back into the struct. If the bytes match, the save is correct.

## What Breaks Without This

Without save/load, your player dies and starts from scratch. All progress is lost. Worse: without a version header, old saves break silently when you add new fields. A version number lets you detect format mismatches before corrupting state.

## The Fix: SaveHeader + memcpy

Define a simple save format:

\`\`\`cpp
struct SaveHeader {
    unsigned int version;  // format version
    unsigned int seed;     // RNG seed
};

struct SaveData {
    int player_hp;
    int player_x;
    int player_y;
};
\`\`\`

Write to buffer:
\`\`\`cpp
char buffer[256];
int offset = 0;
memcpy(buffer + offset, &header, sizeof(header)); offset += sizeof(header);
memcpy(buffer + offset, &data, sizeof(data));     offset += sizeof(data);
\`\`\`

Read back:
\`\`\`cpp
SaveHeader loaded_header;
SaveData loaded_data;
offset = 0;
memcpy(&loaded_header, buffer + offset, sizeof(loaded_header)); offset += sizeof(loaded_header);
memcpy(&loaded_data, buffer + offset, sizeof(loaded_data));     offset += sizeof(loaded_data);
\`\`\`

This is the same pattern used in network packet serialization and file I/O. The buffer is a flat sequence of bytes. You control the layout exactly.

## Key Concepts
- **SaveHeader** -- version number for format detection. Old saves with wrong version are rejected.
- **memcpy** -- copies N bytes from source to destination. No interpretation, just bytes.
- **Offset tracking** -- write at \`buffer + offset\`, advance offset by \`sizeof(T)\`.
- **Round-trip** -- write then read. If data matches, serialization is correct.

## Performance Insight

memcpy of 20 bytes is a single CPU operation on modern hardware (fits in one cache line). Writing a save to a 256-byte buffer is essentially free. The bottleneck in real saves is disk I/O, not serialization.

## Memory Insight

The save buffer is a fixed-size stack array. No heap allocation. sizeof(SaveHeader) + sizeof(SaveData) is typically 20 bytes. The buffer is reusable -- write, read, overwrite. No fragmentation. No cleanup.

## Your Task

Implement \`writeSave\` and \`readSave\` using memcpy. Write player state (HP 85, position 3,4) with version 1 and seed 42. Read back and verify all fields match.

Expected output:
\`\`\`
SAVE_WRITE|version=1|seed=42|hp=85|pos=3,4
SAVE_READ|version=1|seed=42|hp=85|pos=3,4
SAVE_MATCH|true
\`\`\`

## Beginner Trap

**Forgetting to advance the offset after each memcpy.** If you write the header at offset 0 and then write the data at offset 0 too, the data overwrites the header. Always advance: \`offset += sizeof(T)\` after each write.

## Elite Insight

Diablo 2's save files use a versioned binary format with a 4-byte header. When the game patches and adds new fields, the version number increments. The loader checks the version and migrates old saves forward. Your SaveHeader follows the same pattern -- version first, data second.

## Systems Thinking Connection

This memcpy serialization is the RPG equivalent of the Robotics path's rosbag binary format. Both store structured data as flat bytes with a header for versioning. The robot serializes sensor messages; you serialize player state. Same pattern, different domain.

## Skill Reinforcement

Lesson 23 introduced state signatures. This lesson adds the ability to persist state. Lesson 25 will combine save/load with signatures to prove that a loaded game produces the same state as the original.

## Mastery Check

Question: Why use a version number in the save header instead of just writing raw data?
Answer: Because when you add new fields (like inventory or quest state), old saves become incompatible. The version number lets you detect this and either reject old saves or migrate them forward.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

struct SaveHeader {
    unsigned int version;
    unsigned int seed;
};

struct SaveData {
    int player_hp;
    int player_x;
    int player_y;
};

// TODO: int writeSave(char* buffer, SaveHeader& hdr, SaveData& data)
// memcpy header then data into buffer, return total bytes written

// TODO: void readSave(const char* buffer, SaveHeader& hdr, SaveData& data)
// memcpy header then data out of buffer

int main() {
    char buffer[256];
    SaveHeader hdr = {1, 42};
    SaveData data = {85, 3, 4};

    int bytes = writeSave(buffer, hdr, data);
    cout << "SAVE_WRITE|version=" << hdr.version
         << "|seed=" << hdr.seed
         << "|hp=" << data.player_hp
         << "|pos=" << data.player_x << "," << data.player_y << endl;

    SaveHeader loaded_hdr;
    SaveData loaded_data;
    readSave(buffer, loaded_hdr, loaded_data);
    cout << "SAVE_READ|version=" << loaded_hdr.version
         << "|seed=" << loaded_hdr.seed
         << "|hp=" << loaded_data.player_hp
         << "|pos=" << loaded_data.player_x << "," << loaded_data.player_y << endl;

    bool match = (loaded_hdr.version == hdr.version &&
                  loaded_hdr.seed == hdr.seed &&
                  loaded_data.player_hp == data.player_hp &&
                  loaded_data.player_x == data.player_x &&
                  loaded_data.player_y == data.player_y);
    cout << "SAVE_MATCH|" << (match ? "true" : "false") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

struct SaveHeader {
    unsigned int version;
    unsigned int seed;
};

struct SaveData {
    int player_hp;
    int player_x;
    int player_y;
};

int writeSave(char* buffer, SaveHeader& hdr, SaveData& data) {
    int offset = 0;
    memcpy(buffer + offset, &hdr, sizeof(hdr)); offset += sizeof(hdr);
    memcpy(buffer + offset, &data, sizeof(data)); offset += sizeof(data);
    return offset;
}

void readSave(const char* buffer, SaveHeader& hdr, SaveData& data) {
    int offset = 0;
    memcpy(&hdr, buffer + offset, sizeof(hdr)); offset += sizeof(hdr);
    memcpy(&data, buffer + offset, sizeof(data)); offset += sizeof(data);
}

int main() {
    char buffer[256];
    SaveHeader hdr = {1, 42};
    SaveData data = {85, 3, 4};

    int bytes = writeSave(buffer, hdr, data);
    cout << "SAVE_WRITE|version=" << hdr.version
         << "|seed=" << hdr.seed
         << "|hp=" << data.player_hp
         << "|pos=" << data.player_x << "," << data.player_y << endl;

    SaveHeader loaded_hdr;
    SaveData loaded_data;
    readSave(buffer, loaded_hdr, loaded_data);
    cout << "SAVE_READ|version=" << loaded_hdr.version
         << "|seed=" << loaded_hdr.seed
         << "|hp=" << loaded_data.player_hp
         << "|pos=" << loaded_data.player_x << "," << loaded_data.player_y << endl;

    bool match = (loaded_hdr.version == hdr.version &&
                  loaded_hdr.seed == hdr.seed &&
                  loaded_data.player_hp == data.player_hp &&
                  loaded_data.player_x == data.player_x &&
                  loaded_data.player_y == data.player_y);
    cout << "SAVE_MATCH|" << (match ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Save written correctly", expectedOutput: "SAVE_WRITE|version=1|seed=42|hp=85|pos=3,4" },
      { id: "t2", description: "Save read correctly", expectedOutput: "SAVE_READ|version=1|seed=42|hp=85|pos=3,4" },
      { id: "t3", description: "Round-trip data matches", expectedOutput: "SAVE_MATCH|true" },
    ],
    hints: [
      "writeSave uses memcpy twice: once for header, once for data. Track offset to avoid overwriting.",
      "readSave mirrors writeSave: memcpy from buffer into header, advance offset, memcpy into data.",
      "offset += sizeof(hdr) after writing header, offset += sizeof(data) after writing data.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Save/Load Round Trip with WorldState",
    type: "game_builder",
    instructions: `# Build: Save/Load Round Trip with WorldState

## Mental Model

Now apply save/load to the actual game state. Write the player's data from WorldState into a buffer, read it back into a fresh WorldState, and verify every field matches. This is the round-trip proof that your serialization is correct.

## What Breaks Without This

If writeSave and readSave use different field ordering, the loaded data is garbled. HP reads as position. Seed reads as HP. The game appears to work but combat is insane. Round-trip verification catches this immediately.

## The Fix: WorldState Save/Load

1. Extract save-relevant fields from WorldState into SaveHeader + SaveData
2. Write to buffer
3. Read from buffer into a fresh WorldState
4. Compare every field

## Key Concepts
- **Extract then serialize** -- pull fields from WorldState into save structs, then memcpy
- **Restore then verify** -- read into save structs, push fields into fresh WorldState, compare
- **Version guard** -- check header version before reading data. Reject mismatches.
- **Seed preservation** -- saved seed restores RNG to its state at save time

## Performance Insight

The entire save/load cycle is ~40 bytes of memcpy. On modern hardware, this fits in a single cache line transfer. The verification loop compares 5 integers. Total cost: nanoseconds.

## Memory Insight

The buffer is 256 bytes on the stack. The SaveHeader and SaveData structs are temporary -- they exist only during save/load. No heap. No dynamic allocation. The buffer could be reused for network packets with the same pattern.

## Your Task

1. WorldState with seed 99, player at (4,2) HP 75, enemy at (7,5) HP 40.
2. Write save: header (version 1, seed 99) + data (hp 75, pos 4,2).
3. Read into fresh WorldState.
4. Re-seed RNG with loaded seed.
5. Verify all fields match.

Expected output:
\`\`\`
WORLD_SAVE|version=1|seed=99|hp=75|pos=4,2|bytes=20
WORLD_LOAD|version=1|seed=99|hp=75|pos=4,2
ROUND_TRIP|match=true
\`\`\`

## Beginner Trap

**Saving the RNG state directly instead of saving the seed.** If you memcpy the RNG struct, you save the current state, not the initial seed. On load, you cannot re-derive the state from the seed. Always save the seed and call \`rng_seed\` on load.

## Elite Insight

Nethack's save format stores the dungeon seed and player state in a versioned binary blob. Loading re-generates the dungeon from the seed, then restores the player. Your save follows the same philosophy: seed reconstructs the world, save data restores the player within it.

## Mastery Check

Question: Why save 20 bytes instead of the entire WorldState struct?
Answer: Because most of WorldState can be reconstructed from the seed. Save only what cannot be recomputed: player position, HP, and the seed. This makes saves smaller, simpler, and more robust to struct layout changes.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;
const int MAX_E = 16;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

struct SaveHeader { unsigned int version; unsigned int seed; };
struct SaveData { int player_hp; int player_x; int player_y; };

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
    RNG rng;
    unsigned int seed;
};

// TODO: int writeSave(char* buf, WorldState& w)
// Create header (version=1, seed=w.seed), data (hp, pos)
// memcpy both into buf, return bytes written

// TODO: bool readSave(const char* buf, WorldState& w)
// Read header, check version==1, read data, restore fields
// Call rng_seed(w.rng, loaded_seed)

int main() {
    WorldState w = {};
    w.seed = 99;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=4; w.pos_y[0]=2; w.hp[0]=75; w.alive[0]=true;
    w.pos_x[1]=7; w.pos_y[1]=5; w.hp[1]=40; w.alive[1]=true;

    char buffer[256];
    int bytes = writeSave(buffer, w);
    cout << "WORLD_SAVE|version=1|seed=" << w.seed
         << "|hp=" << w.hp[0]
         << "|pos=" << w.pos_x[0] << "," << w.pos_y[0]
         << "|bytes=" << bytes << endl;

    WorldState w2 = {};
    bool ok = readSave(buffer, w2);
    cout << "WORLD_LOAD|version=1|seed=" << w2.seed
         << "|hp=" << w2.hp[0]
         << "|pos=" << w2.pos_x[0] << "," << w2.pos_y[0] << endl;

    bool match = ok && w2.seed==w.seed && w2.hp[0]==w.hp[0]
        && w2.pos_x[0]==w.pos_x[0] && w2.pos_y[0]==w.pos_y[0];
    cout << "ROUND_TRIP|match=" << (match ? "true" : "false") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;
const int MAX_E = 16;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

struct SaveHeader { unsigned int version; unsigned int seed; };
struct SaveData { int player_hp; int player_x; int player_y; };

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
    RNG rng;
    unsigned int seed;
};

int writeSave(char* buf, WorldState& w) {
    int offset = 0;
    SaveHeader hdr = {1, w.seed};
    SaveData data = {w.hp[0], w.pos_x[0], w.pos_y[0]};
    memcpy(buf + offset, &hdr, sizeof(hdr)); offset += sizeof(hdr);
    memcpy(buf + offset, &data, sizeof(data)); offset += sizeof(data);
    return offset;
}

bool readSave(const char* buf, WorldState& w) {
    int offset = 0;
    SaveHeader hdr;
    SaveData data;
    memcpy(&hdr, buf + offset, sizeof(hdr)); offset += sizeof(hdr);
    if (hdr.version != 1) return false;
    memcpy(&data, buf + offset, sizeof(data)); offset += sizeof(data);
    w.seed = hdr.seed;
    rng_seed(w.rng, w.seed);
    w.hp[0] = data.player_hp;
    w.pos_x[0] = data.player_x;
    w.pos_y[0] = data.player_y;
    w.alive[0] = true;
    return true;
}

int main() {
    WorldState w = {};
    w.seed = 99;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=4; w.pos_y[0]=2; w.hp[0]=75; w.alive[0]=true;
    w.pos_x[1]=7; w.pos_y[1]=5; w.hp[1]=40; w.alive[1]=true;

    char buffer[256];
    int bytes = writeSave(buffer, w);
    cout << "WORLD_SAVE|version=1|seed=" << w.seed
         << "|hp=" << w.hp[0]
         << "|pos=" << w.pos_x[0] << "," << w.pos_y[0]
         << "|bytes=" << bytes << endl;

    WorldState w2 = {};
    bool ok = readSave(buffer, w2);
    cout << "WORLD_LOAD|version=1|seed=" << w2.seed
         << "|hp=" << w2.hp[0]
         << "|pos=" << w2.pos_x[0] << "," << w2.pos_y[0] << endl;

    bool match = ok && w2.seed==w.seed && w2.hp[0]==w.hp[0]
        && w2.pos_x[0]==w.pos_x[0] && w2.pos_y[0]==w.pos_y[0];
    cout << "ROUND_TRIP|match=" << (match ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "World saved correctly", expectedOutput: "WORLD_SAVE|version=1|seed=99|hp=75|pos=4,2|bytes=20" },
      { id: "g2", description: "World loaded correctly", expectedOutput: "WORLD_LOAD|version=1|seed=99|hp=75|pos=4,2" },
      { id: "g3", description: "Round trip matches", expectedOutput: "ROUND_TRIP|match=true" },
    ],
    hints: [
      "writeSave creates a SaveHeader and SaveData from WorldState fields, then memcpy both into the buffer.",
      "readSave does the reverse: memcpy from buffer into header and data structs, then push values into WorldState.",
      "After reading, call rng_seed(w.rng, hdr.seed) to restore the RNG state from the saved seed.",
    ],
    estimatedMinutes: 15,
  },
};