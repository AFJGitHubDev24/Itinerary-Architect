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

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  headerImageUrl?: string;
}

export interface Itinerary {
  id?: string; // Unique ID for saved itineraries
  tripTitle: string;
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