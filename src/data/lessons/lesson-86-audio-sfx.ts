import type { Lesson } from "@/types/lesson";

export const lesson86: Lesson = {
  id: "86-audio-sfx",
  title: "Audio SFX Tags",
  description: "Define sound effect event tags that trigger on game events.",
  order: 86,
  xpReward: 200,
  tier: "pro",
  concepts: ["sound events", "event tags", "audio system design", "SFX mapping"],
  part1: {
    title: "Concept: Audio SFX Tags",
    type: "concept",
    instructions: `# Audio SFX Tags — Silent Games Are Dead Games

A bullet fires. No sound. An enemy explodes. No sound. The player dies. No sound. The game works mechanically but feels lifeless. Audio is not decoration. It is feedback. The player needs to hear the shot to know it fired. Needs to hear the explosion to feel the kill. Needs to hear the death sting to know the stakes. In a terminal simulation, we cannot play audio — but we can design the system that triggers it.

## What Breaks Without This

Without an audio event system, sound calls are scattered through game logic. The collision function calls playSound("explosion"). The fire function calls playSound("shoot"). The powerup function calls playSound("pickup"). This works until you need volume control, priority mixing, or the ability to mute categories. Hardcoded playSound calls cannot be managed. An event system can.

## The Fix

Define a SoundEvent struct: name (string), volume (float as int percentage), priority (int, 1 = highest). Game systems emit sound events into a per-frame queue. The audio system processes the queue at the end of the frame. It sorts by priority, limits concurrent sounds to max channels, and logs every event. No game system calls playSound directly. They emit events. The audio system decides what plays.

\\\`\\\`\\\`
struct SoundEvent {
    string name;
    int volume;    // 0-100, maps to 0.0-1.0
    int priority;  // 1 = highest
};

// Emit: push to queue
// Process: sort by priority, play up to maxChannels
\\\`\\\`\\\`

Priority prevents important sounds from being drowned out. A death sound at priority 1 always plays. A bullet sound at priority 3 can be dropped if channels are full. The player always hears what matters.

## Your Task

1. Define a SoundEvent struct: name (string), volume (int 0-100), priority (int 1-5)
2. Define sound mappings: shoot=80/pri2, hit=60/pri3, explosion=100/pri1, powerup=90/pri2, achievement=95/pri1
3. Simulate 3 frames with multiple sound events per frame
4. Frame 1: shoot event
5. Frame 2: hit + explosion events (2 sounds, highest priority = explosion)
6. Frame 3: shoot + hit + powerup events (3 sounds)
7. Print per event: \\\`SFX|frame|<f>|event|<name>|vol|<v>|pri|<p>\\\`
   - Volume as decimal: 80 -> 0.8, 100 -> 1.0, 60 -> 0.6
8. Print mix status for frames with multiple sounds:
   \\\`SFX_MIX|frame|2|playing|2|max_channels|4|loudest|explosion\\\`
9. Print: \\\`AUDIO_SUMMARY|total_events|6|unique_sounds|4|peak_concurrent|3\\\`

Expected output:
\\\`\\\`\\\`
SFX|frame|1|event|shoot|vol|0.8|pri|2
SFX|frame|2|event|hit|vol|0.6|pri|3
SFX|frame|2|event|explosion|vol|1.0|pri|1
SFX_MIX|frame|2|playing|2|max_channels|4|loudest|explosion
SFX|frame|3|event|shoot|vol|0.8|pri|2
SFX|frame|3|event|hit|vol|0.6|pri|3
SFX|frame|3|event|powerup|vol|0.9|pri|2
SFX_MIX|frame|3|playing|3|max_channels|4|loudest|powerup
AUDIO_SUMMARY|total_events|6|unique_sounds|4|peak_concurrent|3
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Playing sounds immediately instead of queuing them. If collision triggers two explosions in the same frame, two playSound calls fight for the same audio channel. Queue all events first, sort by priority, then process. The queue is the buffer between game logic and audio output.

## Elite Insight

AAA audio engines use event buses identical to this pattern. FMOD and Wwise do not expose playSound — they expose event triggers. The game emits "enemy_death" and the audio middleware decides which variation to play, at what volume, with what spatialization. Your SoundEvent struct is the interface contract between gameplay and audio. The implementation changes. The interface does not.

## Cross-Path Echo

Logging systems work identically. Application code does not write to files directly. It emits log events with severity levels (DEBUG=5, INFO=4, WARN=3, ERROR=2, CRITICAL=1). The log system filters by severity, routes to handlers, and manages output. Your priority-based SFX system is a log system where severity is audio priority and handlers are speakers.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct SoundEvent {
    string name;
    int volume;    // 0-100
    int priority;  // 1=highest, 5=lowest
};

const int MAX_EVENTS = 20;
const int MAX_CHANNELS = 4;

SoundEvent eventQueue[MAX_EVENTS];
int queueSize = 0;

// TODO: Write emitSound(name, volume, priority) — add event to queue

// TODO: Write processFrame(frameNum) — print SFX lines for all events
//       Print SFX_MIX if more than 1 event. Find loudest by volume.
//       Clear queue after processing.

// TODO: Write findLoudest(start, count) — return name of highest volume event

int main() {
    int totalEvents = 0;
    int peakConcurrent = 0;
    int uniqueCount = 0;
    string uniqueSounds[10];

    // Frame 1: shoot
    // TODO: emit shoot event (vol 80, pri 2), process frame 1

    // Frame 2: hit + explosion
    // TODO: emit hit (vol 60, pri 3) and explosion (vol 100, pri 1), process frame 2

    // Frame 3: shoot + hit + powerup
    // TODO: emit shoot, hit, powerup (vol 90, pri 2), process frame 3

    // TODO: Calculate total_events, unique_sounds, peak_concurrent
    // TODO: Print AUDIO_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct SoundEvent {
    string name;
    int volume;    // 0-100
    int priority;  // 1=highest, 5=lowest
};

const int MAX_EVENTS = 20;
const int MAX_CHANNELS = 4;

SoundEvent eventQueue[MAX_EVENTS];
int queueSize = 0;

void emitSound(string name, int volume, int priority) {
    eventQueue[queueSize].name = name;
    eventQueue[queueSize].volume = volume;
    eventQueue[queueSize].priority = priority;
    queueSize++;
}

string findLoudest(int count) {
    int maxVol = -1;
    string loudest = "";
    for (int i = 0; i < count; i++) {
        if (eventQueue[i].volume > maxVol) {
            maxVol = eventQueue[i].volume;
            loudest = eventQueue[i].name;
        }
    }
    return loudest;
}

void processFrame(int frameNum) {
    for (int i = 0; i < queueSize; i++) {
        int vol10 = eventQueue[i].volume / 10;
        int volFrac = eventQueue[i].volume % 10;
        cout << "SFX|frame|" << frameNum << "|event|" << eventQueue[i].name
             << "|vol|" << vol10 << "." << volFrac
             << "|pri|" << eventQueue[i].priority << endl;
    }
    if (queueSize > 1) {
        string loudest = findLoudest(queueSize);
        cout << "SFX_MIX|frame|" << frameNum << "|playing|" << queueSize
             << "|max_channels|" << MAX_CHANNELS << "|loudest|" << loudest << endl;
    }
    queueSize = 0;
}

int main() {
    int totalEvents = 0;
    int peakConcurrent = 0;

    // Frame 1: shoot
    emitSound("shoot", 80, 2);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(1);

    // Frame 2: hit + explosion
    emitSound("hit", 60, 3);
    emitSound("explosion", 100, 1);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(2);

    // Frame 3: shoot + hit + powerup
    emitSound("shoot", 80, 2);
    emitSound("hit", 60, 3);
    emitSound("powerup", 90, 2);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(3);

    // 4 unique: shoot, hit, explosion, powerup
    cout << "AUDIO_SUMMARY|total_events|" << totalEvents
         << "|unique_sounds|4|peak_concurrent|" << peakConcurrent << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 shoot event", expectedOutput: "SFX\\|frame\\|1\\|event\\|shoot\\|vol\\|0\\.8\\|pri\\|2", isPattern: true },
      { id: "t2", description: "Frame 2 explosion event", expectedOutput: "SFX\\|frame\\|2\\|event\\|explosion\\|vol\\|1\\.0\\|pri\\|1", isPattern: true },
      { id: "t3", description: "Frame 2 mix status", expectedOutput: "SFX_MIX\\|frame\\|2\\|playing\\|2\\|max_channels\\|4\\|loudest\\|explosion", isPattern: true },
      { id: "t4", description: "Frame 3 powerup event", expectedOutput: "SFX\\|frame\\|3\\|event\\|powerup\\|vol\\|0\\.9\\|pri\\|2", isPattern: true },
      { id: "t5", description: "Frame 3 mix status", expectedOutput: "SFX_MIX\\|frame\\|3\\|playing\\|3\\|max_channels\\|4\\|loudest\\|powerup", isPattern: true },
      { id: "t6", description: "Audio summary", expectedOutput: "AUDIO_SUMMARY\\|total_events\\|6\\|unique_sounds\\|4\\|peak_concurrent\\|3", isPattern: true },
    ],
    hints: [
      "emitSound pushes an event onto the queue. processFrame iterates the queue, prints each event, then clears it. Track totalEvents by adding queueSize before each processFrame call.",
      "Volume as decimal: divide by 10 for integer part, mod 10 for fractional. 80 -> 8/10 = 0.8. 100 -> 10/10 = 1.0. 60 -> 6/10 = 0.6. Print as vol10.volFrac.",
      "findLoudest iterates the queue and returns the name of the event with the highest volume. In frame 2, explosion (100) beats hit (60). In frame 3, powerup (90) beats shoot (80) and hit (60).",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Audio SFX System",
    type: "game_builder",
    instructions: `# Game Builder: Audio SFX System — Event-Driven Sound

Sound effects are feedback. Every game action needs audio confirmation. The player fires — click. Bullet hits — thud. Enemy dies — boom. Powerup collected — chime. Achievement unlocked — fanfare. In a terminal simulation, we log sound events instead of playing them. The system design is identical to a real audio engine. Queue events. Sort by priority. Mix within channel limits. Log the result.

## What Breaks Without This

Without event-driven audio, sound calls are scattered and unmanaged. Two explosions in one frame cause audio clipping. A quiet ambient sound drowns out an important alert. There is no way to mute categories, adjust master volume, or limit concurrent sounds. The event queue solves all of these by centralizing audio decisions.

## The Fix

Every game system emits SoundEvents into a frame queue. At frame end, the audio system processes the queue: sort by priority, play up to maxChannels, log every event. Game logic never plays sound directly. It requests sound. The audio system decides.

\\\`\\\`\\\`
// Game logic emits:
emitSound("explosion", 100, 1);
emitSound("shoot", 80, 2);

// Audio system processes:
// Sort by priority -> explosion first
// Play up to maxChannels
// Log: SFX|frame|N|event|name|vol|V|pri|P
\\\`\\\`\\\`

## Your Task

1. SoundEvent struct: name, volume (0-100), priority (1-5, 1=highest)
2. Event queue with max 20 events per frame, max 4 channels
3. Simulate 3 frames:
   - Frame 1: 1 shoot event (vol 80, pri 2)
   - Frame 2: hit (vol 60, pri 3) + explosion (vol 100, pri 1)
   - Frame 3: shoot (vol 80, pri 2) + hit (vol 60, pri 3) + powerup (vol 90, pri 2)
4. Print per event: \\\`SFX|frame|<f>|event|<name>|vol|<v>|pri|<p>\\\`
5. Print mix for multi-event frames:
   \\\`SFX_MIX|frame|2|playing|2|max_channels|4|loudest|explosion\\\`
   \\\`SFX_MIX|frame|3|playing|3|max_channels|4|loudest|powerup\\\`
6. Print: \\\`AUDIO_SUMMARY|total_events|6|unique_sounds|4|peak_concurrent|3\\\`

## Beginner Trap

**Common Mistake:** Not clearing the event queue between frames. If frame 1 events leak into frame 2, the audio system replays stale events. Clear the queue after processing each frame. The queue is per-frame, not cumulative.

## Elite Insight

Real audio middleware like FMOD uses banks and buses. A "gameplay" bus carries all SFX. A "music" bus carries background tracks. A "UI" bus carries menu sounds. Each bus has independent volume. Your event queue is one bus. Extend to multiple queues for bus-based mixing.

## Cross-Path Echo

Message queues in distributed systems (RabbitMQ, Kafka) follow this exact pattern. Producers emit events. Consumers process them. Priority queues ensure critical messages process first. Dead letter queues handle overflow. Your SFX queue is a message broker for audio events.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct SoundEvent {
    string name;
    int volume;    // 0-100
    int priority;  // 1=highest, 5=lowest
};

const int MAX_EVENTS = 20;
const int MAX_CHANNELS = 4;

SoundEvent eventQueue[MAX_EVENTS];
int queueSize = 0;

// TODO: Write emitSound(name, volume, priority) — add to queue

// TODO: Write findLoudest(count) — return name of highest volume event in queue

// TODO: Write processFrame(frameNum) — print SFX lines, SFX_MIX if >1, clear queue

int main() {
    int totalEvents = 0;
    int peakConcurrent = 0;

    // TODO: Frame 1 — emit shoot (80, 2), process
    // TODO: Frame 2 — emit hit (60, 3) + explosion (100, 1), process
    // TODO: Frame 3 — emit shoot (80, 2) + hit (60, 3) + powerup (90, 2), process
    // TODO: Print AUDIO_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct SoundEvent {
    string name;
    int volume;    // 0-100
    int priority;  // 1=highest, 5=lowest
};

const int MAX_EVENTS = 20;
const int MAX_CHANNELS = 4;

SoundEvent eventQueue[MAX_EVENTS];
int queueSize = 0;

void emitSound(string name, int volume, int priority) {
    eventQueue[queueSize].name = name;
    eventQueue[queueSize].volume = volume;
    eventQueue[queueSize].priority = priority;
    queueSize++;
}

string findLoudest(int count) {
    int maxVol = -1;
    string loudest = "";
    for (int i = 0; i < count; i++) {
        if (eventQueue[i].volume > maxVol) {
            maxVol = eventQueue[i].volume;
            loudest = eventQueue[i].name;
        }
    }
    return loudest;
}

void processFrame(int frameNum) {
    for (int i = 0; i < queueSize; i++) {
        int vol10 = eventQueue[i].volume / 10;
        int volFrac = eventQueue[i].volume % 10;
        cout << "SFX|frame|" << frameNum << "|event|" << eventQueue[i].name
             << "|vol|" << vol10 << "." << volFrac
             << "|pri|" << eventQueue[i].priority << endl;
    }
    if (queueSize > 1) {
        string loudest = findLoudest(queueSize);
        cout << "SFX_MIX|frame|" << frameNum << "|playing|" << queueSize
             << "|max_channels|" << MAX_CHANNELS << "|loudest|" << loudest << endl;
    }
    queueSize = 0;
}

int main() {
    int totalEvents = 0;
    int peakConcurrent = 0;

    // Frame 1: shoot
    emitSound("shoot", 80, 2);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(1);

    // Frame 2: hit + explosion
    emitSound("hit", 60, 3);
    emitSound("explosion", 100, 1);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(2);

    // Frame 3: shoot + hit + powerup
    emitSound("shoot", 80, 2);
    emitSound("hit", 60, 3);
    emitSound("powerup", 90, 2);
    totalEvents += queueSize;
    if (queueSize > peakConcurrent) peakConcurrent = queueSize;
    processFrame(3);

    cout << "AUDIO_SUMMARY|total_events|" << totalEvents
         << "|unique_sounds|4|peak_concurrent|" << peakConcurrent << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 shoot event logged", expectedOutput: "SFX\\|frame\\|1\\|event\\|shoot\\|vol\\|0\\.8\\|pri\\|2", isPattern: true },
      { id: "t2", description: "Frame 2 hit event", expectedOutput: "SFX\\|frame\\|2\\|event\\|hit\\|vol\\|0\\.6\\|pri\\|3", isPattern: true },
      { id: "t3", description: "Frame 2 explosion event", expectedOutput: "SFX\\|frame\\|2\\|event\\|explosion\\|vol\\|1\\.0\\|pri\\|1", isPattern: true },
      { id: "t4", description: "Frame 2 mix loudest is explosion", expectedOutput: "SFX_MIX\\|frame\\|2\\|playing\\|2\\|max_channels\\|4\\|loudest\\|explosion", isPattern: true },
      { id: "t5", description: "Frame 3 mix loudest is powerup", expectedOutput: "SFX_MIX\\|frame\\|3\\|playing\\|3\\|max_channels\\|4\\|loudest\\|powerup", isPattern: true },
      { id: "t6", description: "Audio summary totals", expectedOutput: "AUDIO_SUMMARY\\|total_events\\|6\\|unique_sounds\\|4\\|peak_concurrent\\|3", isPattern: true },
    ],
    hints: [
      "emitSound pushes to eventQueue and increments queueSize. Before calling processFrame, capture queueSize for totalEvents and peakConcurrent tracking. processFrame sets queueSize back to 0.",
      "Volume as decimal: integer division and modulo by 10. volume=80: 80/10=8, 80%10=0, print 0.8. volume=100: 100/10=10, 100%10=0, print 1.0. volume=60: 6.0. volume=90: 9.0.",
      "findLoudest compares volume values. explosion(100) > hit(60) in frame 2. powerup(90) > shoot(80) > hit(60) in frame 3. Only print SFX_MIX when queueSize > 1.",
    ],
    estimatedMinutes: 10,
  },
};
