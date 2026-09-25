import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import type { FashionEvent, FashionEventType, Seller } from '../../types/fashion';
import type { LatLng } from '../../utils/geo';
import {
  MapPin,
  Store,
  ShieldCheck,
  Clock,
  Compass,
  LocateFixed,
  Navigation,
  CalendarDays,
  CalendarPlus,
  Download,
  Ticket,
} from 'lucide-react';
import { mockEvents } from '../../data/mockEvents';
import { formatDistance, googleMapsDirectionsUrl, haversineKm } from '../../utils/geo';
import { buildIcs, downloadIcs, googleCalendarUrl, icsFilename, localDayKey } from '../../utils/calendar';

interface DavaoFashionMapProps {
  sellers: Seller[];
  selectedCity: string;
  onSelectSeller: (sellerId: string) => void;
}

// Bounding box strictly covering Mindanao Region (prevents panning into foreign oceans/islands)
const MINDANAO_BOUNDS = L.latLngBounds(
  [5.0, 121.0], // Southwest
  [10.2, 127.2]  // Northeast
);

const ALL_REGION = 'All Davao Region';
const CITY_OPTIONS = [ALL_REGION, 'Davao City', 'Tagum', 'Digos'];

const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  [ALL_REGION]: { lat: 7.12, lng: 125.65, zoom: 10 },
  'Davao City': { lat: 7.0707, lng: 125.6087, zoom: 13 },
  'Tagum': { lat: 7.4473, lng: 125.8078, zoom: 13 },
  'Digos': { lat: 6.7562, lng: 125.3572, zoom: 13 },
};

const EVENT_TYPE_LABEL: Record<FashionEventType, string> = {
  'ukay-market': 'MARKET',
  'pop-up': 'POP-UP',
  'swap-meet': 'SWAP',
  launch: 'LAUNCH',
};

const EVENT_TYPE_NAME: Record<FashionEventType, string> = {
  'ukay-market': 'Ukay market',
  'pop-up': 'Pop-up',
  'swap-meet': 'Swap meet',
  launch: 'Launch',
};

const TOAST_MS = 4000;
const NEAREST_COUNT = 5;
const EVENT_FALLBACK_DURATION_MS = 4 * 60 * 60 * 1000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function matchesCity(cityText: string, activeCityFilter: string): boolean {
  if (activeCityFilter === ALL_REGION) return true;
  return cityText.toLowerCase().includes(activeCityFilter.toLowerCase());
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatEventRange(startIso: string, endIso?: string): string {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return 'Date to be announced';
  const end = endIso ? new Date(endIso) : null;
  if (!end || Number.isNaN(end.getTime())) return `${formatDay(start)} • ${formatTime(start)}`;
  if (localDayKey(start) === localDayKey(end)) {
    return `${formatDay(start)} • ${formatTime(start)} - ${formatTime(end)}`;
  }
  return `${formatDay(start)}, ${formatTime(start)} - ${formatDay(end)}, ${formatTime(end)}`;
}

function buildEventCalendar(event: FashionEvent) {
  const start = new Date(event.date);
  if (Number.isNaN(start.getTime())) return null;
  const endCandidate = event.endDate ? new Date(event.endDate) : null;
  const end =
    endCandidate && !Number.isNaN(endCandidate.getTime())
      ? endCandidate
      : new Date(start.getTime() + EVENT_FALLBACK_DURATION_MS);
  return {
    title: event.title,
    details: event.description,
    location: event.address ? `${event.venue}, ${event.address}` : `${event.venue}, ${event.location}`,
    start,
    end,
  };
}

function sellerPlace(seller: Seller): string {
  return seller.location.district
    ? `${seller.location.district}, ${seller.location.city}`
    : seller.location.city;
}

function flyToCity(map: L.Map, city: string): void {
  const coords = CITY_COORDINATES[city] ?? CITY_COORDINATES[ALL_REGION];
  map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 0.8 });
}

// Seller pin: small name label above a round avatar with a pointer tail.
// The tail tip is the anchor, so the avatar sits just above the real location.
const SELLER_ICON_W = 180;
const LABEL_MIN_ZOOM = 12;
const SELLER_ICON_H = 62;

