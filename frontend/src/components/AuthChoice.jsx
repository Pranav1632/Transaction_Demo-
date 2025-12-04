import React from "react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../assets/google.svg";
import GithubIcon from "../assets/github.svg";
import DashboardGif from "../assets/Dashboards.gif";

export default function AuthChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-4xl">
        {/* Left: Sign-in options */}
        <div className="md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to PG</h2>
          <p className="text-gray-600 mb-6">Choose how you'd like to sign in</p>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/phone")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📱 Sign in with Phone
            </button>
            <button
              onClick={() => navigate("/email")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📧 Sign in with Email
            </button>
            <div className="flex items-center justify-center gap-4 mt-4">
              <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
  <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
  Google
</button>

               <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
  <img src={GithubIcon} alt="Github" className="w-5 h-5" />
  Github
</button>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-indigo-600 hover:underline cursor-pointer"
            >
              Register for free
            </span>
          </p>
        </div>

        {/* Right: Illustration */}
       <div className="md:w-1/2 bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center p-6">
  <img
    src={DashboardGif}
    alt="Dashboard Illustration"
    className="w-full max-w-sm"
  />
</div>

      </div>
    </div>
  );
}