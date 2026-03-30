import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LibraryMediaTypeFilter,
  LibrarySubmissionStatusFilter,
  Video,
  getVideosPage,
  softDeleteSubmission,
} from '../api/client';
import { Play, Calendar, Clock, Image as ImageIcon, Filter, Video as VideoIcon, Download, X, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const MEDIA_TYPES: LibraryMediaTypeFilter[] = ['VIDEO', 'IMAGE'];
const STATUSES: LibrarySubmissionStatusFilter[] = ['APPROVED', 'REJECTED', 'PLAYED'];

const statusBorder = (status: LibrarySubmissionStatusFilter) => {
  if (status === 'APPROVED') return 'border-green-500/50';
  if (status === 'REJECTED') return 'border-red-500/50';
  if (status === 'PLAYING') return 'border-primary/60';
  return 'border-white/15';
};

const statusLabel = (status: LibrarySubmissionStatusFilter) => {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Denied';
  if (status === 'PLAYING') return 'Playing';
  if (status === 'PLAYED') return 'Live';
  return status;
};

export const Library: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const pageSize = 12;
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<LibraryMediaTypeFilter>('VIDEO');
  const [status, setStatus] = useState<LibrarySubmissionStatusFilter>('APPROVED');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const queryKey = ['user', 'library', user?.id, page, mediaType, status] as const;

  const { data: libraryPage, isLoading, isFetching } = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: () => getVideosPage(user!.id, page, pageSize, { mediaType, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const deletedBy = user?.name || user?.phone || 'user';
      return softDeleteSubmission(submissionId, deletedBy);
    },
    onMutate: async (submissionId) => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<{ items: Video[]; total?: number }>(queryKey);
      queryClient.setQueryData<{ items: Video[]; total?: number }>(queryKey, (old) => {
        if (!old) return old;
        const nextItems = old.items.filter((v) => v.id !== submissionId);
        const nextTotal = typeof old.total === 'number' ? Math.max(0, old.total - 1) : old.total;
        return { ...old, items: nextItems, total: nextTotal };
      });
      if (activeVideoId === submissionId) setActiveVideoId(null);
      return { prev };
    },
    onError: (_err, _submissionId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error('Failed to delete. Please try again.');
    },
    onSuccess: () => {
      toast.success('Deleted from your library.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'library', user?.id] });
    },
  });

  const videos = libraryPage?.items ?? [];
  const total = libraryPage?.total;
  const totalLabel = mediaType === 'IMAGE' ? 'Images' : 'Videos';
  const canNext = total != null ? page * pageSize < total : videos.length === pageSize;

  const inferFileExtension = (url: string) => {
    const cleanUrl = url.split('#')[0]?.split('?')[0] ?? '';
    const lastDot = cleanUrl.lastIndexOf('.');
    if (lastDot < 0) return null;
    const ext = cleanUrl.slice(lastDot + 1).toLowerCase();
    if (!ext || ext.length > 6) return null;
    return ext;
  };

  const downloadNameFor = (item: Video) => {
    const safeBase = (item.matchName || 'cheerit')
      .trim()
      .replace(/[^\w\- ]+/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 60);
    const ext = inferFileExtension(item.videoUrl) ?? (mediaType === 'VIDEO' ? 'mp4' : 'jpg');
    return `${safeBase || 'cheerit'}_${item.id}.${ext}`;
  };

  return (
    <div className="page-container pt-28 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-display font-bold text-foreground">My Library</h1>
        <div className="self-start sm:self-auto text-gray-400 font-medium bg-surface px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full border border-border">
          {(total ?? videos.length) || 0} {totalLabel}
        </div>
      </div>

      {!user?.id ? (
        <div className="glass-card p-8 sm:p-10 text-center rounded-2xl border border-border">
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
            {isFetching && !isLoading ? <div className="text-xs text-muted">Updating...</div> : null}
          </div>

          {isLoading ? (
            <div className="mt-4 h-10 bg-surface-hover rounded-xl animate-pulse" />
          ) : (
            <>
              <div className="mt-4 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start lg:gap-6">
                  <div className="text-xs font-semibold text-muted mb-2 lg:mb-0">Media</div>
                  <div className="p-1 rounded-2xl bg-white/5 border border-white/10 lg:w-auto">
                    <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap sm:gap-1">
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
                              setActiveVideoId(null);
                            }}
                            className={[
                              'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors',
                              active
                                ? 'bg-primary/15 text-foreground border-primary/60'
                                : 'bg-transparent hover:bg-white/5 border-transparent text-foreground',
                            ].join(' ')}
                          >
                            <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start lg:gap-6">
                  <div className="text-xs font-semibold text-muted mb-2 lg:mb-0">Status</div>
                  <div className="p-1 rounded-2xl bg-white/5 border border-white/10 lg:w-auto">
                    <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:gap-1">
                      {STATUSES.map((s) => {
                        const active = status === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setStatus(s);
                              setPage(1);
                              setActiveVideoId(null);
                            }}
                            className={[
                              'px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors',
                              active
                                ? `bg-primary/15 text-foreground ${statusBorder(s)}`
                                : 'bg-transparent hover:bg-white/5 border-transparent text-foreground',
                            ].join(' ')}
                          >
                            {statusLabel(s)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
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
                  className={`library-card group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 shadow-lg ${statusClasses}`}
                  onClick={() => {
                    if (mediaType === 'VIDEO') {
                      setActiveVideoId((current) => (current === video.id ? null : video.id));
                      return;
                    }

                    window.open(video.videoUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <div className="relative bg-black aspect-[9/16] overflow-hidden">
                    {mediaType === 'VIDEO' && activeVideoId === video.id ? (
                      <video
                        src={video.videoUrl}
                        poster={video.thumbnailUrl || undefined}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 w-full h-full object-contain bg-black"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={
                          (mediaType === 'IMAGE'
                            ? video.thumbnailUrl || video.videoUrl
                            : video.thumbnailUrl || video.videoUrl) || undefined
                        }
                        alt={video.matchName}
                        className="absolute inset-0 w-full h-full object-contain bg-black transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!video.id) return;
                          const ok = window.confirm('Delete this item from your library?');
                          if (!ok) return;
                          deleteMutation.mutate(video.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/60 hover:bg-black/75 border border-white/10 text-white/90 hover:text-white backdrop-blur-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        title="Delete"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <a
                        href={video.videoUrl}
                        download={downloadNameFor(video)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/60 hover:bg-black/75 border border-white/10 text-white/90 hover:text-white backdrop-blur-md transition-colors"
                        title="Download"
                        aria-label="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>

                    {mediaType === 'VIDEO' && activeVideoId === video.id ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVideoId(null);
                        }}
                        className="absolute top-3 left-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-black/60 hover:bg-black/75 border border-white/10 text-white/90 hover:text-white backdrop-blur-md transition-colors"
                        title="Close"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}

                    {!(mediaType === 'VIDEO' && activeVideoId === video.id) ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                          {mediaType === 'IMAGE' ? (
                            <ImageIcon className="w-8 h-8 2xl:w-10 2xl:h-10" />
                          ) : (
                            <Play className="w-8 h-8 2xl:w-10 2xl:h-10 ml-1" />
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4 bg-[#0a0a0a] border-t border-white/10">
                    <div className="library-marquee">
                      <div className="library-marquee__inner">
                        <h3 className="text-lg 2xl:text-xl font-bold text-white whitespace-nowrap">{video.matchName}</h3>
                        <h3
                          aria-hidden="true"
                          className="text-lg 2xl:text-xl font-bold text-white whitespace-nowrap select-none"
                        >
                          {video.matchName}
                        </h3>
                      </div>
                    </div>
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
              onClick={() => {
                setActiveVideoId(null);
                setPage((p) => Math.max(1, p - 1));
              }}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-border text-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <div className="text-sm text-muted font-semibold">Page {page}</div>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => {
                setActiveVideoId(null);
                setPage((p) => p + 1);
              }}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 sm:p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[40vh]">
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
    </div>
  );
};
