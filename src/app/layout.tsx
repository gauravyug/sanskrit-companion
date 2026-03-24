import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scripture Companion — Understand Sanskrit Scriptures",
  description:
    "Explore and understand Sanskrit scriptures like Bhagavad Gita with translations, word-by-word meanings, and AI-powered explanations in English and Hindi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
