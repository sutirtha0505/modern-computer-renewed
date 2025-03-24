import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { XCircle, TextSearch } from 'lucide-react';
import Image from 'next/image';

type Product = {
  product_id: number;
  product_name: string;
  product_image: { url: string }[];
  best_seller: boolean;
};

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data);
        setFilteredProducts(data);
        const initiallySelected = data.filter((product: Product) => product.best_seller).map((product: Product) => product.product_id);
        setSelectedProducts(initiallySelected);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (productId: number) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleSave = async () => {
    if (selectedProducts.length !== 7) {
      toast.error('Exactly seven items must be selected.');
      return;
    }

    const updates = products.map((product) => {
      const bestSellerStatus = selectedProducts.includes(product.product_id);
      return supabase
        .from('products')
        .update({ best_seller: bestSellerStatus })
        .eq('product_id', product.product_id);
    });

    try {
      await Promise.all(updates);
      toast.success('Best sellers updated successfully');
    } catch (error) {
      console.error('Error updating best sellers:', error);
      toast.error('Error updating best sellers');
    }
  };

  const handleSearch = () => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = products.filter((product) =>
      product.product_name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredProducts(filteredData);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilteredProducts(products);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      const lowercasedValue = value.toLowerCase();
      const suggestionData = products.filter((product) =>
        product.product_name.toLowerCase().startsWith(lowercasedValue)
      );
      setSuggestions(suggestionData);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchTerm(product.product_name);
    setSuggestions([]);
    handleSearch();
  };

  return (
    <div className="p-4 justify-center items-center flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search Products here..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            className="border p-2 mr-2 bg-transparent rounded-md outline-none w-full"
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-black border border-gray-300 w-full mt-1 max-h-48 overflow-y-auto z-10">
              {suggestions.map((product) => (
                <li
                  key={product.product_id}
                  onClick={() => handleSuggestionClick(product)}
                  className="cursor-pointer p-2 hover:bg-[#4f4c4c]"
                >
                  {product.product_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="text-red-500 p-2 rounded-md"
          >
            <XCircle />
          </button>
        )}
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          <TextSearch />
        </button>
      </div>
      <div className="flex justify-center gap-2 flex-wrap h-[500px] overflow-y-scroll bg-slate-700">
        {filteredProducts.map((product) => {
          const imageUrl = product.product_image?.find((img: { url: string }) => img.url.includes('_first'))?.url;
          const isSelected = selectedProducts.includes(product.product_id);

          return (
            <div
              key={product.product_id}
              onClick={() => handleProductClick(product.product_id)}
              className={`relative gap-6 m-2 p-2 w-48 text-center border-2 rounded-lg cursor-pointer ${isSelected ? 'bg-blue-400' : 'border-transparent bg-white/50'}`}
            >
              <div className="absolute top-2 left-2 w-6 h-6 bg-white z-10 rounded-full flex items-center justify-center border">
                {isSelected && <span className="text-blue-500">✔</span>}
              </div>
              <div className='flex flex-col overflow-hidden'>
                {imageUrl && (
                  <Image
                  src={imageUrl}
                  alt={product.product_name}
                  className="w-full h-44 rounded-lg hover:scale-[110%] transition duration-300 ease-in-out"
                  width={500}
                  height={500}
                />

                )}
                <p className='text-wrap'>
                  {product.product_name.length > 30 ? `${product.product_name.substring(0, 30)}...` : product.product_name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Save Best Sellers
      </button>
      <ToastContainer />
    </div>
  );
};

export default BestSeller;
