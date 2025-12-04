import React, { useEffect, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export default function MagicLinkLanding() {
  const { loginWithJwt } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    async function verify() {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      if (!token) {
        setStatus("no-token");
        return;
      }
      try {
        setStatus("verifying");
        const res = await API.post("/auth/verify", {
          method: "email",
          type: "magic_link",
          token,
          purpose: "login",
        });
        if (res.data?.success) {
          const jwt = res.data.data.token;
          const user = res.data.data.user;
          loginWithJwt(jwt, user);
          setStatus("success");
          setTimeout(() => navigate("/dashboard"), 600);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error(err);
        setStatus("failed");
      }
    }
    verify();
  }, [location.search, loginWithJwt, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          ✉️ Email Verification
        </h3>

        {status === "verifying" && (
          <p className="text-indigo-600 font-medium">Verifying… please wait</p>
        )}
        {status === "success" && (
          <p className="text-green-600 font-semibold">
            ✅ Verified — redirecting…
          </p>
        )}
        {status === "failed" && (
          <p className="text-red-600 font-semibold">
            ❌ Verification failed or token expired.
          </p>
        )}
        {status === "no-token" && (
          <p className="text-gray-600 font-medium">⚠️ No token found.</p>
        )}
      </div>
    </div>
  );
}