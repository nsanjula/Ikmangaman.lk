import React, { useState, useEffect, useRef } from 'react';
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
  FiChevronUp,
  FiMessageSquare
} from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { useAuth } from "../contexts/AuthContext";

const StepMedia: React.FC<{ stepId: number }> = ({ stepId }) => {
  // Centralized config so hooks are always called in the same order
  const cfg = React.useMemo(() => {
    const map: Record<number, { slides: string[]; scrollIndex?: number | number[]; dwell?: number[]; alt: string; scrollDurationMs?: number | number[] }> = {
      1: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F3785bc09384b42beb967a17e29ffd2c3%2Fb65a95bb2cb944e3845c32fb14f1d092?format=webp&width=1600",
        ],
        alt: "Step 1 - Sign Up screenshot",
      },
      2: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F3785bc09384b42beb967a17e29ffd2c3%2Fe25b8577b5bb4b0aaaa6bd32cfbe44c0?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F3785bc09384b42beb967a17e29ffd2c3%2F71de632fb8b24eef84b7b58cc1f334c3?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F3785bc09384b42beb967a17e29ffd2c3%2Fcc29933a87f64cd1b2d58027f7389290?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F3785bc09384b42beb967a17e29ffd2c3%2F920848f4273c415ab507363466a4d9a1?format=webp&width=1600",
        ],
        alt: "Step 2 - Fill Questionnaire slideshow",
      },
      3: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F3785bc09384b42beb967a17e29ffd2c3%2F309134c023c74b83928529f832f25ee0?format=webp&width=1600",
          "/howitworks/scrolling_destination.png",
        ],
        scrollIndex: 1,
        dwell: [2000, 9000],
        alt: "Step 3 - Select Recommendation",
      },
      4: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F6887b10baa9b4117ba8a97ec9a1af281?format=webp&width=1600",
          "/howitworks/profile.png",
          "/howitworks/saved-destination.png"
        ],
        scrollIndex: [1, 2],
        scrollDurationMs: [2500, 6000],
        alt: "Step 4 - Save Places",
      },
      5: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2Ffcf5b22a9b724e1e9fa5fa09b218d41d?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F77ae65ab4aba4c6d91905436eca8389e?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F6a02887299af42de8fe3c56e6d2150e1?format=webp&width=1600",
        ],
        alt: "Step 5 - Edit Profile slideshow",
      },
      6: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F80dd76e19a8f4d2983b554c0a07f8870?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F785f1e8176a8466fb8a7d60115082ee5?format=webp&width=1600",
        ],
        alt: "Step 6 - Search by Text slideshow",
      },
      7: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F6aa97101306246deb6cc20cba710193e?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2Fdf414a7970ea40eaa76ef3ebf4a90c91?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2Fc381ab7ea7c94049a8ecf953d6486f9c?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2Fbf35648d7bc3439b9ac48b64d16a1e3e?format=webp&width=1600",
        ],
        alt: "Step 7 - Search by Image slideshow",
      },
      8: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F48fa62b7c0604f1b9fc8cff958009816?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F440c2f865e6349fe8edcee11d63517a3?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F0a1c1ed2381647348e35ea0f3bbc24d9?format=webp&width=1600",
          "/howitworks/use-questionnaire-metrics.png",
        ],
        scrollIndex: 3,
        dwell: [2000, 2000, 2000, 9000],
        alt: "Step 8 - Questionnaire metrics slideshow",
      },
      9: {
        slides: [
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2Fdc204ef251b54e0488ed948c0ee14fa1?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F91ebcf0932e54cc0ac4f24b28f739ceb?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2Fdacb2b5cd7a04fc4bfa18445505eb351?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F5f557b9fc80742d6847f22d604832ef7?format=webp&width=1600",
          "https://cdn.builder.io/api/v1/image/assets%2F60311f6242b1434cb753d5f3e4c9af86%2F3b71b7fb14974eff841a555ffca5a454?format=webp&width=1600",
        ],
        alt: "Step 9 - Travel Assistant slideshow",
      },
    };
    return map[stepId as keyof typeof map] ?? map[1];
  }, [stepId]);

  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollHolderRef = useRef<HTMLDivElement | null>(null);
  const scrollImgRef = useRef<HTMLImageElement | null>(null);
  const { isAuthenticated } = useAuth();

  // Observe visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          } else {
            setInView(false);
            setCurrent(0); // reset when out of view
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isScrollingSlide = cfg.scrollIndex != null && (Array.isArray(cfg.scrollIndex) ? cfg.scrollIndex.includes(current) : current === cfg.scrollIndex);

  // Preload tall image when step is visible to avoid blank top during buffer
  useEffect(() => {
    if (!inView || cfg.scrollIndex == null) return;
    const indices = Array.isArray(cfg.scrollIndex) ? cfg.scrollIndex : [cfg.scrollIndex];
    indices.forEach((idx) => {
      const src = cfg.slides[idx];
      const pre = new Image();
      pre.src = src;
      if ((pre as any).decode) {
        (pre as any).decode().catch(() => undefined);
      }
    });
  }, [inView, cfg.scrollIndex, cfg.slides]);

  // Advance slides with dwell per step; if single slide, skip
  useEffect(() => {
    if (!inView) return;
    if (cfg.slides.length <= 1) return;
    const getScrollMs = () => {
      if (Array.isArray(cfg.scrollDurationMs)) return cfg.scrollDurationMs[current] ?? 8000;
      return cfg.scrollDurationMs ?? 8000;
    };
    const defaultScrollDwell = getScrollMs() + 2000; // 1s pre + 1s post buffers
    const dwell = cfg.dwell?.[current] ?? (isScrollingSlide ? defaultScrollDwell : 2000);
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % cfg.slides.length);
    }, dwell);
    return () => clearInterval(id);
  }, [inView, current, cfg.dwell, cfg.slides.length, isScrollingSlide, cfg.scrollDurationMs]);

  // Scroll animation for long slide
  useEffect(() => {
    const holder = scrollHolderRef.current;
    const img = scrollImgRef.current;

    if (!isScrollingSlide || !inView || !holder || !img) {
      if (img) {
        img.style.transition = '';
        // Do not reset transform here to avoid flashing the top before slide change
      }
      return;
    }

    let startTimer: number | undefined;

    const run = () => {
      const holderH = holder.getBoundingClientRect().height;
      const imgH = img.getBoundingClientRect().height;
      const maxScroll = Math.max(0, imgH - holderH);
      // Prepare static frame, then animate smoothly after buffer
      img.style.willChange = 'transform';
      img.style.transition = 'none';
      img.style.transform = 'translateY(0) translateZ(0)';
      void (img as any).offsetHeight;
      // 1s buffer before starting scroll
      startTimer = window.setTimeout(() => {
        const durationMs = Array.isArray(cfg.scrollDurationMs) ? (cfg.scrollDurationMs[current] ?? 8000) : (cfg.scrollDurationMs ?? 8000);
        img.style.transition = `transform ${durationMs}ms linear`;
        requestAnimationFrame(() => {
          if (maxScroll > 0) {
            img.style.transform = `translateY(-${maxScroll}px)`;
          }
        });
      }, 1000);
    };

    if (img.complete) run();
    else {
      const onLoad = () => run();
      img.addEventListener('load', onLoad, { once: true });
    }

    return () => {
      if (startTimer) window.clearTimeout(startTimer);
      if (img) {
        img.style.transition = '';
        // Keep final transform position; next run will explicitly reset to 0 before animating
      }
    };
  }, [inView, isScrollingSlide, cfg.scrollIndex, current, cfg.scrollDurationMs]);

  // Render
  return (
    <div ref={containerRef} className="w-full h-full">
      {isScrollingSlide ? (
        <div ref={scrollHolderRef} className="w-full h-full overflow-hidden">
          <img
            ref={scrollImgRef}
            src={cfg.slides[current]}
            alt={`${cfg.alt} scroll preview`}
            style={{ width: '100%', height: 'auto', display: 'block', transform: 'translateY(0)' }}
            loading="eager"
            decoding="sync"
            fetchpriority="high"
          />
        </div>
      ) : (
        <img
          src={cfg.slides[current]}
          alt={cfg.alt}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      )}
    </div>
  );
};

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showStepsNav, setShowStepsNav] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useScrollToTop();
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowStepsNav(!isMobile);
  }, [isMobile]);

  // Add CSS for better sticky behavior
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sticky-sidebar {
        position: sticky !important;
        top: 2rem !important;
        align-self: flex-start !important;
        overflow: visible !important;
        z-index: 30 !important;
      }

      .sticky-sidebar::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      @keyframes scrollVertical {
        0% { background-position: center top; }
        100% { background-position: center bottom; }
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
    },
    {
      id: 9,
      title: "Travel Assistant",
      icon: FiMessageSquare,
      description: "Chat with TripMate to ask questions, get budgets, and plan faster with AI help right inside the app.",
      details: [
        "Open the assistant from any page",
        "Ask travel questions in plain English",
        "Receive actionable tips and budgets",
        "Refine results with follow-up prompts"
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

      <div className=" bg-cyan-100 dark:bg-gray-800 pt-24 pb-16 ">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1196A0] rounded-full mb-6">
              <FiBarChart2 className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold dark:text-white text-[#0F172A] mb-6 font-[var(--font-heading)]">
              How It Works
            </h1>

            <p className="text-xl text-[#475569]  dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover amazing travel destinations through our intelligent recommendation system.
              Follow these simple steps to start your personalized travel journey.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => isAuthenticated ? navigate("/recommendation") : navigate("/register")}
                className="w-full sm:w-auto bg-[#159CAF] hover:bg-[#0d7a8a] text-white px-10 py-5 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        <div className="container mx-auto px-6 py-16">
          {/* Mobile Steps Toggle */}
          <div className="lg:hidden mb-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-lg">
              <div
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => setShowStepsNav(!showStepsNav)}
              >
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-lg" style={{ color: 'var(--text-900)' }} />
                  <h2 className="text-md font-semibold" style={{ color: 'var(--text-900)' }}>Steps Overview</h2>
                </div>
                {showStepsNav ? <FiChevronUp style={{ color: 'var(--text-600)' }} /> : <FiChevronDown style={{ color: 'var(--text-600)' }} />}
              </div>
              {showStepsNav && (
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
                        : 'bg-[#E2E8F0] text-[#475569] '
                        }`}>
                        {step.id}
                      </div>
                      <span className="font-medium">{step.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-12 sticky-parent-fix flex-sticky-container">

            {/* Sidebar Navigation */}
            <div className="hidden lg:block w-80 flex-shrink-0 sticky-parent-fix">
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
                          : 'hover:bg-[#F1F5F9] border-2 border-transparent text-[#475569] dark:hover:bg-gray-800 dark:text-white dark:hover:text-white'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${activeStep === step.id
                          ? 'bg-[#1196A0] text-white'
                          : 'bg-[#E2E8F0] text-[#475569] '
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
                          <h2 className="text-3xl font-bold dark:text-white text-[#0F172A] font-[var(--font-heading)]">
                            {step.title}
                          </h2>
                        </div>
                      </div>

                      <div className="bg-[#F8FAFC] dark:bg-gray-800 rounded-2xl p-8 mb-6">
                        <p className="text-lg text-[#475569] dark:text-gray-400 leading-relaxed mb-6">
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
                            <h4 className="font-semibold text-[#0F172A] dark:text-white mb-4">What you can do:</h4>
                            <ul className="space-y-3">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="w-2 h-2 bg-[#1196A0] rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-[#475569] dark:text-gray-400 ">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Container Area */}
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-cyan-50 dark:bg-gray-800 rounded-2xl p-4 border border-[#1196A0]/20">
                        <div className="aspect-video bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                          <StepMedia stepId={step.id} />
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
              <button
                onClick={() => isAuthenticated ? navigate("/recommendation") : navigate("/register")}
                className="w-full sm:w-auto bg-[#159CAF] hover:bg-[#0d7a8a] text-white px-10 py-5 rounded-full font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
