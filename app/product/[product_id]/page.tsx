import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductClient from './ProductClient';

type Props = {
  params: { product_id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch product data
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', params.product_id)
    .single();

  // Optionally access and extend parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product ? `${product.product_name} | Modern Computer` : 'Product | Modern Computer',
    description: product?.product_description || 'Explore our amazing product collection',
    keywords: [`${product?.product_name}`, 'modern computer', 'electronics', 'online shopping', 'best price', 'deals'],
    authors: [{ name: 'Modern Computer' }],
    publisher: 'Modern Computer',
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: product?.product_name,
      description: product?.product_description,
      images: product?.product_image?.[0]?.url 
        ? [product.product_image[0].url, ...previousImages]
        : previousImages,
      type: 'website',
      siteName: 'Modern Computer',
    },
    twitter: {
      card: 'summary_large_image',
      title: product?.product_name,
      description: product?.product_description,
      images: product?.product_image?.[0]?.url ? [product.product_image[0].url] : [],
    },
    alternates: {
      canonical: `https://moderncomputer.vercel.app/product/${params.product_id}`,
    },
  };
}

export default async function Page({ params }: { params: { product_id: string } }) {
  // Server-side data fetching for initial data
  const { data: initialProduct } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', params.product_id)
    .single();

  return <ProductClient initialProduct={initialProduct} />;
}