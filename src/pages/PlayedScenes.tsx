import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlayedSceneGridsForUser } from '../api/client';
import { Film, Calendar, Clock, ChevronRight, LayoutGrid, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { SceneModal } from '../components/SceneModal';

const gridColsForPanels = (panels: number) => {
  const p = Math.max(1, Math.floor(panels || 1));
  const root = Math.sqrt(p);
  if (Number.isInteger(root)) return root;
  return Math.min(4, Math.max(2, Math.ceil(root)));
};

export const PlayedScenes: React.FC = () => {
  const { user } = useAuth();
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);

  const { data: scenes, isLoading } = useQuery({
    queryKey: ['user', 'played-scenes', user?.id],
    enabled: !!user?.id,
    queryFn: () => getPlayedSceneGridsForUser(user!.id),
  });

  const selectedScene = useMemo(
    () => scenes?.find((s) => s.sceneId === selectedSceneId),
    [scenes, selectedSceneId]
  );

  return (
    <div className="page-container pt-28 pb-12 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-display font-bold text-foreground flex items-center gap-3">
          <Film className="w-8 h-8 2xl:w-10 2xl:h-10 text-primary" />
          Played Scenes
        </h1>
        <div className="self-start sm:self-auto text-gray-400 font-medium bg-surface px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full border border-border">
          {scenes?.length || 0} Scenes
        </div>
      </div>

      {!user?.id ? (
        <div className="glass-card p-8 sm:p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-6">
            <Film className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Login required</h3>
          <p className="text-muted max-w-md mx-auto">Login to see scenes where your videos were used by moderators.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card h-24 animate-pulse bg-surface-hover rounded-2xl"></div>
          ))}
        </div>
      ) : scenes && scenes.length > 0 ? (
        <div className="space-y-4">
          {scenes.map((scene, index) => {
            const date = new Date(scene.createdAt);
            const panels = Math.max(1, scene.tiles.length || scene.totalPanels || 1);
            const cols = gridColsForPanels(panels);
            return (
              <motion.div
                key={scene.sceneId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 2xl:p-6 rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 group flex items-center gap-4 sm:gap-6 cursor-pointer"
                onClick={() => setSelectedSceneId(scene.sceneId)}
              >
                <div className="w-28 h-16 sm:w-32 sm:h-20 2xl:w-44 2xl:h-28 rounded-xl overflow-hidden relative shrink-0 border border-border bg-surface-hover">
                  <div
                    className="grid w-full h-full"
                    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: panels }).map((_, i) => {
                      const tile = scene.tiles[i];
                      const isUserTile = !!tile?.isUser;
                      return (
                        <div key={tile?.tileId ?? i} className="relative w-full h-full overflow-hidden">
                          {tile?.thumbnailUrl ? (
                            <img
                              src={tile.thumbnailUrl}
                              alt="Tile"
                              className={[
                                'w-full h-full object-contain bg-black/5 transition-all duration-200',
                                isUserTile ? 'opacity-100 blur-0' : 'opacity-30 blur-sm',
                              ].join(' ')}
                            />
                          ) : tile?.videoUrl ? (
                            <div
                              className={[
                                'w-full h-full bg-white/5 flex items-center justify-center text-[10px] text-gray-400 transition-all duration-200',
                                isUserTile ? 'opacity-100 blur-0' : 'opacity-30 blur-sm',
                              ].join(' ')}
                            >
                              Video
                            </div>
                          ) : scene.thumbnailUrl ? (
                            <img
                              src={scene.thumbnailUrl}
                              alt="Scene thumbnail"
                              className={[
                                'w-full h-full object-cover transition-all duration-200',
                                isUserTile ? 'opacity-90 blur-0' : 'opacity-25 blur-sm',
                              ].join(' ')}
                            />
                          ) : (
                            <div className={['w-full h-full bg-white/5 transition-all duration-200', isUserTile ? '' : 'opacity-40 blur-sm'].join(' ')} />
                          )}
                          {tile?.isUser && (
                            <>
                              <div className="absolute inset-0 ring-2 ring-primary/70" />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg 2xl:text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    Scene {scene.sceneName}
                  </h3>
                  <p className="text-sm 2xl:text-base text-gray-400 truncate mt-1">
                    {scene.matchName ? `Match: ${scene.matchName}` : 'Match'}
                  </p>
                  {scene.eventName ? (
                    <p className="text-xs 2xl:text-sm text-muted truncate mt-1">
                      Event: {scene.eventName}
                    </p>
                  ) : null}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs 2xl:text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                      {date.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                      {panels} tiles
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSceneId(scene.sceneId);
                    }}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 2xl:px-4 2xl:py-2.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary border border-primary/20 transition-colors font-semibold"
                  >
                    <Play className="w-4 h-4 2xl:w-5 2xl:h-5 ml-0.5" />
                    Play
                  </button>
                  <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-surface-hover flex items-center justify-center text-gray-400 group-hover:text-foreground group-hover:bg-primary transition-all shrink-0">
                    <ChevronRight className="w-5 h-5 2xl:w-6 2xl:h-6" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-8 sm:p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-6">
            <Film className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">No played scenes yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            When a moderator uses your approved video in a scene, it will show here with the exact scene grid.
          </p>
        </div>
      )}

      {selectedScene && (
        <SceneModal
          isOpen={!!selectedScene}
          onClose={() => setSelectedSceneId(null)}
          scene={selectedScene}
        />
      )}
    </div>
  );
};
