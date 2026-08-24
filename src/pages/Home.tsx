import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, User, Calendar, MapPin, Clock, Heart, Music, Award, Coffee, Activity, Accessibility, Shield, MessageCircle, ChevronDown, Phone, Mail, Globe, Search, CheckCircle, QrCode, Loader2, Info, CircleUserRound  } from 'lucide-react';


import { GALLERY_IMAGES, GalleryImage } from '../components/GalleryImage';
import { GallerySlideshow } from '../components/GallerySlideshow';
import { SafeImage } from '../components/ui/SafeImage';
import { Link } from 'react-router-dom';


const HeroBanner = () => (
  <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 overflow-hidden relative mt-2 mb-4 lg:mb-6 w-full">
    {/* Top 4 logos */}
    <div className="w-full max-w-5xl flex flex-wrap justify-center items-center gap-6 sm:gap-12 lg:gap-16 px-4 lg:px-8">
      <SafeImage src="/partners/yi-logo.jpeg?v=3" fallbackSrcs={['/Yi Logo.jpg.jpeg', '/Yi.png']} alt="Yi Logo" className="h-8 sm:h-12 lg:h-16 w-auto object-contain mix-blend-multiply" />
      <SafeImage src="/partners/theme-2026.jpeg?v=3" fallbackSrcs={['/2026 Theme logo_White.jpeg']} alt="One Bharat Spirit" className="h-8 sm:h-12 lg:h-16 w-auto object-contain mix-blend-multiply" />
      <SafeImage src="/partners/chennai-day.png" fallbackSrcs={['/Chennai day logo.png']} alt="Chennai Day" className="h-8 sm:h-12 lg:h-16 w-auto object-contain mix-blend-multiply" />
      <SafeImage src="/partners/cii.jpeg" fallbackSrcs={['/CII logo blue JPG.jpg.jpeg']} alt="CII Logo" className="h-8 sm:h-12 lg:h-16 w-auto object-contain mix-blend-multiply" />
    </div>

    {/* Dalmia */}
    <div className="pt-1 sm:pt-2">
      <SafeImage src="/partners/dalmia.png" fallbackSrcs={['/dalmia.jpg']} alt="Dalmia Bharat Cement" className="h-20 sm:h-28 lg:h-36 w-auto object-contain mix-blend-multiply" />
    </div>

    {/* Presents */}
    <div className="flex items-center justify-center w-full max-w-[200px] sm:max-w-[250px]">
      <div className="flex-grow h-px bg-[#49454f]/30"></div>
      <span className="px-3 text-[10px] sm:text-xs font-bold text-[#49454f] tracking-[0.2em] uppercase">Presents</span>
      <div className="flex-grow h-px bg-[#49454f]/30"></div>
    </div>

    {/* WalkAlong */}
    <div className="pb-0">
      <SafeImage src="/partners/walkalong.png" fallbackSrcs={['/Untitled design.png']} alt="Walk Along" className="h-14 sm:h-20 lg:h-24 w-auto object-contain mix-blend-multiply" />
    </div>
  </div>
);

