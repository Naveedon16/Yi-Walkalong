import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white  rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-[#e1e2ec] ">
              <h2 id="size-guide-title" className="text-xl font-bold text-[#1d1b20] ">T-Shirt Size Guide</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100  transition-colors focus:outline-none"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] flex justify-center bg-gray-50 ">
              <img 
                src="/size-guide.png" 
                alt="T-Shirt Size Guide Chart" 
                className="max-w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
