// src/components/DonateModal.jsx  (or wherever your DonateModal lives)
import React, { useState, useRef, useEffect } from "react";
import API from "../api/apiClient";
import PaymentAnimatedModal from "../components/PaymentAnimatedModal";

export default function DonateModal() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // UI modal + status: 'idle' | 'processing' | 'success' | 'failure'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const currentDonationId = useRef(null);

  // Polling refs so we can clear on unmount
  const pollIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Start polling donation status from backend until it becomes 'paid' or timeout
  const startStatusPolling = (donationId, {
    intervalMs = 3000,
    maxAttempts = 20, // ~60 seconds by default (20 * 3s)
  } = {}) => {
    // reset attempts
    pollAttemptsRef.current = 0;
    // clear any previous interval
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      try {
        const statusRes = await API.get(`/donations/${donationId}/status`);
        const status = statusRes?.data?.data?.status;
        if (status === "paid") {
          // success!
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPaymentStatus("success");
          // optional: close modal after short delay or let user click View receipt
          setTimeout(() => {
            setPaymentModalOpen(false);
            setPaymentStatus("idle");
            // reload or update dashboard state if needed
            window.location.reload();
          }, 1800);
        } else {
          // still pending / created / authorized etc; keep waiting until max
          if (pollAttemptsRef.current >= maxAttempts) {
            // timed out -> show failure or pending state
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
            setPaymentStatus("failure");
          }
        }
      } catch (err) {
        // network / server error while polling
        console.error("Polling donation status error:", err);
        if (pollAttemptsRef.current >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPaymentStatus("failure");
        }
      }
    }, intervalMs);
  };

  async function startDonate() {
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    setLoading(true);

    try {
      // create order in backend
      const res = await API.post("/donations/create", { amount: Number(amount) });
      // adapt to your backend response shape
      const { orderId, donationId, amount: amountPaise, key_id } = res.data.data;

      // store donationId for later polling or reference
      currentDonationId.current = donationId;

      // open modal and set processing state
      setPaymentModalOpen(true);
      setPaymentStatus("processing");

      // prepare Razorpay options
      const options = {
        key: key_id,
        amount: amountPaise,
        currency: "INR",
        name: "Your App Name",
        description: "Donation",
        order_id: orderId,
        handler: function (response) {
          // This handler runs when Razorpay returns success to client.
          // But webhook is the source of truth — so we poll the backend until webhook confirms.
          // Keep modal in 'processing' state and start polling
          setPaymentStatus("processing");
          startStatusPolling(donationId, { intervalMs: 3000, maxAttempts: 30 });
        },
        modal: {
          ondismiss: function () {
            // user closed Razorpay checkout; still may have completed payment outside
            // we'll start a short poll once to check status (optional)
            setPaymentStatus("processing");
            startStatusPolling(donationId, { intervalMs: 3000, maxAttempts: 6 }); // ~18s
          },
        },
        prefill: { name: "", email: "" }, // provide if available
        theme: { color: "#2b8bf2" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Create order error:", err);
      alert(err?.response?.data?.error?.message || "Failed to create order");
      setPaymentStatus("failure");
    } finally {
      setLoading(false);
    }
  }

  // onClose handler passed to PaymentAnimatedModal
  const handleModalClose = () => {
    // avoid closing while processing to prevent interrupting UX
    if (paymentStatus === "processing") {
      // optionally show a toast instead of alert
      return;
    }

    // clear poll if any
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setPaymentModalOpen(false);
    setPaymentStatus("idle");
    currentDonationId.current = null;
  };

  // onRetry handler passed to PaymentAnimatedModal
  const handleRetry = () => {
    // Reset status and re-run the flow; simple retry strategy: start a fresh create & checkout
    setPaymentModalOpen(false);
    setPaymentStatus("idle");

    // small timeout so modal state resets visually before re-opening
    setTimeout(() => {
      startDonate();
    }, 200);
  };

  return (
    <div style={{ padding: 12 }}>
      <input
        placeholder="Amount in INR"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        type="number"
        min="1"
        style={{ padding: 8, marginRight: 8 }}
      />
      <button onClick={startDonate} disabled={loading}>
        {loading ? "Starting..." : "Donate"}
      </button>

      <PaymentAnimatedModal
        open={paymentModalOpen}
        status={paymentStatus}
        amount={amount}
        onClose={handleModalClose}
        onRetry={handleRetry}
      />
    </div>
  );
}
