import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  console.log("🔍 [ProtectedRoute] Current Auth State:", { 
    token: token ? "PRESENT" : "MISSING", 
    user 
  });
  console.log("🔍 [ProtectedRoute] Current Location:", location.pathname);

  // Step 1: Check if user has a valid token
  if (!token) {
    console.log("❌ [ProtectedRoute] Redirecting to /login. Reason: No token found");
    return <Navigate to="/login" replace />;
  }

  // Step 2: Check if email is verified
  if (!user?.is_verified) {
    console.log("❌ [ProtectedRoute] Redirecting to /verify-email. Reason: Email not verified");
    return <Navigate to={`/verify-email?email=${user?.email || ''}`} replace />;
  }

  // Step 3: Check if user has valid billing status (free or active)
  const hasValidBilling = user?.subscription_status === 'free' || user?.subscription_status === 'active';
  // Don't redirect to pricing if user is already on a billing-related page
  if (!hasValidBilling && 
      !location.pathname.startsWith('/billing/') && 
      !location.pathname.includes('#pricing')) {
    console.log("❌ [ProtectedRoute] Redirecting to /pricing. Reason: Inactive/Invalid subscription:", user?.subscription_status);
    return <Navigate to="/#pricing" replace />;
  }

  // Step 4: Check if 2FA is enabled (except when already on setup page)
  if (!user?.is_two_factor_enabled && location.pathname !== '/onboarding/setup-2fa') {
    console.log("❌ [ProtectedRoute] Redirecting to /onboarding/setup-2fa. Reason: 2FA not enabled");
    return <Navigate to="/onboarding/setup-2fa" replace />;
  }

  console.log("✅ [ProtectedRoute] All checks passed. Rendering protected content");
  return children;
}
