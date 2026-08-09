import { ContextEngine } from './engine';
import { ScheduleContextProvider } from './providers/ScheduleContextProvider';
import { TravelContextProvider } from './providers/TravelContextProvider';
import { ReminderContextProvider } from './providers/ReminderContextProvider';
import { WeatherContextProvider } from './providers/WeatherContextProvider';

let engineInstance: ContextEngine | null = null;

export function getContextEngine(): ContextEngine {
  if (!engineInstance) {
    engineInstance = new ContextEngine();
    
    // Register all providers
    engineInstance.registerProvider(new ScheduleContextProvider());
    engineInstance.registerProvider(new TravelContextProvider());
    engineInstance.registerProvider(new ReminderContextProvider());
    engineInstance.registerProvider(new WeatherContextProvider());
  }
  
  return engineInstance;
}
