import { Lesson } from "@/types/lesson";

export const lessonRPG28: Lesson = {
  id: "rpg-28-loot-drop-deterministic",
  title: "Loot Drop Deterministic",
  description: "Drop item ID based on seed. Same seed, same loot. RNG-driven content that replays perfectly.",
  order: 28,
  xpReward: 100,
  tier: "pro",
  concepts: ["deterministic loot", "seeded RNG", "loot tables", "reproducible content"],
  part1: {
    title: "Concept: Deterministic Loot Drops",
    type: "concept",
    instructions: `# Loot Drop Deterministic

## Mental Model
Loot is not random. Loot is deterministic content generated from a seed. The seeded RNG picks an item ID from a loot table. Same seed, same sequence of drops. This means loot is replayable, debuggable, and predictable.

## What Breaks Without This
If you use std::rand() for loot, every run produces different drops. You can't reproduce a bug report. You can't verify replay correctness. Non-deterministic loot is untestable loot.

## The Fix: Seeded Loot Function
\`\`\`cpp
unsigned int rng_state = 42;
unsigned int nextRandom() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}
int rollLoot(const int* table, int size) {
    return table[nextRandom() % size];
}
\`\`\`

The loot table is an array of item IDs. Duplicates increase drop rate. Rolling picks an index deterministically.

## Key Concepts
- Seeded RNG produces deterministic sequences
- Loot table: array of item IDs (duplicates = higher drop rate)
- rollLoot uses nextRandom() to pick from the table
- Same seed + same call order = same drops

## Performance Insight
xorshift is 3 operations per random number. Modulo for table index is 1 division. Total: 4 operations per loot roll. Faster than any standard library RNG.

## Memory Insight
RNG state: 4 bytes. Loot table: small const array. No heap allocation for loot generation.

## Your Task
Implement a seeded RNG and loot table. Roll loot 5 times. Reset seed and verify identical sequence.

## Beginner Trap: Using rand()
std::rand() uses global state that's hard to control. Use your own xorshift — 3 lines and guaranteed identical everywhere.

## Elite Insight: Weighted Loot Tables
Our table uses repetition for weighting. Production games use cumulative weight tables with binary search. Same principle: deterministic selection from a weighted distribution.

## Systems Thinking Connection
In L21 you built seeded RNG. In L22 you banned rand(). Now you use that RNG for gameplay content. Every random decision flows from the single seed.

## Skill Reinforcement
- From L21: Seeded xorshift RNG
- From L27: Item IDs and lookup tables
- New: RNG-driven content generation

## Mastery Check
You know you've got it when:
- Same seed produces identical loot sequence
- Different seeds produce different loot
- Loot table weighting works`,
    starterCode: `#include <iostream>
using namespace std;
unsigned int rng_state;
// TODO: Implement nextRandom() using xorshift
int rollLoot(const int* table, int size) {
    // TODO: return table[nextRandom() % size]
    return 0;
}
int main() {
    rng_state = 42;
    int loot[] = {3, 3, 3, 1, 4};
    for (int i = 0; i < 5; i++)
        cout << "DROP|" << rollLoot(loot, 5) << endl;
    rng_state = 42;
    cout << "RESET" << endl;
    for (int i = 0; i < 5; i++)
        cout << "DROP|" << rollLoot(loot, 5) << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
unsigned int rng_state;
unsigned int nextRandom() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}
int rollLoot(const int* table, int size) {
    return table[nextRandom() % size];
}
int main() {
    rng_state = 42;
    int loot[] = {3, 3, 3, 1, 4};
    for (int i = 0; i < 5; i++)
        cout << "DROP|" << rollLoot(loot, 5) << endl;
    rng_state = 42;
    cout << "RESET" << endl;
    for (int i = 0; i < 5; i++)
        cout << "DROP|" << rollLoot(loot, 5) << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Drops generated", expectedOutput: "DROP|", isPattern: true },
      { id: "t2", description: "Reset marker", expectedOutput: "RESET", isPattern: false },
    ],
    hints: [
      "xorshift: rng_state ^= rng_state << 13; rng_state ^= rng_state >> 17; rng_state ^= rng_state << 5;",
      "rollLoot: return table[nextRandom() % size];",
      "After resetting rng_state to 42, the same 5 drops appear in the same order.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Combat with Deterministic Loot",
    type: "game_builder",
    instructions: `# Combat with Deterministic Loot

## Mental Model
Kill an enemy, roll loot from the table, add to inventory. Every drop flows from the seeded RNG. The seed + combat sequence fully determines which items the player gets.

## What Breaks Without This
Without deterministic loot in combat, replay can't verify inventory state. If replay shows a Sword but the original had a Dagger, determinism is broken.

## The Fix: Loot on Kill
\`\`\`cpp
if (enemy_hp <= 0) {
    int drop = rollLoot(loot_table, loot_size);
    addItem(drop);
}
\`\`\`

## Key Concepts
- Enemy death triggers loot roll
- Loot roll uses seeded RNG
- Dropped item goes to inventory
- Kill order determines loot order

## Performance Insight
One RNG call + one array lookup + one inventory add = constant time per kill.

## Memory Insight
No new allocations. Loot generation reuses existing RNG state and inventory arrays.

## Your Task
Simulate 3 enemy kills. Each kill rolls loot. Print drops and final inventory.

## Beginner Trap: Rolling Before Death Check
If you call nextRandom() before checking death, you advance the RNG state. Only call RNG when you need a number.

## Elite Insight: Loot Tables as Data Files
In L41, loot tables load from files. rollLoot stays the same — only the data changes.

## Mastery Check
You know you've got it when:
- Same seed produces same drops across runs
- Inventory reflects all collected loot
- Kill order matches expected drop sequence`,
    starterCode: `#include <iostream>
using namespace std;
unsigned int rng_state;
unsigned int nextRandom(){rng_state^=rng_state<<13;rng_state^=rng_state>>17;rng_state^=rng_state<<5;return rng_state;}
int rollLoot(const int* t,int s){return t[nextRandom()%s];}
const int MAX_INV=5;
int inv[MAX_INV],inv_count=0;
bool addItem(int id){if(inv_count>=MAX_INV)return false;inv[inv_count++]=id;return true;}
int main(){
    rng_state=42;
    int loot[]={3,3,3,1,4};
    int enemy_hp[]={5,5,5};
    int damage=5;
    // TODO: Kill each enemy, roll loot, add to inventory
    // Print: KILL|enemy_index|loot_id
    cout<<"INV|"<<inv_count;
    for(int i=0;i<inv_count;i++)cout<<"|"<<inv[i];
    cout<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
unsigned int rng_state;
unsigned int nextRandom(){rng_state^=rng_state<<13;rng_state^=rng_state>>17;rng_state^=rng_state<<5;return rng_state;}
int rollLoot(const int* t,int s){return t[nextRandom()%s];}
const int MAX_INV=5;
int inv[MAX_INV],inv_count=0;
bool addItem(int id){if(inv_count>=MAX_INV)return false;inv[inv_count++]=id;return true;}
int main(){
    rng_state=42;
    int loot[]={3,3,3,1,4};
    int enemy_hp[]={5,5,5};
    int damage=5;
    for(int e=0;e<3;e++){
        enemy_hp[e]-=damage;
        if(enemy_hp[e]<=0){
            int drop=rollLoot(loot,5);
            addItem(drop);
            cout<<"KILL|"<<e<<"|"<<drop<<endl;
        }
    }
    cout<<"INV|"<<inv_count;
    for(int i=0;i<inv_count;i++)cout<<"|"<<inv[i];
    cout<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Kill produces loot", expectedOutput: "KILL|0|", isPattern: true },
      { id: "g2", description: "Three kills", expectedOutput: "KILL|2|", isPattern: true },
      { id: "g3", description: "Inventory populated", expectedOutput: "INV|3|", isPattern: true },
    ],
    hints: [
      "Loop through enemies. Subtract damage. If hp <= 0, call rollLoot and addItem.",
      "Loot table: {3,3,3,1,4}. Rolls are deterministic from seed 42.",
      "Print KILL|enemy_index|loot_id for each kill.",
    ],
    estimatedMinutes: 12,
  },
};