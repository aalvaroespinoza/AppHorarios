"use client";

import { useLocalStorageState } from './useLocalStorageState';

export interface TrackerState {
  modulosCompletados: string[];
  notas: string;
  ultimaActualizacion: string;
}

const defaultState: TrackerState = {
  modulosCompletados: [],
  notas: '',
  ultimaActualizacion: new Date().toISOString()
};

export function useTracker(certificacionId: string = 'eJPT') {
  const storageKey = `academia_tracker_${certificacionId}`;
  const [state, setState, isMounted] = useLocalStorageState<TrackerState>(storageKey, defaultState);

  const marcarModulo = (moduloId: string, completado: boolean) => {
    setState(prev => {
      let nuevosModulos = [...prev.modulosCompletados];
      
      if (completado && !nuevosModulos.includes(moduloId)) {
        nuevosModulos.push(moduloId);
      } else if (!completado) {
        nuevosModulos = nuevosModulos.filter(id => id !== moduloId);
      }

      return {
        ...prev,
        modulosCompletados: nuevosModulos,
        ultimaActualizacion: new Date().toISOString()
      };
    });
  };

  const actualizarNotas = (nuevasNotas: string) => {
    setState(prev => ({
      ...prev,
      notas: nuevasNotas,
      ultimaActualizacion: new Date().toISOString()
    }));
  };

  const generarLinkObsidian = (): string => {
    const title = `Reporte-Academia-${certificacionId}`;
    const date = new Date(state.ultimaActualizacion).toLocaleDateString();
    
    let content = `# Reporte de Progreso: ${certificacionId}\n\n`;
    content += `**Fecha de actualización:** ${date}\n\n`;
    content += `## Módulos Completados (${state.modulosCompletados.length})\n`;
    
    if (state.modulosCompletados.length > 0) {
      state.modulosCompletados.forEach(mod => {
        content += `- [x] ${mod}\n`;
      });
    } else {
      content += `*Aún no hay módulos completados.*\n`;
    }
    
    content += `\n## Notas y Reflexiones\n`;
    content += state.notas ? state.notas : `*Sin notas adicionales.*`;

    return `obsidian://new?name=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`;
  };

  return {
    state,
    isMounted,
    marcarModulo,
    actualizarNotas,
    generarLinkObsidian
  };
}
