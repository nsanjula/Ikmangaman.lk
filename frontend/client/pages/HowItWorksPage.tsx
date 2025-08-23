import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoginDemo from "../components/demos/LoginDemo";

// Desktop Browser Frame Component
const DesktopBrowserFrame = ({ children, title = "Demo" }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-cyan-700">{title}</h3>
        </div>

        <div className="desktop-demo-container">
            {children}
        </div>
    </div>
);

// Placeholder Demo Component for other sections
const PlaceholderDemo = ({ title, description, comingSoon = false }) => (
    <DesktopBrowserFrame title={title}>
        <div className="bg-gray-100 rounded-b-lg p-8 text-center h-64 flex flex-col items-center justify-center">
            <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">
                {comingSoon ? "Coming Soon" : "Demo Placeholder"}
            </h4>
            <p className="text-gray-500 text-sm">
                {comingSoon
                    ? "Interactive demo will be available soon"
                    : "Replace this component with your custom demo"
                }
            </p>
        </div>
    </DesktopBrowserFrame>
);

// Step Card Component
const StepCard = ({ step, title, description, index }) => {
    const stepCardRef = useRef();

    useEffect(() => {
        setTimeout(() => {
            if (stepCardRef.current) {
                stepCardRef.current.classList.add('opacity-100', 'translate-y-0');
            }
        }, 300 * index);
    }, [index]);

    return (
        <div
            ref={stepCardRef}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100 opacity-0 translate-y-4 transition-all duration-500"
        >
            <div className="flex items-start">
                <div className="bg-cyan-100 text-cyan-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    {step}
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-cyan-700">{title}</h3>
                    <p className="text-gray-600 mt-2">{description}</p>
                </div>
            </div>
        </div>
    );
};

