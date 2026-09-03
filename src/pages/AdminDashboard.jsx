import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Package,
  Plus,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  async function loadDashboard() {

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


      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
        .order("created_at", {
          ascending: false,
        });


      if (error) {

        console.error(
          "Dashboard product loading error:",
          error
        );

        setErrorMessage(error.message);

        return;
      }


      setProducts(data || []);

    } catch (error) {

      console.error(
        "Unexpected dashboard error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to load dashboard."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadDashboard();
  }, []);


  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.is_active
  ).length;

  const hiddenProducts = products.filter(
    (product) => !product.is_active
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock) <= 0
  ).length;

  const recentProducts =
    products.slice(0, 5);


  return (
    <div className="min-h-screen bg-[#FBF9F6]">

      {/* =========================
          ADMIN NAVBAR
      ========================= */}

      


      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-semibold text-[#C6922F]">
              Admin Panel
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#0F2B5B]">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#718096]">
              Manage your Param Computers store from one place.
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


        {/* =========================
            ERROR
        ========================= */}

        {errorMessage && (

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <AlertCircle
              size={18}
              className="mt-0.5 flex-shrink-0"
            />

            <p>
              {errorMessage}
            </p>

          </div>

        )}


        {/* =========================
            LOADING
        ========================= */}

        {loading ? (

          <div className="py-24 text-center">

            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />

            <p className="mt-4 text-sm text-[#718096]">
              Loading dashboard...
            </p>

          </div>

        ) : (

          <>

            {/* =========================
                STAT CARDS
            ========================= */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* TOTAL */}

              <div className="rounded-2xl border border-[#E3E9F1] bg-white p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-[#718096]">
                      Total Products
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#0F2B5B]">
                      {totalProducts}
                    </p>

                  </div>


                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF4FF] text-[#0F2B5B]">
                    <Package size={22} />
                  </div>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/products")
                  }
                  className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0F2B5B] hover:text-[#C6922F]"
                >
                  Manage products
                  <ArrowRight size={14} />
                </button>

              </div>


              {/* ACTIVE */}

              <div className="rounded-2xl border border-[#E3E9F1] bg-white p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-[#718096]">
                      Active Products
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                      {activeProducts}
                    </p>

                  </div>


                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Eye size={22} />
                  </div>

                </div>


                <p className="mt-4 text-xs text-[#718096]">
                  Currently visible in your store
                </p>

              </div>


              {/* HIDDEN */}

              <div className="rounded-2xl border border-[#E3E9F1] bg-white p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-[#718096]">
                      Hidden Products
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-600">
                      {hiddenProducts}
                    </p>

                  </div>


                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <EyeOff size={22} />
                  </div>

                </div>


                <p className="mt-4 text-xs text-[#718096]">
                  Products currently hidden
                </p>

              </div>


              {/* OUT OF STOCK */}

              <div className="rounded-2xl border border-[#E3E9F1] bg-white p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-sm font-medium text-[#718096]">
                      Out of Stock
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-600">
                      {outOfStockProducts}
                    </p>

                  </div>


                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertCircle size={22} />
                  </div>

                </div>


                <p className="mt-4 text-xs text-[#718096]">
                  Products needing restocking
                </p>

              </div>

            </div>


            {/* =========================
                RECENT PRODUCTS
            ========================= */}

            <section className="mt-8">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-[#0F2B5B]">
                    Recent Products
                  </h2>

                  <p className="mt-1 text-sm text-[#718096]">
                    Your latest products added to the database.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/products")
                  }
                  className="hidden items-center gap-1 text-sm font-semibold text-[#0F2B5B] hover:text-[#C6922F] sm:flex"
                >
                  View all
                  <ArrowRight size={15} />
                </button>

              </div>


              {recentProducts.length === 0 ? (

                <div className="mt-4 rounded-2xl border border-[#E3E9F1] bg-white p-10 text-center">

                  <Package
                    size={36}
                    className="mx-auto text-[#94A3B8]"
                  />

                  <p className="mt-3 font-semibold text-[#0F2B5B]">
                    No products yet
                  </p>

                  <p className="mt-1 text-sm text-[#718096]">
                    Add your first product to get started.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/products/add")
                    }
                    className="mt-5 rounded-xl bg-[#0F2B5B] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Add Product
                  </button>

                </div>

              ) : (

                <div className="mt-4 overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white">

                  {recentProducts.map(
                    (product, index) => (

                      <div
                        key={product.id}
                        className={`flex items-center justify-between gap-4 p-4 sm:p-5 ${
                          index !==
                          recentProducts.length - 1
                            ? "border-b border-[#EEF2F6]"
                            : ""
                        }`}
                      >

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-[#E3E9F1] bg-[#F8FAFC]">

                            {product.image_url ? (

                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
                                <Package size={20} />
                              </div>

                            )}

                          </div>


                          <div className="min-w-0">

                            <p className="truncate font-semibold text-[#0F2B5B]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-[#718096]">
                              {product.brand ||
                                product.category ||
                                "Product"}
                            </p>

                          </div>

                        </div>


                        <div className="flex flex-shrink-0 items-center gap-3">

                          <span className="hidden text-sm font-bold text-[#0F2B5B] sm:block">
                            ₹
                            {Number(
                              product.price || 0
                            ).toLocaleString("en-IN")}
                          </span>


                          {product.is_active ? (

                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle2 size={13} />
                              Active
                            </span>

                          ) : (

                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                              Hidden
                            </span>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>

          </>

        )}

      </main>

    </div>
  );
}