import React from 'react'
import { Inter } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { SessionProviderWrapper } from "@/components/SessionProvderWrapper";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.className} min-h-screen bg-[#DFE4E4] dark:bg-black`}>
      <Suspense fallback={<LoadingScreen />}>
        <SessionProviderWrapper>
          <div className="flex min-h-screen">
            {/* Admin Sidebar will go here */}
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </SessionProviderWrapper>
      </Suspense>
    </div>
  )
}