// Sidebar Menu Item Component
const SidebarMenuItem = ({ title, id, isActive, onClick, isOpen, onToggle }) => (
    <div className="mb-2">
        <button
            onClick={() => {
                onToggle();
                onClick(id);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isActive
                ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-cyan-600 border border-gray-200'
                }`}
        >
            <span className="font-medium text-left">{title}</span>
            <svg
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    </div>
);

// Content sections data
const sections = {
    login: {
        title: "How to Login to Your Account",
        steps: [
            {
                step: 1,
                title: "Navigate to the Login Page",
                description: "Click on the 'Login' button located at the top right corner of any page on our website."
            },
            {
                step: 2,
                title: "Enter Your Credentials",
                description: "Type your username and password in the respective fields. Make sure to enter them correctly."
            },
            {
                step: 3,
                title: "Toggle Password Visibility",
                description: "Use the eye icon to show or hide your password as you type for better accuracy."
            },
            {
                step: 4,
                title: "Sign In Successfully",
                description: "Click the 'Sign In' button and you'll be redirected to your personalized dashboard."
            }
        ],
        demo: (
            <DesktopBrowserFrame title="Login">
                <LoginDemo />
            </DesktopBrowserFrame>
        )
    },
    search: {
        title: "How to Search for Destinations",
        steps: [
            {
                step: 1,
                title: "Use the Search Bar",
                description: "Enter the name of a destination, activity, or type of experience you're looking for."
            },
            {
                step: 2,
                title: "Apply Filters",
                description: "Narrow down results by location, budget, duration, or travel preferences."
            },
            {
                step: 3,
                title: "Browse Results",
                description: "View detailed information, photos, and reviews for each destination."
            },
            {
                step: 4,
                title: "Save Favorites",
                description: "Add interesting places to your favorites list for easy access later."
            }
        ],
        demo: <PlaceholderDemo
            title="Search"
            description="Interactive search functionality demo"
            comingSoon={true}
        />
    },
    recommendations: {
        title: "How to Get Personalized Recommendations",
        steps: [
            {
                step: 1,
                title: "Complete the Questionnaire",
                description: "Answer questions about your travel preferences, interests, and budget."
            },
            {
                step: 2,
                title: "Review Your Profile",
                description: "Check that all your preferences are accurately captured in your travel profile."
            },
            {
                step: 3,
                title: "Get Recommendations",
                description: "Receive personalized destination and activity suggestions tailored to you."
            },
            {
                step: 4,
                title: "Refine Preferences",
                description: "Update your preferences anytime to get fresh, relevant recommendations."
            }
        ],
        demo: <PlaceholderDemo
            title="Recommendations"
            description="See how personalized recommendations work"
            comingSoon={true}
        />
    },
    itinerary: {
        title: "How to Create Your Itinerary",
        steps: [
            {
                step: 1,
                title: "Start Planning",
                description: "Choose your travel dates and select destinations you want to visit."
            },
            {
                step: 2,
                title: "Add Activities",
                description: "Browse and add activities, attractions, and experiences to your itinerary."
            },
            {
                step: 3,
                title: "Organize Your Schedule",
                description: "Arrange activities by day and optimize travel routes between locations."
            },
            {
                step: 4,
                title: "Save and Share",
                description: "Save your completed itinerary and share it with travel companions."
            }
        ],
        demo: <PlaceholderDemo
            title="Itinerary"
            description="Interactive itinerary creation process"
            comingSoon={true}
        />
    }
};

// Main How It Works Component
const HowItWorks = () => {
    const [activeSection, setActiveSection] = useState('login');
    const [openSections, setOpenSections] = useState({ login: true });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSection = (sectionId) => {
        setOpenSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleSectionClick = (sectionId) => {
        setActiveSection(sectionId);
        // On mobile, close sidebar after selection
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    const currentSection = sections[activeSection];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Page Title */}
                <section className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-cyan-700 mb-4">How Ikmangaman.lk Works</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover how to make the most of your Sri Lanka travel experience with our easy-to-use platform
                    </p>
                </section>

                {/* Mobile Menu Button */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Menu
                    </button>
                </div>

                {/* Main Layout */}
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className={`lg:w-80 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden lg:block'
                        }`}>
                        <div className="sticky top-8">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-cyan-700 mb-6">Navigation</h2>
                                <div className="space-y-2">
                                    <SidebarMenuItem
                                        title="Login to Your Account"
                                        id="login"
                                        isActive={activeSection === 'login'}
                                        onClick={handleSectionClick}
                                        isOpen={openSections.login}
                                        onToggle={() => toggleSection('login')}
                                    />
                                    <SidebarMenuItem
                                        title="Search for Destinations"
                                        id="search"
                                        isActive={activeSection === 'search'}
                                        onClick={handleSectionClick}
                                        isOpen={openSections.search}
                                        onToggle={() => toggleSection('search')}
                                    />
                                    <SidebarMenuItem
                                        title="Get Recommendations"
                                        id="recommendations"
                                        isActive={activeSection === 'recommendations'}
                                        onClick={handleSectionClick}
                                        isOpen={openSections.recommendations}
                                        onToggle={() => toggleSection('recommendations')}
                                    />
                                    <SidebarMenuItem
                                        title="Create Your Itinerary"
                                        id="itinerary"
                                        isActive={activeSection === 'itinerary'}
                                        onClick={handleSectionClick}
                                        isOpen={openSections.itinerary}
                                        onToggle={() => toggleSection('itinerary')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {/* Section Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-semibold text-cyan-700 mb-4">{currentSection.title}</h2>
                        </div>

                        {/* Desktop Layout: Demo on Top, Steps at Bottom */}
                        <div className="hidden lg:flex flex-col gap-8">
                            {/* Demo at the Top */}
                            <div className="w-full">
                                {currentSection.demo}
                            </div>

                            {/* Steps at the Bottom */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {currentSection.steps.map((item, index) => (
                                    <StepCard key={`${activeSection}-${index}`} {...item} index={index} />
                                ))}
                            </div>
                        </div>

                        {/* Mobile Layout: Steps then Demo */}
                        <div className="lg:hidden flex flex-col gap-8">
                            {/* Steps */}
                            <div className="space-y-6">
                                {currentSection.steps.map((item, index) => (
                                    <StepCard key={`${activeSection}-${index}`} {...item} index={index} />
                                ))}
                            </div>

                            {/* Demo */}
                            <div>
                                {currentSection.demo}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Add custom styles for the desktop browser frame */}
            <style jsx>{`
        .desktop-browser-frame {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
        }
        
        .browser-header {
          display: flex;
          align-items: center;
          background: #f1f3f4;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .browser-controls {
          display: flex;
          gap: 8px;
          margin-right: 12px;
        }
        
        .control-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        
        .control-dot.close { background: #ff5f56; }
        .control-dot.minimize { background: #ffbd2e; }
        .control-dot.expand { background: #27c93f; }
        
        .browser-url-bar {
          flex: 1;
          background: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          display: flex;
          align-items: center;
          border: 1px solid #e2e8f0;
        }
        
        .lock-icon {
          margin-right: 8px;
          font-size: 12px;
        }
        
        .url-text {
          color: #4a5568;
        }
        
        .browser-menu {
          margin-left: 12px;
          color: #718096;
          font-weight: bold;
        }
        
        .browser-content {
          background: white;
          overflow: hidden;
          max-height: 500px;
        }
      `}</style>
        </div>
    );
};

export default HowItWorks;