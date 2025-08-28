import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, LoginRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { getCookie, setCookie } from "../utils/cookies";
import BackendStatus from "./BackendStatus";
import ForgotPasswordForm from "./ForgotPasswordForm";

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [useSavedToken, setUseSavedToken] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isTimeout, clearTimeout } = useAuth();

  useEffect(() => {
    // Check for success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }

    // Autofill from cookies (username and token placeholder field)
    const savedUsername = getCookie("auth_username");
    const savedToken = getCookie("auth_token");
    if (savedUsername) setUsername(savedUsername);
    if (savedToken) {
      setPassword("********");
      setUseSavedToken(true);
      try {
        const hidden = document.getElementById("saved-token-input") as HTMLInputElement | null;
        if (hidden) hidden.value = savedToken;
      } catch { }
    }

    // Clear timeout state when user navigates to login
    return () => {
      if (isTimeout) {
        clearTimeout();
      }
    };
  }, [location.state, isTimeout, clearTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // If we have a saved token and user didn't change the placeholder, use token directly
      const savedToken = useSavedToken && password === "********" ? getCookie("auth_token") : null;
      if (savedToken) {
        login(savedToken);
        setCookie("auth_username", username, 30);
        // Ensure token is persisted in localStorage as well
        authAPI.storeToken(savedToken);

        try {
          const recommendations = await authAPI.getRecommendations();
          if (recommendations && recommendations.length > 0) navigate("/recommendation");
          else navigate("/questionnaire");
        } catch {
          navigate("/questionnaire");
        }
        return;
      }

      const loginData: LoginRequest = { username, password };
      const response = await authAPI.login(loginData);

      login(response.access_token);
      setCookie("auth_username", username, 30);
      setCookie("auth_token", response.access_token, 30);

      try {
        const recommendations = await authAPI.getRecommendations();
        if (recommendations && recommendations.length > 0) navigate("/recommendation");
        else navigate("/questionnaire");
      } catch {
        navigate("/questionnaire");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid credentials. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show forgot password form if requested
  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

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

        {/* Content - Responsive Login Form */}
        <div className="relative z-10 flex items-center justify-center min-h-full py-8">
          <div className="container max-w-md mx-auto px-4">
            <form
              onSubmit={handleSubmit}
              autoComplete="on"
              className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to continue your journey</p>
              </div>

              {isTimeout && (
                <div className="mb-4 p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Your session timed out. Please log in again to continue.
                  </div>
                </div>
              )}

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
                <label htmlFor="login-username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full p-4 border dark:bg-gray-700 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-4 pr-12 border dark:bg-gray-700 border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <EyeIcon isVisible={showPassword} />
                  </button>
                </div>
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
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Social Login Placeholder */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 border border-gray-200 rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-4 border border-gray-200 rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed"
                  >
                    Facebook
                  </button>
                </div>
              </div>

              <div className="text-center text-sm mt-6 space-y-2">
                <div>
                  <a href="/forgot-password" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                    Forgot your password?
                  </a>
                </div>
                <div className="text-gray-600">
                  Don't have an account?{" "}
                  <a href="/register" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                    Sign up here
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginForm;
