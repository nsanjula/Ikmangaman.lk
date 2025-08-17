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
      <section className="relative h-screen bg-cover bg-center bg-no-repeat" style={{ background: 'var(--bg)' }}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')`,
          }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 gradient-overlay" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row justify-center items-center min-h-screen">
          <div className="container flex flex-col md:flex-row justify-center items-center gap-16">
            {/* Left side - Message */}
            <div className="text-white text-center md:text-left">
              <h1 className="text-white mb-4">Forgot Password?</h1>
              <p className="text-xl text-white/90">Enter your email address to receive a password reset link</p>
            </div>

            {/* Right side - Forgot Password Form */}
            <div className="w-full max-w-md">
              <form
                onSubmit={handleSubmit}
                className="card surface-blur p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h2 className="text-center mb-6" style={{ color: 'var(--text-900)' }}>Reset Password</h2>

                {successMessage && (
                  <div className="mb-4 p-3 rounded" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', borderLeft: '4px solid var(--primary-600)' }}>
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded" style={{ background: '#FEF2F2', color: '#B91C1C', borderLeft: '4px solid #EF4444' }}>
                    {error}
                  </div>
                )}

                <div className="mb-6">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full p-3 rounded-lg border transition-colors duration-150"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-900)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-600)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full mb-4"
                  style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={onBack}
                    className="btn btn-tertiary text-sm"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPasswordForm;
