import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export default function OTPInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithJwt } = useContext(AuthContext);

  const verify = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/verify", {
        method: "phone",
        phone,
        code,
        purpose: "login",
      });
      setLoading(false);
      if (res.data?.success) {
        const jwt = res.data.data.token;
        const user = res.data.data.user;
        loginWithJwt(jwt, user);
        navigate("/dashboard");
      } else {
        alert(res.data?.error?.message || "Verification failed");
      }
    } catch (err) {
      setLoading(false);
      alert(err?.response?.data?.error?.message || "Verification failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          🔐 Enter OTP
        </h3>
        <p className="text-gray-600 mb-6 text-center">
          OTP sent to <span className="font-mono font-semibold">{phone}</span>
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="123456"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 text-center tracking-widest font-mono"
        />

        <button
          onClick={verify}
          disabled={loading || code.length < 3}
          className={`w-full py-3 rounded-lg font-semibold text-white transition 
            ${loading || code.length < 3
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-md"}`}
        >
          {loading ? "Verifying…" : "Verify"}
        </button>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            ⬅ Back
          </button>
        </div>
      </div>
    </div>
  );
}