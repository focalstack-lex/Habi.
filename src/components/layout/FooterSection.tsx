import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface FooterSectionProps {
  setActiveTab: (tab: string) => void;
  setSelectedCity: (city: string) => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  setActiveTab,
  setSelectedCity,
}) => {
  return (
    <footer className="bg-zinc-950 text-zinc-100 border-t border-zinc-800 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <span className="font-outfit text-3xl font-bold tracking-tight text-white block">
              Habi
            </span>
            <p className="text-zinc-400 text-sm leading-relaxed font-sans">
              Davao Region's digital fashion community, visual discovery platform, and local marketplace for independent clothing brands, thrift shops, and vintage sellers.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>Davao Region, Philippines</span>
            </div>
          </div>

          {/* Davao Cities Directory */}
          <div className="space-y-3 text-sm">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Explore Cities
            </div>
            <ul className="space-y-2 text-zinc-300">
              {['Davao City', 'Tagum City', 'Digos City', 'Panabo City', 'Mati City', 'Samal Island'].map((city) => (
                <li key={city}>
                  <button
                    onClick={() => {
                      setSelectedCity(city);
                      setActiveTab('feed');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors flex items-center gap-1 group text-sm"
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
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Style Aesthetics
            </div>
            <ul className="space-y-2 text-zinc-300">
              {['Streetwear', 'Vintage Denim', 'Y2K Archives', 'Techwear', 'Gorpcore Outerwear', 'Workwear'].map((style) => (
                <li key={style}>
                  <button
                    onClick={() => {
                      setActiveTab('discover');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors text-sm"
                  >
                    {style}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Local Creator & Seller Links */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Local Creators
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed font-sans">
              Are you a Davao thrift seller or local fashion brand? Create your storefront and schedule collection drops.
            </p>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-950 font-semibold text-xs rounded-full hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <span>Join as Davao Seller</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <div>
            Habi Davao Fashion Discovery. Designed for local creators.
          </div>
          <div className="flex items-center gap-6">
            <span>Discover local fashion. Discover local brands.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
