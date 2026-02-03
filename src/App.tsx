import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientDashboard from "./pages/ClientDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import CaseDetails from "./pages/CaseDetails";
import LawyerProfile from "./pages/LawyerProfile";
import ChatAI from "./pages/ChatAI";
import BookAppointment from "./pages/BookAppointment";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
// Client pages
import RecommendedLawyers from "./pages/client/RecommendedLawyers";
import CaseSummary from "./pages/client/CaseSummary";
import Appointments from "./pages/client/Appointments";
// Lawyer pages
import ClientRequests from "./pages/lawyer/ClientRequests";
import RecommendedCases from "./pages/lawyer/RecommendedCases";
import ProfileSettings from "./pages/lawyer/ProfileSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
          <Route path="/case/:id" element={<CaseDetails />} />
          <Route path="/lawyer/:id" element={<LawyerProfile />} />
          <Route path="/chat-ai" element={<ChatAI />} />
          <Route path="/book-appointment/:lawyerId" element={<BookAppointment />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* Client routes */}
          <Route path="/client/recommended-lawyers" element={<RecommendedLawyers />} />
          <Route path="/client/case-summary" element={<CaseSummary />} />
          <Route path="/client/appointments" element={<Appointments />} />
          {/* Lawyer routes */}
          <Route path="/lawyer/client-requests" element={<ClientRequests />} />
          <Route path="/lawyer/recommended-cases" element={<RecommendedCases />} />
          <Route path="/lawyer/profile-settings" element={<ProfileSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
