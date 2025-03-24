// types.ts
export interface Product {
    product_id: string;
    product_name: string;
    product_image: { url: string }[];
    product_SP: number;
    product_MRP: number;
    product_amount: number;
    show_product: string;
    product_description: string;
    quantity: number;
    product_discount: number;
  }
  