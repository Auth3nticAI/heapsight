import { Lesson } from "@/types/lesson";

export const lessonRPG85: Lesson = {
  id: "rpg-85-milestone-beta-quality",
  title: "Milestone: Beta Quality",
  description: "Integration milestone: HUD + combat feedback + animation + menu flow + game loop. Feels like a real mini RPG for the first time.",
  order: 85,
  xpReward: 300,
  tier: "pro",
  concepts: ["integration milestone", "system composition", "HUD rendering", "combat feedback", "menu flow", "game loop"],
  part1: {
    title: "Concept: Integration as Quality Gate",
    type: "concept",
    instructions: `# Milestone: Beta Quality

## Mental Model

Individual systems work in isolation — the HUD renders, combat feedback prints, the menu transitions states. But a beta-quality game requires them to work together in a single session. Integration milestones prove composition: every system feeds into the next, and the player experiences a coherent loop.

## What Breaks Without This

\`\`\`cpp
// Each system tested independently:
// HUD works alone. Combat feedback works alone. Menu works alone.
// But together: the HUD doesn't update after combat.
// The menu doesn't transition to GAME_OVER when HP hits 0.
// Combat feedback fires but the HUD shows stale HP.
// Integration bugs hide in the seams between systems.
\`\`\`

Systems that pass unit tests can still fail integration. This milestone proves the seams are clean.

## The Fix: Session-Based Integration Test

Run a complete game session in code: title screen → start → combat with 3 enemies → HUD updates → game over. Every system fires in sequence. The output tells the story of a complete play session.

\`\`\`cpp
// Session flow:
// 1. Title screen (TITLE state)
// 2. Start game (transition to PLAYING)
// 3. Fight enemies with combat feedback
// 4. HUD updates after each combat
// 5. Player dies → GAME_OVER
// 6. All systems participated
\`\`\`

The milestone is not a new feature — it's proof that existing features compose correctly.

## Key Concepts

- **Integration testing** — prove systems work together, not just alone
- **Session flow** — title → play → combat → game over is a complete arc
- **State consistency** — HUD reflects combat results; menu reflects HP state
- **Composition** — the game is the sum of its systems, not a monolith

## Performance Insight

An integration test runs the same code as the real game. There's no overhead — you're testing the actual pipeline, not a mock. If the integration test runs fast, the game runs fast.

## Memory Insight

All systems share the same world state struct. No extra memory for integration — the HUD reads from the same HP array that combat writes to. Shared data, read-only projections. Zero overhead for composition.

## Beginner Trap

\`\`\`cpp
// BAD: Testing systems in isolation but never together
// "HUD works" + "combat works" != "game works"
// Integration bugs live in the seams:
// - Combat updates HP but HUD reads old value
// - Menu checks HP but combat hasn't resolved yet
// Always run a full session test after building new systems.
\`\`\`

## Elite Insight

Nintendo's quality assurance runs full play sessions after every build. Miyamoto's teams play the game daily — not test individual systems, but play the game. FromSoftware's Dark Souls shipped with integration quality: every system feeds into every other. Your milestone follows the same discipline — if you can run a complete session and the output is correct, the game is real.

## Systems Thinking Connection

In the Robotics path, integration tests launch the full node graph and verify sensor data flows through localization to planning. Same principle: individual nodes pass unit tests, but the robot only works when they compose. Integration is where engineering becomes real.

## Skill Reinforcement

L81 built the HUD. L82 added combat feedback. L83 added animation. L84 built the menu flow. This milestone integrates all four into a session. L90 will be the public beta milestone with even more systems.

## Mastery Check

**Q:** Why test a full session instead of just testing each system?
**A:** Because bugs hide in the seams. System A writes data, System B reads it — if their timing or format assumptions differ, the game breaks. Integration tests expose coupling bugs that unit tests miss.`,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

AppState processMenuInput(AppState current, const char* cmd){
    if(current==TITLE && strcmp(cmd,"start")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"die")==0) return GAME_OVER;
    return current;
}

const char* stateName(AppState s){
    switch(s){ case TITLE:return "TITLE"; case PLAYING:return "PLAYING";
    case PAUSED:return "PAUSED"; case GAME_OVER:return "GAME_OVER"; }
    return "UNKNOWN";
}

void renderHUD(int hp,int max_hp,int gold,int turn){
    int bars=(hp*8)/max_hp;
    cout<<"HP [";
    for(int i=0;i<8;i++) cout<<(i<bars?'#':'-');
    cout<<"] "<<hp<<"/"<<max_hp<<" | G:"<<gold<<" | T:"<<turn<<endl;
}

// TODO: void combatFeedback(int dmg, int remaining_hp)
// TODO: main() integration session

int main(){
    // TODO: Full session
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

AppState processMenuInput(AppState current, const char* cmd){
    if(current==TITLE && strcmp(cmd,"start")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"die")==0) return GAME_OVER;
    return current;
}

const char* stateName(AppState s){
    switch(s){ case TITLE:return "TITLE"; case PLAYING:return "PLAYING";
    case PAUSED:return "PAUSED"; case GAME_OVER:return "GAME_OVER"; }
    return "UNKNOWN";
}

void renderHUD(int hp,int max_hp,int gold,int turn){
    int bars=(hp*8)/max_hp;
    cout<<"HP [";
    for(int i=0;i<8;i++) cout<<(i<bars?'#':'-');
    cout<<"] "<<hp<<"/"<<max_hp<<" | G:"<<gold<<" | T:"<<turn<<endl;
}

void combatFeedback(int dmg,int remaining_hp){
    if(remaining_hp<=0) cout<<"*** KILL -"<<dmg<<" HP ***"<<endl;
    else if(dmg>=8) cout<<"*** CRITICAL -"<<dmg<<" HP ***"<<endl;
    else cout<<"** HIT -"<<dmg<<" HP **"<<endl;
}

int main(){
    AppState state=TITLE;
    cout<<"BETA|TITLE_SCREEN"<<endl;
    state=processMenuInput(state,"start");
    cout<<"BETA|STATE="<<stateName(state)<<endl;
    int player_hp=20,max_hp=20,gold=50,turn=1;
    int enemy_hp[]={10,8,12};
    int enemy_count=3;
    for(int e=0;e<enemy_count;e++){
        int dmg=5+e*2;
        enemy_hp[e]-=dmg;
        combatFeedback(dmg,enemy_hp[e]);
        player_hp-=3;
        gold+=10;
        turn++;
        renderHUD(player_hp,max_hp,gold,turn);
    }
    state=processMenuInput(state,"die");
    cout<<"BETA|STATE="<<stateName(state)<<endl;
    cout<<"BETA|MILESTONE_COMPLETE"<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Title screen shown", expectedOutput: "BETA|TITLE_SCREEN", isPattern: false },
      { id: "t2", description: "Game started", expectedOutput: "BETA|STATE=PLAYING", isPattern: false },
      { id: "t3", description: "Combat feedback appears", expectedOutput: "** HIT -5 HP **", isPattern: false },
      { id: "t4", description: "Game over reached", expectedOutput: "BETA|STATE=GAME_OVER", isPattern: false },
      { id: "t5", description: "Milestone complete", expectedOutput: "BETA|MILESTONE_COMPLETE", isPattern: false },
    ],
    hints: [
      "Wire the systems in sequence: title, start, combat loop with feedback and HUD, then game over.",
      "Each enemy fight: deal damage, print feedback, take damage, update HUD.",
      "combatFeedback checks remaining_hp after damage. renderHUD shows player state after each fight.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Beta Quality Session",
    type: "game_builder",
    instructions: `# Build: Full Beta Session

## Mental Model

A complete game session integrating all Phase 9 systems: title screen, menu transitions, 3 enemy fights with combat feedback, HUD updates each turn, and game over. This is the first time the game feels like a real RPG.

## Requirements

1. Start at TITLE state, print BETA|TITLE_SCREEN
2. Transition to PLAYING, print BETA|STATE=PLAYING
3. Fight 3 enemies: damage values 5, 7, 9
4. Enemy HPs: 10, 8, 12. After hits: 5, 1, 3 (all survive)
5. Player takes 3 HP damage per fight, starts at 20/20 HP
6. Gold: starts at 50, gains 10 per fight
7. Turns increment: 2, 3, 4
8. Print combat feedback for each hit
9. Print HUD after each fight
10. Transition to GAME_OVER at end
11. Print BETA|MILESTONE_COMPLETE

## Expected Output
\`\`\`
BETA|TITLE_SCREEN
BETA|STATE=PLAYING
** HIT -5 HP **
HP [######--] 17/20 | G:60 | T:2
** HIT -7 HP **
HP [####----] 14/20 | G:70 | T:3
*** CRITICAL -9 HP ***
HP [###-----] 11/20 | G:80 | T:4
BETA|STATE=GAME_OVER
BETA|MILESTONE_COMPLETE
\`\`\``,
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

AppState processMenuInput(AppState current, const char* cmd){
    if(current==TITLE && strcmp(cmd,"start")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"die")==0) return GAME_OVER;
    return current;
}
const char* stateName(AppState s){
    switch(s){ case TITLE:return "TITLE"; case PLAYING:return "PLAYING";
    case PAUSED:return "PAUSED"; case GAME_OVER:return "GAME_OVER"; }
    return "UNKNOWN";
}
void renderHUD(int hp,int max_hp,int gold,int turn){
    int bars=(hp*8)/max_hp;
    cout<<"HP [";
    for(int i=0;i<8;i++) cout<<(i<bars?'#':'-');
    cout<<"] "<<hp<<"/"<<max_hp<<" | G:"<<gold<<" | T:"<<turn<<endl;
}

// TODO: combatFeedback(int dmg, int remaining_hp)

int main(){
    // TODO: Full beta session
    // Title -> Start -> 3 fights -> Game Over -> Milestone
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

enum AppState { TITLE, PLAYING, PAUSED, GAME_OVER };

AppState processMenuInput(AppState current, const char* cmd){
    if(current==TITLE && strcmp(cmd,"start")==0) return PLAYING;
    if(current==PLAYING && strcmp(cmd,"die")==0) return GAME_OVER;
    return current;
}
const char* stateName(AppState s){
    switch(s){ case TITLE:return "TITLE"; case PLAYING:return "PLAYING";
    case PAUSED:return "PAUSED"; case GAME_OVER:return "GAME_OVER"; }
    return "UNKNOWN";
}
void renderHUD(int hp,int max_hp,int gold,int turn){
    int bars=(hp*8)/max_hp;
    cout<<"HP [";
    for(int i=0;i<8;i++) cout<<(i<bars?'#':'-');
    cout<<"] "<<hp<<"/"<<max_hp<<" | G:"<<gold<<" | T:"<<turn<<endl;
}
void combatFeedback(int dmg,int remaining_hp){
    if(remaining_hp<=0) cout<<"*** KILL -"<<dmg<<" HP ***"<<endl;
    else if(dmg>=8) cout<<"*** CRITICAL -"<<dmg<<" HP ***"<<endl;
    else cout<<"** HIT -"<<dmg<<" HP **"<<endl;
}

int main(){
    AppState state=TITLE;
    cout<<"BETA|TITLE_SCREEN"<<endl;
    state=processMenuInput(state,"start");
    cout<<"BETA|STATE="<<stateName(state)<<endl;
    int player_hp=20,max_hp=20,gold=50,turn=1;
    int enemy_hp[]={10,8,12};
    int damages[]={5,7,9};
    for(int e=0;e<3;e++){
        enemy_hp[e]-=damages[e];
        combatFeedback(damages[e],enemy_hp[e]);
        player_hp-=3;
        gold+=10;
        turn++;
        renderHUD(player_hp,max_hp,gold,turn);
    }
    state=processMenuInput(state,"die");
    cout<<"BETA|STATE="<<stateName(state)<<endl;
    cout<<"BETA|MILESTONE_COMPLETE"<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Title screen", expectedOutput: "BETA|TITLE_SCREEN", isPattern: false },
      { id: "g2", description: "Playing state", expectedOutput: "BETA|STATE=PLAYING", isPattern: false },
      { id: "g3", description: "Normal hit feedback", expectedOutput: "** HIT -5 HP **", isPattern: false },
      { id: "g4", description: "Critical hit feedback", expectedOutput: "*** CRITICAL -9 HP ***", isPattern: false },
      { id: "g5", description: "HUD updates with combat", expectedOutput: "HP [####----] 14/20 | G:70 | T:3", isPattern: false },
      { id: "g6", description: "Game over reached", expectedOutput: "BETA|STATE=GAME_OVER", isPattern: false },
      { id: "g7", description: "Milestone complete", expectedOutput: "BETA|MILESTONE_COMPLETE", isPattern: false },
    ],
    hints: [
      "Wire the session in order: title, start, loop through 3 enemies with feedback+HUD, then die.",
      "Each fight: subtract damage from enemy, print feedback, subtract 3 from player, add 10 gold, increment turn, print HUD.",
      "Damage 9 with enemy HP 12-9=3 remaining: that's dmg>=8 so it's a critical. Player HP after 3 fights: 20-3-3-3=11.",
    ],
    estimatedMinutes: 20,
  },
};
