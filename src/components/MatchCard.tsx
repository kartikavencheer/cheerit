import React from 'react';
import { Match } from '../api/client';
import { motion } from 'motion/react';
import { Calendar, Clock, Trophy } from 'lucide-react';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const isLive = match.status === 'live';
  const matchDate = new Date(match.startTime);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass-card p-0 relative overflow-hidden group border-white/10 hover:border-primary/50 hover:shadow-primary/20"
    >
      {/* Top Banner */}
      <div className="h-12 2xl:h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-6 2xl:px-7">
        <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold tracking-wider uppercase">
          <Trophy className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-primary" />
          Championship
        </div>
        {isLive ? (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 text-xs 2xl:text-sm font-medium bg-white/5 px-3 py-1 rounded-full">
            <Calendar className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
            {matchDate.toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="p-8 2xl:p-10">
        <div className="flex items-center justify-between">
          {/* Team A */}
          <div className="flex flex-col items-center gap-4 w-[35%]">
            <div className="w-20 h-20 2xl:w-24 2xl:h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center p-3 border border-white/10 group-hover:border-primary/40 transition-colors shadow-inner">
              <img src={match.teamA.logo} alt={match.teamA.name} className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <span className="text-sm 2xl:text-base font-bold text-center line-clamp-2 text-foreground">{match.teamA.name}</span>
          </div>

          {/* Center Score/Time */}
<div className="flex flex-col items-center justify-center w-[30%]">
  
  {/* IMAGE */}
  <img 
    src="/images/VS.png" 
    alt="match logo"
    className="w-12 h-12 object-contain mb-2"
  />
{/* 
  {isLive ? (
    <div className="text-4xl 2xl:text-5xl font-mono font-bold text-foreground tracking-wider drop-shadow-[0_0_15px_rgba(255,106,0,0.5)]">
      {match.score || '0-0'}
    </div>
  ) : (
    <div className="flex flex-col items-center text-primary bg-primary/10 px-4 py-3 rounded-2xl border border-primary/20">
      <Clock className="w-5 h-5 2xl:w-6 2xl:h-6 mb-1" />
      <span className="text-sm 2xl:text-base font-bold tracking-wider">
        {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )} */}

  {/* <div className="text-[10px] text-gray-500 mt-4 font-bold uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full">
    VS
  </div> */}
</div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-4 w-[35%]">
            <div className="w-20 h-20 2xl:w-24 2xl:h-24 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center p-3 border border-white/10 group-hover:border-primary/40 transition-colors shadow-inner">
              <img src={match.teamB.logo} alt={match.teamB.name} className="w-full h-full object-contain drop-shadow-lg" />
            </div>
            <span className="text-sm 2xl:text-base font-bold text-center line-clamp-2 text-foreground">{match.teamB.name}</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};
