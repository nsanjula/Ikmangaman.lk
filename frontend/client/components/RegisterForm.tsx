import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, RegisterRequest, LoginRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import BackendStatus from "./BackendStatus";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { FiCalendar } from "react-icons/fi";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If birthday field is manually typed, try to parse it as a date
    if (name === "birthday" && value) {
      const parsedDate = new Date(value.split("/").reverse().join("-")); // Convert DD/MM/YYYY to YYYY-MM-DD for parsing
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Format date as DD/MM/YYYY for display
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      setFormData((prev) => ({
        ...prev,
        birthday: formattedDate,
      }));
    }
    setIsCalendarOpen(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    // Basic date validation
    if (!formData.birthday.trim()) {
      newErrors.birthday = "Birthday is required";
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.birthday)) {
      newErrors.birthday = "Please use DD/MM/YYYY format";
    }

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (formData.username.length < 4)
      newErrors.username = "Username must be at least 4 characters";

    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      const registerData: RegisterRequest = {
        firstname: formData.firstName,
        lastname: formData.lastName || undefined,
        date_of_birth: authAPI.formatDateForAPI(formData.birthday),
        username: formData.username,
        password: formData.password,
      };

      await authAPI.register(registerData);

      // Auto-login after successful registration
      try {
        const loginData: LoginRequest = {
          username: formData.username,
          password: formData.password,
        };

        const loginResponse = await authAPI.login(loginData);
        login(loginResponse.access_token);

        // Redirect to no-recommendation page for new users
        navigate("/norecommendation");
      } catch (loginError) {
        // If auto-login fails, redirect to login page with message
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please log in with your credentials.",
          },
        });
      }
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.",
      });
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
            <h1 className="text-4xl font-bold mb-4">Join Us</h1>
            <p className="text-xl">Create your account to get started</p>
          </div>

          {/* Right side - Registration Form */}
          <div className="w-full max-w-md">
            <form
              onSubmit={handleSubmit}
              className="bg-cyan-900 bg-opacity-80 p-8 rounded-lg backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                Create Account
              </h2>

              {errors.form && (
                <div className="mb-4 p-2 bg-red-500 text-white rounded text-center">
                  {errors.form}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-white mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Ex: Nisal"
                    className={`w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 ${
                      errors.firstName
                        ? "focus:ring-red-500"
                        : "focus:ring-cyan-500"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Ex: Sanjula"
                    className={`w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 ${
                      errors.lastName
                        ? "focus:ring-red-500"
                        : "focus:ring-cyan-500"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Birthday</label>
                <div className="relative">
                  <input
                    type="text"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    className={`w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 pr-12 ${
                      errors.birthday
                        ? "focus:ring-red-500"
                        : "focus:ring-cyan-500"
                    }`}
                  />
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-gray-200"
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      >
                        <FiCalendar className="h-4 w-4 text-gray-600" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {errors.birthday && (
                  <p className="text-red-400 text-sm mt-1">{errors.birthday}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ex: Nisal01"
                  className={`w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 ${
                    errors.username
                      ? "focus:ring-red-500"
                      : "focus:ring-cyan-500"
                  }`}
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "focus:ring-red-500"
                      : "focus:ring-cyan-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-white mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full p-3 rounded bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "focus:ring-red-500"
                      : "focus:ring-cyan-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>

              <div className="mt-4 text-center text-white text-sm">
                Already have an account?{" "}
                <a href="/login" className="text-cyan-300 hover:underline">
                  Log in
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterForm;
