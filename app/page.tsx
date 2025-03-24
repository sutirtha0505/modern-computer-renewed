import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import LoadingScreen from "@/components/LoadingScreen";
import WhyUs from "@/components/WhyUs";

// Dynamically import components with loading fallbacks

const Hero = dynamic(() => import("@/components/Hero"), {
  loading: () => <LoadingScreen />,
  ssr: true,
});

const BestSellerSlider = dynamic(
  () => import("@/components/BestSellerSlider"),
  {
    loading: () => <LoadingScreen />,
    ssr: true,
  }
);

const ProductByCategoriesSlider = dynamic(
  () => import("@/components/ProductByCategoriesSlider"),
  {
    loading: () => <LoadingScreen />,
    ssr: true,
  }
);

const PreBuildPCINHomePage = dynamic(
  () => import("@/components/PreBuildPCINHomePage"),
  {
    loading: () => <LoadingScreen />,
    ssr: true,
  }
);

const CustomBuildPCINHomePage = dynamic(
  () => import("@/components/CustomBuildPCINHomePage"),
  {
    loading: () => <LoadingScreen />,
    ssr: true,
  }
);

const About = dynamic(() => import("@/components/About"), {
  loading: () => <LoadingScreen />,
  ssr: true,
});

const CustomerReview = dynamic(() => import("@/components/CustomerReview"), {
  loading: () => <LoadingScreen />,
  ssr: true,
});

export const metadata: Metadata = {
  title: "Modern Computer Belgharia - High-Performance Custom PCs & Components",
  description:
    "Shop for custom-built gaming PCs, computer components, and accessories. Build your dream PC with Modern Computer Belgharia or choose from our ready-to-use pre-built systems.",
  keywords: [
    "Modern Computer",
    "Gaming PC",
    "Computer Store",
    "Custom PC Builder",
    "Computer Components",
    "Gaming Desktop",
    "PC Parts",
    "AMD Ryzen PC",
    "Intel Core PC",
    "Computer Shop Belgharia",
    "High-Performance PC",
  ],
  openGraph: {
    images: [
      {
        url: "https://supabase.moderncomputer.in/storage/v1/object/public/product-image/home-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Modern Computer Homepage",
      },
    ],
  },
};

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="space-y-8">
        <Hero />
        <ProductByCategoriesSlider />
        <WhyUs />
        <BestSellerSlider />
        <PreBuildPCINHomePage />
        <CustomBuildPCINHomePage />
        <About />
        <CustomerReview />
      </div>
    </Suspense>
  );
}
