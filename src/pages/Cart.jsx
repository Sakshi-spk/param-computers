import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import {
  getLocalCart,
  removeFromCart,
  updateCartQuantity,
} from "../lib/cart";

import { supabase } from "../lib/supabase";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);

      const localCart = getLocalCart();

      if (localCart.length === 0) {
        setCartItems([]);
        setProducts([]);
        return;
      }

      const productIds = localCart.map(
        (item) => item.product_id
      );

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("is_active", true);

      if (error) {
        console.error("Cart products error:", error);
        return;
      }

      setCartItems(localCart);
      setProducts(data || []);
    } catch (error) {
      console.error("Cart loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  function getProduct(productId) {
    return products.find(
      (product) => product.id === productId
    );
  }

  function handleQuantityChange(productId, quantity) {
    const updatedCart = updateCartQuantity(
      productId,
      quantity
    );

    setCartItems(updatedCart);
  }

  function handleRemove(productId) {
    const updatedCart = removeFromCart(productId);

    setCartItems(updatedCart);
  }

  const subtotal = cartItems.reduce((total, item) => {
    const product = getProduct(item.product_id);

    if (!product) {
      return total;
    }

    return total + Number(product.price) * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (loading) {
    return (
      <section className="min-h-screen bg-[#FBF9F6]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 w-48 rounded-lg bg-gray-200" />
            <div className="mt-10 h-32 rounded-3xl bg-gray-200" />
            <div className="mt-6 h-32 rounded-3xl bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FBF9F6]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

        {/* HEADER */}

        <div className="flex flex-col gap-4">

          <a
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#2563EB] transition hover:gap-3"
          >
            <ArrowLeft size={17} />
            Continue Shopping
          </a>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F2B5B] text-white">
              <ShoppingCart size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#0F2B5B] sm:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-1 text-sm text-[#718096]">
                {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"} in your cart
              </p>
            </div>

          </div>
        </div>

        {/* EMPTY CART */}

        {cartItems.length === 0 && (
          <div className="mt-12 rounded-3xl border border-[#E3E9F1] bg-white p-12 text-center shadow-[0_4px_20px_rgba(15,43,91,0.04)]">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7FAFE] text-[#0F2B5B]">
              <ShoppingCart size={34} />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#0F2B5B]">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#718096]">
              Looks like you haven't added anything to your
              cart yet. Explore our products and find the
              right technology for you.
            </p>

            <a
              href="/"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#0F2B5B] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17396F]"
            >
              Explore Products
            </a>

          </div>
        )}

        {/* CART CONTENT */}

        {cartItems.length > 0 && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* CART ITEMS */}

            <div className="space-y-5">

              {cartItems.map((item) => {
                const product = getProduct(item.product_id);

                if (!product) {
                  return null;
                }

                return (
                  <div
                    key={item.product_id}
                    className="rounded-3xl border border-[#E3E9F1] bg-white p-5 shadow-[0_4px_20px_rgba(15,43,91,0.04)]"
                  >

                    <div className="flex flex-col gap-5 sm:flex-row">

                      {/* PRODUCT IMAGE */}

                      <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-[#F7FAFE] sm:h-32 sm:w-40">

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />

                      </div>

                      {/* PRODUCT DETAILS */}

                      <div className="flex flex-1 flex-col justify-between">

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6922F]">
                            {product.brand}
                          </p>

                          <h2 className="mt-1 text-xl font-bold text-[#0F2B5B]">
                            {product.name}
                          </h2>

                          <p className="mt-1 text-sm text-[#718096]">
                            {product.category}
                          </p>

                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                          {/* QUANTITY */}

                          <div className="flex items-center gap-3">

                            <span className="text-sm font-medium text-[#5B6F86]">
                              Quantity
                            </span>

                            <div className="flex items-center overflow-hidden rounded-xl border border-[#DDE3EA]">

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product_id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                                className="flex h-9 w-9 items-center justify-center text-[#0F2B5B] transition hover:bg-[#F7FAFE] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus size={15} />
                              </button>

                              <span className="flex h-9 min-w-10 items-center justify-center border-x border-[#DDE3EA] text-sm font-semibold text-[#0F2B5B]">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(
                                    item.product_id,
                                    item.quantity + 1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center text-[#0F2B5B] transition hover:bg-[#F7FAFE]"
                              >
                                <Plus size={15} />
                              </button>

                            </div>

                          </div>

                          {/* PRICE + REMOVE */}

                          <div className="flex items-center justify-between gap-6">

                            <div className="text-right">

                              <p className="text-xs text-[#94A3B8]">
                                ₹
                                {Number(
                                  product.price
                                ).toLocaleString("en-IN")}{" "}
                                each
                              </p>

                              <p className="mt-1 text-xl font-bold text-[#0F2B5B]">
                                ₹
                                {(
                                  Number(product.price) *
                                  item.quantity
                                ).toLocaleString("en-IN")}
                              </p>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(item.product_id)
                              }
                              aria-label={`Remove ${product.name}`}
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* ORDER SUMMARY */}

            <div className="lg:sticky lg:top-24 lg:h-fit">

              <div className="rounded-3xl border border-[#E3E9F1] bg-white p-6 shadow-[0_4px_20px_rgba(15,43,91,0.05)]">

                <h2 className="text-xl font-bold text-[#0F2B5B]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#718096]">
                      Items
                    </span>

                    <span className="font-medium text-[#0F2B5B]">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#718096]">
                      Subtotal
                    </span>

                    <span className="font-semibold text-[#0F2B5B]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="border-t border-[#E8EDF2]" />

                  <div className="flex items-end justify-between">

                    <span className="text-base font-semibold text-[#0F2B5B]">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-[#0F2B5B]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>

                  </div>

                </div>

                {/* PRICE NOTICE */}

                <div className="mt-6 rounded-2xl border border-[#E6D5B8] bg-[#F8F0E3] p-4">

                  <p className="text-xs leading-5 text-[#70552E]">
                    Final price and product availability
                    will be confirmed before order
                    confirmation.
                  </p>

                </div>

                {/* CHECKOUT */}

                <a
  href="/checkout"
  className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#0F2B5B] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#17396F]"
>
  Proceed to Checkout
</a>

                <a
                  href="/"
                  className="mt-4 flex w-full items-center justify-center text-sm font-semibold text-[#2563EB]"
                >
                  Continue Shopping
                </a>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}