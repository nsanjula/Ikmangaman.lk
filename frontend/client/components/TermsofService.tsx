import React, { useState } from "react";
import { useScrollToTop } from "../hooks/useScrollToTop";

const TermsOfService = () => {
    useScrollToTop();
    const [activeTab, setActiveTab] = useState('everyone');

    const sidebarItems = [
        { id: 'introduction', label: 'Introduction' },
        { id: 'acceptance', label: 'Acceptance of Terms' },
        { id: 'services', label: 'Our Services' },
        { id: 'user-accounts', label: 'User Accounts' },
        { id: 'bookings-payments', label: 'Bookings & Payments' },
        { id: 'cancellation', label: 'Cancellation Policy' },
        { id: 'user-conduct', label: 'User Conduct' },
        { id: 'intellectual-property', label: 'Intellectual Property' },
        { id: 'limitation-liability', label: 'Limitation of Liability' }
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
            <div className="w-full py-16" style={{ background: 'var(--surface)' }}>
                <div className="container mx-auto px-4">
                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
                            Terms of Service
                        </h1>
                        <p className="text-xl mb-4 mx-auto text-center max-w-md" style={{ color: 'var(--text-600)' }}>
                            The rules and guidelines for using Ikmangaman.lk
                        </p>
                        <p className="text-sm mx-auto text-center max-w-md" style={{ color: 'var(--text-500)' }}>
                            Effective December 2024
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="flex gap-12">
                    {/* Sidebar */}
                    <div className="w-80 flex-shrink-0">
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
                                    Welcome to Ikmangaman.lk! These Terms of Service govern your use of our website and services.
                                    By accessing or using Ikmangaman.lk, you agree to be bound by these terms.
                                </p>
                                <p className="mb-6">
                                    Ikmangaman.lk is a travel planning platform that helps travelers discover and book experiences
                                    throughout Sri Lanka. Our services include personalized itinerary planning, booking services for
                                    accommodations, tours, and activities, and travel recommendations.
                                </p>
                                <p>
                                    Please read these terms carefully before using our services. If you do not agree to these terms,
                                    you may not access or use our platform.
                                </p>
                            </div>
                        </section>

                        {/* Acceptance of Terms */}
                        <section id="acceptance" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Acceptance of Terms
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    By creating an account, making a booking, or using any of our services, you acknowledge that:
                                </p>
                                <ul className="space-y-2 mb-6 pl-6">
                                    <li>• You are at least 18 years old and have the legal capacity to enter into binding contracts</li>
                                    <li>• You have read, understood, and agree to be bound by these Terms of Service</li>
                                    <li>• You consent to our Privacy Policy and the processing of your personal data</li>
                                    <li>• All information you provide to us is accurate, current, and complete</li>
                                </ul>
                                <p>
                                    We may modify these terms at any time. Continued use of our services after changes constitutes
                                    acceptance of the modified terms.
                                </p>
                            </div>
                        </section>

                        {/* Our Services */}
                        <section id="services" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Our Services
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    Ikmangaman.lk provides the following services:
                                </p>
                                <p className="mb-4">
                                    <strong>Travel Planning:</strong> Personalized itinerary suggestions based on your preferences,
                                    interests, and travel style through our interactive questionnaire.
                                </p>
                                <p className="mb-4">
                                    <strong>Booking Services:</strong> Facilitation of bookings for accommodations, tours, activities,
                                    and transportation services with our partner providers throughout Sri Lanka.
                                </p>
                                <p className="mb-4">
                                    <strong>Travel Information:</strong> Comprehensive information about destinations, attractions,
                                    cultural norms, and practical travel advice for Sri Lanka.
                                </p>
                                <p className="mb-4">
                                    <strong>Customer Support:</strong> Assistance with bookings, itinerary changes, and travel-related
                                    inquiries through our support channels.
                                </p>
                                <p>
                                    We act as an intermediary between travelers and service providers. The actual travel services are
                                    provided by third-party partners, and your contractual relationship is with these providers.
                                </p>
                            </div>
                        </section>

                        {/* User Accounts */}
                        <section id="user-accounts" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                User Accounts
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    To access certain features of our platform, you must create an account. You are responsible for:
                                </p>
                                <p className="mb-4">
                                    <strong>Account Security:</strong> Maintaining the confidentiality of your login credentials and
                                    restricting access to your account. You accept responsibility for all activities that occur under your account.
                                </p>
                                <p className="mb-4">
                                    <strong>Accurate Information:</strong> Providing accurate, current, and complete information during
                                    registration and keeping it updated.
                                </p>
                                <p className="mb-4">
                                    <strong>One Account:</strong> Maintaining only one active account unless expressly permitted by Ikmangaman.lk.
                                </p>
                                <p className="mb-4">
                                    <strong>Termination:</strong> We reserve the right to suspend or terminate your account if we suspect
                                    unauthorized or fraudulent activity, or violation of these terms.
                                </p>
                                <p>
                                    You may delete your account at any time through your account settings or by contacting our support team.
                                </p>
                            </div>
                        </section>

                        {/* Bookings & Payments */}
                        <section id="bookings-payments" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Bookings & Payments
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    When you make a booking through Ikmangaman.lk:
                                </p>
                                <p className="mb-4">
                                    <strong>Payment Processing:</strong> All payments are processed securely through our payment partners.
                                    You agree to pay all charges incurred by your account.
                                </p>
                                <p className="mb-4">
                                    <strong>Price Changes:</strong> Prices are subject to change without notice. The price at the time of
                                    booking confirmation is the final price, unless otherwise specified.
                                </p>
                                <p className="mb-4">
                                    <strong>Currency:</strong> All transactions are processed in Sri Lankan Rupees (LKR) or US Dollars (USD)
                                    as indicated during the booking process.
                                </p>
                                <p className="mb-4">
                                    <strong>Service Fees:</strong> We may charge service fees for facilitating bookings. These will be
                                    clearly displayed before confirmation.
                                </p>
                                <p className="mb-4">
                                    <strong>Confirmation:</strong> Bookings are confirmed only after payment is successfully processed and
                                    you receive a confirmation email from us.
                                </p>
                                <p>
                                    <strong>Third-party Providers:</strong> Your contract for travel services is with the third-party provider,
                                    not Ikmangaman.lk. We are not responsible for the services provided by these partners.
                                </p>
                            </div>
                        </section>

                        {/* Cancellation Policy */}
                        <section id="cancellation" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Cancellation Policy
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    Cancellation policies vary by service provider and are specified during the booking process:
                                </p>
                                <p className="mb-4">
                                    <strong>Provider Policies:</strong> Each service provider sets their own cancellation policy.
                                    We clearly display these policies before you confirm your booking.
                                </p>
                                <p className="mb-4">
                                    <strong>Refunds:</strong> Refund eligibility depends on the specific provider's policy and the
                                    timing of your cancellation. We process refunds according to these policies.
                                </p>
                                <p className="mb-4">
                                    <strong>Cancellation Fees:</strong> Some providers may charge cancellation fees, which will be
                                    deducted from any refund amount.
                                </p>
                                <p className="mb-4">
                                    <strong>How to Cancel:</strong> Cancellations must be made through your Ikmangaman.lk account
                                    or by contacting our support team. Direct cancellations with providers may not be recognized
                                    in our system.
                                </p>
                                <p>
                                    <strong>Force Majeure:</strong> In cases of extraordinary circumstances beyond our control
                                    (natural disasters, political unrest, pandemics, etc.), special cancellation policies may apply.
                                </p>
                            </div>
                        </section>

                        {/* User Conduct */}
                        <section id="user-conduct" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                User Conduct
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    While using Ikmangaman.lk, you agree not to:
                                </p>
                                <ul className="space-y-2 mb-6 pl-6">
                                    <li>• Use our platform for any illegal purpose or in violation of any laws</li>
                                    <li>• Submit false or misleading information</li>
                                    <li>• Infringe upon the rights of others, including intellectual property rights</li>
                                    <li>• Harass, abuse, or harm other users or our staff</li>
                                    <li>• Use automated systems or software to extract data from our website</li>
                                    <li>• Interfere with or disrupt the integrity or performance of our platform</li>
                                    <li>• Attempt to gain unauthorized access to our systems or networks</li>
                                    <li>• Make bookings without the intention to actually use the services</li>
                                </ul>
                                <p>
                                    Violation of these conduct guidelines may result in termination of your account and
                                    legal action where appropriate.
                                </p>
                            </div>
                        </section>

                        {/* Intellectual Property */}
                        <section id="intellectual-property" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Intellectual Property
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    All content on Ikmangaman.lk is protected by intellectual property laws:
                                </p>
                                <p className="mb-4">
                                    <strong>Our Content:</strong> The Ikmangaman.lk name, logo, website design, text, graphics,
                                    and other content are owned by or licensed to us and are protected by copyright and trademark laws.
                                </p>
                                <p className="mb-4">
                                    <strong>Limited License:</strong> We grant you a limited, non-exclusive, non-transferable license
                                    to access and use our platform for personal, non-commercial purposes in accordance with these terms.
                                </p>
                                <p className="mb-4">
                                    <strong>User Content:</strong> By submitting content (reviews, photos, comments) to our platform,
                                    you grant us a perpetual, royalty-free license to use, modify, and display that content in connection with our services.
                                </p>
                                <p>
                                    <strong>Third-party Content:</strong> Content provided by our partners and users remains their property.
                                    You may not use any content from our platform without obtaining permission from the respective rights holder.
                                </p>
                            </div>
                        </section>

                        {/* Limitation of Liability */}
                        <section id="limitation-liability" className="mb-16">
                            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-900)' }}>
                                Limitation of Liability
                            </h2>
                            <div style={{ color: 'var(--text-600)', lineHeight: '1.6' }}>
                                <p className="mb-6">
                                    To the fullest extent permitted by law:
                                </p>
                                <p className="mb-4">
                                    <strong>Intermediary Role:</strong> Ikmangaman.lk acts as an intermediary between travelers and
                                    service providers. We are not liable for any injuries, losses, or damages incurred during your
                                    use of third-party services.
                                </p>
                                <p className="mb-4">
                                    <strong>Service Availability:</strong> We do not guarantee uninterrupted access to our platform
                                    and are not liable for any downtime or technical issues.
                                </p>
                                <p className="mb-4">
                                    <strong>Information Accuracy:</strong> While we strive to provide accurate information, we are
                                    not liable for any errors or omissions in content provided on our platform.
                                </p>
                                <p className="mb-4">
                                    <strong>Maximum Liability:</strong> Our total liability to you for any claims related to these
                                    terms or our services is limited to the amount you paid us in the six months preceding the event
                                    giving rise to the claim.
                                </p>
                                <p>
                                    <strong>Indemnification:</strong> You agree to indemnify and hold harmless Ikmangaman.lk and its
                                    affiliates from any claims, damages, or expenses arising from your use of our services or violation
                                    of these terms.
                                </p>
                            </div>
                        </section>

                        {/* Contact */}
                        <div className="p-6 rounded-lg mb-16" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
                                Questions about our terms?
                            </h3>
                            <p style={{ color: 'var(--text-600)' }}>
                                If you have any questions about these Terms of Service, contact us at <strong>legal@ikmangaman.lk</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;