import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import OfflineNotice from "./components/OfflineNotice";
import BackendStartupBanner from "./components/BackendStartupBanner";
// import BackendConnectionDiagnostic from "./components/BackendConnectionDiagnostic";
import LoadingOverlay from "./components/LoadingOverlay";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NoRecommendation from "./pages/NoRecommendation";
import Questionare from "./pages/Questionare";
import Recommendation from "./pages/Recommendation";
import DestinationDetail from "./pages/DestinationDetail";
import Profile from "./pages/Profile";
import AboutUsPage from "./pages/AboutUsPage";
import CompassLoaderShowcase from "./pages/CompassLoaderShowcase";
import SearchResults from "./pages/SearchResults";
import SearchDestinationDetail from "./pages/SearchDestinationDetail";
import QuestionnaireMetricsPage from "./pages/QuestionnaireMetricsPage";
import SavedPlaceDestinationDetail from "./pages/SavedPlaceDestinationDetail";
import CreateItinerary from "./pages/CreateItinerary";
import ItineraryDestinationDetail from "./pages/ItineraryDestinationDetail";
import HowItWorksPage from "./pages/HowItWorksPage";
import ChatBot from "./components/ChatBot";
import HowItWorks from "./pages/HowItWorksPage";
import PrivacyPolicy from "./pages/PrivacyPolicyPage";
import TermsOfService from "./pages/TermsofServicePage";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Immediately scroll to top on app start to ensure loading animations are visible
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Minimal iframe cache prevention
    if (window.frameElement) {
      // Simple cache busting for iframe
      const timestamp = Date.now();
      document.documentElement.setAttribute('data-iframe-timestamp', timestamp.toString());
    }

    // Handle global page cache issues that affect navigation
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('App loaded from browser cache');

        // Clean up any problematic session data that might cause navigation issues
        const currentPath = window.location.pathname;

        // If we're on questionnaire-metrics with create-itinerary mode, ensure clean state
        if (currentPath.includes('questionnaire-metrics') && window.location.search.includes('create-itinerary')) {
          console.log('Cleaning up questionnaire cache data due to page cache');
          sessionStorage.removeItem('tempQuestionnaireData');
          sessionStorage.removeItem('itinerary_questionnaire_data');
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return (
    <div className="iframe-safe stable-layout">
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineNotice />
            <BackendStartupBanner />
            {/* <BackendConnectionDiagnostic /> */}
            <LoadingOverlay />
            <BrowserRouter>
              <AuthProvider>
                <ChatBot />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/norecommendation" element={<NoRecommendation />} />
                  <Route path="/questionare" element={<Questionare />} />
                  <Route path="/questionnaire" element={<Questionare />} />
                  <Route path="/questionnaire-metrics" element={<QuestionnaireMetricsPage />} />
                  <Route path="/recommendation" element={<Recommendation />} />
                  <Route path="/create-itinerary" element={<CreateItinerary />} />
                  <Route path="/itinerary/:itineraryId/day/:dayNumber/destination/:destinationId" element={<ItineraryDestinationDetail />} />
                  <Route path="/destination/:id" element={<DestinationDetail />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/search/destination/:id" element={<SearchDestinationDetail />} />
                  <Route path="/saved-destination/:id" element={<SavedPlaceDestinationDetail />} />
                  <Route path="/aboutus" element={<AboutUsPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/compass-loader" element={<CompassLoaderShowcase />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
