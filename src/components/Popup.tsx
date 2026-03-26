
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, X } from "lucide-react";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({
  isOpen,
  onClose,
  onLoginClick,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* POPUP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="glass rounded-2xl p-6 border border-white/10 shadow-2xl">
              
              {/* CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* CONTENT */}
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-xl font-semibold text-foreground">
                  Login Required
                </h2>

                <p className="text-sm text-muted">
                  Please login to access your Library and Played Scenes.
                </p>

                {/* BUTTON */}
                <button
                  onClick={onLoginClick}
                  className="w-full mt-4 px-5 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary-dark transition-all"
                >
                  Login Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

