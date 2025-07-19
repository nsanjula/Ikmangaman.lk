import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, LoginRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import BackendStatus from "./BackendStatus";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      <section className="relative h-screen bg-cover bg-center bg-no-repeat">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80')`,
          }}
        />

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row justify-center items-center min-h-screen px-4">
          {/* Left side - Welcome message */}
          <div className="text-white text-center md:text-left mb-8 md:mb-0 md:mr-16">
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl">Log in to access your account</p>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full max-w-md">
            <form
              onSubmit={handleSubmit}
              className="bg-cyan-900 bg-opacity-80 p-8 rounded-lg backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>

              {successMessage && (
                <div className="mb-4 p-2 bg-green-500 text-white rounded text-center">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mb-4 p-2 bg-red-500 text-white rounded text-center">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-white mb-2">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded font-medium transition-colors ${
                  isLoading
                    ? "bg-cyan-600 cursor-not-allowed"
                    : "bg-cyan-700 hover:bg-cyan-600"
                }`}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>

              <div className="mt-4 text-center text-white text-sm">
                <a href="/forgot-password" className="hover:underline">
                  Forgot password?
                </a>
                <span className="mx-2">•</span>
                <a href="/register" className="hover:underline">
                  Create an account
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginForm;
