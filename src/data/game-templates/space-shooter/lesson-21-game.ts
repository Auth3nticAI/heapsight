import type { GameLessonVariant } from "@/types/game";

export const lesson21SpaceShooter: GameLessonVariant = {
  lessonId: "21-save-load",
  instructions: `# State Serialization — Component Snapshot\n\nIn an ECS, saving game state means **serializing all component arrays**. Each entity's components are written to a structured format, then parsed back to reconstruct the world.\n\n## Concepts\n- ECS state = serializable component data\n- Save format: encoding entity component data as strings\n- Load: parsing strings back into entity structs\n\n## Your Task\n1. Create 3 entities: a player ship and 2 enemies (use arrays for ECS-style storage)\n2. Serialize each entity to a SAVE| line: \`SAVE|id|type|x|y|w|h|hp\`\n3. Store those save strings in an array\n4. Parse each save string back and output ENTITY| lines from the loaded data\n5. Output a GAME_MESSAGE confirming the load\n\n## Protocol\n\`\`\`\nSAVE|id|type|x|y|width|height|hp\nENTITY|id|type|x|y|width|height|hp\nGAME_MESSAGE|text\n\`\`\``,
  starterCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

const int MAX_ENTITIES = 3;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
};

// Write serializeEntity: returns a SAVE| string for one entity

// Write loadEntity: parses a SAVE| string back into an Entity

int main() {
    // Create 3 entities in arrays (ECS-style parallel data)
    // Serialize each to a SAVE| line and print it
    // Store save strings, then load them back
    // Print ENTITY| lines from loaded data
    // Print GAME_MESSAGE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

const int MAX_ENTITIES = 3;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
};

string serializeEntity(Entity e) {
    return "SAVE|" + e.id + "|" + e.type + "|" +
           to_string(e.x) + "|" + to_string(e.y) + "|" +
           to_string(e.width) + "|" + to_string(e.height) + "|" +
           to_string(e.hp);
}

Entity loadEntity(string saved) {
    Entity e;
    stringstream ss(saved);
    string token;
    getline(ss, token, '|');
    getline(ss, e.id, '|');
    getline(ss, e.type, '|');
    getline(ss, token, '|'); e.x = stoi(token);
    getline(ss, token, '|'); e.y = stoi(token);
    getline(ss, token, '|'); e.width = stoi(token);
    getline(ss, token, '|'); e.height = stoi(token);
    getline(ss, token, '|'); e.hp = stoi(token);
    return e;
}

int main() {
    Entity entities[MAX_ENTITIES] = {
        {"ship", "player", 180, 220, 24, 24, 100},
        {"alien1", "enemy", 100, 50, 22, 22, 60},
        {"alien2", "enemy", 300, 70, 22, 22, 60}
    };

    string saves[MAX_ENTITIES];
    for (int i = 0; i < MAX_ENTITIES; i++) {
        saves[i] = serializeEntity(entities[i]);
        cout << saves[i] << endl;
    }

    for (int i = 0; i < MAX_ENTITIES; i++) {
        Entity loaded = loadEntity(saves[i]);
        cout << "ENTITY|" << loaded.id << "|" << loaded.type << "|"
             << loaded.x << "|" << loaded.y << "|"
             << loaded.width << "|" << loaded.height << "|"
             << loaded.hp << endl;
    }

    cout << "GAME_MESSAGE|State loaded: " << MAX_ENTITIES << " entities restored" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should serialize ship to SAVE format", expectedOutput: "SAVE\\|ship\\|player\\|180\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Should serialize alien1 to SAVE format", expectedOutput: "SAVE\\|alien1\\|enemy\\|100\\|50\\|22\\|22\\|60", isPattern: true },
    { id: "g3", description: "Should load and render ship entity", expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g4", description: "Should load and render alien1 entity", expectedOutput: "ENTITY\\|alien1\\|enemy\\|100\\|50\\|22\\|22\\|60", isPattern: true },
    { id: "g5", description: "Should load and render alien2 entity", expectedOutput: "ENTITY\\|alien2\\|enemy\\|300\\|70\\|22\\|22\\|60", isPattern: true },
    { id: "g6", description: "Should show load confirmation", expectedOutput: "GAME_MESSAGE\\|State loaded: 3 entities restored", isPattern: true },
  ],
  hints: [
    "serializeEntity concatenates fields with | separators: \"SAVE|\" + e.id + \"|\" + e.type + ... Use to_string() for ints.",
    "loadEntity uses stringstream with getline(ss, token, '|') to split by pipe. First token is \"SAVE\" (discard it).",
    "Loop through entities[], serialize each, store in saves[], then loop again to load and print ENTITY lines.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
#include <sstream>
using namespace std;

const int MAX_ENTITIES = 3;

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
};

string serializeEntity(Entity e) {
    return "SAVE|" + e.id + "|" + e.type + "|" +
           to_string(e.x) + "|" + to_string(e.y) + "|" +
           to_string(e.width) + "|" + to_string(e.height) + "|" +
           to_string(e.hp);
}

Entity loadEntity(string saved) {
    Entity e;
    stringstream ss(saved);
    string token;
    getline(ss, token, '|');
    getline(ss, e.id, '|');
    getline(ss, e.type, '|');
    getline(ss, token, '|'); e.x = stoi(token);
    getline(ss, token, '|'); e.y = stoi(token);
    getline(ss, token, '|'); e.width = stoi(token);
    getline(ss, token, '|'); e.height = stoi(token);
    getline(ss, token, '|'); e.hp = stoi(token);
    return e;
}

int main() {
    Entity entities[MAX_ENTITIES] = {
        {"ship", "player", 180, 220, 24, 24, 100},
        {"alien1", "enemy", 100, 50, 22, 22, 60},
        {"alien2", "enemy", 300, 70, 22, 22, 60}
    };
    string saves[MAX_ENTITIES];
    for (int i = 0; i < MAX_ENTITIES; i++) {
        saves[i] = serializeEntity(entities[i]);
        cout << saves[i] << endl;
    }
    for (int i = 0; i < MAX_ENTITIES; i++) {
        Entity loaded = loadEntity(saves[i]);
        cout << "ENTITY|" << loaded.id << "|" << loaded.type << "|"
             << loaded.x << "|" << loaded.y << "|"
             << loaded.width << "|" << loaded.height << "|"
             << loaded.hp << endl;
    }
    cout << "GAME_MESSAGE|State loaded: " << MAX_ENTITIES << " entities restored" << endl;
    return 0;
}
`,
};
