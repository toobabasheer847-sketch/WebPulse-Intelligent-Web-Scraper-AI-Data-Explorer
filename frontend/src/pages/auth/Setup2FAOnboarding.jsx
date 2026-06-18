import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

export default function Setup2FAOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser, fetchMe } = useAuthStore();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(true);
  const inputsRef = useRef([]);

  const generateSecret = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await authApi.generate2FA();
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate 2FA setup');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await fetchMe();
    };
    initializePage();
  }, [fetchMe]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user?.is_two_factor_enabled) {
      navigate('/dashboard');
      return;
    }

    if (qrCodeUrl === '') {
      generateSecret();
    }
  }, [user, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const codeString = code.join('');
    
    if (codeString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await authApi.enable2FA(codeString);
      await fetchMe();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  if (generating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-8 w-8 animate-spin text-brand-orange" />
          <p className="text-zinc-400">Preparing your secure setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <Card className="w-full max-w-md bg-brand-card/80 border border-purple-500/20 shadow-lg shadow-purple-950/40 rounded-xl p-8">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10">
            <ShieldCheck className="h-6 w-6 text-brand-orange" />
          </div>
          <CardTitle className="text-white">Secure Your Account: Setup 2FA</CardTitle>
          <CardDescription className="text-zinc-400">
            Add an extra layer of security by setting up two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="space-y-2">
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                <Button type="button" variant="outline" onClick={generateSecret} className="w-full border-purple-500/20 bg-brand-card text-zinc-300 hover:bg-purple-500/20">
                  Retry
                </Button>
              </div>
            )}

            {!error && qrCodeUrl && (
              <>
                <div className="flex justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for 2FA" 
                    className="border-2 border-purple-500/20 rounded-lg p-2 bg-white"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-zinc-400 mb-2">
                    Scan the QR code with Google Authenticator or Authy,
                    <br /> or manually enter this secret key:
                  </p>
                  <p className="font-mono bg-brand-card/50 p-3 rounded text-sm break-all text-white">{secret}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">Enter 6-Digit Code</Label>
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-semibold border-purple-500/20 bg-brand-bg text-white"
                        inputMode="numeric"
                        pattern="[0-9]"
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange-hover" disabled={loading}>
                  {loading ? 'Enabling 2FA...' : 'Enable & Finish Setup'}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
