import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Mail, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import api from "../../utils/api";

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("We are verifying your email address. Please wait...");
  const hasCalled = useRef(false);

  useEffect(() => {
    // Avoid double API calls in React StrictMode
    if (hasCalled.current) return;
    hasCalled.current = true;

    const performVerification = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(response.data.message || "Your email address has been successfully verified!");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "The email verification link is invalid or has expired. Please try registering again."
        );
      }
    };

    if (token) {
      performVerification();
    } else {
      setStatus("error");
      setMessage("Verification token is missing.");
    }
  }, [token]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 px-4 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/10 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse-slow"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Email Verification
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Resource Allocation & Workforce Management
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

          {/* Verifying Spinner */}
          {status === "verifying" && (
            <div className="py-6 flex flex-col items-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-lg font-semibold text-slate-200 mb-2">Verifying...</h2>
              <p className="text-slate-400 text-sm max-w-xs">{message}</p>
            </div>
          )}

          {/* Success Panel */}
          {status === "success" && (
            <div className="py-6 flex flex-col items-center animate-fadeIn">
              <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-4">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Verification Successful</h2>
              <p className="text-slate-400 text-sm max-w-xs mb-6">{message}</p>
              
              <Link
                to="/login?verified=true"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-600/20"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Error Panel */}
          {status === "error" && (
            <div className="py-6 flex flex-col items-center animate-fadeIn">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400 mb-4">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Verification Failed</h2>
              <p className="text-slate-400 text-sm max-w-xs mb-6">{message}</p>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-medium text-sm transition-colors"
              >
                <span>Back to Registration</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
