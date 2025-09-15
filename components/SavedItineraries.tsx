import React, { useState } from 'react';
import { Itinerary } from '../types';
import { TrashIcon } from './Icons';

interface SavedItinerariesProps {
  itineraries: Itinerary[];
  onView: (itinerary: Itinerary) => void;
  onDelete: (itineraryId: string) => void;
  onNewTrip: () => void;
}

const SavedItineraries: React.FC<SavedItinerariesProps> = ({ itineraries, onView, onDelete, onNewTrip }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteClick = (itineraryId: string) => {
    setDeletingId(itineraryId);
    // Wait for the animation to finish before calling the delete function
    setTimeout(() => {
      onDelete(itineraryId);
      setDeletingId(null); 
    }, 300); // Duration should match the animation duration
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <style>{`
        @keyframes fade-out-scale {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
        }
        .animate-fade-out-scale {
          animation: fade-out-scale 0.3s ease-out forwards;
        }
      `}</style>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-[#0B2545] dark:text-gray-100">My Saved Trips</h2>
        <p className="text-[#A9A9A9] dark:text-gray-400 mt-2">
          {itineraries.length > 0
            ? "Select a trip to view or manage your saved adventures."
            : "You haven't saved any trips yet. Create one to get started!"}
        </p>
      </div>

      {itineraries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <div 
              key={itinerary.id} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-[#EAECEE] dark:border-gray-700 p-5 flex flex-col justify-between transition-all duration-300 ${deletingId === itinerary.id ? 'animate-fade-out-scale' : 'hover:shadow-xl hover:-translate-y-1'}`}
            >
              <h3 className="text-xl font-bold text-[#0B2545] dark:text-gray-100 mb-4 line-clamp-3">{itinerary.tripTitle}</h3>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => onView(itinerary)}
                  className="bg-[#13A89E] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 text-sm transform active:scale-95"
                  aria-label={`View itinerary for ${itinerary.tripTitle}`}
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteClick(itinerary.id!)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-300 p-2 rounded-full"
                  aria-label={`Delete itinerary for ${itinerary.tripTitle}`}
                >
                  <div className="w-5 h-5"><TrashIcon /></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-12">
            <button 
              onClick={onNewTrip}
              className="bg-[#0B2545] dark:bg-gray-700 text-white dark:text-gray-200 font-bold py-3 px-6 rounded-lg text-lg hover:bg-opacity-90 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
            >
                Plan a New Trip
            </button>
        </div>
      )}
    </div>
  );
};

export default SavedItineraries;