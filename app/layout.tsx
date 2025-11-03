import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationBubbleOnDraggableCircularNav from "@/components/NotificationBubbleOnDraggableCircularNav";
import LoadingScreen from "@/components/LoadingScreen";
import { SessionProviderWrapper } from "@/components/SessionProvderWrapper";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/theme-provider";
import AutoFullscreen from "@/components/AutoFullScreen";
import HydrationContainer from "@/components/HydrationContainer";

const inter = Inter({ subsets: ["latin"] });

// Dynamically import components that aren't needed immediately
const ClientLayout = dynamic(() => import("../components/ClientLayout"), {
  loading: () => <LoadingScreen />,
});

// Define metadata for the entire site
export const metadata: Metadata = {
  metadataBase: new URL("https://moderncomputer.in"),
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
      url: "https://moderncomputer.in/about",
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
    canonical: "https://moderncomputer.in",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://moderncomputer.in",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-white dark:bg-black" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch {}
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Using alert to prompt for fullscreen mode */}
            <AutoFullscreen />
            {/* Toast container and notification manager (bottom-left) */}
            <ToastContainer position="bottom-left" newestOnTop={false} />
            <NotificationBubbleOnDraggableCircularNav />
          <div className="min-h-screen">
            {/* Wrap the client-side rendered content with HydrationContainer */}
            <HydrationContainer>
              <Suspense fallback={<LoadingScreen />}>
                <SessionProviderWrapper>
                  <ClientLayout>{children}</ClientLayout>
                </SessionProviderWrapper>
              </Suspense>
            </HydrationContainer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
