import { useContext } from 'react';
import { EscenarioContext } from '@/context/EscenarioContext';

export const useEscenario = () => {
  const context = useContext(EscenarioContext);
  if (context === undefined) {
    throw new Error('useEscenario debe ser usado dentro de un EscenarioProvider');
  }
  return context;
};
