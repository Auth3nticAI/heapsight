import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address." },
        { status: 400 }
      );
    }

    // If Supabase is configured, insert
    if (supabase) {
      const { error } = await supabase
        .from("waitlist")
        .upsert({ email }, { onConflict: "email" });

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { success: false, message: "Failed to save. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // Stub mode: just log
      console.log("[Waitlist stub] Email submitted:", email);
    }

    return NextResponse.json({
      success: true,
      message: "You're on the list!",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
