import type { FashionEvent } from '../types/fashion';

const HOUR_MS = 60 * 60 * 1000;
const EVENT_DURATION_MS = 4 * HOUR_MS;

/**
 * Local date for a weekend day relative to now. `weekOffset` 0 is the coming
 * weekend (anchored on the upcoming Saturday), 1 is the weekend after.
 * A Saturday whose start hour has already passed rolls to the following week.
 */
function upcomingWeekendDate(weekOffset: number, day: 'saturday' | 'sunday', hour: number): Date {
  const now = new Date();
  let daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  if (daysUntilSaturday === 0 && now.getHours() >= hour) daysUntilSaturday = 7;
  const dayOffset = daysUntilSaturday + (day === 'sunday' ? 1 : 0) + weekOffset * 7;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, 0, 0, 0);
}

function eventWindow(start: Date): { date: string; endDate: string } {
  return {
    date: start.toISOString(),
    endDate: new Date(start.getTime() + EVENT_DURATION_MS).toISOString(),
  };
}

export const mockEvents: FashionEvent[] = [
  {
    id: 'event-1',
    title: 'Roxas Night Market Ukay Weekend',
    type: 'ukay-market',
    location: 'Davao City',
    venue: 'Roxas Night Market',
    address: 'Roxas Avenue, Poblacion District, Davao City',
    ...eventWindow(upcomingWeekendDate(0, 'saturday', 17)),
    description:
      'Over forty ukay-ukay stalls line Roxas Avenue for one night: vintage denim, band tees, and windbreakers from PHP 50 up. Bring cash and a tote, and come early for the bale openings.',
    organizerName: 'Roxas Night Market Vendors Association',
    bannerImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
    lat: 7.0644,
    lng: 125.6119,
  },
  {
    id: 'event-2',
    title: 'Matina Town Square Thrift Fest',
    type: 'pop-up',
    location: 'Davao City',
    venue: 'Matina Town Square',
    address: 'McArthur Highway, Matina, Davao City',
    ...eventWindow(upcomingWeekendDate(0, 'sunday', 14)),
    description:
      'A Sunday pop-up of Davao thrift sellers and streetwear labels at the Matina Town Square courtyard. Curated racks, live screen printing, and a swap corner for pieces that no longer fit.',
    organizerId: 'seller-1',
    organizerName: 'VOID ARCHIVE',
    bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    lat: 7.0542,
    lng: 125.5968,
  },
  {
    id: 'event-3',
    title: 'Tagum Sunday Swap Meet',
    type: 'swap-meet',
    location: 'Tagum',
    venue: 'Tagum City Hall Grounds',
    address: 'Pioneer Avenue, Magugpo Poblacion, Tagum City',
    ...eventWindow(upcomingWeekendDate(1, 'sunday', 9)),
    description:
      'Bring up to ten clean, wearable pieces and trade them one for one with other Tagum thrifters. Sellers from the hub bring bale leftovers priced to clear before noon.',
    organizerId: 'seller-4',
    organizerName: 'TAGUM THRIFT HUB',
    bannerImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    lat: 7.4473,
    lng: 125.8078,
  },
  {
    id: 'event-4',
    title: 'Digos Retro Sportswear Launch',
    type: 'launch',
    location: 'Digos',
    venue: 'Digos City Plaza',
    address: 'Rizal Avenue, Zone 2, Digos City',
    ...eventWindow(upcomingWeekendDate(1, 'saturday', 15)),
    description:
      'Digos Vintage Club unveils its retro sportswear archive in person: 90s Nike and Adidas track jackets, football kits, and windbreakers, all 1-of-1 and reservable on the spot.',
    organizerId: 'seller-5',
    organizerName: 'DIGOS VINTAGE CLUB',
    bannerImage: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1200&q=80',
    lat: 6.7562,
    lng: 125.3572,
  },
];
