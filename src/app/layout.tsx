import type { Metadata } from "next";
import { Fraunces, Karla, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Mission Log — Space, decoded daily.",
    template: "%s | Mission Log",
  },
  description:
    "An independent space publication. Understand live NASA data, read the human stories, and find your path into what comes next.",
  metadataBase: new URL(
    process.env.BETTER_AUTH_URL || "https://mission-log-omega.vercel.app",
  ),
  openGraph: {
    siteName: "Mission Log",
    type: "website",
    locale: "en_US",
    title: "Mission Log — Space, decoded daily.",
    description:
      "An independent space publication. Read the science, explore NASA data, and find your next question.",
    images: [
      {
        url: "https://images-assets.nasa.gov/image/iss056e201248/iss056e201248~medium.jpg",
        alt: "International Space Station above Earth · NASA",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${karla.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] bg-background p-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
