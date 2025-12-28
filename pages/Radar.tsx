import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '../types';
import { Navigation, Loader2, Camera, Zap } from 'lucide-react';
import { FALLBACK_IMAGE } from '../constants';
import { Button } from '../src/components/ui/Button';
import { fadeIn, scaleIn } from '../src/styles/animations';

declare global {
  interface Window { L: any; }
}

const ClusterMarker: React.FC<{ count: number; color: string; onClick: () => void }> = ({ count, color, onClick }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="relative flex items-center justify-center cursor-pointer group"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
  >
    <div
      className="absolute w-12 h-12 rounded-full blur-xl opacity-40 animate-pulse"
      style={{ backgroundColor: color }}
    ></div>
    <div
      className="relative w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center shadow-2xl backdrop-blur-md"
      style={{ backgroundColor: color }}
    >
      <span className="text-[10px] font-black text-white italic">{count}</span>
    </div>
  </motion.div>
);

const PinMarker: React.FC<{ place: Place; zoom: number; onSelect: (p: Place) => void; }> = ({ place, zoom, onSelect }) => {
  const isHot = place.capacityPercentage >= 90;
  const isWarm = place.capacityPercentage >= 50;

  const color = isHot ? '#ff0055' : isWarm ? '#ccff00' : '#00ddeb';
  const SHOW_PINS = zoom >= 15; // Increased threshold for full pin view

  return (
    <motion.div
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      className="relative flex items-center justify-center group cursor-pointer"
      onClick={(e) => { e.stopPropagation(); onSelect(place); }}
    >
      <div
        className={`absolute rounded-full blur-2xl pointer-events-none transition-all duration-700 mix-blend-screen 
                   ${isHot ? 'animate-pulse opacity-40' : 'opacity-20'} 
                   ${SHOW_PINS ? 'w-20 h-20' : 'w-24 h-24'}`}
        style={{ backgroundColor: color }}
      ></div>

      <div
        className={`absolute w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.8)] border-2 border-white/40 transition-all duration-300 
                   ${SHOW_PINS ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        style={{ backgroundColor: color }}
      />

      <div className={`relative flex flex-col items-center transition-all duration-500 origin-bottom ${!SHOW_PINS ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
        <div
          className="w-12 h-12 rounded-2xl border-[3px] bg-[var(--bg-card)] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10 transition-all group-hover:scale-110 group-active:scale-95"
          style={{ borderColor: color }}
        >
          <img src={place.imageUrl} className="w-full h-full object-cover pointer-events-none" alt="" onError={(e) => e.currentTarget.src = FALLBACK_IMAGE} />
        </div>
        <div className="w-0.5 h-2 bg-white/20 backdrop-blur-sm -mt-0.5"></div>
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
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
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

    // Cleanup previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const GRID_SIZE = 0.005; // ~500m cluster area
    const clusters: Record<string, { lat: number; lng: number; count: number; places: Place[] }> = {};

    if (currentZoom < 14) {
      // Clustering logic
      places.forEach(place => {
        if (!place.lat || !place.lng) return;
        const gridX = Math.floor(place.lat / GRID_SIZE);
        const gridY = Math.floor(place.lng / GRID_SIZE);
        const key = `${gridX},${gridY}`;

        if (!clusters[key]) {
          clusters[key] = { lat: place.lat, lng: place.lng, count: 0, places: [] };
        }
        clusters[key].count++;
        clusters[key].places.push(place);
      });

      Object.values(clusters).forEach(cluster => {
        const container = document.createElement('div');
        const root = ReactDOM.createRoot(container);
        root.render(
          <ClusterMarker
            count={cluster.count}
            color="#ccff00"
            onClick={() => map.flyTo([cluster.lat, cluster.lng], 15)}
          />
        );
        const icon = window.L.divIcon({ html: container, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
        const marker = window.L.marker([cluster.lat, cluster.lng], { icon }).addTo(map);
        markersRef.current.push(marker);
      });
    } else {
      // Normal PinMarkers
      places.forEach(place => {
        if (!place.lat || !place.lng) return;
        const container = document.createElement('div');
        const root = ReactDOM.createRoot(container);
        root.render(<PinMarker place={place} zoom={currentZoom} onSelect={setSelectedPlace} />);
        const icon = window.L.divIcon({ html: container, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
        const marker = window.L.marker([place.lat, place.lng], { icon }).addTo(map);
        markersRef.current.push(marker);
      });
    }
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

      {/* HEATMAP LEGEND - SPRINT 1 */}
      <div className="absolute top-20 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <div className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff0055] animate-pulse shadow-[0_0_8px_#ff0055]" />
            <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">BOMBANDO</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ccff00] shadow-[0_0_8px_#ccff00]" />
            <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">AGITADO</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00ddeb] shadow-[0_0_8px_#00ddeb]" />
            <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">TRANQUILO</span>
          </div>
        </div>
      </div>

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

      {/* COMPACT PREVIEW MODAL - SPRINT 1 */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-28 left-4 right-20 z-[500]"
          >
            <div
              onClick={() => onPlaceSelect(selectedPlace)}
              className="bg-slate-900 border border-white/10 rounded-3xl p-4 flex gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                <img src={selectedPlace.imageUrl} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <h4 className="text-white font-black italic uppercase tracking-tight truncate">{selectedPlace.name}</h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[var(--primary-main)]">
                    <Zap className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-bold">{selectedPlace.capacityPercentage}%</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">• {selectedPlace.type}</span>
                </div>
                <button className="mt-1 w-full py-2 bg-[var(--primary-main)] text-black rounded-xl text-[10px] font-black uppercase tracking-widest">
                  VER DETALHES
                </button>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedPlace(null); }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center"
              >
                <span className="text-white text-xs">✕</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
