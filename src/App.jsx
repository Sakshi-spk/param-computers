import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import {
  ArrowUp,
} from "lucide-react";

import { supabase } from "./lib/supabase";

import AnnouncementBar from "./components/layout/AnnouncementBar";
import Navbar from "./components/layout/Navbar";
import ProductSearchBar from "./components/home/ProductSearchBar";
import Hero from "./components/home/Hero";
import FeaturedProducts from "./components/home/FeaturedProducts";
import Categories from "./components/home/Categories";
import Services from "./components/home/Services";
import Brands from "./components/home/Brands";
import Stats from "./components/home/Stats";
import WhyChoose from "./components/home/WhyChoose";
import Reveal from "./components/common/Reveal";
import Footer from "./components/layout/Footer";

import AdminLayout from "./components/admin/AdminLayout";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminResetPassword from "./pages/AdminResetPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";

import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Products from "./pages/Products";
import ServiceDetails from "./pages/ServiceDetails";


/*
 * ==========================================
 * SCROLL TO TOP ON ROUTE CHANGE
 * ==========================================
 */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}


/*
 * ==========================================
 * BACK TO TOP BUTTON
 * ==========================================
 */

function BackToTop() {
  const [showButton, setShowButton] =
    useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 400) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  if (!showButton) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-[#0F2B5B] text-white shadow-[0_8px_25px_rgba(15,43,91,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#17396F] hover:shadow-[0_12px_30px_rgba(15,43,91,0.30)] focus:outline-none focus:ring-2 focus:ring-[#C6922F] focus:ring-offset-2"
    >
      <ArrowUp
        size={21}
        strokeWidth={2.5}
      />
    </button>
  );
}


/*
 * ==========================================
 * HOME PAGE
 * ==========================================
 */

function Home() {
  return (
    <>
      <AnnouncementBar />

      <Navbar />

      <main>

        <Reveal>
          <ProductSearchBar />
        </Reveal>

        <Reveal>
          <Hero />
        </Reveal>

        <Reveal delay={50}>
          <FeaturedProducts />
        </Reveal>

        <Reveal delay={50}>
          <Categories />
        </Reveal>

        <Reveal delay={50}>
          <Services />
        </Reveal>

        <Reveal delay={50}>
          <Brands />
        </Reveal>

        <Reveal delay={50}>
          <Stats />
        </Reveal>

        <Reveal delay={50}>
          <WhyChoose />
        </Reveal>

      </main>

      <Footer />
    </>
  );
}


/*
 * ==========================================
 * CUSTOMER LAYOUT
 * ==========================================
 */

function CustomerLayout({ children }) {
  return (
    <>
      <AnnouncementBar />

      <Navbar />

      <main>
        {children}
      </main>

      <Footer />
    </>
  );
}


/*
 * ==========================================
 * MAIN APP
 * ==========================================
 */

function App() {

  /*
   * Test Supabase connection.
   */

  useEffect(() => {
    const testSupabase = async () => {

      const { error } = await supabase
        .from("products")
        .select("*")
        .limit(1);

      if (error) {
        console.log(
          "Supabase connection:",
          error.message
        );
      } else {
        console.log(
          "Supabase connection successful!"
        );
      }

    };

    testSupabase();

  }, []);


  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-[#0F2B5B]">

      <BrowserRouter>

        <ScrollToTop />

        <BackToTop />

        <Routes>

          {/* =====================================
              CUSTOMER HOME
          ===================================== */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* =====================================
              CART
          ===================================== */}

          <Route
            path="/cart"
            element={
              <CustomerLayout>
                <Cart />
              </CustomerLayout>
            }
          />


          {/* =====================================
              CHECKOUT
          ===================================== */}

          <Route
            path="/checkout"
            element={
              <CustomerLayout>
                <Checkout />
              </CustomerLayout>
            }
          />


          {/* =====================================
              ADMIN LOGIN
              NO ADMIN NAVBAR HERE
          ===================================== */}

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />
<Route
  path="/admin/reset-password"
  element={<AdminResetPassword />}
/>

          {/* =====================================
              ADMIN LAYOUT
              NAVBAR APPEARS ON ALL CHILD ROUTES
          ===================================== */}

          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* Dashboard */}

            <Route
              index
              element={<AdminDashboard />}
            />


            {/* Products */}

            <Route
              path="products"
              element={<AdminProducts />}
            />


            {/* Add Product */}

            <Route
              path="products/add"
              element={<AddProduct />}
            />


            {/* Edit Product */}

            <Route
              path="products/edit/:id"
              element={<EditProduct />}
            />


            {/* Orders */}

            <Route
              path="orders"
              element={<AdminOrders />}
            />

          </Route>


          {/* =====================================
              PRODUCT DETAILS
          ===================================== */}

          <Route
            path="/product/:slug"
            element={
              <ProductDetails />
            }
          />


          {/* =====================================
              WISHLIST
          ===================================== */}

          <Route
            path="/wishlist"
            element={
              <CustomerLayout>
                <Wishlist />
              </CustomerLayout>
            }
          />


          {/* =====================================
              PRODUCTS
          ===================================== */}

          <Route
            path="/products"
            element={
              <CustomerLayout>
                <Products />
              </CustomerLayout>
            }
          />


          {/* =====================================
              SERVICE DETAILS
          ===================================== */}

          <Route
            path="/services/:slug"
            element={
              <CustomerLayout>
                <ServiceDetails />
              </CustomerLayout>
            }
          />

        </Routes>

      </BrowserRouter>

    </div>
  );
}


export default App;