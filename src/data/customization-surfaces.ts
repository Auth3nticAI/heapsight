// ---------------------------------------------------------------------------
// Creative Freedom — customization surfaces and milestone prompts
// ---------------------------------------------------------------------------

export interface CustomizationSurface {
  lockedElements: string[];
  unlockedElements: string[];
  dataFiles?: string[];
  colorConstants?: string[];
}

export interface MilestonePrompt {
  milestone: number;
  prompt: string;
  suggestions: string[];
}

// ---------------------------------------------------------------------------
// Per-path customization surfaces
// ---------------------------------------------------------------------------

export const PATH_SURFACES: Record<string, CustomizationSurface> = {
  rpg: {
    lockedElements: [
      "Grid rendering algorithm",
      "Turn-based combat pipeline",
      "Console output (cout statements)",
      "Collision detection logic",
    ],
    unlockedElements: [
      "Grid colors (wall, floor, player, enemy)",
      "Grid size (rows and columns)",
      "Player and enemy symbols or colors",
      "Room dimensions and layout",
      "Enemy stats (HP, attack, defense)",
      "Item names and descriptions",
      "Window title / game name",
    ],
  },

  platformer: {
    lockedElements: [
      "Physics integration (gravity, velocity)",
      "Collision resolution order",
      "Console output (cout statements)",
      "Game loop structure",
    ],
    unlockedElements: [
      "Player rectangle color and size",
      "Jump height and gravity strength",
      "Background color",
      "Platform colors and sizes",
      "Enemy movement speed",
      "Level layout",
      "Window title / game name",
    ],
  },

  shooter: {
    lockedElements: [
      "Bullet collision math",
      "Wave spawner pipeline",
      "Console output (cout statements)",
      "Score calculation logic",
    ],
    unlockedElements: [
      "Ship color and size",
      "Bullet speed and color",
      "Background color",
      "Enemy colors and sizes",
      "Wave timing and enemy count",
      "Power-up effects and colors",
      "Window title / game name",
    ],
  },

  crawler: {
    lockedElements: [
      "3D camera math (Camera3D)",
      "BeginMode3D / EndMode3D pipeline",
      "Console output (cout statements)",
      "Collision detection in 3D",
    ],
    unlockedElements: [
      "Wall and floor colors",
      "Camera field of view",
      "Player movement speed",
      "Dungeon layout and room sizes",
      "Enemy models (cube colors/sizes)",
      "Lighting and fog settings",
      "Window title / game name",
    ],
  },

  roguelike: {
    lockedElements: [
      "BSP generation algorithm",
      "Cellular automata rules",
      "Turn pipeline order",
      "Loot table probability math",
      "Console output (cout statements)",
      "Seed determinism",
    ],
    unlockedElements: [
      "Tile colors (wall, floor, corridor, stairs)",
      "Player/enemy/item colors",
      "Room size ranges",
      "Corridor style (straight vs L-shaped)",
      "Enemy names and stat values",
      "Item names and descriptions",
      "Loot table weights (rarity distribution)",
      "Window title / game name",
      "Room template shapes",
      "FOW dimming intensity",
    ],
    dataFiles: [
      "assets/data/loot_tables.txt",
      "assets/data/enemies.txt",
      "assets/data/items.txt",
      "assets/data/room_templates.txt",
      "assets/data/achievements.txt",
      "assets/data/config.txt",
    ],
    colorConstants: [
      "PLAYER_COLOR (default: GREEN)",
      "ENEMY_COLOR (default: RED)",
      "ITEM_COLOR (default: YELLOW)",
      "STAIRS_COLOR (default: YELLOW)",
      "WALL_COLOR (default: GRAY)",
      "FLOOR_COLOR (default: DARKGRAY)",
      "CORRIDOR_COLOR (default: DARKGRAY)",
      "TRAP_COLOR (default: ORANGE)",
      "RARE_ITEM_COLOR (default: BLUE)",
      "EPIC_ITEM_COLOR (default: PURPLE)",
    ],
  },

  aisandbox: {
    lockedElements: [
      "Steering behavior math (seek, flee, flock)",
      "Behavior tree evaluation order",
      "Genetic algorithm mutation/crossover",
      "Simulation pipeline order (sense \u2192 decide \u2192 steer \u2192 integrate)",
      "Console output (cout statements)",
      "Seed determinism",
    ],
    unlockedElements: [
      "Creature colors per species",
      "Creature sizes and shapes",
      "Background color / world theme",
      "Flock radius and separation distance",
      "Hunger depletion rate",
      "Mutation rate and magnitude",
      "Food respawn rate and density",
      "Population cap per species",
      "Predator-prey balance params",
      "Window title / simulation name",
      "Trail length and color",
    ],
    dataFiles: [
      "assets/data/species.txt",
      "assets/data/behaviors.txt",
      "assets/data/traits.txt",
      "assets/data/config.txt",
    ],
    colorConstants: [
      "PREY_COLOR (default: GREEN)",
      "PREDATOR_COLOR (default: RED)",
      "FOOD_COLOR (default: YELLOW)",
      "BG_COLOR (default: {20, 25, 20, 255} dark forest)",
      "TRAIL_COLOR (default: GREEN with alpha)",
      "DEBUG_VECTOR_COLOR (default: SKYBLUE)",
    ],
  },
};

