import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authIsLoading, sendOtp, login } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const canRequestOtp = phoneDigits.length === 10 && !isSubmitting;
  const canVerifyOtp = phoneDigits.length === 10 && otp.length === 6 && !isSubmitting;

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!agreed) {
      setFormError('Please accept the terms to continue.');
      return;
    }
    if (phoneDigits.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendOtp(phone);
      setStep('otp');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (phoneDigits.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (otp.length !== 6) {
      setFormError('Please enter the 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(phone, otp);
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authIsLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 page-container">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-2xl p-5 sm:p-6 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">Login</h1>
            <Link to="/" className="text-sm text-muted hover:text-foreground">
              Back to Home
            </Link>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter Mobile Number"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              <label className="flex items-start gap-3 text-sm text-muted select-none">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  I agree to the{' '}
                  <a className="text-primary underline" href="#" onClick={(e) => e.preventDefault()}>
                    Terms &amp; Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {formError ? (
                <div className="text-sm text-red-500" role="alert">
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canRequestOtp}
                className="w-full bg-primary text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Sending...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border border-border rounded-lg text-center bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />

              {formError ? (
                <div className="text-sm text-red-500" role="alert">
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canVerifyOtp}
                className="w-full bg-primary text-white py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtp('');
                  setFormError(null);
                  setStep('phone');
                }}
                className="w-full py-2 text-sm text-muted hover:text-foreground"
              >
                Change number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
