import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
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
import NoRecommendation from "./pages/NoRecommendation";
import Questionare from "./pages/Questionare";
import Recommendation from "./pages/Recommendation";
import DestinationDetail from "./pages/DestinationDetail";
import Profile from "./pages/Profile";
import AboutUsPage from "./pages/AboutUsPage";
import CompassLoaderShowcase from "./pages/CompassLoaderShowcase";
const queryClient = new QueryClient();

const App = () => (
  <div className="iframe-safe stable-layout">
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <OfflineNotice />
            <BackendStartupBanner />
            {/* <BackendConnectionDiagnostic /> */}
            <LoadingOverlay />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/norecommendation" element={<NoRecommendation />} />
                <Route path="/questionare" element={<Questionare />} />
                <Route path="/questionnaire" element={<Questionare />} />
                <Route path="/recommendation" element={<Recommendation />} />
                <Route path="/destination/:id" element={<DestinationDetail />} />
                <Route path="/aboutus" element={<AboutUsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/compass-loader" element={<CompassLoaderShowcase />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LoadingProvider>
    </QueryClientProvider>
  </div>
);

createRoot(document.getElementById("root")!).render(<App />);
