import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingCart,
  Heart,
  MessageCircle,
  Share2,
  X,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  ExternalLink,
  Video,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { addToCart } from "../lib/cart";

import {
  isWishlisted,
  toggleWishlist,
  WISHLIST_UPDATED_EVENT,
} from "../lib/wishlist";

export default function ProductDetails() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isProductWishlisted, setIsProductWishlisted] =
    useState(false);

  const [cartAdded, setCartAdded] = useState(false);

  const [isImageZoomOpen, setIsImageZoomOpen] =
    useState(false);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  const [relatedLoading, setRelatedLoading] =
    useState(false);

  /*
   * Always start product page at top.
   */
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [slug]);

  /*
   * Load product whenever slug changes.
   */
  useEffect(() => {
    loadProduct();
  }, [slug]);

  /*
   * Listen for wishlist changes.
   */
  useEffect(() => {
    function handleWishlistUpdated(event) {
      if (!product?.id) {
        return;
      }

      const changedProductId =
        event.detail?.productId;

      const ids = event.detail?.ids;

      if (Array.isArray(ids)) {
        const normalizedIds = ids.map((id) =>
          String(id)
        );

        setIsProductWishlisted(
          normalizedIds.includes(
            String(product.id)
          )
        );

        return;
      }

      if (
        changedProductId === null ||
        changedProductId === undefined
      ) {
        setIsProductWishlisted(
          isWishlisted(product.id)
        );

        return;
      }

      if (
        String(changedProductId) ===
        String(product.id)
      ) {
        setIsProductWishlisted(
          Boolean(event.detail?.wishlisted)
        );
      }
    }

    window.addEventListener(
      WISHLIST_UPDATED_EVENT,
      handleWishlistUpdated
    );

    return () => {
      window.removeEventListener(
        WISHLIST_UPDATED_EVENT,
        handleWishlistUpdated
      );
    };
  }, [product]);

  /*
   * Whenever product changes,
   * check wishlist state.
   */
  useEffect(() => {
    if (!product?.id) {
      setIsProductWishlisted(false);
      return;
    }

    setIsProductWishlisted(
      isWishlisted(product.id)
    );
  }, [product]);

  /*
   * Refresh wishlist when browser
   * tab becomes active again.
   */
  useEffect(() => {
    function refreshWishlistState() {
      if (!product?.id) {
        return;
      }

      setIsProductWishlisted(
        isWishlisted(product.id)
      );
    }

    window.addEventListener(
      "focus",
      refreshWishlistState
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshWishlistState
      );
    };
  }, [product]);

  /*
   * Close image zoom with Escape.
   */
  useEffect(() => {
    function handleEscape(event) {
      if (
        event.key === "Escape" &&
        isImageZoomOpen
      ) {
        setIsImageZoomOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isImageZoomOpen]);

  /*
   * Load product from Supabase.
   */
  async function loadProduct() {
    try {
      setLoading(true);
      setErrorMessage("");

      /*
       * Reset old product state first.
       */
      setProduct(null);
      setImages([]);
      setSelectedImage("");
      setSelectedIndex(0);
      setVideos([]);
      setIsProductWishlisted(false);
      setRelatedProducts([]);

      const { data, error } =
        await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

      if (error) {
        console.error(
          "Product details error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Unable to load product."
        );

        return;
      }

      if (!data) {
        setErrorMessage(
          "Product not found."
        );

        return;
      }

      setProduct(data);

      /*
       * Prepare product images.
       */
      const productImages =
        Array.isArray(data.images)
          ? data.images.filter(Boolean)
          : [];

      /*
       * Add image_url as first image if
       * it isn't already present.
       */
      if (
        data.image_url &&
        !productImages.includes(
          data.image_url
        )
      ) {
        productImages.unshift(
          data.image_url
        );
      }

      setImages(productImages);

      const productVideos =
        Array.isArray(data.videos)
          ? data.videos.filter(Boolean)
          : [];

      setVideos(productVideos);

      if (productImages.length > 0) {
        setSelectedImage(
          productImages[0]
        );

        setSelectedIndex(0);
      }

      /*
       * Check wishlist after product
       * has loaded.
       */
      setIsProductWishlisted(
        isWishlisted(data.id)
      );

      /*
       * Load related products.
       */
      if (data.category) {
        loadRelatedProducts(
          data.category,
          data.id
        );
      }
    } catch (error) {
      console.error(
        "Unexpected product details error:",
        error
      );

      setProduct(null);

      setErrorMessage(
        error?.message ||
          "Unable to load product."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Load products from the same category.
   *
   * This uses the existing products table.
   * No new Supabase columns are required.
   */
  async function loadRelatedProducts(
    category,
    currentProductId
  ) {
    try {
      setRelatedLoading(true);

      const { data, error } =
        await supabase
          .from("products")
          .select(
            "id, name, slug, price, original_price, image_url, images, brand, condition, stock, category"
          )
          .eq("is_active", true)
          .eq("category", category)
          .neq("id", currentProductId)
          .limit(4);

      if (error) {
        console.error(
          "Related products error:",
          error
        );

        setRelatedProducts([]);
        return;
      }

      setRelatedProducts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Unexpected related products error:",
        error
      );

      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  }

  /*
   * Wishlist button.
   */
  function handleWishlist() {
    if (!product?.id) {
      return;
    }

    const result =
      toggleWishlist(product.id);

    setIsProductWishlisted(
      Boolean(result.wishlisted)
    );
  }

  /*
   * Select image.
   */
  function selectImage(index) {
    if (!images[index]) {
      return;
    }

    setSelectedIndex(index);
    setSelectedImage(images[index]);
  }

  /*
   * Previous image.
   */
  function showPreviousImage() {
    if (images.length <= 1) {
      return;
    }

    const newIndex =
      selectedIndex === 0
        ? images.length - 1
        : selectedIndex - 1;

    selectImage(newIndex);
  }

  /*
   * Next image.
   */
  function showNextImage() {
    if (images.length <= 1) {
      return;
    }

    const newIndex =
      selectedIndex ===
      images.length - 1
        ? 0
        : selectedIndex + 1;

    selectImage(newIndex);
  }

  /*
   * Add to cart.
   */
  function handleAddToCart() {
    if (!product) {
      return;
    }

    if (Number(product.stock) <= 0) {
      return;
    }

    addToCart(product);

    setCartAdded(true);

    window.setTimeout(() => {
      setCartAdded(false);
    }, 2000);
  }

  /*
   * Format price.
   */
  function formatPrice(value) {
    return Number(
      value || 0
    ).toLocaleString("en-IN");
  }

  /*
   * Calculate discount.
   */
  function getDiscountPercentage() {
    if (
      !product?.original_price ||
      !product?.price
    ) {
      return 0;
    }

    const original =
      Number(product.original_price);

    const current =
      Number(product.price);

    if (
      original <= current ||
      original <= 0
    ) {
      return 0;
    }

    return Math.round(
      ((original - current) /
        original) *
        100
    );
  }

  /*
   * WhatsApp enquiry.
   *
   * Product name is automatically
   * inserted into the message.
   */
  function handleWhatsAppEnquiry() {
    if (!product?.name) {
      return;
    }

    const message =
      `Hello, I am interested in "${product.name}". Please share more details about this product.`;

    const whatsappUrl =
      `https://wa.me/919284480451?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /*
   * Share product.
   *
   * Uses the browser's native sharing
   * feature when available.
   *
   * Falls back to copying the URL.
   */
  async function handleShareProduct() {
    const shareUrl =
      window.location.href;

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title: product?.name ||
            "Param Computers Product",
          text:
            product?.name ||
            "Check out this product from Param Computers.",
          url: shareUrl,
        });

        return;
      }

      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          shareUrl
        );

        window.alert(
          "Product link copied to clipboard."
        );

        return;
      }

      window.prompt(
        "Copy this product link:",
        shareUrl
      );
    } catch (error) {
      /*
       * User cancelling the native
       * share window is not an error
       * that needs to be shown.
       */
      if (
        error?.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "Share product error:",
        error
      );
    }
  }

  /*
   * Get image for a related product.
   */
  function getRelatedProductImage(
    relatedProduct
  ) {
    if (
      relatedProduct?.image_url
    ) {
      return relatedProduct.image_url;
    }

    if (
      Array.isArray(
        relatedProduct?.images
      ) &&
      relatedProduct.images.length > 0
    ) {
      return relatedProduct.images[0];
    }

    return "";
  }

  /*
   * Get discount for a related product.
   */
  function getRelatedDiscount(
    relatedProduct
  ) {
    if (
      !relatedProduct?.original_price ||
      !relatedProduct?.price
    ) {
      return 0;
    }

    const original =
      Number(
        relatedProduct.original_price
      );

    const current =
      Number(
        relatedProduct.price
      );

    if (
      original <= current ||
      original <= 0
    ) {
      return 0;
    }

    return Math.round(
      ((original - current) /
        original) *
        100
    );
  }

  /*
   * Loading screen.
   */
  if (loading) {
    return (
      <section className="min-h-screen bg-[#FBF9F6] px-6 py-20">
        <div className="mx-auto max-w-7xl text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />

          <p className="mt-4 text-sm text-[#718096]">
            Loading product...
          </p>

        </div>
      </section>
    );
  }

  /*
   * Error / product not found.
   */
  if (
    errorMessage ||
    !product
  ) {
    return (
      <section className="min-h-screen bg-[#FBF9F6] px-6 py-20">

        <div className="mx-auto max-w-xl rounded-2xl border border-[#E3E9F1] bg-white p-8 text-center">

          <Package
            size={45}
            className="mx-auto text-[#94A3B8]"
          />

          <h1 className="mt-5 text-2xl font-bold text-[#0F2B5B]">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-[#718096]">
            {errorMessage ||
              "This product is not available."}
          </p>

          <Link
            to="/#categories"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2B5B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#17396F]"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>

        </div>

      </section>
    );
  }

  const discount =
    getDiscountPercentage();

  const isOutOfStock =
    Number(product.stock) <= 0;

  const specifications =
    product.specifications &&
    typeof product.specifications ===
      "object"
      ? Object.entries(
          product.specifications
        )
      : [];

  return (
    <>
      <section className="min-h-screen bg-[#FBF9F6] px-6 py-8">

        <div className="mx-auto max-w-7xl">

          {/* BACK TO PRODUCTS */}

          <Link
            to="/#categories"
            className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0F2B5B] hover:text-[#17396F]"
          >
            <ArrowLeft size={17} />
            Back to Products
          </Link>

          {/* MAIN PRODUCT CARD */}

          <div className="rounded-3xl border border-[#E3E9F1] bg-white p-6 shadow-[0_10px_40px_rgba(15,43,91,0.05)] md:p-8">

            <div className="grid gap-10 lg:grid-cols-2">

              {/* ================================================= */}
              {/* IMAGE SECTION */}
              {/* ================================================= */}

              <div>

                <div
                  className="group relative flex h-[420px] cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-[#E3E9F1] bg-[#F8FAFC]"
                  onClick={() => {
                    if (selectedImage) {
                      setIsImageZoomOpen(true);
                    }
                  }}
                >

                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <Package
                      size={60}
                      className="text-[#94A3B8]"
                    />
                  )}

                  {/* ZOOM LABEL */}

                  {selectedImage && (
                    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#475569] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      Click to enlarge
                    </div>
                  )}

                  {/* PREVIOUS / NEXT */}

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          showPreviousImage();
                        }}
                        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#0F2B5B] shadow-md transition hover:bg-white"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          showNextImage();
                        }}
                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#0F2B5B] shadow-md transition hover:bg-white"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                </div>

                {/* THUMBNAILS */}

                {images.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">

                    {images.map(
                      (image, index) => (
                        <button
                          type="button"
                          key={`${image}-${index}`}
                          onClick={() =>
                            selectImage(index)
                          }
                          className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-[#F8FAFC] transition ${
                            selectedIndex ===
                            index
                              ? "border-[#0F2B5B] shadow-sm"
                              : "border-[#E3E9F1] hover:border-[#94A3B8]"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )
                    )}

                  </div>
                )}

                {videos.length > 0 && (
                  <div className="mt-6">

                    <div className="flex items-center gap-2">
                      <Video
                        size={18}
                        className="text-[#C6922F]"
                      />

                      <h2 className="text-lg font-bold text-[#0F2B5B]">
                        Product Videos
                      </h2>
                    </div>

                    <div className="mt-4 grid gap-4">
                      {videos.map(
                        (video, index) => (
                          <div
                            key={`${video}-${index}`}
                            className="overflow-hidden rounded-2xl border border-[#E3E9F1] bg-[#F8FAFC]"
                          >
                            <video
                              src={video}
                              controls
                              preload="metadata"
                              className="max-h-[420px] w-full object-contain"
                            />

                            <div className="px-4 py-3 text-xs font-semibold text-[#718096]">
                              Product video {index + 1}
                            </div>
                          </div>
                        )
                      )}
                    </div>

                  </div>
                )}

              </div>

              {/* ================================================= */}
              {/* PRODUCT INFORMATION */}
              {/* ================================================= */}

              <div>

                {/* CATEGORY */}

                {product.category && (
                  <span className="inline-flex rounded-full bg-[#EEF3FA] px-3 py-1 text-xs font-semibold text-[#0F2B5B]">
                    {product.category}
                  </span>
                )}

                {/* PRODUCT NAME */}

                <h1 className="mt-4 text-3xl font-bold leading-tight text-[#0F2B5B] md:text-4xl">
                  {product.name}
                </h1>

                {/* BRAND */}

                {product.brand && (
                  <p className="mt-3 text-sm text-[#718096]">
                    Brand:{" "}
                    <span className="font-semibold text-[#334155]">
                      {product.brand}
                    </span>
                  </p>
                )}

                {/* CONDITION */}

                {product.condition && (
                  <p className="mt-2 text-sm text-[#718096]">
                    Condition:{" "}
                    <span className="font-semibold text-[#334155]">
                      {product.condition}
                    </span>
                  </p>
                )}

                {/* PRICE */}

                <div className="mt-7 flex flex-wrap items-center gap-3">

                  <span className="text-3xl font-bold text-[#0F2B5B]">
                    ₹{formatPrice(product.price)}
                  </span>

                  {product.original_price &&
                    Number(
                      product.original_price
                    ) >
                      Number(
                        product.price
                      ) && (
                      <span className="text-lg text-[#94A3B8] line-through">
                        ₹
                        {formatPrice(
                          product.original_price
                        )}
                      </span>
                    )}

                  {discount > 0 && (
                    <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                      {discount}% OFF
                    </span>
                  )}

                </div>

                {/* STOCK */}

                <div className="mt-6">

                  {isOutOfStock ? (
                    <span className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                      <CheckCircle2
                        size={17}
                        className="mr-1.5"
                      />

                      In Stock

                      {Number(product.stock) >
                        0 && (
                        <span className="ml-1">
                          ({product.stock} available)
                        </span>
                      )}
                    </span>
                  )}

                </div>

                {/* DESCRIPTION */}

                {product.description && (
                  <div className="mt-7 border-t border-[#EEF2F6] pt-7">

                    <h2 className="text-lg font-bold text-[#0F2B5B]">
                      Description
                    </h2>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#475569]">
                      {product.description}
                    </p>

                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* CART */}

                  {cartAdded ? (
                    <div className="flex w-full items-center justify-between gap-3 rounded-xl bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">

                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={19} />
                        Added to Cart
                      </div>

                      <Link
                        to="/cart"
                        className="inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline"
                      >
                        View Cart
                        <ExternalLink size={14} />
                      </Link>

                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={
                        handleAddToCart
                      }
                      disabled={
                        isOutOfStock
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#17396F] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                    >
                      <ShoppingCart size={19} />

                      {isOutOfStock
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                  )}

                  {/* WISHLIST */}

                  <button
                    type="button"
                    onClick={
                      handleWishlist
                    }
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-4 text-sm font-semibold transition ${
                      isProductWishlisted
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-[#DDE3EA] bg-white text-[#0F2B5B] hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      size={19}
                      fill={
                        isProductWishlisted
                          ? "currentColor"
                          : "none"
                      }
                    />

                    {isProductWishlisted
                      ? "Added to Wishlist"
                      : "Add to Wishlist"}
                  </button>

                </div>

                {/* WHATSAPP + SHARE */}

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={
                      handleWhatsAppEnquiry
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-5 py-3.5 text-sm font-semibold text-[#0F2B5B] transition hover:border-[#C6922F] hover:bg-[#FFFBF3]"
                  >
                    <MessageCircle
                      size={18}
                      className="text-[#C6922F]"
                    />

                    Enquire on WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleShareProduct
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-5 py-3.5 text-sm font-semibold text-[#0F2B5B] transition hover:border-[#94A3B8] hover:bg-[#F8FAFC]"
                  >
                    <Share2 size={18} />

                    Share Product
                  </button>

                </div>

                {/* TRUST / SUPPORT */}

                <div className="mt-7 grid grid-cols-1 gap-3 border-t border-[#EEF2F6] pt-6 sm:grid-cols-3">

                  <div className="flex items-start gap-2.5">

                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-[#C6922F]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-[#334155]">
                        Quality Support
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#8192AA]">
                        Product assistance available
                      </p>
                    </div>

                  </div>

                  <div className="flex items-start gap-2.5">

                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-[#C6922F]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-[#334155]">
                        Product Details
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#8192AA]">
                        Clear specifications
                      </p>
                    </div>

                  </div>

                  <div className="flex items-start gap-2.5">

                    <Headphones
                      size={19}
                      className="mt-0.5 shrink-0 text-[#C6922F]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-[#334155]">
                        Customer Support
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#8192AA]">
                        Contact us for assistance
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* ================================================= */}
            {/* SPECIFICATIONS */}
            {/* ================================================= */}

            {specifications.length > 0 && (
              <div className="mt-12 border-t border-[#EEF2F6] pt-10">

                <h2 className="text-2xl font-bold text-[#0F2B5B]">
                  Specifications
                </h2>

                <div className="mt-5 overflow-hidden rounded-2xl border border-[#E3E9F1]">

                  <div className="divide-y divide-[#EEF2F6]">

                    {specifications.map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="grid gap-2 px-5 py-4 sm:grid-cols-2"
                        >
                          <div className="font-semibold text-[#334155]">
                            {key}
                          </div>

                          <div className="text-[#64748B]">
                            {String(
                              value ?? ""
                            )}
                          </div>
                        </div>
                      )
                    )}

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* ================================================= */}
          {/* RELATED PRODUCTS */}
          {/* ================================================= */}

          {product.category && (
            <div className="mt-12">

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6922F]">
                    More From This Category
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-[#0F2B5B] md:text-3xl">
                    You May Also Like
                  </h2>
                </div>

                <Link
                  to="/#categories"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F2B5B] hover:text-[#C6922F]"
                >
                  View Products
                  <ArrowLeft
                    size={16}
                    className="rotate-180"
                  />
                </Link>

              </div>

              {relatedLoading ? (
                <div className="mt-6 rounded-2xl border border-[#E3E9F1] bg-white p-8 text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />

                  <p className="mt-3 text-sm text-[#718096]">
                    Loading related products...
                  </p>

                </div>
              ) : relatedProducts.length > 0 ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                  {relatedProducts.map(
                    (relatedProduct) => {
                      const relatedImage =
                        getRelatedProductImage(
                          relatedProduct
                        );

                      const relatedDiscount =
                        getRelatedDiscount(
                          relatedProduct
                        );

                      const relatedOutOfStock =
                        Number(
                          relatedProduct.stock
                        ) <= 0;

                      return (
                        <Link
                          key={
                            relatedProduct.id
                          }
                          to={`/products/${relatedProduct.slug}`}
                          className="group overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_12px_35px_rgba(15,43,91,0.08)]"
                        >

                          {/* RELATED IMAGE */}

                          <div className="relative flex h-52 items-center justify-center overflow-hidden bg-[#F8FAFC]">

                            {relatedImage ? (
                              <img
                                src={
                                  relatedImage
                                }
                                alt={
                                  relatedProduct.name
                                }
                                className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <Package
                                size={45}
                                className="text-[#94A3B8]"
                              />
                            )}

                            {relatedDiscount >
                              0 && (
                              <span className="absolute left-3 top-3 rounded-lg bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                                {
                                  relatedDiscount
                                }
                                % OFF
                              </span>
                            )}

                            {relatedOutOfStock && (
                              <span className="absolute right-3 top-3 rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
                                Out of Stock
                              </span>
                            )}

                          </div>

                          {/* RELATED INFORMATION */}

                          <div className="p-4">

                            {relatedProduct.brand && (
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94A3B8]">
                                {
                                  relatedProduct.brand
                                }
                              </p>
                            )}

                            <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-[#0F2B5B]">
                              {
                                relatedProduct.name
                              }
                            </h3>

                            <div className="mt-3 flex flex-wrap items-center gap-2">

                              <span className="text-base font-bold text-[#0F2B5B]">
                                ₹
                                {formatPrice(
                                  relatedProduct.price
                                )}
                              </span>

                              {relatedProduct.original_price &&
                                Number(
                                  relatedProduct.original_price
                                ) >
                                  Number(
                                    relatedProduct.price
                                  ) && (
                                  <span className="text-xs text-[#94A3B8] line-through">
                                    ₹
                                    {formatPrice(
                                      relatedProduct.original_price
                                    )}
                                  </span>
                                )}

                            </div>

                            <div className="mt-4 flex items-center justify-between">

                              <span className="text-xs font-semibold text-[#718096]">
                                View Details
                              </span>

                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] text-[#0F2B5B] transition group-hover:bg-[#0F2B5B] group-hover:text-white">
                                <ArrowLeft
                                  size={15}
                                  className="rotate-180"
                                />
                              </span>

                            </div>

                          </div>

                        </Link>
                      );
                    }
                  )}

                </div>
              ) : (
                /*
                 * If there are no related products,
                 * simply don't show an empty message.
                 *
                 * This keeps the page clean.
                 */
                null
              )}

            </div>
          )}

        </div>

      </section>

      {/* ===================================================== */}
      {/* IMAGE ZOOM MODAL */}
      {/* ===================================================== */}

      {isImageZoomOpen &&
        selectedImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() =>
              setIsImageZoomOpen(false)
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setIsImageZoomOpen(false)
              }
              className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0F2B5B] shadow-lg transition hover:bg-[#F1F5F9]"
              aria-label="Close image"
            >
              <X size={22} />
            </button>

            {/* PREVIOUS */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPreviousImage();
                }}
                className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0F2B5B] shadow-lg transition hover:bg-[#F1F5F9] sm:left-7"
                aria-label="Previous image"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* LARGE IMAGE */}

            <div
              className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
              />
            </div>

            {/* NEXT */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNextImage();
                }}
                className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#0F2B5B] shadow-lg transition hover:bg-[#F1F5F9] sm:right-7"
                aria-label="Next image"
              >
                <ChevronRight size={22} />
              </button>
            )}

            {/* IMAGE COUNT */}

            {images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white">
                {selectedIndex + 1} /{" "}
                {images.length}
              </div>
            )}

          </div>
        )}

    </>
  );
}