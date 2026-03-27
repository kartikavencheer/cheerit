import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Phone, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { getPlayedScenesPage, getVideosPage } from '../api/client';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const parseMemberSince = (input?: string) => {
    if (!input) return undefined;
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\b/);
    if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    const d = new Date(trimmed);
    return Number.isFinite(d.getTime()) ? d : undefined;
  };

  const { data: videosMeta, isLoading: isLoadingVideos, isError: isVideosError } = useQuery({
    queryKey: ['profile', 'stats', 'videos', user.id],
    queryFn: () => getVideosPage(user.id, 1, 1),
  });

  const { data: scenesMeta, isLoading: isLoadingScenes, isError: isScenesError } = useQuery({
    queryKey: ['profile', 'stats', 'scenes', user.id],
    queryFn: () => getPlayedScenesPage(1, 1),
    retry: false,
    staleTime: 60_000,
  });

  const memberSince = parseMemberSince(user.createdAt);
  const videosCount = videosMeta?.total ?? videosMeta?.items.length ?? 0;
  const scenesCount = scenesMeta?.total ?? scenesMeta?.items.length ?? 0;

  return (
    <div className="page-container pt-28 pb-12 max-w-3xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
        <div className="h-32 bg-gradient-to-r from-primary to-blue-400 relative">
          <div className="absolute -bottom-12 left-6 sm:left-8">
            <div className="w-24 h-24 2xl:w-28 2xl:h-28 rounded-full border-4 border-background bg-surface flex items-center justify-center overflow-hidden shadow-xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 2xl:w-14 2xl:h-14 text-gray-400" />
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
            <div>
              <h1 className="text-3xl 2xl:text-4xl font-display font-bold text-foreground">{user.name || 'Fan User'}</h1>
              <div className="flex items-center gap-2 text-gray-400 mt-2">
                <Phone className="w-4 h-4 2xl:w-5 2xl:h-5" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-green-400 mt-2 text-sm 2xl:text-base font-medium">
                <Shield className="w-4 h-4 2xl:w-5 2xl:h-5" />
                <span>Verified Account</span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium border border-red-500/20 w-full sm:w-auto justify-center sm:justify-start"
            >
              <LogOut className="w-4 h-4 2xl:w-5 2xl:h-5" />
              Logout
            </button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-2xl border border-border">
              <h3 className="text-lg 2xl:text-xl font-medium text-gray-300 mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-gray-400">Videos in Library</span>
                  <span className="font-bold text-foreground">{isLoadingVideos || isVideosError ? '—' : videosCount}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-gray-400">Played Scenes</span>
                  <span className="font-bold text-foreground">{isLoadingScenes || isScenesError ? '—' : scenesCount}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-400">Member Since</span>
                  <span className="font-bold text-foreground">{memberSince ? memberSince.getFullYear() : '—'}</span>
                </div>
              </div>
            </div>
            
            <div className="glass p-6 rounded-2xl border border-border">
              <h3 className="text-lg 2xl:text-xl font-medium text-gray-300 mb-4">Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Push Notifications</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Email Updates</span>
                  <div className="w-10 h-5 bg-surface-hover rounded-full relative cursor-pointer border border-border">
                    <div className="w-4 h-4 bg-gray-400 rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
