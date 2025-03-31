import PreBuildPCSingleProduct from '@/components/PreBuildPCSingleProduct'
import React from 'react'
import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const { data: product, error } = await supabase
      .from("pre_build")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !product) {
      return {
        title: 'Product Not Found | Modern Computer',
        description: 'The requested pre-built PC was not found.',
      }
    }

    const productImages = product.image_urls || [];
    const imageUrl = productImages[0]?.url;

    return {
      title: `${product.build_name} | Modern Computer`,
      description: `Buy ${product.build_name} - Custom Gaming PC with ${product.processor}${product.graphics_card ? `, ${product.graphics_card}` : ''}, ${product.ram_quantity}x${product.ram} RAM. Starting at ₹${product.selling_price}. Free shipping available.`,
      openGraph: {
        title: `${product.build_name} | Modern Computer`,
        description: `High-performance custom gaming PC featuring ${product.processor}${product.graphics_card ? `, ${product.graphics_card}` : ''}. Buy now at ₹${product.selling_price}`,
        url: `https://moderncomputer.in/pre-build/${params.id}`,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'website',
        siteName: 'Modern Computer',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.build_name} | Modern Computer`,
        description: `High-performance custom gaming PC featuring ${product.processor}${product.graphics_card ? `, ${product.graphics_card}` : ''}. Buy now at ₹${product.selling_price}`,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: `https://moderncomputer.in/pre-build/${params.id}`,
      },
    }
  } catch (error) {
    return {
      title: 'Error | Modern Computer',
      description: 'An error occurred while loading the product details.',
    }
  }
}

const PreBuildPCSingleProductPage = () => {
  return (
    <div className='pt-16 flex flex-col justify-center items-center w-full h-full'>
        <PreBuildPCSingleProduct />
    </div>
  )
}

export default PreBuildPCSingleProductPage