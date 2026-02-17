"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { getLessonById, getNextLesson } from "@/data/lessons";
import { getGameVariant } from "@/data/game-templates";
import { useLessonStore } from "@/store/lesson-store";
import { runCppCode } from "@/lib/cpp-runner";
import { parseGameOutput } from "@/lib/game-protocol";
import { parseRobotFrames } from "@/lib/robot-protocol";
import { createClient } from "@/lib/supabase-browser";
import { getTemplateInfo } from "@/data/templates-info";
import { ROBOT_LESSON_TITLES } from "@/data/game-templates/differential-drive-robot/lesson-titles";
import type { GameTemplate } from "@/types/game";
import type { LessonPart } from "@/types/lesson";
import dynamic from "next/dynamic";
import LessonEditor from "@/components/lesson/LessonEditor";
import LessonInstructions from "@/components/lesson/LessonInstructions";
import LessonOutput from "@/components/lesson/LessonOutput";
import LessonMemoryViz from "@/components/lesson/LessonMemoryViz";
import GamePreviewCanvas from "@/components/lesson/GamePreviewCanvas";
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

const RobotPreviewCanvas = dynamic(
  () => import("@/components/lesson/RobotPreviewCanvas"),
  { ssr: false }
);

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const lesson = getLessonById(lessonId);

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
  const setGameFrame = useLessonStore((s) => s.setGameFrame);
  const setRobotFrames = useLessonStore((s) => s.setRobotFrames);

  const [xpEarned, setXpEarned] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userTier, setUserTier] = useState<"free" | "pro">("free");
  const [userTemplate, setUserTemplate] = useState<GameTemplate | null>(null);
  const [runSuccess, setRunSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<"instructions" | "code" | "preview" | "output">("instructions");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"streak" | "level" | "daily_goal">("streak");
  const [celebrationDetail, setCelebrationDetail] = useState("");
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: string } | null>(null);

  const templateInfo = userTemplate ? getTemplateInfo(userTemplate) : null;
  const isRobotTemplate = templateInfo?.category === "robot";

  // Get active part data — may use game/robot variant for Part 2
  const gameVariant =
    lesson && userTemplate ? getGameVariant(lesson.id, userTemplate) : null;

  const getActivePart = (): LessonPart | null => {
    if (!lesson) return null;
    if (currentPart === 1) return lesson.part1;
    // For Part 2, override with variant data if available
    if (gameVariant) {
      return {
        ...lesson.part2,
        ...(isRobotTemplate ? { type: "robot_builder" as const } : {}),
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

        // Look up variant starter code (robot or game) for Part 2 fallback
        const variant = template ? getGameVariant(lesson.id, template) : null;
        const part2Starter = variant?.starterCode || lesson.part2.starterCode;

        // Load saved progress (path-isolated)
        const { data } = await supabase
          .from("lesson_progress")
          .select("part1_user_code, part2_user_code, part1_status, part2_status, status")
          .eq("user_id", user.id)
          .eq("lesson_id", lesson.id)
          .eq("path", template || "")
          .single();

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

  const handleRun = useCallback(async () => {
    if (!activePart || isRunning) return;
    setIsRunning(true);
    setErrors([]);
    setTestResults([]);

    const result = await runCppCode(activeCode, activePart.tests);

    setOutput(result.output);
    setErrors(result.errors);
    setTestResults(result.testResults);
    setIsRunning(false);

    // Auto-switch to output tab on mobile
    setMobileTab("output");

    // Success flash
    if (result.errors.length === 0 && result.output) {
      setRunSuccess(true);
      setTimeout(() => setRunSuccess(false), 800);
    }

    // Parse output for Part 2 visualization
    if (currentPart === 2 && result.output) {
      if (isRobotTemplate) {
        setRobotFrames(parseRobotFrames(result.output));
      } else {
        setGameFrame(parseGameOutput(result.output));
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
        path: userTemplate || "",
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
  }, [activePart, activeCode, currentPart, isRunning, lesson, isRobotTemplate, setIsRunning, setOutput, setErrors, setTestResults, setGameFrame, setRobotFrames]);

  const handleSubmit = useCallback(async () => {
    if (!activePart || !lesson || isRunning) return;

    setIsRunning(true);
    setErrors([]);
    setTestResults([]);

    const result = await runCppCode(activeCode, activePart.tests);

    setOutput(result.output);
    setErrors(result.errors);
    setTestResults(result.testResults);
    setIsRunning(false);

    // Parse output for Part 2 visualization
    if (currentPart === 2 && result.output) {
      if (isRobotTemplate) {
        setRobotFrames(parseRobotFrames(result.output));
      } else {
        setGameFrame(parseGameOutput(result.output));
      }
    }

    if (!result.allPassed) return;

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

    if (currentPart === 1) {
      // Complete Part 1, transition to Part 2
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          path: userTemplate || "",
          status: "in_progress",
          part1_status: "completed",
          part1_user_code: activeCode,
        },
        { onConflict: "user_id,lesson_id,path" }
      );

      markPart1Complete();
      setCurrentPart(2);
      setMobileTab("instructions"); // Show Part 2 instructions on mobile
    } else {
      // Complete Part 2 — lesson fully done
      await supabase.from("lesson_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lesson.id,
          path: userTemplate || "",
          status: "completed",
          part2_status: "completed",
          part2_user_code: activeCode,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id,path" }
      );

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
        p_path: userTemplate || "",
      });

      if (xpError) {
        // Fallback to original increment_xp if new RPC doesn't exist yet
        await supabase.rpc("increment_xp", { xp_amount: lesson.xpReward });
      }

      const isFirstCompletion = xpResult?.[0]?.is_first_completion ?? true;

      markPart2Complete();
      setXpEarned(isFirstCompletion ? lesson.xpReward : 0);
      setMobileTab("output"); // Show completion on mobile

      // Celebration confetti (only on first completion)
      if (isFirstCompletion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b"],
        });
      }

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
      const next = getNextLesson(lesson.id);
      if (next && next.tier === "pro" && userTier === "free") {
        setShowPaywall(true);
      } else if (!next) {
        // Completed all lessons
        setShowPaywall(false);
      }
    }
  }, [activePart, activeCode, currentPart, lesson, isRunning, userTemplate, userTier, gameVariant, isRobotTemplate, setIsRunning, setOutput, setErrors, setTestResults, setGameFrame, setRobotFrames, markPart1Complete, markPart2Complete, setCurrentPart]);

  const handleReset = useCallback(() => {
    if (!activePart) return;
    if (currentPart === 1) {
      setPart1Code(activePart.starterCode);
    } else {
      setPart2Code(activePart.starterCode);
    }
  }, [activePart, currentPart, setPart1Code, setPart2Code]);

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
  const lessonFullyComplete = part1Completed && part2Completed;

  // Show robot-specific title when on robot path
  const robotTitle = isRobotTemplate ? ROBOT_LESSON_TITLES[lesson.id] : null;
  const displayTitle = robotTitle?.title || lesson.title;

  // Block free users from pro lessons (full-page paywall)
  if (lesson.tier === "pro" && userTier === "free" && showPaywall) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b border-[#1a1a2e] px-4 py-2 flex items-center gap-3 shrink-0">
          <Link
            href="/learn"
            className="text-[#555] hover:text-white transition-colors text-sm"
          >
            &larr; Lessons
          </Link>
          <div className="w-px h-4 bg-[#2a2a3e]" />
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
      <header className="border-b border-[#1a1a2e] px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/learn"
            className="text-[#555] hover:text-white transition-colors text-sm shrink-0"
          >
            &larr;<span className="hidden sm:inline"> Lessons</span>
          </Link>
          <div className="w-px h-4 bg-[#2a2a3e] shrink-0" />
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

      {/* Content area with mobile tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile tab bar */}
        <div className="flex lg:hidden border-b border-[#1a1a2e] bg-[#0d0d1a] shrink-0" role="tablist">
          {([
            { id: "instructions" as const, label: "Lesson" },
            { id: "code" as const, label: "Code" },
            { id: "preview" as const, label: currentPart === 1 ? "Memory" : isRobotTemplate ? "Robot" : "Game" },
            { id: "output" as const, label: "Output" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 py-2.5 text-xs font-mono transition-colors min-h-[44px] ${
                mobileTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/[0.05]"
                  : "text-[#555] hover:text-[#888]"
              }`}
              role="tab"
              aria-selected={mobileTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panels: mobile = single active panel | desktop = 2x2 grid */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-2 p-2">
          {/* Instructions */}
          <div className={`min-h-0 overflow-hidden ${mobileTab === "instructions" ? "flex-1" : "hidden"} lg:block`}>
            {activePart && (
              <LessonInstructions part={activePart} concepts={lesson.concepts} />
            )}
          </div>

          {/* Code Editor */}
          <div className={`min-h-0 overflow-hidden ${mobileTab === "code" ? "flex-1" : "hidden"} lg:block`}>
            <LessonEditor />
          </div>

          {/* Memory Viz (Part 1) or Game/Robot Preview (Part 2) */}
          <div className={`min-h-0 overflow-hidden ${mobileTab === "preview" ? "flex-1" : "hidden"} lg:block`}>
            {currentPart === 1 ? (
              <LessonMemoryViz />
            ) : isRobotTemplate ? (
              <RobotPreviewCanvas />
            ) : (
              <GamePreviewCanvas />
            )}
          </div>

          {/* Output */}
          <div className={`min-h-0 overflow-hidden ${mobileTab === "output" ? "flex-1" : "hidden"} lg:block`}>
            <LessonOutput />
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-[#1a1a2e] px-3 sm:px-4 py-2 sm:py-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm font-mono rounded-lg transition-all disabled:opacity-50 border min-h-[44px] ${
                runSuccess
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-[#1a1a2e] text-white border-[#2a2a3e] hover:bg-[#2a2a3e]"
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
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-[44px]"
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
              className="px-3 py-2 text-[#555] text-xs font-mono hover:text-[#888] transition-colors min-h-[44px]"
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
                className="px-3 sm:px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors min-h-[44px] flex items-center"
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

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </main>
  );
}
