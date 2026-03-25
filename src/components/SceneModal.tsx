import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import type { PlayedSceneGrid, SceneTile } from '../api/client';

const gridColsForPanels = (panels: number) => {
  const p = Math.max(1, Math.floor(panels || 1));
  const root = Math.sqrt(p);
  if (Number.isInteger(root)) return root;
  return Math.min(4, Math.max(2, Math.ceil(root)));
};

type SceneModalProps = {
  isOpen: boolean;
  onClose: () => void;
  scene: PlayedSceneGrid;
};

export const SceneModal: React.FC<SceneModalProps> = ({ isOpen, onClose, scene }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);

  const panels = Math.max(1, scene.tiles.length || scene.totalPanels || 1);
  const cols = gridColsForPanels(panels);

  const tiles = useMemo(() => {
    const list: (SceneTile | undefined)[] = Array.from({ length: panels }).map((_, i) => scene.tiles[i]);
    return list;
  }, [panels, scene.tiles]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsPlaying(false);
      setIsMuted(true);
      videosRef.current = [];
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, scene.sceneId]);

  const playAll = async () => {
    const vids = videosRef.current.filter(Boolean) as HTMLVideoElement[];
    if (vids.length === 0) return;

    // Important: keep this in the click gesture turn so browsers allow playback.
    await Promise.allSettled(
      vids.map((v) => {
        v.muted = isMuted;
        try {
          v.currentTime = 0;
        } catch {
          // ignore
        }
        return v.play();
      })
    );
    setIsPlaying(true);
  };

  const pauseAll = () => {
    const vids = videosRef.current.filter(Boolean) as HTMLVideoElement[];
    for (const v of vids) v.pause();
    setIsPlaying(false);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    const vids = videosRef.current.filter(Boolean) as HTMLVideoElement[];
    for (const v of vids) v.muted = next;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 2xl:p-10 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-6xl 2xl:max-w-7xl min-[1920px]:max-w-[92rem] bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 2xl:p-7 border-b border-white/10 bg-gradient-to-b from-black/70 to-transparent">
              <div className="min-w-0">
                <div className="text-white font-bold text-lg 2xl:text-xl truncate">
                  Scene {scene.sceneName}
                </div>
                <div className="text-xs 2xl:text-sm text-gray-400 truncate">
                  {scene.matchName || scene.eventId} • {panels} tiles • {scene.sceneId}
                </div>
              </div>
              <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 2xl:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 2xl:w-6 2xl:h-6" /> : <Volume2 className="w-5 h-5 2xl:w-6 2xl:h-6" />}
                </button>
                {!isPlaying ? (
                  <button
                    type="button"
                    onClick={playAll}
                    className="px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 2xl:w-5 2xl:h-5 ml-0.5" />
                    Play scene
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pauseAll}
                    className="px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4 2xl:w-5 2xl:h-5" />
                    Pause
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 2xl:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 2xl:w-6 2xl:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 2xl:p-7 overflow-auto">
              <div
                className="grid gap-3 2xl:gap-4"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {tiles.map((tile, idx) => (
                  <div
                    key={tile?.tileId ?? idx}
                    className={`relative rounded-2xl overflow-hidden border bg-black/40 ${
                      tile?.isUser ? 'border-primary/70 shadow-[0_0_0_1px_rgba(255,106,0,0.35)]' : 'border-white/10'
                    }`}
                  >
                    {tile?.videoUrl ? (
                      <video
                        ref={(el) => {
                          videosRef.current[idx] = el;
                          if (el) el.muted = isMuted;
                        }}
                        src={tile.videoUrl}
                        preload="none"
                        playsInline
                        muted={isMuted}
                        controls
                        poster={tile.thumbnailUrl}
                        className="w-full h-full object-contain aspect-video bg-black"
                      />
                    ) : tile?.thumbnailUrl ? (
                      <img
                        src={tile.thumbnailUrl}
                        alt="Tile"
                        className="w-full h-full object-contain aspect-video bg-black/60"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-white/5 flex items-center justify-center text-[11px] 2xl:text-xs text-gray-400">
                        Video unavailable
                      </div>
                    )}

                    {tile?.submissionId && (
                      <div className="absolute left-2 bottom-2 px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] 2xl:text-xs text-gray-200 font-mono max-w-[90%] truncate">
                        {tile.submissionId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs 2xl:text-sm text-gray-400">
                Tip: click “Play scene” to start all videos together. If a tile is missing video, it means the backend didn’t return a playable URL for that submission.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
