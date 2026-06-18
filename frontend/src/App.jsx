import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { DashboardLayout } from '@/components/shared/layout/DashboardLayout';
import Landing from '@/pages/marketing/Landing';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import Setup2FAOnboarding from '@/pages/auth/Setup2FAOnboarding';
import AboutPage from '@/pages/marketing/AboutPage';
import BlogPage from '@/pages/marketing/BlogPage';
import CareersPage from '@/pages/marketing/CareersPage';
import ContactPage from '@/pages/marketing/ContactPage';
import DocsPage from '@/pages/resources/DocsPage';
import ApiDocsPage from '@/pages/resources/ApiDocsPage';
import StatusPage from '@/pages/resources/StatusPage';
import PrivacyPage from '@/pages/resources/PrivacyPage';
import BillingSuccess from '@/pages/billing/BillingSuccess';
import BillingCancel from '@/pages/billing/BillingCancel';
import Dashboard from '@/pages/dashboard/Dashboard';
import Projects from '@/pages/projects/Projects';
import ProjectDetail from '@/pages/projects/ProjectDetail';
import Analytics from '@/pages/dashboard/Analytics';
import ChangeHistory from '@/pages/dashboard/ChangeHistory';
import AIChat from '@/pages/chat/AIChat';
import Settings from '@/pages/settings/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/onboarding/setup-2fa" element={<ProtectedRoute><Setup2FAOnboarding /></ProtectedRoute>} />

        {/* Marketing / footer pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/api-docs" element={<ApiDocsPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="changes" element={<ChangeHistory />} />
          <Route path="chat" element={<AIChat />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
