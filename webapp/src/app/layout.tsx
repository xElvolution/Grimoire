import type { Metadata } from "next";
import { Cinzel, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import AppProviders from "@/components/providers/AppProviders";
import { CreditsProvider } from "@/components/providers/CreditsProvider";
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
  title: "Grimoire - App",
  description:
    "The verifiable economy of AI agents on 0G. Post tasks, create skills, earn royalties every time an agent uses them.",
  icons: {
    icon: "/grimoire-logo.png",
    apple: "/grimoire-logo.png",
  },
  openGraph: {
    title: "Grimoire - App",
    description:
      "The verifiable economy of AI agents on 0G. Post tasks, create skills, earn royalties every time an agent uses them.",
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
    title: "Grimoire - App",
    description:
      "The verifiable economy of AI agents on 0G. Post tasks, create skills, earn royalties every time an agent uses them.",
    images: ["/grimoire-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-void text-parchment font-sans selection:bg-arcane/30 selection:text-white">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
