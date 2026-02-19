import type { Lesson } from "@/types/lesson";

export const lesson83: Lesson = {
  id: "83-trail-effects",
  title: "Trail Effects",
  description: "Draw bullet trails by tracking position history in a ring buffer.",
  order: 83,
  xpReward: 200,
  tier: "pro",
  concepts: ["trail rendering", "position history", "ring buffer", "fade effect"],
  part1: {
    title: "Concept: Trail Effects",
    type: "concept",
    instructions: `# Trail Effects — Ring Buffers Make Bullets Visible

A bullet moves 16 pixels per frame. At that speed, it occupies each screen position for exactly one frame. The eye cannot track it. The solution: draw a trail behind the bullet showing where it was. Store the last N positions in a ring buffer. Render the current position with the bullet character, and previous positions with fading characters. The bullet becomes a streak across the screen.

## What Breaks Without This

Without trails, fast projectiles are invisible. A bullet fired upward at speed 16 moves from y=300 to y=284 to y=268. Each frame it is a single pixel in a different location. The player sees flickering, not motion. Trails connect the dots. The eye follows the trail and perceives smooth motion even when the object moves 16 pixels between frames.

## The Fix

A TrailBuffer stores N previous positions in a fixed-size array with a head index. Each frame, store the current position at positions[head], then advance head = (head + 1) % capacity. To render the trail, iterate backward from head. The most recent position gets the brightest character. Older positions fade.

\\\`\\\`\\\`
struct TrailBuffer {
    int posX[4];
    int posY[4];
    int head;
    int length;   // how many slots are filled
};

// Fade sequence: '|' (current) -> ':' (1 behind) -> '.' (2 behind) -> ' ' (3 behind)
char trailChars[] = {'|', ':', '.', ' '};
\\\`\\\`\\\`

The ring buffer is O(1) per frame — one write, no shifting. The capacity is fixed at compile time. No allocation. The trail renders by reading backwards from head, wrapping around the array.

## Your Task

1. Define TrailBuffer struct: posX[4], posY[4], head, length
2. Each bullet gets a TrailBuffer
3. 2 bullets: bullet_0 at (200, 300) moving up (vy=-4), bullet_1 at (160, 300) moving up (vy=-4)
4. Each frame: store current position in trail at positions[head], advance head
5. Render trail: current char '|', trail[head-1] as ':', trail[head-2] as '.', trail[head-3] as ' '
6. Simulate 5 frames
7. Print: \\\`TRAIL|frame|3|bullet_0|pos|(200,288)|trail|(:,200,292)(.,200,296)\\\`
8. Print: \\\`TRAIL|frame|5|bullet_0|pos|(200,280)|trail|(:,200,284)(.,200,288)\\\`
9. Print a grid showing bullets with trails below them
10. Print: \\\`TRAIL_SUMMARY|bullets_tracked|2|trail_length|3|chars|:|.|space\\\`

Expected output:
\\\`\\\`\\\`
TRAIL|frame|1|bullet_0|pos|(200,300)|trail|none
TRAIL|frame|1|bullet_1|pos|(160,300)|trail|none
TRAIL|frame|2|bullet_0|pos|(200,296)|trail|(:,200,300)
TRAIL|frame|2|bullet_1|pos|(160,296)|trail|(:,160,300)
TRAIL|frame|3|bullet_0|pos|(200,292)|trail|(:,200,296)(.,200,300)
TRAIL|frame|3|bullet_1|pos|(160,292)|trail|(:,160,296)(.,160,300)
TRAIL|frame|4|bullet_0|pos|(200,288)|trail|(:,200,292)(.,200,296)
TRAIL|frame|4|bullet_1|pos|(160,288)|trail|(:,160,292)(.,160,296)
TRAIL|frame|5|bullet_0|pos|(200,284)|trail|(:,200,288)(.,200,292)
TRAIL|frame|5|bullet_1|pos|(160,284)|trail|(:,160,288)(.,160,292)
TRAIL_SUMMARY|bullets_tracked|2|trail_length|3|chars|:|.|space
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Using a regular array and shifting elements every frame. Position 0 becomes position 1, position 1 becomes position 2. This is O(N) per frame. A ring buffer is O(1) — just write at head and increment. For 4 positions, shifting is trivial. For 60-frame trails at 1000 bullets, the difference matters.

## Elite Insight

Ring buffers are the fundamental data structure for streaming data. Audio buffers, network packet buffers, log rotation — all ring buffers. The key insight is that old data is overwritten by new data automatically. You never need to "delete" old positions. The head pointer advancing past them is the deletion. This is why ring buffers have zero overhead: the write IS the cleanup.

## Cross-Path Echo

Git reflog is a ring buffer of HEAD positions. Each checkout, commit, or reset writes the new HEAD position to the reflog. Old entries roll off the end after 90 days. You can recover lost commits by reading backward from the reflog head — exactly how trail rendering reads backward from the trail head. Same data structure, same traversal pattern.`,
    starterCode: `#include <iostream>
using namespace std;

const int TRAIL_SIZE = 4;
const int MAX_BULLETS = 8;

struct TrailBuffer {
    int posX[TRAIL_SIZE];
    int posY[TRAIL_SIZE];
    int head;
    int length;
};

struct Bullet {
    int x, y;
    int bvx, bvy;
    bool active;
    TrailBuffer trail;
};

Bullet bullets[MAX_BULLETS];
int bulletCount = 0;

// TODO: Write initTrail(TrailBuffer &t)
//   Set head=0, length=0

// TODO: Write addTrailPoint(TrailBuffer &t, int x, int y)
//   Store at positions[head], advance head = (head+1) % TRAIL_SIZE
//   Increment length (cap at TRAIL_SIZE)

// TODO: Write spawnBullet(x, y, bvx, bvy)
//   Set bullet properties and initTrail

// TODO: Write updateBullets()
//   For each active bullet: addTrailPoint, then move

// TODO: Write printTrail(frame, bulletIdx)
//   Print current position and trail points with ':' and '.'

int main() {
    // TODO: Spawn 2 bullets: (200,300,0,-4) and (160,300,0,-4)
    // TODO: Simulate 5 frames, print trail info each frame
    // TODO: Print TRAIL_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int TRAIL_SIZE = 4;
const int MAX_BULLETS = 8;

struct TrailBuffer {
    int posX[TRAIL_SIZE];
    int posY[TRAIL_SIZE];
    int head;
    int length;
};

struct Bullet {
    int x, y;
    int bvx, bvy;
    bool active;
    TrailBuffer trail;
};

Bullet bullets[MAX_BULLETS];
int bulletCount = 0;

void initTrail(TrailBuffer &t) {
    t.head = 0;
    t.length = 0;
}

void addTrailPoint(TrailBuffer &t, int tx, int ty) {
    t.posX[t.head] = tx;
    t.posY[t.head] = ty;
    t.head = (t.head + 1) % TRAIL_SIZE;
    if (t.length < TRAIL_SIZE) t.length++;
}

void spawnBullet(int sx, int sy, int svx, int svy) {
    Bullet &b = bullets[bulletCount];
    b.x = sx;
    b.y = sy;
    b.bvx = svx;
    b.bvy = svy;
    b.active = true;
    initTrail(b.trail);
    bulletCount++;
}

void updateBullets() {
    for (int i = 0; i < bulletCount; i++) {
        if (!bullets[i].active) continue;
        addTrailPoint(bullets[i].trail, bullets[i].x, bullets[i].y);
        bullets[i].x += bullets[i].bvx;
        bullets[i].y += bullets[i].bvy;
    }
}

void printTrail(int frame, int idx) {
    Bullet &b = bullets[idx];
    cout << "TRAIL|frame|" << frame << "|bullet_" << idx
         << "|pos|(" << b.x << "," << b.y << ")|trail|";

    char trailChars[] = {':', '.', ' '};
    int trailLen = b.trail.length;

    if (trailLen == 0) {
        cout << "none" << endl;
        return;
    }

    bool first = true;
    // Read backwards from head: most recent first
    int maxShow = (trailLen < 3) ? trailLen : 3;
    for (int t = 0; t < maxShow; t++) {
        int idx2 = (b.trail.head - 1 - t + TRAIL_SIZE) % TRAIL_SIZE;
        char ch = trailChars[t];
        if (ch == ' ') continue; // skip space chars in output
        if (!first) cout << "";
        cout << "(" << ch << "," << b.trail.posX[idx2] << "," << b.trail.posY[idx2] << ")";
        first = false;
    }
    cout << endl;
}

int main() {
    spawnBullet(200, 300, 0, -4);
    spawnBullet(160, 300, 0, -4);

    for (int frame = 1; frame <= 5; frame++) {
        updateBullets();
        printTrail(frame, 0);
        printTrail(frame, 1);
    }

    cout << "TRAIL_SUMMARY|bullets_tracked|" << bulletCount
         << "|trail_length|3|chars|:|.|space" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1 bullet_0 no trail", expectedOutput: "TRAIL\\|frame\\|1\\|bullet_0\\|pos\\|\\(200,296\\)\\|trail\\|\\(:,200,300\\)", isPattern: true },
      { id: "t2", description: "Frame 3 bullet_0 trail", expectedOutput: "TRAIL\\|frame\\|3\\|bullet_0\\|pos\\|\\(200,292\\)\\|trail\\|\\(:,200,296\\)\\(\\.,200,300\\)", isPattern: true },
      { id: "t3", description: "Frame 5 bullet_0 trail", expectedOutput: "TRAIL\\|frame\\|5\\|bullet_0\\|pos\\|\\(200,284\\)\\|trail\\|\\(:,200,288\\)\\(\\.,200,292\\)", isPattern: true },
      { id: "t4", description: "Frame 5 bullet_1 trail", expectedOutput: "TRAIL\\|frame\\|5\\|bullet_1\\|pos\\|\\(160,284\\)\\|trail\\|\\(:,160,288\\)\\(\\.,160,292\\)", isPattern: true },
      { id: "t5", description: "Trail summary", expectedOutput: "TRAIL_SUMMARY\\|bullets_tracked\\|2\\|trail_length\\|3\\|chars\\|:\\|\\.|space", isPattern: true },
    ],
    hints: [
      "addTrailPoint stores the current position BEFORE the bullet moves. So on frame 1, store (200,300) in the trail, then move to (200,296). The trail shows where the bullet WAS, not where it IS.",
      "Reading backwards from head: index = (head - 1 - t + TRAIL_SIZE) % TRAIL_SIZE. t=0 is the most recent (char ':'), t=1 is older (char '.'), t=2 is oldest (char ' '). The modulo wraps around the ring buffer.",
      "The trail length starts at 0 and grows to TRAIL_SIZE (4) as points are added. On frame 1, length=1 so only one trail point exists. By frame 3, length=3 so two visible trail characters appear (skipping space).",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Trail Effects",
    type: "game_builder",
    instructions: `# Game Builder: Trail Effects — Ring Buffer Position History

Wire trail rendering into the bullet system. Every bullet carries a ring buffer of its last 4 positions. Each frame, the current position is pushed into the buffer before movement. The renderer draws the bullet at its current position and the trail behind it with fading characters. Bullets become streaks. Motion becomes visible.

## What Breaks Without This

Without trails, fast bullets are single pixels that teleport across the screen. The player cannot track them. They cannot see their own fire. In a fast shooter, bullet visibility is critical for aiming feedback. Trails solve this without slowing the bullets down.

## The Fix

Attach a TrailBuffer to each bullet entity. In the movement system, push the current position into the trail before updating position. In the render system, draw the trail by reading backward from the ring buffer head. Each older position gets a dimmer character.

\\\`\\\`\\\`
// Before move: addTrailPoint(bullet.trail, bullet.x, bullet.y)
// After move: bullet.y += bullet.vy
// Render: '|' at current, ':' at trail[0], '.' at trail[1]
\\\`\\\`\\\`

## Your Task

1. TrailBuffer with posX[4], posY[4], head, length
2. Each bullet gets a TrailBuffer initialized on spawn
3. Each frame: store current position, advance head, then move bullet
4. Render: '|' at current, ':' at most recent trail, '.' at next
5. 2 bullets moving upward for 5 frames
6. Print: \\\`TRAIL|frame|3|bullet_0|pos|(200,292)|trail|(:,200,296)(.,200,300)\\\`
7. Print: \\\`TRAIL|frame|5|bullet_0|pos|(200,284)|trail|(:,200,288)(.,200,292)\\\`
8. Print: \\\`TRAIL_SUMMARY|bullets_tracked|2|trail_length|3|chars|:|.|space\\\`

## Beginner Trap

**Common Mistake:** Storing the position after movement instead of before. The trail should show where the bullet WAS, not where it IS. Store current position in the trail, then move. If you move first, the trail shows the same position as the bullet — no visual separation.

## Elite Insight

Trail length is a visual design parameter. Short trails (2-3 frames) look like fast dashes. Long trails (8-10 frames) look like laser beams. The ring buffer capacity should match the desired visual length. For gameplay clarity, shorter is usually better — long trails can obscure enemies behind them.

## Cross-Path Echo

Browser history is a trail buffer. Each page visit pushes the URL onto the stack. The back button reads backward through the history. The trail length is limited by memory settings. Old entries are discarded. The rendering difference: browsers show one entry at a time, your trail shows all entries simultaneously.`,
    starterCode: `#include <iostream>
using namespace std;

const int TRAIL_SIZE = 4;
const int MAX_BULLETS = 8;

struct TrailBuffer {
    int posX[TRAIL_SIZE];
    int posY[TRAIL_SIZE];
    int head;
    int length;
};

struct Bullet {
    int x, y;
    int bvx, bvy;
    bool active;
    TrailBuffer trail;
};

Bullet bullets[MAX_BULLETS];
int bulletCount = 0;

// TODO: Write initTrail(TrailBuffer &t)

// TODO: Write addTrailPoint(TrailBuffer &t, int x, int y)
//   Store at head, advance head = (head+1) % TRAIL_SIZE

// TODO: Write spawnBullet(x, y, bvx, bvy)

// TODO: Write updateBullets()
//   addTrailPoint before moving

// TODO: Write printTrail(frame, bulletIdx)

int main() {
    // TODO: Spawn 2 bullets
    // TODO: Simulate 5 frames
    // TODO: Print TRAIL_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int TRAIL_SIZE = 4;
const int MAX_BULLETS = 8;

struct TrailBuffer {
    int posX[TRAIL_SIZE];
    int posY[TRAIL_SIZE];
    int head;
    int length;
};

struct Bullet {
    int x, y;
    int bvx, bvy;
    bool active;
    TrailBuffer trail;
};

Bullet bullets[MAX_BULLETS];
int bulletCount = 0;

void initTrail(TrailBuffer &t) {
    t.head = 0;
    t.length = 0;
}

void addTrailPoint(TrailBuffer &t, int tx, int ty) {
    t.posX[t.head] = tx;
    t.posY[t.head] = ty;
    t.head = (t.head + 1) % TRAIL_SIZE;
    if (t.length < TRAIL_SIZE) t.length++;
}

void spawnBullet(int sx, int sy, int svx, int svy) {
    Bullet &b = bullets[bulletCount];
    b.x = sx;
    b.y = sy;
    b.bvx = svx;
    b.bvy = svy;
    b.active = true;
    initTrail(b.trail);
    bulletCount++;
}

void updateBullets() {
    for (int i = 0; i < bulletCount; i++) {
        if (!bullets[i].active) continue;
        addTrailPoint(bullets[i].trail, bullets[i].x, bullets[i].y);
        bullets[i].x += bullets[i].bvx;
        bullets[i].y += bullets[i].bvy;
    }
}

void printTrail(int frame, int idx) {
    Bullet &b = bullets[idx];
    cout << "TRAIL|frame|" << frame << "|bullet_" << idx
         << "|pos|(" << b.x << "," << b.y << ")|trail|";

    char trailChars[] = {':', '.', ' '};
    int trailLen = b.trail.length;

    if (trailLen == 0) {
        cout << "none" << endl;
        return;
    }

    bool first = true;
    int maxShow = (trailLen < 3) ? trailLen : 3;
    for (int t = 0; t < maxShow; t++) {
        int idx2 = (b.trail.head - 1 - t + TRAIL_SIZE) % TRAIL_SIZE;
        char ch = trailChars[t];
        if (ch == ' ') continue;
        if (!first) cout << "";
        cout << "(" << ch << "," << b.trail.posX[idx2] << "," << b.trail.posY[idx2] << ")";
        first = false;
    }
    cout << endl;
}

int main() {
    spawnBullet(200, 300, 0, -4);
    spawnBullet(160, 300, 0, -4);

    for (int frame = 1; frame <= 5; frame++) {
        updateBullets();
        printTrail(frame, 0);
        printTrail(frame, 1);
    }

    cout << "TRAIL_SUMMARY|bullets_tracked|" << bulletCount
         << "|trail_length|3|chars|:|.|space" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 3 bullet_0 trail", expectedOutput: "TRAIL\\|frame\\|3\\|bullet_0\\|pos\\|\\(200,292\\)\\|trail\\|\\(:,200,296\\)\\(\\.,200,300\\)", isPattern: true },
      { id: "t2", description: "Frame 5 bullet_0 trail", expectedOutput: "TRAIL\\|frame\\|5\\|bullet_0\\|pos\\|\\(200,284\\)\\|trail\\|\\(:,200,288\\)\\(\\.,200,292\\)", isPattern: true },
      { id: "t3", description: "Frame 5 bullet_1 trail", expectedOutput: "TRAIL\\|frame\\|5\\|bullet_1\\|pos\\|\\(160,284\\)\\|trail\\|\\(:,160,288\\)\\(\\.,160,292\\)", isPattern: true },
      { id: "t4", description: "Trail summary", expectedOutput: "TRAIL_SUMMARY\\|bullets_tracked\\|2\\|trail_length\\|3\\|chars\\|:\\|\\.|space", isPattern: true },
    ],
    hints: [
      "addTrailPoint stores the current position BEFORE the bullet moves. On frame 1, trail stores (200,300), then bullet moves to (200,296). The trail shows where the bullet was one frame ago.",
      "Ring buffer index math: (head - 1 - t + TRAIL_SIZE) % TRAIL_SIZE. t=0 gives the most recent trail point (char ':'). t=1 gives the next older point (char '.'). The modulo handles the wrap-around.",
      "Trail length grows from 0 to TRAIL_SIZE as points are added. On frame 1, length=1 (one trail point). On frame 2, length=2. By frame 4+, length is capped at TRAIL_SIZE=4. Only show up to 3 trail characters (skip space).",
    ],
    estimatedMinutes: 10,
  },
};
