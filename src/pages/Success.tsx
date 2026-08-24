import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

export function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
    }
  }, [id, navigate]);

  const copyToClipboard = () => {
    if (id) {
      try {
        navigator.clipboard.writeText(id).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
          console.error('Failed to copy', err);
          alert('Could not copy to clipboard. Please copy manually.');
        });
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  if (!id) return null;

  return (
    <div className="max-w-xl mx-auto w-full pt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-700" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#1d1b20]  mb-2">Registration Successful!</h1>
          <p className="text-[#49454f]  mb-8">
            {type === 'institution' 
              ? 'Your institution registration has been submitted successfully.'
              : 'Thank you for registering for Yi WalkAlong 2026.'}
          </p>

          <div className="bg-[#f1f3f4]  rounded-2xl p-6 mb-8 border border-[#cac4d0]">
            <p className="text-sm text-[#49454f]  mb-2 font-bold uppercase tracking-widest">Your Registration ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-[#1d1b20]  tracking-wider">{id}</span>
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-[#e1e2ec] rounded-full transition-colors text-[#6750a4]"
                title="Copy ID"
              >
                {copied ? <Check className="w-5 h-5 text-green-700" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
              Back to Home
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
