import { Lesson } from "@/types/lesson";

export const lessonRPG27: Lesson = {
  id: "rpg-27-items-v0-as-ids",
  title: "Items v0 as IDs",
  description: "Item data lives in a lookup table. Inventory stores IDs, not strings. No strings in the hot path.",
  order: 27,
  xpReward: 100,
  tier: "pro",
  concepts: ["ID-based references", "data lookup tables", "indirection", "data-driven design"],
  part1: {
    title: "Concept: Items as IDs",
    type: "concept",
    instructions: `# Items v0 as IDs

## Mental Model
An item is not a string. An item is an integer ID that indexes into a lookup table. The table maps ID to name, damage, heal amount, and other properties. The inventory stores IDs. The combat system reads damage by ID. The render system reads name by ID. No strings flow through the hot path — only integers.

## What Breaks Without This
If your inventory stores item names as strings, every combat calculation that needs damage must search strings. String comparison is O(n) per character. Copying strings requires heap allocation. Passing strings fragments memory. IDs are 4 bytes, compared in one CPU instruction, and never allocate.

## The Fix: Lookup Table
\`\`\`cpp
struct ItemDef {
    int id;
    const char* name;
    int damage;
    int heal;
};

const int MAX_ITEM_DEFS = 8;
const ItemDef ITEM_TABLE[MAX_ITEM_DEFS] = {
    {0, "None", 0, 0},
    {1, "Sword", 5, 0},
    {2, "Shield", 0, 0},
    {3, "Potion", 0, 10},
    {4, "Dagger", 3, 0},
};
const int ITEM_DEF_COUNT = 5;

const ItemDef& lookupItem(int id) {
    for (int i = 0; i < ITEM_DEF_COUNT; i++) {
        if (ITEM_TABLE[i].id == id) return ITEM_TABLE[i];
    }
    return ITEM_TABLE[0]; // fallback to None
}
\`\`\`

The table is const, global, and stack-allocated. Lookups are O(n) but n is tiny. For larger tables, you'd sort by ID and binary search.

## Key Concepts
- Inventory stores int IDs, not strings or objects
- Item properties live in a const lookup table
- lookupItem(id) returns a reference to the definition
- Fallback to a default (None) prevents crashes on bad IDs

## Performance Insight
Comparing an int (4 bytes, 1 instruction) vs comparing a string (5+ bytes, multiple comparisons). For 5 items checked against 5 enemies, IDs win by 5x minimum, and the gap grows with longer names.

## Memory Insight
The item table is const data — it lives in the program's read-only segment, not on the heap. The char* pointers reference string literals in read-only memory. Total heap allocation: zero.

## Your Task
Create an item lookup table with 5 items. Store item IDs in an inventory. Print item names by looking up IDs in the table.

## Beginner Trap: Storing Strings in Inventory
Never store strings in a hot-path container. Strings allocate, copy, and fragment memory. An int ID does none of these.

## Elite Insight: Data-Driven Design
This lookup table is the seed of data-driven design. In L41, you'll load the table from a file instead of hardcoding it. The game behavior changes by editing a text file, not recompiling.

## Systems Thinking Connection
ID-based references are used everywhere: entity IDs (L13), item IDs (here), room IDs (L20), quest IDs (L54). Every system references data by ID.

## Skill Reinforcement
- From L13: Entity IDs as integers
- From L26: Fixed-size inventory
- New: Lookup table pattern, data-driven design

## Mastery Check
You know you've got it when:
- Inventory stores only int IDs
- Item names come from the lookup table, not the inventory
- Invalid IDs fall back to None without crashing`,
    starterCode: `#include <iostream>
using namespace std;

struct ItemDef { int id; const char* name; int damage; int heal; };
const int MAX_ITEM_DEFS = 8;
const ItemDef ITEM_TABLE[MAX_ITEM_DEFS] = {
    {0,"None",0,0},{1,"Sword",5,0},{2,"Shield",0,0},{3,"Potion",0,10},{4,"Dagger",3,0},
};
const int ITEM_DEF_COUNT = 5;

// TODO: Implement lookupItem(int id) -> const ItemDef&

int main() {
    const int MAX_INV = 5;
    int inventory[MAX_INV];
    int inv_count = 0;
    inventory[inv_count++] = 1; // Sword
    inventory[inv_count++] = 3; // Potion
    inventory[inv_count++] = 4; // Dagger

    // TODO: Print each item: ITEM|id|name|damage|heal
    // TODO: Lookup invalid ID 99: FALLBACK|name
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct ItemDef { int id; const char* name; int damage; int heal; };
const int MAX_ITEM_DEFS = 8;
const ItemDef ITEM_TABLE[MAX_ITEM_DEFS] = {
    {0,"None",0,0},{1,"Sword",5,0},{2,"Shield",0,0},{3,"Potion",0,10},{4,"Dagger",3,0},
};
const int ITEM_DEF_COUNT = 5;

const ItemDef& lookupItem(int id) {
    for (int i = 0; i < ITEM_DEF_COUNT; i++)
        if (ITEM_TABLE[i].id == id) return ITEM_TABLE[i];
    return ITEM_TABLE[0];
}

int main() {
    const int MAX_INV = 5;
    int inventory[MAX_INV];
    int inv_count = 0;
    inventory[inv_count++] = 1;
    inventory[inv_count++] = 3;
    inventory[inv_count++] = 4;

    for (int i = 0; i < inv_count; i++) {
        const ItemDef& it = lookupItem(inventory[i]);
        cout << "ITEM|" << it.id << "|" << it.name << "|" << it.damage << "|" << it.heal << endl;
    }
    const ItemDef& bad = lookupItem(99);
    cout << "FALLBACK|" << bad.name << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Sword lookup", expectedOutput: "ITEM|1|Sword|5|0", isPattern: false },
      { id: "t2", description: "Potion lookup", expectedOutput: "ITEM|3|Potion|0|10", isPattern: false },
      { id: "t3", description: "Dagger lookup", expectedOutput: "ITEM|4|Dagger|3|0", isPattern: false },
      { id: "t4", description: "Invalid ID fallback", expectedOutput: "FALLBACK|None", isPattern: false },
    ],
    hints: [
      "Loop through ITEM_TABLE. If ITEM_TABLE[i].id == id, return ITEM_TABLE[i].",
      "Return ITEM_TABLE[0] as fallback for unknown IDs.",
      "Use const ItemDef& to avoid copying the struct.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Item-Based Combat",
    type: "game_builder",
    instructions: `# Item-Based Combat

## Mental Model
Combat damage comes from the equipped item's lookup table entry. The player has an equipped_item_id. When attacking, look up the item's damage value. No hardcoded damage numbers — all balance comes from the data table.

## What Breaks Without This
Without data-driven damage, every weapon change requires recompiling code. The lookup table centralizes all balance data in one place.

## The Fix: Equipped Item Drives Combat
\`\`\`cpp
int equipped_id = 1; // Sword
const ItemDef& weapon = lookupItem(equipped_id);
enemy_hp -= weapon.damage;
\`\`\`

## Key Concepts
- equipped_id is a single int
- Damage comes from lookupItem(equipped_id).damage
- Changing weapons = changing one integer
- All balance data lives in the table

## Performance Insight
One table lookup per attack. The entire table fits in L1 cache. Combat resolution with item lookups is just as fast as hardcoded values.

## Memory Insight
equipped_id adds 4 bytes to player state. The item table is already allocated. Total new memory: 4 bytes.

## Your Task
Equip different weapons and attack an enemy. Show damage varying by equipped item. Use a potion to heal.

## Beginner Trap: Hardcoding Damage
Don't write if (weapon == Sword) damage = 5. Always read from the table.

## Elite Insight: Equipment Slots
In L42, multiple equipment slots. Each slot holds one item ID. Damage from weapon slot, defense from armor. The lookup pattern scales.

## Mastery Check
You know you've got it when:
- Damage values come from the item table
- Switching equipped_id changes combat behavior
- Potion healing uses the heal field`,
    starterCode: `#include <iostream>
using namespace std;
struct ItemDef { int id; const char* name; int damage; int heal; };
const ItemDef ITEM_TABLE[] = {{0,"None",0,0},{1,"Sword",5,0},{2,"Shield",0,0},{3,"Potion",0,10},{4,"Dagger",3,0}};
const int ITEM_DEF_COUNT = 5;
const ItemDef& lookupItem(int id) {
    for (int i=0;i<ITEM_DEF_COUNT;i++) if (ITEM_TABLE[i].id==id) return ITEM_TABLE[i];
    return ITEM_TABLE[0];
}
int main() {
    int player_hp=20, enemy_hp=15, equipped_id=1;
    // TODO: Attack with Sword, print ATTACK|name|damage|enemy_hp
    // TODO: Switch to Dagger (id=4), attack again
    // TODO: Use Potion (id=3), print HEAL|name|amount|player_hp
    cout << "PLAYER_HP|" << player_hp << endl;
    cout << "ENEMY_HP|" << enemy_hp << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
struct ItemDef { int id; const char* name; int damage; int heal; };
const ItemDef ITEM_TABLE[] = {{0,"None",0,0},{1,"Sword",5,0},{2,"Shield",0,0},{3,"Potion",0,10},{4,"Dagger",3,0}};
const int ITEM_DEF_COUNT = 5;
const ItemDef& lookupItem(int id) {
    for (int i=0;i<ITEM_DEF_COUNT;i++) if (ITEM_TABLE[i].id==id) return ITEM_TABLE[i];
    return ITEM_TABLE[0];
}
int main() {
    int player_hp=20, enemy_hp=15, equipped_id=1;
    const ItemDef& w1=lookupItem(equipped_id);
    enemy_hp-=w1.damage;
    cout<<"ATTACK|"<<w1.name<<"|"<<w1.damage<<"|"<<enemy_hp<<endl;
    equipped_id=4;
    const ItemDef& w2=lookupItem(equipped_id);
    enemy_hp-=w2.damage;
    cout<<"ATTACK|"<<w2.name<<"|"<<w2.damage<<"|"<<enemy_hp<<endl;
    const ItemDef& pot=lookupItem(3);
    player_hp+=pot.heal;
    cout<<"HEAL|"<<pot.name<<"|"<<pot.heal<<"|"<<player_hp<<endl;
    cout<<"PLAYER_HP|"<<player_hp<<endl;
    cout<<"ENEMY_HP|"<<enemy_hp<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Sword attack", expectedOutput: "ATTACK|Sword|5|10", isPattern: false },
      { id: "g2", description: "Dagger attack", expectedOutput: "ATTACK|Dagger|3|7", isPattern: false },
      { id: "g3", description: "Potion heals", expectedOutput: "HEAL|Potion|10|30", isPattern: false },
      { id: "g4", description: "Final enemy HP", expectedOutput: "ENEMY_HP|7", isPattern: false },
    ],
    hints: [
      "Look up the weapon: const ItemDef& w = lookupItem(equipped_id); then use w.damage.",
      "Switch weapons by changing equipped_id to a different int.",
      "For potions, lookup and use the heal field: player_hp += lookupItem(3).heal;",
    ],
    estimatedMinutes: 10,
  },
};