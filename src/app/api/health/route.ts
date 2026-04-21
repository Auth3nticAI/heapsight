import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PROBE_TIMEOUT_MS = 4000;

// GET /api/health — reports app + upstream compiler health.
// Always returns 200 so the frontend can poll without triggering error overlays;
// callers should read `compiler.ok` to decide whether to show a banner.
export async function GET() {
  const compileUrl = process.env.COMPILE_SERVICE_URL;

  if (!compileUrl) {
    return NextResponse.json(
      {
        ok: false,
        compiler: {
          ok: false,
          status: null,
          latencyMs: null,
          error: "COMPILE_SERVICE_URL not configured",
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const started = Date.now();

  try {
    const res = await fetch(`${compileUrl}/health`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    const ok = res.ok;

    return NextResponse.json(
      {
        ok,
        compiler: {
          ok,
          status: res.status,
          latencyMs,
          error: ok ? null : `Upstream returned ${res.status}`,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    const latencyMs = Date.now() - started;
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        ok: false,
        compiler: {
          ok: false,
          status: null,
          latencyMs,
          error: timedOut ? "Probe timed out" : "Unreachable",
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } finally {
    clearTimeout(timeout);
  }
}
