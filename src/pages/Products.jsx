import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  getWishlistIds,
  toggleWishlist,
  WISHLIST_UPDATED_EVENT,
} from "../lib/wishlist";


/*
 * ============================================================
 * PRODUCTS PAGE
 * ============================================================
 */

const PRODUCT_CATEGORIES = [
  "Refurbished Laptops",
  "Desktop Computers",
  "Projectors",
  "Digital Boards",
  "Printers",
  "Accessories",
];


const PRICE_RANGES = [
  {
    value: "",
    label: "All Prices",
  },

  {
    value: "below-10000",
    label: "Below ₹10,000",
    min: 0,
    max: 9999,
  },

  {
    value: "10000-30000",
    label: "₹10,000 – ₹30,000",
    min: 10000,
    max: 30000,
  },

  {
    value: "30001-50000",
    label: "₹30,001 – ₹50,000",
    min: 30001,
    max: 50000,
  },

  {
    value: "50001-100000",
    label: "₹50,001 – ₹1,00,000",
    min: 50001,
    max: 100000,
  },

  {
    value: "above-100000",
    label: "Above ₹1,00,000",
    min: 100001,
    max: Infinity,
  },
];


/*
 * ============================================================
 * BRAND NORMALIZATION
 * ============================================================
 *
 * This must match the normalization used in AddProduct.jsx.
 *
 */

function normalizeBrand(value) {
  const trimmed = String(
    value || ""
  ).trim();

  if (!trimmed) {
    return "";
  }

  const knownBrands = {
    dell: "Dell",
    hp: "HP",
    lenovo: "Lenovo",
    apple: "Apple",
    acer: "Acer",
    asus: "ASUS",
    epson: "Epson",
    benq: "BenQ",
    canon: "Canon",
    brother: "Brother",
    samsung: "Samsung",
    lg: "LG",
    microsoft: "Microsoft",
    intel: "Intel",
    amd: "AMD",
    kingston: "Kingston",
    crucial: "Crucial",
    logitech: "Logitech",
    "tp-link": "TP-Link",
    tplink: "TP-Link",
    toshiba: "Toshiba",
    sony: "Sony",
    panasonic: "Panasonic",
    philips: "Philips",
    viewsonic: "ViewSonic",
    "view sonic": "ViewSonic",
    zebronics: "Zebronics",
    portronics: "Portronics",
    corsair: "Corsair",
    "western digital": "Western Digital",
    wd: "Western Digital",
    seagate: "Seagate",
    sandisk: "SanDisk",
    gigabyte: "Gigabyte",
    msi: "MSI",
    "microsoft surface":
      "Microsoft Surface",
  };

  const key =
    trimmed.toLowerCase();

  if (knownBrands[key]) {
    return knownBrands[key];
  }

  return trimmed
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}


/*
 * ============================================================
 * BRAND COMPARISON KEY
 * ============================================================
 *
 * Used when comparing existing database records.
 *
 * Dell
 * dell
 * DELL
 *
 * all become:
 *
 * dell
 *
 */

function getBrandKey(value) {
  return normalizeBrand(
    value
  ).toLowerCase();
}


