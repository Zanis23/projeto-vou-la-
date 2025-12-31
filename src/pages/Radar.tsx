import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '@/types';
import { Navigation, Loader2, Camera, Zap, Compass } from 'lucide-react';
import { FALLBACK_IMAGE } from '../constants';
import { fadeIn, scaleIn } from '@/styles/animations';
import { Header } from '@/components/ui/Header';

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
  const SHOW_PINS = zoom >= 15;

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

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const GRID_SIZE = 0.005;
    const clusters: Record<string, { lat: number; lng: number; count: number; places: Place[] }> = {};

    if (currentZoom < 14) {
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
      className="full-screen bg-bg-default"
    >
      <Header
        left={
          <div className="w-10 h-10 rounded-xl bg-primary-main/10 flex items-center justify-center border border-primary-main/20">
            <Compass className="w-5 h-5 text-primary-main animate-spin-slow" />
          </div>
        }
        title="RADAR"
        subtitle="Explorar Dourados/MS"
        right={<div className="w-10" />}
        border={false}
      />

      <div className="flex-1 relative overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" style={{ backgroundColor: 'var(--bg-default)' }} />

        <div className="absolute top-6 left-6 z-[400] pointer-events-none">
          <div className="glass-card !bg-black/60 !backdrop-blur-2xl rounded-2xl p-4 flex flex-col gap-3 shadow-2xl border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff0055] animate-pulse shadow-[0_0_12px_#ff0055]" />
              <span className="text-[9px] font-black text-white italic uppercase tracking-widest">Bombando</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00] shadow-[0_0_12px_#ccff00]" />
              <span className="text-[9px] font-black text-white italic uppercase tracking-widest">Agitado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00ddeb] shadow-[0_0_12px_#00ddeb]" />
              <span className="text-[9px] font-black text-white italic uppercase tracking-widest">Tranquilo</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 right-6 z-[400] flex flex-col gap-4">
          <motion.div variants={scaleIn}>
            <button
              onClick={handleRecenter}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all active:scale-90
                         ${gpsActive ? 'bg-primary-main text-black border-primary-main/50 shadow-primary-main/20' : 'bg-black/60 text-white border-white/10 backdrop-blur-xl'}`}
            >
              {findingLocation ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
            </button>
          </motion.div>

          <motion.div variants={scaleIn}>
            <button
              className="w-14 h-14 rounded-2xl bg-black/60 text-white flex items-center justify-center shadow-2xl border-2 border-white/10 backdrop-blur-xl active:scale-90 transition-all"
            >
              <Camera className="w-6 h-6" />
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedPlace && (
            <motion.div
              initial={{ y: 120, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 120, opacity: 0, scale: 0.95 }}
              className="absolute bottom-32 left-6 right-24 z-[500]"
            >
              <div
                onClick={() => onPlaceSelect(selectedPlace)}
                className="glass-card !bg-black/80 !backdrop-blur-3xl rounded-[2.5rem] p-5 flex gap-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-white/10 ring-1 ring-white/10 active:scale-[0.98] transition-all cursor-pointer group"
              >
                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 border border-white/10 relative">
                  <img src={selectedPlace.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                    <Zap className="w-3 h-3 text-primary-main fill-current" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="mb-2">
                    <p className="text-[10px] font-black text-primary-main uppercase tracking-widest mb-1">{selectedPlace.type}</p>
                    <h4 className="text-white font-black italic uppercase text-base tracking-tight truncate leading-none">{selectedPlace.name}</h4>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Ocupação: {selectedPlace.capacityPercentage}%</span>
                  </div>

                  <button className="w-full py-3 bg-primary-main text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-main/20 active:scale-95 transition-all">
                    VER DETALHES
                  </button>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedPlace(null); }}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-black/80 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center text-white shadow-2xl active:scale-90"
                >
                  <span className="text-lg font-bold">✕</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
