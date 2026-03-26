import React, { useEffect } from 'react';
import { X, Play, Info, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  imageUrl?: string;
  mediaType?: 'video' | 'image';
  title: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl, imageUrl, mediaType, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 2xl:p-10 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl 2xl:max-w-6xl min-[1920px]:max-w-7xl bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 2xl:p-8 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 backdrop-blur-md">
                  {mediaType === 'image' ? (
                    <ImageIcon className="w-4 h-4 2xl:w-5 2xl:h-5 text-primary" />
                  ) : (
                    <Play className="w-4 h-4 2xl:w-5 2xl:h-5 text-primary ml-1" />
                  )}
                </div>
                <h3 className="text-white font-bold text-lg 2xl:text-xl leading-tight drop-shadow-md">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/50 text-gray-300 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10"
              >
                <X className="w-6 h-6 2xl:w-7 2xl:h-7" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative w-full bg-black flex items-center justify-center flex-shrink-0">
              {mediaType === 'image' ? (
                imageUrl ? (
                  <img src={imageUrl} alt={title} className="block w-full h-auto max-h-[70vh] object-contain" />
                ) : (
                  <div className="p-10 text-center text-gray-400">Image unavailable</div>
                )
              ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay className="block w-full h-auto max-h-[70vh] object-contain">
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="p-10 text-center text-gray-400">Video unavailable</div>
              )}
            </div>

            {/* Details Footer */}
            <div className="p-6 2xl:p-8 bg-gradient-to-t from-[#0a0a0a] to-[#141414] border-t border-white/5 flex-shrink-0">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 rounded-xl bg-white/5 border border-white/10">
                  <Info className="w-5 h-5 2xl:w-6 2xl:h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Scene Details</h4>
                  <p className="text-gray-400 text-sm 2xl:text-base leading-relaxed">
                    This clip is part of your personal CheerIT library.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
