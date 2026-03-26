import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogIn, Video, Film, Home, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';
import { LoginPopup } from './Popup';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
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
    <>
      <nav
       className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      >
       <div
  className={cn(
    'transition-all duration-300 w-full',
    
    isScrolled
      ? 'page-container glass rounded-full px-6 py-3 shadow-2xl shadow-black/40 border border-border backdrop-blur-xl'
      : 'w-full bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-3'
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

            {/* Mobile Right (Theme only) */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleTheme} className="p-2">
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90]">
        <div className="mx-3 mb-3 glass rounded-2xl border border-border shadow-2xl shadow-black/30">
          <div className="grid grid-cols-4">
            {[
              { name: 'Home', path: '/', icon: Home, protected: false },
              { name: 'Library', path: '/library', icon: Video, protected: true },
              { name: 'Scenes', path: '/played-scenes', icon: Film, protected: true },
              { name: isAuthenticated ? 'Profile' : 'Login', path: isAuthenticated ? '/profile' : '/login', icon: isAuthenticated ? User : LogIn, protected: isAuthenticated },
            ].map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={(e) => {
                    if (!isAuthenticated && item.protected && item.path !== '/login') {
                      e.preventDefault();
                      setShowLoginPopup(true);
                      return;
                    }
                    navigate(item.path);
                  }}
                  className={cn(
                    'py-3 px-2 flex flex-col items-center justify-center gap-1 rounded-2xl transition-colors',
                    isActive ? 'text-primary' : 'text-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginClick={() => {
          setShowLoginPopup(false);
          navigate('/login');
        }}
      />
    </>
  );
};
