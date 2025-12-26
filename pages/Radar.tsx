
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Place } from '../types';
import { Siren, Flame, Snowflake, Navigation, Loader2, Camera } from 'lucide-react';
import { FALLBACK_IMAGE } from '../constants';

import { calculateDistance } from '../utils/geo';

declare global {
  interface Window { L: any; }
}

interface RadarProps {
  places: Place[];
  onPlaceSelect: (place: Place) => void;
}

const PinMarker: React.FC<{ place: Place; zoom: number; onSelect: (p: Place) => void; }> = ({ place, zoom, onSelect }) => {
  const isHot = place.capacityPercentage >= 90;
  const isWarm = place.capacityPercentage >= 50;
  const color = isHot ? '#ef4444' : isWarm ? '#f97316' : '#06b6d4';
  const SHOW_PINS = zoom >= 13;

  return (
    <div className="relative flex items-center justify-center group cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelect(place); }}>
      <div className={`absolute rounded-full blur-xl pointer-events-none transition-all duration-500 mix-blend-screen ${SHOW_PINS ? 'w-24 h-24 opacity-30' : 'w-40 h-40 opacity-50'}`} style={{ backgroundColor: color }}></div>
      <div className={`absolute w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 border-white transition-all duration-300 ${SHOW_PINS ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`} style={{ backgroundColor: color }} />
      <div className={`relative flex flex-col items-center transition-all duration-300 origin-bottom ${!SHOW_PINS ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
        <div className="w-12 h-12 rounded-full border-[3px] bg-slate-900 overflow-hidden shadow-2xl relative z-10 transition-transform group-active:scale-90 group-hover:scale-110" style={{ borderColor: color }}>
          <img src={place.imageUrl} className="w-full h-full object-cover pointer-events-none" alt="" onError={(e) => e.currentTarget.src = FALLBACK_IMAGE} />
        </div>
        <div className="w-1 h-3 bg-slate-800"></div>
      </div>
    </div>
  );
};

export const Radar: React.FC<RadarProps> = ({ places, onPlaceSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [currentZoom, setCurrentZoom] = useState(14);
  const [gpsActive, setGpsActive] = useState(false);
  const [findingLocation, setFindingLocation] = useState(false);
  const userMarkerRef = useRef<any>(null); // Ref for user marker

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Se o mapa já existe, só redimensiona
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const map = window.L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([-22.2238, -54.8064], 14);

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    map.on('zoomend', () => setCurrentZoom(map.getZoom()));
    mapInstanceRef.current = map;

    return () => {
      // Importante: Não remover o mapa no cleanup se quisermos manter o estado ao trocar de aba rapido
      // mas para evitar erros de "map container already initialized", checamos a ref
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    places.forEach(place => {
      if (!place.lat || !place.lng) return;
      const container = document.createElement('div');
      const root = ReactDOM.createRoot(container);
      root.render(<PinMarker place={place} zoom={currentZoom} onSelect={onPlaceSelect} />);
      const icon = window.L.divIcon({ html: container, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
      const marker = window.L.marker([place.lat, place.lng], { icon }).addTo(map);
      markersRef.current.push(marker);
    });
  }, [currentZoom, places, onPlaceSelect]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current || !window.L) return;
    setFindingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.flyTo([latitude, longitude], 16);
        setGpsActive(true);
        setFindingLocation(false);

        // Update User Marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userIcon = window.L.divIcon({
            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
            className: 'bg-transparent',
            iconSize: [20, 20]
          });
          userMarkerRef.current = window.L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
        }
      },
      () => { setFindingLocation(false); alert('GPS indisponível.'); }
    );
  };

  return (
    <div className="h-full w-full relative bg-[#0E1121]">
      <div ref={mapContainerRef} className="w-full h-full z-0" style={{ backgroundColor: '#0E1121' }} />
      <div className="absolute bottom-24 right-4 z-[400] flex flex-col gap-3">
        <button onClick={handleRecenter} className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-2 transition-all active:scale-90 ${gpsActive ? 'bg-blue-500 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
          {findingLocation ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
        </button>
        <button className="w-14 h-14 bg-[var(--primary)] rounded-full text-[var(--on-primary)] shadow-xl border-2 border-white active:scale-90 flex items-center justify-center">
          <Camera className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
