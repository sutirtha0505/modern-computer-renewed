"use client";

import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { CloudUpload, TextSearch, XCircle } from "lucide-react";
import Image from "next/image";

interface Product {
  product_id: string;
  product_name: string;
  product_description: string;
  product_MRP: number;
  product_discount: number;
  product_SP: number;
  product_amount: number;
  product_image: { url: string }[];
  product_category: string;
  show_product: boolean;
}
const ProductTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error.message);
    } else {
      setProducts(data as Product[]);
      setFilteredProducts(data as Product[]);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("product_id", productId);
    if (error) {
      console.error("Error deleting product:", error.message);
    } else {
      fetchProducts();
    }
  };

  const handleDeleteImage = async (product: Product, imageIndex: number) => {
    const imageToDelete = product.product_image[imageIndex];
    const imagePath = imageToDelete.url.split("/").slice(-2).join("/");

    const { error: deleteError } = await supabase.storage
      .from("product-image")
      .remove([imagePath]);
    if (deleteError) {
      console.error("Error deleting image from storage:", deleteError.message);
      return;
    }

    const updatedImages = product.product_image.filter(
      (_, index) => index !== imageIndex
    );
    const { error } = await supabase
      .from("products")
      .update({ product_image: updatedImages })
      .eq("product_id", product.product_id);
    if (error) {
      console.error("Error updating product images:", error.message);
    } else {
      if (editingProduct?.product_id === product.product_id) {
        setEditingProduct({ ...editingProduct, product_image: updatedImages });
      }
      fetchProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSave = async () => {
    if (editingProduct) {
      const updatedProductSP =
        editingProduct.product_MRP -
        (editingProduct.product_MRP * editingProduct.product_discount) / 100;
  
      // Upload new images
      const imageUrls = [...editingProduct.product_image];
      const uploadPromises = newImages.map(async (image) => {
        const filePath = `${editingProduct.product_id}/${uuidv4()}_${
          image.name
        }`;
        const { error: uploadError } = await supabase.storage
          .from("product-image")
          .upload(filePath, image);
  
        if (uploadError) {
          console.error("Error uploading image:", uploadError.message);
          return;
        }
  
        const { data: publicUrlData } = await supabase.storage
          .from("product-image")
          .getPublicUrl(filePath);
        if (publicUrlData) {
          imageUrls.push({ url: publicUrlData.publicUrl });
        } else {
          console.error("Error getting public URL");
        }
      });
  
      await Promise.all(uploadPromises);
  
      const { error } = await supabase
        .from("products")
        .update({
          product_name: editingProduct.product_name,
          product_description: editingProduct.product_description,
          product_MRP: editingProduct.product_MRP,
          product_discount: editingProduct.product_discount,
          product_SP: updatedProductSP,
          product_image: imageUrls,
          product_amount: editingProduct.product_amount,
          product_category: editingProduct.product_category,
          show_product: editingProduct.show_product, // Include show_product field here
        })
        .eq("product_id", editingProduct.product_id);
  
      if (error) {
        console.error("Error updating product:", error.message);
      } else {
        setEditingProduct(null);
        setNewImages([]);
        fetchProducts();
      }
    }
  };
  

  const onDrop = (acceptedFiles: File[]) => {
    setNewImages([...newImages, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  //Seraching logic

  const handleSearch = () => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = products.filter((product) => {
      return (
        product.product_id.toLowerCase().includes(lowercasedFilter) ||
        product.product_name.toLowerCase().includes(lowercasedFilter) ||
        product.product_description.toLowerCase().includes(lowercasedFilter) ||
        product.product_category.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredProducts(filteredData);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
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
    <div className=" w-full items-center flex flex-col gap-3 p-4">
      <h1 className="text-center text-indigo-500 font-extrabold text-3xl select-text">
        Product table
      </h1>
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
      <div className="text-center w-full overflow-x-auto">
        <table className="border">
          <thead className="text-indigo-500">
            <tr>
              <th className="py-2 px-4 border">Product ID</th>
              <th className="py-2 px-4 border">Product Name</th>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">MRP</th>
              <th className="py-2 px-4 border">Discount</th>
              <th className="py-2 px-4 border">SP</th>
              <th className="py-2 px-4 border">Amount</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Images</th>
              <th className="py-2 px-4 border">Sellable</th>
              <th className="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.product_id}>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {product.product_id}
                </td>
                <td className="py-2 px-4 border text-indigo-500 hover:bg-[#283c4f]">
                  {editingProduct?.product_id === product.product_id ? (
                    <input
                      type="text"
                      value={editingProduct.product_name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_name: e.target.value,
                        })
                      }
                      className="py-2 px-4 border bg-black border-white text-wrap w-full"
                    />
                  ) : (
                    product.product_name
                  )}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {editingProduct?.product_id === product.product_id ? (
                    <input
                      type="text"
                      value={editingProduct.product_description}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_description: e.target.value,
                        })
                      }
                      className="py-2 px-4 border bg-black border-white text-wrap w-full"
                    />
                  ) : (
                    product.product_description
                  )}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {editingProduct?.product_id === product.product_id ? (
                    <input
                      type="number"
                      value={editingProduct.product_MRP}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_MRP: Number(e.target.value),
                        })
                      }
                      className="py-2 border bg-black border-white text-wrap w-full"
                    />
                  ) : (
                    `Rs. ${product.product_MRP}`
                  )}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {editingProduct?.product_id === product.product_id ? (
                    <input
                      type="number"
                      value={editingProduct.product_discount}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_discount: Number(e.target.value),
                        })
                      }
                      className="py-2 px-4 border bg-black border-white text-wrap w-full"
                    />
                  ) : (
                    `${product.product_discount}%`
                  )}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  Rs. {product.product_SP}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {editingProduct?.product_id === product.product_id ? (
                    <input
                      type="number"
                      value={editingProduct.product_amount}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_amount: Number(e.target.value),
                        })
                      }
                      className="py-2 border bg-black border-white text-wrap w-full"
                    />
                  ) : (
                    product.product_amount
                  )}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f] text-cyan-500 font-bold">
                  {product.product_category}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {product.product_image.map((image, index) => (
                    <div key={index} className="relative flex flex-col w-full ">
                      <Image
                        src={image.url}
                        alt={`Product ${product.product_id} Image ${index}`}
                        className="max-h-20 max-w-20 object-cover rounded-md"
                        width={500}
                        height={500}
                      />
                      {editingProduct?.product_id === product.product_id && (
                        <button
                          onClick={() => handleDeleteImage(product, index)}
                          className="absolute top-0 left-0 bg-black text-white rounded-full p-1"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  {editingProduct?.product_id === product.product_id && (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-400 rounded-md p-4 mt-2 flex items-center flex-col"
                    >
                      <input {...getInputProps()} multiple />
                      <CloudUpload />
                      <p>Upload new image</p>
                    </div>
                  )}
                </td>
                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {editingProduct?.product_id === product.product_id ? (
                    <select
                      value={editingProduct.show_product ? "true" : "false"}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          show_product: e.target.value === "true",
                        })
                      }
                      className="py-2 border bg-black border-white text-wrap w-full"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : product.show_product ? (
                    "True"
                  ) : (
                    "False"
                  )}
                </td>

                <td className="py-2 px-4 border hover:bg-[#283c4f]">
                  {editingProduct?.product_id === product.product_id ? (
                    <button
                      onClick={handleSave}
                      className="bg-green-500 text-white p-2 rounded-md w-full"
                    >
                      Save
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 text-white p-2 rounded-md mr-2  w-full"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.product_id)}
                        className="bg-red-500 text-white p-2 rounded-md  w-full"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
