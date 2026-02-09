"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { LoadingsContextProvider } from "@/context/LoadingsContext";
import { SocialNetworkContextProvider } from "@/context/SocialNetworkContext";
import { VideoContextProvider } from "@/context/VideoContext";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#020617] text-white`}
      >
        <LoadingsContextProvider>
          <SocialNetworkContextProvider>
            <VideoContextProvider>
              <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="flex flex-row min-h-screen">
                  {/* Menu lateral colapsável */}
                  <Sidebar />

                  {/* Conteúdo principal */}
                  <main className="flex-1 p-6 lg:p-10">
                    <div className="mx-auto">{children}</div>
                  </main>
                </div>
              </div>
              <Toaster richColors />
            </VideoContextProvider>
          </SocialNetworkContextProvider>
        </LoadingsContextProvider>
      </body>
    </html>
  );
}
