import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, User, Calendar, MapPin, Clock, Heart, Music, Award, Coffee, Activity, Accessibility, Shield, MessageCircle, ChevronDown, Phone, Mail, Globe, Search, CheckCircle, QrCode, Loader2, Info, CircleUserRound  } from 'lucide-react';
import { Share2, Mail as MailIcon, Copy, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusService } from '../services';
import { RegistrationQRCode } from '../components/RegistrationQRCode';
import { RegistrationStatus as RegistrationStatusType } from '../types';


import { GALLERY_IMAGES, GalleryImage } from '../components/GalleryImage';
import { GallerySlideshow } from '../components/GallerySlideshow';
import { Link } from 'react-router-dom';


export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<RegistrationStatusType[] | null>(null);
  const [selectedResult, setSelectedResult] = React.useState<RegistrationStatusType | null>(null);
  const [searched, setSearched] = React.useState(false);


  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [emailStatus, setEmailStatus] = React.useState<{success?: boolean; message?: string} | null>(null);

  const handleSendEmail = async (id: string) => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await StatusService.sendRegistrationPass(id);
      setEmailStatus({ success: true, message: res.message || 'Registration pass sent to your email.' });
    } catch (err: any) {
      setEmailStatus({ success: false, message: err.message || 'We couldn\'t send your pass right now. Please try again.' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleShare = async (result: RegistrationStatusType) => {
    const text = `WalkAlong Registration Confirmed\n\nRegistration ID: ${result.id}\nName: ${result.details.name}\nStatus: ${result.status}\n\nEvent:\nWalkAlong — Yi Chennai Chapter\n06 September 2026\n07:30 AM IST\nMarina Beach\n\nView registration pass:\n${window.location.href}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WalkAlong Registration',
          text: text,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Pass link copied.');
      } catch (err) {
        alert('Failed to copy link.');
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearched(true);
    setResults(null);
    setSelectedResult(null);
    setEmailStatus(null);
    
    try {
      setEmailStatus(null);
    const data = await StatusService.checkStatus(query.trim());
      setResults(data.statuses);
      if (data.statuses.length === 1) {
        setSelectedResult(data.statuses[0]);
      }
    } catch (error) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'text-green-700 bg-green-50 border-green-200';
      case 'Checked In': return 'text-[#6750a4] bg-[#f3edf7] dark:bg-purple-900/30 border-[#eaddff]';
      default: return 'text-[#49454f] dark:text-gray-300 bg-[#f1f3f4] dark:bg-gray-800 border-[#cac4d0] dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'Checked In': return <Activity className="w-5 h-5" />;
      default: return null;
    }
  };


  return (
    <div className="space-y-32 pb-24">
      {/* Hero & Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 pt-8 lg:pt-12">
        {/* Hero & Info Section */}
        <section className="lg:col-span-7 flex flex-col justify-center gap-10">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1.5 bg-[#d0bcff] text-[#381e72] rounded-full text-sm font-bold uppercase tracking-wider">
              Event 2026
            </span>
            <h1 className="text-5xl lg:text-7xl xl:text-[80px] font-bold leading-[1.05] text-[#21005d] dark:text-white tracking-tight">
              Step Towards <br />
              <span className="text-[#6750a4] dark:text-[#d0bcff]">Inclusivity.</span>
            </h1>
            <p className="text-lg lg:text-xl text-[#49454f] dark:text-gray-300 max-w-xl leading-relaxed">
              Join us for the Yi Chennai WalkAlong. A collective stride to foster awareness, support, and friendship with Persons with Disabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-3xl border border-[#cac4d0] dark:border-gray-700 shadow-sm">
              <div className="text-[#6750a4] mb-3">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="text-sm text-[#49454f] dark:text-gray-300 font-medium mb-1">Event Schedule</div>
              <div className="text-base font-bold text-[#1d1b20] dark:text-white">
                06 September 2026<br />
                07:30 AM IST
              </div>
            </div>
            <div className="bg-white dark:bg-[#1e1e1e] p-5 rounded-3xl border border-[#cac4d0] dark:border-gray-700 shadow-sm">
              <div className="text-[#6750a4] mb-3">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="text-sm text-[#49454f] dark:text-gray-300 font-medium mb-1">Venue</div>
              <div className="text-base font-bold truncate text-[#1d1b20] dark:text-white">Marina Beach</div>
            </div>
          </div>

          <div className="bg-[#f3edf7] dark:bg-purple-900/30 p-8 rounded-[32px] flex flex-col sm:flex-row sm:items-center justify-between border border-[#eaddff] dark:border-purple-800/50 gap-6">
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4 shrink-0">
                <div className="w-12 h-12 rounded-full border-[3px] border-[#f3edf7] dark:border-[#1e1e1e] bg-[#6750a4] flex items-center justify-center text-xs text-white font-bold">+800</div>
                <div className="w-12 h-12 rounded-full border-[3px] border-[#f3edf7] dark:border-[#1e1e1e] bg-[#d0bcff] flex items-center justify-center text-xs text-[#21005d] font-bold">PWD</div>
                <div className="w-12 h-12 rounded-full border-[3px] border-[#f3edf7] dark:border-[#1e1e1e] bg-[#e8def8] flex items-center justify-center text-xs text-[#1d192b] font-bold">YI</div>
              </div>
              <div>
                <div className="text-base font-bold text-[#21005d] dark:text-[#d0bcff]">Join the movement</div>
                <div className="text-sm text-[#49454f] dark:text-gray-300 mt-0.5">Currently accepting registrations</div>
              </div>
            </div>
            <div className="text-sm font-bold text-[#6750a4] dark:text-[#d0bcff] hover:text-[#21005d] dark:hover:text-white underline cursor-pointer uppercase tracking-widest hidden sm:block transition-colors">View Gallery</div>
          </div>
        </section>

        {/* Registration Action Cards */}
        <section className="lg:col-span-5 flex flex-col justify-center gap-6">
          <div 
            onClick={() => navigate('/register/individual')}
            className="bg-white dark:bg-[#1e1e1e] rounded-[32px] p-6 shadow-sm border border-[#e1e2ec] dark:border-gray-700 hover:border-[#6750a4] hover:bg-[#fef7ff] dark:hover:bg-purple-900/20 transition-all cursor-pointer group"
          >
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#f3edf7] dark:bg-purple-900/30 group-hover:bg-[#eaddff] flex items-center justify-center text-[#6750a4] transition-colors shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white">Registration</h3>
                  <span className="text-[#6750a4] font-bold text-xl">→</span>
                </div>
                <p className="text-sm text-[#49454f] dark:text-gray-300 mt-1">
                  For PWD and Yi Members.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 flex gap-3 items-start sm:items-center">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              Registrations for other categories will be opened soon.
            </p>
          </div>

          {/* Status Check Quick-Entry */}
          <div className="mt-4 bg-[#f1f3f4] dark:bg-gray-800 p-5 rounded-3xl border border-transparent">
            <div className="text-xs font-bold text-[#49454f] dark:text-gray-300 uppercase tracking-wider mb-3">View Your Pass</div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                name="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Registration ID / Phone" 
                className="flex-1 bg-white dark:bg-[#1e1e1e] border border-[#cac4d0] dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#6750a4] outline-none text-[#1d1b20] dark:text-white placeholder:text-[#79747e] dark:placeholder:text-gray-400" 
                required
              />
              <button 
                type="submit" 
                disabled={isSearching}
                className="bg-[#6750a4] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#523f85] transition-colors whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                View Pass
              </button>
            </form>
            
            <AnimatePresence mode="wait">
              {searched && !isSearching && results && results.length > 1 && !selectedResult && (
                <motion.div
                  key="results-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6"
                >
                  <Card className="border-[#cac4d0] dark:border-gray-700 p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">{results.length} registrations found</h3>
                    <div className="space-y-3">
                      {results.map(r => (
                        <div 
                          key={r.id} 
                          className="flex items-center justify-between p-4 rounded-xl border border-[#e1e2ec] dark:border-gray-700 hover:bg-[#f8f9ff] dark:bg-gray-800/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedResult(r)}
                        >
                          <div>
                            <div className="font-bold text-[#1d1b20] dark:text-white text-base">{r.details.name}</div>
                            <div className="text-sm text-[#49454f] dark:text-gray-300 font-mono">{r.id}</div>
                          </div>
                          <Button variant="outline" size="sm">View Pass</Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {searched && !isSearching && selectedResult && (
                <motion.div
                  key="selected-result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6"
                >
                  <Card id="registration-pass" className="border-t-4 border-t-[#6750a4] p-4 sm:p-6">
                    {results && results.length > 1 && (
                      <button 
                        onClick={() => setSelectedResult(null)}
                        className="text-sm font-medium text-[#6750a4] mb-4 hover:underline flex items-center gap-1 print-hide"
                      >
                        ← Back to results
                      </button>
                    )}
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-[#e1e2ec] dark:border-gray-700">
                      <div>
                        <p className="text-sm text-[#49454f] dark:text-gray-300 mb-1">Registration ID</p>
                        <p className="text-xl font-bold text-[#1d1b20] dark:text-white tracking-tight">{selectedResult.id}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-full border font-medium flex items-center gap-2 ${getStatusColor(selectedResult.status)}`}>
                        {getStatusIcon(selectedResult.status)}
                        {selectedResult.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      <div>
                        <p className="text-sm text-[#49454f] dark:text-gray-300">Name</p>
                        <p className="font-medium text-[#1d1b20] dark:text-white">{selectedResult.details.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#49454f] dark:text-gray-300">Category</p>
                        <p className="font-medium text-[#1d1b20] dark:text-white">{selectedResult.details.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#49454f] dark:text-gray-300">T-Shirt Size</p>
                        <p className="font-medium text-[#1d1b20] dark:text-white">{selectedResult.details.tshirtSize}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#49454f] dark:text-gray-300">Phone</p>
                        <p className="font-medium text-[#1d1b20] dark:text-white">{selectedResult.details.phone}</p>
                      </div>
                    </div>

                    {selectedResult.status === 'Confirmed' && (
                      <div className="bg-[#f8f9ff] dark:bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-[#e1e2ec] dark:border-gray-700">
                        <div className="mb-4">
                          <RegistrationQRCode registrationId={selectedResult.id} size={150} />
                        </div>
                        <h4 className="font-bold text-[#1d1b20] dark:text-white mb-1">Your Entry Pass is Ready</h4>
                        <p className="text-sm text-[#49454f] dark:text-gray-300">Show this QR code at the registration desk on the day of the event.</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {searched && !isSearching && results && results.length === 0 && (
                <motion.div
                  key="no-result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 text-sm text-red-600 font-medium bg-red-50 p-4 rounded-xl border border-red-100"
                >
                  No registration found for this phone number or Registration ID. Please check the details and try again.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* 1. About WalkAlong */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-24 items-center">
        <div>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] dark:text-white mb-6">About WalkAlong</h2>
          <div className="space-y-6 text-lg xl:text-xl text-[#49454f] dark:text-gray-300 leading-relaxed">
            <p>
              WalkAlong is Yi Chennai's flagship annual inclusive walkathon. It aims to build a more inclusive society by walking side-by-side with Persons with Disabilities (PwD). It's more than just a walk; it's a movement to break down barriers, create awareness, and foster meaningful connections.
            </p>
            <p>
              Through this event, we celebrate the spirit of inclusivity and work towards making Chennai a barrier-free city for everyone. Join us as we take a step towards a brighter, more inclusive future.
            </p>
          </div>
        </div>
        <div className="aspect-[4/3] lg:aspect-video bg-[#f3edf7] dark:bg-purple-900/30 rounded-[32px] overflow-hidden border border-[#eaddff] relative group">
          <GalleryImage src="/627A0987.JPG" alt="WalkAlong Event" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6750a4]/10 to-transparent"></div>
        </div>
      </section>

      {/* 2. Event Highlights */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] dark:text-white">Event Highlights</h2>
          <p className="text-[#49454f] dark:text-gray-300 text-xl">Experience a morning filled with joy, inclusivity, and community spirit.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {[
            { icon: <Heart className="w-8 h-8" />, title: "Inclusive Walk", desc: "Walking side-by-side with Persons with Disabilities." },
            { icon: <Music className="w-8 h-8" />, title: "Entertainment", desc: "Live music, cultural performances, and activities." },
            { icon: <Award className="w-8 h-8" />, title: "Certificates", desc: "E-certificates for all registered participants." },
            { icon: <Coffee className="w-8 h-8" />, title: "Refreshments", desc: "Complimentary breakfast and hydration points." }
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[32px] border border-[#e1e2ec] dark:border-gray-700 hover:border-[#6750a4] hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-2xl bg-[#fef7ff] text-[#6750a4] flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white mb-3">{item.title}</h3>
              <p className="text-base text-[#49454f] dark:text-gray-300 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Accessibility Features */}
      <section className="bg-[#f8f9ff] dark:bg-gray-800/50 rounded-[32px] p-10 lg:p-16 xl:p-20 border border-[#e1e2ec] dark:border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 lg:p-20 opacity-5 pointer-events-none">
          <Accessibility className="w-64 h-64 lg:w-96 lg:h-96" />
        </div>
        <div className="relative z-10">
          <div className="max-w-3xl mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] dark:text-white mb-4">Accessibility First</h2>
            <p className="text-[#49454f] dark:text-gray-300 text-xl">We ensure the event is fully accessible and comfortable for everyone.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <MapPin className="w-6 h-6" />, title: "Wheelchair Accessible", desc: "Fully paved routes and accessible washrooms available throughout the venue." },
              { icon: <MessageCircle className="w-6 h-6" />, title: "Sign Language", desc: "Sign language interpreters available at the main stage and registration desks." },
              { icon: <Shield className="w-6 h-6" />, title: "Medical Support", desc: "Dedicated medical teams and resting zones stationed along the route." }
            ].map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-14 h-14 rounded-full bg-[#eaddff] text-[#21005d] flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white mb-2">{item.title}</h3>
                  <p className="text-base text-[#49454f] dark:text-gray-300 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* 4. Partners & Sponsors */}
      <section className="space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] dark:text-white">Our Partners</h2>
          <p className="text-[#49454f] dark:text-gray-300 text-xl">Supported by organizations committed to creating an inclusive society.</p>
        </div>
        
        <div className="space-y-12">
          {/* Title Partner */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e] dark:text-gray-400 uppercase tracking-widest text-center mb-8">Title Partner</h3>
            <div className="flex justify-center">
              <div className="w-72 h-36 bg-white dark:bg-gray-800 rounded-3xl border border-[#cac4d0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden p-2 hover:shadow-md transition-shadow">
                <img src="/partners/dalmia.png" alt="Dalmia" className="max-w-full max-h-full object-contain scale-[1.3]" />
              </div>
            </div>
          </div>

          {/* Gold Partners */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e] dark:text-gray-400 uppercase tracking-widest text-center mb-6">Gold Partners</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="w-48 h-24 bg-white dark:bg-gray-800 rounded-xl border border-[#cac4d0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <img src="/partners/armoraa.png" alt="Armora" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white dark:bg-gray-800 rounded-xl border border-[#cac4d0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <img src="/partners/lotte.png" alt="Lotte" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white dark:bg-gray-800 rounded-xl border border-[#cac4d0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <img src="/partners/pepero.png" alt="Pepero" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white dark:bg-gray-800 rounded-xl border border-[#cac4d0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden p-2 hover:shadow-md transition-shadow">
                <img src="/partners/rams.png" alt="RAMS" className="max-w-full max-h-full object-contain scale-[1.3]" />
              </div>
            </div>
          </div>

          {/* Support Partners */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e] dark:text-gray-400 uppercase tracking-widest text-center mb-6">Support Partner</h3>
            <div className="flex justify-center">
              <div className="w-48 h-24 bg-white dark:bg-gray-800 rounded-xl border border-[#cac4d0] dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <img src="/partners/tamil_matrimony.png" alt="Tamil Matrimony" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Previous Event Gallery */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] dark:text-white mb-4">Moments of Joy</h2>
            <p className="text-[#49454f] dark:text-gray-300 text-xl">Glimpses from our previous editions.</p>
          </div>
          <Link to="/gallery" className="w-full sm:w-auto"><Button variant="outline" className="w-full border-[#79747e] text-[#49454f] dark:text-gray-300 hover:bg-[#6750a4]/6 hover:text-[#6750a4]">View All Photos</Button></Link>
        </div>
        <GallerySlideshow />
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] dark:text-white">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {[
            { q: "Is there a registration fee?", a: "Yes, WalkAlong is free to participate only for People with Disabilities." },
            { q: "Can I register on the spot?", a: "No, Spot registrations are not available. We strongly encourage registering online beforehand." },
            { q: "Are T-shirts provided?", a: "Yes, complimentary T-shirts will be provided to all registered participants on a first-come, first-served basis at the venue." },
            { q: "Where can I park my vehicle?", a: "Designated parking areas are available near the venue. Detailed maps will be shared via email closer to the event date." }
          ].map((faq, i) => (
            <details key={i} className="group bg-white dark:bg-[#1e1e1e] border border-[#cac4d0] dark:border-gray-700 rounded-3xl [&_summary::-webkit-details-marker]:hidden hover:border-[#6750a4] transition-colors">
              <summary className="flex items-center justify-between cursor-pointer p-8 font-bold text-[#1d1b20] dark:text-white text-lg">
                {faq.q}
                <span className="transition group-open:rotate-180 text-[#49454f] dark:text-gray-300">
                  <ChevronDown className="w-6 h-6" />
                </span>
              </summary>
              <div className="px-8 pb-8 text-[#49454f] dark:text-gray-300 leading-relaxed text-base">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 7. Contact Information */}
      <section className="bg-[#1d1b20] text-white rounded-[40px] p-10 lg:p-16 xl:p-20 overflow-hidden relative">
        <div className="absolute -bottom-32 -right-32 opacity-[0.03] pointer-events-none">
          <Globe className="w-[600px] h-[600px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
          <div className="space-y-8 flex flex-col justify-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">Get in touch</h2>
            <p className="text-[#cac4d0] text-xl max-w-md leading-relaxed">Have questions about registration, sponsorships, or volunteering? We're here to help.</p>
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-[#322f35] flex items-center justify-center shrink-0">
  <CircleUserRound className="w-6 h-6 text-[#d0bcff]" />
</div>

<div>
  <div className="text-base text-[#cac4d0] mb-1">Chapter Chairs</div>

  <div className="font-bold text-lg">
    Mr. Tobin Jose
    <span className="font-normal text-[#cac4d0] text-base"> — Chapter Chair</span>
  </div>

  <div className="font-bold text-lg">
    Mr. Pradeep
    <span className="font-normal text-[#cac4d0] text-base"> — Chapter Co-Chair</span>
  </div>
</div>
</div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-[#322f35] flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-[#d0bcff]" />
                </div>
                <div>
                  <div className="text-base text-[#cac4d0] mb-1">Call us</div>
                  <div className="font-bold text-lg">+91 98765 43210</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full bg-[#322f35] flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-[#d0bcff]" />
                </div>
                <div>
                  <div className="text-base text-[#cac4d0] mb-1">Email us</div>
                  <div className="font-bold text-lg">hello@walkalong.org</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#322f35] rounded-[32px] p-10 border border-[#49454f] flex flex-col justify-center">
            <h3 className="font-bold text-2xl mb-8 text-white">Event Organized By</h3>
            <div className="space-y-6 text-[#cac4d0]">
              <p className="font-bold text-white text-xl">Young Indians (Yi) Chennai</p>
              <div className="pt-6 flex gap-4">
                <Button variant="outline" className="border-[#cac4d0] dark:border-gray-700 text-white hover:bg-white dark:bg-[#1e1e1e] hover:text-[#1d1b20] dark:text-white h-12 px-8 text-base">Visit Website</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}