function buildSellerIcon(
  seller: Seller,
  isSelected: boolean,
  index: number,
  distanceLabel: string | null
): L.DivIcon {
  const isPhysical = seller.location.isPhysicalStore;
  const label = `${escapeHtml(seller.name)}${distanceLabel ? ` &middot; ${escapeHtml(distanceLabel)}` : ''}`;
  const ring = isSelected ? '#09090b' : '#ffffff';
  return L.divIcon({
    className: 'custom-map-pin-container',
    html: `
      <div style="
        width: ${SELLER_ICON_W}px;
        height: ${SELLER_ICON_H}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        cursor: pointer;
        z-index: ${isSelected ? 999 : index + 10};
      ">
        <div class="habi-pin-label" style="
          max-width: ${SELLER_ICON_W}px;
          overflow: hidden;
          text-overflow: ellipsis;
          background-color: ${isSelected ? '#09090b' : 'rgba(24,24,27,0.92)'};
          color: #ffffff;
          border-radius: 9999px;
          padding: 2px 8px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.02em;
          line-height: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          white-space: nowrap;
          margin-bottom: 3px;
        ">${label}</div>

        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background-color: #09090b;
          border: 2px ${isPhysical ? 'solid' : 'dashed'} ${ring};
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          flex-shrink: 0;
        ">
          <img src="${escapeHtml(seller.logoUrl)}" alt="${escapeHtml(seller.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 9999px; display: block;" />
        </div>
        <span style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${ring};
          margin-top: -1px;
        "></span>
      </div>
    `,
    iconSize: [SELLER_ICON_W, SELLER_ICON_H],
    iconAnchor: [SELLER_ICON_W / 2, SELLER_ICON_H],
  });
}

// Event pin: small amber dot with the type and title in one label beside it.
// `shiftRight` moves the pin clear of a seller avatar at the same spot.
const EVENT_ICON_W = 220;
const EVENT_ICON_H = 24;
const EVENT_SHIFT_PX = 30;

function buildEventIcon(event: FashionEvent, isSelected: boolean, shiftRight: boolean): L.DivIcon {
  const dotColor = isSelected ? '#b45309' : '#f59e0b';
  return L.divIcon({
    className: 'custom-map-event-container',
    html: `
      <div style="
        width: ${EVENT_ICON_W}px;
        height: ${EVENT_ICON_H}px;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      ">
        <span style="
          width: 14px;
          height: 14px;
          margin-left: 5px;
          border-radius: 9999px;
          background-color: ${dotColor};
          border: 2px solid #ffffff;
          box-shadow: 0 0 0 1px ${dotColor}, 0 2px 6px rgba(0,0,0,0.3);
          flex-shrink: 0;
        "></span>
        <span class="habi-pin-label" style="
          display: inline-flex;
          align-items: center;
          gap: 5px;
          max-width: ${EVENT_ICON_W - 30}px;
          background-color: #ffffff;
          color: #18181b;
          border: 1px solid ${isSelected ? '#b45309' : '#fcd34d'};
          border-radius: 9999px;
          padding: 2px 8px 2px 6px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 700;
          line-height: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          white-space: nowrap;
          overflow: hidden;
        ">
          <span style="
            color: #b45309;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.06em;
            flex-shrink: 0;
          ">${EVENT_TYPE_LABEL[event.type]}</span>
          <span style="overflow: hidden; text-overflow: ellipsis;">${escapeHtml(event.title)}</span>
        </span>
      </div>
    `,
    iconSize: [EVENT_ICON_W, EVENT_ICON_H],
    // Anchor on the dot centre (12px in), pushed left when shifted so the dot lands to the right
    iconAnchor: [12 - (shiftRight ? EVENT_SHIFT_PX : 0), EVENT_ICON_H / 2 + (shiftRight ? 18 : 0)],
  });
}

// True when a point is within about 150 m of any visible seller pin
function isNearSeller(lat: number, lng: number, sellers: Seller[]): boolean {
  return sellers.some(
    (s) => Math.abs(s.location.lat - lat) < 0.0015 && Math.abs(s.location.lng - lng) < 0.0015
  );
}

