import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "../app/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YellAtMe",
  description: "- Get notified when renewals are near",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", roboto.variable)}>
      <meta name="apple-mobile-web-app-title" content="YellAtMe" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
