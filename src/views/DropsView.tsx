import React from 'react';
import { DropCard } from '../components/drops/DropCard';
import type { Drop } from '../types/fashion';
import { Sparkles } from 'lucide-react';

interface DropsViewProps {
  drops: Drop[];
  onExploreDrop?: (dropId: string) => void;
}

export const DropsView: React.FC<DropsViewProps> = ({ drops, onExploreDrop }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1A2225] text-[#FFF9E9] p-8 sm:p-12 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-[#E0DFC8] font-semibold">
          SCHEDULED RELEASES
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FFF9E9]">
          Davao Collection Drops
        </h1>

        <p className="text-[#E0DFC8] text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
          Thrift sellers and streetwear brands in Davao release limited batch collections at scheduled times. Preview catalogs, set launch reminders, and prepare for instant inquiries.
        </p>
      </div>

      {/* Drops List */}
      <div className="space-y-6">
        <h2 className="text-xs font-semibold text-[#55615D] uppercase tracking-wide">
          Upcoming Scheduled Drops ({drops.length})
        </h2>

        {drops.length > 0 ? (
          drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} onExploreDrop={onExploreDrop} />
          ))
        ) : (
          <div className="p-12 bg-[#FFF9E9] border border-[#E6DCC0] rounded-3xl text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#1A2225] mx-auto" />
            <div className="font-outfit text-base font-bold text-[#1A2225]">No Drops Scheduled</div>
            <p className="text-xs text-[#55615D] max-w-sm mx-auto">
              Check back soon for new Davao thrift vault collection releases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
