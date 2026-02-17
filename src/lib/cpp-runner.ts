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

// ---------------------------------------------------------------------------
// Backend: Judge0 (server-side GCC compilation via /api/compile)
// ---------------------------------------------------------------------------
async function compileWithJudge0(code: string): Promise<{ output: string; errors: string[] }> {
  const res = await fetch("/api/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code: code }),
  });

  if (res.status === 401) {
    return { output: "", errors: ["Please sign in to run code."] };
  }
  if (res.status === 429) {
    return { output: "", errors: ["Rate limit reached. Please wait a minute before running again."] };
  }
  if (!res.ok) {
    return { output: "", errors: ["Compilation service unavailable. Please try again later."] };
  }

  const data = await res.json();
  return {
    output: data.output ?? "",
    errors: data.errors ?? [],
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
// Main entry — selects backend, then runs tests client-side
// ---------------------------------------------------------------------------
export async function runCppCode(
  code: string,
  tests: LessonTest[]
): Promise<RunResult> {
  const backend = process.env.NEXT_PUBLIC_CPP_BACKEND ?? "jscpp";

  const { output, errors } =
    backend === "judge0"
      ? await compileWithJudge0(code)
      : await compileWithJSCPP(code);

  if (errors.length > 0) {
    return { output, errors, testResults: [], allPassed: false };
  }

  // Run tests against output (identical logic for both backends)
  const trimmedOutput = output.trim();
  const testResults: TestResult[] = tests.map((test) => {
    const expected = test.expectedOutput.trim();
    let passed: boolean;

    if (test.isPattern) {
      const regex = new RegExp(expected);
      passed = regex.test(trimmedOutput);
    } else {
      passed = trimmedOutput === expected;
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

  return { output, errors, testResults, allPassed };
}
