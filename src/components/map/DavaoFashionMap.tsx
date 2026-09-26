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
                background-color: #1A2225;
                color: #FFF9E9;
                border: 1px solid ${isSelected ? '#FFF9E9' : '#E6DCC0'};
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
                background-color: #1A2225;
                border: 2px solid ${isPhysical ? '#FFF9E9' : '#E6DCC0'};
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
                  background-color: ${isPhysical ? '#FFF9E9' : '#55615D'};
                  border: 1.5px solid #1A2225;
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
      <div className="relative overflow-hidden bg-[#1A2225] text-[#FFF9E9] p-6 sm:p-8 md:p-10 rounded-3xl border border-[#1A2225]/20 shadow-xl space-y-3">
        <div className="font-avantgarde text-[11px] tracking-widest uppercase text-[#E0DFC8] font-semibold flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[#FFF9E9]" />
          <span>MINDANAO REGION EXCLUSIVE MAP</span>
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Fashion Near You
        </h1>

        <p className="text-[#E0DFC8] text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Locate thrift vaults, boutiques, and fashion creators across Mindanao.
        </p>
      </div>

      {/* Map Container with Mindanao Focus & Vignette Mask */}
      <div className="relative rounded-3xl border border-[#E6DCC0] overflow-hidden shadow-lg h-[540px] bg-[#1A2225] z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* High-Fashion Vignette Shadow Frame Overlay */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(26,34,37,0.4)] rounded-3xl z-10" />

        {/* Floating Quick City Jump Controls */}
        <div className="absolute top-4 left-4 sm:left-6 z-20 flex flex-wrap items-center gap-2 bg-[#1A2225]/90 backdrop-blur-md p-1.5 rounded-full border border-[#FFF9E9]/20 shadow-xl">
          {['All Davao Region', 'Davao City', 'Tagum', 'Digos'].map((city) => {
            const isActive = activeCityFilter === city;
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-3.5 py-1.5 text-[11px] font-avantgarde font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FFF9E9] text-[#1A2225] shadow-sm'
                    : 'text-[#E0DFC8] hover:text-[#FFF9E9] hover:bg-[#FFF9E9]/10'
                }`}
              >
                {city === 'All Davao Region' ? 'Mindanao / Davao' : city}
              </button>
            );
          })}
        </div>

        {/* Selected Seller Drawer Overlay */}
        {selectedSeller && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 bg-[#FBF4E4]/95 backdrop-blur-xl border border-[#E6DCC0] rounded-3xl p-6 shadow-2xl z-[1000] space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-[#E6DCC0] pb-3">
              <span className="font-avantgarde text-[11px] font-bold uppercase tracking-widest text-[#55615D]">
                SELECTED SELLER
              </span>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-xs text-[#55615D] hover:text-[#1A2225] font-semibold px-2.5 py-1 bg-[#F3ECD8] hover:bg-[#F3ECD8]/80 rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src={selectedSeller.logoUrl}
                alt={selectedSeller.name}
                className="w-12 h-12 rounded-full object-cover border border-[#E6DCC0] shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-outfit font-bold text-base text-[#1A2225] truncate">{selectedSeller.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-[#1A2225] shrink-0" />
                </div>
                <div className="text-xs text-[#55615D] truncate font-sans">
                  @{selectedSeller.handle} • {selectedSeller.location.district}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-[#55615D] font-sans">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#55615D] shrink-0 mt-0.5" />
                <span>
                  {selectedSeller.location.address || `${selectedSeller.location.district}, ${selectedSeller.location.city}`}
                </span>
              </div>
              {selectedSeller.location.openingHours && (
                <div className="flex items-center gap-2 text-[#55615D]">
                  <Clock className="w-4 h-4 text-[#55615D] shrink-0" />
                  <span>{selectedSeller.location.openingHours}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectSeller(selectedSeller.id)}
              className="w-full py-3 bg-[#1A2225] hover:bg-[#1A2225]/90 text-[#FFF9E9] rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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
