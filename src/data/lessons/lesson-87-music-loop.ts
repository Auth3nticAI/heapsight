import type { Lesson } from "@/types/lesson";

export const lesson87: Lesson = {
  id: "87-music-loop",
  title: "Music State",
  description: "Switch background music tracks based on game state.",
  order: 87,
  xpReward: 200,
  tier: "pro",
  concepts: ["music state machine", "music transitions", "background music", "state-driven audio"],
  part1: {
    title: "Concept: Music State",
    type: "concept",
    instructions: `# Music State — Wrong Music Kills Mood Instantly

The boss appears. The menu music keeps playing. The player wins. The boss battle theme keeps blasting. The game pauses. The combat music hammers on at full volume. Wrong music is worse than no music. It actively contradicts what the player sees. Music must follow game state. State changes trigger track transitions. The music system is a state machine driven by the game state machine.

## What Breaks Without This

Without state-driven music, tracks play until manually stopped. The developer forgets to stop the menu theme when gameplay starts. Both tracks play simultaneously. Or the boss theme never starts because nobody called playBossMusic(). Or the victory theme loops forever because nobody listens for the "return to menu" event. Every missed transition is a broken mood.

## The Fix

A MusicState struct: current track name, volume, and crossfade progress. A mapping from GameState to track name. When the game state changes, the music system looks up the new track. If it differs from the current track, start a crossfade. The old track fades out while the new track fades in. Clean transitions. No manual play/stop calls in game logic.

\\\`\\\`\\\`
// State -> Track mapping:
// MENU     -> "menu_theme"
// PLAYING  -> "gameplay_normal"
// BOSS     -> "boss_battle"
// PAUSED   -> "gameplay_normal" (muted)
// VICTORY  -> "victory_theme"

struct MusicState {
    string currentTrack;
    int volume;        // 0-100
    string prevTrack;  // for crossfade
};
\\\`\\\`\\\`

Crossfade is the professional transition. Hard cuts between tracks are jarring. A 1-2 second crossfade smooths the transition. The old track volume ramps down. The new track volume ramps up. At the midpoint, both play at 50%. The result is seamless.

## Your Task

1. Define a MusicState struct: currentTrack, volume, prevTrack
2. Define state-to-track mapping:
   - MENU -> "menu_theme"
   - PLAYING -> "gameplay_normal"
   - BOSS -> "boss_battle"
   - PAUSED -> "gameplay_normal" (volume muted to 30)
   - VICTORY -> "victory_theme"
3. Simulate state transitions: MENU -> PLAYING -> BOSS -> VICTORY
4. Print per transition:
   \\\`MUSIC|state|MENU|track|menu_theme|vol|1.0\\\`
   \\\`MUSIC|state|PLAYING|track|gameplay_normal|vol|1.0|crossfade|menu_theme->gameplay_normal\\\`
   \\\`MUSIC|state|BOSS|track|boss_battle|vol|1.0|crossfade|gameplay_normal->boss_battle\\\`
   \\\`MUSIC|state|VICTORY|track|victory_theme|vol|1.0\\\`
5. Print: \\\`MUSIC_SUMMARY|tracks_played|4|transitions|3|crossfades|3\\\`

Expected output:
\\\`\\\`\\\`
MUSIC|state|MENU|track|menu_theme|vol|1.0
MUSIC|state|PLAYING|track|gameplay_normal|vol|1.0|crossfade|menu_theme->gameplay_normal
MUSIC|state|BOSS|track|boss_battle|vol|1.0|crossfade|gameplay_normal->boss_battle
MUSIC|state|VICTORY|track|victory_theme|vol|1.0|crossfade|boss_battle->victory_theme
MUSIC_SUMMARY|tracks_played|4|transitions|3|crossfades|3
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Not tracking the previous track for crossfade logging. When transitioning from PLAYING to BOSS, you need to know the current track is "gameplay_normal" to print "gameplay_normal->boss_battle". Save the current track before overwriting it. The previous track is the crossfade source. The new track is the crossfade target.

## Elite Insight

Professional music systems use stems, not tracks. A "gameplay" stem has layers: bass, drums, melody, ambient. As intensity increases, layers fade in. Calm gameplay: bass + ambient. Combat: bass + drums + melody. Boss: all layers at max. This is vertical mixing — same track, different layers. Your state machine is horizontal mixing — different tracks. Both are state-driven.

## Cross-Path Echo

CSS transitions follow the same pattern. An element changes state from \\\`hover\\\` to \\\`active\\\`. The transition property smoothly interpolates between the old style and the new style over a duration. Your music crossfade is a CSS transition for audio. Old state fades out, new state fades in, duration controls smoothness.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct MusicState {
    string currentTrack;
    int volume;        // 0-100
    string prevTrack;
};

MusicState music;
int tracksPlayed = 0;
int transitions = 0;
int crossfades = 0;

// TODO: Write getTrackForState(stateName) — return track name
//       "MENU"->"menu_theme", "PLAYING"->"gameplay_normal",
//       "BOSS"->"boss_battle", "VICTORY"->"victory_theme"

// TODO: Write transitionTo(stateName) — update music state
//       Set prevTrack = currentTrack, look up new track
//       If first track (prevTrack empty): print without crossfade
//       Otherwise: print with crossfade, increment crossfades
//       Increment tracksPlayed and transitions

int main() {
    music.currentTrack = "";
    music.volume = 100;
    music.prevTrack = "";

    // TODO: Transition through: MENU -> PLAYING -> BOSS -> VICTORY
    // TODO: Print MUSIC_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct MusicState {
    string currentTrack;
    int volume;        // 0-100
    string prevTrack;
};

MusicState music;
int tracksPlayed = 0;
int transitions = 0;
int crossfades = 0;

string getTrackForState(string stateName) {
    if (stateName == "MENU") return "menu_theme";
    if (stateName == "PLAYING") return "gameplay_normal";
    if (stateName == "BOSS") return "boss_battle";
    if (stateName == "VICTORY") return "victory_theme";
    return "silence";
}

void transitionTo(string stateName) {
    string newTrack = getTrackForState(stateName);
    music.prevTrack = music.currentTrack;
    music.currentTrack = newTrack;
    music.volume = 100;

    if (music.prevTrack.empty()) {
        // First track, no crossfade
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack << "|vol|1.0" << endl;
    } else {
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack
             << "|vol|1.0|crossfade|" << music.prevTrack << "->" << newTrack << endl;
        crossfades++;
    }
    tracksPlayed++;
    if (tracksPlayed > 1) transitions++;
}

int main() {
    music.currentTrack = "";
    music.volume = 100;
    music.prevTrack = "";

    transitionTo("MENU");
    transitionTo("PLAYING");
    transitionTo("BOSS");
    transitionTo("VICTORY");

    cout << "MUSIC_SUMMARY|tracks_played|" << tracksPlayed
         << "|transitions|" << transitions
         << "|crossfades|" << crossfades << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Menu theme plays", expectedOutput: "MUSIC\\|state\\|MENU\\|track\\|menu_theme\\|vol\\|1\\.0", isPattern: true },
      { id: "t2", description: "Crossfade to gameplay", expectedOutput: "MUSIC\\|state\\|PLAYING\\|track\\|gameplay_normal\\|vol\\|1\\.0\\|crossfade\\|menu_theme->gameplay_normal", isPattern: true },
      { id: "t3", description: "Crossfade to boss", expectedOutput: "MUSIC\\|state\\|BOSS\\|track\\|boss_battle\\|vol\\|1\\.0\\|crossfade\\|gameplay_normal->boss_battle", isPattern: true },
      { id: "t4", description: "Crossfade to victory", expectedOutput: "MUSIC\\|state\\|VICTORY\\|track\\|victory_theme\\|vol\\|1\\.0\\|crossfade\\|boss_battle->victory_theme", isPattern: true },
      { id: "t5", description: "Music summary", expectedOutput: "MUSIC_SUMMARY\\|tracks_played\\|4\\|transitions\\|3\\|crossfades\\|3", isPattern: true },
    ],
    hints: [
      "getTrackForState maps state names to track names. Use string comparison: if stateName == \"MENU\" return \"menu_theme\". Each state has exactly one track.",
      "transitionTo saves the current track as prevTrack before updating. If prevTrack is empty (first call), print without the crossfade suffix. Otherwise include |crossfade|prev->new.",
      "tracksPlayed increments on every call (4 total). transitions counts state changes after the first track (3). crossfades counts transitions with a previous track (3). First track has no crossfade.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Music State System",
    type: "game_builder",
    instructions: `# Game Builder: Music State Machine — State-Driven Soundtrack

Background music defines mood. The menu is calm. Gameplay is rhythmic. The boss fight is intense. Victory is triumphant. Game over is somber. Each game state maps to a music track. State transitions trigger crossfades between tracks. The music system is a state machine that mirrors the game state machine. When the game changes state, the music follows.

## What Breaks Without This

Without state-driven music selection, tracks must be managed manually. Every state transition needs explicit play/stop calls scattered through the codebase. The boss spawns in wave.cpp, which calls playBossMusic(). But wave.cpp should not know about audio. The music system should observe game state and react. Decoupling is the goal.

## The Fix

A lookup table maps game states to track names. The music system checks the current game state each frame. If the state changed since last frame, look up the new track and initiate a crossfade. The game code never calls playMusic. It sets game state. The music system reacts.

\\\`\\\`\\\`
// State -> Track:
// MENU     -> "menu_theme"
// PLAYING  -> "gameplay_normal"
// BOSS     -> "boss_battle"
// PAUSED   -> current track at vol 0.3
// VICTORY  -> "victory_theme"
\\\`\\\`\\\`

## Your Task

1. MusicState: current track, volume, previous track for crossfade
2. State-to-track mapping: MENU, PLAYING, BOSS, PAUSED, VICTORY
3. Simulate transitions: MENU -> PLAYING -> BOSS -> VICTORY
4. Print per transition:
   \\\`MUSIC|state|MENU|track|menu_theme|vol|1.0\\\`
   \\\`MUSIC|state|PLAYING|track|gameplay_normal|vol|1.0|crossfade|menu_theme->gameplay_normal\\\`
   \\\`MUSIC|state|BOSS|track|boss_battle|vol|1.0|crossfade|gameplay_normal->boss_battle\\\`
   \\\`MUSIC|state|VICTORY|track|victory_theme|vol|1.0|crossfade|boss_battle->victory_theme\\\`
5. Print: \\\`MUSIC_SUMMARY|tracks_played|4|transitions|3|crossfades|3\\\`

## Beginner Trap

**Common Mistake:** Transitioning music on every frame instead of on state change. If you check state and call transitionTo every frame, the crossfade restarts 60 times per second. Only transition when the state actually changes. Compare current state to previous state. If different, transition once.

## Elite Insight

Adaptive music systems like iMUSE (LucasArts) go further. They synchronize transitions to musical beats. The crossfade does not start immediately — it waits for the next bar boundary. The result is musically coherent transitions. Your state machine triggers the transition. A beat-aware system schedules it.

## Cross-Path Echo

Router navigation in single-page apps follows the same pattern. The URL is the state. Each route maps to a component (track). Route changes trigger transitions (crossfades). The router observes URL state and renders the correct component. Your music system is a router for audio — game state is the URL, tracks are the components.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct MusicState {
    string currentTrack;
    int volume;        // 0-100
    string prevTrack;
};

MusicState music;
int tracksPlayed = 0;
int transitions = 0;
int crossfades = 0;

// TODO: Write getTrackForState(stateName) — return track name
//       Map state names to track names

// TODO: Write transitionTo(stateName) — update music, print MUSIC line
//       First track: no crossfade. Subsequent: include crossfade

int main() {
    music.currentTrack = "";
    music.volume = 100;
    music.prevTrack = "";

    // TODO: Transition: MENU -> PLAYING -> BOSS -> VICTORY
    // TODO: Print MUSIC_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct MusicState {
    string currentTrack;
    int volume;        // 0-100
    string prevTrack;
};

MusicState music;
int tracksPlayed = 0;
int transitions = 0;
int crossfades = 0;

string getTrackForState(string stateName) {
    if (stateName == "MENU") return "menu_theme";
    if (stateName == "PLAYING") return "gameplay_normal";
    if (stateName == "BOSS") return "boss_battle";
    if (stateName == "VICTORY") return "victory_theme";
    return "silence";
}

void transitionTo(string stateName) {
    string newTrack = getTrackForState(stateName);
    music.prevTrack = music.currentTrack;
    music.currentTrack = newTrack;
    music.volume = 100;

    if (music.prevTrack.empty()) {
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack << "|vol|1.0" << endl;
    } else {
        cout << "MUSIC|state|" << stateName << "|track|" << newTrack
             << "|vol|1.0|crossfade|" << music.prevTrack << "->" << newTrack << endl;
        crossfades++;
    }
    tracksPlayed++;
    if (tracksPlayed > 1) transitions++;
}

int main() {
    music.currentTrack = "";
    music.volume = 100;
    music.prevTrack = "";

    transitionTo("MENU");
    transitionTo("PLAYING");
    transitionTo("BOSS");
    transitionTo("VICTORY");

    cout << "MUSIC_SUMMARY|tracks_played|" << tracksPlayed
         << "|transitions|" << transitions
         << "|crossfades|" << crossfades << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Menu theme starts", expectedOutput: "MUSIC\\|state\\|MENU\\|track\\|menu_theme\\|vol\\|1\\.0", isPattern: true },
      { id: "t2", description: "Gameplay crossfade", expectedOutput: "MUSIC\\|state\\|PLAYING\\|track\\|gameplay_normal\\|vol\\|1\\.0\\|crossfade\\|menu_theme->gameplay_normal", isPattern: true },
      { id: "t3", description: "Boss crossfade", expectedOutput: "MUSIC\\|state\\|BOSS\\|track\\|boss_battle\\|vol\\|1\\.0\\|crossfade\\|gameplay_normal->boss_battle", isPattern: true },
      { id: "t4", description: "Victory crossfade", expectedOutput: "MUSIC\\|state\\|VICTORY\\|track\\|victory_theme\\|vol\\|1\\.0\\|crossfade\\|boss_battle->victory_theme", isPattern: true },
      { id: "t5", description: "Music summary correct", expectedOutput: "MUSIC_SUMMARY\\|tracks_played\\|4\\|transitions\\|3\\|crossfades\\|3", isPattern: true },
    ],
    hints: [
      "Track state transitions linearly: MENU is first (no crossfade), then PLAYING, BOSS, VICTORY each crossfade from the previous track. Call transitionTo four times in sequence.",
      "transitionTo must save currentTrack to prevTrack BEFORE updating currentTrack. The crossfade string is prevTrack + \"->\" + newTrack. Only print the crossfade suffix when prevTrack is not empty.",
      "Counting: tracksPlayed increments on every transitionTo call (4). transitions counts changes after the initial track (3 — all except MENU). crossfades = transitions with a previous track (3).",
    ],
    estimatedMinutes: 8,
  },
};
