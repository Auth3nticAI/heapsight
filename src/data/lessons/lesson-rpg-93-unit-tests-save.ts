import { Lesson } from "@/types/lesson";

export const lessonRPG93: Lesson = {
  id: "rpg-93-unit-tests-save",
  title: "Unit Tests: Save",
  description: "Automated save/load verification. Write, read back, verify all fields match.",
  order: 93,
  xpReward: 100,
  tier: "pro",
  concepts: ["save testing", "round-trip verification", "corruption detection", "serialization testing", "test_save.cpp"],
  part1: {
    title: "Concept: Unit Tests for Save/Load",
    type: "concept",
    instructions: `# Unit Tests: Save/Load

## Mental Model

Serialization is the most fragile system in your game. One misaligned field, one wrong byte order, one missing checksum update — and the player loses hours of progress. A round-trip test (write — read — compare) catches these bugs before they reach players.

The save system was built in Lessons 24 and 61-63. Now we prove it works with automated tests.

## What Breaks Without This

\`\`\`cpp
// Someone adds a field to SaveData but forgets to update load()
struct SaveData {
    int player_hp;
    int player_gold;
    int room_id;
    int player_level;  // NEW! but load() doesn't read it
};
// Save writes 4 fields. Load reads 3. player_level is garbage.
// Player thinks they're level 1 again. Rage quit.
\`\`\`

A round-trip test catches this immediately: save writes all fields, load reads them back, comparison finds the mismatch.

## The Fix: Round-Trip and Corruption Tests

Two test categories:

**Round-trip test:** Write known data to a buffer, read it back, compare every field. If any field differs, the test fails.

\`\`\`cpp
bool testSaveRoundTrip() {
    SaveData original = {50, 100, 3, 1337};
    unsigned char buf[256];
    int len = saveToBuf(original, buf, 256);
    SaveData loaded = {};
    loadFromBuf(loaded, buf, len);
    return original.player_hp == loaded.player_hp
        && original.player_gold == loaded.player_gold
        && original.room_id == loaded.room_id
        && original.seed == loaded.seed;
}
\`\`\`

**Corruption test:** Flip a byte in the buffer, attempt to load, verify the checksum catches it.

## Key Concepts

- **Round-trip test** — write then read, compare all fields. The simplest serialization test.
- **Corruption detection** — mutate the buffer, verify load detects the error.
- **Field-by-field comparison** — compare each field individually for precise error messages.
- **Buffer-based testing** — test serialization to memory, not files. Faster, no filesystem side effects.

## Performance Insight

Buffer-based save/load tests run in nanoseconds — no disk I/O. You can run hundreds of round-trip tests per second without touching the filesystem. Tests should never be slow enough to skip.

## Memory Insight

The test buffer is a stack-allocated unsigned char array. SaveData is a POD struct — no heap, no constructors. The entire test runs without a single allocation. This is how systems engineers test: stack-local, deterministic, instant.

## Beginner Trap

**Only testing that load doesn't crash:**

\`\`\`cpp
// BAD: "it loaded without crashing" is not a test
loadFromBuf(data, buf, len);
cout << "PASS";  // you didn't verify ANY fields!
\`\`\`

A load that returns garbage without crashing is worse than a crash — it's a silent data corruption bug. Always compare every field.

## Elite Insight

Diablo 2's save file format has been reverse-engineered exhaustively because the community discovered field alignment bugs that Blizzard's tests missed. Baldur's Gate's save system uses checksums that were added after players discovered they could hex-edit saves. FromSoftware's Dark Souls uses save integrity checks that verify the entire save structure — a single corrupted byte triggers a "save data is corrupted" warning.

## Systems Thinking Connection

Save round-trip testing is the RPG equivalent of the Robotics path's rosbag record/playback tests. Both verify that data survives serialization intact: save/load for game state, rosbag for sensor data.

## Skill Reinforcement

Builds on Lesson 24 (Save File v0), Lesson 61 (Versioned Save), and Lesson 62 (Checksum). Feeds into Lesson 95 (Gate C) and Lesson 99 (Release Checklist) where all tests must pass.

## Mastery Check

**Q:** Why test with a memory buffer instead of writing to a file?
**A:** Buffer tests are faster (no disk I/O), have no filesystem side effects (no temp files to clean up), and are deterministic (no file permission issues). The serialization logic is identical — only the destination changes.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

struct SaveData { int player_hp; int player_gold; int room_id; unsigned int seed; };

int saveToBuf(const SaveData& d, unsigned char* buf, int max_len) {
    if (max_len < (int)sizeof(SaveData)) return -1;
    memcpy(buf, &d, sizeof(SaveData));
    return sizeof(SaveData);
}

bool loadFromBuf(SaveData& d, const unsigned char* buf, int len) {
    if (len < (int)sizeof(SaveData)) return false;
    memcpy(&d, buf, sizeof(SaveData));
    return true;
}

// TODO: bool testSaveRoundTrip() — save then load, compare all 4 fields
// TODO: bool testCorruptionDetection() — flip a byte, check that data differs

int main() {
    // TODO: run both tests, print PASS/FAIL for each
    // TEST_SAVE_ROUNDTRIP|PASS
    // TEST_CORRUPTION_DETECT|PASS
    // SAVE_TESTS|all_passed
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

struct SaveData { int player_hp; int player_gold; int room_id; unsigned int seed; };

int saveToBuf(const SaveData& d, unsigned char* buf, int max_len) {
    if (max_len < (int)sizeof(SaveData)) return -1;
    memcpy(buf, &d, sizeof(SaveData));
    return sizeof(SaveData);
}

bool loadFromBuf(SaveData& d, const unsigned char* buf, int len) {
    if (len < (int)sizeof(SaveData)) return false;
    memcpy(&d, buf, sizeof(SaveData));
    return true;
}

bool testSaveRoundTrip() {
    SaveData original = {50, 100, 3, 1337};
    unsigned char buf[256];
    int len = saveToBuf(original, buf, 256);
    if (len < 0) return false;
    SaveData loaded = {};
    if (!loadFromBuf(loaded, buf, len)) return false;
    return original.player_hp == loaded.player_hp
        && original.player_gold == loaded.player_gold
        && original.room_id == loaded.room_id
        && original.seed == loaded.seed;
}

bool testCorruptionDetection() {
    SaveData original = {50, 100, 3, 1337};
    unsigned char buf[256];
    int len = saveToBuf(original, buf, 256);
    if (len < 0) return false;
    buf[0] ^= 0xFF;  // flip first byte
    SaveData loaded = {};
    loadFromBuf(loaded, buf, len);
    return loaded.player_hp != original.player_hp;  // must differ
}

int main() {
    bool rt = testSaveRoundTrip();
    cout << "TEST_SAVE_ROUNDTRIP|" << (rt ? "PASS" : "FAIL") << endl;
    bool cd = testCorruptionDetection();
    cout << "TEST_CORRUPTION_DETECT|" << (cd ? "PASS" : "FAIL") << endl;
    bool all = rt && cd;
    cout << "SAVE_TESTS|" << (all ? "all_passed" : "some_failed") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Round-trip test passes", expectedOutput: "TEST_SAVE_ROUNDTRIP|PASS", isPattern: false },
      { id: "t2", description: "Corruption detected", expectedOutput: "TEST_CORRUPTION_DETECT|PASS", isPattern: false },
      { id: "t3", description: "All save tests passed", expectedOutput: "SAVE_TESTS|all_passed", isPattern: false },
    ],
    hints: [
      "testSaveRoundTrip writes known data to a buffer, reads it back, and compares each field.",
      "testCorruptionDetection flips a byte with XOR (buf[0] ^= 0xFF), then checks that loaded data differs.",
      "Both functions return bool. Print PASS/FAIL using ternary: (result ? \"PASS\" : \"FAIL\")",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Save Test Suite",
    type: "game_builder",
    instructions: `# Build: Save Test Suite

## Mental Model

A save test suite verifies the entire serialization pipeline: write, read, compare, and corruption detection. Every field must survive the round trip. Every corrupted byte must be caught.

## What Breaks Without This

A player saves their game after 3 hours. They close the game, come back, load — and their inventory is empty. The save file looks fine (no crash), but the inventory fields were silently zeroed because someone changed the struct layout without updating the serializer.

## Your Task

Build a complete save test suite with three tests:

1. **testSaveRoundTrip()** — save {hp=50, gold=100, room=3, seed=1337}, load, compare all fields
2. **testCorruptionDetection()** — save, flip byte 0, load, verify data changed
3. **testEmptySave()** — save {hp=0, gold=0, room=0, seed=0}, load, verify zeroes survive

**Expected output:**
\`\`\`
TEST_SAVE_ROUNDTRIP|PASS
TEST_CORRUPTION_DETECT|PASS
TEST_EMPTY_SAVE|PASS
SAVE_SUITE|3/3|all_passed
\`\`\`

## Performance Insight

Buffer-based tests avoid disk I/O entirely. A 256-byte buffer on the stack, memcpy in and out — the entire test completes in nanoseconds.

## Memory Insight

SaveData is a POD struct. memcpy handles serialization. The buffer is stack-allocated. No heap, no cleanup, no constructors. This is the simplest possible serialization — and the simplest to test.

## Beginner Trap

**Forgetting to test zero values:**

\`\`\`cpp
// BAD: only tests non-zero values
SaveData d = {50, 100, 3, 1337};  // all non-zero, easy to pass

// GOOD: also test zeroes — zero is a valid value that must survive
SaveData d = {0, 0, 0, 0};  // zeroes must load as zeroes, not garbage
\`\`\`

Zero is the most dangerous value in serialization. It looks like "uninitialized" — a round-trip test with zeroes catches missing initialization bugs.

## Elite Insight

Baldur's Gate 3 ships with over 10,000 automated tests, many of which are save/load round-trip tests for their massive game state. Larian Studios learned from BG1/BG2 where save corruption was a known issue. Nintendo's save testing is legendary — every Animal Crossing save goes through regression tests that verify fields survive thousands of simulated play sessions.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

struct SaveData { int player_hp; int player_gold; int room_id; unsigned int seed; };

int saveToBuf(const SaveData& d, unsigned char* buf, int max_len) {
    if (max_len < (int)sizeof(SaveData)) return -1;
    memcpy(buf, &d, sizeof(SaveData));
    return sizeof(SaveData);
}

bool loadFromBuf(SaveData& d, const unsigned char* buf, int len) {
    if (len < (int)sizeof(SaveData)) return false;
    memcpy(&d, buf, sizeof(SaveData));
    return true;
}

// TODO: bool testSaveRoundTrip()
// TODO: bool testCorruptionDetection()
// TODO: bool testEmptySave()

int main() {
    int passed = 0;
    // TODO: run all 3 tests, print PASS/FAIL, count passes
    // TODO: print SAVE_SUITE|3/3|all_passed
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

struct SaveData { int player_hp; int player_gold; int room_id; unsigned int seed; };

int saveToBuf(const SaveData& d, unsigned char* buf, int max_len) {
    if (max_len < (int)sizeof(SaveData)) return -1;
    memcpy(buf, &d, sizeof(SaveData));
    return sizeof(SaveData);
}

bool loadFromBuf(SaveData& d, const unsigned char* buf, int len) {
    if (len < (int)sizeof(SaveData)) return false;
    memcpy(&d, buf, sizeof(SaveData));
    return true;
}

bool testSaveRoundTrip() {
    SaveData original = {50, 100, 3, 1337};
    unsigned char buf[256];
    int len = saveToBuf(original, buf, 256);
    if (len < 0) return false;
    SaveData loaded = {};
    if (!loadFromBuf(loaded, buf, len)) return false;
    return original.player_hp == loaded.player_hp
        && original.player_gold == loaded.player_gold
        && original.room_id == loaded.room_id
        && original.seed == loaded.seed;
}

bool testCorruptionDetection() {
    SaveData original = {50, 100, 3, 1337};
    unsigned char buf[256];
    int len = saveToBuf(original, buf, 256);
    if (len < 0) return false;
    buf[0] ^= 0xFF;
    SaveData loaded = {};
    loadFromBuf(loaded, buf, len);
    return loaded.player_hp != original.player_hp;
}

bool testEmptySave() {
    SaveData original = {0, 0, 0, 0};
    unsigned char buf[256];
    int len = saveToBuf(original, buf, 256);
    if (len < 0) return false;
    SaveData loaded = {99, 99, 99, 99};
    if (!loadFromBuf(loaded, buf, len)) return false;
    return loaded.player_hp == 0
        && loaded.player_gold == 0
        && loaded.room_id == 0
        && loaded.seed == 0;
}

int main() {
    int passed = 0;
    bool rt = testSaveRoundTrip();
    cout << "TEST_SAVE_ROUNDTRIP|" << (rt ? "PASS" : "FAIL") << endl;
    if (rt) passed++;
    bool cd = testCorruptionDetection();
    cout << "TEST_CORRUPTION_DETECT|" << (cd ? "PASS" : "FAIL") << endl;
    if (cd) passed++;
    bool es = testEmptySave();
    cout << "TEST_EMPTY_SAVE|" << (es ? "PASS" : "FAIL") << endl;
    if (es) passed++;
    cout << "SAVE_SUITE|" << passed << "/3|" << (passed==3 ? "all_passed" : "some_failed") << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Round-trip passes", expectedOutput: "TEST_SAVE_ROUNDTRIP|PASS", isPattern: false },
      { id: "g2", description: "Corruption detected", expectedOutput: "TEST_CORRUPTION_DETECT|PASS", isPattern: false },
      { id: "g3", description: "Empty save round-trips", expectedOutput: "TEST_EMPTY_SAVE|PASS", isPattern: false },
      { id: "g4", description: "Suite summary", expectedOutput: "SAVE_SUITE|3/3|all_passed", isPattern: false },
    ],
    hints: [
      "testSaveRoundTrip writes {50, 100, 3, 1337} to a buffer and reads back. Compare all 4 fields.",
      "testCorruptionDetection: after saveToBuf, do buf[0] ^= 0xFF, then loadFromBuf. Verify loaded.player_hp != original.player_hp.",
      "testEmptySave: initialize loaded with {99,99,99,99} before loading zeroes. After load, all fields should be 0.",
    ],
    estimatedMinutes: 12,
  },
};