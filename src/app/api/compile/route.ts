import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// In-memory rate limiter: IP -> { count, resetAt }
// ---------------------------------------------------------------------------
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max compilations per window
const RATE_WINDOW_MS = 60_000; // 1 minute

const VALID_PATHS = ["rpg", "platformer", "shooter", "crawler", "roguelike", "aisandbox"] as const;
const MAX_CODE_SIZE = 50 * 1024; // 50KB
const COMPILE_TIMEOUT_MS = 20_000; // 20s fetch timeout

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    }
    entry.count++;
    return { allowed: true, retryAfter: 0 };
  }

  rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  return { allowed: true, retryAfter: 0 };
}

// ---------------------------------------------------------------------------
// POST /api/compile — Proxy to Cloud Run compiler service
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  // 1. Rate limit by IP
  const ip = getClientIp(request);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter },
      { status: 429 }
    );
  }

  // 2. Parse body
  let body: { code?: unknown; path?: unknown; lesson?: unknown; debug?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // 3. Validate inputs
  const { code, path, lesson, debug } = body;

  if (typeof code !== "string" || code.length === 0) {
    return NextResponse.json(
      { error: "Missing or empty 'code' field" },
      { status: 400 }
    );
  }
  if (code.length > MAX_CODE_SIZE) {
    return NextResponse.json(
      { error: `Code exceeds ${MAX_CODE_SIZE / 1024}KB size limit` },
      { status: 400 }
    );
  }
  if (typeof path !== "string" || !VALID_PATHS.includes(path as typeof VALID_PATHS[number])) {
    return NextResponse.json(
      { error: `Invalid path. Must be one of: ${VALID_PATHS.join(", ")}` },
      { status: 400 }
    );
  }
  const lessonNum = Number(lesson);
  if (!Number.isInteger(lessonNum) || lessonNum < 1 || lessonNum > 100) {
    return NextResponse.json(
      { error: "'lesson' must be an integer between 1 and 100" },
      { status: 400 }
    );
  }

  // 4. Forward to compiler service
  const compileUrl = process.env.COMPILE_SERVICE_URL;
  if (!compileUrl) {
    return NextResponse.json(
      { error: "Compilation service not configured" },
      { status: 503 }
    );
  }

  const payload = JSON.stringify({
    code,
    path: path === "crawler" ? "robotics" : path,
    lesson: lessonNum,
    debug: !!debug,
  });

  // Retry once on 503 (Cloud Run cold-start race where the frontend returns
  // 503 before the container is ready).
  const MAX_ATTEMPTS = 2;
  const RETRY_DELAY_MS = 1500;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), COMPILE_TIMEOUT_MS);

    try {
      const compilerRes = await fetch(`${compileUrl}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal: controller.signal,
      });

      // Non-2xx from upstream: surface a specific status instead of a blanket 502.
      if (!compilerRes.ok) {
        if (compilerRes.status === 503 && attempt < MAX_ATTEMPTS) {
          clearTimeout(timeout);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        const hint =
          compilerRes.status === 503
            ? "Compiler is warming up. Try again in a few seconds."
            : compilerRes.status === 429
            ? "Compiler is busy. Try again in a moment."
            : "Compiler returned an error.";
        console.error(
          `Compiler upstream ${compilerRes.status} (attempt ${attempt}/${MAX_ATTEMPTS})`
        );
        return NextResponse.json(
          { error: hint, upstreamStatus: compilerRes.status },
          { status: compilerRes.status === 503 ? 503 : 502 }
        );
      }

      // Parse JSON safely — upstream occasionally returns HTML on infra errors.
      let result: { compileTimeMs?: number; [k: string]: unknown };
      try {
        result = await compilerRes.json();
      } catch {
        console.error("Compiler returned non-JSON response");
        return NextResponse.json(
          { error: "Compiler returned an invalid response." },
          { status: 502 }
        );
      }

      const headers: Record<string, string> = {};
      if (result.compileTimeMs != null) {
        headers["X-Compile-Time-Ms"] = String(result.compileTimeMs);
      }

      return NextResponse.json(result, { status: 200, headers });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Compilation timed out. Your code may be too complex, or the compiler is overloaded." },
          { status: 504 }
        );
      }
      // Network / DNS / TLS failure reaching Cloud Run.
      console.error(`Compiler fetch failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, err);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      return NextResponse.json(
        { error: "Can't reach the compiler service. Try again in a moment." },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  // Unreachable — loop either returns or continues.
  return NextResponse.json(
    { error: "Compiler service unavailable." },
    { status: 502 }
  );
}

// ---------------------------------------------------------------------------
// GET /api/compile — Health check
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
