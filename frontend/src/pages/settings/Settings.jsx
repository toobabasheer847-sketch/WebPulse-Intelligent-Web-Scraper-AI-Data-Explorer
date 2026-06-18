import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Loader2, Sparkles, Pencil, ShieldCheck,
  Key, Trash2, Copy, Check, TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import { useAuthStore } from '@/stores/authStore';
import { billingApi, authApi } from '@/lib/api';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

const STATUS_LABELS = {
  free:     { label: 'Free',     variant: 'secondary'    },
  active:   { label: 'Active',   variant: 'success'      },
  trialing: { label: 'Trial',    variant: 'success'      },
  past_due: { label: 'Past Due', variant: 'destructive'  },
  canceled: { label: 'Canceled', variant: 'outline'      },
};

export default function Settings() {
  const { user, updateUser } = useAuthStore();

  // ── Profile ──────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing]   = useState(false);
  const [nameInput, setNameInput]   = useState(user?.name || '');
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── 2FA ──────────────────────────────────────────────────────────────────
  const [twoFactorStep, setTwoFactorStep]       = useState('initial');
  const [qrCodeUrl, setQrCodeUrl]               = useState('');
  const [twoFactorSecret, setTwoFactorSecret]   = useState('');
  const [twoFactorCode, setTwoFactorCode]       = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError]     = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');

  // ── Developer API keys ────────────────────────────────────────────────────
  const [apiKeys, setApiKeys]           = useState([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(true);
  const [newKeyName, setNewKeyName]     = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [revealedKey, setRevealedKey]   = useState(null); // shown once after creation
  const [copied, setCopied]             = useState(false);
  const [revokingId, setRevokingId]     = useState(null);

  // ── Billing ───────────────────────────────────────────────────────────────
  const [portalLoading, setPortalLoading]     = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingError, setBillingError]       = useState(null);

  // ── Derived ───────────────────────────────────────────────────────────────
  const statusKey  = user?.subscription_status || 'free';
  const statusMeta = STATUS_LABELS[statusKey] || STATUS_LABELS.free;
  const isPro      = user?.subscription_plan === 'pro' && ['active', 'trialing'].includes(statusKey);

  // ── API key helpers ───────────────────────────────────────────────────────
  const fetchApiKeys = useCallback(async () => {
    setApiKeysLoading(true);
    try {
      const { data } = await api.get('/keys');
      setApiKeys(data.keys || []);
    } catch {
      // silently fail — table stays empty
    } finally {
      setApiKeysLoading(false);
    }
  }, []);

  useEffect(() => { fetchApiKeys(); }, [fetchApiKeys]);

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setGenerateError(null);
    setGeneratingKey(true);
    try {
      const { data } = await api.post('/keys/generate', { name: newKeyName.trim() });
      setRevealedKey(data.apiKey.rawKey);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      setGenerateError(err.response?.data?.error || 'Failed to generate API key.');
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    setRevokingId(keyId);
    try {
      await api.delete(`/keys/${keyId}`);
      setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    } catch {
      // no-op
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyKey = async () => {
    if (!revealedKey) return;
    try {
      await navigator.clipboard.writeText(revealedKey);
    } catch {
      const el = document.createElement('textarea');
      el.value = revealedKey;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const closeRevealModal = () => { setRevealedKey(null); setCopied(false); };

  const apiKeyColumns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-zinc-200">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'truncated_key',
      header: 'Key',
      cell: ({ row }) => (
        <code className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-mono text-purple-300">
          {row.original.truncated_key}
        </code>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-zinc-400 text-sm">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          disabled={revokingId === row.original.id}
          onClick={() => handleRevokeKey(row.original.id)}
          aria-label="Revoke key"
        >
          {revokingId === row.original.id
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Trash2 className="h-4 w-4" />}
        </Button>
      ),
    },
  ];

  // ── Profile handlers ──────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile({ name: nameInput });
      updateUser(data.user);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(user?.name || '');
    setIsEditing(false);
    setSaveError(null);
  };

  // ── 2FA handlers ──────────────────────────────────────────────────────────
  const handleStart2FASetup = async () => {
    setTwoFactorError('');
    setTwoFactorSuccess('');
    setTwoFactorLoading(true);
    try {
      const { data } = await authApi.generate2FA();
      setQrCodeUrl(data.qrCodeUrl);
      setTwoFactorSecret(data.secret);
      setTwoFactorStep('setup');
    } catch (err) {
      setTwoFactorError(err.response?.data?.error?.message || 'Failed to generate 2FA setup.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');
    setTwoFactorLoading(true);
    try {
      await authApi.enable2FA(twoFactorCode);
      const { data: userData } = await authApi.me();
      updateUser(userData.user);
      setTwoFactorStep('initial');
      setTwoFactorSuccess('2FA enabled successfully!');
    } catch (err) {
      setTwoFactorError(err.response?.data?.error?.message || 'Failed to enable 2FA.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');
    setTwoFactorLoading(true);
    try {
      await authApi.disable2FA(twoFactorCode);
      const { data: userData } = await authApi.me();
      updateUser(userData.user);
      setTwoFactorStep('initial');
      setTwoFactorSuccess('2FA disabled successfully!');
    } catch (err) {
      setTwoFactorError(err.response?.data?.error?.message || 'Failed to disable 2FA.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleCancel2FA = () => {
    setTwoFactorStep('initial');
    setQrCodeUrl('');
    setTwoFactorSecret('');
    setTwoFactorCode('');
    setTwoFactorError('');
  };

  // ── Billing handlers ──────────────────────────────────────────────────────
  const handleManageSubscription = async () => {
    setBillingError(null);
    setPortalLoading(true);
    try {
      const { data } = await billingApi.createPortalSession();
      window.location.href = data.url;
    } catch (err) {
      setBillingError(err.response?.data?.error?.message || 'Unable to open billing portal.');
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setBillingError(null);
    setCheckoutLoading(true);
    try {
      const { data } = await billingApi.createCheckoutSession();
      window.location.href = data.url;
    } catch (err) {
      setBillingError(err.response?.data?.error?.message || 'Unable to start checkout.');
      setCheckoutLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6 w-full p-6">

      {/* ── Profile ── */}
      <Card className="bg-brand-card/80 border border-purple-500/20 shadow-lg shadow-purple-950/40 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Profile</CardTitle>
            <CardDescription className="text-zinc-400">Your account information</CardDescription>
          </div>
          {!isEditing ? (
            <Button
              variant="outline" size="sm"
              onClick={() => setIsEditing(true)}
              className="border-purple-500/20 bg-brand-card text-zinc-300 hover:bg-purple-500/20"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                onClick={handleCancelEdit} disabled={saving}
                className="border-purple-500/20 bg-brand-card text-zinc-300 hover:bg-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                size="sm" onClick={handleSaveProfile} disabled={saving}
                className="bg-brand-orange hover:bg-brand-orange-hover"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {saveSuccess && <p className="text-sm text-brand-green">Profile updated successfully!</p>}
          {saveError   && <p className="text-sm text-destructive">{saveError}</p>}
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Name</span>
            {isEditing ? (
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="max-w-xs border-purple-500/20 bg-brand-bg text-white"
                autoFocus
              />
            ) : (
              <span className="font-medium text-white">{user?.name}</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Email</span>
            <span className="font-medium text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Role</span>
            <Badge variant="secondary" className="border-purple-500/20 bg-brand-card">{user?.role || 'user'}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Member since</span>
            <span className="font-medium text-white">{formatDate(user?.created_at)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Security / 2FA ── */}
      <Card className="bg-brand-card/80 border border-purple-500/20 shadow-lg shadow-purple-950/40 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-5 w-5 text-brand-orange" />
            Security &amp; Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {twoFactorSuccess && <p className="text-sm text-brand-green">{twoFactorSuccess}</p>}
          {twoFactorError   && <p className="text-sm text-destructive">{twoFactorError}</p>}

          {twoFactorStep === 'initial' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Two-Factor Authentication</p>
                <p className="text-sm text-zinc-400">
                  {user?.is_two_factor_enabled
                    ? 'Your account is protected with 2FA'
                    : 'Add 2FA using an authenticator app like Google Authenticator or Authy'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {user?.is_two_factor_enabled ? (
                  <>
                    <Badge variant="success" className="border-purple-500/20 bg-brand-card">Enabled</Badge>
                    <Button
                      variant="outline"
                      onClick={() => setTwoFactorStep('disable')}
                      className="border-purple-500/20 bg-brand-card text-zinc-300 hover:bg-purple-500/20"
                    >
                      Disable 2FA
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleStart2FASetup} disabled={twoFactorLoading}
                    className="bg-brand-orange hover:bg-brand-orange-hover"
                  >
                    {twoFactorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Setup Authenticator App
                  </Button>
                )}
              </div>
            </div>
          )}

          {twoFactorStep === 'setup' && (
            <form onSubmit={handleEnable2FA} className="space-y-4">
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code for 2FA" className="border border-purple-500/20 rounded-lg p-2 bg-white" />
              </div>
              <p className="text-sm text-zinc-400 text-center">
                Scan this QR code with your authenticator app, or manually enter the secret key:
              </p>
              <p className="font-mono text-center bg-brand-card/50 p-2 rounded text-white">{twoFactorSecret}</p>
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode" className="text-zinc-300">Enter the 6-digit code from your app</Label>
                <Input
                  id="twoFactorCode"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000" maxLength={6} required
                  className="border-purple-500/20 bg-brand-bg text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button" variant="outline" onClick={handleCancel2FA} disabled={twoFactorLoading}
                  className="border-purple-500/20 bg-brand-card text-zinc-300 hover:bg-purple-500/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit" disabled={twoFactorLoading || twoFactorCode.length !== 6}
                  className="bg-brand-orange hover:bg-brand-orange-hover"
                >
                  {twoFactorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enable 2FA
                </Button>
              </div>
            </form>
          )}

          {twoFactorStep === 'disable' && (
            <form onSubmit={handleDisable2FA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="disableCode" className="text-zinc-300">Enter your 6-digit 2FA code to disable</Label>
                <Input
                  id="disableCode"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000" maxLength={6} required
                  className="border-purple-500/20 bg-brand-bg text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button" variant="outline" onClick={handleCancel2FA} disabled={twoFactorLoading}
                  className="border-purple-500/20 bg-brand-card text-zinc-300 hover:bg-purple-500/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit" variant="destructive"
                  disabled={twoFactorLoading || twoFactorCode.length !== 6}
                >
                  {twoFactorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Disable 2FA
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* ── Developer API ── */}
      <Card className="bg-brand-card/80 border border-purple-500/20 shadow-lg shadow-purple-950/40 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5 text-brand-orange" />
            Developer API
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Generate API keys to access your scraped data programmatically via{' '}
            <code className="rounded bg-zinc-800 px-1 text-xs font-mono text-purple-300">
              GET /api/v1/data?project_id=…
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Generation form */}
          <form onSubmit={handleGenerateKey} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="keyName" className="text-zinc-300">API Key Name</Label>
              <Input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. My Python Script"
                required
                disabled={generatingKey}
                className="border-purple-500/20 bg-brand-bg text-white placeholder:text-zinc-600"
              />
            </div>
            <Button
              type="submit"
              disabled={generatingKey || !newKeyName.trim()}
              className="bg-brand-orange hover:bg-brand-orange-hover shrink-0"
            >
              {generatingKey
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Key className="mr-2 h-4 w-4" />}
              Generate API Key
            </Button>
          </form>

          {generateError && <p className="text-sm text-destructive">{generateError}</p>}

          {/* Active keys table */}
          <DataTable
            columns={apiKeyColumns}
            data={apiKeys}
            loading={apiKeysLoading}
            searchKey={false}
            emptyTitle="No API keys yet"
            emptyDescription="Generate your first key above to start using the API."
            pageSize={5}
          />
        </CardContent>
      </Card>

      {/* ── One-time key reveal modal ── */}
      <Dialog open={!!revealedKey} onOpenChange={(open) => { if (!open) closeRevealModal(); }}>
        <DialogContent className="border border-purple-500/20 bg-[#0F0826] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Key className="h-5 w-5 text-brand-orange" />
              Your New API Key
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Copy and store this key somewhere safe right now.
            </DialogDescription>
          </DialogHeader>

          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-300">
              <strong>Please copy this key now and store it safely.</strong> For your security, we
              cannot show it to you again.
            </p>
          </div>

          {/* Key display + copy button */}
          <div className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-zinc-900 p-3">
            <code className="flex-1 break-all font-mono text-sm text-purple-200">
              {revealedKey}
            </code>
            <Button
              variant="ghost" size="icon"
              onClick={handleCopyKey}
              className="shrink-0 text-zinc-400 hover:text-white"
              aria-label="Copy API key"
            >
              {copied
                ? <Check className="h-4 w-4 text-green-400" />
                : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {copied && (
            <p className="text-center text-xs text-green-400">Copied to clipboard!</p>
          )}

          <DialogFooter>
            <Button
              onClick={closeRevealModal}
              className="bg-brand-orange hover:bg-brand-orange-hover w-full sm:w-auto"
            >
              I've saved my key — Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Subscription & Billing ── */}
      <Card className="bg-brand-card/80 border border-purple-500/20 shadow-lg shadow-purple-950/40 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5 text-brand-orange" />
            Subscription &amp; Billing
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Manage your WebPulse plan and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Current plan</span>
            <Badge
              variant={isPro ? 'default' : 'secondary'}
              className={isPro ? '' : 'border-purple-500/20 bg-brand-card'}
            >
              {isPro ? 'Pro — $29/month' : 'Free'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Status</span>
            <Badge
              variant={statusMeta.variant}
              className={statusMeta.variant === 'success' ? '' : 'border-purple-500/20 bg-brand-card'}
            >
              {statusMeta.label}
            </Badge>
          </div>
          {user?.subscription_current_period_end && (
            <div className="flex justify-between">
              <span className="text-zinc-400">{statusKey === 'canceled' ? 'Access until' : 'Renews on'}</span>
              <span className="font-medium text-white">{formatDate(user.subscription_current_period_end)}</span>
            </div>
          )}
          {user?.subscription_trial_end && statusKey === 'trialing' && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Trial ends</span>
              <span className="font-medium text-white">{formatDate(user.subscription_trial_end)}</span>
            </div>
          )}
          {billingError && <p className="text-sm text-destructive">{billingError}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            {(isPro || user?.stripe_customer_id) && (
              <Button
                variant="outline" onClick={handleManageSubscription} disabled={portalLoading}
                className="border-purple-500/20 bg-brand-card text-zinc-300 hover:bg-purple-500/20"
              >
                {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Subscription
              </Button>
            )}
            {!isPro && (
              <Button onClick={handleUpgrade} disabled={checkoutLoading} className="bg-brand-orange hover:bg-brand-orange-hover">
                {checkoutLoading
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Sparkles className="mr-2 h-4 w-4" />}
                Upgrade to Pro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── API Configuration (system status) ── */}
      <Card className="bg-brand-card/80 border border-purple-500/20 shadow-lg shadow-purple-950/40 rounded-xl">
        <CardHeader>
          <CardTitle className="text-white">API Configuration</CardTitle>
          <CardDescription className="text-zinc-400">Backend services status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Scraper Engine</span>
            <Badge variant="success" className="border-purple-500/20 bg-brand-card">Cheerio + Puppeteer</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Queue System</span>
            <Badge variant="success" className="border-purple-500/20 bg-brand-card">BullMQ + Redis</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Vector Search</span>
            <Badge variant="success" className="border-purple-500/20 bg-brand-card">pgvector</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">AI Provider</span>
            <Badge variant="secondary" className="border-purple-500/20 bg-brand-card">OpenAI</Badge>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
