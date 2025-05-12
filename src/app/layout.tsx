import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Persona Chat",
  description: "A random app to chat with personas that have unique challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="bg-slate-100"
      >
        {children}
      </body>
    </html>
  );
}
