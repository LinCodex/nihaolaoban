
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Business } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin } from 'lucide-react';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN || '';

interface MapViewProps {
  businesses: Business[];
  onPropertyClick: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ businesses, onPropertyClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { t } = useLanguage();
  const [mapError, setMapError] = useState<boolean>(false);

  // Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    if (!MAPBOX_TOKEN) {
      setMapError(true);
      return;
    }

    try {
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-73.97, 40.75], // NYC Default
          zoom: 10,
          pitchWithRotate: false,
          dragRotate: false,
          attributionControl: false
        });

        // Controls
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

        mapRef.current = map;

        // Ensure map resizes correctly once loaded
        map.on('load', () => {
            map.resize();
        });
        
        map.on('error', (e) => {
            // Catch async errors
            if (e.error?.message?.includes('href') || e.error?.message?.includes('Location')) {
                console.warn("Mapbox restricted environment detected, switching to fallback.");
                setMapError(true);
            }
        });

    } catch (err: any) {
        console.error("Mapbox init error:", err);
        setMapError(true);
    }

    return () => {
      if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
      }
    };
  }, []);

  // Handle Businesses & Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapError) return;

    // 1. Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (businesses.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    let validPoints = 0;

    // 2. Add new markers
    businesses.forEach((b) => {
      if (!b.coordinates || b.coordinates.length !== 2) return;
      validPoints++;

      // Create DOM element for marker
      const el = document.createElement('div');
      el.className = 'marker group';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundColor = '#DC2626';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
        </div>
      `;

      // Popup Content
      const popupContent = `
        <div style="width: 240px; font-family: 'Manrope', sans-serif;">
          <div style="height: 120px; width: 100%; background: #f3f4f6; overflow: hidden; border-radius: 12px 12px 0 0;">
            <img src="${b.image}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <div style="padding: 12px; background: white; border-radius: 0 0 12px 12px;">
            <div style="font-size: 10px; font-weight: 800; color: #DC2626; text-transform: uppercase; margin-bottom: 4px;">${b.category}</div>
            <div style="font-weight: 700; font-size: 14px; color: #0F172A; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${b.title}</div>
            <div style="font-size: 12px; color: #64748B; margin-bottom: 12px;">${b.location}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F1F5F9; padding-top: 8px;">
              <span style="font-weight: 800; color: #0F172A;">$${b.price.toLocaleString()}</span>
              <button id="btn-${b.id}" style="background: #0F172A; color: white; border: none; padding: 6px 12px; border-radius: 99px; font-size: 10px; font-weight: 700; cursor: pointer;">
                View
              </button>
            </div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25, 
        closeButton: false,
        maxWidth: '260px',
        className: 'custom-popup-clean'
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(b.coordinates)
        .setPopup(popup)
        .addTo(map);

      // Event Listener for the View button in popup
      popup.on('open', () => {
          setTimeout(() => {
              const btn = document.getElementById(`btn-${b.id}`);
              if (btn) {
                  btn.onclick = (e) => {
                      e.preventDefault(); 
                      onPropertyClick(b.id);
                  };
              }
          }, 50);
      });

      markersRef.current.push(marker);
      bounds.extend(b.coordinates);
    });

    // 3. Fit bounds
    if (validPoints > 0) {
        try {
            map.fitBounds(bounds, {
                padding: { top: 80, bottom: 80, left: 40, right: 40 },
                maxZoom: 14,
                duration: 800
            });
        } catch (e) {
            console.warn("Failed to fit bounds:", e);
        }
    }
  }, [businesses, onPropertyClick, mapError]);

  if (mapError) {
      return (
          <div className="w-full h-[650px] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative bg-gray-50 group">
              {/* Static Fallback Image */}
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop&fm=webp" 
                alt="Map View" 
                className="w-full h-full object-cover opacity-60 grayscale-[20%]" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/10 pointer-events-none" />
              
              {/* Overlay with fallback markers (simplified) */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
                        {businesses.slice(0, 3).map(b => (
                            <div key={b.id} onClick={() => onPropertyClick(b.id)} className="bg-white p-3 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                    <img src={b.image} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate text-brand-black">{b.title}</p>
                                    <p className="text-xs text-gray-500 truncate flex items-center gap-1"><MapPin size={10} /> {b.location}</p>
                                    <p className="text-xs font-bold text-brand-black mt-0.5">${b.price.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                  </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm text-xs font-medium text-gray-500">
                  {MAPBOX_TOKEN ? "Interactive map disabled in this environment." : "Mapbox token missing."}
              </div>
          </div>
      );
  }

  return (
    <div className="w-full h-[650px] rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative group bg-gray-50">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
      
      {/* Legend */}
      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50 flex items-center gap-2">
        <div className="w-3 h-3 bg-brand-accent rounded-full animate-pulse" />
        <span className="text-xs font-bold text-brand-black uppercase tracking-widest">
          {businesses.length} {t('listings.active')} Listings
        </span>
      </div>
    </div>
  );
};
