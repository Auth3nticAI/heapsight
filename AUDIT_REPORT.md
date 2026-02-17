# HeapSight Production Readiness Audit Report

**Date:** 2026-02-17
**Auditor:** Senior Staff Engineer Review
**Codebase:** 201 TypeScript/TSX files, ~32,155 LOC
**Framework:** Next.js 14.2.35 + Supabase + Tailwind CSS

---

## EXECUTIVE SUMMARY

| Metric | Count |
|--------|-------|
| Total files reviewed | 201 |
| Critical issues (must fix before launch) | 8 |
| High priority issues (fix week 1) | 12 |
| Medium priority issues (fix month 1) | 15 |
| Low priority issues (tech debt) | 10 |
| **Overall production readiness** | **Needs Work** |

The application has a solid foundation with good architectural patterns (route groups, RLS policies, rate limiting). However, there are several **critical security and data integrity issues** that must be addressed before launch. The most serious involve client-side XP manipulation, missing middleware coverage for new dashboard routes, missing `increment_xp` RPC function definition, and a checkout API route that doesn't exist.

---

## LAUNCH BLOCKERS (CRITICAL - Must Fix Before Launch)

### C1. Missing Middleware Coverage for Dashboard Routes
**File:** `src/middleware.ts:35-36`
**Impact:** Users can access `/settings`, `/account`, `/paths`, `/progress`, `/leaderboard`, `/practice` without authentication.

```typescript
// CURRENT — only protects /learn, /lesson, /onboarding
const protectedPaths = ["/learn", "/lesson", "/onboarding"];
```

**Fix:** Add all dashboard routes to the protected paths list:
```typescript
const protectedPaths = ["/learn", "/lesson", "/onboarding", "/settings",
  "/account", "/paths", "/progress", "/leaderboard", "/practice"];
```

### C2. Checkout API Route Does Not Exist
**File:** `src/app/upgrade/page.tsx:28`
**Impact:** Clicking "Upgrade Now" calls `/api/checkout/onetime` which returns 404. Payment flow is completely broken.

```typescript
const res = await fetch("/api/checkout/onetime", { ... });
```

**Fix:** Create `src/app/api/checkout/onetime/route.ts` with Stripe Checkout session creation, or update the path to match an existing route.

### C3. Client-Side XP Award — Easily Manipulated
**File:** `src/app/lesson/[id]/page.tsx:314`
**Impact:** XP is awarded client-side via `supabase.rpc("increment_xp")`. A user can call this RPC function directly from the browser console to give themselves unlimited XP, manipulating leaderboards and unlocking achievements.

```typescript
const { error: rpcError } = await supabase.rpc("increment_xp", {
  xp_amount: lesson.xpReward,
});
```

**Fix:** XP should be awarded server-side only, validated against actual lesson completion. Create an API route `/api/lesson/complete` that verifies test results server-side before awarding XP.

### C4. `increment_xp` RPC Function Not Defined in Any Migration
**File:** Referenced in `src/app/lesson/[id]/page.tsx:314` and `src/lib/achievement-manager.ts:99`
**Impact:** If this function doesn't exist in the database, XP awarding silently fails. The fallback (line 318-328) does a raw `UPDATE` but is still client-side.

**Fix:** Add to SQL migrations:
```sql
CREATE OR REPLACE FUNCTION increment_xp(xp_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET total_xp = total_xp + xp_amount
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### C5. Achievement XP Bonus Calls `increment_xp` Without User ID
**File:** `src/lib/achievement-manager.ts:99`
**Impact:** The RPC call doesn't pass `userId` — it relies on `auth.uid()` inside the function. But since this is called client-side, the Supabase client's auth context might not match if the function is `SECURITY DEFINER`.

```typescript
await supabase.rpc("increment_xp", { xp_amount: achievement.xp_reward });
```

**Fix:** Pass user ID explicitly or ensure the RPC function uses `auth.uid()` with `SECURITY INVOKER` instead.

### C6. Open Redirect in Login Page
**File:** `src/app/login/page.tsx:45-46`
**Impact:** The `redirect` search parameter is used directly without validation. An attacker can craft a URL like `/login?redirect=https://evil.com` that redirects users after login.

```typescript
if (redirect) {
  router.push(redirect);
}
```

