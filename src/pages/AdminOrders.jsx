import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Eye,
  Package,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("pending");

  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  async function loadOrders() {
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
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("ORDER LOAD ERROR:", error);
        setErrorMessage(error.message);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("UNEXPECTED ORDER LOAD ERROR:", error);

      setErrorMessage(
        error?.message || "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================================================
  // LOAD ORDER ITEMS
  // =========================================================

  async function openOrder(order) {
    try {
      setActionLoading(true);

      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (error) {
        console.error(
          "ORDER ITEMS LOAD ERROR:",
          error
        );

        alert(
          "Unable to load order products.\n\n" +
            error.message
        );

        return;
      }

      setSelectedOrder({
        ...order,
        items: data || [],
      });
    } catch (error) {
      console.error(
        "OPEN ORDER ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to open this order."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =========================================================
  // CONFIRM PAYMENT
  // =========================================================

  async function handleConfirmPayment(order) {
    const confirmed = window.confirm(
      `Confirm that payment of ₹${Number(
        order.total_amount || 0
      ).toLocaleString(
        "en-IN"
      )} has been received for order ${order.order_number}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const updatedAt =
        new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "Paid",
          order_status: "Confirmed",
          updated_at: updatedAt,
        })
        .eq("id", order.id);

      if (error) {
        console.error(
          "PAYMENT CONFIRMATION ERROR:",
          error
        );

        alert(
          "Unable to confirm payment.\n\n" +
            error.message
        );

        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item.id === order.id
            ? {
                ...item,
                payment_status: "Paid",
                order_status: "Confirmed",
                updated_at: updatedAt,
              }
            : item
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder &&
        currentOrder.id === order.id
          ? {
              ...currentOrder,
              payment_status: "Paid",
              order_status: "Confirmed",
              updated_at: updatedAt,
            }
          : currentOrder
      );

      alert(
        "Payment confirmed and order confirmed successfully."
      );
    } catch (error) {
      console.error(
        "UNEXPECTED CONFIRMATION ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to confirm payment."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =========================================================
  // REJECT PAYMENT
  // =========================================================

  async function handleRejectPayment(order) {
    const confirmed = window.confirm(
      `Reject payment verification for order ${order.order_number}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const updatedAt =
        new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "Rejected",
          order_status: "Cancelled",
          updated_at: updatedAt,
        })
        .eq("id", order.id);

      if (error) {
        console.error(
          "PAYMENT REJECTION ERROR:",
          error
        );

        alert(
          "Unable to reject payment.\n\n" +
            error.message
        );

        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item.id === order.id
            ? {
                ...item,
                payment_status: "Rejected",
                order_status: "Cancelled",
                updated_at: updatedAt,
              }
            : item
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder &&
        currentOrder.id === order.id
          ? {
              ...currentOrder,
              payment_status: "Rejected",
              order_status: "Cancelled",
              updated_at: updatedAt,
            }
          : currentOrder
      );

      alert(
        "Payment rejected and order cancelled."
      );
    } catch (error) {
      console.error(
        "UNEXPECTED REJECTION ERROR:",
        error
      );

      alert(
        error?.message ||
          "Unable to reject payment."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredOrders = orders.filter(
    (order) => {
      const search =
        searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        order.order_number
          ?.toLowerCase()
          .includes(search) ||
        order.customer_name
          ?.toLowerCase()
          .includes(search) ||
        order.customer_phone
          ?.toLowerCase()
          .includes(search) ||
        order.customer_email
          ?.toLowerCase()
          .includes(search);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "pending") {
        return (
          order.payment_status ===
            "Pending Verification" ||
          order.order_status ===
            "Pending Confirmation"
        );
      }

      if (filter === "confirmed") {
        return (
          order.payment_status === "Paid" ||
          order.order_status === "Confirmed"
        );
      }

      if (filter === "rejected") {
        return (
          order.payment_status ===
            "Rejected" ||
          order.order_status === "Cancelled"
        );
      }

      return true;
    }
  );

  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  // =========================================================
  // PAYMENT STATUS
  // =========================================================

  function PaymentStatus({ order }) {
    if (
      order.payment_status ===
      "Pending Verification"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <Clock size={13} />
          Pending Verification
        </span>
      );
    }

    if (
      order.payment_status === "Paid"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle size={13} />
          Paid
        </span>
      );
    }

    if (
      order.payment_status ===
      "Rejected"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
          <XCircle size={13} />
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
        {order.payment_status || "Unknown"}
      </span>
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <section className="min-h-screen bg-[#FBF9F6]">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#DDE3EA] border-t-[#0F2B5B]" />

          <p className="mt-4 text-sm text-[#718096]">
            Loading orders...
          </p>

        </div>
      </section>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-[#FBF9F6]">

      {/* =====================================================
          MAIN CONTENT
          AdminNavbar is provided by App.jsx
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* PAGE TITLE */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate("/admin")
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DDE3EA] bg-white text-[#0F2B5B] transition hover:bg-[#F7F9FC]"
                title="Back to dashboard"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F2B5B] text-white">
                <Package size={22} />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-[#0F2B5B]">
                  Orders
                </h1>

                <p className="mt-1 text-sm text-[#718096]">
                  {orders.length} orders in database
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#DDE3EA] bg-white px-4 py-3 text-sm font-semibold text-[#0F2B5B] transition hover:bg-[#F7F9FC]"
          >
            <RefreshCw size={17} />
            Refresh
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
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search order number, customer or phone..."
              className="w-full rounded-xl border border-[#DDE3EA] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#0F2B5B] focus:ring-2 focus:ring-[#0F2B5B]/10"
            />

          </div>

        </div>

        {/* FILTERS */}

        <div className="mt-5 flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              setFilter("pending")
            }
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              filter === "pending"
                ? "bg-[#0F2B5B] text-white"
                : "border border-[#DDE3EA] bg-white text-[#0F2B5B]"
            }`}
          >
            Pending Verification
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("confirmed")
            }
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              filter === "confirmed"
                ? "bg-[#0F2B5B] text-white"
                : "border border-[#DDE3EA] bg-white text-[#0F2B5B]"
            }`}
          >
            Confirmed
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("rejected")
            }
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              filter === "rejected"
                ? "bg-[#0F2B5B] text-white"
                : "border border-[#DDE3EA] bg-white text-[#0F2B5B]"
            }`}
          >
            Rejected
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter("all")
            }
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              filter === "all"
                ? "bg-[#0F2B5B] text-white"
                : "border border-[#DDE3EA] bg-white text-[#0F2B5B]"
            }`}
          >
            All Orders
          </button>

        </div>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* NO ORDERS */}

        {filteredOrders.length === 0 ? (

          <div className="mt-8 rounded-2xl border border-[#E3E9F1] bg-white px-6 py-16 text-center">

            <Package
              size={42}
              className="mx-auto text-[#94A3B8]"
            />

            <h3 className="mt-4 text-lg font-semibold text-[#0F2B5B]">
              No orders found
            </h3>

            <p className="mt-2 text-sm text-[#718096]">
              {filter === "pending"
                ? "There are no orders waiting for payment verification."
                : "No orders match your current filter or search."}
            </p>

          </div>

        ) : (

          /* ORDER TABLE */

          <div className="mt-8 overflow-hidden rounded-2xl border border-[#E3E9F1] bg-white">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px]">

                <thead className="border-b border-[#E3E9F1] bg-[#F8FAFC]">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Order
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Order Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#718096]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map(
                    (order) => (

                      <tr
                        key={order.id}
                        className="border-b border-[#EEF2F6] last:border-b-0"
                      >

                        {/* ORDER */}

                        <td className="px-5 py-5">

                          <p className="font-semibold text-[#0F2B5B]">
                            {order.order_number}
                          </p>

                          <p className="mt-1 text-xs text-[#718096]">
                            {order.payment_method ||
                              "UPI"}
                          </p>

                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-5">

                          <p className="font-semibold text-[#0F2B5B]">
                            {order.customer_name ||
                              "—"}
                          </p>

                          <p className="mt-1 text-xs text-[#718096]">
                            {order.customer_phone ||
                              "—"}
                          </p>

                        </td>

                        {/* AMOUNT */}

                        <td className="px-5 py-5">

                          <p className="font-bold text-[#0F2B5B]">
                            ₹
                            {Number(
                              order.total_amount ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </td>

                        {/* PAYMENT */}

                        <td className="px-5 py-5">

                          <PaymentStatus
                            order={order}
                          />

                        </td>

                        {/* ORDER STATUS */}

                        <td className="px-5 py-5">

                          <span className="text-sm font-medium text-[#475569]">
                            {order.order_status ||
                              "—"}
                          </span>

                        </td>

                        {/* DATE */}

                        <td className="px-5 py-5">

                          <span className="text-xs text-[#718096]">
                            {formatDate(
                              order.created_at
                            )}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end">

                            <button
                              type="button"
                              onClick={() =>
                                openOrder(
                                  order
                                )
                              }
                              disabled={
                                actionLoading
                              }
                              className="flex items-center gap-2 rounded-lg bg-[#0F2B5B] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#17396F] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Eye size={16} />
                              Review
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

      {/* =====================================================
          ORDER DETAIL MODAL
      ====================================================== */}

      {selectedOrder && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-[#E3E9F1] bg-white px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C6922F]">
                  Order Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#0F2B5B]">
                  {selectedOrder.order_number}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE3EA] text-[#0F2B5B] hover:bg-[#F7F9FC]"
              >
                <XCircle size={18} />
              </button>

            </div>

            {/* MODAL CONTENT */}

            <div className="space-y-6 p-6">

              {/* CUSTOMER */}

              <div className="rounded-2xl bg-[#F8FAFC] p-5">

                <h3 className="font-bold text-[#0F2B5B]">
                  Customer Details
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">

                  <div>

                    <p className="text-xs text-[#718096]">
                      Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#0F2B5B]">
                      {selectedOrder.customer_name ||
                        "—"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-[#718096]">
                      Mobile
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#0F2B5B]">
                      {selectedOrder.customer_phone ||
                        "—"}
                    </p>

                  </div>

                  <div className="sm:col-span-2">

                    <p className="text-xs text-[#718096]">
                      Email
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#0F2B5B]">
                      {selectedOrder.customer_email ||
                        "Not provided"}
                    </p>

                  </div>

                </div>

              </div>

              {/* PRODUCTS */}

              <div>

                <h3 className="font-bold text-[#0F2B5B]">
                  Products
                </h3>

                <div className="mt-3 space-y-3">

                  {selectedOrder.items &&
                  selectedOrder.items.length > 0 ? (

                    selectedOrder.items.map(
                      (item) => (

                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-2xl border border-[#E3E9F1] p-4"
                        >

                          <div>

                            <p className="font-semibold text-[#0F2B5B]">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-xs text-[#718096]">
                              Qty:{" "}
                              {item.quantity} × ₹
                              {Number(
                                item.product_price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                          </div>

                          <p className="font-bold text-[#0F2B5B]">
                            ₹
                            {Number(
                              item.subtotal || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      )
                    )

                  ) : (

                    <p className="text-sm text-[#718096]">
                      No products found.
                    </p>

                  )}

                </div>

              </div>

              {/* DELIVERY */}

              <div className="rounded-2xl border border-[#E3E9F1] p-5">

                <h3 className="font-bold text-[#0F2B5B]">
                  Delivery Details
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#475569]">

                  {selectedOrder.shipping_address ||
                    "—"}

                  <br />

                  {selectedOrder.city},{" "}
                  {selectedOrder.state}{" "}
                  {selectedOrder.pincode}

                </p>

              </div>

              {/* PAYMENT */}

              <div className="rounded-2xl border border-[#E3E9F1] p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs text-[#718096]">
                      Payment Method
                    </p>

                    <p className="mt-1 font-semibold text-[#0F2B5B]">
                      {selectedOrder.payment_method ||
                        "UPI"}
                    </p>

                  </div>

                  <PaymentStatus
                    order={selectedOrder}
                  />

                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#E8EDF2] pt-5">

                  <span className="font-semibold text-[#0F2B5B]">
                    Total Amount
                  </span>

                  <span className="text-2xl font-bold text-[#0F2B5B]">
                    ₹
                    {Number(
                      selectedOrder.total_amount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

              {/* CUSTOMER NOTE */}

              {selectedOrder.customer_note && (

                <div className="rounded-2xl bg-[#F8F0E3] p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-[#70552E]">
                    Customer Note
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#70552E]">
                    {selectedOrder.customer_note}
                  </p>

                </div>

              )}

              {/* PAYMENT ACTIONS */}

              {selectedOrder.payment_status ===
                "Pending Verification" && (

                <div className="rounded-2xl border border-[#E6D5B8] bg-[#F8F0E3] p-5">

                  <p className="text-sm leading-6 text-[#70552E]">
                    Check your bank / UPI account
                    and confirm that the exact
                    amount has actually been
                    received before confirming this
                    order.
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                    <button
                      type="button"
                      disabled={
                        actionLoading
                      }
                      onClick={() =>
                        handleConfirmPayment(
                          selectedOrder
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle size={18} />
                      Confirm Payment & Order
                    </button>

                    <button
                      type="button"
                      disabled={
                        actionLoading
                      }
                      onClick={() =>
                        handleRejectPayment(
                          selectedOrder
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle size={18} />
                      Reject Payment
                    </button>

                  </div>

                </div>

              )}

              {/* CONFIRMED */}

              {selectedOrder.payment_status ===
                "Paid" && (

                <div className="rounded-2xl border border-green-200 bg-green-50 p-5">

                  <div className="flex items-center gap-3">

                    <CheckCircle
                      size={22}
                      className="text-green-600"
                    />

                    <div>

                      <p className="font-bold text-green-800">
                        Payment Verified
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        This order has been
                        confirmed.
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {/* REJECTED */}

              {selectedOrder.payment_status ===
                "Rejected" && (

                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

                  <div className="flex items-center gap-3">

                    <XCircle
                      size={22}
                      className="text-red-600"
                    />

                    <div>

                      <p className="font-bold text-red-800">
                        Payment Rejected
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        This order has been
                        cancelled.
                      </p>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}