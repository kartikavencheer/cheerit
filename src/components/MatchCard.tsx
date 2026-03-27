import React from 'react';
import { Match } from '../api/client';
import { motion } from 'motion/react';
import { Calendar, Clock, Trophy, Flame, Zap } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  theme?: 'dark' | 'light';
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, theme = 'dark' }) => {
  const isLive = match.status === 'live';
  const matchDate = new Date(match.startTime);
  const isDark = theme === 'dark';

  // ─── Theme tokens ───────────────────────────────────────────────────────────
 const t = {
  // Card shell (CLEAN WHITE)
  cardBg: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
  cardBorder: '1px solid rgba(0,0,0,0.06)',
  cardShadow: '0 6px 20px rgba(0,0,0,0.06)',

  // Hover glow (subtle)
  hoverGlow: 'radial-gradient(ellipse at 50% 100%, rgba(255,106,0,0.06) 0%, transparent 70%)',

  // Header
  headerBg: 'rgba(255,255,255,0.9)',
  headerBorder: '1px solid rgba(0,0,0,0.05)',
  leagueLabelColor: 'rgba(0,0,0,0.55)',

  // Date badge
  dateBadgeBg: 'rgba(0,0,0,0.04)',
  dateBadgeBorder: '1px solid rgba(0,0,0,0.08)',
  dateBadgeColor: 'rgba(0,0,0,0.65)',

  // Logo box (SOFT CARD INSIDE CARD)
  logoBg: 'linear-gradient(180deg, #f9fafb 0%, #f1f3f5 100%)',
  logoBorder: '1px solid rgba(0,0,0,0.06)',
  logoShadow: '0 4px 12px rgba(0,0,0,0.05)',
  logoImgFilter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',

  // Team name (STRONGER)
  teamNameColor: '#111827',

  // Score
  scoreColor: '#000',

  // Time text
  timeColor: 'rgba(0,0,0,0.6)',

  // Footer
  footerBg: 'rgba(0,0,0,0.02)',
  footerBorder: '1px solid rgba(0,0,0,0.05)',
  footerTextColor: 'rgba(0,0,0,0.55)',

  // Glow blob
  logoBlobColor: 'rgba(255,106,0,0.15)',
};

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.015 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-3xl group cursor-pointer"
      style={{
        background: t.cardBg,
        border: t.cardBorder,
        boxShadow: t.cardShadow,
      }}
    >
      {/* Ambient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: t.hoverGlow }}
      />

      {/* Subtle noise texture (dark only) */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Light theme — subtle top shimmer line */}
      {!isDark && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,106,0,0.35), transparent)' }}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: t.headerBorder, background: t.headerBg }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.25)' }}
          >
            <Trophy className="w-3.5 h-3.5" style={{ color: '#FF6A00' }} />
          </div>
          <span
            className="text-xs font-bold tracking-[0.18em] uppercase"
            style={{ color: t.leagueLabelColor, fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Championship
          </span>
        </div>

        {isLive ? (
          <motion.div
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.15em',
            }}
          >
            <Flame className="w-3 h-3" />
            LIVE NOW
          </motion.div>
        ) : (
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: t.dateBadgeBg,
              border: t.dateBadgeBorder,
              color: t.dateBadgeColor,
            }}
          >
            <Calendar className="w-3 h-3" />
            {matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>

      {/* ── Main Body ──────────────────────────────────────────────────────── */}
      <div className="px-6 pt-8 pb-6 flex items-center justify-between gap-4">

        {/* Team A */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <motion.div
            whileHover={{ rotate: -4, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div
              className="w-28 h-28 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden"
              style={{
                background: t.logoBg,
                border: t.logoBorder,
                boxShadow: t.logoShadow,
              }}
            >
              <img
                src={match.teamA.logo}
                alt={match.teamA.name}
                className="w-full h-full object-contain relative z-10"
                style={{ filter: t.logoImgFilter }}
              />
            </div>
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full blur-xl opacity-50"
              style={{ background: t.logoBlobColor }}
            />
          </motion.div>

          <div className="text-center space-y-1">
            <span
              className="text-base font-bold leading-tight block"
              style={{
                color: t.teamNameColor,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {match.teamA.name}
            </span>
            {isLive && (
              <div
                className="text-2xl font-black"
                style={{
                  color: t.scoreColor,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: '-0.02em',
                }}
              >
                {/* {match.score?.split('-')[0] ?? '0'} */}
              </div>
            )}
          </div>
        </div>

        {/* Center VS */}
        <div className="flex flex-col items-center justify-center gap-3 w-20 flex-shrink-0">
          <div className="relative">
            <img
              src="/images/VS BLUE.png"
              alt="VS"
              className="w-20 h-20 object-contain relative z-10"
              style={{ filter: 'drop-shadow(0 0 25px rgba(255,106,0,0.55))' }}
            />
          </div>

          {isLive ? (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.1em',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <Clock className="w-3.5 h-3.5" style={{ color: '#FF6A00' }} />
              <span
                className="text-xs font-bold tracking-wider"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  color: t.timeColor,
                  letterSpacing: '0.08em',
                }}
              >
                {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <motion.div
            whileHover={{ rotate: 4, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div
              className="w-28 h-28 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden"
              style={{
                background: t.logoBg,
                border: t.logoBorder,
                boxShadow: t.logoShadow,
              }}
            >
              <img
                src={match.teamB.logo}
                alt={match.teamB.name}
                className="w-full h-full object-contain relative z-10"
                style={{ filter: t.logoImgFilter }}
              />
            </div>
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full blur-xl opacity-50"
              style={{ background: t.logoBlobColor }}
            />
          </motion.div>

          <div className="text-center space-y-1">
            <span
              className="text-base font-bold leading-tight block"
              style={{
                color: t.teamNameColor,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {match.teamB.name}
            </span>
            {isLive && (
              <div
                className="text-2xl font-black"
                style={{
                  color: t.scoreColor,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: '-0.02em',
                }}
              >
                {/* {match.score?.split('-')[1] ?? '0'} */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-2 px-6 py-3.5"
        style={{ borderTop: t.footerBorder, background: t.footerBg }}
      >
        <Zap className="w-3.5 h-3.5" style={{ color: '#FF6A00' }} />
        <span
          className="text-xs font-semibold tracking-[0.15em] uppercase"
          style={{
            color: t.footerTextColor,
            fontFamily: "'Barlow Condensed', sans-serif",
          }}
        >
          {isLive
            ? 'Match In Progress'
            : `Starts ${matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
        </span>
      </div>

      {/* Bottom accent line */}
      <div
        className="h-[2px] w-full opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{ background: 'linear-gradient(90deg, transparent, #FF6A00, transparent)' }}
      />
    </motion.div>
  );
};