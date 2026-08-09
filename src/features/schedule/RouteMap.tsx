"use client";

import React from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { LOCATIONS } from '@/data/locations';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function RouteMap() {
  if (!MAPBOX_TOKEN) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-zinc-400 text-sm mb-2 font-medium">Falta configurar Mapbox.</p>
        <p className="text-xs text-zinc-500">
          Agregá <code className="text-blue-400 font-mono bg-blue-900/20 px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> a tu .env.local
        </p>
      </div>
    );
  }

  // Center between Cordoba and Despeñaderos
  const cordoba = LOCATIONS.cordobaBusStop!;
  const despenaderos = LOCATIONS.despenaderosBusStop!;

  const centerLat = (cordoba.lat + despenaderos.lat) / 2;
  const centerLng = (cordoba.lng + despenaderos.lng) / 2;

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-zinc-800 relative shadow-inner">
      <Map
        initialViewState={{
          latitude: centerLat,
          longitude: centerLng,
          zoom: 9
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        <Marker latitude={cordoba.lat} longitude={cordoba.lng}>
          <div className="flex flex-col items-center">
            <div className="bg-blue-500 rounded-full p-1.5 shadow-lg">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded mt-1 border border-zinc-700">CBA</span>
          </div>
        </Marker>
        
        <Marker latitude={despenaderos.lat} longitude={despenaderos.lng}>
          <div className="flex flex-col items-center">
            <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-white bg-black/80 px-2 py-0.5 rounded mt-1 border border-zinc-700">DESP</span>
          </div>
        </Marker>
      </Map>
    </div>
  );
}
