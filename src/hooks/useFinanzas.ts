"use client";

import { useState, useEffect } from 'react';

export interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  categoria: string;
  fecha: string;
  descripcion: string;
}

export function useFinanzas() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('academia_finanzas_movimientos');
      if (stored) {
        try {
          setTransacciones(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing academia_finanzas_movimientos:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('academia_finanzas_movimientos', JSON.stringify(transacciones));
    }
  }, [transacciones, isMounted]);

  const agregarTransaccion = (nuevaTransaccion: Transaccion) => {
    setTransacciones(prev => [nuevaTransaccion, ...prev]);
  };

  const eliminarTransaccion = (id: string) => {
    setTransacciones(prev => prev.filter(t => t.id !== id));
  };

  // Helper para calcular métricas
  const calcularMetricas = () => {
    let balanceTotal = 0;
    let gastosDelMes = 0;

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();

    transacciones.forEach(t => {
      const monto = Number(t.monto);
      if (t.tipo === 'ingreso') {
        balanceTotal += monto;
      } else {
        balanceTotal -= monto;
      }

      const fechaT = new Date(t.fecha);
      if (t.tipo === 'gasto' && fechaT.getMonth() === mesActual && fechaT.getFullYear() === añoActual) {
        gastosDelMes += monto;
      }
    });

    return { balanceTotal, gastosDelMes };
  };

  return {
    transacciones,
    isMounted,
    agregarTransaccion,
    eliminarTransaccion,
    ...calcularMetricas()
  };
}
