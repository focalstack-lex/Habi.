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
      <div className="bg-zinc-950 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800 space-y-4 font-mono">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-white" />
          <span className="uppercase tracking-widest text-[10px] font-bold">Scheduled Releases</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase">
          Davao Collection Drops
        </h1>

        <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
          Thrift sellers and streetwear brands in Davao release limited batch collections at scheduled times. Preview catalogs, set launch reminders, and prepare for instant inquiries.
        </p>
      </div>

      {/* Drops List */}
      <div className="space-y-6">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-zinc-400">
          Upcoming Scheduled Drops ({drops.length})
        </h2>

        {drops.length > 0 ? (
          drops.map((drop) => (
            <DropCard key={drop.id} drop={drop} onExploreDrop={onExploreDrop} />
          ))
        ) : (
          <div className="p-12 bg-zinc-50 border border-zinc-200 rounded-3xl text-center space-y-3 font-mono">
            <Sparkles className="w-8 h-8 text-zinc-400 mx-auto" />
            <div className="text-base font-bold text-zinc-900">No Drops Scheduled</div>
            <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
              Check back soon for new Davao thrift vault collection releases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
