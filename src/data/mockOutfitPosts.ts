import type { FitCheckPost } from '../types/fashion';

export const mockOutfitPosts: FitCheckPost[] = [
  {
    id: 'fit-1',
    authorName: 'Kenji Santos',
    authorHandle: 'kenji.dvo',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    caption: 'Matina Town Square sunday stroll. Full monochrome silhouette.',
    location: 'Davao City - Matina',
    likesCount: 342,
    datePosted: '2026-09-22',
    taggedItems: [
      {
        id: 'tag-1',
        xPercentage: 45,
        yPercentage: 30,
        productId: 'prod-1',
        sellerId: 'seller-1',
        sellerName: 'VOID ARCHIVE',
        itemTitle: 'Heavyweight Boxy Monochrome Hoodie',
        price: 1250,
      },
      {
        id: 'tag-2',
        xPercentage: 50,
        yPercentage: 75,
        productId: 'prod-2',
        sellerId: 'seller-2',
        sellerName: 'DAVAO THRIFT CO',
        itemTitle: 'Vintage Levi\'s 501 Straight Denim',
        price: 850,
      }
    ],
  },
  {
    id: 'fit-2',
    authorName: 'Bea Alcantara',
    authorHandle: 'beastyle_dvo',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
    caption: 'Thrift hunting in Bajada. Found this utility vest at Matina Vintage Lab.',
    location: 'Davao City - Bajada',
    likesCount: 289,
    datePosted: '2026-09-21',
    taggedItems: [
      {
        id: 'tag-3',
        xPercentage: 55,
        yPercentage: 35,
        productId: 'prod-3',
        sellerId: 'seller-3',
        sellerName: 'MATINA VINTAGE LAB',
        itemTitle: 'Japanese Utility Vest',
        price: 1450,
      }
    ],
  }
];
