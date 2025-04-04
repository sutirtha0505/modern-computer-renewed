import React from 'react';
import { Metadata} from 'next';
import { supabase } from '@/lib/supabaseClient';
import PreBuildPCSingleProduct from '@/components/PreBuildPCSingleProduct';

// Define the props type for the page component
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data: product, error } = await supabase
      .from('pre_build')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return {
        title: 'Product Not Found | Modern Computer',
        description: 'The requested pre-built PC was not found.',
      };
    }

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('product_id, product_name');

    if (productsError) {
      throw productsError;
    }

    const truncateProductName = (productName: string, wordLimit: number = 6): string => {
      const words = productName.split(' ');
      return words.length > wordLimit
        ? words.slice(0, wordLimit).join(' ') + '...'
        : productName;
    };

    const getProductNameById = (productId: string | undefined): string => {
      if (!productId) return 'Not specified';
      const foundProduct = productsData?.find((p) => p.product_id === productId);
      return foundProduct ? truncateProductName(foundProduct.product_name) : 'No product is added';
    };

    const productImages = product.image_urls || [];
    const imageUrl = productImages[0]?.url;

    const processorName = getProductNameById(product.processor);
    const graphicsCardName = product.graphics_card ? getProductNameById(product.graphics_card) : '';
    const ramName = getProductNameById(product.ram);

    const buildTitle = `${product.build_name} | Modern Computer`;

    return {
      title: buildTitle,
      description: `Buy ${product.build_name} Pre-Built PC with ${processorName}${graphicsCardName ? `, ${graphicsCardName}` : ''}, ${ramName} RAM. Starting at ₹${product.selling_price}. Free shipping available.`,
      openGraph: {
        title: buildTitle,
        description: `High-performance custom gaming PC featuring ${processorName}${graphicsCardName ? `, ${graphicsCardName}` : ''}. Buy now at ₹${product.selling_price}.`,
        url: `https://moderncomputer.in/pre-build/${id}`,
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: 'website',
        siteName: 'Modern Computer',
      },
      twitter: {
        card: 'summary_large_image',
        title: buildTitle,
        description: `High-performance custom gaming PC featuring ${processorName}${graphicsCardName ? `, ${graphicsCardName}` : ''}. Buy now at ₹${product.selling_price}.`,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: `https://moderncomputer.in/pre-build/${id}`,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      title: 'Error | Modern Computer',
      description: 'An error occurred while loading the product details.',
    };
  }
}

// Page component
const PreBuildPCSingleProductPage = () => {
  

  return (
    <div className="pt-16 flex flex-col justify-center items-center w-full h-full">
      <PreBuildPCSingleProduct />
    </div>
  );
};

export default PreBuildPCSingleProductPage;
