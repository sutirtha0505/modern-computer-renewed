import CPCIntelDisplay from '@/components/CPCIntelDisplay'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Your Custom Intel PC | Modern Computer',
  description: 'Create your dream PC with Intel processors. Choose from Core i3, Core i5, Core i7, or Core i9 processors, paired with compatible motherboards, RAM, graphics cards, and more. Custom-tailored Intel performance computing solutions for gaming, productivity, and professional workloads.',
  keywords: [
    'Custom PC Builder', 
    'Intel PC', 
    'Core i7 PC', 
    'Core i9 PC',
    'Gaming PC', 
    'Intel Gaming Computer', 
    'Custom Computer Builder', 
    'Build Your Own PC', 
    'Intel Desktop', 
    'High-Performance PC', 
    'PC Configurator',
    'Belgharia PC Builder'
  ],
  alternates: {
    canonical: 'https://moderncomputer.vercel.app/cbpc/cbpc-intel',
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
    title: 'Build Your Custom Intel PC | Modern Computer',
    description: 'Create your dream PC with Intel processors. Choose from Core i3, Core i5, Core i7, or Core i9 processors, paired with compatible motherboards, RAM, graphics cards, and more.',
    type: 'website',
    images: [
      {
        url: 'https://supabase.moderncomputer.in/storage/v1/object/public/product-image/intel-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Intel Custom PC Builder'
      }
    ],
    locale: 'en_US',
    siteName: 'Modern Computer Belgharia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Your Custom Intel PC | Modern Computer',
    description: 'Create your dream PC with Intel processors. Custom-tailored Intel performance computing solutions.',
    images: ['https://supabase.moderncomputer.in/storage/v1/object/public/product-image/intel-banner.jpg'],
    site: '@moderncomputerbd',
  },
  other: {
    'google-site-verification': 'your-verification-code',
  },
  category: 'Computer Hardware'
}

const CustomBuildIntelPC = () => {
  return (
    <div className='pt-16 w-full h-full justify-center items-center flex flex-col gap-6'>
      <h1 className='p-5 text-2xl text-center font-extrabold'>Build your own favourite <span className='text-indigo-500'>Intel </span> PC </h1>
      <CPCIntelDisplay />
    </div>
  )
}

export default CustomBuildIntelPC