import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getEventList } from '../api/client';
import { MatchCard } from '../components/MatchCard';
import { motion } from 'motion/react';
import { Smartphone, CheckCircle, ShieldCheck, QrCode, Video, Film, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const { isAuthenticated, sendOtp, login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: liveMatches, isLoading: isLoadingLive } = useQuery({
    queryKey: ['events', 'live'],
    queryFn: () => getEventList('live'),
  });

  const { data: upcomingMatches, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => getEventList('upcoming'),
  });

  const featuredMatch = liveMatches?.[0] ?? upcomingMatches?.[0];
  const featuredIsLive = featuredMatch?.status === 'live';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setIsLoading(true);
    try {
      await sendOtp(phone);
      setStep('otp');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(phone, otp);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">

      {/* HERO SECTION (OPTIMIZED) */}
      <section className="relative pt-20 pb-16 overflow-hidden min-h-[70vh] flex items-center">

        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="page-container relative z-20">

          {/* Featured Strip */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="glass rounded-xl px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-300">
                  {featuredMatch
                    ? `${featuredMatch.teamA.name} vs ${featuredMatch.teamB.name}`
                    : 'Fan moments live'}
                </span>
              </div>
              <button
                onClick={() => scrollToSection('live-matches')}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg"
              >
                View
              </button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">

            {/* LEFT */}
            <motion.div className="lg:col-span-7 space-y-5">

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-900 to-blue-400 bg-clip-text text-transparent">
                  CAPTURE
                </span>
                <br />
                <span className="text-gradient">
                  FAN MOMENTS
                </span>
              </h1>

              <p className="text-lg text-gray-400 max-w-xl">
                Just real fan energy.
              </p>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Powered by</span>
                <img src="public/images/image.png" className="h-8" />
              </div>

              <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="w-4 h-4" />
                AI Moderation
              </div>

              <div className="flex gap-3">
                <div className="glass px-4 py-2 rounded-full text-sm flex gap-2 items-center">
                  <Video className="w-4 h-4 text-orange-500" />
                  Record
                </div>
                <div className="glass px-4 py-2 rounded-full text-sm flex gap-2 items-center">
                  <Film className="w-4 h-4 text-blue-500" />
                  Upload
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg">
                  <QrCode className="w-14 h-14 text-black" />
                </div>
                <span className="text-sm text-primary font-semibold">
                  Scan to Download
                </span>
              </div>

            </motion.div>

            {/* RIGHT LOGIN */}
            <motion.div className="lg:col-span-5">

              {!isAuthenticated ? (
                <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md mx-auto">

                  <h2 className="text-xl font-bold text-center mb-4">
                    Login to CheerIT
                  </h2>

                  {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">

                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                        }
                        placeholder="Enter Mobile Number"
                        className="w-full px-4 py-3 border rounded-lg"
                      />

                      <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg"
                      >
                        Get OTP
                      </button>

                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-4">

                      <input
                        type="text"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                        placeholder="Enter OTP"
                        className="w-full px-4 py-3 border rounded-lg text-center"
                      />

                      <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg"
                      >
                        Verify
                      </button>

                    </form>
                  )}
                </div>
              ) : (
                <div className="glass-card p-8 text-center">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">You're logged in!</h3>
                  <Link to="/library" className="block mt-4 bg-primary text-white py-2 rounded-lg">
                    Go to Library
                  </Link>
                </div>
              )}

            </motion.div>

          </div>
        </div>
      </section>

      {/* LIVE MATCHES */}
      <section id="live-matches" className="page-container py-20">
        <h2 className="text-3xl font-bold mb-6">Live Matches</h2>

        {isLoadingLive ? (
          <div>Loading...</div>
        ) : liveMatches?.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <p>No live matches</p>
        )}
      </section>

      {/* UPCOMING */}
      <section id="upcoming-matches" className="page-container py-10">
        <h2 className="text-3xl font-bold mb-6">Upcoming Matches</h2>

        {isLoadingUpcoming ? (
          <div>Loading...</div>
        ) : upcomingMatches?.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <p>No upcoming matches</p>
        )}
      </section>

    </div>
  );
};