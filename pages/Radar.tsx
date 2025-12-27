import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { motion } from 'framer-motion';
import { Place } from '../types';
import { Navigation, Loader2, Camera, Flame } from 'lucide-react';
import { FALLBACK_IMAGE } from '../constants';
import { Button } from '../src/components/ui/Button';
import { fadeIn, scaleIn } from '../src/styles/animations';

declare global {
  interface Window { L: any; }
}

const PinMarker: React.FC<{ place: Place; zoom: number; onSelect: (p: Place) => void; }> = ({ place, zoom, onSelect }) => {
  const isHot = place.capacityPercentage >= 90;
  const isWarm = place.capacityPercentage >= 50;

  // Refined Color Palette
  const color = isHot ? '#ff0055' : isWarm ? '#ccff00' : '#00ddeb';
  const SHOW_PINS = zoom >= 13;

  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="relative flex items-center justify-center group cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onSelect(place); }}
    >
      {/* Halo / Glow Effect */}
      <div
        className={`absolute rounded-full blur-2xl pointer-events-none transition-all duration-700 mix-blend-screen 
                   ${isHot ? 'animate-pulse opacity-40' : 'opacity-20'} 
                   ${SHOW_PINS ? 'w-24 h-24' : 'w-40 h-40'}`}
        style={{ backgroundColor: color }}
      ></div>

      {/* Legacy Dot for low zoom */}
      <div
        className={`absolute w-4 h-4 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8)] border-2 border-white/40 transition-all duration-300 
                   ${SHOW_PINS ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        style={{ backgroundColor: color }}
      />

      {/* Content Pin for high zoom */}
      <div className={`relative flex flex-col items-center transition-all duration-500 origin-bottom ${!SHOW_PINS ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
        <div
          className="w-14 h-14 rounded-2xl border-[3px] bg-[var(--bg-card)] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10 transition-all group-hover:scale-125 group-hover:-translate-y-2 group-active:scale-95"
          style={{ borderColor: color }}
        >
          <img src={place.imageUrl} className="w-full h-full object-cover pointer-events-none" alt="" onError={(e) => e.currentTarget.src = FALLBACK_IMAGE} />
          {isHot && (
            <div className="absolute top-0 right-0 bg-[#ff0055] p-1 rounded-bl-lg">
              <Flame className="w-3 h-3 text-white fill-current" />
            </div>
          )}
        </div>
        <div className="w-1 h-3 bg-white/20 backdrop-blur-sm -mt-0.5"></div>
      </div>
    </motion.div>
  );
};

interface RadarProps {
  places: Place[];
  onPlaceSelect: (place: Place) => void;
}

export const Radar: React.FC<RadarProps> = ({ places, onPlaceSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [currentZoom, setCurrentZoom] = useState(14);
  const [gpsActive, setGpsActive] = useState(false);
  const [findingLocation, setFindingLocation] = useState(false);
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

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

    return () => { };
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
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="h-full w-full relative bg-[var(--bg-default)]"
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" style={{ backgroundColor: 'var(--bg-default)' }} />

      <div className="absolute bottom-24 right-4 z-[400] flex flex-col gap-3">
        <motion.div variants={scaleIn}>
          <Button
            variant={gpsActive ? 'primary' : 'secondary'}
            size="icon"
            onClick={handleRecenter}
            className="rounded-full w-14 h-14 shadow-xl border-2 border-[var(--bg-default)] active:scale-90 transition-transform"
          >
            {findingLocation ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
          </Button>
        </motion.div>

        <motion.div variants={scaleIn}>
          <Button
            variant="primary"
            size="icon"
            className="rounded-full w-14 h-14 shadow-xl border-2 border-[var(--bg-default)] active:scale-90 transition-transform"
          >
            <Camera className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
