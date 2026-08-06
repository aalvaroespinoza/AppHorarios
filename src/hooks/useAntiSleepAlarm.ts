"use client";

import { useState, useEffect, useRef } from 'react';

// Fórmula de Haversine para calcular distancia en km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export function useAntiSleepAlarm(targetLat: number, targetLng: number) {
  const [isActive, setIsActive] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startVibrating = () => {
    if (!vibrationIntervalRef.current) {
      if ('vibrate' in navigator) {
        // Vibrar inmediatamente (patrón largo y pausa)
        navigator.vibrate([1000, 500, 1000, 500]);
        // Repetir el patrón
        vibrationIntervalRef.current = setInterval(() => {
          navigator.vibrate([1000, 500, 1000, 500]);
        }, 3500);
      }
    }
  };

  const stopVibrating = () => {
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  };

  const toggleAlarm = () => {
    if (isActive) {
      // Desactivar
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      stopVibrating();
      setIsActive(false);
      setPermissionError(false);
    } else {
      // Activar
      if (!('geolocation' in navigator)) {
        setPermissionError(true);
        return;
      }

      setPermissionError(false); // Reset before requesting
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setPermissionError(false);
          const { latitude, longitude } = position.coords;
          const dist = calculateDistance(latitude, longitude, targetLat, targetLng);
          
          if (dist < 2.5) {
            startVibrating();
          } else {
            stopVibrating();
          }
        },
        (error) => {
          console.error("Error GPS:", error);
          setPermissionError(true);
          setIsActive(false);
          stopVibrating();
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
      watchIdRef.current = id;
      setIsActive(true);
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      stopVibrating();
    };
  }, []);

  return {
    isActive,
    permissionError,
    toggleAlarm
  };
}
