import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, User, Calendar, MapPin, Clock, Heart, Music, Award, Coffee, Activity, Accessibility, Shield, MessageCircle, ChevronDown, Phone, Mail, Globe, Search, CheckCircle, QrCode, Loader2, Info, CircleUserRound  } from 'lucide-react';


import { GALLERY_IMAGES, GalleryImage } from '../components/GalleryImage';
import { GallerySlideshow } from '../components/GallerySlideshow';
import { Link } from 'react-router-dom';


const HeroBanner = () => (
  <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-3 overflow-hidden relative mt-2 sm:mt-4 mb-4 lg:mb-8 w-full">
    {/* Top 4 logos */}
    <div className="w-full flex flex-wrap justify-center items-center gap-3 sm:gap-5 lg:gap-8 px-2">
      <img src="/partners/yi-logo.jpeg" alt="Yi Logo" className="w-20 h-10 sm:w-28 sm:h-12 lg:w-40 lg:h-16 object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:p-1.5 dark:rounded-lg" />
      <img src="/partners/theme-2026.jpeg" alt="One Bharat Spirit" className="w-20 h-10 sm:w-28 sm:h-12 lg:w-40 lg:h-16 object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:p-1.5 dark:rounded-lg" />
      <img src="/partners/chennai-day.png" alt="Chennai Day" className="w-20 h-10 sm:w-28 sm:h-12 lg:w-40 lg:h-16 object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:p-1.5 dark:rounded-lg" />
      <img src="/partners/cii.jpeg" alt="CII Logo" className="w-20 h-10 sm:w-28 sm:h-12 lg:w-40 lg:h-16 object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:p-1.5 dark:rounded-lg" />
    </div>

    {/* Dalmia */}
    <div className="pt-1">
      <img src="/partners/dalmia.png" alt="Dalmia Bharat Cement" className="h-14 sm:h-16 lg:h-20 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:p-2 dark:rounded-xl" />
    </div>

    {/* Presents */}
    <div className="flex items-center justify-center w-full max-w-[140px] sm:max-w-[180px]">
      <div className="flex-grow h-px bg-[#49454f]/30 dark:bg-gray-600"></div>
      <span className="px-3 text-[8px] sm:text-[10px] font-bold text-[#49454f] dark:text-gray-400 tracking-[0.3em] uppercase">Presents</span>
      <div className="flex-grow h-px bg-[#49454f]/30 dark:bg-gray-600"></div>
    </div>

    {/* WalkAlong */}
    <div className="pb-0">
      <img src="/partners/walkalong.png" alt="Walk Along" className="h-14 sm:h-16 lg:h-20 w-auto object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:p-2 dark:rounded-xl" />
    </div>
  </div>
);

export function Home() {
  const navigate = useNavigate();

  const registrationCards = (
    <div className="flex flex-col gap-6">
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
    </div>
  );

  return (
    <div className="space-y-32 pb-24">
      <div className="space-y-8 lg:space-y-12">
        <HeroBanner />
        {/* Hero & Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20">
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

          {/* Mobile Registration Cards */}
          <div className="block lg:hidden">
            {registrationCards}
          </div>

          <div className="bg-white dark:bg-[#1e1e1e] p-5 sm:p-8 rounded-3xl sm:rounded-[32px] border border-[#cac4d0] dark:border-gray-700 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#cac4d0] dark:divide-gray-700">
            <div className="pb-4 sm:pb-0 sm:pr-4">
              <div className="text-[#6750a4] mb-2 sm:mb-4">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-sm text-[#49454f] dark:text-gray-300 font-medium mb-1">Event Schedule</div>
              <div className="text-base sm:text-lg font-bold text-[#1d1b20] dark:text-white leading-tight">
                06 September 2026<br />
                07:30 AM IST
              </div>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <div className="text-[#6750a4] mb-2 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-sm text-[#49454f] dark:text-gray-300 font-medium mb-1">Venue</div>
              <div className="text-base sm:text-lg font-bold text-[#1d1b20] dark:text-white">Marina Beach</div>
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
        <section className="lg:col-span-5 flex flex-col justify-start lg:justify-center gap-6">
          {/* Desktop Registration Cards */}
          <div className="hidden lg:block">
            {registrationCards}
          </div>

        </section>
      </div>
      </div>

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
              <div className="w-72 h-36 bg-white dark:bg-white rounded-3xl border border-[#cac4d0] dark:border-[#cac4d0] flex items-center justify-center shadow-sm overflow-hidden p-2 hover:shadow-md transition-shadow">
                <img src="/partners/dalmia.png" alt="Dalmia" className="max-w-full max-h-full object-contain scale-[1.3]" />
              </div>
            </div>
          </div>

          {/* Gold Partners */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e] dark:text-gray-400 uppercase tracking-widest text-center mb-6">Gold Partners</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="w-48 h-24 bg-white dark:bg-white rounded-xl border border-[#cac4d0] dark:border-[#cac4d0] flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <img src="/partners/armoraa.png" alt="Armora" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white dark:bg-white rounded-xl border border-[#cac4d0] dark:border-[#cac4d0] flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <img src="/partners/lotte.png" alt="Lotte" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white dark:bg-white rounded-xl border border-[#cac4d0] dark:border-[#cac4d0] flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <img src="/partners/pepero.png" alt="Pepero" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white dark:bg-white rounded-xl border border-[#cac4d0] dark:border-[#cac4d0] flex items-center justify-center shadow-sm overflow-hidden p-2 hover:shadow-md transition-shadow">
                <img src="/partners/rams.png" alt="RAMS" className="max-w-full max-h-full object-contain scale-[1.3]" />
              </div>
            </div>
          </div>

          {/* Support Partners */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e] dark:text-gray-400 uppercase tracking-widest text-center mb-6">Support Partner</h3>
            <div className="flex justify-center">
              <div className="w-48 h-24 bg-white dark:bg-white rounded-xl border border-[#cac4d0] dark:border-[#cac4d0] flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
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
    </div>
  );
}