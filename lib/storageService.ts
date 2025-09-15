import { Itinerary, UserPreferences } from '../types';

const SAVED_ITINERARIES_KEY = 'itineraryArchitect_savedItineraries';
const SEARCH_HISTORY_KEY = 'itineraryArchitect_searchHistory';
const MAX_HISTORY_ITEMS = 5;

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

/**
 * Retrieves the search history from localStorage.
 * It also migrates old history items to include an ID and pinned status.
 */
export const getSearchHistory = (): UserPreferences[] => {
  try {
    const savedData = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!savedData) return [];
    
    let history: UserPreferences[] = JSON.parse(savedData);
    let needsUpdate = false;
    
    // Migration: ensure all items have an ID, a pinned status, and a tone.
    history = history.map(item => {
      let updated = false;
      const newItem = { ...item };

      if (!newItem.id) {
        updated = true;
        newItem.id = `pref-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
      }
      if (typeof newItem.pinned === 'undefined') {
        updated = true;
        newItem.pinned = false;
      }
      if (typeof newItem.tone === 'undefined') {
          updated = true;
          newItem.tone = 'Friendly';
      }

      if(updated) needsUpdate = true;
      return newItem;
    });
    
    // Save back the migrated data only if changes were made
    if (needsUpdate) {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    }

    return history;
  } catch (error) {
    console.error("Failed to parse search history:", error);
    return [];
  }
};

/**
 * Saves a set of search preferences to the history in localStorage.
 * Moves existing searches to the top and manages the history size, protecting pinned items.
 */
export const saveSearchPreferences = (preferences: UserPreferences): UserPreferences[] => {
  let history = getSearchHistory();

  const createComparable = (prefs: UserPreferences) => {
    const { id, pinned, interests, ...rest } = prefs;
    return JSON.stringify({ ...rest, interests: [...interests].sort() });
  };
  
  const newPrefComparable = createComparable(preferences);
  const existingIndex = history.findIndex(item => createComparable(item) === newPrefComparable);
  let itemToSave: UserPreferences;

  if (existingIndex > -1) {
    itemToSave = history[existingIndex];
    history.splice(existingIndex, 1);
  } else {
    itemToSave = { 
      ...preferences, 
      id: `pref-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`,
      pinned: false 
    };
  }
  
  history.unshift(itemToSave);

  // Trim history if it exceeds the max size, keeping pinned items.
  if (history.length > MAX_HISTORY_ITEMS) {
    const pinned = history.filter(i => i.pinned);
    const unpinned = history.filter(i => !i.pinned);
    
    const maxUnpinned = MAX_HISTORY_ITEMS - pinned.length;
    const trimmedUnpinned = unpinned.slice(0, Math.max(0, maxUnpinned));
    
    history = [...pinned, ...trimmedUnpinned];
  }

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  return history;
};

/**
 * Toggles the pinned state of a search preference.
 */
export const togglePinSearchPreference = (preferenceId: string): UserPreferences[] => {
  const history = getSearchHistory();
  const itemIndex = history.findIndex(item => item.id === preferenceId);

  if (itemIndex > -1) {
    history[itemIndex].pinned = !history[itemIndex].pinned;
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  }
  
  return history;
};

/**
 * Clears all items from the search history.
 */
export const clearSearchHistory = (): UserPreferences[] => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  return [];
};