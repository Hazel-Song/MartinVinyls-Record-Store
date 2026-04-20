import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Martin Vinyl's Record Store",
  description: "一家只为你开的复古黑胶唱片店",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full">
      <body className="h-full bg-black font-['IPix',sans-serif]">
        {children}
      </body>
    </html>
  );
}
