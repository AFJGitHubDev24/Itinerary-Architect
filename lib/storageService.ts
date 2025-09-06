import { Itinerary } from '../types';

const SAVED_ITINERARIES_KEY = 'itineraryArchitect_savedItineraries';

/**
 * Retrieves all saved itineraries from localStorage.
 */
export const getSavedItineraries = (): Itinerary[] => {
  try {
    const savedData = localStorage.getItem(SAVED_ITINERARIES_KEY);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error("Failed to parse saved itineraries:", error);
    return [];
  }
};

/**
 * Saves an itinerary to localStorage.
 * If the itinerary doesn't have an ID, it assigns one.
 */
export const saveItinerary = (itinerary: Itinerary): Itinerary[] => {
  const savedItineraries = getSavedItineraries();
  
  if (!itinerary.id) {
    itinerary.id = `trip-${Date.now().toString()}`;
  }

  // Avoid duplicates - if an itinerary with the same ID exists, replace it
  const existingIndex = savedItineraries.findIndex(i => i.id === itinerary.id);
  if (existingIndex > -1) {
      savedItineraries[existingIndex] = itinerary;
  } else {
      savedItineraries.unshift(itinerary); // Add new itinerary to the top of the list
  }
  
  localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(savedItineraries));
  return savedItineraries;
};

/**
 * Deletes an itinerary from localStorage by its ID.
 */
export const deleteItinerary = (itineraryId: string): Itinerary[] => {
  let savedItineraries = getSavedItineraries();
  savedItineraries = savedItineraries.filter(i => i.id !== itineraryId);
  localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(savedItineraries));
  return savedItineraries;
};