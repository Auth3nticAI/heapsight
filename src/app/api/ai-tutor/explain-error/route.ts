import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase-server";
import { checkRateLimit, getRemainingRequests } from "@/lib/rate-limit";

const USE_OLLAMA = process.env.USE_OLLAMA === "true";
const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || "http://localhost:11434";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const SYSTEM_PROMPT = `You are a patient C++ tutor helping beginners learn systems programming.

Your teaching style:
- Explain errors in simple terms without jargon
- Be encouraging and supportive
- Give ONE specific fix they should make
- Keep explanations under 100 words
- Use analogies when helpful

Remember: These are beginners building their first games and robots. Make them feel capable.`;

function buildUserPrompt(errorMessage: string, userCode: string): string {
  return `A C++ beginner got this compilation error:

**ERROR:**
${errorMessage}

**THEIR CODE:**
\`\`\`cpp
${userCode}
\`\`\`

Explain what went wrong and how to fix it. Use this format:

**What went wrong:** [2-3 sentence explanation in simple terms]

**How to fix it:** [ONE specific change to make]

**Quick tip:** [Encouraging note or common mistake to avoid]`;
}

const FALLBACK_EXPLANATION = `I'm having trouble analyzing this error right now. Here's what usually helps:

**What to check:**
- Look for missing semicolons (;) at the end of statements
- Check for mismatched brackets: { } ( ) [ ]
- Verify variable names are spelled correctly
- Make sure you declared variables before using them

**How to fix it:**
Read the error message carefully - it usually tells you which line has the problem. The hint system can also guide you step-by-step!

**Quick tip:** Most C++ errors are simple typos. You've got this!`;

export async function POST(request: Request) {
  try {
    const { error_message, user_code, lesson_id } = await request.json();

    // Auth
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pro tier check
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single();

    if ((profile?.tier || "free") !== "pro") {
      return NextResponse.json(
        {
          error: "Pro subscription required",
          upgrade_url: "/upgrade",
          message:
            "Upgrade to Pro for unlimited AI-powered error explanations",
        },
        { status: 403 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id, 50)) {
      return NextResponse.json(
        {
          error: "Daily AI tutor limit reached",
          message:
            "You've used all 50 AI explanations for today. The hint system can still help! Your limit resets at midnight UTC.",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    let explanation = "";
    let tokensUsed = 0;
    let responseTime = 0;
    let modelUsed = "";

    const startTime = Date.now();
    const userPrompt = buildUserPrompt(error_message, user_code);

    if (USE_OLLAMA) {
      try {
        const ollamaResponse = await fetch(`${OLLAMA_ENDPOINT}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.1:70b",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            stream: false,
            options: { temperature: 0.7, num_predict: 500 },
          }),
        });

        if (!ollamaResponse.ok) throw new Error("Ollama request failed");

        const ollamaData = await ollamaResponse.json();
        explanation = ollamaData.message?.content || "";
        tokensUsed = ollamaData.eval_count || 0;
        responseTime = Date.now() - startTime;
        modelUsed = "llama3.1:70b-ollama";
      } catch (error) {
        console.error("[AI Tutor] Ollama error:", error);
      }
    }

    if (!explanation && !USE_OLLAMA) {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.95,
          stream: false,
        });

        explanation =
          completion.choices[0]?.message?.content || "";
        tokensUsed = completion.usage?.total_tokens || 0;
        responseTime = Date.now() - startTime;
        modelUsed = "llama-3.3-70b-groq";
      } catch (error) {
        console.error("[AI Tutor] Groq error:", error);
      }
    }

    if (!explanation) {
      explanation = FALLBACK_EXPLANATION;
      modelUsed = "fallback";
    }

    // Log to database (fire-and-forget)
    supabase
      .from("ai_tutor_sessions")
      .insert({
        user_id: user.id,
        lesson_id: lesson_id || "unknown",
        session_type: "error_explanation",
        user_code: (user_code || "").slice(0, 5000),
        error_message: (error_message || "").slice(0, 2000),
        ai_response: explanation,
        tokens_used: tokensUsed,
        response_time_ms: responseTime,
        model_used: modelUsed,
      })
      .then(() => {});

    const remaining = getRemainingRequests(user.id, 50);

    return NextResponse.json({
      explanation,
      tokens_used: tokensUsed,
      response_time_ms: responseTime,
      model: modelUsed,
      remaining,
    });
  } catch (error) {
    console.error("[AI Tutor] Unexpected error:", error);

    return NextResponse.json({
      explanation: FALLBACK_EXPLANATION,
      tokens_used: 0,
      response_time_ms: 0,
      model: "fallback",
      remaining: 0,
    });
  }
}
