import type { Lesson } from "@/types/lesson";

export const lesson92: Lesson = {
  id: "92-title-screen",
  title: "Title Screen",
  description: "Build a title screen with start, continue, options, and quit.",
  order: 92,
  xpReward: 225,
  tier: "pro",
  concepts: ["title screen", "menu system", "ASCII art", "game state flow"],
  part1: {
    title: "Concept: Title Screen",
    type: "concept",
    instructions: `# Title Screen — Players Quit Before They Play

Every game starts at the title screen. Not the gameplay. Not the tutorial. The title screen. If it looks broken, players close the window. If there are no menu options, players do not know how to start. If pressing a key does nothing, players assume the game crashed. The title screen is a game state with its own input handling, its own rendering, and its own state transitions. It is the front door. Make it work.

## What Breaks Without This

Without a title screen, the game dumps the player into gameplay with no context. No "Press Start." No options. No way to quit cleanly. The player has to Alt-F4. Worse, without a menu state machine, adding options or continue later means rewriting the game loop. The title screen is not decoration. It is architecture.

## The Fix

A GameState enum with TITLE as the initial state. The main loop checks gameState before processing input. In TITLE state, render ASCII art and menu options. Process input to select an option. When the player selects "New Game," transition gameState to PLAYING. The game loop already handles PLAYING. The title screen just gates the entry.

\\\`\\\`\\\`
// GameState: TITLE -> PLAYING
// Title screen renders:
//   1. ASCII art title
//   2. Menu options with selection indicator
//   3. Process input: select option -> transition state

enum GameState { TITLE, PLAYING, GAME_OVER };

struct Menu {
    int selected;       // 0-based index
    int optionCount;    // total options
    string options[4];  // option labels
};
\\\`\\\`\\\`

The selection indicator is a ">" character next to the current option. Arrow keys move the selection. Enter confirms. The mapping from option index to game action is a simple switch. Option 0 = New Game = transition to PLAYING. Option 3 = Quit = exit. Clean, predictable, testable.

## Your Task

1. Define a Menu struct: selected index, option count, option labels
2. Draw ASCII art title for "SPACE SHOOTER"
3. List 4 options: New Game, Continue, Options, Quit
4. Show ">" next to the selected option (default: option 0)
5. Simulate selecting "New Game" and transitioning to PLAYING
6. Print title art lines prefixed with "TITLE|"
7. Print: \\\`MENU_SELECT|option|1|action|NEW_GAME|state|TITLE->PLAYING\\\`

Expected output:
\\\`\\\`\\\`
TITLE|  ___  ___   _   ___ ___
TITLE| / __|/ _ \\ / | / __| __|
TITLE| \\__ \\  __/ /| || (__| _|
TITLE| |___/\\___|/ |_|\\___|___|
TITLE|
TITLE|  > [1] New Game
TITLE|    [2] Continue
TITLE|    [3] Options
TITLE|    [4] Quit
MENU_SELECT|option|1|action|NEW_GAME|state|TITLE->PLAYING
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Hardcoding menu rendering without a selection variable. When you later add keyboard navigation, you need to know which option is selected to move the ">" indicator. Store the selection index in the Menu struct from the start. Render the ">" based on that index. Do not hardcode it to line 1.

## Elite Insight

Professional title screens are async state machines. They load assets in the background while showing a logo. The "Press Start" text pulses on a timer. The menu slides in with an animation. Each visual element has its own state and timing. Your title screen is synchronous and instant — that is correct for a console prototype. The async version comes when you have a render thread.

## Cross-Path Echo

Landing pages in web development follow the same pattern. The user sees a hero section (title art), a call to action (New Game), and navigation options (Continue, Options, Quit). The "above the fold" content must load instantly and present clear actions. Your title screen is a landing page. The ">" indicator is the hover state on a button.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Menu {
    int selected;
    int optionCount;
    string options[4];
    string actions[4];
};

// TODO: Write drawTitle() — print ASCII art lines with "TITLE|" prefix
//   Print 5 lines of ASCII art for the game title

// TODO: Write drawMenu(menu) — print menu options with selection indicator
//   For each option: if selected, print "TITLE|  > [N] Label"
//   Otherwise: print "TITLE|    [N] Label"

// TODO: Write selectOption(menu) — process the selected option
//   Option 0 (New Game): print MENU_SELECT line with state transition
//   Print: MENU_SELECT|option|1|action|NEW_GAME|state|TITLE->PLAYING

int main() {
    Menu menu;
    menu.selected = 0;
    menu.optionCount = 4;
    menu.options[0] = "New Game";
    menu.options[1] = "Continue";
    menu.options[2] = "Options";
    menu.options[3] = "Quit";
    menu.actions[0] = "NEW_GAME";
    menu.actions[1] = "CONTINUE";
    menu.actions[2] = "OPTIONS";
    menu.actions[3] = "QUIT";

    // TODO: Draw title art
    // TODO: Draw menu with current selection
    // TODO: Select current option (New Game)

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Menu {
    int selected;
    int optionCount;
    string options[4];
    string actions[4];
};

void drawTitle() {
    cout << "TITLE|  ___  ___   _   ___ ___" << endl;
    cout << "TITLE| / __|/ _ \\\\ / | / __| __|" << endl;
    cout << "TITLE| \\\\__ \\\\  __/ /| || (__| _|" << endl;
    cout << "TITLE| |___/\\\\___|/ |_|\\\\___|___|" << endl;
    cout << "TITLE|" << endl;
}

void drawMenu(Menu &menu) {
    for (int i = 0; i < menu.optionCount; i++) {
        if (i == menu.selected) {
            cout << "TITLE|  > [" << (i + 1) << "] " << menu.options[i] << endl;
        } else {
            cout << "TITLE|    [" << (i + 1) << "] " << menu.options[i] << endl;
        }
    }
}

void selectOption(Menu &menu) {
    cout << "MENU_SELECT|option|" << (menu.selected + 1) << "|action|"
         << menu.actions[menu.selected] << "|state|TITLE->PLAYING" << endl;
}

int main() {
    Menu menu;
    menu.selected = 0;
    menu.optionCount = 4;
    menu.options[0] = "New Game";
    menu.options[1] = "Continue";
    menu.options[2] = "Options";
    menu.options[3] = "Quit";
    menu.actions[0] = "NEW_GAME";
    menu.actions[1] = "CONTINUE";
    menu.actions[2] = "OPTIONS";
    menu.actions[3] = "QUIT";

    drawTitle();
    drawMenu(menu);
    selectOption(menu);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Title art line 1", expectedOutput: "TITLE\\|  ___  ___   _   ___ ___", isPattern: true },
      { id: "t2", description: "Title art line 2", expectedOutput: "TITLE\\| / __|/ _ ", isPattern: true },
      { id: "t3", description: "New Game selected with indicator", expectedOutput: "TITLE\\|  > \\[1\\] New Game", isPattern: true },
      { id: "t4", description: "Continue not selected", expectedOutput: "TITLE\\|    \\[2\\] Continue", isPattern: true },
      { id: "t5", description: "Options listed", expectedOutput: "TITLE\\|    \\[3\\] Options", isPattern: true },
      { id: "t6", description: "Quit listed", expectedOutput: "TITLE\\|    \\[4\\] Quit", isPattern: true },
      { id: "t7", description: "Menu select transitions to playing", expectedOutput: "MENU_SELECT\\|option\\|1\\|action\\|NEW_GAME\\|state\\|TITLE->PLAYING", isPattern: true },
    ],
    hints: [
      "drawTitle prints 5 lines. Each starts with \"TITLE|\" followed by the ASCII art. The blank line is just \"TITLE|\" with nothing after it. Use cout for each line.",
      "drawMenu loops through menu.optionCount (4). Check if i == menu.selected. If yes, prefix with \"  > \". If no, prefix with \"    \". The option number is i+1.",
      "selectOption prints one line: MENU_SELECT with the option number (selected+1), the action name from menu.actions[selected], and the state transition TITLE->PLAYING.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Title Screen",
    type: "game_builder",
    instructions: `# Game Builder: Title Screen — The Front Door

The title screen is the first thing the player sees. It sets the tone. It provides navigation. It proves the game is not broken. A title screen with ASCII art, clear menu options, and a working selection system tells the player: this game was built by someone who cares. No title screen says: this is a prototype that might crash.

## What Breaks Without This

Without a title screen state, the game launches directly into gameplay. There is no way to restart without closing the program. There is no way to access settings. There is no way to quit cleanly. The title screen is the hub that connects all other states. Without it, the game is a dead-end hallway.

## The Fix

GameState starts at TITLE. The main loop checks state before processing. In TITLE state, draw the art and menu. Process input to navigate and select. On "New Game," transition to PLAYING. The PLAYING state already works from previous lessons. The title screen is the missing entry point.

\\\`\\\`\\\`
// Title state:
// 1. Draw ASCII art
// 2. Draw menu with ">" on selected
// 3. Input selects option
// 4. "New Game" -> PLAYING
\\\`\\\`\\\`

## Your Task

1. Draw ASCII title art for "SPACE SHOOTER" with TITLE| prefix
2. Show 4 menu options: New Game, Continue, Options, Quit
3. Mark selected option (index 0) with ">" indicator
4. Simulate selecting "New Game" — transition state TITLE->PLAYING
5. Print title lines and menu lines
6. Print: \\\`MENU_SELECT|option|1|action|NEW_GAME|state|TITLE->PLAYING\\\`

## Beginner Trap

**Common Mistake:** Forgetting that the title screen is a game state, not a one-time function. If the player finishes a game and returns to the title, the title screen must render again. Store title screen data in a struct that persists. Do not allocate it on the stack of a one-shot function.

## Elite Insight

Console certification requires specific title screen elements. Xbox requires the game title, a "Press A to start" prompt, and legal text. PlayStation requires the same plus a specific button icon. Nintendo requires language selection on first boot. Your title screen is the minimum viable version. Production adds platform-specific requirements.

## Cross-Path Echo

A CLI application's help screen follows the same pattern. The user runs the command with no arguments and sees: the program name (title art), available commands (menu options), and usage instructions (selection). Your title screen is \\\`--help\\\` for a game.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Menu {
    int selected;
    int optionCount;
    string options[4];
    string actions[4];
};

// TODO: Write drawTitle() — print ASCII art with TITLE| prefix

// TODO: Write drawMenu(menu) — print options with > on selected

// TODO: Write selectOption(menu) — print MENU_SELECT line

int main() {
    Menu menu;
    menu.selected = 0;
    menu.optionCount = 4;
    menu.options[0] = "New Game";
    menu.options[1] = "Continue";
    menu.options[2] = "Options";
    menu.options[3] = "Quit";
    menu.actions[0] = "NEW_GAME";
    menu.actions[1] = "CONTINUE";
    menu.actions[2] = "OPTIONS";
    menu.actions[3] = "QUIT";

    // TODO: Draw title, menu, select option 0

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Menu {
    int selected;
    int optionCount;
    string options[4];
    string actions[4];
};

void drawTitle() {
    cout << "TITLE|  ___  ___   _   ___ ___" << endl;
    cout << "TITLE| / __|/ _ \\\\ / | / __| __|" << endl;
    cout << "TITLE| \\\\__ \\\\  __/ /| || (__| _|" << endl;
    cout << "TITLE| |___/\\\\___|/ |_|\\\\___|___|" << endl;
    cout << "TITLE|" << endl;
}

void drawMenu(Menu &menu) {
    for (int i = 0; i < menu.optionCount; i++) {
        if (i == menu.selected) {
            cout << "TITLE|  > [" << (i + 1) << "] " << menu.options[i] << endl;
        } else {
            cout << "TITLE|    [" << (i + 1) << "] " << menu.options[i] << endl;
        }
    }
}

void selectOption(Menu &menu) {
    cout << "MENU_SELECT|option|" << (menu.selected + 1) << "|action|"
         << menu.actions[menu.selected] << "|state|TITLE->PLAYING" << endl;
}

int main() {
    Menu menu;
    menu.selected = 0;
    menu.optionCount = 4;
    menu.options[0] = "New Game";
    menu.options[1] = "Continue";
    menu.options[2] = "Options";
    menu.options[3] = "Quit";
    menu.actions[0] = "NEW_GAME";
    menu.actions[1] = "CONTINUE";
    menu.actions[2] = "OPTIONS";
    menu.actions[3] = "QUIT";

    drawTitle();
    drawMenu(menu);
    selectOption(menu);

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Title ASCII art renders", expectedOutput: "TITLE\\|  ___  ___   _   ___ ___", isPattern: true },
      { id: "t2", description: "New Game has selection indicator", expectedOutput: "TITLE\\|  > \\[1\\] New Game", isPattern: true },
      { id: "t3", description: "Continue without indicator", expectedOutput: "TITLE\\|    \\[2\\] Continue", isPattern: true },
      { id: "t4", description: "Options without indicator", expectedOutput: "TITLE\\|    \\[3\\] Options", isPattern: true },
      { id: "t5", description: "Quit without indicator", expectedOutput: "TITLE\\|    \\[4\\] Quit", isPattern: true },
      { id: "t6", description: "Menu select action", expectedOutput: "MENU_SELECT\\|option\\|1\\|action\\|NEW_GAME\\|state\\|TITLE->PLAYING", isPattern: true },
    ],
    hints: [
      "drawTitle prints 5 lines of ASCII art. Each line starts with \"TITLE|\" and is followed by the art characters. Line 5 is just \"TITLE|\" with nothing after it — the blank separator.",
      "drawMenu loops 0 to optionCount-1. If i equals menu.selected (0), print with \"  > \" prefix. Otherwise use \"    \" (4 spaces). The bracket format is [N] where N = i+1.",
      "selectOption reads menu.selected (0) and prints the MENU_SELECT line. Option number is selected+1. Action is menu.actions[selected]. The state transition is always TITLE->PLAYING for New Game.",
    ],
    estimatedMinutes: 8,
  },
};
