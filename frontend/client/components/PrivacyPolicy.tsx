import React, { useEffect, useState } from "react";
import { useScrollToTop } from "../hooks/useScrollToTop";

const PrivacyPolicy = () => {
    useScrollToTop();
    const [activeTab, setActiveTab] = useState('everyone');
    const [isMobile, setIsMobile] = useState(false);
    const [showNav, setShowNav] = useState(true);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setShowNav(!isMobile);
    }, [isMobile]);

    const sidebarItems = [
        { id: 'introduction', label: 'Introduction' },
        { id: 'values', label: 'Our values' },
        { id: 'why-process', label: 'Why we process your information' },
        { id: 'your-rights', label: 'Your rights over your information' },
        { id: 'where-send', label: 'Where we send your information' },
        { id: 'retention', label: 'How long do we retain your information' }
    ];

    const [activeSection, setActiveSection] = useState('introduction');

    const scrollToSection = (sectionId) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen w-full" style={{ background: 'var(--bg)' }}>
            {/* Hero Section */}
            <div className="w-full py-16 bg-cyan-100 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4 dark:text-white">
                            Privacy Policy
                        </h1>
                        <p className="text-xl mb-4 mx-auto text-center max-w-md  dark:text-white">
                            How Ikmangaman.lk handles your data
                        </p>
                        <p className="text-sm mx-auto text-center max-w-md  dark:text-gray-400">
                            Updated December 2024
                        </p>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Mobile Navigation Toggle */}
                <div className="lg:hidden mb-6">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                        <div
                            className="flex items-center justify-between cursor-pointer mb-2"
                            onClick={() => setShowNav(!showNav)}
                        >
                            <h2 className="text-md font-semibold" style={{ color: 'var(--text-900)' }}>Navigation</h2>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        {showNav && (
                            <div className="space-y-2">
                                {sidebarItems.map((item) => (
                                    <div key={item.id} className="mb-2">
                                        <button
                                            onClick={() => scrollToSection(item.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${activeSection === item.id
                                                ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                                                : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-cyan-600 border border-gray-200'
                                                }`}
                                        >
                                            <span className="font-medium text-left">{item.label}</span>
                                            <svg className={`w-4 h-4 transition-transform duration-200 ${activeSection === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar - Updated to match HowItWorks style */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-cyan-700 mb-6">Navigation</h2>
                                <div className="space-y-2">
                                    {sidebarItems.map((item) => (
                                        <div key={item.id} className="mb-2">
                                            <button
                                                onClick={() => scrollToSection(item.id)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${activeSection === item.id
                                                    ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                                                    : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-cyan-600 border border-gray-200'
                                                    }`}
                                            >
                                                <span className="font-medium text-left">{item.label}</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${activeSection === item.id ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 max-w-4xl">
                        {/* Introduction */}
                        <section id="introduction" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Introduction
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    In our mission to make travel planning better for everyone at Ikmangaman.lk, we collect and use information about you, our:
                                </p>
                                <ul className="space-y-2 mb-6 pl-6">
                                    <li>• <span style={{ color: 'white' }} className=" cursor-pointer">travelers using Ikmangaman.lk</span> to plan your journey</li>
                                    <li>• <span style={{ color: 'white' }} className="cursor-pointer">partners</span> who work with us to provide travel services, recommendations, or help travelers discover Sri Lanka</li>
                                    <li>• visitors to Ikmangaman.lk's websites, or anyone contacting Ikmangaman.lk support</li>
                                </ul>
                                <p>
                                    This Privacy Policy describes how we collect, use, and share your personal information in connection with Ikmangaman.lk services, and your choices regarding our use of your personal information.
                                </p>
                            </div>
                        </section>

                        {/* Our Values */}
                        <section id="values" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Our values
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    We believe in transparency and your right to privacy. Our approach to data handling is built on these core principles:
                                </p>
                                <p className="mb-4">
                                    <strong>Transparency:</strong> We clearly explain what data we collect, why we collect it, and how we use it to improve your travel experience.
                                </p>
                                <p className="mb-4">
                                    <strong>Your Control:</strong> You have the right to access, correct, or delete your personal information at any time through your account settings.
                                </p>
                                <p className="mb-4">
                                    <strong>Security:</strong> We implement strong security measures to protect your data from unauthorized access, disclosure, or misuse.
                                </p>
                                <p>
                                    <strong>Minimal Collection:</strong> We only collect the information necessary to provide you with personalized travel recommendations and services.
                                </p>
                            </div>
                        </section>

                        {/* Why We Process Information */}
                        <section id="why-process" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Why we process your information
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    We process your personal information for several key purposes that enable us to provide you with the best travel planning experience:
                                </p>
                                <p className="mb-4">
                                    <strong>Personalized Recommendations:</strong> We analyze your travel preferences, past trips, and interests to suggest destinations and activities you'll love. This includes processing your questionnaire responses and search history.
                                </p>
                                <p className="mb-4">
                                    <strong>Service Delivery:</strong> To create your account, send confirmations, provide customer support, and deliver the travel services you've requested through our platform.
                                </p>
                                <p className="mb-4">
                                    <strong>Platform Improvement:</strong> We use aggregated and anonymized data to improve our recommendation algorithm, develop new features, and enhance the overall user experience on our platform.
                                </p>
                                <p className="mb-4">
                                    <strong>Communication:</strong> To send you important updates about your recommendations, travel tips, destination highlights, and other relevant information (with your consent for marketing communications).
                                </p>
                                <p>
                                    <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.
                                </p>
                            </div>
                        </section>

                        {/* Your Rights */}
                        <section id="your-rights" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Your rights over your information
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    You have several rights regarding your personal information. Here's what you can do:
                                </p>
                                <p className="mb-4">
                                    <strong>Access:</strong> Request a copy of all the personal information we have about you.
                                </p>
                                <p className="mb-4">
                                    <strong>Correct:</strong> Update or fix any incorrect information in your profile or account.
                                </p>
                                <p className="mb-4">
                                    <strong>Delete:</strong> Request deletion of your personal information, subject to legal requirements.
                                </p>
                                <p className="mb-4">
                                    <strong>Opt-out:</strong> Unsubscribe from marketing communications or withdraw consent for data processing.
                                </p>
                                <p className="mb-4">
                                    <strong>Portability:</strong> Request your data in a structured, commonly used format that can be transferred to another service.
                                </p>
                                <p>
                                    <strong>How to exercise your rights:</strong> You can manage most of these preferences directly in your account settings. For other requests, contact us at teamikmangaman@gmail.com and we'll respond within 30 days.
                                </p>
                            </div>
                        </section>

                        {/* Where We Send Information */}
                        <section id="where-send" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Where we send your information
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    We work with trusted partners to provide you with the best travel experience. Your information may be shared in these situations:
                                </p>
                                <p className="mb-4">
                                    <strong>Travel Service Providers:</strong> Hotels, tour operators, and activity providers need your booking information to deliver the services you've purchased.
                                </p>
                                <p className="mb-4">
                                    <strong>Analytics Partners:</strong> Anonymized usage data helps us understand how our platform is used and improve our services.
                                </p>
                                <p className="mb-4">
                                    <strong>Legal Requirements:</strong> We may disclose your information when required by law, regulation, legal process, or governmental request.
                                </p>
                                <p>
                                    We never sell your personal information to third parties for marketing purposes.
                                </p>
                            </div>
                        </section>

                        {/* Retention */}
                        <section id="retention" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                How long do we retain your information
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    We keep your information only as long as necessary to provide our services and meet legal requirements:
                                </p>
                                <p className="mb-4">
                                    <strong>Account Information:</strong> Until you delete your account or request deletion.
                                </p>
                                <p className="mb-4">
                                    <strong>Booking Records:</strong> 7 years after your last booking for tax and legal compliance.
                                </p>
                                <p>
                                    You can request immediate deletion of your account and personal information at any time, subject to legal requirements for certain business records.
                                </p>
                            </div>
                        </section>

                        {/* Contact */}
                        <div className="p-6 rounded-lg mb-16" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
                                Questions about this policy?
                            </h3>
                            <p style={{ color: 'var(--text-600)' }}>
                                If you have any questions or concerns about how we handle your personal information, contact us at <strong>teamikmangaman@gmail.com</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
