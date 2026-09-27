import React, { useEffect, useId, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import type { FitCheckPost } from '../../types/fashion';
import { communityService } from '../../services/communityService';
import { userPrefsService } from '../../services/userPrefsService';
import { useCommunityVersion } from '../../hooks/useCommunityVersion';
import { inputClass } from '../common/FormControls';

interface CommentsSheetProps {
  post: FitCheckPost;
  isOpen: boolean;
  onClose: () => void;
}

function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase());
  return letters.join('') || '?';
}

/** "Just now", "5m ago", "2h ago", "3d ago", "2w ago", then a short date. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const CommentsSheet: React.FC<CommentsSheetProps> = ({ post, isOpen, onClose }) => {
  if (!isOpen) return null;
  return <SheetBody post={post} onClose={onClose} />;
};

interface SheetBodyProps {
  post: FitCheckPost;
  onClose: () => void;
}

const SheetBody: React.FC<SheetBodyProps> = ({ post, onClose }) => {
  useCommunityVersion();
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(() => userPrefsService.getDisplayName());
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const comments = communityService.getComments(post.id);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Keep the newest comment in view as the list grows.
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [comments.length]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      communityService.addComment(post.id, name, text);
      if (name.trim()) userPrefsService.setDisplayName(name);
      setText('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post that comment.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] font-sans sm:flex sm:items-center sm:justify-center sm:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl sm:relative sm:inset-auto sm:w-full sm:max-w-lg sm:max-h-[80vh] sm:rounded-3xl bg-white border border-zinc-200/80 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-100 shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="font-cooper font-bold text-lg sm:text-xl text-zinc-950 leading-tight">
              Comments
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-500 truncate">
              {comments.length} on @{post.authorHandle}'s fit
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center hover:bg-zinc-200 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment list */}
        <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
          {comments.length === 0 ? (
            <p className="text-center text-xs sm:text-sm text-zinc-500 py-8">No comments yet. Say something nice.</p>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-950 text-[11px] font-bold flex items-center justify-center shrink-0"
                  >
                    {initials(comment.authorName)}
                  </span>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-zinc-950 truncate">{comment.authorName}</span>
                      <span className="text-[11px] text-zinc-500 shrink-0">{relativeTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed break-words">{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSubmit} className="shrink-0 border-t border-zinc-100 bg-white px-3 sm:px-6 pt-3 sheet-safe space-y-2">
          {error && (
            <p role="alert" className="text-[11px] text-red-600 font-medium">
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-32 shrink-0">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
                placeholder="Name"
                aria-label="Your name"
                autoComplete="name"
                className={inputClass}
              />
            </div>
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={300}
              placeholder="Say something nice"
              aria-label="Write a comment"
              className={inputClass}
            />
            <button
              type="submit"
              aria-label="Send comment"
              className="w-11 h-11 rounded-full bg-zinc-950 text-white flex items-center justify-center shrink-0 hover:bg-zinc-800 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
