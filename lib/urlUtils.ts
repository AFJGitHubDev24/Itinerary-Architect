import { Itinerary } from '../types';

/**
 * Encodes an itinerary object into a URL-safe Base64 string and returns a full URL.
 * The process is: JSON -> UTF-8 String -> URI-encoded String -> Base64
 * This handles Unicode characters correctly.
 * @param itinerary The itinerary object to encode.
 * @returns A URL string with the itinerary data in the hash.
 */
export const encodeItineraryToUrl = (itinerary: Itinerary): string => {
  try {
    const jsonString = JSON.stringify(itinerary);
    // Escape unicode characters before base64 encoding
    const encodedString = btoa(unescape(encodeURIComponent(jsonString)));
    // Build a clean URL without existing hash/params
    const url = new URL(window.location.origin + window.location.pathname);
    url.hash = `itinerary=${encodedString}`;
    return url.toString();
  } catch (error) {
    console.error("Failed to encode itinerary:", error);
    return window.location.href; // Fallback
  }
};

/**
 * Decodes an itinerary from the URL hash.
 * The process is: Base64 -> URI-encoded String -> UTF-8 string -> JSON
 * @returns The decoded itinerary object or null if not found or invalid.
 */
export const decodeItineraryFromUrl = (): Itinerary | null => {
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#itinerary=')) {
      const base64String = hash.substring('#itinerary='.length);
      // Decode base64 and then URI components to handle Unicode
      const jsonString = decodeURIComponent(escape(atob(base64String)));
      const itinerary = JSON.parse(jsonString) as Itinerary;
      
      // Basic validation
      if (itinerary && itinerary.tripTitle && Array.isArray(itinerary.days)) {
        return itinerary;
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to decode itinerary from URL:", error);
    return null;
  }
};

/**
 * Removes the itinerary data from the URL hash for a cleaner UI after loading.
 */
export const clearItineraryFromUrl = () => {
    if (window.location.hash.startsWith('#itinerary=')) {
        // Use replaceState to clean the URL without adding to browser history
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
};
