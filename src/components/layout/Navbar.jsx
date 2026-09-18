import {
  Phone,
  ChevronDown,
  Menu,
  X,
  ShoppingCart,
  Heart,
  Search,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getWishlistIds,
  WISHLIST_UPDATED_EVENT,
} from "../../lib/wishlist";

import {
  getCartItemCount,
  CART_UPDATED_EVENT,
} from "../../lib/cart";


/*
 * ============================================================
 * WHATSAPP ICON
 * ============================================================
 */

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.52 3.48A11.83 11.83 0 0 0 12.04 0C5.48 0 .14 5.34.14 11.91c0 2.1.55 4.15 1.59 5.95L0 24l6.29-1.65a11.88 11.88 0 0 0 5.75 1.47h.01c6.56 0 11.9-5.34 11.9-11.91 0-3.18-1.24-6.17-3.43-8.43Z"
        fill="currentColor"
      />

      <path
        d="M17.52 13.74c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
        fill="white"
      />
    </svg>
  );
}


/*
 * ============================================================
 * NAVBAR
 * ============================================================
 */

function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [productsOpen, setProductsOpen] =
    useState(false);

  const [solutionsOpen, setSolutionsOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [wishlistCount, setWishlistCount] =
    useState(
      () => getWishlistIds().length
    );

  const [cartCount, setCartCount] =
    useState(
      () => getCartItemCount()
    );


  /*
   * ==========================================================
   * WISHLIST COUNT SYNCHRONIZATION
   * ==========================================================
   */

  useEffect(() => {

    function updateWishlistCount(event) {
      const ids =
        event.detail?.ids;

      if (Array.isArray(ids)) {
        setWishlistCount(
          ids.length
        );
      } else {
        setWishlistCount(
          getWishlistIds().length
        );
      }
    }


    function handleStorageChange(event) {
      if (
        event.key === "wishlist"
      ) {
        setWishlistCount(
          getWishlistIds().length
        );
      }
    }


    function handleFocus() {
      setWishlistCount(
        getWishlistIds().length
      );
    }


    window.addEventListener(
      WISHLIST_UPDATED_EVENT,
      updateWishlistCount
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
        updateWishlistCount
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
   * CART COUNT SYNCHRONIZATION
   * ==========================================================
   */

  useEffect(() => {

    function updateCartCount(event) {
      const cart =
        event.detail?.cart;

      if (Array.isArray(cart)) {
        setCartCount(
          cart.reduce(
            (total, item) =>
              total + item.quantity,
            0
          )
        );
      } else {
        setCartCount(
          getCartItemCount()
        );
      }
    }


    function handleStorageChange(event) {
      if (
        event.key === "param_computers_cart"
      ) {
        setCartCount(
          getCartItemCount()
        );
      }
    }


    function handleFocus() {
      setCartCount(
        getCartItemCount()
      );
    }


    window.addEventListener(
      CART_UPDATED_EVENT,
      updateCartCount
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
        CART_UPDATED_EVENT,
        updateCartCount
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
   * CLOSE MENU
   * ==========================================================
   */

  const closeMenu = () => {
    setMenuOpen(false);
    setProductsOpen(false);
    setSolutionsOpen(false);
  };


  /*
   * ==========================================================
   * PRODUCT LINKS
   * ==========================================================
   */

  const productLinks = [
    {
      name: "Refurbished Laptops",
      href:
        "/products?category=Refurbished%20Laptops",
    },

    {
      name: "Desktop Computers",
      href:
        "/products?category=Desktop%20Computers",
    },

    {
      name: "Projectors",
      href:
        "/products?category=Projectors",
    },

    {
      name: "Digital Boards",
      href:
        "/products?category=Digital%20Boards",
    },

    {
      name: "Printers",
      href:
        "/products?category=Printers",
    },

    {
      name: "Accessories",
      href:
        "/products?category=Accessories",
    },
  ];


  /*
   * ==========================================================
   * SOLUTION LINKS
   * ==========================================================
   */

  const solutionLinks = [
    {
      name: "Computer Solutions",
      href:
        "/services/computer-solutions",
    },

    {
      name: "Networking Solutions",
      href:
        "/services/networking-solutions",
    },

    {
      name: "Smart Classroom",
      href:
        "/services/smart-classroom",
    },

    {
      name: "Printing Solutions",
      href:
        "/services/printing-solutions",
    },

    {
      name: "IT Infrastructure",
      href:
        "/services/it-infrastructure",
    },

    {
      name: "Technical Support",
      href:
        "/services/technical-support",
    },
  ];


  /*
   * ==========================================================
   * MOBILE SEARCH
   * ==========================================================
   */

  function handleSearchSubmit(event) {
    event.preventDefault();

    const value =
      searchTerm.trim();


    if (!value) {
      navigate("/products");
      return;
    }


    navigate(
      `/products?search=${encodeURIComponent(
        value
      )}`
    );


    setSearchTerm("");
    setMenuOpen(false);
  }


  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        max-w-full
        border-b
        border-[#E8EDF3]
        bg-white
      "
    >


      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div
        className="
          relative
          mx-auto
          flex
          min-h-[78px]
          w-full
          max-w-7xl
          items-center
          justify-between
          gap-2
          px-4
          lg:px-6
        "
      >


        {/* ===================================================
            LOGO
        =================================================== */}

        <a
          href="/"
          onClick={closeMenu}
          className="shrink-0"
        >
          <img
            src="/param-logo-light.png"
            alt="Param Computers"
            className="h-auto w-[170px] object-contain sm:w-[190px] lg:w-[165px]"
          />
        </a>


        {/* ===================================================
            DESKTOP NAVIGATION
        =================================================== */}

        <nav
          className="
            hidden
            items-center
            gap-3
            lg:flex
          "
        >


          {/* =================================================
              HOME
          ================================================= */}

          <a
            href="/"
            className="
              shrink-0
              whitespace-nowrap
              text-[15px]
              font-medium
              text-[#334155]
              transition
              hover:text-[#C6922F]
            "
          >
            Home
          </a>


          {/* =================================================
              PRODUCTS DROPDOWN
          ================================================= */}

          <div className="relative shrink-0">

            <button
              type="button"
              onClick={() => {

                setProductsOpen(
                  !productsOpen
                );

                setSolutionsOpen(
                  false
                );

              }}
              className="
                flex
                shrink-0
                items-center
                gap-1
                whitespace-nowrap
                text-[15px]
                font-medium
                text-[#334155]
                transition
                hover:text-[#C6922F]
              "
            >

              Products

              <ChevronDown
                size={15}
                className={`
                  transition-transform
                  duration-200
                  ${
                    productsOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {productsOpen && (

              <div
                className="
                  absolute
                  left-1/2
                  top-full
                  z-[100]
                  mt-4
                  w-64
                  -translate-x-1/2
                  rounded-2xl
                  border
                  border-[#E3E8EF]
                  bg-white
                  p-2
                  shadow-[0_20px_45px_rgba(15,43,91,0.12)]
                "
              >

                {productLinks.map(
                  (product) => (

                    <a
                      key={product.name}
                      href={product.href}
                      onClick={() =>
                        setProductsOpen(
                          false
                        )
                      }
                      className="
                        block
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-[#334155]
                        transition
                        hover:bg-[#F7FAFE]
                        hover:text-[#C6922F]
                      "
                    >
                      {product.name}
                    </a>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              VIEW ALL PRODUCTS
          ================================================= */}

          <button
            type="button"
            onClick={() => {
              navigate("/products");
              closeMenu();
            }}
            className="
              shrink-0
              whitespace-nowrap
              text-[15px]
              font-semibold
              text-[#2563EB]
              transition
              hover:text-[#C6922F]
            "
          >
            View All Products
          </button>


          {/* =================================================
              SOLUTIONS DROPDOWN
          ================================================= */}

          <div className="relative shrink-0">

            <button
              type="button"
              onClick={() => {

                setSolutionsOpen(
                  !solutionsOpen
                );

                setProductsOpen(
                  false
                );

              }}
              className="
                flex
                shrink-0
                items-center
                gap-1
                whitespace-nowrap
                text-[15px]
                font-medium
                text-[#334155]
                transition
                hover:text-[#C6922F]
              "
            >

              Solutions

              <ChevronDown
                size={15}
                className={`
                  transition-transform
                  duration-200
                  ${
                    solutionsOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {solutionsOpen && (

              <div
                className="
                  absolute
                  left-1/2
                  top-full
                  z-[100]
                  mt-4
                  w-64
                  -translate-x-1/2
                  rounded-2xl
                  border
                  border-[#E3E8EF]
                  bg-white
                  p-2
                  shadow-[0_20px_45px_rgba(15,43,91,0.12)]
                "
              >

                {solutionLinks.map(
                  (solution) => (

                    <a
                      key={solution.name}
                      href={solution.href}
                      onClick={() =>
                        setSolutionsOpen(
                          false
                        )
                      }
                      className="
                        block
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-[#334155]
                        transition
                        hover:bg-[#F7FAFE]
                        hover:text-[#C6922F]
                      "
                    >
                      {solution.name}
                    </a>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              BRANDS
          ================================================= */}

          <a
            href="/#brands"
            className="
              shrink-0
              whitespace-nowrap
              text-[15px]
              font-medium
              text-[#334155]
              transition
              hover:text-[#C6922F]
            "
          >
            Brands
          </a>


          {/* =================================================
              ABOUT
          ================================================= */}

          <a
            href="/#why-param"
            className="
              shrink-0
              whitespace-nowrap
              text-[15px]
              font-medium
              text-[#334155]
              transition
              hover:text-[#C6922F]
            "
          >
            About
          </a>


          {/* =================================================
              CONTACT
          ================================================= */}

          <a
            href="/#contact"
            className="
              shrink-0
              whitespace-nowrap
              text-[15px]
              font-medium
              text-[#334155]
              transition
              hover:text-[#C6922F]
            "
          >
            Contact
          </a>


          {/* =================================================
              CART
          ================================================= */}

          <a
            href="/cart"
            className="
              relative
              inline-flex
              h-11
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-[#D8E0EA]
              bg-white
              px-2.5
              text-sm
              font-semibold
              text-[#334155]
              transition
              hover:border-[#C6922F]
              hover:text-[#C6922F]
            "
          >

            <ShoppingCart size={18} />

            Cart

            {cartCount > 0 && (

              <span
                className="
                  ml-1
                  inline-flex
                  min-w-[22px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#0F2B5B]
                  px-1.5
                  py-0.5
                  text-[11px]
                  font-bold
                  leading-none
                  text-white
                "
              >
                {cartCount}
              </span>

            )}

          </a>


          {/* =================================================
              WISHLIST
          ================================================= */}

          <a
            href="/wishlist"
            className="
              relative
              inline-flex
              h-11
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-[#D8E0EA]
              bg-white
              px-2.5
              text-sm
              font-semibold
              text-[#334155]
              transition
              hover:border-red-400
              hover:text-red-500
            "
          >

            <Heart
              size={18}
              fill={
                wishlistCount > 0
                  ? "currentColor"
                  : "none"
              }
            />

            Wishlist

            {wishlistCount > 0 && (

              <span
                className="
                  ml-1
                  inline-flex
                  min-w-[22px]
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1.5
                  py-0.5
                  text-[11px]
                  font-bold
                  leading-none
                  text-white
                "
              >
                {wishlistCount}
              </span>

            )}

          </a>

        </nav>


        {/* ===================================================
            DESKTOP ACTIONS
        =================================================== */}

        <div
          className="
            hidden
            shrink-0
            items-center
            gap-1.5
            lg:flex
          "
        >


          {/* =================================================
              WHATSAPP
          ================================================= */}

          <a
            href="https://wa.me/919284480451"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              h-11
              shrink-0
              items-center
              gap-2
              rounded-xl
              border
              border-[#D8E0EA]
              bg-white
              px-2.5
              text-sm
              font-semibold
              text-[#334155]
              transition
              hover:border-[#25D366]
              hover:text-[#25D366]
            "
          >

            <WhatsAppIcon
              size={18}
            />

            WhatsApp

          </a>


          {/* =================================================
              CALL NOW
          ================================================= */}

          <a
            href="tel:+919284480451"
            className="
              inline-flex
              h-11
              shrink-0
              items-center
              gap-2
              rounded-xl
              bg-[#0F2B5B]
              px-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#17396F]
            "
          >

            <Phone size={17} />

            Call Now

          </a>

        </div>


        {/* ===================================================
            MOBILE MENU BUTTON
        =================================================== */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              !menuOpen
            )
          }
          aria-label={
            menuOpen
              ? "Close menu"
              : "Open menu"
          }
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-[#D8E0EA]
            text-[#0F2B5B]
            transition
            hover:border-[#C6922F]
            hover:text-[#C6922F]
            lg:hidden
          "
        >

          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}

        </button>

      </div>


      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menuOpen && (

        <div
          className="
            border-t
            border-[#E8EDF3]
            bg-white
            shadow-lg
            lg:hidden
          "
        >

          <nav
            className="
              mx-auto
              flex
              w-full
              max-w-7xl
              flex-col
              px-6
              py-5
            "
          >


            {/* =================================================
                HOME
            ================================================= */}

            <a
              href="/"
              onClick={closeMenu}
              className="
                border-b
                border-[#EEF1F5]
                py-4
                text-[15px]
                font-medium
                text-[#334155]
                transition
                hover:text-[#C6922F]
              "
            >
              Home
            </a>


            {/* =================================================
                MOBILE SEARCH
            ================================================= */}

            <form
              onSubmit={
                handleSearchSubmit
              }
              className="
                border-b
                border-[#EEF1F5]
                py-4
              "
            >

              <div className="flex gap-2">

                <div className="relative flex-1">

                  <Search
                    size={18}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-[#718096]
                    "
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder="Search products..."
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-[#D8E0EA]
                      bg-white
                      pl-10
                      pr-3
                      text-sm
                      outline-none
                      focus:border-[#C6922F]
                    "
                  />

                </div>


                <button
                  type="submit"
                  className="
                    h-11
                    rounded-xl
                    bg-[#0F2B5B]
                    px-4
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Search
                </button>

              </div>

            </form>


            {/* =================================================
                PRODUCTS
            ================================================= */}

            <button
              type="button"
              onClick={() => {

                setProductsOpen(
                  !productsOpen
                );

                setSolutionsOpen(
                  false
                );

              }}
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#EEF1F5]
                py-4
                text-left
                text-[15px]
                font-medium
                text-[#334155]
              "
            >

              Products

              <ChevronDown
                size={17}
                className={`
                  transition-transform
                  duration-200
                  ${
                    productsOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {productsOpen && (

              <div
                className="
                  border-b
                  border-[#EEF1F5]
                  bg-[#FAFBFD]
                  py-2
                "
              >

                {productLinks.map(
                  (product) => (

                    <a
                      key={product.name}
                      href={product.href}
                      onClick={closeMenu}
                      className="
                        block
                        px-4
                        py-3
                        text-sm
                        text-[#526174]
                        transition
                        hover:text-[#C6922F]
                      "
                    >
                      {product.name}
                    </a>

                  )
                )}

              </div>

            )}


            {/* =================================================
                VIEW ALL PRODUCTS
            ================================================= */}

            <button
              type="button"
              onClick={() => {
                navigate("/products");
                closeMenu();
              }}
              className="
                border-b
                border-[#EEF1F5]
                py-4
                text-left
                text-[15px]
                font-semibold
                text-[#2563EB]
                transition
                hover:text-[#C6922F]
              "
            >
              View All Products
            </button>


            {/* =================================================
                SOLUTIONS
            ================================================= */}

            <button
              type="button"
              onClick={() => {

                setSolutionsOpen(
                  !solutionsOpen
                );

                setProductsOpen(
                  false
                );

              }}
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#EEF1F5]
                py-4
                text-left
                text-[15px]
                font-medium
                text-[#334155]
              "
            >

              Solutions

              <ChevronDown
                size={17}
                className={`
                  transition-transform
                  duration-200
                  ${
                    solutionsOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {solutionsOpen && (

              <div
                className="
                  border-b
                  border-[#EEF1F5]
                  bg-[#FAFBFD]
                  py-2
                "
              >

                {solutionLinks.map(
                  (solution) => (

                    <a
                      key={solution.name}
                      href={solution.href}
                      onClick={closeMenu}
                      className="
                        block
                        px-4
                        py-3
                        text-sm
                        text-[#526174]
                        transition
                        hover:text-[#C6922F]
                      "
                    >
                      {solution.name}
                    </a>

                  )
                )}

              </div>

            )}


            {/* =================================================
                BRANDS
            ================================================= */}

            <a
              href="/#brands"
              onClick={closeMenu}
              className="
                border-b
                border-[#EEF1F5]
                py-4
                text-[15px]
                font-medium
                text-[#334155]
                transition
                hover:text-[#C6922F]
              "
            >
              Brands
            </a>


            {/* =================================================
                ABOUT
            ================================================= */}

            <a
              href="/#why-param"
              onClick={closeMenu}
              className="
                border-b
                border-[#EEF1F5]
                py-4
                text-[15px]
                font-medium
                text-[#334155]
                transition
                hover:text-[#C6922F]
              "
            >
              About
            </a>


            {/* =================================================
                CONTACT
            ================================================= */}

            <a
              href="/#contact"
              onClick={closeMenu}
              className="
                border-b
                border-[#EEF1F5]
                py-4
                text-[15px]
                font-medium
                text-[#334155]
                transition
                hover:text-[#C6922F]
              "
            >
              Contact
            </a>


            {/* =================================================
                CART
            ================================================= */}

            <a
              href="/cart"
              onClick={closeMenu}
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#EEF1F5]
                py-4
                text-[15px]
                font-semibold
                text-[#0F2B5B]
                transition
                hover:text-[#C6922F]
              "
            >

              <span className="flex items-center gap-3">

                <ShoppingCart size={19} />

                Shopping Cart

              </span>


              {cartCount > 0 && (

                <span
                  className="
                    inline-flex
                    min-w-[24px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#0F2B5B]
                    px-2
                    py-1
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  {cartCount}
                </span>

              )}

            </a>


            {/* =================================================
                WISHLIST
            ================================================= */}

            <a
              href="/wishlist"
              onClick={closeMenu}
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#EEF1F5]
                py-4
                text-[15px]
                font-semibold
                text-[#0F2B5B]
                transition
                hover:text-red-500
              "
            >

              <span className="flex items-center gap-3">

                <Heart
                  size={19}
                  fill={
                    wishlistCount > 0
                      ? "currentColor"
                      : "none"
                  }
                />

                Wishlist

              </span>


              {wishlistCount > 0 && (

                <span
                  className="
                    inline-flex
                    min-w-[24px]
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-2
                    py-1
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  {wishlistCount}
                </span>

              )}

            </a>


            {/* =================================================
                MOBILE ACTIONS
            ================================================= */}

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >


              {/* =================================================
                  WHATSAPP
              ================================================= */}

              <a
                href="https://wa.me/919284480451"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[#D8E0EA]
                  bg-white
                  text-sm
                  font-semibold
                  text-[#334155]
                  transition
                  hover:border-[#25D366]
                  hover:text-[#25D366]
                "
              >

                <WhatsAppIcon
                  size={18}
                />

                WhatsApp

              </a>


              {/* =================================================
                  CALL NOW
              ================================================= */}

              <a
                href="tel:+919284480451"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#0F2B5B]
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#17396F]
                "
              >

                <Phone size={17} />

                Call Now

              </a>

            </div>

          </nav>

        </div>

      )}

    </header>
  );
}


export default Navbar;