// frontend/src/components/LinkMethod.jsx
import React, { useState, useContext } from "react";
import API from "../api/apiClient";
import { AuthContext } from "../context/AuthContext";

export default function LinkMethod() {
  const { user, loginWithJwt } = useContext(AuthContext);
  const [target, setTarget] = useState("");
  const [method, setMethod] = useState("email");
  const [step, setStep] = useState("idle"); // idle|sent|verifying|done
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const startLink = async () => {
    setMessage("");
    if (!target) return setMessage("Enter phone (+...) or email");
    setStep("sending");
    try {
      await API.post("/auth/start", { method, target, purpose: "link" });
      setStep("sent");
      setMessage("Verification sent. Check inbox/SMS.");
    } catch (err) {
      setMessage(err?.response?.data?.error?.message || "Failed to start linking");
      setStep("idle");
    }
  };

  const verifyLink = async () => {
    setMessage("");
    setStep("verifying");
    try {
      const payload = method === "phone"
        ? { method: "phone", phone: target, code, purpose: "link" }
        : { method: "email", type: "code", code, email: target, purpose: "link" };

      const res = await API.post("/auth/verify", payload);
      if (res.data?.success) {
        // server may return updated user only; update context if token provided
        const jwt = res.data.data?.token;
        const updatedUser = res.data.data?.user;
        if (jwt && updatedUser) loginWithJwt(jwt, updatedUser);
        setStep("done");
        setMessage("Method linked successfully.");
      } else {
        setMessage(res.data?.error?.message || "Verification failed");
        setStep("sent");
      }
    } catch (err) {
      setMessage(err?.response?.data?.error?.message || "Verification failed");
      setStep("sent");
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "16px auto", padding: 16, borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
      <h3 style={{ margin: 0 }}>Link another sign-in method</h3>
      <p style={{ marginTop: 8, color: "#555" }}>Your account: <strong>{user?.email || user?.phone}</strong></p>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="radio" checked={method === "email"} onChange={() => setMethod("email")} /> Email
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="radio" checked={method === "phone"} onChange={() => setMethod("phone")} /> Phone
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={method === "email" ? "you@example.com" : "+911234567890"}
          style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
        />
      </div>

      {step === "sent" && (
        <div style={{ marginTop: 12 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            style={{ width: "60%", padding: 10, borderRadius: 6, border: "1px solid #ddd", marginRight: 8 }}
          />
          <button onClick={verifyLink} style={{ padding: "10px 12px" }}>Verify</button>
        </div>
      )}

      {step === "idle" && <button onClick={startLink} style={{ marginTop: 12, padding: "10px 14px" }}>Start link</button>}
      {step === "sending" && <div style={{ marginTop: 12 }}>Sending…</div>}
      {step === "verifying" && <div style={{ marginTop: 12 }}>Verifying…</div>}
      {step === "done" && <div style={{ marginTop: 12, color: "green" }}>{message}</div>}
      {message && step !== "done" && <div style={{ marginTop: 12, color: "crimson" }}>{message}</div>}
    </div>
  );
}
