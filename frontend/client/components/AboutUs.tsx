import React from "react";
import { useScrollToTop } from "../hooks/useScrollToTop";

const AboutUs = () => {
    useScrollToTop();
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Team Member 1 - Buvindu */}
                        <div className="team-member-card p-6 text-center" style={{ background: 'var(--surface)' }}>
                            <div className="team-member-image mx-auto mb-4 rounded-full overflow-hidden">
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets%2F3457afc668d84db2a90669abceb0c107%2Ff793e7dfd1fd4b989600e3324b5b83a6?format=webp&width=800"
                                    alt="Buvindu Suraweera"
                                    className="team-member-photo"
                                />
                            </div>
                            <h3 className="team-member-name" style={{ color: 'var(--text-900)' }}>
                                Buvindu Suraweera
                            </h3>
                            <p className="team-member-role" style={{ color: 'var(--primary-600)' }}>
                                API Manager, Backend Developer
                            </p>
                            <p className="team-member-description" style={{ color: 'var(--text-600)' }}>
                                Expert in API design and backend architecture, ensuring seamless data flow and robust server infrastructure.
                            </p>
                        </div>

                        {/* Team Member 2 - Anupama */}
                        <div className="team-member-card p-6 text-center" style={{ background: 'var(--surface)' }}>
                            <div className="team-member-image mx-auto mb-4 rounded-full overflow-hidden">
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets%2F3457afc668d84db2a90669abceb0c107%2F0be46b4013944247bcf9b39aaf81e304?format=webp&width=800"
                                    alt="Anupama Wickramaratne"
                                    className="team-member-photo"
                                />
                            </div>
                            <h3 className="team-member-name" style={{ color: 'var(--text-900)' }}>
                                Anupama Wickramaratne
                            </h3>
                            <p className="team-member-role" style={{ color: 'var(--primary-600)' }}>
                                Debugger & Tester, Frontend Developer, Frontend Designer
                            </p>
                            <p className="team-member-description" style={{ color: 'var(--text-600)' }}>
                                Quality assurance specialist and frontend developer, ensuring pixel-perfect designs and bug-free experiences.
                            </p>
                        </div>

                        {/* Team Member 3 - Yasiru */}
                        <div className="team-member-card p-6 text-center" style={{ background: 'var(--surface)' }}>
                            <div className="team-member-image mx-auto mb-4 rounded-full overflow-hidden">
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets%2F3457afc668d84db2a90669abceb0c107%2Fa67d960a26b44a36bffe4442a6cb8b23?format=webp&width=800"
                                    alt="Yasiru Aluthge"
                                    className="team-member-photo"
                                />
                            </div>
                            <h3 className="team-member-name" style={{ color: 'var(--text-900)' }}>
                                Yasiru Aluthge
                            </h3>
                            <p className="team-member-role" style={{ color: 'var(--primary-600)' }}>
                                Frontend Developer, Frontend Designer
                            </p>
                            <p className="team-member-description" style={{ color: 'var(--text-600)' }}>
                                Creative frontend developer and designer, crafting intuitive user interfaces and exceptional user experiences.
                            </p>
                        </div>

                        {/* Team Member 4 - Nisal */}
                        <div className="team-member-card p-6 text-center" style={{ background: 'var(--surface)' }}>
                            <div className="team-member-image mx-auto mb-4 rounded-full overflow-hidden">
                                <img
                                    src="https://cdn.builder.io/api/v1/image/assets%2F3457afc668d84db2a90669abceb0c107%2Fb66111e6f4be4c94a170eaa4322da894?format=webp&width=800"
                                    alt="Nisal Sanjula"
                                    className="team-member-photo"
                                />
                            </div>
                            <h3 className="team-member-name" style={{ color: 'var(--text-900)' }}>
                                Nisal Sanjula
                            </h3>
                            <p className="team-member-role" style={{ color: 'var(--primary-600)' }}>
                                Backend Developer, Database Manager
                            </p>
                            <p className="team-member-description" style={{ color: 'var(--text-600)' }}>
                                Database expert and backend developer, managing data infrastructure and server-side application logic.
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
