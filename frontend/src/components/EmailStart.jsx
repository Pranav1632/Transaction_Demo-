import React, { useState } from "react";
import API from "../api/apiClient";

export default function EmailStart() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    try {
      setLoading(true);
      await API.post("/auth/start", { method: "email", target: email, purpose: "login" });
      setSent(true);
    } catch (err) {
      alert(err?.response?.data?.error?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          📧 Sign in with Email
        </h3>

        {!sent ? (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
            />

            <button
              onClick={send}
              disabled={!email || loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition 
                ${loading || !email
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-green-600 font-medium">
              ✅ Magic link sent to <span className="font-mono">{email}</span>.
            </p>
            <p className="text-gray-500 mt-2">Check your inbox to continue.</p>
          </div>
        )}
      </div>
    </div>
  );
}