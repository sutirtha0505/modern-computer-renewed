import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import { Metadata } from "next";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SessionProviderWrapper } from "@/components/SessionProvderWrapper";
const inter = Inter({ subsets: ["latin"] });

// Define metadata for the entire site
export const metadata: Metadata = {
  metadataBase: new URL("https://moderncomputer.vercel.app"),
  title: {
    template: "%s | Modern Computer Belgharia",
    default:
      "Modern Computer Belgharia - High-Performance Custom PCs & Components",
  },
  description:
    "Modern Computer Belgharia offers custom-built PCs, pre-built gaming computers, and high-quality computer components. Build your dream PC with us or choose from our premium ready-to-use systems.",
  keywords: [
    "Modern Computer",
    "Custom PC Builder",
    "Gaming PC",
    "Computer Components",
    "PC Building",
    "High-Performance Computers",
    "Desktop PC",
    "AMD PC",
    "Intel PC",
    "Gaming Hardware",
    "Computer Store Belgharia",
  ],
  authors: [
    {
      name: "Modern Computer Team",
      url: "https://moderncomputer.vercel.app/about",
    },
  ],
  publisher: "Modern Computer Belgharia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://moderncomputer.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moderncomputer.vercel.app",
    siteName: "Modern Computer Belgharia",
    title:
      "Modern Computer Belgharia - High-Performance Custom PCs & Components",
    description:
      "Custom-built PCs, pre-built gaming computers, and high-quality computer components. Build your dream PC or choose from our premium ready-to-use systems.",
    images: [
      {
        url: "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/main-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Modern Computer Belgharia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Modern Computer Belgharia - High-Performance Pre-Build & Custom PCs and PC Components",
    description:
      "Custom-built PCs, pre-built gaming computers, and high-quality computer components. Build your dream PC or choose from our premium ready-to-use systems.",
    images: [
      "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/main-banner.jpg",
    ],
    site: "@moderncomputerbelgharia",
  },
  other: {
    "google-site-verification": "your-verification-code",
  },
  category: "Technology",
  applicationName: "Modern Computer",
  referrer: "origin-when-cross-origin",
  creator: "Modern Computer Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#DFE4E4] dark:bg-black" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Suspense fallback={<LoadingScreen />}>
          <SessionProviderWrapper>
            <ClientLayout>
              {children}
            </ClientLayout>
          </SessionProviderWrapper>
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  );
}
