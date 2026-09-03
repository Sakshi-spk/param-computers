import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * ==========================================
   * LOAD PRODUCTS
   * ==========================================
   */

  async function loadProducts() {
    try {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Product loading error:", error);

        setErrorMessage(error.message);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error("Unexpected error:", error);

      setErrorMessage(
        error?.message || "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /*
   * ==========================================
   * TOGGLE ACTIVE / HIDDEN
   * ==========================================
   */

  async function handleToggleActive(product) {
    try {
      const newActiveStatus = !product.is_active;

      const { error } = await supabase
        .from("products")
        .update({
          is_active: newActiveStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (error) {
        console.error(
          "Product visibility update error:",
          error
        );

        alert(error.message);
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                is_active: newActiveStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Unexpected visibility update error:",
        error
      );

      alert(
        error?.message ||
          "Unable to update product visibility."
      );
    }
  }

  /*
   * ==========================================
   * DELETE PRODUCT
   * ==========================================
   */

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) {
        console.error(
          "Product delete error:",
          error
        );

        alert(error.message);
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item.id !== product.id
        )
      );
    } catch (error) {
      console.error(
        "Unexpected delete error:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete product."
      );
    }
  }

  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  const filteredProducts = products.filter(
    (product) => {
      const search = searchTerm
        .trim()
        .toLowerCase();

      if (!search) {
        return true;
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.brand
          ?.toLowerCase()
          .includes(search) ||
        product.category
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  /*
   * ==========================================
   * PAGE
   * ==========================================
   */

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#C6922F]">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#0F2B5B]">
              Products
            </h1>

            <p className="mt-2 text-sm text-[#718096]">
              Manage your products, inventory and visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/products/add")
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17396F]"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* SEARCH */}

        <div className="mt-7">
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search products, brands or categories..."
              className="w-full rounded-xl border border-[#DDE3EA] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
            />
          </div>
        </div>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />

            <p className="mt-4 text-sm text-[#718096]">
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E3E9F1] bg-white px-6 py-16 text-center">
            <Package
              size={42}
              className="mx-auto text-[#94A3B8]"
            />

            <h3 className="mt-4 text-lg font-semibold text-[#0F2B5B]">
              No products found
            </h3>

            <p className="mt-2 text-sm text-[#718096]">
              {products.length === 0
                ? "Add your first product to get started."
                : "Try a different search."}
            </p>

            {products.length === 0 && (
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/products/add")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0F2B5B] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">

                {/* TABLE HEADER */}

                <thead className="border-b border-[#E3E9F1] bg-[#F8FAFC]">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Product
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Price
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Stock
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>
                  {filteredProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-b border-[#EEF2F6] last:border-b-0"
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-4">

                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[#E3E9F1] bg-[#F8FAFC]">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
                                  <Package size={22} />
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-[#0F2B5B]">
                                {product.name}
                              </p>

                              {product.brand && (
                                <p className="mt-1 text-xs text-[#718096]">
                                  {product.brand}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-5">
                          <span className="rounded-lg bg-[#F1F5F9] px-3 py-1.5 text-xs font-medium text-[#475569]">
                            {product.category || "—"}
                          </span>
                        </td>

                        {/* PRICE */}

                        <td className="px-5 py-5">
                          {product.original_price &&
                          Number(product.original_price) >
                            Number(product.price) ? (
                            <div>
                              <div className="text-xs text-[#94A3B8] line-through">
                                ₹
                                {Number(
                                  product.original_price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </div>

                              <div className="mt-1 font-bold text-[#0F2B5B]">
                                ₹
                                {Number(
                                  product.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="font-bold text-[#0F2B5B]">
                              ₹
                              {Number(
                                product.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </div>
                          )}
                        </td>

                        {/* STOCK */}

                        <td className="px-5 py-5">
                          {Number(product.stock) > 0 ? (
                            <span className="font-semibold text-green-600">
                              {product.stock}
                            </span>
                          ) : (
                            <span className="font-semibold text-red-600">
                              0
                            </span>
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">
                          <div className="flex flex-col gap-2">

                            {product.is_active ? (
                              <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                Hidden
                              </span>
                            )}

                            {Number(product.stock) === 0 &&
                              product.is_active && (
                                <span className="inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                  Out of Stock
                                </span>
                              )}

                          </div>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">
                          <div className="flex items-center justify-end gap-2">

                            {/* SHOW / HIDE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleActive(
                                  product
                                )
                              }
                              title={
                                product.is_active
                                  ? "Hide product"
                                  : "Show product"
                              }
                              aria-label={
                                product.is_active
                                  ? "Hide product"
                                  : "Show product"
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE3EA] text-[#0F2B5B] transition hover:bg-[#F7F9FC]"
                            >

                              {/* ACTIVE = OPEN EYE */}

                              {product.is_active ? (
                                <Eye size={17} />
                              ) : (
                                <EyeOff size={17} />
                              )}

                            </button>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/products/edit/${product.id}`
                                )
                              }
                              title="Edit product"
                              aria-label="Edit product"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE3EA] text-[#0F2B5B] transition hover:bg-[#F7F9FC]"
                            >
                              <Pencil size={17} />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(product)
                              }
                              title="Delete product"
                              aria-label="Delete product"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}