/**
 * Simple RPG Path Protocol — Data-Driven Object-Oriented Programming
 *
 * Paradigm: Class design, data structures, inventory, dialogue trees
 *
 * Protocol lines:
 *   CLASS|name|baseHP|baseATK|baseDEF        → define a character class
 *   PLAYER|class|level|hp|maxHP|mp|maxMP|atk|def  → player stats (creates frame)
 *   ITEM|id|name|type|stat=val,...            → define an item
 *   INVENTORY|add|item_id|quantity            → add item to inventory
 *   INVENTORY|remove|item_id|quantity         → remove item
 *   DIALOGUE|npc_id|text|choice1,choice2,...  → show dialogue
 *   COMBAT|attacker|defender|damage|result    → combat action
 *   QUEST|id|status|progress                  → quest update
 *   GAME_MESSAGE|text                         → display message
 *   BATTLE_WON                                → battle victory
 */

export interface RPGClass {
  name: string;
  baseHP: number;
  baseATK: number;
  baseDEF: number;
}

export interface RPGItem {
  id: string;
  name: string;
  type: string;
  stats: Record<string, number>;
}

export interface RPGDialogue {
  npcId: string;
  text: string;
  choices: string[];
}

export interface RPGQuest {
  id: string;
  status: string;
  progress: number;
}

export interface RPGFrame {
  classes: RPGClass[];
  player: {
    className: string;
    level: number;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    attack: number;
    defense: number;
  };
  inventory: Array<{ item: RPGItem; quantity: number }>;
  dialogue: RPGDialogue | null;
  combatLog: string[];
  quests: RPGQuest[];
  message: string;
  battleWon: boolean;
}

export function parseRPGOutput(output: string): RPGFrame[] {
  const lines = output.trim().split("\n");
  const frames: RPGFrame[] = [];

  const classes: RPGClass[] = [];
  const items = new Map<string, RPGItem>();
  const inventory: Array<{ item: RPGItem; quantity: number }> = [];
  const quests: RPGQuest[] = [];
  const combatLog: string[] = [];
  let dialogue: RPGDialogue | null = null;
  let message = "";
  let battleWon = false;

  let player = {
    className: "Warrior",
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    attack: 10,
    defense: 5,
  };

  for (const line of lines) {
    if (line.startsWith("CLASS|")) {
      const parts = line.substring(6).split("|");
      if (parts.length >= 4) {
        classes.push({
          name: parts[0],
          baseHP: parseInt(parts[1]) || 0,
          baseATK: parseInt(parts[2]) || 0,
          baseDEF: parseInt(parts[3]) || 0,
        });
      }
    } else if (line.startsWith("PLAYER|")) {
      const parts = line.substring(7).split("|");
      if (parts.length >= 8) {
        player = {
          className: parts[0],
          level: parseInt(parts[1]) || 1,
          health: parseInt(parts[2]) || 0,
          maxHealth: parseInt(parts[3]) || 0,
          mana: parseInt(parts[4]) || 0,
          maxMana: parseInt(parts[5]) || 0,
          attack: parseInt(parts[6]) || 0,
          defense: parseInt(parts[7]) || 0,
        };
        // Each PLAYER line creates a frame
        frames.push({
          classes: [...classes],
          player: { ...player },
          inventory: inventory.map((i) => ({ ...i })),
          dialogue,
          combatLog: [...combatLog],
          quests: quests.map((q) => ({ ...q })),
          message,
          battleWon,
        });
        dialogue = null; // Clear dialogue after frame
      }
    } else if (line.startsWith("ITEM|")) {
      const parts = line.substring(5).split("|");
      if (parts.length >= 4) {
        const statsObj: Record<string, number> = {};
        parts[3].split(",").forEach((pair) => {
          const [key, val] = pair.split("=");
          if (key && val) statsObj[key] = parseInt(val) || 0;
        });
        items.set(parts[0], {
          id: parts[0],
          name: parts[1],
          type: parts[2],
          stats: statsObj,
        });
      }
    } else if (line.startsWith("INVENTORY|add|")) {
      const parts = line.substring(14).split("|");
      const item = items.get(parts[0]);
      if (item) {
        const existing = inventory.find((i) => i.item.id === parts[0]);
        if (existing) {
          existing.quantity += parseInt(parts[1]) || 1;
        } else {
          inventory.push({ item, quantity: parseInt(parts[1]) || 1 });
        }
      }
    } else if (line.startsWith("INVENTORY|remove|")) {
      const parts = line.substring(17).split("|");
      const idx = inventory.findIndex((i) => i.item.id === parts[0]);
      if (idx >= 0) {
        inventory[idx].quantity -= parseInt(parts[1]) || 1;
        if (inventory[idx].quantity <= 0) inventory.splice(idx, 1);
      }
    } else if (line.startsWith("DIALOGUE|")) {
      const parts = line.substring(9).split("|");
      if (parts.length >= 3) {
        dialogue = {
          npcId: parts[0],
          text: parts[1],
          choices: parts[2].split(","),
        };
      }
    } else if (line.startsWith("COMBAT|")) {
      const parts = line.substring(7).split("|");
      if (parts.length >= 4) {
        combatLog.push(
          `${parts[0]} → ${parts[1]}: ${parts[2]} damage (${parts[3]})`
        );
      }
    } else if (line.startsWith("QUEST|")) {
      const parts = line.substring(6).split("|");
      if (parts.length >= 3) {
        const existing = quests.find((q) => q.id === parts[0]);
        if (existing) {
          existing.status = parts[1];
          existing.progress = parseFloat(parts[2]) || 0;
        } else {
          quests.push({
            id: parts[0],
            status: parts[1],
            progress: parseFloat(parts[2]) || 0,
          });
        }
      }
    } else if (line.startsWith("GAME_MESSAGE|")) {
      message += line.substring(13) + "\n";
    } else if (line === "BATTLE_WON") {
      battleWon = true;
      if (frames.length > 0) {
        frames[frames.length - 1].battleWon = true;
      }
    }
  }

  // If no PLAYER frames but we have data, create one
  if (frames.length === 0 && (classes.length > 0 || message || battleWon)) {
    frames.push({
      classes,
      player,
      inventory: inventory.map((i) => ({ ...i })),
      dialogue,
      combatLog,
      quests,
      message,
      battleWon,
    });
  }

  return frames;
}
