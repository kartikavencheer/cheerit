import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, Video } from '../api/client';
import { VideoModal } from '../components/VideoModal';
import { Play, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const Library: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['user', 'library'],
    queryFn: async () => {
      const { data } = await apiClient.get<Video[]>('/user/library');
      return data;
    },
  });

  return (
    <div className="page-container pt-28 pb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl 2xl:text-5xl font-display font-bold text-foreground">My Library</h1>
        <div className="text-gray-400 font-medium bg-surface px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full border border-border">
          {videos?.length || 0} Videos
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card aspect-video animate-pulse bg-surface-hover rounded-2xl"></div>
          ))}
        </div>
      ) : videos && videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((video, index) => {
            const date = new Date(video.timestamp);
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-border hover:border-primary/50 transition-all duration-300 shadow-lg"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="aspect-video relative">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.matchName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-8 h-8 2xl:w-10 2xl:h-10 ml-1" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg 2xl:text-xl font-bold text-white truncate drop-shadow-md">{video.matchName}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs 2xl:text-sm text-gray-300 font-medium">
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
      ) : (
        <div className="glass-card p-12 text-center rounded-2xl border border-border flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-6">
            <Play className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">Your library is empty</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            You haven't captured any fan moments yet. Join a live match to start recording!
          </p>
        </div>
      )}

      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.matchName}
        />
      )}
    </div>
  );
};
