"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getSpaceShooterLessonById, getNextSpaceShooterLesson } from "@/data/lessons";
import { getShooterLessonById, getNextShooterLesson } from "@/data/lessons/shooter-index";
import { getRPGLessonById, getNextRPGLesson } from "@/data/lessons/rpg-index";
import { getPlatformerLessonById, getNextPlatformerLesson } from "@/data/lessons/platformer-index";
import { getCrawlerLessonById, getNextCrawlerLesson } from "@/data/lessons/crawler-index";
import { getGameVariant } from "@/data/game-templates";
import { useLessonStore } from "@/store/lesson-store";
import { compileWithWasm, parseLessonId, lessonDbPath, runTests, runCppCode } from "@/lib/cpp-runner";
// Legacy protocol parsers — kept for potential fallback use
// import { parseGameOutput } from "@/lib/game-protocol";
// import { parseCrawlerFrames } from "@/lib/crawler-protocol";
import { createClient } from "@/lib/supabase-browser";
import { getTemplateInfo } from "@/data/templates-info";
import { CRAWLER_LESSON_TITLES } from "@/data/game-templates/dungeon-crawler/lesson-titles";
import type { GameTemplate } from "@/types/game";
import type { LessonPart } from "@/types/lesson";
// import dynamic from "next/dynamic";
import LessonEditor from "@/components/lesson/LessonEditor";
import LessonInstructions from "@/components/lesson/LessonInstructions";
import LessonOutput from "@/components/lesson/LessonOutput";
import HintSystem from "@/components/lesson/HintSystem";
import LessonMemoryViz from "@/components/lesson/LessonMemoryViz";
import GameCanvasWrapper from "@/components/GameCanvasWrapper";
import PartProgressIndicator from "@/components/lesson/PartProgressIndicator";
import PaywallModal from "@/components/PaywallModal";
import Link from "next/link";
import confetti from "canvas-confetti";
import { updateStreakOnCompletion } from "@/lib/streak-manager";
import { recordLessonCompletion } from "@/lib/daily-goal";
import { checkAndUnlockAchievements } from "@/lib/achievement-manager";
import { getLevelInfo } from "@/lib/lesson-metadata";
import ConfettiCelebration from "@/components/feedback/ConfettiCelebration";
import AchievementUnlocked from "@/components/feedback/AchievementUnlocked";
import LevelUpCelebration from "@/components/feedback/LevelUpCelebration";
import type { Achievement } from "@/lib/achievements";

