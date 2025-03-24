import PBPCAMDDisplay from '@/components/PBPCAMDDisplay'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AMD Pre-Built Gaming PCs | Modern Computer',
  description: 'Browse our selection of high-performance pre-built AMD gaming PCs. Featuring powerful Ryzen processors, fast SSDs, premium graphics cards, and efficient cooling systems. Ready-to-use AMD gaming computers for all budgets and performance needs.',
  keywords: [
    'Pre-built PC', 
    'AMD PC', 
    'Ryzen PC', 
    'Gaming PC', 
    'AMD Gaming Computer', 
    'Ready-to-use PC', 
    'Gaming Desktop', 
    'AMD Desktop', 
    'High-Performance PC', 
    'Gaming Rig',
    'Belgharia PC',
    'Affordable Gaming PC'
  ],
  alternates: {
    canonical: 'https://moderncomputer.vercel.app/pbpc/pbpc-amd',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  authors: [{ name: 'Modern Computer Team', url: 'https://moderncomputer.vercel.app/about' }],
  publisher: 'Modern Computer Belgharia',
  openGraph: {
    title: 'AMD Pre-Built Gaming PCs | Modern Computer',
    description: 'Browse our selection of high-performance pre-built AMD gaming PCs. Featuring powerful Ryzen processors, fast SSDs, premium graphics cards, and efficient cooling systems.',
    type: 'website',
    images: [
      {
        url: 'https://supabase.moderncomputer.in/storage/v1/object/public/product-image/amd-prebuilt-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'AMD Pre-Built Gaming PCs'
      }
    ],
    locale: 'en_US',
    siteName: 'Modern Computer Belgharia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AMD Pre-Built Gaming PCs | Modern Computer',
    description: 'Browse our selection of high-performance pre-built AMD gaming PCs with powerful Ryzen processors.',
    images: ['https://supabase.moderncomputer.in/storage/v1/object/public/product-image/amd-prebuilt-banner.jpg'],
    site: '@moderncomputerbd',
  },
  other: {
    'google-site-verification': 'your-verification-code',
  },
  category: 'Computer Hardware'
}

const PreBuildAMDPC = () => {
  return (
    <div className='pt-16 w-full h-full justify-center items-center flex flex-col gap-6'>
      <h1 className='p-5 text-2xl text-center font-extrabold'>Choose Your favourite <span className='text-orange-400'>Pre-Build <span className='text-indigo-500'>AMD</span> </span> PC </h1>
      <PBPCAMDDisplay />
    </div>
  )
}

export default PreBuildAMDPC