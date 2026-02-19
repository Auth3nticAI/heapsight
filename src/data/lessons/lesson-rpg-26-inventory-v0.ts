import { Lesson } from "@/types/lesson";

export const lessonRPG26: Lesson = {
  id: "rpg-26-inventory-v0",
  title: "Inventory v0 (Fixed Size)",
  description: "A 5-slot inventory using fixed arrays. No heap, no dynamic allocation.",
  order: 26,
  xpReward: 100,
  tier: "pro",
  concepts: ["fixed-size containers", "inventory slots", "array management", "stack allocation"],
  part1: {
    title: "Concept: Fixed-Size Inventory",
    type: "concept",
    instructions: `# Inventory v0 (Fixed Size)

## Mental Model
An inventory is an array with a count. Five slots means five entries in a fixed array. The count tracks how many are used. Add an item: write to slot[count], increment count. Remove an item: swap with last, decrement count. No heap. No resize. No allocator. Just an array and an integer.

## What Breaks Without This
Without a fixed-size inventory, you'd use a vector or linked list — both require heap allocation. After Gate A (L30), heap allocations in the game loop are forbidden. A fixed-size inventory sidesteps the problem entirely: preallocated, cache-friendly, deterministic.

## The Fix: Array + Count
\`\`\`cpp
const int MAX_ITEMS = 5;
int item_ids[MAX_ITEMS];
int item_count = 0;

bool addItem(int id) {
    if (item_count >= MAX_ITEMS) return false;
    item_ids[item_count] = id;
    item_count++;
    return true;
}

bool removeItem(int slot) {
    if (slot < 0 || slot >= item_count) return false;
    item_ids[slot] = item_ids[item_count - 1];
    item_count--;
    return true;
}
\`\`\`

The swap-with-last removal is O(1) and keeps the array compact. Order doesn't matter for an inventory — items are referenced by ID, not position.

## Key Concepts
- Fixed-size array: MAX_ITEMS slots, no resize
- Count tracks active items
- Swap-with-last removal: O(1), no gaps
- Full inventory returns false — caller decides what to do

## Performance Insight
Five ints = 20 bytes. Fits in a single cache line. Adding and removing are O(1). Searching for an item by ID is O(n) where n <= 5 — effectively constant. This is faster than any hash map for small collections.

## Memory Insight
20 bytes for item_ids + 4 bytes for item_count = 24 bytes total. Stack allocated. No heap. After Gate A, this pattern is mandatory for all runtime containers.

## Your Task
Implement addItem and removeItem for a 5-slot inventory. Test: add 3 items, remove one by slot, print the inventory contents.

## Beginner Trap: Using std::vector
std::vector is convenient but heap-allocated. Every push_back may trigger reallocation. After L30, this is banned in the game loop. Learn fixed-size arrays now — you'll need them for every container going forward.

## Elite Insight: Slot-Based vs ID-Based Removal
Removing by slot index (swap-with-last) is fast but reorders items. Removing by item ID requires a search first. For inventory display, order doesn't matter. For equipment slots (L42), you'll use fixed slot indices where order is meaningful. Choose the right removal strategy for each container.

## Systems Thinking Connection
Every fixed-size container in the game follows this pattern: array + count + add/remove. Entity arrays (L06), command queues (L16), and now inventory. The pattern is the same — only the data type changes.

## Skill Reinforcement
- From L06: Parallel arrays with entity_count
- From L16: Fixed-size command queue
- New: Item management with add/remove operations

## Mastery Check
You know you've got it when:
- Adding to a full inventory returns false
- Removing swaps with last and decrements count
- Inventory prints correct contents after add/remove operations`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ITEMS = 5;
int item_ids[MAX_ITEMS];
int item_count = 0;

// TODO: Implement addItem(int id) -> bool
// Returns false if inventory full

// TODO: Implement removeItem(int slot) -> bool
// Swap-with-last removal. Returns false if slot invalid.

void printInventory() {
    cout << "INV|" << item_count << "|";
    for (int i = 0; i < item_count; i++) {
        if (i > 0) cout << ",";
        cout << item_ids[i];
    }
    cout << endl;
}

int main() {
    cout << "ADD|" << addItem(10) << endl;
    cout << "ADD|" << addItem(20) << endl;
    cout << "ADD|" << addItem(30) << endl;
    printInventory();

    cout << "REMOVE|" << removeItem(0) << endl;
    printInventory();

    // Fill to max
    addItem(40); addItem(50); addItem(60);
    cout << "FULL|" << addItem(70) << endl;
    printInventory();

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ITEMS = 5;
int item_ids[MAX_ITEMS];
int item_count = 0;

bool addItem(int id) {
    if (item_count >= MAX_ITEMS) return false;
    item_ids[item_count] = id;
    item_count++;
    return true;
}

bool removeItem(int slot) {
    if (slot < 0 || slot >= item_count) return false;
    item_ids[slot] = item_ids[item_count - 1];
    item_count--;
    return true;
}

void printInventory() {
    cout << "INV|" << item_count << "|";
    for (int i = 0; i < item_count; i++) {
        if (i > 0) cout << ",";
        cout << item_ids[i];
    }
    cout << endl;
}

int main() {
    cout << "ADD|" << addItem(10) << endl;
    cout << "ADD|" << addItem(20) << endl;
    cout << "ADD|" << addItem(30) << endl;
    printInventory();

    cout << "REMOVE|" << removeItem(0) << endl;
    printInventory();

    addItem(40); addItem(50); addItem(60);
    cout << "FULL|" << addItem(70) << endl;
    printInventory();

    return 0;
}`,
    tests: [
      { id: "t1", description: "Add succeeds", expectedOutput: "ADD|1", isPattern: false },
      { id: "t2", description: "Three items in inventory", expectedOutput: "INV|3|10,20,30", isPattern: false },
      { id: "t3", description: "Remove works", expectedOutput: "REMOVE|1", isPattern: false },
      { id: "t4", description: "After remove swap-with-last", expectedOutput: "INV|2|30,20", isPattern: false },
      { id: "t5", description: "Full inventory rejects add", expectedOutput: "FULL|0", isPattern: false },
    ],
    hints: [
      "addItem: check if item_count >= MAX_ITEMS first. If not full, item_ids[item_count] = id; item_count++; return true.",
      "removeItem: swap item_ids[slot] with item_ids[item_count-1], then decrement item_count.",
      "After removing slot 0 (item 10), the last item (30) moves to slot 0. Inventory becomes: 30, 20.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Inventory Integration with Dungeon",
    type: "game_builder",
    instructions: `# Inventory Integration with Dungeon

## Mental Model
Items exist on the dungeon floor as entities. When the player steps on an item tile, it's added to inventory and removed from the world. The inventory is displayed after the grid. This is the first pickup mechanic — the bridge between world state and player state.

## What Breaks Without This
Without inventory integration, items are just symbols on the grid with no gameplay effect. The player can't collect resources, can't prepare for combat, can't progress. The inventory system must connect to the world to matter.

## The Fix: Pickup on Step
\`\`\`cpp
for (int i = 0; i < floor_item_count; i++) {
    if (floor_x[i] == player_x && floor_y[i] == player_y) {
        if (addItem(floor_id[i])) {
            cout << "PICKUP|" << floor_id[i] << endl;
            floor_x[i]=floor_x[floor_item_count-1];
            floor_y[i]=floor_y[floor_item_count-1];
            floor_id[i]=floor_id[floor_item_count-1];
            floor_item_count--;
        }
        break;
    }
}
\`\`\`

## Key Concepts
- Floor items are parallel arrays (x, y, id) with count
- Pickup triggers when player position matches item position
- Item transfers from floor arrays to inventory array
- Both use swap-with-last removal

## Performance Insight
Checking all floor items per move is O(n) where n is floor_item_count. With fewer than 20 items per room, this is negligible. For larger worlds, you'd use spatial hashing (L57).

## Memory Insight
Floor items: 3 arrays of MAX_FLOOR_ITEMS ints + 1 count. Combined with the 24-byte inventory, total item system is under 150 bytes. All stack.

## Your Task
Place items on the floor. When the player moves onto an item, pick it up (add to inventory, remove from floor). Render the grid showing floor items as 'i'. Print inventory after the grid.

## Beginner Trap: Not Removing from Floor
If you add to inventory but forget to remove from floor, the item stays visible and gets picked up again on the next tick. Always pair pickup with floor removal.

## Elite Insight: Transfer as Transaction
Pickup is a transaction: add to inventory AND remove from floor. If the inventory is full, neither happens. This atomic behavior prevents item duplication or loss. In L47, shop transactions follow the same pattern: deduct gold AND add item, atomically.

## Mastery Check
You know you've got it when:
- Walking onto an item picks it up
- Item disappears from grid after pickup
- Inventory correctly shows collected items
- Full inventory prevents pickup`,
    starterCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;
const int MAX_ITEMS = 5;
const int MAX_FLOOR = 10;

int item_ids[MAX_ITEMS];
int item_count = 0;
int floor_x[MAX_FLOOR], floor_y[MAX_FLOOR], floor_id[MAX_FLOOR];
int floor_count = 0;

bool addItem(int id) {
    if (item_count >= MAX_ITEMS) return false;
    item_ids[item_count++] = id;
    return true;
}

void spawnFloorItem(int x, int y, int id) {
    if (floor_count >= MAX_FLOOR) return;
    floor_x[floor_count] = x;
    floor_y[floor_count] = y;
    floor_id[floor_count] = id;
    floor_count++;
}

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';

    int player_x = 1, player_y = 1;
    spawnFloorItem(2, 1, 101);
    spawnFloorItem(3, 1, 102);
    spawnFloorItem(4, 1, 103);

    int num_moves;
    cin >> num_moves;
    for (int t = 0; t < num_moves; t++) {
        char input; cin >> input;
        int dx=0, dy=0;
        if (input=='w') dy=-1;
        else if (input=='s') dy=1;
        else if (input=='a') dx=-1;
        else if (input=='d') dx=1;
        int tx=player_x+dx, ty=player_y+dy;
        if (tx>=0&&tx<WIDTH&&ty>=0&&ty<HEIGHT&&grid[ty][tx]!='#') {
            player_x=tx; player_y=ty;
        }

        // TODO: Check for item pickup at player position
    }

    // TODO: Render grid with player and floor items

    cout << "INV|" << item_count;
    for (int i = 0; i < item_count; i++) cout << "|" << item_ids[i];
    cout << endl;
    cout << "FLOOR|" << floor_count << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int WIDTH = 10;
const int HEIGHT = 10;
const int MAX_ITEMS = 5;
const int MAX_FLOOR = 10;

int item_ids[MAX_ITEMS];
int item_count = 0;
int floor_x[MAX_FLOOR], floor_y[MAX_FLOOR], floor_id[MAX_FLOOR];
int floor_count = 0;

bool addItem(int id) {
    if (item_count >= MAX_ITEMS) return false;
    item_ids[item_count++] = id;
    return true;
}

void spawnFloorItem(int x, int y, int id) {
    if (floor_count >= MAX_FLOOR) return;
    floor_x[floor_count] = x;
    floor_y[floor_count] = y;
    floor_id[floor_count] = id;
    floor_count++;
}

int main() {
    char grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
        for (int x = 0; x < WIDTH; x++)
            grid[y][x] = (y==0||y==HEIGHT-1||x==0||x==WIDTH-1) ? '#' : '.';

    int player_x = 1, player_y = 1;
    spawnFloorItem(2, 1, 101);
    spawnFloorItem(3, 1, 102);
    spawnFloorItem(4, 1, 103);

    int num_moves;
    cin >> num_moves;
    for (int t = 0; t < num_moves; t++) {
        char input; cin >> input;
        int dx=0, dy=0;
        if (input=='w') dy=-1;
        else if (input=='s') dy=1;
        else if (input=='a') dx=-1;
        else if (input=='d') dx=1;
        int tx=player_x+dx, ty=player_y+dy;
        if (tx>=0&&tx<WIDTH&&ty>=0&&ty<HEIGHT&&grid[ty][tx]!='#') {
            player_x=tx; player_y=ty;
        }

        for (int i = 0; i < floor_count; i++) {
            if (floor_x[i]==player_x && floor_y[i]==player_y) {
                if (addItem(floor_id[i])) {
                    cout << "PICKUP|" << floor_id[i] << endl;
                    floor_x[i]=floor_x[floor_count-1];
                    floor_y[i]=floor_y[floor_count-1];
                    floor_id[i]=floor_id[floor_count-1];
                    floor_count--;
                }
                break;
            }
        }
    }

    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x++) {
            char ch = grid[y][x];
            if (x==player_x && y==player_y) ch = '@';
            else {
                for (int i=0;i<floor_count;i++) {
                    if (floor_x[i]==x&&floor_y[i]==y) { ch='i'; break; }
                }
            }
            cout << ch;
        }
        cout << endl;
    }

    cout << "INV|" << item_count;
    for (int i = 0; i < item_count; i++) cout << "|" << item_ids[i];
    cout << endl;
    cout << "FLOOR|" << floor_count << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Pickup happens", expectedOutput: "PICKUP|", isPattern: true },
      { id: "g2", description: "Inventory has items", expectedOutput: "INV|", isPattern: true },
      { id: "g3", description: "Floor count decreases", expectedOutput: "FLOOR|", isPattern: true },
    ],
    hints: [
      "After moving, loop through floor items. If floor_x[i]==player_x && floor_y[i]==player_y, try addItem.",
      "On successful pickup, swap-with-last in ALL three floor arrays (x, y, id) and decrement floor_count.",
      "Render floor items by checking each cell against all floor positions, printing i if found.",
    ],
    estimatedMinutes: 15,
  },
};