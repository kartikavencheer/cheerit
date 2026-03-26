import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogIn, Video, Film, Home, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { LoginPopup } from './Popup';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home, show: true },
    { name: 'My Library', path: '/library', icon: Video, show: true },
    { name: 'Played Scenes', path: '/played-scenes', icon: Film, show: true },
  ];

  const handleProtectedNavigation = (e: React.MouseEvent, link: any) => {
    if (
      !isAuthenticated &&
      (link.name === 'My Library' || link.name === 'Played Scenes')
    ) {
      e.preventDefault();
      setShowLoginPopup(true);
      return;
    }

    navigate(link.path);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'pt-4' : 'pt-6'
      )}
    >
      <div
        className={cn(
          'page-container transition-all duration-300',
          isScrolled
            ? 'glass rounded-full px-6 py-3 shadow-2xl shadow-black/50 border-border'
            : 'bg-transparent px-2 py-2'
        )}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/images/cheeritlogo.png"
                alt="CheerIT Logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={(e) => handleProtectedNavigation(e, link)}
                    className={cn(
                      'px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full text-sm 2xl:text-base font-medium transition-all duration-200 flex items-center gap-2',
                      location.pathname === link.path
                        ? 'bg-white/10 text-foreground shadow-inner'
                        : 'text-muted hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    <link.icon className="w-4 h-4 2xl:w-[18px] 2xl:h-[18px]" />
                    {link.name}
                  </Link>
                )
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 2xl:px-5 2xl:py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-border transition-all duration-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 2xl:w-7 2xl:h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm 2xl:text-base font-medium">
                    {user?.name || 'Profile'}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2.5 2xl:p-3 rounded-full bg-white/5 hover:bg-white/10 border border-border text-muted hover:text-foreground transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 2xl:w-[18px] 2xl:h-[18px]" />
                  ) : (
                    <Moon className="w-4 h-4 2xl:w-[18px] 2xl:h-[18px]" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2.5 2xl:p-3 rounded-full bg-white/5 hover:bg-white/10 border border-border text-muted hover:text-foreground transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 2xl:w-[18px] 2xl:h-[18px]" />
                  ) : (
                    <Moon className="w-4 h-4 2xl:w-[18px] 2xl:h-[18px]" />
                  )}
                </button>

                <Link
                  to="/login"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                
              </div>
              
            )}
          </div>
          <LoginPopup
  isOpen={showLoginPopup}
  onClose={() => setShowLoginPopup(false)}
  onLoginClick={() => {
    setShowLoginPopup(false);
    navigate('/login');
  }}
/>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleTheme} className="p-2">
              {theme === 'dark' ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div className="absolute top-full left-4 right-4 mt-2 glass rounded-2xl p-4 flex flex-col gap-2 shadow-2xl md:hidden">
            {navLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={(e) => {
                      handleProtectedNavigation(e, link);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-xl flex items-center gap-3"
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                  
                )
            )}
            

            <div className="h-px bg-white/10 my-2" />

            {isAuthenticated ? (
              <Link to="/profile" className="px-4 py-3">
                Profile
              </Link>
            ) : (
              <Link to="/login" className="px-4 py-3 bg-primary text-white rounded-xl">
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
    </nav>
    
  );
};

