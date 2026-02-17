import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// In-memory rate limiter: userId -> { count, resetAt }
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const MAX_SOURCE_LENGTH = 10_000;

export async function POST(request: Request) {
  // 1. Authenticate via Supabase session
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  // 2. Rate limit per user
  const now = Date.now();
  const userLimit = rateLimits.get(user.id);

  if (userLimit && now < userLimit.resetAt) {
    if (userLimit.count >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute." },
        { status: 429 }
      );
    }
    userLimit.count++;
  } else {
    rateLimits.set(user.id, { count: 1, resetAt: now + RATE_WINDOW_MS });
  }

  // 3. Validate request body
  let body: { source_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const sourceCode = body.source_code;
  if (!sourceCode || typeof sourceCode !== "string") {
    return NextResponse.json(
      { error: "source_code is required." },
      { status: 400 }
    );
  }

  if (sourceCode.length > MAX_SOURCE_LENGTH) {
    return NextResponse.json(
      { error: `Source code exceeds ${MAX_SOURCE_LENGTH} character limit.` },
      { status: 400 }
    );
  }

  // 4. Build Judge0 submission
  const apiUrl = process.env.JUDGE0_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "Compilation service not configured." },
      { status: 503 }
    );
  }

  const encodedSource = Buffer.from(sourceCode).toString("base64");

  const submission = {
    source_code: encodedSource,
    language_id: 54, // C++ (GCC 9.2.0)
    cpu_time_limit: 5,
    memory_limit: 128000,
  };

  // 5. Submit to Judge0 (synchronous wait mode)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.JUDGE0_API_KEY;
  const apiHost = process.env.JUDGE0_API_HOST;
  if (apiKey && apiKey !== "your-rapidapi-key-here") {
    headers["X-RapidAPI-Key"] = apiKey;
  }
  if (apiHost) {
    headers["X-RapidAPI-Host"] = apiHost;
  }

  let judge0Response: Response;
  try {
    judge0Response = await fetch(
      `${apiUrl}/submissions?base64_encoded=true&wait=true`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(submission),
      }
    );
  } catch (err) {
    console.error("Judge0 fetch error:", err);
    return NextResponse.json(
      { error: "Compilation service unavailable." },
      { status: 502 }
    );
  }

  if (!judge0Response.ok) {
    console.error("Judge0 HTTP error:", judge0Response.status);
    return NextResponse.json(
      { error: "Compilation service error." },
      { status: 502 }
    );
  }

  const result = await judge0Response.json();

  // 6. Decode base64 fields
  const decode = (b64: string | null): string => {
    if (!b64) return "";
    try {
      return Buffer.from(b64, "base64").toString("utf-8");
    } catch {
      return b64;
    }
  };

  const stdout = decode(result.stdout);
  const stderr = decode(result.stderr);
  const compileOutput = decode(result.compile_output);
  const statusId: number = result.status?.id ?? 0;

  // 7. Map Judge0 status to error messages
  let errors: string[] = [];

  if (statusId === 6) {
    // Compilation Error
    errors = [`Compilation Error: ${compileOutput || "Unknown compilation error"}`];
  } else if (statusId === 5) {
    // Time Limit Exceeded
    errors = ["Runtime Error: Code execution timed out (infinite loop?)"];
  } else if (statusId >= 7 && statusId <= 12) {
    // Runtime errors (SIGSEGV, SIGFPE, SIGABRT, etc.)
    const signalNames: Record<number, string> = {
      7: "Memory limit exceeded",
      8: "Output limit exceeded",
      9: "Segmentation fault (SIGSEGV)",
      10: "Floating point exception (SIGFPE)",
      11: "Runtime error (SIGABRT)",
      12: "Internal error",
    };
    const desc = signalNames[statusId] || "Unknown runtime error";
    errors = [`Runtime Error: ${desc}${stderr ? ` — ${stderr.trim()}` : ""}`];
  } else if (statusId !== 3) {
    // 3 = Accepted (success). Anything else unexpected
    if (stderr) {
      errors = [`Error: ${stderr.trim()}`];
    }
  }

  return NextResponse.json({
    output: stdout,
    errors,
    compile_output: compileOutput,
    status_id: statusId,
    time: result.time,
    memory: result.memory,
  });
}
