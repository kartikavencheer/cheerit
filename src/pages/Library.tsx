import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LibraryMediaTypeFilter,
  LibrarySubmissionStatusFilter,
  Video,
  getVideosPage,
} from '../api/client';
import { VideoModal } from '../components/VideoModal';
import { Play, Calendar, Clock, Image as ImageIcon, Filter, Video as VideoIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const MEDIA_TYPES: LibraryMediaTypeFilter[] = ['VIDEO', 'IMAGE'];
const STATUSES: LibrarySubmissionStatusFilter[] = ['APPROVED', 'REJECTED', 'PLAYED'];

const statusLabel = (status: LibrarySubmissionStatusFilter) => {
  if (status === 'PLAYED') return 'LIVE';
  return status;
};

const statusBorder = (status: LibrarySubmissionStatusFilter) => {
  if (status === 'APPROVED') return 'border-green-500/50';
  if (status === 'REJECTED') return 'border-red-500/50';
  if (status === 'PLAYING') return 'border-primary/60';
  return 'border-white/15';
};

export const Library: React.FC = () => {
  const { user } = useAuth();
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<LibraryMediaTypeFilter>('VIDEO');
  const [status, setStatus] = useState<LibrarySubmissionStatusFilter>('APPROVED');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: libraryPage, isLoading, isFetching } = useQuery({
    queryKey: ['user', 'library', user?.id, page, mediaType, status],
    enabled: !!user?.id,
    queryFn: () => getVideosPage(user!.id, page, pageSize, { mediaType, status }),
  });

  const videos = libraryPage?.items ?? [];
  const total = libraryPage?.total;
  const totalLabel = mediaType === 'IMAGE' ? 'Images' : 'Videos';
  const canNext = total != null ? page * pageSize < total : videos.length === pageSize;

  return (
    <div className="page-container pt-28 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl 2xl:text-5xl font-display font-bold text-foreground">My Library</h1>
        <div className="text-gray-400 font-medium bg-surface px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full border border-border">
          {(total ?? videos.length) || 0} {totalLabel}
        </div>
      </div>

      {!user?.id ? (
        <div className="glass-card p-10 text-center rounded-2xl border border-border">
          <h3 className="text-xl font-display font-bold text-foreground mb-2">Login required</h3>
          <p className="text-muted">Please login to view your library.</p>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-2xl border border-border mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            {isFetching && !isLoading ? <div className="text-xs text-muted">Updating…</div> : null}
          </div>

          {isLoading ? (
            <div className="mt-4 h-10 bg-surface-hover rounded-xl animate-pulse" />
          ) : (
            <>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-muted mb-2">Media</div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                    {MEDIA_TYPES.map((t) => {
                      const active = mediaType === t;
                      const Icon = t === 'IMAGE' ? ImageIcon : VideoIcon;
                      return (
                        <button
                          key={t}
                          type="button"
                          aria-label={t}
                          onClick={() => {
                            setMediaType(t);
                            setPage(1);
                          }}
                          className={[
                            'flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-colors',
                            active
                              ? 'bg-primary/15 text-foreground border-primary/60'
                              : 'bg-white/5 hover:bg-white/10 border-border text-foreground',
                          ].join(' ')}
                        >
                          <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div>
                  <div className="text-xs font-semibold text-muted mb-2">Status</div>
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-2">
                    {STATUSES.map((s) => {
                      const active = status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setStatus(s);
                            setPage(1);
                          }}
                          className={[
                            'px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-colors',
                            active
                              ? `bg-primary/15 text-foreground ${statusBorder(s)}`
                              : 'bg-white/5 hover:bg-white/10 border-border text-foreground',
                          ].join(' ')}
                        >
                          {statusLabel(s)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="glass-card aspect-video animate-pulse bg-surface-hover rounded-2xl"></div>
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {videos.map((video, index) => {
              const date = new Date(video.timestamp);
              const statusClasses =
                video.status === 'approved'
                  ? 'border-green-500/80 shadow-[0_0_0_1px_rgba(34,197,94,0.45)] filter drop-shadow-[0_0_26px_rgba(34,197,94,0.40)] drop-shadow-[0_0_90px_rgba(34,197,94,0.28)] hover:border-green-500'
                  : video.status === 'rejected'
                    ? 'border-red-500/80 shadow-[0_0_0_1px_rgba(239,68,68,0.42)] filter drop-shadow-[0_0_26px_rgba(239,68,68,0.38)] drop-shadow-[0_0_90px_rgba(239,68,68,0.26)] hover:border-red-500'
                    : video.status === 'playing'
                      ? 'border-primary/80 shadow-[0_0_0_1px_rgba(124,58,237,0.40)] hover:border-primary'
                      : 'border-border hover:border-primary/50';

              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 shadow-lg ${statusClasses}`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative bg-black/5">
                    <img
                      src={video.thumbnailUrl || undefined}
                      alt={video.matchName}
                      className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        {mediaType === 'IMAGE' ? (
                          <ImageIcon className="w-8 h-8 2xl:w-10 2xl:h-10" />
                        ) : (
                          <Play className="w-8 h-8 2xl:w-10 2xl:h-10 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0a0a0a] border-t border-white/10">
                    <h3 className="text-lg 2xl:text-xl font-bold text-white truncate">{video.matchName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs 2xl:text-sm text-gray-400 font-medium">
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
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-border text-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <div className="text-sm text-muted font-semibold">Page {page}</div>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-6">
            {mediaType === 'IMAGE' ? (
              <ImageIcon className="w-10 h-10 text-gray-500" />
            ) : (
              <Play className="w-10 h-10 text-gray-500" />
            )}
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">No {totalLabel.toLowerCase()} found</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Try a different status filter or switch between IMAGE and VIDEO.
          </p>
        </div>
      )}

      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          mediaType={mediaType === 'IMAGE' ? 'image' : 'video'}
          videoUrl={selectedVideo.videoUrl}
          imageUrl={selectedVideo.videoUrl || selectedVideo.thumbnailUrl}
          title={selectedVideo.matchName}
        />
      )}
    </div>
  );
};
