import CPCAMDDisplay from '@/components/CPCAMDDisplay'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build Your Custom AMD PC | Modern Computer',
  description: 'Create your dream PC with AMD processors. Choose from Ryzen 5, Ryzen 7, or Ryzen 9 processors, paired with compatible motherboards, RAM, graphics cards, and more. Custom-tailored AMD performance computing solutions for gaming, content creation, and professional workloads.',
  keywords: [
    'Custom PC Builder', 
    'AMD PC', 
    'Ryzen PC', 
    'Gaming PC', 
    'AMD Gaming Computer', 
    'Custom Computer Builder', 
    'Build Your Own PC', 
    'AMD Desktop', 
    'High-Performance PC', 
    'PC Configurator',
    'Belgharia PC Builder'
  ],
  alternates: {
    canonical: 'https://moderncomputer.in/cbpc/cbpc-amd',
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
    title: 'Build Your Custom AMD PC | Modern Computer',
    description: 'Create your dream PC with AMD processors. Choose from Ryzen 5, Ryzen 7, or Ryzen 9 processors, paired with compatible motherboards, RAM, graphics cards, and more.',
    type: 'website',
    images: [
      {
        url: 'https://supabase.moderncomputer.in/storage/v1/object/public/product-image/amd-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'AMD Custom PC Builder'
      }
    ],
    locale: 'en_US',
    siteName: 'Modern Computer Belgharia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Your Custom AMD PC | Modern Computer',
    description: 'Create your dream PC with AMD processors. Custom-tailored AMD performance computing solutions.',
    images: ['https://supabase.moderncomputer.in/storage/v1/object/public/product-image/amd-banner.jpg'],
    site: '@moderncomputerbd',
  },
  other: {
    'google-site-verification': 'your-verification-code',
  },
  category: 'Computer Hardware'
}

const CustomBuildAMDPC = () => {
  return (
    <div className='pt-16 w-full h-full justify-center items-center flex flex-col gap-6'>
      <h1 className='p-5 text-2xl text-center font-extrabold'>Build your own favourite <span className='text-indigo-500'>AMD </span> PC </h1>
      <CPCAMDDisplay />
    </div>
  )
}

export default CustomBuildAMDPC