import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProfileProvider } from "@/contexts/UserProfileContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pixelar - 2D Game Asset Creation Platform",
  description: "Create export-ready assets for game engines like Unity, Godot, and Unreal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased text-text min-h-screen bg-background selection:bg-primary selection:text-white`}
      >
        <UserProfileProvider>
          {children}
        </UserProfileProvider>
      </body>
    </html>
  );
}
