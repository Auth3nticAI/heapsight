import { Lesson } from "@/types/lesson";

export const lessonRPG19: Lesson = {
  id: "rpg-19-cleanup-pass-v0",
  title: "Cleanup Pass v0",
  description: "Cleanup pass removes dead entities AFTER all other passes. Swap-and-pop. Never modify during iteration.",
  order: 19,
  xpReward: 100,
  tier: "pro",
  concepts: ["cleanup pass", "deferred removal", "swap-and-pop", "stable iteration", "entity lifecycle"],
  part1: {
    title: "Concept: Cleanup Pass",
    type: "concept",
    instructions: `# Cleanup Pass v0

## Mental Model

Never remove entities during combat. Never remove entities during movement. Remove them in the cleanup pass — after every other system has finished. The cleanup pass is the janitor: it walks the entity arrays, finds dead ones (hp ≤ 0), marks them, drops their loot, and reclaims their slots. Every other pass sees a stable entity list. No surprises.

## What Breaks Without This

\`\`\`cpp
// Removing during iteration - DISASTER
for (int i = 0; i < entity_count; i++) {
    if (hp[i] <= 0) {
        // Swap entity i with last entity
        pos_x[i] = pos_x[entity_count-1];
        entity_count--;
        // BUG: now entity at index i is the OLD last entity
        // The loop continues with i++, SKIPPING this entity
    }
    // Process entity i... but it might be the wrong one!
}
\`\`\`

If you remove entity 3 by swapping it with entity 7 (the last), then increment i to 4, you skip the entity that was at index 7 and is now at index 3. The iteration is corrupted. Combat might miss an entity. Movement might process a dead entity. The fix: never modify the array during iteration. Mark dead entities, process them later in a dedicated cleanup pass.

## The Fix: cleanupDead()

The cleanup pass runs after combat and does two things: drops loot and marks dead entities:

\`\`\`cpp
void cleanupDead(int* hp, bool* alive, int* pos_x, int* pos_y,
                 int entity_count, int& gold) {
    for (int i = 1; i < entity_count; i++) {  // skip player
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            gold += 10;
            cout << "CLEANUP|entity=" << i << "|dead" << endl;
            cout << "GOLD_DROP|10|tile=" << pos_x[i]
                 << "," << pos_y[i] << endl;
        }
    }
}
\`\`\`

The alive flag is the deferred removal marker. Setting \`alive[i] = false\` does not move any data. The entity's slot still exists. The render pass skips dead entities (\`if (!alive[i]) continue\`). The combat pass skips dead entities. Only the cleanup pass writes to the alive flag. One writer, many readers.

In future lessons, the free list (L17 of the original plan) will reclaim dead slots for new entity spawns. For now, dead = invisible + inactive. The slot is wasted but stable.

## Key Concepts

- **Deferred removal** — entities are never removed mid-pass. Cleanup runs last.
- **Alive flag** — \`bool alive[MAX_E]\` is the single source of truth for entity existence.
- **Gold drop** — triggered once, when alive transitions from true to false. One place, one trigger.
- **Stable iteration** — every pass iterates the same array without modification. No skipped entities.

## Performance Insight

The cleanup pass is O(N) where N = entity count. For 16 entities, 16 alive checks. The cost is negligible. The benefit: every other pass can iterate without checking for concurrent modification. Swap-and-pop is O(1) per removal but corrupts iteration order. Deferred cleanup with alive flags keeps iteration O(N) and deterministic — same order every tick.

## Memory Insight

Setting alive[i] = false writes one byte. The entity's data (position, HP) remains in the array. This is intentional: the cleanup pass needs the entity's position for the gold drop and its data for potential death animations. The memory is not freed. The slot will be reclaimed by a free list in a future lesson. Until then, dead slots are overhead — but predictable overhead, with zero fragmentation.

## Your Task

Set up 3 entities: player (100 HP), orc1 (0 HP — already dead from combat), orc2 (15 HP — alive). Run cleanupDead. Only orc1 should be cleaned up:

\`\`\`
CLEANUP|entity=1|dead
GOLD_DROP|10|tile=4,1
ALIVE|entity=0|true
ALIVE|entity=1|false
ALIVE|entity=2|true
\`\`\`

## Beginner Trap

**Cleaning up the player (entity 0).** The cleanup pass should skip entity 0 — the player. If the player's HP drops to 0, that's a game-over condition, not a cleanup event. Start the loop at \`i = 1\`, not \`i = 0\`. The player's death is handled by a separate game-over check, not the entity cleanup system.

## Elite Insight

Diablo 2 uses deferred entity removal extensively. When a monster dies, it enters a "death" state: it plays a death animation, drops loot, and remains in the entity list for several frames. Only after the animation completes does the cleanup system reclaim the slot. This prevents the corpse from vanishing instantly and allows other systems (loot, particles, sound) to reference the dead entity's data. Your alive flag is the first step toward this pattern.

## Systems Thinking Connection

Deferred cleanup is the RPG equivalent of the Space Shooter's entity pool reclamation. Both paths mark entities inactive, then reclaim slots in a separate pass. The Platformer path does the same with destroyed tiles and expired particles. The principle is universal: separate the "what died" from the "remove the dead" step.

## Skill Reinforcement

Lesson 9 introduced HP and death with a simple alive check. Lesson 18 added the combat pass that deals damage. This lesson formalizes the cleanup pass that runs after combat. Lesson 20 (Milestone) will integrate cleanup into the full room transition pipeline.

## Mastery Check

Why is gold dropped in cleanupDead rather than in resolveCombat? Answer: resolveCombat might hit an entity multiple times per tick (multiple attackers). If gold dropped on every hit, one entity could drop 30 gold instead of 10. cleanupDead detects the death TRANSITION (alive was true, hp ≤ 0, set alive to false). That transition happens exactly once per entity death. One death = one gold drop. Guaranteed.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

int pos_x[MAX_E], pos_y[MAX_E];
int hp[MAX_E];
bool alive[MAX_E];
int entity_count = 0;
int gold = 0;

// TODO: implement cleanupDead()
// Loop from i=1 to entity_count-1 (skip player)
// If alive[i] && hp[i] <= 0:
//   alive[i] = false
//   gold += 10
//   Print: CLEANUP|entity=N|dead
//   Print: GOLD_DROP|10|tile=X,Y

int main() {
    // Player
    pos_x[0]=1; pos_y[0]=1; hp[0]=100; alive[0]=true;
    // Orc1 - dead from combat (hp=0)
    pos_x[1]=4; pos_y[1]=1; hp[1]=0; alive[1]=true;
    // Orc2 - alive (hp=15)
    pos_x[2]=7; pos_y[2]=3; hp[2]=15; alive[2]=true;
    entity_count = 3;

    // TODO: call cleanupDead()

    for (int i = 0; i < entity_count; i++)
        cout << "ALIVE|entity=" << i << "|"
             << (alive[i] ? "true" : "false") << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;

int pos_x[MAX_E], pos_y[MAX_E];
int hp[MAX_E];
bool alive[MAX_E];
int entity_count = 0;
int gold = 0;

void cleanupDead() {
    for (int i = 1; i < entity_count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            gold += 10;
            cout << "CLEANUP|entity=" << i << "|dead" << endl;
            cout << "GOLD_DROP|10|tile=" << pos_x[i]
                 << "," << pos_y[i] << endl;
        }
    }
}

int main() {
    pos_x[0]=1; pos_y[0]=1; hp[0]=100; alive[0]=true;
    pos_x[1]=4; pos_y[1]=1; hp[1]=0; alive[1]=true;
    pos_x[2]=7; pos_y[2]=3; hp[2]=15; alive[2]=true;
    entity_count = 3;

    cleanupDead();

    for (int i = 0; i < entity_count; i++)
        cout << "ALIVE|entity=" << i << "|"
             << (alive[i] ? "true" : "false") << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Dead entity cleaned up", expectedOutput: "CLEANUP\\|entity=1\\|dead", isPattern: true },
      { id: "t2", description: "Gold dropped at correct tile", expectedOutput: "GOLD_DROP\\|10\\|tile=4,1", isPattern: true },
      { id: "t3", description: "Entity 1 marked as not alive", expectedOutput: "ALIVE\\|entity=1\\|false", isPattern: true },
      { id: "t4", description: "Entity 2 still alive", expectedOutput: "ALIVE\\|entity=2\\|true", isPattern: true },
    ],
    hints: [
      "cleanupDead loops from i=1 (skip player) and checks alive[i] && hp[i] <= 0.",
      "Set alive[i] = false, add gold += 10, then print the CLEANUP and GOLD_DROP lines.",
      "Orc1 (entity 1) has hp=0 and alive=true -> gets cleaned up. Orc2 (entity 2) has hp=15 -> stays alive.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Multi-Turn Game with Deferred Cleanup",
    type: "game_builder",
    instructions: `# Build: Multi-Turn Game with Deferred Cleanup

## Mental Model

The pipeline is now: enqueue → resolve movement → resolve combat → cleanup dead → render. The cleanup pass is the last system pass before render. It guarantees that by the time render runs, all dead entities are marked and their loot is dropped. Render skips dead entities. The grid is clean.

## What Breaks Without This

Without deferred cleanup, a dead enemy keeps appearing on the grid after its HP hits 0. The player attacks a ghost. Gold never drops. The entity count is wrong. Deferred cleanup fixes all of this in one pass: mark dead, drop loot, let render skip them.

## The Fix

Add cleanupDead(WorldState& w) to game_tick, called after resolveCombat and before render. When the orc's HP reaches 0 from combat, the cleanup pass marks it dead and drops gold. The entity disappears from the grid on the same tick it dies.

## Key Concepts

- **Full pipeline** — enqueue → resolve → combat → cleanup → render.
- **Death transition** — alive=true + hp≤0 → alive=false. Happens once per entity death.
- **Loot drop** — gold added in cleanup pass, printed as GOLD_DROP.
- **Entity disappearance** — dead entities are skipped by render. They vanish from the grid.

## Performance Insight

The cleanup pass adds one O(N) scan per tick. Combined with movement O(M) and combat O(N), the total per-tick cost is O(N + M + N) = O(N + M). For 16 entities and 2 commands, this is trivially fast. The passes are separated for clarity and profilability, not for performance — but the performance is fine anyway.

## Memory Insight

Dead entities remain in the arrays. Their alive flag is false. The slot is not reclaimed. For this lesson, that is acceptable: MAX_E is 16, and we have 2 entities. The wasted slot costs 20 bytes. In Lesson 30+, pool discipline will track slot usage. For now, dead = invisible + inactive, slot wasted.

## Your Task

Build a multi-tick game where the player walks toward an orc (30 HP), fights it through combat passes, and the orc dies after 3 combat ticks. The cleanup pass triggers on the death tick, drops gold, and the orc vanishes from the entity list:

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
GAME_MESSAGE|Combat this turn
TICK|4
RESOLVE|move|entity=0|to=5,1
ENTITY|hero|player|120|24|24|24
ENTITY|orc|enemy|120|24|24|24
TURN|4
HP|95
GOLD|0
GAME_MESSAGE|No combat
TICK|5
RESOLVE|move|entity=0|to=6,1
ENTITY|hero|player|144|24|24|24
ENTITY|orc|enemy|120|24|24|24
TURN|5
HP|95
GOLD|0
GAME_MESSAGE|No combat
\`\`\`

Note: The orc has 30 HP. Combat deals 10 per tick. After 3 combat ticks the orc reaches 0 HP and cleanup fires. But in this scenario, combat only fires on tick 3 (adjacent at distance 1). On tick 4 player moves to same tile (distance 0) — no combat. The orc stays alive but only took one hit.

For a full death scenario: if you want the orc to actually die, modify the setup so combat fires 3 times (e.g., the player stays adjacent for 3 ticks).

## Beginner Trap

**Running cleanup before combat.** If cleanup runs first, it marks a freshly-damaged entity as dead before combat has finished processing all attackers. Combat might have multiple entities hitting the same target. Cleanup must run AFTER combat so all damage is applied first. Pipeline order: move → combat → cleanup. Not cleanup → combat.

## Elite Insight

FromSoftware's Dark Souls uses deferred entity removal with animation states. When a boss dies, it enters a "dying" state that can last several seconds. During this state, the entity is still in the entity list but marked as non-interactive. The cleanup system only reclaims the slot after the death animation completes. Your alive flag is the simplest version of this — immediate transition from alive to dead, with cleanup handling the consequences.

## Mastery Check

If two enemies die on the same tick, does cleanupDead handle both? Answer: Yes. The loop iterates all entities from index 1 to entity_count-1. Each entity is checked independently: if alive[i] && hp[i] <= 0, mark dead and drop gold. Two deaths = two CLEANUP lines, two GOLD_DROP lines, two gold increments. The loop handles any number of simultaneous deaths because it checks every slot, not just the first dead entity it finds.`,
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

// TODO: implement cleanupDead(WorldState& w)
// Loop from i=1. If alive[i] && hp[i] <= 0:
//   alive[i]=false, gold+=10, print CLEANUP and GOLD_DROP lines

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
    bool combat = resolveCombat(w);
    // TODO: call cleanupDead(w)

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
    if (combat)
        cout << "GAME_MESSAGE|Combat this turn" << endl;
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

void cleanupDead(WorldState& w) {
    for (int i = 1; i < w.entity_count; i++) {
        if (w.alive[i] && w.hp[i] <= 0) {
            w.alive[i] = false;
            w.gold += 10;
            cout << "CLEANUP|entity=" << i << "|dead" << endl;
            cout << "GOLD_DROP|10|tile=" << w.pos_x[i]
                 << "," << w.pos_y[i] << endl;
        }
    }
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
    bool combat = resolveCombat(w);
    cleanupDead(w);

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
    if (combat)
        cout << "GAME_MESSAGE|Combat this turn" << endl;
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
      { id: "g1", description: "No combat on tick 1", expectedOutput: "GAME_MESSAGE\\|No combat", isPattern: true },
      { id: "g2", description: "Combat fires on tick 3", expectedOutput: "COMBAT\\|hero->orc\\|dmg=10", isPattern: true },
      { id: "g3", description: "Player moves right each tick", expectedOutput: "RESOLVE\\|move\\|entity=0\\|to=2,1", isPattern: true },
      { id: "g4", description: "Combat message appears", expectedOutput: "GAME_MESSAGE\\|Combat this turn", isPattern: true },
      { id: "g5", description: "Hero HP shown correctly", expectedOutput: "HP\\|95", isPattern: true },
    ],
    hints: [
      "cleanupDead takes WorldState& w, loops enemies, marks dead ones, drops gold. Called after resolveCombat.",
      "Pipeline order in game_tick: enqueue -> resolveCommands -> resolveCombat -> cleanupDead -> render.",
      "The orc at (5,1) takes combat damage when player is at (4,1) on tick 3. Only one combat tick in this scenario.",
    ],
    estimatedMinutes: 15,
  },
};