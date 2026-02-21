import type { LessonTest } from "@/types/lesson";

export interface TestResult {
  testId: string;
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface RunResult {
  output: string;
  errors: string[];
  testResults: TestResult[];
  allPassed: boolean;
}

export interface CompileResult {
  js: string | null;
  wasm: string | null;
  compileTimeMs: number | null;
  output: string;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Helper: extract path and lesson number from lesson ID
// e.g. "rpg-01-boot-dungeon" → { path: "rpg", lesson: 1 }
// e.g. "platformer-05-jump" → { path: "platformer", lesson: 5 }
// ---------------------------------------------------------------------------
export function parseLessonId(lessonId: string): { path: string; lesson: number } {
  const parts = lessonId.split("-");
  const path = parts[0]; // "rpg", "platformer", "shooter", "crawler"
  const lesson = parseInt(parts[1], 10) || 1;
  return { path, lesson };
}

// ---------------------------------------------------------------------------
// Map lesson ID prefix → DB template name (used in lesson_progress.path)
// Lesson IDs use short prefixes: "shooter", "rpg", "crawler", "platformer"
// The DB stores template names: "space_shooter", "simple_rpg", etc.
// ---------------------------------------------------------------------------
const LESSON_PATH_TO_DB: Record<string, string> = {
  shooter: "space_shooter",
  rpg: "simple_rpg",
  platformer: "platformer",
  crawler: "dungeon_crawler",
};

export function lessonDbPath(lessonId: string): string {
  const { path } = parseLessonId(lessonId);
  return LESSON_PATH_TO_DB[path] || path;
}

// ---------------------------------------------------------------------------
// Backend: WASM (Emscripten + raylib via /api/compile → Cloud Run)
// ---------------------------------------------------------------------------
export async function compileWithWasm(
  code: string,
  path: string,
  lesson: number
): Promise<CompileResult> {
  const res = await fetch("/api/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, path, lesson }),
  });

  if (res.status === 401) {
    return { js: null, wasm: null, compileTimeMs: null, output: "", errors: ["Please sign in to run code."] };
  }
  if (res.status === 429) {
    const data = await res.json().catch(() => ({}));
    const retryMsg = data.retryAfter ? ` Try again in ${data.retryAfter}s.` : "";
    return { js: null, wasm: null, compileTimeMs: null, output: "", errors: [`Rate limit reached.${retryMsg}`] };
  }
  if (res.status === 504) {
    return { js: null, wasm: null, compileTimeMs: null, output: "", errors: ["Compilation timed out. Simplify your code and try again."] };
  }
  if (res.status === 502) {
    return { js: null, wasm: null, compileTimeMs: null, output: "", errors: ["Compiler service unavailable. Please try again later."] };
  }
  if (!res.ok) {
    return { js: null, wasm: null, compileTimeMs: null, output: "", errors: ["Compilation service unavailable. Please try again later."] };
  }

  const data = await res.json();

  if (!data.success) {
    return {
      js: null,
      wasm: null,
      compileTimeMs: data.compileTimeMs ?? null,
      output: "",
      errors: data.errors ?? ["Compilation failed"],
    };
  }

  return {
    js: data.js,
    wasm: data.wasm,
    compileTimeMs: data.compileTimeMs ?? null,
    output: "",
    errors: [],
  };
}

// ---------------------------------------------------------------------------
// Backend: JSCPP (browser-side JS interpreter — fallback)
// ---------------------------------------------------------------------------
async function compileWithJSCPP(code: string): Promise<{ output: string; errors: string[] }> {
  const errors: string[] = [];
  let output = "";

  try {
    const JSCPP = (await import("JSCPP")).default;
    const outputChunks: string[] = [];

    JSCPP.run(code, "", {
      stdio: {
        write: (s: string) => {
          outputChunks.push(s);
        },
      },
      unsigned_overflow: "warn",
      maxTimeout: 5000,
    });

    output = outputChunks.join("");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("Undeclared")) {
      errors.push(`Compilation Error: ${message}`);
    } else if (message.includes("Syntax")) {
      errors.push(`Syntax Error: ${message}`);
    } else if (message.includes("timeout") || message.includes("Timeout")) {
      errors.push("Runtime Error: Code execution timed out (infinite loop?)");
    } else {
      errors.push(`Error: ${message}`);
    }
  }

  return { output, errors };
}

// ---------------------------------------------------------------------------
// Test runner — validates console output against expected test results
// ---------------------------------------------------------------------------
export function runTests(output: string, tests: LessonTest[]): { testResults: TestResult[]; allPassed: boolean } {
  const trimmedOutput = output.trim();
  const testResults: TestResult[] = tests.map((test) => {
    const expected = test.expectedOutput.trim();
    let passed: boolean;

    if (test.isPattern) {
      const regex = new RegExp(expected);
      passed = regex.test(trimmedOutput);
    } else {
      passed = trimmedOutput.split("\n").some(
        (line) => line.trim() === expected
      );
    }

    return {
      testId: test.id,
      description: test.description,
      passed,
      expected,
      actual: trimmedOutput,
    };
  });

  const allPassed = testResults.length > 0 && testResults.every((t) => t.passed);
  return { testResults, allPassed };
}

// ---------------------------------------------------------------------------
// Main entry — legacy flow using JSCPP (browser-side, for fallback)
// ---------------------------------------------------------------------------
export async function runCppCode(
  code: string,
  tests: LessonTest[]
): Promise<RunResult> {
  const { output, errors } = await compileWithJSCPP(code);

  if (errors.length > 0) {
    return { output, errors, testResults: [], allPassed: false };
  }

  const { testResults, allPassed } = runTests(output, tests);
  return { output, errors, testResults, allPassed };
}
