import React from "react";

const AboutUs = () => {
    return (
        <div className="min-h-screen w-full section" style={{ background: 'var(--bg)' }}>
            <div className="container py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
                        About Our Travel Platform
                    </h1>
                    <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-600)' }}>
                        Personalized travel recommendations powered by AI to help you discover the perfect Sri Lankan destinations
                    </p>
                </div>

                {/* Mission Section */}
                <div className="card p-8 mb-8" style={{ background: 'var(--surface)' }}>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="md:w-1/3 flex justify-center">
                            <div className="w-48 h-48 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--primary-100)' }}>
                                <span className="text-6xl">🌴</span>
                            </div>
                        </div>
                        <div className="md:w-2/3">
                            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-900)' }}>
                                Our Mission
                            </h2>
                            <p className="mb-4" style={{ color: 'var(--text-600)' }}>
                                We're revolutionizing travel planning in Sri Lanka by combining local expertise with
                                cutting-edge technology to create personalized recommendations that match your unique
                                preferences and budget.
                            </p>
                            <p style={{ color: 'var(--text-600)' }}>
                                Our platform analyzes dozens of factors to suggest destinations you'll love,
                                saving you hours of research and helping you discover hidden gems.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-900)' }}>
                        Meet The Team
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Team Member 1 */}
                        <div className="card p-6 text-center" style={{ background: 'var(--surface)' }}>
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-cyan-100 flex items-center justify-center text-4xl">
                                    👨‍💻
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                                John Smith
                            </h3>
                            <p className="text-sm mb-3" style={{ color: 'var(--primary-600)' }}>
                                Founder & CEO
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                                Travel enthusiast with 10+ years in the tourism industry, passionate about showcasing Sri Lanka's beauty.
                            </p>
                        </div>

                        {/* Team Member 2 */}
                        <div className="card p-6 text-center" style={{ background: 'var(--surface)' }}>
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-cyan-100 flex items-center justify-center text-4xl">
                                    👩‍🔬
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                                Sarah Johnson
                            </h3>
                            <p className="text-sm mb-3" style={{ color: 'var(--primary-600)' }}>
                                Data Scientist
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                                AI and machine learning expert who ensures our recommendations are perfectly tailored to you.
                            </p>
                        </div>

                        {/* Team Member 3 */}
                        <div className="card p-6 text-center" style={{ background: 'var(--surface)' }}>
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                <div className="w-full h-full bg-cyan-100 flex items-center justify-center text-4xl">
                                    👨‍🎨
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                                Michael Chen
                            </h3>
                            <p className="text-sm mb-3" style={{ color: 'var(--primary-600)' }}>
                                UX Designer
                            </p>
                            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                                Creates intuitive experiences that make travel planning simple and enjoyable.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="card p-8 mb-8" style={{ background: 'var(--surface)' }}>
                    <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-900)' }}>
                        Why Choose Our Platform
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--primary-100)' }}>
                                <span className="text-2xl">🔍</span>
                            </div>
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                                Personalized Matching
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                                Our algorithm analyzes your preferences to suggest destinations you'll love.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--primary-100)' }}>
                                <span className="text-2xl">💰</span>
                            </div>
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                                Budget-Friendly
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                                Find options for every budget without compromising on experience.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center p-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--primary-100)' }}>
                                <span className="text-2xl">🏆</span>
                            </div>
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-900)' }}>
                                Local Expertise
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-600)' }}>
                                Recommendations curated by Sri Lankan travel experts who know the hidden gems.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}

            </div>
        </div>
    );
};

export default AboutUs;