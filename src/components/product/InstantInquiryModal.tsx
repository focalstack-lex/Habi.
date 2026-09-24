import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import type { Product, Seller } from '../../types/fashion';

interface InstantInquiryModalProps {
  product: Product;
  seller: Seller;
  isOpen: boolean;
  onClose: () => void;
}

export const InstantInquiryModal: React.FC<InstantInquiryModalProps> = ({
  product,
  seller,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'instagram' | 'facebook' | 'whatsapp'>('instagram');

  if (!isOpen) return null;

  const defaultMessage = `Hi @${seller.handle}! I found your piece "${product.name}" (₱${product.price.toLocaleString()}, Size: ${product.size}) on Habi Davao. Is this item still available for reservation/pickup in ${product.location}?`;

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getChannelLink = () => {
    switch (selectedChannel) {
      case 'instagram':
        return seller.socialLinks.instagram || `https://instagram.com/${seller.handle}`;
      case 'facebook':
        return seller.socialLinks.facebook || `https://facebook.com/${seller.handle}`;
      case 'whatsapp':
        return seller.socialLinks.whatsapp
          ? `https://wa.me/${seller.socialLinks.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(defaultMessage)}`
          : `https://instagram.com/${seller.handle}`;
      default:
        return `https://instagram.com/${seller.handle}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A2225]/70 backdrop-blur-md animate-fade-in font-sans">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#FBF4E4] rounded-3xl border border-[#E6DCC0] shadow-2xl p-6 sm:p-8 z-10 space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6DCC0]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1A2225]" />
            <h2 className="font-outfit text-lg font-bold text-[#1A2225]">
              Direct Seller Inquiry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#55615D] hover:text-[#1A2225] rounded-full hover:bg-[#F3ECD8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Mini Card */}
        <div className="flex items-center gap-3.5 bg-[#F3ECD8] border border-[#E6DCC0] p-3 rounded-2xl">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl border border-[#E6DCC0] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[#55615D] font-medium truncate">{seller.name}</div>
            <h3 className="font-outfit text-sm font-bold text-[#1A2225] truncate">{product.name}</h3>
            <div className="text-xs font-bold text-[#1A2225] mt-0.5">
              ₱{product.price.toLocaleString()} • Size {product.size}
            </div>
          </div>
        </div>

        {/* Messaging Channel Options */}
        <div className="space-y-2">
          <label className="block text-xs text-[#55615D] font-semibold">
            Select Preferred Channel:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'instagram', label: 'Instagram DM' },
              { id: 'facebook', label: 'FB Messenger' },
              { id: 'whatsapp', label: 'WhatsApp' },
            ].map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id as any)}
                className={`py-2 px-3 rounded-full text-xs font-semibold border text-center transition-all cursor-pointer ${
                  selectedChannel === channel.id
                    ? 'bg-[#1A2225] border-[#1A2225] text-[#FFF9E9] shadow-sm'
                    : 'bg-[#FFF9E9] border-[#E6DCC0] text-[#55615D] hover:bg-[#F3ECD8]'
                }`}
              >
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-formatted Message Generator Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#55615D] font-semibold">
            <span>Formatted Inquiry Text:</span>
            <button
              onClick={handleCopy}
              className="text-[#1A2225] hover:underline inline-flex items-center gap-1 font-bold text-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1A2225]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#1A2225]" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-[#FFF9E9] border border-[#E6DCC0] rounded-2xl text-xs text-[#1A2225] leading-relaxed select-all">
            {defaultMessage}
          </div>
        </div>

        {/* Supported Payment Methods & Regional Shipping Disclosure */}
        <div className="space-y-2 pt-1">
          <span className="block text-[11px] text-[#55615D] font-semibold uppercase tracking-wider">
            Accepted Local Payment Methods & Shipping:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#1A2225]">
            <span className="px-2.5 py-1 rounded-full bg-[#FFF9E9] border border-[#E6DCC0] text-[#1A2225]">
              GCash
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFF9E9] border border-[#E6DCC0] text-[#1A2225]">
              Cash on Pickup
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFF9E9] border border-[#E6DCC0] text-[#1A2225]">
              Bank Transfer
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#F3ECD8] border border-[#E6DCC0] text-[#55615D] font-normal">
              Courier Delivery ₱80-120
            </span>
          </div>
        </div>

        {/* Seller Direct Guarantee Notice */}
        <div className="flex items-start gap-2.5 text-xs text-[#1A2225]/80 bg-[#F3ECD8] p-3 rounded-2xl border border-[#E6DCC0]">
          <ShieldCheck className="w-4 h-4 text-[#1A2225] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight">
            Contacting seller directly via Instagram/Facebook. You can arrange local Davao cash on pickup or GCash payment with the seller.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 bg-[#F3ECD8] hover:bg-[#F3ECD8]/80 text-[#1A2225] rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Text Copied' : 'Copy Message'}</span>
          </button>

          <a
            href={getChannelLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-[#1A2225] hover:bg-[#1A2225]/90 text-[#FFF9E9] rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Open {selectedChannel.toUpperCase()}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