export function Home() {
  const navigate = useNavigate();

  const registrationCards = (
    <div className="flex flex-col gap-6">
      <div 
        onClick={() => navigate('/register/individual')}
        className="bg-white  rounded-[32px] p-6 shadow-sm border border-[#e1e2ec]  hover:border-[#6750a4] hover:bg-[#fef7ff]  transition-all cursor-pointer group"
      >
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f3edf7]  group-hover:bg-[#eaddff] flex items-center justify-center text-[#6750a4] transition-colors shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1d1b20] ">Registration</h3>
              <span className="text-[#6750a4] font-bold text-xl">→</span>
            </div>
            <p className="text-sm text-[#49454f]  mt-1">
              For PWD and Yi Members.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50  border border-blue-200  rounded-2xl p-4 flex gap-3 items-start sm:items-center">
        <Info className="w-5 h-5 text-blue-600  shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-blue-800  font-medium">
          Registrations for other categories will be opened soon.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-16 pb-24">
      <div className="space-y-4 lg:space-y-8">
        <HeroBanner />
        {/* Hero & Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20">
          {/* Hero & Info Section */}
          <section className="lg:col-span-7 flex flex-col justify-start gap-10 lg:pt-4">
          <div className="space-y-6 order-3 lg:order-1">
            <h1 className="text-5xl lg:text-7xl xl:text-[80px] font-bold leading-[1.05] text-[#21005d]  tracking-tight">
              Step Towards <br />
              <span className="text-[#6750a4] ">Inclusivity.</span>
            </h1>
            <p className="text-lg lg:text-xl text-[#49454f]  max-w-xl leading-relaxed">
              Join us for the Yi Chennai WalkAlong. A collective stride to foster awareness, support, and friendship with Persons with Disabilities.
            </p>
          </div>

          {/* Mobile Registration Cards */}
          <div className="block lg:hidden order-1">
            {registrationCards}
          </div>

          <div className="bg-white  p-5 sm:p-8 rounded-3xl sm:rounded-[32px] border border-[#cac4d0]  shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#cac4d0]  order-2 lg:order-2">
            <div className="pb-4 sm:pb-0 sm:pr-4">
              <div className="text-[#6750a4] mb-2 sm:mb-4">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-sm text-[#49454f]  font-medium mb-1">Event Schedule</div>
              <div className="text-base sm:text-lg font-bold text-[#1d1b20]  leading-tight">
                06 September 2026<br />
                07:00 AM IST
              </div>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-4">
              <div className="text-[#6750a4] mb-2 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-sm text-[#49454f]  font-medium mb-1">Venue</div>
              <div className="text-base sm:text-lg font-bold text-[#1d1b20] ">Marina Beach</div>
            </div>
          </div>
        </section>

        {/* Registration Action Cards */}
        <section className="lg:col-span-5 flex flex-col justify-start gap-6 lg:pt-4">
          {/* Desktop Registration Cards */}
          <div className="hidden lg:block">
            {registrationCards}
          </div>

        </section>
      </div>
      </div>

      {/* 3. Accessibility Features */}
      <section className="bg-[#f8f9ff]  rounded-[32px] p-10 lg:p-16 xl:p-20 border border-[#e1e2ec]  relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 lg:p-20 opacity-5 pointer-events-none">
          <Accessibility className="w-64 h-64 lg:w-96 lg:h-96" />
        </div>
        <div className="relative z-10">
          <div className="max-w-3xl mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20]  mb-4">Accessibility First</h2>
            <p className="text-[#49454f]  text-xl">We ensure the event is fully accessible and comfortable for everyone.</p>
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
                  <h3 className="text-xl font-bold text-[#1d1b20]  mb-2">{item.title}</h3>
                  <p className="text-base text-[#49454f]  leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* 4. Partners & Sponsors */}
      <section className="space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] ">Our Partners</h2>
          <p className="text-[#49454f]  text-xl">Supported by organizations committed to creating an inclusive society.</p>
        </div>
        
        <div className="space-y-12">
          {/* Title Partner */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e]  uppercase tracking-widest text-center mb-8">Title Partner</h3>
            <div className="flex justify-center">
              <div className="w-72 h-36 bg-white  rounded-3xl border border-[#cac4d0]  flex items-center justify-center shadow-sm overflow-hidden p-2 hover:shadow-md transition-shadow">
                <SafeImage src="/partners/dalmia.png" fallbackSrcs={['/dalmia.jpg']} alt="Dalmia" className="max-w-full max-h-full object-contain scale-[1.3]" />
              </div>
            </div>
          </div>

          {/* Gold Partners */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e]  uppercase tracking-widest text-center mb-6">Gold Partners</h3>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="w-48 h-24 bg-white  rounded-xl border border-[#cac4d0]  flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <SafeImage src="/partners/armoraa.png" fallbackSrcs={['/armoraa.png']} alt="Armora" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white  rounded-xl border border-[#cac4d0]  flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <SafeImage src="/partners/lotte.png" fallbackSrcs={['/lotte.png']} alt="Lotte" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white  rounded-xl border border-[#cac4d0]  flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <SafeImage src="/partners/pepero.png" fallbackSrcs={['/pepero.png']} alt="Pepero" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="w-48 h-24 bg-white  rounded-xl border border-[#cac4d0]  flex items-center justify-center shadow-sm overflow-hidden p-2 hover:shadow-md transition-shadow">
                <SafeImage src="/partners/rams.png" fallbackSrcs={['/RAMS.png']} alt="RAMS" className="max-w-full max-h-full object-contain scale-[1.3]" />
              </div>
            </div>
          </div>

          {/* Support Partners */}
          <div>
            <h3 className="text-sm font-bold text-[#79747e]  uppercase tracking-widest text-center mb-6">Support Partner</h3>
            <div className="flex justify-center">
              <div className="w-48 h-24 bg-white  rounded-xl border border-[#cac4d0]  flex items-center justify-center shadow-sm overflow-hidden p-4 hover:shadow-md transition-shadow">
                <SafeImage src="/partners/tamil_matrimony.png" fallbackSrcs={['/tamil_matrimony.png']} alt="Tamil Matrimony" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Previous Event Gallery */}
      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20]  mb-4">Moments of Joy</h2>
            <p className="text-[#49454f]  text-xl">Glimpses from our previous editions.</p>
          </div>
          <Link to="/gallery" className="w-full sm:w-auto"><Button variant="outline" className="w-full border-[#79747e] text-[#49454f]  hover:bg-[#6750a4]/6 hover:text-[#6750a4]">View All Photos</Button></Link>
        </div>
        <GallerySlideshow />
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1d1b20] ">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {[
            { q: "Is there a registration fee?", a: "Yes, WalkAlong is free to participate only for People with Disabilities." },
            { q: "Can I register on the spot?", a: "No, Spot registrations are not available. We strongly encourage registering online beforehand." },
            { q: "Are T-shirts provided?", a: "Yes, complimentary T-shirts will be provided to all registered participants on a first-come, first-served basis at the venue." },
            { q: "Where can I park my vehicle?", a: "Designated parking areas are available near the venue. Detailed maps will be shared via email closer to the event date." }
          ].map((faq, i) => (
            <details key={i} className="group bg-white  border border-[#cac4d0]  rounded-3xl [&_summary::-webkit-details-marker]:hidden hover:border-[#6750a4] transition-colors">
              <summary className="flex items-center justify-between cursor-pointer p-8 font-bold text-[#1d1b20]  text-lg">
                {faq.q}
                <span className="transition group-open:rotate-180 text-[#49454f] ">
                  <ChevronDown className="w-6 h-6" />
                </span>
              </summary>
              <div className="px-8 pb-8 text-[#49454f]  leading-relaxed text-base">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}