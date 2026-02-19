import { Lesson } from "@/types/lesson";

export const lessonRPG63: Lesson = {
  id: "rpg-63-load-migration-rules",
  title: "Load Migration Rules",
  description: "Older save version handled gracefully — read the version, apply migration rules, load as current.",
  order: 63,
  xpReward: 100,
  tier: "pro",
  concepts: ["save migration", "version compatibility", "forward compatibility", "schema evolution", "data upgrade pipeline"],
  part1: {
    title: "Concept: Load Migration Rules",
    type: "concept",
    instructions: `# Load Migration Rules

## Mental Model

Your save format will change. New fields get added — XP, level, quest progress. Old saves don't have those fields. If you reject old saves, the player loses progress. If you load them blindly, you read garbage bytes where the new fields should be. The fix: read the version number first, then apply migration rules that upgrade old data to the current format. Version 1 save? Add default values for the fields introduced in version 2. This is the same pattern every database uses — schema migration.

## What Breaks Without This

You shipped version 1 with 6 payload fields (px, py, hp, gold, seed, turn). Version 2 adds xp and level. A player with a v1 save loads your v2 game. Without migration:

\`\`\`cpp
// v1 save has 6 fields (24 bytes payload)
// v2 code reads 8 fields (32 bytes payload)
// Fields 7-8 read garbage from beyond the v1 payload
memcpy(&xp, buf+offset, sizeof(int));   // reads checksum bytes as xp!
memcpy(&level, buf+offset, sizeof(int)); // reads past buffer!
\`\`\`

The xp value is the checksum reinterpreted as an integer. The level reads past the valid buffer. Undefined behavior. Silent corruption. The player's save is destroyed.

## The Fix: Version-Based Migration

\`\`\`cpp
bool readSave(const char* buf, int buf_size, SaveData& out) {
    SaveHeader hdr;
    memcpy(&hdr, buf, sizeof(SaveHeader));
    int offset = sizeof(SaveHeader);

    // Always read the fields that existed in v1
    memcpy(&out.px, buf+offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.py, buf+offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.hp, buf+offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.gold, buf+offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.seed, buf+offset, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(&out.turn, buf+offset, sizeof(int)); offset += sizeof(int);

    if (hdr.version >= 2) {
        // v2 added xp and level
        memcpy(&out.xp, buf+offset, sizeof(int)); offset += sizeof(int);
        memcpy(&out.level, buf+offset, sizeof(int)); offset += sizeof(int);
    } else {
        // Migration: v1 has no xp or level — use defaults
        out.xp = 0;
        out.level = 1;
    }
    return true;
}
\`\`\`

## Key Concepts

- **Version-gated reads** — check \`hdr.version\` before reading fields that didn't exist in older versions.
- **Default values** — migration supplies sensible defaults for missing fields. XP = 0, level = 1.
- **Forward compatibility** — new code reads old saves. Old code ignores new fields (because it doesn't know about them).
- **Migration pipeline** — v1 → v2 → v3. Each step is one function. Chain them for multi-version jumps.

## Performance Insight

Migration is a one-time cost at load. A v1→v2 migration reads 6 fields and writes 2 defaults — microseconds. Even a 10-step migration chain (v1→v10) is negligible because save data is small (< 1 KB). The real cost is getting it wrong: a corrupted save means a lost player.

## Memory Insight

The \`SaveData\` struct always has the current version's fields. Migration fills in defaults for fields the old save didn't have. No dynamic allocation — the struct is fixed-size on the stack. Old saves just get zero-filled fields that the migration then sets to defaults.

## Your Task

Write a migration function that loads both v1 (6-field) and v2 (8-field) saves. For v1 saves, set xp=0 and level=1 as defaults. Print the migration status and loaded data.

Expected output:
\`\`\`
MIGRATE|from=1|to=2|added=xp,level
LOAD_V1|px=3|py=4|hp=25|gold=40|xp=0|level=1
LOAD_V2|px=5|py=6|hp=30|gold=100|xp=200|level=3
\`\`\`

## Beginner Trap

**Bumping SAVE_VERSION without writing migration code.** You change the constant from 1 to 2 and add new fields to writeSave. Now every existing v1 save is rejected because \`hdr.version != SAVE_VERSION\`. The fix: always check \`hdr.version <= CURRENT_VERSION\` and run migration for older versions.

## Elite Insight

SQLite uses a file format version number in the first 4 bytes of every database file. PostgreSQL runs numbered migration scripts (001_create_users.sql, 002_add_email.sql). Your save migration follows the exact same pattern — version number + ordered upgrade functions. The scale is different; the architecture is identical.

## Systems Thinking Connection

The Space Shooter path uses a flat entity buffer with a version stamp. The RPG path has richer state — inventory, quests, equipment — so migration is more complex. But the principle is the same: version number first, conditional reads second, defaults for missing data third. This is schema evolution — the same concept used by Protocol Buffers, Avro, and every production database.

## Skill Reinforcement

L61 introduced versioned save headers. L62 added checksums for integrity. This lesson completes the save system triad: versioning, integrity, and migration. L64 will shift from save/load to replay logging — recording inputs for determinism verification.

## Mastery Check

Question: Why does migration assign \`level = 1\` instead of \`level = 0\` for v1 saves?
Answer: Because the player existed and played in v1 — they have HP, gold, and a position. They're clearly past character creation. Level 0 would mean "hasn't started yet" which contradicts their existing state. Level 1 is the minimum valid state for an active player.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_BUF_SIZE = 256;
struct SaveHeader { int version; int data_size; };
struct SaveData { int px, py, hp, gold; unsigned int seed; int turn; int xp, level; };

unsigned int computeChecksum(const char* data, int size) {
    unsigned int sum = 0;
    for (int i = 0; i < size; i++) { sum += (unsigned char)data[i]; sum = (sum << 3) | (sum >> 29); }
    return sum;
}

void writeSaveV1(char* buf, int& used, int px, int py, int hp, int gold, unsigned int seed, int turn) {
    int offset = 0;
    SaveHeader hdr = {1, 6 * (int)sizeof(int)};
    memcpy(buf + offset, &hdr, sizeof(SaveHeader)); offset += sizeof(SaveHeader);
    int ps = offset;
    memcpy(buf + offset, &px, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &py, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &hp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &gold, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &seed, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(buf + offset, &turn, sizeof(int)); offset += sizeof(int);
    unsigned int chk = computeChecksum(buf + ps, offset - ps);
    memcpy(buf + offset, &chk, sizeof(unsigned int)); offset += sizeof(unsigned int);
    used = offset;
}

void writeSaveV2(char* buf, int& used, int px, int py, int hp, int gold, unsigned int seed, int turn, int xp, int level) {
    int offset = 0;
    SaveHeader hdr = {2, 8 * (int)sizeof(int)};
    memcpy(buf + offset, &hdr, sizeof(SaveHeader)); offset += sizeof(SaveHeader);
    int ps = offset;
    memcpy(buf + offset, &px, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &py, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &hp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &gold, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &seed, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(buf + offset, &turn, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &xp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &level, sizeof(int)); offset += sizeof(int);
    unsigned int chk = computeChecksum(buf + ps, offset - ps);
    memcpy(buf + offset, &chk, sizeof(unsigned int)); offset += sizeof(unsigned int);
    used = offset;
}

// TODO: Implement loadWithMigration
// 1. Read SaveHeader
// 2. Read the 6 fields that exist in both v1 and v2
// 3. If version >= 2, read xp and level from buffer
//    If version == 1, set xp = 0 and level = 1 (migration defaults)
// 4. Print MIGRATE line if version < 2
// 5. Return true
bool loadWithMigration(const char* buf, int buf_size, SaveData& out) {
    // Your code here
    return false;
}

int main() {
    char buf1[SAVE_BUF_SIZE], buf2[SAVE_BUF_SIZE];
    int used1 = 0, used2 = 0;

    writeSaveV1(buf1, used1, 3, 4, 25, 40, 42u, 10);
    writeSaveV2(buf2, used2, 5, 6, 30, 100, 99u, 20, 200, 3);

    SaveData d1 = {}, d2 = {};
    loadWithMigration(buf1, used1, d1);
    cout << "LOAD_V1|px=" << d1.px << "|py=" << d1.py << "|hp=" << d1.hp
         << "|gold=" << d1.gold << "|xp=" << d1.xp << "|level=" << d1.level << endl;

    loadWithMigration(buf2, used2, d2);
    cout << "LOAD_V2|px=" << d2.px << "|py=" << d2.py << "|hp=" << d2.hp
         << "|gold=" << d2.gold << "|xp=" << d2.xp << "|level=" << d2.level << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_BUF_SIZE = 256;
struct SaveHeader { int version; int data_size; };
struct SaveData { int px, py, hp, gold; unsigned int seed; int turn; int xp, level; };

unsigned int computeChecksum(const char* data, int size) {
    unsigned int sum = 0;
    for (int i = 0; i < size; i++) { sum += (unsigned char)data[i]; sum = (sum << 3) | (sum >> 29); }
    return sum;
}

void writeSaveV1(char* buf, int& used, int px, int py, int hp, int gold, unsigned int seed, int turn) {
    int offset = 0;
    SaveHeader hdr = {1, 6 * (int)sizeof(int)};
    memcpy(buf + offset, &hdr, sizeof(SaveHeader)); offset += sizeof(SaveHeader);
    int ps = offset;
    memcpy(buf + offset, &px, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &py, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &hp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &gold, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &seed, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(buf + offset, &turn, sizeof(int)); offset += sizeof(int);
    unsigned int chk = computeChecksum(buf + ps, offset - ps);
    memcpy(buf + offset, &chk, sizeof(unsigned int)); offset += sizeof(unsigned int);
    used = offset;
}

void writeSaveV2(char* buf, int& used, int px, int py, int hp, int gold, unsigned int seed, int turn, int xp, int level) {
    int offset = 0;
    SaveHeader hdr = {2, 8 * (int)sizeof(int)};
    memcpy(buf + offset, &hdr, sizeof(SaveHeader)); offset += sizeof(SaveHeader);
    int ps = offset;
    memcpy(buf + offset, &px, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &py, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &hp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &gold, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &seed, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(buf + offset, &turn, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &xp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &level, sizeof(int)); offset += sizeof(int);
    unsigned int chk = computeChecksum(buf + ps, offset - ps);
    memcpy(buf + offset, &chk, sizeof(unsigned int)); offset += sizeof(unsigned int);
    used = offset;
}

bool loadWithMigration(const char* buf, int buf_size, SaveData& out) {
    if (buf_size < (int)sizeof(SaveHeader)) return false;
    SaveHeader hdr;
    memcpy(&hdr, buf, sizeof(SaveHeader));
    int offset = sizeof(SaveHeader);
    memcpy(&out.px, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.py, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.hp, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.gold, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.seed, buf + offset, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(&out.turn, buf + offset, sizeof(int)); offset += sizeof(int);
    if (hdr.version >= 2) {
        memcpy(&out.xp, buf + offset, sizeof(int)); offset += sizeof(int);
        memcpy(&out.level, buf + offset, sizeof(int)); offset += sizeof(int);
    } else {
        out.xp = 0;
        out.level = 1;
        cout << "MIGRATE|from=" << hdr.version << "|to=2|added=xp,level" << endl;
    }
    return true;
}

int main() {
    char buf1[SAVE_BUF_SIZE], buf2[SAVE_BUF_SIZE];
    int used1 = 0, used2 = 0;

    writeSaveV1(buf1, used1, 3, 4, 25, 40, 42u, 10);
    writeSaveV2(buf2, used2, 5, 6, 30, 100, 99u, 20, 200, 3);

    SaveData d1 = {}, d2 = {};
    loadWithMigration(buf1, used1, d1);
    cout << "LOAD_V1|px=" << d1.px << "|py=" << d1.py << "|hp=" << d1.hp
         << "|gold=" << d1.gold << "|xp=" << d1.xp << "|level=" << d1.level << endl;

    loadWithMigration(buf2, used2, d2);
    cout << "LOAD_V2|px=" << d2.px << "|py=" << d2.py << "|hp=" << d2.hp
         << "|gold=" << d2.gold << "|xp=" << d2.xp << "|level=" << d2.level << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "V1 migration triggered", expectedOutput: "MIGRATE|from=1|to=2|added=xp,level", isPattern: false },
      { id: "t2", description: "V1 loads with defaults", expectedOutput: "LOAD_V1|px=3|py=4|hp=25|gold=40|xp=0|level=1", isPattern: false },
      { id: "t3", description: "V2 loads native fields", expectedOutput: "LOAD_V2|px=5|py=6|hp=30|gold=100|xp=200|level=3", isPattern: false },
    ],
    hints: [
      "Read SaveHeader first to get the version number. Then branch: if version >= 2, read all 8 fields. If version == 1, read 6 fields and set xp=0, level=1.",
      "Print the MIGRATE line only when hdr.version < 2. V2 saves need no migration.",
      "The memcpy pattern is the same as L62 — read each field sequentially from the buffer at increasing offsets.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Save Migration Pipeline",
    type: "game_builder",
    instructions: `# Build: Save Migration Pipeline

## Mental Model

A real game ships multiple save format versions over its lifetime. Version 1 had basic state. Version 2 added XP and level. Version 3 will add quest progress. Each version upgrade is a single function: \`migrate_v1_to_v2\`, \`migrate_v2_to_v3\`. Loading a v1 save in v3 code chains both migrations. The save always arrives at the current format before the game uses it.

## What Breaks Without This

Without a migration pipeline, you need one giant loader function with deeply nested version checks. Every new field adds another branch. By version 5, the loader is 200 lines of spaghetti. With a pipeline, each migration function is 5–10 lines. Clean, testable, composable.

## The Fix: Chained Migration Functions

Each migration upgrades the SaveData struct by one version:

\`\`\`cpp
void migrate_v1_to_v2(SaveData& d) {
    d.xp = 0;
    d.level = 1;
}

void migrate_v2_to_v3(SaveData& d) {
    d.quest_flags = 0;
}

void applyMigrations(SaveData& d, int from_version) {
    if (from_version < 2) migrate_v1_to_v2(d);
    if (from_version < 3) migrate_v2_to_v3(d);
}
\`\`\`

## Key Concepts

- **Chained migrations** — each function handles exactly one version bump.
- **Pipeline order** — migrations run in version order: v1→v2, then v2→v3. Never skip steps.
- **Default fill** — migration writes sensible defaults for fields the old version didn't have.
- **Version stamp on write** — writeSave always writes CURRENT_VERSION. Migrations only happen on read.

## Performance Insight

Migration runs once per load. Even chaining 10 migrations is nanoseconds — each one writes 1–3 fields. The entire pipeline is O(version_gap × fields_per_step), where both factors are small. Zero runtime cost during gameplay.

## Memory Insight

SaveData is the current version's struct — always the largest. Migration fills in the fields that older versions lacked. No temporary buffers needed. The struct is on the stack. Total overhead: zero heap, zero allocation.

## Your Task

Build a 3-version migration pipeline. Load saves from v1, v2, and v3. Each version adds fields. The pipeline chains migrations so any version loads correctly.

Expected output:
\`\`\`
DUNGEON|rpg-v0
SAVE_V1|writing
SAVE_V2|writing
SAVE_V3|writing
LOAD|v1|migrate_v1_to_v2|migrate_v2_to_v3
RESULT|v1|px=3|py=4|hp=25|gold=40|xp=0|level=1|quest_flags=0
LOAD|v2|migrate_v2_to_v3
RESULT|v2|px=5|py=6|hp=30|gold=100|xp=200|level=3|quest_flags=0
LOAD|v3|no_migration
RESULT|v3|px=7|py=8|hp=50|gold=500|xp=800|level=5|quest_flags=7
GRID_ROW|0|##########
GRID_ROW|1|#.@......#
GRID_ROW|2|#........#
GRID_ROW|3|#........#
GRID_ROW|4|#........#
GRID_ROW|5|#........#
GRID_ROW|6|#........#
GRID_ROW|7|#........#
GRID_ROW|8|#........#
GRID_ROW|9|##########
TURN|0
HP|25
GOLD|40
XP|0
LEVEL|1
GAME_MESSAGE|V1 save migrated and loaded.
\`\`\`

## Beginner Trap

**Writing version-specific write functions for every old version.** You only need one writeSave that always writes CURRENT_VERSION. Migration happens on read, not write. If you maintain writeSaveV1, writeSaveV2, writeSaveV3 in production code, you're duplicating logic that should be deleted after testing.

## Elite Insight

Dwarf Fortress has maintained save compatibility across 20+ years of development. The save format has migrated hundreds of times. Each migration is a small function that fills in defaults for newly added fields. Your 3-version pipeline follows the exact same pattern — at hobby scale, the same engineering principle applies.

## Mastery Check

Question: If you add version 4 with a new \`armor\` field, what changes?
Answer: Add one function \`migrate_v3_to_v4(SaveData& d) { d.armor = 0; }\` and one line in \`applyMigrations\`: \`if (from_version < 4) migrate_v3_to_v4(d);\`. Existing migrations are untouched. The pipeline extends linearly.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_BUF_SIZE = 256;
const int CURRENT_VERSION = 3;
const int W = 10, H = 10, TILE = 24;

struct SaveHeader { int version; int data_size; };
struct SaveData {
    int px, py, hp, gold;
    unsigned int seed;
    int turn;
    int xp, level;       // added in v2
    int quest_flags;      // added in v3
};

unsigned int computeChecksum(const char* data, int size) {
    unsigned int sum = 0;
    for (int i = 0; i < size; i++) { sum += (unsigned char)data[i]; sum = (sum << 3) | (sum >> 29); }
    return sum;
}

void writeSave(char* buf, int& used, int version, const SaveData& d) {
    int offset = 0;
    int field_count = (version == 1) ? 6 : (version == 2) ? 8 : 9;
    SaveHeader hdr = {version, field_count * (int)sizeof(int)};
    memcpy(buf + offset, &hdr, sizeof(SaveHeader)); offset += sizeof(SaveHeader);
    int ps = offset;
    memcpy(buf + offset, &d.px, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.py, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.hp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.gold, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.seed, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(buf + offset, &d.turn, sizeof(int)); offset += sizeof(int);
    if (version >= 2) {
        memcpy(buf + offset, &d.xp, sizeof(int)); offset += sizeof(int);
        memcpy(buf + offset, &d.level, sizeof(int)); offset += sizeof(int);
    }
    if (version >= 3) {
        memcpy(buf + offset, &d.quest_flags, sizeof(int)); offset += sizeof(int);
    }
    unsigned int chk = computeChecksum(buf + ps, offset - ps);
    memcpy(buf + offset, &chk, sizeof(unsigned int)); offset += sizeof(unsigned int);
    used = offset;
    cout << "SAVE_V" << version << "|writing" << endl;
}

// TODO: implement migrate_v1_to_v2(SaveData& d)
// Sets xp = 0 and level = 1

// TODO: implement migrate_v2_to_v3(SaveData& d)
// Sets quest_flags = 0

// TODO: implement applyMigrations(SaveData& d, int from_version)
// Chain: if from < 2, run v1_to_v2. If from < 3, run v2_to_v3.
// Print LOAD|vN|migration_list or LOAD|vN|no_migration

bool loadWithMigration(const char* buf, int buf_size, SaveData& out) {
    if (buf_size < (int)sizeof(SaveHeader)) return false;
    SaveHeader hdr;
    memcpy(&hdr, buf, sizeof(SaveHeader));
    int offset = sizeof(SaveHeader);
    memcpy(&out.px, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.py, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.hp, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.gold, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.seed, buf + offset, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(&out.turn, buf + offset, sizeof(int)); offset += sizeof(int);
    if (hdr.version >= 2) {
        memcpy(&out.xp, buf + offset, sizeof(int)); offset += sizeof(int);
        memcpy(&out.level, buf + offset, sizeof(int)); offset += sizeof(int);
    }
    if (hdr.version >= 3) {
        memcpy(&out.quest_flags, buf + offset, sizeof(int)); offset += sizeof(int);
    }
    // TODO: call applyMigrations(out, hdr.version)
    return true;
}

int main() {
    cout << "DUNGEON|rpg-v0" << endl;

    char buf1[SAVE_BUF_SIZE], buf2[SAVE_BUF_SIZE], buf3[SAVE_BUF_SIZE];
    int u1 = 0, u2 = 0, u3 = 0;

    SaveData d1w = {3, 4, 25, 40, 42u, 10, 0, 0, 0};
    SaveData d2w = {5, 6, 30, 100, 99u, 20, 200, 3, 0};
    SaveData d3w = {7, 8, 50, 500, 77u, 30, 800, 5, 7};

    writeSave(buf1, u1, 1, d1w);
    writeSave(buf2, u2, 2, d2w);
    writeSave(buf3, u3, 3, d3w);

    SaveData r1 = {}, r2 = {}, r3 = {};
    loadWithMigration(buf1, u1, r1);
    cout << "RESULT|v1|px=" << r1.px << "|py=" << r1.py << "|hp=" << r1.hp
         << "|gold=" << r1.gold << "|xp=" << r1.xp << "|level=" << r1.level
         << "|quest_flags=" << r1.quest_flags << endl;

    loadWithMigration(buf2, u2, r2);
    cout << "RESULT|v2|px=" << r2.px << "|py=" << r2.py << "|hp=" << r2.hp
         << "|gold=" << r2.gold << "|xp=" << r2.xp << "|level=" << r2.level
         << "|quest_flags=" << r2.quest_flags << endl;

    loadWithMigration(buf3, u3, r3);
    cout << "RESULT|v3|px=" << r3.px << "|py=" << r3.py << "|hp=" << r3.hp
         << "|gold=" << r3.gold << "|xp=" << r3.xp << "|level=" << r3.level
         << "|quest_flags=" << r3.quest_flags << endl;

    // Render grid with v1-migrated player
    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }
    grid[r1.py][r1.px] = '@';

    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }
    cout << "TURN|0" << endl;
    cout << "HP|" << r1.hp << endl;
    cout << "GOLD|" << r1.gold << endl;
    cout << "XP|" << r1.xp << endl;
    cout << "LEVEL|" << r1.level << endl;
    cout << "GAME_MESSAGE|V1 save migrated and loaded." << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int SAVE_BUF_SIZE = 256;
const int CURRENT_VERSION = 3;
const int W = 10, H = 10, TILE = 24;

struct SaveHeader { int version; int data_size; };
struct SaveData {
    int px, py, hp, gold;
    unsigned int seed;
    int turn;
    int xp, level;
    int quest_flags;
};

unsigned int computeChecksum(const char* data, int size) {
    unsigned int sum = 0;
    for (int i = 0; i < size; i++) { sum += (unsigned char)data[i]; sum = (sum << 3) | (sum >> 29); }
    return sum;
}

void writeSave(char* buf, int& used, int version, const SaveData& d) {
    int offset = 0;
    int field_count = (version == 1) ? 6 : (version == 2) ? 8 : 9;
    SaveHeader hdr = {version, field_count * (int)sizeof(int)};
    memcpy(buf + offset, &hdr, sizeof(SaveHeader)); offset += sizeof(SaveHeader);
    int ps = offset;
    memcpy(buf + offset, &d.px, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.py, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.hp, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.gold, sizeof(int)); offset += sizeof(int);
    memcpy(buf + offset, &d.seed, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(buf + offset, &d.turn, sizeof(int)); offset += sizeof(int);
    if (version >= 2) {
        memcpy(buf + offset, &d.xp, sizeof(int)); offset += sizeof(int);
        memcpy(buf + offset, &d.level, sizeof(int)); offset += sizeof(int);
    }
    if (version >= 3) {
        memcpy(buf + offset, &d.quest_flags, sizeof(int)); offset += sizeof(int);
    }
    unsigned int chk = computeChecksum(buf + ps, offset - ps);
    memcpy(buf + offset, &chk, sizeof(unsigned int)); offset += sizeof(unsigned int);
    used = offset;
    cout << "SAVE_V" << version << "|writing" << endl;
}

void migrate_v1_to_v2(SaveData& d) {
    d.xp = 0;
    d.level = 1;
}

void migrate_v2_to_v3(SaveData& d) {
    d.quest_flags = 0;
}

void applyMigrations(SaveData& d, int from_version) {
    if (from_version == CURRENT_VERSION) {
        cout << "LOAD|v" << from_version << "|no_migration" << endl;
        return;
    }
    cout << "LOAD|v" << from_version << "|";
    bool first = true;
    if (from_version < 2) {
        migrate_v1_to_v2(d);
        if (!first) cout << "|";
        cout << "migrate_v1_to_v2";
        first = false;
    }
    if (from_version < 3) {
        migrate_v2_to_v3(d);
        if (!first) cout << "|";
        cout << "migrate_v2_to_v3";
        first = false;
    }
    cout << endl;
}

bool loadWithMigration(const char* buf, int buf_size, SaveData& out) {
    if (buf_size < (int)sizeof(SaveHeader)) return false;
    SaveHeader hdr;
    memcpy(&hdr, buf, sizeof(SaveHeader));
    int offset = sizeof(SaveHeader);
    memcpy(&out.px, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.py, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.hp, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.gold, buf + offset, sizeof(int)); offset += sizeof(int);
    memcpy(&out.seed, buf + offset, sizeof(unsigned int)); offset += sizeof(unsigned int);
    memcpy(&out.turn, buf + offset, sizeof(int)); offset += sizeof(int);
    if (hdr.version >= 2) {
        memcpy(&out.xp, buf + offset, sizeof(int)); offset += sizeof(int);
        memcpy(&out.level, buf + offset, sizeof(int)); offset += sizeof(int);
    }
    if (hdr.version >= 3) {
        memcpy(&out.quest_flags, buf + offset, sizeof(int)); offset += sizeof(int);
    }
    applyMigrations(out, hdr.version);
    return true;
}

int main() {
    cout << "DUNGEON|rpg-v0" << endl;

    char buf1[SAVE_BUF_SIZE], buf2[SAVE_BUF_SIZE], buf3[SAVE_BUF_SIZE];
    int u1 = 0, u2 = 0, u3 = 0;

    SaveData d1w = {3, 4, 25, 40, 42u, 10, 0, 0, 0};
    SaveData d2w = {5, 6, 30, 100, 99u, 20, 200, 3, 0};
    SaveData d3w = {7, 8, 50, 500, 77u, 30, 800, 5, 7};

    writeSave(buf1, u1, 1, d1w);
    writeSave(buf2, u2, 2, d2w);
    writeSave(buf3, u3, 3, d3w);

    SaveData r1 = {}, r2 = {}, r3 = {};
    loadWithMigration(buf1, u1, r1);
    cout << "RESULT|v1|px=" << r1.px << "|py=" << r1.py << "|hp=" << r1.hp
         << "|gold=" << r1.gold << "|xp=" << r1.xp << "|level=" << r1.level
         << "|quest_flags=" << r1.quest_flags << endl;

    loadWithMigration(buf2, u2, r2);
    cout << "RESULT|v2|px=" << r2.px << "|py=" << r2.py << "|hp=" << r2.hp
         << "|gold=" << r2.gold << "|xp=" << r2.xp << "|level=" << r2.level
         << "|quest_flags=" << r2.quest_flags << endl;

    loadWithMigration(buf3, u3, r3);
    cout << "RESULT|v3|px=" << r3.px << "|py=" << r3.py << "|hp=" << r3.hp
         << "|gold=" << r3.gold << "|xp=" << r3.xp << "|level=" << r3.level
         << "|quest_flags=" << r3.quest_flags << endl;

    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }
    grid[r1.py][r1.px] = '@';

    for (int y = 0; y < H; y++) {
        cout << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }
    cout << "TURN|0" << endl;
    cout << "HP|" << r1.hp << endl;
    cout << "GOLD|" << r1.gold << endl;
    cout << "XP|" << r1.xp << endl;
    cout << "LEVEL|" << r1.level << endl;
    cout << "GAME_MESSAGE|V1 save migrated and loaded." << endl;

    return 0;
}`,
    tests: [
      { id: "g1", description: "V1 migration chain", expectedOutput: "LOAD|v1|migrate_v1_to_v2|migrate_v2_to_v3", isPattern: false },
      { id: "g2", description: "V1 result has defaults", expectedOutput: "RESULT|v1|px=3|py=4|hp=25|gold=40|xp=0|level=1|quest_flags=0", isPattern: false },
      { id: "g3", description: "V2 migration runs one step", expectedOutput: "LOAD|v2|migrate_v2_to_v3", isPattern: false },
      { id: "g4", description: "V3 no migration", expectedOutput: "LOAD|v3|no_migration", isPattern: false },
      { id: "g5", description: "V3 result native", expectedOutput: "RESULT|v3|px=7|py=8|hp=50|gold=500|xp=800|level=5|quest_flags=7", isPattern: false },
      { id: "g6", description: "Game message", expectedOutput: "GAME_MESSAGE|V1 save migrated and loaded.", isPattern: false },
    ],
    hints: [
      "migrate_v1_to_v2 sets xp=0 and level=1. migrate_v2_to_v3 sets quest_flags=0. Each is 2-3 lines.",
      "applyMigrations chains: if from < 2 run v1_to_v2, if from < 3 run v2_to_v3. Print the names of migrations applied.",
      "For the LOAD line, concatenate migration names with | separator. If no migration needed, print no_migration.",
    ],
    estimatedMinutes: 15,
  },
};