import React, { useState } from 'react';
import { ShieldCheck, X, Lock, Scale } from 'lucide-react';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-zinc-200/90 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-950 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-outfit text-xl font-bold text-zinc-950 tracking-tight">
                Habi Platform Legal Disclosures
              </h2>
              <p className="text-xs text-zinc-500 font-sans">
                Privacy Policy & Seller Community Terms of Service
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close legal policy modal"
            className="p-2 rounded-full hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-zinc-100 bg-white">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3.5 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'text-zinc-950 border-b-2 border-zinc-950 -mb-[1px]'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3.5 text-xs font-avantgarde font-bold tracking-widest uppercase transition-all relative cursor-pointer flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'text-zinc-950 border-b-2 border-zinc-950 -mb-[1px]'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-zinc-600 leading-relaxed font-sans">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="font-outfit text-lg font-bold text-zinc-950">
                Data Privacy Policy (Philippine DPA 2012 & Global Standards)
              </h3>
              <p>
                Habi respects your personal data privacy and is committed to protecting user information under the Philippine Data Privacy Act of 2012 (RA 10173).
              </p>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-zinc-900 text-sm">1. Information Collection & Usage</h4>
                <p className="text-xs text-zinc-600">
                  We collect local preferences, saved closet items, and optional direct seller inquiry information solely for facilitating transactions between Davao clothing buyers and independent sellers. We do not sell user data to third parties.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-zinc-900 text-sm">2. Local Storage & Cookies</h4>
                <p className="text-xs text-zinc-600">
                  Habi utilizes client-side LocalStorage to persist saved products, followed brand storefronts, and collection drop reminders. No persistent tracking cookies are deployed without user consent.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-zinc-900 text-sm">3. Buyer Rights</h4>
                <p className="text-xs text-zinc-600">
                  Users retain full rights to inspect, update, or clear saved data by clearing local browser cache or managing closet preferences within the app.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="font-outfit text-lg font-bold text-zinc-950">
                Terms of Service & E-Commerce Consumer Disclosures
              </h3>
              <p>
                By accessing Habi Davao Fashion Discovery, you agree to these platform guidelines governing community listings, seller storefronts, and 1-of-1 thrift inquiries.
              </p>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-zinc-900 text-sm">1. Independent Reseller Disclosures</h4>
                <p className="text-xs text-zinc-600">
                  Habi is a visual discovery directory and marketplace platform for independent Davao sellers. Brand names, logos, and trademarks featured on pre-owned garments belong strictly to their respective trademark owners. Sellers act as independent curated archive resellers.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-zinc-900 text-sm">2. 1-of-1 Thrift Return & Exchange Policy</h4>
                <p className="text-xs text-zinc-600">
                  Because thrift, vintage, and reworked garments are unique 1-of-1 pieces, all sales are final upon buyer confirmation with the seller, except when an item does not match stated condition descriptions. Buyers are encouraged to inspect detailed size specifications and condition grades prior to inquiry.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-zinc-900 text-sm">3. Garment Sanitization & Care Standards</h4>
                <p className="text-xs text-zinc-600">
                  All verified Davao sellers commit to laundering and sanitizing pre-owned textile products prior to fulfillment.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>Last updated: September 2026</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-zinc-950 text-white font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
