import React from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/types"; 
const SearchResult = ({ filterData }: { filterData: Product[] }) => {
  // Filter products where show_product is true
  const filteredProducts = filterData.filter((product) => product.show_product);

  return (
    <div className="pt-20 pb-20 flex justify-center">
      <div className="flex flex-col gap-4 items-center w-[80%]">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="font-extrabold text-3xl">
            Results: {filteredProducts.length}
          </h1>
          <p>
            Price and other details may vary based on product size and quantity
          </p>
        </div>
        <div className="flex gap-3 flex-wrap p-1 items-center justify-center">
          {
            filteredProducts.map((product: Product) => (
              <div key={product.product_id}>
                <ProductCard products={product} />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
