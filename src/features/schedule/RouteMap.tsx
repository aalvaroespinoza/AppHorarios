"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCATIONS } from '@/data/locations';

const createIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-div-icon bg-transparent border-none',
    html: `
      <div class="flex flex-col items-center" style="transform: translate(-50%, -100%); width: 60px;">
        <div class="${color} rounded-full p-1.5 shadow-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <span class="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded mt-1 border border-zinc-700 whitespace-nowrap">${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export function RouteMap() {
  const cordoba = LOCATIONS.cordobaBusStop!;
  const despenaderos = LOCATIONS.despenaderosBusStop!;

  const centerLat = (cordoba.lat + despenaderos.lat) / 2;
  const centerLng = (cordoba.lng + despenaderos.lng) / 2;

  const cbaIcon = createIcon('bg-blue-500', 'CBA');
  const despIcon = createIcon('bg-emerald-500', 'DESP');

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-zinc-800 relative shadow-inner z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={9.5} 
        style={{ height: '100%', width: '100%', background: '#0a0a0c' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <Marker position={[cordoba.lat, cordoba.lng]} icon={cbaIcon} />
        <Marker position={[despenaderos.lat, despenaderos.lng]} icon={despIcon} />
      </MapContainer>
    </div>
  );
}
