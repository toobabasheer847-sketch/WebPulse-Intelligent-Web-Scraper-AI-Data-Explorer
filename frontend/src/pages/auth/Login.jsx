import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, verifyLogin2FA, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const result = await login(email, password);
      console.log("Login successful! Response payload:", result);
      console.log("Zustand auth state updated with token:", useAuthStore.getState().token);
      console.log("Zustand auth state updated with user:", useAuthStore.getState().user);
      
      if (result.require2FA) {
        setTempToken(result.tempToken);
        setRequire2FA(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.unverified && err.email) {
        navigate(`/verify-email?email=${encodeURIComponent(err.email)}`);
      } else {
        setLocalError(err.message);
      }
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      await verifyLogin2FA(tempToken, twoFactorCode);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleBack = () => {
    setRequire2FA(false);
    setTempToken('');
    setTwoFactorCode('');
    setLocalError('');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-2/5 items-center justify-center bg-gradient-to-br from-[#2E115D] via-[#100527] to-[#070216] relative overflow-hidden">
        {/* Warm radial glow behind logo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,160,82,0.15)_0%,_transparent_60%)]" />
        <div className="text-center max-w-md p-8 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/20">
              <Activity className="h-7 w-7 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">WebPulse</h2>
          <p className="text-lg text-white/80 italic">
            "Data is a precious thing and will last longer than the systems themselves." — Tim Berners-Lee
          </p>
        </div>
      </div>
      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-3/5 items-center justify-center bg-[#080316] p-6 relative overflow-hidden">
        {/* Subtle background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2E115D]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFA052]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <Card className="bg-white/[0.02] backdrop-blur-md border border-purple-500/20 shadow-2xl shadow-purple-950/50 rounded-xl p-8 max-w-md w-full relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10">
              <Activity className="h-6 w-6 text-brand-orange" />
            </div>
            <CardTitle className="text-white">{require2FA ? 'Two-Factor Authentication' : 'Welcome back!'}</CardTitle>
            <CardDescription className="text-purple-300">
              {require2FA ? 'Enter the code from your authenticator app' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {require2FA ? (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                {(localError || error) && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {localError || error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode" className="text-purple-300">6-Digit Code</Label>
                  <Input
                    id="twoFactorCode"
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="bg-zinc-950/40 border border-purple-900/30 text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1 border-purple-500/20 bg-white/5 text-purple-300 hover:bg-purple-500/20" onClick={handleBack} disabled={loading}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-brand-orange hover:bg-brand-orange-hover" disabled={loading || twoFactorCode.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(localError || error) && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {localError || error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-zinc-950/40 border border-purple-900/30 text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="mb-1 flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-purple-300">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-brand-orange transition-colors hover:text-brand-orange-hover hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-zinc-950/40 border border-purple-900/30 text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-200 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange-hover" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            )}
            {!require2FA && (
              <p className="mt-4 text-center text-sm text-purple-300">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-brand-orange hover:text-purple-200 hover:underline">Create Account</Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
