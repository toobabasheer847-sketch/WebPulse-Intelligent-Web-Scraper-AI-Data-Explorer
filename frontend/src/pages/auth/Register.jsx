import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await register(name, email, password);
      navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (err) {
      setError(err.message);
    }
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
            "The goal is to turn data into information, and information into insight." — Carly Fiorina
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
            <CardTitle className="text-white">Create Account</CardTitle>
            <CardDescription className="text-purple-300">
              Start scraping with WebPulse today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-300">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-zinc-950/40 border border-purple-900/30 text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50"
                />
              </div>
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
                <Label htmlFor="password" className="text-sm font-medium text-purple-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-950/40 border border-purple-900/30 text-zinc-100 placeholder-zinc-500 focus:border-purple-500/50 pr-10"
                    minLength={8}
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
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-purple-300">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-orange hover:text-purple-200 hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
