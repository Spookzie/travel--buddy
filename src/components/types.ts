// Core API types matching backend responses
export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
  category?: string;
  subcategory?: string;
  address?: string;
}

export interface AutocompletePlace {
  place_id: string;
  description: string;
  lat: string;
  lon: string;
  type: string;
}

export interface Activity {
  name: string;
  lat: string;
  lon: string;
  time: 'morning' | 'afternoon' | 'evening';
  type?: string;
}

// Weather forecast types
export interface WeatherForecast {
  date: string;
  temp: {
    min: number;
    max: number;
    day: number;
    night: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  humidity: number;
  windSpeed: number;
  precipitation: number;
  unavailable?: boolean; // Indicates if forecast data is not available for this date
}

// Enriched place data for better display
export interface EnrichedPlace {
  name: string;
  lat: string;
  lon: string;
  time: 'morning' | 'afternoon' | 'evening';
  type?: string;
  description?: string;
  rating?: number;
  address?: string;
  category?: string;
  subcategory?: string;
}

export interface ItineraryDay {
  day: number;
  places: EnrichedPlace[];
  weather?: WeatherForecast;
}

export interface Itinerary {
  destination: string;
  days: number;
  budget: string;
  startDate: string;
  itinerary: ItineraryDay[];
  enrichedPlaces?: EnrichedPlace[]; // All places with enriched data
  weatherForecast?: WeatherForecast[]; // Weather for each day
}

// Frontend-specific types for backward compatibility
export interface Destination {
  id: number;
  name: string;
  type: string;
  description: string;
  weather: string | null;
  about: string | null;
  rating: number;
  image: string | null;
  latitude: number;
  longitude: number;
}

// Trip planning types
export interface TripRequest {
  destination: {
    name: string;
    lat: string;
    lon: string;
  };
  places: {
    name: string;
    lat: string;
    lon: string;
    type?: string;
    id?: string;
  }[];
  days: number;
  budget: 'low' | 'moderate' | 'luxury';
  startDate: string; // ISO date string
}

// Component prop types - re-export from LeafletMap
export interface LeafletMapRef {
  panTo: (lat: number, lng: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setView: (lat: number, lng: number, zoom?: number) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}