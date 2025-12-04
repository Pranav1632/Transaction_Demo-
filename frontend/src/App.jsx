// frontend/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PhoneStart from "./components/PhoneStart";
import EmailStart from "./components/EmailStart";
import OTPInput from "./components/OTPInput";
import MagicLinkLanding from "./components/MagicLinkLanding";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import DonatePage from "./pages/DonatePage";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/phone" element={<PhoneStart />} />
          <Route path="/email" element={<EmailStart />} />
          <Route path="/otp" element={<OTPInput />} />
          <Route path="/verify-email" element={<MagicLinkLanding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />
           <Route path="/donate" element={<DonatePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
