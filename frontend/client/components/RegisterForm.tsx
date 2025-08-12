import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, RegisterRequest, LoginRequest } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import BackendStatus from "./BackendStatus";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { FiCalendar } from "react-icons/fi";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
              <h1 className="text-white mb-4">Join Us Today</h1>
              <p className="text-xl text-white/90">Create your account to get personalized travel recommendations</p>
            </div>

            {/* Right side - Register Form */}
            <div className="w-full max-w-md">
              <form
                onSubmit={handleSubmit}
                className="card surface-blur p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <h2 className="text-center mb-6" style={{ color: 'var(--text-900)' }}>Create Account</h2>

                {errors.form && (
                  <div className="mb-4 p-3 rounded" style={{ background: '#FEF2F2', color: '#B91C1C', borderLeft: '4px solid #EF4444' }}>
                    {errors.form}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Ex: Nisal"
                      className="w-full p-3 rounded-lg border transition-colors duration-150"
                      style={{
                        background: 'var(--surface)',
                        borderColor: errors.firstName ? '#EF4444' : 'var(--border)',
                        color: 'var(--text-900)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = errors.firstName ? '#EF4444' : 'var(--primary-600)'}
                      onBlur={(e) => e.target.style.borderColor = errors.firstName ? '#EF4444' : 'var(--border)'}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Ex: Sanjula"
                      className="w-full p-3 rounded-lg border transition-colors duration-150"
                      style={{
                        background: 'var(--surface)',
                        borderColor: errors.lastName ? '#EF4444' : 'var(--border)',
                        color: 'var(--text-900)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = errors.lastName ? '#EF4444' : 'var(--primary-600)'}
                      onBlur={(e) => e.target.style.borderColor = errors.lastName ? '#EF4444' : 'var(--border)'}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                    Birthday
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      placeholder="DD/MM/YYYY"
                      className="w-full p-3 pr-12 rounded-lg border transition-colors duration-150"
                      style={{
                        background: 'var(--surface)',
                        borderColor: errors.birthday ? '#EF4444' : 'var(--border)',
                        color: 'var(--text-900)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = errors.birthday ? '#EF4444' : 'var(--primary-600)'}
                      onBlur={(e) => e.target.style.borderColor = errors.birthday ? '#EF4444' : 'var(--border)'}
                    />
                    <Popover
                      open={isCalendarOpen}
                      onOpenChange={setIsCalendarOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: 'var(--text-600)' }}
                          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        >
                          <FiCalendar className="h-4 w-4" />
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
                    <p className="text-red-500 text-sm mt-1">{errors.birthday}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ex: Nisal01"
                    className="w-full p-3 rounded-lg border transition-colors duration-150"
                    style={{
                      background: 'var(--surface)',
                      borderColor: errors.username ? '#EF4444' : 'var(--border)',
                      color: 'var(--text-900)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = errors.username ? '#EF4444' : 'var(--primary-600)'}
                    onBlur={(e) => e.target.style.borderColor = errors.username ? '#EF4444' : 'var(--border)'}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full p-3 pr-12 rounded-lg border transition-colors duration-150"
                      style={{
                        background: 'var(--surface)',
                        borderColor: errors.password ? '#EF4444' : 'var(--border)',
                        color: 'var(--text-900)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = errors.password ? '#EF4444' : 'var(--primary-600)'}
                      onBlur={(e) => e.target.style.borderColor = errors.password ? '#EF4444' : 'var(--border)'}
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
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block mb-2 font-medium" style={{ color: 'var(--text-900)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="w-full p-3 pr-12 rounded-lg border transition-colors duration-150"
                      style={{
                        background: 'var(--surface)',
                        borderColor: errors.confirmPassword ? '#EF4444' : 'var(--border)',
                        color: 'var(--text-900)',
                      }}
                      onFocus={(e) => e.target.style.borderColor = errors.confirmPassword ? '#EF4444' : 'var(--primary-600)'}
                      onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#EF4444' : 'var(--border)'}
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
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
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
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>

                <div className="text-center text-sm">
                  <span style={{ color: 'var(--text-600)' }}>Already have an account?</span>
                  <span className="mx-2" style={{ color: 'var(--text-600)' }}>•</span>
                  <a href="/login" className="btn btn-tertiary text-sm">
                    Log in
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

export default RegisterForm;
