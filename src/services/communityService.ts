import type { FitCheckComment, FitCheckPost } from '../types/fashion';
import { mockOutfitPosts } from '../data/mockOutfitPosts';

/**
 * Community feed state: buyer-created fit checks, likes, comments, and the
 * weekly style challenge. Persisted per browser like the rest of the prototype.
 */

const KEYS = {
  POSTS: 'habi_fitchecks',
  LIKES: 'habi_post_likes',
  COMMENTS: 'habi_post_comments',
};

export interface StyleChallenge {
  tag: string;
  title: string;
  prompt: string;
  /** Monday of the challenge week, ISO date. */
  startsOn: string;
  /** Sunday of the challenge week, ISO date. */
  endsOn: string;
}

const WEEKLY_CHALLENGES: Omit<StyleChallenge, 'startsOn' | 'endsOn'>[] = [
  { tag: 'y2k-week', title: 'Y2K Week', prompt: 'Low-rise, baby tees, metallics, and butterfly clips. Show your 2003 best.' },
  { tag: 'monochrome', title: 'Monochrome', prompt: 'One colour head to toe. Texture does the talking.' },
  { tag: 'denim-on-denim', title: 'Denim on Denim', prompt: 'Double denim, Canadian tuxedo, patchwork. Levi\'s optional.' },
  { tag: 'thrift-flip', title: 'Thrift Flip', prompt: 'A piece you altered, cropped, dyed, or reworked. Show before and after in the caption.' },
  { tag: 'gorpcore', title: 'Gorpcore', prompt: 'Trail shells, cargo pants, sandals with socks. Davao heat approved.' },
  { tag: 'workwear', title: 'Workwear', prompt: 'Chore coats, carpenter pants, duck canvas. Built to last.' },
  { tag: 'all-local', title: 'All Local', prompt: 'Every piece from a Davao seller. Tag each one.' },
];

const listeners = new Set<() => void>();
let version = 0;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function notify(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function isoWeekNumber(date: Date): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export const communityService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getVersion(): number {
    return version;
  },

  // Posts -------------------------------------------------------------------

  getCustomPosts(): FitCheckPost[] {
    return readJson<FitCheckPost[]>(KEYS.POSTS, []);
  },

  /** Buyer-created posts first (newest), then the bundled sample posts. */
  getPosts(): FitCheckPost[] {
    return [...this.getCustomPosts(), ...mockOutfitPosts];
  },

  getPostById(postId: string): FitCheckPost | undefined {
    return this.getPosts().find((post) => post.id === postId);
  },

  addPost(input: Omit<FitCheckPost, 'id' | 'likesCount' | 'datePosted'>): FitCheckPost {
    const post: FitCheckPost = {
      ...input,
      id: makeId('fit'),
      likesCount: 0,
      datePosted: new Date().toISOString().split('T')[0],
    };
    writeJson(KEYS.POSTS, [post, ...this.getCustomPosts()]);
    notify();
    return post;
  },

  removePost(postId: string): void {
    writeJson(KEYS.POSTS, this.getCustomPosts().filter((post) => post.id !== postId));
    notify();
  },

  isCustomPost(postId: string): boolean {
    return this.getCustomPosts().some((post) => post.id === postId);
  },

  // Likes -------------------------------------------------------------------

  hasLiked(postId: string): boolean {
    return readJson<string[]>(KEYS.LIKES, []).includes(postId);
  },

  toggleLike(postId: string): boolean {
    const likes = readJson<string[]>(KEYS.LIKES, []);
    const liked = likes.includes(postId);
    writeJson(KEYS.LIKES, liked ? likes.filter((id) => id !== postId) : [...likes, postId]);
    notify();
    return !liked;
  },

  getLikeCount(post: FitCheckPost): number {
    return post.likesCount + (this.hasLiked(post.id) ? 1 : 0);
  },

  // Comments ----------------------------------------------------------------

  getComments(postId: string): FitCheckComment[] {
    return readJson<Record<string, FitCheckComment[]>>(KEYS.COMMENTS, {})[postId] ?? [];
  },

  getCommentCount(postId: string): number {
    return this.getComments(postId).length;
  },

  addComment(postId: string, authorName: string, text: string): FitCheckComment {
    const clean = text.trim();
    if (!clean) throw new Error('Write something first.');
    const comment: FitCheckComment = {
      id: makeId('comment'),
      postId,
      authorName: authorName.trim() || 'Habi user',
      text: clean.slice(0, 300),
      createdAt: new Date().toISOString(),
    };
    const store = readJson<Record<string, FitCheckComment[]>>(KEYS.COMMENTS, {});
    store[postId] = [...(store[postId] ?? []), comment];
    writeJson(KEYS.COMMENTS, store);
    notify();
    return comment;
  },

  // Weekly style challenge -----------------------------------------------------

  getCurrentChallenge(now = new Date()): StyleChallenge {
    const week = isoWeekNumber(now);
    const base = WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
    const monday = new Date(now);
    const day = monday.getDay() || 7;
    monday.setDate(monday.getDate() - day + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      ...base,
      startsOn: monday.toISOString().split('T')[0],
      endsOn: sunday.toISOString().split('T')[0],
    };
  },

  getAllChallenges(): Omit<StyleChallenge, 'startsOn' | 'endsOn'>[] {
    return WEEKLY_CHALLENGES;
  },

  getChallengePosts(tag: string): FitCheckPost[] {
    return this.getPosts().filter((post) => post.challengeTag === tag);
  },
};
