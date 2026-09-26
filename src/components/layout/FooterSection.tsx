import React, { useState } from 'react';
import { MapPin, ArrowUpRight, ShieldCheck, Lock, Scale } from 'lucide-react';
import { LegalPolicyModal } from '../common/LegalPolicyModal';

interface FooterSectionProps {
  setActiveTab: (tab: string) => void;
  setSelectedCity: (city: string) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  setActiveTab,
  setSelectedCity,
}) => {
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <>
      <footer className="bg-[#1A2225] text-[#E0DFC8] border-t border-[#39464A] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand Col */}
            <div className="md:col-span-1 space-y-4">
              <span className="font-outfit text-3xl font-bold tracking-tight text-[#FFF9E9] block">
                Habi
              </span>
              <p className="text-[#B9BCA8] text-sm leading-relaxed font-sans">
                Davao Region's digital fashion discovery platform & local marketplace.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#B9BCA8] pt-2">
                <MapPin className="w-4 h-4 text-[#FFF9E9]" />
                <span>Davao Region, Philippines</span>
              </div>
            </div>

            {/* Davao Cities Directory */}
            <div className="space-y-3 text-sm">
              <div className="text-xs uppercase tracking-wider text-[#FFF9E9] font-semibold">
                Explore Cities
              </div>
              <ul className="space-y-2 text-[#E0DFC8]">
                {['Davao City', 'Tagum City', 'Digos City', 'Panabo City', 'Mati City', 'Samal Island'].map((city) => (
                  <li key={city}>
                    <button
                      onClick={() => {
                        setSelectedCity(city);
                        setActiveTab('feed');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#FFF9E9] transition-colors flex items-center gap-1 group text-sm cursor-pointer"
                    >
                      <span>{city}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aesthetic Styles */}
            <div className="space-y-3 text-sm">
              <div className="text-xs uppercase tracking-wider text-[#FFF9E9] font-semibold">
                Style Aesthetics
              </div>
              <ul className="space-y-2 text-[#E0DFC8]">
                {['Streetwear', 'Vintage Denim', 'Y2K Archives', 'Techwear', 'Gorpcore Outerwear', 'Workwear'].map((style) => (
                  <li key={style}>
                    <button
                      onClick={() => {
                        setActiveTab('discover');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#FFF9E9] transition-colors text-sm cursor-pointer"
                    >
                      {style}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Local Creator & Seller Links */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-[#FFF9E9] font-semibold">
                Local Creators
              </div>
              <p className="text-[#B9BCA8] text-sm leading-relaxed font-sans">
                Sell thrift finds or launch collection drops on Habi.
              </p>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFF9E9] text-[#1A2225] font-semibold text-xs rounded-full hover:bg-[#F2F7BF] transition-colors shadow-sm cursor-pointer"
              >
                <span>Join as Davao Seller</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Bar with Mandatory Legal & Privacy Disclosures */}
          <div className="mt-16 pt-8 border-t border-[#39464A] flex flex-col sm:flex-row items-center justify-between text-xs text-[#B9BCA8] gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFF9E9]" />
              <span>Habi Davao Fashion Discovery. Registered Davao Reseller Network.</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => openLegalModal('privacy')}
                className="hover:text-[#FFF9E9] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </button>

              <span className="text-[#39464A]">•</span>

              <button
                onClick={() => openLegalModal('terms')}
                className="hover:text-[#FFF9E9] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Terms of Service</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Disclosures Modal */}
      <LegalPolicyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </>
  );
};

