import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Footprints } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { AdminAuthService } from '../services/AdminAuthService';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { NetworkStatus } from './NetworkStatus';

export function Layout() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(AdminAuthService.isAuthenticated());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsAdmin(AdminAuthService.isAuthenticated());
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#1d1b20] dark:text-gray-100 font-sans selection:bg-[#eaddff] selection:text-[#21005d] dark:bg-[#121212] dark:selection:bg-purple-900 dark:selection:text-white">
      <header className="sticky top-0 z-50 w-full h-16 px-4 sm:px-6 flex items-center justify-between bg-white border-b border-[#e1e2ec] shrink-0 dark:bg-[#1e1e1e] dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/Yi.png" alt="Yi Logo" className="w-12 h-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-tight tracking-tight text-[#1d1b20] dark:text-white">WalkAlong</span>
              <span className="text-[10px] text-[#49454f] dark:text-gray-300 uppercase tracking-widest font-bold">Chennai Chapter</span>
            </div>
          </Link>
        </div>
        <nav className="hidden md:flex gap-8">
          {[
            { name: 'Registration', path: '/' },
          ].map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors relative flex items-center h-16",
                  isActive ? "text-[#6750a4]" : "text-[#49454f] dark:text-gray-300 hover:text-[#6750a4]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6750a4]"
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <NetworkStatus />
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6750a4] focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e]"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-200" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="h-auto md:h-16 px-4 sm:px-8 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between bg-white border-t border-[#e1e2ec] shrink-0 gap-4 dark:bg-[#1e1e1e] dark:border-gray-800">
        <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-[#79747e] dark:text-gray-400 uppercase tracking-widest">
          <a href="/" className="hover:text-[#6750a4] transition-colors">FAQ</a>
          <a href="/" className="hover:text-[#6750a4] transition-colors">Terms of Service</a>
          <a href="/" className="hover:text-[#6750a4] transition-colors">Privacy Policy</a>
          <a href="/" className="hover:text-[#6750a4] transition-colors">Contact Us</a>
        </div>
        <div className="text-[11px] text-[#49454f] dark:text-gray-300 flex flex-wrap justify-center items-center gap-2">
          <span>Powered by</span>
          <div className="w-16 h-4 bg-[#f1f3f4] dark:bg-gray-800 rounded-sm flex items-center justify-center font-bold text-[8px] tracking-tighter text-[#79747e] dark:text-gray-400">GOOGLE SHEETS</div>
          <span className="opacity-50 hidden md:inline">|</span>
          <span>&copy; {new Date().getFullYear()} Yi Chennai</span>
        </div>
      </footer>
    </div>
  );
}
