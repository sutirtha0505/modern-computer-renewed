import PreBuildPCSingleProduct from '@/components/PreBuildPCSingleProduct'
import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Metadata } from 'next'

// Used in the generateMetadata function
interface ProductData {
  product_id: string;
  product_name: string;
  product_image: { url: string }[];
}

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const id = params.id
  
  // Fetch product data from SupaBase
  const supabase = createServerComponentClient({ cookies })
  
  const { data: preBuild } = await supabase
    .from("pre_build")
    .select("*")
    .eq("id", id)
    .single()
    
  const { data: products } = await supabase
    .from("products")
    .select("product_id, product_name, product_image")
  
  if (!preBuild || !products) {
    return {
      title: 'Pre-Built PC Not Found',
      description: 'The requested pre-built PC configuration was not found'
    }
  }
  
  // Product name lookup function
  const getProductNameById = (productId: string): string => {
    const product = products.find((p: ProductData) => p.product_id === productId)
    return product ? product.product_name : 'Unknown Product'
  }
  
  // Text truncate function
  const truncateText = (text: string, wordLimit: number = 6): string => {
    const words = text.split(' ')
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(' ') + '...'
  }
  
  // Format selling price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT'
  }).format(preBuild.selling_price)
  
  // Create description
  let description = `${preBuild.build_name} - ${formattedPrice}. `
  
  // Add component information
  description += `Processor: ${truncateText(getProductNameById(preBuild.processor))}`
  
  if (preBuild.motherboard) {
    description += `, Motherboard: ${truncateText(getProductNameById(preBuild.motherboard))}`
  }
  
  if (preBuild.ram) {
    description += `, RAM: ${truncateText(getProductNameById(preBuild.ram))}`
    if (preBuild.ram_quantity) {
      description += ` Quantity: ${preBuild.ram_quantity}`
    }
  }
  
  if (preBuild.graphics_card) {
    description += `, Graphics Card: ${truncateText(getProductNameById(preBuild.graphics_card))}`
  }
  
  if (preBuild.ssd) {
    description += `, SSD: ${truncateText(getProductNameById(preBuild.ssd))}`
  }
  
  if (preBuild.hdd) {
    description += `, Hard Disk: ${truncateText(getProductNameById(preBuild.hdd))}`
  }
  
  if (preBuild.psu) {
    description += `, Power Supply: ${truncateText(getProductNameById(preBuild.psu))}`
  }
  
  if (preBuild.cabinet) {
    description += `, Cabinet: ${truncateText(getProductNameById(preBuild.cabinet))}`
  }
  
  if (preBuild.cooling_system) {
    description += `, Cooling System: ${truncateText(getProductNameById(preBuild.cooling_system))}`
  }
  
  // Determine image URL
  const imageUrl = preBuild.image_urls && preBuild.image_urls.length > 0 
    ? preBuild.image_urls[0].url 
    : 'https://supabase.moderncomputer.in/storage/v1/object/public/product-image/default-pc.jpg'

  // Return metadata
  return {
    title: `${preBuild.build_name} | Modern Computer`,
    description: description,
    keywords: ['Pre-built PC', 'Gaming PC', 'Computer', 'Desktop PC', 'Custom PC', 
      'High Performance', 'Gaming', preBuild.build_name, 'Bangladesh PC', 'Modern Computer'],
    openGraph: {
      title: `${preBuild.build_name} | Modern Computer`,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: preBuild.build_name,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${preBuild.build_name} | Modern Computer`,
      description: description,
      images: [imageUrl],
    },
  }
}

const PreBuildPCSingleProductPage = async ({ params }: Props) => {
  return (
    <div className='pt-16 flex flex-col justify-center items-center w-full h-full'>
        <PreBuildPCSingleProduct id={params.id} />
    </div>
  )
}

export default PreBuildPCSingleProductPage