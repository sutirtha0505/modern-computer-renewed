import type { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductClient from './ProductClient';

// Define types so that params is a Promise for both metadata and the page.
type Props = {
  params: Promise<{ product_id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the params to extract the product_id
  const { product_id } = await params;

  // Fetch product data from Supabase
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', product_id)
    .single();

  // Optionally merge with parent Open Graph images.
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product
      ? `${product.product_name} | Modern Computer`
      : 'Product | Modern Computer',
    description:
      product?.product_description || 'Explore our amazing product collection',
    openGraph: {
      title: product?.product_name,
      description: product?.product_description,
      images: product?.product_image?.[0]?.url
        ? [product.product_image[0].url, ...previousImages]
        : previousImages,
      type: 'website',
      siteName: 'Modern Computer',
    },
    // You can add additional metadata fields as needed.
  };
}

// For the Page component, the props type is identical
export default async function Page({ params }: Props) {
  // Await the params to get the product_id
  const { product_id } = await params;

  // Fetch product data for rendering the page UI
  const { data: initialProduct } = await supabase
    .from('products')
    .select('*')
    .eq('product_id', product_id)
    .single();

  return <ProductClient initialProduct={initialProduct} />;
}
