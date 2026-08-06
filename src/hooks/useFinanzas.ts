"use client";

import { useLocalStorageState } from '@/core/hooks/useLocalStorageState';

export interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'gasto';
  monto: number;
  categoria: string;
  fecha: string;
  descripcion: string;
}

export function useFinanzas() {
  const [transacciones, setTransacciones, isMounted] = useLocalStorageState<Transaccion[]>('academia_finanzas_movimientos', []);

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