**Fix:** Validate that `redirect` starts with `/` and doesn't contain `://`:
```typescript
if (redirect && redirect.startsWith("/") && !redirect.includes("://")) {
  router.push(redirect);
}
```

### C7. Race Condition in Daily Activity Counter
**File:** `src/lib/daily-goal.ts:21-41`
**Impact:** Read-then-write pattern without transactions. Two concurrent lesson completions can read the same `lessons_completed` value and overwrite each other, losing a count.

```typescript
const { data: existing } = await supabase.from("daily_activity").select(...)
// ... time gap where another request can read same value ...
await supabase.from("daily_activity").upsert({ lessons_completed: newLessons });
```

**Fix:** Use a server-side atomic increment (RPC function) instead of read-modify-write:
```sql
CREATE OR REPLACE FUNCTION record_lesson_completion(p_user_id UUID, p_xp INT)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_activity (user_id, activity_date, lessons_completed, xp_earned)
  VALUES (p_user_id, CURRENT_DATE, 1, p_xp)
  ON CONFLICT (user_id, activity_date) DO UPDATE
  SET lessons_completed = daily_activity.lessons_completed + 1,
      xp_earned = daily_activity.xp_earned + p_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### C8. Weekly Leaderboard View Exposes All User Emails
**File:** `sql/001-retention-features.sql:117-130`
**Impact:** The `weekly_leaderboard` view selects `p.email` from all users. Any authenticated user can query this view and see every user's email address — a serious privacy/GDPR violation.

```sql
CREATE OR REPLACE VIEW weekly_leaderboard AS
SELECT p.id, p.email, p.total_xp, ...
```

**Fix:** Remove email from the view or replace with a display name/hash:
```sql
SELECT p.id, SPLIT_PART(p.email, '@', 1) AS display_name, ...
```

---

## WEEK 1 FIXES (HIGH PRIORITY)

### H1. No Error Boundaries in React Tree
**Impact:** An uncaught error in any dashboard component crashes the entire app with a white screen.
**Fix:** Add React Error Boundary components at the layout level.

### H2. Duplicate Achievement Seed Data
**Files:** `sql/001-retention-features.sql:254-265` and `src/migrations/seed-achievements.sql:4-23`
**Impact:** Two different seed files with different achievement IDs. The main migration seeds 10 achievements (first_steps, cpp_novice, etc.) while the seed migration seeds 15 different ones (first_lesson, five_lessons, etc.). The app code (`achievements.ts`) uses the 15-achievement set.
**Fix:** Remove the 10-achievement seed from `001-retention-features.sql` (lines 254-265) and only use `seed-achievements.sql`.

### H3. `check_achievements` SQL Function Is Out of Sync
**File:** `sql/001-retention-features.sql:205-249`
**Impact:** The SQL function only checks 4 achievements (first_steps, cpp_novice, consistent_coder, unstoppable) which use the OLD achievement IDs. The client-side `achievement-manager.ts` checks all 15 with the correct IDs. The SQL function is dead code.
**Fix:** Remove the SQL function or update it to match the client-side logic.

### H4. Settings Page Has No `alert()` Replacement
**File:** `src/app/(dashboard)/settings/page.tsx`
**Impact:** Uses `alert()` for error messages and `confirm()` for delete confirmation — poor UX and blocked by some browsers.
**Fix:** Replace with inline toast notifications or modal dialogs.

### H5. Upgrade Page Sends `userId` in POST Body — Insecure
**File:** `src/app/upgrade/page.tsx:31`
**Impact:** The checkout request sends `userId` from the client. A user could modify this to create checkout sessions for other users.
**Fix:** Extract `userId` from the server-side auth session in the API route, not from the request body.

### H6. Missing `onConflict` Handling in `user_achievements` Insert
**File:** `src/lib/achievement-manager.ts:93-96`
**Impact:** If the client-side achievement check runs twice concurrently (e.g., fast double-click), it can attempt duplicate inserts. While the DB has a UNIQUE constraint, the error isn't caught.
**Fix:** Add `.select()` or handle conflict: `upsert({...}, { onConflict: "user_id,achievement_id" })`.

### H7. `showCelebration` Stale Closure in handleSubmit
**File:** `src/app/lesson/[id]/page.tsx:372-386`
**Impact:** `showCelebration` is read inside `handleSubmit` but not in its dependency array. This means the timing delays for achievement/level-up popups may use stale values.
**Fix:** Add `showCelebration` to the dependency array or use a ref.

### H8. Lesson Progress Upsert Missing Error Handling
**File:** `src/app/lesson/[id]/page.tsx:229-232, 269-279, 286-297`
**Impact:** Multiple `supabase.upsert()` calls with no error checking. If any fail, the user's progress is silently lost.
**Fix:** Check for errors and show a retry notification.

### H9. Stripe Webhook Handler Missing
**Impact:** The upgrade page redirects to Stripe checkout, but there's no webhook handler to update the user's tier to "pro" after payment. Payment may succeed but user stays on free tier.
**Fix:** Create `src/app/api/stripe/webhook/route.ts` to handle `checkout.session.completed` events.

### H10. In-Memory Rate Limiter Resets on Serverless Cold Start
**File:** `src/app/api/compile/route.ts:5`
**Impact:** `rateLimits` Map is per-instance. On Vercel serverless, each cold start gets a fresh Map, making the rate limiter ineffective.
**Fix:** Use Vercel KV, Upstash Redis, or similar persistent store for rate limiting.

### H11. No CSRF Protection on Checkout
**File:** `src/app/upgrade/page.tsx:28`
**Impact:** The `/api/checkout/onetime` endpoint accepts POST without CSRF tokens. An attacker could create a checkout session via cross-site request.
**Fix:** Verify the request origin or use a CSRF token.

### H12. `profiles` Table RLS Policies Not Visible in Migrations
**Impact:** The `profiles` table is referenced throughout but its CREATE TABLE and RLS policies aren't in any migration file. If RLS is not enabled, any user can read/write any profile.
**Fix:** Add explicit RLS policies for `profiles` table to migrations.

---

## MEDIUM PRIORITY (Fix Month 1)

| # | Issue | File | Impact |
|---|-------|------|--------|
| M1 | `useEffect` missing cleanup in dashboard layout | `(dashboard)/layout.tsx` | Memory leak on fast navigation |
| M2 | `any` type for `profile` state in settings page | `settings/page.tsx` (spec) | Type safety gap |
| M3 | No input validation on password length in settings | `settings/page.tsx` | Weak passwords allowed |
| M4 | Leaderboard does unbounded query on `profiles` | `LeaderboardPreview.tsx:69-72` | Performance at scale |
| M5 | `CURRENT_DATE` in streak function is server timezone | `001-retention-features.sql:172` | User's midnight != server midnight |
| M6 | No loading skeleton for lesson cards | `learn/page.tsx` | Layout shift on load |
| M7 | `dynamic()` import for RobotPreviewCanvas but not Three.js | `lesson/[id]/page.tsx:35` | Large bundle if Three.js not tree-shaken |
| M8 | Missing ARIA labels on all SVG icon buttons | Multiple files | Accessibility failure |
| M9 | `console.error` left in production code | `compile/route.ts:110,118` | Log noise |
| M10 | No pagination on achievements/leaderboard queries | Multiple | Won't scale past 100+ entries |
| M11 | Lesson page is 668 lines — should be decomposed | `lesson/[id]/page.tsx` | Hard to maintain |
| M12 | `lessons` table `path` values don't match template IDs | `add-dynamic-lessons-schema.sql:4` | Uses 'robotics' not 'differential_drive_robot' |
| M13 | Missing `updated_at` trigger on all tables | Multiple SQL files | Stale timestamps |
| M14 | Path switching overwrites progress without warning | `paths/page.tsx` | Confusing UX |
| M15 | No 404 page for invalid lesson IDs | `lesson/[id]/page.tsx` | Returns generic "not found" |

---

## LOW PRIORITY (Technical Debt)

| # | Issue | File |
|---|-------|------|
| L1 | Duplicate SVG icon components across 10+ files | Multiple |
| L2 | Hardcoded `$67` price in 3 files | ProTeaser, upgrade, sidebar |
| L3 | `"weekly_leaderboard" as string` type cast | `LeaderboardPreview.tsx:44` |
| L4 | ESLint warnings in lesson page (missing deps) | `lesson/[id]/page.tsx` |
| L5 | `isRobotPath` computed but unused in some files | Multiple |
| L6 | Missing `key` prop warning potential on dynamic lists | Multiple |
| L7 | No TypeScript strict mode in tsconfig | `tsconfig.json` |
| L8 | 4 files exceed 500 lines | See metrics above |
| L9 | No test files exist in the project | Entire codebase |
| L10 | Landing page metadata says "memory debugger demo" | `layout.tsx:17` |

---

## SECURITY POSTURE

| Category | Grade | Notes |
|----------|-------|-------|
| **Authentication** | B | Supabase Auth is solid; login/signup/reset work correctly |
| **Authorization** | D | Missing middleware coverage for 6 routes; client-side XP manipulation; email exposure |
| **Data Privacy** | D | Leaderboard exposes emails; no data anonymization |
| **Input Validation** | B | Good validation on compile API; weak on settings forms |
| **API Security** | D | Missing checkout route; no webhook handler; in-memory rate limiter |
| **Overall** | **D+** | Critical issues in auth coverage, XP integrity, and payment flow |

---

## PERFORMANCE ANALYSIS

| Category | Grade | Notes |
|----------|-------|-------|
| **Bundle Size** | A | Average page 4-8 KB; Three.js lazy-loaded; good code splitting |
| **Database Queries** | B | Good use of parallel queries; race condition in daily activity; missing some indexes |
| **Rendering** | B+ | Zustand prevents prop drilling; some unnecessary re-renders in lesson page |
| **Overall** | **B** | |

---

## CODE QUALITY METRICS

| Metric | Value |
|--------|-------|
| TypeScript files | 201 |
| Total LOC | ~32,155 |
| Files >500 lines | 4 |
| Functions >50 lines | ~8 (handleSubmit, loadProfile, etc.) |
| Duplicate SVG icons | ~15 (same icons in 10+ files) |
| Test files | 0 |
| Console.log/error in prod | 3 |
| `any` types | ~5 |
| **Overall Grade** | **C+** |

---

## TEST RECOMMENDATIONS

### Unit Tests Needed (Priority Order)
1. `getLevelInfo(xp)` — verify level calculation at boundaries (0, 100, 1000, 50000)
2. `checkAndUnlockAchievements()` — mock Supabase, verify each achievement type unlocks correctly
3. `parseGameOutput()` / `parseRobotFrames()` — verify protocol parsing with edge cases
4. `updateStreakOnCompletion()` — verify consecutive days, broken streaks, milestones
5. `recordLessonCompletion()` — verify first-of-day vs subsequent completions

### Integration Tests Needed
1. Login → Onboarding → Learn flow (happy path)
2. Lesson completion → XP award → Achievement check → Level up (full chain)
3. Free user attempts pro lesson → paywall shown
4. Stripe checkout → webhook → tier upgrade (when implemented)

### Edge Cases to Test
- User completes same lesson twice (should not double-award XP)
- User with 0 XP views progress page (division by zero in percentage)
- Concurrent lesson submissions (race condition)
- User with no streak data (null handling)
- 50+ level user (overflow in XP calculation)

---

## PRIORITIZED FIX ROADMAP

### Before Launch (This Week)
1. Fix middleware to protect all dashboard routes (C1) — 5 min
2. Create `/api/checkout/onetime` route with Stripe (C2) — 2 hours
3. Create Stripe webhook handler (H9) — 2 hours
4. Add `increment_xp` RPC function to migrations (C4) — 10 min
5. Fix open redirect in login (C6) — 5 min
6. Remove email from leaderboard view (C8) — 5 min
7. Add `profiles` table RLS to migrations (H12) — 15 min

### Week 1
8. Move XP awarding to server-side API route (C3, C5) — 4 hours
9. Fix daily activity race condition with RPC (C7) — 1 hour
10. Add React Error Boundaries (H1) — 1 hour
11. Clean up duplicate achievement seeds (H2, H3) — 30 min
12. Fix stale closure in handleSubmit (H7) — 15 min

### Month 1
13. Extract shared SVG icon library (L1) — 2 hours
14. Add timezone-aware streak calculation (M5) — 3 hours
15. Decompose lesson page into smaller components (M11) — 4 hours
16. Add ARIA labels to all interactive elements (M8) — 2 hours
17. Set up Vitest + first 10 unit tests (L9) — 4 hours
