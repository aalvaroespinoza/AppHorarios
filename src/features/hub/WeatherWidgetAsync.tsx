"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CloudSun, AlertCircle } from 'lucide-react';
import { weatherService } from '@/core/services/weather/weather.service';

export async function fetchWeatherData() {
  try {
    const data = await weatherService.getWeather('despenaderos');
    return {
      temp: Math.round(data.current.temperature),
      condition: data.current.condition,
      isError: false,
    };
  } catch (error) {
    console.warn('[WeatherWidgetAsync] Error fetching weather:', error);
    return { temp: null, condition: 'Desconocido', isError: true };
  }
}

export function WeatherWidgetAsync() {
  const [data, setData] = useState<{ temp: number | null; isError: boolean }>({ temp: null, isError: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="w-16 h-7 rounded-full bg-neutral-800/80 animate-pulse" />
    );
  }

  if (data.isError || data.temp === null) {
    return (
      <div className="flex items-center gap-1.5 bg-neutral-900/40 border border-neutral-800/60 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-400">
        <CloudSun size={14} className="text-neutral-500" />
        <span>Clima</span>
      </div>
    );
  }

  return (
    <Link
      href="/resumen"
      className="flex items-center gap-1.5 bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xl px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:border-neutral-700 transition-colors shadow-sm"
      title="Ver reporte meteorológico"
    >
      <CloudSun size={14} className="text-cyan-400" />
      <span>{data.temp}°</span>
    </Link>
  );
}
