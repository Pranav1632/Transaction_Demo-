// src/pages/DonatePage.jsx
import React, { useState, useRef, useEffect } from "react";
import API from "../api/apiClient";
import PaymentAnimatedModal from "../components/PaymentAnimatedModal";

export default function DonatePage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // modal + status: 'idle' | 'processing' | 'success' | 'failure'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const currentDonationId = useRef(null);

  // polling refs
  const pollIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll backend donation status until 'paid' or timeout
  const startStatusPolling = (donationId, { intervalMs = 3000, maxAttempts = 30 } = {}) => {
    pollAttemptsRef.current = 0;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    console.log("startStatusPolling for", donationId);
    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      try {
        console.log("Polling attempt", pollAttemptsRef.current);
        const statusRes = await API.get(`/donations/${donationId}/status`);
        const status = statusRes?.data?.data?.status;
        console.log("Polled status:", status);

        if (status === "paid") {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPaymentStatus("success");

          // keep modal open — DO NOT auto-navigate or auto-close; let user see success animation
          // optionally you can show a small toast here or enable the "View receipt" button
          return;
        }

        if (pollAttemptsRef.current >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPaymentStatus("failure");
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (pollAttemptsRef.current >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPaymentStatus("failure");
        }
      }
    }, intervalMs);
  };

  async function startDonate() {
    if (!amount || Number(amount) <= 0) {
      return alert("Enter valid amount");
    }
    setLoading(true);

    try {
      const res = await API.post("/donations/create", { amount: Number(amount) });
      const { orderId, donationId, amount: amountPaise, key_id } = res.data.data;

      console.log("Order created:", { orderId, donationId, amountPaise, key_id });

      currentDonationId.current = donationId;

      // open modal and set to processing
      setPaymentModalOpen(true);
      setPaymentStatus("processing");

      const options = {
        key: key_id,
        amount: amountPaise,
        currency: "INR",
        name: "Your App Name",
        description: "Donation",
        order_id: orderId,
        handler: function (response) {
          console.log("Razorpay handler called:", response);
          // Start polling: webhook is source of truth
          setPaymentStatus("processing");
          startStatusPolling(donationId, { intervalMs: 3000, maxAttempts: 30 });
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay modal dismissed");
            // user may have paid externally (UPI app) — check a few times
            setPaymentStatus("processing");
            startStatusPolling(donationId, { intervalMs: 3000, maxAttempts: 6 });
          },
        },
        prefill: { name: "", email: "" },
        theme: { color: "#2b8bf2" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Create order error:", err);
      // open modal to show failure state (so they can retry)
      setPaymentModalOpen(true);
      setPaymentStatus("failure");
    } finally {
      setLoading(false);
    }
  }

  // Close handler — allow closing unless processing
  const handleModalClose = () => {
    if (paymentStatus === "processing") {
      // Prevent closing while processing; you can show a toast instead
      console.log("Close prevented while processing");
      return;
    }
    // cleanup poll if any
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setPaymentModalOpen(false);
    setPaymentStatus("idle");
    currentDonationId.current = null;
  };

  // Retry: simple retry that restarts the flow
  const handleRetry = () => {
    setPaymentModalOpen(false);
    setPaymentStatus("idle");
    setTimeout(() => startDonate(), 200);
  };

  // Optional: open receipt page when user clicks View receipt after success
  const handleViewReceipt = () => {
    if (!currentDonationId.current) return;
    // replace with your receipt route
    window.location.href = `/receipt/${currentDonationId.current}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-2 text-center">
          💖 Support Our Mission
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Enter the amount you'd like to donate. Every contribution counts!
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Donation Amount (INR)
        </label>
        <input
          type="number"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="button"
          onClick={startDonate}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-pink-600 text-white hover:bg-pink-700"
          }`}
        >
          {loading ? "Processing..." : "Donate Now"}
        </button>

        <div className="text-xs text-gray-400 text-center mt-4">
          Secured by Razorpay • Test Mode
        </div>
      </div>

      <PaymentAnimatedModal
        open={paymentModalOpen}
        status={paymentStatus}
        amount={amount}
        message={undefined}
        onClose={handleModalClose}
        onRetry={handleRetry}
      />
    </div>
  );
}
