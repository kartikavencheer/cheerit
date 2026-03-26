import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  getCompletedMatchesByEventType,
  getLiveEventTypesWithMatches,
  getSportsEventTypes,
  getUpcomingMatchesByEventType,
  type EventType,
} from '../api/client';
import { MatchCard } from '../components/MatchCard';
import { motion } from 'motion/react';
import { Smartphone, CheckCircle, ShieldCheck, QrCode, Video, Film, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const { data: liveByType, isLoading: isLoadingLive } = useQuery({
    queryKey: ['events', 'live', 'by-eventtype'],
    queryFn: () => getLiveEventTypesWithMatches(),
    staleTime: 60_000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const liveMatches = useMemo(() => {
    const all = liveByType?.flatMap((x) => x.matches) ?? [];
    const byId = new Map<string, (typeof all)[number]>();
    for (const m of all) {
      const id = String(m?.id ?? '').trim();
      if (!id) continue;
      if (!byId.has(id)) byId.set(id, { ...m, id });
    }
    return Array.from(byId.values());
  }, [liveByType]);

  const { data: upcomingTypes } = useQuery({
    queryKey: ['eventtypes', 'sports', 'upcoming'],
    queryFn: () => getSportsEventTypes('upcoming'),
  });

  const { data: completedTypes } = useQuery({
    queryKey: ['eventtypes', 'sports', 'completed'],
    queryFn: () => getSportsEventTypes('completed'),
  });

  const allUpcomingTypes = useMemo(() => upcomingTypes ?? [], [upcomingTypes]);
  const allCompletedTypes = useMemo(() => completedTypes ?? [], [completedTypes]);

  const firstEnabledUpcomingTypeId = useMemo(() => {
    const t = allUpcomingTypes.find((x) => (typeof x.count === 'number' ? x.count > 0 : true));
    return t?.id ?? null;
  }, [allUpcomingTypes]);

  const firstEnabledCompletedTypeId = useMemo(() => {
    const t = allCompletedTypes.find((x) => (typeof x.count === 'number' ? x.count > 0 : true));
    return t?.id ?? null;
  }, [allCompletedTypes]);

  const [selectedUpcomingTypeId, setSelectedUpcomingTypeId] = useState<number | null>(null);
  const [selectedCompletedTypeId, setSelectedCompletedTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (!firstEnabledUpcomingTypeId) return;
    if (!selectedUpcomingTypeId || !allUpcomingTypes.some((t) => t.id === selectedUpcomingTypeId)) {
      setSelectedUpcomingTypeId(firstEnabledUpcomingTypeId);
    }
  }, [allUpcomingTypes, firstEnabledUpcomingTypeId, selectedUpcomingTypeId]);

  useEffect(() => {
    if (!firstEnabledCompletedTypeId) return;
    if (!selectedCompletedTypeId || !allCompletedTypes.some((t) => t.id === selectedCompletedTypeId)) {
      setSelectedCompletedTypeId(firstEnabledCompletedTypeId);
    }
  }, [allCompletedTypes, firstEnabledCompletedTypeId, selectedCompletedTypeId]);

  const selectedUpcomingType = useMemo(
    () => allUpcomingTypes.find((t) => t.id === selectedUpcomingTypeId) ?? null,
    [allUpcomingTypes, selectedUpcomingTypeId]
  );
  const selectedCompletedType = useMemo(
    () => allCompletedTypes.find((t) => t.id === selectedCompletedTypeId) ?? null,
    [allCompletedTypes, selectedCompletedTypeId]
  );

  const isUpcomingTypeEnabled = useMemo(() => {
    if (!selectedUpcomingType) return false;
    if (typeof selectedUpcomingType.count === 'number') return selectedUpcomingType.count > 0;
    return true;
  }, [selectedUpcomingType]);

  const isCompletedTypeEnabled = useMemo(() => {
    if (!selectedCompletedType) return false;
    if (typeof selectedCompletedType.count === 'number') return selectedCompletedType.count > 0;
    return true;
  }, [selectedCompletedType]);

  const { data: upcomingMatches, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['events', 'upcoming', selectedUpcomingTypeId],
    enabled: typeof selectedUpcomingTypeId === 'number' && isUpcomingTypeEnabled,
    queryFn: () => getUpcomingMatchesByEventType(selectedUpcomingTypeId!),
  });

  const { data: completedMatches, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['events', 'completed', selectedCompletedTypeId],
    enabled: typeof selectedCompletedTypeId === 'number' && isCompletedTypeEnabled,
    queryFn: () => getCompletedMatchesByEventType(selectedCompletedTypeId!),
  });

  const featuredMatch = liveMatches?.[0] ?? upcomingMatches?.[0];
  const featuredIsLive = featuredMatch?.status === 'live';

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const EventTypeChips = ({
    types,
    selectedId,
    onSelect,
  }: {
    types?: EventType[];
    selectedId: number | null;
    onSelect: (id: number) => void;
  }) => {
    if (!types?.length) return null;
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {types.map((t) => {
          const isActive = t.id === selectedId;
          const isEnabled = typeof t.count === 'number' ? t.count > 0 : true;
          return (
            <button
              key={t.id}
              type="button"
              disabled={!isEnabled}
              onClick={() => onSelect(t.id)}
              className={`shrink-0 flex items-center gap-3 px-4 py-2 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-primary/15 border-primary/30 text-foreground'
                  : 'bg-surface hover:bg-surface-hover border-border text-muted hover:text-foreground'
              }`}
            >
              {t.iconUrl ? (
                <img src={t.iconUrl} alt={t.name} className="w-6 h-6 rounded-full object-contain" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/10" />
              )}
              <span className="text-sm font-semibold whitespace-nowrap">{t.name}</span>
              {typeof t.count === 'number' ? <span className="text-xs text-muted">{t.count}</span> : null}
            </button>
          );
        })}
      </div>
    );
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
                <img src="/images/image.png" className="h-8" />
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
                <div className="bg-white p-2 rounded-lg flex items-center justify-center">
  <img
    src="/images/qr.png"   // 🔁 change to your image path
    alt="QR Code"
    className="w-25 h-25 object-contain"
  />
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

                  <h2 className="text-xl font-bold text-gray-600 text-center mb-2">Login to CheerIT</h2>
                  <p className="text-sm text-gray-600 text-center mb-4">Access your Library and Played Scenes.</p>

                  <Link to="/login" className="block w-full bg-primary text-white py-3 rounded-lg text-center">
                    Login
                  </Link>
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
        ) : liveMatches.length ? (
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
        ) : allUpcomingTypes.length ? (
          <div className="space-y-6">
            <EventTypeChips
              types={allUpcomingTypes}
              selectedId={selectedUpcomingTypeId}
              onSelect={setSelectedUpcomingTypeId}
            />
            {upcomingMatches?.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : !isUpcomingTypeEnabled ? (
              <p className="text-muted">No upcoming matches</p>
            ) : (
              <p className="text-muted">No upcoming matches</p>
            )}
          </div>
        ) : (
          <p>No upcoming matches</p>
        )}
      </section>

      {/* COMPLETED */}
      <section id="completed-matches" className="page-container py-10">
        <h2 className="text-3xl font-bold mb-6">Completed Matches</h2>

        {isLoadingCompleted ? (
          <div>Loading...</div>
        ) : allCompletedTypes.length ? (
          <div className="space-y-6">
            <EventTypeChips
              types={allCompletedTypes}
              selectedId={selectedCompletedTypeId}
              onSelect={setSelectedCompletedTypeId}
            />
            {completedMatches?.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : !isCompletedTypeEnabled ? (
              <p className="text-muted">No completed matches</p>
            ) : (
              <p className="text-muted">No completed matches</p>
            )}
          </div>
        ) : (
          <p>No completed matches</p>
        )}
      </section>

    </div>
  );
};
