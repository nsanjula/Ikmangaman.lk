import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiFileText,
  FiThumbsUp,
  FiBookmark,
  FiEdit,
  FiSearch,
  FiCamera,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Add CSS for better sticky behavior
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sticky-sidebar {
        position: sticky !important;
        top: 2rem !important;
        align-self: flex-start !important;
        max-height: calc(100vh - 4rem) !important;
        overflow-y: auto !important;
        z-index: 30 !important;
      }

      .sticky-sidebar::-webkit-scrollbar {
        width: 4px;
      }

      .sticky-sidebar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 2px;
      }

      .sticky-sidebar::-webkit-scrollbar-thumb {
        background: #1196A0;
        border-radius: 2px;
      }

      .sticky-sidebar::-webkit-scrollbar-thumb:hover {
        background: #0C7C84;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.step-section');
      const scrollPos = window.scrollY + window.innerHeight / 3;

      let currentActiveStep = 1;

      sections.forEach((section, index) => {
        const element = section as HTMLElement;
        const offsetTop = element.offsetTop - 200; // Account for header offset
        const offsetBottom = offsetTop + element.offsetHeight;

        if (scrollPos >= offsetTop && scrollPos <= offsetBottom) {
          currentActiveStep = index + 1;
        }
      });

      setActiveStep(currentActiveStep);
    };

    // Initial call to set active step
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const steps = [
    {
      id: 1,
      title: "Sign Up",
      icon: FiUser,
      description: "Create your account to start your travel journey. Join our community and unlock personalized travel recommendations tailored just for you.",
      details: [
        "Create your profile with basic information",
        "Verify your email address",
        "Set your travel preferences"
      ]
    },
    {
      id: 2,
      title: "Fill Questionnaire",
      icon: FiFileText,
      description: "Complete our comprehensive travel questionnaire to help us understand your preferences, travel style, and interests.",
      details: [
        "Answer questions about your travel style",
        "Share your interests and hobbies",
        "Set your budget preferences",
        "Specify accommodation preferences"
      ]
    },
    {
      id: 3,
      title: "Select Recommendation",
      icon: FiThumbsUp,
      description: "Browse through personalized destination recommendations generated based on your questionnaire responses and preferences.",
      details: [
        "View curated destination suggestions",
        "Compare different travel options",
        "Read detailed destination information",
        "Check weather and seasonal recommendations"
      ]
    },
    {
      id: 4,
      title: "Save Places",
      icon: FiBookmark,
      description: "Bookmark your favorite destinations and create a personal collection of places you want to visit.",
      details: [
        "Save destinations to your favorites",
        "Create custom travel lists",
        "Add personal notes to saved places",
        "Access your saved places anytime"
      ]
    },
    {
      id: 5,
      title: "Edit Profile",
      icon: FiEdit,
      description: "Update your profile information and travel preferences anytime to receive more accurate recommendations.",
      details: [
        "Update personal information",
        "Modify travel preferences",
        "Change profile picture",
        "Adjust notification settings"
      ]
    },
    {
      id: 6,
      title: "Search by Text",
      icon: FiSearch,
      description: "Use our powerful text search to find specific destinations, activities, or travel experiences you're looking for.",
      details: [
        "Search by destination name",
        "Filter by activities and attractions",
        "Search by travel themes",
        "Use advanced search filters"
      ]
    },
    {
      id: 7,
      title: "Search by Image",
      icon: FiCamera,
      description: "Upload an image of a place or activity you're interested in, and let our AI help you find similar destinations.",
      details: [
        "Upload photos from your gallery",
        "Take photos with your camera",
        "Get AI-powered visual matching",
        "Discover visually similar destinations"
      ]
    },
    {
      id: 8,
      title: "Use Questionnaire Metrics",
      icon: FiBarChart2,
      description: "Access detailed analytics and insights about your travel preferences and questionnaire responses to optimize your travel planning.",
      details: [
        "View your travel personality analysis",
        "Track preference changes over time",
        "Get insights into travel patterns",
        "Export your travel data"
      ]
    }
  ];

  const toggleExpanded = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F0F9FF] to-white pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1196A0] rounded-full mb-6">
              <FiBarChart2 className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 font-[var(--font-heading)]">
              How It Works
            </h1>

            <p className="text-xl text-[#475569] mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover amazing travel destinations through our intelligent recommendation system.
              Follow these simple steps to start your personalized travel journey.
            </p>

            <div className="flex justify-center">
              <div className="bg-[#1196A0] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#0C7C84] transition-colors cursor-pointer">
                Get Started Today
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        <div className="container mx-auto px-6 py-16">
          <div className="flex gap-12 sticky-parent-fix flex-sticky-container">

            {/* Sidebar Navigation */}
            <div className="w-80 flex-shrink-0 sticky-parent-fix">
              <div className="sticky-sidebar force-sticky-fix">
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-lg">
                  <h3 className="font-semibold text-lg text-[#0F172A] mb-6">Steps Overview</h3>

                  <div className="space-y-3">
                    {steps.map((step) => (
                      <button
                        key={step.id}
                        onClick={() => {
                          const element = document.getElementById(`step-${step.id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${activeStep === step.id
                            ? 'bg-[#E6F6F7] border-2 border-[#1196A0] text-[#0C7C84]'
                            : 'hover:bg-[#F1F5F9] border-2 border-transparent text-[#475569]'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${activeStep === step.id
                            ? 'bg-[#1196A0] text-white'
                            : 'bg-[#E2E8F0] text-[#475569]'
                          }`}>
                          {step.id}
                        </div>
                        <span className="font-medium">{step.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="space-y-24">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    id={`step-${step.id}`}
                    className="step-section scroll-mt-24"
                  >
                    {/* Step Content */}
                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-[#1196A0] rounded-2xl flex items-center justify-center">
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#1196A0] mb-1">
                            Step {step.id}
                          </div>
                          <h2 className="text-3xl font-bold text-[#0F172A] font-[var(--font-heading)]">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      <div className="bg-[#F8FAFC] rounded-2xl p-8 mb-6">
                        <p className="text-lg text-[#475569] leading-relaxed mb-6">
                          {step.description}
                        </p>

                        <button
                          onClick={() => toggleExpanded(step.id)}
                          className="flex items-center gap-2 text-[#1196A0] font-medium hover:text-[#0C7C84] transition-colors"
                        >
                          <span>View Details</span>
                          {expandedStep === step.id ? (
                            <FiChevronUp className="w-4 h-4" />
                          ) : (
                            <FiChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {expandedStep === step.id && (
                          <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                            <h4 className="font-semibold text-[#0F172A] mb-4">What you can do:</h4>
                            <ul className="space-y-3">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-[#1196A0] rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-[#475569]">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Demo Area - Now Below Description */}
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-gradient-to-br from-[#E6F6F7] to-[#F0F9FF] rounded-2xl p-8 border border-[#1196A0]/20">
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Try it yourself</h3>
                          <p className="text-[#475569]">Interactive demo for {step.title}</p>
                        </div>

                        <div className="aspect-video bg-white rounded-xl border border-[#E2E8F0] flex items-center justify-center mb-6">
                          <div className="text-center">
                            <step.icon className="w-16 h-16 text-[#1196A0] mx-auto mb-4" />
                            <div className="text-lg font-medium text-[#475569] mb-2">
                              {step.title} Demo
                            </div>
                            <div className="text-sm text-[#94A3B8]">
                              Click the button below to interact
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="inline-flex items-center gap-3 bg-[#1196A0] text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-[#0C7C84] transition-colors cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105">
                            <span>Try {step.title}</span>
                            <step.icon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    {index < steps.length - 1 && (
                      <div className="mt-16 pt-8 border-t border-[#E2E8F0]"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-[#1196A0] to-[#0C7C84] py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6 font-[var(--font-heading)]">
              Ready to Start Your Travel Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of travelers who are discovering amazing destinations
              through our personalized recommendation system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white text-[#1196A0] px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
                Get Started Now
              </div>
              <div className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#1196A0] transition-colors cursor-pointer">
                Learn More
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
