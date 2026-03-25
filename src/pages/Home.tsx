import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiClient, Match, getEventList } from '../api/client';
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
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(phone, otp);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-32 pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop" 
            alt="Stadium Crowd" 
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          />
        </div>

        <div className="page-container relative z-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="glass rounded-2xl px-5 sm:px-6 py-4 border-border shadow-2xl shadow-black/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={
                  featuredIsLive
                    ? "shrink-0 w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center"
                    : "shrink-0 w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center"
                }>
                  {featuredIsLive ? (
                    <Video className="w-5 h-5 text-red-400" />
                  ) : (
                    <CalendarIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={
                      featuredIsLive
                        ? "inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full"
                        : "inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full"
                    }>
                      {featuredIsLive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          Live Now
                        </>
                      ) : (
                        "Next Match"
                      )}
                    </span>
                    <span className="text-gray-300 font-semibold truncate">
                      {featuredMatch ? `${featuredMatch.teamA.name} vs ${featuredMatch.teamB.name}` : 'Fan moments, on the big screen'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {featuredMatch ? (
                      new Date(featuredMatch.startTime).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    ) : (
                      "Capture cheers, clips, and reactions with AI moderation."
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  type="button"
                  onClick={() => scrollToSection(featuredIsLive ? 'live-matches' : 'upcoming-matches')}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-border text-foreground font-semibold transition-colors"
                >
                  View {featuredIsLive ? 'Live' : 'Upcoming'}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('upcoming-matches')}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-colors shadow-lg shadow-primary/20"
                >
                  Browse Matches
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-7 space-y-8"
            >
              <div className="space-y-4">
             <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] 2xl:text-[6rem] min-[1920px]:text-[6.5rem] font-display font-bold leading-[1.05] tracking-tight">
  
  <span className="bg-gradient-to-r from-blue-900 to-blue-400 bg-clip-text text-transparent">
    NOW CAPTURE
  </span>

  <br />

  <span className="text-gradient">
    CHEERS & FAN MOMENTS
  </span>

  <br />

  <span className="bg-gradient-to-r from-blue-900 to-blue-400 bg-clip-text text-transparent">
    WITH CONFIDENCE
  </span>

</h1>
                <p className="text-xl sm:text-2xl 2xl:text-[1.6rem] text-gray-400 mt-6 font-medium max-w-2xl 2xl:max-w-3xl">
                  Just real fan energy.
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <span className="text-gray-500 font-medium">Powered by</span>
                   <img 
    src="public/images/image.png" 
    alt="Avencheer" 
    className="h-12 w-auto"
  />
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold mt-2 bg-primary/10 w-fit px-4 py-1.5 rounded-full border border-primary/20">
                  <ShieldCheck className="w-5 h-5" />
                  AI Moderation
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4 pt-6">
                <div className="glass px-6 py-3.5 rounded-full flex items-center gap-3 border-border shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <Video className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-200">Record Moment?</span>
                </div>
                <div className="glass px-6 py-3.5 rounded-full flex items-center gap-3 border-border shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <Film className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-200">Upload Video? <span className="text-red-500 font-bold ml-1">?</span></span>
                </div>
              </div>

              {/* QR Code */}
              <div className="pt-10 flex items-center gap-6">
                <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-white/10">
                  <QrCode className="w-20 h-20 text-black" />
                </div>
                <div className="bg-gradient-to-r from-primary to-[#FF9D00] text-black font-bold px-6 py-3 rounded-full text-sm shadow-lg shadow-primary/25">
                  Scan to Download CheerIT App
                </div>
              </div>
            </motion.div>

            {/* Right Content - Login Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              {/* Floating Badge */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute -left-16 top-1/3 transform -translate-y-1/2 glass px-6 py-4 rounded-2xl shadow-2xl border-green-500/30 flex items-center gap-4 z-30 hidden xl:flex"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg text-foreground">AI Verified</div>
                  <div className="text-green-400 font-medium">Ready for Live</div>
                </div>
              </motion.div>

              {!isAuthenticated ? (
                <div className="bg-white rounded-[2rem] p-8 sm:p-10 2xl:p-12 shadow-2xl shadow-black/50 max-w-md 2xl:max-w-lg mx-auto relative z-20 border border-white/20">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-display font-bold text-gray-900 flex items-center justify-center gap-2">
                      Go Live with <span className="text-black tracking-tight">Cheer<span className="text-primary">IT</span></span>
                    </h2>
                    <p className="text-gray-500 mt-3 font-medium">Join the Fan Broadcast Network</p>
                  </div>

                  {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                      <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all bg-gray-50/50">
                        <div className="bg-gray-100/80 px-5 py-4 border-r-2 border-gray-200 flex items-center gap-2 text-gray-700 font-semibold">
                          <Smartphone className="w-5 h-5 text-gray-500" />
                          +91
                        </div>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter Mobile Number"
                          className="flex-1 px-5 py-4 outline-none text-gray-900 placeholder-gray-400 w-full font-medium bg-transparent"
                          required
                          pattern="[0-9]{10}"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!agreed || phone.length !== 10 || isLoading}
                        className="w-full bg-gradient-to-r from-primary to-[#FF9D00] hover:from-[#E65C00] hover:to-[#E68A00] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                      >
                        {isLoading ? 'Sending...' : 'Get OTP'}
                        <span className="text-xl">→</span>
                      </button>

                      <div className="flex items-start gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-500 font-medium leading-relaxed">
                          I agree to <a href="#" className="text-primary hover:text-primary-dark hover:underline transition-colors">CheerIT terms & community guidelines</a>
                        </label>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Enter OTP sent to +91 {phone}</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl outline-none text-gray-900 text-center tracking-[0.5em] text-3xl font-mono focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/50"
                          required
                          pattern="[0-9]{6}"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={otp.length !== 6 || isLoading}
                        className="w-full bg-gradient-to-r from-primary to-[#FF9D00] hover:from-[#E65C00] hover:to-[#E68A00] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                      >
                        {isLoading ? 'Verifying...' : 'Verify & Login'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('phone')}
                        className="w-full text-sm text-gray-500 hover:text-primary font-semibold transition-colors"
                      >
                        Change Phone Number
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="glass-card p-10 2xl:p-12 text-center border-border">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner shadow-green-500/20">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl 2xl:text-4xl font-display font-bold text-foreground mb-3">You're logged in!</h3>
                  <p className="text-gray-400 mb-8 font-medium">Ready to capture and share your fan moments.</p>
                  <div className="flex flex-col gap-4">
                    <Link to="/library" className="bg-gradient-to-r from-primary to-[#FF9D00] hover:from-[#E65C00] hover:to-[#E68A00] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">
                      Go to My Library
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Matches Section */}
      <section id="live-matches" className="page-container py-20 2xl:py-24 scroll-mt-28">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl 2xl:text-5xl font-display font-bold flex items-center gap-4 text-foreground">
            <span className="relative flex h-4 w-4 2xl:h-5 2xl:w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 2xl:h-5 2xl:w-5 bg-red-500"></span>
            </span>
            Live Matches
          </h2>
        </div>
        
        {isLoadingLive ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-56 animate-pulse bg-white/5"></div>
            ))}
          </div>
        ) : liveMatches && liveMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 text-center rounded-3xl text-gray-400 border-dashed border-2 border-border">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-lg font-medium">No live matches at the moment.</p>
          </div>
        )}
      </section>

      {/* Upcoming Matches Section */}
      <section id="upcoming-matches" className="page-container py-10 2xl:py-14 scroll-mt-28">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl 2xl:text-5xl font-display font-bold text-foreground">Upcoming Matches</h2>
        </div>
        
        {isLoadingUpcoming ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-56 animate-pulse bg-white/5"></div>
            ))}
          </div>
        ) : upcomingMatches && upcomingMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="glass p-12 text-center rounded-3xl text-gray-400 border-dashed border-2 border-border">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-lg font-medium">No upcoming matches scheduled.</p>
          </div>
        )}
      </section>
    </div>
  );
};
