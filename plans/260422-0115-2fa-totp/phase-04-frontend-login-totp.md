---
phase: 04
title: "Frontend Login TOTP Step"
status: completed
priority: high
effort: 1.5h
dependsOn: phase-03
---

# Phase 04 u2014 Frontend Login TOTP Step

## Overview

Cu1eadp nhu1eadt `AuthContext` vu00e0 `LoginPage` u0111u1ec3 hu1ed7 tru1ee3 two-step login. User nhu1eadp password xong, nu1ebfu cu00f3 2FA thu00ec chuyu1ec3n sang bu01b0u1edbc nhu1eadp mu00e3 TOTP.

## Files to Modify

- `src/contexts/AuthContext.tsx` u2014 cu1eadp nhu1eadt `login()` return type, thu00eam `verifyTOTP()`
- `src/pages/LoginPage.tsx` u2014 thu00eam TOTP step vu1edbi animated transition

## Implementation Steps

### 1. Cu1eadp nhu1eadt `src/contexts/AuthContext.tsx`

**Cu1eadp nhu1eadt interface vu00e0 `login()` function:**

```typescript
// Cu1eadp nhu1eadt return type cu1ee7a login
interface AuthContextType {
  // ...
  login: (username: string, password: string) => Promise<{
    success: boolean;
    error?: string;
    requiresTOTP?: boolean;
    tempToken?: string;
  }>;
  verifyTOTP: (tempToken: string, code: string) => Promise<{ success: boolean; error?: string }>;
}

// Cu1eadp nhu1eadt login function u2014 giu1eef nguyu00ean flow, thu00eam xu1eed lu00fd requiresTOTP:
const login = useCallback(async (username: string, password: string) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error || 'Invalid credentials' };
    }
    const data = await res.json();

    // 2FA required u2192 forward tempToken to LoginPage
    if (data.requiresTOTP) {
      return { success: false, requiresTOTP: true, tempToken: data.tempToken };
    }

    setCurrentUser(data);
    return { success: true };
  } catch {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}, []);

// Thu00eam verifyTOTP function:
const verifyTOTP = useCallback(async (tempToken: string, code: string) => {
  try {
    const res = await fetch('/api/auth/login/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, code }),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error || 'Invalid code' };
    }
    const user = await res.json();
    setCurrentUser(user);
    return { success: true };
  } catch {
    return { success: false, error: 'Verification failed. Please try again.' };
  }
}, []);
```

### 2. Cu1eadp nhu1eadt `src/pages/LoginPage.tsx`

Thu00eam state machine `step: 'credentials' | 'totp'` vu00e0 TOTP input step.

**State mu1edbi:**

```typescript
const { login, verifyTOTP } = useAuth();
const [step, setStep] = useState<'credentials' | 'totp'>('credentials');
const [tempToken, setTempToken] = useState('');
const [totpCode, setTotpCode] = useState('');
```

**Cu1eadp nhu1eadt `handleSubmit`:**

```typescript
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
      setError(result.error || 'Login failed');
    }
  } else {
    const result = await verifyTOTP(tempToken, totpCode);
    if (!result.success) {
      setError(result.error || 'Invalid code');
    }
  }

  setLoading(false);
};
```

**TOTP step UI (thu00eam vu00e0o phu1ea7n form, sau AnimatePresence error block):**

```tsx
<AnimatePresence mode="wait">
  {step === 'credentials' ? (
    // Form username + password hiu1ec7n tu1ea1i (giu1eef nguyu00ean)
    <motion.div key="credentials" ...>
      {/* existing form fields */}
    </motion.div>
  ) : (
    // TOTP step
    <motion.div
      key="totp"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm text-slate-600">
          Nhu1eadp mu00e3 6 chu1eef su1ed1 tu1eebu00a0
          <span className="font-semibold">Google/Microsoft Authenticator</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">Hou1eb7c nhu1eadp backup code nu1ebfu mu1ea5t u0111iu1ec7n thou1ea1i</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Mu00e3 xu00e1c thu1ef1c
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9A-Z ]*"
          maxLength={8}
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
          placeholder="000000"
          autoFocus
          className="w-full text-center text-2xl font-mono tracking-[0.5em] bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
        />
      </div>

      <button type="submit" disabled={loading || totpCode.length < 6} ...>
        {loading ? 'Verifying...' : 'Verify'}
      </button>

      <button
        type="button"
        onClick={() => { setStep('credentials'); setTotpCode(''); setError(''); }}
        className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        u2190 Quay lu1ea1i
      </button>
    </motion.div>
  )}
</AnimatePresence>
```

## Success Criteria

- [x] User khu00f4ng cu00f3 2FA: login flow giu1eef nguyu00ean, khu00f4ng thu1ea5y TOTP step
- [x] User cu00f3 2FA: sau khi nhu1eadp password u0111u00fang, chuyu1ec3n sang TOTP screen
- [x] TOTP input auto-focus, mono font, tracking wide u2014 du1ec5 nhu1eadp
- [x] Nhu1eadp sai code: hiu1ec7n error, khu00f4ng ru1eddi trang
- [x] Nu00fat "Quay lu1ea1i" reset vu1ec1 credentials step
- [x] Backup code (8 ku00fd tu1ef1) cu0169ng u0111u01b0u1ee3c chu1ea5p nhu1eadn tu1ea1i u00f4 nu00e0y
- [x] Animated transition giu1eefa 2 steps (framer-motion)
- [x] TypeScript compile khu00f4ng lu1ed7i
