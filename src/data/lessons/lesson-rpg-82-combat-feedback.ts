import { Lesson } from "@/types/lesson";

export const lessonRPG82: Lesson = {
  id: "rpg-82-combat-feedback",
  title: "Combat Feedback",
  description: "Hit flash text effects — styled damage feedback for normal hits, critical strikes, and kills. Make combat feel punchy.",
  order: 82,
  xpReward: 100,
  tier: "pro",
  concepts: ["combat feedback", "event-driven rendering", "damage classification", "text effects", "observer pattern"],
  part1: {
    title: "Concept: Combat Feedback as Event Response",
    type: "concept",
    instructions: `# Combat Feedback

## Mental Model

Your combat system resolves damage correctly — but the player sees nothing. A number goes down in the HUD. That's not feedback; that's bookkeeping. Real combat feedback is an event-driven response: damage happens, the render pass reacts with styled text that communicates magnitude, type, and consequence.

## What Breaks Without This

\`\`\`cpp
// Combat resolves...
enemy_hp[eid] -= 5;
// ...and nothing visible happens.
// Player has no idea if they hit, how hard, or if the enemy died.
// The game feels dead. Combat is a chore.
\`\`\`

The HUD shows HP going down, but there's no immediacy. The player attacks, waits, checks the HUD. No satisfaction. No punch.

## The Fix: Damage Classification and Styled Output

Classify each hit by damage magnitude. Low damage prints a normal hit message. High damage prints a critical strike. Zero HP triggers a kill message. Each has distinct visual weight:

\`\`\`cpp
void combatFeedback(int dmg, int remaining_hp) {
    if (remaining_hp <= 0) {
        cout << "*** KILL " << "-" << dmg << " HP ***" << endl;
    } else if (dmg >= 8) {
        cout << "*** CRITICAL -" << dmg << " HP ***" << endl;
    } else {
        cout << "** HIT -" << dmg << " HP **" << endl;
    }
}
\`\`\`

The function takes the damage dealt and the remaining HP after the hit. It classifies the event and prints styled text. The render pass calls this after each combat resolution.

## Key Concepts

- **Event-driven rendering** — feedback fires in response to combat events, not from polling state
- **Damage classification** — thresholds turn raw numbers into distinct feedback categories
- **Visual weight** — more asterisks = more important. Players learn to scan for ***
- **Kill confirmation** — the player must know the enemy is dead, not guess from HP

## Performance Insight

This is a pure output function. It reads two integers and prints a string. Zero allocations, zero state mutation. The feedback pass runs after the combat pass and before the render pass — it's a read-only projection of combat events.

## Memory Insight

No memory cost. The function uses cout directly with string literals. No buffers, no temporary strings, no heap. The damage and HP values are passed by value on the stack.

## Beginner Trap

\`\`\`cpp
// BAD: Building feedback strings with concatenation
string msg = "** HIT -" + to_string(dmg) + " HP **";
// This allocates on the heap every hit! In a 50-enemy dungeon,
// that's 50 allocations per turn just for feedback text.
// Use cout << directly — zero allocation.
\`\`\`

## Elite Insight

Diablo's damage numbers are a masterclass in feedback design: white for normal, yellow for critical, red for player damage. The visual encoding is instant — you never read the number, you read the color. Our ASCII equivalent uses asterisk weight: ** for normal, *** for critical/kill. Same principle, different medium. FromSoftware's Dark Souls shows "ENEMY FELLED" in huge text — kill confirmation is not optional in good combat design.

## Systems Thinking Connection

This feedback pattern is the Observer in action — the combat system produces events, the render system consumes them. In the Robotics path, this is identical to a diagnostics subscriber reacting to sensor events. Data flows one way; the observer never mutates the source.

## Skill Reinforcement

L37 introduced the combat event log. L77 formalized Observer for UI. This lesson applies both: combat produces an event (damage dealt), feedback observes and renders it. L85 will integrate this into the milestone.

## Mastery Check

**Q:** Why does combatFeedback take remaining_hp instead of checking a global array?
**A:** Because the feedback function should be a pure projection of event data. It doesn't need to know about the world — it just needs the numbers from the combat event. This keeps the observer decoupled from game state.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write combatFeedback(int dmg, int remaining_hp)
// If remaining_hp <= 0: print *** KILL -N HP ***
// If dmg >= 8: print *** CRITICAL -N HP ***
// Else: print ** HIT -N HP **

int main(){
    // TODO: Test with these values:
    // combatFeedback(3, 17)  -> normal hit
    // combatFeedback(10, 5) -> critical
    // combatFeedback(7, 0)  -> kill
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void combatFeedback(int dmg, int remaining_hp){
    if(remaining_hp<=0){
        cout<<"*** KILL -"<<dmg<<" HP ***"<<endl;
    } else if(dmg>=8){
        cout<<"*** CRITICAL -"<<dmg<<" HP ***"<<endl;
    } else {
        cout<<"** HIT -"<<dmg<<" HP **"<<endl;
    }
}

int main(){
    combatFeedback(3,17);
    combatFeedback(10,5);
    combatFeedback(7,0);
    return 0;
}`,
    tests: [
      { id: "t1", description: "Normal hit feedback", expectedOutput: "** HIT -3 HP **", isPattern: false },
      { id: "t2", description: "Critical hit feedback", expectedOutput: "*** CRITICAL -10 HP ***", isPattern: false },
      { id: "t3", description: "Kill feedback", expectedOutput: "*** KILL -7 HP ***", isPattern: false },
    ],
    hints: [
      "Check remaining_hp first — if zero or below, it's a kill regardless of damage.",
      "Use if/else if/else: kill check, then critical (dmg >= 8), then normal.",
      "Kill: cout<<'*** KILL -'<<dmg<<' HP ***'<<endl; Critical: same pattern with CRITICAL.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Combat Feedback System",
    type: "game_builder",
    instructions: `# Build: Full Combat Feedback System

## Mental Model

A combatFeedback() function integrated into a 5-hit combat simulation. Each hit classifies damage as normal, critical, or kill and prints styled text. The simulation shows varied damage values to demonstrate all three feedback types.

## Requirements

1. combatFeedback(int dmg, int remaining_hp) classifies and prints styled text
2. Normal hit (dmg < 8, remaining > 0): "** HIT -N HP **"
3. Critical hit (dmg >= 8, remaining > 0): "*** CRITICAL -N HP ***"
4. Kill (remaining <= 0): "*** KILL -N HP ***"
5. Simulate 5 attacks against an enemy with 30 HP
6. Print COMBAT_FEEDBACK|SYSTEM_READY at start
7. Print COMBAT_FEEDBACK|HITS=5 at end

## Expected Output
\`\`\`
COMBAT_FEEDBACK|SYSTEM_READY
** HIT -3 HP **
** HIT -5 HP **
*** CRITICAL -10 HP ***
** HIT -6 HP **
*** KILL -8 HP ***
COMBAT_FEEDBACK|HITS=5
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// TODO: combatFeedback(int dmg, int remaining_hp)
// remaining_hp <= 0 -> *** KILL -N HP ***
// dmg >= 8 -> *** CRITICAL -N HP ***
// else -> ** HIT -N HP **

int main(){
    cout<<"COMBAT_FEEDBACK|SYSTEM_READY"<<endl;
    int enemy_hp=30;
    int damages[]={3,5,10,6,8};
    int hit_count=5;
    for(int i=0;i<hit_count;i++){
        enemy_hp-=damages[i];
        // TODO: combatFeedback(damages[i], enemy_hp);
    }
    cout<<"COMBAT_FEEDBACK|HITS="<<hit_count<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void combatFeedback(int dmg, int remaining_hp){
    if(remaining_hp<=0){
        cout<<"*** KILL -"<<dmg<<" HP ***"<<endl;
    } else if(dmg>=8){
        cout<<"*** CRITICAL -"<<dmg<<" HP ***"<<endl;
    } else {
        cout<<"** HIT -"<<dmg<<" HP **"<<endl;
    }
}

int main(){
    cout<<"COMBAT_FEEDBACK|SYSTEM_READY"<<endl;
    int enemy_hp=30;
    int damages[]={3,5,10,6,8};
    int hit_count=5;
    for(int i=0;i<hit_count;i++){
        enemy_hp-=damages[i];
        combatFeedback(damages[i],enemy_hp);
    }
    cout<<"COMBAT_FEEDBACK|HITS="<<hit_count<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "System ready marker", expectedOutput: "COMBAT_FEEDBACK|SYSTEM_READY", isPattern: false },
      { id: "g2", description: "Normal hit text", expectedOutput: "** HIT -3 HP **", isPattern: false },
      { id: "g3", description: "Critical hit text", expectedOutput: "*** CRITICAL -10 HP ***", isPattern: false },
      { id: "g4", description: "Kill text", expectedOutput: "*** KILL -8 HP ***", isPattern: false },
      { id: "g5", description: "Hit count marker", expectedOutput: "COMBAT_FEEDBACK|HITS=5", isPattern: false },
    ],
    hints: [
      "Subtract damage from enemy_hp BEFORE calling combatFeedback — the function needs the remaining HP after the hit.",
      "Check remaining_hp <= 0 first (kill), then dmg >= 8 (critical), then default (normal hit).",
      "The last hit deals 8 damage to an enemy with 6 HP remaining, so remaining_hp becomes -2 — that's a kill.",
    ],
    estimatedMinutes: 12,
  },
};
