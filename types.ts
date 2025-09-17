export interface UserPreferences {
  id?: string;
  destination: string;
  dates: string;
  interests: string[];
  budget: string;
  travelStyle: string;
  tone: string;
  pinned?: boolean;
}

export interface Activity {
  time: string;
  title: string;
  type: 'Food' | 'Sightseeing' | 'Accommodation' | 'Travel' | 'Activity';
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface WeatherInfo {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  description: string;
  icon: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  headerImageUrl?: string;
  weather?: WeatherInfo;
}

export interface Itinerary {
  id?: string; // Unique ID for saved itineraries
  tripTitle: string;
  startDate?: string;
  endDate?: string;
  days: DayPlan[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

/**
 * A custom error class to provide more context, including a user-friendly title.
 */
export class AppError extends Error {
  constructor(public message: string, public title: string = "An Error Occurred") {
    super(message);
    this.name = "AppError";
  }
}