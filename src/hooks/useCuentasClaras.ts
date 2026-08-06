"use client";

import { useState, useEffect } from 'react';

export type TipoDeuda = 'me_debe' | 'le_debo';

export interface Deuda {
  id: string;
  persona: string;
  monto: number;
  tipo: TipoDeuda;
  descripcion: string;
  fecha: string;
}

export function useCuentasClaras() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('finanzas_cuentas_claras');
      if (stored) {
        try {
          setDeudas(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing finanzas_cuentas_claras:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('finanzas_cuentas_claras', JSON.stringify(deudas));
    }
  }, [deudas, isMounted]);

  const agregarDeuda = (nuevaDeuda: Omit<Deuda, 'id' | 'fecha'>) => {
    const deuda: Deuda = {
      ...nuevaDeuda,
      id: Date.now().toString(),
      fecha: new Date().toISOString()
    };
    setDeudas(prev => [...prev, deuda]);
  };

  const saldarDeuda = (id: string) => {
    setDeudas(prev => prev.filter(d => d.id !== id));
  };

  const calcularBalanceNeto = () => {
    let balance = 0;
    deudas.forEach(d => {
      if (d.tipo === 'me_debe') {
        balance += d.monto;
      } else {
        balance -= d.monto;
      }
    });
    return balance;
  };

  return {
    deudas,
    isMounted,
    agregarDeuda,
    saldarDeuda,
    balanceNeto: calcularBalanceNeto()
  };
}