// Blue dot with a soft static halo for the visitor's own position
function buildUserIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-map-user-container',
    html: `
      <div style="position: relative; width: 20px; height: 20px;">
        <span style="
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background-color: rgba(59, 130, 246, 0.2);
        "></span>
        <span style="
          position: absolute;
          left: 4px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background-color: #3b82f6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.6);
        "></span>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export const DavaoFashionMap: React.FC<DavaoFashionMapProps> = ({
  sellers,
  selectedCity,
  onSelectSeller,
}) => {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const eventsGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FashionEvent | null>(null);
  const [activeCityFilter, setActiveCityFilter] = useState<string>(selectedCity || ALL_REGION);
  const [showEvents, setShowEvents] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [openedAt] = useState<number>(() => Date.now());

  // Follow the city chosen elsewhere in the app (adjusting state from a prop, during render)
  const [syncedCity, setSyncedCity] = useState<string>(selectedCity);
  if (selectedCity !== syncedCity) {
    setSyncedCity(selectedCity);
    if (selectedCity) setActiveCityFilter(selectedCity);
  }

  // Filter sellers and events by selected city
  const filteredSellers = useMemo(
    () => sellers.filter((seller) => matchesCity(seller.location.city, activeCityFilter)),
    [sellers, activeCityFilter]
  );

  const filteredEvents = useMemo(
    () =>
      mockEvents.filter((event) => {
        const ends = new Date(event.endDate ?? event.date).getTime();
        const isOver = Number.isFinite(ends) && ends < openedAt;
        return !isOver && matchesCity(event.location, activeCityFilter);
      }),
    [activeCityFilter, openedAt]
  );

  const nearestSellers = useMemo(() => {
    if (!userLocation) return [];
    return sellers
      .map((seller) => ({ seller, km: haversineKm(userLocation, seller.location) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, NEAREST_COUNT);
  }, [sellers, userLocation]);

  const distanceTo = (point: LatLng): string | null =>
    userLocation ? formatDistance(haversineKm(userLocation, point)) : null;

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, TOAST_MS);
  };

  // Initialize Leaflet Map locked strictly to Mindanao Region
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const map = L.map(container, {
      center: [7.12, 125.65],
      zoom: 10,
      minZoom: 9,
      maxZoom: 18,
      maxBounds: MINDANAO_BOUNDS,
      maxBoundsViscosity: 1.0,
      // No +/- buttons; pinch, scroll wheel, and double-tap still zoom
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      minZoom: 9,
      maxZoom: 18,
      bounds: MINDANAO_BOUNDS,
    }).addTo(map);

    // Labels only from zoom 12 up; the region view shows avatars and dots alone
    const syncLabelVisibility = () => {
      container.classList.toggle('habi-map-far', map.getZoom() < LABEL_MIN_ZOOM);
    };
    syncLabelVisibility();
    map.on('zoomend', syncLabelVisibility);

    markersGroupRef.current = L.layerGroup().addTo(map);
    eventsGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
      eventsGroupRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Jump the map when the city chosen elsewhere in the app changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCity) return;
    flyToCity(map, selectedCity);
  }, [selectedCity]);

  // Seller pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredSellers.forEach((seller, idx) => {
      const isSelected = selectedSeller?.id === seller.id;
      const distanceLabel = userLocation
        ? formatDistance(haversineKm(userLocation, seller.location))
        : null;
      const marker = L.marker([seller.location.lat, seller.location.lng], {
        icon: buildSellerIcon(seller, isSelected, idx, distanceLabel),
        zIndexOffset: isSelected ? 1000 : idx * 10,
      });

      marker.on('click', () => {
        setSelectedEvent(null);
        setSelectedSeller(seller);
        map.setView([seller.location.lat, seller.location.lng], 14, { animate: true });
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredSellers, selectedSeller, userLocation]);

  // Pop-up market and event markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const eventsGroup = eventsGroupRef.current;
    if (!map || !eventsGroup) return;

    eventsGroup.clearLayers();
    if (!showEvents) return;

    filteredEvents.forEach((event, idx) => {
      const isSelected = selectedEvent?.id === event.id;
      const shiftRight = isNearSeller(event.lat, event.lng, filteredSellers);
      const marker = L.marker([event.lat, event.lng], {
        icon: buildEventIcon(event, isSelected, shiftRight),
        // Below seller pins so an event never covers a seller's avatar
        zIndexOffset: isSelected ? 1000 : -500 + idx * 10,
      });

      marker.on('click', () => {
        setSelectedSeller(null);
        setSelectedEvent(event);
        map.setView([event.lat, event.lng], 14, { animate: true });
      });

      eventsGroup.addLayer(marker);
    });
  }, [filteredEvents, filteredSellers, showEvents, selectedEvent]);

  // Visitor position marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: buildUserIcon(),
      zIndexOffset: 2000,
      interactive: false,
      keyboard: false,
    }).addTo(map);
    userMarkerRef.current = marker;

    return () => {
      marker.remove();
      if (userMarkerRef.current === marker) userMarkerRef.current = null;
    };
  }, [userLocation]);

  const handleCitySelect = (city: string) => {
    setActiveCityFilter(city);
    setSelectedSeller(null);
    setSelectedEvent(null);
    const map = mapInstanceRef.current;
    if (map) flyToCity(map, city);
  };

  const handleToggleEvents = () => {
    if (showEvents) setSelectedEvent(null);
    setShowEvents(!showEvents);
  };

  const handleLocate = () => {
    if (!('geolocation' in navigator)) {
      showToast('Location is not available on this device. Showing all Davao sellers.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        setIsLocating(false);
        setUserLocation(location);
        const map = mapInstanceRef.current;
        if (!map) return;
        if (MINDANAO_BOUNDS.contains([location.lat, location.lng])) {
          map.flyTo([location.lat, location.lng], 13, { duration: 0.8 });
        } else {
          showToast('You are outside the Davao map area. Distances are measured from your location.');
        }
      },
      (error) => {
        setIsLocating(false);
        showToast(
          error.code === error.PERMISSION_DENIED
            ? 'Location access denied. Showing all Davao sellers.'
            : 'Could not find your location. Showing all Davao sellers.'
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleNearestSelect = (seller: Seller) => {
    if (!filteredSellers.some((candidate) => candidate.id === seller.id)) {
      setActiveCityFilter(ALL_REGION);
    }
    setSelectedEvent(null);
    setSelectedSeller(seller);
    mapInstanceRef.current?.setView([seller.location.lat, seller.location.lng], 14, { animate: true });
    mapWrapperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEventIcs = (event: FashionEvent) => {
    const calendar = buildEventCalendar(event);
    if (!calendar) return;
    downloadIcs(icsFilename(event.title), buildIcs({ uid: `${event.id}@habi`, ...calendar }));
  };

  const selectedSellerDistance = selectedSeller ? distanceTo(selectedSeller.location) : null;
  const selectedEventDistance = selectedEvent ? distanceTo(selectedEvent) : null;
  const selectedEventCalendar = selectedEvent ? buildEventCalendar(selectedEvent) : null;

  const drawerClass =
    'absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 max-h-[calc(100%-1.5rem)] overflow-y-auto bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl z-[1000] space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans space-y-4 sm:space-y-6">

      {/* Header Info Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl border border-zinc-800/80 shadow-xl space-y-2 sm:space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-zinc-400 font-semibold flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>MINDANAO REGION EXCLUSIVE MAP</span>
        </div>

        <h1 className="font-outfit text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight">
          Fashion Near You
        </h1>

        <p className="text-zinc-300 text-xs sm:text-sm lg:text-base max-w-2xl font-sans leading-relaxed">
          Explore local thrift shops, clothing boutiques, pop-up markets, and independent fashion creators across Davao City, Tagum, Digos, Panabo, and Mati.
        </p>
      </div>

      {/* Map Container with Mindanao Focus & Vignette Mask */}
      <div
        ref={mapWrapperRef}
        className="relative rounded-2xl sm:rounded-3xl border border-zinc-200/90 overflow-hidden shadow-lg h-[52vh] min-h-[320px] sm:h-[500px] bg-zinc-950 z-0 scroll-mt-20"
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* High-Fashion Vignette Shadow Frame Overlay */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(9,9,11,0.3)] rounded-2xl sm:rounded-3xl z-10" />

        {/* Floating Quick City Jump Controls */}
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-6 sm:right-auto sm:max-w-[calc(100%-5.5rem)] z-20 flex items-center gap-1.5 sm:gap-2 bg-zinc-950/90 backdrop-blur-md p-1 sm:p-1.5 rounded-full overflow-x-auto scrollbar-none border border-white/20 shadow-xl">
          {CITY_OPTIONS.map((city) => {
            const isActive = activeCityFilter === city;
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-1.5 sm:px-3.5 text-[11px] font-avantgarde font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {city === ALL_REGION ? 'Mindanao / Davao' : city}
              </button>
            );
          })}

          <span className="w-px h-4 bg-white/20 shrink-0" aria-hidden="true" />

          <button
            onClick={handleToggleEvents}
            aria-pressed={showEvents}
            className={`px-3 py-1.5 sm:px-3.5 text-[11px] font-avantgarde font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
              showEvents
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${showEvents ? 'bg-amber-500' : 'bg-zinc-500'}`}
              aria-hidden="true"
            />
            <span>Pop-up markets</span>
          </button>
        </div>

        {/* Near Me */}
        <button
          type="button"
          onClick={handleLocate}
          disabled={isLocating}
          aria-label="Near me"
          aria-busy={isLocating}
          title="Near me"
          className="absolute top-14 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 rounded-full bg-white/95 border border-zinc-200/90 shadow-lg flex items-center justify-center text-zinc-900 hover:bg-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
        </button>

        {/* Location toast */}
        {toast && (
          <div
            role="status"
            className="absolute top-14 left-3 right-14 sm:top-16 sm:left-6 sm:right-auto sm:max-w-sm z-20 bg-zinc-950/90 backdrop-blur-md text-white text-[11px] font-medium px-3.5 py-2 rounded-full border border-white/20 shadow-xl"
          >
            {toast}
          </div>
        )}

        {/* Selected Seller Drawer Overlay */}
        {selectedSeller && (
          <div className={drawerClass}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="font-avantgarde text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                SELECTED SELLER
              </span>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-xs text-zinc-500 hover:text-zinc-950 font-semibold px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src={selectedSeller.logoUrl}
                alt={selectedSeller.name}
                className="w-12 h-12 rounded-full object-cover border border-zinc-200 shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-outfit font-bold text-base text-zinc-950 truncate">{selectedSeller.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-zinc-900 shrink-0" />
                </div>
                <div className="text-xs text-zinc-500 truncate font-sans">
                  @{selectedSeller.handle} • {selectedSeller.location.district}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-600 font-sans">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  {selectedSeller.location.address || `${selectedSeller.location.district}, ${selectedSeller.location.city}`}
                </span>
              </div>
              {selectedSeller.location.openingHours && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{selectedSeller.location.openingHours}</span>
                </div>
              )}
              {selectedSellerDistance && (
                <div className="flex items-center gap-2 text-zinc-500">
                  <Navigation className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{selectedSellerDistance} from your location</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onSelectSeller(selectedSeller.id)}
                className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Visit Seller Storefront</span>
              </button>
              <a
                href={googleMapsDirectionsUrl(selectedSeller.location.lat, selectedSeller.location.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4" />
                <span>Directions</span>
              </a>
            </div>
          </div>
        )}

        {/* Selected Event Drawer Overlay */}
        {selectedEvent && (
          <div className={drawerClass}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="font-avantgarde text-[11px] font-bold uppercase tracking-wider text-zinc-500 inline-flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-500" />
                <span>POP-UP EVENT</span>
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-xs text-zinc-500 hover:text-zinc-950 font-semibold px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex items-start gap-3.5">
              <img
                src={selectedEvent.bannerImage}
                alt={selectedEvent.title}
                className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shadow-sm shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
                  {EVENT_TYPE_NAME[selectedEvent.type]}
                </span>
                <h3 className="font-outfit font-bold text-base text-zinc-950 leading-snug">{selectedEvent.title}</h3>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-600 font-sans">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold text-zinc-900">{selectedEvent.venue}</span>
                  {selectedEvent.address ? `, ${selectedEvent.address}` : `, ${selectedEvent.location}`}
                  {selectedEventDistance && (
                    <span className="text-zinc-500"> • {selectedEventDistance} away</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>{formatEventRange(selectedEvent.date, selectedEvent.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <Store className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Organized by {selectedEvent.organizerName}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed">{selectedEvent.description}</p>

            <div className="space-y-2">
              <a
                href={googleMapsDirectionsUrl(selectedEvent.lat, selectedEvent.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Directions</span>
              </a>

              {selectedEventCalendar && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-zinc-500 mr-1">Add to calendar:</span>
                  <a
                    href={googleCalendarUrl(selectedEventCalendar)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Google</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleEventIcs(selectedEvent)}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.ics</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nearest sellers, once the visitor shares a location */}
      {userLocation && nearestSellers.length > 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-avantgarde text-[11px] tracking-wider uppercase font-semibold text-zinc-500">
              Nearest sellers
            </span>
            <span className="text-[11px] text-zinc-500">Straight-line distance from you</span>
          </div>
          <ul className="divide-y divide-zinc-100">
            {nearestSellers.map(({ seller, km }) => (
              <li key={seller.id}>
                <button
                  type="button"
                  onClick={() => handleNearestSelect(seller)}
                  className="w-full flex items-center gap-3 py-2.5 text-left cursor-pointer group"
                >
                  <img
                    src={seller.logoUrl}
                    alt={seller.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-zinc-950 truncate group-hover:underline underline-offset-2">
                      {seller.name}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">{sellerPlace(seller)}</div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-full">
                    {formatDistance(km)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
