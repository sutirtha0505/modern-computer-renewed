// components/CategorySection.tsx
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabaseClient';
import DropdownForPBC from './DropdownForPBC';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineCloudUpload } from "react-icons/ai";
import Image from 'next/image';

type DropdownOption = {
  product_category: string;
};
interface Product {
  product_category: string;
  product_main_category?: string; // Add other fields as needed
  category_product_image?: string;
}

const CategorySection: React.FC = () => {
  const [category, setCategory] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<DropdownOption[]>([]);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('product_category');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      // Extract distinct categories
      const distinctCategories = Array.from(new Set(data.map((item: Product) => item.product_category)))
        .map((category) => ({
          product_category: category
        }));

      setDropdownOptions(distinctCategories);
    };

    fetchOptions();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      toast.error('Only one image upload is supported');
      return;
    }
    setImage(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSave = async () => {
    if (!category || selectedOptions.length === 0) {
      toast.error('Please input a category and select at least one option');
      return;
    }

    // Find rows with matching product_category
    const productCategories = selectedOptions.map(option => option.product_category);
    const { error: fetchError } = await supabase
      .from('products')
      .select('*')
      .in('product_category', productCategories);

    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }

    // Update product_main_category for matching rows
    const { error: updateError } = await supabase
      .from('products')
      .update({ product_main_category: category })
      .in('product_category', productCategories);

    if (updateError) {
      console.error('Error updating main category:', updateError);
      return;
    }

    if (image) {
      const imagePath = `product_by_category/${category}/${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from('product-image')
        .upload(imagePath, image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-image')
        .getPublicUrl(imagePath);

      const imageUrl = publicUrlData.publicUrl;

      // Update the image URL for matching rows
      const { error: imageUpdateError } = await supabase
        .from('products')
        .update({ category_product_image: imageUrl })
        .in('product_category', productCategories);

      if (imageUpdateError) {
        console.error('Error updating image URL:', imageUpdateError);
      }
    }

    toast.success('Product Main Category Uploaded successfully');
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  return (
    <div className="flex rounded-md flex-col justify-center items-center space-y-4">
      <ToastContainer />
      <div {...getRootProps({ className: 'w-24 h-24 border-dashed border-2 border-gray-300 rounded-full flex items-center justify-center cursor-pointer' })}>
        <input {...getInputProps()} />
        {image ? (
          <Image src={URL.createObjectURL(image)} alt="Uploaded" className="w-full h-full object-cover rounded-full" width={500} height={500} />
        ) : (
          <AiOutlineCloudUpload className='w-8 h-8'/>
        )}
      </div>
      <input
        type="text"
        placeholder="Input product category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border bg-transparent border-gray-300 p-2"
      />
      <DropdownForPBC options={dropdownOptions} onSelect={setSelectedOptions} />
      <button onClick={handleSave} className="p-2 bg-blue-500 text-white rounded">Save</button>
    </div>
  );
};

export default CategorySection;
