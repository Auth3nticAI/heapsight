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

export async function runCppCode(
  code: string,
  tests: LessonTest[]
): Promise<RunResult> {
  const errors: string[] = [];
  let output = "";

  try {
    // Dynamic import to avoid SSR issues
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
    const message =
      err instanceof Error ? err.message : String(err);

    // Parse JSCPP error messages for friendlier display
    if (message.includes("Undeclared")) {
      errors.push(`Compilation Error: ${message}`);
    } else if (message.includes("Syntax")) {
      errors.push(`Syntax Error: ${message}`);
    } else if (message.includes("timeout") || message.includes("Timeout")) {
      errors.push("Runtime Error: Code execution timed out (infinite loop?)");
    } else {
      errors.push(`Error: ${message}`);
    }

    return { output, errors, testResults: [], allPassed: false };
  }

  // Run tests against output
  const trimmedOutput = output.trim();
  const testResults: TestResult[] = tests.map((test) => {
    const expected = test.expectedOutput.trim();
    const passed = trimmedOutput === expected;
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
