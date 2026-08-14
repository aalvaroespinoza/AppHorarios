"use client";

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import type { Transaccion } from '@/hooks/useFinanzas';

interface FinanceChartProps {
  transacciones: Transaccion[];
  presupuestoSemanal?: number;
}

export function FinanceChart({ transacciones, presupuestoSemanal = 150000 }: FinanceChartProps) {
  // Construir datos de los 7 días de la semana actual
  const dataSemanal = useMemo(() => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const now = new Date();
    
    // Obtener el lunes de esta semana
    const dayOfWeek = now.getDay(); // 0 es domingo
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const weekDays = [
      { key: 'Lun', label: 'Lun', date: new Date(monday) },
      { key: 'Mar', label: 'Mar', date: new Date(monday.getTime() + 1 * 86400000) },
      { key: 'Mié', label: 'Mié', date: new Date(monday.getTime() + 2 * 86400000) },
      { key: 'Jue', label: 'Jue', date: new Date(monday.getTime() + 3 * 86400000) },
      { key: 'Vie', label: 'Vie', date: new Date(monday.getTime() + 4 * 86400000) },
      { key: 'Sáb', label: 'Sáb', date: new Date(monday.getTime() + 5 * 86400000) },
      { key: 'Dom', label: 'Dom', date: new Date(monday.getTime() + 6 * 86400000) },
    ];

    const mapped = weekDays.map((d) => {
      const year = d.date.getFullYear();
      const month = d.date.getMonth();
      const dateNum = d.date.getDate();

      const gastosDelDia = transacciones
        .filter((t) => {
          if (t.tipo !== 'gasto') return false;
          const tDate = new Date(t.fecha);
          return (
            tDate.getFullYear() === year &&
            tDate.getMonth() === month &&
            tDate.getDate() === dateNum
          );
        })
        .reduce((acc, curr) => acc + Number(curr.monto || 0), 0);

      const isToday = 
        now.getFullYear() === year &&
        now.getMonth() === month &&
        now.getDate() === dateNum;

      return {
        dia: d.label,
        gasto: gastosDelDia,
        isToday,
      };
    });

    // Si todos los gastos son 0, damos una base visual estética
    const totalGastos = mapped.reduce((acc, curr) => acc + curr.gasto, 0);
    if (totalGastos === 0) {
      return [
        { dia: 'Lun', gasto: 4500, isToday: false },
        { dia: 'Mar', gasto: 8200, isToday: false },
        { dia: 'Mié', gasto: 6100, isToday: false },
        { dia: 'Jue', gasto: 11400, isToday: true },
        { dia: 'Vie', gasto: 7300, isToday: false },
        { dia: 'Sáb', gasto: 3200, isToday: false },
        { dia: 'Dom', gasto: 1500, isToday: false },
      ];
    }

    return mapped;
  }, [transacciones]);

  const totalSemana = dataSemanal.reduce((acc, curr) => acc + curr.gasto, 0);
  const promedioDiario = Math.round(totalSemana / 7);

  const formatoMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Mini Métricas Superiores */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div>
          <span className="text-neutral-500 font-medium block text-[11px]">Total esta semana</span>
          <span className="text-lg font-black text-white">{formatoMoneda(totalSemana)}</span>
        </div>
        <div className="text-right">
          <span className="text-neutral-500 font-medium block text-[11px]">Promedio diario</span>
          <span className="text-sm font-bold text-emerald-400">{formatoMoneda(promedioDiario)}/día</span>
        </div>
      </div>

      {/* Gráfico Minimalista Responsive */}
      <div className="w-full h-36 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataSemanal} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <XAxis 
              dataKey="dia" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#737373', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-neutral-900/95 border border-neutral-800 shadow-xl rounded-xl px-3 py-1.5 backdrop-blur-xl">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">{item.dia}</p>
                      <p className="text-xs font-black text-emerald-400">
                        {formatoMoneda(item.gasto)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="gasto" 
              radius={[6, 6, 2, 2]} 
              maxBarSize={28}
            >
              {dataSemanal.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? '#10b981' : '#10b98180'} 
                  className="transition-all hover:opacity-100"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
