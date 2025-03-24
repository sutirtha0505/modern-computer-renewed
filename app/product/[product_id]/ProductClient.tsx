'use client';

import SingleProduct from '@/components/SingleProduct';
import { UseSupabase } from '@/lib/hooks/UseSupabase';
import { useEffect } from 'react';

// Match exactly the SingleProduct interface
interface Product {
  product_id: string;
  product_name: string;
  product_SP: number;
  product_MRP: number;
  product_image?: { url: string }[];
  product_description: string;
  quantity: number;
  product_discount: number;
  product_amount: number;
}

interface ProductClientProps {
  initialProduct: Product;
}

export default function ProductClient({ initialProduct }: ProductClientProps) {
  const { singleProduct, getSingleProduct } = UseSupabase();

  useEffect(() => {
    if (initialProduct?.product_id) {
      getSingleProduct(initialProduct.product_id);
    }
  }, [initialProduct?.product_id, getSingleProduct]);

  // Use either the live data from UseSupabase or fall back to initial data
  const productToDisplay = singleProduct || initialProduct;

  return (
    <div>
      <SingleProduct singleProduct={productToDisplay} />
    </div>
  );
} 