import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  ShoppingCart,
  Check,
} from "lucide-react";

import { getFeaturedProducts } from "../../lib/products";
import { addToCart } from "../../lib/cart";

import {
  getWishlistIds,
  toggleWishlist,
  WISHLIST_UPDATED_EVENT,
} from "../../lib/wishlist";

function FeaturedProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedProductId, setAddedProductId] =
    useState(null);

  /*
   * Scroll reveal animation
   */
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.12,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Wishlist now uses the centralized
   * wishlist.js system.
   *
   * Only product IDs are stored.
   */
  const [wishlistIds, setWishlistIds] = useState(
    () => getWishlistIds()
  );

  /*
   * Keep wishlist synchronized with:
   *
   * - Navbar
   * - Products page
   * - Wishlist page
   * - Product Details page
   * - Other Featured Product cards
   */
  useEffect(() => {
    function handleWishlistUpdated(event) {
      const ids = event.detail?.ids;

      if (Array.isArray(ids)) {
        setWishlistIds(
          ids.map((id) => String(id))
        );
      } else {
        setWishlistIds(getWishlistIds());
      }
    }

    /*
     * Fallback for changes made in another
     * browser tab/window.
     */
    function handleStorageChange(event) {
      if (
        event.key === "wishlist"
      ) {
        setWishlistIds(
          getWishlistIds()
        );
      }
    }

    /*
     * Refresh when browser tab becomes active.
     */
    function handleFocus() {
      setWishlistIds(
        getWishlistIds()
      );
    }

    window.addEventListener(
      WISHLIST_UPDATED_EVENT,
      handleWishlistUpdated
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "focus",
      handleFocus
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

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  /*
   * Load featured products.
   */
  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getFeaturedProducts();

        if (mounted) {
          setProducts(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (err) {
        console.error(
          "Featured products error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load featured products."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Open product details.
   */
  function openProduct(product) {
    if (
      !product ||
      !product.slug
    ) {
      console.error(
        "Product slug is missing:",
        product
      );

      return;
    }

    navigate(
      "/product/" + product.slug
    );
  }

  /*
   * Add product to cart.
   */
  function handleAddToCart(
    event,
    product
  ) {
    event.stopPropagation();

    if (!product) {
      return;
    }

    if (
      Number(product.stock) <= 0
    ) {
      return;
    }

    addToCart(product);

    setAddedProductId(
      product.id
    );

    window.setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  }

  /*
   * Add/remove product from wishlist.
   *
   * This now uses the SAME function as:
   *
   * ProductDetails
   * Products
   * Wishlist
   * Navbar
   */
  function handleWishlist(
    event,
    product
  ) {
    event.stopPropagation();

    if (
      !product ||
      product.id === null ||
      product.id === undefined
    ) {
      return;
    }

    const result =
      toggleWishlist(
        product.id
      );

    /*
     * Immediately update this component.
     *
     * wishlist.js also broadcasts the
     * wishlistUpdated event.
     */
    setWishlistIds(
      result.ids.map((id) =>
        String(id)
      )
    );
  }

  /*
   * Check whether product is wishlisted.
   */
  function isWishlisted(product) {
    if (
      !product ||
      product.id === null ||
      product.id === undefined
    ) {
      return false;
    }

    return wishlistIds.includes(
      String(product.id)
    );
  }

  /*
   * Go to wishlist.
   */
  function goToWishlist() {
    navigate("/wishlist");
  }

  return (
    <section
      ref={sectionRef}
      className="bg-white"
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">

        {/* HEADER */}

        <div
          className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between transition-all duration-700 ease-out ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
              Featured Products
            </p>

            <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#0F2B5B] sm:text-5xl">
              Quality Technology,
              <br />
              Ready for You
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5B6F86] sm:text-lg">
              Explore our currently available technology products,
              quality tested and selected for reliable performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">

            {/* WISHLIST LINK */}

            <button
              type="button"
              onClick={goToWishlist}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#C6922F] transition hover:gap-3"
            >
              <Heart size={17} />

              Wishlist

              {wishlistIds.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C6922F] px-1.5 text-xs text-white">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* VIEW ALL */}

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById(
                    "categories"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#2563EB] transition hover:gap-3"
            >
              View All Products

              <ArrowRight size={17} />
            </button>

          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div
            className={`mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >

            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-[430px] animate-pulse rounded-3xl border border-[#E5EAF0] bg-[#F7FAFE]"
                />
              )
            )}

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div
            className={`mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600 transition-all duration-700 ease-out ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {error}
          </div>
        )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {products.map(
                (product, index) => {
                  const wishlisted =
                    isWishlisted(
                      product
                    );

                  return (
                    <article
                      key={product.id}
                      onClick={() =>
                        openProduct(
                          product
                        )
                      }
                      className={`group cursor-pointer overflow-hidden rounded-3xl border border-[#E3E9F1] bg-white shadow-[0_4px_20px_rgba(15,43,91,0.04)] transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,43,91,0.10)] ${
                        isVisible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-10 opacity-0"
                      }`}
                      style={{
                        transitionDelay: isVisible
                          ? `${index * 120}ms`
                          : "0ms",
                      }}
                    >

                      {/* IMAGE */}

                      <div className="relative h-[250px] overflow-hidden bg-[#F7FAFE]">

                        {product.image_url ? (
                          <img
                            src={
                              product.image_url
                            }
                            alt={
                              product.name ||
                              "Product"
                            }
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-[#718096]">
                            No image available
                          </div>
                        )}

                        {/* CONDITION */}

                        {product.condition && (
                          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-[#0F2B5B] px-3 py-1.5 text-xs font-semibold text-white">
                            {product.condition}
                          </span>
                        )}

                        {/* WISHLIST */}

                        <button
                          type="button"
                          aria-label={
                            wishlisted
                              ? `Remove ${product.name} from wishlist`
                              : `Add ${product.name} to wishlist`
                          }
                          onClick={(
                            event
                          ) =>
                            handleWishlist(
                              event,
                              product
                            )
                          }
                          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition ${
                            wishlisted
                              ? "text-red-500 hover:bg-red-50"
                              : "text-[#0F2B5B] hover:bg-[#0F2B5B] hover:text-white"
                          }`}
                        >
                          <Heart
                            size={18}
                            fill={
                              wishlisted
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>

                      </div>

                      {/* DETAILS */}

                      <div className="p-6">

                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6922F]">
                          {product.brand ||
                            "Param Computers"}
                        </p>

                        <h3 className="mt-2 text-xl font-bold leading-tight text-[#0F2B5B]">
                          {product.name}
                        </h3>

                        <p className="mt-2 text-sm text-[#718096]">
                          {product.category ||
                            ""}
                        </p>

                        {/* PRICE */}

                        <div className="mt-5 flex items-end gap-3">

                          <span className="text-2xl font-bold text-[#0F2B5B]">
                            ₹
                            {Number(
                              product.price ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {product.original_price &&
                            Number(
                              product.original_price
                            ) >
                              Number(
                                product.price
                              ) && (
                              <span className="pb-0.5 text-sm text-[#94A3B8] line-through">
                                ₹
                                {Number(
                                  product.original_price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}

                        </div>

                        {/* CART */}

                        <button
                          type="button"
                          disabled={
                            Number(
                              product.stock
                            ) <= 0
                          }
                          onClick={(
                            event
                          ) =>
                            handleAddToCart(
                              event,
                              product
                            )
                          }
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#17396F] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                        >

                          {Number(
                            product.stock
                          ) <= 0 ? (
                            "Out of Stock"
                          ) : addedProductId ===
                            product.id ? (
                            <>
                              <Check
                                size={18}
                              />

                              Added to Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart
                                size={18}
                              />

                              Add to Cart
                            </>
                          )}

                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div
              className={`mt-12 rounded-3xl border border-[#E5EAF0] bg-[#F7FAFE] p-12 text-center transition-all duration-700 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >

              <p className="font-semibold text-[#0F2B5B]">
                No featured products available.
              </p>

              <p className="mt-2 text-sm text-[#718096]">
                Products marked as Featured and Active will appear here.
              </p>

            </div>
          )}

      </div>
    </section>
  );
}

export default FeaturedProducts;