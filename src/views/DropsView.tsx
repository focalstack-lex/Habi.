import React from 'react';
import { DropCard } from '../components/drops/DropCard';
import type { Drop } from '../types/fashion';
import { Sparkles, Calendar } from 'lucide-react';

interface DropsViewProps {
  drops: Drop[];
  onExploreDrop?: (dropId: string) => void;
}

export const DropsView: React.FC<DropsViewProps> = ({ drops, onExploreDrop }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-8 sm:p-12 rounded-3xl border border-zinc-800/80 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs text-zinc-300 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-white" />
          <span>Scheduled Releases</span>
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Davao Collection Drops
        </h1>

        <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
          Thrift sellers and streetwear brands in Davao release limited batch collections at scheduled times. Preview catalogs, set launch reminders, and prepare for instant inquiries.
        </p>
      </div>

      {/* Drops List */}
      <div className="space-y-6">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
          Upcoming Scheduled Drops ({drops.length})
        </h2>

        {drops.length > 0 ? (
          drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} onExploreDrop={onExploreDrop} />
          ))
        ) : (
          <div className="p-12 bg-zinc-50 border border-zinc-200/80 rounded-3xl text-center space-y-3">
            <Sparkles className="w-8 h-8 text-zinc-400 mx-auto" />
            <div className="font-outfit text-base font-bold text-zinc-900">No Drops Scheduled</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Check back soon for new Davao thrift vault collection releases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
