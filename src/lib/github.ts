// ---------------------------------------------------------------------------
// GitHub integration — repo creation, file commits, README, releases
// ---------------------------------------------------------------------------

const REPO_DESCRIPTIONS: Record<string, string> = {
  rpg: "A top-down RPG built from scratch in C++ with raylib",
  platformer: "A 2D platformer built from scratch in C++ with raylib",
  shooter: "A space shooter built from scratch in C++ with raylib",
  crawler: "A 3D dungeon crawler built from scratch in C++ with raylib",
  roguelike:
    "A procedural roguelike built from scratch in C++ with raylib \u2014 BSP generation, cellular automata, permadeath, seed-driven determinism",
  aisandbox:
    "An autonomous ecosystem simulation built from scratch in C++ with raylib \u2014 steering behaviors, behavior trees, genetic algorithms, emergent evolution",
};

// ---------------------------------------------------------------------------
// Commit message conventions
// ---------------------------------------------------------------------------

// Path-specific milestone commit messages
const MILESTONE_MESSAGES: Record<string, Record<number, string>> = {
  roguelike: {
    10: "milestone: Micro Roguelike \u2014 BSP generation + combat + floor loop",
    25: "milestone: Seed Replay \u2014 identical generation from same seed",
    30: "milestone: Heap Freeze \u2014 zero allocation in game loop",
    50: "milestone: Complete Economy \u2014 full loot system",
    55: "milestone: Permadeath Loop \u2014 die, unlock, retry",
    70: "milestone: Seed Determinism \u2014 same seed + inputs = identical state",
    75: "milestone: Performance Verified \u2014 stress tested",
    100: "milestone: Ship It \u2014 portfolio-ready roguelike",
  },
  aisandbox: {
    10: "milestone: Micro Ecosystem \u2014 flock + eat + starve + flee",
    25: "milestone: Seed Replay \u2014 identical simulation from same seed",
    30: "milestone: Heap Freeze \u2014 zero allocation in simulation loop",
    50: "milestone: Complete Ecosystem \u2014 predator-prey balance",
    55: "milestone: Observable Evolution \u2014 traits adapt over 50 generations",
    70: "milestone: Deterministic Simulation \u2014 same seed = same evolutionary history",
    75: "milestone: Performance Verified \u2014 500 agents",
    100: "milestone: Ship It \u2014 portfolio-ready ecosystem sim",
  },
};

function getRoguelikePrefix(lessonNumber: number, title: string): string {
  const lower = title.toLowerCase();
  // Generation-specific lessons
  if (lower.includes("bsp") || lower.includes("cellular") || lower.includes("generation") || lower.includes("cave")) {
    return "gen";
  }
  // Permadeath / meta progression lessons
  if (lessonNumber >= 51 && (lower.includes("permadeath") || lower.includes("unlock") || lower.includes("meta") || lower.includes("seed"))) {
    return "meta";
  }
  return getDefaultPrefix(lessonNumber);
}

function getAiSandboxPrefix(lessonNumber: number, title: string): string {
  const lower = title.toLowerCase();
  // Behavior lessons
  if (lower.includes("flock") || lower.includes("steering") || lower.includes("behavior") || lower.includes("utility")) {
    return "behavior";
  }
  // Evolution lessons
  if (lessonNumber >= 52 && (lower.includes("evolution") || lower.includes("mutation") || lower.includes("crossover") || lower.includes("trait") || lower.includes("speciation"))) {
    return "evolve";
  }
  return getDefaultPrefix(lessonNumber);
}

function getDefaultPrefix(lessonNumber: number): string {
  if (lessonNumber <= 25) return "feat";
  if (lessonNumber <= 30) return "refactor";
  if (lessonNumber <= 50) return "feat";
  if (lessonNumber <= 75) return "perf";
  return "docs";
}

export function buildCommitMessage(
  lessonNumber: number,
  path: string,
  title: string
): string {
  // Check for path-specific milestone messages first
  const milestoneMsg = MILESTONE_MESSAGES[path]?.[lessonNumber];
  if (milestoneMsg) {
    return `${milestoneMsg} (Lesson ${lessonNumber})`;
  }

  let prefix: string;
  if (path === "roguelike") {
    prefix = getRoguelikePrefix(lessonNumber, title);
  } else if (path === "aisandbox") {
    prefix = getAiSandboxPrefix(lessonNumber, title);
  } else {
    prefix = getDefaultPrefix(lessonNumber);
  }

  return `${prefix}: L${String(lessonNumber).padStart(2, "0")} \u2014 ${title}`;
}

