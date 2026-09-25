import React from 'react';
import { Calendar, Trophy, Users } from 'lucide-react';
import { communityService } from '../../services/communityService';
import { useCommunityVersion } from '../../hooks/useCommunityVersion';
import { Button } from '../common/FormControls';

interface ChallengeBannerProps {
  onJoin: () => void;
}

/** "Sunday, Sep 27" from an ISO date. Parsed as local midnight so the weekday does not shift. */
function formatEndsOn(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export const ChallengeBanner: React.FC<ChallengeBannerProps> = ({ onJoin }) => {
  useCommunityVersion();
  const challenge = communityService.getCurrentChallenge();
  const entries = communityService.getChallengePosts(challenge.tag).length;

  return (
    <section
      aria-label="Weekly style challenge"
      className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 font-sans"
    >
      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-1.5 font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-amber-800">
          <Trophy className="w-3.5 h-3.5" />
          <span>This week's style challenge</span>
        </div>
        <h2 className="font-cooper font-bold text-lg sm:text-2xl text-zinc-950 leading-tight">{challenge.title}</h2>
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{challenge.prompt}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[11px] sm:text-xs text-zinc-500 font-medium">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Ends {formatEndsOn(challenge.endsOn)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {entries} {entries === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      <Button type="button" onClick={onJoin} className="w-full sm:w-auto shrink-0">
        Join challenge
      </Button>
    </section>
  );
};
