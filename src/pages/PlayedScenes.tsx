import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, PlayedScene } from '../api/client';
import { Film, Calendar, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const PlayedScenes: React.FC = () => {
  const { data: scenes, isLoading } = useQuery({
    queryKey: ['user', 'played-scenes'],
    queryFn: async () => {
      const { data } = await apiClient.get<PlayedScene[]>('/user/played-scenes');
      return data;
    },
  });

  return (
    <div className="page-container pt-28 pb-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl 2xl:text-5xl font-display font-bold text-foreground flex items-center gap-3">
          <Film className="w-8 h-8 2xl:w-10 2xl:h-10 text-primary" />
          Played Scenes
        </h1>
        <div className="text-gray-400 font-medium bg-surface px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full border border-border">
          {scenes?.length || 0} Scenes
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card h-24 animate-pulse bg-surface-hover rounded-2xl"></div>
          ))}
        </div>
      ) : scenes && scenes.length > 0 ? (
        <div className="space-y-4">
          {scenes.map((scene, index) => {
            const date = new Date(scene.timestamp);
            return (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 2xl:p-6 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 group flex items-center gap-6 cursor-pointer"
              >
                <div className="w-32 h-20 2xl:w-40 2xl:h-24 rounded-xl overflow-hidden relative shrink-0">
                  <img
                    src={scene.thumbnailUrl}
                    alt={scene.sceneName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg 2xl:text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {scene.sceneName}
                  </h3>
                  <p className="text-sm 2xl:text-base text-gray-400 truncate mt-1">{scene.matchName}</p>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs 2xl:text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                      {date.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-surface-hover flex items-center justify-center text-gray-400 group-hover:text-foreground group-hover:bg-primary transition-all shrink-0">
                  <ChevronRight className="w-5 h-5 2xl:w-6 2xl:h-6" />
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-6">
            <Film className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">No played scenes yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Scenes you participate in during live matches will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
