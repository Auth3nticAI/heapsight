const express = require("express");
const { randomUUID } = require("crypto");
const { execFile } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

const app = express();
app.use(express.json({ limit: "100kb" }));

const PORT = 8080;
const JOBS_DIR = "/tmp/jobs";
const COMPILE_SCRIPT = "/opt/heapsight/compile.sh";
const MAX_CODE_SIZE = 50 * 1024; // 50KB
const VALID_PATHS = ["rpg", "platformer", "shooter", "crawler"];
const COMPILE_TIMEOUT_MS = 16_000; // slightly above the 15s bash timeout

// ---------- POST /compile ----------
app.post("/compile", async (req, res) => {
  const { code, path: learningPath, lesson, debug } = req.body;

  // --- Validate inputs ---
  if (typeof code !== "string" || code.length === 0) {
    return res.status(400).json({ success: false, errors: ["Missing or empty 'code' field"] });
  }
  if (code.length > MAX_CODE_SIZE) {
    return res.status(400).json({
      success: false,
      errors: [`Code exceeds ${MAX_CODE_SIZE / 1024}KB size limit (got ${(code.length / 1024).toFixed(1)}KB)`],
    });
  }
  if (!VALID_PATHS.includes(learningPath)) {
    return res.status(400).json({
      success: false,
      errors: [`Invalid path '${learningPath}'. Must be one of: ${VALID_PATHS.join(", ")}`],
    });
  }
  const lessonNum = Number(lesson);
  if (!Number.isInteger(lessonNum) || lessonNum < 1 || lessonNum > 100) {
    return res.status(400).json({
      success: false,
      errors: ["'lesson' must be an integer between 1 and 100"],
    });
  }

  const jobId = randomUUID();
  const jobDir = path.join(JOBS_DIR, jobId);
  const startTime = Date.now();

  try {
    // Create isolated temp directory for this compilation
    await fs.mkdir(jobDir, { recursive: true });

    const studentFile = path.join(jobDir, "student.cpp");
    const outputDir = path.join(jobDir, "out");
    await fs.writeFile(studentFile, code, "utf-8");
    await fs.mkdir(outputDir, { recursive: true });

    // Run compile.sh
    const { stdout, stderr, exitCode } = await runCompile(
      studentFile,
      outputDir,
      learningPath,
      String(lessonNum),
      debug ? "1" : "0"
    );

    const compileTimeMs = Date.now() - startTime;

    if (exitCode !== 0) {
      const errors = parseCompileErrors(stderr, jobId);
      return res.json({ success: false, errors, warnings: [], compileTimeMs });
    }

    // Capture warnings from successful compilations
    const warnings = parseCompileWarnings(stderr, jobId);

    // Read output artifacts
    const jsFile = path.join(outputDir, "game.js");
    const wasmFile = path.join(outputDir, "game.wasm");
    const dataFile = path.join(outputDir, "game.data");

    const [jsBuffer, wasmBuffer] = await Promise.all([
      fs.readFile(jsFile),
      fs.readFile(wasmFile),
    ]);

    // Asset data file is optional (only when --preload-file was used)
    let dataBase64 = null;
    try {
      const dataBuffer = await fs.readFile(dataFile);
      dataBase64 = dataBuffer.toString("base64");
    } catch {
      // No asset data — normal for lessons without preloaded assets
    }

    return res.json({
      success: true,
      js: jsBuffer.toString("base64"),
      wasm: wasmBuffer.toString("base64"),
      data: dataBase64,
      warnings,
      compileTimeMs,
    });
  } catch (err) {
    const compileTimeMs = Date.now() - startTime;
    console.error(`[${jobId}] Internal error:`, err.message);
    return res.status(500).json({
      success: false,
      errors: ["Internal compilation service error"],
      compileTimeMs,
    });
  } finally {
    // Always clean up the temp directory
    fs.rm(jobDir, { recursive: true, force: true }).catch(() => {});
  }
});

// ---------- GET /health ----------
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------- Helpers ----------

/**
 * Runs compile.sh and returns { stdout, stderr, exitCode }.
 * Never rejects — always resolves with the exit code.
 */
function runCompile(studentFile, outputDir, learningPath, lessonNum, debugMode) {
  return new Promise((resolve) => {
    const child = execFile(
      COMPILE_SCRIPT,
      [studentFile, outputDir, learningPath, lessonNum, debugMode],
      { timeout: COMPILE_TIMEOUT_MS, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        const exitCode = err ? err.code ?? 1 : 0;
        resolve({ stdout: stdout || "", stderr: stderr || "", exitCode });
      }
    );
  });
}

/**
 * Parses emscripten stderr into student-friendly error strings.
 * Strips internal /tmp/jobs/{uuid}/ paths so students only see line numbers.
 */
function parseCompileErrors(stderr, jobId) {
  if (!stderr || stderr.trim().length === 0) {
    return ["Compilation failed with no error output"];
  }

  // Strip the job-specific temp path prefix so errors show clean file references
  const jobPathPattern = new RegExp(`/tmp/jobs/${jobId}/`, "g");
  let cleaned = stderr.replace(jobPathPattern, "");

  // Also strip any generic /tmp/jobs/uuid/ pattern (fallback)
  cleaned = cleaned.replace(/\/tmp\/jobs\/[a-f0-9-]+\//g, "");

  // Split into individual error lines and filter meaningful ones
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => {
      // Keep actual error/warning messages, drop noise
      return (
        line.includes("error:") ||
        line.includes("warning:") ||
        line.includes("note:") ||
        line.includes("Error:") ||
        line.startsWith("student.cpp")
      );
    });

  if (lines.length === 0) {
    // If filtering removed everything, return the raw cleaned stderr
    return cleaned
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .slice(0, 20);
  }

  // Cap at 20 error lines to avoid overwhelming the student
  return lines.slice(0, 20);
}

/**
 * Extracts warning lines from successful compilation stderr.
 * Same path-cleaning as parseCompileErrors.
 */
function parseCompileWarnings(stderr, jobId) {
  if (!stderr || stderr.trim().length === 0) return [];

  const jobPathPattern = new RegExp(`/tmp/jobs/${jobId}/`, "g");
  let cleaned = stderr.replace(jobPathPattern, "");
  cleaned = cleaned.replace(/\/tmp\/jobs\/[a-f0-9-]+\//g, "");

  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes("warning:"))
    .slice(0, 10);
}

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`HeapSight compile service listening on port ${PORT}`);
});
