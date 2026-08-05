// Barrel del engine
export {
  determineScenario,
  determineScenarioOrThrow,
  dateToSchoolDay,
  isSchoolDay,
  findScenario,
  getScenariosForDay,
  getNextSchoolDay,
} from './scenario-engine';

export {
  getRecommendations,
  classifyIda,
  classifyVuelta,
  getFirstClassStartTime,
  getLastClassEndTime,
  MIN_MARGIN_MINUTES,
} from './recommendation-engine';
export type {
  RecommendationGroup,
  RecommendationResult,
} from './recommendation-engine';
