export interface Coordinates {
  lat: number;
  lng: number;
}

export type RouteType = 'walking' | 'driving-traffic' | 'bus';

export interface RouteSegment {
  from: Coordinates;
  to: Coordinates;
  type: RouteType;
}

export interface RouteResult {
  durationMin: number;
  distanceMeters: number;
}
