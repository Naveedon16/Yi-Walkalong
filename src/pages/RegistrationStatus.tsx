import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusService } from '../services';
import { RegistrationStatus as RegistrationStatusType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Activity, CheckCircle, QrCode, Loader2 } from 'lucide-react';
import { RegistrationQRCode } from '../components/RegistrationQRCode';
import { toCanvas } from 'html-to-image';

export function RegistrationStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('query') || '';
  
  const [query, setQuery] = useState(urlQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<RegistrationStatusType[] | null>(null);
  const [selectedResult, setSelectedResult] = useState<RegistrationStatusType | null>(null);
  const [searched, setSearched] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoFetched = useRef(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);

  
  useEffect(() => {
    if (!isSearching && (selectedResult || (results && results.length > 0))) {
      setTimeout(() => {
        resultContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isSearching, selectedResult, results]);
  
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
    };
  }, []);


  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    setSearched(true);
    setResults(null);
    setSelectedResult(null);
    
    // Update URL without navigation to keep state clean
    setSearchParams({ query: searchQuery.trim() }, { replace: true });

    try {
      const data = await StatusService.checkStatus(searchQuery.trim());
      if (data.type === 'institution') {
                setResults(null);
        setSelectedResult(null);
      } else if (data.type === 'institution_multiple') {
                    setResults(null);
        setSelectedResult(null);
      } else {
                        setResults(data.statuses || []);
        if (data.statuses && data.statuses.length === 1) {
          setSelectedResult(data.statuses[0]);
        }
      }
    } catch (error) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (urlQuery && !hasAutoFetched.current) {
      hasAutoFetched.current = true;
      performSearch(urlQuery);
    }
  }, [urlQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };
  
  
  const handleDownload = async () => {
    const passElement = document.getElementById('registration-pass');
    if (!passElement) return;

    try {
      // Create a clone to fix any responsive/layout issues during capture if needed, 
      // but html2canvas directly works well if the container is visible.
      // We'll temporarily hide elements that shouldn't be printed/downloaded
      const hideElements = passElement.querySelectorAll('.print-hide, button');
      const originalDisplay = Array.from(hideElements).map(el => (el as HTMLElement).style.display);
      hideElements.forEach(el => (el as HTMLElement).style.display = 'none');

      const canvas = await toCanvas(passElement, {
        pixelRatio: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1e1e1e' : '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.dataset?.html2canvasIgnore === 'true') return false;
          }
          return true;
        }
      });

      // Restore elements
      hideElements.forEach((el, index) => (el as HTMLElement).style.display = originalDisplay[index]);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `walkalong-pass-${selectedResult?.id || 'entry'}.jpg`;
        link.href = url;
        link.click();
        
        // Add a small delay before revoking to ensure mobile browsers start the download
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Failed to generate pass image', error);
      alert('Failed to download pass. Please try again or use the Print Pass option.');
    }
  };

  const handleSearchAgain = () => {
    setQuery('');
    setSearched(false);
    setResults(null);
    setSelectedResult(null);
        setSearchParams({}, { replace: true });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
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
    <div className="max-w-2xl mx-auto w-full">
      <div className="text-center mb-10 print:hidden">
        <h1 className="text-3xl font-bold text-[#1d1b20] dark:text-white mb-4">View Registration Pass</h1>
        <p className="text-[#49454f] dark:text-gray-300">Enter your Registration ID, Phone, Institution ID or Institution Name to view your entry pass.</p>
      </div>

      <Card className="mb-8 border-[#cac4d0] dark:border-gray-700 print:hidden">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input 
            ref={inputRef}
            placeholder="Registration ID, Phone, Institution ID or Name" 
            className="flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <Button type="submit" disabled={isSearching} className="gap-2 sm:w-auto w-full">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </Button>
        </form>
        
      </Card>

      <div ref={resultContainerRef}>
        <AnimatePresence mode="wait">
          {isSearching && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-[#cac4d0] dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-[#e1e2ec] dark:border-gray-700">
                <div className="w-full">
                  <div className="h-4 bg-gray-200 rounded-md animate-pulse w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded-md animate-pulse w-48"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-full animate-pulse w-32"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {[1,2,3,4].map(i => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded-md animate-pulse w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded-md animate-pulse w-32"></div>
                  </div>
                ))}
              </div>
              <div className="bg-[#f8f9ff] dark:bg-gray-800/50 rounded-2xl p-6 flex flex-col items-center justify-center border border-[#e1e2ec] dark:border-gray-700">
                <div className="w-24 h-24 bg-gray-200 rounded-xl animate-pulse mb-4"></div>
                <div className="h-5 bg-gray-200 rounded-md animate-pulse w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-56 mb-4"></div>
                <div className="flex gap-3">
                  <div className="h-9 bg-gray-200 rounded-md animate-pulse w-24"></div>
                  <div className="h-9 bg-gray-200 rounded-md animate-pulse w-32"></div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {searched && !isSearching && false && 0 > 0 && (
          <motion.div
            key="multiple-institutions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-[#cac4d0] dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white mb-4">{0} Institutions Found</h3>
              <p className="text-sm text-[#49454f] dark:text-gray-300 mb-6">Select the correct institution to view its participants.</p>
              
              <div className="space-y-4">
                {([].map)((inst: any) => (
                  <div 
                    key={inst.institutionId} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#e1e2ec] dark:border-gray-700 hover:bg-[#f8f9ff] dark:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => performSearch(inst.institutionId)}
                  >
                    <div className="mb-4 sm:mb-0">
                      <div className="font-bold text-[#1d1b20] dark:text-white text-lg">{inst.institutionName || 'Unknown Institution'}</div>
                      <div className="text-sm text-[#49454f] dark:text-gray-300 font-mono mb-1">{inst.institutionId}</div>
                      <div className="text-sm text-[#49454f] dark:text-gray-300">Coordinator: {inst.coordinatorName || 'N/A'}</div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <div className="text-sm font-medium bg-[#f1f3f4] dark:bg-gray-800 px-3 py-1 rounded-full">
                        {inst.participantCount} Participants
                      </div>
                      <Button variant="outline" size="sm">Select</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button variant="outline" onClick={handleSearchAgain}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
        {searched && !isSearching && results && results.length > 1 && !selectedResult && (
          <motion.div
            key="results-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-[#cac4d0] dark:border-gray-700">
              <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white mb-4">{results.length} registrations found</h3>
              <div className="space-y-4">
                {results.map(r => (
                  <div 
                    key={r.id} 
                    className="flex items-center justify-between p-4 rounded-xl border border-[#e1e2ec] dark:border-gray-700 hover:bg-[#f8f9ff] dark:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedResult(r)}
                  >
                    <div>
                      <div className="font-bold text-[#1d1b20] dark:text-white text-lg">{r.details.name}</div>
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
          >
            <Card id="registration-pass" className="border-t-4 border-t-[#6750a4] registration-pass bg-white dark:bg-[#1e1e1e]">
              {results && results.length > 1 && (
                <button 
                  onClick={() => setSelectedResult(null)}
                  className="text-sm font-medium text-[#6750a4] mb-4 hover:underline flex items-center gap-1 print:hidden"
                  data-html2canvas-ignore="true"
                >
                  ← Back to results
                </button>
              )}
              
              <div className="flex flex-col items-center justify-center mb-6 pb-6 border-b border-[#e1e2ec] dark:border-gray-700">
                 <h2 className="text-2xl font-black text-[#6750a4] uppercase tracking-wider">Yi WalkAlong 2026</h2>
                 <p className="text-sm text-[#49454f] dark:text-gray-300 mt-1">Official Registration Pass</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-[#e1e2ec] dark:border-gray-700">
                <div>
                  <p className="text-sm text-[#49454f] dark:text-gray-300 mb-1">Registration ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-[#1d1b20] dark:text-white tracking-tight">{selectedResult.id}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(selectedResult.id);
                        setLiveAnnouncement('Registration ID copied to clipboard');
                      }}
                      className="text-xs text-[#6750a4] hover:underline"
                      aria-label="Copy Registration ID"
                    >
                      Copy
                    </button>
                  </div>
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
                  <div className="bg-white dark:bg-[#1e1e1e] p-3 rounded-xl shadow-sm mb-4">
                    <QrCode className="w-24 h-24 text-[#1d1b20] dark:text-white" />
                  </div>
                  <h4 className="font-bold text-[#1d1b20] dark:text-white mb-1">Your Entry Pass is Ready</h4>
                  
                  <div className="w-full max-w-md my-6 text-left border-t border-[#e1e2ec] dark:border-gray-700 pt-6">
                    <h5 className="font-bold text-[#1d1b20] dark:text-white mb-4">How to check in</h5>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#eaddff] dark:bg-gray-700 text-[#6750a4] dark:text-gray-300 flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <p className="font-medium text-[#1d1b20] dark:text-white text-sm">Keep your pass ready</p>
                          <p className="text-sm text-[#49454f] dark:text-gray-400">Show this QR code when you arrive at the event.</p>
                          <div className="mt-4">
                            <RegistrationQRCode registrationId={selectedResult.id} size={150} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#79747e] dark:text-gray-500 mt-4 italic text-center">Keep your registration pass accessible on your phone for faster check-in.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-3 print:hidden" data-html2canvas-ignore="true">
                    <Button size="sm" variant="outline" onClick={handleSearchAgain}>Search Again</Button>
                    <Button size="sm" variant="primary" className="bg-[#6750a4]" onClick={handleDownload}>Download Pass</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowPrintConfirm(true)} aria-label="Print registration pass" id="print-pass-btn">Print Pass</Button>
                  </div>
                  <p className="text-xs text-[#79747e] dark:text-gray-400 print:hidden" data-html2canvas-ignore="true">Tip: If pass images are missing when printing, enable 'Background Graphics' in your browser's print settings.</p>
                </div>
              )}
              {selectedResult.status !== 'Confirmed' && (
                <div className="mt-8 flex justify-center">
                  <Button size="sm" variant="outline" onClick={handleSearchAgain}>Search Again</Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {searched && !isSearching && false && (
          <motion.div
            key="institution-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-[#cac4d0] dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-[#e1e2ec] dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-bold text-[#1d1b20] dark:text-white">Institution Registration</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-[#49454f] dark:text-gray-300">Institution ID: {""}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText("");
                        setLiveAnnouncement('Institution ID copied to clipboard');
                      }}
                      className="text-xs text-[#6750a4] hover:underline"
                      aria-label="Copy Institution ID"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1d1b20] dark:text-white">Total Participants: {0}</p>
                  <p className="text-xs text-[#79747e] dark:text-gray-400 mt-1">Registered: {new Date("").toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-[#49454f] dark:text-gray-300">
                  <thead className="text-xs text-[#1d1b20] dark:text-white uppercase bg-[#f1f3f4] dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-md">Name</th>
                      <th className="px-4 py-3">Age</th>
                      <th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">T-Shirt Size</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-tr-md">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[].map((p: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#e1e2ec] dark:border-gray-700 hover:bg-[#f8f9ff] dark:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1d1b20] dark:text-white">{p.name}</td>
                        <td className="px-4 py-3">{p.age}</td>
                        <td className="px-4 py-3">{p.gender}</td>
                        <td className="px-4 py-3">{p.phone}</td>
                        <td className="px-4 py-3">{p.email}</td>
                        <td className="px-4 py-3">{p.tshirtSize}</td>
                        <td className="px-4 py-3">
                          <span className="bg-[#f1f3f4] dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-medium">{p.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status || 'Confirmed')}`}>
                            {p.status || 'Confirmed'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline" onClick={() => {
                                                        setSelectedResult({ id: p.registrationId, status: p.status || 'Confirmed', details: p });
                          }}>View Pass</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="md:hidden space-y-4">
                {[].map((p: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-[#1e1e1e] border border-[#e1e2ec] dark:border-gray-700 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-[#1d1b20] dark:text-white">{p.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status || 'Confirmed')}`}>
                        {p.status || 'Confirmed'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
                      <div><span className="text-[#79747e] dark:text-gray-400 text-xs block">Age/Gender</span><span className="text-[#49454f] dark:text-gray-300">{p.age} / {p.gender}</span></div>
                      <div><span className="text-[#79747e] dark:text-gray-400 text-xs block">T-Shirt</span><span className="text-[#49454f] dark:text-gray-300">{p.tshirtSize}</span></div>
                      <div><span className="text-[#79747e] dark:text-gray-400 text-xs block">Phone</span><span className="text-[#49454f] dark:text-gray-300">{p.phone || '-'}</span></div>
                      <div><span className="text-[#79747e] dark:text-gray-400 text-xs block">Category</span><span className="bg-[#f1f3f4] dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-medium inline-block mt-0.5">{p.category}</span></div>
                    </div>
                    {p.email && (
                      <div className="text-sm"><span className="text-[#79747e] dark:text-gray-400 text-xs block">Email</span><span className="text-[#49454f] dark:text-gray-300 truncate block">{p.email}</span></div>
                    )}
                    <div className="mt-3">
                      <Button size="sm" variant="outline" className="w-full" onClick={() => {
                                                setSelectedResult({ id: p.registrationId, status: p.status || 'Confirmed', details: p });
                      }}>View Pass</Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={handleSearchAgain}>Search Again</Button>
              </div>
            </Card>
          </motion.div>
        )}
        
        {searched && !isSearching && results && results.length === 0 && (
          <motion.div
            key="no-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="text-center py-12 border-[#cac4d0] dark:border-gray-700">
              <div className="w-16 h-16 rounded-full bg-[#f1f3f4] dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#79747e] dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-2">No Registration Found</h3>
              <p className="text-[#49454f] dark:text-gray-300 mb-6">We couldn't find any registration matching "{query}". Please check the ID or Phone Number and try again.</p>
              <Button variant="outline" onClick={handleSearchAgain}>Search Again</Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>
    
      {/* Print Confirmation Dialog */}
      <AnimatePresence>
        {showPrintConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setShowPrintConfirm(false); setTimeout(() => document.getElementById('print-pass-btn')?.focus(), 10); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="print-dialog-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 id="print-dialog-title" className="text-xl font-bold text-[#1d1b20] dark:text-white mb-2">Ready to print?</h2>
                <p className="text-[#49454f] dark:text-gray-300 mb-6">Make sure your registration pass and QR code are visible before continuing.</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" autoFocus onClick={() => { setShowPrintConfirm(false); setTimeout(() => document.getElementById('print-pass-btn')?.focus(), 10); }}>Cancel</Button>
                  <Button variant="primary" className="bg-[#6750a4]" onClick={() => { setShowPrintConfirm(false); setTimeout(() => window.print(), 100); }}>Print pass</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}