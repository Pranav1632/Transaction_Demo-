// PaymentAnimatedModal.jsx
import React, { useEffect } from "react";
import Lottie from "react-lottie-player";
import successGif from "../assets/payment_success1.gif"; // adjust path if different

// Example Lottie URLs (free on LottieFiles). Replace with your chosen JSONs.
const PROCESSING_JSON = "https://lottie.host/58ee4159-f297-4b8c-8f84-715be621b40c/k67P7zVF2L.lottie"; // spinner / loading
const SUCCESS_JSON = "https://lottie.host/66a93cd2-2859-49d2-9b7d-f2dc53d7644d/RYBBj1ng2L.lottie"; // success check/confetti
const ERROR_JSON = "https://lottie.host/a187d8bd-d865-4a0b-9479-46bc8670879f/atjXDgzBvH.lottie"; // error / warning

/**
 * Props:
 * - open: boolean
 * - status: 'idle' | 'processing' | 'success' | 'failure'
 * - amount: number (optional, display)
 * - message: string optional custom text under animation
 * - onClose: () => void
 * - onRetry: () => void
 */
export default function PaymentAnimatedModal({
  open,
  status = "idle",
  amount,
  message,
  onClose,
  onRetry,
}) {
  useEffect(() => {
    // Prevent background scroll when modal open
    if (open) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  const getAnimation = () => {
    if (status === "processing") return { src: PROCESSING_JSON, loop: true, speed: 1 };
    if (status === "success") return { src: SUCCESS_JSON, loop: false, speed: 1 };
    if (status === "failure") return { src: ERROR_JSON, loop: false, speed: 1 };
    return { src: PROCESSING_JSON, loop: true, speed: 1 };
  };

  const anim = getAnimation();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal card */}
      <div
        className="relative z-10 max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()} // stop clicks bubbling to backdrop
      >
        {/* Amount / Title */}
        <div className="w-full flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {status === "processing" ? "Processing donation" :
               status === "success" ? "Payment successful" :
               status === "failure" ? "Payment failed" : "Payment"}
            </h3>
            {amount != null && (
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">₹{amount}</p>
            )}
          </div>

          {/* Close button (hidden while processing to prevent accidental close) */}
          <button
            onClick={onClose}
            className={`ml-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              status === "processing" ? "opacity-50 pointer-events-none" : ""
            }`}
            aria-label="Close dialog"
            title="Close"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lottie animation (lazy loaded by browser) */}
       <div className="w-76 h-76 flex items-center justify-center">
  {status === "success" ? (
    <img
      src={successGif}
      alt="Success"
      className="w-48 h-48 object-contain"
    />
  ) : (
    <Lottie
      loop={anim.loop}
      animationData={null}
      play
      rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
      style={{ width: "100%", height: "100%" }}
      src={anim.src}
      speed={anim.speed}
    />
  )}
</div>


        {/* Message */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-300 px-2">
          {message ||
            (status === "processing"
              ? "Please don't close your browser. We are confirming your payment."
              : status === "success"
              ? "Your donation has been received. Thank you for your support!"
              : "Something went wrong. You can retry or contact support.")}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          {status === "processing" && (
            <button
              className="px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-700 bg-white disabled:opacity-60"
              disabled
            >
              Processing...
            </button>
          )}

          {status === "success" && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
              >
                Close
              </button>
              <a
                href="#/receipt" // replace with actual receipt route or download link
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                onClick={onClose}
              >
                View receipt
              </a>
            </>
          )}

          {status === "failure" && (
            <>
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
