import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Visualizer — 可视化简历",
  description: "Upload a resume and turn it into a Tableau-style infographic resume.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
