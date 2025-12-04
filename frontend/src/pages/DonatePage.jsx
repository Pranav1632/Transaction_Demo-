// src/pages/DonatePage.jsx
import React, { useState } from "react";
import API from "../api/apiClient";

export default function DonatePage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function startDonate() {
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    setLoading(true);
    try {
      const res = await API.post("/donations/create", { amount: Number(amount) });
      const { orderId, donationId, amount: amountPaise, key_id } = res.data.data;

      const options = {
        key: key_id,
        amount: amountPaise,
        currency: "INR",
        name: "Your App Name",
        description: "Donation",
        order_id: orderId,
        handler: async function (response) {
          alert("Payment initiated. Waiting for confirmation...");
          const poll = async () => {
            const statusRes = await API.get(`/donations/${donationId}/status`);
            if (statusRes.data.data.status === "paid") {
              alert("Donation successful — thank you!");
              window.location.href = "/dashboard"; // redirect back
            }
          };
          setTimeout(poll, 2000);
        },
        theme: { color: "#2b8bf2" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err?.response?.data?.error?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  }

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
  </div>
);
}