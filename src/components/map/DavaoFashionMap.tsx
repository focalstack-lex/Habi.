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
        
        // Custom SVG DivIcon for Black & White Minimalist Pins
        const customIcon = L.divIcon({
          className: 'custom-map-pin-container',
          html: `
            <div style="
              background-color: ${isPhysical ? '#09090b' : '#ffffff'};
              color: ${isPhysical ? '#ffffff' : '#09090b'};
              border: 2px solid #09090b;
              border-radius: 9999px;
              padding: 4px 10px;
              font-family: monospace;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: ${isPhysical ? '#ffffff' : '#09090b'}; display: inline-block;"></span>
              <span>${seller.name}</span>
            </div>
          `,
          iconSize: [120, 32],
          iconAnchor: [60, 16],
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
      <div className="bg-zinc-950 text-white p-8 sm:p-12 rounded-3xl border border-zinc-800 space-y-4 font-mono">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-xs text-zinc-300">
          <Navigation className="w-3.5 h-3.5 text-white" />
          <span className="uppercase tracking-widest text-[10px] font-bold">Interactive Davao Map</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase">
          Fashion Near You
        </h1>

        <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-sans leading-relaxed">
          Explore local thrift shops, clothing boutiques, pop-up markets, and independent fashion creators across Davao City, Tagum, Digos, Panabo, and Mati.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-zinc-950 border border-white" />
            <span>Physical Storefront / Pop-up Market</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-white border border-zinc-950" />
            <span>Online Creator Area</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-3xl border border-zinc-200 overflow-hidden shadow-sm h-[500px] bg-zinc-100 z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Seller Drawer Overlay */}
        {selectedSeller && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xl z-[1000] space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Selected Seller
              </span>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-xs text-zinc-400 hover:text-zinc-900"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={selectedSeller.logoUrl}
                alt={selectedSeller.name}
                className="w-12 h-12 rounded-full object-cover border border-zinc-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-zinc-950 truncate">{selectedSeller.name}</h3>
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                </div>
                <div className="text-xs text-zinc-500 truncate">
                  @{selectedSeller.handle} • {selectedSeller.location.district}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-zinc-700 font-sans">
              <div className="flex items-start gap-1.5 font-mono text-xs">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>
                  {selectedSeller.location.address || `${selectedSeller.location.district}, ${selectedSeller.location.city}`}
                </span>
              </div>
              {selectedSeller.location.openingHours && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
                  <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{selectedSeller.location.openingHours}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onSelectSeller(selectedSeller.id)}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
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