// ---------------------------------------------------------------------------
// Repo management
// ---------------------------------------------------------------------------

export interface RepoInfo {
  full_name: string;
  default_branch: string;
}

export async function createOrGetRepo(
  token: string,
  username: string,
  path: string
): Promise<RepoInfo> {
  const repoName = `heapsight-${path}`;

  // Check if repo already exists
  const checkRes = await fetch(
    `https://api.github.com/repos/${username}/${repoName}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (checkRes.ok) {
    const repo = await checkRes.json();
    return { full_name: repo.full_name, default_branch: repo.default_branch };
  }

  // Create new private repo
  const createRes = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      name: repoName,
      description:
        REPO_DESCRIPTIONS[path] ||
        `My HeapSight ${path} project \u2014 learning C++ through game development`,
      private: true,
      auto_init: true,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      `Failed to create repo ${repoName}: ${createRes.status} ${(err as { message?: string }).message || ""}`
    );
  }

  const repo = await createRes.json();
  return { full_name: repo.full_name, default_branch: repo.default_branch };
}

// ---------------------------------------------------------------------------
// File commits via GitHub Contents API
// ---------------------------------------------------------------------------

interface CommitResult {
  sha: string;
  path: string;
}

export async function commitFile(
  token: string,
  repoFullName: string,
  filePath: string,
  content: string,
  message: string,
  branch: string = "main"
): Promise<CommitResult> {
  // Get existing file SHA (needed for updates, 404 for new files)
  const existingRes = await fetch(
    `https://api.github.com/repos/${repoFullName}/contents/${filePath}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch,
  };

  if (existingRes.ok) {
    const existing = await existingRes.json();
    body.sha = existing.sha;
  }

  const res = await fetch(
    `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub commit failed for ${filePath}: ${res.status} ${(error as { message?: string }).message || ""}`
    );
  }

  const result = await res.json();
  return { sha: result.commit.sha, path: filePath };
}

// ---------------------------------------------------------------------------
// README auto-generation
// ---------------------------------------------------------------------------

interface LessonEntry {
  lessonNumber: number;
  title: string;
  date: string;
}

export function generateReadme(
  username: string,
  path: string,
  completedLessons: LessonEntry[]
): string {
  const pathTitle = path.charAt(0).toUpperCase() + path.slice(1);
  const sorted = [...completedLessons].sort(
    (a, b) => a.lessonNumber - b.lessonNumber
  );
  const progressRows = sorted
    .map((l) => `| ${l.lessonNumber} | ${l.title} | ${l.date} |`)
    .join("\n");

  return `# HeapSight ${pathTitle} Project

> Built by @${username} on [HeapSight](https://heapsight.com) \u2014 Learn C++ by building real games

## Progress

| # | Lesson | Completed |
|---|--------|-----------|
${progressRows}

---
*Auto-generated by HeapSight*
`;
}

// ---------------------------------------------------------------------------
// Tagged releases at milestones
// ---------------------------------------------------------------------------

const RELEASE_TITLES: Record<string, Record<number, string>> = {
  roguelike: {
    25: "Seed Replay \u2014 Deterministic Generation",
    50: "Complete Economy \u2014 Full Loot System",
    75: "Performance Verified \u2014 Stress Tested",
    100: "Ship It \u2014 Portfolio-Ready Roguelike",
  },
  aisandbox: {
    25: "Seed Replay \u2014 Deterministic Simulation",
    50: "Complete Ecosystem \u2014 Predator-Prey Balance",
    75: "Performance Verified \u2014 500 Agents",
    100: "Ship It \u2014 Portfolio-Ready Ecosystem Sim",
  },
};

export function getReleaseInfo(
  lessonNumber: number,
  path: string
): { tag: string; title: string } | null {
  const MILESTONES: Record<number, string> = {
    25: "v0.25",
    50: "v0.50",
    75: "v0.75",
    100: "v1.0",
  };

  const tag = MILESTONES[lessonNumber];
  if (!tag) return null;

  const pathTitle =
    RELEASE_TITLES[path]?.[lessonNumber] ||
    `Lesson ${lessonNumber} Milestone`;

  return { tag, title: pathTitle };
}

export async function createRelease(
  token: string,
  repoFullName: string,
  tag: string,
  name: string,
  body: string
): Promise<void> {
  const res = await fetch(
    `https://api.github.com/repos/${repoFullName}/releases`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        tag_name: tag,
        name,
        body,
        draft: false,
        prerelease: false,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub release creation failed: ${res.status} ${(error as { message?: string }).message || ""}`
    );
  }
}
