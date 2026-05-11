import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Shield, ArrowRight, ArrowLeft, Sparkles, Zap, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Input } from '../components/ui';

/**
 * LoginPage v2 — token-driven redesign.
 *
 * Preserves v1 behavior: 2-step flow (credentials → TOTP), `useAuth().login()` +
 * `verifyTOTP()` integration, error handling, password visibility toggle.
 *
 * Visual: replaces 4 floating orbs with 2 Bento blobs (signature pattern, less drift).
 * Form fields use v2 Input. CTA buttons use v2 Button. Glass card via tokens.
 */
export default function LoginPageV2() {
  const { login, verifyTOTP } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
  const [tempToken, setTempToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    setPageReady(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (step === 'credentials') {
      const result = await login(username, password);
      if (result.requiresTOTP && result.tempToken) {
        setTempToken(result.tempToken);
        setStep('totp');
      } else if (!result.success) {
        setError(result.error || 'Đăng nhập thất bại.');
      }
    } else {
      const result = await verifyTOTP(tempToken, totpCode);
      if (!result.success) {
        setError(result.error || 'Mã xác thực không đúng.');
      }
    }

    setLoading(false);
  };

  const goBack = () => {
    setStep('credentials');
    setTotpCode('');
    setError('');
  };

  return (
    <div className="h-dvh w-full flex overflow-hidden bg-surface">
      {/* Left panel — brand showcase (desktop only) */}
      <motion.aside
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-primary text-on-primary"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Two signature Bento blobs (replaces 4 floating orbs from v1 — Phase 1 audit fix) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-12 size-[40rem] rounded-full bg-primary-container/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-0 size-[32rem] rounded-full bg-tertiary-container/30 blur-3xl"
        />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <span className="font-headline text-xl font-bold tracking-tight">SMIT OS</span>
          </div>

          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, y: 12 }}
            animate={pageReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-headline text-4xl xl:text-5xl font-extrabold leading-tight">
              The Kinetic
              <br />
              <em className="not-italic font-extrabold text-on-primary/90">Workspace</em>
            </h1>
            <p className="max-w-md text-on-primary/80 text-lg leading-relaxed">
              Nền tảng quản lý dự án thông minh, giúp team của bạn làm việc hiệu quả và sáng tạo hơn mỗi ngày.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <FeatureItem icon={Zap} text="Quản lý task thông minh với AI" />
              <FeatureItem icon={Sparkles} text="Dashboard thời gian thực" />
              <FeatureItem icon={LayoutDashboard} text="Tích hợp đa nền tảng" />
            </div>
          </motion.div>

          <p className="text-on-primary/40 text-sm">© 2026 SMIT OS. All rights reserved.</p>
        </div>
      </motion.aside>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 size-[28rem] rounded-full bg-primary-container/30 blur-3xl"
        />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={pageReady ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex flex-col items-center gap-3 pb-6">
            <img src="/logo-only.png" alt="SMIT OS" className="size-20 drop-shadow-md" />
            <div className="text-center">
              <h2 className="font-headline text-2xl font-bold text-on-surface">Welcome back</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {step === 'credentials' ? 'Sign in to continue your workspace.' : 'Two-factor authentication required.'}
              </p>
            </div>
          </div>

          <div className="rounded-card bg-white/80 backdrop-blur-md border border-white/40 shadow-md p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  role="alert"
                  className="mb-5 rounded-input bg-error-container/60 border border-error/30 px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-on-error-container text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AnimatePresence mode="wait">
                {step === 'credentials' ? (
                  <motion.div
                    key="step-credentials"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4"
                  >
                    <Input
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                      required
                      autoFocus
                    />
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      iconRight={
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword((v) => !v)}
                          className="pointer-events-auto p-1 -m-1 rounded-button text-on-surface-variant hover:text-on-surface focus-visible:outline-none"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      }
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      iconRight={!loading ? <ArrowRight /> : undefined}
                      fullWidth
                      className="mt-2"
                    >
                      {loading ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-totp"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col items-center gap-3 text-center pb-2">
                      <div className="inline-flex size-14 items-center justify-center rounded-card bg-primary-container text-on-primary-container">
                        <Shield className="size-7" aria-hidden="true" />
                      </div>
                      <p className="text-sm text-on-surface">
                        Nhập mã 6 chữ số từ <strong className="font-semibold">Google/Microsoft Authenticator</strong>
                      </p>
                      <p className="text-xs text-on-surface-variant">Hoặc nhập backup code nếu mất điện thoại.</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="totp-code" className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
                        Verification code
                      </label>
                      <input
                        id="totp-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9A-Z ]*"
                        maxLength={8}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                        placeholder="000000"
                        autoFocus
                        className="h-14 rounded-input border border-outline-variant bg-surface-container-lowest px-4 text-center text-2xl font-mono tracking-[0.5em] text-on-surface focus-visible:outline-none focus-visible:border-primary"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={totpCode.length < 6}
                      isLoading={loading}
                      fullWidth
                      className="mt-1"
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      iconLeft={<ArrowLeft />}
                      onClick={goBack}
                      fullWidth
                    >
                      Quay lại
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <p className="hidden lg:block text-center text-xs text-on-surface-variant mt-6">
            Need help? Contact Admin.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3 text-on-primary/85">
      <div className="flex size-10 items-center justify-center rounded-card bg-on-primary/10 backdrop-blur-sm border border-on-primary/10">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
