import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  ShoppingCart,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { getLocalCart, clearCart } from "../lib/cart";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    shippingAddress: "",
    city: "",
    state: "Maharashtra",
    pincode: "",
    customerNote: "",
    upiTransactionId: "",
  });

  useEffect(() => {
    loadCheckout();
  }, []);

  // =========================================================
  // LOAD CHECKOUT
  // =========================================================

  async function loadCheckout() {
    try {
      setLoading(true);

      const localCart = getLocalCart();

      if (!localCart || localCart.length === 0) {
        setCartItems([]);
        setProducts([]);
        return;
      }

      const productIds = localCart.map(function (item) {
        return item.product_id;
      });

      const result = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)
        .eq("is_active", true);

      if (result.error) {
        console.error("PRODUCT LOAD ERROR:", result.error);

        alert(
          "Unable to load products.\n\n" +
            result.error.message
        );

        return;
      }

      setCartItems(localCart);
      setProducts(result.data || []);
    } catch (error) {
      console.error("CHECKOUT LOAD ERROR:", error);

      alert(
        "Something went wrong while loading checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // FIND PRODUCT
  // =========================================================

  function getProduct(productId) {
    return products.find(function (product) {
      return product.id === productId;
    });
  }

  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    setForm(function (previous) {
      return {
        ...previous,
        [name]: value,
      };
    });
  }

  // =========================================================
  // ORDER NUMBER
  // =========================================================

  function generateOrderNumber() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    const random = Math.floor(
      1000 + Math.random() * 9000
    );

    return (
      "PC-" +
      year +
      month +
      day +
      "-" +
      random
    );
  }

  // =========================================================
  // CALCULATE TOTAL
  // =========================================================

  const subtotal = cartItems.reduce(
    function (total, item) {
      const product = getProduct(
        item.product_id
      );

      if (!product) {
        return total;
      }

      return (
        total +
        Number(product.price) *
          Number(item.quantity)
      );
    },
    0
  );

  const shippingCharge = 0;

  const totalAmount =
    subtotal + shippingCharge;

  // =========================================================
  // PLACE ORDER
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (placingOrder) {
      return;
    }

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (
      !form.customerName.trim() ||
      !form.customerPhone.trim() ||
      !form.shippingAddress.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        form.customerPhone.trim()
      )
    ) {
      alert(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (
      !/^[0-9]{6}$/.test(
        form.pincode.trim()
      )
    ) {
      alert(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    // -------------------------------------------------------
    // UPI TRANSACTION ID VALIDATION
    // -------------------------------------------------------

    if (!form.upiTransactionId.trim()) {
      alert(
        "Please enter your UPI Transaction ID / UTR Number."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      // -----------------------------------------------------
      // GENERATE ORDER NUMBER
      // -----------------------------------------------------

      const newOrderNumber =
        generateOrderNumber();

      console.log(
        "================================="
      );

      console.log(
        "CREATING ORDER:",
        newOrderNumber
      );

      // -----------------------------------------------------
      // CREATE ORDER
      //
      // IMPORTANT:
      // These column names EXACTLY match your orders table.
      // -----------------------------------------------------

      const newOrder = {
        user_id: null,

        order_number: newOrderNumber,

        customer_name:
          form.customerName.trim(),

        customer_phone:
          form.customerPhone.trim(),

        customer_email:
          form.customerEmail.trim() || null,

        shipping_address:
          form.shippingAddress.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        pincode:
          form.pincode.trim(),

        subtotal:
          Number(subtotal),

        shipping_charge:
          Number(shippingCharge),

        total_amount:
          Number(totalAmount),

        // ---------------------------------------------------
        // UPI PAYMENT
        // ---------------------------------------------------

        payment_method:
          "UPI",

        payment_status:
          "Pending Verification",

        order_status:
          "Pending Confirmation",

        upi_transaction_id:
          form.upiTransactionId.trim(),

        customer_note:
          form.customerNote.trim() || null,
      };

      console.log(
        "ORDER OBJECT:",
        newOrder
      );

      // -----------------------------------------------------
      // INSERT ORDER
      // -----------------------------------------------------

      const orderResult = await supabase
        .from("orders")
        .insert(newOrder)
        .select("id, order_number")
        .single();

      if (orderResult.error) {
        console.error(
          "ORDER INSERT ERROR:",
          orderResult.error
        );

        console.error(
          "ERROR MESSAGE:",
          orderResult.error.message
        );

        console.error(
          "ERROR CODE:",
          orderResult.error.code
        );

        console.error(
          "ERROR DETAILS:",
          orderResult.error.details
        );

        console.error(
          "ERROR HINT:",
          orderResult.error.hint
        );

        alert(
          "Unable to place order.\n\n" +
            orderResult.error.message
        );

        return;
      }

      if (!orderResult.data) {
        alert(
          "Order could not be created."
        );

        return;
      }

      const createdOrder =
        orderResult.data;

      const orderId =
        createdOrder.id;

      console.log(
        "ORDER CREATED:",
        createdOrder
      );

      console.log(
        "ORDER ID:",
        orderId
      );

      // -----------------------------------------------------
      // CREATE ORDER ITEMS
      //
      // IMPORTANT:
      // Your actual columns are:
      //
      // order_id
      // product_id
      // product_name
      // product_price
      // quantity
      // subtotal
      //
      // NOT:
      // orderid
      // productid
      // productname
      // productprice
      // -----------------------------------------------------

      const orderItems = cartItems
        .map(function (item) {
          const product = getProduct(
            item.product_id
          );

          if (!product) {
            return null;
          }

          const productPrice =
            Number(product.price);

          const quantity =
            Number(item.quantity);

          return {
            order_id:
              orderId,

            product_id:
              product.id,

            product_name:
              product.name,

            product_price:
              productPrice,

            quantity:
              quantity,

            subtotal:
              productPrice * quantity,
          };
        })
        .filter(Boolean);

      console.log(
        "ORDER ITEMS:",
        orderItems
      );

      if (orderItems.length === 0) {
        alert(
          "Order was created, but no valid products were found."
        );

        return;
      }

      // -----------------------------------------------------
      // INSERT ORDER ITEMS
      // -----------------------------------------------------

      const itemsResult =
        await supabase
          .from("order_items")
          .insert(orderItems);

      if (itemsResult.error) {
        console.error(
          "ORDER ITEMS ERROR:",
          itemsResult.error
        );

        console.error(
          "ITEM ERROR MESSAGE:",
          itemsResult.error.message
        );

        console.error(
          "ITEM ERROR CODE:",
          itemsResult.error.code
        );

        console.error(
          "ITEM ERROR DETAILS:",
          itemsResult.error.details
        );

        console.error(
          "ITEM ERROR HINT:",
          itemsResult.error.hint
        );

        alert(
          "Order was created, but the products could not be added.\n\n" +
            itemsResult.error.message
        );

        return;
      }

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      console.log(
        "ORDER ITEMS CREATED SUCCESSFULLY"
      );

      console.log(
        "ORDER COMPLETE:",
        newOrderNumber
      );

      clearCart();

      setOrderNumber(
        newOrderNumber
      );

      setOrderPlaced(true);
    } catch (error) {
      console.error(
        "UNEXPECTED CHECKOUT ERROR:",
        error
      );

      alert(
        "Something went wrong while placing your order.\n\n" +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="min-h-screen bg-[#FBF9F6]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="animate-pulse">
            <div className="h-10 w-64 rounded-lg bg-gray-200" />

            <div className="mt-10 h-64 rounded-3xl bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // SUCCESS PAGE
  // =========================================================

  if (orderPlaced) {
    return (
      <section className="min-h-screen bg-[#FBF9F6]">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-3xl border border-[#E3E9F1] bg-white p-8 text-center shadow-[0_10px_40px_rgba(15,43,91,0.07)] sm:p-12">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle size={42} />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-[#C6922F]">
              Payment Verification Pending
            </p>

            <h1 className="mt-3 text-3xl font-bold text-[#0F2B5B] sm:text-4xl">
              Order Request Received
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-[#718096]">
              Your payment has been submitted
              for verification. Our team will
              verify the payment and confirm
              your order.
            </p>

            <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-[#F7FAFE] p-5">

              <p className="text-xs uppercase tracking-wider text-[#718096]">
                Order Number
              </p>

              <p className="mt-2 text-2xl font-bold text-[#0F2B5B]">
                {orderNumber}
              </p>

            </div>

            <p className="mt-6 text-sm text-[#718096]">
              Please keep this order number
              for future communication.
            </p>

            <a
              href="/"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#0F2B5B] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#17396F]"
            >
              Continue Shopping
            </a>

          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen bg-[#FBF9F6]">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F7FAFE] text-[#0F2B5B]">
            <ShoppingCart size={35} />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#0F2B5B]">
            Your cart is empty
          </h1>

          <p className="mt-3 text-[#718096]">
            Add a product to your cart
            before proceeding to checkout.
          </p>

          <a
            href="/"
            className="mt-7 inline-flex rounded-xl bg-[#0F2B5B] px-6 py-3.5 text-sm font-semibold text-white"
          >
            Continue Shopping
          </a>

        </div>
      </section>
    );
  }

  // =========================================================
  // CHECKOUT PAGE
  // =========================================================

  return (
    <section className="min-h-screen bg-[#FBF9F6]">

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">

        <a
          href="/cart"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition hover:gap-3"
        >
          <ArrowLeft size={17} />
          Back to Cart
        </a>

        <div className="mt-5">

          <h1 className="text-3xl font-bold text-[#0F2B5B] sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-[#718096]">
            Enter your details, pay using UPI,
            and submit your order request.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"
        >

          {/* CUSTOMER DETAILS */}

          <div className="space-y-6">

            <div className="rounded-3xl border border-[#E3E9F1] bg-white p-6 shadow-[0_4px_20px_rgba(15,43,91,0.04)] sm:p-8">

              <h2 className="text-xl font-bold text-[#0F2B5B]">
                Customer Details
              </h2>

              <p className="mt-1 text-sm text-[#718096]">
                Fields marked with * are required.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div className="sm:col-span-2">

                  <label className="text-sm font-semibold text-[#334155]">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

                <div>

                  <label className="text-sm font-semibold text-[#334155]">
                    Mobile Number *
                  </label>

                  <input
                    type="tel"
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel"
                    className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

                <div>

                  <label className="text-sm font-semibold text-[#334155]">
                    Email
                  </label>

                  <input
                    type="email"
                    name="customerEmail"
                    value={form.customerEmail}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

              </div>

            </div>

            {/* DELIVERY */}

            <div className="rounded-3xl border border-[#E3E9F1] bg-white p-6 shadow-[0_4px_20px_rgba(15,43,91,0.04)] sm:p-8">

              <h2 className="text-xl font-bold text-[#0F2B5B]">
                Delivery Details
              </h2>

              <div className="mt-6 space-y-5">

                <div>

                  <label className="text-sm font-semibold text-[#334155]">
                    Address *
                  </label>

                  <textarea
                    name="shippingAddress"
                    value={form.shippingAddress}
                    onChange={handleChange}
                    placeholder="House / Shop number, street, area"
                    rows={4}
                    required
                    autoComplete="street-address"
                    className="mt-2 w-full resize-none rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

                <div className="grid gap-5 sm:grid-cols-3">

                  <div>

                    <label className="text-sm font-semibold text-[#334155]">
                      City *
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                      autoComplete="address-level2"
                      className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-semibold text-[#334155]">
                      State *
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                      autoComplete="address-level1"
                      className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                    />

                  </div>

                  <div>

                    <label className="text-sm font-semibold text-[#334155]">
                      Pincode *
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="6-digit PIN"
                      required
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                    />

                  </div>

                </div>

                <div>

                  <label className="text-sm font-semibold text-[#334155]">
                    Additional Note
                  </label>

                  <textarea
                    name="customerNote"
                    value={form.customerNote}
                    onChange={handleChange}
                    placeholder="Any specific requirement or message?"
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ORDER SUMMARY */}

          <div className="lg:sticky lg:top-24 lg:h-fit">

            <div className="rounded-3xl border border-[#E3E9F1] bg-white p-6 shadow-[0_4px_20px_rgba(15,43,91,0.05)]">

              <h2 className="text-xl font-bold text-[#0F2B5B]">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">

                {cartItems.map(function (item) {
                  const product = getProduct(
                    item.product_id
                  );

                  if (!product) {
                    return null;
                  }

                  return (
                    <div
                      key={item.product_id}
                      className="flex gap-3"
                    >

                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7FAFE]">

                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-[#0F2B5B]">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-[#718096]">
                          Qty: {item.quantity}
                        </p>

                      </div>

                      <p className="text-sm font-semibold text-[#0F2B5B]">
                        ₹
                        {(
                          Number(product.price) *
                          Number(item.quantity)
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>
                  );
                })}

              </div>

              <div className="my-6 border-t border-[#E8EDF2]" />

              <div className="space-y-4">

                <div className="flex justify-between text-sm">

                  <span className="text-[#718096]">
                    Subtotal
                  </span>

                  <span className="font-semibold text-[#0F2B5B]">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="flex justify-between text-sm">

                  <span className="text-[#718096]">
                    Shipping
                  </span>

                  <span className="font-semibold text-green-600">
                    Free
                  </span>

                </div>

                <div className="border-t border-[#E8EDF2]" />

                <div className="flex items-center justify-between">

                  <span className="text-base font-semibold text-[#0F2B5B]">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-[#0F2B5B]">
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

              {/* ================================================= */}
              {/* UPI PAYMENT */}
              {/* ================================================= */}

              <div className="mt-6 rounded-2xl border border-[#E3E9F1] bg-white p-5 text-center">

                <h3 className="text-lg font-bold text-[#0F2B5B]">
                  Pay Using UPI
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#718096]">
                  Scan this QR code using
                  PhonePe, Google Pay, Paytm
                  or any other UPI app.
                </p>

                <div className="mt-5 flex justify-center">

                  <img
                    src="/phonepe-qr.jpeg"
                    alt="Paramnano Computers UPI QR"
                    className="h-64 w-64 rounded-xl object-contain"
                  />

                </div>
<p className="mt-3 text-center text-sm text-[#718096]">
  This QR code belongs to Param Computers. The QR payment name is
  <span className="font-semibold text-[#0F2B5B]">
    {" "}Paramnano Computers
  </span>.
</p>
                <div className="mt-5 rounded-xl bg-[#F7F9FC] px-4 py-3">

                  <p className="text-xs font-medium text-[#718096]">
                    Please pay exactly
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#0F2B5B]">
                    ₹
                    {totalAmount.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

                <p className="mt-4 text-xs leading-5 text-[#718096]">
                  After completing the UPI
                  payment, enter your UPI
                  Transaction ID / UTR Number
                  below and click "Place Order
                  Request". Your payment will be
                  verified by Param Computers
                  before the order is confirmed.
                </p>

                {/* ================================================= */}
                {/* UPI TRANSACTION ID */}
                {/* ================================================= */}

                <div className="mt-5 text-left">

                  <label className="text-sm font-semibold text-[#334155]">
                    UPI Transaction ID / UTR Number *
                  </label>

                  <input
                    type="text"
                    name="upiTransactionId"
                    value={form.upiTransactionId}
                    onChange={handleChange}
                    placeholder="Enter your UPI transaction ID / UTR"
                    required
                    autoComplete="off"
                    className="mt-2 w-full rounded-xl border border-[#DDE3EA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#718096]">
                    You can find this number in your
                    UPI payment app after completing
                    the payment.
                  </p>

                </div>

              </div>

              {/* PAYMENT / ORDER NOTICE */}

              <div className="mt-6 rounded-2xl border border-[#E6D5B8] bg-[#F8F0E3] p-4">

                <p className="text-xs leading-5 text-[#70552E]">
                  Please make the payment for
                  the exact amount shown above.
                  Your payment will be manually
                  verified by Param Computers
                  before your order is confirmed.
                </p>

              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2B5B] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#17396F] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {placingOrder ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Placing Order...
                  </>
                ) : (
                  "Place Order Request"
                )}

              </button>

              <p className="mt-3 text-center text-xs leading-5 text-[#94A3B8]">
                Payment verification is
                completed manually by Param
                Computers.
              </p>

            </div>

          </div>

        </form>

      </div>

    </section>
  );
}