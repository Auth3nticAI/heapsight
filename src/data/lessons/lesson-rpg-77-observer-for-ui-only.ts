import { Lesson } from "@/types/lesson";

export const lessonRPG77: Lesson = {
  id: "rpg-77-observer-for-ui-only",
  title: "Observer for UI Only",
  description: "UI reads game events from a ring buffer — it never scrapes game state directly. Decoupled rendering starts here.",
  order: 77,
  xpReward: 100,
  tier: "pro",
  concepts: ["observer pattern", "event queue", "ring buffer", "UI decoupling", "event-driven rendering"],
  part1: {
    title: "Concept: Event-Driven UI",
    type: "concept",
    instructions: `# Observer for UI Only

## Mental Model

Your UI code reads directly from WorldState: \`cout << world.hp[0]\`.
This couples rendering to game state layout. Change the struct,
break the UI. Fix: game systems push events to a ring buffer.
The UI reads events, never touching game state directly.

## What Breaks Without This

Without event-driven UI:
- Renaming a field in World breaks every render function
- UI must know the exact layout of game state arrays
- Adding new systems requires updating all render code
- Game logic and rendering are inseparable

## The Fix

Push typed events to a fixed-size ring buffer during gameplay:

\`\`\`cpp
enum EventType { EVT_DAMAGE, EVT_KILL, EVT_LEVEL_UP, EVT_QUEST };
struct GameEvent { EventType type; int entity_id; int value; };

const int EVT_BUF = 64;
struct EventQueue {
    GameEvent events[EVT_BUF];
    int head;   // Next write position
    int count;  // Events in buffer
};
\`\`\`

## Key Concepts

- **Ring buffer**: fixed-size, wraps around, no allocation
- **Push/read pattern**: game pushes, UI reads and clears
- **Event types**: enum-based, same pattern as Command types (L76)
- **Decoupling**: UI depends on events, not on World layout

## Performance Insight

64 events × 12 bytes = 768 bytes. Sequential access, cache-friendly.
Zero heap. Events written once, read once, discarded.

## Memory Insight

Fixed-size ring buffer means no allocation during gameplay.
If it fills, oldest events drop — acceptable for UI since
players can't read 64 messages per turn anyway.

## Your Task

Define EventType, GameEvent, and EventQueue. Write pushEvent that
adds an event to the buffer. Push 2 events and print them.

## Beginner Trap

\`\`\`cpp
// BAD: UI reads game state directly
cout << "HP: " << world.hp[0];  // Coupled!
// FIX: push EVT_DAMAGE event, UI reads from queue
\`\`\`

## Elite Insight

Unity's ECS uses a similar event buffer pattern. Systems write
events, UI systems consume them. No direct state coupling.

## Systems Thinking Connection

Events connect to the command pattern (L76): commands flow IN
(player to game), events flow OUT (game to UI). Same struct-based
approach, same ring buffer pattern.

## Skill Reinforcement

- Enum types from L13/L76
- Ring buffer modulo from L64 (replay log)
- Struct design from L11

## Mastery Check

You pass when EVT_PUSH shows 2 events added and the queue count is 2.`,
    starterCode: `#include <iostream>
using namespace std;

enum EventType { EVT_DAMAGE, EVT_KILL, EVT_LEVEL_UP, EVT_QUEST };
struct GameEvent { EventType type; int entity_id; int value; };
const int EVT_BUF = 64;
struct EventQueue { GameEvent events[EVT_BUF]; int head; int count; };

// TODO: Write pushEvent(EventQueue& q, EventType type, int eid, int val)
// If count < EVT_BUF: set events[head], advance head with modulo, increment count
// Print EVT_PUSH|type=T|eid=E|val=V

int main() {
    EventQueue q = {}; q.head = 0; q.count = 0;

    // TODO: pushEvent(q, EVT_DAMAGE, 1, 3)
    // TODO: pushEvent(q, EVT_KILL, 2, 0)
    // Print EVT_COUNT|2

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum EventType { EVT_DAMAGE, EVT_KILL, EVT_LEVEL_UP, EVT_QUEST };
struct GameEvent { EventType type; int entity_id; int value; };
const int EVT_BUF = 64;
struct EventQueue { GameEvent events[EVT_BUF]; int head; int count; };

void pushEvent(EventQueue& q, EventType type, int eid, int val) {
    if (q.count >= EVT_BUF) return;
    q.events[q.head] = {type, eid, val};
    q.head = (q.head + 1) % EVT_BUF; q.count++;
    cout << "EVT_PUSH|type=" << type << "|eid=" << eid << "|val=" << val << endl;
}

int main() {
    EventQueue q = {}; q.head = 0; q.count = 0;
    pushEvent(q, EVT_DAMAGE, 1, 3);
    pushEvent(q, EVT_KILL, 2, 0);
    cout << "EVT_COUNT|" << q.count << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "First event pushed", expectedOutput: "EVT_PUSH|type=0|eid=1|val=3", isPattern: false },
      { id: "t2", description: "Second event pushed", expectedOutput: "EVT_PUSH|type=1|eid=2|val=0", isPattern: false },
      { id: "t3", description: "Queue count is 2", expectedOutput: "EVT_COUNT|2", isPattern: false },
    ],
    hints: [
      "pushEvent writes to q.events[q.head], then q.head = (q.head + 1) % EVT_BUF, then q.count++.",
      "Check q.count < EVT_BUF before writing to prevent buffer overflow.",
      "The enum integer value prints: EVT_DAMAGE=0, EVT_KILL=1, etc.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Event-Driven UI",
    type: "game_builder",
    instructions: `# Build: Event Queue for UI

## Mental Model

Part 1 proved pushEvent works. Now add renderEvents: read all events
from the ring buffer, print UI messages per type, then clear the
buffer. The UI pass never touches game state — only the event queue.

## What Breaks Without This

Without render-from-events:
- UI must know every field in World
- Adding game features requires updating all render code
- Can't replay UI events without replaying game state

## The Fix

renderEvents calculates the start index, reads count events, prints
type-specific messages, then clears the buffer (count = 0).

## Key Concepts

- **Ring buffer read**: start = (head - count + size) % size
- **Type-specific rendering**: switch on event type for different formats
- **Buffer clear**: set count to 0 after reading
- **Event name mapping**: helper function for type-to-string

## Performance Insight

Reading 4 events from a 64-slot ring buffer: 4 sequential reads.
The entire render pass fits in a single cache line.

## Memory Insight

Events are 12 bytes each. The buffer is stack-allocated. After
rendering, count resets to 0 — the memory is reused next tick.

## Your Task

1. Write \`pushEvent\` with PUSH output per type name
2. Write \`renderEvents\` that reads and prints UI messages
3. Push 4 events: DAMAGE, KILL, LEVEL_UP, QUEST
4. Render them all and print EVENTS_RENDERED|4

## Beginner Trap

\`\`\`cpp
// BAD: reading from index 0 instead of calculated start
for (int i = 0; i < q.count; i++)
    render(q.events[i]);  // Wrong if head wrapped!
// FIX: start = (head - count + size) % size
\`\`\`

## Elite Insight

Lock-free ring buffers (SPSC queues) are used in audio engines
and networking. This single-threaded version teaches the same
index arithmetic without thread-safety complexity.

## Mastery Check

You pass when all 4 PUSH lines and 4 UI lines print correctly,
followed by EVENTS_RENDERED|4.`,
    starterCode: `#include <iostream>
using namespace std;

enum EventType { EVT_DAMAGE, EVT_KILL, EVT_LEVEL_UP, EVT_QUEST };
struct GameEvent { EventType type; int entity_id; int value; };
const int EVT_BUF = 64;
struct EventQueue { GameEvent events[EVT_BUF]; int head; int count; };

const char* evtName(EventType t) {
    switch(t) { case EVT_DAMAGE: return "DAMAGE"; case EVT_KILL: return "KILL"; case EVT_LEVEL_UP: return "LEVEL_UP"; case EVT_QUEST: return "QUEST"; } return "?";
}

// TODO: Write pushEvent(EventQueue& q, EventType type, int eid, int val)
// Print PUSH|<name>|eid=E|val=V

// TODO: Write renderEvents(EventQueue& q)
// Calculate start, read events, print UI|TYPE|... per type, clear buffer
// Print EVENTS_RENDERED|count at end

int main() {
    EventQueue q = {}; q.head = 0; q.count = 0;
    // TODO: Push 4 events: DAMAGE(1,3), KILL(2,0), LEVEL_UP(0,2), QUEST(5,1)
    // TODO: renderEvents(q)
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

enum EventType { EVT_DAMAGE, EVT_KILL, EVT_LEVEL_UP, EVT_QUEST };
struct GameEvent { EventType type; int entity_id; int value; };
const int EVT_BUF = 64;
struct EventQueue { GameEvent events[EVT_BUF]; int head; int count; };

const char* evtName(EventType t) {
    switch(t) { case EVT_DAMAGE: return "DAMAGE"; case EVT_KILL: return "KILL"; case EVT_LEVEL_UP: return "LEVEL_UP"; case EVT_QUEST: return "QUEST"; } return "?";
}

void pushEvent(EventQueue& q, EventType type, int eid, int val) {
    if (q.count >= EVT_BUF) return;
    q.events[q.head] = {type, eid, val};
    q.head = (q.head + 1) % EVT_BUF; q.count++;
    cout << "PUSH|" << evtName(type) << "|eid=" << eid << "|val=" << val << endl;
}

void renderEvents(EventQueue& q) {
    int start = (q.head - q.count + EVT_BUF) % EVT_BUF;
    int rendered = q.count;
    for (int i = 0; i < q.count; i++) {
        GameEvent& e = q.events[(start + i) % EVT_BUF];
        switch (e.type) {
            case EVT_DAMAGE: cout << "UI|DAMAGE|entity=" << e.entity_id << "|amount=" << e.value << endl; break;
            case EVT_KILL: cout << "UI|KILL|entity=" << e.entity_id << endl; break;
            case EVT_LEVEL_UP: cout << "UI|LEVEL_UP|entity=" << e.entity_id << "|level=" << e.value << endl; break;
            case EVT_QUEST: cout << "UI|QUEST|entity=" << e.entity_id << "|quest=" << e.value << endl; break;
        }
    }
    q.count = 0;
    cout << "EVENTS_RENDERED|" << rendered << endl;
}

int main() {
    EventQueue q = {}; q.head = 0; q.count = 0;
    pushEvent(q, EVT_DAMAGE, 1, 3);
    pushEvent(q, EVT_KILL, 2, 0);
    pushEvent(q, EVT_LEVEL_UP, 0, 2);
    pushEvent(q, EVT_QUEST, 5, 1);
    renderEvents(q);
    return 0;
}`,
    tests: [
      { id: "g1", description: "Damage event pushed", expectedOutput: "PUSH|DAMAGE|eid=1|val=3", isPattern: false },
      { id: "g2", description: "UI renders damage", expectedOutput: "UI|DAMAGE|entity=1|amount=3", isPattern: false },
      { id: "g3", description: "UI renders kill", expectedOutput: "UI|KILL|entity=2", isPattern: false },
      { id: "g4", description: "All events rendered", expectedOutput: "EVENTS_RENDERED|4", isPattern: false },
    ],
    hints: [
      "pushEvent writes to q.events[q.head], advances head with modulo, increments count. Use evtName() for the type string.",
      "renderEvents: start = (q.head - q.count + EVT_BUF) % EVT_BUF. Read from (start+i) % EVT_BUF.",
      "After the render loop, set q.count = 0 to clear. Print EVENTS_RENDERED with the pre-clear count.",
    ],
    estimatedMinutes: 12,
  },
};