export default function Products() {

  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();


  /*
   * ==========================================================
   * URL PARAMETERS
   * ==========================================================
   */

  const categoryFromUrl =
    searchParams.get(
      "category"
    ) || "";

  const searchFromUrl =
    searchParams.get(
      "search"
    ) || "";


  /*
   * ==========================================================
   * PRODUCTS
   * ==========================================================
   */

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    wishlistIds,
    setWishlistIds,
  ] = useState(
    () =>
      getWishlistIds()
  );

  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
   * ==========================================================
   * FILTER STATES
   * ==========================================================
   */

  const [
    searchTerm,
    setSearchTerm,
  ] = useState(
    searchFromUrl
  );

  const [
    selectedBrand,
    setSelectedBrand,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    categoryFromUrl
  );

  const [
    selectedPriceRange,
    setSelectedPriceRange,
  ] = useState("");

  const [
    inStockOnly,
    setInStockOnly,
  ] = useState(false);

  const [
    sortBy,
    setSortBy,
  ] = useState("newest");

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(
    searchParams.get(
      "filters"
    ) === "open"
  );


  /*
   * ==========================================================
   * URL SYNCHRONIZATION
   * ==========================================================
   */

  useEffect(() => {

    setSearchTerm(
      searchFromUrl
    );

    setSelectedCategory(
      categoryFromUrl
    );

  }, [
    searchFromUrl,
    categoryFromUrl,
  ]);


  /*
   * ==========================================================
   * LOAD PRODUCTS
   * ==========================================================
   */

  useEffect(() => {
    loadProducts();
  }, []);


  async function loadProducts() {

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
        .eq(
          "is_active",
          true
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {

        console.error(
          "Products loading error:",
          error
        );

        return;
      }

      setProducts(
        data || []
      );

      setWishlistIds(
        getWishlistIds()
      );

    } catch (error) {

      console.error(
        "Unexpected products error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  /*
   * ==========================================================
   * AUTOMATIC BRANDS
   * ==========================================================
   *
   * Brands still come automatically from Supabase.
   *
   * BUT:
   *
   * Dell
   * dell
   * DELL
   *
   * become ONE option.
   *
   */

  const brands =
    useMemo(() => {

      const brandMap =
        new Map();

      products.forEach(
        (product) => {

          const rawBrand =
            product.brand?.trim();

          if (!rawBrand) {
            return;
          }

          const normalized =
            normalizeBrand(
              rawBrand
            );

          const key =
            getBrandKey(
              rawBrand
            );

          if (
            !brandMap.has(key)
          ) {

            brandMap.set(
              key,
              normalized
            );

          }

        }
      );

      return Array.from(
        brandMap.values()
      ).sort(
        (a, b) =>
          a.localeCompare(
            b
          )
      );

    }, [
      products,
    ]);


  /*
   * ==========================================================
   * PRICE RANGE
   * ==========================================================
   */

  const selectedPriceRangeObject =
    useMemo(() => {

      return (
        PRICE_RANGES.find(
          (range) =>
            range.value ===
            selectedPriceRange
        ) || null
      );

    }, [
      selectedPriceRange,
    ]);


  /*
   * ==========================================================
   * FILTER PRODUCTS
   * ==========================================================
   */

  const filteredProducts =
    useMemo(() => {

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      let result =
        products.filter(
          (product) => {

            /*
             * SEARCH
             */

            if (
              normalizedSearch
            ) {

              const searchableText =
                [
                  product.name,
                  product.brand,
                  product.category,
                  product.description,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

              if (
                !searchableText.includes(
                  normalizedSearch
                )
              ) {

                return false;

              }

            }


            /*
             * CATEGORY
             */

            if (
              selectedCategory &&
              product.category
                ?.toLowerCase() !==
                selectedCategory.toLowerCase()
            ) {

              return false;

            }


            /*
             * BRAND
             *
             * IMPORTANT:
             *
             * This is now case-insensitive
             * AND normalization-aware.
             *
             * Dell = dell = DELL
             *
             */

            if (
              selectedBrand &&
              getBrandKey(
                product.brand
              ) !==
                getBrandKey(
                  selectedBrand
                )
            ) {

              return false;

            }


            /*
             * PRICE RANGE
             */

            if (
              selectedPriceRangeObject
            ) {

              const productPrice =
                Number(
                  product.price || 0
                );

              const minimum =
                selectedPriceRangeObject.min;

              const maximum =
                selectedPriceRangeObject.max;

              if (
                productPrice <
                minimum
              ) {

                return false;

              }

              if (
                maximum !== Infinity &&
                productPrice >
                maximum
              ) {

                return false;

              }

            }


            /*
             * STOCK
             */

            if (
              inStockOnly &&
              Number(
                product.stock || 0
              ) <= 0
            ) {

              return false;

            }

            return true;

          }
        );


      /*
       * ========================================================
       * SORTING
       * ========================================================
       */

      result =
        [...result].sort(
          (a, b) => {

            if (
              sortBy ===
              "price-low"
            ) {

              return (
                Number(
                  a.price || 0
                ) -
                Number(
                  b.price || 0
                )
              );

            }

            if (
              sortBy ===
              "price-high"
            ) {

              return (
                Number(
                  b.price || 0
                ) -
                Number(
                  a.price || 0
                )
              );

            }

            const dateA =
              new Date(
                a.created_at || 0
              ).getTime();

            const dateB =
              new Date(
                b.created_at || 0
              ).getTime();

            return (
              dateB -
              dateA
            );

          }
        );

      return result;

    }, [
      products,
      searchTerm,
      selectedBrand,
      selectedCategory,
      selectedPriceRangeObject,
      inStockOnly,
      sortBy,
    ]);


  /*
   * ==========================================================
   * CATEGORY TOTAL COUNT
   * ==========================================================
   */

  const categoryTotalCount =
    useMemo(() => {

      if (
        selectedCategory
      ) {

        return products.filter(
          (product) =>
            product.category
              ?.toLowerCase() ===
            selectedCategory.toLowerCase()
        ).length;

      }

      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      if (
        normalizedSearch
      ) {

        const matchingCategories =
          PRODUCT_CATEGORIES.filter(
            (category) =>
              category
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
          );

        if (
          matchingCategories.length ===
          1
        ) {

          const detectedCategory =
            matchingCategories[0];

          return products.filter(
            (product) =>
              product.category
                ?.toLowerCase() ===
              detectedCategory.toLowerCase()
          ).length;

        }

      }

      return products.length;

    }, [
      products,
      selectedCategory,
      searchTerm,
    ]);


  const resultTotalCount =
    categoryTotalCount;


  /*
   * ==========================================================
   * ACTIVE FILTER COUNT
   * ==========================================================
   */

  const activeFilterCount =
    [
      selectedBrand,
      selectedCategory,
      selectedPriceRange,
      inStockOnly
        ? "stock"
        : "",
    ].filter(Boolean).length;


  /*
   * ==========================================================
   * CLEAR FILTERS
   * ==========================================================
   */

  function clearFilters() {

    setSearchTerm("");

    setSelectedBrand("");

    setSelectedCategory("");

    setSelectedPriceRange("");

    setInStockOnly(false);

    setSortBy("newest");

    navigate(
      "/products",
      {
        replace: true,
      }
    );

  }


  /*
   * ==========================================================
   * CATEGORY URL
   * ==========================================================
   */

  function handleCategoryChange(
    value
  ) {

    setSelectedCategory(
      value
    );

    const params =
      new URLSearchParams();

    if (value) {

      params.set(
        "category",
        value
      );

    }

    if (
      searchTerm.trim()
    ) {

      params.set(
        "search",
        searchTerm.trim()
      );

    }

    const query =
      params.toString();

    navigate(
      query
        ? `/products?${query}`
        : "/products",
      {
        replace: true,
      }
    );

  }


  /*
   * ==========================================================
   * SEARCH
   * ==========================================================
   */

  function handleSearchSubmit(
    event
  ) {

    event.preventDefault();

    const value =
      searchTerm.trim();

    const params =
      new URLSearchParams();

    if (value) {

      params.set(
        "search",
        value
      );

    }

    if (
      selectedCategory
    ) {

      params.set(
        "category",
        selectedCategory
      );

    }

    const query =
      params.toString();

    navigate(
      query
        ? `/products?${query}`
        : "/products"
    );

  }


  /*
   * ==========================================================
   * WISHLIST SYNCHRONIZATION
   * ==========================================================
   */

  useEffect(() => {

    function handleWishlistUpdated(
      event
    ) {

      const ids =
        event.detail?.ids;

      if (
        Array.isArray(ids)
      ) {

        setWishlistIds(
          ids.map(
            (id) =>
              String(id)
          )
        );

      } else {

        setWishlistIds(
          getWishlistIds()
        );

      }

    }


    function handleStorageChange(
      event
    ) {

      if (
        event.key ===
        "wishlist"
      ) {

        setWishlistIds(
          getWishlistIds()
        );

      }

    }


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
   * ==========================================================
   * WISHLIST
   * ==========================================================
   */

  function handleWishlist(
    productId
  ) {

    if (
      productId === null ||
      productId === undefined
    ) {

      return;

    }

    const result =
      toggleWishlist(
        productId
      );

    setWishlistIds(
      result.ids.map(
        (id) =>
          String(id)
      )
    );

  }


  /*
   * ==========================================================
   * PRODUCT DETAILS
   * ==========================================================
   */

  function openProduct(
    product
  ) {

    if (
      product?.slug
    ) {

      navigate(
        `/product/${product.slug}`
      );

    }

  }


  /*
   * ==========================================================
   * WISHLIST STATE
   * ==========================================================
   */

  function isProductWishlisted(
    productId
  ) {

    return wishlistIds.includes(
      String(productId)
    );

  }


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (

    <section className="min-h-screen overflow-x-hidden bg-[#FBF9F6]">

      <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]"
        >

          <ArrowLeft
            size={17}
          />

          Back to Home

        </button>


        {/* HEADER */}

        <div className="mt-8">

          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#C6922F]">
            Products
          </p>

          <h1 className="mt-3 text-4xl font-bold text-[#0F2B5B] sm:text-5xl">

            {
              selectedCategory ||
              "All Products"
            }

          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-[#718096]">
            Explore our available technology products from Param Computers.
          </p>

        </div>


        {/* SEARCH + FILTER */}

        <div className="mt-10 rounded-2xl border border-[#E3E9F1] bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <form
              onSubmit={
                handleSearchSubmit
              }
              className="flex min-w-0 flex-1 gap-2"
            >

              <div className="relative min-w-0 flex-1">

                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#718096]"
                />

                <input
                  type="search"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search products, brands..."
                  className="h-12 w-full rounded-xl border border-[#D8E0EA] bg-white pl-11 pr-4 text-sm text-[#334155] outline-none transition placeholder:text-[#94A3B8] focus:border-[#C6922F] focus:ring-2 focus:ring-[#C6922F]/10"
                />

              </div>

              <button
                type="submit"
                className="h-12 shrink-0 rounded-xl bg-[#0F2B5B] px-5 text-sm font-semibold text-white transition hover:bg-[#17396F]"
              >
                Search
              </button>

            </form>


            {/* FILTER BUTTON */}

            <button
              type="button"
              onClick={() =>
                setFiltersOpen(
                  !filtersOpen
                )
              }
              className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${
                filtersOpen ||
                activeFilterCount >
                  0
                  ? "border-[#C6922F] bg-[#FFF9ED] text-[#0F2B5B]"
                  : "border-[#D8E0EA] bg-white text-[#334155] hover:border-[#C6922F] hover:text-[#C6922F]"
              }`}
            >

              <SlidersHorizontal
                size={18}
              />

              Filters

              {activeFilterCount >
                0 && (

                <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#C6922F] px-1.5 py-0.5 text-[11px] font-bold text-white">

                  {
                    activeFilterCount
                  }

                </span>

              )}

            </button>

          </div>


          {/* FILTER PANEL */}

          {filtersOpen && (

            <div className="mt-4 border-t border-[#EEF1F5] pt-5">

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {/* BRAND */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#526174]">
                    Brand
                  </label>

                  <select
                    value={
                      selectedBrand
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedBrand(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#D8E0EA] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#C6922F]"
                  >

                    <option value="">
                      All Brands
                    </option>

                    {brands.map(
                      (
                        brand
                      ) => (

                        <option
                          key={
                            brand
                          }
                          value={
                            brand
                          }
                        >
                          {
                            brand
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#526174]">
                    Category
                  </label>

                  <select
                    value={
                      selectedCategory
                    }
                    onChange={(
                      event
                    ) =>
                      handleCategoryChange(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#D8E0EA] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#C6922F]"
                  >

                    <option value="">
                      All Categories
                    </option>

                    {PRODUCT_CATEGORIES.map(
                      (
                        category
                      ) => (

                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {
                            category
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* PRICE */}

                <div>

                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#526174]">
                    Price
                  </label>

                  <select
                    value={
                      selectedPriceRange
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedPriceRange(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#D8E0EA] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#C6922F]"
                  >

                    {PRICE_RANGES.map(
                      (
                        range
                      ) => (

                        <option
                          key={
                            range.value
                          }
                          value={
                            range.value
                          }
                        >
                          {
                            range.label
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* STOCK */}

                <div className="flex items-end">

                  <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-[#334155]">

                    <input
                      type="checkbox"
                      checked={
                        inStockOnly
                      }
                      onChange={(
                        event
                      ) =>
                        setInStockOnly(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 accent-[#0F2B5B]"
                    />

                    Only show products in stock

                  </label>

                </div>

              </div>


              {/* CLEAR */}

              <div className="mt-5 flex justify-end">

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#C6922F] transition hover:text-[#A87418]"
                >

                  <X
                    size={16}
                  />

                  Clear Filters

                </button>

              </div>

            </div>

          )}

        </div>


        {/* RESULTS / SORT */}

        {!loading &&
          products.length >
            0 && (

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-[#718096]">

              Showing{" "}

              <span className="font-bold text-[#0F2B5B]">
                {
                  filteredProducts.length
                }
              </span>{" "}

              of{" "}

              <span className="font-bold text-[#0F2B5B]">
                {
                  resultTotalCount
                }
              </span>{" "}

              products

            </p>

            <div className="flex items-center gap-3">

              <label
                htmlFor="sort-products"
                className="text-sm font-medium text-[#718096]"
              >
                Sort by
              </label>

              <select
                id="sort-products"
                value={
                  sortBy
                }
                onChange={(
                  event
                ) =>
                  setSortBy(
                    event.target.value
                  )
                }
                className="h-10 rounded-xl border border-[#D8E0EA] bg-white px-3 text-sm font-medium text-[#334155] outline-none focus:border-[#C6922F]"
              >

                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

              </select>

            </div>

          </div>

        )}


        {/* LOADING */}

        {loading ? (

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map(
              (item) => (

                <div
                  key={item}
                  className="h-[430px] animate-pulse rounded-3xl bg-gray-200"
                />

              )
            )}

          </div>

        ) : filteredProducts.length ===
          0 ? (

          /* EMPTY */

          <div className="mt-12 rounded-3xl border border-[#E3E9F1] bg-white p-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7FAFE] text-[#0F2B5B]">

              <Search
                size={24}
              />

            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#0F2B5B]">
              No products found
            </h2>

            <p className="mt-3 text-sm text-[#718096]">
              Try changing your search or filters.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F2B5B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17396F]"
            >

              <X
                size={17}
              />

              Clear Filters

            </button>

          </div>

        ) : (

          /* PRODUCTS */

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredProducts.map(
              (product) => {

                const wishlisted =
                  isProductWishlisted(
                    product.id
                  );

                return (

                  <article
                    key={
                      product.id
                    }
                    className="group overflow-hidden rounded-3xl border border-[#E3E9F1] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* IMAGE */}

                    <div className="relative h-[250px] overflow-hidden bg-[#F7FAFE]">

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
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center text-sm text-gray-500">
                            No image
                          </div>

                        )}

                      </button>


                      {/* WISHLIST */}

                      <button
                        type="button"
                        onClick={() =>
                          handleWishlist(
                            product.id
                          )
                        }
                        aria-label={
                          wishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition ${
                          wishlisted
                            ? "text-red-500 hover:bg-red-50"
                            : "text-[#0F2B5B] hover:text-red-500"
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


                    {/* PRODUCT INFO */}

                    <div className="p-6">

                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6922F]">

                        {
                          normalizeBrand(
                            product.brand
                          ) ||
                          "Param Computers"
                        }

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

                        <h2 className="text-xl font-bold text-[#0F2B5B]">
                          {
                            product.name
                          }
                        </h2>

                      </button>

                      <p className="mt-2 text-sm text-[#718096]">
                        {
                          product.category
                        }
                      </p>


                      {/* PRICE */}

                      <p className="mt-5 text-2xl font-bold text-[#0F2B5B]">

                        ₹

                        {Number(
                          product.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </p>


                      {/* VIEW PRODUCT */}

                      <button
                        type="button"
                        onClick={() =>
                          openProduct(
                            product
                          )
                        }
                        className="mt-5 w-full rounded-xl bg-[#0F2B5B] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#17396F]"
                      >
                        View Product
                      </button>

                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}

      </div>

    </section>

  );
}