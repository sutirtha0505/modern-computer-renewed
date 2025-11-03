"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type CategoryItem = {
  name: string;
  showInHomepage: boolean;
  count: number;
};

type ProductRow = {
  product_main_category?: string | null;
  show_in_homepage?: boolean | null;
};

const ProductCategoriesInHomepageAdmin: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // fetch category and show_in_homepage flag for all products
        const { data, error } = await supabase
          .from("products")
          .select("product_main_category, show_in_homepage", { count: "exact" })
          .not("product_main_category", "is", null)
          .limit(1000);

        if (error) throw error;

        const map = new Map<string, { showInHomepage: boolean; count: number }>();
        (data || []).forEach((row: ProductRow) => {
          const name = (row.product_main_category || "").toString();
          if (!name) return;
          const prev = map.get(name) || { showInHomepage: false, count: 0 };
          prev.count += 1;
          if (row.show_in_homepage) prev.showInHomepage = true;
          map.set(name, prev);
        });

        const items: CategoryItem[] = Array.from(map.entries()).map(([name, v]) => ({
          name,
          showInHomepage: v.showInHomepage,
          count: v.count,
        }));

        // sort alphabetically
        items.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(items);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) setError(err.message);
        else setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = async (category: string, checked: boolean) => {
    setUpdating(category);
    setError(null);
    try {
      // Update products having exact product_main_category match
      const { error } = await supabase
        .from("products")
        .update({ show_in_homepage: checked })
        .eq("product_main_category", category);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((c) => (c.name === category ? { ...c, showInHomepage: checked } : c))
      );
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-indigo-500 mb-4">Homepage Category Selector</h2>

      <p className="mb-4 text-sm text-gray-400">Toggle categories below to mark their products as shown in homepage (sets <code>show_in_homepage</code> = true/false).</p>

      {error && <div className="mb-4 text-red-400">Error: {error}</div>}

      {loading ? (
        <div className="py-8 text-center text-gray-400">Loading categories…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between gap-3 p-3 border rounded-md bg-indigo-50 dark:bg-slate-800">
              <div>
                <div className="font-semibold text-indigo-700 dark:text-indigo-300">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.count} product(s)</div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cat.showInHomepage}
                    disabled={updating === cat.name}
                    onChange={(e) => toggleCategory(cat.name, e.target.checked)}
                    className="accent-indigo-500 w-5 h-5"
                  />
                </label>
                {updating === cat.name && <div className="text-sm text-gray-400">Updating…</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCategoriesInHomepageAdmin;
