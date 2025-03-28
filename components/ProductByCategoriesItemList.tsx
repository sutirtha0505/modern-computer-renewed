import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  product_id: string;
  product_MRP: number;
  product_SP: number;
  product_amount: number;
  product_image: { url: string }[];
  product_name: string;
  show_product: string;
}

interface ProductListProps {
  products: Product[];
}

const truncateProductName = (name: string) => {
  const words = name.split(" ");
  if (words.length > 5) {
    return words.slice(0, 7).join(" ") + " ...";
  }
  return name;
};

const ProductByCategoriesItemList: React.FC<ProductListProps> = ({
  products,
}) => {
  const router = useRouter();

  const renderProductAmount = (product: Product) => {
    const productImage = product.product_image.find((img) =>
      img.url.includes("_first")
    );

    if (product.product_amount === 0) {
      return (
        <div className="relative bg-gray-300 filter grayscale w-60 h-80 flex flex-col gap-3 p-2 items-center rounded-md custom-backdrop-filter">
          <div className="w-44 h-96 flex items-center overflow-hidden object-fill">
            {productImage && (
              <Image
                src={productImage.url}
                width={200}
                height={100}
                alt={product.product_name}
                className="transition duration-300 ease-in-out rounded-sm hover:scale-110"
              />
            )}
          </div>
          <h1 className="text-sm text-center">
            {truncateProductName(product.product_name)}
          </h1>
          <div className="flex justify-between gap-6">
            <p>&#x20B9;{`${product.product_SP}`}</p>
            <p className="text-[#b8b4b4] line-through select-none">
              &#x20B9;{`${product.product_MRP}`}
            </p>
          </div>
          <p className="text-xs font-bold text-red-500">Out of Stock</p>
          <button
            className="bg-gray-400 text-gray-600 cursor-not-allowed opacity-50 h-32 w-36 rounded-md text-xs font-bold duration-200"
            disabled
          >
            Check out
          </button>
        </div>
      );
    } else if (product.product_amount < 5) {
      return (
        <div className="relative bg-gray-300 dark:bg-white/50 w-60 h-80 flex flex-col gap-3 p-2 items-center rounded-md custom-backdrop-filter">
          <div className="w-44 h-96 flex items-center overflow-hidden object-fill">
            {productImage && (
              <Image
                src={productImage.url}
                width={200}
                height={100}
                alt={product.product_name}
                className="transition duration-300 ease-in-out rounded-sm hover:scale-110"
              />
            )}
          </div>
          <h1 className="text-sm text-center">
            {truncateProductName(product.product_name)}
          </h1>
          <div className="flex justify-between gap-6">
            <p>&#x20B9;{`${product.product_SP}`}</p>
            <p className="text-gray-700 line-through select-none">
              &#x20B9;{`${product.product_MRP}`}
            </p>
          </div>
          <p className="text-xs font-bold text-red-500">
            Only {product.product_amount} left!
          </p>
          <button
            className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-32 w-36 rounded-md text-xs font-bold duration-200"
            onClick={() => router.push(`/product/${product.product_id}`)}
          >
            Check out
          </button>
        </div>
      );
    } else {
      return (
        <div className="relative bg-gray-300 dark:bg-white/50 w-60 h-80 flex flex-col gap-3 p-2 items-center rounded-md custom-backdrop-filter">
          <div className="w-44 h-96 flex items-center overflow-hidden object-fill">
            {productImage && (
              <Image
                src={productImage.url}
                width={200}
                height={100}
                alt={product.product_name}
                className="transition duration-300 ease-in-out rounded-sm hover:scale-110"
              />
            )}
          </div>
          <h1 className="text-sm text-center">
            {truncateProductName(product.product_name)}
          </h1>
          <div className="flex justify-between gap-6">
            <p>&#x20B9;{`${product.product_SP}`}</p>
            <p className="text-gray-700 line-through select-none">
              &#x20B9;{`${product.product_MRP}`}
            </p>
          </div>
          <button
            className="bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 h-32 w-36 rounded-md text-xs font-bold duration-200"
            onClick={() => router.push(`/product/${product.product_id}`)}
          >
            Check out
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-4">
      {products.map((product, index) => (
        <React.Fragment key={index}>{renderProductAmount(product)}</React.Fragment>
      ))}
    </div>
  );
};

export default ProductByCategoriesItemList;
