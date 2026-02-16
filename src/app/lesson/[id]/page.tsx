"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { getLessonById, getNextLesson } from "@/data/lessons";
import { useLessonStore } from "@/store/lesson-store";
import { runCppCode } from "@/lib/cpp-runner";
import { createClient } from "@/lib/supabase-browser";
import LessonEditor from "@/components/lesson/LessonEditor";
import LessonInstructions from "@/components/lesson/LessonInstructions";
import LessonOutput from "@/components/lesson/LessonOutput";
import LessonMemoryViz from "@/components/lesson/LessonMemoryViz";
import Link from "next/link";

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const lesson = getLessonById(lessonId);

  const code = useLessonStore((s) => s.currentCode);
  const setCode = useLessonStore((s) => s.setCode);
  const setOutput = useLessonStore((s) => s.setOutput);
  const setErrors = useLessonStore((s) => s.setErrors);
  const setTestResults = useLessonStore((s) => s.setTestResults);
  const isRunning = useLessonStore((s) => s.isRunning);
  const setIsRunning = useLessonStore((s) => s.setIsRunning);
  const testResults = useLessonStore((s) => s.testResults);
  const resetLesson = useLessonStore((s) => s.resetLesson);

  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Load saved code or starter code
  useEffect(() => {
    if (!lesson) return;

    const loadSavedCode = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("lesson_progress")
          .select("user_code, status")
          .eq("user_id", user.id)
          .eq("lesson_id", lesson.id)
          .single();

        if (data?.user_code) {
          setCode(data.user_code);
          if (data.status === "completed") setCompleted(true);
          return;
        }
      }
      resetLesson(lesson.starterCode);
    };

    loadSavedCode();
  }, [lesson, setCode, resetLesson]);

  const handleRun = useCallback(async () => {
    if (!lesson || isRunning) return;
    setIsRunning(true);
    setErrors([]);
    setTestResults([]);

    const result = await runCppCode(code, lesson.tests);

    setOutput(result.output);
    setErrors(result.errors);
    setTestResults(result.testResults);
    setIsRunning(false);

    // Save progress
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          user_code: code,
          status: "in_progress",
          attempts: 1, // Incremented server-side ideally
        },
        { onConflict: "user_id,lesson_id" }
      );
    }
  }, [lesson, code, isRunning, setIsRunning, setOutput, setErrors, setTestResults]);

  const handleSubmit = useCallback(async () => {
    if (!lesson || isRunning) return;

    // Run tests first
    setIsRunning(true);
    setErrors([]);
    setTestResults([]);

    const result = await runCppCode(code, lesson.tests);

    setOutput(result.output);
    setErrors(result.errors);
    setTestResults(result.testResults);
    setIsRunning(false);

    if (!result.allPassed) return;

    // Mark completed + award XP
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          user_code: code,
          status: "completed",
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

      // Award XP — try RPC, fallback to direct update
      const { error: rpcError } = await supabase.rpc("increment_xp", {
        xp_amount: lesson.xpReward,
      });
      if (rpcError) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("total_xp")
          .eq("id", user.id)
          .single();
        if (profile) {
          await supabase
            .from("user_profiles")
            .update({ total_xp: profile.total_xp + lesson.xpReward })
            .eq("id", user.id);
        }
      }

      setCompleted(true);
      setXpEarned(lesson.xpReward);
    }
  }, [lesson, code, isRunning, setIsRunning, setOutput, setErrors, setTestResults]);

  const handleReset = useCallback(() => {
    if (lesson) resetLesson(lesson.starterCode);
  }, [lesson, resetLesson]);

  if (!lesson) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl text-white mb-2">Lesson not found</h1>
          <Link href="/learn" className="text-primary text-sm hover:underline">
            Back to lessons
          </Link>
        </div>
      </main>
    );
  }

  const allPassed = testResults.length > 0 && testResults.every((t) => t.passed);
  const nextLesson = getNextLesson(lesson.id);

  return (
    <main className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="text-[#555] hover:text-white transition-colors text-sm"
          >
            &larr; Lessons
          </Link>
          <div className="w-px h-4 bg-[#2a2a3e]" />
          <h1 className="text-sm font-semibold text-white">
            {lesson.order}. {lesson.title}
          </h1>
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
            +{lesson.xpReward} XP
          </span>
        </div>
        {completed && (
          <span className="text-xs font-mono text-primary">
            Completed {xpEarned > 0 ? `(+${xpEarned} XP!)` : ""}
          </span>
        )}
      </header>

      {/* 4-pane layout */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 p-2 min-h-0">
        {/* Top-left: Instructions */}
        <div className="min-h-0 overflow-hidden">
          <LessonInstructions lesson={lesson} />
        </div>

        {/* Top-right: Code Editor */}
        <div className="min-h-0 overflow-hidden">
          <LessonEditor />
        </div>

        {/* Bottom-left: Memory Viz */}
        <div className="min-h-0 overflow-hidden">
          <LessonMemoryViz />
        </div>

        {/* Bottom-right: Output */}
        <div className="min-h-0 overflow-hidden">
          <LessonOutput />
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-[#1a1a2e] px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 bg-[#1a1a2e] text-white text-sm font-mono rounded-lg hover:bg-[#2a2a3e] transition-colors disabled:opacity-50 border border-[#2a2a3e]"
          >
            {isRunning ? "Running..." : "\u25B6 Run Code"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Submit
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-[#555] text-xs font-mono hover:text-[#888] transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="flex items-center gap-3">
          {allPassed && !completed && (
            <span className="text-xs font-mono text-primary animate-pulse">
              All tests pass! Click Submit to earn XP.
            </span>
          )}
          {completed && nextLesson && (
            <Link
              href={`/lesson/${nextLesson.id}`}
              className="px-4 py-2 bg-primary/20 text-primary text-sm font-mono rounded-lg hover:bg-primary/30 transition-colors border border-primary/30"
            >
              Next: {nextLesson.title} &rarr;
            </Link>
          )}
          {completed && !nextLesson && (
            <span className="text-xs font-mono text-primary">
              You&apos;ve completed all available lessons!
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
