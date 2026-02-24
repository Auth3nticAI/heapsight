import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import {
  createOrGetRepo,
  commitFile,
  commitCIScaffolding,
  buildCommitMessage,
  generateReadme,
  createRelease,
  getReleaseInfo,
  RepoInfo,
} from "@/lib/github";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// POST /api/github/commit — fire-and-forget from lesson completion
export async function POST(req: NextRequest) {
  let body: {
    lessonId?: string;
    code?: string;
    lessonNumber?: number;
    title?: string;
    path?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lessonId, code, lessonNumber, title, path } = body;
  if (!lessonId || !code || !lessonNumber || !title || !path) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Auth
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load GitHub credentials from profile
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("github_access_token, github_username, github_repos")
    .eq("id", user.id)
    .single();

  if (!profile?.github_access_token || !profile?.github_username) {
    return NextResponse.json(
      { error: "GitHub not connected" },
      { status: 400 }
    );
  }

  const token = profile.github_access_token;
  const username = profile.github_username;

  try {
    // Ensure repo exists (lazy creation, cached in github_repos JSONB)
    const repos = (profile.github_repos || {}) as Record<string, RepoInfo>;
    let repoInfo = repos[path];

    if (!repoInfo) {
      repoInfo = await createOrGetRepo(token, username, path);
      repos[path] = repoInfo;
      await supabase
        .from("profiles")
        .update({ github_repos: repos })
        .eq("id", user.id);

      // Scaffold CI files on first repo creation (best-effort)
      commitCIScaffolding(token, repoInfo.full_name, path, repoInfo.default_branch)
        .catch((e) => console.warn("[GitHub] CI scaffolding failed:", e));
    }

    // Commit the lesson file
    const slug = lessonId.replace(/^[a-z]+-/, "");
    const filePath = `src/lesson-${slug}.cpp`;
    const message = buildCommitMessage(lessonNumber, path, title);
    const result = await commitFile(
      token,
      repoInfo.full_name,
      filePath,
      code,
      message
    );

    // Record commit in github_commits table (idempotent via UNIQUE constraint)
    await supabase.from("github_commits").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        path,
        repo_full_name: repoInfo.full_name,
        commit_sha: result.sha,
        commit_message: message,
        file_path: filePath,
      },
      { onConflict: "user_id,lesson_id,path" }
    );

    // Update README with progress (best-effort)
    try {
      const { data: allCommits } = await supabase
        .from("github_commits")
        .select("lesson_id, commit_message, created_at")
        .eq("user_id", user.id)
        .eq("path", path)
        .order("created_at", { ascending: true });

      const lessons = (allCommits || []).map(
        (c: { lesson_id: string; commit_message: string; created_at: string }) => ({
          lessonNumber: parseInt(c.lesson_id.replace(/^[a-z]+-/, ""), 10) || 0,
          title: c.commit_message.replace(/^[a-z]+: L\d+ \u2014 /, "").replace(/^milestone: .+ \(Lesson \d+\)$/, c.commit_message),
          date: new Date(c.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        })
      );

      const readme = generateReadme(username, path, lessons);
      await commitFile(
        token,
        repoInfo.full_name,
        "README.md",
        readme,
        `docs: update progress (L${lessonNumber})`
      );
    } catch (e) {
      console.warn("[GitHub] README update failed:", e);
    }

    // Tagged release at milestones (best-effort)
    const release = getReleaseInfo(lessonNumber, path);
    if (release) {
      try {
        await createRelease(
          token,
          repoInfo.full_name,
          release.tag,
          release.title,
          `Completed ${lessonNumber} lessons on the ${path} path!`
        );
      } catch (e) {
        console.warn("[GitHub] Release creation failed:", e);
      }
    }

    return NextResponse.json({ ok: true, sha: result.sha });
  } catch (err) {
    console.error("[GitHub Commit] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Commit failed" },
      { status: 500 }
    );
  }
}
