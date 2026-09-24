import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Seller } from '../../types/fashion';
import { MapPin, Store, ShieldCheck, Clock, Compass } from 'lucide-react';

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

const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  'All Davao Region': { lat: 7.12, lng: 125.65, zoom: 10 },
  'Davao City': { lat: 7.0707, lng: 125.6087, zoom: 13 },
  'Tagum': { lat: 7.4473, lng: 125.8078, zoom: 13 },
  'Digos': { lat: 6.7562, lng: 125.3572, zoom: 13 },
};

export const DavaoFashionMap: React.FC<DavaoFashionMapProps> = ({
  sellers,
  selectedCity,
  onSelectSeller,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [activeCityFilter, setActiveCityFilter] = useState<string>(selectedCity || 'All Davao Region');

  useEffect(() => {
    if (selectedCity) {
      setActiveCityFilter(selectedCity);
    }
  }, [selectedCity]);

  // Filter sellers by selected city
  const filteredSellers = sellers.filter((seller) => {
    if (activeCityFilter === 'All Davao Region') return true;
    return seller.location.city.toLowerCase().includes(activeCityFilter.toLowerCase());
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map locked strictly to Mindanao Region
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [7.12, 125.65],
        zoom: 10,
        minZoom: 9,
        maxZoom: 18,
        maxBounds: MINDANAO_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 9,
        maxZoom: 18,
        bounds: MINDANAO_BOUNDS,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (markersGroup) {
      markersGroup.clearLayers();

      filteredSellers.forEach((seller, idx) => {
        const isPhysical = seller.location.isPhysicalStore;
        const isSelected = selectedSeller?.id === seller.id;
        
        // Custom SVG DivIcon with Compact Avatar Pin Badge & Floating Label
        const customIcon = L.divIcon({
          className: 'custom-map-pin-container',
          html: `
            <div style="
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              z-index: ${isSelected ? 999 : idx + 10};
            ">
              <!-- Top Label Pill -->
              <div style="
                background-color: ${isSelected ? '#09090b' : '#18181b'};
                color: #ffffff;
                border: 1px solid ${isSelected ? '#ffffff' : '#3f3f46'};
                border-radius: 9999px;
                padding: 4px 10px;
                font-family: 'Avant Garde', 'Outfit', sans-serif;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.05em;
                box-shadow: 0 8px 20px rgba(0,0,0,0.3);
                white-space: nowrap;
                margin-bottom: 4px;
                transition: all 0.2s ease;
              ">
                ${seller.name}
              </div>

              <!-- Bottom Circular Avatar Pin -->
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 9999px;
                background-color: #09090b;
                border: 2px solid ${isPhysical ? '#ffffff' : '#a1a1aa'};
                box-shadow: 0 10px 25px rgba(0,0,0,0.35);
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
              ">
                <img src="${seller.logoUrl}" alt="${seller.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="
                  position: absolute;
                  bottom: 1px;
                  right: 1px;
                  width: 9px;
                  height: 9px;
                  border-radius: 9999px;
                  background-color: ${isPhysical ? '#10b981' : '#71717a'};
                  border: 1.5px solid #09090b;
                "></span>
              </div>
            </div>
          `,
          iconSize: [120, 64],
          iconAnchor: [60, 60],
        });

        const marker = L.marker([seller.location.lat, seller.location.lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : idx * 10,
        });

        marker.on('click', () => {
          setSelectedSeller(seller);
          map.setView([seller.location.lat, seller.location.lng], 14, { animate: true });
        });

        markersGroup.addLayer(marker);
      });

      if (filteredSellers.length > 0) {
        if (activeCityFilter === 'All Davao Region') {
          map.flyTo([7.12, 125.65], 10, { duration: 0.8 });
        } else {
          const coords = CITY_COORDINATES[activeCityFilter];
          if (coords) {
            map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 0.8 });
          }
        }
      }
    }
  }, [filteredSellers, activeCityFilter]);

  const handleCitySelect = (city: string) => {
    setActiveCityFilter(city);
    setSelectedSeller(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
      {/* Header Info Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800/80 shadow-xl space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-zinc-400 font-semibold flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>MINDANAO REGION EXCLUSIVE MAP</span>
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Fashion Near You
        </h1>

        <p className="text-zinc-300 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Explore local thrift shops, clothing boutiques, pop-up markets, and independent fashion creators across Davao City, Tagum, Digos, Panabo, and Mati.
        </p>
      </div>

      {/* Map Container with Mindanao Focus & Vignette Mask */}
      <div className="relative rounded-3xl border border-zinc-200/90 overflow-hidden shadow-lg h-[540px] bg-zinc-950 z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* High-Fashion Vignette Shadow Frame Overlay */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(9,9,11,0.3)] rounded-3xl z-10" />

        {/* Floating Quick City Jump Controls */}
        <div className="absolute top-4 left-4 sm:left-6 z-20 flex flex-wrap items-center gap-2 bg-zinc-950/90 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-xl">
          {['All Davao Region', 'Davao City', 'Tagum', 'Digos'].map((city) => {
            const isActive = activeCityFilter === city;
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3.5 py-1.5 text-[11px] font-avantgarde font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {city === 'All Davao Region' ? 'Mindanao / Davao' : city}
              </button>
            );
          })}
        </div>

        {/* Selected Seller Drawer Overlay */}
        {selectedSeller && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-3xl p-6 shadow-2xl z-[1000] space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="font-avantgarde text-[11px] font-bold uppercase tracking-widest text-zinc-400">
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
            </div>

            <button
              onClick={() => onSelectSeller(selectedSeller.id)}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Visit Seller Storefront</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
