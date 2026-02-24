import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://heapsight.com"),
  title: {
    default: "HeapSight — Learn C++ by Building Games",
    template: "%s | HeapSight",
  },
  description:
    "Master C++ by building real games in your browser. 4 learning paths, 400 lessons, zero setup. Build a Space Shooter, Platformer, RPG, or 3D Dungeon Crawler from lesson 1.",
  keywords: [
    "learn C++",
    "C++ course",
    "game development",
    "learn programming",
    "C++ for beginners",
    "game dev course",
    "build games",
    "C++ tutorial",
    "learn to code",
    "browser IDE",
    "WebAssembly",
    "raylib",
  ],
  authors: [{ name: "HeapSight" }],
  creator: "HeapSight",
  publisher: "HeapSight",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://heapsight.com",
    siteName: "HeapSight",
    title: "HeapSight — Learn C++ by Building Games",
    description:
      "Master C++ by building real games in your browser. 4 paths, 400 lessons, zero setup. Space Shooter, Platformer, RPG, or 3D Dungeon Crawler.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HeapSight — Learn C++ by Building Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HeapSight — Learn C++ by Building Games",
    description:
      "Master C++ by building real games in your browser. 4 paths, 400 lessons, zero setup.",
    images: ["/og-image.png"],
    creator: "@heapsight",
  },
  alternates: {
    canonical: "https://heapsight.com",
  },
};

const jsonLdWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HeapSight",
  url: "https://heapsight.com",
  description:
    "Learn C++ by building real games in your browser. 4 learning paths with 400 lessons.",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier — 5 lessons per path",
    },
    {
      "@type": "Offer",
      price: "29",
      priceCurrency: "USD",
      description: "Pro monthly — all 400 lessons",
    },
    {
      "@type": "Offer",
      price: "199",
      priceCurrency: "USD",
      description: "Pro yearly — all 400 lessons",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1",
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HeapSight",
  url: "https://heapsight.com",
  logo: "https://heapsight.com/logo.png",
  description: "C++ learning platform that teaches through building games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-[#e0e0e0]`}
      >
        <Suspense fallback={null}>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
