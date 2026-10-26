import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { MainPad } from "@/components/main-pad";
import { Providers } from "@/components/providers";
import { SetupSupabase } from "@/components/setup-supabase";
import { SiteFooter } from "@/components/site-footer";
import { hasSupabaseEnv } from "@/lib/env";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LEEK — Groceries delivered in minutes",
  description: "Browse fresh groceries, cart saved on your device, checkout when you’re ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-page font-sans text-ink antialiased`}
      >
        <Providers>
          {!hasSupabaseEnv() ? (
            <div className="flex min-h-screen items-center justify-center p-6">
              <SetupSupabase />
            </div>
          ) : (
            <>
              <Header />
              <MainPad>
                <main className="mx-auto w-full min-h-[calc(100vh-4rem)] max-w-6xl flex-1 px-4 py-6 md:py-10">
                  {children}
                </main>
              </MainPad>
              <SiteFooter />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
