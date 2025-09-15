import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SavedItineraries from './components/SavedItineraries';
import LoadingAnimation from './components/LoadingAnimation';
import Logo from './components/Logo';
import { Itinerary, UserPreferences, GroundingChunk, AppError } from './types';
import { generateItinerary } from './services/geminiService';
import { getSavedItineraries, saveItinerary, deleteItinerary, getSearchHistory, saveSearchPreferences, togglePinSearchPreference, clearSearchHistory } from './lib/storageService';
import { AlertTriangleIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from './components/Icons';

type View = 'form' | 'itinerary' | 'saved';
type Theme = 'light' | 'dark' | 'system';

interface AppErrorState {
  title: string;
  message: string;
}

const ThemeSwitcher: React.FC<{ theme: Theme; setTheme: (theme: Theme) => void }> = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes: { name: Theme, icon: React.ReactNode }[] = [
    { name: 'light', icon: <SunIcon /> },
    { name: 'dark', icon: <MoonIcon /> },
    { name: 'system', icon: <ComputerDesktopIcon /> },
  ];

  const currentTheme = themes.find(t => t.name === theme);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-700/50 text-[#0B2545] dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-300 transform hover:scale-105 border border-[#EAECEE] dark:border-gray-600"
        aria-label={`Current theme: ${theme}`}
      >
        <div className="w-5 h-5">{currentTheme?.icon}</div>
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-[#EAECEE] dark:border-gray-600 z-30 animate-fade-in-up origin-top-right">
          <ul className="py-1">
            {themes.map(t => (
              <li key={t.name}>
                <button
                  onClick={() => {
                    setTheme(t.name);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left ${theme === t.name ? 'text-[#13A89E] font-semibold' : 'text-[#4A4A4A] dark:text-gray-200'} hover:bg-[#F5F5F7] dark:hover:bg-gray-600`}
                >
                  <div className="w-5 h-5">{t.icon}</div>
                  <span className="capitalize">{t.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


const App: React.FC = () => {
  const [view, setView] = useState<View>('form');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [searchHistory, setSearchHistory] = useState<UserPreferences[]>([]);
  const [citations, setCitations] = useState<GroundingChunk[]>([]);
  const [error, setError] = useState<AppErrorState | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme || 'light'));
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load saved itineraries and search history from storage on initial app load
    setSavedItineraries(getSavedItineraries());
    setSearchHistory(getSearchHistory());
  }, []);
  
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    setEffectiveTheme(isDark ? 'dark' : 'light');
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        if (theme === 'system') {
            const newIsDark = mediaQuery.matches;
            root.classList.remove(newIsDark ? 'light' : 'dark');
            root.classList.add(newIsDark ? 'dark' : 'light');
            setEffectiveTheme(newIsDark ? 'dark' : 'light');
        }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);


  const handleGenerateItinerary = useCallback(async (preferences: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setCurrentItinerary(null);
    setCitations([]);

    // Save search preferences and update state
    const updatedHistory = saveSearchPreferences(preferences);
    setSearchHistory(updatedHistory);

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

  const handleTogglePin = useCallback((preferenceId: string) => {
    if (!preferenceId) return;
    const updatedHistory = togglePinSearchPreference(preferenceId);
    setSearchHistory(updatedHistory);
  }, []);

  const handleClearHistory = useCallback(() => {
    const updatedHistory = clearSearchHistory();
    setSearchHistory(updatedHistory);
  }, []);

  const renderContent = () => {
    if (isLoading) return <LoadingAnimation />;
    if (error && !isLoading) {
      return (
        <div className="max-w-2xl mx-auto my-8 animate-fade-in">
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-200 rounded-lg shadow-lg">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
                <div className="h-6 w-6 text-red-600 dark:text-red-400"><AlertTriangleIcon /></div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{error.title}</h2>
            <p className="mb-6 text-red-700 dark:text-red-300">{error.message}</p>
            <button
              onClick={handleReset}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-500 dark:focus:ring-offset-gray-900"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    const formProps = {
      onGenerate: handleGenerateItinerary,
      searchHistory: searchHistory,
      onTogglePin: handleTogglePin,
      onClearHistory: handleClearHistory,
    };

    switch (view) {
      case 'itinerary':
        if (currentItinerary) {
          const isSaved = !!currentItinerary.id && savedItineraries.some(i => i.id === currentItinerary.id);
          return <ItineraryDisplay 
                    itinerary={currentItinerary} 
                    citations={citations} 
                    onSave={handleSaveCurrentItinerary}
                    isSaved={isSaved}
                    theme={effectiveTheme}
                 />;
        }
        // Fallback to form if no itinerary is active
        return <ItineraryForm {...formProps} />;
      case 'saved':
        return <SavedItineraries 
                  itineraries={savedItineraries}
                  onView={handleViewSavedItinerary}
                  onDelete={handleDeleteSavedItinerary}
                  onNewTrip={handleReset}
               />;
      case 'form':
      default:
        return <ItineraryForm {...formProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-gray-900 text-[#4A4A4A] dark:text-gray-300">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-20 shadow-sm dark:shadow-none border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button className="flex items-center gap-3" onClick={handleReset} aria-label="Go to home screen">
            <Logo />
            <h1 className="text-2xl font-bold text-[#0B2545] dark:text-gray-100">Itinerary Architect</h1>
          </button>
          <div className="flex items-center gap-3">
             <ThemeSwitcher theme={theme} setTheme={setTheme} />
            {savedItineraries.length > 0 && view !== 'saved' && (
              <button
                onClick={handleShowSaved}
                className="bg-white dark:bg-gray-700 text-[#0B2545] dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 border border-[#EAECEE] dark:border-gray-600"
              >
                My Saved Trips
              </button>
            )}
            {(view !== 'form' || isLoading) && (
              <button
                onClick={handleReset}
                className="bg-[#0B2545] dark:bg-gray-700 text-white dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105"
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

      <footer className="text-center p-4 text-[#A9A9A9] dark:text-gray-500 text-sm">
        <p>Powered by Google Gemini. All rights reserved &copy; 2025 Itinerary Architect.</p>
      </footer>
    </div>
  );
};

export default App;