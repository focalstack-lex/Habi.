import type { Drop } from '../types/fashion';
import { mockProducts } from './mockProducts';

// Set future drop release dates relative to current date
const futureDate1 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString();
const futureDate2 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString();

export const mockDrops: Drop[] = [
  {
    id: 'drop-1',
    sellerId: 'seller-1',
    sellerName: 'VOID ARCHIVE',
    sellerHandle: 'voidarchive',
    sellerLogo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'VOID ARCHIVE: SEPTEMBER CAPSULE DROP',
    releaseTime: futureDate1,
    itemCount: 24,
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    description: 'Exclusive 24-piece monochrome streetwear capsule including heavyweight French terry hoodies, acid wash tees, and tactical outerwear.',
    items: [mockProducts[0], mockProducts[3]],
    remindCount: 482,
    isLive: false,
  },
  {
    id: 'drop-2',
    sellerId: 'seller-2',
    sellerName: 'DAVAO THRIFT CO',
    sellerHandle: 'davaothriftco',
    sellerLogo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'DAVAO THRIFT CO: 90S CARHARTT & DENIM VAULT',
    releaseTime: futureDate2,
    itemCount: 38,
    coverImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    description: '38 curated 1-of-1 vintage Carhartt work jackets, USA made 501 denims, and graphic band tees.',
    items: [mockProducts[1], mockProducts[4]],
    remindCount: 710,
    isLive: false,
  }
];
