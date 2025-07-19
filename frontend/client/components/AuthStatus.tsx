import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthStatus = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  if (isAuthenticated) {
    return (
      <div className="auth-status authenticated">
        <span className="auth-status-text">You are logged in</span>
        <button
          onClick={handleLogout}
          className="auth-logout-button bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-2"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="auth-status unauthenticated">
      <button
        onClick={handleLogin}
        className="auth-login-button bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded mr-2"
      >
        Login
      </button>
      <button
        onClick={handleRegister}
        className="auth-register-button bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded"
      >
        Register
      </button>
    </div>
  );
};

export default AuthStatus;
