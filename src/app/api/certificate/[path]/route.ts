import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { ALL_RPG_LESSONS } from "@/data/lessons/rpg-index";
import { ALL_PLATFORMER_LESSONS } from "@/data/lessons/platformer-index";
import { ALL_CRAWLER_LESSONS } from "@/data/lessons/crawler-index";
import { ALL_SHOOTER_LESSONS } from "@/data/lessons/shooter-index";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Map short path slug → lesson array
const PATH_LESSONS: Record<string, { length: number; dbPath: string }> = {
  rpg: { length: ALL_RPG_LESSONS.length, dbPath: "rpg" },
  platformer: { length: ALL_PLATFORMER_LESSONS.length, dbPath: "platformer" },
  crawler: { length: ALL_CRAWLER_LESSONS.length, dbPath: "crawler" },
  shooter: { length: ALL_SHOOTER_LESSONS.length, dbPath: "shooter" },
};

const PATH_NAMES: Record<string, string> = {
  rpg: "RPG",
  platformer: "Platformer",
  crawler: "Dungeon Crawler",
  shooter: "Space Shooter",
};

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params;
  const pathInfo = PATH_LESSONS[path];

  if (!pathInfo) {
    return NextResponse.json(
      { error: `Unknown path: ${path}` },
      { status: 400 }
    );
  }

  // Authenticate user
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Count completed lessons for this path
  const { count, error: countError } = await supabase
    .from("lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("path", pathInfo.dbPath)
    .eq("status", "completed");

  if (countError) {
    return NextResponse.json(
      { error: "Failed to check progress" },
      { status: 500 }
    );
  }

  const completedCount = count || 0;
  if (completedCount < pathInfo.length) {
    return NextResponse.json(
      {
        error: `Path not complete. ${completedCount}/${pathInfo.length} lessons done.`,
        completedCount,
        totalCount: pathInfo.length,
      },
      { status: 400 }
    );
  }

  // Upsert certificate (idempotent — safe to call multiple times)
  const { data: cert, error: certError } = await supabase
    .from("certificates")
    .upsert(
      {
        user_id: user.id,
        path,
      },
      { onConflict: "user_id,path" }
    )
    .select("id, completed_at")
    .single();

  if (certError || !cert) {
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    certId: cert.id,
    path,
    pathName: PATH_NAMES[path] || path,
    completedAt: cert.completed_at,
    verifyUrl: `https://heapsight.com/certificate/${cert.id}`,
  });
}
