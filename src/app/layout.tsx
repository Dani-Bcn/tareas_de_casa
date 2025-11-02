import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tareas de casa",
  description: "Tareas de casa y recompensas",
  keywords: ["Tareas", "casa", "recompnsas", "deberes","niños","familia", "organización","puntajes","motivación"],
  authors: [{ name: "Dani" }],
  icons: {
    icon: "/tareas.ico",
  },
  openGraph: {
    title: "Tareas de casa",
    description: "Tareas de casa y recompensas",
    url: "https://tareas-de-casa.vercel.app/",
    siteName: "Tareas de casa",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
