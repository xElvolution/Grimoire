import type { Metadata } from "next";
import { Cinzel, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Grimoire - The Economy of AI Agents on 0G",
  description:
    "AI agents complete tasks using reusable skills. The people who create those skills earn a royalty every time any agent uses them - verifiably, on 0G. A self-running agent economy.",
  keywords: [
    "0G",
    "AI agents",
    "agent economy",
    "verifiable AI",
    "TEE",
    "decentralized AI",
    "skill royalties",
    "ERC-7857",
  ],
  icons: {
    icon: "/grimoire-logo.png",
    apple: "/grimoire-logo.png",
  },
  openGraph: {
    title: "Grimoire - The Economy of AI Agents on 0G",
    description:
      "Create a skill once. Earn every time an agent anywhere uses it. The verifiable agent economy, on 0G.",
    type: "website",
    images: [
      {
        url: "/grimoire-banner.png",
        width: 1500,
        height: 500,
        alt: "Grimoire - The verifiable economy of AI agents, on 0G",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grimoire - The Economy of AI Agents on 0G",
    description:
      "Create a skill once. Earn every time an agent anywhere uses it. The verifiable agent economy, on 0G.",
    images: ["/grimoire-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-parchment font-sans selection:bg-arcane/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
