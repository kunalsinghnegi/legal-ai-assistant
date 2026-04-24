import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ClientDashboard from "./pages/ClientDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import CaseDetails from "./pages/CaseDetails";
import LawyerProfile from "./pages/LawyerProfile";
import ChatAI from "./pages/ChatAI";
import BookAppointment from "./pages/BookAppointment";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import RecommendedLawyers from "./pages/client/RecommendedLawyers";
import CaseSummary from "./pages/client/CaseSummary";
import Appointments from "./pages/client/Appointments";
import ClientRequests from "./pages/lawyer/ClientRequests";
import AcceptedCases from "./pages/lawyer/AcceptedCases";
import RecommendedCases from "./pages/lawyer/RecommendedCases";
import ProfileSettings from "./pages/lawyer/ProfileSettings";
import ClientChat from "./pages/client/Chat";
import LawyerChat from "./pages/lawyer/Chat";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/client-dashboard" element={<ProtectedRoute requireRole="client"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/lawyer-dashboard" element={<ProtectedRoute requireRole="lawyer"><LawyerDashboard /></ProtectedRoute>} />
            <Route path="/case/:id" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
            <Route path="/lawyer/:id" element={<LawyerProfile />} />
            <Route path="/chat-ai" element={<ProtectedRoute><ChatAI /></ProtectedRoute>} />
            <Route path="/book-appointment/:lawyerId" element={<ProtectedRoute requireRole="client"><BookAppointment /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminPanel /></ProtectedRoute>} />
            <Route path="/client/recommended-lawyers" element={<ProtectedRoute requireRole="client"><RecommendedLawyers /></ProtectedRoute>} />
            <Route path="/client/case-summary" element={<ProtectedRoute requireRole="client"><CaseSummary /></ProtectedRoute>} />
            <Route path="/client/appointments" element={<ProtectedRoute requireRole="client"><Appointments /></ProtectedRoute>} />
            <Route path="/lawyer/client-requests" element={<ProtectedRoute requireRole="lawyer"><ClientRequests /></ProtectedRoute>} />
            <Route path="/lawyer/accepted-cases" element={<ProtectedRoute requireRole="lawyer"><AcceptedCases /></ProtectedRoute>} />
            <Route path="/client/chat" element={<ProtectedRoute requireRole="client"><ClientChat /></ProtectedRoute>} />
            <Route path="/lawyer/chat" element={<ProtectedRoute requireRole="lawyer"><LawyerChat /></ProtectedRoute>} />
            <Route path="/lawyer/recommended-cases" element={<ProtectedRoute requireRole="lawyer"><RecommendedCases /></ProtectedRoute>} />
            <Route path="/lawyer/profile-settings" element={<ProtectedRoute requireRole="lawyer"><ProfileSettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
