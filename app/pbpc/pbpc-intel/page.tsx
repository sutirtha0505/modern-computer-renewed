import PBPCIntelDisplay from '@/components/PBPCIntelDisplay'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Intel Pre-Built Gaming PCs | Modern Computer',
  description: 'Browse our selection of high-performance pre-built Intel gaming PCs. Featuring powerful Core i5, i7, and i9 processors, fast SSDs, premium graphics cards, and efficient cooling systems. Ready-to-use Intel gaming computers for all budgets and performance needs.',
  keywords: [
    'Pre-built PC', 
    'Intel PC', 
    'Core i7 PC', 
    'Core i9 PC',
    'Gaming PC', 
    'Intel Gaming Computer', 
    'Ready-to-use PC', 
    'Gaming Desktop', 
    'Intel Desktop', 
    'High-Performance PC', 
    'Gaming Rig',
    'Belgharia PC',
    'Affordable Gaming PC'
  ],
  alternates: {
    canonical: 'https://moderncomputer.in/pbpc/pbpc-intel',
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
  authors: [{ name: 'Modern Computer Team', url: 'https://moderncomputer.in/about' }],
  publisher: 'Modern Computer Belgharia',
  openGraph: {
    title: 'Intel Pre-Built Gaming PCs | Modern Computer',
    description: 'Browse our selection of high-performance pre-built Intel gaming PCs. Featuring powerful Core i5, i7, and i9 processors, fast SSDs, premium graphics cards, and efficient cooling systems.',
    type: 'website',
    images: [
      {
        url: 'https://supabase.moderncomputer.in/storage/v1/object/public/product-image/intel-prebuilt-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Intel Pre-Built Gaming PCs'
      }
    ],
    locale: 'en_US',
    siteName: 'Modern Computer Belgharia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Intel Pre-Built Gaming PCs | Modern Computer',
    description: 'Browse our selection of high-performance pre-built Intel gaming PCs with powerful Core i processors.',
    images: ['https://supabase.moderncomputer.in/storage/v1/object/public/product-image/intel-prebuilt-banner.jpg'],
    site: '@moderncomputerbd',
  },
  other: {
    'google-site-verification': 'your-verification-code',
  },
  category: 'Computer Hardware'
}

const PreBuildIntelPC = () => {
  return (
    <div className='pt-16 min-h-screen w-full h-full justify-center items-center flex flex-col gap-6'>
      <h1 className='p-5 text-2xl text-center font-extrabold'>Choose Your favourite <span className='text-orange-400'>Pre-Build <span className='text-indigo-500'>Intel</span> </span> PC </h1>
      <PBPCIntelDisplay />
    </div>
  )
}

export default PreBuildIntelPC