import { Lesson } from "@/types/lesson";

export const lessonRPG68: Lesson = {
  id: "rpg-68-state-signature-end-of-run",
  title: "State Signature at End of Run",
  description: "Hash the entire world state into a single number — if two runs produce the same signature, they are deterministically identical.",
  order: 68,
  xpReward: 100,
  tier: "pro",
  concepts: ["state hashing", "signature verification", "end-of-run check", "determinism proof", "hash function"],
  part1: {
    title: "Concept: State Signature Hashing",
    type: "concept",
    instructions: `# State Signature at End of Run

## Mental Model

A state signature is a single number that represents the ENTIRE game state. If two runs produce the same signature, they processed identically. If different, something diverged. This is how you prove determinism without comparing every field manually. One unsigned int. One comparison. Determinism verified.

## What Breaks Without This

You can compare individual fields (hp, gold, position) between record and replay runs. But with 20+ fields across multiple entities, comparing them one by one is tedious and error-prone. What if you miss a field? What if a new field gets added and you forget to include it in the comparison? A single signature hash catches ALL divergences automatically.

## The Fix: Hash Combine

Combine all game state into a single unsigned int using a hash function. The \`hashCombine\` function mixes a new value into the running hash using the golden ratio constant (0x9e3779b9) and bit shifts:

\`\`\`cpp
unsigned int hashCombine(unsigned int seed, int value) {
    seed ^= (unsigned int)value + 0x9e3779b9 + (seed << 6) + (seed >> 2);
    return seed;
}
\`\`\`

The magic constant distributes bits evenly. The shifts ensure that changing any single field changes the entire hash. Start with sig=0, fold in each field, and the result is a unique fingerprint of the entire state.

## Key Concepts
- Hash combine: XOR + golden ratio constant + bit shifts for diffusion
- State signature: single unsigned int summarizing entire game state
- Hash VALUES, not addresses — pointers change between runs
- Order matters: hash fields in the same order every time

## Performance Insight

Computing a signature takes microseconds — just integer math (XOR, addition, bit shifts). You can compute it every tick during development for debugging and only at end-of-run in production. With 6 fields, that's 6 hashCombine calls — ~18 integer operations total. Invisible overhead.

## Memory Insight

The signature is one unsigned int — 4 bytes. It encodes the hash of potentially thousands of bytes of game state. This is the power of hash functions: fixed-size summary of arbitrary-size data. Two identical states always produce the same hash. Two different states almost certainly produce different hashes.

## Your Task

Write \`hashCombine()\` and \`computeSignature()\` for a simple World struct. Compute the signature after modifying the world state, then verify it matches a known expected value.

Expected output:
\`\`\`
INIT|px=1|py=1|hp=20|gold=0
MODIFY|px=2|py=0|hp=17|gold=5
SIG|<hash_value>
SIG_NONZERO|true
\`\`\`

## Beginner Trap

**Hashing pointer values instead of data values.** If you write \`sig = hashCombine(sig, (int)&world.grid)\`, you're hashing the memory address, which changes between runs. Hash the DATA stored at that address, not the address itself. Pointers are never deterministic.

## Elite Insight

This is how Factorio detects multiplayer desyncs. Every client computes a state signature each tick. If any client's signature differs from the server's, the game logs the divergence point and forces a resync. Same pattern, industrial scale. Your single-player signature is the foundation for networked determinism verification.

## Systems Thinking Connection

The Robotics path uses sensor checksums to verify data integrity between nodes. Your state signature serves the same purpose — a compact proof that the full state is correct. Different domain, same verification pattern.

## Skill Reinforcement

Lesson 23 introduced the state signature concept. Lesson 67 covered determinism pitfalls. This lesson provides the implementation — the hash function that makes signature comparison possible. Lesson 69 will use this in the replay verification test.

## Mastery Check

Why must hashCombine use XOR with bit shifts instead of simple addition?
Answer: Addition doesn't distribute bits well — changing hp from 20 to 21 only flips one bit in the sum. XOR with shifted seed ensures that a single-bit change in ANY field ripples across ALL bits of the signature, making collisions (two different states producing the same hash) extremely unlikely.`,
    starterCode: `#include <iostream>
using namespace std;

struct World{int px;int py;int hp;int gold;int turn;};

// TODO: Write hashCombine(unsigned int seed, int value)
// seed ^= (unsigned int)value + 0x9e3779b9 + (seed << 6) + (seed >> 2);
// return seed;

// TODO: Write computeSignature(const World& w)
// Hash: px, py, hp, gold, turn
// Start with sig=0, fold in each field
// Return final sig

int main(){
    World w;
    w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;
    cout<<"INIT|px="<<w.px<<"|py="<<w.py<<"|hp="<<w.hp<<"|gold="<<w.gold<<endl;

    // Modify state
    w.px=2;w.py=0;w.hp=17;w.gold=5;w.turn=3;
    cout<<"MODIFY|px="<<w.px<<"|py="<<w.py<<"|hp="<<w.hp<<"|gold="<<w.gold<<endl;

    // TODO: Compute and print signature
    // unsigned int sig = computeSignature(w);
    // cout<<"SIG|"<<sig<<endl;
    // cout<<"SIG_NONZERO|"<<(sig!=0?"true":"false")<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct World{int px;int py;int hp;int gold;int turn;};

unsigned int hashCombine(unsigned int seed,int value){
    seed^=(unsigned int)value+0x9e3779b9+(seed<<6)+(seed>>2);
    return seed;
}

unsigned int computeSignature(const World& w){
    unsigned int sig=0;
    sig=hashCombine(sig,w.px);
    sig=hashCombine(sig,w.py);
    sig=hashCombine(sig,w.hp);
    sig=hashCombine(sig,w.gold);
    sig=hashCombine(sig,w.turn);
    return sig;
}

int main(){
    World w;
    w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;
    cout<<"INIT|px="<<w.px<<"|py="<<w.py<<"|hp="<<w.hp<<"|gold="<<w.gold<<endl;

    w.px=2;w.py=0;w.hp=17;w.gold=5;w.turn=3;
    cout<<"MODIFY|px="<<w.px<<"|py="<<w.py<<"|hp="<<w.hp<<"|gold="<<w.gold<<endl;

    unsigned int sig=computeSignature(w);
    cout<<"SIG|"<<sig<<endl;
    cout<<"SIG_NONZERO|"<<(sig!=0?"true":"false")<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "World initialized", expectedOutput: "INIT|px=1|py=1|hp=20|gold=0", isPattern: false },
      { id: "t2", description: "World modified", expectedOutput: "MODIFY|px=2|py=0|hp=17|gold=5", isPattern: false },
      { id: "t3", description: "Signature computed", expectedOutput: "SIG|", isPattern: true },
      { id: "t4", description: "Signature is nonzero", expectedOutput: "SIG_NONZERO|true", isPattern: false },
    ],
    hints: [
      "hashCombine takes a running seed and a new int value. XOR the seed with (value + 0x9e3779b9 + (seed << 6) + (seed >> 2)).",
      "computeSignature starts with sig=0 and folds in each field: sig = hashCombine(sig, w.px), then w.py, w.hp, w.gold, w.turn.",
      "After computing the signature, print it with cout. The value will be a large unsigned int. Check sig != 0 for the nonzero test."
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: State Signature at End of Run",
    type: "game_builder",
    instructions: `# Build: State Signature at End of Run

## Mental Model

Now integrate the state signature into a record/replay framework. Run the game once (record phase), compute the state signature at the end. Reset the world, replay the same inputs from the log (replay phase), compute the signature again. If both signatures match, your replay system is deterministically correct. One number proves it all.

## What Breaks Without This

Without end-of-run signatures, you have no automated way to verify that replay produces identical state. You'd have to manually compare every field after every tick. Miss one field, and a subtle divergence goes unnoticed until it causes a visible bug 100 turns later. The signature catches divergence at the exact point it occurs.

## The Fix: Record-Replay Signature Comparison

After the record phase, compute \`RECORD_SIG\`. After the replay phase, compute \`REPLAY_SIG\`. Compare the two. If they match, print \`SIGNATURE_MATCH\`. If not, print \`SIGNATURE_MISMATCH\`. This is the simplest correct determinism verification.

The record/replay log stores each command (dx, dy, attack, interact) per turn. Replay reads from the log and feeds the same commands to the game. Same seed + same commands = same state = same signature.

## Key Concepts
- Record phase: run game with live inputs, store commands in replay log
- Replay phase: reset world with same seed, feed commands from log
- Signature comparison: RECORD_SIG == REPLAY_SIG proves determinism
- hashCombine: XOR + golden ratio + shifts for bit diffusion

## Performance Insight

The replay phase processes 5 ticks with 6 hash operations at the end — total compute is ~50 integer operations. Even with 1000 ticks, the signature computation is < 1ms. The replay itself is the bottleneck (re-executing all game logic), not the signature.

## Memory Insight

The replay log stores one ReplayEntry per tick (5 ints = 20 bytes each). With MAX_REPLAY=1024, that's 20KB — all stack-allocated. The signatures are two unsigned ints (8 bytes). Total replay infrastructure: ~20KB stack. No heap.

## Your Task

Add \`hashCombine()\` and \`computeSignature()\` to the record/replay framework. After the record phase, print \`RECORD_SIG|<value>\`. After the replay phase, print \`REPLAY_SIG|<value>\`. Compare and print \`SIGNATURE_MATCH\` or \`SIGNATURE_MISMATCH\`.

Expected output:
\`\`\`
INIT|seed=42
TICK|1|TICK|2|TICK|3|TICK|4|TICK|5
RECORD_SIG|<hash_value>
INIT|seed=42
TICK|1|TICK|2|TICK|3|TICK|4|TICK|5
REPLAY_SIG|<hash_value>
SIGNATURE_MATCH
\`\`\`

## Beginner Trap

**Forgetting to hash the RNG state.** If you hash only px, py, hp, gold, turn but skip rng.state, two runs with different RNG states produce the same signature. The next random call would produce different results, but the signature says they're identical. Always include rng.state in the hash.

## Elite Insight

Age of Empires uses a CRC-based state signature called a "sync hash" computed every 100ms across all players. Any mismatch triggers a desync report with the exact game time. Lockstep multiplayer games live and die by this technique. Your SIGNATURE_MATCH check is the single-player version of the same industrial pattern.

## Mastery Check

If you add a new field to World (e.g., \`int armor\`) but forget to include it in computeSignature, what happens?
Answer: Two runs where only \`armor\` differs will produce the same signature — a false positive. The signature says "match" but the states are actually different. Every field in WorldState MUST be included in the signature hash. This is why computeSignature should be updated whenever WorldState changes.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;int next(int lo,int hi){state=state*1103515245+12345;return lo+(int)((state>>16)%(hi-lo+1));}};
struct Command{int dx;int dy;bool attack;bool interact;};
struct World{int px;int py;int hp;int gold;int turn;RNG rng;unsigned int seed;};
const int MAX_REPLAY=1024;
struct ReplayEntry{int turn;int dx;int dy;int attack;int interact;};

void initWorld(World& w,unsigned int seed){w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;w.seed=seed;w.rng={seed};cout<<"INIT|seed="<<seed<<endl;}
void tick(World& w,const Command& cmd){w.turn++;if(cmd.attack){int d=w.rng.next(1,3);w.hp-=d;}else{int nx=w.px+cmd.dx;int ny=w.py+cmd.dy;if(nx>=0&&nx<=9)w.px=nx;if(ny>=0&&ny<=9)w.py=ny;}cout<<"TICK|"<<w.turn;}
void recordCommand(ReplayEntry* log,int& c,int t,const Command& cmd){if(c>=MAX_REPLAY)return;log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0};c++;}

// TODO: Write hashCombine(unsigned int seed, int value)
// seed ^= (unsigned int)value + 0x9e3779b9 + (seed << 6) + (seed >> 2);
// return seed;

// TODO: Write computeSignature(const World& w)
// Hash: px, py, hp, gold, turn, rng.state
// Return final hash

int main(){
    World world;
    ReplayEntry log[MAX_REPLAY];int log_count=0;
    Command cmds[5]={{0,-1,false,false},{1,0,false,false},{0,0,true,false},{0,1,false,false},{0,0,true,false}};

    // Record phase
    initWorld(world,42);
    for(int t=0;t<5;t++){recordCommand(log,log_count,t+1,cmds[t]);tick(world,cmds[t]);}
    cout<<endl;
    // TODO: Compute and print RECORD_SIG|<value>
    unsigned int rec_sig=0; // Replace with computeSignature(world)

    // Replay phase
    initWorld(world,42);
    for(int i=0;i<log_count;i++){Command c={log[i].dx,log[i].dy,(bool)log[i].attack,(bool)log[i].interact};tick(world,c);}
    cout<<endl;
    // TODO: Compute and print REPLAY_SIG|<value>

    // TODO: Compare and print SIGNATURE_MATCH or SIGNATURE_MISMATCH

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;int next(int lo,int hi){state=state*1103515245+12345;return lo+(int)((state>>16)%(hi-lo+1));}};
struct Command{int dx;int dy;bool attack;bool interact;};
struct World{int px;int py;int hp;int gold;int turn;RNG rng;unsigned int seed;};
const int MAX_REPLAY=1024;
struct ReplayEntry{int turn;int dx;int dy;int attack;int interact;};

void initWorld(World& w,unsigned int seed){w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;w.seed=seed;w.rng={seed};cout<<"INIT|seed="<<seed<<endl;}
void tick(World& w,const Command& cmd){w.turn++;if(cmd.attack){int d=w.rng.next(1,3);w.hp-=d;}else{int nx=w.px+cmd.dx;int ny=w.py+cmd.dy;if(nx>=0&&nx<=9)w.px=nx;if(ny>=0&&ny<=9)w.py=ny;}cout<<"TICK|"<<w.turn;}
void recordCommand(ReplayEntry* log,int& c,int t,const Command& cmd){if(c>=MAX_REPLAY)return;log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0};c++;}

unsigned int hashCombine(unsigned int seed,int value){
    seed^=(unsigned int)value+0x9e3779b9+(seed<<6)+(seed>>2);
    return seed;
}

unsigned int computeSignature(const World& w){
    unsigned int sig=0;
    sig=hashCombine(sig,w.px);
    sig=hashCombine(sig,w.py);
    sig=hashCombine(sig,w.hp);
    sig=hashCombine(sig,w.gold);
    sig=hashCombine(sig,w.turn);
    sig=hashCombine(sig,(int)w.rng.state);
    return sig;
}

int main(){
    World world;
    ReplayEntry log[MAX_REPLAY];int log_count=0;
    Command cmds[5]={{0,-1,false,false},{1,0,false,false},{0,0,true,false},{0,1,false,false},{0,0,true,false}};

    // Record phase
    initWorld(world,42);
    for(int t=0;t<5;t++){recordCommand(log,log_count,t+1,cmds[t]);tick(world,cmds[t]);}
    cout<<endl;
    unsigned int rec_sig=computeSignature(world);
    cout<<"RECORD_SIG|"<<rec_sig<<endl;

    // Replay phase
    initWorld(world,42);
    for(int i=0;i<log_count;i++){Command c={log[i].dx,log[i].dy,(bool)log[i].attack,(bool)log[i].interact};tick(world,c);}
    cout<<endl;
    unsigned int rep_sig=computeSignature(world);
    cout<<"REPLAY_SIG|"<<rep_sig<<endl;

    if(rec_sig==rep_sig) cout<<"SIGNATURE_MATCH"<<endl;
    else cout<<"SIGNATURE_MISMATCH"<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Game initialized with seed", expectedOutput: "INIT|seed=42", isPattern: false },
      { id: "g2", description: "Record signature computed", expectedOutput: "RECORD_SIG|", isPattern: true },
      { id: "g3", description: "Replay signature computed", expectedOutput: "REPLAY_SIG|", isPattern: true },
      { id: "g4", description: "Signatures match", expectedOutput: "SIGNATURE_MATCH", isPattern: false },
    ],
    hints: [
      "hashCombine XORs the current seed with (value + golden_ratio_constant + shifted_seed). The shifts ensure bit diffusion across all 32 bits.",
      "computeSignature calls hashCombine once per field: px, py, hp, gold, turn, rng.state. Start with sig=0. Don't forget to cast rng.state to int.",
      "After each phase, call computeSignature(world) and store the result. Compare rec_sig == rep_sig and print the appropriate message."
    ],
    estimatedMinutes: 12,
  },
};
