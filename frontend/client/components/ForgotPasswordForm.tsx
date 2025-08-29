import { useState } from "react";
import { authAPI } from "../lib/api";
import BackendStatus from "./BackendStatus";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    return email.trim() !== "" && email.includes("@");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateEmail(email)) {
      setError("Invalid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccessMessage(response.message);
      setEmail(""); // Clear the form
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <BackendStatus />
      <section className="relative bg-cover bg-center bg-no-repeat py-12 md:py-20" style={{ background: 'var(--bg)', minHeight: 'calc(100vh - 160px)' }}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')`,
          }}
        />

        {/* Lighter gradient overlay for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />

        {/* Floating elements for dynamic effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{ animationDelay: '0s', animationDuration: '3s' }} />
          <div className="absolute top-32 right-20 w-3 h-3 bg-cyan-300/30 rounded-full animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '4s' }} />
          <div className="absolute bottom-32 right-1/3 w-2 h-2 bg-cyan-200/25 rounded-full animate-pulse"
            style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />

          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 right-10 w-6 h-6 border border-white/20 rotate-45 animate-spin"
            style={{ animationDuration: '20s' }} />
          <div className="absolute bottom-1/4 left-16 w-4 h-4 border border-cyan-300/30 rotate-12 animate-spin"
            style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        </div>

        {/* Content - Responsive Forgot Password Form */}
        <div className="relative z-10 flex items-center justify-center min-h-full py-8">
          <div className="container max-w-md mx-auto px-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600">Enter your email address to receive a password reset link</p>
              </div>

              {successMessage && (
                <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2  dark:bg-gray-700 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center text-sm mt-6">
                <button
                  type="button"
                  onClick={onBack}
                  className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPasswordForm;
