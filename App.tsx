import React, { useState, useCallback, useEffect } from 'react';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import LoadingAnimation from './components/LoadingAnimation';
import Logo from './components/Logo';
import { Itinerary, UserPreferences, GroundingChunk, AppError } from './types';
import { generateItinerary } from './services/geminiService';
import { getSavedItineraries, saveItinerary, deleteItinerary } from './lib/storageService';
import { AlertTriangleIcon } from './components/Icons';

type View = 'form' | 'itinerary' | 'saved';

interface AppErrorState {
  title: string;
  message: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('form');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [citations, setCitations] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<AppErrorState | null>(null);

  useEffect(() => {
    // Load saved itineraries from storage on initial app load
    setSavedItineraries(getSavedItineraries());
  }, []);

  const handleGenerateItinerary = useCallback(async (preferences: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setCurrentItinerary(null);
    setCitations([]);

    try {
      const result = await generateItinerary(preferences);
      if (result.itinerary) {
        setCurrentItinerary(result.itinerary);
        setCitations(result.citations || []);
        setView('itinerary');
      } else {
        setError({
          title: 'Generation Failed',
          message: 'Failed to generate a valid itinerary. The AI response was empty or malformed.'
        });
      }
    } catch (e) {
      console.error(e);
      if (e instanceof AppError) {
        setError({ title: e.title, message: e.message });
      } else if (e instanceof Error) {
        setError({ title: 'Oops! Something went wrong.', message: e.message });
      } else {
        setError({ title: 'An Unknown Error Occurred', message: 'Something unexpected happened. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setCurrentItinerary(null);
    setError(null);
    setIsLoading(false);
    setCitations([]);
    setView('form');
  };
  
  const handleShowSaved = () => {
    setView('saved');
    setCurrentItinerary(null);
    setError(null);
  };

  const handleSaveCurrentItinerary = () => {
    if (currentItinerary) {
      const updatedItineraries = saveItinerary(currentItinerary);
      setSavedItineraries(updatedItineraries);
      // Ensure currentItinerary state has the ID after saving
      if(!currentItinerary.id) {
          const savedVersion = updatedItineraries.find(i => i.tripTitle === currentItinerary.tripTitle);
          if (savedVersion) setCurrentItinerary(savedVersion);
      }
    }
  };

  const handleDeleteSavedItinerary = (itineraryId: string) => {
    const updatedItineraries = deleteItinerary(itineraryId);
    setSavedItineraries(updatedItineraries);
  };

  const handleViewSavedItinerary = (itinerary: Itinerary) => {
    setCurrentItinerary(itinerary);
    setCitations([]); // Citations are not saved, so clear them
    setView('itinerary');
  };

  const renderContent = () => {
    if (isLoading) return <LoadingAnimation />;
    if (error && !isLoading) {
      return (
        <div className="max-w-2xl mx-auto my-8 animate-fade-in">
          <div className="text-center p-8 bg-red-50 border border-red-300 text-red-800 rounded-lg shadow-lg">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <div className="h-6 w-6 text-red-600"><AlertTriangleIcon /></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{error.title}</h2>
            <p className="mb-6 text-red-700">{error.message}</p>
            <button
              onClick={handleReset}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    switch (view) {
      case 'itinerary':
        if (currentItinerary) {
          const isSaved = !!currentItinerary.id && savedItineraries.some(i => i.id === currentItinerary.id);
          return <ItineraryDisplay 
                    itinerary={currentItinerary} 
                    citations={citations} 
                    onSave={handleSaveCurrentItinerary}
                    isSaved={isSaved}
                 />;
        }
        // Fallback to form if no itinerary is active
        return <ItineraryForm onGenerate={handleGenerateItinerary} />;
      case 'saved':
        return <SavedItineraries 
                  itineraries={savedItineraries}
                  onView={handleViewSavedItinerary}
                  onDelete={handleDeleteSavedItinerary}
                  onNewTrip={handleReset}
               />;
      case 'form':
      default:
        return <ItineraryForm onGenerate={handleGenerateItinerary} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#4A4A4A]">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button className="flex items-center gap-3" onClick={handleReset} aria-label="Go to home screen">
            <Logo />
            <h1 className="text-2xl font-bold text-[#0B2545]">Itinerary Architect</h1>
          </button>
          <div className="flex items-center gap-3">
            {savedItineraries.length > 0 && view !== 'saved' && (
              <button
                onClick={handleShowSaved}
                className="bg-white text-[#0B2545] font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 border border-[#EAECEE]"
              >
                My Saved Trips
              </button>
            )}
            {(view !== 'form' || isLoading) && (
              <button
                onClick={handleReset}
                className="bg-[#0B2545] text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
              >
                New Trip
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>

      <footer className="text-center p-4 text-[#A9A9A9] text-sm">
        <p>Powered by Google Gemini. All rights reserved &copy; 2025 Itinerary Architect.</p>
      </footer>
    </div>
  );
};

export default App;