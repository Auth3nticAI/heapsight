import type { GameLessonVariant } from "@/types/game";

const solutionCode = `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct RepairRequest {
    string robotId;
    int currentHealth;
    string damageType;
};

struct RepairResponse {
    bool accepted;
    int repairedHealth;
    string message;
};

RepairResponse handleRepairRequest(const RepairRequest& req) {
    if (req.currentHealth > 80) {
        return {false, req.currentHealth, "Health sufficient, no repair needed"};
    }
    if (req.damageType == "critical") {
        return {true, 100, "Critical repair complete - full restore"};
    }
    return {true, min(req.currentHealth + 30, 100), "Standard repair complete"};
}

int main() {
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|Repair service online" << endl;

    RepairRequest requests[] = {
        {"Alpha-1", 90, "minor"},
        {"Beta-2", 45, "critical"},
        {"Gamma-3", 60, "standard"}
    };

    for (int i = 0; i < 3; i++) {
        cout << "ROBOT_MESSAGE|Requesting repair for " << requests[i].robotId
             << " (health: " << requests[i].currentHealth << ")" << endl;

        RepairResponse resp = handleRepairRequest(requests[i]);

        cout << "ROBOT_MESSAGE|Response: " << resp.message
             << " (health: " << requests[i].currentHealth << " -> " << resp.repairedHealth << ")" << endl;
    }

    cout << "MISSION_COMPLETE" << endl;

    return 0;
}`;

export const lesson16Robot: GameLessonVariant = {
  lessonId: "16-entity-manager-class",

  instructions: `# Robot Builder: Repair Service

Implement a request-response pattern that simulates a ROS 2 repair service. Robots send repair requests, and the service responds based on health level and damage type.

## Robot Protocol
\`\`\`
ROBOT|position|x|y|theta       — Report robot position
ROBOT_MESSAGE|text              — Display a status message
MISSION_COMPLETE                — Signal end of mission
\`\`\`

## Your Task
1. Write a \`handleRepairRequest\` function that takes a \`RepairRequest\` and returns a \`RepairResponse\`:
   - If \`currentHealth > 80\`: return \`{false, currentHealth, "Health sufficient, no repair needed"}\`
   - If \`damageType == "critical"\`: return \`{true, 100, "Critical repair complete - full restore"}\`
   - Otherwise: return \`{true, min(currentHealth + 30, 100), "Standard repair complete"}\`
2. Create 3 repair requests:
   - \`{"Alpha-1", 90, "minor"}\` — should be rejected (health > 80)
   - \`{"Beta-2", 45, "critical"}\` — should be fully repaired
   - \`{"Gamma-3", 60, "standard"}\` — should get +30 health
3. For each request, output the request and response messages:
   - \`ROBOT_MESSAGE|Requesting repair for ROBOT_ID (health: XX)\`
   - \`ROBOT_MESSAGE|Response: MESSAGE (health: XX -> YY)\`
4. Output \`MISSION_COMPLETE\` when all requests are processed

Expected output includes service acceptance/rejection for each robot based on its health and damage type.
`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct RepairRequest {
    string robotId;
    int currentHealth;
    string damageType;
};

struct RepairResponse {
    bool accepted;
    int repairedHealth;
    string message;
};

// TODO: Write a function that simulates a repair service
// RepairResponse handleRepairRequest(const RepairRequest& req)
// Logic:
//   If currentHealth > 80: return {false, currentHealth, "Health sufficient, no repair needed"}
//   If damageType == "critical": return {true, 100, "Critical repair complete - full restore"}
//   Else: return {true, min(currentHealth + 30, 100), "Standard repair complete"}

int main() {
    cout << "ROBOT|position|0|0|0" << endl;
    cout << "ROBOT_MESSAGE|Repair service online" << endl;

    // TODO: Create 3 repair requests:
    //   {"Alpha-1", 90, "minor"}    — should be rejected (health > 80)
    //   {"Beta-2", 45, "critical"}  — should be fully repaired
    //   {"Gamma-3", 60, "standard"} — should get +30 health

    // TODO: For each request:
    //   Output: ROBOT_MESSAGE|Requesting repair for ROBOT_ID (health: XX)
    //   Call handleRepairRequest
    //   Output: ROBOT_MESSAGE|Response: MESSAGE (health: XX -> YY)

    // TODO: Output MISSION_COMPLETE

    return 0;
}`,

  solutionCode,

  tests: [
    {
      id: "service-online",
      description: "Repair service online",
      expectedOutput: "ROBOT_MESSAGE\\|Repair service online",
      isPattern: true,
    },
    {
      id: "alpha-request",
      description: "Alpha-1 repair requested",
      expectedOutput: "ROBOT_MESSAGE\\|Requesting repair for Alpha-1",
      isPattern: true,
    },
    {
      id: "no-repair",
      description: "Repair rejected for healthy robot",
      expectedOutput: "ROBOT_MESSAGE\\|Response: Health sufficient",
      isPattern: true,
    },
    {
      id: "critical-repair",
      description: "Critical repair applied",
      expectedOutput: "ROBOT_MESSAGE\\|Response: Critical repair complete",
      isPattern: true,
    },
    {
      id: "standard-repair",
      description: "Standard repair applied",
      expectedOutput: "ROBOT_MESSAGE\\|Response: Standard repair complete",
      isPattern: true,
    },
    {
      id: "mission-complete",
      description: "Mission complete",
      expectedOutput: "MISSION_COMPLETE",
      isPattern: true,
    },
  ],

  hints: [
    "A ROS 2 service follows request-response: the client sends a request struct, the server returns a response struct.",
    "Return struct literals directly: return {true, 100, \"message\"};",
    "Use std::min(value, 100) from <algorithm> to cap health at 100.",
    "String comparison in C++ uses == for std::string.",
  ],

  accumulatedCode: solutionCode,
};
