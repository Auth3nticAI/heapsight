import { Lesson } from "@/types/lesson";

export const lessonRPG18: Lesson = {
  id: "rpg-18-combat-pass-v0",
  title: "Combat Pass v0",
  description: "Combat extracted into its own pass: resolveCombat(). Checks adjacency, applies damage. Separate from movement.",
  order: 18,
  xpReward: 100,
  tier: "pro",
  concepts: ["combat pass", "system isolation", "adjacency check", "damage application", "pass separation"],
  part1: {
    title: "Concept: Combat Pass",
    type: "concept",
    instructions: `# Combat Pass v0

## Mental Model

Combat is a system, not a side effect. In Lessons 8–9, combat was inline code — adjacency checks and damage scattered through the game loop. Now combat gets its own named pass: resolveCombat(). It runs after movement resolution, checks which entities are adjacent, and applies damage. Nothing else happens in this pass. Movement is done. Cleanup comes after. Combat is isolated.

## What Breaks Without This

\`\`\`cpp
// Combat tangled with movement
void resolveCommands(WorldState& w) {
    for (int i = 0; i < w.cmd_count; i++) {
        Command& c = w.cmd_queue[i];
        if (c.type == CMD_MOVE) {
            // move entity...
        }
        if (c.type == CMD_ATTACK) {
            // attack also here? What if move hasn't finished?
            // Entity 0 attacks entity 1 at OLD position?
        }
    }
}
\`\`\`

If combat and movement share the same resolve pass, the attack might use stale positions. Entity 0 moves, entity 1 hasn't moved yet, the attack checks adjacency against mixed state. Isolating combat into its own pass guarantees all movement is complete before any combat checks run.

## The Fix: resolveCombat()

The combat pass is a separate function that runs after resolveCommands:

\`\`\`cpp
void resolveCombat(WorldState& w) {
    // Check player (entity 0) adjacent to any enemy
    for (int i = 1; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        int dx = w.pos_x[0] - w.pos_x[i];
        int dy = w.pos_y[0] - w.pos_y[i];
        if (dx < 0) dx = -dx;
        if (dy < 0) dy = -dy;
        if (dx + dy == 1) { // Manhattan distance 1 = adjacent
            // Player hits enemy
            w.hp[i] -= 10;
            cout << "COMBAT|hero->orc|dmg=10|hp=" << w.hp[i] << endl;
            // Enemy hits player
            w.hp[0] -= 5;
            cout << "COMBAT|orc->hero|dmg=5|hp=" << w.hp[0] << endl;
        }
    }
}
\`\`\`

This function does one thing: check adjacency and apply damage. It reads positions that are already final (movement is resolved). It writes only to hp arrays. No position changes. No cleanup. Just damage.

The pipeline is now: enqueue → resolveCommands (movement) → resolveCombat (damage) → render. Each pass has a single responsibility. You can test resolveCombat in isolation by setting up positions and calling it directly.

## Key Concepts

- **System isolation** — combat is its own function. It touches only hp, reads only positions.
- **Adjacency check** — Manhattan distance of 1 means the entities share a tile edge. Not diagonal.
- **Post-movement execution** — combat runs after all moves are resolved. Positions are final.
- **Bidirectional damage** — player hits enemy, enemy hits player. Both in the same combat pass.

## Performance Insight

The combat pass checks player vs every alive enemy: O(N) where N = entity count. For 16 enemies, 16 distance checks — nanoseconds. The adjacency check is 2 subtractions, 2 abs values, and 1 comparison. No branching beyond the alive check. The SoA layout means pos_x and pos_y are contiguous arrays — the prefetcher loves this.

## Memory Insight

resolveCombat reads from pos_x, pos_y, alive arrays and writes to hp array — all within WorldState. Zero allocation. The function's local variables (dx, dy) are stack temporaries. The damage values (10, 5) are constants. Nothing is created. Nothing is destroyed. Just reads and writes to existing arrays.

## Your Task

Implement resolveCombat(). Place player at (3,1) and enemy at (4,1) — adjacent. Call resolveCombat once. Print combat results:

\`\`\`
COMBAT|hero->orc|dmg=10|hp=20
COMBAT|orc->hero|dmg=5|hp=95
\`\`\`

## Beginner Trap

**Checking adjacency with \`==\` on both axes.** \`if (px == ex && py == ey)\` checks for overlap, not adjacency. Adjacent means Manhattan distance 1: same row and one column apart, or same column and one row apart. Use \`abs(dx) + abs(dy) == 1\`.

## Elite Insight

Nethack's combat system isolates melee resolution from movement resolution. After all entities have moved (or attempted to move), the attack phase checks adjacency and resolves hits. The separation allows Nethack to handle complex scenarios: moving into an occupied tile triggers an attack automatically. Your resolveCombat is the same architectural pattern — movement first, then combat, never interleaved.

## Systems Thinking Connection

This pass separation mirrors the Platformer path's collision resolution: physics integrate first (movement), then collision detect and resolve. The key principle is the same across paths — don't mix computation phases. Each phase reads final results from the previous phase.

## Skill Reinforcement

Lesson 8 introduced adjacency-based melee as inline code. Lesson 9 added HP and death. This lesson extracts combat into a named pass — the same logic, but architecturally isolated. Lesson 19 will add the cleanup pass that removes dead entities after combat.

## Mastery Check

Why does resolveCombat run AFTER resolveCommands, not before? Answer: Combat checks adjacency using current positions. If combat ran before movement resolution, it would check adjacency against last tick's positions. An entity that just moved adjacent would not be detected. The pipeline order guarantees combat sees the positions that result from THIS tick's commands.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

int pos_x[MAX_E], pos_y[MAX_E];
int hp[MAX_E];
bool alive[MAX_E];
int entity_count = 0;

// TODO: implement resolveCombat()
// Check if player (entity 0) is adjacent to any alive enemy (entities 1+)
// Adjacent = Manhattan distance 1: abs(dx)+abs(dy)==1
// If adjacent: player deals 10 dmg to enemy, enemy deals 5 dmg to player
// Print: COMBAT|hero->orc|dmg=10|hp=N  and  COMBAT|orc->hero|dmg=5|hp=N

int main() {
    // Player at (3,1), 100 HP
    pos_x[0]=3; pos_y[0]=1; hp[0]=100; alive[0]=true;
    // Orc at (4,1), 30 HP - adjacent!
    pos_x[1]=4; pos_y[1]=1; hp[1]=30; alive[1]=true;
    entity_count=2;

    // TODO: call resolveCombat()

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

int pos_x[MAX_E], pos_y[MAX_E];
int hp[MAX_E];
bool alive[MAX_E];
int entity_count = 0;

void resolveCombat() {
    for (int i = 1; i < entity_count; i++) {
        if (!alive[i]) continue;
        int dx = pos_x[0] - pos_x[i];
        int dy = pos_y[0] - pos_y[i];
        if (dx < 0) dx = -dx;
        if (dy < 0) dy = -dy;
        if (dx + dy == 1) {
            hp[i] -= 10;
            cout << "COMBAT|hero->orc|dmg=10|hp=" << hp[i] << endl;
            hp[0] -= 5;
            cout << "COMBAT|orc->hero|dmg=5|hp=" << hp[0] << endl;
        }
    }
}

int main() {
    pos_x[0]=3; pos_y[0]=1; hp[0]=100; alive[0]=true;
    pos_x[1]=4; pos_y[1]=1; hp[1]=30; alive[1]=true;
    entity_count=2;

    resolveCombat();

    return 0;
}`,
    tests: [
      { id: "t1", description: "Player deals 10 damage to orc", expectedOutput: "COMBAT\\|hero->orc\\|dmg=10\\|hp=20", isPattern: true },
      { id: "t2", description: "Orc deals 5 damage to player", expectedOutput: "COMBAT\\|orc->hero\\|dmg=5\\|hp=95", isPattern: true },
      { id: "t3", description: "Combat uses adjacency check", expectedOutput: "COMBAT", isPattern: true },
    ],
    hints: [
      "resolveCombat loops entities 1 to entity_count-1, checking adjacency to entity 0 (player).",
      "Adjacency: compute dx = abs(pos_x[0] - pos_x[i]), dy = abs(pos_y[0] - pos_y[i]). If dx + dy == 1, they are adjacent.",
      "Player at (3,1), orc at (4,1): dx=1, dy=0, sum=1 -> adjacent. Player deals 10, orc deals 5.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Game with Separate Move and Combat Passes",
    type: "game_builder",
    instructions: `# Build: Game with Separate Move and Combat Passes

## Mental Model

The game pipeline now has four distinct phases: enqueue commands, resolve movement, resolve combat, render. Each pass has a single job. Movement changes positions. Combat changes HP. Render displays the result. The order is locked: move → fight → show. This is the pipeline from Lesson 15, now with real content in each pass.

## What Breaks Without This

Without a separate combat pass, damage is applied during movement resolution. The enemy takes a hit before its move command is processed. It might die at its old position and never reach the tile it was walking to. Isolating combat guarantees all movement completes first — then combat checks adjacency against final positions.

## The Fix

Add resolveCombat(WorldState& w) to the game_tick pipeline, called after resolveCommands. The player walks toward the enemy over 3 ticks. On the tick they become adjacent, combat fires automatically. Both deal damage. The pipeline is visible in the output: RESOLVE lines for movement, COMBAT lines for damage.

## Key Concepts

- **Pipeline order** — enqueue → resolve movement → resolve combat → render.
- **Automatic melee** — combat triggers when adjacent, no explicit attack command needed.
- **Damage visibility** — COMBAT lines show exactly who hit whom and for how much.
- **State accumulation** — HP decreases across ticks as combat continues.

## Performance Insight

Adding a separate combat pass means two loops per tick instead of one: one for movement, one for combat. The total work is the same — same adjacency checks, same damage application. But the passes are independently profilable. If combat becomes slow (50 enemies), you can optimize resolveCombat without touching resolveCommands.

## Memory Insight

resolveCombat reads pos_x, pos_y, alive from WorldState and writes to hp — all existing arrays. No new allocations. The function uses a few stack integers for distance calculations. The entire combat system fits in the same memory footprint as the previous lesson.

## Your Task

Build a 5-tick game. Player moves right each tick toward the enemy at (5,1). On tick 4 (player reaches (4,1), adjacent to enemy at (5,1)), combat begins and continues each subsequent tick:

\`\`\`
TICK|1
RESOLVE|move|entity=0|to=2,1
ENTITY|hero|player|48|24|24|24
ENTITY|orc|enemy|120|24|24|24
TURN|1
HP|100
GOLD|0
GAME_MESSAGE|No combat
TICK|2
RESOLVE|move|entity=0|to=3,1
ENTITY|hero|player|72|24|24|24
ENTITY|orc|enemy|120|24|24|24
TURN|2
HP|100
GOLD|0
GAME_MESSAGE|No combat
TICK|3
RESOLVE|move|entity=0|to=4,1
COMBAT|hero->orc|dmg=10|hp=20
COMBAT|orc->hero|dmg=5|hp=95
ENTITY|hero|player|96|24|24|24
ENTITY|orc|enemy|120|24|24|24
TURN|3
HP|95
GOLD|0
GAME_MESSAGE|Combat! Hero HP: 95 Orc HP: 20
TICK|4
RESOLVE|move|entity=0|to=5,1
ENTITY|hero|player|120|24|24|24
ENTITY|orc|enemy|120|24|24|24
TURN|4
HP|95
GOLD|0
GAME_MESSAGE|No combat
TICK|5
ENTITY|hero|player|120|24|24|24
ENTITY|orc|enemy|120|24|24|24
TURN|5
HP|95
GOLD|0
GAME_MESSAGE|No combat
\`\`\`

Note: On tick 3, player reaches (4,1) which is adjacent to enemy at (5,1) — combat fires. On tick 4, player moves to (5,1) — same tile as enemy, Manhattan distance 0, NOT adjacent — no combat. Adjacency means distance 1, not 0.

## Beginner Trap

**Triggering combat when entities overlap (distance 0).** Adjacent means Manhattan distance exactly 1, not ≤ 1. If two entities occupy the same tile, they are overlapping, not adjacent. Combat should only trigger at distance 1. This prevents double-hits and position confusion.

## Elite Insight

Valve's Source engine separates physics simulation from damage application. The physics tick resolves all movement and collision. Then a separate damage pass processes hit events. This prevents a bullet from dealing damage before it has finished moving — the same principle as your separate combat pass. Movement is physics. Damage is game logic. Keep them apart.

## Mastery Check

If you add a second enemy at (2,1) and the player starts at (1,1), which enemy gets hit first? Answer: The combat pass loops enemies starting at index 1. It checks entity 1 first, then entity 2. If entity 1 is at (5,1) and entity 2 is at (2,1), and the player is at (1,1) — only entity 2 is adjacent (distance 1). Entity 1 is not adjacent (distance 4). The loop order doesn't matter because only adjacent enemies trigger combat.`,
    starterCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=16, MAX_CMDS=64;
const int CMD_MOVE=1;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    Command cmd_queue[MAX_CMDS];
    int cmd_count;
    int turn;
    int gold;
};

void enqueueCmd(WorldState& w, int entity_id, int type, int dx, int dy) {
    if (w.cmd_count >= MAX_CMDS) return;
    w.cmd_queue[w.cmd_count] = {type, entity_id, dx, dy};
    w.cmd_count++;
}

void resolveCommands(WorldState& w) {
    for (int i = 0; i < w.cmd_count; i++) {
        Command& c = w.cmd_queue[i];
        if (c.type == CMD_MOVE) {
            int nx = w.pos_x[c.entity_id] + c.dx;
            int ny = w.pos_y[c.entity_id] + c.dy;
            if (nx > 0 && nx < W-1 && ny > 0 && ny < H-1) {
                w.pos_x[c.entity_id] = nx;
                w.pos_y[c.entity_id] = ny;
            }
            cout << "RESOLVE|move|entity=" << c.entity_id
                 << "|to=" << w.pos_x[c.entity_id]
                 << "," << w.pos_y[c.entity_id] << endl;
        }
    }
}

// TODO: implement resolveCombat(WorldState& w)
// Check player (entity 0) vs all alive enemies.
// Adjacent = abs(dx)+abs(dy) == 1
// Player deals 10 dmg, enemy deals 5 dmg.
// Print COMBAT lines. Return true if combat happened.

void game_tick(WorldState& w, char input) {
    w.turn++;
    w.cmd_count = 0;
    cout << "TICK|" << w.turn << endl;

    int dx=0, dy=0;
    if (input=='d') dx=1;
    else if (input=='a') dx=-1;
    else if (input=='s') dy=1;
    else if (input=='w') dy=-1;
    enqueueCmd(w, 0, CMD_MOVE, dx, dy);

    resolveCommands(w);

    // TODO: call resolveCombat(w) and capture whether combat happened
    bool combat_happened = false;

    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        const char* name = (i==0) ? "hero" : "orc";
        const char* role = (i==0) ? "player" : "enemy";
        cout << "ENTITY|" << name << "|" << role << "|"
             << w.pos_x[i]*TILE << "|" << w.pos_y[i]*TILE
             << "|24|24" << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.hp[0] << endl;
    cout << "GOLD|" << w.gold << endl;
    if (combat_happened)
        cout << "GAME_MESSAGE|Combat! Hero HP: " << w.hp[0] << " Orc HP: " << w.hp[1] << endl;
    else
        cout << "GAME_MESSAGE|No combat" << endl;
}

int main() {
    WorldState w = {};
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=1; w.hp[1]=30; w.alive[1]=true;
    w.entity_count=2;

    char inputs[] = {'d','d','d','d','d'};
    for (char c : inputs) game_tick(w, c);

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W=10, H=10, TILE=24, MAX_E=16, MAX_CMDS=64;
const int CMD_MOVE=1;

struct Command {
    int type;
    int entity_id;
    int dx, dy;
};

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    Command cmd_queue[MAX_CMDS];
    int cmd_count;
    int turn;
    int gold;
};

void enqueueCmd(WorldState& w, int entity_id, int type, int dx, int dy) {
    if (w.cmd_count >= MAX_CMDS) return;
    w.cmd_queue[w.cmd_count] = {type, entity_id, dx, dy};
    w.cmd_count++;
}

void resolveCommands(WorldState& w) {
    for (int i = 0; i < w.cmd_count; i++) {
        Command& c = w.cmd_queue[i];
        if (c.type == CMD_MOVE) {
            int nx = w.pos_x[c.entity_id] + c.dx;
            int ny = w.pos_y[c.entity_id] + c.dy;
            if (nx > 0 && nx < W-1 && ny > 0 && ny < H-1) {
                w.pos_x[c.entity_id] = nx;
                w.pos_y[c.entity_id] = ny;
            }
            cout << "RESOLVE|move|entity=" << c.entity_id
                 << "|to=" << w.pos_x[c.entity_id]
                 << "," << w.pos_y[c.entity_id] << endl;
        }
    }
}

bool resolveCombat(WorldState& w) {
    bool any = false;
    for (int i = 1; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        int dx = w.pos_x[0] - w.pos_x[i];
        int dy = w.pos_y[0] - w.pos_y[i];
        if (dx < 0) dx = -dx;
        if (dy < 0) dy = -dy;
        if (dx + dy == 1) {
            w.hp[i] -= 10;
            cout << "COMBAT|hero->orc|dmg=10|hp=" << w.hp[i] << endl;
            w.hp[0] -= 5;
            cout << "COMBAT|orc->hero|dmg=5|hp=" << w.hp[0] << endl;
            any = true;
        }
    }
    return any;
}

void game_tick(WorldState& w, char input) {
    w.turn++;
    w.cmd_count = 0;
    cout << "TICK|" << w.turn << endl;

    int dx=0, dy=0;
    if (input=='d') dx=1;
    else if (input=='a') dx=-1;
    else if (input=='s') dy=1;
    else if (input=='w') dy=-1;
    enqueueCmd(w, 0, CMD_MOVE, dx, dy);

    resolveCommands(w);

    bool combat_happened = resolveCombat(w);

    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        const char* name = (i==0) ? "hero" : "orc";
        const char* role = (i==0) ? "player" : "enemy";
        cout << "ENTITY|" << name << "|" << role << "|"
             << w.pos_x[i]*TILE << "|" << w.pos_y[i]*TILE
             << "|24|24" << endl;
    }
    cout << "TURN|" << w.turn << endl;
    cout << "HP|" << w.hp[0] << endl;
    cout << "GOLD|" << w.gold << endl;
    if (combat_happened)
        cout << "GAME_MESSAGE|Combat! Hero HP: " << w.hp[0] << " Orc HP: " << w.hp[1] << endl;
    else
        cout << "GAME_MESSAGE|No combat" << endl;
}

int main() {
    WorldState w = {};
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=1; w.hp[1]=30; w.alive[1]=true;
    w.entity_count=2;

    char inputs[] = {'d','d','d','d','d'};
    for (char c : inputs) game_tick(w, c);

    return 0;
}`,
    tests: [
      { id: "g1", description: "No combat on tick 1 (distance > 1)", expectedOutput: "GAME_MESSAGE\\|No combat", isPattern: true },
      { id: "g2", description: "Combat triggers on tick 3 (adjacent)", expectedOutput: "COMBAT\\|hero->orc\\|dmg=10\\|hp=20", isPattern: true },
      { id: "g3", description: "Hero takes damage in combat", expectedOutput: "COMBAT\\|orc->hero\\|dmg=5\\|hp=95", isPattern: true },
      { id: "g4", description: "Combat message shows HP values", expectedOutput: "GAME_MESSAGE\\|Combat! Hero HP: 95 Orc HP: 20", isPattern: true },
      { id: "g5", description: "Player position correct at tick 3", expectedOutput: "ENTITY\\|hero\\|player\\|96\\|24", isPattern: true },
    ],
    hints: [
      "resolveCombat returns a bool indicating whether combat happened. Use it to decide the GAME_MESSAGE.",
      "Player starts at (1,1), moves right each tick. Tick 3: player at (4,1), enemy at (5,1) -> adjacent, combat!",
      "Tick 4: player moves to (5,1) = same tile as enemy. Manhattan distance 0, NOT 1. No combat triggers.",
    ],
    estimatedMinutes: 15,
  },
};