import React, { useState } from "react";
import API from "../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function PhoneStart() {
  const [digits, setDigits] = useState(""); // only the 10-digit part
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const send = async () => {
    try {
      setLoading(true);
      const fullNumber = `+91${digits}`; // attach +91 prefix
      await API.post("/auth/start", {
        method: "phone",
        target: fullNumber,
        purpose: "login",
      });
      setLoading(false);
      navigate("/otp", { state: { phone: fullNumber } });
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error?.message || "Failed to send OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          📱 Sign in with Phone
        </h3>

        {/* Phone input with +91 prefix */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mb-4">
          <span className="px-3 py-3 bg-gray-100 text-gray-700 font-semibold select-none">
            +91
          </span>
          <input
            type="tel"
            value={digits}
            onChange={(e) =>
              setDigits(e.target.value.replace(/\D/g, "").slice(0, 10))
            } // only digits, max 10
            placeholder="1234567890"
            className="flex-1 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={send}
          disabled={loading || digits.length !== 10}
          className={`w-full py-3 rounded-lg font-semibold text-white transition 
            ${
              loading || digits.length !== 10
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
            }`}
        >
          {loading ? "Sending…" : "Send OTP"}
        </button>

        <p className="mt-4 text-sm text-gray-500 text-center">
          We'll send a one-time code to your phone. Enter your 10-digit mobile
          number — the +91 prefix is already included.
        </p>
      </div>
    </div>
  );
}