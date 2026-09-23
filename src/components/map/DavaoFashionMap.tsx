import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Seller } from '../../types/fashion';
import { MapPin, Store, ShieldCheck, Clock, Navigation } from 'lucide-react';

interface DavaoFashionMapProps {
  sellers: Seller[];
  selectedCity: string;
  onSelectSeller: (sellerId: string) => void;
}

export const DavaoFashionMap: React.FC<DavaoFashionMapProps> = ({
  sellers,
  selectedCity,
  onSelectSeller,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  // Filter sellers by selected city
  const filteredSellers = sellers.filter((seller) => {
    if (selectedCity === 'All Davao Region') return true;
    return seller.location.city.toLowerCase().includes(selectedCity.toLowerCase());
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map centered on Davao Region (Davao City 7.0707, 125.6087)
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [7.0707, 125.6087],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (markersGroup) {
      markersGroup.clearLayers();

      filteredSellers.forEach((seller) => {
        const isPhysical = seller.location.isPhysicalStore;
        
        // Custom SVG DivIcon for Black & White Minimalist Capsule Pins
        const customIcon = L.divIcon({
          className: 'custom-map-pin-container',
          html: `
            <div style="
              background-color: ${isPhysical ? '#09090b' : '#ffffff'};
              color: ${isPhysical ? '#ffffff' : '#09090b'};
              border: 1.5px solid ${isPhysical ? '#27272a' : '#e4e4e7'};
              border-radius: 9999px;
              padding: 6px 14px;
              font-family: 'Outfit', sans-serif;
              font-size: 12px;
              font-weight: 700;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.18), 0 8px 10px -6px rgba(0,0,0,0.1);
              display: flex;
              align-items: center;
              gap: 6px;
              white-space: nowrap;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              <span style="width: 7px; height: 7px; border-radius: 9999px; background-color: ${isPhysical ? '#ffffff' : '#09090b'}; display: inline-block;"></span>
              <span>${seller.name}</span>
            </div>
          `,
          iconSize: [130, 36],
          iconAnchor: [65, 18],
        });

        const marker = L.marker([seller.location.lat, seller.location.lng], { icon: customIcon });

        marker.on('click', () => {
          setSelectedSeller(seller);
          map.setView([seller.location.lat, seller.location.lng], 13, { animate: true });
        });

        markersGroup.addLayer(marker);
      });

      if (filteredSellers.length > 0) {
        const bounds = L.latLngBounds(filteredSellers.map((s) => [s.location.lat, s.location.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [filteredSellers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-6">
      {/* Header Info Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800/80 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-xs text-white">
          <Navigation className="w-3.5 h-3.5 text-white" />
          <span className="font-semibold text-xs">Interactive Davao Map</span>
        </div>

        <h1 className="font-outfit text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          Fashion Near You
        </h1>

        <p className="text-zinc-300 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Explore local thrift shops, clothing boutiques, pop-up markets, and independent fashion creators across Davao City, Tagum, Digos, Panabo, and Mati.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-white" />
            <span className="text-zinc-200">Physical Storefront / Pop-up Market</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
            <span className="text-zinc-300">Online Creator Area</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-3xl border border-zinc-200/80 overflow-hidden shadow-md h-[520px] bg-zinc-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Seller Drawer Overlay */}
        {selectedSeller && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-3xl p-6 shadow-2xl z-[1000] space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Selected Seller
              </span>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-xs text-zinc-500 hover:text-zinc-950 font-semibold px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"
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
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
