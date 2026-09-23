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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in font-sans">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-none border border-zinc-900 shadow-2xl p-6 sm:p-8 z-10 space-y-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-zinc-900" />
            <h2 className="font-syne text-base font-bold uppercase tracking-tight text-zinc-900">
              Direct Seller Inquiry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 rounded-none hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Mini Card */}
        <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-200 p-3.5 rounded-none">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-none border border-zinc-200 shrink-0"
          />
          <div className="min-w-0 flex-1 font-mono">
            <div className="text-xs text-zinc-500 font-medium">{seller.name}</div>
            <h3 className="font-syne text-sm font-bold text-zinc-900 truncate">{product.name}</h3>
            <div className="text-xs font-bold text-zinc-950 mt-0.5">
              ₱{product.price.toLocaleString()} • Size {product.size}
            </div>
          </div>
        </div>

        {/* Messaging Channel Options */}
        <div className="space-y-2 font-mono">
          <label className="block text-[11px] uppercase tracking-widest text-zinc-500 font-bold">
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
                className={`py-2 px-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider border text-center transition-all ${
                  selectedChannel === channel.id
                    ? 'bg-zinc-900 border-zinc-900 text-white'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
                }`}
              >
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pre-formatted Message Generator Box */}
        <div className="space-y-2 font-mono">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-zinc-500 font-bold">
            <span>Formatted Inquiry Text:</span>
            <button
              onClick={handleCopy}
              className="text-zinc-900 hover:underline inline-flex items-center gap-1 font-bold lowercase"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-zinc-900" />
                  <span>copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>copy text</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-800 font-mono leading-relaxed select-all">
            {defaultMessage}
          </div>
        </div>

        {/* Seller Direct Guarantee Notice */}
        <div className="flex items-start gap-2.5 text-xs text-zinc-500 bg-zinc-100 p-3 rounded-none border border-zinc-200 font-mono">
          <ShieldCheck className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight">
            Contacting seller directly via Instagram/Facebook. You can arrange local Davao cash on pickup or GCash payment with the seller.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-none text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-zinc-200"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Text Copied' : 'Copy Message'}</span>
          </button>

          <a
            href={getChannelLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <span>Open {selectedChannel.toUpperCase()}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
