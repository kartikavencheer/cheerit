import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotRegisteredError, useAuth } from '../context/AuthContext';
import { ExternalLink, QrCode, UserPlus } from 'lucide-react';

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=com.avencheer.cheerit';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authIsLoading, sendOtp, login } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  const phoneDigits = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  const canRequestOtp = phoneDigits.length === 10 && !isSubmitting;
  const canVerifyOtp = phoneDigits.length === 10 && otp.length === 6 && !isSubmitting;

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNotRegistered(false);
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
    } catch (err) {
      if (err instanceof NotRegisteredError || (err && typeof err === 'object' && (err as any).name === 'NotRegisteredError')) {
        setNotRegistered(true);
        setStep('phone');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setNotRegistered(false);
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
    } catch (err) {
      if (err instanceof NotRegisteredError || (err && typeof err === 'object' && (err as any).name === 'NotRegisteredError')) {
        setNotRegistered(true);
        setStep('phone');
      }
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

          {notRegistered ? (
            <div className="mb-4 rounded-2xl border border-primary/25 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-primary/20 border border-primary/25 flex items-center justify-center flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold text-foreground">You’re not registered</div>
                  <p className="mt-1 text-sm text-muted leading-relaxed">
                    This mobile number isn’t registered on CheerIT yet. Kindly SignUp using our Android app from the Play Store,
                    then come back here to login.
                  </p>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                    <a
                      href={PLAYSTORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
                    >
                      Open Play Store
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <a
                      href={PLAYSTORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-sm font-semibold text-foreground hover:underline"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-border overflow-hidden">
                        <img src="/images/qr.png" alt="CheerIT app QR" className="w-full h-full object-cover" />
                      </span>
                      {/* <span className="inline-flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-muted" />
                        Scan / click to download
                      </span> */}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

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
