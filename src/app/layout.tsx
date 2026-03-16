export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Smart News — AI-Powered Daily Briefing",
  description:
    "Your personal AI newsletter curator. Subscribe to RSS feeds, bookmark articles, and get a beautifully summarized daily briefing in your chosen voice.",
  keywords: ["newsletter", "AI", "RSS", "briefing", "news", "summarizer"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
