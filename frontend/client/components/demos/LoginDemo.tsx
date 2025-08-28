import { useState } from 'react';

// Reusable Demo Component for Login
const LoginDemo = () => {
    const [showDemo, setShowDemo] = useState(false);
    const [demoStep, setDemoStep] = useState(0);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const playDemo = () => {
        setShowDemo(true);
        setDemoStep(0);
        setUsername('');
        setPassword('');
        setShowPassword(false);

        // Simulate typing username
        setTimeout(() => {
            setDemoStep(1);
            let usernameText = 'traveler123';
            let i = 0;
            const typeUsername = setInterval(() => {
                if (i < usernameText.length) {
                    setUsername(usernameText.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(typeUsername);
                    // Start typing password
                    setTimeout(() => {
                        setDemoStep(2);
                        let passwordText = 'mypassword';
                        let j = 0;
                        const typePassword = setInterval(() => {
                            if (j < passwordText.length) {
                                setPassword(passwordText.substring(0, j + 1));
                                j++;
                            } else {
                                clearInterval(typePassword);
                                // Show password toggle
                                setTimeout(() => {
                                    setDemoStep(3);
                                    setShowPassword(true);
                                    setTimeout(() => {
                                        setShowPassword(false);
                                        // Highlight sign in button
                                        setTimeout(() => {
                                            setDemoStep(4);
                                            // Show loading state
                                            setTimeout(() => {
                                                setDemoStep(5);
                                                // Complete demo with success
                                                setTimeout(() => {
                                                    setDemoStep(6);
                                                    // Reset after 3 seconds
                                                    setTimeout(() => {
                                                        setShowDemo(false);
                                                        setDemoStep(0);
                                                        setUsername('');
                                                        setPassword('');
                                                    }, 3000);
                                                }, 1500);
                                            }, 1000);
                                        }, 1000);
                                    }, 1000);
                                }, 1000);
                            }
                        }, 100);
                    }, 500);
                }
            }, 100);
        }, 1000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-cyan-700">Login Page Demo</h3>
                <p className="text-gray-600 text-sm mt-2">Interactive preview of the login experience</p>
            </div>

            {/* Demo Browser Window */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                {/* Browser Header */}
                <div className="bg-gray-200 px-4 py-3 flex items-center space-x-2">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 mx-4">
                        <div className="bg-white rounded px-3 py-1 text-sm text-gray-600">
                            ikmangaman.lk/login
                        </div>
                    </div>
                </div>

                {/* Website Header in Demo */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div className="text-xl font-bold text-cyan-700">Ikmangaman.lk</div>
                        <div className="flex space-x-3">
                            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700">Log in</button>
                            <button className="px-3 py-1 bg-cyan-600 text-white rounded text-sm">Sign up</button>
                        </div>
                    </div>
                </div>

                {/* Login Page Content */}
                <div className="relative"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '500px'
                    }}>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />

                    {/* Floating elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
                        <div className="absolute top-8 right-8 w-3 h-3 bg-cyan-300/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute bottom-8 right-1/3 w-2 h-2 bg-cyan-200/25 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                        <div className="absolute top-1/4 right-4 w-4 h-4 border border-white/20 rotate-45 animate-spin" style={{ animationDuration: '10s' }} />
                    </div>

                    {/* Login form container */}
                    <div className="relative z-10 p-8 flex items-center justify-center min-h-full">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-sm mx-auto">
                            <div className="text-center mb-6">
                                <h4 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h4>
                                <p className="text-gray-600 text-sm">Sign in to continue your journey</p>
                            </div>

                            {/* Success message when demo completes */}
                            {demoStep === 6 && (
                                <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-800 border border-green-200">
                                    <div className="flex items-center text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Login successful! Redirecting...
                                    </div>
                                </div>
                            )}

                            {/* Username field */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    readOnly
                                    placeholder="Enter your username"
                                    className={`w-full p-4 border rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500 ${demoStep >= 1 ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-gray-200'
                                        }`}
                                />
                                {demoStep === 1 && (
                                    <span className="absolute mt-1 animate-pulse text-cyan-600">|</span>
                                )}
                            </div>

                            {/* Password field */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={showPassword ? password : password.replace(/./g, '•')}
                                        readOnly
                                        placeholder="Enter your password"
                                        className={`w-full p-4 pr-12 border rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500 ${demoStep >= 2 ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-gray-200'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors ${demoStep === 3 ? 'text-cyan-600' : 'text-gray-400'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                            {showPassword ? (
                                                <>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </>
                                            ) : (
                                                <>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.243 4.243L9.88 9.88" />
                                                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                    {demoStep === 2 && (
                                        <span className="absolute right-16 top-1/2 transform -translate-y-1/2 animate-pulse text-cyan-600">|</span>
                                    )}
                                </div>
                            </div>

                            {/* Sign In button */}
                            <button className={`w-full font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 ${demoStep === 5
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : demoStep >= 4
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white transform scale-105 shadow-xl'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700'
                                }`}>
                                {demoStep === 5 ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </div>
                                ) : demoStep === 6 ? '✓ Success!' : 'Sign In'}
                            </button>

                            {/* Social login */}
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
                                    <button className="w-full py-3 px-4 border border-gray-200 rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed text-sm">
                                        Google
                                    </button>
                                    <button className="w-full py-3 px-4 border border-gray-200 rounded-lg text-gray-400 bg-gray-50 cursor-not-allowed text-sm">
                                        Facebook
                                    </button>
                                </div>
                            </div>

                            {/* Links */}
                            <div className="text-center text-sm mt-6 space-y-2">
                                <div>
                                    <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">Forgot your password?</a>
                                </div>
                                <div className="text-gray-600">
                                    Don't have an account? <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">Sign up here</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Website Footer in Demo */}
                <div className="bg-cyan-800 text-cyan-100 py-6">
                    <div className="px-6">
                        <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                                <h4 className="font-bold text-white mb-2">Ikmangaman.lk</h4>
                                <p className="text-xs">Your trusted Sri Lanka travel companion</p>
                            </div>
                            <div>
                                <h5 className="font-semibold text-white mb-2">Quick Links</h5>
                                <ul className="space-y-1 text-xs">
                                    <li>About Us</li>
                                    <li>How It Works</li>
                                    <li>Destinations</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-white mb-2">Legal</h5>
                                <ul className="space-y-1 text-xs">
                                    <li>Privacy Policy</li>
                                    <li>Terms of Service</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <button
                    onClick={playDemo}
                    disabled={showDemo}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${showDemo
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105'
                        }`}
                >
                    {showDemo ? 'Demo Running...' : '▶ Play Interactive Demo'}
                </button>
                <p className="text-gray-600 text-sm mt-2">
                    See the complete login process with realistic animations
                </p>
            </div>
        </div>
    );
};

export default LoginDemo;