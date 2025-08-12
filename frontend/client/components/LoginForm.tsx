import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, LoginRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
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
      // Eye slashed - password hidden - FIXED complete pupil
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.243 4.243L9.88 9.88" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
  </svg>
);

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        username,
        password,
      };

      const response = await authAPI.login(loginData);

      // Use auth context to manage authentication state
      login(response.access_token);

      // Check if user has recommendations, if not redirect to questionnaire
      try {
        const recommendations = await authAPI.getRecommendations();
        if (recommendations && recommendations.length > 0) {
          navigate("/recommendation");
        } else {
          navigate("/questionnaire");
        }
      } catch (recommendationError) {
        // If fetching recommendations fails, redirect to questionnaire
        navigate("/questionnaire");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid credentials. Please try again.",
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
            {/* Left side - Welcome message */}
            <div className="text-white text-center md:text-left">
              <h1 className="text-white mb-4">Welcome Back</h1>
              <p className="text-xl text-white/90">Log in to access your personalized travel recommendations</p>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full max-w-md">
              <form
                onSubmit={handleSubmit}
                className="card surface-blur p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h2 className="text-center mb-6" style={{ color: 'var(--text-900)' }}>Log In</h2>

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

                <div className="mb-4">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
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

                <div className="mb-6">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full mb-4"
                  style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>

                {/* Social Login Placeholder */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-sm" style={{ background: 'rgba(255, 255, 255, 0.95)', color: 'var(--text-600)' }}>Or continue with</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      type="button"
                      disabled
                      className="btn btn-secondary btn-md opacity-50 cursor-not-allowed"
                    >
                      Google
                    </button>
                    <button
                      type="button"
                      disabled
                      className="btn btn-secondary btn-md opacity-50 cursor-not-allowed"
                    >
                      Facebook
                    </button>
                  </div>
                </div>

                <div className="text-center text-sm">
                  <a href="/forgot-password" className="btn btn-tertiary text-sm">
                    Forgot password?
                  </a>
                  <span className="mx-2" style={{ color: 'var(--text-600)' }}>•</span>
                  <a href="/register" className="btn btn-tertiary text-sm">
                    Create an account
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginForm;