// ---------------------------------------------------------------------------
// "Make It Yours" milestone prompts per path
// ---------------------------------------------------------------------------

const MILESTONE_PROMPTS: Record<string, MilestonePrompt[]> = {
  rpg: [
    {
      milestone: 10,
      prompt: "Your dungeon grid is alive! Give your game a name. Change the colors. Adjust the grid size. This RPG is YOURS now.",
      suggestions: [
        "Change the grid colors (wall, floor, player)",
        "Adjust the grid size (try 8x8 or 12x12)",
        "Change the player symbol or color",
      ],
    },
    {
      milestone: 25,
      prompt: "Combat works, items drop, enemies roam. Rename your items \u2014 don\u2019t leave them as generic placeholders. Choose YOUR color palette.",
      suggestions: [
        "Name your weapons and items",
        "Customize enemy stats and names",
        "Choose a color scheme that fits your world",
      ],
    },
    {
      milestone: 50,
      prompt: "Half your RPG is built. The systems are solid. Now make them YOURS \u2014 tweak the balance, name the world, set the tone.",
      suggestions: [
        "Balance enemy difficulty curve",
        "Name your game world and dungeons",
        "Adjust loot drop rates",
      ],
    },
    {
      milestone: 75,
      prompt: "Your RPG is polished and performant. Add your personal touch to the UI, the HUD colors, the victory messages.",
      suggestions: [
        "Customize HUD layout and colors",
        "Write custom victory/defeat messages",
        "Tune the difficulty progression",
      ],
    },
    {
      milestone: 100,
      prompt: "This is YOUR game. Name it. Write YOUR README. Take screenshots of your best moments. The v1.0 release carries YOUR name.",
      suggestions: [
        "Set a final game title",
        "Write a README describing your game",
        "Screenshot your best dungeon layouts",
      ],
    },
  ],

  platformer: [
    {
      milestone: 10,
      prompt: "Your platformer runs! Change the player color, tweak the jump height, pick a background. Make it feel like YOUR game.",
      suggestions: [
        "Change the player rectangle color and size",
        "Adjust jump height and gravity",
        "Change the background color",
      ],
    },
    {
      milestone: 25,
      prompt: "Platforms, enemies, and collisions work. Design YOUR signature level. Pick colors that set the mood.",
      suggestions: [
        "Design a custom level layout",
        "Choose a cohesive color palette",
        "Adjust enemy movement patterns",
      ],
    },
    {
      milestone: 50,
      prompt: "Your platformer is feature-complete. Tune the physics until the movement FEELS right to you. This is your game\u2019s identity.",
      suggestions: [
        "Fine-tune jump feel and gravity",
        "Customize dash and wall-jump params",
        "Adjust camera follow behavior",
      ],
    },
    {
      milestone: 75,
      prompt: "Performance is locked in. Polish the feel \u2014 particle colors, screen shake intensity, death animations.",
      suggestions: [
        "Add custom particle colors",
        "Tune screen shake intensity",
        "Customize transition effects",
      ],
    },
    {
      milestone: 100,
      prompt: "Ship it. This isn\u2019t a tutorial platformer \u2014 it\u2019s YOUR game. Name it, write the README, capture your best levels.",
      suggestions: [
        "Set your game\u2019s final title",
        "Write a README with screenshots",
        "Record a gameplay GIF",
      ],
    },
  ],

  shooter: [
    {
      milestone: 10,
      prompt: "Your ship flies and shoots! Change the colors, adjust bullet speed, pick YOUR visual style.",
      suggestions: [
        "Change ship color and size",
        "Adjust bullet speed and color",
        "Set a custom background color",
      ],
    },
    {
      milestone: 25,
      prompt: "Waves spawn, enemies die, power-ups drop. Design YOUR wave patterns. Choose YOUR power-up colors.",
      suggestions: [
        "Design custom wave compositions",
        "Choose power-up visual effects",
        "Adjust spawn timing and density",
      ],
    },
    {
      milestone: 50,
      prompt: "Your shooter is a real game. Tune the difficulty curve until it feels right. Set the mood with YOUR color choices.",
      suggestions: [
        "Fine-tune difficulty progression",
        "Customize the score multiplier UI",
        "Adjust background scrolling speed",
      ],
    },
    {
      milestone: 75,
      prompt: "Stress-tested and performant. Add your personal flair \u2014 explosion colors, particle effects, HUD style.",
      suggestions: [
        "Customize explosion colors",
        "Design your HUD layout",
        "Tune particle effect density",
      ],
    },
    {
      milestone: 100,
      prompt: "This is YOUR shooter. Name it, own it, release it. Write the README that tells your game\u2019s story.",
      suggestions: [
        "Choose your game\u2019s final title",
        "Write a compelling README",
        "Capture your highest score screenshot",
      ],
    },
  ],

  crawler: [
    {
      milestone: 10,
      prompt: "Your 3D dungeon renders! Adjust the camera FOV, change wall colors, set the atmosphere. This dungeon is YOURS.",
      suggestions: [
        "Change wall and floor colors",
        "Adjust the camera field of view",
        "Change the player movement speed",
      ],
    },
    {
      milestone: 25,
      prompt: "Rooms connect, enemies patrol, items glow. Design YOUR dungeon\u2019s visual language \u2014 colors, lighting, fog.",
      suggestions: [
        "Set a custom fog color and density",
        "Choose wall and floor materials",
        "Adjust room generation parameters",
      ],
    },
    {
      milestone: 50,
      prompt: "Your crawler is a real 3D game. Tune the combat feel, adjust the lighting, make the atmosphere YOUR own.",
      suggestions: [
        "Fine-tune combat timing",
        "Adjust lighting colors and intensity",
        "Customize enemy cube sizes and colors",
      ],
    },
    {
      milestone: 75,
      prompt: "Optimized and polished. Add atmosphere \u2014 adjust shadows, fog distance, ambient color. Make players FEEL the dungeon.",
      suggestions: [
        "Tune shadow and fog settings",
        "Customize ambient lighting",
        "Adjust post-processing effects",
      ],
    },
    {
      milestone: 100,
      prompt: "Ship it. Your 3D dungeon crawler is portfolio-ready. Name it, write the README, screenshot your deepest floor.",
      suggestions: [
        "Set your game\u2019s title",
        "Write a README with architecture notes",
        "Capture screenshots of generated dungeons",
      ],
    },
  ],

  roguelike: [
    {
      milestone: 10,
      prompt: "Your procedural dungeon works. Before moving on \u2014 give your game a name. Change the window title from \u201CHeapSight Roguelike\u201D to YOUR game\u2019s name. Swap the color palette. Adjust room count in the BSP parameters. This dungeon is YOURS now.",
      suggestions: [
        "Set a custom window title / game name",
        "Swap the tile color palette",
        "Adjust BSP room count and size parameters",
      ],
    },
    {
      milestone: 50,
      prompt: "You have a full loot system with rarities, equipment, shops, and synergies. Name your unique items \u2014 don\u2019t leave them as \u201CSword +1.\u201D Create loot table entries that tell YOUR game\u2019s story. Adjust rarity weights to match YOUR vision of difficulty.",
      suggestions: [
        "Name your unique weapons and items",
        "Write custom loot table entries",
        "Adjust rarity weight distribution",
      ],
    },
    {
      milestone: 100,
      prompt: "This isn\u2019t \u201CHeapSight Roguelike Tutorial.\u201D This is YOUR game. Name it. Write YOUR README \u2014 what\u2019s the world? Why is the dungeon there? Fill assets/screenshots/ with YOUR dungeon\u2019s most interesting generated layouts. The v1.0 release carries YOUR name.",
      suggestions: [
        "Write your game\u2019s lore and world description",
        "Screenshot your best generated layouts",
        "Write a README that tells your game\u2019s story",
      ],
    },
  ],

  aisandbox: [
    {
      milestone: 10,
      prompt: "Your creatures flock, eat, and flee. Choose YOUR world\u2019s theme \u2014 ocean, forest, tundra, alien planet. Set colors to match. Rename the simulation. Adjust flock radius and food density to create YOUR ecosystem\u2019s personality. This world is YOURS.",
      suggestions: [
        "Choose a world theme and matching colors",
        "Rename the simulation window",
        "Adjust flock radius and food density",
      ],
    },
    {
      milestone: 50,
      prompt: "You have predator-prey dynamics with visible population oscillation. Tune YOUR ecosystem \u2014 aggressive predators and scarce food create intense survival drama. Abundant food and gentle predators create a peaceful world. The parameters define your world\u2019s story.",
      suggestions: [
        "Tune predator aggression and prey speed",
        "Adjust food scarcity and respawn rates",
        "Set population balance parameters",
      ],
    },
    {
      milestone: 55,
      prompt: "Evolution is running. Watch the average speed increase over generations. Now change the selection pressure \u2014 what if SIZE mattered more than speed? What if vision range was the critical trait? Adjust mutation rates and watch how YOUR ecosystem evolves differently.",
      suggestions: [
        "Change which traits face selection pressure",
        "Adjust mutation rate and magnitude",
        "Compare evolution with different parameters",
      ],
    },
    {
      milestone: 100,
      prompt: "This isn\u2019t a tutorial. It\u2019s an autonomous ecosystem simulator YOU built. Name it. Write YOUR README \u2014 what evolves in your world? What surprised you? Screenshot the most interesting emergent behavior you\u2019ve observed. The v1.0 release is YOUR creation.",
      suggestions: [
        "Name your ecosystem simulator",
        "Document surprising emergent behaviors",
        "Screenshot your most interesting evolution runs",
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Lookup function
// ---------------------------------------------------------------------------

export function getCustomizationForMilestone(
  lessonNumber: number,
  path: string
): MilestonePrompt | null {
  const prompts = MILESTONE_PROMPTS[path];
  if (!prompts) return null;
  return prompts.find((p) => p.milestone === lessonNumber) || null;
}
