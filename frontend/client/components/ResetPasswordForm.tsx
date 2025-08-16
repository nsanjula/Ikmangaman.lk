import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../lib/api";
import BackendStatus from "./BackendStatus";

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    {isVisible ? (
      // Eye open - password visible
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    ) : (
      // Eye slashed - password hidden
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.243 4.243L9.88 9.88" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const validateForm = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      
      // Redirect to login with success message
      navigate("/login", {
        state: {
          message: "Password reset successful! Please log in with your new password.",
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" style={{borderBottomColor: 'var(--primary-600)'}}></div>
          <p className="text-lg" style={{color: 'var(--text-600)'}}>Loading...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-white mb-4">Reset Your Password</h1>
              <p className="text-xl text-white/90">Enter your new password to complete the reset process</p>
            </div>

            {/* Right side - Reset Password Form */}
            <div className="w-full max-w-md">
              <form
                onSubmit={handleSubmit}
                className="card surface-blur p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h2 className="text-center mb-6" style={{ color: 'var(--text-900)' }}>Set New Password</h2>

                {error && (
                  <div className="mb-4 p-3 rounded" style={{ background: '#FEF2F2', color: '#B91C1C', borderLeft: '4px solid #EF4444' }}>
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full p-3 pr-12 rounded-lg border transition-colors duration-150"
                      style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-900)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-600)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--text-600)' }}
                    >
                      <EyeIcon isVisible={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full p-3 pr-12 rounded-lg border transition-colors duration-150"
                      style={{
                        background: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-900)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary-600)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--text-600)' }}
                    >
                      <EyeIcon isVisible={showConfirmPassword} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="btn btn-primary btn-lg w-full mb-4"
                  style={{
                    opacity: (isLoading || !token) ? 0.7 : 1,
                    cursor: (isLoading || !token) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
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

export default ResetPasswordForm;