// Legacy CrawlerPreviewCanvas — replaced by WasmGameCanvas
// const CrawlerPreviewCanvas = dynamic(
//   () => import("@/components/lesson/CrawlerPreviewCanvas"),
//   { ssr: false }
// );

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const lesson = getShooterLessonById(lessonId) ?? getSpaceShooterLessonById(lessonId) ?? getRPGLessonById(lessonId) ?? getPlatformerLessonById(lessonId) ?? getCrawlerLessonById(lessonId);

  const currentPart = useLessonStore((s) => s.currentPart);
  const part1Code = useLessonStore((s) => s.part1Code);
  const part2Code = useLessonStore((s) => s.part2Code);
  const setPart1Code = useLessonStore((s) => s.setPart1Code);
  const setPart2Code = useLessonStore((s) => s.setPart2Code);
  const setOutput = useLessonStore((s) => s.setOutput);
  const setErrors = useLessonStore((s) => s.setErrors);
  const setTestResults = useLessonStore((s) => s.setTestResults);
  const isRunning = useLessonStore((s) => s.isRunning);
  const setIsRunning = useLessonStore((s) => s.setIsRunning);
  const testResults = useLessonStore((s) => s.testResults);
  const resetLesson = useLessonStore((s) => s.resetLesson);
  const part1Completed = useLessonStore((s) => s.part1Completed);
  const part2Completed = useLessonStore((s) => s.part2Completed);
  const markPart1Complete = useLessonStore((s) => s.markPart1Complete);
  const markPart2Complete = useLessonStore((s) => s.markPart2Complete);
  const setCurrentPart = useLessonStore((s) => s.setCurrentPart);
  // Legacy frame setters — kept in store but unused in WASM flow
  // const setGameFrame = useLessonStore((s) => s.setGameFrame);
  // const setCrawlerFrames = useLessonStore((s) => s.setCrawlerFrames);
  const wasmJs = useLessonStore((s) => s.wasmJs);
  const wasmWasm = useLessonStore((s) => s.wasmWasm);
  const setWasmOutput = useLessonStore((s) => s.setWasmOutput);

  const [xpEarned, setXpEarned] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "pro">("free");
  const [userTemplate, setUserTemplate] = useState<GameTemplate | null>(null);
  const [runSuccess, setRunSuccess] = useState(false);
  const [leftTab, setLeftTab] = useState<"lesson" | "game" | "output" | "memory">("lesson");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"streak" | "level" | "daily_goal">("streak");
  const [celebrationDetail, setCelebrationDetail] = useState("");
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: string } | null>(null);

  // Session & analytics tracking
  const [sessionStartTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [showBonusXP, setShowBonusXP] = useState(false);
  const [bonusXPAmount, setBonusXPAmount] = useState(0);

  // Ref to track if we're waiting for console output to run submit validation
  const pendingSubmitRef = useRef(false);

  const templateInfo = userTemplate ? getTemplateInfo(userTemplate) : null;
  const isCrawlerTemplate = templateInfo?.category === "crawler";

  // Get active part data — may use game/crawler variant for Part 2
  const gameVariant =
    lesson && userTemplate ? getGameVariant(lesson.id, userTemplate) : null;

  const getActivePart = (): LessonPart | null => {
    if (!lesson) return null;
    if (currentPart === 1) return lesson.part1;
    // For Part 2, override with variant data if available
    if (gameVariant) {
      return {
        ...lesson.part2,
        ...(isCrawlerTemplate ? { type: "game_builder" as const } : {}),
        ...(gameVariant.instructions ? { instructions: gameVariant.instructions } : {}),
        starterCode: gameVariant.starterCode,
        solutionCode: gameVariant.solutionCode,
        tests: gameVariant.tests,
        hints: gameVariant.hints,
      };
    }
    return lesson.part2;
  };

  const activePart = getActivePart();
  const activeCode = currentPart === 1 ? part1Code : part2Code;

  // Load saved code or starter code
  useEffect(() => {
    if (!lesson) return;

    const loadSavedCode = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);

        // Load user's template and tier
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_game_template, tier")
          .eq("id", user.id)
          .single();

        const template = profile?.selected_game_template as GameTemplate | null;
        if (template) {
          setUserTemplate(template);
        }

        const tier = (profile?.tier as "free" | "pro") || "free";
        setUserTier(tier);

        // Block free users from pro lessons
        if (lesson.tier === "pro" && tier === "free") {
          setShowPaywall(true);
          return;
        }

        // Look up variant starter code (crawler or game) for Part 2 fallback
        const variant = template ? getGameVariant(lesson.id, template) : null;
        const part2Starter = variant?.starterCode || lesson.part2.starterCode;

        // Load saved progress (path-isolated, derived from lesson ID)
        const dbPath = lessonDbPath(lesson.id);
        const { data } = await supabase
          .from("lesson_progress")
          .select("part1_user_code, part2_user_code, part1_status, part2_status, status")
          .eq("user_id", user.id)
          .eq("lesson_id", lesson.id)
          .eq("path", dbPath)
          .maybeSingle();

        if (data) {
          const p1Code = data.part1_user_code || lesson.part1.starterCode;
          const p2Code = data.part2_user_code || part2Starter;
          setPart1Code(p1Code);
          setPart2Code(p2Code);

          if (data.part1_status === "completed") markPart1Complete();
          if (data.part2_status === "completed") markPart2Complete();

          // If part 1 done but not part 2, start on part 2
          if (data.part1_status === "completed" && data.part2_status !== "completed") {
            setCurrentPart(2);
          }
          return;
        }
      }

      // No saved data — use starter codes (variant-aware for Part 2)
      const initTemplate = userTemplate;
      const initVariant = initTemplate ? getGameVariant(lesson.id, initTemplate) : null;
      resetLesson(lesson.part1.starterCode, initVariant?.starterCode || lesson.part2.starterCode);
    };

    loadSavedCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Create session record on lesson start
  useEffect(() => {
    if (!lesson || !userId) return;
    const supabase = createClient();
    supabase
      .from("lesson_sessions")
      .insert({
        user_id: userId,
        lesson_id: lesson.id,
        started_at: new Date(sessionStartTime).toISOString(),
      })
      .then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, lessonId]);

  // Extract lesson path and number for the WASM compiler
  const { path: lessonPath, lesson: lessonNumber } = lesson ? parseLessonId(lesson.id) : { path: "rpg", lesson: 1 };

  const handleRun = useCallback(async () => {
    if (!activePart || isRunning) return;
    setIsRunning(true);
    setErrors([]);
    setTestResults([]);
    setWasmOutput(null, null, null);

    if (currentPart === 2) {
      // Part 2: WASM compilation via Cloud Run
      const result = await compileWithWasm(activeCode, lessonPath, lessonNumber);

      if (result.errors.length > 0) {
        setErrors(result.errors);
        setIsRunning(false);
        setLeftTab("output");
        return;
      }

      // Store WASM artifacts — WasmGameCanvas will load and run them
      setWasmOutput(result.js, result.wasm, result.compileTimeMs);
      setIsRunning(false);

      // Auto-switch to game tab to see the compiled game
      setLeftTab("game");

      setRunSuccess(true);
      setTimeout(() => setRunSuccess(false), 800);
    } else {
      // Part 1: JSCPP fallback for concept lessons (cout-based)
      const result = await runCppCode(activeCode, activePart.tests);

      setOutput(result.output);
      setErrors(result.errors);
      setTestResults(result.testResults);
      setIsRunning(false);

      setLeftTab("output");

      if (result.errors.length === 0 && result.output) {
        setRunSuccess(true);
        setTimeout(() => setRunSuccess(false), 800);
      }
    }

    // Save progress
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && lesson) {
      const updateData: Record<string, string> = {
        user_id: user.id,
        lesson_id: lesson.id,
        path: lessonDbPath(lesson.id),
        status: "in_progress",
      };
      if (currentPart === 1) {
        updateData.part1_user_code = activeCode;
        updateData.part1_status = "in_progress";
      } else {
        updateData.part2_user_code = activeCode;
        updateData.part2_status = "in_progress";
      }

      await supabase
        .from("lesson_progress")
        .upsert(updateData, { onConflict: "user_id,lesson_id,path" });
    }
  }, [activePart, activeCode, currentPart, isRunning, lesson, lessonPath, lessonNumber, userTemplate, setIsRunning, setOutput, setErrors, setTestResults, setWasmOutput]);

  const handleSubmit = useCallback(async () => {
    if (!activePart || !lesson || isRunning) return;

    if (currentPart === 2) {
      // Part 2: WASM flow
      // If game is already running (wasmJs loaded), check current test results
      const currentTestResults = useLessonStore.getState().testResults;
      const alreadyPassed = currentTestResults.length > 0 && currentTestResults.every((t) => t.passed);

      if (!alreadyPassed) {
        // Need to compile first, then wait for console output
        setIsRunning(true);
        setErrors([]);
        setTestResults([]);
        setWasmOutput(null, null, null);

        const result = await compileWithWasm(activeCode, lessonPath, lessonNumber);

        if (result.errors.length > 0) {
          setErrors(result.errors);
          setIsRunning(false);
          setLeftTab("output");
          return;
        }

        setWasmOutput(result.js, result.wasm, result.compileTimeMs);
        pendingSubmitRef.current = true;
        setIsRunning(false);
        setLeftTab("game");
        return; // Completion flow triggered by handleWasmConsoleOutput when tests pass
      }

      // Tests already pass — proceed to completion flow below
    } else {
      // Part 1: JSCPP flow
      setIsRunning(true);
      setErrors([]);
      setTestResults([]);

      const result = await runCppCode(activeCode, activePart.tests);

      setOutput(result.output);
      setErrors(result.errors);
      setTestResults(result.testResults);
      setIsRunning(false);

      if (!result.allPassed) return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Server-side Pro tier check before awarding any credit
    if (currentPart === 2 && lesson.tier === "pro") {
      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();
      if ((freshProfile?.tier || "free") === "free") {
        setShowPaywall(true);
        return;
      }
    }

    const progressPath = lessonDbPath(lesson.id);

    if (currentPart === 1) {
      // Complete Part 1, transition to Part 2
      console.log("SUBMIT PART1:", { lessonId: lesson.id, path: progressPath, userTemplate });
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          path: progressPath,
          status: "in_progress",
          part1_status: "completed",
          part1_user_code: activeCode,
        },
        { onConflict: "user_id,lesson_id,path" }
      );

      markPart1Complete();
      setCurrentPart(2);
      setLeftTab("lesson"); // Show Part 2 instructions
    } else {
      // Complete Part 2 — lesson fully done
      console.log("SUBMIT PART2:", { lessonId: lesson.id, path: progressPath, userTemplate });
      const upsertResult = await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          path: progressPath,
          status: "completed",
          part2_status: "completed",
          part2_user_code: activeCode,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id,path" }
      );
      console.log("UPSERT RESULT:", upsertResult);

      // Update accumulated game code
      if (userTemplate && gameVariant) {
        await supabase.from("user_games").upsert(
          {
            user_id: user.id,
            template: userTemplate,
            current_lesson_id: lesson.id,
            accumulated_code: gameVariant.accumulatedCode || activeCode,
            last_modified: new Date().toISOString(),
          },
          { onConflict: "user_id,template" }
        );
      }

      // Award XP (idempotent — only grants on first completion)
      const { data: xpResult, error: xpError } = await supabase.rpc("award_lesson_xp", {
        p_lesson_id: lesson.id,
        p_xp_amount: lesson.xpReward,
        p_path: progressPath,
      });

      if (xpError) {
        // Fallback to original increment_xp if new RPC doesn't exist yet
        await supabase.rpc("increment_xp", { xp_amount: lesson.xpReward });
      }

      const isFirstCompletion = xpResult?.[0]?.is_first_completion ?? true;

      markPart2Complete();
      setXpEarned(isFirstCompletion ? lesson.xpReward : 0);
      setLeftTab("output"); // Show completion results

      // Celebration confetti (only on first completion)
      if (isFirstCompletion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b"],
        });

        // Variable reward: 50% chance of bonus XP (10-50)
        if (Math.random() > 0.5) {
          const bonus = Math.floor(Math.random() * 41) + 10;
          await supabase.rpc("increment_xp", { xp_amount: bonus });
          setBonusXPAmount(bonus);
          setTimeout(() => setShowBonusXP(true), 2000);
        }
      }

      // Update session record with completion data
      supabase
        .from("lesson_sessions")
        .update({
          completed_at: new Date().toISOString(),
          time_on_part2_seconds: Math.floor((Date.now() - sessionStartTime) / 1000),
          hints_used: hintsUsed,
        })
        .eq("user_id", user.id)
        .eq("lesson_id", lesson.id)
        .is("completed_at", null)
        .then(() => {});

      // Update streak & daily goal
      const [streakResult, dailyResult] = await Promise.all([
        updateStreakOnCompletion(user.id),
        recordLessonCompletion(user.id, lesson.xpReward),
      ]);

      // Trigger celebration overlay for milestones or daily goal
      if (streakResult?.is_new_milestone) {
        setCelebrationType("streak");
        setCelebrationDetail(`${streakResult.milestone}-day streak!`);
        setShowCelebration(true);
      } else if (dailyResult.goalJustCompleted) {
        // Award the +50 daily goal bonus XP
        await supabase.rpc("increment_xp", { xp_amount: 50 });
        setCelebrationType("daily_goal");
        setCelebrationDetail("+50 Bonus XP");
        setShowCelebration(true);
      }

      // Check achievements + level-up
      // Read pre-achievement XP to detect level changes
      const { data: preProfile } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();
      const preXp = preProfile?.total_xp || 0;
      const oldLevel = getLevelInfo(preXp).level;

      const newAchievements = await checkAndUnlockAchievements(user.id);
      if (newAchievements.length > 0) {
        const celebrationActive = showCelebration;
        setTimeout(() => setUnlockedAchievement(newAchievements[0]), celebrationActive ? 4500 : 500);
      }

      // Re-read XP (may have increased from achievement bonus)
      const { data: postProfile } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();
      const postXp = postProfile?.total_xp || 0;
      const newLevel = getLevelInfo(postXp);
      if (newLevel.level > oldLevel) {
        const delay = newAchievements.length > 0 ? 9000 : showCelebration ? 4500 : 500;
        setTimeout(() => setLevelUpInfo({ level: newLevel.level, title: newLevel.title }), delay);
      }

      // Show paywall after completing last free lesson (when next is pro)
      // Use lessonPath (from lesson ID) not userTemplate — ensures correct path lookup
      const next =
        lessonPath === "rpg" ? getNextRPGLesson(lesson.id) :
        lessonPath === "platformer" ? getNextPlatformerLesson(lesson.id) :
        lessonPath === "crawler" ? getNextCrawlerLesson(lesson.id) :
        lessonPath === "shooter" ? (getNextShooterLesson(lesson.id) ?? getNextSpaceShooterLesson(lesson.id)) :
        undefined;
      if (next && next.tier === "pro" && userTier === "free") {
        setShowPaywall(true);
      } else if (!next) {
        // Completed all lessons
        setShowPaywall(false);
      }
    }
  }, [activePart, activeCode, currentPart, lesson, isRunning, userTemplate, userTier, gameVariant, lessonPath, lessonNumber, setIsRunning, setOutput, setErrors, setTestResults, setWasmOutput, markPart1Complete, markPart2Complete, setCurrentPart]);

  const handleReset = useCallback(() => {
    if (!activePart) return;
    if (currentPart === 1) {
      setPart1Code(activePart.starterCode);
    } else {
      setPart2Code(activePart.starterCode);
    }
  }, [activePart, currentPart, setPart1Code, setPart2Code]);

  // Handle console output from WasmGameCanvas (Part 2)
  // This fires when the WASM game prints to cout — used for test validation
  const handleWasmConsoleOutput = useCallback((lines: string[]) => {
    if (!activePart) return;
    const consoleOutput = lines.join("\n");
    setOutput(consoleOutput);

    // Run tests against the console output
    const { testResults: results, allPassed } = runTests(consoleOutput, activePart.tests);
    setTestResults(results);

    // If this was a submit and all tests pass, trigger the completion flow
    if (pendingSubmitRef.current && allPassed) {
      pendingSubmitRef.current = false;
      // Re-trigger handleSubmit — it will see tests already pass and run the completion flow
      setTimeout(() => handleSubmit(), 0);
    }
  }, [activePart, setOutput, setTestResults, handleSubmit]);

  const handleWasmError = useCallback((error: string) => {
    setErrors([error]);
  }, [setErrors]);

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
  // Derive next lesson from the CURRENT lesson's path (parsed from ID), not userTemplate.
  // This ensures shooter-XX lessons find the next shooter lesson even if
  // the user's profile template is something else (e.g. "simple_rpg").
  const nextLesson =
    lessonPath === "rpg" ? getNextRPGLesson(lesson.id) :
    lessonPath === "platformer" ? getNextPlatformerLesson(lesson.id) :
    lessonPath === "crawler" ? getNextCrawlerLesson(lesson.id) :
    lessonPath === "shooter" ? (getNextShooterLesson(lesson.id) ?? getNextSpaceShooterLesson(lesson.id)) :
    undefined;
  const lessonFullyComplete = part1Completed && part2Completed;

  // Show crawler-specific title when on crawler path
  const crawlerTitle = isCrawlerTemplate ? CRAWLER_LESSON_TITLES[lesson.id] : null;
  const displayTitle = crawlerTitle?.title || lesson.title;

  // Block free users from pro lessons (full-page paywall)
  if (lesson.tier === "pro" && userTier === "free" && showPaywall) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-white/[0.05] px-4 py-2 flex items-center gap-3 shrink-0">
          <Link
            href="/learn"
            className="text-[#AFBCD5]/60 hover:text-white transition-colors text-sm"
          >
            &larr; Lessons
          </Link>
          <div className="w-px h-4 bg-white/[0.10]" />
          <h1 className="text-sm font-semibold text-white">
            {lesson.order}. {displayTitle}
          </h1>
        </header>
        <PaywallModal
          isOpen={true}
          onClose={() => {
            window.location.href = "/learn";
          }}
        />
      </main>
    );
  }

  return (
    <main className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.05] px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/learn"
            className="text-[#AFBCD5]/60 hover:text-white transition-colors text-sm shrink-0"
          >
            &larr;<span className="hidden sm:inline"> Lessons</span>
          </Link>
          <div className="w-px h-4 bg-white/[0.10] shrink-0" />
          <h1 className="text-sm font-semibold text-white truncate">
            {lesson.order}. {displayTitle}
          </h1>
          <span className="hidden sm:inline text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">
            +{lesson.xpReward} XP
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <PartProgressIndicator part1={lesson.part1} part2={lesson.part2} />
          {lessonFullyComplete && (
            <span className="hidden sm:inline text-xs font-mono text-primary">
              Completed {xpEarned > 0 ? `(+${xpEarned} XP!)` : ""}
            </span>
          )}
        </div>
      </header>

      {/* Content area — 2-panel split: left tabbed, right editor */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-2 p-2">

        {/* LEFT PANEL: Tabbed */}
        <div className="flex flex-col lg:w-1/2 min-h-0 h-[45vh] lg:h-auto">
          {/* Tab bar */}
          <div
            className="flex shrink-0 bg-[#040B10] border-b border-white/[0.05] px-2"
            role="tablist"
          >
            {(
              [
                { id: "lesson" as const, label: "Lesson", show: true },
                {
                  id: "game" as const,
                  label: isCrawlerTemplate ? "Crawler" : "Game",
                  show: currentPart === 2,
                },
                { id: "output" as const, label: "Output", show: true },
                { id: "memory" as const, label: "Memory", show: true },
              ] as const
            )
              .filter((t) => t.show)
              .map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id)}
                  className={`px-3 py-2.5 text-xs font-mono transition-colors border-b-2 -mb-px min-h-[44px] ${
                    leftTab === tab.id
                      ? "bg-[#ffffff08] text-white border-[#246BFD]"
                      : "text-[#AFBCD5]/60 hover:text-[#AFBCD5] border-transparent"
                  }`}
                  role="tab"
                  aria-selected={leftTab === tab.id}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {/* Lesson tab */}
            <div className={`h-full flex flex-col ${leftTab === "lesson" ? "" : "hidden"}`}>
              {activePart && (
                <>
                  <div className="flex-1 min-h-0">
                    <LessonInstructions part={activePart} concepts={lesson.concepts} />
                  </div>
                  {userId && lesson && (
                    <div className="shrink-0 p-2">
                      <HintSystem
                        lessonId={lesson.id}
                        userId={userId}
                        sessionStartTime={sessionStartTime}
                        onHintUsed={() => setHintsUsed((h) => h + 1)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Game tab — Part 2 only */}
            {leftTab === "game" && currentPart === 2 && (
              <div className="h-full">
                <GameCanvasWrapper
                  compiled={wasmJs && wasmWasm ? { js: wasmJs, wasm: wasmWasm } : null}
                  path={lessonPath as "rpg" | "platformer" | "shooter" | "crawler"}
                  onConsoleOutput={handleWasmConsoleOutput}
                  onError={handleWasmError}
                />
              </div>
            )}

            {/* Output tab */}
            {leftTab === "output" && (
              <div className="h-full">
                <LessonOutput
                  lessonId={lesson?.id}
                  userId={userId || undefined}
                  userTier={userTier}
                  userCode={activeCode}
                />
              </div>
            )}

            {/* Memory tab */}
            {leftTab === "memory" && (
              <div className="h-full">
                <LessonMemoryViz />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Code editor */}
        <div className="flex-1 lg:w-1/2 min-h-0 min-h-[250px] lg:min-h-0">
          <LessonEditor />
        </div>
      </div>

      {/* Action bar — safe-area-inset for notch phones */}
      <div
        className="border-t border-white/[0.05] px-3 sm:px-4 py-2 sm:py-2.5 shrink-0"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0.5rem))" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm font-mono rounded-lg transition-all disabled:opacity-50 border min-h-[44px] ${
                runSuccess
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-[#2e2e42] text-white border-white/[0.08] hover:bg-white/[0.10]"
              }`}
            >
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" /></svg>
                  <span className="hidden sm:inline">Compiling...</span>
                  <span className="sm:hidden">Run</span>
                </span>
              ) : runSuccess ? (
                "\u2713 OK!"
              ) : (
                <><span className="sm:hidden">{"\u25B6"} Run</span><span className="hidden sm:inline">{"\u25B6"} Run Code</span></>
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 min-h-[44px]"
            >
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" /></svg>
                  <span className="hidden sm:inline">Testing...</span>
                  <span className="sm:hidden">Test</span>
                </span>
              ) : currentPart === 1 && !part1Completed ? (
                <><span className="sm:hidden">Submit</span><span className="hidden sm:inline">Submit Part 1</span></>
              ) : currentPart === 2 && !part2Completed ? (
                <><span className="sm:hidden">Submit</span><span className="hidden sm:inline">Submit Part 2</span></>
              ) : (
                "Submit"
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-[#AFBCD5]/50 text-xs font-mono hover:text-[#888] transition-colors min-h-[44px]"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {allPassed && currentPart === 1 && !part1Completed && (
              <span className="text-xs font-mono text-primary animate-pulse">
                <span className="hidden sm:inline">All tests pass! Submit to continue to Part 2.</span>
                <span className="sm:hidden">Tests pass! Submit.</span>
              </span>
            )}
            {allPassed && currentPart === 2 && !part2Completed && (
              <span className="text-xs font-mono text-primary animate-pulse">
                <span className="hidden sm:inline">All tests pass! Submit to complete the lesson.</span>
                <span className="sm:hidden">Tests pass! Submit.</span>
              </span>
            )}
            {lessonFullyComplete && nextLesson && nextLesson.tier === "pro" && userTier === "free" && (
              <button
                onClick={() => setShowPaywall(true)}
                className="px-3 sm:px-4 py-2 bg-[#a855f7] text-white text-sm font-semibold rounded-lg hover:bg-[#a855f7]/90 transition-colors min-h-[44px]"
              >
                {"\uD83D\uDD12"} Unlock Next
              </button>
            )}
            {lessonFullyComplete && nextLesson && !(nextLesson.tier === "pro" && userTier === "free") && (
              <Link
                href={`/lesson/${nextLesson.id}`}
                className="px-3 sm:px-4 py-2 bg-primary/20 text-primary text-sm font-mono rounded-lg hover:bg-primary/30 transition-colors border border-primary/30 min-h-[44px] flex items-center"
              >
                <span className="hidden sm:inline">Next: {nextLesson.title} &rarr;</span>
                <span className="sm:hidden">Next &rarr;</span>
              </Link>
            )}
            {lessonFullyComplete && !nextLesson && (
              <Link
                href="/learn"
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-colors min-h-[44px] flex items-center"
              >
                Complete!
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Celebration overlay */}
      <ConfettiCelebration
        trigger={showCelebration}
        type={celebrationType}
        detail={celebrationDetail}
        onDone={() => setShowCelebration(false)}
      />

      {/* Achievement popup */}
      <AchievementUnlocked
        achievement={unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
      />

      {/* Level-up popup */}
      {levelUpInfo && (
        <LevelUpCelebration
          level={levelUpInfo.level}
          title={levelUpInfo.title}
          onClose={() => setLevelUpInfo(null)}
        />
      )}

      {/* Mystery Bonus XP Modal */}
      {showBonusXP && bonusXPAmount > 0 && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border-2 border-warning/50 rounded-xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="text-6xl">&#127873;</div>
            <h3 className="text-xl font-bold text-warning">Mystery Bonus!</h3>
            <div className="bg-warning/10 border border-warning/30 text-warning font-bold text-3xl py-4 rounded-lg">
              +{bonusXPAmount} XP
            </div>
            <p className="text-xs font-mono text-[#888]">
              Keep completing lessons to find more bonuses!
            </p>
            <button
              onClick={() => setShowBonusXP(false)}
              className="bg-warning/20 hover:bg-warning/30 text-warning font-mono text-sm px-6 py-2 rounded-lg transition-colors border border-warning/30"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </main>
  );
}
