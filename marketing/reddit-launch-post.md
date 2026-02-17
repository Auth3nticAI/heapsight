# I built a C++ learning app that feels like Duolingo (with streaks, achievements & leaderboards)

## The Problem

Learning C++ sucks. Most courses are either:
- Dry textbooks (LearnCpp) with zero motivation
- Shallow mobile apps (SoloLearn) that stop at pointers
- Expensive subscriptions (Codecademy $240/year) with generic content

I wanted something that combined the fun of Duolingo with the depth of real systems programming.

## What I Built: HeapSight

**Core Concept:** Learn C++ by building real games and robots, with full Duolingo-style gamification.

**Key Features:**
- **Daily Streaks** - Don't break the chain (users with 7+ day streaks are 5x more likely to finish)
- **15 Achievements** - Unlock badges from Common to Legendary (+ bonus XP)
- **Leaderboards** - Compete globally on weekly XP, all-time XP, and streaks
- **4 Learning Paths:**
  - Space Shooter - Learn ECS (Unity DOTS, Unreal Mass Entity)
  - Platformer - Master FSM (character controllers, game feel)
  - Simple RPG - Build data-driven systems (Diablo architecture)
  - Robotics - Program ROS2 robots (real-time embedded)

**Visual Output:**
- Your code generates actual 3D robot simulations (Three.js)
- Your code renders 2D games on HTML5 canvas
- Memory visualizations show heap/stack in real-time

**Pricing:** $67 one-time for 100+ lessons (vs Codecademy $240/year)

## Tech Stack
- Frontend: Next.js 14 (React), Tailwind, Monaco Editor
- Backend: Supabase (PostgreSQL, Auth, RLS)
- Compilation: Judge0 (real GCC, not interpreter)
- Rendering: Three.js (3D robots), Canvas API (2D games)
- Deployment: Vercel

## What I Learned
1. **Gamification psychology** - Streaks drive 40-60% higher retention than XP alone
2. **Browser-based C++** - Judge0 API can compile real C++ in <2s
3. **Multi-paradigm teaching** - Each path needs genuinely unique lessons (not reskins)
4. **Mobile-first matters** - 60%+ of learners browse on mobile

## Ask Me Anything
Happy to answer questions about:
- How I implemented the achievement system
- Browser-based C++ compilation (Judge0 setup)
- Teaching ECS/FSM/OOP through projects
- Gamification that actually works for technical content

Would love feedback from this community! What features would make you actually use a C++ learning app?

---
*Built in 6 weeks with Next.js + Supabase. Solo founder.*

### Suggested Subreddits
- r/learnprogramming
- r/cpp
- r/gamedev
- r/IndieGaming
- r/SideProject
- r/webdev
