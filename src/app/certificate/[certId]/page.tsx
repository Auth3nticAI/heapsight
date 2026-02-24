import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const PATH_NAMES: Record<string, string> = {
  rpg: "RPG",
  platformer: "Platformer",
  crawler: "Dungeon Crawler",
  shooter: "Space Shooter",
};

const PATH_ICONS: Record<string, string> = {
  rpg: "\u2694\uFE0F",
  platformer: "\uD83C\uDFC3",
  crawler: "\uD83C\uDFF0",
  shooter: "\uD83D\uDE80",
};

interface CertData {
  displayName: string;
  path: string;
  completedAt: string;
}

async function getCertData(certId: string): Promise<CertData | null> {
  const supabase = getServiceClient();

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("user_id, path, completed_at")
    .eq("id", certId)
    .single();

  if (error || !cert) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", cert.user_id)
    .single();

  const displayName = (profile?.email || "").split("@")[0] || "User";

  return {
    displayName,
    path: cert.path,
    completedAt: cert.completed_at,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certId: string }>;
}): Promise<Metadata> {
  const { certId } = await params;
  const data = await getCertData(certId);

  if (!data) {
    return { title: "Certificate | HeapSight" };
  }

  const pathName = PATH_NAMES[data.path] || data.path;
  const title = `${data.displayName} completed the ${pathName} path on HeapSight`;

  return {
    title,
    description: `${data.displayName} has earned a verified C++ completion certificate for the ${pathName} path.`,
    openGraph: { title, siteName: "HeapSight" },
    twitter: { card: "summary", title },
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const data = await getCertData(certId);

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">\uD83D\uDD0D</div>
          <h1 className="text-xl font-bold text-white mb-2">
            Certificate Not Found
          </h1>
          <p className="text-sm font-mono text-[#AFBCD5]/50 mb-4">
            This certificate ID is invalid or has been revoked.
          </p>
          <Link href="/" className="text-primary text-sm hover:underline">
            Go to HeapSight
          </Link>
        </div>
      </main>
    );
  }

  const pathName = PATH_NAMES[data.path] || data.path;
  const pathIcon = PATH_ICONS[data.path] || "\uD83C\uDFAE";
  const completedDate = new Date(data.completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const verifyUrl = `https://heapsight.com/certificate/${certId}`;
  const twitterText = encodeURIComponent(
    `I just earned my C++ ${pathName} certificate on @HeapSight! \uD83C\uDFC6\n${verifyUrl}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Certificate card */}
        <div className="rounded-2xl border border-[#246BFD]/30 bg-gradient-to-b from-[#071528] to-[#040B10] p-10 text-center relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#246BFD]/5 to-transparent pointer-events-none" />

          {/* Valid badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9CD323]/10 border border-[#9CD323]/30 text-[#9CD323] text-xs font-mono font-bold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9CD323] animate-pulse inline-block" />
            Verified Certificate
          </div>

          <div className="text-5xl mb-4">{pathIcon}</div>

          <p className="text-xs font-mono text-[#AFBCD5]/50 uppercase tracking-widest mb-2">
            Certificate of Completion
          </p>

          <h1 className="text-2xl font-bold text-white mb-1">
            {data.displayName}
          </h1>

          <p className="text-sm text-[#AFBCD5]/70 mb-6">
            has successfully completed the{" "}
            <span className="text-primary font-semibold">{pathName}</span> C++
            curriculum on HeapSight
          </p>

          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#246BFD]/50 to-transparent mx-auto mb-6" />

          <div className="grid grid-cols-2 gap-4 mb-8 text-center">
            <div>
              <p className="text-[10px] font-mono text-[#AFBCD5]/50 uppercase mb-1">
                Completed
              </p>
              <p className="text-sm font-semibold text-white">{completedDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-[#AFBCD5]/50 uppercase mb-1">
                Certificate ID
              </p>
              <p className="text-xs font-mono text-[#AFBCD5]/70 truncate">
                {certId.slice(0, 8)}&hellip;
              </p>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 mb-4">
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-[#1d9bf0]/10 border border-[#1d9bf0]/30 text-[#1d9bf0] text-xs font-semibold rounded-lg hover:bg-[#1d9bf0]/20 transition-colors text-center"
            >
              Share on X
            </a>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 bg-[#0077b5]/10 border border-[#0077b5]/30 text-[#0077b5] text-xs font-semibold rounded-lg hover:bg-[#0077b5]/20 transition-colors text-center"
            >
              Share on LinkedIn
            </a>
          </div>

          <Link
            href="/signup"
            className="block w-full py-2.5 border border-white/[0.08] text-[#AFBCD5]/70 text-sm font-mono rounded-lg hover:border-white/[0.15] hover:text-white transition-colors"
          >
            Start Your C++ Journey &rarr;
          </Link>
        </div>

        <p className="text-center mt-4 text-[10px] font-mono text-[#AFBCD5]/40">
          Issued by{" "}
          <Link href="/" className="text-primary hover:underline">
            HeapSight
          </Link>{" "}
          &mdash; Certificate ID: {certId}
        </p>
      </div>
    </main>
  );
}
