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
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

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
    try {
      // 1️⃣ Fetch the product to get its images first
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("product_image")
        .eq("product_id", productId)
        .single();

      if (fetchError) {
        console.error(
          "Error fetching product for deletion:",
          fetchError.message
        );
        return;
      }

      // 2️⃣ Delete all related images from Supabase Storage
      if (product?.product_image?.length > 0) {
        const imagePaths = product.product_image.map(
          (img: { url: string }) =>
            img.url.split("/storage/v1/object/public/product-image/")[1]
        );

        const { error: deleteImagesError } = await supabase.storage
          .from("product-image")
          .remove(imagePaths);

        if (deleteImagesError) {
          console.error(
            "Error deleting product images:",
            deleteImagesError.message
          );
        }
      }

      // 3️⃣ Delete the folder (optional but nice cleanup)
      const { error: deleteFolderError } = await supabase.storage
        .from("product-image")
        .remove([`${productId}/`]); // this removes the folder if empty or recursive

      if (deleteFolderError && deleteFolderError.message !== "Not Found") {
        console.error(
          "Error deleting product folder:",
          deleteFolderError.message
        );
      }

      // 4️⃣ Delete the product from DB
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("product_id", productId);

      if (error) {
        console.error("Error deleting product:", error.message);
      } else {
        fetchProducts();
      }
    } catch (err) {
      console.error("Unexpected error deleting product:", err);
    }
  };

  const handleDeleteImage = async (product: Product, imageIndex: number) => {
    const imageToDelete = product.product_image[imageIndex];
    const imagePath = imageToDelete.url.split(
      "/storage/v1/object/public/product-image/"
    )[1];

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

  // Add pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="items-center flex flex-col gap-3 p-4">
      <h1 className=" text-indigo-500 font-extrabold text-3xl select-text">
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
      <div className="text-center overflow-x-scroll overflow-y-hidden">
        <table className="border">
          <thead className="text-indigo-500 bg-gray-900">
            <tr>
              <th className="py-2 px-4 border">Product ID</th>
              <th className="py-2 px-4 border">Product Name</th>
              <th className="py-2 px-4 border w-64">Description</th>
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
            {currentProducts.map((product) => (
              <tr
                key={product.product_id}
                className="hover:bg-[#1b2733] transition-colors"
              >
                {/* Product ID */}
                <td className="py-2 px-4 border text-gray-300 break-all max-w-xs">
                  {product.product_id}
                </td>

                {/* Product Name */}
                <td className="py-2 px-4 border text-indigo-400 font-semibold">
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
                      className="py-2 px-2 border bg-black border-white w-full rounded"
                    />
                  ) : (
                    product.product_name
                  )}
                </td>

                {/* Product Description */}
                <td className="py-2 px-4 border text-gray-300 whitespace-normal break-words max-w-sm">
                  {editingProduct?.product_id === product.product_id ? (
                    <textarea
                      rows={2}
                      value={editingProduct.product_description}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          product_description: e.target.value,
                        })
                      }
                      className="py-2 px-2 border bg-black border-white w-full rounded resize-none"
                    />
                  ) : (
                    <span className="line-clamp-3">
                      {product.product_description}
                    </span>
                  )}
                </td>

                {/* MRP */}
                <td className="py-2 px-4 border text-gray-300 text-center">
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
                      className="py-1 px-2 border bg-black border-white w-full rounded"
                    />
                  ) : (
                    `₹${product.product_MRP}`
                  )}
                </td>

                {/* Discount */}
                <td className="py-2 px-4 border text-center text-gray-300">
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
                      className="py-1 px-2 border bg-black border-white w-full rounded"
                    />
                  ) : (
                    `${product.product_discount}%`
                  )}
                </td>

                {/* SP */}
                <td className="py-2 px-4 border text-gray-300 text-center">
                  ₹{product.product_SP}
                </td>

                {/* Amount */}
                <td className="py-2 px-4 border text-gray-300 text-center">
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
                      className="py-1 px-2 border bg-black border-white w-full rounded"
                    />
                  ) : (
                    product.product_amount
                  )}
                </td>

                {/* Category */}
                <td className="py-2 px-4 border text-cyan-400 font-bold text-center">
                  {product.product_category}
                </td>

                {/* Images */}
                <td className="py-2 px-4 border text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {product.product_image.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image.url}
                          alt={`Product ${product.product_id} Image ${index}`}
                          className="h-16 w-16 object-cover rounded-md border"
                          width={64}
                          height={64}
                        />
                        {editingProduct?.product_id ===
                          product.product_id && (
                          <button
                            onClick={() => handleDeleteImage(product, index)}
                            className="absolute top-0 right-0 bg-black bg-opacity-70 text-white rounded-full p-1 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {editingProduct?.product_id === product.product_id && (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed border-gray-400 rounded-md p-2 mt-2 flex items-center flex-col text-gray-400 cursor-pointer hover:border-indigo-500 transition"
                    >
                      <input {...getInputProps()} multiple />
                      <CloudUpload className="mb-1" />
                      <p className="text-xs">Upload new image</p>
                    </div>
                  )}
                </td>

                {/* Sellable */}
                <td className="py-2 px-4 border text-center text-gray-300">
                  {editingProduct?.product_id === product.product_id ? (
                    <select
                      value={editingProduct.show_product ? "true" : "false"}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          show_product: e.target.value === "true",
                        })
                      }
                      className="py-1 px-2 border bg-black border-white rounded w-full"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : product.show_product ? (
                    <span className="text-green-400">True</span>
                  ) : (
                    <span className="text-red-400">False</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-2 px-4 border text-center">
                  {editingProduct?.product_id === product.product_id ? (
                    <button
                      onClick={handleSave}
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md w-full transition"
                    >
                      Save
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md w-full transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteProduct(product.product_id)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md w-full transition"
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

        {/* Add pagination controls */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Previous
            </button>

            {(() => {
              // Show a sliding window of page buttons (max 10)
              const maxButtons = 10;
              if (totalPages <= maxButtons) {
                return [...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === index + 1
                        ? "bg-indigo-500"
                        : "bg-gray-500 hover:bg-gray-600"
                    } text-white`}
                  >
                    {index + 1}
                  </button>
                ));
              }

              const half = Math.floor(maxButtons / 2);
              let start = Math.max(1, currentPage - half);
              const end = Math.min(totalPages, start + maxButtons - 1);

              if (end - start + 1 < maxButtons) {
                start = Math.max(1, end - maxButtons + 1);
              }

              const buttons = [];
              for (let i = start; i <= end; i++) {
                buttons.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === i ? "bg-indigo-500" : "bg-gray-500 hover:bg-gray-600"
                    } text-white`}
                  >
                    {i}
                  </button>
                );
              }

              return buttons;
            })()}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
