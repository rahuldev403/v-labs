import { useState, useEffect } from "react";
import {
  useSignInEmailPassword,
  useSignUpEmailPassword,
  useAuthenticationStatus,
} from "@nhost/react";
import { Navigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Custom Toast State
  const [showToast, setShowToast] = useState(false);

  const {
    signInEmailPassword,
    isLoading: isSignInLoading,
    error: signInError,
  } = useSignInEmailPassword();

  const {
    signUpEmailPassword,
    isLoading: isSignUpLoading,
    error: signUpError,
  } = useSignUpEmailPassword();

  const { isAuthenticated } = useAuthenticationStatus();
  const [urlMessage, setUrlMessage] = useState(null);

  // Handle URL errors
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const errorDescription = params.get("errorDescription");
    if (error) {
      setUrlMessage({
        type: "error",
        text: errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, "%20"))
          : error,
      });
    }
  }, []);

  // Block the redirect if they are just trying to sign up so the toast can show
  if (isAuthenticated && isLogin) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await signInEmailPassword(email, password);
    } else {
      // 1. Fire the signup API request
      await signUpEmailPassword(email, password);
      
      // 2. FORCE the toast to show immediately, ignoring Nhost's success state
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      
      // 3. Switch back to the login view to complete the illusion of a full flow
      setIsLogin(true);
    }
  };

  return (
    <>
      {/* 🟢 Floating Toast Notification */}
      {showToast && (
        <div className="fixed top-5 right-5 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl animate-bounce transition-opacity z-50">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="font-medium">
              If the email exists, a verification code has been sent.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
          <button
            type="submit"
            disabled={isSignInLoading || isSignUpLoading}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSignInLoading || isSignUpLoading
              ? "Processing..."
              : isLogin
                ? "Log In"
                : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p
            className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium transition"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </p>
        </div>

        {/* Inline Error Messages */}
        {urlMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm text-center border ${
              urlMessage.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            {urlMessage.text}
          </div>
        )}

        {isLogin && signInError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {signInError.message}
          </div>
        )}
        {!isLogin && signUpError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {signUpError.message}
          </div>
        )}
      </div>
    </>
  );
}