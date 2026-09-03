import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { addToCart } from "../lib/cart";

import {
  getWishlistIds,
  removeFromWishlist,
  WISHLIST_UPDATED_EVENT,
} from "../lib/wishlist";

export default function Wishlist() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /*
   * Always open wishlist at top.
   */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /*
   * Initial wishlist load.
   */
  useEffect(() => {
    loadWishlist();
  }, []);

  /*
   * Listen for wishlist changes from
   * every other component.
   */
  useEffect(() => {
    function handleWishlistUpdated() {
      /*
       * Reload products immediately.
       */
      loadWishlist();
    }

    function handleStorageChange(event) {
      /*
       * Keep this as a fallback for changes
       * from another browser tab.
       */
      if (
        event.key === "wishlist"
      ) {
        loadWishlist();
      }
    }

    window.addEventListener(
      WISHLIST_UPDATED_EVENT,
      handleWishlistUpdated
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        WISHLIST_UPDATED_EVENT,
        handleWishlistUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /*
   * Reload wishlist when the browser tab
   * becomes active.
   */
  useEffect(() => {
    function handleFocus() {
      loadWishlist();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  /*
   * Load wishlist products.
   */
  async function loadWishlist() {
    try {
      setLoading(true);
      setErrorMessage("");

      /*
       * Get IDs directly from localStorage.
       */
      const ids = getWishlistIds();

      if (ids.length === 0) {
        setProducts([]);
        return;
      }

      /*
       * Normalize IDs.
       */
      const cleanIds = ids
        .map((id) =>
          String(id).trim()
        )
        .filter(Boolean);

      if (cleanIds.length === 0) {
        setProducts([]);
        return;
      }

      /*
       * Fetch products from Supabase.
       */
      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
        .in("id", cleanIds)
        .eq("is_active", true);

      if (error) {
        console.error(
          "Wishlist products error:",
          error
        );

        setErrorMessage(
          "Unable to load your wishlist. Please try again."
        );

        return;
      }

      /*
       * Keep exactly the same order
       * as the wishlist IDs.
       */
      const orderedProducts =
        cleanIds
          .map((id) =>
            (data || []).find(
              (product) =>
                String(product.id) ===
                String(id)
            )
          )
          .filter(Boolean);

      setProducts(
        orderedProducts
      );
    } catch (error) {
      console.error(
        "Wishlist loading error:",
        error
      );

      setErrorMessage(
        "Unable to load your wishlist."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Remove product from wishlist.
   */
  function handleRemove(productId) {
    if (
      productId === null ||
      productId === undefined
    ) {
      return;
    }

    /*
     * removeFromWishlist()
     * updates localStorage AND
     * dispatches wishlistUpdated.
     */
    removeFromWishlist(
      productId
    );

    /*
     * Immediately remove from UI.
     */
    setProducts((current) =>
      current.filter(
        (product) =>
          String(product.id) !==
          String(productId)
      )
    );
  }

  /*
   * Add product to cart.
   */
  function handleAddToCart(product) {
    if (!product) {
      return;
    }

    if (
      Number(product.stock) <= 0
    ) {
      return;
    }

    addToCart(product);
  }

  /*
   * Open product details.
   */
  function openProduct(product) {
    if (!product?.slug) {
      return;
    }

    navigate(
      `/product/${product.slug}`
    );
  }

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <section className="min-h-screen bg-[#FBF9F6]">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="animate-pulse">

            <div className="h-10 w-56 rounded-lg bg-gray-200" />

            <div className="mt-10 h-72 rounded-3xl bg-gray-200" />

          </div>

        </div>

      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FBF9F6]">

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition hover:text-[#0F2B5B]"
        >
          <ArrowLeft size={17} />

          Continue Shopping
        </button>

        {/* HEADER */}

        <div className="mt-8 flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F2B5B] text-white">

            <Heart
              size={25}
              fill="currentColor"
            />

          </div>

          <div>

            <h1 className="text-3xl font-bold text-[#0F2B5B] sm:text-4xl">
              My Wishlist
            </h1>

            <p className="mt-1 text-sm text-[#718096]">
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}{" "}
              saved
            </p>

          </div>

        </div>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* EMPTY WISHLIST */}

        {products.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-[#E3E9F1] bg-white p-12 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7FAFE] text-[#0F2B5B]">
              <Heart size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#0F2B5B]">
              Your wishlist is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#718096]">
              Save products you like by clicking
              the heart icon. You can come back
              here anytime to view them.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="mt-7 rounded-xl bg-[#0F2B5B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17396F]"
            >
              Explore Products
            </button>

          </div>
        ) : (

          /* PRODUCTS */

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {products.map(
              (product) => (

                <article
                  key={product.id}
                  className="overflow-hidden rounded-3xl border border-[#E3E9F1] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  {/* IMAGE */}

                  <div className="relative h-64 bg-[#F7FAFE]">

                    <button
                      type="button"
                      onClick={() =>
                        openProduct(
                          product
                        )
                      }
                      className="h-full w-full"
                    >

                      {product.image_url ? (
                        <img
                          src={
                            product.image_url
                          }
                          alt={
                            product.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                          No image
                        </div>
                      )}

                    </button>

                    {/* REMOVE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          product.id
                        )
                      }
                      aria-label="Remove from wishlist"
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                  {/* PRODUCT INFO */}

                  <div className="p-6">

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6922F]">
                      {product.brand ||
                        "Param Computers"}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        openProduct(
                          product
                        )
                      }
                      className="mt-2 text-left"
                    >
                      <h2 className="text-xl font-bold text-[#0F2B5B] transition hover:text-[#2563EB]">
                        {product.name}
                      </h2>
                    </button>

                    {product.category && (
                      <p className="mt-2 text-sm text-[#718096]">
                        {product.category}
                      </p>
                    )}

                    {/* PRICE */}

                    <div className="mt-4">

                      <p className="text-2xl font-bold text-[#0F2B5B]">
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      {product.original_price &&
                        Number(
                          product.original_price
                        ) >
                          Number(
                            product.price
                          ) && (
                          <p className="mt-1 text-sm text-gray-400 line-through">
                            ₹
                            {Number(
                              product.original_price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        )}

                    </div>

                    {/* STOCK */}

                    <div className="mt-3">

                      {Number(
                        product.stock
                      ) <= 0 ? (
                        <span className="text-xs font-semibold text-red-600">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-green-600">
                          In Stock
                        </span>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          openProduct(
                            product
                          )
                        }
                        className="rounded-xl border border-[#DDE5EF] px-4 py-3 text-sm font-semibold text-[#0F2B5B] transition hover:border-[#0F2B5B] hover:bg-[#F7F9FC]"
                      >
                        View Product
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                        disabled={
                          Number(
                            product.stock
                          ) <= 0
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#17396F] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        <ShoppingCart
                          size={17}
                        />

                        {Number(
                          product.stock
                        ) <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>

    </section>
  );
}