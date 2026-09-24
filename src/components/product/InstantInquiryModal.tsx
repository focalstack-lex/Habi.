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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A00]/70 backdrop-blur-md animate-fade-in font-sans">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#F8F9EA] rounded-3xl border border-[#E1E6B6] shadow-2xl p-6 sm:p-8 z-10 space-y-5 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E1E6B6]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1A1A00]" />
            <h2 className="font-outfit text-lg font-bold text-[#1A1A00]">
              Direct Seller Inquiry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#565C38] hover:text-[#1A1A00] rounded-full hover:bg-[#EFF2D2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Mini Card */}
        <div className="flex items-center gap-3.5 bg-[#EFF2D2] border border-[#E1E6B6] p-3 rounded-2xl">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-14 h-14 object-cover rounded-xl border border-[#E1E6B6] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[#565C38] font-medium truncate">{seller.name}</div>
            <h3 className="font-outfit text-sm font-bold text-[#1A1A00] truncate">{product.name}</h3>
            <div className="text-xs font-bold text-[#1A1A00] mt-0.5">
              ₱{product.price.toLocaleString()} • Size {product.size}
            </div>
          </div>
        </div>

        {/* Messaging Channel Options */}
        <div className="space-y-2">
          <label className="block text-xs text-[#565C38] font-semibold">
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
                    ? 'bg-[#1A1A00] border-[#1A1A00] text-[#FFFFCC] shadow-sm'
                    : 'bg-[#FFFFCC] border-[#E1E6B6] text-[#565C38] hover:bg-[#EFF2D2]'
                }`}
              >
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-formatted Message Generator Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#565C38] font-semibold">
            <span>Formatted Inquiry Text:</span>
            <button
              onClick={handleCopy}
              className="text-[#1A1A00] hover:underline inline-flex items-center gap-1 font-bold text-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1A1A00]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#1A1A00]" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-[#FFFFCC] border border-[#E1E6B6] rounded-2xl text-xs text-[#1A1A00] leading-relaxed select-all">
            {defaultMessage}
          </div>
        </div>

        {/* Supported Payment Methods & Regional Shipping Disclosure */}
        <div className="space-y-2 pt-1">
          <span className="block text-[11px] text-[#565C38] font-semibold uppercase tracking-wider">
            Accepted Local Payment Methods & Shipping:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#1A1A00]">
            <span className="px-2.5 py-1 rounded-full bg-[#FFFFCC] border border-[#E1E6B6] text-[#1A1A00]">
              GCash
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFFFCC] border border-[#E1E6B6] text-[#1A1A00]">
              Cash on Pickup
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFFFCC] border border-[#E1E6B6] text-[#1A1A00]">
              Bank Transfer
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#EFF2D2] border border-[#E1E6B6] text-[#565C38] font-normal">
              Courier Delivery ₱80-120
            </span>
          </div>
        </div>

        {/* Seller Direct Guarantee Notice */}
        <div className="flex items-start gap-2.5 text-xs text-[#1A1A00]/80 bg-[#EFF2D2] p-3 rounded-2xl border border-[#E1E6B6]">
          <ShieldCheck className="w-4 h-4 text-[#1A1A00] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight">
            Contacting seller directly via Instagram/Facebook. You can arrange local Davao cash on pickup or GCash payment with the seller.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 bg-[#EFF2D2] hover:bg-[#EFF2D2]/80 text-[#1A1A00] rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Text Copied' : 'Copy Message'}</span>
          </button>

          <a
            href={getChannelLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-[#1A1A00] hover:bg-[#1A1A00]/90 text-[#FFFFCC] rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Open {selectedChannel.toUpperCase()}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
