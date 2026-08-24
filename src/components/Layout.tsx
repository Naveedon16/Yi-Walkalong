import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Footprints } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { AdminAuthService } from '../services/AdminAuthService';
import { useState, useEffect } from 'react';
import { NetworkStatus } from './NetworkStatus';
import { SafeImage } from './ui/SafeImage';

export function Layout() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(AdminAuthService.isAuthenticated());

  useEffect(() => {
    setIsAdmin(AdminAuthService.isAuthenticated());
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#1d1b20]  font-sans selection:bg-[#eaddff] selection:text-[#21005d]   ">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="h-auto md:h-16 px-4 sm:px-8 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between bg-white border-t border-[#e1e2ec] shrink-0 gap-4  ">
        <div className="flex flex-wrap justify-center gap-6 text-[11px] font-bold text-[#79747e]  uppercase tracking-widest">
          <a href="/" className="hover:text-[#6750a4] transition-colors">FAQ</a>
          <a href="/" className="hover:text-[#6750a4] transition-colors">Terms of Service</a>
          <a href="/" className="hover:text-[#6750a4] transition-colors">Privacy Policy</a>
          <a href="/" className="hover:text-[#6750a4] transition-colors">Contact Us</a>
        </div>
        <div className="text-[11px] text-[#49454f]  flex flex-wrap justify-center items-center gap-2">
          <span>Powered by</span>
          <div className="w-16 h-4 bg-[#f1f3f4]  rounded-sm flex items-center justify-center font-bold text-[8px] tracking-tighter text-[#79747e] ">GOOGLE SHEETS</div>
          <span className="opacity-50 hidden md:inline">|</span>
          <span>&copy; {new Date().getFullYear()} Yi Chennai</span>
        </div>
      </footer>
      
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <NetworkStatus />
      </div>
    </div>
  );
}
